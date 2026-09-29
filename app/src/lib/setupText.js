// Kurulum yazıları (güvenlik, iris soruları, iris haritası, deneme) — dil başına tek nesne. Başka dil eklenince aynı
// anahtarlarla yeni nesne; ekranlarda gömülü yazı yok. Sayı/sıra içeren cümleler fonksiyon (her dil kendi sırasını kurar).
// Soru metinleri lib/profileQuestions.js'te (soruların tek yeri); uyarı işaretleri lib/profile.js RED_FLAGS.
import { STRESS_NOW, SELF_AGREE } from './profile.js'

const tr = {
  domains: { eye: 'Göz', focus: 'Dikkat', awareness: 'Farkındalık', calm: 'Sakinlik', self: 'Kendine yaklaşım', wellbeing: 'İyi oluş', body: 'Beden' },
  // İris hücresindeki değer (null: henüz dolmadı → later)
  cell: {
    eye: (v) => `${v} kırpma`,
    calm: (v) => (v === 0 ? 'Stres yok' : `${STRESS_NOW[v]} stres`),
    self: (v) => SELF_AGREE[v],
    wellbeing: (v) => `Uyku ${v}/10`,
    body: (v) => `${v} gün hareket`,
  },
  later: { eye: 'İlk Bakış\'ta', focus: 'ilk oyunda', awareness: 'ilk görevde', calm: 'soruda', self: 'soruda', wellbeing: 'soruda', body: 'soruda' },
  safety: {
    eyebrow: 'Başlamadan önce',
    // Kurulumda güvenlik bilgisi İlk Bakış'tan sonra gelir (karar 2026-09-29 (b)); Profilim → Sorularım 'eyebrow'la kalır
    setupEyebrow: 'Yola başlamadan önce',
    title: 'Bunlardan biri olursa göz doktoruna git',
    sub: 'Bunlar evde ölçülemez; uygulama değil, bir göz doktoru bakmalı.',
    note: 'Aniden başladıysa aynı gün bir göz doktoruna ya da acile git. Bu liste Bilgi sekmesinde de durur.',
    ok: 'Anladım, devam',
    infoTitle: 'Göz doktoruna git',
    infoSub: 'Bunlardan biri varsa uygulamayı bekleme; aniden başladıysa aynı gün git.',
    alertMore: 'Acil belirtiler',
  },
  q: {
    map: (n) => `İris haritan · ${n}/7`,
    count: (i, n) => `Soru ${i} / ${n}`,
    again: '28. günde aynı soruyu yeniden soracağım.',
    againRecheck: 'Başlangıçtaki cevabınla yan yana koyacağım.',
    done: 'Tamam',
    slide: 'Kaydırarak seç',
    ends: ['çok kötü', 'mükemmel'],
  },
  plan: {
    eyebrow: 'İris haritan',
    title: (name) => (name ? `${name}, gözünden başladık. 28. günde haritana yeniden bakacağız.` : 'Gözünden başladık. 28. günde haritana yeniden bakacağız.'),
    steps: [['Her gün', "~15 dk'lık yol"], ['5. gün', 'İlk rapor'], ['28. gün', 'Harita yeniden, yan yana']],
    honest: 'Tanı koymaz, tedavi etmez. Ölçer, değişimi gösterir, alışkanlık kurar.',
    cta: 'Planımı başlat',
    compareEyebrow: '28. gün',
    compareTitle: (name) => (name ? `${name}, haritan yan yana` : 'Haritan yan yana'),
    beforeShort: (v) => `önce: ${v}`,
    compareNote: 'Tek soruluk ölçekler kişi içinde karşılaştırma içindir; küçük farklar günlük oynama olabilir. Gelişim\'de her alanın ayrıntısı durur.',
    close: 'Ana sayfaya dön',
  },
  paywall: {
    eyebrow: 'Nefona Premium',
    trialTitle: (d) => `${d} gün ücretsiz, haritanın hepsi açık`,
    title: 'Haritanı doldurmaya devam et',
    purpose: 'Nefona gözünden başlar: gözünü, dikkatini, sakinliğini, bedenini ve kendine bakışını birlikte izler, değişimi gösterir, günlük alışkanlığa çevirir.',
    features: [['Günlük yol ve hatırlatmalar:', 'göz, dikkat, nefes, hareket'], ['İris haritası:', '7 alanda değişim gerçek mi'], ['Haftalık E testi:', 'sağ, sol ve iki göz']],
    trial: (remind, days) => [['Bugün', 'Her şey açılır'], [`${remind}. gün`, 'Bitmeden hatırlatırız'], [`${days}. gün`, 'İptal etmezsen plan başlar']],
  },
}

const TEXT = { tr }
export function setupText(lang = 'tr') {
  return TEXT[lang] ?? tr
}
