// Tema tercihi: 'system' | 'light' | 'dark'. Cihaz başına saklanır (ölçüm verisinden ayrı).
// 'system' iken <html> üzerinde data-theme olmaz; CSS prefers-color-scheme'i izler.

const KEY = 'gozolcum:theme'
export const THEMES = ['system', 'light', 'dark']

const META = { light: '#f5f7f7', dark: '#0b1414' }

export function getThemePref() {
  try {
    const v = localStorage.getItem(KEY)
    return THEMES.includes(v) ? v : 'system'
  } catch {
    return 'system'
  }
}

export function resolvedTheme(pref = getThemePref()) {
  if (pref !== 'system') return pref
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function applyTheme(pref = getThemePref()) {
  const root = document.documentElement
  if (pref === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', pref)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', META[resolvedTheme(pref)])
}

export function setThemePref(pref) {
  try {
    localStorage.setItem(KEY, pref)
  } catch {
    // tarayıcı depolaması yoksa yalnızca bu oturum için uygula
  }
  applyTheme(pref)
}

// Sistem teması değişince (ör. akşam otomatik koyu) meta rengini güncelle
export function watchSystemTheme() {
  try {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const on = () => getThemePref() === 'system' && applyTheme('system')
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  } catch {
    return () => {}
  }
}
