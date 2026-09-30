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
import importlib
import json
import math
import os
import random
import re
import sys

import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfiltfilt

Y = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga'
R = Y + '/render'
sys.path.insert(0, R + '/tools')
import mix as M  # noqa: E402
import audio  # noqa: E402
sys.path.insert(0, R + '/music/synth')
import synth_ib as SY  # noqa: E402

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


def d01_config():
    return {
        'no': 1, 'id': 'd01', 'lesson_path': Y + '/b/ders1/ders1.lesson.json', 'planner': ('ders1', 'timing_d1'),
        'corner': (4.68, 'hi'), 'scene': None, 'release': [3, 5, 15],
        'selections': [R + '/sel/hoc/d01/selection-d01.json'],
        'arrange': 'd01', 'bed_rise_limit': 0.9, 'bed_rise_limit_after_duck': True,
        'music': {'varis': [{'file': MUS + '/el/d1-varis.wav', 'usable': (16.5, 162.0)}],
                  'kapanis': [{'file': MUS + '/el/d1-kapanis.keyD.wav', 'usable': (8.5, 152.0)}],
                  'family': 'Re'},
        'drone': {'bright': 0.45, 'amp_db': 0.4, 'seed': 1},
        'nature': None, 'tone': MUS + '/common/donus.synth-D5.wav', 'lufs_target': -18.0, 'end_fade': 5.0,
    }


def d03_config():
    return {
        'no': 3, 'id': 'd03', 'lesson_path': Y + '/b/ders3/ders3.lesson.json', 'planner': ('ders3', 'timing_d3'),
        'corner': (4.68, 'hi'), 'scene': None, 'release': [5, 15],
        'selections': [R + '/sel/hoc/d03/selection-d03.json'],
        'arrange': 'd03',
        'bed_rise_limit': 0.9, 'music': {}, 'extra_music': R + '/music/el/ib_d03.json', 'family': 'La♭',
        'nature': [MUS + '/el/yagmur-%d.wav' % i for i in (1, 2, 3, 4)], 'nature_image_boost_db': 1.5,
        'tone': None, 'lufs_target': -20.0, 'end_fade': 5.0,
    }


def d05_config():
    return {
        'no': 5, 'id': 'd05', 'lesson_path': Y + '/b/ders5/ders5.lesson.json', 'planner': ('ders5', 'timing_d5'),
        'corner': (4.68, 'hi'), 'scene': None, 'release': [3, 5, 15],
        'selections': [R + '/sel/hoc/d05/selection-d05.json'],
        'arrange': 'd05',
        'duck_tone': True, 'bed_rise_limit': 0.9, 'bed_rise_limit_after_duck': True, 'music': {'family': 'Sol (yerel sentez)'},
        'nature': None, 'tone': 'bell', 'lufs_target': -18.0, 'end_fade': 5.0,
        # VARSAYIM: pencerede yatak −6 dB; iniş 6 sn, çıkış 10 sn (6 dB / 6 sn tam 1 dB/sn sınırında), çıkış çandan önce biter
        'withdraw': {'db': -6.0, 'down': 6.0, 'up': 10.0, 'bell_lead': 2.0},
    }


CONFIGS = {'d01': d01_config, 'd02': d02_config, 'd03': d03_config, 'd05': d05_config}


def lesson_ctx(cfg):
    """Dersin planlayıcı bağlamı: (L, LP, check(p), rate, prof). Ders 1/3/5 kendi sarmalayıcısıyla (b/dersN/timing_dN.py:
    patch, [planner_view], check); sarmalayıcı pilot timing modülünü paylaşır (aynı sys.modules['timing'])."""
    tm = M.timing
    if cfg.get('planner'):
        d = Y + '/b/' + cfg['planner'][0]
        if d not in sys.path:
            sys.path.insert(0, d)
        W = importlib.import_module(cfg['planner'][1])
        if W.T is not tm:
            raise SystemExit('sarmalayıcı başka timing modülü yükledi')
        L = W.load()
        W.patch(L)
        LP = W.planner_view(L) if hasattr(W, 'planner_view') else L
        tm.DUR_SCALE = 1.0
        return L, LP, (lambda p: W.check(L, p)), cfg['corner'][0], cfg['corner'][1]
    L = tm.with_scene(tm.load(cfg['lesson_path']), cfg['scene']) if cfg['scene'] else tm.load(cfg['lesson_path'])
    return L, L, (lambda p: tm.check_plan(L, p)), 5.6, 'hi'


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
    cands += ([c['id'] + '.' + scene] if scene else []) + [c['id']]
    for uid in cands:
        u = lib['units'].get(uid)
        if not u:
            continue
        ps = [p for p in u['pieces'] if not p['piece_id'].endswith('#_pre')]
        if len(ps) == len(subs) and all(p['text'] == t for p, t in zip(ps, subs)):
            return ps
    return None


# ================================================================================================ plan
def measured_plan(cfg, ctx, T, lib):
    L, LP, check, rate, prof = ctx
    tm = M.timing
    orig = tm.sub_durs
    missing = []

    def sd(c, rate_, prof_):
        ps = resolve(lib, c, cfg['scene'])
        if ps is None:
            if c['id'] not in missing:
                missing.append(c['id'])
            return orig(c, rate_, prof_)
        return [p['dur'] for p in ps]

    tm.sub_durs = sd
    tm._SUB_CACHE.clear()
    try:
        p = tm.plan(LP, T, rate, prof)
        fails, dens, runs = check(p)
    finally:
        tm.sub_durs = orig
    miss_ev = sorted({ev['clip']['id'] for ev in p['events'] if ev['clip']['id'] in missing})
    return p, fails, dens, runs, miss_ev


# ================================================================================================ konuşma izi
def clip_gain_fn(L):
    """Klibin ses kazancı (dB): evre kazancı; Ders 3'te uyku izninden sonraki kademeler (voicePhaseGainDb.sleepSteps)."""
    PG = {k: float(x) for k, x in L['voicePhaseGainDb'].items() if isinstance(x, (int, float))}
    steps = {k: float(x) for k, x in (L['voicePhaseGainDb'].get('sleepSteps') or {}).items() if isinstance(x, (int, float))}

    def g(c):
        return steps.get(c['id'], PG[c['phase']])
    return g


def voice_track(cfg, L, T, plan, lib):
    N = T * SR
    v = np.zeros(N, dtype=np.float32)
    evs = plan['events']
    gain_of = clip_gain_fn(L)
    pts_t, pts_g = [0.0], [gain_of(evs[0]['clip'])]
    ramps = []
    for i, ev in enumerate(evs):
        g = gain_of(ev['clip'])
        g0 = gain_of(evs[i - 1]['clip']) if i else g
        if i and g != g0:
            a = evs[i - 1]['subs'][-1]['end']
            b = ev['subs'][0]['start']
            pts_t += [a, b]
            pts_g += [g0, g]
            ramps.append({'from': evs[i - 1]['clip']['id'], 'to': ev['clip']['id'], 't0': r(a, 3), 't1': r(b, 3),
                          'sec': r(b - a, 3), 'db_from': g0, 'db_to': g,
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


def rise_limit_gain(x, lim, t_min, iters=8, shift=1.5):
    """VARSAYIM (Ders 3): pilot yatak EQ'su (bed_eq) kaynağın tınısını değiştirdiği için ham kaynakta yapılan yavaş
    dengeleme karışımdaki yatağa birebir geçmiyor. Yatak (müzik + doğa + oda) 3 sn ST yüksekliğinin 1 sn'deki artışı
    lim dB/sn'yi aşarsa yalnız artış kısılır: ST eğrisi (pencere merkezi > t_min + 1,5 sn; açılış kararmasına
    dokunulmaz) ileriye doğru en çok lim dB/sn yükselecek biçimde sınırlanır, fark kazanç olarak pencerenin ön kenarına
    (merkez + shift sn) uygulanır (≤ 0 dB; düşüşlere ve düzeye dokunulmaz); ölçü yinelenerek yakınsatılır.
    Dönüş: (örnek başına kazanç, bilgi)."""
    N = len(x)
    gsum = None
    tc = None
    y = x
    hist = []
    c0 = t_min + 1.5
    best = None                                  # (ölçülen en büyük artış, o ölçümün kazancı): yalnız ölçülmüş kazanç döner
    for it in range(iters + 1):
        tc, st = M.st_curve(M.kpower(y), 3.0, 0.1)
        d = st[10:] - st[:-10]
        ok = np.isfinite(d) & (st[:-10] > -80) & (tc[:-10] >= c0)
        mx = float(np.max(d[ok]))
        hist.append(r(mx, 3))
        if best is None or mx < best[0]:
            best = (mx, None if gsum is None else gsum.copy())
        if mx <= lim + 0.02 or it == iters:
            break
        tgt = st.copy()
        step = lim * 0.1
        for i in range(1, len(tgt)):
            if tc[i] > c0 and tgt[i] > tgt[i - 1] + step:
                tgt[i] = tgt[i - 1] + step
        add = np.minimum(tgt - st, 0.0)
        gsum = add if gsum is None else gsum + add
        g = 10 ** (np.interp(np.arange(N) / SR, tc + shift, gsum, left=0.0, right=gsum[-1]) / 20)
        y = x * g.astype(np.float32)[:, None]
    gsum = best[1]
    if gsum is None:
        return np.ones(N, dtype=np.float32), {'applied': False, 'max_rise_iter': hist}
    g = (10 ** (np.interp(np.arange(N) / SR, tc + shift, gsum, left=0.0, right=gsum[-1]) / 20)).astype(np.float32)
    red = gsum < -0.05
    spans = []
    if red.any():
        dd = np.diff(np.concatenate([[0], red.astype(np.int8), [0]]))
        for a, b in zip(np.where(dd == 1)[0], np.where(dd == -1)[0]):
            spans.append([r(tc[a] + shift, 1), r(tc[b - 1] + shift, 1), r(float(gsum[a:b].min()), 2)])
    return g, {'applied': True, 'limit_db_per_s': lim, 'shift_s': shift, 'max_rise_iter': hist, 'chosen_max_rise': r(best[0], 3),
               'max_reduction_db': r(float(gsum.min()), 2), 'spans_s_db': spans}


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


# ================================================================================================ ders 1 / 3 / 5 düzenleri
TMP = R + '/out/ilk-bolum/_tmp'


def cue_find(plan, prefix):
    """Müzik ipucu belirteci prefix ile başlayan olayların (başlangıç, klip) listesi (belirteçler ';' ile ayrılır)."""
    out = []
    for ev in plan['events']:
        mu = (ev['clip'].get('cue') or {}).get('music') or ''
        for tok in [x.strip() for x in mu.split(';') if x.strip()]:
            if tok.startswith(prefix):
                out.append((ev['start'], ev['clip']['id'], tok))
    return out


def block_starts(plan):
    b = {}
    for ev in plan['events']:
        b.setdefault(ev['block'], ev['start'])
    return b


def array_src(arr, name):
    os.makedirs(TMP, exist_ok=True)
    f = '%s/%s.wav' % (TMP, name)
    sf.write(f, arr, SR, subtype='FLOAT')
    return {'file': f, 'usable': (0.0, len(arr) / SR), 'synth': name}


def arrange_d01(cfg, plan, speech, T, L):
    """Ders 1: Varış pad'i (ElevenLabs, Re) → nefes bordunu (yerel sentez, nefes döngüsüne kilitli) → Kapanış pad'i."""
    bs = block_starts(plan)
    t_c1 = bs['C1']
    t_k = bs['K']
    notes = []
    cyc = L['breathCycles']
    grid = []
    order = [b for b in ('C1', 'C2', 'C3') if b in bs]
    for i, b in enumerate(order):
        a0 = (t_c1 - XF) if i == 0 else bs[b]
        a1 = bs[order[i + 1]] if i + 1 < len(order) else t_k + XF
        P = float(cyc[b]['periodSec'])
        ins = float(cyc[b]['in']) + float(cyc[b].get('topUp') or 0.0)
        al = [ev['start'] for ev in plan['events'] if ev['block'] == b and (ev['clip'].get('tags') or {}).get('role') == 'al']
        anc = al[0] if al else bs[b]
        grid.append((a0, a1, anc, P, ins))
        notes.append('bordun %s: periyot %.3f sn, alış %.2f sn, çapa %.3f sn (%s)' % (b, P, ins, anc, 'ilk "Al…"' if al else 'blok başı'))
    d = cfg['drone']
    arr, info = SY.drone_d01(T, grid, t_c1 - 1.0, t_k + XF + 1.0, seed=d['seed'], bright=d['bright'], amp_db=d['amp_db'])
    src = array_src(arr, 'd01-%02d-bordun' % (T // 60))
    V = cfg['music']['varis'][0]
    K = cfg['music']['kapanis'][0]
    o_v = max(0.0, V['usable'][0] - M.OPEN_FADE)
    if o_v + t_c1 + XF > min(flen(V['file']), V['usable'][1] + XF):
        raise SystemExit('Varış pad\'i kısa')
    lenK = flen(K['file'])
    o_k = t_k - (T - lenK)
    if o_k < 0:
        raise SystemExit('Kapanış pad\'i kısa')
    pl = [{'src': V, 't0': 0.0, 't1': t_c1 + XF, 'off': o_v, 'role': 'Varış açılışı'},
          {'src': src, 't0': t_c1, 't1': t_k + XF, 'off': t_c1, 'role': 'Bordun'},
          {'src': K, 't0': t_k, 't1': float(T), 'off': o_k, 'role': 'Kapanış'}]
    return {'placements': pl, 'imge': None, 'zitlik': None, 'notes': notes, 'synth': {'bordun': info},
            'xfades': [{'what': 'Varış → bordun', 'start': r(t_c1, 3), 'speech_cover': r(M.speech_cover(speech, t_c1, t_c1 + XF), 2)},
                       {'what': 'bordun → Kapanış', 'start': r(t_k, 3), 'speech_cover': r(M.speech_cover(speech, t_k, t_k + XF), 2)}],
            'times': {'img_on': None, 'img_off': None}}


def arrange_d05(cfg, plan, speech, T, L):
    """Ders 5: Sol'de tek, kesintisiz sentez ton; evre dokuları kısmi seslerin ≥ 10 sn'lik geçişleriyle (tek yerleşim)."""
    bs = block_starts(plan)
    ch = cue_find(plan, 'chord')
    cues = {'c1': bs.get('C1'), 'c2': bs.get('C2'), 'derin': bs.get('C3'), 'kapanis': bs.get('K'),
            'chord': ch[0][0] if ch else None}
    arr, info = SY.tone_bed_d05(T, cues)
    src = array_src(arr, 'd05-%02d-ton' % (T // 60))
    pl = [{'src': src, 't0': 0.0, 't1': float(T), 'off': 0.0, 'role': 'Ton'}]
    return {'placements': pl, 'imge': None, 'zitlik': None, 'notes': ['ton ipuçları: %s' % {k: (r(v, 2) if v else None) for k, v in cues.items()}],
            'synth': {'ton': {k: v for k, v in info.items()}}, 'xfades': [], 'times': {'img_on': None, 'img_off': None}}


def arrange_d03(cfg, plan, speech, T, L):
    """Ders 3: La♭ ailesi: Varış → çekirdek (C1–C2) → Derin (C4, C3) → uyku (yalnız pad); imge katmanı (keçe piyano)
    c3.sahne'den uykuya kadar; yağmur doğa katmanı baştan sona."""
    mus = cfg['music']
    pb = phase_first(plan)
    bs = block_starts(plan)
    blocks = sorted(set(bs.values()))
    notes = []
    t_n1 = pb['Derinleşme'][0]
    t_d = pb['Derin'][0]
    t_u = bs['K']
    O = mus['varis'][0]
    o_v = max(0.0, O['usable'][0] - M.OPEN_FADE)
    if o_v + t_n1 + XF > min(flen(O['file']), O['usable'][1] + XF):
        raise SystemExit('Varış pad\'i kısa')
    pl = [{'src': O, 't0': 0.0, 't1': t_n1 + XF, 'off': o_v, 'role': 'Varış açılışı'}]
    pl += chain(mus['cekirdek'], t_n1, t_d + XF, 'Varış-Derinleşme ailesi', speech, blocks, notes)
    pl += chain(mus['derin'], t_d, t_u + XF, 'Derin ailesi', speech, blocks, notes)
    U = mus['uyku'][0]
    o_u = max(0.0, U['usable'][0] - XF)
    if o_u + (T - t_u) > flen(U['file']) + 1e-6:
        raise SystemExit('uyku pad\'i kısa')
    pl.append({'src': U, 't0': t_u, 't1': float(T), 'off': o_u, 'role': 'Uyku'})
    im = cue_find(plan, 'layer:imge')
    imge = None
    if im:
        t_on = im[0][0]
        imge = chain(mus['imge'], t_on, t_u + XF, 'İmge katmanı', speech, blocks, notes, first_off=0.0)
    return {'placements': pl, 'imge': imge, 'zitlik': None, 'notes': notes, 'synth': None,
            'xfades': [{'what': 'Varış → çekirdek', 'start': r(t_n1, 3), 'speech_cover': r(M.speech_cover(speech, t_n1, t_n1 + XF), 2)},
                       {'what': 'çekirdek → Derin', 'start': r(t_d, 3), 'speech_cover': r(M.speech_cover(speech, t_d, t_d + XF), 2)},
                       {'what': 'Derin → uyku', 'start': r(t_u, 3), 'speech_cover': r(M.speech_cover(speech, t_u, t_u + XF), 2)}],
            'times': {'img_on': imge[0]['t0'] if imge else None, 'img_off': (imge[-1]['t1'] - XF) if imge else None}}


def level_env(plan, T, levels, img_on, img_off, windows, what, extra=None, boost=None):
    """Evre hedefi (LUFS) zarfı, 100 Hz; mix.level_envelope ile aynı kurallar, derste bulunan evrelerle:
    alçalan düzey yeni evrenin ilk sözünden önceki sessizlikte (en çok 8 sn), yükselen ilk sözle başlayıp 8 sn'de biter.
    'bed': imge katmanı açıkken toplam hedefte kalsın diye −c dB. windows: (w0, w1, sonraki, tür, param);
    tür 'swell' (+dB, pilot) ya da 'withdraw' (−dB, Ders 5). extra: (t, dB) noktaları (uyku kademeleri);
    boost: (t0, t1, dB) doğa katmanı imge eşlemesi."""
    fs = 100
    t = np.arange(T * fs + 1) / fs
    evs = plan['events']
    order, first = [], {}
    for i, ev in enumerate(evs):
        ph = ev['clip']['phase']
        if ph not in first and ph in levels:
            first[ph] = i
            order.append(ph)
    env = np.full(len(t), levels[order[0]])
    ramps = []
    for a_ph, b_ph in zip(order, order[1:]):
        i = first[b_ph]
        tb = evs[i]['start']
        prev_end = evs[i - 1]['subs'][-1]['end']
        la, lb = levels[a_ph], levels[b_ph]
        if lb < la:
            d = min(XF, tb - prev_end)
            r0, r1 = tb - d, tb
        else:
            r0, r1 = tb, tb + XF
        env[t >= r1] = lb
        mr = (t >= r0) & (t < r1)
        env[mr] = la + (lb - la) * (t[mr] - r0) / (r1 - r0)
        ramps.append({'from': a_ph, 'to': b_ph, 't0': r(r0, 3), 't1': r(r1, 3), 'db_from': r(la, 2), 'db_to': r(lb, 2),
                      'db_per_s': r(abs(lb - la) / (r1 - r0), 3)})
    if what == 'bed' and img_on is not None and img_on < T:
        c = 10 * math.log10(1 + 10 ** (-M.IMGE_BELOW_DB / 10))
        m = (t >= img_on) & (t <= img_off + XF)
        u = np.clip(np.minimum((t - img_on) / XF, (img_off + XF - t) / XF), 0, 1)
        env[m] -= c * u[m]
    for (w0, w1, nxt, kind, prm) in windows:
        if kind == 'swell':
            up0, up1 = w0, w0 + prm['rampUpSec']
            dn1 = nxt - prm['downLeadSec']
            dn0 = dn1 - prm['rampDownSec']
            env += np.interp(t, [up0, up1, dn0, dn1], [0, prm['db'], prm['db'], 0], left=0, right=0)
        else:
            end = nxt - prm['bell_lead']
            down, up, dbw = prm['down'], prm['up'], prm['db']
            span = end - w0
            if span < down + up:
                k = span / (down + up)
                down, up, dbw = down * k, up * k, dbw * k
            env += np.interp(t, [w0, w0 + down, end - up, end], [0, dbw, dbw, 0], left=0, right=0)
    if extra:
        et = [0.0] + [x[0] for x in extra] + [float(T)]
        ed = [0.0] + [x[1] for x in extra] + [extra[-1][1] if extra else 0.0]
        env += np.interp(t, et, ed)
    if boost:
        b0, b1, db = boost
        env += np.interp(t, [b0, b0 + XF, b1 - XF, b1], [0, db, db, 0], left=0, right=0)
    return t, env, ramps


def bed_extra_points(plan, L):
    """Uyku kademeleri (sleepSteps): yatak konuşmayla aynı ölçüde iner; rampa ilgili klipten önceki sessizlikte."""
    PG = {k: float(x) for k, x in L['voicePhaseGainDb'].items() if isinstance(x, (int, float))}
    gain_of = clip_gain_fn(L)
    evs = plan['events']
    pts = []
    prev = 0.0
    for i, ev in enumerate(evs):
        e = gain_of(ev['clip']) - PG[ev['clip']['phase']]
        if i and abs(e - prev) > 1e-9:
            a = evs[i - 1]['subs'][-1]['end']
            b = ev['subs'][0]['start']
            pts += [(a, prev), (b, e)]
        prev = e
    return pts


# ================================================================================================ görsel ve zaman çizelgesi
def closing_event(L, plan):
    """Kapanışa geç hedefi: dersin hızlı kapanış dizisinin planda bulunan ilk klibi (Ders 1, 2, 5 k.donus; Ders 3 k.anahtar3)."""
    ids = [c['id'] for c in ((L.get('extras') or {}).get('quickClosing') or {}).get('clips', [])] or ['k.donus']
    for cid in ids:
        for ev in plan['events']:
            if ev['clip']['id'] == cid:
                return ev
    return next(ev for ev in plan['events'] if ev['block'] in ('K',))


def visual_timeline(L, T, plan, speech):
    vis = []
    state = {'phase': None, 'image': 'off', 'dawn': False}
    don = closing_event(L, plan)
    dz = L['visual'].get('dawn')
    if dz:
        span = dz.get('spanSecBelow240') if (T < 240 and dz.get('spanSecBelow240')) else dz.get('spanSec', [60, 90])
        span = span[1] if isinstance(span, list) else span
        dawn_start = max(don['start'], T - float(span))
        vis.append({'t': r(dawn_start, 3), 'cue': 'dawn:start', 'rule': dz.get('startRule'), 'span_s': r(T - dawn_start, 2)})
    else:
        dawn_start = float(T) + 1.0
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
def nature_source_events(files):
    """Doğa döngü dosyalarındaki 10 kHz üstü ani olayların kare indisleri (mix.click_events ölçütü, 2 ms kare)."""
    out = {}
    for f_ in files:
        xs, _sr = sf.read(f_, dtype='float64', always_2d=True)
        hs, fs_ = M.hf_frames(xs)
        out[os.path.basename(f_)] = (np.array(M.click_events(hs, fs_)), len(xs) / SR)
    return out


def nature_source_hit(t_, nature_ev, src_ev):
    """t_ anında en yüksek kazançla çalan doğa döngüsünün kaynak konumunun ±5 ms'inde kaynakta olay var mı."""
    nxf = M.NATURE_XF
    fr = int(round(0.002 * SR))
    best, bw = None, -1.0
    for e_ in nature_ev:
        if e_['t0'] - 1e-6 <= t_ <= e_['t1'] + 1e-6:
            u_in = (t_ - e_['t0']) / nxf if e_ is not nature_ev[0] else 1.0
            u_out = (e_['t1'] - t_) / nxf
            w_ = min(1.0, max(0.0, u_in), max(0.0, u_out))
            if w_ > bw:
                best, bw = e_, w_
    if best is None:
        return False, None
    evs_, Lf = src_ev[best['loop']]
    pos = (best['rotation_s'] + (t_ - best['t0'])) % Lf
    k_ = pos / (fr / SR)
    hit = bool(len(evs_) and np.min(np.abs(evs_ - k_)) <= 2.5)
    return hit, {'loop': best['loop'], 'src_pos_s': r(pos, 3), 'weight': r(bw, 2)}


def add_xing(data):
    """lameenc akış kipinde Xing/Info başlığı yazmıyor: ABR dosyada çözücüler süreyi ilk çerçevenin bit hızından tahmin
    ediyor (ders2-15.mp3 başlıkta 1058 sn gösterdi, ders5-15.mp3'ü libsndfile 888,86 sn'de bıraktı; gerçek 900 sn).
    Ses çerçevelerine dokunmadan başa tek bir Xing çerçevesi eklenir: çerçeve sayısı, bayt sayısı, 100 noktalı arama
    tablosu (TOC). MPEG-1 Layer III, 44,1 kHz; Xing çerçevesi 128 kbit/sn (417 bayt), korumasız. Zaten varsa dokunulmaz."""
    import struct
    BR = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320]
    offs = []
    i = 0
    first_h = None
    while i + 4 <= len(data):
        h = struct.unpack('>I', data[i:i + 4])[0]
        if (h >> 21) & 0x7ff != 0x7ff or (h >> 19) & 3 != 3 or (h >> 17) & 3 != 1:
            raise SystemExit('MP3 çerçeve eşlemesi bozuk (bayt %d)' % i)
        br = BR[(h >> 12) & 0xf]
        if (h >> 10) & 3 != 0 or br == 0:
            raise SystemExit('beklenmeyen çerçeve (bayt %d)' % i)
        if first_h is None:
            first_h = h
            side = 17 if (h >> 6) & 3 == 3 else 32
            if data[i + 4 + side:i + 8 + side] in (b'Xing', b'Info'):
                return data
        offs.append(i)
        i += 144000 * br // 44100 + ((h >> 9) & 1)
    if i != len(data):
        raise SystemExit('MP3 sonu çerçeve sınırında değil')
    n = len(offs)
    side = 17 if (first_h >> 6) & 3 == 3 else 32
    hdr = (first_h & ~((0xf << 12) | (1 << 9) | (1 << 16))) | (9 << 12) | (1 << 16)   # 128 kbit/sn, dolgu yok, CRC yok
    size = 144000 * 128 // 44100
    total = len(data) + size
    toc = bytes(min(255, int(256.0 * (size + offs[min(n - 1, int(k * n / 100))]) / total)) for k in range(100))
    body = struct.pack('>I', hdr) + bytes(side) + b'Xing' + struct.pack('>III', 0x0F, n, total) + toc + struct.pack('>I', 0)
    return body + bytes(size - len(body)) + data


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
    data = add_xing(bytes(data))
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
    ctx = lesson_ctx(cfg)
    L = ctx[0]
    lib = load_library(cfg)
    extra = cfg.get('extra_music')
    if extra and os.path.exists(extra):
        for role, lst in json.load(open(extra)).items():
            if role.startswith('_'):
                continue
            cfg['music'][role] = cfg['music'].get(role, []) + [{'file': x['file'], 'usable': tuple(x['usable'])} for x in lst]
    tag = '%s-%02ddk' % (les, minutes)
    log('plan', tag)
    p, fails, dens, runs, miss = measured_plan(cfg, ctx, T, lib)
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
        if cfg['tone'] == 'bell':
            tx = SY.bell().astype(np.float64)
            tname = 'çan (yerel sentez, Sol5)'
        else:
            tx, _ = sf.read(cfg['tone'], dtype='float64', always_2d=True)
            tname = os.path.basename(cfg['tone'])
        if tx.shape[1] == 1:
            tx = np.repeat(tx, 2, axis=1)
        tg = M.TONE_LUFS - M.integrated(tx)
        for (ts, cid, tok) in cue_find(p, 'returnTone:'):
            mm = re.match(r'returnTone:\s*([-+]?\d+(?:[.,]\d+)?)\s*s', tok)
            off = float(mm.group(1).replace(',', '.'))
            s0 = int(round((ts + off) * SR))
            n_ = min(len(tx), T * SR - s0)
            tone[s0:s0 + n_] += (tx[:n_] * 10 ** (tg / 20)).astype(np.float32)
            tone_ev.append({'t': r(ts + off, 3), 'before_clip': cid, 'lufs_integrated': M.TONE_LUFS,
                            'dur_s': r(len(tx) / SR, 2), 'sound': tname})
    windows = []
    for i, ev in enumerate(p['events']):
        if i + 1 >= len(p['events']):
            continue
        nxt = p['events'][i + 1]['start']
        mu = (ev['clip'].get('cue') or {}).get('music') or ''
        if cfg.get('withdraw') and 'window:withdraw' in mu:
            windows.append((ev['end'], ev['end'] + ev['gap'], nxt, 'withdraw', cfg['withdraw']))
        elif not cfg.get('withdraw') and ev['clip'].get('window') and ev['gap'] >= M.SWELL_MIN:
            windows.append((ev['end'], ev['end'] + ev['gap'], nxt, 'swell', dict(M.SWELL, db=M.SWELL_DB)))
    v_pow = 2.0 * M.STEREO_SPEECH_GAIN ** 2 * M.kpower(voice)
    # --- müzik
    AR = {'d01': arrange_d01, 'd03': arrange_d03, 'd05': arrange_d05}
    arr = AR[cfg['arrange']](cfg, p, speech, T, L) if cfg.get('arrange') else arrange(cfg, p, speech, T)
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
    extra = bed_extra_points(p, L) or None
    boost = (img_on, float(T), cfg['nature_image_boost_db']) if (cfg.get('nature_image_boost_db') and arr['imge']) else None
    for it in range(6):
        levels = {ph: base[ph] + off[ph] for ph in PH}
        tt, env_b, ramps_b = level_env(p, T, levels, img_on, img_off, windows, 'bed', extra)
        _, env_i, _ = level_env(p, T, levels, None, None, windows, 'imge', extra)
        _, env_n, _ = level_env(p, T, {ph: levels[ph] - M.NATURE_BELOW_DB for ph in PH}, None, None, windows, 'nature',
                                extra, boost)
        music = M.apply_env(bed, tt, env_b)
        nat = M.apply_env(nature_raw, tt, env_n) if cfg.get('nature') else np.zeros_like(music)
        rl_info = None
        if cfg.get('bed_rise_limit') and not cfg.get('bed_rise_limit_after_duck'):
            g_rl, rl_info = rise_limit_gain(music + nat + room, cfg['bed_rise_limit'], M.OPEN_FADE + 3.0)
            music *= g_rl[:, None]
            nat *= g_rl[:, None]
            del g_rl
        music = music + M.apply_env(im, tt, env_i)
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
    tone0 = tone      # VARSAYIM (Ders 5, duck_tone): çanın kuyruğu konuşmanın altına uzanırsa yerel kısma çanı da kapsar
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
        if cfg.get('duck_tone'):
            tone = M.apply_gain_curve(tone0, t_d, g_d)
        bg = music + nat + room + tone
        sob, rows = M.speech_over_bed(v_pow, M.kpower(bg), speech)
        log('yerel yatak kısması', {k: round(x[2], 2) for k, x in needs.items()})
    del music0, nat0, tone0
    if cfg.get('bed_rise_limit') and cfg.get('bed_rise_limit_after_duck'):
        # VARSAYIM (Ders 5): yükseliş sınırlayıcısı yerel kısmadan SONRA, son yatakta (ölçütün ölçtüğü izde) çalışır:
        # kapanışta ton genişlemesi, evre düzeyi yükselişi ve k.donus kısmasının geri açılışı üst üste biniyor.
        # Yatak yalnız kısılır; konuşma/yatak yeniden ölçülür.
        g_rl, rl_info = rise_limit_gain(music + nat + room, cfg['bed_rise_limit'], M.OPEN_FADE + 3.0, iters=12)
        music *= g_rl[:, None]
        nat *= g_rl[:, None]
        room = room * g_rl[:, None]      # ölçülen iz ile uygulanan iz aynı olsun (oda sesi de aynı kazançla)
        del g_rl
        bg = music + nat + room + tone
        sob, rows = M.speech_over_bed(v_pow, M.kpower(bg), speech)
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
    # VARSAYIM (Ders 3 yağmuru): kurgu noktasına ±10 ms düşen 10 kHz üstü olayın enerjisi doğa izinden geliyorsa (doğa
    # izinin 10 kHz üstü düzeyi karışımınkinin en çok 3 dB altında) olay doğa kaynağında aranır: o anda en yüksek kazançla
    # çalan döngü dosyasında karşılık gelen konumun ±5 ms'inde aynı ölçütle (click_events) bir olay varsa olay kaynağın
    # kendi içeriğidir (damla), kurgu tıkı değildir; 'nature_at_edit' listesine ayrı yazılır. Kaynakta yoksa kurgu tıkı kalır.
    if cfg.get('nature'):
        n_hf, _ = M.hf_frames(nat)
        fr = int(round(0.002 * SR))
        src_ev = nature_source_events(cfg['nature'])

        def nat_source_has(t_):
            return nature_source_hit(t_, nature_ev, src_ev)

        for cl in (clicks_pre, clicks_mp3):
            keep, moved = [], []
            for it_ in cl['edit_point']:
                i_ = int(it_[0] * SR / fr)
                if i_ < len(n_hf) and n_hf[i_] >= it_[2] - 3.0:
                    hit, where = nat_source_has(it_[0])
                    if hit:
                        moved.append(it_ + [r(float(n_hf[i_]), 1), where])
                        continue
                keep.append(it_)
            cl['edit_point'] = keep
            cl['nature_at_edit'] = moved
    pos = verify_positions(speech, dec, lag)
    bgp = M.kpower(bg)
    dur_dec = (len(dec) - lag) / dsr
    integ = M.integrated(dec[lag:lag + T * SR])
    rise = M.rise_rates(M.kpower(bg - tone), speech, 'yatak, tınısız')
    im_env = M.apply_env(im, tt, env_i)
    if duck_spans:
        im_env = M.apply_gain_curve(im_env, t_d, g_d)
    rise_ex = rise_after_open(M.kpower(bg - tone - im_env), speech, M.OPEN_FADE + 3.0)
    if os.environ.get('MIXIB_DUMP'):          # hata ayıklama: yatak bileşenleri (müzik − imge, doğa, oda)
        dd = os.environ['MIXIB_DUMP']
        np.save(dd + '/music_noim.npy', (music - im_env).astype(np.float32))
        np.save(dd + '/nat.npy', nat.astype(np.float32))
        np.save(dd + '/room.npy', room.astype(np.float32))
        np.save(dd + '/env_b.npy', np.stack([tt, env_b]))
        json.dump({'extra': extra, 'ramps_b': ramps_b, 'duck': duck_spans}, open(dd + '/env.json', 'w'), default=str)
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
                           'float_nature_at_edit': clicks_pre.get('nature_at_edit', []),
                           'mp3_nature_at_edit': clicks_mp3.get('nature_at_edit', []),
                           'mp3_mix_only': clicks_mp3['mix_only'], 'mp3_bed_content': clicks_mp3['bed_content']},
           'digital_silence_mp3': ds, 'speech_over_bed': sob, 'speech_over_bed_iterations': iters,
           'local_duck': {'spans': duck_spans, 'iterations': duck_iters}, 'bed_rise_limit': rl_info, 'loudness_rise': {'criterion': 'yatak zarfı: tınısız ve imge katmanısız yatak, açılış kararmasından sonra, konuşma altı dahil '
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
           'tone_events': tone_ev, 'windows': [{'t0': r(w[0], 3), 't1': r(w[1], 3), 'kind': w[3]} for w in windows],
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
    don = closing_event(L, p)
    k_i = p['events'].index(don)
    prev_end = p['events'][k_i - 1]['subs'][-1]['end'] if k_i else 0.0
    tone_at = next((x['t'] for x in tone_ev if x['before_clip'] == don['clip']['id']), None)
    jump = max(prev_end + 0.5, (tone_at if tone_at is not None else don['start']) - 6.0)
    release = {}
    ct = cue_times(p)
    if arr['imge'] and 'layer:imge-off' in ct:
        release['C4'] = {'activeFrom': r(ct['layer:imge'][0][0], 3), 'activeUntil': r(ct['layer:imge-off'][0][0], 3),
                         'prefixFile': 'yoga-d%02d-birak-imge.m4a' % cfg['no']}
    if zinfo:
        release['C3'] = {'activeFrom': r(ct['layer:zitlik'][0][0], 3),
                         'activeUntil': r(next(ev['start'] for ev in p['events'] if ev['clip']['id'] == 'c3.birak'), 3),
                         'prefixFile': 'yoga-d%02d-birak-zitlik.m4a' % cfg['no']}
    gen = {'Varış açılışı': 'yatak/Varış', 'Varış-Derinleşme ailesi': 'yatak/Varış-Derinleşme', 'Derin ailesi': 'yatak/Derin',
           'Kapanış': 'yatak/Kapanış', 'Zıtlık dokusu': 'yatak/Zıtlık', 'Bordun': 'yatak/Bordun', 'Ton': 'yatak/Ton',
           'Uyku': 'yatak/Uyku'}
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
    for (a_, b_, n_, kind, prm) in windows:
        if kind == 'swell':
            mus_ev.append({'layer': 'bed', 'event': 'window-swell', 't0': r(a_, 3), 't1': r(n_, 3), 'db': prm['db'],
                           'rampUpSec': prm['rampUpSec'], 'rampDownSec': prm['rampDownSec'], 'downLeadSec': prm['downLeadSec']})
        else:
            mus_ev.append({'layer': 'music', 'event': 'window-withdraw', 't0': r(a_, 3), 't1': r(n_ - prm['bell_lead'], 3),
                           'db': prm['db'], 'rampDownSec': prm['down'], 'rampUpSec': prm['up']})
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
    dz = L['visual'].get('dawn')
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
        'dawn': ({'start': r(dawn_start, 3), 'spanSec': r(T - dawn_start, 2), 'rule': dz.get('startRule')} if dz else None),
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
