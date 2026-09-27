// Seslendirme paketi: sesli komutlar ElevenLabs ile önceden üretilmiş ses dosyalarıdır (hangi ses ve model:
// voice/index.json); uygulama ağa çıkmaz, anahtar taşımaz. Dosyalar public/voice/{dil}/{ses}/{cümle}.mp3, liste public/voice/index.json.
// Dil başına cümleler aşağıda (yeni dil = yeni nesne + betikle üretim). Dosya yoksa ya da çözülemezse çağıran telefonun
// kendi sesine düşer (lib/cue.js speak). Çalarken baştaki/sondaki sessizlik kırpılır, ses seviyesi eşitlenir.

import { mediaPlayOnce } from './audioUnmute.js'
import { breathContext, unlockBreathSfx } from './breathSfx.js'

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

// Kenar yumuşatma: bazı dosyalarda ses ilk örnekte başlıyor ("Soldan", "Sağdan" s'si); tık sesi olmasın diye
// başa ve sona kısa doğrusal geçiş
export const FADE_SEC = 0.008

// ---- Tarayıcı / uygulama tarafı (WebAudio) ----
const base = () => (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || './'
let indexPromise = null
let indexCache = null
// Tanı (geliştirici derlemesinde ekranda): liste yüklendi mi, kaç dosya çözüldü, son hata, son çalma yolu
const status = { index: 'bekliyor', decoded: 0, failed: 0, error: '', path: '' }
export const voiceStatus = () => ({ ...status })
const note = (e) => { status.error = String(e?.name || e?.message || e).slice(0, 60) }
const buffers = new Map() // `${dil}/${ses}/${kimlik}` → { buffer, gain }
const loading = new Map() // aynı dosya iki kez indirilmesin (önceden yükleme + Dinle aynı anda)
let current = null

export function loadIndex() {
  if (!indexPromise) {
    indexPromise = fetch(`${base()}voice/index.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`index ${r.status}`))))
      .then((j) => { indexCache = j; status.index = 'var'; return j })
      .catch((e) => { status.index = 'yok'; note(e); return null })
  }
  return indexPromise
}

// Seçilen sesin bütün cümlelerini önceden çöz (Başla'dan önce çağrılır; seans sırasında gecikme olmasın)
export async function preloadVoice(ctx, voice, lang = VOICE_LANG) {
  if (!ctx || !VOICES.includes(voice)) return false
  const avail = availableFrom(await loadIndex(), lang)[voice]
  if (!avail.size) return false
  await Promise.all([...avail].map((id) => {
    const key = `${lang}/${voice}/${id}`
    if (buffers.has(key)) return null
    if (!loading.has(key)) loading.set(key, decodeOne(ctx, key).finally(() => loading.delete(key)))
    return loading.get(key)
  }))
  return true
}

// Tek dosya: indir, çöz, sessizliği kırp, seviyeyi hesapla
// decodeAudioData: eski WebKit yalnız geri çağırma biçimini destekler; ikisi de denenir
const decode = (ctx, ab) => new Promise((resolve, reject) => {
  try {
    const p = ctx.decodeAudioData(ab, resolve, reject)
    if (p && typeof p.then === 'function') p.then(resolve, reject)
  } catch (e) {
    reject(e)
  }
})

async function decodeOne(ctx, key) {
  try {
    const res = await fetch(`${base()}voice/${key}.mp3`)
    if (!res.ok) throw new Error(`mp3 ${res.status}`)
    const raw = await decode(ctx, await res.arrayBuffer())
    const { start, end, peak } = trimBounds(raw.getChannelData(0))
    if (end <= start) throw new Error('boş')
    const buf = ctx.createBuffer(raw.numberOfChannels, end - start, raw.sampleRate)
    for (let c = 0; c < raw.numberOfChannels; c++) buf.copyToChannel(raw.getChannelData(c).subarray(start, end), c)
    buffers.set(key, { buffer: buf, gain: gainFor(peak) })
    status.decoded++
  } catch (e) {
    // Web Audio çözemedi → playPhrase dosyayı medya öğesiyle çalar
    status.failed++
    note(e)
  }
}

// Çal: true = çalındı; false = bu seste dosya yok (çağıran telefonun sesine düşer). Önceki cümle kesilir.
// Önce Web Audio (kırpılmış, seviyesi eşitlenmiş); çözülemediyse aynı dosya medya öğesiyle.
export function playPhrase(ctx, voice, id, volume = 7, lang = VOICE_LANG) {
  if (volume <= 0) return false
  const key = `${lang}/${voice}/${id}`
  const item = buffers.get(key)
  if (ctx && item) {
    try {
      if (current) current.stop()
    } catch {
      // zaten bitti
    }
    try {
      const src = ctx.createBufferSource()
      const g = ctx.createGain()
      src.buffer = item.buffer
      const level = item.gain * Math.min(1, Math.max(0, volume / 10))
      const t0 = ctx.currentTime
      const t1 = t0 + item.buffer.duration
      g.gain.setValueAtTime(0, t0)
      g.gain.linearRampToValueAtTime(level, t0 + FADE_SEC)
      g.gain.setValueAtTime(level, Math.max(t0 + FADE_SEC, t1 - FADE_SEC))
      g.gain.linearRampToValueAtTime(0, t1)
      src.connect(g).connect(ctx.destination)
      src.start(t0)
      current = src
      status.path = 'webaudio'
      return true
    } catch (e) {
      note(e)
    }
  }
  // Liste okunamadıysa da dene: dosyalar kodla aynı pakette (voicePack.test.js her dosyanın varlığını denetler)
  if (indexCache ? !availableFrom(indexCache, lang)[voice]?.has(id) : !(VOICES.includes(voice) && PHRASE_IDS.includes(id))) return false
  status.path = 'medya'
  mediaPlayOnce(`${base()}voice/${key}.mp3`).then((ok) => { if (!ok) status.path = 'medya reddedildi' })
  return true
}

export const hasVoice = async (voice, lang = VOICE_LANG) => availableFrom(await loadIndex(), lang)[voice]?.size > 0

// Önizleme (Profilim ve modüllerdeki "Dinle"): kullanıcı dokunuşu içinde çağrılır. Döner: kayıtlı ses çaldı mı.
export async function previewVoice(voice, id = 'in', volume = 7) {
  unlockBreathSfx()
  const ctx = breathContext()
  await preloadVoice(ctx, voice)
  return playPhrase(ctx, voice, id, volume)
}
