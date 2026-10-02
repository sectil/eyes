// Ana sayfa · ilk görünüm (ana sayfa 5 saniye yeniden tasarımı, 2026-09-30: Yön B "Senin gözün" ve değerlendiricilerin
// aşıları; ANA_SAYFA_5SN_RAPORU.md). Önceki "Bugün kartı"nın (süre, günün zinciri, hap satırı) beklentileri buradaydı;
// kart kalktığı için beklentiler yeni sahneye göre yazıldı:
//   - ilk görünüm tek sahne (.hf): selam, göz (her gün bir ışın; göz bebeğinde sıfır yok), günün tek cümlesi, tek büyük
//     düğme ("Başla" yazılı), "Bugünün yolu · N durak · ≈X dk" satırı; günün zinciri ve hap satırı yok
//   - büyük düğme ölçüm durağında süre yazmaz (S0 kararı 22), adı "Sağ–sol bakış" (S0 kararı 4)
//   - sayı kuralı aynı (karar 5d, S0 kararı 24): seri 3 günden kısaysa göz bebeğinde "N gün seninle" (5 saniye kapı
//     turu 2: yalnız "N gün" neyin günü belli değildi), 3+ ve aynı sayıysa "N gün seri"; 1. günde "İlk gün" (sıfır yok)
//   - göz molası önerisinde cümle "Gözlerin mola istiyor." (önceki Nef satırının yerinde), yolun baloncuğu da görünür
//   - 5 saniye kapı turu 1 (1. gün): büyük düğmede haftalık E testi "E testi" + "haftada bir" ve "E hangi yöne bakıyor?";
//     kurulum günü cümlesi "20 saniyede 3 kez göz kırptın." ve altında anlamı; halkada kilometre taşı yok; İlk Bakış
//     bugünün ışınını yakar
//   - 5 saniye kapı turu 2: halkada kilometre taşı hiç yok; cümle büyük düğmeyi tekrar etmez (düğmenin durağı haftalık
//     E testi ya da yeni durak ise cümle yazılmaz ya da sıradaki aday gelir)
//   - sahibin iki kararı (2026-10-01, SAHIP_ISTEKLERI.md "Ana sayfa iki karar"; beklentiler bu yüzden değişti): ilk cümle
//     bugüne dönük "Bugünkü yolun N dakika, ilk durağın X." (1. günün kırpma sayısı, "yargı değil" satırı ve dünün yolu
//     ilk görünümde yok); tek sayı "Bu hafta N/3 gün" (göz bebeğinde sayı yok, "N gün seri" / "N gün seninle" yok).
//     Cümle durağın adını ve yolun süresini söylediği için büyük düğmenin büyük yazısı "Güne başla", yol satırı yalnız
//     "N durak" (aynı ad ve süre iki kez olmasın).
//   - D9 (sahibin isteği 2026-10-01: Duolingo'daki gibi uzun yol; "bugünün ilk işi ekranda bir kez adıyla"; aç-kapa satırı
//     yok; beklentiler bu yüzden değişti): ilk 7 günün kahramanı bölümün yedi günü (.cs; büyük kart .hg.hero ve dünün izi
//     yok); cümle durağın adını söylerken büyük düğme yalnız "Başla" ve durağın çizimi (.hg.bare, erişilebilir adı
//     "Başla: X"), cümlenin altında durağın ne olduğu; "Bugünün yolu · N durak" satırı (.hf-path) hiç yok, yol (LongPath,
//     .lp) her gün sahnenin hemen altından başlar (TodayPath ve PathList Ana sayfada yok). Kurulum gününün kırpma sayısı
//     ilk görünümde yine yok; yolun içinde Nef'in yorumu olarak var.
//   - D9 tur 2 (beklentiler bu yüzden değişti): yolda haftalık test büyük düğmedeki adıyla "E testi" (erişilebilir ad da;
//     ilk görünüm ve yol aynı adı söylesin), satırı "haftada bir"; cümlenin altında testin üç gözü "Sağ göz, sol göz, iki
//     göz" ("3 bölüm" yolun 7 günlük bölümüyle karıştı). 8. günden sonra sıradaki durak yolun başında da var (dolu,
//     halkalı; "şu an buradasın" işareti yoktu; yol ilk görünümün altında olduğu için ad ilk görünümde yine bir kez).
// TodayPath bileşeninin kendi beklentileri (en alttaki test) değişmedi.
//   - 5 saniye turu 6, Yön B "Tek büyük kart" (ilk 7 gün; beklentiler bu yüzden değişti): sahne yine ekran boyu ve
//     "Bugünün yolu · N durak" satırı geri geldi (yol büyük kartın hemen altından başlayınca mola bandı ve durak yazıları
//     sekme çubuğunun ardında kesiliyordu); büyük kart .hg.hero (işin çizimi büyük); yol TodayPath değil sade liste
//     (PathList), kartın durağı listede yok. TodayPath'in ilk 7 gündeki beklentileri 8. güne (7 geçmiş gün) taşındı.
import { describe, it, expect } from 'vitest'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const { default: Home } = await import('./Home.jsx')
const { default: TodayPath } = await import('../components/TodayPath.jsx')
const { buildPath } = await import('../lib/today.js')
const { registry } = await import('../modules/registry.js')
const { normalizeProfile } = await import('../lib/profile.js')
const settings = { profile: null, reminders: null, consents: {} }
const MIN = 60000
const render = (props = {}) => renderToStaticMarkup(h(Home, { tests: [], sessions: [], settings, onStart: () => {}, ...props }))
const at = (d, hour = 9) => { const t = new Date(); t.setDate(t.getDate() - d); t.setHours(hour, 0, 0, 0); return t.toISOString() }
const scene = (html) => html.match(/<section class="hf[^"]*" aria-label="Bugün">[\s\S]*?<\/section>(?=<)/)?.[0] ?? ''
const text = (h) => h.replace(/<[^>]+>/g, '').replace(/&#x27;/g, "'").replace(/\u2060/g, '').replace(/\u00a0|&nbsp;/g, ' ')
const lead = (html) => { const m = html.match(/<div class="hl[^"]*"><p class="hl-t">([\s\S]*?)<\/p>/)?.[1]; return m == null ? null : text(m) }
const goBtn = (html) => text(html.match(/<button type="button" class="hg[^"]*"[^>]*>[\s\S]*?<\/button>/)?.[0] ?? '')
const goAria = (html) => html.match(/<button type="button" class="hg bare" aria-label="([^"]*)"/)?.[1] ?? null

describe('Ana sayfa · ilk görünüm (senin gözün)', () => {
  it('yeni kullanıcı 1. gün: göz, cümle, büyük düğme, yol satırı; sıfır, zincir ve hap satırı yok', () => {
    const html = render()
    const s = scene(html)
    // Sahibin kararı (2026-10-01): ilk 7 günde iris yok. Tur 6 (Yön B): büyük kart (.hg.hero), altında yol satırı; sade
    // yol listesi sahnenin ardında, büyük kartın durağı listede yok
    expect(s).toContain('class="hf wk1"')
    expect(s).not.toContain('class="hi-eye"')
    expect(s).toContain('class="cs"') // bölümün yedi günü
    expect(s).not.toContain('class="hg hero"')
    expect(s).not.toContain('hf-path') // D9: aç-kapa satırı yok
    expect(html).toContain('<section class="lp" aria-label="Yol">')
    expect(html).not.toContain('class="tp tp-y1"')
    expect(html).not.toContain('<section class="pl"')
    expect(html).not.toMatch(/data-key="weekly/) // düğmenin durağı (E testi) yolda tekrar etmez
    expect(html).toMatch(/aria-label="Çemberler, 1 dakika\. Önce E testi"/)
    expect(html.indexOf('class="lp"')).toBeGreaterThan(html.indexOf('class="hg bare"'))
    expect(html.indexOf('class="lp"')).toBeLessThan(html.indexOf('class="home-tiles"'))
    // D9 v2: yarın ayrıntılı (onaylı cümle 8 ve 10), sonrası bölüm kartları (cümle 11, 1. bölümün ödülü cümle 13). Tur 3:
    // yarın kartında ilk 3 durak ve "ve N durak daha" (16); yalnız iki bölüm kartı (bugünün bölümü ve bir sonraki)
    expect(text(html)).toMatch(/Yarın · 2\. gün · \d+ durak/)
    expect((html.match(/class="lp-tp[ "]/g) ?? []).length).toBeLessThanOrEqual(3)
    expect(text(html)).toContain('Hatırlatma kurmak ister misin?')
    expect(text(html)).not.toContain('Saatini ve günlerini sen seçersin.') // tur 6: hatırlatma yarın kartının son satırı, alt satırsız
    expect(html).toMatch(/class="lp-cc cur"[\s\S]*?class="lp-tc in"[\s\S]*?class="lp-tc-rem"/) // tur 9: yarın bölüm kartının içinde
    expect((html.match(/class="lp-cc(?: cur| nx)?"/g) ?? []).length).toBe(2)
    expect(text(html)).toContain('1. bölüm · 1–7. gün')
    expect(text(html)).toContain('Sonunda: iris haritan açılır')
    expect(text(html)).toContain('2. bölüm · 8–14. gün')
    expect(text(html)).not.toContain('3. bölüm · 15–21. gün')
    expect(html).not.toContain('class="pp"') // geçmiş Ana sayfada yok
    expect(html).not.toContain('class="lp-nef') // 1. gün: Nef'in yoldaki cümlelerinden hiçbiri tutmaz
    expect(s).not.toMatch(/\b0\/\d/) // gün başında "0/4" yok
    expect(html).not.toContain('class="dc-s ')
    expect(html).not.toContain('hh-chips')
    expect(html).not.toContain('gün seninle')
    // D9: düğme adı tekrar etmez ("E testi" ilk görünümde bir kez: cümlede); erişilebilir adı durağı söyler
    expect(goBtn(s)).toBe('Başla')
    expect(goAria(s)).toBe('Başla: E testi')
    expect((text(s).match(/E testi/g) ?? []).length).toBe(1)
    expect(text(s)).toContain('Sağ göz, sol göz, iki göz') // cümlenin altında durağın ne olduğu (tur 2: "bölüm" yok)
    expect(text(s)).not.toContain('3 bölüm')
    expect(s).not.toContain('class="hi-mark"') // halkada kilometre taşı yok
    // Bugüne dönük cümle (sahibin kararı 2026-10-01): yolun süresi ve ilk durak; "Bugün haftalık E testi günü." yazılmaz.
    // Tur 7 (sahibin kararı): yolda süresi yazmayan haftalık E testi varken "Bugünkü yolun N dakika ve haftalık E testi."
    expect(lead(s)).toMatch(/^Bugünkü yolun \d+ dakika ve haftalık E testi\.$/)
    expect(s).not.toContain('Bugün haftalık E testi günü.')
  })
  it('kurulum günü: kırpma sayısı ve "yargı değil" ilk görünümde yok, cümle bugüne dönük; İlk Bakış ilk ışını yakar', () => {
    const setup = new Date()
    setup.setHours(Math.min(setup.getHours(), 9), 0, 0, 0)
    const profile = normalizeProfile({ version: 2, date: setup.toISOString(), firstLook: { blinks: 3, seconds: 20, method: 'camera', date: setup.toISOString() } })
    const html = render({ settings: { ...settings, profile } })
    expect(lead(html)).toMatch(/^Bugünkü yolun \d+ dakika ve haftalık E testi\.$/)
    expect(scene(html)).not.toContain('kez göz kırptın')
    expect(scene(html)).not.toContain('yargı değil')
    // D9 v2 (sahibin kararı 3; beklenti bu yüzden değişti): yolda Nef yalnız onaylı 13 cümleyle; kurulum gününün kırpma
    // sayısı yolda da yok
    expect(html).not.toContain('kez göz kırptın')
    expect(html).not.toContain('class="hi-mark"')
    expect(html).not.toContain('class="hi-disc') // ilk 7 gün iris yok (sahibin kararı 2026-10-01)
    expect(html).not.toContain('hi-pupil')
  })
  it('8. gün: yol uzun yol (TodayPath değil); sıradaki durak büyük düğmede ve yolun başında (halkalı); bölüm hapı', () => {
    const days = Array.from({ length: 7 }, (_, i) => ({ type: 'breath', seconds: 120, pattern: 'calm', date: at(i + 1) }))
    const html = render({ sessions: days })
    expect(html).toContain('<section class="lp" aria-label="Yol">')
    expect(html).not.toContain('class="tp tp-y1"')
    expect(html).not.toContain('class="tp-jb"')
    expect(goAria(scene(html))).toBe('Başla: E testi')
    expect(html).toMatch(/class="lp-n today now"[^>]*data-key="weekly[^"]*"[^>]*aria-label="E testi, sırada"/) // ölçüm durağı süre söylemez (S0 kararı 22)
    expect((text(scene(html)).match(/E testi/g) ?? []).length).toBe(1) // sahnede ad yalnız cümlede

    expect(html).toMatch(/<span class="lp-day-h now"><b>2\. bölüm<\/b><span>8\. gün<\/span>/)
    expect(html).not.toContain('class="pp"') // D9 v2: geçmiş Ana sayfada yok (sayfa selamdan başlar)
    expect(html.indexOf('class="hf"')).toBeLessThan(html.indexOf('class="lp"'))
  })
  it('göz molası önerisinde cümle "Gözlerin mola istiyor.", düğme "Nefes · 5 dk"; yolun baloncuğu görünür', () => {
    const eyeBudget = { locked: false, due: 'budget', used: 5 * MIN, budgetMs: 5 * MIN, leftMs: 0 }
    const html = render({ eyeBudget })
    expect(lead(scene(html))).toBe('Gözlerin mola istiyor.')
    expect(goBtn(scene(html))).toContain('Nefes · 5 dk')
    // İlk 7 gün: kart yolun durağı değil; yolun sıradaki durağı listede, mola bitene dek kilitli (TodayPath'teki gibi)
    expect(html).toContain('aria-label="E testi, kilitli (mola 5:00)"')
  })
  it('tek sayı: ilk görünümde "N gün seri" ve "N gün seninle" yok, göz bebeğinde sayı yok; halkada gün sayısı yok', () => {
    const days = (n) => Array.from({ length: n }, (_, i) => ({ type: 'breath', seconds: 120, pattern: 'calm', date: at(i + 1) }))
    for (const n of [2, 3, 12]) {
      const s = scene(render({ sessions: days(n) }))
      expect(s).not.toContain('gün seri')
      expect(s).not.toContain('gün seninle')
      expect(s).not.toContain('hi-pupil')
      expect(s).not.toContain('class="hi-mark"')
      expect((s.match(/Bu hafta \d+(\/\d+)? gün/g) ?? []).length).toBeLessThanOrEqual(1) // hafta en çok bir kez
    }
  })
  it('bugün bir durak yapıldıysa günün cümlesi düşer; düğmenin tekrarı olan satır yazılmaz', () => {
    const now = Date.now()
    const tests = ['R', 'L', 'OU'].map((e, i) => ({ type: 'va-weekly', eye: e, date: new Date(now - (10 - i) * MIN).toISOString() }))
    const html = render({ tests })
    expect(lead(scene(html))).toBeNull()
    expect(goBtn(scene(html))).toContain('Yola devam et')
    // D9: yol satırı yok; yol başladıktan sonra biten durak yolda tikli, sıradaki yerinde vurgulu
    expect(scene(html)).not.toContain('hf-path')
    expect(html).toContain('aria-label="E testi, tamam"')
    expect(html).toMatch(/aria-label="Çemberler, 1 dakika, sırada"/)
  })
  it('iris 7 geçmiş günden sonra eskisi gibi; daha önce yok', () => {
    const days = (n) => Array.from({ length: n }, (_, i) => ({ type: 'breath', seconds: 120, pattern: 'calm', date: at(i + 1) }))
    const six = scene(render({ sessions: days(6) }))
    expect(six).toContain('class="hf wk1"')
    expect(six).not.toContain('class="hi-eye"')
    const seven = scene(render({ sessions: days(7) }))
    expect(seven).toMatch(/<section class="hf" /)
    expect(seven).toContain('class="hi-eye"')
    expect(seven).not.toContain('hf-path') // D9: aç-kapa satırı yok
  })
  // D9: "bugünün ilk işi ekranda bir kez adıyla" (sahibin isteği): ad cümlede; düğme yalnız "Başla" ve erişilebilir adı
  // aynı durak (tek kaynak korunur); yol düğmenin durağını tekrar yazmaz
  it('tek kaynak: cümlenin "ilk durağın X"i büyük düğmenin durağı, ad ilk görünümde bir kez (1., 2., 9. gün)', () => {
    const day = (d) => [{ type: 'routine', setId: 'isinma', seconds: 60, date: at(d) }, { type: 'breath', seconds: 120, pattern: 'calm', date: at(d) }]
    for (const n of [0, 1, 8]) {
      const sessions = Array.from({ length: n }, (_, i) => day(i + 1)).flat()
      const s = scene(render({ sessions }))
      // tur 7 (sahibin kararı): yolda haftalık E testi varken başlık "Bugünkü yolun N dakika ve haftalık E testi." ve durak
      // adını söylemez; düğmenin erişilebilir adı yine durağı söyler
      if (lead(s)?.endsWith('ve haftalık E testi.')) {
        expect(goAria(s)).toMatch(/^Başla: .+/)
        expect(goBtn(s)).toBe('Başla')
        continue
      }
      const name = lead(s)?.match(/ilk durağın (.+)\.$/)?.[1]
      expect(name).toBeTruthy()
      expect(goAria(s)).toBe(`Başla: ${name}`)
      expect(goBtn(s)).toBe('Başla')
      expect(text(s).split(name).length - 1).toBe(1)
    }
  })
  it('hafta satırı sıfırken yolun altında yazılmaz (S0 kararı 23)', () => {
    expect(render()).not.toMatch(/Bu hafta 0\//)
  })
  it('TodayPath lead: ilerlemeyle kurulmayan yolda (staged yok) çizim aynı', () => {
    const plan = buildPath(registry.live, { tests: [], sessions: [], now: new Date() })
    const draw = (p) => renderToStaticMarkup(h(TodayPath, { plan, eye: null, day: 1, onStart: () => {}, ...p }))
    expect(draw({ lead: true })).toBe(draw({}))
    expect(draw({ lead: true })).toContain('class="tp-jb"')
  })
})
