// Tek göz testi için örtme kontrolü (AcuityTest). Kaynak: iPhone TrueDepth yüz takibinin göz kapanma
// değerleri (ARKit eyeBlinkLeft/Right, 0 = açık, 1 = kapalı; native "face" olayı blinkLeft/blinkRight).
//
// Kural: test edilen göz AÇIK, diğer göz KAPALI (kapağı indirilmiş, üstü avuçla örtülü). İki göz testinde
// ikisi de açık. Doğru durum 1 sn kesintisiz görülmeden test başlamaz; test sırasında durum 0,7 sn'den
// uzun bozulursa harf gizlenir (kırpma ≈ 0,1–0,4 sn sürer, kırpma testi durdurmaz).
//
// VARSAYIM 1: blinkLeft kullanıcının kendi SOL gözü (ARKit yüzün kendi koordinatını kullanır; Apple belgesi
//   bunu açıkça yazmıyor). Ters çıkarsa kişi "diğer gözünü kapatmışsın" uyarısını görür; cihaz verisiyle
//   doğrulanacak (Build 24 kontrol kartındaki ham değerler).
// VARSAYIM 2: avuçla örtülen ama kapağı açık göz kamerada "açık" okunabilir; bu yüzden kişiden örtülen gözün
//   kapağını da indirmesi istenir. Eşikler (0,55 / 0,45) cihaz verisiyle ayarlanacak.
export const CLOSED_MIN = 0.55
export const OPEN_MAX = 0.45
export const GATE_MS = 1000
export const BREAK_MS = 700
export const RESUME_MS = 300
const SMOOTH_N = 5 // ~30 Hz → ~0,17 sn ortanca

// Test edilen göz → kapalı olması gereken göz
export const coverFor = (eye) => (eye === 'R' ? 'L' : eye === 'L' ? 'R' : 'none')

// l, r: 0–1 kapanma. need: 'L' | 'R' (kapalı olması gereken) | 'none' (ikisi açık)
export function classify(l, r, need) {
  if (!Number.isFinite(l) || !Number.isFinite(r)) return 'no-face'
  const lc = l >= CLOSED_MIN
  const rc = r >= CLOSED_MIN
  const lo = l <= OPEN_MAX
  const ro = r <= OPEN_MAX
  if (need === 'none') {
    if (lo && ro) return 'ok'
    if (lc || rc) return 'closed'
    return 'unclear'
  }
  const [coverC, coverO, testC, testO] = need === 'L' ? [lc, lo, rc, ro] : [rc, ro, lc, lo]
  if (coverC && testO) return 'ok'
  if (coverC && testC) return 'both-closed'
  if (coverO && testC) return 'wrong-eye'
  if (coverO && testO) return 'uncovered'
  return 'unclear'
}

// Belirsiz (eşikler arası) durum testi durdurmaz; yalnızca açıkça yanlış durumlar durdurur.
const BAD = new Set(['no-face', 'closed', 'both-closed', 'wrong-eye', 'uncovered'])

function median(arr) {
  const s = [...arr].sort((a, b) => a - b)
  return s[Math.floor(s.length / 2)]
}

export function createOcclusionMonitor(need) {
  const L = []
  const R = []
  let state = null
  let okSince = null
  let badSince = null
  let blocked = false
  let blockedAt = null
  let pauses = 0
  let blockedMs = 0
  let l = null
  let r = null
  return {
    need,
    // f: { face, blinkLeft, blinkRight }
    push(f, ts) {
      if (!f?.face || !Number.isFinite(f.blinkLeft) || !Number.isFinite(f.blinkRight)) {
        L.length = 0
        R.length = 0
        l = null
        r = null
      } else {
        L.push(f.blinkLeft)
        R.push(f.blinkRight)
        if (L.length > SMOOTH_N) L.shift()
        if (R.length > SMOOTH_N) R.shift()
        l = median(L)
        r = median(R)
      }
      state = classify(l, r, need)
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
      return this.snapshot(ts)
    },
    // Test başlarken çağrılır: yönerge ekranındaki bekleme duraklama sayılmasın
    resetStats() {
      pauses = 0
      blockedMs = 0
      if (blocked) blockedAt = null
      blocked = false
    },
    snapshot(ts = 0) {
      return {
        state,
        l,
        r,
        gateReady: state === 'ok' && okSince != null && ts - okSince >= GATE_MS,
        gateFrac: state === 'ok' && okSince != null ? Math.min(1, (ts - okSince) / GATE_MS) : 0,
        blocked,
        pauses,
        blockedMs: Math.round(blockedMs + (blocked && blockedAt != null ? ts - blockedAt : 0)),
      }
    },
  }
}

// Kullanıcıya kısa yönerge (duruma ve örtülecek göze göre)
const SIDE = { L: 'sol', R: 'sağ' }
export function occlusionMessage(state, need) {
  const cover = SIDE[need]
  const test = need === 'L' ? 'sağ' : 'sol'
  switch (state) {
    case 'ok': return need === 'none' ? 'İki gözün açık' : `${cap(cover)} gözün kapalı, ${test} gözün açık`
    case 'no-face': return 'Yüzün görünmüyor'
    case 'closed': return 'İki gözünü de aç'
    case 'both-closed': return `${cap(test)} gözünü aç`
    case 'wrong-eye': return `Diğer gözünü kapatmışsın: ${cover} gözünü kapat`
    case 'uncovered': return `${cap(cover)} gözünü kapat ve avucunla ört`
    default: return need === 'none' ? 'İki gözünü de aç' : `${cap(cover)} gözünü tam kapat, ${test} gözünü kısma`
  }
}
const cap = (s) => (s ? s[0].toLocaleUpperCase('tr-TR') + s.slice(1) : s)
