from bagimsiz import *
import statistics, collections
res={}
for rate in (5.2,5.6,6.6):
    for prof in ('lo','hi'):
        for m in range(5,31):
            res[(rate,prof,m)]=myplan(m*60,rate,prof)
print('== speech share per anchor (clip dur incl. TTS pauses) / voiced-only (syll/rate) ==')
for m in (5,10,15,20,25,30):
    row=[]
    for rate in (5.2,5.6,6.6):
        for prof in ('lo','hi'):
            p=res[(rate,prof,m)]; T=m*60
            voiced=sum(e['c']['syllables']/rate for e in p['ev'])
            row.append(f"{rate}{prof[0]} {100*p['S']/T:4.1f}/{100*voiced/T:4.1f}")
    print(f"{m:2d} dk: "+' | '.join(row))
print('== plateau minutes (same clip set as previous minute) ==')
for rate in (5.2,5.6,6.6):
    for prof in ('lo','hi'):
        pl=[m for m in range(6,31) if set(res[(rate,prof,m)]['ids'])==set(res[(rate,prof,m-1)]['ids'])]
        full=len({c['id'] for b in L['blocks'] for c in b['clips']})
        print(rate,prof,'plateaus at',pl,'| clips at 30:',len(res[(rate,prof,30)]['ids']),'of',full)
print('== missing at 30 min ==')
allids=[c['id'] for b in L['blocks'] for c in b['clips']]
for rate in (5.2,5.6,6.6):
    for prof in ('lo','hi'):
        miss=[i for i in allids if i not in res[(rate,prof,30)]['ids'] and not i.startswith('c1.x0')==False or (i not in res[(rate,prof,30)]['ids'])]
        print(rate,prof,sorted(set(miss)))
print('== windows: first minute each window appears; longest gap overall; back-to-back big silences ==')
for rate in (5.2,5.6,6.6):
    for prof in ('lo','hi'):
        first={}
        worst_pair=0; bb=[]
        for m in range(5,31):
            p=res[(rate,prof,m)]
            for e in p['ev']:
                if e['c'].get('window') and e['id'] not in first: first[e['id']]=m
            ev=p['ev']
            for a,b in zip(ev,ev[1:]):
                if a['gap']>=30 and b['gap']>=30: bb.append((m,a['id'],round(a['gap']),b['id'],round(b['gap'])))
            if max(e['gap'] for e in ev)>=60: bb.append((m,'GAP>=60'))
        print(rate,prof,first,'back-to-back>=30:',bb[:3])
print('== closing length (k.anahtar3 start → end) min/max; lead-in ==')
ks=[m*60-[e for e in p['ev'] if e['id']=='k.anahtar3'][0]['s'] for (r,pr,m),p in res.items()]
kd=[m*60-[e for e in p['ev'] if e['id']=='k.donus'][0]['s'] for (r,pr,m),p in res.items()]
print('K from anahtar3: %.1f–%.1f s ; from k.donus: %.1f–%.1f s'%(min(ks),max(ks),min(kd),max(kd)))
print('== clip max durations (sentence clips), by rate/profile; carriers ==')
for rate in (5.2,5.6,6.6):
    for prof in ('lo','hi'):
        ds=sorted(((dur(c,rate,prof),c['id']) for b in L['blocks'] for c in b['clips']),reverse=True)[:3]
        cars=sorted(((car['syllables']/rate+pauses(car['text'],rate,prof)+TM['edgeSec'],car['id']) for car in L['carriers']),reverse=True)[:2]
        print(rate,prof,[(round(d,1),i) for d,i in ds],'carriers',[(round(d,1),i) for d,i in cars])
