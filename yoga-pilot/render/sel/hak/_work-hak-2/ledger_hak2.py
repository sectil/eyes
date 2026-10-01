#!/usr/bin/env python3
"""hak-2-sel ledger helper: append one paid-call row to render/ledger.jsonl BEFORE the call (SPEC §2), with cap check.
usage: ledger_hak2.py scribe <unit> <take> <sec> <source_generation_id>
       ledger_hak2.py tts <unit> <chars> [takes=3]
       ledger_hak2.py reconcile <unit> <generation_id> <est_cents> <actual_credits> <actual_cents>
       ledger_hak2.py status
Speech cap 550 cents (both voices) counted over every row whose kind is not music/sfx/scribe-music (conservative,
Scribe verification of speech counted against the speech cap). Refuses (exit 4) if the call would exceed the cap."""
import json,sys,fcntl,datetime
L='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render/ledger.jsonl'
CAP=550.0
NONSPEECH={'music','sfx','scribe-music'}
SCRIBE_CR_PER_SEC=5.5            # observed actual Scribe price = 5.5 credits x file duration (nes-2-sel: c2.akis t2 3.84 s -> 21.12 cr)
CENTS_PER_CREDIT=1/55.0          # observed: 21.12 cr = 0.384 cents (nes-2-sel scribe_attempts), 165 cr = 3 cents (music-el)
TTS_CENTS_PER_CHAR_TAKE=0.01684  # SPEC §2
def tot(rows): return sum(float(r.get('cents_est') or 0) for r in rows if r.get('kind') not in NONSPEECH)
def mine(rows): return sum(float(r.get('cents_est') or 0) for r in rows if r.get('who')=='hak-2-sel')
k=sys.argv[1]
with open(L,'a+') as f:
    fcntl.flock(f,fcntl.LOCK_EX)
    f.seek(0); rows=[json.loads(l) for l in f if l.strip()]
    before=tot(rows); now=datetime.datetime.now(datetime.timezone.utc).isoformat()
    if k=='status':
        print(json.dumps({'speech_cents':round(before,4),'hak2_sel_cents':round(mine(rows),4),'rows':len(rows),'cap':CAP,'left':round(CAP-before,4)})); sys.exit(0)
    if k=='scribe':
        unit,take,sec,gid=sys.argv[2],sys.argv[3],float(sys.argv[4]),sys.argv[5]
        cr=round(SCRIBE_CR_PER_SEC*sec,3); c=round(cr*CENTS_PER_CREDIT,4)
        row={'ts':now,'who':'hak-2-sel','kind':'scribe-speech','what':'stt eleven_scribe_v1 hak %s %s %.2fs (SPEC §4.2 verify)'%(unit,take,sec),
             'unit':unit,'voice':'hak','take':take,'source_generation_id':gid,'sec':sec,'takes':1,'credits_est':cr,'cents_est':c,
             'estimate_source':'observed actual Scribe price 5.5 credits/s x file duration (nes-2-sel scribe_attempts actual_credits)','flow_id':'zAYOhRc6cOKeStKp4ijv'}
    elif k=='tts':
        unit,chars=sys.argv[2],int(sys.argv[3]); takes=int(sys.argv[4]) if len(sys.argv)>4 else 3
        c=round(TTS_CENTS_PER_CHAR_TAKE*chars*takes,4); cr=round(0.926*chars*takes,3)
        row={'ts':now,'who':'hak-2-sel','kind':'speech','what':'RE-TAKE (SPEC §4.2 single re-take) speech tts eleven_v4 hak %s x%d'%(unit,takes),'unit':unit,
             'voice':'hak','voice_id':'DwjDVVARfPVjBKepXK2c','chars':chars,'takes':takes,'chars_billed':chars*takes,'credits_est':cr,'cents_est':c,
             'flow_id':'zAYOhRc6cOKeStKp4ijv','retake':True}
    elif k=='reconcile':
        unit,gid,est,acr,ac=sys.argv[2],sys.argv[3],float(sys.argv[4]),float(sys.argv[5]),float(sys.argv[6])
        c=round(ac-est,4)
        row={'ts':now,'who':'hak-2-sel','kind':'scribe-speech','reconcile':True,'what':'reconcile scribe-speech hak %s: actual price (creative_get_flow_run_status) minus logged estimate'%unit,
             'unit':unit,'generation_id':gid,'est_cents':est,'actual_credits':acr,'actual_cents':ac,'credits_est':round(c/CENTS_PER_CREDIT,3),'cents_est':c}
    else: sys.exit('bad kind')
    after=before+row['cents_est']
    row['speech_cents_before']=round(before,4); row['speech_cents_after']=round(after,4)
    if after>CAP and not row.get('reconcile'):
        print(json.dumps({'refused':True,'before':round(before,4),'after':round(after,4)})); sys.exit(4)
    f.write(json.dumps(row,ensure_ascii=False)+'\n'); f.flush()
    fcntl.flock(f,fcntl.LOCK_UN)
print(json.dumps({'ok':True,'cents':row['cents_est'],'before':round(before,4),'after':round(after,4),'hak2_sel_after':round(mine(rows)+row['cents_est'],4)}))
