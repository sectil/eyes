// Okuma hızı testi (MNREAD tarzı, sesli okuma doğrulamalı).
import { lastOfType, isDue, doneToday } from '../../lib/today.js'

export default {
  id: 'reading',
  title: 'Okuma hızı',
  label: 'okuma hızı testi',
  ring: 'eye',
  kind: 'measure',
  gates: { rest: true, active: true },
  home: { section: 'measure', order: 30 },
  // Haftada bir: zamanı geldiyse plana girer, bugün yapıldıysa tamam görünür.
  today({ tests, now }) {
    if (doneToday(tests, 'reading', now)) return { title: 'Okuma hızı', minutes: 3, done: true }
    return isDue(lastOfType(tests, 'reading'), now) ? { title: 'Okuma hızı', minutes: 3, done: false } : null
  },
}
