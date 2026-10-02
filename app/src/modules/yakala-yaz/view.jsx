import { Zap } from 'lucide-react'
import YakalaYaz from '../../screens/YakalaYaz.jsx'
import { isYakala } from '../../lib/yakalaYaz.js'

// Yoldan mı açıldı (bildirim PLAN.v1 §A.2: yolun içinde açılan modülde "Bana hatırlat" kartı çıkmaz)
const inPathOf = (ctx) => Boolean(ctx?.fromPath)
const lastOf = (ctx) => (ctx.sessions ?? []).filter(isYakala).at(-1)

export default {
  icon: Zap,
  // METINLER G1 ("Yakala Yaz · 2 dk") ve GE2'nin süre parçası
  sub: (ctx) => {
    const last = lastOf(ctx)
    return last ? `${last.thresholdMs} ms · 2 dk` : 'İki kelime, bir an. · 2 dk'
  },
  badge: (ctx) => {
    const last = lastOf(ctx)
    return last ? `${last.thresholdMs} ms` : null
  },
  render: (ctx) => (
    <YakalaYaz
      sessions={ctx.sessions}
      onSave={(s) => { ctx.store.addSession(s); ctx.refresh() }}
      onExit={() => ctx.go('home')}
      remindField={ctx.remindField?.('yakala-yaz', { inPath: inPathOf(ctx) }) ?? null}
    />
  ),
}
