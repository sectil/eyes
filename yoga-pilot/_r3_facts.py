import sys, os
P='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/pilot'
sys.path.insert(0,P); os.chdir(P)
import timing
L=timing.load()
plans={}
for r in timing.RATES:
    for pr in ('lo','hi'):
        for m in range(5,31):
            plans[(r,pr,m)]=timing.plan(L,m*60,r,pr)
def first(fn):
    ms=[]
    for r in timing.RATES:
        for pr in ('lo','hi'):
            for m in range(5,31):
                if fn(plans[(r,pr,m)]): ms.append(m); break
    return (min(ms),max(ms)) if ms else None
def has(i): return lambda p: i in [ev['clip']['id'] for ev in p['events']]
for i in ['br.k2','br.orta','c3.agir','c3.gelmezse','c3.sicak','c4.yer','c4.pencere','c4.adim','c4.koku','c4.yerles','c4.x.istemiyor','c4.tas1','c5.basla','c5.pencere','c2.yer','c2.alt','c2.sayac','c2.n10','c2.x.kendin','c2.durak','c2.x.ritim','a.agirlik','a.karar','a.konfor','a.x.kipir','c1.gecis.arka','c1.gecis.on','c1.x01','c1.t2','c1.s02','c1.s06','c1.s15','c1.b01','c1.f01','c1.f08','c1.f14','c1.w01','c1.tekrar','c1.kacirma','n1.birak','n2.dilek','n2.x.his','k.sesler','k.oda.ayrinti','k.zaman','k.yandakal','c4.iz','c4.acele','c4.geride','c4.donus1','c3.zemin','c3.nefeskadar','c3.x.ikisi1','c3.fincan','c3.pencere','c3.x.ikisi2','c5.genis','c5.x.dayanak','c4.x.donus2','c4.isik']:
    print('%-16s %s' % (i, first(has(i))))
# key times
for m in (5,6,7,10,14,15,16,17,18,20,25,30):
    p=plans[(5.6,'hi',m)]
    ks=[(ev['start'],ev['clip']['id']) for ev in p['events'] if ev['clip']['tags'].get('key')]
    print(m, [(round(s),i) for s,i in ks], 'gaps', [round(ks[j+1][0]-ks[j][0]) for j in range(len(ks)-1)])
# min key spacing across all plans
mn2=999; mn3=999
for k,p in plans.items():
    ks=[ev['start'] for ev in p['events'] if ev['clip']['tags'].get('key')]
    d=min(ks[j+1]-ks[j] for j in range(len(ks)-1))
    if len(ks)==2: mn2=min(mn2,d)
    else: mn3=min(mn3,d)
print('min spacing 2-pass', round(mn2,1), '3-pass', round(mn3,1))
# 5-min block durations
for r in timing.RATES:
    for pr in ('lo','hi'):
        bd=timing.block_durations(plans[(r,pr,5)])
        print(r,pr,{k:round(v,1) for k,v in bd.items()})
# minimal block durations across all plans
mins={}
for k,p in plans.items():
    for b,v in timing.block_durations(p).items():
        if b not in mins or v<mins[b][0]: mins[b]=(round(v,1),k)
print(mins)
seen=set()
for p in plans.values():
    seen |= {ev['clip']['id'] for ev in p['events']}
allids=[c['id'] for b in L['blocks'] for c in b['clips']]
print('never played:', [i for i in allids if i not in seen])
p30={pr:{r:{ev['clip']['id'] for ev in plans[(r,pr,30)]['events']} for r in timing.RATES} for pr in ('lo','hi')}
for pr in ('lo','hi'):
    for r in timing.RATES:
        print(pr, r, 'missing at 30:', [i for i in allids if i not in p30[pr][r]])
