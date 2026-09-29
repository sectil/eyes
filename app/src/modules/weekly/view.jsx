import { useRef, useState } from 'react'
import { ScanEye } from 'lucide-react'
import AcuityTest from '../../screens/AcuityTest.jsx'
import { weeklyStatus } from '../../lib/today.js'
import { acuityStart, createEyeSaver } from '../../lib/acuityStart.js'

// Test ekranı (kararlar S3, S4, S10). Başlangıç değerleri (atlanacak gözler, gözlük ön seçimi) açılışta bir kez
// hesaplanır: her göz kaydedilince tests değişir, ekran ortasında göz sırası ve seçim kaymasın. Biten göz hemen
// kaydedilir (onSaveEye); sondaki onFinish yalnız kaydedilmemiş gözleri yazar, sonra Gelişim açılır.
export function WeeklyRun({ ctx }) {
  const live = useRef(ctx)
  live.current = ctx
  const [start] = useState(() => acuityStart({ plan: 'weekly', tests: ctx.tests, settings: ctx.settings }))
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
  return <AcuityTest plan="weekly" {...ctx.common} {...start} onSaveEye={saver.save} onFinish={finish} />
}

export default {
  icon: ScanEye,
  // E0: "3 bölüm · sağ, sol, iki göz" · yarım gün "Kalan: Sol göz, İki göz" · bitince "✓ Bu hafta tamam"
  sub: (ctx) => weeklyStatus(ctx.tests).sub,
  badge: (ctx) => (weeklyStatus(ctx.tests).due ? 'Bu hafta' : null),
  render: (ctx) => <WeeklyRun key="weekly" ctx={ctx} />,
}
