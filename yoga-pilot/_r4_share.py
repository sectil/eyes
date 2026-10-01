import sys
sys.path.insert(0, '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/pilot')
import timing
L = timing.load()
for m in (15, 18, 20, 22, 25, 28, 30):
    row = []
    for rate in timing.RATES:
        for pr in ('lo', 'hi'):
            p = timing.plan(L, m*60, rate, pr)
            sh = {}
            for b in ('C2', 'C3', 'C4', 'C5'):
                evs = [e for e in p['events'] if e['block'] == b]
                if not evs:
                    continue
                span = sum(e['dur'] + e['gap'] for e in evs)
                sp = sum(e['dur'] for e in evs)
                sh[b] = sp / span
            row.append('%.1f%s ' % (rate, pr[0]) + ' '.join('%s %.2f' % (k, v) for k, v in sh.items()))
    print(m, ' | '.join(row))
