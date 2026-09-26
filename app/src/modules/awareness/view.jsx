import { Sparkles } from 'lucide-react'
import Awareness from '../../screens/Awareness.jsx'

export default {
  icon: Sparkles,
  render: (ctx) => <Awareness sessions={ctx.sessions} settings={ctx.settings} native={ctx.native} onGo={ctx.go} onBack={() => ctx.go('home')} />,
}
