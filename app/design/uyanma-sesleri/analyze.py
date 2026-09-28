# Uyandırma sesi nesnel denetimi (eşikler: design/uyanma-sesleri/README.md; telefon hoparlörü + BS.1770 ses yüksekliği).
# Kullanım: python3 analyze.py dosya.caf [...]   → her ölçüm ve eşik; hepsi geçmezse çıkış kodu 1
import sys, json
import numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import resample_poly, butter, sosfilt


def true_peak_db(x):
    return 20 * np.log10(np.max(np.abs(resample_poly(x, 4, 1, axis=0))) + 1e-12)


def spectrum(m, sr):
    X = np.abs(np.fft.rfft(m * np.hanning(len(m)))) ** 2
    return np.fft.rfftfreq(len(m), 1 / sr), X


def onsets(m, sr):
    # spektral akı (2048 nokta, 512 atlama), tepe > ortanca + 1,5·std, en az 50 ms arayla
    hop, N = 512, 2048
    w = np.hanning(N)
    frames = np.lib.stride_tricks.sliding_window_view(m, N)[::hop] * w
    S = np.log1p(100 * np.abs(np.fft.rfft(frames, axis=1)))
    flux = np.maximum(0, np.diff(S, axis=0)).sum(1)
    thr = np.median(flux) + 1.5 * flux.std()
    idx, last = [], -1e9
    for i in range(1, len(flux) - 1):
        if flux[i] > thr and flux[i] >= flux[i - 1] and flux[i] >= flux[i + 1] and (i - last) * hop / sr >= 0.05:
            idx.append(i)
            last = i
    t = np.array(idx) * hop / sr
    ioi = np.diff(t)
    return len(t) / (len(m) / sr), float(np.median(ioi)) if len(ioi) else float('nan')


def clicks_db(m, sr):
    hp = sosfilt(butter(4, 10000, 'highpass', fs=sr, output='sos'), m)
    n = int(0.002 * sr)
    e = np.sqrt((hp[: len(hp) // n * n].reshape(-1, n) ** 2).mean(1)) + 1e-12
    db = 20 * np.log10(e)
    act = db[db > db.max() - 60]
    return float(db.max() - np.percentile(act, 95))


def analyze(path, profile='uyandirma'):
    x, sr = sf.read(path, always_2d=True)
    m = x.mean(1)
    L = len(m) / sr
    meter = pyln.Meter(sr)
    lufs = meter.integrated_loudness(x)
    seg = lambda a, b: meter.integrated_loudness(x[int(a * sr): int(b * sr)])
    f, X = spectrum(m, sr)
    tot = X.sum()
    share = lambda lo, hi: float(X[(f >= lo) & (f < hi)].sum() / tot)
    cum = np.cumsum(X)
    rate, ioi = onsets(m, sr)
    hp350 = sosfilt(butter(4, 350, 'highpass', fs=sr, output='sos'), x, axis=0)
    lead = int(np.argmax(np.abs(m) > 1e-3)) / sr
    tp = true_peak_db(x)
    r = {
        'file': path.split('/')[-1], 'sr': sr, 'ch': x.shape[1], 'sec': round(L, 2),
        'true_peak_db': round(tp, 2), 'lufs': round(lufs, 1), 'plr': round(tp - lufs, 1),
        'lufs_first5': round(seg(0, 5), 1), 'lufs_last5': round(seg(L - 5, L), 1),
        'clipped': int((np.abs(x) >= 0.99997).sum()), 'dc': float(np.abs(x.mean(0)).max()),
        'centroid_hz': round(float((f * X).sum() / tot)), 'rolloff85_hz': round(float(f[np.searchsorted(cum, 0.85 * tot)])),
        'share_below_300': round(share(0, 300), 4), 'share_500_4k': round(share(500, 4000), 3),
        'share_above_6k': round(share(6000, sr / 2), 4), 'share_above_16k': share(16000, sr / 2),
        'phone_loss_lu': round(meter.integrated_loudness(hp350) - lufs, 2),
        'onsets_per_s': round(rate, 2), 'median_ioi_s': round(ioi, 3),
        'lead_silence_ms': round(lead * 1000, 1), 'edge': float(max(np.abs(x[0]).max(), np.abs(x[-1]).max())),
        'clicks_db': round(clicks_db(m, sr), 1),
        'lr_corr': round(float(np.corrcoef(x[:, 0], x[:, 1])[0, 1]), 3),
        'mono_loss_db': round(10 * np.log10((m ** 2).mean() / ((x ** 2).mean(1)).mean()), 2),
    }
    c = {
        'süre ≤ 25 sn (AlarmKit < 30 sn, bir kez çalar)': r['sec'] <= 25.0,
        '44,1 kHz · 2 kanal': sr == 44100 and x.shape[1] == 2,
        'kırpılma yok': r['clipped'] == 0,
        'gerçek tepe ≤ −1 dBTP': tp <= -1.0,
        'ses yüksekliği −14…−10 LUFS': -14 <= lufs <= -10,
        'PLR 8–13 dB (ne ezik ne kısık)': 8 <= r['plr'] <= 13,
        'ilk 5 sn duyulur (≥ −22 LUFS)': r['lufs_first5'] >= -22,
        'yükselen (son 5 sn ≥ ilk 5 sn + 3 LU)': r['lufs_last5'] >= r['lufs_first5'] + 3,
        '500 Hz–4 kHz ≥ %75 (hoparlörün iyi çaldığı bant)': r['share_500_4k'] >= 0.75,
        '300 Hz altı ≤ %3': r['share_below_300'] <= 0.03,
        '6 kHz üstü ≤ %3 (cırtlak değil)': r['share_above_6k'] <= 0.03,
        '16 kHz üstü yok (örtüşme yok)': r['share_above_16k'] <= 1e-5,
        '%85 enerji ≤ 4,5 kHz': r['rolloff85_hz'] <= 4500,
        'spektral merkez 900–2500 Hz': 900 <= r['centroid_hz'] <= 2500,
        'hoparlörde kayıp ≥ −1 LU': r['phone_loss_lu'] >= -1.0,
        'ritim 2–6 vuruş/sn': 2 <= r['onsets_per_s'] <= 6,
        'baştaki sessizlik ≤ 50 ms': r['lead_silence_ms'] <= 50,
        'uçlarda tık yok (< 1e-4)': r['edge'] < 1e-4,
        'DC yok (< 1e-4)': r['dc'] < 1e-4,
        'iç tık yok (< 12 dB)': r['clicks_db'] < 12,
        'mono uyumu (korelasyon ≥ 0,8, kayıp ≥ −1,5 dB)': r['lr_corr'] >= 0.8 and r['mono_loss_db'] >= -1.5,
    }
    if profile == 'dalga':
        # Dalga müzikleri (Sakin/Güç/Motivasyon) uyandırma için değil rahatlama/odak için bestelendi: tempo, yükselme
        # ve bant payı "uyandırma sesi" ölçütü değil; bunlar yalnız bilgi. Teknik kusur ölçütleri aynen geçerli.
        for k in ['yükselen (son 5 sn ≥ ilk 5 sn + 3 LU)', '500 Hz–4 kHz ≥ %75 (hoparlörün iyi çaldığı bant)', 'spektral merkez 900–2500 Hz', 'ritim 2–6 vuruş/sn', 'iç tık yok (< 12 dB)', '300 Hz altı ≤ %3']:
            c.pop(k)
        c['300 Hz altı ≤ %5 (Dalga)'] = r['share_below_300'] <= 0.05
        c['500 Hz–4 kHz ≥ %50 (Dalga)'] = r['share_500_4k'] >= 0.50
    r['checks'] = c
    r['ok'] = all(c.values())
    return r


if __name__ == '__main__':
    bad = 0
    args = sys.argv[1:]
    profile = 'uyandirma'
    if args and args[0].startswith('--profil='):
        profile = args.pop(0).split('=', 1)[1]
    for p in args:
        r = analyze(p, profile)
        print(json.dumps({k: v for k, v in r.items() if k != 'checks'}, ensure_ascii=False))
        for k, v in r['checks'].items():
            print(('  ✓ ' if v else '  ✗ ') + k)
        bad += not r['ok']
    sys.exit(1 if bad else 0)
