// Dalga uyku modu: hazır döngü (uygulama içindeki dosya) HTML <audio> ile döngüde çalınır; telefon kilitliyken de
// sürsün diye (Info.plist UIBackgroundModes: audio). Süre bitmeden önce "kısılan" parçaya geçilir ve o parça sessizlikle
// biter. Binaural katman yok. Ekranda soluk saat. renderLoop yalnız dosyaları üretmek için (design/dalga-uyku).
// VARSAYIM (cihazda doğrulanacak): kilitli ekranda WKWebView'de <audio> ve JS sayacı çalışmayı sürdürür; dokunuşla
// açılmış aynı <audio> öğesine sonradan yeni kaynak verilip çalınabilir; Capacitor uygulama içi dosyayı (Range) verir.
import { makeComposer, stepSec, SILENT_EVERY } from './dalgaMusic.js'
import { buildGraph, makeVoices } from './dalgaAudio.js'
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

// Uyku müziği uygulamanın içinde hazır gelir (design/dalga-uyku; Bug 22): cihazda üretmek 10+ sn sürüyordu, "Başlat"
// o arada kapalı kalıyordu. sakin-loop.wav: 96 sn boşluksuz döngü; sakin-fade-{F}.mp3: her kısılma süresi için tam
// uzunlukta parça (baştan tam sesle başlar, sonunda susar). Tam dakikalık sürelerde F hep bu kümededir (fadeSeconds).
export const SLEEP_FADES = [30, 60, 90, 120, 150, 180]
const base = () => (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || './'
export const sleepLoopUrl = () => `${base()}sleep/sakin-loop.wav`
// F sn kısılma, kalan left sn: F'ye eşit ya da ondan uzun en kısa parça; kalan süreye göre ortasından başlar (#t=).
// Geçiş (zamanlayıcı kilitli ekranda gecikirse) geç olursa parça yine tam bitiş anında susar.
export function sleepFadeUrl(F, left = F) {
  const len = SLEEP_FADES.find((x) => x >= F - 0.01) ?? SLEEP_FADE_MAX
  const at = Math.max(0, Math.round((len - Math.max(0, Math.min(left, len))) * 10) / 10)
  return `${base()}sleep/sakin-fade-${len}.mp3${at > 0 ? `#t=${at}` : ''}`
}

// Uyku oynatıcı. onTick({ left }) ve onEnd() ile ekranı bilgilendirir.
// iOS sesi yalnız dokunuşun İÇİNDE başlatır (HATA_GUNLUGU Bug 22): start() hazırlığı eşzamanlı yapar ve çalmayı
// dokunuşla aynı çağrıda başlatır (araya await girmez). Çalma yine reddedilirse phase 'blocked' olur; ekran
// "dokun, başlat" gösterir ve resume() dokunuş içinde çağrılır.
export function createSleepPlayer() {
  let timer = 0, phase = 'idle', endAt = 0, fadeAt = 0, startedAt = 0
  let loopUrl = null, fadeUrl = null, ready = null, cb = {}
  const diag = { files: null, played: null, fadeAt: null } // tanı (test derlemesi, Bug 22)
  const cleanup = () => clearInterval(timer)
  function stop() {
    if (phase === 'stopped') return
    phase = 'stopped'
    cleanup()
    mediaKeepAlive(false)
  }
  // Eşzamanlı hazırlık: yalnız adresler ve süreler (dosyalar uygulamada)
  function setup({ mode = 'sakin', totalSec }) {
    if (ready?.totalSec === totalSec && ready.mode === mode) return
    const F = fadeSeconds(totalSec)
    loopUrl = sleepLoopUrl()
    fadeUrl = sleepFadeUrl(F)
    diag.files = `döngü + kısılma ${F} sn`
    ready = { totalSec, mode, F }
    if (phase !== 'stopped') phase = 'ready'
  }
  // Ekranla uyum için söz döndürür; hemen hazırdır
  async function prepare(o) {
    setup(o)
    return phase !== 'stopped'
  }
  function run() {
    startedAt = Date.now()
    endAt = startedAt + ready.totalSec * 1000
    fadeAt = endAt - ready.F * 1000
    phase = 'loop'
    clearInterval(timer)
    timer = setInterval(() => {
      const now = Date.now()
      if (phase === 'loop' && now >= fadeAt) {
        phase = 'fade'
        // Başlangıç noktası geçiş anında: kalan süre kadar çalıp tam bitişte susar
        fadeUrl = sleepFadeUrl(ready.F, (endAt - now) / 1000)
        diag.fadeAt = fadeUrl.split('/').pop()
        mediaPlay(fadeUrl, { loop: false })
      }
      cb.onTick?.({ left: Math.max(0, (endAt - now) / 1000) })
      if (now >= endAt + 1500) {
        stop()
        cb.onEnd?.()
      }
    }, 500)
  }
  return {
    get phase() { return phase },
    get diag() { return diag },
    prepare,
    // Başlat. Hazırsa mediaPlay dokunuşla aynı çağrıda (await'ten önce) yapılır. Döner: çaldı mı.
    async start({ mode = 'sakin', totalSec, onTick, onEnd }) {
      cb = { onTick, onEnd }
      if (phase === 'stopped') return false
      setup({ mode, totalSec })
      // Dokunuşla aynı çağrıda (await'ten önce) çalmaya başlar
      const ok = await mediaPlay(loopUrl, { loop: true })
      diag.played = ok
      if (phase === 'stopped') return false
      if (!ok) {
        phase = 'blocked'
        return false
      }
      run()
      return true
    },
    // Çalma reddedildiyse yeniden dene (dokunuşun içinde çağrılır)
    async resume() {
      if (phase !== 'blocked') return false
      const ok = await mediaPlay(loopUrl, { loop: true })
      if (!ok || phase === 'stopped') return false
      run()
      return true
    },
    elapsed: () => (startedAt ? Math.min(Date.now(), endAt) - startedAt : 0) / 1000,
    stop,
  }
}
