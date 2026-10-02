import { Eye } from 'lucide-react'
import NoticeTask from '../../screens/NoticeTask.jsx'
import { promptFor, weekDays } from '../../lib/notice.js'

export default {
  icon: Eye,
  sub: () => promptFor().text,
  badge: (ctx) => {
    const d = weekDays(ctx.sessions)
    return d ? `${d}/7 gün` : null
  },
  render: (ctx) => <NoticeTask sessions={ctx.sessions} onBack={() => ctx.back()} onSave={(s) => { ctx.store.addSession(s); ctx.refresh() }} />,
}
