#!/usr/bin/env python3
"""fixups.py — two documented local repairs (originals kept under common/raw/*.orig.wav):
1. donus (return tone): the generated file is almost fully anti-phase between L and R (corr -0.94; mid RMS 14 dB
   under side), so it nearly cancels on a mono phone speaker, and it starts at full level on sample 0 (HF click
   excess 27 dB). Repair: mono = (L - R)/2 (the coherent tone), 20 ms raised-cosine fade-in (prompt asked for a
   'rounded attack'; VARSAYIM), 50 ms raised-cosine fade-out at the file end, written as identical L/R.
   No level change (the mixer sets level).
2. orman-4 (nature loop): 8 broadband crackle frames (>10 kHz and full band >= 10-15 dB over the +-20 ms median;
   at 2.98, 11.37, 19.93, 20.16, 23.65 s). Repair: per event a gain dip that brings each 2 ms frame down to
   (local median + 3 dB), smoothed with 3 ms raised-cosine ramps. Loop edges untouched (first/last 50 ms)."""
import numpy as np, soundfile as sf, os, shutil, json
from scipy.signal import butter, sosfilt
from scipy.ndimage import median_filter
SR = 44100
C = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'common'))
log = {}

# 1. return tone
src = os.path.join(C, 'raw', 'donus.orig.wav')
if not os.path.exists(src):
    shutil.copy(os.path.join(C, 'donus.wav'), src)
x, sr = sf.read(src, dtype='float64'); assert sr == SR
m = (x[:, 0] - x[:, 1]) / 2
nin, nout = int(0.020 * SR), int(0.050 * SR)
g = np.ones(len(m))
g[:nin] = 0.5 - 0.5 * np.cos(np.pi * np.arange(nin) / nin)
g[-nout:] = 0.5 + 0.5 * np.cos(np.pi * np.arange(nout) / nout)
y = m * g
sf.write(os.path.join(C, 'donus.wav'), np.stack([y, y], 1).astype(np.float32), SR, subtype='FLOAT')
log['donus'] = {'from': src, 'mono': '(L-R)/2', 'fade_in_ms': 20, 'fade_out_ms': 50,
                'peak_dbfs_before_L_R': [round(20 * np.log10(np.abs(x[:, c]).max()), 2) for c in range(2)],
                'peak_dbfs_after': round(20 * np.log10(np.abs(y).max()), 2)}

# 2. orman-4 declick
src = os.path.join(C, 'raw', 'orman-4.orig.wav')
if not os.path.exists(src):
    shutil.copy(os.path.join(C, 'orman-4.wav'), src)
x, sr = sf.read(src, dtype='float64'); assert sr == SR
mono = x.mean(1)
n = int(0.002 * SR); k = len(mono) // n
ef = 10 * np.log10((mono[:k * n].reshape(k, n) ** 2).mean(1) + 1e-20)
med = median_filter(ef, 21)
h = sosfilt(butter(4, 10000, 'hp', fs=SR, output='sos'), mono)
eh = 10 * np.log10((h[:k * n].reshape(k, n) ** 2).mean(1) + 1e-20)
ehx = eh - median_filter(eh, 21)
hot = np.flatnonzero(((ef - med) >= 6) & (ehx >= 12))
edge = int(0.05 * SR) // n
hot = hot[(hot > edge) & (hot < k - edge)]
gain_db = np.zeros(k)
for i in hot:
    for j in range(i - 1, i + 2):          # the frame and its neighbours
        gain_db[j] = min(gain_db[j], -(ef[j] - (med[j] + 3.0))) if ef[j] > med[j] + 3.0 else gain_db[j]
gs = np.repeat(gain_db, n)
gs = np.concatenate([gs, np.zeros(len(mono) - len(gs))])
r = int(0.003 * SR)
win = np.hanning(2 * r + 1); win /= win.sum()
# smooth in the dB domain but never less deep than needed at the event (min-filter then smooth)
from scipy.ndimage import minimum_filter1d
gsm = np.convolve(minimum_filter1d(gs, 2 * r + 1), win, 'same')
gl = 10 ** (gsm / 20)
y = x * gl[:, None]
sf.write(os.path.join(C, 'orman-4.wav'), y.astype(np.float32), SR, subtype='FLOAT')
log['orman-4'] = {'from': src, 'events_s': sorted(set(round(float(i * n / SR), 3) for i in hot)),
                  'max_cut_db': round(float(gsm.min()), 2), 'samples_touched': int((gsm < -0.01).sum()),
                  'touched_ms': round(float((gsm < -0.01).sum() / SR * 1000), 1)}
print(json.dumps(log, indent=1))
json.dump(log, open(os.path.join(C, 'raw', 'fixups.json'), 'w'), indent=1)
