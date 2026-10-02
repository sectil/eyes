// Kaynakça: her bilim kartının altında makale, yazarlar ve çalışmanın türü görünsün (plan: "her şeyin altında makale
// ve kişi ismi"). Bilgiler PubMed kayıtlarından alındı (yazar, yıl, özgün başlık, dergi, cilt/sayfa, DOI).
// titleTr: bizim çevirimiz. design + n: çalışmanın türü ve büyüklüğü, yalnız özette yazdığı kadarıyla.
// İsteğe bağlı bilim kartı alanları (bildirim planı PLAN.v1.md §A.6, §5.2): finding (bilim satırı, ≤ 100 karakter),
// duration (çalışmanın süresi), limit (kartta sınır olarak yazılan), only (koşullu kaynak: yalnız 'meditation' içeriğinde
// ya da 'moon' ay evresi satırında; modül remind.science'ta reddedilir, modules/registry.js validateRemind).
// Yeni modüller buraya kaynak ekler; kartlar id ile başvurur.

export const DESIGNS = {
  meta: 'Meta-analiz',
  review: 'Sistematik derleme',
  cohort: 'Prospektif kohort çalışması',
  validation: 'Geçerlik ve güvenirlik çalışması',
  rct: 'Randomize kontrollü çalışma',
  mrt: 'Mikro-randomize deneme',
  crossover: 'Randomize çapraz çalışma',
  experiment: 'Deney',
  field: 'Saha çalışması',
  quasi: 'Yarı-randomize çalışma',
  prepost: 'Öncesi–sonrası çalışma (kontrol grubu yok)',
  observational: 'Gözlemsel çalışma',
  case: 'Olgu raporu',
  // Çalışma değil, uygulayıcılar için ilkeler öneren makale (ör. Luu 2024: travmaya duyarlı yoga nidranın 10 bileşeni;
  // yoga-pilot/v3/modul.md §16)
  expert: 'Uzman önerisi',
}
// Kanıtın gücü için kaba sıra (yüksek = daha güçlü). Kullanıcıya "ne kadar güvenilir?" diye gösterilir.
export const DESIGN_RANK = { meta: 4, review: 3, rct: 3, mrt: 3, crossover: 3, cohort: 2, experiment: 2, field: 2, quasi: 2, validation: 1, prepost: 1, observational: 1, case: 0, expert: 0 }

export const SOURCES = {
  ulrich1984: {
    authors: ['Ulrich RS'], year: 1984,
    title: 'View through a window may influence recovery from surgery.',
    titleTr: 'Pencereden görünen manzara ameliyattan iyileşmeyi etkileyebilir.',
    journal: 'Science', cite: '224(4647):420-1', doi: '10.1126/science.6143402', pmid: '6143402',
    design: 'observational', n: '46 hasta (23 + 23)',
  },
  yamashita2021: {
    authors: ['Yamashita R', 'Chen C', 'Matsubara T', 'Hagiwara K'], year: 2021,
    title: 'The Mood-Improving Effect of Viewing Images of Nature and Its Neural Substrate.',
    titleTr: 'Doğa görüntülerine bakmanın ruh hâlini iyileştiren etkisi ve sinirsel temeli.',
    journal: 'Int J Environ Res Public Health', cite: '18(10)', doi: '10.3390/ijerph18105500', pmid: '34065588',
    design: 'crossover', n: '30 genç yetişkin',
  },
  sturm2020: {
    authors: ['Sturm VE', 'Datta S', 'Roy ARK', 'Sible IJ'], year: 2020,
    title: 'Big smile, small self: Awe walks promote prosocial positive emotions in older adults.',
    titleTr: 'Büyük gülümseme, küçük benlik: Hayranlık yürüyüşleri yaşlılarda paylaşımcı olumlu duyguları artırıyor.',
    journal: 'Emotion', cite: '22(5):1044-1058', doi: '10.1037/emo0000876', pmid: '32955293',
    design: 'rct', n: '60 yaşlı yetişkin',
  },
  martens2026: {
    authors: ['Martens JP', 'Prokopetz M', 'Tomlinson K'], year: 2026,
    title: 'The Influence of Deep Space and the Stars on Emotions.',
    titleTr: 'Derin uzayın ve yıldızların duygular üzerindeki etkisi.',
    journal: 'Int J Psychol', cite: '61(1):e70146', doi: '10.1002/ijop.70146', pmid: '41381950',
    design: 'experiment', n: 'özette yazmıyor',
  },
  talens2022: {
    authors: ['Talens-Estarelles C', 'Cerviño A', 'García-Lázaro S', 'Fogelton A'], year: 2022,
    title: 'The effects of breaks on digital eye strain, dry eye and binocular vision: Testing the 20-20-20 rule.',
    titleTr: 'Molaların dijital göz yorgunluğu, kuru göz ve iki göz görmesi üzerindeki etkisi: 20-20-20 kuralının testi.',
    journal: 'Cont Lens Anterior Eye', cite: '46(2):101744', doi: '10.1016/j.clae.2022.101744', pmid: '35963776',
    design: 'prepost', n: '29 ekran kullanıcısı',
  },
  dunster2022: {
    authors: ['Dunster GP', 'Hua I', 'Grahe A', 'Fleischer JG'], year: 2022,
    title: 'Daytime light exposure is a strong predictor of seasonal variation in sleep and circadian timing of university students.',
    titleTr: 'Gündüz ışığı, üniversite öğrencilerinde uyku ve iç saatteki mevsimsel değişimin güçlü bir belirleyicisi.',
    journal: 'J Pineal Res', cite: '74(2):e12843', doi: '10.1111/jpi.12843', pmid: '36404490',
    design: 'observational', n: "500'den fazla öğrenci",
  },
  deprato2025: {
    authors: ['Deprato A', 'Haldar P', 'Navarro JF', 'Harding BN'], year: 2025,
    title: 'Associations between light at night and mental health: A systematic review and meta-analysis.',
    titleTr: 'Gece ışığı ile ruh sağlığı arasındaki ilişkiler: Sistematik derleme ve meta-analiz.',
    journal: 'Sci Total Environ', cite: '974:179188', doi: '10.1016/j.scitotenv.2025.179188', pmid: '40154089',
    design: 'meta', n: '19 çalışma, 556 861 kişi (gözlemsel çalışmalar)',
  },
  buxton2021: {
    authors: ['Buxton RT', 'Pearson AL', 'Allou C', 'Fristrup K'], year: 2021,
    title: 'A synthesis of health benefits of natural sounds and their distribution in national parks.',
    titleTr: 'Doğa seslerinin sağlığa yararlarının bir sentezi ve milli parklardaki dağılımları.',
    journal: 'Proc Natl Acad Sci U S A', cite: '118(14)', doi: '10.1073/pnas.2013097118', pmid: '33753555',
    design: 'meta', n: "36 yayın; 18'i meta-analizde",
  },
  fan2024: {
    authors: ['Fan L', 'Baharum MR'], year: 2024,
    title: 'The effect of exposure to natural sounds on stress reduction: a systematic review and meta-analysis.',
    titleTr: 'Doğa seslerine maruz kalmanın stres azaltmaya etkisi: sistematik derleme ve meta-analiz.',
    journal: 'Stress', cite: '27(1):2402519', doi: '10.1080/10253890.2024.2402519', pmid: '39285764',
    design: 'meta', n: 'özette yazmıyor',
  },
  alvarsson2010: {
    authors: ['Alvarsson JJ', 'Wiens S', 'Nilsson ME'], year: 2010,
    title: 'Stress recovery during exposure to nature sound and environmental noise.',
    titleTr: 'Doğa sesi ve çevresel gürültü sırasında stresten toparlanma.',
    journal: 'Int J Environ Res Public Health', cite: '7(3):1036-46', doi: '10.3390/ijerph7031036', pmid: '20617017',
    design: 'experiment', n: '40 kişi',
  },
  // Gelişim 2.0 (2026-09-26 PubMed'den doğrulandı)
  topp2015: {
    authors: ['Topp CW', 'Østergaard SD', 'Søndergaard S', 'Bech P'], year: 2015,
    title: 'The WHO-5 Well-Being Index: a systematic review of the literature.',
    titleTr: 'WHO-5 İyi Oluş İndeksi: literatürün sistematik derlemesi.',
    journal: 'Psychother Psychosom', cite: '84(3):167-76', doi: '10.1159/000376585', pmid: '25831962',
    design: 'review', n: '213 makale',
  },
  eser2019: {
    authors: ['Eser E', 'Çevik C', 'Baydur H', 'Güneş S'], year: 2019,
    title: 'Reliability and validity of the Turkish version of the WHO-5, in adults and older adults for its use in primary care settings.',
    titleTr: 'WHO-5 Türkçe sürümünün yetişkinlerde ve yaşlılarda birinci basamakta kullanım için güvenirlik ve geçerliği.',
    journal: 'Prim Health Care Res Dev', cite: '20:e100', doi: '10.1017/S1463423619000343', pmid: '32800004',
    design: 'validation', n: '1752 kişi',
  },
  faes2021: {
    authors: ['Faes L', 'Islam M', 'Bachmann LM', 'Lienhard KR'], year: 2021,
    title: 'False alarms and the positive predictive value of smartphone-based hyperacuity home monitoring for the progression of macular disease: a prospective cohort study.',
    titleTr: 'Akıllı telefonla evde görme takibinde yanlış alarmlar ve sarı nokta hastalığı ilerlemesini öngörme değeri: prospektif kohort.',
    journal: 'Eye (Lond)', cite: '35(11):3035-3040', doi: '10.1038/s41433-020-01356-2', pmid: '33414531',
    design: 'cohort', n: '56 hasta, 73 göz, 2258 test',
  },
  // Tek testin oynaması (bir testten diğerine %95 fark): klinikte, gözetimli tablet/telefon yakın testleri.
  // Joseph ±0,18 (4 E içinden farklıyı seç, iPad, 40 cm); Katibeh −0,19/+0,26 (PeekNV, 40 cm);
  // Han −0,24/+0,20 (V@home, 40 cm, iki göz). Ev koşulunda yetişkinde ölçülmedi.
  joseph2023: {
    authors: ['Joseph A', 'Bullimore M', 'Drawnel F', 'Miranda M'], year: 2023,
    title: 'Remote Monitoring of Visual Function in Patients with Maculopathy: The Aphelion Study.',
    titleTr: 'Sarı nokta hastalığında görme işlevinin uzaktan takibi: Aphelion çalışması.',
    journal: 'Ophthalmol Ther', cite: '13(1):409-422', doi: '10.1007/s40123-023-00854-2', pmid: '38015309',
    design: 'validation', n: '122 hasta (klinikte, gözetimli)',
  },
  katibeh2022: {
    authors: ['Katibeh M', 'Sanyam SD', 'Watts E', 'Bolster NM'], year: 2022,
    title: 'Development and Validation of a Digital (Peek) Near Visual Acuity Test for Clinical Practice, Community-Based Survey, and Research.',
    titleTr: 'Klinik, saha taraması ve araştırma için dijital (Peek) yakın görme testinin geliştirilmesi ve geçerliği.',
    journal: 'Transl Vis Sci Technol', cite: '11(12):18', doi: '10.1167/tvst.11.12.18', pmid: '36583912',
    design: 'validation', n: '483 kişi',
  },
  han2019: {
    authors: ['Han X', 'Scheetz J', 'Keel S', 'Liao C'], year: 2019,
    title: 'Development and Validation of a Smartphone-Based Visual Acuity Test (Vision at Home).',
    titleTr: 'Akıllı telefonla görme keskinliği testinin (Vision at Home) geliştirilmesi ve geçerliği.',
    journal: 'Transl Vis Sci Technol', cite: '8(4):27', doi: '10.1167/tvst.8.4.27', pmid: '31440424',
    design: 'validation', n: 'üç çalışma grubu',
  },
  // Haftalık görme kuralı (lib/trend.js, 2026-09-29; PubMed MCP ile doğrulandı): değişim eşikleri ve alışma etkisi
  rosser2003: {
    authors: ['Rosser DA', 'Cousens SN', 'Murdoch IE', 'Fitzke FW'], year: 2003,
    title: 'How sensitive to clinical change are ETDRS logMAR visual acuity measurements?',
    titleTr: 'ETDRS logMAR görme keskinliği ölçümleri klinik değişime ne kadar duyarlı?',
    journal: 'Invest Ophthalmol Vis Sci', cite: '44(8):3278-81', doi: '10.1167/iovs.02-1100', pmid: '12882770',
    design: 'experiment', n: 'sağlıklı gönüllüler, mesafeyle benzetilen değişim',
  },
  lim2010: {
    authors: ['Lim LA', 'Frost NA', 'Powell RJ', 'Hewson P'], year: 2010,
    title: "Comparison of the ETDRS logMAR, 'compact reduced logMar' and Snellen charts in routine clinical practice.",
    titleTr: "Rutin klinik uygulamada ETDRS logMAR, 'kompakt kısaltılmış logMAR' ve Snellen çizelgelerinin karşılaştırılması.",
    journal: 'Eye (Lond)', cite: '24(4):673-7', doi: '10.1038/eye.2009.147', pmid: '19557025',
    design: 'validation', n: '40 hastanın 40 gözü',
  },
  // Ev takibinde yanlış alarm (PubMed MCP ile doğrulandı 2026-09-29; e-yayın 2020): ForeseeHome (başka bir test:
  // tercihli hiperkeskinlik perimetrisi), gerçek kullanım; bir merkezde 52 uyarının 47'si yanlış (yazarların oranı %93,2; 47/52 = %90,4, makale kendi içinde tutarsız, metinde sayılar). Faes 2021 bunu
  // söylemez (orada art arda 3 "kırmızı" kuralında yanlış alarm %6,1, "düşük").
  yu2021: {
    authors: ['Yu HJ', 'Kiernan DF', 'Eichenbaum D', 'Sheth VS'], year: 2021,
    title: 'Home Monitoring of Age-Related Macular Degeneration: Utility of the ForeseeHome Device for Detection of Neovascularization.',
    titleTr: 'Yaşa bağlı makula dejenerasyonunda ev takibi: ForeseeHome cihazının yeni damarlanmayı saptamadaki yararı.',
    journal: 'Ophthalmol Retina', cite: '5(4):348-356', doi: '10.1016/j.oret.2020.08.003', pmid: '32810682',
    design: 'observational', n: '4 merkezde 775 göz (geriye dönük); uyarılar bir merkezde 136 gözde',
  },
  paluch2022: {
    authors: ['Paluch AE', 'Bajpai S', 'Bassett DR', 'Carnethon MR'], year: 2022,
    title: 'Daily steps and all-cause mortality: a meta-analysis of 15 international cohorts.',
    titleTr: 'Günlük adım sayısı ve tüm nedenlere bağlı ölüm: 15 uluslararası kohortun meta-analizi.',
    journal: 'Lancet Public Health', cite: '7(3):e219-e228', doi: '10.1016/S2468-2667(21)00302-9', pmid: '35247352',
    design: 'meta', n: '15 kohort, 47 471 yetişkin',
  },
  paluch2022cvd: {
    authors: ['Paluch AE', 'Bajpai S', 'Ballin M', 'Bassett DR'], year: 2022,
    title: 'Prospective Association of Daily Steps With Cardiovascular Disease: A Harmonized Meta-Analysis.',
    titleTr: 'Günlük adım sayısı ile kalp-damar hastalığı arasındaki ileriye dönük ilişki: uyumlaştırılmış meta-analiz.',
    journal: 'Circulation', cite: '147(2):122-131', doi: '10.1161/CIRCULATIONAHA.122.061288', pmid: '36537288',
    design: 'meta', n: '8 kohort, 20 152 yetişkin (ilişki yalnız 60 yaş üstünde anlamlı)',
  },
  dunstan2012: {
    authors: ['Dunstan DW', 'Kingwell BA', 'Larsen R', 'Healy GN'], year: 2012,
    title: 'Breaking up prolonged sitting reduces postprandial glucose and insulin responses.',
    titleTr: 'Uzun oturmayı bölmek yemek sonrası şeker ve insülin yanıtını düşürüyor.',
    journal: 'Diabetes Care', cite: '35(5):976-83', doi: '10.2337/dc11-1931', pmid: '22374636',
    design: 'crossover', n: '19 yetişkin (45–65 yaş, fazla kilolu)',
  },
  zhang2025: {
    authors: ['Zhang H', 'Wang S', 'Huang Y', 'Xiu L'], year: 2025,
    title: 'Inverted-U association between daily steps and WHO-5 in university students: non-linear modeling and robustness checks.',
    titleTr: 'Üniversite öğrencilerinde günlük adım ile WHO-5 arasında ters U ilişkisi.',
    journal: 'Front Behav Neurosci', cite: '19:1693386', doi: '10.3389/fnbeh.2025.1693386', pmid: '41211589',
    design: 'observational', n: '820 öğrenci',
  },
  gabriel2025: {
    authors: ['Gabriel A', 'Dimitry RS', 'Milad M', 'Kelada M'], year: 2025,
    title: 'A Case of Bilateral Macular Phototoxicity and the Role of Multimodal Imaging.',
    titleTr: 'İki gözde ışığa bağlı sarı nokta hasarı: Bir olgu ve çok yönlü görüntülemenin rolü.',
    journal: 'Cureus', cite: '17(12):e99791', doi: '10.7759/cureus.99791', pmid: '41573477',
    design: 'case', n: '1 kişi',
  },
  // Bildirim planı v2 (docs/yol-haritasi/BILDIRIM_PLANI.md; 2026-09-27 PubMed'den doğrulandı)
  klasnja2019: {
    authors: ['Klasnja P', 'Smith S', 'Seewald NJ', 'Lee A'], year: 2019,
    title: 'Efficacy of Contextually Tailored Suggestions for Physical Activity: A Micro-randomized Optimization Trial of HeartSteps.',
    titleTr: 'Bağlama göre uyarlanmış fiziksel aktivite önerilerinin etkinliği: HeartSteps mikro-randomize optimizasyon denemesi.',
    journal: 'Ann Behav Med', cite: '53(6):573-582', doi: '10.1093/abm/kay067', pmid: '30192907',
    design: 'mrt', n: '44 yetişkin, 6 hafta',
  },
  bell2023: {
    authors: ['Bell L', 'Garnett C', 'Bao Y', 'Cheng Z'], year: 2023,
    title: 'How Notifications Affect Engagement With a Behavior Change App: Results From a Micro-Randomized Trial.',
    titleTr: 'Bildirimler bir davranış değişikliği uygulamasıyla etkileşimi nasıl etkiliyor: mikro-randomize deneme sonuçları.',
    journal: 'JMIR Mhealth Uhealth', cite: '11:e38342', doi: '10.2196/38342', pmid: '37294612',
    design: 'mrt', n: '350 kişi (+ iki paralel kol: 98 ve 121 kişi), 30 gün',
  },
  galinsky2007: {
    authors: ['Galinsky T', 'Swanson N', 'Sauter S', 'Dunkin R'], year: 2007,
    title: 'Supplementary breaks and stretching exercises for data entry operators: a follow-up field study.',
    titleTr: 'Veri girişi çalışanlarında ek molalar ve germe egzersizleri: bir izleme saha çalışması.',
    journal: 'Am J Ind Med', cite: '50(7):519-27', doi: '10.1002/ajim.20472', pmid: '17514726',
    design: 'field', n: '51 veri girişi çalışanı',
  },
  morris2020: {
    authors: ['Morris AS', 'Mackintosh KA', 'Dunstan D', 'Owen N'], year: 2020,
    title: "Rise and Recharge: Effects on Activity Outcomes of an e-Health Smartphone Intervention to Reduce Office Workers' Sitting Time.",
    titleTr: 'Kalk ve tazelen: Ofis çalışanlarının oturma süresini azaltmaya yönelik akıllı telefon uygulamasının hareket sonuçlarına etkisi.',
    journal: 'Int J Environ Res Public Health', cite: '17(24)', doi: '10.3390/ijerph17249300', pmid: '33322678',
    design: 'quasi', n: '56 ofis çalışanı, 12 hafta',
  },
  singh2024: {
    authors: ['Singh B', 'Murphy A', 'Maher C', 'Smith AE'], year: 2024,
    title: 'Time to Form a Habit: A Systematic Review and Meta-Analysis of Health Behaviour Habit Formation and Its Determinants.',
    titleTr: 'Alışkanlık ne zaman oluşur: Sağlık davranışlarında alışkanlık oluşumu ve belirleyicileri üzerine sistematik derleme ve meta-analiz.',
    journal: 'Healthcare (Basel)', cite: '12(23)', doi: '10.3390/healthcare12232488', pmid: '39685110',
    design: 'meta', n: '20 çalışma, 2601 kişi',
  },
  wilson2015: {
    authors: ['Wilson K', 'Senay I', 'Durantini M', 'Sánchez F'], year: 2015,
    title: 'When it comes to lifestyle recommendations, more is sometimes less: a meta-analysis of theoretical assumptions underlying the effectiveness of interventions promoting multiple behavior domain change.',
    titleTr: 'Yaşam tarzı önerilerinde bazen az çoktur: Birden çok davranış alanında değişimi hedefleyen müdahalelerin etkinliğine dair kuramsal varsayımların meta-analizi.',
    journal: 'Psychol Bull', cite: '141(2):474-509', doi: '10.1037/a0038295', pmid: '25528345',
    design: 'meta', n: '150 araştırma raporu',
  },
  // Yoga dersleri (lib/yogaLessons.js Kaynaklar kartı): açılıştaki "dersi bitirebilirsin" izni ve dışa dönüş
  luu2024: {
    authors: ['Luu K'], year: 2024,
    title: 'Key Components of Trauma-Informed Yoga Nidra.',
    titleTr: 'Travmaya duyarlı yoga nidranın temel bileşenleri.',
    journal: 'Int J Yoga Therap', cite: '34(2024)', doi: '10.17761/2024-D-24-00021', pmid: '39690521',
    design: 'expert', n: '10 bileşen; katılımcı yok',
  },
  // Doğrulama: docs/yol-haritasi/tasarim/bildirim-hava-yuruyus/kaynak-dogrulama.md (2026-09-30; PubMed özeti, tam metin
  // okunmadı). Yalnız "girer" ve "girer (koşullu)" olanlar; "tam metin gerekli" olanlar (balban2023, klimek2022,
  // cajochen2013, casiraghi2021) GİRMEZ. Basım yılı e-yayından farklıysa kaydın üstünde yorumda (year = e-yayın yılı,
  // mevcut kural). VARSAYIM: basım yılı için ayrı alan (ör. yearPrint) bu turda açılmadı; kart bu turda gösterilmiyor,
  // alan adı kartın yazıldığı B1a ekran turunda kararlaştırılır.
  // Bildirim · bilim kartı (B1a; docs/yol-haritasi/tasarim/bildirim-hava-yuruyus/PLAN.v1.md §A kanıt kapısı)
  // basım 2021 Haz, e-yayın 2020-05-12
  kim2020: {
    authors: ['Kim AD', 'Muntz A', 'Lee J', 'Wang MTM'], year: 2020,
    title: 'Therapeutic benefits of blinking exercises in dry eye disease.',
    // VARSAYIM: titleTr taslaktaki gibi (sources.test.js her kayıtta ister). "tedavi edici" yasak listesindeki köke
    // takılıyor (özgün başlık "Therapeutic"); makale başlığı çevirisi, bildirim metni değil. Kartta gösterilmeden önce
    // dil incelemesi karar verir (kaynak-dogrulama.md §4).
    titleTr: 'Kuru göz hastalığında kırpma egzersizlerinin tedavi edici yararları.',
    journal: 'Cont Lens Anterior Eye', cite: '44(3):101329', doi: '10.1016/j.clae.2020.04.014', pmid: '32409236',
    design: 'prepost', n: '54 kişi başladı, 41 kişi bitirdi (kuru göz belirtili)',
    finding: "41 kişilik kontrolsüz bir çalışmada eksik kırpma oranı 4 haftada %54'ten %34'e indi.",
    duration: '4 hafta',
    limit: 'Kontrol grubu yok; katılımcılar kuru göz belirtili kişiler.',
  },
  // basım 2025 Eki, e-yayın 2025-06-03. design 'rct': özet "Participants were randomised between a squeeze and blink
  // compared to blink only regimen…", PubMed türü RCT; karşılaştırma düzenler arası (kaynak-dogrulama.md §5).
  wolffsohn2025: {
    authors: ['Wolffsohn JS', 'Travé-Huarte S', 'Bahra I', 'Finch C'], year: 2025,
    title: 'Optimisation of blinking exercises for dry eye disease.',
    titleTr: 'Kuru göz hastalığında kırpma egzersizlerinin en uygun hâle getirilmesi.',
    journal: 'Cont Lens Anterior Eye', cite: '48(5):102453', doi: '10.1016/j.clae.2025.102453', pmid: '40467388',
    design: 'rct', n: '98 kişi (optimizasyon) + 28 kişi (etkinlik çalışması), kuru göz',
    finding: '98 kişilik bir denemede en uygun düzen günde 3 kez 15 tekrar çıktı.',
    duration: '2 hafta egzersiz + bıraktıktan 2 hafta sonra ölçüm',
    limit: 'Egzersiz bırakılınca ölçümler 2 haftada çoğunlukla başa döndü; kırpma hızı ve gözyaşı ölçümlerinin bir kısmı değişmedi.',
  },
  fincham2023: {
    authors: ['Fincham GW', 'Strauss C', 'Montero-Marin J', 'Cavanagh K'], year: 2023,
    title: 'Effect of breathwork on stress and mental health: A meta-analysis of randomised-controlled trials.',
    titleTr: 'Nefes çalışmasının stres ve ruh sağlığı üzerindeki etkisi: randomize kontrollü çalışmaların meta-analizi.',
    journal: 'Sci Rep', cite: '13(1):432', doi: '10.1038/s41598-022-27247-y', pmid: '36624160',
    design: 'meta', n: '12 randomize çalışma, 785 yetişkin',
    finding: '12 denemede (785 kişi) nefes çalışması, algılanan streste küçük–orta azalmayla ilişkiliydi.',
    limit: 'Çalışmaların çoğunda yanlılık riski orta; kapsam genel nefes çalışması, yalnız yavaş nefes değil.',
  },
  // basım 2022 Tem, e-yayın 2022-05-24. Kişi sayısı özette yok; plan gereği kartta çalışma sayısı yazar.
  laborde2022: {
    authors: ['Laborde S', 'Allen MS', 'Borges U', 'Dosseville F'], year: 2022,
    title: 'Effects of voluntary slow breathing on heart rate and heart rate variability: A systematic review and a meta-analysis.',
    titleTr: 'İstemli yavaş nefesin kalp hızı ve kalp atışı değişkenliği üzerindeki etkileri: sistematik derleme ve meta-analiz.',
    journal: 'Neurosci Biobehav Rev', cite: '138:104711', doi: '10.1016/j.neubiorev.2022.104711', pmid: '35623448',
    design: 'meta', n: '223 çalışma (kişi sayısı özette yazmıyor)',
    finding: '223 çalışmalık bir incelemede kalp atışı değişkenliği yavaş nefes sırasında arttı.',
    limit: 'Etki büyüklüğü ve toplam kişi sayısı özette yok.',
  },
  // basım 2007 Ara, e-yayın 2007-10-24
  tucker2007: {
    authors: ['Tucker P', 'Gilliland J'], year: 2007,
    title: 'The effect of season and weather on physical activity: a systematic review.',
    titleTr: 'Mevsimin ve havanın fiziksel etkinlik üzerindeki etkisi: sistematik derleme.',
    journal: 'Public Health', cite: '121(12):909-22', doi: '10.1016/j.puhe.2007.04.009', pmid: '17920646',
    design: 'review', n: '37 çalışma, 291 883 katılımcı',
    finding: '37 çalışmalık bir derlemede kötü ya da aşırı hava, hareketin önünde bir engel olarak görüldü.',
    limit: 'Nicel birleştirme (meta-analiz) yapılmamış.',
  },
  denissen2008: {
    authors: ['Denissen JJ', 'Butalid L', 'Penke L', 'van Aken MA'], year: 2008,
    title: 'The effects of weather on daily mood: a multilevel approach.',
    titleTr: 'Havanın günlük ruh hâli üzerindeki etkileri: çok düzeyli bir yaklaşım.',
    journal: 'Emotion', cite: '8(5):662-7', doi: '10.1037/a0013497', pmid: '18837616',
    design: 'observational', n: '1233 kişi (çevrim içi günlük)',
    finding: '1233 kişilik günlük çalışmasında havanın ruh hâline ortalama etkisi küçüktü; kişiden kişiye değişti.',
    limit: 'Gözlemsel çalışma; kişiler arasındaki farkı kişilik, cinsiyet ve yaş açıklamadı.',
  },
  // basım 2022 Tem, e-yayın 2022-03-10
  stout2022: {
    authors: ['Stout TE', 'Lingeman JE', 'Krambeck AE', 'Humphreys MR'], year: 2022,
    title: 'A Randomized Trial Evaluating the Use of a Smart Water Bottle to Increase Fluid Intake in Stone Formers.',
    titleTr: 'Böbrek taşı olan kişilerde sıvı alımını artırmak için akıllı su şişesi kullanımını değerlendiren randomize deneme.',
    journal: 'J Ren Nutr', cite: '32(4):389-395', doi: '10.1053/j.jrn.2021.07.007', pmid: '35283036',
    design: 'rct', n: '85 kişi (44 + 41); izlemde 51 kişi',
    finding: '85 kişilik bir denemede az su içmenin başlıca nedeni unutmaktı (%60).',
    duration: '6 ve 12 hafta',
    limit: 'Katılımcılar böbrek taşı hastaları; ölçüt içilen su değil 24 saatlik idrar hacmi; izlemde kayıp yüksek.',
  },
  // Düzeltme (erratum): Lancet 2026 Aug 22;408(10556):698, PMID 42624152 — yayından önce açılmalı.
  desai2026: {
    authors: ['Desai AC', 'Maalouf NM', 'Harper JD', 'Sivalingam S'], year: 2026,
    title: 'Prevention of urinary stones with hydration: a randomised clinical trial of an adherence intervention.',
    // VARSAYIM: "önlenmesi" yasak listesindeki köke takılıyor (özgün "Prevention"); kim2020'deki notla aynı.
    titleTr: 'Sıvı alımıyla idrar yolu taşlarının önlenmesi: bir uyum programının randomize klinik denemesi.',
    journal: 'Lancet', cite: '407(10534):1171-1181', doi: '10.1016/S0140-6736(25)02637-6', pmid: '41864748',
    design: 'rct', n: '1658 kişi (826 + 832)',
    finding: '1658 kişilik bir denemede su programındakiler 6. ve 12. ayda gece daha sık tuvalete kalktı.',
    duration: 'Ortanca 738 gün izlem',
    limit: 'Katılımcılar taş hastaları; program çok bileşenli (yalnız hatırlatma değil); fark yalnız 6. ve 12. ayda.',
  },
  moszeik2025: {
    authors: ['Moszeik EN', 'Rohleder N', 'Renner KH'], year: 2025,
    title: 'The Effects of an Online Yoga Nidra Meditation on Subjective Well-Being and Diurnal Salivary Cortisol: A Randomised Controlled Trial.',
    titleTr: 'Çevrim içi yoga nidra meditasyonunun öznel iyi oluş ve gün içi tükürük kortizolü üzerindeki etkileri: randomize kontrollü çalışma.',
    journal: 'Stress Health', cite: '41(3):e70049', doi: '10.1002/smi.70049', pmid: '40373021',
    design: 'rct', n: '362 kişi, 4 kol (101 + 80 + 74 + 107)',
    finding: '362 kişilik 2 aylık denemede 11 dakikalık yoga nidranın bekleme grubuna göre anket farkı küçüktü.',
    duration: '2 ay, ideal olarak her gün',
    limit: 'Etkiler küçük (d = 0,08–0,16).',
  },
  // Kanıt kapısı 2 (docs/yol-haritasi/tasarim/bildirim-hava-yuruyus/kanit-2-onay.md, sahip onayı 2026-09-30; künye
  // kanit-2-kaynaklar.md, PubMed). finding onaylı bilim satırı, limit onaylı "Sınırlar" cümlesinin ilgili kısmı.
  chung2004: {
    authors: ['Chung STL', 'Legge GE', 'Cheung SH'], year: 2004,
    title: 'Letter-recognition and reading speed in peripheral vision benefit from perceptual learning.',
    titleTr: 'Çevresel görüşte harf tanıma, okuma hızı ve algısal öğrenme.',
    journal: 'Vision Res', cite: '44(7):695-709', doi: '10.1016/j.visres.2003.09.028', pmid: '14751554',
    design: 'rct', n: '18 gören gönüllü, 3 grup',
    finding: '18 kişilik küçük bir denemede 4 günlük harf alıştırması, yan görüşte harf tanımayı artırdı.',
    limit: 'Alıştırma gözün kenarında yapıldı, okumaya etkisi gösterilmedi.',
  },
  ball2002: {
    authors: ['Ball K', 'Berch DB', 'Helmers KF', 'Jobe JB'], year: 2002,
    title: 'Effects of cognitive training interventions with older adults: a randomized controlled trial.',
    titleTr: 'Yaşlı yetişkinlerde bilişsel alıştırma programlarının etkileri: randomize kontrollü çalışma.',
    journal: 'JAMA', cite: '288(18):2271-81', doi: '10.1001/jama.288.18.2271', pmid: '12425704',
    design: 'rct', n: '2832 kişi (65–94 yaş), 4 kol; hız kolu 712 kişi',
    finding: '2832 yaşlı yetişkinle yapılan 4 kollu denemede hız alıştırması, çalışılan beceriyi iyileştirdi.',
    limit: 'Hız kolu 712 kişi, günlük yaşama etkisi görülmedi.',
  },
  // basım 2020 (14(2)), e-yayın 2019-07-15; PubMed türü Systematic Review, özet: iki meta-analiz
  dewitte2019: {
    authors: ['de Witte M', 'Spruit A', 'van Hooren S', 'Moonen X'], year: 2019,
    title: 'Effects of music interventions on stress-related outcomes: a systematic review and two meta-analyses.',
    titleTr: 'Müzik uygulamalarının stresle ilgili ölçümlere etkileri: sistematik derleme ve iki meta-analiz.',
    journal: 'Health Psychol Rev', cite: '14(2):294-324', doi: '10.1080/17437199.2019.1627897', pmid: '31167611',
    design: 'meta', n: '104 randomize çalışma, 9617 kişi',
    finding: '104 denemede, 9617 kişide müzik, bedensel ve hissedilen stres ölçülerinde azalmayla ilişkiliydi.',
    limit: "Dalga'nın kendi sesleri sınanmadı, müzik terapisi de kapsamda.",
  },

  // Nef sözleşmesi (lib/nef; modül manifesti nef.evidence), 2026-10-01. Künye PubMed'den (araçla doğrulandı); finding ve
  // limit yalnız özette yazanla. Bilim kartı havuzuna (remind.science) girmez; bilim satırı onayı ayrı iş.
  // Fark Ettin mi? (simons1999, most2001): fark-ettin-mi/arastirma/KAYNAKLAR.md 1 ve 8 (PubMed ile doğrulanmış)
  simons1999: {
    authors: ['Simons DJ', 'Chabris CF'], year: 1999,
    title: 'Gorillas in our midst: sustained inattentional blindness for dynamic events.',
    titleTr: 'Aramızdaki goriller: hareketli olaylarda süren dikkatsizlik körlüğü.',
    journal: 'Perception', cite: '28(9):1059-74', doi: '10.1068/p281059', pmid: '10694957',
    design: 'experiment',
    finding: 'Beklenmeyen şeyi fark etmek, ekrandakilere benzerliğine ve görevin zorluğuna bağlıydı.',
    limit: 'Laboratuvar videosu; kişi sayısı özette yok.',
  },
  most2001: {
    authors: ['Most SB', 'Simons DJ', 'Scholl BJ', 'Jimenez R'], year: 2001,
    title: 'How not to be seen: the contribution of similarity and selective ignoring to sustained inattentional blindness.',
    titleTr: 'Görünmemenin yolu: süren dikkatsizlik körlüğünde benzerlik ve seçerek görmezden gelme.',
    journal: 'Psychol Sci', cite: '12(1):9-17', doi: '10.1111/1467-9280.00303', pmid: '11294235',
    design: 'experiment', n: '3 deney',
    finding: "Siyahı ya da beyazı izleyenlerin yaklaşık %30'u 5 saniye görünen kırmızı haçı fark etmedi.",
    limit: 'Basit şekillerle ekran deneyi; kişi sayısı özette yok.',
  },
  // Bugünün görevi (notice): lib/notice.js başındaki dolaylı kanıt
  schofield2015: {
    authors: ['Schofield TP', 'Creswell JD', 'Denson TF'], year: 2015,
    title: 'Brief mindfulness induction reduces inattentional blindness.',
    titleTr: 'Kısa bir farkındalık çalışması dikkatsizlik körlüğünü azaltır.',
    journal: 'Conscious Cogn', cite: '37:63-70', doi: '10.1016/j.concog.2015.08.007', pmid: '26320867',
    design: 'experiment', n: '794 kişi',
    finding: '794 kişilik deneyde kısa bir farkındalık çalışması beklenmeyen şeyi fark etmeyi artırdı.',
    limit: 'Tek oturum, bilgisayar görevi; günlük hayata aktarım sınanmadı.',
  },
  // Yön: Ayna (raes2011, lib/yon.js), Dışarıdan bak (kross2014, lib/yon.js), Şefkatle ele al (breines2012, lib/yon.js)
  // e-yayın 2010-06-08, basım 2011 (18(3))
  raes2011: {
    authors: ['Raes F', 'Pommier E', 'Neff KD', 'Van Gucht D'], year: 2011,
    title: 'Construction and factorial validation of a short form of the Self-Compassion Scale.',
    titleTr: 'Öz-Şefkat Ölçeği kısa formunun geliştirilmesi ve faktör yapısının doğrulanması.',
    journal: 'Clin Psychol Psychother', cite: '18(3):250-5', doi: '10.1002/cpp.702', pmid: '21584907',
    design: 'validation', n: 'Üç örneklem (iki Hollandaca, bir İngilizce)',
    finding: '12 maddelik kısa öz-şefkat ölçeği uzun formla neredeyse aynı sonucu verdi.',
    limit: "Ayna'daki 6 maddelik Türkçe kısaltma bu çalışmada sınanmadı.",
  },
  kross2014: {
    authors: ['Kross E', 'Bruehlman-Senecal E', 'Park J', 'Burson A'], year: 2014,
    title: 'Self-talk as a regulatory mechanism: how you do it matters.',
    titleTr: 'Düzenleyici bir yol olarak kendinle konuşma: nasıl yaptığın önemli.',
    journal: 'J Pers Soc Psychol', cite: '106(2):304-24', doi: '10.1037/a0035173', pmid: '24467424',
    design: 'rct', n: '7 çalışma, toplam 585 kişi',
    finding: "Kendine 'ben' yerine adınla ya da 'sen' diye seslenmek sosyal streste sıkıntıyı azalttı.",
    limit: 'Laboratuvar görevleri; yazı egzersizi olarak sınanmadı.',
  },
  breines2012: {
    authors: ['Breines JG', 'Chen S'], year: 2012,
    title: 'Self-compassion increases self-improvement motivation.',
    titleTr: 'Öz-şefkat kendini geliştirme isteğini artırır.',
    journal: 'Pers Soc Psychol Bull', cite: '38(9):1133-43', doi: '10.1177/0146167212445599', pmid: '22645164',
    design: 'experiment', n: '4 deney',
    finding: 'Başarısızlıktan sonra kendine şefkat gösterenler zor bir sınava daha uzun çalıştı.',
    limit: 'Kısa laboratuvar deneyleri; kişi sayısı özette yok.',
  },
  // Yılan ve Çemberler: telefonda oyun süresi (göz bütçesinin dayanağı; MOLA_KILIDI_VE_YILAN_ANIMASYONU.md §1)
  chen2025: {
    authors: ['Chen YL', 'Su BR', 'Wang ST', 'Wang YC'], year: 2025,
    title: 'Smartphone gaming while walking increases visual fatigue compared with standing.',
    titleTr: 'Yürürken telefonda oyun oynamak, ayakta durmaya göre görsel yorgunluğu artırır.',
    journal: 'Sci Rep', cite: '16(1):3616', doi: '10.1038/s41598-025-33670-8', pmid: '41455726',
    design: 'experiment', n: '30 genç yetişkin',
    finding: '30 kişide telefonda 30 dakika oyun, 15 dakikaya göre göz yorgunluğunu artırdı.',
    limit: 'Küçük örneklem; uygulamadaki oyunlar sınanmadı. Yılan için yalnız oyun süresinin kısa tutulmasına dayanaktır; Nef bu kaynakla Yılan\'ın bir yararı olduğunu söylemez (sahip kararı 2026-10-01).',
  },
  // Çemberler: gözle izleme (takip göz hareketi) pratikle değişir
  radecke2023: {
    authors: ['Radecke JO', 'Sprenger A', 'Stöckler H', 'Espeter L'], year: 2023,
    title: 'Normative tDCS over V5 and FEF reveals practice-induced modulation of extraretinal smooth pursuit mechanisms, but no specific stimulation effect.',
    titleTr: 'Takip göz hareketinde pratikle oluşan değişim; uyarımın kendine özgü etkisi yok.',
    journal: 'Sci Rep', cite: '13(1):21380', doi: '10.1038/s41598-023-48313-z', pmid: '38049419',
    design: 'experiment', n: '60 sağlıklı kişi',
    finding: '60 sağlıklı kişide gözle hedef izleme, oturum içinde ve oturumlar arasında pratikle değişti.',
    limit: 'Asıl soru tDCS uyarımıydı; laboratuvar ölçümü, oyun değil.',
  },

  // KOŞULLU: yalnız meditasyon içeriğinde; yoga bildiriminde kullanılmaz.
  radin2025: {
    authors: ['Radin RM', 'Vacarro J', 'Fromer E', 'Ahmadi SE'], year: 2025,
    title: 'Digital Meditation to Target Employee Stress: A Randomized Clinical Trial.',
    titleTr: 'Çalışan stresine yönelik dijital meditasyon: randomize klinik deneme.',
    journal: 'JAMA Netw Open', cite: '8(1):e2454435', doi: '10.1001/jamanetworkopen.2024.54435', pmid: '39808431',
    design: 'rct', n: '1458 çalışan (728 + 730)',
    finding: '1458 çalışanla bir denemede günde 5–10 dk meditasyon yapanlarda stres, 5 dk altından çok düştü.',
    duration: '8 hafta, günde 10 dk; 4. ayda izlem',
    limit: 'Kullanım süresine göre karşılaştırma randomize değil; kontrol bekleme listesi.',
    only: 'meditation',
  },

  // KOŞULLU: ay kaynakları yalnız hava sayfasında "ay evresi" satırı kullanılırsa (dolunayın bilim satırı laborde2022).
  // Ortak satır: "Ayın uykuya etkisi tartışmalı: 5812 çocukta ~5 dk fark bulundu, 2125 yetişkinde bulunmadı."
  // basım 2015 Kas, e-yayın 2015-08-18
  habarubio2015: {
    authors: ['Haba-Rubio J', 'Marques-Vidal P', 'Tobback N', 'Andries D'], year: 2015,
    title: "Bad sleep? Don't blame the moon! A population-based study.",
    titleTr: 'Kötü uyku mu? Suçu aya atma! Toplum tabanlı bir çalışma.',
    journal: 'Sleep Med', cite: '16(11):1321-1326', doi: '10.1016/j.sleep.2015.08.002', pmid: '26498230',
    design: 'observational', n: '2125 kişi',
    limit: 'Uyku bozukluğu olmayan alt grupta dolunayda daha kısa uyku eğilimi var (anlamlı değil).',
    only: 'moon',
  },
  chaput2016: {
    authors: ['Chaput JP', 'Weippert M', 'LeBlanc AG', 'Hjorth MF'], year: 2016,
    title: 'Are Children Like Werewolves? Full Moon and Its Association with Sleep and Activity Behaviors in an International Sample of Children.',
    titleTr: 'Çocuklar kurt adam gibi mi? Uluslararası bir çocuk örnekleminde dolunay ile uyku ve hareket davranışları arasındaki ilişki.',
    journal: 'Front Pediatr', cite: '4:24', doi: '10.3389/fped.2016.00024', pmid: '27047907',
    design: 'observational', n: '5812 çocuk (9–11 yaş), 12 ülke',
    duration: '7 gün ivmeölçer',
    limit: 'Yazarlar farkın klinik anlamını sorgulanabilir buluyor.',
    only: 'moon',
  },
  // basım 2017 Haz, e-yayın 2016-12-08 (anahtar plandaki adla)
  smith2017: {
    authors: ['Smith MP', 'Standl M', 'Schulz H', 'Heinrich J'], year: 2016,
    title: 'Physical activity, subjective sleep quality and time in bed do not vary by moon phase in German adolescents.',
    titleTr: 'Almanyalı ergenlerde fiziksel etkinlik, öznel uyku kalitesi ve yatakta geçen süre ay evresine göre değişmiyor.',
    journal: 'J Sleep Res', cite: '26(3):371-376', doi: '10.1111/jsr.12472', pmid: '27928860',
    design: 'observational', n: '1411 genç (14–17 yaş)',
    limit: 'Uyku günlükle (öznel) ölçüldü.',
    only: 'moon',
  },
  // Oku ve Anla (okuma-anlama/arastirma/KAYNAKLAR.md §A; künye PubMed'den, 2026-10-02). finding/limit yok: bilim kartı
  // cümleleri henüz kapıdan ve sahip onayından geçmedi.
  // VARSAYIM: Rayner 2016 anlatı derlemesi; DESIGNS'ta ayrı tür yok, 'review' seçildi (sahibe soruldu).
  rayner2016: {
    authors: ['Rayner K', 'Schotter ER', 'Masson ME', 'Potter MC', 'Treiman R'], year: 2016,
    title: 'So Much to Read, So Little Time: How Do We Read, and Can Speed Reading Help?',
    titleTr: 'Okunacak çok şey, az zaman: Nasıl okuruz ve hızlı okuma işe yarar mı?',
    journal: 'Psychol Sci Public Interest', cite: '17(1):4-34', doi: '10.1177/1529100615623267', pmid: '26769745',
    design: 'review',
  },
  kuperman2021: {
    authors: ['Kuperman V', 'Kyröläinen AJ', 'Porretta V', 'Brysbaert M', 'Yang S'], year: 2021,
    title: 'A lingering question addressed: Reading rate and most efficient listening rate are highly similar.',
    titleTr: 'Uzun süredir sorulan bir soru: Okuma hızı ile en verimli dinleme hızı birbirine çok yakın.',
    journal: 'J Exp Psychol Hum Percept Perform', cite: '47(8):1103-1112', doi: '10.1037/xhp0000932', pmid: '34516216',
    design: 'experiment',
  },
  miyata2012: {
    authors: ['Miyata H', 'Minagawa-Kawai Y', 'Watanabe S', 'Sasaki T', 'Ueda K'], year: 2012,
    title: 'Reading speed, comprehension and eye movements while reading Japanese novels: evidence from untrained readers and cases of speed-reading trainees.',
    titleTr: 'Japonca roman okurken okuma hızı, anlama ve göz hareketleri: Eğitimsiz okurlar ve hızlı okuma kursiyerleri.',
    journal: 'PLoS One', cite: '7(5):e36091', doi: '10.1371/journal.pone.0036091', pmid: '22590519',
    design: 'observational', n: '17 ve 15 kişilik iki çalışma',
  },
  trauzettel2012: {
    authors: ['Trauzettel-Klosinski S', 'Dietz K'], year: 2012,
    title: 'Standardized assessment of reading performance: the New International Reading Speed Texts IReST.',
    titleTr: 'Okuma performansının standart ölçümü: Yeni Uluslararası Okuma Hızı Metinleri IReST.',
    journal: 'Invest Ophthalmol Vis Sci', cite: '53(9):5452-61', doi: '10.1167/iovs.11-8284', pmid: '22661485',
    design: 'validation', n: '17 dilde 436 kişi',
  },
}

// "Ulrich RS" · "Martens JP, Prokopetz M, Tomlinson K" · 4+ yazar → ilk üçü + "ve ark."
export function authorLine(s) {
  const a = s?.authors ?? []
  return a.length > 3 ? `${a.slice(0, 3).join(', ')} ve ark.` : a.join(', ')
}
export const doiUrl = (doi) => `https://doi.org/${doi}`
export const sourceOf = (id) => SOURCES[id] ?? null
export const designText = (s) => (s ? `${DESIGNS[s.design] ?? ''}${s.n ? ` · ${s.n}` : ''}` : '')
