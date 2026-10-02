import sys, re
sys.path.insert(0, '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/pilot')
import timing as tm
L = tm.load()
AB = re.compile(r'(?<=\w)y?[ae]bil', re.I)
def n_ab(t): return len(AB.findall(t))
worst = {}
for rate in tm.RATES:
    for prof in ('lo','hi'):
        for m in tm.MINUTES:
            p = tm.plan(L, m*60, rate, prof)
            evs = [(ev['start'], n_ab(ev['clip']['text']), ev['clip']['id']) for ev in p['events']]
            best = (0, None)
            for i,(s,_,_) in enumerate(evs):
                tot = sum(n for (t,n,_) in evs if s <= t < s+60)
                ids = [c for (t,n,c) in evs if s <= t < s+60 and n]
                if tot > best[0]: best = (tot, ids)
            worst[(rate,prof,m)] = best
import collections
c = collections.Counter(v[0] for v in worst.values())
print(sorted(c.items()))
for k in [(5.6,'hi',5),(5.6,'hi',12),(5.6,'hi',20),(5.6,'hi',30)]:
    print(k, worst[k])
print('--- windows starting after 200 s, per plan max')
for k in [(5.2,'hi',30),(5.6,'hi',30),(6.6,'lo',30),(6.6,'lo',15),(5.2,'hi',15)]:
    p = tm.plan(L, k[2]*60, k[0], k[1])
    evs = [(ev['start'], n_ab(ev['clip']['text']), ev['clip']['id']) for ev in p['events']]
    res=[]
    for i,(s,_,_) in enumerate(evs):
        if s < 200: continue
        tot = sum(n for (t,n,_) in evs if s <= t < s+60)
        if tot > 3:
            res.append((round(s), tot, [c for (t,n,c) in evs if s <= t < s+60 and n]))
    print(k, len(res))
    for r in res[:12]: print('   ', r)
