# Okuma hızı ve anlama · sahibin isteği

Tarih 2026-10-02 00.15. Sahibin sözleri, kelimesi kelimesine:

> "Okuma anlama testleri kullanıcı asla sıkılmaması lazım 4 Şb tstleri be mükemmel olaravj bursakş rmeneltede hız
> öelşğlpy e göz takibi gelişim Nef be modül mükemmel uyum içinde çalışmalı . Bu sistem kisanlınolanşlşe
> faklrınolamlı metin sabit olamamalı sıkıcı olmasın farklı olamalı. Mükemmel ve 5 saniye olmalı başka bir oturumda
> işi yaptıralım mükemmel olcak unutma. Metin de kd hız takibi ve sorularla kişi ölçülüyor gelişim merkezi Nef ve modül
> uyumu çok önemli . Kişi sıkılmamamlı testler tekrarı benzeris ve sıkıcı olmayan metinler olmalı pubmed ilgi çekici
> mahalleler olabilir . Yeni oturumsa yapalım işi"

Ekran görüntüleri `sahip-ekran/`: başka bir uygulamanın "k/d-Test" alıştırması. Kişi metni okur, "Bitti"ye basar
(okuma hızı kelime/dakika ölçülür), sonra metinle ilgili 4 soru gelir; sonuçta hız grafiği, ortalama hız ve
"hafıza" yüzdesi.

Ana oturumun okuması (bozuk yazılan yerler VARSAYIM, yeni oturum sahibe doğrulatır):
- Okuma hızı (kelime/dakika) ve anlama (metinden sonra sorular, VARSAYIM: 4 soru) birlikte ölçülür.
- Kişi asla sıkılmaz: metin sabit değil, her seferinde farklı; testler tekrar etmez, benzersiz. Metinler PubMed'deki
  ilgi çekici makalelerden, Nefona'nın kendi Türkçesiyle (kopya değil, kaynak PMID + DOI).
- Lisans sorunu yok: ad ("k/d-Test" dahil), görsel, düzen, puan ve yıldız sistemi alınmaz.
- VARSAYIM: "hız ... göz takibi" = okuma sırasında hız ve isteğe bağlı göz takibi; kamera kullanılacaksa sahibe
  sorulur, kamera görüntüsü telefondan çıkmaz.
- Gelişim merkezi, Nef ve modül mükemmel uyumlu; isteğe bağlı hatırlatma (sahibin genel kuralı).
- Var olan "okuma testi" modülü (rahat okunan en küçük yazı) ve Gelişim'deki `reading-cps` tanımıyla çakışma
  çözülmeli; Metin Arama oturumu da PubMed'den metin yazıyor: metin bankası ortak mı ayrı mı, entegrasyonda karar.
- 5 saniye kuralı; mükemmel; ayrı oturum; ana oturumdaki işlerle karışmaz.
