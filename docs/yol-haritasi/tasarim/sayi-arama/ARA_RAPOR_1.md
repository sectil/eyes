# Rakam ızgarası modülü · ara rapor 1: araştırma ve sahibe sorular (2026-10-01)

Bu oturum yalnız tasarım, plan, maket ve ana oturum istemini yazar. Uygulama kodu yazılmaz. Her aşama en çok 90 dk
(IS_AKISI_KURALLARI madde 1).

## 1. Okunanlar
- `SAHIP_ISTEGI.md` ve `sahip-ekran/` iki görüntü: oyun ekranı, sonuç ekranı.
- `IS_AKISI_KURALLARI.md` tamamı; `HATA_GUNLUGU.md` başlıkları ve kaynak kuralı.
- `modules/registry.js` sözleşmesi: `progress`, `remind`, `today`, `progression`, `coach`, `sessions`.
- `modules/tek-bakis/manifest.js`, `lib/progress.js` ölçü kuralı v2 ve `V2_PARAMS`, `UNIT_SD_FLOOR`,
  `lib/changeText.js` `DIGITS` ve hüküm sözcükleri, `lib/growthCenter.js` alanlar, `lib/ladders.js` `UNLOCK`.
- `lib/moduleRemind.js`: kimlik `7800 + gün × 20 + sıra`; bugün 7 modül + yol hatırlatması var, 20 yuvaya sığar.
- `lib/remindTexts.js`: her modül için 3 onaylı bildirim cümlesi ve `NAMES` satırı gerekir.
- `nef/PLAN.md` §4.8: `nef` alanı ve sözleşme testi. `lib/sources.js` biçimi ve anahtarları.
- Örnek yöntem: `origin/claude/fark-ettin-mi-plan` dalındaki tasarım klasörü; kardeş oturum
  `origin/claude/metin-arama` ara raporu ve kaynakları.
- Bakmadığım: `N1-CUMLELER-onay.md` ayrıntısı, `lib/nef/bank`, Hatırlatmalar ekranının kodu. Plan aşamasında okunacak.

## 2. Örnek uygulamadan alınan yalnız mantık
Rakam ızgarasında verilen sayı dizisini bulmak. Bu mantık genel bir yöntemdir; kâğıt üstünde rakam tarama testleri
1980'lerden beri var (ruff1986).

Alınmayanlar: "Sayı Arama" adı, koyu yeşil ve turuncu düzen, 14 × 13 sıkışık ızgara, turuncu süre çubuğu ve köşedeki
büyük sayı, "Sayılar / Kalan" satırı, puan, beş yıldız, onay dairesi, puan çizgisi, "Tamamlanan alıştırmalar / En
yüksek puan / Ortalama puan" tablosu, "TAMAM" düğmesi.

## 3. Araştırmadan çıkan yön
Kaynaklar: `arastirma/KAYNAKLAR.md`, 14 kaynak, hepsi PMID ve DOI ile doğrulandı.

1. **Ölçü: bir diziyi bulma süresi.** Doğru bulunan dizilerin ortanca süresi, saniye, düşük daha iyi. Hız ile
   doğruluk takası var (heitz2014): yanlış işaret ayrı sayılır, süreye girmez, sonuçta görünür.
2. **Ölçü hep aynı işi ölçer.** Izgara boyu, dizi uzunluğu ve benzer çeldirici sayısı ölçü turunda sabittir.
   İlerleme turu uzatır, diziyi zorlaştırmaz. Böylece seviye değişince seri karışmaz. Fark Ettin mi?'deki "seviye
   değişince seri karışıyor" sorunu burada baştan yok.
3. **Benzer çeldiriciler.** Aranan 5324 ise ızgarada 5342, 5321 gibi yakın diziler de vardır (duncan1989).
   Sayıları her ızgarada aynıdır.
4. **Geniş aralık, yüksek karşıtlık.** Sıkışan rakamlar karışır (pelli2008); karşıtlık taramayı etkiler
   (toner2012). Telefonda en çok 8 sütun, iri rakam.
5. **Hedef hep var, kalan görünür.** Seyrek hedef kaçırılır (wolfe2005); kişi kaç tane kaldığını bilir.
6. **İddia yok.** Çalışılan iş hızlanır, günlük hayata geçtiği gösterilmedi (owen2010, simons2016). Sayı hafızası
   alıştırması da değildir (trevino2021).

## 4. Gelişim, Nef ve hatırlatma bağı önerisi
- `progress.domain: 'focus'` (Dikkat alanı). Metrik taslağı: anahtar `rakam-find`, etiket "Dizi bulma süresi",
  birim `sn`, `better: 'down'`, `v2: { familiar: 2, sdFloor: 0.3 }`.
- VARSAYIM: `sn` birimi bugün yok. Metin Arama da aynı birimi istiyor; `changeText.js` `DIGITS.sn = 1` ve
  `progress.js` `UNIT_SD_FLOOR.sn` tek satırla iki modüle birden girer. Ana oturum bir kez ekler.
- `remind: { route, window: 'move', science: ['sireteanu1995'] }`, `remindTexts.js`'e 3 cümle ve `NAMES` satırı.
- `nef`: ad çekimleri, `metricWords` (`sn` → "saniye"), `evidence`, `note`. Sözleşme testi için bankada en az bir
  onaylı genel cümle.

## 5. Sahibe sorular
Sohbette soruldu; cevaplar gelince buraya yazılır.

Sahip cevabı (2026-10-01): "senin önerin olsun mükemmel olacak". Kararlar: ad Rakam Avı; yolda 9. günden haftada
3 gün; geri sayım yok; kaydırarak işaretleme. Ayrıntı `PLAN.md` §8.
