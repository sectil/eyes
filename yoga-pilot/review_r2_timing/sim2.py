import sys, copy
sys.path.insert(0,'/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/pilot')
import timing
L=timing.load()
def clip(L,cid):
    for b in L['blocks']:
        for c in b['clips']:
            if c['id']==cid: return c
for label,mod in (('rank85',lambda c: c.update(fillRank=85)),('required gap5/6/9',lambda c: (c.update(tier='required',required=True,gapAfter={'min':5.0,'pref':6.0,'max':9.0}),c.pop('fillRank',None)))):
    M=copy.deepcopy(L); mod(clip(M,'c2.alt'))
    res=timing.run_all(M)
    bad=[(k,pr,c[pr][1][:1]) for k,c in res.items() for pr in('lo','hi') if c[pr][1]]
    print(label,'fails',len(bad),bad[:4])
    for r in timing.RATES:
        for pn in ('lo','hi'):
            p=timing.plan(M,300,r,pn); p6=timing.plan(M,360,r,pn)
            ids6={e['clip']['id'] for e in p6['events']}
            print('  ',r,pn,'5-min slack %.1f'%(300-(p['speech']+p['gaps']['min'])),'6min alt=%s count=%s'%('c2.alt' in ids6,'c2.sayac' in ids6))
