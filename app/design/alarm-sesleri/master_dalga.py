# Dalga alarm sesleri (Sakin, Güç, Motivasyon): telefon hoparlörüne uygun yeniden baskı (Bug 20/22, KONTROL-8:
# eski dosyaların %77–86'sı 300 Hz altındaydı). Giriş: bir oktav yukarıda basılmış ham parça (render.mjs, 44,1 kHz).
# İşlem (design/uyanma-sesleri/synth.py master): 400 Hz 4. derece yüksek geçiren, 1 kHz üstüne +4 dB, 6,5 kHz alçak
# geçiren, duyulur başlayıp 6 sn'de tam sese çıkan zarf, −12 LUFS, ≤ −1,2 dBTP, CAF 44,1 kHz 2 kanal.
# Kullanım: master_dalga.py ham.wav çıkış.caf
import sys, os
import numpy as np, soundfile as sf
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'uyanma-sesleri'))
import synth

x, sr = sf.read(sys.argv[1], always_2d=True)
assert sr == synth.SR
a = np.abs(x).max(1)
start = max(0, int(np.argmax(a > 0.01 * a.max())) - int(0.005 * sr))  # baştaki sessizliği kırp (tepenin %1'i, 5 ms pay)
x = x[start: start + int(24.5 * sr)]
# Sakin en koyu parça (ağır akorlar): hoparlör bandına biraz daha parlaklık
shelf = 6.0 if 'sakin' in os.path.basename(sys.argv[2]) else 4.0
y = synth.master(x, [(0, -3), (1.5, -3), (6.0, 0), (99, 0)], hp=(400, 4), shelf_db=shelf)
synth.write_caf(sys.argv[2], y)
print(os.path.basename(sys.argv[2]), round(len(y) / sr, 2), 'sn')
