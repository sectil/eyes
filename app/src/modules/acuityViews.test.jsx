// Haftalık ve günlük E testi ekran bağlantısı (modules/weekly/view.jsx, modules/daily/view.jsx): AcuityTest'e giden
// başlangıç değerleri (gözlük ön seçimi S10, atlanacak gözler S3), her gözün hemen kaydı (S4) ve Ana sayfa satırı.
// AcuityTest yerine props'ları kaydeden sahte bileşen kullanılır (ekranın kendisi başka dosyada test edilir).
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '../test/fakeDom.js'
import { act } from 'react'
import { WEEKLY_SUB, WEEKLY_DONE } from '../lib/today.js'
import { dayKey } from '../lib/calendar.js'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
const seen = vi.hoisted(() => [])
vi.mock('../screens/AcuityTest.jsx', () => ({
  default: (props) => {
    seen.push(props)
    return null
  },
}))

const { createRoot } = await import('react-dom/client')
const { default: weekly } = await import('./weekly/view.jsx')
const { default: daily } = await import('./daily/view.jsx')

const hoursAgo = (h) => new Date(Date.now() - h * 3600000).toISOString()
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString()
const rec = (type, eye, correction, date) => ({ type, eye, correction, logMAR: 0.1, date })
// Bugünün kaydı: gece yarısına yakın koşuda dünkü güne düşmesin diye 0 saat önce
const todayRec = (type, eye, correction = 'reading') => rec(type, eye, correction, hoursAgo(0))

function ctxOf({ tests = [], profile, screening } = {}) {
  const calls = { added: [], refresh: 0, saveTests: [], go: [] }
  return {
    tests,
    settings: { profile, screening },
    common: { calibration: { pxPerMm: 6, dpr: 3 }, distanceCal: null, onCancel: () => {} },
    store: { addTest: (r) => (calls.added.push(r), r) },
    refresh: () => calls.refresh++,
    saveTests: (r) => calls.saveTests.push(r),
    go: (s) => calls.go.push(s),
    calls,
  }
}
async function mount(view, ctx) {
  const root = createRoot(document.createElement('div'))
  await act(async () => root.render(view.render(ctx)))
  return root
}
const last = () => seen.at(-1)

beforeEach(() => {
  seen.length = 0
})

describe('gözlük ön seçimi AcuityTest\'e gider (karar S10)', () => {
  for (const [name, view, plan] of [['haftalık', weekly, 'weekly'], ['günlük', daily, 'daily']]) {
    it(`${name}: profil "reading" → ön seçili; "distance" ve "contacts-multi" → seçili değil`, async () => {
      let root = await mount(view, ctxOf({ profile: { correction: 'reading' } }))
      expect(last()).toMatchObject({ plan, defaultCorrection: 'reading', correctionSource: 'profile', lastCorrection: null, skipEyes: [] })
      root.unmount()
      for (const answer of ['distance', 'contacts-multi']) {
        root = await mount(view, ctxOf({ profile: { correction: answer } }))
        expect(last().defaultCorrection).toBeNull()
        root.unmount()
      }
    })
  }

  it('son E testi profile üstün; eski "glasses" kaydı ön seçilmez, lastCorrection eski değeri taşır', async () => {
    let root = await mount(weekly, ctxOf({ tests: [rec('va-daily', 'R', 'none', daysAgo(2))], profile: { correction: 'reading' } }))
    expect(last()).toMatchObject({ defaultCorrection: 'none', correctionSource: 'acuity', lastCorrection: 'none' })
    root.unmount()
    root = await mount(weekly, ctxOf({ tests: [rec('va-weekly', 'OU', 'glasses', daysAgo(9))], profile: { correction: 'reading' } }))
    expect(last()).toMatchObject({ defaultCorrection: null, lastCorrection: 'glasses' })
    root.unmount()
  })
})

describe('yarım gün: ilk eksik gözden başlanır (karar S3)', () => {
  it('haftalık: bugün sağ göz bitti → skipEyes ["R"]; gözlük bugünkü seçim; koşu günü ekrana gider (R-N2)', async () => {
    const root = await mount(weekly, ctxOf({ tests: [todayRec('va-weekly', 'R', 'progressive')], profile: { correction: 'none' } }))
    expect(last()).toMatchObject({ skipEyes: ['R'], defaultCorrection: 'progressive', runDay: dayKey(new Date()) })
    root.unmount()
  })
  it('yarım haftalıkta arada günlük test yapıldıysa gözlük yine haftalık koşunun seçimi (R-N4b)', async () => {
    const tests = [todayRec('va-weekly', 'R', 'reading'), todayRec('va-daily', 'R', 'none'), todayRec('va-daily', 'L', 'none')]
    const root = await mount(weekly, ctxOf({ tests }))
    expect(last()).toMatchObject({ skipEyes: ['R'], defaultCorrection: 'reading', correctionSource: 'acuity' })
    root.unmount()
  })
  it('günlük: bugün sağ göz bitti → skipEyes ["R"]; haftalık kaydı günlükte göz atlatmaz', async () => {
    let root = await mount(daily, ctxOf({ tests: [todayRec('va-daily', 'R')] }))
    expect(last().skipEyes).toEqual(['R'])
    root.unmount()
    root = await mount(daily, ctxOf({ tests: [todayRec('va-weekly', 'R')] }))
    expect(last().skipEyes).toEqual([])
    root.unmount()
  })

  it('başlangıç değerleri açılışta donar: göz kaydedilip tests değişince ekran ortasında kaymaz', async () => {
    const ctx = ctxOf({ profile: { correction: 'reading' } })
    const root = await mount(weekly, ctx)
    const first = last()
    // App: onSaveEye → store.addTest → refresh → yeni tests ile yeniden çizim
    const after = { ...ctx, tests: [todayRec('va-weekly', 'R', 'none')] }
    await act(async () => root.render(weekly.render(after)))
    expect(seen.length).toBeGreaterThan(1)
    expect(last().skipEyes).toEqual([])
    expect(last().defaultCorrection).toBe('reading')
    expect(last().lastCorrection).toBe(first.lastCorrection)
    root.unmount()
  })
})

describe('biten göz hemen kaydedilir (karar S4)', () => {
  it('onSaveEye her gözü bir kez yazar ve yeniler; onFinish yalnız kaydedilmemişleri yazar', async () => {
    const ctx = ctxOf()
    const root = await mount(weekly, ctx)
    const R = { type: 'va-weekly', eye: 'R', logMAR: 0.1 }
    const L = { type: 'va-weekly', eye: 'L', logMAR: 0.0 }
    const OU = { type: 'va-weekly', eye: 'OU', logMAR: -0.1 }
    last().onSaveEye(R)
    last().onSaveEye({ ...R })
    expect(ctx.calls.added).toEqual([R])
    expect(ctx.calls.refresh).toBe(1)
    last().onSaveEye(L)
    last().onFinish([R, L, OU])
    expect(ctx.calls.saveTests).toEqual([[OU]])
    expect(ctx.calls.added).toEqual([R, L])
    root.unmount()
  })

  it('hepsi kaydedildiyse onFinish yalnız Gelişim\'i açar; onSaveEye çağırmayan akışta sonuçlar sonda yazılır', async () => {
    const ctx = ctxOf()
    let root = await mount(daily, ctx)
    const R = { type: 'va-daily', eye: 'R' }
    const L = { type: 'va-daily', eye: 'L' }
    last().onSaveEye(R)
    last().onSaveEye(L)
    last().onFinish([R, L])
    expect(ctx.calls.saveTests).toEqual([])
    expect(ctx.calls.go).toEqual(['progress'])
    root.unmount()
    const old = ctxOf()
    root = await mount(daily, old)
    last().onFinish([R, L])
    expect(old.calls.saveTests).toEqual([[R, L]])
    root.unmount()
  })
})

describe('Ana sayfa satırı (E0 metni)', () => {
  it('haftalık: ilk kez / zamanı geldi → üç bölüm; yarım gün → kalanlar; bu hafta bitti → tamam', () => {
    expect(weekly.sub(ctxOf())).toBe(WEEKLY_SUB)
    expect(WEEKLY_SUB).toBe('3 bölüm · sağ, sol, iki göz')
    expect(weekly.badge(ctxOf())).toBe('Bu hafta')
    expect(weekly.sub(ctxOf({ tests: [todayRec('va-weekly', 'R')] }))).toBe('Kalan: Sol göz, İki göz')
    const week = ['R', 'L', 'OU'].map((e) => rec('va-weekly', e, 'none', daysAgo(2)))
    expect(weekly.sub(ctxOf({ tests: week }))).toBe(WEEKLY_DONE)
    expect(WEEKLY_DONE).toBe('✓ Bu hafta tamam')
    expect(weekly.badge(ctxOf({ tests: week }))).toBeNull()
    // eski yarım kayıt "bu hafta" rozetini kaldırmaz
    expect(weekly.badge(ctxOf({ tests: [rec('va-weekly', 'OU', 'none', daysAgo(2))] }))).toBe('Bu hafta')
  })
  it('günlük: yarım gün → "Kalan: Sol göz"', () => {
    expect(daily.sub(ctxOf({ tests: [todayRec('va-daily', 'R')] }))).toBe('Kalan: Sol göz')
    expect(daily.sub(ctxOf({ tests: ['R', 'L'].map((e) => todayRec('va-daily', e)) }))).not.toMatch(/Kalan/)
  })
})
