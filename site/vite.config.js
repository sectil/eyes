import { defineConfig } from 'vite'
import { resolve } from 'node:path'

// Çok sayfalı statik site. Sayfalar kökteki .html dosyaları; ortak stil ve betik src/ altında.
// Geliştirme sunucusu bütün arayüzlerde dinler (Tailscale üzerinden başka cihazdan bakmak için): npm run dev.
const pages = ['index', 'nasil-calisir', 'moduller', 'bilim', 'gizlilik', 'kosullar', 'destek', 'yenilikler']

export default defineConfig({
  build: {
    rollupOptions: { input: Object.fromEntries(pages.map((p) => [p, resolve(__dirname, `${p}.html`)])) },
  },
})
