import sys, copy
sys.path.insert(0,'/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/pilot')
import timing
L=timing.load()
def setgap(L,cid,g):
    for b in L['blocks']:
        for c in b['clips']:
            if c['id']==cid: c['gapAfter']=dict(zip(('min','pref','max'),g))
    for ex in L['extras'].values():
        for c in ex['clips']:
            if c['id']==cid: c['gapAfter']=dict(zip(('min','pref','max'),g))
for name,ch in (('yandakal',[('k.yandakal',(12,12,15))]),('goz',[('k.goz',(9,9,12))]),('stop',[('d.kalk',(13,13,14)),('d.goz',(3,3,4)),('d.bekle',(1,1,2))])):
    M=copy.deepcopy(L)
    for cid,g in ch: setgap(M,cid,g)
    res=timing.run_all(M); bad=[(k,pr,c[pr][1][:1]) for k,c in res.items() for pr in('lo','hi') if c[pr][1]]
    print(name,len(bad),bad[:3],timing.lint_text(M)[0])
