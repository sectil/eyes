// Tek hesap testi (gelisim-merkezi PLAN.v1 §3.5 madde 1, §8.4; DEVIR §7 "Veri"): aynı depodan Gelişim'in tek çıkışı
// (growthCenter), "Doktoruma göster" PDF'i (model ve metin), CSV, 5. gün raporu ve Ana sayfa haritası aynı hükmü, aynı
// göz "şimdi" değerini ve aynı günleri verir. Denetimin B betiği (B-A durumu growth.consumers.test.js'te) bu testin
// çekirdeğidir; burada aynı karşılaştırma tohumlu depolarda (test/growthStore.js, mulberry32(11)) yapılır.
//
// Kapsam dışı (henüz merkezi okumayan ya da olmayan yüzeyler; aşağıda it.todo):
//  - Gelişim satırı ve alan ayrıntısı (components/ProgressOverview.jsx): G2'de growthCenter'a bağlanır (PLAN §8.1 G2).
//    Bugün satır hapı metricStatus'tan geliyor (DENETIM K1'in ekran yarısı).
//  - Ana sayfa göz kartı (screens/Home.jsx current7 ?? last): G2 (PLAN §13; K2'nin ekran yarısı).
//  - Bildirim metni (lib/growthNotify.js): G3'te yazılır.
//  - Nef paketi: Y6 (PLAN §8.4; bugünkü paket göz dışında hüküm taşımıyor, yeni alan rıza v2 ister).
// Ortam değişkeni GROWTH_SINGLE_N: depo sayısı (varsayılan 1000).
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { growthCenter, AREA_DOMAINS, DOMAIN_AREA } from './growthCenter.js'
import { growthMap, firstDay } from './dataHub.js'
import { reportModel, reportHtml, csvRows, metricValueText } from './exportData.js'
import { firstReport, DOMAIN_LABEL } from './progress.js'
import { VERDICT_WORD, changeText } from './changeText.js'
import { dayKey } from './calendar.js'
import { normalizeProfile } from './profile.js'
import { ANSWER_FIELDS } from './iris.js'
import { mulberry32, makeStore } from '../../test/growthStore.js'
import { deepFreeze, ADDED_CSV_MEASURES } from '../../test/growthEquiv.js'
import HomeMap from '../components/HomeMap.jsx'
import FirstReport, { who5Line, metricPill } from '../screens/FirstReport.jsx'

const N = Number(process.env.GROWTH_SINGLE_N) > 0 ? Math.floor(Number(process.env.GROWTH_SINGLE_N)) : 1000
const DAY = 86400000
const text = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&#39;|&#x27;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ')
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
// PDF'in metrik hükmü (lib/exportData.js metricVerdictText): Gelişim'in dört sözcüğü; doğrulanmış gerileme sözcüksüz,
// işaretli fark (merkezin başlangıç → şimdi değerlerinden); yoga ("nasıl hissettin") yalnız puanın yönü
const pdfWord = (m) => {
  if (m.feelOnly && (m.verdict === 'better' || m.verdict === 'worse')) return (m.verdict === 'better') === (m.better !== 'down') ? 'belirgin artış' : 'belirgin düşüş'
  if (m.verdict === 'worse') return changeText({ from: m.baseline, to: m.current, unit: m.unit, better: m.better }).deltaText
  return VERDICT_WORD[m.verdict]
}
// PDF'te hüküm taşıyan yerler (metrik değerlendirme sütunu, göz durum hapı, WHO-5 parantezi) yalnız bunları yazar
const PDF_ALLOWED = new Set([...Object.values(VERDICT_WORD), 'belirgin artış', 'belirgin düşüş', 'alışma dönemi (ilk 7 gün)', 'başlangıç oluşuyor', 'KIRMIZI: göz doktoruna başvurmalı', 'SARI: sonraki testlerle izlenmeli'])
const OLD_WORDS = /iyileşiyor|geriliyor|doğal oynama|henüz belirsiz|anlamlı artış|anlamlı düşüş|doğrulanmış değişim yok|gerisinde|>iyileşme<|>ilk ölçüm</
function pdfVerdictSpots(html) {
  const metric = [...(section(html, 'Diğer ölçümler').matchAll(/<td class="n">[^<]*<\/td><td>([^<]*)<\/td><\/tr>/g))].map((m) => m[1])
  const eye = [...html.matchAll(/<span class="status[^"]*">([^<]*)<\/span>/g)].map((m) => m[1])
  const who5 = [...section(html, 'İyi oluş').matchAll(/ilk ölçümden bu yana [−+]?\d+ \(([^)]*)\)/g)].map((m) => m[1])
  return [...metric, ...eye, ...who5]
}
const section = (html, h2) => {
  const i = html.indexOf(`<h2>${h2}`)
  return i < 0 ? '' : html.slice(i, html.indexOf('</section>', i))
}

const tz = process.env.TZ
beforeAll(() => {
  process.env.TZ = 'Europe/Berlin'
})
afterAll(() => {
  if (tz === undefined) delete process.env.TZ
  else process.env.TZ = tz
})

const inputOf = (s) => ({ tests: s.tests, sessions: s.sessions, profile: s.profile, habits: s.habits, health: s.health, now: s.now })
const byKey = (list, f) => Object.fromEntries(list.map((x) => [x.key, f(x)]))

// Haritanın 28 günlük penceresindeki takvim günleri (strip ile aynı sırada)
const windowDays = (map) => {
  const t0 = new Date(map.from).getTime()
  return map.domains.eye.strip.map((_, i) => dayKey(new Date(t0 + i * DAY + DAY / 2)))
}

describe('Tek hesap: aynı depo → aynı hüküm, aynı göz değeri, aynı günler (PLAN §8.4)', () => {
  it(`${N} tohumlu depo: growthCenter ≡ PDF modeli ≡ PDF metni ≡ CSV günleri ≡ 5. gün raporu`, { timeout: Math.max(60000, N * 200) }, () => {
    const rnd = mulberry32(11)
    const seen = { metrics: 0, verdicts: 0, same: 0, areasBetter: 0, effects: 0, eye: 0, who5: 0, report: 0, csvDays: 0, pdfSpots: 0 }
    for (let i = 0; i < N; i++) {
      const store = deepFreeze(makeStore(rnd))
      const input = inputOf(store)
      const g = growthCenter(input)
      const m = reportModel(input)
      const at = `depo ${i}`
      // 1) Metrik hükmü: PDF ≡ merkez (anahtar anahtar)
      const gm = byKey(g.metrics, (x) => x.verdict ?? null)
      const pm = byKey(m.metrics, (x) => x.verdict ?? null)
      expect(pm, `${at} metrik hükmü`).toEqual(gm)
      seen.metrics += m.metrics.length
      seen.verdicts += m.metrics.filter((x) => x.verdict === 'better' || x.verdict === 'worse').length
      seen.same += m.metrics.filter((x) => x.verdict === 'same').length
      seen.areasBetter += Object.values(g.areas).filter((a) => a.verdict === 'better').length
      // 2) Etkiler (son 28 gün): aynı n, anlamlılık ve ortalama
      expect(byKey(m.effects, (e) => [e.n, e.sig, e.gain]), `${at} etkiler`).toEqual(byKey(g.effects, (e) => [e.n, e.sig, e.gain]))
      seen.effects += g.effects.length
      // 3) WHO-5
      expect([m.who5.n, m.who5.n ? m.who5.last : null, m.who5.n ? m.who5.verdict : null], `${at} WHO-5`).toEqual([g.who5.n, g.who5.n ? g.who5.last : null, g.who5.n ? g.who5.verdict : null])
      if (g.who5.n) seen.who5++
      // 4) Göz: merkezin öne çıkan gözü PDF'te aynı "şimdi" değeri, penceresi, evresi, uyarısı ve mesajıyla (K2)
      if (g.eye.eye) {
        const pe = m.eyes.find((e) => e.eye === g.eye.eye)
        expect(pe, `${at} PDF'te göz ${g.eye.eye}`).toBeTruthy()
        expect([pe.trend.current, pe.trend.currentWindow, pe.trend.phase, pe.trend.alert, pe.message], `${at} göz`).toEqual([g.eye.current, g.eye.currentWindow, g.eye.phase, g.eye.alert, g.eye.message])
        seen.eye++
      }
      // 5) Alan başına gün: PDF ≡ merkez
      expect(m.areas.rows.map((r) => r.days), `${at} alan günleri`).toEqual(g.order.map((k) => g.areas[k].days))
      // 6) PDF metni: her metrik satırı merkezin hükmünü yazar
      if (i % 3 === 0) {
        const html = reportHtml(m)
        for (const x of g.metrics) {
          const pdf = m.metrics.find((c) => c.key === x.key)
          if (!pdf || !x.verdict) continue
          const re = new RegExp(`<td>${reEsc(esc(pdf.label))}</td><td>[^<]*</td><td class="n">\\d+</td><td class="n">[^<]*</td><td>([^<]*)</td>`)
          const row = html.match(re)
          expect(row?.[1], `${at} PDF satırı ${x.key}`).toBe(pdfWord(x))
        }
        // WHO-5: son puan ve hüküm Gelişim'in sözcüğüyle (gerilemede sözcük yok, yalnız işaretli fark)
        if (g.who5.n) expect(text(html), `${at} PDF WHO-5`).toContain(`Son puan ${g.who5.last}`)
        if (g.who5.n > 1 && (g.who5.verdict === 'better' || g.who5.verdict === 'same')) expect(text(html), `${at} PDF WHO-5 hükmü`).toContain(`(${VERDICT_WORD[g.who5.verdict]})`)
        if (g.who5.n > 1 && g.who5.verdict === 'worse') expect(section(html, 'İyi oluş'), `${at} PDF WHO-5 gerileme`).not.toMatch(/bu yana [−+]?\d+ \(/)
        // hüküm taşıyan her yerde yalnız izinli söz (dört sözcük, yoga yönü, evre, uyarı, işaretli sayı); eski sözlükler yok
        for (const w of pdfVerdictSpots(html)) expect(PDF_ALLOWED.has(w) || /^[−+]\d/.test(w), `${at} PDF hüküm sözü "${w}"`).toBe(true)
        expect(html, `${at} PDF eski hüküm sözlüğü`).not.toMatch(OLD_WORDS)
        seen.pdfSpots++
      }
      // 7) CSV: alanın son 28 gündeki çalışılmış günleri ≡ CSV satırlarının günleri (başlangıç soruları hariç: CSV'de
      //    satırı yok, profilde durur)
      if (i % 3 === 1) {
        const map = growthMap(input)
        const days = windowDays(map)
        const csv = csvRows(input)
        const iris = normalizeProfile(store.profile ?? {}).iris ?? {}
        const answerDays = Object.fromEntries(Object.keys(map.domains).map((d) => [d, new Set()]))
        for (const snap of [iris.baseline, iris.recheck]) {
          if (!snap?.date) continue
          for (const f of ANSWER_FIELDS) if (Number.isFinite(snap[f.key])) answerDays[f.domain].add(dayKey(new Date(snap.date)))
        }
        for (const d of Object.keys(map.domains)) {
          const want = new Set(days.filter((k, j) => map.domains[d].strip[j] && !answerDays[d].has(k)))
          // Kaydın gününü taşıyan satırlar: her kaydın "süre" satırı (alan domainOfSession'dan, şeritle aynı) ve eklenen
          // alışkanlık/adımlı gün satırları. Önce → sonra ve ölçüm satırları ETKİNİN alanını taşır (Dalga'nın güç etkisi
          // Kendine yaklaşım'da, günü Sakinlik'te; PLAN §3.2), gün sayımına girmez.
          const got = new Set(csv.filter((r) => r.domain === d && (r.measure === 'süre' || ADDED_CSV_MEASURES.has(r.measure))).map((r) => dayKey(new Date(r.date))).filter((k) => days.includes(k) && !answerDays[d].has(k)))
          expect([...got].sort(), `${at} CSV günleri ${d}`).toEqual([...want].sort())
          seen.csvDays += want.size
        }
      }
      // 8) 5. gün raporu (ilk 28 gün; başlangıç ilk kayıt günü): metrik hükmü, WHO-5 ve göz mesajı merkezle aynı
      if (g.sinceStart > 0 && g.sinceStart <= 28) {
        const start = firstDay(input)
        const fr = firstReport({ tests: store.tests, sessions: store.sessions, start, now: store.now })
        expect(byKey(fr.metrics, (x) => x.verdict ?? null), `${at} 5. gün metrikleri`).toEqual(gm)
        expect([fr.who5.n, fr.who5.n ? fr.who5.verdict : null], `${at} 5. gün WHO-5`).toEqual([g.who5.n, g.who5.n ? g.who5.verdict : null])
        expect(fr.eye.message, `${at} 5. gün göz mesajı`).toBe(g.eye.message)
        seen.report++
      }
    }
    console.log(`Tek hesap (${N} depo) kapsam ${JSON.stringify(seen)}`)
    expect(seen.verdicts).toBeGreaterThan(N * 0.025)
    expect(seen.same).toBeGreaterThan(N * 0.1)
    expect(seen.areasBetter).toBeGreaterThan(N * 0.1)
    expect(seen.eye).toBeGreaterThan(N * 0.2)
    expect(seen.who5).toBeGreaterThan(N * 0.1)
    expect(seen.report).toBeGreaterThan(N * 0.05)
    expect(seen.csvDays).toBeGreaterThan(N)
  })

  it('ekranda: Ana sayfa haritası ve 5. gün raporu merkezle aynı hükmü yazar (200 depo; ekranın kendi saati)', { timeout: 120000 }, () => {
    const rnd = mulberry32(12)
    const seen = { home: 0, up: 0, report: 0, pills: 0 }
    vi.useFakeTimers({ toFake: ['Date'] })
    try {
      for (let i = 0; i < 200; i++) {
        const store = deepFreeze(makeStore(rnd))
        vi.setSystemTime(store.now)
        // HomeMap alışkanlıkları telefondan okur (burada boş), sağlık verisi almaz: merkez de aynı girdiyle
        const input = { tests: store.tests, sessions: store.sessions, profile: store.profile, habits: [], health: null, now: store.now }
        const g = growthCenter(input)
        const map = growthMap(input)
        const home = text(renderToStaticMarkup(h(HomeMap, { tests: store.tests, sessions: store.sessions, profile: store.profile, onStart: () => {} })))
        if (map.sinceStart) {
          seen.home++
          const listed = home.match(/İyileşiyor: ([^.]*?)(?= [A-ZÇĞİÖŞÜ][a-zçğıöşü]+: | \S+ \/ |$)/)?.[1] ?? ''
          const ups = Object.keys(DOMAIN_LABEL).filter((d) => map.domains[d].status === 'up')
          for (const d of ups) {
            expect(listed, `depo ${i} Ana sayfa ${d}`).toContain(DOMAIN_LABEL[d])
            // Ana sayfada "iyileşiyor" denen iç alanın ekran alanı ya "başlangıcından iyi" ya da (kardeş iç alanda
            // gerileme / göz uyarısı varsa) "henüz belli değil" + işaret; hiçbir zaman "değişim yok" ya da "başlangıç"
            const a = g.areas[DOMAIN_AREA[d]]
            expect(a.verdict === 'better' || (a.verdict === 'unclear' && (a.mixed || a.down)), `depo ${i} alan ${a.key}`).toBe(true)
            seen.up++
          }
          for (const [k, a] of Object.entries(g.areas)) {
            if (a.verdict === 'better') expect(AREA_DOMAINS[k].some((d) => ups.includes(d)), `depo ${i} ${k} better`).toBe(true)
          }
          if (!ups.length) expect(home).toContain('Değişim, kayıtlar biriktikçe görünür.')
        } else expect(home).toBe('')
        // 5. gün raporu ekranı: WHO-5 satırı ve göz mesajı merkezle aynı (ilk 28 gün)
        if (g.sinceStart > 0 && g.sinceStart <= 28 && i % 2 === 0) {
          const start = firstDay(input)
          const fr = text(renderToStaticMarkup(h(FirstReport, { tests: store.tests, sessions: store.sessions, start, onClose: () => {}, onProgress: () => {} })))
          const r = firstReport({ tests: store.tests, sessions: store.sessions, start, now: store.now })
          expect(r.who5.verdict ?? null).toBe(g.who5.n ? g.who5.verdict ?? null : null)
          expect(fr).toContain(text(esc(who5Line(r.who5))))
          expect(fr).not.toMatch(/beyin|tanıma/i)
          // Ölçümler kartı: her metriğin değeri PDF'teki biçimle ve hapı merkezin hükmünün sözcüğüyle (gerilemede hap yok)
          const gv = byKey(g.metrics, (x) => x)
          for (const m of r.metrics) {
            const pill = metricPill(m)
            const head = text(esc(`${m.label} (${DOMAIN_LABEL[m.domain]}): ${metricValueText(m)} · ${m.n} ölçüm`))
            expect(fr, `depo ${i} 5. gün ${m.key}`).toContain(pill ? `${head} ${text(esc(pill.text))}` : head)
            const c = gv[m.key]
            if (c && !c.feelOnly && c.verdict === m.verdict) {
              expect(pill?.text ?? null, `depo ${i} 5. gün hapı ${m.key}`).toBe(c.verdict === 'worse' ? null : VERDICT_WORD[c.verdict])
              seen.pills++
            }
          }
          expect(fr, `depo ${i} 5. gün eski sözlük`).not.toMatch(/iyileşiyor|geriliyor|doğal oynama|henüz belirsiz|ilk yarı ort/)
          seen.report++
        }
      }
    } finally {
      vi.useRealTimers()
    }
    console.log(`Tek hesap ekran kapsamı ${JSON.stringify(seen)}`)
    expect(seen.home).toBeGreaterThan(100)
    expect(seen.up).toBeGreaterThan(5)
    expect(seen.report).toBeGreaterThan(5)
    expect(seen.pills).toBeGreaterThan(5)
  })

  it.todo('G2: Gelişim satırı ve alan ayrıntısı (ProgressOverview) growthCenter areas[k].verdict ve value okur (K1 ekran yarısı)')
  // Doktoruma göster kartı (components/ExportCard.jsx) bugün reportModel ve csvRows'a yalnız tests, sessions, identity
  // verir: profile ve health olmadan PDF'in alan günleri, pencere adı ve CSV'nin adımlı gün satırları Gelişim'den farklı
  // çıkabilir. ExportCard ve onu çizen ProgressOverview G1 dosya listesinde yok; sahibe soruldu (G2'de bağlanır).
  it.todo('G2: ExportCard reportModel ve csvRows\'a profile ve health verir; PDF alan günleri ≡ Gelişim (ExportCard girdisiyle)')
  it.todo('G2: Ana sayfa göz kartı (Home.jsx) growthCenter eye.current ve currentWindow gösterir; current7 ?? last kalkar (K2 ekran yarısı)')
  it.todo('G3: haftalık/aylık gelişim bildiriminin metni growthCenter verdict\'inden (lib/growthNotify.js)')
  it.todo('Y6: Nef paketi alan hükmünü ve WHO-5 durumunu merkezden alır (Ö-2; rıza v2)')
})
