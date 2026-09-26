// Kimlik: ad, doğum tarihi, şehir, avatar (Profilim / "Seni tanıyalım"). Cihazda kalır; Nef'e gitmez.
// Hesap açıldıysa ad, doğum tarihi ve şehir Supabase'deki profile eşitlenir (lib/account.js); fotoğraf yalnız cihazda.
import { normalizeCity } from './cities.js'
export const NAME_MAX = 40
export const AVATAR_PX = 160 // fotoğraf bu boyuta küçültülür (~10–20 KB, localStorage'a sığar)
export const AVATAR_HUES = [188, 222, 262, 32, 150] // iris renkleri: cam göbeği, mavi, mor, altın, yeşil

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export function emptyIdentity() {
  return { name: '', birthDate: null, city: '', avatar: { kind: 'letter', hue: AVATAR_HUES[0], dataUrl: null } }
}

// Geçersiz/eksik alanlar güvenli değere düşer; bilinmeyen alanlar atılır.
export function normalizeIdentity(raw) {
  const e = emptyIdentity()
  if (!raw || typeof raw !== 'object') return e
  const name = typeof raw.name === 'string' ? raw.name.trim().slice(0, NAME_MAX) : ''
  const birthDate = validBirthDate(raw.birthDate) ? raw.birthDate : null
  const a = raw.avatar && typeof raw.avatar === 'object' ? raw.avatar : {}
  const hue = AVATAR_HUES.includes(a.hue) ? a.hue : e.avatar.hue
  const dataUrl = typeof a.dataUrl === 'string' && a.dataUrl.startsWith('data:image/') && a.dataUrl.length < 200000 ? a.dataUrl : null
  const kind = a.kind === 'photo' && dataUrl ? 'photo' : 'letter'
  return { name, birthDate, city: normalizeCity(raw.city), avatar: { kind, hue, dataUrl: kind === 'photo' ? dataUrl : null } }
}

// 'YYYY-MM-DD'; gelecekte olmayan, 120 yıldan eski olmayan gerçek bir tarih
export function validBirthDate(s, now = new Date()) {
  if (typeof s !== 'string' || !DATE_RE.test(s)) return false
  const d = new Date(`${s}T00:00:00`)
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s) return false
  const age = ageFromBirthDate(s, now)
  return age >= 0 && age <= 120
}

export function ageFromBirthDate(s, now = new Date()) {
  if (typeof s !== 'string' || !DATE_RE.test(s)) return null
  const [y, m, d] = s.split('-').map(Number)
  let age = now.getFullYear() - y
  const beforeBirthday = now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)
  if (beforeBirthday) age -= 1
  return age
}

// Avatar harfi: adın ilk harfi (Türkçe büyük harf), ad yoksa boş
export function initialFor(name) {
  const t = (name ?? '').trim()
  return t ? t[0].toLocaleUpperCase('tr-TR') : ''
}

export function hasIdentity(id) {
  const n = normalizeIdentity(id)
  return Boolean(n.name || n.birthDate || n.city || n.avatar.kind === 'photo')
}
