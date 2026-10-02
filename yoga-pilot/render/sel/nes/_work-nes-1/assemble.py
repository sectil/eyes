import json, os, glob, datetime, sys
R='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
W=R+'/sel/nes/_work-nes-1'
sys.path.insert(0,R+'/tools'); import audio
units=json.load(open(R+'/units.json'))['units'][0:34]
proc=json.load(open(W+'/proc.json')); ver=json.load(open(W+'/verify_out.json'))
ledger=[json.loads(l) for l in open(R+'/ledger.jsonl') if l.strip()]
mine=[r for r in ledger if r.get('who')=='nes-1-sel']
def rankfile(uid):
    for suf in ('.retake','.match',''):
        p=W+'/rank/%s%s.json'%(uid,suf)
        if os.path.exists(p): return p, suf
scr={}
for f in glob.glob(W+'/scribe/*.json'):
    s=json.load(open(f)); scr.setdefault(s['unit'],[]).append(s)
CUT_METHOD_NOTE=("(c) metric-only: (a) unavailable - Scribe results expose only plain text (creative_get_flow_run_status 'transcripts'[].text and the content.txt download; "
 "checked on a.hosgeldin: 31-byte plain text), no word timestamps; (b) unavailable - ElevenLabs get_more_tools call failed (malformed result: missing resultType) and no "
 "creative_create_asset_upload / finalize tool is present in this session, and attach_reference_file needs a public https URL; checks used: piece count == target, "
 "per-piece syllable/duration rate band (boundary_misalign <= 0.12), cut at zero crossing near middle of pure silence, 5 ms edge fades")
REF={'Derinleşme':'c1.tekrar','Varış':'a.acilis','Derin':'c2.alt'}
sel={'part':'nes-1','voice':'nes','voice_id':'wQ7dVQFxIqwokkwsMqqn','sex':'f','unit_index_range':[0,33],
     'generated_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),
     'spec':'render/SPEC.md §3-§4','tools':'render/tools/audio.py (rank, cut, process, compare)',
     'scribe_route':'creative_attach_reference_file(url = take URL from creative_get_flow_run_status of the take session; stored URLs in takes.json had expired at ~11:39Z) -> creative_transcribe_audio(eleven_scribe_v1, connect_from) -> poll; attached size_bytes checked equal to local take file bytes for every take',
     'cut_verification_method':CUT_METHOD_NOTE,
     'reference_rms_for_short_pieces':{ph:{'clip':u,'speech_rms_db':proc[u]['pieces'][0]['process']['rms_db']} for ph,u in REF.items()},
     'units':{}}
for u in units:
    uid=u['id']; p=proc.get(uid) or {'take':'t4.mp3','src':R+'/raw/nes/n1.sec/t4.mp3'}; take=p['take']
    rf,suf=rankfile(uid); rk=json.load(open(rf))
    chosen=[x for x in rk['ranking'] if x['take']==take][0]
    atts=sorted(scr.get(uid,[]),key=lambda s:int(s['take'][1:]))
    ch_s=[s for s in atts if s['take']+'.mp3'==take]
    flags=[]; notes=[]
    pcs=audio.unit_pieces(u); multi=len([q for q in pcs])>1
    if multi: flags.append({'flag':'kesim-kulak','reason':'SPEC §4.3(c): cut verified by metrics only (no word timestamps, no upload tool)'})
    if uid=='a.durus':
        flags.append({'flag':'kulak','reason':"Scribe on all 5 takes (t1,t2 + re-take t4,t5,t6) returns 'Sırt üstü' vs tts 'Sırtüstü' (compound written apart by Scribe; only difference); single re-take used; best-ranked take t4 kept"})
    if uid=='n1.sec':
        flags.append({'flag':'kulak','reason':"all 6 takes (t1-t3 + re-take t4-t6): longest pause is the colon pause after 'önerim şu:' (0.55-0.56 s) not the sentence end, so the SPEC §3 longest-pause cut splits the wrong place (piece 2 would read 11 syll/s = 'Kendime dinlenmeye izin veriyorum.' only). Scribe of t4 matches the tts exactly."})
        flags.append({'flag':'kesim-kural-sapmasi','reason':"delivered pieces n1.sec#1/#2 are cut at the sentence-end pause (gap 2.699-3.168 s, 0.469 s; boundary_misalign 0.015, rates 5.70/5.49 syll/s) chosen by SPEC §4.3(c) metrics instead of the longest pause (5.473-6.036 s); deviation from SPEC §3 'longest N-1 pauses' made so that screen text = spoken text; orchestrator/owner decides (alternative: reject n1.sec)",
                      'cut_report':W+'/cuts/n1.sec/cut_report.json'})
    sv=chosen.get('soft_violations',[])
    for s in sv: notes.append(s)
    if chosen.get('join_max_st') is not None and chosen['join_max_st']>2.0:
        flags.append({'flag':'eklem>2yt','reason':'SPEC §3/§4.1(f) carrier join F0 step max %.2f st > 2.0 st (all takes of this unit exceed; soft criterion, reported)'%chosen['join_max_st']})
    rec={'kind':u['kind'],'phase':u['phase'],'tts':u['tts'],'screen':u['screen'],'screen_equals_tts':u['screen']==u['tts'],
         'chosen_take':take,'chosen_take_file':p['src'],
         'rank_file':rf,'rank_rule':rk['order_rule'],'rank_position':chosen['rank'],'n_takes_ranked':len(rk['ranking']),'excluded_takes':rk['excluded'],
         'rank_reasons':chosen['reasons'],'soft_violations':sv,'penalties':chosen['penalties'],'score':chosen['score'],'metrics':chosen['metrics'],
         'all_takes':[{'take':x['take'],'rank':x['rank'],'score':x['score'],'soft_violations':x['soft_violations'],'articulation':x['metrics']['articulation'],'active_sec':x['metrics']['active_sec']} for x in rk['ranking']],
         'scribe_attempts':[{'take':s['take'],'text':s['scribe_text'],'match':s['compare_exit']==0,'generation_id':s['generation_id'],'session_id':s['session_id'],'actual_cents':s['actual_cents'],
                             'diff':(json.loads(s['compare_out'][:s['compare_out'].rfind('}')+1]).get('diff') if s['compare_exit']!=0 else None)} for s in atts],
         'scribe_text':ch_s[0]['scribe_text'] if ch_s else None,
         'compare':('equal' if ch_s and ch_s[0]['compare_exit']==0 else ('NOT equal' if ch_s else 'not run')),
         'retake':None,'flags':flags,'notes':notes}
    rt=json.load(open(R+'/raw/nes/%s/takes.json'%uid)).get('retake')
    if rt: rec['retake']={'node_id':rt['node_id'],'session_ids':rt['session_ids'],'takes':[t['take'] for t in rt['takes']],'reason':rt.get('reason'),'ledger_rows':[r['ts'] for r in mine if r.get('kind')=='speech' and r.get('unit')==uid]}
    if suf=='.match':
        rid=uid.replace('sol','sag'); rtk=proc[rid]['take']
        rrk=json.load(open(W+'/rank/%s.json'%rid)); rm=[x for x in rrk['ranking'] if x['take']==rtk][0]['metrics']
        rec['carrier_pairing']={'rule':'SPEC §4.4 / qa.carrierTakesRule: left take = valid take closest in pitch and rate to the chosen right take','right_unit':rid,'right_take':rtk,
                                'right_f0_geo_hz':rm['f0_geo_hz'],'right_articulation':rm['articulation'],'left_f0_geo_hz':chosen['metrics']['f0_geo_hz'],'left_articulation':chosen['metrics']['articulation'],
                                'match_penalty':chosen['penalties'].get('match'),'right_side_in_this_part':True}
    if u['kind']=='carrier' and uid.startswith('car.sag'):
        rec['carrier_pairing']={'left_unit':uid.replace('sag','sol'),'left_side_in_this_part':True}
    if uid=='n1.sec':
        cr=json.load(open(W+'/cuts/n1.sec/cut_report.json'))
        rec['cut']={'method':'(c) metric-only, sentence-end pause selected by syllable alignment (see flags)','cuts_sec':[cr['chosen']['cut_sec']],'chosen_gap':cr['chosen'],'longest_gap_rule_cut':cr['longest_gap'],'candidates':cr['candidates']}
        pieces=[]
        for k,(pm) in enumerate(pcs):
            pj=json.load(open(W+'/cuts/n1.sec/proc_%d.json'%(k+1)))
            pieces.append({'piece_id':'n1.sec#%d'%(k+1),'text':pm['text'],'syll':pm['syll'],'file':R+'/sel/nes/n1.sec/n1.sec#%d.wav'%(k+1),
                           'process':{kk:pj.get(kk) for kk in ('level_mode','out_duration','level','true_peak_dbtp','limiter_max_db','deess','flag','pass','rms_db','lufs')},
                           'measure':ver[uid]['n1.sec#%d'%(k+1)]})
        rec['pieces']=pieces
    else:
        if p.get('cut'):
            c=p['cut']; rec['cut']={'method':'(c) metric-only','cuts_sec':c['cuts'],'gaps_available':c['gaps_available'],'chosen_gaps':c.get('chosen_gaps'),'shortest_chosen_gap':c.get('shortest_chosen_gap'),
                                   'longest_unchosen_gap':c.get('longest_unchosen_gap'),'margin_ratio':c.get('margin_ratio'),'boundary_misalign':c.get('boundary_misalign'),'cut_suspect':c.get('cut_suspect'),
                                   'piece_rates':[{'name':q['name'],'syll':q.get('syll'),'speech_sec':q['speech_sec'],'rate':q.get('rate')} for q in c['pieces']]}
        else: rec['cut']={'method':'none (single sentence clip)'}
        rec['pieces']=[{'piece_id':q['piece_id'],'text':q['text'],'syll':q['syll'],'file':q['out'],'ref_clip':q['ref_clip'] if q['process'].get('level_mode')=='rms' else None,
                        'micro':q['micro_arg'] if q['process'].get('level_mode')=='rms' else False,
                        'process':{kk:q['process'].get(kk) for kk in ('level_mode','out_duration','target','level','true_peak_dbtp','limiter_max_db','deess','flag','pass','rms_db','lufs')},
                        'measure':ver[uid][q['piece_id']]} for q in p['pieces']]
    if u['kind']=='carrier': rec['joins_raw_take']=chosen.get('joins')
    rec['accepted']= not any(f['flag'] in ('kulak',) for f in flags)
    sel['units'][uid]=rec
tot=sum(float(r.get('cents_est') or 0) for r in mine)
sel['ledger']={'who':'nes-1-sel','rows':len(mine),'cents_total':round(tot,4),
               'scribe_cents':round(sum(float(r.get('cents_est') or 0) for r in mine if r.get('kind')=='scribe-speech'),4),
               'retake_tts_cents':round(sum(float(r.get('cents_est') or 0) for r in mine if r.get('kind')=='speech'),4),
               'cap_bucket':'speech (550 c, both voices); Scribe for speech counted in the speech bucket'}
json.dump(sel,open(R+'/sel/nes/selection-nes-1.json','w'),ensure_ascii=False,indent=1,default=lambda v: v.item() if hasattr(v,'item') else str(v))
acc=[k for k,v in sel['units'].items() if v['accepted']]
print('units',len(sel['units']),'accepted',len(acc),'pieces',sum(len(v['pieces']) for v in sel['units'].values()))
for k,v in sel['units'].items():
    fl=[f['flag'] for f in v['flags']]
    print('%-14s %-6s rank%d/%d scribe:%-9s flags:%s notes:%s'%(k,v['chosen_take'],v['rank_position'],v['n_takes_ranked'],v['compare'],fl,v['notes']))
print(sel['ledger'])
