# Yakala Yaz · görünür metinler (2026-10-02)

Durum: **T** taslak · **K** 5 sn kapısından geçti (ekranıyla) · **B** benim onayım · **S** sahip onayı.
Kapı kayıtları `kapi/5sn-tur1.md`, `kapi/5sn-tur2.md`. "K B": ekranı tur 2'de geçti (≥ 4/5) ve ben onayladım.
Ana oturum yalnız **S** olanları harfi harfine kullanır. `{…}` yer tutucuyu kod doldurur.

Yasaklar (hepsinde): sağlık ve performans iddiası yok ("okuma hızını artırır", "görme açını genişletir", "beynini
geliştirir" yok); "beyin" ve "tanıma" yok; değişim sözcükleri yalnız "başlangıcından iyi", "değişim yok", "henüz belli
değil", "başlangıç"; başkasıyla kıyas yok; puan yok; emoji yok; kelime/dakika yok. Hitap "sen".

## Ad
| # | Metin | Durum |
|---|---|---|
| A1 | Yakala Yaz (modül adı; kart, başlık) | S (2026-10-02) |
| A2 | Yakala Yaz alıştırması (Nef'in cümle içindeki adı; çekimler PLAN §7) | T |

## Giriş (G) — ekran `giris`
| # | Metin | Durum |
|---|---|---|
| G1 | Yakala Yaz · 2 dk | K B |
| G2 | İki kelime, bir an. | K B |
| G3 | Ekranda iki kelime kısa süre görünür. Aklında tut, sonra yaz ya da söyle. | K B |
| G4 | Bugün {n}. basamaktan · {ms} ms | K B |
| G5 | Her doğru cevapta bir basamak hızlanır. | K B |
| G6 | Yanlışta üç basamak yavaşlar. | K B |
| G7 | Burada kısa süre görüneni yakalamayı çalışırsın. Okuma hızına etkisi araştırmalarda gösterilmedi. (iddia sınırı; her turda giriş ekranında) | K B |
| G8 | Başla | K B |
| G9 | Mikrofon yoksa G3'ün sonu: "Aklında tut, sonra yaz." | T |

## Deneme (D) — ekranlar `goster`, `yaz`, `dogru`, `yanlis`
| # | Metin | Durum |
|---|---|---|
| D1 | Basamak {n} · {ms} ms | K B |
| D2 | Yavaş · 500 ms / 50 ms · Hızlı (merdiven uçları) | K B |
| D3 | İki kelimeyi yaz (alan ipucu) | K B |
| D4 | Ne gördün? / Yaz ve Gönder'e bas, ya da mikrofona söyle. | K B |
| D5 | Doğru! Bir basamak hızlandın. ("Sıradaki {ms} ms" kapı maddesi 1 ile kalktı) | K B |
| D6 | Doğrusu / Sen (yanlışta iki satır) | K B |
| D7 | Bir harf farklı · üç basamak yavaşladı ("Sıradaki" kalktı, madde 2) | K B |
| D8 | Biri doğru · üç basamak yavaşladı (tek kelime doğruysa) | T |
| D9 | İkisi de farklı · üç basamak yavaşladı | T |
| D10 | Boş geçtin · üç basamak yavaşladı | T |
| D11 | Duyamadım, yazabilirsin. (mikrofon bir şey duymazsa; deneme sayılmaz) | T |
| D12 | En yavaş basamaktasın. (1. basamakta yanlış) / En hızlı basamaktasın. (18. basamakta doğru) | T |

## Sonuç (R) — ekran `sonuc` (kapıdan geçmedi: `kapi/5sn-tur2.md` madde 7–13; metinler gerçek ekranla yeniden kapıya girer)
| # | Metin | Durum |
|---|---|---|
| R1 | Bugün | T |
| R2 | {ms} ms (büyük sayı: tur eşiği) | T |
| R3 | Bugün yerleştiğin hız: {n}. basamak. | T |
| R4 | Gelişim: başlangıç ölçülüyor · {k}/8 gün — ya da Gelişim hükmüyle: "{önce} → {sonra} ms · başlangıcından iyi", "değişim yok", "henüz belli değil" (sözcük `verdictWord`'den) | T |
| R5 | Son 7 tur · basamak / Yüksek çubuk, hızlı tur / Bugün | T |
| R6 | Doğru · {n} denemede {k} | T |
| R7 | Bir kez yetiştin · {ms} ms (turda doğru bilinen en kısa süre) | T |
| R8 | Bana hatırlat · istersen her gün aynı saatte (var olan kart bileşeni; metni bildirim planındaki gibi) | T |
| R9 | Bitti | T |

## Mikrofon izni (İ) — ekran `sesizin` (rıza sayfası: anlaşılırlık ölçütü de aranır)
| # | Metin | Durum |
|---|---|---|
| İ1 | Kelimeleri sesle söylemek ister misin? | K B |
| İ2 | Mikrofon yalnız sen düğmeye basınca açılır; iki kelimeyi söyleyince kapanır. | K B |
| İ3 | Ses telefonunda yazıya çevrilir. Kaydedilmez, hiçbir yere gönderilmez. | K B |
| İ4 | İstemezsen klavyeyle devam et. Fikrini Profil'den ya da iPhone Ayarlar'dan değiştirebilirsin. | K B |
| İ5 | Mikrofonu aç · Hayır, klavyeyle devam | K B |
| İ6 | iOS izin metni, mikrofon (Info.plist `NSMicrophoneUsageDescription`): "Okuma testinde cümleyi sesli okuduğunu ve Yakala Yaz'da söylediğin iki kelimeyi anlamak için mikrofon kullanılır. Ses kaydedilmez, saklanmaz." | T |
| İ7 | iOS izin metni, konuşma (`NSSpeechRecognitionUsageDescription`): "Okuma testinde okuduğun cümleyi ve Yakala Yaz'da söylediğin kelimeleri yazıya çevirmek için kullanılır. Yakala Yaz bunu yalnız telefonun içinde yapar." | T |

## Nef (N)
| # | Metin | Durum |
|---|---|---|
| N1 (FYY-1, `only: { metric: 'yakala-yaz-ms' }`) | İlk Yakala Yaz turunda iki kelimeyi {başlangıç} ms'de yakaladın; başlangıcın bu. | T |
| N2 (note) | Yakala Yaz alıştırması: kısa süre gösterilen iki kelimeyi yakalayıp yazma; ölçü iki kelimenin doğru yakalandığı gösterim süresi (ms, düşük daha iyi). Okuma hızına aktarımı gösterilmedi. | T |
| N3 (metricWords) | iki kelimeyi yakaladığın süre · ms | T |
Genel anlar (`metricChange`, `firstTime`, `returnAfterGap`) bankadaki onaylı genel cümleleri kullanır; yeni cümle gerekmez.

## Hatırlatma (H) — `remind.yakala-yaz`, bildirim metin sınırları: başlık ≤ 30, gövde ≤ 110
| # | Başlık | Gövde | Durum |
|---|---|---|---|
| H1 | Yakala Yaz hazır | İki kelime, bir an. Kısa bir tur ister misin? | T |
| H2 | Bir tur Yakala Yaz? | Yaklaşık 2 dakika. Hazır olduğunda dokun. | T |
| H3 | Yakala Yaz | Bugünkü basamağın seni bekliyor. Seçim senin: şimdi ya da sonra. | T |

## Bilim kartı (B) — `sources.js` `finding` (≤ 100 karakter) ve `limit`
| # | Kaynak | finding | limit | Durum |
|---|---|---|---|---|
| B1 | rubin1992 | Tek tek gösterilen kelimeyi doğru okumak için gereken en kısa süre ortalama 69 ms çıktı. | 13 kişilik bir deney; iki kelime ve yazma bizim eklememiz. | T |
| B2 | garcia1998 | Doğruda küçük, yanlışta büyük adımla ayarlanan merdiven sabit bir doğruluk noktasına yerleşir. | Benzetim çalışması; kişilerde denenmedi. | T |
| B3 | rayner2016 | Okumayı iki üç kat hızlandırıp aynı anlamayı korumak olası görünmüyor; hızın özü dil becerisi. | Derleme; hızlı okuma programlarını değerlendirir. | T |
| B4 | simons2016 | Alıştırılan görevde ilerleme güçlü; günlük hayata aktarım için kanıt az. | Derleme; tek bir alıştırmayı değil alanı değerlendirir. | T |

## Gelişim ekranı satırı
| # | Metin | Durum |
|---|---|---|
| GE1 | İki kelimeyi yakaladığın süre (metrik `label`; Gelişim → Dikkat) | T |
| GE2 | Yakala Yaz · {ms} ms · basamak {n} (oturum satırı `describe`) | T |
| GE3 | Yakala Yaz · {ms} ms · ilk tur {ms} ms / Tur · 7 gün · {n} · basamak {n} (`stats`) | T |
