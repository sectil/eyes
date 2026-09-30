# Nef bildirim sesi: mimari, istem, metin kuralları, maliyet, rıza ve sınav (araştırma, 2026-09-30)

Bu belge bir ARAŞTIRMA ve TASARIM notudur; kod değişikliği yoktur. Kapsam sahibinin isteği: "Bütün bildirimlerde Nef
etkisi olacak" (hava, yürüyüş algılama, modül hatırlatmaları), "Nef zeki değil ama istem ve veri düzenlemesiyle zeki
hâle getirilebilir; çok ucuz ama çok kaliteli", "her bildirim PubMed dayanağına bağlı".

Okunanlar (2026-09-30): `app/api/coach.js`, `app/src/lib/coachCore.js`, `app/src/lib/coach.js`,
`app/src/lib/consent.js`, `app/src/lib/notifyPlan.js` (1–97. satırlar), `app/src/lib/voicePack.js` (baş kısmı),
`app/ios/App/App/HealthPlugin.swift` (WalkGuard bölümü, yalnız arama), `docs/yol-haritasi/JEV_GOZ_KOCU.md`,
`docs/yol-haritasi/BILDIRIM_PLANI.md` (kaynak satırları), `docs/yol-haritasi/tasarim/YOL.nef.md`,
`docs/yol-haritasi/tasarim/SONSUZ_YOL.PLAN.v1.md` §2.2 (A8, A9), §3.C, §3.E, §3.F.4, §3.H. Fiyatlar
`https://openrouter.ai/api/v1/models` ucundan anahtarsız GET ile 2026-09-30'da okundu (464 model). OpenRouter'a
istek (sohbet çağrısı) atılmadı; hiçbir gizli anahtara bakılmadı.

İşaretler: **VARSAYIM** = kaynağı olmayan seçim ya da tahmin. "Bakmadım" = doğrulanmadı. PubMed künyeleri bu belgede
yalnız **alan** olarak yazılır; dayanak listesi ayrı ajandadır. Adı geçen künyeler (Bell 2023, Klasnja 2019, Tannenbaum
2015, Trinquart 2023, Silva 2018, Tucker ve Gilliland 2007, Klimek 2022) repodaki belgelerde zaten geçenlerdir; bu
oturumda PubMed'de yeniden açılmadı.

---

## Sonuçlar (10 madde)

1. **Nef sesi iki katmanlı olmalı, ama model çalışma anında değil yapım anında çalışmalı.** (a) Telefonda, ağsız,
   veriye dayalı kural motoru + yer tutuculu cümle bankası bildirimi kurar. (b) Model yalnız geliştirme sırasında,
   kişisel veri görmeden, bağlam etiketlerinden aday cümle üretir; adaylar makine denetiminden, ikinci bir model
   yargıcından ve sahibin onayından geçip uygulamaya gömülür. Kişi başına canlı model çağrısı bildirimler için
   önerilmez.
2. **Neden:** yerel bildirimin metni kurulduğu anda sabitlenir ve uygulama kapalıyken kod çalışmaz; hava ve konum
   sunucuya gidemez (onaylı plan §E.1–E.2); rıza olmadan Nef'e veri gidemez. Canlı model bu üç kısıtın üçüne de takılır.
   Banka yöntemi üçünü birden aşar: çalışma anında ağ, rıza ve sunucu gerekmez.
3. **"Yeni sayı uydurma" riski yer tutucu yöntemiyle sıfıra iner:** model hiçbir rakam, sayı sözcüğü, saat, gün adı ya da
   hava durumu sözcüğü yazamaz; bunları yalnız `{rainFrom:LOC}`, `{tempC}`, `{tempWord}` gibi yer tutucularla çağırır.
   Denetçi rakam ve sayı sözcüğü içeren adayı atar. Sayıyı ve Türkçe eki telefondaki kod yazar; kod birim testleriyle
   sınanır.
4. **Zekâ hissi veriden ve cümle türünden gelir, modelin o anki aklından değil:** hatırlatıcı nesne (şemsiye, eldiven,
   su), zamanlama ("21.00'den önce"), bağlantı (her zamanki yürüyüş saati, basamak, yağmurda Gökyüzü molası), seçim
   bırakma. Kural motoru durumu doğru seçerse sabit bir cümle bile "beni tanıyor" hissi verir.
5. **Metin kuralları:** başlık ≤ 30, gövde ≤ 110 karakter; en önemli bilgi (saat) ilk 60 karakterde (kilit ekranı satır
   sayısı Apple belgesinde bulunamadı, VARSAYIM). Saat eki okunuşa göre kod tablosundan ("21.00'de", "19.00'da",
   "14.00'ten", "12.00'ye"). Emoji yok, ünlem yok, "-malısın" yok, korkutma, suçlama ve sağlık iddiası yok. Hava tahmini
   her zaman "bekleniyor" ya da "olasılığı" ile söylenir, "yağacak" denmez.
6. **Maliyet (2026-09-30 fiyatları):** banka yöntemi bir sürüm için ≈ 1 USD (üretim + yargıç), kullanıcı sayısından
   bağımsız. Canlı yöntem `google/gemini-3.1-flash-lite` ile (giriş 0,25, çıkış 1,50 USD / 1M token) kişi başı günde 3
   bildirimde ayda ≈ 0,037 USD → 1.000 kişide ≈ 37 USD, 10.000 kişide ≈ 374 USD (token sayıları VARSAYIM). Fark para
   değil; asıl fark gizlilik ve doğruluk.
7. **Gizlilik ve rıza:** banka yönteminde çalışma anında sunucuya hiçbir şey gitmez, modele hiç kişisel veri gitmez; yeni
   rıza gerekmez. Mevcut `coach` rızası (amaç: "günlük tek bir içgörü ve öneri") bildirim metni üretmeyi **kapsamaz**;
   canlı yöntem seçilirse ayrı bir amaç ve ayrı açık rıza (`coachNotify`) gerekir, hava ve konum yine gitmez.
8. **Ses:** bildirim sesli değil; yürüyüş koçunun sesi ElevenLabs ile önceden üretilmiş parçalardır. Bu yüzden sesli
   koç cümleleri bankanın ayrı, **rakamsız ve yer tutucusuz** bir alt kümesidir; ekranda o parçanın metni birebir
   yazar, sayı (23 derece) cümlenin içinde değil yanında ayrı bir etiket olarak durur. Dinamik cümle seslendirilmez.
9. **Her bildirim bir kanıt anahtarına bağlanır, günde biri görünür bilim satırı taşır (§10):** gövde iki satırdır,
   Nef cümlesi (≤ 70) + tek bulgu satırı (≤ 100; "Bir denemede …; 44 kişi, 6 hafta."); makale adı, PMID ve DOI bağlantısı
   dokununca açılan kartta (bildirimde bağlantı tıklanamaz). Bulgu dili zorunlu, "kanıtlandı/iyileştirir" yok; ay yalnız
   takvim anı ve davettir, ay → uyku → nefes zinciri kurulmaz. Aynı bilim satırı 7 gün içinde tekrarlanmaz. Göz egzersizi,
   yürüyüş, nefes, yoga, mola, su ve hava için 3'er örnek yalnız depoda PMID'i olan kaynaklarla yazıldı; eksikler "kaynak
   bekliyor". Bulgu: Kim 2020 ve Wolffsohn 2025 `sources.js`'te kayıtlı değil (`YOL.nef.md` §14 "zaten var" diyor).
10. **Sınav:** 50 senaryoluk otomatik sınav (sayı eşleşmesi, saat eki, uzunluk, yasak kalıp, hava sözlüğü tutarlılığı,
    "bugün/yarın" doğruluğu, ses = ekran) her derlemede çalışır; banka için ayrıca iki bağımsız model incelemesi ve üç
    kişilik kör insan değerlendirmesi (sahip + iki ana dili Türkçe okur, biri 50 yaş üstü). Geçme koşulu: sayı ve olgu
    hatası 0, yasak kalıp 0; dil puanı ortancası ≥ 4/5 (eşik VARSAYIM).

---

## 1. Mimari: "Nef sesi" iki katman mı?

### 1.1 Kısıtlar neyi zorunlu kılıyor

| Kısıt | Kaynak | Sonucu |
|---|---|---|
| Yerel bildirimin saati ve metni kurulduğu anda sabitlenir; uygulama kapalıyken kod çalışmaz | `lib/notifyPlan.js:1-3`; plan §E.6 | Metin, bildirimin çalacağı andan saatler önce (plan kurulurken) yazılmalı. O anki veriyle "canlı" yazılamaz |
| Yürüyüş koruması arka planda yalnız HealthKit teslimiyle, en sık saatte bir uyanır | `HealthPlugin.swift:267` (`enableBackgroundDelivery … .hourly`) | Arka planda çalışan Swift kodu ağ ve model beklemeden metin seçebilmeli; metin önceden hazırlanmış olmalı |
| Bildirim anında ağ olmayabilir | istek | Metin telefonda üretilebilmeli |
| Konum ve hava sunucuya ve Nef'e gitmez | plan §E.1 ("Nef hava verisi üretmez … cümle sabit şablondan çıkar"), §E.2 (`weather` rızası "sunucumuza ve Nef'e gitmez") | Hava içeren her cümle telefonda kurulmalı |
| Rıza olmadan Nef'e veri gitmez | `lib/consent.js` `coachAllowed` | Rızasız kullanıcıda da Nef dili istendiği için model yolu tek yol olamaz |
| Ekrandaki cümle = sesteki cümle | `docs/ANA_BELGE.md:59`; plan §H | Sesli cümleler önceden seslendirilmiş sabit metin olmalı |
| Sağlık iddiası yok; yeni sayı/saat uydurmak yasak | `coachCore.js` `FORBIDDEN`, SYSTEM_PROMPT; plan §C.3 | Sayılar kuraldan gelmeli, model yazmamalı |

### 1.2 Üç seçenek

| | A. Yalnız el yazımı şablon | B. Canlı model (kişi başı, çevrimiçi) | C. Önerilen: kural motoru + model üretimli, denetlenmiş banka |
|---|---|---|---|
| Çalışma anı | telefonda, ağsız | uygulama açıkken sunucu → OpenRouter; bildirim metni plan kurulurken alınır | telefonda, ağsız |
| Modelin gördüğü veri | yok | kişinin sinyalleri (rızayla); hava ve konum **gönderilemez** | yok (yalnız soyut bağlam etiketleri, örn. `rain.evening`, `walkHabit.before`) |
| Hava içeren cümle | olur | olmaz (hava modele gidemez); model yalnız havasız kısmı yazabilir | olur (hava yer tutucuyla, telefonda) |
| Çeşitlilik ve üslup | sınırlı (bugün tür başına 5–6 metin, `notifyPlan.js:49-89`) | yüksek ama denetlenmemiş | yüksek ve her cümle önceden denetlenmiş |
| Uydurma riski | yok | var (süzgeçle azalır, sıfırlanmaz) | yok (rakam yazamaz; olgu yer tutucudan) |
| Rıza | gerekmez | yeni ayrı açık rıza gerekir (§5) | gerekmez |
| Maliyet | 0 | kişi sayısıyla büyür (§4) | sürüm başına ≈ 1 USD, kişi sayısından bağımsız |
| Hata biçimi | yok | zaman aşımı, 422, ağ yok → yedek metin | yok; eksik veri → daha genel banka hücresi |
| "Ekran = ses" | sağlanır | sağlanamaz (dinamik cümle seslendirilemez) | sağlanır (sesli alt küme sabit) |
| App Store incelemesi | kolay | Guideline 5.1.2 açıklaması gerekir (JEV_GOZ_KOCU "Gizlilik ve mağaza") | kolay; model kullanıcıya dokunmaz |

**Öneri: C.** Sahibin "istem ve veri düzenlemesiyle zeki" fikri tam olarak budur: zekâ, (1) kural motorunun durumu doğru
okuması, (2) yer tutucuların veriyi doğru yere koyması, (3) bankadaki cümlelerin iyi yazılmış olmasıdır. Model yalnız
üçüncüsüne, yapım anında, katkı verir.

### 1.3 Model hiç veri görmeden "zeki cümle" bankası üretebilir mi?

Evet. Cümlenin zekâsı kişinin sayısından değil **durumun türünden** gelir. "Yağmur akşam, kişi genelde akşam yürüyor ve
yürüyüş saati yağmurdan önce" bir durumdur; bunu bilen cümle ("Her zamanki {walkHabit} yürüyüşün yağmurdan önceye denk
geliyor.") her kişide doğrudur, çünkü sayıyı ve koşulu telefondaki kural motoru doldurur ve seçer. Modelin bilmesi
gereken yalnız etiket sözlüğüdür.

Akış:

```
YAPIM ANI (geliştirici makinesi, rızasız çünkü kişisel veri yok)
  bağlam hücreleri (etiket kümeleri, ör. rain.evening × walkHabit.before × plannedEvening)
      │  hücre başına istem (§2.4)  · sıcaklık 0,8–0,9 · JSON şema
      ▼
  aday cümleler (hücre başına 15–20, yer tutuculu)
      │  makine denetimi (§6.2): rakam yok, sayı sözcüğü yok, yasak kalıp yok, yer tutucu listesi hücreyle uyumlu,
      │  hava sözlüğü hücreyle uyumlu, en uzun doldurmayla uzunluk ≤ sınır
      ▼
  yargıç modeli (başka aile, sıcaklık 0): doğallık, incelik, ton, iddia, belirsizlik dili → puan
      ▼
  sahibin (ve varsa editörün) onayı → hücre başına 5–8 cümle
      ▼
  app/src/lib/nefBank.js (sürüm numaralı, her öğe: id, cell, title, body, slots, kind, evidence, voiceId?)

ÇALIŞMA ANI (telefon, ağsız)
  veri: WeatherKit önbelleği, yürüyüş alışkanlığı, yol basamağı, modül durumları (hepsi telefonda)
      │  kural motoru: durum → hücre (en özel hücreden genele) → döndürme (gün + tür karması) → yer tutucu doldurma
      ▼
  bildirim nesnesi (title, body) → notifyPlan → applyPlan (tek plan, plan §E.6)
  yürüyüş algılama için: saat saat önceden doldurulmuş metin tablosu → Swift (§1.5)
```

Banka hücre sayısı (VARSAYIM, ilk sürüm): hava 12 hücre, yürüyüş algılama 14, modül hatırlatmaları 20 (modül × durum) →
46 hücre × 6 onaylı cümle ≈ 280 cümle. Bell 2023'e göre metin bankası tek metinle aynı açılma etkisini verdi
(`BILDIRIM_PLANI.md:36, :181`); bu yüzden amaç çok sayıda cümle değil, **durumu doğru okuyan az sayıda iyi cümle**.

### 1.4 İsteğe bağlı model katmanı nerede işe yarar (ileride)

Tek makul canlı kullanım: rızası olan kişide, uygulama açıkken, **modül hatırlatmalarının** bankadan hangi cümleyle
kurulacağını modelin **seçmesi** (çıktı serbest metin değil banka `id`'si). Bu "seçici model" yöntemi uydurmayı yapısal
olarak imkânsız kılar, ama kural motorunun zaten yapabildiği bir işi pahalı ve rızaya bağlı hâle getirir. Önerim: ilk
sürümde yapılmaz; §7'deki saha ölçümü kural seçimiyle bir etki göstermezse de yapılmaz.

### 1.5 Yürüyüş algılama bildirimi: metin nerede kurulur

Algılama yöntemi ayrı ajanın konusudur. Hangi yöntem seçilirse seçilsin, algılamayı yapan kod (arka planda Swift)
ağ ve model olmadan metin koyabilmelidir. Öneri: JS plan kurulurken günün her saati için (örn. 07.00–22.00, 16 satır)
hava önbelleğinden doldurulmuş metni hazırlar ve WalkGuard'a verdiği gibi (`setWalkGuards`) yerel depoya yazar:

```js
walkTexts: [{ hour: 18, title: 'Yürüyüşe mi çıktın?', body: 'Hava 23 derece, ılık ve yürüyüş için güzel. Sana eşlik edelim mi?', cell: 'walk.good', validUntil: '…' }, …]
```

Swift yalnız saati seçer. Önbellek bayatsa (`validUntil` geçti; VARSAYIM: hava verisinin alınışından 6 saat sonra) hava
cümlesiz hücreye (`walk.noWeather`, örnek D6) düşer. Böylece Swift'e cümle kurma mantığı taşınmaz; tek yazım yeri JS'teki
kural motorudur.

---

## 2. Ucuz modelle kalite: istem mühendisliği

### 2.1 Teknikler ve neden işe yaradıkları

| Teknik | Nasıl | Neden işe yarar |
|---|---|---|
| Yapılandırılmış girdi | Model serbest bağlam değil, kapalı etiket listesi alır: `{"cell":"rain.evening","walkHabit":"before","planned":"morning"}` ve her etiketin tek cümlelik anlamı | Küçük model belirsiz talimatı yanlış yorumlar; kapalı sözlükte yorum payı azalır. Mevcut koçta da sayılar kural katmanından gelir (`coachCore.js:2`) |
| Yer tutucu | Olgular yalnız `{rainFrom:LOC}`, `{tempC}`, `{tempWord}` … ile; ek türü yer tutucuda (`:LOC` bulunma, `:ABL` ayrılma, `:DAT` yönelme) | Model sayı yazamazsa sayı uyduramaz. Türkçe saat ekini model değil kod koyar; en sık dil hatası kökten kalkar |
| Örnekli istem (3–5 örnek) | Her hücre türü için iyi ve kötü örnek (kötünün nedeni yazılı) | Küçük modeller ton ve uzunluğu açıklamadan çok örnekten öğrenir; kötü örnek yasak kalıbı somutlaştırır |
| JSON şema / yapılandırılmış çıktı | `response_format` ile şema; `gemini-3.1-flash-lite` ucu `response_format` ve `structured_outputs` destekliyor (model listesi `supported_parameters`, 2026-09-30) | Ayrıştırma hatası biter; alan uzunlukları şemada |
| Kısıtlı sözlük | Hücre başına izinli hava sözcükleri (yağmur hücresi: yağmur, şemsiye, ıslak, kuru, pencere; güneş ve kar yok) ve genel yasak sözcükler | Model başka hava durumu iddia edemez; denetçi basit sözcük araması yapar |
| Üret → denetle (iki aşama) | Üretim sıcaklığı yüksek (0,8–0,9, çeşitlilik); yargıç ayrı model, sıcaklık 0, puan + gerekçe | Üreten model kendi hatasını görmez; ayrı aile başka hata yapar, ikisinin kesişimi küçük |
| Ret süzgeci (deterministik) | Regex: rakam, sayı sözcüğü, emoji, ünlem, "-malısın", sağlık iddiası, kesinlik ("yağacak") | Modelden bağımsız, her derlemede aynı sonucu verir; mevcut `passesGuard` mantığının genişlemesi |
| Aşırı üretim + seçme | Hücre başına 15–20 aday, 5–8 kabul | Ucuz modelde ortalama değil en iyi adaylar kullanılır; maliyet önemsiz (§4) |
| Sıcaklık ayarı | Üretimde 0,8–0,9; yargıçta 0; canlı kullanım olursa 0,3–0,4 (mevcut koç 0,4, `api/coach.js:66`) | Banka için çeşitlilik istenir, çünkü süzgeç arkada; yargıçta tekrar edilebilirlik istenir |
| Akıl yürütme kapalı | `reasoning` parametresi kapalı ya da en düşük (VARSAYIM: bu iş için gerekmez) | Kısa metin işinde gizli akıl yürütme token'ı yalnız maliyet ekler (`gemini-3.1-flash-lite` fiyat tablosunda `internal_reasoning` çıkış fiyatıyla aynı: 1,50 USD / 1M) |

### 2.2 Yer tutucu yöntemi "yeni sayı uydurma"yı nasıl sıfırlar

1. **Model tarafı:** istem "hiçbir rakam, sayı sözcüğü, saat, gün adı, yüzde yazma; yalnız verilen yer tutucuları kullan"
   der. Bu tek başına yetmez (model yine yazabilir), bu yüzden:
2. **Denetçi tarafı (deterministik, derlemede):** yer tutucular çıkarıldıktan sonra kalan metinde şu varsa aday atılır:
   `\d`, `%`, sayı sözcükleri (`sıfır|iki|üç|dört|beş|altı|yedi|sekiz|dokuz|\bon\b|yirmi|otuz|kırk|elli|altmış|yetmiş|seksen|doksan|yüz|bin|yarım|çeyrek`;
   "bir" belirsiz tanımlık olduğu için yasaklanmaz ama "bir saat", "bir dakika", "bir gün" kalıbı yasaktır), saat
   bölümü sözcükleri (`sabah|öğle|öğleden sonra|akşam|gece`) yalnız `{rainPart}` gibi yer tutucuyla gelir, gün adları ve
   "yarın/bugün" yalnız `{dayWord}` ile gelir.
3. **Yer tutucu uygunluğu:** her hücre izinli yer tutucu listesi taşır (`rain.evening`: `rainFrom, rainTo, rainProb,
   rainPart, dayWord, walkHabit`); listede olmayanı kullanan aday atılır. Böylece "güneş batıyor {sunset}" gibi, o hücrede
   verisi olmayan olgu yazılamaz.
4. **Doldurma tarafı (telefonda):** sayıyı ve eki `renderSlot(value, case)` yazar; birim testleri saat eki tablosunu
   (§3.2) birebir sınar.
5. **Olgu tutarlılığı:** doldurulmuş metindeki her rakam dizisi, o bildirimin veri nesnesindeki bir değere eşit olmalı
   (sınav S1, §7). Bu, kod hatasını da yakalar.

Sonuç: modelden gelen metinde sayı **olamaz** (2. adım), olan her sayı veriden gelir (4.–5. adım). Geriye kalan risk
modelin değil kodun hatasıdır ve birim testiyle ölçülür. Anlamsal ima riski (örn. "yağmur dinince" cümlesinin yağmurun
dineceğini varsayması) hücre koşuluyla kapanır: bu cümle yalnız `rainTo` bilinen hücrede kabul edilir.

### 2.3 Yer tutucu sözlüğü (telefonda doldurulur)

| Yer tutucu | Değer | Kaynak (telefonda) |
|---|---|---|
| `{rainFrom}`, `{rainTo}` (+ `:LOC`, `:ABL`, `:DAT`) | "21.00", "21.00'de", "21.00'den", "21.00'e" | WeatherKit saatlik tahmin, A9 eşiği (plan §2.2) |
| `{rainProb}` | "%70" | en yüksek saatlik olasılık, 10'a yuvarlanmış (VARSAYIM) |
| `{rainPart}` | sabah / öğle / öğleden sonra / akşam / gece | `rainFrom` saatinden kural (06–11 sabah, 11–14 öğle, 14–18 öğleden sonra, 18–22 akşam, 22–06 gece; VARSAYIM) |
| `{rainLen}` | kısa / uzun / gün boyu | süre ≤ 1 sa kısa, ≥ 8 sa gün boyu (VARSAYIM) |
| `{dayWord}` | bugün / yarın | **bildirimin çalacağı ana göre**, kurulduğu ana göre değil |
| `{forecastNote}` | "Dün akşamki tahmine göre" ya da boş | plan §E.6 (akşam kurulmuşsa) |
| `{tempC}` | "23 derece", "eksi 3 derece" | hissedilen sıcaklık (VARSAYIM: gerçek sıcaklık yerine) |
| `{tempWord}` | soğuk / serin / ılık / sıcak / çok sıcak | §3.3 eşikleri |
| `{windWord}` | "rüzgârlı" ya da boş | rüzgâr ≥ 30 km/sa (VARSAYIM) |
| `{sunset}` (+ ek) | "19.12'de" | WeatherKit günlük güneş batışı (bakmadım: Türkiye için alanın dolu geldiği) |
| `{rainEnd}` (+ ek) | "17.00'de" | son yağışlı saatin bitişi |
| `{walkHabit}` | "18.00" | son 14 günde en sık yürüyüş saati, telefonda (sağlık rızası v2 kapsamı "bu telefonda" — §5) |
| `{module}`, `{stage}`, `{minutes}`, `{seconds}`, `{gapDays}`, `{streakDays}`, `{best}` | "Nefes", "4.", "3 dakika", "20 saniye", "5 gün" … | yol ve modül katmanı (`YOL.nef.md` §6.1, plan §A) |

### 2.4 İstem taslakları (yapım anı; bankayı üretir)

Üç istem aynı **ortak gövdeyi** paylaşır; türe özgü bölüm sonra gelir. Model kişisel veri görmez.

**Ortak gövde**

```
Sen Nefona uygulamasının koçu "Nef"in yazı editörüsün. Görevin: verilen bağlam hücresi için telefon bildirimi adayları yazmak.
Nef'in sesi: Türkçe, "sen" diliyle, sıcak, kısa, tek fikir; seçim bırakır ("istersen", "seçim senin"); yargılamaz; abartmaz.

KESİN KURALLAR
1. Hiçbir rakam, sayı sözcüğü (iki, üç, on, yirmi, yarım, çeyrek…), saat, yüzde, gün adı, "bugün", "yarın", "sabah",
   "öğle", "akşam", "gece" YAZMA. Bunlar gerekiyorsa YALNIZ verilen yer tutucuları kullan: {rainFrom:LOC} gibi.
   Yer tutucunun ekini sen yazma; ek türünü iki noktadan sonra seç: LOC (-de/-da), ABL (-den/-dan), DAT (-e/-a), NOM (eksiz).
2. Yalnız hücrenin izinli yer tutucularını ve izinli hava sözcüklerini kullan. Listede olmayan hava durumu (güneş, kar,
   rüzgâr, sis…) ya da olay uydurma.
3. Hava tahmini kesin değildir: "yağacak" deme; "bekleniyor" ya da "olasılığı" de.
4. Sağlık iddiası YASAK: iyileştirir, tedavi, korur, önler, bağışıklık, D vitamini, göz sağlığı, stres atar, kanıtlanmış,
   bilimsel olarak. Beden ya da ruh hâli hakkında sonuç söyleme.
5. Korkutma yok (tehlike, kaza, hastalanırsın, çarpar). Suçlama yok (yine, hâlâ, kaçırdın, tembel, seri bozuldu).
   Emir kipi zorlaması yok (-malısın, zorundasın, mutlaka, sakın). Ünlem ve emoji yok. Büyük harfle vurgu yok.
6. Başlık en çok 30, gövde en çok 110 karakter; bu sınırlar yer tutucular EN UZUN değerleriyle dolunca da geçerli
   ("{rainFrom:ABL}" en çok 9 karakter, "{tempC}" en çok 15 karakter say).
7. Her aday bir "zekâ türü" taşır: nesne (hatırlatılacak eşya), zaman (önce/sonra), bağ (kişinin alışkanlığına ya da
   uygulamadaki başka bir pratiğe köprü), çerçeve (durumu olumlu yeniden çerçeveleme), seçim (karar kişide).
   Mizah en çok her beş adaydan birinde ve hafif olsun.
8. Nef kendinden üçüncü kişiyle söz etmez ("Nef diyor ki" yok); "eşlik edelim" gibi biz dili serbest.

ÇIKTI: yalnız JSON:
{"candidates":[{"title":"…","body":"…","kind":"nesne|zaman|bag|cerceve|secim","slots":["rainFrom",…]}]}
Tam olarak {n} aday yaz. Adaylar birbirinin kopyası olmasın: farklı zekâ türleri ve farklı fiiller kullan.
```

**Hava (yağmur) bölümü**

```
BİLDİRİM TÜRÜ: yağmur haberi. Sabah (ya da önceki akşam) kurulur, sabah çalar. İlk cümle olguyu söyler, ikinci cümle Nef'in
kısa, işe yarar notudur.
İLK CÜMLE KALIBI (değiştirme, yalnız seç):
  a) "{dayWord} {rainFrom}–{rainTo} arası yağmur bekleniyor."
  b) "{forecastNote} {rainFrom}–{rainTo} arası yağmur var."          (yalnız planned=evening hücresinde)
  c) "{dayWord} {rainFrom}–{rainTo} arası yağmur olasılığı {rainProb}." (yalnız prob=borderline hücresinde)
HÜCRE: {"cell":"rain.evening","walkHabit":"before","planned":"morning","len":"normal"}
ETİKET ANLAMLARI: walkHabit=before → kişinin her zamanki yürüyüş saati yağmurdan önce; at → yağmura denk; after → sonra;
  none → bilinmiyor. planned=evening → tahmin dün akşam alındı. len=short|normal|allday.
İZİNLİ YER TUTUCULAR: dayWord, rainFrom, rainTo, rainProb, rainPart, rainLen, walkHabit, forecastNote
İZİNLİ HAVA SÖZCÜKLERİ: yağmur, şemsiye, ıslak, kuru, pencere, bulut, yağmurluk, kapüşon
İYİ ÖRNEK: {"title":"Yağmur {rainFrom:LOC}","body":"{dayWord} {rainFrom}–{rainTo} arası yağmur bekleniyor. Her zamanki {walkHabit} yürüyüşün yağmurdan önceye denk geliyor.","kind":"bag"}
KÖTÜ ÖRNEK (neden): "Akşam 9'da yağmur yağacak, ıslanma!" → saat ve bölüm sözcüğü yer tutucusuz, "yağacak" kesin, ünlem.
KÖTÜ ÖRNEK (neden): "Yağmurlu havada yürümek bağışıklığı güçlendirir." → sağlık iddiası.
```

**Yürüyüş algılama bölümü**

```
BİLDİRİM TÜRÜ: yürüyüş algılandı. Başlık her zaman tam olarak "Yürüyüşe mi çıktın?". Gövde: (1) hava olgusu,
(2) kısa Nef notu, (3) sonda soru: "Sana eşlik edelim mi?" ya da "Eşlik edelim mi?" (dokununca sesli yürüyüş başlar).
HAVA OLGUSU KALIBI: "Hava {tempC}, {tempWord}." ; hücre good ise "Hava {tempC}, {tempWord} ve yürüyüş için güzel."
HÜCRE: {"cell":"walk.rainSoon","temp":"serin","rainSoonHours":"<=2"}
ETİKET ANLAMLARI: walk.good → önümüzdeki 2 saatte yağmur yok, hissedilen 12–27 derece, rüzgâr yok; walk.rainSoon → 2 saat
  içinde yağmur bekleniyor; walk.dark → güneş 1 saat içinde batıyor; walk.hot / walk.cold / walk.windy; walk.afterRain →
  yağmur son 1 saatte dindi; walk.noWeather → hava verisi yok ya da eski (hava sözü YOK).
İZİNLİ YER TUTUCULAR: tempC, tempWord, windWord, rainFrom, sunset, rainEnd
İZİNLİ HAVA SÖZCÜKLERİ: hücreye göre (rainSoon: yağmur, şemsiye; dark: güneş, aydınlık, karanlık, ışık; hot: gölge, su;
  cold: eldiven, atkı, kat; windy: rüzgâr; afterRain: ıslak, zemin, su birikintisi)
EK KURAL: Adım sayısı, süre, kalori, nabız yazma (kilit ekranında sağlık bilgisi görünmesin; BILDIRIM_PLANI "yürüyüş
  metinlerinde rakam yok" kuralı).
İYİ ÖRNEK: {"title":"Yürüyüşe mi çıktın?","body":"Hava {tempC}, {tempWord}; {rainFrom:LOC} yağmur bekleniyor. Kısa bir tur için tam zamanı. Eşlik edelim mi?","kind":"zaman"}
KÖTÜ ÖRNEK (neden): "Harika! 5000 adımı geçtin, hadi 10000!" → ünlem, sayı, sağlık verisi, baskı.
```

**Modül hatırlatması bölümü**

```
BİLDİRİM TÜRÜ: modül hatırlatması (kişinin seçtiği saatte). Başlık modülün adı ya da durumu; gövde bugünkü somut adım
(süre ve basamak yer tutucuyla) + seçim bırakan kısa bir not.
HÜCRE: {"cell":"module.gap","module":"breath","stageKnown":true}
ETİKET ANLAMLARI: module.today → bugünkü basamak; module.gap → 3–13 gün ara ("kaldığın yerden"; ceza dili yok);
  module.soft → 14+ gün ara, bugün yumuşak basamak; module.unlocked → bugün yeni açılan modül (ne yaptığı söylenir,
  fayda vaat edilmez); module.record → dün rekor; module.due → haftalık E testi ya da iyi oluş soruları günü.
İZİNLİ YER TUTUCULAR: module, stage, minutes, seconds, gapDays, streakDays, best, nextModule
MODÜL NOTU: {coachNote} (manifestteki tek satır; YOL.nef §4.4) — puanı görmeyle, dikkatle ya da sağlıkla ilişkilendirme.
YASAK: görme ölçümü sonucu, uyarı, doktor sözü (bunlar yalnız uygulama içinde sabit satırla söylenir; bildirimde asla).
İYİ ÖRNEK: {"title":"Kaldığın yerden","body":"{gapDays} ara verdin; basamağın aynı. Bugün {module} {minutes}, hazırsan başlayalım.","kind":"cerceve"}
KÖTÜ ÖRNEK (neden): "5 gündür yoksun, serin bozuldu." → suçlama, ceza dili, yer tutucusuz sayı.
```

**Yargıç istemi (ikinci aşama, başka model ailesi, sıcaklık 0)**

```
Sana bir bağlam hücresi ve bir Türkçe bildirim adayı veriyorum (yer tutucular süslü parantezde). Beş ölçüte 1–5 puan ver
ve tek cümle gerekçe yaz: (1) doğal Türkçe (çeviri kokusu, anlatım bozukluğu, yüklemsiz cümle yok), (2) hücreye uygunluk
(etiketlerin söylediğinden fazlasını iddia ediyor mu), (3) incelik (işe yarar, beklenmedik ama yerinde bir not var mı),
(4) ton (sıcak, suçlamasız, baskısız), (5) güvenlik (sağlık iddiası, korkutma, kesin hava dili yok). Herhangi bir ölçüt
≤ 2 ise "reject": true. Yalnız JSON: {"scores":[n,n,n,n,n],"reject":bool,"why":"…"}
```

Yargıç için model seçimi: üretici Google ailesiyse yargıç başka aileden (örn. `anthropic/claude-haiku-4.5` ya da
`mistralai/mistral-small-2603`). Gerekçe: aynı ailenin kendi kalıbını beğenme eğilimi (VARSAYIM; bakmadım).

### 2.5 Örnekler: girdi → çıktı (elle yazıldı; başlık ≤ 30, gövde ≤ 110 karakter; uzunluklar doldurulmuş hâliyle sayıldı)

Girdi, kural motorunun telefonda kurduğu veri nesnesidir; bankadaki yer tutuculu cümle bu veriyle doldurulur. Rakamlar
yalnız girdiden gelir. Karakter sayıları Python `len` ile sayıldı.

**Hava (yağmur) — kurulma saati A8'e göre sabah ya da önceki akşam**

| # | Girdi (telefonda) | Başlık | Gövde | B/G |
|---|---|---|---|---|
| W1 | rain 21.00–22.00, %70, walkHabit 19.00 (before), planned morning | Yağmur 21.00'de | Bugün 21.00–22.00 arası yağmur bekleniyor. Yürüyüşü 21.00'den önce bitirirsen şemsiyeye gerek kalmayabilir. | 15/107 |
| W2 | rain 14.00–17.00, %80, walkHabit none | Bugün yağmur bekleniyor | 14.00–17.00 arası yağmur bekleniyor. Çıkarken şemsiyeyi çantana koymayı unutma. | 23/79 |
| W3 | rain 09.00–20.00 (allday), %90 | Gün boyu yağmur | 09.00–20.00 arası yağmur bekleniyor. Yürüyüş bugün içeride de olur: koridor turu da adımdır. | 15/92 |
| W4 | rain 16.00–18.00, planned evening (dün 21.10'da kuruldu) | Bugün yağmur bekleniyor | Dün akşamki tahmine göre 16.00–18.00 arası yağmur var. Dönüş için şemsiyeni kapının yanına bırak. | 23/97 |
| W5 | rain 11.00–12.00 (short), %60 | Kısa bir yağmur | Bugün 11.00–12.00 arası kısa bir yağmur bekleniyor. Öğle yürüyüşünü 12.00'den sonraya alabilirsin. | 15/98 |
| W6 | rain 18.00–20.00, tMin 9 (soğuk) | Yağmur ve 9 derece | Bugün 18.00–20.00 arası yağmur ve 9 derece bekleniyor. Akşama şemsiye ve kalın bir kat iyi gider. | 18/97 |
| W7 | rain 19.00–21.00, walkHabit 18.00 (before) | Yağmur 19.00'da | Bugün 19.00–21.00 arası yağmur bekleniyor. Her zamanki 18.00 yürüyüşün yağmurdan önceye denk geliyor. | 15/101 |
| W8 | rain 17.00–19.00, walkHabit 18.00 (at) | Yağmur yürüyüş saatinde | Bugün 17.00–19.00 arası yağmur bekleniyor, yürüyüş saatine denk geliyor. İstersen 17.00'den önce çık. | 23/101 |
| W9 | rain 15.00–16.00, %50 (borderline) | Yağmur olasılığı %50 | Bugün 15.00–16.00 arası yağmur olasılığı %50. Yazı tura gibi; küçük bir şemsiye çantada yer tutmaz. | 20/99 |
| W10 | rain 13.00–23.00 (long), Gökyüzü modülü açık | Uzun bir yağmur | Bugün 13.00–23.00 arası yağmur bekleniyor. Yağmuru pencereden izlemek de bir Gökyüzü molası olur. | 15/97 |

Notlar: W1 ve W7'de "yürüyüş saati" kişinin sağlık verisinden telefonda türetilir; kilit ekranında adım sayısı değil
yalnız bir saat görünür (§5.3). W2'de ilk cümle "Bugün" ile başlamaz çünkü başlıkta var (tekrar süzgeci). W9'daki
"yazı tura" yalnız olasılık tam %50 iken seçilebilen hücrededir. W10 plan §E.7'deki bağlam satırıyla ("Yağmur varsa
yürüyüşünü içeride de yapabilirsin.") aynı çizgide; "Gökyüzü molası" yalnız modül açıksa seçilir.

**Yürüyüş algılama — başlık sabit "Yürüyüşe mi çıktın?" (19 karakter)**

| # | Girdi (telefonda) | Gövde | G |
|---|---|---|---|
| D1 | hissedilen 23, walk.good (sahibin örneği) | Hava 23 derece, ılık ve yürüyüş için güzel. Sana eşlik edelim mi? | 65 |
| D2 | 12, serin | Hava 12 derece, serin. Tempoyu ilk dakikalarda sen belirle. Sana eşlik edelim mi? | 81 |
| D3 | 28, sıcak | Hava 28 derece, sıcak. Gölgeli yolu seçebilirsin, suyun yanında olsun. Eşlik edelim mi? | 87 |
| D4 | 16, serin, rain 19.00 (≤ 2 sa) | Hava 16 derece, serin; 19.00'da yağmur bekleniyor. Kısa bir tur için tam zamanı. Eşlik edelim mi? | 97 |
| D5 | 20, ılık, sunset 19.12 (≤ 1 sa) | Hava 20 derece, ılık. Güneş 19.12'de batıyor; dönüş aydınlıkta kalsın. Eşlik edelim mi? | 87 |
| D6 | hava yok ya da bayat (walk.noWeather) | Sana eşlik edelim mi? Dokunursan sesli yürüyüş başlar, yürüyüşün kaydına düşer. | 79 |
| D7 | 8, soğuk | Hava 8 derece, soğuk. Eldivenin yanındaysa tam yürüyüş havası. Eşlik edelim mi? | 79 |
| D8 | 22, ılık, dün de yürüdü (sayı yok) | Hava 22 derece, ılık. Dünkü yürüyüşün gibi bir gün. Bugün de eşlik edelim mi? | 77 |
| D9 | 16, serin, rüzgâr ≥ 30 km/sa | Hava 16 derece, serin ve rüzgârlı. Dönüşü rüzgârı arkana alarak planla. Eşlik edelim mi? | 88 |
| D10 | 19, yağmur 17.00'de dindi (afterRain) | Yağmur 17.00'de dindi, hava 19 derece. Islak zeminde adımlarını kısa tut. Eşlik edelim mi? | 90 |

Not: D10'daki "adımlarını kısa tut" bir güvenlik ipucudur, sağlık iddiası değildir; yine de sahibin onay listesinde ayrıca
işaretlenmeli (VARSAYIM: kabul edilebilir). D8 kişinin dünkü yürüyüşünü sayı vermeden anar.

**Modül hatırlatmaları — kişinin seçtiği saatte**

| # | Girdi (telefonda) | Başlık | Gövde | B/G |
|---|---|---|---|---|
| M1 | breath, stage 4, 3 dk | Nefes · 4. basamak | Bugün nefes 3 dakika. Omuzlarını bırak, gerisini birlikte sayarız. | 18/66 |
| M2 | blink, 20 sn set | Kırpma zamanı | Başını ekrandan kaldır; 20 saniyelik kırpma seti hazır. Dokun, birlikte yapalım. | 13/80 |
| M3 | gapDays 5, breath stage aynı, 2 dk | Kaldığın yerden | 5 gün ara verdin; basamağın aynı. Bugün nefes 2 dakika, hazırsan başlayalım. | 15/76 |
| M4 | weekly due, tahmini 3 dk | Haftalık E testi günü | Bugün haftalık E testinin günü. Aydınlık bir yer seç; yaklaşık 3 dakika sürer. | 21/78 |
| M5 | snake, dün rekor 38 | Yılan seni bekliyor | Dün 38 puanla rekorunu yeniledin. Bugün yalnız keyfine bir tur? | 19/63 |
| M6 | who5 due (5 soru, ≈ 1 dk) | İyi oluş soruları | 5 soru, yaklaşık 1 dakika. Hazırsan bugün sorulara birlikte bakalım. | 17/68 |
| M7 | gokyuzu, hava önbelleği "açık" | Gökyüzü molası | Dışarıda gökyüzü açık. 2 dakika ufka bak; önce ve sonra nasıl hissettiğini yaz. | 14/79 |
| M8 | unlocked: routine "Daire", 1 dk | Bugün yeni: Daire | Göz egzersizlerine daire hareketi eklendi. İlk tur 1 dakika; dokun, gösterelim. | 17/79 |
| M9 | iris recheckDue (28. gün) | 28. gün | İris haritan bugün başlangıcınla yan yana geliyor. Bakmak 1 dakika sürer. | 7/73 |
| M10 | track, streakDays 3 | Çemberler | 3 gündür Çemberler'desin. Bugünkü tur da hazır; seçim senin. | 9/60 |

Not: onaylı plan metinlerinde sayılar kimi yerde yazıyla ("Beş gün ara verdin", §C.4). Bildirimde sayıyı rakamla yazmak
öneridir (VARSAYIM): denetimde rakam eşleşmesi kolaylaşır, kilit ekranında hızlı okunur. Sahibin kararı gerekir (§8).
M7'de hava bilgisi başka bir modülün bildirimine girer; hava telefonda kaldığı için gizlilik açısından sorun yoktur.
M4 ve M9 plan §F.4'teki kilometre taşlarıyla aynı olayı anlatır; aynı gün hem bildirim hem Ana sayfa satırı çıkarsa
cümle aynı olmalı (tek kaynak: aynı banka öğesi).

---

## 3. Metin kuralları

### 3.1 Uzunluk ve görünürlük

- Apple İnsan Arayüzü Kılavuzu bildirim başlığı ve gövdesi için karakter sayısı vermiyor (bu oturumda bakılan belgelerde
  yok; **VARSAYIM**). Yaygın gözlem: kilit ekranında başlık 1 satır (390 pt genişlikte varsayılan yazı boyutunda ≈ 30–35
  karakter), gövde kapalı banner ya da yığında 2 satır (≈ 80–90 karakter), açılınca 4 satıra kadar (VARSAYIM). Büyük
  Dinamik Yazı boyutunda satır başına karakter düşer.
- Kural: başlık ≤ 30, gövde ≤ 110; **olgu (saat, sıcaklık) ilk 60 karakterde**, Nef notu sonra. Kesilirse kaybolan Nef notu
  olur, olgu değil. Bilim satırı taşıyan bildirimde gövde iki satırdır ve ≤ 160 karakterdir (§10.1).
- WeatherKit atıfı ("Kaynak: Apple Weather") bildirime konacaksa (plan §E.6, App Review cevabına bağlı) gövdenin sonuna
  gelir ve sınıra sayılır; o zaman Nef notu ≤ 85 karakter (VARSAYIM).
- Başlık ile gövde aynı bilgiyi iki kez söylemez ("Bugün yağmur bekleniyor" başlığında gövde "Bugün" ile başlamaz).
- iOS'un `subtitle` alanı (UNNotificationContent) var; Capacitor Local Notifications'ın bunu geçirip geçirmediğine
  bakmadım. "Nef" imzasını başlığa eklemek yer yer; imza gerekmez, çünkü uygulama adı zaten üstte görünür.

### 3.2 Türkçe ses uyumu: saat ekleri

Ek, saatin **okunuşuna** göre gelir: son sözcüğün son ünlüsü (a, ı, o, u → a; e, i, ö, ü → e) ve son sesin sertliği
(ç, f, h, k, p, s, ş, t → t-). Dakika 00 ise saat okunur ("21.00" = yirmi bir), değilse dakika okunur ("19.12" = on iki,
"17.30" = otuz). Yönelmede ünlüyle biten sözcükte kaynaştırma y'si gelir ("12.00'ye"). Kesme işareti ve nokta TDK
yazımıdır ("21.00'de"). Aralık kısa tireyle ("21.00–22.00 arası"; plan metinleriyle aynı).

| Saat (okunuş) | Bulunma | Ayrılma | Yönelme |
|---|---|---|---|
| 00.00 (sıfır) | 00.00'da | 00.00'dan | 00.00'a |
| 01.00 bir · 11.00 on bir · 21.00 yirmi bir | 'de | 'den | 'e |
| 02.00 iki · 12.00 on iki · 22.00 yirmi iki | 'de | 'den | 'ye |
| 03.00 üç · 13.00 on üç · 23.00 yirmi üç | 'te | 'ten | 'e |
| 04.00 dört · 14.00 on dört | 'te | 'ten | 'e |
| 05.00 beş · 15.00 on beş | 'te | 'ten | 'e |
| 06.00 altı · 16.00 on altı | 'da | 'dan | 'ya |
| 07.00 yedi · 17.00 on yedi | 'de | 'den | 'ye |
| 08.00 sekiz · 18.00 on sekiz | 'de | 'den | 'e |
| 09.00 dokuz · 19.00 on dokuz | 'da | 'dan | 'a |
| 10.00 on | 'da | 'dan | 'a |
| 20.00 yirmi | 'de | 'den | 'ye |
| Dakika: 05 beş, 15 on beş, 25/35/45/55 … beş | 'te | 'ten | 'e |
| 10 on, 30 otuz | 'da | 'dan | 'a |
| 20 yirmi, 50 elli | 'de | 'den | 'ye |
| 40 kırk | 'ta | 'tan | 'a |
| 12 on iki (19.12) | 'de | 'den | 'ye |

Bu tablo kodda 60 dakikalık tam bir okunuş işlevine dönüşür (sayı → okunuş → ek); birim testi tablodaki her satırı ve
0–59 dakikayı dener. Sıcaklıkta ek gerekmez ("23 derece"); eksi değer "eksi 3 derece" yazılır ("-3 derece" değil; ekran
okuyucu için). Yüzde: "%70" (TDK), ek gerekirse "%70'lik".

### 3.3 Sıcaklık sözcükleri (hissedilen sıcaklığa göre; eşikler VARSAYIM)

| Hissedilen (°C) | Sözcük | İzinli nesne notu |
|---|---|---|
| ≤ 4 | soğuk | eldiven, atkı, kalın kat |
| 5–11 | soğuk | kalın kat |
| 12–17 | serin | ince kat |
| 18–24 | ılık | — |
| 25–29 | sıcak | gölge, su |
| ≥ 30 | çok sıcak | gölge, su; "serin saatleri seç" (korkutma yok) |

"Yürüyüş için güzel" ancak `walk.good` hücresinde: önümüzdeki 2 saatte yağmur yok, hissedilen 12–27, rüzgâr < 30 km/sa
(VARSAYIM). Sahibin örneğindeki "23 derece, ılık ve yürüyüş için güzel" bu tabloyla tutarlı. Eşikler sahada ayarlanır;
Türkiye'nin iklim farkı (Erzurum ile Antalya) için kişinin son 30 günlük ortalamasına göre kaydırma ilk sürümde yapılmaz.

### 3.4 "Zeki cümle" türleri

| Tür | Tanım | Örnek | Koşul |
|---|---|---|---|
| Nesne | yanına alınacak eşya | "Çıkarken şemsiyeyi çantana koymayı unutma." | hava hücresi o nesneye izin veriyor |
| Zaman | önce/sonra planı (eğer–o zaman) | "Yürüyüşü 21.00'den önce bitirirsen…" | ilgili saat verisi var |
| Bağ | kişinin kendi alışkanlığı ya da başka modül | "Her zamanki 18.00 yürüyüşün…", "Gökyüzü molası olur." | veri telefonda; modül açık |
| Çerçeve | engeli seçeneğe çevirme | "Yürüyüş bugün içeride de olur." | plan §E.4 (kötü hava engeldir) |
| Seçim | kararı kişiye bırakma | "Seçim senin.", "İstersen…" | her türde en az bir aday |
| Hafif mizah | dozlu | "Yazı tura gibi." | bankanın ≤ %20'si (VARSAYIM); aynı kişiye haftada ≤ 1 |

### 3.5 Yasak kalıplar (bildirim süzgeci; `FORBIDDEN` v2'nin üstüne)

| Sınıf | Kalıp örnekleri | Neden |
|---|---|---|
| Sağlık iddiası | iyileştir, tedavi, korur, önler, bağışıklık, D vitamini, göz sağlığı, stres atar, kanıtlanmış, bilimsel olarak | sağlık iddiası yok kuralı (`coachCore.js` `FORBIDDEN`, `YOL.nef.md` §7.1) |
| Korkutma | tehlike, kaza, hastalan, çarp(ar), donarsın, yanarsın | Tannenbaum 2015 alanı (korku mesajı yerine öz-yeterlik), ürün kuralı |
| Suçlama / ceza | yine, hâlâ, kaçırdın, seri bozuldu, tembel, geride kaldın | `YOL.nef.md` §5.6, İ4 |
| Zorlama | -malısın/-melisin, zorundasın, mutlaka, sakın, hemen | alan: özerklik destekleyen dil ve tepkisellik (dayanak ayrı ajanda) |
| Kesin hava dili | yağacak, yağıyor olacak, kesin | tahmin belirsizdir; plan §E.1 |
| Sağlık verisi | adım, kalori, nabız, kilo + sayı | kilit ekranı gizliliği (`notifyPlan.js:46-47` yorumu) |
| Görme sonucu | görme, logMAR, kötüleş, doktor | bildirimde asla; sabit satırlar yalnız uygulama içinde (`YOL.nef.md` §7.2) |
| Biçim | emoji, `!`, BÜYÜK HARF vurgu, "Nef diyor ki" | emoji: ekran okuyucu her birini okur, tonu dağıtır (VARSAYIM ürün kuralı); ünlem: mevcut metinlerde yok (`notifyPlan.js:49-89`) |

### 3.6 Her bildirim türünün PubMed dayanağı: hangi alan bağlanır

Dayanak listesi ayrı ajandadır; burada yalnız alan ve repoda zaten geçen anahtarlar yazılıdır. Banka öğesi `evidence`
alanında bir ya da iki `lib/sources.js` anahtarı taşır; künye dokununca açılan kartta görünür, gövdede ise günde en çok bir
bildirim tek satırlık bir bulgu taşır (§10).

| Bildirim | Bağlanacak alan | Repoda zaten geçen künye (bu oturumda yeniden doğrulanmadı) |
|---|---|---|
| Yağmur haberi | kötü hava fiziksel etkinliğin önünde engel; eğer–o zaman planı (uygulama niyeti) | Tucker ve Gilliland 2007, Klimek 2022 (plan §E.4); Silva 2018 (BILDIRIM_PLANI) |
| Yağmur haberindeki nesne notu | ileriye dönük bellek ve hatırlatıcı ipucu | — (ayrı ajan arar) |
| Yürüyüş algılama | tam zamanında uyarlanabilir müdahale (JITAI), bağlama uygun etkinlik önerisi, alıcılık | Klasnja 2019 (`sources.js` `klasnja2019`) |
| Yürüyüş algılamadaki hava cümlesi | hava ve yürüyüş | yukarıdaki hava alanı |
| "Eşlik edelim mi?" | sesli rehberlik ya da koçlukla yürüyüş | — (ayrı ajan arar; bulunamazsa "VARSAYIM" diye işaretlenir) |
| Modül hatırlatması | bildirim etkisi (açılma arttı, davranış sınırlı); öz-yeterlik dili; gerçek veriyle kişiselleştirme; + modülün kendi kanıtı | Bell 2023 (`bell2023`), Klasnja 2019, Tannenbaum 2015, Trinquart 2023; blink için Kim 2020 ve Wolffsohn 2025 (`YOL.nef.md` §14) |
| Bütün türler (dil) | özerklik destekleyen dil, seçim bırakma | — (ayrı ajan) |

Dürüst sınır: "Nef tonu" ile yazılmış bildirimin düz bildirimden daha etkili olduğunu gösteren bir kaynak bu belgede
yok. Bell 2023'te çok sayıda metin tek metinle aynı sonucu verdi. Nef dili bir ürün kararıdır; etkisi §7.3'teki saha
ölçümüyle görülür.

---

## 4. Maliyet

### 4.1 Fiyatlar (OpenRouter `/api/v1/models`, anahtarsız GET, 2026-09-30; USD / 1M token)

| Model | Giriş | Çıkış | Not |
|---|---|---|---|
| `google/gemini-3.1-flash-lite` (bugünkü varsayılan, `api/coach.js:10`) | 0,25 | 1,50 | önbellekten giriş 0,025; `:batch` sürümü 0,125 / 0,75; `response_format`, `temperature` destekli |
| `google/gemini-2.5-flash-lite` (JEV_GOZ_KOCU yedeği) | 0,10 | 0,40 | `:batch` 0,05 / 0,20 |
| `openai/gpt-5-nano` | 0,05 | 0,40 | desteklenen parametrelerde `temperature` yok; akıl yürütme modeli, gizli token çıkışa yazılır (miktarı bakmadım) |
| `mistralai/mistral-small-2603` | 0,15 | 0,60 | `temperature`, `response_format` destekli; yargıç adayı |
| `qwen/qwen3.7-flash` | 0,03 | 0,13 | 32.000 token üstü girişte fiyat artar; Türkçe kalitesine bakmadım |
| `anthropic/claude-haiku-4.5` (yargıç önerisi) | 1,00 | 5,00 | başka aile |

Türkçe kalite karşılaştırması bu belgede yapılmadı (ücretli çağrı yasak). Seçim §7'deki sınavla yapılır.

### 4.2 Varsayımlar

- **VARSAYIM:** Türkçede ≈ 3 karakter/token. Bugünkü `SYSTEM_PROMPT` 3.952 karakter (ölçüldü) → ≈ 1.100–1.300 token.
- Canlı yöntem (B), bildirim başına bir çağrı: giriş 1.300, çıkış 60 token; kişi başı günde 3 bildirim (hava 1, yürüyüş 1,
  modül 1); ayda 30 gün. İkinci biçim: günde bir çağrıda bütün günün metinleri (giriş 1.500, çıkış 250).
- Banka yöntemi (C): 3 tür × ≈ 40 hücre × 20 aday = 2.400 aday; 120 çağrı (her biri 20 aday: giriş 1.600, çıkış 1.400);
  yargıç 120 çağrı (giriş 2.500, çıkış 600).

### 4.3 Hesap (USD)

| Yöntem / model | Kişi başı ay | 1.000 kişi / ay | 10.000 kişi / ay |
|---|---|---|---|
| B1 · bildirim başına çağrı · gemini-3.1-flash-lite | 0,0374 | 37,35 | 373,50 |
| B1 · gemini-2.5-flash-lite | 0,0139 | 13,86 | 138,60 |
| B1 · mistral-small-2603 | 0,0208 | 20,79 | 207,90 |
| B1 · gpt-5-nano (gizli akıl yürütme hariç) | 0,0080 | 8,01 | 80,10 |
| B1 · qwen3.7-flash | 0,0042 | 4,21 | 42,12 |
| B2 · günde tek çağrı · gemini-3.1-flash-lite | 0,0225 | 22,50 | 225,00 |
| B2 · gemini-2.5-flash-lite | 0,0075 | 7,50 | 75,00 |
| B1 · gemini-3.1-flash-lite, istem önbellekte (çağrı ≈ 0,000168; önbelleğin tutacağı VARSAYIM) | ≈ 0,0151 | ≈ 15 | ≈ 151 |
| **C · banka (üretim gemini-3.1-flash-lite + yargıç haiku-4.5), sürüm başına tek sefer** | — | **≈ 0,96 toplam** | **≈ 0,96 toplam** |

Banka hesabı: üretim 120 × (1.600 × 0,25 + 1.400 × 1,50) / 10⁶ ≈ 0,30; yargıç 120 × (2.500 × 1,00 + 600 × 5,00) / 10⁶ ≈
0,66. Yılda 10 sürüm bile < 10 USD. Üretimde daha güçlü (daha pahalı) bir model kullanmak da bütçeyi değiştirmez; bu
yüzden banka yönteminde "ucuz model" kısıtı yalnız alışkanlıktır, kalite için daha iyi model seçilebilir.

Karşılaştırma: canlı yöntemin maliyeti küçük ama kişi sayısıyla doğrusal artar, rıza isteyen bir akış, sunucu yükü ve
hata dalları getirir; üstelik hava içeren kısmı hiç üretemez. Banka yönteminin maliyeti sabittir ve çalışma anında
sıfırdır.

---

## 5. Gizlilik ve rıza

### 5.1 Hangi yaklaşımda sunucuya ne gider

| Yaklaşım | Çalışma anında sunucuya giden | Modelin gördüğü | Yapım anında giden |
|---|---|---|---|
| A · el yazımı şablon | hiçbir şey | — | — |
| B · canlı model | kişinin sinyalleri (düzen, basamak, modül özetleri; `coach` paketine benzer); hava, konum, sağlık **gidemez** | aynı | — |
| C · banka (öneri) | hiçbir şey | — | yalnız soyut etiketler ve istem (geliştirici makinesinden; kişisel veri yok) |

Banka uygulamayla birlikte gelir. İleride sunucudan indirilen bir banka dosyası düşünülürse bu istek de kişisel veri
taşımaz (yalnız IP; statik dosya); yine de ilk sürümde gömülü kalması önerilir, çünkü her banka sürümü metin kapısından
(plan §H) geçmeli.

### 5.2 Mevcut `coach` rızası bu amacı kapsar mı

`lib/consent.js` `CONSENTS.coach` (sürüm 1):

- Neden: "Nef'in sana günlük tek bir içgörü ve öneri yazması (tıbbi tavsiye değildir)".
- Ne: son 7 günün özetleri (düzen, görme ortancası ve farkı, okuma hızı, oyun puanları, günün saati).
- Nerede: yurt dışı, Vercel ve OpenRouter.

Bildirim metni üretmek **başka bir amaçtır** (günlük tek içgörü değil; gün içinde birden çok, kilit ekranına düşen
metin). `YOL.nef.md` §7.4'teki v2 taslağı da ("günlük bir öneri, haftalık ve aylık bir değerlendirme") bildirimleri
anmıyor. KVKK'da açık rıza belirli bir konuya ilişkin olmalıdır (her amaç için ayrı); repodaki düzen de bunu uyguluyor
("Her amaç ayrı izin", `consent.js:2`). Bu yüzden:

- **C (öneri):** yeni rıza **gerekmez**. Nef dili telefonda, veri telefondan çıkmadan kurulur; `YOL.nef.md` §8.3'teki
  "rızasız kural tabanlı Nef" önerisinin aynısıdır.
- **B seçilirse:** ayrı anahtar `coachNotify` (ya da `coach` sürümünde ayrı bir kutu), kendi dört satırıyla: Ne (düzen ve
  basamak özetleri; hava, konum, sağlık verisi gitmez), Neden (bildirimlerindeki cümlelerin sana göre yazılması), Nerede
  (Vercel ve OpenRouter, yurt dışı), Ne kadar (sunucu içeriği kaydetmez; kapatınca gönderim durur). Hukukçu onayı
  gerekir (repo notu: "Bu metinler hukukçu onayından geçmedi", `consent.js:6`).

### 5.3 Öteki rızalarla sınırlar

| Veri | Rıza | Bildirimde kullanım | Not |
|---|---|---|---|
| Hava, yaklaşık konum, il adı | `weather` v1 (plan §E.2) | yağmur haberi, yürüyüş algılamadaki hava cümlesi, M7 | "Neden" satırı "istenirse yağmur bildirimi" diyor; hava cümlesinin yürüyüş algılama bildiriminde kullanılması bu satıra eklenmeli (VARSAYIM; hukukçu) |
| Adım, yürüyüş saati alışkanlığı | `health` v2 | W1, W7, W8 (saat), D8 (dün yürüdü) | v2 "Neden": "yürüyüş hatırlatması … bu telefonda" — yürüyüş algılama ve eşlik teklifi yeni bir amaçsa `health` v3 gerekir (ayrı ajanın konusu; hukukçu) |
| Hareket algılama (hangi sensör olursa) | iOS izni + gerekirse ayrı rıza | D1–D10 | ayrı ajan |
| Kilit ekranı | — | sağlık sayısı ve görme sonucu asla; saat ve sıcaklık serbest | kişi iOS'ta "Önizlemeleri göster"i kapatabilir |

---

## 6. Çevrimdışı yedek, denetim ve ses

### 6.1 Yedek sırası (çalışma anında; hepsi telefonda)

1. En özel hücre (örn. `rain.evening × walkHabit.before × planned.morning`).
2. Daha genel hücre (`rain.evening`).
3. Türün genel hücresi (`rain.any`: yalnız olgu cümlesi, Nef notu yok ya da nesne notu).
4. Bugünkü sabit metinler (`notifyPlan.js` `TEXTS`) ve plan §E.6'daki düz yağmur metni.

Model çalışma anında hiç çağrılmadığı için "model cevap vermezse" dalı yoktur. B seçilirse: zaman aşımı, 4xx/5xx, süzgeç
reddi ya da `coachNotify` rızası yoksa aynı sıra kullanılır; plan kurulurken cevap yoksa bildirim bekletilmez.

Çalışma anı bekçisi (ucuz, her doldurmada): açık kalmış `{` yok; başlık ≤ 30, gövde ≤ 110; doldurulmuş metindeki her
rakam dizisi veri nesnesinde var; `dayWord` bildirimin çalacağı güne göre doğru. Biri tutmazsa bir üst yedeğe düşülür ve
telefondaki hata sayacı artar (sunucuya gitmez).

### 6.2 Yapım anı denetimi (derlemede, test olarak)

- `nefBank.test.js`: her öğe şemaya uyar; yer tutucusuz metinde rakam ve sayı sözcüğü yok; yasak kalıp yok; yer tutucular
  hücrenin izin listesinde; hava sözcükleri hücrenin sözlüğünde; en uzun doldurmayla sınırlar tutuyor; `evidence` anahtarı
  `sources.js`'te var; aynı hücrede iki öğe birebir aynı değil.
- `FORBIDDEN` listesi tek yerde tutulur (`coachCore.js`) ve hem koç kartı hem banka için kullanılır (tek kaynak ilkesi).

### 6.3 Ses: "ekrandaki cümle = sesteki cümle"

- Bildirim sesli değildir. Ama "Eşlik edelim mi?"ye dokununca açılan yürüyüş koçu sesli konuşur ve sesleri ElevenLabs
  ile önceden üretilmiş dosyalardır (`lib/voicePack.js:1-3`: uygulama ağa çıkmaz). Dinamik ya da yer tutuculu bir cümle
  seslendirilemez.
- Tasarım: bankada `voice: true` işaretli ayrı bir alt küme (`walkVoice`) olur. Bu öğeler **rakamsız ve yer tutucusuzdur**
  ("Hava ılık, yürüyüş için güzel." / "Yağmur yaklaşıyor; kısa bir tur iyi olur."). Seslendirme betiği yalnız bu öğeleri
  üretir; ekranda aynı metin altyazı olarak yazar. Sayı (23 derece) cümlenin içinde değil, yanında ayrı bir etiket olarak
  görünür; böylece ekranda yazan **cümle** ile söylenen cümle birebir aynı kalır.
- Bildirim ile ilk ses cümlesi aynı hücreden seçilir (`walk.good` → sesli `walk.good` öğesi). Bildirim "Hava 23 derece,
  ılık…" der, ses "Hava ılık, yürüyüş için güzel." der; ikisi çelişmez, çünkü ikisi de aynı `tempWord`'den gelir.
- Sayıyı seslendirmek istenirse tek güvenli yol kapalı kümedir: "eksi on"dan "kırk beş"e 56 sıcaklık parçası ayrı
  üretilir ve birleştirilir. Tonlama kopukluğu riski vardır (VARSAYIM); ilk sürümde önerilmez.
- Test: her `voice: true` öğenin metni `public/voice/index.json`'daki metinle birebir aynı; bu öğelerde rakam ve `{` yok.

---

## 7. Değerlendirme

### 7.1 Otomatik sınav: 50 senaryo (vitest; her derlemede)

Sabit veriyle (sabit "şimdi", sabit WeatherKit örnekleri) kural motoru + banka + doldurma uçtan uca çalıştırılır.

| Grup | Sayı | Senaryolar |
|---|---|---|
| Yağmur | 15 | her saat bölümü; 00.00 ve 23.00 sınırları; gece yarısını aşan yağmur (23.00–01.00); tam %50; akşam kurulup sabah çalan ("Dün akşamki tahmine göre", `dayWord` = bugün); 18 saatten eski tahmin → bildirim yok (plan §E.6); yağmur yok → bildirim yok; kısa/uzun/gün boyu; yürüyüş saati önce/denk/sonra/yok |
| Yürüyüş algılama | 15 | sıcaklık sınırları 4/5, 11/12, 17/18, 24/25, 29/30; eksi derece; 2 saatte yağmur; güneş batıyor; rüzgâr; yağmur dindi; hava yok; hava bayat; iOS 15 (hava yok) |
| Modül | 15 | her canlı modül; basamak; 5 gün ara; 14+ gün ara (yumuşak); yeni açılan; rekor; haftalık test günü; iyi oluş günü; 28. gün; görmede kırmızı uyarı varken (bildirimde görme sözü yok) |
| Kenar | 5 | en uzun modül adı + en uzun değerler (uzunluk); eksik yer tutucu değeri → yedeğe düşme; bankadan öğe silinmiş; bildirim ana anahtarı kapalı; aynı gün aynı öğe ikinci kez seçilmiyor |

Her senaryoda denetlenen:

| # | Denetim | Nasıl |
|---|---|---|
| S1 | sayı eşleşmesi | metindeki her `\d+([.,]\d+)?` dizisi veri nesnesindeki bir değerin biçimlenmiş hâline eşit |
| S2 | saat biçimi ve eki | `\b([01]\d|2[0-3])\.[0-5]\d('(de|da|te|ta|den|dan|ten|tan|e|a|ye|ya))?` ve ek §3.2 tablosuyla aynı |
| S3 | uzunluk | başlık ≤ 30, gövde ≤ 110 |
| S4 | yasak kalıp | §3.5 listesi + `FORBIDDEN` |
| S5 | hava sözlüğü tutarlılığı | yağmur yoksa "yağmur/şemsiye" yok; `walk.good` değilse "güzel" yok; `noWeather`'da sıcaklık yok |
| S6 | gün doğruluğu | `dayWord` bildirimin çalacağı güne göre |
| S7 | tekrar | aynı tür için 14 gün içinde aynı öğe yok (VARSAYIM süre); başlık ile gövde başı aynı değil |
| S8 | ses = ekran | `voice: true` öğeler index.json ile birebir; rakam ve yer tutucu yok |
| S9 | kilit ekranı gizliliği | adım, kalori, nabız, görme sözcükleri yok |
| S10 | kanıt bağı | her öğenin `evidence` anahtarı `sources.js`'te var |

Geçme koşulu: 50/50 senaryo, S1–S10 hatasız. Bu, JEV_GOZ_KOCU'daki "uydurma %0" kapısının bildirim karşılığıdır.

### 7.2 İnsan değerlendirmesi (banka sürümü başına)

- Okurlar: sahip + iki ana dili Türkçe okur (biri 50 yaş üstü; hedef kitlede yaşlı kullanıcı var, BILDIRIM_PLANI "65 yaş
  üstü ayrı raporlanır"). Plan §H'deki "iki bağımsız model incelemesi (TDK yazımı, anlatım bozukluğu)" bunun önünde durur.
- Yöntem: her okura 60 doldurulmuş bildirim, veri nesnesiyle yan yana, karışık sırada; yarısı Nef bankasından, yarısı bugünkü
  düz metinlerden (kör). Beş ölçüt 1–5: doğallık, incelik ("işime yarar bir şey söyledi mi"), ton (baskısız, sıcak),
  doğruluk (veriyle çelişiyor mu), bıkkınlık ("her gün görsem sıkar mı"). Ayrıca evet/hayır: "yanıltıcı mı?"
- Kabul (VARSAYIM eşikler): "yanıltıcı" 0; doğruluk her öğede 5; doğallık ve ton ortancası ≥ 4; incelikte Nef bankası düz
  metinden yüksek (ortanca farkı ≥ 1). Düşük puanlı öğe bankadan çıkar.

### 7.3 Saha ölçümü (yayından sonra, telefonda)

- Mevcut deney düzeni (`notifyPlan.js` zarı, `notifyLog.js`) gönder/sessiz karşılaştırması yapıyor. Nef metni ile düz metni
  karşılaştırmak ikinci bir kol ister; iki kolu birden açmak örneklemi böler (VARSAYIM: 1.000 kişinin altında anlamlı sonuç
  beklenmez). Öneri: önce yalnız Nef metnine geçip bildirimden sonraki 30 dakikada tamamlanan eylemi (Klasnja 2019 ölçüsü,
  BILDIRIM_PLANI:205) önceki dönemle karşılaştırmak; açılma tek başına başarı sayılmaz (Bell 2023).
- Bıkkınlık belirtisi: art arda 3 yok sayma kuralı aynen (BILDIRIM_PLANI:182).

---

## 8. Sahibin kararı gereken sorular

1. Mimari C (kural motoru + model üretimli, denetlenmiş, gömülü banka) — onay? Canlı model bildirimlerde kullanılmaz.
2. Bildirimde sayılar rakamla mı ("5 gün ara verdin") yazıyla mı ("Beş gün")? Önerim: rakam.
3. Sıcaklık sözcüğü gerçek sıcaklığa mı, hissedilen sıcaklığa mı göre? Önerim: hissedilen; eşikler §3.3.
4. Hafif mizah bankada kalsın mı (≤ %20, haftada ≤ 1)?
5. Yürüyüş algılama bildiriminde hava cümlesi `weather` rızasının "Neden" satırına eklensin mi (hukukçu)?
6. Banka üretiminde daha güçlü bir model kullanılsın mı (maliyet farkı birkaç dolar)? Önerim: evet; yargıç başka aileden.
7. Sesli yürüyüş koçunda sayı hiç söylenmesin (ekranda ayrı etiket) — onay?

## 9. VARSAYIM listesi

Token/karakter oranı; kilit ekranı satır sayıları; sıcaklık, rüzgâr, saat bölümü, yağmur süresi eşikleri; `walk.good`
tanımı; hava önbelleğinin yürüyüş metni için geçerlilik süresi (6 sa); hücre ve banka boyutu; mizah oranı; 14 günlük
tekrar yasağı; insan değerlendirmesi eşikleri; yargıcın başka aileden seçilmesinin gerekçesi; sayı sesi birleştirmede
tonlama riski; atıflı bildirimde Nef notunun 85 karakter sınırı; D10'daki güvenlik ipucunun kabul edilebilirliği.
Bakılmayanlar: Capacitor Local Notifications'ın `subtitle` desteği; WeatherKit'in Türkiye için güneş batışı alanı;
gpt-5-nano'nun gizli akıl yürütme token miktarı; modellerin Türkçe kalitesi (ücretli çağrı yapılmadı); OpenRouter
`:batch` sürümlerinin nasıl çalıştığı.

---

## 10. Bildirim + bilim satırı (sahibin ek isteği, 2026-09-30)

İstek: "Hatırlatma mesajında ne yazacağı önemli, çok zeki bir AI gibi olmalı (Nef). Göz egzersizi yapacak, altında PubMed
bilimsel bir yazı yazabiliriz, ikna edelim, teşvik edelim, makale linki vs. Yürüyüş yapacak, nefes egzersizi örneğin
dolunayda."

### 10.1 İki katman

| Katman | Ne | Nereden | Sınır |
|---|---|---|---|
| Başlık | olay ya da modül ("Kırpma zamanı", "Bu gece dolunay") | banka | ≤ 30 |
| 1. satır · Nef cümlesi | bağlamlı: gün, saat, hava, ay evresi, kişinin kendi kaydı (basamak, dünkü tur, her zamanki saat) | kural motoru + banka + yer tutucu (§1–§2) | ≤ 70 |
| 2. satır · bilim satırı | tek bulgu, bulgu diliyle, mümkünse tasarım ya da kişi sayısıyla: "Bir denemede …; 44 kişi, 6 hafta." | `lib/sources.js` / `lib/evidence.js` kaydından, önceden yazılmış ve onaylanmış cümle | ≤ 100 |
| Dokununca açılan kart | makale adı (Türkçe ve özgün), yazarlar, yıl, dergi, tasarım, kişi sayısı, **sınır cümlesi**, PMID, DOI bağlantısı | `sources.js` alanları (`titleTr`, `authors`, `design`, `n`, `pmid`, `doi`; `doiUrl`) | sınırsız; sınır cümlesi zorunlu (plan §H) |

Gövde iki satırdır (Nef cümlesi + satır sonu + bilim satırı), toplam ≤ 160 karakter (VARSAYIM). Kapalı görünümde yalnız
ilk satır okunur; bu yüzden bildirimin işe yarar kısmı (ne, ne zaman) Nef cümlesindedir, bilim satırı açılınca görünen
destektir. Zamanı dar bildirimler (yağmur, yürüyüş algılama) bilim satırını her zaman taşımaz (§10.6).

Bilim satırı da model tarafından değil elle (ya da yapım anında üretilip onaylanarak) yazılır ve **kaynağa bağlı sabit
metindir**: içindeki her sayı (44 kişi, 6 hafta, %24) kaynağın kaydındaki değerle birebir aynı olmalıdır (sınav S11,
§10.7). Yer tutucu almaz; kişiye göre değişmez.

### 10.2 Bağlantı ve kilit ekranı

- Bildirim gövdesindeki bağlantı tıklanamaz; iOS bildirimi düz metindir (VARSAYIM: zengin bağlantı yalnız bildirim içerik
  uzantısıyla mümkün; bu uygulamada yok, bakmadım). Bu yüzden bildirimde URL yazılmaz (yer yer, okunmaz).
- Dokununca uygulama açılır ve ilgili kanıt kartına gider (derin bağlantı: bildirim `extra` alanında `evidence: 'klasnja2019'`).
  Kartta "Makaleyi aç" düğmesi `https://doi.org/<doi>` açar; yanında "PubMed" düğmesi
  `https://pubmed.ncbi.nlm.nih.gov/<pmid>/`.
- İsteğe bağlı: bildirim eylem düğmesi "Kaynağı gör" (iOS bildirim eylemleri; Capacitor Local Notifications'ta eylem türü
  kaydının bu uygulamada kullanılıp kullanılmadığına bakmadım).
- Kilit ekranında görünen karakter: Apple belgesinde sayı yok (VARSAYIM): başlık 1 satır ≈ 30–35 karakter; gövde kapalı
  görünümde 2 satır ≈ 80–90 karakter; uzun basınca ya da bildirim merkezinde açılınca 4 satıra kadar ≈ 150–180 karakter.
  Büyük yazı boyutunda daha az. Sonuç: Nef cümlesi tek başına anlamlı olmalı; bilim satırı kesilebilir.

### 10.3 Sağlık iddiası yasağı: bilim satırının dili

| Yapılır | Yapılmaz |
|---|---|
| "Bir denemede …", "Bir çalışmada …", "… birleştiren bir analizde …" | "Bilim kanıtladı", "kanıtlanmış", "bilimsel olarak" |
| fiil bulgunun kendisi: "arttı", "azaldı", "ilişkiliydi", "etkisi küçüktü", "sürmedi" | "iyileştirir", "korur", "önler", "tedavi eder", "gözlerini güçlendirir" |
| tasarım ve kişi sayısı: "44 kişi, 6 hafta", "12 denemelik analiz", "kontrolsüz" | tek çalışmayı genel gerçek gibi sunmak ("Yürüyüş stresi azaltır.") |
| sınır: "etki haftalar içinde azaldı", "yanlılık riski orta", "1 hafta sonra sürmedi" | yalnız lehte bulguyu seçip sınırı saklamak |
| kişiye söz: yok (bulgu başkalarındadır) | "Senin de gözlerin rahatlayacak" (bulguyu kişiye vaat etmek) |

İkna ve teşvik dürüst bulgudan gelir: özellikle **davranışın kendisine** dair bulgular ("bırakınca 2 haftada kayboldu",
"az su içmenin başlıca nedeni unutmaktı", "öneri sonraki 30 dakikada adımı artırdı") hem ikna edicidir hem sağlık sonucu vaat etmez.
Ölüm, hastalık riski ve kan şekeri gibi sağlık sonucu bildiren bulgular (`paluch2022`, `paluch2022cvd`, `dunstan2012`)
bildirimde kullanılmaz (korkutma ve iddia sınırı); uygulama içindeki kartta sınır cümlesiyle kalabilir.
`yamashita2021`'in Türkçe başlığındaki "iyileştiren" sözcüğü `FORBIDDEN`'a takılır; bilim satırı bu yüzden "ilişkiliydi"
diye yazıldı (aşağıda H3).

### 10.4 Ay ve dolunay: iddia kurmadan nefes hatırlatması

Onaylı plan §E.5: ayın uykuya etkisi tartışmalı (Cajochen 2013 ve Casiraghi 2021 lehte; Haba-Rubio 2015 ve Smith 2017 etki
bulmadı; Chaput 2016 ≈ 5 dk). Kural: dolunay yalnız **takvim anı ve bir davet** olarak kullanılır; ay → uyku → nefes
zinciri kurulmaz.

| Durum | Metin |
|---|---|
| Yapılmaz | "Dolunayda uykun bozulabilir; nefes egzersiziyle rahat uyu." (ay-uyku iddiası + nefes-uyku iddiası) |
| Yapılmaz | "Ay enerjini etkiliyor, nefesle dengele." (dayanaksız) |
| Yapılır (A) | Başlık "Bu gece dolunay" · "Aya bakarak 3 dakika yavaş nefes: bu akşamın küçük töreni." · bilim satırı nefesin kendi bulgusu (Laborde 2022) |
| Yapılır (B) | Başlık "Bu gece dolunay" · "Dolunay gecesi için 3 dakikalık nefes hazır; ışığı kısıp başla." · bilim satırı ayın tartışmalı olduğu (plan §E.5 kartının kısaltması): "Ayın uykuya etkisi tartışmalı: bazı çalışmalar küçük fark buldu, büyük çalışmalar bulmadı." |

"Dolunay" sözcüğü yalnız `lib/moon.js` o takvim gününü dolunay diye verdiğinde yazılır (plan §E.3: "yeniay" ve "dolunay"
yalnız o takvim gününde). Ay hesabı ağ ve konum istemez; bu bildirim herkes için kurulabilir. Saat: akşam, kişinin sessiz
saatlerinden önce (BILDIRIM_PLANI: yatmadan önceki 60 dakikada bildirim yok).

### 10.5 Örnekler: her tür için 3 (Nef cümlesi + bilim satırı)

Yalnız depoda PMID'i olan kaynaklar kullanıldı (`app/src/lib/sources.js`, `app/src/lib/evidence.js`,
`app/src/lib/yogaLessons.js`, `docs/yol-haritasi/BILDIRIM_PLANI.md`, onaylı plan Kaynaklar). Bulgu cümlesindeki her ayrıntı
bu dosyalarda yazılı olandır; yazılı olmayan "kaynak bekliyor" diye işaretlidir. Uzunluklar Python `len` ile sayıldı
(B = başlık, N = Nef cümlesi, S = bilim satırı).

**Göz egzersizi (kırpma)**

| # | Başlık | Nef cümlesi | Bilim satırı | Kaynak | B/N/S |
|---|---|---|---|---|---|
| G1 | Kırpma zamanı | Ekrandan başını kaldır; 20 saniyelik kırpma seti hazır. | 41 kişilik kontrolsüz bir çalışmada eksik kırpma oranı 4 haftada %54'ten %34'e indi. | Kim 2020, PMID 32409236; 54 başladı, 41 bitirdi, 4 hafta, kontrolsüz. "Bırakma nedeni unutmak" özette yok, kullanılmaz (`pubmed-bilim-satirlari.md`) | 13/55/84 |
| G2 | Kırpma · 2. tur | Sabahki turu yaptın; öğleden sonrası da hazır. | 98 kişilik bir denemede en uygun düzen günde 3 kez 15 tekrar çıktı. | Wolffsohn 2025, PMID 40467388; RKÇ, 98 kişi | 15/46/67 |
| G3 | Göz egzersizi | Bugünkü set 1 dakika. Kaldığın yerden sürdürebilirsin. | 28 kişilik bir denemede egzersiz bırakılınca ölçümler 2 haftada çoğunlukla başa döndü. | Wolffsohn 2025, PMID 40467388; 28 kişi | 13/54/86 |

**Yürüyüş**

| # | Başlık | Nef cümlesi | Bilim satırı | Kaynak | B/N/S |
|---|---|---|---|---|---|
| Y1 | Kısa bir yürüyüş | Hava 21 derece, ılık. İstersen şimdi 5 dakikalık bir tur. | Bir denemede yürüyüş önerisi sonraki 30 dakikada adımı artırdı; 44 kişi, 6 hafta. | Klasnja 2019, PMID 30192907; MRT; %24 artış, etki haftalar içinde azaldı (BILDIRIM_PLANI:153) | 16/57/81 |
| Y2 | Bugünkü yürüyüş | Yürürken bir kez başını kaldırıp gökyüzüne bak. | 60 yaşlıyla 8 haftalık bir denemede hayranlık yürüyüşü yapanlar daha çok olumlu duygu bildirdi. | Sturm 2020, PMID 32955293; RKÇ, 60 yaşlı yetişkin, 8 hafta | 15/47/95 |
| Y3 | Yağmur 15.00'te | Yürüyüşünü 15.00'ten önceye alabilirsin. | 37 çalışmalık bir derlemede kötü ya da aşırı hava, hareketin önünde bir engel olarak görüldü. | Tucker ve Gilliland 2007, PMID 17920646; sistematik derleme, 37 çalışma | 15/40/93 |

**Nefes (dolunay dahil)**

| # | Başlık | Nef cümlesi | Bilim satırı | Kaynak | B/N/S |
|---|---|---|---|---|---|
| N1 | Nefes · 4. basamak | Bugün 3 dakika. Omuzlarını bırak, gerisini birlikte sayarız. | 12 denemede (785 kişi) nefes çalışması, algılanan streste küçük–orta azalmayla ilişkiliydi. | Fincham 2023, PMID 36624160; 12 RKÇ, 785 kişi, g = −0,35, yanlılık riski orta; kapsam genel nefes çalışması, yalnız yavaş nefes değil | 18/60/91 |
| N2 | Bu gece dolunay | Aya bakarak 3 dakika yavaş nefes: bu akşamın küçük töreni. | 223 çalışmalık bir incelemede kalp atışı değişkenliği yavaş nefes sırasında arttı. | Laborde 2022, PMID 35623448 (`yogaLessons.js:43` onaylı cümlenin kısaltması) | 15/58/82 |
| N3 | Bu gece dolunay | Dolunay gecesi için 3 dakikalık nefes hazır; ışığı kısıp başla. | Ayın uykuya etkisi tartışmalı: 5812 çocukta ~5 dk fark bulundu, 2125 yetişkinde bulunmadı. | Cajochen 2013 (23891110), Haba-Rubio 2015 (26498230), Chaput 2016 (27047907), Smith 2017 (27928860), Casiraghi 2021 (33571126); plan §E.5 | 15/63/90 |

**Yoga**

| # | Başlık | Nef cümlesi | Bilim satırı | Kaynak | B/N/S |
|---|---|---|---|---|---|
| O1 | Yoga dersi hazır | Bugünkü ders hazır; mat şart değil, bir sandalye de olur. | 223 çalışmalık bir incelemede kalp atışı değişkenliği yavaş nefes sırasında arttı. | Laborde 2022, PMID 35623448 (nefes temelli ders için; derste sandalye seçeneği olup olmadığına bakmadım) | 16/57/82 |
| O2 | Kısa yoga nidra | 11 dakikalık sürüm de hazır; bugün kısası da olur. | 362 kişilik 2 aylık bir denemede 11 dakikalık yoga nidranın bekleme grubuna göre etkisi küçüktü. | Moszeik 2025, PMID 40373021; 4 kollu RKÇ, 362 kişi, d = 0,08–0,16. "Alanın kalitesi düşük" cümlesi bu özette yok; kaynağı bulunmadan kartta kullanılmaz | 15/50/96 |
| O3 | Yoga | 3 dakikalık kısa sürüm de bir ders sayılır. | 362 kişilik denemede 11 dakikalık kısa yoga nidra da bekleme grubundan ayrıştı; etki küçüktü. | Moszeik 2025, PMID 40373021. Radin 2025 yoga değil meditasyon RKÇ'si (1458 çalışan); yoga bildiriminde kullanılmaz, `yogaLessons.js:27, :56` atfı ana oturumda gözden geçirilir | 4/43/93 |

**Mola**

| # | Başlık | Nef cümlesi | Bilim satırı | Kaynak | B/N/S |
|---|---|---|---|---|---|
| L1 | Mola zamanı | Bir dakika kalk, pencereden uzağa bak. | 29 kişilik bir çalışmada 20-20-20 hatırlatmasıyla gelen azalma, bırakıldıktan 1 hafta sonra sürmedi. | Talens-Estarelles 2022, PMID 35963776; öncesi–sonrası, 29 ekran kullanıcısı (`sources.js`) | 11/38/100 |
| L2 | Kalk, biraz gerin | Bir saat oldu; bir dakikalık ara yeter. | 56 ofis çalışanıyla 12 haftalık çalışmada saatlik telefon hatırlatmasıyla iş başında oturma azaldı. | Morris 2020, PMID 33322678; yarı-randomize; yalnız saatlik hatırlatma kolu anlamlı | 17/39/99 |
| L3 | Kısa ara | Omuzlarını bırak, uzağa bak; sonra devam edersin. | 51 veri girişçisiyle bir saha çalışmasında ek kısa molalarla rahatsızlık ve göz yorgunluğu azaldı. | Galinsky 2007, PMID 17514726 | 8/49/98 |

**Su**

| # | Başlık | Nef cümlesi | Bilim satırı | Kaynak | B/N/S |
|---|---|---|---|---|---|
| U1 | Birkaç yudum | Suyun yanında mı? Birkaç yudum yeter. | 85 kişilik bir denemede az su içmenin başlıca nedeni unutmaktı (%60). | Stout 2022, PMID 35283036; RKÇ, 85 kişi, böbrek taşı hastaları; ölçüt idrar hacmi | 12/37/69 |
| U2 | Günün son suyu | Bugünkü son su hatırlatması bu. | 1658 kişilik bir denemede su programındakiler 6. ve 12. ayda gece daha sık tuvalete kalktı. | Desai 2026, PMID 41864748; 1658 kişi. "18.00'den sonra sormuyoruz" bulgu değil kuraldır, bilim kartında durur | 14/31/91 |
| U3 | Su | İstersen şimdi birkaç yudum iç. | **kaynak bekliyor** (su ile göz konforu ya da odak arasında depoda PMID'li kaynak yok) | — | 2/31/— |

**Hava**

| # | Başlık | Nef cümlesi | Bilim satırı | Kaynak | B/N/S |
|---|---|---|---|---|---|
| H1 | Yağmur 21.00'de | 21.00–22.00 arası yağmur bekleniyor; yürüyüşü öncesine alabilirsin. | 65 yaş üstü kişilerle bir izlem çalışmasında yağış arttıkça günlük yürüme süresi azaldı. | Klimek 2022, PMID 35151273; izlem çalışması, ≥ 65 yaş; kişi sayısı özette yok, **kaynak bekliyor** (tam metin) | 15/67/88 |
| H2 | Bugün yağmur bekleniyor | 14.00–17.00 arası yağmur var; çantana şemsiye koy. | 1233 kişilik günlük çalışmasında havanın ruh hâline ortalama etkisi küçüktü; kişiden kişiye değişti. | Denissen 2008, PMID 18837616; 1233 kişi | 23/50/100 |
| H3 | Gökyüzü açık | Bugün gökyüzü açık; 2 dakika ufka bakmak için güzel bir gün. | 30 genç yetişkinle bir çalışmada doğa görüntülerine bakmak olumlu ruh hâliyle ilişkiliydi. | Yamashita 2021, PMID 34065588; çapraz, 30 genç yetişkin (`sources.js`); sınır: görüntü, gerçek gökyüzü değil (kartta) | 12/60/90 |

Notlar: (1) H2'deki "var" plan §E.6'daki akşam kurulmuş metin kalıbından; sabah kurulmuşsa "bekleniyor" yazılır.
(2) `YOL.nef.md` §14 Kim 2020 ve Wolffsohn 2025 için "`lib/sources.js`'te zaten var" diyor; bugünkü `sources.js`'te bu
anahtarlar **yok** (yalnız `evidence.js`'te metin olarak geçiyorlar). Bilim satırının dokununca açılacak kartı için
`sources.js`'e şu kayıtlar eklenmeli: `kim2020`, `wolffsohn2025`, `fincham2023`, `laborde2022`, `balban2023`,
`tucker2007`, `klimek2022`, `denissen2008`, `stout2022`, `desai2026`, `moszeik2025`, `radin2025`, ay kaynakları
(`cajochen2013`, `habarubio2015`, `chaput2016`, `smith2017`, `casiraghi2021`). Kayıt eklenmeden o bilim satırı yayına
girmez (plan §H kanıt kapısı: kart yayından önce PubMed'de yeniden açılır). (3) Balban 2023 (PMID 36630953) depoda
yalnız yöntemiyle (günde 5 dk, 28 gün, uzaktan RKÇ) geçiyor; bulgu cümlesi **kaynak bekliyor**, bu yüzden örneklerde
kullanılmadı.

### 10.6 Döndürme kuralı (aynı bilim satırı her gün tekrarlanmasın)

1. Her modülün ve bildirim türünün bir **bilim havuzu** vardır (yukarıdaki satırlar; en az 1, hedef ≥ 3).
2. **Günde en çok bir** bildirim bilim satırı taşır (VARSAYIM). Öncelik: o gün kişinin seçtiği modül hatırlatması >
   yürüyüş > mola > su > hava. Öteki bildirimler yalnız Nef cümlesiyle gider; `evidence` anahtarı yine taşınır (dokununca
   kart açılır).
3. Aynı bilim satırı aynı kişiye **7 gün** içinde ikinci kez gösterilmez; havuz 1 satırlıksa o modülde en çok 7 günde
   bir bilim satırı çıkar (VARSAYIM süreler).
4. Havuz içinde sıra: ilk gösterimde tasarımı en güçlü kaynak (`DESIGN_RANK`, `sources.js:25`: meta 4 > rct/mrt 3 > …),
   sonra `dice(seed, tarih, tür)` ile döner (`notifyPlan.js` `textFor` kalıbı); art arda aynı satır yok.
5. İlk 14 gün (VARSAYIM) her modülün ilk bildirimi o modülün en güçlü bilim satırını taşır ("neden bu pratik" sorusu
   ilk günlerde sorulur); sonra kural 2–4.
6. Bildirimden sonra kişi kartı açtıysa (`evidence` dokunuşu telefonda sayılır) o satır 30 gün dinlenir (VARSAYIM):
   okunmuş bulguyu tekrar etmek yerine yenisi gelir.
7. Kayıt: telefonda `gozolcum:sci-log` `{ date, type, sourceKey }` (90 gün); sunucuya gitmez.
8. Bell 2023'e göre metin çeşitliliği tek başına açılmayı artırmadı; bu yüzden döndürmenin amacı etkiyi artırmak değil
   **tekrar yorgunluğunu önlemektir** (dürüst sınır).

### 10.7 Sınava eklenenler (§7.1'e)

| # | Denetim |
|---|---|
| S11 | Bilim satırındaki her sayı (kişi, hafta, yüzde, çalışma sayısı) bağlı kaynağın kaydında (`n`, bulgu notu) birebir var |
| S12 | Bilim satırı bulgu dilinde: "kanıtla", "iyileştir", "korur", "önler", "bilimsel olarak" yok; kişiye vaat ("senin de") yok |
| S13 | Bilim satırı taşıyan bildirimin `evidence` anahtarı `sources.js`'te `pmid` ve `doi` alanlarıyla var; kart sınır cümlesi taşıyor |
| S14 | Dolunay: "dolunay" yalnız `moon.js` o günü dolunay verdiğinde; aynı bildirimde "uyku" sözcüğü yalnız §10.4 (B) satırında |
| S15 | Döndürme: 30 günlük benzetimde günde ≤ 1 bilim satırı; aynı satır 7 gün içinde tekrar yok |
| S16 | Gövde ≤ 160, Nef cümlesi ≤ 70, bilim satırı ≤ 100; Nef cümlesi tek başına anlamlı (bilim satırına atıf yapmaz) |

### 10.8 Sahibin kararı gereken sorular (bilim satırı)

8. Bilim satırı günde en çok bir bildirimde mi görünsün (öneri), yoksa her hatırlatmada mı?
9. Bilim satırında ölüm ve hastalık riski gibi sağlık sonucu bildiren bulgular hiç kullanılmasın (öneri) — onay?
10. Dolunay bildirimi: (A) nefesin kendi bulgusu mu, (B) "ayın etkisi tartışmalı" satırı mı, yoksa ikisi dönüşümlü mü?
