import { Flower2 } from 'lucide-react'
import Yoga from './Yoga.jsx'
import manifest from './manifest.js'

// 'yoga': kütüphane (Pratikler kutucuğu). 'yoga-<ders>': ders ayrıntısı (Bugün'ün yolu); yoldan açılınca süre yolun
// süresiyle hazır gelir (stage.minutes; PLAN.v3 §B.5). Bir ders çalıyorsa ikisi de oynatıcıyı açar.
function pathMinutesFor(ctx, route) {
  const m = /^yoga-(\d+)$/.exec(route ?? '')
  if (!m) return null
  try {
    const stop = manifest.today({ tests: ctx.tests ?? [], sessions: ctx.sessions ?? [], now: new Date(), profile: ctx.settings?.profile })
    return stop?.stage?.lesson === Number(m[1]) ? stop.stage.minutes : null
  } catch {
    return null
  }
}

export default {
  icon: Flower2,
  render: (ctx, route) => (
    <Yoga
      key={route}
      route={route}
      sessions={ctx.sessions}
      profile={ctx.settings?.profile ?? null}
      store={ctx.store}
      onRefresh={ctx.refresh}
      onExit={() => ctx.go('home')}
      pathMinutes={pathMinutesFor(ctx, route)}
    />
  ),
}
