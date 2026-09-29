from bagimsiz import *
import statistics
for rate,prof in ((6.6,'lo'),(5.6,'hi'),(5.2,'hi')):
  for m in (20,30):
    p=myplan(m*60,rate,prof); ev=p['ev']
    bs={}
    for i,e in enumerate(ev):
        b=bs.setdefault(e['b'],[1e9,0,0,0]); b[0]=min(b[0],e['s']); b[1]=max(b[1],e['e']+e['gap']); b[2]+=e['d']; b[3]+=1
    print(rate,prof,m,'min: '+' | '.join(f"{k} {v[1]-v[0]:.0f}s {100*v[2]/(v[1]-v[0]):.0f}%" for k,v in bs.items()))
    # rolling 180s speech share, excluding windows' gap interval? report min over all and min excluding windows
    T=m*60; wins=[(e['e'],e['e']+e['gap']) for e in ev if e['c'].get('window')]
    def sp(a,b): return sum(max(0,min(b,e['e'])-max(a,e['s'])) for e in ev)
    lows=[]; w=0
    while w+180<=T:
        s=sp(w,w+180)/180; lows.append((s,w)); w+=5
    s,w=min(lows); print('   min 180s speech share %.0f%% at %d:%02d'%(100*s,w//60,w%60), ' ratio gap/dur in Derin sentence clips (median): %.1f'%statistics.median([e['gap']/e['d'] for e in ev if e['c']['phase']=='Derin' and not e['c'].get('carrier') and not e['c'].get('window')]))
