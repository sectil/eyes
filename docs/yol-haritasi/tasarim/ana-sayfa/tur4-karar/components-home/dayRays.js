// Ana sayfa · "Senin gözün" (ana sayfa 5 saniye yeniden tasarımı, Yön B): kayıtlardan gözün ışınları. Saf; depoya ve
// ekrana dokunmaz. Yolun mantığına dokunmaz: yalnız kayıtları sayar (sunuş).
//   Işın: kaydı olan her geçmiş gün bir ışın (activeDays ile aynı gün anahtarı: kaydın yerel günü). Atlanan gün boşluk
//   bırakmaz, hiçbir ışın sönmez (plan §3.A.8-7, karar 5d: ceza yok).
//   Işının boyu: o gün yapılan ayrı durak sayısı (aynı durak bir kez; haftalık E testinin üç gözü tek durak), en çok 10.
import { dayKey } from '../../lib/calendar.js'

export const RAY_FULL = 10 // 10 durak = tam ışın (tam yol, plan §3.A.9 9. gün)
export const LAP = 28 // bir tur 28 ışın: 28. günde göz dolar ("28. gün yeniden bakacağız")

// Kaydın durak kimliği: egzersiz grubu (setId), oyun (game), öteki kayıtlar türüyle
export function stopIdOf(r) {
  if (!r || typeof r.type !== 'string') return null
  if (r.type === 'routine') return `routine:${r.setId ?? ''}`
  if (r.type === 'game') return `game:${r.game ?? ''}`
  return r.type
}

// İlk Bakış'ın günleri (5 saniye kapı turu 1, 1. gün): İlk Bakış da o günün bir durağıdır ve gözün ışınına sayılır. İlk
// günün gözü böylece boş, gri bir disk değil: kurulumda yapılan İlk Bakış ilk ışını yakar ("Her gün bir ışın"; hiçbir
// ışın sönmez: ertesi gün de yerinde kalır). Kaynak profil: son İlk Bakış (firstLook.date), iris haritasının başlangıcı
// ve 28. gün yenilemesi (kırpma sayısı varsa; lib/iris.js snapshot). Kayıt değildir: seriye, haftaya, yola sayılmaz.
export function lookDates(profile = null) {
  const p = profile ?? {}
  const out = []
  if (p.firstLook?.date && p.firstLook.blinks != null) out.push(p.firstLook.date)
  for (const s of [p.iris?.baseline, p.iris?.recheck]) if (s?.date && s.blinks != null) out.push(s.date)
  return out
}

// { days: [geçmiş günlerin durak sayısı, eskiden yeniye], today: bugünkü ayrı durak sayısı (yalnız kayıtlar), look:
//   bugün İlk Bakış yapıldı, last: bugünden önceki son kayıt günü ('YYYY-MM-DD') ya da null (İlk Bakış sayılmaz; günün
//   cümlesinin "aradan dönüş"ü kayıtlara bakar), lookDays: bugünden önce yalnız İlk Bakış'ın olduğu günler (göz bebeği) }
//   looks: İlk Bakış tarihleri (lookDates); geçmiş günün ışınına bir durak olarak eklenir, bugünün ışınını "look" yakar.
export function dayRays({ tests = [], sessions = [], now = new Date(), looks = [] } = {}) {
  const today = dayKey(now)
  const by = new Map()
  for (const r of [...(tests ?? []), ...(sessions ?? [])]) {
    const t = new Date(r?.date).getTime()
    if (!Number.isFinite(t)) continue
    const k = dayKey(t)
    if (k > today) continue
    if (!by.has(k)) by.set(k, new Set())
    const id = stopIdOf(r)
    if (id) by.get(k).add(id)
  }
  const recorded = [...by.keys()].filter((k) => k < today).sort()
  let look = false
  const lookDays = []
  for (const d of looks ?? []) {
    const t = new Date(d ?? NaN).getTime()
    if (!Number.isFinite(t)) continue
    const k = dayKey(t)
    if (k > today) continue
    if (k === today) {
      look = true
      continue
    }
    if (!by.has(k)) {
      by.set(k, new Set())
      if (!lookDays.includes(k)) lookDays.push(k)
    }
    by.get(k).add('look')
  }
  const cap = (n) => Math.min(RAY_FULL, Math.max(1, n))
  const past = [...by.keys()].filter((k) => k < today).sort()
  return { days: past.map((k) => cap(by.get(k).size)), today: by.has(today) ? cap(by.get(today).size) : 0, look, last: recorded.at(-1) ?? null, lookDays: lookDays.sort() }
}

// Gözün bugünkü ışını: bugün yapılan durak sayısı; İlk Bakış bugünse o da bir durak (kurulum günü ilk ışın yanar)
export const todayRayN = (rays) => (rays?.today ?? 0) + (rays?.look ? 1 : 0)

// Göz bebeğindeki sayı. Sıfır yok: hiç ışın yokken "İlk gün". Seri ≥ 3 ve gün sayısıyla aynıysa tek sayı "N gün seri"
// (S0 kararı 24: aynı sayı iki kez yazılmaz); değilse "N gün seninle" (plan §3.F.3, S0 kararı 24), seri ayrı hapta.
// 5 saniye kapı turu 2: göz bebeğinde yalnız "1 gün" / "69 gün" yazınca beş değerlendiricinin dördü neyin günü olduğunu
// soramadı ("bugün kaçıncı günüm?", "69 neyi sayıyor?"); onaylı tam hâli yazılır.
export function pupilOf({ totalDays = 0, streak = 0 } = {}) {
  if (!(totalDays > 0)) return { n: 'İlk', label: 'gün', word: true, streakPill: null }
  if (streak >= 3 && streak === totalDays) return { n: streak, label: 'gün seri', lens: true, streakPill: null }
  return { n: totalDays, label: 'gün seninle', streakPill: streak >= 3 ? streak : null }
}

// Halkada kilometre taşı işareti yoktur (5 saniye kapı turu 1 ve 2: 1. günde beşte beş, 2. günde beşte beş
// değerlendirici halkadaki turuncu "7. gün"ü göz bebeğindeki sayıyla çelişen ikinci bir gün sayısı diye okudu: "hedef mi,
// rozet mi, hangi gündeyim?"). İlk görünümde tek gün sayısı göz bebeğindedir; 7., 28. ve 30. gün o günün cümlesiyle
// söylenir (dayLead.js öncelik 2).
