// Profil soruları (v2): her soru tek ekranda, ilgili anın önünde ya da arkasında, bir kez sorulur.
// Tasarım: Artifact "Önce Fark Ettir" (onaylı). Her cevaptan sonra Jev tek cümleyle neden sorduğunu söyler;
// cümle cevabın uygulamada gerçekten neyi değiştirdiğini anlatır, değiştirmediği bir şeyi vaat etmez.
// Kaynak etiketleri lib/profile.js'teki listelerin yanında; burada ekranın altındaki kısa satır (source).
import {
  AGE_BANDS, CORRECTION, EXAM, SEIZURE, NEAR_DIFFICULTY, SCREEN_HOURS, SLEEP_MIN, SLEEP_MAX, NIGHT_PHONE, STRESS_FREQ, STRESS_ITEMS,
  normalizeProfile,
} from './profile.js'

const OLDER = new Set(['40-49', '50-59', '60-69', '70+'])
export const isOlder = (p) => OLDER.has(normalizeProfile(p).ageBand)
const idx = (list) => list.map((text, i) => ({ id: i, text }))
const withStress = (p, key, v) => ({ ...p, stress: { ...p.stress, [key]: v } })
const JEV_OPTIONAL = 'Jev açıksa'

// kind: 'choice' (tek dokunuş) | 'slider'
export const QUESTIONS = {
  age: {
    text: 'Yaş aralığın?',
    options: AGE_BANDS,
    get: (p) => p.ageBand,
    set: (p, v) => ({ ...p, ageBand: v }),
    why: (v) =>
      OLDER.has(v)
        ? 'Yakın görme yaşla değişir. Okuma testinden önce yakın gözlüğün varsa takmanı hatırlatacağım.'
        : 'Yakın görme yaşla değişir; değişimini kendi başlangıcına göre izleyeceğim.',
    source: 'BCLA CLEAR 2024: yakın görme kaybı yaşa bağlı ve çok yaygın.',
  },
  seizure: {
    eyebrow: 'Başlamadan önce', // flaşlı ilk görevden önce (Hızlı Bakış, Tek Bakışta)
    text: 'Epilepsi tanın var mı, ya da yanıp sönen ışıkla bayılma, kasılma yaşadın mı?',
    options: SEIZURE,
    row: true,
    get: (p) => p.seizure,
    set: (p, v) => ({ ...p, seizure: v }),
    why: (v) =>
      v === 'no'
        ? 'Hızlı Bakış ve Tek Bakışta kısa süre görünen görüntüler kullanıyor; senin için açık.'
        : "Hızlı Bakış ve Tek Bakışta senin için kapalı; diğer her şey açık. Cevabını Profilim'den değiştirebilirsin.",
    source: 'Epilepsy Foundation uzlaşısından tek madde (Fisher 2005/2022/2025).',
  },
  correction: {
    eyebrow: 'İlk okuma testinden önce',
    text: 'Hangi gözlük ya da lensi kullanıyorsun?',
    options: CORRECTION,
    get: (p) => p.correction,
    set: (p, v) => ({ ...p, correction: v }),
    why: (v) =>
      v === 'none'
        ? 'Okuma sonuçlarını yalnız aynı koşuldaki testlerle karşılaştırırım; bir gün gözlük takarsan testte seçmen yeter.'
        : 'Okuma sonuçlarını yalnız aynı gözlükle yapılan testlerle karşılaştırırım; her testte bu seçim hazır gelir.',
  },
  nearDifficulty: {
    eyebrow: 'Okuma sonucundan sonra',
    text: 'Son bir ayda küçük yazı okurken ne kadar zorlandın?',
    options: idx(NEAR_DIFFICULTY),
    get: (p) => p.nearDifficulty,
    set: (p, v) => ({ ...p, nearDifficulty: v }),
    why: () => "Bunu ölçtüğümüz yazı boyunun yanına koyuyorum; Gelişim'de hissettiğinle ölçtüğümüzü yan yana göreceksin.",
    source: 'NEI-VFQ yakın etkinlik mantığı; doğrulanmamış tek madde.',
  },
  lastExam: {
    eyebrow: 'İlk E testinden sonra',
    text: 'Son göz muayenen ne zamandı?',
    options: EXAM,
    get: (p) => p.lastExam,
    set: (p, v) => ({ ...p, lastExam: v }),
    why: (v, p) =>
      v === 'gt2' && isOlder(p)
        ? '40 yaş üstünde düzenli göz muayenesi önerilir; bir muayene planlamanı öneririm.'
        : "Uygulama muayenenin yerini tutmaz; ölçümlerini muayeneye götürmek istersen Bilgi'den dışa aktarabilirsin.",
  },
  screenHours: {
    eyebrow: 'Akşam kontrolü',
    text: 'Bugün kaç saat ekrana baktın? (iş + kişisel)',
    options: SCREEN_HOURS,
    get: (p) => p.screenHours,
    set: (p, v) => ({ ...p, screenHours: v }),
    why: () => `${JEV_OPTIONAL} mola önerilerini buna göre kurar; kapalıysa yalnız Profilim'de durur.`,
  },
  sleep: {
    eyebrow: 'Akşam kontrolü',
    text: 'Son 7 gündeki uykunu 0–10 arasında nasıl değerlendirirsin?',
    kind: 'slider',
    min: SLEEP_MIN,
    max: SLEEP_MAX,
    ends: ['çok kötü', 'mükemmel'],
    get: (p) => p.sleep,
    set: (p, v) => ({ ...p, sleep: v }),
    why: () => `${JEV_OPTIONAL} önerilerinde uykunu da hesaba katar. Puan ya da değerlendirme üretmem.`,
    source: 'SQS tek madde (Snyder 2018; Türkçe Dereli & Kahraman 2021).',
  },
  nightPhone: {
    eyebrow: 'Akşam kontrolü',
    text: 'Uykuya daldıktan sonra ya da gece uyanınca telefona bakar mısın?',
    options: NIGHT_PHONE,
    get: (p) => p.nightPhone,
    set: (p, v) => ({ ...p, nightPhone: v }),
    why: () => `${JEV_OPTIONAL} gece ekranıyla ilgili önerisini buna göre seçer.`,
    source: 'Doğrulanmamış tek madde (Dissing 2021, Exelmans 2016).',
  },
  stressControl: {
    eyebrow: 'İlk haftan bitti',
    text: STRESS_ITEMS[0].text,
    options: idx(STRESS_FREQ),
    row: true,
    get: (p) => p.stress.control,
    set: (p, v) => withStress(p, 'control', v),
    why: () => `Stres puanı ya da tanı üretmem; ${JEV_OPTIONAL} nefes önerilerinde bunu hesaba katar.`,
    source: "PSS'nin iki maddesi; Türkçe resmî metin yayından önce (VARSAYIM).",
  },
  stressOverwhelmed: {
    eyebrow: 'İlk haftan bitti',
    text: STRESS_ITEMS[1].text,
    options: idx(STRESS_FREQ),
    row: true,
    get: (p) => p.stress.overwhelmed,
    set: (p, v) => withStress(p, 'overwhelmed', v),
    why: () => `Stres puanı ya da tanı üretmem; ${JEV_OPTIONAL} nefes önerilerinde bunu hesaba katar.`,
    source: "PSS'nin iki maddesi; Türkçe resmî metin yayından önce (VARSAYIM).",
  },
}

// Ana sayfa kartıyla sorulan gruplar
export const GROUPS = {
  evening: ['screenHours', 'sleep', 'nightPhone'],
  stress: ['stressControl', 'stressOverwhelmed'],
}
// VARSAYIM (onaylı taslak): akşam kontrolü 18:00'den sonra; stres kartı 7. günden sonra
export const EVENING_HOUR = 18
export const STRESS_AFTER_DAYS = 7

export const answered = (p, id) => QUESTIONS[id]?.get(normalizeProfile(p)) != null
export const missing = (p, ids = []) => ids.filter((id) => QUESTIONS[id] && !answered(p, id))
export const answer = (p, id, v) => QUESTIONS[id].set(normalizeProfile(p), v)

// Ana sayfada gösterilecek kart: 'evening' | 'stress' | null. Kurulum bitmemişse hiçbiri.
export function pendingCard(profile, now = new Date()) {
  const p = normalizeProfile(profile)
  if (!p.date) return null
  const t = new Date(now).getTime()
  const open = (id) => {
    const pr = p.prompts[id]
    if (pr?.skipped) return false
    return !(pr?.snoozedUntil && new Date(pr.snoozedUntil).getTime() > t)
  }
  if (new Date(now).getHours() >= EVENING_HOUR && missing(p, GROUPS.evening).length && open('evening')) return 'evening'
  const days = (t - new Date(p.date).getTime()) / 86400000
  if (days >= STRESS_AFTER_DAYS && missing(p, GROUPS.stress).length && open('stress')) return 'stress'
  return null
}
// "Sonra": ertesi akşam 18:00'e kadar
export function snooze(profile, id, now = new Date()) {
  const p = normalizeProfile(profile)
  const d = new Date(now)
  d.setDate(d.getDate() + 1)
  d.setHours(EVENING_HOUR, 0, 0, 0)
  return { ...p, prompts: { ...p.prompts, [id]: { ...p.prompts[id], snoozedUntil: d.toISOString() } } }
}
// "Geç": bir daha sorulmaz (isteğe bağlı sorular)
export function skip(profile, id, now = new Date()) {
  const p = normalizeProfile(profile)
  return { ...p, prompts: { ...p.prompts, [id]: { ...p.prompts[id], skipped: new Date(now).toISOString() } } }
}

// Profilim → Sorularım satırları: [{ id, label, value | null, later }]
const textOf = (q, v) => q.options?.find((o) => o.id === v)?.text ?? (v == null ? null : String(v))
export function questionRows(profile) {
  const p = normalizeProfile(profile)
  const row = (id, label, later) => ({ id, label, value: textOf(QUESTIONS[id], QUESTIONS[id].get(p)), later })
  return [
    row('age', 'Yaş aralığı'),
    { id: 'flags', label: 'Uyarı işaretleri', value: p.flagsChecked ? (p.flags.length ? `${p.flags.length} işaret` : 'Hiçbiri yok') : null },
    { id: 'firstLook', label: 'İlk 20 sn', value: p.firstLook ? `${p.firstLook.blinks} kırpma${p.firstLook.method === 'self' ? ' · kendi sayım' : ''}` : null, later: 'dokun, dene' },
    { ...row('seizure', 'Flaşlı görevler', 'ilk flaşlı görevden önce'), value: p.seizure == null ? null : p.seizure === 'no' ? 'Açık' : 'Kapalı' },
    row('correction', 'Gözlük / lens', 'ilk okuma testinde'),
    row('nearDifficulty', 'Küçük yazıda zorluk', 'okuma testinden sonra'),
    row('lastExam', 'Son muayene', 'ilk E testinden sonra'),
    row('screenHours', 'Ekran saati', 'akşam sorulacak'),
    row('sleep', 'Uyku (0–10)', 'akşam sorulacak'),
    row('nightPhone', 'Gece telefonu', 'akşam sorulacak'),
    row('stressControl', 'Stres · kontrol', '1. hafta sonu'),
    row('stressOverwhelmed', 'Stres · işler aşıyor', '1. hafta sonu'),
  ]
}
