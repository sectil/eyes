// Yakın E testi stil sözleşmesi (styles/acuity.css). Görsel ölçümde (Playwright, app/_harness, 5 boyut × 2 tema)
// bulunan hatalar geri gelmesin diye: tarayıcı yok, kurallar CSS metninden okunur, renk token'ları styles.css'ten
// çözülür. Ölçütler: grafik ≥ 3:1 (WCAG 1.4.11), dokunma alanı ≥ 44 pt ve başka metnin üstüne binmez, deneme dışı
// ekranlar 320×568'de kaydırmasız (E7'nin en uzun durumu).
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

const css = readFileSync(new URL('./acuity.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const base = readFileSync(new URL('../styles.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

// Seçicisi tam olarak `sel` olan kuralın bildirimleri: { özellik: değer }
function rule(src, sel) {
  const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const m = src.match(new RegExp(`(?:^|})\\s*${esc}\\s*\\{([^}]*)\\}`, 'm'))
  if (!m) throw new Error(`kural yok: ${sel}`)
  const out = {}
  for (const d of m[1].split(';')) {
    const i = d.indexOf(':')
    if (i > 0) out[d.slice(0, i).trim()] = d.slice(i + 1).trim()
  }
  return out
}
// Tema token'ları: açık (:root) ve koyu (:root[data-theme='dark'])
const tokens = (sel) => {
  const r = rule(base, sel)
  return Object.fromEntries(Object.entries(r).filter(([k]) => k.startsWith('--')))
}
const THEMES = { light: tokens(':root'), dark: tokens(":root[data-theme='dark']") }
const color = (v, t) => {
  const m = v.match(/^var\((--[\w-]+)\)$/)
  return m ? THEMES[t][m[1]] : v
}
const rgb = (hex) => {
  const h = hex.replace('#', '')
  const f = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16))
}
const lum = (c) => {
  const [r, g, b] = rgb(c).map((v) => {
    v /= 255
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

// Bildirim değerini üst düzey boşluklardan böl (parantez içindekiler bölünmez): "clamp(…) 4px" → ["clamp(…)", "4px"]
function parts(v) {
  const out = ['']
  let depth = 0
  for (const ch of v.trim()) {
    if (ch === '(') depth++
    if (ch === ')') depth--
    if (/\s/.test(ch) && depth === 0) {
      if (out.at(-1)) out.push('')
    } else out[out.length - 1] += ch
  }
  return out.filter(Boolean)
}

// clamp(Apx, calc(Bdvh ± Cpx), Dpx) | clamp(Apx, Bdvh, Dpx) | Npx → ekran yüksekliği h (pt) için px
function evalLen(v, h) {
  const s = v.trim()
  const px = s.match(/^(-?[\d.]+)px$/)
  if (px) return Number(px[1])
  const c = s.match(/^clamp\(\s*([\d.]+)px\s*,\s*(.+)\s*,\s*([\d.]+)px\s*\)$/)
  if (!c) throw new Error(`çözülemedi: ${v}`)
  const mid = c[2].replace(/^calc\((.*)\)$/, '$1')
  const t = mid.match(/^([\d.]+)dvh(?:\s*([+-])\s*([\d.]+)px)?$/)
  if (!t) throw new Error(`çözülemedi: ${mid}`)
  const x = (Number(t[1]) * h) / 100 + (t[2] ? (t[2] === '-' ? -1 : 1) * Number(t[3]) : 0)
  return Math.min(Number(c[3]), Math.max(Number(c[1]), x))
}

describe('acuity.css · kendin-onay anahtarı', () => {
  it('açık anahtarın düğmesi izine karşı ≥ 3:1 (koyu temada beyaz düğme 2,2:1 kalıyordu)', () => {
    const track = rule(css, '.acu-row .tog.on').background
    const knob = rule(css, '.acu-row .tog.on::after').background
    for (const t of ['light', 'dark']) {
      const k = contrast(color(knob, t), color(track, t))
      expect(k, `${t}: ${color(knob, t)} / ${color(track, t)}`).toBeGreaterThanOrEqual(3)
    }
  })
})

describe('acuity.css · deneme alanı düğmeleri', () => {
  // Deneme alanı her temada beyaz: renkler .acu-clinic içindeki açık token'lardan çözülür
  const clinic = rule(css, '.acu-clinic')
  const local = (v) => {
    const m = v.match(/var\((--[\w-]+)\)/)
    return m ? clinic[m[1]] : v
  }
  it('"Göremiyorum" ve okların kenarı beyaz zeminde ≥ 3:1 (WCAG 1.4.11)', () => {
    for (const sel of ['.acu-cant', '.acu-arrow']) {
      const b = parts(rule(css, sel).border)
      const c = local(b.at(-1))
      expect(parseFloat(b[0]), sel).toBeGreaterThanOrEqual(2)
      expect(contrast(c, '#ffffff'), `${sel} ${c}`).toBeGreaterThanOrEqual(3)
    }
  })
})

describe('acuity.css · E7 göz sonucu', () => {
  it('"Bu sayı ne anlatıyor?" gerçek 44 pt dokunma alanı; eksi kenar boşluğuyla üstteki metne binmez', () => {
    const r = rule(css, '.acu-link')
    expect(parseFloat(r['min-height'])).toBeGreaterThanOrEqual(44)
    expect(r.margin ?? '0').not.toMatch(/-/)
    expect(r['margin-top'] ?? '0').not.toMatch(/-/)
    expect(r['margin-bottom'] ?? '0').not.toMatch(/-/)
  })

  it('812 pt ve üstünde onaylı ölçüler; 568 pt\'de sıkışık değerler (en uzun durum 320×568\'e sığar)', () => {
    const gap = rule(css, '.acu-res')['--res-gap']
    const big = rule(css, '.acu-big b')['font-size']
    const eqPad = parts(rule(css, '.acu-eq div').padding)[0]
    const go = parts(rule(css, '.acu-result .acu-cta.go').margin)
    const ghost = rule(css, '.acu-result .acu-cta.ghost')['margin-bottom']
    const at = (h) => ({ gap: evalLen(gap, h), big: evalLen(big, h), eq: evalLen(eqPad, h), goTop: evalLen(go[0], h), goBottom: evalLen(go[2], h), ghost: evalLen(ghost, h) })
    const near = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Math.round(v * 10) / 10]))
    expect(near(at(812))).toEqual({ gap: 12, big: 52, eq: 10, goTop: 12, goBottom: 16, ghost: 12 })
    expect(near(at(926))).toEqual({ gap: 12, big: 52, eq: 10, goTop: 12, goBottom: 16, ghost: 12 })
    expect(near(at(568))).toEqual({ gap: 6, big: 40, eq: 6, goTop: 8, goBottom: 8, ghost: 8 })
    // Büyük sayıya 4 pt: not satırı aralığı geri alır
    expect(rule(css, '.acu-range')['margin-top']).toBe('calc(4px - var(--res-gap))')
  })
})
