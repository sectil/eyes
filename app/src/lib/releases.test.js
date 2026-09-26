import { describe, it, expect } from 'vitest'
import { RELEASES, unseenReleases, latestRelease } from './releases.js'

describe('sürüm notları', () => {
  it('en yeni en üstte, kimlikler benzersiz ve azalan; her maddenin türü geçerli', () => {
    const ids = RELEASES.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect([...ids].sort().reverse()).toEqual(ids)
    for (const r of RELEASES) for (const it of r.items) expect(['new', 'fix', 'change']).toContain(it.kind)
  })
  it('görülmemişler: hiç görülmediyse yalnız en son; görülen sonrası yeniler', () => {
    expect(unseenReleases(null)).toEqual([latestRelease()])
    expect(unseenReleases(latestRelease().id)).toEqual([])
    expect(unseenReleases('2000-01-01').length).toBe(RELEASES.length)
  })
})
