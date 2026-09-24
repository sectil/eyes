// Gözler kapalıyken yönlendirme: Türkçe sesli okuma varsa onu, yoksa ton kullanır.
// Ton kuralı: kapatma adımları kalın (330 Hz), açma adımları ince (880 Hz).

import { haptic } from './native.js'

let audioCtx = null

function tone(freq, ms = 180) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)()
    const o = audioCtx.createOscillator()
    const g = audioCtx.createGain()
    o.frequency.value = freq
    g.gain.setValueAtTime(0.15, audioCtx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + ms / 1000)
    o.connect(g).connect(audioCtx.destination)
    o.start()
    o.stop(audioCtx.currentTime + ms / 1000)
  } catch {
    // ses yok → yalnızca görsel
  }
}

function turkishVoiceAvailable() {
  try {
    return window.speechSynthesis?.getVoices().some((v) => v.lang?.toLowerCase().startsWith('tr'))
  } catch {
    return false
  }
}

// Kullanıcı dokunuşu içinde çağrılmalı (tarayıcılar sesi ancak etkileşimden sonra açar)
export function unlockAudio() {
  tone(1, 1)
  try {
    window.speechSynthesis?.getVoices()
  } catch {
    // yoksay
  }
}

export function cue(text, closed) {
  haptic(closed ? 'warning' : 'success')
  if (turkishVoiceAvailable()) {
    try {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'tr-TR'
      u.rate = 1.1
      window.speechSynthesis.speak(u)
      return
    } catch {
      // tona düş
    }
  }
  tone(closed ? 330 : 880)
}
