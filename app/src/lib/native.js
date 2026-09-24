// iPhone uygulamasına özel yetenekler (Capacitor). Web'de bu fonksiyonlar "yok" döner.
// FaceDistance: ios/App/App/FaceDistancePlugin.swift (TrueDepth + ARKit)

import { Capacitor, registerPlugin } from '@capacitor/core'

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

// Yüz takibini başlatır; onFace({ tracked, distanceMm, blinkLeft, blinkRight }) ~15 Hz.
// Döner: durdurma fonksiyonu.
export async function startTrueDepth(onFace) {
  const handle = await FaceDistance.addListener('face', onFace)
  await FaceDistance.start()
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

// --- Titreşim (iPhone: Taptic Engine; web: navigator.vibrate) ---
let hapticsPromise = null
async function haptics() {
  if (!isIOSApp()) return null
  if (!hapticsPromise) hapticsPromise = import('@capacitor/haptics').catch(() => null)
  return hapticsPromise
}

// kind: 'tick' (hafif), 'hit' (orta), 'success', 'warning', 'error'
export async function haptic(kind = 'tick') {
  const h = await haptics()
  if (h) {
    const { Haptics, ImpactStyle, NotificationType } = h
    try {
      if (kind === 'tick') await Haptics.impact({ style: ImpactStyle.Light })
      else if (kind === 'hit') await Haptics.impact({ style: ImpactStyle.Medium })
      else if (kind === 'success') await Haptics.notification({ type: NotificationType.Success })
      else if (kind === 'warning') await Haptics.notification({ type: NotificationType.Warning })
      else await Haptics.notification({ type: NotificationType.Error })
    } catch {
      // yoksay
    }
    return
  }
  try {
    const pattern = { tick: [20], hit: [40], success: [40, 60, 40], warning: [80], error: [80, 60, 80] }[kind] ?? [30]
    navigator.vibrate?.(pattern)
  } catch {
    // yoksay
  }
}
