import { describe, it, expect } from 'vitest'
import { firstOpenStep, pendingLook, withPendingLook, afterLook, afterSetup } from './setupFlow.js'
import { INTRO_VERSION } from './intro.js'
import { normalizeProfile } from './profile.js'

// Karar 2026-09-29 ((b) ilk açılışta önce ölçüm): giriş → İlk Bakış → hesap → kurulum
const INTRO = { intro: { seen: true, version: INTRO_VERSION } }
const LOOK = { blinks: 6, seconds: 20, method: 'truedepth', date: '2026-09-29T10:00:00.000Z' }
const ACCOUNT = { account: { mode: 'guest', date: '2026-09-29T10:01:00.000Z' } }
const SCREENING = { screening: { flags: [] } }

describe('ilk açılış sırası', () => {
  it('yeni kullanıcı: giriş ekranı, sonra İlk Bakış (hesaptan önce)', () => {
    expect(firstOpenStep({})).toBe('intro')
    expect(firstOpenStep({ ...INTRO })).toBe('look')
  })
  it('İlk Bakış bitti: hesap; uygulama kapatılıp açılınca da sonuç korunur ve hesaptan devam edilir', () => {
    const s = { ...INTRO, firstLookPending: LOOK }
    expect(firstOpenStep(s)).toBe('account')
    // depodan yeniden okunmuş gibi (JSON gidiş-dönüş)
    expect(firstOpenStep(JSON.parse(JSON.stringify(s)))).toBe('account')
  })
  it('kamerasız sayan (method self) da İlk Bakış\'ı bitirmiş sayılır', () => {
    expect(firstOpenStep({ ...INTRO, firstLookPending: { ...LOOK, method: 'self' } })).toBe('account')
  })
  it('hesap da tamam: kurulum (güvenlik bilgisi ve sorular)', () => {
    expect(firstOpenStep({ ...INTRO, ...ACCOUNT, firstLookPending: LOOK })).toBe('onboarding')
  })
  it('kurulumun ortasında güncelleyen (hesap var, İlk Bakış yok): önce İlk Bakış, sonra kurulum', () => {
    expect(firstOpenStep({ ...INTRO, ...ACCOUNT })).toBe('look')
    expect(firstOpenStep({ ...INTRO, ...ACCOUNT, firstLookPending: LOOK })).toBe('onboarding')
  })
  it('kurulumu bitmiş kullanıcı bu sırayı görmez (İlk Bakış sonucu olmasa da)', () => {
    expect(firstOpenStep({ ...INTRO, ...ACCOUNT, ...SCREENING })).toBeNull()
    expect(firstOpenStep({ ...INTRO, ...ACCOUNT, ...SCREENING, profile: { firstLook: LOOK } })).toBeNull()
  })
  it('yeni giriş ekranı sürümü çıkınca eski kullanıcı yine önce giriş ekranını görür (değişmedi)', () => {
    expect(firstOpenStep({ intro: { seen: true, version: INTRO_VERSION - 1 }, ...ACCOUNT, ...SCREENING })).toBe('intro')
  })
  it('bekleyen sonuç kurulumun başlangıç profiline girer; profildeki sonuç ezilmez', () => {
    expect(pendingLook({ firstLookPending: LOOK })).toEqual(LOOK)
    const p = withPendingLook({ flags: [] }, { firstLookPending: LOOK })
    expect(normalizeProfile(p).firstLook).toEqual(LOOK)
    const own = { ...LOOK, blinks: 9 }
    expect(withPendingLook({ firstLook: own }, { firstLookPending: LOOK }).firstLook).toEqual(own)
    expect(withPendingLook({ flags: [] }, {})).toEqual({ flags: [] })
    expect(normalizeProfile(withPendingLook({}, { firstLookPending: { ...LOOK, method: 'self' } })).firstLook.method).toBe('self')
  })
})

// Doğrulama 2026-09-29: kayda yazma ve silme de sınanır (App.jsx bunları store.setSetting ile uygular)
describe('ilk açılış: kayıt akışı', () => {
  it('İlk Bakış sonucu yazılır, hesaba geçilir; kurulum bitince bekleyen kayıt silinir ve sıra biter', () => {
    let s = { ...INTRO }
    const apply = (upd) => { s = { ...s, ...upd } }
    expect(firstOpenStep(s)).toBe('look')
    apply(afterLook(LOOK))
    expect(s.firstLookPending).toEqual(LOOK)
    expect(firstOpenStep(JSON.parse(JSON.stringify(s)))).toBe('account') // kapatıp açınca da
    apply(ACCOUNT)
    expect(firstOpenStep(s)).toBe('onboarding')
    const profile = withPendingLook({}, s)
    expect(profile.firstLook).toEqual(LOOK)
    apply(afterSetup())
    apply({ profile, ...SCREENING })
    expect(s.firstLookPending).toBeNull()
    expect(firstOpenStep(s)).toBeNull()
  })
})
