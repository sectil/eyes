// Metin biçimleme yardımcıları (saf). stats.js ve modül manifestleri ortak kullanır; ayrı dosyada
// durur ki manifestler stats.js'e bağlanıp döngü kurmasın.

// Sayı ile birimi arasında bölünmez boşluk: dar ekranda "35 / sn" diye bölünmez.
export const NBSP = ' '

export const finite = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null)

export const join = (parts) => parts.filter(Boolean).join(' · ')

// Saniye → "45 sn", "2 dk 10 sn", "12 dk" (sayı–birim arası NBSP)
export function formatDuration(sec) {
  const s = Math.max(0, Math.round(finite(sec) ?? 0))
  if (s < 60) return `${s}${NBSP}sn`
  const m = Math.floor(s / 60)
  const r = s % 60
  if (m >= 10 || r === 0) return `${Math.round(s / 60)}${NBSP}dk`
  return `${m}${NBSP}dk ${r}${NBSP}sn`
}

export const durationPart = (seconds, estimated) => (seconds > 0 ? `${estimated ? '~' : ''}${formatDuration(seconds)}` : null)

export const CONTROL_LABEL = { eyes: 'gözle', touch: 'dokunarak' }
