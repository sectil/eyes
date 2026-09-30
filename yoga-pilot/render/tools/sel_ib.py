#!/usr/bin/env python3
"""sel_ib.py — ilk bölüm çekim seçimi (SPEC.v3 §4–§6). Ücretli çağrı yok.

  rank <dNN> <units.json> [birim ...]     audio.py rank → sel/hoc/dNN/_work/rank/<birim>.json; Scribe aday listesi basar
  scribe-list <dNN> <units.json>          Scribe'a gidecek (birim, çekim, sn, url) listesi: _work/scribe_todo.json
  finalize <dNN> <units.json> <scribe.json>
        scribe.json: harvest.py scribe çıktısı. Her birim için sıradaki en iyi çekimden başlayarak Scribe'la birebir (ya da
        §6.2 istisnasıyla) eşleşen ilk çekim seçilir; kesilir (audio.py cut), işlenir (audio.py process, v3 + auto),
        ölçülür → sel/hoc/dNN/<birim>/<parça>.wav + sel/hoc/dNN/selection-dNN.json
"""
import json
import os
import subprocess
import sys

R = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
T = R + '/tools'
sys.path.insert(0, T)
import audio  # noqa: E402


def units_of(path):
    d = json.load(open(path, encoding='utf-8'))
    us = d['units'] if isinstance(d, dict) else d
    return {u['id']: u for u in us}, d


def run(args):
    r = subprocess.run([sys.executable] + args, capture_output=True, text=True)
    try:
        return r.returncode, json.loads(r.stdout)
    except Exception:
        return r.returncode, {'_stdout': r.stdout[-2000:], '_stderr': r.stderr[-2000:]}


def work(les):
    w = '%s/sel/hoc/%s/_work' % (R, les)
    os.makedirs(w + '/rank', exist_ok=True)
    return w


def rank_unit(les, u, match=None):
    w = work(les)
    rawd = '%s/raw/hoc/%s/%s' % (R, les, u['id'])
    uj = '%s/rank/%s.unit.json' % (w, u['id'])
    json.dump(u, open(uj, 'w', encoding='utf-8'), ensure_ascii=False)
    args = [T + '/audio.py', 'rank', rawd, '--unit-json', '@' + uj, '--sex', 'm']
    if match:
        args += ['--match-f0', str(match[0]), '--match-rate', str(match[1])]
    rc, d = run(args)
    d['_rc'] = rc
    json.dump(d, open('%s/rank/%s.json' % (w, u['id']), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return rc, d


def cmd_rank(les, upath, only):
    U, _ = units_of(upath)
    for uid, u in U.items():
        if only and uid not in only:
            continue
        rc, d = rank_unit(les, u)
        rk = d.get('ranking') or []
        ex = d.get('excluded') or []
        print('%-18s rc=%d  sıra: %s  elenen: %s' % (
            uid, rc, ' '.join('%s(%.2f%s)' % (x['take'].replace('.mp3', ''), x['score'],
                                             ('!' + str(len(x['soft_violations']))) if x['soft_violations'] else '')
                              for x in rk),
            ' '.join('%s:%s' % (x.get('take', '?').replace('.mp3', ''), (x.get('reasons') or x.get('reason') or ['?'])[0][:40])
                     for x in ex)))


def cmd_scribe_list(les, upath, depth=1):
    U, _ = units_of(upath)
    w = work(les)
    todo = []
    for uid in U:
        d = json.load(open('%s/rank/%s.json' % (w, uid)))
        tk = json.load(open('%s/raw/hoc/%s/%s/takes.json' % (R, les, uid)))
        byf = {os.path.basename(t['file']): t for t in tk['takes'] if t.get('ok')}
        for x in (d.get('ranking') or [])[:depth]:
            t = byf[x['take']]
            todo.append({'lesson': les, 'unit': uid, 'take': x['take'].replace('.mp3', ''), 'sec': t['duration_secs'],
                         'url': t['url'], 'bytes': t['bytes'], 'tag': '[ibs %s/%s/%s]' % (les, uid, x['take'].replace('.mp3', ''))})
    json.dump(todo, open(w + '/scribe_todo.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(len(todo), 'Scribe adayı;', round(sum(x['sec'] for x in todo), 2), 'sn;',
          round(sum(x['sec'] for x in todo) * 5.5, 1), 'kredi (5,5/sn)')


def scribe_texts(scribe_json):
    """harvest.py scribe çıktısı → {(ders, birim, çekim): metin}. Son sonuç geçerlidir."""
    out = {}
    for s in json.load(open(scribe_json, encoding='utf-8')):
        res = s.get('result') or {}
        txt = res.get('text') if isinstance(res, dict) else None
        if txt is None and isinstance(res, dict):
            txt = res.get('transcript') or (res.get('output') or {}).get('text')
        if txt is not None:
            out[(s['lesson'], s['unit'], s['take'])] = {'text': txt, 'node_id': s.get('node_id'),
                                                       'session_ids': s.get('session_ids')}
    return out


def piece_names(u):
    ps = audio.unit_pieces(u)
    if u.get('kind') == 'carrier':
        return ps, [p['name'] for p in ps]
    if len(ps) == 1:
        return ps, [u['id']]
    return ps, ['%s#%d' % (u['id'], i + 1) for i in range(len(ps))]


def finalize_unit(les, u, rank, scribe, prev_choice=None):
    """Sıradaki çekimlerden Scribe'la eşleşen ilkini seçer, keser, işler. Dönüş: (kayıt, eksik_scribe_çekimi)."""
    w = work(les)
    rawd = '%s/raw/hoc/%s/%s' % (R, les, u['id'])
    tk = json.load(open(rawd + '/takes.json'))
    byf = {os.path.basename(t['file']): t for t in tk['takes'] if t.get('ok')}
    attempts = []
    chosen = None
    for x in rank.get('ranking') or []:
        take = x['take'].replace('.mp3', '')
        sc = scribe.get((les, u['id'], take))
        if sc is None:
            return None, take, attempts
        res = audio.scribe_equal(u['tts'], sc['text'], exceptions=True)
        att = {'take': take, 'scribe_text': sc['text'], 'equal': bool(res['equal']),
               'strict_equal': bool(res['strict_equal']), 'exceptions': res.get('exceptions') or [],
               'diff': res.get('diff'), 'stt_node_id': sc.get('node_id'), 'session_ids': sc.get('session_ids')}
        attempts.append(att)
        if res['equal']:
            chosen = (x, att)
            break
    if chosen is None:
        return {'unit': u['id'], 'status': 'scribe-tutmadi', 'attempts': attempts}, None, attempts
    x, att = chosen
    src = byf[x['take']]
    pcs, names = piece_names(u)
    cutd = '%s/cuts/%s' % (w, u['id'])
    os.makedirs(cutd, exist_ok=True)
    flags = []
    if len(pcs) > 1:
        rc, cut = run([T + '/audio.py', 'cut', src['file'], '--n', str(len(pcs)), '--outdir', cutd,
                       '--names', ','.join(n if n != '_pre' else '_pre' for n in names),
                       '--sylls', ','.join(str(max(1, p['syll'])) for p in pcs), '--sex', 'm'])
        if rc != 0 or not cut.get('ok'):
            return {'unit': u['id'], 'status': 'kesim-tutmadi', 'cut': cut, 'attempts': attempts}, None, attempts
        files = [p['file'] for p in cut['pieces']]
        flags.append({'flag': 'kesim-kulak', 'reason': 'SPEC.v3 §4.6 (c): kesim yalnız ölçüyle denetlendi '
                                                      '(Scribe sözcük zaman damgası ve yerel yükleme aracı yok)'})
        mr = cut.get('margin_ratio')
        if mr is not None and mr <= 1.1:
            flags.append({'flag': 'kesim-dar-pay', 'reason': 'en kısa seçilen / en uzun seçilmeyen duraklama %.3f ≤ 1,1' % mr})
        if cut.get('cut_suspect'):
            return {'unit': u['id'], 'status': 'kesim-kuskulu', 'cut': cut, 'attempts': attempts}, None, attempts
    else:
        cut = None
        files = [src['file']]
    if att['exceptions']:
        flags.append({'flag': 'scribe-istisna', 'reason': 'SPEC.v3 §6.2 yazım istisnası: %s' % att['exceptions']})
    outd = '%s/sel/hoc/%s/%s' % (R, les, u['id'])
    os.makedirs(outd, exist_ok=True)
    pieces = []
    for p, nm, f in zip(pcs, names, files):
        if not p['keep']:
            continue
        micro = p['syll'] <= 1
        outf = '%s/%s.wav' % (outd, nm)
        args = [T + '/audio.py', 'process', f, '--out', outf, '--sex', 'm']
        if micro:
            args.append('--micro')
        rc, pr = run(args)
        if rc != 0:
            return {'unit': u['id'], 'status': 'isleme-kaldi', 'piece': nm, 'process': pr, 'attempts': attempts}, None, attempts
        ph = u.get('phase') or 'Derin'
        rc2, me = run([T + '/audio.py', 'analyze', outf, '--syll', str(max(1, p['syll'])), '--phase', ph, '--sex', 'm'])
        if (me.get('clicks') or {}).get('count'):
            return {'unit': u['id'], 'status': 'tik', 'piece': nm, 'measure': me, 'attempts': attempts}, None, attempts
        if (me.get('clipping') or {}).get('clipped'):
            return {'unit': u['id'], 'status': 'kirpilma', 'piece': nm, 'measure': me, 'attempts': attempts}, None, attempts
        if pr.get('flag'):
            flags.append({'flag': 'kulak-sinirlayici', 'reason': pr['flag'], 'piece': nm})
        if ph == 'Derin' and (me.get('articulation') or 0) > 5.0:
            flags.append({'flag': 'derin>5', 'reason': 'Derin evrede eklemleme %.2f hece/sn' % me['articulation'], 'piece': nm})
        pieces.append({'piece_id': nm, 'text': p['text'], 'syll': p['syll'], 'file': outf, 'source_piece': f,
                       'micro': micro, 'process': pr, 'measure': {k: me.get(k) for k in (
                           'duration', 'speech_sec', 'articulation', 'f0_mean_hz', 'f0_sd_semitones', 'sibilance_ratio',
                           'clipping', 'dc', 'lufs', 'rms_db', 'true_peak_dbtp', 'clicks')}})
    joins = None
    if u.get('kind') == 'carrier' and len(pieces) > 1:
        joins = []
        for a, b in zip(pieces, pieces[1:]):
            rc, st = run([T + '/audio.py', 'f0step', a['file'], b['file'], '--sex', 'm'])
            joins.append({'a': a['piece_id'], 'b': b['piece_id'], 'step_st': st.get('step_st'), 'pass': st.get('pass')})
        if any(j['pass'] is False for j in joins):
            flags.append({'flag': 'eklem>2yt', 'reason': 'taşıyıcı ekleminde F0 basamağı > 2 yt: %s' % [
                (j['a'], j['step_st']) for j in joins if j['pass'] is False]})
    rec = {'unit': u['id'], 'status': 'ok', 'kind': u.get('kind', 'clip'), 'phase': u.get('phase'), 'tts': u['tts'],
           'screen': u.get('screen', u['tts']), 'screen_equals_tts': u.get('screen', u['tts']) == u['tts'],
           'chosen_take': x['take'], 'chosen_take_file': src['file'], 'generation_id': src['generation_id'],
           'rank_position': (rank['ranking'].index(x) + 1), 'n_takes': len(byf), 'score': x['score'],
           'soft_violations': x['soft_violations'], 'metrics': x.get('metrics'),
           'excluded_takes': rank.get('excluded'), 'scribe_attempts': attempts, 'scribe_text': att['scribe_text'],
           'compare': 'equal' if att['strict_equal'] else 'equal-with-exception', 'cut': cut, 'joins': joins,
           'flags': flags, 'pieces': pieces}
    return rec, None, attempts


def cmd_finalize(les, upath, scribe_json, only=None):
    U, _ = units_of(upath)
    w = work(les)
    scribe = scribe_texts(scribe_json)
    selp = '%s/sel/hoc/%s/selection-%s.json' % (R, les, les)
    sel = json.load(open(selp, encoding='utf-8')) if os.path.exists(selp) else {
        'lesson': les, 'voice': 'hoc', 'voice_name': 'Nefona Hoca', 'voice_id': 'Sr5w7dIZaRDglJ2cLaJm', 'sex_param': 'm',
        'model_id': 'eleven_v4', 'spec': 'yoga-pilot/b/SPEC.v3.md §4–§6', 'units': {}, 'failed': {}}
    need, bad = [], []
    for uid, u in U.items():
        if only and uid not in only:
            continue
        if uid in sel['units'] and not only:
            continue
        rank = json.load(open('%s/rank/%s.json' % (w, uid)))
        rec, missing_take, att = finalize_unit(les, u, rank, scribe)
        if rec is None:
            need.append((uid, missing_take))
            continue
        if rec['status'] != 'ok':
            bad.append((uid, rec['status']))
            sel['failed'][uid] = rec
            continue
        sel['units'][uid] = rec
        sel['failed'].pop(uid, None)
        print('%-18s %s  %s  %s' % (uid, rec['chosen_take'], rec['compare'], ','.join(f['flag'] for f in rec['flags'])))
    sel['generated_at'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    sel['summary'] = {'units': len(sel['units']), 'failed': list(sel['failed']),
                      'flag_counts': {}}
    for rec in sel['units'].values():
        for f in rec['flags']:
            sel['summary']['flag_counts'][f['flag']] = sel['summary']['flag_counts'].get(f['flag'], 0) + 1
    json.dump(sel, open(selp, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('seçilen', len(sel['units']), '| Scribe bekleyen', need, '| sorunlu', bad)
    json.dump({'need_scribe': need, 'bad': bad}, open(w + '/finalize_status.json', 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    import datetime
    c = sys.argv[1]
    if c == 'rank':
        cmd_rank(sys.argv[2], sys.argv[3], set(sys.argv[4:]))
    elif c == 'scribe-list':
        cmd_scribe_list(sys.argv[2], sys.argv[3], int(sys.argv[4]) if len(sys.argv) > 4 else 1)
    elif c == 'finalize':
        cmd_finalize(sys.argv[2], sys.argv[3], sys.argv[4], set(sys.argv[5:]) or None)
    else:
        raise SystemExit(__doc__)
