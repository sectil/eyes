import { describe, it, expect, vi, afterEach } from 'vitest'
import { sanitizeSignals, parseCoachReply, passesGuard, SYSTEM_PROMPT } from './coachCore.js'
import { buildSignals, fallbackInsight, getTodayInsight } from './coach.js'
import handler from '../../api/coach.js'

const NOW = new Date('2026-09-24T10:00:00')
const day = (d) => new Date(NOW.getTime() - d * 86400000).toISOString()
const tests = [
  { type: 'va-daily', eye: 'OU', logMAR: 0.3, date: day(20) },
  { type: 'va-daily', eye: 'OU', logMAR: 0.28, date: day(2) },
]
const sessions = [
  { type: 'routine', setId: 'lite', seconds: 70, date: day(1) },
  { type: 'game', game: 'snake', score: 12, best: 12, seconds: 90, date: day(0) },
]

describe('sanitizeSignals', () => {
  it('bilinmeyen alanları ve sınır dışı değerleri atar', () => {
    const s = sanitizeSignals({ daysActive7: 3, name: 'Haydar', minutes7: -5, vaAlert: 'purple', vaTrend: 'stable' })
    expect(s).toEqual({ daysActive7: 3, vaTrend: 'stable' })
  })
})

describe('parseCoachReply / passesGuard', () => {
  it('geçerli JSON', () => {
    expect(parseCoachReply('```json\n{"insight":"Bu hafta 2 gün çalıştın.","action":"Hafif set"}\n```')).toEqual({ insight: 'Bu hafta 2 gün çalıştın.', action: 'Hafif set' })
  })
  it('tıbbi iddia içeren cevap reddedilir', () => {
    expect(parseCoachReply('{"insight":"Bu egzersiz görmeni iyileştirir.","action":"Hafif set"}')).toBeNull()
    expect(passesGuard('Gözlükten kurtulursun')).toBe(false)
    expect(passesGuard('Numaran düşer')).toBe(false)
  })
  it('bozuk / eksik cevap → null', () => {
    expect(parseCoachReply('merhaba')).toBeNull()
    expect(parseCoachReply('{"insight":"x"}')).toBeNull()
  })
  it('sistem istemi temel yasakları içerir', () => {
    expect(SYSTEM_PROMPT).toMatch(/UYDURMA/)
    expect(SYSTEM_PROMPT).toMatch(/Teşhis koyma/)
  })
})

describe('buildSignals / fallbackInsight', () => {
  it('oyun hedefe sayılmaz; özet sayılar', () => {
    const s = buildSignals(tests, sessions, NOW, 3)
    expect(s.daysActive7).toBe(2) // test (2 gün önce) + egzersiz (1 gün önce); oyun sayılmaz
    expect(s.snakeBest).toBe(12)
    expect(s.weeklyTarget).toBe(3)
    expect(s.daysSinceLastTest).toBe(2)
    expect(JSON.stringify(s)).not.toMatch(/Haydar|date/)
  })
  it('uyarı varsa doktor önerisi', () => {
    expect(fallbackInsight({ vaAlert: 'red' }).action).toMatch(/göz doktoru/)
  })
  it('ölçüm yoksa günlük test', () => {
    expect(fallbackInsight({}).action).toMatch(/^Günlük test/)
  })
})

describe('getTodayInsight', () => {
  afterEach(() => vi.restoreAllMocks())
  it('sunucu cevabı', async () => {
    const fetchImpl = vi.fn(async () => ({ json: async () => ({ ok: true, insight: 'İyi gidiyorsun.', action: 'Hafif set' }) }))
    const r = await getTodayInsight({ tests, sessions, weeklyTarget: 3, now: NOW, fetchImpl })
    expect(r.source).toBe('jev')
    const body = JSON.parse(fetchImpl.mock.calls[0][1].body)
    expect(body.kind).toBe('today')
    expect(Object.keys(body.signals)).not.toContain('tests')
  })
  it('ağ hatasında kural tabanlı yedek', async () => {
    const r = await getTodayInsight({ tests, sessions, now: NOW, fetchImpl: async () => { throw new Error('offline') } })
    expect(r.source).toBe('rules')
    expect(r.action).toBeTruthy()
  })
})

describe('api/coach (Vercel fonksiyonu)', () => {
  const req = (body, method = 'POST', origin = 'capacitor://localhost') =>
    new Request('https://eyetrail.vercel.app/api/coach', { method, headers: { origin, 'content-type': 'application/json' }, body: method === 'POST' ? JSON.stringify(body) : undefined })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })
  it('anahtar yoksa 503', async () => {
    vi.stubEnv('EYETRAIL_OPENROUTER_KEY', '')
    const r = await handler.fetch(req({ kind: 'today', signals: {} }))
    expect(r.status).toBe(503)
  })
  it('OPTIONS → CORS, capacitor kökenine izin', async () => {
    const r = await handler.fetch(req(null, 'OPTIONS'))
    expect(r.status).toBe(204)
    expect(r.headers.get('access-control-allow-origin')).toBe('capacitor://localhost')
  })
  it('OpenRouter cevabını doğrular ve döner; anahtar yalnızca başlıkta', async () => {
    vi.stubEnv('EYETRAIL_OPENROUTER_KEY', 'sk-test')
    vi.stubEnv('EYETRAIL_COACH_MODEL', 'test/model')
    const upstream = vi.fn(async () => new Response(JSON.stringify({ choices: [{ message: { content: '{"insight":"Bu hafta 2/3 gün.","action":"Hafif set"}' } }] }), { status: 200 }))
    vi.stubGlobal('fetch', upstream)
    const r = await handler.fetch(req({ kind: 'today', signals: { daysActive7: 2, secret: 'x' } }))
    const data = await r.json()
    expect(data).toMatchObject({ ok: true, insight: 'Bu hafta 2/3 gün.', action: 'Hafif set', model: 'test/model' })
    const [, init] = upstream.mock.calls[0]
    expect(init.headers.Authorization).toBe('Bearer sk-test')
    expect(init.body).not.toMatch(/secret/)
  })
  it('güvensiz model cevabı → 422', async () => {
    vi.stubEnv('EYETRAIL_OPENROUTER_KEY', 'sk-test')
    vi.stubGlobal('fetch', async () => new Response(JSON.stringify({ choices: [{ message: { content: '{"insight":"Görmeni iyileştirir","action":"Hafif set"}' } }] }), { status: 200 }))
    const r = await handler.fetch(req({ kind: 'today', signals: {} }))
    expect(r.status).toBe(422)
  })
  it('büyük gövde → 413', async () => {
    vi.stubEnv('EYETRAIL_OPENROUTER_KEY', 'sk-test')
    const r = await handler.fetch(req({ kind: 'today', signals: { pad: 'x'.repeat(5000) } }))
    expect(r.status).toBe(413)
  })
})
