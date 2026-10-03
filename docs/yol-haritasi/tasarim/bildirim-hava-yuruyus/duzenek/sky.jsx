// Hava sayfası (B2) düzeneği: önbellekte 24 saatlik sahte tahmin, çevrimdışı (istek yok). ?theme=dark
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/onest'
import '@fontsource-variable/unbounded'
import '/src/styles.css'
import Sky from '/src/screens/Sky.jsx'
import { SKY_CACHE_KEY } from '/src/lib/sky.js'

const q = new URLSearchParams(location.search)
document.documentElement.dataset.theme = q.get('theme') || 'light'
const now = new Date(2026, 9, 3, 9, 20)
const H = 3600000
const h0 = new Date(now).setMinutes(0, 0, 0)
const hours = Array.from({ length: 30 }, (_, i) => ({ at: h0 + i * H, tempC: 16 + Math.round(5 * Math.sin((i - 2) / 4)), feelsC: 17, precipChance: i >= 9 && i <= 12 ? 0.6 : 0.05, symbol: i >= 9 && i <= 12 ? 'cloud.rain' : 'sun.max' }))
const data = { fetchedAt: now.getTime(), now: { at: now.getTime(), tempC: 16, feelsC: 17, symbol: 'sun.max' }, hours, days: [{ date: '2026-10-03', highC: 21, lowC: 12 }] }
const mem = new Map([[SKY_CACHE_KEY, JSON.stringify({ at: now.toISOString(), data })]])
const storage = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) }
const plugin = { isAvailable: async () => ({ available: true, iosMajor: 26 }), attribution: async () => ({}) }
createRoot(document.getElementById('root')).render(
  <Sky place={{ il: 'İzmir', ilce: 'Bornova' }} onBack={() => {}} onChange={() => {}} deps={{ plugin, native: true, online: false, now: () => now, storage }} />,
)
