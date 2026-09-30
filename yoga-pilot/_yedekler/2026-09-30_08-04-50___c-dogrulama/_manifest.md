# Yedekleme Kaydı
- **Tarih:** 2026-09-30 08:04:50
- **İşlem:** C adımı doğrulama: üç incelemenin (js, swift, veri-metin) bulgularının düzeltmesi
- **Dosyalar (yol, satır, sha256):**
  - app/src/modules/yoga/journal.js 93 dc6a6409e88fb3e2621c4172d153a57d26e794064a6a0b50a38a4a7bd41f2b39
  - app/src/modules/yoga/session.js 36 7e89f49a794cbc0cbcb4a972b56145d09db990c2d28d8a8aad9bd93554557212
  - app/src/modules/yoga/bridge.js 88 bb55fd7b0733f9fd1586f9dac572154d09654290bcf8197370265b4d9d28d6d2
  - app/src/modules/yoga/YogaPlayer.jsx 338 ea5dd1f2617c3812af4441935e1bca47f220fe760910933b8b85dcc9e95ddf6c
  - app/src/modules/yoga/timeline.js 231 11643054ce5cc357ddd22964ce84eb0a8bf41a05681484c2f2c563d1716588e1
  - app/src/modules/yoga/text.js 118 9a1b965fc7556ce57570c5f8a4a0b3e04e73cd70c794988f7589b518aa8d2297
  - app/src/modules/yoga/Yoga.jsx 616 1dc8efb2e5e4eefd35e60f52cd46889cc09f855ee4884d152187dcb87a687952
  - app/src/modules/yoga/manifest.js 102 bff947f0e79adb715347a4d3a47372d84fe3afa033f3ab90f6f0a6f92cb27b62
  - app/src/lib/yogaRecord.js 163 11fa87c125f737d81790b63c3fda5852861449ac409b64dbfced890aa22549ea
  - app/src/lib/progress.js 221 58f08bb147b039603036529e0868074cb4d37b1114528e587360d94e3102ab21
  - app/src/components/ProgressOverview.jsx 486 6b41b17e985fd62a4ddf9f41ad7f5a58a5162593c57a3d9cafccc5d553525740
  - app/src/lib/exportData.js 336 f0c05041a1812b4d5e7d91932ed71dcd939a0b51b4050682f64e3e9b34fca8d2
  - app/src/screens/FirstReport.jsx 104 96fc897c7e2a6e6e43f1d7bcd009552bd464660f8d0f7226cb87a899623813ce
  - app/src/App.jsx 1118 2d1a9d54c58bb72762759c4a188e1c309245a49f4337833cd5d98d2977dc49d4
  - app/ios/App/App/AlarmPlugin.swift 1364 c027a4e17dfd9c2e9c4de5b03c16b0a9fe4e84b2bb4a27ea1e518016f142fc16
  - app/ios/App/App/FeedbackPlugin.swift 351 db771d38b540f57e8cda0cd870f6ed9b12909c30fb0eb926506543fb61efbd4e
  - app/ios/App/App/SpeechPlugin.swift 134 21f4eaa1d2b5deb2ebe70f08a57400c6d80dad1b30c34c54cfc8f3453ccbb444
  - app/src/modules/yoga/journal.test.js 122 22f48da3e8a53bf1a6dd8052caef16c82bd58e2f0b0ca4a8c58524577ef88096
  - app/src/modules/yoga/Yoga.test.jsx 500 fb763f6cd51e53e57a44f6a685accad8f196d994c4ce057b327afdf869c91c8b
  - app/src/modules/yoga/Yoga.data.test.jsx 172 d24197f11785cc38e6f12911755d3ca587d92a370a4ed96132011d5d8830ce8e
  - app/src/modules/yoga/timeline.test.js 145 2787339eaa7866ee20b96ef4d71073a10bb83cfa0869c7f97407d440ccdcb16e
  - app/src/modules/yoga/text.test.js 47 3a3d4c681c6ca2940a1ad198ebaa5589e6a292234d2cd6d249aa42b99b93bf5a
  - app/src/modules/yoga/manifest.test.js 130 ea0c19c5dea1fb023ee54f1d98356c27ca2dc12874ba4f2ddb60b6c590e0df3a
  - app/src/lib/exportData.test.js 174 d2642532fa33b0c0491d773afe7cac796600e7f5055016797668c6e8c77ef90b
  - app/src/screens/FirstReport.test.jsx 43 8474541f33cdc8e520107621b31b20dfceef5bc0d8af9fb90f7f7d7d3006bb75
  - app/src/lib/yogaRecord.test.js 116 b04987c9c7ccfc710261fd856c4d53899e580316137e2916d162b70ee9a6a225
- **Geri alma:** her dosya için `cp -p yoga-pilot/_yedekler/2026-09-30_08-04-50___c-dogrulama/<yol> <yol>` (kök: /home/user/eyes)
- **Not:** app/src/lib/native.js yedeklenmeden yalnız yorum satırlarında değişti (lessonStatus ve lessonJournal notuna
  `recording` ve `pausedAt` eklendi). Eski satırlar: "user | remote | interruption | route | reset | stalled | error),
  listened (gerçekten çalan sn), file, prelude, ended, tailLeft." ve "endedAt?, listened, time, maxTime, duration }".
- **Not:** app/src/lib/native.lesson.test.js yedeklenmeden değişti: son `it` bloğunun sonundaki
  "uzaktan komut yalnız oynat / duraklat" döngüsü (`expect(alarm).not.toContain(s)`, beş komut adı) yerine hedef yokluğu +
  isEnabled denetimi kondu ve üç yeni `it` eklendi (dosya sonundaki `})` öncesi). Geri almak için bu blok eski hâline
  getirilir.
