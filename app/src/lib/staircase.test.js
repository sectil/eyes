import { describe, it, expect } from 'vitest'
import { createDescent, createAcuityStaircase, finalizeEstimate, remainingDisplay, FAST_STEP, FINE_STEP, MAX_JUMP, START_LOGMAR } from './staircase.js'
import { createZest, pCorrect, shouldStop, PLANS, GUESS, LAPSE, SLOPE, UNSEEN } from './zest.js'
import { logMARForHeight, renderSpec, smallestDrawableLogMAR } from './optotype.js'

// Tekrarlanabilir rastgele sayı üreteci (mulberry32)
function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Gözlemci modelleri: algoritmanın varsaydığı model ve ondan farklı (daha yayvan eğim,
// daha çok dikkat hatası) bir gözlemci — varsayımlar tutmazsa da sonuç bozulmamalı.
const observerModel = (x, t) => pCorrect(x, t)
const observerMismatch = (x, t) => GUESS + (1 - GUESS - 0.05) / (1 + Math.exp(-(x - t) / 0.08))

// Eski yöntem: saf ZEST (öncül 0,4 ± 0,4), 3 ısınma sayılmaz, eski planlar
const OLD_PLANS = {
  daily: { trials: 20, minTrials: 10, stopSd: 0.1 },
  weekly: { trials: 36, minTrials: 18, stopSd: 0.07 },
}

function runOld(theta, plan, r, observer) {
  const z = createZest({ minX: -0.3, maxX: 1.3 })
  for (;;) {
    const x = z.next()
    z.update(x, r() < observer(x, theta))
    const e = z.estimate()
    if (shouldStop(e, plan)) return { est: e.logMAR, n: e.trials }
  }
}

function runNew(theta, plan, r, observer, trace) {
  const s = createAcuityStaircase(plan, { minX: -0.3, maxX: 1.3 })
  while (!s.done()) {
    const { logMAR, phase } = s.next()
    trace?.push({ x: logMAR, phase })
    s.update(logMAR, r() < observer(logMAR, theta))
  }
  const e = s.estimate()
  return { est: e.logMAR, n: e.trials }
}

const THETAS = [-0.1, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]

function simulate(run, perTheta, seed0) {
  const errs = []
  let n = 0
  let seed = seed0
  for (const th of THETAS) {
    for (let i = 0; i < perTheta; i++) {
      const out = run(th, rng(seed++))
      errs.push(out.est - th)
      n += out.n
    }
  }
  const bias = errs.reduce((a, b) => a + b, 0) / errs.length
  const sd = Math.sqrt(errs.reduce((a, b) => a + (b - bias) ** 2, 0) / errs.length)
  return { users: errs.length, bias: +bias.toFixed(4), sd: +sd.toFixed(4), meanTrials: +(n / errs.length).toFixed(1) }
}

describe('createDescent (Evre A: iniş)', () => {
  it('büyükten başlar, her doğruda hızlı adımla küçülür', () => {
    const d = createDescent()
    expect(d.level).toBe(START_LOGMAR)
    d.update(true)
    expect(d.level).toBeCloseTo(START_LOGMAR - FAST_STEP, 6)
    expect(d.mode).toBe('fast')
  })

  it('ilk yanlışta aynı satırda kalır ve satır kuralına geçer', () => {
    const d = createDescent()
    d.update(true) // 0,6
    d.update(false)
    expect(d.mode).toBe('row')
    expect(d.level).toBeCloseTo(0.6, 6)
    expect(d.done).toBe(false)
  })

  it('satır kuralı: 2 doğru → 0,1 küçül; 2 yanlış → iniş biter', () => {
    const d = createDescent()
    d.update(false) // 0,8'de 1 yanlış
    d.update(true)
    d.update(true) // 2 doğru → geçti
    expect(d.level).toBeCloseTo(0.8 - FINE_STEP, 6)
    expect(d.lastPassed).toBeCloseTo(0.8, 6)
    d.update(false)
    d.update(true)
    d.update(false) // 1 doğru, 2 yanlış
    expect(d.done).toBe(true)
    expect(d.reason).toBe('fail')
    expect(d.lastPassed).toBeCloseTo(0.8, 6)
  })

  it('bir satırda en fazla 3 harf gösterilir', () => {
    const r = rng(5)
    for (let k = 0; k < 300; k++) {
      const d = createDescent()
      const perLevel = new Map()
      while (!d.done) {
        perLevel.set(d.level, (perLevel.get(d.level) ?? 0) + 1)
        d.update(r() < 0.6)
      }
      for (const n of perLevel.values()) expect(n).toBeLessThanOrEqual(3)
    }
  })

  it('boyut inişte asla büyümez', () => {
    const r = rng(3)
    for (let k = 0; k < 200; k++) {
      const d = createDescent({ minX: -0.25 })
      let prev = d.level
      while (!d.done) {
        d.update(r() < 0.7)
        expect(d.level).toBeLessThanOrEqual(prev + 1e-9)
        prev = d.level
      }
    }
  })

  it('ekranın en küçük boyutuna inince taban olarak biter', () => {
    const d = createDescent({ minX: -0.25 })
    for (let i = 0; i < 30 && !d.done; i++) d.update(true)
    expect(d.done).toBe(true)
    expect(d.reason).toBe('floor')
    expect(d.lastPassed).toBeCloseTo(-0.25, 6)
  })

  it('piksel yuvarlaması iki satırı aynı boyutta çizecekse bir sonraki gerçekten küçük boyuta atlar', () => {
    // 460 ppi / 40 cm örneği: 0,2 ve 0,1 hedefleri ikisi de 0,153 olarak çizilir
    const grid = [-0.32, -0.02, 0.153, 0.278, 0.375, 0.454, 0.521, 0.579, 0.63, 0.676, 0.717, 0.755, 0.79]
    const quantize = (x) => grid.reduce((best, g) => (Math.abs(g - x) < Math.abs(best - x) ? g : best), grid[0])
    const d = createDescent({ start: 0.2, fastStep: 0.1, quantize })
    expect(quantize(0.2)).toBe(0.153)
    expect(quantize(0.1)).toBe(0.153)
    d.update(true)
    d.update(true)
    expect(d.level).toBeCloseTo(0.0, 6) // 0,1 atlandı
    expect(quantize(d.level)).toBeLessThan(quantize(0.2))
  })

  it('"3 harfte 2 doğru" kuralında şansla geçme olasılığı %15,6 (tek doğru olsa %25)', () => {
    // Satırı hiç göremeyen biri: her harfte p = 0,25. Tüm cevap dizilerini say.
    let pass = 0
    const walk = (c, w, p) => {
      if (c >= 2) return void (pass += p)
      if (w >= 2) return
      walk(c + 1, w, p * GUESS)
      walk(c, w + 1, p * (1 - GUESS))
    }
    walk(0, 0, 1)
    expect(pass).toBeCloseTo(0.15625, 5)
  })
})

describe('createAcuityStaircase (iniş + ince ayar)', () => {
  it('inişte boyut hiç büyümez; ince ayarda sıçrama ≤ 0,2 logMAR', () => {
    for (let s = 0; s < 120; s++) {
      const trace = []
      const theta = -0.1 + (s % 11) * 0.1
      runNew(theta, PLANS.daily, rng(500 + s), observerModel, trace)
      for (let i = 1; i < trace.length; i++) {
        const d = trace[i].x - trace[i - 1].x
        if (trace[i].phase === 'descent') expect(d).toBeLessThanOrEqual(1e-9)
        expect(Math.abs(d)).toBeLessThanOrEqual(MAX_JUMP + 1e-9)
      }
      // İniş her zaman ince ayardan önce gelir
      const firstFine = trace.findIndex((t) => t.phase === 'fine')
      expect(trace.slice(firstFine).every((t) => t.phase === 'fine')).toBe(true)
    }
  })

  it('deneme sayısı planın alt/üst sınırında kalır ve ince ayar en az minFine deneme alır', () => {
    for (const plan of [PLANS.daily, PLANS.weekly]) {
      for (let s = 0; s < 40; s++) {
        const st = createAcuityStaircase(plan)
        const r = rng(900 + s)
        const theta = -0.1 + (s % 11) * 0.1
        while (!st.done()) {
          const { logMAR } = st.next()
          st.update(logMAR, r() < observerMismatch(logMAR, theta))
        }
        const e = st.estimate()
        expect(e.trials).toBeGreaterThanOrEqual(plan.minTrials)
        expect(e.trials).toBeLessThanOrEqual(plan.trials)
        expect(e.fineTrials).toBeGreaterThanOrEqual(plan.minFine)
      }
    }
  })

  it('kalan deneme tahmini anlamlı: pozitif, üst sınırı aşmaz, bitince 0', () => {
    const st = createAcuityStaircase(PLANS.daily)
    const r = rng(11)
    while (!st.done()) {
      const p = st.progress()
      expect(p.remaining).toBeGreaterThan(0)
      expect(p.trials + p.remaining).toBeLessThanOrEqual(PLANS.daily.trials)
      expect(p.remainingMax).toBe(PLANS.daily.trials - p.trials)
      expect(p.remaining).toBeLessThanOrEqual(p.remainingMax)
      const { logMAR } = st.next()
      st.update(logMAR, r() < pCorrect(logMAR, 0.2))
    }
    expect(st.progress().phase).toBe('fine')
  })

  it('kalan harf yazısı: "son harfler" en fazla 2 harf sürer, "~N" hiç artmaz', () => {
    for (const plan of [PLANS.daily, PLANS.weekly]) {
      for (let s = 0; s < 400; s++) {
        const r = rng(7000 + s)
        const theta = -0.2 + r() * 1.2
        const st = createAcuityStaircase(plan)
        let shown = Infinity
        let prevCount = Infinity
        let last = 0
        let few = 0
        while (!st.done()) {
          const d = remainingDisplay(st.progress(), shown)
          shown = d.shown
          if (d.kind === 'last') last += 1
          if (d.kind === 'few') few += 1
          if (d.kind === 'approx') {
            expect(d.count).toBeGreaterThan(2)
            expect(d.count).toBeLessThanOrEqual(prevCount)
            prevCount = d.count
          } else prevCount = Math.min(prevCount, 2)
          const { logMAR } = st.next()
          st.update(logMAR, r() < observerMismatch(logMAR, theta))
        }
        expect(last).toBeLessThanOrEqual(2)
        expect(few).toBeLessThanOrEqual(plan.trials - plan.minTrials)
      }
    }
  })

  it('kalan harf yazısı: "son" yalnızca kesin üst sınır ≤ 2 iken; sayı büyürse eski sayıda kalır', () => {
    expect(remainingDisplay({ remaining: 2, remainingMax: 6 }).kind).toBe('few')
    expect(remainingDisplay({ remaining: 2, remainingMax: 2 })).toEqual({ kind: 'last', count: 2, shown: 2 })
    expect(remainingDisplay({ remaining: 1, remainingMax: 1 }).count).toBe(1)
    expect(remainingDisplay({ remaining: 14, remainingMax: 20 }, 10)).toEqual({ kind: 'approx', count: 10, shown: 10 })
    expect(remainingDisplay({ remaining: 9, remainingMax: 19 }, 10).count).toBe(9)
  })

  it('"Göremiyorum" inişte yanlış sayılır: satır kuralına geçer, boyut büyümez', () => {
    const st = createAcuityStaircase(PLANS.daily)
    const x0 = st.next().logMAR
    st.update(x0, UNSEEN)
    expect(st.next()).toEqual({ logMAR: x0, phase: 'descent' })
    st.update(x0, UNSEEN) // satırda 2 yanlış → iniş biter
    expect(st.next().phase).toBe('fine')
    expect(st.history().filter((h) => h.unseen)).toHaveLength(2)
  })

  it('hep doğru → tabana (en küçük harf) kısılır ve işaretlenir', () => {
    const st = createAcuityStaircase(PLANS.daily, { minX: -0.2 })
    while (!st.done()) st.update(st.next().logMAR, true)
    const e = st.estimate()
    expect(e.logMAR).toBeCloseTo(-0.2, 6)
    expect(e.atFloor).toBe(true)
  })

  for (const [name, resp] of [['yanlış', false], ['"Göremiyorum"', UNSEEN]]) {
    it(`hep ${name} → tavana kısılır ve işaretlenir`, () => {
      for (const plan of [PLANS.daily, PLANS.weekly]) {
        const st = createAcuityStaircase(plan)
        while (!st.done()) st.update(st.next().logMAR, resp)
        const e = st.estimate()
        expect(e.logMAR).toBe(1.3)
        expect(e.atCeiling).toBe(true)
        expect(finalizeEstimate(e, -0.2)).toEqual({ logMAR: 1.3, outOfRange: 'ceiling' })
      }
    })
  }

  it('bitmiş testte update yok sayılır', () => {
    const st = createAcuityStaircase(PLANS.daily)
    while (!st.done()) st.update(st.next().logMAR, true)
    const n = st.estimate().trials
    st.update(0.5, false)
    expect(st.estimate().trials).toBe(n)
  })
})

describe('finalizeEstimate (ekran tabanı, ölçüm mesafesinde)', () => {
  it('tahmin tabanın altındaysa tabana kısılır ve işaretlenir; üstündeyse dokunulmaz', () => {
    const e = { logMAR: -0.15, atFloor: false, atCeiling: false }
    expect(finalizeEstimate(e, -0.03)).toEqual({ logMAR: -0.03, outOfRange: 'floor' })
    expect(finalizeEstimate(e, -0.2)).toEqual({ logMAR: -0.15, outOfRange: null })
    expect(finalizeEstimate({ logMAR: -0.154, atFloor: true, atCeiling: false }, -0.03)).toEqual({ logMAR: -0.03, outOfRange: 'floor' })
    expect(finalizeEstimate({ logMAR: -0.154, atFloor: true, atCeiling: false })).toEqual({ logMAR: -0.154, outOfRange: 'floor' })
  })

  // AcuityTest.jsx akışının birebir taklidi: minX 40 cm'ye göre; harf canlı mesafede çizilir
  // (drawable → renderSpec → logMARForHeight); sonuç ölçüm mesafesindeki tabana göre sonlandırılır.
  function runLive(theta, px, dpr, mm, r) {
    const floorAt = (d) => smallestDrawableLogMAR(d, px, dpr)
    const drawable = (x) => Math.max(x, floorAt(mm))
    const quantize = (x) => {
      const sp = renderSpec(drawable(x), mm, px, dpr)
      return sp.drawable ? sp.realizedLogMAR : x
    }
    const minX = Math.max(-0.3, floorAt(400) + 0.02)
    const st = createAcuityStaircase(PLANS.daily, { minX, maxX: 1.3, quantize })
    while (!st.done()) {
      const sp = renderSpec(drawable(st.next().logMAR), mm, px, dpr)
      const shown = logMARForHeight(sp.heightCssPx / px, mm)
      st.update(shown, r() < observerModel(shown, theta))
    }
    const floorLimit = Math.min(1.3, Math.max(minX, floorAt(mm) + 0.02))
    return finalizeEstimate(st.estimate(), floorLimit)
  }

  for (const [name, px, dpr] of [['460 ppi, dpr 3', 460 / 25.4 / 3, 3], ['326 ppi, dpr 2', 326 / 25.4 / 2, 2]]) {
    it(`${name}, 30 cm: taban 40 cm'dekiyle aynı oranda işaretlenir, çizilemeyen boyut yazılmaz`, () => {
      const n = 200
      const rate = (mm, d) => {
        const floor = smallestDrawableLogMAR(mm, px, dpr)
        let flagged = 0
        for (let i = 0; i < n; i++) {
          const out = runLive(floor + d, px, dpr, mm, rng(4000 + i))
          if (out.outOfRange === 'floor') flagged += 1
          // Kaydedilen değer, o mesafede ekranın çizebildiği en küçük harften iyi olamaz
          expect(out.logMAR).toBeGreaterThanOrEqual(floor)
        }
        return flagged / n
      }
      const near = { below: rate(300, -0.1), at: rate(300, 0), above: rate(300, 0.1) }
      const ref = { below: rate(400, -0.1), at: rate(400, 0) }
      console.log(`[sim] taban ${name}: 30 cm ${JSON.stringify(near)} | 40 cm ${JSON.stringify(ref)}`)
      expect(near.below).toBeGreaterThanOrEqual(0.95)
      expect(Math.abs(near.at - ref.at)).toBeLessThan(0.15)
      expect(near.above).toBeLessThan(0.05)
    })
  }
})

describe('deneme sayısı gerekçesi', () => {
  it('eşikte deneme başına bilgi: 4 seçenek ≈ 0,76 × 8 seçenek (→ 18 yerine ≈24 deneme)', () => {
    // Fisher bilgisi I = p'(θ)² / (p(1−p)), F(θ)=0,5 noktasında; eğim aynı, λ aynı
    const info = (g) => {
      const p = g + (1 - g - LAPSE) * 0.5
      const dp = (1 - g - LAPSE) * 0.25
      return dp ** 2 / (p * (1 - p))
    }
    const ratio = info(0.25) / info(0.125)
    expect(ratio).toBeCloseTo(0.76, 2)
    expect(Math.round(18 / ratio)).toBe(24)
    expect(PLANS.daily.trials).toBe(24)
  })
})

// Simülasyon: 11 eşik (−0,1 … 0,9) × 50 = 550 sanal kullanıcı (her plan, her gözlemci).
// Kabul: |sapma| < 0,05 ve SD ≤ eski saf ZEST + 0,02.
describe('simülasyon: yeni (iniş + ince ayar) ve eski (saf ZEST)', () => {
  const report = []
  for (const [obsName, observer] of [['model', observerModel], ['uyumsuz', observerMismatch]]) {
    for (const planName of ['daily', 'weekly']) {
      it(`${planName} · ${obsName} gözlemci: sapma < 0,05 ve SD eskiden kötü değil`, () => {
        const oldR = simulate((th, r) => runOld(th, OLD_PLANS[planName], r, observer), 50, 1)
        const newR = simulate((th, r) => runNew(th, PLANS[planName], r, observer), 50, 1)
        report.push({ plan: planName, observer: obsName, old: oldR, new: newR })
        console.log(`[sim] ${planName} · ${obsName}: ESKİ ${JSON.stringify(oldR)} | YENİ ${JSON.stringify(newR)}`)
        expect(newR.users).toBeGreaterThanOrEqual(500)
        expect(Math.abs(newR.bias)).toBeLessThan(0.05)
        expect(newR.sd).toBeLessThanOrEqual(oldR.sd + 0.02)
      })
    }
  }

  it('gerçek piksel ızgarasıyla (460 ppi, dpr 3, 40 cm): sapma < 0,05 ve SD eskiden kötü değil', () => {
    const px = 6.04 // CSS px / mm
    const dpr = 3
    const floor = smallestDrawableLogMAR(400, px, dpr)
    const minX = Math.max(-0.3, floor + 0.02)
    const q = (x) => renderSpec(Math.max(x, floor), 400, px, dpr).realizedLogMAR
    const oldR = simulate((th, r) => {
      const z = createZest({ minX, maxX: 1.3 })
      for (;;) {
        const x = q(z.next())
        z.update(x, r() < observerModel(x, th))
        const e = z.estimate()
        if (shouldStop(e, OLD_PLANS.daily)) return { est: e.logMAR, n: e.trials }
      }
    }, 50, 21)
    const newR = simulate((th, r) => {
      const s = createAcuityStaircase(PLANS.daily, { minX, maxX: 1.3, quantize: q })
      while (!s.done()) {
        const x = q(s.next().logMAR)
        s.update(x, r() < observerModel(x, th))
      }
      const e = s.estimate()
      return { est: e.logMAR, n: e.trials }
    }, 50, 21)
    console.log(`[sim] piksel ızgarası daily: ESKİ ${JSON.stringify(oldR)} | YENİ ${JSON.stringify(newR)}`)
    expect(Math.abs(newR.bias)).toBeLessThan(0.05)
    expect(newR.sd).toBeLessThanOrEqual(oldR.sd + 0.02)
  })

  // "Göremiyorum": görmediği harfte tahmin etmeyip düğmeye basan gözlemci (u = basma olasılığı).
  // Kabul: model gözlemcide hep basanda |sapma| ≤ 0,01, bazen basanda tahmin edenden farkı ≤ 0,01;
  // uyumsuz gözlemcide tahmin edenden farkı < 0,015; tahmin gürültüsü eklenmez (SD ≤ tahmin eden).
  const presser = (slope, lapse, u) => (x, t, r) => {
    if (r() < lapse) return r() < GUESS
    if (r() < 1 / (1 + Math.exp(-(x - t) / slope))) return true
    if (r() < u) return UNSEEN
    return r() < GUESS
  }
  const asWrong = (resp) => (resp === UNSEEN ? false : resp)
  function runPresser(plan, obs, map = (v) => v) {
    return (theta, r) => {
      const st = createAcuityStaircase(plan)
      while (!st.done()) {
        const { logMAR } = st.next()
        st.update(logMAR, map(obs(logMAR, theta, r)))
      }
      const e = st.estimate()
      return { est: e.logMAR, n: e.trials }
    }
  }
  for (const planName of ['daily', 'weekly']) {
    it(`${planName} · Göremiyorum'a basan gözlemci: sonuç kötüye kaymaz, gürültü eklenmez`, () => {
      const plan = PLANS[planName]
      const lam = LAPSE / (1 - GUESS)
      const guesser = simulate(runPresser(plan, presser(SLOPE, lam, 0)), 50, 1)
      const always = simulate(runPresser(plan, presser(SLOPE, lam, 1)), 50, 1)
      const half = simulate(runPresser(plan, presser(SLOPE, lam, 0.5)), 50, 1)
      const oldRule = simulate(runPresser(plan, presser(SLOPE, lam, 1), asWrong), 50, 1)
      const mGuesser = simulate(runPresser(plan, presser(0.08, 0.05, 0)), 50, 1)
      const mAlways = simulate(runPresser(plan, presser(0.08, 0.05, 1)), 50, 1)
      console.log(`[sim] ${planName} Göremiyorum: tahmin eden ${JSON.stringify(guesser)} | hep basan ${JSON.stringify(always)} | yarı ${JSON.stringify(half)} | eski kural (yanlış) ${JSON.stringify(oldRule)} | uyumsuz: tahmin ${mGuesser.bias} / hep basan ${mAlways.bias}`)
      expect(Math.abs(always.bias)).toBeLessThanOrEqual(0.01)
      expect(Math.abs(half.bias - guesser.bias)).toBeLessThanOrEqual(0.01)
      expect(oldRule.bias).toBeGreaterThan(0.02) // eski kuralın sapması (düzeltmenin sınandığını gösterir)
      expect(Math.abs(mAlways.bias - mGuesser.bias)).toBeLessThan(0.015)
      expect(always.sd).toBeLessThanOrEqual(guesser.sd)
    })
  }

  it('eşit deneme sayısında (18) da iniş maliyeti küçük: SD ≤ eski + 0,02', () => {
    const fixed = { trials: 18, minTrials: 18, minFine: 0, stopSd: 0 }
    const oldR = simulate((th, r) => runOld(th, fixed, r, observerModel), 50, 7)
    const newR = simulate((th, r) => runNew(th, fixed, r, observerModel), 50, 7)
    console.log(`[sim] sabit 18 deneme: ESKİ ${JSON.stringify(oldR)} | YENİ ${JSON.stringify(newR)}`)
    expect(Math.abs(newR.bias)).toBeLessThan(0.05)
    expect(newR.sd).toBeLessThanOrEqual(oldR.sd + 0.02)
  })
})
