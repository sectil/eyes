// Kişisel göz kalibrasyonu (5 nokta). ARKit'in göz verisindeki eksen/işaret kurallarını
// TAHMİN ETMEZ: kullanıcı ortaya, sola, sağa, yukarı ve aşağı bakarken tüm aday sinyaller
// kaydedilir; her eksen için sol↔sağ (aşağı↔yukarı) farkını gürültüye göre en net ayıran
// sinyal seçilir. Merkez, yön (işaret) ve iki yanın ayrı kazancı bu veriden hesaplanır.
//
// Aday sinyaller (native yüz olayı, src/hooks/useFaceTracking.js):
//  ang*   : gazeLeft/RightX/Y — göz dönüş açısı (derece)
//  look*  : lookAtX/Y — ARKit lookAtPoint (yüz koordinatı, metre)
//  blend* : eyeLook* blendshape'lerinden türetilen vektör (0–1)


export const GAZE_MODEL_KEY = 'gozolcum:gaze-model-v1'
// Sürüm 2: yön hedefleri ekranın DIŞINDA (telefonun yanından/üstünden/altından bakış, ~20°).
// Sürüm 1 ekran kenarındaki noktaları kullanıyordu; telefon ekranı dar olduğundan yatay göz dönüşü
// ~±5° kalıyor ve cihazda sağ–sol ayrılamıyordu (Build 7). ±1 artık "ekranın dışına bakış" demek;
// ekranın içinde gezinen bakış merkeze yakın kalır. Eski (v1) modeller yüklenmez → yeniden kalibrasyon.
export const GAZE_MODEL_VERSION = 2
export const TARGETS = ['center', 'left', 'right', 'up', 'down', 'center2']
// VARSAYIM: en az bu kadar "ayrışma / gürültü" oranı yoksa eksen güvenilmez sayılır.
export const MIN_SCORE = 2.5

const num = (v) => (Number.isFinite(v) ? v : null)
const pick = (a, b) => {
  const fa = Number.isFinite(a)
  const fb = Number.isFinite(b)
  if (fa && fb) return (a + b) / 2
  return fa ? a : fb ? b : null
}

export const FEATURES = {
  angX: (f) => pick(f.gazeLeftX, f.gazeRightX),
  angY: (f) => pick(f.gazeLeftY, f.gazeRightY),
  lookX: (f) => num(f.lookAtX),
  lookY: (f) => num(f.lookAtY),
  blendX: (f) => (hasBlend(f) ? blendVector(f).x : null),
  blendY: (f) => (hasBlend(f) ? blendVector(f).y : null),
  // Kameraya göre bakış (baş + göz; derece). Ekrandaki noktaya bakış küçük baş kaymalarından
  // etkilenmez (göz başı telafi eder): Build 15 verisinde orta→orta2 kayması angX'te 0,94°,
  // camX'te 0,26° — bu yüzden eksen adaylarında İLK sırada. headX/Y yalnızca rapor ve baş dönüşü uyarısı.
  camX: (f) => pick(f.camLeftX, f.camRightX),
  camY: (f) => pick(f.camLeftY, f.camRightY),
  // Göz başına (yalnızca rapor: gözlük/tek göz sorununu görmek için; eksen adayı değil)
  camLX: (f) => num(f.camLeftX),
  camRX: (f) => num(f.camRightX),
  camLY: (f) => num(f.camLeftY),
  camRY: (f) => num(f.camRightY),
  headX: (f) => num(f.headX),
  headY: (f) => num(f.headY),
}
// headX/headY de aday: yatay göz sinyali bazı kullanıcılarda ~0 (Build 16, 19); noktaya doğru başı çevirmek
// doğal ve ölçülebilir (MAD 0,03–0,1°). En iyi ayrışan sinyal seçilir; kalibrasyon yönergesi başı serbest bırakır.
export const AXIS_FEATURES = { x: ['camX', 'headX', 'angX', 'lookX', 'blendX'], y: ['camY', 'headY', 'angY', 'lookY', 'blendY'] }

// Kalibrasyonda baş dönüşü: hedef penceresindeki baş açısı, orta hedefteki ortancadan bu kadar
// saparsa kare sayılmaz ve "başını değil gözünü oynat" uyarısı verilir.
// Build 19: 5° guard, çöp orta referansı yüzünden doğru kareleri attı; camX/headX baş hareketini zaten ölçüyor.
// Guard yalnızca kaba dönüşü (telefondan başka yere bakma) yakalar. VARSAYIM: 15°.
export const HEAD_TURN_DEG = 15
export function headOf(f) {
  const x = FEATURES.headX(f)
  const y = FEATURES.headY(f)
  return x == null || y == null ? null : { x, y }
}
export function headRef(frames) {
  const xs = (frames ?? []).map(FEATURES.headX)
  const ys = (frames ?? []).map(FEATURES.headY)
  const x = median(xs)
  const y = median(ys)
  return x == null || y == null ? null : { x, y }
}
// Baş, referanstan HEAD_TURN_DEG'den fazla döndü mü? Baş verisi yoksa false (eski eklenti: engelleme).
export function headTurned(ref, f, deg = HEAD_TURN_DEG) {
  const h = headOf(f)
  if (!ref || !h) return false
  return Math.abs(h.x - ref.x) > deg || Math.abs(h.y - ref.y) > deg
}
// Sayısal taban gürültü (birim başına) — sıfıra bölmeyi ve aşırı iyimser skoru önler
// VARSAYIM: cam 0,1° (Build 16: yatay hedef-içi MAD 0,02–0,04°, sol–sağ ayrım yalnızca 0,38°; 0,25 taban
// bu temiz sinyali 1,5 puana düşürüyordu). ARKit'in yatay kazancı dikeyin ~1/5'i; ayrım küçük ama tutarlı.
export const NOISE_FLOOR = { camX: 0.1, camY: 0.1, headX: 0.15, headY: 0.15, angX: 0.4, angY: 0.4, lookX: 0.002, lookY: 0.002, blendX: 0.02, blendY: 0.02 }
// Kalibrasyon ekranındaki "sabit bakış" ölçütü (taban gürültüden gevşek: hedef-içi MAD 0,03–0,10 gözlendi)
export const STABLE_MAD = { camX: 0.25, camY: 0.25, headX: 0.3, headY: 0.3, angX: 0.4, angY: 0.4 }

// Blendshape bakış vektörü (gaze.js gazeVector ile aynı formül; döngüsel içe aktarımı önlemek için burada)
const avg2 = (a, b) => ((a ?? 0) + (b ?? 0)) / 2
function blendVector(f) {
  return {
    x: avg2(f.lookInLeft, f.lookOutRight) - avg2(f.lookOutLeft, f.lookInRight),
    y: avg2(f.lookUpLeft, f.lookUpRight) - avg2(f.lookDownLeft, f.lookDownRight),
  }
}

function hasBlend(f) {
  return ['lookInLeft', 'lookInRight', 'lookOutLeft', 'lookOutRight', 'lookUpLeft', 'lookUpRight', 'lookDownLeft', 'lookDownRight'].some((k) => Number.isFinite(f[k]))
}

export function median(arr) {
  const s = arr.filter(Number.isFinite).sort((a, b) => a - b)
  const n = s.length
  if (!n) return null
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2
}

function mad(arr, m) {
  return median(arr.filter(Number.isFinite).map((v) => Math.abs(v - m)))
}

// Bir hedefteki karelerden her aday sinyalin ortancası ve yayılımı
export function summarize(frames) {
  const out = {}
  for (const [k, fn] of Object.entries(FEATURES)) {
    const vals = frames.map(fn).filter(Number.isFinite)
    if (vals.length < 5) continue
    const m = median(vals)
    out[k] = { med: m, mad: mad(vals, m), n: vals.length }
  }
  return out
}

// Bir eksen için en iyi sinyal. neg: sol/aşağı, pos: sağ/yukarı hedefinin özeti.
// center2: sondaki ikinci orta hedef (varsa). Merkez iki ortancanın ortalaması; iki orta arasındaki
// fark "drift" (oturum içi kayma). Gürültü = hedef-İÇİ yayılımların en büyüğü, taban ve drift/2.
// (Önceden orta+orta2 kareleri birleştirilip MAD alınıyordu: 0,9°'lik kayma MAD'ı 0,47'ye şişirip
// 1°'lik net ayrımı 2,0 puana düşürüyordu — Build 15 raporu.)
export function fitAxis(center, neg, pos, features, center2 = null) {
  let best = null
  for (const k of features) {
    const c1 = center?.[k]
    const c2 = center2?.[k]
    const a = neg?.[k]
    const b = pos?.[k]
    if (!c1 || !a || !b) continue
    const cMed = c2 ? (c1.med + c2.med) / 2 : c1.med
    const drift = c2 ? Math.abs(c1.med - c2.med) : 0
    const dNeg = a.med - cMed
    const dPos = b.med - cMed
    // İki yan merkezin zıt taraflarında olmalı (işaret ne olursa olsun)
    if (!(dNeg * dPos < 0)) continue
    const sep = Math.min(Math.abs(dNeg), Math.abs(dPos))
    const noise = Math.max(c1.mad, c2?.mad ?? 0, a.mad, b.mad, drift / 2, NOISE_FLOOR[k] ?? 1e-6)
    const score = sep / noise
    if (!best || score > best.score) best = { feature: k, c: cMed, neg: a.med, pos: b.med, score, drift }
  }
  return best && best.score >= MIN_SCORE ? best : best ? { ...best, weak: true } : null
}

// Kalibrasyon ekranı: bir hedefteki kareler "sabit bakış" mı? Mevcut eksen sinyallerinin her birinde
// yayılım (MAD) taban gürültüyü aşmıyorsa evet. Nokta bu anda yeşile döner.
// VARSAYIM: ölçüt taban gürültü (cam 0,25°, açı 0,4°); kırpma/baş dönüşü kareleri zaten elenmiş gelir.
export const STABLE_FEATURES = ['camX', 'camY', 'headX', 'headY', 'angX', 'angY']
export function windowStable(frames, minFrames = 5) {
  if (!frames || frames.length < minFrames) return false
  const sum = summarize(frames)
  const present = STABLE_FEATURES.filter((k) => sum[k])
  if (!present.length) return false
  return present.every((k) => sum[k].mad <= STABLE_MAD[k])
}

const closureOf = (f) => ((f.blinkLeft ?? 0) + (f.blinkRight ?? 0)) / 2

// Aşağı bakışta göz kapağı iner ve ARKit bunu kısmen "kapanma" sayar. Kişinin aşağı bakıştaki
// kapanma ortancasından kapanma eşiği: bunun altı "açık göz" sayılır (gerçek kırpma ~0,9+).
// VARSAYIM: pay +0,2, eşik 0,5–0,85 aralığında.
export const DOWN_CLOSE_MAX = 0.85
export function closeThreshold(downFrames) {
  const m = median((downFrames ?? []).map(closureOf))
  if (!Number.isFinite(m)) return 0.5
  return Math.max(0.5, Math.min(DOWN_CLOSE_MAX, m + 0.2))
}

// Orta pencerelerinden kullanılabilir olanlar: [birincil, ikincil|null]
export function usableCenters(windows) {
  const c1 = windows.center?.length ? summarize(windows.center) : null
  const c2 = windows.center2?.length ? summarize(windows.center2) : null
  const s1 = c1 && windowStable(windows.center)
  const s2 = c2 && windowStable(windows.center2)
  if (s1 && s2) return [c1, c2]
  if (s1) return [c1, null]
  if (s2) return [c2, null]
  return [c1 ?? c2, c1 && c2 ? c2 : null]
}

// windows: { center: frames[], left, right, up, down, center2? }
export function fitModel(windows) {
  const S = {}
  for (const t of TARGETS) if (windows[t]?.length) S[t] = summarize(windows[t])
  // Kararsız orta penceresi (Build 19: n=60, MAD 1,5°, kırpmalı) referans olamaz: temiz olan kullanılır;
  // ikisi de temizse ikisi (drift ölçülür); hiçbiri temiz değilse ikisi de (eldeki en iyi).
  const [C1, C2] = usableCenters(windows)
  const x = C1 && S.left && S.right ? fitAxis(C1, S.left, S.right, AXIS_FEATURES.x, C2) : null
  const y = C1 && S.down && S.up ? fitAxis(C1, S.down, S.up, AXIS_FEATURES.y, C2) : null
  const ok = Boolean(x && !x.weak && y && !y.weak)
  // Telefona bakış referansı: ortaya bakarken kameraya göre bakış açısı (ARKit'in sabit
  // sapmasını içerir). gaze.js lookingAtPhone bunun çevresindeki pencereyi "telefon" sayar.
  const C = summarize([...(windows.center ?? []), ...(windows.center2 ?? [])])
  const phone = C.camX && C.camY ? { x: C.camX.med, y: C.camY.med } : null
  return { version: GAZE_MODEL_VERSION, ok, x, y, closeAt: closeThreshold(windows.down), phone }
}

// Teşhis raporu (yalnızca sayılar; görüntü yok): her hedefte kare sayısı, kapanma ortancası ve
// aday sinyallerin ortanca/yayılımı + her eksen için tüm adayların skoru. "Verileri paylaş" için.
export function calibReport(windows, model) {
  const r3 = (v) => (Number.isFinite(v) ? +v.toFixed(4) : null)
  const targets = {}
  for (const t of TARGETS) {
    const fr = windows[t] ?? []
    const sum = summarize(fr)
    targets[t] = {
      n: fr.length,
      closure: r3(median(fr.map(closureOf))),
      ...Object.fromEntries(Object.entries(sum).map(([k, v]) => [k, { med: r3(v.med), mad: r3(v.mad) }])),
    }
  }
  const [C, C2] = usableCenters(windows)
  const axisScores = (neg, pos, feats) =>
    Object.fromEntries(
      feats.map((k) => {
        const a = fitAxis(C, summarize(windows[neg] ?? []), summarize(windows[pos] ?? []), [k], C2)
        return [k, a ? r3(a.score) : null]
      }),
    )
  // Baş dönüşü: her hedefte baş açısının orta hedeften sapması (derece; kabul edilen karelerde)
  const ref = headRef(windows.center ?? [])
  const head = {}
  for (const t of TARGETS) {
    const h = headRef(windows[t] ?? [])
    head[t] = ref && h ? { dx: r3(h.x - ref.x), dy: r3(h.y - ref.y) } : null
  }
  return {
    targets,
    scores: { x: axisScores('left', 'right', AXIS_FEATURES.x), y: axisScores('down', 'up', AXIS_FEATURES.y) },
    minScore: MIN_SCORE,
    centerStable: { center: windowStable(windows.center), center2: windowStable(windows.center2) },
    head,
    headTurnDeg: HEAD_TURN_DEG,
    model,
  }
}

// Eksen normalizasyonu: merkez 0, pos hedefi +1, neg hedefi −1 (iki yanın kazancı ayrı).
export function normAxis(axis, value, center = axis.c) {
  if (!Number.isFinite(value)) return null
  const d = value - center
  if (d === 0) return 0
  const toPos = axis.pos - axis.c // toPos ve toNeg zıt işaretli (fitAxis garanti eder)
  const toNeg = axis.neg - axis.c
  if (Math.sign(d) === Math.sign(toPos)) return d / toPos // pozitif
  return -(d / toNeg) // negatif
}

// Kareden normalleştirilmiş bakış {x,y}: ±1 = kalibrasyondaki sağ/sol, yukarı/aşağı hedefi.
// shift: recenter ile öğrenilen merkez kayması (ham birimde).
export function applyModel(model, f, shift = { x: 0, y: 0 }) {
  if (!model?.x || !model?.y) return null
  const vx = FEATURES[model.x.feature](f)
  const vy = FEATURES[model.y.feature](f)
  if (!Number.isFinite(vx) || !Number.isFinite(vy)) return null
  return { x: normAxis(model.x, vx, model.x.c + shift.x), y: normAxis(model.y, vy, model.y.c + shift.y), raw: { x: vx, y: vy } }
}

export function loadGazeModel() {
  try {
    const m = JSON.parse(globalThis.localStorage?.getItem(GAZE_MODEL_KEY) ?? 'null')
    return m && m.version === GAZE_MODEL_VERSION && m.ok && m.x && m.y ? m : null
  } catch {
    return null
  }
}

export function saveGazeModel(model) {
  try {
    globalThis.localStorage?.setItem(GAZE_MODEL_KEY, JSON.stringify({ ...model, date: new Date().toISOString() }))
  } catch {
    // depolama yok → yalnızca bu oturum
  }
}

export function clearGazeModel() {
  try {
    globalThis.localStorage?.removeItem(GAZE_MODEL_KEY)
  } catch {
    // yoksay
  }
}

export const hasGazeModel = () => Boolean(loadGazeModel())

// One Euro filtresi (Casiez 2012): yavaş harekette titremeyi süzer, hızlı harekette gecikmez.
// VARSAYIM: minCutoff 1,2 Hz, beta 0,05 (normalleştirilmiş birim ×20 için) — cihazda ayarlanacak.
export function createOneEuro({ minCutoff = 1.2, beta = 0.05, dCutoff = 1.0 } = {}) {
  let x = null
  let dx = 0
  let t = null
  const alpha = (cutoff, dt) => {
    const tau = 1 / (2 * Math.PI * cutoff)
    return 1 / (1 + tau / dt)
  }
  return {
    push(value, ts) {
      if (!Number.isFinite(value)) return x
      if (x == null || t == null || !(ts > t)) {
        x = value
        t = ts
        return x
      }
      const dt = Math.min((ts - t) / 1000, 0.5)
      t = ts
      const rawDx = (value - x) / dt
      dx = dx + alpha(dCutoff, dt) * (rawDx - dx)
      const cutoff = minCutoff + beta * Math.abs(dx)
      x = x + alpha(cutoff, dt) * (value - x)
      return x
    },
    reset() {
      x = null
      t = null
      dx = 0
    },
  }
}
