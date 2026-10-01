# G1 · kullanıcıya görünen yeni ya da değişen metinler (SAHİP ONAYI BEKLİYOR)

Kaynak: G1 iş akışı düzeltme adımı. Değişim sözcükleri ANA_OTURUM_ISTEMI §3'e göre yalnız: "başlangıcından iyi", "değişim yok",
"henüz belli değil", "başlangıç". Gerilemede sözcük yok, işaretli sayı var.

## Doktoruma göster (PDF)
- Göz hapı: "başlangıcından iyi" / "değişim yok".
- WHO-5 parantezi: "(başlangıcından iyi)" / "(değişim yok)"; gerilemede parantez yok.
- Metrik değerlendirmesi dört sözcükle; gerilemede işaretli fark ("−2").
- Değer sütunu: "başlangıç 164 ms", "son 46 ms".
- Düzen paragrafı: "Alan başına kaydı olan gün (ilk kayıttan beri | son 28 gün): … Mola, su, alarm sabahı ve Apple Sağlık'ta
  kişinin kendi ortancasına ulaşan adımlı günler dâhil. Bu beş alan, aşağıdaki tablolarda ve CSV dosyasında geçen alanları
  şöyle toplar: Göz; Dikkat = Dikkat ve Farkındalık; Nefes = Sakinlik; Ruh hâli = İyi oluş ve Kendine yaklaşım; Hareket = Beden."
- Ölçü kuralı dipnotu: "…ilk 1–2 ölçüm günü alışmadır… standart sapmasının 1,5 katını aşar (yayımlanmış eşik varsa o eşiğe
  ulaşır)… İki bakış arasında yeni ölçüm yoksa önceki değerlendirme sürer. Fark ilk bakışta görülüp henüz doğrulanmadıysa ya da
  son 3 ölçüm günü son 28 günde değilse "henüz belli değil" yazılır. Doğrulanmış gerilemede değerlendirme sütununa farkın
  kendisi işaretli sayı olarak yazılır."

## CSV
- Yeni ölçü adları: "mola", "su", "alarm sabahı", "adımlı gün".
- Not: "adım kişinin kendi ortancasına ulaştı; adım sayısı dosyaya yazılmaz".

## 5. gün raporu
- Metrik satırı: "<ölçü> (<alan>): 4 → 6 harf · n ölçüm" ve dört sözcüklü hap.
- Dipnot: "\"Başlangıç\": ilk ölçüm günlerinden sonra 6 günlük başlangıç oluşuyor; değişim ondan sonraki haftalarda değerlendirilir."
- Etki hapı: "henüz belli değil" / "başlangıç".
- WHO-5: "İlk puanın 60. Yeni ölçümün zamanı geldi." ve "… 10 puan ve üstü değişim anlamlı sayılır: puanın başlangıcından iyi."
  (ya da ": değişim yok.")

## Sürüm notu (öneri, id '2026-10-01-8')
- change: "Doktoruma göster (PDF), CSV ve 5. gün raporu ölçümlerin değişimini aynı kuralla yazar: aynı günün ölçümleri tek değer
  sayılır; fark ancak iki haftalık bakışta sürerse değişim denir."
- new: "CSV dosyasında mola, su, alarm sabahı ve adımlı günler de satır olur; adım sayısı dosyaya yazılmaz."
- new: "Takvimde mola ya da su verdiğin günler küçük bir noktayla görünür; haftalık hedefe sayılmaz."
- fix: "E testi sırasında kamera durunca kamerasız kalan tek ölçüm görme serini ve uyarıyı artık silmez."
- fix: "\"Tüm verileri sil\" bakış kalibrasyonunu da siler."
- fix: "5. gün raporunda iyi oluş: ikinci ölçümden sonra son puanın ve ilk ölçümden değişim yazar."

## G2'de ekrana çıkacak veri metinleri (bilgi; G2 kapısında ayrıca onaya gelir)
"Stres: Epey → Biraz", "Uyku 8/10", "Hareketli gün 3 → 5/7", "Dinlenmişlik 4,5 → 6,5", "Dikkat: 4 → 6 harf, başlangıcından iyi".
