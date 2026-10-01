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
| G4 | Soldan sağa, tek satırda. | T |
| G5 | Geri sayım yok. Kendi hızında ara. | T |
| G6 | Başla | T |
| G7 | Bu bir arama alıştırması. Çalıştığın işte hızlanırsın; günlük hayata geçtiği gösterilmedi. | T |
| G8 | Kısa giriş (4. turdan sonra): Bu diziyi bul · 5 kez saklı | T |

## Oyun (O)
| # | Metin | Durum |
|---|---|---|
| O1 | Aranan | T |
| O2 | {k} / 5 | T |
| O3 | Buldun | T |
| O4 | Bu dizi değil | T |
| O5 | Göster (90 sn sonra) | T |
| O6 | Kalan diziler (Göster'e basınca) | T |

## Sonuç (S)
| # | Metin | Durum |
|---|---|---|
| S1 | Tur bitti | T |
| S2 | {x} sn | T |
| S3 | bir diziyi bulma süren | T |
| S4 | {k}/5 dizi · {w} yanlış işaret | T |
| S5 | başlangıç | T (Gelişim sözcüğü) |
| S6 | Başlangıcın {n} ölçüm günü sonra oluşur. | T |
| S7 | başlangıcından iyi / değişim yok / henüz belli değil | T (Gelişim sözcükleri) |
| S8 | Başlangıç {b} sn · şimdi {c} sn | T |
| S9 | Son 14 gün | T |
| S10 | Tamam | T |

## Nef (N)
Sonuç ekranındaki tek satır; kişinin kendi olgusu. Banka hücreleri, `rakam-avi` kimliğiyle.
| # | Metin | Durum |
|---|---|---|
| N1 | Bugünün en hızlı dizisi {x} saniyede geldi. | T |
| N2 | İlk Rakam Avı turun tamam. Başlangıcını birlikte kuracağız. | T |
| N3 | Bu hafta bir diziyi ortalama {x} saniyede buldun; geçen hafta {y} saniyeydi. | T (yalnız v2 "başlangıcından iyi" iken) |
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
