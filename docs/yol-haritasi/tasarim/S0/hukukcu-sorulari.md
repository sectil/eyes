# Nefona · Hukukçuya üç soru (S0)

Tarih: 2026-09-30. Hazırlayan: plan ekibi, sahibin adına. Bu belge hukuki yorum içermez; yalnız soruları ve gereken
bilgiyi verir. Cevap sizden bekleniyor.

**Nefona nedir.** Türkçe bir iOS uygulamasıdır: göz egzersizleri, görme ve okuma ölçümleri, nefes ve yoga dersleri,
"Nef" adlı bir yapay zekâ koçu. Verilerin çoğu yalnız telefonda durur. Bugün yurt dışına giden iki veri akışı vardır ve
ikisi de ayrı açık rızayla açılır: profil yedeği (Supabase, Almanya) ve Nef'e giden özet sayılar (Vercel ve OpenRouter)
(`app/src/lib/consent.js:28-38`, `:60-81`).

**Bugünkü rıza düzeni** (`app/src/lib/consent.js:1-5`): her amaç için ayrı izin; önceden işaretli kutu yok; "Şimdi değil"
hiçbir özelliği kapatmaz; metin sürümü değişirse izin vermiş kişiye yeniden sorulur; eski sürüme izin vermiş kişinin yeni
metne "Şimdi değil" demesi eski izni geri çekmez. Bugünkü rıza metinleri de bir hukukçudan geçmedi; kodda bu not
yazılıdır: "NOT: Bu metinler hukukçu onayından geçmedi; veri sorumlusu bilgisi aydınlatma metnine eklenecek."
(`app/src/lib/consent.js:6`).

**Nereden geliyor.** Onaylı plan `docs/yol-haritasi/tasarim/SONSUZ_YOL.PLAN.v1.md` (bundan sonra "plan"): §1 "Gizlilik
değişiklikleri" (satır 120–139) ve "Senden istenen iki iş" (satır 187–196). Aşağıdaki özellikler henüz kodda yoktur;
"planlanan" diye yazılan dosyalar yazılmadı. Kod yolları `app/src/` altına göredir.

---

## Soru 1 · Konum koordinatının Apple'ın hava servisine aktarımı (KVKK m. 9)

### Bağlam

| | |
|---|---|
| Ne | Kişinin yaklaşık konumu. iOS izin penceresinde kesin konum kapalı gelir; Apple'a göre yaklaşık konum "typically preserves the city" ve 1–20 km içindedir (plan satır 864–866). Koordinat telefonda 2 ondalığa yuvarlanır. Kişi konum izni vermezse ilini seçer; o zaman ilin merkezinin koordinatı gider (plan satır 878–882). |
| Nereye | Apple'ın hava servisi (WeatherKit), telefondan doğrudan; yurt dışı. Hangi ülkedeki sunucuya gittiği okuduğumuz belgelerde yazmıyor. Koordinat bizim sunucumuza ve Nef'e gitmez (plan satır 122–124). İstekle birlikte telefonun IP adresi de Apple'a ulaşır (`arastirma-v1/hava-ay.md:230-231`). |
| Apple ne diyor | "Location information is used only to provide weather forecasts, is not associated with any personally identifiable information, and is never tracked between requests." (developer.apple.com/weatherkit; `arastirma-v1/hava-ay.md:117-118`). Apple'ın bu veriyi ne kadar sakladığı okuduğumuz belgelerde yok. |
| Ne zaman, ne sıklıkla | Yalnız kişi "Hava ve ay" kartında ya da Ana sayfadaki tek seferlik teklifte "Konumumu kullan"a dokununca istenir; önce bizim tek cümlelik sayfamız, sonra iOS penceresi açılır (plan satır 869–871). Sonra uygulama açıkken en çok saatte bir, kişi başına günde en çok 8 istek; arka planda konum alınmaz (plan satır 885, 989; sayılar VARSAYIM). Kişi uygulamayı her gün açarsa aktarım her gün tekrarlanır. |
| Telefonda ne kalır | Koordinat saklanmaz. Önbellekte yalnız hava sonucu ve en yakın il adı durur. Günlük kayıtta (`gozolcum:sky-log`) gün başına yalnız tarih, yağmur var/yok, en yüksek sıcaklık ve ay aydınlanması durur; koordinat ve şehir tutmaz; 90 gün saklanır (plan satır 985–986; süre VARSAYIM). Kişi konum iznini kapatırsa uygulama bunu ilk açılışta görür, il adını ve hava önbelleğini siler. "Tüm verileri sil" hepsini siler (plan satır 124–125, 134). |
| Kod | Planlanan (Y5): `ios/App/App/SkyPlugin.swift`, `lib/sky.js`, `lib/consent.js` (`weather` sürüm 1) (plan satır 1150). Tasarım: plan §3.E.2 (satır 862–891), §3.E.6 (yağmur bildirimi, satır 927–963). |

### Bugünkü metinler (aynen)

- Gizlilik sayfası: "Kamera görüntüsü, ses kaydı ve konum sunucuya hiç gitmez; profil fotoğrafın yalnız telefonda durur."
  (`site/gizlilik.html:76`). Plan bu cümlenin genişletilmesini istiyor (plan satır 126–128).
- Uygulamada konum için bir rıza metni yok. İl bilgisi bugün yalnız profil yedeğinde geçiyor: "Adın, doğum tarihin,
  şehrin ve gözlük/lens bilgin. Fotoğrafın kaydedilmez." ve "Adımın, doğum tarihimin, şehrimin ve gözlük bilgimin, profilimi
  geri getirmek için yurt dışındaki (Almanya) sunucuda saklanmasına izin veriyorum." (`app/src/lib/consent.js:32`, `:37`).

### Taslak yeni metinler

**iOS izin penceresi metni** (plandan aynen, plan satır 872–874): "Nefona, bulunduğun yerin hava durumunu ve yağmur
olasılığını göstermek için yaklaşık konumunu kullanır. Konumun yalnız hava bilgisi için yuvarlanarak Apple'a gider.
Konumunun kendisi saklanmaz; telefonda yalnız en yakın il adı ve hava bilgisi kalır. Konumun sunucumuza gitmez."

**Rıza `weather` sürüm 1** (plandaki dört satırdan yazıldı, plan satır 886–889; bugünkü rıza sayfalarıyla aynı biçim):
- Başlık: "Bulunduğun yerin havasını gösterelim mi?"
- Giriş: "İstersen hava durumunu ve yağmur olasılığını gösteririz. İzin vermesen de her şey açık kalır; ay evresi her zaman
  görünür."
- Ne: "Yaklaşık konumun, 2 ondalığa yuvarlanmış koordinat olarak. Konum izni vermezsen seçtiğin ilin merkezi."
- Neden: "Hava durumunu, yağmur olasılığını ve istersen sabah yağmur bildirimini göstermek."
- Nerede: "Yurt dışında: Apple'ın hava servisi (WeatherKit). Sunucumuza ve Nef'e gitmez."
- Ne kadar: "Konumun saklanmaz. Telefonda yalnız en yakın il adı, son hava bilgisi ve 90 günlük günlük hava özeti (yağmur
  var mıydı, en yüksek sıcaklık) kalır. Konum iznini kapatırsan il adı ve son hava bilgisi, uygulamayı ilk açışında
  silinir."
- İşaretsiz kutu: "Yaklaşık konumumun (ya da seçtiğim ilin merkezinin) hava bilgisi için yurt dışındaki Apple hava
  servisine aktarılmasına açık rıza veriyorum." (Bu cümle, cevabınızdaki aktarım dayanağına göre değişir.)

**Gizlilik sayfası, yeni cümle önerisi:** "Kamera görüntüsü ve ses kaydı sunucuya hiç gitmez. Konumun da sunucumuza
gitmez; hava bilgisini açarsan yalnız yuvarlanmış yaklaşık konumun ya da seçtiğin ilin merkezi, Apple'ın hava servisine
gider. Profil fotoğrafın yalnız telefonda durur."

### Sizden istenen cevap

1. Bu aktarım KVKK m. 9'a göre hangi dayanakla yapılmalı? Her gün tekrarlanan hava isteği, açık rızanın yeterli olduğu
   bir aktarım sayılır mı?
2. Açık rıza yeterli değilse ne yapılmalı (ör. Apple ile bir sözleşme ya da taahhüt, Kurula bir bildirim)? Bu mümkün
   değilse konumla hava özelliği hiç yayına girmemeli mi?
3. Kişi konum yerine il seçerse ve Apple'a yalnız ilin merkezi giderse durum değişir mi?
4. IP adresinin de Apple'a ulaşması sonucu değiştirir mi?
5. Yukarıdaki üç taslak (izin penceresi, rıza, gizlilik sayfası) yeterli mi? Eksik ya da yanlış olan ne? Aydınlatma
   metnine eklenmesi gerekenleri (veri sorumlusu, alıcının unvanı ve ülkesi vb.) yazar mısınız?

---

## Soru 2 · Tek dokunuşluk "Günün nasıl geçti?" kaydının sınıfı

### Bağlam

| | |
|---|---|
| Ne | Akşam 18.00'den sonra kişi tek dokunuşla beş çizilmiş yüzden birini seçer: "Çok kötü · Kötü · İdare eder · İyi · Çok iyi" (1–5) (plan satır 165, 782). 7. günden sonra isteğe bağlı etiketler: "İş yoğundu", "Hareketliydim", "Dışarıdaydım", "İnsanlarla", "Gözlerim yoruldu", "Ekran çoktu" (plan satır 780). Kayıt: `{ type: 'day-check', date, day, score: 1–5, tags: [], card, seconds }` (plan satır 821–822). `card`, o akşam gösterilen bilgi kartının adıdır. |
| Ne için | Kişiye Gelişim ekranında kendi düzenini göstermek; o güne uyan tek bir bilgi kartı seçmek. 28 günden sonra etiketler yalnız betimlenir (ör. "'Dışarıdaydım' dediğin günlerin ortalaması 4,1, diğerleri 3,3"). Düşük ruh hâli serisinde modelden bağımsız sabit bir cümle çıkar; WHO-5'in düşük puan metnini izler: "Bu bir tanı değil. İyi oluşun bir süredir düşükse bir sağlık uzmanıyla konuşmak iyi gelebilir." (plan satır 834–839; `app/src/lib/who5.js:27`). Tanı aracı değildir. |
| Nerede | Yalnız telefonda. Ruh hâli, etiketler ve hava bağlamı sunucuya gitmez; Apple Sağlık'a yazılmaz (plan satır 134, 258). Nef'e yalnız Soru 3'teki sürüm 2 rızasıyla, sayı değil durum sözcüğü (`moodStatus`) ve son 7 günde kaç akşam kayıt yapıldığı (`n7`) gider (plan satır 129–130, 836–838). Kişinin kendi eliyle yaptığı dışa aktarmaya girmesi notlarda öngörülüyor (`arastirma-v1/gunun.md:313`). |
| Ne kadar | Planda bir saklama süresi yazılmadı; kişi silene kadar kalır. "Tüm verileri sil" hepsini siler (plan satır 134). Telefonun kendi yedeğine (ör. iCloud yedeği) girip girmediği planda incelenmedi. |
| Kod | Planlanan (Y4): `modules/gunun/` ve `lib/dayCards.js` (plan satır 1149). Tasarım: plan §3.D.3 (satır 763–790), §3.D.5 (satır 819–839). |

### Bugünkü metinler (aynen)

Ruh hâli için bugün bir rıza metni yok. Uygulamanın benzer verileri bugün nasıl andığı:
- Gizlilik sayfası: "Görme ölçümü ve hareket verisi sağlığa ilişkin veridir (KVKK md. 6); bu yüzden bu verileri işleyen
  her amaç için, telefonda kalsa da yurt dışına gitse de, açık rıza ayrı alınır." (`site/gizlilik.html:63`). Yani
  uygulama bugün, telefonda kalan sağlık verisi için de ayrı açık rıza alıyor (ör. hareket izni: "Yalnızca bu telefonda.
  Sunucuya ve Nef'e gitmez", `app/src/lib/consent.js:20`, `:23`).
- Nef'e giden profil cevapları, stres puanı dahil, "sağlığa ilişkin veri" diye anılıyor: "Profil cevaplarımın özetinin
  (uyku puanı, günlük ekran süresi, gece telefona bakma sıklığı, stres puanı; sağlığa ilişkin veri) de aynı amaçla yurt
  dışına aktarılmasına açık rıza veriyorum." (`app/src/lib/consent.js:80`).
- Kod yorumu: "Görme ölçümü ve nefes öncesi/sonrası sakinlik farkı sağlığa ilişkin veri sayılır (KVKK md. 6)."
  (`app/src/lib/consent.js:57`).
- Uygulamada zaten WHO-5 İyi Oluş İndeksi var (`app/src/lib/who5.js:1-4`); bugün Nef'e giden alanlar arasında yok
  (`app/src/lib/coachCore.js:9-37`).

### Taslak yeni metinler

**A. Kayıt sağlık verisi sayılırsa (ayrı rıza, ilk kaydın önünde bir kez):**
- Başlık: "Günün nasıl geçtiğini kaydedelim mi?"
- Giriş: "İstersen her akşam tek dokunuşla günün nasıl geçtiğini kaydedersin ve Gelişim'de kendi düzenini görürsün.
  Kaydetmesen de her şey açık kalır."
- Ne: "Akşam seçtiğin yüz (Çok kötü, Kötü, İdare eder, İyi, Çok iyi), istersen seçtiğin etiketler ve o akşam gösterilen
  bilgi kartı."
- Neden: "Günlerinin nasıl geçtiğini sana Gelişim'de göstermek ve o güne uyan bir bilgi kartı seçmek."
- Nerede: "Yalnızca bu telefonda. Sunucuya gitmez. Nef'e yalnız, Nef izninde ayrıca onay verirsen, sayı olmadan durumu ve
  kaç akşam kaydettiğin gider."
- Ne kadar: "Sen silene kadar. 'Tüm verileri sil' hepsini siler."
- İşaretsiz kutu: "Günün nasıl geçtiğine dair kayıtlarımın (sağlığa ilişkin veri) yukarıdaki amaçla, yalnızca bu
  telefonda işlenmesine açık rıza veriyorum."

**B. Sağlık verisi sayılmazsa (rıza yok, gizlilik sayfasına bir satır):** "'Günün nasıl geçti?' kayıtların (seçtiğin
yüz, etiketler) yalnız bu telefonda durur ve sunucuya gitmez. Nef'e yalnız, Nef izninde ayrıca onay verirsen, sayı olmadan
durumu ve kaç akşam kaydettiğin gider. 'Tüm verileri sil' hepsini siler."

Not: A seçilirse akış ilk kullanımda bir rıza sayfası gösterir; plandaki "tek dokunuş, 10 saniye" akışı (plan satır
763–790) bu bir kerelik sayfayla değişir.

### Sizden istenen cevap

1. Günlük 1–5 arası ruh hâli öz bildirimi KVKK m. 6 anlamında sağlık verisi mi, genel kişisel veri mi?
2. Etiketler (özellikle "Gözlerim yoruldu") ya da düşük ruh hâli serisinde gösterilen sabit cümle bu cevabı değiştirir mi?
3. Verinin yalnız telefonda durması, sunucuya gitmemesi ve bizim ona erişmememiz sonucu nasıl etkiler? Bu durumda açık
   rıza gerekir mi?
4. A ile B'den hangisi uygun? Metinde düzeltilmesi gereken ne?
5. Nef'e giden `moodStatus` (durum sözcüğü) ve `n7` (kayıt sayısı) aynı sınıfa mı girer? (Soru 3'le bağlantılı.)

---

## Soru 3 · Nef rızası sürüm 2: kapsam ve metin

### Bağlam

| | |
|---|---|
| Ne değişir | Nef'e giden günlük paket küçülür ve sayı yerine durum sözcükleri gider. **Çıkanlar:** görme ölçümünün sayıları (`vaCurrent7`, `vaBaseline`, `vaDelta`), okuma hızı (`readingWpm`), ekran süresi cevabı (`screenHours`). **Eklenenler:** her ölçünün yalnız durumu (`{ key, status }`), okuma testinin durumu (`readingStatus`), her modülün basamağı (`stage`), yoldaki gün ve ara sayaçları (`pathDay`, `gapDays`, `later7`), ruh hâlinin durumu ve kayıt sayısı (`moodStatus`, `n7`), ayrıca haftalık ve aylık değerlendirme paketleri. **Hiç gitmeyenler:** hava, konum, şehir, etiket, kart metni, nefes kalıbının adı, "Zorlandım" işareti, Apple Sağlık verisi (plan §3.C.5, satır 718–735). |
| Nereye | Değişmez: yurt dışı, Vercel üzerindeki sunucumuz ve OpenRouter üzerinden bir yapay zekâ modeli (`app/src/lib/consent.js:66`). Paket sınırı 4.000 bayttır (`app/src/lib/coachCore.js:5`). |
| Ne kadar | Değişmez: "Sunucumuz içeriği kaydetmez." (`app/src/lib/consent.js:67`). Sağlayıcıların saklama süresi ve aktarım dayanağı zaten size sorulacaklar listesindeydi (`app/src/lib/consent.js:58-59`). |
| Kim görür | Daha önce Nef'e izin vermiş kişiye yeni metin bir kez gösterilir ve onayı yeniden alınır. "Şimdi değil" diyen kişiye, eski metnin izin verdiği alanlardan pakette kalanlar gitmeye devam eder; eklenen alanlar gitmez; çıkarılan alanlar zaten gitmez (plan satır 730–735). Bu davranış bugünkü koddaki kuraldır (`app/src/lib/consent.js:3-5`, `:111-118`). |
| Kod | Bugün: paket `app/src/lib/coach.js:40-63`, ekran süresi `:24`; izin verilen alanlar `app/src/lib/coachCore.js:9-37`, ekran süresi için model kuralı `:79`. Planlanan (Y6): `lib/coach.js`, `lib/coachCore.js`, `lib/consent.js` (coach ve coachLife sürüm 2), `site/gizlilik.html:59-60` (plan satır 1151). |

### Bugünkü metinler (aynen, `app/src/lib/consent.js:60-81`)

**coach (sürüm 1)**
- Başlık: "Nef sana her gün bir öneri yazsın mı?"
- Giriş: "Karar senin. Kapalıyken Nef'e hiçbir veri gitmez; uygulamanın geri kalanı aynen çalışır."
- Ne: "Son 7 günün özetleri: çalışma günü, dakika ve seri; görme ölçümü ortancası, başlangıçtan farkı ve uyarı düzeyi;
  okuma hızı; oyun ve egzersiz puanları (nefes öncesi/sonrası sakinlik farkı dahil); günün saati. Kamera görüntüsü,
  adın, e-postan ya da cihaz kimliğin gitmez"
- Neden: "Nef'in sana günlük tek bir içgörü ve öneri yazması (tıbbi tavsiye değildir)"
- Nerede: "Yurt dışında: sunucumuz (Vercel) ve OpenRouter üzerinden bir yapay zekâ modeli · şifreli bağlantı"
- Ne kadar: "Sunucumuz içeriği kaydetmez. Nef'i kapattığın an gönderim durur"
- Kutu: "Bu özetlerin (görme ölçümü sağlığa ilişkin veridir) yukarıdaki amaçla yurt dışına aktarılmasına açık rıza
  veriyorum."

**coachLife (sürüm 1)**
- Başlık: "Profil cevapların da Nef'e gitsin mi?"
- Giriş: "İsteğe bağlı. İzin vermesen de Nef çalışır; yalnızca öneriler uykunu ve ekran süreni hesaba katmaz."
- Ne: "Profil sorularına verdiğin cevapların özeti: uyku puanı, günlük ekran süresi, gece telefona bakma sıklığı, stres
  puanı"
- Neden: "Nef'in önerisini günlük hayatına göre yazması"
- Nerede: "Yurt dışında: sunucumuz (Vercel) ve OpenRouter üzerinden bir yapay zekâ modeli · şifreli bağlantı"
- Ne kadar: "Sunucumuz içeriği kaydetmez. İznini geri çektiğin an gönderim durur"
- Kutu: "Profil cevaplarımın özetinin (uyku puanı, günlük ekran süresi, gece telefona bakma sıklığı, stres puanı; sağlığa
  ilişkin veri) de aynı amaçla yurt dışına aktarılmasına açık rıza veriyorum."

### Taslak yeni metinler

**coach (sürüm 2)** (değişen satırlar; "Nerede" ve "Ne kadar" aynen kalır):
- Başlık ve giriş: aynen.
- Ne: "Son 7 günün özetleri, sayı yerine durum sözcüğüyle: çalışma günü, dakika ve seri; görme ölçümünün ve okuma
  testinin durumu (ör. 'başlangıç oluşuyor', 'doğrulanmış bir değişim yok') ve uyarı düzeyi; oyun ve egzersiz özetleri
  (nefes öncesi/sonrası sakinlik farkı dahil); yolundaki basamaklar ve yolun kaçıncı gününde olduğun; 'Günün nasıl
  geçti?' kayıtlarının durumu ve son 7 günde kaç akşam kaydettiğin; günün saati. Görme ve okuma sayıların, kamera
  görüntüsü, konumun, hava bilgisi, seçtiğin etiketler, adın, e-postan ya da cihaz kimliğin gitmez"
- Neden: "Nef'in sana günlük tek bir içgörü ve öneri, haftada ve ayda bir de değerlendirme yazması (tıbbi tavsiye
  değildir)"
- Kutu: "Bu özetlerin (görme ölçümünün durumu [ve Soru 2'nin cevabına göre: 'Günün nasıl geçti?' kayıtlarının durumu]
  sağlığa ilişkin veridir) yukarıdaki amaçla yurt dışına aktarılmasına açık rıza veriyorum."

**Önceden izin vermiş kişiye bir kez gösterilecek açıklama** (bugünkü hareket izni güncellemesiyle aynı kalıp,
`app/src/lib/consent.js:49-54`):
- Başlık: "Nef izninin metni güncellendi"
- Giriş: "Nef'e giden özet küçüldü: görme ve okuma sayıların artık gitmez, yerine durum sözcükleri gider. Yolundaki
  basamaklar ve 'Günün nasıl geçti?' kayıtlarının durumu eklendi; bu yüzden yeniden soruyoruz. 'Şimdi değil' dersen Nef
  yine çalışır; yalnız eklenen bilgiler gitmez."

**coachLife (sürüm 2)** ("ekran süresi" çıkar; plan satır 724–725):
- Giriş: "İsteğe bağlı. İzin vermesen de Nef çalışır; yalnızca öneriler uykunu hesaba katmaz."
- Ne: "Profil sorularına verdiğin cevapların özeti: uyku puanı, gece telefona bakma sıklığı, stres puanı"
- Kutu: "Profil cevaplarımın özetinin (uyku puanı, gece telefona bakma sıklığı, stres puanı; sağlığa ilişkin veri) de
  aynı amaçla yurt dışına aktarılmasına açık rıza veriyorum."
- Öbür satırlar aynen.

### Sizden istenen cevap

1. Eski metne izin verip yeni metne "Şimdi değil" diyen kişiye, eski metnin kapsadığı alanlardan kalanları göndermeye
   devam etmek uygun mu? Yoksa bu kişide gönderim tamamen durmalı mı?
2. coachLife'tan yalnız bir alan çıkıyor (ekran süresi); kapsam daraldığı için yeniden rıza almak gerekir mi, yoksa
   metni güncelleyip bilgi vermek yeter mi?
3. Durum sözcüklerine geçmek (sayı gitmez), paketin sağlık verisi niteliğini değiştirir mi? Kutudaki "sağlığa ilişkin
   veri" ibaresi nasıl yazılmalı?
4. Haftalık ve aylık değerlendirme, "günlük öneri" amacından ayrı bir amaç mı, yani ayrı bir rıza mı gerekir?
5. Taslak metinlerde düzeltilmesi gereken ne? Vercel ve OpenRouter için aktarım dayanağı (m. 9) ve sağlayıcıların saklama
   süresi, açık kalan eski sorudur; aynı cevapta yazabilir misiniz?

---

## Soru 4–7 · Bildirimler, hava ve yürüyüş eşliği (2026-09-30; `bildirim-hava-yuruyus/PLAN.v1.md` §4)

Bağlam: Nefona her modülde "Bana hatırlat" (saati kişi seçer ya da kişinin kendi kullanım saatlerinden seçilir), hava
satırı ve sabah hava bildirimi, yürüyüş eşliği (adım, tempo, mesafe; sesli koç) ekliyor. Yürüyüşün konumu ve hareket
verisi telefondan çıkmaz, saklanmaz. Hava için Apple'a (WeatherKit, yurt dışı) yuvarlanmış koordinat ya da seçilen
ilçenin tablodaki merkezi gider. Rıza taslakları: `bildirim-hava-yuruyus/rizalar-taslak.md` (`weather`, `walk`,
`walkDetect`).

4. **`walk` rızasının kapsamı.** Adım ve tempo sağlık verisi sayılır (KVKK m. 6). Yürüyüş ekranı, sesli koç, uygulama
   kapalıyken son 15 dakikanın adımına bakıp "Yürüyüşe mi çıktın?" diye sormak ve kaçan bir yürüyüşten sonra "Yürürken
   beni fark et"i önermek tek bir `walk` rızasıyla kapsanabilir mi, yoksa ayrı rızalar mı gerekir?
5. **"Her Zaman" konumun "yer değişti" sinyali olarak kullanılması** (`walkDetect`, isteğe bağlı, varsayılan kapalı).
   Konum saklanmaz ve telefondan çıkmaz; yalnız ≥ 500 m yer değişiminde uygulamayı uyandırır. Ayrı açık rıza ve metni
   yeterli mi? App Store'a çıkmadan önce ek bir şart var mı?
6. **Kullanım saati analizi.** "Sen karar ver" seçilince hatırlatma saati, kişinin kendi kayıtlarının saatlerinden
   telefonda hesaplanır; hiçbir yere gitmez. Bu, ayrı bir rıza gerektirir mi, yoksa bildirim ayarının kendisi yeter mi?
7. **Soru 1'in güncellenmesi.** (a) İlçe adı yeni bir veridir (profile yazılmaz, telefonda durur). (b) Sabah havasının
   2. ve 3. katmanı uygulama arka plandayken WeatherKit'e istek yapar; giden şey kişinin konumu değil, seçilen yerin
   tablodaki kamusal noktasıdır. Soru 1'deki aktarım değerlendirmesi bu iki noktayla değişir mi?

Cevap gelmezse (onaylı yedek, sahibin 2026-09-30 kararıyla): B3 "Kullanırken" konumla çıkar; "Her Zaman" (`walkDetect`)
App Store'a gitmez (derleme bayrağı kapalı, Info.plist'te metni yok); hava konumsuz da kullanılabilir (il/ilçe seçimi).

## Cevap gelmezse (plandaki yedek)

Hukukçunun adı Y4 aşamasının cihaz kapısına (S5) kadar gelmezse plan şu yedeği uygular: Y5 (hava) konum izni olmadan,
yalnız il seçimiyle yayına girer ve Apple'a kişinin konumu değil, seçtiği ilin merkezi gider; Y6'da ruh hâli alanları
(`n7`, `moodStatus`) Nef paketine girmez, paketin öteki küçültmeleri yine yayına girer. Konum izni ve Nef'e giden ruh
hâli alanları, cevabınız gelmeden App Store'a gönderilmez (TestFlight denemesi beklemez); cevap gelince bu iki parça ayrı
bir sürümle açılır. Yedek sizin onayınızın yerini tutmaz; yalnız belirsiz parçayı bekletir. Bugünkü rıza metinleri ve
il merkezinin Apple'a gitmesi de yine sizin cevabınızı bekler (plan satır 188–193, 1228–1231).
