import json, collections
rows=[json.loads(l) for l in open('/home/user/eyes/yoga-pilot/render/ledger.jsonl') if l.strip()]
CR_PER_USD = 5500.0
def usd(c): return c/CR_PER_USD
# measured
tts = {'nes':0.0,'hak':0.0}; scr = {'nes':0.0,'hak':0.0,'-':0.0}
music=sfx=scrm=0.0
for r in rows:
    k=r['kind']; v=r.get('voice') or '-'
    if k=='speech': tts[v]+=r['credits_est']
    elif k=='scribe-speech': scr[v]+=r['credits_est']
    elif k=='music': music+=r['credits_est']
    elif k=='sfx': sfx+=r['credits_est']
    elif k=='scribe-music': scrm+=r['credits_est']
scr_total = sum(scr.values())
print('TTS', {k:round(v,1) for k,v in tts.items()}, 'Scribe speech total', round(scr_total,1), 'music', round(music,1), 'sfx', round(sfx,1), 'scribe-music', round(scrm,1))
tot = sum(tts.values())+scr_total+music+sfx+scrm
print('TOTAL', round(tot,1), 'USD', round(usd(tot),2))
U = json.load(open('/home/user/eyes/yoga-pilot/render/units.json'))['units']
C15 = sum(len(u['tts']) for u in U)
print('unique chars 15dk set', C15)
tts_pc = {v: tts[v]/C15 for v in tts}
scr_pc = scr_total/2/C15
print('TTS cr/char/voice', {k:round(v,3) for k,v in tts_pc.items()}, 'Scribe cr/char/voice', round(scr_pc,3))
lo_pc = min(tts_pc.values())+scr_pc; hi_pc = max(tts_pc.values())+scr_pc
print('speech per char lo/hi', round(lo_pc,3), round(hi_pc,3))
# per-lesson text for 3/5/15 set
syl30_B = {1:3281,2:3399,3:2667,4:3514,5:2693,6:3674,7:3674,8:3360,9:3203,10:3281}  # PLAN B.4.1, Yol B tam
ratio = 1405/2270  # D2: 15dk units syll / 4. tur tam metin
cps = C15/1405
short5 = len('Niyetini içinden bir kez söylemek yeterli.')+len('Nefes kendiliğinden geliyor. Kendiliğinden gidiyor.')+len('Niyetini içinden bir kez daha söylemek yeterli. Ya da yine şunu: "Kendime dinlenmeye izin veriyorum."')
print('short5 chars', short5, 'chars/syll', round(cps,3))
cap3 = (430, 720)
lessons = [1,3,4,5,6,7,8,9,10]
lo_chars = {L: C15 + short5 + cap3[0] for L in lessons}
hi_chars = {L: max(C15, syl30_B[L]*ratio*cps) + short5*1.5 + cap3[1] for L in lessons}
print('per-lesson chars lo', round(sum(lo_chars.values())/9), 'hi', {L: round(v) for L,v in hi_chars.items()})
sp_lo = sum(lo_chars[L]*lo_pc for L in lessons); sp_hi = sum(hi_chars[L]*hi_pc for L in lessons)
d2_lo = (short5+cap3[0])*lo_pc; d2_hi=(short5*1.5+cap3[1])*hi_pc
print('speech 9 lessons per voice', round(sp_lo), round(sp_hi), ' D2 increment per voice', round(d2_lo), round(d2_hi))
# music per lesson
mus_rate = music/1620.0; scrm_rate = 5.5
print('music cr/s', round(mus_rate,3))
m_lo = 1200*mus_rate + 1200*scrm_rate*0   # without scribe-music
m_lo_s = 1200*mus_rate + 1200*scrm_rate
m_hi = 1620*mus_rate + scrm   # pilot actual incl scribe on 1744 s
print('music/lesson lo(no scribe)', round(m_lo), 'lo(with scribe)', round(m_lo_s), 'hi(pilot-like)', round(m_hi))
nature_all = 5*400 + 12*4*3.33   # 5 types x 4x30 s + 12 bird calls
print('nature all', round(nature_all))
def scen(voices, music_on, scribe_music=True):
    lo = voices*(sp_lo+d2_lo) + (9*(m_lo_s if scribe_music else m_lo) if music_on else 0) + nature_all
    hi = voices*(sp_hi+d2_hi) + (9*m_hi if music_on else 0) + nature_all
    return lo, hi
for name,(v,m) in {'1 ses + EL müzik':(1,True),'1 ses + Dalga':(1,False),'2 ses + EL müzik':(2,True),'2 ses + Dalga':(2,False)}.items():
    lo,hi = scen(v,m)
    print(name, round(lo/1000,1),'k -', round(hi/1000,1),'k  USD', round(usd(lo),1),'-',round(usd(hi),1))
# per batch (3 lessons, 1 voice + EL)
pl_lo = min(lo_chars.values())*lo_pc + m_lo_s; pl_hi = max(hi_chars.values())*hi_pc + m_hi
print('per lesson 1 voice + EL', round(pl_lo), round(pl_hi), 'batch x3', round(3*pl_lo), round(3*pl_hi), 'USD', round(usd(3*pl_lo),1), round(usd(3*pl_hi),1))
print('per lesson 1 voice speech only', round(min(lo_chars.values())*lo_pc), round(max(hi_chars.values())*hi_pc))
# designed voice pilot addition
dv_lo = C15*lo_pc; dv_hi = C15*hi_pc
print('designed voice D2-15dk', round(dv_lo), round(dv_hi), 'USD', round(usd(dv_lo),2), round(usd(dv_hi),2))
# full-mix Scribe per voice: 10 lessons x 23 min
fm = 10*23*60*5.5
print('full-mix scribe per voice', round(fm), 'USD', round(usd(fm),2))
# phase 2: 30 dk extension, per voice
ext_ratio = 2490/C15
print('30dk ext ratio', round(ext_ratio,3))
p2_lo = sum(lo_chars[L] for L in lessons)*0 
