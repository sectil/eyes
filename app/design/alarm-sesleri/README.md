# Alarm sesleri (Dalga parçaları)

Alarm (AlarmKit) özel sesi uygulama paketinde olmalı: Library/Sounds'a yazılan dosya iOS 26'da çalmıyor
(Bug 20; Apple forumları 798140, 797172). Sesler 30 sn'den kısa olmalı (Apple DTS).

Üretim (Mac ya da bu ortam; Dalga'nın kendi ses motoru, tarayıcıda):

    cd app && npx vite --port 4262 --strictPort &
    node design/alarm-sesleri/render.mjs ios/App/App/Sounds

Çıktı: `ios/App/App/Sounds/nefona-dalga-{sakin,guc,motive}.wav` — 25 sn, 22050 Hz, tek kanal, tepe 0,9
(`components/AlarmSpikePanel.jsx` spikeClip). Xcode projesinde her dosya ayrı kaynak (paket köküne kopyalanır).
