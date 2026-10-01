import sys, collections
sys.path.insert(0,'/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/pilot')
import timing
L=timing.load()
orig=timing.clip_dur
for k in (0.90,0.95,1.05,1.10):
    timing.clip_dur=lambda c,r,p,k=k: orig(c,r,p)*k
    res=timing.run_all(L)
    cnt=collections.Counter(); ex={}
    nfail=0
    for key,c in res.items():
        if c['lo'][1] or c['hi'][1]: nfail+=1
        for pr in ('lo','hi'):
            for f in c[pr][1]:
                t=f.split(':')[0][:40]; cnt[t]+=1; ex.setdefault(t,(key,pr,f))
    print('scale',k,'failing cases',nfail,'/78'); 
    for t,n in cnt.most_common(8): print('   ',n,ex[t])
timing.clip_dur=orig
