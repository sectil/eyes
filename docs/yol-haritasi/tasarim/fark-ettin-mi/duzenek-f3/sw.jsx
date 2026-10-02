import { createRoot } from 'react-dom/client'
import '@fontsource-variable/onest'
import '@fontsource-variable/unbounded'
import '@fontsource-variable/jetbrains-mono'
import '/src/styles.css'
import '/src/styles/home.css' // IrisMark biçemi (uygulamada ana sayfayla yüklü)
import StreetWalk from '/src/screens/StreetWalk.jsx'
import { planRound, makeFrame, nextN } from '/src/lib/streetChange.js'
import { makeRecord } from '/src/lib/street.js'
import { optionText } from '/src/lib/streetText.js'

const q = new URLSearchParams(location.search)
const later = q.get('s') === 'sonraki'
const now = Date.now()
const DAY = 86400000
const sessions = []
if (later) {
  for (let d = 12; d >= 1; d--) {
    const t = new Date(now - d * DAY - 3 * 3600000)
    const p = planRound({ sessions, now: t, seed: 1000 + d })
    const changes = p.frames.map((f, i) => ({ n: p.startN, looks: 1 + (i % 2), found: true, kind: f.kind, obj: f.obj }))
    sessions.push(makeRecord({ street: p.street, countAnswer: p.street.counts[p.taskId], answers: p.questions.map((x) => ({ id: x.id, ok: true, saw: 'gordum' })), changes, seconds: 120 }, t))
  }
}
const seed = (now ^ Math.floor(Math.random() * 1e9)) >>> 0
const plan = planRound({ sessions, now: new Date(now), seed })
window.__sw = { plan, makeFrame, nextN, optionText }
createRoot(document.getElementById('root')).render(<StreetWalk sessions={sessions} onSave={() => {}} onExit={() => {}} />)
