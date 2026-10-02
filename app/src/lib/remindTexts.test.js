// Bildirim metinleri (B1a): lib/remindTexts.js onay dosyasıyla birebir mi, sınırlar, seçim kuralı, planAll bağlantısı.
// Onaylı liste: docs/yol-haritasi/tasarim/bildirim-hava-yuruyus/metin-B1a-onay.md (sahip onaylı; tek harf değişmez).
import { describe, it, expect, vi } from 'vitest'
import { readFileSync } from 'node:fs'

const native = vi.hoisted(() => ({ isIOSApp: () => false, setWalkGuards: vi.fn(async () => {}) }))
vi.mock('./native.js', () => native)

import { TEXTS, NAMES, SCI_LINES, LIMITS, SCI_SEP, MERGED_KEY, pickText, mergedText, withSciLine, sciLineOf, resolvePlanTexts } from './remindTexts.js'
import { planAll } from './notifyAll.js'
import { createApplier } from './notifyApply.js'
import { PATH_REMIND } from './moduleRemind.js'
import { SOURCES } from './sources.js'
import { dayKey } from './habitLog.js'

const ONAY = readFileSync(new URL('../../../docs/yol-haritasi/tasarim/bildirim-hava-yuruyus/metin-B1a-onay.md', import.meta.url), 'utf8')
const len = (s) => [...s].length

// Onay dosyasını oku: "### `remind.x` · Ad", "- XX1 · **Başlık** · Gövde · 18/67", "- `kaynak` · satır · 96"
function parseOnay(md) {
  const texts = {}
  const names = {}
  const sci = {}
  let key = null
  for (const line of md.split('\n')) {
    let m = /^### `((?:remind|nudge)\.[a-z-]+)` · (.+?)(?: · rakam yok)?$/.exec(line)
    if (m) {
      key = m[1]
      texts[key] = []
      names[key] = m[2]
      continue
    }
    m = /^- ([A-Z]{2}\d) · \*\*(.+?)\*\* · (.+) · (\d+)\/(\d+)$/.exec(line)
    if (m) {
      texts[key].push({ id: m[1], title: m[2], body: m[3], tl: Number(m[4]), bl: Number(m[5]) })
      continue
    }
    m = /^- `([a-z0-9]+)` · (.+) · (\d+)$/.exec(line)
    if (m) sci[m[1]] = m[2]
  }
  return { texts, names, sci }
}
const onay = parseOnay(ONAY)

describe('remindTexts: onay dosyasıyla birebir', () => {
  it('dosya okunabildi (sınama boş değil)', () => {
    expect(Object.keys(onay.texts).length).toBeGreaterThanOrEqual(18)
    expect(Object.keys(onay.sci).length).toBe(5)
  })

  it('her anahtarın cümleleri aynı sırada, aynı kimlikle, harfi harfine', () => {
    expect(Object.keys(TEXTS).sort()).toEqual(Object.keys(onay.texts).sort())
    for (const [key, list] of Object.entries(onay.texts)) {
      expect(TEXTS[key].map(({ id, title, body }) => ({ id, title, body })), key).toEqual(list.map(({ id, title, body }) => ({ id, title, body })))
    }
  })

  it('görünür bilim satırları §3 listesiyle aynı; moszeik2025 yok (karar 4)', () => {
    expect(SCI_LINES).toEqual(onay.sci)
    expect(sciLineOf('moszeik2025')).toBeNull()
    expect(sciLineOf('singh2024')).toBeNull()
  })

  it('birleşik bildirimdeki adlar modül başlıkları; fark-ettin "Cadde oyunu"', () => {
    for (const [key, name] of Object.entries(onay.names)) {
      if (key.startsWith('remind.') && key !== MERGED_KEY) expect(NAMES[key.slice(7)]).toBe(name)
    }
    expect(NAMES['fark-ettin']).toBe('Cadde oyunu')
  })

  it('cümle kaynakları sources.js\'te; yol singh2024 (PATH_REMIND.science)', () => {
    for (const list of Object.values(TEXTS)) for (const t of list) if (t.source) expect(SOURCES[t.source]?.pmid, t.id).toBeTruthy()
    expect(PATH_REMIND.science).toEqual(['singh2024'])
    expect(TEXTS['remind.path'].every((t) => t.source === 'singh2024')).toBe(true)
  })
})

describe('remindTexts: uzunluk sınırları (§A.6)', () => {
  it('başlık ≤ 30, gövde ≤ 110; sayım onay dosyasındakiyle aynı', () => {
    for (const [key, list] of Object.entries(onay.texts)) {
      for (const t of list) {
        expect(len(t.title), t.id).toBeLessThanOrEqual(LIMITS.title)
        const body = key === MERGED_KEY ? t.body.replace('{A}', 'x'.repeat(14)).replace('{B}', 'x'.repeat(14)) : t.body
        expect(len(body), t.id).toBeLessThanOrEqual(LIMITS.body)
        expect(len(t.title), t.id).toBe(t.tl)
        expect(len(body), t.id).toBe(t.bl)
      }
    }
  })

  it('bilim satırı ≤ 100; eklenmiş gövde ≤ 160, yalnız Nef cümlesi ≤ 70 iken', () => {
    for (const line of Object.values(SCI_LINES)) expect(len(line)).toBeLessThanOrEqual(LIMITS.sci)
    const gk = Object.fromEntries(TEXTS['remind.blink'].map((t) => [t.id, t]))
    expect(withSciLine(gk.GK1.body, 'kim2020')).toBe(`${gk.GK1.body}${SCI_SEP}${SCI_LINES.kim2020}`)
    expect(len(withSciLine(gk.GK1.body, 'kim2020'))).toBeLessThanOrEqual(LIMITS.bodyWithSci)
    expect(withSciLine(gk.GK2.body, 'wolffsohn2025')).toBeNull() // 77 > 70
    expect(withSciLine(gk.GK3.body, 'moszeik2025')).toBeNull()
  })

  it('birleşik: en uzun iki modül adıyla da ≤ 110, yer tutucu kalmaz', () => {
    const ids = Object.keys(NAMES)
    for (const a of ids) {
      for (const b of ids) {
        if (a === b) continue
        for (const nth of [0, 1]) {
          const t = mergedText([a, b], '2026-09-30', nth)
          expect(t.body).not.toMatch(/[{}]/)
          expect(len(t.body)).toBeLessThanOrEqual(LIMITS.body)
          expect(t.body).toContain(NAMES[a])
          expect(t.body).toContain(NAMES[b])
        }
      }
    }
  })
})

describe('remindTexts: seçim', () => {
  it('aynı gün aynı cümle tekrar etmez; gün gün döner', () => {
    for (const key of Object.keys(TEXTS)) {
      if (key === MERGED_KEY) continue
      const n = Math.min(3, TEXTS[key].length)
      const ids = Array.from({ length: n }, (_, i) => pickText(key, '2026-09-30', i).id)
      expect(new Set(ids).size, key).toBe(n)
      expect(pickText(key, '2026-10-01', 0).id).not.toBe(pickText(key, '2026-09-30', 0).id)
    }
    expect(pickText('remind.snake-yok', '2026-09-30')).toBeNull()
  })

  it('birleşik: iki modülde BR1/BR2 dönüşümlü, "Cadde oyunu"; üç modülde BR3; adı bilinmeyen modülde BR3', () => {
    const a = mergedText(['blink', 'fark-ettin'], '2026-09-30', 0)
    const b = mergedText(['blink', 'fark-ettin'], '2026-10-01', 0)
    expect(new Set([a.id, b.id])).toEqual(new Set(['BR1', 'BR2']))
    expect(a.body).toContain('Göz kırpma')
    expect(a.body).toContain('Cadde oyunu')
    expect(mergedText(['blink', 'yoga', 'gokyuzu'], '2026-09-30').id).toBe('BR3')
    expect(mergedText(['blink', 'bilinmeyen'], '2026-09-30').id).toBe('BR3')
    expect(mergedText(['blink'], '2026-09-30')).toBeNull()
  })
})

// planAll({ texts: true }) ile gerçek plan
const NOW = new Date(2026, 8, 30, 7, 0)
const REM = (types = {}) => ({ optIn: 'yes', types: { mola: { on: false, time: '12:30' }, walk: { on: false, time: '15:00' }, breath: { on: false, time: '16:30' }, water: { on: false, time: '11:00' }, ...types } })
const man = (times) => ({ on: true, mode: 'manual', times, autoAt: null, setAt: null })
const MODS = [
  { id: 'blink', remind: { route: 'blink', window: 'move', science: ['kim2020', 'wolffsohn2025'] }, doneToday: false },
  { id: 'yoga', remind: { route: 'yoga', window: 'calm', science: ['moszeik2025', 'luu2024'] }, doneToday: false },
  { id: 'fark-ettin', remind: { route: 'fark-ettin', window: 'move', science: ['talens2022'] }, doneToday: false },
]
const input = (o = {}) => ({ now: NOW, reminders: REM(), study: null, habits: [], sessions: [], health: null, focus: null, seed: 'x', log: null, modules: MODS, ...o })
const isNew = (n) => n.id >= 7800 && n.id <= 7867

describe('planAll({ texts: true })', () => {
  it('texts yoksa plan aynen (yalnız textKey); texts ile yalnız yeni bildirimlere metin bağlanır', () => {
    const i = input({ moduleReminders: { blink: man(['10:00', '14:00', '18:00']) } })
    const plain = planAll(i)
    const withT = planAll({ ...i, texts: true })
    expect(plain.notifications.filter(isNew).every((n) => n.title == null && n.body == null)).toBe(true)
    expect(withT.notifications.filter((n) => !isNew(n))).toEqual(plain.notifications.filter((n) => !isNew(n)))
    expect(withT.notifications.filter(isNew).every((n) => typeof n.title === 'string' && typeof n.body === 'string')).toBe(true)
    expect(withT.notifications.map((n) => n.id)).toEqual(plain.notifications.map((n) => n.id))
  })

  it('bir günde üç saat üç ayrı cümle; kanıt cümlenin kaynağı; bilim satırı günde en çok bir', () => {
    const p = planAll(input({ moduleReminders: { blink: man(['10:00', '14:00', '18:00']) }, texts: true }))
    const byDay = new Map()
    for (const n of p.notifications.filter(isNew)) byDay.set(n.extra.date, [...(byDay.get(n.extra.date) ?? []), n])
    expect(byDay.size).toBeGreaterThan(1)
    for (const list of byDay.values()) {
      expect(new Set(list.map((n) => n.extra.text)).size).toBe(list.length)
      expect(list.filter((n) => n.extra.sci).length).toBeLessThanOrEqual(1)
      for (const n of list) {
        const t = TEXTS['remind.blink'].find((x) => x.id === n.extra.text)
        expect(n.title).toBe(t.title)
        expect(n.extra.evidence).toBe(t.source)
        expect(n.body).toBe(n.extra.sci ? `${t.body}${SCI_SEP}${SCI_LINES[t.source]}` : t.body)
        expect(len(n.body)).toBeLessThanOrEqual(n.extra.sci ? LIMITS.bodyWithSci : LIMITS.body)
      }
    }
  })

  it('birleşik bildirim: adlar dolu, bilim satırı yok; yoga (moszeik2025) bilim satırı taşımaz', () => {
    const p = planAll(input({ moduleReminders: { 'fark-ettin': man(['10:00']), blink: man(['10:15']), yoga: man(['19:00']) }, texts: true }))
    const merged = p.notifications.filter((n) => n.extra?.kind === 'remindMerged')
    expect(merged.length).toBeGreaterThan(0)
    for (const n of merged) {
      expect(['BR1', 'BR2']).toContain(n.extra.text)
      expect(n.body).toContain('Cadde oyunu')
      expect(n.body).not.toContain(SCI_SEP)
      expect(n.extra.sci).toBeUndefined()
    }
    for (const n of p.notifications.filter((x) => x.module === 'yoga')) expect(n.extra.sci).toBeUndefined()
  })

  it('ek saat (nudge): onaylı cümle, kaynak cümleden; deney bildirimi (74xx) değişmez', () => {
    const today = dayKey(NOW)
    const i = input({ reminders: REM({ breath: { on: true, time: '10:00' } }), seed: 'gönder', log: [{ date: today, type: 'breath', arm: 'send' }], moduleReminders: { breath: man(['13:00', '17:00']) }, modules: [...MODS, { id: 'breath', remind: { route: 'breath-1', legacy: 'breath', science: ['laborde2022', 'fincham2023'] }, doneToday: false }] })
    const plain = planAll(i)
    const p = planAll({ ...i, texts: true })
    const ex = p.notifications.filter((n) => n.id >= 7860 && n.id <= 7867)
    expect(ex.length).toBeGreaterThan(0)
    for (const n of ex) {
      const t = TEXTS['nudge.breath'].find((x) => x.id === n.extra.text)
      expect(n.title).toBe(t.title)
      expect(n.extra.evidence).toBe(t.source)
    }
    expect(p.notifications.filter((n) => n.id >= 7400 && n.id <= 7499)).toEqual(plain.notifications.filter((n) => n.id >= 7400 && n.id <= 7499))
  })

  it('metni bağlanmış plan uygulayıcıda kurulur (tek threadIdentifier)', async () => {
    vi.useFakeTimers()
    try {
      vi.setSystemTime(NOW)
      const sent = []
      const LN = {
        checkPermissions: async () => ({ display: 'granted' }),
        getPending: async () => ({ notifications: [] }),
        cancel: async () => {},
        schedule: async ({ notifications }) => void sent.push(...notifications),
      }
      const q = createApplier(async () => ({ LN })).applyPlan(planAll(input({ moduleReminders: { blink: man(['10:00']) }, texts: true })))
      await vi.advanceTimersByTimeAsync(400)
      await q
      const mine = sent.filter(isNew)
      expect(mine.length).toBeGreaterThan(0)
      expect(mine.every((n) => n.threadIdentifier === 'nefona' && n.title && n.body)).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })

  it('resolvePlanTexts: metni bulunamayan anahtar yalnız textKey\'le kalır', () => {
    const n = { id: 7800, at: new Date(2026, 8, 30, 10), type: 'remind', module: 'x', textKey: 'remind.x', extra: { kind: 'remind', module: 'x', date: '2026-09-30' } }
    expect(resolvePlanTexts({ notifications: [n] }).notifications[0]).toBe(n)
  })
})
