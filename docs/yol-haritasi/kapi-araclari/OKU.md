# Kapı araçları (5 saniye ve metin kapısı)

Ana oturumun kullandığı iş akışı (Workflow) betikleri. Geçici klasörden (scratchpad) buraya kopyalandı; içlerindeki
`/tmp/claude-0/...` yolları o oturuma aitti. Yeni oturumda yolları kendi scratchpad'ine göre değiştir, betiği
scratchpad'e kopyala ve `Workflow({scriptPath})` ile çalıştır.

- `metin-kapisi.js`: görünür metin kapısı. Girdi bir `.txt`: ilk paragraf bağlam, sonra `kimlik | nerede | metin`
  satırları. 5 kişi (persona) her satıra evet/hayır verir; geçme ≥ 4/5. Çıktı `{kimlik: {yes, n, why[]}}`.
- `ekran-dizisi-kapisi.js`: hareketli ekranın kayıttan alınmış 3 karelik dizileriyle 5 sn kapısı
  (`<an>-{390,320}-{acik,koyu}-{1,2,3}.png`).
- `maket-kapisi.js`: maket görüntüleriyle 5 sn kapısı.

Kurallar (IS_AKISI_KURALLARI.md ile birlikte):
- En çok 2 tur; sonra iki sürümden 5 sn ve mükemmellik ölçütüne göre en iyisi seçilir. Üçüncü tur ve yeni yöntem
  yok; seçilen sürüm geçmediyse sahibe sorulur (IS_AKISI_KURALLARI.md "Tur sınırı", sahip 2026-10-03).
- Her turdan önce yargıç açıklaması o turun tasarım notundan (TASARIM.md) yeniden yazılır. Eski açıklama yanlış
  sonuç verir (2026-10-02 hatası: "göz saati" kalkmıştı, açıklama hâlâ anlatıyordu).
- Metin listesi kapıya girmeden önce ilgili PLAN maddesiyle satır satır karşılaştırılır (2026-10-02 hatası: G2/G3
  PLAN'daki yakalama sorusuyla çelişiyordu).
- Kapıdan önce ölçüm: kenar hizası (tek yan boşluk), yatay/dikey taşma, kesik yazı, tek kalan kelime, sorulan
  şeyin karede görünmesi. Değerlendiricilerden önce bunlar ölçülür.
- Sonuç JSON'ları ilgili tasarım klasörünün `kapi/` altına kaydedilir.
