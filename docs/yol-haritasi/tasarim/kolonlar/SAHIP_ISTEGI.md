# Kolonlar mantığında yeni modül · sahibin isteği

Tarih 2026-10-01 23.40. Sahibin sözleri, kelimesi kelimesine:

> "Yine aynı şekilde yeni modül yapalım . Yeni bir oturumsa takipmedelim . Lisan açısından sorun olmaması işin asla
> kopya yapma daha gelişmiş ve mükemmel olması lazım 5 saniye kuralı önemli . Kd/185 gözüküyor ileri bölümlerde kd
> artıyor bizde aynı mantık olması lazım yeni oturumda takşpnedelim . 5 sn kuralı önemli gelişim merkezinde takip
> edilmesi önemli … mükemmel olacak ve 5 sn önemli"

Ekran görüntüsü `sahip-ekran/1-oyun.png`: başka bir uygulamanın "Kolonlar" alıştırması. Sütunlar hâlinde aynı kelime
("Para") dizili; işaretli (parlak) kelime ızgarada sırayla ilerler, kişi onu gözüyle takip eder. Üstte ilerleme çubuğu
ve hız "k/d 165" (sahip "185" diye okudu; kelime/dakika olduğu varsayılıyor). İleri bölümlerde hız artar.

Ana oturumun okuması:
- Mantık benzer (işaretli kelimeyi gözle takip, bölümler ilerledikçe artan hız), uygulama **kopya değil**: ad, görsel,
  düzen, metin ve puan sistemi o uygulamadan alınmaz; daha gelişmiş ve kusursuz olacak.
- Hız ölçüsü ve ilerleme Gelişim merkezinde takip edilir (manifest `progress`).
- 5 saniye kuralı; ayrı oturum; ana oturumdaki işlerle karışmaz.
- VARSAYIM: "k/d" kelime/dakika. Yeni oturum doğrular.
