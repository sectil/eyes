// Denetim betiklerinden testler (gelisim-merkezi DENETIM.md; denetim-betikleri/A-merkez ve B-tutarlilik; PLAN §8.4
// "her bulgu bir test olur"). Bu dosya G1 adım 2'de (çekirdek: ölçü kuralı v2, dataHub, growthCenter) kapanan bulguları
// sınar; her test denetimdeki betik durumunun aynısıdır, beklenti düzeltilmiş davranıştır. Ekrana ait yarıları (satır
// hapı, Ana sayfa, 5. gün raporu, PDF metni) G2'de ve dışa aktarım adımında eklenir.
import { describe, it, expect } from 'vitest'
import { metricTrend, metricStatusV2, metricCards, acuteEffects } from './progress.js'
import { hub, growthMap, changeDetail } from './dataHub.js'
import { growthCenter } from './growthCenter.js'
import { alarmHabits } from './alarmLog.js'
import { makeYogaRecord } from './yogaRecord.js'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { answersOf } from './growthCenter.js'
import { activitiesFrom, countedActivities, summary } from './stats.js'
import { reportModel, reportHtml } from './exportData.js'
import * as exportMod from './exportData.js'
import * as hubMod from './dataHub.js'
import { changeText } from './changeText.js'
import { analyzeTrend, trendMessage, droppedNotes, comparableTests, CAM_FAILED_SWITCH } from './trend.js'
import { pickSeries } from './vaSeries.js'
import { resetAllData, DATA_RESET_KEYS } from './notifyReset.js'
import { GAZE_MODEL_KEY } from './gazeCalib.js'

const NOW = new Date('2026-09-30T18:00:00')
const DAY = 86400000
const at = (daysAgo, h = 10, m = 0) => {
  const d = new Date(NOW.getTime() - daysAgo * DAY)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

describe('denetim A: merkez', () => {
  it('K3 (A-S1b): eski iyileşme yeni gerilemeyi örtmez', () => {
    // Hızlı Bakış eşiği (ms, düşük iyi): 30 ölçüm 260 → 30 ölçüm 200 → son 6 ölçüm yine 260
    const pts = []
    for (let i = 0; i < 30; i++) pts.push({ date: at(100 - i), value: 260 })
    for (let i = 0; i < 30; i++) pts.push({ date: at(70 - i * 2 + 60 - 60), value: 200 })
    for (let i = 0; i < 6; i++) pts.push({ date: at(12 - i * 2), value: 260 })
    expect(metricTrend(pts, { better: 'down' }).status).toBe('better') // eski kural (yerinde kalır)
    expect(metricStatusV2(pts, { better: 'down', now: NOW, familiar: 2, sdFloor: 10 }).verdict).not.toBe('better')
  })

  it('K4 (A-S2): aynı günün turları tek değer; iki günlük kullanıcıya "iyileşiyor" yok', () => {
    const pts = [60, 62, 64, 66, 68].map((v, i) => ({ date: at(1, 10, i * 5), value: v }))
    pts.push({ date: at(0, 10), value: 70 })
    const cards = metricCards({ sessions: pts.map((p) => ({ type: 'span', date: p.date, span: p.value / 10 })), now: NOW })
    const c = cards.find((x) => x.key === 'tek-bakis-span')
    expect(c.status).toBe('better') // eski kural
    expect(c.verdict).toBe('start')
    expect(c.v2.measureDays).toBe(2)
    expect(growthCenter({ sessions: pts.map((p) => ({ type: 'span', date: p.date, span: p.value / 10 })), now: NOW }).areas.dikkat.verdict).toBe('start')
  })

  it('A-S3: öğrenme eğrisi (ilk günler düşük, sonra düz) "iyileşme" sayılmaz', () => {
    const vals = [3, 4, 5, 6, 6, 6, 6, 6, 6, 6]
    const pts = vals.map((v, i) => ({ date: at(20 - i * 2), value: v }))
    expect(metricStatusV2(pts, { now: NOW, familiar: 2, sdFloor: 0.5 }).verdict).not.toBe('better')
  })

  it('Kü-1, Ö-5 (A-S4): kayıt sayıları gün sayar; bir görme testi tek kayıt', () => {
    const sessions = [0, 1, 2, 3, 4].map((i) => ({ type: 'breath', date: at(0, 9, i * 10), seconds: 60 }))
    const tests = ['R', 'L', 'OU'].map((eye, i) => ({ type: 'va-weekly', eye, logMAR: 0.1, date: at(0, 11, i) }))
    const h = hub({ tests, sessions, now: NOW })
    expect(h.domains.calm.records).toEqual({ total: 1, days7: 1, days28: 1 })
    expect(h.domains.eye.records).toEqual({ total: 1, days7: 1, days28: 1 })
    const g = growthMap({ tests, sessions, now: NOW, sourceDays: true })
    expect(g.domains.eye.sources).toEqual([{ key: 'test:va-weekly', label: 'Haftalık görme testi', n: 1, days: 1 }])
    expect(g.domains.calm.sources[0]).toMatchObject({ n: 5, days: 1 })
  })

  it('Ö-3 (A-S5): önce → sonra etkileri son 28 günden', () => {
    const sessions = []
    for (let i = 0; i < 20; i++) sessions.push({ type: 'breath', date: at(120 - i * 3), calmBefore: 2, calmAfter: 4, seconds: 120 })
    for (let i = 0; i < 6; i++) sessions.push({ type: 'breath', date: at(12 - i * 2), calmBefore: 3, calmAfter: 3, seconds: 120 })
    expect(acuteEffects(sessions).find((e) => e.key === 'breath-calm')).toMatchObject({ n: 26, sig: true }) // bütün geçmiş
    const calm = hub({ sessions, now: NOW }).domains.calm
    expect(calm.effects.find((e) => e.key === 'breath-calm')).toMatchObject({ n: 6, sig: false })
    expect(changeDetail(calm).status).toBeNull()
    expect(calm.hasData).toBe(true)
    // son 28 günün 6 oturumunda güven aralığı sıfırı içeriyor: ne değişim ne "değişim yok" denir (henüz belli değil)
    expect(growthCenter({ sessions, now: NOW }).areas.nefes.verdict).toBe('unclear')
  })

  it('Ö-9 (A-S7): mola/su/alarm alışkanlıkları ve Apple Sağlık adımı merkeze girer', () => {
    const habits = [
      { date: '2026-09-30', type: 'mola', at: at(0, 10) },
      { date: '2026-09-30', type: 'water', at: at(0, 12) },
      ...alarmHabits([{ type: 'wake', date: '2026-09-29', at: at(1, 7) }, { type: 'set', date: '2026-09-28', at: at(2, 22) }]),
    ]
    expect(hub({ habits, now: NOW }).domains.body.habits).toEqual({ total: 2, days7: 1 })
    // yalnız adım verisi (7+ adımlı gün): Beden şeridi dolar; "veri var" ve ilk gün değişmez (eşdeğerlik çekirdeği)
    const stepRows = Array.from({ length: 10 }, (_, i) => ({ date: new Date(NOW.getTime() - (9 - i) * DAY).toLocaleDateString('sv-SE'), steps: 9000 }))
    const health = { hasData: true, stepRows }
    const g = growthMap({ habits: [], health, now: NOW })
    expect(g.domains.body.days).toBe(10)
    expect(g.domains.body.summary.hasData).toBe(false)
    expect(g.sinceStart).toBe(0)
  })

  it('Ö-1 (A-S9, B-D): yoga ("nasıl hissettin") hükme girmez', () => {
    const s = []
    for (let i = 0; i < 3; i++) {
      const r = makeYogaRecord({ lesson: 1, planned: 600, seconds: 600, reachedClosing: true, before: 7, after: 3 + (i % 2), endedAt: new Date(at(6 - i * 2, 19)) })
      if (r) s.push({ id: i, ...r })
    }
    expect(s.length).toBe(3)
    const g = growthMap({ sessions: s, now: NOW })
    expect(g.domains.calm.summary.effects.some((e) => e.module === 'yoga' && e.sig)).toBe(true)
    expect(g.domains.calm.status).toBeNull() // eskiden 'up' ("İyileşiyor: Sakinlik")
  })
})

describe('denetim B: tek hüküm', () => {
  it('K1 (B-A): Dikkat alanında iyileşen ölçü + yoga Ders 5 düşüşü → yoga hükme girmez, tek hüküm', () => {
    const sessions = []
    // Hızlı Bakış: 8 gün 120 ms civarı (alışma 2 + başlangıç 6), sonra 90 ms (düşük daha iyi)
    for (let d = 30; d >= 23; d--) sessions.push({ type: 'quick-look', date: at(d, 12), threshold: d % 2 ? 120 : 118 })
    for (let d = 22; d >= 1; d--) sessions.push({ type: 'quick-look', date: at(d, 12), threshold: 90 })
    for (let i = 0; i < 3; i++) {
      const r = makeYogaRecord({ lesson: 5, planned: 600, seconds: 600, reachedClosing: true, before: 7, after: 5 - (i % 2), endedAt: new Date(at(10 - i * 3, 19)) })
      if (r) sessions.push({ id: `y${i}`, ...r })
    }
    const g = growthMap({ sessions, now: NOW })
    const c = growthCenter({ sessions, now: NOW })
    expect(g.domains.focus.status).toBe('up')
    expect(c.areas.dikkat).toMatchObject({ verdict: 'better', value: { key: 'quick-look-threshold', text: '119 → 90 ms' } })
    // Hap ile nokta aynı kaynaktan: metriğin hükmü ve alanın hükmü çelişmez
    expect(c.metrics.find((m) => m.key === 'quick-look-threshold').verdict).toBe('better')
  })
})

// ---------- G1 adım 4: kalan betik durumları (A-S1, A-S3b, A-S8, A-S10; B-B, B-C; C-trend, C-moduller) ----------

describe('denetim A: kalan durumlar', () => {
  it('K3 (A-S1): 60 eski iyi ölçüm + son günlerde düşüş → v2 "better" demez; eski kural yerinde', () => {
    const pts = []
    for (let i = 0; i < 60; i++) pts.push({ date: at(70 - i), value: 200 + (i % 3) * 5 })
    for (let i = 0; i < 6; i++) pts.push({ date: at(6 - i), value: 260 })
    const v2 = metricStatusV2(pts, { better: 'down', now: NOW, familiar: 2, sdFloor: 10 })
    expect(v2.verdict).not.toBe('better')
    expect(v2.measureDays).toBe(66)
    expect(metricTrend(pts, { better: 'down' }).n).toBe(66) // eski kural değişmedi (eşdeğerlik)
  })

  it('K4 (A-S3b): öğrenme eğrisi, 6 ölçüm (ilk 3 alışma, sonra düz) → "better" yok', () => {
    const pts = [3, 4, 5, 6, 6, 6].map((v, i) => ({ date: at(12 - i * 2), value: v }))
    expect(metricStatusV2(pts, { now: NOW, familiar: 2, sdFloor: 0.5 }).verdict).not.toBe('better')
  })

  it('Kü-2 (A-S8): oyun ve WHO-5 alan gününe girer, haftalık hedefe/seriye girmez; iki sayı ayrı adla yazılır', () => {
    const sessions = [
      { type: 'game', game: 'snake', date: at(0, 9), score: 10, seconds: 60 },
      { type: 'who5', date: at(0, 9, 30), answers: [3, 3, 3, 3, 3], raw: 15, score: 60, seconds: 0 },
      { type: 'notice', date: at(0, 10), count: 3, seconds: 0 },
    ]
    const h = hub({ sessions, now: NOW })
    expect([h.domains.focus.records.total, h.domains.wellbeing.records.total, h.domains.awareness.records.total]).toEqual([1, 1, 1])
    // Karar (PLAN §3.2): bir gün, alanın herhangi bir kaydı varsa "çalışılmış gün"; oyun dâhil
    const g = growthCenter({ sessions, now: NOW })
    expect([g.areas.dikkat.days, g.areas.ruh.days]).toEqual([1, 1])
    // Haftalık hedef ve seri (lib/stats.js countsTowardGoal) oyunu saymaz: Yılan tek başına aktif gün yapmaz
    const onlyGame = summary(countedActivities(activitiesFrom([], [sessions[0]])), NOW)
    expect(onlyGame.total).toBe(0)
    expect(growthCenter({ sessions: [sessions[0]], now: NOW }).areas.dikkat.days).toBe(1)
    // Pencerenin ve sayının adı her yüzeyde ayrı (Kü-5): PDF'te "aktif gün · ilk kayıttan beri" ile "Alan başına kaydı
    // olan gün"; hekim belgesinde pencere üçüncü kişiyle (ekrandaki "başladığından beri" değil)
    const t = reportHtml(reportModel({ sessions, habits: [], now: NOW }))
    expect(t).toContain('aktif gün · ilk kayıttan beri')
    expect(t).toContain('Alan başına kaydı olan gün (ilk kayıttan beri)')
    expect(t).not.toContain('başladığından beri')
  })

  it('Kü-3 (A-S10): iris başlangıç kaydı olmayan eski kurulumda profil cevapları merkezden okunur; hub değişmez', () => {
    const profile = { stressNow: 3, sleep: 2, activityDays: 4, selfCompassion: 3, firstLook: { blinks: 7, seconds: 20, method: 'camera' } }
    const h = hub({ profile, now: NOW })
    // eşdeğerlik çekirdeği: hub'ın cevap listesi ve "veri var"ı bugünkü gibi (başlangıç kaydı yoksa boş)
    expect(Object.values(h.domains).map((d) => d.answers.length)).toEqual([0, 0, 0, 0, 0, 0, 0])
    const g = growthCenter({ profile, now: NOW })
    expect(answersOf(profile).map((a) => [a.key, a.from, a.to])).toEqual([['stressNow', 3, null], ['selfCompassion', 3, null], ['sleep', 2, null], ['activityDays', 4, null]])
    // ham dizin yazılmaz: seçenekli soruda seçeneğin sözcüğü, sayılı soruda ölçeğiyle
    expect(g.areas.nefes).toMatchObject({ verdict: 'start', value: { kind: 'answer', text: 'Stres: Epey', good: null } })
    expect(g.areas.hareket).toMatchObject({ verdict: 'start', value: { kind: 'answer', text: 'Hareketli gün 4/7' } })
    expect(g.areas.ruh.measures.map((m) => m.text)).toEqual(['Uyku 2/10', 'Kendine şefkat: Oldukça uyuyor'])
    expect(g.areas.ruh.measures.map((m) => m.key)).toEqual(['answer-sleep', 'answer-selfCompassion'])
    expect(g.areas.goz).toMatchObject({ verdict: 'start', value: { kind: 'blink', text: "20 sn'de 7 kırpma" } })
    expect(g.blink).toMatchObject({ baseline: 7, method: 'camera', recheck: null })
    // başlangıç kaydı varsa ondan; 28. gün cevabıyla "başlangıç → şimdi", yine hüküm yok
    const withIris = { ...profile, iris: { baseline: { date: at(30), stressNow: 4, sleep: 2 }, recheck: { date: at(0), stressNow: 2 } } }
    expect(growthCenter({ profile: withIris, now: NOW }).areas.nefes).toMatchObject({ verdict: 'start', value: { text: 'Stres: Çok → Bir ölçüde', good: null } })
  })
})

describe('denetim B: kalan durumlar', () => {
  it('Kü-4, Kü-6 (B-B): sonra − önce = −0,02 → hiçbir yüzeyde "−0,0"; basamak birimden', () => {
    const s = []
    for (let i = 0; i < 49; i++) s.push({ id: i, type: 'breath', date: at(20 - (i % 20), 8 + (i % 10)), seconds: 120, calmBefore: 3, calmAfter: 3 })
    s.push({ id: 99, type: 'breath', date: at(1), seconds: 120, calmBefore: 3, calmAfter: 2 })
    const g = growthCenter({ sessions: s, now: NOW })
    const e = g.effects.find((x) => x.key === 'breath-calm')
    // belirgin olmayan etki işaretsiz önce → sonra; iki yan aynı basamakla
    expect(e.text).toBe('Sakinlik 3 → 3')
    expect(g.areas.nefes.value.text).toBe('Sakinlik 3 → 3')
    expect(JSON.stringify(g)).not.toContain('−0,0')
    const html = reportHtml(reportModel({ sessions: s, habits: [], now: NOW }))
    expect(html).not.toContain('−0,0')
    expect(changeText({ from: 119.5, to: 120.4, unit: 'ms' }).text).toBe('120 → 120 ms') // Kü-6: ms tam sayı
  })

  it('B-C: boş / 1. gün / 9. gün: evre, pencere, hüküm ve metin kuralları', () => {
    const z = growthCenter({ now: NOW })
    expect(z).toMatchObject({ sinceStart: 0, phase: 'week', win: 7, hasData: false })
    expect(Object.values(z.areas).map((a) => a.verdict)).toEqual(['start', 'start', 'start', 'start', 'start'])
    const t1 = ['R', 'L', 'OU'].map((eye) => ({ type: 'va-weekly', eye, logMAR: 0.1, date: at(0, 9), correction: 'none', algorithm: 'descent-zest-v4' }))
    const g1 = growthCenter({ tests: t1, now: NOW })
    expect(g1).toMatchObject({ sinceStart: 1, phase: 'week', windowLabel: 'başladığından beri' })
    expect(g1.areas.goz).toMatchObject({ verdict: 'start', days: 1, sources: [{ key: 'test:va-weekly', days: 1, n: 1 }] }) // Ö-5: üç göz tek kayıt
    expect(g1.eye).toMatchObject({ phase: 'familiarization', current: 0.1, eye: 'R' })
    const t9 = [...t1.map((t) => ({ ...t, date: at(8, 9) })), ...['R', 'L', 'OU'].map((eye) => ({ type: 'va-weekly', eye, logMAR: 0.12, date: at(1, 9), correction: 'none', algorithm: 'descent-zest-v4' }))]
    const s9 = [0, 2, 4, 6].map((d, i) => ({ id: i, type: 'breath', date: at(d, 20), seconds: 300, calmBefore: 2, calmAfter: 4 }))
    const g9 = growthCenter({ tests: t9, sessions: s9, now: NOW })
    expect(g9).toMatchObject({ sinceStart: 9, phase: 'month', win: 28 })
    expect(g9.areas.goz.verdict).toBe('start')
    expect(g9.areas.nefes).toMatchObject({ verdict: 'better', value: { text: '+2,0 sakinlik', good: true } })
    for (const g of [z, g1, g9]) {
      const words = JSON.stringify(Object.values(g.areas).map((a) => [a.value?.text, a.label, ...a.measures.map((m) => m.text)]))
      expect(words).not.toMatch(/beyin|tanıma|sağlık/i)
    }
  })
})

describe('denetim C: göz serisi ve kalanlar', () => {
  const D0 = new Date('2026-09-01T09:00:00')
  const day = (n, h = 9) => {
    const d = new Date(D0)
    d.setDate(d.getDate() + n - 1)
    d.setHours(h)
    return d.toISOString()
  }
  const wk = (n, lm, extra = {}) => ({ type: 'va-weekly', eye: 'R', logMAR: lm, date: day(n), algorithm: 'descent-zest-v4', distanceTracked: true, meanDistanceMm: 400, correction: 'none', ...extra })
  const red = [wk(1, 0.10), wk(8, 0.05), wk(15, 0.05), wk(22, 0.30), wk(29, 0.30), wk(36, 0.30)]
  const failed = (n) => wk(n, 0.30, { distanceTracked: false, meanDistanceMm: null, camFailedMidTest: true })

  it('Ö-11 (C-T8): kırmızı uyarılı seri + kamerası test ortasında duran tek test → uyarı kalır, kayıt ayrı not', () => {
    const before = analyzeTrend(red, day(36, 20))
    expect(before).toMatchObject({ phase: 'tracking', alert: 'red' })
    const r = analyzeTrend([...red, failed(43)], day(43, 20))
    expect(r).toMatchObject({ phase: 'tracking', alert: 'red', distanceTracked: true, current: before.current })
    expect(droppedNotes(r)).toEqual(['Kamerasız 1 ölçüm bu seriye girmiyor.'])
    expect(trendMessage(r)).toBe(trendMessage(analyzeTrend(red, day(43, 20))))
    // öne çıkan seri (Nef, Bugün, Gelişim) uyarıyı kaybetmez
    expect(pickSeries([...red, failed(43)], day(43, 20)).trend.alert).toBe('red')
    const now = new Date(day(43, 20))
    const g = growthCenter({ tests: [...red, failed(43)], now })
    expect(g.eye).toMatchObject({ eye: 'R', alert: 'red', phase: 'tracking' })
    expect(g.areas.goz).toMatchObject({ verdict: 'unclear', down: true })
  })

  it('Ö-11 (C-T8b): kamera geri gelince seri aynı; kamerasız kayıt yine ayrı not', () => {
    const r = analyzeTrend([...red, failed(43), wk(50, 0.30)], day(50, 20))
    expect(r).toMatchObject({ alert: 'red', distanceTracked: true, dropped: 1 })
    expect(droppedNotes(r)).toEqual(['Kamerasız 1 ölçüm bu seriye girmiyor.'])
  })

  it('Ö-11 sınırları: kamera art arda 3 testte durursa ya da kişi kamerasız moddaysa bugünkü kural (seri son testten)', () => {
    expect(CAM_FAILED_SWITCH).toBe(3)
    const two = analyzeTrend([...red, failed(43), failed(50)], day(50, 20))
    expect(two).toMatchObject({ alert: 'red', distanceTracked: true, dropped: 2 })
    const three = analyzeTrend([...red, failed(43), failed(50), failed(57)], day(57, 20))
    expect(three).toMatchObject({ distanceTracked: false, alert: null, dropped: 6 })
    // C-T7: kişinin kendi kamerasız testi (camFailedMidTest yok) bugünkü gibi yeni seri başlatır (S5, trend.test.js)
    const own = analyzeTrend([...red, wk(43, 0.30, { distanceTracked: false, meanDistanceMm: null })], day(43, 20))
    expect(own).toMatchObject({ distanceTracked: false, phase: 'familiarization' })
    // gözlük koşulu değiştiyse ya da kamerasız testte "gözlüğüm değişti" denildiyse bugünkü kural
    expect(comparableTests([...red, failed(43)].map((t, i) => (i === 6 ? { ...t, correction: 'reading' } : t))).distanceTracked).toBe(false)
    expect(comparableTests([...red, { ...failed(43), newBaseline: true }]).tests).toHaveLength(1)
    // yöntem kuşağı değiştiyse (eski yöntemli seri + ilk v4 testinde kamera durdu) bugünkü kural: yeni yöntemin serisi
    const v3 = red.map((t) => ({ ...t, algorithm: 'descent-zest-v3' }))
    expect(comparableTests([...v3, failed(43)])).toMatchObject({ distanceTracked: false, methodReset: true })
  })

  it('C: E testi takvimi değişmedi (onaylı kural): başlangıç en erken 22. gün, 29. günden kötüleşmede sarı 43. gün', () => {
    const s30 = [wk(1, 0.10), wk(8, 0.06), wk(15, 0.04), wk(22, 0.05), wk(29, 0.03)]
    expect(analyzeTrend(s30.slice(0, 3), day(21, 20)).phase).not.toBe('tracking')
    expect(analyzeTrend(s30.slice(0, 4), day(22, 20)).phase).toBe('tracking')
    const w = [wk(1, 0.10), wk(8, 0.05), wk(15, 0.05), wk(22, 0.05), wk(29, 0.20), wk(36, 0.21), wk(43, 0.20)]
    expect(analyzeTrend(w.slice(0, 6), day(36, 20)).alert).toBeNull()
    expect(analyzeTrend(w, day(43, 20)).alert).toBe('yellow')
  })

  it('Kü-12: "Tüm verileri sil" bakış kalibrasyonunu siler; kamera yönü tercihi kalır', () => {
    const m = new Map([[GAZE_MODEL_KEY, '{"date":"x"}'], ['gozolcum:gaze-flip', '1'], ['gozolcum:tema', 'koyu']])
    const storage = { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k) }
    let settings = {}
    const store = { get: () => ({ settings }), clearAll: () => { settings = {} }, setSetting: (k, v) => { settings[k] = v } }
    resetAllData({ store, storage })
    expect(DATA_RESET_KEYS).toEqual([GAZE_MODEL_KEY])
    expect(m.has(GAZE_MODEL_KEY)).toBe(false)
    expect([...m.keys()]).toEqual(['gozolcum:gaze-flip', 'gozolcum:tema'])
  })

  it('Kü-8: denetimin dayandığı işlev adları yerinde (satır numaraları değil adlar dayanaktır)', () => {
    const src = (p) => readFileSync(fileURLToPath(new URL(p, import.meta.url)), 'utf8')
    expect(typeof metricCards).toBe('function')
    expect(src('../components/ProgressOverview.jsx')).toMatch(/function GrowthMap\(/)
    expect(existsSync(fileURLToPath(new URL('../components/GrowthMap.jsx', import.meta.url)))).toBe(false)
    expect(src('../components/ProgressOverview.jsx')).toMatch(/export function metricStatus\(/)
    for (const f of ['csvRows', 'reportModel', 'reportHtml']) expect(typeof exportMod[f], f).toBe('function')
    for (const f of ['hub', 'growthMap', 'changeDetail', 'verifiedChange']) expect(typeof hubMod[f], f).toBe('function')
  })
})
