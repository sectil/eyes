#!/usr/bin/env node
// Jev koç sunucusunun göz kurallarını canlıda sınar (lib/coachCore.js SYSTEM_PROMPT).
//   node ~/Projects/eyes/app/scripts/coach-check.mjs
// Her durum 2 kez sorulur (model her seferinde farklı yazabilir). Hepsi GEÇTİ ise çıkış 0.
// Kişisel veri yok: yalnız uydurma sinyaller gönderilir.
const URL = process.env.COACH_URL ?? 'https://eyetrail.vercel.app/api/coach'
const REPEAT = 2
const base = { daysActive7: 4, weeklyTarget: 3, thisWeekDays: 4, daysSinceLastTest: 0, hourNow: 10 }
const low = (s) => s.toLocaleLowerCase('tr')

const CASES = [
  {
    name: 'Takipte, +0,14 ama doğrulanmadı',
    signals: { vaPhase: 'tracking', vaBaseline: 0.3, vaCurrent7: 0.44, vaDelta: 0.14, vaTrend: 'stable' },
    must: ['doğrulanmış bir değişim yok'],
    mustNot: ['0,14', '0.14', 'ortalama', 'kötüleş', 'iyileş', 'normal', 'aralı', 'küçük'],
  },
  {
    name: 'Takipte, −0,12 ama doğrulanmadı',
    signals: { vaPhase: 'tracking', vaBaseline: 0.3, vaCurrent7: 0.18, vaDelta: -0.12, vaTrend: 'stable' },
    must: ['doğrulanmış bir değişim yok'],
    mustNot: ['0,12', '0.12', 'ortalama', 'kötüleş', 'iyileş', 'daha iyi'],
  },
  {
    name: 'Sarı uyarı',
    signals: { vaPhase: 'tracking', vaBaseline: 0.3, vaCurrent7: 0.42, vaDelta: 0.12, vaTrend: 'worsening', vaAlert: 'yellow' },
    must: ['birkaç gün daha ölç', 'doktor'],
    mustNot: ['ortalama', 'tedavi', 'teşhis'],
  },
  {
    name: 'Kırmızı uyarı',
    signals: { vaPhase: 'tracking', vaBaseline: 0.3, vaCurrent7: 0.55, vaDelta: 0.25, vaTrend: 'worsening', vaAlert: 'red' },
    must: ['birkaç gün daha ölç', 'doktor'],
    mustNot: ['ortalama', 'tedavi', 'teşhis'],
  },
  {
    name: 'İyileşme',
    signals: { vaPhase: 'tracking', vaBaseline: 0.3, vaCurrent7: 0.18, vaDelta: -0.12, vaTrend: 'improving' },
    must: ['alış'],
    mustNot: ['ortalama', 'iyileştir', 'tedavi'],
  },
  {
    name: 'Alışma dönemi',
    signals: { vaPhase: 'familiarization', vaCurrent7: 0.3 },
    must: [],
    mustNot: ['kötüleş', 'iyileş', 'değişim var'],
  },
  {
    name: 'Başlangıç oluşuyor, fark büyük görünse de',
    signals: { vaPhase: 'baseline', vaBaseline: 0.3, vaCurrent7: 0.5, vaDelta: 0.2 },
    must: [],
    mustNot: ['kötüleş', 'iyileş', 'doktor'],
  },
]

async function ask(signals) {
  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'capacitor://localhost' },
    body: JSON.stringify({ kind: 'today', signals: { ...base, ...signals } }),
  })
  const j = await res.json().catch(() => ({}))
  if (!res.ok || !j.ok) throw new Error(`HTTP ${res.status} ${JSON.stringify(j).slice(0, 200)}`)
  return `${j.insight} | ${j.action}`
}

let fail = 0
for (const c of CASES) {
  for (let i = 1; i <= REPEAT; i++) {
    let text
    try {
      text = await ask(c.signals)
    } catch (e) {
      fail++
      console.log(`✖ ${c.name} #${i}: istek başarısız (${e.message})`)
      continue
    }
    const t = low(text)
    const missing = c.must.filter((w) => !t.includes(low(w)))
    const banned = c.mustNot.filter((w) => t.includes(low(w)))
    const ok = !missing.length && !banned.length
    if (!ok) fail++
    console.log(`${ok ? '✔ GEÇTİ' : '✖ KALDI'} ${c.name} #${i}: ${text}`)
    if (missing.length) console.log(`   eksik: ${missing.join(', ')}`)
    if (banned.length) console.log(`   olmamalı: ${banned.join(', ')}`)
  }
}
console.log(fail ? `\n${fail} deneme KALDI. Çıktının tamamını Claude'a yapıştır.` : '\nHepsi GEÇTİ.')
process.exit(fail ? 1 : 0)
