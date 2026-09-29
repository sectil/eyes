exec(open('/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/review_r2_timing/indep.py').read().split('random.seed')[0])
for k,ex in L['extras'].items():
  for r in (5.2,5.6,6.6):
    for pf in ('lo','hi'):
      print(k,r,pf,'%.1f'%sum(dur(c,r,pf)+c['gapAfter']['pref'] for c in ex['clips']))
# plateau runs
plans={(r,m,pf):myplan(m*60,r,pf) for r in (5.2,5.6,6.6) for m in range(5,31) for pf in('lo','hi')}
for r in (5.2,5.6,6.6):
  for pf in ('lo','hi'):
    s=[len(plans[(r,m,pf)]['ev']) for m in range(5,31)]
    runs=[m for m in range(6,31) if s[m-5]==s[m-6]]
    print('plateau minutes (same content as previous minute)',r,pf,runs)
# practice share (C-blocks + bridges) per anchor, and A/N/K split at 5
for m in (5,6,7,10):
  for r in (5.2,6.6):
    for pf in ('lo','hi'):
      p=plans[(r,m,pf)];agg={}
      for e in p['ev']:
        key='A' if e['b']=='A' else 'K' if e['b']=='K' else 'N' if e['b'] in('N1','N2') else 'core'
        agg[key]=agg.get(key,0)+e['e']-e['s']+e['gap']
      agg['A']+=p['ev'][0]['s']
      print(m,r,pf,{k:round(v) for k,v in agg.items()})
# first 60s density at 5 min
