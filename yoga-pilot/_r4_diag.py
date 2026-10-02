import sys
sys.path.insert(0, '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/pilot')
import timing
L = timing.load()
def dens(p):
    best = (0, 0)
    w = 0.0
    while w + 60 <= p['total'] + 1e-6:
        syl = 0.0
        for ev in p['events']:
            for s0, s1, sy in timing.speech_spans(ev):
                ov = max(0.0, min(w + 60, s1) - max(w, s0))
                if ov > 0:
                    syl += sy * ov / (s1 - s0)
        if syl > best[0]:
            best = (syl, w)
        w += 1.0
    return best
for rate, pr in ((5.2, 'hi'), (5.6, 'hi'), (5.6, 'lo'), (6.6, 'lo')):
    p = timing.plan(L, 300, rate, pr)
    syl, w = dens(p)
    print(rate, pr, 'dens %.0f at %.0f' % (syl, w), 'slack %.1f' % (300 - p['speech'] - p['gaps']['min']), p['mode'], round(p['f'], 2))
    for ev in p['events']:
        if ev['end'] > w and ev['start'] < w + 60:
            print('   %6.1f %-12s %3d  gap %.1f  %s' % (ev['start'], ev['clip']['id'], ev['clip']['syllables'], ev['gap'], ev['clip']['text'][:70]))
