# 5 saniye kapısı · tur 2 (2026-10-02)

Maket tur 1 düzeltmeleriyle. Yeni beş bağımsız değerlendirici, aynı soru ve ölçüt.

| Ekran | D1 | D2 | D3 | D4 | D5 | Sonuç |
|---|---|---|---|---|---|---|
| giris | H | E | H | E | H | 2/5 ✘ |
| metin | H | H | H | H | H | 0/5 ✘ |
| soru | H | H | H | H | H | 0/5 ✘ |
| sonuc | H | H | H | H | H | 0/5 ✘ |
| sayilmadi | H | H | H | H | H | 0/5 ✘ |

## Tur 1'den kapananlar
320'de taşan düğme, kesik metin satırı, baş aşağı halka yazısı, soluk şıklar ve süs gibi duran halka artık söylenmedi.

## Yeni bulgular
1. **Ölü boşluk:**
   - Giriş 390'da kart ile alt not arasında 130–200 px boşluk kalıyor.
   - Soru 390'da şıklar ile düğme arasında 400 px boşluk kalıyor. Beş kişinin beşi söyledi.
2. **Geri bildirim:** "Doğru." seçilen şıktan kopuk, ekranın dibinde (D3, D4, D5).
3. **Okuma ekranı:**
   - "Metnin sonunda: Bitirdim" hapı düğme gibi görünüyor, dokunulacak sanılıyor (5/5).
   - Başlık `text-wrap: balance` yüzünden yarım genişlikte kırılıyor.
   - Ekran "sıradan metin sayfası", kimliği yok.
4. **Sonuç 320:**
   - "… 2 okuma / kaldı" tek kelimelik satır bırakıyor.
   - Nef cümlesi erken kırılıyor.
   - İç dairedeki yazılar kenara dayanıyor.
   - Onay rozetleri boşluklarda değil yayların ortasında, eşleşme belirsiz (D1).
5. **Giriş 320:** iç halkaların yazısı okunmuyor, süs olarak kalmalı ya da kalkmalı (D2, D3, D5).
6. **Sayılmadı:**
   - Tek eylem "Bitti". "Yeniden oku" yolu önerildi (D2).
   - VARSAYIM: aynı metni yeniden okumak ölçümü bozar. Önerim: yeniden okuma yok, yarın yeni metin.

## Karar
İki tur doldu (IS_AKISI_KURALLARI madde 5). Kural: yöntemi değiştir ya da sahibe sor. Maket sahibe gösterilmedi.

**Yöntem değişikliği:**
1. Değerlendiriciye gitmeden önce maket bir **ön denetim listesinden** geçer. Liste tur 1 ve tur 2'nin bütün
   bulgularından çıkar: ölü boşluk, yetim kelime, başlık kırılması, düğmeye benzeyen ipucu, iç daire boşluğu.
   Listeyi ölçen bir betik çalışır.
2. Okuma ve soru ekranlarına kimlik verilir:
   - Okuma ekranında konu rozeti ve kaynak satırı.
   - Soru ekranında şıklar başparmak bölgesinde; geri bildirim seçilen şıkkın içinde.
3. Sonra yeni yöntemle bir kapı turu. O da geçmezse sahibe sorulur.
