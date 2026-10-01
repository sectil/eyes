import { Smile } from 'lucide-react'
import Who5 from '../../screens/Who5.jsx'

export default {
  icon: Smile,
  render: (ctx) => (
    <Who5
      sessions={ctx.sessions}
      onSave={(rec) => {
        ctx.store.addSession(rec)
        ctx.refresh()
      }}
      onClose={() => ctx.back()}
      onProgress={() => ctx.go('progress')}
    />
  ),
}
