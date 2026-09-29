exec(open('/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/review_r2_timing/indep.py').read().split('random.seed')[0])
def sp(p,a,b): return sum(max(0,min(b,e['e'])-max(a,e['s'])) for e in p['ev'])
for r in (5.2,6.6):
  for pf in ('lo','hi'):
    p=myplan(1800,r,pf)
    rows=[]
    for a in range(0,1800-300+1,30):
      rows.append((a,100*sp(p,a,a+300)/300))
    lo=min(rows,key=lambda x:x[1])
    # minutes by minute share
    mins=[round(100*sp(p,60*i,60*i+60)/60) for i in range(30)]
    print(r,pf,'min 5-min window share %.1f%% at %d:%02d'%(lo[1],lo[0]//60,lo[0]%60),' per-minute %:',mins)
