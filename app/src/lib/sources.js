// Kaynakça: her bilim kartının altında makale, yazarlar ve çalışmanın türü görünsün (plan: "her şeyin altında makale
// ve kişi ismi"). Bilgiler PubMed kayıtlarından alındı (yazar, yıl, özgün başlık, dergi, cilt/sayfa, DOI).
// titleTr: bizim çevirimiz. design + n: çalışmanın türü ve büyüklüğü, yalnız özette yazdığı kadarıyla.
// Yeni modüller buraya kaynak ekler; kartlar id ile başvurur.

export const DESIGNS = {
  meta: 'Meta-analiz',
  review: 'Sistematik derleme',
  cohort: 'Prospektif kohort çalışması',
  validation: 'Geçerlik ve güvenirlik çalışması',
  rct: 'Randomize kontrollü çalışma',
  crossover: 'Randomize çapraz çalışma',
  experiment: 'Deney',
  prepost: 'Öncesi–sonrası çalışma (kontrol grubu yok)',
  observational: 'Gözlemsel çalışma',
  case: 'Olgu raporu',
}
// Kanıtın gücü için kaba sıra (yüksek = daha güçlü). Kullanıcıya "ne kadar güvenilir?" diye gösterilir.
export const DESIGN_RANK = { meta: 4, review: 3, rct: 3, crossover: 3, cohort: 2, experiment: 2, validation: 1, prepost: 1, observational: 1, case: 0 }

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
    design: 'observational', n: '500’den fazla öğrenci',
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
    design: 'meta', n: '36 yayın; 18’i meta-analizde',
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
  paluch2022: {
    authors: ['Paluch AE', 'Bajpai S', 'Bassett DR', 'Carnethon MR'], year: 2022,
    title: 'Daily steps and all-cause mortality: a meta-analysis of 15 international cohorts.',
    titleTr: 'Günlük adım sayısı ve tüm nedenlere bağlı ölüm: 15 uluslararası kohortun meta-analizi.',
    journal: 'Lancet Public Health', cite: '7(3):e219-e228', doi: '10.1016/S2468-2667(21)00302-9', pmid: '35247352',
    design: 'meta', n: '15 kohort, 47 471 yetişkin',
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
}

// "Ulrich RS" · "Martens JP, Prokopetz M, Tomlinson K" · 4+ yazar → ilk üçü + "ve ark."
export function authorLine(s) {
  const a = s?.authors ?? []
  return a.length > 3 ? `${a.slice(0, 3).join(', ')} ve ark.` : a.join(', ')
}
export const doiUrl = (doi) => `https://doi.org/${doi}`
export const sourceOf = (id) => SOURCES[id] ?? null
export const designText = (s) => (s ? `${DESIGNS[s.design] ?? ''}${s.n ? ` · ${s.n}` : ''}` : '')
