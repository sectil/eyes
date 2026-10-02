// Gelişim merkezi tek çıkışı (gelisim-merkezi PLAN.v1 §3.1, §3.5; DEVIR §2, §7 "Veri")
import { describe, it, expect, vi } from 'vitest'
import { growthCenter, phaseOf, windowLabel, AREAS, AREA_DOMAINS } from './growthCenter.js'
import { growthMap } from './dataHub.js'
import { VERDICTS } from './changeText.js'
import { mulberry32, makeStore } from '../../test/growthStore.js'
import { deepFreeze } from '../../test/growthEquiv.js'

const NOW = new Date(2026, 8, 30, 18, 0) // Çarşamba
const ago = (d, h = 10, m = 0) => new Date(2026, 8, 30 - d, h, m).toISOString()
const key = (d) => {
  const x = new Date(2026, 8, 30 - d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}

// 30. gün kullanıcısı (maket v6 "30. gün" durumuna benzer veri)
function day30() {
  const tests = [44, 37, 30, 23, 16, 9].flatMap((d, i) => ['R', 'L', 'OU'].map((eye, j) => ({
    type: 'va-weekly', eye, logMAR: { R: [0.1, 0.1, 0.1, 0.08, 0.1, 0.16], L: [0.2, 0.2, 0.2, 0.2, 0.2, 0.2], OU: [0.06, 0.06, 0.06, 0.06, 0.06, 0.06] }[eye][i],
    date: ago(d, 9, j * 3), correction: 'none', distanceTracked: true, meanDistanceMm: 400, algorithm: 'descent-zest-v4', seconds: 120,
  })))
  const sessions = []
  // Tek Bakışta: 30–23 gün önce her gün 4 harf (alışma 2 + başlangıç 6; SD tabanı 0,5), sonra her gün ~6 harf
  for (let d = 30; d >= 23; d--) sessions.push({ type: 'span', date: ago(d, 12), span: 4 })
  for (let d = 22; d >= 1; d--) sessions.push({ type: 'span', date: ago(d, 12), span: d % 2 ? 6 : 5.8 })
  // Nefes: son 28 günde 8 seans, sakinlik 2 → 3/4
  for (let i = 0; i < 8; i++) sessions.push({ type: 'breath', date: ago(27 - i * 3, 20), seconds: 300, calmBefore: 2, calmAfter: i % 2 ? 4 : 3 })
  // WHO-5: 56 → 68
  sessions.push({ type: 'who5', date: ago(29, 9), answers: [3, 3, 3, 2, 3], raw: 14, score: 56 })
  sessions.push({ type: 'who5', date: ago(1, 9), answers: [4, 3, 3, 4, 3], raw: 17, score: 68 })
  const profile = { firstLook: { blinks: 5, seconds: 20, method: 'camera', date: ago(30, 8) }, iris: { baseline: { date: ago(30, 8), blinks: 5, stressNow: 2, sleep: 6, activityDays: 3, selfCompassion: 2 } } }
  const rows = Array.from({ length: 60 }, (_, i) => ({ date: key(59 - i), steps: 59 - i === 0 ? 7080 : 4000 + ((i * 937) % 6000), distanceM: 0, exerciseMin: 0 }))
  const health = { hasData: true, today: rows.at(-1), avgSteps: 6000, stepRows: rows, recentSteps: 100, at: NOW.toISOString() }
  return { tests, sessions, profile, habits: [], health, now: NOW }
}

describe('growthCenter: beş alan, tek hüküm', () => {
  it('boş depo: beş alan "başlangıç", veri yok, değer yok', () => {
    const g = growthCenter({ now: NOW })
    expect(g.order).toEqual(AREAS)
    expect(Object.keys(g.areas)).toEqual(['goz', 'dikkat', 'nefes', 'ruh', 'hareket'])
    for (const a of AREAS) expect(g.areas[a]).toMatchObject({ verdict: 'start', hasData: false, value: null, days: 0 })
    expect(g).toMatchObject({ sinceStart: 0, phase: 'week', win: 7, hasData: false, steps: null })
    expect(g.eye.current).toBeNull()
  })

  it('30. gün: yalnız doğrulanmış iyileşme "başlangıcından iyi"; çip değeri ölçüm ve başlangıcı', () => {
    const g = growthCenter(day30())
    expect(g.phase).toBe('rolling')
    expect(g.areas.dikkat).toMatchObject({ verdict: 'better', value: { text: '4 → 6 harf', kind: 'metric', key: 'tek-bakis-span' } })
    expect(g.areas.nefes).toMatchObject({ verdict: 'better', value: { text: '+1,5 sakinlik', kind: 'effect' } })
    expect(g.areas.ruh).toMatchObject({ verdict: 'better', value: { text: 'İyi oluş 56 → 68', kind: 'who5' } })
    // Göz: değişim yok; değer son 3 testin ortancası (K2), başlangıçla
    expect(g.areas.goz.verdict).toBe('same')
    expect(g.areas.goz.value.text).toMatch(/^E testi \d,\d\d → \d,\d\d$/)
    // Hareket: adımın karşılaştırma kuralı yok → henüz belli değil; bugünün adımı
    expect(g.areas.hareket).toMatchObject({ verdict: 'unclear', value: { text: 'Bugün 7.080 adım', kind: 'steps' } })
    expect(g.blink).toMatchObject({ baseline: 5, seconds: 20, method: 'camera', count: 5 })
  })

  it('K2: göz için tek "şimdi" değeri (son 3 testin ortancası), tek test değil', () => {
    const s = day30()
    const g = growthCenter(s)
    expect(g.eye).toMatchObject({ currentWindow: 'last3', phase: 'tracking' })
    expect(g.eye).not.toHaveProperty('current7')
    expect(g.eye).not.toHaveProperty('last')
    // öne çıkan seri ve değeri harita özetindeki göz kartıyla aynı
    const card = growthMap(s).domains.eye.summary.eye
    expect(g.eye.current).toBe(card.current)
    expect(g.eye.eye).toBe(card.eye)
  })

  it('K1: alan hükmü haritanın iç alan hükümleriyle aynı kaynaktan (300 tohumlu depo)', { timeout: 60000 }, () => {
    const rnd = mulberry32(11)
    let better = 0
    for (let i = 0; i < 300; i++) {
      const s = deepFreeze(makeStore(rnd))
      const g = growthCenter(s)
      const m = growthMap(s)
      for (const a of AREAS) {
        const st = AREA_DOMAINS[a].map((d) => m.domains[d])
        const up = st.some((x) => x.status === 'up')
        const bad = st.some((x) => x.status === 'down' || x.mixed)
        const x = g.areas[a]
        expect(VERDICTS).toContain(x.verdict)
        expect(x.verdict === 'better', `${i} ${a}`).toBe(up && !bad)
        if (x.down || x.mixed) expect(x.verdict).toBe('unclear')
        if (x.verdict === 'better') better++
      }
    }
    expect(better).toBeGreaterThan(10) // düzenek boş değil
  })

  it('göz uyarısı: Göz parlamaz (henüz belli değil + down), uyarı eye.alert\'te', () => {
    const at = (day) => new Date(2026, 8, 1 + day - 1, 9).toISOString()
    const wk = (day, lm) => ({ type: 'va-weekly', eye: 'R', logMAR: lm, date: at(day), algorithm: 'descent-zest-v4', distanceTracked: true, meanDistanceMm: 400, correction: 'none' })
    const tests = [wk(1, 0.1), wk(8, 0.05), wk(15, 0.05), wk(22, 0.05), wk(29, 0.2), wk(36, 0.21), wk(43, 0.2)]
    const g = growthCenter({ tests, now: new Date(2026, 9, 13, 20) })
    expect(g.eye.alert).toBe('yellow')
    expect(g.areas.goz).toMatchObject({ verdict: 'unclear', down: true, value: { kind: 'eye' } })
  })

  it('Ö-1: yalnız yoga (nasıl hissettin) hiçbir alanı parlatmaz', () => {
    const sessions = [0, 2, 4, 6, 8, 10].map((d) => ({ type: 'yoga', lesson: 1, date: ago(d, 19), seconds: 600, planned: 600, completed: true, reachedClosing: true, before: 7, after: 3 }))
    const g = growthCenter({ sessions, now: NOW })
    expect(g.effects.find((e) => e.module === 'yoga')).toMatchObject({ feelOnly: true, sig: true })
    expect(g.areas.nefes.verdict).not.toBe('better')
    expect(g.areas.nefes.hasData).toBe(true)
  })

  it('karışık: bir alanda biri iyileşip öteki gerileyince "henüz belli değil" ve mixed (better + worse → null)', () => {
    const sessions = []
    // Hızlı Bakış (Dikkat/focus): eşik 200 → 150 ms (düşük daha iyi → iyileşme)
    for (let d = 30; d >= 23; d--) sessions.push({ type: 'quick-look', date: ago(d, 12), threshold: d % 2 ? 200 : 205 })
    for (let d = 22; d >= 1; d--) sessions.push({ type: 'quick-look', date: ago(d, 12), threshold: 150 })
    // Fark Ettin mi? (Dikkat/awareness): isabet %80 → %40 (gerileme)
    for (let d = 30; d >= 23; d--) sessions.push({ type: 'street', date: ago(d, 13), noticed: 4, asked: 5 })
    for (let d = 22; d >= 1; d--) sessions.push({ type: 'street', date: ago(d, 13), noticed: 2, asked: 5 })
    const g = growthCenter({ sessions, now: NOW })
    const m = growthMap({ sessions, now: NOW })
    expect(m.domains.focus.status).toBe('up')
    expect(m.domains.awareness.status).toBe('down')
    expect(g.areas.dikkat).toMatchObject({ verdict: 'unclear', mixed: true })
  })

  it('Apple Sağlık: kendi ortancasına ulaşan gün Hareket şeridinde; ilk gün ve "veri var" adımdan etkilenmez (Ö-9)', () => {
    const rows = Array.from({ length: 60 }, (_, i) => ({ date: key(59 - i), steps: i % 2 ? 9000 : 3000 }))
    const health = { hasData: true, stepRows: rows, today: rows.at(-1) }
    const blink = { type: 'blink', date: ago(2, 9) }
    const g = growthCenter({ sessions: [blink], health, now: NOW })
    const g0 = growthCenter({ sessions: [blink], now: NOW })
    expect(g.sinceStart).toBe(g0.sinceStart)
    expect(g.areas.hareket.days28).toBe(14) // 28 günün yarısı ortancanın (6000) üstünde
    expect(g.areas.hareket.sources[0]).toMatchObject({ key: 'health:steps', days: 14 })
    expect(g0.areas.hareket).toMatchObject({ days28: 0, hasData: false, value: null })
    expect(g0.steps).toBeNull()
    // 7'den az adımlı gün: ortanca yok, şeride girmez, satırda bugünkü adım görünür ("başlangıç")
    const few = { hasData: true, stepRows: rows.slice(-5), today: rows.at(-1) }
    const g5 = growthCenter({ sessions: [blink], health: few, now: NOW })
    expect(g5.areas.hareket).toMatchObject({ days28: 0, verdict: 'start', value: { kind: 'steps' } })
  })

  it('word ve line (PLAN §3.1): sözcük tek yerden; gerilemede sözcük yok, yalnız sayı (sözü sahibe soruldu)', () => {
    const g = growthCenter(day30())
    expect(g.areas.dikkat).toMatchObject({ word: 'başlangıcından iyi', line: 'Dikkat: 4 → 6 harf, başlangıcından iyi' })
    expect(g.areas.goz.word).toBe('değişim yok')
    expect(growthCenter({ now: NOW }).areas.nefes).toMatchObject({ word: 'başlangıç', line: 'Nefes: başlangıç' })
    // göz uyarısı (doğrulanmış gerileme): "henüz belli değil" yazılmaz; çip yalnız sayıyı taşır
    const at = (day) => new Date(2026, 8, 1 + day - 1, 9).toISOString()
    const wk = (day, lm) => ({ type: 'va-weekly', eye: 'R', logMAR: lm, date: at(day), algorithm: 'descent-zest-v4', distanceTracked: true, meanDistanceMm: 400, correction: 'none' })
    const y = growthCenter({ tests: [wk(1, 0.1), wk(8, 0.05), wk(15, 0.05), wk(22, 0.05), wk(29, 0.2), wk(36, 0.21), wk(43, 0.2)], now: new Date(2026, 9, 13, 20) })
    expect(y.areas.goz).toMatchObject({ verdict: 'unclear', down: true, word: null })
    expect(y.areas.goz.line).toMatch(/^Göz: E testi \d,\d\d → \d,\d\d$/)
  })

  it('adım: bugün adım kaydı yoksa (0) "Bugün 0 adım" yazılmaz; adım sayısı Nef değişkenlerine girmez', () => {
    const rows = Array.from({ length: 30 }, (_, i) => ({ date: key(29 - i), steps: i === 29 ? 0 : 5000 + i * 101 }))
    const g = growthCenter({ sessions: [{ type: 'blink', date: ago(1, 9) }], health: { hasData: true, stepRows: rows, today: rows.at(-1) }, now: NOW })
    expect(g.areas.hareket.measures.some((m) => m.kind === 'steps')).toBe(false)
    expect(JSON.stringify(g.areas.hareket)).not.toContain('0 adım')
    expect(JSON.stringify(g.nef)).not.toMatch(/\d{4}/)
  })

  it('Nef cümlesi: şablon anahtarı ve değişkenleri onaylı F.4 sırasıyla (metin G2\'de)', () => {
    expect(growthCenter({ now: NOW }).nef).toMatchObject({ sentenceKey: 'suggest', step: 9 })
    const s = day30()
    // iris yeniden sorma günü geldi (başlangıç 30 gün önce, yeniden sorulmadı): kilometre taşı
    expect(growthCenter(s).nef).toMatchObject({ sentenceKey: 'milestone', step: 2, vars: { what: 'irisRecheck' } })
    // yeniden sorulduysa: başlangıcından iyi olan ilk alan
    const done = { ...s, profile: { ...s.profile, iris: { ...s.profile.iris, recheck: { date: ago(1, 8), blinks: 6 } } } }
    expect(growthCenter(done).nef).toMatchObject({ sentenceKey: 'newChange', step: 5, vars: { area: 'dikkat', value: '4 → 6 harf' } })
    // yürüyüş eşliği her şeyin önünde (göz uyarısı hariç)
    expect(growthCenter({ ...done, walk: { active: true, minutes: 12, cadence: 104, steps: 1500 } }).nef).toMatchObject({ sentenceKey: 'walk', vars: { minutes: 12, cadence: 104 } })
    expect(JSON.stringify(growthCenter({ ...done, walk: { active: true, minutes: 12, cadence: 104, steps: 1500 } }).nef)).not.toContain('1500')
    // 1. gün, İlk Bakış kırpması var
    const fl = { firstLook: { blinks: 3, seconds: 20, method: 'camera', date: ago(0, 8) } }
    expect(growthCenter({ sessions: [{ type: 'blink', date: ago(0, 9) }], profile: fl, now: NOW }).nef).toMatchObject({ sentenceKey: 'firstDay', step: 1, vars: { blinks: 3, seconds: 20, recheckDay: 28 } })
    // 3 ve üstü kayıtsız günden sonra dönüş
    const back = [{ type: 'blink', date: ago(10, 9) }, { type: 'blink', date: ago(0, 9) }]
    expect(growthCenter({ sessions: back, now: NOW }).nef).toMatchObject({ sentenceKey: 'returned', step: 3, vars: { gapDays: 9 } })
    expect(growthCenter({ sessions: [{ type: 'blink', date: ago(3, 9) }, { type: 'blink', date: ago(0, 9) }], now: NOW }).nef.sentenceKey).toBe('suggest') // 2 gün ara: eşik altı
    // iris yeniden sorma ≤ 3 gün sonra
    const soon = { iris: { baseline: { date: ago(26, 8), stressNow: 2 } } }
    expect(growthCenter({ profile: soon, now: NOW }).nef).toMatchObject({ sentenceKey: 'soon', step: 8, vars: { inDays: 2 } })
  })

  it('evre ve pencere adı (plan §13, Kü-5)', () => {
    expect([1, 7, 8, 28, 29].map((n) => phaseOf(n).phase)).toEqual(['week', 'week', 'month', 'month', 'rolling'])
    expect(phaseOf(3).win).toBe(7)
    expect(windowLabel(20)).toBe('başladığından beri')
    expect(windowLabel(40)).toBe('son 28 gün')
  })

  it('ekran metninde "beyin", "tanıma" ve dört sözcük dışında hüküm yok; girdi değişmez; duvar saatinden bağımsız', () => {
    const rnd = mulberry32(21)
    vi.useFakeTimers({ toFake: ['Date'] })
    try {
      for (let i = 0; i < 80; i++) {
        const s = deepFreeze(makeStore(rnd))
        vi.setSystemTime(s.now)
        const a = growthCenter(s)
        vi.setSystemTime(new Date(2031, 0, 2, 3, 4))
        expect(growthCenter(s)).toEqual(a)
        const txt = JSON.stringify(a)
        expect(txt).not.toMatch(/beyin|tanıma|iyileş|geriliyor|gerisinde/i)
      }
    } finally {
      vi.useRealTimers()
    }
  })
})
