// Deneme kapısı: yakın E testinde (AcuityTest) bir cevabın sayılıp sayılmayacağını ve testin ne zaman
// duracağını / süreceğini söyleyen saf durum makinesi. İçeride saat okunmaz; her çağrıya zaman (ts, ms)
// dışarıdan verilir (çağıran tarafın tekdüze saati; kamera karesinin zaman damgası gibi).
//
// Kaynak: PLAN.md H2 (boyut dondurma, %5 kuralı), H3 (36–44 cm bandı), E5/E6 (duraklama tetikleri),
// kararlar S1 ve S8. Kanıt: K1 (yakın görme sabit 40 cm'de), K3 (insanlar telefonu 36,8±6,6 cm tutar).
//
// Kurallar:
// - Sayılan deneme yalnız 360–440 mm'de cevaplanırsa sayılır. Duraklama histerezisle: 350–450 mm dışında
//   (ya da mesafe yokken) 300 ms kalınca durur; 360–440 mm içinde 300 ms kalınca sürer. Testi yalnız bu 300 ms
//   kuralı durdurur (S1): 350–360 ve 440–450 mm'de test durmaz; orada verilen cevap sayılmaz ve yeni harf açılmaz
//   (ekranda oklar soluk, cm göstergesi bant dışını gösterir, bekleyiş sürerse neden harf yuvasında yazar: hold).
//   Bant kenarında titreyen mesafe (ör. 43,8 ± 0,4 cm) testi durdurup başlatmaz; yalnız o anki harf beklenir.
// - Alıştırma (sayılmaz) 250–600 mm'de sürer; dışında 300 ms kalınca durur, içinde 300 ms kalınca sürer.
// - Harf boyutu harf göründüğü anda dondurulur (freeze); deneme açıkken mesafe değişse de birim değişmez.
// - Cevapta kayda, dondurulmuş yüksekliğin CEVAP ANINDAKİ mesafedeki açısı (logMAR) yazılır. Mesafe donma
//   anına göre %5'ten fazla değiştiyse deneme sayılmaz; aynı hedef güncel mesafede, yeni yönle gösterilir.
// - Örtme bozuk durumu 700 ms kesintisiz sürerse durur, 300 ms düzelince sürer (lib/occlusion.js ile aynı süreler).
//   Kendin-onayla başlanmışsa (selfConfirmed) "uncovered" durdurmaz, "wrong-eye" durdurur.
// - Örtme engeli (700 ms'yi beklemeden): örtme son OCC_BLOCK_WIN_MS içinde en az OCC_BLOCK_MS "wrong-eye" ya da
//   "uncovered" okunduysa (kendin-onayda yalnız "wrong-eye") yeni harf gösterilmez (freeze) ve sayılan cevap alınmaz,
//   aynı hedef yeni yönle yeniden gösterilir ('occlusion'; ekran nedeni kısa süre gösterir). ~10 Hz okumada: son dört
//   karenin en az üçü bozuk. Tek bozuk kare ya da bozukla sakinin ("belirsiz", "tamam") kare kare gidip gelmesi cevabı
//   reddetmez; çoğu bozuk okumanın arasına giren tek sakin kare de engeli kaldırmaz. 700 ms yalnız duraklama kartı
//   içindir; iki gözle (ya da yanlış gözle) görülmüş harf o arada da sayılmaz (E6).
// - Sayılan evrede yeni harf yalnız 360–440 mm'de açılır (alıştırmadan geçişte de); histerezis yalnız ekrandaki
//   harfi titretmemek içindir, bant dışında yeni harf başlatmak için değil.
// - Harf açılamıyor ama test durmadıysa (sayılan evrede 360–440 mm dışı; örtme engeli) neden 'hold' olarak döner:
//   'too-far' | 'too-close' | 'wrong-eye' | 'uncovered' (örtmede pencerede yanlış göz varsa o). Bekleyiş HOLD_HINT_MS
//   sürünce (neden arada değişse de) 'holdHint': ekran ne yapılacağını harf yuvasında yazar (duraklama kartının emri;
//   "Test durdu" satırı ve ses yok). Duraklamaya varmayan bekleyiş (ör. 44,5 cm'de sabit tutmak) böylece sessiz kalmaz.
// - Duraklamada açık deneme kapanır. Test sürünce aynı hedef, yeni rastgele yönle yeniden gösterilir; böylece
//   iki gözle görülmüş harf cevaplanamaz. Yeni yön öncekinden bağımsız çekilir (zest.randomDirection):
//   öncekini dışlamak, hatırlanan yöne 1/3 şans verirdi; bağımsız çekimde hatırlamak şans düzeyini (1/4) aşmaz.
// - Duraklama nedeni (kartın emri) kare kare gidip gelmez (üçüncü doğrulama V3-N1). Örtme "wrong-eye" ile "uncovered"
//   arasında gidip gelirse neden "wrong-eye" kalır: son OCC_BLOCK_WIN_MS içinde "wrong-eye" okunduysa "uncovered" onun
//   yerine sayılır (harf yuvasındaki neden kartıyla aynı kural, occBlockWhy). Tek karelik kayıp nedeni silmez: mesafe bir
//   an ölçülemezse son ölçülen bant dışı yön, örtme bir an "yüz yok" okunursa son bozuk örtme okuması REASON_SWITCH_MS
//   boyunca sürer. Neden tek kareden doğmaz: ancak REASON_SWITCH_MS kesintisiz en önde olan koşul neden olur; gösterilen
//   neden REASON_SWITCH_MS'dir düzelmişse unutulur, yerine REASON_SWITCH_MS'dir süren en uzun koşul geçer. Neden duraklama
//   yokken de izlenir; kart açılırken neden yoksa en uzun süredir süren koşul yazılır (eşitse E2 sırası) ve kart bu
//   nedenle açılır.
// VARSAYIM: 300 / 700 / 250 / 400 / 1200 ms süreleri ve 10 mm histerezis cihazda denenmedi (PLAN.md bölüm 7).

import { logMARForHeight } from './optotype.js'
import { REFERENCE_MM } from './distance.js'

export const COUNT_MIN_MM = 360
export const COUNT_MAX_MM = 440
export const HOLD_MIN_MM = 350
export const HOLD_MAX_MM = 450
export const WARMUP_MIN_MM = 250
export const WARMUP_MAX_MM = 600
export const DIST_PAUSE_MS = 300
export const OCC_PAUSE_MS = 700
export const RESUME_MS = 300
export const MOVE_MAX_FRAC = 0.05
// Örtme son OCC_BLOCK_WIN_MS içinde en az OCC_BLOCK_MS bozuk ("wrong-eye" / "uncovered") okunmadan harf ve cevap
// engellenmez. ~10 Hz okumada son dört karenin en az üçü: tek karelik gürültü (ve bozukla sakinin yarı yarıya gidip
// gelmesi) cevabı sessizce reddetmesin; çoğu bozuk okumada tek sakin kare de engeli kaldırmasın. VARSAYIM: 250 / 400 ms
// ve bu oran cihazda denenmedi; kesintisiz 250 ms kuralının yerine çoğunluk penceresi sahibin kararını bekler
// (üçüncü inceleme R-S2-continuity).
export const OCC_BLOCK_MS = 250
export const OCC_BLOCK_WIN_MS = 400
// Harf bu kadar açılamazsa (test durmadan) neden harf yuvasında gösterilir (hold → holdHint). VARSAYIM: 1,2 sn
// (inceleme önerisi 1–1,5 sn; cihazda denenmedi).
export const HOLD_HINT_MS = 1200
// Duraklama kartının nedeni, yeni neden bu kadar kesintisiz en öndeyse değişir (~10 Hz okumada dört kare). Mesafe ve
// düzelme kurallarıyla aynı süre. VARSAYIM: 300 ms cihazda denenmedi.
export const REASON_SWITCH_MS = 300

const PHASES = new Set(['warmup', 'counted'])
// lib/occlusion.js classify() durumları: 'ok' | 'no-face' | 'closed' | 'uncovered' | 'wrong-eye' | 'unclear'
const OCC_BAD = new Set(['no-face', 'closed', 'uncovered', 'wrong-eye'])
// Duraklama nedeni önceliği (E2 düğme sırası): yüz, yanlış göz, örtme, mesafe, iki gözü aç
const REASON_ORDER = ['no-face', 'wrong-eye', 'uncovered', 'too-close', 'too-far', 'closed']

const finite = (x) => typeof x === 'number' && Number.isFinite(x)

// Sayılan cevap bandı (360–440 mm, sınırlar dahil)
export function inCountBand(mm) {
  return finite(mm) && mm >= COUNT_MIN_MM && mm <= COUNT_MAX_MM
}

// Canlı mesafe göstergesi için: sayılan banda göre ne yapılmalı? null = bant içinde
export function distanceHint(mm) {
  if (!finite(mm)) return 'no-face'
  if (mm < COUNT_MIN_MM) return 'too-close'
  if (mm > COUNT_MAX_MM) return 'too-far'
  return null
}

// Canlı mesafe göstergesinin tam cm sayısı (null = mesafe yok). Bant içindeyken en yakın tam sayı (36–44); bant
// dışındayken bandın dışındaki en yakın tam sayı: 440,1–454,9 mm "45 cm", 345–359,9 mm "35 cm". Düz yuvarlama
// 441–444 mm'yi "44 cm", 355–359 mm'yi "36 cm" yazıyordu: bant dışı bir mesafe 36–44 cm gibi okunuyordu.
const OUT_ABOVE_CM = Math.floor(COUNT_MAX_MM / 10) + 1 // 45
const OUT_BELOW_CM = Math.ceil(COUNT_MIN_MM / 10) - 1 // 35
export function bandCm(mm) {
  if (!finite(mm)) return null
  const cm = Math.round(mm / 10)
  if (mm > COUNT_MAX_MM) return Math.max(cm, OUT_ABOVE_CM)
  if (mm < COUNT_MIN_MM) return Math.min(cm, OUT_BELOW_CM)
  return cm
}

// Evreye göre bantlar: hold = bunun dışında DIST_PAUSE_MS kalınca durur; resume = içinde RESUME_MS kalınca sürer
function bands(phase) {
  return phase === 'warmup'
    ? { hold: [WARMUP_MIN_MM, WARMUP_MAX_MM], resume: [WARMUP_MIN_MM, WARMUP_MAX_MM] }
    : { hold: [HOLD_MIN_MM, HOLD_MAX_MM], resume: [COUNT_MIN_MM, COUNT_MAX_MM] }
}
const inside = (mm, [lo, hi]) => finite(mm) && mm >= lo && mm <= hi

function occStateOf(occ) {
  if (occ == null) return null
  if (typeof occ === 'string') return occ
  return typeof occ.state === 'string' ? occ.state : null
}

// opts:
//   phase: 'warmup' | 'counted' (varsayılan 'counted')
//   pxPerMm: CSS pikseli / mm (renderSpec ile aynı değer) — zorunlu
//   distanceTracked: mesafe kamerayla ölçülüyor mu (false = kamerasız, harf 40 cm'ye göre)
//   occlusion: örtme durumu duraklatsın mı (kamerasız / tek göz izlenmiyorsa false)
//   selfConfirmed: test kendin-onayla başladı ("Örttüm" yedeği); "uncovered" durdurmaz
export function createTrialGate(opts = {}) {
  const {
    phase: phase0 = 'counted',
    pxPerMm,
    distanceTracked = true,
    occlusion = true,
    selfConfirmed = false,
    referenceMm = REFERENCE_MM,
  } = opts
  if (!PHASES.has(phase0)) throw new TypeError(`trialGate: bilinmeyen evre ${phase0}`)
  if (!finite(pxPerMm) || pxPerMm <= 0) throw new TypeError('trialGate: pxPerMm gerekli')

  let phase = phase0
  let tracked = Boolean(distanceTracked)
  let occOn = Boolean(occlusion)

  let mm = null // son mesafe (mm); null = yüz / mesafe yok
  let occ = null // son örtme durumu

  let distBadSince = null
  let distGoodSince = null
  let occBadSince = null
  let occGoodSince = null
  // Örtme engeli (occBlocking) geçmişi: [{ ts, on, state }] (artan ts); her kayıt bir sonrakine dek geçerli. Engel açılıp
  // kapanınca ya da engelleyen durum ('wrong-eye' / 'uncovered') değişince yeni kayıt; yalnız son OCC_BLOCK_WIN_MS tutulur.
  let blockHist = []
  let holdWhy = null // harf şu an neden açılamıyor (test durmadı): 'too-far' | 'too-close' | 'wrong-eye' | 'uncovered'
  let holdSince = null // harf ne zamandan beri açılamıyor (neden değişse de sürer)
  let distLatch = false
  let occLatch = false
  let reason = null
  // Kartın nedeni (duraklama yokken de izlenir; noteLead): lead = gösterilecek neden ve ne zaman alındığı, leadGoneSince =
  // lead'in bozuk koşullar arasında görülmediği anın başlangıcı, leadCand = onu değiştirmeye aday en öndeki neden ve ne
  // zamandır önde, since = şu an bozuk her koşulun kesintisiz başlangıcı (kart açılırken en uzun süren seçilir).
  // lastDist / mmLostSince: son ölçülen mesafenin nedeni ('too-far' | 'too-close' | null) ve mesafenin ne zamandır
  // ölçülemediği; lastOccBad / occLostSince: örtmenin son bozuk okuması ve örtmede yüzün ne zamandır görülmediği.
  let lead = null
  let leadSince = null
  let leadGoneSince = null
  let leadCand = null
  let leadCandSince = null
  const since = new Map()
  let lastDist = null
  let mmLostSince = null
  let lastOccBad = null
  let occLostSince = null
  let pausedAt = null
  let lastTs = 0

  let open = null // { unitPx, mm, ts } — açık denemenin dondurulmuş boyutu

  const stats = { pauses: 0, pausedMs: 0, lidAskMs: 0, reshows: { moved: 0, band: 0, noDistance: 0, occlusion: 0, paused: 0 } }
  let lastEvalTs = null // 'lid-ask' süresi için önceki değerlendirme anı ve o andaki örtme durumu
  let lastEvalOcc = null

  const paused = () => distLatch || occLatch

  function occClass(state) {
    if (!occOn || state == null) return 'neutral'
    if (state === 'ok') return 'good'
    if (state === 'uncovered' && selfConfirmed) return 'good'
    if (OCC_BAD.has(state)) return 'bad'
    return 'neutral' // 'unclear' vb.: durdurmaz, sürdürmez
  }
  // Harfi ve sayılan cevabı engelleyen örtme durumu: yanlış göz ya da örtme kalktı (kendin-onayda "uncovered" iyi
  // sayılır). 'closed' (iki göz testi) burada yok: göz kırpması da 'closed' okunur.
  const occBlocking = (state) => occClass(state) === 'bad' && (state === 'wrong-eye' || state === 'uncovered')
  function noteBlock(ts) {
    const on = occBlocking(occ)
    const state = on ? occ : null
    const last = blockHist[blockHist.length - 1]
    if (!last || last.on !== on || last.state !== state) blockHist.push({ ts, on, state })
    while (blockHist.length > 1 && blockHist[1].ts <= ts - OCC_BLOCK_WIN_MS) blockHist.shift()
  }
  // Örtme engeli şu an var mı, nedeni ne? Son OCC_BLOCK_WIN_MS'nin en az OCC_BLOCK_MS'i engelleyen durumdaysa: pencerede
  // "wrong-eye" varsa o (E2 sırası; ikisi arasında gidip gelen okumada neden sabit kalır), yoksa "uncovered". Değilse null.
  function occBlockWhy(ts) {
    if (!finite(ts)) return null
    const from = ts - OCC_BLOCK_WIN_MS
    let ms = 0
    let why = null
    for (let i = 0; i < blockHist.length; i++) {
      const h = blockHist[i]
      if (!h.on) continue
      const a = Math.max(h.ts, from)
      const b = i + 1 < blockHist.length ? Math.min(blockHist[i + 1].ts, ts) : ts
      if (b <= a) continue
      ms += b - a
      if (why !== 'wrong-eye') why = h.state
    }
    return ms >= OCC_BLOCK_MS ? why : null
  }
  // Şu an harf gösterilmemeli / sayılan cevap alınmamalı mı?
  const occBlocksNow = (ts) => occBlockWhy(ts) != null
  // Son OCC_BLOCK_WIN_MS içinde örtme "wrong-eye" okundu mu (occBlockWhy ile aynı pencere ve geçmiş)?
  const wrongEyeWithin = (ts) =>
    blockHist.some((h, i) => h.state === 'wrong-eye' && (i + 1 === blockHist.length || blockHist[i + 1].ts > ts - OCC_BLOCK_WIN_MS))

  // Harf şu an neden açılamıyor? Test durmadı ve açık deneme yok; örtme engeli önce (E2 sırası), sonra sayılan bant.
  function holdAt(ts) {
    if (paused() || open) return null
    const occWhy = occBlockWhy(ts)
    if (occWhy) return occWhy
    if (phase !== 'counted' || !tracked) return null
    if (finite(mm)) return inCountBand(mm) ? null : distanceHint(mm)
    // Mesafe bir an ölçülemedi: bant dışı bekleyiş sürer (kısa kayıp bekleyişi sıfırlamasın; kayıp 300 ms sürerse
    // "Yüzünü kameraya göster" duraklaması başlar)
    return holdWhy === 'too-far' || holdWhy === 'too-close' ? holdWhy : null
  }
  // Bekleyiş süresi harf açılamadığı sürece sayılır; neden değişse de (ör. mesafe → örtme) baştan başlamaz: ekran yeni
  // nedeni hemen yazar, kart arada kaybolmaz.
  function noteHold(ts) {
    holdWhy = holdAt(ts)
    if (!holdWhy) holdSince = null
    else if (holdSince == null) holdSince = ts
  }

  // Ölçülen mesafenin nedeni: bekleme bandı dışında (ya da mesafe duraklamasında) düzelme bandına göre yön; değilse null
  function distCause() {
    if (!finite(mm) || !(distLatch || !inside(mm, bands(phase).hold))) return null
    const r = bands(phase).resume
    return mm < r[0] ? 'too-close' : mm > r[1] ? 'too-far' : null
  }

  // Şu an bozuk olan koşullar (neden seçimi için).
  // - Mesafe bir an ölçülemedi (REASON_SWITCH_MS'den kısa): son ölçülen mesafe bant dışındaysa onun yönü sürer (holdAt
  //   ile aynı ilke); kayıp sürerse ya da son ölçüm bantta idiyse "no-face". Örtmede tek kare "yüz yok" da öyle: son
  //   bozuk okuma (yanlış göz, örtme kalktı, kapalı) REASON_SWITCH_MS boyunca sürer; öncesi bozuk değilse "no-face".
  // - Örtme "uncovered" okunuyor ama pencerede "wrong-eye" da okunduysa "wrong-eye" (ikisi arasında gidip gelen okumada
  //   neden sabit kalır; harf yuvasındaki kartla aynı).
  function currentCauses(ts) {
    const out = []
    if (tracked) {
      if (finite(mm)) {
        const d = distCause()
        if (d) out.push(d)
      } else out.push(lastDist && ts - mmLostSince < REASON_SWITCH_MS ? lastDist : 'no-face')
    }
    const o = occ === 'no-face' && lastOccBad && ts - occLostSince < REASON_SWITCH_MS ? lastOccBad : occ
    if (occClass(o) === 'bad') out.push(o === 'uncovered' && wrongEyeWithin(ts) ? 'wrong-eye' : o)
    return out
  }

  // "no-face" nedeni için kaybın başı: mesafe ölçülemiyorsa mesafenin, örtme "yüz yok" okuyorsa örtmenin kayıp anı
  // (ikisi de varsa erken olanı); ikisi de yoksa Infinity.
  function lostSince() {
    return Math.min(tracked && !finite(mm) ? mmLostSince : Infinity, occOn && occ === 'no-face' ? occLostSince : Infinity)
  }
  function setLead(c, ts) {
    lead = c
    leadSince = ts
    leadGoneSince = null
    if (leadCand === c) leadCand = null
  }

  // Kartın nedenini izler (her değerlendirmede; duraklama yokken de). En öndeki neden E2 sırasıyla seçilir.
  // - Başka bir neden ancak REASON_SWITCH_MS kesintisiz en öndeyse eskisinin yerine geçer: tek karelik okuma kartı
  //   değiştirmez. Mesafe ya da örtme kaybından gelen "no-face" kaybın başından (neden o arada alındıysa alınışından)
  //   sayılır: kayıp REASON_SWITCH_MS sürünce kart hemen yüzü söyler.
  // - Gösterilen neden REASON_SWITCH_MS'dir bozuk koşullar arasında değilse (düzeldi) unutulur: kart düzelmiş bir koşulu
  //   yazmaz, sonraki duraklama eski bir nedenle açılmaz.
  // - Neden yokken tek kareden neden doğmaz: en uzun süredir kesintisiz süren koşul (eşitse E2 sırası) alınır; ama ancak
  //   hem en öndeyse hem REASON_SWITCH_MS'dir sürüyorsa (en öndeki başka bir koşul olgunlaşmak üzereyken alınırsa kart
  //   art arda iki kez değişirdi). Kart açılırken (opening) neden yoksa en uzun süredir süren koşul hemen alınır: kart bir
  //   şey yazmalı.
  // - Hiçbir koşul bozuk değilken son neden kalır (duraklamada süre dolmadı; kart son nedeni gösterir).
  function noteLead(ts, opening = false) {
    const causes = currentCauses(ts)
    for (const c of causes) if (!since.has(c)) since.set(c, ts)
    for (const c of [...since.keys()]) if (!causes.includes(c)) since.delete(c)
    if (lead != null) {
      if (causes.includes(lead)) leadGoneSince = null
      else if (leadGoneSince == null) leadGoneSince = ts
      else if (ts - leadGoneSince >= REASON_SWITCH_MS) {
        lead = null
        leadSince = null
        leadGoneSince = null
      }
    }
    const top = REASON_ORDER.find((r) => causes.includes(r)) ?? null
    if (top != null && top !== lead) {
      if (top !== leadCand) {
        leadCand = top
        const lost = top === 'no-face' ? lostSince() : Infinity
        leadCandSince = lost < Infinity ? Math.max(lost, leadSince ?? lost) : ts
      }
      if (ts - leadCandSince >= REASON_SWITCH_MS) return setLead(top, ts)
    } else leadCand = null
    if (lead != null) return
    let best = null
    for (const c of REASON_ORDER) if (since.has(c) && (best == null || since.get(c) < since.get(best))) best = c
    if (best == null) return
    if (opening || (best === top && ts - since.get(best) >= REASON_SWITCH_MS)) setLead(best, ts)
  }

  function enterPause(ts) {
    stats.pauses += 1
    pausedAt = ts
    if (open) {
      open = null
      stats.reshows.paused += 1
    }
  }

  function leavePause(ts) {
    if (pausedAt != null) stats.pausedMs += Math.max(0, ts - pausedAt)
    pausedAt = null
    reason = null
  }

  function evaluate(ts) {
    // Bir göz kapalı, hangisi bilinmiyor ('lid-ask'): testi durdurmaz (avuçla başlayıp kapağa geçen kişi) ama süresi
    // kayda yazılır; kayıttaki örtme yöntemi (ör. camera-depth) bu sürede doğrulanmamıştır (S8, dürüst kayıt).
    if (occOn && lastEvalOcc === 'lid-ask' && lastEvalTs != null && ts > lastEvalTs) stats.lidAskMs += ts - lastEvalTs
    lastEvalTs = ts
    lastEvalOcc = occ
    lastTs = ts
    const wasPaused = paused()

    // Mesafe zamanlayıcıları
    if (tracked) {
      const b = bands(phase)
      if (inside(mm, b.hold)) distBadSince = null
      else if (distBadSince == null) distBadSince = ts
      if (inside(mm, b.resume)) { if (distGoodSince == null) distGoodSince = ts } else distGoodSince = null
      if (!distLatch && distBadSince != null && ts - distBadSince >= DIST_PAUSE_MS) distLatch = true
      else if (distLatch && distGoodSince != null && ts - distGoodSince >= RESUME_MS) distLatch = false
    } else {
      distBadSince = null
      distGoodSince = null
      distLatch = false
    }
    // Kartın nedeni için: son ölçülen mesafenin nedeni ve mesafenin ne zamandır ölçülemediği; örtmenin son bozuk okuması
    // ve örtmede yüzün ne zamandır görülmediği
    if (finite(mm)) {
      mmLostSince = null
      lastDist = distCause()
    } else if (mmLostSince == null) mmLostSince = ts
    if (occ === 'no-face') {
      if (occLostSince == null) occLostSince = ts
    } else {
      occLostSince = null
      lastOccBad = occClass(occ) === 'bad' ? occ : null
    }

    // Örtme zamanlayıcıları
    const c = occClass(occ)
    if (c === 'bad') { if (occBadSince == null) occBadSince = ts; occGoodSince = null }
    else if (c === 'good') { if (occGoodSince == null) occGoodSince = ts; occBadSince = null }
    else { occBadSince = null; occGoodSince = null }
    noteBlock(ts)
    if (!occLatch && occBadSince != null && ts - occBadSince >= OCC_PAUSE_MS) occLatch = true
    else if (occLatch && occGoodSince != null && ts - occGoodSince >= RESUME_MS) occLatch = false

    const isPaused = paused()
    const pausedNow = !wasPaused && isPaused
    const resumed = wasPaused && !isPaused
    noteLead(ts, pausedNow)
    if (pausedNow) enterPause(ts)
    if (isPaused) reason = lead ?? reason
    if (resumed) leavePause(ts)
    noteHold(ts)
    return result({ pausedNow, resumed, ts })
  }

  // hold: harf neden açılamıyor (test durmadı; yoksa null), holdMs: ne zamandır, holdHint: HOLD_HINT_MS dolduysa neden
  function holdOf(ts) {
    const ms = holdWhy && finite(ts) ? Math.max(0, ts - holdSince) : 0
    return { hold: holdWhy, holdMs: ms, holdHint: holdWhy && ms >= HOLD_HINT_MS ? holdWhy : null }
  }

  function result({ pausedNow = false, resumed = false, ts = lastTs } = {}) {
    return {
      paused: paused(),
      reason: paused() ? reason : null,
      pausedNow,
      resumed,
      // Test sürdü: aynı hedef, güncel mesafede, yeni rastgele yönle yeniden gösterilir (freeze yeniden çağrılır)
      reshowNewDir: resumed,
      ...holdOf(ts),
    }
  }

  function status() {
    return { phase, paused: paused(), reason: paused() ? reason : null, open: open != null, distanceTracked: tracked, occlusion: occOn, hold: holdWhy }
  }

  // Dondurulmuş boyutun verilen mesafedeki logMAR'ı
  function realizedAt(distMm) {
    if (!open || !finite(distMm) || distMm <= 0) return null
    const heightMm = (open.unitPx * 5) / pxPerMm
    return logMARForHeight(heightMm, distMm)
  }

  function push({ ts, mm: m, occ: o } = {}) {
    if (!finite(ts)) throw new TypeError('trialGate.push: ts gerekli')
    if (m !== undefined) mm = finite(m) ? m : null
    if (o !== undefined) occ = occStateOf(o)
    return evaluate(ts)
  }

  return {
    // Yeni kare / zaman adımı. mm: sayı | null (yüz / mesafe yok) | undefined (değişmedi).
    // occ: örtme durumu (string ya da createOcclusionMonitor anlık görüntüsü {state}) | undefined (değişmedi).
    push,
    // Kare gelmese de zaman ilerlesin
    tick: (ts) => push({ ts }),
    // Alıştırma → sayılan geçişi. Mesafe zamanlayıcıları bu andan yeniden başlar.
    setPhase(p, ts) {
      if (!PHASES.has(p)) throw new TypeError(`trialGate: bilinmeyen evre ${p}`)
      if (!finite(ts)) throw new TypeError('trialGate.setPhase: ts gerekli')
      phase = p
      distBadSince = null
      distGoodSince = null
      return evaluate(ts)
    },
    // Harf göründüğü an: boyutu dondurur. unitPx = E'nin bir çizgi birimi (CSS px; yükseklik = 5 birim),
    // mm = o anki mesafe (kamerasızda yok sayılır). Duraklamadayken, deneme zaten açıkken ya da değer
    // geçersizse false döner ve hiçbir şey değişmez (harf gösterilmemeli / eski boyut kalır).
    // Sayılan evrede 360–440 mm dışındaysa (kamerayla) harf açılmaz (false) ama test durmaz: duraklamayı yalnız
    // 300 ms kuralı başlatır (S1). Ekran bu arada okları soluk, cm göstergesini bant dışı gösterir; bekleyiş
    // HOLD_HINT_MS sürerse nedeni harf yuvasında yazar (push sonucu: hold, holdHint).
    freeze(unitPx, m, ts) {
      if (paused() || open) return false
      if (!finite(unitPx) || unitPx <= 0) return false
      if (occBlocksNow(finite(ts) ? ts : lastTs)) return false
      const at = tracked ? m : referenceMm
      if (!finite(at) || at <= 0) return false
      if (phase === 'counted' && tracked && !inCountBand(at)) return false
      open = { unitPx, mm: at, ts: finite(ts) ? ts : null }
      holdWhy = null
      holdSince = null
      return true
    },
    // Çizilecek birim: deneme açıkken dondurulmuş değer; kapalıyken null (çağıran canlı değeri kullanır)
    unitPx() {
      return open ? open.unitPx : null
    },
    frozen() {
      return open ? { ...open } : null
    },
    // Cevap anı. m = cevap anındaki mesafe (kamerasızda yok sayılır).
    // Dönüş: { accepted, count, realizedLogMAR, reshowNewDir, reason, why, change, paused, occ }
    //   accepted: cevap alındı, sıradaki denemeye geçilir (count ise staircase'e realizedLogMAR ile verilir)
    //   reshowNewDir: aynı hedef yeni yönle yeniden gösterilir (accepted=false). Reddedilen cevap testi durdurmaz
    //     (duraklamayı yalnız 300 / 700 ms kuralları başlatır; S1).
    //   reason: null | 'paused' | 'no-trial' | 'no-distance' | 'out-of-band' | 'moved' | 'occlusion'
    //   why: sayılmayan cevabın ekrandaki nedeni (harf yuvasında kısa süre; lib/acuityFlow.js waitCard):
    //     'no-face' | 'too-far' | 'too-close' | 'moved' | 'wrong-eye' | 'uncovered'; sayıldıysa null
    //   change: |mm − donma mm| / donma mm (kamerasızda 0)
    //   occ: reason 'occlusion' ise engelleyen örtme durumu ('wrong-eye' | 'uncovered')
    answer(m, ts) {
      const now = finite(ts) ? ts : lastTs
      if (paused()) return { accepted: false, count: false, realizedLogMAR: null, reshowNewDir: false, reason: 'paused', why: null, change: null, paused: true }
      if (!open) return { accepted: false, count: false, realizedLogMAR: null, reshowNewDir: false, reason: 'no-trial', why: null, change: null, paused: false }
      // Cevaptaki mesafe en güncel ölçümdür
      if (tracked && m !== undefined) mm = finite(m) ? m : null
      const at = tracked ? (finite(m) && m > 0 ? m : null) : referenceMm
      const realizedLogMAR = at == null ? null : realizedAt(at)
      const change = at == null ? null : Math.abs(at - open.mm) / open.mm
      open = null
      if (phase !== 'counted') {
        return { accepted: true, count: false, realizedLogMAR, reshowNewDir: false, reason: null, why: null, change, paused: false }
      }
      // Cevap sayılmaz, aynı hedef yeni yönle yeniden gösterilir. Test durmaz: bant dışı / mesafesiz cevaptan sonra
      // yeni harf yalnız 360–440 mm'de açılır (freeze); duraklamayı 300 ms kuralı başlatır.
      const reject = (reason, bucket, why) => {
        stats.reshows[bucket] += 1
        return { accepted: false, count: false, realizedLogMAR, reshowNewDir: true, reason, why, change, paused: false, occ: reason === 'occlusion' ? why : null }
      }
      if (tracked) {
        if (at == null) return reject('no-distance', 'noDistance', 'no-face')
        if (!inCountBand(at)) return reject('out-of-band', 'band', distanceHint(at))
        if (change > MOVE_MAX_FRAC) return reject('moved', 'moved', 'moved')
      }
      // Örtme engeli (son 400 ms'nin en az 250 ms'i bozuk; 700 ms dolmadı): cevap sayılmaz, yeni yönle yeniden
      // gösterilir; test durmaz
      const occWhy = occBlockWhy(now)
      if (occWhy) return reject('occlusion', 'occlusion', occWhy)
      return { accepted: true, count: true, realizedLogMAR, reshowNewDir: false, reason: null, why: null, change, paused: false }
    },
    // Açık denemeyi cevapsız kapatır (göz değişimi, çıkış)
    cancel() {
      open = null
    },
    // "Kamerasız devam": mesafe ve örtme artık durdurmaz; harf 40 cm'ye göre çizilir. Açık deneme kapanır.
    continueWithoutCamera(ts) {
      if (!finite(ts)) throw new TypeError('trialGate.continueWithoutCamera: ts gerekli')
      const wasPaused = paused()
      tracked = false
      occOn = false
      distLatch = false
      occLatch = false
      distBadSince = distGoodSince = occBadSince = occGoodSince = null
      blockHist = []
      holdWhy = holdSince = null
      lead = leadSince = leadGoneSince = leadCand = leadCandSince = lastDist = mmLostSince = lastOccBad = occLostSince = null
      since.clear()
      open = null
      if (wasPaused) leavePause(ts)
      return { paused: false, reason: null, pausedNow: false, resumed: wasPaused, reshowNewDir: true, hold: null, holdMs: 0, holdHint: null }
    },
    status,
    // Kayıt için: duraklama sayısı, toplam süre (ms), 'lid-ask' süresi (ms), yeniden gösterim nedenleri
    stats(ts) {
      const live = paused() && pausedAt != null && finite(ts) ? Math.max(0, ts - pausedAt) : 0
      return { pauses: stats.pauses, pausedMs: Math.round(stats.pausedMs + live), lidAskMs: Math.round(stats.lidAskMs), reshows: { ...stats.reshows } }
    },
  }
}
