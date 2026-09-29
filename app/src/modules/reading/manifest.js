// Okuma testi (MNREAD tarzı, sesli okuma doğrulamalı; eski adı "Okuma hızı"). Ana sonuç rahat okuduğun
// en küçük yazı (kritik yazı boyu). Ayrıntı: lib/reading.js, screens/ReadingTest.jsx.
import { readingStatus } from '../../lib/today.js'

export default {
  id: 'reading',
  title: 'Okuma',
  label: 'okuma testi',
  ring: 'eye',
  kind: 'measure',
  // Gelişim 2.0: bu modülün kişinin takibine katkısı (registry.js progress sözleşmesi)
  progress: { domain: 'eye' },
  gates: { eyeBudget: 'test' },
  ask: { before: ['correction'], after: ['nearDifficulty'] }, // gözlük testten önce, yakın zorluk sonuçtan sonra
  home: { section: 'measure', order: 30 },
  // Haftada bir, takvim günüyle; haftalık E testiyle aynı güne düşerse bir gün sonra (lib/today.js readingStatus,
  // karar 2026-09-29). Bugün yapıldıysa tamam görünür.
  today({ tests, sessions, now }) {
    const stop = { title: 'Okuma', minutes: 3, slot: 'measure', glyph: 'lines' }
    const s = readingStatus(tests, now, sessions)
    if (s.state === 'done') return { ...stop, done: true }
    return s.state === 'due' ? { ...stop, done: false } : null
  },
}
