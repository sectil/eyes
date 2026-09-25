// Profil anketi (ilk açılış, ~2 dk, 11 madde): kişiyi üç halkada tanır — Göz, Güvenlik, Yaşam.
// Kaynak ve gerekçe: docs/arastirma/ajan-raporlari/18_profil_sorulari.md (PubMed taraması) ve
// docs/yol-haritasi/ENVANTER_VE_PLAN.md §3a. Hiçbir puan tanı ya da risk seviyesi üretmez; cevaplar
// yalnızca kişi-içi izleme ve uygulamanın kendini ayarlaması için (mola bütçesi, plan, flaşlı görevler).
// Dikkat halkası ankette SORULMAZ: ilk haftada göz kırpma, nefes sayma ve Hızlı Bakış'tan çıkarılır.
// Madde metinleri: Türkçe doğrulaması olan ölçeklerin resmî metni yayından önce tam metinden alınacak
// (SQS-TR, PSS-TR); buradakiler "doğrulanmamış çeviri/tek madde" etiketiyle (VARSAYIM).

export const PROFILE_VERSION = 1

// Genel klinik uyarı işaretleri (eski Screening ekranından). Yayın öncesi bir göz hekimi gözden geçirmeli.
export const RED_FLAGS = [
  { id: 'sudden', text: 'Son günlerde bir veya iki gözde ani görme kaybı ya da ani bulanıklık' },
  { id: 'curtain', text: 'Görme alanına perde, gölge inmesi' },
  { id: 'flashes', text: 'Yeni başlayan ışık çakmaları veya uçuşan noktalarda ani artış' },
  { id: 'distortion', text: 'Düz çizgilerin eğri, dalgalı görünmesi' },
  { id: 'pain', text: 'Göz ağrısı, belirgin kızarıklık veya ışığa aşırı hassasiyet' },
  { id: 'diplopia', text: 'Yeni başlayan çift görme' },
]

export const AGE_BANDS = [
  { id: '18-39', text: '18–39' },
  { id: '40-49', text: '40–49' },
  { id: '50-59', text: '50–59' },
  { id: '60-69', text: '60–69' },
  { id: '70+', text: '70+' },
]
export const CORRECTION = [
  { id: 'none', text: 'Gözlük / lens kullanmıyorum' },
  { id: 'distance', text: 'Sadece uzak gözlüğü / lens' },
  { id: 'reading', text: 'Sadece okuma (yakın) gözlüğü' },
  { id: 'progressive', text: 'Progresif / çift odaklı gözlük' },
  { id: 'contacts-multi', text: 'Multifokal kontakt lens / göz içi lens' },
]
export const EXAM = [
  { id: 'lt1', text: '1 yıldan yakın' },
  { id: '1to2', text: '1–2 yıl önce' },
  { id: 'gt2', text: '2 yıldan uzun / hatırlamıyorum' },
]
// Işığa duyarlı nöbet: Epilepsy Foundation uzlaşılarından türetilmiş tek madde (Fisher 2005/2022/2025);
// psikometrik doğrulaması yok. "Evet" ve "Emin değilim" flaşlı görevleri kapatır.
export const SEIZURE = [
  { id: 'no', text: 'Hayır' },
  { id: 'yes', text: 'Evet' },
  { id: 'unsure', text: 'Emin değilim' },
]
// NEI-VFQ yakın etkinlik mantığı; doğrulanmamış tek madde (yalnızca kişi-içi izleme)
export const NEAR_DIFFICULTY = ['Hiç', 'Biraz', 'Orta', 'Oldukça', 'Çok']
export const SCREEN_HOURS = [
  { id: 'lt2', text: '2 saatten az' },
  { id: '2-4', text: '2–4 saat' },
  { id: '4-6', text: '4–6 saat' },
  { id: '6+', text: '6 saatten çok' },
]
// SQS (tek maddeli uyku kalitesi, 0–10; Snyder 2018; Türkçe Dereli & Kahraman 2021). Uçlar: 0 çok kötü, 10 mükemmel.
export const SLEEP_MIN = 0
export const SLEEP_MAX = 10
// Gece uyanınca telefon (Dissing 2021, Exelmans 2016); doğrulanmamış tek madde
export const NIGHT_PHONE = [
  { id: 'never', text: 'Hiç' },
  { id: 'weekly', text: 'Haftada 1–2 gece' },
  { id: 'most', text: 'Çoğu gece' },
  { id: 'every', text: 'Her gece' },
]
// Algılanan stres: PSS'nin iki "olumsuz" maddesi (0–4 sıklık). Türkçe madde metni yayından önce
// Örücü & Demir 2009 / Eskin 2013 tam metninden alınacak; buradaki ifade VARSAYIM.
export const STRESS_FREQ = ['Hiç', 'Nadiren', 'Bazen', 'Sık sık', 'Çok sık']
export const STRESS_ITEMS = [
  { id: 'control', text: 'Son bir ayda, hayatındaki önemli şeyleri kontrol edemediğini ne sıklıkla hissettin?' },
  { id: 'overwhelmed', text: 'Son bir ayda, işlerin seni aştığını ne sıklıkla hissettin?' },
]

export const emptyProfile = () => ({
  version: PROFILE_VERSION,
  date: null,
  ageBand: null,
  correction: null,
  prescription: null, // isteğe bağlı serbest metin (≤40); HESABA GİRMEZ (rapor 19 §2)
  lastExam: null,
  flags: [],
  seizure: null,
  nearDifficulty: null, // 0–4
  screenHours: null,
  sleep: null, // 0–10
  nightPhone: null,
  stress: { control: null, overwhelmed: null }, // 0–4
})

const oneOf = (list, v) => (list.some((o) => o.id === v) ? v : null)
const intIn = (v, min, max) => (Number.isInteger(v) && v >= min && v <= max ? v : null)

export function normalizeProfile(raw) {
  const p = emptyProfile()
  if (!raw || typeof raw !== 'object') return p
  return {
    ...p,
    date: typeof raw.date === 'string' ? raw.date : null,
    ageBand: oneOf(AGE_BANDS, raw.ageBand),
    correction: oneOf(CORRECTION, raw.correction),
    prescription: typeof raw.prescription === 'string' && raw.prescription.trim() ? raw.prescription.trim().slice(0, 40) : null,
    lastExam: oneOf(EXAM, raw.lastExam),
    flags: Array.isArray(raw.flags) ? raw.flags.filter((f) => RED_FLAGS.some((r) => r.id === f)) : [],
    seizure: oneOf(SEIZURE, raw.seizure),
    nearDifficulty: intIn(raw.nearDifficulty, 0, NEAR_DIFFICULTY.length - 1),
    screenHours: oneOf(SCREEN_HOURS, raw.screenHours),
    sleep: intIn(raw.sleep, SLEEP_MIN, SLEEP_MAX),
    nightPhone: oneOf(NIGHT_PHONE, raw.nightPhone),
    stress: {
      control: intIn(raw.stress?.control, 0, STRESS_FREQ.length - 1),
      overwhelmed: intIn(raw.stress?.overwhelmed, 0, STRESS_FREQ.length - 1),
    },
  }
}

// Yaş → anket yaş aralığı (18 altı için VARSAYIM: en alt aralık; uygulama yetişkinlere yönelik)
export function ageBandFromAge(age) {
  if (!Number.isFinite(age)) return null
  return age < 40 ? '18-39' : age < 50 ? '40-49' : age < 60 ? '50-59' : age < 70 ? '60-69' : '70+'
}

// Eski kurulum kaydından (settings.screening: { age, flags, correction, lastExam }) kısmi profil
export function profileFromScreening(s) {
  if (!s) return emptyProfile()
  return normalizeProfile({ ageBand: ageBandFromAge(Number(s.age)), correction: s.correction, lastExam: s.lastExam, flags: s.flags })
}

// Sayfa bazında zorunlu alanlar (kırmızı bayrak ve stres isteğe bağlı değil ama "hiç" seçilebilir)
export const PAGES = ['eye', 'flags', 'safety', 'life']
export function pageComplete(p, page) {
  switch (page) {
    case 'eye':
      return Boolean(p.ageBand && p.correction && p.lastExam)
    case 'flags':
      return true
    case 'safety':
      return Boolean(p.seizure) && p.nearDifficulty != null
    case 'life':
      return Boolean(p.screenHours && p.nightPhone) && p.sleep != null && p.stress.control != null && p.stress.overwhelmed != null
    default:
      return false
  }
}
export const profileComplete = (p) => Boolean(p) && PAGES.every((pg) => pageComplete(p, pg))

// Uygulamanın kendini ayarlaması için türetilen işaretler. Tanı değil; ekranda "risk" olarak gösterilmez.
export function profileSignals(p) {
  const q = normalizeProfile(p)
  const stress = q.stress.control != null && q.stress.overwhelmed != null ? q.stress.control + q.stress.overwhelmed : null // 0–8
  return {
    referred: q.flags.length > 0,
    // null: sorulmadı; false: flaşlı görevler kapalı (Evet / Emin değilim)
    flashSafe: q.seizure == null ? null : q.seizure === 'no',
    heavyScreen: q.screenHours === '6+', // bilgi amaçlı; mola bütçesini KISALTMAZ (Build 20: 3 dk çok kısa bulundu; dayanağı da yoktu)
    poorSleep: q.sleep != null && q.sleep <= 4, // VARSAYIM: 0–10'da ≤4
    nightPhone: q.nightPhone === 'most' || q.nightPhone === 'every',
    nearDifficulty: q.nearDifficulty != null && q.nearDifficulty >= 3,
    stress, // 0–8; ≥5 "yüksek" sayılır (VARSAYIM)
    highStress: stress != null && stress >= 5,
    examOverdue: q.lastExam === 'gt2',
  }
}

// Eski alan (settings.screening) için geriye dönük kayıt: kurulum kapısı ve koç bunu okur
export function screeningFromProfile(p) {
  const q = normalizeProfile(p)
  return { date: q.date ?? new Date().toISOString(), age: null, ageBand: q.ageBand, flags: q.flags, correction: q.correction, lastExam: q.lastExam, referred: q.flags.length > 0 }
}
