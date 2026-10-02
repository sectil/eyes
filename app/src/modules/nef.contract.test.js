// Nef sözleşme testi (Nef PLAN §4.8 madde 3; ANA_OTURUM_ISTEMI N1 madde 3): "Nef'e öğretilmemiş modül yayına çıkamaz".
// Her canlı modül (registry.live: emekli olmayanlar) için:
//   (a) en az bir genel an manifestin kendi verisinden üretilebiliyor (progress.effects / metrics; ilk kayıt ve uzun ara
//       için kayıt tanıyıcı: sessions.match ya da progression.match),
//   (b) ad sahip onaylı ve çekimleri bank/tr.grammar.js nounForms ile tutarlı,
//   (c) evidence anahtarları lib/sources.js'te PMID ve DOI ile kayıtlı (koşullu kaynak değil),
//   (d) bankada (lib/nef/bank/tr.js, yalnız onaylı cümleler) modülün her anı için kurulabilen cümle var.
// Biri eksikse test düşer. Eksik kaynak ya da cümle burada UYDURULMAZ: test düşer ve rapor edilir.
// Tek istisna NEF_SILENT: sahibin "Nef bunu anmaz" dediği modüller (liste testle kilitli; yeni modül sessizce giremez).
import { describe, it, expect } from 'vitest'
import { registry } from './registry.js'
import { SOURCES } from '../lib/sources.js'
import { LESSONS } from '../lib/yogaLessons.js'
import { buildMoments, MODULE_MOMENTS } from '../lib/nef/moments.js'
import { NEEDS } from '../lib/nef/speak.js'
import { moduleLexicon, lexiconFrom } from '../lib/nef/lexicon.js'
import tr, { cells } from '../lib/nef/bank/tr.js'
import { nounForms } from '../lib/nef/bank/tr.grammar.js'

// Sahip onaylı adlar (2026-10-01). Yoga dersin anında "{ders} yoga dersi".
const APPROVED_NAMES = [
  'nefes pratiği', 'Dalga sesi', 'Gökyüzü molası', 'Yön yazı egzersizi', 'yoga dersi', 'Yılan oyunu', 'Çemberler oyunu',
  'Hızlı Bakış oyunu', 'Tek Bakışta oyunu', 'Fark Ettin mi? alıştırması', 'fark etme görevi', 'Farkındalık merkezi',
  'göz kırpma egzersizi', 'göz egzersizi', '1 dakikalık mola', 'su kaydı', 'kısa E testi', 'haftalık E testi', 'okuma testi',
  'iyi oluş soruları', 'alarm',
  'Oku ve Anla alıştırması', // sahip onayı 2026-10-02 (okuma-anlama/METINLER.md §5)
  'Yakala Yaz alıştırması', // sahip onayı 2026-10-02 (kelime-hafiza/METINLER.md A2)
]
// Sahip onaylı ölçüm adları (2026-10-01): Ayna puanından söz eden cümlede Yön'ün adı
const APPROVED_METRIC_NAMES = { 'yon-ayna': 'Yön alıştırması' }
// Nef'in anmadığı modüller (sahip kararı 2026-10-01). Bu listeye ekleme sahibin kararıyla olur; test listeyi kilitler.
const NEF_SILENT = Object.freeze({
  alarm: "sahip kararı 2026-10-01: kayıt Nef'in okuduğu yerde değil (alarm günlüğü)",
  awareness: "sahip kararı 2026-10-01: kayıt Nef'in okuduğu yerde değil (kendi kaydı yok)",
})
const RECORD_STORES = ['tests', 'habits']
const LIVE = registry.live
const lex = moduleLexicon('tr')
const NOW = new Date(2026, 9, 1, 20, 0) // akşam
const LAST_WEEK = new Date(2026, 8, 24, 20, 0)

const ownRecords = (m) => RECORD_STORES.includes(m.nef?.records?.store) && typeof m.nef.records.match === 'function'
const hasRecords = (m) => typeof m.sessions?.match === 'function' || typeof m.progression?.match === 'function' || ownRecords(m)
const good = (better) => (better === 'down' ? [7, 4] : [4, 7])
const effectsOf = (m) => registry.effects().filter((e) => e.module === m.id)
const metricsOf = (m) => registry.metrics().filter((x) => x.module === m.id)

// Modülün bir genel an türü için an motorunun kurduğu anlar (manifest verisiyle, örnek sayılarla). strict: ilk kayıt ve
// uzun ara yalnız kayıt tanıyıcısı olan modülde (an motoru olguyu kayıtlardan alır).
function momentsOf(m, type, { strict = true } = {}) {
  const ctx = { now: NOW }
  if (type === 'recallEffect') {
    ctx.effects = effectsOf(m).map((e) => ({ ...e, pick: () => good(e.better) }))
    ctx.sessions = [{ date: LAST_WEEK.toISOString() }]
  } else if (type === 'effectPattern') {
    ctx.acute = effectsOf(m).map((e) => {
      const [before, after] = good(e.better)
      return { key: e.key, module: m.id, measure: e.measure, better: e.better ?? 'up', n: 5, before, after, gain: 3, lo: 1, hi: 4, sig: true }
    })
  } else if (type === 'metricChange') {
    ctx.metrics = metricsOf(m).map((x) => ({ key: x.key, module: m.id, domain: x.domain, better: x.better, verdict: 'better', start: 4, current: 6, weeks: 2 }))
  } else if (type === 'firstTime') {
    if (strict && !hasRecords(m)) return []
    ctx.firsts = [{ module: m.id, kind: 'day' }]
  } else if (type === 'returnAfterGap') {
    if (strict && !hasRecords(m)) return []
    ctx.gaps = [{ module: m.id, days: 20 }]
  } else return []
  return buildMoments(ctx).filter((x) => x.type === type && x.facts?.module === m.id)
}

const usable = (t, facts) => (t.needs ?? []).every((n) => NEEDS[n]?.(facts) === true) && (!t.only?.metric || t.only.metric === facts.metric) &&
  (!t.only?.module || t.only.module === facts.module)
const sentences = (moment) => (cells[moment.cell] ?? []).filter((t) => usable(t, moment.facts)).map((t) => tr.render(t.text, moment.facts, lex)).filter((s) => s != null)

// Yalın addan gövde adayları: ad tamlaması (son ünlü 3. tekil iyelik; "molası" → "mola", "sesi" → "ses") ya da yalın ad
function formsConsistent(forms) {
  const w = forms?.['']
  if (typeof w !== 'string' || !w) return false
  const cands = [[w, false], [w.slice(0, -1), true]]
  if (w.at(-2) === 's') cands.push([w.slice(0, -2), true])
  return cands.some(([stem, compound]) => {
    const want = nounForms(stem, { compound })
    return want && Object.entries(forms).every(([k, v]) => want[k] === v)
  })
}

describe('Nef sözleşmesi: canlı modüller', () => {
  it('canlı modül sayısı sahip onaylı ad sayısıyla aynı; her ad bir kez', () => {
    expect(LIVE.length).toBe(APPROVED_NAMES.length)
    expect(LIVE.map((m) => m.nef?.name?.tr?.['']).sort()).toEqual([...APPROVED_NAMES].sort())
  })
})

describe.each(LIVE.map((m) => [m.id, m]))('Nef sözleşmesi · %s', (id, m) => {
  const silent = Object.hasOwn(NEF_SILENT, id)
  it('(a) en az bir genel an üretilebiliyor', () => {
    const declared = m.nef?.moments ?? []
    if (silent) return expect(declared, `${id}: ${NEF_SILENT[id]}`).toEqual([])
    expect(declared.every((t) => MODULE_MOMENTS.includes(t)), `${id}: bilinmeyen an türü`).toBe(true)
    expect(declared.length, `${id}: nef.moments boş`).toBeGreaterThan(0)
    for (const type of declared) {
      const why = ['firstTime', 'returnAfterGap'].includes(type) && !hasRecords(m) ? ' (kayıt tanıyıcı yok: sessions.match / progression.match / nef.records)' : ''
      expect(momentsOf(m, type).length, `${id}: ${type} kurulamıyor${why}`).toBeGreaterThan(0)
    }
  })

  it('(b) ad sahip onaylı, çekimleri dil kuralıyla tutarlı', () => {
    const forms = m.nef?.name?.tr
    expect(APPROVED_NAMES, `${id}: ad`).toContain(forms?.[''])
    expect(formsConsistent(forms), `${id}: ${JSON.stringify(forms)}`).toBe(true)
    for (const [key, byLang] of Object.entries(m.nef?.name?.effects ?? {})) {
      const f = byLang?.tr
      const lesson = Object.values(LESSONS).find((L) => L.effectKey === key)
      expect(lesson, `${id}: ${key} bir ders değil`).toBeTruthy()
      expect(f?.[''], `${id}: ${key}`).toBe(`${lesson.title} yoga dersi`)
      expect(formsConsistent(f), `${id}: ${key} ${JSON.stringify(f)}`).toBe(true)
    }
    for (const [key, byLang] of Object.entries(m.nef?.name?.metrics ?? {})) {
      expect(metricsOf(m).map((x) => x.key), `${id}: ${key} bu modülün ölçümü değil`).toContain(key)
      expect(byLang?.tr?.[''], `${id}: ${key}`).toBe(APPROVED_METRIC_NAMES[key])
      expect(formsConsistent(byLang.tr), `${id}: ${key} ${JSON.stringify(byLang.tr)}`).toBe(true)
    }
  })

  it('(c) evidence lib/sources.js\'te PMID ve DOI ile kayıtlı', () => {
    const ev = m.nef?.evidence ?? []
    if (silent) return expect(ev, `${id}: ${NEF_SILENT[id]}`).toEqual([])
    expect(ev.length, `${id}: evidence boş (sources.js'te uygun kayıt yok)`).toBeGreaterThan(0)
    for (const key of ev) {
      const src = SOURCES[key]
      expect(Boolean(src?.pmid && src?.doi), `${id}: '${key}' sources.js'te pmid ve doi ile yok`).toBe(true)
      expect(src.only ?? null, `${id}: '${key}' koşullu kaynak`).toBeNull()
    }
  })

  it('(d) bankada modülün her anı için onaylı cümle var', () => {
    const declared = m.nef?.moments ?? []
    if (silent) return expect(declared, `${id}: ${NEF_SILENT[id]}`).toEqual([])
    expect(declared.length, `${id}: an yok, cümle yok`).toBeGreaterThan(0)
    for (const type of declared) {
      const list = momentsOf(m, type, { strict: false })
      expect(list.length, `${id}: ${type}`).toBeGreaterThan(0)
      for (const moment of list) expect(sentences(moment).length, `${id}: ${type} ${moment.cell} ${JSON.stringify(moment.facts)}`).toBeGreaterThan(0)
    }
    // Modüle özel cümle: bankada var, bu modülün metriğine bağlı ve kurulabiliyor
    for (const cid of m.nef?.cells ?? []) {
      const t = Object.values(cells).flat().find((x) => x.id === cid)
      expect(t, `${id}: ${cid} bankada yok`).toBeTruthy()
      expect(metricsOf(m).map((x) => x.key), `${id}: ${cid}`).toContain(t.only?.metric)
      expect(tr.render(t.text, { module: id, metric: t.only.metric, start: 4 }, lex), `${id}: ${cid}`).not.toBeNull()
    }
  })
})

describe('Nef sözleşmesi: istisnalar ve kayıt kaynakları', () => {
  it('NEF_SILENT kilitli: yalnız alarm ve Farkındalık merkezi, ikisi de canlı ve anısız', () => {
    expect(Object.keys(NEF_SILENT).sort()).toEqual(['alarm', 'awareness'])
    for (const id of Object.keys(NEF_SILENT)) {
      expect(LIVE.map((m) => m.id)).toContain(id)
      expect(registry.get(id).nef?.moments ?? []).toEqual([])
    }
  })
  it('kayıt tanıyıcılar kendi kaydını tanır, başkasınınkini tanımaz', () => {
    const rec = { mola: { type: 'mola' }, water: { type: 'water' }, daily: { type: 'va-daily' }, weekly: { type: 'va-weekly' }, reading: { type: 'reading' } }
    expect(LIVE.filter(ownRecords).map((m) => m.id).sort()).toEqual(Object.keys(rec).sort())
    for (const [id, own] of Object.entries(rec)) {
      const match = registry.get(id).nef.records.match
      for (const [other, r] of Object.entries(rec)) expect(match(r), `${id} ↔ ${other}`).toBe(other === id)
    }
  })
  it('tests deposundaki ölçümler (E testleri, okuma): yalnız sayısız ilk kayıt ve uzun ara', () => {
    for (const m of LIVE.filter((x) => x.nef?.records?.store === 'tests')) {
      expect(m.nef.moments, m.id).toEqual(['firstTime', 'returnAfterGap'])
      expect(m.nef.metricWords, m.id).toBeUndefined()
      for (const type of m.nef.moments) {
        for (const moment of momentsOf(m, type)) {
          expect(Object.keys(moment.facts), m.id).toEqual(['module'])
          for (const text of sentences(moment)) expect(text, m.id).not.toMatch(/[0-9]/)
        }
      }
    }
  })
  it('Yön: Ayna cümlesinde ad "Yön alıştırması"; "Yön yazı egzersizi … Ayna" hiç kurulmaz', () => {
    const yon = registry.get('yon')
    const texts = []
    for (const type of MODULE_MOMENTS) for (const moment of momentsOf(yon, type, { strict: false })) texts.push(...sentences(moment))
    const first = { type: 'firstTime', cell: 'FTB', facts: { module: 'yon', metric: 'yon-ayna', start: 3.5 } }
    texts.push(...sentences(first))
    // Bankadaki her hücre, Ayna ölçümünün olgularıyla
    for (const cell of Object.keys(cells)) texts.push(...sentences({ cell, facts: { module: 'yon', metric: 'yon-ayna', start: 3, current: 4, weeks: 2 } }))
    const ayna = texts.filter((t) => /Ayna/.test(t))
    expect(ayna.length).toBeGreaterThan(0)
    for (const t of ayna) expect(t).toMatch(/Yön alıştırması/)
    for (const t of texts) expect(t).not.toMatch(/Yön yazı egzersiz[^.;]*Ayna|Ayna[^.;]*Yön yazı egzersiz/)
    expect(texts.some((t) => /Yön yazı egzersiz/.test(t))).toBe(true) // öteki Yön cümlelerinde ad aynı kalır
  })
})

describe('Nef sözlüğü manifestten', () => {
  it('onaylı cümlelerdeki ad ve ölçüm biçimleri manifestlerle aynı (bank/tr.test.js örnek sözlüğü)', () => {
    expect(lex.names.dalga).toMatchObject({ '': 'Dalga sesi', ABL: 'Dalga sesinden', ACC: 'Dalga sesini', DAT: 'Dalga sesine' })
    expect(lex.names['yoga-nefes']).toMatchObject({ '': 'Nefesin Ritmi yoga dersi', ABL: 'Nefesin Ritmi yoga dersinden', ACC: 'Nefesin Ritmi yoga dersini' })
    expect(lex.names.yon).toMatchObject({ '': 'Yön yazı egzersizi', ABL: 'Yön yazı egzersizinden', ACC: 'Yön yazı egzersizini' })
    expect(lex.names['tek-bakis']).toMatchObject({ '': 'Tek Bakışta oyunu', LOC: 'Tek Bakışta oyununda', ACC: 'Tek Bakışta oyununu', DAT: 'Tek Bakışta oyununa' })
    expect(lex.names.snake).toMatchObject({ '': 'Yılan oyunu', ACC: 'Yılan oyununu', LOC: 'Yılan oyununda', INS: 'Yılan oyunuyla', DAT: 'Yılan oyununa' })
    expect(lex.names.gokyuzu).toMatchObject({ '': 'Gökyüzü molası', POSS: 'Gökyüzü molan', 'POSS-ABL': 'Gökyüzü molandan' })
    expect(lex.names.yoga).toMatchObject({ '': 'yoga dersi', POSS: 'yoga dersin' })
    expect(lex.metrics['tek-bakis-span']).toEqual({ word: 'kavradığın harf sayısı', unit: 'harf' })
  })
  it('sahip kararları: uyku metriği ve Yön rahatsızlığı için sözcük yok', () => {
    expect(lex.metrics['yoga-uyku-dalma']).toBeUndefined()
    expect(JSON.stringify(registry.modules.map((m) => m.nef?.metricWords ?? null))).not.toMatch(/uyku|rahatsızlık/)
  })
  it('başka dilde ad yoksa sözlük boş (başka dile düşülmez)', () => {
    expect(lexiconFrom(registry.modules, 'en')).toEqual({ names: {}, metrics: {} })
    expect(lexiconFrom(registry.modules, null)).toEqual({ names: {}, metrics: {} })
  })
})
