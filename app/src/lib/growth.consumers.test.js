// Gelişim merkezi G1 adım 3: merkezi okuyan yüzeyler (gelisim-merkezi PLAN §8.1 G1 satırı, §3.5 tutarlılık kuralları,
// §8.4 "tek hesap"). Denetim betiklerinin (denetim-betikleri/A-merkez, B-tutarlilik) dışa aktarım, 5. gün raporu, iris ve
// takvim yarıları burada; beklenti düzeltilmiş davranıştır.
//  - CSV: mola, su, alarm satırları (Ö-7); adımlı gün satırı, adım sayısı yok (Ö-9, plan §3.4)
//  - PDF: etkiler son 28 gün (Ö-3), yönlü etki metni (Ö-8), v2 hükmü (K1, K3), pencere adları (Kü-5)
//  - Tek hesap: aynı depodan PDF ile growthCenter aynı hükmü ve aynı göz "şimdi" değerini verir (K1, K2)
//  - 5. gün raporu: ikinci WHO-5'ten sonra "İlk puanın" denmez (Ö-6)
//  - İris: hücreler merkezden (Ö-10 (b)); cevap → alan eşlemesi tek yerde; kırpma yöntemi anlık görüntüde (Kü-9)
//  - Tek Bakışta span7 ortanca (onaylı §3.B.6); okuma reading-cps tanımı (Ö-4; kaydı açık, bkz. reading/manifest.js)
import { describe, it, expect } from 'vitest'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { csvRows, reportModel, reportHtml } from './exportData.js'
import { growthCenter, blinkOf } from './growthCenter.js'
import { hub, domainOfSession, ANSWER_FIELDS as HUB_FIELDS } from './dataHub.js'
import { irisCells, snapshot, withBaseline, withRecheck, ANSWER_FIELDS } from './iris.js'
import { normalizeProfile, emptyProfile } from './profile.js'
import { metricCards, makeWho5Record, who5Card } from './progress.js'
import { makeYogaRecord } from './yogaRecord.js'
import { registry } from '../modules/registry.js'
import { READING_CPS_METRIC } from '../modules/reading/manifest.js'
import FirstReport, { who5Line } from '../screens/FirstReport.jsx'

const NOW = new Date('2026-09-30T18:00:00')
const DAY = 86400000
const at = (daysAgo, h = 10, m = 0) => {
  const d = new Date(NOW.getTime() - daysAgo * DAY)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}
const keyOf = (iso) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const text = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&#39;/g, "'").replace(/\s+/g, ' ')
const section = (html, h2) => {
  const i = html.indexOf(`<h2>${h2}`)
  return i < 0 ? '' : html.slice(i, html.indexOf('</section>', i))
}

describe('CSV: alışkanlık ve adımlı gün satırları (Ö-7, Ö-9)', () => {
  it('B-A: mola, su ve alarm satır olur; alan merkezin eşlemesinden; tabandaki satırlar yerinde', () => {
    const habits = [
      { date: keyOf(at(3)), type: 'mola', at: at(3) },
      { date: keyOf(at(2)), type: 'mola', at: at(2) },
      { date: keyOf(at(1)), type: 'water', at: at(1, 12) },
      { date: keyOf(at(1)), type: 'alarm', at: at(1, 7) },
      { date: 'x', type: 'mola', at: 'tarih değil' },
      { date: keyOf(at(1)), type: 'bilinmeyen', at: at(1) },
    ]
    const sessions = [{ type: 'breath', date: at(1, 20), calmBefore: 2, calmAfter: 4, seconds: 120 }]
    const rows = csvRows({ sessions, habits })
    const of = (m) => rows.filter((r) => r.measure === m)
    expect(of('mola')).toHaveLength(2) // eskiden 0 satır (DENETIM B-A)
    expect(of('mola')[0]).toMatchObject({ module: 'Mola', domain: 'body', value: 1, unit: 'kez' })
    expect(of('su')).toEqual([expect.objectContaining({ module: 'Su', domain: 'body' })])
    // "alarm sabahı": uyanma işareti ya da sabah cevabı olan gün (yalnız uyanış değil)
    expect(of('alarm sabahı')).toEqual([expect.objectContaining({ module: 'Alarm', domain: 'wellbeing' })])
    expect(rows.filter((r) => r.measure === 'süre')).toHaveLength(1)
    // alışkanlıksız çağrı bugünkü satırları verir; eklenenler yalnız alışkanlık satırları
    const base = csvRows({ sessions, habits: [] })
    expect(rows.filter((r) => !['mola', 'su', 'alarm sabahı'].includes(r.measure))).toEqual(base)
    const dates = rows.map((r) => new Date(r.date).getTime())
    expect(dates).toEqual([...dates].sort((a, b) => a - b))
  })

  it('alışkanlık verilmezse telefondaki günlük okunur (Doktoruma göster kartı yalnız tests/sessions verir)', () => {
    const store = new Map()
    const prev = globalThis.localStorage
    globalThis.localStorage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v), removeItem: (k) => store.delete(k) }
    try {
      store.set('gozolcum:habit-log', JSON.stringify([{ date: keyOf(at(1)), type: 'water', at: at(1) }]))
      expect(csvRows({ tests: [], sessions: [] }).map((r) => r.measure)).toEqual(['su'])
    } finally {
      globalThis.localStorage = prev
    }
  })

  it('adımlı gün: yalnız kendi ortancasına ulaşan gün, adım SAYISI dosyada yok', () => {
    const stepRows = Array.from({ length: 10 }, (_, i) => ({ date: keyOf(at(i)), steps: 1000 * (i + 1) + 13 }))
    const rows = csvRows({ habits: [], health: { hasData: true, stepRows } }).filter((r) => r.measure === 'adımlı gün')
    // ortanca (5,5 bin) ve üstü: 5 gün
    expect(rows).toHaveLength(5)
    // ölçü adı PDF'tekiyle aynı ("adımlı gün"); "Hareketli gün" başlangıç sorusunun adıdır. Not üçüncü kişiyle.
    expect(rows[0]).toMatchObject({ module: 'Apple Sağlık', domain: 'body', value: 1, unit: 'gün', note: 'adım kişinin kendi ortancasına ulaştı; adım sayısı dosyaya yazılmaz' })
    const all = JSON.stringify(rows)
    for (const r of stepRows) expect(all).not.toContain(String(r.steps))
    // 7 adımlı günden azsa ortanca kurulmaz, satır yok
    expect(csvRows({ habits: [], health: { hasData: true, stepRows: stepRows.slice(0, 6) } }).filter((r) => r.measure === 'adımlı gün')).toEqual([])
  })
})

describe('PDF: etkiler, yön, v2 hükmü ve pencere (Ö-3, Ö-8, K1, K3, Kü-5)', () => {
  it('Ö-3 (A-S5): önce → sonra tablosu son 28 günden; eski etkili oturumlar hükmü taşımaz', () => {
    const sessions = []
    for (let i = 0; i < 20; i++) sessions.push({ type: 'breath', date: at(120 - i * 3), calmBefore: 2, calmAfter: 4, seconds: 120 })
    for (let i = 0; i < 6; i++) sessions.push({ type: 'breath', date: at(12 - i * 2), calmBefore: 3, calmAfter: 3, seconds: 120 })
    const m = reportModel({ sessions, habits: [], now: NOW })
    const calm = m.effects.find((e) => e.key === 'breath-calm')
    expect(calm).toMatchObject({ n: 6, sig: false })
    const html = reportHtml(m)
    expect(section(html, 'Uygulama öncesi')).toContain('· son 28 gün</h2>')
    expect(text(section(html, 'Uygulama öncesi'))).toContain('ortalamaya dönüş')
    // Gelişim (growthCenter) aynı 28 günü okur
    expect(growthCenter({ sessions, now: NOW }).effects.find((e) => e.key === 'breath-calm')).toMatchObject({ n: 6, sig: false })
  })

  it('Ö-8: belirgin etkinin yönü yazılır; "düşük daha iyi" ölçü belirtilir; yoga yalnız puanın yönü', () => {
    const m = reportModel({ habits: [], now: NOW })
    const html = reportHtml({ ...m, effects: [
      { label: 'Yön · Dışarıdan bak', measure: 'rahatsızlık', max: 10, n: 4, before: 7, after: 4, gain: 3, lo: 2.1, hi: 3.9, better: 'down', sig: true },
      { label: 'Nefes', measure: 'sakinlik', max: 5, n: 4, before: 4, after: 3, gain: -1, lo: -1.5, hi: -0.5, better: 'up', sig: true },
      { module: 'yoga', label: 'Yoga · Nefesin Ritmi', measure: 'gerginlik', max: 10, n: 3, before: 7, after: 3.3, gain: 3.7, lo: 2, hi: 5, better: 'down', sig: true },
    ] })
    expect(html).toContain('<td class="n">−3,0 (−3,9 – −2,1)</td><td>belirgin, iyi yönde (düşük daha iyi)</td>')
    expect(html).toContain('<td class="n">−1,0 (−1,5 – −0,5)</td><td>belirgin, kötü yönde</td>')
    // yoga (B-D): gerginlik azaldı → "belirgin düşüş"; iyi/kötü denmez (Ö-1, modul.md §7)
    expect(html).toContain('<td class="n">−3,7 (−5,0 – −2,0)</td><td>belirgin düşüş</td>')
  })

  it('K1, K3 (A-S1b): metrik satırı v2 hükmüyle ve onun sayılarıyla; eski iyileşme yeni gerilemeyi örtmez', () => {
    const sessions = []
    // 30 ölçüm 260 ms → 30 ölçüm 200 ms → son 6 ölçüm yine 260 ms (düşük iyi): halves "better", v2 değil
    let d = 70
    for (let i = 0; i < 30; i++) sessions.push({ type: 'quick-look', date: at(d--, 12), threshold: 260 + (i % 3) })
    for (let i = 0; i < 30; i++) sessions.push({ type: 'quick-look', date: at(d--, 12), threshold: 200 + (i % 3) })
    for (let i = 0; i < 6; i++) sessions.push({ type: 'quick-look', date: at(d--, 12), threshold: 260 })
    const m = reportModel({ sessions, habits: [], now: NOW })
    const ql = m.metrics.find((c) => c.key === 'quick-look-threshold')
    expect(ql.status).toBe('better') // eski kural yerinde (eşdeğerlik), gösterilmez
    expect(ql.verdict).not.toBe('better')
    const html = section(reportHtml(m), 'Diğer ölçümler')
    expect(html).toContain('<th class="n">başlangıç → şimdi</th>')
    expect(html).not.toContain('iyileşiyor')
    // değerlendirme: Gelişim'in dört sözcüğünden biri ya da (doğrulanmış gerilemede) sözcüksüz, işaretli fark
    expect(html).toMatch(/Algı hızı eşiği<\/td><td>Dikkat<\/td><td class="n">66<\/td><td class="n">\d+ → \d+ ms<\/td><td>(değişim yok|henüz belli değil|[−+]\d+)<\/td>/)
    expect(html).not.toContain('gerisinde')
    expect(text(html)).toContain('art arda iki hafta sürerse değişim denir')
  })

  it('Kü-5: düzen sayılarının penceresi yazılır; alan başına gün growthCenter\'dan', () => {
    const sessions = [{ type: 'breath', date: at(2, 20), calmBefore: 2, calmAfter: 4, seconds: 120 }]
    const habits = [{ date: keyOf(at(1)), type: 'mola', at: at(1) }]
    const m = reportModel({ sessions, habits, now: NOW })
    const g = growthCenter({ sessions, habits, now: NOW })
    expect(m.areas.rows.map((r) => [r.key, r.days])).toEqual(g.order.map((k) => [k, g.areas[k].days]))
    const t = text(section(reportHtml(m), 'Düzen'))
    expect(t).toContain('aktif gün · ilk kayıttan beri')
    // hekim belgesinde pencere üçüncü kişiyle ("ilk kayıttan beri"); "kaydı olan gün" (mola, su da sayılır, çalışma değil)
    expect(g.windowLabel).toBe('başladığından beri')
    expect(t).toContain('Alan başına kaydı olan gün (ilk kayıttan beri): Göz 0 · Dikkat 0 · Nefes 1 · Ruh hâli 0 · Hareket 1.')
    expect(t).toContain('Dikkat = Dikkat ve Farkındalık; Nefes = Sakinlik; Ruh hâli = İyi oluş ve Kendine yaklaşım; Hareket = Beden')
    expect(t).toContain('Mola, su, alarm sabahı ve Apple Sağlık')
  })
})

describe('Tek hesap: PDF ≡ growthCenter (K1, K2; PLAN §8.4)', () => {
  it('B-A: aynı depodan metrik hükmü, etkiler, WHO-5 ve göz "şimdi" değeri aynı', () => {
    // 30. gün kullanıcısı: haftalık E testi 6 kez (son test 9 gün önce → son 3 test), nefes, Hızlı Bakış, yoga, WHO-5
    const lm = { R: [0.10, 0.10, 0.10, 0.08, 0.10, 0.16], L: [0.2, 0.2, 0.2, 0.2, 0.2, 0.2], OU: [0.06, 0.06, 0.06, 0.06, 0.06, 0.06] }
    const tests = [44, 37, 30, 23, 16, 9].flatMap((d, i) => ['R', 'L', 'OU'].map((eye) => ({ type: 'va-weekly', eye, logMAR: lm[eye][i], date: at(d), correction: 'none', distanceTracked: true, meanDistanceMm: 400, algorithm: 'descent-zest-v4', trials: 28, seconds: 300 })))
    const sessions = []
    let id = 1
    for (let i = 0; i < 8; i++) sessions.push({ id: id++, type: 'breath', date: at(27 - i * 3, 20), seconds: 300, calmBefore: 2, calmAfter: i % 2 ? 4 : 3 })
    ;[120, 118, 121, 119, 90, 88, 92, 89].forEach((v, i) => sessions.push({ id: id++, type: 'quick-look', date: at(26 - i * 3, 12), seconds: 60, threshold: v }))
    for (let i = 0; i < 3; i++) {
      const r = makeYogaRecord({ lesson: 5, planned: 600, seconds: 600, reachedClosing: true, before: 7, after: 5 - (i % 2), endedAt: new Date(at(10 - i * 3, 19)) })
      if (r) sessions.push({ id: id++, ...r })
    }
    sessions.push({ id: id++, ...makeWho5Record([2, 2, 2, 2, 2], at(28, 9)) }, { id: id++, ...makeWho5Record([3, 3, 3, 3, 3], at(2, 9)) })
    const habits = [3, 2, 1].map((d) => ({ date: keyOf(at(d)), type: 'mola', at: at(d) }))
    const m = reportModel({ tests, sessions, habits, now: NOW })
    const g = growthCenter({ tests, sessions, habits, now: NOW })
    expect(m.metrics.map((c) => [c.key, c.verdict])).toEqual(g.metrics.map((c) => [c.key, c.verdict]))
    expect(m.effects.map((e) => [e.key, e.n, e.sig, e.gain])).toEqual(g.effects.map((e) => [e.key, e.n, e.sig, e.gain]))
    expect([m.who5.last, m.who5.verdict]).toEqual([g.who5.last, g.who5.verdict])
    // göz: Gelişim'in tek "şimdi" değeri (K2: son 3 testin ortancası) PDF'teki aynı gözün değeriyle aynı
    const pdfEye = m.eyes.find((e) => e.eye === g.eye.eye)
    expect(g.eye.currentWindow).toBe('last3')
    expect(pdfEye.trend.current).toBe(g.eye.current)
    expect(pdfEye.trend.currentWindow).toBe(g.eye.currentWindow)
    expect(text(reportHtml(m))).toContain('Son 3 test (ortanca) 0,10')
  })
})

describe('5. gün raporu: WHO-5 (Ö-6)', () => {
  const rec = (score, d) => makeWho5Record(Array(5).fill(score / 20), at(d, 9))
  it('tek ölçümde "İlk puanın"; ikinci ölçümden sonra son puan, değişim ve hüküm', () => {
    expect(who5Line(who5Card([rec(60, 3)], NOW))).toMatch(/^İlk puanın 60\. İkinci ölçüm 11 gün sonra/)
    // tek ölçüm, zamanı geldi: "0 gün sonra" yazılmaz
    expect(who5Line(who5Card([rec(60, 20)], NOW))).toBe('İlk puanın 60. Yeni ölçümün zamanı geldi.')
    // eşik cümlesi hükümden önce; hükmün öznesi var
    const up = who5Line(who5Card([rec(60, 20), rec(80, 2)], NOW))
    expect(up).toBe('Son puanın 80; ilk ölçümden bu yana +20 (2 ölçüm). 10 puan ve üstü değişim anlamlı sayılır: puanın başlangıcından iyi. Sonraki ölçüm 12 gün sonra.')
    expect(who5Line(who5Card([rec(60, 20), makeWho5Record([3, 3, 3, 3, 5], at(2, 9))], NOW))).toContain('ilk ölçümden bu yana +8 (2 ölçüm). 10 puan ve üstü değişim anlamlı sayılır: değişim yok.')
    // gerileme: sayılar ve eşik yazılır, ekranın dört sözcüğü dışında hüküm sözü yok (DEVIR §1.8)
    const down = who5Line(who5Card([rec(80, 20), rec(60, 15)], NOW))
    expect(down).toBe('Son puanın 60; ilk ölçümden bu yana −20 (2 ölçüm). 10 puan ve üstü değişim anlamlı sayılır. Yeni ölçümün zamanı geldi.')
    expect(who5Line(who5Card([], NOW))).toMatch(/14 günde bir/)
  })
  it('ekranda: ikinci ölçümden sonra "İlk puanın" yazmaz; "beyin", "tanıma" yok', () => {
    const t = text(renderToStaticMarkup(h(FirstReport, { tests: [], sessions: [rec(60, 20), rec(80, 2)], start: at(21, 0), onClose: () => {}, onProgress: () => {} })))
    expect(t).not.toContain('İlk puanın')
    expect(t).toContain('Son puanın 80')
    expect(t).toContain('Düzen · başladığından beri')
    expect(t).not.toMatch(/beyin|tanıma/i)
  })
})

describe('İris: merkezden (Ö-10 (b)) ve kırpma yöntemi (Kü-9)', () => {
  it('cevap → alan eşlemesi tek yerde (iris.js); merkez aynı listeyi verir', () => {
    expect(HUB_FIELDS).toBe(ANSWER_FIELDS)
  })
  it('A-S10: hub verilince WHO-5, mola ve alarm da hücre doldurur; Yılan Dikkat\'i merkezle aynı kuralla', () => {
    const snap = { date: at(0), blinks: 7, stressNow: 3, sleep: null, activityDays: null, selfCompassion: 3 }
    const sessions = [{ type: 'game', game: 'snake', date: at(0), score: 3, seconds: 60 }, { type: 'who5', date: at(1), answers: [3, 3, 3, 3, 3], raw: 15, score: 60, seconds: 0 }]
    const habits = [{ date: keyOf(at(1)), type: 'mola', at: at(1) }]
    const legacy = irisCells(snap, { sessions, domainOf: domainOfSession })
    expect(legacy.filter((c) => c.filled).map((c) => c.domain)).toEqual(['eye', 'focus', 'calm', 'self']) // WHO-5 ve mola yok
    const H = hub({ sessions, habits, now: NOW })
    const cells = irisCells(snap, { hub: H })
    expect(cells.filter((c) => c.filled).map((c) => c.domain)).toEqual(['eye', 'focus', 'calm', 'self', 'wellbeing', 'body'])
    for (const c of cells) if (c.domain !== 'eye' && c.domain !== 'calm' && c.domain !== 'self') expect(c.filled, c.domain).toBe(H.domains[c.domain].hasData)
    expect(cells.find((c) => c.domain === 'wellbeing').value).toBeNull() // değer yalnız cevaptan
  })
  it('Kü-9: anlık görüntü kırpma yöntemini taşır, kayıt-okuma sonrası kalır; farklı yöntemler karşılaştırılmaz', () => {
    const look = (method, blinks) => ({ blinks, seconds: 20, method, date: at(30) })
    let p = { ...emptyProfile(), firstLook: look('self', 6) }
    p = withBaseline(p, at(30))
    expect(p.iris.baseline).toMatchObject({ blinks: 6, blinkMethod: 'self' })
    expect(normalizeProfile(JSON.parse(JSON.stringify(p))).iris.baseline.blinkMethod).toBe('self')
    expect(normalizeProfile({ iris: { baseline: { date: at(30), blinks: 6, blinkMethod: 'göz kararı' } } }).iris.baseline.blinkMethod).toBeUndefined()
    expect(snapshot({ ...emptyProfile() }, at(0))).not.toHaveProperty('blinkMethod')
    // 28. gün TrueDepth ile: iki sayı yan yana konmaz
    const r = withRecheck({ ...p, firstLook: look('truedepth', 9) }, at(0))
    expect(blinkOf(r)).toMatchObject({ baseline: 6, recheck: 9, baselineMethod: 'self', recheckMethod: 'truedepth', comparable: false, method: 'truedepth', count: 9 })
    const same = withRecheck({ ...p, firstLook: look('self', 8) }, at(0))
    expect(blinkOf(same)).toMatchObject({ comparable: true, method: 'self', count: 8 })
    // eski kayıt (yöntemsiz başlangıç + 28. gün): yöntemi bilinmiyor, karşılaştırılmaz
    const old = { firstLook: look('camera', 5), iris: { baseline: { date: at(30), blinks: 5 }, recheck: { date: at(0), blinks: 7 } } }
    expect(blinkOf(old)).toMatchObject({ baselineMethod: null, recheckMethod: null, comparable: false })
  })
})

describe('Modül ölçüleri', () => {
  it('Tek Bakışta span7: son 7 günün ortancası (şanslı tek tur seviye sayılmaz)', () => {
    const tb = registry.get('tek-bakis')
    const s = [4, 4, 5, 9].map((span, i) => ({ type: 'span', span, durationMs: 100, seconds: 60, date: at(i + 1) }))
    expect(tb.coach(s, NOW)).toMatchObject({ span7: 4.5, rounds7: 4 })
    expect(tb.coach(s.slice(0, 3), NOW).span7).toBe(4)
    expect(tb.coach([], NOW)).toBeNull()
  })
  it('Ö-4 (A-S6): reading-cps tanımı rahat boyun kötüleşmesini v2 kuralıyla görür (kaydı açık: BLOCKER)', () => {
    // haftalık okuma testi, rahat boy her hafta büyüyor (kötüleşiyor; küçük daha iyi)
    const tests = Array.from({ length: 8 }, (_, i) => ({ type: 'reading', protocol: 2, date: at(60 - i * 7), maxReadingSpeed: 180, criticalPrintSize: +(0.2 + i * 0.1).toFixed(1), correction: 'none' }))
    // başka gözlük koşulundaki test seriye girmez
    const other = { type: 'reading', protocol: 2, date: at(58), criticalPrintSize: 0.9, correction: 'reading' }
    expect(READING_CPS_METRIC.series({ tests: [...tests, other] })).toHaveLength(8)
    const [card] = metricCards({ tests, sessions: [], metrics: [{ ...READING_CPS_METRIC, module: 'reading', domain: 'eye' }], now: NOW })
    expect(card).toMatchObject({ key: 'reading-cps', verdict: 'worse' })
    expect(card.v2.baseline).toBeCloseTo(0.35, 6)
    // henüz kayıtlı değil: Göz alanının hükmüne girmez (sahibin kararı bekleniyor)
    expect(registry.metrics().some((x) => x.key === 'reading-cps')).toBe(false)
  })
})
