import { describe, it, expect } from 'vitest'
import { nudgeLines } from './Progress.jsx'

// Gelişim → Hatırlatmaların kartı (lib/notifyLog.js evaluate çıktısından)
const ready = { days: 30, sentDays: 16, silentDays: 5, sentDone: 10, silentDone: 2, ready: true }

describe('nudgeLines', () => {
  it('mola: gelen/gelmeyen günler sayıyla', () => {
    expect(nudgeLines('mola', ready).body).toMatch(/^Hatırlatma gelen 16 günün 10'unda, gelmeyen 5 günün 2'sinde/)
  })
  it('yürüyüş: sessiz taraf "gelmeyen" değil; iptal edilen ve önceden yapılan gün ayrı yazılı', () => {
    const { body } = nudgeLines('walk', ready)
    expect(body).toMatch(/^Hatırlatma günü olan 16 günün 10'unda, bilerek gönderilmeyen 5 günün 2'sinde/)
    expect(body).not.toMatch(/gelmeyen/)
    expect(body).toMatch(/telefon hatırlatmayı iptal eder; o gün yine hatırlatma günü sayılır/)
    expect(body).toMatch(/saatten önce açtığında adımın zaten yeterliyse o gün sayılmaz/)
    expect(nudgeLines('walk', { ...ready, ready: false, days: 25, silentDays: 2 }).lead).toBe('Ölçüm sürüyor: bilerek gönderilmeyen gün 2/5')
  })
  it('yürüyüş ölçülemiyorsa sayı yerine neden (izin yok / adım okunamıyor / Apple Sağlık yok)', () => {
    const off = { days: 0, sentDays: 0, silentDays: 0, sentDone: 0, silentDone: 0, ready: false }
    expect(nudgeLines('walk', { ...off, blocked: 'consent' }).lead).toMatch(/^Adımlarını okuma iznin yok/)
    expect(nudgeLines('walk', { ...ready, blocked: 'steps' })).toEqual({ lead: expect.stringMatching(/^Adımların okunamıyor/), body: null, verdict: null })
    expect(nudgeLines('walk', { ...off, blocked: 'noHealth' }).lead).toMatch(/Apple Sağlık olan iPhone/)
    expect(nudgeLines('walk', { ...off, days: 3, blocked: null }).lead).toBe('Ölçüm sürüyor: 3/21 gün')
  })
  it('bildirimler kapalı: ölçüm sürüyor denmez; birikmiş gerçek sayılar yine gösterilir', () => {
    expect(nudgeLines('mola', { ...ready, ready: false }, { off: true }).lead).toBe('Ölçüm duruyor: bildirimler kapalı.')
    expect(nudgeLines('mola', ready, { off: true }).body).toMatch(/^Hatırlatma gelen 16 günün/)
  })
})
