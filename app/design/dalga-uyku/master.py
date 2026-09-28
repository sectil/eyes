# Uyku müziği: telefon hoparlörüne uygun son işlem (Bug 22 KONTROL-8: eski döngünün %87'si < 300 Hz idi, hoparlörde
# duyulmuyordu). Giriş: bir oktav yukarıda basılmış ham döngü (render.mjs). Çıkış: sakin-loop.wav (boşluksuz döngü) ve
# sakin-fade-{30..180}.mp3 (her kısılma süresi için tam uzunlukta).
#  - yüksek geçiren 300 Hz (4. derece) + 1 kHz üstü +4 dB, döngüye ÇEMBERSEL uygulanır (dikiş yok)
#  - hedef −16 LUFS (sakin ama telefonda duyulur), gerçek tepe ≤ −1,5 dBTP
# Kullanım: master.py ham.wav çıkış_klasörü
import sys, os, subprocess
import numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt, resample_poly

src, out = sys.argv[1], sys.argv[2]
x, sr = sf.read(src, always_2d=True)
n = len(x)
# 300 Hz 4. derece yüksek geçiren + 1 kHz üstüne +4 dB (ölçüldü: hoparlörde kaybolan pay −1,8 → −0,8 LU)
circ = lambda sos, s: sosfilt(sos, np.concatenate([s, s, s]), axis=0)[n:2 * n]  # çembersel: ortadaki kopya (dikiş yok)
y = circ(butter(4, 300, 'highpass', fs=sr, output='sos'), x)
y = y + (10 ** (4 / 20) - 1) * circ(butter(1, 1000, 'highpass', fs=sr, output='sos'), y)
meter = pyln.Meter(sr)
y *= 10 ** ((-16.0 - meter.integrated_loudness(y)) / 20)
tp = np.max(np.abs(resample_poly(y, 4, 1, axis=0)))
lim = 10 ** (-1.5 / 20)
if tp > lim:
    y *= lim / tp
y -= y.mean(0)
# 6 kHz üstünde enerji yok (ölçüldü): 22,05 kHz yeter, dosya yarıya iner. Döngü uzunluğu tam bölünür (96 sn).
y = resample_poly(np.concatenate([y, y, y]), 1, 2, axis=0)  # çembersel: ortadaki kopya (dikiş yok)
n = len(y) // 3
y = y[n:2 * n]
sr //= 2
sf.write(os.path.join(out, 'sakin-loop.wav'), y.astype(np.float32), sr, subtype='PCM_16')
print('döngü', round(n / sr, 2), 'sn', 'LUFS', round(pyln.Meter(sr).integrated_loudness(y), 1), 'tepe', round(20 * np.log10(np.abs(y).max()), 2))
for F in (30, 60, 90, 120, 150, 180):
    L = int(F * sr)
    reps = int(np.ceil(L / n))
    f = np.tile(y, (reps, 1))[:L].copy()
    g = 0.5 * (1 + np.cos(np.pi * np.arange(L) / L))  # kosinüs kısılma (dalgaSleep.fadeGain ile aynı)
    f *= g[:, None]
    tmp = os.path.join(out, f'_f{F}.wav')
    sf.write(tmp, f.astype(np.float32), sr, subtype='PCM_16')
    subprocess.run(['python3', os.path.join(os.path.dirname(__file__), 'to_mp3.py'), tmp, os.path.join(out, f'sakin-fade-{F}.mp3'), '96'], check=True)
    os.remove(tmp)
