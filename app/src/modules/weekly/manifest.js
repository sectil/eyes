// Haftalık E testi: sağ göz, sol göz ve iki göz birlikte (üç bölüm).
import { weeklyStatus, WEEKLY_DONE } from '../../lib/today.js'

export default {
  id: 'weekly',
  // Ad yolda, ödeme ekranında ve sürüm notunda da "Haftalık E testi" (inceleme 2026-09-29: dört farklı ad vardı).
  // Ses paketinde kayıtlı cümle değil.
  title: 'Haftalık E testi',
  label: 'haftalık E testi',
  ring: 'eye',
  kind: 'measure',
  // Gelişim 2.0: bu modülün kişinin takibine katkısı (registry.js progress sözleşmesi)
  progress: { domain: 'eye' }, // görme keskinliği lib/progress.js eyeCard (trend.js) ile
  gates: { eyeBudget: 'test' },
  ask: { after: ['lastExam'] },
  home: { section: 'measure', order: 10 },
  // Bugün kartı (E0, karar S3): "tamam" = aynı gün sağ, sol ve iki göz kaydı. Yarım günde kart kalan gözleri söyler
  // ve zamanı gelmemiş olsa da yolda kalır (biten göz kaydedildi, kalanlar Bugün'de bekler); ertesi gün test
  // baştan açılır. Zamanı: son TAM haftalık koşu gününden 7 takvim günü geçtiyse (lib/today.js weeklyStatus, Bug 24).
  // minutes: yol bütçesi için tahmin (cihazda ölçülmedi; S2 ile test uzadı): kartta süre yazılmaz (hideMinutes).
  // Bitince kartta "✓ Bu hafta tamam" (doneSub).
  today({ tests, now }) {
    const w = weeklyStatus(tests, now)
    if (w.state === 'idle') return null
    const stop = { title: 'Haftalık E testi', sub: w.sub, minutes: 5, hideMinutes: true, slot: 'test', glyph: 'E' }
    if (w.state === 'done') return { ...stop, done: true, doneSub: WEEKLY_DONE }
    if (w.state === 'half') return { ...stop, done: false, remaining: w.remaining, warn: true }
    return { ...stop, done: false }
  },
  // Nef (registry.js `nef` sözleşmesi; ad sahip onaylı 2026-10-01): ad çekimleri, genel anlar, kanıt, tanıtım satırı.
  // VARSAYIM: kanıt Gelişim'in Göz alanı kaynaklarından (components/ProgressOverview.jsx SOURCES_OF.eye). Kayıtları tests
  // deposunda: Nef oradan okur (records). Yalnız sayısız ilk kayıt ve uzun ara; görme sonucu söylenmez (sahip kararı
  // 2026-10-01).
  nef: {
    name: { tr: { '': 'haftalık E testi', ABL: 'haftalık E testinden', ACC: 'haftalık E testini', LOC: 'haftalık E testinde', DAT: 'haftalık E testine', INS: 'haftalık E testiyle', POSS: 'haftalık E testin', 'POSS-ABL': 'haftalık E testinden' } },
    records: { store: 'tests', match: (t) => t?.type === 'va-weekly' },
    moments: ['firstTime', 'returnAfterGap'],
    evidence: ['han2019', 'rosser2003'],
    note: 'Haftalık E testi (sağ, sol, iki göz). Görme sonucu Nef anlarına girmez.',
  },
}
