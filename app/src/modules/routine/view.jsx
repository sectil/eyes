import { Dumbbell } from 'lucide-react'
import Routine from '../../screens/Routine.jsx'
import { SETS, todaySeconds } from '../../lib/routines.js'

export default {
  icon: Dumbbell,
  render(ctx, route) {
    const set = SETS.find((s) => `routine-${s.id}` === route)
    return (
      <Routine
        key={route}
        set={set}
        todaySec={todaySeconds(ctx.exercise)}
        trueDepth={ctx.native.trueDepth}
        onBack={ctx.back}
        onFinish={(s) => { ctx.store.addSession(s); ctx.refresh(); ctx.go('home') }}
      />
    )
  },
}
