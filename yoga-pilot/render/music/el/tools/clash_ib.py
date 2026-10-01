#!/usr/bin/env python3
"""clash_ib.py — ton ailesi uyumu (SPEC.v3 §7.1). Pilotun "clash" endeksinin kodu depoda yok; burada yeniden kuruldu:
clash ≈ 0,812 × ½ Σ_k∈{±1, 6} (a·roll(b,k) + b·roll(a,k)) (yarım ses ve tritone çapraz örtüşmesi; a, b mkey.py kroma
profilleri). Pilotun raw/compat.json'daki 36 çiftine en büyük sapma 0,015, ilinti 0,999 (VARSAYIM: yaklaşık endeks).
Kullanım: clash_ib.py aday.wav aile1.wav aile2.wav ... [--shift -1,0,1]"""
import sys, json, numpy as np, soundfile as sf
from scipy.signal import resample_poly
sys.path.insert(0, __file__.rsplit('/', 1)[0])
SR = 44100
NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']


def chroma(x):
    mono = x.mean(1) if x.ndim == 2 else x
    f = np.fft.rfftfreq(SR, 1 / SR)
    sel = (f >= 55) & (f <= 2000)
    pc = (np.round(12 * np.log2(f[sel] / 440.0)) + 9) % 12
    prof = np.zeros(12)
    for s in range(0, len(mono) - SR, SR):
        F = np.abs(np.fft.rfft(mono[s:s + SR] * np.hanning(SR)))[sel]
        np.add.at(prof, pc.astype(int), F)
    return prof / prof.sum()


def clash(a, b):
    s = 0.0
    for k in (1, -1, 6):
        s += a @ np.roll(b, k) + b @ np.roll(a, k)
    return 0.812 * s / 2


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    shifts = [0]
    if '--shift' in sys.argv:
        shifts = [int(v) for v in sys.argv[sys.argv.index('--shift') + 1].split(',')]
        args = [a for a in args if a != sys.argv[sys.argv.index('--shift') + 1]]
    cand, fam = args[0], args[1:]
    xc, _ = sf.read(cand, dtype='float64', always_2d=True)
    ca = chroma(xc)
    fc = {f: chroma(sf.read(f, dtype='float64', always_2d=True)[0]) for f in fam}
    out = {}
    for st in shifts:
        a = np.roll(ca, st)
        out['%+d' % st] = {f.split('/')[-1]: round(float(clash(a, b)), 3) for f, b in fc.items()}
        out['%+d' % st]['_max'] = max(out['%+d' % st].values())
    print(json.dumps(out, indent=1))
