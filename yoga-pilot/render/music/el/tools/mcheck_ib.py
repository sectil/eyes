#!/usr/bin/env python3
"""mcheck_ib.py — müzik parçalarının SPEC.v3 §7.1–7.2 ölçümleri tek tabloda (ücretsiz). Kullanım: mcheck_ib.py tür:dosya ..."""
import sys, json, numpy as np, soundfile as sf
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import manalyze as MA, clash_ib as C
sys.path.insert(0, '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render/tools')
import mix as M
NAMES = C.NAMES
MAJ = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
MIN = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
out = {}
chs = {}
for arg in sys.argv[1:]:
    kind, f = arg.split(':', 1)
    a, x = MA.analyze(f, kind)
    pr = C.chroma(x); chs[f] = pr
    ks = sorted([(np.corrcoef(pr, np.roll(MAJ, k))[0, 1], NAMES[k] + ' maj') for k in range(12)] +
                [(np.corrcoef(pr, np.roll(MIN, k))[0, 1], NAMES[k] + ' min') for k in range(12)], reverse=True)
    tc, st = M.st_curve(M.kpower(x), 3.0, 0.1); d = st[10:] - st[:-10]; m = (tc[:-10] > 10) & (tc[:-10] < len(x) / 44100 - 10)
    fl, t, L = MA.flatness(x, edge=0.0); med = np.median(L[np.isfinite(L)]); ok = np.where(np.abs(L - med) <= 3.0)[0]
    out[f.split('/')[-1]] = {'kind': kind, 'key': ks[0][1], 'key_r': round(float(ks[0][0]), 3), 'lufs': a['lufs_i'],
        'tp': a['true_peak_dbtp'], 'flat_lu': (a.get('flatness') or {}).get('spread_p5_p95_lu'),
        'flat': (a.get('flatness') or {}).get('verdict'), 'pulse': a['onsets']['pulse_clarity'],
        'strong_onsets_min': a['onsets']['strong_onsets_per_min'], 'clicks': a['clicks_hf']['count'],
        'centroid': a['spectrum']['centroid_hz'], 'lt300': a['spectrum']['share_lt300'],
        'max_rise_db_s': round(float(d[m].max()), 2) if m.any() else None, 'body': [round(float(t[ok[0]]), 1), round(float(t[ok[-1]] + 3.0), 1)],
        'loop_seam': a.get('loop_seam', {}).get('verdict') if isinstance(a.get('loop_seam'), dict) else None}
fs = list(chs)
cl = {}
for i in range(len(fs)):
    for j in range(i + 1, len(fs)):
        cl['%s|%s' % (fs[i].split('/')[-1], fs[j].split('/')[-1])] = round(float(C.clash(chs[fs[i]], chs[fs[j]])), 3)
for k, v in out.items():
    print('%-22s %s' % (k, json.dumps(v, ensure_ascii=False)))
print('clash', json.dumps(cl))
