exec(open('indep.py').read().split('random.seed')[0])
want=['c2.alt','a.karar','c2.sayac','c2.n10','c1.tekrar','c1.kacirma','k.yandakal','a.konfor','c3.zemin','c4.pencere','k.sesler','n1.birak','n2.dilek','c1.s02','c1.s06','c1.s15']
for r in (5.2,5.6,6.6):
  for pf in ('lo','hi'):
    first={}
    for m in range(5,31):
      ids={e['id'] for e in myplan(m*60,r,pf)['ev']}
      for w in want:
        if w in ids and w not in first: first[w]=m
    print(r,pf,first)
