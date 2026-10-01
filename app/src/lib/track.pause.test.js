// Çemberler duraklama kararı (TrackGame onFrame → pausedAction). Bug 23: başarılı kurtarmadan sonra yeniden başlatmak
// oyunda bir düğüme sabit bakışı merkez sayıyordu; yanlış "Ekrana bak" geri geliyordu.
import { describe, it, expect } from 'vitest'
import { pausedAction } from './track.js'

const base = { face: true, off: true, backMs: null, resumeMs: 400 }
describe('pausedAction', () => {
  it('kurtarma kabul edildi (halka doldu) → devam; yeniden başlatma yok', () => {
    expect(pausedAction({ ...base, rc: { active: false, progress: 0, result: 'ok' } })).toBe('resume')
  })
  it('kurtarma reddedildi ya da hiç yok → yeniden başlat', () => {
    expect(pausedAction({ ...base, rc: { active: false, progress: 0, result: 'failed' } })).toBe('restart')
    expect(pausedAction({ ...base, rc: { active: false, progress: 0, result: null } })).toBe('restart')
  })
  it('kurtarma sürerken bekle', () => {
    expect(pausedAction({ ...base, rc: { active: true, progress: 0.4, result: null } })).toBe('wait')
  })
  it('yüz yokken yeniden başlatılmaz (bekle)', () => {
    expect(pausedAction({ ...base, face: false, rc: { active: false, progress: 0, result: 'failed' } })).toBe('wait')
  })
  it('bakış kendiliğinden içeride ≥ 400 ms → devam (hızlı dönüş)', () => {
    const rc = { active: true, progress: 0.2, result: null }
    expect(pausedAction({ ...base, rc, off: false, backMs: 399 })).toBe('wait')
    expect(pausedAction({ ...base, rc, off: false, backMs: 400 })).toBe('resume')
  })
})
