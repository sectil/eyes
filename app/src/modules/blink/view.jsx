import { Eye } from 'lucide-react'
import BlinkExercise from '../../screens/BlinkExercise.jsx'

export default {
  icon: Eye,
  sub: () => 'Ekran başında göz konforu · ~2,5 dk',
  render: (ctx) => (
    <BlinkExercise trueDepth={ctx.native.trueDepth} onBack={ctx.back} onFinish={(s) => { ctx.store.addSession(s); ctx.refresh(); ctx.go('home') }} />
  ),
}
