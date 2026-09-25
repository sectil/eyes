import { ScanEye } from 'lucide-react'
import AcuityTest from '../../screens/AcuityTest.jsx'
import { lastOfType, isDue } from '../../lib/today.js'

export default {
  icon: ScanEye,
  sub: () => 'İki göz ayrı ve birlikte · ~5 dk',
  badge: (ctx) => (isDue(lastOfType(ctx.tests, 'va-weekly')) ? 'Bu hafta' : null),
  render: (ctx) => <AcuityTest key="weekly" plan="weekly" {...ctx.common} onFinish={ctx.saveTests} />,
}
