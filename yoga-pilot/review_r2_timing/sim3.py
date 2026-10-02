import sys, copy
sys.path.insert(0,'/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/pilot')
import timing
L=timing.load()
def clip(L,cid):
    for b in L['blocks']:
        for c in b['clips']:
            if c['id']==cid: return c
M=copy.deepcopy(L); c=clip(M,'c2.alt'); t="Bu sana zor gelirse, dikkatini ellerine vermen de olur."
c.update(fillRank=85,text=t,syllables=timing.syllables(t))
def setgap(L,cid,g):
    for b in L['blocks']:
        for c in b['clips']:
            if c['id']==cid: c['gapAfter']=dict(zip(('min','pref','max'),g))
    for ex in L['extras'].values():
        for c in ex['clips']:
            if c['id']==cid: c['gapAfter']=dict(zip(('min','pref','max'),g))
res=timing.run_all(M); bad=[(k,pr,c[pr][1][:1]) for k,c in res.items() for pr in('lo','hi') if c[pr][1]]
print('alt only: fails',len(bad),bad[:4]); print(timing.lint_text(M)[0])
setgap(M,'k.yandakal',(12,12,15)); setgap(M,'k.goz',(9,9,12)); setgap(M,'d.kalk',(13,13,14)); setgap(M,'d.goz',(3,3,4)); setgap(M,'d.bekle',(1,1,2))
res=timing.run_all(M); bad=[(k,pr,c[pr][1][:1]) for k,c in res.items() for pr in('lo','hi') if c[pr][1]]
print('all fixes: fails',len(bad),bad[:4]); print(timing.lint_text(M)[0])
for r in timing.RATES:
  for pn in ('lo','hi'):
    p=timing.plan(M,300,r,pn); print(r,pn,'5-min slack %.1f'%(300-(p['speech']+p['gaps']['min'])))
