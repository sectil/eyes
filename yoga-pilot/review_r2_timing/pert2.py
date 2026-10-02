import sys
sys.path.insert(0,'/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/pilot')
import timing
L=timing.load(); orig=timing.clip_dur
for k in (0.9,0.95,1.0,1.05,1.1):
    timing.clip_dur=lambda c,r,p,k=k: orig(c,r,p)*k
    worst=0; where=None
    for r in timing.RATES:
        for pn in ('lo','hi'):
            ids=[frozenset(ev['clip']['id'] for ev in timing.plan(L,m*60,r,pn)['events']) for m in range(19,31)]
            run=0
            for i in range(1,len(ids)):
                run=run+1 if ids[i]==ids[i-1] else 0
                if run>worst: worst,where=run,(r,pn,19+i)
            # which group blocks
    print(k,'longest plateau (minutes with same content as previous, >=20 min):',worst,where)
