import { BookText } from 'lucide-react'
import ReadingTest from '../../screens/ReadingTest.jsx'

export default {
  icon: BookText,
  sub: () => 'Yazı küçüldükçe ne kadar hızlı okuyorsun · ~3 dk',
  render(ctx) {
    const recent = ctx.tests.filter((t) => t.type === 'reading').slice(-2).flatMap((t) => t.sentencesUsed ?? [])
    return <ReadingTest {...ctx.common} recentSentences={recent} onFinish={ctx.saveTests} />
  },
}
