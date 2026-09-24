// MediaPipe WASM dosyalarını public/ altına kopyalar (çevrimdışı çalışma için).
import { cpSync, mkdirSync } from 'node:fs'

const src = 'node_modules/@mediapipe/tasks-vision/wasm'
const dst = 'public/mediapipe-wasm'
mkdirSync(dst, { recursive: true })
cpSync(src, dst, { recursive: true })
console.log(`kopyalandı: ${src} → ${dst}`)
