import sys, os
P='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/pilot'
sys.path.insert(0,P); os.chdir(P)
import timing
L=timing.load()
def worst(p, deep=False):
    T=p['total']; evs=p['events']; best=(0,None,None)
    w=0.0
    while w+60<=T+1e-6:
        a,b=w,w+60; syl=0; ph=set(); ids=[]
        for ev in evs:
            ov=max(0,min(b,ev['end'])-max(a,ev['start']))
            if ov>0:
                syl+=ev['clip']['syllables']*ov/ev['dur']; ph.add(ev['clip']['phase']); ids.append(ev['clip']['id'])
        if (not deep or ph=={'Derin'}) and syl>best[0]: best=(syl,a,ids)
        w+=1
    return best
for a in sys.argv[1:]:
    m,r,pf=a.split(',')
    p=timing.plan(L,int(m)*60,float(r),pf)
    s,a0,ids=worst(p); print(m,r,pf,'ALL %.0f at %.0f'%(s,a0),ids)
    s,a0,ids=worst(p,True); print(m,r,pf,'DEEP %.0f at %.0f'%(s,a0) if ids else 'no deep',ids)
