// Kanıt kartları. İçerik: docs/arastirma/SENTEZ_RAPORU.md (PMID'ler PubMed ile doğrulandı).
// Kural: her iddia bir kaynağa dayanır; sınırlar açıkça yazılır.

export const EVIDENCE = [
  {
    id: 'acuity',
    title: '"E hangi yönde" testi',
    claim: 'Yakın görme keskinliğini evde ölçer ve zaman içinde takip eder.',
    level: 'Orta',
    basis:
      'Akıllı telefon görme testleri klinik tablolarla karşılaştırılmış ve uyumlu bulunmuştur. Harf boyutu, ekranının kart ile kalibrasyonu sayesinde doğru ölçekte çizilir.',
    limits:
      'Klinikte, gözetim altında tablet ve telefonla yapılan yakın görme testi tekrarlandığında, iki sonuç arasındaki fark çoğunlukla ±0,2 logMAR (2 satır) içinde kalıyor; evde bu fark daha büyük olabilir. Bu yüzden tek teste bakmıyoruz: art arda son 3 testin her biri başlangıç değerinden (ortanca, yani sıralanınca ortadaki değer) aynı yönde en az 0,10 farklıysa bunu değişim olarak işaretliyoruz; sık test edenlerde son 7 günün ortancası da bu kadar ayrılmalı. Bu test göz muayenesinin yerini tutmaz.',
    sources: [
      'Joseph ve ark. 2023, Aphelion: tablet E testi, test-tekrar ±0,18 (PMID 38015309)',
      'Katibeh ve ark. 2022, Peek Near Vision (PMID 36583912)',
      'Han ve ark. 2019, Vision at Home: yakın test-tekrar (PMID 31440424)',
      'Wu ve ark. 2024, WHOeyes (PMID 38514167)',
      'Steren ve ark. 2021, uygulamalarda harf boyutu hataları (PMID 33443550)',
    ],
  },
  {
    id: 'trend',
    title: 'Gelişim grafiği ve uyarılar',
    claim: 'Gerçek değişimi testler arasındaki olağan oynamadan ayırmaya çalışır; kalıcı kötüleşmede doktora yönlendirir.',
    level: 'Orta',
    // Karar 2026-09-29: E testi ilk günden haftada bir (lib/trend.js WEEKLY_MIN_BASELINE_TESTS). 3 → 7 test: VARSAYIM,
    // limits'te açıkça yazar. Kaynaklar PubMed MCP ile doğrulandı (2026-09-29).
    // İnceleme 2026-09-29 (metin, 2 tur): Rosser 2003'ün "0,2 ayrılır, 0,1 ayrılmaz" bulgusu ETDRS çizelgesiyle, sağlıklı
    // gönüllülerde, okuma mesafesi değiştirilerek taklit edilen değişim içindir (makalede klinik ortam yok); telefon testine aynen taşınmaz (acuity kartı telefon testinin ±0,2 oynadığını söyler). "Tek
    // teste dayalı ev takibinde yanlış alarm çok yüksek" cümlesi Faes 2021'de yok (orada %6,1, "düşük"): %93 bulgusu
    // Yu 2021 (ForeseeHome, gerçek kullanım, bir merkezde 52 uyarının 47'si), PubMed MCP ile doğrulandı. Metinde yüzde değil
    // sayılar: makalede yazarların oranı %93,2, 47/52 ise %90,4 (makale kendi içinde tutarsız).
    // Simülasyon sayıları (limits): kural_sim, 10 000 kişi × 26 hafta, haftalık test, test başına SD 0,05 / 0,065 /
    // 0,08 / 0,10; büyüme yalnız kötüleşmede durur (2026-09-29 düzeltmesi). Yanlış uyarı (sarı ya da kırmızı) bir
    // gözde %0,7 / %4,3 / %10,3 / %19,4, kişi başına (sağ, sol, iki göz) %2,5 / %11,7 / %28 / %48,1; yanlış kırmızı kişi
    // başına %0 / %0,1 / %0,8 / %4,9.
    basis:
      "İlk test (ilk 7 gün) alışma sayılır; tekrarlı ölçümde ilk sonuç biraz farklı çıkabiliyor. Başlangıç değeri, ilk haftadan sonraki ilk testlerin ortancasıdır: 3 haftalık test tamamlanınca (en erken 22. gün) hazır olur ve yeni testlerle 7 teste kadar güçlenir. Her gün test edenlerde başlangıç, 8.–21. günlerdeki en az 7 testin ortancasıdır. Uyarı için tek kötü sonuç yetmez; art arda 3 sonuç gerekir. Sağlıklı gönüllülerle ETDRS çizelgesinde yapılan bir deneyde 0,20'lik değişim ölçüm oynamasından güvenle ayrılabildi, 0,10'luk ayrılamadı; telefon testinin oynaması daha büyük olduğu için tek teste değil art arda 3 teste bakılır. Başka bir ev takip cihazının gerçek kullanımında, bir merkezdeki 52 uyarının 47'si yanlış çıktı.",
    limits:
      'Kurallar yayımlanmış çalışmalardan ve ev takip sistemlerinden uyarlanmıştır; bu uygulama için ayrıca doğrulanmamıştır. Haftalık başlangıcın 3 testle kurulup 7 teste kadar büyümesi bir varsayımdır: kendi simülasyonumuzla seçildi, bir çalışmayla sınanmadı. Bu simülasyonda, gerçek değişim yokken 26 haftada en az bir yanlış uyarı olasılığı, test başına oynamaya göre bir gözde %0,7 ile %19,4 arasında çıktı; sağ, sol ve iki göz ayrı değerlendirildiği için bir kişide %2,5 ile %48,1 arasında. Yanlış kırmızı uyarı olasılığı bir kişide en çok %4,9 çıktı. Haftada bir testte ilk uyarı en erken 36. günde çıkabilir; 8.–21. günlerde başlayan bir değişim başlangıç değerine karışır, uyarı vermez. Haftada bir testle küçük (0,10) bir değişim, her gün test etmeye göre daha geç görülür.',
    sources: [
      'Faes ve ark. 2021, akıllı telefonla ev takibinde yanlış alarmlar ve öngörü değeri (PMID 33414531)',
      'Yu ve ark. 2021, bir ev takip cihazının (ForeseeHome) gerçek kullanımı: bir merkezde 52 uyarının 47\'si yanlış (PMID 32810682)',
      'Rosser ve ark. 2003, ETDRS çizelgesinin değişime duyarlılığı, sağlıklı gönüllülerde: 0,2 ayrılır, 0,1 ayrılmaz (PMID 12882770)',
      'Arditi ve Cagenello 1993, harf çizelgesiyle görme keskinliği ölçümünün tekrarlanabilirliği (PMID 8425819)',
      'Lim ve ark. 2010, üç çizelgede test–tekrar test oynaması ve küçük alışma etkisi (PMID 19557025)',
    ],
  },
  {
    id: 'reading',
    title: 'Okuma testi',
    claim: 'Yazı küçüldükçe rahat okuduğun en küçük boyu bulur.',
    level: 'Düşük–Orta',
    basis: 'MNREAD ve Radner okuma kartlarının mantığını izler; yazılar bu uygulama için yazıldı.',
    limits:
      'Klinik olarak doğrulanmış bir test değil. Telefonda ölçülen hız kâğıttakinden farklı çıkar. Sonuçlarını yalnızca aynı telefondaki önceki sonuçlarınla karşılaştır.',
    sources: ['Altınbay, Şahlı, İdil 2022, MNREAD-TR tablet ve basılı karşılaştırması, Turk J Ophthalmol (PMID 35770299)'],
  },
  {
    id: 'blink',
    title: 'Göz kırpma egzersizi',
    claim: 'Tam göz kırpmayı hatırlatır; ekran başında göz konforunu destekler.',
    level: 'Orta',
    basis:
      'Kuru göz yakınması olan kişilerde yapılan kontrollü çalışmalarda göz kırpma egzersizleri yakınmaları ve yarım göz kırpmayı azalttı.',
    limits: 'Egzersiz bırakılınca etki yaklaşık 2 haftada kayboldu. Tedavi değildir.',
    sources: [
      'Wolffsohn ve ark. 2025 (PMID 40467388)',
      'Arita ve ark. 2025 (PMID 39920919)',
      'Kim ve ark. 2020 (PMID 32409236)',
    ],
  },
  {
    id: 'brain',
    title: 'Görme ve beyin sağlığı',
    claim: 'Görmeni düzenli kontrol ettirmeni öneririz.',
    level: 'Gözlemsel',
    basis:
      'Tedavi edilmemiş görme kaybı, bilişsel gerileme ve demans ile ilişkili bulunmuştur. Bu ilişki gözlemsel çalışmalardan gelir.',
    limits:
      'Bu uygulamadaki test ya da egzersizlerin beyin sağlığını iyileştirdiği ya da demansı önlediği gösterilmemiştir ve böyle bir iddiamız yoktur.',
    sources: [
      'Shang ve ark. 2021, 14 kohortun meta-analizi, RR 1,47 — kanıt kalitesi düşük (PMID 33422559)',
      'Livingston ve ark. 2024, Lancet Demans Komisyonu raporu (PMID 39096926)',
    ],
  },
  {
    id: 'alarm',
    title: 'Sabah alarmı ve uyku sesi',
    claim: 'Seçtiğin saatte uyandırır, uyurken sakin müzik çalar; uyku düzenini kendin görürsün.',
    level: 'Sınırlı',
    basis:
      'Uyku müziği, uykusuzluk yaşayan yetişkinlerde öznel uyku kalitesini artırdı (orta kesinlik; çalışmalarda gecede 25–60 dk); "Sana göre" bu yüzden 30 dakikadan başlar. Yetişkine gecede en az 7 saat uyku önerilir; kart yatma saatini buna göre yazar. Her gün aynı saatte kalkmak (düzen) büyük bir kohortta uyku süresinden daha güçlü bir gösterge çıktı. Gecelerin yarısından çoğu ertelemeyle bitiyor; alışkın ertelemecilerde kısa erteleme bilişi bozmadı. Uyandırma sesleri bu bulgulara göre yapıldı: melodik alarmla uyanan küçük bir grupta dikkat hataları azaldı (105 BPM, Do majör, vibrafon; Gün Işığı bu tarifi örnek alır); derin uykudan uyandırmada ~500 Hz zengin ton, tiz alarm tonundan daha çok kişiyi uyandırdı (bu ton melodinin içinde); zorla uyandırmada kalp atışı ve tansiyon birden yükseldi, önceden karar verilen saatte kendiliğinden uyanmada bu ani artış görülmedi; bu yüzden sesler duyulur başlar, birkaç saniyede tam sese çıkar.',
    limits:
      '"Sana göre" uykuyu algılamaz; sabah cevabına göre ayarlanan bir zamanlayıcıdır. Düzen, gün ışığı ve erteleme bulguları gözlemsel ya da küçük çalışmalardan; nedensellik göstermez. Melodik alarm sesiyle daha az sersemlik yalnız küçük çalışmalarda görüldü (anket n=50; uyanma denemesinde melodi grubu 10 kişi). ~500 Hz ton bulguları yangın alarmı çalışmalarından (gençler ve 5–12 yaş çocuklar; uyku ataleti ölçülmedi); hızlı tempo bulgusu uyanık kişilerde. Kalp atışı ve tansiyon bulgusu 9 yaşlı kişide öğle uykusundan; yavaş yükselen sesin bunu önlediği denenmedi. Melodi grubundaki 10 kişi önce melodisiz kontrol sesiyle, sonraki oturumda melodiyle uyandı (sıra etkisi olabilir). Hiçbir ses sersemliği tümüyle gidermez. Tedavi değildir; uykusuzluk sürüyorsa bir hekime danış.',
    sources: [
      'Jespersen ve ark. 2022, Cochrane: uykusuzlukta müzik dinleme (PMID 36000763)',
      'Watson ve ark. 2015, AASM/SRS uzlaşısı: yetişkinde en az 7 saat (PMID 26039963)',
      'Windred ve ark. 2024, uyku düzenliliği ve ölüm riski (PMID 37738616)',
      'Windred ve ark. 2024, gündüz ve gece ışığı ile ölüm riski (PMID 39405349)',
      'Robbins ve ark. 2025, 3 milyon gecede erteleme (PMID 40389592)',
      'Sundelin ve ark. 2023, erteleme ve uyku ataleti (PMID 37849039)',
      'McFarlane ve ark. 2020, melodik alarm ve uyku ataleti, anket (PMID 31990906)',
      'McFarlane ve ark. 2020, melodi ve ritim: uyanınca dikkat testi (PMID 33089201)',
      'Bruck ve ark. 2009, sesin perdesi ve uyanma eşiği (PMID 19302343)',
      'Smith ve ark. 2019, çocuklarda 500 Hz ton ve ses alarmı (PMID 31276840)',
      'Kaida ve ark. 2005, zorla uyandırmada kalp atışı ve tansiyon (PMID 15732320)',
      'Bernardi ve ark. 2006, müzik temposu ve uyarılma (PMID 16199412)',
    ],
  },
]

// Açıkça yapmadığımız iddialar (bkz. SENTEZ §5, §13)
export const NOT_CLAIMED = [
  'Göz egzersizleri okuma gözlüğünü bıraktırır ya da numaranı düşürür — kanıt yok; yaşa bağlı yakın görme kaybı büyük ölçüde göz merceğinin sertleşmesinden kaynaklanır.',
  'Göz kaslarını güçlendirir — odaklanma kası yaşla gücünü korur; sorun kasta değildir.',
  'Miyopiyi önler ya da tedavi eder.',
  'Beyin sağlığını geliştirir, demansı önler.',
  'Teşhis koyar ya da göz muayenesinin yerini tutar.',
]

export const NOT_CLAIMED_SOURCES = [
  'Strenk ve ark. 2006 (PMID 17081859); Glasser ve Campbell 1998 (PMID 9536350)',
  'Hopkins ve ark. 2012 (PMID 22820471); Tsuneyoshi ve ark. 2021 (PMID 34841886)',
  'Lin ve ark. 2023, göz egzersizi ve miyopi meta-analizi (PMID 37740051)',
]
