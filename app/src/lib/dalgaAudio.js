// Dalga ses motoru (WebAudio; dosya yok). Beste lib/dalgaMusic.js'ten olay olarak gelir, burada çalınır.
// iOS: bağlam kullanıcı dokunuşunda açılmalı (unlock). VARSAYIM (cihazda doğrulanacak): iPhone sessiz moddayken
// WebAudio susabilir; ekran kilitlenince ses durabilir.
import { makeComposer, stepSec, karplus, mtof, BINAURAL } from './dalgaMusic.js'
import { mediaKeepAlive } from './audioUnmute.js'

const LOOKAHEAD = 0.3 // sn
const TICK_MS = 25

export function createDalgaEngine() {
  let ac = null, master, bus, analyser, noiseBuf
  let bin = null
  const ks = new Map()
  const S = { running: false, paused: false, t0: 0, end: 0, next: 0, step: 0, timer: 0, compose: null, mode: null, volume: 0.6 }
  let events = [] // görsel için: { t, kind, cue? }
  const td = new Uint8Array(1024)

  // iPhone sessiz modda Web Audio susabilir. WebKit'in Audio Session API'si (navigator.audioSession) sayfanın sesini
  // "playback" türüne alır; sessiz tuşunda da çalar. VARSAYIM: WKWebView'de destekleniyor; cihazda doğrulanacak.
  // Desteklenmeyen tarayıcıda hiçbir şey yapmaz. Dalga bitince 'auto'ya döner (diğer sesler etkilenmesin).
  function sessionType(type) {
    try {
      const as = globalThis.navigator?.audioSession
      if (as && 'type' in as) as.type = type
    } catch {
      // desteklenmiyor
    }
  }
  function unlock() {
    sessionType('playback')
    mediaKeepAlive(true)
    try {
      const AC = globalThis.AudioContext || globalThis.webkitAudioContext
      if (!AC) return false
      if (!ac) {
        ac = new AC()
        master = ac.createGain()
        master.gain.value = 0.0001
        const comp = ac.createDynamicsCompressor()
        comp.threshold.value = -16
        comp.ratio.value = 3
        comp.attack.value = 0.01
        comp.release.value = 0.3
        bus = ac.createGain()
        bus.gain.value = 0.9
        const rev = ac.createConvolver()
        rev.buffer = impulse(3.4, 2.6)
        const wet = ac.createGain()
        wet.gain.value = 0.32
        bus.connect(comp)
        bus.connect(rev)
        rev.connect(wet)
        wet.connect(comp)
        comp.connect(master)
        analyser = ac.createAnalyser()
        analyser.fftSize = 1024
        master.connect(analyser)
        analyser.connect(ac.destination)
        noiseBuf = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.2), ac.sampleRate)
        const nd = noiseBuf.getChannelData(0)
        for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1
      }
      if (ac.state === 'suspended') ac.resume().catch(() => {})
      return true
    } catch {
      ac = null
      return false
    }
  }
  function impulse(sec, decay) {
    const n = Math.floor(ac.sampleRate * sec)
    const b = ac.createBuffer(2, n, ac.sampleRate)
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c)
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay)
    }
    return b
  }
  const panNode = (p = 0) => {
    if (ac.createStereoPanner) {
      const s = ac.createStereoPanner()
      s.pan.value = Math.max(-1, Math.min(1, p))
      return s
    }
    return ac.createGain()
  }
  const ping = (t, kind) => events.push({ t, kind, x: 0.15 + Math.random() * 0.7, y: 0.36 + Math.random() * 0.32 })

  // ---- Çalgılar ----
  function piano(t, midi, vel, dur = 4, pan = 0, show = true) {
    const f = mtof(midi)
    const out = ac.createGain()
    out.gain.setValueAtTime(0.0001, t)
    out.gain.linearRampToValueAtTime(vel * 0.32, t + 0.006)
    out.gain.exponentialRampToValueAtTime(Math.max(0.0002, vel * 0.11), t + 0.45)
    out.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    const lp = ac.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.setValueAtTime(Math.min(9000, f * 9), t)
    lp.frequency.exponentialRampToValueAtTime(Math.max(400, f * 2), t + dur * 0.8)
    const pn = panNode(pan)
    lp.connect(out)
    out.connect(pn)
    pn.connect(bus)
    for (const [n, a] of [[1, 1], [2, 0.42], [3, 0.2], [4, 0.1], [5, 0.05]]) {
      const o = ac.createOscillator()
      o.type = 'sine'
      o.frequency.value = f * n * (1 + 0.00035 * n * n) // hafif tel sertliği
      const g = ac.createGain()
      g.gain.value = a
      o.connect(g)
      g.connect(lp)
      o.start(t)
      o.stop(t + dur + 0.05)
    }
    if (show) ping(t, 'p')
  }
  function ksBuffer(midi) {
    if (ks.has(midi)) return ks.get(midi)
    const data = karplus(ac.sampleRate, mtof(midi), 2.6, Math.random, midi < 52 ? 0.997 : 0.9955)
    const buf = ac.createBuffer(1, data.length, ac.sampleRate)
    buf.getChannelData(0).set(data)
    ks.set(midi, buf)
    return buf
  }
  function guitar(t, midi, vel, dur = 2.4, pan = 0, show = true) {
    const s = ac.createBufferSource()
    s.buffer = ksBuffer(midi)
    const g = ac.createGain()
    g.gain.setValueAtTime(vel * 0.5, t)
    g.gain.setTargetAtTime(0.0001, t + dur * 0.6, dur * 0.18)
    const lp = ac.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 3200
    const pn = panNode(pan)
    s.connect(lp)
    lp.connect(g)
    g.connect(pn)
    pn.connect(bus)
    s.start(t)
    s.stop(t + dur + 0.2)
    if (show) ping(t, 'g')
  }
  function strum(t, notes, vel, up, dur) {
    const ns = up ? [...notes].reverse().slice(0, 4) : notes
    ns.forEach((n, k) => guitar(t + k * 0.014, n, vel * (0.85 + 0.15 * Math.random()), dur, (k / ns.length - 0.5) * 0.5, k === 0 && (up || Math.random() < 0.5)))
  }
  function pad(t, notes, dur, vel) {
    const out = ac.createGain()
    out.gain.setValueAtTime(0.0001, t)
    out.gain.linearRampToValueAtTime(vel, t + Math.min(1.8, dur * 0.35))
    out.gain.setValueAtTime(vel, t + dur * 0.75)
    out.gain.linearRampToValueAtTime(0.0001, t + dur + 1.8)
    const lp = ac.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 950
    lp.Q.value = 0.4
    lp.connect(out)
    out.connect(bus)
    for (const m of notes) {
      for (const c of [-5, 5]) {
        const o = ac.createOscillator()
        o.type = 'triangle'
        o.frequency.value = mtof(m)
        o.detune.value = c
        o.connect(lp)
        o.start(t)
        o.stop(t + dur + 2)
      }
    }
  }
  function bass(t, midi, vel, dur = 0.24) {
    const o = ac.createOscillator()
    o.type = 'triangle'
    o.frequency.value = mtof(midi)
    const g = ac.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.linearRampToValueAtTime(vel * 0.5, t + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    const lp = ac.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 500
    o.connect(lp)
    lp.connect(g)
    g.connect(bus)
    o.start(t)
    o.stop(t + dur + 0.05)
  }
  function kick(t, vel) {
    const o = ac.createOscillator()
    o.type = 'sine'
    o.frequency.setValueAtTime(120, t)
    o.frequency.exponentialRampToValueAtTime(44, t + 0.12)
    const g = ac.createGain()
    g.gain.setValueAtTime(vel * 0.9, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28)
    o.connect(g)
    g.connect(master)
    o.start(t)
    o.stop(t + 0.3)
  }
  function shaker(t, vel) {
    const s = ac.createBufferSource()
    s.buffer = noiseBuf
    const hp = ac.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 7000
    const g = ac.createGain()
    g.gain.setValueAtTime(vel * 0.22, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
    s.connect(hp)
    hp.connect(g)
    g.connect(bus)
    s.start(t)
    s.stop(t + 0.07)
  }
  // Binaural: sol kulak 200 Hz, sağ kulak 206 Hz. Yankıya girmez (kanallar karışmasın).
  function startBinaural(t) {
    const merger = ac.createChannelMerger(2)
    const g = ac.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.linearRampToValueAtTime(0.055, t + 5)
    const oscs = [BINAURAL.left, BINAURAL.right].map((f, ch) => {
      const o = ac.createOscillator()
      o.type = 'sine'
      o.frequency.value = f
      o.connect(merger, 0, ch)
      o.start(t)
      return o
    })
    merger.connect(g)
    g.connect(master)
    bin = { g, oscs }
  }
  function stopBinaural(t) {
    if (!bin) return
    bin.g.gain.setTargetAtTime(0.0001, t, 0.8)
    bin.oscs.forEach((o) => o.stop(t + 4))
    bin = null
  }

  function play(e, t) {
    if (e.inst === 'cue') return events.push({ t, kind: e.cue, cue: true })
    if (e.inst === 'piano') return piano(t, e.midi, e.vel, e.dur, e.pan, e.ping !== false)
    if (e.inst === 'guitar') return guitar(t, e.midi, e.vel, e.dur, e.pan)
    if (e.inst === 'strum') return strum(t, e.notes, e.vel, e.up, e.dur)
    if (e.inst === 'pad') return pad(t, e.notes, e.dur, e.vel)
    if (e.inst === 'bass') return bass(t, e.midi, e.vel, e.dur)
    if (e.inst === 'kick') return kick(t, e.vel)
    if (e.inst === 'shaker') return shaker(t, e.vel)
    return undefined
  }
  function schedule() {
    if (!S.running || S.paused || !ac) return
    const d = stepSec(S.mode)
    while (S.next < ac.currentTime + LOOKAHEAD) {
      if (S.next < S.end - 3) {
        const progress = Math.min(1, (S.next - S.t0) / (S.end - S.t0))
        for (const e of S.compose(S.step, progress)) play(e, S.next + (e.at ?? 0))
      }
      S.step++
      S.next += d
    }
  }
  const gainFor = (v) => Math.pow(Math.max(0, Math.min(1, v)), 1.6) * 0.95 + 0.0001

  return {
    unlock,
    get available() {
      return Boolean(ac)
    },
    now: () => (ac ? ac.currentTime : performance.now() / 1000),
    // seconds: oturum süresi; binaural: katman çalsın mı; volume 0..1
    start({ mode, seconds, binaural = false, volume = 0.6 }) {
      if (!unlock()) return false
      const t = ac.currentTime + 0.12
      Object.assign(S, { running: true, paused: false, t0: t, end: t + seconds, next: t, step: 0, mode, compose: makeComposer(mode), volume })
      events = []
      master.gain.cancelScheduledValues(t)
      master.gain.setValueAtTime(0.0001, t)
      master.gain.linearRampToValueAtTime(gainFor(volume), t + 3)
      master.gain.setValueAtTime(gainFor(volume), S.end - 3)
      master.gain.linearRampToValueAtTime(0.0001, S.end)
      if (binaural) startBinaural(t)
      clearInterval(S.timer)
      S.timer = setInterval(schedule, TICK_MS)
      schedule()
      return true
    },
    setVolume(v) {
      S.volume = v
      if (!ac || !S.running || S.paused) return
      const t = ac.currentTime
      if (t > S.end - 3) return
      master.gain.cancelScheduledValues(t)
      master.gain.setTargetAtTime(gainFor(v), t, 0.1)
      master.gain.setValueAtTime(gainFor(v), S.end - 3)
      master.gain.linearRampToValueAtTime(0.0001, S.end)
    },
    pause() {
      if (!ac || !S.running) return
      S.paused = true
      ac.suspend().catch(() => {})
    },
    resume() {
      if (!ac || !S.running) return
      S.paused = false
      ac.resume().catch(() => {})
    },
    stop(fast = true) {
      if (!ac) return
      clearInterval(S.timer)
      const wasRunning = S.running
      S.running = false
      S.paused = false
      if (ac.state === 'suspended') ac.resume().catch(() => {})
      const t = ac.currentTime
      if (wasRunning) {
        master.gain.cancelScheduledValues(t)
        master.gain.setTargetAtTime(0.0001, t, fast ? 0.35 : 0.9)
      }
      stopBinaural(t)
      setTimeout(() => { sessionType('auto'); mediaKeepAlive(false) }, 1500)
    },
    get paused() {
      return S.paused
    },
    // Tanı: bağlam durumu ('running' | 'suspended' | 'interrupted' | 'closed' | 'none') ve örnekleme hızı
    state: () => (ac ? ac.state : 'none'),
    sampleRate: () => (ac ? ac.sampleRate : 0),
    // Dokunuşla yeniden başlatma (iOS kesintiden sonra 'interrupted' kalabilir)
    kick() {
      if (!ac) return
      ac.resume().catch(() => {})
    },
    elapsed: () => (ac ? Math.max(0, Math.min(ac.currentTime, S.end) - S.t0) : 0),
    left: () => (ac ? Math.max(0, S.end - ac.currentTime) : 0),
    // Ses düzeyi (RMS, 0..~0.5)
    level() {
      if (!analyser || S.paused) return 0
      analyser.getByteTimeDomainData(td)
      let s = 0
      for (let i = 0; i < td.length; i++) {
        const v = (td[i] - 128) / 128
        s += v * v
      }
      return Math.sqrt(s / td.length)
    },
    // Görsel olaylar: süresi dolanlar atılır
    events(maxAge = 6) {
      const t = ac ? ac.currentTime : 0
      events = events.filter((e) => t - e.t < maxAge)
      return events
    },
    close() {
      sessionType('auto')
      mediaKeepAlive(false)
      clearInterval(S.timer)
      S.running = false
      try {
        ac?.close()
      } catch {
        // kapatılamazsa bırak
      }
      ac = null
    },
  }
}
