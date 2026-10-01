// "Tüm verileri sil"in kayıt ve bildirim kısmı (PLAN.v1 §5.1 "Rıza geri çekilince ve Tüm verileri sil'de", §5.3
// resetAll testi). App.jsx Info → onReset'ten çağırır; ekran, alarm, yoga gibi öteki işler App'te kalır.
//
//   - Kayıt (store.clearAll): settings.moduleReminders ve gece sessizliği (settings.quiet) dâhil her şey gider;
//     yalnız abonelik denemesinin zaman çizelgesi (TRIAL_KEYS) ve iPhone'un otomatik ekran ölçüsü geri yazılır.
//   - localStorage: gozolcum:notify-slots (legacy ek saatleri), bakış kalibrasyonu (DATA_RESET_KEYS) ve çağıranın verdiği
//     anahtarlar (registry.resetKeys()).
//   - Bildirimler: cancelOwn → 7400–7509, 7700–7701, 7800–7867 ve yalnız-iptal 7710–7719 (notifyApply). Deneme
//     hatırlatması 7302, 7301 ve 7600–7607 bu aralıklarda değil: kalır (bugünkü kural).
import { NOTIFY_SLOTS_KEY } from './notifyAll.js'
import { GAZE_MODEL_KEY } from './gazeCalib.js'

// Korunan ayarlar: abonelik denemesinin zaman çizelgesi (satın alma durumu, kullanıcı verisi değil; Apple denemesi
// yerel veriyle birlikte bitmez). Deneme hatırlatması (7302) da iptal edilmez. (App.jsx'ten taşındı; değer aynı)
export const TRIAL_KEYS = Object.freeze(['trialOffer', 'trialReminder', 'trialNoteSeen', 'firstReportSeen'])
// Bildirim işinin localStorage anahtarları (settings dışında kalanlar)
export const NOTIFY_RESET_KEYS = Object.freeze([NOTIFY_SLOTS_KEY])
// Hiçbir modüle ait olmayan kişisel veri anahtarları (modül storageKeys'i dışında): kişisel bakış kalibrasyonu
// (lib/gazeCalib.js; Çemberler, Yılan, Hızlı Bakış, egzersiz seti ortak kullanır). Gelişim merkezi DENETIM Kü-12:
// "Tüm verileri sil" bunu silmiyordu (clearGazeModel hiç çağrılmıyordu); silme sözü eksik kalıyordu. Silinince bakışla
// kontrol yeniden kalibrasyon ister. Kamera yönü tercihi (gaze-flip) cihaz ayarıdır, kalır.
export const DATA_RESET_KEYS = Object.freeze([GAZE_MODEL_KEY])

// store: storage.js createStore örneği · cancel: notifyApply cancelOwn · autoCal: korunacak otomatik ölçü | null
// keys: ayrıca silinecek localStorage anahtarları. Döner: cancel()'ın sözü (App beklemez).
export function resetAllData({ store, storage = globalThis.localStorage, cancel = null, autoCal = null, keys = [] } = {}) {
  const settings = store.get().settings ?? {}
  const kept = TRIAL_KEYS.filter((k) => settings[k] != null).map((k) => [k, settings[k]])
  store.clearAll()
  if (autoCal) store.setSetting('calibration', autoCal)
  for (const [k, v] of kept) store.setSetting(k, v)
  const done = typeof cancel === 'function' ? cancel() : null
  for (const k of new Set([...NOTIFY_RESET_KEYS, ...DATA_RESET_KEYS, ...keys])) {
    try {
      storage?.removeItem(k)
    } catch {
      // depolama yok: yoksay
    }
  }
  return done
}
