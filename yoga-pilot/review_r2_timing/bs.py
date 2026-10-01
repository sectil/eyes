exec(open('/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/review_r2_timing/indep.py').read().split('random.seed')[0])
for m in (5,10,15,20,30):
  p=myplan(m*60,5.6,'hi'); agg={}
  for e in p['ev']: agg[e['b']]=agg.get(e['b'],0)+e['e']-e['s']+e['gap']
  diffs=[]
  for b in L['blocks']:
    js=b['prefSec'][str(m)]; mine=agg.get(b['id'],0)
    if abs(js-mine)>0.2: diffs.append((b['id'],js,round(mine,1)))
  print(m,diffs)
# minSec / maxSec: all clips at min / max gaps?
for b in L['blocks']:
  pr=profile=None
  req=[c for c in b['clips'] if c['tier']=='required' and not c.get('minTarget')]
  allc_=b['clips']
  mn=sum(dur(c,5.6,'hi')+c['gapAfter']['min'] for c in req); mx=sum(dur(c,5.6,'hi')+c['gapAfter']['max'] for c in allc_)
  print(b['id'],b['minSec'],round(mn,1),b['maxSec'],round(mx,1))
