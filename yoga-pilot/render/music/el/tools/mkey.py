#!/usr/bin/env python3
"""mkey.py — pitch-class profile (chroma from a 1 s-frame magnitude spectrum, 55-2000 Hz, log-frequency binning to
12 pitch classes) and Krumhansl-Schmuckler key estimate; reports the best key, its correlation, and the E-flat
major correlation. Also the times of strong onsets in a window (for the opening report)."""
import sys, json, numpy as np, soundfile as sf
SR = 44100
NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
MAJ = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
MIN = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])


def chroma(x):
    mono = x.mean(1)
    f = np.fft.rfftfreq(SR, 1 / SR)
    sel = (f >= 55) & (f <= 2000)
    pc = (np.round(12 * np.log2(f[sel] / 440.0)) + 9) % 12
    prof = np.zeros(12)
    for s in range(0, len(mono) - SR, SR):
        F = np.abs(np.fft.rfft(mono[s:s + SR] * np.hanning(SR)))[sel]
        np.add.at(prof, pc.astype(int), F)
    return prof / prof.sum()


def key(prof):
    res = []
    for k in range(12):
        res.append((np.corrcoef(prof, np.roll(MAJ, k))[0, 1], NAMES[k] + ' major'))
        res.append((np.corrcoef(prof, np.roll(MIN, k))[0, 1], NAMES[k] + ' minor'))
    res.sort(reverse=True)
    return res


out = {}
for p in sys.argv[1:]:
    x, _ = sf.read(p, dtype='float64')
    pr = chroma(x)
    ks = key(pr)
    eb = float(np.corrcoef(pr, np.roll(MAJ, 3))[0, 1])
    top = [NAMES[i] for i in np.argsort(pr)[::-1][:5]]
    out[p] = {'key_best': ks[0][1], 'key_best_r': round(float(ks[0][0]), 3), 'key_2nd': ks[1][1], 'key_2nd_r': round(float(ks[1][0]), 3),
              'eb_major_r': round(eb, 3), 'top_pitch_classes': top}
print(json.dumps(out, indent=1))
