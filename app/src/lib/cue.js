// Gözler kapalıyken yönlendirme: Türkçe sesli okuma varsa onu, yoksa ton kullanır.
// Ton kuralı: kapatma adımları kalın (330 Hz), açma adımları ince (880 Hz).
// Ayarlardan ses kapalıysa konuşma/ton çalınmaz; titreşim haptic() üzerinden kendi tercihine uyar.

import { haptic, initFeedback } from './native.js'
import { getPrefs, subscribePrefs } from './prefs.js'

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

function stopSpeech() {
  try {
    window.speechSynthesis?.cancel()
  } catch {
    // yoksay
  }
}

// Ses egzersiz ortasında kapatılırsa süren konuşmayı hemen kes.
subscribePrefs((next) => {
  if (!next.sound) stopSpeech()
})

// Kullanıcı dokunuşu içinde çağrılmalı (tarayıcılar sesi ancak etkileşimden sonra açar).
// Ses kapalı olsa da kilidi açar (1 Hz / 1 ms, duyulmaz): egzersiz sırasında ses açılırsa hazır olsun.
export function unlockAudio() {
  initFeedback() // iPhone ses modu (tekrar çağrı zararsız)
  tone(1, 1)
  try {
    window.speechSynthesis?.getVoices()
  } catch {
    // yoksay
  }
}

// Yalnızca konuşma (titreşimsiz): nefes aşamaları gibi kendi titreşimini veren yerler için
export function speak(text, { rate = 1.1, fallbackTone = 660 } = {}) {
  if (!getPrefs().sound) return
  if (turkishVoiceAvailable()) {
    try {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'tr-TR'
      u.rate = rate
      window.speechSynthesis.speak(u)
      return
    } catch {
      // tona düş
    }
  }
  tone(fallbackTone, 120)
}

export function cue(text, closed) {
  haptic(closed ? 'warning' : 'success')
  if (!getPrefs().sound) return
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
