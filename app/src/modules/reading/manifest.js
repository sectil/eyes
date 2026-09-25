// Okuma hızı testi (MNREAD tarzı, sesli okuma doğrulamalı).
import { lastOfType, isDue, doneToday } from '../../lib/today.js'

export default {
  id: 'reading',
  title: 'Okuma hızı',
  label: 'okuma hızı testi',
  ring: 'eye',
  kind: 'measure',
  gates: { eyeBudget: 'test' },
  home: { section: 'measure', order: 30 },
  // Haftada bir: zamanı geldiyse plana girer, bugün yapıldıysa tamam görünür.
  today({ tests, now }) {
    const stop = { title: 'Okuma', minutes: 3, slot: 'measure', glyph: 'lines' }
    if (doneToday(tests, 'reading', now)) return { ...stop, done: true }
    return isDue(lastOfType(tests, 'reading'), now) ? { ...stop, done: false } : null
  },
}
