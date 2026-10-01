#!/usr/bin/env python3
"""synth_tone.py — ALTERNATIVE return tone (not ElevenLabs), written because the generated sfx tone measures as a
rough/buzzy note (50 Hz amplitude modulation, sidebands at +-50/+-100 Hz only 6-11 dB under the 699.5 Hz carrier,
i.e. ~85-100 % AM depth) instead of the requested soft chime. Design (VARSAYIM): soft felt-mallet chime, no AM,
fundamental f0 (default D5 = 587.33 Hz: tonic of D major, 4th of A major, 5th of G -> consonant with the measured
EL beds; NOT checked against the Dalga (B) bed key), partials 2x (-12 dB), 3x (-22 dB), 4.2x (-32 dB, faint bell
shimmer), higher partials decay faster; 20 ms raised-cosine attack; tau 0.8 s; 300 ms raised-cosine fade to zero
at 4.0 s; identical L/R (mono-safe); peak -6 dBFS (level is the mixer's job).
usage: synth_tone.py [f0_hz] [out.wav]"""
import sys, numpy as np, soundfile as sf, os
SR = 44100; DUR = 4.0
f0 = float(sys.argv[1]) if len(sys.argv) > 1 else 587.33
out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), '..', '..', 'common', 'donus.synth-D5.wav')
t = np.arange(int(SR * DUR)) / SR
y = np.zeros_like(t)
for mult, gdb, tau in [(1.0, 0, 0.80), (2.0, -12, 0.45), (3.0, -22, 0.30), (4.2, -32, 0.20)]:
    y += 10 ** (gdb / 20) * np.sin(2 * np.pi * f0 * mult * t) * np.exp(-t / tau)
na, nr = int(0.020 * SR), int(0.300 * SR)
g = np.ones_like(t)
g[:na] = 0.5 - 0.5 * np.cos(np.pi * np.arange(na) / na)
g[-nr:] = 0.5 + 0.5 * np.cos(np.pi * np.arange(nr) / nr)
y *= g
y *= 10 ** (-6 / 20) / np.abs(y).max()
sf.write(out, np.stack([y, y], 1).astype(np.float32), SR, subtype='FLOAT')
print(os.path.abspath(out), 'f0', f0)
