// iPhone uygulamasına özel yetenekler (Capacitor). Web'de bu fonksiyonlar "yok" döner.
// FaceDistance: ios/App/App/FaceDistancePlugin.swift (TrueDepth + ARKit)
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
// Döner: durdurma fonksiyonu.
export async function startTrueDepth(onFace) {
  const handle = await FaceDistance.addListener('face', onFace)
  try {
    await FaceDistance.start()
  } catch (e) {
    // start reddedilirse (izin yok / 'cancelled') dinleyici sızmasın.
    await handle.remove().catch(() => {})
    throw e
  }
  return async () => {
    try {
      await FaceDistance.stop()
    } finally {
      await handle.remove()
    }
  }
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
