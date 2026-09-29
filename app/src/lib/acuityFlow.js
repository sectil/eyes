// Yakın E testi ekranının (screens/AcuityTest.jsx) saf yardımcıları: göz sırası, çıkış sayfası (E10), duraklama
// kartı (E6), göz sonucu satırları (E7/E9), gözlük sayfası kararı (E3), kayıt biçimi ve sesli yönlendirmenin
// zamanlaması (S13). Saat okumaz, kayıt yazmaz, ses çalmaz: ekran bunları çağırır.
// Kaynak: PLAN.md bölüm 4 (E1–E10) ve kararlar S1–S13; onaylı tasarım nefona-e-testi.html.
import { EYE_TITLE } from './today.js'
import { WEAR_OPTIONS } from './acuityReadiness.js'
import { PHRASES, VOICE_LANG } from './voicePack.js'
import { sameCondition, DISTANCE_ASSUMED_NOTE } from './trend.js'
import { occlusionMessage } from './occlusion.js'
import { formatLogMAR } from './optotype.js'
import { bandCm, distanceHint } from './trialGate.js'

// Kayıt biçimi sürümü (karar S6): sürekli harf boyutu (H1), deneme içinde boyut dondurma (H2), sayılan harfler
// yalnız 36–44 cm'de (H3, S1). lib/trend.js methodEra bununla yeni seri başlatır.
export const ALGORITHM = 'descent-zest-v4'

// Kısa test (plan 'daily'): iki tek göz; haftalık: sağ, sol, iki göz
export const EYE_ORDER = { daily: ['R', 'L'], weekly: ['R', 'L', 'OU'] }
export const eyesFor = (plan) => (plan === 'weekly' ? EYE_ORDER.weekly : EYE_ORDER.daily)

// Yarım günde test ilk eksik gözden başlar (E0, S3). Hepsi atlanmışsa (olmamalı) baştan.
export function startIndex(eyes, skipEyes = []) {
  const skip = new Set(skipEyes ?? [])
  const i = eyes.findIndex((e) => !skip.has(e))
  return i < 0 ? 0 : i
}

// Sıradaki göz: current'tan sonraki, bugün kaydedilmemiş (done: atlanan + bu koşuda biten) ilk göz; yoksa −1 (özet).
// Atlanan gözler baştan ardışık olmayabilir (ör. gece yarısını geçen koşu: yalnız 'L' bugün kayıtlı).
export function nextEyeIndex(eyes, current, done = []) {
  const skip = new Set(done ?? [])
  for (let i = current + 1; i < eyes.length; i++) if (!skip.has(eyes[i])) return i
  return -1
}

// Hazırlık alt satırı ve sesli cümlesi aynı metin (ekrandaki cümle = ses dosyasındaki cümle)
export const COVER_PHRASE = { R: 'acuCoverL', L: 'acuCoverR', OU: 'acuBoth' }
export const phraseText = (id) => PHRASES[VOICE_LANG]?.[id] ?? ''
export const setupSubtitle = (eye) => phraseText(COVER_PHRASE[eye] ?? COVER_PHRASE.R)

// Gözlük seçimi → ekrandaki ad. Eski kayıt ('glasses', Build ≤18): "Gözlüklü".
const WEAR_TEXT = Object.fromEntries(WEAR_OPTIONS.map((w) => [w.id, w.text]))
export function wearLabel(id) {
  if (id === 'glasses') return 'Gözlüklü'
  return WEAR_TEXT[id] ?? null
}

// E3 · gözlük alt sayfası: satıra dokununca ne olur?
//   ask: gözlük/lens geçen seferkiyle aynı koşulsa numara sorusu ("Numaran geçen testten beri değişti mi?")
//   note: geçen seferden farklı koşulsa kapanmadan önce 1 satır ("Geçen sefer: … Bu seçim yeni seri başlatır.")
//   closeMs: sayfanın kendiliğinden kapanma süresi (soru varsa null: cevapla kapanır)
// Aynı koşul lib/trend.js sameCondition ile: eski 'glasses' kaydı gözlük türleriyle aynı seri sayılır.
export const PICK_CLOSE_MS = 250
export const NOTE_CLOSE_MS = 1600
export function glassesOutcome({ choice, last = null }) {
  if (!WEAR_TEXT[choice]) return { ask: false, note: null, closeMs: PICK_CLOSE_MS }
  const known = last != null && (WEAR_TEXT[last] || last === 'glasses')
  const same = known && sameCondition(choice, last)
  const ask = same && choice !== 'none'
  const note = known && !same ? `Geçen sefer: ${wearLabel(last)}. Bu seçim yeni seri başlatır.` : null
  return { ask, note, closeMs: ask ? null : note ? NOTE_CLOSE_MS : PICK_CLOSE_MS }
}

// E10 · çıkış sayfası. saved: bu koşuda kaydedilen gözler (onSaveEye), started: bu gözün denemesi başladı mı.
//   direct: kaybolacak veri yoksa (biten göz yok, deneme başlamadı) sayfa açılmadan çıkılır.
//   todayHolds: kalan gözler Bugün kartında görünür mü (lib/acuityStart.js). Kısa E testi Bugün'ün yolunda yok
//   (modules/daily/manifest.js, karar 2026-09-29); onda "Kalanlar Bugün'de bekler." yazılmaz.
// "Çık" biten gözleri silmez; yalnız yarım kalan göz atılır.
// Kaydedilen: "Sağ göz kaydedildi." · "Sol göz kaydedildi." · "Sağ ve sol göz kaydedildi." · "İki göz ölçümü
// kaydedildi." · iki göz ölçümüyle birlikte tek göz de varsa "2 ölçüm kaydedildi."
const SAVED_SIDE = { R: 'sağ', L: 'sol' }
const cap = (s) => (s ? s[0].toLocaleUpperCase('tr-TR') + s.slice(1) : s)
function savedText(saved) {
  if (saved.every((e) => SAVED_SIDE[e])) return `${cap(saved.map((e) => SAVED_SIDE[e]).join(' ve '))} göz kaydedildi.`
  if (saved.length === 1 && saved[0] === 'OU') return 'İki göz ölçümü kaydedildi.'
  return `${saved.length} ölçüm kaydedildi.`
}
export function exitSheet({ saved = [], started = false, todayHolds = true } = {}) {
  const title = 'Testten çıkılsın mı?'
  if (!saved.length) {
    return { direct: !started, title, body: 'Bu gözün yarım ölçümü kaydedilmez.' }
  }
  const what = savedText(saved)
  return { direct: false, title, body: todayHolds ? `${what} Kalanlar Bugün'de bekler.` : what }
}

// E6 · duraklama kartı. reason: lib/trialGate.js duraklama nedeni. camStopped: kamera test ortasında durdu.
//   offerNoCamera: yüz uzun süredir görünmüyor (NO_FACE_OFFER_MS); kamera hata vermeden durmuş olabilir (web yolu,
//   donmuş akış): "Yüzünü kameraya göster" kartında da "Kamerasız devam" çıkar, kişi takılı kalmaz.
//   icon: 'face' | 'cover' | 'open' | 'distance' | 'camera'; action: 'no-camera' → "Kamerasız devam"
// Alt satır sesli cümlenin aynısı (acuPaused; ekrandaki cümle = sesli cümle).
export const PAUSE_SUB = phraseText('acuPaused')
export const NO_FACE_OFFER_MS = 5000
export function pauseCard({ reason = null, need = 'L', camStopped = false, offerNoCamera = false } = {}) {
  if (camStopped) return { icon: 'camera', text: 'Kamera durdu', sub: PAUSE_SUB, action: 'no-camera' }
  switch (reason) {
    case 'too-far': return { icon: 'distance', text: 'Biraz yaklaştır · 40 cm', sub: PAUSE_SUB, action: null }
    case 'too-close': return { icon: 'distance', text: 'Biraz uzaklaştır · 40 cm', sub: PAUSE_SUB, action: null }
    case 'wrong-eye':
    case 'uncovered':
      return { icon: 'cover', text: occlusionMessage(reason, need), sub: PAUSE_SUB, action: null }
    case 'closed': return { icon: 'open', text: 'İki gözünü de aç', sub: PAUSE_SUB, action: null }
    default: return { icon: 'face', text: 'Yüzünü kameraya göster', sub: PAUSE_SUB, action: offerNoCamera ? 'no-camera' : null }
  }
}

// Örtme yüzünden sayılmayan cevabın ya da açılamayan harfin nedeni: duraklama kartındaki emrin aynısı ("Sol gözünü
// avucunla ört", "Yanlış göz · solu ört"). Test durmadığı için "Test durdu" alt satırı yok; ses de yok.
export function coverHint(occState, need) {
  if (occState !== 'wrong-eye' && occState !== 'uncovered') return null
  return { icon: 'cover', text: occlusionMessage(occState, need), sub: null, action: null }
}

// Harf yuvasındaki neden kartı (test sürerken; duraklama kartı değil). why: lib/trialGate.js answer().why (sayılmayan
// cevap; kart en az REJECT_HINT_MS kalır, o arada yeni harf gelmez) ya da hold / holdHint (harf açılamıyor; kart neden
// sürdükçe kalır). Metin duraklama kartındaki emrin aynısıdır; "Test durdu" alt satırı ve ses yok (yeni sesli cümle
// eklenmez). Yalnız 'moved' (harf açıkken mesafe %5'ten çok değişti) duraklama kartında yok: "Telefonu sabit tut".
export const REJECT_HINT_MS = 1200
export const MOVED_TEXT = 'Telefonu sabit tut'
export function waitCard(why, need) {
  switch (why) {
    case 'too-far':
    case 'too-close':
    case 'no-face':
      return { ...pauseCard({ reason: why, need }), sub: null, action: null }
    case 'wrong-eye':
    case 'uncovered':
      return coverHint(why, need)
    case 'moved': return { icon: 'distance', text: MOVED_TEXT, sub: null, action: null }
    default: return null
  }
}

// Deneme (ve nasıl yapılır) ekranındaki canlı cm hapı. Sayı lib/trialGate.js bandCm: bant (36–44 cm, S1) dışındayken
// bandın dışındaki en yakın tam sayı, "44 cm" yazıp sarı görünmez. out: bant dışı ya da mesafe yok (sarı, ↔).
// label: VoiceOver adı; bant dışındayken ne yapılacağını da söyler (satırdaki "Biraz yaklaştır" ile aynı söz).
export function distancePill(mm) {
  const cm = bandCm(mm)
  if (cm == null) return { text: '— cm', label: 'Mesafe ölçülemiyor', out: true }
  const side = distanceHint(mm)
  const todo = side === 'too-far' ? ', biraz yaklaştır' : side === 'too-close' ? ', biraz uzaklaştır' : ''
  return { text: `${cm} cm`, label: `${cm} santimetre${todo}`, out: side != null }
}

// "Kamerasız devam" (kamera test ortasında durdu): gözün kalanında örtmeyi kamera izlemez. Kayıttaki yöntem kameranın
// doğruladığını söylememeli (S8): camera-depth / camera-lid+self → self-report (seri için; E7 "Örtme: kamera durdu,
// doğrulanmadı", resultFacts); kişinin onayıyla başlamış (camera-self, self-report) ve iki göz ('none') değişmez.
// Kapıdaki yöntem gateMethod olarak kalır.
export function methodAfterCameraStop(method) {
  return method === 'camera-depth' || method === 'camera-lid+self' ? 'self-report' : method
}

// Deneme üst çubuğundaki kalan harf yazısı (staircase.js remainingDisplay çıktısı; ısınmada tahmini toplam)
export function remainingLabel(rd) {
  if (!rd) return ''
  if (rd.kind === 'last') return rd.count <= 1 ? 'son harf' : 'son harfler'
  if (rd.kind === 'few') return 'az kaldı'
  return `~${rd.count} harf kaldı`
}

// E7 · örtme yönteminin dürüst metni (S8). İki göz testinde (method 'none') örtme satırı yok: "Tek göz" yazılmaz.
export function coverMethodText(method) {
  switch (method) {
    case 'camera-depth': return 'Örtme: kamera doğruladı'
    case 'camera-lid+self': return 'Örtme: kamera + senin onayın'
    case 'camera-self':
    case 'self-report':
      return 'Örtme: senin onayın'
    default: return null
  }
}

// Kamera test ortasında durdu, kapıdaki örtme kameranın doğrulamasıydı (kayıtta method self-report, gateMethod
// camera-depth / camera-lid+self): gözün kalanında örtmeyi ne kamera izledi ne kişi onayladı. "Senin onayın" denmez.
export const COVER_UNVERIFIED_TEXT = 'Örtme: kamera durdu, doğrulanmadı'
function coverFact(rec) {
  const o = rec?.occlusion
  if (rec?.camFailedMidTest && o?.gateMethod && o.gateMethod !== o.method) return COVER_UNVERIFIED_TEXT
  return coverMethodText(o?.method)
}

// E7 koşul ve yöntem satırları: ["Okuma gözlüğü · ort. 40 cm", "Örtme: …", "Mesafe ölçülmedi · 40 cm varsayıldı"]
export function resultFacts(rec) {
  const wear = wearLabel(rec?.correction) ?? 'Gözlük seçilmedi'
  const cm = Number.isFinite(rec?.meanDistanceMm) && rec.distanceTracked !== false ? Math.round(rec.meanDistanceMm / 10) : null
  const out = [cm != null ? `${wear} · ort. ${cm} cm` : wear]
  const cover = coverFact(rec)
  if (cover) out.push(cover)
  if (rec?.distanceTracked === false) out.push(DISTANCE_ASSUMED_NOTE)
  return out
}

// Büyük sayı: tabana değdiyse "≤", tavana değdiyse "≥" (E7 taban durumu)
export function valueText(rec) {
  const pre = rec?.outOfRange === 'floor' ? '≤' : rec?.outOfRange === 'ceiling' ? '≥' : ''
  return `${pre}${formatLogMAR(rec?.logMAR ?? 0)}`
}
export function rangeNote(rec) {
  if (rec?.outOfRange === 'floor') return 'Ekranın gösterebildiği en küçük harf'
  if (rec?.outOfRange === 'ceiling') return 'Ekranın gösterebildiği en büyük harf'
  return null
}

// Cetvel: solda −0,3 (küçük harf, iyi) → sağda 1,0 (büyük harf); %4–96 arası
export const RULER_TICKS = [-0.2, 0, 0.3, 1.0]
export const rulerLabel = (t) => formatLogMAR(t).replace(/(\d,\d)0$/, '$1') // "−0,2" · "0,0" · "0,3" · "1,0"
export function rulerPos(v) {
  const x = Math.min(1.0, Math.max(-0.3, Number.isFinite(v) ? v : 0))
  return 4 + ((x + 0.3) / 1.3) * 92
}

export const summaryTitle = (plan) => (plan === 'weekly' ? 'Haftalık test bitti' : 'Kısa test bitti')
// E9 özetinde bu koşudan önce kaydedilmiş (atlanan) göz. "Bugün" denmez: gece yarısını geçen koşuda o göz koşu
// gününde, yani dünkü tarihte kaydedilmiş olabilir.
export const SKIPPED_TEXT = 'Daha önce kaydedildi'

// E8 · mola önizleme satırı: "Sol göz · sağ gözünü ört". İki göz: sıradaki hazırlık ekranının emriyle aynı söz
// ("İki göz · iki gözünü de açık tut"; acuityReadiness BOTH_OPEN, sesli cümle acuBoth)
const NEXT_ACTION = { R: 'sol gözünü ört', L: 'sağ gözünü ört', OU: 'iki gözünü de açık tut' }
export function restNext(eye) {
  if (!EYE_TITLE[eye]) return null
  return { eye, text: `${EYE_TITLE[eye]} · ${NEXT_ACTION[eye]}` }
}

// Üst çubuktaki göz ilerlemesi: her göz için 'done' | 'on' | ''
export function progressSegments(eyes, current, doneEyes = []) {
  const done = new Set(doneEyes)
  return eyes.map((e, i) => (done.has(e) && i !== current ? 'done' : i === current ? 'on' : ''))
}

// Kapının açıldığı andaki ham örtme değerleri (kayda; eşik ayarı için, S8). Kamera izlemiyorsa null.
const r2 = (v) => (Number.isFinite(v) ? Math.round(v * 100) / 100 : null)
const r0 = (v) => (Number.isFinite(v) ? Math.round(v) : null)
export function atGateOf(snap) {
  if (!snap) return null
  return { l: r2(snap.l), r: r2(snap.r), dl: r0(snap.dl), dr: r0(snap.dr), state: snap.state ?? null }
}

// Ham kapak / derinlik satırları yalnız geliştirici derlemesinde (scripts/device-run.sh VITE_APP_BUILD=dev).
// import.meta.env.DEV kullanılmaz: cihaz derlemesi de "vite build" ile yapılır.
const raw = (v) => (Number.isFinite(v) ? v.toFixed(2).replace('.', ',') : '—')
const mm = (v) => (Number.isFinite(v) ? `${Math.round(v)} mm` : '—')
export function rawLines(snap, build) {
  if (build !== 'dev') return []
  return [
    `kapak · sağ ${raw(snap?.r)} · sol ${raw(snap?.l)} (0 açık, 1 kapalı)`,
    `derinlik · sağ ${mm(snap?.dr)} · sol ${mm(snap?.dl)} (avuç tarafı yakın)`,
  ]
}

// Bir gözün kaydı (S4: göz bittiği an kaydedilir). Alanlar eski kayıtla uyumlu; yeni: cantSee (Göremiyorum sayısı),
// brightness (Başla'da okunan eski parlaklık, S7), occlusion.method (S8) ve occlusion.atGate, pauses (trialGate),
// camFailedMidTest. Kamera test ortasında durduysa kayıt kamerasız seriye girer (distanceTracked:false, S5).
// seconds: bu gözün gerçek süresi (hazırlığın açılışından göz bitene; mola hariç). Gelişim ve CSV süreyi bundan
// alır (lib/stats.js); yoksa tüm testin tahmini süresi her parçaya yazılırdı (S4 ile gözler ayrı kaydedilir).
// runDay: koşu günü ('YYYY-MM-DD'; koşunun başladığı yerel gün). Haftalık tamamlama, atlanacak gözler ve Bugün kartı
// gözleri bu güne göre gruplar (lib/today.js runDayOf); kayıt tarihi (date) depoya yazılış anıdır.
export function buildEyeRecord({
  plan,
  eye,
  est,
  fin,
  correction,
  changed = false,
  run,
  gateStats = null,
  brightness = null,
  trialsMax,
  device = null,
  seconds = null,
  runDay = null,
}) {
  const samples = run?.samples ?? []
  const tracked = Boolean(run?.tracked) && !run?.camFailedMidTest && samples.length > 0
  const meanMm = samples.length ? samples.reduce((a, b) => a + b, 0) / samples.length : null
  const rec = {
    type: plan === 'weekly' ? 'va-weekly' : 'va-daily',
    eye,
    logMAR: +fin.logMAR.toFixed(3),
    correction: correction ?? null,
    ...(changed && correction && correction !== 'none' ? { newBaseline: true } : {}),
    sd: +est.sd.toFixed(3),
    trials: est.trials,
    descentTrials: est.descentTrials,
    fineTrials: est.fineTrials,
    algorithm: ALGORITHM,
    outOfRange: fin.outOfRange,
    distanceTracked: tracked,
    occlusion: { method: run?.method ?? null, atGate: run?.atGate ?? null, ...(run?.gateMethod && run.gateMethod !== run.method ? { gateMethod: run.gateMethod } : {}) },
    cantSee: run?.cantSee ?? 0,
    brightness: { from: Number.isFinite(brightness?.from) ? Math.round(brightness.from * 1000) / 1000 : null, forced: Boolean(brightness?.forced) },
    trialsMax,
    meanDistanceMm: tracked && meanMm != null ? Math.round(meanMm) : null,
  }
  if (gateStats) rec.pauses = { count: gateStats.pauses, ms: gateStats.pausedMs, lidAskMs: gateStats.lidAskMs ?? 0, reshows: gateStats.reshows }
  if (run?.camFailedMidTest) rec.camFailedMidTest = true
  if (device) rec.device = device
  if (Number.isFinite(seconds) && seconds > 0) rec.seconds = Math.round(seconds)
  if (typeof runDay === 'string' && runDay) rec.runDay = runDay
  return rec
}

// ——— Sesli yönlendirme (S13) ———
// Yalnız hazırlıkta, duraklamada ve gözler arasında; harf gösterilirken hiç konuşulmaz (ekran denetler).
// Kural (sahibin): söylenen cümle, söylendiği anda ekranda aynen yazılıdır (sondaki nokta hariç):
//   örtme cümleleri ve acuBoth → hazırlık alt satırı · acuWrong → örtme satırı · acuCloser / acuFarther → mesafe
//   satırı · acuFace → ana düğme · acuPaused → duraklama kartının alt satırı · REST_PHRASE → mola başlığı.
// Hazırlıkta düğmenin ilk eksiği → cümle. Gözlük, ters renk, tutma ve kapak onayı sessizdir (ekranda yapılır).
// "Başla" hazırken konuşulmaz: ekranda karşılığı yok ve ilk harfi cümle bitene dek bekletiyordu.
export const REST_PHRASE = 'exFarShort'
export const REST_TITLE = phraseText(REST_PHRASE).replace(/\.$/, '') // "Uzağa bak"
export function setupPhraseId(button, eye) {
  if (!button || button.ready) return null
  switch (button.reason) {
    case 'face': return 'acuFace'
    case 'wrong-eye': return 'acuWrong'
    case 'too-far': return 'acuCloser'
    case 'too-close': return 'acuFarther'
    case 'open': return 'acuBoth'
    case 'cover':
    case 'self':
      return COVER_PHRASE[eye] ?? null
    default: return null
  }
}

// Cümlelerin en uzun süresi (ms): iki sesin (public/voice/tr/{female,male}) uzun olanı, 10 ms'ye yukarı yuvarlanmış.
// Ölçü: dosyanın bütün ses çerçeveleri (1152 örnek / çerçeve; kodlayıcının baştaki gecikmesi ve sondaki dolgusu dahil),
// yani hangi çözücü çalarsa çalsın sesin uzayabileceği en uzun süre. acuityFlow.test.js bu tabloyu dosyalardan yeniden
// ölçer; ses yeniden üretilirse tablo da güncellenmeli. Harf bu süre + pay dolmadan gösterilmez, sonraki cümle başlamaz.
export const PHRASE_MS = {
  acuCoverL: 3060, acuCoverR: 3370, acuBoth: 1490, acuWrong: 3060, acuCloser: 1260, acuFarther: 1280,
  acuFace: 1620, acuPaused: 2640, exFarShort: 1080,
}
export const PHRASE_MARGIN_MS = 400
export const phraseMs = (id) => (PHRASE_MS[id] ?? 3000) + PHRASE_MARGIN_MS

// Zorla söylenen cümlenin önceliği: duraklama > hazırlık (örtme, mesafe, yüz) > mola. voicePack playPhrase yeni cümleye
// geçerken çalanı durdurur; bu yüzden hangi cümlenin kesebileceği burada belirlenir.
export const PHRASE_PRIORITY = {
  acuPaused: 3,
  acuCoverL: 2, acuCoverR: 2, acuBoth: 2, acuWrong: 2, acuCloser: 2, acuFarther: 2, acuFace: 2,
  exFarShort: 1,
}
const priorityOf = (id) => PHRASE_PRIORITY[id] ?? 0

// Hazırlık koçu: aynı durum settleMs sürmeden konuşmaz (mesafe titremesi), iki cümle arasında en az minGapMs,
// aynı cümleyi arka arkaya tekrarlamaz (başka bir şey söylenene dek) ve çalan cümle bitmeden (phraseMs: en uzun ses +
// pay) yeni cümleye geçmez: hazırlık cümlesi başka bir cümleyi yarıda kesmez.
//   next(id, ts): hazırlıkta her adımda; söylenecekse id, değilse null
//   force(id, ts): zorla söylenecek cümle (duraklama, göz başı, mola). Çalan cümle bitmediyse yalnız farklı ve daha
//     düşük öncelikliyse keser; değilse söylenmez (false; aynı cümle baştan başlamaz)
//   busyUntil(): çalan cümlenin bitiş anı · reset(): göz değişimi (çalan cümle kesilmediği için bitişi unutulmaz)
export function createVoiceCoach({ settleMs = 900, minGapMs = 2500 } = {}) {
  let cand = null
  let candSince = 0
  let lastId = null
  let lastAt = -Infinity
  let playing = null
  let until = -Infinity
  const start = (id, ts) => {
    lastId = id
    lastAt = ts
    playing = id
    until = ts + phraseMs(id)
  }
  return {
    next(id, ts) {
      if (id !== cand) {
        cand = id
        candSince = ts
      }
      if (!id || ts - candSince < settleMs || ts - lastAt < minGapMs || ts < until || id === lastId) return null
      start(id, ts)
      return id
    },
    force(id, ts) {
      if (!id) return false
      if (ts < until && (id === playing || priorityOf(playing) >= priorityOf(id))) return false
      start(id, ts)
      return true
    },
    busyUntil: () => until,
    reset() {
      cand = null
      candSince = 0
      lastId = null
      lastAt = -Infinity
    },
  }
}
