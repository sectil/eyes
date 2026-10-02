// Haftalık / günlük yakın E testi · Hazırlık ekranı (E2) için tek kaynak: üç satırın durumu (Gözlük, Örtme,
// Mesafe) ve ana düğmenin yazısı. Saf fonksiyon: saat okumaz, kamera açmaz, kayıt yazmaz.
//
// Kaynak: PLAN.md 1.1 ("Başla" neden kapalı belli değil), 1.4 (örtme kartı), 1.8 (kapak yolu taraf ayırt
// etmez), bölüm 4 E2 (düğme öncelik sırası, örtme satırı durumları) ve E4 (kamera yok / ters renk);
// kararlar S5, S8, S12. Metinler onaylı tasarımdan birebir (nefona-e-testi.html: G, C, D nesneleri).
//
// İlkeler:
// - Hiçbir satır ya da metin kendi başına "başlayabilirsin" demez. Hazır olmayı yalnız düğme söyler ("Başla").
// - Düğme hazır değilse yazısı ilk eksik adımın kendisidir (öncelik sırası sabit, aşağıda).
// - Kapak yolunda (göz kapağıyla kapatma) kamera hangi gözün kapalı olduğunu ayırt edemez: taraf hiçbir yerde
//   gerçek gibi yazılmaz, soru olarak sorulur ("Sol mu?") ve tek dokunuşla onaylanır (lib/occlusion.js).
// - Yöntem kayda dürüst yazılır (S8): camera-depth / camera-lid+self / camera-self / self-report. İki göz
//   testinde örtme yok: 'none'. Yöntem seri anahtarına girmez.
//
// Düğme öncelik sırası (PLAN.md 4 E2):
//   1 ters renk açık          "Renkleri ters çevirmeyi kapat"
//   2 gözlük seçilmedi        "Önce gözlüğünü seç"            (dokununca gözlük sayfası)
//   3 yüz görünmüyor          "Yüzünü kameraya göster"
//   4 yanlış göz              "Sol gözünü ört"                 (satır: "Yanlış göz. Diğer gözünü ört"; "Yanlış göz" bir kez)
//   5 örtülmedi               "Sol gözünü avucunla ört"
//   6 kapak yolu              "Evet, sol gözüm kapalı"         (dokunmak onaydır)
//   7 örtme tutuluyor         "Böyle kal…"                     (1 sn, düğmenin içi dolar)
//   8 mesafe bant dışı        "Biraz yaklaştır · 40 cm" / "Biraz uzaklaştır · 40 cm"
//   9 iki göz açık değil      "İki gözünü de açık tut"         (yalnız iki göz testi; alt satır ve sesli cümleyle aynı)
//  10 hepsi tamam             "Başla"
// Kamerasız (cam.error ya da mesafe izlenmiyor): satırlar kendin-onay anahtarı olur; düğme önce eksik
// onayları söyler ("2 maddeyi onayla", "Sol gözünün örtülü olduğunu onayla", "Telefonu 40 cm tuttuğunu onayla").

import { GATE_MS, coverFor } from './occlusion.js'
import { distanceHint, bandCm } from './trialGate.js'

// Yüz görünür ama örtme doğrulanmazsa "Örttüm" yedeği bu kadar sonra çıkar (karar S8)
export const FALLBACK_MS = 4000

// Gözlük seçenekleri (E3 sayfasıyla aynı sıra ve metin). Eski 'glasses' kaydı burada yok: seçtirilir.
export const WEAR_OPTIONS = [
  { id: 'none', text: 'Gözlüksüz' },
  { id: 'reading', text: 'Okuma gözlüğü' },
  { id: 'progressive', text: 'Progresif / bifokal' },
  { id: 'distance', text: 'Yalnız uzak gözlüğü' },
  { id: 'contacts', text: 'Lens' },
]
const WEAR_TEXT = Object.fromEntries(WEAR_OPTIONS.map((w) => [w.id, w.text]))

export const COVER_METHODS = ['camera-depth', 'camera-lid+self', 'camera-self', 'self-report']

const SIDE = { L: 'sol', R: 'sağ' }
const SIDE_CAP = { L: 'Sol', R: 'Sağ' }
const SIDE_ASK = { L: 'Sol mu?', R: 'Sağ mı?' }
// İki göz testinin emri: hazırlık alt satırı ve sesli cümle (voicePack acuBoth "İki gözünü de açık tut.") ile aynı
// ifade; satır ve düğme de bunu yazar ("İki gözünü de aç" demez)
export const BOTH_OPEN = 'İki gözünü de açık tut'

const finite = (x) => typeof x === 'number' && Number.isFinite(x)
// Mesafe satırının sayısı: bant dışındayken bandın dışındaki en yakın tam cm ("Biraz yaklaştır" yanında "44 cm" yazmaz;
// lib/trialGate.js bandCm). Bant ve durum denemedeki kapıyla aynı (distanceHint: 360–440 mm, sınırlar dahil).
const cm = (mm) => {
  const c = bandCm(mm)
  return c == null ? '— cm' : `${c} cm`
}

// lib/occlusion.js izleyici anlık görüntüsü → acuityReadiness occ girdisi. Örtme kamerayla izleniyor ama
// henüz kare gelmediyse (snap = null) 'no-face' döner; örtme hiç izlenmiyorsa çağıran occ: null vermeli.
export function occFromSnapshot(snap) {
  if (!snap) return { status: 'no-face', method: null, holdMs: 0, lidAsk: false, sinceFaceMs: 0, gateReady: false }
  const status = snap.state ?? 'no-face'
  return {
    status,
    method: snap.method ?? null,
    holdMs: finite(snap.holdMs) ? snap.holdMs : finite(snap.gateFrac) ? snap.gateFrac * GATE_MS : 0,
    lidAsk: status === 'lid-ask',
    sinceFaceMs: finite(snap.sinceFaceMs) ? snap.sinceFaceMs : 0,
    gateReady: Boolean(snap.gateReady),
  }
}

function normalize(s = {}) {
  const eye = s.eye === 'L' || s.eye === 'OU' ? s.eye : 'R'
  const need = coverFor(eye) // 'L' | 'R' | 'none'
  const cam = s.cam ?? {}
  const distance = s.distance ?? {}
  const self = s.selfConfirm ?? {}
  // Kameralı mod: kamera hatasız ve mesafe kamerayla izleniyor. Değilse her şey kişinin onayıyla (S5).
  const camMode = !cam.error && distance.tracked === true
  // Örtme kamerayla izleniyor mu (TrueDepth). occ: null → izlenmiyor (web ya da kamerasız).
  const occ = camMode && s.occ ? s.occ : null
  const status = occ ? occ.status ?? occ.state ?? (occ.lidAsk ? 'lid-ask' : 'no-face') : null
  const holdMs = occ && finite(occ.holdMs) ? occ.holdMs : 0
  const holdDone = status === 'ok' && (occ.gateReady === true || holdMs >= GATE_MS)
  const mm = camMode && finite(distance.mm) ? distance.mm : null
  return {
    eye,
    need,
    single: need !== 'none',
    eyeIdx: Number.isInteger(s.eyeIdx) ? s.eyeIdx : 0,
    correction: WEAR_TEXT[s.correction] ? s.correction : null,
    legacy: s.correction === 'glasses' || s.correctionFrom === 'legacy',
    correctionFrom: s.correctionFrom ?? null,
    inverted: s.inverted === true,
    camError: cam.error ?? null,
    camMode,
    occ,
    status,
    occMethod: occ?.method ?? null,
    holdMs,
    holdDone,
    sinceFaceMs: occ && finite(occ.sinceFaceMs) ? occ.sinceFaceMs : 0,
    mm,
    selfCover: self.cover === true,
    selfDistance: self.distance === true,
  }
}

// ——— Satırlar ———

function glassesRow(n) {
  const pick = { type: 'action', text: 'Seç ›', action: 'glasses' }
  if (!n.correction) {
    if (n.legacy) return { key: 'glasses', status: 'bad', label: 'Gözlük · geçen sefer gözlüklüydün', value: 'Hangisi?', trailing: pick }
    return { key: 'glasses', status: 'bad', label: 'Gözlük', value: 'Seçilmedi', trailing: pick }
  }
  const value = WEAR_TEXT[n.correction]
  // 2. ve 3. gözde kilitli: üç göz aynı koşulda ölçülür
  if (n.eyeIdx > 0) return { key: 'glasses', status: 'ok', label: 'Gözlük · test boyunca aynı', value }
  const label = n.correctionFrom === 'last' ? 'Gözlük · geçen seferki' : n.correctionFrom === 'profile' ? 'Gözlük · profilinden' : 'Gözlük'
  return { key: 'glasses', status: 'ok', label, value, trailing: { type: 'action', text: 'Değiştir', action: 'glasses' } }
}

function selfCoverRow(n) {
  return {
    key: 'cover',
    status: n.selfCover ? 'ok' : 'wait',
    label: 'Örtme · senin onayın',
    value: `${SIDE_CAP[n.need]} gözüm örtülü`,
    trailing: { type: 'toggle', on: n.selfCover, action: 'self-cover' },
  }
}

const holdRow = (n) => ({ key: 'cover', status: 'wait', label: 'Örtme', value: 'Böyle kal…', trailing: { type: 'ring', progress: Math.min(1, n.holdMs / GATE_MS) } })
const faceRow = () => ({ key: 'cover', status: 'wait', label: 'Örtme', value: 'Yüzün aranıyor' })

function coverRow(n) {
  // İki göz testi: örtme yok, iki göz açık olmalı
  if (!n.single) {
    // Alt satır ve sesli cümleyle aynı ifade ("İki gözünü de açık tut.")
    if (!n.occ) return { key: 'cover', status: 'ok', label: 'Örtme', value: BOTH_OPEN }
    if (n.status === 'no-face') return faceRow()
    if (n.status === 'ok') return n.holdDone ? { key: 'cover', status: 'ok', label: 'Örtme', value: 'İki gözün açık' } : holdRow(n)
    return { key: 'cover', status: n.status === 'closed' ? 'bad' : 'wait', label: 'Örtme', value: BOTH_OPEN }
  }
  // Tek göz, örtme kamerayla izlenmiyor: kişinin onayı
  if (!n.occ) return selfCoverRow(n)
  // Tek göz, kamera: yanlış göz her onayın önüne geçer (derinlik tarafı kesin gördü)
  // Satır sesli cümlenin aynısı (voicePack acuWrong); hangi gözün örtüleceğini düğme söyler ("Sol gözünü ört")
  if (n.status === 'wrong-eye') {
    return { key: 'cover', status: 'bad', label: 'Örtme', value: 'Yanlış göz. Diğer gözünü ört' }
  }
  if (n.holdDone) {
    // Derinlik tarafı gördüyse kamera doğruladı; kapak yolunda taraf kişinin onayıdır, gerçek gibi yazılmaz
    return n.occMethod === 'depth'
      ? { key: 'cover', status: 'ok', label: 'Örtme · kamera doğruladı', value: `${SIDE_CAP[n.need]} göz örtülü` }
      : { key: 'cover', status: 'ok', label: 'Örtme · senin onayın', value: `${SIDE_CAP[n.need]} gözüm kapalı` }
  }
  if (n.selfCover) return selfCoverRow(n)
  if (n.status === 'no-face') return faceRow()
  if (n.status === 'ok') return holdRow(n)
  if (n.status === 'lid-ask') return { key: 'cover', status: 'wait', label: 'Örtme · bir gözün kapalı', value: SIDE_ASK[n.need] }
  // 'uncovered' / 'unclear': yüz 4 sn görünür ama doğrulanamadıysa "Örttüm" yedeği (S8)
  if (n.sinceFaceMs >= FALLBACK_MS) {
    return {
      key: 'cover',
      status: 'wait',
      label: 'Örtme · kamera doğrulayamadı',
      value: 'Örttüysen onayla',
      trailing: { type: 'action', text: 'Örttüm', action: 'self-cover' },
    }
  }
  return { key: 'cover', status: 'wait', label: 'Örtme', value: `${SIDE_CAP[n.need]} gözünü avucunla ört` }
}

function distanceRow(n) {
  if (!n.camMode) {
    return {
      key: 'distance',
      status: n.selfDistance ? 'ok' : 'wait',
      label: 'Mesafe · kitap okur gibi',
      value: '40 cm tutuyorum',
      trailing: { type: 'toggle', on: n.selfDistance, action: 'self-distance' },
    }
  }
  const label = 'Mesafe · hedef 40 cm'
  const trailing = { type: 'value', text: cm(n.mm) }
  const ds = distanceHint(n.mm)
  if (ds === 'no-face') return { key: 'distance', status: 'wait', label, value: 'Bekleniyor', trailing }
  if (ds === 'too-far') return { key: 'distance', status: 'bad', label, value: 'Biraz yaklaştır', trailing }
  if (ds === 'too-close') return { key: 'distance', status: 'bad', label, value: 'Biraz uzaklaştır', trailing }
  return { key: 'distance', status: 'ok', label, value: 'Tam yerinde', trailing }
}

// ——— Düğme ———

const need = (reason, text, targetRow, action = null) => ({ ready: false, kind: 'need', reason, text, targetRow, action })

function pickButton(n) {
  // 1 · ters renk (S12): test başlamaz
  if (n.inverted) return need('inverted', 'Renkleri ters çevirmeyi kapat', null)
  // 2 · gözlük
  if (!n.correction) return need('glasses', 'Önce gözlüğünü seç', 'glasses', 'glasses')

  // Kamerasız: iki madde kişinin onayıyla (E4)
  if (!n.camMode) {
    const coverMissing = n.single && !n.selfCover
    const distMissing = !n.selfDistance
    if (coverMissing && distMissing) return need('self', '2 maddeyi onayla', 'cover')
    if (coverMissing) return need('self', `${SIDE_CAP[n.need]} gözünün örtülü olduğunu onayla`, 'cover')
    if (distMissing) return need('self', 'Telefonu 40 cm tuttuğunu onayla', 'distance')
    return { ready: true, kind: 'go', reason: null, text: 'Başla', targetRow: null, action: 'start' }
  }

  // 3 · yüz: örtme izleyicisi yüz görmüyor ya da mesafe ölçülemiyor
  if (n.status === 'no-face') return need('face', 'Yüzünü kameraya göster', 'cover')
  if (n.mm == null) return need('face', 'Yüzünü kameraya göster', 'distance')

  if (n.single) {
    if (!n.occ) {
      // Örtme kamerayla izlenmiyor (web): kişinin onayı
      if (!n.selfCover) return need('self', `${SIDE_CAP[n.need]} gözünün örtülü olduğunu onayla`, 'cover')
    } else {
      // 4 · yanlış göz (onay da olsa). "Yanlış göz" satırda yazılı; düğme yalnız yapılacak işi söyler
      if (n.status === 'wrong-eye') return need('wrong-eye', `${SIDE_CAP[n.need]} gözünü ört`, 'cover')
      if (!n.holdDone && !n.selfCover) {
        // 6 · kapak yolu: taraf soru olarak; dokunmak onaydır
        if (n.status === 'lid-ask') {
          return { ready: false, kind: 'confirm', reason: 'lid', text: `Evet, ${SIDE[n.need]} gözüm kapalı`, targetRow: 'cover', action: 'confirm-lid' }
        }
        // 7 · 1 sn tutma
        if (n.status === 'ok') {
          return { ready: false, kind: 'hold', reason: 'hold', text: 'Böyle kal…', targetRow: 'cover', action: null, progress: Math.min(1, n.holdMs / GATE_MS) }
        }
        // 5 · örtülmedi / belirsiz (4 sn sonra satırda "Örttüm" yedeği çıkar; düğme yine emri söyler)
        return need('cover', `${SIDE_CAP[n.need]} gözünü avucunla ört`, 'cover')
      }
    }
  }

  // 8 · mesafe (sayılan bant 36–44 cm, S1; denemedeki kapıyla aynı sınırlar)
  const ds = distanceHint(n.mm)
  if (ds === 'too-far') return need('too-far', 'Biraz yaklaştır · 40 cm', 'distance')
  if (ds === 'too-close') return need('too-close', 'Biraz uzaklaştır · 40 cm', 'distance')

  // 9 · iki göz testi: ikisi açık, 1 sn
  if (!n.single && n.occ) {
    if (n.status !== 'ok') return need('open', BOTH_OPEN, 'cover')
    if (!n.holdDone) {
      return { ready: false, kind: 'hold', reason: 'hold', text: 'Böyle kal…', targetRow: 'cover', action: null, progress: Math.min(1, n.holdMs / GATE_MS) }
    }
  }

  // 10
  return { ready: true, kind: 'go', reason: null, text: 'Başla', targetRow: null, action: 'start' }
}

// ——— Yöntem (kayıt) ———

// Örtmenin nasıl doğrulandığı (S8). Hazır değilse null. İki göz testinde 'none'.
function coverMethodOf(n) {
  if (!n.single) return 'none'
  if (!n.occ) return n.selfCover ? 'self-report' : null
  if (n.status === 'wrong-eye') return null
  if (n.holdDone) return n.occMethod === 'depth' ? 'camera-depth' : 'camera-lid+self'
  if (n.selfCover) return 'camera-self'
  return null
}

function noticeOf(n) {
  if (n.inverted) return { key: 'inverted', title: 'Renkleri ters çevirme açık.', body: 'Ölçüm için kapat: Ayarlar → Erişilebilirlik.' }
  if (n.camError) return { key: 'camera', title: 'Kamera açılamadı', body: 'Kamera izni kapalıysa: Ayarlar → Nefona → Kamera.' }
  return null
}

// state: {
//   eye: 'R' | 'L' | 'OU', eyeIdx: 0 | 1 | 2,
//   correction: 'none' | 'reading' | 'progressive' | 'distance' | 'contacts' | null ('glasses' = eski kayıt),
//   correctionFrom?: 'last' | 'profile' | 'legacy' | null   (ön seçimin kaynağı; S10)
//   inverted: boolean                                         (renkleri ters çevirme açık; S12)
//   cam: { error: 'permission' | 'load' | null, face: boolean },
//   occ: { status, method, holdMs, lidAsk, sinceFaceMs, gateReady? } | null   (null = örtme kamerayla izlenmiyor;
//        izleniyor ama kare yoksa occFromSnapshot(null) ver),
//   distance: { mm: number | null, tracked: boolean },
//   selfConfirm: { distance: boolean, cover: boolean }       (kendin-onay anahtarları ve "Örttüm")
// }
// Dönüş: { rows: [glasses, cover, distance], button, method, mode: 'camera' | 'self', notice }
//   row: { key, status: 'ok' | 'wait' | 'bad', label, value, trailing? }
//     trailing: { type: 'action', text, action: 'glasses' | 'self-cover' } | { type: 'value', text }
//             | { type: 'toggle', on, action: 'self-cover' | 'self-distance' } | { type: 'ring', progress }
//   button: { ready, text, kind: 'go' | 'need' | 'hold' | 'confirm', reason, targetRow, action, progress? }
//     action: 'start' | 'glasses' (gözlük sayfası) | 'confirm-lid' (occlusion monitor.confirmLid) | null
export function acuityReadiness(state = {}) {
  const n = normalize(state)
  const button = pickButton(n)
  return {
    rows: [glassesRow(n), coverRow(n), distanceRow(n)],
    button,
    method: button.ready ? coverMethodOf(n) : null,
    mode: n.camMode ? 'camera' : 'self',
    notice: noticeOf(n),
  }
}
