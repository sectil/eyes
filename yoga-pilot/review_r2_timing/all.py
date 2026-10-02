exec(open('/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/review_r2_timing/indep.py').read().split('random.seed')[0])
import collections
plans={(r,m,pf):myplan(m*60,r,pf) for r in (5.2,5.6,6.6) for m in range(5,31) for pf in('lo','hi')}
# subset
bad=[]
for r in (5.2,5.6,6.6):
  for pf in('lo','hi'):
    for m in range(6,31):
      a=[e['id'] for e in plans[(r,m-1,pf)]['ev']]; b=[e['id'] for e in plans[(r,m,pf)]['ev']]
      if not set(a)<=set(b): bad.append((r,pf,m,set(a)-set(b)))
      # order preserved
      bb=[x for x in b if x in set(a)]
      if bb!=a: bad.append(('order',r,pf,m))
print('subset violations',bad)
# cross-profile: is lo(T) subset of hi(T)? (voices differ; informational)
# speech share per anchor
print('\nanchor speech share (speech incl. in-clip pauses) | voiced-only share | time in gaps>=10s | #gaps>=10s | K length(from k.anahtar3) | K from k.donus')
for m in (5,10,15,20,30):
  for r in (5.2,5.6,6.6):
    for pf in('lo','hi'):
      p=plans[(r,m,pf)]; T=m*60
      voiced=sum(syl(e['c']['text'])/r for e in p['ev'])
      long_=sum(e['gap'] for e in p['ev'] if e['gap']>=10); nlong=sum(1 for e in p['ev'] if e['gap']>=10)
      k3=[e for e in p['ev'] if e['id']=='k.anahtar3'][0]['s']; kd=[e for e in p['ev'] if e['id']=='k.donus'][0]['s']
      print('%2d %.1f %s  %5.1f%%  %5.1f%%  %5.1f%%  %3d  K=%5.1fs  fromDonus=%5.1fs'%(m,r,pf,100*p['S']/T,100*voiced/T,100*long_/T,nlong,T-k3,T-kd))
# per-block speech share at 30
print('\nper-block speech share @30')
for r,pf in ((5.2,'hi'),(6.6,'lo')):
  p=plans[(r,30,pf)]; agg=collections.OrderedDict()
  for e in p['ev']:
    a=agg.setdefault(e['b'],[0,0]); a[0]+=e['e']-e['s']; a[1]+=e['e']-e['s']+e['gap']
  print(r,pf,' '.join('%s %.0fs/%.0f%%'%(k,v[1],100*v[0]/v[1]) for k,v in agg.items()))
# consecutive long silences
print('\nlong-silence adjacency')
worst=[]
for k,p in plans.items():
  ev=p['ev']
  for i in range(len(ev)-1):
    if ev[i]['gap']>=60 and ev[i+1]['gap']>=60: worst.append(('b2b60',k,ev[i]['id']))
  # two gaps >=30 separated by <30 s of speech+gaps
  big=[(e['e'],e['e']+e['gap'],e['id']) for e in ev if e['gap']>=30]
  for x,y in zip(big,big[1:]):
    if y[0]-x[1]<60: worst.append(('near',k,x[2],y[2],round(y[0]-x[1],1)))
  # max gap
print(worst[:20], len(worst))
mx=max((max(e['gap'] for e in p['ev']),k) for k,p in plans.items()); print('max gap',mx)
# longest span with speech share <10% (sliding 120s)
def low_run(p,win=120,thr=0.10):
  T=p['total'];best=0;w=0
  ev=p['ev']
  while w+win<=T:
    sp=sum(max(0,min(w+win,e['e'])-max(w,e['s'])) for e in ev)
    if sp/win<thr: best+=0
    w+=5
  return None
# action gaps: minimum (gap + following silence until next clip) across all plans
print('\naction clip gaps (min over all 156 plans)')
act=collections.defaultdict(lambda:[1e9,None])
for k,p in plans.items():
  for i,e in enumerate(p['ev']):
    if e['c']['tags'].get('action') or e['id'] in('n2.hatirla','n1.soyle','k.yandakal','c2.kal','c1.k1','c4.yerles','c4.tas2','k.oda.ayrinti'):
      if e['gap']<act[e['id']][0]: act[e['id']]=[e['gap'],k]
for i,v in act.items(): print('  %-14s min gap %.1f at %s | %s'%(i,v[0],v[1],allc[i][1]['text'][:70]))
# 5-min slack at min gaps
print()
for r in (5.2,5.6,6.6):
  for pf in('lo','hi'):
    seq=seq_for(300,[b['id'] for b in cores if b['priority']==1],set())
    print('5-min slack',r,pf,'%.1f'%(300-tot(seq,r,pf,'min')), ' pct of content-> +%.1f%% speech overrun tolerated'%(100*(300-tot(seq,r,pf,'min'))/sum(dur(c,r,pf) for _,c,_ in seq)))
