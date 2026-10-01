// v4.html'i parçalardan toplar: şablon + yazı tipleri + veri + three.js + yüz kitaplığı + pişirilmiş veri + ana betik
import fs from 'node:fs'
const D = new URL('.', import.meta.url).pathname
const r = (f) => fs.readFileSync(D + f, 'utf8')
const veri = fs.readFileSync(D + '../../veri.js', 'utf8').trim()
// yazı tipi alt kümeleri ve satır içi three.js r128, v3.html'den aynen alınır (4-5. ve 156-162. satırlar)
const v3 = fs.readFileSync(D + '../v3.html', 'utf8').split('\n')
if (!v3[3].startsWith('@font-face{font-family:"Onest"') || !v3[4].startsWith('@font-face{font-family:"Unbounded"') || !v3[155].startsWith('/* three.js r128')) throw new Error('v3.html beklenen düzende değil')
let s = r('sablon.html')
const rep = (k, v) => { if (!s.includes(k)) throw new Error('yok: ' + k); s = s.split(k).join(v) }
rep('/*@FONTS@*/', v3[3].trim() + '\n' + v3[4].trim())
rep('/*@DATA@*/', '/* ---------------- veri (olduğu gibi) ---------------- */\n' + veri)
rep('/*@THREE@*/', v3.slice(155, 162).join('\n').trim())
rep('/*@YUZ@*/', r('yuz.js').trim())
rep('/*@BAKED@*/', r('pisirilmis.js').trim())
rep('/*@MAIN@*/', r('ana.js').trim())
fs.writeFileSync(D + '../v4.html', s)
console.log('v4.html', (s.length / 1024).toFixed(0), 'KB')
