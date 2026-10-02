// Bu derlemenin kimliği (sahibin isteği 2026-09-30: "Bilgi bölümünde en son güncellendiğinde sürümü yazsın").
// Build numarası testflight.sh / device-run.sh'nin verdiği VITE_APP_BUILD'den; derleme anı ve commit vite.config.js'ten.
/* global __BUILD_TIME__, __BUILD_SHA__ */
const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']

export function buildDateText(iso) {
  const d = new Date(iso ?? '')
  if (!Number.isFinite(d.getTime())) return null
  const hm = `${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${hm}`
}

export function buildInfo(env = import.meta.env ?? {}) {
  const build = env.VITE_APP_BUILD ?? null
  const time = typeof __BUILD_TIME__ === 'string' ? __BUILD_TIME__ : null
  const sha = typeof __BUILD_SHA__ === 'string' && __BUILD_SHA__ ? __BUILD_SHA__ : null
  return { version: build ? `1.0 (${build})` : 'web', date: buildDateText(time), sha }
}

// Yenilikler satırının alt yazısı: "Bu sürüm: 1.0 (64) · 30 Eylül 2026, 21.14"
export function versionLine(info = buildInfo()) {
  return info.date ? `Bu sürüm: ${info.version} · ${info.date}` : `Bu sürüm: ${info.version}`
}
