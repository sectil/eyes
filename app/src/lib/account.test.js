import { describe, it, expect, beforeEach } from 'vitest'
import { webcrypto } from 'node:crypto'
import { setSupabaseForTest, isSecretKey, SUPABASE_KEY } from './supabase.js'
import {
  normalizeEmail, validEmail, cleanCode, validCode, profileToRow, mergeProfile, friendlyError, errorDetail, makeNonce,
  sendEmailCode, verifyEmailCode, signInWithApple, pushProfile, pullProfile, deleteAccount, signedIn, accountLabel,
} from './account.js'

// Sahte Supabase istemcisi: çağrıları kaydeder
function fake(over = {}) {
  const calls = []
  const rec = (name, ret) => (...args) => { calls.push([name, ...args]); return Promise.resolve(ret) }
  const q = {
    select: (...a) => { calls.push(['select', ...a]); return q },
    eq: (...a) => { calls.push(['eq', ...a]); return q },
    maybeSingle: rec('maybeSingle', over.row ?? { data: null, error: null }),
    upsert: rec('upsert', { error: null }),
  }
  return {
    calls,
    auth: {
      signInWithOtp: rec('otp', { error: over.otpError ?? null }),
      verifyOtp: rec('verify', { data: { user: { id: 'u1' } }, error: over.verifyError ?? null }),
      signInWithIdToken: rec('idToken', { data: { user: { id: 'u2' } }, error: null }),
      signOut: rec('signOut', { error: null }),
      getSession: rec('session', { data: { session: null } }),
    },
    from: (t) => { calls.push(['from', t]); return q },
    rpc: rec('rpc', { error: null }),
  }
}

describe('hesap', () => {
  let c
  beforeEach(() => {
    c = fake()
    setSupabaseForTest(c)
  })
  it('uygulamadaki anahtar herkese açık türde; gizli anahtar reddedilir', () => {
    expect(isSecretKey(SUPABASE_KEY)).toBe(false)
    expect(SUPABASE_KEY.startsWith('sb_publishable_')).toBe(true)
    expect(isSecretKey('sb_secret_abc')).toBe(true)
  })
  it('e-posta ve kod doğrulama', () => {
    expect(normalizeEmail('  Ali@Posta.COM ')).toBe('ali@posta.com')
    expect(validEmail('ali@posta.com')).toBe(true)
    expect(validEmail('ali@posta')).toBe(false)
    expect(cleanCode('12 34-56')).toBe('123456')
    expect(validCode('12345')).toBe(false)
    expect(validCode('123456')).toBe(true)
    expect(validCode('12345678')).toBe(true)
  })
  it('profil satırı: fotoğraf gitmez, bilinmeyen gözlük boş', () => {
    const row = profileToRow({ name: ' Ayşe ', birthDate: '1990-05-14', city: 'izmir', avatar: { kind: 'photo', dataUrl: 'data:image/jpeg;base64,x' } }, 'distance')
    expect(row).toEqual({ name: 'Ayşe', birth_date: '1990-05-14', city: 'İzmir', correction: 'distance' })
    expect(profileToRow({}, 'xx').correction).toBeNull()
    expect(JSON.stringify(row)).not.toContain('data:image')
  })
  it('birleştirme: sunucuda dolu alan kazanır, boş alan cihazdan, fotoğraf cihazdan', () => {
    const local = { name: 'Ayşe', birthDate: null, city: 'Ankara', avatar: { kind: 'photo', dataUrl: 'data:image/jpeg;base64,x' } }
    const m = mergeProfile({ name: null, birth_date: '1990-05-14', city: 'İzmir', correction: 'reading' }, local, 'none')
    expect(m.identity.name).toBe('Ayşe')
    expect(m.identity.birthDate).toBe('1990-05-14')
    expect(m.identity.city).toBe('İzmir')
    expect(m.identity.avatar.kind).toBe('photo')
    expect(m.correction).toBe('reading')
    expect(mergeProfile(null, local, 'none').correction).toBe('none')
  })
  it('hata mesajları Türkçe; vazgeçme sessiz', () => {
    expect(friendlyError({ message: 'The operation couldn’t be completed. (com.apple.AuthenticationServices.AuthorizationError error 1001.)' })).toBeNull()
    expect(friendlyError({ status: 429, message: 'x' })).toMatch(/Çok sık/)
    // Bug 11: gerçek hata kodu görünür (teşhis)
    expect(friendlyError({ message: 'The operation couldn’t be completed. (com.apple.AuthenticationServices.AuthorizationError error 1000.)' })).toBe('Bir sorun çıktı (kod 1000). Biraz sonra yeniden dene.')
    expect(friendlyError({ message: 'bilinmeyen' })).toBe('Bir sorun çıktı. Biraz sonra yeniden dene.')
    expect(errorDetail({ code: 'UNIMPLEMENTED', message: '"SignInWithApple" plugin is not implemented on ios' })).toBe('UNIMPLEMENTED · "SignInWithApple" plugin is not implemented on ios')
    expect(errorDetail('x'.repeat(400)).length).toBe(180)
    expect(friendlyError({ message: 'Token has expired or is invalid' })).toMatch(/Kod yanlış/)
    expect(friendlyError({ message: 'Failed to fetch' })).toMatch(/İnternete/)
    expect(friendlyError({ message: 'Email address not authorized' })).toMatch(/açık değil/)
  })
  it('e-posta kodu: gönder ve doğrula', async () => {
    await sendEmailCode(' Ali@Posta.com ')
    expect(c.calls[0]).toEqual(['otp', { email: 'ali@posta.com', options: { shouldCreateUser: true } }])
    const u = await verifyEmailCode('ali@posta.com', '12 34 56')
    expect(u.id).toBe('u1')
    expect(c.calls[1]).toEqual(['verify', { email: 'ali@posta.com', token: '123456', type: 'email' }])
    setSupabaseForTest(fake({ verifyError: { message: 'Token has expired or is invalid' } }))
    await expect(verifyEmailCode('a@b.co', '000000')).rejects.toMatchObject({ message: /expired/ })
  })
  it('Apple: Apple’a özetlenmiş nonce, Supabase’e ham nonce', async () => {
    let sent = null
    const plugin = { authorize: async (o) => { sent = o; return { response: { identityToken: 'tok', givenName: 'Ayşe' } } } }
    const r = await signInWithApple(plugin)
    expect(r.user.id).toBe('u2')
    expect(r.givenName).toBe('Ayşe')
    const call = c.calls.find((x) => x[0] === 'idToken')[1]
    expect(call.provider).toBe('apple')
    expect(call.token).toBe('tok')
    const digest = Buffer.from(await webcrypto.subtle.digest('SHA-256', new TextEncoder().encode(call.nonce))).toString('hex')
    expect(sent.nonce).toBe(digest)
    expect(sent.clientId).toBe('com.sectil.eyelume')
  })
  it('nonce: 64 hex, her seferinde farklı', async () => {
    const a = await makeNonce()
    const b = await makeNonce()
    expect(a.raw).toMatch(/^[0-9a-f]{64}$/)
    expect(a.raw).not.toBe(b.raw)
  })
  it('profil: yaz, oku; hesap sil = rpc + çıkış', async () => {
    await pushProfile('u1', { name: 'Ayşe', birthDate: '1990-05-14', city: 'İzmir' }, 'none')
    const up = c.calls.find((x) => x[0] === 'upsert')[1]
    expect(up).toMatchObject({ id: 'u1', name: 'Ayşe', birth_date: '1990-05-14', city: 'İzmir', correction: 'none' })
    expect(await pullProfile('u1')).toBeNull()
    await deleteAccount()
    expect(c.calls.some((x) => x[0] === 'rpc' && x[1] === 'delete_my_account')).toBe(true)
    expect(c.calls.at(-1)[0]).toBe('signOut')
  })
  it('hesap durumu', () => {
    expect(signedIn({ mode: 'guest' })).toBe(false)
    expect(signedIn({ mode: 'apple', userId: 'u' })).toBe(true)
    expect(accountLabel({ mode: 'email', email: 'a@b.co' })).toBe('a@b.co')
  })
})
