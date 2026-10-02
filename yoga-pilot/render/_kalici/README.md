# Kalıcı ses kaynakları (yeni oturum için)

Bu klasör, geçici çalışma alanında (`scratchpad/yoga/render/`) duran ve yoga üretimine devam etmek için gereken ses
dosyalarının kayıpsıza yakın kopyasıdır (2026-09-30).

- `music/el/*.flac`: müzik A (ElevenLabs Music) işlenmiş yatakları; sahibin Kapı 2 seçimi (SAHIP_ISTEKLERI madde 8).
- `music/el/raw/`: ElevenLabs'ten indirilen özgün MP3'ler ve analizleri.
- `music/common/*.flac`: ortak katmanlar (orman doğa döngüleri, oda sesi, dönüş tınısı).
- `sel/hoc/<birim>/*.flac`: Nefona Hoca'nın seçilmiş ve işlenmiş Ders 2 parçaları (seçimler `../sel/hoc/selection-*.json`).
- `manifest.json`: her dosyanın kaynağı, örnekleme hızı, kanal, çerçeve sayısı ve dönüşüm hatası.

Biçim: FLAC, 24 bit PCM. Kaynak 32 bit kayan noktalı WAV'dı; en büyük örnek hatası 6e-8 (≈ −144 dBFS), duyulmaz.
Hiçbir kaynakta tepe 1,0'ı aşmıyordu, kırpılma yok.

**Geri yükleme** (yeni oturumda, `Y=<scratchpad>/yoga`):
```
python3 - <<'PY'
import soundfile as sf, json, os
K='yoga-pilot/render/_kalici'; Y=os.environ['Y']+'/render'
for m in json.load(open(K+'/manifest.json')):
    x,sr=sf.read(os.path.join(K,m['dst']),dtype='float32',always_2d=True)
    d=os.path.join(Y,m['src']); os.makedirs(os.path.dirname(d),exist_ok=True)
    sf.write(d, x if m['ch']>1 else x[:,0], sr, subtype='FLOAT')
PY
```
Müzik B (Dalga, 2 GB) ve Neslihan/Hakan parçaları saklanmadı: sahip seçmedi, ham çekimleri `raw/` altında duruyor.
