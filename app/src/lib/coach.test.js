import { describe, it, expect, vi, afterEach } from 'vitest'
import { sanitizeSignals, parseCoachReply, passesGuard, SYSTEM_PROMPT, isStaleAdvice } from './coachCore.js'
import { buildSignals, fallbackInsight, getTodayInsight } from './coach.js'
import { trendMessage } from './trend.js'
import handler from '../../api/coach.js'
import { screenFor, actionTarget } from '../components/CoachCard.jsx'

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
  // Üçüncü doğrulama (2. doğrulayıcı, NIT 3): istem, ekrandan V-N6 ile kaldırılan "tek testler bir testten diğerine"
  // kalıbını taşıyordu; koç onu aynen yazabilirdi. Tek ölçümün oynaması Gelişim'deki cümlenin sözleriyle anlatılır.
  it('sistem istemi tek ölçümün oynamasını Gelişim ekranındaki sözlerle anlatır', () => {
    const phrase = 'tek bir ölçüm yaklaşık ±0,2 logMAR oynayabilir'
    for (const sparse of [false, true]) expect(trendMessage({ phase: 'tracking', alert: null, trend: 'stable', sparse })).toContain(phrase)
    expect(SYSTEM_PROMPT).toContain(phrase)
    expect(SYSTEM_PROMPT).not.toMatch(/bir testten diğerine|tek testler\b|tek testi\b/)
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
  // Bug 25 (HATA_GUNLUGU): kırmızı uyarıda yedek metin "birkaç gün daha ölç" diyordu (trend.js ve SYSTEM_PROMPT ile çelişki)
  it('kırmızıda yalnız göz doktoru: bekletmez, test önermez; sarıda "sürerse göz doktoruna"', () => {
    const red = fallbackInsight({ vaAlert: 'red' })
    expect(red).toEqual({ insight: 'Son ölçümlerin başlangıcına göre belirgin şekilde kötü.', action: 'Lütfen bir göz doktoruna başvur' })
    const yellow = fallbackInsight({ vaAlert: 'yellow' })
    expect(yellow.action).toBe('Işığı ve mesafeyi kontrol et; sürerse göz doktoruna danış')
    for (const t of [red, yellow]) expect(`${t.insight} ${t.action}`).not.toMatch(/birkaç gün|günlük test/i)
  })
  // Karar 2026-09-29: E testi haftada bir; Nef günlük test önermez
  it('ölçüm yoksa haftalık test', () => {
    // İlk test alışmadır (inceleme 2026-09-29: "ilk ölçüm başlangıç noktan olacak" yeni kuralla çelişiyordu)
    expect(fallbackInsight({})).toEqual({ insight: 'Henüz ölçüm yok. İlk haftalık test alışma sayılır; başlangıç değerin sonraki 3 haftalık testle oluşur.', action: 'Haftalık test' })
  })
  it('haftalık test yalnız zamanı gelince önerilir; arada test istenmez', () => {
    const quiet = { tests7: 0, daysSinceLastTest: 4, thisWeekDays: 1, weeklyTarget: 3 }
    expect(fallbackInsight(quiet, { weeklyDue: false }).action).not.toMatch(/test/i)
    expect(fallbackInsight(quiet).action).not.toMatch(/test/i) // 4 gün: haftalık zamanı gelmedi
    expect(fallbackInsight({ ...quiet, daysSinceLastTest: 8 })).toEqual({ insight: 'Haftalık E testinin zamanı geldi.', action: 'Haftalık test' })
    expect(fallbackInsight({ ...quiet, daysSinceLastTest: 2 }, { weeklyDue: true }).action).toBe('Haftalık test')
  })
  it('çevrimdışı yedek haftalık durumu kayıtlardan okur (sunucuya gitmez)', async () => {
    const offline = async () => { throw new Error('offline') }
    const wk = (d) => ['R', 'L', 'OU'].map((eye) => ({ type: 'va-weekly', eye, logMAR: 0.1, date: day(d) }))
    // haftalık 3 gün önce tamam; arada 1 gün önce okuma testi → test önerilmez
    const recent = await getTodayInsight({ tests: [...wk(3), { type: 'reading', maxReadingSpeed: 120, date: day(1) }], sessions: [], now: NOW, fetchImpl: offline })
    expect(recent.action).not.toMatch(/test/i)
    // haftalık 8 gün önce; dün okuma testi yapılmış olsa da haftalık zamanı gelmiş
    const due = await getTodayInsight({ tests: [...wk(8), { type: 'reading', maxReadingSpeed: 120, date: day(1) }], sessions: [], now: NOW, fetchImpl: offline })
    expect(due).toMatchObject({ source: 'rules', action: 'Haftalık test' })
  })
  it('Nef eylemi → ekran: "Haftalık test" ve eski "Günlük test" cevabı haftalık teste gider', () => {
    expect(screenFor('Haftalık test')).toBe('weekly')
    expect(screenFor('Günlük test — sabah')).toBe('weekly')
    expect(screenFor('Lütfen bir göz doktoruna başvur')).toBeNull()
    expect(screenFor('Hafif set (1 dk)')).toBe('routine-lite')
  })
  it('sistem istemi günlük test önermez; eylem listesinde "Haftalık test"', () => {
    expect(SYSTEM_PROMPT).toContain('"Haftalık test"')
    expect(SYSTEM_PROMPT).not.toContain('"Günlük test"')
    expect(SYSTEM_PROMPT).toContain('her gün test önerme')
    expect(SYSTEM_PROMPT).toContain('"Haftalık test"i yalnızca weeklyDue true ise öner')
    expect(SYSTEM_PROMPT).not.toMatch(/Birkaç gün daha ölç;|Son bir haftadır/)
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

describe('profil özeti (coachLife onayı)', () => {
  it('yalnız profil verilirse gider; tanı alanı üretmez', async () => {
    const { buildSignals } = await import('./coach.js')
    const now = new Date('2026-09-25T10:00:00')
    const prof = { sleep: 3, screenHours: '6+', nightPhone: 'most', stress: { control: 3, overwhelmed: 2 } }
    const withLife = buildSignals([], [], now, 3, prof)
    expect(withLife).toMatchObject({ sleep7: 3, screenHours: '6+', nightPhone: 'most', stress8: 5 })
    const without = buildSignals([], [], now, 3)
    expect(without.sleep7).toBeUndefined()
    expect(without.stress8).toBeUndefined()
    expect(sanitizeSignals({ screenHours: '9 saat', sleep7: 11, stress8: 9 })).toEqual({})
  })
})

// İnceleme 2026-09-29: çevrimiçi Nef cevabı hiç denetlenmiyordu. Sunucu eski istemle ("Günlük test", "Birkaç gün daha
// ölç") yayımdayken ya da model kuralı çiğnerse kart günlük test önerebilirdi; "Haftalık test" düğmesi de zamanı
// gelmemiş haftalık testi açabiliyordu. Çevrimiçi ve çevrimdışı Nef aynı "zamanı geldi" kuralına bakar (weeklyDue).
describe('Nef: günlük test öneren cevap kullanılmaz; haftalık test yalnız zamanı gelince', () => {
  const wk = (d) => ['R', 'L', 'OU'].map((eye) => ({ type: 'va-weekly', eye, logMAR: 0.1, date: day(d) }))
  const reply = (insight, action) => async () => ({ json: async () => ({ ok: true, insight, action }) })
  it('günlük test / her gün ölç / birkaç gün daha ölç diyen sunucu cevabı → kural tabanlı öneri', async () => {
    for (const [i, a] of [
      ['Sabah testlerin daha iyi. Bugün de sabah ölç.', 'Günlük test — sabah'],
      ['Son ölçümlerin biraz kötü; birkaç gün daha ölç.', 'Haftalık test'],
      ['Her gün test etmek düzeni korur.', 'Hafif set'],
      ['Düzenin iyi.', 'Günlük E testi'],
    ]) {
      const r = await getTodayInsight({ tests: wk(3), sessions: [], now: NOW, fetchImpl: reply(i, a) })
      expect(r.source, a).toBe('rules')
      expect(`${r.insight} ${r.action}`).not.toMatch(/günlük test|birkaç gün/i)
    }
    const ok = await getTodayInsight({ tests: wk(3), sessions: [], now: NOW, fetchImpl: reply('Bu hafta 2 gün çalıştın.', 'Hafif set') })
    expect(ok).toMatchObject({ source: 'jev', action: 'Hafif set' })
  })
  it('sunucu tarafı da aynı taramayı yapar (parseCoachReply)', () => {
    expect(parseCoachReply('{"insight":"Bugün de sabah ölç.","action":"Günlük test — sabah"}')).toBeNull()
    expect(isStaleAdvice('Birkaç gün daha ölç')).toBe(true)
    expect(isStaleAdvice('Haftalık E testinin zamanı geldi.', 'Haftalık test')).toBe(false)
  })
  it('weeklyDue sinyali: kısa test ya da okuma testinden sonra da haftalığın zamanı gelmişse true', () => {
    const shortToday = ['R', 'L'].map((eye) => ({ type: 'va-daily', eye, logMAR: 0.1, date: day(0) }))
    const s = buildSignals([...wk(8), ...shortToday], [], NOW, 3)
    expect(s).toMatchObject({ weeklyDue: true, daysSinceLastTest: 0 })
    expect(buildSignals(wk(3), [], NOW, 3).weeklyDue).toBe(false)
    expect(sanitizeSignals({ weeklyDue: 'evet' })).toEqual({})
    expect(sanitizeSignals({ weeklyDue: false })).toEqual({ weeklyDue: false })
    // çevrimdışı öneri de aynı sinyale bakar
    expect(fallbackInsight(s)).toEqual({ insight: 'Haftalık E testinin zamanı geldi.', action: 'Haftalık test' })
  })
  it('"Haftalık test" düğmesi yalnız zamanı gelince haftalık testi açar; yoksa düz yazı', () => {
    expect(actionTarget('Haftalık test', wk(8), NOW)).toBe('weekly')
    expect(actionTarget('Haftalık test', wk(3), NOW)).toBeNull()
    expect(actionTarget('Günlük test — sabah', wk(3), NOW)).toBeNull()
    expect(actionTarget('Hafif set (1 dk)', wk(3), NOW)).toBe('routine-lite')
    expect(actionTarget('Haftalık test', [], NOW)).toBe('weekly') // hiç ölçüm yok: ilk haftalık test
  })
})
