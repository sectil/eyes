import { Footprints } from 'lucide-react'
import StreetWalk from '../../screens/StreetWalk.jsx'
import { isStreet } from '../../lib/street.js'

export default {
  icon: Footprints,
  sub: (ctx) => {
    const last = (ctx.sessions ?? []).filter(isStreet).at(-1)
    return last ? `Son tur fark ${last.noticed}/${last.asked} · ~1 dk` : 'Kalabalık caddede neyi fark ediyorsun? · ~1 dk'
  },
  badge: (ctx) => {
    const last = (ctx.sessions ?? []).filter(isStreet).at(-1)
    return last ? `${last.noticed}/${last.asked}` : null
  },
  render: (ctx) => (
    <StreetWalk
      sessions={ctx.sessions}
      onSave={(s) => { ctx.store.addSession(s); ctx.refresh() }}
      onExit={() => ctx.go('home')}
    />
  ),
}
