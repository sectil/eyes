// Ders verisi denetimi (yoga-pilot/v3/modul.md §16-G; PLAN.v3 §D.1): yalnız yayımlanmış süreler görünür; yayımlanmış her
// dosya paketin içinde, çizelgesiyle tutarlı ve ekrandaki cümle söylenen cümle; açılış ve güvenlik satırları her derste.
import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import {
  LESSONS, LIBRARY_ORDER, LESSON_MIN, PUBLISHED_MINUTES, OPENING_PERMISSION, OPENING_VEHICLE, THREE_MIN_LINE, POSTURE_LABEL,
  publishedMinutes, isPublished, visibleLessons, pickMinutes, sectionsOf, addedSections, isNightHour, versionOf, minutesLabel,
} from './yogaLessons.js'
import { DOMAINS } from '../modules/registry.js'

const PUBLIC = fileURLToPath(new URL('../../public/', import.meta.url))
const at = (h, m = 0) => new Date(2026, 9, 1, h, m)

describe('ilk bölüm: dersler ve alanlar', () => {
  it('Ders 1, 2, 3, 5; alanlar registry kimlikleri (1 Sakinlik, 2 Beden, 3 İyi oluş, 5 Dikkat)', () => {
    expect(Object.keys(LESSONS).map(Number)).toEqual([1, 2, 3, 5])
    expect(Object.fromEntries(Object.values(LESSONS).map((L) => [L.n, L.domain]))).toEqual({ 1: 'calm', 2: 'body', 3: 'wellbeing', 5: 'focus' })
    for (const L of Object.values(LESSONS)) expect(DOMAINS).toContain(L.domain)
  })
  it('süre çipleri: Ders 1 ve 5 3 · 5 · 15, Ders 2 5 · 15 · 20, Ders 3 5 · 15 (PLAN.v3 karar 4)', () => {
    expect(LESSONS[1].minutes).toEqual([3, 5, 15])
    expect(LESSONS[5].minutes).toEqual([3, 5, 15])
    expect(LESSONS[2].minutes).toEqual([5, 15, 20])
    expect(LESSONS[3].minutes).toEqual([5, 15])
    for (const L of Object.values(LESSONS)) expect(Object.keys(L.versions).map(Number).sort((a, b) => a - b)).toEqual(L.minutes)
  })
  it('önce sorusu: Ders 3 sorulmaz; ötekilerde soru ve iki uç (modul.md §2.5)', () => {
    expect(LESSONS[3].question).toBeNull()
    expect(LESSONS[1]).toMatchObject({ question: 'Şu an ne kadar gerginsin?', ends: ['hiç', 'çok'], measure: 'gerginlik', better: 'down' })
    expect(LESSONS[2]).toMatchObject({ question: 'Bedenin şu an ne kadar gergin?', ends: ['hiç', 'çok'], measure: 'beden gerginliği', better: 'down' })
    expect(LESSONS[5]).toMatchObject({ question: 'Dikkatin şu an ne kadar toplanmış?', ends: ['dağınık', 'toplanmış'], measure: 'odak', better: 'up' })
  })
})

describe('yayın: yalnız hazır olan görünür', () => {
  it('bugün yalnız Ders 2 · 15 dk yayımlanmış; öteki süre ve dersler görünmez, yolda aday değil', () => {
    const pub = Object.entries(LESSONS).flatMap(([n, L]) => Object.entries(L.versions).filter(([, v]) => v.published === true).map(([m]) => `${n}-${m}`))
    expect(pub).toEqual(['2-15'])
    expect(publishedMinutes(2)).toEqual([15])
    expect(publishedMinutes(1)).toEqual([])
    expect(isPublished(2, 5)).toBe(false)
    expect(LESSON_MIN).toEqual({ 2: 15 })
    expect(PUBLISHED_MINUTES).toEqual({ 2: [15] })
    expect(visibleLessons(at(10))).toEqual([2])
    expect(visibleLessons(at(22))).toEqual([2])
  })
  it('published bayrağı olmayan süre seçilemez: açılış süresi hep yayımlanmış bir süre', () => {
    expect(pickMinutes(2)).toBe(15) // varsayılan 20 yayımlanmadı → en yakın yayımlanmış
    expect(pickMinutes(2, 5)).toBe(15)
    expect(pickMinutes(2, 15)).toBe(15)
    expect(pickMinutes(1, 3)).toBeNull()
    expect(sectionsOf(1, 3)).toEqual([])
  })
  it('Uykuya Geçiş yayımlanınca 20.00–04.59 arasında en üstte, gündüz en sonda (kütüphane sırası PLAN.v2 §A.3)', () => {
    const fake = {
      1: { minutes: [3], versions: { 3: { published: true } } },
      2: { minutes: [15], versions: { 15: { published: true } } },
      3: { minutes: [5], versions: { 5: { published: true } } },
      5: { minutes: [3], versions: { 3: {} } },
    }
    expect(visibleLessons(at(10), fake)).toEqual([1, 2, 3])
    expect(visibleLessons(at(20), fake)).toEqual([3, 1, 2])
    expect(visibleLessons(at(4, 59), fake)).toEqual([3, 1, 2])
    expect(visibleLessons(at(5), fake)).toEqual([1, 2, 3])
    expect(LIBRARY_ORDER).not.toContain(3)
  })
  it('akşam eşiği tek saat: 20.00 (modul.md §10.3-d)', () => {
    expect(isNightHour(at(19, 59))).toBe(false)
    expect(isNightHour(at(20))).toBe(true)
    expect(isNightHour(at(4, 59))).toBe(true)
    expect(isNightHour(at(5))).toBe(false)
  })
})

describe('yayımlanmış her dosya', () => {
  const published = Object.values(LESSONS).flatMap((L) => L.minutes.filter((m) => isPublished(L.n, m)).map((m) => [L, m, versionOf(L.n, m)]))
  it('ses ve çizelge paketin içinde (public/yoga); özet, süre ve bölüm sırası dosyayla aynı', () => {
    expect(published.length).toBeGreaterThan(0)
    for (const [L, m, v] of published) {
      expect(v.file).toMatch(/^yoga\/[a-z0-9-]+\.mp3$/)
      expect(existsSync(join(PUBLIC, v.file)), v.file).toBe(true)
      expect(existsSync(join(PUBLIC, v.timeline)), v.timeline).toBe(true)
      const hash = createHash('sha256').update(readFileSync(join(PUBLIC, v.file))).digest('hex')
      expect(hash.slice(0, 16), `${v.file} contentHash`).toBe(v.contentHash)
      const tl = JSON.parse(readFileSync(join(PUBLIC, v.timeline), 'utf8'))
      expect(tl.T).toBe(v.seconds)
      expect(v.seconds).toBe(m * 60)
      const blocks = []
      for (const s of tl.speech) if (!s.block.startsWith('BR.') && !blocks.includes(s.block)) blocks.push(s.block)
      expect(blocks).toEqual(v.sections)
      for (const id of v.sections) expect(L.sectionLabels[id], `${L.n}:${id}`).toBeTruthy()
      expect(sectionsOf(L.n, m).map((s) => s.id)).toEqual(v.sections)
    }
  })
  it('ekrandaki cümle söylenen cümledir (timeline screen_equals_spoken)', () => {
    for (const [, , v] of published) {
      const tl = JSON.parse(readFileSync(join(PUBLIC, v.timeline), 'utf8'))
      for (const s of tl.speech) {
        expect(s.screen_equals_spoken, s.piece).toBe(true)
        expect(s.screen_text, s.piece).toBe(s.spoken_text)
        expect(s.screen_text.trim().length, s.piece).toBeGreaterThan(0)
      }
    }
  })
  it('Ders 2 · 15 dk bölüm şeridi: yalnız o dosyada çalan bölümler (zıtlık çiftleri ve sessiz dinlenme yok)', () => {
    expect(sectionsOf(2, 15).map((s) => s.label).join(' · ')).toBe('Karşılama · Niyet (sankalpa) · Beden dolaşımı · Nefes ve geri sayma · İmgeleme · Niyete dönüş · Kapanış')
    expect(addedSections(2, 15, 15)).toEqual([])
    expect(addedSections(2, null, 15)).toEqual([])
  })
})

describe('güvenlik satırları ve kanıt dili (modul.md §2.4-12, §10, §16-G)', () => {
  const allText = (o) => (typeof o === 'string' ? [o] : Array.isArray(o) ? o.flatMap(allText) : o && typeof o === 'object' ? Object.values(o).flatMap(allText) : [])
  it('her derste açılış satırları: çıkış izni ve araç satırı; uzanarak gündüz dersinde kalkış satırı; uyku dersinde ikinci araç cümlesi', () => {
    for (const L of Object.values(LESSONS)) {
      expect(L.opening[0]).toBe(OPENING_PERMISSION)
      expect(L.opening[1].startsWith(OPENING_VEHICLE)).toBe(true)
      expect(L.opening.length).toBe(3)
    }
    expect(OPENING_PERMISSION).toBe('İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin.')
    expect(OPENING_VEHICLE).toBe('Bu dersi yalnızca araç ya da makine kullanmadığın ve suda olmadığın bir sırada dinle.')
    expect(LESSONS[2].opening[2]).toBe('Uzanarak yaptığın derslerden sonra önce yana dön, otur, sonra kalk.')
    expect(LESSONS[3].opening.join(' ')).toContain('Bu dersten hemen sonra araç kullanma.')
    expect(LESSONS[2].preparation).toEqual(['İnce bir örtü', 'Dizlerinin altı için bir yastık', 'Uzanabileceğin rahat bir yüzey'])
    for (const L of Object.values(LESSONS)) if (L.posture !== 'lie') expect(L.preparation).toBeNull()
  })
  it('sağlık iddiası yok; "derin nefes al" komutu yok; her kanıt cümlesi sonuç vaadi taşımadığını söyler', () => {
    const texts = allText(LESSONS)
    for (const t of texts) {
      expect(t).not.toMatch(/iyileştirir|stres(ini)? azalt|kanıtland|tedavi eder|garanti/i)
      expect(t).not.toMatch(/derin (bir )?nefes al/i)
    }
    for (const L of Object.values(LESSONS)) expect(L.evidenceLine).toMatch(/vaadi taşımaz\.$/)
    expect(THREE_MIN_LINE).toContain('(Radin 2025)')
  })
  it('kaynak satırları: PMID ve DOI biçimi; 3 dakikalık derste Radin 2025 listede', () => {
    for (const L of Object.values(LESSONS)) {
      expect(L.sources.length).toBeGreaterThan(0)
      for (const r of L.sources) {
        expect(r.pmid, r.cite).toMatch(/^\d{6,9}$/)
        expect(r.doi, r.cite).toMatch(/^10\.\d{4,9}\//)
      }
      if (L.minutes.includes(3)) expect(L.sources.map((r) => r.pmid)).toContain('39808431')
    }
  })
  it('etiketler', () => {
    expect(POSTURE_LABEL[LESSONS[2].posture]).toBe('Uzanarak')
    expect(POSTURE_LABEL[LESSONS[1].posture]).toBe('Oturarak')
    expect(minutesLabel([5, 15])).toBe('5 · 15 dk')
    expect(minutesLabel([])).toBe('')
  })
})
