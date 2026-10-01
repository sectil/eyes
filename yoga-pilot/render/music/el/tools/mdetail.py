#!/usr/bin/env python3
"""mdetail.py — second-pass checks (SPEC §5): usable body of each bed (fade-in/out found from 3 s ST loudness),
flatness inside the body, audibility-gated click list, mono-sum loss, refined loop-seam test for nature loops,
and the Varış opening comparison (first 90 s). Prints JSON."""
import json, sys, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt
from scipy.ndimage import median_filter, uniform_filter1d
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import manalyze as M
SR = 44100
BODY_TOL_LU = 3.0   # body = from the first to the last 3 s ST value within 3 LU of the file's ST median (VARSAYIM)


def body(x):
    t, L = M.st_loudness(x, 3.0, 0.5)
    med = np.median(L[L > -70])
    ok = np.flatnonzero(np.abs(L - med) <= BODY_TOL_LU)
    t0, t1 = float(t[ok[0]] - 1.5), float(t[ok[-1]] + 1.5)
    inb = (t >= t0 + 1.5) & (t <= t1 - 1.5)
    Lb = L[inb]
    d1 = np.abs(np.diff(Lb)) / 0.5            # LU per second between 0.5 s hops
    step = 20
    cres = 0
    for i in range(0, len(Lb) - step):
        seg = Lb[i:i + step + 1]
        if (np.diff(seg) > -0.1).all() and seg[-1] - seg[0] >= 2.0:
            cres += 1
    return {'body_start_s': round(max(t0, 0.0), 1), 'body_end_s': round(t1, 1), 'body_dur_s': round(t1 - max(t0, 0), 1),
            'fade_in_s': round(max(t0, 0.0), 1), 'fade_out_s': round(len(x) / SR - t1, 1),
            'body_st_median_lufs': round(float(np.median(Lb)), 2),
            'body_spread_p5_p95_lu': round(float(np.percentile(Lb, 95) - np.percentile(Lb, 5)), 2),
            'body_range_lu': round(float(Lb.max() - Lb.min()), 2), 'body_std_lu': round(float(Lb.std()), 2),
            'body_max_rate_lu_per_s': round(float(d1.max()), 2), 'body_crescendo_10s_spans': int(cres)}


def audible_clicks(x):
    """>10 kHz 2 ms frame >= 12 dB over its +-20 ms median AND within 40 dB of the full-band 2 ms frame level
    (a click is broadband; a codec/onset artefact 60 dB under the music is not)."""
    sos = butter(4, 10000, 'hp', fs=SR, output='sos')
    mono = x.mean(1)
    h = sosfilt(sos, mono)
    n = int(0.002 * SR); m = len(h) // n
    eh = 10 * np.log10((h[:m * n].reshape(m, n) ** 2).mean(1) + 1e-20)
    ef = 10 * np.log10((mono[:m * n].reshape(m, n) ** 2).mean(1) + 1e-20)
    exc = eh - median_filter(eh, 21)
    fexc = ef - median_filter(ef, 21)
    cand = np.flatnonzero((exc >= 12) & (eh >= -80))
    aud = [i for i in cand if eh[i] - ef[i] >= -40]
    trans = [i for i in cand if fexc[i] >= 10]
    return {'hf_candidates': int(len(cand)),
            'hf_candidate_max_level_rel_fullband_db': round(float(max((eh[i] - ef[i]) for i in cand)), 1) if len(cand) else None,
            'audible_broadband_clicks': [round(i * n / SR, 3) for i in aud],
            'fullband_transients_ge10db': [[round(i * n / SR, 3), round(float(fexc[i]), 1)] for i in trans]}


def mono_loss(x):
    m = pyln.Meter(SR)
    a = m.integrated_loudness(x)
    mm = x.mean(1)
    b = m.integrated_loudness(np.stack([mm, mm], 1))
    return round(float(b - a), 2)


def seam(x, rng=np.random.default_rng(11)):
    """Level/HF continuity across the wrap using 100 ms windows; compared with 300 interior cut points."""
    n = len(x); w = int(0.1 * SR)
    sos = butter(4, 4000, 'hp', fs=SR, output='sos')
    def jump(a, b):
        ra = np.sqrt((a ** 2).mean()); rb = np.sqrt((b ** 2).mean())
        ha = np.sqrt((sosfilt(sos, a.mean(1)) ** 2).mean()); hb = np.sqrt((sosfilt(sos, b.mean(1)) ** 2).mean())
        return abs(20 * np.log10(rb / ra)), abs(20 * np.log10(hb / ha))
    wj = jump(x[-w:], x[:w])
    pts = rng.integers(w, n - w, 300)
    ij = np.array([jump(x[p - w:p], x[p:p + w]) for p in pts])
    rank_l = float((ij[:, 0] < wj[0]).mean()); rank_h = float((ij[:, 1] < wj[1]).mean())
    wrap = float(np.abs(x[0] - x[-1]).max()); p999 = float(np.percentile(np.abs(np.diff(x, axis=0)).max(1), 99.9))
    ok = wrap <= p999 and rank_l <= 0.95 and rank_h <= 0.95
    return {'wrap_sample_step': round(wrap, 6), 'interior_step_p999': round(p999, 6),
            'wrap_level_jump_100ms_db': round(wj[0], 2), 'interior_level_jump_p95_db': round(float(np.percentile(ij[:, 0], 95)), 2),
            'wrap_level_jump_percentile': round(rank_l, 3),
            'wrap_hf_jump_100ms_db': round(wj[1], 2), 'interior_hf_jump_p95_db': round(float(np.percentile(ij[:, 1], 95)), 2),
            'wrap_hf_jump_percentile': round(rank_h, 3), 'verdict': 'PASS (seam indistinguishable from interior cuts)' if ok else 'CHECK'}


def opening(x, T=90.0):
    seg = x[:int(T * SR)]
    t, L = M.st_loudness(seg, 3.0, 0.5)
    ref = np.median(L[(t >= 20)])
    reach = t[np.flatnonzero(L >= ref - 2.0)[0]]
    Lb = L[t >= 10]
    rate = np.abs(np.diff(Lb)) / 0.5
    on = M.onsets(seg)[0]
    # timbre stability: spectral centroid of 1 s frames (10-90 s)
    mono = seg.mean(1)
    cs = []
    for s in range(10 * SR, len(mono) - SR, SR):
        F = np.abs(np.fft.rfft(mono[s:s + SR] * np.hanning(SR))) ** 2
        f = np.fft.rfftfreq(SR, 1 / SR)
        cs.append((f * F).sum() / F.sum())
    cs = np.array(cs)
    # long-term spectral change: mean log-spectral distance between successive 2 s blocks (10-90 s), 1/3-oct-ish smoothing
    blocks = []
    for s in range(10 * SR, len(mono) - 2 * SR, 2 * SR):
        F = 10 * np.log10(np.abs(np.fft.rfft(mono[s:s + 2 * SR] * np.hanning(2 * SR))) ** 2 + 1e-12)
        blocks.append(uniform_filter1d(F, 200)[:int(8000 * 2)])
    bd = [float(np.sqrt(np.mean((blocks[i + 1] - blocks[i]) ** 2))) for i in range(len(blocks) - 1)]
    cl = audible_clicks(seg)
    return {'fade_in_to_within_2lu_s': round(float(reach), 1), 'st_spread_p5_p95_10_90s_lu': round(float(np.percentile(Lb, 95) - np.percentile(Lb, 5)), 2),
            'st_std_10_90s_lu': round(float(Lb.std()), 2), 'st_max_rate_lu_per_s': round(float(rate.max()), 2),
            'strong_onsets_0_90s': round(on['strong_onsets_per_min'] * T / 60, 1), 'events_0_90s': round(on['events_per_min'] * T / 60, 1),
            'pulse_clarity': on['pulse_clarity'], 'flux_max_db_over_median': round(on['flux_max_db'] - on['flux_median_db'], 2),
            'centroid_std_hz': round(float(cs.std()), 1), 'centroid_mean_hz': round(float(cs.mean()), 1),
            'spectral_change_2s_mean_db': round(float(np.mean(bd)), 2), 'spectral_change_2s_max_db': round(float(np.max(bd)), 2),
            'audible_clicks': len(cl['audible_broadband_clicks']), 'fullband_transients_ge10db': len(cl['fullband_transients_ge10db'])}


if __name__ == '__main__':
    out = {}
    for f in sys.argv[1:]:
        x, _ = sf.read(f, dtype='float64')
        r = {'mono_sum_minus_stereo_lu': mono_loss(x), 'clicks': audible_clicks(x)}
        if '/orman-' in f:
            r['seam'] = seam(x)
            r['body'] = body(x)
        elif '/el-' in f:
            r['body'] = body(x)
        if f.endswith(('el-vd-a.wav', 'el-vd-b.wav', 'el-v-aday.wav')):
            r['opening_0_90s'] = opening(x)
        out[f] = r
    print(json.dumps(out, indent=1))
