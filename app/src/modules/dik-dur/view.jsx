import { ChevronsUp } from 'lucide-react'
import DikDur from '../../screens/DikDur.jsx'

export default {
  icon: ChevronsUp, // Mola PersonStanding kullanıyor; Bildirimler listesinde karışmasın
  sub: () => 'Günde birkaç kez kısa bir dikleşme molası.', // metin-D1-onay.md §B "Alt"
  render: (ctx) => (
    <DikDur sessions={ctx.sessions} trueDepth={Boolean(ctx.native?.trueDepth)} remindField={ctx.remindField?.('dik-dur') ?? null} onBack={ctx.back} onFinish={(s) => { ctx.store.addSession(s); ctx.refresh(); ctx.go('home') }} />
  ),
}
