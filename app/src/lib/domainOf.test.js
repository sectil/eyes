// Kayıt başına alan (PLAN.v3 §D.5, G1-b): modül isteğe bağlı sessions.domainOf(s) verir; kaydın alanını yalnız
// lib/dataHub.js domainOfSession söyler. Aynı yoga kaydı Gelişim'in 28 günlük şeridinde, kaynak sayımında ve CSV'de aynı
// alanda görünür; domainOf tanımlamayan modüllerde CSV satırları bugünküyle aynı kalır.
import { describe, it, expect, afterEach } from 'vitest'
import { domainOfSession, growthMap, hub } from './dataHub.js'
import { csvRows, toCsv, reportModel, reportHtml } from './exportData.js'
import { activitiesFrom } from './stats.js'
import { registry, createRegistry, validateManifest, DOMAINS } from '../modules/registry.js'
import { DOMAIN_LABEL } from './progress.js'
import { makeYogaRecord } from './yogaRecord.js'
import { LESSONS } from './yogaLessons.js'
import { makeWho5Record } from './progress.js'

const NOW = new Date(2026, 8, 30, 20, 0)
const at = (daysAgo, h = 9) => new Date(2026, 8, 30 - daysAgo, h, 5).toISOString()
const yoga = (lesson, daysAgo = 0, extra = {}) => ({
  id: `y${lesson}-${daysAgo}`,
  ...makeYogaRecord({ lesson, planned: lesson === 3 ? 900 : 300, seconds: 280, reachedClosing: true, before: lesson === 3 ? null : 6, after: lesson === 3 ? null : 4, endedAt: new Date(at(daysAgo)) }),
  ...extra,
})
// PLAN.v3 §D.5: Sakinlik (1), Beden (2), İyi oluş (3, VARSAYIM), Dikkat (5)
const EXPECT = { 1: 'calm', 2: 'body', 3: 'wellbeing', 5: 'focus' }

describe('kayıt defteri: isteğe bağlı sessions.domainOf', () => {
  const base = { id: 'x', title: 'X', label: 'x', ring: 'life', kind: 'practice', progress: { domain: 'calm' } }
  const sess = (extra) => ({ ...base, sessions: { match: () => true, describe: () => ({}), countsTowardGoal: true, ...extra } })
  it('fonksiyonsa geçerli, yoksa da geçerli; fonksiyon değilse hata', () => {
    expect(validateManifest(sess({}))).toEqual([])
    expect(validateManifest(sess({ domainOf: () => 'body' }))).toEqual([])
    expect(validateManifest(sess({ domainOf: 'body' }))).toContain('x: sessions.domainOf fonksiyon olmalı')
    expect(createRegistry([sess({ domainOf: 1 })]).problems).toEqual(['x: sessions.domainOf fonksiyon olmalı'])
  })
  it('gerçek modüllerde yalnız yoga tanımlar; alan etkileri ve metrikler değişmez (registry.effects/metrics)', () => {
    expect(registry.modules.filter((m) => m.sessions?.domainOf).map((m) => m.id)).toEqual(['yoga'])
    for (const e of registry.effects().filter((x) => x.module === 'yoga')) expect(DOMAINS).toContain(e.domain)
  })
})

describe('domainOfSession: tek kaynak', () => {
  const y = registry.get('yoga')
  const orig = y.sessions.domainOf
  afterEach(() => {
    y.sessions.domainOf = orig
  })
  it('yoga kaydı dersin alanında; ders verisindeki alanla aynı', () => {
    for (const [n, d] of Object.entries(EXPECT)) {
      expect(domainOfSession(yoga(Number(n))), `ders ${n}`).toBe(d)
      expect(LESSONS[n].domain).toBe(d)
    }
  })
  it('domainOf geçersiz alan döndürür ya da hata verirse modülün tek alanı (Sakinlik); kayıt düşmez', () => {
    y.sessions.domainOf = () => 'uyku'
    expect(domainOfSession(yoga(2))).toBe('calm')
    y.sessions.domainOf = () => {
      throw new Error('bozuk')
    }
    expect(domainOfSession(yoga(5))).toBe('calm')
    expect(growthMap({ sessions: [yoga(5)], now: NOW }).domains.calm.days).toBe(1)
  })
  it('domainOf tanımlamayan modüller: modülün alanı (bugünkü davranış)', () => {
    for (const s of [{ type: 'breath' }, { type: 'dalga' }, { type: 'game', game: 'snake' }, { type: 'blink' }, { type: 'routine' }, { type: 'who5' }]) {
      const m = registry.forSession(s)
      expect(m, s.type).toBeTruthy()
      expect(domainOfSession(s)).toBe(m.progress.domain)
    }
    expect(domainOfSession({ type: 'yoga' })).toBeNull() // ders numarası yok: yoga kaydı sayılmaz
    expect(domainOfSession(null)).toBeNull()
  })
})

describe('aynı yoga kaydı 28 günlük şeritte, kaynak sayımında, merkezde ve CSV\'de aynı alanda', () => {
  for (const [n, d] of Object.entries(EXPECT)) {
    it(`Ders ${n} → ${DOMAIN_LABEL[d]}`, () => {
      const rec = yoga(Number(n), 2)
      const map = growthMap({ sessions: [rec], now: NOW })
      // şerit: yalnız dersin alanında 2 gün önce dolu
      for (const x of DOMAINS) expect(map.domains[x].days, x).toBe(x === d ? 1 : 0)
      expect(map.domains[d].strip.at(-3)).toBe(true)
      // kaynak sayımı (dataHub.js growthMap): modülün tek alanında (Sakinlik) değil, dersin alanında
      expect(map.domains[d].sources).toEqual([{ key: 'yoga', label: 'Yoga', n: 1 }])
      if (d !== 'calm') expect(map.domains.calm.sources).toEqual([])
      // merkez (hub): kayıt sayısı aynı alanda
      expect(hub({ sessions: [rec], now: NOW }).domains[d].records.total).toBe(1)
      // CSV süre satırı aynı alanda; önce → sonra satırları da (Uykuya Geçiş'te puan yok)
      const rows = csvRows({ sessions: [rec] })
      const dur = rows.filter((r) => r.measure === 'süre')
      expect(dur).toEqual([expect.objectContaining({ module: `Yoga · ${LESSONS[n].title}`, domain: d, value: 280, unit: 'sn' })])
      const eff = rows.filter((r) => / · (önce|sonra)$/.test(r.measure))
      if (Number(n) === 3) expect(eff).toEqual([])
      else expect(eff.map((r) => r.domain)).toEqual([d, d])
      expect(toCsv(dur)).toContain(`;${DOMAIN_LABEL[d]};süre;280;sn;`)
    })
  }
  it('Uykuya Geçiş\'in sabah cevabı: metrik satırı İyi oluş\'ta, kaydın tarihiyle', () => {
    const rec = yoga(3, 1, { sleepEase: 7 })
    const row = csvRows({ sessions: [rec] }).find((r) => r.measure === 'Uykuya dalma kolaylığı (ertesi sabah)')
    expect(row).toMatchObject({ date: rec.date, domain: 'wellbeing', value: 7, unit: 'puan', module: 'Yoga' })
  })
  it('aynı kimlik iki kez geçerse CSV satırı modülün alanına düşer (eşleme belirsiz), satır kaybolmaz', () => {
    const a = yoga(2, 1, { id: 'ayni' })
    const b = yoga(5, 1, { id: 'ayni' })
    const dur = csvRows({ sessions: [a, b] }).filter((r) => r.measure === 'süre')
    expect(dur).toHaveLength(2)
    expect(dur.map((r) => r.domain)).toEqual(['calm', 'calm'])
  })
})

describe('domainOf tanımlamayan modüllerde CSV bugünküyle aynı', () => {
  // Bugünkü kural (exportData.js, değişiklikten önce): modül ya da türünden bulunan modülün alanı
  const legacyDomain = (a) => (a.kind === 'test' ? 'eye' : (registry.get(a.module) ?? registry.forSession({ type: a.type }))?.progress.domain ?? '')
  const sessions = [
    { type: 'breath', pattern: 'calm', calmBefore: 2, calmAfter: 4, seconds: 300, date: at(1) },
    { type: 'dalga', before: 3, after: 6, seconds: 600, date: at(2) },
    { type: 'gokyuzu', before: 3, after: 7, seconds: 120, date: at(3) },
    { type: 'street', noticed: 3, asked: 4, seconds: 90, date: at(3, 11) },
    { type: 'notice', seconds: 60, date: at(4) },
    { type: 'quick-look', threshold: 180, accuracy: 70, seconds: 300, date: at(4, 12) },
    { type: 'span', seconds: 100, date: at(5) },
    { type: 'yon', seconds: 200, date: at(5, 13) },
    { type: 'breath-count', accuracy: 70, sets: 3, seconds: 200, date: at(6) },
    { type: 'game', game: 'snake', score: 12, best: 31, seconds: 90, date: at(6, 14) },
    { type: 'game', game: 'track', score: 40, best: 54, seconds: 40, date: at(7) },
    { type: 'game', game: 'eski', seconds: 30, date: at(7, 15) },
    { type: 'blink', reps: 10, seconds: 60, date: at(8) },
    { type: 'routine', setId: 'isinma', seconds: 240, date: at(8, 16) },
    { type: 'bilinmeyen', seconds: 45, date: at(9) },
    { seconds: 20, date: at(9, 17) },
    { id: 'k1', type: 'breath', seconds: 50, date: at(10) },
    { id: 'k1', type: 'dalga', seconds: 70, date: at(10, 18) }, // aynı kimlik
    makeWho5Record([3, 3, 3, 3, 3], at(11)),
  ]
  const tests = [{ type: 'va-daily', eye: 'R', logMAR: 0.2, date: at(12) }, { type: 'reading', maxReadingSpeed: 150, date: at(12, 10) }]
  it('süre satırlarının alanı eski kuralla birebir; bütün CSV aynı', () => {
    const rows = csvRows({ tests, sessions })
    const dur = rows.filter((r) => r.measure === 'süre')
    const acts = activitiesFrom(tests, sessions)
    expect(dur.map((r) => r.domain)).toEqual(acts.map(legacyDomain))
    // birkaç bilinen değer: sessiz değişiklik olmasın
    const byModule = Object.fromEntries(dur.map((r) => [r.module, r.domain]))
    expect(byModule['Göz kırpma egzersizi']).toBe('eye')
    expect(byModule['Egzersiz seti']).toBe('eye')
    expect(byModule.Oyun).toBe('')
    expect(byModule.Egzersiz).toBe('')
    expect(new Set(dur.map((r) => r.domain))).toEqual(new Set(acts.map(legacyDomain)))
  })
})

// "Doktoruma göster" (PDF): etki satırındaki değişim ve güven aralığı aynı yönde (sonra − önce). "Düşük daha iyi" ölçüde
// (yoga Ders 1: gerginlik) değer çevrilip aralık çevrilmiyordu: "−3,0 (1,7 – 4,3)".
describe('PDF raporu: önce → sonra satırı', () => {
  const row = (html, label) => html.split('<tr>').find((r) => r.includes(label)) ?? ''
  it('düşük daha iyi ölçü: değişim ve aralık eksi; yukarı iyi ölçü: artı; başlık "değişim"', () => {
    const calm = [4, 3, 5, 4].map((after, i) => yoga(1, i + 1, { before: 7, after, id: `c${i}` }))
    const focus = [6, 7, 5, 6].map((after, i) => yoga(5, i + 1, { before: 4, after, id: `f${i}` }))
    const html = reportHtml(reportModel({ tests: [], sessions: [...calm, ...focus], now: NOW }))
    expect(html).toContain('<th class="n">değişim (%95 GA)</th>')
    expect(html).not.toContain('iyileşme (%95 GA)')
    const c = row(html, 'Yoga · Nefesin Ritmi')
    expect(c).toContain('7,0 → 4,0')
    expect(c).toMatch(/>−3,0 \(−\d,\d – −\d,\d\)</)
    const f = row(html, 'Yoga · Tek Nokta')
    expect(f).toContain('4,0 → 6,0')
    expect(f).toMatch(/>\+2,0 \(\d,\d – \d,\d\)</)
  })
})
