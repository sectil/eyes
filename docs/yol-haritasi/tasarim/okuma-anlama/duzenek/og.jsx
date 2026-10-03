// Okurken göz (deneme) düzeneği: yüz takibi og-face.js'ten (vite.config.mjs og-face eklentisi)
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/onest'
import '@fontsource-variable/unbounded'
import '/src/styles.css'
import OkuGozDeneme from '/src/screens/OkuGozDeneme.jsx'

const q = new URLSearchParams(location.search)
document.documentElement.dataset.theme = q.get('theme') || 'light'
const mem = new Map([['okumaAnlama.seed', 'kapi-1']])
const storage = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) }
createRoot(document.getElementById('root')).render(<OkuGozDeneme sessions={[]} storage={storage} trueDepth={q.get('td') !== '0'} onExit={() => {}} />)
