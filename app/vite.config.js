import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'

// Derleme bilgisi (Bilgi → Yenilikler satırı ve alttaki sürüm satırı): derlendiği an ve commit. Git yoksa (ör. Vercel
// yüklemesi) commit boş kalır.
const sha = (() => { try { return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() } catch { return '' } })()

export default defineConfig({
  plugins: [react()],
  base: './',
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __BUILD_SHA__: JSON.stringify(sha),
  },
})
