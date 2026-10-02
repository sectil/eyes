#!/usr/bin/env python3
"""nes-2 helper (units idx 34..67): ledger append (flock, dup + cap check), download+verify, takes.json, failures.
  ledger <idx>                       -> cap/dup check, append ledger line, print tts
  quiet                              -> wait until no other agent's speech ledger line is < 20 s old (concurrency limit 5)
  dl <idx> <node_id> <requested_at> <specfile>
       specfile lines: 'sess gen xdate sig dur' or 'URL sess gen dur <url>' or 'FAILED sess gen <error...>'
  fail <idx> <json>
"""
import sys, json, os, fcntl, time, subprocess, datetime
R = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
LEDGER = f'{R}/ledger.jsonl'
VOICE = 'wQ7dVQFxIqwokkwsMqqn'
FLOW = 'zAYOhRc6cOKeStKp4ijv'
WHO = 'nes-2'
CENTS_PER_CHAR_TAKE = 0.01684
CREDITS_PER_CHAR_TAKE = 0.926
SPEECH_CAP_CENTS = 550.0
TAKES = 3
units = json.load(open(f'{R}/units.json'))['units']

def unit(i):
    i = int(i)
    assert 34 <= i <= 67, 'index outside nes-2 range'
    return units[i]

def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()

def is_speech(r):
    w = str(r.get('what', '')).lower()
    return r.get('kind') == 'speech' or 'speech' in w or 'tts' in w

def read_ledger(f):
    f.seek(0)
    out = []
    for line in f:
        line = line.strip()
        if not line: continue
        try: out.append(json.loads(line))
        except Exception: pass
    return out

def cmd_ledger(i):
    u = unit(i)
    chars = len(u['tts'])
    cents = round(chars * TAKES * CENTS_PER_CHAR_TAKE, 4)
    credits = round(chars * TAKES * CREDITS_PER_CHAR_TAKE, 3)
    with open(LEDGER, 'a+', encoding='utf-8') as f:
        fcntl.flock(f, fcntl.LOCK_EX)
        rows = read_ledger(f)
        speech_total = sum(float(r.get('cents_est', 0) or 0) for r in rows if is_speech(r))
        dup = [r for r in rows if is_speech(r) and r.get('unit') == u['id'] and r.get('voice') == 'nes']
        if dup:
            print('ABORT: ledger already has a nes line for', u['id'], [d.get('who') for d in dup]); sys.exit(2)
        if speech_total + cents > SPEECH_CAP_CENTS:
            print(f'ABORT: cap would be exceeded: {speech_total}+{cents} > {SPEECH_CAP_CENTS}'); sys.exit(3)
        rec = {'ts': now(), 'who': WHO, 'kind': 'speech', 'what': f'speech tts eleven_v4 nes {u["id"]} x{TAKES}',
               'voice': 'nes', 'voice_id': VOICE, 'unit': u['id'], 'idx': int(i), 'flow_id': FLOW,
               'chars': chars, 'takes': TAKES, 'chars_billed': chars * TAKES,
               'credits_est': credits, 'cents_est': cents,
               'speech_cents_before': round(speech_total, 4), 'speech_cents_after': round(speech_total + cents, 4)}
        f.seek(0, 2)
        f.write(json.dumps(rec, ensure_ascii=False) + '\n')
        f.flush(); os.fsync(f.fileno())
        fcntl.flock(f, fcntl.LOCK_UN)
    print('LEDGER_OK', i, u['id'], 'chars', chars, 'cents', cents, 'speech_total_after', round(speech_total + cents, 4))
    print('TTS_JSON', json.dumps(u['tts'], ensure_ascii=False))
    print('<<<' + u['tts'] + '>>>')

def cmd_quiet():
    t0 = time.time()
    while True:
        with open(LEDGER, 'r', encoding='utf-8') as f:
            rows = read_ledger(f)
        recent = []
        for r in rows:
            if r.get('who') == WHO or not is_speech(r): continue
            try:
                age = (datetime.datetime.now(datetime.timezone.utc) - datetime.datetime.fromisoformat(r['ts'])).total_seconds()
            except Exception:
                continue
            if age < 20: recent.append((r.get('who'), r.get('unit'), round(age, 1)))
        if not recent or time.time() - t0 > 90:
            print('QUIET' if not recent else 'TIMEOUT_WAITING', recent, 'waited', round(time.time() - t0, 1)); return
        time.sleep(3)

def dl(url, path):
    last = None
    for attempt in range(3):  # re-download is free; never re-generate
        if os.path.exists(path): os.remove(path)
        r = subprocess.run(['curl', '-sSfL', '--retry', '2', '-o', path, url], capture_output=True, text=True)
        if r.returncode != 0:
            last = 'curl rc=%d %s' % (r.returncode, r.stderr.strip()[:300]); continue
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

PREFIX = 'https://storage.googleapis.com/xi-backend/database/workspace/78e1a9661caa4ec69356f3c5c2fbb9c5/content_generation/'
def build_url(sess, gen, xdate, sig):
    return (PREFIX + f'{sess}/{gen}/content.mp3?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=xi-backend-prod%40xi-labs.iam.gserviceaccount.com%2F'
            f'{xdate[:8]}%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date={xdate}&X-Goog-Expires=7200&X-Goog-SignedHeaders=host&X-Goog-Signature={sig}')

def cmd_dl(i, node, req_at, spec_path):
    u = unit(i)
    gens, failed, sids = [], [], []
    echoed = None
    for line in open(spec_path, encoding='utf-8'):
        if line.startswith('PROMPT '):
            echoed = line[len('PROMPT '):].rstrip('\n'); continue
        p = line.split()
        if not p: continue
        if p[0] == 'FAILED':
            failed.append({'session_id': p[1], 'generation_id': p[2], 'error': ' '.join(p[3:])}); sids.append(p[1]); continue
        if p[0] == 'URL':
            _, sess, gen, dur, url = p
        else:
            sess, gen, xdate, sig, dur = p
            url = build_url(sess, gen, xdate, sig)
        sids.append(sess)
        gens.append({'session_id': sess, 'generation_id': gen, 'duration_secs': float(dur), 'url': url})
    d = f'{R}/raw/nes/{u["id"]}'
    os.makedirs(d, exist_ok=True)
    takes, allok = [], True
    for n, g in enumerate(gens, 1):
        p = f'{d}/t{n}.mp3'
        res = dl(g['url'], p)
        allok &= res['ok']
        takes.append({'take': n, 'file': p, 'generation_id': g['generation_id'], 'session_id': g['session_id'],
                      'url': g['url'], 'node_id': node, 'api_duration_secs': g['duration_secs'], **res})
        print(u['id'], f't{n}', {k: v for k, v in res.items()})
    out = {'unit': u['id'], 'idx': int(i), 'voice': 'nes', 'voice_id': VOICE, 'model_id': 'eleven_v4', 'flow_id': FLOW,
           'node_id': node, 'session_ids': sids, 'requested_at': req_at, 'downloaded_at': now(), 'tts': u['tts'],
           'generations_count': TAKES, 'takes': takes, 'all_ok': allok and len(takes) == TAKES,
           'n_takes_ok': sum(1 for t in takes if t['ok']), 'failed_generations': failed, 'who': WHO,
           'server_prompt_echo': echoed, 'server_prompt_equals_tts': (echoed == u['tts']) if echoed is not None else None}
    print('PROMPT_ECHO_MATCH', out['server_prompt_equals_tts'])
    json.dump(out, open(f'{d}/takes.json', 'w'), ensure_ascii=False, indent=1)
    with open(f'{R}/raw/nes/_nes2_calls.jsonl', 'a') as f:
        f.write(json.dumps({'idx': int(i), 'unit': u['id'], 'flow_id': FLOW, 'node_id': node, 'session_ids': sids,
                            'requested_at': req_at, 'n_completed': len(gens), 'n_failed': len(failed),
                            'n_downloaded_ok': out['n_takes_ok']}) + '\n')
    print('TAKES_JSON', f'{d}/takes.json', 'all_ok', out['all_ok'], 'n_ok', out['n_takes_ok'])

def cmd_fail(i, js):
    u = unit(i)
    p = f'{R}/raw/nes/_failed.json'
    with open(p + '.lock', 'a') as lk:
        fcntl.flock(lk, fcntl.LOCK_EX)
        cur = json.load(open(p)) if os.path.exists(p) else []
        rec = json.loads(js); rec.update({'unit': u['id'], 'idx': int(i), 'who': WHO, 'ts': now()})
        cur.append(rec)
        json.dump(cur, open(p, 'w'), ensure_ascii=False, indent=1)
    print('FAIL_RECORDED', u['id'])

if __name__ == '__main__':
    c = sys.argv[1]
    if c == 'ledger': cmd_ledger(sys.argv[2])
    elif c == 'quiet': cmd_quiet()
    elif c == 'dl': cmd_dl(*sys.argv[2:6])
    elif c == 'fail': cmd_fail(sys.argv[2], sys.argv[3])
