import { createRoot } from 'react-dom/client'
import '@fontsource-variable/onest'
import '@fontsource-variable/unbounded'
import '/src/styles.css'
import OkuAnla from '/src/screens/OkuAnla.jsx'
import { todayText, questionSet } from '/src/lib/okumaSelect.js'

const q = new URLSearchParams(location.search)
document.documentElement.dataset.theme = q.get('theme') || 'light'
const DAY = 86400000
const now = Date.now()
// Sonuç satırı "5 okumayla belirlenir · 3/5" için iki önceki geçerli okuma (maketteki hâl)
const sessions = [2, 1].map((d) => ({ type: 'okuma-anlama', date: new Date(now - d * DAY).toISOString(), textId: d === 2 ? 'oa050' : 'oa051', cycle: 0, wpm: 220, correct: 4, valid: true, reason: null, fontScale: 1 }))
const mem = new Map([['okumaAnlama.seed', 'kapi-1']]) // oa001 "Yıldızlarla yol bulan böcek" ilk gelsin diye sabit tohum değil; metin tohumla seçilir
const storage = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) }
const t = todayText({ seed: 'kapi-1', sessions })
window.__oa = { qs: questionSet(t.text, t.cycle).map((x) => ({ soru: x.soru, right: x.options.find((o) => o.correct).text, wrong: x.options.find((o) => !o.correct).text })) }
createRoot(document.getElementById('root')).render(<OkuAnla sessions={sessions} storage={storage} onSave={() => {}} onExit={() => {}} />)
