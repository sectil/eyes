#!/usr/bin/env python3
"""keyharm.py — optional key-harmonised alternates (varispeed = band-limited resampling; pitch and duration change
together, no time-stretch artefacts). Measured keys (mkey.py, A440 tuning, bass pedal per 10 s) put 5 of 7 pieces in
the A/D/G family and only 2 near the requested E-flat family. The two outliers are moved 1 semitone into the majority:
  el-v-aday  Ab major -> A major : +1 semitone (x89/84 speed, 180 s -> 169.9 s)
  el-derin-b Eb major -> D major : -1 semitone (x84/89 speed, 240 s -> 254.3 s; slightly darker, matches the Derin brief)
89/84 = 1.059524 vs 2^(1/12) = 1.059463: error +0.1 cent. Originals untouched."""
import numpy as np, soundfile as sf, json, os
from scipy.signal import resample_poly
D = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
jobs = [('el-v-aday', +1, 'el-v-aday.keyA.wav'), ('el-derin-b', -1, 'el-derin-b.keyD.wav')]
out = {}
for name, st, dst in jobs:
    x, sr = sf.read(os.path.join(D, name + '.wav'), dtype='float64')
    up, down = (84, 89) if st > 0 else (89, 84)
    y = np.stack([resample_poly(x[:, c], up, down) for c in range(2)], 1)
    sf.write(os.path.join(D, dst), y.astype(np.float32), sr, subtype='FLOAT')
    out[dst] = {'from': name + '.wav', 'semitones': st, 'resample_up_down': [up, down],
                'cents_error': round(1200 * np.log2((down / up) if st > 0 else (up / down)) - 100 * abs(st), 3) * (1 if st > 0 else -1),
                'duration_s': round(len(y) / sr, 2)}
print(json.dumps(out, indent=1))
json.dump(out, open(os.path.join(D, 'raw', 'keyharm.json'), 'w'), indent=1)
