#!/usr/bin/env python3
"""harvest.py — oturum kaydından (Claude Code transcript JSONL) ElevenLabs MCP sonuçlarını okur; imzalı adresleri elle
kopyalamadan çekimleri indirir (ib.py dl) ve Scribe metinlerini toplar. Ücretli çağrı yapmaz.

  speech [--lesson dNN]      generate_speech çağrılarını (context içinde "[ib dNN/birim]" etiketi) durum sonuçlarıyla eşler,
                             henüz indirilmemiş çekimleri indirir
  scribe                     transcribe çağrılarını ("[ibs dNN/birim/tN]" etiketi) durum sonuçlarıyla eşler → JSON basar
  music                      müzik çağrılarını ("[ibm dNN/parça]") eşler → JSON basar
  pending                    sonucu henüz gelmemiş oturumlar
"""
import glob
import json
import os
import re
import subprocess
import sys

R = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
PROJ = '/root/.claude/projects/-home-user-eyes'
TAG = re.compile(r'\[ib (d\d\d)/([^\]\s]+)\]')
TAGS = re.compile(r'\[ibs (d\d\d)/([^\]\s]+)/(t\d+)\]')
TAGM = re.compile(r'\[ibm (d\d\d)/([^\]\s]+)\]')
LEGACY_D02 = re.compile(r'Ders 2 \(ilk bölüm\): (\S+) birimi')
SESS = re.compile(r'content_generation/([A-Za-z0-9]+)/([A-Za-z0-9]+)/')


def blocks():
    files = sorted(glob.glob(PROJ + '/*.jsonl')) + sorted(glob.glob(PROJ + '/**/*.jsonl', recursive=True))
    seen = set()
    for f in files:
        if f in seen:
            continue
        seen.add(f)
        for n, l in enumerate(open(f, encoding='utf-8')):
            try:
                d = json.loads(l)
            except Exception:
                continue
            m = d.get('message') or {}
            c = m.get('content')
            if isinstance(c, list):
                for b in c:
                    yield f, n, d.get('timestamp'), b


def text_of(content):
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return ''.join(x.get('text', '') for x in content if isinstance(x, dict))
    return ''


def scan():
    uses, results = {}, {}
    for f, n, ts, b in blocks():
        if b.get('type') == 'tool_use' and b.get('name', '').startswith('mcp__ElevenLabs__'):
            uses[b['id']] = (b['name'].split('__')[-1], b.get('input') or {}, ts, (f, n))
        elif b.get('type') == 'tool_result' and b.get('tool_use_id') in uses:
            results[b['tool_use_id']] = text_of(b.get('content'))
    return uses, results


def parse(s):
    try:
        return json.loads(s)
    except Exception:
        return None


def media_by_session(uses, results):
    """session_id → en son görülen üretim (adres her durum çağrısında yenilenir)."""
    out, trans = {}, {}
    order = sorted(((uses[k][3], k) for k in results), key=lambda x: x[0])
    for _, k in order:
        name = uses[k][0]
        if name != 'creative_get_flow_run_status':
            continue
        d = parse(results[k])
        if not d:
            continue
        for m in d.get('media') or []:
            mm = SESS.search(m.get('url', ''))
            if mm:
                out[mm.group(1)] = {'session_id': mm.group(1), 'generation_id': m['generation_id'], 'url': m['url'],
                                    'duration_secs': m.get('duration_secs'), 'prompt': m.get('prompt'),
                                    'kind': m.get('kind')}
        for t in d.get('transcripts') or []:
            sid = t.get('session_id')
            trans[sid or len(trans)] = t
        # tek oturumlu yanıtlar: session_id üst düzeyde
        if d.get('transcripts') is None and d.get('generations'):
            for g in d['generations']:
                if g.get('transcript') or g.get('text'):
                    trans[g.get('id')] = g
    return out, trans


def speech_calls(uses, results, lesson=None):
    calls = []
    for k, (name, inp, ts, pos) in uses.items():
        if name != 'creative_generate_speech' or inp.get('estimate_only') or k not in results:
            continue
        ctx = inp.get('context', '')
        m = TAG.search(ctx)
        if m:
            les, unit = m.group(1), m.group(2)
        else:
            m2 = LEGACY_D02.search(ctx)
            if not m2:
                continue
            les, unit = 'd02', m2.group(1)
        if lesson and les != lesson:
            continue
        d = parse(results[k])
        if not d or not d.get('session_ids'):
            continue
        req = 'retake' if 'RETAKE' in ctx.upper() else 'initial'
        calls.append({'lesson': les, 'unit': unit, 'tts': inp.get('prompt'), 'node_id': d.get('node_id'),
                      'session_ids': d['session_ids'], 'requested_at': ts, 'request': req, 'pos': pos})
    calls.sort(key=lambda c: c['pos'])
    return calls


def cmd_speech(lesson=None):
    uses, results = scan()
    media, _ = media_by_session(uses, results)
    todo = pend = done = 0
    for c in speech_calls(uses, results, lesson):
        d = '%s/raw/hoc/%s/%s' % (R, c['lesson'], c['unit'])
        tj = d + '/takes.json'
        have = set()
        if os.path.exists(tj):
            have = {t['generation_id'] for t in json.load(open(tj))['takes'] if t.get('ok')}
        gens = [media[s] for s in c['session_ids'] if s in media]
        missing = [s for s in c['session_ids'] if s not in media]
        new = [g for g in gens if g['generation_id'] not in have]
        for g in gens:
            if g['prompt'] and g['prompt'] != c['tts']:
                raise SystemExit('metin uyuşmuyor: %s %s' % (c['unit'], g['prompt']))
        if missing:
            pend += 1
            print('BEKLIYOR', c['lesson'], c['unit'], 'eksik oturum', missing)
        if not new:
            done += 1 if not missing else 0
            continue
        spec = {'node_id': c['node_id'], 'session_ids': c['session_ids'], 'requested_at': c['requested_at'],
                'tts': c['tts'], 'request': c['request'], 'generations': new}
        os.makedirs(d, exist_ok=True)
        sp = d + '/_req_%s.json' % c['node_id']
        json.dump(spec, open(sp, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        r = subprocess.run([sys.executable, R + '/tools/ib.py', 'dl', c['lesson'], c['unit'], sp], capture_output=True, text=True)
        print(r.stdout.strip() or r.stderr.strip())
        todo += 1
    print('indirilen istek', todo, 'bekleyen', pend, 'önceden tamam', done)


def cmd_pending():
    uses, results = scan()
    media, _ = media_by_session(uses, results)
    sids = []
    for c in speech_calls(uses, results):
        sids += [s for s in c['session_ids'] if s not in media]
    print(json.dumps(sids))


def cmd_scribe():
    uses, results = scan()
    out = []
    stt = {}
    for k, (name, inp, ts, pos) in uses.items():
        if name == 'creative_transcribe_audio' and k in results and not inp.get('estimate_only'):
            m = TAGS.search(inp.get('context', ''))
            d = parse(results[k])
            if m and d:
                stt[k] = {'lesson': m.group(1), 'unit': m.group(2), 'take': m.group(3), 'node_id': d.get('node_id'),
                          'session_ids': d.get('session_ids') or ([d['session_id']] if d.get('session_id') else []),
                          'pos': pos}
    # durum sonuçlarındaki metinler
    texts = {}
    order = sorted(((uses[k][3], k) for k in results), key=lambda x: x[0])
    for _, k in order:
        if uses[k][0] != 'creative_get_flow_run_status':
            continue
        d = parse(results[k])
        if not d:
            continue
        price = {g.get('id'): (g.get('price') or {}).get('credits') for g in d.get('generations') or []}
        for t in d.get('transcripts') or []:
            mm = SESS.search(t.get('download_url', ''))
            sid = mm.group(1) if mm else (t.get('session_id') or t.get('generation_id'))
            t = dict(t)
            t.pop('download_url', None)
            t['session_id'] = sid
            t['actual_credits'] = price.get(t.get('generation_id'))
            texts[sid] = t
    for k, s in sorted(stt.items(), key=lambda x: x[1]['pos']):
        t = None
        for sid in s['session_ids']:
            if sid in texts:
                t = texts[sid]
        s = dict(s)
        s.pop('pos')
        s['result'] = t
        out.append(s)
    print(json.dumps(out, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    c = sys.argv[1] if len(sys.argv) > 1 else 'speech'
    if c == 'speech':
        les = sys.argv[sys.argv.index('--lesson') + 1] if '--lesson' in sys.argv else None
        cmd_speech(les)
    elif c == 'pending':
        cmd_pending()
    elif c == 'scribe':
        cmd_scribe()
    elif c == 'music':
        pass
    else:
        raise SystemExit(__doc__)


def cmd_music():
    """music_jobs_ib.json'daki oturumların üretimlerini indirir: music/el/raw/ib/<parça>.mp3 → music/el/<parça>.wav
    (44,1 kHz stereo float); gerçek fiyatı yazar."""
    import soundfile as sf
    jobs = json.load(open(R + '/music_jobs_ib.json'))
    uses, results = scan()
    media, _ = media_by_session(uses, results)
    price = {}
    for k in results:
        if uses[k][0] == 'creative_get_flow_run_status':
            d = parse(results[k])
            for g in (d or {}).get('generations') or []:
                if (g.get('price') or {}).get('credits') is not None:
                    price[g.get('id')] = g['price']['credits']
    out = {}
    for key, j in jobs.items():
        les, piece = key.split('/')
        m = media.get(j['session_id'])
        if not m:
            print('BEKLIYOR', key)
            continue
        rawd = R + '/music/el/raw/ib'
        os.makedirs(rawd, exist_ok=True)
        mp3 = '%s/%s.mp3' % (rawd, piece)
        wav = R + '/music/el/%s.wav' % piece
        if not os.path.exists(wav):
            r = subprocess.run(['curl', '-sS', '--fail', '-o', mp3, m['url']], capture_output=True, text=True)
            if r.returncode:
                print('INDIRME HATASI', key, r.stderr)
                continue
            sys.path.insert(0, R + '/music/el/tools')
            import manalyze
            manalyze.decode_to_wav(mp3, wav)
        info = sf.info(wav)
        out[key] = {'generation_id': m['generation_id'], 'session_id': j['session_id'], 'mp3': mp3, 'wav': wav,
                    'duration_s': round(info.frames / info.samplerate, 3), 'actual_credits': price.get(m['generation_id']),
                    'est_credits': j.get('est_credits')}
        print(key, out[key]['duration_s'], 'sn', 'gerçek', out[key]['actual_credits'])
    json.dump(out, open(R + '/music_jobs_ib.done.json', 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__' and len(sys.argv) > 1 and sys.argv[1] == 'music':
    cmd_music()
