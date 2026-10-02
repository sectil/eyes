# 5 saniye kapısı · tur 2 (2026-10-01)

Görüntüler `maket/tur2/`. Aynı beş kimlik, yeni ve bağımsız ajanlar (tur 1'i görmediler).

| Ekran | D1 | D2 | D3 | D4 | D5 | Sonuç |
|---|---|---|---|---|---|---|
| intro | E | E | E | E | E | **5/5 geçti** |
| play | E | H | H | H | E | 2/5 kaldı |
| found | E | E | E | E | E | **5/5 geçti** |
| result1 | H | H | H | H | H | 0/5 kaldı |
| result2 | E | H | E | E | H | 3/5 kaldı |

İki tur doldu (IS_AKISI_KURALLARI madde 5). Üçüncü tur yapılmaz; yöntem değişir ya da sahibe sorulur.

## Kalanların kökü

**play (2/5).** "Düz tablo, an canlı değil, hareket yok" (D2, D4); "camgöbeği kapsül ne, aranan kutularla aynı
renk" (D3, D5). İlki durağan görüntünün sınırı: kaydırmanın asıl hissi hareketle ve titreşimle gelir. Fark Ettin mi?
kapısında da aynı sonuç çıktı (beş durağan tur, `fark-ettin-mi/kapi/5sn-son.md`). İkincisi tasarım kusuru: düzeltilir.

**result1 (0/5, iki turda da).** Kök tasarımda: ilk günlerin sonucu "bekle" diyor. "8 gün oynayınca başlangıcın
belirir" bekleme odası gibi okunuyor (D4: "silme sebebi"); "başlangıç" sözcüğü üç kez geçiyor; boş grafik kutusu
kendisiyle çelişiyor (D5). Kişi "iyi mi yaptım" sorusunun cevabını alamıyor (D3). Gelişim kuralı ilk 8 günde hüküm
vermeyi yasaklıyor; doğru. Ama ekran hükmün yokluğunu anlatmaya çalışınca boşluk büyüyor.

**result2 (3/5).** Üç sayı çelişiyor gibi: bugünkü 4,1, "şimdi" 4,2 (son üç günün ortancası), çizgi 5,6 (başlangıç).
Ölçü kuralı açısından üçü de doğru; ekran hangisinin ne olduğunu söylemiyor.

## Bağlayıcı tasarım maddeleri (PLAN §5b'ye işlendi)
1. Kaydırma izi aranan kutulardan farklı renkte: aranan kutular nötr, iz teal; bulunan altın.
2. Sonuçta tek "bugün" sayısı büyük; başlangıç ve şimdi yalnız grafikte etiketli ("başlangıç 5,6", "son 3 gün 4,2").
3. İlk 8 gün: bekleme anlatılmaz. Ekran yalnız kişinin bugünkü olgusunu ve beş dizisini gösterir; "başlangıç"
   ilerlemesi tek küçük satır ("Başlangıç · 2/8 gün"). Boş grafik kutusu yok.
4. "ortanca" görünür metinde yok; etiket "Dizi başına süren".
5. "yanlış işaret" yerine anlaşılır söz (METINLER'de sahip onayına).
6. Kıvılcım süsü komşu rakamların üstüne binmez (320).
7. Kapı bundan sonra gerçek kodda, hareketli kayıtla (PLAN §5b).
