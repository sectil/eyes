// İlk bölümün on bir çizelgesi (nefona.yoga.timeline/2; public/yoga/dersN-DK.timeline.json, render/out/ilk-bolum'dan
// birebir): kapanış anı, evreler, görsel ipuçları, altyazı. Oynatıcının bu çizelgelerde bilinen üç hatası (ACIK_ISLER
// A1; acik-isler-denetimi/yoga.md Y-03): (a) closingAt ilk returnTone'u alıyordu, pencere dönüşleri de returnTone
// olduğu için Ders 5 · 15'te 577,45, Ders 2 · 20'de 956,5 sn çıkıyordu; (b) Ders 3 ve 5'in açıklamalı evre adları
// PHASE_LIGHT'ta ve BreathForm'da yoktu; (c) Ders 1'in ring:in/out ipuçları okunmuyordu.
import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  speechAt, captionAt, captionBefore, welcomeCaption, sectionsOfTimeline, sectionSpans, sectionAt, closingAt, seekTarget,
  guardClosing, jumpPlan, visualAt, resumeSpans, seekPoint, durationOf, isV2, phaseKey, releaseWindows, silenceWindows,
  breathCycles, breathAt, emberAt, PHASE_LIGHT, RING_GROW, PULSE_GROW,
} from './timeline.js'
import { reachedClosing } from './session.js'
import { recordFromJournal } from '../../lib/yogaRecord.js'
import BreathForm from './BreathForm.jsx'

const PUBLIC = fileURLToPath(new URL('../../../public/', import.meta.url))
// Uykuya Geçiş (Ders 3) Build 60'ta yayında değil (sahip kararı 2026-09-30): uygulama kopyası testdata'da durur
const TESTDATA = fileURLToPath(new URL('./testdata/', import.meta.url))
const load = (name) => JSON.parse(readFileSync(existsSync(`${PUBLIC}yoga/${name}.timeline.json`) ? `${PUBLIC}yoga/${name}.timeline.json` : `${TESTDATA}${name}.timeline.json`, 'utf8'))
const NAMES = ['ders1-3', 'ders1-5', 'ders1-15', 'ders2-5', 'ders2-15', 'ders2-20', 'ders3-5', 'ders3-15', 'ders5-3', 'ders5-5', 'ders5-15']
const ALL = Object.fromEntries(NAMES.map((n) => [n, load(n)]))
const lessonNo = (n) => Number(n.match(/^ders(\d+)-/)[1])
const night = (n) => lessonNo(n) === 3 // Uykuya Geçiş (lib/yogaLessons.js daypart 'night')
const mid = (s) => (s.start + s.end) / 2
const tones = (tl) => tl.music_events.filter((e) => e.event === 'returnTone').map((e) => e.t)
// Ekrandaki cümlenin çizelgedeki iki yazımı (timeline/2 hem screen_text hem screenText taşır)
const screen = (s) => s.screenText ?? s.screen_text

// Çizelgeden ölçülmüş beklentiler (render/out/ilk-bolum; closing.jumpTo, ilk sözü K bloğunda). Ders 2'de jumpTo k.donus
// klibinden sonra (mixib.py closing_event; B1): kapanış dönüş tınısından önceki sessizlik, tını − 2 (753,124 − 2 vb.)
const CLOSING = {
  'ders1-3': 124.902, 'ders1-5': 226.63, 'ders1-15': 789.557,
  'ders2-5': 198.298, 'ders2-15': 751.124, 'ders2-20': 1053.181,
  'ders3-5': 250.386, 'ders3-15': 827.825,
  'ders5-3': 121.812, 'ders5-5': 222.699, 'ders5-15': 757.393,
}
const PHASES = {
  1: { 3: ['varis', 'derinlesme', 'kapanis'], 5: ['varis', 'derinlesme', 'kapanis'], 15: ['varis', 'derinlesme', 'derin', 'kapanis'] },
  2: { 5: ['varis', 'derinlesme', 'derin', 'kapanis'], 15: ['varis', 'derinlesme', 'derin', 'kapanis'], 20: ['varis', 'derinlesme', 'derin', 'kapanis'] },
  3: { 5: ['varis', 'derinlesme', 'derin'], 15: ['varis', 'derinlesme', 'derin'] },
  5: { 3: ['varis', 'derinlesme', 'kapanis'], 5: ['varis', 'derinlesme', 'kapanis'], 15: ['varis', 'derinlesme', 'derin', 'kapanis'] },
}
const SECTIONS = {
  'ders1-3': ['A', 'C1', 'K'], 'ders1-5': ['A', 'C1', 'K'], 'ders1-15': ['A', 'C1', 'C2', 'C3', 'K'],
  'ders2-5': ['A', 'N1', 'C1', 'C2', 'N2', 'K'], 'ders2-15': ['A', 'N1', 'C1', 'C2', 'C4', 'N2', 'K'],
  'ders2-20': ['A', 'N1', 'C1', 'C2', 'C3', 'C4', 'N2', 'K'],
  'ders3-5': ['A', 'C1', 'C2', 'C3', 'K'], 'ders3-15': ['A', 'C1', 'C2', 'C4', 'C3', 'K'],
  'ders5-3': ['A', 'C1', 'K'], 'ders5-5': ['A', 'C1', 'K'], 'ders5-15': ['A', 'C1', 'C2', 'C3', 'K'],
}

describe.each(NAMES)('%s', (name) => {
  const tl = ALL[name]
  const L = lessonNo(name)
  const minutes = Number(name.split('-')[1])
  const T = durationOf(tl)
  const at = (t, o) => visualAt(tl, t, { night: night(name), ...o })

  it('biçim: timeline/2, dosya adı, süre; mutlak yol yok', () => {
    expect(isV2(tl)).toBe(true)
    expect(tl.schema).toBe('nefona.yoga.timeline/2')
    expect(tl.file).toBe(`${name}.mp3`)
    expect(tl.lessonNo).toBe(L)
    expect(tl.minutes).toBe(minutes)
    expect(T).toBe(minutes * 60)
    const paths = JSON.stringify(tl).match(/"(\/|[A-Za-z]:\\)[^"]*"/g) ?? []
    expect(paths).toEqual([])
    expect(JSON.stringify(tl)).not.toMatch(/\/tmp\/|\/home\/|\/Users\/|scratchpad/)
    // Uygulama kopyası (yoga-pilot/render/tools/app_kopya.py; SPEC.v3 §11): pilot alanları ve üretim yolları yok
    expect(tl.qa).toBeUndefined()
    expect(tl.plan?.planner).toBeUndefined()
    expect(tl.speech.some((s) => 'flags' in s)).toBe(false)
    expect(tl.music_events.some((e) => 'sound' in e)).toBe(false)
    expect(JSON.stringify(tl)).not.toMatch(/\.py"|\.wav"|_rapor\//)
  })

  it('kapanış anı: closing.jumpTo (Ders 2: dönüş tınısından önce); sessizlikte, kapanışın ilk sözünden önce, ondan sonraki ilk söz K bölümünde', () => {
    const c = closingAt(tl)
    expect(c).toBeCloseTo(CLOSING[name], 3)
    if (L === 2) expect(c).toBeLessThan(tl.closing.jumpTo)
    else expect(c).toBeCloseTo(tl.closing.jumpTo, 9)
    expect(speechAt(tl, c)).toBeNull()
    expect(c).toBeLessThan(tl.closing.firstWordAt)
    if (tl.closing.returnToneAt != null) expect(c).toBeLessThan(tl.closing.returnToneAt)
    // Kapanış noktasından sonra yalnız K bölümü çalar (kapanış kısalmaz; önceki bölümden cümle kalmaz). Ders 2'de K
    // "Uyanık bir dinlenme bu." ile noktadan önce başlar; "Artık dönüş zamanı." (k.donus) noktadan sonradır
    expect(tl.speech.filter((s) => s.start >= c).every((s) => s.block === 'K')).toBe(true)
    expect(tl.speech.filter((s) => s.start >= c).length).toBeGreaterThan(2)
    expect(sectionsOfTimeline(tl).at(-1).id).toBe('K')
    expect(['K', sectionsOfTimeline(tl).at(-2).id]).toContain(sectionAt(sectionsOfTimeline(tl), c))
  })

  it('pencere dönüş tınıları kapanış sayılmaz: sarma koruması ve "kapanışa ulaştı" kapanış noktasında', () => {
    const c = closingAt(tl)
    const early = tones(tl).filter((t) => t < c - 30)
    for (const t of early) {
      // eski hesap (ilk tını − 2 sn) dersi ortadan bölerdi: o noktada dinlemeyi bırakan kapanışa ulaşmamıştır
      expect(reachedClosing({ finished: false, closeAt: c, maxPos: t - 2 })).toBe(false)
      expect(recordFromJournal({ file: `yoga/${name}.mp3`, listened: t, maxTime: t - 2, finished: false, startedAt: 1, endedAt: 2 }, { closeAt: c })?.reachedClosing ?? false).toBe(false)
      // pencere tınısından sonrasına sarma serbest (kapanışa kadar)
      expect(guardClosing(t + 20, t - 30, c)).toBe(t + 20)
    }
    expect(reachedClosing({ finished: false, closeAt: c, maxPos: c })).toBe(true)
    expect(guardClosing(T - 5, c - 100, c)).toBe(c) // kapanıştan önceden sona sarma: kapanışın başı
    expect(guardClosing(T - 5, c + 10, c)).toBe(c + 10) // kapanışın içinden ileri sarma yok
    const sections = sectionsOfTimeline(tl)
    expect(guardClosing(seekTarget(tl, sections, T - 5), c - 100, c)).toBe(c)
  })

  it('bölümler: blok sırası (köprüler hariç) = blocks = beklenen; süreler toplamı dersin süresi', () => {
    const ids = sectionsOfTimeline(tl).map((s) => s.id)
    expect(ids).toEqual(SECTIONS[name])
    expect(ids).toEqual(tl.blocks.map((b) => b.id).filter((id) => !id.startsWith('BR.')))
    expect(sectionsOfTimeline(tl)[0].at).toBe(0)
    for (const s of sectionsOfTimeline(tl).slice(1)) expect(speechAt(tl, s.at)).toBeNull()
    const spans = sectionSpans(tl)
    expect(Object.values(spans).reduce((a, b) => a + b, 0)).toBeCloseTo(T, 6)
    for (const b of tl.blocks.filter((x) => !x.id.startsWith('BR.'))) expect(sectionAt(sectionsOfTimeline(tl), (b.start + b.end) / 2)).toBe(b.id)
  })

  it('evreler: açıklamalı adlar ilk sözcüğe iner, hepsi PHASE_LIGHT\'ta; sıra varış → derinleşme → derin → kapanış', () => {
    for (const s of tl.speech) {
      const key = phaseKey((s.visualState ?? s.visual_state).phase)
      expect(Object.keys(PHASE_LIGHT), `${s.piece}: ${(s.visualState ?? s.visual_state).phase}`).toContain(key)
      expect(at(mid(s)).phase, s.piece).toBe(key)
    }
    const seq = []
    for (let t = 0; t <= T; t += 1) {
      const p = at(t).phase
      if (seq.at(-1) !== p) seq.push(p)
    }
    expect(seq).toEqual(PHASES[L][minutes])
    const derin = tl.speech.find((s) => phaseKey((s.visualState ?? s.visual_state).phase) === 'derin')
    if (derin) expect(visualAt(tl, 30).luminance).toBeGreaterThan(visualAt(tl, derin.start + 20).luminance)
  })

  it('altyazı: ekrandaki cümle söylenen cümle (her parça); sessizlikte yazı yok; karşılama ilk klip; önceki cümle aynı bölümden', () => {
    for (const s of tl.speech) {
      expect(s.screenText, s.piece).toBe(s.spokenText)
      expect(s.screen_text, s.piece).toBe(s.screenText)
      expect(s.screen_equals_spoken, s.piece).toBe(true)
      expect(captionAt(tl, mid(s)), s.piece).toBe(screen(s))
    }
    expect(captionAt(tl, 0.5)).toBeNull()
    expect(captionAt(tl, T - 0.1)).toBeNull()
    const first = tl.speech[0]
    expect(welcomeCaption(tl, mid(first))).toBe(screen(first))
    const other = tl.speech.find((s) => s.clip !== first.clip)
    expect(welcomeCaption(tl, mid(other))).toBeNull()
    for (let i = 1; i < tl.speech.length; i++) {
      const got = captionBefore(tl, mid(tl.speech[i]))
      if (got == null) continue
      expect(got).toBe(screen(tl.speech[i - 1]))
      expect(tl.speech[i - 1].block).toBe(tl.speech[i].block)
    }
  })

  it('sürdürme: her parçada klibin başı (resumeAt) → seekPoint; önceki cümlenin içine düşmez', () => {
    const spans = resumeSpans(tl)
    expect(spans).toHaveLength(tl.speech.length)
    tl.speech.forEach((s, i) => {
      expect(spans[i].at).toBeCloseTo(seekPoint(tl, s.resumeAt), 6)
      expect(spans[i].at).toBeLessThanOrEqual(s.start)
    })
  })

  it('görsel: yanıp sönme yok (ışık saniyede ≤ 0,35, ölçek ≤ 0,1 değişir); izin yoksa ölçek hep 1; sonda karanlık', () => {
    let prev = at(0, { flashSafe: true })
    for (let t = 0.25; t <= T; t += 0.25) {
      const v = at(t, { flashSafe: true })
      expect(Math.abs(v.luminance - prev.luminance), `t=${t}`).toBeLessThanOrEqual(0.35 * 0.25 + 1e-9)
      expect(Math.abs(v.scale - prev.scale), `t=${t}`).toBeLessThanOrEqual(0.1 * 0.25 + 1e-9)
      expect(v.scale).toBeLessThanOrEqual(1 + Math.max(RING_GROW, PULSE_GROW) + 1e-9)
      prev = v
    }
    for (let t = 0; t <= T; t += 1) {
      expect(at(t, { flashSafe: null }).scale).toBe(1)
      expect(at(t, { flashSafe: false }).scale).toBe(1)
      expect(at(t, { flashSafe: true, reduceMotion: true }).scale).toBe(1)
    }
    expect(at(T).luminance).toBe(0)
    expect(at(123.4, { flashSafe: true })).toEqual(at(123.4, { flashSafe: true }))
  })

  it('şafak (gündüz) ya da kor (gece)', () => {
    const d = tl.visual.find((e) => e.cue === 'dawn:start')
    if (night(name)) {
      expect(d).toBeUndefined()
      expect(tl.dawn).toBeNull()
      for (let t = 0; t <= T; t += 5) expect(at(t).dawn).toBe(false)
    } else {
      expect(d.span_s).toBeGreaterThanOrEqual(minutes === 3 ? 45 : 60)
      expect(d.t).toBeGreaterThanOrEqual(closingAt(tl))
      expect(at(d.t - 1).dawn).toBe(false)
      expect(at(d.t + 10).dawn).toBe(true)
      expect(at(d.t + 10).ember).toBe(false)
      expect(at(T).end).toBe(true)
    }
  })

  it('tanınmayan ipucu (yalnız açıklama) yok sayılır', () => {
    const known = /^(phase:|ring:|kor|pulse$|image:on$|image:off$|dawn$|dawn:start$|end$|window$)/
    const notes = tl.visual.filter((e) => !known.test(e.cue))
    const bare = { ...tl, visual: tl.visual.filter((e) => known.test(e.cue)) }
    for (const e of notes) for (const dt of [0, 3, 10]) expect(visualAt(bare, e.t + dt, { flashSafe: true })).toEqual(visualAt(tl, e.t + dt, { flashSafe: true }))
  })
})

describe('kapanış: eski hesap ile fark (Y-03a)', () => {
  it('tını atlanmaz: "Kapanışa geç" kapanışın dönüş tınısından önceki sessizliğe iner (SPEC.v3 §11; B1)', () => {
    for (const name of NAMES) {
      const tl = ALL[name]
      const c = closingAt(tl)
      const first = tl.speech.find((s) => s.phase === 'Kapanış')
      const tone = first ? tl.music_events.filter((e) => e.event === 'returnTone' && e.t <= first.start).at(-1) : null
      if (!tone) continue
      expect(c, name).toBeLessThanOrEqual(tone.t - 2 + 1e-9)
      expect(speechAt(tl, c), name).toBeNull()
      expect(tl.speech.filter((s) => s.start < tone.t).every((s) => s.end <= c), name).toBe(true)
      expect(jumpPlan(tl, c - 60, c).at(-1).at, name).toBe(c)
    }
    // Ders 2: jumpTo (757,426) k.donus'tan sonraydı; şimdi tını (753,124) ve "Artık dönüş zamanı." noktadan sonra çalar
    for (const [name, t] of [['ders2-5', 200.298], ['ders2-15', 753.124], ['ders2-20', 1055.181]]) {
      const tl = ALL[name]
      const c = closingAt(tl)
      const donus = tl.speech.find((s) => s.clip === 'k.donus')
      expect(c, name).toBeCloseTo(t - 2, 3)
      expect(donus.start, name).toBeGreaterThan(c)
      expect(screen(donus), name).toBe('Artık dönüş zamanı.')
      expect(tl.closing.jumpTo, name).toBeGreaterThan(donus.end)
    }
  })
  it('Ders 5 · 15: ilk tını 579,45 (pencere dönüşü; eski hesap 577,45), kapanış 757,39', () => {
    const tl = ALL['ders5-15']
    expect(tones(tl)[0]).toBeCloseTo(579.45, 2)
    expect(closingAt(tl)).toBeCloseTo(757.393, 3)
    expect(tl.closing.returnToneAt).toBeCloseTo(763.393, 3)
    expect(sectionAt(sectionsOfTimeline(tl), 577.45)).toBe('C3') // eski nokta Derin evrenin ortası
  })
  it('Ders 2 · 20: ilk tını 958,5 (c4.donus1 penceresi; eski hesap 956,5), kapanış 1053,18 (k.donus tınısı 1055,18 − 2)', () => {
    const tl = ALL['ders2-20']
    expect(tones(tl)[0]).toBeCloseTo(958.5, 2)
    expect(closingAt(tl)).toBeCloseTo(1053.181, 3)
    expect(sectionAt(sectionsOfTimeline(tl), 956.5)).toBe('C4')
  })
  it('Uykuya Geçiş: "Uykuya geç" uyku iznine (K), kor "Bugün bitti." ile kehribara döner', () => {
    for (const n of ['ders3-5', 'ders3-15']) {
      const tl = ALL[n]
      const k = tl.speech.find((s) => s.block === 'K')
      expect(closingAt(tl)).toBeLessThan(k.start)
      expect(tl.speech.find((s) => s.start >= closingAt(tl)).piece).toBe(k.piece)
      expect(screen(k)).toBe('Bugün bitti.')
      expect(emberAt(tl)).toBeCloseTo(k.start, 6)
    }
  })
})

describe('Ders 1 · halka (ring:in / ring:out)', () => {
  const ring = (tl) => tl.visual.filter((e) => e.cue.startsWith('ring:'))
  it.each(['ders1-3', 'ders1-5', 'ders1-15'])('%s: her "Al…" bir döngü; "biraz daha…" ve "ver…" ipuçları döngünün kendi anlarına düşer', (n) => {
    const tl = ALL[n]
    const cycles = breathCycles(tl)
    const spoken = ring(tl).filter((e) => e.breath && !e.breath.silent)
    expect(cycles.filter((c) => !c.silent).map((c) => c.at)).toEqual(spoken.map((e) => e.t))
    expect(spoken.length).toBeGreaterThan(0)
    // söylenen ipuçları: "Al…" klibi alışın başında
    for (const e of spoken) expect(tl.speech.find((s) => s.clip === e.clip).start).toBeCloseTo(e.t, 3)
    // ayrı yazılmış "ver…" (ring:out) ve "biraz daha…" (ring:in +) ipuçları döngünün hesaplanan anına ±50 ms
    for (const e of ring(tl).filter((x) => !x.breath)) {
      const c = cycles.filter((x) => x.at <= e.t).at(-1)
      const want = /^ring:out/.test(e.cue) ? c.at + c.in + c.topUp : c.at + c.in
      expect(Math.abs(e.t - want), `${e.clip} ${e.cue}`).toBeLessThanOrEqual(0.05)
    }
    // döngüler üst üste binmez (sessiz döngü bir sonraki "Al…"dan önce biter)
    for (let i = 1; i < cycles.length; i++) {
      const p = cycles[i - 1]
      expect(cycles[i].at, `döngü ${i}`).toBeGreaterThanOrEqual(p.at + p.in + p.topUp + p.out - 0.01)
    }
  })
  it('altyazı sayımda o an söylenen sayıyı yazar (bir önceki sayı 0,8 sn kalmaz: parçalar 1 sn arayla)', () => {
    const tl = ALL['ders1-15']
    const iki = tl.speech.find((s) => s.piece === 'c1.s1.02')
    const uc = tl.speech.find((s) => s.piece === 'c1.s1.03')
    expect([screen(iki), screen(uc)]).toEqual(['iki…', 'üç…'])
    expect(uc.start - iki.end).toBeLessThan(0.8)
    expect(captionAt(tl, uc.start + 0.05)).toBe('üç…')
    expect(captionAt(tl, iki.end + 0.05)).toBe('iki…') // sessizlikte az önce biten sayı kısa süre kalır
  })
  it('sessiz döngü: "Sıradaki nefes sende; ben susuyorum." sonrasında halka aynı ritimle sürer', () => {
    const tl = ALL['ders1-15']
    const silent = breathCycles(tl).filter((c) => c.silent)
    expect(silent.map((c) => c.at)).toEqual([245.417, 295.417])
    const cue = tl.visual.find((e) => e.breath?.silent)
    expect(screen(tl.speech.find((s) => s.clip === cue.clip))).toBe('Sıradaki nefes sende; ben susuyorum.')
    expect(breathAt(tl, 245.417 + 4)).toBeCloseTo(1, 6) // sessiz alışın sonu
    expect(breathAt(tl, 245.417 + 10)).toBeCloseTo(0, 6)
  })
  it('açıklık: alışta 0 → 1, verişte 1 → 0; iç çekişte alış payı (2,5 / 4) sonra "biraz daha…"; ipucu yokken 0', () => {
    const tl = ALL['ders1-15']
    expect(breathAt(tl, 165.407)).toBe(0)
    expect(breathAt(tl, 165.407 + 4)).toBeCloseTo(1, 6)
    expect(breathAt(tl, 165.407 + 7)).toBeCloseTo(0.5, 6)
    expect(breathAt(tl, 165.407 + 10)).toBe(0)
    const sigh = breathCycles(tl).find((c) => c.topUp > 0)
    expect(sigh).toMatchObject({ in: 2.5, topUp: 1.5, out: 6 })
    expect(breathAt(tl, sigh.at + 2.5)).toBeCloseTo(2.5 / 4, 6)
    expect(breathAt(tl, sigh.at + 4)).toBeCloseTo(1, 6)
    const hum = breathCycles(tl).find((c) => c.out === 9)
    expect(breathAt(tl, hum.at + 4 + 9)).toBe(0)
    for (const t of [30, 120, 380, 770, 850]) expect(breathAt(tl, t), `t=${t}`).toBe(0) // varış, kapanış, ara cümleler
    // halka yalnız izin varken genişler
    expect(visualAt(tl, 165.407 + 4, { flashSafe: true }).scale).toBeCloseTo(1 + RING_GROW, 6)
    expect(visualAt(tl, 165.407 + 4, { flashSafe: null }).scale).toBe(1)
    expect(visualAt(tl, 165.407 + 4, { flashSafe: true, reduceMotion: true }).scale).toBe(1)
    expect(visualAt(tl, 165.407 + 4).breath).toBeCloseTo(1, 6)
  })
})

describe('Ders 2 · sayım nabzı, imge ve zıtlık bırakması, pencere', () => {
  it('nabız: 15 ve 20 dk\'da on sayı ("on…" → "bir."), 5 dk\'da yok', () => {
    for (const n of ['ders2-15', 'ders2-20']) {
      const tl = ALL[n]
      const p = tl.visual.filter((e) => e.cue === 'pulse')
      expect(p.map((e) => e.breath.count)).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
      expect(visualAt(tl, p[0].t + 2.5, { flashSafe: true }).scale).toBeCloseTo(1 + PULSE_GROW, 6)
      expect(visualAt(tl, p[0].t + 2.5, { flashSafe: false }).scale).toBe(1)
    }
    expect(ALL['ders2-5'].visual.some((e) => e.cue === 'pulse')).toBe(false)
  })
  it('bırakma pencereleri release\'ten: 15 dk imge (c4.solma), 20 dk zıtlık (c3.birak) ve imge; 5 dk yok', () => {
    const clipAt = (tl, t) => tl.speech.find((s) => Math.abs(s.start - t) < 0.001).clip
    const w15 = releaseWindows(ALL['ders2-15'])
    expect(w15).toHaveLength(1)
    expect(clipAt(ALL['ders2-15'], w15[0].release.start)).toBe('c4.solma')
    const w20 = releaseWindows(ALL['ders2-20'])
    expect(w20.map((w) => clipAt(ALL['ders2-20'], w.release.start))).toEqual(['c3.birak', 'c4.solma'])
    expect(releaseWindows(ALL['ders2-5'])).toEqual([])
    // imge açık/kapalı ipuçları release aralığıyla aynı
    const tl = ALL['ders2-15']
    const on = tl.visual.find((e) => e.cue === 'image:on').t
    expect(visualAt(tl, on + 5).image).toBe(true)
    expect(visualAt(tl, w15[0].off + 1).image).toBe(false)
  })
  it('imgenin içinden kapanışa: önce c4.solma, sonra kapanış; zıtlığın içinden: önce c3.birak', () => {
    for (const n of ['ders2-15', 'ders2-20']) {
      const tl = ALL[n]
      const c = closingAt(tl)
      const w = releaseWindows(tl).at(-1)
      const steps = jumpPlan(tl, w.on + 30, c)
      expect(steps).toHaveLength(2)
      expect(steps[0].at).toBeCloseTo(seekPoint(tl, w.release.start), 6)
      expect(steps[0].until).toBeCloseTo(w.release.end + 1, 6)
      expect(steps[1]).toEqual({ at: c })
      expect(jumpPlan(tl, 100, c)).toEqual([{ at: c }])
    }
    const tl = ALL['ders2-20']
    const z = releaseWindows(tl)[0]
    const steps = jumpPlan(tl, z.on + 20, closingAt(tl))
    expect(steps.map((s) => s.at)).toEqual([seekPoint(tl, z.release.start), closingAt(tl)])
    expect(jumpPlan(tl, z.on + 20, z.on + 40)).toEqual([{ at: z.on + 40 }]) // zıtlığın içinde kalan sarma
  })
  it('Ders 2 · 20 pencere: sessizliğin içinden "Kapanışa geç" önce dönüş tınısı ve "Yeniden seninleyim.", sonra imge bırakması', () => {
    const tl = ALL['ders2-20']
    const [w] = silenceWindows(tl)
    expect(w.back.start).toBeCloseTo(958.5, 3)
    expect(screen(tl.speech.find((s) => s.clip === 'c4.donus1'))).toBe('Yeniden seninleyim.')
    const c = closingAt(tl)
    const steps = jumpPlan(tl, 930, c)
    expect(steps).toHaveLength(3)
    expect(steps[0]).toEqual({ at: seekPoint(tl, 958.5), until: w.back.end + 1 })
    expect(steps[1].at).toBeCloseTo(seekPoint(tl, 989.89), 6)
    expect(steps[2]).toEqual({ at: c })
    // sarmada pencere dönüşü yok (yalnız imgeden çıkarken bırakma)
    expect(jumpPlan(tl, 930, 300)).toHaveLength(2)
    expect(jumpPlan(tl, 930, 940)).toEqual([{ at: 940 }])
  })
})

describe('Ders 3 · kor (gece)', () => {
  it('sayım: 15 dk\'da on "kor" ipucu; izin varken her sayıda kor kararır, ölçek değişmez; 5 dk\'da sayım yok', () => {
    const tl = ALL['ders3-15']
    const k = tl.visual.filter((e) => e.cue.startsWith('kor:'))
    expect(k.map((e) => e.breath.count)).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
    for (const e of k) {
      const on = visualAt(tl, e.t + 2.5, { night: true, flashSafe: true })
      const off = visualAt(tl, e.t + 2.5, { night: true, flashSafe: null })
      expect(on.luminance).toBeLessThan(off.luminance)
      expect(on.scale).toBe(1)
      expect(visualAt(tl, e.t + 2.5, { night: true, flashSafe: true, reduceMotion: true }).luminance).toBe(off.luminance)
    }
    expect(ALL['ders3-5'].visual.some((e) => e.cue.startsWith('kor:'))).toBe(false)
  })
  it('kor kehribara döner ("Bugün bitti."), "Gece senin." ile söner; ekran siyah kalır', () => {
    for (const n of ['ders3-5', 'ders3-15']) {
      const tl = ALL[n]
      const on = tl.visual.find((e) => e.cue === 'kor kehribara döner').t
      const out = tl.visual.find((e) => e.cue === 'kor söner, ekran siyah').t
      const v = (t) => visualAt(tl, t, { night: true })
      expect(v(on - 1).ember).toBe(false)
      expect(v(on + 1).ember).toBe(true)
      expect(v(on + 1).luminance).toBeGreaterThan(v((on + out) / 2).luminance)
      expect(v(out).luminance).toBe(0)
      expect(v(durationOf(tl) - 1).luminance).toBe(0)
      expect(screen(tl.speech.find((s) => Math.abs(s.start - out) < 0.001))).toBe('Gece senin.')
      expect(v(on + 1).dawn).toBe(false)
    }
  })
})

describe('Ders 5 · tek ışık noktası', () => {
  const r = (v, still = false) => renderToStaticMarkup(h(BreathForm, { form: 'point', color: '#D6E4F2', v, still })).match(/r="([^"]+)"/)[1]
  it.each(['ders5-3', 'ders5-5', 'ders5-15'])('%s: hale evreyle daralır (açıklamalı evre adıyla BreathForm çalışır)', (n) => {
    const tl = ALL[n]
    const first = tl.speech.find((s) => phaseKey(s.visualState.phase) === 'derinlesme')
    expect(first.visualState.phase).toMatch(/^derinlesme \(/)
    expect(r(visualAt(tl, 20))).toBe('30') // varış: geniş
    expect(r(visualAt(tl, first.start + 20))).toBe('22') // derinleşme
    expect(r(visualAt(tl, first.start + 20), true)).toBe('22') // still: sabit
    const derin = tl.speech.find((s) => phaseKey(s.visualState.phase) === 'derin')
    if (derin) expect(r(visualAt(tl, derin.start + 20))).toBe('14') // derin: en küçük
  })
  it('15 dk: iki duyurulmuş pencere; sessizliğin içinden "Kapanışa geç" önce çan ve karşılama klibi', () => {
    const tl = ALL['ders5-15']
    const ws = silenceWindows(tl)
    expect(ws).toHaveLength(2)
    expect(ws.map((w) => w.back.start)).toEqual([669.731, 740.983])
    const c = closingAt(tl)
    const steps = jumpPlan(tl, 650, c)
    expect(steps).toEqual([{ at: seekPoint(tl, 669.731), until: ws[0].back.end + 1 }, { at: c }])
    expect(jumpPlan(tl, 672, c)).toEqual([{ at: c }]) // dönüş zaten çalıyor
    expect(jumpPlan(tl, 650, 600)).toEqual([{ at: 600 }]) // sarma: pencere dönüşü yok
    expect(tl.visual.filter((e) => e.cue === 'window').map((e) => e.clip)).toEqual(['c3.w30', 'c3.w45'])
  })
})
