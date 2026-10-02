import sys, copy
sys.path.insert(0,'/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/pilot')
import timing
L=timing.load()
def setgap(L,cid,g):
    n=0
    for b in L['blocks']:
        for c in b['clips']:
            if c['id']==cid: c['gapAfter']=dict(zip(('min','pref','max'),g)); n+=1
    for ex in L['extras'].values():
        for c in ex['clips']:
            if c['id']==cid: c['gapAfter']=dict(zip(('min','pref','max'),g)); n+=1
    assert n, cid
M=copy.deepcopy(L)
setgap(M,'k.yandakal',(12,12,15)); setgap(M,'k.goz',(9,9,12))
setgap(M,'d.kalk',(13,13,14)); setgap(M,'d.goz',(3,3,4)); setgap(M,'d.bekle',(1,1,2))
res=timing.run_all(M)
bad=[(k,pr,c[pr][1][:2]) for k,c in res.items() for pr in('lo','hi') if c[pr][1]]
print('fails',len(bad),bad[:5])
tf,out=timing.lint_text(M); print('lint fails',tf)
for key in ('quickClosing','stopReturn'):
    for r in timing.RATES:
        for pn in ('lo','hi'):
            pr=timing.profile(pn,r); ex=M['extras'][key]
            print(key,r,pn,round(sum(timing.clip_dur(c,r,pr)+c['gapAfter']['pref'] for c in ex['clips']),1))
# 5-min slack
for r in timing.RATES:
  for pn in ('lo','hi'):
    p=timing.plan(M,300,r,pn); print('5min',r,pn,'slack', round(300-(p['speech']+p['gaps']['min']),1), p['mode'], round(p['f'],2))
