import fs from 'node:fs'
const D = new URL('.', import.meta.url).pathname
export function loadObj(){
  const L = fs.readFileSync(D + '../../model/canonical_face_model.obj', 'utf8').split('\n')
  const V = [], F = []
  for (const l of L){ const p = l.trim().split(/\s+/); if (p[0] === 'v') V.push(+p[1], +p[2], +p[3]); else if (p[0] === 'f') F.push(...p.slice(1, 4).map((s) => parseInt(s) - 1)) }
  return { VC: new Float32Array(V), FI: new Uint16Array(F) }
}
export function libs(){
  const src = fs.readFileSync(D + 'yuz.js', 'utf8') + '\n' + fs.readFileSync(D + 'kafa.js', 'utf8') + '\nreturn { FACELIB, HEADLIB }'
  return new Function(src)()
}
