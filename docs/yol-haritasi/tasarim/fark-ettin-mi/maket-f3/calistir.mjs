// uret.mjs'i Vite SSR ile çalıştırır (uygulama modülleri import.meta.glob kullanıyor). node calistir.mjs
import { createServer } from '/home/user/eyes/app/node_modules/vite/dist/node/index.js'
const D = new URL('.', import.meta.url).pathname
const server = await createServer({ root: '/home/user/eyes/app', configFile: false, logLevel: 'error', cacheDir: D + '.vite-cache', server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
try { await server.ssrLoadModule(D + 'uret.mjs') } finally { await server.close() }
