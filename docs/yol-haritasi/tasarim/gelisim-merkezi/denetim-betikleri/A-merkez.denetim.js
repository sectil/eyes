import { it } from 'vitest'
import { metricTrend, acuteEffects, domainSummary, metricCards } from '/home/user/eyes/app/src/lib/progress.js'
import { hub, growthMap, domainOfSession } from '/home/user/eyes/app/src/lib/dataHub.js'
import { alarmHabits } from '/home/user/eyes/app/src/lib/alarmLog.js'
import { activitiesFrom, countedActivities, summary } from '/home/user/eyes/app/src/lib/stats.js'
import { irisCells } from '/home/user/eyes/app/src/lib/iris.js'

const NOW = new Date('2026-09-30T18:00:00')
const DAY = 86400000
const at = (daysAgo, h = 10, m = 0) => {
  const d = new Date(NOW.getTime() - daysAgo * DAY)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}
const log = (k, v) => console.log(`### ${k}: ${JSON.stringify(v)}`)

it('S1 metricTrend bütün geçmiş: 60 eski iyi ölçüm + son 10 günde düşüş', () => {
  // quick-look eşiği (ms, better down). 60 gün boyunca ~200 ms, son 6 ölçüm 260 ms (kötüleşme)
  const pts = []
  for (let i = 0; i < 60; i++) pts.push({ date: at(70 - i), value: 200 + (i % 3) * 5 })
  for (let i = 0; i < 6; i++) pts.push({ date: at(6 - i), value: 260 })
  const r = metricTrend(pts, { better: 'down' })
  log('S1 bütün geçmiş (66 ölçüm)', { n: r.n, method: r.method, first: r.first, last: r.last, status: r.status })
  const only = metricTrend(pts.slice(-12), { better: 'down' })
  log('S1 yalnız son 12 ölçüm', { n: only.n, status: only.status, first: only.first, last: only.last })
})

it('S2 aynı gün turları: bir günde 5 tur + sonraki günler', () => {
  // 1. gün 5 tur (öğrenme: 60,62,64,66,68), sonra 1 gün 1 tur 70
  const pts = [60, 62, 64, 66, 68].map((v, i) => ({ date: at(1, 10, i * 5), value: v }))
  pts.push({ date: at(0, 10), value: 70 })
  const r = metricTrend(pts, { better: 'up' })
  log('S2 6 ölçüm, 2 gün', { n: r.n, method: r.method, first: r.first, last: r.last, delta: r.delta, lo: r.lo, status: r.status })
  const cards = metricCards({ sessions: pts.map((p) => ({ type: 'span', date: p.date, span: p.value / 10 })) })
  log('S2 tek-bakis metricCards', cards.map((c) => ({ key: c.key, n: c.n, status: c.status })))
})

it('S3 öğrenme etkisi: yalnız alışma eğrisi, gerçek değişim yok', () => {
  // ilk 3 gün öğrenme (düşük), sonra düz; hepsi farklı gün
  const vals = [3, 4, 5, 6, 6, 6, 6, 6, 6, 6]
  const pts = vals.map((v, i) => ({ date: at(20 - i * 2), value: v }))
  const r = metricTrend(pts, { better: 'up' })
  log('S3', { n: r.n, method: r.method, status: r.status, first: r.first, last: r.last })
})

it('S4 days7 kayıt sayıyor: bugün 5 Nefes + 1 haftalık E testi (3 göz kaydı)', () => {
  const sessions = [0, 1, 2, 3, 4].map((i) => ({ type: 'breath', date: at(0, 9, i * 10), seconds: 60 }))
  const tests = ['R', 'L', 'OU'].map((eye, i) => ({ type: 'va-weekly', eye, logMAR: 0.1, date: at(0, 11, i) }))
  const h = hub({ tests, sessions, now: NOW })
  log('S4 calm.records', h.domains.calm.records)
  log('S4 eye.records', h.domains.eye.records)
  const g = growthMap({ tests, sessions, now: NOW })
  log('S4 growthMap calm.days / eye.days', { calm: g.domains.calm.days, eye: g.domains.eye.days, eyeSources: g.domains.eye.sources })
})

it('S5 önce→sonra bütün geçmiş: 20 eski iyi oturum + son 2 haftada etkisiz', () => {
  const sessions = []
  for (let i = 0; i < 20; i++) sessions.push({ type: 'breath', date: at(120 - i * 3), calmBefore: 2, calmAfter: 4, seconds: 120 })
  for (let i = 0; i < 6; i++) sessions.push({ type: 'breath', date: at(12 - i * 2), calmBefore: 3, calmAfter: 3, seconds: 120 })
  const all = acuteEffects(sessions).filter((e) => e.key === 'breath-calm')
  log('S5 acuteEffects (since yok)', all.map((e) => ({ n: e.n, gain: e.gain, sig: e.sig })))
  const recent = acuteEffects(sessions, { since: at(28) }).filter((e) => e.key === 'breath-calm')
  log('S5 son 28 gün', recent.map((e) => ({ n: e.n, gain: e.gain, sig: e.sig })))
  const ds = domainSummary({ sessions, now: NOW })
  log('S5 domainSummary calm.effects', ds.calm.effects.map((e) => ({ key: e.key, n: e.n, sig: e.sig })))
})

it('S6 okuma testi yaya girmiyor: yalnız okuma testleri, rahat boyu kötüleşiyor', () => {
  const tests = []
  for (let i = 0; i < 8; i++) tests.push({ type: 'reading', protocol: 2, date: at(60 - i * 7), maxReadingSpeed: 180, criticalPrintSize: 0.2 + i * 0.1 })
  const h = hub({ tests, now: NOW })
  log('S6 eye', { metrics: h.domains.eye.metrics.map((m) => m.key), eyeCard: h.domains.eye.eye?.eye ?? null, records: h.domains.eye.records.total })
  const g = growthMap({ tests, now: NOW })
  log('S6 eye status (yay)', g.domains.eye.status)
})

it('S7 mola/su/alarm alışkanlıkları ve Apple Sağlık adımı', () => {
  const habits = [
    { date: '2026-09-30', type: 'mola', at: at(0, 10) },
    { date: '2026-09-30', type: 'mola', at: at(0, 11) },
    { date: '2026-09-30', type: 'water', at: at(0, 12) },
    ...alarmHabits([
      { type: 'wake', date: '2026-09-29', at: at(1, 7) },
      { type: 'morning', date: '2026-09-29', at: at(1, 7, 5) },
      { type: 'set', date: '2026-09-28', at: at(2, 22) },
    ]),
  ]
  const h = hub({ habits, now: NOW })
  log('S7 body.habits', h.domains.body.habits)
  log('S7 wellbeing.habits', h.domains.wellbeing.habits)
  const g = growthMap({ habits, now: NOW })
  log('S7 body sources', g.domains.body.sources)
  // hub'ın health parametresi yok: adımlar merkeze hiç girmez
  const h2 = hub({ habits: [], now: NOW, health: { hasData: true, rows: [{ date: '2026-09-30', steps: 9000 }] } })
  log('S7 yalnız adım verisiyle body.hasData', h2.domains.body.hasData)
})

it('S8 oyun ve WHO-5: alan sayımı ile düzen (practiceCard) farkı', () => {
  const sessions = [
    { type: 'game', game: 'snake', date: at(0, 9), score: 10, seconds: 60 },
    { type: 'who5', date: at(0, 9, 30), answers: [3, 3, 3, 3, 3], raw: 15, score: 60, seconds: 0 },
    { type: 'notice', date: at(0, 10), count: 3, seconds: 0 },
  ]
  const h = hub({ sessions, now: NOW })
  log('S8 alan kayıtları', { focus: h.domains.focus.records.total, wellbeing: h.domains.wellbeing.records.total, awareness: h.domains.awareness.records.total })
  log('S8 summary (seri/düzen)', summary(countedActivities(activitiesFrom([], sessions)), NOW).total)
})

it('S9 yoga domainOf ve etkiler', () => {
  const sessions = [1, 2, 3, 5].map((lesson, i) => ({ type: 'yoga', lesson, date: at(i, 20), before: 4, after: 7, seconds: 600, sleepEase: lesson === 3 ? 4 : undefined }))
  log('S9 domainOfSession', sessions.map((s) => [s.lesson, domainOfSession(s)]))
  const ds = domainSummary({ sessions, now: NOW })
  log('S9 effects by domain', Object.fromEntries(Object.entries(ds).map(([d, v]) => [d, v.effects.map((e) => e.key).concat(v.metrics.map((m) => 'M:' + m.key))])))
})

it('S10 iris hücreleri: baseline yoksa, profil cevapları merkezde görünmüyor', () => {
  const profile = { stressNow: 3, sleep: 2, activityDays: 4, selfCompassion: 3, firstLook: { blinks: 7 } }
  const h = hub({ profile, now: NOW })
  log('S10 baseline yokken answers', Object.fromEntries(Object.entries(h.domains).map(([d, v]) => [d, v.answers.length])))
  const cells = irisCells({ date: at(0), blinks: 7, stressNow: 3, sleep: 2, activityDays: 4, selfCompassion: 3 }, { sessions: [{ type: 'game', game: 'snake', date: at(0) }], domainOf: domainOfSession })
  log('S10 irisCells (yalnız Yılan oyunu)', cells.map((c) => [c.domain, c.filled]))
})

it('S1b bütün geçmiş: önce iyileşme, son 2 haftada geri dönüş -> "better" kalıyor', () => {
  const pts = []
  for (let i = 0; i < 30; i++) pts.push({ date: at(100 - i), value: 260 })
  for (let i = 0; i < 30; i++) pts.push({ date: at(70 - i * 2 + 60 - 60), value: 200 })
  for (let i = 0; i < 6; i++) pts.push({ date: at(12 - i * 2), value: 260 })
  const r = metricTrend(pts, { better: 'down' })
  log('S1b quick-look eşiği, son 6 ölçüm 200->260', { n: r.n, method: r.method, first: r.first, last: r.last, status: r.status })
})

it('S3b öğrenme: 6 ölçüm, ilk 3 alışma, sonra düz', () => {
  const pts = [3, 4, 5, 6, 6, 6].map((v, i) => ({ date: at(12 - i * 2), value: v }))
  const r = metricTrend(pts, { better: 'up' })
  log('S3b', { n: r.n, method: r.method, status: r.status, first: r.first, last: r.last })
})
