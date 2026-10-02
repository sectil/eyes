// Denetim B: aynı depo durumundan Gelişim / 5. gün raporu / PDF+CSV / Nef paketi / Ana sayfa çıktılarını karşılaştırır.
// Depoya yazmaz. Koş: cd /home/user/eyes/app && npx vitest run <bu dosya> --root /home/user/eyes/app --dir <klasör>
import { it } from 'vitest'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { hub, growthMap, verifiedChange } from '/home/user/eyes/app/src/lib/dataHub.js'
import { domainSummary, firstReport } from '/home/user/eyes/app/src/lib/progress.js'
import { reportModel, reportHtml, csvRows } from '/home/user/eyes/app/src/lib/exportData.js'
import { buildSignals } from '/home/user/eyes/app/src/lib/coach.js'
import ProgressOverview, { DomainDetail, metricStatus, effectStatus } from '/home/user/eyes/app/src/components/ProgressOverview.jsx'
import HomeMap from '/home/user/eyes/app/src/components/HomeMap.jsx'
import FirstReport from '/home/user/eyes/app/src/screens/FirstReport.jsx'
import { makeYogaRecord } from '/home/user/eyes/app/src/lib/yogaRecord.js'

const DAY = 86400000
const NOW = new Date()
const ago = (d, h = 10) => { const x = new Date(NOW.getTime() - d * DAY); x.setHours(h, 0, 0, 0); return x.toISOString() }
const text = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&#x27;|&#39;/g, "'").replace(/\s+/g, ' ')

// ---- Durum A: 30. gün kullanıcısı ----
// Haftalık E testi 6 kez (44..9 gün önce); son test 9 gün önce → son 7 günde test yok (currentWindow 'last3')
const lm = { R: [0.10, 0.10, 0.10, 0.08, 0.10, 0.16], L: [0.2, 0.2, 0.2, 0.2, 0.2, 0.2], OU: [0.06, 0.06, 0.06, 0.06, 0.06, 0.06] }
const tests = [44, 37, 30, 23, 16, 9].flatMap((d, i) => ['R', 'L', 'OU'].map((eye) => ({ type: 'va-weekly', eye, logMAR: lm[eye][i], date: ago(d), correction: 'none', distanceTracked: true, meanDistanceMm: 400, algorithm: 'descent-zest-v4', trials: 28, seconds: 300 })))
const sessions = []
let id = 1
// Nefes: 8 seans, sakinlik 2→4 (belirgin iyileşme, Sakinlik)
for (let i = 0; i < 8; i++) sessions.push({ id: id++, type: 'breath', date: ago(27 - i * 3, 20), seconds: 300, calmBefore: 2, calmAfter: i % 2 ? 4 : 3, completed: true, pattern: 'box', cycles: 10 })
// Hızlı Bakış: 8 ölçüm, eşik düşüyor (düşük daha iyi → iyileşiyor, Dikkat)
;[120, 118, 121, 119, 90, 88, 92, 89].forEach((v, i) => sessions.push({ id: id++, type: 'quick-look', date: ago(26 - i * 3, 12), seconds: 60, threshold: v }))
// Yoga Ders 5 (odak, Dikkat, feel-only): 3 ders, odak 7→5 (belirgin düşüş)
for (let i = 0; i < 3; i++) {
  const r = makeYogaRecord({ lesson: 5, planned: 600, seconds: 600, reachedClosing: true, before: 7, after: 5 - (i % 2), endedAt: new Date(ago(10 - i * 3, 19)) })
  if (r) sessions.push({ id: id++, ...r })
}
// WHO-5: 40 → 60 (anlamlı artış)
sessions.push({ id: id++, type: 'who5', date: ago(28, 9), answers: [2, 2, 2, 2, 2], raw: 10, score: 40, seconds: 0 })
sessions.push({ id: id++, type: 'who5', date: ago(2, 9), answers: [3, 3, 3, 3, 3], raw: 15, score: 60, seconds: 0 })
const habits = [3, 2, 1].map((d) => ({ date: ago(d).slice(0, 10), type: 'mola', at: ago(d) }))

const pad = (s, n) => String(s ?? '').padEnd(n).slice(0, n)
const table = (title, rows) => {
  console.log(`\n### ${title}`)
  console.log('| ' + rows[0].join(' | ') + ' |')
  console.log('|' + rows[0].map(() => '---').join('|') + '|')
  for (const r of rows.slice(1)) console.log('| ' + r.map((c) => String(c ?? '')).join(' | ') + ' |')
}

it('Durum A: 30. gün, karşılaştırma', () => {
  console.log('yoga kayıtları:', sessions.filter((s) => s.type === 'yoga').length)
  const H = hub({ tests, sessions, habits, now: NOW })
  const G = growthMap({ tests, sessions, habits, now: NOW })
  const D = domainSummary({ tests, sessions, now: NOW })
  const FR = firstReport({ tests, sessions, start: ago(30, 0), now: NOW })
  const M = reportModel({ tests, sessions, now: NOW })
  const html = text(reportHtml(M))
  const csv = csvRows({ tests, sessions })
  const sig = buildSignals(tests, sessions, NOW, 3, null)
  const PO = text(renderToStaticMarkup(h(ProgressOverview, { tests, sessions, onOpen: () => {} })))
  const HM = text(renderToStaticMarkup(h(HomeMap, { tests, sessions, onStart: () => {} })))
  const FRt = text(renderToStaticMarkup(h(FirstReport, { tests, sessions, start: ago(30, 0), onClose: () => {}, onProgress: () => {} })))
  const DDfocus = text(renderToStaticMarkup(h(DomainDetail, { domain: 'focus', tests, sessions, onBack: () => {} })))
  const DDeye = text(renderToStaticMarkup(h(DomainDetail, { domain: 'eye', tests, sessions, onBack: () => {} })))

  // 1) Alan hükmü: yay (verifiedChange) vs kutucuk hapı (metricStatus/effectStatus)
  const rows = [['alan', 'yay (growthMap.status)', 'metrik hükümleri', 'etki hükümleri', 'who5.status', 'göz']]
  for (const d of Object.keys(G.domains)) {
    const s = H.domains[d]
    rows.push([d, G.domains[d].status, s.metrics.map((m) => `${m.key}:${m.status}→"${metricStatus(m).text}"`).join('; '), s.effects.map((e) => `${e.key}:sig=${e.sig},gain=${e.gain?.toFixed(2)}→"${effectStatus(e).text}"`).join('; '), s.who5?.status ?? '', s.eye ? `${s.eye.phase}/${s.eye.trend}/${s.eye.alert}` : ''])
  }
  table('Alan hükmü (merkez)', rows)

  // 2) Gelişim satırı (ProgressOverview) metni
  const lines = PO.match(/(Göz|Dikkat|Farkındalık|Sakinlik|Kendine yaklaşım|İyi oluş|Beden) [^|]{0,90}?(\d+\/28|gün kayıt)/g)
  console.log('\n### ProgressOverview metni (ilk 1500 karakter)\n', PO.slice(0, 1500))
  console.log('\n### HomeMap metni\n', HM)
  console.log('\n### DomainDetail(focus) metni (ilk 1200)\n', DDfocus.slice(0, 1200))
  console.log('\n### DomainDetail(eye) kutu\n', (DDeye.match(/\d,\d\d başlangıç.{0,80}/) ?? [''])[0])

  // 3) Göz: aynı değer dört yerde
  const E = D.eye.eye
  const pdfR = M.eyes.find((e) => e.eye === E.eye)
  table('Göz (öne çıkan seri)', [
    ['kaynak', 'göz', 'gösterilen "şimdi"', 'başlangıç', 'değişim', 'hüküm'],
    ['Gelişim satırı (tileOf)', E.eye, `current7 ?? last = ${E.current7 ?? E.last}`, '', '', ''],
    ['Gelişim göz ayrıntısı', E.eye, `current = ${E.current} (${E.currentWindow})`, E.baseline, E.delta, E.phase + '/' + E.trend],
    ['PDF eyeBlock', pdfR?.eye, `current = ${pdfR?.trend.current} (${pdfR?.trend.currentWindow})`, pdfR?.trend.baseline, pdfR?.trend.delta, pdfR?.trend.phase + '/' + pdfR?.trend.trend],
    ['5. gün raporu', FR.eye.eye, '(yalnız mesaj)', '', '', FR.eye.message],
    ['Nef paketi', '(pickSeries)', `vaCurrent7 = ${sig.vaCurrent7}`, sig.vaBaseline, sig.vaDelta, `${sig.vaPhase}/${sig.vaTrend}/${sig.vaAlert}`],
  ])
  console.log('PDF göz metni parçası:', (html.match(/Son 3 test \(ortanca\) [^ ]+/) ?? html.match(/Son 7 gün \(ortanca\) [^ ]+/) ?? [''])[0])
  console.log('Gelişim satırı Göz:', (PO.match(/Göz [^G]{0,60}logMAR[^·]*· [^ ]+ [^ ]+/) ?? [''])[0])

  // 4) Metrik / etki / WHO-5 metinleri: Gelişim vs 5. gün vs PDF vs Nef
  const tr = [['öğe', 'Gelişim (metricStatus/effectStatus)', '5. gün (FirstReport)', 'PDF (reportHtml)', 'Nef paketi', 'yay']]
  for (const m of M.metrics) {
    const inPdf = (html.match(new RegExp(`${m.label.replace(/[()]/g, '.')} [^|]{0,120}?(iyileşiyor|geriliyor|doğal oynama|henüz belirsiz|ilk ölçüm|belirgin artış|belirgin düşüş)`)) ?? [])[1]
    const inFr = (FRt.match(new RegExp(`${m.label.replace(/[()]/g, '.')}[^]{0,160}?(iyileşiyor|geriliyor|doğal oynama|henüz belirsiz|ilk ölçüm|belirgin artış|belirgin düşüş)`)) ?? [])[1]
    tr.push([`metrik ${m.key}`, metricStatus(m).text, inFr ?? '(yok)', inPdf ?? '(yok)', JSON.stringify(sig.modules?.[m.module] ?? null), G.domains[m.domain].status])
  }
  for (const e of M.effects) {
    const inPdf = (html.match(new RegExp(`${e.label} ${e.measure} \\(/${e.max}\\) \\d+ [^ ]+ → [^ ]+ ([^ ]+)[^|]{0,40}?(belirgin|belirsiz)`)) ?? [])
    tr.push([`etki ${e.key}`, effectStatus(e).text, (FRt.match(new RegExp(`${e.label} sonrası [^)]+\\) [^ ]+ [^ ]+`)) ?? ['(yok)'])[0], inPdf.length ? `${inPdf[1]} ${inPdf[2]}` : '(yok)', JSON.stringify(sig.modules?.[e.module] ?? null), G.domains[e.domain].status])
  }
  tr.push(['WHO-5', metricStatus(D.wellbeing.who5).text, (FRt.match(/İlk puanın \d+/) ?? ['(yok)'])[0], (html.match(/Son puan \d+[^;]*/) ?? ['(yok)'])[0], 'who5 alanı yok: ' + JSON.stringify(Object.keys(sig).filter((k) => /who|well/i.test(k))), G.domains.wellbeing.status])
  table('Hüküm metinleri', tr)

  // 5) Düzen sayıları
  const dz = [['kaynak', 'aktif gün', 'dakika', 'seri'], ['PDF practice', M.practice.activeDays, M.practice.minutes, M.practice.streakDays], ['5. gün practice', FR.practice.activeDays, FR.practice.minutes, FR.practice.streakDays], ['Nef', `daysActive7=${sig.daysActive7}`, `minutes7=${sig.minutes7}`, sig.streakDays]]
  dz.push(['Gelişim haritası (gün/28, alan başına)', Object.values(G.domains).map((x) => `${x.domain}:${x.days}`).join(' '), '', ''])
  table('Düzen', dz)

  // 6) CSV: alan başına satır sayısı ve alışkanlık / profil
  const byDom = {}
  for (const r of csv) byDom[r.domain] = (byDom[r.domain] ?? 0) + 1
  console.log('\nCSV alan başına satır:', JSON.stringify(byDom), '· mola satırı:', csv.filter((r) => /mola/i.test(r.module)).length, '· hub body.habits:', JSON.stringify(H.domains.body.habits))
  console.log('Nef paketi anahtarları:', Object.keys(sig).join(','))
  console.log('Nef modules:', JSON.stringify(sig.modules))
})

// ---- Durum B: küçük azalış işareti (−0,0) ----
it('Durum B: signed yuvarlama', () => {
  const s = []
  for (let i = 0; i < 49; i++) s.push({ id: i, type: 'breath', date: ago(20 - (i % 20), 8 + (i % 10)), seconds: 120, calmBefore: 3, calmAfter: 3 })
  s.push({ id: 99, type: 'breath', date: ago(1), seconds: 120, calmBefore: 3, calmAfter: 2 })
  const PO = text(renderToStaticMarkup(h(ProgressOverview, { tests: [], sessions: s, onOpen: () => {} })))
  const FRt = text(renderToStaticMarkup(h(FirstReport, { tests: [], sessions: s, start: ago(21, 0), onClose: () => {}, onProgress: () => {} })))
  const html = text(reportHtml(reportModel({ tests: [], sessions: s, now: NOW })))
  const DD = text(renderToStaticMarkup(h(DomainDetail, { domain: 'calm', tests: [], sessions: s, onBack: () => {} })))
  console.log('\n### Durum B (ortalama sonra−önce = −0,02)')
  console.log('Gelişim satırı Sakinlik:', (PO.match(/Sakinlik [^|]{0,80}?sonrası/) ?? ['?'])[0])
  console.log('5. gün:', (FRt.match(/Nefes sonrası[^)]*\)/) ?? ['?'])[0])
  console.log('PDF:', (html.match(/Nefes sakinlik[^|]{0,80}?(belirgin|belirsiz)/) ?? ['?'])[0])
  console.log('Ayrıntı:', (DD.match(/\d+ oturum · ortalama [^.]*\./) ?? ['?'])[0])
})

// ---- Durum C: 1. gün (yalnız kurulum, hiç kayıt yok) ve 9. gün ----
it('Durum C: boş / 1. gün / 9. gün', () => {
  const PO0 = text(renderToStaticMarkup(h(ProgressOverview, { tests: [], sessions: [], onOpen: () => {} })))
  const HM0 = text(renderToStaticMarkup(h(HomeMap, { tests: [], sessions: [], onStart: () => {} })))
  console.log('\n### 1. gün, kayıt yok · Gelişim:\n', PO0.slice(0, 700), '\n· Ana sayfa haritası:', JSON.stringify(HM0))
  const t1 = ['R', 'L', 'OU'].map((eye) => ({ type: 'va-weekly', eye, logMAR: 0.1, date: ago(0, 9), correction: 'none', algorithm: 'descent-zest-v4', seconds: 300 }))
  const PO1 = text(renderToStaticMarkup(h(ProgressOverview, { tests: t1, sessions: [], onOpen: () => {} })))
  console.log('\n### 1. gün, ilk haftalık test · Gelişim:\n', PO1.slice(0, 900))
  const t9 = [...t1.map((t) => ({ ...t, date: ago(8, 9) })), ...['R', 'L', 'OU'].map((eye) => ({ type: 'va-weekly', eye, logMAR: 0.12, date: ago(1, 9), correction: 'none', algorithm: 'descent-zest-v4', seconds: 300 }))]
  const s9 = [0, 2, 4, 6].map((d, i) => ({ id: i, type: 'breath', date: ago(d, 20), seconds: 300, calmBefore: 2, calmAfter: 4 }))
  const PO9 = text(renderToStaticMarkup(h(ProgressOverview, { tests: t9, sessions: s9, onOpen: () => {}, reportDay: 9, onReport: () => {} })))
  console.log('\n### 9. gün · Gelişim:\n', PO9.slice(0, 1100))
  const sig9 = buildSignals(t9, s9, NOW, 3, null)
  console.log('9. gün Nef:', JSON.stringify(sig9))
})

// ---- Durum D: düşük daha iyi etki (yoga Ders 1 gerginlik 7→3) ----
it('Durum D: better=down etki metni', () => {
  const s = []
  for (let i = 0; i < 3; i++) { const r = makeYogaRecord({ lesson: 1, planned: 600, seconds: 600, reachedClosing: true, before: 7, after: 3 + (i % 2), endedAt: new Date(ago(6 - i * 2, 19)) }); if (r) s.push({ id: i, ...r }) }
  const DD = text(renderToStaticMarkup(h(DomainDetail, { domain: 'calm', tests: [], sessions: s, onBack: () => {} })))
  const PO = text(renderToStaticMarkup(h(ProgressOverview, { tests: [], sessions: s, onOpen: () => {} })))
  const FRt = text(renderToStaticMarkup(h(FirstReport, { tests: [], sessions: s, start: ago(7, 0), onClose: () => {}, onProgress: () => {} })))
  const html = text(reportHtml(reportModel({ tests: [], sessions: s, now: NOW })))
  const G = growthMap({ tests: [], sessions: s, now: NOW })
  console.log('\n### Durum D (yoga Ders 1, gerginlik 7→3,3; düşük daha iyi) kayıt:', s.length)
  console.log('Ayrıntı:', (DD.match(/\d+ oturum · ortalama [^.]*\./) ?? ['?'])[0], '| hap:', (DD.match(/gerginlik \(düşük daha iyi\) [^ ]+ [^ ]+/) ?? ['?'])[0])
  console.log('Gelişim satırı:', (PO.match(/Sakinlik [^|]{0,80}?sonrası [^ ]+ [^ ]+/) ?? ['?'])[0])
  console.log('5. gün:', (FRt.match(/Yoga[^)]*\) [^ ]+ [^ ]+/) ?? ['?'])[0])
  console.log('PDF:', (html.match(/Yoga · [^|]{0,90}?(belirgin|belirsiz)/) ?? ['?'])[0])
  console.log('yay calm:', G.domains.calm.status)
})
