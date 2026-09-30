import { Dumbbell } from 'lucide-react'
import Routine from '../../screens/Routine.jsx'
import { SETS, PATH_GROUPS, todaySeconds, setDurationSec, formatMin } from '../../lib/routines.js'
import { pathCtx } from '../pathContext.js'
import { stagedSet } from './manifest.js'

// Ekranın seti. Yol grubu (SONSUZ_YOL.PLAN.v1 §3.A.6) yoldaki durağın basamağıyla aynı adımları ve çeşitleme yamasını
// alır; kayda stage, steps ve variant yazılır (screens/Routine.jsx routineRecord). İlerleme yoksa ya da grup bugünün
// yolunda değilse bugünkü PATH_GROUPS grubu açılır; setler (Hafif, Normal, Tam, Derin) değişmez.
export function routeSet(ctx = {}, route, now = new Date()) {
  const set = [...SETS, ...PATH_GROUPS].find((s) => `routine-${s.id}` === route) ?? null
  if (!set?.group) return set
  const c = pathCtx(ctx, now)
  if (!c.progression) return set
  try {
    return stagedSet(c, set.id) ?? set
  } catch {
    return set
  }
}

// Yoldan mı açıldı (bildirim PLAN.v1 §A.2 "Birim yoldur": yolun içinde açılan modülde "Bana hatırlat" kartı çıkmaz).
// Yol grupları (PATH_GROUPS; routine-<grup>) yalnız Bugünün yolundan açılır; setler (Hafif, Normal, Tam, Derin) bölümlerden.
export const inPathRoute = (route) => PATH_GROUPS.some((g) => `routine-${g.id}` === route)

export default {
  icon: Dumbbell,
  entries: () =>
    SETS.map((s) => ({ route: `routine-${s.id}`, title: `${s.title} set`, sub: `${s.steps.length} hareket · ${formatMin(setDurationSec(s))}`, color: s.color })),
  render(ctx, route) {
    const set = routeSet(ctx, route)
    return (
      <Routine
        key={route}
        set={set}
        todaySec={todaySeconds(ctx.exercise)}
        trueDepth={ctx.native.trueDepth}
        remindField={ctx.remindField?.(route, { inPath: inPathRoute(route) }) ?? null}
        onBack={ctx.back}
        onFinish={(s) => { ctx.store.addSession(s); ctx.refresh(); ctx.go('home') }}
      />
    )
  },
}
