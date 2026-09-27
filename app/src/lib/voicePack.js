// Seslendirme paketi: sesli komutlar ElevenLabs ile önceden üretilmiş ses dosyalarıdır (scripts/voices.mjs); uygulama
// ağa çıkmaz, anahtar taşımaz. Dosyalar public/voice/{dil}/{ses}/{cümle}.mp3, liste public/voice/index.json.
// Dil başına cümleler aşağıda (yeni dil = yeni nesne + betikle üretim). Dosya yoksa ya da çözülemezse çağıran telefonun
// kendi sesine düşer (lib/cue.js speak). Çalarken baştaki/sondaki sessizlik kırpılır, ses seviyesi eşitlenir.

export const VOICE_LANG = 'tr'
export const VOICES = ['female', 'male']
export const VOICE_LABEL = { tr: { female: 'Kadın', male: 'Erkek' } }

// Cümleler: nokta, kısa komutun kesik değil doğal bitmesi için (üretimde tonlama)
export const PHRASES = {
  tr: {
    prep: 'Hazırlan.',
    in: 'Nefes al.',
    in2: 'Biraz daha.',
    hold: 'Tut.',
    out: 'Nefes ver.',
    hold2: 'Bekle.',
    inL: 'Soldan al.',
    inR: 'Sağdan al.',
    outL: 'Soldan ver.',
    outR: 'Sağdan ver.',
    hum: 'Mırıldanarak ver.',
    done: 'Tamamlandı.',
  },
}
export const PHRASE_IDS = Object.keys(PHRASES.tr)

// Nefes aşaması → cümle kimliği (lib/breath.js phases: kind, side, hum)
export function phraseId(phase) {
  if (!phase) return null
  if (phase.side && (phase.kind === 'in' || phase.kind === 'out')) return `${phase.kind}${phase.side}`
  if (phase.hum && phase.kind === 'out') return 'hum'
  return phase.kind
}

// index.json: { [dil]: { [ses]: { phrases: [kimlik…], voiceName?, model?, date? } } } → hangi seste hangi cümle var
export function availableFrom(index, lang = VOICE_LANG) {
  const out = {}
  const byLang = index && typeof index === 'object' ? index[lang] : null
  for (const v of VOICES) {
    const list = Array.isArray(byLang?.[v]?.phrases) ? byLang[v].phrases.filter((p) => PHRASE_IDS.includes(p)) : []
    out[v] = new Set(list)
  }
  return out
}

// Baştaki ve sondaki sessizliği bul: eşik tepe değerin oranı; yumuşak kesim için kenarda pay bırakılır
export function trimBounds(samples, { threshold = 0.02, padSamples = 441 } = {}) {
  let peak = 0
  for (let i = 0; i < samples.length; i++) {
    const a = Math.abs(samples[i])
    if (a > peak) peak = a
  }
  if (peak === 0) return { start: 0, end: 0, peak: 0 }
  const th = peak * threshold
  let start = 0
  while (start < samples.length && Math.abs(samples[start]) < th) start++
  let end = samples.length - 1
  while (end > start && Math.abs(samples[end]) < th) end--
  return { start: Math.max(0, start - padSamples), end: Math.min(samples.length, end + 1 + padSamples), peak }
}

// Ses seviyesi eşitleme: tüm cümleler aynı tepe değere (farklı cümleler arasında sıçrama olmasın)
export const TARGET_PEAK = 0.8
export const gainFor = (peak) => (peak > 0 ? Math.min(4, TARGET_PEAK / peak) : 1)

// ---- Tarayıcı / uygulama tarafı (WebAudio) ----
const base = () => (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || './'
let indexPromise = null
const buffers = new Map() // `${dil}/${ses}/${kimlik}` → { buffer, gain }
let current = null

export function loadIndex() {
  if (!indexPromise) {
    indexPromise = fetch(`${base()}voice/index.json`, { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
  }
  return indexPromise
}

// Seçilen sesin bütün cümlelerini önceden çöz (Başla'dan önce çağrılır; seans sırasında gecikme olmasın)
export async function preloadVoice(ctx, voice, lang = VOICE_LANG) {
  if (!ctx || !VOICES.includes(voice)) return false
  const avail = availableFrom(await loadIndex(), lang)[voice]
  if (!avail.size) return false
  await Promise.all([...avail].map(async (id) => {
    const key = `${lang}/${voice}/${id}`
    if (buffers.has(key)) return
    try {
      const res = await fetch(`${base()}voice/${key}.mp3`)
      if (!res.ok) return
      const raw = await ctx.decodeAudioData(await res.arrayBuffer())
      const ch = raw.getChannelData(0)
      const { start, end, peak } = trimBounds(ch)
      if (end <= start) return
      const buf = ctx.createBuffer(raw.numberOfChannels, end - start, raw.sampleRate)
      for (let c = 0; c < raw.numberOfChannels; c++) buf.copyToChannel(raw.getChannelData(c).subarray(start, end), c)
      buffers.set(key, { buffer: buf, gain: gainFor(peak) })
    } catch {
      // bu cümle yok → telefonun sesi
    }
  }))
  return true
}

// Çal: true = çalındı; false = dosya yok (çağıran telefonun sesine düşer). Önceki cümle kesilir (üst üste binmesin).
export function playPhrase(ctx, voice, id, volume = 7, lang = VOICE_LANG) {
  const item = buffers.get(`${lang}/${voice}/${id}`)
  if (!ctx || !item || volume <= 0) return false
  try {
    if (current) current.stop()
  } catch {
    // zaten bitti
  }
  try {
    const src = ctx.createBufferSource()
    const g = ctx.createGain()
    src.buffer = item.buffer
    g.gain.value = item.gain * Math.min(1, Math.max(0, volume / 10))
    src.connect(g).connect(ctx.destination)
    src.start()
    current = src
    return true
  } catch {
    return false
  }
}

export const hasVoice = async (voice, lang = VOICE_LANG) => availableFrom(await loadIndex(), lang)[voice]?.size > 0
