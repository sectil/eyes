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
import { progressionCtx, updateDay } from '../../lib/progression.js'
import { SOFT_GAP } from '../../lib/ladders.js'
import { RECHECK_DAYS } from '../../lib/iris.js'
import { chapterOf } from '../../lib/pathAhead.js'

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
  // Sahibin kararı (tur 7): yolda süresi yazmayan haftalık E testi varken başlık bu (harfi harfine)
  todayWeekly: (min) => `Bugünkü yolun ${min}\u00a0dakika ve haftalık E testi.`,
}

// Kilometre taşı satırları (7., 28. ve 30. gün): ilk görünümde vurgulu satır (Home.jsx) ve Nef'in o sabah susması
// (nefTopLine mileShown) bu tek listeden okunur
export const MILE_LINES = new Set([LINES.week1, LINES.month1, LINES.iris])
// İlk görünümde gerçekten yazılan satır (cümle ya da alt satırı) o güne ait bir kilometre taşı mı
export const isMileLine = (line) => MILE_LINES.has(line)
// Nef'in o sabah susması (tur 3c, tur 4): ilk görünümde yazılan satırlardan biri o güne ait kilometre taşıysa ya da
// güncelleme gününün cümlesiyse (cümle 4; updLine Home.jsx'te NEF.update ile kurulur)
export const quietsNef = (lines = [], updLine = null) => lines.some((l) => isMileLine(l) || (updLine != null && l === updLine))

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
// Büyük düğmenin üstündeki satırda haftalık testin üç gözü (D9 tur 2: "3 bölüm" sözü aynı ekrandaki "1. bölüm"le, yani
// yolun 7 günlük bölümüyle karıştı). Yalnız ilk görünümdeki satır; durağın kendi satırı (WEEKLY_SUB) değişmez.
export const WEEKLY_EYES = 'Sağ göz, sol göz, iki göz'
export const heroLine = (stop) => (stop?.id === 'weekly' && stop.sub === WEEKLY_SUB ? WEEKLY_EYES : stopLine(stop))
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
// Bugünün ilk durağının ekrandaki adı: cümle ("ilk durağın X") ve büyük kartın büyük yazısı bunu okur (tek kaynak; tur 4
// notu: cümle "Isınma" derken kart yalnız adımları gösteriyordu). Ad düğmenin adıyla aynı (goFace: "Sağ–sol bakış",
// "E testi").
export function firstStop(next = null) {
  return { stop: next, name: next ? goFace(next).title : '' }
}

// İris ilk görünüme bu kadar geçmiş günden sonra gelir (sahibin kararı 2026-10-01: ilk 7 günde yok)
export const IRIS_FROM_DAY = 7

// Bugünün cümlesinin altındaki küçük satır: günün öteki cümlesi. "Bugün yeni: daire." tek başına belirsizdi (tur 4
// notu): yeni durakta adın yanında durağın onaylı tarifi de yazılır (newsHint; Daire'de EXERCISES.circleCw.sub).
export function leadSub(picked = null) {
  if (!picked?.text) return null
  return picked.p === 6 && picked.sub ? `${picked.text} ${picked.sub}` : picked.text
}

// Durağın yolda yazılan süresi (tur 6, tek kaynak): yolun molasında molanın gerçek süresi (lib/progression.js
// pathRestMinutes; "Mola · 5 dk"), ötekilerde durağın kendi süresi (s.minutes; oyunda 2 dk). Sahibin kararı (tur 6):
// ölçüm durakları (hideMinutes; S0 kararı 22, ör. haftalık E testi) süre yazmaz ve toplama girmez. Başlıktaki "Bugünkü
// yolun N dakika" süresi yazan durakların toplamıdır; duraklar toplanınca tutar.
export function stopMinutes(s, restMin = null) {
  if (!s || s.hideMinutes) return 0
  if (s.restSlot) return Number.isFinite(restMin) ? restMin : s.minutes ?? 0
  return Number.isFinite(s.minutes) ? s.minutes : 0
}
// Kalan durakların toplamı (bitenler hariç)
export const pathMinutes = (stops = [], restMin = null) => (stops ?? []).filter((s) => !s.done).reduce((a, s) => a + stopMinutes(s, restMin), 0)

export function todayLead(plan = null, next = null, minutes = null) {
  if (!plan || !next || plan.allDone || (plan.doneCount ?? 0) > 0) return null
  const min = Math.round(minutes ?? plan.minutesLeft ?? 0)
  const name = firstStop(next).name
  if (!(min > 0) || !name) return null
  // Tur 7: yolda bitmemiş haftalık E testi (ölçüm, süre yazmaz ve toplama girmez) varsa sahibin cümlesi. Başka ölçüm durağı
  // hideMinutes taşımıyor (yalnız haftalık E testi; yoganın bitmiş durağı toplamda zaten yok)
  if ((plan.stops ?? []).some((s) => s.id === 'weekly' && s.hideMinutes && !s.done)) return { p: 0, text: LINES.todayWeekly(min) }
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
export function pathDoneOn(args = {}) {
  const y = pathDayOn(args)
  return Boolean(y && y.total > 0 && y.allDone)
}
// Dünün yolu: { done: biten durak sayısı, total, allDone } ya da null (dün hiç kayıt yok). pathDoneOn'un notu geçerli.
export function pathDayOn({ modules = [], tests = [], sessions = [], now = new Date(), profile = null, premium = true } = {}) {
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
  if (![...t, ...s].some((r) => dayKey(r.date) === key)) return null
  try {
    const progression = progressionCtx({ tests: t, sessions: s, now: end, modules })
    // Tur 4: dün gerçekten bir yol günü mü. Eski kullanıcıda yol güncelleme günü başlar: dünün sonuna kadarki kayıtların
    // hiçbiri yolun stage alanını taşımıyorsa (lib/progression.js updateDay: uzun geçmiş, Dstage 0) dün yol yoktu; cümle 1
    // ve 2 seçilmez.
    // (dünün kayıtları da sayılsın diye bugünün başına göre kurulur)
    if (updateDay(progressionCtx({ tests: t, sessions: s, now, modules }))) return null
    const plan = buildPath(modules, { tests: t, sessions: s, now: end, profile, eye: null, gate: { firstTestOnly: t.length === 0 && !premium }, later: null, progression })
    return { done: plan.doneCount ?? plan.stops.filter((x) => x.done).length, total: plan.total ?? plan.stops.length, allDone: Boolean(plan.allDone) }
  } catch {
    return null
  }
}

// ---- Nef'in yoldaki cümleleri (D9 v2; SAHİP ONAYLI 2026-10-01, docs/yol-haritasi/tasarim/ana-sayfa/d9-karar/
// nef-cumleleri-onay.md; 14–16 ek cümleler). Harfi harfine; {…} kişinin verisiyle dolar. Bu listenin dışında yolda Nef
// cümlesi yok.
export const NEF = {
  // Yolun başı (bugünün duraklarının üstünde)
  yday: LINES.yday, // 1 ✓
  ydayPart: (n) => `Dün ${n} durak yaptın. Bugün yol yeniden başlıyor.`, // 2
  back: LINES.back, // 3 ✓
  update: (n, name) => `Yolun yenilendi: bugün ${n} yeni durak var, ilki ${name}.`, // 4
  // Bugünün sonu
  done: (next) => `Bugünkü yol tamam. Yarın ${next}. gün.`, // 5
  chapterLast: (prize) => `Bu bölümün son günü. Yolu bitirince ${prize}.`, // 6
  month: 'İlk ayın tamam: 30 gün.', // 7
  // Yarın
  tomorrow: (n, d) => `Yarın · ${n}. gün · ${d} durak`, // 8
  alarm: (hhmm) => `Yarın ${hhmm} alarm`, // 9
  remind: 'Hatırlatma kurmak ister misin?', // 10
  remindSub: 'Saatini ve günlerini sen seçersin.', // 10 alt satır
  // Bölüm kartları (yarından sonrası)
  chapter: (c, a, b) => `${c}. bölüm · ${a}–${b}. gün`, // 11
  news: (names) => `Yeni: ${names.join(', ')}`, // 12
  prize: (p) => `Sonunda: ${p}`, // 13
  // Ek cümleler (SAHİP ONAYLI 2026-10-01, aynı dosya 14–16)
  month30: 'Bugün 30. gün: yolu bitirince ilk ayın tamam.', // 14 (onaylı ama seçilmez: tur 3b, 30. gün sabahı Nef susar)
  chapterDay: (c, prize = null) => `${c}. bölümün son günü: yolu bitirince ${prize || 'bölüm tamam'}.`, // 15 (ödül yoksa "bölüm tamam")
  more: (n) => `ve ${n} durak daha`, // 16 (yarın kartında ilk 3 durağın altında; bölüm kartının "Yeni:" haplarında da aynı kalıp)
}
// Bölüm ödülleri (cümle 13'ün onaylı iki ödülü). Öteki bölümlerin ödülü onaylı sözle yazılmadı: kartta yalnız madalya.
export const CHAPTER_PRIZE = { 1: 'iris haritan açılır', 4: 'iris haritan başlangıçla yan yana gelir' }

// Yolun başındaki Nef cümlesi (1–4, 15), öncelikle: güncelleme günü, bölümün son günü (15), uzun aradan dönüş, dün yol
// bitti, dün yarım kaldı. 15 cümle 1–3'ün önüne geçer (sahibin kuralı). 30. gün sabahı hiç cümle yok (aşağıda). VARSAYIM:
// güncelleme günü (4) bir kez olur ve o günün tek haberi olduğu için 15'in de önünde kalır (sahibin kuralı yalnız 1–3'ü
// söyler). Bugünün yolu bittiyse yok ("dün" akşam bayat; akşamın cümlesi bugünün
// sonunda). skip: ilk görünümde yazılan cümle.
//   update: { n, name } (güncelleme gününün gerçekten yeni durakları); gap: son kayıttan bu yana gün; yday: pathDayOn;
//   n: yolun bugünkü günü; chapterEnd: bugün bölümün son günü; chapter: bölüm numarası; prize: bölümün onaylı ödülü
export function nefTopLine({ allDone = false, update = null, gap = null, yday = null, skip = null, n = 0, chapterEnd = false, chapter = 0, prize = null, mileShown = false } = {}) {
  // Sahibin kararı (tur 3b, "Nef kartı o gün susar"): 30. gün sabahı yolun başında Nef kartı yok; ilk görünüm zaten "Bugün
  // 30. gün: ilk ayını tamamlıyorsun." diyor. Cümle 14 (NEF.month30) seçilmez. Genelleştirilmiş hâli (tur 3c): ilk görünümde o
  // güne ait bir kilometre taşı satırı yazıldıysa (mileShown: Home.jsx, isMileLine ile) Nef o sabah susar; bölüm sonu (15)
  // de yazılmaz (7. gün: "Bugün 7. gün: ilk haftanı tamamlıyorsun.").
  if (allDone || n === 30 || mileShown) return null
  const out = []
  if (update?.n > 0 && update.name) out.push(NEF.update(update.n, update.name))
  if (chapterEnd && chapter > 0) out.push(NEF.chapterDay(chapter, prize))
  if (gap != null && gap >= 3 && gap < SOFT_GAP) out.push(NEF.back)
  if (yday?.allDone && yday.total > 0) out.push(NEF.yday)
  else if (yday?.done > 0) out.push(NEF.ydayPart(yday.done))
  return out.find((t) => t !== skip) ?? null
}
// Bugünün sonundaki Nef cümlesi (5–7): 30. gün yol bittiyse 7, yol bittiyse 5, bitmediyse ve bölümün son günüyse 6 (ödülü
// onaylıysa). top: yolun başındaki cümle; sabah 15 bölüm sonunu ve ödülü zaten söylediyse 6 yazılmaz (aynı haber iki kez)
// mileShown (tur 3c): ilk görünümde o güne ait kilometre taşı satırı varsa Nef o sabah hiç konuşmaz; yol bitmeden 6 da yok
// (ödül bölüm kartında "Sonunda: …" olarak durur). Yol bitince 5 ve 7 olağan.
export function nefEndLine({ n = 1, allDone = false, chapterEnd = false, prize = null, top = null, mileShown = false } = {}) {
  if (allDone) return n === 30 ? NEF.month : NEF.done(n + 1)
  if (mileShown) return null
  if (chapterEnd && prize && !(top && top === NEF.chapterDay(chapterOf(n), prize))) return NEF.chapterLast(prize)
  return null
}
