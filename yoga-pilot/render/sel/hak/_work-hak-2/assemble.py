import json, glob, os, sys, datetime
import numpy as np, soundfile as sf
R='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
W=R+'/sel/hak/_work-hak-2'
sys.path.insert(0,R+'/tools'); import audio
units=json.load(open(R+'/units.json'))['units']
part=units[34:68]
choice=json.load(open(W+'/choice.json'))
proc=json.load(open(W+'/process_all.json'))
ver=json.load(open(W+'/verify_out.json'))
order=json.load(open(W+'/order.json'))
edge=json.load(open(W+'/edge_survey.json'))
scr={}
for f in glob.glob(W+'/scribe/*.json'):
    d=json.load(open(f)); scr.setdefault(d['unit'],[]).append(d)
L=R+'/ledger.jsonl'
rows=[json.loads(l) for l in open(L) if l.strip()]
mine=[r for r in rows if r.get('who')=='hak-2-sel']
NONSPEECH={'music','sfx','scribe-music'}
speech_total=sum(float(r.get('cents_est') or 0) for r in rows if r.get('kind') not in NONSPEECH)

# edge jump at data edges
for pid,r in ver.items():
    x,sr=sf.read(r['file'],dtype='float64')
    d=np.abs(np.diff(np.concatenate([[0.0],x,[0.0]])))
    r['max_sample_jump_db']=round(float(audio.db(d.max())),1)
    nz=np.where(np.abs(x)>0)[0]
    r['onset_edge_step_db']=round(float(audio.db(abs(x[nz[0]]))),1); r['end_edge_step_db']=round(float(audio.db(abs(x[nz[-1]]))),1)
    r['onset_1ms_peak_db']=r.pop('first_1ms_peak_db'); r['end_1ms_peak_db']=r.pop('last_1ms_peak_db')
    for k in ('first_sample_db','last_sample_db'): r.pop(k,None)

EXTRA_EXCL=order['extra_excluded']
EXTRA_EXCL['k.yan/retake-t1']='file-start transient: -38 dBFS burst in first 2 ms, then dip to -57..-69 dBFS before speech onset (SPEC 4.1a tik); not Scribe-verified'
CUT_METHOD_MULTI=('audio.py cut (longest N-1 gaps, cut at zero crossing near silence middle, 5 ms edges) + SPEC 4.3(c) metric-only verification: '
                  '(a) unavailable - Scribe output is plain text only (no word timestamps in creative_get_flow_run_status transcripts nor in the downloaded transcript .txt, checked on c2.akis t2); '
                  '(b) unavailable - no local-file upload tool in this session (creative_create_asset_upload/finalize not exposed; get_more_tools call returned an MCP schema error)')
flags=[]; out_units={}
for i,u in enumerate(part, start=34):
    uid=u['id']
    rk=json.load(open(W+'/rank/%s.json'%uid))
    ch=choice[uid]; take=ch['take']
    rank_src=rk
    if uid=='k.yan':
        rank_src=json.load(open(W+'/rank_kyanall.json'))
    ent=[r for r in rank_src['ranking'] if r['take']==('t1.mp3' if uid=='k.yan' else take+'.mp3')][0]
    tk=json.load(open(R+'/raw/hak/%s/takes.json'%uid))
    tmeta=[t for t in tk['takes'] if 't%d'%t['take']==take][0]
    atts=sorted(scr.get(uid,[]),key=lambda d:d['take'])
    chosen_scr=[a for a in atts if a['take']==take][0]
    pr=proc['units'][uid]
    pieces=[]
    unit_pieces=audio.unit_pieces(u)
    txt={}
    for p in unit_pieces:
        if not p['keep']: continue
        pid = uid if len(unit_pieces)==1 else (p['name'] if u['kind']=='carrier' else f'{uid}#{p["name"][1:]}')
        txt[pid]=(p['text'],p['syll'])
    for pid in pr['pieces']:
        rep=pr['process'][pid]
        v=ver[pid]
        ptext,psyl=txt[pid]
        pc={'piece_id':pid,'file':v['file'],'text':ptext,'syll':psyl,
            'screen_text': (u['itemText'][pid] if u['kind']=='carrier' else ptext),
            'level_mode':rep.get('level_mode'),'level':rep.get('level'),'micro':rep.get('micro',False),
            'ref_rms_db_used': (proc['ref_rms_db'].get(u['phase']) if rep.get('level_mode')=='rms' else None),
            'true_peak_dbtp':rep.get('true_peak_dbtp'),'limiter_max_db':rep.get('limiter_max_db'),'limiter_sec_over_1db':rep.get('limiter_sec_over_1db'),
            'deess':rep.get('deess'),'process_exit':rep.get('exit'),'process_flag':rep.get('flag') or None,
            'verify':{k:v[k] for k in ('sr','ch','subtype','dur','lufs','speech_rms_db','true_peak_dbtp','clicks','clipped','head_zero_ms','tail_zero_ms','onset_edge_step_db','end_edge_step_db','onset_1ms_peak_db','end_1ms_peak_db','max_sample_jump_db')}}
        pieces.append(pc)
        if rep.get('flag'):
            flags.append({'unit':uid,'piece':pid,'flag':'kulak-sinirlayici','reason':'audio.py process: '+rep['flag']+' (READY known limit 1: Hakan crest factor; -18 LUFS with <= -1.5 dBTP needs true-peak limiting)'})
    ufl=[]
    if len(unit_pieces)>1:
        ufl.append({'flag':'kesim-kulak','reason':'SPEC 4.3(c): cut verified by metrics only (no Scribe word timestamps, no local upload tool)'})
    if not chosen_scr['compare_exit']==0:
        ufl.append({'flag':'kulak','reason':'Scribe wrote "Sırt üstü" (2 words) for "Sırtüstü" in all 5 Scribe-verified takes (orig t1,t2,t3 + re-take t3,t2; re-take t1 excluded for a file-start transient) -> word sequence not identical under SPEC 4.2 normalization; every other word matched. Likely Scribe orthography, not a misreading - owner to confirm by ear. Chosen = best of the 5 valid takes by joint audio.py rank (orig t1).'})
    for f in ufl: flags.append({'unit':uid,**f})
    cut=pr.get('cut')
    rec={'idx':i,'kind':u['kind'],'phase':u['phase'],'tts':u['tts'],'screen':u['screen'],'screen_equals_tts':u['tts']==u['screen'],
         'chosen':{'take':take,'set':ch['set'],'file':ch['file'],'generation_id':tmeta['generation_id'],'session_id':tmeta['session_id'],'duration_secs':tmeta['duration_secs']},
         'rank_order_original':[r['take'] for r in rk['ranking']],'excluded_by_rank':rk['excluded'],
         'excluded_extra':{k:v for k,v in EXTRA_EXCL.items() if k.startswith(uid+'/')},
         'chosen_rank':{k:ent.get(k) for k in ('take','rank','score','penalties','soft_violations','reasons','metrics','cut','joins','join_max_st')},
         'scribe_attempts':[{k:a[k] for k in ('take','scribe_text','compare_exit','generation_id','session_id','stt_node','ref_node','asset_id','asset_size_bytes','actual_credits','actual_cents','spoken_duration_secs')} for a in atts],
         'scribe_text':chosen_scr['scribe_text'],'compare':json.JSONDecoder().raw_decode(chosen_scr['compare'])[0] if chosen_scr['compare'].startswith('{') else chosen_scr['compare'],
         'compare_equal':chosen_scr['compare_exit']==0,
         'cut_method': CUT_METHOD_MULTI if len(unit_pieces)>1 else 'none (single-sentence clip)',
         'cut': ({k:cut.get(k) for k in ('cuts','chosen_gaps','shortest_chosen_gap','longest_unchosen_gap','margin_ratio','boundary_misalign','cut_suspect','thr_db','pieces')} if cut else None),
         'pieces':pieces,'flags':[f['flag'] for f in ufl]}
    if uid=='k.yan':
        rec['rank_order_joint_5_valid']=[(json.load(open(W+'/kyanall/map.json'))[r['take'][:2]], r['score']) for r in rank_src['ranking']]
        rec['retake']={'node_id':'ZdKo7SzhFLNkESIOEgX8','session_ids':['Ig7Zd314lLyobWUqelHj','OhcIFO3t4XgKGWKdnhLY','02aPbKLjyFzlYa9HR2i2'],
                       'files':[R+'/raw/hak/k.yan/retake/t%d.mp3'%n for n in (1,2,3)],'takes_json':R+'/raw/hak/k.yan/retake/takes.json',
                       'rank_order':[r['take'] for r in json.load(open(W+'/rank_retake_k.yan.json'))['ranking']],'chars':40,'cents_est':2.0208}
    if uid=='car.sayi':
        rec['carrier_note']=('count carrier, not a right/left pair (SPEC 4.4 n/a). Pre-phrase "_pre" ("sayıyorum:") cut and discarded per units.json cut rule. '
                             'Join F0 steps (rank, chosen t1): max %.2f st > 2.0 st (qa.carrierJoinF0StepSemitones) - all 3 takes exceed (t1 3.66, t2 5.28, t3 3.02 but t3 had 2 soft violations); '
                             'c2.n08 is 1.004 s -> SPEC 3 LUFS mode (-18 LUFS, speech RMS %.2f dB) while its <1 s neighbours use Derin ref RMS -18.25 (+1 dB micro for 1-syllable) - level step ~1 dB, listen.')%(ent['join_max_st'],ver['c2.n08']['speech_rms_db'])
    if uid=='n2.hatirla':
        rec['cut_note']='margin_ratio 1.072 (shortest chosen gap vs longest unchosen gap nearly equal) - cut is at the sentence boundary (boundary_misalign 0.030, piece rates 5.24/5.90) but the gap choice is close; part of kesim-kulak listening.'
    out_units[uid]=rec
# notes flags (non-SPEC but reported)
extra_notes=[]
for uid,rec in out_units.items():
    if rec['phase']=='Derin':
        a=rec['chosen_rank']['metrics']['articulation']
        if a>5.0: extra_notes.append({'unit':uid,'articulation':a,'note':'Derin ceiling (qa.derinClipRateCeil 5.0, VARSAYIM) exceeded (reported, not an exclusion)'})
summary={
 'units':len(out_units),'units_with_pieces':sum(1 for r in out_units.values() if r['pieces']),'pieces':sum(len(r['pieces']) for r in out_units.values()),
 'scribe_exact_match_units':sum(1 for r in out_units.values() if r['compare_equal']),
 'flags':flags,
 'retakes':[{'unit':'k.yan','takes':3,'chars':40,'cents_est':2.0208,'result':'Scribe still "Sırt üstü" on re-take t3 and t2 (re-take t1 excluded: file-start transient); best of 5 valid = orig t1, flagged kulak'}],
 'scribe_calls':sum(len(r['scribe_attempts']) for r in out_units.values()),
 'ledger_cents_hak2sel':{'scribe':round(sum(r['cents_est'] for r in mine if r['kind']=='scribe-speech'),4),'retake_speech_est':round(sum(r['cents_est'] for r in mine if r['kind']=='speech'),4),
                         'total':round(sum(r['cents_est'] for r in mine),4),'scribe_estimates_equal_actual_prices':True},
 'speech_cap_total_all_agents_at_write':round(speech_total,4),'speech_cap':550,
 'derin_ceiling_reports':extra_notes,
 'sag_sol_carriers':'none in idx 34..67 (car.sayi is a count carrier); nothing for the mixer under SPEC 4.4 from this part',
 'tool_notes':[
   'audio.py rank click detector does not flag file-start/file-end transients; a separate 2 ms-frame edge survey of all 102 raw takes (+3 re-takes) excluded br.orta t3 (EOF rise to -39 dBFS), k.sesler t3 (start burst -32 dBFS), k.yan re-take t1 (start burst -38 dBFS); none of them would otherwise have been chosen except br.orta t3 (rank #1 -> t1 used).',
   'audio.py process pads digital zeros when onset < 60 ms / tail < 250 ms and fades the pad, leaving the data edge unfaded: worst data-edge step in this part -53.7 dBFS (c4.patika onset; 1 ms peak -51.5 dBFS), next -69.7 dBFS (k.sesler), all end steps <= -82.3 dBFS; detect_clicks = 0 on all 55 output pieces; all 55 are 44.1 kHz mono FLOAT, >=1 s pieces -18.0 LUFS, max true peak -1.52 dBTP.',
   'Hakan true-peak limiting: %d of 55 pieces carry the audio.py "kulak" limiter flag (> 3 dB), worst c2.akis#2 7.5 dB (0.12 s > 1 dB).'%sum(1 for f in flags if f['flag']=='kulak-sinirlayici'),
   'k.nefes t1 Scribe language_probability 0.66 (text matched exactly).']}
method={'rank':'audio.py rank (SPEC 4.1) on raw/hak/<id>/t1..t3.mp3, --sex m; plus edge-transient survey (edge_survey.py) applied as SPEC 4.1(a) exclusions',
        'scribe':'SPEC 4.2: best take URL (fresh signed URL from creative_get_flow_run_status; sha256 of URL content == local file for every attached take; attached asset size_bytes == local bytes) -> creative_attach_reference_file on flow zAYOhRc6cOKeStKp4ijv -> creative_transcribe_audio (eleven_scribe_v1, connect_from) -> poll; audio.py compare vs unit tts',
        'cut_verification':CUT_METHOD_MULTI+'. Metric checks: piece count = target, audio.py boundary_misalign <= 0.066 (all units), cut within 10 ms of chosen-silence middle, per-piece rates 2.0-7.3 syll/s (carrier items 2.0-4.6). Every multi-piece unit carries flag kesim-kulak.',
        'process':'audio.py process --sex m (HPF 70 Hz, trim -50 dBFS 60/250 ms, de-ess if needed, >=1 s: -18 LUFS / <=-1.5 dBTP; <1 s: phase reference speech RMS, +1 dB --micro for 1-syllable carrier items). 44.1 kHz mono FLOAT WAV. Phase gain NOT applied (mix.py).',
        'reference_rms':{'Derin':{'clip':'c2.kal (t3, processed, -18.0 LUFS)','speech_rms_db':proc['ref_rms_db']['Derin'],'used_for':'car.sayi items c2.n10,n09,n07,n06,n05,n04,n03,n02,n01 (<1 s; 1-syllable n10,n05,n04,n03,n01 with +1 dB micro); c2.n08 came out 1.004 s -> LUFS mode'},
                         'Kapanış':{'clip':'k.sesler (t1)','speech_rms_db':proc['ref_rms_db']['Kapanış'],'used_for':'none (no <1 s Kapanış piece)'},
                         'Varış':{'clip':'a.x.kipir (t2)','speech_rms_db':proc['ref_rms_db']['Varış'],'used_for':'none'}}}
sel={'part':'hak-2','voice':'hak','voice_id':'DwjDVVARfPVjBKepXK2c','sex':'m','unit_index_range':[34,67],'written_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),
     'who':'hak-2-sel','method':method,'units':out_units,'summary':summary}
json.dump(sel,open(R+'/sel/hak/selection-hak-2.json','w'),ensure_ascii=False,indent=1)
print(json.dumps({k:v for k,v in summary.items() if k not in ('flags','derin_ceiling_reports')},ensure_ascii=False,indent=1))
print('flags', len(flags)); 
for f in flags: print(' ',f['unit'],f.get('piece',''),f['flag'],f['reason'][:110])
print('derin over ceiling',len(extra_notes))
