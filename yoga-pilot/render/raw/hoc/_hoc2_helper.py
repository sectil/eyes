#!/usr/bin/env python3
"""hoc-2 helper (units idx 34..67, voice hoc = Nefona Hoca Sr5w7dIZaRDglJ2cLaJm).
  ledger <idx...>        -> under flock: dup check, workflow cap check (who hoc-*), append one speech line per idx, print tts
  retake <idx> <reason>  -> ledger line for a SPEC 4.2 re-take (x3)
  scribe <unit> <sec> <label> -> ledger line for a Scribe call (5.5 credits/s est)
  inflight               -> other hoc agents' possibly-in-flight paid calls
  dl <idx> <node_id> <requested_at> <specfile> [subdir]   (spec: 'OK sess gen dur url' / 'FAILED sess gen err' / 'PROMPT text')
  total                  -> workflow credit totals
"""
import sys, json, os, fcntl, time, subprocess, datetime
R = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
LEDGER = f'{R}/ledger.jsonl'
VOICE = 'Sr5w7dIZaRDglJ2cLaJm'
FLOW = 'zAYOhRc6cOKeStKp4ijv'
WHO = 'hoc-2'
LO, HI = 34, 67
CREDITS_PER_CHAR_TAKE = 152.9847 / 153   # estimate_only on c2.akis x3 with this voice (1,0 kredi/karakter/çekim)
CENTS_PER_CHAR_TAKE = 2.78154 / 153
SCRIBE_CREDITS_PER_SEC = 5.5
CAP = 20000.0
TAKES = 3
units = json.load(open(f'{R}/units.json'))['units']
CALLS = f'{R}/raw/hoc/_hoc2_calls.jsonl'

def unit(i):
    i = int(i); assert LO <= i <= HI, 'index outside hoc-2 range'; return units[i]
def now(): return datetime.datetime.now(datetime.timezone.utc).isoformat()
def rows_of(f):
    f.seek(0); out = []
    for l in f:
        l = l.strip()
        if l:
            try: out.append(json.loads(l))
            except Exception: pass
    return out
def wf_total(rows):
    return sum(float(r.get('credits_est') or 0) for r in rows if str(r.get('who', '')).startswith('hoc'))

def append(recs):
    with open(LEDGER, 'a+', encoding='utf-8') as f:
        fcntl.flock(f, fcntl.LOCK_EX)
        rows = rows_of(f)
        tot = wf_total(rows)
        add = sum(r['credits_est'] for r in recs)
        for r in recs:
            if r['kind'] == 'speech' and any(x.get('kind') == 'speech' and x.get('voice') == 'hoc' and x.get('unit') == r['unit'] for x in rows):
                print('ABORT dup speech line for', r['unit']); sys.exit(2)
        if tot + add > CAP:
            print(f'ABORT cap: {tot:.1f}+{add:.1f} > {CAP}'); sys.exit(3)
        run = tot
        for r in recs:
            r['workflow_credits_before'] = round(run, 3); run += r['credits_est']; r['workflow_credits_after'] = round(run, 3)
            f.seek(0, 2); f.write(json.dumps(r, ensure_ascii=False) + '\n')
        f.flush(); os.fsync(f.fileno()); fcntl.flock(f, fcntl.LOCK_UN)
    print('LEDGER_OK', len(recs), 'workflow_total_after', round(run, 3))

def speech_rec(i, retake=None):
    u = unit(i); ch = len(u['tts'])
    r = {'ts': now(), 'who': WHO if not retake else WHO + '-sel', 'kind': 'speech',
         'what': f'speech tts eleven_v4 hoc {u["id"]} x{TAKES}' + (f' RETAKE (SPEC 4.2): {retake}' if retake else ''),
         'voice': 'hoc', 'voice_id': VOICE, 'unit': u['id'] + ('#retake' if retake else ''), 'idx': int(i), 'flow_id': FLOW,
         'chars': ch, 'takes': TAKES, 'chars_billed': ch * TAKES,
         'credits_est': round(ch * TAKES * CREDITS_PER_CHAR_TAKE, 3), 'cents_est': round(ch * TAKES * CENTS_PER_CHAR_TAKE, 4),
         'estimate_source': 'estimate_only c2.akis x3 = 152.98 kredi / 153 karakter (bu ses, eleven_v4)'}
    return r

def wait_quiet(quiet=20, maxwait=300):
    t0 = time.time()
    while True:
        rows = rows_of(open(LEDGER)); t = datetime.datetime.now(datetime.timezone.utc)
        busy = [r for r in rows if str(r.get('who','')).startswith('hoc') and not str(r.get('who','')).startswith(WHO)
                and (t - datetime.datetime.fromisoformat(r['ts'])).total_seconds() < quiet]
        if not busy or time.time() - t0 > maxwait:
            print('QUIET' if not busy else 'WAIT_TIMEOUT', round(time.time() - t0, 1)); return
        time.sleep(2)

def cmd_ledger(idxs):
    wait_quiet()
    recs = [speech_rec(i) for i in idxs]
    append(recs)
    for i in idxs: print('TTS', i, unit(i)['id'], json.dumps(unit(i)['tts'], ensure_ascii=False))

def cmd_retake(i, reason):
    append([speech_rec(i, retake=reason)]); print('TTS', i, json.dumps(unit(i)['tts'], ensure_ascii=False))

def cmd_scribe(u, sec, label):
    sec = float(sec)
    append([{'ts': now(), 'who': WHO + '-sel', 'kind': 'scribe-speech', 'what': f'stt eleven_scribe_v1 hoc {u} {label}',
             'voice': 'hoc', 'unit': u, 'sec': sec, 'credits_est': round(sec * SCRIBE_CREDITS_PER_SEC, 2),
             'cents_est': round(sec * SCRIBE_CREDITS_PER_SEC * CENTS_PER_CHAR_TAKE / CREDITS_PER_CHAR_TAKE, 4),
             'estimate_source': '5.5 kredi/sn (pilotta gözlenen)', 'flow_id': FLOW}])

def cmd_inflight():
    rows = rows_of(open(LEDGER))
    t = datetime.datetime.now(datetime.timezone.utc)
    for r in rows:
        w = str(r.get('who', ''))
        if w.startswith('hoc') and not w.startswith(WHO):
            a = (t - datetime.datetime.fromisoformat(r['ts'])).total_seconds()
            if a < 180: print('OTHER', w, r.get('kind'), r.get('unit'), round(a))
    print('workflow_total', round(wf_total(rows), 2))

def dl(url, path):
    last = None
    for attempt in range(3):
        if os.path.exists(path): os.remove(path)
        r = subprocess.run(['curl', '-sSfL', '--retry', '2', '-o', path, url], capture_output=True, text=True)
        if r.returncode != 0: last = 'curl rc=%d %s' % (r.returncode, r.stderr.strip()[:300]); continue
        try:
            import soundfile as sf
            info = sf.info(path); d, sr = sf.read(path, dtype='float32'); dur = len(d) / sr
            if dur > 0.3:
                return {'ok': True, 'duration_secs': round(dur, 4), 'samplerate': sr, 'channels': info.channels,
                        'bytes': os.path.getsize(path), 'attempts': attempt + 1}
            last = f'duration too short {dur}'
        except Exception as e: last = 'soundfile: ' + repr(e)[:300]
    return {'ok': False, 'error': last}

def cmd_dl(i, node, req_at, spec, sub=''):
    u = unit(i); d = f'{R}/raw/hoc/{u["id"]}' + (f'/{sub}' if sub else ''); os.makedirs(d, exist_ok=True)
    gens, failed, sids, echoed = [], [], [], None
    for line in open(spec, encoding='utf-8'):
        if line.startswith('PROMPT '): echoed = line[7:].rstrip('\n'); continue
        p = line.split()
        if not p: continue
        if p[0] == 'FAILED': failed.append({'session_id': p[1], 'generation_id': p[2], 'error': ' '.join(p[3:])}); sids.append(p[1]); continue
        if p[0] == 'S':  # compact: S <sess> <gen> <xdate> <sig> <dur>
            assert len(p) == 6, line
            url = ('https://storage.googleapis.com/xi-backend/database/workspace/78e1a9661caa4ec69356f3c5c2fbb9c5/content_generation/'
                   f'{p[1]}/{p[2]}/content.mp3?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=xi-backend-prod%40xi-labs.iam.gserviceaccount.com%2F'
                   f'{p[3][:8]}%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date={p[3]}&X-Goog-Expires=7200&X-Goog-SignedHeaders=host&X-Goog-Signature={p[4]}')
            p = ['OK', p[1], p[2], p[5], url]
        assert p[0] == 'OK' and len(p) == 5, line
        sids.append(p[1]); gens.append({'session_id': p[1], 'generation_id': p[2], 'api_duration_secs': float(p[3]), 'url': p[4]})
    takes, allok = [], True
    for n, g in enumerate(gens, 1):
        path = f'{d}/t{n}.mp3'; res = dl(g['url'], path); allok &= res['ok']
        takes.append({'take': n, 'file': path, **g, 'node_id': node, **res})
        print(u['id'], sub, f't{n}', res)
    out = {'unit': u['id'], 'idx': int(i), 'voice': 'hoc', 'voice_name': 'Nefona Hoca', 'voice_id': VOICE, 'model_id': 'eleven_v4',
           'flow_id': FLOW, 'node_id': node, 'session_ids': sids, 'requested_at': req_at, 'downloaded_at': now(), 'tts': u['tts'],
           'generations_count': TAKES, 'takes': takes, 'all_ok': allok and len(takes) == TAKES, 'n_takes_ok': sum(t['ok'] for t in takes),
           'failed_generations': failed, 'who': WHO, 'retake': bool(sub), 'server_prompt_echo': echoed,
           'server_prompt_equals_tts': (echoed == u['tts']) if echoed is not None else None}
    json.dump(out, open(f'{d}/takes.json', 'w'), ensure_ascii=False, indent=1)
    with open(CALLS, 'a') as f:
        f.write(json.dumps({'idx': int(i), 'unit': u['id'], 'sub': sub, 'node_id': node, 'session_ids': sids, 'requested_at': req_at,
                            'n_ok': out['n_takes_ok'], 'n_failed': len(failed)}) + '\n')
    print('TAKES_JSON', f'{d}/takes.json', 'n_ok', out['n_takes_ok'], 'failed', len(failed), 'echo_match', out['server_prompt_equals_tts'])

def cmd_total():
    rows = rows_of(open(LEDGER))
    by = {}
    for r in rows:
        w = str(r.get('who', ''))
        if w.startswith('hoc'):
            k = (w, r.get('kind')); by.setdefault(k, [0, 0.0]); by[k][0] += 1; by[k][1] += float(r.get('credits_est') or 0)
    for k, v in sorted(by.items()): print(k, v[0], round(v[1], 2))
    print('workflow_total', round(wf_total(rows), 2))

if __name__ == '__main__':
    c = sys.argv[1]
    if c == 'ledger': cmd_ledger(sys.argv[2:])
    elif c == 'retake': cmd_retake(sys.argv[2], sys.argv[3])
    elif c == 'scribe': cmd_scribe(*sys.argv[2:5])
    elif c == 'inflight': cmd_inflight()
    elif c == 'dl': cmd_dl(*sys.argv[2:])
    elif c == 'total': cmd_total()
