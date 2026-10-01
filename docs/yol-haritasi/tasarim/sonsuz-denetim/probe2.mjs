const { breathOfDay, inEnvelope } = await import('/home/user/eyes/app/src/lib/breathMix.js')
const key = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
// 1) Benzetim: 400 gün, her tier, holdOk true; kural ihlali say
for (const tier of ['B','C','D']) {
  const hist = []; const viol = { env:0, same:0, fam:0, holdConsec:0, hold7:0, pause7:0 }
  for (let k = 0; k < 400; k++) {
    const d = new Date(2027, 0, 1 + k, 12); const day = key(d)
    const r = breathOfDay({ variant: { tier } }, { seedDay: day, history: hist, safety: { holdOk: true } })
    if (!inEnvelope(r, tier)) viol.env++
    const y = hist.at(-1)
    if (y && `${y.inhale}|${y.hold}|${y.exhale}|${y.pause}` === r.key) viol.same++
    const w = [...hist.slice(-6), { ...r, day }]
    if (w.filter(x => x.family === r.family).length > 3) viol.fam++
    const hy = (x) => x.hold > 0 || x.pause > 0
    if (y && hy(y) && hy(r)) viol.holdConsec++
    if (w.filter(hy).length > 2) viol.hold7++
    if (w.filter(x => x.pause > 0).length > 1) viol.pause7++
    hist.push({ day, family: r.family, inhale: r.inhale, hold: r.hold, exhale: r.exhale, pause: r.pause })
  }
  console.log('tier', tier, JSON.stringify(viol))
}
// 2) Tutmalı gün sayımı: 3 gün önce AYNI günde iki tutmalı kayıt -> bu hafta başka tutmalı gün gelir mi?
function holdDays(n) {
  let got = 0
  for (let k = 0; k < 300; k++) {
    const d = new Date(2027, 0, 1 + k, 12); const p = new Date(d); p.setDate(p.getDate() - 3)
    const h = Array.from({ length: n }, () => ({ day: key(p), family: 'belly', inhale: 4, hold: 1, exhale: 6, pause: 0 }))
    const r = breathOfDay({ variant: { tier: 'C' } }, { seedDay: key(d), history: h, safety: { holdOk: true } })
    if (r.hold > 0 || r.pause > 0) got++
  }
  return `${got}/300`
}
console.log('tutmalı gün, 3 gün önce 1 tutmalı kayıt       :', holdDays(1))
console.log('tutmalı gün, 3 gün önce aynı günde 2 tutmalı kayıt:', holdDays(2))
