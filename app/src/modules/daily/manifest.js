// Günlük görme testi ("E hangi yönde", sağ + sol göz). Kayıtları tests deposuna gider; Gelişim'de stats.js işler.
import { weeklyStatus, eyeDay, remainingText } from '../../lib/today.js'

export default {
  id: 'daily',
  title: 'Günlük test',
  label: 'günlük test',
  ring: 'eye',
  kind: 'measure',
  // Gelişim 2.0: bu modülün kişinin takibine katkısı (registry.js progress sözleşmesi)
  progress: { domain: 'eye' }, // görme keskinliği lib/progress.js eyeCard (trend.js) ile
  gates: { eyeBudget: 'test' },
  ask: { after: ['lastExam'] }, // ilk E testinden sonra son muayene
  home: { section: 'measure', order: 20 },
  // Haftalık test bugün yoldaysa (zamanı geldi, bugün yarım kaldı ya da bugün üç gözüyle bitti) ölçüm adımını o
  // üstlenir; yarım bir haftalık artık "yapıldı" sayılmaz (karar S3). VARSAYIM: haftalık zamanı gelmediyse günlük
  // test her gün plandadır. Günlük de her göz bitince kaydedilir (S4): "tamam" = bugün sağ ve sol göz; yalnız biri
  // varsa kart "Kalan: Sol göz" der.
  today({ tests, now }) {
    if (weeklyStatus(tests, now).state !== 'idle') return null
    const day = eyeDay(tests, 'va-daily', now)
    // minutes yalnız yol bütçesi tahmini (cihazda ölçülmedi): kartta yazılmaz
    const stop = { title: 'E testi', sub: 'sağ + sol göz', minutes: 3, hideMinutes: true, slot: 'test', glyph: 'E', done: day.complete }
    if (day.started && !day.complete) return { ...stop, sub: remainingText(day.remaining), remaining: day.remaining, warn: true }
    return stop
  },
}
