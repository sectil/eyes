// Her stil dosyası bir yerde içe aktarılır: içe aktarılmayan dosya derlemeye girmez, yalnız yanıltır (ikinci inceleme
// V-N9: RestBreak acuity.css'e geçince styles/rest.css sahipsiz kalmıştı). Arama: src altındaki js, jsx, css dosyaları
// ve index.html; "styles/<ad>.css" ya da aynı klasörden "./<ad>.css".
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = fileURLToPath(new URL('.', import.meta.url))
const src = join(here, '..')
function sources(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...sources(p))
    else if (/\.(jsx?|css)$/.test(name) && !/\.test\.jsx?$/.test(name)) out.push(p)
  }
  return out
}

describe('stil dosyaları', () => {
  it('src/styles altındaki her .css dosyası bir yerde içe aktarılır', () => {
    const texts = [...sources(src), join(src, '..', 'index.html')].map((p) => [p, readFileSync(p, 'utf8')])
    const orphans = readdirSync(here)
      .filter((n) => n.endsWith('.css'))
      .filter((n) => !texts.some(([p, t]) => p !== join(here, n) && (t.includes(`styles/${n}'`) || t.includes(`styles/${n}"`) || (p.startsWith(here) && (t.includes(`./${n}'`) || t.includes(`./${n}"`))))))
    expect(orphans).toEqual([])
  })
})
