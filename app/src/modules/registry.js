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
//   coach?(sessions, now) → { anahtar: sayı | kısa dize }   Jev'e giden 7 günlük özet (en çok 6 alan;
//                                       lib/coachCore.js sanitizeSignals süzer). Yalnızca özet sayılar.
//   stats?(sessions, now) → [{ label, value, sub? }]   Gelişim → Pratikler satırları (en çok 3)
//   sessions?: {                        kayıtların Gelişim'e nasıl gireceği
//     match(s) → bool,
//     countsTowardGoal: bool,           false: haftalık hedef/seriye sayılmaz (oyun)
//     describe(s, { seconds }) → { title, detail, score?, best?, control? },
//     best?(sessions) → number,         rekor (0 = yok)
//     bestLabel?: 'Yılan rekoru',
//   }
// }

export const RINGS = ['eye', 'attention', 'life']
export const KINDS = ['measure', 'exercise', 'practice']
export const SECTIONS = ['measure', 'exercise', 'practice']

export function validateManifest(m) {
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
  if (m.retired != null) need(typeof m.retired === 'boolean', 'retired true/false olmalı')
  if (m.ask != null) {
    const list = (v) => v == null || (Array.isArray(v) && v.every((x) => typeof x === 'string'))
    need(typeof m.ask === 'object' && list(m.ask.before) && list(m.ask.after), 'ask.before/after dizi olmalı')
  }
  if (m.coach != null) need(typeof m.coach === 'function', 'coach fonksiyon olmalı')
  if (m.stats != null) need(typeof m.stats === 'function', 'stats fonksiyon olmalı')
  if (m.sessions != null) {
    need(typeof m.sessions.match === 'function', 'sessions.match fonksiyon olmalı')
    need(typeof m.sessions.describe === 'function', 'sessions.describe fonksiyon olmalı')
    need(typeof m.sessions.countsTowardGoal === 'boolean', 'sessions.countsTowardGoal true/false olmalı')
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
  for (const m of manifests) {
    const errs = validateManifest(m)
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
  }
  const order = (m) => m.home?.order ?? 999
  const live = list.filter((m) => !m.retired)
  return {
    modules: list,
    live, // emekli olmayanlar: listeler, yol, koç

    problems,
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
  }
}

const found = import.meta.glob('./*/manifest.js', { eager: true })
export const registry = createRegistry(Object.values(found).map((mod) => mod.default))
if (registry.problems.length && typeof console !== 'undefined') {
  console.warn('[modüller] geçersiz modül atlandı:', registry.problems)
}
