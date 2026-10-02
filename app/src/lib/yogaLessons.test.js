// Ders verisi denetimi (yoga-pilot/v3/modul.md §16-G; PLAN.v3 §D.1): yalnız yayımlanmış süreler görünür; yayımlanmış her
// dosya paketin içinde, çizelgesiyle tutarlı ve ekrandaki cümle söylenen cümle; açılış ve güvenlik satırları her derste.
import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
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
  // İlk bölüm (SAHIP_ISTEKLERI.md madde 10, 17, 18): dört dersin on bir süresi yayımlandı (2026-09-30). Önceden yalnız
  // Ders 2 · 15 dk yayımlıydı; bu testin o günkü beklentisi yayınla değişti.
  // Sahip kararı (2026-09-30, Build 60): Uykuya Geçiş ayrıntı ekranı 5 saniye kapısından geçmedi; Ders 3 sonra gelir
  it('Build 60: Ders 1, 2, 5\'in bütün süreleri yayımlanmış; Uykuya Geçiş (Ders 3) henüz yayında değil', () => {
    const pub = Object.entries(LESSONS).flatMap(([n, L]) => Object.entries(L.versions).filter(([, v]) => v.published === true).map(([m]) => `${n}-${m}`))
    expect(pub).toEqual(['1-3', '1-5', '1-15', '2-5', '2-15', '2-20', '5-3', '5-5', '5-15'])
    for (const L of Object.values(LESSONS)) expect(publishedMinutes(L.n)).toEqual(L.n === 3 ? [] : L.minutes)
    expect(LESSON_MIN).toEqual({ 1: 3, 2: 5, 5: 3 })
    expect(PUBLISHED_MINUTES).toEqual({ 1: [3, 5, 15], 2: [5, 15, 20], 5: [3, 5, 15] })
    expect(visibleLessons(at(10))).toEqual([1, 2, 5])
    expect(visibleLessons(at(22))).toEqual([1, 2, 5])
  })
  it('açılış süresi: istenen yayımlanmışsa o, yoksa dersin varsayılanı', () => {
    expect(pickMinutes(2)).toBe(20) // Ders 2'nin varsayılanı 20 dk
    expect(pickMinutes(2, 5)).toBe(5)
    expect(pickMinutes(2, 3)).toBe(20) // Ders 2'de 3 dk yok (PLAN.v3 karar 4)
    expect(pickMinutes(1)).toBe(5)
    expect(pickMinutes(1, 3)).toBe(3)
    expect(pickMinutes(3)).toBeNull() // Ders 3 yayında değil (Build 60)
    expect(pickMinutes(5, 15)).toBe(15)
  })
  it('published bayrağı olmayan süre seçilemez: açılış süresi hep yayımlanmış bir süre', () => {
    const saved = structuredClone({ 1: LESSONS[1].versions, 2: LESSONS[2].versions })
    try {
      delete LESSONS[2].versions[20].published
      delete LESSONS[2].versions[5].published
      for (const m of [3, 5, 15]) delete LESSONS[1].versions[m].published
      expect(pickMinutes(2)).toBe(15) // varsayılan 20 yayımlanmadı → en yakın yayımlanmış
      expect(pickMinutes(2, 5)).toBe(15)
      expect(pickMinutes(2, 15)).toBe(15)
      expect(pickMinutes(1, 3)).toBeNull()
      expect(publishedMinutes(1)).toEqual([])
      expect(visibleLessons(at(10))).toEqual([2, 5])
      expect(isPublished(2, 5)).toBe(false)
    } finally {
      LESSONS[1].versions = saved[1]
      LESSONS[2].versions = saved[2]
    }
    expect(isPublished(2, 5)).toBe(true)
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
    expect(addedSections(2, 15, 20).map((s) => s.id)).toEqual(['C3']) // 20 dk'da zıtlıklar
    expect(addedSections(2, 5, 15).map((s) => s.id)).toEqual(['C4'])
    expect(addedSections(1, 3, 15).map((s) => s.id)).toEqual(['C2', 'C3'])
    expect(addedSections(3, 5, 15).map((s) => s.id)).toEqual(['C4'])
    expect(addedSections(5, 5, 15).map((s) => s.id)).toEqual(['C2', 'C3'])
  })
  // Onaylı ilk bölüm dosyaları (render/out/ilk-bolum) birebir; timeline/2 çizelgesinin kendi özeti ve dosya adı
  it('çizelge aynı dosyayı anlatır (timeline/2: file, audio.sha256, minutes); mutlak yol yok', () => {
    for (const [L, m, v] of published) {
      const tl = JSON.parse(readFileSync(join(PUBLIC, v.timeline), 'utf8'))
      expect(tl.schema).toBe('nefona.yoga.timeline/2')
      expect(`yoga/${tl.file}`).toBe(v.file)
      expect(tl.lessonNo).toBe(L.n)
      expect(tl.minutes).toBe(m)
      expect(tl.audio.sha256.slice(0, 16)).toBe(v.contentHash)
      expect(tl.voice.id).toBe(v.voice)
      expect(tl.music.scene ?? undefined).toBe(v.scene)
      expect(readFileSync(join(PUBLIC, v.timeline), 'utf8')).not.toMatch(/"\/(tmp|home|Users|root)\//)
    }
  })
  it('gerçek süre: MP3 çerçeve sayısından (MPEG-1 Layer III, 1152 örnek) hedef süre ± 0,1 sn (kodlayıcı dolgusu)', () => {
    for (const [, , v] of published) {
      const sec = mp3Seconds(readFileSync(join(PUBLIC, v.file)))
      expect(sec, v.file).toBeGreaterThanOrEqual(v.seconds)
      expect(sec - v.seconds, v.file).toBeLessThan(0.1)
    }
  })
  it('Uykuya Geçiş müzik kuyruğu pakette: 10 dk (20 dk seçilirse döngülenir)', () => {
    expect(LESSONS[3].musicTailFile).toBe('yoga/ders3-kuyruk.mp3')
    // Ders 3 yayında değilken kuyruk pakette değil; üretim kopyası ölçülür
    const inApp = join(PUBLIC, LESSONS[3].musicTailFile)
    const file = existsSync(inApp) ? inApp : fileURLToPath(new URL('../../../yoga-pilot/render/out/ilk-bolum/ders3-kuyruk.mp3', import.meta.url))
    const sec = mp3Seconds(readFileSync(file))
    expect(sec).toBeGreaterThanOrEqual(600)
    expect(sec).toBeLessThan(600.1)
    for (const L of Object.values(LESSONS)) if (L.n !== 3) expect(L.musicTailFile ?? null).toBeNull()
  })
  it('public/yoga\'da yalnız yayımlanmış dosyalar ve kuyruk (artık dosya pakete girmez)', () => {
    // Müzik kuyruğu yalnız Uykuya Geçiş yayımlıyken pakete girer
    const tail = publishedMinutes(3).length > 0 ? [LESSONS[3].musicTailFile] : []
    const want = new Set([...published.flatMap(([, , v]) => [v.file, v.timeline]), ...tail].map((p) => p.replace(/^yoga\//, '')))
    expect(new Set(readdirSync(join(PUBLIC, 'yoga')))).toEqual(want)
  })
})

// MPEG-1 Layer III çerçevelerini sayar (ID3 başlığı atlanır): süre = çerçeve × 1152 / örnekleme hızı
function mp3Seconds(buf) {
  const RATES = [44100, 48000, 32000]
  const KBPS = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320]
  let i = buf.subarray(0, 3).toString('latin1') === 'ID3' ? 10 + ((buf[6] << 21) | (buf[7] << 14) | (buf[8] << 7) | buf[9]) : 0
  let frames = 0
  let rate = null
  while (i + 4 <= buf.length) {
    const b1 = buf[i + 1]
    const b2 = buf[i + 2]
    const ok = buf[i] === 0xff && (b1 & 0xfe) === 0xfa && (b2 >> 4) !== 0 && (b2 >> 4) !== 15 && ((b2 >> 2) & 3) !== 3
    if (!ok) { i += 1; continue }
    rate = RATES[(b2 >> 2) & 3]
    frames += 1
    i += Math.floor((144 * KBPS[b2 >> 4] * 1000) / rate) + ((b2 >> 1) & 1)
  }
  return rate ? (frames * 1152) / rate : 0
}

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
