# Tasarım özeti · Nefona "Gelişim" ekranı · ışıktan canlı baş

## Ürün
Nefona: iPhone uygulaması (Türkçe; React + Capacitor). Göz, nefes, dikkat, ruh hâli ve hareket alışkanlıkları.
"Gelişim" sekmesi uygulamanın merkezidir: bütün modüllerin verisi burada toplanır ve kullanıcıya gösterilir.

## Sahibin hayali (kelimesi kelimesine; bağlayıcı)
> gelişim merkezi canlı bir insan gibi olmalı gözler olmaslu kamera tespit edbiliyor beyin ısmında glişim merkezi oalcak
> veirleir oalcak sadece burundan yukarıs gözüken bir kfatası olabilir ileri üstü bir canlı veirlerin olduğu yer
> olacak.. örneğin yüyürül yaorğında canlı gmrğkebikecek ... tasarım önemli ... verilerin kullanıcya bait şekilde
> sunulması önemli ... 5 saniye kuralı ... eğer mükemmek değilse bana göndermyeceksin

Okunuşu:
- Canlı bir insan başı. Yalnız **burundan yukarısı** görünür.
- **Gözler** kameranın ölçtüğü veriyi taşır; örneğin kişinin ölçülen kırpma hızıyla kırpar.
- Başın içindeki **beyin, gelişim merkezidir.** Beş bölge (Göz, Dikkat, Nefes, Ruh hâli, Hareket) ölçülen gelişimle yanar.
- Veri **canlıdır**: yürürken hareket bölgesi o an akar, baş nefes alır gibi hafifçe genişleyip daralır.
- Kullanıcı 5 saniyede "vay" demeli ve ne gördüğünü anlamalı. Basit sunum.

Sahibin son yargısı (önceki denemeler için):
- "Görsel memnun olmadım, tam anlatmıyor, anlamıyorum; gelişmiş değil, basit."
- Son maket için: "düşünce güzel ama çalışma berbat."

İstenen şey fikir değil, **işçilik**: dünya çapında bir tasarım stüdyosunun elinden çıkmış gibi olmalı.

## Önceki denemelerden öğrenilenler (tekrarlama)
- **Yatay tarama çizgileri** "tıbbi tarama / hologram" gibi soğuk durdu. Yumurta gibi, robot gibi şekiller olmaz.
- **Kocaman karikatür gözler** maskot ya da çocukça durdu; baş ile uyumsuz göz ürkütücü oldu.
- **Dağınık nokta bulutu** "pembe gürültü" gibi okundu. Beyin bölgeleri 5 saniyede ayırt edilemedi.
- **Tek renk yaylar** "Wi-Fi simgesi" gibi okundu. Gökkuşağı kalabalığı da ucuz duruyor.
- **Gerçekçi yüz / gerçek insan fotoğrafı** tekinsiz vadi (uncanny) riski taşır. Stilize, zarif, ışıktan olmalı.
- Beğenilenler: koyu tema; tek turuncu canlı vurgu; iris odağı (uygulamanın simgesi bir iristir); Nef'in kısa, yargısız
  cümleleri; dolu, "hak edilmiş" görünen başarı.

## Dürüstlük kuralları (bağlayıcı)
- Sağlık iddiası yok. "Beynin gelişti", "iyileşti" gibi sözler yok. Ekranda **"beyin" sözcüğü de geçmez**. Bölgeler
  alan adlarıyla anılır: Göz, Dikkat, Nefes, Ruh hâli, Hareket.
- Bir bölge ancak verisi `st: 'up'` (kodun doğruladığı "başlangıcından iyi") ise tam parlak yanar. `live` o an akar.
  `start`, `same` ve `unsure` sakin ve soluk kalır. Görsel hiçbir zaman veriden daha iyi bir durum anlatmaz.
- Kamera görüntüsü gösterilmez; yalnız ölçülen sayı ve onun davranışı (kırpma hızı) kullanılır.

## Veri (değiştirme; olduğu gibi kullan)
`/home/user/eyes/docs/yol-haritasi/tasarim/gelisim-merkezi/maket/ordu/veri.js`
Bu dosya `AREAS`, `NAME`, `WORD` ve `DAYS` nesnelerini tanımlar; içeriğini sayfaya **satır içi** kopyala.
Durumlar: `'30'` (30. gün), `'walk'` (yürürken), `'1'` (1. gün). `DAYS[x].blinks` 20 saniyedeki kırpma sayısıdır.
Gözler bu hızla kırpar.

## Sayfa sözleşmesi
- Tek, bağımsız bir HTML dosyası. `<!doctype>`, `<html>`, `<head>` ve `<body>` etiketleri **yok**: dosya yayında bunlarla
  sarılır. En üstte `<title>Işıktan Baş</title>`, ardından `<style>` gelir.
- Başlangıç durumu `location.hash`'ten okunur: `#d30`, `#walk`, `#d1`. Hash yoksa `#d30` kabul edilir. Üstte bu üç durum
  için bir seçici bulunur (düğmeler; basınca hash de güncellenir).
- Telefon çerçevesi (en çok 390px genişlik) içinde yukarıdan aşağıya:
  1. Başlık "Gelişim" ve sağda gün etiketi.
  2. **Baş sahnesi.** Ekranın yıldızı; ilk görünümün yaklaşık yarısı.
  3. Nef cümlesi (`DAYS[x].nef`).
  4. Beş alan çipi: ad, değer, durum sözcüğü.
  5. Bir çipe dokununca başta o bölge öne çıkar, öbürleri söner; altta ayrıntı metni (`d`) açılır.
- Dış scriptler yalnız şuradan yüklenebilir: `https://cdnjs.cloudflare.com/ajax/libs/...`. Three.js gerekirse
  `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js` (UMD, global `THREE`). Yazı tipi yalnız Google
  Fonts'tan: Onest (gövde) ve Unbounded (başlık), gerçek bir yedek yığınla birlikte.
- **İki tema.** Renkler `:root` üzerinde token olarak tanımlanır; koyu değerler hem
  `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {...} }` içinde hem de
  `:root[data-theme="dark"]` içinde yeniden tanımlanır. `body` arka planı açıkça bir tokendan gelir. Uygulamanın tokenları:
  - Açık tema: bg `#f3f6f8`, surface `#fff`, ink `#0b1219`, ink-2 `#33414d`, iris-1 `#11a9b8`, iris-2 `#2f6bea`,
    lens (canlı turuncu) `#f08a00`, ok `#13704b`.
  - Koyu tema: bg `#070c12`, surface `#0f171f`, ink `#eef3f6`, ink-2 `#b9c4cd`, iris-1 `#19c2d1`, iris-2 `#3e7bfa`,
    lens `#ffb13b`, ok `#35d39a`.
  - Alan tonları istersen yeniden seçilebilir; ama iki temada da okunur olmalı.
- 320px genişlikte (iPhone SE, 568 yükseklik) taşma olmaz; Nef cümlesi ilk görünümde okunur.
- `prefers-reduced-motion` açıksa sabit ve güzel bir kare çizilir.
- iPhone'da akıcı olmalı. WebGL kullanıyorsan çizim çözünürlüğünü sınırla (dpr en çok 2) ve sahneyi makul boyutta tut.

## Araçlar
- Ekran görüntüsü:
  `node /home/user/eyes/docs/yol-haritasi/tasarim/gelisim-merkezi/maket/ordu/shot.mjs <html mutlak yol> <çıktı klasörü> [hizli]`
  Tam kip 12 görüntü üretir (3 durum × 2 tema × 390/320), yaklaşık 4 dakika sürer. `hizli` kipi yalnız 390 genişliği
  çeker (6 görüntü); ara turlarda bunu, son turda tam kipi kullan. Bash'e `timeout: 600000` ver.
  Hatalar `errors.txt` dosyasına yazılır. Görüntüleri Read ile açıp **gerçekten bak**.
- Three.js cdnjs adresinden yüklenir; ekran görüntüsü aracı cdnjs'e erişebiliyor.
- `app/` altına dokunma. Yalnız sana verilen klasöre yaz.
