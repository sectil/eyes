// iPhone uygulamasına özel yetenekler (Capacitor). Web'de bu fonksiyonlar "yok" döner.
// FaceDistance: ios/App/App/FaceDistancePlugin.swift (TrueDepth + ARKit; görme testi için ekran parlaklığı ve ters renk)
// Feedback: ios/App/App/FeedbackPlugin.swift (titreşim + ses modu); tercihler src/lib/prefs.js

import { Capacitor, registerPlugin } from '@capacitor/core'
import { getPrefs, subscribePrefs } from './prefs.js'

export const FaceDistance = registerPlugin('FaceDistance')

export const isIOSApp = () => {
  try {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios'
  } catch {
    return false
  }
}

export async function getDeviceModel() {
  if (!isIOSApp()) return null
  const { Device } = await import('@capacitor/device')
  const info = await Device.getInfo()
  return info.model ?? null // örn. "iPhone14,2"
}

export async function getScreenInfo() {
  if (!isIOSApp()) return null
  return FaceDistance.getScreenInfo()
}

export async function trueDepthSupported() {
  if (!isIOSApp()) return false
  try {
    const { supported } = await FaceDistance.isSupported()
    return Boolean(supported)
  } catch {
    return false
  }
}

// Yüz takibini başlatır; onFace({ tracked, distanceMm, blinkLeft, blinkRight, gazeLeftX/Y, gazeRightX/Y, camLeftX/Y, camRightX/Y, headX/Y, … }) ~30 Hz.
// onDepth (isteğe bağlı): ~10 Hz { eyesKnown, leftMm, rightMm, eyeAgeMs, … } — iki göz bölgesinin derinliği
// (FaceDistancePlugin.swift "depth" olayı; görme testinde tek göz kontrolü ve yüz kaybolunca mesafe).
// Döner: durdurma fonksiyonu.
export async function startTrueDepth(onFace, { onDepth } = {}) {
  const handles = [await FaceDistance.addListener('face', onFace)]
  try {
    if (onDepth) handles.push(await FaceDistance.addListener('depth', onDepth))
    await FaceDistance.start(onDepth ? { depth: true } : {})
  } catch (e) {
    // start reddedilirse (izin yok / 'cancelled') dinleyiciler sızmasın.
    await Promise.all(handles.map((h) => h.remove().catch(() => {})))
    throw e
  }
  return async () => {
    try {
      await FaceDistance.stop()
    } finally {
      await Promise.all(handles.map((h) => h.remove()))
    }
  }
}

// --- Ekran parlaklığı ve renkleri ters çevirme (görme testi S7, S12; FaceDistancePlugin.swift) ---
// Web'de ve eski iOS derlemesinde (metot yok → Capacitor UNIMPLEMENTED ile reddeder) hiçbir şey yapmaz, null döner.
// Oturum mantığı src/lib/brightnessSession.js, algılama src/lib/invertedColors.js.
const clamp01 = (x) => Math.min(1, Math.max(0, x))

// Döner: 0–1 ya da null (web / hata).
export async function getScreenBrightness() {
  if (!isIOSApp()) return null
  try {
    const r = await FaceDistance.getBrightness()
    const v = Number(r?.brightness)
    return Number.isFinite(v) ? v : null
  } catch {
    return null
  }
}

// value: 0–1 (sıkıştırılır). restoreOnLeave (0–1): uygulama etkinliğini yitirince (Denetim Merkezi, arama,
// uygulama değiştirme) native taraf ekranı bu değere döndürür; verilmezse bu koruma kalkar.
// Döner: native'in okuduğu değer ya da null (web / hata / geçersiz değer).
export async function setScreenBrightness(value, { restoreOnLeave } = {}) {
  if (!isIOSApp() || !Number.isFinite(value)) return null
  const opts = { brightness: clamp01(value) }
  if (Number.isFinite(restoreOnLeave)) opts.restoreOnLeave = clamp01(restoreOnLeave)
  try {
    const r = await FaceDistance.setBrightness(opts)
    const v = Number(r?.brightness)
    return Number.isFinite(v) ? v : opts.brightness
  } catch {
    return null
  }
}

// Native olay dinleyicisi; dinleyici eklenmeden durdurulursa eklenince hemen kaldırılır. Döner: durdurma fonksiyonu.
function listenNative(eventName, onEvent) {
  if (!isIOSApp()) return () => {}
  let handle = null
  let stopped = false
  const drop = (h) => {
    try {
      Promise.resolve(h?.remove?.()).catch(() => {})
    } catch {
      // yoksay
    }
  }
  Promise.resolve()
    .then(() =>
      FaceDistance.addListener(eventName, (e) => {
        if (!stopped) onEvent(e)
      }),
    )
    .then((h) => {
      if (stopped) drop(h)
      else handle = h
    })
    .catch(() => {})
  return () => {
    stopped = true
    if (handle) drop(handle)
    handle = null
  }
}

// "brightness" olayı: { reason: 'restored', brightness } (etkinlik kaybında native geri yükledi) ya da
// { reason: 'active' } (uygulama yeniden etkin). Döner: durdurma fonksiyonu (web'de boş).
export function watchScreenBrightness(onEvent) {
  return listenNative('brightness', onEvent)
}

// iPhone erişilebilirlik ayarı (UIAccessibility.isInvertColorsEnabled). Döner: true / false / null (web / hata).
// VARSAYIM (doğrulanmadı): yalnız Akıllı Ters Çevir'i bildiriyor olabilir (FaceDistancePlugin.swift notu).
export async function nativeInvertColors() {
  if (!isIOSApp()) return null
  try {
    const r = await FaceDistance.isInvertColorsEnabled()
    return typeof r?.enabled === 'boolean' ? r.enabled : null
  } catch {
    return null
  }
}

// Ayar değişince onChange(enabled). Döner: durdurma fonksiyonu (web'de boş).
export function watchNativeInvertColors(onChange) {
  return listenNative('invertColors', (e) => onChange(e?.enabled === true))
}

// --- Konuşma tanıma (ios/App/App/SpeechPlugin.swift) ---
export const Speech = registerPlugin('Speech')

export async function speechAvailable(locale = 'tr-TR') {
  if (!isIOSApp()) return { available: false, onDevice: false }
  try {
    return await Speech.isAvailable({ locale })
  } catch {
    return { available: false, onDevice: false }
  }
}

export async function requestSpeechPermission() {
  if (!isIOSApp()) return false
  try {
    const { granted } = await Speech.requestPermission()
    return Boolean(granted)
  } catch {
    return false
  }
}

// Dinlemeyi başlatır; onResult({ text, isFinal, segments:[{text,t,d}], error? }).
// Döner: durdurma fonksiyonu.
export async function startSpeech(onResult, { locale = 'tr-TR', onDevice = true } = {}) {
  const handle = await Speech.addListener('speech', onResult)
  try {
    await Speech.start({ locale, onDevice })
  } catch (e) {
    await handle.remove()
    throw e
  }
  return async () => {
    try {
      await Speech.stop()
    } finally {
      await handle.remove()
    }
  }
}

// --- Geri bildirim: titreşim + ses modu (ios/App/App/FeedbackPlugin.swift) ---
// haptic({ kind }) → Promise<void>; setAudioMode({ playback }); isHapticsSupported() → { supported }
export const Feedback = registerPlugin('Feedback')

const HAPTIC_KINDS = ['tick', 'hit', 'success', 'warning', 'error']
const normKind = (kind) => (HAPTIC_KINDS.includes(kind) ? kind : 'tick')

// Eski bir iOS derlemesinde eklenti yoksa Capacitor UNIMPLEMENTED ile reddeder; bir kez görünce
// her dokunuşta köprüye boşuna gitmeyelim.
let feedbackMissing = false
const isUnimplemented = (e) => e?.code === 'UNIMPLEMENTED'

async function feedbackHaptic(kind) {
  if (!isIOSApp() || feedbackMissing) return false
  try {
    await Feedback.haptic({ kind })
    return true
  } catch (e) {
    if (isUnimplemented(e)) feedbackMissing = true
    return false
  }
}

// Yedek 1: @capacitor/haptics (UIKit üreteçleri — iOS'ta "Sistem Dokunuşları" açık olmalı)
let hapticsPromise = null
async function haptics() {
  if (!isIOSApp()) return null
  if (!hapticsPromise) hapticsPromise = import('@capacitor/haptics').catch(() => null)
  return hapticsPromise
}

async function capacitorHaptic(kind) {
  const h = await haptics()
  if (!h) return false
  const { Haptics, ImpactStyle, NotificationType } = h
  try {
    if (kind === 'tick') await Haptics.impact({ style: ImpactStyle.Light })
    else if (kind === 'hit') await Haptics.impact({ style: ImpactStyle.Medium })
    else if (kind === 'success') await Haptics.notification({ type: NotificationType.Success })
    else if (kind === 'warning') await Haptics.notification({ type: NotificationType.Warning })
    else await Haptics.notification({ type: NotificationType.Error })
    return true
  } catch {
    return false
  }
}

// Yedek 2: tarayıcı Titreşim API'si (Android Chrome vb.; iOS Safari desteklemez).
// navigator.vibrate false dönerse (ör. kullanıcı etkileşimi yok) başarısız sayılır.
function webVibrate(kind) {
  try {
    if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return false
    const pattern = { tick: [20], hit: [40], success: [40, 60, 40], warning: [80], error: [80, 60, 80] }[kind]
    return navigator.vibrate(pattern) !== false
  } catch {
    return false
  }
}

// Sırayla dener; çalan yolu döndürür: 'native' | 'haptics' | 'vibrate' | null
async function playHaptic(kind) {
  if (await feedbackHaptic(kind)) return 'native'
  if (await capacitorHaptic(kind)) return 'haptics'
  if (webVibrate(kind)) return 'vibrate'
  return null
}

// Her düğmeye dokunuşta hafif titreşim (tek dinleyici, tüm uygulama). Kendi titreşimini veren
// öğeler atlanır: data-no-tap, anahtarlar (role="switch", aria-pressed) ve devre dışı düğmeler.
// Döner: kaldırma fonksiyonu.
export function installTapHaptics(root = typeof document !== 'undefined' ? document : null) {
  if (!root?.addEventListener) return () => {}
  const onClick = (e) => {
    const el = e.target?.closest?.('button, [role="button"], a.btn')
    if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return
    if (el.closest('[data-no-tap]') || el.getAttribute('role') === 'switch' || el.hasAttribute('aria-pressed')) return
    haptic('tick')
  }
  root.addEventListener('click', onClick, true)
  return () => root.removeEventListener('click', onClick, true)
}

// kind: 'tick' (hafif), 'hit' (orta), 'success', 'warning', 'error'. Bilinmeyen tür → 'tick'.
// Ayarlardan titreşim kapalıysa hiçbir şey yapmaz.
export async function haptic(kind = 'tick') {
  if (!getPrefs().haptics) return
  await playHaptic(normKind(kind))
}

// Bilgi ekranındaki "Titreşimi dene" için. Açık bir kullanıcı isteği olduğundan titreşim tercihine
// bakmaz (düğme, titreşim kapalıyken arayüzde devre dışıdır).
// Döner: { ok, via: 'native'|'haptics'|'vibrate'|null, reason?: 'unsupported'|'failed' }
// ok:true yalnızca komutun cihaza iletildiğini söyler; iPhone ayarları titreşimi yine susturabilir.
export async function testHaptic(kind = 'success') {
  const via = await playHaptic(normKind(kind))
  if (!via) return { ok: false, via: null, reason: isIOSApp() ? 'failed' : 'unsupported' }
  if (via === 'native') {
    try {
      const { supported } = await Feedback.isHapticsSupported()
      // Taptic Engine olmayan cihaz (ör. iPad): komut hata vermeden sessizce geçer.
      if (supported === false) return { ok: false, via, reason: 'unsupported' }
    } catch {
      // bilinmiyor → iletildi say
    }
  }
  return { ok: true, via }
}

// Uygulama açılışında bir kez çağrılır (tekrar çağrı zararsız). iPhone'da ses tercihini AVAudioSession'a
// yansıtır: ses açık → playback (sessiz tuşunda da duyulur, müziği kesmez), kapalı → ambient.
// Tercih değişince yeniden uygular. Web'de hiçbir şey yapmaz. Döner: durdurma fonksiyonu.
let feedbackStop = null
let audioChain = Promise.resolve()

function applyAudioMode(sound) {
  if (!isIOSApp() || feedbackMissing) return
  // Hızlı aç/kapa'da çağrılar sırayla gitsin; son tercih kazansın.
  audioChain = audioChain
    .then(() => Feedback.setAudioMode({ playback: Boolean(sound) }))
    .catch((e) => {
      if (isUnimplemented(e)) feedbackMissing = true
    })
}

export function initFeedback() {
  if (feedbackStop) return feedbackStop
  if (!isIOSApp()) return () => {}
  applyAudioMode(getPrefs().sound)
  const unsubscribe = subscribePrefs((next, prev) => {
    if (!prev || next.sound !== prev.sound) applyAudioMode(next.sound)
  })
  // VARSAYIM: telefon görüşmesi gibi kesintilerden sonra iOS ses oturumunu yeniden etkinleştirmeyebilir;
  // uygulama öne gelince tercihi yeniden uygulamak zararsızdır (native taraf kayıt sürerken erteler).
  const onVisible = () => {
    if (document.visibilityState === 'visible') applyAudioMode(getPrefs().sound)
  }
  try {
    document.addEventListener('visibilitychange', onVisible)
  } catch {
    // yoksay
  }
  feedbackStop = () => {
    unsubscribe()
    try {
      document.removeEventListener('visibilitychange', onVisible)
    } catch {
      // yoksay
    }
    feedbackStop = null
  }
  return feedbackStop
}

// Export: ios/App/App/ExportPlugin.swift — PDF (iOS yazdırma motoru, A4) + paylaşım sayfası.
// Web'de (önizleme): CSV indirilir; rapor yeni sekmede açılıp yazdırma penceresi gelir ("PDF olarak kaydet").
// Döner: { completed, activity } — completed=false: kullanıcı bir yer seçmeden paylaşım sayfasını kapattı
// (bir eklentiden vazgeçmek sayfayı kapatmaz; sonuç sayfa kapanınca gelir). Başka dışa aktarma sürerken reddedilir.
export const Export = registerPlugin('Export')

export async function shareTextFile(filename, text, type = 'text/csv') {
  if (isIOSApp()) return Export.shareText({ filename, text })
  const url = URL.createObjectURL(new Blob([text], { type: `${type};charset=utf-8` }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
  return { completed: true, activity: 'download' }
}

export async function sharePdf(filename, html, footer) {
  if (isIOSApp()) return Export.sharePdf({ filename, html, footer })
  const w = window.open('', '_blank')
  if (!w) throw new Error('Yeni sekme açılamadı')
  w.document.write(html)
  w.document.close()
  setTimeout(() => w.print(), 400)
  return { completed: true, activity: 'print' }
}

// Health: ios/App/App/HealthPlugin.swift — Apple Sağlık, YALNIZ OKUMA (adım, yürüme mesafesi, egzersiz dakikası).
// Web'de yok (null döner). iOS okuma izninin verilip verilmediğini söylemez: izin yoksa değerler 0 gelir.
// DİKKAT (Bug 15): eklenti nesnesi async fonksiyondan döndürülmez; yalnız sonuç nesneleri döner.
export const Health = registerPlugin('Health')

export async function healthAvailable() {
  if (!isIOSApp()) return false
  try {
    const r = await Health.isAvailable()
    return Boolean(r?.available)
  } catch {
    return false
  }
}

export async function requestHealthAccess() {
  if (!isIOSApp()) return false
  const r = await Health.requestAuthorization()
  return Boolean(r?.requested)
}

// { days: [{ date, steps, distanceM, exerciseMin }], recentSteps, at } ya da null (web / hata)
export async function readHealth({ days = 7, recentMinutes = 60 } = {}) {
  if (!isIOSApp()) return null
  const [d, r] = await Promise.all([Health.dailyTotals({ days }), Health.recentSteps({ minutes: recentMinutes })])
  return { days: d?.days ?? [], recentSteps: r?.steps ?? null, at: new Date().toISOString() }
}

// Yürüyüş koruması (HealthPlugin.swift WalkGuard): günün adımı eşiğe ulaşınca o günün yürüyüş bildirimi,
// uygulama açılmasa da, native tarafta silinir. guards: [{ id, date: 'YYYY-MM-DD', threshold }] (lib/notifyPlan.js).
// Boş liste korumayı kapatır. iOS değilse ya da eski derlemede metot yoksa sessizce geçer.
export async function setWalkGuards(guards) {
  if (!isIOSApp()) return
  try {
    await Health.setWalkGuards({ guards: Array.isArray(guards) ? guards : [] })
  } catch {
    // yoksay
  }
}

// Native'in sildiği yürüyüş bildirimleri; okununca native günlük temizlenir.
// Döner: { cancelled: [{ id, date, steps, at }] } — web / hata → { cancelled: [] }
export async function walkGuardLog() {
  if (!isIOSApp()) return { cancelled: [] }
  try {
    const r = await Health.walkGuardLog()
    return { cancelled: Array.isArray(r?.cancelled) ? r.cancelled : [] }
  } catch {
    return { cancelled: [] }
  }
}

// Güvenli web oturumu (ios/App/App/AuthSessionPlugin.swift): Google ile giriş penceresi (lib/account.js)
export const AuthSession = registerPlugin('AuthSession')

// Apple ile giriş (ios/App/App/AppleSignInPlugin.swift): uygulamanın kendi eklentisi (lib/account.js signInWithApple)
export const AppleSignIn = registerPlugin('AppleSignIn')

// Nefona alarmı (ios/App/App/AlarmPlugin.swift; AlarmKit, iOS 26+). lib/alarm.js dışında çağrılmaz.
export const Alarm = registerPlugin('Alarm')

// --- Yoga ders oynatıcısı (ios/App/App/AlarmPlugin.swift: LessonPlayer; PLAN.v3 §D.3) ---
// Yalnız iPhone uygulamasında. Web'de her çağrı UNAVAILABLE ile reddedilir (yoga web'de görünmez); eski iOS derlemesinde
// metot yoksa Capacitor UNIMPLEMENTED ile reddeder. Yerel ret kodları: MISSING (dosya pakette yok), BUSY (ses kaydı
// sürüyor), PLAY (çalınamadı), IDLE (çalan ders yok), ARGS. Dosya adları public/ altına görelidir ("yoga/ders2-15.mp3").
// Sözleşme (modules/yoga/bridge.js): lessonStart({ file, at, title }), lessonPause(), lessonResume({ at }),
// lessonSeek({ at }), lessonCrossTo({ file, at }), lessonStop(), lessonStatus() → { time, duration, playing, route, … }.
// İsteğe bağlı ekler (yerel oynatıcı JS uyurken, kilitli ekranda da doğru davransın diye):
// - lessonStart'ta id (kayıt kimliği, yerel kayda yazılır), journal: false (yerel kayıt tutma; ör. sesli dönüş),
//   sections: [{ at, name }] (kilit ekranında bölüm adı), resume: [{ from, to, at }] (kilit ekranından ya da kesintiden
//   sürdürünce klip başı), next: { file, at } (bu dosya bitmeden 2 sn önce geçilecek dosya: ilk ders girişi, açılış izni),
//   tail: { file, seconds, fade } (uyku dersinde dosya bitince müzik kuyruğu; son `fade` sn'de kısılıp tamamen durur).
// - lessonMeta({ file?, sections?, resume? }): çizelge sonradan yüklenince aynı bilgiler.
// - lessonStatus() ayrıca: state (idle | playing | paused | stopping | tail | finished), reason (duraklatılmışken:
//   user | remote | interruption | route | reset | stalled | error), listened (gerçekten çalan sn), file, prelude, ended,
//   tailLeft.
// - lessonJournal() → yerel kayıt ya da null: { id?, file, title, state, finished, prelude, startedAt, updatedAt,
//   endedAt?, listened, time, maxTime, duration } (zamanlar Unix saniyesi); lessonJournalClear() ("Tüm verileri sil").
const lessonError = (message, code) => Object.assign(new Error(message), { code })
const finiteOr = (x, d) => (typeof x === 'number' && Number.isFinite(x) ? x : d)
const lessonFile = (f) => (typeof f === 'string' ? f.replace(/^\.?\//, '') : undefined)
const defined = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined))
const lessonSections = (list) => {
  if (!Array.isArray(list)) return undefined
  const out = list
    .filter((s) => Number.isFinite(s?.at) && typeof s?.name === 'string' && s.name)
    .map((s) => ({ at: s.at, name: s.name }))
  return out.length ? out : undefined
}
const lessonSpans = (list) => {
  if (!Array.isArray(list)) return undefined
  const out = list
    .filter((s) => Number.isFinite(s?.from) && Number.isFinite(s?.to) && Number.isFinite(s?.at) && s.to > s.from)
    .map((s) => ({ from: s.from, to: s.to, at: s.at }))
  return out.length ? out : undefined
}

function lessonCall(method, opts) {
  if (!isIOSApp()) return Promise.reject(lessonError('Ders oynatıcısı yalnız iPhone uygulamasında', 'UNAVAILABLE'))
  try {
    return Promise.resolve(opts === undefined ? Alarm[method]() : Alarm[method](opts))
  } catch (e) {
    return Promise.reject(e?.code ? e : lessonError(`Ders oynatıcısı bu derlemede yok (${method})`, 'UNIMPLEMENTED'))
  }
}

export function lessonStart({ file, at = 0, title, id, journal, sections, resume, next, tail } = {}) {
  return lessonCall('lessonStart', defined({
    file: lessonFile(file),
    at: finiteOr(at, 0),
    title: typeof title === 'string' ? title : undefined,
    id: typeof id === 'string' || typeof id === 'number' ? String(id) : undefined,
    journal: typeof journal === 'boolean' ? journal : undefined,
    sections: lessonSections(sections),
    resume: lessonSpans(resume),
    next: next?.file ? { file: lessonFile(next.file), at: finiteOr(next.at, 0) } : undefined,
    tail: tail?.file && finiteOr(tail.seconds, 0) >= 1
      ? defined({ file: lessonFile(tail.file), seconds: tail.seconds, fade: finiteOr(tail.fade, undefined) })
      : undefined,
  }))
}
export const lessonPause = () => lessonCall('lessonPause')
// at verilmezse yerel oynatıcı klip başını resume aralıklarından bulur (yoksa kaldığı yer)
export const lessonResume = ({ at } = {}) => lessonCall('lessonResume', defined({ at: finiteOr(at, undefined) }))
export const lessonSeek = ({ at } = {}) => lessonCall('lessonSeek', defined({ at: finiteOr(at, undefined) }))
// file verilmezse çalan dosyada başka yere 2 sn'lik geçiş
export const lessonCrossTo = ({ file, at } = {}) =>
  lessonCall('lessonCrossTo', defined({ file: lessonFile(file), at: finiteOr(at, undefined) }))
export const lessonStop = () => lessonCall('lessonStop')
export const lessonStatus = () => lessonCall('lessonStatus')
export const lessonMeta = ({ file, sections, resume } = {}) =>
  lessonCall('lessonMeta', defined({ file: lessonFile(file), sections: lessonSections(sections), resume: lessonSpans(resume) }))

// Yerel kayıt (uygulama arka planda kapandıysa açılışta uzlaştırmak için). Web / hata / kayıt yok → null.
export async function lessonJournal() {
  if (!isIOSApp()) return null
  try {
    const r = await Alarm.lessonJournal()
    const j = r?.journal
    return j && typeof j === 'object' && typeof j.file === 'string' ? j : null
  } catch {
    return null
  }
}

// "Tüm verileri sil" (modul.md §6.4): yerel kayıt localStorage'da değil. Döner: silindi mi (web / eski derleme → false).
export async function lessonJournalClear() {
  if (!isIOSApp()) return false
  try {
    await Alarm.lessonJournalClear()
    return true
  } catch {
    return false
  }
}
