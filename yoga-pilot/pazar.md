# Pazar araştırması: rehberli meditasyon, yoga ve kişisel gelişim ses uygulamaları

Nefona "Yoga" bölümü (10 ders, 30 dakikaya kadar, istenen süre seçilebilir) için hazırlandı. Tarih: 2026-09-28.

**Yöntem.** Web kaynakları kullanıldı; PubMed bu işin kapsamında değil. İki Calm anketi web'den (PMC) okundu, künyeleri aşağıda verildi. Kaynak türleri şunlar:

- Uygulama mağazası açıklamaları: Google Play ham HTML'i ve App Store sayfaları.
- Uygulamaların kendi web ve yardım sayfaları.
- App Store kullanıcı yorumları: Apple RSS akışı, uygulama başına 250–450 yorum.
- Google ve YouTube otomatik tamamlama önerileri (TR ve EN).
- YouTube Türkiye arama sonuçlarındaki görüntülenme sayıları.
- Bir üçüncü taraf anahtar kelime hacmi sitesi.

Ham veriler `_src/` klasöründe duruyor (bkz. §10).

**Kurallar.**

- Her iddianın yanında URL var.
- Sayı bulunamadıysa "bulunamadı" yazıldı.
- Sayfa açılamadığı için yalnız arama motoru özetinden gelen bilgiye "(arama özeti; sayfa 403)" notu düşüldü.
- WebFetch özetinin ham metinle tutmadığı yerler "doğrulanmadı" diye işaretlendi. Örnek: Meditopia yardım sayfası için özet "süre kontrolü, kaldığın yerden devam" demişti, ama ham HTML'de bu ifadeler yok.
- Uygulamaların sağlık iddiaları (ör. "%28 stres azalması") bilerek aktarılmadı. Nefona sağlık iddiası kullanmaz.

**Erişilemeyenler.**

- Google Trends API 429 döndü, yani Türkiye arama hacmi bulunamadı.
- businesswire.com, calm.com ve Calm/Headspace yardım merkezleri 403 döndü.

---

## 0. En önemli 12 bulgu

1. **Uyku açık ara 1 numaralı konu.**
   - Calm'ın 11.870 ücretli abonesinde başlama nedenlerinin ilki "uykuyu iyileştirmek": %62,97 ([PMC6858610](https://pmc.ncbi.nlm.nih.gov/articles/PMC6858610/)).
   - Insight Timer'ın "Popular" sıralı rehberli meditasyon listesinde 28 parçanın 16'sının adında "Sleep" geçiyor ([insighttimer.com/guided-meditations](https://insighttimer.com/guided-meditations)).
2. **Dünyada en çok dinlenen rehberli parçalardan biri bir Yoga Nidra.** Insight Timer'da "Popular" sıralamasında 1. sırada "Yoga Nidra For Sleep" var (Jennifer Piercy, 22 dk). Hem genel listede hem Sleep konu sayfasında ilk sırada ([guided-meditations](https://insighttimer.com/guided-meditations), [topics/sleep](https://insighttimer.com/meditation-topics/sleep)). "Yoga" bölümünün ses odaklı çekirdeği için en güçlü pazar sinyali bu.
3. **Stres ve kaygı uyku ile aynı üst katmanda.**
   - Calm'da başlama nedenleri: stres %62,11, depresyon/kaygı %54,47 ([PMC6858610](https://pmc.ncbi.nlm.nih.gov/articles/PMC6858610/)).
   - İngilizce Google/YouTube önerilerinde "sleep", "anxiety" ve "stress" 8 listenin 8'inde çıkıyor (§2.7).
   - Insight Timer'da 2020'nin en çok aranan üç terimi: Anxiety, Sleep, Mornings ([BusinessWire](https://www.businesswire.com/news/home/20201222005383/en/Meditators-Spent-Over-10000-Years-on-Insight-Timer-in-2020-5x-More-Than-Calm); arama özeti, sayfa 403).
4. **"Sabah" kalıcı bir arama konusu.**
   - Insight Timer konu sayfasındaki "Popular Search" satırı: Sleep, Morning, Anxiety, Nap, Healing ([meditation-topics](https://insighttimer.com/meditation-topics)).
   - kwrds.ai'ye göre "meditation in the morning" ayda 450.000 arama alıyor (üçüncü taraf tahmini; [kwrds.ai](https://www.kwrds.ai/top-keywords/meditation)).
5. **"Kendine yönelik" konular güçlü bir ikinci katman oluşturuyor.** Özgüven, kendini sevme ve öz şefkat şurada ayrı kategori olarak geçiyor:
   - Insight Timer: Self Love, Confidence
   - Meditopia: Özgüven, Kendini sevme, Şefkat
   - Headspace: self-esteem, Self-Compassion sayfaları

   İngilizce "meditation for self…" önerilerinde ilk sırada "self love" çıkıyor (§2.7).
6. **Türkiye'de YouTube'un en çok izlenen meditasyon içerikleri üç gruba toplanıyor.**
   - Uyku (6,4 milyon ve 4,5 milyon görüntülenme)
   - Olumlama / "bilinçaltı" (5,2 milyon ve 3,5 milyon)
   - "Frekans / bolluk / şifa" etiketli içerik

   Son grup Nefona'nın "sağlık iddiası yok" kuralıyla çelişiyor. Konu adı olarak alınmamalı; talep sağlıklı bir çerçeveyle karşılanmalı (§3.4).
7. **Süre seçimi sektörde standart. Tipik seçenekler:**
   - Headspace: 3/5/10 dk ([TidBITS](https://tidbits.com/2019/10/14/headspace-a-guided-meditation-companion/))
   - Healthy Minds: 5/10/15/20/30 dk ([substack inceleme](https://highergroundquest.substack.com/p/app-review-healthy-minds-for-meditation))
   - Medito: 3–30 dk ([Play](https://play.google.com/store/apps/details?id=meditofoundation.medito))
   - Waking Up: 10/20 dk ve 30/45/60 dk ([blog](https://www.norberthires.blog/meditation-at-home/), [paket](https://dynamic.wakingup.com/pack/PKQEVVQ))
   - Yoga Nidra uygulaması: 10/20/30 dk ([App Store](https://apps.apple.com/us/app/yoga-nidra-deep-relaxation/id430531216))
8. **"Her seferinde yeniden kurgulanan" ses, Nefona'nın "30'un 5'i de bütün olmalı" hedefine en yakın emsal.**
   - Balance, günlük seansı "binlerce dosyalık ses kütüphanesinden" birleştiriyor ([App Store](https://apps.apple.com/us/app/balance-meditation-sleep/id1361356590)).
   - Down Dog her başlatışta yeni bir pratik kuruyor ([Play](https://play.google.com/store/apps/details?id=com.downdogapp)).
   - Headspace sleepcast'leri her gece yeniden karıyor ki anlatı ezberlenmesin ([headspace.com/sleep/sleepcasts](https://www.headspace.com/sleep/sleepcasts)).
9. **Ses/müzik dengesi kullanıcıya bırakılıyor.** Headspace sleepcast'te "voice or the background sounds" için bir kaydırıcı var ([TidBITS](https://tidbits.com/2019/10/14/headspace-a-guided-meditation-companion/)). Bu dengede hata olursa şikâyet geliyor, örneğin HomePod'da ses ile ortam sesinden yalnız biri çalıyor (Headspace yorumu #13596251417, §6).
10. **Bir ses uygulamasını en çok yıpratan hatalar şunlar:**
    - Ekran kapanınca çalmanın durması
    - İndirilen dosyanın çevrimdışı çalışmaması
    - "Kaldığın yerden devam"ın bulunmaması
    - Uykudayken içeriğin başka bir parçaya atlayıp kullanıcıyı uyandırması

    Hepsinin gerçek yorum örneği §6'da var.
11. **Anlatıcıyla ilgili şikâyetler hep aynı noktalarda toplanıyor:**
    - Hız: "narrators speak too quickly"
    - Ton: "chirpy perky woman's voice"
    - Yaş/olgunluk: TR yorumda "genç yerine olgun ses", "toy yerine tok ses"
    - Tekrar: TR yorumda "sesin nerede ne vurgu yapacağını ezberledim"
    - Aşırı konuşma: "They talk too much"

    Sessizliğin bilinçli kullanılması ve metnin değişkenliği bu yüzden şart.
12. **Türkçe pazarda Meditopia ana referans.** Konu listesi ([Play TR](https://play.google.com/store/apps/details?id=app.meditasyon&hl=tr&gl=TR)): Stres, Endişe, Kabullenme, Şefkat, Şükretme, Mutluluk, Öfke, Özgüven, Motivasyon, Dikkat, Cinsellik, Nefes, Beden Algısı, Değişim ve Cesaret, Yetersizlik hissi, Kendini sevme, Bedeni tarama. Uyku sayfasında "yoga nidra pratikleri" de var ([yardım](https://help.meditopia.com/tr/meditopia-guide/)).

---

## 1. Uygulamaların kategori adları

| Uygulama | Kullandığı kategori / konu adları (kaynaktaki yazımıyla) | Kaynak |
|---|---|---|
| **Calm** | "Mindfulness topics: deep sleep, anxiety relief, stress relief, focus, breaking habits, self-care, personal growth, and more". Ayrıca Sleep Stories, Soundscapes, Breathwork, "Dailies: programs for social anxiety, personal growth, and mood balance" | [Google Play açıklaması](https://play.google.com/store/apps/details?id=com.calm.android&hl=en_US) (ham HTML) |
| **Headspace** | Ana bölümler: Meditate, Sleep, Focus, Kids & Families, Courses. Meditate altı: Beginning Meditation, Quick Meditation, Meditation Techniques, SOS, Calming Everyday Anxiety. Sleep altı: White Noise & Sleep Sounds, Sleepcasts, Binaural Beats, Nighttime SOS. Courses: Letting Go of Stress, Navigating Change, Relationships, Productivity. Konu sayfaları: self-esteem, Self-Compassion, happiness, Everyday Gratitude, Body Scan | [headspace.com/content](https://www.headspace.com/content), [headspace.com/meditation](https://www.headspace.com/meditation) (ham HTML'de terimler doğrulandı) |
| **Insight Timer** | Sleep Health: Sleep, Insomnia, Deep Sleep… Mental Health: Anxiety, Stress, Relaxation, Focus, Burnout, Overthinking, ADHD. Emotional Health: Self Love, Happiness, Inner Peace, Grief & Loss, Confidence, Loneliness, Anger. Spiritual Health: Life Purpose, Presence, Intuition, Awe & Wonder, Inner Wisdom. "Popular Search": Sleep, Morning, Anxiety, Nap, Healing. Practices arasında Yoga Nidra, Affirmations, Self-Compassion, Visualization | [insighttimer.com/meditation-topics](https://insighttimer.com/meditation-topics) (WebFetch, iki kez ve bağlantı biçimiyle doğrulandı) |
| Insight Timer (mağaza) | "Browse popular topics": Sleep deeply; Dealing with Anxiety and Reducing Stress; Getting through Recovery and Addictions; Self-love and Compassion; Focus and Concentration; Leadership; Better Relationships; Loving-Kindness | [Google Play](https://play.google.com/store/apps/details?id=com.spotlightsix.zentimerlite2&hl=en_US) |
| **Meditopia** (TR) | Stres, Endişe, Kabullenme, Şefkat, Şükretme, Mutluluk, Öfke, Özgüven, Motivasyon, Dikkat, Cinsellik, Nefes, Beden Algısı, Değişim ve Cesaret, Yetersizlik hissi, Kendini sevme, Daha serbest meditasyonlar, Bedeni tarama. Uyku Meditasyonları ("30'dan fazla"), Uyku Hikayeleri | [Google Play TR](https://play.google.com/store/apps/details?id=app.meditasyon&hl=tr&gl=TR) |
| Meditopia (yardım) | Uyku sayfası: "Hikâyeler, uyku meditasyonları, yoga nidra pratikleri ve uyku sesleri". İçerik türleri: Günlük Meditasyonlar, Seriler, Canlı Programlar. Başlangıç serileri: "Başlamadan Önce", "İlk Adımlar", "Meditasyona Başla I/II" | [help.meditopia.com/tr/meditopia-guide](https://help.meditopia.com/tr/meditopia-guide/) (ham HTML) |
| **Medito** | "quick daily calm, focus boosts, anxiety SOS, mindful walking, loving-kindness". Paketler: "Students, Sleep, Anxiety, Stress, Well being" | [Google Play](https://play.google.com/store/apps/details?id=meditofoundation.medito) |
| **Balance** | 10 günlük Plans (Foundations, Advanced). Singles: morning meditation, "Relax, Energize, and Concentrate". Sleep: sleep meditations, sleep stories, wind-down. Teknikler: "Breath Focus, Body Scan, and more" | [Google Play](https://play.google.com/store/apps/details?id=com.elevatelabs.geonosis), [App Store](https://apps.apple.com/us/app/balance-meditation-sleep/id1361356590) |
| **Waking Up** | Teknikler: "mindfulness (Vipassana), Loving-Kindness, body scans, yoga nidra, and nondual awareness". Konular: "neuroscience, psychology, Stoicism, ethics, psychedelics, productivity, and happiness". Bölümler: Sleep, Meditation Timer, Daily Meditations | [Google Play](https://play.google.com/store/apps/details?id=org.wakingup.android) |
| **Healthy Minds** | Dört sütun: Awareness ("Find Your Calm"), Connection ("Grow Your Kindness"), Insight ("Know Yourself Better"), Purpose ("Live What Matters") | [humin.org/wellbeing-tools/app](https://www.humin.org/wellbeing-tools/app) |
| **Down Dog** (yoga) | Yoga pratiği; "Meditation - guided sessions for stress, sleep, focus, and mindfulness" | [Google Play](https://play.google.com/store/apps/details?id=com.downdogapp) |

**Ölçek (mağaza verisi, 2026-09-28).**

| Uygulama | İndirme | Puan | Yorum / puan sayısı |
|---|---|---|---|
| Calm | Play 50M+ | 4,5 | 616K yorum; App Store "2M Ratings" |
| Headspace | Play 10M+ | 4,3 | 340K yorum |
| Insight Timer | Play 10M+ | 4,7 | App Store 447K puan |
| Meditopia | Play 10M+ | 4,5 | App Store TR 74 B puan, 4,8, "#22 Sağlık ve Fitness" |
| Balance | Play 1M+ | 4,6 | – |
| Medito | Play 1M+ | 4,8 | – |
| Waking Up | Play 1M+ | 4,6 | App Store 43K puan |
| Healthy Minds | Play 500K+ | 4,8 | – |
| Down Dog | Play 5M+ | 4,9 | – |

Kaynak: ilgili Play sayfalarının ham HTML'i (`_src/play_*.html`) ve App Store sayfaları.

---

## 2. Yayımlanmış popülerlik verisi

### 2.1 Calm ücretli abone anketi (n=12.151)

Huberty J. ve ark., *JMIR mHealth uHealth* 2019. PMID 31682582, DOI [10.2196/15648](https://doi.org/10.2196/15648). Tam metin: [PMC6858610](https://pmc.ncbi.nlm.nih.gov/articles/PMC6858610/).

**Başlama nedenleri:**

| Neden | Oran |
|---|---|
| Uyku | %62,97 (7475/11.870) |
| Stres | %62,11 (7373/11.870) |
| Depresyon/kaygı | %54,47 (6465/11.870) |
| Genel sağlık | %40,05 (4754/11.870) |

**En çok kullanılan bileşenler:**

| Bileşen | Oran |
|---|---|
| Meditasyonlar | %80,20 (9497/11.841) |
| Sleep Stories | %55,66 (6591/11.841) |

**Kullanım sıklığı ve araçlar:**

- Haftada 5 ve üzeri kullanım: %60,03.
- En çok kullanılan araçlar: takip %36,62, hatırlatıcı %15,81.
- Oturum süresi ve günün saati: bulunamadı (çalışmada raporlanmamış).

### 2.2 Calm uyku anketi (n=9.868)

*JMIR Formative Research* 2020. PMID 33185552, DOI [10.2196/19508](https://doi.org/10.2196/19508). Tam metin: [PMC7695531](https://pmc.ncbi.nlm.nih.gov/articles/PMC7695531/).

- Kötü uyuyanların %81,77'si Calm'ı "uykuyu iyileştirmek" için indirmiş.
- Uyku içeriği bileşenlerine göre kullanım oranı: bulunamadı (çalışmada yok).

### 2.3 Insight Timer 2020 yıl özeti

- "Anxiety, Sleep and Mornings" yılın en çok aranan üç terimi.
- Topluluk 18 milyon kişi, 5,6 milyar dakika meditasyon.
- Kaynak: [BusinessWire](https://www.businesswire.com/news/home/20201222005383/en/Meditators-Spent-Over-10000-Years-on-Insight-Timer-in-2020-5x-More-Than-Calm). Arama özeti; sayfa WebFetch ve curl ile 403 verdi, ifade iki ayrı aramada aynı çıktı.
- 2024–2026 için benzer yıl özeti: bulunamadı.

### 2.4 Insight Timer "Popular" listeleri (2026-09-28)

**Genel rehberli meditasyon listesi.** Sayfa arayüzünde "Popular / Newest" seçimi var; liste "Popular" sırasında görünüyor. Sıralamanın ölçütü (dinlenme sayısı mı) doğrulanmadı ([insighttimer.com/guided-meditations](https://insighttimer.com/guided-meditations)).

- İlk 10:
  1. Yoga Nidra For Sleep (22 dk)
  2. Floating (59)
  3. Deep Sleep (69)
  4. Rain & Thunder Sound Therapy (92)
  5. Deep Sleep Guided Meditation (61)
  6. Breathing Into Sleep (17)
  7. Deep Healing (22)
  8. Two Hours Of Tranquility (122)
  9. Delta Waves & Oceanic Sounds (59)
  10. Peaceful Sleep Meditation (34)
- 28 parçanın 16'sının adında "Sleep" geçiyor.
- 2 parça "Morning": Morning Meditation With Music (10 dk), Morning Ritual (10 dk).
- 1 parça kaygı: Mindfulness For Releasing Anxiety (23 dk).
- Adında "Yoga Nidra" geçen 2 parça: 22 ve 29 dk.
- Listede sürelerin çoğu 15–35 dk aralığında; ses/müzik parçaları 59–181 dk.
- Parça başına dinlenme sayısı sayfada yok: bulunamadı.

**Sleep konu sayfası** ([topics/sleep](https://insighttimer.com/meditation-topics/sleep)):

- İlk sıra yine "Yoga Nidra For Sleep" (22 dk).
- 6. sırada "Yoga Nidra For Sleep & Rest" (The StillPoint, 29 dk).

### 2.5 Calm Sleep Stories

- Yazar Phoebe Smith'in sayfasına göre "Blue Gold" (anlatıcı Stephen Fry) "the world's single most popular Sleep Story … listened to by some two million people a month".
- Aynı sayfa: 300'den fazla Sleep Story toplam "some 150 million times" dinlenmiş.
- Kaynak: [phoebe-smith.com/calm](http://www.phoebe-smith.com/calm/) (ham HTML). Sayfanın tarihi doğrulanmadı. Blue Gold'un süresi (24 dk) arama özetinde geçiyor; bu sayfada doğrulanmadı.

### 2.6 Anahtar kelime hacmi (üçüncü taraf tahmini, dünya geneli, Eylül 2026)

Kaynak: [kwrds.ai/top-keywords/meditation](https://www.kwrds.ai/top-keywords/meditation).

| Anahtar kelime | Aylık arama |
|---|---|
| meditation music | 2.740.000 |
| meditation | 2.240.000 |
| sleep and meditation | 823.000 |
| meditation in the morning | 450.000 |
| joe dispenza meditation | 450.000 |
| mindful meditation | 301.000 |
| 10 minute meditation | 246.000 |

- Bu tahmin yöntemi doğrulanmadı.
- Türkiye için eşdeğer hacim: bulunamadı. Google Trends 429 verdi.

### 2.7 İngilizce Google ve YouTube otomatik tamamlama (hl=en, gl=us, 2026-09-28)

Otomatik tamamlama sıralaması hacim değildir, sık aranan kalıpları gösterir. Ham çıktı: `_src/google_suggest_en.txt`.

**Konuların listelerde görünme sayısı.** 8 liste taranmıştır: "meditation for", "guided meditation for", "10 minute meditation for" ve "5 minute meditation for", her biri Google ve YouTube'da.

| Konu | Liste sayısı |
|---|---|
| sleep | 8/8 |
| anxiety | 8/8 |
| stress | 8/8 |
| kids | 8/8 |
| beginners | 6/8 |
| healing | 5/8 |
| relaxation | 4/8 |
| focus | 3/8 |
| confidence | 2/8 |
| energy | 2/8 |
| positive | 2/8 |
| overthinking | 2/8 |
| depression | 2/8 |
| gratitude | 1/8 |
| manifestation | 1/8 |

**Diğer listeler:**

- "meditation for self…": self love, self compassion, self confidence, self esteem, self worth, self forgiveness, self care, self healing, self discovery.
- "yoga nidra for…": sleep, deep sleep, anxiety, **"sleep 10 minutes"**, **"sleep 30 minutes"**, **"sleep 15 minutes"**, beginners, healing, insomnia. Yani kullanıcılar süreyi arama sorgusunun içine yazıyor.
- "affirmations for…": kids, women, men, anxiety, confidence, self love, sleep, money, success.

### 2.8 Bulunamayanlar

- Headspace'in kategori bazında en çok dinlenen içerik verisi: bulunamadı. Yalnız arama özetinde "Rainday Antiques, Midnight Launderette, Cat Marina" adları geçiyor; kaynak sayfa doğrulanmadı.
- Calm'ın kategori bazında dinlenme dağılımı: bulunamadı.
- Meditopia'nın Türkiye'de en çok dinlenen içerik verisi: bulunamadı. Kamuya açık bir kaynak yok.
- Türkiye için Google Trends karşılaştırması: bulunamadı (429).

---

## 3. Türkçe: insanların gerçekten aradığı terimler

### 3.1 Google otomatik tamamlama (hl=tr, gl=tr, 2026-09-28)

Ham çıktılar: `_src/google_suggest_tr_1.txt` ve `_src/google_suggest_tr_2.txt`.

| Kök | Öneriler (sırayla, kısaltılmış) | Not |
|---|---|---|
| meditasyon | nedir · müziği · nasıl yapılır · müzikleri · **müziği uyku** · günah mı · müziği dinle · faydaları | Müzik ve uyku öne çıkıyor. "meditasyon k…" önerilerinde **"meditasyon kaç dakika yapılır"** var, yani süre sorusu aranıyor |
| uyku meditasyonu | dinle · çocuk · müziği · (kanal adları) · **sözleri** · nasıl yapılır | 10 öneri, geniş uzun kuyruk |
| sabah meditasyonu | **5 dakika** · nasıl yapılır · (kanal adları) · sabah olumlama meditasyonu · sabah şükür meditasyonu | 10 öneri; kısa süre açıkça aranıyor |
| beden taraması | meditasyonu · (Zümra Atalay) · nedir · nasıl yapılır · ne işe yarar · mindfulness · somatik | 10 öneri |
| yoga nidra | nedir · **türkçe** · nsdr · nasıl yapılır · **metni** · (Zeynep Aksoy) | Türkçe içerik açığa işaret ediyor |
| nefes egzersizi | nasıl yapılır · aleti · ne işe yarar · faydaları · **4 7 8** | 10 öneri |
| olumlama | **cümleleri** · nedir · olumlamalar · nasıl yapılır · şarkısı · dinle · **meditasyon** | 10 öneri |
| kaygı meditasyonu | kaygı endişe · korku kaygı · stres ve kaygı meditasyonu | 4 öneri |
| kendini sevme meditasyonu | (kanal) · **kendini sevme ve özgüven meditasyonu** | 3 öneri |
| özgüven meditasyonu | **özgüven yükseltme meditasyonu** | 2 öneri. "özgüven" kökü tek başına daha çok "nasıl kazanılır / eksikliği" gibi soru ve tanım aramaları getiriyor |
| kendini tanıma | **testi** · sorular · sanatı · kitap · 100 soru | Talep var ama meditasyon biçiminde değil, test/soru biçiminde |
| farkındalık | ne demek · cehennemdir (kitap) · akademisi · eğitimi | Kavram ve kitap aramaları |
| rahatlama | **duası** · kitabı · müziği · uyku müziği · seansı · ne yapılır | Dini ve müzik bağlamı güçlü |
| iç huzur | için dua · nasıl sağlanır · esma | Dini bağlam |
| odaklanma | ilacı · sorunu · takviye · **müziği** | Meditasyon biçiminde değil |
| bolluk meditasyonu / şifa meditasyonu | dinle · bereket · para · uykuda şifa · bedene şifa | 10'ar öneri, yüksek talep. Sağlık iddiası riski için §3.4'e bakın |
| minnettarlık meditasyonu | (öneri yok) | Türkçede "şükür / şükran" kullanılıyor |
| 5 dakika meditasyon / 10 dakika meditasyon | yalnız kendisi | Süreli arama var ama kuyruğu kısa |

### 3.2 YouTube otomatik tamamlama (ds=yt, hl=tr, gl=tr)

Ham çıktı: `_src/youtube_suggest_tr.txt`.

| Kök | Öneriler |
|---|---|
| meditasyon | müziği · uyku · nasıl yapılır · **olumlama** · enerji frekansı · (mistik yol) |
| uyku meditasyonu | çocuk · asmr · bebek · (Elvin) · frekans · müziği · **olumlama** |
| yoga nidra | **türkçe** · for sleep · (Zeynep Aksoy) · meditasyon · (Hakan Kireçkaya) · (Damla Dönmez) · uyku · nedir |
| özgüven | subliminal · **özgüven meditasyonu** · özgüven eksikliği · frekansı |
| olumlama | olumlamalar · şarkıları · asmr · cümleleri · frekans · **sabah** · meditasyonu |
| rahatlama | duası · videoları · **meditasyonu** · müzikleri · frekansı · sesi |
| kendini sevme | kendini sevmek · **kendini sevme meditasyonu** · sanatı · podcast |
| sabah meditasyonu | (Çetin Çetintaş, Elvin, Joe Dispenza) · **5 dk** · olumlama · müziği · (Metin Hara) |

### 3.3 YouTube Türkiye arama sonuçlarında görüntülenme

Ölçüt: her aramada ilk 8 sonuç içindeki en çok izlenen içerik. Ham çıktılar: `_src/yt_1.txt`, `yt_2.txt`, `yt_3.txt`.

Uyarılar:

- Görüntülenme birikimli; video yaşı farklı ve normalize edilmedi.
- Sonuç sırası YouTube'un alaka sıralaması. Çerezsiz istek atıldı, tr/TR yerel ayarı kullanıldı.

| Arama | En çok izlenen rehberli/sözlü içerik | Süre | Görüntülenme | URL |
|---|---|---|---|---|
| uyku meditasyonu | "Derin Uyku Meditasyonu (4.5 Hz Theta Dalgalarıyla)" – mistik yol | 1:00:24 | 6.439.515 | [PhejuF8i9hU](https://www.youtube.com/watch?v=PhejuF8i9hU) |
| 〃 | "DERİN DİNLENME VE UYKU Meditasyonu" – mistik yol | 30:01 | 4.477.838 | [rq52iDYPe_A](https://www.youtube.com/watch?v=rq52iDYPe_A) |
| 〃 | "Uykusuzluk çekenler için 12 dakikalık uyku meditasyonu" | 12:30 | 1.709.822 | [468w5VNBDhc](https://www.youtube.com/watch?v=468w5VNBDhc) |
| olumlamalar | "21 GÜNDE HAYATINI DÖNÜŞTÜR!!! … OLUMLAMALARI" – mistik yol | 30:01 | 5.201.651 | [SMMPHly3S-Y](https://www.youtube.com/watch?v=SMMPHly3S-Y) |
| 〃 | "BİLİNÇALTINI Pozitif PROGRAMLAMA Olumlamaları" | 1:06:33 | 3.537.602 | [oIK1DGvk2U4](https://www.youtube.com/watch?v=oIK1DGvk2U4) |
| stres atma meditasyonu | "Stresten Arınma ve Uyku Meditasyonu" – mistik yol | 20:41 | 1.856.162 | [CE4EmmhBPLY](https://www.youtube.com/watch?v=CE4EmmhBPLY) |
| 〃 | "5 Dakikada Stresi Rahatlatma Meditasyonu" – **Meditopia TR** | 7:35 | 543.118 | [-PLmqbAJD8c](https://www.youtube.com/watch?v=-PLmqbAJD8c) |
| şükür meditasyonu | "5 DAKİKALIK ŞÜKÜR OLUMLAMALARI…" – mistik yol | 5:41 | 1.396.329 | [N37jUD0YfdY](https://www.youtube.com/watch?v=N37jUD0YfdY) |
| rahatlama meditasyonu | "ZİHİN TEMİZLEME MEDİTASYONU" – Psk. Özlem Tokgöz Özsoylar | 15:50 | 1.031.021 | [Zokato_Ph_s](https://www.youtube.com/watch?v=Zokato_Ph_s) |
| 〃 | "3 Dk'lık Rahatlama Meditasyonu" – Meditopia TR | 3:20 | 252.528 | [1Zr3SR0MTvY](https://www.youtube.com/watch?v=1Zr3SR0MTvY) |
| özgüven meditasyonu | "ÖZSEVGİ ÖZDEĞER ÖZGÜVEN Olumlamaları" – mistik yol | 35:21 | 822.454 | [4n-BAEfV8cU](https://www.youtube.com/watch?v=4n-BAEfV8cU) |
| 〃 | "Özgüven Yükseltme Meditasyonu" – Psk. Özlem Tokgöz Özsoylar | 29:19 | 330.979 | [JyLqI4AEAqQ](https://www.youtube.com/watch?v=JyLqI4AEAqQ) |
| sabah meditasyonu | "10 Dakikada Enerjini ve Motivasyonunu Yükselt – Sabah Meditasyonu" – Elvin ile Yoga | 11:02 | 698.842 | [lTICC1XHQTI](https://www.youtube.com/watch?v=lTICC1XHQTI) |
| nefes meditasyonu | "Wim Hof Yöntemiyle Uygulamalı Nefes Egzersizi" (TR) | 11:00 | 581.065 | [A_e7s_Qu9lo](https://www.youtube.com/watch?v=A_e7s_Qu9lo) |
| 〃 | "SUFİ NEFESİ MEDİTASYONU – 15 DAKİKA" – Metin Hara | 21:01 | 576.508 | [9ZlH8qe_rLI](https://www.youtube.com/watch?v=9ZlH8qe_rLI) |
| 〃 | "Aşamalı Gevşeme (Uzun)" – Hasan Arslan | 29:24 | 500.606 | [4auJDhMtV8U](https://www.youtube.com/watch?v=4auJDhMtV8U) |
| farkındalık meditasyonu | "MINDFULNESS TEKNİĞİ İLE STRESİ YEN" – Psk. Özlem Tokgöz Özsoylar | 47:26 | 525.305 | [i3mwJH7Gt3c](https://www.youtube.com/watch?v=i3mwJH7Gt3c) |
| bolluk meditasyonu | "Bolluk Bereket Meditasyonu" | 17:43 | 505.117 | [M4FlPn35RBM](https://www.youtube.com/watch?v=M4FlPn35RBM) |
| iç çocuk meditasyonu | "İçindeki Çocuğu İyileştirme Meditasyonu" – mistik yol | 25:28 | 408.782 | [F72pW7ukP-Q](https://www.youtube.com/watch?v=F72pW7ukP-Q) |
| kaygı meditasyonu | "ANKSİYETE MEDİTASYONU" – Metin Hara | 11:33 | 361.935 | [K2NPGDjsK3k](https://www.youtube.com/watch?v=K2NPGDjsK3k) |
| kendini sevme meditasyonu | "ÖZ ŞEFKAT MEDİTASYONU İLE KENDİNLE BARIŞ" – Psk. Özlem Tokgöz Özsoylar | 12:45 | 312.113 | [WP4ZSBi253o](https://www.youtube.com/watch?v=WP4ZSBi253o) |
| 〃 | "Kendini Sevmek İçin Meditasyon ve Nefes Çalışması" – Elvin ile Yoga | 18:27 | 291.962 | [gh3TfXCHpRw](https://www.youtube.com/watch?v=gh3TfXCHpRw) |
| beden taraması meditasyonu | "Beden Tarama Meditasyonu (Her gün uygulayabilirsin)" – Çetin Çetintaş | 43:22 | 201.836 | [bmj51tW5PKM](https://www.youtube.com/watch?v=bmj51tW5PKM) |
| yoga nidra türkçe | "Yoga Nidra/ Yoga Uykusu/ Beden Taraması" – Zeynep Aksoy Reset | 31:43 | 83.827 | [R4M4G4xkV00](https://www.youtube.com/watch?v=R4M4G4xkV00) |
| 〃 | "Yoga Nidra (Derin Dinlenme Pratiği)" – Çetin Çetintaş | 18:05 | 74.592 | [GFDdJxn78lE](https://www.youtube.com/watch?v=GFDdJxn78lE) |
| kendini tanıma meditasyonu | "Dönüşüm: Kendini Tanımaya Başlamak" – Hasan Arslan | 12:13 | 72.942 | [Vy27VwCLoYQ](https://www.youtube.com/watch?v=Vy27VwCLoYQ) |
| odaklanma meditasyonu | "ODAKLANMA MEDİTASYONU" – Yeşim Bayraktar | 13:11 | 71.322 | [oPCaG0_U-go](https://www.youtube.com/watch?v=oPCaG0_U-go) |
| affetme meditasyonu | "Affetme Meditasyonu" – Reyhan İldaş | 33:27 | 59.087 | [e0Q_OHsQGTY](https://www.youtube.com/watch?v=e0Q_OHsQGTY) |
| yoga başlangıç (hareketli, karşılaştırma için) | "Yoga Başlangıç Serisi - 1" – Ayse Yoga Dynamics | 21:24 | 2.646.726 | [Ko-1-oZpEVM](https://www.youtube.com/watch?v=Ko-1-oZpEVM) |
| 〃 | "Yeni Başlayanlar İçin 10 Dakikalık Sabah Yogası" – Elvin ile Yoga | 12:13 | 2.380.981 | [m970B6ZNL3s](https://www.youtube.com/watch?v=m970B6ZNL3s) |

**Tablonun gösterdiği:**

- **Sıralama.** Uyku, olumlama, stres/rahatlama, şükür ve sabah, Türkçe meditasyonun en çok izlenen konuları. Özgüven ve kendini sevme ikinci halkada. Kendini tanıma, odak, affetme ve Türkçe Yoga Nidra daha niş.
- **Yoga Nidra'da Türkçe açık.** Türkçe Yoga Nidra görüntülenmesi düşük (en fazla ~84 bin). Otomatik tamamlamada ise "yoga nidra türkçe" ve "yoga nidra metni" aranıyor. Dünyada 1 numara olan bir formatın Türkçesi zayıf; bu bir pazar açığı.
- **Süre.** Kısa süreli ve adında süre geçen içerik iyi performans gösteriyor: "5 Dakikada Stresi Rahatlatma" 543 bin, "12 dakikalık uyku" 1,7 milyon, "10 Dakikada … Sabah" 699 bin.
- **Anlatıcılar.** Kadın sesler (Özlem Tokgöz Özsoylar, Elvin, Meditopia) ile erkek sesler (Metin Hara, Çetin Çetintaş, Hasan Arslan) izlenmede yan yana üst sıralarda. Hangi cinsiyetin daha çok dinlendiği: bulunamadı.

### 3.4 Kaçınılacak dil (popüler ama Nefona kuralıyla çelişen)

- **Neyin yaygın olduğu.** Türkçe üst sıralarda şu vaat ve iddialar sık:
  - "4.5 Hz Theta", "432/528 Hz frekans"
  - "bilinçaltı programlama", "çekim yasası", "21 günde hayatını dönüştür"
  - "şifa", "bolluk/para"
  - "Stres, Kaygı ve Depresif Durumların İyileştirilmesi"

  Kaynaklar §3.3'teki başlıklar ve §3.2'deki öneriler.
- **Nefona neden kullanmaz.** Nefona sağlık iddiası kullanmaz; bu dil sağlık iddiası ve kanıtlanmamış mekanizma içeriyor.
- **Talebin karşılanma yolu.**
  - "Olumlama" talebi, kanıtı PubMed ekibince değerlendirilecek bir öz-değer ve niyet cümleleri çerçevesiyle karşılanabilir.
  - "Şükür" talebi, bir şükran pratiğiyle karşılanabilir.
  - "Şifa" talebi, "bedeni dinlendirme" diliyle karşılanabilir.
  - "frekans / Hz" ifadesi hiç kullanılmamalı.

---

## 4. Uygulamaların sunduğu oturum süreleri

| Uygulama | Süreler | Kaynak |
|---|---|---|
| Headspace | Basics kursu 10 rehberli meditasyon; her birinde "select a 3-, 5-, or 10-minute version and pick between a male or female guide". Sleepcast "45-55 minutes". Güncel mağaza metni: "3-minute mental resets or longer mindful meditations" | [TidBITS 2019](https://tidbits.com/2019/10/14/headspace-a-guided-meditation-companion/) (ham HTML), [sleepcasts](https://www.headspace.com/sleep/sleepcasts), [Play](https://play.google.com/store/apps/details?id=com.getsomeheadspace.android) |
| Calm | "Whether you have 3 minutes or 3 hours". Timer: Timed ya da Open-Ended; süre "a few minutes up to several hours", aralık zilleri "every 5 or 10 minutes" (arama özeti; destek sayfası 403). Bir kullanıcı: "meditations are only available in ~10, ~8, and ~1 minute. A 5 minute option would be great" | [Play](https://play.google.com/store/apps/details?id=com.calm.android&hl=en_US), [Calm Help](https://support.calm.com/hc/en-us/articles/1260802102610-How-to-Use-the-Timed-Open-Ended-Meditation-Timers), App Store yorumu #14386337774 |
| Insight Timer | Süre filtresi: "0–5 / 6–10 / 11–15 / 16–20 / 21–30 / 30+ minutes". Yardım metnine göre 6–10 dk "the sweet spot for depth without commitment". Konu sayfasındaki etiketler farklı: "Short (0-5), Long (5-30), Extended (30+)". Kişiselleştirilebilir Timer | [Yardım](https://help.insighttimer.com/support/solutions/articles/67000722612-content-creation-making-the-most-of-the-lengths-filter-on-insight-timer) (ham HTML), [topics/sleep](https://insighttimer.com/meditation-topics/sleep) |
| Medito | "Choose a length – 3 to 30 mins" | [Play](https://play.google.com/store/apps/details?id=meditofoundation.medito) |
| Healthy Minds | "Options from 5, 10, 15, 20 or 30 minutes"; oturmalı ya da "active" seçimi | [inceleme](https://highergroundquest.substack.com/p/app-review-healthy-minds-for-meditation), [humin.org](https://www.humin.org/wellbeing-tools/app) ("choose a custom time length") |
| Waking Up | Günlük: "10 or 20-minute recordings". Longer Meditations paketi: 30 / 45 / 60 dk, her süreden 9 kayıt | [blog](https://www.norberthires.blog/meditation-at-home/) (ham HTML), [paket](https://dynamic.wakingup.com/pack/PKQEVVQ) |
| Balance | App Store: "bite-sized … 3-10 minutes" (WebFetch özeti). Common Sense: "a few minutes to about 15 minutes", "choose the length" | [App Store](https://apps.apple.com/us/app/balance-meditation-sleep/id1361356590), [Common Sense Media](https://www.commonsensemedia.org/app-reviews/balance-meditation-sleep) |
| Yoga Nidra – Deep Relaxation (Madhav West) | "3 different lengths … 10 min, 20 min and 30 min"; doğa sesleri Forest/Ocean/Rain; müzik aç/kapa | [App Store](https://apps.apple.com/us/app/yoga-nidra-deep-relaxation/id430531216) |
| Huberman NSDR | 10, 20 ve 30 dakikalık protokoller | [hubermanlab.com/nsdr](https://www.hubermanlab.com/nsdr) |
| Down Dog | "a full on hour long practice or a quick 10-20 minute one" | [App Store](https://apps.apple.com/us/app/down-dog-great-yoga-anywhere/id983693694) |
| Meditopia | App Store TR'de 2017 tarihli bir kullanıcı yorumu: "nefes çalışacaksınız da 5-10-15 dakikalık süreler tanımlanmış". Bu bir özellik açıklaması değil; güncel durum doğrulanmadı. YouTube'da 3 dk ve 5 dk içerikleri var (§3.3) | [App Store TR](https://apps.apple.com/tr/app/meditopia-meditasyon-uyku/id1190294015?l=tr) (ham HTML) |

**Özet.** Pazarda 5 / 10 / 15 / 20 / 30 basamakları standart; 3 dk en kısa uç. Nefona'nın "istediğin dakika" hedefi bu standardın ötesine geçiyor. Aynı zamanda "5 dk seçeneği yok" şikâyetini doğrudan karşılıyor (Calm yorumu #14386337774).

---

## 5. Süreyi seçtirme desenleri

1. **Önceden kaydedilmiş sürümler** (Headspace 3/5/10, Waking Up 10/20, Yoga Nidra uygulaması 10/20/30, Healthy Minds 5–30).
   - Artısı: her sürüm baştan sona kurgulanmış, kapanışı var.
   - Eksisi: seçenekler sınırlı; aradaki süreler yok.
2. **Dinamik birleştirme / her seferinde yeni kurgu.**
   - Balance: "Using an audio library of thousands of files, Balance assembles a daily guided meditation" ([App Store](https://apps.apple.com/us/app/balance-meditation-sleep/id1361356590)).
   - Down Dog: "builds a brand-new yoga practice every time you press start — tailored to your level, focus, pace, and time" ([Play](https://play.google.com/store/apps/details?id=com.downdogapp)).
   - Headspace sleepcast: "remixed each night … you can't memorize the narrative" ([sleepcasts](https://www.headspace.com/sleep/sleepcasts), ham HTML).
   - Nefona için en uygun emsal bu desen: 5 dk da 30 dk da açılış, gövde ve kapanış içeren bir bütün olarak kurulabilir.
3. **Timer ve sessizlik / ortam sesi.**
   - Calm Timed ve Open-Ended, aralık zilleriyle.
   - Insight Timer Timer.
   - Waking Up "Meditation Timer—customize your own sessions".
   - Rehberlik yok ya da çok az; süre tamamen kullanıcıda.
4. **Filtreyle seçim.** Insight Timer'da süre kovası, ses tipi (kadın/erkek) ve müzikli/müziksiz filtre var. Kullanıcı yorumu: "I love the ability to search and be able to include filters like length of time, subject matter, voice type, with or without music" (Insight Timer yorumu #14534370595).
5. **Arama sorgusunda süre.** Kullanıcılar süreyi aramaya yazıyor: "yoga nidra for sleep 10 minutes / 15 / 30", "sabah meditasyonu 5 dakika", "meditasyon kaç dakika yapılır" (§2.7, §3.1).

---

## 6. Ses oynatıcı UX: iyi ve kötü desenler

Yorumların kaynağı Apple müşteri yorumu RSS'i, 2026-09-28'de çekildi. Adres biçimi: `https://itunes.apple.com/{us|tr}/rss/customerreviews/page={1..10}/id={uygulamaId}/sortBy=mostRecent/json`.

| Uygulama | Kimlik (ID) |
|---|---|
| Calm | 571800810 |
| Headspace | 493145008 |
| Insight Timer | 337472899 |
| Balance | 1361356590 |
| Medito | 1500780518 |
| Waking Up | 1307736395 |
| Meditopia | 1190294015 |

"#" ile verilen numaralar yorum kimliğidir. Toplanan yorum sayısı: Calm 250, Headspace 450, Insight Timer 450, Balance 350, Medito 350, Waking Up 400, Meditopia TR 250, Meditopia US 300 (`_src/appstore_reviews.json`).

### 6.1 İyi desenler

| Desen | Kanıt |
|---|---|
| Ses ↔ ortam sesi kaydırıcısı | Headspace sleepcast: "a slider to make the voice or the background sounds more prominent" ([TidBITS](https://tidbits.com/2019/10/14/headspace-a-guided-meditation-companion/)) |
| Anlatıcı seçimi (kadın/erkek) | Headspace "pick between a male or female guide" (TidBITS); Balance "choose … a male or a female voice" ([Common Sense](https://www.commonsensemedia.org/app-reviews/balance-meditation-sleep)); Down Dog "Choose from 6 different yoga teachers" ([Play](https://play.google.com/store/apps/details?id=com.downdogapp)). TR talep: "hep aynı kadın sesini duymak hoşuma gitmiyor bunu değiştirmek mümkün…" (Meditopia TR #12249782172) |
| Arka planda ve ekran kapalı çalma | Medito: "Background audio – keep meditating or listening to sleep sounds with your screen off" ([Play](https://play.google.com/store/apps/details?id=meditofoundation.medito)). Calm Timer'da ekran kilitliyken ortam sesi ve zillerin sürdüğü söyleniyor (arama özeti; [Calm Help](https://support.calm.com/hc/en-us/articles/1260802102610-How-to-Use-the-Timed-Open-Ended-Meditation-Timers), 403) |
| Çevrimdışı indirme | Medito "Offline mode – download any session"; Insight Timer Premium "Listen offline"; Meditopia Premium'da seri veya tek meditasyon indirme ([yardım](https://help.meditopia.com/tr/meditopia-guide/), ham HTML) |
| Kaldığın yerden devam, ileri/geri sarma | Insight Timer Premium "Advanced Player (Repeat mode, Fast forward and Rewind, Pick-up where you left off)" ([Play](https://play.google.com/store/apps/details?id=com.spotlightsix.zentimerlite2)) |
| Zil kuyruğunun kesilmemesi | "The timer has some of the best recordings of meditation bells—which don't cut off the sustain tail" (Insight Timer #14448425041) |
| Önizleme | "If I tapped a track before, it played 20-30 seconds … I could tell if I liked the subject, voice, music, background, recording quality" (Insight Timer #14453202441; özellik kaldırılınca şikâyet edilmiş) |
| "Rastgele çal" | Headspace Sleep sayfasında "Play Random" düğmesi ([TidBITS](https://tidbits.com/2019/10/14/headspace-a-guided-meditation-companion/)) |
| Kurgu ilkesi | Uyku hikâyesi yazarı Phoebe Smith: "Anything exciting needs to go right at the start and then it's all about winding people down" ([phoebe-smith.com/calm](http://www.phoebe-smith.com/calm/)). Headspace sleepcast yapısı: önce "wind down", sonra "narrated tour … complete with a soundtrack" ([sleepcasts](https://www.headspace.com/sleep/sleepcasts)) |

### 6.2 Kötü desenler (gerçek şikâyetler)

| Sorun | Alıntı / kimlik |
|---|---|
| Ekran kapanınca durma | "it has a tendency to … stop timing when the screen turns off" (Insight Timer #14258324489); "loses the ability to keep playing … when the phone screen turns off. Requiring me to constantly unpause" (Waking Up #12963578708) |
| Uykudayken başka içeriğe atlama, sert geçiş | "After 30 mins, it changes to a different sound. The change in sound woke me up because it's jarring" (Calm #14473860790); "soundscapes now no longer … loop … will play another unrelated soundscape … has woken me up" (Calm #14485300366); "App still stops playing after 30 minutes" (Calm #14472584315) |
| Uyku zamanlayıcısının kaldırılması | "Sleep timer removed from playlists" (Calm #14489060208); "I can't set a timer so it plays all night long" (Calm #14480269017) |
| Timer'ın son ayarı unutması | "Before, the timer setting defaulted to what was last set (eg 15 mins). Now it always starts at an ho[ur]" (Calm #14527933891) |
| Çevrimdışı çalışmama | "downloaded meditations … just don't work consistently" (Headspace #14415397683); "doesn't work when offline … I was on a plane" (Headspace #13826741702); "only thing I wish I could do is download meditations" (Balance #13907063514); "can't listen to my library offline" (Waking Up #11413138335) |
| Kaldığı yeri bulamama | "no clear place to pick up where you left off" (Headspace #13717065727); "the entire app resets and you cannot recall where you left off" (Headspace #13741330079); "no recent history to … pick up where you left off" (Medito #11296202245) |
| Ses ile ortam sesinin birlikte çalmaması (AirPlay/HomePod) | "balancing the voice and the sound. It either only plays the voice or only the sound. Almost never both" (Headspace #13596251417) |
| Ortam sesi kesilmesi / çalışmaması | "background sounds just stop 3 sec after I play them" (Medito #10298160639); TR: "arka plan sesleri anında değişmiyor. Hatta bazıları çalışmıyor" (Meditopia #11565068440); "ayarlamama rağmen arka planda ses yok" (Meditopia #11549469452) |
| Ortam sesi baskınlığı | Bir meditasyon oyununda (PLAYNE): "bird sounds … too loud and occur too frequently"; kaydırıcılar 0'da iken seslerin sürmesi ([Steam tartışması](https://steamcommunity.com/app/865540/discussions/0/1837937637880497185)) |
| Anlatıcı hızı ve tonu | "A number of narrators speak too quickly, which negates the calming effect" (Calm #14481295813); "a chirpy perky woman's voice presents it" (Calm #14386902771); "guided by amateurs who speak in abrupt sentences without a calm and soothing voice" (Waking Up #14215845093) |
| Ses yaşı / tınısı (TR) | "Konuşan kişinin sesi evet tatlı ve yumuşak ama genç. Hayat deneyimi olan, olgun bir ses daha iyi hissettirirdi" (Meditopia #11502206095); "Toy hikaye anlatıcıları yerine daha tok sesler tercih edilmeli" (Meditopia #11614497901) |
| Fazla konuşma, tekrar | "They talk too much — It is hard to focus when you have a robot voice talking all the time and being repetitive" (Balance #12470107610); TR: "sesin nerede ne vurgu yapacağını bile ezberlediğimden … meditasyondan kopmak çok kolay hale geldi" (Meditopia #12334912305) |
| Pil | Sleepcast dinlerken "my iPhone 11 Pro battery is reduced by about 10%" ([reviewed.com](https://www.reviewed.com/sleep/features/headspace-app-sleep-content-review)) |
| Kalabalık arayüz | Headspace "a loud space with too many options to choose" (#14000917026) |

### 6.3 Platform kuralları (Apple HIG, "Playing audio")

Kaynak: [developer.apple.com/design/human-interface-guidelines/playing-audio](https://developer.apple.com/design/human-interface-guidelines/playing-audio), JSON içeriği `_src/design_human-interface-guidelines_playing-audio.txt`.

- Kategori seçimi. "Playback" kategorisi için HIG'in tanımı: "Sound is essential … Doesn't respond to the silence switch … Can play in the background". Meditasyon oynatıcısı bu tanıma uyuyor.
- Kulaklık davranışı: "when disconnecting headphones, they expect playback to pause immediately".
- Karışım: "Your app can adjust relative, independent volume levels to achieve a great mix of audio, but the system volume always governs the final output." Yani ses/müzik oranı uygulamada ayarlanır, sistem sesine dokunulmaz.
- Kesintiden sonra: "When an interruption ends, determine whether to resume audio playback automatically … a media playback app … can check to be sure the type is resumable before continuing playback."
- Kontroller: "Avoid repurposing audio controls."
- Kilit ekranı ve Denetim Merkezi entegrasyonu (Now Playing): Apple örnek projesinin gövde metni JSON'da yok, doğrulanmadı ([sayfa](https://developer.apple.com/documentation/mediaplayer/becoming-a-now-playable-app)).

---

## 7. 15 aday konu: sıralı liste ve kanıt

**Sütunlar:**

- **K**: 8 uygulamadan (Calm, Headspace, Insight Timer, Meditopia, Medito, Balance, Waking Up, Healthy Minds) kaçının bu konuyu doğrulanmış kaynakta konu/kategori olarak adlandırdığı (§1).
- **EN**: §2.7'deki 8 İngilizce otomatik tamamlama listesinden kaçında geçtiği.
- **TR**: YouTube TR'de ilk 8 sonuçtaki en yüksek rehberli görüntülenme (§3.3) ve Google TR öneri sayısı (§3.1).

Sıralama bu üç sinyal ile §2'deki tüketim verisinin birlikte yorumlanmasıyla yapıldı. Tek bir sayısal formül kullanılmadı.

| # | Aday konu (Türkçe ad önerisi) | K | EN | Tüketim / arama kanıtı | TR sinyali | Risk / not |
|---|---|---|---|---|---|---|
| 1 | **Uykuya geçiş** (Yoga Nidra ile) | 7/8 | 8/8 | Calm başlama nedeni %62,97 ([PMC6858610](https://pmc.ncbi.nlm.nih.gov/articles/PMC6858610/)); Insight Timer "Popular" listesinde 1. sırada "Yoga Nidra For Sleep", 28 parçanın 16'sı "Sleep" ([guided-meditations](https://insighttimer.com/guided-meditations)); "Popular Search" 1. terim ([topics](https://insighttimer.com/meditation-topics)); "sleep and meditation" 823 bin/ay ([kwrds.ai](https://www.kwrds.ai/top-keywords/meditation)) | 6,44 milyon / 4,48 milyon ([PhejuF8i9hU](https://www.youtube.com/watch?v=PhejuF8i9hU), [rq52iDYPe_A](https://www.youtube.com/watch?v=rq52iDYPe_A)); "uyku meditasyonu" 10 öneri | Uyku için "tedavi, insomnia" dili kullanılmamalı |
| 2 | **Derin rahatlama, stresi bırakma** | 6/8 | stress 8/8, relaxation 4/8 | Calm başlama nedeni stres %62,11 (PMC6858610); Insight Timer "Mental Health: Stress, Relaxation" | 1,86 milyon ([CE4EmmhBPLY](https://www.youtube.com/watch?v=CE4EmmhBPLY)); 1,03 milyon ([Zokato_Ph_s](https://www.youtube.com/watch?v=Zokato_Ph_s)); Meditopia TR 5 dk 543 bin ([-PLmqbAJD8c](https://www.youtube.com/watch?v=-PLmqbAJD8c)) | Sahibin istediği "rahatlama". dataHub'da stres → `calm` alanı (dataHub.js:26) |
| 3 | **Kaygılı anlarda sakinleşme** | 6/8 | 8/8 | Insight Timer 2020 en çok aranan terim "Anxiety" ([BusinessWire](https://www.businesswire.com/news/home/20201222005383/en/Meditators-Spent-Over-10000-Years-on-Insight-Timer-in-2020-5x-More-Than-Calm); arama özeti); Calm'da depresyon/kaygı %54,47; Headspace "Calming Everyday Anxiety" ([content](https://www.headspace.com/content)) | 362 bin ([K2NPGDjsK3k](https://www.youtube.com/watch?v=K2NPGDjsK3k)); "kaygı meditasyonu" 4 öneri | En yüksek iddia riski. "Anksiyete tedavisi" denmemeli; "zor anlar için sakinleşme pratiği" gibi adlandırılmalı |
| 4 | **Derin dinlenme: Yoga Nidra, beden taraması** (gündüz, uyumadan) | 5/8 | "yoga nidra for…" listesinde sleep, anxiety, 10/15/30 dk | Yoga Nidra: Insight Timer practice türü ve 1 numaralı parça; Waking Up teknikleri; Meditopia Uyku sayfası. Body Scan: Headspace, Meditopia "Bedeni tarama", Balance. NSDR 10/20/30 dk ([hubermanlab](https://www.hubermanlab.com/nsdr)) | "beden taraması" 10 öneri; Çetin Çetintaş 202 bin ([bmj51tW5PKM](https://www.youtube.com/watch?v=bmj51tW5PKM)); "yoga nidra türkçe" ve "yoga nidra metni" aranıyor ama içerik az (en fazla 84 bin) | Bölüm adı "Yoga" olduğu için imza ders adayı. Türkçe pazarda açık var |
| 5 | **Sabah: güne niyetle başlamak** | 2/8 | – (ayrı sinyal) | Insight Timer "Popular Search: Morning"; 2020'nin 3. terimi "Mornings"; "meditation in the morning" 450 bin/ay (kwrds.ai); Insight Timer listesinde 2 sabah parçası (10'ar dk) | 699 bin ([lTICC1XHQTI](https://www.youtube.com/watch?v=lTICC1XHQTI)); "sabah meditasyonu" 10 öneri, içinde "5 dakika" var | Kısa süreli (5–10 dk) kullanım için doğal konu |
| 6 | **Özgüven** | 3/8 | confidence 2/8; "meditation for self confidence" | Insight Timer "Confidence"; Meditopia "Özgüven"; Headspace self-esteem sayfası ([meditation](https://www.headspace.com/meditation)) | 822 bin olumlama biçimi ([4n-BAEfV8cU](https://www.youtube.com/watch?v=4n-BAEfV8cU)); 331 bin rehberli ([JyLqI4AEAqQ](https://www.youtube.com/watch?v=JyLqI4AEAqQ)); "özgüven yükseltme meditasyonu" | Sahibin istediği konu. "Subliminal / frekans" türü içerikten ayrışmalı |
| 7 | **Kendini sevme, öz şefkat** | 3/8 (+Calm "self-care") | "meditation for self…" listesinde 1. öneri self love | Insight Timer "Self Love", "Self-love and Compassion"; Meditopia "Kendini sevme", "Şefkat"; Headspace "Self-Compassion" | 312 bin ([WP4ZSBi253o](https://www.youtube.com/watch?v=WP4ZSBi253o)); 292 bin ([gh3TfXCHpRw](https://www.youtube.com/watch?v=gh3TfXCHpRw)); "kendini sevme ve özgüven meditasyonu" | dataHub'da "Kendine şefkat" → `self` alanı (dataHub.js:27) |
| 8 | **Nefesle denge** (nefes farkındalığı) | 6/8 | – | Calm breathwork; Meditopia "Nefes"; Balance "Breath Focus"; Medito ve Headspace breathing | 581 bin ([A_e7s_Qu9lo](https://www.youtube.com/watch?v=A_e7s_Qu9lo)); 577 bin ([9ZlH8qe_rLI](https://www.youtube.com/watch?v=9ZlH8qe_rLI)); "nefes egzersizi" 10 öneri, içinde "4 7 8" | Her dersin tekniği olarak da gerekli. Ayrı ders olursa tekrarı önlemek için ayrıştırılmalı |
| 9 | **Odak ve zihinsel berraklık** | 6/8 | 3/8 | Headspace "Focus" ana bölüm; Insight Timer "Focus and Concentration"; Meditopia "Dikkat"; Balance ve Medito | Rehberli içerik zayıf (71 bin, [oPCaG0_U-go](https://www.youtube.com/watch?v=oPCaG0_U-go)); talep daha çok "odaklanma müziği" | Nefona'da `focus` alanı mevcut (dataHub.js:1-2, 199) |
| 10 | **Şükran** | 2/8 | 1/8 (YT "5 minute meditation for gratitude") | Meditopia "Şükretme"; Headspace "Everyday Gratitude" ([meditation](https://www.headspace.com/meditation)) | 1,40 milyon olumlama biçimi ([N37jUD0YfdY](https://www.youtube.com/watch?v=N37jUD0YfdY)); rehberli 64–81 bin; "sabah şükür meditasyonu" | Türkçede "şükür" sözcüğü dini çağrışım taşıyor. "Şükran / minnettarlık" seçimi ürün kararı |
| 11 | **Olumlama: kendine iyi gelen cümleler** | 1/8 (Insight Timer practice "Affirmations") | "affirmations for…" listesinde confidence, anxiety, self love | "olumlama cümleleri", "olumlama meditasyon" önerileri | En yüksek ham TR talep: 5,20 milyon ([SMMPHly3S-Y](https://www.youtube.com/watch?v=SMMPHly3S-Y)), 3,54 milyon ([oIK1DGvk2U4](https://www.youtube.com/watch?v=oIK1DGvk2U4)) | Çekim yasası ve bilinçaltı programlama dilinden tamamen arındırılmalı (§3.4). Ayrı ders yerine başka derslerin kapanışında kullanılabilir |
| 12 | **Kendini tanıma, içe bakış** (gelişim) | 6/8 (kişisel gelişim ve içgörü olarak) | "meditation for self discovery" | Calm "personal growth"; Headspace "personal growth" (TidBITS); Healthy Minds "Insight: Know Yourself Better", "Purpose"; Insight Timer "Life Purpose, Inner Wisdom"; Meditopia "hayat amacı" | "kendini tanıma testi / 100 soru / sanatı" aranıyor; rehberli 73 bin ([Vy27VwCLoYQ](https://www.youtube.com/watch?v=Vy27VwCLoYQ)) | Sahibin istediği "gelişim / kendini geliştirme"nin en doğrudan karşılığı. TR'de talep meditasyondan çok soru ve test biçiminde |
| 13 | **Sevgi dolu şefkat, ilişkiler** (metta) | 6/8 | – | Insight Timer "Loving-Kindness", "Better Relationships"; Medito "loving-kindness"; Waking Up "Loving-Kindness"; Headspace "Relationships" kursu; Healthy Minds "Connection"; Meditopia "ilişkiler" | Öz şefkat videoları 312 bin; "Şefkat Meditasyonu" 32 bin | Kendini sevme dersiyle ayrışması gerekiyor: biri içe dönük, biri başkalarına dönük |
| 14 | **Bırakmak, kabullenmek, affetmek** | 2/8 (Meditopia "Kabullenme"; Headspace "Letting Go of Stress") | "meditation for self forgiveness" | – | Affetme en fazla 59 bin; iç çocuk 409 bin ([F72pW7ukP-Q](https://www.youtube.com/watch?v=F72pW7ukP-Q)) | "İç çocuğu iyileştirme" terapötik iddia taşıyor, önerilmez. "Bırakma" çerçevesi güvenli |
| 15 | **Canlılık, mutluluk, motivasyon** | 5/8 (Meditopia Mutluluk ve Motivasyon; Insight Timer Happiness; Headspace happiness; Waking Up happiness; Balance "Energize") | energy 2/8, positive 2/8 | – | Enerji ve motivasyon içerikli sabah videosu 699 bin (5. aday ile örtüşüyor) | Sabah dersiyle birleştirilebilir |

**Listeye alınmayan popüler konular:**

- "Healing / şifa" (EN 5/8, TR 10 öneri) ve "bolluk / para": sağlık ve kanıtsız iddia riski taşıyor.
- "Kids / çocuk" (EN 8/8): hedef kitle dışında.
- "Beginners / başlangıç" (EN 6/8): konu değil, bir çerçeve. İlk ders ya da her dersin ilk dinleyişi "başlangıç dostu" olmalı. Headspace'in Basics kursu da 10 rehberli meditasyondan oluşuyor ([TidBITS](https://tidbits.com/2019/10/14/headspace-a-guided-meditation-companion/)).
- "Depression / ADHD / Burnout": klinik çağrışım taşıyor.

---

## 8. Sahibin saydığı konulara eşleme ve 10 derslik pazar önerisi

Sahip "meditasyon, gelişim, özgüven, kendini geliştirme, rahatlama" gibi en popüler 10 konuyu istedi. Kesin seçimi PubMed kanıt işiyle birlikte vermek gerekiyor; aşağıdaki öneri yalnız pazar verisine dayanıyor.

| Ders | Konu | Sahibin sözcüğüyle eşleşme | Nefona alanı (dataHub.js:1-2) |
|---|---|---|---|
| 1 | Uykuya geçiş (Yoga Nidra) | meditasyon, rahatlama | İyi oluş (`sleep` → `wellbeing`, dataHub.js:28) |
| 2 | Derin rahatlama, stresi bırakma | rahatlama | Sakinlik (dataHub.js:26) |
| 3 | Kaygılı anlarda sakinleşme | rahatlama | Sakinlik |
| 4 | Derin dinlenme: Yoga Nidra / beden taraması | meditasyon | Beden / Farkındalık |
| 5 | Sabah niyeti | gelişim | Dikkat / İyi oluş |
| 6 | Özgüven | özgüven | Kendine yaklaşım |
| 7 | Kendini sevme, öz şefkat | kendini geliştirme | Kendine yaklaşım (dataHub.js:27) |
| 8 | Nefesle denge | meditasyon | Sakinlik / Farkındalık |
| 9 | Odak ve berraklık | gelişim | Dikkat |
| 10 | Kendini tanıma, içe bakış | gelişim, kendini geliştirme | Farkındalık / Kendine yaklaşım |

Yedek adaylar: Şükran (10), Sevgi dolu şefkat (13), Bırakmak (14), Olumlama (11). Olumlama, kendine yönelik derslerin kapanış cümlesi olarak kullanılabilir.

Alan eşlemesi öneridir. dataHub.js'de modülün alanı `progress.domain` ile bildiriliyor (dataHub.js:13-14, 36-38); Yoga modülünün manifesti henüz yok.

---

## 9. Pazar verisinden tasarıma çıkarımlar

Bunlar çıkarımdır, kanıt değildir. Her birinin dayandığı bölüm yanında verildi.

1. **Süre seçici.** 5 / 10 / 15 / 20 / 30 dk basamakları sektör standardı (§4). "İstediğin dakika" desteklenecekse bile bu hazır basamaklar ön seçim olarak gösterilmeli. Son seçilen süre hatırlanmalı: Calm'da bu özellik kaldırılınca şikâyet geldi (#14527933891).
2. **5 dakikanın da bir bütün olması.** Balance, Down Dog ve Headspace gibi segmentlerden kurgulama (§5.2). Her süre açılış, gövde ve kapanış içermeli. Uyku hikâyelerindeki "başta ilgi, sonra yavaşlama" ilkesi kısa sürümde de korunmalı (§6.1).
3. **Metinde değişkenlik.** Aynı dersin tekrarında cümle ve imge havuzundan farklı seçim yapılmalı. Gerekçe: ezberleme ve kopma şikâyeti (Meditopia #12334912305) ve Headspace'in gece gece yeniden karışımı.
4. **Ses ve müzik.**
   - Anlatıcı seçimi sunulmalı: Neslihan / Hakan (§6.1).
   - Ses ↔ ortam dengesi için kaydırıcı olmalı (§6.1).
   - Ortam sesi baskın ve seyrek olmamalı (PLAYNE ve Calm şikâyetleri).
   - İki kanal çalınıyorsa AirPlay/HomePod'da birlikte yönlendirilmesi test edilmeli (#13596251417).
5. **Oynatıcı.** Şunlar zorunlu sayılmalı:
   - Ekran kapalı arka planda çalma (Playback kategorisi, HIG).
   - Kulaklık çıkınca durma.
   - Telefon araması gibi kesintiden sonra koşullu devam.
   - Çevrimdışı indirme.
   - Kaldığın yerden devam.
   - Uykuda başka içeriğe asla otomatik geçmeme ve sonda yumuşak sönme.
   - Zil kuyruğunu kesmeme.

   Kaynaklar: §6.2 ve §6.3.
6. **Anlatım.** Acele etmeyen hız, olgun ve tok tını, "cıvıl cıvıl" olmayan ton, az konuşup çok sessizlik (§6.2). Bu çıkarım, sahibin "dünyanın en iyi yoga hocası" beklentisiyle örtüşüyor.
7. **Dil.** Frekans, bilinçaltı ve şifa dili kullanılmamalı (§3.4). Türkçe Yoga Nidra içeriği az (§3.3), bu bir farklılaşma fırsatı.

---

## 10. Ham veri dosyaları

Tümü `/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/_src/` altında.

| Dosya | İçerik |
|---|---|
| `google_suggest_tr_1.txt`, `google_suggest_tr_2.txt` | Google TR otomatik tamamlama ham JSON'u |
| `youtube_suggest_tr.txt` | YouTube TR otomatik tamamlama |
| `google_suggest_en.txt` | Google ve YouTube EN otomatik tamamlama |
| `yt_1.txt`, `yt_2.txt`, `yt_3.txt`, `yt.py` | YouTube TR arama sonuçları (başlık, kanal, süre, görüntülenme, videoId) ve betik |
| `appstore_reviews.json`, `rev.py`, `review_snippets.txt` | App Store RSS yorumları ve tema alıntıları |
| `play_*.html` / `play_*.txt` | Google Play sayfaları ve açıklama metinleri |
| `as_*.txt`, `meditopia_tr.txt` | App Store sayfa metinleri |
| `meditopia_guide.txt` | Meditopia yardım rehberi (ham) |
| `tidbits.html` | TidBITS Headspace incelemesi (ham) |
| `www_headspace_com_*.html` | Headspace sayfaları (ham) |
| `design_human-interface-guidelines_playing-audio.txt` | Apple HIG metni |

## 11. Doğrulanmayanlar ve bulunamayanlar (toplu)

**Doğrulanmadı:**

- Calm Timer ayrıntıları (süre aralığı, zil aralığı, kilit ekranı): yalnız arama özetinden. Destek sayfası 403 verdi.
- Insight Timer 2020 "en çok aranan" üçlüsü: yalnız arama özetinden. BusinessWire 403 verdi.
- Blue Gold süresi (24 dk).
- Insight Timer "Popular" sıralamasının ölçütü.
- Meditopia yardım sayfası için WebFetch'in verdiği "arka plan sesi seçimi, süre kontrolü, zamanlayıcı, kaldığın yerden devam": ham metinde bu ifadeler yok.
- Meditopia'da 5-10-15 dk seçeneği: yalnız 2017 tarihli bir kullanıcı yorumunda geçiyor.
- Apple "Becoming a now playable app" gövde metni.
- Calm kategorilerinden "Relationships" ve "Emotions": yalnız arama özetinde. Play açıklamasında yok.

**Bulunamadı:**

- Türkiye arama hacmi (Google Trends 429 verdi).
- Headspace ve Calm'ın kategori bazında dinlenme dağılımı.
- Meditopia'nın Türkiye içerik popülerliği.
- Insight Timer'da parça başına dinlenme sayısı.
- Oturum süresi dağılımı (kullanıcıların gerçekte kaç dakika dinlediği): hiçbir uygulama için kamuya açık veri yok.
