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
// weather 1: B2 hava (rizalar-taslak.md, sahip onayı 2026-09-30 ve 2026-10-01 değişiklikleri; harfi harfine).
export const CONSENT_VERSIONS = { profileSync: 1, health: 2, coach: 1, coachLife: 1, weather: 1 }

const versionOf = (key) => CONSENT_VERSIONS[key] ?? CONSENT_VERSION

const HEALTH_FACTS = [
  ['Ne', "Adım, yürüme mesafesi, egzersiz dakikası (Apple Sağlık'tan, yalnızca okuma). Yürüyüş hatırlatması açıksa bugünkü adım toplamın uygulama kapalıyken de okunur"],
  ['Neden', 'Hareketini göz çalışmalarınla yan yana göstermek; istersen adımın düşük olduğu günlerde yürüyüş hatırlatması ve hatırlatmanın işine yarayıp yaramadığını bu telefonda sana göstermek'],
  ['Nerede', "Yalnızca bu telefonda. Sunucuya ve Nef'e gitmez"],
  ['Ne kadar', 'İznini geri çekene kadar; geri çekince Nefona bu verileri okumaz'],
]
const HEALTH_CHECK = 'Hareket verilerimin (sağlık verisi) yukarıdaki amaçla, yalnızca bu telefonda işlenmesine açık rıza veriyorum.'

export const CONSENTS = {
  // Metin sahibinin isteğiyle sadeleşti (27 Eylül: "cümleler anlaşılmıyor"). Kapsam aynı (ne, amaç, yer, süre), bu yüzden
  // sürüm artmadı; daha önce izin vermiş kişiye yeniden sorulmaz.
  profileSync: {
    title: 'Profilini hesabına kaydedelim mi?',
    lead: 'Kaydedersen telefonunu değiştirdiğinde ya da uygulamayı silip yeniden kurduğunda bilgilerin geri gelir. Kaydetmezsen hiçbir şey kapanmaz; bilgilerin yalnız bu telefonda kalır.',
    facts: [
      ['Ne kaydedilir?', 'Adın, doğum tarihin, şehrin ve gözlük/lens bilgin. Fotoğrafın kaydedilmez.'],
      ['Ne işe yarar?', 'Yeni telefonda ya da yeniden kurulumda bunları tekrar yazman gerekmez.'],
      ['Nerede durur?', "Supabase'in Almanya'daki (Frankfurt) sunucusunda. Oraya şifreli bağlantıyla gider."],
      ['Ne kadar kalır?', 'İzni geri çekene ya da hesabını silene kadar.'],
    ],
    check: "Adımın, doğum tarihimin, şehrimin ve gözlük bilgimin, profilimi geri getirmek için yurt dışındaki (Almanya) sunucuda saklanmasına izin veriyorum.",
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
// Hava (B2; docs/yol-haritasi/tasarim/bildirim-hava-yuruyus/rizalar-taslak.md `weather`, harfi harfine). Katmanlı rıza
// sayfasında (screens/SkyConsent.jsx) her satırın ilk cümlesi hep görünür, kalanı dokununca açılır; metin aynıdır.
// "Ne kadar kalır?"daki silme cümlesi kodda da uygulanır: lib/sky.js enforceWeatherConsent (açılışta).
// Rıza sayfası her zaman iOS konum izin penceresinden önce gelir (PLAN.v1 §5.5 madde 10).
  weather: {
    title: 'Bulunduğun yerin havasını da göstereyim mi?',
    lead: 'İstersen Ana sayfada hava ve yağmur saatini gösteririm. İzin vermesen de her şey açık kalır; il ve ilçeyi listeden de seçebilirsin.',
    facts: [
      ['Ne kaydedilir?', 'Yaklaşık konumun ya da seçtiğin il ve ilçenin merkezi. Telefonda yalnız il ve ilçe adı kalır. Konumunun kendisi saklanmaz.'],
      ['Ne işe yarar?', 'Hava, yağmur olasılığı ve istersen alarmdan sonra gelen sabah havası bildirimi.'],
      ['Nerede durur?', "Hava bilgisi için konum yuvarlanarak Apple'ın hava servisine (yurt dışı) gider. Sabah bildirimi yenilenirken yalnız seçtiğin yerin merkezi gider. Sunucumuza ve Nef'e gitmez."],
      ['Ne kadar kalır?', 'Telefonda il ve ilçe adı, hava önbelleği ve son 90 günün günlük hava özeti. İzin kapanınca ilk açılışta il ve ilçe adı, önbellek ve hava özeti silinir.'],
    ],
    check: 'Hava bilgisi için yaklaşık konumumun ya da seçtiğim yerin merkezinin yurt dışındaki Apple hava servisine gönderilmesine açık rıza veriyorum.',
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
