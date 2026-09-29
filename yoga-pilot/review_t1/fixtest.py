import json,copy,sys,io,contextlib
sys.path.insert(0,'.')
import timing as TM
base=TM.load()
def variant(mods, add_karar=False):
    L=copy.deepcopy(base)
    for b in L['blocks']:
        for c in b['clips']:
            if c['id'] in mods: c['gapAfter']=dict(zip(('min','pref','max'),mods[c['id']]))
    if add_karar:
        ks=[b for b in L['blocks'] if b['id']=='A.kisa'][0]; ku=[b for b in L['blocks'] if b['id']=='A.uzun'][0]
        kar=[c for c in ku['clips'] if c['id']=='a.karar'][0]
        ks['clips'].append(copy.deepcopy(kar))
    return L
def run(L,label):
    res=TM.run_all(L); fails=[(k,pr,f) for k,c in res.items() for pr in ('lo','hi') for f in c[pr][1]]
    slack=[]
    for r in TM.RATES:
        for pr in ('lo','hi'):
            p=TM.plan(L,300,r,pr); S,g=TM.totals(TM.assemble(L,300,*TM.caps_for(L,300)[1:],p['sel'],p['inc']),L,r,TM.profile(pr,r))
            slack.append(round(300-S-g['min'],1))
    print(label,'fails:',len(fails),fails[:3],'5-min slack (s) per rate/prof:',slack)
closing={'k.otur':(8,8,11),'k.bekle':(12,12,16),'k.gerin':(7,7,9)}
run(base,'BASE')
run(variant(closing),'CLOSING gaps')
nums={('c2.n%02d'%i):(4.5,5.0,5.5) for i in range(2,11)}
run(variant({**closing,**nums}),'CLOSING+locked countdown')
run(variant(closing,add_karar=True),'CLOSING+a.karar in A.kisa')
run(variant({'k.otur':(7,7,10),'k.bekle':(11,11,15)}),'otur7+bekle11')
run(variant({'k.otur':(7,7,10),'k.bekle':(11,11,15),**nums}),'otur7+bekle11+locked countdown 4.5/5/5.5')
nums2={('c2.n%02d'%i):(4.0,4.6,5.2) for i in range(2,11)}
run(variant({'k.otur':(7,7,10),'k.bekle':(11,11,15),**nums2}),'otur7+bekle11+locked countdown 4.0/4.6/5.2')
nums3={('c2.n%02d'%i):(3.5,5.0,6.0) for i in range(2,11)}
run(variant({'k.otur':(7,7,10),'k.bekle':(11,11,15),**nums3}),'otur7+bekle11+countdown 3.5/5.0/6.0')
for r in TM.RATES:
  for pr in ('lo','hi'):
    p=TM.plan(base,1800,r,pr); g=p['gaps']; S=p['speech']
    need=1800-0.25*(g['max']-g['pref'])-(S+g['pref'])
    print(r,pr,'30min: speech %.0f s, gaps pref %.0f max %.0f; content at pref = %.1f min; extra content needed for f<=0.25: %.0f s'%(S,g['pref'],g['max'],(S+g['pref'])/60,need))
comb={'k.otur':(7,7,10),'k.bekle':(11,11,15),**nums3,'c2.x.kendin':(40,50,60)}
Lc=variant(comb)
run(Lc,'COMBINED (otur7,bekle11,countdown 3.5/5/6, c2.x.kendin 40/50/60)')
for r in TM.RATES:
  for pr in ('lo','hi'):
    p=TM.plan(Lc,1800,r,pr); print(r,pr,'30min f=%.2f windows'%p['f'],[round(e['gap']) for e in p['events'] if e['clip'].get('window')])
def add_kolay(L,gap=(4,4,6)):
    ks=[b for b in L['blocks'] if b['id']=='A.kisa'][0]
    c={'id':'a.kolay','text':'Gevşemek bugün kolay gelmeyebilir; bu da olur.','tier':'required','syllables':16,'gapAfter':dict(zip(('min','pref','max'),gap)),'tags':{'texture':'varis','safety':'control'},'phase':'Varış'}
    import timing as T; assert T.syllables(c['text'])==16
    ks['clips'].append(c); return L
print()
Lk=add_kolay(variant({'k.otur':(7,7,10),'k.bekle':(11,11,15)}))
run(Lk,'a.kolay in A.kisa + otur7/bekle11')
Lk2=add_kolay(variant({'k.otur':(7,7,10),'k.bekle':(11,11,15),'c2.dikkat':(4,9,13),'c2.birak':(5,9,13),'c1.k1':(4,7,10),'br.k2':(4,8,12)}))
run(Lk2,'... + mins c2.dikkat4 c2.birak5 c1.k1 4 br.k2 4')
Lk3=add_kolay(variant({'k.otur':(7,7,10),'k.bekle':(11,11,15)}))
for b in Lk3['blocks']:
    for c in b['clips']:
        if c['id']=='c2.n05': c['tier']='optional'; c['fillRank']=100
        if c['id']=='c2.n06': c['requires']=['c2.n05']
run(Lk3,'a.kolay + otur7/bekle11 + c2.n05 optional rank100')
print()
Lp=variant({'k.otur':(7,7,10),'k.bekle':(11,11,15),**nums3,'c2.x.kendin':(40,50,60)})
rr={'c2.geri':250,'c2.yer':260}
for b in Lp['blocks']:
    for c in b['clips']:
        if c['id'] in rr: c['fillRank']=rr[c['id']]
        if c.get('fillGroup')=='el': c['fillRank']=270
run(Lp,'COMBINED + reranks c2.geri250 c2.yer260 el270')
for r in TM.RATES:
  for pr in ('lo','hi'):
    row=[]
    for m in (7,8,9,10):
      p=TM.plan(Lp,m*60,r,pr); row.append('%d:%d clips f=%.2f %s'%(m,len(p['events']),p['f'],p['mode']))
    print(r,pr,' | '.join(row))
print()
Lf=variant({'k.otur':(7,7,10),'k.bekle':(11,11,15),**nums3,'c2.x.kendin':(50,55,60)})
run(Lf,'FINAL (otur7/7/10, bekle11/11/15, c2.n02-n10 3.5/5/6, c2.x.kendin 50/55/60)')
for r in TM.RATES:
  for pr in ('lo','hi'):
    p=TM.plan(Lf,1800,r,pr); print(r,pr,'30min f=%.2f'%p['f'],'windows',[round(e['gap']) for e in p['events'] if e['clip'].get('window')], 'first ext minute', next(m for m in range(5,31) if any(e['clip']['id']=='c2.x.kendin' for e in TM.plan(Lf,m*60,r,pr)['events'])))
