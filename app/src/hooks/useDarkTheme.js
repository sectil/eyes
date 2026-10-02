import { useEffect, useState } from 'react'
import { resolvedTheme } from '../lib/theme.js'

// Etkin tema koyu mu: sistem teması değişince ve Profil → Görünüm (data-theme) değişince güncellenir.
// Tuvale çizen bileşenler için (renkler CSS değişkeninden okunamaz).
export function useDarkTheme() {
  const [dark, setDark] = useState(() => resolvedTheme() === 'dark')
  useEffect(() => {
    const on = () => setDark(resolvedTheme() === 'dark')
    let mq = null
    try {
      mq = window.matchMedia('(prefers-color-scheme: dark)')
      mq.addEventListener?.('change', on)
    } catch {
      mq = null
    }
    const mo = typeof MutationObserver === 'function' ? new MutationObserver(on) : null
    mo?.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => {
      mq?.removeEventListener?.('change', on)
      mo?.disconnect()
    }
  }, [])
  return dark
}
