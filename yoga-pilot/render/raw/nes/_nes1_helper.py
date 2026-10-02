#!/usr/bin/env python3
"""nes-1 helper: ledger append (flock, cap check), unit text print, download+verify, takes.json.
Usage:
  ledger <idx>            -> checks cap, appends ledger line, prints tts between markers
  show <idx>              -> prints id and tts (json + raw)
  download <idx> <json>   -> json: {"flow_id","node_id","session_ids","requested_at","gens":[{generation_id,url}...]}
  fail <idx> <json>       -> append failure record to _failed.json
"""
import sys, json, os, fcntl, time, subprocess, datetime
R = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
LEDGER = f'{R}/ledger.jsonl'
VOICE = 'wQ7dVQFxIqwokkwsMqqn'
FLOW = 'zAYOhRc6cOKeStKp4ijv'
CENTS_PER_CHAR_TAKE = 0.01684
CREDITS_PER_CHAR_TAKE = 0.926
SPEECH_CAP_CENTS = 550.0
TAKES = 3
units = json.load(open(f'{R}/units.json'))['units']

def unit(i):
    i = int(i)
    assert 0 <= i <= 33, 'index outside nes-1 range'
    return units[i]

def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()

def cmd_ledger(i):
    u = unit(i)
    chars = len(u['tts'])
    cents = round(chars * TAKES * CENTS_PER_CHAR_TAKE, 4)
    credits = round(chars * TAKES * CREDITS_PER_CHAR_TAKE, 3)
    with open(LEDGER, 'a+', encoding='utf-8') as f:
        fcntl.flock(f, fcntl.LOCK_EX)
        f.seek(0)
        speech_total = 0.0
        dup = False
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                r = json.loads(line)
            except Exception:
                continue
            w = str(r.get('what', '')).lower()
            if r.get('kind') == 'speech' or 'speech' in w or 'tts' in w:
                speech_total += float(r.get('cents_est', 0) or 0)
            if r.get('who') == 'nes-1' and r.get('unit') == u['id'] and r.get('voice') == 'nes':
                dup = True
        if dup:
            print('ABORT: ledger already has a nes-1 line for', u['id'], '(no second call without SPEC 4 retake rule)')
            sys.exit(2)
        if speech_total + cents > SPEECH_CAP_CENTS:
            print(f'ABORT: cap would be exceeded: {speech_total}+{cents} > {SPEECH_CAP_CENTS}')
            sys.exit(3)
        rec = {'ts': now(), 'who': 'nes-1', 'kind': 'speech', 'what': f'speech tts eleven_v4 nes {u["id"]} x{TAKES}',
               'voice': 'nes', 'voice_id': VOICE, 'unit': u['id'], 'idx': int(i), 'flow_id': FLOW,
               'chars': chars, 'takes': TAKES, 'chars_billed': chars * TAKES,
               'credits_est': credits, 'cents_est': cents,
               'speech_cents_before': round(speech_total, 4), 'speech_cents_after': round(speech_total + cents, 4)}
        f.seek(0, 2)
        f.write(json.dumps(rec, ensure_ascii=False) + '\n')
        f.flush(); os.fsync(f.fileno())
        fcntl.flock(f, fcntl.LOCK_UN)
    print('LEDGER_OK', u['id'], 'chars', chars, 'cents', cents, 'speech_total_after', round(speech_total + cents, 4))
    print('TTS_JSON', json.dumps(u['tts'], ensure_ascii=False))
    print('<<<' + u['tts'] + '>>>')

def cmd_show(i):
    u = unit(i)
    print(i, u['id'], len(u['tts']))
    print('TTS_JSON', json.dumps(u['tts'], ensure_ascii=False))
    print('<<<' + u['tts'] + '>>>')

def dl(url, path):
    last = None
    for attempt in range(3):  # re-download (free) if file corrupt; never re-generate
        if os.path.exists(path):
            os.remove(path)
        r = subprocess.run(['curl', '-sSfL', '--retry', '2', '-o', path, url], capture_output=True, text=True)
        if r.returncode != 0:
            last = 'curl rc=%d %s' % (r.returncode, r.stderr.strip()[:300])
            continue
        try:
            import soundfile as sf
            info = sf.info(path)
            d, sr = sf.read(path, dtype='float32')
            dur = len(d) / sr
            if dur > 0.3:
                return {'ok': True, 'duration_secs': round(dur, 4), 'info_duration': round(info.duration, 4),
                        'samplerate': sr, 'channels': info.channels, 'bytes': os.path.getsize(path), 'attempts': attempt + 1}
            last = f'duration too short {dur}'
        except Exception as e:
            last = 'soundfile: ' + repr(e)[:300]
    return {'ok': False, 'error': last}

def cmd_download(i, js):
    u = unit(i)
    meta = json.loads(js)
    d = f'{R}/raw/nes/{u["id"]}'
    os.makedirs(d, exist_ok=True)
    takes = []
    allok = True
    for n, g in enumerate(meta['gens'], 1):
        p = f'{d}/t{n}.mp3'
        res = dl(g['url'], p)
        allok &= res['ok']
        takes.append({'take': n, 'file': p, 'generation_id': g.get('generation_id'), 'session_id': g.get('session_id'),
                      'url': g['url'], 'node_id': meta['node_id'], 'api_duration_secs': g.get('duration_secs'), **res})
        print(u['id'], f't{n}', res)
    out = {'unit': u['id'], 'idx': int(i), 'voice': 'nes', 'voice_id': VOICE, 'model_id': 'eleven_v4', 'flow_id': meta['flow_id'],
           'node_id': meta['node_id'], 'session_ids': meta.get('session_ids'), 'requested_at': meta.get('requested_at'),
           'downloaded_at': now(), 'tts': u['tts'], 'generations_count': TAKES, 'takes': takes, 'all_ok': allok,
           'n_takes_ok': sum(1 for t in takes if t['ok']), 'failed_generations': meta.get('failed', [])}
    json.dump(out, open(f'{d}/takes.json', 'w'), ensure_ascii=False, indent=1)
    print('TAKES_JSON', f'{d}/takes.json', 'all_ok', allok)

def cmd_fail(i, js):
    u = unit(i)
    p = f'{R}/raw/nes/_failed.json'
    cur = json.load(open(p)) if os.path.exists(p) else []
    rec = json.loads(js); rec.update({'unit': u['id'], 'idx': int(i), 'who': 'nes-1', 'ts': now()})
    cur.append(rec)
    json.dump(cur, open(p, 'w'), ensure_ascii=False, indent=1)
    print('FAIL_RECORDED', u['id'])

if __name__ == '__main__':
    c = sys.argv[1]
    if c == 'ledger': cmd_ledger(sys.argv[2])
    elif c == 'show': cmd_show(sys.argv[2])
    elif c == 'download': cmd_download(sys.argv[2], sys.argv[3])
    elif c == 'fail': cmd_fail(sys.argv[2], sys.argv[3])

def build_url(sess, gen, xdate, sig):
    return ('https://storage.googleapis.com/xi-backend/database/workspace/78e1a9661caa4ec69356f3c5c2fbb9c5/content_generation/'
            f'{sess}/{gen}/content.mp3?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=xi-backend-prod%40xi-labs.iam.gserviceaccount.com%2F'
            f'{xdate[:8]}%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date={xdate}&X-Goog-Expires=7200&X-Goog-SignedHeaders=host&X-Goog-Signature={sig}')

def cmd_dl2(i, node, req_at, spec_path):
    """spec file lines: sess gen xdate sig dur   (or: FAILED sess gen error...)"""
    gens, failed, sids = [], [], []
    for line in open(spec_path):
        p = line.split()
        if not p: continue
        if p[0] == 'FAILED':
            failed.append({'session_id': p[1], 'generation_id': p[2], 'error': ' '.join(p[3:])}); sids.append(p[1]); continue
        sess, gen, xdate, sig, dur = p
        sids.append(sess)
        gens.append({'session_id': sess, 'generation_id': gen, 'duration_secs': float(dur), 'url': build_url(sess, gen, xdate, sig)})
    meta = {'flow_id': FLOW, 'node_id': node, 'session_ids': sids, 'requested_at': req_at, 'gens': gens, 'failed': failed}
    json.dump(meta, open(f'{R}/raw/nes/_meta/{int(i)}.json', 'w'), indent=1)
    with open(f'{R}/raw/nes/_nes1_calls.jsonl', 'a') as f:
        f.write(json.dumps({'idx': int(i), 'unit': unit(i)['id'], 'flow_id': FLOW, 'node_id': node, 'session_ids': sids,
                            'requested_at': req_at, 'n_completed': len(gens), 'n_failed': len(failed)}) + '\n')
    cmd_download(i, json.dumps(meta))

if __name__ == '__main__' and sys.argv[1] == 'dl2':
    cmd_dl2(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5])
