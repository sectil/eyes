import sys, json
sys.path.insert(0, '/home/user/eyes/yoga-pilot/pilot')
import timing as tm
L = tm.with_scene(tm.load(), 'orman')
U = json.load(open('/home/user/eyes/yoga-pilot/render/units.json'))['units']
cov = set()
for u in U:
    cov.add(u['id'])
    for it in u.get('items', []) or []:
        cov.add(it if isinstance(it, str) else it.get('id'))
# all clips across all minutes 5..30, both scenes? just orman
allc = {}
for T in range(300, 1801, 60):
    for rate, prof in ((5.2,'hi'),(5.6,'hi'),(5.6,'lo'),(6.6,'lo'),(6.6,'hi')):
        p = tm.plan(L, T, rate, prof)
        for ev in p['events']:
            allc[ev['clip']['id']] = ev['clip']
miss = {k:c for k,c in allc.items() if k not in cov}
def txt(c): return c.get('tts') or c.get('text') or ''
print('clips used 5-30 dk (orman):', len(allc), 'not in 15-dk units:', len(miss))
print('chars of missing clips (text field):', sum(len(txt(c)) for c in miss.values()), 'syll', sum(c.get('syllables',0) for c in miss.values()))
print('sample keys', list(next(iter(miss.values())).keys()))
# lesson-level total syllables of all clips in lesson
tot = 0; totc=0
for b in L['blocks']:
    for c in b['clips']:
        tot += c.get('syllables',0); totc += len(txt(c))
print('lesson all clips syll', tot, 'chars', totc)
for v in ('A','K'):
    pass
p = tm.plan(L, 300, 5.6, 'hi')
a = [ev for ev in p['events'] if ev['block']=='A']; k=[ev for ev in p['events'] if ev['block']=='K']
print('5dk A span', round(a[0]['start'],1), round(a[-1]['end']+a[-1]['gap'],1), 'speech', round(sum(e['speech'] for e in a),1), 'K span', round(k[0]['start'],1), round(k[-1]['end']+k[-1]['gap'],1), 'speech', round(sum(e['speech'] for e in k),1))
