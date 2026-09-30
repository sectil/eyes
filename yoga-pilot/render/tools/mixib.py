#!/usr/bin/env python3
"""mixib.py — ilk bölüm karışımları (Ders 1, 2, 3, 5 × yayın süreleri; SPEC.v3 §8, §10–§13).

tools/mix.py DEĞİŞTİRİLMEDEN içe aktarılır; onun ölçüm ve işleme fonksiyonları (yükseklik, gerçek tepe, eşit güç geçiş,
yatak EQ, konuşma/yatak, yerel yatak kısması, tık, dijital sessizlik, stereo sınırlayıcı) kullanılır. Bu dosyada
genelleşen kısımlar: ders ve süre (T), parça kütüphanesi (A adımı + bu partinin seçimleri), ölçülmüş sürelerle plan,
N parçalı müzik aileleri, imge ve zıtlık dokusu, dosya adları ve timeline şeması (nefona.yoga.timeline/2).

Kullanım:  python3 mixib.py <dNN> <dakika> [--plan-only]
Çıktı:     out/ilk-bolum/ders<N>-<dk>.mp3 + .timeline.json;  out/ilk-bolum/_master/dNN-MMdk-hoc-A.wav (depoya girmez);
           out/ilk-bolum/_rapor/dNN-MMdk.json, out/ilk-bolum/_rapor/plan-dNN-MMdk.json
"""
import datetime
import hashlib
import json
import math
import os
import random
import sys

import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfiltfilt

Y = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga'
R = Y + '/render'
sys.path.insert(0, R + '/tools')
import mix as M  # noqa: E402
import audio  # noqa: E402

SR = M.SR
OUTD = R + '/out/ilk-bolum'
MASTER = OUTD + '/_master'
REP = OUTD + '/_rapor'
MUS = M.MUS
XF = M.XF
VOICE = {'id': 'hoc', 'name': 'Nefona Hoca', 'voice_id': 'Sr5w7dIZaRDglJ2cLaJm'}
LP_HZ = 4000.0
_SOS_LP = butter(8, LP_HZ, btype='low', fs=SR, output='sos')
MP3_KBPS = {5: 120, 15: 120, 20: 96, 3: 120}
MAX_BYTES = 15_000_000
# VARSAYIM: pencere kabarması +6 dB, çıkış rampası 6 sn yerine 12 sn (0,5 dB/sn). 6 dB / 6 sn tam 1 dB/sn sınırında (SPEC.v3 §8.3,
# §12.1); Ders 2 20 dk'da müzik ve doğa içeriğiyle 1,23 (6 sn) ve 1,18 dB/sn (8 sn) ölçüldü. İniş rampası ve yükseklik değişmez.
M.SWELL = dict(M.SWELL, rampUpSec=12)
log = M.log
r = M.r


# ================================================================================================ ders ayarları
def d02_config():
    return {
        'no': 2, 'id': 'd02', 'lesson_path': Y + '/b/ders2/ders2.lesson.v3.json', 'scene': 'orman',
        'release': [5, 15, 20], 'night': False,
        'selections': [R + '/sel/hoc/d02/selection-d02.json',            # bu parti (önce aranır)
                       R + '/sel/hoc/selection-hoc-1.json', R + '/sel/hoc/selection-hoc-2.json'],   # A adımı
        'music': {
            'opening': [{'file': MUS + '/el/el-v-aday.keyA.wav', 'usable': (3.0, 160.0)}],
            'vd': [{'file': MUS + '/el/el-vd-a.wav', 'usable': (3.0, 286.5)},
                   {'file': MUS + '/el/el-vd-b.wav', 'usable': (15.5, 288.0)}],
            'derin': [{'file': MUS + '/el/el-derin-a.wav', 'usable': (12.5, 237.5)},
                      {'file': MUS + '/el/el-derin-b.keyD.wav', 'usable': (25.5, 220.0)}],
            'kapanis': [{'file': MUS + '/el/el-kapanis.wav', 'usable': (4.5, 170.5)}],
            'imge': [{'file': MUS + '/el/el-imge.wav', 'usable': (1.5, 166.0)}],
            'family': 'A/Re',
        },
        'extra_music': R + '/music/el/ib_d02.json',     # bu partinin parçaları (varsa ailelere eklenir)
        'nature': [MUS + '/common/orman-%d.wav' % i for i in (1, 2, 3, 4)],
        'tone': MUS + '/common/donus.synth-D5.wav',
        'lufs_target': -18.0,
    }


CONFIGS = {'d02': d02_config}


# ================================================================================================ parça kütüphanesi
def load_library(cfg):
    """units: birim → {pieces, flags, src}; items: taşıyıcı öğesi → parça. Önce gelen seçim dosyası önceliklidir."""
    units, items = {}, {}
    for path in cfg['selections']:
        if not os.path.exists(path):
            log('seçim dosyası yok (atlandı):', path)
            continue
        s = json.load(open(path, encoding='utf-8'))
        for uid, e in s['units'].items():
            if uid in units:
                continue
            ps = []
            for p in e['pieces']:
                info = sf.info(p['file'])
                if info.samplerate != SR or info.channels != 1:
                    raise SystemExit('parça biçimi beklenmedik: %s' % p['file'])
                d = {'piece_id': p['piece_id'], 'unit': uid, 'text': p.get('text'), 'file': p['file'],
                     'frames': info.frames, 'dur': info.frames / SR, 'src': os.path.basename(path),
                     'v3': _v3_of(p)}
                ps.append(d)
            fl = []
            for f in (e.get('flags') or []):
                fl.append({'flag': f.get('flag'), 'reason': f.get('reason'), 'piece': f.get('piece')} if isinstance(f, dict)
                          else {'flag': str(f), 'reason': None, 'piece': None})
            units[uid] = {'pieces': ps, 'flags': fl, 'kind': e.get('kind'), 'src': os.path.basename(path),
                          'scribe_text': e.get('scribe_text'), 'compare': e.get('compare'), 'tts': e.get('tts')}
            if e.get('kind') == 'carrier':
                for d in ps:
                    if not d['piece_id'].startswith('_'):
                        items.setdefault(d['piece_id'], d)
    return {'units': units, 'items': items}


def _v3_of(p):
    pr = p.get('process') or {}
    pk = pr.get('peak') or {}
    return {'changed': False, 'chain': pk.get('chain'), 'level_mode': pr.get('level_mode'), 'lufs': pr.get('lufs'),
            'limiter_max_db': pr.get('limiter_max_db'), 'short_level_capped': pr.get('short_level_capped')}


def resolve(lib, c, scene):
    """Plan klibinin çalınan parçaları (sırasıyla) ya da None. Metin birebir aynı olmalı (ekrandaki = söylenen)."""
    T_ = M.timing
    subs = T_.sub_texts(c)
    if c.get('carrier'):
        p = lib['items'].get(c['id'])
        if p and p['text'] == subs[0]:
            return [p]
        return None
    cands = []
    if c.get('shortForm'):
        cands.append(c['id'] + '.kisa')
    cands += [c['id'] + '.' + scene, c['id']]
    for uid in cands:
        u = lib['units'].get(uid)
        if not u:
            continue
        ps = [p for p in u['pieces'] if not p['piece_id'].endswith('#_pre')]
        if len(ps) == len(subs) and all(p['text'] == t for p, t in zip(ps, subs)):
            return ps
    return None


# ================================================================================================ plan
def measured_plan(cfg, L, T, lib):
    tm = M.timing
    orig = tm.sub_durs
    missing = []

    def sd(c, rate, prof):
        ps = resolve(lib, c, cfg['scene'])
        if ps is None:
            if c['id'] not in missing:
                missing.append(c['id'])
            return orig(c, rate, prof)
        return [p['dur'] for p in ps]

    tm.sub_durs = sd
    tm._SUB_CACHE.clear()
    try:
        p = tm.plan(L, T, 5.6, 'hi')
        fails, dens, runs = tm.check_plan(L, p)
    finally:
        tm.sub_durs = orig
    miss_ev = sorted({ev['clip']['id'] for ev in p['events'] if ev['clip']['id'] in missing})
    return p, fails, dens, runs, miss_ev


# ================================================================================================ konuşma izi
def voice_track(cfg, L, T, plan, lib):
    N = T * SR
    v = np.zeros(N, dtype=np.float32)
    PG = {k: float(x) for k, x in L['voicePhaseGainDb'].items() if isinstance(x, (int, float))}
    evs = plan['events']
    pts_t, pts_g = [0.0], [PG[evs[0]['clip']['phase']]]
    ramps = []
    for i, ev in enumerate(evs):
        g = PG[ev['clip']['phase']]
        if i and g != PG[evs[i - 1]['clip']['phase']]:
            a = evs[i - 1]['subs'][-1]['end']
            b = ev['subs'][0]['start']
            pts_t += [a, b]
            pts_g += [PG[evs[i - 1]['clip']['phase']], g]
            ramps.append({'from': evs[i - 1]['clip']['id'], 'to': ev['clip']['id'], 't0': r(a, 3), 't1': r(b, 3),
                          'sec': r(b - a, 3), 'db_from': PG[evs[i - 1]['clip']['phase']], 'db_to': g,
                          'ge_4s': bool(b - a >= M.timing.GAIN_RAMP_SEC - 1e-6)})
    pts_t.append(float(T))
    pts_g.append(pts_g[-1])
    speech, prev_end = [], -1
    for ei, ev in enumerate(evs):
        c = ev['clip']
        ps = resolve(lib, c, cfg['scene'])
        unit_start = None
        for k, (sub, pc) in enumerate(zip(ev['subs'], ps)):
            x, sr = sf.read(pc['file'], dtype='float32')
            s0 = int(round(sub['start'] * SR))
            if s0 < prev_end:
                raise SystemExit('parça örtüşmesi: %s' % pc['piece_id'])
            if s0 + len(x) > N:
                raise SystemExit('parça dosya sonunu aşıyor: %s' % pc['piece_id'])
            gdb = np.interp([sub['start'], sub['end']], pts_t, pts_g)
            if abs(gdb[0] - gdb[1]) > 1e-6:
                raise SystemExit('kazanç rampası söz içine düştü: %s' % pc['piece_id'])
            v[s0:s0 + len(x)] += x * np.float32(10 ** (gdb[0] / 20))
            prev_end = s0 + len(x)
            if unit_start is None:
                unit_start = s0 / SR
            speech.append({'piece': pc['piece_id'], 'unit': pc['unit'], 'clip': c['id'], 'block': ev['block'],
                           'phase': c['phase'], 'start': s0 / SR, 'end': (s0 + len(x)) / SR, 'sub_index': k,
                           'n_subs': len(ps), 'plan_text': sub['text'], 'spoken_text': pc['text'],
                           'voice_gain_db': float(gdb[0]), 'file': pc['file'], 'cue': c.get('cue') or {},
                           'v3': pc.get('v3'), 'resume_at': unit_start, 'event': ei,
                           'carrier': (c.get('carrier') or {}).get('id') if c.get('carrier') else None})
    return v, speech, {'points_t': pts_t, 'points_db': pts_g, 'ramps': ramps}


# ================================================================================================ müzik düzeni
def flen(path):
    return sf.info(path).frames / SR


def cue_times(plan):
    return M.cue_times(plan)


def phase_first(plan):
    b, prev = {}, None
    for ev in plan['events']:
        ph = ev['clip']['phase']
        if ph != prev and ph not in b:
            b[ph] = (ev['start'], ev['clip']['id'])
        prev = ph
    return b


def chain(files, t_start, t_end, role, speech, blocks, notes, first_off=None, forbid=()):
    """t_start'tan t_end'e (sonraki geçişin sonu dahil) N dosyalı aile akışı. Her dosya kullanılabilir aralığından
    (usable ± XF) çalar; dosya değişimi ≥ 8 sn eşit güç geçişle konuşmanın altında (geçiş penceresinde konuşma payı
    ≥ 0,5 olan adaylar önce), mevcut dosya en geç uygun ana kadar kullanılır (sonraki dosyanın kendi iç dinamiği en az
    çalsın); forbid aralıklarına (ör. zıtlık dokusunun ±20 sn çevresi) geçiş konmaz. Hiçbir dosya bölümü iki kez çalmaz."""
    def cap(f):
        return min(flen(f['file']), f['usable'][1] + XF) - max(0.0, f['usable'][0] - XF)

    out = []
    t = t_start
    bset = set(round(x, 6) for x in blocks)
    for i, f in enumerate(files):
        o = first_off if (i == 0 and first_off is not None) else max(0.0, f['usable'][0] - XF)
        endl = min(flen(f['file']), f['usable'][1] + XF)
        if o + (t_end - t) <= endl + 1e-6:
            out.append({'src': f, 't0': t, 't1': t_end, 'off': o, 'role': role})
            return out
        if i == len(files) - 1:
            raise SystemExit('aile kapsamı yetmiyor: %s (%.1f sn eksik)' % (role, o + (t_end - t) - endl))
        rest = sum(cap(g) for g in files[i + 1:]) - XF * (len(files) - i - 2)
        lo = max(t + XF, t_end - rest)
        hi = t + (endl - o) - XF
        cands = []
        for s in speech:
            if lo - 1e-6 <= s['start'] <= hi + 1e-6 and not any(a <= s['start'] <= b for a, b in forbid):
                cov = M.speech_cover(speech, s['start'], s['start'] + XF)
                cands.append((cov >= 0.5, round(s['start'], 6) in bset, s['start'], round(cov, 2), s['piece']))
        if not cands:
            raise SystemExit('aile içi geçiş noktası yok: %s [%.1f, %.1f]' % (role, lo, hi))
        cands.sort(reverse=True)
        cands = [(c[3], c[1], -c[2], c[2], c[4]) for c in cands]
        S = cands[0][3]
        notes.append('%s: aile içi geçiş %.2f sn (%s; geçiş penceresinde konuşma payı %.2f; uygun aralık %.1f–%.1f)'
                     % (role, S, cands[0][4], cands[0][0], lo, hi))
        out.append({'src': f, 't0': t, 't1': S + XF, 'off': o, 'role': role})
        t = S
    raise SystemExit('aile kapsamı yetmiyor: %s' % role)


def arrange(cfg, plan, speech, T):
    mus = cfg['music']
    pb = phase_first(plan)
    ct = cue_times(plan)
    t_n1, t_c2, t_k = pb['Derinleşme'][0], pb['Derin'][0], pb['Kapanış'][0]
    blocks, pbk = [], None
    for ev in plan['events']:
        if ev['block'] != pbk:
            blocks.append(ev['start'])
            pbk = ev['block']
    notes = []
    pl = []
    O = mus['opening'][0]
    if x_need(O, 0.0, t_n1 + XF) > flen(O['file']) + 1e-6:
        raise SystemExit('açılış dosyası kısa')
    pl.append({'src': O, 't0': 0.0, 't1': t_n1 + XF, 'off': 0.0, 'role': 'Varış açılışı'})
    pl += chain(mus['vd'], t_n1, t_c2 + XF, 'Varış-Derinleşme ailesi', speech, blocks, notes)
    zit = None
    if 'layer:zitlik' in ct:
        # Zıtlık dokusu (SPEC.v3 §7.3, §8.5): c3.agir → c3.birak arasında Derin yatağının yerine ayrı üretilmiş ince doku.
        # Derin zinciri iki parça: zıtlıktan önce, sonra zıtlıktan sonra aynı dosyanın KALDIĞI yerden (hiçbir bölüm iki
        # kez çalmaz); iki uçta ≥ 8 sn eşit güç geçiş; zıtlığın 20 sn çevresine aile içi geçiş konmaz.
        z0 = ct['layer:zitlik'][0][0]
        z1 = next(ev['start'] for ev in plan['events'] if ev['clip']['id'] == 'c3.birak')
        Z = (mus.get('zitlik') or [None])[0]
        if Z is None:
            raise SystemExit('zıtlık dokusu dosyası yok (music.zitlik)')
        oz = max(0.0, Z['usable'][0] - XF)
        if oz + (z1 + XF - z0) > min(flen(Z['file']), Z['usable'][1] + XF) + 1e-6:
            raise SystemExit('zıtlık dosyası kısa')
        files = mus['derin']
        p1 = chain(files, t_c2, z0 + XF, 'Derin ailesi', speech, blocks, notes, forbid=[(z0 - 20.0 - XF, z0 + XF)])
        last = p1[-1]
        o_end = last['off'] + (last['t1'] - last['t0'])
        i = files.index(last['src'])
        rest = files[i + 1:]
        if o_end + 2 * XF < min(flen(last['src']['file']), last['src']['usable'][1] + XF):
            rest = [{'file': last['src']['file'], 'usable': (o_end + XF, last['src']['usable'][1])}] + rest
        p2 = chain(rest, z1, t_k + XF, 'Derin ailesi', speech, blocks, notes, forbid=[(z1, z1 + 20.0 + XF)])
        pl += p1 + [{'src': Z, 't0': z0, 't1': z1 + XF, 'off': oz, 'role': 'Zıtlık dokusu'}] + p2
        zit = {'t0': z0, 't1': z1 + XF, 'file': os.path.basename(Z['file'])}
        notes.append('Zıtlık dokusu: %.2f–%.2f sn (c3.agir → c3.birak + 8 sn); Derin zinciri %s dosyasının %.1f. sn\'sinden '
                     'sürer' % (z0, z1 + XF, os.path.basename(p2[0]['src']['file']), p2[0]['off']))
    else:
        pl += chain(mus['derin'], t_c2, t_k + XF, 'Derin ailesi', speech, blocks, notes)
    K = mus['kapanis'][0]
    lenK = flen(K['file'])
    o_k = t_k - (T - lenK)
    if o_k < 0:
        raise SystemExit('kapanış dosyası kısa')
    if o_k < K['usable'][0] - XF:
        notes.append('Kapanış: dosya başı kullanılabilir aralığın önünde (%.1f sn)' % o_k)
    pl.append({'src': K, 't0': t_k, 't1': float(T), 'off': o_k, 'role': 'Kapanış'})
    imge = None
    if 'layer:imge' in ct and 'layer:imge-off' in ct:
        t_on, t_off = ct['layer:imge'][0][0], ct['layer:imge-off'][0][0]
        imge = chain(mus['imge'], t_on, t_off + XF, 'İmge katmanı', speech, blocks, notes, first_off=0.0)
    xinfo = [{'what': 'Varış → Varış-Derinleşme ailesi', 'start': r(t_n1, 3),
              'speech_cover': r(M.speech_cover(speech, t_n1, t_n1 + XF), 2)},
             {'what': 'Varış-Derinleşme → Derin', 'start': r(t_c2, 3),
              'speech_cover': r(M.speech_cover(speech, t_c2, t_c2 + XF), 2)},
             {'what': 'Derin → Kapanış', 'start': r(t_k, 3), 'speech_cover': r(M.speech_cover(speech, t_k, t_k + XF), 2)}]
    return {'placements': pl, 'imge': imge, 'zitlik': zit, 'xfades': xinfo, 'notes': notes,
            'times': {'t_n1': t_n1, 't_c2': t_c2, 't_k': t_k,
                      'img_on': imge[0]['t0'] if imge else None, 'img_off': (imge[-1]['t1'] - XF) if imge else None}}


def x_need(f, off, dur):
    return off + dur


def render_chain(pls, eq, T, rel_db=0.0, fade_in=None, fade_out=None):
    old = M.T
    M.T = T
    try:
        y, segs, xfi = M.render_stream(pls, eq)
    finally:
        M.T = old
    if rel_db:
        y *= np.float32(10 ** (rel_db / 20))
    if fade_in:
        s0 = int(round(pls[0]['t0'] * SR))
        n = int(round(fade_in * SR))
        _, gi = M.ep_curves(n)
        y[s0:s0 + n] *= gi[:, None].astype(np.float32)
    if fade_out:
        e = int(round(pls[-1]['t1'] * SR))
        n = int(round(fade_out * SR))
        go, _ = M.ep_curves(n)
        y[e - n:e] *= go[:, None].astype(np.float32)
    return y, segs, xfi


def rise_after_open(pw, speech, t_min):
    """mix.rise_rates ile aynı ölçü (3 sn ST, 0,1 sn adım, 1 sn'deki artış), açılış kararması (0–3 sn) ve onu kapsayan
    ST pencereleri dışlanarak: pencere başı ≥ t_min. Dönüş tınısı ayrı izde olduğu için tınısız yatakta ölçülür."""
    tc, st = M.st_curve(pw, 3.0, 0.1)
    d = st[10:] - st[:-10]
    tm = tc[:-10]
    ok = np.isfinite(d) & (st[:-10] > -80) & (tm >= t_min)
    iv = np.zeros(len(tm), dtype=bool)
    for s in speech:
        iv |= (tm + 1.5 + 1.0 >= s['start']) & (tm - 1.5 <= s['end'])
    gap = ok & ~iv
    top = np.argsort(-np.where(ok, d, -1e9))[:5]
    return {'stem': 'yatak, tınısız, açılış kararması dışında (pencere başı ≥ %.1f sn)' % t_min,
            'max_rise_db_per_s': r(np.max(d[ok]), 2), 'at_s': r(tm[ok][np.argmax(d[ok])], 1),
            'max_rise_in_speech_free_s': r(np.max(d[gap]), 2) if gap.any() else None,
            'at_speech_free_s': r(tm[gap][np.argmax(d[gap])], 1) if gap.any() else None,
            'n_1s_steps_over_1db': int(np.sum(d[ok] > 1.0)), 'top5': [[r(tm[i], 1), r(d[i], 2)] for i in top]}


# ================================================================================================ görsel ve zaman çizelgesi
def visual_timeline(L, T, plan, speech):
    vis = []
    state = {'phase': None, 'image': 'off', 'dawn': False}
    don = next(ev for ev in plan['events'] if ev['clip']['id'] == 'k.donus')
    dz = L['visual']['dawn']
    span = dz['spanSec'][1] if isinstance(dz.get('spanSec'), list) else dz.get('spanSec', 90)
    dawn_start = max(don['start'], T - float(span))
    vis.append({'t': r(dawn_start, 3), 'cue': 'dawn:start', 'rule': dz.get('startRule'), 'span_s': r(T - dawn_start, 2)})
    for ev in plan['events']:
        cv = (ev['clip'].get('cue') or {})
        if cv.get('visual'):
            item = {'t': r(ev['start'], 3), 'cue': cv['visual'], 'clip': ev['clip']['id']}
            if cv.get('breath'):
                item['breath'] = cv['breath']
            vis.append(item)
    vis.sort(key=lambda x: x['t'])
    for s in speech:
        cv = s['cue'] or {}
        if s['sub_index'] == 0 and cv.get('visual', '').startswith('phase:'):
            state['phase'] = cv['visual'].split(':', 1)[1]
        if s['sub_index'] == 0 and cv.get('visual') == 'dawn':
            state['phase'] = 'kapanis'
        if s['sub_index'] == 0 and cv.get('visual') == 'image:on':
            state['image'] = 'on'
        if s['sub_index'] == 0 and cv.get('visual') == 'image:off':
            state['image'] = 'off'
        state['dawn'] = s['start'] >= dawn_start - 1e-9
        s['visual_cue'] = ({k: v for k, v in cv.items() if k in ('visual', 'breath')} or None) if s['sub_index'] == 0 else None
        s['visual_state'] = dict(state)
    return vis, dawn_start


# ================================================================================================ kodlama ve konum denetimi
def encode_mp3(x, path, kbps, T):
    import lameenc
    rng = np.random.default_rng(M.SEED)
    d = (rng.random(x.shape) - rng.random(x.shape)) / 32768.0
    pcm = np.clip(np.round((x.astype(np.float64) + d) * 32767.0), -32768, 32767).astype('<i2')
    enc = lameenc.Encoder()
    enc.set_in_sample_rate(SR)
    enc.set_channels(2)
    enc.set_quality(2)
    enc.set_out_sample_rate(SR)       # LAME düşük bit hızında örnekleme hızını kendiliğinden düşürüyor (96 kbit/sn → 32 kHz)
    enc.set_vbr(3)
    enc.set_vbr_mean_bitrate_kbps(kbps)
    data = bytearray()
    step = SR * 10
    for s in range(0, len(pcm), step):
        data += enc.encode(pcm[s:s + step].tobytes())
    data += enc.flush()
    if len(data) > MAX_BYTES:
        raise SystemExit('MP3 %d bayt > %d' % (len(data), MAX_BYTES))
    with open(path, 'wb') as f:
        f.write(data)
    return {'mode': 'ABR %d kbit/s (lameenc, q=2)' % kbps, 'bytes': len(data), 'kbps_avg': r(len(data) * 8 / T / 1000, 1)}


def verify_positions(speech, dec, lag):
    mid = dec.mean(axis=1)
    midf = sosfiltfilt(_SOS_LP, mid)
    W = int(0.05 * SR)

    def best(sig, x, s0):
        seg = sig[max(0, s0 - W):s0 + len(x) + W]
        c = np.correlate(seg, x, 'valid')
        e = np.concatenate([[0.0], np.cumsum(seg * seg)])
        nx = math.sqrt(float(np.dot(x, x)))
        ns = np.sqrt(np.maximum(e[len(x):] - e[:-len(x)], 1e-20))
        cc = c / (nx * ns[:len(c)])
        k = int(np.argmax(cc))
        return float(cc[k]), (k - min(W, s0)) / SR

    rows = []
    for sp in speech:
        x, _ = sf.read(sp['file'], dtype='float64')
        x = x * 10 ** (sp['voice_gain_db'] / 20)
        s0 = int(round(sp['start'] * SR)) + lag
        c, o = best(midf, sosfiltfilt(_SOS_LP, x), s0)
        rows.append((sp['piece'], c, o))
    worst = min(rows, key=lambda x: x[1])
    return {'pieces': len(rows), 'min_corr': r(worst[1], 3), 'min_corr_piece': worst[0],
            'median_corr': r(float(np.median([x[1] for x in rows])), 3),
            'max_abs_offset_ms': r(1000 * max(abs(x[2]) for x in rows), 3),
            'n_corr_below_0_95': sum(1 for x in rows if x[1] < 0.95),
            'pass': bool(all(abs(x[2]) <= 0.001 for x in rows) and worst[1] >= 0.95),
            'rule': 'SPEC.v3 §13: iki sinyal 4 kHz altına süzülür (8. derece Butterworth, sıfır faz); ilinti ≥ 0,95, '
                    'kayma ≤ 1 ms; ±50 ms arama; dosya başına tek kodlayıcı kayması',
            'lowest5': [[p, r(c, 3), r(1000 * o, 3)] for p, c, o in sorted(rows, key=lambda x: x[1])[:5]]}


# ================================================================================================ ana akış
def run(les, minutes, plan_only=False):
    cfg = CONFIGS[les]()
    T = int(minutes * 60)
    M.T = T
    os.makedirs(OUTD, exist_ok=True)
    os.makedirs(MASTER, exist_ok=True)
    os.makedirs(REP, exist_ok=True)
    L = M.timing.with_scene(M.timing.load(cfg['lesson_path']), cfg['scene']) if cfg['scene'] else M.timing.load(cfg['lesson_path'])
    lib = load_library(cfg)
    extra = cfg.get('extra_music')
    if extra and os.path.exists(extra):
        for role, lst in json.load(open(extra)).items():
            if role.startswith('_'):
                continue
            cfg['music'][role] = cfg['music'].get(role, []) + [{'file': x['file'], 'usable': tuple(x['usable'])} for x in lst]
    tag = '%s-%02ddk' % (les, minutes)
    log('plan', tag)
    p, fails, dens, runs, miss = measured_plan(cfg, L, T, lib)
    slack = T - (p['speech'] + p['gaps']['min'])     # timing.slack5 kalıbı: min sessizliklerle boş pay
    pj = {'lesson': les, 'T': T, 'status': p['status'], 'mode': p['mode'], 'f': r(p['f'], 4), 'total': r(p['total'], 4),
          'speech_sec': r(p['speech'], 3), 'sel': p['sel'], 'stop': list(p['stop']) if p['stop'] else None,
          'notes': p['notes'], 'check_plan': {'fails': fails, 'pass': not fails,
                                              'density': {k: (r(x, 3) if not isinstance(x, list) else x) for k, x in dens.items()}},
          'slack_min_s': r(slack, 2), 'missing_clips': miss,
          'events': [{'clip': ev['clip']['id'], 'block': ev['block'], 'phase': ev['clip']['phase'],
                      'start': r(ev['start'], 4), 'end': r(ev['end'], 4), 'gapAfter': r(ev['gap'], 4),
                      'subs': [{'start': r(s['start'], 4), 'end': r(s['end'], 4), 'text': s['text']} for s in ev['subs']]}
                     for ev in p['events']]}
    json.dump(pj, open('%s/plan-%s.json' % (REP, tag), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    log(tag, 'status', p['status'], p['mode'], 'total %.3f' % p['total'], 'fails', fails, 'eksik', miss,
        'boş pay (min) %.2f' % slack)
    if miss:
        log('EKSİK KLİP (üretilmeli):', miss)
        return 2
    if fails:
        log('check_plan KALDI:', fails)
        return 3
    if plan_only:
        return 0
    # --- konuşma
    voice, speech, vgain = voice_track(cfg, L, T, p, lib)
    vis, dawn_start = visual_timeline(L, T, p, speech)
    # --- ortak katmanlar
    rng = random.Random(M.SEED)
    nature_raw, nature_ev = (M.loop_stream(cfg['nature'], 30.0, M.NATURE_XF, rng, 0.0, float(T))
                             if cfg.get('nature') else (np.zeros((T * SR, 2), dtype=np.float32), []))
    room, room_ev = M.loop_stream([MUS + '/common/oda-sesi-1.wav', MUS + '/common/oda-sesi-2.wav'], 30.0, M.ROOM_XF, rng,
                                  0.0, float(T), normalize=False)
    nr = int(0.05 * SR)
    room[:nr] *= np.linspace(0, 1, nr, dtype=np.float32)[:, None]
    nr2 = int(0.5 * SR)
    room[-nr2:] *= np.linspace(1, 0, nr2, dtype=np.float32)[:, None]
    tone = np.zeros_like(room)
    tone_ev = []
    if cfg.get('tone'):
        tx, _ = sf.read(cfg['tone'], dtype='float64', always_2d=True)
        if tx.shape[1] == 1:
            tx = np.repeat(tx, 2, axis=1)
        tg = M.TONE_LUFS - M.integrated(tx)
        for tok, lst in cue_times(p).items():
            if tok.startswith('returnTone:'):
                off = float(tok.split(':')[1].rstrip('s'))
                for (ts, cid) in lst:
                    s0 = int(round((ts + off) * SR))
                    tone[s0:s0 + len(tx)] += (tx * 10 ** (tg / 20)).astype(np.float32)
                    tone_ev.append({'t': r(ts + off, 3), 'before_clip': cid, 'lufs_integrated': M.TONE_LUFS,
                                    'dur_s': r(len(tx) / SR, 2)})
    windows = []
    for i, ev in enumerate(p['events']):
        if ev['clip'].get('window') and ev['gap'] >= M.SWELL_MIN:
            windows.append((ev['end'], ev['end'] + ev['gap'], p['events'][i + 1]['start']))
    v_pow = 2.0 * M.STEREO_SPEECH_GAIN ** 2 * M.kpower(voice)
    # --- müzik
    arr = arrange(cfg, p, speech, T)
    bed, segs, xfi = render_chain(arr['placements'], True, T)
    zinfo = arr['zitlik']
    if arr['imge']:
        im, _, ixfi = render_chain(arr["imge"], True, T, rel_db=-M.IMGE_BELOW_DB, fade_in=XF, fade_out=XF)
    else:
        im, ixfi = np.zeros_like(bed), []
    DUCK = {k: float(x) for k, x in L['music']['duckedBedLufs'].items() if isinstance(x, (int, float))}
    PH = [ph for ph in M.PHASES if ph in DUCK]
    base = {ph: DUCK[ph] - 10 * math.log10(1 + 10 ** (-M.NATURE_BELOW_DB / 10)) if cfg.get('nature') else DUCK[ph] for ph in PH}
    off = {ph: 0.0 for ph in PH}
    iters = []
    img_on = arr['times']['img_on'] if arr['imge'] else T + 100.0
    img_off = arr['times']['img_off'] if arr['imge'] else T + 100.0
    for it in range(6):
        levels = {ph: base[ph] + off[ph] for ph in PH}
        tt, env_b, ramps_b = M.level_envelope(p, arr['times'], levels, img_on, img_off, windows, 'bed')
        _, env_i, _ = M.level_envelope(p, arr['times'], levels, 0, -1, windows, 'imge')
        _, env_n, _ = M.level_envelope(p, arr['times'], {ph: levels[ph] - M.NATURE_BELOW_DB for ph in PH}, 0, -1, windows, 'nature')
        music = M.apply_env(bed, tt, env_b) + M.apply_env(im, tt, env_i)
        nat = M.apply_env(nature_raw, tt, env_n) if cfg.get('nature') else np.zeros_like(music)
        bg = music + nat + room + tone
        sob, rows = M.speech_over_bed(v_pow, M.kpower(bg), speech)
        need = {}
        for ph in PH:
            mn = sob[ph]['min_diff_ge_1s']
            if mn is not None and mn < M.SOB_MIN:
                need[ph] = mn - M.SOB_MIN - 0.1
        iters.append({'iter': it, 'offsets_db': {k: r(x, 2) for k, x in off.items()},
                      'min_diff_ge_1s': {ph: sob[ph]['min_diff_ge_1s'] for ph in PH}})
        if not need:
            break
        for ph, d in need.items():
            off[ph] += d
        log('konuşma/yatak ofsetleri', {k: round(x, 2) for k, x in off.items()})
    # yerel yatak kısması
    needs, duck_iters, duck_spans = {}, [], []
    music0, nat0 = music, nat
    for it in range(5):
        add = {}
        for sp_, row in zip(speech, rows):
            if row['diff'] is not None and (row['diff'] < M.LOCAL_DUCK_TRIGGER_DB - 1e-9 or
                                            (sp_['piece'] in needs and row['diff'] < M.LOCAL_DUCK_TO_DB - 0.05)):
                add[sp_['piece']] = max(add.get(sp_['piece'], 0.0), M.LOCAL_DUCK_TO_DB - row['diff'] + 0.02)
        duck_iters.append({'iter': it, 'below': {k: r(x, 2) for k, x in add.items()}})
        if not add:
            break
        for pid, d in add.items():
            sp_ = next(x for x in speech if x['piece'] == pid)
            prev = needs.get(pid, (0, 0, 0.0))[2]
            needs[pid] = (sp_['start'], sp_['end'], prev + d)
        t_d, g_d, duck_spans = M.local_duck_curve(needs)
        music = M.apply_gain_curve(music0, t_d, g_d)
        nat = M.apply_gain_curve(nat0, t_d, g_d)
        bg = music + nat + room + tone
        sob, rows = M.speech_over_bed(v_pow, M.kpower(bg), speech)
        log('yerel yatak kısması', {k: round(x[2], 2) for k, x in needs.items()})
    del music0, nat0
    # --- karışım, sınırlayıcı, kodlama
    mix_raw = bg + voice[:, None] * np.float32(M.STEREO_SPEECH_GAIN)
    no = cfg['no']
    name = 'ders%d-%d' % (no, minutes)
    mp3 = '%s/%s.mp3' % (OUTD, name)
    kb = MP3_KBPS[minutes]
    lo_t, hi_t = cfg['lufs_target'] - 1.0, cfg['lufs_target'] + 1.0
    trim = 0.0
    trims = []
    for tr_it in range(3):
        mix0 = mix_raw * np.float32(10 ** (trim / 20)) if trim else mix_raw
        tp_raw = M.true_peak(mix0)
        lim_tries = []
        for ceil in M.TP_CEIL_PRE:
            mix, lim = M.tp_limit_stereo(mix0, ceil)
            tp_pre = M.true_peak(mix)
            enc = encode_mp3(mix, mp3, kb, T)
            dec, dsr = sf.read(mp3, dtype='float64', always_2d=True)
            if dsr != SR:
                raise SystemExit('MP3 örnekleme hızı %d' % dsr)
            tp_dec = M.true_peak(dec)
            lim_tries.append({'ceiling_dbtp': ceil, 'limiter': lim, 'tp_float_after_limiter': r(tp_pre, 2), 'tp_mp3': r(tp_dec, 2)})
            log('kodlama', name, 'kısma %.2f dB, TP ham %.2f, sınırlayıcı %s, MP3 TP %.2f' % (trim, tp_raw, lim, tp_dec))
            if tp_dec <= -1.0 or ceil == M.TP_CEIL_PRE[-1]:
                break
        lag0 = M.mp3_lag(dec, mix)
        integ0 = M.integrated(dec[lag0:lag0 + T * SR])
        trims.append({'trim_db': r(trim, 2), 'integrated_lufs': r(integ0, 2)})
        if lo_t <= integ0 <= hi_t:
            break
        # VARSAYIM: bütünleşik yükseklik penceresi (SPEC.v3 §8.6) konuşma yoğunluğundan taşarsa bütün dosya tek bir
        # sabit kazançla pencerenin 0,3 dB içine alınır; konuşma/yatak oranı ve evre düzenleri değişmez; kulak listesine girer
        goal = (hi_t - 0.3) if integ0 > hi_t else (lo_t + 0.3)
        trim += goal - integ0
    del mix0, mix_raw
    master = '%s/d%02d-%02ddk-hoc-A.wav' % (MASTER, no, minutes)
    sf.write(master, mix, SR, subtype='FLOAT')
    # --- ölçümler
    edits = []
    for p_ in arr['placements'] + (arr['imge'] or []):
        edits += [p_['t0'], p_['t1']]
    for x_ in xfi + ixfi:
        edits += [x_['t0'], x_['t1']]
    for e_ in nature_ev + room_ev:
        edits += [e_['t0'], e_['t1']]
    for s_ in speech:
        edits += [s_['start'], s_['end']]
    edits += [x_['t'] for x_ in tone_ev] + [0.0, M.OPEN_FADE, T - M.END_FADE, float(T)]
    v_hf, v_fb = M.hf_frames(voice * np.float32(M.STEREO_SPEECH_GAIN))
    b_hf, b_fb = M.hf_frames(bg)
    clicks_pre = M.detect_clicks_mix(mix, edits, speech, v_hf, b_hf)
    lag = M.mp3_lag(dec, mix)
    clicks_mp3 = M.detect_clicks_mix(dec[lag:lag + T * SR], edits, speech, v_hf, b_hf)
    pos = verify_positions(speech, dec, lag)
    bgp = M.kpower(bg)
    dur_dec = (len(dec) - lag) / dsr
    integ = M.integrated(dec[lag:lag + T * SR])
    rise = M.rise_rates(M.kpower(bg - tone), speech, 'yatak, tınısız')
    im_env = M.apply_env(im, tt, env_i)
    if duck_spans:
        im_env = M.apply_gain_curve(im_env, t_d, g_d)
    rise_ex = rise_after_open(M.kpower(bg - tone - im_env), speech, M.OPEN_FADE + 3.0)
    rise_im = rise_after_open(M.kpower(bg - tone), speech, M.OPEN_FADE + 3.0)
    rise_all = M.rise_rates(bgp, speech, 'yatak (müzik + doğa + oda + tını)')
    screen_eq = all(audio.compare_text(s['plan_text'], s['spoken_text'])[0] for s in speech)
    order_ok = [s['plan_text'] for s in speech] == [sub['text'] for ev in p['events'] for sub in ev['subs']]
    ds = M.digital_silence(dec[lag:lag + T * SR])
    sob_all_ok = all(sob[ph]['n_below_15_all'] == 0 for ph in PH)
    crit = {
        'sure_hedef_pm1s': bool(abs(dur_dec - T) <= 1.0),
        'olay_sirasi_plan_ile_ayni': bool(order_ok),
        'parca_konumu_mp3': pos['pass'],
        'kurgu_noktasi_tik_yok_float': len(clicks_pre['edit_point']) == 0,
        'kurgu_noktasi_tik_yok_mp3': len(clicks_mp3['edit_point']) == 0,
        'karisim_kaynakli_tik_yok_mp3': len(clicks_mp3['mix_only']) == 0,
        'dijital_sessizlik_100ms_yok': ds['runs_over_100ms'] == 0,
        'konusma_yatak_ge15_her_parca': bool(sob_all_ok),
        'yatak_yukselisi_le_1dB_s': bool((rise_ex['max_rise_db_per_s'] or 0) <= 1.0 + 1e-9),
        'gercek_tepe_le_m1': bool(tp_dec <= -1.0),
        'butunlesik_yukseklik': bool(lo_t <= integ <= hi_t),
        'ekran_esit_soylenen': bool(screen_eq),
        'boyut_le_15MB': bool(enc['bytes'] <= MAX_BYTES),
        'mp3_44k1_stereo': bool(dsr == SR and dec.shape[1] == 2),
    }
    ok = all(crit.values())
    rep = {'name': name, 'lesson': les, 'minutes': minutes, 'T': T, 'generated_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
           'tool': 'render/tools/mixib.py (mix.py fonksiyonları)', 'file': os.path.basename(mp3), 'bytes': enc['bytes'],
           'encoding': enc, 'mp3_decoder_offset_samples': lag, 'duration_decoded_s': r(dur_dec, 3),
           'integrated_lufs': r(integ, 2), 'integrated_lufs_float': r(M.integrated(mix), 2), 'lufs_target': cfg['lufs_target'],
           'true_peak_dbtp_mp3': r(tp_dec, 2), 'true_peak_dbtp_float': r(tp_pre, 2), 'true_peak_before_limiter': r(tp_raw, 2),
           'tp_limiter': lim_tries, 'master_trim_db': r(trim, 2), 'master_trim_iterations': trims,
           'position_check': pos, 'clicks_float': {k: len(x) for k, x in clicks_pre.items()},
           'clicks_mp3': {k: len(x) for k, x in clicks_mp3.items()},
           'clicks_list': {'float_edit_point': clicks_pre['edit_point'], 'mp3_edit_point': clicks_mp3['edit_point'],
                           'mp3_mix_only': clicks_mp3['mix_only'], 'mp3_bed_content': clicks_mp3['bed_content']},
           'digital_silence_mp3': ds, 'speech_over_bed': sob, 'speech_over_bed_iterations': iters,
           'local_duck': {'spans': duck_spans, 'iterations': duck_iters}, 'loudness_rise': {'criterion': 'yatak zarfı: tınısız ve imge katmanısız yatak, açılış kararmasından sonra, konuşma altı dahil '
                                          'bütün dosyada ≤ 1 dB/sn (imge katmanının nota başlangıçları SPEC.v3 §7.2 ile ayrı '
                                          'sınırlanır; aşağıda imge dahil değer ayrıca)',
                             'bed_envelope_no_tone_no_imge': rise_ex, 'bed_without_tone_with_imge_after_open_fade': rise_im, 'bed_without_tone': rise, 'bed_all': rise_all},
           'plan': {k: pj[k] for k in ('status', 'mode', 'f', 'total', 'speech_sec', 'check_plan', 'slack_min_s')},
           'music': {'placements': [{'role': p_['role'], 'file': os.path.basename(p_['src']['file']), 't0': r(p_['t0'], 3),
                                     't1': r(p_['t1'], 3), 'off': r(p_['off'], 3), 'gain_db': r(sg['gain_db'], 2)}
                                    for p_, sg in zip(arr['placements'], segs)],
                     'imge': [{'file': os.path.basename(p_['src']['file']), 't0': r(p_['t0'], 3), 't1': r(p_['t1'], 3),
                               'off': r(p_['off'], 3)} for p_ in (arr['imge'] or [])],
                     'zitlik': zinfo, 'crossfades': xfi + ixfi, 'notes': arr['notes'], 'levels': {ph: r(base[ph] + off[ph], 2) for ph in PH}},
           'tone_events': tone_ev, 'windows': [{'t0': r(a_, 3), 't1': r(b_, 3)} for a_, b_, _ in windows],
           'criteria': crit, 'pass': ok, 'master_wav': os.path.relpath(master, R)}
    json.dump(rep, open('%s/%s.json' % (REP, tag), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    # --- zaman çizelgesi (nefona.yoga.timeline/2 + pilot alanları)
    tl = timeline(cfg, L, T, minutes, p, pj, speech, vis, dawn_start, arr, zinfo, segs, xfi, ixfi, tone_ev, duck_spans,
                  windows, nature_ev, room_ev, base, off, PH, vgain, mp3, enc, lag, rep, lib)
    json.dump(tl, open('%s/%s.timeline.json' % (OUTD, name), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    log(name, 'GEÇTİ' if ok else 'KALDI', {k: v for k, v in crit.items() if not v}, 'I %.2f TP %.2f süre %.3f bayt %d' % (
        integ, tp_dec, dur_dec, enc['bytes']))
    return 0 if ok else 4


def timeline(cfg, L, T, minutes, p, pj, speech, vis, dawn_start, arr, zinfo, segs, xfi, ixfi, tone_ev, duck_spans,
             windows, nature_ev, room_ev, base, off, PH, vgain, mp3, enc, lag, rep, lib):
    blocks = []
    for ev in p['events']:
        if not blocks or blocks[-1]['id'] != ev['block']:
            bt = next((b.get('title') for b in L['blocks'] if b['id'] == ev['block']), None)
            blocks.append({'id': ev['block'], 'title': bt, 'start': r(ev['start'], 3), 'end': r(ev['end'], 3)})
        else:
            blocks[-1]['end'] = r(ev['end'], 3)
    don = next(ev for ev in p['events'] if ev['clip']['id'] == 'k.donus')
    k_i = p['events'].index(don)
    prev_end = p['events'][k_i - 1]['subs'][-1]['end'] if k_i else 0.0
    tone_at = next((x['t'] for x in tone_ev if x['before_clip'] == 'k.donus'), None)
    jump = max(prev_end + 0.5, (tone_at if tone_at is not None else don['start']) - 6.0)
    release = {}
    ct = cue_times(p)
    if arr['imge']:
        release['C4'] = {'activeFrom': r(ct['layer:imge'][0][0], 3), 'activeUntil': r(ct['layer:imge-off'][0][0], 3),
                         'prefixFile': 'yoga-d%02d-birak-imge.m4a' % cfg['no']}
    if zinfo:
        release['C3'] = {'activeFrom': r(ct['layer:zitlik'][0][0], 3),
                         'activeUntil': r(next(ev['start'] for ev in p['events'] if ev['clip']['id'] == 'c3.birak'), 3),
                         'prefixFile': 'yoga-d%02d-birak-zitlik.m4a' % cfg['no']}
    gen = {'Varış açılışı': 'yatak/Varış', 'Varış-Derinleşme ailesi': 'yatak/Varış-Derinleşme', 'Derin ailesi': 'yatak/Derin',
           'Kapanış': 'yatak/Kapanış', 'Zıtlık dokusu': 'yatak/Zıtlık'}
    mus_ev, cnt = [], {}
    for p_ in arr['placements']:
        cnt[p_['role']] = cnt.get(p_['role'], 0) + 1
        mus_ev.append({'layer': 'bed', 'label': '%s-%d' % (gen[p_['role']], cnt[p_['role']]), 't0': r(p_['t0'], 3), 't1': r(p_['t1'], 3)})
    for x_ in xfi:
        mus_ev.append({'layer': 'bed', 'event': 'crossfade', 't0': x_['t0'], 't1': x_['t1'], 'law': 'equal-power'})
    if arr['imge']:
        for i, p_ in enumerate(arr['imge']):
            mus_ev.append({'layer': 'imge', 'label': 'imge-%d' % (i + 1), 't0': r(p_['t0'], 3), 't1': r(p_['t1'], 3)})
        mus_ev.append({'layer': 'imge', 'event': 'fade-in', 't0': r(arr['imge'][0]['t0'], 3), 't1': r(arr['imge'][0]['t0'] + XF, 3)})
        mus_ev.append({'layer': 'imge', 'event': 'fade-out', 't0': r(arr['imge'][-1]['t1'] - XF, 3), 't1': r(arr['imge'][-1]['t1'], 3)})
        for x_ in ixfi:
            mus_ev.append({'layer': 'imge', 'event': 'crossfade', 't0': x_['t0'], 't1': x_['t1'], 'law': 'equal-power'})
    if zinfo:
        mus_ev.append({'layer': 'bed', 'event': 'zitlik', 't0': r(zinfo['t0'], 3), 't1': r(zinfo['t1'], 3)})
    for x_ in tone_ev:
        mus_ev.append({'layer': 'tone', 'event': 'returnTone', **x_})
    for d_ in duck_spans:
        mus_ev.append({'layer': 'music+imge+nature', 'event': 'local-duck', 't0': d_['t0'], 't1': d_['t1'],
                       'db': -d_['depth_db'], 'flat': d_['flat'], 'piece': d_['piece']})
    for (a_, b_, n_) in windows:
        mus_ev.append({'layer': 'bed', 'event': 'window-swell', 't0': r(a_, 3), 't1': r(n_, 3), 'db': M.SWELL_DB,
                       'rampUpSec': M.SWELL['rampUpSec'], 'rampDownSec': M.SWELL['rampDownSec'],
                       'downLeadSec': M.SWELL['downLeadSec']})
    mus_ev.append({'layer': 'all', 'event': 'open-fade', 't0': 0.0, 't1': M.OPEN_FADE})
    mus_ev.append({'layer': 'music+nature', 'event': 'end-fade', 't0': T - M.END_FADE, 't1': float(T)})
    mus_ev.sort(key=lambda x: x.get('t0', x.get('t', 0)))
    flags = {uid: u['flags'] for uid, u in lib['units'].items()}
    win_list = []
    for i, ev in enumerate(p['events']):
        if ev['clip'].get('window'):
            nxt = p['events'][i + 1]['clip']['id'] if i + 1 < len(p['events']) else None
            win_list.append({'announce': ev['clip']['id'], 'start': r(ev['end'], 3), 'end': r(ev['end'] + ev['gap'], 3),
                             'welcome': nxt})
    sp_out = []
    for i, s in enumerate(speech):
        fl = sorted({f['flag'] for f in flags.get(s['unit'], []) if (not f.get('piece') or f.get('piece') == s['piece'])
                     and f['flag'] != 'kulak-sinirlayici'} | M.v3_flags(s, duck_spans))
        sp_out.append({'i': i, 'piece': s['piece'], 'clip': s['clip'], 'unit': s['unit'], 'block': s['block'],
                       'phase': s['phase'], 'start': r(s['start'], 3), 'end': r(s['end'], 3),
                       'screenText': s['plan_text'], 'spokenText': s['spoken_text'], 'voiceGainDb': r(s['voice_gain_db'], 2),
                       'resumeAt': r(s['resume_at'], 3), 'visualCue': s['visual_cue'], 'visualState': s['visual_state'],
                       'screen_text': s['plan_text'], 'spoken_text': s['spoken_text'],
                       'screen_equals_spoken': bool(audio.compare_text(s['plan_text'], s['spoken_text'])[0]),
                       'voice_gain_db': r(s['voice_gain_db'], 2), 'visual_cue': s['visual_cue'], 'visual_state': s['visual_state'],
                       'flags': fl})
    tm = M.timing
    lesson_sha = hashlib.sha256(open(cfg['lesson_path'], 'rb').read()).hexdigest()
    planner_sha = hashlib.sha256(open(tm.__file__, 'rb').read()).hexdigest()
    dz = L['visual']['dawn']
    return {
        'schema': 'nefona.yoga.timeline/2', 'lesson': L['id'], 'lessonNo': cfg['no'], 'title': L.get('title'),
        'minutes': minutes, 'T': T, 'file': os.path.basename(mp3),
        'appFile': 'yoga-d%02d-%02ddk.m4a' % (cfg['no'], minutes),
        'audio': {'sha256': hashlib.sha256(open(mp3, 'rb').read()).hexdigest(), 'codec': 'mp3', 'bitrateKbps': MP3_KBPS[minutes],
                  'encoding': enc['mode'], 'sampleRate': SR, 'channels': 2, 'durationSec': float(T),
                  'decoderOffsetSamples': lag,
                  'note': 'tarayıcı önizlemesi (SPEC.v3 §10); uygulama dosyası AAC-LC m4a Mac\'te WAV ana kopyadan kodlanır (§14)'},
        'voice': dict(VOICE), 'music': {'source': 'A', 'family': cfg['music'].get('family'), 'scene': cfg['scene']},
        'plan': {'status': p['status'], 'mode': p['mode'], 'f': r(p['f'], 4), 'checkPlanPass': not pj['check_plan']['fails'],
                 'sel': p['sel'], 'planner': 'pilot/timing.py', 'plannerSha256': planner_sha, 'lessonSha256': lesson_sha,
                 'slackMinSec': pj['slack_min_s']},
        'blocks': blocks, 'speech': sp_out,
        'closing': {'jumpTo': r(jump, 3), 'returnToneAt': r(tone_at, 3) if tone_at is not None else None,
                    'firstWordAt': r(don['start'], 3)},
        'release': release, 'windows': win_list, 'visual': vis,
        'dawn': {'start': r(dawn_start, 3), 'spanSec': r(T - dawn_start, 2), 'rule': dz.get('startRule')},
        'music_events': mus_ev,
        'nature_events': [{'t0': e_['t0'], 't1': e_['t1'], 'label': e_['loop'].replace('.wav', ''), 'rotation_s': e_['rotation_s']}
                          for e_ in nature_ev],
        'room_tone_events': [{'t0': e_['t0'], 't1': e_['t1'], 'label': e_['loop'].replace('.wav', '')} for e_ in room_ev],
        'levels': {'speechClipLufs': -18.0, 'masterTrimDb': rep['master_trim_db'], 'musicTargetLufsByPhase': {ph: r(base[ph] + off[ph], 2) for ph in PH},
                   'natureBelowMusicDb': M.NATURE_BELOW_DB if cfg.get('nature') else None, 'imgeBelowBedDb': M.IMGE_BELOW_DB,
                   'roomToneDbfsRms': -58.0, 'voicePhaseGainDb': {k: v for k, v in L['voicePhaseGainDb'].items() if isinstance(v, (int, float))},
                   'voiceGainRamps': vgain['ramps']},
        'qa': {'pass': rep['pass'], 'report': '_rapor/%s-%02ddk.json' % (cfg['id'], minutes)},
    }


if __name__ == '__main__':
    les, mins = sys.argv[1], int(sys.argv[2])
    sys.exit(run(les, mins, plan_only='--plan-only' in sys.argv))
