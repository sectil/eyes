import { ScanEye } from 'lucide-react'
import AcuityTest from '../../screens/AcuityTest.jsx'

// Önceki görme testindeki gözlük/lens seçimi (aynı koşulda ölçüm hatırlatması)
const lastCorrection = (tests) => tests.filter((t) => t.type === 'va-daily' || t.type === 'va-weekly').at(-1)?.correction ?? null

export default {
  icon: ScanEye,
  sub: () => '"E hangi yönde" · ~3 dk',
  render: (ctx) => <AcuityTest key="daily" plan="daily" {...ctx.common} lastCorrection={lastCorrection(ctx.tests)} onFinish={ctx.saveTests} />,
}
