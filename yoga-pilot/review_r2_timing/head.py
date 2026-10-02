exec(open('/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/review_r2_timing/indep.py').read().split('random.seed')[0])
for r in (5.2,5.6,6.6):
  for pf in ('lo','hi'):
    p=myplan(1800,r,pf)
    g={x:L['leadIn'][x]+sum(e['g'][x] for e in p['ev']) for x in ('min','pref','max')}
    R=1800-p['S']; head=(g['pref']+0.30*(g['max']-g['pref']))-R
    print(r,pf,'speech %.0f s, pref gaps %.0f, max-pref %.0f, f=%.3f; speech may shrink by %.0f s (%.0f%%) before f>0.30'%(p['S'],g['pref'],g['max']-g['pref'],p['f'],head,100*head/p['S']))
# micro-clip share of timeline
for r in (5.2,6.6):
  p=myplan(1800,r,'hi'); n=sum(1 for e in p['ev'] if e['c'].get('carrier')); print('micro clips at 30',r,n)
  p=myplan(300,r,'hi'); n=sum(1 for e in p['ev'] if e['c'].get('carrier')); print('micro clips at 5',r,n)
