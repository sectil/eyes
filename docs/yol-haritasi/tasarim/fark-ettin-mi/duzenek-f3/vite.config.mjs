// Fark Ettin mi? F3 çekim düzeneği (yalnız scratchpad). Kök uygulama; düzenek sayfaları /@fs/ ile.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const APP = '/home/user/eyes/app'
const D = path.dirname(fileURLToPath(import.meta.url))
export default defineConfig({
  root: APP, base: '/', cacheDir: path.join(D, '.vite-cache'), plugins: [react()],
  server: { host: '127.0.0.1', port: Number(process.env.PORT ?? 4377), strictPort: true, hmr: false, watch: { ignored: ['**/*'] }, fs: { strict: true, allow: [APP, D] } },
  clearScreen: false,
})
