// Ana sayfa Nef kartı (Nef PLAN §4.2, §4.5; ANA_OTURUM_ISTEMI N1 madde 6). Saf: girdi → kartın içeriği. Model çağrısı
// yok; cümle yalnız onaylı bankadan (bank/<dil>.js), göz uyarısı lib/coach.js'in sabit metni.
//
// Sahip kararı 2026-10-02: "Kart yalnız güçlü haberde." Kart yalnız iki anda çıkar (CARD_TYPES):
//   - F2.C / F2.D örüntü (effectPattern; en az 3 seans, iyi yönde): ana cümle + önce–sonra çizimi + düğme
//   - metricChange (ilerleme): ana cümle + başlangıç → şimdi çizimi (ölçeğin uçları tanımlıysa) + oyunda düğme
// Öteki bütün anlarda kart yok: F2.A/F2.B tek seans, F1/F3 hava, firstTime, returnAfterGap, F4.C uzun dönüş, F4 sessiz
// gün, pathDone. Düşük WHO-5 gününde de yok (an motoru o gün yalnız lowWho5 kurar; sabit satır Gelişim'de, who5.js).
// Bu anların cümleleri bankada durur ve bildirim tarafı (notify.js planNef) değişmez; yalnız kart kanalında kullanılmaz.
// Seçiciye yalnız izinli anlar gider: gösterilmeyen cümle seçilmez, hafızaya da yazılmaz.
//
// Sıra (plan §4.2: güvenlik ve doktor cümleleri Nef'in dışında, önce):
//   1. Kırmızı ya da sarı göz uyarısı: lib/coach.js fallbackInsight'ın sabit metni, aynen (Bug 25). Bankaya ve hafızaya girmez.
//   2. An motoru (moments.js) + seçici (speak.js), kanal 'card', yalnız CARD_TYPES. Söylenecek haber yoksa kart yok.
// Çıktı: { kind: 'eye' | 'say', label, text, action?, accent?, scale?, say? } ya da null.
//   say: hafızaya yazılacak satır ({ type, key, id, channel: 'card' }).
//   scale: önce–sonra çizimi (M2): { min, max, before, after, better }; before ve after cümleye giren değerler (bank
//     shown: ortalama tam sayıya yuvarlanmış), çizimin etiketi ve noktası cümlede yazanla aynı. Örüntüde uçlar etkinin ölçeği (manifest effects
//     max); ilerlemede metriğin manifestteki tanımlı uçları (progress.metrics min ?? 0, max). Üst ucu tanımlı olmayan
//     metrikte çizgi yok (scale null). accent: ana cümlenin vurgulu parçası.
//   action: düğme { label, route, kind } ya da null. Yazı sahip onaylı kalıptan (bank actions): örüntü kartı "Bugün de
//     Dalga sesi · 8 dk" (kind 'day'; örüntünün dilimi yok); yoga dersinde modül yerine ders adı; oyunun ilerleme kartı
//     "Bugünkü turu oyna · 2 dk" ('play'). Rota ve süre manifestin nef.start'ından (Dalga, yoga), yoksa modülün today()
//     durağından; süre yoksa düğme yok (süresiz kalıp yok). route: dokununca açılan ekran.
import { buildMoments } from './moments.js'
import { speak } from './speak.js'
import { BANKS } from './notify.js'
import { nefContext } from './context.js'
import { moduleLexicon } from './lexicon.js'
import { fallbackInsight } from '../coach.js'
import { registry } from '../../modules/registry.js'
import { dayKey } from '../calendar.js'
import { progressionCtx } from '../progression.js'

const isNum = (v) => typeof v === 'number' && Number.isFinite(v)
// Kartın çıktığı an türleri (sahip kararı 2026-10-02; yukarıda). Hepsinde çizim ve (varsa) düğme.
export const CARD_TYPES = Object.freeze(new Set(['effectPattern', 'metricChange']))
const posInt = (v) => Number.isInteger(v) && v > 0

// Ölçeğin alt ucu: 1–5 ölçekte 1 (Nefes sakinlik, lib/breath.js CALM_SCALE), öteki puanlarda 0. VARSAYIM: manifest
// effects yalnız üst ucu (max) taşıyor.
const scaleMin = (max) => (max === 5 ? 1 : 0)

// Sayılar cümleye giren değerlerle (bank.shown: ortalama tam sayıya, öteki bir ondalığa yuvarlanmış); etiket ve nokta
// konumu cümlede yazanla aynı. Bank shown vermezse çizim yok.
function scaleOf(say, bank) {
  const f = say.facts ?? {}
  if (typeof bank?.shown !== 'function') return null
  if (say.type === 'metricChange') {
    // Uçlar metriğin manifestteki tanımından (registry.js progress.metrics min, max); üst uç yoksa çizgi yok
    const x = registry.metrics().find((m) => m.key === f.metric)
    const min = isNum(x?.min) ? x.min : 0
    const before = bank.shown('başlangıç', f)
    const after = bank.shown('şimdi', f)
    if (!x || !isNum(x.max) || !(x.max > min) || !isNum(before) || !isNum(after)) return null
    return { min, max: x.max, before, after, better: 'up' }
  }
  if (say.type !== 'effectPattern') return null
  const e = registry.effects().find((x) => x.key === f.effect)
  const tpl = templateOf(say, bank)
  let before = null
  let after = null
  if (tpl.includes('{önceOrt')) {
    // "4'ten 6'ya": çizim cümledeki iki ortalama
    before = bank.shown('önceOrt', f)
    after = bank.shown('sonraOrt', f)
  } else if (tpl.includes('{fark}') && isNum(f.beforeAvg)) {
    // "ortalama 2,2 puan azaldı": cümlede ortalamalar yok, fark var. Çizimin aralığı cümledeki farkın kendisi:
    // önce bir ondalığa yuvarlanmış ortalama, sonra önce ± fark (iki yuvarlamanın farkı cümleyle ayrışmasın)
    const g = bank.shown('fark', f)
    before = Number(f.beforeAvg.toFixed(1))
    after = isNum(g) ? Number((f.better === 'down' ? before - g : before + g).toFixed(1)) : null
  }
  if (!e || !isNum(e.max) || !isNum(before) || !isNum(after)) return null
  return { min: scaleMin(e.max), max: e.max, before, after, better: f.better === 'down' ? 'down' : 'up' }
}

// Seçilen cümlenin bankadaki şablonu (id'den) ya da ''
const templateOf = (say, bank) => Object.values(bank?.cells ?? {}).flat().find((t) => t.id === say.id)?.text ?? ''

// Ana cümlede sayıların geçtiği parça ("4'ten 7'ye"; fark cümlesinde sayı ve birimi "1,8 puan"): cümle aynı biçimle
// kurulup aranır; yoksa vurgu yok. Birim şablonun {fark}'tan sonraki sözcüğü (bankanın kendi yazısı; yeni metin değil)
function accentOf(say, bank, lexicon) {
  const f = say.facts ?? {}
  let tpl = say.type === 'effectPattern' ? '{önceOrt:ABL} {sonraOrt:DAT}' : say.type === 'metricChange' ? '{başlangıç:ABL} {şimdi:DAT}' : null
  if (say.type === 'effectPattern') {
    const own = templateOf(say, bank)
    const m = !own.includes('{önceOrt') ? own.match(/\{fark\}( [^\s{}.,;:!?]+)?/) : null
    if (m) tpl = `{fark}${m[1] ?? ''}`
  }
  if (!tpl) return null
  const part = bank.render(tpl, f, lexicon)
  if (!part) return null
  const i = say.text.indexOf(part)
  return i >= 0 ? { start: i, end: i + part.length } : null
}

// Modülün bugünkü durağı (manifest today(); yolun bağlamıyla, ilerleme dâhil): süresi olan ilk durak ya da null
function todayStopOf(m, { tests, sessions, now, profile }) {
  if (typeof m?.today !== 'function') return null
  try {
    const progression = progressionCtx({ tests, sessions, now, modules: registry.live })
    const r = m.today({ tests, sessions, now, profile, progression })
    return (Array.isArray(r) ? r : [r]).find((x) => x && posInt(x.minutes)) ?? null
  } catch {
    return null
  }
}

// Kartın düğmesi (yukarıdaki action). Süre, rota ya da ad yoksa null: düğme yok
function actionOf(say, { modules, bank, lang, lexicon, tests, sessions, now, profile }) {
  if (!CARD_TYPES.has(say.type) || typeof bank?.renderAction !== 'function') return null
  const f = say.facts ?? {}
  const m = modules.find((x) => x.id === f.module) // yalnız canlı modül (emeklinin ekranı açılmaz)
  if (!m) return null
  const ctx = { tests, sessions, now, profile }
  const home = m.routes?.[0] ?? m.id
  let kind = null
  let start = null
  if (say.type === 'metricChange') {
    // Yalnız oyunda; bugünkü tur yoksa ya da bitmişse düğme yok
    if (m.nef?.play !== true) return null
    const stop = todayStopOf(m, ctx)
    if (!stop || stop.done) return null
    kind = 'play'
    start = { route: stop.route ?? home, minutes: stop.minutes }
  } else {
    if (typeof m.nef?.start === 'function') {
      try {
        start = m.nef.start({ ...ctx, facts: f })
      } catch {
        start = null
      }
    } else {
      const stop = todayStopOf(m, ctx)
      start = stop ? { route: stop.route ?? home, minutes: stop.minutes } : null
    }
    kind = 'day' // örüntünün dilimi yok: "Bugün de …" (dilimli 'slot' kalıbı tek seans kartındaydı; kartta yok)
  }
  if (!start?.route || !posInt(start.minutes)) return null
  const name = kind === 'play' ? null : start.name?.[lang] ?? lexicon?.names?.[m.id]?.[''] ?? null
  const label = bank.renderAction(kind, { part: f.part, name, minutes: start.minutes })
  return label ? { label, route: start.route, kind } : null
}

// input: App'in Nef girdisi (context.js) · alert: göz uyarısı ('red' | 'yellow' | null) · rows: söz hafızası
// (memory.loadSaid) · profile: kişinin profili (modülün today() durağı için; ör. Tek Bakışta ışık hassasiyetinde durak vermez)
export function nefCard({ input = null, alert = null, rows = [], now = new Date(), modules = registry.live, profile = null } = {}) {
  const lang = input?.lang ?? null
  const bank = BANKS[lang] ?? null
  if (alert === 'red' || alert === 'yellow') {
    const t = fallbackInsight({ vaAlert: alert })
    return { kind: 'eye', tone: alert, label: bank?.label ?? null, text: t.insight, action: t.action }
  }
  if (!input || !bank) return null
  const ctx = nefContext(input, { now, rows, modules })
  // Yalnız izinli anlar seçiciye gider. Düşük WHO-5 ve uygulamaya uzun aradan dönüş günü an motoru yalnız o anı kurar:
  // süzülünce liste boş, kart yok (o gün örüntü ve ilerleme de söylenmez)
  const moments = buildMoments(ctx).filter((m) => CARD_TYPES.has(m.type))
  const said = speak({ moments, rows, bank, lang, now, channels: ['card'], pathDone: ctx.path.doneToday }).find((x) => x.channel === 'card')
  if (!said?.text || !said.id || !CARD_TYPES.has(said.type)) return null
  const moment = moments.find((m) => m.key === said.key)
  const full = { ...said, facts: moment?.facts ?? {} }
  const lexicon = moduleLexicon(lang)
  return {
    kind: 'say',
    type: said.type,
    label: said.label,
    text: said.text,
    accent: accentOf(full, bank, lexicon),
    scale: scaleOf(full, bank),
    action: actionOf(full, { modules, bank, lang, lexicon, tests: input.tests ?? [], sessions: input.sessions ?? [], now, profile }),
    say: { type: said.type, key: said.key, id: said.id, channel: 'card' },
  }
}

// Kartın cümlesi bugün hafızaya yazıldı mı (aynı gün yeniden açılışta ikinci satır yazılmaz)
export function saidToday(rows = [], say, now = new Date()) {
  if (!say?.id) return true
  const today = dayKey(now)
  return rows.some((r) => r.channel === 'card' && r.date === today && r.id === say.id && r.key === say.key)
}
