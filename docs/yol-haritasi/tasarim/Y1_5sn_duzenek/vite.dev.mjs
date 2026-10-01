// Y1 ekran görüntüsü düzeneği (yalnız scratchpad; depoya dosya eklenmez).
// Kök /home/user/eyes/app; düzeneğin sayfaları /@fs/ ile yüklenir. HMR ve dosya izleme kapalı: başka bir iş akışı
// depoda dosya değiştirse de çekim sırasında sayfa yeniden yüklenmez.
// Y1_YOGA=1 (varsayılan): yalnız modules/yoga/manifest.js'in isIOSApp'i true döner; yoldaki yoga durağı iPhone'daki
// gibi görünür. Uygulamanın geri kalanı web kipindedir (abonelik, alarm, Sağlık, bildirim yok). Y1_YOGA=0: saf web.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const APP = '/home/user/eyes/app'
const D = path.dirname(fileURLToPath(import.meta.url))
const YOGA_IOS = process.env.Y1_YOGA !== '0'
const YOGA_MANIFEST = `${APP}/src/modules/yoga/manifest.js`

function yogaIos() {
  return {
    name: 'y1-yoga-ios',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!YOGA_IOS || !importer) return null
      if (importer.split('?')[0] === YOGA_MANIFEST && /\/lib\/native\.js$/.test(source)) return path.join(D, 'ios-shim.js')
      return null
    },
  }
}

export default defineConfig({
  root: APP,
  base: '/',
  // Bağımlılık önbelleği düzenekte: uygulamanın node_modules/.vite önbelleğine (başka sunucular kullanıyor) dokunulmaz
  cacheDir: path.join(D, '.vite-cache-dev'),
  plugins: [yogaIos(), react()],
  define: { 'import.meta.env.VITE_Y1_YOGA': JSON.stringify(YOGA_IOS ? '1' : '0') },
  server: {
    host: '127.0.0.1',
    port: 4293,
    strictPort: true,
    hmr: false,
    watch: {},
    fs: { strict: true, allow: [APP, D] },
  },
  clearScreen: false,
})
