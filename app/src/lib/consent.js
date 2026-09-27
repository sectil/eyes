// KVKK açık rıza kayıtları (tasarım: Artifact "Nefona Bugün ve Profil"). settings.consents[key] =
// { granted, date, version }. Her amaç ayrı izin; önceden işaretli kutu yok; "Şimdi değil" hiçbir özelliği kapatmaz.
// Metin sürümü değişirse (CONSENT_VERSION) izin vermiş kişiye yeniden sorulur; reddetmiş kişiye tekrar sorulmaz
// (Profilim → İzinlerim'den kendisi açabilir).
// NOT: Bu metinler hukukçu onayından geçmedi; veri sorumlusu bilgisi aydınlatma metnine eklenecek.
export const CONSENT_VERSION = 1

export const CONSENTS = {
  profileSync: {
    title: 'Profilin başka telefonda da seninle olsun mu?',
    lead: 'Karar senin. İzin vermesen de uygulamanın tamamı açık kalır; bilgilerin yalnız bu telefonda durur.',
    facts: [
      ['Ne', 'Adın, doğum tarihin, şehrin, gözlük/lens bilgin (fotoğrafın değil)'],
      ['Neden', 'Yeni telefonda ya da yeniden kurulumda profilini geri getirmek'],
      ['Nerede', 'Supabase sunucusu, Frankfurt (Almanya) · şifreli bağlantı'],
      ['Ne kadar', 'İznini geri çekene ya da hesabını silene kadar'],
    ],
    check: 'Bu bilgilerimin yukarıdaki amaçla işlenmesine, yurt dışındaki sunucuda saklanmasına açık rıza veriyorum.',
  },
}

export function consentOf(consents, key) {
  const c = consents?.[key]
  return c && typeof c === 'object' && typeof c.granted === 'boolean' ? c : null
}

export function hasConsent(consents, key, version = CONSENT_VERSION) {
  const c = consentOf(consents, key)
  return Boolean(c?.granted && (c.version ?? 0) >= version)
}

// Hiç sorulmadıysa ya da verilmiş iznin metni eskidiyse sor
export function shouldAsk(consents, key, version = CONSENT_VERSION) {
  const c = consentOf(consents, key)
  return !c || (c.granted && (c.version ?? 0) < version)
}

export function recordConsent(consents, key, granted, now = new Date(), version = CONSENT_VERSION) {
  return { ...(consents ?? {}), [key]: { granted: Boolean(granted), date: now.toISOString(), version } }
}
