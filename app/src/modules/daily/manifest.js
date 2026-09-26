// Günlük görme testi ("E hangi yönde", ~3 dk). Kayıtları tests deposuna gider; Gelişim'de stats.js işler.
import { lastOfType, isDue, doneToday } from '../../lib/today.js'

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
  // Haftalık test bugün yapıldıysa ya da zamanı geldiyse ölçüm adımını o üstlenir.
  // VARSAYIM: haftalık zamanı gelmediyse günlük test her gün plandadır.
  today({ tests, now }) {
    if (doneToday(tests, 'va-weekly', now) || isDue(lastOfType(tests, 'va-weekly'), now)) return null
    return { title: 'E testi', sub: 'sağ + sol göz', minutes: 3, slot: 'test', glyph: 'E', done: doneToday(tests, 'va-daily', now) }
  },
}
