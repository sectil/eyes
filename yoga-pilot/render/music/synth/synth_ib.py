#!/usr/bin/env python3
"""synth_ib.py — ilk bölüm yerel müzik sentezi (ücretsiz; VARSAYIM tasarım kararları aşağıda).

Ders 5 "Tek Nokta" (ders verisi music.source: "Saf ton ElevenLabs Music'te temiz çıkmazsa ton ... sentezlenebilir
(açık karar)"): Sol'de sinüs benzeri sürekli ton. Her kısmi ses tek sestir; sağ kanal sabit küçük faz farkıyla
(0,3–0,8 rad) çalar (genişlik; aynı frekans olduğu için genlik vuruşu yok). İlk sürümde üç ayrık (±0,6 sent) ses vardı:
≈ 7 sn periyotla vurdu, yatak ST'de 4 dB dalgalandı (2,6 dB/sn; ölçüldü, 2026-09-30) — bu yüzden bırakıldı.
2. ve 3. harmonikler −26/−34 dB (sıcaklık, telefon hoparlöründe duyulurluk). Temel Sol4 = 392 Hz
(300 Hz altı enerji yok: PLAN.v2 hoparlör ölçütü). Kısmi seslerin genliği zamanın fonksiyonudur (≥ 8 sn yumuşak geçiş),
böylece evre dokuları tek bir kesintisiz tondan doğar; dosya ya da bölüm tekrar etmez.
  Varış    : Sol4 + Re5 (−3 dB)              (geniş ışık)
  C1       : Sol4 + Re5 (−10 dB)             (daralan)
  C2       : Sol4 + Re5 (−18 dB)             (çok hafif ikinci kısmi ses; sayma)
  Derin    : Sol4                            (tek nokta)
  Kapanış  : Sol4 + Re5 (−4 dB) + Sol5 (−9 dB); "chord" ipucunda + Si4 (−8 dB) (tek sıcak Sol majör akor)
Genlik kıpırtısı: 60 BPM hissi için ±0,15 dB, 1 Hz, fazı yavaş kayan (ders verisi pulseNote; ölçülür: nabız belirginliği
< 0,5 olmalı).
Çan: Sol5 temelli, çan benzeri ayrık kısmi sesler (1, 2,0, 2,76, 4,07, 5,40), 12 ms yumuşak saldırı, 5 sn sönüm.
"""
import json
import math
import sys

import numpy as np
import soundfile as sf

SR = 44100
G4, D5, G5, B4 = 392.0, 587.33, 784.0, 493.88
HARM = ((2, -26.0), (3, -34.0))


def _partial(f, n, rng, t0=0.0):
    """Tek kısmi ses (temel + iki harmonik), stereo: sağ kanal sabit faz farkıyla. Genlik 1 civarı."""
    t = (np.arange(n) / SR + t0)
    ph = rng.uniform(0, 2 * np.pi)
    dl = rng.uniform(0.3, 0.8)
    hph = [rng.uniform(0, 2 * np.pi) for _ in HARM]
    L = np.sin(2 * np.pi * f * t + ph)
    R = np.sin(2 * np.pi * f * t + ph + dl)
    for (h, db), p in zip(HARM, hph):
        g = 10 ** (db / 20)
        L += g * np.sin(2 * np.pi * f * h * t + p)
        R += g * np.sin(2 * np.pi * f * h * t + p + h * dl)
    return np.stack([L, R], 1) * math.sqrt(0.5)


def env_from_points(n, pts):
    """pts: [(t, dB)] → genlik zarfı (dB'de doğrusal aradeğer, −120 = yok)."""
    t = np.arange(n) / SR
    tt = [p[0] for p in pts]
    dd = [p[1] for p in pts]
    db = np.interp(t, tt, dd)
    return np.where(db <= -119, 0.0, 10 ** (db / 20))


def tone_bed_d05(T, cues, xf=10.0, seed=5):
    """cues: {'c1': t, 'c2': t, 'derin': t, 'kapanis': t, 'chord': t} (olmayanlar None). Dönüş: (stereo, bilgi)."""
    n = int(T * SR)
    rng = np.random.default_rng(seed)
    # D5 kısmi sesi zarfı
    OFF = -120.0
    d5 = [(0.0, -3.0)]
    g5 = [(0.0, OFF)]
    b4 = [(0.0, OFF)]
    if cues.get('c1') is not None:
        d5 += [(cues['c1'], -3.0), (cues['c1'] + xf, -10.0)]
    if cues.get('c2') is not None:
        d5 += [(cues['c2'], -10.0), (cues['c2'] + xf, -18.0)]
    if cues.get('derin') is not None:
        last = d5[-1][1]
        d5 += [(cues['derin'], last), (cues['derin'] + xf, -40.0), (cues['derin'] + xf + 0.01, OFF)]
    if cues.get('kapanis') is not None:
        last = d5[-1][1]
        k = cues['kapanis']
        d5 += [(k, max(last, -40.0)), (k + xf, -4.0)]
        g5 += [(k, -40.0), (k + xf, -9.0)]
    if cues.get('chord') is not None:
        b4 += [(cues['chord'], -40.0), (cues['chord'] + xf, -8.0)]
    for lst in (d5, g5, b4):
        lst.append((T + 1.0, lst[-1][1]))
    out = _partial(G4, n, rng)
    for f, pts in ((D5, d5), (G5, g5), (B4, b4)):
        e = env_from_points(n, pts)
        if e.max() > 0:
            out += _partial(f, n, rng) * e[:, None]
    # 60 BPM hissi: ±0,15 dB, 1 Hz, fazı yavaş kayan kıpırtı
    t = np.arange(n) / SR
    drift = np.cumsum(rng.normal(0, 0.0005, n))
    trem = 10 ** ((0.15 * np.sin(2 * np.pi * 1.0 * t + drift)) / 20)
    out *= trem[:, None]
    out /= np.abs(out).max() * 1.12
    return out.astype(np.float32), {'d5_db': d5, 'g5_db': g5, 'b4_db': b4, 'xf_s': xf, 'seed': seed}


def bell(seed=11, f0=G5, dur=6.0):
    rng = np.random.default_rng(seed)
    n = int(dur * SR)
    t = np.arange(n) / SR
    parts = ((1.0, 0.0, 5.0), (2.0, -9.0, 3.2), (2.76, -12.0, 2.4), (4.07, -18.0, 1.6), (5.40, -24.0, 1.1))
    s = np.zeros(n)
    for r, db, tau in parts:
        s += 10 ** (db / 20) * np.sin(2 * np.pi * f0 * r * t + rng.uniform(0, 2 * np.pi)) * np.exp(-t / tau)
    att = int(0.012 * SR)
    s[:att] *= 0.5 - 0.5 * np.cos(np.pi * np.arange(att) / att)
    fo = int(0.3 * SR)
    s[-fo:] *= np.linspace(1, 0, fo)
    s /= np.abs(s).max() * 1.12
    return np.stack([s, s], 1).astype(np.float32)


if __name__ == '__main__':
    # örnek: 300 sn'lik bütün evreler (C1 60, C2 120, Derin 180, Kapanış 240, akor 270)
    y, info = tone_bed_d05(300, {'c1': 60, 'c2': 120, 'derin': 180, 'kapanis': 240, 'chord': 270})
    sf.write(sys.argv[1] if len(sys.argv) > 1 else 'd5-ton-ornek.wav', y, SR, subtype='FLOAT')
    sf.write('d5-can.wav', bell(), SR, subtype='FLOAT')
    print(json.dumps({k: v for k, v in info.items()}, default=str)[:400])


# ================================================================================================ Ders 1 bordunu
def breath_curve(t, grid):
    """grid: [(t_başlangıç, t_bitiş, anchor, period, inhale)] → m(t) ∈ [0, 1]: alışta 0→1 (yükselen kosinüs), verişte
    1→0. anchor = serinin ilk 'Al…' anı; döngü bloğun başına ve sonuna doğru aynı periyotla uzar."""
    m = np.zeros(len(t))
    for a, b, anc, P, ins in grid:
        sel = (t >= a) & (t < b)
        ph = np.mod(t[sel] - anc, P)
        up = ph < ins
        v = np.empty(sel.sum())
        v[up] = 0.5 - 0.5 * np.cos(np.pi * ph[up] / ins)
        v[~up] = 0.5 + 0.5 * np.cos(np.pi * (ph[~up] - ins) / (P - ins))
        m[sel] = v
    return m


def drone_d01(T, grid, t_on, t_off, seed=1, bright=0.9, amp_db=1.0):
    """Tanpura benzeri bordun (VARSAYIM tasarım): Re2/La2/Re3/La3/Re4 sürekli kamış benzeri sesler (1/n^1.15 harmonik
    eğimi), her ses iki ayrık kopya (±1,2 sent); 'jawari' parıltısı: her sesin harmoniklerinde 1–2,6 kHz arasında yavaşça
    gezinen biçimlendirici (periyot 7–12 sn, sesler arası bağımsız); nefes eğrisi m(t): alışta üst harmonikler açılır
    (bright) ve düzey +amp_db, verişte kapanır. t_on..t_off dışında sessiz (karıştırıcı ≥ 8 sn çapraz geçişle alır)."""
    rng = np.random.default_rng(seed)
    n = int(T * SR)
    fs = 100
    te = np.arange(int(T * fs) + 2) / fs
    mb = breath_curve(te, grid)
    voices = ((73.42, 0.30), (110.0, 0.35), (146.83, 0.80), (220.0, 0.70), (293.66, 0.55), (440.0, 0.22))
    out = np.zeros((n, 2), dtype=np.float64)
    CH = SR * 20
    for vi, (f, w) in enumerate(voices):
        fc_per = rng.uniform(7.0, 12.0)
        fc_ph = rng.uniform(0, 2 * np.pi)
        fce = 1000.0 * 2.6 ** (0.5 + 0.5 * np.sin(2 * np.pi * te / fc_per + fc_ph))      # 1,0–2,6 kHz
        slow = 10 ** ((0.6 * np.sin(2 * np.pi * te / rng.uniform(23, 41) + rng.uniform(0, 6))) / 20)
        nh = max(4, int(5000 / f))
        for c, cents in enumerate((-1.2, 1.2)):
            ff = f * 2 ** (cents / 1200)
            pan = (-0.3 if c == 0 else 0.3) + rng.uniform(-0.15, 0.15)
            gl, gr = math.cos((pan + 1) * math.pi / 4), math.sin((pan + 1) * math.pi / 4)
            phs = rng.uniform(0, 2 * np.pi, nh)
            envs = []
            for h in range(1, nh + 1):
                fh = ff * h
                base = h ** -1.15
                jaw = 1 + 0.9 * np.exp(-(np.log2(fh / fce)) ** 2 / (2 * 0.3 ** 2))
                br = 1 + bright * mb * min(1.0, (h - 1) / 6.0)
                envs.append(base * jaw * br * slow)
            envs = np.array(envs)
            for s0 in range(0, n, CH):
                s1 = min(n, s0 + CH)
                ts = np.arange(s0, s1) / SR
                ei = np.array([np.interp(ts, te, e) for e in envs])
                x = np.zeros(s1 - s0)
                for h in range(1, nh + 1):
                    x += ei[h - 1] * np.sin(2 * np.pi * ff * h * ts + phs[h - 1])
                out[s0:s1, 0] += w * gl * x
                out[s0:s1, 1] += w * gr * x
    t = np.arange(n) / SR
    g = 10 ** (amp_db * np.interp(t, te, mb) / 20)
    act = ((t >= t_on) & (t < t_off)).astype(np.float64)
    out *= (g * act)[:, None]
    out /= np.abs(out).max() * 1.12
    return out.astype(np.float32), {'voices_hz': [v[0] for v in voices], 'bright': bright, 'amp_db': amp_db,
                                    'grid': grid, 'seed': seed}
