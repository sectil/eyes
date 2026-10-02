# Rakam Avı · plan (sürüm 1, 2026-10-01)

Rakam ızgarasında aranan sayı dizisini bulma alıştırması. Sahip kararı (2026-10-01, "senin önerin olsun mükemmel
olacak"): ad, yol yeri, geri sayım ve işaretleme biçimi bu plandaki önerilerdir. Kaynaklar `arastirma/KAYNAKLAR.md`;
metinler `METINLER.md`; maket `maket/`; kapı kayıtları `kapi/`.

Uygulama kodunu ana oturum yazar (`ANA_OTURUM_ISTEMI.md`). Bu plan yalnız tasarımdır.

## 0. Tek bakışta

| Konu | Karar |
|---|---|
| Ad | **Rakam Avı**. Nef cümlesinde "Rakam Avı oyunu" değil "Rakam Avı" (alıştırma; tür sözü METINLER N bölümü) |
| Kimlik | `id: 'rakam-avi'`, `routes: ['rakam-avi']`, `ring: 'attention'`, `kind: 'practice'` |
| Tur | Tek ızgara, 5 dizi, ≈ 1–2 dk. Geri sayım yok |
| İşaretleme | Parmak dizinin ilk rakamından son rakamına kaydırılır. Dokunarak tek tek seçilmez |
| Ölçü | Doğru bulunan dizilerin bulma süresi, ortanca, saniye, düşük daha iyi |
| Gelişim | `progress.domain: 'focus'` → Dikkat alanı. Ölçü kuralı v2 |
| Yol | 9. günden; haftada 3 gün; 2 dk; Tek Bakışta ile aynı bölüm |
| Hatırlatma | `remind` alanı: kendi rotası, `move` penceresi, kaynak `sireteanu1995` |
| Nef | `nef` alanı: ad çekimleri, `metricWords`, `evidence`, `note`; bankada onaylı genel cümle |

### Neden kopya değil
Alınan yalnız mantık: ızgarada sayı dizisi bulmak. Bu, 1980'lerden beri kâğıt üstünde bilinen bir tarama yöntemidir
(ruff1986). Örnek uygulamadan farkı:

| Örnek uygulama | Rakam Avı |
|---|---|
| 14 × 13 sıkışık ızgara, küçük rakam | 8 × 10, iri rakam, geniş aralık (pelli2008) |
| Turuncu geri sayım çubuğu, köşede büyük puan | Geri sayım yok; süre arka planda; bulunan dizi kalıcı ışıkla işaretlenir |
| Dokunarak seçme | Kaydırarak işaretleme: dizinin üstünde ışıklı iz |
| Puan, beş yıldız, puan çizgisi, en yüksek ve ortalama puan | Puan ve yıldız yok. Kişinin kendi bulma süresi, kendi başlangıcıyla, Gelişim'in dört sözcüğüyle |
| Rastgele rakamlar | Her ızgarada aynı sayıda benzer çeldirici (duncan1989): aranan 7061 ise 7016, 7601 gibi |
| Tek tür | Hedef sayısı her ızgarada aynı ve görünür (wolfe2005); "Göster" ile kaçan diziler öğretilir |

## 1. Tur yapısı

1. **Giriş** (yalnız ilk 3 turda tam; sonra tek satır): aranan diziyi kaydırarak bulma anlatılır. İddia sınırı
   cümlesi burada ve bilim kartında.
2. **Izgara.** Üstte aranan dizi, 4 rakam, büyük. Altında 5 küçük halka: bulundukça dolar. Izgara 8 sütun × 10 satır
   = 80 rakam.
3. **Kaydırma.** Parmak bir rakama değince iz başlar; yatayda sağa doğru uzar. Parmak kalkınca:
   - İz 4 rakamı tam kaplıyor ve aranan diziyse: iz altın ışığa döner, halka dolar, kısa titreşim (cihaz izin
     veriyorsa). Ses yok.
   - Değilse: iz 300 ms kırmızımsı titrer, söner. Yanlış kaydırma sayılır. Süre durmaz.
   - 1–3 rakamlık iz sayılmaz, yanlış da sayılmaz: sessizce söner.
4. **Bitiş.** 5 dizi bulununca tur biter. Kişi 90 sn sonra "Göster"e basabilir: kalan diziler sırayla yanar,
   bulunmamış sayılır. "Göster" 90 sn'den önce görünmez (chun1996: arama erken bırakılmasın).
5. **Sonuç** (§5).

Yön: ilk sürümde diziler yalnız soldan sağa, tek satırda. Satır sonundan taşan dizi yok. VARSAYIM: dikey ya da
ters yön ölçüyü karıştırır; ilk sürüme girmez.

## 2. Izgara üretimi (saf işlev, tohumlu)

`lib/rakamAvi.js` → `makeGrid(seed)`:
- Aranan dizi: 4 rakam; ilk rakam 0 değil; aynı rakam art arda iki kez yok (ör. 7061 olur, 7761 olmaz).
- 5 hedef: farklı satırlarda; aynı satırda iki hedef yok. Satırlar ızgaranın üst, orta ve alt bölgelerine dengeli
  dağılır (üst 3, orta 4, alt 3 satırdan en az birer hedef).
- 6 benzer çeldirici: aranan diziden bir komşu yer değiştirmesi (7016, 0761) ya da tek rakam farkı (7068). Hiçbiri
  aranan diziyle aynı olamaz.
- Kalan hücreler rastgele; üretimden sonra tarama: aranan dizi tam 5 kez geçer (fazlası varsa o hücre yeniden çekilir).
- Aynı tohum aynı ızgarayı verir (test edilir).

Ölçü bu sabitlerle karşılaştırılabilir kalır: her turda aynı boy, aynı hedef ve çeldirici sayısı. İlerleme ızgarayı
zorlaştırmaz (§3).

## 3. İlerleyiş

Seviye yok; ölçü bozulmasın diye zorluk sabit. Çeşitlilik ve ilerleme hissi şuradan gelir:
- Her tur yeni dizi ve yeni ızgara.
- Kişinin kendi süresi: sonuçta "bugünkü ortancan" ve Gelişim hükmü.
- Nef'in kişiye özgü cümleleri (§4.3).

`progression.unlock: { pathDay: 9 }` ve `lib/ladders.js` `UNLOCK['rakam-avi'] = 9`. VARSAYIM: 9. gün; 7. gün Tek
Bakışta, 5. gün Fark Ettin mi? açılıyor; aynı haftaya üçüncü yeni dikkat işi gelmesin.

`today()`: son 7 günde 3 günden az yapıldıysa 2 dk'lık durak; `slot: 'body'`, `glyph: 'grid'` (yeni simge, view.jsx),
`rotate: 'week3'`, `dropRank` Tek Bakışta'dan sonra. Tek Bakışta ile aynı gün iki göz-dikkat durağı çıkıyorsa bugünkü
`week3` dönüşümü birini düşürür (ana oturum `today.js`'i denetler; HATA_GUNLUGU Bug 35 düzeltmesi bozulmaz).

`gates: { eyeBudget: 'eye' }` (ekrana bakış işi; Tek Bakışta ile aynı). Yanıp sönen uyarı yok; epilepsi sorusu
gerekmez.

## 4. Ölçüm, Gelişim, Nef, hatırlatma

### 4.1 Kayıt
```
{ type: 'rakam-avi', date, seed, target: '7061', found: 4, targets: 5, wrong: 2, revealed: 1,
  findMs: [6120, 4380, 9050, 5210], medianMs: 5665, seconds: 74 }
```
- `findMs`: her doğru dizi için, bir önceki bulma anından (ilk dizide ızgaranın görünmesinden) parmağın kalktığı ana
  kadar. Yanlış kaydırmalar süreyi durdurmaz.
- `medianMs`: `findMs` ortancası; 2'den az dizi bulunduysa `null` (tek değer ölçü sayılmaz).
- `wrong`: yanlış kaydırma sayısı (4 haneyi kaplayıp aranan dizi olmayan iz). Ekranda "yanlış kaydırma".

### 4.1b İlk 8 günün sonucu (sahip kararı 2026-10-02, ikinci: "onay")
- İlk karar "önceki turla kıyas" tur 3'te 0/5 kaldı: kalabalık, tek tur kıyası gürültüden ayrılamıyor, bulunamayan dizi
  dışarıda kalınca kişi hızlanmış görünüyor (`kapi/5sn-tur3.md`). Sahip sade öneriyi onayladı.
- İlk 8 ölçüm gününde sonuç ekranı kıyas yapmaz ve başlangıçtan söz etmez: büyük sayı, beş dizi, yanlış kaydırma,
  Nef satırı, günün küçük ızgarası (320'de gizli), Bana hatırlat, Tamam.
- 8. günden sonra hüküm sözcüğü ve 14 günlük grafik gelir (result2, tur 3'te 5/5).

### 4.2 Gelişim (`progress`)
```
progress: {
  domain: 'focus',
  metrics: [{
    key: 'rakam-avi-find', label: 'Dizi bulma süresi', unit: 'sn', better: 'down',
    v2: { familiar: 2, sdFloor: 0.3 },
    series: ({ sessions }) => sessions.filter(isRakam).filter((s) => s.medianMs != null)
      .map((s) => ({ date: s.date, value: Math.round(s.medianMs / 100) / 10 })),
  }],
}
```
- Ölçü kuralı v2 kendiliğinden: günlük ortanca, ilk 2 gün alışma, sonraki 6 ölçüm günü başlangıç, Pazartesi bakışı,
  iki bakış süren fark. Ekran yalnız dört hüküm sözcüğünü yazar.
- `sdFloor: 0.3` sn VARSAYIM (Metin Arama ile aynı taban; ilk ay gerçek veriyle bakılır).
- **Birim bağı (ana oturum, bir kez):** `changeText.js` `DIGITS.sn = 1`; `progress.js` `UNIT_SD_FLOOR.sn = 0.3`.
  Metin Arama aynı birimi kullanır; iki modül tek satırı paylaşır.
- Doğruluk ölçü değildir ama görünür: sonuçta ve `stats()`'ta "yanlış kaydırma" sayısı (heitz2014).
- `stats()`: "Dizi bulma · son" (sn), "Tur · 7 gün", "Yanlış kaydırma · son tur".
- `coach()`: `find7` (son 7 günün turlarının `medianMs` ortancası, sn), `rounds7`, `wrong7`. Tek Bakışta `span7`
  ilkesiyle aynı (en iyi tur değil ortanca).

### 4.3 Nef (`nef` alanı, PLAN §4.8)
```
nef: {
  name: { yalin: 'Rakam Avı', i: "Rakam Avı'nı", e: "Rakam Avı'na", de: "Rakam Avı'nda", den: "Rakam Avı'ndan" },
  metricWords: { 'rakam-avi-find': { unit: 'saniye' } },
  evidence: ['sireteanu1995', 'wolfe2017'],
  note: 'Rakam ızgarasında 4 haneli diziyi bulma; ölçü doğru bulunan dizilerin bulma süresi (sn, düşük iyi).',
}
```
- VARSAYIM: `name` alt anahtarları bankanın ek tablosuna göre ana oturumda düzeltilir (`lib/nef/` okunmadı).
- Genel anlar kendiliğinden: `firstTime`, `metricBest` (en kısa günlük ortanca), `metricChange` (yalnız v2 hükmü
  "başlangıcından iyi" iken), `returnAfterGap`.
- Modüle özel cümleler METINLER N bölümünde; bankada `rakam-avi` kimliğiyle.
- Sözleşme testi: an üretilir, çekimler doğru, `evidence` anahtarları `sources.js`'te PMID ve DOI ile var, bankada
  onaylı genel hücre var.

### 4.4 Hatırlatma (`remind`)
```
remind: { route: 'rakam-avi', window: 'move', science: ['sireteanu1995'] }
```
- `remindTexts.js`: `'remind.rakam-avi'` üç cümle (METINLER H), `NAMES['rakam-avi'] = 'Rakam Avı'`.
- Kimlik: `7800 + gün × 20 + sıra`; bugün 8 yuva dolu, 20'ye sığar.
- Kişi kurar: Profil → Bildirimler ve modül bitişindeki "Bana hatırlat" satırı (`ctx.remindField(route, { inPath })`;
  yoldan açılınca satır çıkmaz).
- **Dikkat:** bugünkü kodda iki bayrak kapalı: `App.jsx` `REMIND_ROW = false`, `NOTIFY_PAGE = false`. Yani `remind`
  alanı doğru yazılsa da kişi bugün kuramaz. Bayrakları açmak bu modülün işi değil; ana oturum sahibin bildirim
  kararını izler. Sonuç ekranı satırın yerini hazır tutar (maket `result` ekranında görünür).

### 4.5 Kaynaklar (`lib/sources.js`)
Eklenecek: `sireteanu1995`, `wolfe2017`, `wolfe2021`, `chun1996`, `wolfe2005`, `duncan1989`, `treisman1980`,
`pelli2008`, `heitz2014`, `owen2010`, `simons2016`. Metin Arama ile ortak olanlar bir kez girer. `finding` alanı
yalnız METINLER B bölümündeki onaylı cümlelerden.

## 5. Ekranlar

Maket: `maket/maket.html?s=<ekran>&theme=<light|dark>`. Görüntüler `maket/<tur>/`.

| Ekran | İçerik |
|---|---|
| `intro` | Ad, aranan dizi örneği, kaydırma anlatımı (çizimle), "2 dk · 5 dizi", Başla, iddia satırı |
| `play` | Aranan dizi, 5 halka (2 dolu), ızgarada 2 altın iz, parmak altında yarım teal iz |
| `found` | Yeni bulunan dizi parlıyor, halka doluyor, "Buldun · 3/5" |
| `result1` | İlk 8 gün: "Dizi başına süren" büyük sayı, yanlış kaydırma çipi, beş dizi kapsülü ve süreleri, Nef satırı, günün küçük ızgarası, Bana hatırlat, Tamam |
| `result2` | 8. günden sonra: büyük sayı, beş kapsül, "başlangıcından iyi", 14 günlük grafik (kesik çizgi "başlangıç 5,6", son nokta "bugün 4,1"), Nef satırı, Tamam |

Son hâl: `maket/maket.html`, görüntüler `maket/son/`. Kapıdan geçenler intro ve found (tur 2 hâli, son hâlde
değişmedi). play, result1, result2 son hâlleri kapı maddelerine göre düzeltildi ama **kapıdan geçmedi**; kapıları
gerçek kodda yapılır (§5b).

Tasarım dili Nefona'nın kendisi: Onest ve Unbounded, teal–mavi vurgu, altın bulunan iz; iki tema. Kart gölgesi ve
yuvarlaklık Ana sayfa ile aynı aile.

## 5b. Kapı sonuçları ve bağlayıcı maddeler

İki tur (`kapi/5sn-tur1.md`, `kapi/5sn-tur2.md`):

| Ekran | Tur 1 | Tur 2 | Durum |
|---|---|---|---|
| intro | 4/5 | 5/5 | geçti (tur 2 hâli: `maket/tur2/intro-*`) |
| found | 3/5 | 5/5 | geçti (tur 2 hâli) |
| play | 3/5 | 2/5 | tur 3: **4/5 geçti** (`maket/son/play-*`) |
| result1 | 0/5 | 0/5 | tur 3: 0/5; tur 4 (sade hâl): 390'da 3/5, 320'de 0/5, kaldı. Bağlayıcı maddeler `kapi/5sn-tur4.md`; kapı kodda |
| result2 | 3/5 | 3/5 | tur 3: **5/5 geçti** (`maket/son/result2-*`) |

Tur 3 sahip isteğiyle, yeni beş kimlikle yapıldı (`kapi/5sn-tur3.md`).

Bağlayıcı maddeler `kapi/5sn-tur2.md` sonundaki 7 madde. Yöntem değişikliği: `play` ve sonuç ekranlarının kapısı
gerçek kodda, hareketli ekran kaydıyla yapılır (Fark Ettin mi? kararıyla aynı). result1 için sahip kararı §4.1b.

## 6. Aşamalar (ana oturum uygular)

| # | İş | Dosyalar |
|---|---|---|
| R1 | Saf mantık: ızgara, kaydırma çözümü, kayıt, ortanca | `lib/rakamAvi.js` + test |
| R2 | Ekranlar ve CSS | `modules/rakam-avi/view.jsx`, `screens/RakamAvi.jsx`, `styles/rakamavi.css` |
| R3 | Manifest: progress, sessions, today, progression, coach, stats, remind, nef | `modules/rakam-avi/manifest.js` |
| R4 | Bağlar: birim `sn`, `UNLOCK`, kaynaklar, bildirim metinleri, Nef bankası | `changeText.js`, `progress.js`, `ladders.js`, `sources.js`, `remindTexts.js`, `lib/nef/bank` |
| R5 | 5 saniye kapısı gerçek kodla; cihaz denetimi | `kapi/` |

## 7. Riskler

| Risk | Önlem |
|---|---|
| Kaydırma küçük ekranda zor | Hücre en az 36 px; 320'de de ızgara 8 × 10 kalır (ölçü sabit), yalnız üst alan küçülür |
| Hız için rastgele kaydırma | Yanlış kaydırma sayılır ve sonuçta görünür; süreye girmez |
| Ölçü erken "iyi" der | v2: alışma 2 gün, sabit başlangıç, iki bakış |
| Aynı dizi akılda kalır | Her tur yeni tohum; dizi son 14 turda tekrar etmez |
| Metin Arama ile `sn` ve kaynak çakışması | Tek satır; ana oturum ikisini aynı işte birleştirir |

## 8. Kararlar
1. Ad Rakam Avı (öneriler: Rakam Avı, Dizi Avı, Rakam İzi; ilk bakışta en açık olanı).
2. Yolda 9. günden, haftada 3 gün.
3. Geri sayım yok.
4. Kaydırarak işaretleme.
5. Seviye yok; zorluk sabit, ölçü temiz.
6. İlk 8 günde sonuç ekranı kıyas yapmaz (§4.1b; sahip 2026-10-02, önceki tur kıyası tur 3'te kaldı).
