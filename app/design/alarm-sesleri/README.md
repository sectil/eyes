# Alarm sesleri (Dalga parçaları)

Alarm (AlarmKit) özel sesi uygulama paketinde olmalı: Library/Sounds'a yazılan dosya iOS 26'da çalmıyor
(Bug 20; Apple forumları 798140, 797172). Sesler 30 sn'den kısa olmalı (Apple DTS).

Üretim (Mac ya da bu ortam; Dalga'nın kendi ses motoru, tarayıcıda):

    cd app && npx vite --port 4262 --strictPort &
    node design/alarm-sesleri/render.mjs ios/App/App/Sounds
    python3 design/uyanma-sesleri/analyze.py --profil=dalga ios/App/App/Sounds/nefona-dalga-*.caf

`render.html` Dalga motoruyla bir oktav yukarıda (+12) 44,1 kHz basar; `master_dalga.py` 400 Hz yüksek geçiren, 1 kHz
üstü raf, −12 LUFS, ≤ −1 dBTP uygular (telefon hoparlörü 250 Hz altını çalmaz; Bug 20/22, HATA_GUNLUGU).
ESKİ YOL KULLANILMAZ: `wav/` (22050 Hz tek kanal, bir oktav aşağıda) ve `to_caf.py` ile üretilen sesler hoparlörde
neredeyse duyulmuyordu; yalnız geçmiş kaydı için duruyor. Pakete giden: `ios/App/App/Sounds/nefona-dalga-*.caf` — CAF, 16 bit
little-endian, 44100 Hz, 2 kanal (AlarmKit'te çalıştığı bilinen biçim; `afconvert -f caff -d LEI16@44100` ile aynı).
Bug 20: paketteki 22050 Hz tek kanal WAV alarmda çalmadı. Xcode projesinde her dosya ayrı kaynak (paket köküne kopyalanır).
