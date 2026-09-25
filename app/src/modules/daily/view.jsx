import { ScanEye } from 'lucide-react'
import AcuityTest from '../../screens/AcuityTest.jsx'

export default {
  icon: ScanEye,
  sub: () => '"E hangi yönde" · ~3 dk',
  render: (ctx) => <AcuityTest key="daily" plan="daily" {...ctx.common} onFinish={ctx.saveTests} />,
}
