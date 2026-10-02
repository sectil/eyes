// Oyun sesleri — Web Audio ile sentezlenir (ses dosyası yok, çevrimdışı çalışır).
// Ayarlar: getPrefs().sound kapalıysa hiçbir ses çalınmaz (src/lib/prefs.js).
// iOS/Safari: AudioContext yalnızca kullanıcı dokunuşu içinde açılabilir → oyunu başlatan
// dokunuşta unlockSfx() çağrılır. Uygulama arka plana gidince bağlam 'interrupted' /
// 'suspended' olabilir; çalmadan önce resume denenir, açılamazsa ses sessizce atlanır
// (askıdaki bağlama zamanlanan sesler sonradan toplu çalmasın diye).
// Sessiz tuşu: iOS'ta Web Audio varsayılan olarak sessiz tuşuna uyar; native Feedback
// eklentisi (setAudioMode) bunu prefs.sound'a göre ayarlar (native.js initFeedback).

import { getPrefs } from './prefs.js'

let ctx = null
let master = null
let noiseBuf = null

function context() {
  if (ctx) return ctx
  try {
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.8
    master.connect(ctx.destination)
  } catch {
    ctx = null
    master = null
  }
  return ctx
}

function soundOn() {
  try {
    return getPrefs()?.sound !== false
  } catch {
    return true
  }
}

// Kullanıcı dokunuşu içinde çağır (ör. "Başla"). Ses kapalı olsa da bağlam açılır;
// kullanıcı oyun sırasında sesi açarsa hemen çalabilsin.
export function unlockSfx() {
  const c = context()
  if (!c) return
  try {
    if (c.state !== 'running') c.resume?.().catch(() => {})
  } catch {
    // yoksay
  }
  try {
    // iOS: dokunuş içinde çalınan sessiz tampon bağlamı kalıcı olarak açar
    const b = c.createBuffer(1, 1, c.sampleRate)
    const s = c.createBufferSource()
    s.buffer = b
    s.connect(c.destination)
    s.start(0)
  } catch {
    // yoksay
  }
}

// Tek nota: zarf (hızlı atak, üstel sönüm) + isteğe bağlı perde kayması ve alçak geçiren süzgeç
function note(c, { type = 'triangle', freq, to = null, at = 0, dur = 0.12, vol = 0.18, attack = 0.006, lowpass = null }) {
  const t0 = c.currentTime + at
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t0)
  if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(vol, t0 + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  let out = o
  if (lowpass) {
    const f = c.createBiquadFilter()
    f.type = 'lowpass'
    f.frequency.setValueAtTime(lowpass, t0)
    out.connect(f)
    out = f
  }
  out.connect(g).connect(master)
  o.start(t0)
  o.stop(t0 + dur + 0.03)
}

function noise(c, { at = 0, dur = 0.25, vol = 0.12, lowpass = 1400 }) {
  if (!noiseBuf) {
    const len = Math.floor(c.sampleRate * 0.5)
    noiseBuf = c.createBuffer(1, len, c.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  }
  const t0 = c.currentTime + at
  const src = c.createBufferSource()
  src.buffer = noiseBuf
  const f = c.createBiquadFilter()
  f.type = 'lowpass'
  f.frequency.setValueAtTime(lowpass, t0)
  f.frequency.exponentialRampToValueAtTime(120, t0 + dur)
  const g = c.createGain()
  g.gain.setValueAtTime(vol, t0)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  src.connect(f).connect(g).connect(master)
  src.start(t0)
  src.stop(t0 + dur + 0.03)
}

// Notalar (Hz)
const C5 = 523.25
const E5 = 659.25
const G5 = 783.99
const C6 = 1046.5
const E6 = 1318.51
const G6 = 1567.98

const SOUNDS = {
  // Yem: iki hızlı, parlak nota; seviye arttıkça perde hafifçe yükselir
  eat(c, { level = 1 } = {}) {
    const k = 2 ** (Math.min(Math.max(level, 1) - 1, 8) / 24) // seviye başına yarım ton/2
    note(c, { type: 'square', freq: 880 * k, dur: 0.06, vol: 0.07, lowpass: 3200 })
    note(c, { type: 'triangle', freq: 1320 * k, at: 0.055, dur: 0.11, vol: 0.16 })
  },
  // Dönüş: çok kısa, yumuşak tık
  turn(c) {
    note(c, { type: 'sine', freq: 1500, dur: 0.03, vol: 0.05, attack: 0.002 })
  },
  // Çarpma: düşen testere + gürültü patlaması
  crash(c) {
    note(c, { type: 'sawtooth', freq: 320, to: 55, dur: 0.5, vol: 0.14, lowpass: 1100 })
    noise(c, { dur: 0.3, vol: 0.14 })
  },
  // Başlangıç: yükselen arpej
  start(c) {
    note(c, { freq: C5, dur: 0.12, vol: 0.14 })
    note(c, { freq: E5, at: 0.08, dur: 0.12, vol: 0.14 })
    note(c, { freq: G5, at: 0.16, dur: 0.12, vol: 0.14 })
    note(c, { freq: C6, at: 0.24, dur: 0.26, vol: 0.16 })
  },
  // Geri sayım vuruşu
  count(c) {
    note(c, { type: 'sine', freq: 660, dur: 0.09, vol: 0.12 })
  },
  // Hızlandı: kısa üçlü
  level(c) {
    note(c, { freq: G5, dur: 0.07, vol: 0.1 })
    note(c, { freq: C6, at: 0.06, dur: 0.07, vol: 0.1 })
    note(c, { freq: E6, at: 0.12, dur: 0.14, vol: 0.12 })
  },
  // Rekor: fanfar + akor
  record(c) {
    note(c, { freq: G5, dur: 0.1, vol: 0.13 })
    note(c, { freq: C6, at: 0.1, dur: 0.1, vol: 0.13 })
    note(c, { freq: E6, at: 0.2, dur: 0.1, vol: 0.13 })
    note(c, { freq: G6, at: 0.3, dur: 0.16, vol: 0.14 })
    for (const f of [C6, E6, G6]) note(c, { freq: f, at: 0.46, dur: 0.6, vol: 0.07, attack: 0.02 })
  },
  // Duraklatma / devam
  pause(c) {
    note(c, { freq: E5, dur: 0.1, vol: 0.12 })
    note(c, { freq: C5, at: 0.09, dur: 0.16, vol: 0.12 })
  },
  resume(c) {
    note(c, { freq: C5, dur: 0.1, vol: 0.12 })
    note(c, { freq: E5, at: 0.09, dur: 0.16, vol: 0.12 })
  },
}

export const SFX_NAMES = Object.keys(SOUNDS)

// name: 'eat' | 'turn' | 'crash' | 'start' | 'count' | 'level' | 'record' | 'pause' | 'resume'
export function playSfx(name, opts) {
  if (!SOUNDS[name] || !soundOn()) return
  const c = context()
  if (!c || !master) return
  try {
    if (c.state !== 'running') {
      c.resume?.().catch(() => {})
      return
    }
    SOUNDS[name](c, opts)
  } catch {
    // ses yok → oyun sessiz devam eder
  }
}
