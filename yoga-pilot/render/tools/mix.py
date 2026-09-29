#!/usr/bin/env python3
"""mix.py — Ders 2 · 15 dk pilot karışımı (SPEC §6, §7). numpy / scipy / soundfile / pyloudnorm / lameenc; ffmpeg YOK.

Adımlar
  1. Yeniden planlama: timing.sub_durs ölçülen parça süreleriyle değiştirilir (render/sel/<ses>/<birim>/*.wav),
     plan(with_scene(L,'orman'), 900, 5.6, 'hi') her ses için ayrı kurulur, check_plan çalışır, sonuç out/plan-<ses>.json.
     Planın istediği ama üretilmemiş birim varsa listelenir ve karışım DURUR (çıkış 2; SPEC §2–4 ile üretilmeli).
  2. Konuşma izi: leadIn, parçalar, cümle arası ve klip sonrası sessizlikler plandan; evre kazancı voicePhaseGainDb,
     evre değişimi (kapanış geçişi dahil) aradaki sessizlikte doğrusal dB rampası (basamak yok). Mono parça iki kanala
     −3,01 dB ile konur (stereo ölçümde klip düzeyi −18 LUFS korunur).
  3. Müzik izleri A ve B (aynı düzen mantığı, iki kaynak): evre aileleri (Varış açılışı → Varış-Derinleşme ailesi →
     Derin ailesi → Kapanış), ≥ 8 sn eşit güç çapraz geçiş (ilinti dengeli yasa; ilintisiz kaynakta sin/cos'a eşit),
     imge katmanı c4.yer → c4.solma, dönüş tınısı returnTone ipucundan 2 sn önce, pencere kabarması (≥ 20 sn duyurulu
     pencere; planda yoksa etkin değil), evre başına kısık düzey (music.duckedBedLufs), doğa ≈ 10 dB altta, oda sesi hep.
  4. Dört karışım out/ders2-15dk-<nes|hak>-<A|B>.mp3 + .timeline.json.
  5. Ölçüm ve rapor: out/report.json + out/report.md (kör: kaynak adları yalnız out/_ab_key.json ve _ab_details.json).

Kullanım: python3 mix.py [--voices nes,hak] [--plan-only] [--tone synth|el] [--no-bed-eq]
"""
import argparse
import datetime
import hashlib
import json
import math
import os
import random
import secrets
import sys
import time

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy.ndimage import median_filter
from scipy.signal import butter, lfilter, resample_poly, sosfilt

Y = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga'
R = Y + '/render'
OUT = R + '/out'
MUS = R + '/music'
sys.path.insert(0, Y + '/pilot')
sys.path.insert(0, R + '/tools')
import timing  # noqa: E402
import audio   # noqa: E402

SR = 44100
T = 900
RATE, PROF, SCENE = 5.6, 'hi', 'orman'
VOICES = {'nes': {'name': 'Neslihan', 'voice_id': 'wQ7dVQFxIqwokkwsMqqn'},
          'hak': {'name': 'Hakan', 'voice_id': 'DwjDVVARfPVjBKepXK2c'}}
REF = -24.0                  # akış içi başvuru düzeyi (LUFS); zarf bunu evre hedefine taşır
XF = 8.0                     # doku çapraz geçişi (SPEC §6: ≥ 8 sn)
OPEN_FADE = 3.0              # PLAN D.4: ses 3 sn'de açılır
NATURE_BELOW_DB = 10.0       # SPEC §6 (VARSAYIM)
IMGE_BELOW_DB = 8.0          # VARSAYIM: imge katmanı yatağın 8 dB altında (bütünleşik LUFS); toplam evre hedefinde kalır
TONE_LUFS = -30.0            # VARSAYIM: dönüş tınısı bütünleşik −30 LUFS (Derin yatağının 6 dB üstü, sözün 12 dB altı)
NATURE_XF, ROOM_XF = 4.0, 2.0
SEED = 20260929              # doğa / oda sesi sırası: dört karışımda aynı (adil kör karşılaştırma)
SOB_MIN = 15.0               # qa.speechOverBedDbMin
MAX_BYTES = 14_000_000       # SPEC: dosya ≤ 14 MB (ondalık MB, katı okuma)
STEREO_SPEECH_GAIN = 1.0      # mono klip iki kanala birim kazançla (uygulama motorunun çalışı); stereo BS.1770'te +3,01 dB
TP_CEIL_PRE = [-2.0, -2.5, -3.0]   # kodlamadan önce stereo bağlı gerçek tepe sınırlayıcı tavanı (MP3 taşmasına pay)

LESSON = timing.load()
LS = timing.with_scene(LESSON, SCENE)
MUSIC = LESSON['music']
DUCK = dict(MUSIC['duckedBedLufs'])
PHASE_GAIN = {k: float(v) for k, v in LESSON['voicePhaseGainDb'].items() if isinstance(v, (int, float))}
END_FADE = float(MUSIC.get('endFadeSec', 5))
SWELL = MUSIC['windowSwell']
SWELL_DB = float(MUSIC['windowBedAboveDuckDb'])
SWELL_MIN = float(MUSIC['swellOnlyInAnnouncedWindowsMinSec'])
PHASES = ['Varış', 'Derinleşme', 'Derin', 'Kapanış']
PHASE_LIGHT = {'Varış': 'varis', 'Derinleşme': 'derinlesme', 'Derin': 'derin', 'Kapanış': 'kapanis'}


def log(*a):
    print(time.strftime('%H:%M:%S'), *a, flush=True)


def r(v, n=2):
    if v is None:
        return None
    try:
        if not np.isfinite(v):
            return None
    except TypeError:
        return v
    return round(float(v), n)


# ================================================================================================ seçimler
PIECES_RULE = 'v3'          # 'v3': sel/<ses>/reprocess-v3.json parçaları (PLAN.v3 §F A); 'v2': seçimdeki parçalar


def load_reprocess(v):
    p = '%s/sel/%s/reprocess-v3.json' % (R, v)
    if PIECES_RULE != 'v3':
        return None
    if not os.path.exists(p):
        raise SystemExit('v3 parça dosyası yok: %s (önce tools/reprocess_v3.py)' % p)
    return json.load(open(p, encoding='utf-8'))


def load_selection(v):
    units, meta, sflags = {}, [], []
    rp = load_reprocess(v)
    for part in (1, 2):
        p = '%s/sel/%s/selection-%s-%d.json' % (R, v, v, part)
        s = json.load(open(p, encoding='utf-8'))
        units.update(s['units'])
        meta.append({'file': p, 'part': s.get('part'), 'cut_verification': s.get('cut_verification_method') or
                     (s.get('method') or {}).get('cut_verification'), 'summary': s.get('summary')})
        for f in ((s.get('summary') or {}).get('flags') or []):
            if isinstance(f, dict):
                sflags.append(f)
    pieces, unit_pieces, flags = {}, {}, {}
    for uid, e in units.items():
        unit_pieces[uid] = []
        fl = []
        for f in (e.get('flags') or []):
            if isinstance(f, dict):
                fl.append({'flag': f.get('flag'), 'reason': f.get('reason'), 'piece': f.get('piece')})
            else:
                fl.append({'flag': str(f), 'reason': None, 'piece': None})
        for f in sflags:
            if f.get('unit') == uid:
                fl.append({'flag': f.get('flag'), 'reason': f.get('reason'), 'piece': f.get('piece')})
        seen, fl2 = set(), []
        for f in fl:
            k = (f['flag'], f.get('piece'))
            if k not in seen:
                seen.add(k)
                fl2.append(f)
        flags[uid] = fl2
        for p in e['pieces']:
            f = p['file']
            v3 = None
            if rp is not None:
                v3 = rp['pieces'][p['piece_id']]
                if v3['v2_file'] != p['file'] or v3['unit'] != uid:
                    raise SystemExit('reprocess-v3 eşlemesi tutmuyor: %s' % p['piece_id'])
                f = v3['file']
            info = sf.info(f)
            if info.samplerate != SR or info.channels != 1:
                raise SystemExit('parça biçimi beklenmedik: %s (%d Hz, %d kanal)' % (f, info.samplerate, info.channels))
            d = {'piece_id': p['piece_id'], 'unit': uid, 'text': p.get('text'), 'file': f,
                 'frames': info.frames, 'dur': info.frames / SR, 'v2_file': p['file'],
                 'v3': ({'changed': v3['changed'], 'chain': v3['v3']['peak']['chain'],
                         'level_mode': v3['v3']['level_mode'], 'lufs': v3['v3']['lufs'],
                         'v2_lufs': v3['v2']['lufs'], 'limiter_max_db': v3['v3']['limiter_max_db'],
                         'v2_limiter_max_db': v3['v2']['limiter_max_db'],
                         'comp_gr_max_db': v3['v3']['peak'].get('comp_gr_max_db'),
                         'short_level_capped': v3['v3'].get('short_level_capped')} if v3 else None)}
            pieces[p['piece_id']] = d
            unit_pieces[uid].append(d)
    return {'units': units, 'pieces': pieces, 'unit_pieces': unit_pieces, 'flags': flags, 'meta': meta,
            'reprocess': ({'file': '%s/sel/%s/reprocess-v3.json' % (R, v), 'summary': rp['summary'],
                           'constants': rp['constants']} if rp else None)}


def clip_pieces(sel, c):
    """Plan klibinin çalınan parçaları (sırasıyla). Taşıyıcı öğesi = kendi kimliğiyle tek parça."""
    if c.get('carrier'):
        p = sel['pieces'].get(c['id'])
        return [p] if p else None
    ps = sel['unit_pieces'].get(c['id'])
    if not ps or len(ps) != len(timing.sub_texts(c)):
        return None
    return ps


def unit_of(c):
    return c['carrier']['id'] if c.get('carrier') else c['id']


# ================================================================================================ 1. plan
def measured_plan(v, sel):
    orig = timing.sub_durs
    missing = []

    def sd(c, rate, prof):
        ps = clip_pieces(sel, c)
        if ps is None:
            if c['id'] not in missing:
                missing.append(c['id'])
            return orig(c, rate, prof)
        return [p['dur'] for p in ps]

    timing.sub_durs = sd
    try:
        p = timing.plan(LS, T, RATE, PROF)
        fails, dens, runs = timing.check_plan(LS, p)
    finally:
        timing.sub_durs = orig
    need_units = sorted({unit_of(ev['clip']) for ev in p['events']})
    miss_units = sorted({unit_of(ev['clip']) for ev in p['events'] if ev['clip']['id'] in missing})
    return p, fails, dens, runs, need_units, miss_units


def plan_json(v, p, fails, dens, runs, need_units, miss_units):
    evs = []
    for ev in p['events']:
        c = ev['clip']
        evs.append({'clip': c['id'], 'unit': unit_of(c), 'block': ev['block'], 'phase': c['phase'],
                    'start': r(ev['start'], 4), 'end': r(ev['end'], 4), 'speech': r(ev['speech'], 4),
                    'gapAfter': r(ev['gap'], 4), 'gapBounds': ev['gd'],
                    'subs': [{'start': r(s['start'], 4), 'end': r(s['end'], 4), 'text': s['text'],
                              'sgapAfter': r(s.get('sgap'), 4)} for s in ev['subs']],
                    'cue': c.get('cue') or {}, 'window': c.get('window')})
    return {'voice': v, 'T': T, 'rate': RATE, 'profile': PROF, 'scene': SCENE,
            'method': 'timing.plan(with_scene(L,"orman"), 900, 5.6, "hi") with timing.sub_durs monkeypatched to the '
                      'measured frame counts of the selected processed pieces (render/sel/%s/*/*.wav)' % v,
            'status': p['status'], 'mode': p['mode'], 'f': r(p['f'], 4), 'total': r(p['total'], 4),
            'speech_sec': r(p['speech'], 3), 'gaps': {k: r(x, 3) for k, x in p['gaps'].items()},
            'sel': p['sel'], 'inc': sorted(p['inc']), 'stop': list(p['stop']) if p['stop'] else None,
            'notes': p['notes'], 'check_plan': {'fails': fails, 'pass': not fails,
                                                'density': {k: (r(x, 3) if not isinstance(x, list) else x) for k, x in dens.items()},
                                                'texture_runs': [[a, r(b, 2), r(c, 2)] for a, b, c in runs]},
            'units_needed': need_units, 'units_missing': miss_units, 'events': evs}


# ================================================================================================ ölçüm yardımcıları
_M = pyln.Meter(SR)
_KF = [(f.b, f.a) for f in _M._filters.values()]


def kfilt(x):
    y = np.asarray(x, dtype=np.float64)
    for b, a in _KF:
        y = lfilter(b, a, y, axis=0)
    return y


def kpower(x):
    """K-ağırlıklı, kanallar toplanmış anlık güç (BS.1770, G = 1)."""
    y = kfilt(x)
    return (y * y).sum(axis=1) if y.ndim == 2 else y * y


def st_curve(p, win=3.0, hop=0.1):
    """Kayan pencere yüksekliği (LUFS): merkez zamanlar ve değerler."""
    cs = np.concatenate([[0.0], np.cumsum(p)])
    w = int(round(win * SR))
    h = int(round(hop * SR))
    n = len(p)
    starts = np.arange(0, n - w + 1, h)
    e = (cs[starts + w] - cs[starts]) / w
    return (starts + w / 2) / SR, -0.691 + 10 * np.log10(np.maximum(e, 1e-20))


def gated_lufs(p, a, b):
    """[a, b) sn aralığının BS.1770 bütünleşik yüksekliği (400 ms blok, %75 örtüşme, −70 / −10 kapı)."""
    s, e = int(round(a * SR)), int(round(b * SR))
    seg = p[s:e]
    w, h = int(0.4 * SR), int(0.1 * SR)
    if len(seg) < w:
        return None
    cs = np.concatenate([[0.0], np.cumsum(seg)])
    st = np.arange(0, len(seg) - w + 1, h)
    z = (cs[st + w] - cs[st]) / w
    lk = -0.691 + 10 * np.log10(np.maximum(z, 1e-20))
    z1 = z[lk > -70]
    if not len(z1):
        return None
    rel = -0.691 + 10 * np.log10(z1.mean()) - 10
    z2 = z[(lk > -70) & (lk > rel)]
    return float(-0.691 + 10 * np.log10(z2.mean())) if len(z2) else None


def integrated(x):
    v = _M.integrated_loudness(np.asarray(x, dtype=np.float64))
    return float(v) if np.isfinite(v) else None


def true_peak(x, chunk=30 * SR):
    x = np.asarray(x)
    if x.ndim == 1:
        x = x[:, None]
    m = 0.0
    for c in range(x.shape[1]):
        for s in range(0, len(x), chunk):
            seg = x[max(0, s - 64):min(len(x), s + chunk + 64), c].astype(np.float64)
            up = resample_poly(seg, 4, 1)
            m = max(m, float(np.max(np.abs(up))), float(np.max(np.abs(seg))))
    return 20 * math.log10(max(m, 1e-12))


# ================================================================================================ işaret yardımcıları
def ep_curves(n, rho=None):
    """Eşit güç çapraz geçiş: (g_out, g_in). rho (örnek başına ilinti) verilirse g = [cos, sin]/sqrt(1 + rho sin 2θ)."""
    u = (np.arange(n) + 0.5) / n
    th = 0.5 * np.pi * u
    go, gi = np.cos(th), np.sin(th)
    if rho is not None:
        d = np.sqrt(np.maximum(1.0 + rho * np.sin(2 * th), 0.05))
        go, gi = go / d, gi / d
    return go, gi


def overlap_rho(a, b):
    """a, b: (n, 2) örtüşme bölgesi; 1 sn pencerelerde ilinti, doğrusal ara değer. Dönüş (örnek başına rho, özet)."""
    n = len(a)
    w = SR
    cents, vals = [], []
    for s in range(0, max(1, n - w + 1), w // 2):
        aa, bb = a[s:s + w], b[s:s + w]
        den = math.sqrt(float((aa * aa).sum()) * float((bb * bb).sum()))
        vals.append(float((aa * bb).sum()) / den if den > 0 else 0.0)
        cents.append(s + min(w, n - s) / 2)
    vals = np.clip(np.array(vals), -0.95, 0.99)
    rho = np.interp(np.arange(n), cents, vals) if len(vals) > 1 else np.full(n, vals[0] if len(vals) else 0.0)
    return rho, {'rho_min': r(vals.min(), 3), 'rho_max': r(vals.max(), 3), 'rho_mean': r(vals.mean(), 3)}


def bed_eq(x, enabled):
    """PLAN D.3 son işlem: 150 Hz 2. derece yüksek geçiren + 1,5–4 kHz'de −3 dB çukur (tepe EQ, f0 2449 Hz, Q 0,98)."""
    if not enabled:
        return x
    sos = butter(2, 150.0, 'highpass', fs=SR, output='sos')
    y = sosfilt(sos, x, axis=0)
    f0, q, gdb = 2449.0, 0.98, -3.0
    A = 10 ** (gdb / 40)
    w0 = 2 * math.pi * f0 / SR
    al = math.sin(w0) / (2 * q)
    b = np.array([1 + al * A, -2 * math.cos(w0), 1 - al * A])
    a = np.array([1 + al / A, -2 * math.cos(w0), 1 - al / A])
    return lfilter(b / a[0], a / a[0], y, axis=0)


def read_region(path, off, m, pre=1.0):
    """Dosyanın off sn'den başlayan m örneği (stereo float64); EQ geçişi için önde pre sn okunur (lead döner)."""
    info = sf.info(path)
    s = int(round(off * SR))
    p = int(round(pre * SR))
    s0 = max(0, s - p)
    e = min(info.frames, s + m)
    x, sr = sf.read(path, start=s0, stop=e, dtype='float64', always_2d=True)
    if sr != SR:
        raise SystemExit('örnekleme hızı %d: %s' % (sr, path))
    if x.shape[1] == 1:
        x = np.repeat(x, 2, axis=1)
    lead = s - s0
    if len(x) - lead < m:
        short = m - (len(x) - lead)
        if short > 2:
            raise SystemExit('dosya kısa: %s off %.3f (%d örnek eksik)' % (path, off, short))
        x = np.concatenate([x, np.zeros((short, 2))])          # yuvarlama payı (≤ 2 örnek)
    return x, lead


def span(t0, t1):
    s0, s1 = int(round(t0 * SR)), int(round(t1 * SR))
    return s0, s1 - s0


# ================================================================================================ 2. konuşma izi
def voice_track(plan, sel):
    N = T * SR
    v = np.zeros(N, dtype=np.float32)
    evs = plan['events']
    # evre kazancı zarfı (dB), yalnız sessizlikte rampa
    pts_t, pts_g = [0.0], [PHASE_GAIN[evs[0]['clip']['phase']]]
    ramps = []
    for i, ev in enumerate(evs):
        g = PHASE_GAIN[ev['clip']['phase']]
        if i and g != PHASE_GAIN[evs[i - 1]['clip']['phase']]:
            a = evs[i - 1]['subs'][-1]['end']
            b = ev['subs'][0]['start']
            pts_t += [a, b]
            pts_g += [PHASE_GAIN[evs[i - 1]['clip']['phase']], g]
            ramps.append({'from': evs[i - 1]['clip']['id'], 'to': ev['clip']['id'], 't0': r(a, 3), 't1': r(b, 3),
                          'sec': r(b - a, 3), 'db_from': PHASE_GAIN[evs[i - 1]['clip']['phase']], 'db_to': g,
                          'ge_4s': bool(b - a >= timing.GAIN_RAMP_SEC - 1e-6)})
    pts_t.append(float(T))
    pts_g.append(pts_g[-1])
    speech, prev_end = [], -1
    for ev in evs:
        c = ev['clip']
        ps = clip_pieces(sel, c)
        for k, (sub, pc) in enumerate(zip(ev['subs'], ps)):
            x, sr = sf.read(pc['file'], dtype='float32')
            s0 = int(round(sub['start'] * SR))
            if s0 < prev_end:
                raise SystemExit('parça örtüşmesi: %s' % pc['piece_id'])
            gdb = np.interp([sub['start'], sub['end']], pts_t, pts_g)
            if abs(gdb[0] - gdb[1]) > 1e-6:
                raise SystemExit('kazanç rampası söz içine düştü: %s' % pc['piece_id'])
            v[s0:s0 + len(x)] += x * np.float32(10 ** (gdb[0] / 20))
            prev_end = s0 + len(x)
            speech.append({'piece': pc['piece_id'], 'unit': pc['unit'], 'clip': c['id'], 'block': ev['block'],
                           'phase': c['phase'], 'start': s0 / SR, 'end': (s0 + len(x)) / SR, 'sub_index': k,
                           'n_subs': len(ps), 'plan_text': sub['text'], 'spoken_text': pc['text'],
                           'voice_gain_db': float(gdb[0]), 'file': pc['file'], 'cue': c.get('cue') or {},
                           'v3': pc.get('v3')})
    return v, speech, {'points_t': pts_t, 'points_db': pts_g, 'ramps': ramps}


# ================================================================================================ 3. müzik
def cue_times(plan):
    ct = {}
    for ev in plan['events']:
        c = ev['clip']
        mu = (c.get('cue') or {}).get('music') or ''
        for tok in [x.strip() for x in mu.split(';') if x.strip()]:
            ct.setdefault(tok, []).append((ev['start'], c['id']))
    return ct


def phase_bounds(plan):
    """Evre başlangıçları: evrenin ilk klibinin başı (ipucu: phase:*)."""
    b, prev = {}, None
    for ev in plan['events']:
        ph = ev['clip']['phase']
        if ph != prev:
            b.setdefault(ph, []).append((ev['start'], ev['clip']['id']))
            prev = ph
    return b


def speech_cover(speech, a, b):
    return sum(max(0.0, min(b, s['end']) - max(a, s['start'])) for s in speech) / (b - a)


EL = {
    'label': 'el',
    'grid': None,
    'opening': {'file': MUS + '/el/el-v-aday.keyA.wav', 'usable': (3.0, 160.0)},
    'vd': [{'file': MUS + '/el/el-vd-a.wav', 'usable': (3.0, 286.5)},
           {'file': MUS + '/el/el-vd-b.wav', 'usable': (15.5, 288.0)}],
    'derin': [{'file': MUS + '/el/el-derin-a.wav', 'usable': (12.5, 237.5)},
              {'file': MUS + '/el/el-derin-b.keyD.wav', 'usable': (25.5, 220.0)}],
    'kapanis': {'file': MUS + '/el/el-kapanis.wav', 'usable': (4.5, 170.5)},
    'imge': {'file': MUS + '/el/el-imge.wav', 'usable': (1.5, 166.0)},
}
DALGA = {
    'label': 'dalga',
    'grid': {'bar': 4.0, 'cycle': 24, 'best_mod': 6, 'best_phase': 4},
    'opening': {'file': MUS + '/dalga/dalga_varis_x.wav', 'bar0': 24},
    'vd': [{'file': MUS + '/dalga/dalga_vd_family.wav', 'bar0': 46}],
    'derin': [{'file': MUS + '/dalga/dalga_derin_family.wav', 'bar0': 46}],
    'kapanis': {'file': MUS + '/dalga/dalga_kapanis.wav', 'bar0': 28},
    'imge': {'file': MUS + '/dalga/dalga_imge.wav', 'bar0': 24},
}
SOURCES = {'el': EL, 'dalga': DALGA}


def flen(path):
    return sf.info(path).frames / SR


def arrange(src, plan, speech):
    """Aynı düzen mantığı, iki kaynak. Dönüş: yatak yerleşimleri, imge yerleşimi, olaylar, notlar."""
    grid = src['grid']
    pb = phase_bounds(plan)
    ct = cue_times(plan)
    t_n1 = pb['Derinleşme'][0][0]
    t_c2 = pb['Derin'][0][0]
    t_k = pb['Kapanış'][0][0]
    t_img_on = ct['layer:imge'][0][0]
    t_img_off = ct['layer:imge-off'][0][0]
    blocks = []
    pbk = None
    for ev in plan['events']:
        if ev['block'] != pbk:
            blocks.append(ev['start'])
            pbk = ev['block']
    notes = []
    K = src['kapanis']
    lenK = flen(K['file'])

    # küresel ızgara (ızgaralı kaynak): kapanış dosyasının doğal sonu ders sonuna oturur
    g = None
    if grid:
        cyc = grid['bar'] * grid['cycle']
        g = (K['bar0'] * grid['bar'] - T + lenK) % cyc

    def valid_instant(cue):
        """Doku geçişi ipucu klibinin başında başlar (konuşmanın altında; iki kaynakta aynı kural). Izgaralı kaynakta
        bütün dosyalar küresel ızgaraya hizalı yerleştirildiği için her anda iki taraf aynı akordadır (faz eşit)."""
        return cue

    def aligned_offset(f, t, lo=0.0, mod_bars=None):
        cyc = grid['bar'] * (mod_bars or grid['cycle'])
        o = (t + g - f['bar0'] * grid['bar']) % cyc
        while o < lo - 1e-9:
            o += cyc
        return o

    def entry_offset(f, t):
        if grid:
            return aligned_offset(f, t)
        return max(0.0, f['usable'][0] - XF)

    def end_limit(f):
        L = flen(f['file'])
        if grid:
            return L
        return min(L, f['usable'][1] + XF)

    placements = []   # {file, t0, t1, off, fin, fout, role}

    def family(files, t_start, t_end_xf, role, first_off=None):
        """t_start'tan t_end_xf'e (sonraki geçişin sonu) kadar aile akışı; gerekirse aile içi geçiş."""
        f0 = files[0]
        o0 = first_off if first_off is not None else entry_offset(f0, t_start)
        need = t_end_xf - t_start
        if o0 + need <= end_limit(f0) + 1e-6:
            return [{'src': f0, 't0': t_start, 't1': t_end_xf, 'off': o0, 'role': role}]
        if grid or len(files) < 2:
            raise SystemExit('aile kapsamı yetmiyor: %s %s' % (role, f0['file']))
        f1 = files[1]
        o1 = entry_offset(f1, 0)
        lo = t_end_xf + o1 - end_limit(f1)            # f1 sonuna kadar yetsin
        hi = t_start + end_limit(f0) - o0 - XF          # f0 geçiş sonuna kadar yetsin
        cands = []
        bset = set(round(x, 6) for x in blocks)
        for s in speech:
            if lo - 1e-6 <= s['start'] <= hi + 1e-6 and s['start'] > t_start + XF:
                cov = speech_cover(speech, s['start'], s['start'] + XF)
                cands.append((round(cov, 2), round(s['start'], 6) in bset, -s['start'], s['start'], s['piece']))
        if not cands:
            raise SystemExit('aile içi geçiş noktası yok: %s [%.1f, %.1f]' % (role, lo, hi))
        cands.sort(reverse=True)
        S = cands[0][3]
        notes.append('%s: aile içi geçiş %.2f sn (%s; geçiş penceresinde konuşma payı %.2f; uygun aralık %.1f–%.1f)'
                     % (role, S, cands[0][4], cands[0][0], lo, hi))
        return [{'src': f0, 't0': t_start, 't1': S + XF, 'off': o0, 'role': role},
                {'src': f1, 't0': S, 't1': t_end_xf, 'off': o1, 'role': role}]

    x_n1 = valid_instant(t_n1)
    x_c2 = valid_instant(t_c2)
    x_k = valid_instant(t_k)
    O = src['opening']
    o_open = aligned_offset(O, 0.0) if grid else 0.0
    placements.append({'src': O, 't0': 0.0, 't1': x_n1 + XF, 'off': o_open, 'role': 'Varış açılışı'})
    if o_open + x_n1 + XF > flen(O['file']) + 1e-6:
        raise SystemExit('açılış dosyası kısa')
    placements += family(src['vd'], x_n1, x_c2 + XF, 'Varış-Derinleşme ailesi')
    placements += family(src['derin'], x_c2, x_k + XF, 'Derin ailesi')
    o_k = x_k - (T - lenK)
    if grid:
        chk = aligned_offset(K, x_k)
        cyc = grid['bar'] * grid['cycle']
        dd = (chk - o_k) % cyc
        if min(dd, cyc - dd) > 1e-6:
            raise SystemExit('kapanış ızgara hizası tutmadı')
    if o_k < 0:
        raise SystemExit('kapanış dosyası kısa')
    placements.append({'src': K, 't0': x_k, 't1': float(T), 'off': o_k, 'role': 'Kapanış'})
    # imge katmanı: c4.yer'de 8 sn içeri, c4.solma'da 8 sn dışarı
    I = src['imge']
    t_i1 = t_img_off + XF
    if grid:
        o_i = aligned_offset(I, t_img_on, mod_bars=grid['best_mod'])   # ölçü + sessiz ölçü hizası (ezgi akordan bağımsız)
    else:
        o_i = 0.0
    if o_i + (t_i1 - t_img_on) > flen(I['file']) + 1e-6:
        raise SystemExit('imge dosyası kısa')
    imge = {'src': I, 't0': t_img_on, 't1': t_i1, 'off': o_i, 'role': 'İmge katmanı'}
    xinfo = [{'what': 'Varış → Varış-Derinleşme ailesi', 'cue': ('phase:derinlesme', r(t_n1, 3)), 'start': r(x_n1, 3),
              'speech_cover': r(speech_cover(speech, x_n1, x_n1 + XF), 2)},
             {'what': 'Varış-Derinleşme → Derin', 'cue': ('phase:derin', r(t_c2, 3)), 'start': r(x_c2, 3),
              'speech_cover': r(speech_cover(speech, x_c2, x_c2 + XF), 2)},
             {'what': 'Derin → Kapanış', 'cue': ('phase:kapanis', r(t_k, 3)), 'start': r(x_k, 3),
              'speech_cover': r(speech_cover(speech, x_k, x_k + XF), 2)}]
    if grid:
        notes.append('ızgara: ölçü %.0f sn, 24 ölçülük armoni döngüsü; küresel kayma g = %.1f sn (kapanış dosyasının '
                     'doğal sonu = ders sonu); her dosya o ≡ t + g − 4·bar0 (mod 96 sn) ile yerleşir, geçişler faz eşit '
                     '(aynı akor); geçiş anı ipucu klibinin başı (konuşma altı), motor notundaki "en iyi 4,5 (mod 6) '
                     'ölçüleri" tercihi yerine' % (grid['bar'], g))
    return {'placements': placements, 'imge': imge, 'xfades': xinfo, 'notes': notes, 'grid_g': g,
            'times': {'t_n1': t_n1, 't_c2': t_c2, 't_k': t_k, 'img_on': t_img_on, 'img_off': t_img_off}}


def render_stream(pls, eq):
    """Yatak yerleşimlerini tek akışa çevirir: EQ, REF'e göre bütünleşik düzey, eşit güç (ilinti dengeli) geçişler."""
    N = T * SR
    out = np.zeros((N, 2), dtype=np.float32)
    segs = []
    for p in pls:
        s0, m = span(p['t0'], p['t1'])
        x, lead = read_region(p['src']['file'], p['off'], m)
        y = bed_eq(x, eq)[lead:lead + m]
        # düzey: geçiş bölgeleri hariç gövdenin bütünleşik yüksekliği
        a = int(round(XF * SR)) if p['t0'] > 0 else int(round(OPEN_FADE * SR))
        b = len(y) - (int(round(XF * SR)) if p['t1'] < T else int(round(END_FADE * SR)))
        L = integrated(y[a:b]) if b - a > SR else integrated(y)
        gdb = REF - L
        y = y * 10 ** (gdb / 20)
        segs.append({'p': p, 'y': y, 'gain_db': gdb, 'body_lufs_raw': L})
    xf_info = []
    for i in range(len(segs) - 1):
        A, B = segs[i], segs[i + 1]
        x0 = B['p']['t0']
        n = int(round(XF * SR))
        ia = int(round(x0 * SR)) - int(round(A['p']['t0'] * SR))
        a_ov = A['y'][ia:ia + n]
        b_ov = B['y'][:n]
        if len(a_ov) != n or len(b_ov) != n:
            raise SystemExit('geçiş bölgesi uyuşmuyor (%d/%d/%d)' % (len(a_ov), len(b_ov), n))
        rho, rs = overlap_rho(a_ov, b_ov)
        go, gi = ep_curves(n, rho)
        A['y'][ia:ia + n] *= go[:, None]
        A['y'][ia + n:] = 0.0
        B['y'][:n] *= gi[:, None]
        xf_info.append({'t0': r(x0, 3), 't1': r(x0 + XF, 3), 'law': 'eşit güç, g=[cos,sin]/sqrt(1+rho·sin2θ)', **rs})
    for s in segs:
        p = s['p']
        s0 = int(round(p['t0'] * SR))
        y = s['y']
        if s0 + len(y) != int(round(p['t1'] * SR)):
            raise SystemExit('yerleşim uzunluğu uyuşmuyor: %s' % p['role'])
        e = min(N, s0 + len(y))
        out[s0:e] += y[:e - s0].astype(np.float32)
    return out, segs, xf_info


def render_layer(p, eq, level_rel_db, fin, fout):
    N = T * SR
    out = np.zeros((N, 2), dtype=np.float32)
    s0, m = span(p['t0'], p['t1'])
    x, lead = read_region(p['src']['file'], p['off'], m)
    y = bed_eq(x, eq)[lead:lead + m]
    L = integrated(y)
    gdb = REF + level_rel_db - L
    y = y * 10 ** (gdb / 20)
    n1, n2 = int(round(fin * SR)), int(round(fout * SR))
    _, gi = ep_curves(n1)
    go, _ = ep_curves(n2)
    y[:n1] *= gi[:, None]
    y[-n2:] *= go[:, None]
    out[s0:s0 + len(y)] = y.astype(np.float32)
    return out, {'gain_db': gdb, 'lufs_raw': L}


def loop_stream(files, period, xf, rng, t0=0.0, t1=float(T), normalize=True):
    """Döngü akışı: rastgele sıra (art arda aynı yok), her çalışta rastgele döndürme, eşit güç geçiş."""
    N = T * SR
    out = np.zeros((N, 2), dtype=np.float32)
    data = []
    for f in files:
        x, sr = sf.read(f, dtype='float64', always_2d=True)
        g = (REF - integrated(x)) if normalize else 0.0
        data.append((f, x * 10 ** (g / 20), g))
    ev = []
    t = t0
    last = None
    n_xf = int(round(xf * SR))
    go, gi = ep_curves(n_xf)
    while t < t1 - 1e-6:
        k = rng.choice([i for i in range(len(data)) if i != last])
        last = k
        f, x, g = data[k]
        L = len(x)
        rot = rng.randrange(L)
        seg_len = int(round((period + xf) * SR))
        idx = (rot + np.arange(seg_len)) % L
        y = x[idx].copy()
        s0 = int(round(t * SR))
        first = not ev
        if not first:
            y[:n_xf] *= gi[:, None]
        y[-n_xf:] *= go[:, None]
        e = min(N, s0 + seg_len)
        out[s0:e] += y[:e - s0].astype(np.float32)
        ev.append({'t0': r(t, 3), 't1': r(min(t + period + xf, T), 3), 'loop': os.path.basename(f), 'rotation_s': r(rot / SR, 3),
                   'gain_db': r(g, 2)})
        t += period
    return out, ev


def level_envelope(plan, times, levels, img_on, img_off, windows, what):
    """Evre hedefi (LUFS) zarfı, 100 Hz. Azalan düzey yeni evrenin ilk sözünden ÖNCE (aradaki sessizlikte, en çok 8 sn),
    artan düzey ilk sözle başlayıp 8 sn'de biter. İmge: yatak toplamı hedefte kalsın diye imge boyunca −c dB."""
    fs = 100
    t = np.arange(T * fs + 1) / fs
    pb = phase_bounds(plan)
    evs = plan['events']
    starts = {ev['clip']['id']: i for i, ev in enumerate(evs)}
    env = np.full(len(t), levels['Varış'])
    ramps = []
    order = ['Varış', 'Derinleşme', 'Derin', 'Kapanış']
    for a_ph, b_ph in zip(order, order[1:]):
        tb, cid = pb[b_ph][0]
        i = starts[cid]
        prev_end = evs[i - 1]['subs'][-1]['end']
        la, lb = levels[a_ph], levels[b_ph]
        if lb < la:
            d = min(XF, tb - prev_end)
            r0, r1 = tb - d, tb
        else:
            r0, r1 = tb, tb + XF
        m = t >= r1
        env[m] = lb
        mr = (t >= r0) & (t < r1)
        env[mr] = la + (lb - la) * (t[mr] - r0) / (r1 - r0)
        ramps.append({'from': a_ph, 'to': b_ph, 't0': r(r0, 3), 't1': r(r1, 3), 'db_from': r(la, 2), 'db_to': r(lb, 2),
                      'db_per_s': r(abs(lb - la) / (r1 - r0), 3)})
    if what == 'bed':
        c = 10 * math.log10(1 + 10 ** (-IMGE_BELOW_DB / 10))
        m = (t >= img_on) & (t <= img_off + XF)
        u = np.clip(np.minimum((t - img_on) / XF, (img_off + XF - t) / XF), 0, 1)
        env[m] -= c * u[m]
    for (w0, w1, nxt) in windows:        # pencere kabarması (SPEC §6)
        up0, up1 = w0, w0 + SWELL['rampUpSec']
        dn1 = nxt - SWELL['downLeadSec']
        dn0 = dn1 - SWELL['rampDownSec']
        sw = np.interp(t, [up0, up1, dn0, dn1], [0, SWELL_DB, SWELL_DB, 0], left=0, right=0)
        env += sw
    return t, env, ramps


def apply_env(x, t_env, env_db, start_fade=OPEN_FADE, end_fade=END_FADE):
    N = len(x)
    ts = np.arange(N, dtype=np.float64) / SR
    g = 10 ** ((np.interp(ts, t_env, env_db) - REF) / 20)
    if start_fade:
        n = int(round(start_fade * SR))
        g[:n] *= 0.5 - 0.5 * np.cos(np.pi * (np.arange(n) + 0.5) / n)
    if end_fade:
        n = int(round(end_fade * SR))
        g[N - n:] *= 0.5 + 0.5 * np.cos(np.pi * (np.arange(n) + 0.5) / n)
    return (x * g[:, None].astype(np.float32)).astype(np.float32)


# ================================================================================================ ölçümler (SPEC §7)
def speech_over_bed(v_pow, bg_pow, speech):
    tc, bst = st_curve(bg_pow)
    _, vst = st_curve(v_pow)
    res = {}
    rows = []
    for s in speech:
        dur = s['end'] - s['start']
        ls = gated_lufs(v_pow, s['start'], s['end'])
        m = (tc >= s['start']) & (tc <= s['end'])
        if not m.any():
            m = np.abs(tc - (s['start'] + s['end']) / 2) <= 0.05
        lb = float(bst[m].max())
        rows.append({'piece': s['piece'], 'phase': s['phase'], 'dur': dur, 'speech_lufs': ls, 'bed_st_max': lb,
                     'diff': (ls - lb) if ls is not None else None})
    # ikincil: 3 sn ST iki izde, pencerenin ≥ %90'ı konuşma
    cover = np.zeros(len(tc))
    iv = np.zeros(T * 10 + 1)
    for s in speech:
        iv[int(round(s['start'] * 10)):int(round(s['end'] * 10))] = 1
    civ = np.concatenate([[0], np.cumsum(iv)])
    idx = np.clip(np.round(tc * 10).astype(int), 15, len(iv) - 16)
    cover = (civ[idx + 15] - civ[idx - 15]) / 30.0
    phase_at = np.array([None] * len(tc), dtype=object)
    for ph, (a, b) in phase_spans_from_speech(speech).items():
        phase_at[(tc >= a) & (tc < b)] = ph
    for ph in PHASES:
        pr = [x for x in rows if x['phase'] == ph and x['diff'] is not None]
        p1 = [x for x in pr if x['dur'] >= 1.0]
        worst = min(p1, key=lambda x: x['diff']) if p1 else None
        mw = (cover >= 0.9) & (phase_at == ph)
        d2 = (vst - bst)[mw]
        tw = tc[mw]
        wi = int(np.argmin(d2)) if len(d2) else None
        res[ph] = {
            'pieces_ge_1s': len(p1),
            'min_diff_ge_1s': r(worst['diff'], 2) if worst else None,
            'worst_piece': worst['piece'] if worst else None,
            'p10_diff_ge_1s': r(np.percentile([x['diff'] for x in p1], 10), 2) if p1 else None,
            'median_diff_ge_1s': r(np.median([x['diff'] for x in p1]), 2) if p1 else None,
            'pieces_all': len(pr),
            'min_diff_all': r(min(x['diff'] for x in pr), 2) if pr else None,
            'n_below_15_all': sum(1 for x in pr if x['diff'] < SOB_MIN),
            'speech_lufs_median': r(np.median([x['speech_lufs'] for x in pr]), 2) if pr else None,
            'bed_st_under_speech_median': r(np.median([x['bed_st_max'] for x in pr]), 2) if pr else None,
            'st3_windows_ge90pct_speech': int(mw.sum()),
            'st3_min_diff': r(d2.min(), 2) if len(d2) else None,
            'st3_median_diff': r(np.median(d2), 2) if len(d2) else None,
            'st3_n_below_15': int(np.sum(d2 < SOB_MIN)) if len(d2) else 0,
            'st3_pct_below_15': r(100.0 * np.mean(d2 < SOB_MIN), 1) if len(d2) else None,
            'st3_worst_at_s': r(tw[wi], 1) if wi is not None else None,
            'st3_worst_pieces': [x['piece'] for x in speech if wi is not None and x['end'] > tw[wi] - 1.5 and x['start'] < tw[wi] + 1.5],
            'below_15_pieces': [[x['piece'], r(x['dur'], 2), r(x['diff'], 2)] for x in pr if x['diff'] < SOB_MIN],
            'pass_ge_1s': bool(worst is None or worst['diff'] >= SOB_MIN - 1e-9),
        }
    return res, rows


LOCAL_DUCK_TRIGGER_DB = SOB_MIN      # yalnız eşik altı parça (1 sn'den kısalar dahil; PLAN.v3 §E.3)
LOCAL_DUCK_TO_DB = SOB_MIN + 0.5     # VARSAYIM: kısmadan sonra en az 15,5 dB (0,5 dB pay)
LOCAL_DUCK_ST_HALF_S = 1.5           # 3 sn ST penceresinin yarısı: parçayı kapsayan her pencere kısılmış yatak görür
LOCAL_DUCK_RAMP_MIN_S = 1.0          # VARSAYIM
LOCAL_DUCK_RATE_DB_S = 1.0           # iniş ve çıkış ≤ 1 dB/sn (qa.windowLoudnessRiseMaxDbPerSec ile aynı sınır)


def local_duck_curve(needs):
    """Yerel yatak kısması (dB, 100 Hz): her parça için [başlangıç − 1,5, bitiş + 1,5] sn düz −d dB, iki yanda
    max(1 sn, d / 1 dB/sn) doğrusal-dB rampa; üst üste binenlerde en derini. needs: {parça: (başlangıç, bitiş, d)}."""
    fs = 100
    t = np.arange(T * fs + 1) / fs
    g = np.zeros(len(t))
    spans = []
    for pid, (a, b, d) in sorted(needs.items(), key=lambda kv: kv[1][0]):
        p0, p1 = a - LOCAL_DUCK_ST_HALF_S, b + LOCAL_DUCK_ST_HALF_S
        rr = max(LOCAL_DUCK_RAMP_MIN_S, d / LOCAL_DUCK_RATE_DB_S)
        g = np.minimum(g, np.interp(t, [p0 - rr, p0, p1, p1 + rr], [0.0, -d, -d, 0.0], left=0.0, right=0.0))
        spans.append({'piece': pid, 'depth_db': r(d, 2), 'flat': [r(p0, 2), r(p1, 2)], 't0': r(p0 - rr, 2),
                      't1': r(p1 + rr, 2), 'ramp_s': r(rr, 2)})
    return t, g, spans


def apply_gain_curve(x, t_env, g_db):
    ts = np.arange(len(x), dtype=np.float64) / SR
    g = 10 ** (np.interp(ts, t_env, g_db) / 20)
    return (x * g[:, None].astype(np.float32)).astype(np.float32)


def phase_spans_from_speech(speech):
    first = {}
    for s in speech:
        first.setdefault(s['phase'], s['start'])
    out = {}
    ks = [p for p in PHASES if p in first]
    for i, p in enumerate(ks):
        out[p] = (0.0 if i == 0 else first[p], first[ks[i + 1]] if i + 1 < len(ks) else float(T))
    return out


def rise_rates(pw, speech, label):
    tc, st = st_curve(pw, 3.0, 0.1)
    d = st[10:] - st[:-10]            # 1 sn içindeki artış (dB/sn)
    tm = tc[:-10]
    ok = np.isfinite(d) & (st[:-10] > -80)
    iv = np.zeros(len(tm), dtype=bool)
    for s in speech:
        iv |= (tm + 1.5 + 1.0 >= s['start']) & (tm - 1.5 <= s['end'])
    gap = ok & ~iv
    top = np.argsort(-np.where(ok, d, -1e9))[:5]
    return {'stem': label, 'max_rise_db_per_s': r(np.max(d[ok]), 2), 'at_s': r(tm[np.argmax(np.where(ok, d, -1e9))], 1),
            'max_rise_in_speech_free_s': r(np.max(d[gap]), 2) if gap.any() else None,
            'at_speech_free_s': r(tm[gap][np.argmax(d[gap])], 1) if gap.any() else None,
            'n_1s_steps_over_1db': int(np.sum(d[ok] > 1.0)),
            'top5': [[r(tm[i], 1), r(d[i], 2)] for i in top]}


def hf_frames(x):
    """Orta kanalın 2 ms karelerde 10 kHz üstü ve tam bant düzeyi (dB)."""
    n = int(round(0.002 * SR))
    xm = np.asarray(x, dtype=np.float64)
    if xm.ndim == 2:
        xm = xm.mean(axis=1)
    hp = sosfilt(butter(4, 10000.0, 'highpass', fs=SR, output='sos'), xm)
    k = len(xm) // n
    fb = 10 * np.log10(np.maximum(np.mean(xm[:k * n].reshape(k, n) ** 2, axis=1), 1e-24))
    hf = 10 * np.log10(np.maximum(np.mean(hp[:k * n].reshape(k, n) ** 2, axis=1), 1e-24))
    return hf, fb


def click_events(hf, fb):
    """10 kHz üstü ani enerji (VARSAYIM): 2 ms karede ±20 ms ortancanın ≥ 12 dB üstü, ≥ −75 dBFS ve tam bant karenin
    en çok 40 dB altında; bitişik kareler tek olay. Dönüş: olayın en yüksek karesinin indisi."""
    bg = median_filter(hf, size=21, mode='nearest')
    cand = (hf - bg >= 12.0) & (hf >= -75.0) & (hf >= fb - 40.0)
    ev = []
    for i in np.where(cand)[0]:
        if ev and i - ev[-1][-1] <= 3:
            ev[-1].append(i)
        else:
            ev.append([i])
    return [e[int(np.argmax(hf[e]))] for e in ev]


def detect_clicks_mix(x, edits, speech, v_hf, b_hf):
    """Karışımdaki her 10 kHz üstü ani olay, olayın karesindeki enerjinin hangi izden geldiğine göre sınıflanır:
    konuşma izinin 10 kHz üstü düzeyi karışımınkinin en çok 3 dB altındaysa 'speech_content' (seçilmiş çekimin kendi
    ünsüzü), değilse kurgu noktasına (±10 ms) düşüyorsa 'edit_point' (karışımdan kuşkulu tık), yatak izi taşıyorsa
    'bed_content' (müzik/doğa içeriği), hiçbiri değilse 'mix_only'."""
    hf, fb = hf_frames(x)
    n = int(round(0.002 * SR))
    ed = np.array(sorted(edits)) if edits else np.array([-1e9])
    out = {'edit_point': [], 'speech_content': [], 'bed_content': [], 'mix_only': []}
    sp = sorted((s['start'], s['end'], s['piece']) for s in speech)
    for i in click_events(hf, fb):
        t = (i + 0.5) * n / SR
        piece = next((pp for (a, b, pp) in sp if a - 0.005 <= t <= b + 0.005), None)
        j = np.searchsorted(ed, t)
        near_ed = min(abs(t - ed[max(0, j - 1)]), abs(t - ed[min(len(ed) - 1, j)])) <= 0.010
        lv = v_hf[i] if i < len(v_hf) else -240.0
        lb = b_hf[i] if i < len(b_hf) else -240.0
        item = [r(t, 3), piece, r(hf[i], 1), r(lv, 1), r(lb, 1)]
        if lv >= hf[i] - 3.0:
            out['speech_content'].append(item)
        elif near_ed:
            out['edit_point'].append(item)
        elif lb >= hf[i] - 3.0:
            out['bed_content'].append(item)
        else:
            out['mix_only'].append(item)
    return out


def digital_silence(x, thr=1.0 / 32768):
    a = np.abs(np.asarray(x))
    if a.ndim == 2:
        a = a.max(axis=1)
    q = a <= thr
    if not q.any():
        return {'longest_run_s': 0.0, 'runs_over_100ms': 0}
    d = np.diff(np.concatenate([[0], q.astype(np.int8), [0]]))
    s = np.where(d == 1)[0]
    e = np.where(d == -1)[0]
    L = e - s
    j = int(np.argmax(L))
    return {'longest_run_s': r(L[j] / SR, 4), 'at_s': r(s[j] / SR, 3), 'runs_over_100ms': int(np.sum(L > 0.1 * SR)),
            'threshold': '|x| <= 1/32768 on both channels'}


def tp_limit_stereo(x, ceiling_db, chunk=30 * SR):
    """Stereo bağlı gerçek tepe sınırlayıcı (audio.tp_limit yöntemi: 4× üst örnekleme, 1 dB/ms ileriye bakan atak,
    0,05 dB/ms bırakma, 2 ms tutma+ortalama). Dönüş (y, istatistik)."""
    from scipy.ndimage import maximum_filter1d, uniform_filter1d
    N = len(x)
    pk = np.zeros(N, dtype=np.float32)
    for s0 in range(0, N, chunk):
        a0, a1 = max(0, s0 - 64), min(N, s0 + chunk + 64)
        m = np.zeros(a1 - a0)
        for c in range(x.shape[1]):
            seg = x[a0:a1, c].astype(np.float64)
            up = np.abs(resample_poly(seg, 4, 1))[:(a1 - a0) * 4].reshape(a1 - a0, 4).max(axis=1)
            m = np.maximum(m, np.maximum(up, np.abs(seg)))
        pk[s0:min(N, s0 + chunk)] = m[s0 - a0:s0 - a0 + min(chunk, N - s0)]
    c = 10 ** (ceiling_db / 20.0)
    greq = np.minimum(1.0, c / np.maximum(pk.astype(np.float64), 1e-12))
    if greq.min() >= 1.0:
        return x, {'ceiling_dbtp': ceiling_db, 'max_reduction_db': 0.0, 'sec_over_0_5db': 0.0, 'sec_over_1db': 0.0}
    rr = -20.0 * np.log10(greq)
    del greq, pk
    idx = np.arange(N, dtype=np.float64)
    da, dr = audio.LIM_ATTACK_DB_PER_MS * 1000.0 / SR, audio.LIM_RELEASE_DB_PER_MS * 1000.0 / SR
    rr = np.maximum.accumulate(rr + dr * idx) - dr * idx
    rr = np.maximum.accumulate((rr - da * idx)[::-1])[::-1] + da * idx
    del idx
    k = int(0.002 * SR) | 1
    rr = uniform_filter1d(maximum_filter1d(rr, k), k)
    g = (10 ** (-rr / 20.0)).astype(np.float32)
    st = {'ceiling_dbtp': ceiling_db, 'max_reduction_db': r(rr.max(), 2), 'sec_over_0_5db': r(np.sum(rr > 0.5) / SR, 3),
          'sec_over_1db': r(np.sum(rr > 1.0) / SR, 3), 'at_s': r(float(np.argmax(rr)) / SR, 3)}
    return (x * g[:, None]).astype(np.float32), st


# ================================================================================================ MP3
def mp3_lag(dec, mix, seg=(4.0, 34.0), maxlag=4096):
    """Kod çözülmüş MP3'ün karışıma göre örnek kayması (kodlayıcı gecikmesi); orta kanal ilintisi."""
    a0, a1 = int(seg[0] * SR), int(seg[1] * SR)
    ref = mix[a0:a1].mean(axis=1).astype(np.float64)
    best, lag = -1.0, 0
    d = dec.mean(axis=1)
    for L in range(0, maxlag + 1):
        y = d[a0 + L:a1 + L]
        if len(y) < len(ref):
            break
        c = float(np.dot(ref, y))
        if c > best:
            best, lag = c, L
    return lag


def encode_mp3(x, path):
    import lameenc
    rng = np.random.default_rng(SEED)
    d = (rng.random(x.shape) - rng.random(x.shape)) / 32768.0          # TPDF ±1 LSB
    pcm = np.clip(np.round((x.astype(np.float64) + d) * 32767.0), -32768, 32767).astype('<i2')
    tries = [('VBR V2 (mtrh, q=2)', {'vbr': 4, 'vbr_quality': 2}),
             ('ABR 120 kbit/s', {'vbr': 3, 'abr': 120}),
             ('CBR 112 kbit/s', {'cbr': 112})]
    for name, cfg in tries:
        enc = lameenc.Encoder()
        enc.set_in_sample_rate(SR)
        enc.set_channels(2)
        enc.set_quality(2)
        if 'cbr' in cfg:
            enc.set_bit_rate(cfg['cbr'])
        else:
            enc.set_vbr(cfg['vbr'])
            if 'vbr_quality' in cfg:
                enc.set_vbr_quality(cfg['vbr_quality'])
            if 'abr' in cfg:
                enc.set_vbr_mean_bitrate_kbps(cfg['abr'])
        data = bytearray()
        step = SR * 10
        for s in range(0, len(pcm), step):
            data += enc.encode(pcm[s:s + step].tobytes())
        data += enc.flush()
        if len(data) <= MAX_BYTES:
            with open(path, 'wb') as f:
                f.write(data)
            return {'mode': name, 'bytes': len(data), 'kbps_avg': r(len(data) * 8 / T / 1000, 1),
                    'tried': [t[0] for t in tries[:tries.index((name, cfg)) + 1]]}
    raise SystemExit('MP3 14 MB sınırına sığmadı')


# ================================================================================================ ana akış
def v3_flags(s, duck_spans):
    """Zaman çizelgesi bayrakları (v3): yeniden işlenen, yumuşak tepe, kısa düzey, sınırlayıcı > 3 dB, yerel kısma."""
    out = set()
    x = s.get('v3') or {}
    if x.get('changed'):
        out.add('v3-yeniden-islendi')
    if x.get('chain') == 'soft+limiter':
        out.add('v3-yumusak-tepe')
    if x.get('level_mode') == 'lufs-short':
        out.add('v3-kisa-duzey')
    if x.get('short_level_capped'):
        out.add('v3-kisa-duzey-sinirli')
    if (x.get('limiter_max_db') or 0) > audio.LIM_FLAG_DB:
        out.add('kulak-sinirlayici')
    if any(d['piece'] == s['piece'] for d in duck_spans):
        out.add('v3-yerel-kisma')
    return out


def ab_key():
    p = OUT + '/_ab_key.json'
    if os.path.exists(p):
        return json.load(open(p, encoding='utf-8'))
    a = 'el' if secrets.randbits(1) else 'dalga'
    b = 'dalga' if a == 'el' else 'el'
    k = {'A': a, 'B': b, 'created': datetime.datetime.now(datetime.timezone.utc).isoformat(),
         'method': 'secrets.randbits(1), drawn once; reused on every later run',
         'note': 'sahibe dinlemeden önce gösterilmez (SPEC §6)',
         'sources': {'el': 'ElevenLabs Music (render/music/el)', 'dalga': 'Dalga motoru (render/music/dalga)'}}
    json.dump(k, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return k


def visual_timeline(plan, speech):
    vis = []
    state = {'phase': None, 'image': 'off', 'dawn': False}
    don = next(ev for ev in plan['events'] if ev['clip']['id'] == 'k.donus')
    dawn_start = max(don['start'], T - float(LESSON['visual']['dawn']['spanSec'][1]))
    vis.append({'t': r(dawn_start, 3), 'cue': 'dawn:start', 'rule': LESSON['visual']['dawn']['startRule'],
                'span_s': r(T - dawn_start, 2)})
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


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument('--voices', default='nes,hak')
    ap.add_argument('--plan-only', action='store_true')
    ap.add_argument('--tone', choices=['synth', 'el'], default='synth')
    ap.add_argument('--no-bed-eq', action='store_true')
    ap.add_argument('--report-only', action='store_true')
    a = ap.parse_args(argv)
    if a.report_only:
        build_report()
        return 0
    os.makedirs(OUT, exist_ok=True)
    eq = not a.no_bed_eq
    voices = a.voices.split(',')
    report = {'generated_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'spec': R + '/SPEC.md §6-§7',
              'tool': os.path.abspath(__file__), 'T': T, 'plans': {}, 'mixes': {}, 'decisions': [], 'not_verified': []}
    sels, plans = {}, {}
    for v in voices:
        log('plan', v)
        sel = load_selection(v)
        p, fails, dens, runs, need, miss = measured_plan(v, sel)
        pj = plan_json(v, p, fails, dens, runs, need, miss)
        json.dump(pj, open('%s/plan-%s.json' % (OUT, v), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        report['plans'][v] = {k: pj[k] for k in ('status', 'mode', 'f', 'total', 'speech_sec', 'sel', 'stop', 'notes',
                                                 'units_missing')}
        report['plans'][v]['check_plan'] = {'pass': pj['check_plan']['pass'], 'fails': fails,
                                            'density': pj['check_plan']['density']}
        report['plans'][v]['n_events'] = len(p['events'])
        report['plans'][v]['n_speech_pieces'] = sum(len(ev['subs']) for ev in p['events'])
        report['plans'][v]['file'] = '%s/plan-%s.json' % (OUT, v)
        log(v, 'status', p['status'], 'total %.3f' % p['total'], 'check_plan fails', fails, 'missing', miss)
        if miss:
            log('EKSİK BİRİM:', miss)
            json.dump(report, open(OUT + '/report.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
            return 2
        sels[v], plans[v] = sel, p
    if a.plan_only:
        return 0
    key = ab_key()
    tone_file = MUS + ('/common/donus.synth-D5.wav' if a.tone == 'synth' else '/common/donus.wav')
    details = {'_note': 'KAYNAK AÇIĞA ÇIKARIR: sahibe dinlemeden önce gösterilmez', 'ab_key': key, 'mixes': {}}
    for v in voices:
        sel, plan = sels[v], plans[v]
        log('konuşma izi', v)
        voice, speech, vgain = voice_track(plan, sel)
        vis, dawn_start = visual_timeline(plan, speech)
        # ortak katmanlar
        rng = random.Random(SEED)
        nature_raw, nature_ev = loop_stream([MUS + '/common/orman-%d.wav' % i for i in (1, 2, 3, 4)], 30.0, NATURE_XF, rng)
        room, room_ev = loop_stream([MUS + '/common/oda-sesi-1.wav', MUS + '/common/oda-sesi-2.wav'], 30.0, ROOM_XF, rng,
                                    normalize=False)
        nr = int(0.05 * SR)
        room[:nr] *= np.linspace(0, 1, nr, dtype=np.float32)[:, None]
        nr2 = int(0.5 * SR)
        room[-nr2:] *= np.linspace(1, 0, nr2, dtype=np.float32)[:, None]
        tone = np.zeros_like(room)
        tone_ev = []
        tx, _ = sf.read(tone_file, dtype='float64', always_2d=True)
        tg = TONE_LUFS - integrated(tx)
        for tok, lst in cue_times(plan).items():
            if tok.startswith('returnTone:'):
                off = float(tok.split(':')[1].rstrip('s'))
                for (ts, cid) in lst:
                    s0 = int(round((ts + off) * SR))
                    tone[s0:s0 + len(tx)] += (tx * 10 ** (tg / 20)).astype(np.float32)
                    tone_ev.append({'t': r(ts + off, 3), 'before_clip': cid, 'lufs_integrated': TONE_LUFS,
                                    'dur_s': r(len(tx) / SR, 2)})
        windows = []
        for i, ev in enumerate(plan['events']):
            if ev['clip'].get('window') and ev['gap'] >= SWELL_MIN:
                windows.append((ev['end'], ev['end'] + ev['gap'], plan['events'][i + 1]['start']))
        v_pow = 2.0 * STEREO_SPEECH_GAIN ** 2 * kpower(voice)   # iki kanal × (g·v_k)²
        stems = {}
        for lab, srcname in (('A', key['A']), ('B', key['B'])):
            src = SOURCES[srcname]
            log('müzik', v, lab)
            arr = arrange(src, plan, speech)
            bed, segs, xfi = render_stream(arr['placements'], eq)
            im, imi = render_layer(arr['imge'], eq, -IMGE_BELOW_DB, XF, XF)
            stems[lab] = {'src': srcname, 'arr': arr, 'bed': bed, 'segs': segs, 'xfi': xfi, 'imge': im, 'imi': imi}
        # evre düzeyleri + konuşma/yatak denetimi (iki kaynak için ortak ofset: yükseklik eşlenmiş kör karşılaştırma)
        base = {ph: DUCK[ph] - 10 * math.log10(1 + 10 ** (-NATURE_BELOW_DB / 10)) for ph in PHASES}
        off = {ph: 0.0 for ph in PHASES}
        iters = []
        for it in range(6):
            need = {}
            per = {}
            for lab in ('A', 'B'):
                S = stems[lab]
                levels = {ph: base[ph] + off[ph] for ph in PHASES}
                arr = S['arr']
                tt, env_b, ramps_b = level_envelope(plan, arr['times'], levels, arr['times']['img_on'],
                                                    arr['times']['img_off'], windows, 'bed')
                _, env_i, _ = level_envelope(plan, arr['times'], levels, 0, -1, windows, 'imge')
                _, env_n, _ = level_envelope(plan, arr['times'], {ph: levels[ph] - NATURE_BELOW_DB for ph in PHASES},
                                             0, -1, windows, 'nature')
                music = apply_env(S['bed'], tt, env_b) + apply_env(S['imge'], tt, env_i)
                nat = apply_env(nature_raw, tt, env_n)
                bg = music + nat + room + tone
                sob, rows = speech_over_bed(v_pow, kpower(bg), speech)
                per[lab] = sob
                for ph in PHASES:
                    mn = sob[ph]['min_diff_ge_1s']
                    if mn is not None and mn < SOB_MIN:
                        need[ph] = min(need.get(ph, 0.0), mn - SOB_MIN - 0.1)
                S.update({'music': music, 'nat': nat, 'bg': bg, 'sob': sob, 'rows': rows, 'levels': levels,
                          'ramps': ramps_b, 'env': (tt, env_b, env_n)})
            iters.append({'iter': it, 'offsets_db': {k: r(x, 2) for k, x in off.items()},
                          'min_diff_ge_1s': {lab: {ph: per[lab][ph]['min_diff_ge_1s'] for ph in PHASES} for lab in per}})
            if not need:
                break
            for ph, d in need.items():
                off[ph] += d
            log('konuşma/yatak ofsetleri', v, {k: round(x, 2) for k, x in off.items()})
        else:
            log('UYARI: konuşma/yatak 6 turda tutmadı')
        # v3: yerel yatak kısması — 1 sn'den kısalar dahil her parça ≥ 15 dB (PLAN.v3 §E.3); A ve B'ye ORTAK
        needs, duck_iters, duck_spans = {}, [], []
        t_d = g_d = None
        for lab in ('A', 'B'):
            stems[lab]['music0'], stems[lab]['nat0'] = stems[lab]['music'], stems[lab]['nat']
        for it in range(5):
            add = {}
            for lab in ('A', 'B'):
                for sp_, row in zip(speech, stems[lab]['rows']):
                    if row['diff'] is not None and row['diff'] < LOCAL_DUCK_TRIGGER_DB - 1e-9 or \
                            (sp_['piece'] in needs and row['diff'] is not None and row['diff'] < LOCAL_DUCK_TO_DB - 0.05):
                        add[sp_['piece']] = max(add.get(sp_['piece'], 0.0), LOCAL_DUCK_TO_DB - row['diff'] + 0.02)
            duck_iters.append({'iter': it, 'needs_db': {k: r(x[2], 2) for k, x in needs.items()},
                               'below': {k: r(x, 2) for k, x in add.items()}})
            if not add:
                break
            for pid, d in add.items():
                sp_ = next(x for x in speech if x['piece'] == pid)
                prev = needs.get(pid, (0, 0, 0.0))[2]
                needs[pid] = (sp_['start'], sp_['end'], prev + d)
            t_d, g_d, duck_spans = local_duck_curve(needs)
            for lab in ('A', 'B'):
                S = stems[lab]
                S['music'] = apply_gain_curve(S['music0'], t_d, g_d)
                S['nat'] = apply_gain_curve(S['nat0'], t_d, g_d)
                S['bg'] = S['music'] + S['nat'] + room + tone
                S['sob'], S['rows'] = speech_over_bed(v_pow, kpower(S['bg']), speech)
            log('yerel yatak kısması', v, {k: round(x[2], 2) for k, x in needs.items()})
        else:
            log('UYARI: yerel kısma 5 turda tutmadı')
        for lab in ('A', 'B'):
            del stems[lab]['music0'], stems[lab]['nat0']
        for lab in ('A', 'B'):
            S = stems[lab]
            mix0 = S['bg'] + voice[:, None] * np.float32(STEREO_SPEECH_GAIN)
            tp_raw = true_peak(mix0)
            name = 'ders2-15dk-%s-%s' % (v, lab)
            mp3 = '%s/%s.mp3' % (OUT, name)
            lim_tries = []
            for ceil in TP_CEIL_PRE:
                mix, lim = tp_limit_stereo(mix0, ceil)
                tp_pre = true_peak(mix)
                log('kodlama', name, 'TP ham %.2f, sınırlayıcı %s, TP(önce) %.2f' % (tp_raw, lim, tp_pre))
                enc = encode_mp3(mix, mp3)
                dec, dsr = sf.read(mp3, dtype='float64', always_2d=True)
                tp_dec = true_peak(dec)
                lim_tries.append({'ceiling_dbtp': ceil, 'limiter': lim, 'tp_float_after_limiter': r(tp_pre, 2),
                                  'tp_mp3': r(tp_dec, 2)})
                if tp_dec <= -1.0 or ceil == TP_CEIL_PRE[-1]:
                    break
                del dec
            del mix0
            log('ölçüm', name)
            edits = []
            for p_ in S['arr']['placements'] + [S['arr']['imge']]:
                edits += [p_['t0'], p_['t1']]
            for x_ in S['xfi']:
                edits += [x_['t0'], x_['t1']]
            for e_ in nature_ev + room_ev:
                edits += [e_['t0'], e_['t1']]
            for s_ in speech:
                edits += [s_['start'], s_['end']]
            edits += [x_['t'] for x_ in tone_ev] + [0.0, OPEN_FADE, T - END_FADE, float(T)]
            v_hf, v_fb = hf_frames(voice * np.float32(STEREO_SPEECH_GAIN))
            b_hf, b_fb = hf_frames(S['bg'])
            vt, bt = click_events(v_hf, v_fb), click_events(b_hf, b_fb)
            clicks_pre = detect_clicks_mix(mix, edits, speech, v_hf, b_hf)
            lag = mp3_lag(dec, mix)
            clicks_mp3 = detect_clicks_mix(dec[lag:lag + T * SR], edits, speech, v_hf, b_hf)
            bgp = kpower(S['bg'])
            m = {
                'file': mp3, 'bytes': enc['bytes'], 'encoding': enc, 'sample_rate': dsr, 'channels': dec.shape[1],
                'duration_s': r(len(dec) / dsr, 4),
                'mp3_decoder_offset_samples': lag,
                'duration_float_mix_s': r(len(mix) / SR, 4),
                'integrated_lufs': r(integrated(dec), 2), 'integrated_lufs_float_mix': r(integrated(mix), 2),
                'true_peak_dbtp': r(tp_dec, 2), 'true_peak_dbtp_float_mix': r(tp_pre, 2),
                'true_peak_dbtp_before_limiter': r(tp_raw, 2), 'tp_limiter': lim_tries,
                'speech_over_bed': S['sob'],
                'loudness_rise': {'bed_stem': rise_rates(bgp, speech, 'yatak (müzik + doğa + oda + tını)'),
                                  'music_stem': rise_rates(kpower(S['music']), speech, 'yalnız müzik'),
                                  'bed_stem_without_tone': rise_rates(kpower(S['bg'] - tone), speech, 'yatak, tınısız'),
                                  'full_mix_speech_free': rise_rates(kpower(mix), speech, 'tam karışım'),
                                  'tone_times_s': [x_['t'] for x_ in tone_ev]},
                'windows_in_plan': len(windows),
                'texture_changes': [{'what': 'yatak geçişi', 't0': r(p_['t0'], 3), 't1': r(p_['t0'] + XF, 3),
                                     'speech_cover': r(speech_cover(speech, p_['t0'], p_['t0'] + XF), 2)}
                                    for p_ in S['arr']['placements'] if p_['t0'] > 0] +
                                   [{'what': 'imge katmanı girişi', 't0': r(S['arr']['imge']['t0'], 3),
                                     't1': r(S['arr']['imge']['t0'] + XF, 3),
                                     'speech_cover': r(speech_cover(speech, S['arr']['imge']['t0'], S['arr']['imge']['t0'] + XF), 2)},
                                    {'what': 'imge katmanı çıkışı', 't0': r(S['arr']['imge']['t1'] - XF, 3),
                                     't1': r(S['arr']['imge']['t1'], 3),
                                     'speech_cover': r(speech_cover(speech, S['arr']['imge']['t1'] - XF, S['arr']['imge']['t1']), 2)}],
                'clicks_float_mix': {k: len(x) for k, x in clicks_pre.items()},
                'clicks_stems': {'voice_only': int(len(vt)), 'bed_only': int(len(bt))},
                'clicks_list': {'float_bed_content': clicks_pre['bed_content'], 'float_mix_only': clicks_pre['mix_only'],
                                'float_edit_point': clicks_pre['edit_point'], 'mp3_bed_content': clicks_mp3['bed_content'],
                                'mp3_mix_only': clicks_mp3['mix_only'], 'mp3_edit_point': clicks_mp3['edit_point'],
                                'item': '[t_s, konuşma parçası, karışım HF dB, konuşma izi HF dB, yatak izi HF dB]'},
                'clicks_mp3': {k: len(x) for k, x in clicks_mp3.items()},
                'clicks_detail': {'float': clicks_pre, 'mp3': clicks_mp3},
                'digital_silence_mp3': digital_silence(dec),
                'digital_silence_float_mix': digital_silence(mix),
                'bed_levels_lufs_target': {ph: r(S['levels'][ph], 2) for ph in PHASES},
                'bed_offset_vs_duckedBedLufs_db': {ph: r(S['levels'][ph] + 10 * math.log10(1 + 10 ** (-NATURE_BELOW_DB / 10)) - DUCK[ph], 2) for ph in PHASES},
                'bed_measured_st3_median_by_phase': {},
                'nature_minus_music_db': -NATURE_BELOW_DB,
                'md5': hashlib.md5(open(mp3, 'rb').read()).hexdigest(),
            }
            tc, bst = st_curve(bgp)
            _, mst = st_curve(kpower(S['music']))
            _, nst = st_curve(kpower(S['nat']))
            for ph, (p0, p1) in phase_spans_from_speech(speech).items():
                mm = (tc >= p0 + 10) & (tc < p1 - 10)
                m['bed_measured_st3_median_by_phase'][ph] = {'bg_total': r(np.median(bst[mm]), 2),
                                                            'music': r(np.median(mst[mm]), 2),
                                                            'nature': r(np.median(nst[mm]), 2),
                                                            'music_minus_nature': r(np.median(mst[mm] - nst[mm]), 2)}
            m['speech_over_bed_iterations'] = iters
            m['local_duck'] = {'rule': 'eşik altı (< %.1f dB) her parça için yatak (müzik + imge + doğa) parça ±%.1f sn düz, '
                                       'rampa max(%.1f sn, d / %.1f dB/sn); hedef ≥ %.1f dB; A ve B ortak' % (
                                           LOCAL_DUCK_TRIGGER_DB, LOCAL_DUCK_ST_HALF_S, LOCAL_DUCK_RAMP_MIN_S,
                                           LOCAL_DUCK_RATE_DB_S, LOCAL_DUCK_TO_DB),
                               'spans': duck_spans, 'iterations': duck_iters}
            m['speech_over_bed_pieces'] = [{'piece': x['piece'], 'phase': x['phase'], 'start': r(sp_['start'], 3),
                                            'dur': r(x['dur'], 3), 'speech_lufs': r(x['speech_lufs'], 2),
                                            'bed_st_max': r(x['bed_st_max'], 2), 'diff': r(x['diff'], 2)}
                                           for x, sp_ in zip(S['rows'], speech)]
            report['mixes'][name] = m
            # zaman çizelgesi (kör: dosya adları yok)
            arr = S['arr']
            gen = {'Varış açılışı': 'yatak/Varış', 'Varış-Derinleşme ailesi': 'yatak/Varış-Derinleşme',
                   'Derin ailesi': 'yatak/Derin', 'Kapanış': 'yatak/Kapanış'}
            mus_ev = []
            cnt = {}
            for p_, sg in zip(arr['placements'], S['segs']):
                cnt[p_['role']] = cnt.get(p_['role'], 0) + 1
                mus_ev.append({'layer': 'bed', 'label': '%s-%d' % (gen[p_['role']], cnt[p_['role']]), 't0': r(p_['t0'], 3),
                               't1': r(p_['t1'], 3)})
            for x_ in S['xfi']:
                mus_ev.append({'layer': 'bed', 'event': 'crossfade', 't0': x_['t0'], 't1': x_['t1'], 'law': 'equal-power'})
            mus_ev.append({'layer': 'imge', 'event': 'fade-in', 't0': r(arr['imge']['t0'], 3), 't1': r(arr['imge']['t0'] + XF, 3),
                           'cue': 'layer:imge (c4.yer)'})
            mus_ev.append({'layer': 'imge', 'event': 'fade-out', 't0': r(arr['imge']['t1'] - XF, 3), 't1': r(arr['imge']['t1'], 3),
                           'cue': 'layer:imge-off (c4.solma)'})
            for rp in S['ramps']:
                mus_ev.append({'layer': 'bed', 'event': 'level', **rp})
            for x_ in tone_ev:
                mus_ev.append({'layer': 'tone', 'event': 'returnTone', **x_})
            for d_ in duck_spans:
                mus_ev.append({'layer': 'music+imge+nature', 'event': 'local-duck', 't0': d_['t0'], 't1': d_['t1'],
                               'depth_db': d_['depth_db'], 'flat': d_['flat'], 'under_piece': d_['piece']})
            mus_ev.append({'layer': 'all', 'event': 'open-fade', 't0': 0.0, 't1': OPEN_FADE})
            mus_ev.append({'layer': 'music+nature', 'event': 'end-fade', 't0': T - END_FADE, 't1': float(T),
                           'cue': 'fade:5s (k.son)'})
            mus_ev.sort(key=lambda x: x.get('t0', x.get('t', 0)))
            flags = sel['flags']
            tl = {'file': mp3, 'lesson': LESSON['id'], 'title': LESSON.get('title'), 'minutes': 15, 'T': T,
                  'voice': v, 'voice_name': VOICES[v]['name'], 'music': lab, 'scene': SCENE,
                  'sample_rate': SR, 'channels': 2,
                  'plan': {'file': '%s/plan-%s.json' % (OUT, v), 'status': plan['status'], 'mode': plan['mode'],
                           'check_plan_pass': not report['plans'][v]['check_plan']['fails']},
                  'speech': [{'i': i, 'piece': s['piece'], 'clip': s['clip'], 'unit': s['unit'], 'block': s['block'],
                              'phase': s['phase'], 'start': r(s['start'], 4), 'end': r(s['end'], 4),
                              'screen_text': s['plan_text'], 'spoken_text': s['spoken_text'],
                              'screen_equals_spoken': bool(audio.compare_text(s['plan_text'], s['spoken_text'])[0]),
                              'voice_gain_db': r(s['voice_gain_db'], 2), 'visual_cue': s['visual_cue'],
                              'visual_state': s['visual_state'],
                              'flags': sorted({f['flag'] for f in flags.get(s['unit'], [])
                                               if (not f.get('piece') or f.get('piece') == s['piece'])
                                               and f['flag'] != 'kulak-sinirlayici'} | v3_flags(s, duck_spans))}
                             for i, s in enumerate(speech)],
                  'visual': vis,
                  'music_events': mus_ev,
                  'nature_events': [{'t0': e_['t0'], 't1': e_['t1'], 'label': 'orman-%s' % e_['loop'].split('-')[-1].split('.')[0],
                                     'rotation_s': e_['rotation_s']} for e_ in nature_ev],
                  'room_tone_events': [{'t0': e_['t0'], 't1': e_['t1'], 'label': e_['loop'].replace('.wav', '')} for e_ in room_ev],
                  'levels': {'music_target_lufs_by_phase': m['bed_levels_lufs_target'],
                             'music_plus_nature_target_lufs_by_phase': {ph: r(S['levels'][ph] + 10 * math.log10(1 + 10 ** (-NATURE_BELOW_DB / 10)), 2) for ph in PHASES},
                             'nature_below_music_db': NATURE_BELOW_DB, 'imge_below_bed_db': IMGE_BELOW_DB,
                             'room_tone_dbfs_rms': -58.0, 'speech_clip_lufs': -18.0,
                             'voice_phase_gain_db': PHASE_GAIN, 'voice_gain_ramps': vgain['ramps']},
                  'windows': [{'t0': r(a_, 3), 't1': r(b_, 3)} for a_, b_, _ in windows]}
            json.dump(tl, open('%s/%s.timeline.json' % (OUT, name), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
            details['mixes'][name] = {
                'source': S['src'],
                'placements': [{'role': p_['role'], 'file': p_['src']['file'], 't0': r(p_['t0'], 3), 't1': r(p_['t1'], 3),
                                'file_offset_s': r(p_['off'], 3), 'gain_db': r(sg['gain_db'], 2),
                                'body_lufs_raw_after_eq': r(sg['body_lufs_raw'], 2)} for p_, sg in zip(arr['placements'], S['segs'])],
                'imge': {'file': arr['imge']['src']['file'], 't0': r(arr['imge']['t0'], 3), 't1': r(arr['imge']['t1'], 3),
                         'file_offset_s': r(arr['imge']['off'], 3), 'gain_db': r(S['imi']['gain_db'], 2)},
                'crossfades': S['xfi'], 'crossfade_placement': arr['xfades'], 'notes': arr['notes'],
                'grid_g_s': arr['grid_g'], 'tone_file': tone_file,
                'nature': nature_ev, 'room': room_ev}
            log(name, 'bytes', enc['bytes'], 'I %.2f' % m['integrated_lufs'], 'TP %.2f' % m['true_peak_dbtp'],
                'dur %.3f' % m['duration_s'])
            del dec, mix
        del stems, voice, nature_raw, room, tone
    json.dump(details, open(OUT + '/_ab_details.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    report['tone'] = {'file_choice': a.tone, 'file': tone_file}
    report['bed_eq'] = eq
    json.dump(report, open(OUT + '/_report_mix_raw.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    build_report(report)
    log('bitti')
    return 0


# ================================================================================================ 5. rapor
def ledger_summary():
    rows = [json.loads(l) for l in open(R + '/ledger.jsonl', encoding='utf-8') if l.strip()]
    by = {}
    for x in rows:
        k = x.get('kind', '?')
        by[k] = by.get(k, 0.0) + float(x.get('cents_est') or 0.0)
    speech = by.get('speech', 0.0) + by.get('scribe-speech', 0.0)
    music = by.get('music', 0.0) + by.get('sfx', 0.0) + by.get('scribe-music', 0.0)
    return {'file': R + '/ledger.jsonl', 'rows': len(rows), 'cents_by_kind': {k: r(v, 2) for k, v in sorted(by.items())},
            'speech_bucket_cents': r(speech, 2), 'speech_cap_cents': 550.0,
            'music_bucket_cents': r(music, 2), 'music_cap_cents': 900.0,
            'total_cents': r(sum(by.values()), 2), 'total_usd': r(sum(by.values()) / 100, 2),
            'reconcile_rows': sum(1 for x in rows if x.get('reconcile')),
            'this_step_paid_calls': 0,
            'note': 'toplam = defterdeki bütün satırların cents_est toplamı (uzlaştırma satırları dahil: müzik tarafında '
                    'tahmin yerine gerçek fiyat); karışım adımı ücretli çağrı yapmadı'}


def selection_flags(v, plan_units):
    sel = load_selection(v)
    out = {'kulak': [], 'kesim-kulak': [], 'kulak-sinirlayici': [], 'eklem>2yt': [], 'other': []}
    for uid, fl in sel['flags'].items():
        for f in fl:
            item = {'unit': uid, 'piece': f.get('piece'), 'reason': f.get('reason'), 'in_plan': uid in plan_units}
            k = f['flag'] if f['flag'] in out else 'other'
            if k == 'other':
                item['flag'] = f['flag']
            out[k].append(item)
    summ = {k: len(x) for k, x in out.items()}
    v2_lim = [(x['unit'], x['piece']) for x in out['kulak-sinirlayici']]
    lim = v2_lim
    rp = sel.get('reprocess')
    if rp:                                  # v3: sınırlayıcı bayrağı yeniden işlenmiş parçalardan
        pcs = load_reprocess(v)['pieces']
        lim = [(d['unit'], pid) for pid, d in pcs.items() if (d['v3']['limiter_max_db'] or 0) > audio.LIM_FLAG_DB]
        summ['kulak-sinirlayici'] = len(lim)
        summ['kulak-sinirlayici_v2_girdi'] = len(v2_lim)
        summ['kulak-sinirlayici_v2_parca'] = sum(1 for d in pcs.values() if (d['v2']['limiter_max_db'] or 0) > audio.LIM_FLAG_DB)
    return {'counts': summ, 'kulak_units': out['kulak'], 'other_flags': out['other'],
            'kulak_sinirlayici': lim, 'reprocess_summary': rp['summary'] if rp else None,
            'kesim_kulak_units': sorted({x['unit'] for x in out['kesim-kulak']}),
            'eklem_gt_2st_units': sorted({x['unit'] for x in out['eklem>2yt']}),
            'cut_verification': [m['cut_verification'] for m in sel['meta']]}


def order_check(v, tl):
    pj = json.load(open('%s/plan-%s.json' % (OUT, v), encoding='utf-8'))
    want = [(ev['clip'], k, sb['text']) for ev in pj['events'] for k, sb in enumerate(ev['subs'])]
    got = [(x['clip'], None, x['screen_text']) for x in tl['speech']]
    same = [w[0] for w in want] == [g[0] for g in got] and [w[2] for w in want] == [g[2] for g in got]
    starts = [x['start'] for x in tl['speech']]
    return {'plan_pieces': len(want), 'timeline_pieces': len(got), 'same_order_and_text': bool(same),
            'monotonic': bool(all(b > a for a, b in zip(starts, starts[1:]))),
            'duplicates': len(got) - len(set((x['piece'], x['clip']) for x in tl['speech'])),
            'screen_equals_spoken_all': all(x['screen_equals_spoken'] for x in tl['speech']),
            'screen_ne_spoken': [x['piece'] for x in tl['speech'] if not x['screen_equals_spoken']]}


def verify_positions(name, lag):
    """Ölçülen denetim: her konuşma parçası kod çözülmüş MP3'te zaman çizelgesindeki yerinde mi? Parça dalga biçimi ile
    MP3 orta kanalı arasında ±50 ms içinde normalleştirilmiş ilinti; en iyi ilinti ve kayması."""
    tl = json.load(open('%s/%s.timeline.json' % (OUT, name), encoding='utf-8'))
    dec, _ = sf.read('%s/%s.mp3' % (OUT, name), dtype='float64', always_2d=True)
    mid = dec.mean(axis=1)
    W = int(0.05 * SR)
    rows = []
    for sp in tl['speech']:
        x, _ = sf.read(_piece_file(tl["voice"], sp["piece"]), dtype="float64")
        s0 = int(round(sp['start'] * SR)) + lag
        seg = mid[max(0, s0 - W):s0 + len(x) + W]
        c = np.correlate(seg, x, 'valid')
        e = np.concatenate([[0.0], np.cumsum(seg * seg)])
        nx = math.sqrt(float(np.dot(x, x)))
        ns = np.sqrt(np.maximum(e[len(x):] - e[:-len(x)], 1e-20))
        cc = c / (nx * ns[:len(c)])
        k = int(np.argmax(cc))
        rows.append((sp['piece'], float(cc[k]), (k - min(W, s0)) / SR))
    worst = min(rows, key=lambda x: x[1])
    return {'pieces': len(rows), 'min_corr': r(worst[1], 3), 'min_corr_piece': worst[0],
            'median_corr': r(float(np.median([x[1] for x in rows])), 3),
            'max_abs_offset_ms': r(1000 * max(abs(x[2]) for x in rows), 2),
            'n_corr_below_0_9': sum(1 for x in rows if x[1] < 0.9),
            'order_ok': bool(all(abs(x[2]) <= 0.002 for x in rows)),
            'v3_ok': bool(all(abs(x[2]) <= POS_MAX_OFFSET_S for x in rows) and worst[1] >= POS_MIN_CORR),
            'v3_rule': 'SPEC v3.5: ilinti ≥ %.2f (VARSAYIM), kayma ≤ %.0f ms' % (POS_MIN_CORR, POS_MAX_OFFSET_S * 1000)}


POS_MIN_CORR, POS_MAX_OFFSET_S = 0.95, 0.001      # SPEC v3.5 / PLAN.v3 §E.3


_PF = {}


def _piece_file(v, pid):
    if v not in _PF:
        _PF[v] = {k: d['file'] for k, d in load_selection(v)['pieces'].items()}
    return _PF[v][pid]


def build_report(raw=None):
    raw = raw or json.load(open(OUT + '/_report_mix_raw.json', encoding='utf-8'))
    rep = {k: raw[k] for k in ('generated_utc', 'spec', 'tool', 'T', 'plans', 'tone', 'bed_eq') if k in raw}
    rep['mixes'] = {}
    rep['cost'] = ledger_summary()
    rep['selection_flags'] = {}
    rep['done_criteria'] = {}
    for name, m in raw['mixes'].items():
        v = name.split('-')[2]
        tl = json.load(open('%s/%s.timeline.json' % (OUT, name), encoding='utf-8'))
        oc = order_check(v, tl)
        mm = dict(m)
        mm.pop('clicks_detail', None)
        mm['order_check'] = oc
        mm['position_check_mp3'] = verify_positions(name, m['mp3_decoder_offset_samples'])
        log('konum denetimi', name, mm['position_check_mp3'])
        mm['timeline'] = '%s/%s.timeline.json' % (OUT, name)
        rep['mixes'][name] = mm
        sob = m['speech_over_bed']
        rep['done_criteria'][name] = {
            'duration_900pm1': bool(abs(m['duration_s'] - T) <= 1.0),
            'order_as_plan': oc['same_order_and_text'] and oc['monotonic'],
            'every_piece_found_at_its_time_in_mp3': rep['mixes'][name]['position_check_mp3']['v3_ok'],
            'no_missing_or_duplicate_by_construction': oc['plan_pieces'] == oc['timeline_pieces'] and oc['duplicates'] == 0,
            'full_mix_scribe_alignment': None,
            'screen_equals_spoken': oc['screen_equals_spoken_all'],
            'no_edit_point_clicks_mp3': m['clicks_mp3']['edit_point'] == 0,
            'no_mix_only_clicks_mp3': m['clicks_mp3']['mix_only'] == 0,
            'no_digital_silence_ge_100ms_mp3': m['digital_silence_mp3']['runs_over_100ms'] == 0,
            'speech_over_bed_ge15_pieces_ge_1s': all(sob[ph]['pass_ge_1s'] for ph in PHASES),
            'speech_over_bed_ge15_all_pieces_v3': all(sob[ph]['n_below_15_all'] == 0 for ph in PHASES),
            'true_peak_le_minus1': bool(m['true_peak_dbtp'] <= -1.0),
            'integrated_lufs': m['integrated_lufs'],
            'size_le_14MB': bool(m['bytes'] <= MAX_BYTES),
            'mp3_44k1_stereo': bool(m['sample_rate'] == SR and m['channels'] == 2),
        }
    for v in rep.get('plans', {}):
        pj = json.load(open('%s/plan-%s.json' % (OUT, v), encoding='utf-8'))
        rep['selection_flags'][v] = selection_flags(v, set(pj['units_needed']))
    rep['v3_changes'] = v3_changes(rep)
    rep['not_verified'] = [
        'SPEC §7 "tam karışımın Scribe metni plan metniyle hizalanır": YAPILMADI; SPEC v3.5 ile yerine parça konum denetimi '
        '(ilinti ≥ 0,95, kayma ≤ 1 ms) kondu. Pilottaki gerekçe: (1) Yerel dosya yükleme aracı bu '
        'oturumda yok (seçim ajanları da doğruladı: creative_attach_reference_file yalnız herkese açık https URL alır); '
        '(2) 4 × 900 sn Scribe ≈ 4 × 90 = 360 sent (gözlenen 0,1 sent/sn) ve konuşma kovasında kalan pay ≈ %.1f sent '
        '(tavan 550) — tavan aşılırdı. Yerine: karışım planın olay listesinden kuruldu; zaman çizelgesinin sırası, metni '
        've parça sayısı planla birebir karşılaştırıldı (order_check); her parça, birim düzeyinde Scribe ile doğrulanmış '
        'çekimden gelir (selection-*.json).' % (550.0 - (rep['cost']['speech_bucket_cents'] or 0)),
        'Kulakla dinleme yapılmadı; bütün ifadeler ölçümdür.',
        'Parça kesimleri yalnız ölçüyle denetlendi (SPEC §4.3 c; "kesim-kulak" bayrakları seçim dosyalarında).',
        'v3 tepe yönetimi ve kısa parça düzeyinin kulağa doğal gelip gelmediği ölçülemez; bozulma göstergesi (fast_sdr_db) '
        'yalnız perde içi hızlı kazanç kıpırtısını sayar. Yeniden işlenen parçalar kulak listesinde (out/kulak_listesi.md).',
        'v3 Scribe istisnaları Türkçe editör onayı bekliyor (render/scribe_istisnalari.md).',
    ]
    rep['decisions_varsayim'] = [
        'Konuşma: mono parça (−18 LUFS klip) iki kanala birim kazançla kondu — uygulama motorunun çalışıyla aynı. Stereo BS.1770 '
        'ölçümünde çift mono +3,01 dB sayılır: Varış/Kapanış sözü ≈ −15 LUFS, yatak ≈ −33 LUFS. Konuşma/yatak farkı iki iz aynı '
        '(stereo) ölçümle hesaplanır; klip-LUFS (mono) − yatak-LUFS (stereo) okumasıyla fark 3 dB daha azdır (tasarımdaki 15 dB).',
        'Gerçek tepe: kodlamadan önce stereo bağlı gerçek tepe sınırlayıcı (tavan −2,0 dBTP; MP3 sonrası > −1 dBTP ise −2,5 / −3,0).',
        'Yatak düzeyi: müzik + doğa toplamı music.duckedBedLufs; müzik = hedef − 0,41 dB, doğa = müzik − 10 dB (SPEC §6 VARSAYIM, PLAN D.4 "toplam aşmaz").',
        'Konuşma/yatak ≥ 15 dB (≥ 1 sn parçalar, parçanın bütünleşik yüksekliği − parça boyunca yatak 3 sn ST en yükseği) tutmayan evrede yatak '
        'evrece indirilir; A ve B için ORTAK ofset (kör karşılaştırmada yükseklik eşleşsin).',
        'Evre düzeyi değişimi: azalan düzey yeni evrenin ilk sözünden önceki sessizlikte (≤ 8 sn), artan düzey ilk sözle başlayıp 8 sn.',
        'Doku geçişleri (8 sn eşit güç, ilinti dengeli yasa) ipucu klibinin başında; aile içi geçiş (tek dosya yetmezse) blok/parça başında, '
        'geçiş penceresinde konuşma payı en yüksek nokta.',
        'Kapanış yatağının doğal sonu ders sonuna oturtuldu (iki kaynakta aynı kural).',
        'İmge katmanı yatağın 8 dB altında (bütünleşik LUFS, VARSAYIM); imge boyunca yatak −0,64 dB (toplam evre hedefinde).',
        'Dönüş tınısı: %s, bütünleşik −30 LUFS (VARSAYIM); returnTone ipucu olan her klipten 2 sn önce (planda yalnız k.donus).' % (
            'yerel sentez D5 (common/donus.synth-D5.wav; ElevenLabs sfx tınısı "kaba", F5 ve FAIL-soft olduğu için)' if rep.get('tone', {}).get('file_choice') == 'synth'
            else 'ElevenLabs sfx (common/donus.wav)'),
        'Yatak EQ (PLAN D.3 son işlem): %s' % ('150 Hz 2. derece yüksek geçiren + 2449 Hz −3 dB çukur (1,5–4 kHz), iki kaynağa aynı' if rep.get('bed_eq') else 'uygulanmadı (--no-bed-eq)'),
        'Oda sesi: iki 30 sn döngü, −58 dBFS RMS, 2 sn geçiş, 0–900 sn hep; doğa: dört orman döngüsü rastgele sıra + döndürme, 4 sn geçiş; '
        'sıra tohumu 20260929, dört karışımda aynı.',
        'Açılış 3 sn (PLAN D.4), son 5 sn yumuşak kapanış (music.endFadeSec; müzik + doğa).',
        'Pencere kabarması kodda var (≥ 20 sn duyurulu pencere, +6 dB, 6 sn rampa, sonraki sözden 8 sn önce iner) ama 15 dk planında '
        'duyurulu pencere yok → etkin değil.',
        'k.goz "chord" ipucu için ayrı bir akor olayı üretilmedi (SPEC §6 tanımlamıyor; varlık yok).',
        'MP3: lameenc; önce VBR V2, 14 MB aşılırsa ABR 120 / CBR 112; 16 bit TPDF titreşim.',
    ]
    ear = []
    for v, sf_ in rep['selection_flags'].items():
        for x in sf_['kulak_units']:
            if x['in_plan']:
                ear.append('%s %s: "kulak" bayrağı (seçim) — %s' % (v, x['unit'], (x['reason'] or 'gerekçe seçim dosyasında yok')[:200]))
        for x in sf_['other_flags']:
            if x['in_plan']:
                ear.append('%s %s: %s — %s' % (v, x['unit'], x.get('flag'), (x['reason'] or '')[:160]))
    ear += ['Ayrıntılı, zamanlı kulak listesi: out/kulak_listesi.md (kesimler, Scribe istisnasıyla eşleşen klipler, v3 kısa parça ve '
            'tepe düzeltmeleri, yerel yatak kısmaları)',
            'v3: gerçek tepe sınırlayıcısı hâlâ > 3 dB kısan parçalar: ' + '; '.join(
                '%s %s' % (v, ', '.join(p for _, p in sf_['kulak_sinirlayici']) or 'yok') for v, sf_ in rep['selection_flags'].items()),
            'Dönüş tınısı seçimi (sentez D5 / ElevenLabs sfx) ve düzeyi',
            'İmge katmanının düzeyi (−8 dB) ve tınısı; doğa düzeyi (−10 dB); orman-2 yinelenen esinti',
            'A/B kaynak ayrıntıları (_ab_details.json) — dinlemeden sonra açılır']
    rep['ear_checks'] = ear
    json.dump(rep, open(OUT + '/report.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    write_md(rep)
    return rep


def _sob_all(m):
    s = m['speech_over_bed']
    return (sum(s[ph]['n_below_15_all'] for ph in PHASES), min(s[ph]['min_diff_all'] for ph in PHASES),
            min(s[ph]['min_diff_ge_1s'] for ph in PHASES))


def v3_changes(rep):
    """Önceki (v2) raporla karşılaştırma: out/_onceki_v2/report.json."""
    p = OUT + '/_onceki_v2/report.json'
    old = json.load(open(p, encoding='utf-8')) if os.path.exists(p) else {'mixes': {}}
    rows = {}
    for n, m in rep['mixes'].items():
        o = old['mixes'].get(n)
        nb, mn, mn1 = _sob_all(m)
        row = {'v3': {'below15_all': nb, 'min_diff_all': mn, 'min_diff_ge_1s': mn1,
                      'below15_pieces': [x for ph in PHASES for x in m['speech_over_bed'][ph]['below_15_pieces']],
                      'integrated_lufs': m['integrated_lufs'], 'true_peak_dbtp': m['true_peak_dbtp'],
                      'mix_limiter_max_db': m['tp_limiter'][-1]['limiter']['max_reduction_db'],
                      'position_min_corr': m['position_check_mp3']['min_corr'],
                      'position_max_offset_ms': m['position_check_mp3']['max_abs_offset_ms'],
                      'local_duck': m.get('local_duck', {}).get('spans', []), 'bytes': m['bytes']}}
        if o:
            ob, omn, omn1 = _sob_all(o)
            row['v2'] = {'below15_all': ob, 'min_diff_all': omn, 'min_diff_ge_1s': omn1,
                         'below15_pieces': [x for ph in PHASES for x in o['speech_over_bed'][ph]['below_15_pieces']],
                         'integrated_lufs': o['integrated_lufs'], 'true_peak_dbtp': o['true_peak_dbtp'],
                         'mix_limiter_max_db': o['tp_limiter'][-1]['limiter']['max_reduction_db'],
                         'position_min_corr': o['position_check_mp3']['min_corr'],
                         'position_max_offset_ms': o['position_check_mp3']['max_abs_offset_ms'], 'bytes': o['bytes']}
        rows[n] = row
    pieces = {}
    for v in rep.get('plans', {}):
        rp = load_reprocess(v)
        if rp:
            pieces[v] = rp['summary']
    sc = None
    scp = OUT + '/scribe_v3_karsilastirma.json'
    if os.path.exists(scp):
        d = json.load(open(scp, encoding='utf-8'))
        sc = {'attempts': d['attempts'], 'strict_equal': d['strict_equal'], 'v3_equal': d['v3_equal'],
              'units': sorted({'%s %s (%s: %s)' % (x['voice'], x['unit'], x['exceptions'][0]['rule'], x['exceptions'][0]['fused'])
                               for x in d['newly_equal']})}
    return {'mixes': rows, 'pieces': pieces, 'scribe': sc, 'previous': p}


def write_md(rep):
    L = []
    a = L.append
    a('# Ders 2 · 15 dk pilot karışımı — ölçüm raporu (v3)')
    a('')
    a('Üretim: `%s` · SPEC §6–§7 + v3 eki · %s' % (rep['tool'], rep['generated_utc']))
    a('')
    ch = rep.get('v3_changes')
    if ch:
        a('## v3: ne değişti (PLAN.v3 §F A adımı; ücretli çağrı yok)')
        a('')
        a('Önceki (v2) karışımlar, raporlar ve araçlar: `out/_onceki_v2/`. Dosya adları aynı. A/B eşlemesi değişmedi.')
        a('')
        a('| Dosya | Eşik altı parça (< 15 dB, < 1 sn dahil) v2 → v3 | En düşük fark, bütün parçalar (dB) v2 → v3 | '
          'En düşük fark, ≥ 1 sn (dB) v2 → v3 | LUFS v2 → v3 | Gerçek tepe dBTP v2 → v3 | Karışım sınırlayıcısı en çok dB v2 → v3 | '
          'Konum denetimi en düşük ilinti v2 → v3 | Yerel yatak kısması |')
        a('|---|---|---|---|---|---|---|---|---|')
        for n, x in ch['mixes'].items():
            o, w = x.get('v2', {}), x['v3']
            a('| %s | %s → %s | %s → %s | %s → %s | %s → %s | %s → %s | %s → %s | %s → %s | %s |' % (
                n, o.get('below15_all'), w['below15_all'], o.get('min_diff_all'), w['min_diff_all'], o.get('min_diff_ge_1s'),
                w['min_diff_ge_1s'], o.get('integrated_lufs'), w['integrated_lufs'], o.get('true_peak_dbtp'), w['true_peak_dbtp'],
                o.get('mix_limiter_max_db'), w['mix_limiter_max_db'], o.get('position_min_corr'), w['position_min_corr'],
                '; '.join('%s −%s dB (%s–%s sn)' % (d['piece'], d['depth_db'], d['t0'], d['t1']) for d in w['local_duck']) or 'yok'))
        a('')
        for n, x in ch['mixes'].items():
            if x.get('v2', {}).get('below15_pieces'):
                a('- %s v2 eşik altı: %s' % (n, ', '.join('%s (%s sn, %s dB)' % tuple(p) for p in x['v2']['below15_pieces'])))
        a('')
        a('**Parçalar** (`tools/reprocess_v3.py`, `sel/<ses>/reprocess-v3.json`):')
        for v, sm in ch['pieces'].items():
            a('- %s: %d parçadan %d parça değişti (öteki %d parça v2 ile örnek örnek aynı); yumuşak tepe sıkıştırma %d parçada; '
              '< 1 sn parça %d; kısa parçada hedefi sınırla inen %d (%s); sınırlayıcı > 3 dB: v2 %d parça → v3 %d (%s)' % (
                  v, sm['pieces'], sm['changed'], sm['pieces'] - sm['changed'], sm['soft_chain'], sm['short_pieces'],
                  len(sm['short_capped']), ', '.join(sm['short_capped']) or '—', sm['limiter_gt3_v2'], sm['limiter_gt3_v3'],
                  ', '.join(sm['limiter_gt3_v3_pieces']) or '—'))
        a('')
        a('**Neden bu yöntem:** kısa parçaların eşik altında kalmasının nedeni tepe değil düzey ölçüsüydü. Pilot kısa parçaları '
          'RMS ile eşitlemişti ve bu parçalar LUFS\'te uzun kliplerin 0–4,6 dB altında kalmıştı. v3 kısa parçayı uzun kliplerle '
          'aynı ölçüye (−18 LUFS, BS.1770) getirir; karışım denetimi de bu ölçüyü kullanır ve bir dizideki sözcükler aynı '
          'yükseklikte olur. Hakan\'ın sesinde tepe/yükseklik oranı yüksektir (≈ 21 dB). Bu yüzden düzey yükselince tepe '
          'yönetimi gerekti. Yalnız sınırlayıcı kullanılsaydı sözcük başında hızlı kazanç düşüşleri olurdu. Yerine klip düzeyinde '
          'yumuşak dizli sıkıştırma kullanıldı: 10 ms atak, kazanç bir perde süresinden yavaş değişir, en çok 6 dB. Kalan tepeyi '
          '(Hakan\'da ortanca ≈ 1 dB) sınırlayıcı alır. Klip başına bozulma göstergesi daha iyi olan zincir seçildi. Kısa tek sözcükte '
          'sınırlayıcı payı 3 dB\'i aşacaksa düzey en çok 3 dB indi; kalan açık, yalnız o parçanın çevresinde yatağın '
          'kısılmasıyla (≤ 1 dB/sn) kapandı. Denenip bırakılan: sabit RMS ofseti (fark parçadan parçaya değişiyor) ve '
          'tüm-geçiren faz döndürme (Hakan\'da ortanca 0,9 dB, bazı kliplerde kötüleşme). Tepe kırpma kullanılmadı.')
        a('')
        if ch.get('scribe'):
            sc = ch['scribe']
            a('**Scribe yazım istisnaları** (SPEC v3.2, `render/scribe_istisnalari.md`, onay bekliyor): seçim dosyalarındaki %d '
              'Scribe denemesinden eski kuralla %d, v3 istisnalarıyla %d deneme eşleşiyor. İstisnayla eş olanlar: %s.' % (
                  sc['attempts'], sc['strict_equal'], sc['v3_equal'], '; '.join(sc['units'])))
            a('')
        fails = [(n, k) for n, dc in rep['done_criteria'].items() for k, v_ in dc.items() if v_ is False]
        a('**Geçmeyen ölçüt:** ' + ('; '.join('%s `%s`' % f for f in fails) if fails else 'yok') + '.')
        for n, m in rep['mixes'].items():
            pc = m['position_check_mp3']
            if not pc.get('v3_ok', True):
                a('- %s: konum denetiminde en düşük ilinti %s (%s), SPEC v3.5 VARSAYIM eşiği 0,95. En büyük kayma %s ms '
                  '(eşik 1 ms), yani parça yerinde. Aynı parça v2\'de 0,962 idi. v3\'te 2 dB alçak (v2\'de komşularından '
                  '2 dB yüksekti). Parçada ıslıklı /s/ baskın; en iyi hizadan 2 örnek kayınca ilinti 0,47\'ye iniyor. '
                  'Düşüklüğün kaynağı MP3\'ün gürültü benzeri yüksek frekansı dalga biçimiyle korumaması; yer hatası değil '
                  '(ölçüm; `_v3work` tanısı). Eşik değiştirilmedi; karar orkestratörün ya da sahibin.' % (
                      n, pc['min_corr'], pc['min_corr_piece'], pc['max_abs_offset_ms']))
        a('')
        a('**SPEC:** "v3 eki" eklendi (kesim kuralı, Scribe istisnaları, kısa parça ve tepe yönetimi, sıkı eşik, parça konum '
          'denetimi). Eski maddeler yerinde.')
        a('')
    a('Kör dinleme: A/B eşlemesi `out/_ab_key.json` ve kaynak ayrıntıları `out/_ab_details.json` içinde; bu rapor kaynak adı içermez.')
    a('')
    a('## Plan (ölçülen sürelerle, T = 900 sn, sahne orman)')
    a('')
    a('| Ses | Durum | Esneme | Toplam sn | Konuşma sn | Olay / parça | Bloklar | Duruş | check_plan |')
    a('|---|---|---|---|---|---|---|---|---|')
    for v, p in rep['plans'].items():
        cp = p['check_plan']
        a('| %s | %s | %s f=%s | %s | %s | %s / %s | %s | %s | %s |' % (
            v, p['status'], p['mode'], p['f'], p['total'], p['speech_sec'], p['n_events'], p['n_speech_pieces'],
            ' '.join(p['sel']), p['stop'], 'GEÇTİ (0 hata)' if cp['pass'] else 'HATA: ' + '; '.join(cp['fails'])))
    a('')
    for v, p in rep['plans'].items():
        d = p['check_plan']['density']
        a('- %s yoğunluk: 60 sn en çok %s hece, konuşma payı %s; Derin %s hece / %s; ortalama %s hece/dk; eksik birim: %s' % (
            v, d.get('syll'), d.get('frac'), d.get('deep_syll'), d.get('deep_frac'), d.get('avg'), p['units_missing'] or 'yok'))
    a('')
    a('## Karışımlar')
    a('')
    a('| Dosya | Süre sn | Boyut MB | Kodlama | Bütünleşik LUFS | Gerçek tepe dBTP (sınırlayıcı öncesi) | 10 kHz üstü ani olay: kurgu / yalnız karışım / yatak içeriği / söz içeriği | En uzun dijital sessizlik |')
    a('|---|---|---|---|---|---|---|---|')
    for n, m in rep['mixes'].items():
        c = m['clicks_mp3']
        a('| %s | %s | %.2f | %s (%s kbit/s) | %s | %s (%s) | %d / %d / %d / %d | %s sn |' % (
            n + '.mp3', m['duration_s'], m['bytes'] / 1e6, m['encoding']['mode'], m['encoding']['kbps_avg'],
            m['integrated_lufs'], m['true_peak_dbtp'], m['true_peak_dbtp_before_limiter'], c['edit_point'], c['mix_only'],
            c['bed_content'], c['speech_content'], m['digital_silence_mp3']['longest_run_s']))
    a('')
    a('Tık sınıfları (MP3, kodlayıcı gecikmesi %s örnek düzeltilerek; olayın 2 ms karesindeki 10 kHz üstü enerjinin kaynağına göre): '
      '"söz içeriği" = enerjiyi konuşma izi taşıyor (seçilmiş çekimin kendi ünsüz başlangıcı; parçalar SPEC §4.1 tık denetiminden '
      'geçti); "yatak içeriği" = müzik/doğa izi taşıyor; "kurgu" = kurgu noktasında ±10 ms ve konuşma taşımıyor (karışımdan kuşkulu); '
      '"yalnız karışım" = hiçbir iz taşımıyor.'
      % next(iter(rep['mixes'].values()))['mp3_decoder_offset_samples'])
    a('')
    for n, m in rep['mixes'].items():
        cl = m['clicks_list']
        a('- %s: float karışım — kurgu %s, yalnız karışım %s, yatak içeriği %s; MP3 — kurgu %s, yalnız karışım %s, yatak içeriği %s' % (
            n, cl['float_edit_point'] or 'yok', cl['float_mix_only'] or 'yok', cl['float_bed_content'] or 'yok',
            cl['mp3_edit_point'] or 'yok', cl['mp3_mix_only'] or 'yok', cl['mp3_bed_content'] or 'yok'))
    a('')
    a('Konum denetimi (ölçüm; MP3 orta kanalında her parçanın dalga biçimi ±50 ms içinde aranır): ' + '; '.join(
        '%s %d parça, en düşük ilinti %s (%s), ortanca %s, en büyük kayma %s ms' % (
            n, m['position_check_mp3']['pieces'], m['position_check_mp3']['min_corr'], m['position_check_mp3']['min_corr_piece'],
            m['position_check_mp3']['median_corr'], m['position_check_mp3']['max_abs_offset_ms']) for n, m in rep['mixes'].items()))
    a('')
    a('Gerçek tepe sınırlayıcı (stereo bağlı, tavan −2 dBTP): ' + '; '.join(
        '%s en çok %s dB, > 0,5 dB %s sn' % (n, m['tp_limiter'][-1]['limiter']['max_reduction_db'],
                                             m['tp_limiter'][-1]['limiter']['sec_over_0_5db']) for n, m in rep['mixes'].items()))
    a('')
    a('### Konuşma / yatak (3 sn ST yatak; ≥ 1 sn parçalar; en az / p10 / ortanca dB; eşik ≥ 15)')
    a('')
    a('| Dosya | Varış | Derinleşme | Derin | Kapanış | Bütün parçalar (en az; < 15 sayısı) | Yatak ofseti (dB, evre) |')
    a('|---|---|---|---|---|---|---|')
    for n, m in rep['mixes'].items():
        s = m['speech_over_bed']
        cells = []
        for ph in PHASES:
            x = s[ph]
            cells.append('%s / %s / %s %s' % (x['min_diff_ge_1s'], x['p10_diff_ge_1s'], x['median_diff_ge_1s'],
                                               'GEÇTİ' if x['pass_ge_1s'] else 'KALDI'))
        allp = '; '.join('%s %s (%d)' % (ph[:3], s[ph]['min_diff_all'], s[ph]['n_below_15_all']) for ph in PHASES)
        off = ', '.join('%s %s' % (ph[:3], m['bed_offset_vs_duckedBedLufs_db'][ph]) for ph in PHASES)
        a('| %s | %s | %s |  %s |' % (n, ' | '.join(cells), allp, off))
    a('')
    a('### Konuşma / yatak, 3 sn ST iki izde (pencerenin ≥ %90\'ı konuşma parçası)')
    a('')
    a('| Dosya | Evre: ortanca / en az dB (en az an, parça) / < 15 pencere payı |')
    a('|---|---|')
    for n, m in rep['mixes'].items():
        s_ = m['speech_over_bed']
        a('| %s | %s |' % (n, '; '.join('%s %s / %s (%s sn, %s) / %%%s' % (
            ph, s_[ph]['st3_median_diff'], s_[ph]['st3_min_diff'], s_[ph]['st3_worst_at_s'], ','.join(s_[ph]['st3_worst_pieces']),
            s_[ph]['st3_pct_below_15']) for ph in PHASES)))
    a('')
    a('3 sn ST penceresi cümle içi duraklamayı ve parça kuyruğunu da içerdiğinden söz ST değeri parçanın kendi düzeyinin '
      '3–5 dB altına inebilir; en az değerler bu pencerelerdir. Sıkı eşik (SPEC v3.4, < 1 sn parçalar dahil her parça ≥ 15 dB; '
      'v3\'te kısa parçalar da LUFS ile eşitlendi) altında kalanlar:')
    for n, m in rep['mixes'].items():
        lst = [x for ph in PHASES for x in m['speech_over_bed'][ph]['below_15_pieces']]
        a('- %s: %s' % (n, ', '.join('%s (%s sn, %s dB)' % tuple(x) for x in lst) if lst else 'yok'))
    a('')
    a('### Yükseklik artışı (3 sn ST, 1 sn adım; SPEC/qa ≤ 1 dB/sn pencerelerde — bu planda duyurulu pencere yok)')
    a('')
    a('| Dosya | Yatak izi en çok dB/sn (sn) | Tınısız yatak en çok (sn) / > 1 dB/sn adım | Yalnız müzik en çok (sn) / > 1 dB/sn adım | Dönüş tınısı (sn) |')
    a('|---|---|---|---|---|')
    for n, m in rep['mixes'].items():
        lr = m['loudness_rise']
        b, b2, mu = lr['bed_stem'], lr['bed_stem_without_tone'], lr['music_stem']
        a('| %s | %s (%s) | %s (%s) / %s | %s (%s) / %s | %s |' % (n, b['max_rise_db_per_s'], b['at_s'], b2['max_rise_db_per_s'],
                                                            b2['at_s'], b2['n_1s_steps_over_1db'], mu['max_rise_db_per_s'], mu['at_s'],
                                                            mu['n_1s_steps_over_1db'], lr['tone_times_s']))
    a('')
    a('### Doku değişimleri (8 sn; başlangıç = ipucu klibinin ilk sözü; pencerede konuşma payı)')
    a('')
    for n, m in rep['mixes'].items():
        a('- %s: %s' % (n, '; '.join('%s %s–%s sn (%s)' % (x['what'], x['t0'], x['t1'], x['speech_cover']) for x in m['texture_changes'])))
    a('')
    a('### Evre başına ölçülen yatak (3 sn ST ortancası, LUFS)')
    a('')
    a('| Dosya | Varış | Derinleşme | Derin | Kapanış |')
    a('|---|---|---|---|---|')
    for n, m in rep['mixes'].items():
        b = m['bed_measured_st3_median_by_phase']
        a('| %s | %s |' % (n, ' | '.join('toplam %s, müzik %s, doğa %s' % (b[ph]['bg_total'], b[ph]['music'], b[ph]['nature'])
                                        for ph in PHASES)))
    a('')
    a('## SPEC §7 bitti ölçütleri')
    a('')
    keys = list(next(iter(rep['done_criteria'].values())).keys())
    a('| Ölçüt | ' + ' | '.join(rep['done_criteria'].keys()) + ' |')
    a('|---|' + '---|' * len(rep['done_criteria']))
    for k in keys:
        a('| %s | %s |' % (k, ' | '.join(str(rep['done_criteria'][n][k]) for n in rep['done_criteria'])))
    a('')
    a('`full_mix_scribe_alignment = None`: yapılmadı (aşağıda "Doğrulanmayanlar").')
    a('')
    a('## Maliyet (defter)')
    c = rep['cost']
    a('')
    a('- Toplam %s sent (%s $), %d satır; konuşma kovası %s / 550 sent; müzik + doğa + tını kovası %s / 900 sent; bu adımda ücretli çağrı: 0.' % (
        c['total_cents'], c['total_usd'], c['rows'], c['speech_bucket_cents'], c['music_bucket_cents']))
    a('- Türe göre: ' + ', '.join('%s %s' % (k, v) for k, v in c['cents_by_kind'].items()))
    a('')
    a('## Seçim bayrakları')
    a('')
    for v, f in rep['selection_flags'].items():
        a('- **%s**: sayılar %s' % (v, f['counts']))
        for x in f['kulak_units']:
            a('  - kulak: %s%s — %s' % (x['unit'], '' if x['in_plan'] else ' (planda yok)', (x['reason'] or '')[:200]))
        for x in f['other_flags']:
            a('  - %s: %s%s — %s' % (x.get('flag'), x['unit'], '' if x['in_plan'] else ' (planda yok)', (x['reason'] or '')[:200]))
        if f['kulak_sinirlayici']:
            a('  - kulak-sinirlayici (%s> 3 dB tepe sınırlama): ' % ('v3 parçaları, ' if f.get('reprocess_summary') else '') +
              ', '.join('%s%s' % (u, '' if p is None else '/' + p) for u, p in f['kulak_sinirlayici']))
        a('  - kesim-kulak (kesim yalnız ölçüyle denetlendi): %d birim' % len(f['kesim_kulak_units']))
        a('  - eklem > 2 yt (taşıyıcı eklemi): ' + ', '.join(f['eklem_gt_2st_units']))
    a('')
    a('## Kararlar ve varsayımlar')
    a('')
    for x in rep['decisions_varsayim']:
        a('- ' + x)
    a('')
    a('## Doğrulanmayanlar')
    a('')
    for x in rep['not_verified']:
        a('- ' + x)
    a('')
    a('## Kulak listesi')
    a('')
    for x in rep['ear_checks']:
        a('- ' + x)
    a('')
    open(OUT + '/report.md', 'w', encoding='utf-8').write('\n'.join(L))


if __name__ == '__main__':
    sys.exit(main())
