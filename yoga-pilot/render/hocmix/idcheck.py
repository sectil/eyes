"""hoc: seçimdeki parçalar zaten v3 kuralıyla işlendi (selection-hoc-*.json 'processing'). reprocess_v3 kaynak eşlemesiyle
yeniden işleyip seçim dosyasıyla örnek örnek aynı mı diye bakar (yazmaz). Sonuç: _hocmix/idcheck.json"""
import json, sys
from multiprocessing import Pool
import numpy as np, soundfile as sf
R = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
sys.path.insert(0, R + '/tools')
import audio, reprocess_v3 as rp
rp.SEX['hoc'] = 'm'

def w(a):
    pid, e = a
    try:
        src = rp.source_of('hoc', pid, e)
    except SystemExit as ex:
        return pid, {'source': None, 'err': str(ex)}
    x, sr = audio.load(src)
    y, rep = audio.process_array(x, sr, 'm', e['micro'], e['ref_rms_db'], level_rule='v3', peak_mode='auto')
    old, _ = sf.read(e['file'], dtype='float64')
    same = len(old) == len(y) and float(np.max(np.abs(old - y))) <= 1e-6
    return pid, {'source': src, 'same': same, 'len_old': len(old), 'len_new': len(y),
                 'maxdiff': (float(np.max(np.abs(old - y))) if len(old) == len(y) else None), 'rep': rep}

P = rp.selection_pieces('hoc')
with Pool(4) as pool:
    res = dict(pool.map(w, list(P.items()), chunksize=1))
out = {pid: {k: v for k, v in res[pid].items() if k != 'rep'} for pid in P}
json.dump({'n': len(P), 'same': sum(1 for v in out.values() if v.get('same')), 'pieces': out,
           'reps': {pid: res[pid].get('rep') for pid in P}}, open(R + '/_hocmix/idcheck.json', 'w'), ensure_ascii=False, indent=1, default=str)
print(len(P), sum(1 for v in out.values() if v.get('same')))
for pid, v in out.items():
    if not v.get('same'):
        print(pid, v)
