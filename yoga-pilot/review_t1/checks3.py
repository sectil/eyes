import sys; sys.path.insert(0,'.')
import io,contextlib
with contextlib.redirect_stdout(io.StringIO()):
    from indep import myplan, L
import timing as TM
RATES=(5.2,5.6,6.6)
per={} ; bp={}; kb={}; ko={}
for r in RATES:
  for p in ('lo','hi'):
    for m in range(5,31):
      P=myplan(m*60,r,p)
      for e in P['ev']:
        if e['id'].startswith('c2.n') and e['id']!='c2.n01': per.setdefault('num',[]).append((e['d']+e['gap'],r,p,m))
        if e['c'].get('carrier') and e['id'].startswith('c1.') : bp.setdefault('bp',[]).append((e['d']+e['gap'],r,p,m))
        if e['id'] in ('k.bekle','k.otur','k.yan','k.gerin','a.ortu','a.yastik'): kb.setdefault(e['id'],[]).append(round(e['gap'],1))
for k,v in per.items(): print('countdown number period s: min',min(v),'max',max(v))
for k,v in bp.items(): print('body-point period s: min',min(v),'max',max(v))
for k,v in kb.items(): print(k,'gap range',min(v),max(v))
# end-of-lesson: time from k.bekle start to end
for r in RATES:
  for p in ('lo','hi'):
    for m in (5,30):
      P=myplan(m*60,r,p); e=[x for x in P['ev'] if x['id']=='k.bekle'][0]
      print(r,p,m,'k.bekle end -> lesson end %.1fs'%(m*60-e['e']))
# texture runs < 20 min
print('longest texture run per minute (5.6 hi / 6.6 lo):')
for r,p in ((5.6,'hi'),(6.6,'lo'),(5.2,'hi')):
  out=[]
  for m in range(5,31):
    tp=TM.plan(TM.load(),m*60,r,p); runs=TM.texture_runs(tp); lg=max(runs,key=lambda x:x[2]-x[1])
    out.append('%d:%s %.0f'%(m,lg[0],lg[2]-lg[1]))
  print(r,p,' | '.join(out))
