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
9. **Her bildirim bir kanıt anahtarına bağlanır:** banka öğesi `evidence: 'bell2023'` gibi `lib/sources.js`
   anahtarları taşır; kanıt bildirim gövdesine sığmaz, dokununca açılan kartta görünür. Hava → "hava ve fiziksel etkinlik"
   + "eğer–o zaman planı"; yürüyüş algılama → "tam zamanında uyarlanabilir müdahale (JITAI) ve alıcılık"; modül → modülün
   kendi kanıtı + "bildirim etkisi" + "öz-yeterlik dili".
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

