import { Wind } from 'lucide-react'
import BreathCount from '../../screens/BreathCount.jsx'
import { SESSION_TYPE, isBreathCount, bcTrend } from '../../lib/breathCount.js'
import { lastOfType, isDue } from '../../lib/today.js'

const PHASE_SUB = {
  familiarization: 'alışma dönemi',
  baseline: 'başlangıç oluşuyor',
}

export default {
  icon: Wind,
  sub: () => 'Nefeslerini say, dikkatin nereye kaçtığını ölç · 3–5 dk',
  badge: (ctx) => (isDue(lastOfType(ctx.sessions, SESSION_TYPE)) ? 'Bu hafta' : null),
  // Ana sayfa "Ölçümlerin" kutucuğu
  tile(ctx) {
    const recs = ctx.sessions.filter(isBreathCount)
    const t = bcTrend(recs)
    if (!t.latest) return { label: 'Nefes sayma', value: '—', sub: 'henüz ölçüm yok', route: 'breath-count' }
    const sub = PHASE_SUB[t.phase] ?? (t.delta == null ? 'izleniyor' : t.delta > 0 ? `referansın ${t.delta} üstünde` : t.delta < 0 ? `referansın ${-t.delta} altında` : 'referansla aynı')
    return {
      label: 'Nefes sayma',
      value: `%${t.latest.accuracy}`,
      sub,
      values: recs.slice(-8).map((r) => r.accuracy),
      higherIsBetter: true,
      color: 'var(--iris-2)',
      route: 'progress',
    }
  },
  render: (ctx) => (
    <BreathCount
      sessions={ctx.sessions}
      onBack={ctx.back}
      onFinish={(s) => { ctx.store.addSession(s); ctx.refresh(); ctx.go('home') }}
    />
  ),
}
