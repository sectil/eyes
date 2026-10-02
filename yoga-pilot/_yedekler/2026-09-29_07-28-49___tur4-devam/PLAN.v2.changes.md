# PLAN.v2 değişiklik listesi

Tarih: 2026-09-28. Bu tablo `CRITIQUE.md`'deki 35 bulgunun her birinin `PLAN.v2.md`'de nasıl karşılandığını gösterir.
Sahip kararı gerektirenler §G tablosuna önerisiyle taşındı. Tablodan sonra, eleştiride olmayan ama aynı gün ölçülen
ElevenLabs hız verilerinin getirdiği değişiklikler listelenir.

## 35 bulgu

| # | Bulgu (kısa) | Ne değişti | PLAN.v2 bölümü |
|---|---|---|---|
| 1 | BLOCKER · Ders 6'da ayakta nefes ve hareket | "Ayakta ya da oturarak dağ duruşu" ve "isteyen ayağa kalkar" silindi. Ders baştan sona oturarak yapılıyor; C3 ve C6 blok adları "oturarak" oldu. A.1'e genel kural eklendi: ayakta nefes ya da hareket yok, ders içinde "ayağa kalk" yönergesi yok; uzanarak yapılan derslerin kapanışında yalnız güvenli kalkış sırası söyleniyor (breath.js:354; güvenlik §0-5, §11.A, §11.C) | §A.1; §A.2 Ders 6 (Teknik, Zaman ve duruş); §B.4 Ders 6 tablosu; §A.2.2 satır 6 |
| 2 | BLOCKER · Gibbs 2026 ayrıntıları | Cümle "kronik ağrılı 23 yetişkinle yapılan yarı deneysel bir çalışmada tek 45 dk YN (n=12), beden taramasına (n=11) göre … (p=0,01)" oldu. Kaynak olarak sakin §1.5 ve §13 "yn-vs-bodyscan" satırı ile eleştiri turundaki yeniden çekme gösterildi; Ek tabloda `**` işaretlendi | §A.2 Ders 2 Kanıt; Ek |
| 3 | BLOCKER · Sessizlik sınırı ile "iniş sessizliği" çelişkisi | "Kalan saniyeler iniş sessizliğine gider" kuralı kaldırıldı. Her bloğa isteğe bağlı genişletme klipleri (`role: 'extension'`) eklendi; doldurma sırası (a) isteğe bağlı klip, (b) boşluk → pref, (c) yeni blok, (d) genişletme klibi, (e) boşluk → max. Hedefe ulaşılamazsa içerik hatası; planlayıcı sessizliği uzatarak kapatmıyor. Yeni test (g) "her ders × her dakika × iki ses, 30:00'a sınır aşılmadan" ve (h) ses gelmeden üç hız senaryosuyla. Genişletme payı ölçülen hızlarla hesaplandı (%27) | §B.1; §B.2; §B.3 adım 3–5, test g–h; §B.4.1 |
| 4 | BLOCKER · Ses motorunun yeniden kurulması | B.5'e `AVAudioEngineConfigurationChange` ve `mediaServicesWereReset` satırları eklendi (grafik yeniden kurulur, klibin başından sürer; başarısızsa "Sürdür"). E.7 madde 7'ye cihaz testleri eklendi: ders ortasında AirPods takma ve çıkarma, araç Bluetooth'u, Denetim Merkezi'nden çıkış değiştirme | §B.5; §E.3 Gözlemciler; §E.7 madde 7; §H |
| 5 | BLOCKER · pbxproj çakışması için somut adımlar | Aşama 0'a beş somut adım yazıldı: `git diff`, ours/theirs anlamı, iki tarafı koruma ya da `git checkout --ours`, `plutil -lint` + `git add`, `npx cap sync ios` + derleme sonrası `git stash drop`. `build-dev` ve `swiftpm` izleme kararı §G11'e taşındı | §F.2 Aşama 0 madde 1; §G11; §E.3 pbxproj |
| 6 | Paket boyutu aralığı yanlış | Boyut ölçülen konuşma hızıyla ve tekrarsız müzikle baştan hesaplandı: konuşma 101–136 MB, yatak 87–131 MB, doğa ≈ 11 MB, bordun ≈ 1 MB, toplam **≈ 200–280 MB** (eleştirideki 145–250 MB, eski hız varsayımıyla yapılmıştı; o varsayım da düzeltildi). G2 buna göre güncellendi | §0 Paket boyutu; §D.5; §G2 |
| 7 | Ses düzeyleri birbirine bağlanmamış | Üç mutlak düzey tanımlandı: konuşma −18, kısık yatak ≈ −33, pencerede yatak ≈ −27 LUFS (VARSAYIM); yatak ana seviyesi −24 LUFS'ten motorun −9 / −3 dB kazancıyla bunlara iner. "+6 dB"nin kısık düzeye göre olduğu yazıldı | §0; §D.3 Son işlem; §D.4 |
| 8 | Müzik her cümlede inip kalkabilir | Kısma kuralı değişti: rehberli bloklarda yatak kısık kalır, yalnız duyurulan ve ≥ 20 sn süren pencerelerde kalkar. Boşluk sınıfları (eylem payı, nefes payı, sessiz pencere) tanımlandı. qa.py'ye "herhangi 60 sn'de en çok 2 yatak düzeyi geçişi" ölçütü eklendi | §B.2 boşluk sınıfları; §D.4 Kısma kuralı; §D.6 Plan düzeyi; §E.6 #15 |
| 9 | Döngüler 30 dk'da duyulur biçimde tekrarlanıyor | Varış ve Kapanış tek parça döngüsüz yatak; çekirdek 4 varyant × 180 sn, `seed`'e bağlı tekrarsız sıra; uyku yatağı da 4 varyant; doğa her tür 4 varyant; kuş sesi 12 tek çağrıdan rastgele kurulur, aynı çağrı 2 dk içinde dönmez. qa.py'ye özilinti ölçütü (20 sn – 10 dk gecikmede tepe ≤ 0,5). Boyut ve maliyet yeniden hesaplandı | §D.3; §D.5; §D.6 Yatak ve doğa düzeyi; §F.1 |
| 10 | Müzikle nefes eşleşmesi sağlanamaz | "60 BPM 5/4 = bir nefes döngüsü" iddiası kaldırıldı. Nefes bloklarının bordunu uygulamanın kendi hattında (render.mjs) basılıyor, döngü tam nefes periyodu (ör. 10,000 sn). Görsel yalnız nefes ipuçlarına kilitli; ipucu yoksa nefes almıyor. Üretilen yatakların temposu ölçülüyor, nefese eşlik iddia edilmiyor | §A.1 Müzik ailesi; §A.2 Ders 1 Müzik; §A.2 Ders 9 Müzik; §D.3 Nefes bordunu; §D.6; §E.2 |
| 11 | "Sessizlik" kipinde 90 sn tam dijital sessizlik | Sessizlik kipinde −55 … −60 dBFS oda sesi tabanı çalıyor. AirPods'ta "90 sn sessizlikten sonra ilk hece" testi eklendi | §A.1 Arka plan seçimi; §D.2; §D.4; §E.7 madde 7 |
| 12 | Mikro-klip prozodisi ve kısa kliplerde LUFS | "Al", "ver" ve sayılar taşıyıcı cümle içinde üretilip kesiliyor (yol A: `previous_text` / `next_text`; yol B: bütün cümle üretilip kesiliyor). 1 sn'den kısa klipler evre referansına göre RMS ile eşitleniyor | §B.2 Mikro-klipler; §C.3; §D.2; §D.6 |
| 13 | "Harf harf" eşleşme normalleştirmesi ve süreklilik | Normalleştirme kuralları yazıldı (Türkçe küçük harf, noktalama, kesme ve düzeltme işareti, rakam → sözcük, boşluk). Kalan farklar insan kararına gidiyor, otomatik yeniden üretim yok. Klipler arası F0 ve tını sürekliliği ölçütü eklendi. Yeniden üretim tavanı: klip başına 3 deneme | §D.6 Klip düzeyi; §D.1.4 nesnel ölçütler |
| 14 | Ses grafiği eksik tanımlı | En az 5 oynatıcı düğüm (konuşma, yatak A/B, doğa A/B) + kuş, bordun, oda sesi; her birinin kendi karıştırıcısı. Rampalar yerelde (render döngüsünde kazanç ya da önceden hesaplanmış zarf), JS'de değil; AVAudioMixerNode'da örnek hassasiyetinde rampa olmadığı "doğrulanmadı" diye işaretli. Aday B (AVMutableComposition + AVAudioMix, `setVolumeRamp`) yeniden değerlendirildi, ölçütlü birer günlük deneme planlandı. Arka planda konum olayları 1 Hz | §E.3; §B.5 son satır; §F.2 Aşama 1 madde 8 |
| 15 | Ekranın açık kalıp kalmayacağı | Oynatıcı Wake Lock tutmuyor (Dalga.jsx:134-152'nin tersine); ekran kendi süresinde kilitleniyor; uyku dersi ekranı hiçbir durumda gece boyu açık tutmuyor | §A.1 Ekran; §B.5 "Ekranın açık kalması"; §B.6; §E.1 madde 4 |
| 16 | Sarmayla "tamamlandı" sayılma | Tamamlandı = kapanışa (uyku dersinde uyku iznine) ulaşıldı **ve** planlanan sürenin en az %60'ı dinlendi (VARSAYIM) | §E.4 |
| 17 | Ders 3'te iki ölçü eksik tanımlı | "Zihnin ne kadar meşgul" önce sorusu kaldırıldı (hiçbir girdiye bağlı değildi). Ertesi sabah sorusu saat 12:00'ye kadar soruluyor; E.1'e "Sabah sorusu kartı" ekranı (madde 8) eklendi; metrik `unit`, `better`, `series` alanlarıyla tanımlandı | §A.2 Ders 3 Gelişim; §A.1 Gelişim ölçüsü; §E.1 madde 3 ve 8; §E.4 |
| 18 | Ölçek ve alanlar doğrulanmadı | d515702'de okundu: puan bileşeni 1–10 (lib/dalga.js:14, Dalga.jsx:45-53) → her yerde 1–10. `better` effects'te registry'de yok ama progress.js:72, :81, :107 okuyor (varsayılan yukarı). `sessions.best` işlev + `bestLabel` ister (registry.js:49-50, :112); manifest buna göre düzeltildi | başlık notu; §A.1; §A.2 bütün Gelişim satırları; §E.1 madde 3; §E.4 |
| 19 | Güvenlik eksikleri | İlk ders cümlesi "Bugün yalnızca tanışıyoruz; zorlanırsan kısalt." eklendi (kişinin ilk yoga dersi, `firstEver`). Araç uyarısı her dersin ayrıntı ekranında. Avuçlamada "gözlere bastırmadan"; bhramari parmaklar göze değmeden, shanmukhi yok | §A.1; §A.2 Ders 1 ve Ders 5; §B.3 test l; §E.1 madde 2 |
| 20 | G tablosunda üç karar eksik | Yaş sınırı §H'den §G7'ye taşındı. "Seslerin eğitilmesi"nin yorumu onaya sunuldu (§G6). Ad ve kapsam kararı eklendi ("Yoga" / "Yoga ve Meditasyon" / hareket dersi; Cramer 2019 gerekçesi) (§G8) | §G6, §G7, §G8; §H |
| 21 | Ders kartlarında benzersizlik ve 30 dk bilgileri eksik | 10 ders için benzersiz açılış cümlesi, üç aşamalı anahtar cümle, seçenekli imge yayı, görsel biçim ve müzik-doğa imzası yazıldı. 10 ders için 30 dk dikkat eğrisi yazıldı (en uzun değişimsiz aralık ≤ 4:30). Planlayıcıya "5 dk'dan uzun değişimsiz aralık yok" testi ve blok `segments` alanı eklendi | §A.2.1; §A.2.2; §B.2; §B.3 test k; §E.2 derse özgü biçimler |
| 22 | İncelemeyi kimin yapacağı belirsiz | Üç insan incelemesi tanımlandı: anadili Türkçe editör, yoga nidra / meditasyon eğitimli hoca, Ders 4 ve 7 için klinik psikolog. Kör dinleme paneli: en az 5 kişi, en az biri 65 yaş üstü. Adlar sahibin kararı | §C giriş; §D.6 İnsan düzeyi; §E.6; §G10 |
| 23 | Maliyet hesabı gerçekçi değil | 5.500 kredi/USD'nin MCP oranı olduğu, REST'in abonelik kredisinden düştüğü, katmanın doğrulanmadığı açıkça yazıldı; `pcm_44100` Pro, müzik ve Scribe maliyeti bilinmiyor. Yeniden üretim tavanı (klip başına 3 deneme) konuldu. İki yol için kredi tablosu; ~100 USD tavanıyla uzlaştırma, pilot tavanı 25 USD, fatura aylarına bölme | §F.1; §G5; §D.6 |
| 24 | Kütüphane seslerinin lisansı | Pilottan önce ticari kullanım koşulu ve kütüphanede kalma durumu doğrulanıyor; 10 ders sınırlı zaman penceresinde üretiliyor; iki kopya arşiv; Voice Design seçeneği riski kaldırıyor | §F.2 Aşama 0 madde 3; §D.5 Arşiv; §F.1 Bütçe; §G6 |
| 25 | G2'ye (c) seçeneği | (c) iOS On-Demand Resources / Background Assets ve (c') yalnız varsayılan ses pakette, ikinci ses indirilir; ikisi de "doğrulanmadı" | §G2; §H |
| 26 | Kirschner tam metin notu | "Deri iletkenliğindeki etki yalnız LKM-S koşulunda anlamlıydı, şefkatli beden taramasında değildi (benlik C01)" eklendi | §A.2 Ders 7 Kanıt |
| 27 | Moszeik ifadesi abartılı | "Tek başına bir pratik olarak işlev gördü" yerine "11 dk YN'de bekleme listesine göre küçük iyileşmeler görüldü (d=0,08–0,16)" | §B.1 |
| 28 | Sürüm notunda vaat ve jargon | "hiçbir cümle yarıda kesilmez" → "süre dolduğunda hiçbir cümle yarıda kalmaz"; "varışla" → "karşılamayla" | §E.8 |
| 29 | Ders 10 ve Ders 7'nin 5 dk blokları çok kısa | Ders 10 5 dk: C1 0:20, C2 1:25, C5 1:15. Ders 7 5 dk: C1 1:00, C2 0:55, C3 1:05. Ders 2 5 dk'da da C2 0:40 → 0:55 (C1 1:25). En kısa blok kuralı (çekirdek ≥ 0:55, niyet ve yerleşme ≥ 0:20) betikle denetleniyor | §B.4 giriş ve tablolar; §B.3 adım 8; §E.6 #1; `_plan/tables_v2.py` |
| 30 | "Kaldığın yerden" aynı biçimde kurulmalı | Kayıt alanları: ders, hedef saniye, ses, arka plan, kuyruk, plan sürümü, içerik özeti (`contentHash`), `seed`, konum, olay sırası. Planlayıcı belirlenimci (rastgelelik de `seed`'den). İçerik değişmişse ders baştan başlıyor. Test j eklendi | §E.1 "Kaldığın yerden" kaydı; §B.3 adım 7, test i–j; §B.2 |
| 31 | Türkçe düzeltmeleri | Ders 1, 2, 6, 9, 10 sözleri önerildiği gibi düzeltildi. C.8'deki "Niyet seç" ve "İçinden söyle" davet kipine çevrildi (örnek baştan yazıldı). "5 dakikada" → "5 dakikalık"; "Uykuya bırak" → "Uykuya geç"; Ders 5 ölçüsü "Dikkatin şu an ne kadar toplanmış?", etiket "odak"; "sızıltı" → "ıslıklı sesler (sibilans)"; HRV her yerde "KAD (kalp atışı değişkenliği)" oldu. Ek olarak Ders 2 güvenlik cümlesi davet kipine çevrildi ("geçebilirsin") | §A.0; §A.2 Ders 1, 2, 5, 6, 9, 10; §C.1; §C.8; §D.2; §E.1; §E.4; §B.5 |
| 32 | Kanıt etiketleri ve künye ayrıntıları | Luu 2024 → gözler açık seçeneği "tasarım çıkarımı" (güvenlik C10). Wang 2021 kulaklık → hoparlör önerisi "tasarım çıkarımı" (C27). Huberty 2022: kanser hastaları ve kanserden kurtulanlar, görüşme n=6. Tran 2021: "sürekli ölçümle havuzlanmış %29". Fischer 2017: "8 hafta". İki Wang 2021 metinde ve Ek'te ayrıldı ("eğer-ise MA'sı" / "kulaklık küme RKÇ'si") | §A.1; §A.2 Ders 2, 3, 6, 9, 10; Ek |
| 33 | Yon.jsx:362 ve Safety.jsx:7-9 atıfları | İkisi de bu görevde d515702'de yeniden okundu ve çalışma ağacında değişmemiş (`git diff` boş); bu, başlık notunda ve atıfların yanında yazıldı | başlık notu; §A.2 Ders 4 Güvenlik; §E.1 madde 1 |
| 34 | Ders 1 ile Nefes modülünün çakışması | Karta "Nefes modülünden farkı" satırı eklendi: modül tek kalıbı sayaç ve görselle çalıştırır; ders dört tekniği sesli hocayla, varışı ve kapanışı olan bir ders olarak öğretir | §A.2 Ders 1 |
| 35 | Paletin yalnız 3 rengi tanımlı | 10 dersin her biri için koyu ton ve açık tema tonu tanımlandı; kontrast WCAG 2.1 formülüyle iki temada hesaplandı (hepsi ≥ 4,5:1). Açık tema tonlarının zemin üstünde sınırda olduğu ve bu yüzden kart üstünde kullanılacağı yazıldı | §E.2 Palet; `_plan/palette.py` |

## Yeni ölçülen gerçeklerin (2026-09-28, ElevenLabs hız) getirdiği değişiklikler

| Konu | Ne değişti | PLAN.v2 bölümü |
|---|---|---|
| Ölçümlerin kendisi | Artikülasyon ölçümleri (v2 6,61 / 6,52; v4 5,63; v3 etiketli ≈ 6,2–6,3; "…" yalnız duraklama ekler) ve bu görevde ölçülen dosya süreleri tablo olarak yazıldı; REST hız 0,8 → ≈ 5,2 "tahmin" diye işaretlendi | §D.1.1 |
| İki ses yolu | Yol A (REST; anahtar bulut ortamının sırrı, asla sohbete, depoya ya da uygulamaya girmez) ve yol B (yalnız MCP, `eleven_v4`, en iyi 2–3 okuma) neyi yapıp neyi yapamadıklarıyla yazıldı; öneri yol A, B tam çalışan yedek. Karar §G5'te | §D.1.2, §D.1.3, §D.1.5; §G5; §F.2 Aşama 0 madde 4 |
| "Seslerin eğitilmesi" | Somut tanım: yol A'da hız × kararlılık × stil ızgarası, evre profilleri, alias telaffuz sözlüğü, birleştirme ve seed; yol B'de model seçimi (v4 / v2; v3 elendi), metin biçimi kuralları, nesnel ölçütlerle en iyi okuma seçimi, taşıyıcı ve kesim; isteğe bağlı Voice Design ile üçüncü aday | §D.1.4; §G6 |
| C.2 hız bandı | "2,5–3,6 hece/sn, 2,5 altına inme" kaldırıldı. Yeni band: klip içi 5,0–6,8 hece/sn (VARSAYIM) ve seçilen ayarın ±%8'i; yavaşlık klipler arası sessizlikten. Yoğunluk hece/dk yerine konuşma payıyla tanımlandı | §C.2; §E.6 #13–14; §D.6 |
| Süre ve metin hesabı (B.4 uygulanabilirliği) | Konuşma payı, klip brüt hızı ve genişletme klibi kuralıyla ders başına metin bütçesi üç senaryo için hesaplandı: benzersiz metin ≈ 1.250–1.570 sözcük / ders (sürüm 1: 800–1.200) | §B.4.1; §C.2 |
| Genişletme klipleri (CRITIQUE #3 kuralı) | Hızlı ve yavaş okuyan ses arasındaki fark (g 6,2 / 3,6 gibi) genişletme klipleriyle kapatılıyor; pay %27 | §B.2; §B.3; §B.4.1 |
| Boyut | Konuşma süresi ölçülen hızla yeniden hesaplandı (≈ 281–284 dk, iki ses, 10 ders); toplam ≈ 200–280 MB | §D.5; §0; §G2 |
| Maliyet | Karakter sayısı yeni metin bütçesinden; yol A tek üretim × 1,3–1,6 deneme, yol B 2–3 okuma; pilot ve 10 ders iki yol için ayrı | §F.1; §0; §G5 |
| Üç nokta ve v3 etiketleri | Üç nokta yalnız listelerde (sese bağlı duraklama); satır içi yönetim etiketi yasak | §C.2; §C.3 |
| Aynı metnin iki seste farklı sürmesi | Planlayıcı her ses için ayrı kuruyor; testler iki ses ve üç hız senaryosuyla | §B.3 test h; §B.4.1 |

## Bu turda yazılan yardımcı dosyalar

- `_plan/tables_v2.py` → `_plan/tables_v2.md`, `_plan/timing_v2.md`, `_plan/timing_v2.json`, `_plan/perlesson_v2.md`
  (B.4 tabloları, en kısa blok denetimi, konuşma payı, metin bütçesi, boyut).
- `_plan/cost_v2.py` (F.1 kredi tablosu).
- `_plan/palette.py` (E.2 kontrast hesabı).
- `_plan/v2_p*.md` (PLAN.v2.md'yi oluşturan bölüm parçaları).

## Pilot 3. tur (2026-09-29): Ders 2 pilotunun ikinci inceleme turundan PLAN.v2'ye yansıyanlar

Ayrıntı ve bulgu bulgu gerekçe: `pilot/fixlog.md` ("Tur 3" tablosu). Doğrulanmış kanıt dosyaları değiştirilmedi.

| Konu | Ne değişti | PLAN.v2 bölümü |
|---|---|---|
| Ortak çıkış cümlesi (G2-03) | "… ya da ara verebilirsin" → "… ya da dersi bitirebilirsin"; §11.A kartındaki "durabilirsin" de aynı fiile çekilmeli (sahip/editör onayı) | §A.1; §C.5; §C.8 |
| Araç uyarısı (TR2-23) | "Araç kullanırken dinleme." → "Bu dersi araç ya da makine kullanmıyorken dinle." (tek okunuş) | §A.1; §E.1 madde 2 |
| Kalkış (G2-04) | Kalkış cümlesi "başın dönerse yeniden otur" satırını taşır | §A.1; §A.2 Ders 2 Güvenlik |
| Ders 2 kartı (TR2-23, H13, H6, L2-10, L2-13, L2-17, EV2-12) | Söz "Uyanıkken derin bir dinlenme."; varsayılan 20 dk; sahne seçici; netlik ayarı; akşam satırı; müzikte tempo hissi yok ve doku katmanları; doğa katmanı sahneyi izler | §A.2 Ders 2; §E.1 madde 2 |
| Anahtar cümle ve imge (G2-08, H3, H2) | "Beden dinlenebilir; sen uyanıksın." yalnız zıtlık ya da imgeleme varken; "Uyanık bir dinlenme bu."; en kısa imgede de ses ve sıcaklık | §A.2.1 satır 2 |
| Tanıklık sınırı (TR2-02, TR2-18) | Alıntılar yeni metinle | §A.2.1 "Ders 2, 5 ve 9 sınırı" |
| En kısa blok (H1) | Ders 2'nin 5 dk sürümü için sahibe görünür istisna: C2 ≥ 0:30, N2 ≥ 0:18 (onay bekliyor) | §B.3 adım 8; §E.6 #1 |
| Ders 2 çapaları | Pilotun gerçek blok süreleri ve sapmaları (C4 15–16., C3 17–18., C5 24–26. dakikada) | §B.4 Ders 2 tablosunun altı |
| Metin bütçesi notu | 2.371 hece; 30 dk konuşma payı %23–%29,6; 30:00'da esneme en çok %4 | §B.4.1 "Ders 2 notu" |
| "Kapanışa geç" ve Durdur (G2-04, G2-07, Z2-05, Z2-01, G2-05) | Hızlı kapanış 60–95 sn; Durdur dönüşünde yana dönüp oturmaya 13 sn, ses dinleyici otururken biter | §B.5 |
| Hareket (G2-07) | "ağrı ya da baş dönmesi olursa bırak" | §C.5 |
| C.8 örneği | Pilotun 3. tur Varış + N1 metni (15 dk), hece ve süre sayımıyla | §C.8 |
| Doğa katmanı (H6, L2-03) | Ders 2'de sahne seçiciyi izler; Kıyı için dalga katmanı sahip kararı | §D.3 |
