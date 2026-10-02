import { Gamepad2 } from 'lucide-react'
import SnakeGame from '../../screens/SnakeGame.jsx'
import { loadBest, bestFromSessions, loadSnakeOpts } from '../../lib/snake.js'

export default {
  icon: Gamepad2,
  sub: (ctx) => (loadSnakeOpts(ctx.native.trueDepth).control === 'eyes' ? 'Gözünle yönlendir · klasik oyun' : 'Kaydırarak yönlendir · klasik oyun'),
  badge: (ctx) => {
    const b = Math.max(loadBest(), bestFromSessions(ctx.sessions))
    return b > 0 ? `En iyi ${b}` : null
  },
  // Oyun bitince ekranda kalır (sonuç + "Tekrar oyna"); her bitiş bir oturum olarak kaydedilir.
  render: (ctx) => (
    <SnakeGame trueDepth={ctx.native.trueDepth} onExit={() => ctx.go('home')} onFinish={(s) => { ctx.store.addSession(s); ctx.refresh() }} />
  ),
}
