// Okuma testi (MNREAD tarzı, sesli okuma doğrulamalı; eski adı "Okuma hızı"). Ana sonuç rahat okuduğun
// en küçük yazı (kritik yazı boyu). Ayrıntı: lib/reading.js, screens/ReadingTest.jsx.
import { lastOfType, isDue, doneToday } from '../../lib/today.js'

export default {
  id: 'reading',
  title: 'Okuma',
  label: 'okuma testi',
  ring: 'eye',
  kind: 'measure',
  gates: { eyeBudget: 'test' },
  home: { section: 'measure', order: 30 },
  // Haftada bir: zamanı geldiyse plana girer, bugün yapıldıysa tamam görünür.
  today({ tests, now }) {
    if (doneToday(tests, 'reading', now)) return { title: 'Okuma hızı', minutes: 3, done: true }
    return isDue(lastOfType(tests, 'reading'), now) ? { title: 'Okuma hızı', minutes: 3, done: false } : null
  },
}
