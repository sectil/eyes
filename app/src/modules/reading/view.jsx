import { BookText } from 'lucide-react'
import ReadingTest from '../../screens/ReadingTest.jsx'
import { lastOfType, isDue } from '../../lib/today.js'
import { usedTextIds, readingV1, readingV2, cpsOf, cpsText } from '../../lib/reading.js'

// Son okuma testindeki gözlük koşulu (yalnız yeni yöntem); yoksa görme testindeki seçim
const lastCorrection = (tests) =>
  readingV2(tests).at(-1)?.correction ?? tests.filter((t) => t.type === 'va-daily' || t.type === 'va-weekly').at(-1)?.correction ?? null

export default {
  icon: BookText,
  sub: () => 'Rahat okuduğun en küçük yazıyı bulur · ~3 dk',
  badge: (ctx) => (isDue(lastOfType(ctx.tests, 'reading')) ? 'Bu hafta' : null),
  // Ana sayfa "Ölçümlerin" kutucuğu (O10): büyük değer rahat boy; kıvrım rahat boydan, yukarısı daha küçük yazı.
  tile(ctx) {
    const v2 = readingV2(ctx.tests)
    const withCps = v2.filter((t) => cpsOf(t) != null)
    const last = v2.at(-1)
    if (!last) {
      return {
        label: 'Okuma',
        value: '—',
        sub: readingV1(ctx.tests).length ? 'yeni okuma testi bekliyor' : 'henüz ölçüm yok',
        route: 'reading',
      }
    }
    const prev = v2.at(-2)
    return {
      label: 'Okuma',
      value: <>{cpsText(last)}<small>rahat</small></>,
      sub: prev ? `önceki ${cpsText(prev)}` : 'ilk ölçüm',
      values: withCps.slice(-8).map(cpsOf),
      higherIsBetter: false,
      color: 'var(--lens)',
      route: 'progress',
    }
  },
  render(ctx) {
    const recent = usedTextIds(ctx.tests.filter((t) => t.type === 'reading').slice(-2))
    return (
      <ReadingTest
        {...ctx.common}
        tests={ctx.tests}
        recentTextIds={recent}
        lastCorrection={lastCorrection(ctx.tests)}
        onSave={(r) => {
          ctx.store.addTest(r)
          ctx.refresh()
        }}
        onDone={() => ctx.go('progress')}
      />
    )
  },
}

