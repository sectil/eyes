// Yakın E testi ekran akışı (screens/AcuityTest.jsx; PLAN.md E1–E10, kararlar S1–S13). jsdom yok: test/fakeDom.js
// + react-dom/client. Kamera kancası, ses, parlaklık, ters renk ve harf çizimi sahte; zaman sahte saatle ilerler.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import '../test/fakeDom.js'
import { createElement as h, act } from 'react'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const cam = vi.hoisted(() => ({ state: { mm: null, face: false, error: null, ready: true }, opts: null, set: null, enabled: [], video: [] }))
vi.mock('../hooks/useFaceTracking.js', async () => {
  const React = await import('react')
  return {
    useFaceTracking: (opts = {}) => {
      const videoRef = React.useRef(null)
      const [s, set] = React.useState(cam.state)
      // RestBreak'in kendi TrueDepth takibi (trueDepth: true) kaydedilmez
      if (opts.trueDepth) return { videoRef, native: true, ready: true, error: null, face: false, mm: null }
      cam.set = (patch) => {
        cam.state = { ...cam.state, ...patch }
        set(cam.state)
      }
      cam.opts = opts
      cam.enabled.push(Boolean(opts.enabled))
      return { videoRef, native: opts.distanceCal?.method === 'truedepth', ...s }
    },
  }
})
const voice = vi.hoisted(() => ({ calls: [] }))
vi.mock('../lib/voiceCue.js', () => ({
  sayPhrase: (id) => voice.calls.push({ id, at: performance.now() }),
  preloadPhrases: () => {},
  cuePhrase: () => {},
}))
const hap = vi.hoisted(() => ({ calls: [] }))
vi.mock('../lib/native.js', async (orig) => ({ ...(await orig()), haptic: (k) => { hap.calls.push(k) } }))
const sfx = vi.hoisted(() => ({ unlock: 0, release: 0 }))
vi.mock('../lib/breathSfx.js', async (orig) => ({ ...(await orig()), unlockBreathSfx: () => { sfx.unlock++ }, releaseBreathSfx: () => { sfx.release++ } }))
vi.mock('../lib/cue.js', async (orig) => ({ ...(await orig()), unlockAudio: () => {}, cue: () => {} }))
const bright = vi.hoisted(() => ({ start: 0, end: 0, from: 0.42 }))
vi.mock('../lib/brightnessSession.js', () => ({
  createBrightnessSession: () => ({
    start: () => { bright.start++; return Promise.resolve() },
    end: () => { bright.end++; return Promise.resolve() },
    state: () => ({ active: bright.start > bright.end, applied: bright.start > 0, from: bright.from }),
  }),
}))
const inv = vi.hoisted(() => ({ cb: null, value: false }))
vi.mock('../lib/invertedColors.js', () => ({ watchInvertedColors: (cb) => { inv.cb = cb; cb(inv.value); return () => {} } }))
const seen = vi.hoisted(() => ({ ids: new Set(), marked: [] }))
vi.mock('../lib/howto.js', () => ({ howtoSeen: (id) => seen.ids.has(id), markHowtoSeen: (id) => { seen.ids.add(id); seen.marked.push(id) } }))
vi.mock('../lib/prefs.js', async (orig) => ({ ...(await orig()), getPrefs: () => ({ sound: true, haptics: true, voice: 'female' }) }))
const dirs = vi.hoisted(() => ({ queue: [], calls: 0 }))
vi.mock('../lib/zest.js', async (orig) => ({ ...(await orig()), randomDirection: () => { dirs.calls++; return dirs.queue.length ? dirs.queue.shift() : 'right' } }))
const ready = vi.hoisted(() => ({ calls: [] }))
vi.mock('../lib/acuityReadiness.js', async (orig) => {
  const m = await orig()
  return { ...m, acuityReadiness: (s) => { ready.calls.push(s); return m.acuityReadiness(s) } }
})
vi.mock('../components/TumblingE.jsx', async () => {
  const { createElement } = await import('react')
  return { default: ({ unit, direction, dpr }) => createElement('i', { 'data-testid': 'E', 'data-dir': direction, 'data-unit': String(unit), 'data-dpr': String(dpr) }) }
})

const { createRoot } = await import('react-dom/client')
const { default: AcuityTest } = await import('./AcuityTest.jsx')
const { PHRASE_MS, phraseText, phraseMs } = await import('../lib/acuityFlow.js')
const { weeklyStatus } = await import('../lib/today.js')

const LABEL = { left: 'Sol', up: 'Yukarı', down: 'Aşağı', right: 'Sağ' }

// Sahibin kuralı: söylenen her cümle, söylendiği anda ekranda aynen yazılı (yalnız sondaki nokta farklı olabilir).
// Her dokunuş ve zaman adımından sonra yeni ses çağrıları ekranla karşılaştırılır.
const bare = (t) => String(t ?? '').replace(/\.$/, '')
async function mount(props = {}, { wrap = null } = {}) {
  const container = document.createElement('div')
  const root = createRoot(container)
  let spokenChecked = voice.calls.length
  const checkSpoken = () => {
    for (; spokenChecked < voice.calls.length; spokenChecked++) {
      const id = voice.calls[spokenChecked].id
      const t = bare(phraseText(id))
      if (!t || !container.textContent.includes(t)) throw new Error(`söylenen cümle ekranda yok: ${id} "${t}"`)
    }
  }
  const calls = { save: [], finish: [], cancel: 0 }
  const all = {
    plan: 'daily',
    calibration: { pxPerMm: 6, dpr: 3 },
    distanceCal: null,
    lastCorrection: null,
    defaultCorrection: 'reading',
    correctionSource: 'profile',
    skipEyes: [],
    onSaveEye: (r) => { calls.save.push(r); return true },
    onFinish: (r) => calls.finish.push(r),
    onCancel: () => { calls.cancel++ },
    ...props,
  }
  await act(async () => root.render(wrap ? wrap(h(AcuityTest, all)) : h(AcuityTest, all)))
  checkSpoken()
  const q = (pred) => container.querySelectorAll(pred)
  const buttons = () => q((n) => n.nodeName === 'BUTTON')
  const btn = (text) => buttons().find((b) => b.textContent.includes(text)) ?? null
  const byLabel = (l) => q((n) => n.getAttribute?.('aria-label') === l)[0] ?? null
  const tap = async (el) => {
    if (!el) throw new Error('öğe yok')
    await act(async () => el.click())
    checkSpoken()
  }
  const tick = async (ms) => {
    await act(async () => { vi.advanceTimersByTime(ms) })
    checkVoice()
    checkSpoken()
  }
  const letter = () => q((n) => n.getAttribute?.('data-testid') === 'E')[0] ?? null
  const text = () => container.textContent
  // S13: bir cümle çalarken (süresi boyunca) harf ekranda olmamalı
  const checkVoice = () => {
    if (!letter()) return
    const t = performance.now()
    for (const c of voice.calls) {
      if (t >= c.at && t < c.at + (PHRASE_MS[c.id] ?? 3000)) throw new Error(`harf ekrandayken ses: ${c.id}`)
    }
  }
  return { container, root, calls, q, buttons, btn, byLabel, tap, tick, letter, text, props: all, checkSpoken }
}

// Göz bitene kadar cevapla (yönü doğru ya da hep sol)
async function runEye(r, { correct = true, max = 120 } = {}) {
  for (let i = 0; i < max; i++) {
    if (/Sıradaki|test bitti/.test(r.text())) return
    const e = r.letter()
    if (!e) {
      await r.tick(100)
      continue
    }
    await r.tap(r.byLabel(correct ? LABEL[e.getAttribute('data-dir')] : 'Sol'))
    await r.tick(260)
  }
  throw new Error('göz bitmedi')
}
const switches = (r) => r.q((n) => n.getAttribute?.('role') === 'switch')
async function selfStart(r) {
  for (const s of switches(r)) if (s.getAttribute('aria-checked') !== 'true') await r.tap(s)
  await r.tap(r.btn('Başla'))
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date', 'performance'] })
  cam.state = { mm: null, face: false, error: null, ready: true }
  cam.opts = null
  cam.enabled = []
  voice.calls = []
  hap.calls = []
  sfx.unlock = 0
  sfx.release = 0
  bright.start = 0
  bright.end = 0
  inv.value = false
  seen.ids = new Set(['acuity'])
  seen.marked = []
  dirs.queue = []
  dirs.calls = 0
  ready.calls = []
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
})

describe('biten göz hemen kaydedilir; çıkış onu silmez (S4, E10)', () => {
  it('kamerasız günlük: sağ göz bitince kaydedilir; 2. gözde ✕ → "Çık" yalnız yarım gözü atar', async () => {
    const r = await mount()
    expect(r.text()).toContain('Sağ göz')
    expect(r.text()).toContain('Sol gözünü avucunla ört, bastırma.')
    expect(r.btn('2 maddeyi onayla')).not.toBeNull()
    await selfStart(r)
    expect(bright.start).toBe(1) // S7: Başla'da parlaklık
    await runEye(r)
    expect(r.calls.save).toHaveLength(1)
    const rec = r.calls.save[0]
    expect(rec).toMatchObject({ type: 'va-daily', eye: 'R', correction: 'reading', algorithm: 'descent-zest-v4', distanceTracked: false, cantSee: 0, occlusion: { method: 'self-report', atGate: null }, brightness: { from: 0.42, forced: true } })
    expect(r.text()).toContain('Sağ göz · yakın, 40 cm')
    // E7 kökü acu-result: kısa ekranda sıkışma kuralları (styles/acuity.css) yalnız bu ekrana uygulanır
    expect(r.q((n) => /(^| )acu-result( |$)/.test(n.className)).length).toBe(1)
    expect(r.text()).toContain('Mesafe ölçülmedi · 40 cm varsayıldı')
    expect(r.text()).toContain('Örtme: senin onayın')
    // Göz sonucunda konuşulmaz ("uzağa bak" mola açılınca, mola başlığıyla birlikte söylenir)
    expect(voice.calls.at(-1).id).not.toBe('acuEyeDone')
    const beforeRest = voice.calls.length
    await r.tap(r.btn('Sıradaki: Sol göz'))
    expect(r.text()).toContain('Sol göz · sağ gözünü ört')
    expect(voice.calls.slice(beforeRest).map((c) => c.id)).toEqual(['exFarShort'])
    expect(r.text()).toContain('Uzağa bak')
    const before = ready.calls.length
    await r.tap(r.btn('Atla'))
    // Göz değişiminde sıfırlama geçişin içinde: sol gözün İLK çiziminde bile eski onay yok
    const leftCalls = ready.calls.slice(before).filter((s) => s.eye === 'L')
    expect(leftCalls.length).toBeGreaterThan(0)
    expect(leftCalls.every((s) => s.selfConfirm.cover === false && s.selfConfirm.distance === false)).toBe(true)
    expect(r.text()).toContain('Sağ gözünü avucunla ört, bastırma.')
    expect(switches(r).every((s) => s.getAttribute('aria-checked') === 'false')).toBe(true)
    // 2. gözde "?" kartları açar, ✕ hazırlığa döner
    await r.tap(r.byLabel('Nasıl yapılır?'))
    expect(r.text()).toContain('Telefonu 40\u00a0cm uzakta tut')
    await r.tap(r.byLabel('Kapat'))
    expect(r.text()).toContain('Sol göz')
    expect(r.text()).not.toContain('Telefonu 40\u00a0cm uzakta tut')
    // ✕ → çıkış sayfası; "Çık" kaydı silmez, yalnız çıkar
    await r.tap(r.byLabel('Testten çık'))
    expect(r.text()).toContain('Testten çıkılsın mı?')
    expect(r.text()).toContain("Sağ göz kaydedildi. Kalanlar Bugün'de bekler.")
    await r.tap(r.btn('Çık'))
    expect(r.calls.cancel).toBe(1)
    expect(r.calls.finish).toEqual([])
    expect(r.calls.save.map((x) => x.eye)).toEqual(['R'])
    expect(bright.end).toBeGreaterThan(0)
    await act(async () => r.root.unmount())
  })

  it('1. gözde deneme başlamadan ✕ sayfasız çıkar; deneme başladıysa sorar, "Teste dön" sürdürür', async () => {
    let r = await mount()
    await r.tap(r.byLabel('Testten çık'))
    expect(r.calls.cancel).toBe(1)
    expect(r.text()).not.toContain('Testten çıkılsın mı?')
    await act(async () => r.root.unmount())
    r = await mount()
    await selfStart(r)
    await r.tick(3800)
    expect(r.letter()).not.toBeNull()
    await r.tap(r.byLabel('Testten çık'))
    expect(r.text()).toContain('Bu gözün yarım ölçümü kaydedilmez.')
    await r.tap(r.btn('Teste dön'))
    expect(r.text()).not.toContain('Testten çıkılsın mı?')
    expect(r.calls.cancel).toBe(0)
    expect(r.letter()).not.toBeNull()
    await act(async () => r.root.unmount())
  })

  it('son gözden sonra özet; "Bitti" sonuçları onFinish\'e verir, parlaklık geri alınır', async () => {
    const r = await mount()
    await selfStart(r)
    await runEye(r)
    await r.tap(r.btn('Sıradaki'))
    await r.tap(r.btn('Atla'))
    await selfStart(r)
    await runEye(r)
    expect(r.text()).toContain('Kısa test bitti')
    expect(r.text()).toContain('Bilgi amaçlıdır; göz muayenesinin yerini tutmaz.')
    expect(r.calls.save.map((x) => x.eye)).toEqual(['R', 'L'])
    // Özette konuşulmaz (ekranda "Test bitti." cümlesi yok; S13 yalnız hazırlık, duraklama ve mola)
    expect(voice.calls.map((c) => c.id)).not.toContain('acuDone')
    expect(r.calls.save.every((x) => Number.isFinite(x.seconds) && x.seconds > 0)).toBe(true)
    const endsBefore = bright.end
    expect(endsBefore).toBeGreaterThan(0) // test bitti: parlaklık eski değere
    await r.tap(r.btn('Bitti'))
    expect(r.calls.finish).toHaveLength(1)
    expect(r.calls.finish[0].map((x) => x.eye)).toEqual(['R', 'L'])
    await act(async () => r.root.unmount())
  })
})

describe('kamera ve video (plan 1.7)', () => {
  it('tek ve kalıcı <video>: kart aç-kapa aynı öğe; çıkışta kamera kapanır', async () => {
    cam.state = { ...cam.state, mm: 400, face: true }
    const r = await mount({ distanceCal: { irisPxAt40: 100 } })
    const videos = () => r.q((n) => n.nodeName === 'VIDEO')
    expect(videos()).toHaveLength(1)
    const v = videos()[0]
    await r.tap(r.byLabel('Nasıl yapılır?'))
    expect(r.text()).toContain('Telefonu 40\u00a0cm uzakta tut')
    expect(videos()).toHaveLength(1)
    expect(videos()[0]).toBe(v)
    await r.tap(r.byLabel('Kapat'))
    expect(videos()[0]).toBe(v)
    expect(cam.enabled.at(-1)).toBe(true)
    await r.tap(r.byLabel('Testten çık'))
    expect(r.calls.cancel).toBe(1)
    expect(cam.enabled.at(-1)).toBe(false)
    await act(async () => r.root.unmount())
  })

  it('kamera hatası okunur: kendin-onay moduna geçilir ve kullanıcı bildirim görür (E4)', async () => {
    cam.state = { ...cam.state, error: 'permission' }
    const r = await mount({ distanceCal: { method: 'truedepth' } })
    expect(r.text()).toContain('Kamera açılamadı')
    expect(r.text()).toContain('Kamera izni kapalıysa: Ayarlar → Nefona → Kamera.')
    expect(r.btn('2 maddeyi onayla')).not.toBeNull()
    expect(r.btn('Yüzünü kameraya göster')).toBeNull()
    await act(async () => r.root.unmount())
  })

  it('kamera test ortasında durursa "Kamera durdu" → "Kamerasız devam"; kayıt kamerasız seriye', async () => {
    cam.state = { ...cam.state, mm: 400, face: true }
    const r = await mount({ distanceCal: { irisPxAt40: 100 } })
    await selfStart(r) // web yolu: örtme kişinin onayı, mesafe kamerayla
    await r.tick(3800)
    expect(r.letter()).not.toBeNull()
    await act(async () => cam.set({ error: 'load', mm: null }))
    await r.tick(500)
    expect(r.text()).toContain('Kamera durdu')
    expect(r.letter()).toBeNull()
    await r.tap(r.btn('Kamerasız devam'))
    expect(r.text()).not.toContain('Kamera durdu')
    await runEye(r)
    expect(r.calls.save[0]).toMatchObject({ eye: 'R', distanceTracked: false, camFailedMidTest: true, meanDistanceMm: null })
    expect(cam.enabled.at(-1)).toBe(false)
    await act(async () => r.root.unmount())
  })
})

describe('deneme: dondurma, bant, duraklama (H2, H3, E6)', () => {
  async function started() {
    cam.state = { ...cam.state, mm: 400, face: true }
    const r = await mount({ distanceCal: { irisPxAt40: 100 } })
    await selfStart(r)
    await r.tick(3800) // hazırlıktaki örtme cümlesi bitmeden harf gösterilmez (S13)
    return r
  }

  it('harf boyutu gösterildiği an donar: mesafe değişse de çizim birimi aynı kalır', async () => {
    dirs.queue = ['up', 'left', 'down']
    const r = await started()
    const u0 = r.letter().getAttribute('data-unit')
    // Harf kalibrasyondaki cihaz pikseli oranıyla çizilir (renderSpec ve 1 cihaz pikseli tabanı ile aynı)
    expect(r.letter().getAttribute('data-dpr')).toBe('3')
    await act(async () => cam.set({ mm: 430 }))
    await r.tick(100)
    expect(r.letter().getAttribute('data-unit')).toBe(u0)
    await act(async () => cam.set({ mm: 380 }))
    await r.tick(100)
    expect(r.letter().getAttribute('data-unit')).toBe(u0)
    await act(async () => r.root.unmount())
  })

  it('duraklamada oklar aria-disabled, harf gizli, tek emir; düzelince aynı hedef yeni yönle', async () => {
    dirs.queue = ['up', 'left', 'down', 'right']
    const r = await started()
    expect(r.letter().getAttribute('data-dir')).toBe('up')
    const unit = r.letter().getAttribute('data-unit')
    const arrows = () => ['Sol', 'Yukarı', 'Aşağı', 'Sağ'].map((l) => r.byLabel(l))
    expect(arrows().every((a) => a.getAttribute('aria-disabled') == null)).toBe(true)
    // alıştırma bandı 25–60 cm: 70 cm'de 300 ms sonra durur
    await act(async () => cam.set({ mm: 700 }))
    await r.tick(500)
    expect(r.letter()).toBeNull()
    expect(r.text()).toContain('Biraz yaklaştır · 40 cm')
    expect(r.text()).toContain('Test durdu. Düzelince sürer.')
    expect(arrows().every((a) => a.getAttribute('aria-disabled') === 'true')).toBe(true)
    expect(voice.calls.map((c) => c.id)).toContain('acuPaused')
    expect(hap.calls).toContain('warning')
    // soluk oka dokunuş sessizce kaybolmaz ama cevap sayılmaz
    hap.calls = []
    await r.tap(r.byLabel('Sağ'))
    expect(hap.calls).toEqual(['tick'])
    const callsBefore = dirs.calls
    await act(async () => cam.set({ mm: 400 }))
    await r.tick(3200) // 300 ms düzelme + "Test durdu" cümlesi bitene dek harf gösterilmez
    const e = r.letter()
    expect(e).not.toBeNull()
    expect(dirs.calls).toBe(callsBefore + 1) // yeni, bağımsız yön çekildi
    expect(e.getAttribute('data-dir')).toBe('left')
    expect(e.getAttribute('data-unit')).toBe(unit) // aynı hedef (alıştırma harfi, aynı mesafe)
    expect(r.text()).toContain('Alıştırma · sayılmaz')
    await act(async () => r.root.unmount())
  })

  it('alıştırmada "Göremiyorum" görünmez ama yeri korunur; sonra görünür', async () => {
    const r = await started()
    const cant = () => r.buttons().find((b) => b.textContent === 'Göremiyorum')
    expect(cant()).toBeTruthy()
    expect(cant().className).toContain('hidden')
    for (let i = 0; i < 2; i++) {
      await r.tap(r.byLabel(LABEL[r.letter().getAttribute('data-dir')]))
      await r.tick(700)
    }
    expect(cant().className).not.toContain('hidden')
    expect(r.text()).not.toContain('Alıştırma · sayılmaz')
    // Göremiyorum sayısı kayda
    await r.tap(cant())
    await r.tick(700)
    await r.tap(cant())
    await runEye(r)
    expect(r.calls.save[0].cantSee).toBe(2)
    expect(r.calls.save[0]).toMatchObject({ distanceTracked: true, meanDistanceMm: 400 })
    await act(async () => r.root.unmount())
  })

  it('sayılan harf 36–44 cm dışında cevaplanırsa sayılmaz ve nedeni harf yuvasında yazar; 44,5 cm\'de test durmaz, ses yok (S1)', async () => {
    const r = await started()
    for (let i = 0; i < 2; i++) {
      await r.tap(r.byLabel(LABEL[r.letter().getAttribute('data-dir')]))
      await r.tick(700)
    }
    const remBefore = r.text().match(/~\d+ harf kaldı/)?.[0]
    expect(r.letter()).not.toBeNull()
    // 44,5 cm: histerezis bandında test durmaz, cevap sayılmaz, yeni harf açılmaz
    await act(async () => cam.set({ mm: 445 }))
    hap.calls = []
    const v0 = voice.calls.length
    await r.tap(r.byLabel(LABEL[r.letter().getAttribute('data-dir')]))
    expect(r.letter()).toBeNull()
    expect(hap.calls).toEqual(['warning'])
    // nedeni hemen (R-S1-reject-silent): duraklama kartının emri, "Test durdu" satırı yok
    expect(r.text()).toContain('Biraz yaklaştır · 40 cm')
    // 44,5 cm'de kaldıkça kart aralıksız kalır (sayılmayan cevabın kartı → bekleyişin kartı); test durmaz, ses yok
    for (let i = 0; i < 20; i++) {
      await r.tick(100)
      expect(r.letter(), `${i}`).toBeNull()
      expect(r.text(), `${i}`).toContain('Biraz yaklaştır · 40 cm')
      expect(r.text(), `${i}`).not.toContain('Test durdu')
    }
    expect(voice.calls.length).toBe(v0)
    expect(hap.calls).toEqual(['warning'])
    const arrows = ['Sol', 'Yukarı', 'Aşağı', 'Sağ'].map((l) => r.byLabel(l))
    expect(arrows.every((a) => a.getAttribute('aria-disabled') === 'true')).toBe(true)
    const pill = r.q((n) => /(^| )acu-cm( |$)/.test(n.className))[0]
    expect(pill.className).toMatch(/(^| )out( |$)/)
    expect(pill.textContent).toBe('45 cm')
    expect(pill.getAttribute('role')).toBe('img')
    expect(pill.getAttribute('aria-label')).toBe('45 santimetre, biraz yaklaştır')
    expect(r.text()).toContain(remBefore)
    expect(r.calls.save).toHaveLength(0)
    // 36–44'e dönünce kart kalkar, harf beklemeden gelir (duraklama olmadığı için 300 ms düzelme ve "Test durdu" cümlesi yok)
    await act(async () => cam.set({ mm: 400 }))
    await r.tick(100)
    expect(r.letter()).not.toBeNull()
    expect(r.text()).not.toContain('Biraz yaklaştır · 40 cm')
    expect(pill.getAttribute('aria-label')).toBe('40 santimetre')
    await act(async () => r.root.unmount())
  })

  // Üçüncü doğrulama V3-N1: duraklamada tek kareler mesafesiz gelince kart "Yüzünü kameraya göster" ile "Biraz yaklaştır"
  // arasında 100 ms'de bir değişiyordu
  it('duraklamada tek karelik mesafe kaybı kartın emrini değiştirmez; yüz gerçekten kaybolunca değişir', async () => {
    const r = await started()
    const order = () => {
      const card = r.q((n) => /(^| )acu-pcard( |$)/.test(n.className))[0]
      return card?.textContent.includes('Test durdu') ? card.querySelectorAll((n) => n.nodeName === 'B')[0].textContent : null
    }
    const shown = []
    for (let i = 0; i < 60; i++) {
      await act(async () => cam.set({ mm: i % 3 === 2 ? null : 700 })) // alıştırma bandı 25–60 cm dışında; her 3. kare mesafesiz
      await r.tick(100)
      if (order() && shown.at(-1) !== order()) shown.push(order())
    }
    expect(shown).toEqual(['Biraz yaklaştır · 40 cm'])
    // yüz gerçekten kayboldu: kart kısa bir süre sonra (REASON_SWITCH_MS) yüzü söyler
    await act(async () => cam.set({ mm: null }))
    await r.tick(500)
    expect(order()).toBe('Yüzünü kameraya göster')
    expect(voice.calls.filter((c) => c.id === 'acuPaused')).toHaveLength(1)
    await act(async () => r.root.unmount())
  })
})

// Üçüncü inceleme: bant kenarında (35–36 / 44–45 cm) sessiz bekleyiş (R-S1-followup), mesafe yüzünden sayılmayan cevabın
// sessiz kalması (R-S1-reject-silent) ve sarı hapta "44 cm" (2. doğrulayıcı: cm yuvarlaması)
describe('üçüncü inceleme: bekleyiş ve sayılmayan cevabın nedeni', () => {
  async function counting(mmAfterWarmup) {
    cam.state = { ...cam.state, mm: 400, face: true }
    const r = await mount({ distanceCal: { irisPxAt40: 100 } })
    await selfStart(r)
    await r.tick(3800)
    await r.tap(r.byLabel(LABEL[r.letter().getAttribute('data-dir')]))
    await r.tick(700)
    await r.tap(r.byLabel(LABEL[r.letter().getAttribute('data-dir')]))
    // ikinci alıştırma cevabından hemen sonra: sayılan evre bu mesafede başlar
    if (mmAfterWarmup != null) await act(async () => cam.set({ mm: mmAfterWarmup }))
    return r
  }
  const pillOf = (r) => r.q((n) => /(^| )acu-cm( |$)/.test(n.className))[0]

  it('44,3 cm\'de sabit tutulunca: harf gelmez; ~1,2 sn sonra harf yuvasında "Biraz yaklaştır · 40 cm"; test durmaz, ses yok; hap "45 cm"', async () => {
    const r = await counting(443)
    const v0 = voice.calls.length
    hap.calls = []
    await r.tick(900)
    expect(r.letter()).toBeNull()
    expect(r.text()).not.toContain('Alıştırma · sayılmaz')
    expect(r.text()).not.toContain('Biraz yaklaştır · 40 cm') // bekleyiş henüz 1,2 sn değil
    const pill = pillOf(r)
    expect(pill.textContent).toBe('45 cm') // düz yuvarlama "44 cm" yazardı
    expect(pill.className).toMatch(/(^| )out( |$)/)
    expect(pill.getAttribute('aria-label')).toBe('45 santimetre, biraz yaklaştır')
    await r.tick(700)
    expect(r.text()).toContain('Biraz yaklaştır · 40 cm')
    expect(r.letter()).toBeNull()
    // kart kalır; test durmaz, ses ve titreşim yok
    await r.tick(5000)
    expect(r.text()).toContain('Biraz yaklaştır · 40 cm')
    expect(r.text()).not.toContain('Test durdu')
    expect(voice.calls.length).toBe(v0)
    expect(hap.calls).toEqual([])
    expect(r.calls.save).toHaveLength(0)
    // 35,5 cm: "Biraz uzaklaştır · 40 cm", hap "35 cm"
    await act(async () => cam.set({ mm: 355 }))
    await r.tick(1500)
    expect(r.letter()).toBeNull()
    expect(r.text()).toContain('Biraz uzaklaştır · 40 cm')
    expect(r.text()).not.toContain('Biraz yaklaştır · 40 cm')
    expect(r.text()).not.toContain('Test durdu')
    expect(pill.textContent).toBe('35 cm')
    expect(pill.getAttribute('aria-label')).toBe('35 santimetre, biraz uzaklaştır')
    expect(voice.calls.length).toBe(v0)
    // bantta: kart kalkar, harf aynı adımda gelir
    await act(async () => cam.set({ mm: 400 }))
    await r.tick(100)
    expect(r.letter()).not.toBeNull()
    expect(r.text()).not.toContain('Biraz uzaklaştır · 40 cm')
    await act(async () => r.root.unmount())
  })

  it('harf açıkken mesafe %5\'ten çok değişirse "Telefonu sabit tut"; cevap anında yüz yoksa "Yüzünü kameraya göster"; test durmaz, ses yok', async () => {
    const r = await counting(null)
    await r.tick(700)
    expect(r.letter()).not.toBeNull()
    const v0 = voice.calls.length
    // harf 40 cm'de açıldı, cevap 42,5 cm'de (%6): sayılmaz
    await act(async () => cam.set({ mm: 425 }))
    hap.calls = []
    await r.tap(r.byLabel(LABEL[r.letter().getAttribute('data-dir')]))
    expect(hap.calls).toEqual(['warning'])
    expect(r.letter()).toBeNull()
    expect(r.text()).toContain('Telefonu sabit tut')
    expect(r.text()).not.toContain('Test durdu')
    await r.tick(1000)
    expect(r.text()).toContain('Telefonu sabit tut') // okunabilsin: en az 1,2 sn
    expect(r.letter()).toBeNull()
    await r.tick(300)
    expect(r.text()).not.toContain('Telefonu sabit tut')
    expect(r.letter()).not.toBeNull()
    // yüz bir an kayboldu (cevap anında mesafe yok): sayılmaz, nedeni yazar; yüz dönünce test sürer
    await act(async () => cam.set({ mm: null }))
    await r.tap(r.byLabel(LABEL[r.letter().getAttribute('data-dir')]))
    await act(async () => cam.set({ mm: 425 }))
    expect(r.text()).toContain('Yüzünü kameraya göster')
    expect(r.text()).not.toContain('Test durdu')
    await r.tick(1300)
    expect(r.text()).not.toContain('Yüzünü kameraya göster')
    expect(r.letter()).not.toBeNull()
    expect(voice.calls.length).toBe(v0)
    expect(r.calls.save).toHaveLength(0)
    await act(async () => r.root.unmount())
  })
})

describe('hazırlık (E2)', () => {
  let r0 = null
  const radio = (t) => r0.q((n) => n.getAttribute?.('role') === 'radio' && n.textContent.includes(t))[0]
  it('ters renk açıkken test başlamaz (S12)', async () => {
    inv.value = true
    const r = await mount()
    for (const s of switches(r)) await r.tap(s)
    expect(r.text()).toContain('Renkleri ters çevirme açık.')
    const cta = r.btn('Renkleri ters çevirmeyi kapat')
    expect(cta.getAttribute('aria-disabled')).toBe('true')
    await r.tap(cta)
    await r.tick(600)
    expect(r.letter()).toBeNull()
    expect(bright.start).toBe(0)
    expect(hap.calls).toContain('warning')
    await act(async () => inv.cb(false))
    expect(r.btn('Başla')).not.toBeNull()
    await act(async () => r.root.unmount())
  })

  it('gözlük seçilmediyse düğme nedenini söyler; dokununca sayfa açılır, satıra dokununca 250 ms\'de kapanır (E3)', async () => {
    const r = (r0 = await mount({ defaultCorrection: null, correctionSource: null }))
    const cta = r.btn('Önce gözlüğünü seç')
    expect(cta).not.toBeNull()
    expect(cta.getAttribute('aria-describedby')).toBe('acu-row-glasses')
    expect(r.text()).toContain('Seçilmedi')
    expect(r.text()).not.toMatch(/başlayabilirsin/i)
    await r.tap(cta)
    expect(hap.calls).toContain('warning')
    expect(r.text()).toContain('Yakına bakarken ne takıyorsun?')
    expect(r.text()).not.toContain('Tamam')
    await r.tap(radio('Okuma gözlüğü'))
    await r.tick(300)
    expect(r.text()).not.toContain('Yakına bakarken ne takıyorsun?')
    expect(r.text()).toContain('Okuma gözlüğü')
    expect(r.btn('2 maddeyi onayla')).not.toBeNull()
    await act(async () => r.root.unmount())
  })

  it('aynı gözlük: numara sorusu; "Evet, yenilendi" → kayıtta newBaseline', async () => {
    const r = (r0 = await mount({ lastCorrection: 'reading', defaultCorrection: 'reading', correctionSource: 'acuity' }))
    expect(r.text()).toContain('Gözlük · geçen seferki')
    await r.tap(r.btn('Değiştir'))
    await r.tap(radio('Okuma gözlüğü'))
    await r.tick(600)
    expect(r.text()).toContain('Numaran geçen testten beri değişti mi?')
    await r.tap(r.btn('Evet, yenilendi'))
    expect(r.text()).not.toContain('Numaran geçen testten beri değişti mi?')
    await selfStart(r)
    await runEye(r)
    expect(r.calls.save[0]).toMatchObject({ correction: 'reading', newBaseline: true })
    await act(async () => r.root.unmount())
  })

  it('profil ön seçimi "reading" → satır dolu; yarım günde ilk eksik gözden başlar, gözlük kilitli', async () => {
    let r = await mount({ plan: 'weekly' })
    expect(r.text()).toContain('Gözlük · profilinden')
    expect(r.text()).toContain('1/3')
    await act(async () => r.root.unmount())
    r = await mount({ plan: 'weekly', skipEyes: ['R'], defaultCorrection: 'progressive', correctionSource: 'acuity' })
    expect(r.text()).toContain('Sol göz')
    expect(r.text()).toContain('2/3')
    expect(r.text()).toContain('Gözlük · test boyunca aynı')
    expect(r.text()).toContain('Progresif / bifokal')
    await act(async () => r.root.unmount())
  })

  it('ham kapak/derinlik satırları yalnız geliştirici derlemesinde (VITE_APP_BUILD=dev)', async () => {
    const frame = async () => {
      await act(async () => cam.opts.onFrame({ face: true, blinkLeft: 0.1, blinkRight: 0.2, ts: performance.now() }))
      await act(async () => cam.opts.onDepth({ eyesKnown: true, leftMm: 360, rightMm: 385, ts: performance.now() }))
    }
    cam.state = { ...cam.state, mm: 400, face: true }
    let r = await mount({ distanceCal: { method: 'truedepth' } })
    await frame()
    expect(r.text()).not.toContain('kapak ·')
    expect(r.text()).not.toContain('derinlik ·')
    await act(async () => r.root.unmount())
    vi.stubEnv('VITE_APP_BUILD', 'dev')
    r = await mount({ distanceCal: { method: 'truedepth' } })
    await frame()
    expect(r.text()).toContain('kapak · sağ 0,20 · sol 0,10')
    expect(r.text()).toContain('derinlik · sağ 385 mm · sol 360 mm')
    await act(async () => r.root.unmount())
  })

  it('TrueDepth: avuç doğrulanınca "Başla"; kayıtta yöntem camera-depth ve kapıdaki ham değerler', async () => {
    cam.state = { ...cam.state, mm: 400, face: true }
    const r = await mount({ distanceCal: { method: 'truedepth' } })
    const push = async (ms) => {
      for (let t = 0; t < ms; t += 100) {
        await act(async () => {
          cam.opts.onFrame({ face: true, blinkLeft: 0.12, blinkRight: 0.12, ts: performance.now() })
          cam.opts.onDepth({ eyesKnown: true, leftMm: 360, rightMm: 386, ts: performance.now() })
        })
        await r.tick(100)
      }
    }
    await push(1300)
    expect(r.text()).toContain('Örtme · kamera doğruladı')
    await r.tap(r.btn('Başla'))
    // deneme boyunca kareler sürer
    for (let i = 0; i < 200 && r.calls.save.length === 0; i++) {
      await act(async () => {
        cam.opts.onFrame({ face: true, blinkLeft: 0.12, blinkRight: 0.12, ts: performance.now() })
        cam.opts.onDepth({ eyesKnown: true, leftMm: 360, rightMm: 386, ts: performance.now() })
      })
      const e = r.letter()
      if (e) await r.tap(r.byLabel(LABEL[e.getAttribute('data-dir')]))
      await r.tick(260)
    }
    expect(r.calls.save[0]).toMatchObject({ eye: 'R', distanceTracked: true, occlusion: { method: 'camera-depth', atGate: { l: 0.12, r: 0.12, dl: 360, dr: 386, state: 'ok' } } })
    expect(r.text()).toContain('Örtme: kamera doğruladı')
    await act(async () => r.root.unmount())
  })
})

describe('nasıl yapılır (E1, S11)', () => {
  it('ilk kullanımda kartlar; "Bir daha gösterme" yok; "Anladım" kalıcı kapatır', async () => {
    seen.ids = new Set()
    const r = await mount()
    // "40 cm" bölünmez boşlukla (U+00A0): dar ekranda başlık "40 / cm" diye kırılmaz
    expect(r.text()).toContain('Telefonu 40\u00a0cm uzakta tut')
    expect(r.text()).not.toContain('Bir daha gösterme')
    await r.tap(r.btn('İleri'))
    expect(r.text()).toContain("E'nin açık tarafına kaydır")
    await r.tap(r.btn('İleri'))
    expect(r.text()).toContain('Harf küçülür; seçemeyince Göremiyorum')
    expect(r.text()).toContain('İlk 2 harf alıştırma.')
    await r.tap(r.btn('Anladım'))
    expect(seen.marked).toEqual(['acuity'])
    expect(r.text()).toContain('Sağ göz')
    expect(voice.calls.map((c) => c.id)).toContain('acuCoverL')
    await act(async () => r.root.unmount())
  })
})

describe('sesli yönlendirme (S13)', () => {
  it('hazırlıkta örtme cümlesi; "Başla" hazırken sessiz; harf ekrandayken hiçbir cümle çalmaz (runEye her adımda denetler)', async () => {
    const r = await mount()
    expect(voice.calls[0].id).toBe('acuCoverL')
    for (const s of switches(r)) await r.tap(s)
    await r.tick(5000)
    expect(r.btn('Başla')).not.toBeNull()
    expect(voice.calls.map((c) => c.id)).toEqual(['acuCoverL'])
    await r.tap(r.btn('Başla'))
    await runEye(r)
    expect(voice.calls.map((c) => c.id)).toEqual(['acuCoverL'])
    await act(async () => r.root.unmount())
  })

  it('StrictMode (geliştirme) açılış cümlesini bir kez söyler', async () => {
    const { StrictMode } = await import('react')
    const r = await mount({}, { wrap: (el) => h(StrictMode, null, el) })
    expect(voice.calls.filter((c) => c.id === 'acuCoverL')).toHaveLength(1)
    await act(async () => r.root.unmount())
  })

  it('Başla\'ya cümle sürerken basılırsa: ilk harf gelene dek oklar soluk ve aria-disabled; dokunuş hafif titreşimle karşılanır', async () => {
    const r = await mount()
    await selfStart(r) // açılış cümlesi (acuCoverL) sürüyor: harf bekler
    const arrows = () => ['Sol', 'Yukarı', 'Aşağı', 'Sağ'].map((l) => r.byLabel(l))
    await r.tick(400)
    expect(r.letter()).toBeNull()
    expect(arrows().every((a) => a.getAttribute('aria-disabled') === 'true')).toBe(true)
    hap.calls = []
    await r.tap(r.byLabel('Sağ'))
    expect(hap.calls).toEqual(['tick'])
    await r.tick(3400)
    expect(r.letter()).not.toBeNull()
    expect(arrows().every((a) => a.getAttribute('aria-disabled') == null)).toBe(true)
    await act(async () => r.root.unmount())
  })
})

describe('inceleme düzeltmeleri (akış)', () => {
  it('yarım günde "Evet, yenilendi" kalan gözlere de geçer (newBaseline)', async () => {
    const r = await mount({ plan: 'weekly', skipEyes: ['R'], defaultCorrection: 'reading', correctionSource: 'acuity', lastCorrection: 'reading', newBaseline: true })
    expect(r.text()).toContain('Sol göz')
    await selfStart(r)
    await runEye(r)
    expect(r.calls.save[0]).toMatchObject({ eye: 'L', correction: 'reading', newBaseline: true })
    await act(async () => r.root.unmount())
  })

  it('kamera durunca "Kamerasız devam": kayıttaki yöntem kameranın doğruladığını söylemez; E7 "kamera durdu, doğrulanmadı"', async () => {
    cam.state = { ...cam.state, mm: 400, face: true }
    const r = await mount({ distanceCal: { method: 'truedepth' } })
    const frame = async () => {
      await act(async () => {
        cam.opts.onFrame?.({ face: true, blinkLeft: 0.12, blinkRight: 0.12, ts: performance.now() })
        cam.opts.onDepth?.({ eyesKnown: true, leftMm: 360, rightMm: 386, ts: performance.now() })
      })
    }
    for (let t = 0; t < 1300; t += 100) {
      await frame()
      await r.tick(100)
    }
    await r.tap(r.btn('Başla'))
    for (let i = 0; i < 60 && !r.letter(); i++) {
      await frame()
      await r.tick(100)
    }
    expect(r.letter()).not.toBeNull()
    await act(async () => cam.set({ error: 'load', mm: null, face: false }))
    await r.tick(200)
    expect(r.text()).toContain('Kamera durdu')
    await r.tap(r.btn('Kamerasız devam'))
    await runEye(r)
    expect(r.calls.save[0]).toMatchObject({ eye: 'R', distanceTracked: false, camFailedMidTest: true, occlusion: { method: 'self-report', gateMethod: 'camera-depth' } })
    // kişi örtmeyi hiç onaylamadı: "senin onayın" denmez (R-N4a)
    expect(r.text()).toContain('Örtme: kamera durdu, doğrulanmadı')
    expect(r.text()).not.toContain('Örtme: senin onayın')
    expect(r.text()).not.toContain('Örtme: kamera doğruladı')
    await act(async () => r.root.unmount())
  })

  it('web yolu: hata gelmeden yüz 5 sn görünmezse de "Kamerasız devam" çıkar (takılı kalınmaz)', async () => {
    cam.state = { ...cam.state, mm: 400, face: true }
    const r = await mount({ distanceCal: { irisPxAt40: 100 } })
    await selfStart(r)
    await r.tick(3800)
    expect(r.letter()).not.toBeNull()
    await act(async () => cam.set({ mm: null, face: false })) // kamera hata vermedi, yalnız yüz yok
    await r.tick(1000)
    expect(r.text()).toContain('Yüzünü kameraya göster')
    expect(r.btn('Kamerasız devam')).toBeNull()
    await r.tick(5000)
    expect(r.text()).toContain('Yüzünü kameraya göster')
    await r.tap(r.btn('Kamerasız devam'))
    await runEye(r)
    expect(r.calls.save[0]).toMatchObject({ distanceTracked: false, camFailedMidTest: true })
    await act(async () => r.root.unmount())
  })

  it('"Kamerasız devam" yalnız o göz için: sıradaki gözde kamera yeniden denenir', async () => {
    cam.state = { ...cam.state, mm: 400, face: true }
    const r = await mount({ distanceCal: { irisPxAt40: 100 } })
    await selfStart(r)
    await r.tick(3800)
    await act(async () => cam.set({ error: 'load', mm: null }))
    await r.tick(300)
    await r.tap(r.btn('Kamerasız devam'))
    expect(cam.enabled.at(-1)).toBe(false)
    await runEye(r)
    await act(async () => cam.set({ error: null, mm: 400, face: true }))
    await r.tap(r.btn('Sıradaki'))
    await r.tap(r.btn('Atla'))
    expect(r.text()).toContain('Sol göz')
    expect(cam.enabled.at(-1)).toBe(true)
    // kameralı hazırlık: mesafe satırı canlı, "2 maddeyi onayla" (kamerasız) değil
    expect(r.text()).toContain('Mesafe · hedef 40 cm')
    expect(r.btn('2 maddeyi onayla')).toBeNull()
    await act(async () => r.root.unmount())
  })

  it('"Kamerasız devam"a duraklamadan önce basılırsa gizli eski harf geri gelmez; yeni harf gelir', async () => {
    dirs.queue = ['up', 'left']
    cam.state = { ...cam.state, mm: 400, face: true }
    const r = await mount({ distanceCal: { irisPxAt40: 100 } })
    await selfStart(r)
    await r.tick(3800)
    const n0 = dirs.calls
    expect(r.letter().getAttribute('data-dir')).toBe('up')
    await act(async () => cam.set({ error: 'load' })) // hata geldi; kapı henüz durmadı
    await r.tick(100)
    await r.tap(r.btn('Kamerasız devam'))
    expect(r.letter()).toBeNull()
    await r.tick(200)
    expect(r.letter().getAttribute('data-dir')).toBe('left')
    expect(dirs.calls).toBe(n0 + 1)
    await act(async () => r.root.unmount())
  })

  it('çıkış sayfası açıkken: duraklama titreşim ve ses vermez; mola biterse sıradaki göz sayfa kapanınca açılır', async () => {
    cam.state = { ...cam.state, mm: 400, face: true }
    const r = await mount({ distanceCal: { irisPxAt40: 100 } })
    await selfStart(r)
    await r.tick(3800)
    await r.tap(r.byLabel('Testten çık'))
    expect(r.text()).toContain('Testten çıkılsın mı?')
    hap.calls = []
    const v0 = voice.calls.length
    await act(async () => cam.set({ mm: 700 }))
    await r.tick(600)
    expect(hap.calls).not.toContain('warning')
    expect(voice.calls.length).toBe(v0)
    await r.tap(r.btn('Teste dön'))
    expect(r.text()).toContain('Biraz yaklaştır · 40 cm')
    await act(async () => cam.set({ mm: 400 }))
    await r.tick(3500)
    await runEye(r)
    await r.tap(r.btn('Sıradaki'))
    await r.tap(r.byLabel('Testten çık'))
    const v1 = voice.calls.length
    await r.tick(21000) // mola biter (20 sn + 700 ms)
    expect(r.text()).toContain('Testten çıkılsın mı?')
    expect(r.text()).not.toContain('Sağ gözünü avucunla ört, bastırma.')
    expect(voice.calls.length).toBe(v1)
    await r.tap(r.btn('Teste dön'))
    expect(r.text()).toContain('Sağ gözünü avucunla ört, bastırma.')
    expect(voice.calls.at(-1).id).toBe('acuCoverR')
    await act(async () => r.root.unmount())
  })

  it('gece yarısını geçen koşu: bugün yalnız sol göz kayıtlı → sağdan sonra iki göz gelir, sol yeniden ölçülmez', async () => {
    const r = await mount({ plan: 'weekly', skipEyes: ['L'] })
    expect(r.text()).toContain('Sağ göz')
    await selfStart(r)
    await runEye(r)
    expect(r.btn('Sıradaki: İki göz')).not.toBeNull()
    expect(r.text()).toContain('3/3')
    await r.tap(r.btn('Sıradaki'))
    expect(r.text()).toContain('İki göz · iki gözünü de açık tut')
    await r.tap(r.btn('Atla'))
    expect(r.text()).toContain('İki göz')
    expect(r.text()).toContain('İki gözünü de açık tut.')
    await selfStart(r)
    await runEye(r)
    expect(r.calls.save.map((x) => x.eye)).toEqual(['R', 'OU'])
    expect(r.text()).toContain('Haftalık test bitti')
    // koşudan önce kaydedilmiş göz: "Daha önce kaydedildi" ("Bugün" denmez; gece yarısını geçen koşuda dün kaydedilmiş
    // olabilir; üçüncü inceleme, 2. doğrulayıcı)
    expect(r.text()).toContain('Daha önce kaydedildi')
    expect(r.text()).not.toContain('Bugün daha önce')
    await act(async () => r.root.unmount())
  })

  it('kalanlar Bugün\'de görünmeyecekse çıkış sayfası bunu vaat etmez', async () => {
    const r = await mount({ todayHolds: false })
    await selfStart(r)
    await runEye(r)
    await r.tap(r.byLabel('Testten çık'))
    expect(r.text()).toContain('Sağ göz kaydedildi.')
    expect(r.text()).not.toContain("Bugün'de bekler")
    await act(async () => r.root.unmount())
  })

  it('aynı eksik için ikinci dokunuş da VoiceOver\'a okunur (canlı bölge metni değişir)', async () => {
    const r = await mount()
    const live = () => r.q((n) => n.getAttribute?.('aria-live') === 'assertive' && /acu-sr/.test(n.className))[0].textContent
    await r.tap(r.btn('2 maddeyi onayla'))
    const a = live()
    await r.tap(r.btn('2 maddeyi onayla'))
    const b = live()
    expect(a.replace('​', '')).toBe(b.replace('​', ''))
    expect(a).not.toBe(b)
    await act(async () => r.root.unmount())
  })
})

describe('inceleme düzeltmeleri (erişilebilirlik)', () => {
  it('alt sayfa açılınca odak sayfaya geçer (VoiceOver arkada kalmaz)', async () => {
    const { Node } = await import('../test/fakeDom.js')
    const focused = []
    const orig = Node.prototype.focus
    Node.prototype.focus = function focus() { focused.push(this) }
    try {
      const r = await mount({ defaultCorrection: null, correctionSource: null })
      await r.tap(r.btn('Önce gözlüğünü seç'))
      expect(r.text()).toContain('Yakına bakarken ne takıyorsun?')
      const dlg = focused.find((n) => n.getAttribute?.('role') === 'dialog')
      expect(dlg?.getAttribute('aria-label')).toBe('Gözlük')
      expect(dlg.getAttribute('tabindex')).toBe('-1')
      await act(async () => r.root.unmount())
    } finally {
      Node.prototype.focus = orig
    }
  })

  // Üçüncü doğrulama V3-N2: nasıl yapılır hapının adı yoktu; VoiceOver yalnız "45 cm" okuyordu (yön yok). Artık deneme
  // ekranındaki hapla aynı: adlandırılmış görsel, ad yönü de söyler; canlı bölge değil (her değişimde okunmaz).
  it('bölüm göstergesi adlandırılmış görsel; nasıl yapılır cm hapı deneme hapıyla aynı adı taşır, her değişimde okunmaz', async () => {
    seen.ids = new Set()
    cam.state = { ...cam.state, mm: 400, face: true }
    const r = await mount({ distanceCal: { irisPxAt40: 100 } })
    const prog = r.q((n) => /(^| )acu-prog( |$)/.test(n.className))[0]
    expect(prog.getAttribute('role')).toBe('img')
    expect(prog.getAttribute('aria-label')).toBe('Bölüm 1/3') // nasıl yapılır: 3 karttan 1.
    const pill = () => r.q((n) => /(^| )acu-cm( |$)/.test(n.className))[0]
    const live = (n) => {
      for (let x = n; x; x = x.parentNode) if (x.getAttribute?.('aria-live') || x.getAttribute?.('role') === 'status') return true
      return false
    }
    expect(pill().textContent).toBe('40 cm')
    expect(pill().getAttribute('role')).toBe('img')
    expect(pill().getAttribute('aria-label')).toBe('40 santimetre')
    expect(live(pill())).toBe(false)
    for (const [mm, text, label] of [[443, '45 cm', '45 santimetre, biraz yaklaştır'], [357, '35 cm', '35 santimetre, biraz uzaklaştır'], [null, '— cm', 'Mesafe ölçülemiyor']]) {
      await act(async () => cam.set({ mm }))
      expect(pill().textContent, String(mm)).toBe(text)
      expect(pill().className, String(mm)).toMatch(/(^| )out( |$)/)
      expect(pill().getAttribute('role'), String(mm)).toBe('img')
      expect(pill().getAttribute('aria-label'), String(mm)).toBe(label)
      expect(live(pill()), String(mm)).toBe(false)
    }
    await act(async () => r.root.unmount())
  })
})

describe('inceleme düzeltmeleri (hesap)', () => {
  it('sayılan evrede 36–44 cm dışında yeni harf açılmaz; 35 cm altında 300 ms kalınca test durur ve ne yapılacağı yazar', async () => {
    cam.state = { ...cam.state, mm: 400, face: true }
    const r = await mount({ distanceCal: { irisPxAt40: 100 } })
    await selfStart(r)
    await r.tick(3800)
    // alıştırma 30 cm'de sürer
    await act(async () => cam.set({ mm: 300 }))
    for (let i = 0; i < 2; i++) {
      await r.tick(100)
      const e = r.letter()
      if (e) await r.tap(r.byLabel(LABEL[e.getAttribute('data-dir')]))
      await r.tick(400)
    }
    // sayılan evreye geçti: 30 cm'de harf yok; 300 ms kuralıyla kart "Biraz uzaklaştır · 40 cm"
    await r.tick(100)
    expect(r.letter()).toBeNull()
    await r.tick(300)
    expect(r.letter()).toBeNull()
    expect(r.text()).toContain('Biraz uzaklaştır · 40 cm')
    expect(r.text()).not.toContain('Alıştırma · sayılmaz')
    await act(async () => cam.set({ mm: 400 }))
    await r.tick(3500)
    expect(r.letter()).not.toBeNull()
    await act(async () => r.root.unmount())
  })
})

describe('ikinci inceleme: örtme okuması (R-S2)', () => {
  // TrueDepth kareleri: sağ göz testi, sol göz avuçla örtülü ("ok"), avuç yanlış tarafta ("wrong") ya da avuç yok
  // ("open": iki göz bölgesi aynı uzaklıkta, iki göz açık → örtme kalktı)
  const FACE = { face: true, blinkLeft: 0.12, blinkRight: 0.12 }
  const DEPTH = {
    ok: { eyesKnown: true, leftMm: 360, rightMm: 386 },
    wrong: { eyesKnown: true, leftMm: 386, rightMm: 360 },
    open: { eyesKnown: true, leftMm: 383, rightMm: 386 },
  }
  async function step(r, kind) {
    await act(async () => {
      cam.opts.onFrame({ ...FACE, ts: performance.now() })
      cam.opts.onDepth({ ...DEPTH[kind], ts: performance.now() })
    })
    await r.tick(100)
  }
  // Kamera doğruladı → Başla → iki alıştırma harfi → sayılan evrede harf ekranda
  async function counted() {
    cam.state = { ...cam.state, mm: 400, face: true }
    const r = await mount({ distanceCal: { method: 'truedepth' } })
    for (let i = 0; i < 13; i++) await step(r, 'ok')
    await r.tap(r.btn('Başla'))
    let warm = 0
    for (let i = 0; i < 80 && !(warm >= 2 && r.letter()); i++) {
      const e = r.letter()
      if (e && warm < 2) {
        await r.tap(r.byLabel(LABEL[e.getAttribute('data-dir')]))
        warm += 1
      }
      await step(r, 'ok')
    }
    expect(r.letter()).not.toBeNull()
    expect(r.text()).not.toContain('Alıştırma · sayılmaz')
    return r
  }
  const answerShown = async (r) => r.tap(r.byLabel(LABEL[r.letter().getAttribute('data-dir')]))

  it('kamera iki kare yanlış göz okuyup düzelirse (titreme) cevap sayılır; neden kartı çıkmaz', async () => {
    const r = await counted()
    hap.calls = []
    // kapı ~100 ms "yanlış göz" görür (ortanca süzgeçten geçen iki kare), sonra cevap
    await step(r, 'wrong')
    await step(r, 'wrong')
    await step(r, 'ok')
    await answerShown(r)
    expect(hap.calls).toEqual(['tick']) // sayıldı; reddedilseydi 'warning'
    expect(r.text()).not.toContain('Yanlış göz · solu ört')
    await act(async () => r.root.unmount())
  })

  it('yanlış göz 250 ms sürerse cevap sayılmaz ve nedeni harf yuvasında yazar; test durmaz, ses yok; düzelince yeni harf', async () => {
    const r = await counted()
    hap.calls = []
    const v0 = voice.calls.length
    for (let i = 0; i < 5; i++) await step(r, 'wrong')
    const remBefore = r.text().match(/~\d+ harf kaldı|az kaldı|son harf(ler)?/)?.[0]
    await answerShown(r)
    expect(hap.calls).toEqual(['warning'])
    expect(r.letter()).toBeNull()
    expect(r.text()).toContain('Yanlış göz · solu ört') // duraklama kartındaki emrin aynısı
    expect(r.text()).not.toContain('Test durdu')
    const arrows = () => ['Sol', 'Yukarı', 'Aşağı', 'Sağ'].map((l) => r.byLabel(l))
    expect(arrows().every((a) => a.getAttribute('aria-disabled') === 'true')).toBe(true)
    // örtme düzeldi: kart kısa süre kalır (okunabilsin), sonra yeni harf
    await step(r, 'ok')
    await step(r, 'ok')
    expect(r.text()).toContain('Yanlış göz · solu ört')
    expect(r.text()).not.toContain('Test durdu')
    for (let i = 0; i < 12; i++) await step(r, 'ok')
    expect(r.text()).not.toContain('Yanlış göz · solu ört')
    expect(r.letter()).not.toBeNull()
    expect(r.text()).toContain(remBefore) // reddedilen cevap sayılmadı
    expect(voice.calls.length).toBe(v0) // yeni sesli cümle yok
    await act(async () => r.root.unmount())
  })

  // Üçüncü inceleme R-S2-continuity: kamera çoğunlukla "yanlış göz" okuyor, araya tek "tamam" giriyor (derinlik örnekleri
  // yanlış, yanlış, doğru, yanlış, doğru → kapıda 400 ms yanlış göz, 100 ms tamam). 700 ms kesintisiz olmadığı için test
  // durmaz; eskiden her "tamam" karesi engeli sıfırlıyor, harfler yanlış gözle sayılıyordu.
  it('çoğunlukla yanlış göz okunursa harf sayılmaz; neden kartı aralıksız kalır (sessiz bekleyiş yok), ses yok; düzelince harf', async () => {
    const r = await counted()
    const PATTERN = ['wrong', 'wrong', 'ok', 'wrong', 'ok']
    for (let i = 0; i < 5; i++) await step(r, PATTERN[i % 5])
    hap.calls = []
    const v0 = voice.calls.length
    const remBefore = r.text().match(/~\d+ harf kaldı|az kaldı|son harf(ler)?/)?.[0]
    await answerShown(r)
    expect(hap.calls).toEqual(['warning'])
    expect(r.text()).toContain('Yanlış göz · solu ört')
    for (let i = 5; i < 45; i++) {
      await step(r, PATTERN[i % 5])
      expect(r.letter(), `${i}`).toBeNull()
      expect(r.text(), `${i}`).toContain('Yanlış göz · solu ört')
      expect(r.text(), `${i}`).not.toContain('Test durdu')
    }
    expect(voice.calls.length).toBe(v0)
    expect(r.text()).toContain(remBefore)
    for (let i = 0; i < 6 && !r.letter(); i++) await step(r, 'ok')
    expect(r.letter()).not.toBeNull()
    expect(r.text()).not.toContain('Yanlış göz · solu ört')
    await act(async () => r.root.unmount())
  })

  it('bozukluk 700 ms\'yi geçerse duraklama kartı neden kartının yerini alır; düzelince eski neden kartı geri gelmez', async () => {
    const r = await counted()
    for (let i = 0; i < 5; i++) await step(r, 'wrong')
    await answerShown(r)
    expect(r.text()).toContain('Yanlış göz · solu ört')
    expect(r.text()).not.toContain('Test durdu')
    for (let i = 0; i < 4; i++) await step(r, 'wrong') // 700 ms doldu: duraklama
    expect(r.text()).toContain('Yanlış göz · solu ört')
    expect(r.text()).toContain('Test durdu. Düzelince sürer.')
    for (let i = 0; i < 5; i++) await step(r, 'ok') // düzeldi, test sürer ("Test durdu" cümlesi bitene dek harf yok)
    expect(r.text()).not.toContain('Test durdu')
    expect(r.text()).not.toContain('Yanlış göz · solu ört')
    for (let i = 0; i < 40 && !r.letter(); i++) await step(r, 'ok')
    expect(r.letter()).not.toBeNull()
    await act(async () => r.root.unmount())
  })

  // Üçüncü doğrulama V3-N1: kamera kare kare "yanlış göz" / "örtme kalktı" okuyunca duraklama kartının emri 100 ms'de bir
  // "Yanlış göz · solu ört" ile "Sol gözünü avucunla ört" arasında değişiyor, kart (role=status, aria-live) her
  // değişimde yeniden okunuyordu
  it('örtme "yanlış göz" ile "örtme kalktı" arasında gidip gelince duraklama kartı tek emirde kalır', async () => {
    const r = await counted()
    const order = (c) => c.querySelectorAll((n) => n.nodeName === 'B')[0]?.textContent ?? null
    const shown = []
    for (let i = 0; i < 40; i++) {
      await step(r, i % 2 ? 'open' : 'wrong')
      const card = r.q((n) => /(^| )acu-pcard( |$)/.test(n.className))[0]
      if (card?.textContent.includes('Test durdu')) {
        expect(card.getAttribute('aria-live')).toBe('assertive')
        shown.push(order(card))
      }
    }
    expect(shown.length).toBeGreaterThan(25)
    expect([...new Set(shown)]).toEqual(['Yanlış göz · solu ört'])
    expect(voice.calls.filter((c) => c.id === 'acuPaused')).toHaveLength(1)
    await act(async () => r.root.unmount())
  })
})

describe('ikinci inceleme: ses cümlesi yarıda kesilmez (V-S1)', () => {
  it('hazırlıkta yeni cümle, çalan cümle bitmeden başlamaz (açılış cümlesi kesilmez)', async () => {
    cam.state = { ...cam.state, mm: null, face: false }
    const r = await mount({ distanceCal: { method: 'truedepth' } })
    expect(voice.calls.map((c) => c.id)).toEqual(['acuCoverL'])
    expect(r.btn('Yüzünü kameraya göster')).not.toBeNull()
    await r.tick(8000)
    expect(voice.calls.slice(0, 2).map((c) => c.id)).toEqual(['acuCoverL', 'acuFace'])
    for (let i = 1; i < voice.calls.length; i++) {
      const prev = voice.calls[i - 1]
      expect(voice.calls[i].at - prev.at, `${prev.id} → ${voice.calls[i].id}`).toBeGreaterThanOrEqual(phraseMs(prev.id))
    }
    await act(async () => r.root.unmount())
  })

  it('duraklama cümlesi çalan hazırlık cümlesini keser; çalan "Test durdu" ikinci duraklamada baştan başlamaz', async () => {
    cam.state = { ...cam.state, mm: 400, face: true }
    const r = await mount({ distanceCal: { irisPxAt40: 100 } })
    await selfStart(r) // açılış cümlesi (acuCoverL) sürüyor
    await r.tick(200)
    await act(async () => cam.set({ mm: 700 }))
    await r.tick(400) // alıştırma bandı dışında 300 ms: durur
    expect(r.text()).toContain('Test durdu. Düzelince sürer.')
    expect(voice.calls.map((c) => c.id)).toEqual(['acuCoverL', 'acuPaused'])
    expect(voice.calls[1].at - voice.calls[0].at).toBeLessThan(phraseMs('acuCoverL')) // daha yüksek öncelik: keser
    // düzelir ve hemen yine bozulur: ikinci duraklama çalan "Test durdu"yu kesip baştan başlatmaz
    await act(async () => cam.set({ mm: 400 }))
    await r.tick(400)
    await act(async () => cam.set({ mm: 700 }))
    await r.tick(400)
    expect(r.text()).toContain('Test durdu. Düzelince sürer.')
    expect(voice.calls.map((c) => c.id)).toEqual(['acuCoverL', 'acuPaused'])
    await act(async () => r.root.unmount())
  })
})

describe('ikinci inceleme: koşu günü (R-N2)', () => {
  const midnight = new Date('2026-09-25T00:00:00')

  it('23:59\'da başlayan haftalık koşu gece yarısını geçip üç gözle biter: her kayıtta koşu günü, hafta tamam sayılır', async () => {
    vi.setSystemTime(new Date('2026-09-24T23:59:30'))
    const saved = []
    const r = await mount({ plan: 'weekly', runDay: '2026-09-24', onSaveEye: (x) => saved.push({ ...x, date: new Date().toISOString() }) })
    for (let i = 0; i < 3; i++) {
      await selfStart(r)
      await runEye(r)
      if (i < 2) {
        await r.tap(r.btn('Sıradaki'))
        await r.tap(r.btn('Atla'))
      }
    }
    expect(r.text()).toContain('Haftalık test bitti')
    expect(saved.map((x) => x.eye)).toEqual(['R', 'L', 'OU'])
    expect(new Date(saved[0].date) < midnight && new Date(saved[2].date) > midnight).toBe(true) // gerçekten geçti
    expect(saved.map((x) => x.runDay)).toEqual(['2026-09-24', '2026-09-24', '2026-09-24'])
    expect(weeklyStatus(saved, new Date())).toMatchObject({ state: 'idle', due: false }) // "yarım" kalmaz
    expect(weeklyStatus(saved.map(({ runDay, ...x }) => x), new Date()).state).toBe('half') // koşu günü olmasa kalırdı
    await act(async () => r.root.unmount())
  })

  it('gece yarısı geçtikten sonra çıkış sayfası "Kalanlar Bugün\'de bekler." demez (test ertesi gün baştan açılır)', async () => {
    vi.setSystemTime(new Date('2026-09-24T23:59:30'))
    const r = await mount({ plan: 'weekly', runDay: '2026-09-24', todayHolds: true })
    await selfStart(r)
    await runEye(r)
    await r.tap(r.byLabel('Testten çık'))
    expect(new Date() < midnight).toBe(true)
    expect(r.text()).toContain("Sağ göz kaydedildi. Kalanlar Bugün'de bekler.")
    await r.tap(r.btn('Teste dön'))
    await r.tick(30000) // göz sonucunda beklerken gece yarısı geçer
    expect(new Date() > midnight).toBe(true)
    await r.tap(r.byLabel('Testten çık'))
    expect(r.text()).toContain('Sağ göz kaydedildi.')
    expect(r.text()).not.toContain("Bugün'de bekler")
    await r.tap(r.btn('Çık'))
    expect(r.calls.save.map((x) => [x.eye, x.runDay])).toEqual([['R', '2026-09-24']])
    await act(async () => r.root.unmount())
  })

  it('koşu günü verilmezse açılışın yerel günü yazılır', async () => {
    vi.setSystemTime(new Date('2026-09-25T10:00:00'))
    const r = await mount()
    await selfStart(r)
    await runEye(r)
    expect(r.calls.save[0].runDay).toBe('2026-09-25')
    await act(async () => r.root.unmount())
  })
})
