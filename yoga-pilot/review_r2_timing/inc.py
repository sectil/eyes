import sys
sys.path.insert(0,'/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/pilot')
import timing
L=timing.load(); bm=timing.block_map(L)
for rate,pn in ((5.2,'hi'),(6.6,'lo')):
  pr=timing.profile(pn,rate)
  print(rate,pn)
  for rank,_,kind,pl in timing.increments(L):
    if kind=='block':
      b=bm[pl]; cs=[c for c in b['clips'] if c['tier']=='required']
      extra=[]
      for br in L['blocks']:
        if br['kind']=='bridge' and br['placement'].get('before')==pl: cs=cs+br['clips']
    else:
      bid,key,ids=pl; cs=[c for c in bm[bid]['clips'] if c['id'] in ids]
    s=sum(timing.clip_dur(c,rate,pr)+c['gapAfter']['pref'] for c in cs)
    if rank>=900 or s>45: print('  %5s %-6s %-22s %6.1f s'%(rank,kind,pl if kind=='block' else pl[1],s))
  p=timing.plan(L,1800,rate,pn); print('  stop at 30:',p['stop'])
  for m in range(20,31):
    p=timing.plan(L,m*60,rate,pn); print('   ',m,p['stop'])
