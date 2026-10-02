// Ana sayfa · günün tek cümlesi (SONSUZ_YOL.PLAN.v1 §3.F.4; ana sayfa 5 saniye yeniden tasarımı). Kişinin kendi
// verisinden, telefonda, ağsız; "ilk tutan kazanır". Saf: depoya yazmaz (günün kaydı components/home/dayOpen.js).
// Yolun mantığına dokunmaz: yol, "Yeni" kuralı, basamaklar ve sayılar olduğu gibi okunur; yalnız hangi onaylı cümlenin
// yazılacağı seçilir.
//
// Sıra (plan tablosu; değerlendiricilerin aşısıyla tek fark: "Bugün yeni" haftalık E testi cümlesinden önce gelir, E testi
// o gün büyük düğmenin durağı değilse; ana sayfa 5 saniye raporu):
//   0 kırmızı ya da sarı görme uyarısı → cümle yok (uyarı en üstte; Home.jsx)
//   1 kurulum günü (akşam kurulduysa ertesi gün) → "20 saniyede 3 kez göz kırptın." ve altında "Senin sayın bir yargı
//     değil, bir başlangıç. 4 hafta sonra yeniden bakacağız." (plan cümlesinin ikiye bölünmüşü; 5 saniye kapı turu 1:
//     beş değerlendiricinin beşi sayının iyi mi kötü mü olduğunu sordu, "İlk Bakış" adını ve üçüncü gün sayısını
//     "28. gün" anlamadı. Alt satırın ilk cümlesi İlk Bakış sonuç ekranının onaylı cümlesi, lib/firstLookText.js)
//   2 kilometre taşı: 7. gün (S0 kararı 5), 28. gün iris haritası, 30. gün (metin kapısına); eski kullanıcının
//     güncelleme günü → "Yolun yenilendi." ve altında bugünün yeni durakları (5 saniye kapı turu 2)
//   3 ≥ 2 gün aradan dönüş (14 günden kısa: basamak gerçekten aynı) → "Kaldığın yerden: basamakların aynı."
//   6 bugün yeni durak → "Bugün yeni: daire." (göz egzersizi önce, sonra yol sırası; nefes molası hariç)
//   2 haftalık E testi günü → "Bugün haftalık E testi günü." ve "3 bölüm · sağ, sol, iki göz"
// Cümle büyük düğmeyi tekrar etmez (5 saniye kapı turu 2, 2. gün: beş değerlendiricinin üçü "Bugün yeni: sağ–sol bakış"
// başlığının hemen altındaki kartta "Yeni · Sağ–sol bakış" diye tekrarlandığını yazdı). Yeni durak ya da haftalık E
// testi düğmenin durağıysa haberi düğme verir ("Yeni" rozeti; "E testi · haftada bir"); cümle o adayı yazmaz, sıradaki
// aday yazılır (2. gün: "Dün yolunun bütün duraklarını tamamladın."). Öncelik 9'daki "düğmeyi tekrar ediyorsa hiçbiri"
// kuralının aynısı.
//   7 dün yol tamamdı → "Dün yolunun bütün duraklarını tamamladın."
//   8 ≤ 3 gün içinde iris haritası → "İris haritan 3 gün sonra başlangıçla yan yana gelecek."
//   9 hiçbiri → Ana sayfa önerisinin satırı (lib/homeSuggest.js; düğmeyi tekrar ediyorsa hiçbir şey)
// 4 (dünkü ilk ya da rekor) ve 5 (doğrulanmış değişim) bu işte yok (ölçü kuralı v2'nin işi, Y2).
// Aynı öncelik iki gün üst üste gelmez; 0, 1 ve 2 hariç (plan §3.F.4, S0 kararı 5).
import { EXERCISES } from '../../lib/routines.js'
import { dayKey } from '../../lib/calendar.js'
import { buildPath, calendarDaysBetween, WEEKLY_SUB } from '../../lib/today.js'
import { progressionCtx } from '../../lib/progression.js'
import { SOFT_GAP } from '../../lib/ladders.js'
import { RECHECK_DAYS } from '../../lib/iris.js'

export const LINES = {
  // metin kapısına (plan §3.F.4 öncelik 1'in ilk yarısı); sayı ile "kez" arasında bölünmez boşluk (320 pt'de "3" satır
  // sonunda tek kalmasın)
  first: (sec, n) => `${sec} saniyede ${n}\u00a0kez göz kırptın.`,
  // İlk Bakış sonuç ekranının cümlesi (lib/firstLookText.js source) + iris haritasının yenilenmesi (RECHECK_DAYS 28 gün
  // sonra; plandaki "28. gün yeniden bakacağız"ın gün sayısız hâli, metin kapısına)
  firstSub: 'Senin sayın bir yargı değil, bir başlangıç. 4 hafta sonra yeniden bakacağız.',
  week1: 'Bugün 7. gün: ilk haftanı tamamlıyorsun.',
  month1: 'Bugün 30. gün: ilk ayını tamamlıyorsun.', // metin kapısına (Yön C'den; plan tablosunda yok)
  iris: 'Bugün 28. gün: iris haritan başlangıçla yan yana geliyor.',
  weekly: 'Bugün haftalık E testi günü.',
  back: 'Kaldığın yerden: basamakların aynı.',
  yday: 'Dün yolunun bütün duraklarını tamamladın.',
  irisSoon: (d) => `İris haritan ${d} gün sonra başlangıçla yan yana gelecek.`,
  news: 'Bugün yeni: ',
  // metin kapısına (5 saniye kapı turu 2, eski kullanıcı: beş değerlendiricinin dördü güncelleme gününü ekranda
  // göremedi, başlıktaki tek yeni hareketi düğmenin başlattığı şey sandı)
  update: 'Yolun yenilendi.',
  // Sahibin kararı (2026-10-01, SAHIP_ISTEKLERI.md "Ana sayfa iki karar"): ilk cümle bugüne dönük, Nef bugünün işini
  // söyler. Kalıp sahibin seçtiği örnekten: "Bugünkü yolun 8 dakika, ilk durağın Sağ–sol bakış."
  today: (min, name) => `Bugünkü yolun ${min}\u00a0dakika, ilk durağın ${name}.`,
}

// Ekrandaki ad: S0 kararı 4 "Sağ–sol bakış" (lib/ladders.js'teki grup adı "Sağ–sol" ve testleri değişmez)
const SHOWN = { 'Sağ–sol': 'Sağ–sol bakış' }
export const shownTitle = (s) => SHOWN[s?.title] ?? s?.title ?? ''

// Büyük düğmede haftalık E testi (5 saniye kapı turu 1, 1. gün: beş değerlendiricinin üçü ilk günün ilk işinde
// "Haftalık" sözünü tuhaf, "E testi"ni teknik buldu; ilk dokunuş "muayene" gibi okundu). Ad ikiye bölünür: "E testi"
// ve yanında "haftada bir" etiketi (sürüm notunun onaylı sözü: "E testi artık haftada bir yapılıyor"); zamanı gelmiş
// testin satırı ne yapılacağını söyler: "E hangi yöne bakıyor?" (sitenin onaylı düğmesi, S0 Ç11); üç bölüm
// (WEEKLY_SUB) yoldaki durağın satırında kalır (ilk günün gözü düğmenin boyu yüzünden küçülmesin). Yarım
// kalmış testte ("Kalan: sol göz, iki göz") satır aynen kalır. Yoldaki durağın adı ve satırı değişmez.
export const GO_WEEKLY = { title: 'E testi', tag: 'haftada bir', ask: 'E hangi yöne bakıyor?' }
export function goFace(stop) {
  if (stop?.id !== 'weekly') return { title: shownTitle(stop), tag: null, sub: stopLine(stop) }
  const due = stop.sub === WEEKLY_SUB
  return { title: GO_WEEKLY.title, tag: GO_WEEKLY.tag, sub: due ? GO_WEEKLY.ask : stopLine(stop) }
}
const low = (t) => String(t).toLocaleLowerCase('tr-TR')

// Egzersiz durağının adımları, düz dille: "Göz kırp, sağa bak, sola bak" (lib/routines.js EXERCISES adları, çeşitleme
// yamasıyla; ardışık aynı adım bir kez). Adımı olmayan durakta null.
export function stepLine(stop) {
  const steps = stop?.stage?.steps
  if (!Array.isArray(steps) || !steps.length) return null
  const names = []
  for (const id of steps) {
    const t = stop.stage?.patch?.[id]?.title ?? EXERCISES[id]?.title
    if (t && names.at(-1) !== t) names.push(t)
  }
  return names.length ? names.map((n, i) => (i ? low(n) : n)).join(', ') : null
}
// Durağın ne olduğu (büyük düğmenin alt satırı): durağın kendi alt satırı, yoksa adımları
export const stopLine = (stop) => stop?.sub || stepLine(stop) || null
// "Bugün yeni" cümlesinin alt satırı: Daire'de tek cümlelik tarif (EXERCISES.circleCw.sub), ötekilerde durağın satırı
const HINT = { 'routine:daire': `${EXERCISES.circleCw.sub}.` }
export const newsHint = (stop) => HINT[stop?.key] ?? stopLine(stop)

// Bugünün yenisi: göz egzersizi önce (yeni hareket), sonra yol sırasıyla öteki duraklar; nefes molası ("Bugünün ritmi"
// nefes ekranında söylenir) ve biten durak hariç
export function newsStop(plan, newKeys = []) {
  const list = (plan?.stops ?? []).filter((s) => newKeys.includes(s.key) && !s.restSlot && !s.done)
  return list.find((s) => s.id === 'routine') ?? list[0] ?? null
}

const time = (d) => {
  const t = new Date(d ?? NaN).getTime()
  return Number.isFinite(t) ? t : null
}

// Güncelleme gününün yenileri (eski kullanıcı): yol sırasıyla, nefes molası ve biten durak hariç, en çok üç
export function newsStops(plan, newKeys = []) {
  return (plan?.stops ?? []).filter((s) => newKeys.includes(s.key) && !s.restSlot && !s.done).slice(0, 3)
}

// Aday cümleler, öncelik sırasıyla. Her aday: { p, text, sub?, stop? (satır içi çizim), pre?, name?, post?, list? }
//   list: güncelleme gününde bugünün yeni durakları (cümlenin altında çizimleriyle, adlarıyla)
//   setupDate: kurulum tarihi; firstLook: profil İlk Bakış sonucu; baseline/recheck: iris haritası tarihleri;
//   lastDay: bugünden önceki son kayıt günü ('YYYY-MM-DD'); yesterdayDone: dün yolun bütün durakları bitti;
//   update: eski kullanıcının güncelleme günü (lib/progression.js updateDay; yalnız okunur)
//   plan.next büyük düğmenin durağıdır (Home.jsx; düğme yolun durağını göstermiyorsa next verilmez)
export function leadCandidates({ now = new Date(), setupDate = null, firstLook = null, baseline = null, recheck = null, plan = null, newKeys = [], lastDay = null, yesterdayDone = false, update = false } = {}) {
  const today = dayKey(now)
  const out = []
  const setup = time(setupDate)
  const since = setup != null ? calendarDaysBetween(dayKey(setup), today) : null
  // 1 · kurulum günü; kurulum 18.00'den sonraysa ertesi gün
  if (since != null && firstLook && firstLook.blinks > 0 && firstLook.seconds > 0) {
    const eve = new Date(setup).getHours() >= 18
    if ((since === 0 && !eve) || (since === 1 && eve)) out.push({ p: 1, text: LINES.first(Math.round(firstLook.seconds), Math.round(firstLook.blinks)), sub: LINES.firstSub })
  }
  // 2 · takvim kilometre taşları (kurulum günü 1. gün)
  if (since === 6) out.push({ p: 2, text: LINES.week1 })
  if (since === 29) out.push({ p: 2, text: LINES.month1 })
  const base = time(baseline)
  const irisIn = base != null && time(recheck) == null ? RECHECK_DAYS - calendarDaysBetween(dayKey(base), today) : null
  if (irisIn === 0) out.push({ p: 2, text: LINES.iris })
  // 2 · eski kullanıcının güncelleme günü: yolun yenilendiği ve bugünün yenileri (tek hareket değil: düğme yine yolun
  // ilk durağını başlatır, cümle onunla yarışmaz). Günde bir kez olur; kilometre taşı gibi tekrar kuralı dışında.
  const upd = update ? newsStops(plan, newKeys) : []
  if (upd.length) out.push({ p: 2, text: LINES.update, list: upd })
  // 3 · ≥ 2 günlük aradan dönüş; 14 günden sonra basamak bir gün aşağı iner (lib/ladders.js SOFT_GAP), cümle yazılmaz
  const gap = lastDay ? calendarDaysBetween(lastDay, today) : null
  if (gap != null && gap >= 3 && gap < SOFT_GAP) out.push({ p: 3, text: LINES.back })
  // 6 · bugün yeni (düğmenin durağıysa yazılmaz: düğmede "Yeni" rozeti; güncelleme gününde yukarıdaki liste söyler)
  const nw = upd.length ? null : newsStop(plan, newKeys)
  if (nw && plan?.next !== nw) {
    const name = low(shownTitle(nw))
    out.push({ p: 6, text: `${LINES.news}${name}.`, pre: LINES.news, name, post: '.', stop: nw, sub: newsHint(nw) })
  }
  // 2 · haftalık E testi günü (düğmenin durağıysa yazılmaz: düğme "E testi · haftada bir" der)
  const weekly = (plan?.stops ?? []).find((s) => s.id === 'weekly' && !s.done) ?? null
  if (weekly && plan?.next !== weekly) out.push({ p: 2, text: LINES.weekly, sub: WEEKLY_SUB })
  // 7 · dün yol tamamdı
  if (yesterdayDone) out.push({ p: 7, text: LINES.yday })
  // 8 · iris haritası 1–3 gün sonra
  if (irisIn != null && irisIn >= 1 && irisIn <= 3) out.push({ p: 8, text: LINES.irisSoon(irisIn) })
  return out
}

// Bugünün cümlesi (sahibin kararı 2026-10-01): yol başlamamışken (hiç durak bitmemiş) ve sıradaki durak büyük düğmenin
// durağıyken. Süre yolun toplamı (lib/today.js minutesLeft; gün başında toplam); ad düğmenin adıyla aynı (goFace: "Sağ–sol
// bakış", "E testi"). Durağın kendi süresi yazılmaz (ölçüm durağında süre yok, S0 kararı 22). Yol yoksa, başladıysa ya da
// bittiyse null: Home.jsx bugünkü satırı yazar ("Bugünkü yol tamam.").
export function todayLead(plan = null, next = null) {
  if (!plan || !next || plan.allDone || (plan.doneCount ?? 0) > 0) return null
  const min = Math.round(plan.minutesLeft ?? 0)
  const name = goFace(next).title
  if (!(min > 0) || !name) return null
  return { p: 0, text: LINES.today(min, name) }
}

// İlk görünümde yazılmayan öncelikler (sahibin kararı 2026-10-01): 1. günün kırpma sayısı (ve "yargı değil" satırı), dünün
// yolu ve iris haritasının gelecekteki günü. Cümle bugüne dönük; dünün sayıları Gelişim'de kalır.
export const OFF_FIRST_VIEW = new Set([1, 7, 8])

// İlk tutan kazanır; dün yazılan öncelik (prev) bugün atlanır (0, 1 ve 2 hariç). Aday yoksa null (öncelik 9: Home.jsx).
export function pickLead(cands = [], prev = null) {
  return cands.find((c) => !(c.p >= 3 && c.p === prev)) ?? null
}

// Dün yolun bütün durakları bitti mi: dünün yolu dünün sonundaki kayıtlarla, gerçek yol koduyla yeniden kurulur
// (lib/today.js buildPath, lib/progression.js progressionCtx; ikisi de değişmez). Dün hiç kayıt yoksa hesaplanmaz.
// DİKKAT: modules/routine/manifest.js bugünün grup adlarını modül içinde tutar (kilit ekranının "Devam: …" satırı);
// bu işlev, bugünün yolu kurulmadan ÖNCE çağrılmalıdır (Home.jsx öyle çağırır), yoksa ad dünün adıyla kalır.
export function pathDoneOn({ modules = [], tests = [], sessions = [], now = new Date(), profile = null, premium = true } = {}) {
  const end = new Date(now)
  end.setDate(end.getDate() - 1)
  end.setHours(23, 59, 59, 0)
  const key = dayKey(end)
  const upTo = (list) => (list ?? []).filter((r) => {
    const t = time(r?.date)
    return t != null && t <= end.getTime()
  })
  const t = upTo(tests)
  const s = upTo(sessions)
  if (![...t, ...s].some((r) => dayKey(r.date) === key)) return false
  try {
    const progression = progressionCtx({ tests: t, sessions: s, now: end, modules })
    const plan = buildPath(modules, { tests: t, sessions: s, now: end, profile, eye: null, gate: { firstTestOnly: t.length === 0 && !premium }, later: null, progression })
    return plan.total > 0 && Boolean(plan.allDone)
  } catch {
    return false
  }
}
