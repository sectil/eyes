// Dik Dur düzeneği: gerçek ekran (screens/DikDur.jsx), bellek içi depo. ?seen=1 güvenlik görüldü · ?theme=dark
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/onest'
import '@fontsource-variable/unbounded'
import '/src/styles.css'
import DikDur from '/src/screens/DikDur.jsx'
import { SAFETY_KEY } from '/src/lib/dikDur.js'

const q = new URLSearchParams(location.search)
document.documentElement.dataset.theme = q.get('theme') || 'light'
const mem = new Map(q.get('seen') ? [[SAFETY_KEY, '1']] : [])
const storage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)) }
const day = (d) => new Date(2026, 8, d, 10).toISOString()
const sessions = [{ type: 'dik-dur', date: day(29) }, { type: 'dik-dur', date: day(30) }, { type: 'dik-dur', date: new Date(2026, 9, 1, 10).toISOString() }, { type: 'dik-dur', date: new Date(2026, 9, 2, 10).toISOString() }, { type: 'dik-dur', date: new Date(2026, 9, 3, 9).toISOString() }]
createRoot(document.getElementById('root')).render(
  <DikDur storage={storage} sessions={sessions} now={() => new Date(2026, 9, 3, 12)} onBack={() => {}} onFinish={() => {}} />,
)
