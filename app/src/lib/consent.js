// KVKK açık rıza kayıtları (tasarım: Artifact "Nefona Bugün ve Profil"). settings.consents[key] =
// { granted, date, version }. Her amaç ayrı izin; önceden işaretli kutu yok; "Şimdi değil" hiçbir özelliği kapatmaz.
// Metin sürümü değişirse (CONSENT_VERSIONS[key]) izin vermiş kişiye yeniden sorulur; reddetmiş kişiye tekrar sorulmaz
// (Profilim → İzinlerim'den kendisi açabilir). Eski sürüme izin vermiş kişinin yeni metne "Şimdi değil" demesi eski
// izni geri çekmez (recordDecline): eski amaç değişmedi, yalnız yeni amaçlar açılmaz; bir daha sorulmaz.
// NOT: Bu metinler hukukçu onayından geçmedi; veri sorumlusu bilgisi aydınlatma metnine eklenecek.
export const CONSENT_VERSION = 1 // geri uyum: CONSENT_VERSIONS'ta olmayan anahtarın sürümü

// Sürüm rıza başına tutulur: tek sürümü artırmak bütün rızaları birden geçersiz kılardı.
// health 2: "Neden" satırına yürüyüş hatırlatması ve hatırlatmanın işe yarayıp yaramadığını gösterme eklendi.
// health v1 izni ("yan yana göstermek") okumaya ve göstermeye yeter (App hasConsent(…, 'health', 1)); yürüyüş
// hatırlatması ve onun ölçümü v2 ister.
export const CONSENT_VERSIONS = { profileSync: 1, health: 2, coach: 1, coachLife: 1 }

const versionOf = (key) => CONSENT_VERSIONS[key] ?? CONSENT_VERSION

const HEALTH_FACTS = [
  ['Ne', "Adım, yürüme mesafesi, egzersiz dakikası (Apple Sağlık'tan, yalnızca okuma). Yürüyüş hatırlatması açıksa bugünkü adım toplamın uygulama kapalıyken de okunur"],
  ['Neden', 'Hareketini göz çalışmalarınla yan yana göstermek; istersen adımın düşük olduğu günlerde yürüyüş hatırlatması ve hatırlatmanın işine yarayıp yaramadığını bu telefonda sana göstermek'],
  ['Nerede', "Yalnızca bu telefonda. Sunucuya ve Nef'e gitmez"],
  ['Ne kadar', 'İznini geri çekene kadar; geri çekince Nefona bu verileri okumaz'],
]
const HEALTH_CHECK = 'Hareket verilerimin (sağlık verisi) yukarıdaki amaçla, yalnızca bu telefonda işlenmesine açık rıza veriyorum.'

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
  // "Ne": yürüyüş koruması (HealthPlugin.swift WalkGuard) uygulama kapalıyken de bugünün adım toplamını okur.
  health: {
    title: 'Hareketini de görelim mi?',
    lead: 'İstersen adımlarını göz çalışmalarınla yan yana gösteririz. İzin vermesen de her şey açık kalır.',
    facts: HEALTH_FACTS,
    check: HEALTH_CHECK,
  },
  // Aynı rıza, eski metne (v1) izin vermiş kişiye: neden yeniden sorulduğu ve "Şimdi değil"in neyi değiştirmediği.
  // Kayıt yine 'health' anahtarına yazılır (ConsentSheet kind 'healthUpdate'; ret → recordDecline).
  healthUpdate: {
    title: 'Hareket izninin metni güncellendi',
    lead: 'Yürüyüş hatırlatması ve hatırlatmanın işine yarayıp yaramadığını gösterme eklendi; bu yüzden yeniden soruyoruz. "Şimdi değil" dersen adımların yine görünür, yalnız yürüyüş hatırlatması açılmaz.',
    facts: HEALTH_FACTS,
    check: HEALTH_CHECK,
  },
  // Nef göz koçu: iki ayrı amaç, iki ayrı kayıt (CoachConsent iki işaretsiz kutu; coachLife sonradan İzinlerim'den
  // ConsentSheet ile). "Ne" listesi lib/coach.js buildSignals + modül coach() özetleriyle birebir tutulmalı.
  // Görme ölçümü ve nefes öncesi/sonrası sakinlik farkı sağlığa ilişkin veri sayılır (KVKK md. 6).
  // Sunucu (api/coach.js) içeriği kaydetmez; sağlayıcıların saklama süresi ve yurt dışı aktarım dayanağı hukukçuya
  // doğrulatılacak (docs/yol-haritasi/YAPILACAKLAR.md).
  coach: {
    title: 'Nef sana her gün bir öneri yazsın mı?',
    lead: "Karar senin. Kapalıyken Nef'e hiçbir veri gitmez; uygulamanın geri kalanı aynen çalışır.",
    facts: [
      ['Ne', 'Son 7 günün özetleri: çalışma günü, dakika ve seri; görme ölçümü ortancası, başlangıçtan farkı ve uyarı düzeyi; okuma hızı; oyun ve egzersiz puanları (nefes öncesi/sonrası sakinlik farkı dahil); günün saati. Kamera görüntüsü, adın, e-postan ya da cihaz kimliğin gitmez'],
      ['Neden', "Nef'in sana günlük tek bir içgörü ve öneri yazması (tıbbi tavsiye değildir)"],
      ['Nerede', 'Yurt dışında: sunucumuz (Vercel) ve OpenRouter üzerinden bir yapay zekâ modeli · şifreli bağlantı'],
      ['Ne kadar', "Sunucumuz içeriği kaydetmez. Nef'i kapattığın an gönderim durur"],
    ],
    check: 'Bu özetlerin (görme ölçümü sağlığa ilişkin veridir) yukarıdaki amaçla yurt dışına aktarılmasına açık rıza veriyorum.',
  },
  coachLife: {
    title: "Profil cevapların da Nef'e gitsin mi?",
    lead: 'İsteğe bağlı. İzin vermesen de Nef çalışır; yalnızca öneriler uykunu ve ekran süreni hesaba katmaz.',
    facts: [
      ['Ne', 'Profil sorularına verdiğin cevapların özeti: uyku puanı, günlük ekran süresi, gece telefona bakma sıklığı, stres puanı'],
      ['Neden', "Nef'in önerisini günlük hayatına göre yazması"],
      ['Nerede', 'Yurt dışında: sunucumuz (Vercel) ve OpenRouter üzerinden bir yapay zekâ modeli · şifreli bağlantı'],
      ['Ne kadar', 'Sunucumuz içeriği kaydetmez. İznini geri çektiğin an gönderim durur'],
    ],
    check: 'Profil cevaplarımın özetinin (uyku puanı, günlük ekran süresi, gece telefona bakma sıklığı, stres puanı; sağlığa ilişkin veri) de aynı amaçla yurt dışına aktarılmasına açık rıza veriyorum.',
  },
}

// Nef ancak kayıtlı açık rızayla konuşur: tercih (prefs.coach) tek başına yetmez. Eski sürümler rıza
// sormadan ya da iki amacı tek dokunuşla açabiliyordu; o kayıtlar burada "kapalı" sayılır.
export function coachAllowed(prefs, consents) {
  const on = Boolean(prefs?.coach) && hasConsent(consents, 'coach')
  return { on, life: on && Boolean(prefs?.coachLife) && hasConsent(consents, 'coachLife') }
}

export function consentOf(consents, key) {
  const c = consents?.[key]
  return c && typeof c === 'object' && typeof c.granted === 'boolean' ? c : null
}

export function hasConsent(consents, key, version = versionOf(key)) {
  const c = consentOf(consents, key)
  return Boolean(c?.granted && (c.version ?? 0) >= version)
}

// Hiç sorulmadıysa ya da verilmiş iznin metni eskidiyse (ve güncel metin reddedilmediyse) sor
export function shouldAsk(consents, key, version = versionOf(key)) {
  const c = consentOf(consents, key)
  return !c || (c.granted && (c.version ?? 0) < version && !((c.declined ?? 0) >= version))
}

export function recordConsent(consents, key, granted, now = new Date(), version = versionOf(key)) {
  return { ...(consents ?? {}), [key]: { granted: Boolean(granted), date: now.toISOString(), version } }
}

// Eski sürüme izin vermiş kişi güncel metne "Şimdi değil" dedi: eski izin (granted, version) aynen kalır, yalnız bu
// sürümün reddedildiği yazılır (declined, declinedAt) → bir daha sorulmaz, yeni amaçlar kapalı kalır. Kayıtlı izin
// yoksa ya da zaten güncelse düz ret kaydıdır (recordConsent false).
export function recordDecline(consents, key, now = new Date(), version = versionOf(key)) {
  const c = consentOf(consents, key)
  if (!c?.granted || (c.version ?? 0) >= version) return recordConsent(consents, key, false, now, version)
  return { ...(consents ?? {}), [key]: { ...c, declined: version, declinedAt: now.toISOString() } }
}
