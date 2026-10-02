#!/usr/bin/env python3
"""hak-2 helper (units idx 34..67, voice hak). Derived from hak-1 helper; same in-flight protocol.
  ledger now waits (under repeated flock attempts) until nothing else is in flight, then appends.
  ids                         -> print idx, id, chars for 0..33
  quiet                       -> wait until no other agent's paid call is in flight (account limit: 5 concurrent requests)
  ledger <idx>                -> under flock: in-flight re-check, dup check, cap check, append ledger line, print tts
  dl <idx> <node_id> <requested_at> <specfile>
       specfile lines: 'OK <session_id> <generation_id> <duration_secs> <url>' or 'FAILED <session_id> <generation_id> <error...>'
  fail <idx> <json>           -> append record to raw/hak/_failed.json (flock)
  summary                     -> counts for hak-1
"""
import sys, json, os, fcntl, time, subprocess, datetime
R = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
LEDGER = f'{R}/ledger.jsonl'
VOICE = 'DwjDVVARfPVjBKepXK2c'
FLOW = 'zAYOhRc6cOKeStKp4ijv'
WHO = 'hak-2'
LO, HI = 34, 67
CENTS_PER_CHAR_TAKE = 0.01684
CREDITS_PER_CHAR_TAKE = 0.926
SPEECH_CAP_CENTS = 550.0
TAKES = 3
units = json.load(open(f'{R}/units.json'))['units']
CALLS = f'{R}/raw/hak/_hak2_calls.jsonl'

def unit(i):
    i = int(i)
    assert LO <= i <= HI, 'index outside hak-2 range'
    return units[i]

def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()

def is_speech(r):
    w = str(r.get('what', '')).lower()
    return r.get('kind') == 'speech' or 'speech' in w or 'tts' in w

def read_rows(f):
    f.seek(0); out = []
    for line in f:
        line = line.strip()
        if not line: continue
        try: out.append(json.loads(line))
        except Exception: pass
    return out

def age(r):
    try:
        return (datetime.datetime.now(datetime.timezone.utc) - datetime.datetime.fromisoformat(r['ts'])).total_seconds()
    except Exception:
        return 1e9

def completed(r):
    """another agent's speech line counts as done once its takes.json (or a failure record) is written after the ledger ts"""
    v, u = r.get('voice'), r.get('unit')
    if not v or not u: return False
    p = f'{R}/raw/{v}/{u}/takes.json'
    try:
        t = json.load(open(p))
        b = datetime.datetime.fromisoformat(t['downloaded_at'].replace('Z', '+00:00'))
        a = datetime.datetime.fromisoformat(r['ts'])
        return b >= a
    except Exception:
        return False

def in_flight(rows):
    busy = []
    for r in rows:
        if r.get('who') == WHO: continue
        a = age(r)
        if a < 25:
            busy.append((r.get('who'), r.get('unit'), round(a, 1), 'recent')); continue
        if is_speech(r) and a < 120 and not completed(r):
            busy.append((r.get('who'), r.get('unit'), round(a, 1), 'not-downloaded'))
    return busy

def cmd_quiet():
    t0 = time.time()
    while True:
        with open(LEDGER, 'r', encoding='utf-8') as f:
            busy = in_flight(read_rows(f))
        if not busy:
            print('QUIET waited', round(time.time() - t0, 1)); return
        if time.time() - t0 > 240:
            print('STILL_BUSY', busy, 'waited', round(time.time() - t0, 1)); sys.exit(5)
        time.sleep(1.5)

def cmd_ledger(i):
    u = unit(i)
    chars = len(u['tts'])
    cents = round(chars * TAKES * CENTS_PER_CHAR_TAKE, 4)
    credits = round(chars * TAKES * CREDITS_PER_CHAR_TAKE, 3)
    # fairness yield: if my line is the latest speech line and another agent was active in the last 10 min,
    # give it up to 45 s to take its turn (a newer line by someone else) before competing for the slot.
    ty = time.time()
    with open(LEDGER, 'r', encoding='utf-8') as g:
        rows0 = read_rows(g)
    sp = [r for r in rows0 if is_speech(r)]
    others_active = any(r.get('who') != WHO and age(r) < 600 for r in sp)
    if sp and sp[-1].get('who') == WHO and others_active:
        n0 = len(rows0)
        while time.time() - ty < 45:
            time.sleep(1.0)
            with open(LEDGER, 'r', encoding='utf-8') as g:
                rows1 = read_rows(g)
            if any(r.get('who') != WHO for r in rows1[n0:]):
                break
    print('YIELDED', round(time.time() - ty, 1))
    t0 = time.time()
    while True:
        f = open(LEDGER, 'a+', encoding='utf-8')
        fcntl.flock(f, fcntl.LOCK_EX)
        rows = read_rows(f)
        busy = in_flight(rows)
        if not busy:
            break
        fcntl.flock(f, fcntl.LOCK_UN); f.close()
        if time.time() - t0 > 330:
            print('BUSY_TIMEOUT', busy); sys.exit(4)
        time.sleep(1.5)
    print('WAITED', round(time.time() - t0, 1))
    with f:
        speech_total = sum(float(r.get('cents_est', 0) or 0) for r in rows if is_speech(r))
        if any(is_speech(r) and r.get('unit') == u['id'] and r.get('voice') == 'hak' for r in rows):
            fcntl.flock(f, fcntl.LOCK_UN)
            print('ABORT: ledger already has a hak line for', u['id']); sys.exit(2)
        if speech_total + cents > SPEECH_CAP_CENTS:
            fcntl.flock(f, fcntl.LOCK_UN)
            print(f'ABORT: cap would be exceeded: {speech_total}+{cents} > {SPEECH_CAP_CENTS}'); sys.exit(3)
        rec = {'ts': now(), 'who': WHO, 'kind': 'speech', 'what': f'speech tts eleven_v4 hak {u["id"]} x{TAKES}',
               'voice': 'hak', 'voice_id': VOICE, 'unit': u['id'], 'idx': int(i), 'flow_id': FLOW,
               'chars': chars, 'takes': TAKES, 'chars_billed': chars * TAKES,
               'credits_est': credits, 'cents_est': cents,
               'speech_cents_before': round(speech_total, 4), 'speech_cents_after': round(speech_total + cents, 4)}
        f.seek(0, 2)
        f.write(json.dumps(rec, ensure_ascii=False) + '\n')
        f.flush(); os.fsync(f.fileno())
        fcntl.flock(f, fcntl.LOCK_UN)
    print('LEDGER_OK', i, u['id'], 'chars', chars, 'cents', cents, 'speech_total_after', round(speech_total + cents, 4))
    print('TTS_JSON', json.dumps(u['tts'], ensure_ascii=False))

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

def cmd_dl(i, node, req_at, spec):
    u = unit(i)
    d = f'{R}/raw/hak/{u["id"]}'
    os.makedirs(d, exist_ok=True)
    gens, failed, sids = [], [], []
    echoed = None
    for line in open(spec, encoding='utf-8'):
        if line.startswith('PROMPT '):
            echoed = line[len('PROMPT '):].rstrip('\n'); continue
        p = line.split()
        if not p: continue
        if p[0] == 'FAILED':
            failed.append({'session_id': p[1], 'generation_id': p[2], 'error': ' '.join(p[3:])}); sids.append(p[1]); continue
        if p[0] == 'S':  # compact: S <sess> <gen> <xdate> <sig> <dur>
            assert len(p) == 6, line
            url = ('https://storage.googleapis.com/xi-backend/database/workspace/78e1a9661caa4ec69356f3c5c2fbb9c5/content_generation/'
                   f'{p[1]}/{p[2]}/content.mp3?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=xi-backend-prod%40xi-labs.iam.gserviceaccount.com%2F'
                   f'{p[3][:8]}%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date={p[3]}&X-Goog-Expires=7200&X-Goog-SignedHeaders=host&X-Goog-Signature={p[4]}')
            p = ['OK', p[1], p[2], p[5], url]
        assert p[0] == 'OK' and len(p) == 5, line
        sids.append(p[1])
        gens.append({'session_id': p[1], 'generation_id': p[2], 'api_duration_secs': float(p[3]), 'url': p[4]})
    takes, allok = [], True
    for n, g in enumerate(gens, 1):
        path = f'{d}/t{n}.mp3'
        res = dl(g['url'], path)
        allok &= res['ok']
        takes.append({'take': n, 'file': path, 'generation_id': g['generation_id'], 'session_id': g['session_id'],
                      'url': g['url'], 'node_id': node, 'api_duration_secs': g['api_duration_secs'], **res})
        print(u['id'], f't{n}', {k: v for k, v in res.items()})
    out = {'unit': u['id'], 'idx': int(i), 'voice': 'hak', 'voice_id': VOICE, 'model_id': 'eleven_v4', 'flow_id': FLOW,
           'node_id': node, 'session_ids': sids, 'requested_at': req_at, 'downloaded_at': now(), 'tts': u['tts'],
           'generations_count': TAKES, 'takes': takes, 'all_ok': allok and len(takes) == TAKES,
           'n_takes_ok': sum(1 for t in takes if t['ok']), 'failed_generations': failed, 'who': WHO,
           'server_prompt_echo': echoed, 'server_prompt_equals_tts': (echoed == u['tts']) if echoed is not None else None}
    print('PROMPT_ECHO_MATCH', out['server_prompt_equals_tts'])
    json.dump(out, open(f'{d}/takes.json', 'w'), ensure_ascii=False, indent=1)
    with open(CALLS, 'a') as f:
        f.write(json.dumps({'idx': int(i), 'unit': u['id'], 'flow_id': FLOW, 'node_id': node, 'session_ids': sids,
                            'requested_at': req_at, 'n_completed': len(gens), 'n_failed': len(failed),
                            'n_downloaded_ok': out['n_takes_ok']}) + '\n')
    print('TAKES_JSON', f'{d}/takes.json', 'n_ok', out['n_takes_ok'], 'failed', len(failed))

def cmd_fail(i, js):
    u = unit(i)
    p = f'{R}/raw/hak/_failed.json'
    with open(p + '.lock', 'a') as lk:
        fcntl.flock(lk, fcntl.LOCK_EX)
        cur = json.load(open(p)) if os.path.exists(p) else []
        rec = json.loads(js); rec.update({'unit': u['id'], 'idx': int(i), 'who': WHO, 'ts': now()})
        cur.append(rec)
        json.dump(cur, open(p, 'w'), ensure_ascii=False, indent=1)
        fcntl.flock(lk, fcntl.LOCK_UN)
    print('FAIL_RECORDED', u['id'])

def cmd_ids():
    for i in range(LO, HI + 1):
        print(i, units[i]['id'], len(units[i]['tts']))

def cmd_summary():
    rows = [json.loads(l) for l in open(LEDGER) if l.strip()]
    mine = [r for r in rows if r.get('who') == WHO]
    print('ledger lines', len(mine), 'chars', sum(r['chars'] for r in mine), 'chars_billed', sum(r['chars_billed'] for r in mine),
          'cents', round(sum(r['cents_est'] for r in mine), 4), 'credits', round(sum(r['credits_est'] for r in mine), 3))
    done = tk = 0
    for i in range(LO, HI + 1):
        p = f'{R}/raw/hak/{units[i]["id"]}/takes.json'
        if os.path.exists(p):
            t = json.load(open(p)); done += 1; tk += t['n_takes_ok']
    print('units with takes.json', done, 'takes ok', tk)

if __name__ == '__main__':
    c = sys.argv[1]
    if c == 'ids': cmd_ids()
    elif c == 'quiet': cmd_quiet()
    elif c == 'ledger': cmd_ledger(sys.argv[2])
    elif c == 'dl': cmd_dl(*sys.argv[2:6])
    elif c == 'fail': cmd_fail(sys.argv[2], sys.argv[3])
    elif c == 'summary': cmd_summary()
