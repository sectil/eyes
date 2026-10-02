import json, glob, os, sys, datetime
R = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
W = R + '/sel/nes/_w2'
sys.path.insert(0, R + '/tools'); import audio
U = json.load(open(R + '/units.json'))['units']
units = U[34:68]
rank = json.load(open(W + '/rank.json'))
pa = json.load(open(W + '/process_all.json'))
ver = json.load(open(W + '/verify.json'))
n2cut = json.load(open(W + '/cut_n2.hatirla.json'))
rank_n2all = json.load(open(W + '/rank_n2all.json')); rank_kyanall = json.load(open(W + '/rank_kyanall.json'))
rank_n2re = json.load(open(W + '/rank_retake_n2.hatirla.json')); rank_kyre = json.load(open(W + '/rank_retake_k.yan.json'))
scribes = {}
for f in sorted(glob.glob(W + '/scribe/*.json')):
    d = json.load(open(f)); scribes.setdefault(d['unit'], []).append(d)
rows = [json.loads(l) for l in open(R + '/ledger.jsonl') if l.strip()]
mine = [r for r in rows if r.get('who') == 'nes-2-sel']
cents_scribe = round(sum(float(r['cents_est']) for r in mine if r['kind'] == 'scribe-speech'), 4)
cents_retake = round(sum(float(r['cents_est']) for r in mine if r['kind'] == 'speech'), 4)
speech_total = round(sum(float(r.get('cents_est') or 0) for r in rows if r.get('kind') not in {'music', 'scribe-music', 'sfx'}), 4)

def take_meta(uid, label):
    if label.startswith('retake-'):
        tj = json.load(open(f'{R}/raw/nes/{uid}/retake/takes.json')); n = int(label[-1])
    else:
        tj = json.load(open(f'{R}/raw/nes/{uid}/takes.json')); n = int(label[1])
    t = [x for x in tj['takes'] if x['take'] == n][0]
    return {'take': label, 'file': t['file'], 'generation_id': t['generation_id'], 'session_id': t['session_id'],
            'duration_secs': t['duration_secs']}

def slim_rank(r):
    return {'take': r['take'], 'rank': r['rank'], 'score': r['score'], 'penalties': r['penalties'],
            'soft_violations': r['soft_violations'], 'reasons': r['reasons'], 'metrics': r['metrics'],
            'cut': {k: r['cut'].get(k) for k in ['needed', 'found', 'cuts_sec', 'chosen_gaps', 'margin_ratio', 'boundary_misalign', 'cut_suspect', 'pieces'] if k in r['cut']},
            'join_max_st': r.get('join_max_st'), 'joins': r.get('joins')}

MULTI_FLAG = 'kesim-kulak'
out = {'part': 'nes-2', 'voice': 'nes', 'voice_id': 'wQ7dVQFxIqwokkwsMqqn', 'sex': 'f', 'unit_index_range': [34, 67],
       'written_at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'who': 'nes-2-sel',
       'method': {
         'rank': 'audio.py rank (SPEC 4.1) on raw/nes/<id>/t1..t3.mp3',
         'scribe': 'SPEC 4.2: best take URL (fresh signed URL from creative_get_flow_run_status, md5 = local file) -> creative_attach_reference_file on flow zAYOhRc6cOKeStKp4ijv -> creative_transcribe_audio (eleven_scribe_v1, connect_from) -> poll; audio.py compare vs unit tts',
         'cut_verification': 'SPEC 4.3(c) metric-only for every multi-piece unit: (a) unavailable - Scribe returns plain text only (no word timestamps in creative_get_flow_run_status nor in the transcript .txt); (b) unavailable - no local-file upload tool exposed in this session (creative_create_asset_upload/finalize absent; get_more_tools call returned an MCP schema error). Metric checks: piece count = target, audio.py boundary_misalign <= 0.12 (syllable/speech-time band), cut at middle of the chosen silence (nearest zero crossing, 5 ms fades). Every multi-piece unit therefore carries flag kesim-kulak.',
         'process': 'audio.py process --sex f (HPF 90 Hz, trim -50 dBFS 60/250 ms, de-ess if needed, >=1 s: -18 LUFS / <=-1.5 dBTP; <1 s: phase reference speech RMS, +1 dB --micro for 1-syllable carrier items). Output 44.1 kHz mono FLOAT WAV. Phase gain NOT applied (mix.py).',
         'reference_rms': {'Derin': {'clip': 'c2.kal (processed, -18.0 LUFS)', 'speech_rms_db': pa['ref_rms_db']['Derin'], 'used_for': 'car.sayi items c2.n10..c2.n01 (<1 s); c2.n08 came out 1.105 s -> LUFS mode (-18.0 LUFS, speech RMS -17.26)'},
                           'Kapanış': {'clip': 'k.sesler', 'speech_rms_db': pa['ref_rms_db']['Kapanış'], 'used_for': 'none (no <1 s Kapanış piece)'},
                           'Varış': {'clip': 'a.x.kipir', 'speech_rms_db': pa['ref_rms_db']['Varış'], 'used_for': 'none'}},
         'extra_check': 'file-start transient ("pop") survey on all raw takes; audio.py rank click detector missed it. n2.dilek t1, k.donus t1, k.goz t1 (all ranked #1) excluded under SPEC 4.1(a) and the next take was Scribe-verified. Processed k.goz t1 showed a detected click at 34.9 ms; processed n2.dilek t1 / k.donus t1 had a digital-zero -> -28/-32 dBFS step at onset.'},
       'units': {}}
flags_all = []
for i, u in enumerate(units, start=34):
    uid = u['id']; pcs = audio.unit_pieces(u)
    src = pa['units'][uid]['source'] if 'source' in pa['units'][uid] else pa['choice'][uid]
    label = src['take']
    rec = {'idx': i, 'kind': u['kind'], 'phase': u['phase'], 'tts': u['tts'], 'screen': u['screen'],
           'screen_equals_tts': u['screen'] == u['tts'], 'chosen': take_meta(uid, label),
           'rank_order_original': [r['take'] for r in rank[uid]['ranking']], 'excluded_by_rank': rank[uid]['excluded']}
    # rank record of chosen take
    if label.startswith('retake-'):
        allr = rank_n2all if uid == 'n2.hatirla' else rank_kyanall
        rer = rank_n2re if uid == 'n2.hatirla' else rank_kyre
        rec['retake_rank_order'] = [r['take'] for r in rer['ranking']]
        rec['rank_all6_order'] = [r['take'] + ('' if int(r['take'][1]) <= 3 else ' (=retake-t%d)' % (int(r['take'][1]) - 3)) for r in allr['ranking']]
        ch = [r for r in rer['ranking'] if r['take'] == 't' + label[-1] + '.mp3'][0]
    else:
        ch = [r for r in rank[uid]['ranking'] if r['take'] == label + '.mp3'][0]
    rec['chosen_rank'] = slim_rank(ch)
    rec['scribe_attempts'] = [{k: s[k] for k in ['take', 'scribe_text', 'compare_exit', 'generation_id', 'session_id', 'stt_node', 'ref_node', 'asset_id', 'actual_credits', 'actual_cents', 'spoken_duration_secs'] if k in s} | ({'language_probability': s['language_probability']} if 'language_probability' in s else {}) for s in scribes.get(uid, [])]
    sc = [s for s in scribes.get(uid, []) if s['take'] == label]
    rec['scribe_text'] = sc[0]['scribe_text'] if sc else None
    rec['compare'] = json.JSONDecoder().raw_decode(sc[0]['compare_out'])[0] if sc else None
    rec['compare_equal'] = bool(sc and sc[0]['compare_exit'] == 0)
    flags, notes = [], []
    # pieces
    pieces = []
    if uid == 'n2.hatirla':
        rec['cut_method'] = 'sentence-boundary gap (DEVIATION from SPEC 3 longest-gap rule) + 4.3(c) metric-only'
        rec['cut'] = {k: n2cut[k] for k in ['candidates', 'spec_rule_cut (longest gap)', 'chosen_cut (sentence boundary)', 'cut_misalign_max']}
        for pid, v in n2cut['pieces'].items():
            p = v['process']
            pieces.append({'piece_id': pid, 'file': f'{R}/sel/nes/{uid}/{pid}.wav', 'text': v['text'], 'syll': v['syll'], 'cut_start': v['start'], 'cut_end': v['end'],
                           'duration': p['out_duration'], 'level_mode': p['level_mode'], 'level': p['level'], 'true_peak_dbtp': p['true_peak_dbtp'], 'deess': p['deess']['applied'], 'process_pass': p['pass']})
    elif len(pcs) == 1:
        rec['cut_method'] = 'none (single sentence)'
        p = pa['units'][uid]['process'][uid]
        pieces.append({'piece_id': uid, 'file': f'{R}/sel/nes/{uid}/{uid}.wav', 'text': u['screen'], 'syll': u['syllables'],
                       'duration': p['out_duration'], 'level_mode': p['level_mode'], 'level': p['level'], 'true_peak_dbtp': p['true_peak_dbtp'], 'deess': p['deess']['applied'], 'process_pass': p['pass']})
    else:
        c = pa['units'][uid]['cut']
        rec['cut_method'] = 'audio.py cut (longest N-1 gaps) + 4.3(c) metric-only'
        rec['cut'] = {k: c.get(k) for k in ['cuts', 'chosen_gaps', 'margin_ratio', 'boundary_misalign', 'cut_suspect', 'thr_db']}
        rec['cut']['pieces'] = [{k: q.get(k) for k in ['name', 'start', 'end', 'dur', 'speech_sec', 'syll', 'rate']} for q in c['pieces']]
        for q in pcs:
            if not q['keep']:
                continue
            pid = q['name'] if u['kind'] == 'carrier' else f'{uid}#{q["name"][1:]}'
            p = pa['units'][uid]['process'][pid]
            text = u['itemText'][q['name']] if u['kind'] == 'carrier' else u['sentences'][int(q['name'][1:]) - 1]
            d = {'piece_id': pid, 'file': f'{R}/sel/nes/{uid}/{pid}.wav', 'text': text, 'syll': q['syll'],
                 'duration': p['out_duration'], 'level_mode': p['level_mode'], 'level': p['level'], 'true_peak_dbtp': p['true_peak_dbtp'], 'deess': p['deess']['applied'], 'process_pass': p['pass']}
            if p['level_mode'] == 'rms': d.update({'ref_rms_db': p['ref_rms_db'], 'micro': p['micro']})
            pieces.append(d)
        if u['kind'] == 'carrier':
            rec['discarded'] = ['_pre ("sayıyorum:")']
    for d in pieces:
        v = ver['pieces'].get(uid, {}).get(d['piece_id'])
        if v: d['verify'] = {k: v[k] for k in ['sr', 'ch', 'subtype', 'dur', 'lufs', 'speech_rms_db', 'true_peak_dbtp', 'clicks', 'clipped']}
    rec['pieces'] = pieces
    if len(pieces) > 1:
        flags.append({'flag': MULTI_FLAG, 'reason': 'SPEC 4.3(c): cut verified by metrics only (no Scribe word timestamps, no local upload tool)'})
    # unit-specific
    if uid == 'n2.hatirla':
        flags.append({'flag': 'kulak', 'reason': 'no take passes SPEC 4.3 with the SPEC 3 cut rule: in all 3 original takes and all 3 re-takes the longest pause is after "şunu:" (inside sentence 2), so the longest-gap cut splits "... yeterli. Ya da yine şunu:" | "Kendime dinlenmeye izin veriyorum." (misalign 0.165-0.186, piece rates ~3.9 vs ~8.0 syll/s). Single re-take used (3 takes). Best of 6 = retake-t2 (Scribe exact match, 16 words).'})
        flags.append({'flag': 'kesim-kuraldisi', 'reason': 'DEVIATION needing owner/orchestrator approval: pieces cut at the sentence-boundary gap 3.791-4.255 s (2nd-longest pause, cut 4.0229 s, misalign 0.023, rates 5.04/5.52) instead of the longest gap 5.318-5.847 s, so that piece text = screen text. If rejected, this unit has no SPEC-conformant pieces.'})
        notes.append('original t1-t3 were not Scribe-checked: eliminated before 4.2 by the mandatory cut criterion (metric)')
    if uid == 'k.yan':
        flags.append({'flag': 'kulak', 'reason': 'Scribe wrote "Sırt üstü" (2 words) for "Sırtüstü" in all 6 takes (3 original + 3 re-take) -> word sequence not identical under SPEC 4.2 normalization. Every other word matched; likely Scribe orthography, not a misreading - owner to confirm by ear. Chosen = best-ranked of all 6 (retake-t1).'})
    if uid in ('n2.dilek', 'k.donus', 'k.goz'):
        notes.append('rank #1 take t1 excluded: file-start transient/pop (first 5 ms at %s then decaying), missed by audio.py click detector; next take used and Scribe-verified' % {'n2.dilek': '-30.9 dBFS', 'k.donus': '-33.4 dBFS', 'k.goz': '-54.1 dBFS (processed: click detected at 34.9 ms)'}[uid])
    if uid == 'car.sayi':
        notes.append('SPEC 4.1(f) carrier join > 2.0 st in all 3 takes (t1 4.02, t2 4.45, t3 3.41); chosen t3 joins: n04->n03 +3.16 st, n02->n01 -3.41 st, n10->n09 +2.54, n09->n08 -2.17 (soft criterion, reported)')
        notes.append('item levels: c2.n08 is 1.105 s after trim -> -18 LUFS (speech RMS -17.26); other items RMS-matched to Derin ref -17.05 dB, 1-syllable items (c2.n10 on, c2.n05 beş, c2.n04 dört, c2.n03 üç, c2.n01 bir) +1 dB micro = -16.05')
        notes.append('t3 has a file-start transient inside the discarded _pre piece only')
        notes.append('no right/left carrier in this part: SPEC 4.4 not applicable (car.sayi is a counting carrier)')
    if uid == 'k.zaman':
        notes.append('Scribe punctuated as a question ("hatırlıyorsun?"): words identical, but intonation may sound interrogative - ear check suggested')
    if uid == 'k.nefes':
        notes.append('Scribe language_probability 0.663 (low); words identical')
    for s in ch['soft_violations']:
        notes.append('soft (4.1): ' + s)
    rec['flags'] = flags; rec['notes'] = notes
    rec['accepted'] = True
    out['units'][uid] = rec
    for f in flags: flags_all.append({'unit': uid, **f})
out['summary'] = {
    'units': len(units), 'units_with_pieces': sum(1 for v in out['units'].values() if v['pieces']),
    'pieces': sum(len(v['pieces']) for v in out['units'].values()),
    'scribe_exact_match_units': sum(1 for v in out['units'].values() if v['compare_equal']),
    'flags': flags_all,
    'retakes': [{'unit': 'n2.hatirla', 'takes': 3, 'chars': 108, 'cents_est': 5.4562, 'result': 'cut still fails (same prosody); retake-t2 chosen, flagged'},
                {'unit': 'k.yan', 'takes': 3, 'chars': 40, 'cents_est': 2.0208, 'result': 'Scribe still "Sırt üstü"; retake-t1 chosen, flagged kulak'}],
    'scribe_calls': len([r for r in mine if r['kind'] == 'scribe-speech' and not r.get('reconcile')]),
    'ledger_cents_nes2sel': {'scribe_after_reconcile': cents_scribe, 'retake_speech_est': cents_retake, 'total': round(cents_scribe + cents_retake, 4)},
    'speech_cap_total_all_agents_at_write': speech_total, 'speech_cap': 550,
    'tool_notes': ['audio.py process: when speech onset < 60 ms (or tail < 250 ms) it pads digital zeros and applies the 10 ms fades to the pad, leaving the data edge unfaded; worst residual step in this part -58.1 dBFS (c4.yer head), all others <= -61 dBFS; affects other parts too',
                   'audio.py rank click detector does not catch file-start transients (see extra_check)']}
json.dump(out, open(R + '/sel/nes/selection-nes-2.json', 'w'), ensure_ascii=False, indent=1)
print(json.dumps(out['summary'], ensure_ascii=False, indent=1))
