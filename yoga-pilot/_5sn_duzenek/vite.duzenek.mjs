// Yoga ekran düzeneği · vite dev sunucusu (yalnız bu düzenek için; depoda dosya yok).
// Kök uygulamanın kendisi (/home/user/eyes/app); düzeneğin HTML/JSX dosyaları /@fs/ yoluyla yüklenir.
// - HMR ve dosya izleme kapalı: başka bir iş akışı depoda dosya yazarken sayfa ortasında yeniden yüklenmesin.
// - Ön paketleme önbelleği düzenekte (.vite): depoya (node_modules/.vite) yazılmaz.
// - fs.allow: uygulama + bu klasör (düzenek dosyaları /@fs/ ile sunulabilsin).
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const APP = '/home/user/eyes/app'
const HERE = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: APP,
  base: './', // uygulamanın vite.config.js'i ile aynı
  plugins: [react()],
  cacheDir: path.join(HERE, '.vite'),
  clearScreen: false,
  server: {
    host: '127.0.0.1',
    port: 4291,
    strictPort: true,
    hmr: false,
    watch: { ignored: ['**/*'] },
    fs: { strict: true, allow: [APP, HERE] },
  },
  // Düzeneğin girişi de taransın: bağımlılıklar çalışırken keşfedilip sayfa yeniden yüklenmesin
  optimizeDeps: { entries: [path.join(HERE, 'main.jsx')] },
})
