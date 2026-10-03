// Bugünün yolunda Yoga (PLAN.v3 §B.2, §B.5 test listesi; yol.md §5.6). Yol bugünkü canlı manifestlerle kurulur;
// yoga durağı lib/yoga.js yogaPathStop ile (modules/yoga/manifest.js'teki today() sözleşmesinin aynısı; manifest
// iPhone'da çağırır, test ortamında isIOSApp yanlış olduğu için burada doğrudan kullanılır). ctx.progression yok.
// Kalıcı eşdeğerlik: aynı bağlamda yogalı yolun yoga dışındaki durakları yogasız yolla birebir aynıdır.
import { describe, it, expect, vi } from 'vitest'
import { buildPath, canOpen, PATH } from './today.js'
import { yogaPathStop } from './yoga.js'
import { registry } from '../modules/registry.js'
import { dayKey } from './calendar.js'

// Test ortamı web'dir (isIOSApp yanlış); yalnız gerçek manifestle kurulan son blok iPhone'u taklit eder
const ios = vi.hoisted(() => ({ on: false }))
vi.mock('./native.js', async (orig) => ({ ...(await orig()), isIOSApp: () => ios.on }))

const MIN = 60000
// gerçek yoga manifesti web'de zaten null döndürür. Yakala Yaz bu ilerlemesiz benzetimde yok (eski senaryolar değişmesin;
// ilerlemeli yoldaki yeri today.test.js Yakala Yaz benzetiminde)
const LIVE = registry.live.filter((m) => m.id !== 'yoga' && m.id !== 'yakala-yaz')
const REAL_YOGA = registry.live.find((m) => m.id === 'yoga') ?? null
const TITLES = { 1: 'Nefesin Ritmi', 2: 'Derin Dinlenme', 3: 'Uykuya Geçiş', 4: 'Zor Anlar İçin', 5: 'Tek Nokta', 6: 'Sabah Niyeti', 7: 'Kendine Şefkat', 8: 'Sağlam Yer', 9: 'Kendini Tanımak', 10: 'Gelecekteki Sen' }
// lib/yogaLessons.js biçiminde taklit: LESSONS (başlık) ve publishedMinutes(id)
const data = (pub) => ({
  LESSONS: Object.fromEntries(Object.entries(TITLES).map(([k, title]) => [k, { title }])),
  publishedMinutes: (id) => pub[id] ?? [],
})
const ALL = data({ 1: [3, 5, 15], 2: [5, 15], 3: [5, 15], 4: [3, 5, 15], 5: [3, 5, 15], 6: [3, 5, 15], 7: [5, 15], 8: [3, 5, 15], 9: [3, 5, 15], 10: [3, 5, 15] })
const FIRST = data({ 1: [3, 5, 15], 2: [5, 15], 3: [5, 15], 5: [3, 5, 15] })
const yogaMod = (d = FIRST) => ({ id: 'yoga', kind: 'practice', ring: 'life', gates: {}, routes: ['yoga'], home: { section: 'practice', order: 33 }, today: (ctx) => yogaPathStop(ctx, d) })

const at = (n, h = 10) => new Date(2026, 9, n, h)
const keys = (p) => p.stops.map((s) => s.key)
const total = (p) => p.stops.reduce((a, s) => a + (s.minutes ?? 0), 0)
const withoutYoga = (p) => JSON.stringify(p.stops.filter((s) => s.id !== 'yoga').map((s) => [s.key, s.block, s.minutes, s.done, s.locked]))
const whole = (p) => JSON.stringify({ k: p.stops.map((s) => [s.key, s.block, s.minutes, s.done, s.locked]), n: p.next?.key ?? null, a: p.allDone, m: p.minutesLeft, b: p.blocks, r: p.restIndex, f: p.forcedRestBefore })

// Yolu kuran kişinin bıraktığı kayıt (PLAN.v3 §B.3 benzetimi, v3fix2/sim_bugun_v4.mjs ile aynı eşleme)
function record(s, now, tests, sessions) {
  const date = new Date(now.getTime() + MIN).toISOString()
  const runDay = dayKey(now)
  if (s.id === 'weekly') for (const eye of ['R', 'L', 'OU']) tests.push({ type: 'va-weekly', eye, date, runDay })
  else if (s.id === 'reading') tests.push({ type: 'reading', date, runDay })
  else if (s.id === 'routine') sessions.push({ type: 'routine', setId: s.key.split(':')[1], seconds: 60, date })
  else if (s.id === 'snake' || s.id === 'track') sessions.push({ type: 'game', game: s.id, date })
  else if (s.id === 'breath') sessions.push({ type: 'breath', seconds: (s.minutes ?? 5) * 60, date })
  else if (s.id === 'fark-ettin') sessions.push({ type: 'street', noticed: 2, asked: 3, date, seconds: 60 })
  else if (s.id === 'tek-bakis') sessions.push({ type: 'span', span: 8, date, seconds: 60 })
  else if (s.id === 'notice') sessions.push({ type: 'notice', count: 2, date, seconds: 60 })
  // Oku ve Anla bitirilmiş okuma: 4 sorudan 3'ü doğru (yarıda kalan okuma, correct yok, yapılmış sayılmaz)
  else if (s.id === 'okuma-anlama') sessions.push({ type: 'okuma-anlama', wpm: 220, correct: 3, valid: true, date, seconds: 120 })
  else if (s.id === 'yoga') sessions.push({ type: 'yoga', lesson: s.stage.lesson, planned: s.minutes * 60, seconds: s.minutes * 60, reachedClosing: true, completed: true, date })
  else sessions.push({ type: s.id, date, seconds: 60 })
}
// Her gün yolu sırayla bitiren kişi. gorev: 1. gün Bugünün görevi'ni yol dışında dener; hb: 1. gün Hızlı Bakış oynar;
// skip: açılmayan günler; pre: { gün: (now) => [kayıt] } o gün yoldan önce yapılanlar; eyeMin: göz bütçesi (dk)
function simulate(days, { hour = 10, eyeMin = null, d = FIRST, hb = false, gorev = true, skip = [], pre = {} } = {}) {
  const tests = []
  const sessions = []
  const out = []
  const Y = yogaMod(d)
  for (let n = 1; n <= days; n++) {
    if (skip.includes(n)) continue
    const now = at(n, hour)
    if (pre[n]) sessions.push(...pre[n](now))
    const eye = eyeMin ? { budgetMs: eyeMin * MIN, used: 0, locked: false, due: null, leftMs: eyeMin * MIN } : undefined
    const ctx = { tests: [...tests], sessions: [...sessions], now, ...(eye ? { eye } : {}) }
    const withY = buildPath([...LIVE, Y], ctx)
    const noY = buildPath(LIVE, ctx)
    out.push({ n, ctx, withY, noY, yoga: withY.stops.find((s) => s.id === 'yoga') ?? null, cand: Y.today(ctx) })
    for (const s of withY.stops) record(s, now, tests, sessions)
    if (n === 1 && hb) sessions.push({ type: 'quick-look', date: new Date(now.getTime() + 2 * 3600000).toISOString(), seconds: 300 })
    if (n === 1 && gorev) sessions.push({ type: 'notice', count: 1, date: new Date(now.getTime() + 3600000).toISOString(), seconds: 60 })
  }
  return out
}
const dayOf = (rows, n) => rows.find((r) => r.n === n)

describe('Kalıcı eşdeğerlik: yoga hiçbir durağı değiştirmez', () => {
  const scenarios = {
    'her gün 10.00, 5 dk göz bütçesi': { hour: 10 },
    'her gün 19.00': { hour: 19 },
    '3 dk göz bütçesi': { eyeMin: 3 },
    'Hızlı Bakış oynayan': { hb: true },
    'Bugünün görevi\'ni hiç denememiş': { gorev: false },
    'uzun aradan dönüş (13.–28. gün yok)': { skip: Array.from({ length: 16 }, (_, i) => 13 + i) },
    'on ders yayımlı': { d: ALL },
    'E testi günü Ana sayfadan 15 dk ders': { pre: { 8: (now) => [{ type: 'yoga', lesson: 1, planned: 900, seconds: 900, reachedClosing: true, completed: true, date: new Date(now.getTime() - 3600000).toISOString() }] } },
  }
  for (const [name, opts] of Object.entries(scenarios)) {
    it(`${name}: yoga dışındaki duraklar aynı; yogalı yol ≤ 20 dk; yoga yoksa yol birebir aynı`, () => {
      const rows = simulate(opts.skip ? 40 : 45, opts)
      for (const r of rows) {
        expect(withoutYoga(r.withY), `gün ${r.n}`).toBe(withoutYoga(r.noY))
        if (r.yoga) expect(total(r.withY), `gün ${r.n}`).toBeLessThanOrEqual(PATH.capMin)
        else expect(whole(r.withY), `gün ${r.n}`).toBe(whole(r.noY))
        // Aday vardı ama yolda yok → yalnız yogasız yol yogaya yer bırakmadığında
        if (r.cand && !r.yoga) expect(total(r.noY) + r.cand.minutes, `gün ${r.n}`).toBeGreaterThan(PATH.capMin)
      }
      expect(rows.some((r) => r.yoga)).toBe(true)
    })
  }

  it('rastgele 3000 bağlam (geçmiş, göz bütçesi 3/5, kilit, dolma, nöbet cevabı, abonelik kapısı, yoga kayıtları)', () => {
    let seed = 12345
    const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648)
    const pick = (a) => a[Math.floor(rnd() * a.length)]
    const DAY = 86400000
    const Y = yogaMod(ALL)
    let withYoga = 0
    for (let i = 0; i < 3000; i++) {
      const now = new Date(2026, 8, 1 + Math.floor(rnd() * 60), Math.floor(rnd() * 24))
      const ago = (d) => new Date(now.getTime() - d * DAY - Math.floor(rnd() * 3) * 3600000).toISOString()
      const tests = []
      const sessions = []
      const nt = Math.floor(rnd() * 8)
      for (let j = 0; j < nt; j++) {
        const d = Math.floor(rnd() * 16)
        const t = pick(['va-weekly', 'va-weekly', 'reading', 'va-daily'])
        if (t === 'reading') tests.push({ type: t, date: ago(d) })
        else for (const eye of (t === 'va-weekly' ? ['R', 'L', 'OU'] : ['R', 'L']).filter(() => rnd() < 0.85)) tests.push({ type: t, eye, date: ago(d) })
      }
      const ns = Math.floor(rnd() * 25)
      for (let j = 0; j < ns; j++) {
        const date = ago(Math.floor(rnd() * 9))
        const k = pick(['routine', 'game-snake', 'game-track', 'breath', 'span', 'street', 'quick-look', 'notice', 'yoga'])
        if (k === 'routine') sessions.push({ type: 'routine', setId: pick(['isinma', 'uzak', 'yakinuzak', 'daire', 'kirpma']), date })
        else if (k.startsWith('game')) sessions.push({ type: 'game', game: k.slice(5), date })
        else if (k === 'breath') sessions.push({ type: 'breath', seconds: pick([30, 60, 300]), date })
        else if (k === 'span') sessions.push({ type: 'span', span: 8, date, seconds: 60 })
        else if (k === 'street') sessions.push({ type: 'street', noticed: 2, asked: 3, date, seconds: 60 })
        else if (k === 'yoga') sessions.push({ type: 'yoga', lesson: pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]), planned: pick([3, 5, 15]) * 60, date, completed: rnd() < 0.8 })
        else sessions.push({ type: k, date, seconds: 60, count: 2 })
      }
      sessions.sort((a, b) => a.date.localeCompare(b.date))
      tests.sort((a, b) => a.date.localeCompare(b.date))
      const eye = rnd() < 0.5 ? undefined : { locked: rnd() < 0.2, due: rnd() < 0.3 ? 'budget' : null, used: Math.floor(rnd() * 6) * MIN, budgetMs: pick([5, 3]) * MIN, leftMs: 2 * MIN }
      const ctx = { tests, sessions, now, eye, profile: rnd() < 0.2 ? { seizure: 'yes' } : undefined, gate: { firstTestOnly: rnd() < 0.1 }, later: rnd() < 0.2 ? { day: dayKey(now), later: ['yoga'] } : null }
      const a = buildPath(LIVE, ctx)
      const b = buildPath([...LIVE, Y], ctx)
      expect(withoutYoga(b)).toBe(withoutYoga(a))
      const y = b.stops.find((s) => s.id === 'yoga')
      if (y) {
        withYoga++
        expect(total(b)).toBeLessThanOrEqual(PATH.capMin)
        expect(y.block).toBe(2)
      } else {
        const cand = Y.today(ctx)
        if (cand) expect(total(a) + cand.minutes).toBeGreaterThan(PATH.capMin)
      }
    }
    expect(withYoga).toBeGreaterThan(300)
  })
})

describe('Yoga durağının yeri ve günleri (ctx.progression yok)', () => {
  const rows = simulate(40)
  it('1. ve 2. kayıtlı günde yok, 3. günde var; E testi günlerinde (8, 15, 22, 29) yok', () => {
    expect(dayOf(rows, 1).yoga).toBeNull()
    expect(dayOf(rows, 2).yoga).toBeNull()
    expect(dayOf(rows, 3).yoga).toMatchObject({ title: 'Yoga', sub: 'Nefesin Ritmi', minutes: 3, route: 'yoga-1' })
    for (const n of [8, 15, 22, 29]) expect(dayOf(rows, n).yoga, `gün ${n}`).toBeNull()
  })
  it('ilk bölüm: kısa günlerde Ders 1 ve 5 (3 dk) sırayla; altı kısa günden sonra Ders 2 · 5 dk; Ders 3 yolda yok', () => {
    const got = rows.filter((r) => r.yoga).map((r) => `${r.n}:${r.yoga.stage.lesson}·${r.yoga.minutes}`)
    // Sahip kararı 2026-10-02: Oku ve Anla 9.–11. günlerde yolda (yogasız yol 16 dk); sayaç dolu ama 5 dk'lık ders sığmaz,
    // o günler yolda yoga yok (R7b); tam ders Oku ve Anla'nın haftası dolunca, 12. gün gelir
    expect(got.slice(0, 8)).toEqual(['3:1·3', '4:5·3', '5:1·3', '6:5·3', '7:1·3', '9:5·3', '12:2·5', '13:1·3'])
    expect([10, 11].map((n) => dayOf(rows, n).yoga)).toEqual([null, null])
    for (const n of [10, 11]) expect(total(dayOf(rows, n).noY) + dayOf(rows, n).cand.minutes, `gün ${n}`).toBeGreaterThan(PATH.capMin)
    expect(rows.filter((r) => r.yoga?.minutes === 5).map((r) => r.n)).toEqual([12, 20, 28, 37])
    expect(rows.some((r) => r.yoga?.stage.lesson === 3)).toBe(false)
  })
  it('2. bölümün son durağı, Bugünün görevi\'nden önce; açık uçlu Yılan yogadan önce (R5)', () => {
    const p = dayOf(rows, 7).withY
    const k = keys(p)
    expect(k.slice(-4)).toEqual(['routine:kirpma', 'snake', 'yoga', 'notice'])
    expect(p.stops.find((s) => s.id === 'yoga')).toMatchObject({ block: 2, slot: 'practice', glyph: 'lotus', yields: true, dropRank: null })
    for (const r of rows.filter((x) => x.yoga)) {
      const s = r.withY.stops
      const i = s.findIndex((x) => x.id === 'yoga')
      expect(s[i].block).toBe(2)
      expect(s.slice(i + 1).every((x) => x.finale)).toBe(true)
    }
  })
  // Sahip kararı 2026-10-02: okuma testi yolda değil, ölçüm günü yalnız haftalık E testi günü (lib/yoga.js measureDay)
  it('tam ders (5 dk) hiçbir E testi gününe düşmez; E testinin ertesi günü (9, 16, 23, 30) bu benzetimde kısa ders', () => {
    const full = rows.filter((r) => r.yoga?.minutes === 5).map((r) => r.n)
    expect(full.length).toBeGreaterThan(0)
    for (const n of full) expect([8, 15, 22, 29], `gün ${n}`).not.toContain(n)
    for (const n of [9, 16, 23, 30]) expect(dayOf(rows, n).yoga?.minutes, `gün ${n}`).toBe(3)
  })
  // Sahip kararı 2026-10-02: okuma testinin (3 dk) yerine Oku ve Anla (2 dk)
  it('14 günlük aradan sonra 3 dk; E testi ve Oku ve Anla birlikte gelince yoga sığmazsa yolda yok, öteki duraklar yerinde', () => {
    const gap = simulate(40, { d: ALL, skip: Array.from({ length: 16 }, (_, i) => 13 + i) })
    const back = dayOf(gap, 29)
    expect(keys(back.noY)).toEqual(expect.arrayContaining(['weekly', 'okuma-anlama']))
    expect(total(back.noY)).toBe(19)
    expect(back.yoga).toBeNull()
    expect(withoutYoga(back.withY)).toBe(withoutYoga(back.noY))
    const next = dayOf(gap, 30)
    expect(next.yoga).toMatchObject({ minutes: 3, stage: { soft: true, full: false } })
  })
})

describe('Özel günler (PLAN.v3 §B.4)', () => {
  // Sahip kararı 2026-10-02: okuma testi (eskiden bu gün 3 dk) yolda değil; Oku ve Anla R5 gereği Hızlı Bakış günü 2. bölümde
  // yok. Yogasız yol 18 → 15 dk: 3 dk'lık yoga artık sığar (20 dk'yı aşmaz), Hızlı Bakış yerinde, öteki duraklar aynı
  it('Hızlı Bakış günü, eski okuma günü (Bugünün görevi yolda): yogasız yol 15 dk; yoga sığar, Hızlı Bakış yerinde', () => {
    const d = (n, h = 10) => at(n, h).toISOString()
    const tests = [...['R', 'L', 'OU'].map((eye) => ({ type: 'va-weekly', eye, date: d(8), runDay: dayKey(at(8)) })), { type: 'reading', date: d(2), runDay: dayKey(at(2)) }]
    const sessions = [{ type: 'quick-look', date: d(7), seconds: 300 }, { type: 'notice', date: d(1, 11), count: 1, seconds: 60 }]
    for (let n = 2; n <= 8; n++) sessions.push({ type: 'routine', setId: 'isinma', date: d(n) })
    const ctx = { tests, sessions, now: at(9) }
    expect(yogaMod().today(ctx)).toMatchObject({ minutes: 3 }) // aday var
    const noY = buildPath(LIVE, ctx)
    const withY = buildPath([...LIVE, yogaMod()], ctx)
    expect(total(noY)).toBe(15)
    expect(keys(noY)).toContain('quick-look')
    expect(keys(noY)).toContain('notice')
    expect(keys(noY)).not.toContain('reading')
    expect(keys(noY)).not.toContain('okuma-anlama') // R5: 2. bölüm Hızlı Bakış'ın
    expect(keys(withY).filter((k) => k !== 'yoga')).toEqual(keys(noY))
    expect(withY.stops.find((s) => s.id === 'yoga')).toMatchObject({ minutes: 3, block: 2 })
    expect(total(withY)).toBe(18)
  })
  it('E testi günü Ana sayfadan 15 dk yoga yapılmış: yolda yoga yok; Yılan, Daire ve Bugünün görevi yerinde (yol 19 dk)', () => {
    const rows = simulate(8, { pre: { 8: (now) => [{ type: 'yoga', lesson: 1, planned: 900, seconds: 900, reachedClosing: true, completed: true, date: new Date(now.getTime() - 3600000).toISOString() }] } })
    const r = dayOf(rows, 8)
    expect(r.yoga).toBeNull()
    expect(keys(r.withY)).toEqual(expect.arrayContaining(['weekly', 'snake', 'routine:daire', 'notice']))
    expect(total(r.withY)).toBe(19)
  })
  // Sahip kararı 2026-10-02: Oku ve Anla 1.–3. günlerde yolda (+2 dk). 4. gün haftası dolmuş, yer var
  it('bugün Ana sayfadan yapılan ders durağı tamamlar; gün içinde değişmez', () => {
    const rows = simulate(4)
    const withDone = (n) => {
      const ctx = dayOf(rows, n).ctx
      const done = { ...ctx, sessions: [...ctx.sessions, { type: 'yoga', lesson: 2, planned: 900, seconds: 900, reachedClosing: true, completed: true, date: at(n, 9).toISOString() }] }
      return buildPath([...LIVE, yogaMod()], done)
    }
    expect(withDone(4).stops.find((s) => s.id === 'yoga')).toMatchObject({ sub: 'Derin Dinlenme', minutes: 5, done: true })
    // 3. gün yogasız yol 16 dk (Oku ve Anla dahil): tamamlanmış 5 dk'lık durak da 20 dk'yı aşacağı için yolda görünmez (R7b)
    expect(total(dayOf(rows, 3).noY)).toBe(16)
    expect(withDone(3).stops.some((s) => s.id === 'yoga')).toBe(false)
  })
})

describe('20 dk sınırı (R7b): yoga yalnız sığarsa', () => {
  const fixed = (min, extra = {}) => ({ id: `p${min}`, kind: 'practice', gates: {}, today: () => ({ title: 'Pratik', minutes: min, slot: 'practice', order: 40, ...extra }) })
  const notice = { id: 'notice', kind: 'practice', gates: {}, today: () => ({ title: 'Bugünün görevi', minutes: 1, slot: 'finale', dropRank: 2, done: false }) }
  const yoga = (done = false) => ({ id: 'yoga', kind: 'practice', gates: {}, today: () => ({ title: 'Yoga', sub: 'Nefesin Ritmi', minutes: 3, slot: 'practice', order: 105, yields: true, done }) })
  const now = at(5)
  it('yogasız yol 17 dk iken 3 dk\'lık yoga eklenir (20 dk)', () => {
    const p = buildPath([fixed(16), notice, yoga()], { now })
    expect(keys(p)).toEqual(['p16', 'yoga', 'notice'])
    expect(total(p)).toBe(20)
  })
  it('18 dk iken eklenmez; hiçbir durak düşmez', () => {
    const p = buildPath([fixed(17), notice, yoga()], { now })
    expect(keys(p)).toEqual(['p17', 'notice'])
  })
  it('tamamlanmış yoga da 20\'yi aşacaksa yolda görünmez', () => {
    expect(keys(buildPath([fixed(17), notice, yoga(true)], { now }))).toEqual(['p17', 'notice'])
    expect(keys(buildPath([fixed(16), notice, yoga(true)], { now }))).toEqual(['p16', 'yoga', 'notice'])
  })
  it('yogasız yol zaten 20\'yi aşıyorsa bugünkü düşme sırası aynen işler, yoga yine yok', () => {
    const p = buildPath([fixed(20), notice, yoga()], { now })
    expect(keys(p)).toEqual(['p20'])
  })
})

describe('Göz bütçesi 3 dk', () => {
  it('yoga 2. bölümde kalır; Yılan ve o günün Tek Bakışta / Fark Ettin mi? durağı düşebilir (yogasız yolda da)', () => {
    const rows = simulate(30, { eyeMin: 3 })
    const yogaDays = rows.filter((r) => r.yoga)
    expect(yogaDays.length).toBe(24)
    for (const r of yogaDays) expect(r.yoga.block).toBe(2)
    const dropped = rows.filter((r) => r.yoga && !['snake', 'tek-bakis', 'fark-ettin'].some((k) => keys(r.noY).includes(k)))
    expect(dropped.length).toBeGreaterThan(0)
    for (const r of dropped) expect(withoutYoga(r.withY)).toBe(withoutYoga(r.noY))
  })
})

describe('"Sonra yaparım" (later)', () => {
  it('yoga later iken sıradaki Bugünün görevi, açılabilir ve yol tamam; öteki duraklar bitince sıradaki yine yoga', () => {
    const rows = simulate(3)
    const { ctx } = dayOf(rows, 3)
    const base = buildPath([...LIVE, yogaMod()], ctx)
    // Yoga ve final dışındaki her durak bugün yapıldı
    const tests = [...ctx.tests]
    const sessions = [...ctx.sessions]
    for (const s of base.stops.filter((x) => x.id !== 'yoga' && !x.finale)) record(s, at(3, 9), tests, sessions)
    const later = { day: dayKey(ctx.now), later: ['yoga'] }
    const p = buildPath([...LIVE, yogaMod()], { ...ctx, tests, sessions, later })
    const y = p.stops.find((s) => s.id === 'yoga')
    const fin = p.stops.find((s) => s.id === 'notice')
    expect(y).toMatchObject({ later: true, done: false })
    expect(p.next).toBe(fin)
    expect(canOpen(p, fin)).toBe(true)
    expect(canOpen(p, y)).toBe(false)
    expect(p.allDone).toBe(true)
    // Bugünün görevi de bitti: sıradaki yine yoga, gece yarısına kadar açılabilir
    record(fin, at(3, 9), tests, sessions)
    const q = buildPath([...LIVE, yogaMod()], { ...ctx, tests, sessions, later })
    expect(q.next.id).toBe('yoga')
    expect(canOpen(q, q.next)).toBe(true)
    expect(q.allDone).toBe(true)
    // "Sonra yaparım" denmeden: sıradaki yoga, yol tamam değil
    const r = buildPath([...LIVE, yogaMod()], { ...ctx, tests, sessions })
    expect(r.next.id).toBe('yoga')
    expect(r.allDone).toBe(false)
  })
  it('dünkü "sonra" bugüne taşınmaz; durak yerinde kalır, sıra onu atlar', () => {
    const rows = simulate(4)
    const { ctx } = dayOf(rows, 4)
    const stale = buildPath([...LIVE, yogaMod()], { ...ctx, later: { day: dayKey(at(3)), later: ['yoga'] } })
    expect(stale.stops.find((s) => s.id === 'yoga').later).toBe(false)
    const today = buildPath([...LIVE, yogaMod()], { ...ctx, later: { day: dayKey(ctx.now), later: ['yoga'] } })
    expect(keys(today)).toEqual(keys(stale))
    expect(today.next.id).not.toBe('yoga')
  })
})

describe('Yalnız hazır dersler (ilk bölüm)', () => {
  it('yalnız Ders 2 yayımlıyken kısa günde durak yok; Ders 1 ve 5 yayımlanınca gelir', () => {
    const only2 = simulate(9, { d: data({ 2: [5, 15] }) })
    expect(only2.some((r) => r.yoga)).toBe(false)
    const firstPart = simulate(9, { d: data({ 1: [3], 2: [5, 15], 5: [3] }) })
    expect(dayOf(firstPart, 3).yoga).toMatchObject({ sub: 'Nefesin Ritmi', minutes: 3 })
    expect(dayOf(firstPart, 4).yoga).toMatchObject({ sub: 'Tek Nokta', minutes: 3 })
  })
  it('bugünkü veri (yalnız Ders 2 · 15 dk): yol yogasız yolla birebir aynı', () => {
    for (const r of simulate(30, { d: data({ 2: [15] }) })) {
      expect(r.yoga).toBeNull()
      expect(whole(r.withY)).toBe(whole(r.noY))
    }
  })
})

describe('Gerçek yoga manifesti ve ders verisiyle (modules/yoga/manifest.js, lib/yogaLessons.js)', () => {
  it.skipIf(!REAL_YOGA)('web\'de yolda yoga yok; iPhone\'da yoga dışındaki duraklar aynı, yol ≤ 20 dk, süre yayımlanmış', async () => {
    const { publishedMinutes } = await import('./yogaLessons.js')
    const run = (on) => {
      ios.on = on
      try {
        const tests = []
        const sessions = []
        const out = []
        for (let n = 1; n <= 40; n++) {
          const now = at(n)
          const ctx = { tests: [...tests], sessions: [...sessions], now }
          const withY = buildPath([...LIVE, REAL_YOGA], ctx)
          const noY = buildPath(LIVE, ctx)
          out.push({ n, withY, noY, yoga: withY.stops.find((s) => s.id === 'yoga') ?? null })
          for (const s of withY.stops) record(s, now, tests, sessions)
        }
        return out
      } finally {
        ios.on = false
      }
    }
    for (const r of run(false)) {
      expect(r.yoga).toBeNull()
      expect(whole(r.withY)).toBe(whole(r.noY))
    }
    for (const r of run(true)) {
      expect(withoutYoga(r.withY), `gün ${r.n}`).toBe(withoutYoga(r.noY))
      if (r.yoga) {
        expect(total(r.withY)).toBeLessThanOrEqual(PATH.capMin)
        expect(publishedMinutes(r.yoga.stage.lesson)).toContain(r.yoga.minutes)
        expect(r.yoga.route).toBe(`yoga-${r.yoga.stage.lesson}`)
      }
    }
  })
})
