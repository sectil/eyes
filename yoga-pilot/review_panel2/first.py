import sys
sys.path.insert(0,'/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/pilot')
import timing as tm
L=tm.load()
keys=['c2.alt','c1.tekrar','c1.kacirma','c2.birak','c2.sayac','a.karar','c4.pencere','c5.pencere','c3.agir','k.sesler','k.zaman']
for rate in (5.2,5.6,6.6):
  for prof in ('lo','hi'):
    first={}
    for T in range(5,31):
      p=tm.plan(L,T*60,rate,prof)
      ids={ev['clip']['id'] for ev in p['events']}
      for k in keys:
        if k in ids and k not in first: first[k]=T
    print(rate,prof,first)
# 5-min micro gaps
for rate,prof in ((5.2,'hi'),(6.6,'lo')):
  p=tm.plan(L,300,rate,prof)
  print(rate,prof,[(e['clip']['id'],round(e['dur'],2),round(e['gap'],2)) for e in p['events'] if e['block']=='C1'])
