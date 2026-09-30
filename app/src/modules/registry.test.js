import { describe, it, expect } from 'vitest'
import { registry, createRegistry, validateManifest, validateRemind, remindWindow, DOMAINS, REMIND_WINDOWS } from './registry.js'
import { REMIND_WINDOWS as PLAN_WINDOWS } from '../lib/moduleRemind.js'
import { VIEWS } from './views.js'

describe('modül soketi: gerçek modüller', () => {
  it('hepsi geçerli, sorun yok', () => {
    expect(registry.problems).toEqual([])
    expect(registry.modules.map((m) => m.id).sort()).toEqual(['alarm', 'awareness', 'blink', 'breath', 'breath-count', 'daily', 'dalga', 'fark-ettin', 'gokyuzu', 'mola', 'notice', 'quick-look', 'reading', 'routine', 'snake', 'tek-bakis', 'track', 'water', 'weekly', 'who5', 'yoga', 'yon'])
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
    expect(registry.resetKeys()).toEqual(expect.arrayContaining(['gozolcum:snake-best', 'gozolcum:track-best', 'gozolcum:habit-log', 'gozolcum:notify-log', 'gozolcum:notify-seed', 'gozolcum:focus']))
    // mola ve quick-look aynı sırada (5): eşitlikte klasör sırası (import.meta.glob), mola önde. Su Ana sayfada yok (hatırlatmadan açılır)
    expect(registry.inSection('practice').map((m) => m.id)).toEqual(['mola', 'quick-look', 'fark-ettin', 'track', 'tek-bakis', 'snake', 'breath', 'dalga', 'gokyuzu', 'yon', 'notice'])
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
      yoga: { type: 'yoga', lesson: 3, date: '2026-01-01', sleepEase: 7 }, // Uykuya Geçiş: ertesi sabahın sorusu (modul.md §9)
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

// "Bana hatırlat" yeteneği (docs/yol-haritasi/tasarim/bildirim-hava-yuruyus/PLAN.v1.md §A.1, §5.3)
describe('modül soketi: remind', () => {
  const temel = {
    id: 'hatirla',
    routes: ['hatirla', 'hatirla-1'],
    title: 'Hatırla',
    label: 'Hatırla',
    ring: 'life',
    kind: 'practice',
    progress: { domain: 'calm' },
    sessions: { match: (s) => s.type === 'hatirla', countsTowardGoal: true, describe: () => ({ title: 'Hatırla', detail: '' }) },
  }
  const ile = (remind, extra = {}) => ({ ...temel, ...extra, remind })
  const hatasi = (remind, extra) => validateRemind(ile(remind, extra)).join(' ')

  // B1a ikinci tur (sahip kararı 2026-09-30, metin-B1a-onay.md): yalnız kaynağı doğrulanmış dört modül remind alır
  it('gerçek modüllerde remind yalnız routine, blink, yoga, gokyuzu; sorun yok', () => {
    expect(registry.modules.filter((m) => m.remind != null).map((m) => m.id).sort()).toEqual(['blink', 'gokyuzu', 'routine', 'yoga'])
    expect(registry.reminders().map((x) => x.module).sort()).toEqual(['blink', 'gokyuzu', 'routine', 'yoga'])
    expect(registry.remindProblems).toEqual([])
  })
  it('geçerli remind: varsayılanlar dolar, pencere türden gelir', () => {
    const r = createRegistry([...registry.modules, ile({ science: ['kim2020'] })])
    expect(r.problems).toEqual([])
    expect(r.remindProblems).toEqual([])
    const x = r.reminders().find((y) => y.module === 'hatirla')
    expect(x).toMatchObject({ module: 'hatirla', route: null, legacy: null, window: 'move', from: '09:00', to: '21:00', defaultTime: null, maxTimes: 3, science: ['kim2020'] })
    expect(typeof x.doneToday).toBe('function')
    expect(remindWindow({ window: 'calm' })).toEqual({ from: '08:00', to: '22:00' })
    expect(remindWindow({ legacy: 'breath' })).toEqual({ from: '09:00', to: '21:00' })
    expect(remindWindow({ legacy: 'water' })).toEqual({ from: '09:00', to: '18:00' })
    const calm = createRegistry([ile({ route: 'hatirla-1', window: 'calm', defaultTime: '08:00', maxTimes: 2, science: ['fincham2023', 'laborde2022'] })]).reminders()[0]
    expect(calm).toMatchObject({ route: 'hatirla-1', window: 'calm', from: '08:00', to: '22:00', defaultTime: '08:00', maxTimes: 2 })
    const legacy = createRegistry([ile({ legacy: 'water', defaultTime: '18:00', science: ['stout2022'] })]).reminders()[0]
    expect(legacy).toMatchObject({ legacy: 'water', window: null, from: '09:00', to: '18:00' })
  })
  it('doneToday yoksa progression.match ?? sessions.match tutan bugünkü kayıt', () => {
    const now = new Date(2026, 8, 30, 15, 0)
    const bugun = { type: 'hatirla', date: new Date(2026, 8, 30, 10, 0).toISOString(), seconds: 30 }
    const dun = { type: 'hatirla', date: new Date(2026, 8, 29, 10, 0).toISOString(), seconds: 90 }
    const [a] = createRegistry([ile({ science: ['kim2020'] })]).reminders()
    expect(a.doneToday([bugun], now)).toBe(true)
    expect(a.doneToday([dun], now)).toBe(false)
    expect(a.doneToday([], now)).toBe(false)
    const [b] = createRegistry([ile({ science: ['kim2020'] }, { progression: { match: (s) => s.type === 'hatirla' && s.seconds >= 60 } })]).reminders()
    expect(b.doneToday([bugun], now)).toBe(false) // progression.match önce gelir
    const kendi = () => true
    expect(createRegistry([ile({ science: ['kim2020'], doneToday: kendi })]).reminders()[0].doneToday).toBe(kendi)
  })
  it('doğrulama kuralları', () => {
    expect(hatasi({ science: ['kim2020'] })).toBe('')
    expect(hatasi('evet')).toMatch(/remind: nesne/)
    expect(hatasi([])).toMatch(/remind: nesne/)
    expect(hatasi({ route: 'baska', science: ['kim2020'] })).toMatch(/route/)
    expect(hatasi({ route: 'hatirla', science: ['kim2020'] }, { routes: undefined })).toBe('') // routes yoksa [id]
    expect(hatasi({ legacy: 'yoga', science: ['kim2020'] })).toMatch(/legacy/)
    expect(hatasi({ window: 'gece', science: ['kim2020'] })).toMatch(/window/)
    expect(hatasi({ legacy: 'breath', window: 'calm', science: ['kim2020'] })).toMatch(/legacy türde window/)
    expect(hatasi({ defaultTime: '9:00', science: ['kim2020'] })).toMatch(/defaultTime/)
    expect(hatasi({ defaultTime: '08:30', science: ['kim2020'] })).toMatch(/defaultTime.*09:00–21:00/) // move 09.00'da başlar
    expect(hatasi({ window: 'calm', defaultTime: '08:30', science: ['kim2020'] })).toBe('')
    expect(hatasi({ window: 'calm', defaultTime: '22:01', science: ['kim2020'] })).toMatch(/defaultTime/)
    expect(hatasi({ legacy: 'water', defaultTime: '19:00', science: ['stout2022'] })).toMatch(/defaultTime.*09:00–18:00/)
    for (const maxTimes of [0, 4, 1.5, '2']) expect(hatasi({ maxTimes, science: ['kim2020'] }), String(maxTimes)).toMatch(/maxTimes/)
    for (const maxTimes of [1, 2, 3]) expect(hatasi({ maxTimes, science: ['kim2020'] })).toBe('')
    expect(hatasi({ doneToday: true, science: ['kim2020'] })).toMatch(/doneToday/)
    expect(hatasi({})).toMatch(/science en az bir/)
    expect(hatasi({ science: [] })).toMatch(/science en az bir/)
    expect(hatasi({ science: ['yok2099'] })).toMatch(/'yok2099'/)
    expect(hatasi({ science: ['toString'] })).toMatch(/'toString'/) // prototipten gelen ad kaynak sayılmaz
    // pmid ya da doi taşımayan kaynak geçmez
    expect(validateRemind(ile({ science: ['x'] }), { x: { pmid: '1' } }).join(' ')).toMatch(/'x'/)
    expect(validateRemind(ile({ science: ['x'] }), { x: { pmid: '1', doi: '10.1/x' } })).toEqual([])
    // validateManifest remind hatasını da söyler; remind yoksa hiçbir şey eklemez
    expect(validateManifest(ile({ science: [] })).join(' ')).toMatch(/remind: science/)
    expect(validateManifest(temel)).toEqual([])
  })
  it('science anahtarı eksik modül yine registry.live\'da; reminders()\'da yok, hata remindProblems\'ta', () => {
    const eksik = ile({ window: 'calm', science: ['balban2023'] }) // tam metin gerekli: sources.js'e girmedi
    const r = createRegistry([...registry.modules, eksik])
    expect(r.problems).toEqual([])
    expect(r.get('hatirla')).toBe(eksik)
    expect(r.live.map((m) => m.id)).toContain('hatirla')
    expect(r.forRoute('hatirla-1')?.id).toBe('hatirla')
    expect(r.reminders().map((x) => x.module)).not.toContain('hatirla')
    expect(r.remindProblems.join(' ')).toMatch(/hatirla: remind: science: 'balban2023'/)
  })
  it('temel kuralı bozuk modül yine reddedilir; remind onu kurtarmaz', () => {
    const { progress, ...eksik } = temel
    expect(progress).toBeTruthy()
    const r = createRegistry([{ ...eksik, remind: { science: ['kim2020'] } }])
    expect(r.problems.join(' ')).toMatch(/progress yok/)
    expect(r.reminders()).toEqual([])
    expect(r.remindProblems).toEqual([])
  })
  it("route: routine gibi yol açan modül için 'home' de geçer (PLAN.v1 §A.1 tablosu); başka uygulama ekranı geçmez", () => {
    expect(hatasi({ route: 'home', science: ['kim2020'] })).toBe('')
    expect(hatasi({ route: 'home', science: ['kim2020'] }, { routes: ['routine-a', 'routine-b'] })).toBe('')
    expect(hatasi({ route: 'profile', science: ['kim2020'] })).toMatch(/route.*home/)
    const [x] = createRegistry([ile({ route: 'home', science: ['kim2020'] })]).reminders()
    expect(x.route).toBe('home')
  })
  it('koşullu kaynak (only) remind havuzuna girmez; remind düşer, modül kalır', () => {
    for (const key of ['radin2025', 'habarubio2015', 'chaput2016', 'smith2017']) {
      expect(hatasi({ window: 'calm', science: ['fincham2023', key] }), key).toMatch(new RegExp(`'${key}' koşullu`))
    }
    const r = createRegistry([ile({ window: 'calm', science: ['radin2025'] })])
    expect(r.get('hatirla')).toBeTruthy()
    expect(r.reminders()).toEqual([])
    expect(r.remindProblems.join(' ')).toMatch(/yalnız meditation/)
  })
  it('pencereler tek kaynaktan: registry ile planlayıcı aynı nesneyi kullanır', () => {
    expect(REMIND_WINDOWS).toBe(PLAN_WINDOWS)
    expect(remindWindow({ window: 'move' })).toBe(PLAN_WINDOWS.move)
  })
  it('emekli modül hatırlatılmaz', () => {
    const r = createRegistry([ile({ science: ['kim2020'] }, { retired: true })])
    expect(r.get('hatirla')).toBeTruthy()
    expect(r.reminders()).toEqual([])
  })
})

// Bildirim B1a (PLAN.v1 §A.1 modül tablosu; sahip kararları metin-B1a-onay.md): remind yalnız routine, blink, yoga, gokyuzu
describe('modül soketi: remind (B1a manifestleri)', () => {
  const byId = (id) => registry.modules.find((m) => m.id === id)
  it('dört modülün remind\'i geçerli ve reminders()\'da', () => {
    for (const id of ['routine', 'blink', 'yoga', 'gokyuzu']) expect(validateRemind(byId(id)), id).toEqual([])
    const r = Object.fromEntries(registry.reminders().map((x) => [x.module, x]))
    expect(r.routine).toMatchObject({ route: 'home', window: 'move', from: '09:00', to: '21:00', science: ['talens2022'] })
    expect(r.blink).toMatchObject({ route: 'blink', window: 'move', science: ['kim2020', 'wolffsohn2025'] })
    expect(r.yoga).toMatchObject({ route: 'yoga', window: 'calm', from: '08:00', to: '22:00', science: ['moszeik2025', 'luu2024'] })
    expect(r.gokyuzu).toMatchObject({ route: 'gokyuzu', window: 'calm', science: ['yamashita2021', 'talens2022'] })
    expect(registry.remindProblems).toEqual([])
  })
  it('kaynağı olmayan modüller bu turda remind almaz; yoga radin2025 taşımaz', () => {
    for (const id of ['snake', 'track', 'tek-bakis', 'quick-look', 'fark-ettin', 'notice', 'dalga', 'yon']) {
      expect(byId(id)?.remind, id).toBeUndefined()
    }
    expect(registry.reminders().map((x) => x.module).sort()).toEqual(['blink', 'gokyuzu', 'routine', 'yoga'])
    expect(byId('yoga').remind.science).not.toContain('radin2025')
  })
})
