// Yılan ekran görüntüsü düzeneği. Kök app/; sayfa /@fs/ ile yüklenir. Kamera yerine sahte yüz takibi (yuz-stub.js),
// göz bütçesi her zaman izin verir (butce-stub.js). Uygulama dosyalarına dokunulmaz.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const D = path.dirname(fileURLToPath(import.meta.url))
const APP = path.resolve(D, '../../../../../app')
function stubs() {
  return {
    name: 'yilan-stubs',
    enforce: 'pre',
    resolveId(source) {
      if (/hooks\/useFaceTracking\.js$/.test(source)) return path.join(D, 'yuz-stub.js')
      if (/lib\/eyeBudgetStore\.js$/.test(source)) return path.join(D, 'butce-stub.js')
      return null
    },
  }
}
export default defineConfig({
  root: APP,
  cacheDir: path.join(D, '.vite-cache'),
  plugins: [stubs(), react()],
  server: { host: '127.0.0.1', port: 4293, strictPort: true, hmr: false, watch: { ignored: ['**/*'] }, fs: { strict: true, allow: [APP, D] } },
  clearScreen: false,
})
