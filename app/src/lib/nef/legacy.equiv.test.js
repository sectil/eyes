// Eşdeğerlik (ANA_OTURUM_ISTEMI N1 madde 2 ve "Bitti" 4): mevcut Nef sesleri ile an motoru üreticileri (legacy.js) tohumlu
// geniş bir girdi kümesinde aynı metni verir: 0 fark. Eski çağrılar değişmeden durur.
import { describe, it, expect } from 'vitest'
import { homeSuggestion } from '../homeSuggest.js'
import { jevLine } from '../today.js'
import { nefTopLine, nefEndLine, NEF } from '../../components/home/dayLead.js'
import { chapterOf } from '../pathAhead.js'
import { LEGACY_TEXT, homeMoment, jevMoment, nefTopMoment, nefEndMoment } from './legacy.js'

// Tohumlu sözde rastgele (mulberry32)
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
const N = 4000
const TITLES = ['Çemberler', 'Nefes', 'Haftalık E testi', 'Sağ–sol', 'Tek Bakışta', 'Yılan', 'Bugünün görevi', 'Okuma', 'Fark Ettin mi?', 'Isınma', 'Yoga']
const SUBS = [undefined, '1 tur', 'Kalan: Sol göz', 'Nefesin Ritmi', '']

function gen(seed) {
  const r = rng(seed)
  const one = (a) => a[Math.floor(r() * a.length)]
  const bool = (p = 0.5) => r() < p
  const maybe = (v, p = 0.5) => (bool(p) ? v : undefined)
  const stop = () => ({
    title: one(TITLES),
    minutes: maybe(1 + Math.floor(r() * 5), 0.8),
    sub: one(SUBS),
    openEnded: maybe(true, 0.2),
    warn: maybe(true, 0.15),
    hideMinutes: maybe(true, 0.15),
    restSlot: maybe(true, 0.15),
    kind: maybe('measure', 0.2),
    game: maybe(true, 0.2),
    budget: maybe(true, 0.4),
    done: bool(0.4),
  })
  const plan = () => {
    const stops = Array.from({ length: Math.floor(r() * 7) }, stop)
    const left = stops.filter((s) => !s.done)
    const doneCount = stops.length - left.length
    const allDone = stops.length > 0 && left.length === 0 ? bool(0.9) : bool(0.05)
    const next = bool(0.9) ? left[0] ?? null : maybe(one(stops), 0.5) ?? null
    return { stops, next, doneCount, total: stops.length, allDone }
  }
  const eye = () => one([null, { locked: true, leftMs: Math.floor(r() * 600000) }, { due: 'budget' }, { due: false }, { locked: false, due: 'time', leftMs: 1000 }])
  const fmts = [undefined, (ms) => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`]
  const prize = () => one([null, 'iris haritan açılır', 'iris haritan başlangıçla yan yana gelir'])
  const n = 1 + Math.floor(r() * 40)
  const chapterEnd = bool(0.3)
  const top = { allDone: bool(0.2), update: maybe({ n: Math.floor(r() * 3), name: maybe(one(TITLES), 0.8) }, 0.3), gap: maybe(Math.floor(r() * 20), 0.6), yday: maybe({ allDone: bool(), total: Math.floor(r() * 6), done: Math.floor(r() * 4) }, 0.7), n, chapterEnd, chapter: Math.floor(r() * 5), prize: prize(), mileShown: bool(0.15) }
  // skip: bazen öncelikli cümlenin kendisi (ilk görünümde yazıldı)
  top.skip = one([null, NEF.yday, NEF.back, nefTopLine({ ...top }), top.update?.name ? NEF.update(top.update.n, top.update.name) : null])
  const endPrize = prize()
  const end = { n, allDone: bool(0.3), chapterEnd, prize: endPrize, top: one([null, NEF.chapterDay(chapterOf(n), endPrize), NEF.back]), mileShown: bool(0.15) }
  const jevOpts = { day: Math.floor(r() * 60) - 5, fmt: one(fmts), eye: eye(), restLeftMs: maybe(Math.floor(r() * 300000), 0.2) ?? null, gold: bool(0.3) }
  if (jevOpts.fmt === undefined) delete jevOpts.fmt
  return {
    home: { plan: maybe(plan(), 0.85) ?? null, eye: eye(), walk: bool(0.25) },
    jev: [plan(), jevOpts],
    top,
    end,
    direct: { n: Math.floor(r() * 30), d: Math.floor(r() * 8), hhmm: `0${Math.floor(r() * 10)}:${one(['00', '30', '45'])}`, c: 1 + Math.floor(r() * 6), a: Math.floor(r() * 40), b: Math.floor(r() * 40), names: Array.from({ length: 1 + Math.floor(r() * 3) }, () => one(TITLES)), p: prize() ?? 'madalya' },
  }
}

describe('mevcut Nef sesleri ↔ an motoru üreticileri', () => {
  it(`${N} tohumlu girdide 0 fark; her kimlik en az bir kez görüldü`, () => {
    const diffs = []
    const seen = new Set()
    const same = (label, seed, a, b) => {
      if (a !== b) diffs.push({ label, seed, old: a, new: b })
    }
    for (let seed = 1; seed <= N; seed++) {
      const g = gen(seed)
      // homeSuggestion
      const h = homeMoment(g.home)
      same('home', seed, homeSuggestion(g.home).primary.line, h?.text)
      if (h) seen.add(h.id)
      // jevLine
      const old = jevLine(...g.jev)
      const j = jevMoment(...g.jev)
      same('jev.line', seed, old.line, j?.text)
      same('jev.word', seed, old.word, j?.facts.word)
      if (j) seen.add(j.id)
      // dayLead nefTopLine / nefEndLine
      const t = nefTopMoment(g.top)
      same('nefTop', seed, nefTopLine(g.top), t?.text ?? null)
      if (t) seen.add(t.id)
      const e = nefEndMoment(g.end)
      same('nefEnd', seed, nefEndLine(g.end), e?.text ?? null)
      if (e) seen.add(e.id)
      // dayLead NEF 8–14, 16: kalıp doğrudan (LongPath.jsx çağırır)
      const d = g.direct
      same('nef.8', seed, NEF.tomorrow(d.n, d.d), LEGACY_TEXT['nef.8']({ n: d.n, d: d.d }))
      same('nef.9', seed, NEF.alarm(d.hhmm), LEGACY_TEXT['nef.9']({ hhmm: d.hhmm }))
      same('nef.11', seed, NEF.chapter(d.c, d.a, d.b), LEGACY_TEXT['nef.11']({ c: d.c, a: d.a, b: d.b }))
      same('nef.12', seed, NEF.news(d.names), LEGACY_TEXT['nef.12']({ names: d.names }))
      same('nef.13', seed, NEF.prize(d.p), LEGACY_TEXT['nef.13']({ p: d.p }))
      same('nef.16', seed, NEF.more(d.n), LEGACY_TEXT['nef.16']({ n: d.n }))
    }
    expect(diffs.slice(0, 5)).toEqual([])
    expect(diffs.length).toBe(0)
    const dynamic = Object.keys(LEGACY_TEXT).filter((id) => id.startsWith('home.') || id.startsWith('jev.') || ['nef.1', 'nef.2', 'nef.3', 'nef.4', 'nef.5', 'nef.6', 'nef.7', 'nef.15'].includes(id))
    expect(dynamic.filter((id) => !seen.has(id))).toEqual([])
  })

  it('sabit cümleler aynı metin (NEF 10, 10 alt satır, 14) ve kimlikler 1–16 eksiksiz', () => {
    expect(LEGACY_TEXT['nef.10']()).toBe(NEF.remind)
    expect(LEGACY_TEXT['nef.10s']()).toBe(NEF.remindSub)
    expect(LEGACY_TEXT['nef.14']()).toBe(NEF.month30)
    for (let i = 1; i <= 16; i++) expect(LEGACY_TEXT[`nef.${i}`], `nef.${i}`).toBeTypeOf('function')
  })

  it('an biçimi: kimlik, kaynak ve olgu anahtarı; seçici konuşmaz (kanal yok)', () => {
    const m = homeMoment({ plan: { next: { title: 'Çemberler' }, doneCount: 1, allDone: false } })
    expect(m).toMatchObject({ type: 'legacy', source: 'homeSuggest', id: 'home.continue', text: 'Kaldığın yerden devam: Çemberler.', key: 'legacy:home.continue', cell: null, channels: [] })
    expect(nefEndMoment({ n: 4, allDone: true })).toMatchObject({ source: 'dayLead', id: 'nef.5', text: NEF.done(5) })
  })
})
