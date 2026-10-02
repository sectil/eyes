# Sayı arama mantığında yeni modül · sahibin isteği

Tarih 2026-10-01 23.45. Sahibin sözleri, kelimesi kelimesine:

> "Yeni bir oturumsa sayı arama kısmını yapmamı lazım. Aynı şekilde yeni oturumda takip edilerim bu yeni modeli . 5sn
> kuralı . Benzersiz olması kaızm mükemmel olması lazım.. lisans problemi olmaması için bezerai kendi sistmemşz olması
> laızım . Kopya jeğsnklşlej olmayacak. Yeni oturumda devam etsin. Gelişim merkezi ve Nef ile mürekkebi ıyum işinde
> olacak ve unutma her yeni modül otomatik isteğe bağlı hatırlatma yapılabilir"

Ekran görüntüleri `sahip-ekran/`: başka bir uygulamanın "Sayı Arama" alıştırması. Rakam ızgarasında (14 satır × 13
sütun) aranan sayı dizisini ("5324") bulma; kalan sayısı, süre çubuğu ve puan; sonuçta puan grafiği.

Ana oturumun okuması:
- Mantık benzer, uygulama **benzersiz ve kopya değil**: ad, görsel, düzen, puan ve yıldız sistemi alınmaz; Nefona'nın
  kendi sistemi olur. Lisans sorunu olmaz.
- Gelişim merkezi ve Nef ile mükemmel uyum: ölçü `progress.metrics`'e (ölçü kuralı v2), manifest `nef` alanı ve
  sözleşme testi.
- **Her yeni modül isteğe bağlı hatırlatma kurulabilir olmalı** (manifest `remind`; Hatırlatmalar ve modül bitiş
  ekranındaki "Bana hatırlat"). Sahip bunu bütün yeni modüller için söyledi: Metin Arama ve kolon takip modülü de buna
  uyar; ana oturum entegrasyonda denetler.
- 5 saniye kuralı; mükemmel; ayrı oturum; ana oturumdaki işlerle karışmaz.
