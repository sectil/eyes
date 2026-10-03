// Bildirimler (B1a) çekim düzeneği (docs içinde; node_modules bağlantısını cek.sh kurar). Kök uygulama; düzenek sayfası /@fs/ ile.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const D = path.dirname(fileURLToPath(import.meta.url))
const APP = path.resolve(D, '../../../../..', 'app') // depo/app
export default defineConfig({
  root: APP, base: '/', cacheDir: path.join(D, '.vite-cache'), plugins: [react()],
  server: { host: '127.0.0.1', port: Number(process.env.PORT ?? 4391), strictPort: true, hmr: false, fs: { strict: true, allow: [APP, D] } },
  clearScreen: false,
})
