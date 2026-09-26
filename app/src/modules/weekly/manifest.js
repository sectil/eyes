// Haftalık tam test (~5 dk): iki göz ayrı ayrı ve birlikte.
import { lastOfType, isDue, doneToday } from '../../lib/today.js'

export default {
  id: 'weekly',
  title: 'Haftalık tam test',
  label: 'haftalık tam test',
  ring: 'eye',
  kind: 'measure',
  // Gelişim 2.0: bu modülün kişinin takibine katkısı (registry.js progress sözleşmesi)
  progress: { domain: 'eye' }, // görme keskinliği lib/progress.js eyeCard (trend.js) ile
  gates: { eyeBudget: 'test' },
  ask: { after: ['lastExam'] },
  home: { section: 'measure', order: 10 },
  // Zamanı geldiyse (son haftalık testten 7 gün geçtiyse) bugünün ölçümü budur.
  today({ tests, now }) {
    const stop = { title: 'Haftalık E testi', sub: 'sağ, sol, iki göz', minutes: 5, slot: 'test', glyph: 'E' }
    if (doneToday(tests, 'va-weekly', now)) return { ...stop, done: true }
    return isDue(lastOfType(tests, 'va-weekly'), now) ? { ...stop, done: false } : null
  },
}
