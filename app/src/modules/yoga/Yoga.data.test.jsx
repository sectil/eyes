// Yoga ekranları, yalnız veri değişince (ses dosyası geldikçe `published`, `musicTailFile`, `sections`): bugün görünmeyen
// ama veri değişikliğiyle görünecek davranışlar. Ders verisi test süresince bellekte değiştirilir, sonra geri alınır.
// - 3 dk'da Kaynaklar kartı yalnız Radin 2025 satırını yazar, dersin genel etki cümlesini yazmaz (PLAN.v3 §A.2 kural 12)
// - "Çok" cevabı: daha kısa süre varsa "daha kısa bir süre seçebilir" ve bitişte aynı dersin en kısa süresi
// - eklenen bölümler "ve" ile; "Sonra yaparım" yalnız yoldan açılan derste; müzik kuyruğu yalnız dosyası varken
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import '../../test/fakeDom.js'
import { createElement as h, act } from 'react'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
const mem = new Map()
globalThis.localStorage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k), clear: () => mem.clear() }
globalThis.fetch = async () => ({ ok: false }) // çizelge yok: oynatıcı çizelgesiz de çalar

const eng = vi.hoisted(() => ({ time: 0, playing: false, duration: 300, calls: [] }))
vi.mock('../../lib/native.js', async (orig) => ({
  ...(await orig()),
  isIOSApp: () => true,
  haptic: async () => {},
  lessonStart: async (a) => { eng.calls.push(['start', a]); eng.time = a.at; eng.playing = true },
  lessonPause: async () => { eng.calls.push(['pause']); eng.playing = false },
  lessonResume: async (a) => { eng.calls.push(['resume', a]); eng.playing = true },
  lessonSeek: async (a) => { eng.calls.push(['seek', a]) },
  lessonCrossTo: async (a) => { eng.calls.push(['cross', a]) },
  lessonStop: async () => { eng.calls.push(['stop']); eng.playing = false },
  lessonStatus: async () => ({ time: eng.time, duration: eng.duration, playing: eng.playing, route: 'Speaker' }),
  lessonMeta: async () => {},
  lessonJournal: async () => null,
  lessonJournalClear: async () => true,
  Alarm: { sleepStatus: async () => ({ playing: false }) },
}))

const { createRoot } = await import('react-dom/client')
const { default: Yoga } = await import('./Yoga.jsx')
const { currentLesson, clearCurrentLesson } = await import('./session.js')
const { YT } = await import('./text.js')
const { LESSONS, THREE_MIN_LINE } = await import('../../lib/yogaLessons.js')
const { LATER_KEY } = await import('../../lib/pathLater.js')
const { dayKey } = await import('../../lib/calendar.js')
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const tick = () => act(async () => wait(320))

async function mount(props = {}) {
  const container = document.createElement('div')
  const root = createRoot(container)
  const store = { addSession: vi.fn((r) => ({ id: 'r1', ...r })), updateSession: vi.fn() }
  const p = { route: 'yoga', sessions: [{ type: 'yoga', lesson: 2, date: '2026-09-01T10:00:00.000Z' }], profile: null, store, onRefresh: vi.fn(), onExit: vi.fn(), ...props }
  await act(async () => root.render(h(Yoga, p)))
  const all = (pred) => container.querySelectorAll(pred)
  const btn = (label) => all((n) => n.nodeName === 'BUTTON' && (n.textContent.trim() === label || n.getAttribute('aria-label') === label))[0]
  const tap = async (label) => {
    const b = btn(label)
    if (!b) throw new Error(`düğme yok: ${label} — ${container.textContent}`)
    await act(async () => b.click())
  }
  const tapWhere = async (pred) => {
    const b = all((n) => n.nodeName === 'BUTTON' && pred(n))[0]
    if (!b) throw new Error(`düğme yok — ${container.textContent}`)
    await act(async () => b.click())
  }
  return { p, store, btn, tap, tapWhere, container, text: () => container.textContent, unmount: () => act(async () => root.unmount()) }
}

// Ders verisini geçici olarak değiştir (Ders 1'in 3 ve 5 dakikası, Ders 3'ün 15 dakikası yayımlanmış gibi)
let saved
beforeEach(() => {
  mem.clear()
  mem.set('gozolcum:yoga-opts', JSON.stringify({ safetySeen: true, soundCheck: 'nofile' }))
  Object.assign(eng, { time: 0, playing: false, duration: 300, calls: [] })
  clearCurrentLesson()
  saved = structuredClone({ 1: LESSONS[1].versions, 3: LESSONS[3].versions, tail: LESSONS[3].musicTailFile })
  Object.assign(LESSONS[1].versions[3], { published: true, sections: ['A', 'C1', 'K'] })
  Object.assign(LESSONS[1].versions[5], { published: true, sections: ['A', 'C1', 'C2', 'C3', 'K'] })
  Object.assign(LESSONS[3].versions[15], { published: true })
})
afterEach(() => {
  LESSONS[1].versions = saved[1]
  LESSONS[3].versions = saved[3]
  LESSONS[3].musicTailFile = saved.tail
  clearCurrentLesson()
})

describe('Kaynaklar kartı ve bölüm şeridi', () => {
  it('3 dk: yalnız Radin 2025 satırı, dersin genel etki cümlesi yok; 5 dk: etki cümlesi var, 3 dk satırı yok', async () => {
    const r = await mount()
    await r.tapWhere((n) => n.textContent.includes('Nefesin Ritmi'))
    await r.tapWhere((n) => n.getAttribute('role') === 'radio' && n.textContent.startsWith('3'))
    expect(r.text()).toContain(THREE_MIN_LINE)
    expect(r.text()).not.toContain(LESSONS[1].evidenceLine)
    await r.tapWhere((n) => n.getAttribute('role') === 'radio' && n.textContent.startsWith('5'))
    expect(r.text()).toContain(LESSONS[1].evidenceLine)
    expect(r.text()).not.toContain(THREE_MIN_LINE)
    // eklenen bölümler Türkçe sıralamayla: son öğeden önce "ve"
    expect(r.text()).toContain('5 dakikada iç çekiş ve vızıltılı nefes eklendi')
    await r.unmount()
  })
})

describe('"Çok" cevabı, daha kısa süre varken', () => {
  it('5 dk bitti → "daha kısa bir süre seçebilir" metni; bitişte aynı dersin en kısa süresi ve "Gözlerin açık kalabilir."', async () => {
    const r = await mount()
    await r.tapWhere((n) => n.textContent.includes('Nefesin Ritmi'))
    await r.tapWhere((n) => n.getAttribute('role') === 'radio' && n.textContent.startsWith('5'))
    await r.tap('Başla')
    await r.tap('Atla') // önce puanı
    await tick()
    currentLesson().listened = 290
    eng.time = 300
    eng.playing = false
    await tick()
    await r.tap('Atla') // sonra puanı
    await r.tap('Çok')
    expect(r.text()).toContain(YT.hard.muchFinished)
    await r.tap('Devam')
    expect(r.text()).toContain('Nefesin Ritmi · 3 dk')
    expect(r.text()).toContain('Gözlerin açık kalabilir.')
    await r.unmount()
  })
})

describe('"Çok" cevabı, dersin daha kısa süresi yokken', () => {
  it('en kısa süre (3 dk) bitti → bitişte öneri kartı yok: başka bir ders ya da aynı süre önerilmez (modul.md §2.8)', async () => {
    // Bulgu (inceleme): kütüphanede birden çok ders varken sıradaki (daha uzun) ders, altında "Gözlerin açık kalabilir."
    // satırıyla öneriliyordu
    const r = await mount()
    await r.tapWhere((n) => n.textContent.includes('Nefesin Ritmi'))
    await r.tapWhere((n) => n.getAttribute('role') === 'radio' && n.textContent.startsWith('3'))
    await r.tap('Başla')
    await r.tap('Atla') // önce puanı
    await tick()
    eng.duration = 180
    currentLesson().listened = 175
    eng.time = 180
    eng.playing = false
    await tick()
    await r.tap('Atla') // sonra puanı
    await r.tap('Çok')
    expect(r.text()).toContain(YT.hard.muchFinishedNoShorter)
    await r.tap('Devam')
    expect(r.text()).toContain(YT.done.title)
    expect(r.text()).not.toContain(YT.done.next)
    expect(r.text()).not.toContain(YT.done.eyesOpen)
    await r.unmount()
  })
  it('öteki cevaplarda kütüphane sırasındaki sonraki ders önerilir (değişmedi)', async () => {
    const r = await mount()
    await r.tapWhere((n) => n.textContent.includes('Nefesin Ritmi'))
    await r.tapWhere((n) => n.getAttribute('role') === 'radio' && n.textContent.startsWith('3'))
    await r.tap('Başla')
    await r.tap('Atla')
    await tick()
    eng.duration = 180
    currentLesson().listened = 175
    eng.time = 180
    eng.playing = false
    await tick()
    await r.tap('Atla')
    await r.tap('Hayır')
    expect(r.text()).toContain(YT.done.next)
    expect(r.text()).not.toContain(YT.done.eyesOpen)
    await r.unmount()
  })
})

describe('uyku dersi: durdurma ekranı', () => {
  it('X → uyandıran dönüş metni yerine dersin gece satırı (modul.md §10.1, §10.2)', async () => {
    const r = await mount()
    await r.tapWhere((n) => n.textContent.includes('Uykuya Geçiş'))
    await r.tap('Başla')
    await tick()
    currentLesson().listened = 120
    await r.tap('Dersi bitir')
    expect(r.text()).toContain(YT.stopped.night)
    expect(r.text()).not.toContain('Gözlerini aç')
    await r.tap('Tamam')
    await r.unmount()
  })
})

describe('"Sonra yaparım"', () => {
  it('yalnız yoldan açılan derste: bugünün kaydına yoga yazılır, Ana sayfaya dönülür', async () => {
    const lib = await mount()
    await lib.tapWhere((n) => n.textContent.includes('Nefesin Ritmi'))
    expect(lib.btn('Sonra yaparım')).toBeUndefined()
    await lib.unmount()
    const r = await mount({ route: 'yoga-1', pathMinutes: 3 })
    expect(r.text()).toContain(THREE_MIN_LINE) // yolun süresi seçili geldi
    await r.tap('Sonra yaparım')
    expect(JSON.parse(mem.get(LATER_KEY))).toEqual({ day: dayKey(new Date()), later: ['yoga'] })
    expect(r.p.onExit).toHaveBeenCalled()
    await r.unmount()
  })
})

describe('uyku dersi: müzik kuyruğu', () => {
  it('kuyruk dosyası yokken seçici yok, kuyruk istenmez, kayıtta 0; dosya varken seçici ve lessonStart tail; uyku sonunda "Durdur" dokununca', async () => {
    // İlk bölümle kuyruk dosyası pakette (yogaLessons.js musicTailFile); dosyasız hâl burada geçici olarak kurulur
    expect(saved.tail).toBe('yoga/ders3-kuyruk.mp3')
    LESSONS[3].musicTailFile = null
    const r = await mount()
    await r.tapWhere((n) => n.textContent.includes('Uykuya Geçiş'))
    expect(r.text()).toContain('Bu dersten hemen sonra araç kullanma.')
    expect(r.text()).not.toContain(YT.detail.musicTail)
    await r.tap('Başla')
    expect(eng.calls[0][1].tail).toBeUndefined()
    expect(currentLesson().musicTail).toBe(0)
    await r.tap('Dersi bitir')
    await r.tap('Tamam')
    await r.unmount()
    clearCurrentLesson()
    eng.calls = []

    LESSONS[3].musicTailFile = 'yoga/ders3-kuyruk.mp3'
    eng.duration = 900
    const r2 = await mount()
    await r2.tapWhere((n) => n.textContent.includes('Uykuya Geçiş'))
    expect(r2.text()).toContain(YT.detail.musicTail)
    await r2.tap('Başla')
    expect(eng.calls[0][1].tail).toEqual({ file: 'yoga/ders3-kuyruk.mp3', seconds: 600, fade: 180 })
    currentLesson().listened = 880
    eng.time = 900
    eng.playing = false
    await tick()
    const main = r2.container.querySelectorAll((n) => n.nodeName === 'MAIN')[0]
    expect(main.getAttribute('class')).toBe('yg-dark yg-sleep') // karanlık; "Durdur" saydam
    expect(r2.store.addSession.mock.calls[0][0]).toMatchObject({ lesson: 3, musicTail: 10, completed: true })
    await r2.tap('Durdur') // ilk dokunuş yalnız gösterir
    expect(main.getAttribute('class')).toBe('yg-dark yg-sleep on')
    expect(eng.calls.some((c) => c[0] === 'stop')).toBe(false)
    await r2.tap('Durdur')
    expect(eng.calls.at(-1)).toEqual(['stop'])
    await r2.unmount()
  })
})
