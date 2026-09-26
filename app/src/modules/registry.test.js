import { describe, it, expect } from 'vitest'
import { registry, createRegistry, validateManifest, DOMAINS } from './registry.js'
import { VIEWS } from './views.js'

describe('modül soketi: gerçek modüller', () => {
  it('hepsi geçerli, sorun yok', () => {
    expect(registry.problems).toEqual([])
    expect(registry.modules.map((m) => m.id).sort()).toEqual(['awareness', 'blink', 'breath', 'breath-count', 'daily', 'dalga', 'fark-ettin', 'gokyuzu', 'notice', 'quick-look', 'reading', 'routine', 'snake', 'tek-bakis', 'track', 'weekly', 'yon'])
  })
  it('her modülün ekranı (view) var ve ekranı çiziyor', () => {
    for (const m of registry.modules) {
      expect(VIEWS[m.id], m.id).toBeTruthy()
      expect(typeof VIEWS[m.id].render).toBe('function')
      expect(VIEWS[m.id].icon).toBeTruthy()
    }
  })
  it('ekran adları ve kapılar', () => {
    expect(registry.forRoute('routine-lite')?.id).toBe('routine')
    expect(registry.forRoute('snake')?.gates).toMatchObject({ gaze: true, eyeBudget: 'eye' })
    expect(registry.forRoute('daily')?.gates.eyeBudget).toBe('test')
    expect(registry.forRoute('blink')?.gates.eyeBudget).toBeUndefined() // dinlendirici; molada açık
    expect(registry.forRoute('breath')?.gates.eyeBudget).toBeUndefined()
    expect(registry.forRoute('home')).toBeNull()
    expect(registry.labelFor('routine-normal')).toBe('normal egzersiz seti')
    expect(registry.labelFor('track')).toBe('çemberler')
  })
  it('kayıtları tanır; silinecek anahtarlar modüllerden gelir', () => {
    expect(registry.forSession({ type: 'game', game: 'snake' })?.id).toBe('snake')
    expect(registry.forSession({ type: 'game', game: 'yok' })).toBeNull()
    expect(registry.resetKeys()).toEqual(expect.arrayContaining(['gozolcum:snake-best', 'gozolcum:track-best']))
    expect(registry.inSection('practice').map((m) => m.id)).toEqual(['quick-look', 'fark-ettin', 'track', 'tek-bakis', 'snake', 'breath', 'dalga', 'gokyuzu', 'yon', 'notice'])
  })
})

describe('modül soketi: tak / çıkar', () => {
  const yeni = {
    id: 'hizli-bakis',
    title: 'Hızlı Bakış',
    label: 'Hızlı Bakış',
    ring: 'attention',
    kind: 'practice',
    gates: { gaze: true, eyeBudget: 'eye' },
    storageKeys: ['gozolcum:hb-best'],
    home: { section: 'practice', order: 1 },
    progress: {
      domain: 'focus',
      effects: [{ key: 'hb-mood', label: 'Hızlı Bakış', measure: 'odak', max: 10, pick: (s) => (s.game === 'hb' ? [s.focusBefore, s.focusAfter] : null) }],
      metrics: [{ key: 'hb-ms', label: 'Tepki süresi', unit: 'ms', better: 'down', series: ({ sessions }) => sessions.filter((s) => s.game === 'hb').map((s) => ({ date: s.date, value: s.ms })) }],
    },
    sessions: {
      match: (s) => s.type === 'game' && s.game === 'hb',
      countsTowardGoal: false,
      describe: (s) => ({ title: 'Hızlı Bakış', detail: `${s.ms} ms`, score: s.score }),
      best: (ss) => Math.max(0, ...ss.map((s) => s.score ?? 0)),
      bestLabel: 'Hızlı Bakış rekoru',
    },
  }
  it('yeni modül takılınca her yere bağlanır', () => {
    const r = createRegistry([...registry.modules, yeni])
    expect(r.problems).toEqual([])
    expect(r.forRoute('hizli-bakis')?.id).toBe('hizli-bakis')
    expect(r.inSection('practice')[0].id).toBe('hizli-bakis')
    expect(r.forSession({ type: 'game', game: 'hb' })?.sessions.describe({ ms: 180 }).detail).toBe('180 ms')
    expect(r.resetKeys()).toContain('gozolcum:hb-best')
    // Gelişim'e kendiliğinden bağlanır: etkiler ve metrikler kayıt defterinden okunur
    expect(r.effects().find((e) => e.key === 'hb-mood')).toMatchObject({ module: 'hizli-bakis', domain: 'focus', measure: 'odak' })
    expect(r.metrics().find((m) => m.key === 'hb-ms')).toMatchObject({ module: 'hizli-bakis', domain: 'focus', better: 'down' })
  })
  it('Gelişim\'e ne kattığını söylemeyen modül reddedilir (unutulamaz)', () => {
    const { progress, ...eksik } = yeni
    expect(progress).toBeTruthy()
    const r = createRegistry([...registry.modules, eksik])
    expect(r.problems.join(' ')).toMatch(/progress yok/)
    expect(r.get('hizli-bakis')).toBeNull()
    expect(validateManifest({ ...yeni, progress: { domain: 'yok' } }).join(' ')).toMatch(/progress.domain/)
    expect(validateManifest({ ...yeni, progress: { domain: 'focus', metrics: [{ key: 'x', label: 'x', unit: 'x', better: 'yan', series: () => [] }] } }).join(' ')).toMatch(/better/)
  })
  it('gerçek modüllerin hepsi Gelişim\'e bağlı; kayıt tutanların etkisi/metriği kendi kayıt türünü okur', () => {
    for (const m of registry.modules) expect(DOMAINS, m.id).toContain(m.progress.domain)
    const keys = [...registry.effects().map((e) => e.key), ...registry.metrics().map((x) => x.key)]
    expect(new Set(keys).size).toBe(keys.length)
    // Her modülün kendi eşleştirdiği kayıtla metrik/etki okunabiliyor (tür adı yanlış yazılmadı)
    const sample = {
      breath: { type: 'breath', date: '2026-01-01', calmBefore: 2, calmAfter: 4 },
      gokyuzu: { type: 'gokyuzu', date: '2026-01-01', before: 3, after: 6 },
      dalga: { type: 'dalga', mode: 'guc', date: '2026-01-01', before: 4, after: 7 },
      yon: { type: 'yon', tool: 'uzak', date: '2026-01-01', before: 7, after: 4 },
    }
    for (const e of registry.effects()) {
      const s = sample[e.module]
      if (!s) continue
      expect(registry.forSession(s)?.id, e.key).toBe(e.module)
    }
    const metSample = {
      'fark-ettin': { type: 'street', date: '2026-01-01', noticed: 3, asked: 4 },
      'tek-bakis': { type: 'span', date: '2026-01-01', span: 5 },
      'quick-look': { type: 'quick-look', date: '2026-01-01', threshold: 120 },
      notice: { type: 'notice', date: '2026-01-01', count: 2 },
      'breath-count': { type: 'breath-count', date: '2026-01-01', accuracy: 90 },
      yon: { type: 'yon', tool: 'ayna', date: '2026-01-01', score: 3.4 },
    }
    for (const x of registry.metrics()) {
      const s = metSample[x.module]
      expect(s, x.key).toBeTruthy()
      expect(registry.forSession(s)?.id, x.key).toBe(x.module)
      expect(x.series({ tests: [], sessions: [s] }).length, x.key).toBe(1)
    }
  })
  it('çıkarılınca iz kalmaz', () => {
    const r = createRegistry(registry.modules.filter((m) => m.id !== 'snake'))
    expect(r.forRoute('snake')).toBeNull()
    expect(r.forSession({ type: 'game', game: 'snake' })).toBeNull()
    expect(r.resetKeys()).not.toContain('gozolcum:snake-best')
  })
  it('bozuk ya da çakışan modül reddedilir, diğerleri çalışır', () => {
    const bozuk = { id: 'Bozuk', title: '', ring: 'x', kind: 'y' }
    const cakisan = { ...yeni, id: 'kopya', routes: ['snake'] }
    const r = createRegistry([...registry.modules, bozuk, cakisan])
    expect(r.problems.length).toBeGreaterThanOrEqual(2)
    expect(r.get('kopya')).toBeNull()
    expect(r.forRoute('snake')?.id).toBe('snake')
    expect(validateManifest({ ...yeni, sessions: { ...yeni.sessions, bestLabel: undefined } })).not.toEqual([])
  })
})
