import { describe, it, expect } from 'vitest'
import { buildDateText, buildInfo, versionLine } from './buildInfo.js'

describe('buildInfo', () => {
  it('derleme anı Türkçe gün, ay, yıl ve saatle yazılır', () => {
    expect(buildDateText(new Date(2026, 8, 30, 21, 4).toISOString())).toBe('30 Eylül 2026, 21.04')
    expect(buildDateText('bozuk')).toBeNull()
    expect(buildDateText(undefined)).toBeNull()
  })
  it('sürüm: build numarası varsa "1.0 (64)", yoksa "web"; commit ve tarih derlemeden gelir', () => {
    const info = buildInfo({ VITE_APP_BUILD: '64' })
    expect(info.version).toBe('1.0 (64)')
    expect(buildInfo({}).version).toBe('web')
    expect(typeof info.date).toBe('string') // vite define (vitest de vite.config.js'i okur)
  })
  it('Yenilikler alt yazısı', () => {
    expect(versionLine({ version: '1.0 (64)', date: '30 Eylül 2026, 21.04', sha: 'abc1234' })).toBe('Bu sürüm: 1.0 (64) · 30 Eylül 2026, 21.04')
    expect(versionLine({ version: 'web', date: null, sha: null })).toBe('Bu sürüm: web')
  })
})
