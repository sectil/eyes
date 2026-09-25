import { Crosshair } from 'lucide-react'
import TrackGame from '../../screens/TrackGame.jsx'
import { loadTrackBest, trackBestFromSessions } from '../../lib/track.js'

export default {
  icon: Crosshair,
  sub: (ctx) => (ctx.native.trueDepth ? 'Atlayan çemberi gözünle izle · tepki ölçülür' : 'Atlayan çemberi gözünle izle · ~40 sn'),
  badge: (ctx) => {
    const b = Math.max(loadTrackBest(), trackBestFromSessions(ctx.sessions))
    return b > 0 ? `En iyi ${b}` : null
  },
  render: (ctx) => (
    <TrackGame trueDepth={ctx.native.trueDepth} sessions={ctx.sessions} onExit={() => ctx.go('home')} onFinish={(s) => { ctx.store.addSession(s); ctx.refresh() }} />
  ),
}
