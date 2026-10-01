import sys
sys.path.insert(0, '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/pilot')
import timing
L = timing.load()
p = timing.plan(L, 17 * 60, 5.6, 'lo')
by = {}
for ev in p['events']:
    c = ev['clip']
    if c.get('carrier'):
        continue
    v = c['syllables'] / max(1, c['sentences'])
    by.setdefault(c['phase'], []).append((round(v, 1), c['id']))
for ph, xs in by.items():
    print(ph, round(sum(x for x, _ in xs) / len(xs), 2), sorted(xs, reverse=True))
