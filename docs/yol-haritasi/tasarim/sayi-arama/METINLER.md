# Rakam Avı · görünür metinler (2026-10-01)

Durum: **T** taslak · **K** 5 sn kapısından geçti (ekranıyla) · **B** benim onayım · **S** sahip onayı.
Ana oturum yalnız S olanları harfi harfine kullanır. `{…}` yer tutucuyu kod doldurur.

Yasaklar: sağlık ve "zekâ" iddiası yok; "beyin" ve "tanıma" yok; değişim sözcükleri yalnız "başlangıcından iyi",
"değişim yok", "henüz belli değil", "başlangıç"; başkasıyla kıyas yok; puan, yıldız, emoji yok.

## Ad
| # | Metin | Durum |
|---|---|---|
| A1 | Rakam Avı | T |
| A2 | Kart alt satırı: 4 haneli diziyi ızgarada bul · 2 dk | T |

## Giriş (G)
| # | Metin | Durum |
|---|---|---|
| G1 | Rakam Avı | T |
| G2 | Bu diziyi bul | T |
| G3 | Izgarada 5 kez saklı. Bulunca parmağını üstünden kaydır. | T |
| G4 | Adımlar: 1 Diziye bak · 2 Izgarada ara · 3 Üstünden kaydır | T (tur 2) |
| G5 | Geri sayım yok. Her tur yeni bir ızgara. | T (tur 2) |
| G6 | Başla | T |
| G7 | Bu bir arama alıştırması. Çalıştığın işte hızlanırsın; günlük hayata geçtiği gösterilmedi. | T. Yeri tur 2'de değişti: girişte değil, bilim kartında ve Gelişim'deki kaynak satırında (kapı tur 1: dört değerlendirici "Başla'nın altında heves kırıyor") |
| G8 | Kısa giriş (4. turdan sonra): Bu diziyi bul · 5 kez saklı | T |

## Oyun (O)
| # | Metin | Durum |
|---|---|---|
| O1 | Aranan | T |
| O2 | {k} / 5 | T |
| O3 | Buldun · {t} sn (o dizinin süresi) | T (tur 2) |
| O7 | Kendi hızında ara. Geri sayım yok. | T |
| O4 | Bu dizi değil | T |
| O5 | Göster (90 sn sonra) | T |
| O6 | Kalan diziler (Göster'e basınca) | T |

## Sonuç (S)
| # | Metin | Durum |
|---|---|---|
| S1 | Dizi başına süren · ortanca | T (tur 2) |
| S2 | {x} sn | T |
| S3 | Dizi kapsülü altında: {t} sn / bulunmadı | T (tur 2) |
| S4 | {w} yanlış işaret | T |
| S5 | başlangıç · {d} / 8 gün | T (Gelişim sözcüğü) |
| S6 | Başlangıcın kuruluyor. 8 gün oynayınca kendi başlangıcın belirir; sonra her hafta onunla kıyaslarız. | T (tur 2) |
| S6b | Grafiğin 8. günden sonra burada belirir | T (tur 2) |
| S7 | başlangıcından iyi / değişim yok / henüz belli değil | T (Gelişim sözcükleri) |
| S8 | {b} → {c} sn | T (tur 2) |
| S8b | Fark iki haftadır sürüyor. (yalnız "başlangıcından iyi" iken; v2 `persist: 2`) | T (tur 2) |
| S9 | Grafik: başlangıcın · günlük süren · düşük daha iyi | T (tur 2) |
| S10 | Tamam | T |

## Nef (N)
Sonuç ekranındaki tek satır; kişinin kendi olgusu. Banka hücreleri, `rakam-avi` kimliğiyle.
| # | Metin | Durum |
|---|---|---|
| N1 | Bugünün en hızlı dizisi {x} saniyede geldi. | T |
| N1b | En hızlı dizin bugün geldi: {x} saniye. (bugünkü en kısa, bütün zamanların en kısası iken) | T (tur 2) |
| N2 | İlk Rakam Avı turun tamam. Başlangıcını birlikte kuracağız. | T |
| N3 | İki hafta önce bir dizi {y} saniye sürüyordu; şimdi {x}. | T (yalnız v2 "başlangıcından iyi" iken; "ortalama" denmez, değerler v2 başlangıç ve şimdi; kapı tur 1 D5) |
| N4 | Yanlış işaretin bu turda {w}. Acele etmeden bakmak da ölçünün parçası. | T |

## Hatırlatma (H) · `remind.rakam-avi`
| # | Başlık | Gövde | Kaynak | Durum |
|---|---|---|---|---|
| RA1 | Rakam Avı | Izgarada 4 haneli bir dizi saklı. Kısa bir tur ister misin? | sireteanu1995 | T |
| RA2 | Bir Rakam Avı turu | 5 diziyi bul, geri sayım yok. Dokunman yeter. | sireteanu1995 | T |
| RA3 | Rakam Avı hazır | Birkaç dakikan varsa dokun, diziyi aramaya başla. | sireteanu1995 | T |

Sınırlar (`remindTexts.js` LIMITS): başlık ≤ 30, gövde ≤ 110 karakter. Üçü de içinde.

## Bilim kartı (B) · `sources.js` `finding`
| # | Kaynak | Metin | Durum |
|---|---|---|---|
| B1 | sireteanu1995 | Arama alıştırmasında öğrenme hızlıydı; bazı görevlerde yavaş arama birkaç yüz denemede hızlandı. | T |
| B2 | owen2010 | 11 430 kişide 6 hafta: çalışılan görevler gelişti, çalışılmayan görevlere geçiş görülmedi. | T |
| B3 | wolfe2005 | Hedef seyrek çıkınca kişiler onu sık kaçırdı. | T |
