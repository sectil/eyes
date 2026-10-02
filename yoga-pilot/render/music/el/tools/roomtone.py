#!/usr/bin/env python3
"""Room-tone floor (SPEC §5): pink noise, -58 dBFS RMS per channel, 2 x 30 s, gentle low-pass.
Built in the frequency domain (random phase, |X| ~ 1/sqrt(f)), so each file is exactly periodic -> sample-exact
seamless loop. Gentle LP: 2nd-order-magnitude roll-off at 6 kHz; HP 2nd order at 25 Hz (no rumble/DC).
Stereo channels are independent noise (decorrelated room). Output 44.1 kHz stereo float WAV."""
import numpy as np, soundfile as sf, os, json
SR = 44100; DUR = 30; N = SR * DUR
TARGET_DBFS = -58.0
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'common')
f = np.fft.rfftfreq(N, 1 / SR)
mag = np.zeros_like(f)
nz = f > 0
mag[nz] = 1 / np.sqrt(f[nz])
LP_FC, HP_FC = 6000.0, 25.0
mag *= 1 / np.sqrt(1 + (f / LP_FC) ** 4)
mag[nz] *= 1 / np.sqrt(1 + (HP_FC / f[nz]) ** 4)
res = []
for k, seed in enumerate([20260929, 20260930], start=1):
    rng = np.random.default_rng(seed)
    ch = []
    for c in range(2):
        ph = rng.uniform(0, 2 * np.pi, len(f))
        X = mag * np.exp(1j * ph); X[0] = 0; X[-1] = X[-1].real
        x = np.fft.irfft(X, n=N)
        x *= 10 ** (TARGET_DBFS / 20) / np.sqrt(np.mean(x ** 2))
        ch.append(x)
    y = np.stack(ch, 1).astype(np.float32)
    p = os.path.abspath(os.path.join(OUT, f'oda-sesi-{k}.wav'))
    sf.write(p, y, SR, subtype='FLOAT')
    rms = [20 * np.log10(np.sqrt(np.mean(y[:, c].astype(np.float64) ** 2))) for c in range(2)]
    seam = np.abs(np.concatenate([y[-1:], y[:1]]).astype(np.float64)).max()
    step = np.abs(y[0].astype(np.float64) - y[-1].astype(np.float64)).max()
    med_step = np.median(np.abs(np.diff(y[:, 0].astype(np.float64))))
    corr = float(np.corrcoef(y[:, 0], y[:, 1])[0, 1])
    res.append({'file': p, 'seed': seed, 'dur_s': DUR, 'rms_dbfs': [round(float(r), 2) for r in rms],
                'peak_dbfs': round(float(20 * np.log10(np.abs(y).max())), 2), 'loop_seam_step': float(step),
                'median_sample_step': float(med_step), 'lr_corr': round(corr, 4), 'lp_hz': LP_FC, 'hp_hz': HP_FC})
print(json.dumps(res, indent=1))
