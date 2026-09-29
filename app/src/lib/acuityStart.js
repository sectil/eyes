// E testine başlarken hazır gelenler ve biten gözün hemen kaydı (haftalık E testi planı §4 E0/E2; kararlar S3, S4,
// S10). Saf yardımcılar: kayıtlar App'in tests dizisinden ve profilden okunur, yazma yalnız store.addTest ile olur
// (lib/dataHub.js ilkesi: ayrı depo yok). Kullanan: modules/weekly/view.jsx, modules/daily/view.jsx.
import { readingV2 } from './reading.js'
import { skipEyesToday, runDayOf, weeklyStatus } from './today.js'
import { dayKey } from './calendar.js'
import { normalizeProfile, profileFromScreening } from './profile.js'

// AcuityTest gözlük seçenekleri (WEAR): Gözlüksüz, Okuma gözlüğü, Progresif / bifokal, Yalnız uzak gözlüğü, Lens
export const WEAR_IDS = ['none', 'reading', 'progressive', 'distance', 'contacts']
// Build ≤18 kaydı: hangi gözlük olduğu belli değil → ön seçilmez; ekran "Geçen sefer gözlüklüydün · hangisi?" sorar
export const LEGACY_GLASSES = 'glasses'
// Profil cevabı → ön seçim (karar S10). 'distance' ("Yalnız uzak gözlüğü / lens") ve 'contacts-multi' ("Multifokal
// lens / göz içi lens") belirsiz: gözlük mü lens mi, yakında takılıyor mu belli değil → ön seçilmez.
export const PROFILE_PRESELECT = Object.freeze({ none: 'none', reading: 'reading', progressive: 'progressive' })

const isVa = (t) => t?.type === 'va-daily' || t?.type === 'va-weekly'
const isWear = (id) => WEAR_IDS.includes(id)

// Son E testinin gözlük seçimi (kayıt sırası; alan yoksa null). "Geçen sefer …" metni ve yeni seri uyarısı bununla.
export const lastAcuityCorrection = (tests = []) => tests.filter(isVa).at(-1)?.correction ?? null

// Gözlük ön seçimi (S10): son E testi → son okuma testi → profil cevabı → boş.
//   → { value: WEAR kimliği | null, source: 'acuity' | 'reading' | 'profile' | null, legacy: eski 'glasses' kaydı }
// Son E testinde seçim yoksa (çok eski kayıt) sıradaki kaynağa geçilir; eski 'glasses' ise ön seçim yapılmaz.
// 'distance' yalnız profil cevabı olarak belirsiz sayılır; testte açıkça seçildiyse hatırlanır (karar S10 metni).
export function defaultCorrection({ tests = [], profile = null } = {}) {
  const last = lastAcuityCorrection(tests)
  if (last === LEGACY_GLASSES) return { value: null, source: 'acuity', legacy: true }
  if (isWear(last)) return { value: last, source: 'acuity', legacy: false }
  const reading = readingV2(tests).at(-1)?.correction
  if (isWear(reading)) return { value: reading, source: 'reading', legacy: false }
  const answer = profile?.correction
  const fromProfile = typeof answer === 'string' && Object.prototype.hasOwnProperty.call(PROFILE_PRESELECT, answer) ? PROFILE_PRESELECT[answer] : null
  return { value: fromProfile, source: fromProfile ? 'profile' : null, legacy: false }
}

// Ayarlardaki profil (reading/view.jsx ile aynı yol)
export const profileOf = (settings = {}) => normalizeProfile(settings?.profile ?? profileFromScreening(settings?.screening))

// AcuityTest'e açılışta bir kez verilecek başlangıç değerleri (ekran bunları yalnız ilk çizimde okumalı):
//   runDay: koşu günü (açılışın yerel günü, 'YYYY-MM-DD'). Ekran her göz kaydına yazar; tamamlama, atlanacak gözler ve
//     "Kalanlar Bugün'de bekler." bu güne göre (lib/today.js runDayOf): gece yarısını geçen koşu başladığı güne sayılır.
//   skipEyes: bugün yarım kalan testte biten gözler (E0: test ilk eksik gözden başlar); tam ya da boş günde []
//   lastCorrection: son E testindeki seçim (eski davranış) · defaultCorrection: ön seçim ya da null
//   correctionSource: ön seçimin kaynağı ("geçen seferki" etiketi yalnız 'acuity' / 'reading' için doğru)
//     Yarım günde (skipEyes dolu) gözlük satırı kilitlidir: ön seçim bu koşuda kaydedilen gözün seçimi; arada yapılan
//     başka bir test (ör. günlük E testi) onu değiştirmez. Diğer günlerde S10 önceliği (defaultCorrection).
//   newBaseline: yarım günde biten gözlerden biri "Evet, yenilendi" ile kaydedildiyse true. Kalan gözler de yeni
//     gözlükle ölçülür; onların serisi de yeniden başlamalı (gözlük satırı 2./3. gözde kilitli, soru yeniden sorulmaz).
//   todayHolds: yarım kalırsa kalan gözler Bugün kartında görünecek mi (E10 "Kalanlar Bugün'de bekler."). Haftalık test
//     bugün yoldayken günlük test Bugün'de gösterilmez (modules/daily/manifest.js). Gece yarısı geçtiyse ekran bunu
//     ayrıca denetler (koşu günü bitti: kalanlar beklemez, test ertesi gün baştan açılır).
export function acuityStart({ plan = 'daily', tests = [], settings = {}, now = new Date() } = {}) {
  const type = plan === 'weekly' ? 'va-weekly' : 'va-daily'
  const runDay = dayKey(now)
  const skipEyes = skipEyesToday(tests, type, now)
  const skip = new Set(skipEyes)
  // Bu koşu gününde kaydedilmiş (atlanacak) gözlerin kayıtları
  const saved = skipEyes.length ? tests.filter((t) => t?.type === type && skip.has(t.eye) && runDayOf(t) === runDay) : []
  const runCorrection = saved.map((t) => t.correction).filter(isWear).at(-1) ?? null
  const c = runCorrection ? { value: runCorrection, source: 'acuity' } : defaultCorrection({ tests, profile: profileOf(settings) })
  return {
    skipEyes,
    lastCorrection: lastAcuityCorrection(tests),
    defaultCorrection: c.value,
    correctionSource: c.source,
    newBaseline: saved.some((t) => t.newBaseline === true),
    todayHolds: plan === 'weekly' || weeklyStatus(tests, now).state === 'idle',
    runDay,
  }
}

// Biten göz hemen kaydedilir (S4): AcuityTest her göz bitince onSaveEye(kayıt) çağırır. Sonda onFinish(sonuçlar)
// gelirse yalnız henüz kaydedilmemiş gözler döner (aynı göz iki kez yazılmaz; onSaveEye çağırmayan eski akışta da
// sonuçlar kaybolmaz). save(kayıt) → yazıldıysa true.
export function createEyeSaver(write) {
  const saved = new Set()
  const fresh = (r) => r != null && typeof r === 'object' && !(r.eye != null && saved.has(r.eye))
  return {
    save(rec) {
      if (!fresh(rec)) return false
      if (rec.eye != null) saved.add(rec.eye)
      write(rec)
      return true
    },
    finish(results) {
      const rest = [].concat(results ?? []).filter(fresh)
      for (const r of rest) if (r.eye != null) saved.add(r.eye)
      return rest
    },
  }
}
