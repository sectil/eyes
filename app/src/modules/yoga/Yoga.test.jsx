// Yoga ekran akışı (modul.md §2; PLAN.v3 §D.2–D.4): web'de yok; iPhone'da güvenlik kartı → kütüphane → ayrıntı → (ses
// denetimi: yalnız dosyası varken) → önce puanı → oynatıcı → sonra puanı → zorlanma → bitiş; X → durdurma ekranı. Yerel
// köprü taklit edilir (lib/native.js lesson*); çizelge public/yoga'dan okunur.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '../../test/fakeDom.js'
import { createElement as h, act } from 'react'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
const mem = new Map()
globalThis.localStorage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k), clear: () => mem.clear() }
const PUBLIC = fileURLToPath(new URL('../../../public/', import.meta.url))
globalThis.fetch = async (p) => {
  try {
    const txt = readFileSync(PUBLIC + String(p).replace(/^\.?\//, ''), 'utf8')
    return { ok: true, json: async () => JSON.parse(txt) }
  } catch {
    return { ok: false }
  }
}

const flags = vi.hoisted(() => ({ ios: true }))
const eng = vi.hoisted(() => ({ time: 0, playing: false, sleep: false, calls: [], state: null, journal: null, startError: null, pausedAt: null }))
vi.mock('../../lib/native.js', async (orig) => ({
  ...(await orig()),
  isIOSApp: () => flags.ios,
  haptic: async () => {},
  lessonStart: async (a) => {
    eng.calls.push(['start', a])
    if (eng.startError) throw Object.assign(new Error('x'), { code: eng.startError })
    eng.time = a.at
    eng.playing = true
  },
  lessonPause: async () => { eng.calls.push(['pause']); eng.playing = false },
  lessonResume: async (a) => { eng.calls.push(['resume', a]); eng.time = a.at; eng.playing = true },
  lessonSeek: async (a) => { eng.calls.push(['seek', a]); eng.time = a.at },
  lessonCrossTo: async (a) => { eng.calls.push(['cross', a]); eng.time = a.at },
  lessonStop: async () => { eng.calls.push(['stop']); eng.playing = false },
  lessonStatus: async () => ({ time: eng.time, duration: 900, playing: eng.playing, route: 'Speaker', ...(eng.state ? { state: eng.state, file: 'yoga/ders2-15.mp3' } : {}), ...(eng.state === 'paused' && eng.pausedAt ? { pausedAt: eng.pausedAt } : {}) }),
  lessonMeta: async (a) => { eng.calls.push(['meta', a]) },
  lessonJournal: async () => eng.journal,
  lessonJournalClear: async () => { eng.calls.push(['journalClear']); eng.journal = null; return true },
  Alarm: { sleepStatus: async () => ({ playing: eng.sleep }) },
}))

const { createRoot } = await import('react-dom/client')
const { default: Yoga } = await import('./Yoga.jsx')
const { currentLesson, clearCurrentLesson } = await import('./session.js')
const { applyStatus, seekGoal } = await import('./YogaPlayer.jsx')
const { loadTimeline, closingAt, sectionsOfTimeline, seekTarget, resumeSpans, resumePoint } = await import('./timeline.js')
const { YT } = await import('./text.js')
const { SAFETY_ORDER, SAFETY_LEAD } = await import('./Yoga.jsx')
const { resetLessonData } = await import('./journal.js')
const { dayKey } = await import('../../lib/calendar.js')
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const tick = () => act(async () => wait(320)) // bir konum okuması (250 ms)

async function mount(props = {}) {
  const container = document.createElement('div')
  const root = createRoot(container)
  const store = props.store ?? { addSession: vi.fn((r) => ({ id: 'r1', ...r })), updateSession: vi.fn() }
  const p = { route: 'yoga', sessions: [], profile: null, store, onRefresh: vi.fn(), onExit: vi.fn(), ...props }
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
  const radios = () => all((n) => n.getAttribute('role') === 'radio').map((n) => n.textContent.trim())
  // 1–10 ölçeği tek ayarlanabilir öğe (role="slider"; 5 saniye yeniden tasarımı, OZET.md §5 seçenek b: 10 ayrı 44 px
  // düğme 320 px'te tek sıraya sığmaz). Dokunuş: durağın (data-v) üstüne; puanlar eskisi gibi 1–10 tam sayı.
  const slider = () => all((n) => n.getAttribute('role') === 'slider')[0]
  const rate = async (v) => {
    const stop = all((n) => n.getAttribute('data-v') === String(v))[0]
    if (!stop) throw new Error(`ölçek yok: ${v} — ${container.textContent}`)
    await act(async () => stop.click())
  }
  const reactProps = (n) => n[Object.keys(n).find((k) => k.startsWith('__reactProps'))]
  const key = async (k) => act(async () => reactProps(slider()).onKeyDown({ key: k, preventDefault() {} }))
  const cls = (re) => all((n) => re.test(n.getAttribute('class') ?? ''))
  return { p, store, container, btn, tap, tapWhere, radios, slider, rate, key, cls, text: () => container.textContent, unmount: () => act(async () => root.unmount()) }
}
const optsNow = () => JSON.parse(mem.get('gozolcum:yoga-opts') ?? '{}')
const seen = () => mem.set('gozolcum:yoga-opts', JSON.stringify({ safetySeen: true, soundCheck: 'nofile' }))

beforeEach(() => {
  mem.clear()
  flags.ios = true
  Object.assign(eng, { time: 0, playing: false, sleep: false, calls: [], state: null, journal: null, startError: null, pausedAt: null })
  clearCurrentLesson()
})

describe('web', () => {
  it('web\'de yoga yok: rotaya doğrudan gelinirse tek satır', async () => {
    flags.ios = false
    const r = await mount()
    expect(r.text()).toContain('Yoga dersleri iPhone uygulamasında.')
    expect(r.text()).not.toContain(YT.safety.title)
    await r.tap('Geri')
    expect(r.p.onExit).toHaveBeenCalled()
    await r.unmount()
  })
})

describe('ilk giriş, kütüphane ve ayrıntı', () => {
  it('güvenlik kartı bir kez, metni aynen (modul.md §2.2); kütüphanede yalnız yayımlanmış ders', async () => {
    const r = await mount()
    const t = r.text()
    expect(t).toContain('Başlamadan önce')
    for (const it of YT.safety.items) expect(t).toContain(`${it.h} ${it.p}`)
    expect(t).toContain('İstediğin an dersi bitirebilirsin. Gözlerini açabilir, kıpırdayabilir, nefesini kendi hâline bırakabilirsin.')
    expect(t).toContain('Araç kullanırken açma. Bu dersler uyku getirebilir.')
    expect(t).toContain('Nefona tedavi değildir. Uzun süredir çok zorlanıyorsan bir uzmanla konuşmak en güçlü adım. Acil durumda 112.')
    await r.tap('Anladım')
    expect(optsNow().safetySeen).toBe(true)
    expect(r.text()).toContain('Yoga ve Meditasyon')
    expect(r.text()).toContain('Derin Dinlenme')
    for (const hidden of ['Nefesin Ritmi', 'Tek Nokta', 'Uykuya Geçiş']) expect(r.text()).not.toContain(hidden)
    expect(r.radios()).toEqual([]) // tek dersle süzgeç çipi anlamsız
    await r.unmount()
    const again = await mount()
    expect(again.text()).not.toContain('Başlamadan önce')
    await again.unmount()
  })
  it('ders ayrıntısı: ad ve söz, yalnız yayımlanmış süre, bölüm şeridi, hazırlık, kaynaklar, açılış satırları, Başla', async () => {
    seen()
    const r = await mount()
    await r.tapWhere((n) => n.textContent.includes('Derin Dinlenme'))
    const t = r.text()
    expect(t).toContain('Derin Dinlenme (Yoga Nidra)')
    expect(t).toContain('Uyanıkken derin bir dinlenmeye davet.')
    // Tek süre yayımlıyken süre bir seçim değildir: tek seçenekli seçici yerine başlığın üstünde yazar (5 saniye turu 1:
    // "tek seçenekli 15 dk kutusu seçilebilir bir şeymiş gibi görünüyor"). Birden çok süre varken çipler durur
    // (Yoga.data.test.jsx, Ders 1'in 3 ve 5 dakikası).
    expect(r.radios()).toEqual([])
    expect(t).toContain('15 dk · Uzanarak')
    expect(t).toContain('Karşılama · Niyet (sankalpa) · Beden dolaşımı · Nefes ve geri sayma · İmgeleme · Niyete dönüş · Kapanış')
    // Hazırlık üç karoda (5 saniye yeniden tasarımı, yön B): metin aynen; yalnız son iki sözcük bölünmez boşlukla birlikte
    // kırılır ("İnce / bir örtü"). Eskiden tek satırda " · " ile.
    const flat = t.replace(/\u00a0/g, ' ')
    for (const it of ['İnce bir örtü', 'Dizlerinin altı için bir yastık', 'Uzanabileceğin rahat bir yüzey']) expect(flat).toContain(it)
    expect(t).toContain('Nefona Hoca') // dersin sesinin adı (çizelgenin voice_name'i; yeni etiket, onaya)
    expect(t).toContain('Kaynaklar (19)')
    expect(t).toContain('Neye dayanıyor: 11 ve 30 dakikalık yoga nidrayı')
    expect(t).toContain('İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin.')
    expect(t).toContain('Bu dersi yalnızca araç ya da makine kullanmadığın ve suda olmadığın bir sırada dinle.')
    expect(t).toContain('Uzanarak yaptığın derslerden sonra önce yana dön, otur, sonra kalk.')
    expect(t).not.toContain('Ders bitince müzik') // uyku dersi değil
    expect(t).not.toContain('Uyumadan önce dinliyorsan') // Uykuya Geçiş yayımlanmadı
    expect(t).not.toContain('Çalan uyku sesi duracak.')
    expect(r.btn('Başla')).toBeTruthy()
    await r.tap('Başlamadan önce') // (i): güvenlik kartı yeniden
    expect(r.text()).toContain('Sesi kısık tut.')
    await r.tap('Anladım')
    expect(r.text()).toContain('Derin Dinlenme (Yoga Nidra)')
    await r.unmount()
  })
  it('uyku sesi çalıyorsa "Başla"nın üstünde "Çalan uyku sesi duracak."', async () => {
    seen()
    eng.sleep = true
    const r = await mount({ route: 'yoga-2' })
    await act(async () => wait(20))
    expect(r.text()).toContain('Çalan uyku sesi duracak.')
    await r.unmount()
  })
})

// İlk görünüm (5 saniye yeniden tasarımı, yoga-pilot/C_5SN_RAPORU.md): metin aynı, sunuş değişti. Sınanan: güvenlik
// kartında beş madde açılır satırda, ana cümleleri görünür, gövdeleri aynen DOM'da; sağlık maddesi "tedavi değildir · 112"
// notuyla aynı kartta; tek ders varken kütüphane kartı dersi tanıtır (tam ad, bölümler sırasıyla, "Derse git"); önce ve
// sonra puanı TEMADA (eskiden sonra puanı ve zorlanma sorusu temadan bağımsız karanlıktı: modul.md §2 "Oynatıcı bunun
// istisnasıdır" ve görev kuralı "öteki yoga ekranları iki temada" ile çelişiyordu, OZET.md §9); 1–10 tek ayarlanabilir
// ölçek; sonra puanında önceki puan yalnız seçimden sonra (OZET.md §10; eskiden seçeneklerin arasında "6 Önce").
describe('ilk görünüm', () => {
  const inNight = (n) => { for (let x = n; x; x = x.parentNode) if (/\byg-night\b/.test(x.className ?? '')) return true; return false }
  it('güvenlik kartı: beş madde metni aynen; önce dersle ilgili dört madde, sonra sağlık maddesi ve hemen altında 112 notu', async () => {
    const r = await mount()
    const items = r.container.querySelectorAll((n) => n.nodeName === 'LI')
    expect(items.map((li) => li.textContent)).toEqual(SAFETY_ORDER.map((i) => `${YT.safety.items[i].h} ${YT.safety.items[i].p}`))
    expect([...SAFETY_ORDER].sort()).toEqual([0, 1, 2, 3, 4]) // her madde bir kez
    expect(items.at(-1).textContent.startsWith('Bir sağlık durumun varsa önce danış.')).toBe(true)
    const t = r.text()
    expect(t.indexOf('terapistine sor.')).toBeLessThan(t.indexOf('Nefona tedavi değildir.'))
    expect(t.indexOf('Acil durumda 112.')).toBeLessThan(t.indexOf('Anladım'))
    await r.unmount()
  })
  it('güvenlik kartı: her madde açılır satır; ana cümle özette (hep görünür), gövde aynı satırın içinde; sağlık maddesi ve 112 notu aynı kartta; Geri', async () => {
    const r = await mount()
    const det = r.container.querySelectorAll((n) => n.nodeName === 'DETAILS' && /yg-acc-i/.test(n.getAttribute('class') ?? ''))
    expect(det).toHaveLength(5)
    for (const d of det) {
      const sum = d.childNodes.find((c) => c.nodeName === 'SUMMARY')
      expect(YT.safety.items.some((it) => sum.textContent === it.h)).toBe(true) // özette yalnız ana cümle
      expect(d.hasAttribute('open')).toBe(false) // ilk bakışta beş kısa başlık (değerlendiriciler 1, 2, 3, 5)
    }
    // Başlığın altındaki satır ilk maddenin gövdesinden aynen
    expect(SAFETY_LEAD).toBe('Dersi yarıda bırakmak da pratiğin bir parçası.')
    expect(YT.safety.items[0].p.endsWith(SAFETY_LEAD)).toBe(true)
    const health = r.cls(/yg-acc-health/)[0]
    expect(health.textContent).toContain('Bir sağlık durumun varsa önce danış.')
    expect(health.textContent).toContain('Nefona tedavi değildir.')
    await r.tap('Geri') // ilk girişte Geri: Ana sayfaya; kart bir sonraki girişte yeniden çıkar
    expect(r.p.onExit).toHaveBeenCalled()
    expect(optsNow().safetySeen).toBeUndefined()
    await r.unmount()
  })
  it('tek ders yayımlıyken kütüphane kartı: tam ad, söz, süre ve duruş, bu sürenin bölümleri sırasıyla; tek düğme', async () => {
    seen()
    const r = await mount()
    const cards = r.container.querySelectorAll((n) => n.nodeName === 'BUTTON' && n.textContent.includes('Derin Dinlenme'))
    expect(cards).toHaveLength(1)
    const c = cards[0].textContent
    expect(c).toContain('Derin Dinlenme (Yoga Nidra)')
    expect(c).toContain('Uyanıkken derin bir dinlenmeye davet.')
    expect(c).toContain('15\u00a0dk · Uzanarak')
    expect(c).toContain('BölümlerKarşılamaNiyet (sankalpa)Beden dolaşımıNefes ve geri saymaİmgelemeNiyete dönüşKapanış')
    expect(c).toContain(YT.library.open) // yazılı eylem ("Derse git"; yeni metin)
    expect(c).not.toMatch(/\d+ ders\b/) // "1 ders" sayısı yok (üç değerlendirici: "boş raf hissi")
    await r.unmount()
  })
  it('önce ve sonra puanı ile zorlanma sorusu temada; ölçek tek ayarlanabilir öğe; sonra puanında önceki puan yalnız seçimden sonra', async () => {
    seen()
    const r = await mount({ route: 'yoga-2' })
    await r.tap('Başla')
    const main = () => r.container.querySelectorAll((n) => n.nodeName === 'MAIN')[0]
    expect(inNight(main())).toBe(false)
    expect(main().getAttribute('class')).toContain('is-before')
    expect(r.text()).toContain(YT.rate.why)
    const sl = r.slider()
    expect([sl.getAttribute('aria-label'), sl.getAttribute('aria-valuemin'), sl.getAttribute('aria-valuemax')]).toEqual(['beden gerginliği', '1', '10'])
    expect(sl.hasAttribute('aria-valuenow')).toBe(false) // seçim yapılana kadar değer yok
    expect(r.cls(/yg-hz-thumb/)).toHaveLength(0)
    expect(r.cls(/yg-hz-stop/)).toHaveLength(10)
    await r.rate(6)
    expect(r.slider().getAttribute('aria-valuenow')).toBe('6')
    expect(r.cls(/yg-hz-thumb/)[0].textContent).toBe('6')
    await r.tap('Devam')
    await tick()
    currentLesson().listened = 820
    eng.time = 900
    eng.playing = false
    await tick()
    expect(main().getAttribute('class')).toContain('is-after')
    expect(main().getAttribute('class')).toContain('yg-dawn-in') // oynatıcının karanlığından temaya yavaşça
    expect(inNight(main())).toBe(false)
    expect(r.text()).toContain('Bedenin şu an ne kadar gergin?')
    expect(r.text()).toContain(YT.rate.again)
    // Seçimden önce önceki puanın hiçbir izi yok (çıpalama; OZET.md §10)
    expect(r.slider().hasAttribute('aria-valuenow')).toBe(false)
    expect(r.cls(/yg-hz-was/)).toHaveLength(0)
    expect(r.text()).not.toContain(YT.rate.was)
    const line = r.cls(/yg-was-line/)[0]
    expect(line.getAttribute('aria-live')).toBe('polite')
    await r.rate(4)
    expect(line.textContent).toBe('Dersten önce: 6')
    expect(r.cls(/yg-hz-was/)).toHaveLength(1) // ölçekte önceki puanın yeri, yalnız şimdi
    await r.tap('Atla')
    expect(r.text()).toContain('Ders sırasında zorlandın mı?')
    expect(inNight(main())).toBe(false)
    await r.tap('Atla')
    expect(r.text()).toContain('Ders bitti')
    await r.unmount()
  })
  it('önce puanı atlandıysa sonra puanında önceki puan satırı hiç yok', async () => {
    seen()
    const r = await mount({ route: 'yoga-2' })
    await r.tap('Başla')
    await r.tap('Atla')
    await tick()
    currentLesson().listened = 820
    eng.time = 900
    eng.playing = false
    await tick()
    expect(r.text()).toContain(YT.rate.again)
    await r.rate(3)
    expect(r.cls(/yg-was-line/)).toHaveLength(0)
    expect(r.cls(/yg-hz-was/)).toHaveLength(0)
    await r.unmount()
  })
  it('ölçek klavye ve VoiceOver ile: seçim yokken artır 1\'den, azalt 10\'dan başlar; uçlarda durur', async () => {
    seen()
    const r = await mount({ route: 'yoga-2' })
    await r.tap('Başla')
    await r.key('ArrowRight')
    expect(r.slider().getAttribute('aria-valuenow')).toBe('1')
    expect(r.slider().getAttribute('aria-valuetext')).toBe('1, hiç')
    await r.key('ArrowUp')
    expect(r.slider().getAttribute('aria-valuenow')).toBe('2')
    await r.key('End')
    expect(r.slider().getAttribute('aria-valuetext')).toBe('10, çok')
    await r.key('ArrowRight')
    expect(r.slider().getAttribute('aria-valuenow')).toBe('10')
    await r.unmount()
    const r2 = await mount({ route: 'yoga-2' })
    await r2.tap('Başla')
    await r2.key('ArrowDown')
    expect(r2.slider().getAttribute('aria-valuenow')).toBe('10')
    await r2.unmount()
  })
})

describe('ders: baştan sona', () => {
  it('ses denetimi dosyası yok: adım görünmez → önce puanı → oynatıcı → Kapanışa geç → bitiş → sonra puanı → "Çok" → bitiş ekranı', async () => {
    mem.set('gozolcum:yoga-opts', JSON.stringify({ safetySeen: true }))
    const r = await mount()
    await r.tapWhere((n) => n.textContent.includes('Derin Dinlenme'))
    await r.tap('Başla')
    // Ekrandaki sözcükler söylenmeyecekse yazılmaz (ekrandaki cümle = söylenen cümle); dosya gelince bir kez sorulur
    expect(r.text()).not.toContain('Sağ kürek kemiği… diz… üç…')
    expect(r.text()).not.toContain('Ses denetimi')
    expect(optsNow().soundCheck).toBe('nofile')
    // önce puanı
    expect(r.text()).toContain('Bedenin şu an ne kadar gergin?')
    expect(r.btn('Devam').hasAttribute('disabled')).toBe(true)
    await r.rate(6)
    await r.tap('Devam')
    expect(eng.calls[0]).toEqual(['start', { file: 'yoga/ders2-15.mp3', at: 0, title: 'Derin Dinlenme', id: currentLesson().runId }])
    expect(currentLesson().runId).toMatch(/^yoga-/) // yerel kaydın kimliği (uzlaştırma)
    expect(r.btn('Dersi bitir')).toBeTruthy()
    await tick()
    await tick()
    expect(r.btn('Kapanışa geç')).toBeTruthy() // çizelge yüklendi
    // yerel oynatıcıya bölüm adları (kilit ekranı) ve klip başları (kilitten sürdürme)
    const meta = eng.calls.find((c) => c[0] === 'meta')[1]
    expect(meta.file).toBe('yoga/ders2-15.mp3')
    expect(meta.sections.map((x) => x.name)).toEqual(['Karşılama', 'Niyet (sankalpa)', 'Beden dolaşımı', 'Nefes ve geri sayma', 'İmgeleme', 'Niyete dönüş', 'Kapanış'])
    expect(meta.resume.length).toBeGreaterThan(50)
    // cümlenin içindeyken "Kapanışa geç": cümle bitene kadar bekler
    eng.time = 710 // n2.hatirla (708.96–712.99)
    await tick()
    await r.tap('Kapanışa geç')
    expect(eng.calls.some((c) => c[0] === 'cross')).toBe(false)
    expect(r.btn('Kapanışa geç')).toBeUndefined()
    eng.time = 713.5
    await tick()
    const cross = eng.calls.find((c) => c[0] === 'cross')
    expect(cross[1].file).toBe('yoga/ders2-15.mp3')
    expect(cross[1].at).toBeCloseTo(750.929, 3)
    // dosya biter: kayıt hemen yazılır, puan sonra eklenir
    currentLesson().listened = 820
    eng.time = 900
    eng.playing = false
    await tick()
    expect(r.store.addSession).toHaveBeenCalledTimes(1)
    const rec = r.store.addSession.mock.calls[0][0]
    expect(rec.seconds).toBeGreaterThanOrEqual(820)
    expect(rec.seconds).toBeLessThanOrEqual(822) // son okumada geçen süre (duvar saatiyle sınırlı)
    expect(rec).toMatchObject({ type: 'yoga', lesson: 2, planned: 900, reachedClosing: true, completed: true, quickClose: true, before: 6, after: null, voice: 'hoc', bg: 'music', scene: 'orman', posture: 'lie', contentHash: '726417faa1760e11' })
    expect(r.p.onRefresh).toHaveBeenCalled()
    expect(eng.calls.map((c) => c[0])).toContain('stop')
    expect(eng.calls.at(-1)).toEqual(['journalClear']) // kayıt yazıldı: yerel kayıt silinir (iki kez yazılmaz)
    // sonra puanı: aynı soru (dersin yolunda "Sonra" şu anki adım)
    const now = r.container.querySelectorAll((n) => n.getAttribute('aria-current') === 'step')[0]
    expect(now.textContent).toBe('Sonra')
    expect(r.text()).toContain('Bedenin şu an ne kadar gergin?')
    await r.rate(3)
    await r.tap('Devam')
    expect(r.store.updateSession).toHaveBeenCalledWith('r1', { after: 3, delta: -3 })
    expect(r.p.onRefresh).toHaveBeenCalledTimes(2) // sonra puanı eklenince Gelişim yenilenir
    // zorlanma: "Çok" → bitirene göre metin. Ders 2'nin 15 dk'dan kısa yayımlanmış süresi yok: "daha kısa bir süre
    // seçebilir" denmez (yerine getirilemeyecek öneri)
    expect(r.text()).toContain('Ders sırasında zorlandın mı?')
    await r.tap('Çok')
    expect(r.store.updateSession).toHaveBeenCalledWith('r1', { hard: 'much' })
    expect(r.text()).toContain(YT.hard.muchFinishedNoShorter)
    expect(r.text()).not.toContain('daha kısa bir süre')
    expect(r.text()).not.toContain('durman doğruydu')
    await r.tap('Devam')
    const t = r.text()
    expect(t).toContain('Ders bitti')
    expect(t).toContain('Beden gerginliği 6 → 3')
    expect(t).toContain('14 dk · Kapanış')
    expect(t).toContain('Bu dersi neden böyle kurduk')
    // "Çok": daha kısa süre yok, aynı ders "en kısa" diye önerilmez; kütüphanede başka ders yok: öneri kartı yok
    expect(t).not.toContain('Derin Dinlenme · 15 dk')
    expect(t).not.toContain('Sıradaki')
    await r.tap('Tamam')
    expect(r.text()).toContain('Yoga ve Meditasyon')
    expect(currentLesson()).toBeNull()
    await r.unmount()
  })

  it('duraklat → sürdür o anki klibin başından; imgenin içinden kapanışa önce bırakma klibi', async () => {
    seen()
    const r = await mount({ route: 'yoga-2', sessions: [{ type: 'yoga', lesson: 2, date: '2026-09-01T10:00:00.000Z' }] })
    await r.tap('Başla')
    await r.tap('Atla')
    expect(eng.calls[0][0]).toBe('start')
    await tick()
    await tick()
    eng.time = 6.5 // a.hosgeldin#2
    await tick()
    await r.tap('Duraklat')
    expect(eng.calls.at(-1)).toEqual(['pause'])
    await tick()
    await r.tap('Sürdür')
    expect(eng.calls.at(-1)[0]).toBe('resume')
    expect(eng.calls.at(-1)[1].at).toBeCloseTo(4.1768 - 1.2, 3) // klibin ilk parçasının başı (geçiş payıyla)
    eng.time = 600 // imge penceresi, sessizlik
    await tick()
    await r.tap('Kapanışa geç')
    await tick()
    const first = eng.calls.filter((c) => c[0] === 'cross')
    expect(first).toHaveLength(1)
    expect(first[0][1].at).toBeCloseTo(687.49 - 1.2, 2) // c4.solma: "Görüntü usulca siliniyor."
    eng.time = 696
    await tick()
    const both = eng.calls.filter((c) => c[0] === 'cross')
    expect(both).toHaveLength(2)
    expect(both[1][1].at).toBeCloseTo(750.929, 3)
    await r.unmount()
    clearCurrentLesson()
  })

  it('X: onaysız durur; durdurma ekranı; "Tamam" → yalnız zorlanma sorusu; "Çok" durdurana göre; yoldan açıldıysa Ana sayfaya', async () => {
    seen()
    const r = await mount({ route: 'yoga-2' })
    expect(r.text()).toContain('Derin Dinlenme (Yoga Nidra)') // yoldan: doğrudan ayrıntı
    await r.tap('Başla')
    await r.tap('Atla') // önce puanı atlandı
    await tick()
    eng.time = 45
    await tick()
    currentLesson().listened = 45
    await r.tap('Dersi bitir')
    expect(eng.calls.slice(-2)).toEqual([['stop'], ['journalClear']]) // önce ses söner, kayıt yazılınca yerel kayıt silinir
    expect(r.text()).toContain('Gözlerini aç, etrafına bak, acele etme. Uzanıyorsan önce yana dön, sonra otur.')
    expect(r.btn('Sesli dönüşü dinle')).toBeUndefined() // dosya yok
    const rec = r.store.addSession.mock.calls[0][0]
    expect(rec).toMatchObject({ seconds: 45, reachedClosing: false, completed: false, before: null })
    await r.tap('Tamam')
    expect(r.text()).toContain('Ders sırasında zorlandın mı?')
    expect(r.text()).not.toContain('Bedenin şu an ne kadar gergin?') // sonra puanı sorulmaz
    await r.tap('Çok')
    expect(r.text()).toContain(YT.hard.muchStoppedNoShorter) // durdurana göre; daha kısa süre yok
    await r.tap('Devam')
    expect(r.p.onExit).toHaveBeenCalled()
    await r.unmount()
  })

  it('30 sn altında X: kayıt yok, zorlanma sorusu yok, kütüphaneye döner', async () => {
    seen()
    const r = await mount()
    await r.tapWhere((n) => n.textContent.includes('Derin Dinlenme'))
    await r.tap('Başla')
    await r.tap('Atla')
    await tick()
    eng.time = 10
    await tick()
    await r.tap('Dersi bitir')
    await r.tap('Tamam')
    expect(r.store.addSession).not.toHaveBeenCalled()
    expect(r.text()).toContain('Yoga ve Meditasyon')
    await r.unmount()
  })

  it('ekran kapanıp açılınca çalan ders oynatıcıya döner (ders yeniden başlamaz)', async () => {
    seen()
    const r = await mount({ route: 'yoga-2' })
    await r.tap('Başla')
    await r.tap('Atla')
    await r.unmount()
    const again = await mount({ route: 'yoga' })
    expect(again.btn('Dersi bitir')).toBeTruthy()
    expect(eng.calls.filter((c) => c[0] === 'start')).toHaveLength(1)
    await again.tap('Dersi bitir')
    await again.unmount()
  })

  it('yerel oturum başka yerden kapandı (uyku sesi duraklatılmış dersi kapattı): kayıt yerel kaydın bitiş anıyla; durdurma ekranı', async () => {
    seen()
    const r = await mount({ route: 'yoga-2' })
    await r.tap('Başla')
    await r.tap('Atla')
    await tick()
    eng.state = 'playing'
    eng.time = 300
    await tick()
    const id = currentLesson().runId
    const ended = Date.UTC(2026, 8, 29, 21, 0, 0) / 1000
    eng.state = 'idle'
    eng.playing = false
    eng.journal = { id, file: 'yoga/ders2-15.mp3', state: 'stopped', finished: false, listened: 290, maxTime: 300, time: 300, duration: 900, startedAt: ended - 400, updatedAt: ended, endedAt: ended }
    await tick()
    const rec = r.store.addSession.mock.calls[0][0]
    expect(rec).toMatchObject({ seconds: 290, completed: false, reachedClosing: false, date: new Date(ended * 1000).toISOString() })
    expect(r.text()).toContain('Gözlerini aç, etrafına bak, acele etme.')
    expect(eng.calls.at(-1)).toEqual(['journalClear'])
    expect(eng.calls.some((c) => c[0] === 'stop')).toBe(false) // kapanmış oturum yeniden durdurulmaz
    await r.unmount()
  })

  it('bellekte ders yok ama yerelde sürüyor (WebView yeniden yüklendi): Yoga açılınca oynatıcı derse bağlanır, ders yeniden başlamaz', async () => {
    seen()
    Object.assign(eng, { state: 'playing', playing: true, time: 120 })
    eng.journal = { id: 'yoga-eski', file: 'yoga/ders2-15.mp3', state: 'playing', finished: false, listened: 118, maxTime: 120, startedAt: 1790000000, updatedAt: 1790000120 }
    const r = await mount({ route: 'yoga' })
    await act(async () => wait(30))
    expect(r.btn('Dersi bitir')).toBeTruthy()
    expect(eng.calls.filter((c) => c[0] === 'start')).toHaveLength(0)
    expect(currentLesson()).toMatchObject({ lesson: 2, minutes: 15, runId: 'yoga-eski', listened: 118, started: true })
    await r.tap('Dersi bitir')
    expect(r.store.addSession.mock.calls[0][0]).toMatchObject({ lesson: 2, seconds: 118, startedAt: new Date(1790000000 * 1000).toISOString() })
    await r.unmount()
  })

  it('ses açılamadı: uyarı hemen görünür; oynatıcı ya da dosya yoksa "yeniden dene" önerilmez', async () => {
    seen()
    eng.startError = 'PLAY'
    const r = await mount({ route: 'yoga-2' })
    await r.tap('Başla')
    await r.tap('Atla')
    await act(async () => wait(10))
    expect(r.text()).toContain(YT.player.audioError)
    expect(r.btn('Yeniden dene')).toBeTruthy()
    await r.tap('Dersi bitir')
    await r.tap('Tamam')
    await r.unmount()
    clearCurrentLesson()
    eng.startError = 'MISSING'
    const r2 = await mount({ route: 'yoga-2' })
    await r2.tap('Başla')
    await r2.tap('Atla')
    await act(async () => wait(10))
    expect(r2.text()).toContain(YT.player.audioErrorShort)
    expect(r2.text()).not.toContain('sessiz modunu')
    expect(r2.btn('Yeniden dene')).toBeUndefined()
    await r2.unmount()
  })

  it('gün sınırı: gece duraklatılan ders ertesi sabah X ile kapanınca kayıt duraklatma anına (dinlenen güne) yazılır', async () => {
    // Bulgu (inceleme): kaydın tarihi X'e basılan an oluyordu; o gün hiç dinlenmediği hâlde haftalık hedefe, seriye,
    // Nef'in gün sayısına ve 28 günlük şeride 30 Eylül giriyordu
    vi.useFakeTimers({ toFake: ['Date'] })
    try {
      vi.setSystemTime(new Date(2026, 8, 29, 23, 40))
      seen()
      const r = await mount({ route: 'yoga-2' })
      await r.tap('Başla')
      await r.tap('Atla')
      await tick()
      await tick()
      eng.time = 600
      currentLesson().listened = 600
      await tick()
      vi.setSystemTime(new Date(2026, 8, 29, 23, 50))
      await r.tap('Duraklat')
      await tick()
      vi.setSystemTime(new Date(2026, 8, 30, 8, 0)) // uygulama bellekte kaldı; sabah Yoga açık, X
      await tick()
      await r.tap('Dersi bitir')
      const rec = r.store.addSession.mock.calls[0][0]
      expect(rec.date).toBe(new Date(2026, 8, 29, 23, 50).toISOString())
      expect(dayKey(rec.date)).toBe('2026-09-29')
      await r.unmount()
    } finally {
      vi.useRealTimers()
    }
  })

  it('kilit ekranından duraklatılan ders: duraklatma anı yerel oynatıcıdan (ekran saatler sonra açılsa da)', async () => {
    seen()
    const r = await mount({ route: 'yoga-2' })
    await r.tap('Başla')
    await r.tap('Atla')
    eng.state = 'playing'
    await tick()
    eng.time = 500
    currentLesson().listened = 500
    await tick()
    const pausedAt = Date.UTC(2026, 8, 29, 20, 50, 0) / 1000
    eng.state = 'paused'
    eng.playing = false
    eng.pausedAt = pausedAt
    await tick()
    await r.tap('Dersi bitir')
    expect(r.store.addSession.mock.calls[0][0].date).toBe(new Date(pausedAt * 1000).toISOString())
    await r.unmount()
  })

  it('kapanış iki sarmayla atlanamaz: sona sarma kapanışın başına iner, kapanışın içinden ikinci ileri sarma yerinde kalır', async () => {
    // Bulgu (inceleme): 895'e iki sürükleme 750,9 → 891'e iniyordu; dışa dönüş ("önce bir yanına dön", "yavaşça doğrulup
    // otur") atlanıyordu (PLAN.v3 §D.6; modul.md §10.1)
    seen()
    const r = await mount({ route: 'yoga-2' })
    await r.tap('Başla')
    await r.tap('Atla')
    await tick()
    await tick()
    eng.time = 400
    await tick()
    const s = currentLesson()
    expect(s.closeAt).toBeCloseTo(750.929, 3)
    const drag = async (v) => {
      const input = r.container.querySelectorAll((n) => n.nodeName === 'INPUT')[0]
      const props = input[Object.keys(input).find((k) => k.startsWith('__reactProps'))]
      await act(async () => props.onChange({ target: { value: String(v) } }))
      await act(async () => wait(450)) // bırakınca 400 ms sonra sarılır
    }
    await drag(895)
    const seeks = () => eng.calls.filter((c) => c[0] === 'seek' || c[0] === 'cross' || c[0] === 'resume')
    expect(seeks()).toHaveLength(1)
    expect(seeks()[0][1].at).toBeCloseTo(s.closeAt, 6)
    await tick()
    await drag(895)
    expect(seeks()).toHaveLength(1) // ikinci ileri sarma: yerel oynatıcıya hiçbir çağrı yok
    expect(s.lastPos).toBeCloseTo(s.closeAt, 6)
    await drag(300) // geri sarma serbest
    expect(seeks()).toHaveLength(2)
    expect(seeks()[1][1].at).toBeLessThan(310)
    await r.tap('Dersi bitir')
    await r.unmount()
  })

  it('"Tüm verileri sil": süren ders durur, bellekteki oturum unutulur; ders sonra bitince silinen önce puanı yazılmaz', async () => {
    // Bulgu (iki inceleme): silmeden sonra Yoga açılıp ders bitince önce puanı 7 olan kayıt boş depoya yazılıyordu
    seen()
    const r = await mount({ route: 'yoga-2' })
    await r.tap('Başla')
    await r.rate(7)
    await r.tap('Devam')
    eng.state = 'playing'
    await tick()
    eng.time = 400
    currentLesson().listened = 400
    await tick()
    await r.unmount() // kişi Bilgi sekmesine geçti, ders sürüyor
    eng.calls = []
    await resetLessonData() // App.jsx onReset
    expect(eng.calls).toEqual([['stop'], ['journalClear']])
    expect(currentLesson()).toBeNull()
    eng.state = 'idle'
    const again = await mount({ route: 'yoga', store: r.store })
    await act(async () => wait(30))
    expect(again.btn('Dersi bitir')).toBeUndefined() // oynatıcıya dönmez: kütüphane
    expect(again.text()).toContain('Yoga ve Meditasyon')
    await tick()
    expect(r.store.addSession).not.toHaveBeenCalled()
    await again.unmount()
  })

  it('denetimler 5 sn sonra yalnız görsel olarak gizlenir: VoiceOver için aria-hidden yok', async () => {
    seen()
    const r = await mount({ route: 'yoga-2' })
    await r.tap('Başla')
    await r.tap('Atla')
    const ctl = (await r.btn('Duraklat')).parentNode.parentNode
    expect(ctl.getAttribute('class')).toBe('yg-ctl')
    expect(ctl.getAttribute('aria-hidden')).toBeNull()
    await r.tap('Dersi bitir')
    await r.unmount()
  })

  it('oynatıcı: altyazı kapalıyken yalnız karşılama cümlesi yazılır; bölüm adı altyazının üstünde; kapanışın yeri şeritte', async () => {
    // 5 saniye yeniden tasarımı (oynatıcının ilk 5 saniyesi: "yalnız 'Karşılama' var, çalışıyor mu?"): altyazı ayarı
    // değişmez (varsayılan kapalı); dersin ilk klibi yine de yazılır. Ekrandaki cümle söylenen cümledir.
    seen()
    const r = await mount({ route: 'yoga-2' })
    await r.tap('Başla')
    await r.tap('Atla')
    await tick()
    await tick()
    const cap = () => r.cls(/\byg-cap\b/)[0].textContent
    const sec = () => r.cls(/\byg-sec-name\b/)[0]?.textContent ?? null
    eng.time = 4.5
    await tick()
    expect(optsNow().captions).toBeFalsy()
    expect(cap()).toBe('Hoş geldin.')
    expect(sec()).toBe('Karşılama')
    eng.time = 167
    await tick()
    expect(cap()).toBe('') // altyazı kapalı: karşılamadan sonra yazı yok
    expect(sec()).toBe('Beden dolaşımı')
    await r.tap('Altyazı')
    expect(optsNow().captions).toBe(true)
    expect(cap()).toBe('Hissetmesen de her adı içinden tekrarlayabilirsin.')
    expect(r.cls(/\byg-kmark\b/)).toHaveLength(1) // kapanışın yeri ("Kapanışa geç" ile aynı simge)
    await r.tap('Dersi bitir')
    await r.unmount()
  })

  it('depoda updateSession yoksa kayıt akışın sonunda puanlarla bir kez eklenir', async () => {
    seen()
    const store = { addSession: vi.fn((r) => r) }
    const r = await mount({ route: 'yoga-2', store })
    await r.tap('Başla')
    await r.rate(4)
    await r.tap('Devam')
    await tick()
    currentLesson().listened = 700
    eng.time = 900
    eng.playing = false
    await tick()
    expect(store.addSession).not.toHaveBeenCalled()
    await r.rate(2)
    await r.tap('Devam')
    await r.tap('Hayır')
    await r.tap('Tamam')
    expect(store.addSession).toHaveBeenCalledTimes(1)
    expect(store.addSession.mock.calls[0][0]).toMatchObject({ before: 4, after: 2, delta: -2, hard: 'no', completed: true })
    await r.unmount()
  })
})

describe('konum okuma (applyStatus)', () => {
  const S = (over) => ({ planned: 900, tl: null, listened: 0, lastPos: 100, lastWall: 0, maxPos: 100, playing: true, userPaused: false, extPaused: false, jumped: false, started: true, ended: false, ...over })
  it('dinlenen süre motorun konumundan; atlamada sayılmaz; duvar saatiyle sınırlı', () => {
    const s = S()
    applyStatus(s, { time: 100.25, duration: 900, playing: true }, 250)
    expect(s.listened).toBeCloseTo(0.25, 6)
    s.jumped = true
    applyStatus(s, { time: 500, duration: 900, playing: true }, 500)
    expect(s.listened).toBeCloseTo(0.25, 6)
    applyStatus(s, { time: 510, duration: 900, playing: true }, 750) // 0,25 sn'de 10 sn: en çok 1,25
    expect(s.listened).toBeCloseTo(1.5, 6)
  })
  it('kilitli ekranda geçen süre açılınca sayılır; dosya bitip motor başa dönerse bitti', () => {
    const s = S()
    applyStatus(s, { time: 700, duration: 900, playing: true }, 600000)
    expect(s.listened).toBeCloseTo(600, 6)
    const r = applyStatus(s, { time: 0, duration: 900, playing: false }, 900000)
    expect(r).toBe('ended')
    expect(s.listened).toBeCloseTo(800, 6)
    expect(s.maxPos).toBe(900)
  })
  it('kilitte uzaktan duraklatma, 20 dk sonra dönüş (yerel durum paused): bitti değil, dış duraklama; süre şişmez', () => {
    // Ekran en son 120. sn'de çalarken görüldü; ders 300. sn'de kilit ekranından duraklatıldı; 20 dk sonra dönüş
    const s = S({ lastPos: 120, maxPos: 120, lastWall: 0 })
    const r = applyStatus(s, { time: 300, duration: 900, playing: false, state: 'paused', reason: 'remote', listened: 180 }, 1200000)
    expect(r).toBeNull()
    expect(s.ended).toBe(false)
    expect(s.finished).toBeFalsy()
    expect(s.extPaused).toBe(true)
    expect(s.listened).toBe(180) // yerel oynatıcının saydığı süre; planlanan 900'ü aşmaz
    expect(s.maxPos).toBe(300)
    // sonra kilit ekranından sürdürüldü: yine çalıyor
    const r2 = applyStatus(s, { time: 301, duration: 900, playing: true, state: 'playing', listened: 181 }, 1200250)
    expect(r2).toBeNull()
    expect(s.extPaused).toBe(false)
  })
  it('yerel durum: finished / tail → bitti; idle → başka yerden kapandı; kişi duraklattıysa ve sonra kilitten sürdürüldüyse çalıyor', () => {
    expect(applyStatus(S(), { time: 900, duration: 900, playing: false, state: 'finished' }, 250)).toBe('ended')
    expect(applyStatus(S(), { time: 900, duration: 900, playing: false, state: 'tail' }, 250)).toBe('ended')
    const gone = S()
    expect(applyStatus(gone, { time: 0, duration: null, playing: false, state: 'idle' }, 250)).toBe('stopped')
    expect(gone.ended).toBe(true)
    expect(gone.finished).toBeFalsy()
    const u = S({ userPaused: true, playing: false })
    applyStatus(u, { time: 100.2, duration: 900, playing: true, state: 'playing' }, 250)
    expect(u.userPaused).toBe(false)
  })
  it('giriş dosyası (ilk ders cümlesi) çalarken konum ve süre sayılmaz; derse geçişte atlama sayılır', () => {
    const s = S({ lastPos: 0, maxPos: 0 })
    expect(applyStatus(s, { time: 5, duration: 7, playing: true, state: 'playing', prelude: true }, 250)).toBeNull()
    expect(s.listened).toBe(0)
    expect(s.lastPos).toBe(0)
    applyStatus(s, { time: 1, duration: 900, playing: true, state: 'playing' }, 500)
    expect(s.listened).toBe(0)
    expect(s.lastPos).toBe(1)
  })
  it('sarma kapanışı kısaltamaz: kapanıştan önceden kapanışın içine sarılırsa kapanışın başı (Kapanışa geç ile aynı)', async () => {
    const tl = await loadTimeline('yoga/ders2-15.timeline.json')
    const sections = sectionsOfTimeline(tl)
    const closeAt = closingAt(tl)
    expect(closeAt).toBeCloseTo(750.929, 3)
    const s = { tl, lastPos: 400, closeAt }
    expect(seekTarget(tl, sections, 880)).toBeGreaterThan(closeAt) // korumasız hedef k.kalk'a iner
    expect(seekGoal(s, sections, 880)).toBeCloseTo(closeAt, 6)
    expect(seekGoal(s, sections, 300)).toBe(seekTarget(tl, sections, 300)) // geri sarma serbest
    // kapanışın içinden ileri sarılamaz (iki sarmayla dışa dönüş atlanamaz); geri sarma serbest
    expect(seekGoal({ ...s, lastPos: 800 }, sections, 880)).toBe(800)
    expect(seekGoal({ ...s, lastPos: closeAt }, sections, 895)).toBe(closeAt)
    expect(seekGoal({ ...s, lastPos: 800 }, sections, 300)).toBe(seekTarget(tl, sections, 300))
  })
  it('yerel sürdürme aralıkları resumePoint ile aynı noktayı verir', async () => {
    const tl = await loadTimeline('yoga/ders2-15.timeline.json')
    const spans = resumeSpans(tl)
    for (const t of [6.5, 120.3, 333.3, 600, 710, 890]) {
      const hit = spans.find((x) => t >= x.from && t < x.to)
      expect(hit ? hit.at : t).toBeCloseTo(resumePoint(tl, t), 6)
    }
  })
  it('duraklatma anı: yerel oynatıcının pausedAt\'i, yoksa duraklamanın ilk görüldüğü an; çalınca ve bitince silinir', () => {
    const s = S()
    applyStatus(s, { time: 300, duration: 900, playing: false, state: 'paused', reason: 'remote', pausedAt: 1000 }, 5000000)
    expect(s.pausedAt).toBe(1000000)
    applyStatus(s, { time: 300, duration: 900, playing: true, state: 'playing' }, 5000250)
    expect(s.pausedAt).toBeNull()
    const old = S() // state göndermeyen eski derleme: ilk görülen an, sonra değişmez
    applyStatus(old, { time: 100.2, duration: 900, playing: false }, 250)
    applyStatus(old, { time: 100.2, duration: 900, playing: false }, 90000)
    expect(old.pausedAt).toBe(250)
    const done = S({ pausedAt: 10 })
    applyStatus(done, { time: 900, duration: 900, playing: false, state: 'finished' }, 500)
    expect(done.pausedAt).toBeNull()
  })
  it('kulaklık çıkınca (motor durdu, kişi durdurmadı): dış duraklama, bitiş değil', () => {
    const s = S()
    const r = applyStatus(s, { time: 100.2, duration: 900, playing: false }, 250)
    expect(r).toBeNull()
    expect(s.extPaused).toBe(true)
    applyStatus(s, { time: 100.2, duration: 900, playing: true }, 500)
    expect(s.extPaused).toBe(false)
  })
})
