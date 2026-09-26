// Optotip boyut hesapları.
// Tanım: harf yüksekliği 5 × MAR yay dakikası, MAR = 10^logMAR (tumbling E 5×5 ızgara).

const ARCMIN_TO_RAD = Math.PI / (180 * 60)

export const MIN_LOGMAR = -0.3
export const MAX_LOGMAR = 1.3

export function marArcmin(logMAR) {
  return 10 ** logMAR
}

// logMAR değerindeki harfin verilen mesafede fiziksel yüksekliği (mm)
export function letterHeightMm(logMAR, distanceMm) {
  const angle = 5 * marArcmin(logMAR) * ARCMIN_TO_RAD
  return 2 * distanceMm * Math.tan(angle / 2)
}

// Fiziksel yükseklikteki harfin verilen mesafede karşılık geldiği logMAR
export function logMARForHeight(heightMm, distanceMm) {
  const angle = 2 * Math.atan(heightMm / (2 * distanceMm))
  return Math.log10(angle / ARCMIN_TO_RAD / 5)
}

// Ekranda çizim: E, 5 birimlik ızgaradır. Birim cihaz pikseline yuvarlanır ki
// kenarlar keskin olsun; gerçekte çizilen boyutun logMAR değeri de döndürülür.
// pxPerMm: CSS pikseli / mm (kart kalibrasyonundan), dpr: window.devicePixelRatio
export function renderSpec(logMAR, distanceMm, pxPerMm, dpr = 1) {
  const targetMm = letterHeightMm(logMAR, distanceMm)
  const unitDevicePx = Math.round((targetMm / 5) * pxPerMm * dpr)
  if (unitDevicePx < 1) {
    return { drawable: false, unitCssPx: 0, heightCssPx: 0, realizedLogMAR: null }
  }
  const unitCssPx = unitDevicePx / dpr
  const heightCssPx = unitCssPx * 5
  const realizedMm = heightCssPx / pxPerMm
  return {
    drawable: true,
    unitCssPx,
    heightCssPx,
    realizedLogMAR: logMARForHeight(realizedMm, distanceMm),
  }
}

// Ekranın gösterebildiği en küçük logMAR (1 cihaz pikseli birim)
export function smallestDrawableLogMAR(distanceMm, pxPerMm, dpr = 1) {
  const minHeightMm = (5 / dpr) / pxPerMm
  return logMARForHeight(minHeightMm, distanceMm)
}

// Gösterim karşılıkları (yalnızca bilgi amaçlı)
export function decimalAcuity(logMAR) {
  return 1 / marArcmin(logMAR)
}

export function snellen20(logMAR) {
  return `20/${Math.round(20 * marArcmin(logMAR))}`
}

export function snellen6(logMAR) {
  const d = 6 * marArcmin(logMAR)
  return `6/${d < 10 ? d.toFixed(1) : Math.round(d)}`
}
