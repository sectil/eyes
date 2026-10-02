# ElevenLabs Music çıktısını (mp3/wav) AlarmKit uyandırma sesine çevirir: 44,1 kHz 2 kanal, ≤ 24,5 sn, telefon hoparlörü
# için stereo daraltma (yan × 0,35) + yüksek geçiren + 1 kHz üstü raf, duyulur başlayıp ~6 sn'de tam ses, −12 LUFS, ≤ −1,2 dBTP, CAF 16 bit.
# Kullanım: python3 master_eleven.py girdi.mp3 {gunisigi|kusbahcesi|marsi} çıktı.caf [başlangıç_sn]
# Denetim: python3 analyze.py çıktı.caf (README'deki uyandırma ölçütleri)
import sys
import numpy as np
import soundfile as sf
from math import gcd
from scipy.signal import resample_poly
import synth

LEN = 24.5
RAMP = {  # synth.py ile aynı açılış (AlarmKit sesi bir kez çalar; tam ses en geç ~6,5 sn)
    'gunisigi': [(0, -9), (1.5, -9), (4.0, -3), (6.0, 0), (99, 0)],
    'kusbahcesi': [(0, -10), (1.5, -10), (4.5, -4), (6.5, 0), (99, 0)],
    'marsi': [(0, -8), (1.0, -8), (5.0, 0), (99, 0)],
}


def load(path, start=None):
    x, sr = sf.read(path, always_2d=True)
    if x.shape[1] == 1:
        x = np.repeat(x, 2, axis=1)
    x = x[:, :2]
    if sr != synth.SR:
        g = gcd(sr, synth.SR)
        x = resample_poly(x, synth.SR // g, sr // g, axis=0)
    if start is None:  # baştaki sessizliği at: tepenin %1'ini ilk aşan örnekten 5 ms önce
        m = np.abs(x).max(1)
        start = max(0, int(np.argmax(m > 0.01 * m.max())) - int(0.005 * synth.SR)) / synth.SR
    x = x[int(start * synth.SR): int((start + LEN) * synth.SR)]
    return x, start


def narrow(x, side=0.35):
    """Stereo daraltma: telefon hoparlörleri birbirine yakın; geniş karışım tek kanala inince ses kaybeder
    (analyze.py mono ölçütü). Yan sinyal (L−R)/2 × side."""
    mid, sd = (x[:, 0] + x[:, 1]) / 2, (x[:, 0] - x[:, 1]) / 2 * side
    return np.stack([mid + sd, mid - sd], axis=1)


if __name__ == '__main__':
    src, name, out = sys.argv[1:4]
    start = float(sys.argv[4]) if len(sys.argv) > 4 else None
    x, s = load(src, start)
    y = synth.master(narrow(x), RAMP[name], hp=(400, 4), shelf_db=4)
    synth.write_caf(out, y)
    print(name, 'başlangıç', round(s, 3), 'sn ·', round(len(y) / synth.SR, 2), 'sn →', out)
