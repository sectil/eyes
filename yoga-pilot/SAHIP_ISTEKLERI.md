# Yoga bölümü: sahibin istekleri (kelimesi kelimesine, 2026-09-28)

1. "bir yoga bölümü yapmanı istiyorum 10 bölümden oluşacak, biri isteğe bağlı 30'ar dakikalık ama ben 5 dakikasını da dinleyebilirim veya istediğim dakikasını dinleyebilirim... pub med üzerinden araştırma yap.. dersleri belirle, sözleri ve arka plan müziklerini ayarla.. ama yol haritasına ekleyeceğiz tabii gelişim istatistiklerine ekleyeceğiz... meditasyon gelişim özgüven kendini geliştirme rahatlama gibi en popüler 10 konudan oluşacak. mükemmel olacak hem tasarım hem dersler... ses anlaşılır ve kesilmeyecek olacak... net anlaşılır müzik ve ses kombinasyonu mükemmel olacak dinlediğimde bana göre hipnoz olmalıyım 10 derste... eğer mükemmel değilse sakın bana gönderme sadece mükemmel olduğuna inandığın şeyi gönder... tasarım sesler kompozisyon yazılar mükemmel olmalı.. pubmed makaleleri çok dikkatli incelemelisin... kusursuz olmalı."
2. "yoga veya meditasyon kusursuz olacak elevenlabs seslendirmeleri arka plan sesleri konuşan yönlendirme ve meditasyonlar mükemmel her şey tam uyumlu olacak... ses - arka plan - görsel önemli. zamanlayıcı önemli kullanıcı belki 30 dakikanın 5 dakikasını dinleyecek.... mükemmel dünyanın en iyi yoga hocası olmalı unutma. eğer mükemmel görmüyorsan ve kusursuz değilse bana asla olmuş gibi yazma cevap verme"
3. "Bir kusur görürsem ne olduğunu açıkça söyleyeceğim diyorsun ama benim istediğim kusur mükemmel olunacaya kadar düzeltmen bana sormana gerek yok... ben mükemmel bir iş bekliyorum."
   → KURAL: kusuru sormadan düzelt, kusursuz olana kadar yinele; sahibine yalnız bitmiş ve ölçülmüş iş.
4. "yogada 10 ders olacak unutma derslik benzersiz olacak... pubmed.. kimse sıkılmayacak 30 dakika hayranlıkla dinleyeceğiz ve meditasyon yapacağız ... kusursuz bir hoca anlatımı olacak... elevenlabs seslerini eğitmen gerekecek ayrıca"
   → Her ders benzersiz (teknik, anlatı yayı, müzik, görsel); 30 dk sıkmadan tutan kurgu (çeşitlilik, imge yayı, sessizlik ritmi);
     ElevenLabs sesi meditasyon hocası anlatımına göre "eğitilecek": ses ayarları (stability/style/speed), telaffuz sözlüğü,
     gerekirse creative_design_voice ile hoca sesi tasarımı; nesnel ölçüm + dinleme örnekleri; en iyisi pilot derste.

Sonraki aşamaya (metin + ses + tasarım iş akışı) bu dosya olduğu gibi verilecek.
5. "ayrıca yoga düzgün türkçe ile yapılacak.. cümle düşüklüğü olmayacak profesyonel bir iş istiyorum"
   → Her ders metni ayrı bir Türkçe editör incelemesinden geçer: TDK yazımı, anlatım bozukluğu / cümle düşüklüğü
     (özne-yüklem uyumu, eksik öğe, gereksiz sözcük, yanlış ek, çeviri kokan yapı), doğal konuşma dili ve söyleyiş;
     seslendirmeden sonra her cümle yazıya geri çevrilir (ElevenLabs transcribe) ve metinle harf harf karşılaştırılır,
     yanlış vurgu/telaffuz varsa o cümle yeniden üretilir.

## Sahibin kararları (2026-09-29, AskUserQuestion)
- Seslendirme yolu: **Yalnız mevcut bağlantı (MCP)**. API anahtarı yok. → eleven_v4 (ölçüm: eklemleme 5,63 hece/sn,
  Scribe'da metin birebir) ya da v2; hız/kararlılık/seed yok; yavaşlık klipler arası sessizlikle; her klip için birkaç
  çekim (generations_count) ölçülüp en iyisi seçilir. v3 yön etiketi kullanılmaz (etiket okundu).
- Hoca sesi: **Neslihan, Hakan + yeni aday**. ElevenLabs ses tasarımıyla (creative_design_voice) derslere özel bir
  "hoca sesi" adayı; pilotta üçü kör karşılaştırılır, sahibi dinleyip seçer.
