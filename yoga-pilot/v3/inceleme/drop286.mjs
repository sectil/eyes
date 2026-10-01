import { readFileSync, writeFileSync } from 'node:fs'
const src = readFileSync('./today_patched.js', 'utf8')
const needle = "while (!sec2.some((s) => s.exclusive) && eyeSum(sec2) > cap && dropOne([sec2])) {"
const repl = `const dropEye = (list) => { const c = list.filter((s) => s.budget === 'eye'); const d = [c]; if (!dropOne(d)) return false; const gone = list.find((s) => s.budget === 'eye' && !d[0].includes(s)); list.splice(list.indexOf(gone), 1); return true }
  while (!sec2.some((s) => s.exclusive) && eyeSum(sec2) > cap && dropEye(sec2)) {`
const fixed = src.replace(needle, repl)
if (fixed === src) throw new Error('eşleşmedi')
writeFileSync('./today_fix286.js', fixed)
