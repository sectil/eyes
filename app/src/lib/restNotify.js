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

// Dokunma dinleyicisi burada YOK: uygulama kapalıyken yapılan dokunuş yalnız ilk bağlanan dinleyiciye gider.
// Tek dinleyici lib/notifyApply.js onNotifyTap'te; App 7301'i (Ana sayfa) ve 7302'yi (İlk rapor) oradan dağıtır.

// Deneme hatırlatması (Build 23b): 7 günlük denemenin 5. günü. İzin İSTEMEZ (bildirim planı v2 §4): izin yoksa
// kurulmaz; o kişiye 5. gün Ana sayfada uygulama içi şerit çıkar (App.jsx). İzin hangi yoldan verilirse verilsin
// (Ana sayfa kartı, Hatırlatmalar, mola kilidi, iOS Ayarlar) App 'granted' görünce 5. günden önce yeniden çağırır.
// Önce iptal edip kurar: tekrar çağrı zararsız. Zamanı geçmişse kurulmaz (geçmiş an hemen çalar).
// "Tüm verileri sil" bunu iptal ETMEZ: Apple denemesi yerel veriyle birlikte bitmez, ücretlendirme öncesi uyarı kalır.
export const TRIAL_NOTIFY_ID = 7302
export const TRIAL_REMIND_DAYS = 5

// 5. günün anı, gündüze alınmış (DEVIR §8.2: gece 23.40'ta başlayan deneme 5 gün sonra 23.40'ta çalıyordu). Yerel
// saatle 09.00'dan önceyse aynı gün 10.00, 21.00'den sonraysa aynı gün 20.00; gün değişmez, "2 gün sonra" doğru kalır.
export function trialRemindAt(startMs) {
  const at = startMs + TRIAL_REMIND_DAYS * 86400000
  if (!Number.isFinite(at)) return NaN
  const d = new Date(at)
  const m = d.getHours() * 60 + d.getMinutes()
  if (m < 9 * 60) return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 10, 0, 0, 0).getTime()
  if (m > 21 * 60) return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 20, 0, 0, 0).getTime()
  return at
}

export async function scheduleTrialReminder(startMs = Date.now()) {
  const at = trialRemindAt(startMs)
  if (!Number.isFinite(at) || at <= Date.now()) return false
  const pl = await plugin()
  if (!pl) return false
  if ((await notifyPermission()) !== 'granted') return false
  const { LN } = pl
  try {
    await LN.cancel({ notifications: [{ id: TRIAL_NOTIFY_ID }] })
    await LN.schedule({
      notifications: [
        {
          id: TRIAL_NOTIFY_ID,
          title: 'İlk 5 günün raporu hazır',
          body: 'Neler değişti, bak. Deneme 2 gün sonra bitiyor; iptal etmezsen seçtiğin plan başlar (Ayarlar → Apple Kimliği → Abonelikler).',
          schedule: { at: new Date(at) },
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
