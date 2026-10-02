# Independent checker (round-2 timing review). Does NOT import timing.py's duration/pause/syllable code.
import json, re, random, sys, math
P='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/pilot/'
L=json.load(open(P+'ders2.lesson.json',encoding='utf-8'))
VOW='aeıioöuüâîûAEIİOÖUÜÂÎÛ'
def syl(t): return len(re.findall('['+VOW+']',t))
PROF={'lo':dict(sent=.17,comma=.05,semi=.12,ell=.32),'hi':dict(sent=.87,comma=.38,semi=.60,ell=1.53)}
def pauses(text,prof,scale):
    # tokenise punctuation; ignore trailing run of punctuation/quotes
    t=text.rstrip(' "”’.!?…')
    t=t.replace('...','…')
    n=dict(sent=0,comma=0,semi=0,ell=0)
    for ch in t:
        if ch=='…': n['ell']+=1
        elif ch in '.!?': n['sent']+=1
        elif ch==',': n['comma']+=1
        elif ch in ';:—': n['semi']+=1
    return sum(n[k]*PROF[prof][k]*scale for k in n)
def dur(c,rate,prof):
    sc=1.25 if rate==5.2 else 1.0
    edge=0.15 if c.get('carrier') else 0.31
    return syl(c['text'])/rate+pauses(c['text'],prof,sc)+edge
allc={}
for b in L['blocks']:
    for c in b['clips']: allc[c['id']]=(b['id'],c)
# 1. syllable field check
bad=[(i,c['syllables'],syl(c['text'])) for i,(b,c) in allc.items() if c['syllables']!=syl(c['text'])]
for ex in L['extras'].values():
    for c in ex['clips']:
        if c['syllables']!=syl(c['text']): bad.append((c['id'],c['syllables'],syl(c['text'])))
for car in L['carriers']:
    if car['syllables']!=syl(car['text']): bad.append((car['id'],car['syllables'],syl(car['text'])))
    # carrier text vs items
    items=[allc[i][1]['text'].strip(' .…').lower() for i in car['items']]
    parts=[p.strip(' .').lower() for p in re.split('…',car['text']) if p.strip(' .')]
    if items!=parts: print('CARRIER TEXT MISMATCH',car['id'],items,parts)
for i,(b,c) in allc.items():
    for a in c.get('alternates') or []:
        if a['syllables']!=syl(a['text']): bad.append((i+'/alt',a['syllables'],syl(a['text'])))
digits=[i for i,(b,c) in allc.items() if re.search(r'\d',c['text'])]
print('syllable mismatches:',bad,' digits in text:',digits)
print('total unique syllables blocks:',sum(c['syllables'] for b,c in allc.values()))
# 2. clip length at 6.6 hi and all rates
worst=sorted(((dur(c,r,'hi'),i,r) for i,(b,c) in allc.items() for r in (5.2,5.6,6.6)),reverse=True)[:6]
print('longest clips (hi):',[(round(d,1),i,r) for d,i,r in worst])
for ex in L['extras'].values():
    print(ex['id'],'longest', max((round(dur(c,6.6,'hi'),1),c['id']) for c in ex['clips']))
for car in L['carriers']:
    d=syl(car['text'])/5.2+pauses(car['text'],'hi',1.25)+0.31
    if d>12: print('carrier gen length @5.2hi',car['id'],round(d,1),'s')

# 3. independent planner + timeline
blocks={b['id']:b for b in L['blocks']}
A=[b for b in L['blocks'] if b['kind']=='arrival'][0]; K=[b for b in L['blocks'] if b['kind']=='closing'][0]
cores=[b for b in L['blocks'] if b['kind']=='core']
bridges=[b for b in L['blocks'] if b['kind']=='bridge']
def seq_for(T,sel,inc):
    out=[]
    def take(b):
        for c in b['clips']:
            if c['tier']=='required':
                if c.get('minTarget') is not None and T<c['minTarget']: continue
                out.append((b['id'],c))
            elif c['id'] in inc: out.append((b['id'],c))
    take(A)
    for b in sorted([blocks[s] for s in sel],key=lambda b:b['playOrder']):
        for br in bridges:
            if br['placement'].get('before')==b['id']: take(br)
        take(b)
        for br in bridges:
            if br['placement'].get('after')==b['id']: take(br)
    take(K)
    res=[]
    for k,(bid,c) in enumerate(out):
        g=c['gapAfter']
        if c.get('pairGap') and k+1<len(out) and out[k+1][1]['id']==c['pairWith']: g=c['pairGap']
        res.append((bid,c,g))
    return res
def tot(seq,rate,prof,lv):
    S=sum(dur(c,rate,prof) for _,c,_ in seq)
    gm={x:L['leadIn'][x]+sum(g[x] for _,_,g in seq) for x in('min','pref','max')}
    if lv=='cap': return S+gm['pref']+0.5*(gm['max']-gm['pref'])
    if lv=='half': return S+gm['min']+0.5*(gm['pref']-gm['min'])
    return S+gm[lv]
def incs():
    it=[(b['entryRank'],0,'B',b['id']) for b in cores if b['priority']>1]
    grp={}
    for b in L['blocks']:
        if b['kind'] in('core','arrival','closing'):
            for c in b['clips']:
                if c['tier']!='required': grp.setdefault((b['id'],c.get('fillGroup') or c['id']),[]).append(c)
    for (bid,k),cs in grp.items(): it.append((min(c['fillRank'] for c in cs),1,'G',(bid,[c['id'] for c in cs])))
    return sorted(it,key=lambda x:(x[0],x[1]))
def myplan(T,rate,prof):
    sel=[b['id'] for b in cores if b['priority']==1]; inc=set()
    req={c['id'] for b in L['blocks'] for c in b['clips'] if c['tier']=='required'}
    for r,_,kind,pl in incs():
        if kind=='B':
            s2=sel+[pl]
            ok=tot(seq_for(T,s2,inc),rate,prof,'pref')<=T or (tot(seq_for(T,sel,inc),rate,prof,'cap')<T and tot(seq_for(T,s2,inc),rate,prof,'half')<=T)
            if ok: sel=s2
            else: break
        else:
            bid,ids=pl
            if bid not in sel and blocks[bid]['kind']=='core': break
            cm={c['id']:c for c in blocks[bid]['clips']}
            if any(q not in (inc|set(ids)|req) for i in ids for q in cm[i].get('requires',[])): break
            i2=inc|set(ids)
            ok=tot(seq_for(T,sel,i2),rate,prof,'pref')<=T or (tot(seq_for(T,sel,inc),rate,prof,'cap')<T and tot(seq_for(T,sel,i2),rate,prof,'half')<=T)
            if ok: inc=i2
            else: break
    seq=seq_for(T,sel,inc)
    S=sum(dur(c,rate,prof) for _,c,_ in seq)
    gm={x:L['leadIn'][x]+sum(g[x] for _,_,g in seq) for x in('min','pref','max')}
    R=T-S
    if R<=gm['pref']: f=(R-gm['min'])/(gm['pref']-gm['min']); lv=('min','pref')
    else: f=(R-gm['pref'])/(gm['max']-gm['pref']); lv=('pref','max')
    gv=lambda g: g[lv[0]]+f*(g[lv[1]]-g[lv[0]])
    t=gv(L['leadIn']); ev=[]
    for bid,c,g in seq:
        d=dur(c,rate,prof); ev.append(dict(b=bid,id=c['id'],s=t,e=t+d,gap=gv(g),g=g,c=c)); t+=d+gv(g)
    return dict(T=T,rate=rate,prof=prof,ev=ev,total=t,f=f,mode=lv,S=S,sel=sel)
sys.path.insert(0,P); import timing
random.seed(20260929)
print()
for rate in (5.2,5.6,6.6):
    mins=sorted(random.sample(range(5,31),3))
    for m in mins:
        for prof in ('lo','hi'):
            mp=myplan(m*60,rate,prof); tp=timing.plan(timing.load(),m*60,rate,prof)
            ids1=[e['id'] for e in mp['ev']]; ids2=[e['clip']['id'] for e in tp['events']]
            dmax=max(abs(a['s']-b['start']) for a,b in zip(mp['ev'],tp['events'])) if ids1==ids2 else None
            gapok=all(e['g']['min']-1e-6<=e['gap']<=e['g']['max']+1e-6 for e in mp['ev'])
            ovl=all(mp['ev'][i]['s']>=mp['ev'][i-1]['e'] for i in range(1,len(mp['ev'])))
            print('%.1f %2d %s same_ids=%s n=%d maxΔstart=%s total=%.2f f=%.3f %s gaps_in_bounds=%s no_overlap=%s speech=%.1f%%'%(rate,m,prof,ids1==ids2,len(ids1),None if dmax is None else round(dmax,4),mp['total'],mp['f'],mp['mode'],gapok,ovl,100*mp['S']/(m*60)))
