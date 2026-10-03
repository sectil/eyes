# Yakala Yaz · mikrofon ekranları kapısı (Y5, 2026-10-02)

Gerçek kodla çekildi. Düzenekte mikrofon taklit edildi: cihaz içi destekli telefon, ilk dokunuş. Ekranlar 390 ve 320,
açık ve koyu tema.
- **yaz-mic:** soru ekranı, alanın yanında mikrofon düğmesi.
- **sesizin:** izin sayfası, METINLER İ1–İ5 harfi harfine.
- **dinle:** dinleme hâli.

## Tur 1 · beş kişi
| yaz-mic | sesizin | dinle | izin anlaşılırlığı |
|---|---|---|---|
| 3/5 | 2/5 | 0/5 | **5/5** |

Bulgular:
- Dinlerken "dinliyorum" yazısı yok.
- Boştaki mikrofon düğmesi açık temada soluk.
- İzin sayfasının kenarı arkadaki merdiveni kesiyor gibi görünüyor.
- "Hayır" düğmesi ev çubuğuna yakın.

Düzeltildi.

## Tur 2 · beş yeni kişi
| yaz-mic | sesizin | dinle | izin anlaşılırlığı |
|---|---|---|---|
| 3/5 | **5/5 geçti** | 0/5 | **5/5** |

yaz-mic ve dinle iki turda geçmedi. Yöntem değişti: görev testi. Dört ekran sırayla gösterildi: yaz-mic → dinle0 →
dinle1 → dinle2. Üç soru soruldu:
- a) Şu an ne oluyor?
- b) Dinlemeyi nasıl durdurursun?
- c) Sonra ne yaparsın?

Dinleme hâli yeniden kuruldu:
- Düğme dinlerken durdurma karesine döner.
- Kartta önce "İki kelimeyi söyle.", sonra "İkinci kelimeyi söyle.", sonunda "Gerekirse düzelt, sonra Gönder'e bas."
  yazar.
- Alanın yanında kırmızı noktalı "Dinliyorum" görünür.

## Görev testi tur 1 · beş yeni kişi
| yaz-mic | dinle0 | dinle1 | dinle2 | a | b | c |
|---|---|---|---|---|---|---|
| 3/5 | 0/5 | 0/5 | 2/5 | **5/5** | **5/5** | **5/5** |

Akış anlaşıldı. 5 sn sonucunu "Dinliyorum" satırı bozdu:
- Satır alanın altındaydı; kartı kısaltıp yerleşimi kaydırdı. 320'de merdiven yazısı kesildi.
- Nabız animasyonu çekimde düğmeyi soluk gösterdi.

Düzeltildi:
- "Dinliyorum" alanın içinde, sağda. Yerleşime girmez.
- Animasyon yok.
- Dinlerken alan ipucusuz.

## Görev testi tur 2 · beş yeni kişi
| yaz-mic | dinle0 | dinle1 | dinle2 | a | b | c |
|---|---|---|---|---|---|---|
| **4/5 geçti** | 1/5 | 3/5 | **4/5 geçti** | **5/5** | **5/5** | **5/5** |

Tekrarlayan bulgular:
- Durdur düğmesi yazısız bir kare. Kişiler bunun durdur olduğunu tahminle buluyor; dört kişi böyle dedi.
- Ses alındığını gösteren seviye ya da dalga yok; üç kişi bunu söyledi.
- dinle0'da alan boş ve "Dinliyorum" tek başına sağda duruyor; iki kişi bunu söyledi.

Durum: dinle0 ve dinle1 görev testinde de iki turda geçmedi. Durdu, sahibe soruldu.

## Sahip kararı (2026-10-02)
"Durdur yazısı ekle". Dinlerken düğme "■ Durdur" yazılı geniş düğme olur. Alan boşken "Dinliyorum" solda durur.
Ses seviyesi göstergesi eklenmedi.

## Metin kapısı · sürüm notu ve Profil satırı
Tur 1, beş kişi:
- n1 0/5, n2 3/5, n3 2/5.
- s1 0/5, s2 **4/5 geçti**.
- Profil "Kelimeleri sesle söyle" 3/5. Uygulama kelimeleri sesli okuyacakmış gibi anlaşılıyor.

Tur 2, beş yeni kişi:
- n4 **5/5 geçti**, n5 2/5 (en iyi: n4 4/5).
- Profil etiketi: p1 "Sesle cevap" 3/5, p2 "Yazmak yerine sesle söyle" **5/5 geçti**, p3 "Kelimeleri sesle söyleme" 0/5.
  "Söyleme" olumsuz emir gibi okunuyor.

## Dinleme · sahip kararından sonra · görev testi · beş yeni kişi
| dinle0 | dinle1 | dinle2 | a | b | c |
|---|---|---|---|---|---|
| 1/5 | 0/5 | 3/5 | **5/5** | **5/5**, artık tahmin yok | **5/5** |

Bulgular:
- Ses alındığını gösteren seviye göstergesi yok; üç kişi söyledi.
- "Dinliyorum" ilk kelimede soldan sağa atlıyor; iki kişi söyledi.
- "Dinliyorum" kelimeye yapışık duruyor; iki kişi söyledi.
- Biri "ms"yi anlamadı.

Durum: sahibe soruldu.

## Sahip kararı (2026-10-02): ses seviyesi
Kartta "● Dinliyorum" yazısı ve ses çubukları var. Değerler SpeechPlugin `speechLevel` olayından gelir; yalnız 0–1
arası bir sayı, ses gitmez.

## Ses seviyesi · tur 1 · beş yeni kişi
| dinle0 | dinle1 | dinle2 | görevler |
|---|---|---|---|
| 1/5 | 3/5 | 2/5 | **5/5** |

Bulgular ve düzeltmeler:
- Dinlerken alan boştu → "Buraya yazılır".
- Satır kalkınca başlık kayıyordu → satırın yeri tutuldu.
- Düğme genişliği değişiyordu → tek genişlik, "Söyle" ve "Durdur".

## Ses seviyesi · tur 2 · beş yeni kişi
| yaz-mic | dinle0 | dinle1 | dinle2 | görevler |
|---|---|---|---|---|
| 2/5 | 2/5 | 3/5 | 2/5 | **5/5** |

Gerçek kusur: tur 1'den sonra eklenen yer tutma, 320'de "Ne gördün?" başlığını basamak etiketinin üstüne bindiriyordu.
İki kişinin H'si buna dayanıyordu. Düzeltildi: dinleme satırı ipucu yerinin içinde, mikrofonlu hâlde bu yer hep iki
satır. Öteki bulgular:
- "Buraya yazılır" edilgen bulundu.
- Halkalar arası boşluk dar.
- Dinleme bitince onay işareti yok.

Durum: sahibin seçtiği tasarım iki turda geçmedi. Sahibe soruldu.

## Sahip kararı: bir tur daha · beş yeni kişi
Düzeltmeler:
- Dinlerken alan ipucu "Söylediğin burada".
- Alanla düğme arasında 14 px.
- Dinleme bitince "✓ Duydum" ve "Doğruysa Gönder'e bas.".

| yaz-mic | dinle0 | dinle1 | dinle2 | a | b | c |
|---|---|---|---|---|---|---|
| **4/5 geçti** | **4/5 geçti** | **4/5 geçti** | **4/5 geçti** | **5/5** | **5/5** | 4/5, biri "yanlışsa ne yapacağımı tam bilmiyorum" dedi |

Her ekranda tek H aynı kişiden geldi: "ms" yazısını anlamıyor, koyu zeminde soluk yazıyı zor seçiyor.

**Sonuç: Yakala Yaz'ın mikrofonlu ekranları da 5 sn kapısından geçti.** Kalan iş sahipte, cihazda:
- Ses seviyesi çubukları gerçekten oynuyor mu?
- Uçak modunda sesle cevap çalışıyor mu?
- iOS izin penceresinin kendi cümlesi İ3 ile çelişiyor mu?

Son madde VARSAYIM: iOS'un konuşma izni penceresinde Apple'ın kendi metni de çıkabilir; bakmadım.
