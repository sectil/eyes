// Nef ve yoga (yoga-pilot/v3/modul.md §8; PLAN.v3 §D.5, §D.7): Nef'e yalnız dört sayı gider; son 7 günde yoga yoksa
// özet null. "Yoga" önerisi kütüphaneyi açar, web'de düğme olmaz. Özet süzgecinin 10 modül sınırı ölçülür.
import { describe, it, expect } from 'vitest'
import { SYSTEM_PROMPT, sanitizeModules, sanitizeSignals, passesGuard, parseCoachReply } from './coachCore.js'
import { moduleSignals, buildSignals } from './coach.js'
import { screenFor, actionTarget } from '../components/CoachCard.jsx'
import { registry } from '../modules/registry.js'
import { makeYogaRecord } from './yogaRecord.js'

const NOW = new Date(2026, 8, 30, 10, 0)
const ago = (d, h = 9) => new Date(2026, 8, 30 - d, h, 0)
const rec = (lesson, d, extra = {}) => ({ id: `${lesson}-${d}-${extra.h ?? 9}`, ...makeYogaRecord({ lesson, planned: 300, seconds: 300, reachedClosing: true, before: lesson === 3 ? null : 7, after: lesson === 3 ? null : 3, hard: 'much', endedAt: ago(d, extra.h ?? 9) }), ...extra })

describe('Nef\'e giden yoga özeti: yalnız dört sayı', () => {
  const yoga = registry.get('yoga')
  it('son 7 günde yoga yoksa null (başka kayıtlar olsa da); 8 gün önceki ders sayılmaz', () => {
    expect(yoga.coach([], NOW)).toBeNull()
    expect(yoga.coach([{ type: 'breath', seconds: 300, date: ago(1).toISOString() }], NOW)).toBeNull()
    expect(yoga.coach([rec(2, 8)], NOW)).toBeNull()
    expect(moduleSignals([rec(2, 8)], NOW).yoga).toBeUndefined()
  })
  it('dört sayı: ders, dakika, tamamlanan, pratik günü; puan, ders adı, zorlanma ve uyku cevabı gitmez', () => {
    const sessions = [rec(2, 1), rec(5, 1, { h: 18 }), { ...rec(3, 2), sleepEase: 8 }, { ...rec(1, 3), completed: false, reachedClosing: false, seconds: 60 }]
    const out = yoga.coach(sessions, NOW)
    expect(out).toEqual({ sessions7: 4, minutes7: 16, completed7: 3, days7: 3 })
    expect(sanitizeModules({ yoga: out })).toEqual({ yoga: out })
    const sig = buildSignals([], sessions, NOW)
    expect(sig.modules.yoga).toEqual(out)
    const text = JSON.stringify(sig)
    for (const leak of ['sleepEase', 'before', 'after', 'hard', 'much', 'Derin', 'Uykuya', 'lesson']) expect(text).not.toContain(leak)
  })
})

describe('Nef sistem istemi ve öneri eşlemesi', () => {
  it('istemde yoga satırı ve "Yoga" eylemi; sağlık yorumu yasak; yalnız özet varken önerilir', () => {
    expect(SYSTEM_PROMPT).toContain('yoga = rehberli yoga dersleri (sessions7 ders, minutes7 dakika, completed7 tamamlanan ders, days7 pratik günü)')
    expect(SYSTEM_PROMPT).toContain('"Yılan oyunu", "Yoga".')
    expect(SYSTEM_PROMPT).toContain('yoganın uykuya, strese ya da sağlığa etkisinden söz etme')
    expect(SYSTEM_PROMPT).toContain('"Yoga"yı yalnızca "modules" içinde yoga varsa öner')
    // önceki kurallar yerinde
    expect(SYSTEM_PROMPT).toMatch(/UYDURMA/)
    expect(SYSTEM_PROMPT).toContain('"Haftalık test"i yalnızca weeklyDue true ise öner')
  })
  it('screenFor("Yoga") → yoga kütüphanesi; web\'de düğme yok, iPhone uygulamasında var', () => {
    expect(screenFor('Yoga')).toBe('yoga')
    expect(screenFor('Yoga · 5 dk ders')).toBe('yoga')
    expect(screenFor('yoga dersi')).toBe('yoga')
    expect(actionTarget('Yoga · 5 dk ders', [], NOW, true)).toBe('yoga')
    expect(actionTarget('Yoga · 5 dk ders', [], NOW, false)).toBeNull()
    expect(actionTarget('Yoga · 5 dk ders', [], NOW)).toBeNull() // test ortamı web (isIOSApp yanlış)
    expect(actionTarget('Nefes pratiği', [], NOW, false)).toBe('breath') // öteki eylemler değişmez
    expect(registry.forRoute('yoga')?.id).toBe('yoga')
  })
  it('süzgeç davranışı değişmedi', () => {
    expect(passesGuard('Bu hafta 3 gün yoga yaptın; düzenini sürdür.')).toBe(true)
    expect(passesGuard('Yoga uykunu iyileştirir.')).toBe(false)
    expect(parseCoachReply('{"insight":"Bu hafta 2 yoga dersini tamamladın.","action":"Yoga · 5 dk"}')).toEqual({ insight: 'Bu hafta 2 yoga dersini tamamladın.', action: 'Yoga · 5 dk' })
    expect(sanitizeSignals({ modules: { yoga: { sessions7: 2, minutes7: 8, completed7: 1, days7: 2, puan: 'x y' } } }).modules).toEqual({ yoga: { sessions7: 2, minutes7: 8, completed7: 1, days7: 2 } })
  })
})

// Risk (PLAN.v3 §D.5; modul.md §8): sanitizeModules en çok 10 modül geçirir (coachCore.js:44). Modüller klasör adının
// alfabe sırasıyla gezilir (registry.js import.meta.glob; coach.js moduleSignals registry.live sırası).
describe('özet süzgecinin 10 modül sınırı: yoga pakete giriyor mu', () => {
  const coachIds = registry.live.filter((m) => typeof m.coach === 'function').map((m) => m.id)
  it(`bugün coach() veren canlı modül ${coachIds.length}; en kötü durumda (hepsi etkin) yoga yine pakette`, () => {
    expect(coachIds).toContain('yoga')
    expect(coachIds.indexOf('yoga')).toBeLessThan(10)
    const all = Object.fromEntries(coachIds.map((id) => [id, { sessions7: 1 }]))
    expect(Object.keys(sanitizeModules(all))).toContain('yoga')
  })
  it('sınır aşılırsa yoga düşer (risk kanıtı: yoganın önünde 10 etkin modül)', () => {
    const before = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`a${i}`, { n: 1 }]))
    expect(sanitizeModules({ ...before, yoga: { sessions7: 1 } }).yoga).toBeUndefined()
  })
})
