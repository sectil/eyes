#!/usr/bin/env python3
"""audio.py — Ders 2 ses pilotu: SPEC §3 klip işleme ve §4 seçim yardımcıları.

Yalnız numpy / scipy / soundfile / pyloudnorm (ffmpeg YOK). Hem komut satırı aracı hem içe aktarılabilir modül.

Komutlar (hepsi JSON basar):
  analyze  <dosya> --syll N --phase P --sex f|m
  cut      <dosya> --n K --outdir D [--names a,b,...] [--sylls 3,4,...]      çıkış 2: K parça bulunamadı
  process  <girdi> --out <wav> --sex f|m [--micro] [--ref-rms-db X] [--level-rule v3|v2] [--peak-mode auto|limiter]
                                                                           çıkış 1: çıktı denetimi geçmedi
  normtext "<metin>"
  compare  "<a>" "<b>" [--strict]  (@dosya da olur)   çıkış 0: sözcük dizisi aynı ya da yalnız v3 Scribe yazım
                                                       istisnalarıyla aynı (JSON'da "exceptions"); --strict: v2
  f0step   <a.wav> <b.wav> [--sex f|m]
  rank     <çekim-klasörü> --unit-json '<birim>' --sex f|m [--match-f0 HZ --match-rate R]
Hata (okunamayan dosya, eksik argüman): çıkış 3.

Tanımlar (tek yerde; VARSAYIM olanlar işaretli):
  * Sessizlik eşiği: çıktı ölçeğinde −50 dBFS (SPEC §3). Girdi ölçeğine şöyle taşınır: ≥ 1 sn dosyada
    eşik = LUFS(girdi) − 32 dB (girdi −18 LUFS'e getirilseydi −50 dBFS olacak düzey); daha kısa dosyada
    eşik = konuşma RMS − 32 − RMS_LUFS_OFFSET. `process` kendi kazancını bildiği için doğrudan çıktı ölçeğini kullanır.
  * Duraklama: sessizlik eşiğinin altında ≥ 150 ms (PLAN D.6), konuşmanın içinde (baş/son sessizlik sayılmaz).
    Nefes: iki duraklama arasındaki ≤ 450 ms, konuşma düzeyinin ≥ 18 dB altında, periyodik olmayan kesit (VARSAYIM);
    iki yanındaki duraklamalarla tek boşluk sayılır, kesim yine saf sessizliğin ortasına düşer.
  * Konuşma süresi = etkin aralık (ilk sesten son sese) − duraklamalar − nefesler. Eklemleme = hece / konuşma süresi.
  * Konuşma RMS (rms_db): 10 ms karelerden, en gürültülü %5'in 30 dB altına kadar olanların RMS'i (düzeyden bağımsız).
  * F0: numpy YIN (16 kHz, 30 ms pencere, 10 ms adım, eşik 0,15; periyodiklik ≤ 0,25 ve konuşma düzeyi = sesli kare).
  * Tık: 10 kHz üstü ani enerji (SPEC §3). MP3'te (kodek alçak geçireni fc ≈ 15,5 kHz) tık = fc+500 Hz üstündeki
    bantta ani (±20 ms ortancanın ≥ 12 dB üstü), duyulur (≥ konuşma RMS − 56 dB) ve geniş bantlı (üst bant − 10 kHz
    üstü bant ≥ −10 dB; gerçek konuşmada en çok −14,9 dB ölçüldü) enerji (VARSAYIM; ayrıntı detect_clicks).
    Tam bantlı dosyada: 10 kHz üstü, ≥ 12 dB, ≤ 6 ms, ≥ konuşma RMS − 36 dB (uyanma-sesleri/analyze.py eşiği).
  * Islıklı oran: konuşma karelerinde 5–9 kHz enerjisinin toplam enerjiye oranı. De-ess: 5 ms bant düzeyi konuşma
    RMS'inin 6 dB üstünü aşarsa (VARSAYIM; hiz/ ölçümü _DEESS_THR_REL_DB yanında), 4:1 oranla, en çok −4 dB (SPEC §3).
"""
import argparse
import difflib
import glob
import json
import math
import os
import re
import sys
import unicodedata

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy.ndimage import maximum_filter1d, median_filter, minimum_filter1d, uniform_filter1d
from scipy.signal import butter, resample_poly, sosfilt, sosfiltfilt

# ------------------------------------------------------------------------------------------------ sabitler
SR = 44100
LESSON = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/pilot/ders2.lesson.json'

TRIM_THR_DBFS = -50.0          # SPEC §3
LEAD_S, TAIL_S, TRIM_FADE_S = 0.060, 0.250, 0.010
HPF_HZ = {'f': 90.0, 'm': 70.0}
HPF_ORDER = 2
DEESS_BAND = (5000.0, 9000.0)
DEESS_MAX_DB = 4.0
DEESS_RATIO = 4.0              # VARSAYIM
TARGET_LUFS, LUFS_TOL = -18.0, 0.5
TP_MAX_DBTP = -1.5
TP_OVERSAMPLE = 4
SHORT_CLIP_S = 1.0
PAUSE_MIN_S = 0.150
CUT_FADE_S = 0.005
FRAME_S, HOP_S = 0.010, 0.005
BREATH_MAX_S, BREATH_BELOW_DB, BREATH_VOICED_MAX = 0.45, 18.0, 0.2   # VARSAYIM
F0_RANGE = {'f': (100.0, 450.0), 'm': (55.0, 300.0), None: (55.0, 450.0)}
YIN_THRESH, YIN_VOICED_AP = 0.15, 0.25
CLICK_HP_HZ, CLICK_FRAME_S, CLICK_EXCESS_DB, CLICK_MAX_S, CLICK_AUDIBLE_REL_DB = 10000.0, 0.002, 12.0, 0.006, 36.0
CLICK_CODEC_AUDIBLE_REL_DB, CLICK_BROADBAND_MIN_DB = 56.0, -10.0   # VARSAYIM; hiz/ derleminden (bkz. detect_clicks)
CLIP_LEVEL = 0.999
RATE_BAND = (5.0, 6.2)         # SPEC §4.1 (c)
EDGE_WIN_S = 0.5               # SPEC §3 taşıyıcı eklemi
TR_DIGITS = ['sıfır', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz', 'on']


def _qa():
    try:
        with open(LESSON, encoding='utf-8') as f:
            return json.load(f).get('qa', {})
    except Exception:
        return {}


_QA = _qa()
JOIN_MAX_ST = float(_QA.get('carrierJoinF0StepSemitones', 2.0))
MICRO_OFFSET_DB = float(_QA.get('microClipRmsOffsetDb', 1.0))
DERIN_CEIL = float(_QA.get('derinClipRateCeil', 5.0))

# De-ess eşiği (VARSAYIM, SPEC §3 "eşiği aşarsa"): 5 ms'lik 5–9 kHz bant düzeyi klibin konuşma RMS'inin 6 dB üstünü
# aşarsa (ıslıklı ses tipik ünlü tepelerinden gürültülü). hiz/*.mp3 (7 gerçek ElevenLabs okuması, 90/70 Hz HPF sonrası)
# ölçümü: nes-v4 −3,8 · nes-v3 −2,0 · nes-uc −1,3 · nes-duz −1,1 · hak-duz +1,6 · hak-uc +4,2 · hak-v3 +9,7 dB.
# Bu eşikle yalnız hak-v3 (eleven_v3, elenmiş kullanım) kısılır; v2/v4 okumalarına dokunulmaz.
_DEESS_THR_REL_DB = 6.0
# Konuşma RMS (rms_db) − bütünleşik LUFS farkı, aynı 7 dosyada: −0,2 … +1,8 dB, ortalama +1,0 dB. Yalnız < 1 sn
# dosyada (LUFS geçersiz) sessizlik eşiğini kestirmek için kullanılır.
RMS_LUFS_OFFSET_DB = 1.0


# ------------------------------------------------------------------------------------------------ temel G/Ç
def load(path):
    """Mono float64, 44,1 kHz. Okunamazsa soundfile istisnası yükselir."""
    x, sr = sf.read(path, dtype='float64', always_2d=True)
    x = x.mean(axis=1)
    if sr != SR:
        g = math.gcd(SR, sr)
        x = resample_poly(x, SR // g, sr // g)
    return np.ascontiguousarray(x), SR


def write_wav(path, x, sr=SR):
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    sf.write(path, np.asarray(x, dtype=np.float32), sr, subtype='FLOAT')


def db(v, floor=1e-12):
    return 20.0 * np.log10(np.maximum(np.abs(v), floor))


def r3(v, n=3):
    if v is None:
        return None
    if isinstance(v, (float, np.floating)):
        if not np.isfinite(v):
            return None
        return round(float(v), n)
    return v


# ------------------------------------------------------------------------------------------------ düzey ölçüleri
def lufs(x, sr=SR):
    if len(x) < int(0.4 * sr) + 1:
        return None
    v = pyln.Meter(sr).integrated_loudness(x)
    return float(v) if np.isfinite(v) else None


def true_peak_db(x):
    if len(x) == 0:
        return -240.0
    up = resample_poly(x, TP_OVERSAMPLE, 1)
    return float(db(max(np.max(np.abs(up)), np.max(np.abs(x)))))


def frame_levels(x, sr=SR, win=FRAME_S, hop=HOP_S):
    """(başlangıç_örnek, dBFS) — pencere [s, s+win)."""
    w, h = int(round(win * sr)), int(round(hop * sr))
    if len(x) < w:
        return np.array([0]), np.array([float(db(np.sqrt(np.mean(x ** 2)) if len(x) else 0.0))])
    n = 1 + (len(x) - w) // h
    cs = np.concatenate([[0.0], np.cumsum(x * x)])
    starts = np.arange(n) * h
    e = (cs[starts + w] - cs[starts]) / w
    return starts, 10.0 * np.log10(np.maximum(e, 1e-24))


def speech_rms_db(x, sr=SR):
    """Konuşma RMS: 10 ms karelerden en gürültülü %5'in (p95) 30 dB altına kadar olanlar."""
    _, lv = frame_levels(x, sr, FRAME_S, FRAME_S)
    lv = lv[lv > -120]
    if len(lv) == 0:
        return None
    gate = np.percentile(lv, 95) - 30.0
    sel = lv[lv >= gate]
    return float(10.0 * np.log10(np.mean(10.0 ** (sel / 10.0))))


def silence_threshold_in(x, sr=SR):
    """Girdi ölçeğinde sessizlik eşiği (dBFS): çıktı ölçeğinde −50 dBFS'e karşılık gelen düzey."""
    dur = len(x) / sr
    L = lufs(x, sr) if dur >= SHORT_CLIP_S else None
    if L is not None:
        return L - (TARGET_LUFS - TRIM_THR_DBFS), 'lufs'
    r = speech_rms_db(x, sr)
    if r is None:
        return TRIM_THR_DBFS, 'abs'
    return r - (TARGET_LUFS - TRIM_THR_DBFS) - RMS_LUFS_OFFSET_DB, 'rms'


# ------------------------------------------------------------------------------------------------ F0 (YIN)
def yin_track(x, sr=SR, sex=None, hop_s=0.010, win_s=0.030):
    """F0 izi. Dönüş: merkez zamanları (sn), f0 (Hz, sessizde nan), periyodiklik (CMND en küçüğü)."""
    fmin, fmax = F0_RANGE.get(sex, F0_RANGE[None])
    fs = 16000
    g = math.gcd(fs, sr)
    y = resample_poly(x, fs // g, sr // g) if sr != fs else x
    W = int(win_s * fs)
    tmax = int(math.ceil(fs / fmin))
    tmin = max(2, int(math.floor(fs / fmax)))
    L = W + tmax + 1
    hop = int(hop_s * fs)
    if len(y) < L:
        return np.zeros(0), np.zeros(0), np.zeros(0)
    n = 1 + (len(y) - L) // hop
    fr = np.lib.stride_tricks.sliding_window_view(y, L)[::hop][:n]
    N = 1 << int(math.ceil(math.log2(L + W)))
    A = np.fft.rfft(fr[:, :W], N)
    B = np.fft.rfft(fr, N)
    r = np.fft.irfft(np.conj(A) * B, N)[:, :tmax + 1]
    cs = np.concatenate([np.zeros((n, 1)), np.cumsum(fr * fr, axis=1)], axis=1)
    e0 = cs[:, W] - cs[:, 0]
    et = cs[:, W:W + tmax + 1] - cs[:, 0:tmax + 1]
    d = np.maximum(e0[:, None] + et - 2.0 * r, 0.0)
    d[:, 0] = 0.0
    cum = np.cumsum(d[:, 1:], axis=1)
    taus = np.arange(1, tmax + 1)
    dn = np.ones_like(d)
    dn[:, 1:] = d[:, 1:] * taus / np.maximum(cum, 1e-20)
    f0 = np.full(n, np.nan)
    ap = np.ones(n)
    seg = dn[:, tmin:tmax + 1]
    below = seg < YIN_THRESH
    has = below.any(axis=1)
    first = np.argmax(below, axis=1)
    gmin = np.argmin(seg, axis=1)
    for i in range(n):
        if e0[i] <= 1e-12:
            continue
        if has[i]:
            k = first[i]
            while k + 1 < seg.shape[1] and seg[i, k + 1] < seg[i, k]:
                k += 1
        else:
            k = gmin[i]
        t = k + tmin
        a = dn[i, t]
        tt = float(t)
        if 1 <= t < tmax:
            y0, y1, y2 = dn[i, t - 1], dn[i, t], dn[i, t + 1]
            den = y0 - 2 * y1 + y2
            if abs(den) > 1e-12:
                tt = t + 0.5 * (y0 - y2) / den
        ap[i] = a
        if tt > 0:
            f0[i] = fs / tt
    times = (np.arange(n) * hop + L / 2.0) / fs
    return times, f0, ap


def voiced_f0(x, sr=SR, sex=None, thr_db=None):
    """Sesli karelerin F0'ı (nan olmayan), 3'lük ortanca süzgeçli ve ±9 yarım ton dışı (oktav hatası) atılmış."""
    times, f0, ap = yin_track(x, sr, sex)
    if len(times) == 0:
        return times, f0, np.zeros(0, bool)
    if thr_db is None:
        thr_db, _ = silence_threshold_in(x, sr)
    # kare düzeyi: YIN merkezinin çevresindeki 30 ms
    w = int(0.030 * sr)
    cs = np.concatenate([[0.0], np.cumsum(x * x)])
    c = np.clip((times * sr).astype(int), w // 2, max(w // 2, len(x) - w // 2))
    e = (cs[np.minimum(c + w // 2, len(x))] - cs[np.maximum(c - w // 2, 0)]) / w
    lvl = 10 * np.log10(np.maximum(e, 1e-24))
    voiced = (ap <= YIN_VOICED_AP) & (lvl > thr_db + 10.0) & np.isfinite(f0)
    f = np.where(voiced, f0, np.nan)
    # 3'lük ortanca (yalnız sesli komşularla)
    fm = f.copy()
    for i in range(1, len(f) - 1):
        if voiced[i] and voiced[i - 1] and voiced[i + 1]:
            fm[i] = np.median(f[i - 1:i + 2])
    f = fm
    if voiced.sum() >= 3:
        med = np.nanmedian(f[voiced])
        st = 12 * np.log2(f / med)
        bad = voiced & (np.abs(st) > 9.0)
        voiced = voiced & ~bad
        f = np.where(voiced, f, np.nan)
    return times, f, voiced


def f0_stats(f, voiced):
    v = f[voiced]
    if len(v) < 3:
        return None, None, None, int(len(v))
    geo = float(np.exp(np.mean(np.log(v))))
    st = 12 * np.log2(v / geo)
    return float(np.mean(v)), float(np.std(st)), geo, int(len(v))


# ------------------------------------------------------------------------------------------------ duraklama / kesim
EDGE_MIN_RUN_S = 0.020   # VARSAYIM: baş/son sınırı için eşiğin üstünde en az 20 ms süren enerji (tek örnekli uç kıpırtısı sayılmaz)


def edge_runs(mask, min_len):
    """Maskede en az min_len uzunluktaki ilk koşunun başı ve son koşunun sonu (dahil); yoksa (None, None)."""
    m = np.asarray(mask, bool)
    if not m.any():
        return None, None
    d = np.diff(np.concatenate([[0], m.astype(np.int8), [0]]))
    st, en = np.where(d == 1)[0], np.where(d == -1)[0]
    keep = (en - st) >= min_len
    if not keep.any():
        return None, None
    return int(st[keep][0]), int(en[keep][-1] - 1)


def activity(x, sr=SR, thr_db=None):
    """Etkin aralık (sn) ve 5 ms adımlı kare düzeyleri."""
    if thr_db is None:
        thr_db, _ = silence_threshold_in(x, sr)
    starts, lv = frame_levels(x, sr)
    act = lv >= thr_db
    w = int(round(FRAME_S * sr))
    nmin = max(1, int(round((EDGE_MIN_RUN_S - FRAME_S) / HOP_S)) + 1)     # 20 ms kapsayan kare sayısı
    i0, i1 = edge_runs(act, nmin)
    if i0 is None:
        return None, None, starts, lv, act, thr_db
    return starts[i0] / sr, (starts[i1] + w) / sr, starts, lv, act, thr_db


def find_pauses(x, sr=SR, thr_db=None, sex=None, f0track=None):
    """İç duraklamalar (≥ 150 ms), nefes kesitleri ve boşluk grupları.

    Dönüş sözlüğü: onset, offset, pauses [[s,e]], breaths [[s,e]], gaps [{start,end,dur,cut_region:[s,e]}], thr_db.
    """
    on, off, starts, lv, act, thr_db = activity(x, sr, thr_db)
    out = {'onset': on, 'offset': off, 'pauses': [], 'breaths': [], 'gaps': [], 'thr_db': thr_db}
    if on is None:
        return out
    w = int(round(FRAME_S * sr))
    sil = ~act
    runs = []
    i, n = 0, len(sil)
    while i < n:
        if sil[i]:
            j = i
            while j + 1 < n and sil[j + 1]:
                j += 1
            s, e = starts[i] / sr, (starts[j] + w) / sr
            if s > on + 1e-9 and e < off - 1e-9 and e - s >= PAUSE_MIN_S - 1e-9:
                runs.append([s, e])
            i = j + 1
        else:
            i += 1
    out['pauses'] = runs
    if not runs:
        return out
    # nefes birleştirme
    ref = np.percentile(lv[act], 95) if act.any() else -20.0
    if f0track is None:
        f0track = voiced_f0(x, sr, sex, thr_db)
    ftimes, _, fvoiced = f0track
    groups = [[runs[0]]]
    for a, b in zip(runs[:-1], runs[1:]):
        s, e = a[1], b[0]
        is_breath = False
        if e - s <= BREATH_MAX_S:
            m = (starts / sr >= s - 1e-9) & ((starts + w) / sr <= e + 1e-9)
            mx = lv[m].max() if m.any() else -120.0
            fm = (ftimes >= s) & (ftimes <= e)
            vf = float(fvoiced[fm].mean()) if fm.any() else 0.0
            is_breath = (mx <= ref - BREATH_BELOW_DB) and (vf < BREATH_VOICED_MAX)
        if is_breath:
            out['breaths'].append([s, e])
            groups[-1].append(b)
        else:
            groups.append([b])
    for g in groups:
        longest = max(g, key=lambda p: p[1] - p[0])
        out['gaps'].append({'start': g[0][0], 'end': g[-1][1], 'dur': g[-1][1] - g[0][0], 'cut_region': list(longest)})
    return out


def zero_cross_near(x, idx, radius):
    lo, hi = max(1, idx - radius), min(len(x) - 1, idx + radius)
    if hi <= lo:
        return idx
    seg = x[lo - 1:hi + 1]
    zc = np.where((np.sign(seg[:-1]) != np.sign(seg[1:])) | (seg[1:] == 0))[0] + lo
    if len(zc) == 0:
        return int(lo + np.argmin(np.abs(x[lo:hi])))
    return int(zc[np.argmin(np.abs(zc - idx))])


def plan_cuts(x, sr=SR, k=1, thr_db=None, sex=None, info=None):
    """K parça için kesim örnekleri. Dönüş (cuts | None, bilgi). En uzun K−1 boşluk, zaman sırasıyla."""
    if info is None:
        info = find_pauses(x, sr, thr_db, sex)
    gaps = info['gaps']
    meta = {'needed': k, 'found': len(gaps) + 1 if info['onset'] is not None else 0, 'gaps_available': len(gaps)}
    if k <= 1:
        return [], meta, info
    if len(gaps) < k - 1:
        return None, meta, info
    order = sorted(range(len(gaps)), key=lambda i: (-gaps[i]['dur'], gaps[i]['start']))
    chosen = sorted(order[:k - 1])
    unchosen = order[k - 1:]
    cuts = []
    for i in chosen:
        s, e = gaps[i]['cut_region']
        mid = int(round((s + e) / 2 * sr))
        radius = max(1, int(min(0.010, (e - s) / 4) * sr))
        cuts.append(zero_cross_near(x, mid, radius))
    shortest = min(gaps[i]['dur'] for i in chosen)
    longest_un = max((gaps[i]['dur'] for i in unchosen), default=None)
    meta.update({
        'chosen_gaps': [[r3(gaps[i]['start']), r3(gaps[i]['end'])] for i in chosen],
        'shortest_chosen_gap': r3(shortest),
        'longest_unchosen_gap': r3(longest_un),
        'margin_ratio': r3(shortest / longest_un) if longest_un else None,
    })
    return cuts, meta, info


def fade(x, sr, sec_in, sec_out):
    y = x.copy()
    ni, no = min(len(y), int(round(sec_in * sr))), min(len(y), int(round(sec_out * sr)))
    if ni > 1:
        y[:ni] *= 0.5 - 0.5 * np.cos(np.pi * np.arange(ni) / ni)
    if no > 1:
        y[-no:] *= 0.5 + 0.5 * np.cos(np.pi * (np.arange(no) + 1) / no)
    return y


def split_at(x, cuts, sr=SR):
    b = [0] + list(cuts) + [len(x)]
    return [fade(x[b[i]:b[i + 1]], sr, CUT_FADE_S, CUT_FADE_S) for i in range(len(b) - 1)], b


def speech_measure(x, sr=SR, thr_db=None, sex=None):
    """Konuşma süresi ve duraklamalar (kesilmiş parça için; eşik üst dosyadan verilir)."""
    tr = voiced_f0(x, sr, sex, thr_db)
    info = find_pauses(x, sr, thr_db, sex, tr)
    if info['onset'] is None:
        return {'speech_sec': 0.0, 'active': None}
    act = info['offset'] - info['onset']
    sp = act - sum(e - s for s, e in info['pauses']) - sum(e - s for s, e in info['breaths'])
    return {'speech_sec': sp, 'active': [info['onset'], info['offset']], 'pauses': info['pauses'],
            'breaths': info['breaths'], 'f0track': tr}


FINAL_LENGTHENING_SYLL = 1.0   # VARSAYIM: her parçanın sonundaki uzama ≈ 1 hece (kısa öğelerde "on…", "beş…")


def boundary_alignment(pieces_speech, sylls):
    """Kesim noktalarının beklenen paydan kayması: max |kümülatif konuşma payı − kümülatif (hece + 1) payı|."""
    sylls = [s + FINAL_LENGTHENING_SYLL for s in sylls]
    ts, ss = float(sum(pieces_speech)), float(sum(sylls))
    if ts <= 0 or ss <= 0:
        return None
    cp, cs, dev = 0.0, 0.0, 0.0
    for p, s in list(zip(pieces_speech, sylls))[:-1]:
        cp += p / ts
        cs += s / ss
        dev = max(dev, abs(cp - cs))
    return dev


CUT_MISALIGN_MAX = 0.12   # VARSAYIM: kesim noktası hece payından en çok %12 sapabilir (ölçüyle denetim, §4.3c)


# ------------------------------------------------------------------------------------------------ kusur ölçüleri
def clipping(x):
    c = int(np.sum(np.abs(x) >= CLIP_LEVEL))
    return {'clipped': bool(c > 0), 'count': c, 'peak_dbfs': r3(float(db(np.max(np.abs(x)))) if len(x) else None, 2)}


def codec_cutoff(x, sr=SR):
    """Uzun süreli spektrumun en yüksek değerinin 70 dB altına inmediği en yüksek frekans (MP3 alçak geçirenini bulur)."""
    from scipy.signal import welch
    n = min(2048, len(x))
    fr, P = welch(x, sr, nperseg=n)
    Pd = 10 * np.log10(P + 1e-30)
    m = fr >= 200
    if not m.any():
        return sr / 2
    ok = np.where((Pd >= Pd[m].max() - 70.0) & m)[0]
    return float(fr[ok[-1]]) if len(ok) else sr / 2


def _frame_db(z, n):
    k = len(z) // n
    return 10 * np.log10(np.maximum(np.mean(z[:k * n].reshape(k, n) ** 2, axis=1), 1e-24))


def detect_clicks(x, sr=SR, ref_db=None, thr_db=None):
    """10 kHz üstü ani enerji (tık). Dönüş: (sayı, zamanlar, kip notu).

    Kip 'codec' (dosyada MP3 alçak geçireni var, fc < Nyquist − 1 kHz), iki yol (biri yeter):
      A) fc + 500 Hz üstündeki bantta (konuşmanın ulaşmadığı bölge) 2 ms karede ani enerji (±20 ms ortancanın
         ≥ 12 dB üstü), duyulur (≥ konuşma RMS − 56 dB) ve geniş bantlı (üst bant − 10 kHz üstü bant ≥ −10 dB; düz
         tayfta ≈ −3 dB, hiz/ derlemindeki gerçek konuşmada en çok −14,9 dB ölçüldü → 5 dB pay). İşlem kaynaklı tıkı
         (kesim, kazanç sıçraması) yakalar.
      B) Kodlamadan önce oluşmuş (bant sınırlı) tık için: 10 kHz üstünde ≤ 6 ms ani enerji (≥ 12 dB, ≥ konuşma
         RMS − 56 dB) ve çevresi sessiz (olayın 10–60 ms önü ve arkası sessizlik eşiğinin altında). Patlamalı ünsüzün
         ardından ünlü geldiği için bu yolda yanlış alarm vermez.
      Kör nokta: kodlamadan önce oluşmuş ve konuşmanın içine düşmüş tık görülmez (Scribe + kulak denetimi).
    Kip 'hf' (tam bantlı dosya): 10 kHz üstü 2 ms karede yerel ortancanın ≥ 12 dB üstü, ≤ 6 ms, konuşma RMS − 36 dB
      üstü (uyanma-sesleri/analyze.py eşiği; patlamalı ünsüzler yanlış alarm verebilir).
    """
    if sr / 2 <= CLICK_HP_HZ * 1.05 or len(x) < int(0.05 * sr):
        return 0, [], 'bant yok'
    if ref_db is None:
        ref_db = speech_rms_db(x, sr)
        if ref_db is None:
            ref_db = -30.0
    n = int(round(CLICK_FRAME_S * sr))
    hf = _frame_db(sosfiltfilt(butter(4, CLICK_HP_HZ, 'highpass', fs=sr, output='sos'), x), n)
    hf_bg = median_filter(hf, size=21, mode='nearest')
    maxf = int(round(CLICK_MAX_S / CLICK_FRAME_S))
    fc = codec_cutoff(x, sr)
    lo = max(CLICK_HP_HZ, fc + 500.0)

    def runs(cand, limit, lvl):
        out, i, m = [], 0, len(cand)
        while i < m:
            if cand[i]:
                j = i
                while j + 1 < m and cand[j + 1]:
                    j += 1
                if limit is None or j - i + 1 <= limit:
                    out.append(i + int(np.argmax(lvl[i:j + 1])))
                i = j + 1
            else:
                i += 1
        return out

    if lo < sr / 2 - 1000.0:
        mode = 'codec'
        vh = _frame_db(sosfiltfilt(butter(4, lo, 'highpass', fs=sr, output='sos'), x), n)
        bg = median_filter(vh, size=21, mode='nearest')
        ca = (vh - bg >= CLICK_EXCESS_DB) & (vh >= ref_db - CLICK_CODEC_AUDIBLE_REL_DB) & \
             (vh - hf >= CLICK_BROADBAND_MIN_DB)
        ka = runs(ca, None, vh)
        # B) sessizlik içindeki bant sınırlı tık
        if thr_db is None:
            thr_db, _ = silence_threshold_in(x, sr)
        fl = _frame_db(x, n)
        m = min(len(fl), len(hf))
        quiet = fl[:m] < thr_db
        a, b = 5, 30                                    # 10–60 ms (2 ms kare)
        cs = np.concatenate([[0], np.cumsum(~quiet)])   # sessiz olmayan kare sayısı
        idx = np.arange(m)
        # dosya sınırının ötesi sessiz sayılır (baştaki/sondaki sessizlikte tık duyulur)
        pre_ok = (cs[np.clip(idx - a + 1, 0, m)] - cs[np.clip(idx - b, 0, m)]) == 0
        post_ok = (cs[np.clip(idx + b + 1, 0, m)] - cs[np.clip(idx + a, 0, m)]) == 0
        cb = (hf[:m] - hf_bg[:m] >= CLICK_EXCESS_DB) & (hf[:m] >= ref_db - CLICK_CODEC_AUDIBLE_REL_DB) & pre_ok & post_ok
        kb = runs(cb, maxf, hf[:m])
        ks = sorted(set(ka) | set(kb))
        note = 'codec: fc %.0f Hz; A: bant ≥ %.0f Hz (%d), B: sessizlikte 10 kHz üstü (%d); kör nokta: konuşma içindeki bant sınırlı tık' % (
            fc, lo, len(ka), len(kb))
    else:
        mode = 'hf'
        cand = (hf - hf_bg >= CLICK_EXCESS_DB) & (hf >= ref_db - CLICK_AUDIBLE_REL_DB)
        ks = runs(cand, maxf, hf)
        note = 'hf: tam bant (patlamalı ünsüz yanlış alarm verebilir)'
    # aynı olayın bitişik kareleri tek tık
    merged = []
    for k in ks:
        if not merged or k - merged[-1] > maxf:
            merged.append(k)
    times = [round((k + 0.5) * n / sr, 4) for k in merged]
    return len(times), times, note


def band_filter(x, sr, lo, hi, order=4):
    return sosfiltfilt(butter(order, [lo, hi], 'bandpass', fs=sr, output='sos'), x)


def sibilance(x, sr=SR, thr_db=None):
    """5–9 kHz enerji payı (konuşma karelerinde) ve 5 ms bant düzeyinin konuşma RMS'ine göre tepe değeri."""
    if thr_db is None:
        thr_db, _ = silence_threshold_in(x, sr)
    b = band_filter(x, sr, *DEESS_BAND)
    w = int(round(FRAME_S * sr))
    starts, lv = frame_levels(x, sr, FRAME_S, FRAME_S)
    m = lv >= thr_db
    if not m.any():
        return None, None
    tot = sum(float(np.sum(x[s:s + w] ** 2)) for s in starts[m])
    bnd = sum(float(np.sum(b[s:s + w] ** 2)) for s in starts[m])
    ref = speech_rms_db(x, sr)
    env = 10 * np.log10(np.maximum(uniform_filter1d(b * b, int(0.005 * sr)), 1e-24))
    peak_rel = float(np.max(env) - ref) if ref is not None else None
    return bnd / max(tot, 1e-24), peak_rel


# ------------------------------------------------------------------------------------------------ çözümleme
def analyze_array(x, sr=SR, syll=None, phase=None, sex=None, thr_db=None):
    dur = len(x) / sr
    thr_src = 'verilen'
    if thr_db is None:
        thr_db, thr_src = silence_threshold_in(x, sr)
    tr = voiced_f0(x, sr, sex, thr_db)
    info = find_pauses(x, sr, thr_db, sex, tr)
    res = {'duration': r3(dur), 'sr': sr, 'thr_db': r3(thr_db, 2), 'thr_source': thr_src}
    if info['onset'] is None:
        res.update({'speech_sec': 0.0, 'error': 'konuşma bulunamadı'})
        return res
    act = info['offset'] - info['onset']
    sp = act - sum(e - s for s, e in info['pauses']) - sum(e - s for s, e in info['breaths'])
    f0m, f0sd, f0geo, nv = f0_stats(tr[1], tr[2])
    sib, sib_peak = sibilance(x, sr, thr_db)
    rms = speech_rms_db(x, sr)
    ncl, tcl, cnote = detect_clicks(x, sr, rms, thr_db)
    L = lufs(x, sr)
    art = (syll / sp) if (syll and sp > 0) else None
    res.update({
        'onset': r3(info['onset']), 'offset': r3(info['offset']), 'active_sec': r3(act),
        'lead_sec': r3(info['onset']), 'tail_sec': r3(dur - info['offset']),
        'speech_sec': r3(sp), 'syll': syll, 'articulation': r3(art, 2),
        'pauses': [[r3(s), r3(e)] for s, e in info['pauses']],
        'breaths': [[r3(s), r3(e)] for s, e in info['breaths']],
        'gaps': [{'start': r3(g['start']), 'end': r3(g['end']), 'dur': r3(g['dur'])} for g in info['gaps']],
        'pause_total_sec': r3(sum(e - s for s, e in info['pauses'])),
        'f0_mean_hz': r3(f0m, 1), 'f0_geo_hz': r3(f0geo, 1), 'f0_sd_semitones': r3(f0sd, 2), 'f0_voiced_frames': nv,
        'sibilance_ratio': r3(sib, 4), 'sibilance_peak_rel_db': r3(sib_peak, 1),
        'clipping': clipping(x), 'dc': float('%.3g' % float(np.mean(x))),
        'lufs': r3(L, 2), 'rms_db': r3(rms, 2), 'true_peak_dbtp': r3(true_peak_db(x), 2),
        'clicks': {'count': ncl, 'times': tcl, 'mode': cnote},
    })
    if phase:
        if phase == 'Derin':
            res['rate_rule'] = {'ceil': DERIN_CEIL, 'ok': (art is not None and art <= DERIN_CEIL),
                                'note': 'qa.derinClipRateCeil (VARSAYIM), raporlanır'}
        else:
            res['rate_rule'] = {'band': list(RATE_BAND), 'ok': (art is not None and RATE_BAND[0] <= art <= RATE_BAND[1]),
                                'note': 'SPEC §4.1c tercih bandı'}
        res['phase'] = phase
    return res


def analyze_file(path, syll=None, phase=None, sex=None):
    x, sr = load(path)
    r = analyze_array(x, sr, syll, phase, sex)
    r['file'] = os.path.abspath(path)
    return r


# ------------------------------------------------------------------------------------------------ işleme
def hpf(x, sr, sex):
    return sosfilt(butter(HPF_ORDER, HPF_HZ[sex], 'highpass', fs=sr, output='sos'), x)


def deess(y, sr, ref_db):
    """Yalnız gerekiyorsa: 5–9 kHz bandı eşiği aşarsa en çok −4 dB. Dönüş (y, bilgi)."""
    thr = ref_db + _DEESS_THR_REL_DB
    b = band_filter(y, sr, *DEESS_BAND)
    env = 10 * np.log10(np.maximum(uniform_filter1d(b * b, int(0.005 * sr)), 1e-24))
    over = env - thr
    peak_over = float(np.max(over)) if len(over) else -99.0
    info = {'applied': False, 'threshold_db': r3(thr, 2), 'band_peak_over_thr_db': r3(peak_over, 2),
            'max_reduction_db': 0.0, 'time_reduced_sec': 0.0}
    if peak_over <= 0:
        return y, info
    red = np.clip(over * (1.0 - 1.0 / DEESS_RATIO), 0.0, DEESS_MAX_DB)
    L = int(0.005 * sr)
    red = uniform_filter1d(minimum_filter1d(-red, 2 * L + 1) * -1.0, L + 1)   # yumuşak atak/bırakma
    red = np.clip(red, 0.0, DEESS_MAX_DB)
    g = 10 ** (-red / 20.0)
    out = y - b + g * b
    info.update({'applied': True, 'max_reduction_db': r3(float(red.max()), 2),
                 'time_reduced_sec': r3(float(np.sum(red > 0.1)) / sr, 3)})
    return out, info


LIM_ATTACK_DB_PER_MS, LIM_RELEASE_DB_PER_MS = 1.0, 0.05   # VARSAYIM: ileriye bakan atak, 6 dB'i 120 ms'de bırakır
LIM_FLAG_DB = 3.0                                           # VARSAYIM: daha çok kısma kulak bayrağı alır


def tp_limit(y, sr, ceiling_db):
    """Gerçek tepe sınırlayıcı: 4× üst örneklemeli tepeden gereken kısma (dB), doğrusal-dB ileriye bakan atak
    (1 dB/ms) ve bırakma (0,05 dB/ms), 2 ms tutma+ortalama (her örnekte kısma ≥ gereken ve eğride sıçrama yok;
    sıçrama tık üretir). Dönüş (y, kazanç eğrisi)."""
    c = 10 ** (ceiling_db / 20.0)
    up = np.abs(resample_poly(y, TP_OVERSAMPLE, 1))
    up = up[:len(y) * TP_OVERSAMPLE].reshape(len(y), TP_OVERSAMPLE).max(axis=1)
    greq = np.minimum(1.0, c / np.maximum(np.maximum(up, np.abs(y)), 1e-12))
    if greq.min() >= 1.0:
        return y, np.ones_like(y)
    r = -20.0 * np.log10(greq)
    idx = np.arange(len(r), dtype=np.float64)
    da, dr = LIM_ATTACK_DB_PER_MS * 1000.0 / sr, LIM_RELEASE_DB_PER_MS * 1000.0 / sr
    r = np.maximum.accumulate(r + dr * idx) - dr * idx                          # bırakma
    r = np.maximum.accumulate((r - da * idx)[::-1])[::-1] + da * idx            # ileriye bakan atak
    k = int(0.002 * sr) | 1                                                     # tutma + ortalama: her örnekte
    r = uniform_filter1d(maximum_filter1d(r, k), k)                             # ≥ gereken, sıçrama yok
    g = 10 ** (-r / 20.0)
    return y * g, g


# ------------------------------------------------------------------------------------------------ v3: klip düzeyinde tepe yönetimi
# PLAN.v3 §E.2 son madde, §F A adımı. Pilotta Hakan'ın 40 parçası tek başına gerçek tepe sınırlayıcısıyla > 3 dB kısıldı
# (tepe/yükseklik oranı ≈ 21 dB; −18 LUFS'te ≤ −1,5 dBTP için 2–6 dB, kısa tek sözcükte daha çok tepe indirimi gerekir).
# v3 zinciri, eski sınırlayıcı > SOFT_TRIGGER_DB kısacaksa iki adayı karşılaştırır ve bozulma göstergesi daha iyi olanı alır:
#   (1) eski zincir: kazanç + gerçek tepe sınırlayıcı (1 dB/ms atak, 0,05 dB/ms bırakma, 2 ms yumuşatma);
#   (2) yumuşak tepe sıkıştırma + sınırlayıcı: yumuşak dizli (6 dB) 3:1 sıkıştırıcı, 4× üst örneklemeli tepe zarfı,
#       10 ms Hann ileriye bakan atak (kazanç bir ses perdesi süresinden yavaş değişir: perde içi genlik kıpırtısı azalır),
#       0,04 dB/ms bırakma; eşik, sınırlayıcıya en çok SOFT_RESIDUAL_DB bırakacak kadar derin, sıkıştırıcı kısması en
#       çok SOFT_MAX_GR_DB. Kalan ≤ 1 dB'i eski sınırlayıcı alır (güvenlik).
# Bozulma göstergesi (fast_sdr_db): çıktı ile "girdi × 20 Hz alçak geçirilmiş toplam kazanç" arasındaki farkın enerjisi;
# hece hızındaki (≤ 20 Hz) düzey değişimini sayma, perde içi hızlı kazanç kıpırtısını (AM bozulması) sayar. Yüksek = temiz.
# Denenip seçilmeyen: tüm-geçiren faz döndürme (Hakan'da ortanca 0,9 dB kazanç, bazı kliplerde 2 dB kötüleşme) ve tepe
# kırpma (dalga biçimini keser; ölçülmedi, istenmedi).
SOFT_RATIO, SOFT_KNEE_DB = 3.0, 6.0              # VARSAYIM (yaygın konuşma sıkıştırıcı ayarı)
SOFT_ATTACK_S, SOFT_RELEASE_DB_PER_MS = 0.010, 0.04  # VARSAYIM
SOFT_TRIGGER_DB = 1.0      # eski sınırlayıcı ≤ 1 dB kısıyorsa klip v2 ile birebir aynı kalır
SOFT_RESIDUAL_DB = 1.0     # yumuşak sıkıştırmadan sonra sınırlayıcıya kalan tepe aşımı (dB)
SOFT_MAX_GR_DB = 6.0       # yumuşak sıkıştırıcının en çok kısması (hece dinamiği ezilmesin; VARSAYIM)
# Kısa parça (< 1 sn) düzeyi, v3: LUFS ölçülebiliyorsa (≥ 0,4 sn) uzun kliplerle AYNI ölçü ve hedef (BS.1770 kapılı,
# −18 LUFS; karışımdaki konuşma/yatak denetimi de bu ölçüyü kullanır). Pilotta RMS'le eşitlenen kısa parçalar LUFS'te
# uzun kliplerin 0–4,6 dB altında kaldı (Hakan ortalama −19,7, Neslihan −19,1 LUFS); sabit bir RMS ofseti bunu
# düzeltemez (fark parçadan parçaya 0–4,6 dB). Tek heceli mikro parçanın ek ofseti bu ölçekte 0 dB: pilotun "+1 dB RMS"
# kuralı mikro parçaları zaten ≈ −18,1 (Neslihan) / −19,0 (Hakan) LUFS'e koymuştu; sayımda ("on… dokuz… sekiz…") tek
# ve iki heceli sayılar aynı yükseklikte duyulsun diye ek ofset konmaz (qa.microClipRmsOffsetDb yerine; SPEC v3 eki).
MICRO_OFFSET_V3_DB = 0.0
SHORT_LUFS_MIN_S = 0.4     # BS.1770 bloğu; daha kısa parçada v2 RMS yolu (referans gerekir)
# Kısa tek sözcükte (Hakan: sözcük başındaki alçak frekanslı, yüksek tepe/ortalama oranlı ünlü) −18 LUFS'e çıkmak
# sınırlayıcıya 7–15 dB iş bırakabiliyor. Doğallık için: seçilen zincirde sınırlayıcı payı SHORT_LIM_MAX_DB'i (kulak
# bayrağı eşiği) aşarsa kısa parçanın hedefi 0,5 dB adımlarla en çok SHORT_MAX_DROP_DB iner; konuşma/yatak eşiğinin
# kalan açığı karışımda o parçanın altında yerel yatak kısmasıyla kapanır (mix.py LOCAL_DUCK_*). VARSAYIM değerler.
SHORT_LIM_MAX_DB = 3.0
SHORT_MAX_DROP_DB = 3.0


def tp_envelope(y):
    """4× üst örneklemeli mutlak tepe (her örnek için), tp_limit ile aynı tanım."""
    up = np.abs(resample_poly(y, TP_OVERSAMPLE, 1))
    up = up[:len(y) * TP_OVERSAMPLE].reshape(len(y), TP_OVERSAMPLE).max(axis=1)
    return np.maximum(up, np.abs(y))


def soft_peak_comp(y, sr, thr_db, ratio=SOFT_RATIO, knee_db=SOFT_KNEE_DB, attack_s=SOFT_ATTACK_S,
                   release_db_per_ms=SOFT_RELEASE_DB_PER_MS):
    """Yumuşak dizli tepe sıkıştırıcı. Dönüş (y·g, kısma eğrisi dB)."""
    P = 20.0 * np.log10(np.maximum(tp_envelope(y), 1e-12))
    s = 1.0 - 1.0 / ratio
    h = knee_db / 2.0
    r = np.where(P <= thr_db - h, 0.0, np.where(P >= thr_db + h, s * (P - thr_db), s * (P - thr_db + h) ** 2 / (2 * knee_db)))
    if r.max() <= 0:
        return y.copy(), np.zeros_like(y)
    idx = np.arange(len(r), dtype=np.float64)
    dr = release_db_per_ms * 1000.0 / sr
    r = np.maximum.accumulate(r + dr * idx) - dr * idx                       # doğrusal-dB bırakma
    n = int(attack_s * sr) | 1
    w = np.hanning(n + 2)[1:-1]
    w /= w.sum()
    r = np.convolve(maximum_filter1d(r, n), w, mode='same')                  # ileriye bakan Hann atak (tepede ≥ gereken)
    r = np.maximum(r, 0.0)
    return y * 10 ** (-r / 20.0), r


def fast_sdr_db(y_out, x_in, total_gain_db):
    """Bozulma göstergesi: 10·log(|y|² / |y − x·LP20(g)|²); g = toplam kazanç eğrisi (skaler dahil, doğrusal)."""
    g = 10 ** (np.asarray(total_gain_db, dtype=np.float64) / 20.0)
    if len(g) < 64:
        return None
    gs = sosfiltfilt(butter(2, 20.0, 'lowpass', fs=SR, output='sos'), g)
    d = y_out - x_in * gs
    return float(10 * np.log10(np.sum(y_out ** 2) / max(float(np.sum(d ** 2)), 1e-30)))


def _level_soft(seg, sr, meas, target):
    """Yumuşak tepe sıkıştırma + sınırlayıcı ile seviye. Derinlik D (eşik = tavan − D) ikiye bölmeyle: sınırlayıcıya
    ≤ SOFT_RESIDUAL_DB kalan en sığ D; sıkıştırıcı kısması SOFT_MAX_GR_DB'i aşamaz (aşarsa en derin izinli D).
    Dönüş (y, toplam kazanç eğrisi dB, bilgi, sınırlayıcı kazanç eğrisi) ya da None (ölçülemezse)."""
    ceiling = TP_MAX_DBTP - 0.1

    def run(D):
        cur = meas(seg)
        if cur is None:
            return None
        G = target - cur
        z = rc = None
        for _ in range(10):
            z, rc = soft_peak_comp(seg * 10 ** (G / 20.0), sr, ceiling - D)
            m = meas(z)
            if m is None:
                return None
            if abs(target - m) <= 0.02:
                break
            G += target - m
        return z, rc, G

    lo, hi = -12.0, 18.0                         # D < 0: eşik tavanın üstünde (sıkıştırıcı az, sınırlayıcı çok iş yapar)
    ok = None
    deepest_allowed = None
    for _ in range(12):
        D = (lo + hi) / 2
        res = run(D)
        if res is None:
            return None
        z, rc, G = res
        if rc.max() > SOFT_MAX_GR_DB:          # çok derin: hece dinamiği ezilir
            hi = D
            continue
        deepest_allowed = (D, z, rc, G) if (deepest_allowed is None or D > deepest_allowed[0]) else deepest_allowed
        if true_peak_db(z) - ceiling > SOFT_RESIDUAL_DB:
            lo = D
        else:
            hi = D
            ok = (D, z, rc, G)
    pick = ok or deepest_allowed
    if pick is None:
        return None
    D, z, rc, G = pick
    y, g_db2, g_lim = _level(z, sr, meas, target)
    total = G + g_db2 - rc - 20.0 * np.log10(np.maximum(g_lim, 1e-12))
    info = {'depth_db': r3(D, 2), 'comp_gr_max_db': r3(float(rc.max()), 2),
            'comp_sec_over_1db': r3(float(np.sum(rc > 1.0)) / sr, 3),
            'limiter_max_db': r3(float(-db(g_lim.min())), 2), 'residual_met': ok is not None}
    return y, total, info, g_lim


def _level(seg, sr, meas, target):
    """Hedef seviyeye getirir, gerçek tepe ≤ −1,5 dBTP için sınırlar. Dönüş (y, toplam skaler kazanç dB, sınırlayıcı eğrisi)."""
    ceiling = TP_MAX_DBTP - 0.1
    g_tot = np.ones_like(seg)
    g_db = 0.0
    for _ in range(12):
        cur = meas(seg)
        if cur is None:
            raise ValueError('seviye ölçülemedi')
        g_db += target - cur
        seg = seg * 10 ** ((target - cur) / 20.0)
        if true_peak_db(seg) <= TP_MAX_DBTP - 0.02:
            if abs(meas(seg) - target) <= 0.05:
                break
            continue
        seg, g = tp_limit(seg, sr, ceiling)
        g_tot *= g
        if true_peak_db(seg) > TP_MAX_DBTP - 0.02:
            ceiling -= 0.1
    return seg, g_db, g_tot


def process_array(x, sr, sex, micro=False, ref_rms_db=None, level_rule='v3', peak_mode='auto'):
    """SPEC §3: kırpma (çıktı ölçeğinde −50 dBFS, 60/250 ms pay, 10 ms uç) → HPF → gerekirse de-ess → seviye
    (≥ 1 sn: −18 LUFS ±0,5 ve ≤ −1,5 dBTP). < 1 sn: level_rule='v3' (SPEC v3 eki) → aynı −18 LUFS (BS.1770 kapılı;
    mikro ek ofseti MICRO_OFFSET_V3_DB), LUFS ölçülemeyen (< 0,4 sn) parçada ve level_rule='v2'de referans konuşma RMS'i
    (mikro +1 dB). Tepe: peak_mode='auto' → eski sınırlayıcı > SOFT_TRIGGER_DB kısacaksa yumuşak tepe sıkıştırma adayı
    da denenir, bozulma göstergesi (fast_sdr_db) yüksek olan seçilir; 'limiter' → yalnız v2 sınırlayıcı. Dönüş (y, rapor).
    Kırpma eşiği çıktı ölçeğinde olduğu için uygulanan skaler kazanç bulununca kırpma yeniden yapılır (en çok 3 tur)."""
    rep = {'sex': sex, 'hpf_hz': HPF_HZ[sex], 'in_duration': r3(len(x) / sr)}
    y = hpf(x, sr, sex)
    w = int(round(FRAME_S * sr))
    env_db = db(np.sqrt(np.maximum(uniform_filter1d(y * y, w), 0.0)))
    lead, tail = int(round(LEAD_S * sr)), int(round(TAIL_S * sr))

    def edges(g0):
        a, b = edge_runs(env_db + g0 > TRIM_THR_DBFS, int(EDGE_MIN_RUN_S * sr))
        if a is None:
            raise ValueError('konuşma bulunamadı (−50 dBFS üstünde 20 ms süren enerji yok)')
        return a, b

    thr_in, thr_src = silence_threshold_in(y, sr)
    g0 = TRIM_THR_DBFS - thr_in
    first, last = edges(g0)
    short_v3 = level_rule == 'v3' and (last - first) / sr + LEAD_S + TAIL_S < SHORT_CLIP_S
    L_in = lufs(y[max(0, first - lead):last + tail + 1], sr) if short_v3 else None
    if short_v3 and L_in is not None:
        g0 = TARGET_LUFS + (MICRO_OFFSET_V3_DB if micro else 0.0) - L_in
        first, last = edges(g0)
        thr_src = 'lufs-hedef'
    elif (last - first) / sr + LEAD_S + TAIL_S < SHORT_CLIP_S and ref_rms_db is not None:
        r_in = speech_rms_db(y[first:last + 1], sr)
        if r_in is not None:
            g0 = float(ref_rms_db) + (MICRO_OFFSET_DB if micro else 0.0) - r_in
            first, last = edges(g0)
            thr_src = 'rms-hedef'
    passes = []
    for _ in range(3):
        s, e = first - lead, last + tail + 1
        pad_l, pad_r = max(0, -s), max(0, e - len(y))
        seg = np.concatenate([np.zeros(pad_l), y[max(0, s):min(len(y), e)], np.zeros(pad_r)])
        seg = fade(seg, sr, TRIM_FADE_S, TRIM_FADE_S)
        dur = len(seg) / sr
        seg, dinfo = deess(seg, sr, speech_rms_db(seg, sr))
        if dur >= SHORT_CLIP_S:
            mode, target, meas = 'lufs', TARGET_LUFS, (lambda z: lufs(z, sr))
        elif level_rule == 'v3' and dur >= SHORT_LUFS_MIN_S and lufs(seg, sr) is not None:
            mode, meas = 'lufs-short', (lambda z: lufs(z, sr))
            target = TARGET_LUFS + (MICRO_OFFSET_V3_DB if micro else 0.0)
        else:
            if ref_rms_db is None:
                raise ValueError('klip %.3f sn < 1 sn: --ref-rms-db gerekli' % dur)
            mode = 'rms'
            target = float(ref_rms_db) + (MICRO_OFFSET_DB if micro else 0.0)
            meas = lambda z: speech_rms_db(z, sr)
        out, g_db, g_lim = _level(seg, sr, meas, target)
        passes.append({'trim_thr_in_dbfs': r3(TRIM_THR_DBFS - g0, 2), 'applied_gain_db': r3(g_db, 2)})
        if abs(g_db - g0) <= 0.25:
            break
        g0 = g_db
        nf, nl = edges(g0)
        if (nf, nl) == (first, last):
            break
        first, last = nf, nl
    rep.update({'trim_thr_source': thr_src, 'trim_passes': passes,
                'trim_in_sec': [r3(first / sr), r3(last / sr)], 'lead_pad_ms': r3(pad_l / sr * 1000, 1),
                'tail_pad_ms': r3(pad_r / sr * 1000, 1), 'deess': dinfo, 'level_mode': mode,
                'level_rule': level_rule})
    if mode == 'rms':
        rep.update({'ref_rms_db': float(ref_rms_db), 'micro': bool(micro)})
    if mode == 'lufs-short':
        rep.update({'micro': bool(micro), 'micro_offset_db': MICRO_OFFSET_V3_DB if micro else 0.0})
    tol = LUFS_TOL if mode != 'rms' else 0.5

    def chain(tgt, out, g_db, g_lim):
        """Tepe yönetimi (v3): eski zincir sonucu verilir; gerekirse yumuşak aday denenir, iyisi seçilir."""
        lim = float(-db(g_lim.min()))
        pk = {'chain': 'limiter', 'trigger_limiter_db': r3(lim, 2), 'peak_mode': peak_mode}
        if peak_mode == 'auto' and lim > SOFT_TRIGGER_DB:
            total_old = g_db - 20.0 * np.log10(np.maximum(g_lim, 1e-12))
            sdr_old = fast_sdr_db(out, seg, total_old)
            pk['candidates'] = {'limiter': {'fast_sdr_db': r3(sdr_old, 2), 'limiter_max_db': r3(lim, 2)}}
            soft = _level_soft(seg, sr, meas, tgt)
            if soft is not None:
                y2, total2, info2, g_lim2 = soft
                sdr2 = fast_sdr_db(y2, seg, total2)
                lv2, tp2 = meas(y2), true_peak_db(y2)
                ok2 = lv2 is not None and abs(lv2 - tgt) <= tol and tp2 <= TP_MAX_DBTP and not clipping(y2)['clipped']
                pk['candidates']['soft+limiter'] = dict(info2, fast_sdr_db=r3(sdr2, 2), checks_ok=bool(ok2))
                if ok2 and sdr2 is not None and sdr_old is not None and sdr2 > sdr_old:
                    out, g_lim = y2, g_lim2
                    lim = float(-db(g_lim.min()))
                    pk.update({'chain': 'soft+limiter', 'comp_gr_max_db': info2['comp_gr_max_db'],
                               'comp_sec_over_1db': info2['comp_sec_over_1db'], 'depth_db': info2['depth_db'],
                               'residual_met': info2['residual_met']})
            pk['fast_sdr_db'] = pk['candidates'].get(pk['chain'], {}).get('fast_sdr_db')
        return out, g_lim, lim, pk

    out, g_lim, lim_db, peak = chain(target, out, g_db, g_lim)
    if mode == 'lufs-short' and peak_mode == 'auto' and lim_db > SHORT_LIM_MAX_DB:
        # Kısa parça: sınırlayıcı payı > 3 dB kalıyorsa hedef 0,5 dB adımlarla en çok SHORT_MAX_DROP_DB iner
        # (kalan konuşma/yatak açığı karışımda yerel yatak kısmasıyla kapanır; mix.py).
        t0, t = target, target
        tries = [[r3(t, 2), r3(lim_db, 2)]]
        while lim_db > SHORT_LIM_MAX_DB and t - 0.5 >= TARGET_LUFS - SHORT_MAX_DROP_DB - 1e-9:
            t -= 0.5
            o, gdb, gl = _level(seg, sr, meas, t)
            out, g_lim, lim_db, peak = chain(t, o, gdb, gl)
            tries.append([r3(t, 2), r3(lim_db, 2)])
        target = t
        rep['short_level_capped'] = {'from_lufs': t0, 'to_lufs': t, 'tries_target_limiter': tries,
                                     'rule': 'sınırlayıcı payı ≤ %.1f dB; hedef en çok %.1f dB iner' % (
                                         SHORT_LIM_MAX_DB, SHORT_MAX_DROP_DB)}
    rep['peak'] = peak
    final_level = meas(out)
    tp = true_peak_db(out)
    lim_sec = float(np.sum(g_lim < 10 ** (-0.1 / 20))) / sr
    lim_sec1 = float(np.sum(g_lim < 10 ** (-1.0 / 20))) / sr
    rep.update({'out_duration': r3(dur), 'target': target, 'level': r3(final_level, 2),
                'true_peak_dbtp': r3(tp, 2), 'limiter_max_db': r3(lim_db, 2), 'limiter_sec': r3(lim_sec, 3),
                'limiter_sec_over_1db': r3(lim_sec1, 3),
                'rms_db': r3(speech_rms_db(out, sr), 2), 'lufs': r3(lufs(out, sr), 2)})
    rep['checks'] = {'level_in_tolerance': bool(final_level is not None and abs(final_level - target) <= tol),
                     'true_peak_ok': bool(tp <= TP_MAX_DBTP), 'no_clipping': not clipping(out)['clipped']}
    rep['pass'] = all(rep['checks'].values())
    if lim_db > LIM_FLAG_DB:
        rep['flag'] = 'kulak: gerçek tepe sınırlayıcısı %.1f dB kıstı (%.2f sn > 1 dB)' % (lim_db, lim_sec1)
    return out, rep


# ------------------------------------------------------------------------------------------------ metin
def tr_lower(s):
    s = unicodedata.normalize('NFC', s)
    s = s.replace('İ', 'i').replace('I', 'ı').lower().replace('̇', '')
    return s


def _digits(tok):
    def rep(m):
        v = int(m.group(0))
        return TR_DIGITS[v] if 0 <= v <= 10 and len(m.group(0)) <= 2 else m.group(0)
    return re.sub(r'\d+', rep, tok)


def normtext(s):
    """Türkçe küçük harf (İ→i, I→ı); noktalama, üç nokta, tırnak, çizgi silinir; kesme işareti silinir (PLAN D.6:
    "Ahmet'in"→"ahmetin"); düzeltme işareti (â î û) kaldırılır (PLAN D.6); 0–10 rakamları Türkçe sözcük; boşluk tek."""
    s = tr_lower(s)
    s = s.replace('â', 'a').replace('î', 'i').replace('û', 'u')
    s = re.sub(r"['’‘`´ʼ]", '', s)
    s = re.sub(r'[^\w\s]|_', ' ', s)
    return [_digits(w) for w in s.split()]


def compare_text(a, b):
    wa, wb = normtext(a), normtext(b)
    if wa == wb:
        return True, []
    diff = []
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(a=wa, b=wb, autojunk=False).get_opcodes():
        if op != 'equal':
            diff.append({'op': op, 'a_pos': i1, 'a': wa[i1:i2], 'b_pos': j1, 'b': wb[j1:j2]})
    return False, diff


# ------------------------------------------------------------------------------------------------ v3: Scribe yazım istisnaları
# PLAN.v3 §A.3 / §E.2. Scribe'ın yazımı ile metnin yazımı arasında YALNIZ şu iki fark eş sayılır (liste Türkçe editörün
# onayına gider: render/scribe_istisnalari.md). Kullanılan her istisna sonuçta ayrıca raporlanır (sessizce yutulmaz).
#   1) birleşik: bitişik yazılan birleşik sözcüğün ayrı yazımı (ya da tersi): "sırtüstü" = "sırt üstü". Parçaların
#      her biri ≥ 2 harf olmalı ve hiçbiri ayrı yazılan bağlaç/soru eki olmamalı (de/da, ki, mi…): "sende" ≠ "sen de",
#      "yada" ≠ "ya da" (anlam ve vurgu değişir; bunlar istisna değildir).
#   2) ek-fiil: ek-fiilin bitişik ve ayrı yazımı: -(y)sA = ise, -(y)DI = idi, -(y)mIş = imiş (ünlü uyumu, ünlüyle biten
#      gövdede y kaynaştırması, sert ünsüzden sonra -tI); kişi eki -m/-n/-k iki yazımda da aynı: "nefesteyse" =
#      "nefeste ise", "hastaydı" = "hasta idi", "kitaptı" = "kitap idi", "yorgunmuş" = "yorgun imiş", "isem" = "-(y)sAm".
SCRIBE_CLITICS = frozenset(['de', 'da', 'ki', 'mi', 'mı', 'mu', 'mü', 'ise', 'idi', 'imiş'])
_BACK, _FRONT = set('aıou'), set('eiöü')
_VOICELESS = set('çfhkpsşt')
_COPULA = {'ise': 'sA', 'idi': 'DI', 'imiş': 'mIş'}
_PERSON = ('', 'm', 'n', 'k')


def _last_vowel(w):
    for ch in reversed(w):
        if ch in _BACK or ch in _FRONT:
            return ch
    return None


def copula_fuse(stem, cop):
    """Ayrı yazılan ek-fiili gövdeye bitişik yazar: ('nefeste', 'ise') → 'nefesteyse'. Tanınmayan ek-fiilde None."""
    base = None
    for c in _COPULA:
        if cop.startswith(c) and cop[len(c):] in _PERSON:
            base, person = c, cop[len(c):]
            break
    if base is None:
        return None
    v = _last_vowel(stem)
    if v is None:
        return None
    A = 'a' if v in _BACK else 'e'
    I = {'a': 'ı', 'ı': 'ı', 'o': 'u', 'u': 'u', 'e': 'i', 'i': 'i', 'ö': 'ü', 'ü': 'ü'}[v]
    vowel_final = stem[-1] in _BACK or stem[-1] in _FRONT
    buf = 'y' if vowel_final else ''
    D = 't' if (not vowel_final and stem[-1] in _VOICELESS) else 'd'
    suf = _COPULA[base].replace('A', A).replace('I', I).replace('D', D)
    return stem + buf + suf + person


def _scribe_align(wa, wb):
    """wa ile wb'yi sözcük sözcük hizalar; eşit olmayan yerde yalnız iki istisnayı dener. Dönüş (eşit mi, kullanılanlar)."""
    i = j = 0
    used = []
    while i < len(wa) or j < len(wb):
        if i < len(wa) and j < len(wb) and wa[i] == wb[j]:
            i += 1
            j += 1
            continue
        hit = None
        for (x, y, xi, yj, side) in ((wa, wb, i, j, 'b'), (wb, wa, j, i, 'a')):
            if xi >= len(x):
                continue
            for k in (2, 3):                                   # 1) birleşik: x[xi] = y[yj] + … + y[yj+k−1]
                parts = y[yj:yj + k]
                if len(parts) == k and ''.join(parts) == x[xi] and all(len(p) >= 2 for p in parts) \
                        and not any(p in SCRIBE_CLITICS for p in parts):
                    hit = ('birleşik', side, x[xi], parts, 1, k)
                    break
            if hit:
                break
            if yj + 1 < len(y) and copula_fuse(y[yj], y[yj + 1]) == x[xi]:   # 2) ek-fiil
                hit = ('ek-fiil', side, x[xi], y[yj:yj + 2], 1, 2)
                break
        if not hit:
            return False, used
        rule, side, fused, parts, nx, ny = hit
        used.append({'rule': rule, 'fused': fused, 'split': list(parts), 'split_in': side, 'a_pos': i, 'b_pos': j})
        if side == 'b':          # ayrı yazım b'de
            i, j = i + nx, j + ny
        else:
            i, j = i + ny, j + nx
    return True, used


def scribe_equal(tts, scribe, exceptions=True):
    """SPEC §4.2 + v3 eki: normalleştirilmiş sözcük dizisi birebir aynı mı; değilse (exceptions=True) yalnız iki yazım
    istisnasıyla mı eşit. Dönüş {equal, strict_equal, exceptions, diff}."""
    wa, wb = normtext(tts), normtext(scribe)
    strict, diff = compare_text(tts, scribe)
    if strict:
        return {'equal': True, 'strict_equal': True, 'exceptions': [], 'diff': []}
    if exceptions:
        ok, used = _scribe_align(wa, wb)
        if ok:
            return {'equal': True, 'strict_equal': False, 'exceptions': used, 'diff': diff}
    return {'equal': False, 'strict_equal': False, 'exceptions': [], 'diff': diff}


def syllables(text):
    return sum(1 for ch in text if ch in 'aeıioöuüâîûAEIİOÖUÜÂÎÛ')


def unit_pieces(unit):
    """Birimin kesilecek parçaları: [{name, text, keep, syll}] (SPEC §1, §3).
    Taşıyıcıda tts öğe metinlerinden önce bir ön söz taşıyorsa ("sayıyorum:") o '_pre' parçası olur ve atılır."""
    if unit.get('kind') == 'carrier':
        items = unit['items']
        texts = [unit['itemText'][i] for i in items]
        tw = normtext(unit['tts'])
        iw = [w for t in texts for w in normtext(t)]
        out = []
        if tw != iw:
            if len(tw) > len(iw) and tw[len(tw) - len(iw):] == iw:
                low = tr_lower(unit['tts'])
                idx = low.find(tr_lower(texts[0]))
                pre = unit['tts'][:idx].strip() if idx > 0 else ' '.join(tw[:len(tw) - len(iw)])
                out.append({'name': '_pre', 'text': pre, 'keep': False, 'syll': syllables(pre)})
            else:
                raise ValueError('taşıyıcı tts öğe metinleriyle uyuşmuyor: %s' % unit.get('id'))
        out += [{'name': i, 'text': t, 'keep': True, 'syll': syllables(t)} for i, t in zip(items, texts)]
        return out
    sents = unit.get('sentences') or [unit['tts']]
    return [{'name': 's%d' % (i + 1), 'text': t, 'keep': True, 'syll': syllables(t)} for i, t in enumerate(sents)]


# ------------------------------------------------------------------------------------------------ F0 eklemi
def f0_edge(x, sr, where, sex=None, thr_db=None, win=EDGE_WIN_S):
    """Konuşmanın son ('end') ya da ilk ('start') win sn'sindeki sesli karelerin geometrik ortalama F0'ı."""
    if thr_db is None:
        thr_db, _ = silence_threshold_in(x, sr)
    on, off, *_ = activity(x, sr, thr_db)
    if on is None:
        return None, 0, False
    times, f, voiced = voiced_f0(x, sr, sex, thr_db)
    for w, widened in ((win, False), (2 * win, True)):
        if where == 'end':
            m = voiced & (times >= off - w) & (times <= off)
        else:
            m = voiced & (times >= on) & (times <= on + w)
        if m.sum() >= 3:
            return float(np.exp(np.mean(np.log(f[m])))), int(m.sum()), widened
    return None, int(m.sum()), True


def f0_step(xa, xb, sr=SR, sex=None, thr_a=None, thr_b=None):
    fa, na, wa = f0_edge(xa, sr, 'end', sex, thr_a)
    fb, nb, wb = f0_edge(xb, sr, 'start', sex, thr_b)
    res = {'a_end_hz': r3(fa, 1), 'b_start_hz': r3(fb, 1), 'a_voiced_frames': na, 'b_voiced_frames': nb,
           'widened_to_1s': bool(wa or wb), 'limit_st': JOIN_MAX_ST}
    if fa is None or fb is None:
        res.update({'step_st': None, 'pass': None, 'note': 'yeterli sesli kare yok; ölçülemedi'})
        return res
    st = 12 * math.log2(fb / fa)
    res.update({'step_st': r3(st, 2), 'abs_step_st': r3(abs(st), 2), 'pass': abs(st) <= JOIN_MAX_ST})
    return res


# ------------------------------------------------------------------------------------------------ sıralama (§4.1)
W_RATE, W_DUR, W_F0SD, W_JOIN, W_MATCH_ST, W_MATCH_RATE = 0.3, 0.05, 0.5, 2.0, 0.5, 0.3   # VARSAYIM: 1 ceza birimi


def _take_key(p):
    m = re.search(r't(\d+)', os.path.basename(p))
    return (int(m.group(1)) if m else 10 ** 6, p)


def evaluate_take(path, unit, sex):
    """Bir çekimin §4.1 ölçüleri (dosyaya yazmadan)."""
    rec = {'take': os.path.basename(path), 'file': os.path.abspath(path)}
    try:
        x, sr = load(path)
    except Exception as ex:
        rec['mandatory_fail'] = ['çözülemedi: %s' % ex]
        return rec
    a = analyze_array(x, sr, unit.get('syllables') or syllables(unit['tts']), unit.get('phase'), sex)
    rec['analysis'] = a
    fails = []
    if a.get('error'):
        fails.append(a['error'])
        rec['mandatory_fail'] = fails
        return rec
    if a['clipping']['clipped']:
        fails.append('kırpılma (%d örnek)' % a['clipping']['count'])
    if a['clicks']['count'] > 0:
        fails.append('tık %d: %s' % (a['clicks']['count'], a['clicks']['times'][:5]))
    pieces = unit_pieces(unit)
    k = len(pieces)
    thr = a['thr_db']
    cuts, meta, info = plan_cuts(x, sr, k, thr, sex)
    rec['cut'] = meta
    if cuts is None:
        fails.append('kesim tutmuyor: %d parça gerekli, %d bulundu' % (k, meta['found']))
    else:
        parts, bounds = split_at(x, cuts, sr)
        pm = []
        for p, pc, s0, s1 in zip(pieces, parts, bounds[:-1], bounds[1:]):
            sm = speech_measure(pc, sr, thr, sex)
            pm.append({'name': p['name'], 'keep': p['keep'], 'start': r3(s0 / sr), 'end': r3(s1 / sr),
                       'speech_sec': r3(sm['speech_sec']), 'syll': p['syll'],
                       'rate': r3(p['syll'] / sm['speech_sec'], 2) if sm['speech_sec'] > 0 else None})
        meta['cuts_sec'] = [r3(c / sr, 4) for c in cuts]
        meta['pieces'] = pm
        if k > 1:
            dev = boundary_alignment([q['speech_sec'] or 0 for q in pm], [q['syll'] for q in pm])
            meta['boundary_misalign'] = r3(dev, 3)
            meta['cut_suspect'] = bool(dev is not None and dev > CUT_MISALIGN_MAX)
        if unit.get('kind') == 'carrier' and k > 1:
            joins = []
            kept = [(p, pc) for p, pc in zip(pieces, parts) if p['keep']]
            for (p1, c1), (p2, c2) in zip(kept[:-1], kept[1:]):
                j = f0_step(c1, c2, sr, sex, thr, thr)
                joins.append({'from': p1['name'], 'to': p2['name'], 'step_st': j['step_st'],
                              'a_hz': j['a_end_hz'], 'b_hz': j['b_start_hz'], 'widened': j['widened_to_1s']})
            rec['joins'] = joins
            steps = [abs(j['step_st']) for j in joins if j['step_st'] is not None]
            rec['join_max_st'] = r3(max(steps), 2) if steps else None
            rec['join_unmeasured'] = [j['from'] + '→' + j['to'] for j in joins if j['step_st'] is None]
    if fails:
        rec['mandatory_fail'] = fails
    return rec


def rank_dir(d, unit, sex, match_f0=None, match_rate=None):
    takes = sorted(glob.glob(os.path.join(d, 't*.mp3')), key=_take_key)
    recs = [evaluate_take(p, unit, sex) for p in takes]
    decoded = [r for r in recs if 'analysis' in r and r['analysis'].get('active_sec')]
    med = float(np.median([r['analysis']['active_sec'] for r in decoded])) if decoded else None
    valid = [r for r in recs if not r.get('mandatory_fail')]
    excluded = [{'take': r['take'], 'reasons': r['mandatory_fail']} for r in recs if r.get('mandatory_fail')]
    sds = [r['analysis']['f0_sd_semitones'] for r in valid if r['analysis'].get('f0_sd_semitones') is not None]
    sd_min = min(sds) if sds else 0.0
    phase = unit.get('phase')
    for r in valid:
        a = r['analysis']
        art = a.get('articulation')
        reasons, soft, pen = [], [], {}
        if art is None:
            soft.append('eklemleme ölçülemedi')
            pen['rate'] = 3.0
        elif phase == 'Derin':
            over = max(0.0, art - DERIN_CEIL)
            pen['rate'] = over / W_RATE
            if over > 0:
                soft.append('Derin tavanı aşıldı: %.2f > %.1f hece/sn (VARSAYIM, raporlanır)' % (art, DERIN_CEIL))
            else:
                reasons.append('eklemleme %.2f ≤ %.1f' % (art, DERIN_CEIL))
        else:
            dist = max(0.0, RATE_BAND[0] - art, art - RATE_BAND[1])
            pen['rate'] = dist / W_RATE
            if dist > 0:
                soft.append('eklemleme %.2f bant dışı (%.1f–%.1f)' % (art, RATE_BAND[0], RATE_BAND[1]))
            else:
                reasons.append('eklemleme %.2f bantta' % art)
        dd = abs(a['active_sec'] - med) / med if med else 0.0
        pen['dur'] = dd / W_DUR
        reasons.append('süre %.2f sn, ortancadan %%%.1f' % (a['active_sec'], 100 * dd))
        sd = a.get('f0_sd_semitones')
        pen['f0sd'] = ((sd - sd_min) / W_F0SD) if sd is not None else 3.0
        reasons.append('F0 yayılımı %s yt' % (sd if sd is not None else '?'))
        if 'join_max_st' in r:
            jm = r['join_max_st']
            if jm is None:
                soft.append('taşıyıcı eklemi ölçülemedi')
                pen['join'] = 1.0
            else:
                pen['join'] = jm / W_JOIN
                if jm > JOIN_MAX_ST:
                    soft.append('taşıyıcı eklemi %.2f > %.1f yt' % (jm, JOIN_MAX_ST))
                else:
                    reasons.append('eklem en çok %.2f yt' % jm)
            if r.get('join_unmeasured'):
                soft.append('ölçülemeyen eklem: %s' % ', '.join(r['join_unmeasured']))
        if r.get('cut', {}).get('cut_suspect'):
            soft.append('kesim hece payından sapıyor (%.3f > %.2f)' % (r['cut']['boundary_misalign'], CUT_MISALIGN_MAX))
        if match_f0 or match_rate:
            md = 0.0
            if match_f0 and a.get('f0_geo_hz'):
                md += abs(12 * math.log2(a['f0_geo_hz'] / match_f0)) / W_MATCH_ST
            if match_rate and art:
                md += abs(art - match_rate) / W_MATCH_RATE
            pen['match'] = md
        r['penalties'] = {k: r3(v, 3) for k, v in pen.items()}
        r['score'] = r3(sum(v for k, v in pen.items() if k != 'match'), 3)
        r['soft_violations'] = soft
        r['reasons'] = reasons
    if match_f0 or match_rate:
        tier = lambda r: 1 if any('eklem' in s for s in r['soft_violations']) else 0
        valid.sort(key=lambda r: (tier(r), r['penalties'].get('match', 0.0), r['score']))
        order_rule = 'SPEC §4.4: geçerli çekimler içinde sağ taşıyıcıya perde+hız yakınlığı (eklem ihlali olanlar sonda)'
    else:
        valid.sort(key=lambda r: (len(r['soft_violations']), r['score']))
        order_rule = 'SPEC §4.1: zorunlu (a,b) geçenler; önce yumuşak ihlal sayısı (c,f,kesim kuşkusu), sonra ceza toplamı'
    ranking = []
    for i, r in enumerate(valid, 1):
        a = r['analysis']
        ranking.append({
            'rank': i, 'take': r['take'], 'file': r['file'], 'score': r['score'], 'penalties': r['penalties'],
            'soft_violations': r['soft_violations'], 'reasons': r['reasons'],
            'metrics': {k: a.get(k) for k in ('duration', 'active_sec', 'speech_sec', 'articulation', 'f0_mean_hz',
                                              'f0_geo_hz', 'f0_sd_semitones', 'lufs', 'rms_db', 'true_peak_dbtp',
                                              'sibilance_ratio', 'pause_total_sec')},
            'cut': r.get('cut'), 'joins': r.get('joins'), 'join_max_st': r.get('join_max_st'),
        })
    return {'unit': unit.get('id'), 'phase': phase, 'sex': sex, 'pieces_needed': len(unit_pieces(unit)),
            'takes': [os.path.basename(p) for p in takes], 'median_active_sec': r3(med),
            'ranking': ranking, 'excluded': excluded, 'order_rule': order_rule,
            'weights_note': 'VARSAYIM ceza birimleri: hız %.2f hece/sn, süre %%%d, F0 yayılımı %.1f yt, eklem %.1f yt' % (
                W_RATE, int(W_DUR * 100), W_F0SD, W_JOIN),
            'note': 'Sıralama yalnız nesneldir; §4.2 Scribe doğrulaması ayrıca yapılmalıdır.'}


# ------------------------------------------------------------------------------------------------ komut satırı
def _arg_text(s):
    if s.startswith('@') and os.path.isfile(s[1:]):
        with open(s[1:], encoding='utf-8') as f:
            return f.read()
    return s


def _dump(o):
    print(json.dumps(o, ensure_ascii=False, indent=1, default=lambda v: v.item() if hasattr(v, 'item') else str(v)))


def main(argv=None):
    ap = argparse.ArgumentParser(prog='audio.py', description=__doc__.split('\n')[0])
    sp = ap.add_subparsers(dest='cmd', required=True)
    p = sp.add_parser('analyze')
    p.add_argument('file')
    p.add_argument('--syll', type=int, required=True)
    p.add_argument('--phase', required=True)
    p.add_argument('--sex', choices=['f', 'm'], required=True)
    p = sp.add_parser('cut')
    p.add_argument('file')
    p.add_argument('--n', type=int, required=True)
    p.add_argument('--outdir', required=True)
    p.add_argument('--names')
    p.add_argument('--sylls', help='parça başına hece (virgülle), kesim hizası denetimi için')
    p.add_argument('--sex', choices=['f', 'm'])
    p = sp.add_parser('process')
    p.add_argument('inp')
    p.add_argument('--out', required=True)
    p.add_argument('--sex', choices=['f', 'm'], required=True)
    p.add_argument('--micro', action='store_true')
    p.add_argument('--ref-rms-db', type=float)
    p.add_argument('--level-rule', choices=['v3', 'v2'], default='v3', help='< 1 sn parça düzeyi (SPEC v3 eki)')
    p.add_argument('--peak-mode', choices=['auto', 'limiter'], default='auto', help='v3 tepe yönetimi ya da v2 sınırlayıcı')
    p = sp.add_parser('normtext')
    p.add_argument('text')
    p = sp.add_parser('compare')
    p.add_argument('a')
    p.add_argument('b')
    p.add_argument('--strict', action='store_true', help='v2: Scribe yazım istisnaları olmadan')
    p = sp.add_parser('f0step')
    p.add_argument('a')
    p.add_argument('b')
    p.add_argument('--sex', choices=['f', 'm'])
    p = sp.add_parser('rank')
    p.add_argument('dir')
    p.add_argument('--unit-json', required=True)
    p.add_argument('--sex', choices=['f', 'm'], required=True)
    p.add_argument('--match-f0', type=float)
    p.add_argument('--match-rate', type=float)
    a = ap.parse_args(argv)
    try:
        if a.cmd == 'analyze':
            _dump(analyze_file(a.file, a.syll, a.phase, a.sex))
            return 0
        if a.cmd == 'cut':
            x, sr = load(a.file)
            names = a.names.split(',') if a.names else ['p%d' % (i + 1) for i in range(a.n)]
            if len(names) != a.n:
                raise ValueError('--names sayısı --n ile aynı olmalı')
            cuts, meta, info = plan_cuts(x, sr, a.n, None, a.sex)
            out = {'file': os.path.abspath(a.file), 'n': a.n, 'thr_db': r3(info['thr_db'], 2),
                   'pauses': [[r3(s), r3(e)] for s, e in info['pauses']],
                   'breaths': [[r3(s), r3(e)] for s, e in info['breaths']], **meta}
            if cuts is None:
                out['ok'] = False
                out['error'] = '%d parça bulunamadı (boşluk %d)' % (a.n, meta['gaps_available'])
                _dump(out)
                return 2
            parts, bounds = split_at(x, cuts, sr)
            os.makedirs(a.outdir, exist_ok=True)
            sylls = [int(v) for v in a.sylls.split(',')] if a.sylls else None
            pcs = []
            for i, (nm, pc) in enumerate(zip(names, parts)):
                fp = os.path.join(os.path.abspath(a.outdir), nm + '.wav')
                write_wav(fp, pc, sr)
                sm = speech_measure(pc, sr, info['thr_db'], a.sex)
                d = {'name': nm, 'file': fp, 'start': r3(bounds[i] / sr, 4), 'end': r3(bounds[i + 1] / sr, 4),
                     'dur': r3(len(pc) / sr), 'speech_sec': r3(sm['speech_sec'])}
                if sylls:
                    d['syll'] = sylls[i]
                    d['rate'] = r3(sylls[i] / sm['speech_sec'], 2) if sm['speech_sec'] > 0 else None
                pcs.append(d)
            out.update({'ok': True, 'cuts': [r3(c / sr, 4) for c in cuts], 'pieces': pcs})
            if sylls and len(sylls) == a.n and a.n > 1:
                dev = boundary_alignment([q['speech_sec'] for q in pcs], sylls)
                out['boundary_misalign'] = r3(dev, 3)
                out['cut_suspect'] = bool(dev is not None and dev > CUT_MISALIGN_MAX)
            _dump(out)
            return 0
        if a.cmd == 'process':
            x, sr = load(a.inp)
            y, rep = process_array(x, sr, a.sex, a.micro, a.ref_rms_db, a.level_rule, a.peak_mode)
            write_wav(a.out, y, sr)
            chk = sf.info(a.out)
            rep.update({'in': os.path.abspath(a.inp), 'out': os.path.abspath(a.out),
                        'out_format': {'sr': chk.samplerate, 'channels': chk.channels, 'subtype': chk.subtype}})
            _dump(rep)
            return 0 if rep['pass'] else 1
        if a.cmd == 'normtext':
            _dump(normtext(_arg_text(a.text)))
            return 0
        if a.cmd == 'compare':
            ta, tb = _arg_text(a.a), _arg_text(a.b)
            res = scribe_equal(ta, tb, exceptions=not a.strict)
            if res['equal']:
                out = {'equal': True, 'words': len(normtext(ta)), 'strict_equal': res['strict_equal']}
                if res['exceptions']:
                    out.update({'exceptions': res['exceptions'], 'a': normtext(ta), 'b': normtext(tb),
                                'note': 'yalnız SPEC v3 eki Scribe yazım istisnalarıyla eşit (Türkçe editör onayı)'})
                _dump(out)
                return 0
            _dump({'equal': False, 'a': normtext(ta), 'b': normtext(tb), 'diff': res['diff'],
                   'exceptions_tried': not a.strict})
            for d in res['diff']:
                print('%s @a%d/b%d: -%s +%s' % (d['op'], d['a_pos'], d['b_pos'], ' '.join(d['a']), ' '.join(d['b'])))
            return 1
        if a.cmd == 'f0step':
            xa, sr = load(a.a)
            xb, _ = load(a.b)
            r = f0_step(xa, xb, sr, a.sex)
            r.update({'a': os.path.abspath(a.a), 'b': os.path.abspath(a.b)})
            _dump(r)
            return 0
        if a.cmd == 'rank':
            u = _arg_text(a.unit_json)
            if os.path.isfile(u):
                with open(u, encoding='utf-8') as f:
                    u = f.read()
            unit = json.loads(u)
            r = rank_dir(a.dir, unit, a.sex, a.match_f0, a.match_rate)
            _dump(r)
            return 0 if r['ranking'] else 2
    except (ValueError, RuntimeError, sf.LibsndfileError, OSError, KeyError, json.JSONDecodeError) as ex:
        _dump({'error': str(ex), 'cmd': a.cmd})
        return 3
    return 3


if __name__ == '__main__':
    sys.exit(main())
