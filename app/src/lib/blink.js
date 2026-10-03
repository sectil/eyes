// Kamera ile göz kapanması algılama.
// Göz kontur noktaları çalışma anında MediaPipe sabitlerinden alınır (indeks ezberlenmez).
// Açıklık = kontur yüksekliği / genişliği. Eşik kişiye özel: gözler açıkken ölçülen
// ortancanın CLOSE_RATIO katı. Kişiye özel eşik: bkz. docs/arastirma/ajan-raporlari/09 (PMID 37892616).
// VARSAYIM: CLOSE_RATIO = 0.6 bu çalışmadan birebir alınmadı.

export const CLOSE_RATIO = 0.6
export const MIN_CLOSED_FRAMES = 2

export function eyeOpenness(landmarks, indices) {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const i of indices) {
    const p = landmarks[i]
    if (!p) return null
    minX = Math.min(minX, p.x)
    maxX = Math.max(maxX, p.x)
    minY = Math.min(minY, p.y)
    maxY = Math.max(maxY, p.y)
  }
  const w = maxX - minX
  return w > 0 ? (maxY - minY) / w : null
}

// Göz kapanmalarını sayar. baseline: gözler açıkken açıklık ortancası.
export function createClosureCounter(baseline, { ratio = CLOSE_RATIO, minFrames = MIN_CLOSED_FRAMES } = {}) {
  const threshold = baseline * ratio
  let closedFrames = 0
  let isClosed = false
  let count = 0
  return {
    threshold,
    // Döner: true → bu karede yeni bir kapanma başladı
    update(openness) {
      if (openness == null) return false
      if (openness < threshold) {
        closedFrames++
        if (!isClosed && closedFrames >= minFrames) {
          isClosed = true
          count++
          return true
        }
      } else {
        closedFrames = 0
        isClosed = false
      }
      return false
    },
    count: () => count,
    closed: () => isClosed,
  }
}

// Egzersiz adımları — Wolffsohn ve ark. 2025 (PMID 40467388): kapat → sık → aç, 15 tekrar, günde 3 kez; 15 tekrar
// 5 tekrardan üstün. Sahibin kararı 2026-10-03 ("15 tekrar, kısa döngü"; 2,5 dk çok uzun geliyordu): Kim 2020'nin
// 10 sn'lik döngüsü (kapat → aç → kapat → sık → aç · dinlen) yerine bu kısa döngü, toplam 1,5 dk.
// VARSAYIM: her adımın 2 sn tutulması yalnız web özetinden (ajan-raporlari/09 [WS], birincil metinde doğrulanmadı).
// voice: seslendirme cümlesi (lib/voicePack.js); label: ritim şeridindeki kısa ad.
export const BLINK_CYCLE = [
  { id: 'close', text: 'Gözlerini hafifçe kapat', voice: 'blClose', label: 'Kapat', ms: 2000, closed: true },
  { id: 'squeeze', text: 'Kapalıyken hafifçe sık', voice: 'blSqueeze', label: 'Sık', ms: 2000, closed: true, squeeze: true },
  { id: 'open', text: 'Aç', voice: 'open', label: 'Aç', ms: 2000, closed: false },
]
export const BLINK_REPS = 15
export const CLOSURES_PER_CYCLE = 1 // kapat + sık tek kapanma
