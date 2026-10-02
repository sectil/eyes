import sys, json
sys.path.insert(0, '/home/user/eyes/yoga-pilot/pilot')
import timing as tm
L = tm.load()
Ls = tm.with_scene(L, 'orman')
U = json.load(open('/home/user/eyes/yoga-pilot/render/units.json'))['units']
uid = {u['id'] for u in U}
# map unit -> covered clip ids (carrier items)
cov = set()
for u in U:
    cov.add(u['id'])
    for it in u.get('items', []) or []:
        cov.add(it if isinstance(it, str) else it.get('id'))
tot_units_chars = sum(len(u['tts']) for u in U)
print('units', len(U), 'chars', tot_units_chars, 'syll', sum(u.get('syllables',0) for u in U))
for T in (300, 420, 600, 900, 1200, 1800):
    p = tm.plan(Ls, T, 5.6, 'hi')
    ids = [ev['clip']['id'] for ev in p['events']]
    shorts = [ev['clip']['id'] for ev in p['events'] if ev['clip'].get('short') and T < ev['clip']['short'].get('belowSec', 0)]
    missing = [i for i in ids if i not in cov]
    chars = sum(len(ev['clip'].get('tts') or ev['clip'].get('text') or '') for ev in p['events'])
    print(T, p['status'], 'events', len(ids), 'speech', round(p['speech'],1), 'A', p['A'], 'K', p['K'], 'sel', p['sel'], 'short', shorts, 'missing', len(missing), missing[:40])
