"""Müzik dosyası ölçümleri (SPEC §5 seçim denetimleri; kaynaktan bağımsız: Dalga ve ElevenLabs dosyalarına aynı
ölçüt uygulanabilsin diye genel yazıldı). numpy/scipy/soundfile/pyloudnorm; ffmpeg yok.
Kullanım: python3 analyze_music.py dosya.wav [--seams 208,432]  → JSON (stdout)
Ölçümler:
  format, süre, bütünleşik LUFS (BS.1770), gerçek tepe (4× üst örnekleme), örnek tepe, DC
  kısa süreli yükseklik: 3 sn pencere, 1 sn adım, kapısız K-ağırlıklı (EBU kısa süreli) → yüzdelikler ve yayılım
  başlangıç (onset) gücü: log-genlik spektral akı (10 ms adım), tepe hızı (/dk; eşik medyan + 5·MAD), p50/p99
  vurmalı enerji payı: HPSS (zamanda/frekansta medyan süzgeç, yumuşak maske) → vurmalı / toplam enerji
  tık: 10 kHz üstü 2,9 ms çerçeve enerjisi, ±100 ms medyanın ≥ 15 dB üstü ve mutlak ≥ −80 dBFS
  dijital sessizlik: iki kanal |x| < 2^-15 en uzun dizi; en düşük 1 sn RMS
  spektral paylar: < 150, < 300, 300–500, 500–4000, 1500–4000, > 4000 Hz (Welch, orta kanal)
  ekler (--seams): her ek için 8 sn geçiş penceresinin anlık (400 ms) yüksekliği, önceki 16 sn ve sonraki 16 sn'ye göre
  fark (dB); aynı istatistik dosyadaki bütün 4 sn ızgara konumları için (taban dağılım) ve eklerin bu dağılımdaki yeri;
  ek çevresinde (±50 ms) 10 kHz üstü tepe / yerel medyan.
"""
import sys, json, argparse
import numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt, resample_poly, welch, stft, lfilter
from scipy.ndimage import median_filter

def kweight(x, sr):
    m = pyln.Meter(sr)
    y = x.copy()
    for f in m._filters.values():
        for c in range(y.shape[1]):
            y[:, c] = lfilter(f.b, f.a, y[:, c])
    return y

def win_loudness(yk, sr, win, hop):
    p = (yk ** 2).sum(1)  # L + R (G = 1)
    cs = np.concatenate([[0.0], np.cumsum(p)])
    W, H = int(round(win * sr)), int(round(hop * sr))
    starts = np.arange(0, len(p) - W + 1, H)
    ms = (cs[starts + W] - cs[starts]) / W
    with np.errstate(divide='ignore'):
        L = -0.691 + 10 * np.log10(ms)
    return starts / sr, L, ms

def pct(a, q):
    return float(np.round(np.percentile(a, q), 2))

def analyze(path, seams=(), xfade=8.0, onsets=None, phase_period=None, exclude=None):
    x, sr = sf.read(path, always_2d=True, dtype='float64')
    info = sf.info(path)
    n = len(x)
    out = {'file': path, 'sampleRate': sr, 'channels': x.shape[1], 'subtype': info.subtype, 'durationSec': round(n / sr, 4)}
    meter = pyln.Meter(sr)
    out['lufsIntegrated'] = round(float(meter.integrated_loudness(x)), 2)
    tp = np.abs(resample_poly(x, 4, 1, axis=0)).max()
    out['truePeakDbtp'] = round(float(20 * np.log10(tp + 1e-12)), 2)
    out['samplePeakDbfs'] = round(float(20 * np.log10(np.abs(x).max() + 1e-12)), 2)
    out['dc'] = [float(f'{v:.2e}') for v in x.mean(0)]
    out['edgeAbs'] = {'first': float(f'{np.abs(x[0]).max():.2e}'), 'last': float(f'{np.abs(x[-1]).max():.2e}')}
    # kısa süreli 3 sn
    yk = kweight(x, sr)
    t3, L3, _ = win_loudness(yk, sr, 3.0, 1.0)
    Lv = L3[np.isfinite(L3)]
    out['shortTerm3s'] = {'windows': int(len(L3)), 'below70': int((L3 < -70).sum()), 'min': pct(Lv, 0), 'p5': pct(Lv, 5), 'p10': pct(Lv, 10), 'p50': pct(Lv, 50),
                          'p90': pct(Lv, 90), 'p95': pct(Lv, 95), 'max': pct(Lv, 100), 'spreadP10P90': round(pct(Lv, 90) - pct(Lv, 10), 2),
                          'spreadP5P95': round(pct(Lv, 95) - pct(Lv, 5), 2), 'spreadMaxMin': round(pct(Lv, 100) - pct(Lv, 0), 2)}
    if exclude:
        ok = np.array([all(t + 3.0 <= a or t >= b for a, b in exclude) for t in t3]) & np.isfinite(L3)
        Le = L3[ok]
        if len(Le):
            out['shortTerm3s']['excludingIntervals'] = {'n': int(len(Le)), 'p10': pct(Le, 10), 'p50': pct(Le, 50), 'p90': pct(Le, 90),
                                                        'spreadP10P90': round(pct(Le, 90) - pct(Le, 10), 2), 'spreadMaxMin': round(pct(Le, 100) - pct(Le, 0), 2)}
    # 1 sn adımlı eğilim (ilk/son üçte bir farkı: kreşendo denetimi)
    k = max(1, len(Lv) // 3)
    e = lambda a: 10 * np.log10(np.mean(10 ** (a / 10)))
    out['shortTerm3s']['lastThirdMinusFirstThirdDb'] = round(float(e(Lv[-k:]) - e(Lv[:k])), 2)
    # başlangıç gücü (spektral akı) ve HPSS
    mono = x.mean(1)
    f, t, Z = stft(mono, sr, nperseg=2048, noverlap=2048 - 441, boundary=None, padded=False)
    M = np.abs(Z).astype(np.float32)
    ref = np.sqrt(np.mean(M ** 2)) + 1e-12
    Lg = np.log1p(M / ref * 10.0)
    flux = np.maximum(0, np.diff(Lg, axis=1)).mean(0)
    # kapı: çerçeve enerjisi dosyanın p95 çerçeve enerjisinin 40 dB altından yüksek olmalı (seyrek katmanlarda
    # sönmüş yankı gürültüsü tepe sayılmasın); medyan/MAD kapıdan geçen çerçevelerden
    Ef = (M ** 2).sum(0)[1:]
    gate = Ef > np.percentile(Ef, 95) * 1e-4
    fg = flux[gate] if gate.any() else flux
    med = np.median(fg)
    mad = np.median(np.abs(fg - med)) + 1e-12
    thr = med + 5 * mad
    pk = (flux[1:-1] > thr) & (flux[1:-1] >= flux[:-2]) & (flux[1:-1] > flux[2:]) & gate[1:-1]
    idx = np.where(pk)[0] + 1
    # 50 ms içinde tek tepe
    keep = []
    for i in idx:
        if not keep or i - keep[-1] > 5:
            keep.append(i)
    dur_min = n / sr / 60
    out['onset'] = {'fluxP50': round(float(med), 4), 'fluxP99': round(float(np.percentile(flux, 99)), 4), 'fluxMax': round(float(flux.max()), 4),
                    'peakRatePerMin': round(len(keep) / dur_min, 2), 'threshold': 'median + 5*MAD over gated frames; gate = frame energy > p95 frame energy - 40 dB', 'gatedFrameShare': round(float(gate.mean()), 3), 'hopMs': 10}
    f2, t2, Z2 = stft(mono, sr, nperseg=2048, noverlap=1024, boundary=None, padded=False)
    S = (np.abs(Z2) ** 2).astype(np.float32)
    H = median_filter(S, size=(1, 17), mode='nearest')
    P = median_filter(S, size=(17, 1), mode='nearest')
    mP = P ** 2 / (H ** 2 + P ** 2 + 1e-30)
    out['percussiveEnergyRatio'] = round(float((mP * S).sum() / (S.sum() + 1e-30)), 4)
    # tık: 10 kHz üstü
    hf = sosfilt(butter(4, 10000, 'highpass', fs=sr, output='sos'), x, axis=0)
    F = 128
    nf = n // F
    ef = (hf[:nf * F] ** 2).reshape(nf, F, -1).mean(1).sum(1)
    edb = 10 * np.log10(ef + 1e-20)
    loc = median_filter(edb, size=69, mode='nearest')
    cl = np.where((edb - loc >= 15) & (edb >= -80))[0]
    # ardışık çerçeveler tek olay (küme); kümenin başı
    clusters = []
    for i in cl:
        if not clusters or i - clusters[-1][-1] > 3:
            clusters.append([i])
        else:
            clusters[-1].append(i)
    starts = [c[0] * F / sr for c in clusters]
    peaks = [float(edb[c].max()) for c in clusters]
    rec = {'hfTransients': len(clusters), 'hfMaxDbfs': round(float(edb.max()), 1), 'hfP50Dbfs': round(float(np.median(edb)), 1),
           'rule': '>10 kHz, 2.9 ms frames >= +15 dB over ±100 ms median and >= -80 dBFS; consecutive frames = one transient'}
    if onsets is not None:
        on = np.sort(np.asarray(onsets, dtype=float))
        un = []
        for st, pkv in zip(starts, peaks):
            # olay başlangıcı o ∈ [st − 20 ms, st + 6 ms]  (geçici, notanın 6 ms önünden 20 ms sonrasına kadar başlar)
            k0, k1 = np.searchsorted(on, st - 0.020, 'left'), np.searchsorted(on, st + 0.006, 'right')
            if k1 <= k0:
                un.append((round(st, 3), round(pkv, 1)))
        rec['attributedToNoteOnsets'] = len(clusters) - len(un)
        rec['unattributed'] = len(un)
        rec['unattributedList'] = un
        rec['attributionRule'] = 'a scheduled note event (render log) starts between 20 ms before and 6 ms after the transient start'
    else:
        rec['firstTimesSec'] = [round(v, 3) for v in starts[:20]]
    out['clicks'] = rec
    # dijital sessizlik
    q = np.abs(x).max(1) < 2 ** -15
    dq = np.diff(np.concatenate([[0], q.astype(np.int8), [0]]))
    rs, re_ = np.where(dq == 1)[0], np.where(dq == -1)[0]
    best = int((re_ - rs).max()) if len(rs) else 0
    r1 = np.sqrt((x[: (n // sr) * sr] ** 2).mean(1).reshape(-1, sr).mean(1))
    out['digitalSilence'] = {'longestRunSec': round(best / sr, 4), 'min1sRmsDbfs': round(float(20 * np.log10(r1.min() + 1e-12)), 1)}
    # spektral paylar
    fw, pw = welch(mono, sr, nperseg=8192)
    tot = pw.sum()
    sh = lambda a, b: round(float(pw[(fw >= a) & (fw < b)].sum() / tot), 4)
    out['spectralShare'] = {'lt150': sh(0, 150), 'lt300': sh(0, 300), '300_500': sh(300, 500), '500_4000': sh(500, 4000), '1500_4000': sh(1500, 4000), 'gt4000': sh(4000, sr / 2 + 1)}
    out['stereo'] = {'lrCorrelation': round(float(np.corrcoef(x[:, 0], x[:, 1])[0, 1]), 3)}
    # ekler
    if seams:
        tm, Lm, msm = win_loudness(yk, sr, 0.4, 0.1)
        def delta(a):
            inx = (tm >= a) & (tm + 0.4 <= a + xfade)
            pre = (tm >= a - 16) & (tm + 0.4 <= a)
            post = (tm >= a + xfade) & (tm + 0.4 <= a + xfade + 16)
            if inx.sum() == 0 or pre.sum() == 0 or post.sum() == 0:
                return None
            db = lambda m: 10 * np.log10(np.mean(msm[m]) + 1e-20)
            return db(inx) - 0.5 * (db(pre) + db(post))
        if phase_period:
            cand = sorted({round(s0 + k * phase_period, 4) for s0 in seams for k in range(-200, 200)})
            cand = [c for c in cand if 16 <= c <= n / sr - xfade - 16 and all(abs(c - s0) > 1e-3 for s0 in seams)]
        else:
            cand = list(np.arange(16, n / sr - xfade - 16, 4.0))
        base = [d for d in (delta(a) for a in cand) if d is not None]
        rows = []
        for s0 in seams:
            d = delta(s0)
            i0, i1 = int((s0 - 0.05) * sr) // F, int((s0 + xfade + 0.05) * sr) // F
            # ek sınırları (geçiş başı ve sonu) ±50 ms içinde 10 kHz üstü sıçrama
            edges = []
            for tb in (s0, s0 + xfade):
                a0, a1 = int((tb - 0.05) * sr) // F, int((tb + 0.05) * sr) // F
                edges.append(round(float((edb[a0:a1] - loc[a0:a1]).max()), 1))
            unatt = None
            if onsets is not None and 'unattributedList' in out['clicks']:
                unatt = [u for u in out['clicks']['unattributedList'] if s0 - 0.1 <= u[0] <= s0 + xfade + 0.1]
            rows.append({'xfadeStartSec': s0, 'loudnessDeltaDb': None if d is None else round(float(d), 2),
                         'percentileInBaseline': None if d is None else round(float((np.array(base) < d).mean() * 100), 1),
                         'hfJumpAtXfadeEdgesDb': edges, 'unattributedHfTransientsInXfade': unatt})
        out['seams'] = {'xfadeSec': xfade, 'rows': rows, 'baseline': {'positions': 'same harmonic phase (seam + k*%s s)' % phase_period if phase_period else 'every 4 s',
                        'n': len(base), 'p5': pct(base, 5), 'p50': pct(base, 50), 'p95': pct(base, 95), 'max': pct(base, 100)},
                        'deltaDefinition': 'energy-mean 400 ms loudness inside the 8 s crossfade minus mean of the 16 s before and 16 s after (dB)'}
    return out

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('wav')
    ap.add_argument('--seams', default='')
    a = ap.parse_args()
    seams = [float(s) for s in a.seams.split(',') if s]
    print(json.dumps(analyze(a.wav, seams), ensure_ascii=False, indent=1))
