// Kanıt kartları. İçerik: eyes-arastirma/SENTEZ_RAPORU.md (PMID'ler PubMed ile doğrulandı).
// Kural: her iddia bir kaynağa dayanır; sınırlar açıkça yazılır.

export const EVIDENCE = [
  {
    id: 'acuity',
    title: '"E hangi yönde" testi',
    claim: 'Yakın görme keskinliğinizi evde ölçer ve zaman içinde takip eder.',
    level: 'Orta',
    basis:
      'Akıllı telefon görme testleri klinik tablolarla karşılaştırılmış ve uyumlu bulunmuştur. Harf boyutu, ekranınızın kart ile kalibrasyonu sayesinde doğru ölçekte çizilir.',
    limits:
      'Evde tek bir testin doğal oynaması yaklaşık ±0,2 logMAR (2 satır). Bu yüzden tek teste değil, birkaç günün ortalamasına bakıyoruz. Bu test göz muayenesinin yerini tutmaz.',
    sources: [
      'Katibeh ve ark. 2022, Peek Near Vision (PMID 36583912)',
      'Wu ve ark. 2024, WHOeyes (PMID 38514167)',
      'Steren ve ark. 2021, uygulamalarda harf boyutu hataları (PMID 33443550)',
    ],
  },
  {
    id: 'trend',
    title: 'Gelişim grafiği ve uyarılar',
    claim: 'Gerçek değişimi günlük gürültüden ayırmaya çalışır; kalıcı kötüleşmede doktora yönlendirir.',
    level: 'Orta',
    basis:
      'İlk 7 gün alışma dönemi, 8–21. günler başlangıç değeri. Uyarı için tek kötü sonuç yetmez; ardışık sonuçlar gerekir. Tek teste dayalı ev takip sistemlerinde yanlış alarm oranı çok yüksek bulunmuştur.',
    limits: 'Kurallar yayımlanmış ev takip sistemlerinden uyarlanmıştır; bu uygulama için ayrıca doğrulanmamıştır.',
    sources: ['Ev takibi ve tekrarlanabilirlik derlemesi: ajan-raporlari/13_gunluk_takip.md'],
  },
  {
    id: 'reading',
    title: 'Okuma hızı testi',
    claim: 'Farklı yazı boyutlarında okuma hızınızı ölçer.',
    level: 'Düşük–Orta',
    basis: 'MNREAD tipi okuma testlerinin mantığını izler; cümleler bu uygulama için yazılmıştır.',
    limits:
      'Klinik olarak doğrulanmış bir test değildir. Tablette ölçülen okuma hızı basılı teste göre farklı çıkar; sonuçlarınızı yalnızca aynı cihazdaki önceki sonuçlarınızla karşılaştırın.',
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
    claim: 'Görmenizi düzenli kontrol ettirmenizi öneririz.',
    level: 'Gözlemsel',
    basis:
      'Tedavi edilmemiş görme kaybı, bilişsel gerileme ve demans ile ilişkili bulunmuştur. Bu ilişki gözlemsel çalışmalardan gelir.',
    limits:
      'Bu uygulamadaki test veya egzersizlerin beyin sağlığını iyileştirdiği ya da demansı önlediği gösterilmemiştir ve böyle bir iddiamız yoktur.',
    sources: [
      'Shang ve ark. 2021, 14 kohortun meta-analizi, RR 1,47 — kanıt kalitesi düşük (PMID 33422559)',
      'Livingston ve ark. 2024, Lancet Demans Komisyonu raporu (PMID 39096926)',
    ],
  },
]

// Açıkça yapmadığımız iddialar (bkz. SENTEZ §5, §13)
export const NOT_CLAIMED = [
  'Göz egzersizleri okuma gözlüğünü bıraktırır veya numaranızı düşürür — kanıt yok; yaşa bağlı yakın görme kaybı büyük ölçüde göz merceğinin sertleşmesinden kaynaklanır.',
  'Göz kaslarını güçlendirir — odaklanma kası yaşla gücünü korur; sorun kasta değildir.',
  'Miyopiyi önler veya tedavi eder.',
  'Beyin sağlığını geliştirir, demansı önler.',
  'Teşhis koyar veya göz muayenesinin yerini tutar.',
]

export const NOT_CLAIMED_SOURCES = [
  'Strenk ve ark. 2006 (PMID 17081859); Glasser ve Campbell 1998 (PMID 9536350)',
  'Hopkins ve ark. 2012 (PMID 22820471); Tsuneyoshi ve ark. 2021 (PMID 34841886)',
  'Lin ve ark. 2023, göz egzersizi ve miyopi meta-analizi (PMID 37740051)',
]
