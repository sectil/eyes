import { AudioWaveform } from 'lucide-react'
import Dalga from '../../screens/Dalga.jsx'
import { isDalga, MODES } from '../../lib/dalga.js'

export default {
  icon: AudioWaveform,
  sub: (ctx) => {
    const last = (ctx.sessions ?? []).filter(isDalga).at(-1)
    return last ? `Son: ${MODES[last.mode]?.name ?? ''} · ${last.before}→${last.after}` : 'Sakin, güç ya da motivasyon · 3–10 dk ses'
  },
  render: (ctx) => (
    <Dalga
      sessions={ctx.sessions}
      onSave={(s) => { ctx.store.addSession(s); ctx.refresh() }}
      onExit={() => ctx.go('home')}
    />
  ),
}
