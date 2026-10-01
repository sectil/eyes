// Renkleri ters çevirme açıkken görme testi başlamaz (karar S12): test alanı beyaz zeminde siyah E ister,
// ters çevirmede siyah zeminde beyaz E görünür. Ekranda: "Renkleri ters çevirme açık. Ölçüm için kapat:
// Ayarlar → Erişilebilirlik." (lib/acuityReadiness.js, girdi `inverted`).
// İki kaynak birlikte okunur, biri "açık" derse açık sayılır:
//   1. CSS (inverted-colors: inverted) — WebKit destekler. VARSAYIM (doğrulanmadı): WKWebView'de çalışır.
//   2. iPhone'da UIAccessibility.isInvertColorsEnabled (FaceDistancePlugin.swift). VARSAYIM (doğrulanmadı):
//      yalnız Akıllı Ters Çevir'i bildiriyor olabilir; Klasik ters çevirme ikisinde de görünmeyebilir.
import { nativeInvertColors, watchNativeInvertColors } from './native.js'

export const INVERTED_QUERY = '(inverted-colors: inverted)'

const defaultMatchMedia = () => (typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia.bind(window) : null)

// true / false; matchMedia yoksa ya da hata verirse null. Sorguyu tanımayan tarayıcı false döner.
export function cssInvertedColors(matchMedia = defaultMatchMedia()) {
  if (typeof matchMedia !== 'function') return null
  try {
    return matchMedia(INVERTED_QUERY)?.matches === true
  } catch {
    return null
  }
}

export const combineInverted = (css, native) => css === true || native === true

// Döner: boolean (bilinmiyorsa false).
export async function readInvertedColors({ matchMedia = defaultMatchMedia(), nativeGet = nativeInvertColors } = {}) {
  const css = cssInvertedColors(matchMedia)
  let native = null
  try {
    native = await nativeGet()
  } catch {
    native = null
  }
  return combineInverted(css, native)
}

// Canlı izleme: ilk okuma, CSS sorgusunun değişimi, native ayar olayı ve uygulamaya dönüş (visibilitychange)
// her seferinde iki kaynağı yeniden okur. onChange(boolean) yalnız değer değişince çağrılır (ilk okuma dahil).
// Eski bir okuma yenisinden sonra biterse yok sayılır. Döner: durdurma fonksiyonu.
export function watchInvertedColors(
  onChange,
  {
    matchMedia = defaultMatchMedia(),
    nativeGet = nativeInvertColors,
    nativeWatch = watchNativeInvertColors,
    doc = typeof document !== 'undefined' ? document : null,
  } = {},
) {
  let stopped = false
  let seq = 0
  let last = null

  const refresh = async () => {
    const mine = ++seq
    const value = await readInvertedColors({ matchMedia, nativeGet })
    if (stopped || mine !== seq || value === last) return
    last = value
    onChange(value)
  }

  let mql = null
  try {
    mql = typeof matchMedia === 'function' ? matchMedia(INVERTED_QUERY) : null
  } catch {
    mql = null
  }
  const onMql = () => {
    refresh()
  }
  const onVisibility = () => {
    if (doc?.visibilityState === 'visible') refresh()
  }
  try {
    mql?.addEventListener?.('change', onMql)
    doc?.addEventListener?.('visibilitychange', onVisibility)
  } catch {
    // yoksay
  }
  let unNative = null
  try {
    unNative = nativeWatch?.(() => refresh()) ?? null
  } catch {
    unNative = null
  }
  refresh()

  return () => {
    stopped = true
    try {
      mql?.removeEventListener?.('change', onMql)
      doc?.removeEventListener?.('visibilitychange', onVisibility)
      unNative?.()
    } catch {
      // yoksay
    }
  }
}
