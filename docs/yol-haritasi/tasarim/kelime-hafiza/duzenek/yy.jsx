import { createRoot } from 'react-dom/client'
import '@fontsource-variable/onest'
import '@fontsource-variable/unbounded'
import '/src/styles.css'
import YakalaYaz from '/src/screens/YakalaYaz.jsx'
import { pickPairs } from '/src/lib/yakalaYazWords.js'

const q = new URLSearchParams(location.search)
document.documentElement.dataset.theme = q.get('theme') || 'light'
const KB = Number(q.get('kb') || 0)
// iOS klavyesi açıkken görünür alan (klavye simgesi düzenekte çizilir)
const vvH = innerHeight - KB
const vv = new EventTarget(); vv.height = vvH
Object.defineProperty(window, 'visualViewport', { value: vv })
window.__setVV = (h) => { vv.height = h; vv.dispatchEvent(new Event('resize')) } // klavye kapanınca
const now = new Date(2026, 9, 2, 10)
const DAY = 86400000
// Önceki 3 günün turları: grafik ve "Başlangıç · 4/8 gün"
const sessions = [3, 2, 1].map((d, i) => ({ type: 'yakala-yaz', date: new Date(now - d * DAY).toISOString(), thresholdMs: [250, 233, 217][i], thresholdStep: [7, 7, 8][i], trials: [] }))
window.__yy = { pairs: pickPairs({ seed: 'yakala-yaz', sessions, now }) }
// ?mic=ask: cihaz içi destekli telefon, ilk dokunuş (izin sayfası); ?mic=on: izin verilmiş
const M = q.get('mic')
const mic = M ? { ask: M === 'ask', setPref: () => {}, request: async () => true, start: async (cb, lv) => { window.__cb = cb; window.__lv = lv; return async () => {} } } : null
createRoot(document.getElementById('root')).render(<YakalaYaz sessions={sessions} now={now} onSave={() => {}} onExit={() => {}} mic={mic} />)
