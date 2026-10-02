// Görme testi boyunca ekran parlaklığı %100 (karar S7; PLAN H7: Giang 2024, 26 → 153 cd/m² arasında
// 0,07–0,12 logMAR fark). Başla'da eski değer okunur ve saklanır, parlaklık 1 olur. Bitişte, çıkışta ve
// arka plana geçişte (visibilitychange: hidden) eski değere dönülür. Uygulamaya dönülünce (visible) test
// sürüyorsa yeniden 1 olur; aradaki kullanıcı ayarı yeni "eski değer" sayılır.
// Native koruma (FaceDistancePlugin.swift): iOS ön plandan çıkan uygulamanın parlaklığı değiştirmesine izin
// vermez (Apple QA1751). Bu yüzden 1 uygulanırken native'e eski değer de verilir (restoreOnLeave); native
// etkinlik kaybında (Denetim Merkezi, arama, uygulama değiştirme) geri yükler ve "brightness" olayını
// { reason: 'restored' } ile bildirir; yeniden etkinleşince { reason: 'active' } gelir ve burada yeniden uygulanır.
// Geri yükleme her uygulama için bir kez yapılır: aynı tetik iki kez gelse de eski değer iki kez yazılmaz.
// Tüm adımlar sırayla yürür (okuma bitmeden çıkılırsa parlaklık 1'de kalmaz).
// Web'de okuma null döner → hiçbir şey yapılmaz. Kalıcı bir şey yazılmaz; başlangıç değeri kayda
// ölçüm ekranınca yazılır (state().from).
import { getScreenBrightness, setScreenBrightness, watchScreenBrightness } from './native.js'

export const TEST_BRIGHTNESS = 1

// Bir test oturumu için bir kez oluşturulur.
// Döner: { start(), end(), state() }
//   start(): Promise<state> — tekrar çağrı zararsız (eski değer 1 ile ezilmez)
//   end():   Promise<state> — eski değere döner, dinleyicileri kaldırır; tekrar çağrı zararsız
//   state(): { active, applied, from } — from: Başla'da okunan ilk değer (0–1) ya da null (web / okunamadı)
export function createBrightnessSession({
  target = TEST_BRIGHTNESS,
  get = getScreenBrightness,
  set = setScreenBrightness,
  listen = watchScreenBrightness,
  doc = typeof document !== 'undefined' ? document : null,
} = {}) {
  let active = false
  let applied = false
  let original = null
  let from = null
  let unlisten = null
  let chain = Promise.resolve()

  // Adımlar sırayla: her biri öncekinin bitmesini bekler; hata zinciri kırmaz.
  const run = (step) => {
    chain = chain.then(step).catch(() => {})
    return chain
  }
  const state = () => ({ active, applied, from })

  async function apply() {
    if (!active) return
    if (applied) {
      // Uygulanmış görünüyor (gizlenme kaçmış olabilir): aynı eski değerle korumayı yeniden kur.
      await set(target, { restoreOnLeave: original })
      return
    }
    const v = await get()
    if (!active || v == null || !Number.isFinite(v)) return
    original = v
    if (from == null) from = v
    const r = await set(target, { restoreOnLeave: v })
    applied = r != null
  }

  async function restore() {
    if (!applied) return
    applied = false
    // restoreOnLeave yok → native koruma da kalkar
    await set(original)
  }

  const onVisibility = () => {
    if (!active || !doc) return
    if (doc.visibilityState === 'hidden') run(restore)
    else if (doc.visibilityState === 'visible') run(apply)
  }

  const onNative = (e) => {
    if (!active) return
    if (e?.reason === 'restored') {
      // Native eski değeri zaten yazdı: bir daha yazılmaz, dönüşte yeniden okunur.
      run(() => {
        applied = false
      })
    } else if (e?.reason === 'active') {
      run(apply)
    }
  }

  function start() {
    if (!active) {
      active = true
      try {
        doc?.addEventListener?.('visibilitychange', onVisibility)
      } catch {
        // yoksay
      }
      try {
        unlisten = listen?.(onNative) ?? null
      } catch {
        unlisten = null
      }
      run(apply)
    }
    return run(() => {}).then(state)
  }

  function end() {
    if (active) {
      active = false
      try {
        doc?.removeEventListener?.('visibilitychange', onVisibility)
      } catch {
        // yoksay
      }
      try {
        unlisten?.()
      } catch {
        // yoksay
      }
      unlisten = null
      run(restore)
    }
    return run(() => {}).then(state)
  }

  return { start, end, state }
}
