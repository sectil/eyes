import json, os, glob, datetime, sys
R='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
W=R+'/sel/hak/_work-hak-1'
sys.path.insert(0,R+'/tools'); import audio
units=json.load(open(R+'/units.json'))['units'][0:34]
proc=json.load(open(W+'/proc.json')); meas=json.load(open(W+'/measure.json')); nuc=json.load(open(W+'/nuclei.json'))
dec=json.load(open(W+'/decisions.json'))
ledger=[json.loads(l) for l in open(R+'/ledger.jsonl') if l.strip()]
mine=[r for r in ledger if r.get('who')=='hak-1-sel']
NONSPEECH={'music','sfx','scribe-music'}
scr={}
for f in glob.glob(W+'/scribe/*.json'):
    s=json.load(open(f)); scr.setdefault(s['unit'],[]).append(s)
stt={}
for l in open(W+'/stt.jsonl'):
    if l.strip(): d=json.loads(l); stt[(d['unit'],d['take'])]=d
att={}
for l in open(W+'/attach.jsonl'):
    if l.strip(): d=json.loads(l); att[(d['unit'],d['take'])]=d
REF={'Varış':'a.acilis','Derinleşme':'c1.tekrar','Derin':'c2.alt'}
PAIRS={'car.sol1':'car.sag1','car.sol2':'car.sag2','car.sol3':'car.sag3','car.sol4':'car.sag4'}
RETAKE={'a.durus':W+'/retake_a.durus.json','c2.yer':W+'/retake_c2.yer.json'}
CUT_METHOD=("(c) metric-only. (a) unavailable: Scribe results in this session expose plain text only "
 "(creative_get_flow_run_status 'transcripts'[].text; content.txt download checked for a.hosgeldin t1 = 31 bytes plain text, "
 "saved at "+W+"/scribe/a.hosgeldin.t1.content.txt), no word timestamps. (b) unavailable: ElevenLabs get_more_tools call at 12:28Z failed "
 "('MCP server returned a malformed result ... missing required resultType'); no creative_create_asset_upload/finalize tool is loadable in this "
 "session (ToolSearch), and creative_attach_reference_file needs a public https URL. Checks used for (c): piece count == target; "
 "per-piece syllable/duration consistency (audio.py boundary_misalign, threshold 0.12 VARSAYIM); cut at zero crossing near the middle of "
 "pure silence with 5 ms edges (audio.py cut); margin_ratio (shortest chosen / longest unchosen pause); extra supporting evidence: heuristic "
 "syllable-nucleus count per piece (nuclei.py, not a gate)")
def rank_file(uid):
    for suf in ('.all6','.match',''):
        p=W+'/rank/%s%s.json'%(uid,suf)
        if os.path.exists(p): return p
sel={'part':'hak-1','voice':'hak','voice_id':'DwjDVVARfPVjBKepXK2c','sex':'m','unit_index_range':[0,33],
     'unit_ids':[u['id'] for u in units],
     'generated_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),
     'spec':R+'/SPEC.md §3-§4','tools':R+'/tools/audio.py (rank, cut, process, compare, analyze)',
     'work_dir':W,
     'scribe_route':("creative_get_flow_run_status(take session ids) -> fresh signed take URL (takes.json URLs expire 2 h after 10:15Z); "
        "every fetched URL downloaded and sha256-compared with the local raw take (all identical, "+W+"/urls.json); "
        "creative_attach_reference_file(url, flow zAYOhRc6cOKeStKp4ijv) -> size_bytes checked = local bytes for every attach; "
        "creative_transcribe_audio(eleven_scribe_v1, connect_from=[attached node]) -> poll; compare = audio.py compare(unit tts, Scribe text)"),
     'cut_verification_method':CUT_METHOD,
     'reference_rms_for_short_pieces':{ph:{'clip':u,'speech_rms_db':proc[u]['pieces'][0]['process']['rms_db'],
          'file':proc[u]['pieces'][0]['out']} for ph,u in REF.items()},
     'reference_rms_note':'<1 s pieces levelled to the processed speech RMS of the same-phase single-sentence reference clip of this part (a.acilis Varış, c1.tekrar Derinleşme, c2.alt Derin); 1-syllable pieces --micro (+1 dB, qa.microClipRmsOffsetDb)',
     'carrier_pairs_for_mixer':{'note':'SPEC §4.4: all right/left carrier pairs of this part are inside hak-1; left takes chosen by audio.py rank --match-f0/--match-rate against the chosen right take (Scribe-verified)',
          'pairs':{v:k for k,v in PAIRS.items()}},
     'units':{}}
summary_flags=[]
for u in units:
    uid=u['id']; take=dec[uid]['take']; p=proc[uid]
    rf=rank_file(uid); rk=json.load(open(rf))
    ch=[x for x in rk['ranking'] if x['take']==take][0]
    atts=sorted(scr.get(uid,[]),key=lambda s:int(s['take'][1:]))
    flags=[]; notes=[]
    pcs=audio.unit_pieces(u); multi=len(pcs)>1
    ch_scr=[s for s in atts if s['take']+'.mp3'==take]
    match=bool(ch_scr and ch_scr[0]['compare_exit']==0)
    if not match:
        flags.append({'flag':'kulak','reason':'SPEC §4.2: no take matched Scribe word-for-word after the single re-take; best-ranked take over all 6 takes kept; diffs: '+
                      '; '.join('%s: %s'%(s['take'],s['scribe_text']) for s in atts)})
    if multi:
        flags.append({'flag':'kesim-kulak','reason':'SPEC §4.3(c): cut verified by metrics only (no word timestamps, no local-upload tool)'})
    sv=ch.get('soft_violations',[])
    if ch.get('join_max_st') is not None and ch['join_max_st']>2.0:
        flags.append({'flag':'eklem>2yt','reason':'SPEC §3/§4.1(f): carrier join F0 step max %.2f st > 2.0 st (soft criterion; every take of this unit exceeds 2.0 st)'%ch['join_max_st']})
    lim=[q for q in p['pieces'] if (q['process'].get('flag') or '').startswith('kulak')]
    if lim:
        flags.append({'flag':'kulak-sinirlayici','reason':'audio.py process: true-peak limiter reduced > 3 dB on %d piece(s) to reach -18 LUFS at <= -1.5 dBTP (known Hakan crest-factor limit, tools/READY): '%len(lim)+
                      ', '.join('%s %.1f dB/%.2f s'%(q['piece_id'],q['process']['limiter_max_db'],q['process']['limiter_sec_over_1db']) for q in lim)})
    cutinfo=None
    if 'cut' in p:
        c=p['cut']
        cutinfo={'method':'(c) metric-only','cuts_sec':c['cuts'],'pauses_found':c['pauses'],'gaps_available':c['gaps_available'],'chosen_gaps':c['chosen_gaps'],
                 'shortest_chosen_gap':c['shortest_chosen_gap'],'longest_unchosen_gap':c['longest_unchosen_gap'],'margin_ratio':c['margin_ratio'],
                 'boundary_misalign':c['boundary_misalign'],'cut_suspect':c['cut_suspect'],
                 'piece_rates':[{'name':x['name'],'start':x['start'],'end':x['end'],'dur':x['dur'],'speech_sec':x['speech_sec'],'rate':x.get('rate')} for x in c['pieces']],
                 'nuclei_check_expected_vs_counted':nuc.get(uid),
                 'same_as_rank_cut': [round(v,3) for v in (ch['cut']['cuts_sec'] or [])]==[round(v,3) for v in (c['cuts'] or [])]}
        if c['margin_ratio'] is not None and c['margin_ratio']<1.1:
            notes.append('cut margin_ratio %.3f (shortest chosen pause ~ longest unchosen pause): cut position rests on a near-tie; metric evidence (piece durations/rates, nucleus counts) supports the chosen cut'%c['margin_ratio'])
        if c['cut_suspect']:
            notes.append('boundary_misalign %.3f > 0.12 (soft): every detected pause is an item boundary (gaps_available == pieces-1), so the cut positions are structurally fixed; the misalign comes from 1-syllable "diz" vs 5-syllable items; nucleus counts per piece match the item order'%c['boundary_misalign'])
    if uid=='n1.sec':
        notes.append('takes t1 and t2 eliminated for the cut: their longest pause is the colon pause after "önerim şu:" (piece rates 3.2/12.1 and 3.3/11.2 syll/s, boundary_misalign 0.31/0.29) = wrong sentence cut (SPEC §4.3). Chosen t3 cuts at the sentence end (2.29-2.88 s; rates 6.21/5.90 syll/s)')
    for s in sv: notes.append('soft: '+s)
    rt=None
    if uid in RETAKE:
        m=json.load(open(RETAKE[uid]))
        lr=[r for r in mine if r['kind']=='speech' and r['unit']==uid]
        rt={'rule':'SPEC §4.2 single re-take (3 takes)','node_id':m['node_id'],'session_ids':m['session_ids'],'requested_at':m['requested_at'],
            'prompt':m['prompt'],'takes':['t4','t5','t6'],'files':[g for g in ['%s/raw/hak/%s/t%d.mp3'%(R,uid,k) for k in (4,5,6)]],
            'reason':m['reason'],'ledger_row_ts':[r['ts'] for r in lr],'cents_est':sum(r['cents_est'] for r in lr),
            'retake_rank_file':W+'/rank/%s.retake.json'%uid,'all6_rank_file':W+'/rank/%s.all6.json'%uid}
    rec={'kind':u['kind'],'phase':u['phase'],'tts':u['tts'],'screen':u['screen'],'screen_equals_tts':u['screen']==u['tts'],
         'chosen_take':take,'chosen_take_file':R+'/raw/hak/%s/%s'%(uid,take),
         'rank_file':rf,'rank_rule':rk['order_rule'],'rank_position':ch['rank'],'n_takes_ranked':len(rk['ranking']),'excluded_takes':rk['excluded'],
         'rank_reasons':ch['reasons'],'soft_violations':sv,'penalties':ch['penalties'],'score':ch['score'],'metrics':ch['metrics'],
         'all_takes':[{'take':x['take'],'rank':x['rank'],'score':x['score'],'soft_violations':x['soft_violations'],'articulation':x['metrics']['articulation'],
                       'active_sec':x['metrics']['active_sec'],'f0_geo_hz':x['metrics']['f0_geo_hz']} for x in rk['ranking']],
         'joins':ch.get('joins'),'join_max_st':ch.get('join_max_st'),
         'scribe_attempts':[{'take':s['take'],'text':s['scribe_text'],'match':s['compare_exit']==0,'generation_id':s['generation_id'],'session_id':s['session_id'],
                             'source_asset_id':s['asset_id'],'source_node_id':s['source_node_id'],'stt_node_id':s['stt_node_id'],
                             'attached_size_bytes':att.get((uid,s['take']),{}).get('size_bytes'),
                             'actual_credits':s['actual_credits'],'actual_cents':s['actual_cents'],
                             'diff':None if s['compare_exit']==0 else s['compare']} for s in atts],
         'scribe_text':ch_scr[0]['scribe_text'] if ch_scr else None,
         'compare':'equal' if match else 'NOT equal',
         'retake':rt,'flags':flags,'notes':notes,'cut':cutinfo}
    if uid in PAIRS:
        mt=json.load(open(W+'/rank/%s.match.json'%uid))
        rec['carrier_match']={'rule':'SPEC §4.4 / qa.carrierTakesRule','right_unit':PAIRS[uid],'right_take':dec[PAIRS[uid]]['take'],'match_to':mt['match_to'],
             'order':[{'take':x['take'],'match_penalty':x['penalties'].get('match'),'f0_geo_hz':x['metrics']['f0_geo_hz'],'articulation':x['metrics']['articulation']} for x in mt['ranking']],
             'note':'chosen = first take in match order that passed Scribe'}
    rec['pieces']=[]
    for q in p['pieces']:
        m=meas[q['piece_id']]
        rec['pieces'].append({'piece_id':q['piece_id'],'text':q['text'],'syll':q['syll'],'file':q['out'],
            'ref_clip':q['ref_clip'] if q['process'].get('level_mode')=='rms' else None,'micro':q['micro_arg'] if q['process'].get('level_mode')=='rms' else False,
            'process':{k:q['process'].get(k) for k in ('level_mode','in_duration','out_duration','target','level','true_peak_dbtp','limiter_max_db','limiter_sec_over_1db','deess','rms_db','lufs','checks','pass','flag','trim_in_sec')},
            'measure':{k:m.get(k) for k in ('duration','speech_sec','articulation','pauses','f0_mean_hz','f0_sd_semitones','sibilance_ratio','clipping','dc','lufs','rms_db','true_peak_dbtp','clicks')}})
    sel['units'][uid]=rec
    for f in flags:
        summary_flags.append({'unit':uid,'flag':f['flag']})
sp=sum(float(r.get('cents_est') or 0) for r in ledger if r.get('kind') not in NONSPEECH)
sel['ledger']={'who':'hak-1-sel','rows':len(mine),'cents_total':round(sum(r['cents_est'] for r in mine),4),
   'scribe_calls':len([r for r in mine if r['kind']=='scribe-speech' and not r.get('reconcile')]),
   'scribe_cents':round(sum(r['cents_est'] for r in mine if r['kind']=='scribe-speech'),4),
   'retake_tts_cents':round(sum(r['cents_est'] for r in mine if r['kind']=='speech'),4),
   'scribe_estimate_vs_actual':'every Scribe row estimate (5.5 credits/s x file duration) equals the actual price reported by creative_get_flow_run_status; no reconcile rows needed',
   'speech_bucket_all_voices_cents_at_assembly':round(sp,4),'speech_cap_cents':550.0,
   'cap_bucket':'speech (550 c, both voices); Scribe for speech counted in the speech bucket'}
sel['summary']={'units':len(units),'units_with_pieces':sum(1 for u in units if sel['units'][u['id']]['pieces']),
   'pieces':sum(len(sel['units'][u['id']]['pieces']) for u in units),
   'scribe_exact_match_units':sum(1 for u in units if sel['units'][u['id']]['compare']=='equal'),
   'kulak_units':[u['id'] for u in units if any(f['flag']=='kulak' for f in sel['units'][u['id']]['flags'])],
   'retakes':[k for k in RETAKE],
   'flag_counts':{f:sum(1 for x in summary_flags if x['flag']==f) for f in sorted(set(x['flag'] for x in summary_flags))}}
json.dump(sel,open(R+'/sel/hak/selection-hak-1.json','w'),ensure_ascii=False,indent=1)
print(json.dumps(sel['summary'],ensure_ascii=False,indent=1)); print(json.dumps(sel['ledger'],ensure_ascii=False))
