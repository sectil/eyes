// Optotip boyut hesapları, E'nin piksel çizimi ve gösterim karşılıkları.
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

// Ekranda çizim: E, 5 birimlik ızgaradır. Birim YUVARLANMAZ: harf tam hedef boyutta çizilir, kenar
// pikselleri alan kaplamasıyla griye döner (rasterizeE). Bu yüzden gerçekleşen logMAR = hedef.
// Taban: birim en az 1 cihaz pikseli; altı çizilemez (drawable: false).
// Neden (H1, 2026-09-28): eski sürüm birimi cihaz pikseline yuvarlıyordu (Math.round). 458 ppi / 40 cm'de
// 0,6'nın altında yalnız 8 boyut çizilebiliyordu (normal görme çevresinde adımlar 0,18 ve 0,30 logMAR);
// θ = −0,10…−0,25'te sapma 0,02–0,07, dağılım ≈1,5 kat (plan H1; staircase.test.js "H1: sürekli boyut").
// Kenar yumuşatma, piksel ızgarasının küçük harfe koyduğu sınırı aşar (Bach 1996 FrACT, PMID 8867682,
// DOI 10.1097/00006324-199601000-00008).
// pxPerMm: CSS pikseli / mm (kalibrasyon), dpr: cihaz pikseli / CSS pikseli (kalibrasyondaki devicePixelRatio)
// Döner: { drawable, unitCssPx, heightCssPx, unitDevicePx, realizedLogMAR }
// (unitDevicePx yeni alan; diğerleri eskisiyle aynı anlamda.)
const FLOOR_EPS = 1e-9 // tam tabanda (1 cihaz pikseli) kayan nokta payı: 0,9999999999 birim de çizilir
export function renderSpec(logMAR, distanceMm, pxPerMm, dpr = 1) {
  const targetMm = letterHeightMm(logMAR, distanceMm)
  const rawUnit = (targetMm / 5) * pxPerMm * dpr
  // NaN da buraya düşer
  if (!(rawUnit >= 1 - FLOOR_EPS)) {
    return { drawable: false, unitCssPx: 0, heightCssPx: 0, unitDevicePx: 0, realizedLogMAR: null }
  }
  const unitDevicePx = Math.max(1, rawUnit)
  const unitCssPx = unitDevicePx / dpr
  const heightCssPx = unitCssPx * 5
  const realizedMm = heightCssPx / pxPerMm
  return {
    drawable: true,
    unitCssPx,
    heightCssPx,
    unitDevicePx,
    realizedLogMAR: logMARForHeight(realizedMm, distanceMm),
  }
}

// Ekranın gösterebildiği en küçük logMAR (1 cihaz pikseli birim)
export function smallestDrawableLogMAR(distanceMm, pxPerMm, dpr = 1) {
  const minHeightMm = (5 / dpr) / pxPerMm
  return logMARForHeight(minHeightMm, distanceMm)
}

// --- E'nin piksel çizimi (components/TumblingE.jsx bunu boyar) ---

// Sağa bakan E (açık tarafı sağda), birim ızgarada örtüşmeyen dikdörtgenler [x0, y0, x1, y1]; x sağa, y aşağı.
const E_RIGHT = [
  [0, 0, 1, 5], // sırt
  [1, 0, 5, 1], // üst kol
  [1, 2, 5, 3], // orta kol
  [1, 4, 5, 5], // alt kol
]
// E'nin mürekkep alanı: 25 hücrenin 17'si
export const E_AREA_UNITS = 17

// Yön geometriyle kurulur (CSS döndürmesi yok): sol = yatay ayna; aşağı = köşegen yansıması (E yatay eksene
// göre simetrik olduğundan saat yönünde 90° döndürmeyle aynı); yukarı = aşağının dikey aynası.
export function eRects(direction) {
  switch (direction) {
    case 'right':
      return E_RIGHT.map((r) => [...r])
    case 'left':
      return E_RIGHT.map(([x0, y0, x1, y1]) => [5 - x1, y0, 5 - x0, y1])
    case 'down':
      return E_RIGHT.map(([x0, y0, x1, y1]) => [y0, x0, y1, x1])
    case 'up':
      return E_RIGHT.map(([x0, y0, x1, y1]) => [y0, 5 - x1, y1, 5 - x0])
    default:
      // Yanlış yönde çizmek ölçümü sessizce bozar: sessiz varsayılan yok
      throw new RangeError(`Bilinmeyen E yönü: ${direction}`)
  }
}

// sRGB aktarım eğrisi (IEC 61966-2-1): doğrusal ışık [0,1] → kodlanmış değer [0,1]
export function srgbEncode(linear) {
  const v = Math.min(1, Math.max(0, linear))
  return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055
}

// Kaplama oranı c (0 = beyaz, 1 = tam siyah) → sRGB bayt. Karışım DOĞRUSAL ışıkta yapılır (plan K6): beyaz
// zeminin ışığı 1, siyahın 0; pikselin ışığı 1 − c; sonra sRGB'ye kodlanır. %50 kaplama → 188. sRGB'de
// karıştırsaydık 128 olurdu: kenar koyu, çubuklar kalın görünür. Kendi hesabımız (2026-09-29, rasterizeE ile 0,01 px
// adımla tarandı; üst sınır değil, taranan değerler): gamma olmadan toplam mürekkep, birim 1,07–1,77 cihaz pikselinde
// %14–48, 2,2–13 pikselde %0–22 fazla; en çok birim ≈ 2,2 pikselde (458 ppi, 40 cm'de logMAR ≈ 0,02, en önemli bölge).
// Gamma ile fark ≤ %1 (optotype.test.js "toplam mürekkep"). Ekranın gerçek gamma eğrisi sRGB'den farklıysa: doğrulanmadı.
export function coverageToSrgbByte(c) {
  return Math.round(255 * srgbEncode(1 - c))
}

// Tumbling E'yi cihaz pikseli ızgarasına alan kaplamasıyla çizer. Metin ya da yazı tipi kullanılmaz.
// unitPx: bir ızgara biriminin CİHAZ pikseli boyu (yuvarlanmaz; renderSpec().unitDevicePx)
// direction: 'right' | 'down' | 'left' | 'up' (açık tarafın yönü)
// opts.size: kare tuvalin kenarı (cihaz pikseli; varsayılan ceil(5·unitPx))
// opts.originX / originY: E'nin sol üst köşesi (cihaz pikseli; varsayılan: tuvalde ortalı)
// Döner: { size, originX, originY, coverage: Float64Array(size²), rgba: Uint8ClampedArray(size²·4) }
// Siyah #000, beyaz #fff; kenar pikselleri doğrusal ışıkta karıştırılmış gri. Ortalı çizimde gri piksellerin
// dağılımı dört yönde aynıdır (yön ipucu vermez).
export function rasterizeE(unitPx, direction, opts = {}) {
  if (!(unitPx > 0) || !Number.isFinite(unitPx)) throw new RangeError(`Geçersiz E birimi: ${unitPx}`)
  const rects = eRects(direction)
  const ext = 5 * unitPx
  const size = opts.size ?? Math.max(1, Math.ceil(ext - 1e-9))
  const originX = opts.originX ?? (size - ext) / 2
  const originY = opts.originY ?? (size - ext) / 2
  const coverage = new Float64Array(size * size)
  for (const [x0, y0, x1, y1] of rects) {
    const X0 = originX + x0 * unitPx
    const X1 = originX + x1 * unitPx
    const Y0 = originY + y0 * unitPx
    const Y1 = originY + y1 * unitPx
    const i0 = Math.max(0, Math.floor(X0))
    const i1 = Math.min(size - 1, Math.ceil(X1) - 1)
    const j0 = Math.max(0, Math.floor(Y0))
    const j1 = Math.min(size - 1, Math.ceil(Y1) - 1)
    for (let j = j0; j <= j1; j++) {
      const cy = Math.min(j + 1, Y1) - Math.max(j, Y0)
      if (cy <= 0) continue
      for (let i = i0; i <= i1; i++) {
        const cx = Math.min(i + 1, X1) - Math.max(i, X0)
        if (cx > 0) coverage[j * size + i] += cx * cy
      }
    }
  }
  const rgba = new Uint8ClampedArray(size * size * 4)
  for (let k = 0; k < coverage.length; k++) {
    const c = Math.min(1, coverage[k]) // dikdörtgenler örtüşmez; yalnız kayan nokta payı
    coverage[k] = c
    const v = coverageToSrgbByte(c)
    rgba[4 * k] = v
    rgba[4 * k + 1] = v
    rgba[4 * k + 2] = v
    rgba[4 * k + 3] = 255
  }
  return { size, originX, originY, coverage, rgba }
}

// --- Gösterim karşılıkları (yalnızca bilgi amaçlı) ---
// H8 (2026-09-28): logMAR önce 2 haneye yuvarlanır; 20/x, 6/x ve ondalık BU değerden türetilir. Böylece ekrandaki
// "0,10" ile "20/25 · 6/7,6 · 0,79" birbirini tutar (eskiden 0,004 → "0,00 · 20/20 · 6/6.1 · 0,99").
// Türkçe ondalık virgül; 6/x'te tam sayıya ",0" yazılmaz; eksi işareti gerçek eksi (−); "−0,00" yazılmaz.

// Yarım yukarı (sıfırdan uzağa), iki yönde simetrik. 1e-7 payı: kayan noktada 0,28499… olan 0,285 gibi
// kayıtlar da 0,29'a yuvarlansın (kayıtlar 3 haneli; gerçek bir değeri değiştirmez).
export function roundLogMAR(v) {
  const r = (Math.sign(v) * Math.round(Math.abs(v) * 100 + 1e-7)) / 100
  return r === 0 ? 0 : r
}

const trNumber = (s) => s.replace('.', ',').replace('-', '−')

// logMAR metni: "0,10" · "−0,12" · "0,00"
export function formatLogMAR(logMAR) {
  return trNumber(roundLogMAR(logMAR).toFixed(2))
}

// Döner: { logMAR (yuvarlanmış sayı), logMARText, snellen20, snellen6, decimal, text } ya da geçersizse null.
// Örnek 0,1 → { logMARText: '0,10', snellen20: '20/25', snellen6: '6/7,6', decimal: '0,79',
//               text: '20/25 · 6/7,6 · 0,79' }
export function formatEquivalents(logMAR) {
  if (logMAR == null || !Number.isFinite(logMAR)) return null
  const l = roundLogMAR(logMAR)
  const mar = marArcmin(l)
  const d6 = 6 * mar
  const six = (d6 < 10 ? d6.toFixed(1) : String(Math.round(d6))).replace(/\.0$/, '')
  const out = {
    logMAR: l,
    logMARText: trNumber(l.toFixed(2)),
    snellen20: `20/${Math.round(20 * mar)}`,
    snellen6: `6/${trNumber(six)}`,
    decimal: trNumber((1 / mar).toFixed(2)),
  }
  out.text = `${out.snellen20} · ${out.snellen6} · ${out.decimal}`
  return out
}

// Ondalık keskinlik (1 / MAR), yuvarlanmamış sayı. Ekran metni için formatEquivalents().decimal kullanılır.
export function decimalAcuity(logMAR) {
  return 1 / marArcmin(logMAR)
}

// Eski çağıranlar için (Home, Progress, AcuityTest): formatEquivalents ile aynı yuvarlama ve biçim.
// Geçersiz değer (null/NaN) → '—' (eskiden null → "20/20" yazıyordu).
export function snellen20(logMAR) {
  return formatEquivalents(logMAR)?.snellen20 ?? '—'
}

export function snellen6(logMAR) {
  return formatEquivalents(logMAR)?.snellen6 ?? '—'
}
