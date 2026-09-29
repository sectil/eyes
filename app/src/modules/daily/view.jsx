import { useRef, useState } from 'react'
import { ScanEye } from 'lucide-react'
import AcuityTest from '../../screens/AcuityTest.jsx'
import { eyeDay, remainingText } from '../../lib/today.js'
import { acuityStart, createEyeSaver } from '../../lib/acuityStart.js'

// Test ekranı (kararlar S4, S10): başlangıç değerleri açılışta bir kez hesaplanır; biten göz hemen kaydedilir
// (onSaveEye), sondaki onFinish yalnız kaydedilmemiş gözleri yazar. Ayrıntı: modules/weekly/view.jsx.
export function DailyRun({ ctx }) {
  const live = useRef(ctx)
  live.current = ctx
  const [start] = useState(() => acuityStart({ plan: 'daily', tests: ctx.tests, settings: ctx.settings }))
  const [saver] = useState(() =>
    createEyeSaver((r) => {
      live.current.store.addTest(r)
      live.current.refresh()
    }),
  )
  const finish = (results) => {
    const rest = saver.finish(results)
    if (rest.length) live.current.saveTests(rest)
    else live.current.go('progress')
  }
  return <AcuityTest plan="daily" {...ctx.common} {...start} onSaveEye={saver.save} onFinish={finish} />
}

// Yarım gün (yalnız bir göz bitti): "Kalan: Sol göz"
const halfSub = (tests) => {
  const day = eyeDay(tests, 'va-daily')
  return day.started && !day.complete ? remainingText(day.remaining) : null
}

export default {
  icon: ScanEye,
  // Süre yazılmaz: cihazda ölçülmedi. İsteğe bağlı (karar 2026-09-29): yolda yok, her gün yapılması beklenmez.
  sub: (ctx) => halfSub(ctx.tests) ?? 'İsteğe bağlı · sağ + sol göz',
  render: (ctx) => <DailyRun key="daily" ctx={ctx} />,
}
