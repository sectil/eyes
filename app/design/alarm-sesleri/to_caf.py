# Alarm sesleri: WAV (tek kanal, 16 bit) → CAF (Apple "Linear PCM", little-endian 16 bit, 44100 Hz, 2 kanal).
# AlarmKit'te çalıştığı bilinen biçim (afconvert -f caff -d LEI16@44100 ile aynı). Bu ortamda afconvert yok; CAF
# başlığı elle yazılır (Apple "Core Audio Format Specification": caff + desc + data, başlık alanları big-endian).
# Kullanım: python3 design/alarm-sesleri/to_caf.py giriş.wav çıkış.caf
import struct, sys, wave
from array import array

src, dst = sys.argv[1], sys.argv[2]
w = wave.open(src)
assert w.getsampwidth() == 2, 'yalnız 16 bit'
rate, ch, n = w.getframerate(), w.getnchannels(), w.getnframes()
pcm = array('h', w.readframes(n))
mono = pcm if ch == 1 else array('h', (sum(pcm[i * ch:(i + 1) * ch]) // ch for i in range(n)))
OUT = 44100
m = int(n * OUT / rate)
out = array('h')
for i in range(m):  # doğrusal ara değer
    x = i * rate / OUT
    j = int(x); f = x - j
    a = mono[j]; b = mono[j + 1] if j + 1 < n else a
    v = int(round(a + (b - a) * f))
    out.extend((v, v))  # 2 kanal
if sys.byteorder != 'little':
    out.byteswap()
data = out.tobytes()
hdr = b'caff' + struct.pack('>HH', 1, 0)
desc = b'desc' + struct.pack('>q', 32) + struct.pack('>d4sIIIII', float(OUT), b'lpcm', 2, 4, 1, 2, 16)  # 2 = little-endian
body = b'data' + struct.pack('>q', 4 + len(data)) + struct.pack('>I', 0) + data
open(dst, 'wb').write(hdr + desc + body)
print(dst, f'{m / OUT:.1f} sn', OUT, 'Hz 2 kanal', len(hdr + desc + body), 'bayt')
