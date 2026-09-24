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

// Egzersiz adımları — Kim ve ark. 2020 (PMID 32409236, tam metin doğrulandı):
// 2 sn hafif kapat → aç → 2 sn hafif kapat → kapalıyken 2 sn sık → aç.
// Tekrar sayısı Wolffsohn ve ark. 2025 (PMID 40467388): 15 tekrar, günde 3 kez.
// VARSAYIM: iki çalışmanın birleşimi; "aç" ve dinlenme süreleri tarafımızdan seçildi.
export const BLINK_CYCLE = [
  { id: 'close1', text: 'Gözlerini hafifçe kapat', ms: 2000, closed: true },
  { id: 'open1', text: 'Aç', ms: 1000, closed: false },
  { id: 'close2', text: 'Tekrar hafifçe kapat', ms: 2000, closed: true },
  { id: 'squeeze', text: 'Kapalıyken hafifçe sık', ms: 2000, closed: true },
  { id: 'open2', text: 'Aç ve dinlen', ms: 3000, closed: false },
]
export const BLINK_REPS = 15
export const CLOSURES_PER_CYCLE = 2 // close1 ve close2+squeeze
