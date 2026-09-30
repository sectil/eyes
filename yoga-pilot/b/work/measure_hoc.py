# Nefona Hoca (hoc) ölçülmüş parça süreleri: render/out/plan-hoc.json'dan (v3/calc/measure.py yöntemiyle)
import json, sys
Y='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga'
sys.path.insert(0, Y+'/pilot')
import timing as T
L = T.with_scene(T.load(Y+'/pilot/ders2.lesson.json'), 'orman')
out = {}
old = json.load(open('/home/user/eyes/yoga-pilot/v3/calc/measured_durs.json'))
out.update(old)
p = json.load(open(Y+'/render/out/plan-hoc.json'))
meas = {}
syl = 0; sp = 0.0; ph = {}
for e in p['events']:
    d = [s['end'] - s['start'] for s in e['subs']]
    meas[e['clip']] = d
    for s, dd in zip(e['subs'], d):
        n = T.syllables(s['text']); syl += n; sp += dd
        a = ph.setdefault(e['phase'], [0, 0.0]); a[0] += n; a[1] += dd
out['hoc'] = meas
print('hoc parçalar', sum(len(v) for v in meas.values()), 'birim', len(meas), 'hece', syl, 'konuşma', round(sp, 1), 'brüt', round(syl / sp, 2))
for k, (n, dd) in ph.items(): print('  ', k, n, round(dd, 1), round(n / dd, 2))
for v in ('nes', 'hak', 'hoc'):
    for prof in ('hi', 'lo'):
        pm = T.plan(L, 900, 5.6, prof)
        mm = {e['clip']['id']: [s['end'] - s['start'] for s in e['subs']] for e in pm['events']}
        common = [k for k in out[v] if k in mm and len(mm[k]) == len(out[v][k])]
        r = sum(sum(out[v][k]) for k in common) / sum(sum(mm[k]) for k in common)
        print(v, 'ölçülen/model(5,6 %s)' % prof, round(r, 3), 'ortak birim', len(common))
json.dump(out, open(Y+'/b/ders2/measured_durs.v3.json', 'w'), ensure_ascii=False)
