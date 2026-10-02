# Metin Arama · ara rapor 1: araştırma ve sahibe sorular (2026-10-01)

Bu oturum yalnız tasarım, plan, maket ve ana oturum istemini yazar. Uygulama kodu yazılmaz. Bitiş saati: her aşama
en çok 90 dk (IS_AKISI_KURALLARI madde 1).

## 1. Okunanlar
- `SAHIP_ISTEGI.md` ve `sahip-ekran/` dört görüntü: giriş, iki metin ekranı, sonuç.
- `IS_AKISI_KURALLARI.md` tamamı; `HATA_GUNLUGU.md` kaynak kuralı: kaynak ezberden yazılmaz.
- `modules/registry.js` sözleşmesi, `modules/tek-bakis/manifest.js`, `lib/progress.js` ölçü kuralı v2 ve
  `V2_PARAMS`, `lib/changeText.js` `DIGITS`, `lib/sources.js` biçimi, Nef `PLAN.md` §4.8.
- `fark-ettin-mi` tasarım klasörü bu dalda yok; `origin/claude/fark-ettin-mi-plan` dalında. Oradaki
  `ANA_OTURUM_ISTEMI.md`'nin biçimi örnek alınacak.
- Depo kökünde `CLAUDE.md` yok. Bakmadığım: `growthCenter.js` ayrıntısı, `N1-CUMLELER-onay.md`, `lib/nef/bank`.
  Plan aşamasında okunacak.

## 2. Örnek uygulamadan alınan yalnız mantık
Kişiye bir kelime gösterilir, metinde bulur; süre sınırlıdır. Alınmayanlar: ad, büyüteç simgesi, koyu yeşil ve
turuncu düzen, "Bul" satırı, sayaç sayısı, Vikipedi metinleri, yıldız, puan, haftalık daire şeridi, puan grafiği.

## 3. Araştırmadan çıkan yön
Kaynaklar ve PMID'ler: `arastirma/KAYNAKLAR.md`. Özet:
1. **Ölçü: bulma süresi.** Doğru bulunan kelimelerin ortanca süresi, saniye, `better: 'down'`. Alıştırmayla arama
   süresi kısalır; ama hız ile doğruluk takas edilebilir. Bu yüzden süre yalnız doğru bulunanlardan; yanlış dokunuş
   ve kaçırma ayrıca sayılır ve sonuçta görünür.
2. **"Metinde yok" turları.** Bazı turlarda kelime metinde yoktur; kişi "Yok" der. Yokluğa karar vermek aramanın
   asıl parçasıdır.
3. **Zorluk Türkçenin ekleriyle büyür.** Kolay basamakta hedef tek ve ayrıktır. Zor basamakta aynı kökün başka
   ekli biçimleri çeldirici olur: "Türkiye'de" ararken "Türkiye'nin".
4. **Okuma iddiası yok.** Arama okumadan ayrı bir iştir; hızlı okuma vaadi bilimle uyuşmaz.
5. **Metinler:** 10 aday doğrulandı. Arılar sıfırı sıralıyor, filler birbirine adla sesleniyor, susuz bitki ses
   çıkarıyor, sıçanlar saklambaç oynuyor gibi. Sağlık iddiası ve korku yok.

## 4. Gelişim bağı önerisi
- `progress.domain: 'focus'`; metrik `metin-arama-time`, etiket taslağı "Kelime bulma süresi", birim `sn`,
  `better: 'down'`, `v2: { familiar: 2, sdFloor: 0.3 }`.
- VARSAYIM: `sn` birimi bugün yok. Bağlantı satırı gerekir: `changeText.js` `DIGITS.sn = 1` ve `progress.js`
  birim tabanı. Fark Ettin mi?'deki `nesne` satırı gibi, Gelişim sahibiyle sıraya konur.
- Karşılaştırılabilirlik: her metin 50–70 kelime, hedefler metnin baş, orta ve son üçte birine dengeli dağılır;
  tur başına aynı sayıda hedef. Böylece günden güne süre aynı işi ölçer.
- Nef: manifestte `nef` alanı; `evidence` yukarıdaki kaynak anahtarları; `metricWords`.

## 5. Sahibe sorular
Bkz. sohbet; cevaplar gelince bu bölüme yazılır.
