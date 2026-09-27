// Sürüm notları: her güncellemede neler eklendi / düzeldi. Uygulama güncellenince ilk açılışta bir kez
// gösterilir (components/WhatsNew.jsx), Bilgi → "Yenilikler"de hepsi durur.
// KURAL: her yeni commit dizisi (TestFlight'a gidecek iş) buraya bir madde ekler. En yeni en üstte.
// id: ISO tarih + sıra; kind: 'new' | 'fix' | 'change'
export const RELEASES = [
  {
    id: '2026-09-27',
    title: '27 Eylül güncellemesi',
    items: [
      { kind: 'new', text: 'Google ile giriş (iPhone): Apple\'ın güvenli oturum penceresinde Google hesabını seçersin; ek bir Google ya da Facebook yazılımı uygulamaya girmez.' },
      { kind: 'change', text: 'Yeni hoş geldin ekranı: Pegasus gökyüzü ve ufuk kavisi; Apple ya da e-posta ile devam et, istersen hesapsız dene. Açık ve koyu temada ayrı tasarlandı.' },
      { kind: 'change', text: 'Yeni giriş ekranı: film kalktı. Gece göğünde Pegasus, altın odakta tek yıldız ve ufuktan doğan göz; Başla göz bebeğinde. Hareket yok, beklemeden başlarsın.' },
      { kind: 'new', text: 'Hatırlatmalar (Bilgi → Hatırlatmalar): mola, yürüyüş, nefes ve su. Hangilerinin geleceğini ve saatini sen seçersin; her türden günde en çok bir hatırlatma. Ana sayfada bir kez sorarız, cevap vermeden hiçbiri kurulmaz.' },
      { kind: 'new', text: '1 dakikalık mola: kalk, uzağa yürü, 20 saniye uzağa bak, yavaşça göz kırp. Atlayabilirsin; kayıt Nef\'e ve seriye girmez.' },
      { kind: 'new', text: 'Çalışma oturumu: 1, 2 ya da 4 saat seç; saatte bir mola hatırlatması gelir. Ana sayfadaki şeritten bitirebilirsin.' },
      { kind: 'new', text: 'Su kaydı ve 1 dakikalık nefes: hatırlatmaya dokununca açılır; nefeste başta ve sonda puan sorulmaz.' },
      { kind: 'new', text: 'Yürüyüş hatırlatması adımın o saate kadar yeterliyse gelmez; uygulamayı açmasan da telefon kendisi iptal eder (Apple Sağlık iznin varsa).' },
      { kind: 'new', text: 'Gelişim: açık her hatırlatma için ölçüm kartı. Bazı günler bilerek göndermiyoruz; gelen ve gelmeyen günlerde ne yaptığın sayıyla yazar. Veri telefonundan çıkmaz.' },
      { kind: 'change', text: 'Çalışma günleri hatırlatması artık uygulama bildirimi; takvim dosyası düğmesi kalktı. Takvimine daha önce eklediysen oradaki etkinliği silebilirsin.' },
      { kind: 'change', text: 'Apple Sağlık izin metnine yürüyüş hatırlatması ve ölçüm amacı eklendi; bu yüzden izni bir kez yeniden soruyoruz. "Şimdi değil" dersen adımların yine görünür, yalnız yürüyüş hatırlatması açılmaz.' },
      { kind: 'fix', text: 'Sürüm notlarındaki bir yazım hatası uygulamanın derlenmesini engelliyordu; düzeldi.' },
    ],
  },
  {
    id: '2026-09-26',
    title: '26 Eylül güncellemesi',
    items: [
      { kind: 'new', text: 'Hesap: Apple ile giriş ya da hesapsız devam. Hesabın varsa profilin yeni telefonda da seninle.' },
      { kind: 'new', text: '"Seni tanıyalım": ad, doğum tarihi (gün/ay/yıl kutucukları), şehir (81 il önerisi), gözlük/lens.' },
      { kind: 'new', text: '7 gün ücretsiz deneme artık kurulumun sonunda; 5. gün istersen bildirimle hatırlatırız.' },
      { kind: 'new', text: 'Profilim: şehir, hesap aç / çıkış yap / hesabımı sil.' },
      { kind: 'new', text: 'Yeni giriş filmi: iristen içeri dalış, siluetler, fark etme anlarında yavaşlayan zaman, takımyıldızı Pegasus.' },
      { kind: 'new', text: 'Gelişim yenilendi: göz, kendine yaklaşım, farkındalık, sakinlik, dikkat kutucukları. Her birinde değişimin anlamlı mı yoksa doğal oynama mı olduğu, yöntem ve makale kaynağı.' },
      { kind: 'new', text: 'Göz kötüleşirse Gelişim\'in en üstünde açık uyarı: ne zaman tekrar ölçmeli, ne zaman göz doktoruna gitmeli (art arda 3 test kuralı, Faes 2021).' },
      { kind: 'new', text: 'Her uygulamadan sonra sorulan "şimdi nasıl hissediyorsun" puanları (Nefes, Gökyüzü, Dalga, Yön) artık Gelişim\'de: önce → sonra, ortalama ve güven aralığıyla.' },
      { kind: 'new', text: '5. gün "İlk rapor": düzenin, uygulamalardan sonraki değişim ve ölçümlerin tek sayfada. Deneme hatırlatmasına dokununca da açılır; sonra Gelişim\'de durur.' },
      { kind: 'new', text: 'Gelişim → Dışa aktar: "Doktoruma göster" PDF raporu (göz testlerin, uyarı kuralı, diğer ölçümlerin özeti) ve tüm ölçümler CSV olarak. Dosya yalnız senin seçtiğin yere gider.' },
      { kind: 'change', text: 'Göz başlangıç değeri artık en az 7 testle oluşuyor (önce 3): yanlış uyarı daha seyrek. 21. günde 7 test yoksa başlangıç 7. teste kadar uzar.' },
      { kind: 'fix', text: 'Göz uyarısı tam eşikte (ör. başlangıç 0,20, son testler 0,30) tetiklenmiyordu; düzeldi.' },
      { kind: 'change', text: 'Göz metinleri makalelere göre netleşti: bir testten diğerine ±0,2 oynama olağan; gri bant (±0,10) tek testin oynaması değil, 7 günlük ortancanın değişim eşiği. "Sabit" yerine "doğrulanmış değişim yok".' },
      { kind: 'fix', text: '"Verilerimi indir" iPhone\'da çalışmıyordu; artık paylaşım sayfası açılıyor (Dosyalar, Mail, AirDrop).' },
      { kind: 'fix', text: 'Göz kalibrasyonu: baş duruşu hesaba katılıyor; "Ayırt edemedim" ekranı çok daha seyrek. Tekrar turu ortayı da yeniliyor.' },
      { kind: 'fix', text: 'Göz yönleri: kalibrasyonsuz kullanımda sağ–sol terslenmişti (ör. "Sola bak", saat yönünde daire). Düzeldi.' },
      { kind: 'fix', text: 'Güncellemeden sonra giriş filmi oynamıyordu; yeni film bir kez oynar (hareketi azalt açıksa atlanır).' },
      { kind: 'fix', text: 'Doğum tarihi Türkiye saatinde her tarihi reddediyordu; düzeldi.' },
      { kind: 'fix', text: 'Şehir listesi açılmıyordu; artık dokununca 81 il açılıyor, yazdıkça süzülüyor.' },
      { kind: 'fix', text: 'Giriş ya da ödeme ekranı hata verirse altında hata kodu görünüyor (destek için).' },
      { kind: 'fix', text: 'Ödeme ekranı "Planlar yükleniyor"da takılı kalıyordu (abonelik altyapısı hiç başlamıyordu); düzeldi. Planlar yine gelmezse 20 saniye sonra nedeni yazılır.' },
      { kind: 'fix', text: 'İlk bakış kırpma sayımı: okuma metni 20 saniyeden önce bitiyordu; metin uzadı, süre boyunca okuma sürüyor.' },
      { kind: 'fix', text: 'Kamera izni vermezsen 40 cm ekranında takılmıyorsun: "Kamerasız devam et" çıkıyor. Nef göz koçu artık iki ayrı izinle açılıyor (özet sayılar / profil cevapları). Nefona 18 yaş ve üstü içindir.' },
      { kind: 'fix', text: 'Kamera izni yokken ekranlar "başlatılıyor" diye bekletmiyor, iznin nereden açılacağını yazıyor. "Kamerasız devam et" dersen oyunlar ve egzersizler de kamerasız çalışır; Bilgi → "Mesafe takibini aç" ile geri açarsın. Bilgi\'den açılan 40 cm ekranında artık "Vazgeç" var.' },
      { kind: 'change', text: 'Nef izinleri kayıt altında: ne gittiği (görme ölçümü ve nefes sonrası sakinlik farkı dahil), nereye (yurt dışı) ve ne kadar süre tek tek yazıyor. Eski sürümde izin sormadan açılmış Nef bir kez kapanır ve yeniden sorar. Profil cevapları için ayrı izni Profilim → İzinlerim\'den verirsin.' },
      { kind: 'fix', text: '18 yaş altında kurulum ekranında "Hesabımı sil" var; yanlış "Ad ve doğum tarihi gerekli" uyarısı kalktı. Ana sayfa ve profil sorularındaki "yalnız bu telefonda" metinleri neyin nereye gittiğini doğru söylüyor.' },
      { kind: 'new', text: 'Apple Sağlık (izninle, yalnız okuma): bugünkü adımın ana sayfada, son 7 gün Gelişim → Beden\'de. Uzun süre kalkmadıysan Nef önce 2 dakika yürümeni önerir. Veriler telefonundan çıkmaz.' },
      { kind: 'change', text: 'KVKK: profilin sunucuya ancak açık iznine göre eşitlenir. Ne, neden, nerede (Frankfurt), ne kadar süre tek sayfada; kutu önceden işaretli değil. İznini Profilim → İzinlerim\'den geri çekersen sunucudaki kopya silinir.' },
      { kind: 'new', text: 'Profilim: Premium kartı (deneme kaç gün kaldı, ne zaman biter, aboneliği yönet), giriş şeklin ve İzinlerim: hangi verinin nereye gittiği; Nef izinlerini buradan kapatabilirsin.' },
      { kind: 'new', text: 'Ana sayfa yenilendi: günün diyaframı (bugün yaptıkça açılır), seri, bu hafta ve toplam gün; Nef\'in tek önerisi ve Nefes / Dalga kısayolları. Sağ üstteki avatarınla Profilim açılır.' },
      { kind: 'change', text: 'Bugünün yolu artık sıralı: duraklar tek tek açılır. İlerideki bir durağa dokununca önce sıradakini yapman istenir; bitenleri istediğin kadar tekrar yapabilirsin.' },
      { kind: 'new', text: 'Abonelik: haftalık plan eklendi (yıllık, aylık, haftalık; hepsi 7 gün ücretsiz deneme). Ödeme ekranı App Store fiyatlarını yüklüyor.' },
      { kind: 'change', text: 'Yeni uygulama simgesi: Nefona\'nın "n" harfi bir göz kapağı, altında iris.' },
      { kind: 'change', text: 'Uygulamanın yeni adı Nefona; koçun adı Nef. Ana ekranda, ödeme ekranında, PDF raporunda ve dosya adlarında yeni ad.' },
    ],
  },
]

export const latestRelease = () => RELEASES[0] ?? null

// Görülmemiş sürümler (seenId'den yeniler). seenId yoksa yalnız en son sürüm.
export function unseenReleases(seenId) {
  if (!seenId) return RELEASES.slice(0, 1)
  return RELEASES.filter((r) => r.id > seenId)
}
