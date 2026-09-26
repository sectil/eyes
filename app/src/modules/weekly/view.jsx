import { ScanEye } from 'lucide-react'
import AcuityTest from '../../screens/AcuityTest.jsx'

// Önceki görme testindeki gözlük/lens seçimi (aynı koşulda ölçüm hatırlatması)
const lastCorrection = (tests) => tests.filter((t) => t.type === 'va-daily' || t.type === 'va-weekly').at(-1)?.correction ?? null
import { lastOfType, isDue } from '../../lib/today.js'

export default {
  icon: ScanEye,
  sub: () => 'İki göz ayrı ve birlikte · ~5 dk',
  badge: (ctx) => (isDue(lastOfType(ctx.tests, 'va-weekly')) ? 'Bu hafta' : null),
  render: (ctx) => <AcuityTest key="weekly" plan="weekly" {...ctx.common} lastCorrection={lastCorrection(ctx.tests)} onFinish={ctx.saveTests} />,
}
