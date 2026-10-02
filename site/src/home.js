// Ana sayfa davranışları: tema uyumlu ekran görüntüleri, kaydırınca belirme, canlı E tadımlığı, ses örnekleri.
import './home.css'

// ---- Tema uyumlu görseller: <img data-light data-dark>; main.js tema değişince 'nefona:theme' olayı yollar
const isDark = () => (document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches)
function swapImages() {
  const d = isDark()
  document.querySelectorAll('img[data-light][data-dark]').forEach((img) => {
    const want = d ? img.dataset.dark : img.dataset.light
    if (img.getAttribute('src') !== want) img.setAttribute('src', want)
  })
}
swapImages()
document.addEventListener('nefona:theme', swapImages)
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', swapImages)

// ---- Belirme (bir kez; Hareketi Azalt açıksa ya da IntersectionObserver yoksa hepsi görünür)
const reveal = [...document.querySelectorAll('.reveal')]
if (reveal.length) {
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) reveal.forEach((e) => e.classList.add('in'))
  else {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return
          e.target.classList.add('in')
          io.unobserve(e.target)
        }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    reveal.forEach((e) => io.observe(e))
  }
}

// ---- Canlı E tadımlığı: 5 harf, her doğruda 0,1 logMAR küçülür (×10^-0,1). Ölçüm değil; ekran kalibre değil.
const demo = document.querySelector('.edemo')
if (demo) {
  const DIRS = ['right', 'down', 'left', 'up']
  const ROT = { right: 0, down: 90, left: 180, up: 270 }
  const N = 5
  const START = 150
  const STEP = 10 ** -0.1
  const e = demo.querySelector('.edemo-e')
  const n = demo.querySelector('.n')
  const fb = demo.querySelector('.edemo-fb')
  const play = demo.querySelector('.edemo-play')
  const res = demo.querySelector('.edemo-result')
  const big = res.querySelector('.big')
  let i = 0
  let ok = 0
  let size = START
  let dir = null
  let t0 = 0
  let done = false
  let timer = 0
  const next = () => {
    let d
    do d = DIRS[Math.floor(Math.random() * DIRS.length)]
    while (d === dir)
    dir = d
    e.style.setProperty('--rot', `${ROT[d]}deg`)
    e.style.setProperty('--e', `${size.toFixed(1)}px`)
    e.classList.remove('off')
    n.textContent = `Harf ${Math.min(i + 1, N)}/${N}`
  }
  const finish = () => {
    done = true
    play.hidden = true
    res.hidden = false
    const s = Math.max(1, Math.round((performance.now() - t0) / 1000))
    big.innerHTML = `${ok}/${N} <small>doğru · ${s} saniye</small>`
    big.focus()
  }
  const answer = (d) => {
    if (done || timer) return
    if (!t0) t0 = performance.now()
    if (d === dir) {
      ok += 1
      size *= STEP
      fb.textContent = 'Doğru'
      fb.classList.remove('bad')
    } else {
      fb.textContent = d === 'cant' ? 'Geçerli cevap: göremiyorum' : 'Yanlış yön'
      fb.classList.toggle('bad', d !== 'cant')
    }
    e.classList.add('off') // geri bildirim eski harfe ait: yeni harf gelene kadar E görünmez
    i += 1
    timer = setTimeout(() => {
      timer = 0
      if (i >= N) finish()
      else next()
    }, i >= N ? 420 : 240)
  }
  demo.querySelectorAll('[data-dir]').forEach((b) => b.addEventListener('click', () => answer(b.dataset.dir)))
  demo.addEventListener('keydown', (ev) => {
    const k = { ArrowRight: 'right', ArrowDown: 'down', ArrowLeft: 'left', ArrowUp: 'up' }[ev.key]
    if (!k || res.hidden === false) return
    ev.preventDefault()
    answer(k)
  })
  demo.querySelector('.edemo-again')?.addEventListener('click', () => {
    i = 0
    ok = 0
    size = START
    t0 = 0
    done = false
    fb.textContent = ''
    fb.classList.remove('bad')
    res.hidden = true
    play.hidden = false
    next()
    demo.querySelector('[data-dir="up"]')?.focus()
  })
  next()
}

// ---- Ses örnekleri: tek düğme, aynı anda tek klip, ilerleme çubuğu
const ICON = {
  play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
}
document.querySelectorAll('.clip').forEach((c) => {
  const a = c.querySelector('audio')
  const b = c.querySelector('button')
  const bar = c.querySelector('.bar i')
  if (!a || !b) return
  const set = (playing) => {
    b.innerHTML = playing ? ICON.pause : ICON.play
    b.setAttribute('aria-label', playing ? 'Durdur' : 'Dinle')
  }
  set(false)
  b.addEventListener('click', () => {
    if (a.paused) {
      document.querySelectorAll('.clip audio').forEach((o) => o !== a && o.pause())
      a.play().catch(() => {})
    } else a.pause()
  })
  a.addEventListener('play', () => set(true))
  a.addEventListener('pause', () => set(false))
  a.addEventListener('ended', () => {
    set(false)
    bar?.style.setProperty('--p', '0%')
  })
  a.addEventListener('timeupdate', () => bar?.style.setProperty('--p', a.duration ? `${(a.currentTime / a.duration) * 100}%` : '0%'))
})
