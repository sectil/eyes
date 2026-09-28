# Nefona uyandırma sesleri (3 yeni ses). Kanıt ve eşikler: README.md. Denetim: analyze.py.
# Kullanım: python3 synth.py çıkış_klasörü  → nefona-uyan-{gunisigi,kusbahcesi,marsi}.caf
# Ortak kurallar (telefon hoparlörü: 250 Hz altı neredeyse yok, en verimli 1–4 kHz):
#  - temel frekanslar 392–2637 Hz, kısmi sesler ≤ 7 kHz (örtüşme yok), 180 Hz yüksek geçiren
#  - melodi (McFarlane 2020), ~520 Hz tek harmonikli zengin "çapa" tonu melodinin İÇİNDE (Bruck 2009, Smith 2019)
#  - yumuşak saldırı 8–15 ms (ani başlangıç yok; Kaida 2005), duyulur başlayıp yükselir, −12 LUFS, ≤ −1 dBTP
import os, sys, struct
import numpy as np
from scipy.signal import butter, sosfilt, resample_poly
import pyloudnorm as pyln

SR = 44100
NYQ_LIMIT = 7000.0
rng = np.random.default_rng(20260928)  # her derlemede aynı ses


def hz(note):
    names = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
    n, o = note[:-1], int(note[-1])
    semi = names[n[0]] + (1 if n.endswith('#') else 0)
    return 440.0 * 2 ** ((semi + 12 * (o + 1) - 69) / 12)


def env_ad(n, attack, decay):
    t = np.arange(n) / SR
    a = np.clip(t / attack, 0, 1)
    return a * a * (3 - 2 * a) * np.exp(-t / decay)  # yumuşak (smoothstep) saldırı + üstel sönüm


def partials(f, dur, parts, attack=0.008, tail=0.25, trem=None):
    """parts: [(oran, genlik, sönüm_sn)]; NYQ_LIMIT üstündeki kısmi sesler atlanır."""
    n = int((dur + tail) * SR)
    t = np.arange(n) / SR
    y = np.zeros(n)
    for ratio, amp, dec in parts:
        fr = f * ratio
        if fr > NYQ_LIMIT:
            continue
        # 5 kHz üstü kısmi sesler 7 kHz'e doğru yumuşakça kısılır: hızlı sönen tiz kısmi ses 2 ms'lik parlak "tak"
        # yapıyordu (analyze: iç tık 16,6 dB, Kuş Bahçesi G6 marimbanın 6,3 kHz kısmi sesi)
        amp *= float(np.clip((NYQ_LIMIT - fr) / 2000.0, 0.0, 1.0)) if fr > 5000 else 1.0
        y += amp * np.sin(2 * np.pi * fr * t + rng.uniform(0, 2 * np.pi)) * env_ad(n, attack, dec)
    if trem:
        y *= 10 ** ((trem[1] * np.sin(2 * np.pi * trem[0] * t)) / 20)
    # not bitimi: dur'dan sonra 'tail' içinde yumuşak kapanış (tık yok)
    g = np.ones(n)
    k0 = int(dur * SR)
    g[k0:] = np.cos(np.linspace(0, np.pi / 2, n - k0)) ** 2
    return y * g


def vibraphone(f, dur, vel):
    return vel * partials(f, dur, [(1, 1.0, 1.2), (4, 0.35, 0.4), (10, 0.12, 0.15)], attack=0.006, tail=0.35, trem=(5.0, 2.0))


def marimba(f, dur, vel):
    return vel * partials(f, dur, [(1, 1.0, 0.6), (4, 0.25, 0.08), (9.9, 0.05, 0.03)], attack=0.008, tail=0.3)


def bell(f, dur, vel):
    # inharmonik çan kısmi sesleri (FM yerine toplamsal: örtüşme yok)
    return vel * partials(f, dur, [(1, 1.0, 1.1), (2.76, 0.45, 0.55), (5.40, 0.22, 0.28), (8.93, 0.10, 0.14)], attack=0.010, tail=0.4)


def soft_square(f, dur, vel):
    # 520 Hz civarı "çapa": tek harmonikler, 1/n^1.3, ≤ 6 kHz (sınırlı bant; vızıltısız)
    parts = [(k, 1 / k ** 1.3, 0.35) for k in range(1, 40, 2) if f * k <= 6000]
    return vel * partials(f, dur, parts, attack=0.012, tail=0.03)


def woodblock(f, vel):
    n = int(0.06 * SR)
    noise = rng.standard_normal(n)
    sos = butter(2, [f / 1.12, f * 1.12], 'bandpass', fs=SR, output='sos')
    return vel * sosfilt(sos, noise) * env_ad(n, 0.002, 0.012) * 3.0


def pluck(f, dur, vel):
    # Karplus-Strong; uyarım alçak geçiren gürültü (yumuşak), döngü kaybı ile sönüm
    n = int((dur + 0.3) * SR)
    p = int(round(SR / f))
    buf = sosfilt(butter(2, min(4000, 4 * f), 'lowpass', fs=SR, output='sos'), rng.standard_normal(p))
    y = np.zeros(n)
    y[:p] = buf
    for i in range(p, n):
        y[i] = 0.996 * 0.5 * (y[i - p] + y[i - p - 1 if i - p - 1 >= 0 else i - p])
    y *= env_ad(n, 0.004, 10.0)
    g = np.ones(n)
    k0 = int(dur * SR)
    g[k0:] = np.cos(np.linspace(0, np.pi / 2, n - k0)) ** 2
    return vel * y / (np.abs(y).max() + 1e-9) * g


def chirp(vel, f0=2500.0, f1=4500.0, dur=0.12):
    n = int((dur + 0.03) * SR)
    t = np.arange(n) / SR
    f = f0 + (f1 - f0) * np.clip(t / dur, 0, 1)
    ph = 2 * np.pi * np.cumsum(f) / SR
    am = 0.6 + 0.4 * np.sin(2 * np.pi * 25 * t)
    e = env_ad(n, 0.010, dur * 0.6)
    return vel * np.sin(ph) * am * e


class Track:
    def __init__(self, seconds):
        self.L = np.zeros(int(seconds * SR))
        self.R = np.zeros(int(seconds * SR))

    def add(self, t, sig, pan=0.0):
        i = int(t * SR)
        j = min(len(self.L), i + len(sig))
        if j <= i:
            return
        s = sig[: j - i]
        self.L[i:j] += s * np.sqrt(0.5 * (1 - pan))
        self.R[i:j] += s * np.sqrt(0.5 * (1 + pan))

    def stereo(self):
        return np.stack([self.L, self.R], 1)


def envelope_db(n, points):
    t = np.arange(n) / SR
    ts, ds = zip(*points)
    return 10 ** (np.interp(t, ts, ds) / 20)


def master(x, env_points, target_lufs=-12.0, tp_limit=-1.2, hp=(180, 2), shelf_db=0.0):
    sos_hp = butter(hp[1], hp[0], 'highpass', fs=SR, output='sos')
    sos_lp = butter(4, 6500, 'lowpass', fs=SR, output='sos')
    x = sosfilt(sos_lp, sosfilt(sos_hp, x, axis=0), axis=0)
    if shelf_db:  # 1 kHz üstüne hafif parlaklık (hoparlörün en verimli bandı)
        x = x + (10 ** (shelf_db / 20) - 1) * sosfilt(butter(1, 1000, 'highpass', fs=SR, output='sos'), x, axis=0)
    x *= envelope_db(len(x), env_points)[:, None]
    meter = pyln.Meter(SR)
    for _ in range(4):  # ses yüksekliği ↔ sınırlayıcı birkaç tur
        x *= 10 ** ((target_lufs - meter.integrated_loudness(x)) / 20)
        x = limit(x, 10 ** (tp_limit / 20))
    x -= x.mean(0)
    # uçlar: 20 ms açılış, 250 ms kapanış (tık yok)
    a, b = int(0.02 * SR), int(0.25 * SR)
    x[:a] *= (np.sin(np.linspace(0, np.pi / 2, a)) ** 2)[:, None]
    x[-b:] *= (np.cos(np.linspace(0, np.pi / 2, b)) ** 2)[:, None]
    x[0] = 0
    x[-1] = 0
    return x


def limit(x, ceiling):
    """Tepe sınırlayıcı: 4× aşırı örneklenmiş tepeye göre kazanç; 3 ms önden bakış, 80 ms yumuşak bırakma."""
    from scipy.ndimage import minimum_filter1d, uniform_filter1d
    up = np.abs(resample_poly(x, 4, 1, axis=0)).max(1)
    up = np.pad(up, (0, max(0, 4 * len(x) - len(up))))[: 4 * len(x)]
    peak = up.reshape(-1, 4).max(1)
    g = np.minimum(1.0, ceiling / (peak + 1e-12))
    look = int(0.003 * SR)
    g = minimum_filter1d(g, size=2 * look + 1)
    g = np.minimum(g, uniform_filter1d(g, size=int(0.08 * SR)))
    return x * g[:, None]


def seq_notes(track, voice, start, step, pattern, vel, pan=0.0, max_len=None, jitter_db=2.0):
    """pattern: nota adları ya da '-' (önceki uzar) ya da '.' (sus); step: sekizlik süresi."""
    i = 0
    while i < len(pattern):
        n = pattern[i]
        if n in ('-', '.'):
            i += 1
            continue
        k = 1
        while i + k < len(pattern) and pattern[i + k] == '-':
            k += 1
        dur = k * step if max_len is None else min(k * step, max_len)
        v = vel * 10 ** (rng.uniform(-jitter_db, jitter_db) / 20)
        track.add(start + i * step, voice(hz(n), dur, v), pan)
        i += k


def gunisigi():
    """A · Gün Işığı: 105 BPM, Do majör, vibrafon C6–E7 + D6 tahta vuruş (McFarlane 2020 uyaranı), 3. ölçüden C5 çapa."""
    e = 60 / 105 / 2
    bar = 8 * e
    bars = 10
    tr = Track(bars * bar + 1.4)
    m1 = ['C6', '-', 'E6', 'G6', 'A6', '-', 'G6', 'E6']
    m2 = ['G6', 'C7', '-', 'E7', 'C7', '-', '-', '-']
    m2b = ['G6', 'C7', 'E7', '-', 'E7', 'C7', '-', '-']  # 5. ölçüden: ezgi tepede kalır
    for b in range(bars):
        t0 = b * bar
        pat = m1 if b % 2 == 0 else (m2b if b >= 4 else m2)
        seq_notes(tr, vibraphone, t0, e, pat, 0.55, pan=0.1, max_len=0.34)
        for s in (0, 4):
            tr.add(t0 + s * e, woodblock(hz('D6'), 0.22), -0.1)
        if b >= 2:
            tr.add(t0, soft_square(hz('C5'), 0.18, 0.28), 0.0)
    end = bars * bar
    for k, n in enumerate(['C5', 'E5', 'G5', 'C6']):
        tr.add(end + k * 0.01, vibraphone(hz(n), 0.8, 0.32), (k - 1.5) * 0.08)
    return master(tr.stereo(), [(0, -9), (1.5, -9), (4.0, -3), (6.0, 0), (99, 0)])


def kusbahcesi():
    """B · Kuş Bahçesi: 96 BPM, Sol majör, marimba G5–G6 + sentetik kuş cıvıltısı, 5. ölçüden G5 çapa. En yumuşak seçenek."""
    e = 60 / 96 / 2
    bar = 8 * e
    bars = 9
    tr = Track(bars * bar + 1.6)
    m1 = ['G5', 'B5', 'D6', '-', 'B5', 'D6', 'G6', '-']
    m2 = ['A5', '-', 'B5', 'G5', 'D6', '-', '-', '-']
    for b in range(bars):
        t0 = b * bar
        seq_notes(tr, marimba, t0, e, m1 if b % 2 == 0 else m2, 0.6, pan=0.08, max_len=0.5)
        if b >= 3:
            tr.add(t0, marimba(hz('G4'), 0.5, 0.35), -0.05)  # sıcaklık için alt oktav
        if b < 6:
            for _ in range(int(rng.integers(1, 4))):
                tt = t0 + rng.uniform(0.1, bar - 0.3)
                if rng.random() < 0.35:  # "tu-vit": iki nota
                    tr.add(tt, chirp(0.12, 3200, 3000, 0.09), 0.3)
                    tr.add(tt + 0.13, chirp(0.12, 2600, 2700, 0.1), 0.3)
                else:
                    tr.add(tt, chirp(0.13, 2500, rng.uniform(3800, 4500), rng.uniform(0.08, 0.15)), rng.uniform(-0.3, 0.3))
        if b >= 4:
            for s in (0, 4):
                tr.add(t0 + s * e, soft_square(hz('G5'), 0.16, 0.22), 0.0)
    end = bars * bar
    for k, n in enumerate(['G4', 'B4', 'D5', 'G5']):
        tr.add(end + k * 0.012, marimba(hz(n), 1.2, 0.34), (k - 1.5) * 0.08)
    return master(tr.stereo(), [(0, -10), (1.5, -10), (4.5, -4), (6.5, 0), (99, 0)])


def marsi():
    """C · Uyanış Marşı: 124 BPM, Do majör pentatonik çan + telli (arka vuruşlar), baştan C5 çapa. Derin uyuyanlar için."""
    e = 60 / 124 / 2
    bar = 8 * e
    bars = 12
    tr = Track(bars * bar + 1.2)
    m1 = ['C5', 'C5', '-', 'G5', 'E5', '-', 'G5', 'A5']
    m2 = ['G5', '-', 'C6', '-', '.', 'E6', 'D6', 'C6']
    for b in range(bars):
        t0 = b * bar
        seq_notes(tr, bell, t0, e, m1 if b % 2 == 0 else m2, 0.6, pan=0.05, max_len=0.3)
        root = 'C5' if b % 2 == 0 else 'G5'
        for s in (1, 3, 5, 7):
            tr.add(t0 + s * e, pluck(hz(root), 0.16, 0.16), -0.15)
        for s in (0, 3):
            tr.add(t0 + s * e, soft_square(hz('C5'), 0.15, 0.3), 0.0)
    end = bars * bar
    for k, n in enumerate(['C5', 'E5', 'G5', 'C6']):
        tr.add(end + k * 0.01, bell(hz(n), 0.6, 0.3), (k - 1.5) * 0.08)
    return master(tr.stereo(), [(0, -8), (1.0, -8), (5.0, 0), (99, 0)])


def write_caf(path, x):
    """16 bit little-endian PCM CAF (Apple Core Audio Format; to_caf.py ile aynı başlık), TPDF titreşimli."""
    d = rng.random(x.shape) - rng.random(x.shape)
    q = np.clip(np.round(x * 32767 + d), -32768, 32767).astype('<i2')
    data = q.tobytes()
    hdr = b'caff' + struct.pack('>HH', 1, 0)
    desc = b'desc' + struct.pack('>q', 32) + struct.pack('>d4sIIIII', float(SR), b'lpcm', 2, 4, 1, 2, 16)
    body = b'data' + struct.pack('>q', 4 + len(data)) + struct.pack('>I', 0) + data
    with open(path, 'wb') as fh:
        fh.write(hdr + desc + body)


if __name__ == '__main__':
    out = sys.argv[1]
    for name, fn in [('gunisigi', gunisigi), ('kusbahcesi', kusbahcesi), ('marsi', marsi)]:
        x = fn()
        write_caf(os.path.join(out, f'nefona-uyan-{name}.caf'), x)
        print(name, round(len(x) / SR, 2), 'sn')
