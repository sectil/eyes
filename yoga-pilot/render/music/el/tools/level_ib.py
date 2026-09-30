#!/usr/bin/env python3
"""level_ib.py — yavaş düzey dengeleyici (VARSAYIM; ilk bölüm). Parçanın 3 sn kısa süreli yüksekliği (BS.1770 K ağırlıklı,
0,1 sn adım) 30 sn'lik kayan ortancasına k oranında yaklaştırılır: g(t) = −k·(ST(t) − med30(t)), 1 sn'lik düzeltmeyle
yumuşatılır ve örnek hızına doğrusal aradeğerlenir. Tını ve ton değişmez; yalnız yavaş kabarmalar küçülür.
Kullanım: level_ib.py girdi.wav çıktı.wav [k=0.6]"""
import sys, json, numpy as np, soundfile as sf
from scipy.ndimage import median_filter, uniform_filter1d
sys.path.insert(0, '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render/tools')
import mix as M
src, dst = sys.argv[1], sys.argv[2]
k = float(sys.argv[3]) if len(sys.argv) > 3 else 0.6
x, sr = sf.read(src, dtype='float64', always_2d=True)
tc, st = M.st_curve(M.kpower(x), 3.0, 0.1)
st = np.where(np.isfinite(st), st, -80)
med = median_filter(st, size=301, mode='nearest')
g = -k * (st - med)
g = uniform_filter1d(g, 10, mode='nearest')
ts = np.arange(len(x)) / sr
gs = np.interp(ts, tc, g)
y = x * (10 ** (gs / 20))[:, None]
sf.write(dst, y.astype(np.float32), sr, subtype='FLOAT')
tc2, st2 = M.st_curve(M.kpower(y), 3.0, 0.1)
d1 = st[10:] - st[:-10]
d2 = st2[10:] - st2[:-10]
print(json.dumps({'src': src, 'dst': dst, 'k': k, 'gain_db_range': [round(float(g.min()), 2), round(float(g.max()), 2)],
                  'max_rise_before': round(float(d1[100:-100].max()), 2), 'max_rise_after': round(float(d2[100:-100].max()), 2),
                  'lufs_before': round(M.integrated(x), 2), 'lufs_after': round(M.integrated(y), 2)}, ensure_ascii=False))
