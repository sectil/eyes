import json, sys, statistics
sys.path.insert(0, '.')
import timing as T
L = T.load('ders2.lesson.json')
Ls = T.with_scene(L, 'orman')
res = {}
for v in ('nes', 'hak'):
    p = json.load(open('/home/user/eyes/yoga-pilot/render/out/plan-%s.json' % v))
    ev = p['events']
    syl = 0; sp = 0.0
    per_phase = {}
    meas = {}
    for e in ev:
        d = [s['end'] - s['start'] for s in e['subs']]
        txts = [s['text'] for s in e['subs']]
        meas[e['clip']] = (txts, d)
        for t, dd in zip(txts, d):
            n = T.syllables(t)
            syl += n; sp += dd
            ph = e['phase']
            a = per_phase.setdefault(ph, [0, 0.0])
            a[0] += n; a[1] += dd
    print(v, 'syllables', syl, 'speech', round(sp, 1), 'brut hece/sn (uç payı ve iç duraklama dahil)', round(syl / sp, 2))
    for ph, (n, dd) in per_phase.items():
        print('   ', ph, n, round(dd, 1), round(n / dd, 2))
    # model on same clips at 5.6 hi
    pm = T.plan(Ls, 900, 5.6, 'hi')
    mm = {}
    for e in pm['events']:
        mm[e['clip']['id']] = [s['end'] - s['start'] for s in e['subs']]
    common = [k for k in meas if k in mm]
    r = sum(sum(meas[k][1]) for k in common) / sum(sum(mm[k]) for k in common)
    print('   measured/model(5.6hi) speech ratio on common clips:', round(r, 3), len(common))
    pl = T.plan(Ls, 900, 5.6, 'lo')
    ml = {e['clip']['id']: [s['end'] - s['start'] for s in e['subs']] for e in pl['events']}
    c2 = [k for k in meas if k in ml]
    r2 = sum(sum(meas[k][1]) for k in c2) / sum(sum(ml[k]) for k in c2)
    print('   measured/model(5.6lo) ratio:', round(r2, 3))
    res[v] = meas
json.dump({v: {k: res[v][k][1] for k in res[v]} for v in res}, open('measured_durs.json', 'w'))
