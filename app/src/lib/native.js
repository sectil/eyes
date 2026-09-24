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
