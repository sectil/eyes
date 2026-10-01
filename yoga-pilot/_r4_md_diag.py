import sys, os
sys.path.insert(0, '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/pilot')
import timing
L = timing.load()
plans = {(r, pr, m): timing.plan(L, m*60, r, pr) for r in timing.RATES for pr in ('lo','hi') for m in range(5, 31)}
def first(cid):
    ms = []
    for r in timing.RATES:
        for pr in ('lo','hi'):
            for m in range(5, 31):
                if any(ev['clip']['id'] == cid for ev in plans[(r,pr,m)]['events']):
                    ms.append(m); break
    return (min(ms), max(ms)) if ms else None
for cid in ['a.konfor','a.x.kipir','a.karar','a.agirlik','n1.birak','c1.tekrar','c1.kacirma','c1.gecis.arka','c1.gecis.on','c1.x01','c2.yer','c2.alt','c2.kal','c2.n05','c2.n10','c2.durak','c2.x.ritim','c2.x.kendin','br.k2','c3.agir','c3.gelmezse','c3.zemin','c3.sicak','c3.s1','c3.r1','c3.x.hepsi','br.orta','c4.yer','c4.gunes','c4.yerles','c4.adim','c4.koku','c4.pencere','c4.x.istemiyor','c4.iz','c4.isik','c4.x.gok','c4.x.yaklas','c4.x.donus2','c4.tas1','c4.geride','c4.ruzgar','c5.basla','c5.pencere','c5.x.hepsi','c5.x.yumusak','c5.x.oldugu','c5.x.dayanak','n2.dilek','k.sesler','k.zaman','k.oda.ayrinti','k.yandakal']:
    print(cid, first(cid))
p = plans[(5.6,'hi',5)]
for ev in p['events']:
    print('%6.1f %-4s %-14s %s | gap %.1f | subs %s' % (ev['start'], ev['block'], ev['clip']['id'], ev['clip']['text'][:70], ev['gap'], [round(s.get('sgap',0),1) for s in ev['subs']]))
m_c4 = next(m for m in range(5,31) if 'C4' in plans[(5.6,'hi',m)]['sel'])
print('C4 first at 5.6 hi', m_c4, [ev['clip']['id'] for ev in plans[(5.6,'hi',m_c4)]['events'] if ev['block']=='C4'])
for r in timing.RATES:
    for pr in ('lo','hi'):
        m4 = next(m for m in range(5,31) if 'C4' in plans[(r,pr,m)]['sel'])
        print(r, pr, 'C4', m4, [ev['clip']['id'] for ev in plans[(r,pr,m4)]['events'] if ev['block']=='C4'])
never = set(c['id'] for b in L['blocks'] for c in b['clips']) - set(ev['clip']['id'] for p in plans.values() for ev in p['events'])
print('never', sorted(never))
print('miss30 6.6 lo', [c['id'] for b in L['blocks'] for c in b['clips'] if c['id'] not in {ev['clip']['id'] for ev in plans[(6.6,'lo',30)]['events']}])
print('miss30 5.2 hi', [c['id'] for b in L['blocks'] for c in b['clips'] if c['id'] not in {ev['clip']['id'] for ev in plans[(5.2,'hi',30)]['events']}])
