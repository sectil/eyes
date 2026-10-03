// Ana sayfa halkaları çekim düzeneği (docs içinde; node_modules bağlantısını cek.sh kurar). Kök uygulama; düzenek sayfası
// /@fs/ ile. Kök APP ortam değişkeniyle seçilir: varsayılan deponun app klasörü; ön örnek için çalışma kopyasının app'i.
// iPhone uygulaması taklidi: lib/native.js'i içe aktaran her dosya onun yerine sanal bir modül görür; modül native.js'in
// her şeyini olduğu gibi verir, yalnız isIOSApp sayfanın bayrağına bakar (home.html: ?ios=1 → window.__duzenekIOS).
// native.js'in kendi içindeki çağrılar (eklentiler) web'deki gibi kalır; uygulama dosyalarına dokunulmaz.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { realpathSync } from 'node:fs'
const D = path.dirname(fileURLToPath(import.meta.url))
const APP = path.resolve(process.env.APP ?? path.resolve(D, '../../../../../..', 'app'))
const NATIVE = path.join(APP, 'src/lib/native.js')
const VIRT = '\0duzenek-native'
// Çalışma kopyasının node_modules'ı depodakine bağlantı olabilir: gerçek yolu da sunulabilsin
const MODS = realpathSync(path.join(APP, 'node_modules'))

function iosShim() {
  return {
    name: 'duzenek-ios',
    enforce: 'pre',
    async resolveId(source, importer, opts) {
      if (!importer || importer.startsWith(VIRT) || !/native(\.js)?$/.test(source)) return null
      const r = await this.resolve(source, importer, { ...opts, skipSelf: true })
      return r && r.id.split('?')[0] === NATIVE ? VIRT : null
    },
    load(id) {
      if (id !== VIRT) return null
      return `export * from ${JSON.stringify(NATIVE)}\nexport const isIOSApp = () => globalThis.__duzenekIOS === true\n`
    },
  }
}

export default defineConfig({
  root: APP, base: '/', cacheDir: path.join(D, '.vite-cache'), plugins: [iosShim(), react()],
  server: { host: '127.0.0.1', port: Number(process.env.PORT ?? 4390), strictPort: true, hmr: false, watch: { ignored: ['**/*'] }, fs: { strict: true, allow: [APP, D, MODS] } },
  optimizeDeps: { entries: [path.join(D, 'home.jsx')] },
  clearScreen: false,
})
