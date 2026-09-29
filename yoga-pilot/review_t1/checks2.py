import sys; sys.path.insert(0,'.')
from indep import myplan, L, dur, allc, syl
import itertools
# carriers
for car in L['carriers']:
    items=car['items']; s=sum(allc[i]['syllables'] for i in items)
    if s!=syl(car['text']): print('carrier syl mismatch',car['id'],s,syl(car['text']))
print('carriers checked',len(L['carriers']))
RATES=(5.2,5.6,6.6)
plans={(r,p,m):myplan(m*60,r,p) for r in RATES for p in ('lo','hi') for m in range(5,31)}
print('\n== subset violations (clips in T not in T+1) ==')
for r in RATES:
  for p in ('lo','hi'):
    for m in range(5,30):
      a={e['id'] for e in plans[(r,p,m)]['ev']}; b={e['id'] for e in plans[(r,p,m+1)]['ev']}
      if a-b: print(r,p,'%d->%d'%(m,m+1),'dropped:',sorted(a-b))
print('\n== subset over 5..30 per rate/prof: is plan(5) subset of plan(30)? and plateau minutes (identical clip set) ==')
for r in RATES:
  for p in ('lo','hi'):
    plate=[m for m in range(6,31) if {e['id'] for e in plans[(r,p,m)]['ev']}=={e['id'] for e in plans[(r,p,m-1)]['ev']}]
    print(r,p,'identical-to-previous minutes:',plate)
print('\n== anchors: speech share, windows, max clip, closing ==')
for r in RATES:
  for p in ('lo','hi'):
    for m in (5,10,15,20,30):
      P=plans[(r,p,m)]; ev=P['ev']; T=m*60
      win=[(e['id'],round(e['gap'],1),round(e['e'],1)) for e in ev if e['c'].get('window')]
      nonwin_gaps=[e['gap'] for e in ev if not e['c'].get('window')]
      mx=max(ev,key=lambda e:e['d'])
      # closing duration: from first clip of closing cap (k.anahtar3) start to end
      k0=[e for e in ev if e['id']=='k.anahtar3'][0]; kd=[e for e in ev if e['id']=='k.donus'][0]
      print('%.1f %s %2d | speech %.1f%% | non-window silence %.1f%% | windows %s | maxclip %s %.1fs | closing from k.anahtar3 %.0fs, from k.donus %.0fs | f=%.2f %s'%(
        r,p,m,100*P['S']/T,100*sum(nonwin_gaps)/T,win,mx['id'],mx['d'],T-k0['s'],T-kd['s'],P['f'],P['mode']))
print('\n== max clip dur at 6.6 (both profiles) over all unique clips ==')
for p in ('lo','hi'):
    d=sorted(((dur(c,6.6,p),cid) for cid,c in allc.items()),reverse=True)[:3]; print(p,[(round(x,1),y) for x,y in d])
print('\n== window spacing: min time between end of one window and start of next; speech between ==')
worst=None
for k,P in plans.items():
    ev=P['ev']; W=[i for i,e in enumerate(ev) if e['c'].get('window')]
    for a,b in zip(W,W[1:]):
        gapstart=ev[a]['e']; gapend=ev[a]['e']+ev[a]['gap']; nxt=ev[b]['e']
        between=nxt-gapend; sp=sum(ev[i]['d'] for i in range(a+1,b+1))
        if worst is None or between<worst[0]: worst=(between,sp,k,ev[a]['id'],ev[b]['id'],ev[a]['gap'],ev[b]['gap'])
print('closest window pair:',worst)
print('\n== any non-window gap >= 20s? ==', max((e['gap'],k,e['id']) for k,P in plans.items() for e in P['ev'] if not e['c'].get('window')))
