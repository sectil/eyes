#!/usr/bin/env python3
"""Append one paid-call row to render/ledger.jsonl BEFORE the call (sel-nes-2).
usage: ledger_add.py scribe <unit> <take> <sec> [node]   |  ledger_add.py speech <unit> <chars> <takes>
       ledger_add.py reconcile <unit> <est_cents> <actual_credits> <actual_cents> <generation_id>
Refuses (exit 4) if the speech cap (550 cents, both voices) would be exceeded.
Speech-cap total = every ledger row whose kind is not music/scribe-music/sfx (conservative)."""
import json,sys,fcntl,datetime,math
L='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render/ledger.jsonl'
CAP=550.0
CREDIT_CENTS=3.0/165.0          # observed: 165 credits = 3 cents (music-el reconcile rows)
SCRIBE_CR_PER_SEC=5.5           # observed actual: 165 cr / 30 s, 22 cr / 4 s, 1650 cr / 300 s
SPEECH_CENTS_PER_CHAR_TAKE=0.01684
NONSPEECH={'music','scribe-music','sfx'}
def total(rows): return sum(float(r.get('cents_est') or 0) for r in rows if r.get('kind') not in NONSPEECH)
with open(L,'a+') as f:
    fcntl.flock(f,fcntl.LOCK_EX)
    f.seek(0); rows=[json.loads(l) for l in f if l.strip()]
    before=total(rows)
    now=datetime.datetime.now(datetime.timezone.utc).isoformat()
    k=sys.argv[1]
    if k=='scribe':
        unit,take,sec=sys.argv[2],sys.argv[3],float(sys.argv[4]); gid=sys.argv[5] if len(sys.argv)>5 else ''
        cr=round(SCRIBE_CR_PER_SEC*math.ceil(sec),3); c=round(cr*CREDIT_CENTS,4)
        row={'ts':now,'who':'nes-2-sel','kind':'scribe-speech','what':f'stt eleven_scribe_v1 nes {unit} {take} {sec}s (SPEC §4.2 verify)','unit':unit,'voice':'nes','take':take,'source_generation_id':gid,'sec':sec,'takes':1,'credits_est':cr,'cents_est':c,'estimate_source':'observed actual Scribe price 5.5 credits/s (music-el reconcile rows), ceil to whole s','flow_id':'zAYOhRc6cOKeStKp4ijv'}
    elif k=='speech':
        unit,chars,takes=sys.argv[2],int(sys.argv[3]),int(sys.argv[4])
        c=round(SPEECH_CENTS_PER_CHAR_TAKE*chars*takes,4); cr=round(0.926*chars*takes,3)
        row={'ts':now,'who':'nes-2-sel','kind':'speech','what':f'RE-TAKE (SPEC §4.2 single re-take) eleven_v4 nes {unit} x{takes}','unit':unit,'voice':'nes','voice_id':'wQ7dVQFxIqwokkwsMqqn','chars':chars,'takes':takes,'credits_est':cr,'cents_est':c,'flow_id':'zAYOhRc6cOKeStKp4ijv','retake':True}
    elif k=='reconcile':
        unit,est,acr,ac,gid=sys.argv[2],float(sys.argv[3]),float(sys.argv[4]),float(sys.argv[5]),sys.argv[6]
        c=round(ac-est,4); cr=round(acr-est/CREDIT_CENTS,3)
        row={'ts':now,'who':'nes-2-sel','kind':'scribe-speech','reconcile':True,'what':f'reconcile scribe-speech {unit}: actual price minus logged estimate','unit':unit,'generation_id':gid,'est_cents':est,'actual_credits':acr,'actual_cents':ac,'credits_est':cr,'cents_est':c}
    else: sys.exit('bad kind')
    after=before+row['cents_est']
    row['speech_cents_before']=round(before,4); row['speech_cents_after']=round(after,4)
    if after>CAP and not row.get('reconcile'):
        print(json.dumps({'refused':True,'before':before,'after':after})); sys.exit(4)
    f.write(json.dumps(row,ensure_ascii=False)+'\n'); f.flush()
    fcntl.flock(f,fcntl.LOCK_UN)
print(json.dumps({'ok':True,'cents':row['cents_est'],'before':round(before,4),'after':round(after,4)}))
