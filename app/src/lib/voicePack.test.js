import { describe, it, expect } from 'vitest'
import { PHRASES, PHRASE_IDS, VOICES, VOICE_LABEL, phraseId, availableFrom, trimBounds, gainFor, TARGET_PEAK } from './voicePack.js'
import { makePlan, normalizeOpts } from './breath.js'
import { readFileSync, existsSync, readdirSync } from 'node:fs'

describe('seslendirme paketi', () => {
  it('her dilde her cümle ve iki ses adı var', () => {
    for (const lang of Object.keys(PHRASES)) {
      expect(Object.keys(PHRASES[lang]).sort()).toEqual([...PHRASE_IDS].sort())
      for (const v of VOICES) expect(VOICE_LABEL[lang][v]).toMatch(/\S/)
    }
  })
  it('nefes aşaması → cümle: taraf, mırıldanma, düz', () => {
    const nose = makePlan({ pattern: 'nose' }).phases.map(phraseId)
    expect(nose).toEqual(['inL', 'outR', 'inR', 'outL'])
    expect(makePlan({ pattern: 'hum' }).phases.map(phraseId)).toEqual(['in', 'hum'])
    expect(makePlan({ pattern: 'box' }).phases.map(phraseId)).toEqual(['in', 'hold', 'out', 'hold2'])
    expect(makePlan({ pattern: 'sigh' }).phases.map(phraseId)).toEqual(['in', 'in2', 'out'])
    for (const id of ['calm', 'equal', 'sigh', 'belly', 'nose', 'hum', 'box', 'custom']) {
      for (const p of makePlan({ pattern: id }).phases) expect(PHRASE_IDS, `${id}:${p.kind}`).toContain(phraseId(p))
    }
  })
  it('index.json: yalnız bilinen cümleler; eksik ses boş küme', () => {
    const a = availableFrom({ tr: { female: { phrases: ['in', 'out', 'bilinmeyen'] } } })
    expect([...a.female]).toEqual(['in', 'out'])
    expect(a.male.size).toBe(0)
    expect(availableFrom(null).female.size).toBe(0)
  })
  it('sessizlik kırpma ve seviye eşitleme', () => {
    const s = new Float32Array(10000)
    for (let i = 3000; i < 6000; i++) s[i] = Math.sin(i / 5) * 0.4
    const b = trimBounds(s, { padSamples: 100 })
    expect(b.start).toBeGreaterThan(2800)
    expect(b.start).toBeLessThan(3001)
    expect(b.end).toBeGreaterThan(5999)
    expect(b.end).toBeLessThan(6200)
    expect(gainFor(b.peak) * b.peak).toBeCloseTo(TARGET_PEAK, 2)
    expect(trimBounds(new Float32Array(10)).end).toBe(0)
  })
  it('nefes ayarı ses seçmez (ses Profilim tercihinden gelir)', () => {
    expect(normalizeOpts({ voiceId: 'male' })).not.toHaveProperty('voiceId')
  })
  it('haftalık E testi cümleleri: onaylı metin birebir (ekrandaki cümle = ses dosyasındaki cümle)', () => {
    // Ses dosyaları bu metinlerle üretildi ve yazıya geri çevrilerek doğrulandı; metin değişirse ses yeniden üretilmeli
    expect(Object.fromEntries(Object.entries(PHRASES.tr).filter(([id]) => id.startsWith('acu')))).toEqual({
      acuCoverL: 'Sol gözünü avucunla ört, bastırma.',
      acuCoverR: 'Sağ gözünü avucunla ört, bastırma.',
      acuBoth: 'İki gözünü de açık tut.',
      acuWrong: 'Yanlış göz. Diğer gözünü ört.',
      acuCloser: 'Biraz yaklaştır.',
      acuFarther: 'Biraz uzaklaştır.',
      acuFace: 'Yüzünü kameraya göster.',
      acuPaused: 'Test durdu. Düzelince sürer.',
    })
    // Ekranda karşılığı olmayan cümleler pakette yok (başla, göz bitti, test bitti; eşleme lib/acuityFlow.js
    // setupPhraseId, denetim acuityFlow.test.js "ekrandaki cümle = sesli cümle")
    for (const id of ['acuStart', 'acuEyeDone', 'acuDone']) expect(PHRASE_IDS).not.toContain(id)
  })
  it('yorumlar var olan yardımcıya ve teste işaret eder (acuityFlow\'da olmayan eski ad kalmadı)', async () => {
    const flow = await import('./acuityFlow.js')
    const flowTest = readFileSync(new URL('./acuityFlow.test.js', import.meta.url), 'utf8')
    const gone = ['SPOKEN', 'ON', 'SCREEN'].join('_') // hiç var olmamış ad (bu dosyada düz yazılmaz)
    expect(flow[gone]).toBeUndefined()
    for (const file of ['./voicePack.js', './voicePack.test.js']) {
      const src = readFileSync(new URL(file, import.meta.url), 'utf8')
      expect(src.includes(gone), file).toBe(false)
      // yorumda acuityFlow modülünden adıyla anılan her yardımcı modülde gerçekten var
      for (const [, list] of src.matchAll(/lib\/acuityFlow\.js ([A-Za-z_]+(?:, [A-Z_a-z]+)*)/g)) {
        for (const name of list.split(', ')) expect(flow[name], `${file}: ${name}`).toBeDefined()
      }
      expect(src, file).toMatch(/acuityFlow\.test\.js "ekrandaki cümle = sesli cümle"/)
    }
    expect(flowTest).toMatch(/describe\('ekrandaki cümle = sesli cümle/)
  })
  it('paket: her dosya aynı biçimde (MPEG-1 Layer III, 44,1 kHz, 128 kbit/sn, tek kanal); listede olmayan dosya yok', () => {
    const dir = new URL('../../public/voice/', import.meta.url)
    // İlk ses çerçevesinin başlığı: ID3v2 etiketi (varsa) atlanır, 11 bitlik eşleme dizisi aranır
    const firstFrame = (buf) => {
      let i = 0
      if (buf.length > 10 && buf.toString('latin1', 0, 3) === 'ID3') {
        const size = ((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) | ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f)
        i = 10 + size + (buf[5] & 0x10 ? 10 : 0)
      }
      while (i + 4 <= buf.length && !(buf[i] === 0xff && (buf[i + 1] & 0xe0) === 0xe0)) i++
      if (i + 4 > buf.length) return null
      return {
        version: (buf[i + 1] >> 3) & 3, // 3 = MPEG-1
        layer: (buf[i + 1] >> 1) & 3, // 1 = Layer III
        bitrateIdx: buf[i + 2] >> 4, // MPEG-1 L3: 9 = 128 kbit/sn
        rateIdx: (buf[i + 2] >> 2) & 3, // 0 = 44,1 kHz
        mode: buf[i + 3] >> 6, // 3 = tek kanal
      }
    }
    for (const v of VOICES) {
      const files = readdirSync(new URL(`tr/${v}/`, dir)).filter((f) => f.endsWith('.mp3'))
      expect(files.map((f) => f.replace(/\.mp3$/, '')).sort(), `${v}: listede olmayan dosya`).toEqual([...PHRASE_IDS].sort())
      for (const f of files) {
        const buf = readFileSync(new URL(`tr/${v}/${f}`, dir))
        expect(buf.length, `${v}/${f}`).toBeGreaterThan(8000)
        expect(firstFrame(buf), `${v}/${f}`).toEqual({ version: 3, layer: 1, bitrateIdx: 9, rateIdx: 0, mode: 3 })
      }
    }
  })
  it('paket: index.json her iki seste bütün cümleleri listeler ve her dosya diskte var', () => {
    const dir = new URL('../../public/voice/', import.meta.url)
    const index = JSON.parse(readFileSync(new URL('index.json', dir), 'utf8'))
    const avail = availableFrom(index)
    for (const v of VOICES) {
      expect([...avail[v]].sort()).toEqual([...PHRASE_IDS].sort())
      for (const id of PHRASE_IDS) expect(existsSync(new URL(`tr/${v}/${id}.mp3`, dir))).toBe(true)
    }
  })
})
