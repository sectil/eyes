// Dışa aktarma (Gelişim 2.0, onaylı taslak: "Doktoruma göster (PDF)" + "CSV indir").
// KVKK: dosya yalnız kullanıcı dokununca oluşur ve yalnız onun seçtiği yere gider (iOS paylaşım sayfası);
// uygulama hiçbir sunucuya göndermez. Yön serbest metinleri gibi kişisel yazılar dosyaya girmez.
// CSV modül kayıt defterinden kurulur (modules/registry.js): yeni modülün metrikleri, önce→sonra puanları ve
// süreleri kendiliğinden eklenir.
import { registry } from '../modules/registry.js'
import { activitiesFrom, decimalTr } from './stats.js'
import { analyzeTrend, trendMessage, seriesNotes, droppedNotes, YELLOW_DELTA, RED_DELTA, BAND_MIN_MM, BAND_MAX_MM } from './trend.js'
import { formatLogMAR, formatEquivalents, roundLogMAR } from './optotype.js'
import { EYE_LABEL } from './vaSeries.js'
import { DOMAIN_LABEL, WHO5_TYPE, acuteEffects, metricCards, practiceCard, who5Card } from './progress.js'
import { ageFromBirthDate } from './identity.js'

const isVa = (t) => t?.type === 'va-daily' || t?.type === 'va-weekly'
// 'va-daily': kısa test (eski adı günlük test; 2026-09-29'dan beri isteğe bağlı). Eski kayıtlar da aynı testtir.
const VA_TITLE = { 'va-daily': 'Kısa görme testi', 'va-weekly': 'Haftalık görme testi' }
export const CONDITION_TEXT = { none: 'gözlüksüz', reading: 'okuma gözlüğüyle', progressive: 'progresif gözlükle', distance: 'uzak gözlüğüyle', contacts: 'lensle', glasses: 'gözlüklü (eski kayıt)' }
const validDate = (iso) => Number.isFinite(new Date(iso).getTime())
const byDate = (a, b) => new Date(a.date) - new Date(b.date)
const p2 = (n) => String(n).padStart(2, '0')

// Yerel saat, tablolama programlarının tanıdığı biçim: 2026-09-21 09:14
export function localStamp(iso) {
  const d = new Date(iso)
  if (!Number.isFinite(d.getTime())) return ''
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}`
}
export const fileStamp = (d = new Date()) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`

// ---------- CSV ----------
// Uzun ("tidy") biçim: her satır tek ölçüm. Türkçe Excel uzlaşımı: ayırıcı ";", virgüllü ondalık (Türkçe
// Windows'ta liste ayırıcısı ";"; virgüllü dosya tek sütuna düşer). Tırnaklama RFC 4180 gibi.
// Başka dil eklenince CSV_FORMAT dile göre seçilir (ör. en: "," ve nokta).
export const CSV_HEADER = ['tarih', 'modül', 'alan', 'ölçüm', 'değer', 'birim', 'not']

export function csvRows({ tests = [], sessions = [], metrics = registry.metrics(), effects = registry.effects() } = {}) {
  const rows = []
  const titleOf = (id) => registry.get(id)?.title ?? id
  for (const t of tests) {
    if (!isVa(t) || !Number.isFinite(t.logMAR) || !validDate(t.date)) continue
    const note = [
      t.correction ? `koşul: ${CONDITION_TEXT[t.correction] ?? t.correction}` : null,
      Number.isFinite(t.meanDistanceMm) ? `mesafe: ${Math.round(t.meanDistanceMm / 10)} cm` : null,
      Number.isFinite(t.trials) ? `deneme: ${t.trials}` : null,
      t.newBaseline ? 'yeni gözlük: yeni başlangıç' : null,
    ].filter(Boolean)
    rows.push({ date: t.date, module: VA_TITLE[t.type], domain: 'eye', measure: `logMAR · ${EYE_LABEL[t.eye] ?? t.eye ?? ''}`, value: t.logMAR, unit: 'logMAR', note: note.join('; ') })
  }
  for (const m of metrics) {
    for (const p of m.series({ tests, sessions }) ?? []) {
      if (!Number.isFinite(p?.value) || !validDate(p.date)) continue
      rows.push({ date: p.date, module: titleOf(m.module), domain: m.domain, measure: m.label, value: p.value, unit: m.unit, note: '' })
    }
  }
  for (const s of sessions) {
    if (!validDate(s?.date)) continue
    for (const e of effects) {
      const pair = e.pick(s)
      if (!pair || !Number.isFinite(pair[0]) || !Number.isFinite(pair[1])) continue
      const base = { date: s.date, module: titleOf(e.module), domain: e.domain, unit: `/${e.max}`, note: e.better === 'down' ? 'düşük daha iyi' : '' }
      rows.push({ ...base, measure: `${e.measure} · önce`, value: pair[0] }, { ...base, measure: `${e.measure} · sonra`, value: pair[1] })
    }
    if (s.type === WHO5_TYPE && Number.isFinite(s.score)) {
      rows.push({ date: s.date, module: 'WHO-5 iyi oluş', domain: 'wellbeing', measure: 'WHO-5', value: s.score, unit: '/100', note: Number.isFinite(s.raw) ? `ham ${s.raw}/25` : '' })
    }
  }
  // Her kayıt (test, egzersiz, oyun) süresiyle: ölçümü olmayan modüller de dosyada görünür
  for (const a of activitiesFrom(tests, sessions)) {
    const domain = a.kind === 'test' ? 'eye' : (registry.get(a.module) ?? registry.forSession({ type: a.type }))?.progress.domain ?? ''
    rows.push({ date: a.date, module: a.title, domain, measure: 'süre', value: a.seconds, unit: 'sn', note: [a.estimated ? 'tahmini süre' : null, a.detail].filter(Boolean).join(' · ') })
  }
  return rows.sort(byDate)
}

export const CSV_FORMAT = { sep: ';', decimal: ',' }
const csvNumber = (v, decimal) => (Number.isFinite(v) ? String(+v.toFixed(3)).replace('.', decimal) : '')
function csvCell(v, sep) {
  let s = v == null ? '' : String(v).replace(/\u00a0/g, ' ')
  // Tablolama programında formül sanılmasın (sayılar hariç)
  if (/^[=+\-@]/.test(s) && !/^-?\d/.test(s)) s = `'${s}`
  // Tırnak yalnız gerektiğinde: çift tırnak, satır sonu ya da o anki ayırıcı (virgüllü ondalık tırnaksız kalır)
  return s.includes('"') || s.includes(sep) || /[\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
// BOM: Excel dosyayı UTF-8 okusun (ş, ğ, ı). "sep=" satırı eklenmez: Excel o zaman BOM'u yok sayar.
export function toCsv(rows, { sep, decimal } = CSV_FORMAT) {
  const lines = [CSV_HEADER, ...rows.map((r) => [localStamp(r.date), r.module, DOMAIN_LABEL[r.domain] ?? '', r.measure, csvNumber(r.value, decimal), r.unit, r.note])]
  return '\uFEFF' + lines.map((l) => l.map((c) => csvCell(c, sep)).join(sep)).join('\r\n') + '\r\n'
}

// ---------- "Doktoruma göster" raporu ----------
const DAY = 86400000
export const REPORT_TABLE_ROWS = 10

export function reportModel({ tests = [], sessions = [], identity = null, now = new Date() } = {}) {
  const nowIso = new Date(now).toISOString()
  const va = tests.filter((t) => isVa(t) && Number.isFinite(t.logMAR) && validDate(t.date)).sort(byDate)
  const eyes = ['R', 'L', 'OU']
    .map((eye) => {
      const ts = va.filter((t) => t.eye === eye)
      if (!ts.length) return null
      const trend = analyzeTrend(ts, nowIso)
      return { eye, label: EYE_LABEL[eye], n: ts.length, first: ts[0].date, last: ts.at(-1), trend, message: trendMessage(trend), recent: ts.slice(-REPORT_TABLE_ROWS).reverse() }
    })
    .filter(Boolean)
  const all = [...tests, ...sessions].filter((x) => validDate(x?.date)).sort(byDate)
  const age = ageFromBirthDate(identity?.birthDate ?? null, new Date(now))
  return {
    generatedAt: nowIso,
    name: identity?.name?.trim() || null,
    age,
    from: all[0]?.date ?? null,
    to: all.at(-1)?.date ?? null,
    days: all.length ? Math.floor((new Date(all.at(-1).date) - new Date(all[0].date)) / DAY) + 1 : 0,
    eyes,
    practice: practiceCard(tests, sessions, now),
    who5: who5Card(sessions, now),
    metrics: metricCards({ tests, sessions }),
    effects: acuteEffects(sessions),
  }
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '–')
const fmtShort = (iso) => new Date(iso).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })
const num = (v, d = 1) => (Number.isFinite(v) ? decimalTr(v, d) : '–')
const signed = (v, d = 1) => (Number.isFinite(v) ? `${v > 0 ? '+' : v < 0 ? '−' : ''}${decimalTr(Math.abs(v), d)}` : '–')
// logMAR → ondalık görme keskinliği (10^−logMAR); standart dönüşüm, yorum değil. H8: logMAR önce 2 haneye yuvarlanır,
// ondalık bu değerden türetilir (uygulamadaki E7 ile aynı: 0,004 → "0,00" ve "1,00", "0,99" değil).
const decimalVa = (lm) => formatEquivalents(lm)?.decimal ?? '–'
const lmText = (lm) => (Number.isFinite(lm) ? formatLogMAR(lm) : '–')
// Değişim, raporda yazan iki yuvarlanmış değerin farkıdır: 0,12 → 0,20 "+0,08" (ham farkın yuvarlaması +0,09 olabilirdi
// ve okuyan iki sayıyı çıkarınca tutmazdı). Eksi işareti gerçek eksi (−).
function lmChange(current, baseline) {
  if (!Number.isFinite(current) || !Number.isFinite(baseline)) return '–'
  const d = roundLogMAR(roundLogMAR(current) - roundLogMAR(baseline))
  return `${d > 0 ? '+' : ''}${formatLogMAR(d)}`
}
const PHASE_TEXT = { familiarization: 'alışma dönemi (ilk 7 gün)', baseline: 'başlangıç oluşuyor', tracking: 'takipte', empty: '–' }
const STATUS_TEXT = { better: 'iyileşiyor', worse: 'geriliyor', noise: 'doğal oynama', unsure: 'henüz belirsiz', first: 'ilk ölçüm', up: 'anlamlı artış', down: 'anlamlı düşüş' }
function eyeStatusText(t) {
  if (t.alert === 'red') return 'KIRMIZI: göz doktoruna başvurmalı'
  if (t.alert === 'yellow') return 'SARI: sonraki testlerle izlenmeli'
  if (t.phase !== 'tracking') return PHASE_TEXT[t.phase]
  return t.trend === 'improving' ? 'iyileşme' : 'doğrulanmış değişim yok'
}

// logMAR eğilimi: yukarı = daha iyi (ters eksen), gri bant = başlangıç ±0,10 (değişim eşiği; tek testin oynaması
// değil). Baskı için sabit renkler.
export function eyeChartSvg(series = [], baseline = null) {
  const W = 320
  const H = 120
  const L = 34
  const R = 10
  const T = 10
  const B = 20
  const pts = series.filter((p) => Number.isFinite(p.logMAR) && validDate(p.date))
  if (pts.length < 2) return ''
  const t0 = new Date(pts[0].date).getTime()
  const t1 = Math.max(new Date(pts.at(-1).date).getTime(), t0 + DAY)
  const vals = pts.map((p) => p.logMAR)
  const band = baseline != null ? [baseline - YELLOW_DELTA, baseline + YELLOW_DELTA] : null
  let lo = Math.min(...vals, ...(band ?? []))
  let hi = Math.max(...vals, ...(band ?? []))
  const pad = Math.max(0.05, (hi - lo) * 0.12)
  lo -= pad
  hi += pad
  const x = (iso) => L + ((new Date(iso).getTime() - t0) / (t1 - t0)) * (W - L - R)
  const y = (v) => T + ((v - lo) / (hi - lo)) * (H - T - B) // küçük logMAR (iyi) üstte
  const f = (v) => v.toFixed(1)
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${f(x(p.date))},${f(y(p.logMAR))}`).join('')
  const ticks = [lo + pad, hi - pad]
  const last = pts.at(-1)
  return [
    `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="logMAR eğilimi">`,
    band ? `<rect x="${L}" y="${f(y(band[0]))}" width="${W - L - R}" height="${f(y(band[1]) - y(band[0]))}" fill="#eceff1"/>` : '',
    band ? `<line x1="${L}" x2="${W - R}" y1="${f(y(baseline))}" y2="${f(y(baseline))}" stroke="#9aa5ab" stroke-width="1" stroke-dasharray="3 3"/>` : '',
    ...ticks.map((v) => `<line x1="${L}" x2="${W - R}" y1="${f(y(v))}" y2="${f(y(v))}" stroke="#dfe3e6" stroke-width="0.8"/><text x="${L - 5}" y="${f(y(v) + 3)}" text-anchor="end" font-size="8" fill="#5f6b73">${esc(decimalTr(v, 2))}</text>`),
    `<text x="${L}" y="${H - 5}" font-size="8" fill="#5f6b73">${esc(fmtShort(pts[0].date))}</text>`,
    `<text x="${W - R}" y="${H - 5}" text-anchor="end" font-size="8" fill="#5f6b73">${esc(fmtShort(last.date))}</text>`,
    `<path d="${path}" fill="none" stroke="#0b6e79" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>`,
    ...pts.map((p) => `<circle cx="${f(x(p.date))}" cy="${f(y(p.logMAR))}" r="1.8" fill="#0b6e79" fill-opacity="0.6"/>`),
    `<circle cx="${f(x(last.date))}" cy="${f(y(last.logMAR))}" r="3.2" fill="#0b6e79" stroke="#fff" stroke-width="1.4"/>`,
    '</svg>',
  ].join('')
}

const CSS = `
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:#fff}
body{font:10pt/1.45 -apple-system,"SF Pro Text","Helvetica Neue",Helvetica,Arial,sans-serif;color:#1d2429;-webkit-print-color-adjust:exact;print-color-adjust:exact}
h1{font-size:17pt;line-height:1.15;margin:0;letter-spacing:-.01em}
h2{font-size:11.5pt;margin:0 0 6pt;padding-bottom:3pt;border-bottom:1.2pt solid #1d2429}
h3{font-size:10.5pt;margin:0}
p{margin:0}
.head{display:flex;justify-content:space-between;align-items:flex-end;gap:12pt;border-bottom:.6pt solid #c9d0d4;padding-bottom:8pt}
.brand{font-size:8pt;letter-spacing:.14em;color:#0b6e79;font-weight:700}
.meta{font-size:8.5pt;color:#4a555c;text-align:right;line-height:1.5}
.who{display:flex;flex-wrap:wrap;gap:4pt 16pt;margin-top:8pt;font-size:9.5pt}
.who b{font-weight:650}
.note{margin:10pt 0 14pt;padding:7pt 9pt;border-left:2.5pt solid #0b6e79;background:#f2f6f7;font-size:9pt;color:#2f3a40}
section{margin-top:14pt}
.eye{padding:8pt 0 10pt;border-bottom:.6pt solid #e1e5e8}
.eye-sum{break-inside:avoid;page-break-inside:avoid;display:grid;grid-template-columns:1fr 1fr;gap:6pt 14pt;margin-bottom:6pt}
.eye .top{grid-column:1/-1;display:flex;justify-content:space-between;align-items:baseline;gap:8pt}
.status{font-size:8.5pt;font-weight:700;padding:1.5pt 6pt;border-radius:8pt;background:#eceff1;color:#34424a;white-space:nowrap}
.status.yellow{background:#fff3cd;color:#7a4b00}
.status.red{background:#fde2e1;color:#8f1d18}
.kv{display:grid;grid-template-columns:repeat(2,1fr);gap:3pt 10pt;font-size:9pt;align-content:start}
.kv span{color:#5f6b73}
.kv b{font-variant-numeric:tabular-nums;font-weight:650}
.msg{grid-column:1/-1;font-size:9pt;color:#2f3a40}
.chart{width:100%;height:auto;display:block}
table{width:100%;border-collapse:collapse;font-size:8.6pt;font-variant-numeric:tabular-nums}
th{text-align:left;font-weight:650;color:#4a555c;border-bottom:.8pt solid #9aa5ab;padding:3pt 4pt}
td{padding:2.6pt 4pt;border-bottom:.4pt solid #e1e5e8;vertical-align:top}
tr{break-inside:avoid;page-break-inside:avoid}
td.n,th.n{text-align:right}
.tbl{grid-column:1/-1}
.small{font-size:8.3pt;color:#4a555c}
.rule p{margin:2pt 0}
.cols{display:grid;grid-template-columns:repeat(3,1fr);gap:8pt}
.cols div{background:#f2f6f7;padding:6pt 8pt;border-radius:4pt}
.cols b{display:block;font-size:13pt;font-variant-numeric:tabular-nums}
.cols span{font-size:8pt;color:#5f6b73}
.src{font-size:7.8pt;color:#4a555c;margin-top:3pt}
.block{break-inside:avoid;page-break-inside:avoid}
`

function eyeBlock(e) {
  const t = e.trend
  const tone = t.alert ?? ''
  // Başlangıçla karşılaştırılan değer: son 7 günün ortancası; son 7 günde 3 test yoksa son 3 testin ortancası (trend.js)
  const cur = t.currentWindow === 'last3' ? { label: 'Son 3 test (ortanca)', value: t.current } : { label: 'Son 7 gün (ortanca)', value: t.current7 }
  const rows = e.recent
    .map((r) => `<tr><td>${esc(localStamp(r.date))}</td><td class="n">${esc(lmText(r.logMAR))}</td><td class="n">${esc(decimalVa(r.logMAR))}</td><td>${esc(CONDITION_TEXT[r.correction] ?? '–')}</td><td class="n">${Number.isFinite(r.meanDistanceMm) ? esc(String(Math.round(r.meanDistanceMm / 10))) + ' cm' : '–'}</td></tr>`)
    .join('')
  return `<div class="eye"><div class="eye-sum">
<div class="top"><h3>${esc(e.label)}</h3><span class="status ${tone}">${esc(eyeStatusText(t))}</span></div>
<div>${eyeChartSvg(t.series, t.baseline)}</div>
<div class="kv">
<span>Son ölçüm</span><b>${esc(lmText(e.last.logMAR))} logMAR (≈ ${esc(decimalVa(e.last.logMAR))})</b>
<span>Başlangıç (ortanca)</span><b>${t.baseline != null ? esc(lmText(t.baseline)) : '–'}</b>
<span>${esc(cur.label)}</span><b>${cur.value != null ? esc(lmText(cur.value)) : '–'}</b>
<span>Değişim</span><b>${t.delta != null ? esc(lmChange(cur.value, t.baseline)) : '–'}</b>
<span>Test sayısı</span><b>${e.n}</b>
<span>İlk test</span><b>${esc(fmtDate(e.first))}</b>
<span>Koşul</span><b>${esc(CONDITION_TEXT[t.condition] ?? '–')}</b>
</div>
<p class="msg">${esc([e.message, ...seriesNotes(t), ...droppedNotes(t)].join(' '))}${t.dropped ? ' Seriye girmeyen ölçümler tabloda görünür.' : ''}</p>
</div>
<div class="tbl"><table><thead><tr><th>Tarih</th><th class="n">logMAR</th><th class="n">ondalık</th><th>Koşul</th><th class="n">Mesafe</th></tr></thead><tbody>${rows}</tbody></table>
${e.n > e.recent.length ? `<p class="small">Son ${e.recent.length} test; tamamı CSV dosyasında.</p>` : ''}</div>
</div>`
}

export function reportHtml(m) {
  const who = [
    m.name ? `<span>Ad: <b>${esc(m.name)}</b></span>` : '',
    m.age != null ? `<span>Yaş: <b>${m.age}</b></span>` : '',
    m.from ? `<span>Kayıt aralığı: <b>${esc(fmtDate(m.from))} – ${esc(fmtDate(m.to))}</b> (${m.days} gün)</span>` : '',
  ].join('')
  const eyeSection = m.eyes.length
    ? m.eyes.map(eyeBlock).join('')
    : '<p class="small">Henüz görme testi yok.</p>'
  const metricRows = m.metrics
    .map((c) => `<tr><td>${esc(c.label)}</td><td>${esc(DOMAIN_LABEL[c.domain] ?? '')}</td><td class="n">${c.n}</td><td class="n">${c.method === 'halves' ? 'ort. ' : ''}${esc(num(c.first, c.unit === '/5' ? 1 : 0))} → ${esc(num(c.last, c.unit === '/5' ? 1 : 0))} ${esc(c.unit)}</td><td>${esc(STATUS_TEXT[c.status] ?? '')}</td></tr>`)
    .join('')
  const effectRows = m.effects
    .map((e) => `<tr><td>${esc(e.label)}</td><td>${esc(e.measure)} (/${e.max})</td><td class="n">${e.n}</td><td class="n">${esc(num(e.before))} → ${esc(num(e.after))}</td><td class="n">${esc(signed(e.better === 'down' ? -e.gain : e.gain))}${e.n >= 3 && e.lo != null ? ` (${esc(num(e.lo))} – ${esc(num(e.hi))})` : ''}</td><td>${e.sig ? 'belirgin' : 'belirsiz'}</td></tr>`)
    .join('')
  const w = m.who5
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nefona · Kişisel takip özeti</title><style>${CSS}</style></head><body>
<div class="head"><div><div class="brand">NEFONA</div><h1>Kişisel takip özeti</h1></div><div class="meta">Oluşturma: ${esc(fmtDate(m.generatedAt))}<br>Telefonda yapılan kendi kendine ölçümler</div></div>
<div class="who">${who}</div>
<p class="note">Bu belge, kişinin kendi telefonunda yaptığı ölçümlerin özetidir. Tanı koymaz ve göz muayenesinin yerini tutmaz. Yöntem ve sınırlar son bölümde.</p>

<section><h2>Yakın görme · ekranda E testi (logMAR, küçük = daha iyi)</h2>
<p class="small">Noktalar tek testlerdir. Gri bant: başlangıç ortancası ±0,10 logMAR (nasıl kurulduğu: Uyarı kuralı; kurulana dek geçici değer). Bant değişim eşiğidir, tek testin oynaması değildir: kural art arda son 3 teste, sık ölçümde ayrıca son 7 günün ortancasına bakar (bkz. Uyarı kuralı). Sağ göz, sol göz ve iki göz ayrı değerlendirilir. E testi haftada birdir (sağ, sol, iki göz); sağ ve sol göz için kısa test isteğe bağlıdır.</p>
${eyeSection}</section>

<section class="block rule"><h2>Uyarı kuralı</h2>
<p><b>Başlangıç:</b> ilk 7 gün (ilk haftalık test) alışma dönemidir, değerlendirilmez. Haftalık ölçümde başlangıç, 8. günden sonraki ilk testlerin (en az 3) ortancasıdır: 3 haftalık test tamamlanınca, en erken 22. günde hazır olur; sonra 7 teste kadar büyür. Büyürken değerlendirilen son 3 test başlangıca katılmaz; ilk haftalarda (haftada bir testte 22.–36. günler) son 3 test başlangıç testlerini de içerir. Son 3 testin her biri başlangıçtan en az ${esc(decimalTr(YELLOW_DELTA, 2))} kötü olunca büyüme durur; iyileşmede sürer. Haftada bir testte ilk uyarı en erken 36. günde çıkabilir (art arda üçüncü kötü test). Her gün test edenlerde başlangıç, 8. günden itibaren en az 7 testin ortancasıdır; pencere en erken 21. güne kadar sürer (21. günde 7 test yoksa 7. teste kadar uzar). Hangisi önce hazırsa o kullanılır.</p>
<p><b>Sarı:</b> art arda son 3 testin her biri başlangıçtan en az ${esc(decimalTr(YELLOW_DELTA, 2))} logMAR kötü ve son 7 günün ortancası (son 7 günde 3 test yoksa son 3 testin ortancası) da en az bu kadar kötü → ışık ve mesafe kontrol edilir; sonraki testlerde de sürerse göz doktoruna danışılır.</p>
<p><b>Kırmızı:</b> son 7 günde en az 3 test var, ilki en az 6 gün önce yapılmış ve hepsi başlangıçtan en az ${esc(decimalTr(RED_DELTA, 2))} logMAR kötü → göz doktoruna başvurulur. Haftalık ölçümde ve seyrek seride (son 7 günde 3 test yoksa) kural son testle biten 7 güne, orada 3 test yoksa son 3 teste uygulanır; ilki sonuncudan en az 6 gün önce olmalı.</p>
<p><b>İyileşme:</b> sarı kuralın ters yönü (bir kısmı teste alışmaktan olabilir).</p>
<p>Yalnız aynı seri karşılaştırılır. Seriyi son test belirler: aynı ölçüm yöntemi sürümü, aynı mesafe ölçümü (kamerayla / kamerasız, 40 cm varsayılarak) ve aynı gözlük/lens koşulu; gözlük yenilendiyse o testten sonrası. Eski yöntemle (descent-zest-v4 öncesi) kamerayla yapılan ölçümlerde ortalama mesafe de seriyi ayırır: ${BAND_MIN_MM / 10}–${BAND_MAX_MM / 10} cm'deki, ${BAND_MIN_MM / 10} cm'den yakın ve ${BAND_MAX_MM / 10} cm'den uzak ölçümler üç ayrı seridir. Ani görme kaybı, perde inmesi, ışık çakması ya da ağrıda beklenmeden başvurulmalı.</p>
<p class="src">"Art arda 3 test" yaklaşımı, akıllı telefonla evde görme takibinde yanlış alarmı azaltmak için kullanılan kuraldan uyarlandı (farklı test: hiperkeskinlik): Faes L ve ark. 2021, Eye (Lond) 35(11):3035-3040. doi:10.1038/s41433-020-01356-2 · Eşikler (ETDRS çizelgesiyle, sağlıklı gönüllülerde, okuma mesafesi değiştirilerek: 0,20 güvenle ayrılır, 0,10 ayrılmaz; telefon testinde oynama daha büyük olabilir): Rosser DA ve ark. 2003, Invest Ophthalmol Vis Sci 44(8):3278-81. doi:10.1167/iovs.02-1100 · Haftalık başlangıcın 3 testle kurulup 7 teste büyümesi varsayımdır: kendi simülasyonumuzla seçildi, klinik olarak doğrulanmadı.</p>
</section>

<section class="block"><h2>Düzen</h2>
<div class="cols"><div><b>${m.practice.activeDays ?? 0}</b><span>aktif gün</span></div><div><b>${m.practice.minutes ?? 0}</b><span>dakika uygulama</span></div><div><b>${m.practice.streakDays ?? 0}</b><span>gün seri</span></div></div>
</section>

${w.n ? `<section class="block"><h2>İyi oluş · WHO-5 (0–100, son iki hafta)</h2><p>Son puan <b>${w.last}</b>${w.delta != null ? `, ilk ölçümden bu yana ${esc(signed(w.delta, 0))} (${esc(STATUS_TEXT[w.status] ?? '')})` : ''}; ${w.n} ölçüm. 10 puan ve üstü değişim anlamlı kabul edilir; 52 altı düşük iyi oluş (tanı değildir).</p>
<p class="src">Topp CW ve ark. 2015, Psychother Psychosom 84(3):167-176. doi:10.1159/000376585 · Türkçe geçerlilik: Eser E ve ark. 2019, Prim Health Care Res Dev 20:e100. doi:10.1017/S1463423619000343</p></section>` : ''}

${metricRows ? `<section class="block"><h2>Diğer ölçümler</h2><table><thead><tr><th>Ölçüm</th><th>Alan</th><th class="n">n</th><th class="n">ilk → son</th><th>Değerlendirme</th></tr></thead><tbody>${metricRows}</tbody></table>
<p class="small">"ort.": 6 ve üstü ölçümde ilk yarının ve son yarının ortalaması; fark %95 güven aralığıyla sınanır (sıfırı içermiyorsa değişim var). Yayımlanmış eşik varsa o kullanılır.</p></section>` : ''}

${effectRows ? `<section class="block"><h2>Uygulama öncesi → sonrası (kişinin kendi puanı)</h2><table><thead><tr><th>Uygulama</th><th>Ölçü</th><th class="n">oturum</th><th class="n">ortalama önce → sonra</th><th class="n">iyileşme (%95 GA)</th><th></th></tr></thead><tbody>${effectRows}</tbody></table>
<p class="small">Kontrol grubu yok: beklenti ve yalnızca mola vermenin etkisi ayrılamaz. "Belirgin": en az 3 oturum ve güven aralığı sıfırı içermiyor.</p></section>` : ''}

<section class="block"><h2>Yöntem ve sınırlar</h2>
<p class="small">Görme: telefon ekranında dört yöne dönen E harfi; sağ ve sol göz ayrı ayrı (diğeri kapatılarak), haftalık testte ayrıca iki göz birlikte. Harf boyutu uyarlamalı yöntemle (iniş + ZEST, Bayes eşik tahmini) ayarlanır; sonuç logMAR. Hedef mesafe 40 cm; destekleyen iPhone'larda mesafe ön kamerayla (TrueDepth) ölçülür ve harf boyutu ölçülen mesafeye göre hesaplanır. "ondalık" sütunu 10<sup>−logMAR</sup> dönüşümüdür.</p>
<p class="small">Deneme sayısı (göz başına): kısa testte (eski adı günlük test) 14–20, haftalık testte 28 (eski yöntemle yapılan kayıtlarda 20–28). Yeni yöntemde (descent-zest-v4) sayılan harfler yalnız telefon 36–44 cm'deyken alınır; kamerasız ölçümde mesafe ölçülmez, 40 cm varsayılır.</p>
<p class="small">Tekrarlanabilirlik: benzer tablet ve telefon yakın testlerinde, klinikte ve gözetim altında, iki test arasındaki farkın %95 sınırı ±0,13–0,24 logMAR (çoğunda yaklaşık ±0,2); ev koşulunda ölçülmedi, daha geniş olabilir. Joseph A ve ark. 2023, Ophthalmol Ther 13(1):409-422, doi:10.1007/s40123-023-00854-2 · Katibeh M ve ark. 2022, Transl Vis Sci Technol 11(12):18, doi:10.1167/tvst.11.12.18 · Han X ve ark. 2019, Transl Vis Sci Technol 8(4):27, doi:10.1167/tvst.8.4.27</p>
<p class="small">Sınırlar: ışık, ekran parlaklığı, yorgunluk, dikkat ve mesafe sonucu etkiler; tek bir test yorumlanmamalı, eğilime bakılmalı. Yakın mesafe ölçümüdür; uzak ETDRS değerleriyle doğrudan karşılaştırılmamalıdır. Ölçümler klinik bir cihazla yapılmamıştır.</p>
</section>
</body></html>`
}

export const reportFilename = (now = new Date()) => `nefona-rapor-${fileStamp(new Date(now))}.pdf`
export const csvFilename = (now = new Date()) => `nefona-veriler-${fileStamp(new Date(now))}.csv`
