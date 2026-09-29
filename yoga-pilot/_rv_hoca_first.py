import sys
import os; sys.path.insert(0,'/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/pilot')
import timing as tm
L=tm.load()
keys=['c2.akis','c2.durak','c2.sayac','c2.n10','c1.tekrar','n1.birak','c3.zemin','c4.pencere','c4.acele','c4.adim','c4.tas1','k.sesler','k.zaman','c2.x.ritim','c2.alt','a.karar','c1.kacirma','c2.birak','br.orta','c4.pencere','c5.pencere','c2.x.kendin','k.yandakal','a.agirlik','c4.gelmezse','c2.yer','c3.agir']
for rate in (5.2,5.6,6.6):
  for prof in ('lo','hi'):
    first={}
    for T in range(5,31):
      p=tm.plan(L,T*60,rate,prof)
      ids={ev['clip']['id'] for ev in p['events']}
      for k in keys:
        if k in ids and k not in first: first[k]=T
    print(rate,prof,{k:first.get(k) for k in keys})
