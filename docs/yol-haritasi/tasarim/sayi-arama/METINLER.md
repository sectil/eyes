# Rakam Avı · görünür metinler (2026-10-01)

Durum: **T** taslak · **K** 5 sn kapısından geçti (ekranıyla) · **B** benim onayım · **S** sahip onayı.
Sahip onayı istenenler: K B olanlar (2026-10-02).
Ana oturum yalnız S olanları harfi harfine kullanır. `{…}` yer tutucuyu kod doldurur.

Yasaklar: sağlık ve "zekâ" iddiası yok; "beyin" ve "tanıma" yok; değişim sözcükleri yalnız "başlangıcından iyi",
"değişim yok", "henüz belli değil", "başlangıç"; başkasıyla kıyas yok; puan, yıldız, emoji yok.

## Ad
| # | Metin | Durum |
|---|---|---|
| A1 | Rakam Avı | K B (iki turda 10/10 değerlendirici ilk bakışta anladı) |
| A2 | Kart alt satırı: 4 haneli diziyi ızgarada bul · 2 dk | T |

## Giriş (G) · ekran 5 sn kapısından geçti (tur 2, 5/5)
| # | Metin | Durum |
|---|---|---|
| G1 | Rakam Avı | K B |
| G1b | Üst satır: Dikkat · arama | K B |
| G1c | Sağ üst: 2 dk · 5 dizi | K B |
| G2 | Bu diziyi bul | K B |
| G3 | Izgarada 5 kez saklı. Bulunca parmağını üstünden kaydır. | K B |
| G4 | Adımlar: 1 Diziye bak · 2 Izgarada ara · 3 Üstünden kaydır | K B |
| G5 | Geri sayım yok. Her tur yeni bir ızgara. | K B |
| G6 | Başla | K B |
| G8 | Kısa giriş (4. turdan sonra): Bu diziyi bul · 5 kez saklı | T |

## İddia sınırı (I)
| # | Metin | Durum |
|---|---|---|
| I1 | Bu bir arama alıştırması. Çalıştığın işte hızlanırsın; günlük hayata geçtiği gösterilmedi. | T. Yeri: bilim kartı ve Gelişim'deki kaynak satırı; girişte değil (kapı tur 1) |

## Oyun (O) · bulundu anı kapıdan geçti (tur 2, 5/5); kaydırma anı geçmedi, kapı kodda
| # | Metin | Durum |
|---|---|---|
| O1 | Aranan | K B |
| O2 | {k} / 5 | K B |
| O3 | Buldun · {t} sn (o dizinin süresi) | K B |
| O4 | Bu dizi değil (yanlış kaydırmada, 1 sn) | T |
| O5 | Göster (90 sn sonra) | T |
| O6 | Kalan diziler (Göster'e basınca) | T |
| O7 | Kendi hızında ara. Geri sayım yok. | T |

## Sonuç (S) · kapıdan geçmedi; son hâl kodda kapıya girer
| # | Metin | Durum |
|---|---|---|
| S1 | Dizi başına süren | T |
| S2 | {x} sn | T |
| S3 | Kapsül altında: {t} sn / bulunmadı | T |
| S4 | {w} yanlış kaydırma | T |
| S5 | Başlangıç · {d}/8 gün | T |
| S6 | {d} sn daha hızlı / {d} sn daha yavaş / önceki turla aynı | T (sahip kararı 2026-10-02) |
| S7 | Önceki turuna göre · kısa daha iyi · Önceki tur · Bugün | T |
| S8 | başlangıcından iyi / değişim yok / henüz belli değil | onaylı Gelişim sözcükleri |
| S9 | Grafik: başlangıç · bugün · Son 14 gün · düşük daha iyi | T |
| S10 | Tamam | T |

Kaldırılanlar (kapı tur 1–2): "Tur bitti · bir diziyi bulma süren", "ortanca", "yanlış işaret", "Başlangıcın 6 ölçüm
günü sonra oluşur.", "Başlangıcın kuruluyor…" paragrafı, "Grafiğin 8. günden sonra burada belirir", "Fark iki
haftadır sürüyor.", "{b} → {c} sn".

## Nef (N)
Sonuç ekranındaki tek satır; kişinin kendi olgusu. Banka hücreleri `rakam-avi` kimliğiyle.
| # | Metin | Durum |
|---|---|---|
| N1 | Bugünün en hızlı dizisi {x} saniyede geldi. | T |
| N1b | En hızlı dizin bugün geldi: {x} saniye. (bütün zamanların en kısası iken) | T |
| N2 | İlk Rakam Avı turun tamam. Başlangıcını birlikte kuracağız. | T |
| N3 | İki hafta önce bir dizi {y} saniye sürüyordu; şimdi {x}. (yalnız v2 "başlangıcından iyi" iken) | T |
| N4 | Bu turda {w} yanlış kaydırma vardı. Acele etmeden bakmak da ölçünün parçası. | T |

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
