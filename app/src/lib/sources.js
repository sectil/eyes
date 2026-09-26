// Kaynakça: her bilim kartının altında makale, yazarlar ve çalışmanın türü görünsün (plan: "her şeyin altında makale
// ve kişi ismi"). Bilgiler PubMed kayıtlarından alındı (yazar, yıl, özgün başlık, dergi, cilt/sayfa, DOI).
// titleTr: bizim çevirimiz. design + n: çalışmanın türü ve büyüklüğü, yalnız özette yazdığı kadarıyla.
// Yeni modüller buraya kaynak ekler; kartlar id ile başvurur.

export const DESIGNS = {
  meta: 'Meta-analiz',
  rct: 'Randomize kontrollü çalışma',
  crossover: 'Randomize çapraz çalışma',
  experiment: 'Deney',
  prepost: 'Öncesi–sonrası çalışma (kontrol grubu yok)',
  observational: 'Gözlemsel çalışma',
  case: 'Olgu raporu',
}
// Kanıtın gücü için kaba sıra (yüksek = daha güçlü). Kullanıcıya "ne kadar güvenilir?" diye gösterilir.
export const DESIGN_RANK = { meta: 4, rct: 3, crossover: 3, experiment: 2, prepost: 1, observational: 1, case: 0 }

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
