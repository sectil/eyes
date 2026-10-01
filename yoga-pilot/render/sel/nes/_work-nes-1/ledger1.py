"""nes-1 ledger helper: append a paid-call row BEFORE the call, with cap check (SPEC §2).
Speech cap (550 c) is checked against every ledger row that is not clearly music/sfx (conservative)."""
import json, sys, fcntl, math, datetime, argparse
L='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render/ledger.jsonl'
SPEECH_CAP=550.0
SCRIBE_CREDITS_PER_SEC=5.5      # observed actual (ledger reconcile rows by music-el: 300 s -> 1650 cr, 4 s -> 22 cr)
CENTS_PER_CREDIT=1/55.0         # 1 USD = 5500 credits (elevenlabs.md §6.1)
TTS_CENTS_PER_CHAR_TAKE=0.01684 # SPEC §2
def is_music(r):
    k=str(r.get('kind',''))
    return k.startswith('music') or k.startswith('sfx') or 'music' in k or k in ('nature','tone','sfx')
def totals(rows):
    sp=sum(float(r.get('cents_est') or 0) for r in rows if not is_music(r))
    mu=sum(float(r.get('cents_est') or 0) for r in rows if is_music(r))
    mine=sum(float(r.get('cents_est') or 0) for r in rows if r.get('who')=='nes-1-sel')
    return sp,mu,mine
def append(row):
    with open(L,'a+') as f:
        fcntl.flock(f, fcntl.LOCK_EX)
        f.seek(0)
        rows=[json.loads(l) for l in f if l.strip()]
        sp,mu,mine=totals(rows)
        c=float(row['cents_est'])
        if not row.get('reconcile') and sp + c > SPEECH_CAP:
            fcntl.flock(f, fcntl.LOCK_UN)
            print(json.dumps({'ok':False,'reason':'speech cap would be exceeded','speech_cents_before':round(sp,4),'cents':c}))
            sys.exit(1)
        row['ts']=datetime.datetime.now(datetime.timezone.utc).isoformat()
        row['speech_cents_before']=round(sp,4); row['speech_cents_after']=round(sp+c,4)
        f.write(json.dumps(row,ensure_ascii=False)+'\n'); f.flush()
        fcntl.flock(f, fcntl.LOCK_UN)
    print(json.dumps({'ok':True,'speech_cents_after':round(sp+c,4),'music_cents':round(mu,4),'nes1_sel_cents_after':round(mine+c,4)}))
if __name__=='__main__':
    ap=argparse.ArgumentParser(); sp=ap.add_subparsers(dest='cmd')
    a=sp.add_parser('scribe'); a.add_argument('unit'); a.add_argument('take'); a.add_argument('sec',type=float); a.add_argument('--gen'); a.add_argument('--note',default='')
    b=sp.add_parser('reconcile'); b.add_argument('unit'); b.add_argument('gen'); b.add_argument('est_cents',type=float); b.add_argument('actual_credits',type=float); b.add_argument('actual_cents',type=float)
    t=sp.add_parser('tts'); t.add_argument('unit'); t.add_argument('chars',type=int); t.add_argument('--takes',type=int,default=3); t.add_argument('--note',default='')
    s=sp.add_parser('status')
    o=ap.parse_args()
    if o.cmd=='scribe':
        cr=o.sec*SCRIBE_CREDITS_PER_SEC
        append({'who':'nes-1-sel','kind':'scribe-speech','what':'stt eleven_scribe_v1 nes %s %s %.2fs (SPEC §4.2 verify)'%(o.unit,o.take,o.sec),
                'voice':'nes','unit':o.unit,'take':o.take,'source_generation_id':o.gen,'flow_id':'zAYOhRc6cOKeStKp4ijv','sec':o.sec,'takes':1,
                'credits_est':round(cr,3),'cents_est':round(cr*CENTS_PER_CREDIT,4),
                'estimate_source':'observed actual Scribe price 5.5 credits/s (music-el reconcile rows; confirmed on nes-1 a.hosgeldin: 2.48 s -> 13.64 cr), exact duration','note':o.note})
    elif o.cmd=='reconcile':
        d=o.actual_cents-o.est_cents
        append({'who':'nes-1-sel','kind':'scribe-speech','reconcile':True,'what':'reconcile scribe-speech nes %s: actual price from creative_get_flow_run_status minus logged estimate'%o.unit,
                'unit':o.unit,'generation_id':o.gen,'est_cents':o.est_cents,'actual_credits':o.actual_credits,'actual_cents':o.actual_cents,
                'credits_est':round(d/CENTS_PER_CREDIT,3),'cents_est':round(d,4)})
    elif o.cmd=='tts':
        c=o.chars*o.takes*TTS_CENTS_PER_CHAR_TAKE
        append({'who':'nes-1-sel','kind':'speech','what':'speech tts eleven_v4 nes %s x%d (SPEC §4.2 single re-take)'%(o.unit,o.takes),'voice':'nes','voice_id':'wQ7dVQFxIqwokkwsMqqn',
                'unit':o.unit,'flow_id':'zAYOhRc6cOKeStKp4ijv','chars':o.chars,'takes':o.takes,'chars_billed':o.chars*o.takes,
                'credits_est':round(o.chars*o.takes*0.926,3),'cents_est':round(c,4),'retake':True,'note':o.note})
    else:
        rows=[json.loads(l) for l in open(L) if l.strip()]
        sp_,mu,mine=totals(rows); print(json.dumps({'speech_cents':round(sp_,4),'music_cents':round(mu,4),'nes1_sel_cents':round(mine,4),'rows':len(rows)}))
