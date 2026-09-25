import { ScanEye } from 'lucide-react'
import AcuityTest from '../../screens/AcuityTest.jsx'

export default {
  icon: ScanEye,
  sub: () => 'İki göz ayrı ve birlikte · ~5 dk',
  render: (ctx) => <AcuityTest key="weekly" plan="weekly" {...ctx.common} onFinish={ctx.saveTests} />,
}
