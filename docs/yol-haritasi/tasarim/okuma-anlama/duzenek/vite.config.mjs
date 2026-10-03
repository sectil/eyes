// Oku ve Anla çekim düzeneği (docs içinde; node_modules bağlantısını cek.sh kurar). Kök uygulama; düzenek sayfası /@fs/ ile.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const D = path.dirname(fileURLToPath(import.meta.url))
const APP = path.resolve(D, '../../../../..', 'app') // depo/app
// og.html (okurken göz denemesi): yüz takibi kancası yerine og-face.js (göz yanan kelimeyi izler gibi sayı üretir)
const ogFace = {
  name: 'og-face',
  enforce: 'pre',
  resolveId(id, importer) {
    if (importer?.endsWith('OkuGozDeneme.jsx') && id.endsWith('useFaceTracking.js')) return path.join(D, 'og-face.js')
    return null
  },
}
export default defineConfig({
  root: APP, base: '/', cacheDir: path.join(D, '.vite-cache'), plugins: [ogFace, react()],
  server: { host: '127.0.0.1', port: Number(process.env.PORT ?? 4388), strictPort: true, hmr: false, fs: { strict: true, allow: [APP, D] } },
  clearScreen: false,
})
