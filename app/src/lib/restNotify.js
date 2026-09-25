// Mola bitince yerel bildirim ("Mola bitti, devam edebilirsin"). Yalnızca iOS uygulamasında.
// @capacitor/local-notifications 8.3.1 (node_modules/.../definitions.d.ts okundu):
//  - schedule() izin yoksa sistem izin penceresini KENDİSİ açar (8.3.0+). Bu yüzden izin verilmemişse
//    schedule çağrılmaz; izin önce kendi açıklama kartımızla (RestLock) istenir.
//  - foreground: false → uygulama açıkken gösterilmez (mola ekranı zaten haber verir).
//  - Dokunma olayı 'localNotificationActionPerformed', actionId 'tap'.
// Bildirim izni reddedilse de kilit uygulama içinde tam çalışır (App Store 4.5.4 ilkesi).
import { isIOSApp } from './native.js'

export const REST_NOTIFY_ID = 7301
export const REST_NOTIFY_KEY = 'gozolcum:rest-notify' // { asked: bool } — açıklama kartı bir kez

// Dikkat: Capacitor eklenti nesnesi (Proxy) promise'ten doğrudan DÖNDÜRÜLMEZ — JS onu "thenable" sanıp
// .then() çağırır ve "LocalNotifications.then() is not implemented" hatası verir. Modül döndürülür.
let modPromise = null
const loadMod = () => {
  if (!isIOSApp()) return Promise.resolve(null)
  if (!modPromise) modPromise = import('@capacitor/local-notifications').catch(() => null)
  return modPromise
}
const plugin = async () => {
  const m = await loadMod()
  return m ? { LN: m.LocalNotifications } : null
}

export function notifyAsked() {
  try {
    return JSON.parse(localStorage.getItem(REST_NOTIFY_KEY) ?? 'null')?.asked === true
  } catch {
    return false
  }
}
function markAsked() {
  try {
    localStorage.setItem(REST_NOTIFY_KEY, JSON.stringify({ asked: true }))
  } catch {
    // depolama yok
  }
}

// 'granted' | 'denied' | 'prompt' | 'unsupported'
export async function notifyPermission() {
  const pl = await plugin()
  if (!pl) return 'unsupported'
  const { LN } = pl
  try {
    const { display } = await LN.checkPermissions()
    return display === 'granted' ? 'granted' : display === 'denied' ? 'denied' : 'prompt'
  } catch {
    return 'unsupported'
  }
}

// Kullanıcı "Evet, haber ver" dedi: sistem iznini iste
export async function askNotifyPermission() {
  markAsked()
  const pl = await plugin()
  if (!pl) return false
  const { LN } = pl
  try {
    const { display } = await LN.requestPermissions()
    return display === 'granted'
  } catch {
    return false
  }
}
export const declineNotify = () => markAsked()

export async function scheduleRestEnd(until) {
  if (!Number.isFinite(until) || until <= Date.now()) return false
  if ((await notifyPermission()) !== 'granted') return false
  const { LN } = await plugin()
  try {
    await LN.cancel({ notifications: [{ id: REST_NOTIFY_ID }] })
    await LN.schedule({
      notifications: [
        {
          id: REST_NOTIFY_ID,
          title: 'Mola bitti',
          body: 'Gözlerin dinlendi, devam edebilirsin.',
          schedule: { at: new Date(until) },
          interruptionLevel: 'active',
          foreground: false,
        },
      ],
    })
    return true
  } catch {
    return false
  }
}

export async function cancelRestEnd() {
  const pl = await plugin()
  if (!pl) return
  const { LN } = pl
  try {
    await LN.cancel({ notifications: [{ id: REST_NOTIFY_ID }] })
  } catch {
    // yoksay
  }
}

// Bildirime dokununca (uygulama kapalıyken açılış dahil; olay dinleyici bağlanana dek bekletilir)
export async function onRestNotifyTap(cb) {
  const pl = await plugin()
  if (!pl) return () => {}
  const { LN } = pl
  try {
    const h = await LN.addListener('localNotificationActionPerformed', (a) => {
      if (a?.actionId === 'tap' && a?.notification?.id === REST_NOTIFY_ID) cb()
    })
    return () => h.remove()
  } catch {
    return () => {}
  }
}
