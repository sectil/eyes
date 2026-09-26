// Tek göz testi için örtme kontrolü (AcuityTest). Kaynak: iPhone TrueDepth yüz takibinin göz kapanma
// değerleri (ARKit eyeBlinkLeft/Right, 0 = açık, 1 = kapalı; native "face" olayı blinkLeft/blinkRight).
//
// Build 24.1 (cihaz verisi, Build 24): tek göz kapatılınca İKİ değer birlikte yükseliyor (sol kapalı → sağ 0,88,
// sol 0,87); ARKit iki gözü ayrı ayrı ölçmüyor. El ile örtünce yüz takibi düşüyor (mesafe de kesiliyor).
// Bu yüzden kural: tek göz testinde İKİ GÖZ BİRDEN AÇIK OLAMAZ (en az biri kapalı okunmalı); hangi gözün
// kapalı olduğu bu sinyalle AYIRT EDİLEMEZ (yönerge + kişi). Göz kapağıyla kapatılır, el kullanılmaz ki yüz
// görünsün. İki göz testinde ikisi de açık. Doğru durum 1 sn görülmeden test başlamaz; testte 0,7 sn'den
// uzun bozulursa harf gizlenir (kırpma ≈ 0,1–0,4 sn, testi durdurmaz).
//
// Derinlik (Build 25, FaceDistancePlugin "depth" olayı): iki göz bölgesinin ortanca uzaklığı. Avuç göze bir iki
// santim yakın durur → örtülen tarafın bölgesi diğerinden belirgin yakın. Fark DEPTH_DELTA_MM'i aşarsa hangi gözün
// örtüldüğü KESİN bilinir (yanlış göz de yakalanır). Fark küçükse göz kapağı kuralına düşülür.
// VARSAYIM: eşikler 0,55 / 0,45 (Build 24 cihazında kapalı göz 0,87–0,88 okundu); derinlik farkı 15 mm
// (avuç–göz arası; cihaz verisiyle ayarlanacak).
export const CLOSED_MIN = 0.55
export const OPEN_MAX = 0.45
export const GATE_MS = 1000
export const BREAK_MS = 700
export const RESUME_MS = 300
export const DEPTH_DELTA_MM = 15
const SMOOTH_N = 5 // ~30 Hz → ~0,17 sn ortanca
const DEPTH_N = 3 // ~10 Hz → ~0,3 sn ortanca
const BLINK_FRESH_MS = 400 // yüz karesi bu kadar eskiyse göz kapağı bilgisi yok sayılır
const DEPTH_FRESH_MS = 600

// Derinlikten örtülen taraf: 'L' | 'R' | null. dl, dr: kişinin sol / sağ göz bölgesi (mm).
export function coveredSide(dl, dr, delta = DEPTH_DELTA_MM) {
  if (!Number.isFinite(dl) || !Number.isFinite(dr)) return null
  if (Math.abs(dl - dr) < delta) return null
  return dl < dr ? 'L' : 'R'
}

// Test edilen göz → kapalı olması gereken göz
export const coverFor = (eye) => (eye === 'R' ? 'L' : eye === 'L' ? 'R' : 'none')

// l, r: 0–1 kapanma (null = yüz karesi yok). need: 'L' | 'R' (örtülmesi gereken) | 'none' (ikisi açık).
// side: derinlikten örtülen taraf ('L' | 'R' | null), depthKnown: derinlik ölçüldü mü.
export function classify(l, r, need, side = null, depthKnown = false) {
  const blinkKnown = Number.isFinite(l) && Number.isFinite(r)
  if (need === 'none') {
    if (side) return 'closed' // bir gözün önünde el var
    if (!blinkKnown) return depthKnown ? 'ok' : 'no-face'
    if (l <= OPEN_MAX && r <= OPEN_MAX) return 'ok'
    if (l >= CLOSED_MIN || r >= CLOSED_MIN) return 'closed'
    return 'unclear'
  }
  if (side) return side === need ? 'ok' : 'wrong-eye'
  if (!blinkKnown) return depthKnown ? 'unclear' : 'no-face'
  if (l >= CLOSED_MIN || r >= CLOSED_MIN) return 'ok'
  if (l <= OPEN_MAX && r <= OPEN_MAX) return 'uncovered'
  return 'unclear'
}

// Belirsiz (eşikler arası) durum testi durdurmaz; yalnızca açıkça yanlış durumlar durdurur.
const BAD = new Set(['no-face', 'closed', 'uncovered', 'wrong-eye'])

function median(arr) {
  const s = [...arr].sort((a, b) => a - b)
  return s[Math.floor(s.length / 2)]
}

export function createOcclusionMonitor(need) {
  const L = []
  const R = []
  const DL = []
  const DR = []
  let blinkTs = null
  let depthTs = null
  let l = null
  let r = null
  let dl = null
  let dr = null
  let state = null
  let method = null // 'depth' | 'lid' | null — son 'ok' kararının kaynağı
  let okSince = null
  let badSince = null
  let blocked = false
  let blockedAt = null
  let pauses = 0
  let blockedMs = 0
  const push5 = (buf, v, n) => {
    buf.push(v)
    if (buf.length > n) buf.shift()
    return median(buf)
  }

  function evaluate(ts) {
    const blinkFresh = blinkTs != null && ts - blinkTs <= BLINK_FRESH_MS
    const depthFresh = depthTs != null && ts - depthTs <= DEPTH_FRESH_MS
    const side = depthFresh ? coveredSide(dl, dr) : null
    state = classify(blinkFresh ? l : null, blinkFresh ? r : null, need, side, depthFresh)
    method = state === 'ok' ? (side ? 'depth' : blinkFresh ? 'lid' : 'depth') : null
    if (state === 'ok') {
      if (okSince == null) okSince = ts
      badSince = null
    } else {
      okSince = null
      if (BAD.has(state)) { if (badSince == null) badSince = ts } else badSince = null
    }
    if (!blocked && badSince != null && ts - badSince >= BREAK_MS) {
      blocked = true
      blockedAt = ts
      pauses += 1
    } else if (blocked && okSince != null && ts - okSince >= RESUME_MS) {
      blocked = false
      blockedMs += ts - blockedAt
      blockedAt = null
    }
    return snapshot(ts)
  }

  function snapshot(ts = 0) {
    return {
      state,
      method,
      l,
      r,
      dl,
      dr,
      gateReady: state === 'ok' && okSince != null && ts - okSince >= GATE_MS,
      gateFrac: state === 'ok' && okSince != null ? Math.min(1, (ts - okSince) / GATE_MS) : 0,
      blocked,
      pauses,
      blockedMs: Math.round(blockedMs + (blocked && blockedAt != null ? ts - blockedAt : 0)),
    }
  }

  return {
    need,
    // Yüz karesi: { face, blinkLeft, blinkRight }
    push(f, ts) {
      if (!f?.face || !Number.isFinite(f.blinkLeft) || !Number.isFinite(f.blinkRight)) {
        L.length = 0
        R.length = 0
        l = null
        r = null
        blinkTs = null
      } else {
        l = push5(L, f.blinkLeft, SMOOTH_N)
        r = push5(R, f.blinkRight, SMOOTH_N)
        blinkTs = ts
      }
      return evaluate(ts)
    },
    // Derinlik karesi: { eyesKnown, leftMm, rightMm } (kişinin kendi sol / sağ gözü)
    pushDepth(d, ts) {
      if (!d?.eyesKnown || !Number.isFinite(d.leftMm) || !Number.isFinite(d.rightMm)) {
        DL.length = 0
        DR.length = 0
        dl = null
        dr = null
        depthTs = null
      } else {
        dl = push5(DL, d.leftMm, DEPTH_N)
        dr = push5(DR, d.rightMm, DEPTH_N)
        depthTs = ts
      }
      return evaluate(ts)
    },
    // Kare gelmese de zaman ilerlesin (el yüzü örtünce yüz kareleri tamamen durur)
    tick(ts) {
      return evaluate(ts)
    },
    // Test başlarken çağrılır: yönerge ekranındaki bekleme duraklama sayılmasın
    resetStats() {
      pauses = 0
      blockedMs = 0
      blockedAt = null
      blocked = false
    },
    snapshot,
  }
}

// Kullanıcıya kısa yönerge (duruma ve kapatılacak göze göre)
const SIDE = { L: 'sol', R: 'sağ' }
export function occlusionMessage(state, need) {
  const cover = SIDE[need]
  const test = need === 'L' ? 'sağ' : 'sol'
  switch (state) {
    case 'ok': return need === 'none' ? 'İki gözün açık' : `${cap(cover)} göz örtülü · ${test} gözünle bak`
    case 'no-face': return 'Yüzün görünmüyor'
    case 'closed': return 'İki gözünü de aç'
    case 'uncovered': return `İki gözün açık · ${cover} gözünü avucunla ört`
    case 'wrong-eye': return `Diğer gözünü örtmüşsün · ${cover} gözünü ört`
    default: return need === 'none' ? 'İki gözünü de aç' : `${cap(cover)} gözünü tam ört, ${test} gözünü kısma`
  }
}
const cap = (s) => (s ? s[0].toLocaleUpperCase('tr-TR') + s.slice(1) : s)
