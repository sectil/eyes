# Alanlar arası açık işler (salt okunur denetim, 2026-09-30)

Depo `/home/user/eyes`, dal `claude/cool-pasteur-j5yupf`, HEAD `70ca7d5` (Y1 5 sn turu ara kaydı). Çalışma ağacında
kaydedilmemiş değişiklikler Y1 turuna ait (`git status`: `Home.jsx`, `TodayPath.jsx`, `styles.css`, `home.css`,
`todaypath.css`, yeni `DayChain.jsx`). Depoda hiçbir dosya değişmedi.

Sınıflar: **A** bitmemiş, kimse yapmıyor · **B** bitmemiş, çalışan bir işte · **C** sahibin kararı ya da eylemi bekliyor ·
**D** bitmiş ama belgede açık · **E** cihazda doğrulama bekliyor · **Kapalı** açık iş yok.

| # | Konu | Sınıf | Kimin işi |
|---|---|---|---|
| 1 | Nef sunucusu yoga istemini bilmiyor (yeniden yayım yok) | **C** | Sahip (Mac'te betik), zamanlama orkestratör |
| 2 | `.vercelignore` → `public/yoga` | **Kapalı** (yayım sonrası tek denetim 1'e bağlı) | Orkestratör |
| 3 | Gizlilik sayfası, rıza metni, App Store gizlilik etiketi | **C** | Sahip + hukukçu |
| 4 | "Tüm verileri sil" yoga ve Y1'i kapsıyor mu | **Kapalı** kodda, **E** cihazda | Sahip (cihaz) |
| 5 | `releases.js`'te yoga ve Y1 maddesi | **A** | Kod oturumu (yok) |
| 6 | `UIBackgroundModes audio` (kilitte yoga) | **Kapalı** kodda, **E** cihazda | Sahip (cihaz) |
| 7 | Sitenin Y1 görseli ve metni | **B** + **C** | Y1 turu + sahip |
| 8 | Dışa aktarma (CSV/PDF) yoga'yı kapsıyor mu | **Kapalı** (küçük **C** notu) | — |
| 9 | Son yoga ses dosyaları uygulamaya girmedi | **A** | Kod oturumu (yok) |
| 10 | Nef'in 10 modül sınırı (yoga 9.) | **A** (risk, bugün kırık değil) | Y6'da planlı, sahibi yok |
| 11 | YAPILACAKLAR'da yoga (g) ve Y1 (c) satırı yok | **A** (yoga), **B** (Y1) | Orkestratör / belge |

---

## 1. Nef sunucusu yeni istemi bilmiyor — C

**Kanıt**
- `app/src/lib/coachCore.js:78-79, :81` yoga satırları, "yoganın uykuya, strese ya da sağlığa etkisinden söz etme" kuralı
  ve "Yoga" eylemi `0b076ba` (2026-09-30 07:27) ile girdi.
- Sunucu aynı dosyayı içe aktarıyor: `app/api/coach.js:5` (`SYSTEM_PROMPT` … `from '../src/lib/coachCore.js'`).
- Son yayım: `docs/yol-haritasi/YAPILACAKLAR.md:131-132` "Nef sunucusu … yeni istemle yayımlandı (commit 97f2f87 …)".
  `git log 97f2f87..HEAD -- app/src/lib/coachCore.js app/api/coach.js` → yalnız `0b076ba`. Sonrasında yayım kaydı yok
  (YAPILACAKLAR, HATA_GUNLUGU, DEVAM'da "coach-setup" ya da "yeniden yayımlandı" izi yok).
- İstemci yoga sayılarını bugün de gönderiyor: `app/src/lib/coach.js:61` (`modules`), `modules/yoga/manifest.js:89-92`.
  Canlı sunucudaki eski istemde yoga alanının anlamı, "Yoga" eylemi ve sağlık iddiası yasağı yok. Sunucunun süzgeci
  (`coachCore.js:91-100` FORBIDDEN) uyku ya da stres iddiasını yakalamıyor; yasak yalnız istemde.
- Betik HEAD'i yükler: `app/scripts/coach-setup.sh:78` (`git archive … HEAD:app`). Yani betik şu an çalışırsa web sürümüne
  Y1'in **ara kaydı** (`70ca7d5`) da çıkar. Betik yalnız sahibin Mac'inde çalışır (`coach-setup.sh:2-3, :27`, `~/.eyetrail_env`).

**Sonraki adım:** Y1 5 sn turu kaydedildikten sonra, yoga içeren TestFlight'tan önce sahip
`bash app/scripts/coach-setup.sh` çalıştırır; sonuç YAPILACAKLAR'a yazılır; ardından madde 2'deki denetim.
**Kimin:** sahip (eylem); ne zaman çalıştırılacağını orkestratör söyler.

## 2. `app/.vercelignore` → `public/yoga` — Kapalı

**Kanıt:** `app/.vercelignore` son satırı `public/yoga` (`8e61960`, 2026-09-30). Dosya depoda, `git archive` ile geçici
kopyaya girer; Vercel CLI orada okur. `app/public/yoga` bugün 13 MB (`ders2-15.mp3`, `.timeline.json`).
**Kalan:** PLAN.v3 (`yoga-pilot/v3/PLAN.v3.md:648, :1052` Kapı 8) "Vercel dağıtımının dosya listesinde yoga dosyası yok"
denetimini istiyor; bu denetim ancak madde 1'deki yayımdan sonra yapılabilir.
**Kimin:** yayımdan sonra orkestratör (Vercel dağıtım dosya listesine bakar).

## 3. Gizlilik sayfası, rıza metni, App Store gizlilik etiketi — C

**Yoga ne topluyor, nereye gidiyor (kanıt)**
- Önce/sonra puanı ve zorlanma cevabı (`hard`) kayda yazılır, telefonda kalır: `app/src/lib/yogaRecord.js:79-88`;
  `yoga-pilot/v3/modul.md:272` ("Cevap telefonda kalır … Nef'e gitmez").
- Sabah sorusu (`sleepEase`) o gecenin kaydına eklenir, Nef'e gitmez: `app/src/components/YogaMorningCard.jsx:15-18`.
- Nef'e yalnız dört sayı gider (`sessions7, minutes7, completed7, days7`): `modules/yoga/manifest.js:88-92`.
- Ses dosyaları pakette, ağ yok: `PLAN.v3.md:636`. Hesaba eşitleme yalnız profil: `app/src/lib/account.js:116-124`.

**Sonuç:** Yoga cihaz dışına yeni bir veri türü çıkarmıyor. Açık kalanlar:
- Rıza metni kuralı "birebir" diyor (`app/src/lib/consent.js:55-56`); metin yogayı adıyla anmıyor (`consent.js:64`).
  Plan dört sayının "çalışma günü, dakika" kalemine girdiğini söylüyor, bu yorumun hukukçuya teyidini istiyor
  (`modul.md:547-551, :868`). Metin değişirse `CONSENT_VERSIONS.coach` artar ve rıza herkese yeniden sorulur (`consent.js:13`).
- Site: `site/pages/gizlilik.html:19` "pratik kayıtları (süre, önce ve sonra puanları)" yogayı kapsıyor. Nef satırı
  (`:32`) yogayı anmıyor. `:36` sağlık verisinde "telefonda kalsa da açık rıza" diyor; uyku cevabı sağlık verisi sayılıyor
  (`modul.md:552`), ama yoganın sabah sorusu için rıza yok. Bu hukukçu sorusu. Site henüz yayında değil
  (`YAPILACAKLAR.md:536-538`: yayın ve hukukçu incelemesi `[ ]`).
- App Store gizlilik etiketi: depoda bugün neyin beyan edildiğine dair kayıt yok. "Gizlilik etiketi" yalnız Y5/Y6 plan
  satırlarında geçiyor (`docs/yol-haritasi/tasarim/SONSUZ_YOL.PLAN.v1.md:1150-1151, :1225`). Yoga yeni tür gerektirmez;
  yeter ki Nef'e giden özetler zaten beyan edilmiş olsun.

**Sonraki adım:** hukukçuya iki soru gider: dört sayının mevcut rızaya girip girmediği ve telefonda kalan uyku cevabı
için rıza gerekip gerekmediği. Sahip App Store Connect → App Privacy'de Nef satırının beyanını görür. İsterse site Nef
satırına "yoga ders sayısı ve dakikası" eklenir. **Kimin:** sahip ve hukukçu.

## 4. "Tüm verileri sil" — Kapalı kodda, E cihazda

**Kanıt**
- Yoga: `app/src/App.jsx:1056` (`store.clearAll()` → yoga kayıtları), `:1070` (`resetLessonData()` → yerel ders kaydı,
  UserDefaults `nefona.lesson.journal`, `AlarmPlugin.swift:565, :946`), `:1071` (`registry.resetKeys()`);
  `modules/yoga/manifest.js:41` `storageKeys: [YOGA_OPTS_KEY, PATH_LATER_KEY]`. Testler: `modules/yoga/manifest.test.js:27`,
  `modules/yoga/journal.test.js:154-188`. Düzeltme kaydı: `58fa1c1`.
- Y1: kalıcı yeni anahtar yok. `lib/progression.js:1-2` "sayaçlar saklanmaz, kayıtlardan türetilir"; `git show 6ea6890`
  ve kaydedilmemiş fark, test dışında yeni `localStorage` ya da `setSetting` eklemiyor. Yeni alanlar (`stage`, `stepIds`)
  kayıtların içinde, `clearAll` ile siliniyor.

**Kalan (E):** Yerel ders kaydının cihazda silindiği görülmedi. `0b076ba` iletisi "Swift derlenmedi, cihazda
denenmedi" diyor; Build 59'dan sonra derleme kaydı yok (`YAPILACAKLAR.md:131`, depoda "Build 60" yok).
**Kimin:** sahip, yoga içeren ilk TestFlight'ta.

## 5. `releases.js` — A

**Kanıt:** `app/src/lib/releases.js:8-12` en üstteki girdi `'2026-09-29-2'`, Build 59'dan sonraki TestFlight için ve
henüz gönderilmedi: Build 59'un commit'i `26419b4`'te en üstte `'2026-09-29'` var. `grep -c "yoga|Yoga" releases.js` → 0.
Dosyanın son değişikliği `ecdee4f` (2026-09-29). Kural `releases.js:3-5`; ayrıca `PLAN.v3.md:1052` (Kapı 8 "sürüm notu")
ve `docs/yol-haritasi/tasarim/YOL.ilerleme.md:592`.
Maddesi olmayan, kullanıcının göreceği değişiklikler: Yoga (Ders 2 15 dk, yol durağı, sabah sorusu); Y1 (yol ilk gün
8 dk, nefes 1-2-3 dk, "Yeni" rozeti); sahibin onayladığı üç düzeltme (`a225142`: FirstReport fiili, PDF güven aralığı,
Gelişim kutucuğu); "−0,0" → "değişmedi: 0,0" (`6ea6890`).
**Sonraki adım:** TestFlight'tan önce `'2026-09-29-2'` girdisine maddeler eklenir (başlığı güncellenir) ya da yeni bir
kimlik açılır. Metinler metin kapısından geçer. Site "Yenilikler" sayfası da buradan beslenir (`site/scripts/data.mjs:13, :47`).
**Kimin:** kod oturumu (şu an çalışan yok). Y1 maddesi Y1 turu bitince yazılmalı.

## 6. Kilit ekranında yoga sesi (`UIBackgroundModes audio`) — Kapalı kodda, E cihazda

**Kanıt:** `app/ios/App/App/Info.plist:56-59` `<string>audio</string>`, Dalga ile gelmiş (`ac5e143`, 2026-09-25). Ders
oynatıcısında kilit ekranı denetimleri var: `AlarmPlugin.swift:1278` (`MPRemoteCommandCenter`), `:1345`
(`MPNowPlayingInfoCenter`). Açık doğrulama: `yoga-pilot/v3/modul.md:864` "Doğrulanmadı: yerel motorun bu uygulamada
kilitte 15 dakika sürmesi". Swift derlenmedi (`0b076ba`).
**Sonraki adım:** TestFlight'ta Ders 2 15 dk kilitli ekranda sonuna kadar çalınır; kilit ekranındaki duraklat/sürdür
denenir. **Kimin:** sahip (derleme `app/scripts/testflight.sh`, Mac'te).

## 7. Sitenin Y1 görseli ve metni — B + C

**Kanıt:** `6ea6890` iki dosyayı değiştirdi: `site/pages/index.html:93-94` ("Yol ilk gün 8 dakikadır …") ve
`site/public/screens/home-path-{light,dark}.webp`. Y1 raporu bu değişikliğin uygulamanın Y1 sürümüyle aynı gün
yayınlanmasını istiyor (`docs/yol-haritasi/tasarim/Y1_KOD_RAPORU.md:62, :196`). Bu iki cümle metin kapısında bekliyor
(`Y1_KOD_RAPORU.md` §6 madde 2-3). Görseller 5 sn turundan önce çekildi. Tur şu an `Home.jsx`, `TodayPath.jsx` ve iki
stil dosyasını değiştiriyor (`git status`), yani görseller büyük olasılıkla yeniden eskiyecek.
Site canlı değil: `YAPILACAKLAR.md:520-523` alan adı ve Vercel projesi "yayın gününe kadar alınmaz", `:538` "Yayın" `[ ]`.
Şu an yayımlanacak bir şey yok.
**Sonraki adım:** Y1 turu kaydedilince görseller yeniden çekilir. Bu işin turun kapsamında olup olmadığı belgede yazmıyor,
tur bitince denetlenmeli. Site cümleleri sahibin onayına gider. Yoga sitede kendiliğinden görünür, çünkü modül listesi
manifestlerden üretiliyor (`site/scripts/data.mjs:18-31`); ayrıca metin yazılmadı. **Kimin:** Y1 turu (görsel), sahip (metin onayı, yayın).

## 8. Dışa aktarma (CSV / "Doktoruma göster" PDF) — Kapalı

**Kanıt:**
- CSV: önce/sonra puanı `registry.effects` üzerinden (`app/src/lib/exportData.js:56-63`). Sabah puanı
  `yoga-uyku-dalma` ölçüsüyle (`modules/yoga/manifest.js:47-56`, `exportData.js:50-54`). Süre satırı dersin alanıyla
  (`exportData.js:71-75`, `domainOfSession`).
- PDF: `reportModel` ölçüleri ve etkileri alıyor (`exportData.js:134-135`). "Düşük daha iyi" düzeltmesi `:292`.
- Testler: `exportData.test.js:52-76`, `lib/domainOf.test.js:33-45`.

**Küçük not (C):** Zorlanma cevabı (`hard`) dışa aktarılmıyor (`grep hard exportData.js` → yok). Oysa site "veriyi görme
ve dışa aktarma" hakkını yazıyor (`site/pages/gizlilik.html:53`). Hukukçu sorusuna eklenebilir.
**E:** PDF'in iPhone'da yoga satırlarıyla paylaşıldığı görülmedi (Swift ve cihaz denemesi yok).

## 9. Son yoga ses dosyaları uygulamada yok — A (bu listede bulunan ek madde)

**Kanıt:**
- `ls app/public/yoga` → yalnız `ders2-15.mp3` ve `.timeline.json`. `app/src/lib/yogaLessons.js:134`'te yalnız bu
  sürüm `published: true`. `:186` `musicTailFile: null`, oysa `ders3-kuyruk.mp3` üretildi.
- SHA-256: uygulamadaki `ders2-15.mp3` = `726417fa…`, pilot `render/out/ders2-15dk-hoc-A.mp3` ile aynı dosya. Son sürüm
  `render/out/ilk-bolum/ders2-15.mp3` = `c875dcef…`, yani farklı (v3 deltası ve Xing başlığı, `yoga-pilot/DEVAM.md:46-58`).
- Ses oturumu işi koda bırakıyor: `DEVAM.md:23-24, :81` "Dosyaları uygulamaya koymak kod oturumunun işi
  (`musicTailFile` dahil)". Sahip ilk bölümün yayınını onayladı (`SAHIP_ISTEKLERI.md:58-61` madde 10, :86-88 madde 18).
- On iki dosya 91 MB (`du -ch …/ilk-bolum/*.mp3`). Paket boyutu kararı (`PLAN.v3` karar 6, Kapı 4 ölçümü) ve kodek testi
  (`DEVAM.md:33-35`, sahibin Mac'inde; test paketi hazırlanmadı) bu adıma bağlı.

**Sonraki adım:** Kod oturumu 11 karışımı, timeline dosyalarını ve kuyruğu `app/public/yoga`'ya kopyalar. `published`,
`contentHash` ve `musicTailFile` doldurulur, `ders2-15` son sürümle değiştirilir. Kodek sonucu MP3 mü AAC mı sorusunu
belirler (C). **Kimin:** kod oturumu. Çalışan yoga tasarım turunun kapsamı ekranlar; bu iş kapsamda görünmüyor.

## 10. Nef'in 10 modül sınırı — A (risk)

**Kanıt:** `coachCore.js:44` `Object.entries(raw).slice(0, 10)`. `coach()` veren modüller bugün 9: breath,
breath-count, fark-ettin, notice, quick-look, snake, tek-bakis, track, yoga (`grep -l "coach(" modules/*/manifest.js`).
Sıralamada yoga en sonda (`modul.md:562-566`). Sınırı 16'ya çıkarmak Y6'da planlı
(`SONSUZ_YOL.PLAN.v1.md:1151, :1456`). Bugün bir şey kırık değil. `coach()` veren iki yeni modül eklenirse yoga Nef'e
hiç gitmez. **Kimin:** sahibi yok. Y6'dan önce yeni modül eklenirse sınır da o işte yükseltilmeli.

## 11. Yol haritasında yoga (g) ve Y1 (c) durum satırı yok — A / B

**Kanıt:** `grep -n yoga docs/yol-haritasi/YAPILACAKLAR.md` yalnız `:71` ve `:79` satırlarını veriyor; ikisi de plan
metni, durum değil. (a) ve (b) satırları var (`:80`, `:178`), (c) ve (g) yok. `ENVANTER_VE_PLAN.md`'de "yoga" 0 kez geçiyor.
Kapı 8 ikisini de istiyor (`PLAN.v3.md:1052` "ENVANTER_VE_PLAN.md satırı, YAPILACAKLAR (g) maddesi"). Madde 1, 5, 9'daki
açık işlerin hiçbiri YAPILACAKLAR'a yazılmadı.
**Sonraki adım:** Yoga için (g) satırı yazılır: ne yayımlı, sunucu yayımı, sürüm notu, ses dosyaları, cihaz listesi.
Y1 (c) satırını Y1 turu bitince o tur yazar. **Kimin:** orkestratör ya da belge işi (yoga, A); Y1 turu (B).
