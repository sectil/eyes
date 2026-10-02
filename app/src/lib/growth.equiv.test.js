// Gelişim merkezi eşdeğerlik düzeneği (gelisim-merkezi/PLAN.v1.md §8.4; DEVIR §7 "Veri"). Aynı tohumlu depoda dondurulmuş
// taban (test/fixtures/gelisim-taban: G1'den önceki dataHub, progress, stats, exportData, trend, vaSeries) ile bugünkü
// kod karşılaştırılır (karşılaştırma araçları test/growthEquiv.js; fark kuralı ve gruplar orada yazılı):
//  - growthMap, son 28 gün ve ilk 28 gün pencereleri (alan özetleri, yani hub alanları dâhil): her depoda;
//  - CSV satırları, PDF modeli ve PDF metni: her EXPORT_EVERY. depoda (varsayılan 10; süre için. 1 verilirse hepsinde).
// mulberry32(1) ile N depo (varsayılan 20.000): 0–400 gün, her modülden kayıt, aynı gün çok tur, alışkanlık, WHO-5,
// sağlık, ara (test/growthStore.js). Saat dilimi Europe/Berlin (yaz saati günleri gerçek geçiş). Ortam değişkenleri:
// GROWTH_EQUIV_N (depo sayısı), GROWTH_EQUIV_EXPORT_EVERY (dışa aktarım sıklığı).
//
// İzinli gruplar ALLOWED'dadır. G1'den önce (kod değişmeden) ALLOWED boştur: her grup 0 fark. G1'de yalnız PLAN §8.4'ün
// izinli listesi girer (GROUPS[g].allowable); 'core' (growthMap days, strip, sinceStart, frac …) ve 'metrics' asla.
// Fark varsa her grubun ilk örneği yazdırılır; düzeltilecek olan kod, taban değil.
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import * as cur from './dataHub.js'
import * as curExport from './exportData.js'
import { dayKey } from './calendar.js'
import { mulberry32, makeStore } from '../../test/growthStore.js'
import { GROUPS, compareStore, deepFreeze, ADDED_CSV_MEASURES, expectedStepDays, htmlDiffs, healthOnly } from '../../test/growthEquiv.js'

const envInt = (v, d) => (Number(v) > 0 ? Math.floor(Number(v)) : d)
const N = envInt(process.env.GROWTH_EQUIV_N, 20000)
const EXPORT_EVERY = envInt(process.env.GROWTH_EQUIV_EXPORT_EVERY, 10)
const DAY = 86400000

// G1'de izin verilen gruplar (PLAN §8.4 izinli listesi). G1 adım 2 (çekirdek: growthCenter, ölçü kuralı v2, dataHub):
//  - verdict: alan hükmü ve WHO-5 kartı (K1–K4, Ö-1; v2 hükmü, FEEL_ONLY, karışık → null)
//  - effects: önce → sonra etkileri son 28 gün (Ö-3)
//  - records: kayıt sayıları gün sayar, görme testi gözleri tek kayıt (Ö-5, Kü-1)
//  - health: Apple Sağlık'ta kendi ortancasına ulaşan adımlı gün Beden şeridinde (Ö-9)
// G1 adım 3 (tüketiciler):
//  - export: CSV'ye eklenen alışkanlık ve adımlı gün satırları (Ö-7, Ö-9), PDF modelinin etkileri son 28 gün (Ö-3), PDF
//    metni (v2 hükmü, yönlü etki, pencere adları, alan günleri: K1–K4, Ö-8, Kü-5, Kü-6). CSV'nin tabandaki satırları ve
//    PDF modelinin öbür alanları 'exportBase'tir ve izinli değildir (0 fark).
// G1 adım 4 (denetim bulguları):
//  - eye: trend.js seri seçimi (Ö-11, PLAN §13 "G1'in ilk adımı"): kamera test ortasında durduğu için kamerasız kalan
//    son kayıt (camFailedMidTest) seriyi değiştirmez. §8.4'ün izinli listesinde adı geçmez (PLAN §13'te G1'e alındı);
//    raporda ayrıca yazılır. Ayrıca tek hesap testinin bulduğu: bozuk göz kaydı (tarihsiz ya da logMAR'sız) öne çıkan
//    gözü seçmez (lib/vaSeries.js). Ana döngü her göz farkının yalnız bu iki nedenden birinin olduğu depoda çıktığını
//    doğrular.
const ALLOWED = new Set(['verdict', 'effects', 'records', 'health', 'export', 'eye'])

// Göz farkına izinli iki neden: (1) Ö-11: bir gözün son E testi (geçerli logMAR) kamera ortada durmuş kamerasız kayıt;
// (2) tek hesap: bozuk göz kaydı (tarihi okunmuyor ya da logMAR sayı değil) öne çıkan gözü seçmez (lib/vaSeries.js
// isVa; PDF/CSV de almıyordu)
const VA = new Set(['va-daily', 'va-weekly'])
function camFailedTail(store) {
  return ['R', 'L', 'OU'].some((eye) => {
    const ts = store.tests.filter((t) => VA.has(t?.type) && t.eye === eye && Number.isFinite(t.logMAR)).sort((a, b) => a.date.localeCompare(b.date))
    const last = ts.at(-1)
    return last?.camFailedMidTest === true && last.distanceTracked === false
  })
}
const m0Who5 = (store) => store.sessions.some((x) => x?.type === 'who5' && Number.isFinite(x.score))
const corruptVa = (store) => store.tests.some((t) => VA.has(t?.type) && (!Number.isFinite(t.logMAR) || !Number.isFinite(new Date(t.date).getTime())))

const tz = process.env.TZ
beforeAll(() => {
  process.env.TZ = 'Europe/Berlin'
})
afterAll(() => {
  if (tz === undefined) delete process.env.TZ
  else process.env.TZ = tz
})

const show = (v) => {
  const s = JSON.stringify(v)
  return s && s.length > 300 ? `${s.slice(0, 300)}…` : s
}

describe('Gelişim eşdeğerliği: taban ≡ bugünkü kod (PLAN §8.4)', () => {
  it('izin listesi yalnız izin verilebilir gruplardan; core ve metrics hiçbir zaman izinli değil', () => {
    for (const g of ALLOWED) expect(GROUPS[g]?.allowable, `izin verilemez grup: ${g}`).toBe(true)
  })

  it('düzenek boş değil: bozulmuş çıktıyı doğru gruba koyar', () => {
    const rnd = mulberry32(7)
    let store
    do store = makeStore(rnd)
    while (!(store.sessions.length > 20 && store.health?.hasData && store.tests.length > 3))
    deepFreeze(store)
    const tamper = (fn) => ({ impl: { cur: { ...cur, growthMap: (a) => fn(structuredClone(cur.growthMap(a)), a) }, curExport } })
    // Bozulmamış koddaki farklar (G1'de izinli gruplarda olabilir) çıkarılır: yalnız bozmanın getirdiği yeni farkların
    // grubu sayılır.
    const key = (d) => `${d.where}|${d.path}|${JSON.stringify(d.is)}`
    const untouched = compareStore(store)
    const seen0 = new Set(untouched.map(key))
    const groupsOf = (opts) => new Set(compareStore(store, opts).filter((d) => !seen0.has(key(d))).map((d) => d.group))
    // değişmemiş: izinli liste dışında 0 fark
    expect(untouched.filter((d) => !ALLOWED.has(d.group))).toEqual([])
    // şeritten bir gün silinir → core
    expect(groupsOf(tamper((g) => {
      const d = g.domains.calm
      d.strip[27] = !d.strip[27]
      return g
    }))).toContain('core')
    // sinceStart → core
    expect(groupsOf(tamper((g) => ({ ...g, sinceStart: g.sinceStart + 1 })))).toEqual(new Set(['core']))
    // hüküm → verdict; kaynak → records; etkiler → effects; metrikler → metrics; yeni alan → fark yok
    expect(groupsOf(tamper((g) => ((g.domains.focus.status = g.domains.focus.status === 'up' ? 'down' : 'up'), g)))).toEqual(new Set(['verdict']))
    expect(groupsOf(tamper((g) => ((g.domains.eye.sources = []), g))).has('records') || store.tests.length === 0).toBe(true)
    expect(groupsOf(tamper((g, a) => (a.window === 'recent' && (g.domains.calm.summary.effects = [{ key: 'x' }]), g)))).toEqual(new Set(['effects']))
    expect(groupsOf(tamper((g, a) => (a.window === 'recent' && (g.domains.focus.summary.metrics = [{ key: 'x' }]), g)))).toEqual(new Set(['metrics']))
    expect(groupsOf(tamper((g) => ((g.domains.calm.verdict = 'better'), (g.domains.calm.mixed = false), g)))).toEqual(new Set())
    // Beden'e kendi ortancasına ulaşan adımlı bir gün eklenir → health; ortancanın altındaki (ya da adımsız) gün → core
    const stepDays = expectedStepDays(store.health)
    const addBody = (want) => tamper((g) => {
      const b = g.domains.body
      const t0 = new Date(g.from).getTime()
      const i = b.strip.findIndex((on, j) => !on && stepDays.has(dayKey(new Date(t0 + j * DAY + DAY / 2))) === want)
      if (i < 0) return g
      b.strip[i] = true
      b.days += 1
      b.frac = b.days / b.strip.length
      return g
    })
    // bugünkü kod kendi ortancasına ulaşan her adımlı günü zaten ekliyor: bozulmamış farklar arasında 'health' var
    expect(untouched.some((d) => d.group === 'health')).toBe(true)
    if (groupsOf(addBody(true)).size) expect([...groupsOf(addBody(true))]).toEqual(['health'])
    const noStep = groupsOf(addBody(false))
    if (noStep.size) expect(noStep).toContain('core')
    // adımı > 0 ama kendi ortancasının altında olan gün sayılırsa (bütün adımlı günleri ekleyen hata) → core
    const below = new Set(store.health.stepRows.filter((r) => r.steps > 0 && !stepDays.has(r.date)).map((r) => r.date))
    const addBelow = tamper((g) => {
      const b = g.domains.body
      const t0 = new Date(g.from).getTime()
      const i = b.strip.findIndex((on, j) => !on && below.has(dayKey(new Date(t0 + j * DAY + DAY / 2))))
      if (i < 0) return g
      b.strip[i] = true
      b.days += 1
      b.frac = b.days / b.strip.length
      return g
    })
    const belowGroups = groupsOf(addBelow)
    if (belowGroups.size) expect(belowGroups).toContain('core')
    // dışa aktarım: CSV'nin tabandaki bir satırı düşer → exportBase (izin verilemez); eklenen türde bir satır → export;
    // PDF modelinin etkiler dışındaki bir alanı değişir → exportBase
    const baseRow = curExport.csvRows(store).findIndex((r) => !ADDED_CSV_MEASURES.has(r.measure))
    const drop = { impl: { cur, curExport: { ...curExport, csvRows: (a) => curExport.csvRows(a).filter((_, i) => i !== baseRow) } } }
    expect(groupsOf(drop)).toEqual(new Set(['exportBase']))
    const added = { impl: { cur, curExport: { ...curExport, csvRows: (a) => [...curExport.csvRows(a), { date: store.now.toISOString(), module: 'Su', domain: 'body', measure: curExport.HABIT_MEASURE.water, value: 1, unit: 'kez', note: 'x' }] } } }
    expect(groupsOf(added)).toEqual(new Set(['export']))
    const days = { impl: { cur, curExport: { ...curExport, reportModel: (a) => ({ ...curExport.reportModel(a), days: -1 }) } } }
    expect(groupsOf(days)).toContain('exportBase')
    // PDF metni bölüm bölüm: izinsiz bölümdeki (Uyarı kuralı, Yöntem, göz tablosu, WHO-5 puanı) değişiklik exportBase ya da
    // eye; izinli bölümdeki (Diğer ölçümler değerlendirme sütunu) değişiklik export
    const html = (fn) => ({ impl: { cur, curExport: { ...curExport, reportHtml: (m) => fn(curExport.reportHtml(m)) } } })
    expect(groupsOf(html((h) => h.replace('Kırmızı:', 'Kırmız:')))).toEqual(new Set(['exportBase']))
    expect(groupsOf(html((h) => h.replace('Yakın mesafe ölçümüdür', 'Yakın ölçümdür')))).toEqual(new Set(['exportBase']))
    expect(groupsOf(html((h) => h.replace('</h2><p>Son puan <b>', '</h2><p>Son puan <b>1')))).toEqual(m0Who5(store) ? new Set(['exportBase']) : new Set())
  })

  it('healthOnly: Beden\'e yalnız kendi ortancasına ulaşan adımlı gün eklenebilir (adımı > 0 yetmez)', () => {
    const from = new Date(2026, 8, 3).toISOString()
    const keys = Array.from({ length: 28 }, (_, i) => dayKey(new Date(new Date(from).getTime() + i * DAY + DAY / 2)))
    // 10 adımlı gün: 1000…10000; ortanca 5500 → 6000 ve üstü 5 gün sayılır
    const stepRows = keys.slice(0, 10).map((date, i) => ({ date, steps: 1000 * (i + 1) }))
    const health = { hasData: true, stepRows }
    expect([...expectedStepDays(health)].sort()).toEqual(keys.slice(5, 10))
    const old = { strip: keys.map(() => false), days: 0 }
    const dom = (on) => {
      const strip = keys.map((k) => on.includes(k))
      const days = strip.filter(Boolean).length
      return { strip, days, frac: days / 28 }
    }
    expect(healthOnly(old, dom(keys.slice(5, 10)), from, health)).toBe(true)
    expect(healthOnly(old, dom(keys.slice(0, 10)), from, health)).toBe(false) // ortancanın altındaki adımlı günler
    expect(healthOnly(old, dom([keys[20]]), from, health)).toBe(false) // adımsız gün
    expect(healthOnly(old, dom([]), from, { hasData: true, stepRows: stepRows.slice(0, 6) })).toBe(true) // değişiklik yok
    expect(healthOnly(old, dom([keys[9]]), from, { hasData: true, stepRows: stepRows.slice(0, 6) })).toBe(false) // 7 günden az: hiç
  })

  it('PDF metni bölüm bölüm karşılaştırılır (izinli bölüm export, öbürleri exportBase/eye)', () => {
    const base = '<html>baş<section><h2>Yakın görme · E</h2><span class="status ">iyileşme</span><td>0,10</td></section><section class="block rule"><h2>Uyarı kuralı</h2>k</section><section class="block"><h2>Düzen</h2>\n<div class="cols"><div><b>3</b><span>aktif gün</span></div></div>\n</section><section class="block"><h2>İyi oluş · WHO-5</h2><p>Son puan <b>60</b>, ilk ölçümden bu yana +4 (doğal oynama); 2 ölçüm.</p></section><section class="block"><h2>Diğer ölçümler</h2><tr><td>A</td><td>Dikkat</td><td class="n">7</td><td class="n">ort. 1 → 2</td><td>iyileşiyor</td></tr></section></html>'
    const ok = base
      .replace('>iyileşme<', '>başlangıcından iyi<')
      .replace('<span>aktif gün</span>', '<span>aktif gün · ilk kayıttan beri</span>')
      .replace('</div></div>\n</section>', '</div></div>\n<p class="small">Alan başına kaydı olan gün (son 28 gün): Göz 1.</p>\n</section>')
      .replace(' (doğal oynama)', ' (değişim yok)')
      .replace('ort. 1 → 2</td><td>iyileşiyor', '1 → 2</td><td>değişim yok')
    expect(new Set(htmlDiffs(base, ok).map((d) => d.group))).toEqual(new Set(['export']))
    expect(htmlDiffs(base, ok.replace('<b>3</b>', '<b>4</b>')).map((d) => d.group)).toContain('exportBase')
    expect(htmlDiffs(base, ok.replace('+4', '+5')).map((d) => d.group)).toContain('exportBase')
    expect(htmlDiffs(base, ok.replace('class="n">7<', 'class="n">8<')).map((d) => d.group)).toContain('exportBase')
    expect(htmlDiffs(base, ok.replace('<td>0,10</td>', '<td>0,12</td>')).map((d) => d.group)).toContain('eye')
    expect(htmlDiffs(base, ok.replace('<h2>Uyarı kuralı</h2>k', '<h2>Uyarı kuralı</h2>K')).map((d) => d.group)).toContain('exportBase')
  })

  // Çıktılar duvar saatine bağlı değil (her işleve now verilir): ana döngü saati sahtelemeden koşabilir
  it('çıktılar duvar saatinden bağımsız (200 depo, iki farklı sistem saati)', { timeout: 60000 }, () => {
    const rnd = mulberry32(3)
    const run = (s) => {
      const input = { ...s }
      return [cur.growthMap(input), cur.growthMap({ ...input, window: 'first' }), curExport.csvRows(input), curExport.reportHtml(curExport.reportModel(input))]
    }
    vi.useFakeTimers({ toFake: ['Date'] })
    try {
      for (let i = 0; i < 200; i++) {
        const s = makeStore(rnd)
        vi.setSystemTime(s.now)
        const a = run(s)
        vi.setSystemTime(new Date(2031, 6, 15, 23, 59, 30))
        expect(run(s)).toEqual(a)
      }
    } finally {
      vi.useRealTimers()
    }
  })

  // Kendi süre sınırı: 20.000 depo × iki pencere (+ her 10. depoda CSV ve PDF) × (taban + yeni). Bu makinede ≈ 3 dk.
  it(`${N} tohumlu depoda izinli liste dışında 0 fark (şu an ALLOWED: ${[...ALLOWED].join(', ') || 'boş'})`, { timeout: Math.max(120000, N * 60) }, () => {
    const rnd = mulberry32(1)
    const byGroup = Object.fromEntries(Object.keys(GROUPS).map((g) => [g, { stores: 0, paths: 0, first: null }]))
    const seen = { data: 0, compare: 0, verdict: 0, health: 0, sameDay: 0, gap: 0, empty: 0, exports: 0, camTail: 0 }
    let eyeElsewhere = 0 // izinli nedeni (Ö-11 kaydı, bozuk göz kaydı) olmayan depoda göz farkı (0 olmalı)
    // Saat sahtelenmez (sahte Date süreyi ikiye katlıyor); çıktıların duvar saatinden bağımsızlığı yukarıdaki testte.
    for (let i = 0; i < N; i++) {
      const store = deepFreeze(makeStore(rnd))
      const exports = i % EXPORT_EVERY === 0
      if (exports) seen.exports++
      const diffs = compareStore(store, { exports })
      const camTail = camFailedTail(store)
      if (camTail) seen.camTail++
      if (!camTail && !corruptVa(store) && diffs.some((d) => d.group === 'eye')) eyeElsewhere++
      const hit = new Set()
      for (const d of diffs) {
        const g = byGroup[d.group]
        g.paths++
        if (!hit.has(d.group)) g.stores++, hit.add(d.group)
        if (!g.first) g.first = { store: i, at: store.now.toString(), ...d }
      }
      // kapsam: depolar gerçekten veri, karşılaştırma, hüküm, sağlık ve aynı gün turları içeriyor mu
      const gm = diffs.recent
      const doms = Object.values(gm.domains)
      if (doms.some((x) => x.days > 0)) seen.data++
      else if (!store.sessions.length && !store.tests.length) seen.empty++
      if (gm.canCompare) seen.compare++
      if (doms.some((x) => x.status)) seen.verdict++
      if (store.health?.hasData) seen.health++
      // aynı gün aynı modülden birden çok tur; ≥ 3 günlük ara (kayıtlı iki gün arasında)
      const perDay = new Map()
      const days = new Set()
      for (const x of store.sessions) {
        const t = new Date(x?.date).getTime()
        if (!Number.isFinite(t)) continue
        const k = dayKey(new Date(t))
        days.add(k)
        perDay.set(`${k}:${x.type}`, (perDay.get(`${k}:${x.type}`) ?? 0) + 1)
      }
      if ([...perDay.values()].some((n) => n > 1)) seen.sameDay++
      const sorted = [...days].sort().map((k) => new Date(`${k}T12:00:00`).getTime())
      if (sorted.some((t, j) => j > 0 && t - sorted[j - 1] >= 3.5 * DAY)) seen.gap++
    }
    const table = Object.entries(byGroup).map(([g, v]) => `${g.padEnd(8)} ${ALLOWED.has(g) ? 'izinli ' : 'yasak  '} depo ${String(v.stores).padStart(6)}  fark ${v.paths}`)
    console.log(`Gelişim eşdeğerliği (${N} depo)\n${table.join('\n')}\nkapsam ${JSON.stringify(seen)}`)
    for (const [g, v] of Object.entries(byGroup)) {
      if (v.first) console.log(`İLK FARK [${g}] depo ${v.first.store} (${v.first.at}) ${v.first.where} ${v.first.path}\n  taban: ${show(v.first.was)}\n  yeni:  ${show(v.first.is)}`)
    }
    const forbidden = Object.entries(byGroup).filter(([g, v]) => !ALLOWED.has(g) && v.paths > 0).map(([g, v]) => `${g}: ${v.stores} depo`)
    expect(forbidden).toEqual([])
    expect(eyeElsewhere).toBe(0)
    // düzenek gerçekten bir şey sınıyor (oranlar tohumla sabit; eşikler gevşek)
    expect(seen.data).toBeGreaterThan(N * 0.6)
    expect(seen.compare).toBeGreaterThan(N * 0.3)
    expect(seen.verdict).toBeGreaterThan(N * 0.1)
    expect(seen.health).toBeGreaterThan(N * 0.3)
    expect(seen.sameDay).toBeGreaterThan(N * 0.3)
    expect(seen.gap).toBeGreaterThan(N * 0.3)
    expect(seen.camTail).toBeGreaterThan(N * 0.005)
  })
})
