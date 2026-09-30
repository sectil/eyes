#!/usr/bin/env python3
"""ib.py — ilk bölüm (Ders 1, 2, 3, 5) ses üretimi yardımcısı (DEVAM.md 2026-09-30; SPEC.v3 §2, §6, §15).

Ücretli çağrı bu betikten yapılmaz (yalnız MCP). Betik yalnız defteri yazar, çekimleri indirir, takes.json kurar.

  ledger speech <ders> <birim> <karakter> [--retake GEREKÇE]     çağrıdan ÖNCE; tavan denetimi (parti 195 bin, toplam 600 bin)
  ledger scribe <ders> <birim> <sn> <çekim>                       çağrıdan ÖNCE
  ledger music <ders> <parça> <sn> <kredi_tahmini> <kaynak>       çağrıdan ÖNCE (estimate_only fiyatı)
  ledger sfx <ders> <parça> <sn> <kredi_tahmini> <kaynak>
  ledger scribe-music <ders> <parça> <sn>
  reconcile <ders> <birim> <kind> <tahmin> <gerçek> [generation_id]
  dl <ders> <birim> <istek.json>        istek.json: {node_id, session_ids, requested_at, tts, generations:[{session_id,
                                        generation_id, url, duration_secs}]}; raw/hoc/dNN/<birim>/t<n>.mp3 + takes.json
  total                                  sayaçlar

Yer: raw/hoc/dNN/<birim>/ (VARSAYIM: dersler arasında birim adları çakışıyor — ör. a.durus Ders 1 ve 2'de — bu yüzden
SPEC §10'daki raw/hoc/<birim>/ yolu ders klasörüyle ayrıldı; Ders 2'nin A adımı çekimleri raw/hoc/<birim>/'de kalır).
"""
import datetime
import fcntl
import hashlib
import json
import os
import subprocess
import sys

R = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
LEDGER = R + '/ledger.jsonl'
VOICE = 'Sr5w7dIZaRDglJ2cLaJm'
WHO = 'ilk-bolum'
KR_CHAR_TAKE = 0.99989        # estimate_only n1.sec x3 = 344,9655 kredi / 345 karakter (2026-09-30, bu oturum)
CENTS_PER_CREDIT = 0.01818    # SPEC.v3 §15.2
SCRIBE_KR_S = 5.5
TAKES = 3
BATCH_CAP = 195000.0
TOTAL_CAP = 600000.0
TOTAL_START_LINE = 400        # SPEC.v3 §15.3: toplam sayaç defterin 400. satırından (A adımı) başlar
FLOWS = {'d02': 'zAYOhRc6cOKeStKp4ijv'}
FLOWS_FILE = R + '/ilk_bolum_flows.json'


def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def flows():
    f = dict(FLOWS)
    if os.path.exists(FLOWS_FILE):
        f.update(json.load(open(FLOWS_FILE)))
    return f


def rows_of(f):
    f.seek(0)
    out = []
    for i, l in enumerate(f, 1):
        l = l.strip()
        if l:
            try:
                d = json.loads(l)
                d['_line'] = i
                out.append(d)
            except Exception:
                pass
    return out


def counters(rows):
    batch = sum(float(r.get('credits_est') or 0) for r in rows if r.get('who') == WHO)
    total = sum(float(r.get('credits_est') or 0) for r in rows if r['_line'] >= TOTAL_START_LINE)
    return batch, total


def append(rec):
    with open(LEDGER, 'a+', encoding='utf-8') as f:
        fcntl.flock(f, fcntl.LOCK_EX)
        rows = rows_of(f)
        batch, total = counters(rows)
        add = float(rec.get('credits_est') or 0)
        if add > 0 and (batch + add > BATCH_CAP or total + add > TOTAL_CAP):
            print('ABORT tavan: parti %.1f + %.1f / %.0f; toplam %.1f + %.1f / %.0f' % (batch, add, BATCH_CAP, total, add, TOTAL_CAP))
            sys.exit(3)
        rec['batch_credits_before'] = round(batch, 3)
        rec['batch_credits_after'] = round(batch + add, 3)
        rec['total_credits_after'] = round(total + add, 3)
        f.seek(0, 2)
        f.write(json.dumps(rec, ensure_ascii=False) + '\n')
        f.flush()
        os.fsync(f.fileno())
        fcntl.flock(f, fcntl.LOCK_UN)
    print('LEDGER_OK', rec['kind'], rec.get('unit') or rec.get('what'), round(add, 3),
          'parti', rec['batch_credits_after'], 'toplam', rec['total_credits_after'])


def cmd_ledger(a):
    kind, ders = a[0], a[1]
    fl = flows().get(ders)
    if kind == 'speech':
        unit, ch = a[2], int(a[3])
        retake = None
        if '--retake' in a:
            retake = a[a.index('--retake') + 1]
        takes = int(a[a.index('--takes') + 1]) if '--takes' in a else TAKES
        cr = ch * takes * KR_CHAR_TAKE
        rec = {'ts': now(), 'who': WHO, 'kind': 'speech', 'lesson': ders,
               'what': 'speech tts eleven_v4 hoc %s/%s x%d%s' % (ders, unit, takes, (' RETAKE/TAMAMLAMA: ' + retake) if retake else ''),
               'voice': 'hoc', 'voice_id': VOICE, 'unit': unit + ('#retake' if retake else ''), 'flow_id': fl,
               'chars': ch, 'takes': takes, 'chars_billed': ch * takes, 'credits_est': round(cr, 3),
               'cents_est': round(cr * CENTS_PER_CREDIT, 4),
               'estimate_source': 'estimate_only n1.sec x3 = 344,97 kredi / 345 karakter (2026-09-30)'}
    elif kind == 'scribe':
        unit, sec, take = a[2], float(a[3]), a[4]
        cr = sec * SCRIBE_KR_S
        rec = {'ts': now(), 'who': WHO, 'kind': 'scribe-speech', 'lesson': ders,
               'what': 'stt eleven_scribe_v1 hoc %s/%s take %s (SPEC.v3 §6.2)' % (ders, unit, take), 'voice': 'hoc',
               'unit': unit, 'take': take, 'sec': sec, 'flow_id': fl, 'credits_est': round(cr, 3),
               'cents_est': round(cr * CENTS_PER_CREDIT, 4), 'estimate_source': '5,5 kredi/sn (gerçek, SPEC.v3 §15.2)'}
    elif kind in ('music', 'sfx'):
        piece, sec, cr, src = a[2], float(a[3]), float(a[4]), a[5]
        rec = {'ts': now(), 'who': WHO, 'kind': kind, 'lesson': ders, 'what': '%s %s/%s %.0f sn' % (kind, ders, piece, sec),
               'unit': piece, 'sec': sec, 'flow_id': fl, 'credits_est': round(cr, 3),
               'cents_est': round(cr * CENTS_PER_CREDIT, 4), 'estimate_source': src}
    elif kind == 'scribe-music':
        piece, sec = a[2], float(a[3])
        cr = sec * SCRIBE_KR_S * 1.077
        rec = {'ts': now(), 'who': WHO, 'kind': 'scribe-music', 'lesson': ders,
               'what': 'stt eleven_scribe_v1 vokal denetimi %s/%s (SPEC.v3 §7.2)' % (ders, piece), 'unit': piece,
               'sec': sec, 'flow_id': fl, 'credits_est': round(cr, 3), 'cents_est': round(cr * CENTS_PER_CREDIT, 4),
               'estimate_source': '5,5 kredi/sn × 1,077 (SPEC.v3 §7.3)'}
    else:
        raise SystemExit('bilinmeyen tür ' + kind)
    append(rec)


def cmd_reconcile(a):
    ders, unit, kind, est, act = a[0], a[1], a[2], float(a[3]), float(a[4])
    gid = a[5] if len(a) > 5 else None
    rec = {'ts': now(), 'who': WHO, 'kind': kind, 'lesson': ders, 'unit': unit, 'reconcile': True, 'generation_id': gid,
           'est_credits': est, 'actual_credits': act, 'credits_est': round(act - est, 3),
           'what': 'uzlaştırma %s %s/%s: gerçek − tahmin' % (kind, ders, unit)}
    append(rec)


def mp3_ok(p):
    try:
        import soundfile as sf
        info = sf.info(p)
        return info.frames > 0, info.samplerate, info.channels, info.frames / info.samplerate
    except Exception as e:
        return False, None, None, str(e)


def cmd_dl(a):
    ders, unit, spec = a[0], a[1], a[2]
    req = json.load(open(spec))
    d = '%s/raw/hoc/%s/%s' % (R, ders, unit)
    os.makedirs(d, exist_ok=True)
    tj = d + '/takes.json'
    meta = json.load(open(tj)) if os.path.exists(tj) else {
        'unit': unit, 'lesson': ders, 'voice': 'hoc', 'voice_name': 'Nefona Hoca', 'voice_id': VOICE, 'sex_param': 'm',
        'model_id': 'eleven_v4', 'flow_id': flows().get(ders), 'requests': [], 'tts': req.get('tts'),
        'generations_count': TAKES, 'takes': []}
    known = {t['generation_id'] for t in meta['takes']}
    meta['requests'].append({'node_id': req['node_id'], 'session_ids': req['session_ids'],
                             'requested_at': req['requested_at'], 'request': req.get('request', 'initial')})
    n = len(meta['takes'])
    ok_all = True
    for g in req['generations']:
        if g['generation_id'] in known:
            continue
        n += 1
        p = '%s/t%d.mp3' % (d, n)
        for attempt in range(3):
            r = subprocess.run(['curl', '-sS', '--fail', '-o', p, g['url']], capture_output=True, text=True)
            ok, srate, ch, dur = mp3_ok(p) if r.returncode == 0 else (False, None, None, r.stderr.strip())
            if ok:
                break
        take = {'take': n, 'file': p, 'generation_id': g['generation_id'], 'session_id': g['session_id'], 'url': g['url'],
                'node_id': req['node_id'], 'api_duration_secs': g.get('duration_secs'), 'ok': bool(ok),
                'requested_at': req['requested_at'], 'request': req.get('request', 'initial')}
        if ok:
            b = open(p, 'rb').read()
            take.update({'duration_secs': round(dur, 3), 'samplerate': srate, 'channels': ch, 'bytes': len(b),
                         'sha256': hashlib.sha256(b).hexdigest()})
        else:
            take['error'] = dur
            ok_all = False
        meta['takes'].append(take)
        print(unit, 't%d' % n, 'OK' if ok else 'FAIL', take.get('duration_secs'), take.get('bytes'))
    json.dump(meta, open(tj, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return 0 if ok_all else 1


def cmd_total():
    with open(LEDGER, encoding='utf-8') as f:
        rows = rows_of(f)
    b, t = counters(rows)
    by = {}
    for r in rows:
        if r.get('who') == WHO:
            k = (r.get('lesson'), r.get('kind'))
            by[k] = by.get(k, 0.0) + float(r.get('credits_est') or 0)
    print(json.dumps({'parti': round(b, 1), 'parti_tavan': BATCH_CAP, 'toplam': round(t, 1), 'toplam_tavan': TOTAL_CAP,
                      'kalem': {'%s/%s' % k: round(v, 1) for k, v in sorted(by.items(), key=str)}}, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    c, a = sys.argv[1], sys.argv[2:]
    if c == 'ledger':
        cmd_ledger(a)
    elif c == 'reconcile':
        cmd_reconcile(a)
    elif c == 'dl':
        sys.exit(cmd_dl(a))
    elif c == 'total':
        cmd_total()
    else:
        raise SystemExit(__doc__)
