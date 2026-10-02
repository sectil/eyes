// İlk açılış sırası (karar 2026-09-29, YAPILACAKLAR "Sonsuz yol ve ilk 5 saniye" (b) "ilk açılışta önce ölçüm"):
// giriş ekranı → İlk Bakış (20 sn göz kırpma sayımı) → hesap → kurulum (güvenlik bilgisi → iris soruları). Sonrası
// (Seni tanıyalım, deneme, …) App.jsx'te. Önceki sıra (27 Eylül): giriş → hesap → güvenlik → İlk Bakış → sorular.
// İlk Bakış sonucu, sonuç ekranı açılır açılmaz settings.firstLookPending'e yazılır (uygulama sonuç ya da hesap ekranında
// kapansa da kaybolmaz; afterLook);
// kurulum onu ilk ekranından itibaren profile koyar (iris başlangıcı kırpma sayısını okur, lib/iris.js), kurulum
// bitince kayıt silinir (afterSetup). Kurulumu bitmiş (settings.screening) kişi bu sırayı hiç görmez.
import { shouldPlayIntro } from './intro.js'

// Kurulumda bekleyen İlk Bakış sonucu (ayrı kayıt ya da eski/yarım kalmış profil)
export const pendingLook = (settings = {}) => settings?.firstLookPending ?? settings?.profile?.firstLook ?? null

// Döner: 'intro' | 'look' | 'account' | 'onboarding' | null (ilk açılış bitti; App.jsx sonraki adımlara bakar)
export function firstOpenStep(settings = {}) {
  const s = settings ?? {}
  if (shouldPlayIntro(s)) return 'intro'
  if (!s.screening && !pendingLook(s)) return 'look'
  if (!s.account) return 'account'
  if (!s.screening) return 'onboarding'
  return null
}

// Ayarlara yazılacaklar (App.jsx store.setSetting ile uygular): İlk Bakış sonucu çıktı · kurulum bitti
export const afterLook = (look) => ({ firstLookPending: look })
export const afterSetup = () => ({ firstLookPending: null })

// Kurulumun başlangıç profili: bekleyen İlk Bakış sonucu profilde yoksa eklenir
export function withPendingLook(profile, settings = {}) {
  const look = settings?.firstLookPending ?? null
  if (!look || profile?.firstLook) return profile
  return { ...profile, firstLook: look }
}
