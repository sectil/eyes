// Kırpma sayaçları (BlinkExercise ve ilk 20 sn anı, screens/FirstLook.jsx ortak kullanır).
import { createClosureCounter } from './blink.js'
import { createBlinkCounter, blinkThresholds, BLINK_REFRACTORY_MS } from './gaze.js'

// Kapanma sayaçları — push(değer, ts) → true: yeni bir kapanma sayıldı.
// TrueDepth: gaze.js createBlinkCounter (histerezis + doruk + refrakter). Eşikler kişinin
// gözler açıkkenki kapanma değerine göre (blinkThresholds). Sayım göz yeniden açılınca yapılır.
export function trueDepthCounter(baseClosure) {
  const c = createBlinkCounter(blinkThresholds(baseClosure))
  return {
    push(closure, ts) {
      const before = c.count
      return c.push(closure, ts) > before
    },
  }
}

// Ön kamera: blink.js createClosureCounter + refrakter. Göz açıldıktan sonra
// BLINK_REFRACTORY_MS içinde yeniden kapanırsa aynı kapanmanın devamı sayılır
// (hafifçe sıkarken titreyen değer çift saymasın).
export function cameraCounter(baselineOpenness) {
  const c = createClosureCounter(baselineOpenness)
  let wasClosed = false
  let openedAt = -Infinity
  return {
    push(openness, ts) {
      const started = c.update(openness)
      const closed = c.closed()
      if (wasClosed && !closed) openedAt = ts
      wasClosed = closed
      return started && ts - openedAt >= BLINK_REFRACTORY_MS
    },
  }
}

// Okurken kırpma (İlk Bakış, screens/FirstLook.jsx; TrueDepth kapanma 0–1). Okurken göz aşağı bakar, kapak iner:
// "açık göz" kapanması 0,3–0,45'e çıkabilir ve doğal kırpma 100–150 ms'de 2–4 karede biter. Sabit eşik + en kısa
// süre (trueDepthCounter) bu kırpmaların çoğunu kaçırıyordu (repro: tabanda 0,38 → 5 kırpmadan 2).
// Burada taban, göz açıkken yavaşça izlenir (EMA); kırpma = tabandan hızlı sıçrama (≥ RISE) ve geri dönüş.
// En kısa süre yok (tek kare yeter), aynı kırpmanın titremesi refrakterle tek sayılır; yavaş kapak inişi taban olur.
// VARSAYIM: RISE 0,2, açılma RISE×0,5, EMA 0,08/kare (~30 Hz'de ~0,4 sn), refrakter 250 ms — cihaz izi gelince ayarlanacak.
export const READ_RISE = 0.2
export const READ_REFRACTORY_MS = 250
export const READ_MAX_CLOSED_MS = 1500 // bundan uzun kapalılık kırpma değil (bilerek kapatma, uzun kısma): taban yeniden kurulur
export function readingBlinkCounter(baseClosure = null, { rise = READ_RISE, alpha = 0.08, refractoryMs = READ_REFRACTORY_MS, maxClosedMs = READ_MAX_CLOSED_MS } = {}) {
  let base = Number.isFinite(baseClosure) ? baseClosure : null
  let closed = false
  let peak = 0
  let closedAt = 0
  let lastCountAt = -Infinity
  let frames = 0
  let firstTs = null
  let lastTs = null
  const peaks = [] // tanı: sayılan kırpmaların doruk − taban farkı
  return {
    push(closure, ts) {
      if (!Number.isFinite(closure)) return false
      frames += 1
      if (firstTs == null) firstTs = ts
      lastTs = ts
      if (base == null) {
        base = closure
        return false
      }
      if (!closed) {
        if (closure - base >= rise) {
          closed = true
          closedAt = ts
          peak = closure
          return false
        }
        base += alpha * (closure - base) // yalnız açıkken: yavaş iniş/kalkış tabana karışır
        return false
      }
      if (closure > peak) peak = closure
      if (ts - closedAt > maxClosedMs) {
        closed = false
        base = closure
        return false
      }
      if (closure - base <= rise * 0.5) {
        closed = false
        if (ts - lastCountAt >= refractoryMs) {
          lastCountAt = ts
          peaks.push(+(peak - base).toFixed(2))
          return true
        }
      }
      return false
    },
    // Tanı (yalnız geliştirme derlemesinde gösterilir): kare hızı, son taban, sayılan doruklar
    stats() {
      const sec = firstTs != null && lastTs > firstTs ? (lastTs - firstTs) / 1000 : 0
      return { frames, fps: sec ? Math.round(frames / sec) : 0, base: base == null ? null : +base.toFixed(2), peaks: [...peaks] }
    },
  }
}
