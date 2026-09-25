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
