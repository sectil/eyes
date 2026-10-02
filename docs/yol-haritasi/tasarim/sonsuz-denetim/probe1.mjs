const L = '/home/user/eyes/app/src/lib/'
const { breathOfDay, mixHistory, breathSafety, combos, selectable, inEnvelope } = await import(L + 'breathMix.js')
const { restDecision, stageOf, progressionCtx } = await import(L + 'progression.js')
const { LADDERS, groupSeconds, mergePatches, GROUP_CAP_SEC } = await import(L + 'ladders.js')
const { EXERCISES } = await import(L + 'routines.js')

// 1) mixHistory: aynı günde birden çok kayıt ayrı "gün" sayılıyor mu?
const now = new Date(2026, 9, 20, 10)
const ses = (day, mix, extra = {}) => ({ type: 'breath', seconds: 30, date: new Date(`${day}T09:00:00`).toISOString(), mix, ...extra })
const belly = { family: 'belly', inhale: 4, hold: 0, exhale: 6.5, pause: 0 }
const oneDay3 = [ses('2026-10-15', belly), ses('2026-10-15', belly), ses('2026-10-15', belly)]
const oneDay1 = [ses('2026-10-15', belly)]
const stage = { variant: { tier: 'B' } }
const count = (hist) => {
  let n = 0
  for (let i = 0; i < 400; i++) {
    const d = new Date(2026, 9, 20); d.setDate(d.getDate() + 0)
    const r = breathOfDay(stage, { seedDay: '2026-10-20', history: hist.map(h => h), safety: {} })
    void r
  }
}
// seedDay'i değiştirerek (history günleri seedDay'e göre kaydırarak) belly seçim sayısı
function bellyPicks(nPerDay) {
  let picks = 0, total = 0
  for (let k = 0; k < 300; k++) {
    const base = new Date(2027, 0, 1 + k, 12)
    const key = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    const prev = new Date(base); prev.setDate(prev.getDate() - 3)
    const hist = Array.from({ length: nPerDay }, () => ({ day: key(prev), family: 'belly', inhale: 4, hold: 0, exhale: 6.5, pause: 0 }))
    const r = breathOfDay(stage, { seedDay: key(base), history: hist, safety: {} })
    total++; if (r.family === 'belly') picks++
  }
  return `${picks}/${total}`
}
console.log('mixHistory 3 kayıt aynı gün ->', mixHistory(oneDay3, now).length, 'girdi')
console.log('belly seçimi, 3 gün önce 1 kayıt :', bellyPicks(1))
console.log('belly seçimi, 3 gün önce aynı günde 3 kayıt:', bellyPicks(3))

// 2) restDecision: bugünkü kural ile Y1 kolu, göz çalışması 0 iken
const plan = { stops: [{ restSlot: true, minutes: 1 }], blocks: [{ eyeMin: 1, capMin: 3 }, { eyeMin: 6, eyeDone: 0 }] }
const st = { locked: false, due: null, used: 0, budgetMs: 5 * 60000 }
console.log('restDecision bugünkü kural (progression yok):', restDecision(st, plan, null))
console.log('restDecision Y1 kolu (progression var)    :', restDecision(st, plan, { pathDay: 0 }))

// 3) grup süre tavanı (75 sn) çeşitleme yamalarıyla
const R = LADDERS.routine
for (let vi = -1; vi < R.variants.length; vi++) {
  const patch = mergePatches(R.variants, vi)
  const over = []
  for (const s of R.steps) for (const g of s.groups) { const sec = groupSeconds(g, EXERCISES, patch); if (sec > GROUP_CAP_SEC) over.push(`${s.id}/${g.key}=${sec}`) }
  console.log('çeşitleme', vi < 0 ? '-' : R.variants[vi].id, 'tavanı aşan:', over.join(', ') || 'yok')
}
console.log('combos B/C/D', combos('B').length, combos('C').length, combos('D').length, 'selectable D', selectable('D').length)
