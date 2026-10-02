import { BookOpenText } from 'lucide-react'
import OkuAnla from '../../screens/OkuAnla.jsx'
import { isFinished } from '../../lib/okumaMeasure.js'

// Yoldan mı açıldı (bildirim PLAN.v1 §A.2 "Birim yoldur": yolun içinde açılan modülde "Bana hatırlat" kartı çıkmaz)
const inPathOf = (ctx) => Boolean(ctx?.fromPath)
const lastOf = (ctx) => (ctx.sessions ?? []).filter(isFinished).at(-1)

export default {
  icon: BookOpenText,
  sub: (ctx) => {
    const last = lastOf(ctx)
    return last ? `${Number.isFinite(last.wpm) ? `${last.wpm} kelime/dk · ` : ''}${last.correct}/4 · 2 dk` : 'Bilimden kısa, şaşırtıcı bir bulgu oku. · 2 dk'
  },
  badge: (ctx) => {
    const last = lastOf(ctx)
    return last ? `${last.correct}/4` : null
  },
  render: (ctx) => (
    <OkuAnla
      sessions={ctx.sessions}
      onSave={(s) => { ctx.store.addSession(s); ctx.refresh() }}
      onExit={() => ctx.go('home')}
      remindField={ctx.remindField?.('okuma-anlama', { inPath: inPathOf(ctx) }) ?? null}
    />
  ),
}
