// Gelişim merkezi: tek çıkış (gelisim-merkezi PLAN.v1 §3.1, DEVIR §2). Gelişim başı (GrowthHead, G2), alan ayrıntısı,
// raporlar, Ana sayfa ve bildirim (G3) alan hükmünü ve ölçüm metnini yalnız buradan okur; kendi başına hüküm kurmaz
// (DENETIM K1: aynı satırda iki zıt hüküm).
//
// Beş alan ← yedi iç alan (plan §3.2): Göz ← eye; Dikkat ← focus + awareness; Nefes ← calm; Ruh hâli ← wellbeing + self;
// Hareket ← body (+ Apple Sağlık adımlı günler, Ö-9). İç alanlar, growthMap, hub, iris haritası ve HomeMap aynen kalır;
// bu modül onları çağırır, değiştirmez.
//
// Alan hükmü (verdict) yalnız dört değerdir (DEVIR §1.3 ve §1.8; maket v6 WORD): 'better' (başlangıcından iyi, TAM
// parlar), 'same' (değişim yok), 'unclear' (henüz belli değil), 'start' (başlangıç). PLAN §3.1'den sapma (bilerek):
// plan 'better' | 'worse' | 'mixed' | null der; bağlayıcı DEVIR ekranda yalnız dört sözcüğe izin verir. Doğrulanmış
// gerileme ve "karışık" bu yüzden 'unclear' olur ve `down` ya da `mixed` işaretiyle gelir (görsel hiçbir zaman veriden
// iyi bir durum anlatmaz). Gerilemede (`down`) hüküm sözcüğü yazılmaz (word null): yalnız sayı (çip değeri) görünür;
// "henüz belli değil" doğrulanmış bir düşüşün yanında yanlış bilgi olurdu (5. gün raporunun WHO-5 satırı da böyle).
// AÇIK SORU (sahibe): gerilemenin ekrandaki sözü; cevap gelene dek sözcüksüz. Göz sarı/kırmızı uyarısı `eye.alert`'tedir
// ve ekranda ayrı kart olur (plan §2.2).
//
// Hüküm kuralı tek yerden: iç alan hükmü lib/dataHub.js changeDetail (göz uyarısı ve WHO-5 düşüşü önde; better + worse
// → karışık; yoga hükme girmez; etkiler son 28 gün). Beş alanın hükmü iç alanlarınkinden aynı kuralla (plan §3.3).
// 'better' dışındaki üç hüküm, alandaki ölçümlerin durumundan: biri 'same' ise 'same'; değilse biri 'unclear' ise
// 'unclear'; değilse biri 'start' ise 'start'; ölçümü olmayan ama kaydı olan alan 'unclear'; hiç kaydı olmayan 'start'.
//
// Ölçüm metni (areas[k].value) tek metin işlevinden (lib/changeText.js): "E testi 0,20 → 0,20", "4 → 6 harf",
// "+1,3 sakinlik", "İyi oluş 56 → 68", "Bugün 7.080 adım". Değer, hükmü taşıyan ölçümden seçilir (better ise iyileşen
// ölçüm; gerileme ise gerileyen ölçüm, sözcüksüz). word: hüküm sözcüğü (verdictWord; gerilemede null). line: çipin
// okunan metni, maketteki aria-label biçimiyle ("Dikkat: 4 → 6 harf, başlangıcından iyi").
//
// Gizlilik: adım sayısı yalnız bu çıktıda (telefonda, bellekte) durur; depoya yazılmaz, Nef paketine girmez (plan §3.4,
// §7). Kamera açılmaz; kırpma sayısı kayıtlı İlk Bakış'tan.
import { growthMap, changeDetail, stepDays, calendarDays, WINDOW_DAYS } from './dataHub.js'
import { FEEL_ONLY_MODULES } from './progress.js'
import { changeText, effectChangeText, verdictWord } from './changeText.js'
import { normalizeProfile, STRESS_NOW, SELF_AGREE, SLEEP_MAX, ACTIVITY_DAYS_MAX } from './profile.js'
import { ANSWER_FIELDS, snapshot, recheckDue, RECHECK_DAYS } from './iris.js'
import { dayKey } from './calendar.js'

export const AREAS = ['goz', 'dikkat', 'nefes', 'ruh', 'hareket']
export const AREA_LABEL = { goz: 'Göz', dikkat: 'Dikkat', nefes: 'Nefes', ruh: 'Ruh hâli', hareket: 'Hareket' }
export const AREA_DOMAINS = { goz: ['eye'], dikkat: ['focus', 'awareness'], nefes: ['calm'], ruh: ['wellbeing', 'self'], hareket: ['body'] }
export const DOMAIN_AREA = Object.fromEntries(Object.entries(AREA_DOMAINS).flatMap(([a, ds]) => ds.map((d) => [d, a])))

// Evre (plan §13 "Evre kenarları"): ilk kayıttan geçen takvim günü; 1–7 ilk hafta (pencere 7), 8–28 ilk ay, sonra son
// 28 gün. Ara vermek evreyi değiştirmez. Kayıt yoksa 'week'.
export const WEEK_DAYS = 7
export function phaseOf(sinceStart) {
  if (sinceStart <= WEEK_DAYS) return { phase: 'week', win: WEEK_DAYS }
  if (sinceStart <= WINDOW_DAYS) return { phase: 'month', win: WINDOW_DAYS }
  return { phase: 'rolling', win: WINDOW_DAYS }
}
// Pencerenin adı her yerde yazılır (Kü-5): başlangıç pencerenin içindeyse "başladığından beri", değilse "son 28 gün"
export const windowLabel = (sinceStart) => (sinceStart <= WINDOW_DAYS ? 'başladığından beri' : `son ${WINDOW_DAYS} gün`)

// Ölçümün durumu → sıralama (değer seçiminde)
const KIND_ORDER = {
  goz: ['eye', 'metric', 'blink', 'effect', 'answer'],
  dikkat: ['metric', 'effect', 'answer'],
  nefes: ['effect', 'metric', 'answer'],
  ruh: ['who5', 'metric', 'effect', 'answer'],
  hareket: ['steps', 'metric', 'effect', 'answer'],
}
const EYE_STATE = { familiarization: 'start', baseline: 'start' }

const feelOnly = (x) => FEEL_ONLY_MODULES.has(x?.module)
// Önce → sonra etkisinin durumu (tek yer; PDF'in etki sütunu da bunu okur, lib/exportData.js): 3 oturumdan az 'start';
// belirgin (≥ 3 oturum, güven aralığı sıfırı içermiyor) ise yönüyle 'better' / 'worse'; belirgin değilse 'unclear'
// ("henüz belli değil"; aralık sıfırı içeriyor: değişim de yokluğu da gösterilmedi)
export const effectState = (e) => ((e?.n ?? 0) < 3 ? 'start' : e.sig ? (e.gain > 0 ? 'better' : e.gain < 0 ? 'worse' : 'same') : 'unclear')

function eyeState(e) {
  if (!e || !e.eye) return null
  if (e.alert === 'red' || e.alert === 'yellow' || e.trend === 'worsening') return 'worse'
  if (e.phase !== 'tracking') return EYE_STATE[e.phase] ?? 'start'
  return e.trend === 'improving' ? 'better' : 'same'
}

function metricValue(m) {
  const v = m.v2 ?? {}
  const evaluated = m.verdict === 'better' || m.verdict === 'worse' || m.verdict === 'same'
  return evaluated && Number.isFinite(v.baseline) && Number.isFinite(v.current)
    ? changeText({ from: v.baseline, to: v.current, unit: m.unit, better: m.better })
    : changeText({ to: v.latest ?? m.last, unit: m.unit, better: m.better })
}

// Kırpma (DEVIR §2): profile.iris.baseline.blinks / recheck.blinks (20 sn'deki sayı); başlangıç kaydı yoksa İlk Bakış'ın
// kendisi (eski kurulum, Kü-3). Yöntem (Kü-9): anlık görüntünün blinkMethod'u (lib/iris.js snapshot), yoksa İlk Bakış'ın
// yöntemi (eski kayıt; VARSAYIM: başlangıç anlık görüntüsü İlk Bakış'ın o günkü sayısıdır). comparable: başlangıç ve
// 28. gün aynı yöntemle ölçüldü mü; değilse ya da biri bilinmiyorsa iki sayı yan yana konmaz (false). method: gösterilen
// sayının (count) yöntemi.
export function blinkOf(profile) {
  const p = normalizeProfile(profile ?? {})
  const fl = p.firstLook ?? null
  const num = (v) => (Number.isFinite(v) ? v : null)
  const b = p.iris?.baseline ?? null
  const r = p.iris?.recheck ?? null
  const baseline = num(b?.blinks) ?? num(fl?.blinks)
  const recheck = num(r?.blinks)
  if (baseline == null && recheck == null) return null
  const seconds = Number.isFinite(fl?.seconds) && fl.seconds > 0 ? fl.seconds : 20
  const baselineMethod = b?.blinkMethod ?? (num(b?.blinks) == null || r == null ? fl?.method ?? null : null)
  const recheckMethod = recheck == null ? null : r?.blinkMethod ?? null
  const comparable = baseline != null && recheck != null && baselineMethod != null && baselineMethod === recheckMethod
  return { baseline, recheck, seconds, method: recheck != null ? recheckMethod : baselineMethod, baselineMethod, recheckMethod, comparable, count: recheck ?? baseline }
}

// Başlangıç soruları (Kü-3): iris başlangıç kaydı (profile.iris.baseline) ve 28. gün (recheck) varsa onlardan; başlangıç
// kaydı olmayan eski kurulumda profildeki son cevaplardan (lib/iris.js snapshot; tarih yok). Merkez (hub, growthMap)
// bilerek değişmez: cevap orada gün ve "veri var" sayıldığı için eski kuruluma eklemek eşdeğerliğin çekirdeğini
// (days/strip/hasData) değiştirirdi (PLAN §8.4). Ekran yalnız buradan okur; cevap hükme girmez ('start'; yeniden
// sorulunca bile kural yok: VERI.md "yeniden sorulunca", karar sahibin), yalnız alanın başlangıç değerini verir.
// Kırpma (blinks) blinkOf'ta. Döner: [{ key, domain, label, from, to }]
export function answersOf(profile) {
  const p = normalizeProfile(profile ?? {})
  const b = p.iris?.baseline ?? null
  const r = p.iris?.recheck ?? null
  const fallback = b ? null : snapshot(p)
  const num = (v) => (Number.isFinite(v) ? v : null)
  return ANSWER_FIELDS.filter((f) => f.key !== 'blinks').map((f) => {
    const from = num(b ? b[f.key] : fallback[f.key])
    const to = num(r?.[f.key])
    return { key: f.key, domain: f.domain, label: f.label, from: from ?? to, to: from != null && to != null ? to : null }
  }).filter((a) => a.from != null)
}

// Bugünün adımı (App.jsx health: stepRows son 60 gün, today son satır). Bugünün satırı yoksa null.
function todaySteps(health, now) {
  if (!health?.hasData) return null
  const key = dayKey(new Date(now))
  const rows = Array.isArray(health.stepRows) ? health.stepRows : []
  const row = rows.find((r) => r?.date === key) ?? (health.today?.date === key ? health.today : null)
  return row && Number.isFinite(row.steps) ? row.steps : null
}

// Başlangıç sorularının ölçeği (lib/profile.js): ham dizin yazılmaz. Seçenekli soruda seçeneğin sözcüğü ("Stres: Epey →
// Biraz"), sayılı soruda ölçeğiyle ("Uyku 8/10", "Hareketli gün 3 → 5/7"). Yön (iyi/kötü) yazılmaz: karşılaştırma kuralı yok.
const ANSWER_SCALE = { stressNow: { words: STRESS_NOW }, selfCompassion: { words: SELF_AGREE }, sleep: { max: SLEEP_MAX }, activityDays: { max: ACTIVITY_DAYS_MAX } }
function answerText(a) {
  const sc = ANSWER_SCALE[a.key] ?? {}
  const from = a.to != null ? a.from : null
  const to = a.to ?? a.from
  if (sc.words) {
    const w = (i) => sc.words[i] ?? null
    if (w(to) == null) return { text: '', from: null, to: null, delta: null, deltaText: '', good: null }
    return { text: `${a.label}: ${from != null && w(from) != null ? `${w(from)} → ` : ''}${w(to)}`, from, to, delta: null, deltaText: '', good: null }
  }
  return { ...changeText({ from, to, unit: sc.max != null ? `/${sc.max}` : '', digits: 0, prefix: a.label }), good: null }
}

// Alanın ölçümleri: [{ kind, key, label, state, n, value }]
function measuresOf(area, map, ctx) {
  const out = []
  for (const d of AREA_DOMAINS[area]) {
    const s = map.domains[d]?.summary
    if (!s) continue
    for (const m of s.metrics ?? []) {
      if (feelOnly(m) || !m.verdict) continue
      out.push({ kind: 'metric', key: m.key, label: m.label, state: m.verdict, n: m.v2?.measureDays ?? m.n, value: metricValue(m) })
    }
    for (const e of s.effects ?? []) {
      if (feelOnly(e)) continue
      out.push({ kind: 'effect', key: e.key, label: `${e.label} · ${e.measure}`, state: effectState(e), sig: e.sig === true, n: e.n, value: effectChangeText(e) })
    }
    if (d === 'eye') {
      const st = eyeState(s.eye)
      if (st) {
        const e = s.eye
        const value = e.phase === 'tracking' && Number.isFinite(e.baseline)
          ? changeText({ from: e.baseline, to: e.current, unit: 'logMAR', better: 'down', prefix: 'E testi', showUnit: false })
          : changeText({ to: e.current, unit: 'logMAR', better: 'down', prefix: 'E testi', showUnit: false })
        out.push({ kind: 'eye', key: `va-${e.eye}`, label: 'E testi', state: st, n: e.n, value })
      }
      if (ctx.blink) {
        const b = ctx.blink
        out.push({ kind: 'blink', key: 'blink', label: 'İlk Bakış kırpma', state: 'start', n: b.recheck != null ? 2 : 1, value: { text: `${b.seconds} sn'de ${b.count} kırpma`, from: null, to: b.count, delta: null, deltaText: '', good: null } })
      }
    }
    if (d === 'wellbeing' && s.who5?.n > 0) {
      const w = s.who5
      out.push({ kind: 'who5', key: 'who5', label: 'İyi oluş (WHO-5)', state: w.verdict ?? 'start', n: w.n, value: changeText({ from: w.n > 1 ? w.first : null, to: w.last, unit: '/100', prefix: 'İyi oluş', showUnit: false }) })
    }
    for (const a of ctx.answers) {
      if (a.domain !== d) continue
      // Cevabın iyi/kötü yönü yazılmaz (good: null): soruların karşılaştırma kuralı yok
      out.push({ kind: 'answer', key: `answer-${a.key}`, label: a.label, state: 'start', n: a.to != null ? 2 : 1, value: answerText(a) })
    }
    // Adım: bugün adım kaydı yoksa (0: izin yok, veri gelmedi ya da gün yeni başladı) ölçüm üretilmez; "Bugün 0 adım"
    // kişinin hiç yürümediğini söylüyor gibi okunurdu. Adımlı gün hiç yoksa (stepDaysN 0) da yok.
    if (d === 'body' && ctx.steps > 0 && ctx.stepDaysN > 0) {
      // Adımın karşılaştırma kuralı yok (plan §3.4): kendi ortancası 7 adımlı günle kurulana dek 'start', sonra 'unclear'
      out.push({ kind: 'steps', key: 'steps', label: 'Apple Sağlık adımı', state: ctx.stepDaysN < 7 ? 'start' : 'unclear', n: ctx.stepDaysN, value: { text: `Bugün ${changeText({ to: ctx.steps, unit: 'adım', showUnit: false }).text} adım`, from: null, to: ctx.steps, delta: null, deltaText: '', good: null } })
    }
  }
  return out
}

const RANK = { better: 0, worse: 0, same: 1, unclear: 2, start: 3 }

function areaOf(area, map, ctx) {
  const doms = AREA_DOMAINS[area].map((d) => map.domains[d])
  const details = doms.map((x) => changeDetail(x.summary))
  const ms = measuresOf(area, map, ctx)
  const hasData = doms.some((x) => x.summary?.hasData || x.days > 0) || ms.length > 0
  // Hüküm sırası başlangıç sorularını saymaz (Kü-3): yalnız cevabı olan alan 'start'; kaydı (oturum, test, WHO-5,
  // alışkanlık, adım) olan ama ölçümü olmayan alan 'unclear'
  const vm = ms.filter((m) => m.kind !== 'answer')
  const s0 = (x) => x.summary ?? {}
  const hasRecords = vm.length > 0 || doms.some((x) => (s0(x).records?.total ?? 0) > 0 || (s0(x).habits?.total ?? 0) > 0 || (s0(x).who5?.n ?? 0) > 0 || (s0(x).metrics?.length ?? 0) > 0 || (s0(x).effects?.length ?? 0) > 0 || x.sources.length > 0) || (area === 'hareket' && (ctx.stepDays ?? 0) > 0)
  const anyUp = details.some((x) => x.status === 'up')
  const anyDown = details.some((x) => x.status === 'down')
  const first = details.some((x) => x.first)
  let verdict
  let down = false
  let mixed = false
  if (first || (anyDown && !anyUp)) (verdict = 'unclear'), (down = true)
  else if (details.some((x) => x.mixed) || (anyDown && anyUp)) (verdict = 'unclear'), (mixed = true)
  else if (anyUp) verdict = 'better'
  else if (vm.some((m) => m.state === 'same')) verdict = 'same'
  else if (vm.some((m) => m.state === 'unclear')) verdict = 'unclear'
  else if (vm.some((m) => m.state === 'start')) verdict = 'start'
  else verdict = hasRecords ? 'unclear' : 'start'
  // Değer: hükmü taşıyan ölçüm (better → iyileşen; gerileme → gerileyen), sonra durum sırası, belirgin etki ve metrik
  // belirgin olmayan etkiden önce, ölçüm türü, veri miktarı; metni boş ölçüm en sonda
  const want = verdict === 'better' ? 'better' : down ? 'worse' : verdict
  const order = KIND_ORDER[area]
  const weak = (m) => (m.kind === 'effect' && !m.sig ? 1 : 0)
  const lead = [...ms].sort((a, b) =>
    (a.value.text ? 0 : 1) - (b.value.text ? 0 : 1) ||
    (a.state === want ? 0 : 1) - (b.state === want ? 0 : 1) ||
    (RANK[a.state] ?? 9) - (RANK[b.state] ?? 9) ||
    weak(a) - weak(b) ||
    order.indexOf(a.kind) - order.indexOf(b.kind) ||
    (b.n ?? 0) - (a.n ?? 0))[0] ?? null
  const value = lead && lead.value.text ? { ...lead.value, kind: lead.kind, key: lead.key, label: lead.label, state: lead.state } : null
  // Gerilemede sözcük yok (yalnız sayı); öbür durumlarda dört sözcükten biri
  const word = down ? null : verdictWord(verdict)
  // Düzen: iç alanların şeritleri birleşik (gün sayar); pencere evreye göre (ilk hafta 7, sonra 28)
  const strip = doms[0].strip.map((_, i) => doms.some((x) => x.strip[i]))
  const recent = strip.slice(-ctx.win)
  const days = recent.filter(Boolean).length
  // Kaynaklar: iç alanlarınki birleşik, gün olarak (Ö-5). VARSAYIM: bir kaynak anahtarı aynı alanın iki iç alanında
  // geçmez (bugünkü eşlemede geçmiyor); geçerse gün sayıları toplanır.
  const src = new Map()
  for (const x of doms) for (const s of x.sources) {
    const y = src.get(s.key)
    src.set(s.key, y ? { ...y, n: y.n + s.n, days: y.days + s.days } : { ...s })
  }
  return {
    key: area,
    label: AREA_LABEL[area],
    domains: AREA_DOMAINS[area],
    verdict,
    word,
    line: [AREA_LABEL[area], [value?.text, word].filter(Boolean).join(', ')].filter(Boolean).join(': '),
    ...(down ? { down: true } : {}),
    ...(mixed ? { mixed: true } : {}),
    value,
    measures: ms.map((m) => ({ kind: m.kind, key: m.key, label: m.label, state: m.state, n: m.n, text: m.value.text })),
    days,
    frac: days / ctx.win,
    days28: strip.filter(Boolean).length,
    today: strip.at(-1) === true,
    strip,
    sources: [...src.values()].sort((a, b) => b.days - a.days || b.n - a.n),
    hasData,
    ...(area === 'hareket' && ctx.live ? { live: ctx.live } : {}),
  }
}

// Nef'in tek cümlesi (PLAN §4.4 ve §13: onaylı SONSUZ_YOL §3.F.4 sırası, "ilk tutan kazanır"; bu plan yalnız canlı
// yürüyüş satırını ekler). Burada yalnız şablon anahtarı ve değişkenleri üretilir; cümlenin metni G2'de onaylı F.4
// örneklerinden yazılır (yeni cümle bu aşamada yok). Değişkenlerde adım SAYISI yoktur (plan §3.4, §7: Nef'e gitmez).
// F.4'ün buradan hesaplanabilen basamakları:
//   0 eyeAlert  kırmızı/sarı görme uyarısı (cümle yok; uyarı kartı)
//   – walk      yürüyüş eşliği sürüyor (B3; G4)
//   1 firstDay  ilk kaydın günü ya da ertesi (sinceStart 1–2) ve İlk Bakış kırpması var
//   2 milestone iris haritası yeniden sorma günü geldi (lib/iris.js recheckDue; "Bugün 28. gün")
//   3 returned  bugünden önceki son kayıtlı günle bugün arasında en az LONG_GAP_DAYS kayıtsız gün (plan §13: tek eşik 3;
//               kayıt: test, oturum, mola/su/alarm; Apple Sağlık adımı uygulama kullanımı değildir, sayılmaz)
//   5 newChange "başlangıcından iyi" olan ilk alan (AREAS sırası)
//   8 soon      iris yeniden sorma ≤ 3 gün sonra
//   9 suggest   hiçbiri (bugünkü homeSuggest satırı)
// VARSAYIM / AÇIK (G2–Y3): F.4'ün 2. basamağındaki "haftalık E testi günü", 4 (dün bir ilk ya da rekor), 6 (bugün yeni
// basamak/modül) ve 7 (dün yol tamamdı) bu girdilerden hesaplanamaz (yol ve modül geçmişi gerekir); "yeni" doğrulanmış
// değişim geçmiş ister, burada bugün 'better' olan alan alınır; "aynı basamak iki gün üst üste gelmez" kuralı geçmiş
// ister (day-open.lead, Y3) ve çağıranındır.
export const LONG_GAP_DAYS = 3
function lastRecordBefore({ tests, sessions, habits }, now) {
  const today = dayKey(new Date(now))
  let best = null
  const see = (date) => {
    const t = new Date(date).getTime()
    if (!Number.isFinite(t)) return
    const k = dayKey(new Date(t))
    if (k < today && (best == null || k > best)) best = k
  }
  for (const x of [...tests, ...sessions]) if (x != null && typeof x === 'object') see(x.date)
  for (const h of habits) if (h != null && typeof h === 'object') see(h.at)
  return best
}
function nefOf({ eye, live, sinceStart, blink, areas, profile, now, records }) {
  if (eye.alert === 'red' || eye.alert === 'yellow') return { sentenceKey: 'eyeAlert', step: 0, vars: { alert: eye.alert } }
  if (live) return { sentenceKey: 'walk', step: null, vars: { minutes: live.minutes, cadence: live.cadence } }
  if (sinceStart >= 1 && sinceStart <= 2 && blink) return { sentenceKey: 'firstDay', step: 1, vars: { blinks: blink.count, seconds: blink.seconds, recheckDay: RECHECK_DAYS } }
  const p = normalizeProfile(profile ?? {})
  const base = p.iris?.baseline ?? null
  if (base && !p.iris?.recheck && recheckDue(p, now)) return { sentenceKey: 'milestone', step: 2, vars: { what: 'irisRecheck', day: RECHECK_DAYS } }
  const prev = lastRecordBefore(records, now)
  if (prev) {
    const [y, m, d] = prev.split('-').map(Number)
    const gap = calendarDays(new Date(y, m - 1, d, 12), now) - 1
    if (gap >= LONG_GAP_DAYS) return { sentenceKey: 'returned', step: 3, vars: { gapDays: gap } }
  }
  const up = AREAS.find((a) => areas[a].verdict === 'better')
  if (up) return { sentenceKey: 'newChange', step: 5, vars: { area: up, label: areas[up].label, measure: areas[up].value?.label ?? null, value: areas[up].value?.text ?? null } }
  if (base && !p.iris?.recheck) {
    const left = Math.ceil((new Date(base.date).getTime() + RECHECK_DAYS * 86400000 - new Date(now).getTime()) / 86400000)
    if (left >= 1 && left <= 3) return { sentenceKey: 'soon', step: 8, vars: { what: 'irisRecheck', inDays: left } }
  }
  return { sentenceKey: 'suggest', step: 9, vars: {} }
}

// walk (G4, B3): yürüyüş eşliği sürerken { active: true, meters, steps, minutes, cadence }. Hükmü değiştirmez.
export function growthCenter({ tests = [], sessions = [], profile = null, habits = [], health = null, walk = null, now = new Date() } = {}) {
  const map = growthMap({ tests, sessions, profile, habits, health, now, sourceDays: true })
  const sinceStart = map.sinceStart
  const { phase, win } = phaseOf(sinceStart)
  const blink = blinkOf(profile)
  const steps = todaySteps(health, now)
  // adımlı gün sayısı (tarihi okunan, adımı > 0 satır) merkezin kendi hesabından (dataHub stepDays; tek hesap)
  const { stepDaysN } = stepDays(health)
  const live = walk?.active ? { kind: 'walk', meters: walk.meters ?? null, steps: walk.steps ?? null, minutes: walk.minutes ?? null, cadence: walk.cadence ?? null } : null
  const ctx = { win, blink, steps, stepDaysN, stepDays: map.steps?.countedDays ?? 0, live, answers: answersOf(profile) }
  const areas = Object.fromEntries(AREAS.map((a) => [a, areaOf(a, map, ctx)]))
  const eye = map.domains.eye.summary?.eye ?? null
  const who5 = map.domains.wellbeing.summary?.who5 ?? null
  const all = (k) => Object.values(map.domains).flatMap((x) => (x.summary?.[k] ?? []).map((y) => ({ ...y, area: DOMAIN_AREA[x.domain] })))
  // Göz: tek "şimdi" değeri (K2): current ve penceresi (currentWindow 'last3' son 3 test, 'days7' son 7 gün). Tek test
  // (last) ve current7 bilerek yok.
  const eyeOut = eye && eye.eye
    ? { eye: eye.eye, n: eye.n, phase: eye.phase, alert: eye.alert, trend: eye.trend ?? null, baseline: eye.baseline, current: eye.current, currentWindow: eye.currentWindow, delta: eye.delta, message: eye.message }
    : { eye: null, phase: eye?.phase ?? 'empty', alert: null, trend: null, baseline: null, current: null, currentWindow: null, delta: null, message: eye?.message ?? null }
  const records = { tests: Array.isArray(tests) ? tests : [], sessions: Array.isArray(sessions) ? sessions : [], habits: Array.isArray(habits) ? habits : [] }
  return {
    now: new Date(now).toISOString(),
    sinceStart,
    phase,
    win,
    windowLabel: windowLabel(sinceStart),
    hasData: AREAS.some((a) => areas[a].hasData),
    order: AREAS,
    areas,
    eye: eyeOut,
    blink,
    who5: who5 && who5.n ? { n: who5.n, first: who5.first, last: who5.last, delta: who5.delta, status: who5.status, verdict: who5.verdict, low: who5.low, due: who5.due } : { n: 0, verdict: null, due: who5?.due ?? true },
    // status yerinde kalır (eşdeğerlik); ekranlar verdict okur. feelOnly: yoga ("nasıl hissettin"), hükme girmez.
    metrics: all('metrics').map((m) => ({ key: m.key, module: m.module, domain: m.domain, area: m.area, label: m.label, unit: m.unit, better: m.better, n: m.n, status: m.status, verdict: m.verdict, feelOnly: feelOnly(m), baseline: m.v2?.baseline ?? null, current: m.v2?.current ?? null, latest: m.v2?.latest ?? null, measureDays: m.v2?.measureDays ?? 0 })),
    // Son 28 gün, alan özetinden (Ö-3); state: effectState ('start' < 3 oturum | 'better' | 'worse' | 'unclear')
    effects: all('effects').map((e) => ({ ...e, feelOnly: feelOnly(e), state: effectState(e), text: effectChangeText(e).text })),
    steps: health?.hasData ? { today: steps, median: map.steps.median, countedDays: map.steps.countedDays } : null,
    nef: nefOf({ eye: eyeOut, live, sinceStart, blink, areas, profile, now, records }),
  }
}
