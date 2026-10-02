# N1 · yeni Nef cümleleri · TASLAK

Tarih 2026-10-01. Durum: **taslak, hiçbiri onaylı değil.** Sıra şöyle: bu liste, sonra 5 kişilik doğallık ve etkileme
sınaması, en az 4/5, sonra ana oturumun onayı, en son sahip. Onaylanan cümle `bank/tr.js`'e harfi harfine girer.

Kaynaklar: `PLAN.md` §3, §4.1–§4.8, §8 · `ANA_OTURUM_ISTEMI.md` kapsam N1 · `DEVIR.md` · `ornekler/5sn-sonuclari.md`
· `bildirim-hava-yuruyus/arastirma/nef-bildirim.md` §2.3, §3.1–§3.5 · `app/src/modules/*/manifest.js` · `lib/progress.js`
`acuteEffects` ve `DOMAIN_LABEL` · `lib/who5.js` · `lib/weatherNotify.js`. Uygulama dosyalarına dokunulmadı.

"Kapıdan geçti" yazan cümle 5 saniye kapısında 4/5 ya da üstü aldı ama yine sahip onayı ister: plan cümleleri taslaktır.

---

## 0. Yer tutucular ve ekler

Sayıyı, saati ve eki kod yazar, `bank/tr.grammar.js`. **Ek** işaretli yer tutucu ek ya da ünlü uyumu ister.

| Yer tutucu | Değer | Ek |
|---|---|---|
| `{walkAt}`, `{earlyAt}`, `{rainFrom}`, `{rainTo}`, `{usualAt}`, `{remindAt}` | saat, yalın: "19.30" | yok |
| aynı saatler `:LOC` | "19.30'da", "19.00'da", "18.00'de", "21.00'de" | **Ek**, okunuşa göre; tablo `nef-bildirim.md` §3.2, kodda `weatherNotify.js` `hourTable` |
| aynı saatler `:ABL` | "17.00'den", "19.00'dan" | **Ek** |
| aynı saatler `:DAT` | "18.00'e", "22.00'ye", "19.30'a" | **Ek**, ünlüyle biten okunuşta y: "22.00'ye" |
| `{önce}`, `{sonra}`, `{önceOrt}`, `{sonraOrt}`, `{başlangıç}`, `{şimdi}` + `:ABL` / `:DAT` | "4'ten", "7'ye", "6'dan", "3'e"; ondalıkta son sözcük: "3,6'ya"; yüzde: "%55'ten"; birimli: "120 milisaniyeden", "6 harfe" | **Ek** |
| `{n:söz}` | sayı sözle: "üç" | sözcük tablosu |
| `{n:SIRA}`, `{k:SIRA}` | "ikinci", "dördüncü" | **Ek**, sıra sayısı eki ve ünsüz yumuşaması |
| `{n:LOC-POSS}` | "dördünde", "beşinde" | **Ek**, iyelik ve bulunma, "dört" → "dördünde" |
| `{dilim}` | sabah, öğlen, akşam, gece | yok; sayıyla birlikte "öğlen" yerine "gün" yazılır: "üç gün 12.30'da" |
| `{Dilim}` | cümle başında büyük harfle: "Akşam" | büyük harf |
| `{dilim+da}` | "akşam da", "sabah da", "gece de", "öğlen de" | **Ünlü uyumu** |
| `{modül}` | türlü ad, yalın: "Dalga sesi", "Yılan oyunu" | yok; §8 tablosu |
| `{modül:ABL}`, `{modül:ACC}`, `{modül:LOC}`, `{modül:DAT}` | "Dalga sesinden", "Dalga sesini", "Yılan oyununda", "Dalga sesine" | **Ek**, manifest `nef.name` çekimleri |
| `{modül:POSS}` | "yoga dersin", "Gökyüzü molan" | **Ek**, 2. tekil iyelik |
| `{ölçü}` | effects `measure`, yalın: "sakinlik", "rahatsızlık" | yok; hep "puanın" sözüyle kullanılır |
| `{ölçü:POSS}` | "sakinliğin", "odağın", "enerjin" | **Ek**, iyelik ve ünsüz yumuşaması; §8 tablosu |
| `{Ölçü}` | cümle başında: "Sakinlik" | büyük harf |
| `{metrik}` | `nef.metricWords`: "algı eşiğin", "kavradığın harf sayısı" | yok; §8 tablosu |
| `{Metrik}` | cümle başında | büyük harf |
| `{birim}` | "harf", "milisaniye", "kez" | birimli sayıda ek birim sözcüğüne gelir |
| `{yönFiil}` | `better: up` → "çıktı", `down` → "indi"; süre biriminde "kısaldı" | yok |
| `{fark}` | ortalama fark, bir ondalık, virgülle: "2", "1,5" | yok; ardından "puan" |
| `{feels}` | hissedilen sıcaklık, tam sayı | yok; ardından "derece". "31°'ye" yazılmaz |
| `{alan}` | `DOMAIN_LABEL`: Göz, Sakinlik, Kendine yaklaşım, Farkındalık, Dikkat, İyi oluş, Beden | yok |
| `{dk}` | dakika | yok |
| `{n}` | seans sayısı, rakam | yok; "son 5 seansta" |

Genel denetim, her cümlede: sağlık iddiası yok · emoji yok · ünlem yok · "-malısın" yok · korkutma, suçlama, başkasıyla
kıyas yok · hava için "bekleniyor" · "sayesinde" ve "iyi geldi" yok · "beyin" ve "tanıma" yok · bugünün gün adı yok ·
modül adı türüyle · parantez yok · `nef-bildirim.md` §3.5 listesindeki "yine", "hâlâ", "kaçırdın", "hemen", "mutlaka",
"sakın" yok · bildirimde adım sayısı ve görme sonucu yok. Tarama sonucu §9'da.

---

## 1. F1 · yağmur, kişinin yürüyüş saatine denk geliyor · `rainOnWalk`

**Nerede:** bildirim, başlık ve gövde. İki yol, plan §4.2 ve §4.3: sabah havası bildiriminin, 7700–7701, metni
zenginleşir; ya da Nef'in kendi bildirimi, 7900–7919, günde en çok 1. Kilit ekranında altta onaylı kaynak satırı
"Kaynak: Apple Weather" durur, `weatherNotify.js` MW-S; yeni değil. VARSAYIM: Ana sayfa kartında aynı gövde gösterilir.

**Ne zaman:** plan §4.1: `rain.from − 90 dk ≤ yürüyüş saati ≤ rain.to`. Yürüyüş saati kişinin yürüyüş alışkanlığından,
son 28 günün adımları, ya da kurduğu yürüyüş hatırlatmasından gelir, §3 F1. Kişisel olgu yoksa an kurulmaz, §3 F1.
Tahmin 18 saatten eskiyse hava cümlesi yok, §4.3. Kişi bugünkü yolunu bitirdiyse bildirim yok, §4.5.

**Kurallar:** önce kişinin düzeni, sonra hava, M1C. Saatler tutarlı: göreli "bir saat erken" yok, hep saat yazılır, M1B.
Başlık 30, gövde 110 karakteri geçmez, `nef-bildirim.md` §3.1.

VARSAYIM `{earlyAt}`: `rainFrom − 60 dk`, tam ya da yarım saate aşağı yuvarlanır; `{earlyAt}` bildirim anından en az 30 dk
sonra ve `{walkAt}`'ten önce olmalı. Olmuyorsa hücre F1.C seçilir.
VARSAYIM sayılı cümle: "Bu hafta {n:söz} …" yalnız bu hafta en az 2 yürüyüş varsa; yoksa "genelde" ya da "son iki
haftada" diyen değişke seçilir.

### F1.T · bildirim başlığı

Tek satır, 30 karakter. Gövde başlığı tekrar etmez: başlık "denk geliyor" diyorsa gövde aynı sözü kullanmaz.

1. **[F1T-1]** "Yürüyüşün yağmura denk geliyor" · kaynak §3 F1, M1C, kapıdan geçti
2. **[F1T-2]** "Yağmur yürüyüş saatine yakın"
3. **[F1T-3]** "Yağmur senin saatine yakın"
4. **[F1T-4]** "Yürüyüşünle yağmur çakışabilir"
5. **[F1T-5]** "Yürüyüş saatin ve yağmur"
6. **[F1T-6]** "Bugünkü yürüyüşün için not"
7. **[F1T-7]** "Yürüyüşünde yağmur ihtimali"

### F1.A · yürüyüş yağmur aralığının içinde, ilk kez

Koşul: `rainFrom ≤ walkAt ≤ rainTo` ve son 7 günde bu an söylenmedi. Örnek veri: üç akşam 19.30, yağmur 19.00–22.00.

1. **[F1A-1]** `Bu hafta {n:söz} {dilim} {walkAt:LOC} yürüdün. Bugün yağmur {rainFrom:LOC} bekleniyor; {earlyAt:LOC} çıkabilirsin.`
   Örnek: "Bu hafta üç akşam 19.30'da yürüdün. Bugün yağmur 19.00'da bekleniyor; 18.00'de çıkabilirsin."
   Kaynak §3 F1, M1C, kapıdan geçti.
2. **[F1A-2]** `{Dilim} yürüyüşlerin genelde {walkAt:LOC}. Bugün yağmur {rainFrom:LOC} bekleniyor; {earlyAt} daha kuru görünüyor.`
   Örnek: "Akşam yürüyüşlerin genelde 19.30'da. Bugün yağmur 19.00'da bekleniyor; 18.00 daha kuru görünüyor."
3. **[F1A-3]** `Son iki haftada çoğunlukla {walkAt:LOC} yürüdün. Bugün yağmur {rainFrom:LOC} bekleniyor; istersen {earlyAt:LOC} çık.`
   Örnek: "Son iki haftada çoğunlukla 19.30'da yürüdün. Bugün yağmur 19.00'da bekleniyor; istersen 18.00'de çık."
4. **[F1A-4]** `Bu hafta yürüyüşlerinin {n:söz} tanesi {walkAt:LOC} oldu. Bugün yağmur {rainFrom:LOC} bekleniyor; {earlyAt:LOC} çıkmak da olur.`
   Örnek: "Bu hafta yürüyüşlerinin üç tanesi 19.30'da oldu. Bugün yağmur 19.00'da bekleniyor; 18.00'de çıkmak da olur."
5. **[F1A-5]** `Her zamanki {walkAt} yürüyüşünü {earlyAt:DAT} alırsan yağmurdan önce dönebilirsin; yağmur {rainFrom:LOC} bekleniyor.`
   Örnek: "Her zamanki 19.30 yürüyüşünü 18.00'e alırsan yağmurdan önce dönebilirsin; yağmur 19.00'da bekleniyor."
   Kaynak §4.6 "rainOnWalk · sabah · ilk". Düzeltme: önce düzen sonra hava; göreli `{shift}` yerine saat, M1B;
   "yağmura kalmazsın" kesin söz olduğu için çıktı.
6. **[F1A-6]** `Bu hafta {walkAt} senin yürüyüş saatin oldu. Bugün yağmur {rainFrom:LOC} bekleniyor; {earlyAt:LOC} çıkabilirsin.`
   Örnek: "Bu hafta 19.30 senin yürüyüş saatin oldu. Bugün yağmur 19.00'da bekleniyor; 18.00'de çıkabilirsin."
7. **[F1A-7]** `Bu hafta {dilim} yürüyüşlerin {walkAt:LOC} oldu. Bugün yağmur {rainFrom:LOC} bekleniyor; {earlyAt} daha kuru görünüyor.`
   Örnek: "Bu hafta akşam yürüyüşlerin 19.30'da oldu. Bugün yağmur 19.00'da bekleniyor; 18.00 daha kuru görünüyor."

### F1.B · yürüyüş yağmurdan az önce

VARSAYIM: §4.1 kuralı yürüyüşün yağmurdan 90 dk öncesine kadar olmasına izin veriyor; bu durumda "öne al" demek saat
tutarlılığını bozar, M1B. Koşul: `rainFrom − 90 dk ≤ walkAt < rainFrom`. Örnek veri: üç akşam 18.00, yağmur 19.00.

1. **[F1B-1]** `Bu hafta {n:söz} {dilim} {walkAt:LOC} yürüdün. Bugün yağmur {rainFrom:LOC} bekleniyor; yürüyüş ondan önce sığabilir.`
   Örnek: "Bu hafta üç akşam 18.00'de yürüdün. Bugün yağmur 19.00'da bekleniyor; yürüyüş ondan önce sığabilir."
2. **[F1B-2]** `{Dilim} yürüyüşlerin genelde {walkAt:LOC}. Bugün yağmur biraz sonra, {rainFrom:LOC} bekleniyor; kısa bir tur sığabilir.`
   Örnek: "Akşam yürüyüşlerin genelde 18.00'de. Bugün yağmur biraz sonra, 19.00'da bekleniyor; kısa bir tur sığabilir."
3. **[F1B-3]** `Son iki haftada çoğunlukla {walkAt:LOC} yürüdün. Bugün yağmur {rainFrom:LOC} bekleniyor; ondan önce dönebilirsin.`
   Örnek: "Son iki haftada çoğunlukla 18.00'de yürüdün. Bugün yağmur 19.00'da bekleniyor; ondan önce dönebilirsin."
4. **[F1B-4]** `Her zamanki {walkAt} yürüyüşünle yağmur arasında az zaman var: yağmur {rainFrom:LOC} bekleniyor.`
   Örnek: "Her zamanki 18.00 yürüyüşünle yağmur arasında az zaman var: yağmur 19.00'da bekleniyor."
5. **[F1B-5]** `Bu hafta {walkAt} senin yürüyüş saatin oldu. Bugün yağmur {rainFrom:LOC} bekleniyor; yürüyüş ondan önce bitebilir.`
   Örnek: "Bu hafta 18.00 senin yürüyüş saatin oldu. Bugün yağmur 19.00'da bekleniyor; yürüyüş ondan önce bitebilir."
6. **[F1B-6]** `{walkAt} yürüyüşün bugün yağmurdan biraz önceye düşüyor; yağmur {rainFrom:LOC} bekleniyor.`
   Örnek: "18.00 yürüyüşün bugün yağmurdan biraz önceye düşüyor; yağmur 19.00'da bekleniyor."

### F1.C · kuru aralık yok, içeride

Kaynak §4.6 "rainOnWalk · içeride". VARSAYIM koşul: uygun `{earlyAt}` bulunamıyor ya da yağmur dilimin tamamını
kaplıyor. Örnek veri: üç akşam 19.30, yağmur 17.00–22.00.

1. **[F1C-1]** `Bu hafta {n:söz} {dilim} {walkAt:LOC} yürüdün. Bugün yağmur {rainFrom:LOC} bekleniyor; {dk} dakikalık nefes pratiği de olur.`
   Örnek: "Bu hafta üç akşam 19.30'da yürüdün. Bugün yağmur 17.00'de bekleniyor; 5 dakikalık nefes pratiği de olur."
   Düzeltme: plan cümlesi "Yağmur … başlıyor" ile başlıyordu; önce düzen geldi, "başlıyor" yerine "bekleniyor", modül türüyle.
2. **[F1C-2]** `{Dilim} yürüyüşlerin genelde {walkAt:LOC}. Bugün yağmur {rainFrom:ABL} {rainTo:DAT} kadar bekleniyor; içeride de olur.`
   Örnek: "Akşam yürüyüşlerin genelde 19.30'da. Bugün yağmur 17.00'den 22.00'ye kadar bekleniyor; içeride de olur."
3. **[F1C-3]** `{walkAt} yürüyüşün bugün yağmurun ortasına düşebilir; yağmur {rainTo:DAT} kadar bekleniyor. İçeride de olur.`
   Örnek: "19.30 yürüyüşün bugün yağmurun ortasına düşebilir; yağmur 22.00'ye kadar bekleniyor. İçeride de olur."
4. **[F1C-4]** `Son iki haftada çoğunlukla {walkAt:LOC} yürüdün. Bugün o saatlerde yağmur bekleniyor; koridorda bir tur da olur.`
   Örnek: "Son iki haftada çoğunlukla 19.30'da yürüdün. Bugün o saatlerde yağmur bekleniyor; koridorda bir tur da olur."
5. **[F1C-5]** `{walkAt} senin yürüyüş saatin; bugün yağmur {rainTo:DAT} kadar bekleniyor. Yürüyüşü yarına bırakmak da olur.`
   Örnek: "19.30 senin yürüyüş saatin; bugün yağmur 22.00'ye kadar bekleniyor. Yürüyüşü yarına bırakmak da olur."
6. **[F1C-6]** `Bu hafta {n:söz} {dilim} {walkAt:LOC} yürüdün. Bugün {dilim} boyu yağmur bekleniyor; içeride kısa bir yürüyüş de olur.`
   Örnek: "Bu hafta üç akşam 19.30'da yürüdün. Bugün akşam boyu yağmur bekleniyor; içeride kısa bir yürüyüş de olur."

### F1.D · tekrar

Plan §4.6 hücre anahtarında "ilk kez ya da tekrar" var. VARSAYIM koşul: son 7 günde F1 en az bir kez söylendi.
"Yine" yazılmaz, §3.5 suçlama listesi; "bugün de" yazılır. Örnek veri: 19.30, yağmur 19.00, dün de yağmur.

1. **[F1D-1]** `Bugün de {dilim} yürüyüşüne yağmur yakın: {rainFrom:LOC} bekleniyor. {earlyAt} daha kuru görünüyor.`
   Örnek: "Bugün de akşam yürüyüşüne yağmur yakın: 19.00'da bekleniyor. 18.00 daha kuru görünüyor."
   Kaynak §4.6 "rainOnWalk · sabah · tekrar". Düzeltme: önce kişinin yürüyüşü, sonra yağmur; `{walkEarly}` yerine saat.
2. **[F1D-2]** `Dün olduğu gibi bugün de {walkAt} yürüyüşüne yağmur yakın; yağmur {rainFrom:LOC} bekleniyor, {earlyAt:LOC} çıkabilirsin.`
   Örnek: "Dün olduğu gibi bugün de 19.30 yürüyüşüne yağmur yakın; yağmur 19.00'da bekleniyor, 18.00'de çıkabilirsin."
   Yalnız dün de F1 söylendiyse.
3. **[F1D-3]** `Yürüyüş saatin {walkAt}; bugün de yağmur {rainFrom:LOC} bekleniyor. {earlyAt} daha kuru görünüyor.`
   Örnek: "Yürüyüş saatin 19.30; bugün de yağmur 19.00'da bekleniyor. 18.00 daha kuru görünüyor."
4. **[F1D-4]** `{walkAt} yürüyüşüne bu hafta {k:SIRA} kez yağmur yakın. Bugün {rainFrom:LOC} bekleniyor; {earlyAt:LOC} çıkabilirsin.`
   Örnek: "19.30 yürüyüşüne bu hafta ikinci kez yağmur yakın. Bugün 19.00'da bekleniyor; 18.00'de çıkabilirsin."
5. **[F1D-5]** `{Dilim} yürüyüşlerin genelde {walkAt:LOC}; bugün de yağmur {rainFrom:LOC} bekleniyor. {earlyAt:LOC} çıkmak da olur.`
   Örnek: "Akşam yürüyüşlerin genelde 19.30'da; bugün de yağmur 19.00'da bekleniyor. 18.00'de çıkmak da olur."
6. **[F1D-6]** `Bugün de senin saatine yağmur yakın: {rainFrom:LOC} bekleniyor. {earlyAt:LOC} çıkabilirsin.`
   Örnek: "Bugün de senin saatine yağmur yakın: 19.00'da bekleniyor. 18.00'de çıkabilirsin."

### F1.E · saat kişinin kurduğu hatırlatmadan

Plan §3 F1 saatin ikinci kaynağını sayıyor. VARSAYIM: kurulu hatırlatma kişisel olgu sayılır. Bakmadım: 77xx ya da 78xx
içinde bir yürüyüş hatırlatması bugün var mı; modül listesinde yürüyüş modülü yok, 74xx yürüyüş deneyi dokunulmaz.
Örnek veri: hatırlatma 19.30, yağmur 19.00.

1. **[F1E-1]** `Yürüyüş hatırlatman {walkAt:LOC}. Bugün yağmur {rainFrom:LOC} bekleniyor; {earlyAt:LOC} çıkabilirsin.`
   Örnek: "Yürüyüş hatırlatman 19.30'da. Bugün yağmur 19.00'da bekleniyor; 18.00'de çıkabilirsin."
2. **[F1E-2]** `Yürüyüş için seçtiğin saat {walkAt}. Yağmur bugün {rainFrom:LOC} bekleniyor; {earlyAt} daha kuru görünüyor.`
   Örnek: "Yürüyüş için seçtiğin saat 19.30. Yağmur bugün 19.00'da bekleniyor; 18.00 daha kuru görünüyor."
3. **[F1E-3]** `Kendi seçtiğin {walkAt} yürüyüşü yağmura denk gelebilir; yağmur {rainFrom:LOC} bekleniyor. {earlyAt:LOC} çıkmak da olur.`
   Örnek: "Kendi seçtiğin 19.30 yürüyüşü yağmura denk gelebilir; yağmur 19.00'da bekleniyor. 18.00'de çıkmak da olur."
4. **[F1E-4]** `{walkAt} senin yürüyüş saatin. Bugün yağmur {rainFrom:LOC} bekleniyor; istersen {earlyAt:LOC} çık.`
   Örnek: "19.30 senin yürüyüş saatin. Bugün yağmur 19.00'da bekleniyor; istersen 18.00'de çık."
5. **[F1E-5]** `Yürüyüşünü {walkAt:DAT} kurmuştun. Bugün yağmur {rainFrom:LOC} bekleniyor; {earlyAt:LOC} çıkabilirsin.`
   Örnek: "Yürüyüşünü 19.30'a kurmuştun. Bugün yağmur 19.00'da bekleniyor; 18.00'de çıkabilirsin."
6. **[F1E-6]** `Hatırlatman {walkAt:LOC} gelecek; yağmur bugün {rainFrom:LOC} bekleniyor. {earlyAt} daha kuru görünüyor.`
   Örnek: "Hatırlatman 19.30'da gelecek; yağmur bugün 19.00'da bekleniyor. 18.00 daha kuru görünüyor."

---

## 2. F3 · sıcak, kişinin yürüyüş saatinde · `hotWalk`, yalnız yan cümle

**Nerede:** ayrı bildirim yok, §3 F3. Yan cümle F1 gövdesinin sonuna ya da kişinin kendi yürüyüş bildirimine eklenir.
Su hatırlatması her zamanki metniyle gelir.
**Ne zaman:** §4.1: hissedilen ≥ 30 derece ve kişinin yürüyüş saatine denk geliyor. Eşik VARSAYIM, §3 F3.
**Kurallar:** "31 derece" yazılır, "31°'ye" yazılmaz · bildirimde tek saat · "susuz kalırsın", "sıcak çarpar" yok ·
"hâlâ" yok: plan örneğinde vardı, ama `nef-bildirim.md` §3.5 suçlama listesinde.

### F3.A · F1'e eklenen yan cümle, saatsiz

F1 gövdesinde zaten saat var; bu yüzden yan cümle saat taşımaz. VARSAYIM: `{feels}` önerilen saatin, yani `{earlyAt}`'in
hissedileni; öneri yoksa `{walkAt}`'in. Örnek veri: hissedilen 31.

1. **[F3A-1]** `Hissedilen {feels} derece; suyunu yanına al.`
   Örnek: "Hissedilen 31 derece; suyunu yanına al." · kaynak §3 F3 ve §4.6 "hotWalk", kısaltıldı
2. **[F3A-2]** `Hissedilen {feels} derece; su yanında olsun.`
   Örnek: "Hissedilen 31 derece; su yanında olsun."
3. **[F3A-3]** `Hava {feels} derece hissettiriyor; suyunu yanına alabilirsin.`
   Örnek: "Hava 31 derece hissettiriyor; suyunu yanına alabilirsin."
4. **[F3A-4]** `Hissedilen {feels} derece; gölgeli yolu seçebilirsin.`
   Örnek: "Hissedilen 31 derece; gölgeli yolu seçebilirsin."
5. **[F3A-5]** `O saatte hissedilen {feels} derece; bir şişe su yanında olsun.`
   Örnek: "O saatte hissedilen 31 derece; bir şişe su yanında olsun."
6. **[F3A-6]** `Hissedilen {feels} derece; yolda su yanında olsun.`
   Örnek: "Hissedilen 31 derece; yolda su yanında olsun."
7. **[F3A-7]** `Sıcaklık {feels} derece hissettiriyor; gölge ve su işine yarar.`
   Örnek: "Sıcaklık 31 derece hissettiriyor; gölge ve su işine yarar."

### F3.B · yağmursuz gün, kişinin yürüyüş saatinde sıcak

Plan §3 F3 örneği "Yağmur yok ama 19.30 yürüyüşünde hava hâlâ 31 derece; suyunu yanına al." Düzeltme: "hâlâ" çıktı;
"Yağmur yok" kesin hava sözü olduğu için çıktı. VARSAYIM: hangi bildirime ekleneceği belirsiz, §10'a bak. Tek saat taşır.
Örnek veri: akşam 19.30, hissedilen 31.

1. **[F3B-1]** `Her zamanki {walkAt} yürüyüşünde hissedilen {feels} derece; suyunu yanına al.`
   Örnek: "Her zamanki 19.30 yürüyüşünde hissedilen 31 derece; suyunu yanına al."
2. **[F3B-2]** `{walkAt} yürüyüşünde hissedilen {feels} derece bekleniyor; su yanında olsun.`
   Örnek: "19.30 yürüyüşünde hissedilen 31 derece bekleniyor; su yanında olsun."
3. **[F3B-3]** `Bu hafta {walkAt:LOC} yürüdün; o saatte hissedilen {feels} derece. Suyunu yanına alabilirsin.`
   Örnek: "Bu hafta 19.30'da yürüdün; o saatte hissedilen 31 derece. Suyunu yanına alabilirsin."
4. **[F3B-4]** `{walkAt:LOC}, yürüyüş saatinde, hissedilen {feels} derece; gölgeli yolu seçebilirsin.`
   Örnek: "19.30'da, yürüyüş saatinde, hissedilen 31 derece; gölgeli yolu seçebilirsin."
5. **[F3B-5]** `{Dilim} yürüyüşlerin genelde {walkAt:LOC}; o saatte hissedilen {feels} derece. Su yanında olsun.`
   Örnek: "Akşam yürüyüşlerin genelde 19.30'da; o saatte hissedilen 31 derece. Su yanında olsun."
6. **[F3B-6]** `Yürüyüş saatin {walkAt}; hissedilen {feels} derece. Gölge ve su işine yarar.`
   Örnek: "Yürüyüş saatin 19.30; hissedilen 31 derece. Gölge ve su işine yarar."

---

## 3. F2 · seni hatırlayan Nef · `recallEffect`, `effectPattern`

**Nerede:** Ana sayfa Nef kartı; ana cümle, altında önce–sonra çizimi, açıklama satırı ve düğme, M2. Bildirim yok:
Nef'in kendi bildirimi yalnız üç durumda gelir, §4.2.
**Ne zaman:** `recallEffect` §4.1: o modülün geçen haftaki aynı gün ve saatte bir seansı var, sonra − önce ≥ 2. Kartta
kişinin o modülü en sık açtığı gün ve saate yakın, §3 F2. `effectPattern` §3 F2: `acuteEffects` anlamlı, en az 3 seans,
güven aralığı sıfırı geçmiyor.
**Kurallar:** tek seans olgu olarak söylenir: tarih, modül, önce, sonra · "sayesinde", "iyi geldi" ve her sebep sözü yok ·
"geçen salı" gibi gün adı yok, "geçen hafta bu akşam" · aynı olgu bir kez söylenir, §4.4 kural 2.
VARSAYIM yön: `better: 'down'` olan ölçülerde, yani rahatsızlık, gerginlik, beden gerginliği, eşik `önce − sonra ≥ 2`;
hücre F2.B ve F2.D. `acuteEffects` kötüleşme yönünde anlamlıysa an kurulmaz.
Kaynak veri, manifestlerden: Nefes sakinlik 1–5 · Dalga sakinlik, kendine güven, enerji 0–10 · Gökyüzü molası
dinlenmişlik 0–10 · Yön dışarıdan bak rahatsızlık 0–10, `down` · yoga Nefesin Ritmi gerginlik `down`, Derin Dinlenme
beden gerginliği `down`, Tek Nokta odak 0–10.

### F2.A · tek seans, artış

Örnek veri: geçen hafta aynı akşam, Dalga sesi, sakinlik 4 → 7.

1. **[F2A-1]** `Geçen hafta bu {dilim} {modül:ABL} sonra {ölçü:POSS} {önce:ABL} {sonra:DAT} çıkmıştı.`
   Örnek: "Geçen hafta bu akşam Dalga sesinden sonra sakinliğin 4'ten 7'ye çıkmıştı."
   Kaynak §3 F2 ve §4.8, M2, kapıdan geçti. Düzeltme: "Dalga'dan" yerine "Dalga sesinden", §4.8 modül adı kuralı.
2. **[F2A-2]** `Geçen hafta bu {dilim}: {modül}, {ölçü} puanın önce {önce}, sonra {sonra}.`
   Örnek: "Geçen hafta bu akşam: Dalga sesi, sakinlik puanın önce 4, sonra 7."
3. **[F2A-3]** `Geçen hafta bu {dilim} {ölçü} puanın {modül:ABL} önce {önce}, sonra {sonra} olmuştu.`
   Örnek: "Geçen hafta bu akşam sakinlik puanın Dalga sesinden önce 4, sonra 7 olmuştu."
4. **[F2A-4]** `Bir hafta önce bu saatlerde {modül:ABL} sonra {ölçü} puanın {önce:ABL} {sonra:DAT} yükselmişti.`
   Örnek: "Bir hafta önce bu saatlerde Dalga sesinden sonra sakinlik puanın 4'ten 7'ye yükselmişti."
5. **[F2A-5]** `Geçen hafta bu {dilim} {modül:ACC} seçmiştin; {ölçü} puanın {önce:ABL} {sonra:DAT} çıkmıştı.`
   Örnek: "Geçen hafta bu akşam Dalga sesini seçmiştin; sakinlik puanın 4'ten 7'ye çıkmıştı."
6. **[F2A-6]** `Yedi gün önce bu {dilim} {modül:ABL} sonra {ölçü:POSS} {önce:ABL} {sonra:DAT} yükselmişti.`
   Örnek: "Yedi gün önce bu akşam nefes pratiğinden sonra sakinliğin 2'den 4'e yükselmişti."
7. **[F2A-7]** `Geçen hafta aynı saatlerde {modül} vardı: {ölçü} puanın {önce:ABL} {sonra:DAT} çıkmıştı.`
   Örnek: "Geçen hafta aynı saatlerde Dalga sesi vardı: sakinlik puanın 4'ten 7'ye çıkmıştı."

### F2.B · tek seans, azalış, iyi yön aşağı

Örnek veri: Nefesin Ritmi yoga dersi, gerginlik 6 → 3; Yön yazı egzersizi, rahatsızlık 7 → 4.

1. **[F2B-1]** `Geçen hafta bu {dilim} {modül:ABL} sonra {ölçü:POSS} {önce:ABL} {sonra:DAT} inmişti.`
   Örnek: "Geçen hafta bu akşam Nefesin Ritmi yoga dersinden sonra gerginliğin 6'dan 3'e inmişti."
2. **[F2B-2]** `Geçen hafta bu {dilim} {modül} bitince {ölçü} puanın {önce:ABL} {sonra:DAT} azalmıştı.`
   Örnek: "Geçen hafta bu akşam Yön yazı egzersizi bitince rahatsızlık puanın 7'den 4'e azalmıştı."
3. **[F2B-3]** `Yedi gün önce bu {dilim} {modül:ABL} sonra {ölçü:POSS} {önce:ABL} {sonra:DAT} inmişti.`
   Örnek: "Yedi gün önce bu akşam Yön yazı egzersizinden sonra rahatsızlığın 7'den 4'e inmişti."
4. **[F2B-4]** `Bir hafta önce bu saatlerde {modül:ABL} sonra {ölçü} puanın {önce:ABL} {sonra:DAT} düşmüştü.`
   Örnek: "Bir hafta önce bu saatlerde Nefesin Ritmi yoga dersinden sonra gerginlik puanın 6'dan 3'e düşmüştü."
5. **[F2B-5]** `Geçen hafta bu {dilim} {modül:ACC} seçmiştin; {ölçü} puanın {önce:ABL} {sonra:DAT} inmişti.`
   Örnek: "Geçen hafta bu akşam Yön yazı egzersizini seçmiştin; rahatsızlık puanın 7'den 4'e inmişti."
6. **[F2B-6]** `Geçen hafta aynı saatlerde {modül} vardı: {ölçü} puanın {önce:ABL} {sonra:DAT} inmişti.`
   Örnek: "Geçen hafta aynı saatlerde Nefesin Ritmi yoga dersi vardı: gerginlik puanın 6'dan 3'e inmişti."

### F2.C · örüntü, en az 3 seans, artış

`acuteEffects` alanları: `n`, `before`, `after`, `gain`. `{fark}` = `gain`, bir ondalık. `{önceOrt}`, `{sonraOrt}` =
`before`, `after`, tam sayıya yuvarlanır; VARSAYIM. Örnek veri: Dalga sesi sakin, 5 seans, ortalama 4 → 6, fark 2.

1. **[F2C-1]** `{modül:ABL} sonra {ölçü} puanın son {n} seansta ortalama {fark} puan arttı.`
   Örnek: "Dalga sesinden sonra sakinlik puanın son 5 seansta ortalama 2 puan arttı."
   Kaynak §4.6 "recallEffect · genel" ve §3 F2. Düzeltme: "genelde" yerine "ortalama", çünkü sayı ortalamadır; modül türüyle.
2. **[F2C-2]** `Son {n} {modül} seansında {ölçü} puanın ortalama {önceOrt:ABL} {sonraOrt:DAT} çıktı.`
   Örnek: "Son 5 Dalga sesi seansında sakinlik puanın ortalama 4'ten 6'ya çıktı."
3. **[F2C-3]** `Önce ve sonra puanların: son {n} {modül} seansında {ölçü} ortalama {fark} puan arttı.`
   Örnek: "Önce ve sonra puanların: son 5 Dalga sesi seansında sakinlik ortalama 2 puan arttı."
4. **[F2C-4]** `Son {n} seansın ortalamasına göre {modül:ABL} sonra {ölçü} puanın {fark} puan yükseliyor.`
   Örnek: "Son 5 seansın ortalamasına göre Dalga sesinden sonra sakinlik puanın 2 puan yükseliyor."
5. **[F2C-5]** `{Ölçü} puanın {modül:ABL} sonra son {n} seansta ortalama {fark} puan yükseldi.`
   Örnek: "Sakinlik puanın Dalga sesinden sonra son 5 seansta ortalama 2 puan yükseldi."
6. **[F2C-6]** `Son {n} {modül} seansında ortalama {ölçü} puanın: önce {önceOrt}, sonra {sonraOrt}.`
   Örnek: "Son 5 Dalga sesi seansında ortalama sakinlik puanın: önce 4, sonra 6."
7. **[F2C-7]** `Tek seferlik değil: son {n} {modül} seansında {ölçü} puanın ortalama {fark} puan arttı.`
   Örnek: "Tek seferlik değil: son 5 Dalga sesi seansında sakinlik puanın ortalama 2 puan arttı."

### F2.D · örüntü, en az 3 seans, azalış, iyi yön aşağı

Örnek veri: Yön yazı egzersizi, 4 seans, rahatsızlık ortalama 7 → 5, fark 1,5.

1. **[F2D-1]** `{modül:ABL} sonra {ölçü} puanın son {n} seansta ortalama {fark} puan azaldı.`
   Örnek: "Yön yazı egzersizinden sonra rahatsızlık puanın son 4 seansta ortalama 1,5 puan azaldı."
2. **[F2D-2]** `Son {n} {modül} seansında {ölçü} puanın ortalama {önceOrt:ABL} {sonraOrt:DAT} indi.`
   Örnek: "Son 4 Yön yazı egzersizi seansında rahatsızlık puanın ortalama 7'den 5'e indi."
3. **[F2D-3]** `Önce ve sonra puanların: son {n} {modül} seansında {ölçü} ortalama {fark} puan azaldı.`
   Örnek: "Önce ve sonra puanların: son 4 Yön yazı egzersizi seansında rahatsızlık ortalama 1,5 puan azaldı."
4. **[F2D-4]** `Son {n} seansın ortalamasına göre {modül:ABL} sonra {ölçü} puanın {fark} puan iniyor.`
   Örnek: "Son 4 seansın ortalamasına göre Yön yazı egzersizinden sonra rahatsızlık puanın 1,5 puan iniyor."
5. **[F2D-5]** `{Ölçü} puanın {modül:ABL} sonra son {n} seansta ortalama {fark} puan düştü.`
   Örnek: "Gerginlik puanın Nefesin Ritmi yoga dersinden sonra son 4 seansta ortalama 1,5 puan düştü."
6. **[F2D-6]** `Tek seferlik değil: son {n} {modül} seansında {ölçü} puanın ortalama {fark} puan azaldı.`
   Örnek: "Tek seferlik değil: son 4 Yön yazı egzersizi seansında rahatsızlık puanın ortalama 1,5 puan azaldı."

### F2.E · çizimin altındaki açıklama satırı, kalıp

Sabit kalıp, an hücresi değil. VARSAYIM: 21 gün kuralına girmez, her F2 kartında aynı satır olur.

1. **[F2E-1]** `{modül:ACC} {fiil:-meden} önce ve sonra kendine verdiğin puan.`
   Örnek: "Dalga sesini dinlemeden önce ve sonra kendine verdiğin puan." · kaynak M2, kapıdan geçti; fiil `nef.name`'den
2. **[F2E-2]** `{modül:ABL} önce ve sonra kendine verdiğin puan.`
   Örnek: "Gökyüzü molasından önce ve sonra kendine verdiğin puan." · fiilsiz, her modülde çalışır
3. **[F2E-3]** `Son {n} seansta {modül:ABL} önce ve sonra verdiğin puanların ortalaması.`
   Örnek: "Son 5 seansta Dalga sesinden önce ve sonra verdiğin puanların ortalaması." · F2.C ve F2.D için

### F2.F · kart düğmesi, kalıp

1. **[F2F-1]** `Bu {dilim+da} {modül} · {dk} dk`
   Örnek: "Bu akşam da Dalga sesi · 8 dk" · kaynak M2 "Bu akşam da Dalga · 8 dk"; düzeltme: tür eklendi, M5C düğmesi
   "Dikkat için Yılan oyunu 2 dk" gibi
2. **[F2F-2]** `{modül} · {dk} dk`
   Örnek: "Gökyüzü molası · 3 dk"
3. **[F2F-3]** `Bugün de {modül} · {dk} dk`
   Örnek: "Bugün de nefes pratiği · 5 dk"

---

## 4. F4 · susan Nef · `silentDay`, uzun aradan dönüş, düşük WHO-5

**Nerede:** Ana sayfa kartı, küçük, tek satır. Bildirim yok, §3 F4 ve §4.5.
**Ne zaman:** söylenecek yeni olgu yok, §4.5. Kişi bugünkü yolunu bitirdiyse Nef o gün bildirim göndermez, §4.5.

VARSAYIM sıklık: sessiz gün çok sık olabilir. 8 değişke 21 günde ancak 8 sessiz günü karşılar. Değişke biterse ya satır
hiç yazılmaz, kartta yalnız etiket kalır, ya da `silentDay` 21 gün kuralından çıkarılır. Karar ana oturumda.

### F4.A · sessiz gün, yol var ve bitmedi

1. **[F4A-1]** "Bugün senden bir şey istemiyorum. Yolun hazır." · kaynak §3 F4 ve §4.6 "silentDay"
2. **[F4A-2]** "Bugün söyleyecek yeni bir şeyim yok. Yolun hazır."
3. **[F4A-3]** "Bugün sessizim. Yolun hazır."
4. **[F4A-4]** "Bugün yeni bir haber yok. Yolun yerinde."
5. **[F4A-5]** "Bugün sana bir şey eklemiyorum. Yolun hazır."
6. **[F4A-6]** "Bugün kısa konuşuyorum: yolun hazır."
7. **[F4A-7]** "Bugün yalnız yolun var; acelesi yok."
8. **[F4A-8]** "Bugün benden yeni bir not yok. Yolun hazır."

Yer tutucu yok; doldurulmuş hâli kendisi.

### F4.B · sessiz gün, yol yok ya da bitti

VARSAYIM: "Yolun hazır" yalnız bitmemiş yol varken doğru; öteki günler için ayrı hücre.

1. **[F4B-1]** "Bugün senden bir şey istemiyorum." · kaynak §3 F4, ilk yarı
2. **[F4B-2]** "Bugün söyleyecek yeni bir şeyim yok."
3. **[F4B-3]** "Bugün sessizim."
4. **[F4B-4]** "Bugün yeni bir haber yok; gün senin."
5. **[F4B-5]** "Bugün sana bir şey eklemiyorum."
6. **[F4B-6]** "Bugün benden yeni bir not yok."
7. **[F4B-7]** "Bugün kısa konuşuyorum: gün senin."

### F4.C · uzun aradan dönüş, uygulama düzeyinde

**Ne zaman:** 5 gün ya da daha uzun aradan sonra ilk açılış, §4.5. Tek cümle, sonra Nef o gün susar. "Seni özledik" ve
suçlama yok; ara gün sayısı söylenmez.
VARSAYIM: 3–13 günlük aradan sonra yolun başında onaylı cümle 3 "Kaldığın yerden: basamakların aynı." yazılıyorsa kart
bu hücreyi yazmaz; aynı haber iki kez olmaz. 14 gün ve üstünde basamak bir gün iner, `dayLead.js` `SOFT_GAP`; bu yüzden
hiçbir değişke "basamakların aynı" demez.

1. **[F4C-1]** "Hoş geldin; bugün nereden başlayacağın sende."
2. **[F4C-2]** "Ara vermek de yolun parçası; bugün buradan sürüyor."
3. **[F4C-3]** "Yeniden buradasın; yolun hazır."
4. **[F4C-4]** "Hoş geldin; bugün kısa bir durak da yeter."
5. **[F4C-5]** "Hoş geldin; bugün her şey kendi hızında."
6. **[F4C-6]** "Hoş geldin; yolun bugün ilk durağından başlıyor."
7. **[F4C-7]** "Hoş geldin; geçmiş kayıtların yerinde, yolun hazır."

### F4.D · düşük WHO-5

Yeni cümle yazılmadı. Plan §4.5: Nef öneri ve neşe cümlesi kurmaz, yalnız onaylı sabit satır görünür. Satır
`lib/who5.js` `WHO5_TEXT.tr.low`, harfi harfine:

> "Bu bir tanı değil. İyi oluşun bir süredir düşükse bir sağlık uzmanıyla konuşmak iyi gelebilir."

Not: satırdaki "iyi gelebilir" sabit ve dokunulmaz, DEVİR "Doktor ve WHO-5 cümleleri sabit kalır". "İyi geldi" yasağı F2
içindir; bu satır an motoruna girmez. Bugün bu satır yalnız Gelişim'de, `ProgressOverview.jsx`, görünüyor. VARSAYIM:
Nef kartında da aynı satır gösterilir.

---

## 5. Genel an türleri, §4.8

**Nerede:** hepsi Ana sayfa Nef kartı. Bildirim yok: Nef'in kendi bildirimi yalnız hava–saat, söz ve mektupta gelir, §4.2.
**Kaynak:** manifest `progress` alanı, `growthCenter`, `acuteEffects`, `metricTrend`, `verifiedChange`, `progression`.
`metricBest` ve `ladderStep` ayrı Nef kartı olmaz, §9; burada cümlesi yok.

### 5.1 `metricChange` · doğrulanmış değişim

**Ne zaman:** §4.8: yalnız `verifiedChange` ya da `meaningful` eşiği geçilince.
VARSAYIM: yalnız `better` yönündeki değişim söylenir; kötüleşme Gelişim'de kalır, Nef söylemez.
Canlı metrikler, manifestlerden: Hızlı Bakış `quick-look-threshold` ms, aşağı · Tek Bakışta `tek-bakis-span` harf,
yukarı · Fark Ettin mi? `street-noticed` yüzde, yukarı · Bugünün görevi `notice-count` kez, yukarı · Yön
`yon-ayna` /5, yukarı · yoga `yoga-uyku-dalma` puan, yukarı. Göz ölçümleri girmez: §4.1 ölçüm ve tehlike uyarısı an
motoruna girmez, bildirimde görme sonucu yok. `breath-count` emekli, `reading-cps` henüz kayıtlı değil.
Örnek veri: Tek Bakışta, 4 → 6 harf; Hızlı Bakış, 120 → 80 milisaniye.

1. **[MC-1]** `{modül:LOC} son iki haftada ortalaman {fark} {birim} {yönFiil}.`
   Örnek: "Hızlı Bakış oyununda son iki haftada ortalaman 40 milisaniye kısaldı."
   Kaynak §4.8 örneği "Okunuş bulmada son iki haftada ortalaman 3 saniye kısaldı." kalıba çevrildi.
2. **[MC-2]** `{modül:LOC} {metrik} {başlangıç:ABL} {şimdi:DAT} {yönFiil}.`
   Örnek: "Tek Bakışta oyununda kavradığın harf sayısı 4'ten 6'ya çıktı."
3. **[MC-3]** `Fark ölçüm payını geçti: {modül:LOC} {metrik} {başlangıç:ABL} {şimdi:DAT} {yönFiil}.`
   Örnek: "Fark ölçüm payını geçti: Hızlı Bakış oyununda algı eşiğin 120 milisaniyeden 80 milisaniyeye indi."
4. **[MC-4]** `{modül:LOC} başta {başlangıç} {birim}, şimdi {şimdi} {birim}.`
   Örnek: "Tek Bakışta oyununda başta 4 harf, şimdi 6 harf."
5. **[MC-5]** `{Metrik} değişti: {modül:LOC} {başlangıç:ABL} {şimdi:DAT}.`
   Örnek: "Algı eşiğin değişti: Hızlı Bakış oyununda 120 milisaniyeden 80 milisaniyeye."
6. **[MC-6]** `İki ayrı haftada aynı sonuç: {modül:LOC} {metrik} {başlangıç:ABL} {şimdi:DAT} {yönFiil}.`
   Örnek: "İki ayrı haftada aynı sonuç: Tek Bakışta oyununda kavradığın harf sayısı 4'ten 6'ya çıktı."
7. **[MC-7]** `{modül} turlarında değişim yerleşti: {metrik} artık {şimdi} {birim}.`
   Örnek: "Tek Bakışta turlarında değişim yerleşti: kavradığın harf sayısı artık 6."

### 5.2 `firstTime` · bir modülde ilk kayıt

**Ne zaman:** §4.8 "İlk kayıt". VARSAYIM: kaydın günü ya da ertesi gün kartta; "Bugün" diyen değişke yalnız aynı gün.

#### firstTime.A · sayısız

1. **[FT-1]** `İlk {modül:POSS} tamam.`
   Örnek: "İlk yoga dersin tamam." · kaynak §4.8, aynen
2. **[FT-2]** `{modül:ACC} ilk kez denedin.`
   Örnek: "Yılan oyununu ilk kez denedin."
3. **[FT-3]** `İlk kaydın yazıldı: {modül}.`
   Örnek: "İlk kaydın yazıldı: Gökyüzü molası."
4. **[FT-4]** `{alan} alanına ilk gün yazıldı: {modül}.`
   Örnek: "Dikkat alanına ilk gün yazıldı: Yılan oyunu."
5. **[FT-5]** `{modül} için ilk kayıt bugün.`
   Örnek: "Yılan oyunu için ilk kayıt bugün."
6. **[FT-6]** `{modül:LOC} ilk günün geride kaldı.`
   Örnek: "Yılan oyununda ilk günün geride kaldı."

#### firstTime.B · ilk ölçüm ya da ilk önce–sonra puanı

VARSAYIM: önce–sonra değişkesi yalnız iyi yönde ya da değişim yoksa kurulmaz; kötü yönde ilk seans söylenmez.

1. **[FTB-1]** `{modül:LOC} ilk ölçümün {başlangıç} {birim}. Sonrakiler buna göre okunacak.`
   Örnek: "Tek Bakışta oyununda ilk ölçümün 4 harf. Sonrakiler buna göre okunacak."
2. **[FTB-2]** `Başlangıç sayın belli oldu: {modül:LOC} {başlangıç} {birim}.`
   Örnek: "Başlangıç sayın belli oldu: Tek Bakışta oyununda 4 harf."
3. **[FTB-3]** `İlk {modül} seansında {ölçü} puanın önce {önce}, sonra {sonra}.`
   Örnek: "İlk Gökyüzü molası seansında dinlenmişlik puanın önce 3, sonra 6."
4. **[FTB-4]** `İlk {modül:POSS-ABL} sonra {ölçü:POSS} {önce:ABL} {sonra:DAT} {yönFiil}.`
   Örnek: "İlk Gökyüzü molandan sonra dinlenmişliğin 3'ten 6'ya çıktı." · **Ek**: iyelik ve ayrılma birlikte
5. **[FTB-5]** `{modül} ilk kez: {metrik} {başlangıç} {birim}.`
   Örnek: "Hızlı Bakış oyunu ilk kez: algı eşiğin 120 milisaniye."
6. **[FTB-6]** `Bundan sonraki her {modül} turu bu ilk sayıyla karşılaştırılacak: {başlangıç} {birim}.`
   Örnek: "Bundan sonraki her Tek Bakışta turu bu ilk sayıyla karşılaştırılacak: 4 harf."

### 5.3 `returnAfterGap` · bir modüle uzun aradan dönüş

**Ne zaman:** §4.8 "Uzun ara". Plan bu an için onaylı cümle 3'ü veriyor: "Kaldığın yerden: basamakların aynı." Bu cümle
`dayLead.js` `NEF.back` olarak zaten var ve yalnız yol için, 3–13 gün. Modül düzeyinde "basamak" her modülde yok ve 14
günden sonra doğru değil; bu yüzden yeni değişkeler. VARSAYIM eşik: o modülde 14 gün ve üstü ara.
Gün sayısı yazılmaz: suçlama gibi okunabilir.

1. **[RG-1]** `{modül} kaldığın yerde duruyor.`
   Örnek: "Dalga sesi kaldığın yerde duruyor."
2. **[RG-2]** `{modül:DAT} yeniden hoş geldin.`
   Örnek: "Dalga sesine yeniden hoş geldin."
3. **[RG-3]** `Bir aradan sonra {modül}; kayıtların olduğu gibi duruyor.`
   Örnek: "Bir aradan sonra Yılan oyunu; kayıtların olduğu gibi duruyor."
4. **[RG-4]** `{modül:ACC} yeniden açtın; önceki kayıtların Gelişim'de.`
   Örnek: "Tek Bakışta oyununu yeniden açtın; önceki kayıtların Gelişim'de."
5. **[RG-5]** `En son {modül:ABL} sonra {ölçü} puanın {önce:ABL} {sonra:DAT} {yönFiil:MIŞTI}.`
   Örnek: "En son Dalga sesinden sonra sakinlik puanın 4'ten 7'ye çıkmıştı."
   Yalnız `effects` olan modülde, son seans iyi yöndeyse ve bu olgu daha önce söylenmediyse, §4.4 kural 2.
   **Ek**: `{yönFiil:MIŞTI}` → "çıkmıştı", "inmişti", ünlü uyumu.
6. **[RG-6]** `{modül:LOC} son ölçümün {şimdi} {birim} idi; oradan devam.`
   Örnek: "Tek Bakışta oyununda son ölçümün 6 harf idi; oradan devam."

### 5.4 `drift` · hatırlatma saati ile gerçek saat farkı

**Nerede:** Ana sayfa kartı, soru ve iki düğme. **Ne zaman:** §3 F8: kişi iki haftadır hatırlatmadan farklı bir saatte
yapıyorsa Nef bir kez sorar; "Hayır" denirse 60 gün sorulmaz. §4.8 tablosu: `remind` saati ile gerçek saat farkı.
Dikkat: §8 F8'i N3'e koyuyor, ana oturum istemi `drift`'i N1 genel anlarına koyuyor; §10'a bak.
Örnek veri: nefes pratiği hatırlatması 20.00, gerçek saat çoğunlukla 22.00.

1. **[DR-1]** `{modül:ACC} son iki haftada çoğunlukla {usualAt:LOC} yaptın. Hatırlatmayı oraya alayım mı?`
   Örnek: "Nefes pratiğini son iki haftada çoğunlukla 22.00'de yaptın. Hatırlatmayı oraya alayım mı?"
   Kaynak §3 F8 ve §4.6 "drift". Düzeltme: "Nefesi" yerine modül türüyle "Nefes pratiğini".
2. **[DR-2]** `Hatırlatman {remindAt:LOC}, sen ise çoğunlukla {usualAt:LOC} başlıyorsun. Saati {usualAt:DAT} alayım mı?`
   Örnek: "Hatırlatman 20.00'de, sen ise çoğunlukla 22.00'de başlıyorsun. Saati 22.00'ye alayım mı?"
3. **[DR-3]** `{usualAt} senin {modül} saatin olmuş. Hatırlatmayı oraya alayım mı?`
   Örnek: "22.00 senin nefes pratiği saatin olmuş. Hatırlatmayı oraya alayım mı?"
4. **[DR-4]** `Son iki haftada {modül:ACC} en çok {usualAt} civarında açtın. Hatırlatma da o saate gelsin mi?`
   Örnek: "Son iki haftada Yılan oyununu en çok 21.30 civarında açtın. Hatırlatma da o saate gelsin mi?"
5. **[DR-5]** `{modül} için senin saatin {usualAt} gibi görünüyor. Hatırlatmayı oraya taşıyayım mı?`
   Örnek: "Gökyüzü molası için senin saatin 15.00 gibi görünüyor. Hatırlatmayı oraya taşıyayım mı?"
6. **[DR-6]** `{modül} hatırlatman {remindAt:LOC} geliyor; sen çoğunlukla {usualAt:LOC} açıyorsun. İkisini eşitleyeyim mi?`
   Örnek: "Dalga sesi hatırlatman 21.00'de geliyor; sen çoğunlukla 22.30'da açıyorsun. İkisini eşitleyeyim mi?"

#### drift · düğmeler ve onay satırı, kalıp

VARSAYIM: plan "tek dokunuşla taşınır" diyor, düğme metni vermiyor.

1. **[DRK-1]** Evet düğmesi: `Oraya al` · Örnek: "Oraya al"
2. **[DRK-2]** Hayır düğmesi: `Kalsın` · Örnek: "Kalsın"
3. **[DRK-3]** Onay satırı: `Hatırlatma artık {usualAt:LOC}.` · Örnek: "Hatırlatma artık 22.00'de."

### 5.5 `pathDone` · bugünkü yol bitti

**Ne zaman:** §4.1: `pathDone` = onaylı cümle 1 ve 5. Bu cümleler `dayLead.js` `NEF.yday`, `NEF.done`, ayrıca 30. gün
`NEF.month`; `homeSuggest.js` "Bugünkü yol tamam."; `today.js` `jevLine` "Bugünkü yol tamam." Hepsi mevcut, eşdeğerlikle
taşınır, yeniden yazılmadı. Kişi yolu bitirdiyse Nef o gün bildirim göndermez, §4.5.

Sorun: cümle 5 her gün aynıdır ve 21 gün kuralına uymaz. VARSAYIM: yol cümleleri §4.4 kural 3'teki "yol hariç" gereği
tekrar kuralının dışında kalır; yol alanındaki cümle 5 değişmez.

Ana sayfa Nef kartı için, yol alanındaki "tamam" haberini tekrar etmeyen, kişinin haftasından bir olgu söyleyen
değişkeler. VARSAYIM: plan bu kart cümlesini istemiyor; ana oturum düşürebilir. Koşul: bu hafta en az 2 tam gün, bugün
dâhil. "Bu hafta" takvim haftası mı son 7 gün mü belirsiz.
Örnek veri: bu hafta dört tam gün.

1. **[PD-1]** `Bu hafta yolu {n:SIRA} kez bitirdin.`
   Örnek: "Bu hafta yolu dördüncü kez bitirdin."
2. **[PD-2]** `Bu hafta {n:söz} gün yolun sonuna vardın.`
   Örnek: "Bu hafta dört gün yolun sonuna vardın."
3. **[PD-3]** `Bu hafta yedi günün {n:LOC-POSS} yol tamam.`
   Örnek: "Bu hafta yedi günün dördünde yol tamam." · biçim M5C "beş alanın dördünde"den
4. **[PD-4]** `Bugünle birlikte bu hafta {n:söz} tam gün.`
   Örnek: "Bugünle birlikte bu hafta dört tam gün."
5. **[PD-5]** `Bugün, bu hafta yolu bitirdiğin {n:SIRA} gün.`
   Örnek: "Bugün, bu hafta yolu bitirdiğin dördüncü gün."
6. **[PD-6]** `Bu hafta {n:söz} gün bütün durakları bitirdin.`
   Örnek: "Bu hafta dört gün bütün durakları bitirdin."

---

## 6. Ana sayfa Nef kartı · etiket

**Nerede:** kartın sol üstündeki küçük etiket. Bugün `CoachCard.jsx` "Bugün · Nef" yazıyor ve yanında "çevrimdışı öneri"
damgası var. Damga N1'de kalkar, ana oturum istemi madde 6; yerine metin gelmez.
VARSAYIM: etiket her gün değişmez; altı aday sahibin seçimi için. Kartın ayrı başlığı yok: M2'de ana cümle başlık işi
görüyor. Öneri: KET-1, çünkü M2 ve M5C bu etiketle kapıdan geçti.

1. **[KET-1]** "Nef" · M2 ve M5C, kapıdan geçti
2. **[KET-2]** `Nef · bu {dilim}` · Örnek: "Nef · bu akşam"
3. **[KET-3]** "Nef hatırlıyor" · yalnız F2 kartında
4. **[KET-4]** "Nef'ten kısa not"
5. **[KET-5]** "Nef · senin düzenin"
6. **[KET-6]** "Nef · bugün"

Mevcut "Bugün · Nef" yeni sayılmadı. "Nef düşünüyor" yükleme etiketi `CoachCard.jsx`'te ekran okuyucu metni; model
çağrısı kalkınca gereksiz kalır mı, bakmadım.

---

## 7. Mevcut Nef sesleri · yeniden yazılmadı, eşdeğerlikle taşınır

Bunlar yeni onay istemez; an motoruna üretici olarak, harfi harfine girer.
- `app/src/components/home/dayLead.js`: `LINES` ve `NEF` 1–16, `CHAPTER_PRIZE`. Onay dosyası
  `docs/yol-haritasi/tasarim/ana-sayfa/d9-karar/nef-cumleleri-onay.md`; dosyada 16 cümle var, plan "13" diyor: 13 ana
  ve 3 ek.
- `app/src/lib/homeSuggest.js`: `homeSuggestion` satırları ve `CALM`.
- `app/src/lib/today.js`: `jevLine` satırları ve `JEV_WORDS`.
- `app/src/lib/skyView.js` `nefLine` ve `app/src/lib/weatherNotify.js` `MORNING_TEMPLATES`: sabah havasının onaylı
  cümleleri. F1 bunların yerine geçtiği gün onaylı metin değişmez, yalnız o gün başka cümle seçilir.
- `app/src/lib/who5.js` `low`: §4.D.

---

## 8. Modül adları ve ölçü sözcükleri · `nef.name`, `nef.metricWords` için öneri

Bunlar da kullanıcıya görünür ve sahip onayı ister. Kaynak manifest `title` ya da `label`; kaynaksız olanlar VARSAYIM.

| Modül | Türlü ad | `:ABL` | `:ACC` | Kaynak |
|---|---|---|---|---|
| breath | nefes pratiği | nefes pratiğinden | nefes pratiğini | `label` |
| dalga | Dalga sesi | Dalga sesinden | Dalga sesini | §4.8, M2 |
| gokyuzu | Gökyüzü molası | Gökyüzü molasından | Gökyüzü molasını | `title` |
| yon | Yön yazı egzersizi | Yön yazı egzersizinden | Yön yazı egzersizini | VARSAYIM, `coach` satırındaki "Yazı egzersizi" |
| yoga | {ders} yoga dersi; genel: yoga dersi | Nefesin Ritmi yoga dersinden | yoga dersini | `label`; ders adıyla birleşim VARSAYIM |
| snake | Yılan oyunu | Yılan oyunundan | Yılan oyununu | `label`, 5sn |
| track | Çemberler oyunu | Çemberler oyunundan | Çemberler oyununu | VARSAYIM; `label` "çemberler" |
| quick-look | Hızlı Bakış oyunu | Hızlı Bakış oyunundan | Hızlı Bakış oyununu | VARSAYIM; tür sözcüğü kodda yok |
| tek-bakis | Tek Bakışta oyunu | Tek Bakışta oyunundan | Tek Bakışta oyununu | VARSAYIM; tür sözcüğü kodda yok |
| fark-ettin | Fark Ettin mi? oyunu | … | … | VARSAYIM; adın soru işareti cümle içinde sorun, §10 |
| notice | fark etme görevi | fark etme görevinden | fark etme görevini | `label` |
| awareness | Farkındalık merkezi | Farkındalık merkezinden | Farkındalık merkezini | `label` |
| blink | göz kırpma egzersizi | göz kırpma egzersizinden | göz kırpma egzersizini | `label` |
| routine | göz egzersizi | göz egzersizinden | göz egzersizini | `remindTexts.js` `NAMES` |
| mola | 1 dakikalık mola | 1 dakikalık moladan | 1 dakikalık molayı | `label` |
| water | su kaydı | su kaydından | su kaydını | `label` |
| daily, weekly, reading | kısa E testi, haftalık E testi, okuma testi | … | … | `label`; yalnız `firstTime` ve `returnAfterGap`, sayısız |
| who5 | iyi oluş soruları | … | … | `label`; yalnız `firstTime`, VARSAYIM |
| alarm | alarm | … | … | `label`; hangi genel anı üreteceği belirsiz, §10 |

Ölçü sözcükleri, `{ölçü}` → `{ölçü:POSS}`: sakinlik → sakinliğin · kendine güven → kendine güvenin · enerji → enerjin ·
dinlenmişlik → dinlenmişliğin · rahatsızlık → rahatsızlığın · gerginlik → gerginliğin · beden gerginliği → beden
gerginliğin · odak → odağın.

Metrik sözcükleri, VARSAYIM: `quick-look-threshold` "algı eşiğin", birim "milisaniye"; plan `ms` için "saniye" örneği
veriyor ama 80 ms "0,08 saniye" olur · `tek-bakis-span` "kavradığın harf sayısı", birim "harf" · `street-noticed` "fark
etme isabetin", yüzde · `notice-count` "fark ettiğin şey sayısı", birim yok · `yon-ayna` "Ayna puanın", ölçek sözü
yazılmaz, M4 dersi · `yoga-uyku-dalma` "uykuya dalma puanın", §10'a bak.

---

## 9. Denetim

Her cümle ve her doldurulmuş örnek tek tek okundu ve şu sözcüklerle tarandı: "sayesinde", "iyi geldi", "beyin", "tanı",
"yağacak", "malısın", "melisin", "hâlâ", "yine", "kaçırdın", "mutlaka", "hemen", "sakın", "zorunda", ünlem, emoji,
parantez, "°", gün adları, "özledik". Tarama bir betikle 151 doldurulmuş örneğin hepsinde yapıldı. Sonuç: 0. İlk taramada
çıkan iki şey düzeltildi: "hemen önce" yerine "biraz önce", çünkü "hemen" §3.5 listesinde; "haftanın" sözcüğü "tanı"
süzgecine takılabileceği için o cümle yeniden kuruldu. §4.D'deki sabit WHO-5 satırı "tanı" ve "iyi gelebilir" içerir;
dokunulmaz ve yeni değildir. Karakter sayıları doldurulmuş örneklerden:

| Hücre | En uzun doldurulmuş gövde, karakter | Sınır |
|---|---|---|
| F1.T | en uzun 30 | başlık 30 |
| F1.A–F1.E | en kısa 80, en uzun 108; M1C 92 | gövde 110 |
| F1, "Kaynak: Apple Weather" satırı da gövdeye sayılırsa | 88 ve altı yalnız 8 değişke: F1B-4, F1B-6, F1D-1, F1D-3, F1D-6, F1E-1, F1E-4, F1E-5; M1C sığmaz | gövde 110, `weatherNotify.js` `BODY_MAX` |
| F1 + F3.A birlikte | en kısa 120 | gövde 110: **hiçbir birleşim sığmıyor** |
| F3.B tek başına | en uzun 85 | gövde 110 |
| Kart cümleleri | en uzun yaklaşık 100; uzun modül adı, örneğin "Yön yazı egzersizi", cümleyi uzatır | plan sayı vermiyor; VARSAYIM 2 kısa cümle |

---

## 10. Özet

**Sayılar:** 25 hücrede 151 yeni metin. Bunların 136'sı an cümlesi; 9'u kalıp: F2.E açıklama 3, F2.F düğme 3, `drift`
düğme ve onay 3; 6'sı kart etiketi adayı. 16 tanesi plandan ya da kapıdan alınıp gerekiyorsa düzeltildi; 5'i kapıdan
geçmiş tasarımdan: F1T-1, F1A-1, F2A-1, F2E-1, KET-1. Kalan 135 tamamen yeni. Ayrıca F4.D hücresi mevcut sabit satırı
gösterir, yeni cümle yok.

**Planda belirsiz, VARSAYIM:**
1. F1 yürüyüş yağmurdan az önceyse ne denir: F1.B hücresi açıldı, §4.1 kuralından çıkarıldı.
2. F1 `{earlyAt}` hesabı: `rainFrom − 60 dk`, yuvarlanır, en az 30 dk sonra; olmazsa F1.C "içeride".
3. F1 "tekrar" ne demek: son 7 günde F1 söylendiyse.
4. F1 saati kurulu hatırlatmadan gelirse kişisel olgu sayılır mı: F1.E. Bugün 77xx ve 78xx'te yürüyüş hatırlatması var
   mı, bakmadım.
5. F1 Ana sayfa kartında da görünür mü: aynı gövde varsayıldı.
6. F1 gövdesi ve kaynak satırı: "Kaynak: Apple Weather" gövdeye sayılırsa M1C bile 110 sınırını aşar, §9. Hangi sınır
   geçerli, karar ana oturumda.
7. F3: F1 gövdesine yan cümle eklenince hiçbir birleşim 110 sınırına ve "bildirim en çok 2 satır" kuralına sığmıyor, en
   kısası 120. Plan yan cümle istiyor; ya sınır bu birleşim için değişir ya da F3 yan cümlesi F1'in öneri parçasının
   yerine geçer. Sıcaklık önerilen saatin hissedileni sayıldı. F3.B hangi bildirime eklenir: belirsiz; sabah havasında
   derece "°" ile yazılıyor, F3'te "derece".
8. F2 `better: down` ölçülerinde eşik ve fiil: `önce − sonra ≥ 2`, "inmişti"; kötüleşme yönünde an yok.
9. F2 açıklama satırı ve düğmeler 21 gün kuralına girmez.
10. F4 sessiz gün sık olursa 8 değişke 21 güne yetmez.
11. F4 dönüş cümlesi, yol alanında cümle 3 yazıldıysa kartta yazılmaz.
12. Düşük WHO-5 satırı Nef kartında gösterilir.
13. `metricChange` yalnız iyi yönde; göz ölçümleri girmez; Hızlı Bakış birimi "milisaniye".
14. `firstTime` zamanı ve kötü yönde ilk seansın susması; göz ölçümleri ve WHO-5 için yalnız sayısız cümle.
15. `returnAfterGap` modül eşiği 14 gün.
16. `drift`: plan §8 N3'e koyuyor, ana oturum istemi N1'e. Düğme metinleri planda yok.
17. `pathDone` kart cümleleri planda yok; yol cümleleri tekrar kuralı dışında sayıldı.
18. Kart etiketi her gün aynı kalır.
19. Modül tür sözcükleri: Yön, Çemberler, Hızlı Bakış, Tek Bakışta, Fark Ettin mi? için kodda tür sözcüğü yok. "Fark Ettin
    mi?" adının soru işareti cümle içinde okunuşu bozuyor.
20. `yoga-uyku-dalma`: §4.8 "Nef uyku hakkında yorum yapmaz" diyor, aynı bölüm yoganın uyku sorusunu Nef'in okuduğu
    listede sayıyor. Bu metrikte `metricChange` kurulup kurulmayacağı sahibe sorulmalı.
21. `alarm` modülünün hangi genel anı üreteceği: bakmadım; sözleşme testi her canlı modülde en az bir genel an istiyor.

**Planda olup N1 dışında kalanlar:** F5 mektup ve M4A, yedek mektup hücreleri, `coach` v2 rızası, bilgi bankası
`claims` ve bilim satırı, model sınavı: N2 · F6 söz `promiseKept`, F7 gün ışığı `daylight`, F8 düzen §8'e göre, F9 aylık
hikâye `firsts`, F11 takvim anları: N3 · F10 yürüyüş eşliği ve "evden çıktın", sohbet: N4 · İngilizce bankası: N5 ·
`metricBest` rekor kartı ve `ladderStep` basamak kartı: Nef kartı olmaz · su tek başına bir an değil, M3 · M5C "Beş alanın
dördünde çalıştın. Sırada Dikkat var." kapıdan geçti ama plan bunu hiçbir an türüne bağlamıyor; hücre açılmadı · gelecekteki
Sayı hafızası ve Okunuş bulma modülleri henüz canlı değil.
