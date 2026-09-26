// Hesap (Build 23b): Apple ile giriş (iPhone), e-posta ile 6 haneli kod, hesapsız kullanım.
// Hesap açıldıysa ad, doğum tarihi, şehir ve gözlük/lens Supabase'deki "profiles" satırına eşitlenir; fotoğraf ve
// ölçümler cihazda kalır. Kamera görüntüsü hiçbir yere gönderilmez. Hesap silme uygulama içinden (App Store 5.1.1(v)).
// settings.account: { mode: 'apple' | 'email' | 'guest', userId?, email?, date }
import { supabase, SUPABASE_URL } from './supabase.js'
import { normalizeIdentity } from './identity.js'
import { CORRECTION } from './profile.js'

export const APPLE_CLIENT_ID = 'com.sectil.eyelume' // uygulamanın paket kimliği (capacitor.config.json appId)
export const CODE_MIN = 6
export const CODE_MAX = 8
export const RESEND_SEC = 60

export const normalizeEmail = (s) => (typeof s === 'string' ? s.trim().toLowerCase() : '')
export const validEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizeEmail(s))
export const cleanCode = (s) => String(s ?? '').replace(/\D/g, '').slice(0, CODE_MAX)
export const validCode = (s) => {
  const c = cleanCode(s)
  return c.length >= CODE_MIN && c.length <= CODE_MAX
}

const CORRECTION_IDS = new Set(CORRECTION.map((o) => o.id))

// Cihazdaki kimlik → sunucu satırı (fotoğraf YOK)
export function profileToRow(identity, correction) {
  const id = normalizeIdentity(identity)
  return {
    name: id.name || null,
    birth_date: id.birthDate,
    city: id.city || null,
    correction: CORRECTION_IDS.has(correction) ? correction : null,
  }
}

// Sunucu satırı + cihazdaki kimlik → birleşik (sunucuda dolu olan alan kazanır; boşsa cihazdaki kalır; fotoğraf cihazdan)
export function mergeProfile(row, identity, correction) {
  const local = normalizeIdentity(identity)
  if (!row) return { identity: local, correction: correction ?? null }
  const merged = normalizeIdentity({
    ...local,
    name: row.name || local.name,
    birthDate: row.birth_date || local.birthDate,
    city: row.city || local.city,
  })
  return { identity: merged, correction: CORRECTION_IDS.has(row.correction) ? row.correction : (correction ?? null) }
}

// Kullanıcıya gösterilecek Türkçe hata; vazgeçmede null (mesaj gösterilmez)
export function friendlyError(err) {
  const msg = String(err?.message ?? err ?? '')
  const code = String(err?.code ?? err?.error ?? '')
  if (/cancel|1001/i.test(msg) || code === '1001') return null
  if (err?.status === 429 || /rate limit|too many/i.test(msg)) return 'Çok sık denendi. Bir dakika sonra yeniden dene.'
  // Supabase'in hazır e-posta servisi yalnız proje ekibine gönderir (kendi SMTP bağlanana kadar)
  if (/not authorized/i.test(msg)) return 'E-postayla giriş şu an açık değil. Apple ile devam et ya da hesapsız dene.'
  if (/otp_expired|expired|invalid.*(token|otp)|token.*invalid/i.test(msg + ' ' + code)) return 'Kod yanlış ya da süresi dolmuş. Yeni kod iste.'
  if (/fetch|network|offline|load failed/i.test(msg)) return 'İnternete bağlanılamadı. Bağlantını kontrol edip yeniden dene.'
  // Apple/iOS hata kodu (ör. AuthorizationError 1000) görünsün: teşhis için (Bug 11)
  const num = (msg.match(/error (\d{3,5})/i) ?? [])[1] ?? (/^\d{3,5}$/.test(code) ? code : null)
  return num ? `Bir sorun çıktı (kod ${num}). Biraz sonra yeniden dene.` : 'Bir sorun çıktı. Biraz sonra yeniden dene.'
}

export async function sendEmailCode(email) {
  const { error } = await supabase().auth.signInWithOtp({ email: normalizeEmail(email), options: { shouldCreateUser: true } })
  if (error) throw error
}

export async function verifyEmailCode(email, code) {
  const { data, error } = await supabase().auth.verifyOtp({ email: normalizeEmail(email), token: cleanCode(code), type: 'email' })
  if (error) throw error
  return data.user
}

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
export async function makeNonce(cryptoImpl = globalThis.crypto) {
  const raw = hex(cryptoImpl.getRandomValues(new Uint8Array(32)))
  const hashed = hex(await cryptoImpl.subtle.digest('SHA-256', new TextEncoder().encode(raw)))
  return { raw, hashed }
}

// Apple ile giriş (yalnız iPhone uygulaması). Apple'a özetlenmiş nonce, Supabase'e ham nonce gider.
export async function signInWithApple(plugin = null) {
  const P = plugin ?? (await import('@capacitor-community/apple-sign-in')).SignInWithApple
  const nonce = await makeNonce()
  const { response } = await P.authorize({ clientId: APPLE_CLIENT_ID, redirectURI: `${SUPABASE_URL}/auth/v1/callback`, scopes: 'email name', nonce: nonce.hashed })
  const { data, error } = await supabase().auth.signInWithIdToken({ provider: 'apple', token: response.identityToken, nonce: nonce.raw })
  if (error) throw error
  return { user: data.user, givenName: response.givenName ?? '' }
}

export async function currentUser() {
  const { data } = await supabase().auth.getSession()
  return data?.session?.user ?? null
}

export async function signOut() {
  await supabase().auth.signOut({ scope: 'local' })
}

export async function deleteAccount() {
  const { error } = await supabase().rpc('delete_my_account')
  if (error) throw error
  await supabase().auth.signOut({ scope: 'local' })
}

export async function pullProfile(userId) {
  const { data, error } = await supabase().from('profiles').select('name, birth_date, city, correction, updated_at').eq('id', userId).maybeSingle()
  if (error) throw error
  return data ?? null
}

export async function pushProfile(userId, identity, correction) {
  const { error } = await supabase()
    .from('profiles')
    .upsert({ id: userId, ...profileToRow(identity, correction), updated_at: new Date().toISOString() })
  if (error) throw error
}

export const accountLabel = (a) => (a?.mode === 'apple' ? 'Apple' : a?.mode === 'email' ? (a.email ?? 'E-posta') : null)
export const signedIn = (a) => Boolean(a && (a.mode === 'apple' || a.mode === 'email') && a.userId)
