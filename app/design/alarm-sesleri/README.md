# Alarm sesleri (Dalga parçaları)

Alarm (AlarmKit) özel sesi uygulama paketinde olmalı: Library/Sounds'a yazılan dosya iOS 26'da çalmıyor
(Bug 20; Apple forumları 798140, 797172). Sesler 30 sn'den kısa olmalı (Apple DTS).

Üretim (Mac ya da bu ortam; Dalga'nın kendi ses motoru, tarayıcıda):

    cd app && npx vite --port 4262 --strictPort &
    node design/alarm-sesleri/render.mjs ios/App/App/Sounds

    node design/alarm-sesleri/render.mjs design/alarm-sesleri/wav
    for m in sakin guc motive; do python3 design/alarm-sesleri/to_caf.py design/alarm-sesleri/wav/nefona-dalga-$m.wav ios/App/App/Sounds/nefona-dalga-$m.caf; done

Ara çıktı: `wav/nefona-dalga-{sakin,guc,motive}.wav` — 25 sn, 22050 Hz, tek kanal, tepe 0,9
(`components/AlarmSpikePanel.jsx` spikeClip). Pakete giden: `ios/App/App/Sounds/nefona-dalga-*.caf` — CAF, 16 bit
little-endian, 44100 Hz, 2 kanal (AlarmKit'te çalıştığı bilinen biçim; `afconvert -f caff -d LEI16@44100` ile aynı).
Bug 20: paketteki 22050 Hz tek kanal WAV alarmda çalmadı. Xcode projesinde her dosya ayrı kaynak (paket köküne kopyalanır).
