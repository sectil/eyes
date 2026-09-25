// Dalga besteleri: saf fonksiyonlar (ses çalmaz, olay listesi döndürür; lib/dalgaAudio.js çalar).
// Adım = sekizlik nota. Her çağrı bir adımın olaylarını verir; notalar her oturumda biraz farklı dizilir (r).
// Tempolar ve tonlar taslaktaki (onaylı) değerler; VARSAYIM: tek bir "doğru" tempo ya da frekans yok.

export const TEMPO = { sakin: 60, guc: 72, motive: 116 }
export const stepSec = (mode) => 60 / TEMPO[mode] / 2
export const SILENT_EVERY = 6 // Sakin: her 6 ölçünün sonuncusu tam sessiz (Bernardi 2005)
export const BINAURAL = { left: 200, right: 206 } // Hz; fark 6 Hz (teta). VARSAYIM: çalışmalar farklı değerler kullandı.

export const PROG = {
  sakin: [[50, 57, 61, 66], [47, 54, 57, 62], [43, 50, 54, 59], [45, 52, 59, 61]], // Re majör: Dmaj7 Bm7 Gmaj7 Asus
  guc: [[48, 55, 60, 64], [47, 55, 59, 62], [45, 52, 57, 60], [41, 53, 57, 60], [40, 55, 60, 64], [41, 57, 60, 65], [43, 55, 59, 62], [48, 55, 60, 64, 67]], // Do majör, yükselen
  motive: [[45, 52, 57, 60, 64], [41, 53, 57, 60, 65], [48, 52, 55, 60, 64], [43, 50, 55, 59, 62]], // La minör: Am F C G
}
const SAKIN_SCALE = [62, 64, 66, 69, 71, 74, 76, 78, 81] // Re majör pentatonik
const HOOK = [[0, 76], [3, 74], [6, 72], [8, 69], [11, 72], [14, 74]] // Motivasyon piyano motifi (2 ölçü)

const pickWith = (r, a) => a[Math.floor(r() * a.length)]

// Olay: { inst: 'piano'|'guitar'|'strum'|'pad'|'bass'|'kick'|'shaker'|'cue', at (sn, adım içi), midi?, notes?, vel, dur, pan?, up?, ping?, cue? }
// progress: oturumun ilerleyişi 0..1 (Güç'te yoğunluk artar)
export function makeComposer(mode, r = Math.random) {
  const d = stepSec(mode)
  let mel = 3
  if (mode === 'sakin') {
    return (i) => {
      const bar = Math.floor(i / 8), pos = i % 8
      if (bar % SILENT_EVERY === SILENT_EVERY - 1) return pos === 0 ? [{ inst: 'cue', cue: 'silence', at: 0 }] : []
      const ch = PROG.sakin[(bar - Math.floor(bar / SILENT_EVERY)) % 4]
      const ev = []
      if (pos === 0) {
        ev.push({ inst: 'pad', notes: ch, vel: 0.07, dur: 8 * d, at: 0 })
        ev.push({ inst: 'piano', midi: ch[0], vel: 0.34, dur: 6, pan: -0.2, at: 0 })
      }
      if ((pos === 0 || pos === 3 || pos === 4 || pos === 6) && r() < 0.78) {
        ev.push({ inst: 'piano', midi: pickWith(r, ch.slice(1)) + 12, vel: 0.18 + r() * 0.08, dur: 4.5, pan: r() - 0.5, at: r() * 0.02 })
      }
      if ((pos === 2 || pos === 6) && r() < 0.38) {
        mel = Math.max(0, Math.min(SAKIN_SCALE.length - 1, mel + pickWith(r, [-2, -1, -1, 1, 1, 2])))
        ev.push({ inst: 'piano', midi: SAKIN_SCALE[mel], vel: 0.26, dur: 5, pan: 0.25, at: 0 })
      }
      if (pos === 4 && r() < 0.5) ev.push({ inst: 'guitar', midi: ch[1] + 12, vel: 0.28, dur: 3, pan: -0.35, at: 0 })
      return ev
    }
  }
  if (mode === 'guc') {
    return (i, progress = 0) => {
      const bar = Math.floor(i / 8), pos = i % 8, ch = PROG.guc[bar % 8]
      const lift = 0.7 + 0.3 * Math.min(1, Math.max(0, progress))
      const up = ch.map((n) => n + 12).slice(0, 4)
      const ev = []
      if (pos === 0) {
        ev.push({ inst: 'pad', notes: ch.slice(1), vel: 0.06 + 0.03 * progress, dur: 8 * d, at: 0 })
        ch.forEach((n, k) => ev.push({ inst: 'piano', midi: n, vel: 0.2 * lift, dur: 4.5, pan: k * 0.1 - 0.2, at: k * 0.008, ping: k === 0 }))
        ev.push({ inst: 'strum', notes: up, vel: 0.22 * lift, dur: 2.4, up: false, at: 0 })
      }
      if (pos === 4 && progress > 0.2) ev.push({ inst: 'strum', notes: up, vel: 0.16 * lift, dur: 1.6, up: true, at: 0 })
      if (pos > 0) ev.push({ inst: 'piano', midi: ch[pos % ch.length] + 12 + (pos > 4 ? 12 : 0), vel: 0.12 * lift, dur: 2.6, pan: pos / 8 - 0.4, at: 0, ping: false })
      if (bar % 8 >= 4 && pos === 0) ev.push({ inst: 'piano', midi: ch[ch.length - 1] + 12 + (bar % 8 === 7 ? 12 : 0), vel: 0.3 * lift, dur: 5, pan: 0.2, at: 0 })
      return ev
    }
  }
  // motive
  return (i) => {
    const bar = Math.floor(i / 8), pos = i % 8, ch = PROG.motive[bar % 4]
    const ev = []
    if (pos % 2 === 0) ev.push({ inst: 'kick', vel: pos === 0 ? 0.55 : 0.4, at: 0 })
    else ev.push({ inst: 'shaker', vel: 0.8, at: 0 })
    ev.push({ inst: 'bass', midi: ch[0] - 12 + (pos % 2 ? 12 : 0), vel: 0.55, dur: 0.24, at: 0 })
    if ([0, 2, 3, 5, 6, 7].includes(pos)) {
      ev.push({ inst: 'strum', notes: ch.slice(1).map((n) => (n > 60 ? n : n + 12)), vel: pos === 0 ? 0.26 : 0.17, dur: 0.4, up: pos % 2 === 1, at: 0 })
    }
    if (bar >= 4 && bar % 4 < 2) {
      const h = HOOK.find(([p]) => p === (bar % 2) * 8 + pos)
      if (h) ev.push({ inst: 'piano', midi: h[1], vel: 0.26, dur: 1.6, pan: 0.3, at: 0 })
    }
    if (bar >= 4 && bar % 4 === 0 && pos === 0) ev.push({ inst: 'pad', notes: ch.slice(1, 4).map((n) => n + 12), vel: 0.035, dur: 16 * d, at: 0 })
    return ev
  }
}

// Karplus–Strong tel sentezi (gitar): gürültüyle dolu bir halka, her turda komşu ortalamasıyla söner.
// Saf; Float32Array döndürür. Ortalama yarım örnek gecikme ekler: halka boyu sr/f − 0,5.
export function karplus(sampleRate, freq, seconds, r = Math.random, damp = 0.996, bright = 0.55) {
  const N = Math.max(2, Math.round(sampleRate / freq - 0.5))
  const len = Math.floor(sampleRate * seconds)
  const out = new Float32Array(len)
  const ring = new Float32Array(N)
  let prev = 0
  for (let i = 0; i < N; i++) {
    prev += bright * (r() * 2 - 1 - prev)
    ring[i] = prev
  }
  let idx = 0
  for (let i = 0; i < len; i++) {
    const a = ring[idx]
    const nx = idx + 1 === N ? 0 : idx + 1
    out[i] = a
    ring[idx] = damp * 0.5 * (a + ring[nx])
    idx = nx
  }
  return out
}
export const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12)
