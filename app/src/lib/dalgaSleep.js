// Dalga uyku modu: müzik önce bir döngü olarak hazırlanır (OfflineAudioContext), sonra HTML <audio> ile döngüde
// çalınır; telefon kilitliyken de sürsün diye (Info.plist UIBackgroundModes: audio). Süre bitmeden önce ayrı hazırlanmış
// "kısılan" parçaya geçilir ve o parça sessizlikle biter. Binaural katman yok. Ekranda soluk saat.
// VARSAYIM (cihazda doğrulanacak): kilitli ekranda WKWebView'de <audio> ve JS sayacı çalışmayı sürdürür; dokunuşla
// açılmış aynı <audio> öğesine sonradan yeni kaynak verilip çalınabilir.
import { makeComposer, stepSec, SILENT_EVERY } from './dalgaMusic.js'
import { buildGraph, makeVoices } from './dalgaAudio.js'
import { encodeWav } from './wav.js'
import { mediaPlay, mediaKeepAlive } from './audioUnmute.js'

export const SLEEP_RATE = 22050
export const SLEEP_FADE_MAX = 180 // sn: son 3 dakikada yavaşça kısılır
// Döngü: Sakin'de 24 ölçü (6'lık 4 blok; son ölçü sessiz → doğal döngü noktası) = 96 sn
export const loopSeconds = (mode = 'sakin') => stepSec(mode) * 8 * SILENT_EVERY * 4
export const fadeSeconds = (totalSec) => Math.max(5, Math.min(SLEEP_FADE_MAX, totalSec / 2))

// Kısılma eğrisi 1 → 0 (kosinüs; kulakta düzgün)
export const fadeGain = (x) => (x <= 0 ? 1 : x >= 1 ? 0 : 0.5 * (1 + Math.cos(Math.PI * x)))

// Döngü sonundaki kuyruğu (yankı, uzayan notalar) başa ekle: dikişsiz döngü. Saf.
export function foldTail(data, loopLen) {
  const out = data.slice(0, loopLen)
  for (let i = loopLen; i < data.length; i++) out[i - loopLen] += data[i]
  return out
}
// Döngüden istenen uzunlukta kısılan parça (baştan sarar). Saf.
export function fadeFrom(loop, len) {
  const out = new Float32Array(len)
  for (let i = 0; i < len; i++) out[i] = loop[i % loop.length] * fadeGain(i / len)
  return out
}

export async function renderLoop(mode = 'sakin', { sampleRate = SLEEP_RATE, tail = 8, level = 0.8 } = {}) {
  const OAC = globalThis.OfflineAudioContext || globalThis.webkitOfflineAudioContext
  if (!OAC) throw new Error('OfflineAudioContext yok')
  const L = loopSeconds(mode)
  const ctx = new OAC(2, Math.ceil((L + tail) * sampleRate), sampleRate)
  const g = buildGraph(ctx, ctx.destination)
  g.master.gain.value = level
  const voices = makeVoices(ctx, g)
  const compose = makeComposer(mode)
  const d = stepSec(mode)
  const steps = Math.round(L / d)
  for (let i = 0; i < steps; i++) for (const e of compose(i, 0.5)) voices.play(e, 0.05 + i * d + (e.at ?? 0))
  const buf = await ctx.startRendering()
  const len = Math.round(L * sampleRate)
  return { sampleRate, channels: [0, 1].map((c) => foldTail(buf.getChannelData(c), len)) }
}

const urlOf = (bytes) => URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' }))

// Uyku oynatıcı. onTick({ left }) ve onEnd() ile ekranı bilgilendirir.
export function createSleepPlayer() {
  let timer = 0, urls = [], phase = 'idle', endAt = 0, fadeAt = 0, startedAt = 0, fadeUrl = null
  const cleanup = () => { clearInterval(timer); urls.forEach((u) => URL.revokeObjectURL(u)); urls = [] }
  return {
    get phase() { return phase },
    // Hazırla ve başlat. totalSec: kullanıcının seçtiği süre.
    async start({ mode = 'sakin', totalSec, onTick, onEnd }) {
      phase = 'preparing'
      const r = await renderLoop(mode)
      const F = fadeSeconds(totalSec)
      const loopUrl = urlOf(encodeWav(r.channels, r.sampleRate))
      fadeUrl = urlOf(encodeWav(r.channels.map((ch) => fadeFrom(ch, Math.round(F * r.sampleRate))), r.sampleRate))
      urls = [loopUrl, fadeUrl]
      if (phase === 'stopped') { cleanup(); return false }
      startedAt = Date.now()
      endAt = startedAt + totalSec * 1000
      fadeAt = endAt - F * 1000
      phase = 'loop'
      mediaPlay(loopUrl, { loop: true })
      timer = setInterval(() => {
        const now = Date.now()
        if (phase === 'loop' && now >= fadeAt) {
          phase = 'fade'
          mediaPlay(fadeUrl, { loop: false })
        }
        onTick?.({ left: Math.max(0, (endAt - now) / 1000) })
        if (now >= endAt + 1500) {
          this.stop()
          onEnd?.()
        }
      }, 500)
      return true
    },
    elapsed: () => (startedAt ? Math.min(Date.now(), endAt) - startedAt : 0) / 1000,
    stop() {
      if (phase === 'stopped') return
      phase = 'stopped'
      cleanup()
      mediaKeepAlive(false)
    },
  }
}
