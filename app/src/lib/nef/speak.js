// Nef seçicisi (Nef PLAN §4.2, §4.4, §4.5, §4.7; ANA_OTURUM_ISTEMI N1 madde 1, 4, 5). Saf.
// An listesi (moments.js) + hafıza satırları (memory.js loadSaid) + dil bankası (bank/<dil>.js) → kanal başına en çok
// bir cümle: [{ channel: 'card'|'notify', id, text, title?, titleId?, type, key, cell, label? }].
// Seçici yazmaz: gösterilen cümleyi çağıran memory.recordSaid ile kaydeder (bu aşamada çağıran yok; UI ve planlayıcı
// sonraki aşamada).
//
// Kurallar:
//   - Dil: bank.lang istenen dil değilse hiç konuşmaz; başka dile geri düşmez (§4.7).
//   - Hücre: anın hücresinde kullanılabilir cümle kalmazsa o an susar; başka hücreye düşmez. Tek istisna: F1.D
//     ("aynı hafta ikinci kez") tükenirse F1.A ve F1.E kümesinden seçilir. Cümlenin olgu koşulları (needs) tutmazsa
//     o cümle kullanılamaz sayılır.
//   - Hafıza: aynı cümle 21 gün, aynı olgu bir kez, aynı an türü kartta üst üste iki gün değil, üç kez yok sayılan an
//     türü 14 gün dinlenir (memory.js).
//   - Nef'in kendi bildirimi: günde en çok 1, son 7 günde en çok 4 (sayaç hafızadan); gece 01–05 yok; kişi bugünkü
//     yolunu bitirdiyse yok; başlık ≤ 30, gövde ≤ 110 karakter (aşan aday seçilmez).
//   - Düşük WHO-5: kart yalnız sabit satırı işaret eder ({ fixed: 'who5.low' }; metin who5.js'ten, bankadan değil);
//     bildirim yok.
//   - Kart gün içinde kararlıdır: bugün kartta söylenmiş bir anın olgusu hâlâ geçerliyse aynı cümle yeniden kurulur
//     (VARSAYIM: her açılışta değişen kart güveni kırar).
import { dayKey } from '../calendar.js'
import { HARD_NIGHT_MIN, TITLE_MAX, BODY_MAX } from '../weatherNotify.js'
import { EXCLUDED_EFFECTS, EXCLUDED_METRICS } from './moments.js'
import { sentenceFree, factFree, typeFreeHome, typeResting, notifyCounts, saidWithin, lastSaidAt } from './memory.js'
import { moduleLexicon } from './lexicon.js'

export const NOTIFY_DAY_MAX = 1
export const NOTIFY_WEEK_MAX = 4
export const REPEAT_DAYS = 7 // F1.D: son 7 günde F1 söylendiyse "tekrar" (taslak F1.D VARSAYIM)
export { TITLE_MAX, BODY_MAX }
// Bildirim başlığının hücresi (yalnız Nef'in kendi bildirimi olan an türleri)
export const TITLE_CELLS = Object.freeze({ rainOnWalk: 'F1.T' })

const isNum = (v) => typeof v === 'number' && Number.isFinite(v)
// Cümlenin olgu koşulları (bank şablonlarındaki needs; dil bilmez)
export const NEEDS = Object.freeze({
  habit: (f) => f.source === 'habit',
  remind: (f) => f.source === 'remind',
  week: (f) => Number.isInteger(f.n) && f.n >= 2,
  early: (f) => Number.isInteger(f.earlyAt),
  covered: (f) => f.covered === true,
  // Yuvarlanmış ortalamalar iyi yönde farklı olmalı ("4'ten 4'e çıktı" yazılmaz)
  avgDiff: (f) => isNum(f.beforeAvg) && isNum(f.afterAvg) && (f.better === 'down' ? Math.round(f.afterAvg) < Math.round(f.beforeAvg) : Math.round(f.afterAvg) > Math.round(f.beforeAvg)),
  twoWeeks: (f) => Number.isInteger(f.weeks) && f.weeks >= 2,
  effect: (f) => Boolean(f.effect) && isNum(f.before) && isNum(f.after),
  metric: (f) => Boolean(f.metric) && isNum(f.start),
})

const usable = (t, facts) => (t.needs ?? []).every((n) => NEEDS[n]?.(facts) === true) && (!t.only?.metric || t.only.metric === facts.metric)

// Uyku ve Yön rahatsızlığı ikinci kez süzülür (an motoru zaten kurmaz; sahip kararı burada da korunur)
const allowed = (m) => !EXCLUDED_EFFECTS.has(m?.facts?.effect) && !EXCLUDED_METRICS.has(m?.facts?.metric)

function hash(s) {
  let h = 0
  for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h
}

// Anın konuşabileceği hücre grupları, sırayla (ilk grupta cümle yoksa sonrakine; yalnız F1.D istisnası)
function cellGroups(m, rows, now) {
  if (m.type === 'rainOnWalk' && (m.cell === 'F1.A' || m.cell === 'F1.E') && saidWithin(rows, 'rainOnWalk', REPEAT_DAYS, now)) {
    return [['F1.D'], ['F1.A', 'F1.E']]
  }
  return m.cell ? [[m.cell]] : []
}

// Hücre grubundan cümle: koşulu tutan, 21 günde söylenmemiş, kurulabilen ve sığan. Hiç söylenmemiş olan önce, sonra en
// eski söylenen; eşitlikte gün ve olguya göre sabit seçim (aynı gün aynı cümle).
function pick(bank, groups, facts, { rows, now, lexicon, max = Infinity, seed = '' }) {
  for (const group of groups) {
    const cands = []
    for (const cell of group) {
      for (const t of bank.cells?.[cell] ?? []) {
        if (!usable(t, facts) || !sentenceFree(rows, t.id, now)) continue
        const text = bank.render(t.text, facts, lexicon)
        if (text == null || [...text].length > max) continue
        cands.push({ id: t.id, text, cell, last: lastSaidAt(rows, t.id) ?? -Infinity })
      }
    }
    if (!cands.length) continue
    const oldest = Math.min(...cands.map((c) => c.last))
    const pool = cands.filter((c) => c.last === oldest)
    return pool[hash(`${dayKey(now)}|${seed}`) % pool.length]
  }
  return null
}

const nightAt = (d) => {
  const m = d.getHours() * 60 + d.getMinutes()
  return m >= HARD_NIGHT_MIN[0] && m < HARD_NIGHT_MIN[1]
}

// Girdi:
//   moments   buildMoments çıktısı · rows: memory.loadSaid çıktısı · bank: bank modülü ({ lang, label, cells, render })
//   lang      istenen dil · now: şimdi · notifyAt: bildirimin çalacağı an (yoksa now)
//   lexicon   ad ve ölçüm sözcükleri; verilmezse manifestlerin `nef` alanından (lexicon.js moduleLexicon, o dilde)
//   pathDone  kişi bugünkü yolunu bitirdi mi (an motorundan bağımsız ikinci koruma) · channels: istenen kanallar
//   notifyBodyMax  bildirim gövdesinin üst sınırı (varsayılan BODY_MAX; planlayıcı altına eklenecek kaynak satırının
//             payını düşer: lib/nef/notify.js)
export function speak({ moments = [], rows = [], bank = null, lang = null, now = new Date(), notifyAt = null, lexicon = null, pathDone = false, channels = ['card', 'notify'], notifyBodyMax = BODY_MAX } = {}) {
  if (!bank || !lang || bank.lang !== lang) return []
  lexicon = lexicon ?? moduleLexicon(lang)
  const list = (Array.isArray(moments) ? moments : []).filter((m) => m && allowed(m)).sort((a, b) => b.priority - a.priority)
  const want = new Set(channels)
  const out = []

  // Düşük WHO-5: yalnız sabit satır işareti
  const low = list.find((m) => m.type === 'lowWho5')
  if (low) {
    if (want.has('card')) out.push({ channel: 'card', type: 'lowWho5', key: low.key, cell: null, id: null, text: null, fixed: 'who5.low', label: bank.label })
    return out
  }
  // Uzun aradan dönüş: tek cümle (kart), sonra Nef o gün susar; bildirim yok
  const back = list.find((m) => m.type === 'returnApp')
  const pool = back ? [back] : list

  // ---------- Bildirim ----------
  let notifyKey = null
  const at = notifyAt instanceof Date ? notifyAt : now
  if (want.has('notify') && !back && !pathDone && !nightAt(at)) {
    const c = notifyCounts(rows, at)
    if (c.day < NOTIFY_DAY_MAX && c.week < NOTIFY_WEEK_MAX) {
      for (const m of pool) {
        if (!m.channels?.includes('notify') || !TITLE_CELLS[m.type]) continue
        if (typeResting(rows, m.type, now) || !factFree(rows, m.key)) continue
        const body = pick(bank, cellGroups(m, rows, now), m.facts, { rows, now, lexicon, max: Math.min(BODY_MAX, notifyBodyMax), seed: m.key })
        const title = body && pick(bank, [[TITLE_CELLS[m.type]]], m.facts, { rows, now, lexicon, max: TITLE_MAX, seed: `${m.key}|title` })
        if (!body || !title) continue // bir hücre susarsa an susar
        out.push({ channel: 'notify', type: m.type, key: m.key, cell: body.cell, id: body.id, text: body.text, title: title.text, titleId: title.id })
        notifyKey = m.key
        break
      }
    }
  }

  // ---------- Kart ----------
  if (want.has('card')) {
    const today = dayKey(now)
    const shown = rows.filter((r) => r.channel === 'card' && r.date === today).at(-1)
    const again = shown && pool.find((m) => m.key === shown.key)
    let card = null
    if (again) {
      // Bugün söylenen cümle, bugünkü olgularla yeniden (kural denetimi bugünkü kaydın kendisine takılmasın diye yok)
      const t = Object.values(bank.cells ?? {}).flat().find((x) => x.id === shown.id)
      const text = t && usable(t, again.facts) ? bank.render(t.text, again.facts, lexicon) : null
      if (text != null) card = { channel: 'card', type: again.type, key: again.key, cell: again.cell, id: t.id, text, label: bank.label }
    }
    for (const m of card ? [] : pool) {
      if (!m.channels?.includes('card') || m.key === notifyKey) continue
      if (typeResting(rows, m.type, now) || !typeFreeHome(rows, m.type, now) || !factFree(rows, m.key)) continue
      const s = pick(bank, cellGroups(m, rows, now), m.facts, { rows, now, lexicon, seed: m.key })
      if (!s) continue // bu an susar; sıradaki an denenir
      card = { channel: 'card', type: m.type, key: m.key, cell: s.cell, id: s.id, text: s.text, label: bank.label }
      break
    }
    if (card) out.push(card)
  }
  return out
}
