// Gelişim merkezi eşdeğerlik düzeneğinin karşılaştırma araçları (gelisim-merkezi/PLAN.v1.md §8.4). Yalnız testler kullanır;
// test dosyası src/lib/growth.equiv.test.js. Taban: test/fixtures/gelisim-taban (G1'den önceki kod, dondurulmuş).
//
// Fark kuralı: tabandaki her alan yeni çıktıda aynı değerle bulunmalı (iç içe, dizilerde sıra ve uzunluk dâhil). Yeni
// çıktıya EKLENEN alan (ör. verdict, mixed, value) fark sayılmaz; değişen ya da kaybolan alan sayılır. Her fark bir
// gruba düşer (GROUPS). growthMap'in days, strip, sinceStart, frac alanları 'core'dur ve hiçbir zaman izinli olamaz;
// tek istisna Beden'in Apple Sağlık günleri (Ö-9): yeni şerit eskisini kapsar ve fazladan her gün adımı olan bir
// gündür ('health').
import * as cur from '../src/lib/dataHub.js'
import * as curExport from '../src/lib/exportData.js'
import * as base from './fixtures/gelisim-taban/dataHub.js'
import * as baseExport from './fixtures/gelisim-taban/exportData.js'
import { dayKey } from '../src/lib/calendar.js'
import { keyDay } from '../src/lib/habitLog.js'

const DAY = 86400000

// Fark grupları ve dayandıkları bulgu (DENETIM.md). allowable: PLAN §8.4'e göre G1'de ALLOWED'a girebilir mi.
export const GROUPS = {
  core: { allowable: false, what: 'growthMap days/strip/frac/sinceStart/from/canCompare/window, alan adı, hasData, alışkanlık ve cevap özetleri' },
  metrics: { allowable: false, what: 'hub metrikleri (status ve metricTrend yerinde kalır, PLAN §8.1; verdict yeni alan olarak eklenir)' },
  verdict: { allowable: true, what: 'alan hükmü growthMap status ve WHO-5 kartı (K1–K4, Ö-1)' },
  effects: { allowable: true, what: 'önce → sonra etkileri, son 28 gün ve ≥ 3 oturum (Ö-3)' },
  records: { allowable: true, what: 'kayıt sayıları ve kaynak satırı gün sayar (Ö-5, Kü-1)' },
  health: { allowable: true, what: 'Apple Sağlık adım günü Beden days/strip/frac\'a girer (Ö-9)' },
  eye: { allowable: true, what: 'göz kartı (eyeCard) ve PDF modelinin göz serisi/mesajı (eyes[i].trend, message); trend.js seri seçimi (Ö-11, PLAN §13). §8.4 listesinde adı yok: açılırsa raporda yazılır' },
  export: { allowable: true, what: 'CSV\'ye EKLENEN alışkanlık ve adımlı gün satırları (Ö-7, Ö-9), PDF modelinin etkileri (son 28 gün, Ö-3) ve yeni alanları, PDF metni (v2 hükmü, yönlü etki, pencere adları: K1–K4, Ö-8, Kü-5, Kü-6)' },
  exportBase: { allowable: false, what: 'CSV\'nin tabandaki satırları (eklenenler çıkarılınca birebir aynı, sıra dâhil) ve PDF modelinin etkiler dışındaki alanları' },
}

// G1'de CSV'ye eklenen satırlar (lib/exportData.js csvRows; Ö-7 alışkanlık, Ö-9 adımlı gün): ölçüm adıyla tanınır
export const ADDED_CSV_MEASURES = new Set([...Object.values(curExport.HABIT_MEASURE), curExport.STEP_DAY_MEASURE])

// ---------- karşılaştırma ----------
// Tabanın (a) her yaprağı yenide (b) aynı mı? Yolu segment dizisi olarak döner. Yeni alan (b'de fazladan anahtar) sayılmaz.
export function diffPaths(a, b, path = [], out = []) {
  if (Object.is(a, b)) return out
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    if (Array.isArray(a) !== Array.isArray(b)) return out.push(path), out
    if (Array.isArray(a)) {
      if (a.length !== b.length) return out.push([...path, 'length']), out
      for (let i = 0; i < a.length; i++) diffPaths(a[i], b[i], [...path, i], out)
      return out
    }
    for (const k of Object.keys(a)) {
      if (!Object.prototype.hasOwnProperty.call(b, k)) out.push([...path, k])
      else diffPaths(a[k], b[k], [...path, k], out)
    }
    return out
  }
  out.push(path)
  return out
}

// hub alanının (growthMap domains[d].summary) yolu → grup
function hubGroup(rest) {
  const k = rest[0]
  if (k === 'records') return 'records'
  if (k === 'metrics') return 'metrics'
  if (k === 'effects') return 'effects'
  if (k === 'who5') return 'verdict'
  if (k === 'eye') return 'eye'
  return 'core' // domain, label, answers, habits, hasData
}

// growthMap yolu → grup. p: ['domains', d, alan, …] ya da ['sinceStart'] gibi
function mapGroup(p) {
  if (p[0] !== 'domains') return 'core'
  const field = p[2]
  if (field === 'status') return 'verdict'
  if (field === 'sources') return 'records'
  if (field === 'summary') return p.length > 3 ? hubGroup(p.slice(3)) : 'core'
  return 'core' // domain, label, days, frac, strip
}

// Apple Sağlık'ta sayılması GEREKEN adımlı günler, koddan bağımsız hesap (PLAN §3.4 ve §13): tarihi okunan, adımı > 0
// satırlar; bunlardan 7'den azsa hiç gün yok; değilse adımı bu satırların ortancasına ulaşan (≥) günler
export function expectedStepDays(health) {
  const rows = (Array.isArray(health?.stepRows) ? health.stepRows : []).filter((r) => r && typeof r.date === 'string' && Number.isFinite(keyDay(r.date)) && Number.isFinite(r.steps) && r.steps > 0)
  if (rows.length < 7) return new Set()
  const v = rows.map((r) => r.steps).sort((a, b) => a - b)
  const h = v.length >> 1
  const median = v.length % 2 ? v[h] : (v[h - 1] + v[h]) / 2
  return new Set(rows.filter((r) => r.steps >= median).map((r) => r.date))
}

// Beden şeridindeki fark yalnız Apple Sağlık adım günlerinden mi (Ö-9)? Yeni şerit eskisini kapsar, fazladan her gün
// kişinin kendi ortancasına ulaşan bir adımlı gündür (expectedStepDays; yalnız "adımı > 0" yetmez); days ve frac
// şeritle tutarlı.
export function healthOnly(oldDom, newDom, from, health) {
  const steps = expectedStepDays(health)
  const a = oldDom?.strip
  const b = newDom?.strip
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false
  const t0 = new Date(from).getTime()
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) continue
    if (a[i] && !b[i]) return false
    if (!steps.has(dayKey(new Date(t0 + i * DAY + DAY / 2)))) return false
  }
  const days = b.filter(Boolean).length
  return newDom.days === days && newDom.frac === days / a.length
}

// Bir depoda bütün çıktıların farkı: [{ group, where, path, was, is }]; diffs.recent: tabanın son 28 gün haritası
export function compareStore(store, { exports = true, impl = { cur, curExport }, ref = { base, baseExport } } = {}) {
  const input = { tests: store.tests, sessions: store.sessions, profile: store.profile, habits: store.habits, health: store.health, now: store.now }
  const diffs = []
  const at = (obj, p) => p.reduce((o, k) => (o == null ? o : o[k]), obj)
  for (const window of ['recent', 'first']) {
    const was = ref.base.growthMap({ ...input, window })
    const is = impl.cur.growthMap({ ...input, window })
    if (window === 'recent') Object.defineProperty(diffs, 'recent', { value: was })
    const healthBody = healthOnly(was.domains?.body, is.domains?.body, is.from, store.health)
    for (const p of diffPaths(was, is)) {
      let group = mapGroup(p)
      if (group === 'core' && healthBody && p[0] === 'domains' && p[1] === 'body' && ['days', 'frac', 'strip'].includes(p[2])) group = 'health'
      diffs.push({ group, where: `growthMap(${window})`, path: p.join('.'), was: at(was, p), is: at(is, p) })
    }
  }
  if (!exports) return diffs
  // CSV: eklenen satırlar 'export' (izinli); onlar çıkarılınca kalan satırlar tabanla birebir aynı olmalı ('exportBase')
  const csv0 = ref.baseExport.csvRows(input)
  const csv1 = impl.curExport.csvRows(input)
  const kept = csv1.filter((r) => !ADDED_CSV_MEASURES.has(r?.measure))
  for (const p of diffPaths(csv0, kept)) diffs.push({ group: 'exportBase', where: 'csvRows', path: p.join('.'), was: at(csv0, p), is: at(kept, p) })
  for (const r of csv1) if (ADDED_CSV_MEASURES.has(r?.measure)) diffs.push({ group: 'export', where: 'csvRows', path: `+${r.date}|${r.measure}`, was: undefined, is: r })
  // PDF modeli: etkiler (son 28 gün, Ö-3) 'export'; öbür alanlar tabanla aynı olmalı ('exportBase'); yeni alan fark değil
  const m0 = ref.baseExport.reportModel(input)
  const m1 = impl.curExport.reportModel(input)
  // Gözün serisi ve mesajı (eyes[i].trend, eyes[i].message) trend.js seri seçiminden gelir: 'eye' (Ö-11, PLAN §13)
  const modelGroup = (p) => (p[0] === 'effects' ? 'export' : p[0] === 'eyes' && (p[2] === 'trend' || p[2] === 'message') ? 'eye' : 'exportBase')
  for (const p of diffPaths(m0, m1)) diffs.push({ group: modelGroup(p), where: 'reportModel', path: p.join('.'), was: at(m0, p), is: at(m1, p) })
  const h0 = ref.baseExport.reportHtml(m0)
  const h1 = impl.curExport.reportHtml(m1)
  for (const d of htmlDiffs(h0, h1)) diffs.push({ where: 'reportHtml', ...d })
  return diffs
}

// ---------- PDF metni bölüm bölüm ----------
// PDF metni <section> başlığına göre bölünür; her bölümün izinli farkı ayrı tanımlıdır. İzinli fark çıkarılınca (aşağıdaki
// normalleştirme) kalan her fark 'exportBase'tir (izin verilemez). İzinli olanlar:
//  - Yakın görme: durum hapında Gelişim'in sözcüğü ("iyileşme" → "başlangıcından iyi", "doğrulanmış değişim yok" →
//    "değişim yok"); başka her fark gözün seri seçiminden olabilir ('eye', yalnız Ö-11 ya da bozuk göz kaydı olan depoda).
//  - Düzen: pencere adları (Kü-5) ve alan başına gün paragrafı (plan §3.5 m. 5) 'export'; sayılar tabanla aynı.
//  - İyi oluş · WHO-5: yalnız değişimin yanındaki hüküm sözcüğü (parantez) 'export'; puan, fark, ölçüm sayısı aynı.
//  - Diğer ölçümler: değer ve değerlendirme sütunları, sütun başlığı ve dipnot (v2 hükmü: K1–K4, Kü-6) 'export'; satırların
//    ölçüm adı, alanı ve n'i tabanla aynı ('exportBase').
//  - Uygulama öncesi → sonrası: etkiler son 28 gün (Ö-3), yönlü etki metni (Ö-8) 'export'.
//  - Baş kısım (ad, yaş, kayıt aralığı, not), Uyarı kuralı, Yöntem ve sınırlar: birebir aynı.
export function splitSections(html) {
  const parts = String(html).split('<section')
  const out = new Map([['(baş)', parts[0].trimEnd()]])
  for (const p of parts.slice(1)) {
    const title = (p.match(/<h2>([^<·]*)/)?.[1] ?? '?').trim()
    // bölümler arasındaki boşluk satırları sayılmaz (boş bir bölüm, ör. etkisi olmayan depoda öncesi → sonrası, yalnız
    // satır sonu bırakır)
    out.set(title, `<section${p}`.trimEnd())
  }
  return out
}
const EYE_WORD = [['>iyileşme</span>', '>başlangıcından iyi</span>'], ['>doğrulanmış değişim yok</span>', '>değişim yok</span>']]
const SECTION_RULES = {
  'Yakın görme': { norm0: (x) => EYE_WORD.reduce((t, [a, b]) => t.split(a).join(b), x), rest: 'eye' },
  'Düzen': { norm1: (x) => x.split(' · ilk kayıttan beri</span>').join('</span>').replace(/\n<p class="small">Alan başına [^\n]*<\/p>/, ''), changed: 'export' },
  'İyi oluş': { norm: (x) => x.replace(/(ilk ölçümden bu yana [−+]?\d+)(?: \([^)]*\))?/, '$1'), changed: 'export' },
  'Diğer ölçümler': { norm: (x) => [...x.matchAll(/<tr><td>([^<]*)<\/td><td>([^<]*)<\/td><td class="n">(\d+)<\/td>/g)].map((m) => m.slice(1, 4).join('|')).join('\n'), changed: 'export' },
  'Uygulama öncesi → sonrası (kişinin kendi puanı)': { norm: () => '', changed: 'export' },
}
export function htmlDiffs(h0, h1) {
  const a = splitSections(h0)
  const b = splitSections(h1)
  const out = []
  for (const title of new Set([...a.keys(), ...b.keys()])) {
    const x = a.get(title) ?? ''
    const y = b.get(title) ?? ''
    if (x === y) continue
    const key = Object.keys(SECTION_RULES).find((k) => title.startsWith(k))
    const r = SECTION_RULES[key] ?? {}
    const id = (t) => t
    const n0 = (r.norm0 ?? r.norm ?? id)(x)
    const n1 = (r.norm1 ?? r.norm ?? id)(y)
    const path = `(bölüm) ${title}`
    if (n0 === n1) out.push({ group: r.changed ?? 'export', path, was: x.slice(0, 200), is: y.slice(0, 200) })
    else out.push({ group: r.rest ?? 'exportBase', path, was: n0.slice(0, 300), is: n1.slice(0, 300) })
  }
  return out
}

// Depo girdisi dondurulur: kod girdiyi değiştirirse (ör. yerinde sıralama) test hata verir
export function deepFreeze(x) {
  if (x && typeof x === 'object' && !Object.isFrozen(x)) {
    Object.freeze(x)
    for (const v of Object.values(x)) deepFreeze(v)
  }
  return x
}
