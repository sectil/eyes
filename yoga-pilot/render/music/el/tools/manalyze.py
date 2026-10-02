#!/usr/bin/env python3
"""manalyze.py — SPEC §5 checks for music beds, nature loops and tones (numpy/scipy/soundfile/pyloudnorm; no ffmpeg).

decode : MP3 -> 44.1 kHz stereo float WAV (resample_poly if needed; mono duplicated). Nothing else is changed
         (no gain, no trim) — mastering is the mixer's job (SPEC §6).
checks (all printed as JSON; thresholds marked VARSAYIM are this script's assumptions, not SPEC numbers):
  * level     : integrated LUFS (BS.1770, pyloudnorm), true peak (4x oversampling), sample peak, clipped samples, DC.
  * flatness  : 3 s short-term LUFS every 0.5 s. spread = p95 - p5 over the interior (first/last 10 s excluded, those
                are crossfaded under speech); also full-file range, std, largest rise over any 10 s, and
                'crescendo' = any 10 s span whose ST loudness never falls (>-0.1 dB steps) yet rises >= 2 dB (PLAN D.6).
                PASS spread <= 6 LU, KULAK 6-9, FAIL > 9 (VARSAYIM).
  * onsets    : level-independent spectral flux (dB, 10 ms hop) -> onset envelope. pulse_clarity = max normalised
                autocorrelation of the envelope at 0.25-2.0 s lags (30-240 BPM). percussive_share = energy share of
                the HPSS percussive mask (17x17 median filters). strong_onsets_per_min = envelope peaks >= median + 8 MAD,
                >= 150 ms apart. Calibrated against synthetic positives by `calibrate` (pad + soft kick at 70 BPM).
  * clicks    : >10 kHz band, 2 ms frames, >= 12 dB above the +-20 ms median, <= 6 ms long, frame level >= -80 dBFS.
  * loop seam : (loops only) leading/trailing digital near-silence (< -60 dBFS), sample step at the wrap vs p99.9 of
                interior steps, >5 kHz 2 ms-frame excess at the wrap vs 40 interior reference points, level (1 s RMS)
                and log-spectrum (0.5 s) distance end->start vs interior neighbouring blocks.
  * spectrum  : centroid, energy share < 300 Hz, 500 Hz-4 kHz, 1.5-4 kHz.
"""
import json, sys, os
import numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import resample_poly, butter, sosfilt, lfilter, stft
from scipy.ndimage import median_filter, uniform_filter1d, maximum_filter1d

SR = 44100


def db(v, floor=1e-12):
    return float(20 * np.log10(max(float(v), floor)))


def load_any(path):
    x, sr = sf.read(path, dtype='float64', always_2d=True)
    ch = x.shape[1]
    if sr != SR:
        from math import gcd
        g = gcd(sr, SR)
        x = np.stack([resample_poly(x[:, c], SR // g, sr // g) for c in range(ch)], 1)
    if ch == 1:
        x = np.repeat(x, 2, axis=1)
    elif ch > 2:
        x = x[:, :2]
    return x, sr, ch


def kweight(x):
    m = pyln.Meter(SR)
    y = x.copy()
    for f in m._filters.values():
        for c in range(y.shape[1]):
            y[:, c] = lfilter(f.b, f.a, y[:, c])
    return y


def st_loudness(x, win=3.0, hop=0.5):
    y = kweight(x)
    p = (y ** 2).sum(1)
    cs = np.concatenate([[0.0], np.cumsum(p)])
    W, H = int(win * SR), int(hop * SR)
    starts = np.arange(0, max(1, len(p) - W + 1), H)
    ms = (cs[starts + W] - cs[starts]) / W
    L = -0.691 + 10 * np.log10(np.maximum(ms, 1e-20))
    t = (starts + W / 2) / SR
    return t, L


def true_peak(x):
    return max(db(np.abs(resample_poly(x[:, c], 4, 1)).max()) for c in range(x.shape[1]))


def flatness(x, edge=10.0):
    t, L = st_loudness(x)
    gate = L > -70
    inner = gate & (t >= edge) & (t <= t[-1] - edge + 1.5) if t[-1] > 2 * edge + 5 else gate
    Li = L[inner]
    out = {'st_lufs_p5': round(float(np.percentile(Li, 5)), 2), 'st_lufs_p50': round(float(np.percentile(Li, 50)), 2),
           'st_lufs_p95': round(float(np.percentile(Li, 95)), 2),
           'spread_p5_p95_lu': round(float(np.percentile(Li, 95) - np.percentile(Li, 5)), 2),
           'st_std_lu': round(float(Li.std()), 2),
           'range_full_lu': round(float(L[gate].max() - L[gate].min()), 2)}
    step = 20  # 10 s at 0.5 s hop
    rises, cres = [], 0
    for i in range(0, len(L) - step):
        seg = L[i:i + step + 1]
        rises.append(seg[-1] - seg.min())
        d = np.diff(seg)
        if (d > -0.1).all() and seg[-1] - seg[0] >= 2.0:
            cres += 1
    out['max_rise_10s_lu'] = round(float(max(rises)) if rises else 0.0, 2)
    out['crescendo_10s_spans'] = int(cres)
    out['verdict'] = 'PASS' if out['spread_p5_p95_lu'] <= 6 else ('KULAK' if out['spread_p5_p95_lu'] <= 9 else 'FAIL')
    return out, t, L


def spec_db(mono, nfft=2048, hop=441):
    f, tt, Z = stft(mono, SR, nperseg=nfft, noverlap=nfft - hop, boundary=None, padded=False)
    return f, tt, np.abs(Z)


def onsets(x, t0=None, t1=None):
    """Band-wise spectral flux: 64 log-spaced bands 40 Hz-16 kHz, dB, 60 dB floor under the loudest band level,
    10 ms hop; flux = mean over bands of positive dB rise per frame (level independent).
    events: flux peaks >= median(flux) + 0.5 dB (>= 150 ms apart); strong: >= median + 1.5 dB (VARSAYIM).
    pulse_clarity: autocorrelation (0.25-2.0 s lags) of the event train smoothed by a 30 ms window; 0 when < 8 events.
    percussive_share: HPSS (17x17 median) percussive energy share."""
    mono = x.mean(1)
    if t0 is not None:
        mono = mono[int(t0 * SR):int(t1 * SR)]
    f, tt, M = spec_db(mono)
    P = M ** 2
    edges_hz = np.geomspace(40, 16000, 65)
    B = np.stack([P[(f >= edges_hz[i]) & (f < edges_hz[i + 1])].sum(0) + 1e-20 for i in range(64)])
    D = 10 * np.log10(B)
    D = np.maximum(D, np.percentile(D, 99.5) - 60)
    flux = np.maximum(np.diff(D, axis=1), 0).mean(0)
    fps = SR / 441
    dist = int(0.15 * fps) | 1
    peaks = (flux == maximum_filter1d(flux, dist))
    base = float(np.median(flux))                  # codec/noise floor of the flux itself
    ev = peaks & (flux >= base + 0.5)
    strong = peaks & (flux >= base + 1.5)
    dur = len(mono) / SR
    if ev.sum() >= 8:
        train = uniform_filter1d(ev.astype(float), 3)
        e = train - train.mean()
        nf = 1 << (2 * len(e) - 1).bit_length()
        Fe = np.fft.rfft(e, nf)
        ac = np.fft.irfft(Fe * np.conj(Fe), nf)[:len(e)]
        ac = ac / (ac[0] + 1e-12)
        lo, hi = int(0.25 * fps), int(2.0 * fps)
        pulse = float(ac[lo:hi].max())
    else:
        pulse = 0.0
    # HPSS on a coarser grid (20 ms hop, bins < 11 kHz) to keep 5-minute files tractable
    f2, t2, M2 = spec_db(mono, nfft=2048, hop=882)
    P2 = (M2[f2 < 11025]) ** 2
    H = median_filter(P2, size=(1, 17))
    Pp = median_filter(P2, size=(17, 1))
    mask_p = Pp ** 2 / (H ** 2 + Pp ** 2 + 1e-30)
    perc_share = float((mask_p * P2).sum() / (P2.sum() + 1e-30))
    return {'pulse_clarity': round(pulse, 3), 'percussive_share': round(perc_share, 3),
            'events_per_min': round(int(ev.sum()) / dur * 60, 2), 'strong_onsets_per_min': round(int(strong.sum()) / dur * 60, 2),
            'flux_mean_db': round(float(flux.mean()), 4), 'flux_median_db': round(base, 4), 'flux_p99_db': round(float(np.percentile(flux, 99)), 3),
            'flux_max_db': round(float(flux.max()), 3),
            'flux_max_at_s': round(float((int(np.argmax(flux)) + 1) / fps + (t0 or 0)), 2)}, flux, fps


def clicks(x):
    sos = butter(4, 10000, 'hp', fs=SR, output='sos')
    out = []
    for c in range(x.shape[1]):
        h = sosfilt(sos, x[:, c])
        n = int(0.002 * SR)
        m = len(h) // n
        e = (h[:m * n].reshape(m, n) ** 2).mean(1)
        edb = 10 * np.log10(e + 1e-20)
        med = median_filter(edb, size=21)
        hot = (edb - med >= 12) & (edb >= -80)
        # runs <= 3 frames (6 ms)
        idx = np.flatnonzero(hot)
        runs = []
        if len(idx):
            s = p = idx[0]
            for i in idx[1:]:
                if i == p + 1:
                    p = i
                    continue
                runs.append((s, p)); s = p = i
            runs.append((s, p))
        short = [(a * n / SR, float((edb - med)[a:b + 1].max())) for a, b in runs if b - a + 1 <= 3]
        out.extend(short)
    out.sort()
    return {'count': len(out), 'first': [[round(a, 3), round(b, 1)] for a, b in out[:8]]}


def spectrum(x):
    mono = x.mean(1)
    F = np.abs(np.fft.rfft(mono * np.hanning(len(mono)))) ** 2
    f = np.fft.rfftfreq(len(mono), 1 / SR)
    tot = F.sum() + 1e-30
    band = lambda a, b: float(F[(f >= a) & (f < b)].sum() / tot)
    return {'centroid_hz': round(float((f * F).sum() / tot), 1), 'share_lt300': round(band(0, 300), 3),
            'share_500_4k': round(band(500, 4000), 3), 'share_1k5_4k': round(band(1500, 4000), 4),
            'share_gt8k': round(band(8000, 22050), 5)}


def edges(x, thr_db=-60):
    a = np.abs(x).max(1)
    thr = 10 ** (thr_db / 20)
    nz = np.flatnonzero(a >= thr)
    if not len(nz):
        return {'lead_silence_ms': None, 'tail_silence_ms': None}
    return {'lead_silence_ms': round(nz[0] / SR * 1000, 1), 'tail_silence_ms': round((len(a) - 1 - nz[-1]) / SR * 1000, 1)}


def loop_seam(x, rng=np.random.default_rng(7)):
    n = len(x)
    res = edges(x)
    d = np.abs(np.diff(x, axis=0)).max(1)
    wrap = float(np.abs(x[0] - x[-1]).max())
    res['wrap_step'] = wrap
    res['interior_step_p999'] = float(np.percentile(d, 99.9))
    res['wrap_step_ratio_p999'] = round(wrap / (res['interior_step_p999'] + 1e-12), 3)
    # HF excess at the wrap vs interior points
    L = int(0.25 * SR)
    sos = butter(4, 5000, 'hp', fs=SR, output='sos')

    def hf_excess(seg):
        h = sosfilt(sos, seg.mean(1))
        m = int(0.002 * SR)
        k = len(h) // m
        e = 10 * np.log10((h[:k * m].reshape(k, m) ** 2).mean(1) + 1e-20)
        c = k // 2
        return float(e[c - 3:c + 3].max() - np.median(e))
    wrapseg = np.concatenate([x[-L:], x[:L]])
    ref = []
    for p in rng.integers(L, n - L, 40):
        ref.append(hf_excess(x[p - L:p + L]))
    res['hf_excess_wrap_db'] = round(hf_excess(wrapseg), 2)
    res['hf_excess_interior_p95_db'] = round(float(np.percentile(ref, 95)), 2)
    # level & spectrum continuity
    s1 = int(1.0 * SR)
    rms = lambda z: db(np.sqrt((z ** 2).mean()))
    res['level_end_minus_start_db'] = round(rms(x[-s1:]) - rms(x[:s1]), 2)
    b = int(0.5 * SR)

    def lspec(z):
        return 10 * np.log10(np.abs(np.fft.rfft(z.mean(1) * np.hanning(len(z)))) ** 2 + 1e-12)

    def sdist(a, c):
        A, C = lspec(a), lspec(c)
        return float(np.sqrt(np.mean((uniform_filter1d(A - C, 64)) ** 2)))
    res['spec_dist_wrap_db'] = round(sdist(x[-b:], x[:b]), 2)
    inter = [sdist(x[p - b:p], x[p:p + b]) for p in rng.integers(b, n - b, 40)]
    res['spec_dist_interior_p95_db'] = round(float(np.percentile(inter, 95)), 2)
    ok = (res['wrap_step_ratio_p999'] <= 1.0 and res['hf_excess_wrap_db'] <= max(res['hf_excess_interior_p95_db'], 6.0)
          and abs(res['level_end_minus_start_db']) <= 1.5 and res['spec_dist_wrap_db'] <= res['spec_dist_interior_p95_db'] * 1.25
          and (res['lead_silence_ms'] or 0) < 5 and (res['tail_silence_ms'] or 0) < 5)
    res['verdict'] = 'PASS' if ok else 'CHECK'
    return res


def analyze(path, kind='bed'):
    x, sr0, ch0 = load_any(path)
    m = pyln.Meter(SR)
    r = {'file': path, 'src_sr': sr0, 'src_channels': ch0, 'duration_s': round(len(x) / SR, 3),
         'lufs_i': round(float(m.integrated_loudness(x)), 2), 'true_peak_dbtp': round(true_peak(x), 2),
         'sample_peak_dbfs': round(db(np.abs(x).max()), 2), 'clipped_samples': int((np.abs(x) >= 0.999).sum()),
         'dc': [round(float(x[:, c].mean()), 6) for c in range(2)],
         'lr_corr': round(float(np.corrcoef(x[:, 0], x[:, 1])[0, 1]), 3) if x[:, 0].std() > 0 else None}
    r.update(edges(x))
    if kind in ('bed', 'loop') and len(x) > 6 * SR:
        fl, t, L = flatness(x, edge=10.0 if kind == 'bed' else 0.0)
        r['flatness'] = fl
    r['onsets'] = onsets(x)[0]
    r['clicks_hf'] = clicks(x)
    r['spectrum'] = spectrum(x)
    if kind == 'loop':
        r['loop_seam'] = loop_seam(x)
    return r, x


def decode_to_wav(src, dst):
    x, sr0, ch0 = load_any(src)
    sf.write(dst, x.astype(np.float32), SR, subtype='FLOAT')
    return {'src': src, 'dst': dst, 'src_sr': sr0, 'src_channels': ch0, 'duration_s': round(len(x) / SR, 3)}


def calibrate():
    """Synthetic positives/negatives so the onset thresholds mean something."""
    rng = np.random.default_rng(1)
    n = 60 * SR
    t = np.arange(n) / SR
    pad = sum(np.sin(2 * np.pi * f0 * t + rng.uniform(0, 6)) * a for f0, a in [(77.8, .3), (155.6, .2), (196, .15), (233.1, .12), (311.1, .08)])
    pad *= (1 + 0.1 * np.sin(2 * np.pi * 0.05 * t))
    pad = 0.1 * pad / np.abs(pad).max()
    kick = np.zeros(n)
    per = int(SR * 60 / 70)
    k = np.exp(-np.arange(int(0.25 * SR)) / (0.05 * SR)) * np.sin(2 * np.pi * 60 * np.arange(int(0.25 * SR)) / SR)
    for s in range(0, n - len(k), per):
        kick[s:s + len(k)] += k
    hat = np.zeros(n)
    hb = rng.standard_normal(int(0.03 * SR)) * np.exp(-np.arange(int(0.03 * SR)) / (0.008 * SR))
    hb = np.diff(np.concatenate([[0], hb]))
    for s in range(per // 2, n - len(hb), per):
        hat[s:s + len(hb)] += hb
    kick = kick * np.exp(0)  # sine kick
    soft = pad + 0.03 * kick + 0.01 * hat   # soft kick + soft hat, well under the pad: a quiet pulse
    piano = pad.copy()
    for s in rng.integers(0, n - SR, 12):   # sparse, irregular soft notes (should NOT look like a pulse)
        env = np.exp(-np.arange(SR) / (0.4 * SR))
        piano[s:s + SR] += 0.03 * env * np.sin(2 * np.pi * 622.3 * np.arange(SR) / SR)
    out = {}
    for name, sig in [('pad_only', pad), ('pad_plus_soft_kick_70bpm', soft), ('pad_plus_sparse_notes', piano)]:
        x = np.stack([sig, sig], 1)
        out[name] = onsets(x)[0]
    return out


if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'decode':
        print(json.dumps(decode_to_wav(sys.argv[2], sys.argv[3])))
    elif cmd == 'analyze':
        print(json.dumps(analyze(sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else 'bed')[0], indent=1))
    elif cmd == 'calibrate':
        print(json.dumps(calibrate(), indent=1))
