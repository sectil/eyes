// Gökyüzü molası arka plan sesi: uygulama içinde üretilen doğa sesi (kayıt değil). Deniz: dalga kabarması ve köpük
// hışırtısı; dağ: rüzgâr + yaprak hışırtısı; şehir ve açık gökyüzü: yumuşak rüzgâr. İsteğe bağlı; kapatılabilir.
// Kanıt (gerçek kayıtlarla yapılmış çalışmalar): Buxton 2021, Fan & Baharum 2024, Alvarsson 2010 (lib/sources.js).
// Sessiz modda da duyulsun: sessiz <audio> döngüsü + navigator.audioSession (lib/audioUnmute.js; cihazda doğrulanacak).
import { mediaKeepAlive, setAudioSessionType } from './audioUnmute.js'

export function createAmbience() {
  let ac = null,
    amb = null
  function context() {
    try {
      ac = ac || new (globalThis.AudioContext || globalThis.webkitAudioContext)()
      if (ac.state === 'suspended') ac.resume().catch(() => {})
      return ac
    } catch {
      return null
    }
  }
  // Pembe gürültü (Paul Kellet yaklaşımı), 4 sn, iki kanal ayrı
  function noiseBuf(sec = 4) {
    const n = Math.floor(ac.sampleRate * sec),
      b = ac.createBuffer(2, n, ac.sampleRate)
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c)
      let b0 = 0,
        b1 = 0,
        b2 = 0
      for (let i = 0; i < n; i++) {
        const w = Math.random() * 2 - 1
        b0 = 0.99765 * b0 + w * 0.099
        b1 = 0.963 * b1 + w * 0.2965
        b2 = 0.57 * b2 + w * 1.0527
        d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.12
      }
    }
    return b
  }
  function stop() {
    if (!amb || !ac) return
    const { out, nodes } = amb
    amb = null
    out.gain.cancelScheduledValues(ac.currentTime)
    out.gain.setTargetAtTime(0.0001, ac.currentTime, 0.8)
    setTimeout(
      () =>
        nodes.forEach((n) => {
          try {
            n.stop?.()
            n.disconnect()
          } catch {
            /* bitti */
          }
        }),
      3500,
    )
  }
  return {
    // Kullanıcı dokunuşu içinde çağrılmalı (iOS)
    unlock() {
      setAudioSessionType('playback')
      mediaKeepAlive(true)
      return Boolean(context())
    },
    start(env, volume = 0.9) {
      stop()
      if (!context()) return false
      const out = ac.createGain()
      out.gain.setValueAtTime(0.0001, ac.currentTime)
      out.gain.linearRampToValueAtTime(volume, ac.currentTime + 4)
      out.connect(ac.destination)
      const src = ac.createBufferSource()
      src.buffer = noiseBuf()
      src.loop = true
      const nodes = [src, out]
      const lfo = (freq, depth, target, base) => {
        const o = ac.createOscillator()
        o.frequency.value = freq
        const gg = ac.createGain()
        gg.gain.value = depth
        o.connect(gg)
        gg.connect(target)
        target.value = base
        o.start()
        nodes.push(o, gg)
      }
      if (env === 'sea') {
        // Dalga: alçak geçiren gürültü, ~9 sn'lik kabarma; üstüne köpük hışırtısı
        const lp = ac.createBiquadFilter()
        lp.type = 'lowpass'
        lp.frequency.value = 700
        const swell = ac.createGain()
        lfo(1 / 9, 0.35, swell.gain, 0.45)
        lfo(1 / 13.7, 0.18, lp.frequency, 700)
        const hiss = ac.createBiquadFilter()
        hiss.type = 'bandpass'
        hiss.frequency.value = 2600
        hiss.Q.value = 0.6
        const hg = ac.createGain()
        lfo(1 / 9, 0.05, hg.gain, 0.05)
        src.connect(lp)
        lp.connect(swell)
        swell.connect(out)
        src.connect(hiss)
        hiss.connect(hg)
        hg.connect(out)
        nodes.push(lp, swell, hiss, hg)
      } else {
        // Rüzgâr: bant geçiren gürültü; frekansı ve şiddeti yavaşça kayar. Dağda yaprak hışırtısı eklenir.
        const bp = ac.createBiquadFilter()
        bp.type = 'bandpass'
        bp.Q.value = 0.8
        lfo(1 / 11, 180, bp.frequency, 420)
        const gust = ac.createGain()
        lfo(1 / 7.3, 0.22, gust.gain, 0.32)
        src.connect(bp)
        bp.connect(gust)
        gust.connect(out)
        nodes.push(bp, gust)
        if (env === 'hills') {
          const lv = ac.createBiquadFilter()
          lv.type = 'highpass'
          lv.frequency.value = 3500
          const lg = ac.createGain()
          lfo(1 / 5.1, 0.03, lg.gain, 0.035)
          src.connect(lv)
          lv.connect(lg)
          lg.connect(out)
          nodes.push(lv, lg)
        }
      }
      src.start()
      amb = { out, nodes }
      return true
    },
    stop,
    // Bitiş tonu (arka plan sesi kapalı olsa da)
    chime() {
      if (!context()) return
      const t = ac.currentTime
      ;[523.25, 783.99].forEach((f, k) => {
        const o = ac.createOscillator(),
          gg = ac.createGain()
        o.frequency.value = f
        gg.gain.setValueAtTime(0.0001, t + k * 0.12)
        gg.gain.exponentialRampToValueAtTime(0.18, t + k * 0.12 + 0.03)
        gg.gain.exponentialRampToValueAtTime(0.0001, t + k * 0.12 + 2.2)
        o.connect(gg)
        gg.connect(ac.destination)
        o.start(t + k * 0.12)
        o.stop(t + 2.6)
      })
    },
    close() {
      stop()
      setTimeout(() => {
        mediaKeepAlive(false)
        setAudioSessionType('auto')
      }, 3000)
    },
  }
}
