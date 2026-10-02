#!/usr/bin/env python3
"""run_mix_hoc.py — üçüncü ses "hoc" (Nefona Hoca) için karışım (PLAN.v3 §F "A" satırı, karar 1–2; SPEC §6–§7 + v3 eki).

tools/mix.py'yi DEĞİŞTİRMEDEN içe aktarır ve yalnız şunları yamar:
  * VOICES['hoc'] = Nefona Hoca / Sr5w7dIZaRDglJ2cLaJm (cinsiyet parametresi m);
  * verify_positions: SPEC v3.6 — ilinti iki sinyal 4 kHz altına süzüldükten sonra (8. derece Butterworth alçak geçiren,
    sıfır fazlı sosfiltfilt; kayma yaratmaz); eşik 0,95 ve kayma ≤ 1 ms değişmez. Süzgeçsiz değer de ayrıca yazılır;
  * build_report: main() sonunda report.json / report.md'yi YALNIZ hoc ile ezmesin diye devre dışı; hoc raporu burada
    kurulur ve var olan report.json'a eklenir, report.md'ye "hoc" bölümü eklenir (nes/hak bölümleri dokunulmadan kalır).
main() yazdığı _ab_details.json ve _report_mix_raw.json'u yalnız hoc ile yazar; bunlar önceki (nes/hak) içerikle
birleştirilir (yedek: out/_onceki_hoc_oncesi/). Ücretli çağrı yok.
"""
import json
import math
import os
import sys

import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfiltfilt

R = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
OUT = R + '/out'
BK = OUT + '/_onceki_hoc_oncesi'
sys.path.insert(0, R + '/tools')
import mix  # noqa: E402

V = 'hoc'
mix.VOICES[V] = {'name': 'Nefona Hoca', 'voice_id': 'Sr5w7dIZaRDglJ2cLaJm'}
LP_HZ = 4000.0
_SOS = butter(8, LP_HZ, btype='low', fs=mix.SR, output='sos')


def verify_positions_v36(name, lag):
    tl = json.load(open('%s/%s.timeline.json' % (OUT, name), encoding='utf-8'))
    dec, _ = sf.read('%s/%s.mp3' % (OUT, name), dtype='float64', always_2d=True)
    mid = dec.mean(axis=1)
    midf = sosfiltfilt(_SOS, mid)
    W = int(0.05 * mix.SR)

    def best(sig, x, s0):
        seg = sig[max(0, s0 - W):s0 + len(x) + W]
        c = np.correlate(seg, x, 'valid')
        e = np.concatenate([[0.0], np.cumsum(seg * seg)])
        nx = math.sqrt(float(np.dot(x, x)))
        ns = np.sqrt(np.maximum(e[len(x):] - e[:-len(x)], 1e-20))
        cc = c / (nx * ns[:len(c)])
        k = int(np.argmax(cc))
        return float(cc[k]), (k - min(W, s0)) / mix.SR

    rows, rows_raw = [], []
    for sp in tl['speech']:
        x, _ = sf.read(mix._piece_file(tl['voice'], sp['piece']), dtype='float64')
        s0 = int(round(sp['start'] * mix.SR)) + lag
        c, o = best(midf, sosfiltfilt(_SOS, x), s0)
        rows.append((sp['piece'], c, o))
        c2, o2 = best(mid, x, s0)
        rows_raw.append((sp['piece'], c2, o2))
    worst = min(rows, key=lambda x: x[1])
    wr = min(rows_raw, key=lambda x: x[1])
    return {'pieces': len(rows), 'min_corr': mix.r(worst[1], 3), 'min_corr_piece': worst[0],
            'median_corr': mix.r(float(np.median([x[1] for x in rows])), 3),
            'max_abs_offset_ms': mix.r(1000 * max(abs(x[2]) for x in rows), 2),
            'n_corr_below_0_95': sum(1 for x in rows if x[1] < mix.POS_MIN_CORR),
            'n_corr_below_0_9': sum(1 for x in rows if x[1] < 0.9),
            'order_ok': bool(all(abs(x[2]) <= 0.002 for x in rows)),
            'v3_ok': bool(all(abs(x[2]) <= mix.POS_MAX_OFFSET_S for x in rows) and worst[1] >= mix.POS_MIN_CORR),
            'v3_rule': 'SPEC v3.5 + v3.6: iki sinyal %d Hz altına süzülür (8. derece Butterworth, sıfır faz), ilinti ≥ %.2f '
                       '(VARSAYIM), kayma ≤ %.0f ms' % (LP_HZ, mix.POS_MIN_CORR, mix.POS_MAX_OFFSET_S * 1000),
            'unfiltered_for_reference': {'min_corr': mix.r(wr[1], 3), 'min_corr_piece': wr[0],
                                         'median_corr': mix.r(float(np.median([x[1] for x in rows_raw])), 3),
                                         'max_abs_offset_ms': mix.r(1000 * max(abs(x[2]) for x in rows_raw), 2),
                                         'n_corr_below_0_95': sum(1 for x in rows_raw if x[1] < mix.POS_MIN_CORR)},
            'lowest5': [[p, mix.r(c, 3), mix.r(1000 * o, 3)] for p, c, o in sorted(rows, key=lambda x: x[1])[:5]]}


mix.verify_positions = verify_positions_v36
_captured = {}


def _no_report(raw=None):
    _captured['raw'] = raw
    return None


def main():
    orig_build = mix.build_report
    mix.build_report = _no_report
    try:
        rc = mix.main(['--voices', V])
    finally:
        mix.build_report = orig_build
    if rc != 0:
        print('mix.main çıkış', rc)
        return rc
    raw_h = _captured['raw']
    # --- önceki (nes/hak) içerikle birleştir
    old_raw = json.load(open(BK + '/_report_mix_raw.json', encoding='utf-8'))
    old_det = json.load(open(BK + '/_ab_details.json', encoding='utf-8'))
    new_det = json.load(open(OUT + '/_ab_details.json', encoding='utf-8'))
    assert new_det['ab_key']['A'] == old_det['ab_key']['A'] and new_det['ab_key']['B'] == old_det['ab_key']['B']
    old_det['mixes'].update(new_det['mixes'])
    json.dump(old_det, open(OUT + '/_ab_details.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    merged = dict(old_raw)
    merged['plans'] = dict(old_raw['plans'])
    merged['plans'][V] = raw_h['plans'][V]
    merged['mixes'] = dict(old_raw['mixes'])
    merged['mixes'].update(raw_h['mixes'])
    merged['hoc_run'] = {'generated_utc': raw_h['generated_utc'], 'tool': os.path.abspath(__file__),
                         'tone': raw_h.get('tone'), 'bed_eq': raw_h.get('bed_eq')}
    json.dump(merged, open(OUT + '/_report_mix_raw.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    json.dump(raw_h, open(R + '/_hocmix/_report_mix_raw_hoc.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    # --- hoc raporu (mix.build_report ile aynı ölçütler, yalnız hoc karışımları)
    rep = {'generated_utc': raw_h['generated_utc'], 'tool': os.path.abspath(__file__), 'plans': {V: raw_h['plans'][V]},
           'mixes': {}, 'done_criteria': {}, 'tone': raw_h.get('tone'), 'bed_eq': raw_h.get('bed_eq')}
    for name, m in raw_h['mixes'].items():
        tl = json.load(open('%s/%s.timeline.json' % (OUT, name), encoding='utf-8'))
        oc = mix.order_check(V, tl)
        mm = dict(m)
        mm.pop('clicks_detail', None)
        mm['order_check'] = oc
        mm['position_check_mp3'] = verify_positions_v36(name, m['mp3_decoder_offset_samples'])
        mix.log('konum denetimi (v3.6, 4 kHz)', name, {k: mm['position_check_mp3'][k] for k in
                                                       ('pieces', 'min_corr', 'min_corr_piece', 'median_corr',
                                                        'max_abs_offset_ms', 'v3_ok')})
        mm['timeline'] = '%s/%s.timeline.json' % (OUT, name)
        rep['mixes'][name] = mm
        sob = m['speech_over_bed']
        rep['done_criteria'][name] = {
            'duration_900pm1': bool(abs(m['duration_s'] - mix.T) <= 1.0),
            'order_as_plan': oc['same_order_and_text'] and oc['monotonic'],
            'every_piece_found_at_its_time_in_mp3': mm['position_check_mp3']['v3_ok'],
            'no_missing_or_duplicate_by_construction': oc['plan_pieces'] == oc['timeline_pieces'] and oc['duplicates'] == 0,
            'full_mix_scribe_alignment': None,
            'screen_equals_spoken': oc['screen_equals_spoken_all'],
            'no_edit_point_clicks_mp3': m['clicks_mp3']['edit_point'] == 0,
            'no_mix_only_clicks_mp3': m['clicks_mp3']['mix_only'] == 0,
            'no_digital_silence_ge_100ms_mp3': m['digital_silence_mp3']['runs_over_100ms'] == 0,
            'speech_over_bed_ge15_pieces_ge_1s': all(sob[ph]['pass_ge_1s'] for ph in mix.PHASES),
            'speech_over_bed_ge15_all_pieces_v3': all(sob[ph]['n_below_15_all'] == 0 for ph in mix.PHASES),
            'true_peak_le_minus1': bool(m['true_peak_dbtp'] <= -1.0),
            'integrated_lufs': m['integrated_lufs'],
            'size_le_14MB': bool(m['bytes'] <= mix.MAX_BYTES),
            'mp3_44k1_stereo': bool(m['sample_rate'] == mix.SR and m['channels'] == 2),
        }
    pj = json.load(open('%s/plan-%s.json' % (OUT, V), encoding='utf-8'))
    rep['selection_flags'] = {V: mix.selection_flags(V, set(pj['units_needed']))}
    json.dump(rep, open(OUT + '/report-hoc.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    # report.json: önceki içerik + hoc
    full = json.load(open(BK + '/report.json', encoding='utf-8'))
    full.setdefault('plans', {})[V] = rep['plans'][V]
    full.setdefault('mixes', {}).update(rep['mixes'])
    full.setdefault('done_criteria', {}).update(rep['done_criteria'])
    full.setdefault('selection_flags', {})[V] = rep['selection_flags'][V]
    full['hoc_added'] = {'utc': rep['generated_utc'], 'tool': rep['tool'], 'report': OUT + '/report-hoc.json',
                         'position_check_rule_hoc': 'SPEC v3.6 (4 kHz alçak geçiren); nes/hak konum değerleri pilottaki '
                                                    'süzgeçsiz ölçümdür (değiştirilmedi)'}
    json.dump(full, open(OUT + '/report.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    mix.log('hoc raporu yazıldı')
    return 0


if __name__ == '__main__':
    sys.exit(main())
