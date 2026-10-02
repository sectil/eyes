import sys
sys.path.insert(0,'/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/pilot')
import timing
L=timing.load()
res=timing.run_all(L)
print('pass', sum(1 for c in res.values() if not c['lo'][1] and not c['hi'][1]), '/', len(res))
tf,_=timing.lint_text(L); print('lint fails',tf)
# within-clip rate (syll / clip dur) for non-micro clips at 6.6 lo, deep phase
for rate,prof in [(6.6,'lo'),(5.6,'hi'),(5.2,'hi')]:
    pr=timing.profile(prof,rate)
    rs=[]
    for b in L['blocks']:
        for c in b['clips']:
            if c.get('carrier'): continue
            d=timing.clip_dur(c,rate,pr)-timing.EDGE
            rs.append((c['syllables']/d,c['id'],c.get('phase')))
    rs.sort(reverse=True)
    deep=[r for r in rs if r[2]=='Derin']
    print(rate,prof,'max within-clip',[ (round(a,2),b) for a,b,_ in rs[:4]],'deep median',round(sorted(r[0] for r in deep)[len(deep)//2],2))
# longest run without a full sentence (non-carrier) in 30 min and 15 min
for T in (900,1800):
  for rate,prof in [(5.6,'hi'),(6.6,'lo')]:
    p=timing.plan(L,T,rate,prof)
    last=0;best=(0,None)
    for e in p['events']:
        if not e['clip'].get('carrier'):
            if e['start']-last>best[0]: best=(e['start']-last,last)
            last=e['end']
    print(T,rate,prof,'longest stretch with no full sentence: %.0f s from %d:%02d'%(best[0],best[1]//60,best[1]%60))
# Derin gaps variety in 30 min: consecutive sentence+gap cycles 9-17s
p=timing.plan(L,1800,5.6,'hi')
import statistics
g=[e['gap'] for e in p['events'] if e['clip'].get('phase')=='Derin' and not e['clip'].get('carrier') and not e['clip'].get('window')]
print('Derin non-window gaps n=%d mean %.1f sd %.1f min %.1f max %.1f'%(len(g),statistics.mean(g),statistics.pstdev(g),min(g),max(g)))
# first 5-min: a.karar present?
for T in (300,600,720,780):
    p=timing.plan(L,T,5.6,'hi'); ids=[e['clip']['id'] for e in p['events']]
    print(T//60,'a.karar' in ids,'br.orta' in ids,'c4.yer' in ids)
