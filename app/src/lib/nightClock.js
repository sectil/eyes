// Gece saati (Dalga uyku ekranı, tasarım A "Amber Saat"; sahibi 2026-09-28 seçti).
// OLED ekranda iz kalmasın diye saat dakikada bir en çok STEP_MAX nokta kayar, merkezden en çok BOUND uzaklaşır.
// "Hareketi Azalt" açıksa çağıran kaydırmaz.
import { untilText, hhmm, minOfDay, WEEKDAY_LONG } from './alarm.js'

export const STEP_MAX = 8
export const BOUND = 16
const DAY_MS = 24 * 3600 * 1000

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
// Ekrandaki saat dakikanın başını gösterir; kalan süre de aynı dakikadan hesaplanır (yoksa dakikanın ikinci
// yarısında 1 dk eksik görünür: 23:52:31 → "6 sa 36 dk", oysa 23:52 + 6:37 = 06:29)
const floorMin = (now) => Math.floor(new Date(now).getTime() / 60000) * 60000

// Bir sonraki konum: rastgele yönde 4–8 nokta adım; sınıra çarparsa sınırda durur (adım yine ≤ STEP_MAX)
export function nextDrift([x, y], rnd = Math.random) {
  const a = rnd() * 2 * Math.PI
  const len = STEP_MAX / 2 + rnd() * (STEP_MAX / 2)
  return [clamp(x + Math.cos(a) * len, -BOUND, BOUND), clamp(y + Math.sin(a) * len, -BOUND, BOUND)].map((v) => Math.round(v * 10) / 10)
}

// "6 sa 37 dk"; alarm geçmişse, yoksa ya da 24 saatten uzaksa null (o zaman etiket gün adını taşır: alarmLabel)
export function untilShort(alarmAt, now) {
  const n = floorMin(now)
  if (!Number.isFinite(alarmAt) || alarmAt <= new Date(now).getTime() || alarmAt - n >= DAY_MS) return null
  return untilText(new Date(alarmAt), n).replace(/ sonra$/, '')
}

// Alarm etiketi: 24 saat içindeyse yalnız saat ("06:29"), daha uzaksa gün adıyla ("Cuma 06:29")
export function alarmLabel(ring, now) {
  if (!ring) return null
  const t = hhmm(minOfDay(ring))
  return ring.getTime() - floorMin(now) >= DAY_MS ? `${WEEKDAY_LONG[ring.getDay()]} ${t}` : t
}

// VoiceOver kısaltmaları harf harf okumasın: "6 sa 37 dk" → "6 saat 37 dakika"
export const spoken = (s) => String(s).replace(/(\d+) sa\b/g, '$1 saat').replace(/(\d+) dk\b/g, '$1 dakika')
