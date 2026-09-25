import { Aperture } from 'lucide-react'
import TrackGame from '../../screens/TrackGame.jsx'
import { loadTrackBest, trackBestFromSessions } from '../../lib/track.js'

export default {
  icon: Aperture,
  sub: (ctx) => (ctx.native.trueDepth ? 'Parlayan merceği gözünle izle · kamera bakar' : 'Parlayan merceği gözünle izle · 1 dk'),
  badge: (ctx) => {
    const b = Math.max(loadTrackBest(), trackBestFromSessions(ctx.sessions))
    return b > 0 ? `En iyi ${b}` : null
  },
  render: (ctx) => (
    <TrackGame
      trueDepth={ctx.native.trueDepth}
      sessions={ctx.sessions}
      onExit={() => ctx.go('home')}
      onFinish={(s) => {
        ctx.store.addSession(s)
        ctx.refresh()
      }}
      // "Başım dönüyor": mola başladı (TrackGame beginRest('symptom')); App'in mola ekranı (hedefsiz)
      onRest={() => ctx.go('eye-rest')}
    />
  ),
}
