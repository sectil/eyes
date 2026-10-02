// Modül soketi. Her aktivite (ölçüm, egzersiz, pratik) bir modüldür: src/modules/<ad>/
//   manifest.js — saf veri ve fonksiyonlar (React yok). Uygulamanın geri kalanı modülü yalnızca
//                 bu sözleşme üzerinden tanır: yönlendirme, mola ve göz kalibrasyonu kapıları,
//                 Gelişim listesi, rekorlar, Ana sayfa kartı, "Tüm verileri sil".
//   view.jsx    — ekran ve simge (views.js toplar).
// Modül eklemek = klasör koymak; çıkarmak = klasörü silmek. Başka hiçbir dosya değişmez.
//
// Manifest sözleşmesi:
// {
//   id: 'snake',                        benzersiz; klasör adıyla aynı
//   routes?: ['snake'],                 bu modülün açtığı ekran adları (yoksa [id])
//   title: 'Yılan',                     kartta görünen ad
//   label: 'Yılan oyunu' | (route)=>…   cümle içindeki ad ("Sırada Yılan oyunu var")
//   ring: 'eye' | 'attention' | 'life', halka
//   kind: 'measure' | 'exercise' | 'practice',
//   gates?: { gaze?, eyeBudget? }       gaze: göz kalibrasyonu ister mi.
//                                       eyeBudget: 'eye' | 'test' — göz bütçesine sayılır ve mola
//                                       sırasında kilitlenir (lib/eyeBudget.js). 'eye' = oyun ve göz
//                                       hareketi egzersizi (günlük sınıra da sayılır, tur bitince kilit);
//                                       'test' = ölçüm (ortasında kesilmez). Yoksa kilitlenmez.
//   storageKeys?: [...]                 "Tüm verileri sil"de temizlenecek localStorage anahtarları
//   home?: { section: 'measure'|'exercise'|'practice', order: number }
//   ask?: { before?: [...], after?: [...] }  yerinde profil soruları (lib/profileQuestions.js kimlikleri):
//                                       before: ekrana girmeden önce, cevaplanmamışsa bir kez; after: ekranda
//                                       yeni test kaydedildiyse, çıkarken bir kez (App.jsx go)
//   retired?: true                      emekli: Bugün, Ana sayfa, Farkındalık, mola ekranı ve koçta görünmez;
//                                       eski kayıtları Gelişim'de okunmaya devam eder (ör. breath-count)
//   today?({ tests, sessions, now, profile? }) → null | durak | [durak, …]
//                                       Bugünün yolu durakları (lib/today.js buildPath dizer). Durak:
//                                       { title, minutes, done, route?, key?, sub?, slot?, order?, eyeMin?,
//                                         glyph?, openEnded?, exclusive?, dropRank? } — alanlar today.js'te
//   progression?: { match(s) → bool, ladder?, unlock?: { pathDay } }
//                                       İlerleme motoru (lib/progression.js; SONSUZ_YOL.PLAN.v1 §3.G.1): hangi kayıt
//                                       "yapıldı" sayılır (yoksa sessions.match), isteğe bağlı kendi merdiveni
//                                       (lib/ladders.js biçiminde) ve açılma eşiği. today(ctx) içinde ctx.progression
//                                       yoksa modül bugünkü çıktısını verir.
//   coach?(sessions, now) → { anahtar: sayı | kısa dize }   Nef'e giden 7 günlük özet (en çok 6 alan;
//                                       lib/coachCore.js sanitizeSignals süzer). Yalnızca özet sayılar.
//   stats?(sessions, now) → [{ label, value, sub? }]   Gelişim → Pratikler satırları (en çok 3)
//   progress: {                         ZORUNLU (Gelişim 2.0): bu modül kişinin takibine neyi katar. Her yeni modül
//                                       buradan Gelişim'e, istatistiğe, 5. gün raporuna ve Nef'e kendiliğinden bağlanır.
//     domain: 'eye'|'calm'|'self'|'awareness'|'focus'|'wellbeing'|'body',  sayıldığı alan (DOMAINS)
//     effects?: [{ key, label, measure, max, domain?, pick(s) → [önce, sonra] | null }]
//                                       oturum öncesi → sonrası puanı ("şu an nasıl hissediyorsun")
//     metrics?: [{ key, label, unit, better: 'up'|'down', domain?, meaningful?, source?, min?, max?,
//                  series({ tests, sessions }) → [{ date, value }] }]
//                                       zaman içindeki ölçüm. meaningful: yayımlanmış anlamlı değişim eşiği
//                                       (birim cinsinden); yoksa ilk yarı / son yarı istatistiğiyle bakılır.
//                                       max: ölçümün tanımlı en büyük değeri (modülün kendi mantığından; uydurma değil),
//                                       min: en küçüğü (yoksa 0). Nef ilerleme kartının çizgisi bu uçlarla; max yoksa
//                                       çizgi yok (lib/nef/card.js)
//   }
//   sessions?: {                        kayıtların Gelişim'e nasıl gireceği
//     match(s) → bool,
//     countsTowardGoal: bool,           false: haftalık hedef/seriye sayılmaz (oyun)
//     domainOf?(s) → alan,              isteğe bağlı: kaydın kendi alanı (ör. yoga: her ders kendi alanında; PLAN.v3
//                                       §D.5). Yoksa, DOMAINS dışında bir şey dönerse ya da hata verirse progress.domain.
//                                       Kaydın alanını yalnız lib/dataHub.js domainOfSession söyler (28 günlük şerit,
//                                       alan özetleri, CSV süre satırı).
//     describe(s, { seconds }) → { title, detail, score?, best?, control? },
//     best?(sessions) → number,         rekor (0 = yok)
//     bestLabel?: 'Yılan rekoru',
//   }
//   remind?: {                          "Bana hatırlat" ve Profil → Bildirimler (bildirim planı: docs/yol-haritasi/tasarim/
//                                       bildirim-hava-yuruyus/PLAN.v1.md §A.1). Yoksa modülde kart çıkmaz.
//     route?: string,                   dokununca açılacak ekran: routes'tan biri. Yoksa kartın gösterildiği ekran.
//     legacy?: 'mola'|'walk'|'breath'|'water',
//                                       hatırlatması bildirim deneyindeki mevcut tür (lib/reminders.js): ilk saat
//                                       settings.reminders.types[legacy]'de kalır; pencere 09.00–21.00 (su ≤ 18.00).
//     window?: 'move' | 'calm',         legacy yoksa: 'move' 09.00–21.00, 'calm' 08.00–22.00. Yoksa 'move'.
//     defaultTime?: 'HH:MM',            "Sen karar ver" için veri yokken saat; kendi penceresinde
//     maxTimes?: 1 | 2 | 3,             elle seçilebilecek en çok saat (varsayılan 3)
//     doneToday?(sessions, now) → bool  bugün yapıldıysa o günün kalan hatırlatması kurulmaz. Yoksa
//                                       progression.match ?? sessions.match tutan bugünkü kayıt.
//     science: ['sourceKey', …],        bilim kartı havuzu (lib/sources.js anahtarları, pmid ve doi taşır; en az 1)
//   }
//                                       remind'deki hata yalnız remind'i düşürür, modülü değil (remindProblems).
//   nef?: {                             Nef'e öğretim (Nef PLAN §4.8; lib/nef). Alanların hepsi isteğe bağlı; her canlı
//                                       modül için modules/nef.contract.test.js sınar.
//     name: { tr: { '': yalın, ABL?, ACC?, LOC?, DAT?, INS?, POSS?, 'POSS-ABL'? },
//             effects?: { effectKey: { tr: {…} } }, metrics?: { metricKey: { tr: {…} } } }
//                                       türlü ad ve çekimleri, dile göre ("Yılan oyunu", "Yılan oyununda"); yalnız sahip
//                                       onaylı ad. Biçimler lib/nef/bank/tr.grammar.js nounForms ile tutarlı. effects /
//                                       metrics: o etkinin ya da ölçümün anında kullanılan ad (yoga: "Nefesin Ritmi yoga
//                                       dersi"; Yön'ün Ayna puanı: "Yön alıştırması")
//     records?: { store: 'tests' | 'habits', match(kayıt) → bool }
//                                       kaydı sessions'ta olmayan modülün kayıt tanıyıcısı (lib/habitLog.js ya da tests
//                                       deposu): ilk kayıt ve uzun ara anları buradan. sessions.match / progression.match
//                                       olan modülde gerekmez.
//     metricWords?: { tr: { metricKey: { word, unit, percent? } } }
//                                       progress.metrics ölçümünün cümledeki sözcüğü ve birimi ("kavradığın harf sayısı", "harf")
//     moments?: ['recallEffect' | 'effectPattern' | 'metricChange' | 'firstTime' | 'returnAfterGap', …]
//                                       modülün kendiliğinden üretebileceği genel an türleri (lib/nef/moments.js MODULE_MOMENTS)
//     cells?: ['FTB-8', …]              bu modüle özel onaylı cümle kimlikleri (lib/nef/bank/tr.js, only: { metric })
//     play?: true                       oyun: ilerleme kartının (metricChange) düğmesi "Bugünkü turu oyna · {dk} dk"
//                                       (lib/nef/card.js). Oyun değilse ilerleme kartında düğme yok.
//     start?(ctx) → { route, minutes, name?: { tr } } | null
//                                       Nef kartı düğmesi (puan kartı): dokununca açılan rota, açılışta seçili gelen süre
//                                       (dk) ve düğmedeki ad (yoksa nef.name; yoga dersinde dersin adı). ctx: { tests,
//                                       sessions, now, profile, facts (anın olguları), storage? }. Yoksa düğmenin süresi ve
//                                       rotası modülün today() durağından; süre yoksa düğme yok (lib/nef/card.js).
//     evidence?: ['sourceKey', …]       kanıt havuzu (lib/sources.js anahtarları, pmid ve doi taşır)
//     note?: 'tek satır'                modülün kendini Nef'e tanıttığı satır (mektup istemi, N2)
//   }
// }

import { SOURCES } from '../lib/sources.js'
import { NUDGE_TYPES, toMinutes } from '../lib/reminders.js'
import { isSameDay } from '../lib/today.js'
import { REMIND_WINDOWS, LEGACY_WINDOW, WATER_LAST } from '../lib/moduleRemind.js'

export const RINGS = ['eye', 'attention', 'life']
export const KINDS = ['measure', 'exercise', 'practice']
export const SECTIONS = ['measure', 'exercise', 'practice']
export const DOMAINS = ['eye', 'calm', 'self', 'awareness', 'focus', 'wellbeing', 'body']
const KEY_RE = /^[a-z][a-z0-9-]*$/
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k)
// "Bana hatırlat" (PLAN.v1 §A.1, §A.4): legacy türler kendi penceresinde (lib/moduleRemind.js LEGACY_WINDOW, su WATER_LAST);
// yeni kaynaklarda 'move' (kalk, göz hareketi, oyun) ve 'calm' (nefes dışı sakin pratikler). Uçlar dâhil. Pencere yalnız
// Nef'in kendi seçtiği saatlere (öneri, defaultTime) uygulanır; kişinin elle seçtiği saate değil (sahip kararı 2026-10-01).
export const REMIND_LEGACY = [...NUDGE_TYPES]
// Pencereler tek kaynaktan (lib/moduleRemind.js; planlayıcı da onu kullanır)
export { REMIND_WINDOWS }
// Modülün kendi ekranları dışında route olarak kabul edilen uygulama ekranları: PLAN.v1 §A.1 tablosu routine için
// "route `routine-…` yerine yol (`home`) açılır" diyor. VARSAYIM: bu turda yalnız 'home'.
export const REMIND_APP_ROUTES = ['home']
export const REMIND_MAX_TIMES = 3

// remind → { from, to } ('HH:MM'). Legacy türün penceresi LEGACY_WINDOW.
export function remindWindow(r) {
  if (r?.legacy) return { from: LEGACY_WINDOW.from, to: r.legacy === 'water' ? WATER_LAST : LEGACY_WINDOW.to }
  return REMIND_WINDOWS[r?.window ?? 'move'] ?? null
}

// remind doğrulaması. Hatalar ayrı döner: createRegistry bunlarla modülü değil yalnız remind'i düşürür.
export function validateRemind(m, sources = SOURCES) {
  const errors = []
  if (!m || typeof m !== 'object' || m.remind == null) return errors
  const need = (ok, msg) => ok || errors.push(`${m.id ?? '?'}: remind: ${msg}`)
  const r = m.remind
  need(typeof r === 'object' && !Array.isArray(r), 'nesne olmalı')
  if (typeof r !== 'object' || Array.isArray(r)) return errors
  const routes = Array.isArray(m.routes) ? m.routes : [m.id]
  if (r.route != null) {
    const ok = typeof r.route === 'string' && (routes.includes(r.route) || REMIND_APP_ROUTES.includes(r.route))
    need(ok, `route modülün ekranlarından biri olmalı: ${[...routes, ...REMIND_APP_ROUTES].join(', ')}`)
  }
  if (r.legacy != null) need(REMIND_LEGACY.includes(r.legacy), `legacy şunlardan biri olmalı: ${REMIND_LEGACY.join(', ')}`)
  if (r.window != null) {
    need(own(REMIND_WINDOWS, r.window), "window 'move' ya da 'calm' olmalı")
    // VARSAYIM: plan window'u "legacy yoksa" diye tanımlıyor; ikisi birlikte yazılırsa hangisinin geçerli olduğu
    // belirsiz kalmasın diye reddedilir (legacy türün penceresi lib/moduleRemind.js LEGACY_WINDOW).
    need(r.legacy == null, 'legacy türde window yazılmaz (pencere deneyinkidir)')
  }
  if (r.defaultTime != null) {
    const t = toMinutes(r.defaultTime)
    const w = remindWindow(r)
    need(t != null && w != null && t >= toMinutes(w.from) && t <= toMinutes(w.to), `defaultTime 'HH:MM' ve penceresinde olmalı (${w ? `${w.from}–${w.to}` : '?'})`)
  }
  if (r.maxTimes != null) need([1, 2, 3].includes(r.maxTimes), `maxTimes 1, 2 ya da ${REMIND_MAX_TIMES} olmalı`)
  if (r.doneToday != null) need(typeof r.doneToday === 'function', 'doneToday fonksiyon olmalı')
  need(Array.isArray(r.science) && r.science.length > 0, 'science en az bir kaynak anahtarı olmalı (lib/sources.js)')
  for (const key of Array.isArray(r.science) ? r.science : []) {
    const src = typeof key === 'string' && own(sources, key) ? sources[key] : null
    need(Boolean(src?.pmid && src?.doi), `science: '${key}' lib/sources.js'te pmid ve doi ile yok`)
    // Koşullu kaynak (sources.js `only`: 'meditation' | 'moon') bildirim bilim kartı havuzuna girmez. VARSAYIM: bu turda
    // hiçbir modül "meditasyon içeriği" sayılmıyor (yoga dâhil; kaynak-dogrulama.md radin2025 satırı), ay kaynakları
    // yalnız hava sayfasının "ay evresi" satırı içindir. Meditasyon modülü gelince izin manifestte açılır (sonraki iş).
    if (src?.only != null) need(false, `science: '${key}' koşullu kaynak (yalnız ${src.only}); remind havuzunda kullanılmaz`)
  }
  return errors
}

// Geçerli remind → reminders() kaydı (varsayılanlar dolu). doneToday yoksa: progression.match ?? sessions.match tutan
// bugünkü kayıt. VARSAYIM: ikisi de yoksa hiçbir gün "yapıldı" sayılmaz.
function remindEntry(m) {
  const r = m.remind
  const match = m.progression?.match ?? m.sessions?.match ?? null
  const doneToday = r.doneToday ?? ((sessions, now = new Date()) => Boolean(match) && (sessions ?? []).some((s) => match(s) && isSameDay(s, now)))
  const w = remindWindow(r)
  return {
    module: m.id,
    route: r.route ?? null,
    legacy: r.legacy ?? null,
    window: r.legacy ? null : r.window ?? 'move',
    from: w.from,
    to: w.to,
    defaultTime: r.defaultTime ?? null,
    maxTimes: r.maxTimes ?? REMIND_MAX_TIMES,
    doneToday,
    science: [...r.science],
  }
}

function validateProgress(p, need) {
  need(p && typeof p === 'object', 'progress yok (her modül Gelişim\'e ne kattığını söylemeli)')
  if (!p || typeof p !== 'object') return
  need(DOMAINS.includes(p.domain), `progress.domain şunlardan biri olmalı: ${DOMAINS.join(', ')}`)
  if (p.effects != null) {
    need(Array.isArray(p.effects), 'progress.effects dizi olmalı')
    for (const e of p.effects ?? []) {
      need(KEY_RE.test(e?.key ?? '') && typeof e.label === 'string' && typeof e.measure === 'string', 'effect key/label/measure eksik')
      need(Number.isFinite(e?.max) && e.max > 0, `effect ${e?.key}: max sayı olmalı`)
      need(typeof e?.pick === 'function', `effect ${e?.key}: pick fonksiyon olmalı`)
      if (e?.domain != null) need(DOMAINS.includes(e.domain), `effect ${e.key}: domain geçersiz`)
    }
  }
  if (p.metrics != null) {
    need(Array.isArray(p.metrics), 'progress.metrics dizi olmalı')
    for (const x of p.metrics ?? []) {
      need(KEY_RE.test(x?.key ?? '') && typeof x.label === 'string' && typeof x.unit === 'string', 'metric key/label/unit eksik')
      need(x?.better === 'up' || x?.better === 'down', `metric ${x?.key}: better 'up' ya da 'down' olmalı`)
      need(typeof x?.series === 'function', `metric ${x?.key}: series fonksiyon olmalı`)
      if (x?.meaningful != null) need(Number.isFinite(x.meaningful) && x.meaningful > 0, `metric ${x.key}: meaningful pozitif sayı olmalı`)
      if (x?.min != null) need(Number.isFinite(x.min), `metric ${x.key}: min sayı olmalı`)
      if (x?.max != null) need(Number.isFinite(x.max) && x.max > (Number.isFinite(x.min) ? x.min : 0), `metric ${x.key}: max min'den büyük sayı olmalı`)
      if (x?.domain != null) need(DOMAINS.includes(x.domain), `metric ${x.key}: domain geçersiz`)
    }
  }
}

// Tam doğrulama: temel kurallar ve remind. createRegistry ikisini ayrı kullanır (remind hatası modülü düşürmez).
export function validateManifest(m) {
  return [...validateBase(m), ...validateRemind(m)]
}

function validateBase(m) {
  const errors = []
  const need = (ok, msg) => ok || errors.push(`${m?.id ?? '?'}: ${msg}`)
  need(m && typeof m === 'object', 'manifest nesne değil')
  if (!m || typeof m !== 'object') return errors
  need(typeof m.id === 'string' && /^[a-z][a-z0-9-]*$/.test(m.id), 'id küçük harf ve tire olmalı')
  need(typeof m.title === 'string' && m.title.length > 0, 'title yok')
  need(typeof m.label === 'string' || typeof m.label === 'function', 'label yok')
  need(RINGS.includes(m.ring), `ring şunlardan biri olmalı: ${RINGS.join(', ')}`)
  need(KINDS.includes(m.kind), `kind şunlardan biri olmalı: ${KINDS.join(', ')}`)
  if (m.routes != null) need(Array.isArray(m.routes) && m.routes.length > 0 && m.routes.every((r) => typeof r === 'string'), 'routes dizi olmalı')
  if (m.storageKeys != null) need(Array.isArray(m.storageKeys), 'storageKeys dizi olmalı')
  if (m.home != null) need(SECTIONS.includes(m.home.section) && Number.isFinite(m.home.order), 'home.section/order geçersiz')
  if (m.gates?.eyeBudget != null) need(m.gates.eyeBudget === 'eye' || m.gates.eyeBudget === 'test', "gates.eyeBudget 'eye' ya da 'test' olmalı")
  if (m.today != null) need(typeof m.today === 'function', 'today fonksiyon olmalı')
  if (m.progression != null) need(typeof m.progression === 'object' && typeof m.progression.match === 'function', 'progression.match fonksiyon olmalı')
  if (m.retired != null) need(typeof m.retired === 'boolean', 'retired true/false olmalı')
  if (m.ask != null) {
    const list = (v) => v == null || (Array.isArray(v) && v.every((x) => typeof x === 'string'))
    need(typeof m.ask === 'object' && list(m.ask.before) && list(m.ask.after), 'ask.before/after dizi olmalı')
  }
  validateProgress(m.progress, need)
  if (m.coach != null) need(typeof m.coach === 'function', 'coach fonksiyon olmalı')
  if (m.stats != null) need(typeof m.stats === 'function', 'stats fonksiyon olmalı')
  if (m.sessions != null) {
    need(typeof m.sessions.match === 'function', 'sessions.match fonksiyon olmalı')
    need(typeof m.sessions.describe === 'function', 'sessions.describe fonksiyon olmalı')
    need(typeof m.sessions.countsTowardGoal === 'boolean', 'sessions.countsTowardGoal true/false olmalı')
    if (m.sessions.domainOf != null) need(typeof m.sessions.domainOf === 'function', 'sessions.domainOf fonksiyon olmalı')
    if (m.sessions.best != null) need(typeof m.sessions.best === 'function' && typeof m.sessions.bestLabel === 'string', 'best için bestLabel gerekli')
  }
  return errors
}

// Manifest listesinden kayıt defteri kurar (testler kendi listesini verebilir).
export function createRegistry(manifests) {
  const list = []
  const seenIds = new Set()
  const byRoute = new Map()
  const problems = []
  const remindProblems = []
  const remindOk = new Set()
  for (const m of manifests) {
    const errs = validateBase(m)
    if (!errs.length && seenIds.has(m.id)) errs.push(`${m.id}: aynı id iki kez`)
    const routes = m?.routes ?? [m?.id]
    for (const r of routes) if (!errs.length && byRoute.has(r)) errs.push(`${m.id}: '${r}' ekranı başka modülde de var`)
    if (errs.length) {
      problems.push(...errs)
      continue
    }
    seenIds.add(m.id)
    list.push(m)
    for (const r of routes) byRoute.set(r, m)
    // remind'deki hata yalnız remind'i düşürür: modül listede kalır, reminders()'da görünmez
    const remindErrs = validateRemind(m)
    if (remindErrs.length) remindProblems.push(...remindErrs)
    else if (m.remind != null) remindOk.add(m.id)
  }
  const order = (m) => m.home?.order ?? 999
  const live = list.filter((m) => !m.retired)
  return {
    modules: list,
    live, // emekli olmayanlar: listeler, yol, koç

    problems,
    remindProblems,
    get: (id) => list.find((m) => m.id === id) ?? null,
    forRoute: (route) => byRoute.get(route) ?? null,
    forSession: (s) => (s ? list.find((m) => m.sessions?.match(s)) ?? null : null),
    inSection: (section) => live.filter((m) => m.home?.section === section).sort((a, b) => order(a) - order(b)),
    labelFor(route) {
      const m = byRoute.get(route)
      if (!m) return ''
      return typeof m.label === 'function' ? m.label(route) : m.label
    },
    resetKeys: () => [...new Set(list.flatMap((m) => m.storageKeys ?? []))],
    // Gelişim 2.0: tüm modüllerin (emekliler dahil: eski kayıtlar okunur) önce→sonra etkileri ve metrikleri
    effects: () => list.flatMap((m) => (m.progress.effects ?? []).map((e) => ({ ...e, module: m.id, domain: e.domain ?? m.progress.domain }))),
    metrics: () => list.flatMap((m) => (m.progress.metrics ?? []).map((x) => ({ ...x, module: m.id, domain: x.domain ?? m.progress.domain }))),
    // "Bana hatırlat": geçerli remind'i olan canlı modüller, kayıt sırasıyla (PLAN.v1 §A.1). VARSAYIM: emekli modül
    // hatırlatılmaz (Bugün ve Ana sayfada da görünmez).
    reminders: () => live.filter((m) => remindOk.has(m.id)).map(remindEntry),
  }
}

const found = import.meta.glob('./*/manifest.js', { eager: true })
export const registry = createRegistry(Object.values(found).map((mod) => mod.default))
if (registry.problems.length && typeof console !== 'undefined') {
  console.warn('[modüller] geçersiz modül atlandı:', registry.problems)
}
