// Nefes aşama sesleri: kısa sentetik tonlar (dosya yok). WebAudio; iOS'ta bağlam kullanıcı dokunuşunda
// açılır (Başla düğmesi → unlockBreathSfx). volume 0–10.
let ctx = null
function context() {
  try {
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext
    if (!AC) return null
    ctx = ctx || new AC()
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    return ctx
  } catch {
    return null
  }
}
export function unlockBreathSfx() {
  context()
}

// id → [ {freq, type, ms, gain, delayMs} ... ]  (üst üste çalınır)
const RECIPES = {
  bell: [{ freq: 880, type: 'sine', ms: 700, gain: 0.5 }, { freq: 1760, type: 'sine', ms: 350, gain: 0.15 }],
  tick: [{ freq: 1500, type: 'square', ms: 30, gain: 0.25 }],
  wood: [{ freq: 220, type: 'triangle', ms: 90, gain: 0.6 }, { freq: 660, type: 'triangle', ms: 40, gain: 0.2 }],
  chime: [{ freq: 523, type: 'sine', ms: 900, gain: 0.35 }, { freq: 784, type: 'sine', ms: 900, gain: 0.25, delayMs: 60 }],
  notify: [{ freq: 660, type: 'sine', ms: 220, gain: 0.35 }, { freq: 880, type: 'sine', ms: 400, gain: 0.35, delayMs: 200 }],
  none: [],
}

export function playBreathSound(id, volume = 7) {
  const recipe = RECIPES[id] ?? []
  if (!recipe.length || volume <= 0) return
  const ac = context()
  if (!ac) return
  const v = Math.min(1, Math.max(0, volume / 10)) * 0.3
  for (const n of recipe) {
    try {
      const o = ac.createOscillator()
      const g = ac.createGain()
      const t0 = ac.currentTime + (n.delayMs ?? 0) / 1000
      o.type = n.type
      o.frequency.value = n.freq
      g.gain.setValueAtTime(0.0001, t0)
      g.gain.exponentialRampToValueAtTime(v * n.gain, t0 + 0.01)
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + n.ms / 1000)
      o.connect(g).connect(ac.destination)
      o.start(t0)
      o.stop(t0 + n.ms / 1000 + 0.02)
    } catch {
      // ses yok → yalnızca görsel + titreşim
    }
  }
}
