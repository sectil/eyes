# Independent minimal planner + checker (round-3 zaman reviewer). Reads only ders2.lesson.json; model from lesson['timingModel'].
import json, random, re, sys
sys.path.insert(0,'../pilot')
L=json.load(open('../pilot/ders2.lesson.json'))
TM=L['timingModel']
BL={b['id']:b for b in L['blocks']}
def pauses(text,rate,prof):
    P={k:v*TM['pauseScaleAtRate'][str(rate)] for k,v in TM['pauseProfilesSec'][prof].items()}
    t=text.strip().replace('...','…')
    t=re.sub(r'[\s"”’.!?…]+$','',t)          # trailing punctuation = tail (in edge)
    n_ell=t.count('…'); t=t.replace('…',' ')
    return n_ell*P['ell']+len(re.findall(r'[.!?]',t))*P['sent']+t.count(',')*P['comma']+sum(t.count(x) for x in ';:—')*P['semi']
def dur(c,rate,prof):
    return c['syllables']/rate+(TM['edgeMicroSec'] if c.get('carrier') else TM['edgeSec'])+pauses(c['text'],rate,prof)
def gaps(c,rate,prof,nxt):
    if c.get('onsetPeriod'):
        d=dur(c,rate,prof); fl=c.get('gapFloor',TM['gapFloorSec'])
        return {k:max(fl,c['onsetPeriod'][k]-d) for k in ('min','pref','max')}
    if c.get('pairGap') and nxt is not None and nxt['id']==c.get('pairWith'): return c['pairGap']
    return c['gapAfter']
def seq_of(T,sel,inc):
    order=['A']+sorted(sel,key=lambda b:BL[b]['playOrder'])+['K']
    out=[]
    def add(bid):
        for c in BL[bid]['clips']:
            if c['tier']=='required' and not (c.get('minTarget') and T<c['minTarget']): out.append((bid,c))
            elif c['tier']!='required' and c['id'] in inc: out.append((bid,c))
    for bid in order:
        for br in [b for b in L['blocks'] if b['kind']=='bridge' and b['placement'].get('before')==bid]:
            if not br.get('requiresAnyBlock') or any(x in sel for x in br['requiresAnyBlock']): add(br['id'])
        add(bid)
        for br in [b for b in L['blocks'] if b['kind']=='bridge' and b['placement'].get('after')==bid]:
            if not br.get('requiresAnyBlock') or any(x in sel for x in br['requiresAnyBlock']): add(br['id'])
    return out
def budget(T,sel,inc,rate,prof):
    s=seq_of(T,sel,inc); S=sum(dur(c,rate,prof) for _,c in s)
    G={k:L['leadIn'][k] for k in ('min','pref','max')}
    for i,(_,c) in enumerate(s):
        g=gaps(c,rate,prof,s[i+1][1] if i+1<len(s) else None)
        for k in G: G[k]+=g[k]
    return s,S,G
def items():
    it=[(b['entryRank'],0,'B',b['id']) for b in L['blocks'] if b['kind']=='core' and b['priority']>1]
    grp={}
    for b in L['blocks']:
        if b['kind'] in ('bridge',): continue
        for c in b['clips']:
            if c['tier']!='required': grp.setdefault((b['id'],c.get('fillGroup') or c['id']),[]).append(c)
    for (bid,k),cs in grp.items(): it.append((min(c['fillRank'] for c in cs),1,'G',(bid,[c['id'] for c in cs])))
    return sorted(it,key=lambda x:(x[0],x[1]))
def myplan(T,rate,prof):
    sel=[b['id'] for b in L['blocks'] if b['kind']=='core' and b['priority']==1]; inc=set()
    def tot(s_,i_,lv):
        _,S,G=budget(T,s_,i_,rate,prof)
        if lv=='cap': return S+G['pref']+0.5*(G['max']-G['pref'])
        if lv=='half': return S+G['min']+0.5*(G['pref']-G['min'])
        return S+G[lv]
    assert tot(sel,inc,'min')<=T, 'base overfull'
    req={c['id'] for b in L['blocks'] for c in b['clips'] if c['tier']=='required'}
    for r,_,kind,pl in items():
        if kind=='B':
            if any(x not in sel for x in BL[pl].get('requiresBlocks',[])): break
            ns,ni=sel+[pl],inc
        else:
            bid,ids=pl
            if bid not in sel and bid not in ('A','K'): break
            have=inc|set(ids)|req
            if any(q not in have for i in ids for q in next(c for c in BL[bid]['clips'] if c['id']==i).get('requires',[])): break
            ns,ni=sel,inc|set(ids)
        if tot(ns,ni,'pref')<=T or (tot(sel,inc,'cap')<T and tot(ns,ni,'half')<=T): sel,inc=ns,ni
        else: break
    s,S,G=budget(T,sel,inc,rate,prof); R=T-S
    if R<=G['pref']: lo,hi,f='min','pref',(R-G['min'])/(G['pref']-G['min'])
    else: lo,hi,f='pref','max',(R-G['pref'])/(G['max']-G['pref'])
    ev=[]; t=L['leadIn'][lo]+f*(L['leadIn'][hi]-L['leadIn'][lo]); lead=t
    for i,(bid,c) in enumerate(s):
        g=gaps(c,rate,prof,s[i+1][1] if i+1<len(s) else None); gv=g[lo]+f*(g[hi]-g[lo]); d=dur(c,rate,prof)
        ev.append(dict(id=c['id'],b=bid,s=t,e=t+d,d=d,gap=gv,g=g,c=c)); t+=d+gv
    return dict(sel=sel,ids=[e['id'] for e in ev],ev=ev,total=t,f=f,mode=lo+'→'+hi,S=S,lead=lead)
def check(p,T,rate):
    out=[]
    if abs(p['total']-T)>0.5: out.append('total %.2f'%p['total'])
    if not 0<=p['f']<=1: out.append('f out of range %.2f'%p['f'])
    for e in p['ev']:
        if e['gap']<e['g']['min']-1e-6 or e['gap']>e['g']['max']+1e-6: out.append('gap bounds '+e['id'])
    if rate==6.6:
        for e in p['ev']:
            if e['d']>15: out.append('clip>15 '+e['id'])
    long=[e for e in p['ev'] if e['gap']>=60]
    k=[e for e in p['ev'] if e['b']=='K']; ks=k[0]['s']
    if T-ks<45: out.append('closing<45')
    return out
if __name__=='__main__':
    import timing
    TL=timing.load()
    random.seed(int(sys.argv[1]) if len(sys.argv)>1 else 3)
    for rate in (5.2,5.6,6.6):
        mins=sorted(random.sample(range(5,31),3))
        for m in mins:
            for prof in ('lo','hi'):
                T=m*60; p=myplan(T,rate,prof); q=timing.plan(TL,T,rate,prof)
                qids=[ev['clip']['id'] for ev in q['events']]
                same=qids==p['ids']
                maxdt=max(abs(a['s']-b['start']) for a,b in zip(p['ev'],q['events'])) if same else None
                prev=myplan(T-60,rate,prof)['ids'] if m>5 else []
                sub=set(prev)<=set(p['ids'])
                sp=p['S']/T
                print(f"{rate} {m:2d} {prof}: same_as_timing={same} max_onset_diff={maxdt if maxdt is None else round(maxdt,3)} total={p['total']:.1f} f={p['f']:.2f} {p['mode']} speech={sp*100:.1f}% subset_prev={sub} K={T-[e for e in p['ev'] if e['b']=='K'][0]['s']:.0f}s longest_gap={max(e['gap'] for e in p['ev']):.1f} checks={check(p,T,rate) or 'OK'}")
