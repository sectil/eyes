# 5 sn kapısı · tur 1 (2026-10-02)

Görüntüler `maket/tur1/` (7 ekran × 2 tema × 390/320). İstem `degerlendirici-istemi.md`. Değerlendiriciler:
D1 62 yaşında emekli Türkçe öğretmeni · D2 29 yaşında mobil oyun arayüz tasarımcısı · D3 43 yaşında muhasebe müdürü ·
D4 20 yaşında üniversite öğrencisi · D5 36 yaşında ergoterapist.

| Ekran | D1 | D2 | D3 | D4 | D5 | Sonuç |
|---|---|---|---|---|---|---|
| giris | H | H | E | H | H | 1/5 kaldı |
| goster | E | H | E | E | E | 4/5 geçti |
| yaz | E | E | H | H | E | 3/5 kaldı |
| dogru | E | H | H | H | E | 2/5 kaldı |
| yanlis | H | H | H | H | H | 0/5 kaldı |
| sonuc | H | H | H | H | H | 0/5 kaldı |
| sesizin | E | E | E | E | E | 5/5 geçti; anlaşılırlık 5/5 |

Ortak bulgular:
1. giris: 320'de iddia sınırı cümlesi yok (maket `hide320` ile gizlemişti: hata). Cümle "savunmacı", "edilgen" bulundu.
2. yanlis: maket hatası, kişinin yazdığı "fener" doğrusuyla aynıydı; neyin yanlış olduğu görünmüyor. "Yakındı" belirsiz;
   "yavaşlıyoruz" (biz) öteki ekranlardaki "sen" diliyle uyuşmuyor.
3. sonuc: 320'de grafik eziliyor, başlık kırılıyor, "Bana hatırlat" yok. "UZUN = HIZLI" şifre gibi. 183 ms ile "en hızlı
   doğru 133 ms" çelişkili görünüyor; "İki kelimeyi bu sürede yakaladın" başarıyı abartıyor (D5). "3/8 gün" belirsiz.
4. dogru: ödül anı sönük; geri bildirim giriş kutusuna benzeyen düz kutuda.
5. yaz: "Ne gördün?" soluk; ok düğmesi ile klavyedeki "Gönder" iki gönderme yolu.
6. goster: klavyenin baştan açık olması "an" hissini bölüyor (4 kişi). Karar: klavye açık kalır (her denemede ekran
   zıplamasın, kelime hep aynı yerde çıksın); sahne baskın kalır.
7. sesizin: "hiçbir yere gönderilmez" ancak teknik olarak garantiyse yazılmalı (D5) → PLAN §6 `strictOnDevice` bunu
   garanti eder; izni geri alma yolu eklenmeli.

Tur 2 değişiklikleri: `5sn-tur2.md`.
