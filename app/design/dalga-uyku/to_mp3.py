# WAV (16 bit) → MP3 (lameenc; 96 kbit/sn, aynı örnekleme hızı, 2 kanal). Kullanım: to_mp3.py giriş.wav çıkış.mp3
import sys, wave
import lameenc
w = wave.open(sys.argv[1])
enc = lameenc.Encoder()
enc.set_bit_rate(96)
enc.set_in_sample_rate(w.getframerate())
enc.set_channels(w.getnchannels())
enc.set_quality(2)
data = enc.encode(w.readframes(w.getnframes())) + enc.flush()
open(sys.argv[2], 'wb').write(data)
print(sys.argv[2], len(data), 'bayt')
