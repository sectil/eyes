#!/usr/bin/env python3
"""test_audio.py — audio.py sınamaları. Çalıştır: python3 test_audio.py   (hepsi geçmezse çıkış kodu 1)

Gerçek veri: yoga/hiz/*.mp3 (7 ElevenLabs Türkçe okuması, 76 hece). Yapay veri: bilinen zamanlı sözcük/duraklama.
Seviye ve gerçek tepe denetimleri audio.py'den BAĞIMSIZ kodla (pyloudnorm + 4× resample_poly) yeniden ölçülür.
"""
import glob
import json
import os
import shutil
import subprocess
import sys
import time
import traceback

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy.signal import butter, resample_poly, sosfiltfilt

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import audio  # noqa: E402

Y = os.path.abspath(os.path.join(HERE, '..', '..'))
HIZ = sorted(glob.glob(os.path.join(Y, 'hiz', '*.mp3')))
UNITS = os.path.join(Y, 'render', 'units.json')
TMP = os.path.join(HERE, '_test_tmp')
AUDIO = os.path.join(HERE, 'audio.py')
SR = 44100
# PLAN.v2 §D.1.1 ölçülmüş eklemleme (76 hece)
PLAN_RATE = {'nes-v4': 5.63, 'nes-duz': 6.61, 'hak-duz': 6.52}

RESULTS = []


def cli(*args):
    p = subprocess.run([sys.executable, AUDIO] + [str(a) for a in args], capture_output=True, text=True)
    out = p.stdout
    js = None
    try:
        js = json.loads(out[:out.rindex('}') + 1] if '}' in out else out)
    except Exception:
        try:
            js = json.loads(out)
        except Exception:
            js = None
    return p.returncode, js, out, p.stderr


def sex_of(path):
    return 'm' if os.path.basename(path).startswith('hak') else 'f'


def name_of(path):
    return os.path.splitext(os.path.basename(path))[0]


# ------------------------------------------------------------------------------------------ bağımsız ölçüler
def ind_lufs(x):
    return pyln.Meter(SR).integrated_loudness(x)


def ind_tp(x):
    return 20 * np.log10(max(np.max(np.abs(resample_poly(x, 4, 1))), np.max(np.abs(x))))


def ind_edges(x, thr_db=-50.0, sustain_ms=20):
    """10 ms kayan RMS > thr, en az 20 ms süren ilk/son koşu (örnek)."""
    w = 441
    e = np.convolve(x * x, np.ones(w) / w, mode='same')
    m = 10 * np.log10(np.maximum(e, 1e-24)) > thr_db
    d = np.diff(np.concatenate([[0], m.astype(int), [0]]))
    st, en = np.where(d == 1)[0], np.where(d == -1)[0]
    k = (en - st) >= int(sustain_ms * SR / 1000)
    return st[k][0], en[k][-1]


# ------------------------------------------------------------------------------------------ yapay sinyaller
def word(dur, f0, amp=0.2, gaps=(), rng=None):
    t = np.arange(int(dur * SR)) / SR
    s = np.zeros_like(t)
    for k in range(1, 25):
        if k * f0 > 5000:
            break
        s += np.sin(2 * np.pi * k * f0 * t + 0.3 * k) / k
    s *= amp / np.max(np.abs(s))
    env = np.ones_like(t)
    r = int(0.02 * SR)
    env[:r] = 0.5 - 0.5 * np.cos(np.pi * np.arange(r) / r)
    env[-r:] = env[:r][::-1]
    for a, b in gaps:     # sözcük içi kısa kapanma (duraklama sayılmamalı)
        ia, ib = int(a * SR), int(b * SR)
        env[ia:ib] = 0.0
    return s * env


def synth(layout, noise_db=-90.0, seed=1):
    """layout: [('sil', dur) | ('word', dur, f0, gaps) | ('breath', dur, level_db)]"""
    rng = np.random.default_rng(seed)
    parts, marks, t = [], [], 0.0
    for it in layout:
        if it[0] == 'sil':
            parts.append(np.zeros(int(it[1] * SR)))
        elif it[0] == 'word':
            parts.append(word(it[1], it[2], gaps=it[3] if len(it) > 3 else ()))
        elif it[0] == 'breath':
            nz = sosfiltfilt(butter(4, [500, 5000], 'bandpass', fs=SR, output='sos'), rng.standard_normal(int(it[1] * SR)))
            nz *= 10 ** (it[2] / 20) / np.sqrt(np.mean(nz ** 2))
            r = int(0.03 * SR)
            nz[:r] *= np.linspace(0, 1, r)
            nz[-r:] *= np.linspace(1, 0, r)
            parts.append(nz)
        marks.append((it[0], t, t + it[1]))
        t += it[1]
    x = np.concatenate(parts)
    x += rng.standard_normal(len(x)) * 10 ** (noise_db / 20)
    return x, marks


# ------------------------------------------------------------------------------------------ testler
def test_analyze_real():
    """analyze: 7 gerçek okuma; alanlar, kusursuzluk, F0 aralığı, PLAN D.1.1 eklemleme ile uyum."""
    assert len(HIZ) == 7, HIZ
    rows = []
    for p in HIZ:
        code, r, out, err = cli('analyze', p, '--syll', 76, '--phase', 'Varış', '--sex', sex_of(p))
        assert code == 0, (p, err)
        for k in ('duration', 'speech_sec', 'articulation', 'pauses', 'f0_mean_hz', 'f0_sd_semitones',
                  'sibilance_ratio', 'clipping', 'dc', 'lufs', 'rms_db', 'clicks'):
            assert k in r, (p, k)
        assert abs(r['duration'] - sf.info(p).duration) < 0.01
        assert r['clipping']['clipped'] is False and r['clipping']['count'] == 0, (p, r['clipping'])
        assert r['clicks']['count'] == 0, (p, r['clicks'])
        lo, hi = (80, 150) if sex_of(p) == 'm' else (150, 300)
        assert lo <= r['f0_mean_hz'] <= hi, (p, r['f0_mean_hz'])
        assert 0.3 < r['f0_sd_semitones'] < 6, (p, r['f0_sd_semitones'])
        assert 0 < r['sibilance_ratio'] < 0.5
        assert all(e - s >= 0.15 - 1e-6 for s, e in r['pauses'])
        n = name_of(p)
        if n in PLAN_RATE:
            assert abs(r['articulation'] - PLAN_RATE[n]) <= 0.15, (n, r['articulation'], PLAN_RATE[n])
        rows.append('%-8s dur %6.2f speech %6.2f art %.2f (PLAN %s) f0 %5.1f Hz sd %.2f yt sib %.4f lufs %.1f tp %.1f pauses %d'
                    % (n, r['duration'], r['speech_sec'], r['articulation'], PLAN_RATE.get(n, '-'), r['f0_mean_hz'],
                       r['f0_sd_semitones'], r['sibilance_ratio'], r['lufs'], r['true_peak_dbtp'], len(r['pauses'])))
    return rows


def test_clicks_injected():
    """Tık dedektörü: temiz okumada 0; eklenen dürtü/ek yeri ve kodlama öncesi (bant sınırlı) sessizlik tıkı bulunur."""
    rows = []
    for n in ('nes-v4', 'hak-duz', 'nes-duz', 'nes-v3'):
        x, sr = audio.load(os.path.join(Y, 'hiz', n + '.mp3'))
        assert audio.detect_clicks(x, sr)[0] == 0
        pos = (0.05, 3.0, 6.0, 9.0)
        for a in (0.02, 0.005):
            y = x.copy()
            for t in pos:
                y[int(t * sr)] += a
            c, ts, _ = audio.detect_clicks(y, sr)
            if n != 'nes-v3':   # nes-v3: güçlü ıslıklı sesin içindeki küçük dürtü maskelenebilir (belgelenmiş sınır)
                assert c == 4 and all(abs(a_ - b_) < 0.004 for a_, b_ in zip(ts, pos)), (n, a, ts)
            rows.append('%s dürtü %.3f: %d/4 bulundu %s' % (n, a, c, ts))
        k = int(5.0 * sr)
        y = np.concatenate([x[:k], x[k + 137:]])
        c, ts, _ = audio.detect_clicks(y, sr)
        if n != 'nes-v3':
            assert c == 1 and abs(ts[0] - 5.0) < 0.004, (n, ts)
        rows.append('%s ek yeri (137 örnek atlama) 5.0 sn: %s' % (n, ts))
        a_ = audio.analyze_array(x, sr, 76, 'Varış', sex_of(n))
        mids = [(s + e) / 2 for s, e in a_['pauses'][:3]]
        imp = np.zeros_like(x)
        for t in mids:
            imp[int(t * sr)] = 0.02
        imp = sosfiltfilt(butter(8, 15000, 'lowpass', fs=sr, output='sos'), imp)
        c, ts, _ = audio.detect_clicks(x + imp, sr)
        assert c == len(mids) and all(abs(a_ - b_) < 0.004 for a_, b_ in zip(ts, mids)), (n, mids, ts)
        rows.append('%s bant sınırlı tık (duraklama ortası) %d/%d' % (n, c, len(mids)))
    return rows


PROC = {}


def test_process_real():
    """process: 7 gerçek okuma → −18 LUFS ±0,5, gerçek tepe ≤ −1,5 dBTP (bağımsız ölçüm), 44,1 kHz mono float,
    baş 60 ms / son 250 ms pay, tık yok, eklemleme korunur."""
    rows = []
    os.makedirs(TMP, exist_ok=True)
    for p in HIZ:
        n = name_of(p)
        out = os.path.join(TMP, 'proc_%s.wav' % n)
        code, r, o, err = cli('process', p, '--out', out, '--sex', sex_of(p))
        assert code == 0, (n, o, err)
        info = sf.info(out)
        assert (info.samplerate, info.channels, info.subtype) == (44100, 1, 'FLOAT'), (n, info)
        y, _ = sf.read(out, dtype='float64')
        L, tp = ind_lufs(y), ind_tp(y)
        assert abs(L + 18.0) <= 0.5, (n, L)
        assert tp <= -1.5, (n, tp)
        a, b = ind_edges(y)
        lead_ms, tail_ms = a / SR * 1000, (len(y) - b) / SR * 1000
        assert abs(lead_ms - 60) <= 10, (n, lead_ms)
        assert abs(tail_ms - 250) <= 15, (n, tail_ms)
        assert abs(np.mean(y)) < 1e-4
        assert np.max(np.abs(y)) < 0.999
        an = audio.analyze_array(y, SR, 76, 'Varış', sex_of(p))
        assert an['clicks']['count'] == 0, (n, an['clicks'])
        src = audio.analyze_array(audio.load(p)[0], SR, 76, 'Varış', sex_of(p))
        assert abs(an['articulation'] - src['articulation']) <= 0.1, (n, an['articulation'], src['articulation'])
        PROC[n] = {'file': out, 'rms_db': an['rms_db']}
        rows.append('%-8s LUFS %.2f  TP %.2f dBTP  baş %.0f ms son %.0f ms  sınırlayıcı %.2f dB (%.2f sn > 1 dB)  de-ess %s %s  %s'
                    % (n, L, tp, lead_ms, tail_ms, r['limiter_max_db'], r['limiter_sec_over_1db'], r['deess']['applied'],
                       r['deess']['max_reduction_db'], r.get('flag', '')))
    return rows


def test_process_short():
    """< 1 sn parça: referans konuşma RMS'ine (±0,5 dB), --micro ile +1 dB; referanssız çıkış 3."""
    if 'nes-uc' not in PROC:
        test_process_real()
    ref = PROC['nes-uc']['rms_db']
    x, sr = audio.load(os.path.join(Y, 'hiz', 'nes-uc.mp3'))
    info = audio.find_pauses(x, sr, None, 'f')
    k = len(info['gaps']) + 1
    cuts, meta, _ = audio.plan_cuts(x, sr, k, info['thr_db'], 'f', info)
    parts, _ = audio.split_at(x, cuts, sr)
    short = None
    for i, pc in enumerate(parts):
        on, off, *_ = audio.activity(pc, sr, info['thr_db'])
        if on is not None and (off - on) + 0.31 < 0.95:
            short = (i, pc, off - on)
            break
    assert short is not None, 'nes-uc içinde < 1 sn parça yok'
    src = os.path.join(TMP, 'short_src.wav')
    audio.write_wav(src, short[1])
    rows = ['nes-uc parça %d (konuşma %.3f sn), referans rms %.2f dB' % (short[0] + 1, short[2], ref)]
    for micro, want in ((False, ref), (True, ref + 1.0)):
        out = os.path.join(TMP, 'short_%s.wav' % ('micro' if micro else 'norm'))
        args = ['process', src, '--out', out, '--sex', 'f', '--ref-rms-db', ref] + (['--micro'] if micro else [])
        code, r, o, err = cli(*args)
        assert code == 0, (o, err)
        y, _ = sf.read(out, dtype='float64')
        assert r['level_mode'] == 'rms' and len(y) / SR < 1.0
        got = audio.speech_rms_db(y, SR)
        assert abs(got - want) <= 0.5, (micro, got, want)
        assert ind_tp(y) <= -1.5
        rows.append('micro=%s: süre %.3f sn, konuşma RMS %.2f (hedef %.2f), TP %.2f' % (micro, len(y) / SR, got, want, ind_tp(y)))
    code, r, o, err = cli('process', src, '--out', os.path.join(TMP, 'short_x.wav'), '--sex', 'f')
    assert code == 3 and 'ref-rms-db' in (r or {}).get('error', ''), (code, o)
    rows.append('referanssız kısa klip → çıkış 3: %s' % r['error'])
    return rows


def test_deess():
    """De-ess yalnız gerekince: sert yapay ıslıklıda uygulanır ve ≤ 4 dB; nes-v4'te uygulanmaz; hak-v3'te ≤ 4 dB."""
    rows = []
    rng = np.random.default_rng(3)
    v = word(2.0, 180)
    s = sosfiltfilt(butter(4, [5500, 8500], 'bandpass', fs=SR, output='sos'), rng.standard_normal(len(v)))
    env = np.zeros_like(v)
    for c in (0.4, 1.0, 1.6):
        env[int((c - 0.06) * SR):int((c + 0.06) * SR)] = 1.0
    ref = audio.speech_rms_db(v, SR)
    s *= 10 ** ((ref + 12) / 20) / np.sqrt(np.mean(s[env > 0] ** 2))
    x = v + s * env
    y, info = audio.deess(x, SR, audio.speech_rms_db(x, SR))
    assert info['applied'] and 0 < info['max_reduction_db'] <= audio.DEESS_MAX_DB + 1e-9, info
    rows.append('yapay sert ıslıklı: uygulandı, en çok %.2f dB, %.3f sn' % (info['max_reduction_db'], info['time_reduced_sec']))
    for n, want in (('nes-v4', False), ('hak-v3', True)):
        x, _ = audio.load(os.path.join(Y, 'hiz', n + '.mp3'))
        z = audio.hpf(x, SR, sex_of(n))
        _, info = audio.deess(z, SR, audio.speech_rms_db(z, SR))
        assert info['applied'] is want and info['max_reduction_db'] <= audio.DEESS_MAX_DB, (n, info)
        rows.append('%s: uygulandı=%s en çok %.2f dB (bant tepe − eşik %.2f dB)' % (n, info['applied'], info['max_reduction_db'],
                                                                                info['band_peak_over_thr_db']))
    return rows


def test_cut_synthetic():
    """cut: 3 sözcük + 2 duraklama → 3 parça doğru zamanda; 5 istenince çıkış 2; 80 ms iç kapanma duraklama sayılmaz."""
    rows = []
    x, marks = synth([('sil', 0.2), ('word', 0.5, 150), ('sil', 0.4), ('word', 0.7, 160, [(0.30, 0.38)]),
                      ('sil', 0.6), ('word', 0.6, 170), ('sil', 0.3)])
    src = os.path.join(TMP, 'syn3.wav')
    audio.write_wav(src, x)
    exp = [0.9, 2.1]
    od = os.path.join(TMP, 'cut3')
    code, r, o, err = cli('cut', src, '--n', 3, '--outdir', od, '--names', 'a,b,c', '--sylls', '2,3,2')
    assert code == 0, (o, err)
    assert len(r['pauses']) == 2, r['pauses']
    assert len(r['cuts']) == 2 and all(abs(c - e) <= 0.012 for c, e in zip(r['cuts'], exp)), r['cuts']
    total = 0
    for nm in 'abc':
        fp = os.path.join(od, nm + '.wav')
        inf = sf.info(fp)
        assert (inf.samplerate, inf.channels, inf.subtype) == (44100, 1, 'FLOAT')
        z, _ = sf.read(fp, dtype='float64')
        assert abs(z[0]) < 1e-4 and abs(z[-1]) < 1e-4
        total += len(z)
    assert total == len(x)
    rows.append('K=3: kesimler %s (beklenen %s), duraklamalar %s, parçalar a,b,c yazıldı' % (r['cuts'], exp, r['pauses']))
    code, r, o, err = cli('cut', src, '--n', 5, '--outdir', os.path.join(TMP, 'cut5'))
    assert code == 2 and r['ok'] is False, (code, o)
    rows.append('K=5: çıkış %d, "%s"' % (code, r['error']))
    code, r, o, err = cli('cut', src, '--n', 2, '--outdir', os.path.join(TMP, 'cut2'))
    assert code == 0 and len(r['cuts']) == 1 and abs(r['cuts'][0] - 2.1) <= 0.012, r
    rows.append('K=2: en uzun duraklama seçildi, kesim %s' % r['cuts'])
    # nefesli boşluk: 0,20 sessizlik + 0,25 nefes + 0,20 sessizlik (toplam 0,65) > 0,35 düz duraklama
    x, marks = synth([('sil', 0.2), ('word', 0.5, 150), ('sil', 0.2), ('breath', 0.25, -44.0), ('sil', 0.2),
                      ('word', 0.6, 160), ('sil', 0.35), ('word', 0.5, 170), ('sil', 0.3)])
    src = os.path.join(TMP, 'synb.wav')
    audio.write_wav(src, x)
    code, r, o, err = cli('cut', src, '--n', 2, '--outdir', os.path.join(TMP, 'cutb'))
    assert code == 0, (o, err)
    assert len(r['breaths']) == 1, r
    c = r['cuts'][0]
    breath = [m for m in marks if m[0] == 'breath'][0]
    sil_runs = [(0.7, 0.9), (1.15, 1.35)]
    assert any(a + 0.02 <= c <= b - 0.02 for a, b in sil_runs) and not (breath[1] <= c <= breath[2]), (c, breath)
    rows.append('nefesli boşluk: nefes %s bulundu, kesim %.3f sn saf sessizlikte (nefes %.2f–%.2f)' % (r['breaths'], c, breath[1], breath[2]))
    return rows


def test_normtext():
    """normtext/compare: üç nokta, rakam, İ/ı, tırnak, kesme, düzeltme işareti; farkta çıkış 1 ve sözcük farkı."""
    rows = []
    cases_eq = [
        ('Sağ elin başparmağı…', 'sağ elin başparmağı'),
        ('on… dokuz…', '10 9'),
        ('sayıyorum: on… dokuz… sekiz… yedi… altı… beş… dört… üç… iki… bir.', 'Sayıyorum on, dokuz, sekiz, 7, 6, 5, 4, 3, 2, 1'),
        ('İstediğin an gözlerini açabilir', 'istediğin an gözlerini açabilir'),
        ('IŞIK', 'ışık'),
        ('Aklına bir şey gelmezse önerim şu: "Kendime dinlenmeye izin veriyorum."',
         'aklına bir şey gelmezse önerim şu kendime dinlenmeye izin veriyorum'),
        ("Ahmet'in", 'ahmetin'),
        ('hâlâ', 'hala'),
        ('omurga, boydan boya…', 'Omurga — boydan boya...'),
    ]
    for a, b in cases_eq:
        code, r, o, err = cli('compare', a, b)
        assert code == 0 and r['equal'] is True, (a, b, o)
    assert audio.normtext('İnce ILIK ırmak') == ['ince', 'ılık', 'ırmak']
    assert audio.normtext('İnce') != audio.normtext('Ince')
    assert audio.normtext('on… dokuz…') == ['on', 'dokuz'] == audio.normtext('10 9')
    code, r, o, err = cli('normtext', 'Sağ elin başparmağı… İŞARET parmağı…')
    assert code == 0 and r == ['sağ', 'elin', 'başparmağı', 'işaret', 'parmağı'], o
    rows.append('eşit sayılan %d çift geçti; normtext("Sağ elin başparmağı… İŞARET parmağı…") = %s' % (len(cases_eq), r))
    for a, b in (('bilek… ön kol…', 'bilek önkol'), ('on dokuz', '10 8'), ('Sağ elin başparmağı', 'sol elin başparmağı'),
                 ('bir iki üç', 'bir iki')):
        code, r, o, err = cli('compare', a, b)
        assert code == 1 and r['equal'] is False and r['diff'], (a, b, o)
        rows.append('fark: %r ~ %r → çıkış 1, %s' % (a, b, [(d['op'], d['a'], d['b']) for d in r['diff']]))
    return rows


def test_f0():
    """YIN doğruluğu (yapay harmonik ton ±%1) ve f0step (2 yarım ton)."""
    rows = []
    for f, sx in ((110, 'm'), (180, 'f'), (250, 'f')):
        x = np.concatenate([np.zeros(int(0.2 * SR)), word(1.0, f), np.zeros(int(0.2 * SR))])
        t, fr, v = audio.voiced_f0(x, SR, sx)
        m, sd, geo, nv = audio.f0_stats(fr, v)
        assert abs(m - f) / f < 0.01 and sd < 0.1, (f, m, sd)
        rows.append('ton %d Hz → %.2f Hz, yayılım %.3f yt, %d sesli kare' % (f, m, sd, nv))
    a = np.concatenate([np.zeros(int(0.2 * SR)), word(1.0, 200.0), np.zeros(int(0.3 * SR))])
    b = np.concatenate([np.zeros(int(0.2 * SR)), word(1.0, 200.0 * 2 ** (2 / 12)), np.zeros(int(0.3 * SR))])
    fa, fb = os.path.join(TMP, 'f0a.wav'), os.path.join(TMP, 'f0b.wav')
    audio.write_wav(fa, a)
    audio.write_wav(fb, b)
    code, r, o, err = cli('f0step', fa, fb, '--sex', 'f')
    assert code == 0 and abs(r['step_st'] - 2.0) <= 0.1, o
    rows.append('f0step 200 → 224,5 Hz: %.2f yt (sınır %.1f, pass=%s)' % (r['step_st'], r['limit_st'], r['pass']))
    code, r, o, err = cli('f0step', fa, fa, '--sex', 'f')
    assert code == 0 and abs(r['step_st']) <= 0.1 and r['pass'] is True, o
    rows.append('f0step aynı ton: %.2f yt' % r['step_st'])
    return rows


def test_rank_real():
    """rank: gerçek okumalar; tıklı ve kırpılmış çekim zorunlu ölçütle elenir; bantta olan öne geçer."""
    rows = []
    d = os.path.join(TMP, 'rank_real')
    os.makedirs(d, exist_ok=True)
    for f in glob.glob(os.path.join(d, 't*.mp3')):
        os.remove(f)
    shutil.copy(os.path.join(Y, 'hiz', 'nes-duz.mp3'), os.path.join(d, 't1.mp3'))
    shutil.copy(os.path.join(Y, 'hiz', 'nes-v4.mp3'), os.path.join(d, 't2.mp3'))
    shutil.copy(os.path.join(Y, 'hiz', 'nes-uc.mp3'), os.path.join(d, 't3.mp3'))
    x, sr = audio.load(os.path.join(Y, 'hiz', 'nes-v4.mp3'))
    a = audio.analyze_array(x, sr, 76, 'Varış', 'f')
    y = x.copy()
    for s, e in a['pauses'][:3]:
        y[int((s + e) / 2 * sr)] += 0.05
    sf.write(os.path.join(d, 't4.mp3'), y.astype(np.float32), sr, format='MP3', subtype='MPEG_LAYER_III')
    sf.write(os.path.join(d, 't5.mp3'), np.clip(x * 4.0, -1, 1).astype(np.float32), sr, format='MP3', subtype='MPEG_LAYER_III')
    unit = {'id': 'test.clip', 'kind': 'clip', 'tts': 'x', 'sentences': ['x'], 'phase': 'Varış', 'syllables': 76}
    code, r, o, err = cli('rank', d, '--unit-json', json.dumps(unit), '--sex', 'f')
    assert code == 0, (o, err)
    ex = {e['take']: e['reasons'] for e in r['excluded']}
    assert 't4.mp3' in ex and any('tık' in s for s in ex['t4.mp3']), ex
    assert 't5.mp3' in ex and any('kırpılma' in s for s in ex['t5.mp3']), ex
    order = [q['take'] for q in r['ranking']]
    assert order[0] == 't2.mp3' and set(order) == {'t1.mp3', 't2.mp3', 't3.mp3'}, order
    for q in r['ranking']:
        assert q['reasons'] and 'score' in q
    rows.append('sıra %s; elenen %s' % (order, {k: v[0][:40] for k, v in ex.items()}))
    for q in r['ranking']:
        rows.append('  %d %s puan %.2f ihlal %s eklemleme %.2f' % (q['rank'], q['take'], q['score'], q['soft_violations'],
                                                               q['metrics']['articulation']))
    return rows


def test_rank_carrier_synthetic():
    """rank (taşıyıcı): kesim tutmayan çekim elenir; F0 eklemi > 2 yt olan geçerli çekimin arkasına düşer."""
    rows = []
    d = os.path.join(TMP, 'rank_car')
    os.makedirs(d, exist_ok=True)
    for f in glob.glob(os.path.join(d, 't*.mp3')):
        os.remove(f)
    good, _ = synth([('sil', 0.2), ('word', 0.5, 200), ('sil', 0.45), ('word', 0.5, 203), ('sil', 0.5),
                     ('word', 0.6, 206), ('sil', 0.3)], seed=2)
    merged, _ = synth([('sil', 0.2), ('word', 0.5, 200), ('sil', 0.45), ('word', 1.2, 203), ('sil', 0.3)], seed=3)
    jump, _ = synth([('sil', 0.2), ('word', 0.5, 200), ('sil', 0.45), ('word', 0.5, 250), ('sil', 0.5),
                     ('word', 0.6, 206), ('sil', 0.3)], seed=4)
    for nm, sig in (('t1.mp3', jump), ('t2.mp3', merged), ('t3.mp3', good)):
        sf.write(os.path.join(d, nm), sig.astype(np.float32), SR, format='MP3', subtype='MPEG_LAYER_III')
    unit = {'id': 'car.test', 'kind': 'carrier', 'tts': 'bir… iki… üç.', 'items': ['x1', 'x2', 'x3'],
            'itemText': {'x1': 'bir…', 'x2': 'iki…', 'x3': 'üç.'}, 'phase': 'Derinleşme', 'syllables': 4}
    code, r, o, err = cli('rank', d, '--unit-json', json.dumps(unit), '--sex', 'f')
    assert code == 0, (o, err)
    ex = {e['take']: e['reasons'] for e in r['excluded']}
    assert 't2.mp3' in ex and any('kesim tutmuyor' in s for s in ex['t2.mp3']), ex
    order = [q['take'] for q in r['ranking']]
    assert order == ['t3.mp3', 't1.mp3'], order
    j1 = [q for q in r['ranking'] if q['take'] == 't1.mp3'][0]
    j3 = [q for q in r['ranking'] if q['take'] == 't3.mp3'][0]
    assert j1['join_max_st'] > 2.0 and any('eklem' in s for s in j1['soft_violations']), j1
    assert j3['join_max_st'] <= 0.6, j3
    rows.append('sıra %s; t2 elendi: %s' % (order, ex['t2.mp3']))
    rows.append('t3 eklem en çok %.2f yt; t1 eklem %.2f yt (ihlal: %s)' % (j3['join_max_st'], j1['join_max_st'], j1['soft_violations']))
    # §4.4 sol taşıyıcı: sağdakine yakınlık
    code, r2, o, err = cli('rank', d, '--unit-json', json.dumps(unit), '--sex', 'f', '--match-f0', 203, '--match-rate',
                           j3['metrics']['articulation'])
    assert code == 0 and r2['ranking'][0]['take'] == 't3.mp3', o
    rows.append('--match-f0/--match-rate ile ilk: %s (%s)' % (r2['ranking'][0]['take'], r2['order_rule']))
    return rows


def test_units_pieces():
    """units.json: 68 birimin hepsi parçalanabilir; parça sayısı = items/sentences (+ ön söz); ekran = söylenen."""
    with open(UNITS, encoding='utf-8') as f:
        units = json.load(f)['units']
    assert len(units) == 68
    pre = []
    for u in units:
        ps = audio.unit_pieces(u)
        assert u['tts'] == u['screen'], u['id']
        if u['kind'] == 'carrier':
            kept = [p for p in ps if p['keep']]
            assert [p['name'] for p in kept] == u['items'], u['id']
            joined = [w for p in ps for w in audio.normtext(p['text'])]
            assert joined == audio.normtext(u['tts']), u['id']
            if len(ps) != len(kept):
                pre.append((u['id'], ps[0]['text'], len(ps)))
        else:
            assert len(ps) == len(u['sentences']), u['id']
            assert [w for p in ps for w in audio.normtext(p['text'])] == audio.normtext(u['tts']), u['id']
        assert sum(p['syll'] for p in ps) == u['syllables'], (u['id'], sum(p['syll'] for p in ps), u['syllables'])
    assert pre == [('car.sayi', 'sayıyorum:', 11)], pre
    return ['68 birim; ön sözlü taşıyıcı: %s; her birimde hece toplamı = units.json syllables' % pre]


TESTS = [test_analyze_real, test_clicks_injected, test_process_real, test_process_short, test_deess,
         test_cut_synthetic, test_normtext, test_f0, test_rank_real, test_rank_carrier_synthetic, test_units_pieces]


def main():
    if os.path.isdir(TMP):
        shutil.rmtree(TMP)
    os.makedirs(TMP)
    fails = 0
    t00 = time.time()
    for t in TESTS:
        t0 = time.time()
        try:
            rows = t() or []
            print('PASS %-30s (%.1f sn)' % (t.__name__, time.time() - t0))
            for r in rows:
                print('     ' + r)
        except Exception:
            fails += 1
            print('FAIL %-30s (%.1f sn)' % (t.__name__, time.time() - t0))
            traceback.print_exc()
    print('\n%d/%d test geçti (%.1f sn)' % (len(TESTS) - fails, len(TESTS), time.time() - t00))
    if fails == 0:
        shutil.rmtree(TMP, ignore_errors=True)
    return 1 if fails else 0


if __name__ == '__main__':
    sys.exit(main())
