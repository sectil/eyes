import { Dumbbell } from 'lucide-react'
import Routine from '../../screens/Routine.jsx'
import { SETS, PATH_GROUPS, todaySeconds, setDurationSec, formatMin } from '../../lib/routines.js'

export default {
  icon: Dumbbell,
  entries: () =>
    SETS.map((s) => ({ route: `routine-${s.id}`, title: `${s.title} set`, sub: `${s.steps.length} hareket · ${formatMin(setDurationSec(s))}`, color: s.color })),
  render(ctx, route) {
    const set = [...SETS, ...PATH_GROUPS].find((s) => `routine-${s.id}` === route)
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
