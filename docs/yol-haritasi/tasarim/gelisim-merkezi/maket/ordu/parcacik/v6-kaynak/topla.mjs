// v6.html'i parçalardan toplar: şablon + yazı tipleri + veri + yüz kitaplığı + pişirilmiş veri + ana betik.
// three.js yok: sahne mini3.js (three.js arayüzünün kullanılan küçük parçası) ile çizilir; dış betik indirilmez.
import fs from 'node:fs'
const D = new URL('.', import.meta.url).pathname
const r = (f) => fs.readFileSync(D + f, 'utf8')
const veri = fs.readFileSync(D + '../../veri.js', 'utf8').trim()
// yazı tipi alt kümeleri v3.html'den aynen alınır (4-5. satırlar)
const v3 = fs.readFileSync(D + '../v3.html', 'utf8').split('\n')
if (!v3[3].startsWith('@font-face{font-family:"Onest"') || !v3[4].startsWith('@font-face{font-family:"Unbounded"')) throw new Error('v3.html beklenen düzende değil')
let s = r('sablon.html')
const rep = (k, v) => { if (!s.includes(k)) throw new Error('yok: ' + k); s = s.split(k).join(v) }
rep('/*@FONTS@*/', v3[3].trim() + '\n' + v3[4].trim())
rep('/*@DATA@*/', '/* ---------------- veri (olduğu gibi) ---------------- */\n' + veri)
rep('/*@MINI3@*/', r('mini3.js').trim())
rep('/*@YUZ@*/', r('yuz.js').trim())
rep('/*@BAKED@*/', r('pisirilmis.js').trim())
rep('/*@MAIN@*/', r('ana.js').trim())
fs.writeFileSync(D + '../v6.html', s)
console.log('v6.html', (Buffer.byteLength(s) / 1024).toFixed(0), 'KB')
