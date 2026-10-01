exec(open('indep.py').read().split('random.seed')[0])
def mmss(x): return '%d:%02d'%(int(x)//60,int(x)%60)
for m in (5,30):
  p=myplan(m*60,5.6,'hi')
  print(m,[(e['id'],mmss(e['s'])) for e in p['ev'] if e['c']['tags'].get('key')])
  if m==30:
    print([(e['id'],mmss(e['s'])) for e in p['ev'] if e['id'] in ('c1.cerceve','c2.dikkat','c2.x.kendin','br.k2','c3.agir','br.orta','c4.yer','c4.pencere','c5.basla','c5.pencere','n2.hatirla','k.anahtar3')])
# entry minutes per block/window per rate/profile
for r in (5.2,5.6,6.6):
  for pf in ('lo','hi'):
    first={}
    for m in range(5,31):
      p=myplan(m*60,r,pf)
      for e in p['ev']:
        for key in (e['b'],e['id'] if e['c'].get('window') else None):
          if key and key not in first: first[key]=m
    print(r,pf,{k:v for k,v in first.items() if v>5})
