import { describe, it, expect } from 'vitest'
import { registry, createRegistry, validateManifest } from './registry.js'
import { VIEWS } from './views.js'

describe('modül soketi: gerçek modüller', () => {
  it('hepsi geçerli, sorun yok', () => {
    expect(registry.problems).toEqual([])
    expect(registry.modules.map((m) => m.id).sort()).toEqual(['blink', 'breath-count', 'daily', 'reading', 'routine', 'snake', 'track', 'weekly'])
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
    expect(registry.forRoute('snake')?.gates).toMatchObject({ gaze: true, rest: true, active: true })
    expect(registry.forRoute('blink')?.gates.rest).toBeFalsy() // egzersizin kendi molası var
    expect(registry.forRoute('home')).toBeNull()
    expect(registry.labelFor('routine-normal')).toBe('normal egzersiz seti')
    expect(registry.labelFor('track')).toBe('çember takibi')
  })
  it('kayıtları tanır; silinecek anahtarlar modüllerden gelir', () => {
    expect(registry.forSession({ type: 'game', game: 'snake' })?.id).toBe('snake')
    expect(registry.forSession({ type: 'game', game: 'yok' })).toBeNull()
    expect(registry.resetKeys()).toEqual(expect.arrayContaining(['gozolcum:snake-best', 'gozolcum:track-best']))
    expect(registry.inSection('practice').map((m) => m.id)).toEqual(['track', 'snake'])
  })
})

describe('modül soketi: tak / çıkar', () => {
  const yeni = {
    id: 'hizli-bakis',
    title: 'Hızlı Bakış',
    label: 'Hızlı Bakış',
    ring: 'attention',
    kind: 'practice',
    gates: { gaze: true, rest: true, active: true },
    storageKeys: ['gozolcum:hb-best'],
    home: { section: 'practice', order: 5 },
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
