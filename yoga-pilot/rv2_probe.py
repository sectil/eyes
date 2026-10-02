import sys
sys.path.insert(0,'.')
import timing as tm
L=tm.load()
keys=['c2.alt','a.karar','c1.kacirma','c2.birak','br.orta','c4.pencere','c5.pencere','c2.x.kendin','k.yandakal','a.agirlik','c4.gelmezse','c2.yer','c3.agir']
for rate in (5.2,5.6,6.6):
  for prof in ('lo','hi'):
    first={}
    for T in range(5,31):
      p=tm.plan(L,T*60,rate,prof)
      ids={ev['clip']['id'] for ev in p['events']}
      for k in keys:
        if k in ids and k not in first: first[k]=T
    print(rate,prof,{k:first.get(k) for k in keys})
