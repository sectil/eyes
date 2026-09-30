#!/usr/bin/env python3
"""kuyruk_ib.py — Ders 3 uyku sonu müzik kuyruğu (ders verisi music.tail, qa.sleepEndRule; PLAN.v2 §B.6). Ücretli çağrı yok.

Uygulama sözleşmesi (taban dalı app/ios/App/App/AlarmPlugin.swift:547, :1074; app/src/lib/yogaLessons.js:40, :186):
tek dosya (`musicTailFile`, örnek 'yoga/ders3-kuyruk.mp3') sonsuz döngüyle çalar (numberOfLoops = −1), 2 sn'de açılır,
son `fade` (180) sn'de kısılır, `seconds` (0/5/10/20 dk) sonunda durur. Bu yüzden dosyada açılış ya da kapanış kararması
YOKTUR ve dosyanın sonu başına dikişsiz bağlanır.

VARSAYIM:
- Döngü uzunluğu 600 sn: varsayılan 10 dk seçeneği tekrarsız çalar; 20 dk'da bir kez döner.
- İçerik: dersin uyku pad'i (d3-uyku) ve Derin ailesi pad'leri sırayla (eşit güç 8 sn geçiş; ib_d03.json aileleri ve
  yarım ses kaydırmaları) + yağmur döngüsü + oda sesi; piyano (imge) yok ("uyku izninde yalnız pad ve yağmur").
- Dikiş: yatak 600 + 8 sn üretilir, son 8 sn eşit güçle başın üstüne bindirilir.
- Düzey: 15 dk dersin son konuşmasından sonraki, kapanış kararmasından önceki yatağın ölçülmüş bütünleşik yüksekliği.
- Yatak yükselişi ≤ 1 dB/sn için Ders 3 karışımındaki yavaş yükseliş sınırlayıcısı (mixib.rise_limit_gain, 0,9 dB/sn).
- Denetimler iki döngü art arda çözülerek yapılır (dikişte tık, yükseliş, dijital sessizlik).
- MP3 önizlemedir; MP3'ün kodlayıcı gecikmesi döngüde boşluk bırakabilir, uygulama dosyası Mac'te WAV ana kopyadan
  (_master/d03-kuyruk-hoc-A.wav) kodlanır (SPEC.v3 §14).

Kullanım: python3 kuyruk_ib.py
"""
import datetime
import json
import os
import random
import sys

import numpy as np
import soundfile as sf

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mixib as X  # noqa: E402

M = X.M
SR = X.SR
R = X.R
OUTD = X.OUTD
LOOP_S = 600
KBPS = 120
T_MIN = 6.0          # rise_after_open ile aynı dışlama yok; iki döngünün tamamı ölçülür (ilk 6 sn yalnız açılış eşiği)


def r(x, n=3):
    return None if x is None else round(float(x), n)


def lesson_end_level():
    """Dersin son yatağının bütünleşik yüksekliği (ana WAV'dan, konuşmasız anlardan): son klibin (k.son) başından önceki
    2 sn ([başlangıç − 2,3; başlangıç − 0,3]; uyku kademesi rampası burada biter, en çok ≈ 0,15 dB sapma) ve varsa son
    klipten sonra kapanış kararmasına kadarki aralık (≥ 0,5 sn ise). 5 dk'da son klipten sonra aralık yok."""
    out = {}
    for m in (15, 5):
        tl = json.load(open('%s/ders3-%d.timeline.json' % (OUTD, m), encoding='utf-8'))
        T = tl['T']
        last = max(tl['speech'], key=lambda s_: s_['start'])
        prev_end = max([s_['end'] for s_ in tl['speech'] if s_['end'] <= last['start']] or [0.0])
        spans = [(max(prev_end + 0.3, last['start'] - 2.3), last['start'] - 0.3)]
        a, b = last['end'] + 0.3, T - M.END_FADE - 0.2
        if b - a >= 0.5:
            spans.append((a, b))
        x, sr = sf.read('%s/_master/d03-%02ddk-hoc-A.wav' % (OUTD, m), dtype='float64', always_2d=True)
        seg = np.concatenate([x[int(a_ * SR):int(b_ * SR)] for a_, b_ in spans])
        out[m] = {'spans_s': [[r(a_, 2), r(b_, 2)] for a_, b_ in spans], 'lufs': r(M.integrated(seg), 2)}
    return out


def build(target, cfg):
    Tl = LOOP_S
    T = int(Tl + X.XF + M.OPEN_FADE + 1.0 + 2)  # üretim uzunluğu: baş payı (s0) + döngü + dikiş payı + 2 sn
    mus = json.load(open(cfg['extra_music'], encoding='utf-8'))
    seq = [mus['uyku'][0]] + list(mus['derin'])
    pls = []
    t = 0.0
    k = 0
    while t < T - 1e-6:
        src = seq[k % len(seq)]
        u0, u1 = src['usable']
        t1 = min(float(T), t + (u1 - u0))
        if t1 < T and T - t1 < X.XF + 20.0 and X.flen(src['file']) - u0 >= T - t:
            t1 = float(T)                       # 20 sn'den kısa son parça bırakma: dosya yetiyorsa bu parçayı uzat
        pls.append({'src': src, 't0': t, 't1': t1, 'off': u0, 'role': 'Kuyruk pad %d' % (k + 1)})
        if t1 >= T:
            break
        t = t1 - X.XF
        k += 1
    music, segs, xfi = X.render_chain(pls, True, T)
    oldT = M.T
    M.T = T
    try:
        rng = random.Random(M.SEED + 3)
        nat, nat_ev = M.loop_stream(cfg['nature'], 30.0, M.NATURE_XF, rng, 0.0, float(T))
        room, room_ev = M.loop_stream([X.MUS + '/common/oda-sesi-1.wav', X.MUS + '/common/oda-sesi-2.wav'], 30.0,
                                      M.ROOM_XF, rng, 0.0, float(T), normalize=False)
    finally:
        M.T = oldT
    nat *= np.float32(10 ** ((-M.NATURE_BELOW_DB + (cfg.get('nature_image_boost_db') or 0.0)) / 20))
    # döngü üretimin s0 = OPEN_FADE + 1 sn'sinden başlar (dersteki açılış bölgesinden uzak; yükseliş sınırlayıcısı da
    # buradan sonra çalışır): y = üretim[s0 : s0 + Tl]; dikiş payı üretim[s0 + Tl : s0 + Tl + XF] başın üstüne biner
    s0 = int(round((M.OPEN_FADE + 1.0) * SR))
    bed = music + nat
    g_rl, rl = X.rise_limit_gain(bed + room, 0.9, M.OPEN_FADE + 3.0)
    bed *= g_rl[:, None]
    y_all = bed + room
    n = int(round(Tl * SR))
    nx = int(round(X.XF * SR))
    if s0 + n + nx > len(y_all):
        raise SystemExit('üretim kısa')
    y = y_all[s0:s0 + n].copy()
    go, gi = M.ep_curves(nx)
    y[:nx] = y[:nx] * gi[:, None].astype(np.float32) + y_all[s0 + n:s0 + n + nx] * go[:, None].astype(np.float32)
    cur = M.integrated(y)
    g = target - cur
    y *= np.float32(10 ** (g / 20))
    info = {'placements': [{'file': os.path.basename(p['src']['file']), 't0': r(p['t0']), 't1': r(p['t1']), 'off': r(p['off'])}
                           for p in pls],
            'loop_window_in_render_s': [r(s0 / SR), r((s0 + n) / SR)], 'seam_xf_s': X.XF,
            'crossfades': xfi, 'nature_events': nat_ev, 'room_events': room_ev, 'rise_limit': rl, 'gain_to_target_db': r(g, 2)}
    off = s0 / SR
    edits = [p['t0'] - off for p in pls] + [p['t1'] - off for p in pls] + \
        [e_[k_] - off for e_ in nat_ev + room_ev for k_ in ('t0', 't1')]
    edits = [e_ for e_ in edits if 0 <= e_ <= Tl] + [0.0, X.XF, float(Tl)]
    return y, Tl, info, edits


def main():
    cfg = X.CONFIGS['d03']()
    lv = lesson_end_level()
    target = lv[15]['lufs']
    os.makedirs(OUTD + '/_rapor', exist_ok=True)
    y, Tl, info, edits = build(target, cfg)
    name = 'ders3-kuyruk'
    sf.write('%s/d03-kuyruk-hoc-A.wav' % X.MASTER, y, SR, subtype='FLOAT')
    mp3 = '%s/%s.mp3' % (OUTD, name)
    lim_tries = []
    for ceil in M.TP_CEIL_PRE:
        ylim, lim = M.tp_limit_stereo(y, ceil)
        enc = X.encode_mp3(ylim, mp3, KBPS, Tl)
        dec, dsr = sf.read(mp3, dtype='float64', always_2d=True)
        tp_dec = M.true_peak(dec)
        lim_tries.append({'ceiling_dbtp': ceil, 'limiter': lim, 'tp_mp3': r(tp_dec, 2)})
        if tp_dec <= -1.0:
            break
    lag = M.mp3_lag(dec, ylim)
    d = dec[lag:lag + Tl * SR]
    dur = (len(dec) - lag) / dsr
    integ = M.integrated(d)
    # dikiş: iki döngü art arda (float ana kopya ve MP3)
    two_f = np.concatenate([ylim, ylim]).astype(np.float64)
    two_m = np.concatenate([d, d])
    ed2 = edits + [e_ + Tl for e_ in edits]
    pw = M.kpower(two_m)
    rise = X.rise_after_open(pw, [], T_MIN)
    z = np.zeros(len(two_f))
    cl_f = M.detect_clicks_mix(two_f, ed2, [], M.hf_frames(z)[0], M.hf_frames(two_f)[0])
    cl_m = M.detect_clicks_mix(two_m, ed2, [], M.hf_frames(z)[0], M.hf_frames(two_f)[0])
    # yağmur damlası kaynak doğrulaması (mixib.nature_source_hit; derstekiyle aynı VARSAYIM): döngü geçişine düşen olay
    # o anda çalan yağmur dosyasının karşılık gelen konumunda da varsa kaynak içeriğidir
    src_ev = X.nature_source_events(cfg['nature'])
    off = info['loop_window_in_render_s'][0]
    for cl in (cl_f, cl_m):
        keep, moved = [], []
        for c in cl['edit_point']:
            tl_ = c[0] % Tl
            cands = [tl_ + off] + ([tl_ + off + Tl] if tl_ < X.XF else [])
            hits = [X.nature_source_hit(t_, info['nature_events'], src_ev) for t_ in cands]
            if any(h[0] for h in hits):
                moved.append(c + [next(h[1] for h in hits if h[0])])
            else:
                keep.append(c)
        cl['edit_point'] = keep
        cl['nature_at_edit'] = moved
    seam = [c for c in cl_f['edit_point'] + cl_f['mix_only'] + cl_m['edit_point'] + cl_m['mix_only'] if abs(c[0] - Tl) <= 0.05]
    ds = M.digital_silence(two_m)
    j = int(Tl * SR)
    jump = float(np.abs(two_f[j] - two_f[j - 1]).max())
    typ = float(np.percentile(np.abs(np.diff(two_f[j - SR:j + SR], axis=0)), 99.9))
    crit = {
        'sure_600_pm1s': bool(abs(dur - Tl) <= 1.0),
        'duzey_ders_sonu_pm1': bool(abs(integ - target) <= 1.0),
        'yatak_yukselisi_le_1dB_s_iki_dongu': bool((rise['max_rise_db_per_s'] or 0) <= 1.0 + 1e-9),
        'dikiste_tik_yok': len(seam) == 0,
        'dikiste_sicrama_yok': bool(jump <= typ),
        'gecis_tiki_yok_mp3': len(cl_m['edit_point']) + len(cl_m['mix_only']) == 0,
        'gecis_tiki_yok_float': len(cl_f['edit_point']) + len(cl_f['mix_only']) == 0,
        'dijital_sessizlik_100ms_yok': ds['runs_over_100ms'] == 0,
        'gercek_tepe_le_m1': bool(tp_dec <= -1.0),
        'boyut_le_15MB': bool(enc['bytes'] <= X.MAX_BYTES),
        'mp3_44k1_stereo': bool(dsr == SR and dec.shape[1] == 2),
    }
    rep = {'name': name, 'lesson': 'd03', 'loop_s': Tl, 'app_contract': 'tail { file, seconds: dk*60, fade: 180 }; döngü −1',
           'generated_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'tool': 'render/tools/kuyruk_ib.py',
           'file': os.path.basename(mp3), 'bytes': enc['bytes'], 'encoding': enc, 'duration_decoded_s': r(dur, 3),
           'target_lufs_from_lesson_end': lv, 'integrated_lufs': r(integ, 2), 'true_peak_dbtp_mp3': r(tp_dec, 2),
           'tp_limiter': lim_tries, 'loudness_rise_two_loops': rise,
           'clicks_float_two_loops': {k: len(v) for k, v in cl_f.items()}, 'clicks_mp3_two_loops': {k: len(v) for k, v in cl_m.items()},
           'clicks_list': {'float': cl_f['edit_point'] + cl_f['mix_only'], 'mp3': cl_m['edit_point'] + cl_m['mix_only'],
                           'float_nature_at_edit': cl_f['nature_at_edit'], 'mp3_nature_at_edit': cl_m['nature_at_edit']},
           'seam': {'sample_jump': r(jump, 6), 'p99_9_neighbour_diff': r(typ, 6), 'clicks_at_seam': seam},
           'digital_silence_two_loops': ds, 'build': info, 'criteria': crit, 'pass': all(crit.values())}
    json.dump(rep, open('%s/_rapor/d03-kuyruk.json' % OUTD, 'w', encoding='utf-8'), ensure_ascii=False, indent=1, default=str)
    print(name, 'GEÇTİ' if rep['pass'] else 'KALDI', {k: v for k, v in crit.items() if not v}, 'I %.2f (hedef %.2f)' % (
        integ, target), 'TP %.2f' % tp_dec, 'yükseliş %.2f' % (rise['max_rise_db_per_s'] or 0), 'bayt', enc['bytes'])


if __name__ == '__main__':
    main()
