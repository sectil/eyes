// Dik Dur düzeneği: gerçek ekran (screens/DikDur.jsx), bellek içi depo. ?seen=1 güvenlik görüldü · ?theme=dark
// ?td=1 TrueDepth'li cihaz · ?cam=1 kamera soruldu ve açık · ?cal=1 iki duruş kayıtlı
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/onest'
import '@fontsource-variable/unbounded'
import '/src/styles.css'
import DikDur from '/src/screens/DikDur.jsx'
import { SAFETY_KEY } from '/src/lib/dikDur.js'
import { CAM_KEY, CALIB_KEY } from '/src/lib/postureSense.js'

const q = new URLSearchParams(location.search)
document.documentElement.dataset.theme = q.get('theme') || 'light'
const mem = new Map(q.get('seen') ? [[SAFETY_KEY, '1']] : [])
if (q.get('cam')) mem.set(CAM_KEY, JSON.stringify({ asked: true, on: true }))
if (q.get('cal')) mem.set(CALIB_KEY, JSON.stringify({ normal: { d: 400, p: 0 }, tall: { d: 425, p: 3 }, ok: true }))
const storage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)) }
const day = (d) => new Date(2026, 8, d, 10).toISOString()
const sessions = [{ type: 'dik-dur', date: day(29) }, { type: 'dik-dur', date: day(30) }, { type: 'dik-dur', date: new Date(2026, 9, 1, 10).toISOString() }, { type: 'dik-dur', date: new Date(2026, 9, 2, 10).toISOString() }, { type: 'dik-dur', date: new Date(2026, 9, 3, 9).toISOString() }]
createRoot(document.getElementById('root')).render(
  <DikDur trueDepth={Boolean(q.get('td'))} storage={storage} sessions={sessions} now={() => new Date(2026, 9, 3, 12)} onBack={() => {}} onFinish={() => {}} />,
)
