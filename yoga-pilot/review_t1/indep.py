# Independent re-implementation (reviewer). Written from ders2.script.md §2.2-2.3 text, not from timing.py.
import json, random, re, sys
L = json.load(open('/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/pilot/ders2.lesson.json'))
V = 'aeıioöuüâîûAEIİOÖUÜÂÎÛ'
def syl(t): return sum(t.count(v) for v in V)
# 1. syllable verification
bad=[]; allc={}
for b in L['blocks']:
    for c in b['clips']:
        allc.setdefault(c['id'],c)
        if syl(c['text'])!=c['syllables']: bad.append((c['id'],c['text'],c['syllables'],syl(c['text'])))
        if re.search(r'\d',c['text']): bad.append(('DIGIT',c['id'],c['text']))
for k,ex in L['extras'].items():
    for c in ex['clips']:
        if syl(c['text'])!=c['syllables']: bad.append((c['id'],c['text'],c['syllables'],syl(c['text'])))
print('syllable mismatches:',bad)
# carrier text vs items
for car in L['carriers']:
    ids=car.get('items') or car.get('clips')
    print('carrier',car['id'],'items',len(ids) if ids else None, '| syl carrier', syl(car['text']))
    break
PROF={'lo':dict(s=.17,c=.05,x=.12,e=.32),'hi':dict(s=.87,c=.38,x=.60,e=1.53)}
def dur(c,rate,pn):
    sc=1.25 if rate==5.2 else 1.0
    p={k:v*sc for k,v in PROF[pn].items()}
    t=c['text'].strip()
    t=t.rstrip(' .…!?"”')
    n_e=t.count('…'); t2=t.replace('…',' ')
    n_s=len(re.findall(r'[.!?]',t2)); n_c=t2.count(','); n_x=sum(t2.count(ch) for ch in ';:—')
    return c['syllables']/rate + (0.15 if c.get('carrier') else 0.31) + n_e*p['e']+n_s*p['s']+n_c*p['c']+n_x*p['x']
B={b['id']:b for b in L['blocks']}
def seq_for(T,sel,inc):
    cap='short' if T<=720 else 'long'
    A=[b for b in L['blocks'] if b['kind']=='arrival' and b['variant']==cap][0]
    K=[b for b in L['blocks'] if b['kind']=='closing' and b['variant']==cap][0]
    order=[A]
    for b in sorted([B[i] for i in sel],key=lambda b:b['playOrder']):
        order += [br for br in L['blocks'] if br['kind']=='bridge' and br['placement'].get('before')==b['id']]
        order.append(b)
        order += [br for br in L['blocks'] if br['kind']=='bridge' and br['placement'].get('after')==b['id']]
    order.append(K)
    out=[]
    for b in order:
        for c in b['clips']:
            if c['tier']=='required' and (c.get('minTarget') or 0)<=T: out.append(c)
            elif c['tier']!='required' and c['id'] in inc: out.append(c)
    return out
def tot(seq,rate,pn,lv): return L['leadIn'][lv]+sum(dur(c,rate,pn)+c['gapAfter'][lv] for c in seq)
def myplan(T,rate,pn):
    sel=[b['id'] for b in L['blocks'] if b['kind']=='core' and b['priority']==1]
    inc=set()
    # increments: blocks by entryRank, clip groups by min fillRank (block entries first on tie)
    incs=[(b['entryRank'],0,('B',b['id'])) for b in L['blocks'] if b['kind']=='core' and b['priority']>1]
    grp={}
    for b in L['blocks']:
        if b['kind']!='core': continue
        for c in b['clips']:
            if c['tier']!='required': grp.setdefault((b['id'],c.get('fillGroup') or c['id']),[]).append(c)
    for (bid,g),cs in grp.items(): incs.append((min(c['fillRank'] for c in cs),1,('G',bid,[c['id'] for c in cs])))
    incs.sort(key=lambda x:(x[0],x[1]))
    for _,_,it in incs:
        if it[0]=='B':
            s2,i2=sel+[it[1]],inc
            if any(r not in sel for r in B[it[1]].get('requiresBlocks',[])): break
        else:
            if it[1] not in sel: break
            s2,i2=sel,inc|set(it[2])
            req_ok=all(r in i2 or allc[r]['tier']=='required' for i in it[2] for r in (allc[i].get('requires') or []))
            if not req_ok: break
        cur=seq_for(T,sel,inc); new=seq_for(T,s2,i2)
        if tot(new,rate,pn,'pref')<=T or (tot(cur,rate,pn,'max')<T and tot(new,rate,pn,'min')<=T):
            sel,inc=s2,i2
        else: break
    seq=seq_for(T,sel,inc)
    S=sum(dur(c,rate,pn) for c in seq); R=T-S
    g={lv:L['leadIn'][lv]+sum(c['gapAfter'][lv] for c in seq) for lv in ('min','pref','max')}
    if g['min']<=R<=g['pref']: f=(R-g['min'])/(g['pref']-g['min']); lo,hi='min','pref'
    elif g['pref']<R<=g['max']: f=(R-g['pref'])/(g['max']-g['pref']); lo,hi='pref','max'
    else: raise SystemExit('infeasible %s %s %s'%(T,rate,pn))
    gv=lambda d:d[lo]+f*(d[hi]-d[lo])
    t=gv(L['leadIn']); ev=[]
    for c in seq:
        d=dur(c,rate,pn); ev.append(dict(id=c['id'],s=t,e=t+d,d=d,gap=gv(c['gapAfter']),c=c)); t+=d+gv(c['gapAfter'])
    return dict(ev=ev,total=t,S=S,sel=sel,inc=inc,f=f,mode=lo+'>'+hi)
sys.path.insert(0,'/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/review_t1')
import timing as TM
random.seed(20260929)
print('\n== random-minute cross-check vs timing.py ==')
for rate in (5.2,5.6,6.6):
    for m in sorted(random.sample(range(5,31),3)):
        for pn in ('lo','hi'):
            a=myplan(m*60,rate,pn); b=TM.plan(TM.load(),m*60,rate,pn)
            ida=[e['id'] for e in a['ev']]; idb=[e['clip']['id'] for e in b['events']]
            gd=max(abs(x['gap']-y['gap']) for x,y in zip(a['ev'],b['events'])) if ida==idb else None
            print(rate,m,pn,'same_seq=',ida==idb,'n=',len(ida),'total=%.2f/%.2f'%(a['total'],b['total']),'maxgapdiff=',gd,'f=%.3f/%.3f'%(a['f'],b['f']))
