// Ana sayfa · uzun yol D9 v2 (sahibin dört kararı): yarın ayrıntılı, sonrası bölüm kartları; Nef yalnız onaylı
// cümlelerle; bugünün durakları ritimli (sıradaki büyük, biten küçük); ödül yol bitmeden kilitli.
// Tur 3 ("Sadeleştir"): yarın kartında ilk 3 durak + "ve N durak daha" (cümle 16); alarm varken hatırlatma yok; yalnız iki
// bölüm kartı; bugünün bölümünde "Yeni:" yarını tekrar etmez; gözde dış halka yok; kupa ve madalya tek ilerleme halkalı.
import { describe, it, expect } from 'vitest'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import LongPath, { tomPick, metaOf } from './LongPath.jsx'
import { NEF, stopMinutes, pathMinutes, todayLead } from './dayLead.js'

const text = (s) => s.replace(/<[^>]+>/g, ' ').replace(/\u2060/g, '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ')
const st = (key, extra = {}) => ({ key, id: key.split(':')[0], title: key, minutes: 1, route: key, ...extra })

function setup({ n = 9, done = [false, false, false], alarm = null, remind = true, firsts = new Map() } = {}) {
  const today = [st('routine:isinma', { title: 'Isınma', done: done[0] }), st('breath', { title: 'Nefes', restSlot: true, done: done[1] }), st('reading', { title: 'Okuma', minutes: 3, done: done[2] })]
  const next = today.find((s) => !s.done) ?? null
  const plan = { stops: today, next, allDone: today.every((s) => s.done) }
  const tom = { k: 1, n: n + 1, stops: [st('routine:isinma', { title: 'Isınma' }), st('routine:daire', { title: 'Daire' }), st('breath', { title: 'Nefes', restSlot: true }), st('reading', { title: 'Okuma' }), st('task', { title: 'Bugünün görevi' })], restMin: 5 }
  return { plan, today, n, ahead: [tom], firsts, alarm, remind, chapter: true, dalga: true, onStart: () => {}, onRemind: () => {} }
}
const render = (p, extra = {}) => renderToStaticMarkup(h(LongPath, { ...p, ...extra }))

describe('LongPath · D9 v2', () => {
  it('bugünün durakları: sıradaki büyük ve halkalı, biten küçük; kalanlar sakin', () => {
    const html = render(setup({ done: [true, false, false] }))
    expect(html).toMatch(/class="lp-n today done"[^>]*style="left:[^;]+;width:44px;height:44px"/)
    expect(html).toMatch(/class="lp-n today open"[^>]*width:54px/)
    expect(html).toContain('class="lp-band nefes today now"') // sıradaki Nefes bandı
  })
  it('Nef: yolun başında ve sonunda yalnız verilen onaylı cümle', () => {
    const html = render(setup(), { nefTop: NEF.yday, nefEnd: null })
    expect(text(html)).toContain('Dün yolunun bütün duraklarını tamamladın.')
    expect(html.indexOf('Dün yolunun')).toBeLessThan(html.indexOf('data-key="routine:isinma"'))
    expect((html.match(/class="lp-nef(?: end)?"/g) ?? []).length).toBe(1)
  })
  it('yarın tek kart: başlık (8), alarm (9), yalnız ilk 3 durak yol sırasıyla, sonra "ve N durak daha" (16); "Yeni" yalnız ilk kez gelende', () => {
    const p = setup({ alarm: new Date(2026, 9, 1, 6, 35) })
    p.firsts = new Map([[10, [p.ahead[0].stops[1]]]])
    const html = render(p)
    const t = text(html)
    expect(t).toContain('Yarın · 10. gün · 5 durak')
    expect(t).toContain('Yarın 06.35 alarm')
    expect(t).toMatch(/Yarın 06\.35 alarm Isınma Daire Yeni Nefes ve 2 durak daha/)
    expect(t).not.toMatch(/Isınma Yeni/)
    expect((html.match(/class="lp-tp[ "]/g) ?? []).length).toBe(3)
    expect(t.slice(t.indexOf('Yarın ·'))).not.toContain('Okuma')
    expect(html).not.toContain('lp-n tom')
    // 3 ya da daha az durakta "ve N durak daha" yok
    const q = setup()
    q.ahead = [{ ...q.ahead[0], stops: q.ahead[0].stops.slice(0, 3) }]
    expect(text(render(q))).not.toContain('durak daha')
  })
  it('yarının "Yeni"si her zaman görünür: ilk 3\'ün dışındaysa sonuncunun yerine geçer, yol sırası bozulmaz (tur 3b)', () => {
    const [a, b, c, d, e] = ['A', 'B', 'C', 'D', 'E'].map((t) => st(`x:${t}`, { title: t }))
    const all = [a, b, c, d, e]
    expect(tomPick(all, [])).toEqual([a, b, c])
    expect(tomPick(all, [b])).toEqual([a, b, c])
    expect(tomPick(all, [e])).toEqual([a, b, e])
    expect(tomPick(all, [d, e])).toEqual([a, d, e])
    expect(tomPick(all, [b, c, d, e])).toEqual([b, c, d])
    expect(tomPick([a, b], [b])).toEqual([a, b])
    const p = setup()
    p.firsts = new Map([[10, [p.ahead[0].stops[4]]]])
    const t = text(render(p))
    expect(t).toMatch(/Yarın · 10\. gün · 5 durak Isınma Daire Bugünün görevi Yeni ve 2 durak daha/)
  })
  it('tur 9: bugünün yolundan sonra yarının bölümü (solda; yarın içinde), sonra bir sonraki bölüm (sağda); ayrı yarın kartı yok; "Yeni" yolda tek işaret', () => {
    const p = setup()
    p.today[1] = { ...p.today[1], restSlot: false, id: 'reading', key: 'reading:x', title: 'Okuma' }
    const html = render(p, { newKeys: ['reading:x'] })
    const side = html.slice(html.indexOf('class="lp-side'))
    expect(side).not.toMatch(/class="lp-r c tom /) // ayrı yarın kartı yok
    expect(side).toMatch(/class="lp-r c ahead wide unit stop l"><div class="lp-cc cur"[\s\S]*?class="lp-cc-d"[\s\S]*?class="lp-tc in"/)
    expect(side).toMatch(/class="lp-r c ahead wide unit stop nx r"/)
    expect(side).not.toContain('lp-turn')
    expect(html.indexOf('class="lp-side')).toBeGreaterThan(html.indexOf('lp-band dalga'))
    expect(html).not.toContain('lp-n-new')
    expect(text(html)).toMatch(/Okuma Yeni/)
  })
  it('tur 5: kaydı olan geçmiş günler tikli (eski kullanıcı, 69. gün: 64–68 tikli)', () => {
    const html = render(setup({ n: 69 }))
    expect((html.match(/<li class="past">/g) ?? []).length).toBe(5)
    expect(html).not.toContain('class="pre"')
    expect(html).toMatch(/<li class="now"><span class="lp-cc-o"><span>69<\/span>/)
  })
  it('tur 4: bölüm sonu madalyası ödüle göre: ödüllü bölümde iris simgesi, ödülsüzde sade madalya', () => {
    const iris = render(setup({ n: 7 }), { prizes: { 1: 'iris haritan açılır' } })
    expect(iris).toMatch(/class="lp-gm iris"[\s\S]*?class="lp-gm-in"[^>]*><span class="iris-mark"/)
    const bare = render(setup({ n: 14 }), { prizes: {} })
    expect(bare).toContain('class="lp-gm"')
    expect(bare).not.toMatch(/class="lp-gm-in"[^>]*><span class="iris-mark"/)
    expect(text(iris)).toContain('7. gün')
  })
  it('hatırlatma (10): yarının bölüm kartında yarının son satırı; alarm kuruluysa yok (VARSAYIM, tur 3)', () => {
    const t = text(render(setup()))
    expect(t).toContain('ve 2 durak daha Hatırlatma kurmak ister misin?')
    expect(t).not.toContain('Saatini ve günlerini sen seçersin.')
    const html = render(setup())
    expect(html).toMatch(/class="lp-cc cur"[\s\S]*?class="lp-tc in"[\s\S]*?class="lp-tc-rem"/)
    expect(html).not.toContain('class="lp-rem"')
    expect(text(render(setup({ remind: false })))).not.toContain('Hatırlatma kurmak')
    expect(text(render(setup({ alarm: new Date(2026, 9, 1, 6, 35) })))).not.toContain('Hatırlatma kurmak')
  })
  it('tur 9: bölüm kartları yarının bölümü ve bir sonraki; yarının bölümünde gün şeridi, şeridin altında yarın; "Yeni:" hap satırı yok', () => {
    const p = setup({ n: 9 })
    p.firsts = new Map([[10, [p.ahead[0].stops[1]]], [11, [st('tek-bakis', { title: 'Tek Bakışta' })]]])
    const html = render(p, { prizes: { 3: 'iris haritan açılır' } })
    expect((html.match(/class="lp-cc(?: cur| nx)?"/g) ?? []).length).toBe(2)
    expect((html.match(/class="lp-cc cur"/g) ?? []).length).toBe(1)
    expect((html.match(/class="lp-cc nx"/g) ?? []).length).toBe(1)
    const t = text(html)
    // sıra: 2. bölüm (bugün 9, yarın 10 ve yarının durakları), sonra 3. bölüm
    expect(t).toMatch(/2\. bölüm · 8–14\. gün 9 bugün 10 11 12 13 Yarın · 10\. gün · 5 durak Isınma Daire Yeni Nefes ve 2 durak daha/)
    expect(t.indexOf('Yarın ·')).toBeLessThan(t.indexOf('3. bölüm'))
    expect(t).not.toContain('Yeni:')
    expect(t).not.toContain('Tek Bakışta')
    expect((t.match(/Daire/g) ?? []).length).toBe(1)
    const nx = t.slice(t.indexOf('3. bölüm'))
    expect(nx).toContain('Sonunda: iris haritan açılır')
    expect((html.match(/class="lp-cc-d"/g) ?? []).length).toBe(1)
    expect(html).toMatch(/<li class="past">[\s\S]*?<li class="now"><span class="lp-cc-o"><span>9<\/span><\/span><small>bugün<\/small><\/li><li class="next">/)
    const bare = text(render(p, { prizes: {} }))
    expect(bare.slice(bare.indexOf('3. bölüm'))).toMatch(/^3\. bölüm · 15–21\. gün\s*$/)
    expect(html).not.toContain('lp-end')
  })
  it('tur 10: bugün bölümün son günü (14): 2. bölüm kartı var (şeritte 14 bugün, "Sonunda:" satırı), yarın (15) onun içinde; 3. bölüm şeritsiz önizleme', () => {
    const p = setup({ n: 14 })
    const html = render(p, { prizes: { 2: 'ödül 2' } })
    const t = text(html)
    expect(t).toMatch(/2\. bölüm · 8–14\. gün Sonunda: ödül 2 bugün Yarın · 15\. gün/)
    expect(html).toMatch(/<li class="now"><span class="lp-cc-o"><span class="lp-eye[^"]*"[\s\S]*?<small>bugün<\/small>/)
    expect(html).toMatch(/class="lp-cc cur"[\s\S]*?class="lp-cc-d"[\s\S]*?class="lp-tc in"/)
    expect((html.match(/class="lp-cc-d"/g) ?? []).length).toBe(1) // 3. bölüm önizlemesi şeritsiz
    expect(t.indexOf('Yarın ·')).toBeLessThan(t.indexOf('3. bölüm · 15–21. gün'))
    expect(html).toMatch(/class="lp-cc nx"[^>]*><b class="lp-cc-t[^"]*"[^>]*><span>3\.\u00a0bölüm/)
    expect(t).not.toContain('Yeni:')
  })
  it('eski kullanıcı (69. gün): içinde bulunduğu 10. bölümün kartı ve 11. bölüm', () => {
    const html = render(setup({ n: 69 }))
    const t = text(html)
    expect(t).toContain('10. bölüm · 64–70. gün')
    expect(t.indexOf('10. bölüm')).toBeLessThan(t.indexOf('11. bölüm'))
    expect(t).not.toContain('12. bölüm')
  })
  it('bölümün gözü: bölümün çeyreği parlak, tur rengi; dış halka yok', () => {
    const html = render(setup({ n: 30 }))
    // 5. bölüm (29–35): 2. tur
    expect(html).toMatch(/class="lp-cc cur" data-l="1"/)
    expect(html).not.toContain('class="ring"')
    const eye = html.slice(html.indexOf('class="lp-eye"'))
    expect((eye.slice(0, eye.indexOf('</svg>')).match(/class="r (?:goal|got)/g) ?? []).length).toBe(7)
  })
  it('30. gün: kupa bugünün durağından büyük, tek ilerleme halkası yol bitmeden kısmen dolu, "tamam" yok; yol bitince tam ve tikli', () => {
    const open = render(setup({ n: 30, done: [true, false, false] }), { nefTop: null })
    expect(open).toContain('class="lp-gm month"')
    const size = Number(open.match(/class="lp-gm-c" style="width:(\d+)px/)[1])
    expect(size).toBeGreaterThan(76 + 24) // sıradaki durak 76 pt + halkası
    expect((open.match(/<circle[^>]*class="(?:tr|on)"/g) ?? []).length).toBe(2) // tek iz + tek dolu yay (parçalı değil)
    const [len, C] = open.match(/class="on"[^>]*stroke-dasharray="([\d.]+) ([\d.]+)"/).slice(1).map(Number)
    expect(len / C).toBeCloseTo(1 / 3, 2) // 3 duraktan 1'i bitti
    expect(text(open)).toContain('30. gün')
    expect(open).not.toContain('lp-lk')
    expect(open).not.toContain('class="lp-nef') // 30. gün sabahı Nef susar (tur 3b)
    const none = render(setup({ n: 30 }))
    expect(none).not.toMatch(/<circle[^>]*class="on"/) // hiç durak bitmedi: yalnız iz
    const done = render(setup({ n: 30, done: [true, true, true] }), { nefEnd: NEF.month })
    expect(done).toContain('class="lp-gm done month"')
    expect(done).toContain('lp-gm-ok')
    expect(text(done)).toContain('İlk ayın tamam: 30 gün.')
  })
  it('bölümün son günü: madalya (kupa değil) ve sabah Nef 15', () => {
    const html = render(setup({ n: 14 }), { nefTop: NEF.chapterDay(2) })
    expect(html).toContain('class="lp-gm"')
    expect(html).not.toContain('lp-gm month')
    expect(text(html)).toContain('2. bölümün son günü: yolu bitirince bölüm tamam.')
    expect(text(html)).toContain('14. gün')
  })
  it('akşam (yol bitmiş): sakin seçenek bandı yok; bugünün bölümünde bugün tikli', () => {
    const html = render(setup({ n: 9, done: [true, true, true] }), { alt: { title: 'Nefes', sub: '5 dk mola', onTap: () => {} } })
    expect(html).not.toContain('5 dk mola')
    expect(html).toMatch(/<li class="past"><span class="lp-cc-o">[^]*?<\/span><small>bugün<\/small>/)
    const open = render(setup({ n: 9 }), { alt: { title: 'Nefes', sub: '5 dk mola', onTap: () => {} } })
    expect(open).toContain('5 dk mola')
  })
  it('tur 6: süresi yazan durakların toplamı başlığa eşit (mola gerçek süresiyle); ölçüm durağı (E testi) süre yazmaz ve toplama girmez', () => {
    const stops = [
      st('weekly', { title: 'Haftalık E testi', minutes: 5, hideMinutes: true, sub: '3 bölüm · sağ, sol, iki göz' }),
      st('routine:isinma', { title: 'Isınma', minutes: 1 }),
      st('breath', { title: 'Nefes', restSlot: true, minutes: 3 }),
      st('snake', { title: 'Yılan', sub: '1 tur', minutes: 2, openEnded: true }),
      st('yoga', { title: 'Yoga', sub: 'Tek Nokta', minutes: 3 }),
      st('reading', { title: 'Okuma', minutes: 3, done: true }),
    ]
    const restMin = 5
    const shown = stops.filter((s) => !s.done).map((s) => metaOf(s, restMin))
    expect(shown).toEqual(['haftada bir', '1 dk', 'Mola · 5 dk', '1 tur · 2 dk', 'Tek Nokta · 3 dk'])
    const sum = shown.reduce((a, t) => a + Number(t.match(/(\d+) dk/)?.[1] ?? 0), 0)
    expect(sum).toBe(pathMinutes(stops, restMin))
    expect(sum).toBe(11) // E testinin 5 dk'sı yok
    expect(stopMinutes(stops[0], restMin)).toBe(0)
    const head = todayLead({ stops, doneCount: 0 }, stops[0], pathMinutes(stops, restMin))
    expect(head.text).toContain('yolun 11\u00a0dakika')
    expect(stopMinutes(stops[2], null)).toBe(3) // mola süresi bilinmiyorsa durağın kendi süresi
  })
  it('tur 9: ilk 7 günde de yarının bölüm kartında gün şeridi ("bugün" işaretli) ve "Sonunda:"; "Yeni:" hap satırı yok', () => {
    const p = setup({ n: 2 })
    p.firsts = new Map([[5, [st('tek-bakis', { title: 'Tek Bakışta' })]]])
    const first = render({ ...p, chapter: false }, { prizes: { 1: 'iris haritan açılır' } })
    expect(first).toContain('class="lp-cc-d"')
    expect(first).toMatch(/<li class="now"><span class="lp-cc-o"><span>2<\/span><\/span><small>bugün<\/small>/)
    expect(text(first)).not.toContain('Yeni:')
    expect(text(first)).toContain('Sonunda: iris haritan açılır')
  })
  it('tur 7: bant komşusu yol parçası bandın kenarına sürer ve solar (kademe yok)', () => {
    const html = render(setup())
    expect(html).toMatch(/<linearGradient id="lpg-[^"]+"/)
    expect(html).toMatch(/d="M50 -26 L50 0 /)
  })
})
