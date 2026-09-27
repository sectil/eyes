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
  // Apple Sağlık: hareket verisi sağlık verisidir (KVKK md. 6, özel nitelikli) → ayrı açık rıza.
  health: {
    title: 'Hareketini de görelim mi?',
    lead: 'İstersen adımlarını göz çalışmalarınla yan yana gösteririz. İzin vermesen de her şey açık kalır.',
    facts: [
      ['Ne', "Adım, yürüme mesafesi, egzersiz dakikası (Apple Sağlık'tan, yalnızca okuma)"],
      ['Neden', 'Hareketini göz çalışmalarınla yan yana göstermek; uzun süre kalkmadığında "2 dk yürü" hatırlatması'],
      ['Nerede', "Yalnızca bu telefonda. Sunucuya ve Nef'e gitmez"],
      ['Ne kadar', 'İznini geri çekene kadar; geri çekince Nefona bu verileri okumaz'],
    ],
    check: 'Hareket verilerimin (sağlık verisi) yukarıdaki amaçla, yalnızca bu telefonda işlenmesine açık rıza veriyorum.',
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
