// Zaman çizelgesi işlevleri pilot biçimindeki Ders 2 · 15 dk çizelgesiyle (modul.md §16-A4). Bu dosya 2026-09-30'a dek
// public/yoga/ders2-15.timeline.json idi (A adımı karışımı); onaylı ilk bölüm dosyası (nefona.yoga.timeline/2) yerine
// geçince eski biçimin okunmaya devam ettiği burada sınanır (testdata/ders2-15.v1.timeline.json; yalnız mutlak geçici
// yollar dosya adına indirildi). Yeni biçimin on bir çizelgesi: timeline.v2.test.js.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  speechAt, captionAt, clipStartAt, resumePoint, seekPoint, nearestClipStart, sectionsOfTimeline, sectionAt, closingAt,
  imageWindows, jumpPlan, visualAt, loadTimeline, durationOf, LEAD_SEC, seekTarget, guardClosing, welcomeCaption, sectionSpans,
  loadTimelineCached, cachedTimeline, captionBefore, isV2, releaseWindows, silenceWindows, breathCycles, emberAt,
} from './timeline.js'

const tl = JSON.parse(readFileSync(fileURLToPath(new URL('./testdata/ders2-15.v1.timeline.json', import.meta.url)), 'utf8'))
const piece = (name) => tl.speech.find((s) => s.piece === name)

describe('altyazı ve klipler', () => {
  it('altyazı o anki cümledir (ekran = söylenen); sessizlikte yazı yok', () => {
    for (const s of tl.speech) expect(captionAt(tl, (s.start + s.end) / 2)).toBe(s.screen_text)
    expect(captionAt(tl, 1)).toBeNull() // ilk sözden önce müzik
    const gap = tl.speech.findIndex((s, i) => i > 0 && s.start - tl.speech[i - 1].end > 10)
    expect(captionAt(tl, tl.speech[gap - 1].end + 5)).toBeNull()
    expect(captionAt(tl, piece('k.son').end + 0.5)).toBe('Buradasın ve uyanıksın.') // cümle bitince kısa süre kalır
  })
  it('duraklatılan ders klibin başından sürer; sessizlikte bulunduğu yerden', () => {
    const a1 = piece('a.hosgeldin#1')
    const a2 = piece('a.hosgeldin#2')
    expect(clipStartAt(tl, (a2.start + a2.end) / 2)).toBe(a1.start) // iki parçalı klip: ilk parçanın başı
    expect(resumePoint(tl, (a2.start + a2.end) / 2)).toBeCloseTo(Math.max(0, a1.start - LEAD_SEC), 5)
    const silent = a2.end + 1
    expect(speechAt(tl, silent)).toBeNull()
    expect(resumePoint(tl, silent)).toBe(silent)
  })
  it('klip başına oturma noktası önceki cümlenin içine düşmez', () => {
    for (const s of tl.speech) {
      const p = seekPoint(tl, s.start)
      expect(p).toBeLessThanOrEqual(s.start)
      const prev = tl.speech.filter((x) => x.end <= s.start).at(-1)
      if (prev) expect(p).toBeGreaterThanOrEqual(prev.end)
    }
    expect(nearestClipStart(tl, 5.5)).toBe(piece('a.hosgeldin#1').start)
  })
})

describe('bölümler ve kapanış', () => {
  it('bölümler çizelgenin blok sırası (köprüler hariç), ilki 0\'dan', () => {
    const secs = sectionsOfTimeline(tl)
    expect(secs.map((s) => s.id)).toEqual(['A', 'N1', 'C1', 'C2', 'C4', 'N2', 'K'])
    expect(secs[0].at).toBe(0)
    for (const s of secs.slice(1)) {
      const first = tl.speech.find((x) => x.block === s.id)
      expect(s.at).toBeLessThanOrEqual(first.start)
      expect(speechAt(tl, s.at)).toBeNull()
    }
    expect(sectionAt(secs, 0)).toBe('A')
    expect(sectionAt(secs, 600)).toBe('C4')
    expect(sectionAt(secs, 899)).toBe('K')
  })
  it('sarma: bölüm başına yakın bırakılırsa bölüme atlar, değilse en yakın klip başına oturur', () => {
    const secs = sectionsOfTimeline(tl)
    const c4 = secs.find((s) => s.id === 'C4')
    expect(seekTarget(tl, secs, c4.at + 5)).toBe(c4.at)
    expect(seekTarget(tl, secs, c4.at - 5)).toBe(c4.at)
    const mid = seekTarget(tl, secs, 620)
    expect(speechAt(tl, mid)).toBeNull()
    expect(mid).toBeCloseTo(piece('c4.yol#1').start - LEAD_SEC, 6)
  })
  it('"Kapanışa geç" noktası: dönüş tınısından 2 sn önce, önceki cümleden sonra, kapanış evresinden önce', () => {
    const c = closingAt(tl)
    const tone = tl.music_events.find((e) => e.event === 'returnTone')
    expect(c).toBeCloseTo(tone.t - 2, 6)
    expect(c).toBeGreaterThan(piece('k.anahtar3').end)
    expect(c).toBeLessThan(piece('k.donus').start)
    expect(speechAt(tl, c)).toBeNull()
    expect(closingAt({ speech: [] })).toBeNull()
  })
  it('kapanış kısalmaz: dışından içine sarma kapanışın başına; içinden ileri sarma yerinde kalır; geri sarma serbest', () => {
    const c = closingAt(tl)
    expect(guardClosing(895, 400, c)).toBe(c) // kapanıştan önceden sona: kapanışın başı
    expect(guardClosing(300, 400, c)).toBe(300) // kapanıştan önce geri
    // Bulgu (inceleme): iki sarmayla dışa dönüş atlanıyordu (895 → 750,9 → 891). Kapanışın içinden ileri sarma yok
    expect(guardClosing(891, c, c)).toBe(c)
    expect(guardClosing(891, 800, c)).toBe(800)
    expect(guardClosing(780, 800, c)).toBe(780) // kapanışın içinde geri
    expect(guardClosing(500, 800, c)).toBe(500) // kapanıştan geri çıkış
    expect(guardClosing(895, 400, null)).toBe(895) // çizelgede kapanış yok
  })
  it('imge penceresi ve bırakma klibi (c4.solma)', () => {
    const w = imageWindows(tl)
    expect(w).toHaveLength(1)
    expect(w[0].on).toBeCloseTo(571.451, 3)
    expect(w[0].off).toBeCloseTo(687.49, 3)
    expect(w[0].release.start).toBeCloseTo(piece('c4.solma#1').start, 6)
    expect(w[0].release.end).toBeCloseTo(piece('c4.solma#2').end, 6)
  })
  it('imgenin içinden kapanışa: önce bırakma klibi, sonra kapanış; dışından doğrudan', () => {
    const c = closingAt(tl)
    const w = imageWindows(tl)[0]
    const steps = jumpPlan(tl, 600, c)
    expect(steps).toHaveLength(2)
    expect(steps[0].at).toBeLessThanOrEqual(w.release.start)
    expect(steps[0].until).toBeCloseTo(w.release.end + 1, 6)
    expect(steps[1]).toEqual({ at: c })
    expect(jumpPlan(tl, 300, c)).toEqual([{ at: c }])
    expect(jumpPlan(tl, 600, 610)).toEqual([{ at: 610 }]) // imge içinde kalan sarma
  })
})

describe('nefes formu (visualAt)', () => {
  const at = (t, o) => visualAt(tl, t, o)
  it('evreler sırayla: varış → derinleşme → derin → kapanış', () => {
    expect(at(30).phase).toBe('varis')
    expect(at(200).phase).toBe('derinlesme')
    expect(at(400).phase).toBe('derin')
    expect(at(800).phase).toBe('kapanis')
    expect(at(30).luminance).toBeGreaterThan(at(400).luminance)
  })
  it('nabız yalnız nöbet cevabı "Hayır" (flashSafe true) ve Hareketi Azalt kapalıyken', () => {
    const pulse = tl.visual.find((e) => e.cue === 'pulse').t
    expect(at(pulse + 2.5, { flashSafe: true }).scale).toBeGreaterThan(1.05)
    expect(at(pulse + 2.5, { flashSafe: null }).scale).toBe(1)
    expect(at(pulse + 2.5, { flashSafe: false }).scale).toBe(1)
    expect(at(pulse + 2.5, { flashSafe: true, reduceMotion: true }).scale).toBe(1)
    for (let t = 0; t <= 900; t += 0.5) expect(at(t, { flashSafe: true }).scale).toBeLessThanOrEqual(1.06)
  })
  it('imge açık/kapalı; şafak rampası ≥ 60 sn; sonda karanlık', () => {
    expect(at(600).image).toBe(true)
    expect(at(700).image).toBe(false)
    const dawn = tl.visual.find((e) => e.cue === 'dawn:start')
    expect(dawn.span_s).toBeGreaterThanOrEqual(60)
    expect(at(dawn.t - 1).dawn).toBe(false)
    expect(at(dawn.t + 30).dawn).toBe(true)
    expect(at(dawn.t + 60).luminance).toBeGreaterThan(at(dawn.t + 1).luminance)
    expect(at(durationOf(tl)).luminance).toBe(0)
    expect(at(durationOf(tl)).end).toBe(true)
  })
  it('yanıp sönme yok: ışık saniyede en çok 0,35 değişir; aynı girdi aynı çıktı', () => {
    let prev = at(0, { flashSafe: true }).luminance
    for (let t = 0.25; t <= 900; t += 0.25) {
      const l = at(t, { flashSafe: true }).luminance
      expect(Math.abs(l - prev), `t=${t}`).toBeLessThanOrEqual(0.35 * 0.25 + 1e-9)
      prev = l
    }
    expect(at(512.3, { flashSafe: true })).toEqual(at(512.3, { flashSafe: true }))
  })
  it('gece dersi: kapanıştan sonra kor söner (uyku izni)', () => {
    expect(at(800, { night: true }).ember).toBe(true)
    expect(at(700, { night: true }).ember).toBe(false)
    expect(at(800, { night: true }).dawn).toBe(false)
  })
})

describe('çizelge yükleme', () => {
  it('başarılı, 404 ve hata', async () => {
    expect(await loadTimeline('x', async () => ({ ok: true, json: async () => tl }))).toBe(tl)
    expect(await loadTimeline('x', async () => ({ ok: false }))).toBeNull()
    expect(await loadTimeline('x', async () => { throw new Error('ağ') })).toBeNull()
    expect(await loadTimeline('x', async () => ({ ok: true, json: async () => ({}) }))).toBeNull()
  })
})

// 5 saniye yeniden tasarımı (C_5SN_RAPORU.md): altyazı kapalıyken de karşılama klibi yazılır; bölüm şeridi süreyle orantılı
describe('karşılama cümlesi ve bölüm süreleri', () => {
  it('karşılama: yalnız dersin ilk klibi (Ders 2: "Hoş geldin." · "Bu dakikalar senin."), ekrandaki cümle söylenen cümle', () => {
    const a1 = piece('a.hosgeldin#1')
    const a2 = piece('a.hosgeldin#2')
    expect(welcomeCaption(tl, 1)).toBeNull() // ilk sözden önce yazı yok
    expect(welcomeCaption(tl, (a1.start + a1.end) / 2)).toBe(a1.screen_text)
    expect(welcomeCaption(tl, (a2.start + a2.end) / 2)).toBe(a2.screen_text)
    const next = tl.speech.find((x) => x.clip !== a1.clip)
    expect(welcomeCaption(tl, (next.start + next.end) / 2)).toBeNull() // sonrası yalnız altyazı açıkken
    expect(welcomeCaption(null, 5)).toBeNull()
  })
  // Kapı turu 2: "'Hissetmesen de her adı…' tek başına okununca 'hangi ad?'": altyazı açıkken önceki cümle sönük yazılır
  it('önceki cümle: yalnız aynı bölümde ve kısa aralıkta; ekrandaki her cümle söylenmiş bir cümle', () => {
    const tekrar = piece('c1.tekrar')
    expect(captionBefore(tl, (tekrar.start + tekrar.end) / 2)).toBe('Rahatsız eden bir bölge olursa atla.')
    const a1 = piece('a.hosgeldin#1')
    expect(captionBefore(tl, (a1.start + a1.end) / 2)).toBeNull() // ilk cümlenin öncesi yok
    const firstC1 = tl.speech.find((x) => x.block === 'C1')
    expect(captionBefore(tl, (firstC1.start + firstC1.end) / 2)).toBeNull() // bölüm değişti: önceki bölümün cümlesi yazılmaz
    for (let i = 1; i < tl.speech.length; i++) {
      const cur = tl.speech[i]
      const got = captionBefore(tl, (cur.start + cur.end) / 2)
      if (got == null) continue
      const prev = tl.speech[i - 1]
      expect(got).toBe(prev.screen_text)
      expect(prev.block).toBe(cur.block)
      expect(cur.start - prev.end).toBeLessThanOrEqual(8)
    }
    expect(captionBefore(tl, 1)).toBeNull() // sessizlik
    expect(captionBefore(null, 5)).toBeNull()
  })
  it('bölüm süreleri: her bölüm bir sonrakinin başına kadar; toplam dersin süresi', () => {
    const spans = sectionSpans(tl)
    expect(Object.keys(spans)).toEqual(sectionsOfTimeline(tl).map((x) => x.id))
    expect(Object.values(spans).reduce((a, b) => a + b, 0)).toBeCloseTo(durationOf(tl), 6)
    expect(sectionSpans(null)).toBeNull()
  })
  it('çizelge bir kez okunur; okunamayan önbelleğe girmez', async () => {
    let n = 0
    const ok = async () => { n += 1; return { ok: true, json: async () => tl } }
    expect(await loadTimelineCached('cache-test.json', ok)).toBe(tl)
    expect(await loadTimelineCached('cache-test.json', ok)).toBe(tl)
    expect(n).toBe(1)
    expect(cachedTimeline('cache-test.json')).toBe(tl)
    expect(await loadTimelineCached('yok.json', async () => ({ ok: false }))).toBeNull()
    expect(cachedTimeline('yok.json')).toBeNull()
  })
})

// Eski biçim bozulmadı: closing / release / windows / ring alanları yokken önceki yollar işler
describe('pilot biçimi (timeline/2 alanları yok)', () => {
  it('şema yok; kapanış tınıdan, bırakma image:on/off ipuçlarından; pencere ve halka yok; kor closingAt\'te', () => {
    expect(isV2(tl)).toBe(false)
    expect(tl.closing).toBeUndefined()
    expect(releaseWindows(tl)).toEqual(imageWindows(tl))
    expect(silenceWindows(tl)).toEqual([])
    expect(breathCycles(tl)).toEqual([])
    expect(emberAt(tl)).toBe(closingAt(tl))
    for (let t = 0; t <= 900; t += 7) expect(visualAt(tl, t).breath).toBe(0)
  })
  it('yalın timeline/2 kaydı: closing.jumpTo okunur; cümlenin içine düşen değer cümlenin sonrasına kayar', () => {
    const sp = [{ clip: 'a', block: 'A', start: 1, end: 3, screenText: 'Bir.', spokenText: 'Bir.' }, { clip: 'k', block: 'K', start: 10, end: 12, screenText: 'İki.', spokenText: 'Bir.' }]
    const mini = { schema: 'nefona.yoga.timeline/2', T: 20, speech: sp, closing: { jumpTo: 6 } }
    expect(isV2(mini)).toBe(true)
    expect(closingAt(mini)).toBe(6)
    expect(closingAt({ ...mini, closing: { jumpTo: 11 } })).toBeCloseTo(12.2, 6)
    expect(closingAt({ ...mini, closing: { jumpTo: 50 } })).toBe(20)
    // yalnız camelCase alanlar: altyazı screenText; ekrandaki ≠ söylenen olan cümle yazılmaz
    expect(captionAt(mini, 2)).toBe('Bir.')
    expect(captionAt(mini, 11)).toBeNull()
  })
})
