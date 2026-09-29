// Ortak davranış: tema (sistem / açık / koyu, localStorage), telefon menüsü, sayfa vurgusu, uygulamadan gelen verinin
// (src/data.json, scripts/data.mjs üretir) ilgili sayfaya basılması. Her sayfa hangi parçaları istediğini data-render ile söyler.
import './site.css'
import data from './data.json'
import './home.js'

const root = document.documentElement
const THEME_KEY = 'nefona-site-theme'
const icons = {
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
}

function isDark() {
  const t = root.dataset.theme
  return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches
}
function applyTheme(t) {
  if (t) root.dataset.theme = t
  else delete root.dataset.theme
  const b = document.querySelector('.theme-btn[data-theme-toggle]')
  if (b) {
    b.innerHTML = isDark() ? icons.sun : icons.moon
    b.setAttribute('aria-label', isDark() ? 'Açık temaya geç' : 'Koyu temaya geç')
  }
  document.dispatchEvent(new CustomEvent('nefona:theme'))
}
try {
  applyTheme(localStorage.getItem(THEME_KEY) || '')
} catch {
  applyTheme('')
}

document.querySelector('.theme-btn[data-theme-toggle]')?.addEventListener('click', () => {
  const next = isDark() ? 'light' : 'dark'
  try {
    localStorage.setItem(THEME_KEY, next)
  } catch {
    // depolama yoksa yalnız bu sayfa için
  }
  applyTheme(next)
})
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme(root.dataset.theme || ''))

// Telefon menüsü
const menuBtn = document.querySelector('.menu-btn')
const links = document.querySelector('.nav-links')
if (menuBtn && links) {
  menuBtn.innerHTML = icons.menu
  const setOpen = (open) => {
    links.classList.toggle('open', open)
    menuBtn.setAttribute('aria-expanded', String(open))
  }
  menuBtn.addEventListener('click', () => setOpen(!links.classList.contains('open')))
  links.addEventListener('click', (e) => e.target.closest('a') && setOpen(false))
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links.classList.contains('open')) {
      setOpen(false)
      menuBtn.focus()
    }
  })
}
// Bulunulan sayfa
const here = location.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '')
document.querySelectorAll('.nav-links a, footer nav a').forEach((a) => {
  const p = new URL(a.href, location.href).pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '')
  if (p === here) a.setAttribute('aria-current', 'page')
})

// ---- Veri basma ----
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const RING = { eye: 'Göz', attention: 'Dikkat ve farkındalık', life: 'Yaşam' }
const KIND = { measure: 'ölçüm', exercise: 'egzersiz', practice: 'pratik' }
// Modül açıklamaları (siteye özgü tek cümle; iddiasız). Manifestte açıklama yok, id ile eşleşir.
const MOD_DESC = {
  daily: 'İsteğe bağlı kısa E testi, sağ ve sol göz: hangi yöne baktığını söylersin, yakın görme keskinliğin logMAR olarak kaydedilir.',
  weekly: 'İlk günden haftada bir tam ölçüm: sağ göz, sol göz ve iki göz, her biri 28 harf.',
  reading: 'Yazı küçüldükçe rahat okuduğun en küçük boyu bulur.',
  blink: 'Ekran başında yarım kalan kırpmaya karşı tam göz kırpmayı ritimle yaptırır.',
  routine: 'Uzağa bakış, göz hareketleri, kırpma ve nefes adımlarını sesli yönlendirmeyle yaptırır; hafif ya da normal set seçilir.',
  'tek-bakis': 'Kısa süre görünen bir sahneden kaç ayrıntı yakaladığını ölçer.',
  'quick-look': 'Kısa süre görünen hedefleri bulursun; tepki süresi ve isabet kaydedilir.',
  'fark-ettin': 'Sahnedeki küçük değişimi fark etme görevi.',
  notice: 'Günün tek fark etme görevi; sonunda ne fark ettiğini yazarsın.',
  'breath-count': 'Nefesini sayarsın; dikkatin ne kadar sürdüğü ölçülür.',
  snake: 'Yılanı gözünle yönlendirirsin; kamera bakışını izler.',
  track: 'Hareket eden çemberleri gözünle izlersin; tepki ve isabet ölçülür.',
  awareness: 'Dikkat ve fark etme görevlerinin toplandığı yer; hangisini ne zaman yaptığın burada görünür.',
  breath: 'Sekiz nefes kalıbından birini sesli yönlendirmeyle yaparsın; öncesinde ve sonrasında nasıl hissettiğin sorulur.',
  dalga: 'Sakin, Güç ve Motivasyon modlarında müzik; molada ve uykuya dalarken çalar.',
  gokyuzu: 'Bir dakika uzağa ve yukarı bakarsın; öncesi ve sonrası tek soruyla kaydedilir.',
  mola: 'Bir dakikalık göz molası; günlük oyun ve göz hareketi süresi dolunca kendiliğinden kilitler.',
  water: 'Su kaydı ve hatırlatma.',
  alarm: 'Sabah alarmı, Nefona\'ya özel uyandırma sesleri ve uykuya dalarken yavaşça susan ses.',
  who5: 'İki haftada bir beş kısa soruyla iyi oluş puanı (WHO-5 ölçeği, resmî Türkçe metin).',
  yon: 'Kendini tanıma ve kendine şefkat için kısa yazılı pratikler.',
}

const renderers = {
  modules(el) {
    const groups = ['eye', 'attention', 'life']
    el.innerHTML = groups
      .map((r) => {
        const ms = data.modules.filter((m) => m.ring === r)
        if (!ms.length) return ''
        return `<div class="mod-group"><h2>${esc(RING[r])}</h2><ul class="mod-list">${ms
          .map((m) => `<li><span class="kind">${esc(KIND[m.kind] ?? m.kind)}</span><b>${esc(m.title)}</b><span>${esc(MOD_DESC[m.id] ?? '')}</span></li>`)
          .join('')}</ul></div>`
      })
      .join('')
  },
  evidence(el) {
    el.innerHTML = data.evidence
      .map(
        (e) => `<article class="card ev"><span class="pill">Kanıt düzeyi · ${esc(e.level)}</span><h3>${esc(e.title)}</h3><p>${esc(e.claim)}</p>
        <dl><dt>Dayanak</dt><dd>${esc(e.basis)}</dd><dt>Sınırlar</dt><dd>${esc(e.limits)}</dd><dt>Kaynaklar</dt><dd><ul>${e.sources.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></dd></dl></article>`,
      )
      .join('')
  },
  notClaimed(el) {
    el.innerHTML = data.notClaimed.map((s) => `<li>${esc(s)}</li>`).join('')
  },
  notClaimedSources(el) {
    el.textContent = `Dayanak: ${data.notClaimedSources.join('; ')}.`
  },
  sources(el) {
    el.innerHTML = data.sources
      .map(
        (s) => `<li id="src-${esc(s.id)}"><span class="who">${esc(s.authors.length === 2 ? `${s.authors[0].split(' ')[0]} ve ${s.authors[1].split(' ')[0]}` : s.authors.length > 2 ? `${s.authors[0].split(' ')[0]} ve ark.` : s.authors[0].split(' ')[0])} ${s.year}</span><span class="rank">${esc(s.designText)}${s.n && s.n !== 'özette yazmıyor' ? ' · ' + esc(s.n) : ''}</span>
        <span class="tr">${esc(s.titleTr)}</span><span class="en">${esc(s.title)} · <i>${esc(s.journal)}</i> ${esc(s.cite)}</span>
        <span class="links"><a href="https://doi.org/${esc(s.doi)}" rel="noopener">doi:${esc(s.doi)}</a><a href="https://pubmed.ncbi.nlm.nih.gov/${esc(s.pmid)}/" rel="noopener">PMID ${esc(s.pmid)}</a></span></li>`,
      )
      .join('')
  },
  sourceCount(el) {
    el.textContent = String(data.sources.length)
  },
  releases(el) {
    el.innerHTML = data.releases
      .map(
        (r) => `<article class="card rel"><h2>${esc(r.title)}</h2><ul>${r.items
          .map((i) => `<li><span class="k ${esc(i.kind)}">${{ new: 'yeni', fix: 'düzeltme', change: 'değişti' }[i.kind] ?? esc(i.kind)}</span><span>${esc(i.text)}</span></li>`)
          .join('')}</ul></article>`,
      )
      .join('')
  },
  flags(el) {
    el.innerHTML = data.safety.flags.map((f) => `<li>${esc(f)}</li>`).join('')
  },
  domains(el) {
    const d = data.domains
    const why = {
      eye: 'Yakın görme, kırpma, mola ve mesafe.',
      focus: 'Dikkati toplama ve sürdürme.',
      awareness: 'Fark etme: sahnede, nefeste, günde.',
      calm: 'Nefes, ses ve kısa molalarla sakinlik.',
      self: 'Kendini tanıma ve kendine şefkat.',
      wellbeing: 'Uyku, iyi oluş soruları, sabah düzeni.',
      body: 'Hareket: adım ve hareketli gün.',
    }
    el.innerHTML = Object.entries(d)
      .map(([k, v]) => `<li><i></i><span><b>${esc(v)}</b>${esc(why[k] ?? '')}</span></li>`)
      .join('')
  },
}
document.querySelectorAll('[data-render]').forEach((el) => renderers[el.dataset.render]?.(el))

// İris haritası: 7 dilim sırayla yanar, tek tur (~5 sn) sonra hepsi yanık kalır; dokunma/üstüne gelme hemen durdurur.
// Hareketi Azalt açıksa hiç canlanmaz (WCAG 2.2.2: 5 sn'den uzun otomatik hareket yok; 2.3.3).
const iris = document.querySelector('.iris')
if (iris) {
  const segs = [...iris.querySelectorAll('.seg')]
  const allOn = () => segs.forEach((s) => s.classList.add('on'))
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) allOn()
  else {
    let i = 0
    const tick = () => {
      segs.forEach((s, j) => s.classList.toggle('on', j <= i % (segs.length + 2)))
      i++
    }
    tick()
    const id = setInterval(() => {
      tick()
      if (i >= segs.length + 2) stop()
    }, 550)
    const stop = () => {
      clearInterval(id)
      allOn()
    }
    iris.addEventListener('pointerenter', stop, { once: true })
    iris.addEventListener('click', stop, { once: true })
  }
}
