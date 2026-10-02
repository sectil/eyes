#!/usr/bin/env python3
"""reprocess_v3.py — PLAN.v3 §F A adımı: seçilmiş bütün parçaları v3 klip kuralıyla yeniden işler (ücretli çağrı yok).

Kaynak: her parçanın işlenmemiş hâli (çok parçalı birimde seçim ajanının kesim dosyası sel/<ses>/_w*/cuts/<birim>/…,
tek parçalı birimde seçilen ham çekim raw/<ses>/<birim>/tN.mp3). Eşleme doğrulandı: v2 ayarlarıyla yeniden işleyince
316 parçanın 315'i mevcut parçayla örnek örnek aynı çıktı (_v3work/validate.py; ayrık kalan hak c2.n08 1,000 sn sınırda).

v3 kuralı (audio.process_array level_rule='v3', peak_mode='auto'; ayrıntı audio.py "v3" bölümü ve SPEC v3 eki):
  * < 1 sn parça, LUFS ölçülebiliyorsa: uzun kliplerle aynı ölçü ve hedef (−18 LUFS; mikro ek ofseti 0 dB);
  * eski sınırlayıcı > 1 dB kısacaksa yumuşak tepe sıkıştırma adayı; bozulma göstergesi iyi olan seçilir;
  * kısa parçada sınırlayıcı payı > 3 dB kalırsa hedef en çok 3 dB iner (açık, karışımda yerel yatak kısmasıyla kapanır).
Değişmeyen parça (çıktı v2 ile örnek örnek aynı) eski dosyasında kalır.

Çıktı: sel/<ses>/_v3/<birim>/<parça>.wav (yalnız değişenler) + sel/<ses>/reprocess-v3.json (mix.py okur).
Kullanım: python3 reprocess_v3.py [--voices nes,hak] [--jobs 4]
"""
import argparse
import datetime
import glob
import json
import os
import sys
from multiprocessing import Pool

import numpy as np
import soundfile as sf

R = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
sys.path.insert(0, R + '/tools')
import audio  # noqa: E402

SEX = {'nes': 'f', 'hak': 'm'}


def selection_pieces(v):
    out = {}
    for part in (1, 2):
        s = json.load(open('%s/sel/%s/selection-%s-%d.json' % (R, v, v, part), encoding='utf-8'))
        for uid, u in s['units'].items():
            take = u.get('chosen_take_file') or (u.get('chosen') or {}).get('file')
            for p in u['pieces']:
                pr = p.get('process') or {}
                mode = pr.get('level_mode') or p.get('level_mode')
                ref = p.get('ref_rms_db_used') or p.get('ref_rms_db')
                if ref is None and mode == 'rms':
                    ref = pr.get('target') - (audio.MICRO_OFFSET_DB if p.get('micro') else 0.0)
                out[p['piece_id']] = {'unit': uid, 'phase': u['phase'], 'kind': u['kind'], 'n_pieces': len(u['pieces']),
                                      'take': take, 'file': p['file'], 'text': p.get('text'), 'syll': p.get('syll'),
                                      'micro': bool(p.get('micro')), 'ref_rms_db': ref, 'v2_mode': mode,
                                      'v2_limiter_db': pr.get('limiter_max_db', p.get('limiter_max_db'))}
    return out


def source_of(v, pid, e):
    if e['n_pieces'] == 1 and e['kind'] != 'carrier':
        return e['take']
    c = []
    for wd in sorted(glob.glob('%s/sel/%s/_w*' % (R, v))):
        c += glob.glob('%s/cuts/%s/%s.wav' % (wd, e['unit'], pid))
        if '#' in pid:
            c += glob.glob('%s/cuts/%s/s%s.wav' % (wd, e['unit'], pid.split('#')[1]))
    if len(c) != 1:
        raise SystemExit('kaynak bulunamadı ya da birden çok: %s %s %s' % (v, pid, c))
    return c[0]


def work(args):
    v, pid, e, src = args
    x, sr = audio.load(src)
    y, rep = audio.process_array(x, sr, SEX[v], e['micro'], e['ref_rms_db'], level_rule='v3', peak_mode='auto')
    old, _ = sf.read(e['file'], dtype='float64')
    same = len(old) == len(y) and float(np.max(np.abs(old - y))) <= 1e-6
    out = e['file']
    if not same:
        out = '%s/sel/%s/_v3/%s/%s.wav' % (R, v, e['unit'], pid)
        audio.write_wav(out, y, sr)
        chk = sf.info(out)
        assert (chk.samplerate, chk.channels, chk.subtype) == (44100, 1, 'FLOAT'), chk
    old_l = audio.lufs(old)
    an = audio.analyze_array(y, sr, e['syll'], None, SEX[v])
    return pid, {
        'unit': e['unit'], 'phase': e['phase'], 'text': e['text'], 'source': src, 'file': out,
        'changed': not same, 'v2_file': e['file'],
        'v2': {'dur': audio.r3(len(old) / sr), 'level_mode': e['v2_mode'], 'lufs': audio.r3(old_l, 2),
               'true_peak_dbtp': audio.r3(audio.true_peak_db(old), 2), 'limiter_max_db': e['v2_limiter_db']},
        'v3': {'dur': audio.r3(len(y) / sr), 'level_mode': rep['level_mode'], 'target': rep['target'],
               'lufs': rep['lufs'], 'level': rep['level'], 'true_peak_dbtp': rep['true_peak_dbtp'],
               'limiter_max_db': rep['limiter_max_db'], 'limiter_sec_over_1db': rep['limiter_sec_over_1db'],
               'peak': rep['peak'], 'short_level_capped': rep.get('short_level_capped'), 'checks': rep['checks'],
               'pass': rep['pass'], 'flag': rep.get('flag'), 'micro': e['micro'],
               'clicks': an['clicks']['count'], 'clipped': an['clipping']['clipped']},
    }


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument('--voices', default='nes,hak')
    ap.add_argument('--jobs', type=int, default=4)
    a = ap.parse_args(argv)
    for v in a.voices.split(','):
        P = selection_pieces(v)
        jobs = [(v, pid, e, source_of(v, pid, e)) for pid, e in P.items()]
        with Pool(a.jobs) as pool:
            res = dict(pool.map(work, jobs, chunksize=1))
        res = {pid: res[pid] for pid in P}
        fails = [pid for pid, r in res.items() if not r['v3']['pass'] or r['v3']['clicks'] or r['v3']['clipped']]
        summ = {
            'pieces': len(res), 'changed': sum(1 for r in res.values() if r['changed']),
            'soft_chain': sum(1 for r in res.values() if r['v3']['peak']['chain'] == 'soft+limiter'),
            'short_pieces': sum(1 for r in res.values() if r['v3']['dur'] < 1.0),
            'short_capped': sorted(pid for pid, r in res.items() if r['v3'].get('short_level_capped')),
            'limiter_gt3_v2': sum(1 for r in res.values() if (r['v2']['limiter_max_db'] or 0) > 3.0),
            'limiter_gt3_v3': sum(1 for r in res.values() if (r['v3']['limiter_max_db'] or 0) > 3.0),
            'limiter_gt3_v3_pieces': sorted(pid for pid, r in res.items() if (r['v3']['limiter_max_db'] or 0) > 3.0),
            'failed_checks': fails,
        }
        doc = {'voice': v, 'written_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
               'tool': os.path.abspath(__file__), 'rule': 'audio.process_array(level_rule="v3", peak_mode="auto")',
               'constants': {'MICRO_OFFSET_V3_DB': audio.MICRO_OFFSET_V3_DB, 'SOFT_RATIO': audio.SOFT_RATIO,
                             'SOFT_KNEE_DB': audio.SOFT_KNEE_DB, 'SOFT_ATTACK_S': audio.SOFT_ATTACK_S,
                             'SOFT_RELEASE_DB_PER_MS': audio.SOFT_RELEASE_DB_PER_MS,
                             'SOFT_TRIGGER_DB': audio.SOFT_TRIGGER_DB, 'SOFT_RESIDUAL_DB': audio.SOFT_RESIDUAL_DB,
                             'SOFT_MAX_GR_DB': audio.SOFT_MAX_GR_DB, 'SHORT_LIM_MAX_DB': audio.SHORT_LIM_MAX_DB,
                             'SHORT_MAX_DROP_DB': audio.SHORT_MAX_DROP_DB},
               'summary': summ, 'pieces': res}
        json.dump(doc, open('%s/sel/%s/reprocess-v3.json' % (R, v), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        print(v, json.dumps(summ, ensure_ascii=False), flush=True)
    return 0


if __name__ == '__main__':
    sys.exit(main())
