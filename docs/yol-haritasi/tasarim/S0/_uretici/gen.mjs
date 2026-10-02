import fs from 'node:fs'
import { I, svg, MARK, shot, moonSvg, homeHead, dayBlock, nowBlock, homeMap, todayPath, tabbar, growthMap, breathCurve, moonTrack, GLYPH } from './lib.mjs'

const here = new URL('.', import.meta.url).pathname
const css = fs.readFileSync(here + 'page.css', 'utf8')
const js = fs.readFileSync(here + 'client.js', 'utf8')
const OUT = process.argv[2] ?? '/home/user/eyes/docs/yol-haritasi/tasarim/S0/ekranlar.html'

// Kararlar (30 Eylül 2026 turu; gerekçeler S0/sorular-kararlar.md): sayı = ekranlar-ozet.md Bölüm 3, "Ç" = bu çizim
// sırasında çıkan soru (plan aşamaları Y1–Y6 ile karışmasın). kind 'sahip' = sahibin kararı, öneriyle.
const q = (n, text, kind = 'karar') => `<li class="${kind}"><span class="n">${n}</span><span>${kind === 'sahip' ? '<b class="l">Senin kararın.</b> ' : ''}${text}</span></li>`
// Her bölümün altında: tek cümlelik Neden (bölüm numarasıyla), kararlar, açılır ayrıntı ve varsayımlar
function why({ neden, more = '', vars = '', qs = [] }) {
  const det = more || vars ? `<details><summary>Ayrıntı ve varsayımlar</summary>${more ? `<p>${more}</p>` : ''}${vars ? `<p><b class="l">Varsayım.</b> ${vars}</p>` : ''}</details>` : ''
  return `<div class="pg-why"><p><b class="l">Neden.</b> ${neden}</p>${qs.length ? `<p class="pg-kh">Kararlar</p><ul aria-label="Kararlar">${qs.join('')}</ul>` : ''}${det}</div>`
}
const sec = ({ id, title, meta, shots, parts = '', whyHtml, extra = '' }) => `<section class="pg-sec" id="${id}"><header class="pg-sh"><span class="pg-letter" aria-hidden="true">${id}</span><div><h3>${title}</h3><p>${meta}</p></div></header><div class="shots">${shots.join('')}</div>${parts ? `<div class="pg-parts">${parts}</div>` : ''}${whyHtml}${extra}</section>`
const part = (label, body, note = '', ref = '', cls = '') => `<div class="part${cls ? ' ' + cls : ''}"><b>${label}</b><div class="part-body">${body}</div>${note || ref ? `<p>${note}${ref ? ` <span class="ref">(${ref})</span>` : ''}</p>` : ''}</div>`
const screen = (inner, cls = '') => `<div class="screen${cls ? ' ' + cls : ''}">${inner}</div>`
const chev = svg(I.chevR)

// Bölünmez boşluk: sayı ile birimi, tarihi, "E testi"ni ve soru ekini aynı satırda tutar (yalnız sayfa gövdesine uygulanır)
function nb(html) {
  return html
    .replace(/(\d[\d.,]*\.?) (dk|sn|kez|gün\p{L}*|saniye\p{L}*|dakika\p{L}*|saat\p{L}*|Ekim|Eylül|Kasım|kişi|px|pt|mm)(?=[\s.,;:)"'’<·]|$)/gu, '$1 $2')
    .replace(/\bE testi/g, 'E testi')
    .replace(/yol (\d)/g, 'yol $1')
    .replace(/ (mi|mı|mu|mü)\?/g, ' $1?')
    .replace(/fark etmediğin/g, 'fark etmediğin')
    .replace(/(\d{2}\.\d{2})–(\d{2}\.\d{2})/g, '$1\u2060–\u2060$2')
}

// ================= a) Ana sayfa · günün ilk açılışı =================
const LINE1 = "İlk Bakış'ta 20 saniyede 3 kez kırptın. 28. gün yeniden bakacağız."
// 1. günün yolu (b'deki ile aynı); Ana sayfada Gelişim haritasının altında başlar
const DAY1_STOPS = [
  { title: 'Haftalık E testi', form: 'me', glyph: 'E', st: 'now', sub: '3 bölüm · sağ, sol, iki göz' },
  { title: 'Çemberler', form: 'pr', glyph: 'constel', st: 'later', sub: '1 dk' },
  { title: 'Nefes', form: 'rest', glyph: 'moon', st: 'later', restMin: 1, sub: 'Gözlerin dinlenirken nefes al.' },
  { title: 'Göz kırpma', form: 'ex', glyph: 'lid', st: 'later', sub: '1 dk' },
]
const day1 = todayPath({ stops: DAY1_STOPS, blocks: [{ eyeMin: 1, eyeDone: 0, capMin: 4 }, { eyeMin: 1, eyeDone: 0, capMin: 4 }], bubble: { word: 'Hadi', line: 'İlk durak: Haftalık E testi' }, bandMin: 1 })
const pathPeek = (html, h = 'Bugünün yolu') => `<div class="home-h"><h2>${h}</h2></div>${html}`
const a1 = shot({
  label: '1. gün · 1 Ekim Perşembe, 10.00 · ilk ekran',
  cap: 'İlk duraktan önce sıfır yazılmaz: diyaframın yanında "4 durak" ve günün süresi durur; ilk durak bitince "1 / 4" olur. Bütün sayılar sıfır olduğu için sayı sütunu çizilmez. Ölçüm durağında süre yazılmaz; büyük düğme de yol gibi yalnız "Haftalık E testi" der. İlk Bakış\'ın sayısı Nef satırında, iris tonunda bir zeminle öne çıkar. Kayıt üç alandan azken harita kartı tek satır kadardır; tek kart yuvası boşsa hemen altında Bugünün yolu başlar.',
  ref: 'karar 5d, §3.F.3, 22, Ç16',
  tabs: 'home',
  body: screen(
    homeHead({ date: '1 Ekim Perşembe', phase: 'küçülen şişkin ay', k: 0.752, waxing: false }) +
    dayBlock({ n: 4, rest: 2, left: 8, pre: true }) +
    nowBlock({ line: LINE1, title: 'Haftalık E testi', hl: '20 saniyede 3 kez kırptın', tone: 'first' }) +
    homeMap([0, 0, 0.04, 0, 0, 0, 0], '1 / 7 alanda kaydın var', undefined, 'sm') +
    pathPeek(day1.html)
  ),
})
const LINE7 = 'Bugün 7. gün: ilk haftanı tamamlıyorsun.'
const a2 = shot({
  label: '7. gün · 7 Ekim Çarşamba, 10.00 · ilk ekran',
  cap: 'Seri en az 3 gün olduğu için görünür ve sütunun başında durur. Hafta satırı "2/3 gün bu hafta" diye okunur; "gün seninle" seriyle aynı sayı olduğu için yazılmaz (Ç19, 24). Cümle 2. öncelikten gelir: ilk haftanın tamamlandığı gün bir kilometre taşıdır. Nef satırı altın zeminde durur, altında ilk haftanın yedi günü: altısı dolu, bugün parlar (aşağıdaki tablo).',
  ref: '§3.F.3, §3.F.4, §3.F.5',
  tabs: 'home',
  body: screen(
    homeHead({ date: '7 Ekim Çarşamba', phase: 'küçülen hilal', k: 0.127, waxing: false }) +
    dayBlock({ n: 10, rest: 4, left: 15, pre: true, facts: [{ k: 'streak', v: 6 }, { k: 'week', v: '2/3', dots: ['d', 'd', 't', '', '', '', ''] }, { k: 'days', v: 6 }] }) +
    nowBlock({ line: LINE7, title: 'Isınma · 1 dk', tone: 'ms', pips: { n: 7, done: 6 } }) +
    homeMap([0.04, 0.21, 0.04, 0.21, 0.14, 0, 0], '5 / 7 alanda kaydın var')
  ),
})
const a3 = shot({
  label: '30. gün · 30 Ekim Cuma, 10.00 · ilk ekran',
  cap: 'Haftalık hedef tuttuğu için hafta satırı "4 gün bu hafta" olur ve yanında yeşil tik durur (Ç19). 21 günü geçen seri altın zeminli haptır. 28. ve 29. gün kilometre taşıydı (iris haritası, E testi); bugünün cümlesi 7. öncelikten gelir, Nef\'in gözünde tamam işareti durur. Bir ayda renklenen harita büyük ve iris halkasıyla çizilir.',
  ref: '§3.F.3, §3.F.4',
  tabs: 'home',
  body: screen(
    homeHead({ date: '30 Ekim Cuma', phase: 'küçülen şişkin ay', k: 0.782, waxing: false }) +
    dayBlock({ n: 11, rest: 4, left: 18, pre: true, facts: [{ k: 'streak', v: 29 }, { k: 'week', v: '4✓', dots: ['d', 'd', 'd', 'd', 't', '', ''] }, { k: 'days', v: 29 }] }) +
    nowBlock({ line: 'Dün yolunun bütün duraklarını tamamladın.', title: 'Isınma · 1 dk', tone: 'ok' }) +
    homeMap([0.18, 1, 0.5, 1, 0.82, 0.07, 0], '6 / 7 alanda kaydın var', undefined, 'big')
  ),
})
// Günün cümlesi 1–8. gün: §3.F.4 tablosu; "aynı öncelik iki gün üst üste gelmez" (0, 1 ve 2 hariç; karar 5); yeni gelenler §3.A.9'dan
const LEADS = [
  ['1. gün', '1 Ekim Perşembe', '1', LINE1, 'kurulumun ilk günü'],
  ['2. gün', '2 Ekim Cuma', '6', 'Bugün yeni: sağ–sol bakış.', 'yeni basamak'],
  ['3. gün', '3 Ekim Cumartesi', '7', 'Dün yolunun bütün duraklarını tamamladın.', 'yeni basamak var, ama 6. öncelik dün kullanıldı'],
  ['4. gün', '4 Ekim Pazar', '6', 'Bugün yeni: yukarı–aşağı.', 'yeni basamak'],
  ['5. gün', '5 Ekim Pazartesi', '7', 'Dün yolunun bütün duraklarını tamamladın.', 'uzağa bakış yeni, ama 6. öncelik dün kullanıldı; ilk rapor kendi penceresiyle açılır'],
  ['6. gün', '6 Ekim Salı', '6', 'Bugün yeni: Fark Ettin mi?', 'yeni modül'],
  ['7. gün', '7 Ekim Çarşamba', '2', LINE7, 'kilometre taşı: ilk hafta; yakın–uzak\'ın yeniliğini yoldaki "Yeni" etiketi söyler'],
  ['8. gün', '8 Ekim Perşembe', '2', 'Bugün haftalık E testi günü.', 'kilometre taşı: ikinci E testi; 2. öncelik tekrar kuralının dışında'],
]
const leadTable = `<table class="pg-tbl"><thead><tr><th>Gün</th><th>Öncelik</th><th>Nef satırı</th></tr></thead><tbody>${LEADS.map(([d, date, p, s, why]) => `<tr><td>${d}<br><span class="muted small">${date}</span></td><td>${p}</td><td>${s}<br><span class="muted small">${why}</span></td></tr>`).join('')}</tbody></table>`
const factsOnly = (items) => `<div class="hh-num"><div class="hh-facts" style="border-top:0;padding-top:0">${items.join('')}</div></div>`
const aParts =
  part('Günün cümlesi · 1–8. gün', leadTable,
    'Aynı öncelik iki gün üst üste gelmez; 0, 1 ve 2. öncelik bunun dışındadır, çünkü her kilometre taşı ayrı bir olaydır. 4. öncelik (dün bir ilk ya da rekor) benzetimde sayılmadı. (h)\'deki olay satırı da bu tablodandır.', '§3.F.4, §3.F.5, §3.A.9', 'wide') +
  part('2. gün · büyük düğmede "Yeni"', nowBlock({ line: 'Bugün yeni: sağ–sol bakış.', title: 'Sağ–sol bakış · 1 dk', isNew: true }).replace('<div class="hh-alt">', '<div class="hh-alt" hidden>'),
    'Merdivenden yeni bir basamak açıldığı gün görünür. Rozet sarı değildir; sarı yalnız ödül ve seri içindir.', '§3.A.6, §3.F.3') +
  part('3. gün · kısa seri gizli', factsOnly([`<div class="hh-fact wk">${svg(I.cal, 'f2')}<b>2/3</b>gün bu hafta</div>`, `<div class="hh-fact dim">${svg(I.circleDot, 'f3')}<b>2</b>gün seninle</div>`]),
    '2 günlük seri yazılmaz; yerinde "2 gün seninle" durur. Bir gün atlanınca "0 gün seri" hiç görünmez.', 'karar 5d') +
  part('12 Ekim Pazartesi · hafta satırı gizli', factsOnly([`<div class="hh-fact st">${svg(I.flame, 'f1')}<b>11</b>gün seri</div>`]),
    'Haftanın ilk sabahı "0/3 gün bu hafta" yazılmaz; ilk durak bitince "1/3" görünür. Yolun altındaki "Bu hafta 0/3 gün" de gizlidir. "11 gün seninle" seriyle aynı sayı olduğu için yazılmaz.', 'karar 5d, 23, 24') +
  part('26 Ekim Pazartesi · dolunay günü', `<span class="eyebrow dl"><span>26 Ekim Pazartesi</span><span class="sep" aria-hidden="true">·</span><span class="mo tap44">${moonSvg(1, false)}dolunay${svg(I.chevR, 'chev')}</span></span>`,
    '"Yeniay" ve "dolunay" yalnız o takvim gününde yazılır; öteki günlerde öbür altı evreden biri yazılır. "Bu gece dolunay" yazılmaz: dolunay anı sabah ya da öğlen de olabilir (26 Ekim 2026\'da 07.12). Kesik çizgi, satırın 44 pt\'lik dokunma alanını gösterir.', '§3.E.3, §3.E.7, 3') +
  part('Uzun aradan dönüş · 3. öncelik', nowBlock({ line: 'Kaldığın yerden: basamakların aynı.', title: 'Isınma · 1 dk' }).replace('<div class="hh-alt">', '<div class="hh-alt" hidden>'),
    'En az 2 günlük aradan sonraki ilk açılışta yazılır; hiçbir sayı sıfırlanmaz.', '§3.F.4, §3.A.8')

// Sahibin kararı: yoga sabah sorusunun yeri (onaylı yoga planı; components/YogaMorningCard.jsx, Home.jsx:236-237)
const yogaCard = `<section class="card al-wg ym" aria-label="Uykuya Geçiş · tek soru"><div class="al-wg-top"><span class="al-ey">Uykuya Geçiş · tek soru</span></div><p class="al-q">Dün gece uykuya dalmak ne kadar kolaydı?</p><div class="ym-scale" role="group">${Array.from({ length: 10 }, (_, k) => `<span>${k + 1}</span>`).join('')}</div><p class="ym-ends"><span>1 · çok zor</span> <span>10 · çok kolay</span></p><div class="al-btns"><span class="btn btn-secondary btn-sm al-fit">Atla</span></div></section>`
const Y16 = { date: '16 Ekim Cuma', phase: 'büyüyen hilal', k: 0.275, waxing: true }
const ay1 = shot({
  label: 'Bugünkü onaylı yer · 16 Ekim Cuma, 07.40 · ilk ekran',
  cap: 'Yoganın Uykuya Geçiş dersinden sonraki sabah. Onaylı yoga planındaki kart başlığın hemen altında durur; Nef\'in cümlesi ilk ekranın dibine, büyük düğme ilk ekranın altına iner.',
  ref: 'yoga planı, §3.F.3',
  tabs: 'home', time: '07:40',
  body: screen(
    homeHead(Y16) + yogaCard +
    dayBlock({ n: 11, rest: 4, left: 18, pre: true, facts: [{ k: 'streak', v: 15 }, { k: 'week', v: '4✓', dots: ['d', 'd', 'd', 'd', 't', '', ''] }, { k: 'days', v: 15 }] }) +
    nowBlock({ line: 'Dün yolunun bütün duraklarını tamamladın.', title: 'Isınma · 1 dk', tone: 'ok' })
  ),
})
// Önerimde aynı sabahın ilk açılışı: kart yok, ilk 5 saniye (a)'daki gibi
const ay0 = shot({
  label: 'Önerim · aynı sabah, ilk açılış (07.40)',
  cap: 'Kart henüz yoktur: ilk ekran (a)\'daki gibidir ve büyük düğme görünür. Soldaki telefonla aynı an; fark ilk bakışta buradadır.',
  ref: '§2.2 K4, §3.F.3',
  tabs: 'home', time: '07:40',
  body: screen(
    homeHead(Y16) +
    dayBlock({ n: 11, rest: 4, left: 18, pre: true, facts: [{ k: 'streak', v: 15 }, { k: 'week', v: '4✓' }, { k: 'days', v: 15 }] }) +
    nowBlock({ line: 'Dün yolunun bütün duraklarını tamamladın.', title: 'Isınma · 1 dk', tone: 'ok' }) +
    homeMap([0.07, 0.5, 0.25, 0.5, 0.36, 0.04, 0], '6 / 7 alanda kaydın var')
  ),
})
const ay2 = shot({
  label: 'Önerim · aynı sabah, ilk duraktan sonra (07.44)',
  cap: 'Isınma bitip Ana sayfaya dönülünce kart büyük düğmenin hemen altında açılır ve 12.00\'ye kadar durur. "Yola devam et" ilk ekranda kalır; soru onun hemen altında başlar.',
  ref: '§2.2 K4, yoga planı',
  tabs: 'home', time: '07:44',
  body: screen(
    homeHead(Y16) +
    dayBlock({ n: 11, rest: 4, done: 1, left: 17, facts: [{ k: 'streak', v: 16 }, { k: 'week', v: '5✓', dots: ['d', 'd', 'd', 'd', 'd', '', ''] }, { k: 'days', v: 16 }] }) +
    nowBlock({ line: 'Kaldığın yerden devam: Uzağa bakış.', sub: 'Nef · 1 dk', eyebrow: 'Yola devam et', title: 'Uzağa bakış · 1 dk' }) +
    yogaCard
  ),
})
const askYoga = `<div class="pg-ask" id="soru-yoga"><span class="pg-ey">Senin kararın · tek soru</span><h4>Yoganın sabah sorusu Ana sayfada ne zaman ve nerede görünsün?</h4><p>Onaylı yoga planındaki "Dün gece uykuya dalmak ne kadar kolaydı?" kartı, yoganın Uykuya Geçiş dersinden sonraki sabah (04.00–11.59) başlığın hemen altına gelir. O sabahlarda Nef'in cümlesi ve büyük düğme aşağı kayar; büyük düğme 390 pt'de de ilk ekranda görünmez. Onaylı yoga tasarımına dokunduğu için bu karar senin.</p><p><b class="l">Önerim:</b> kart günün ilk dokunuşundan sonra açılsın ve büyük düğmenin hemen altında dursun. Yenilikler ve izin sayfaları için onayladığın kural da budur (§2.2 K4). Sabahın ilk açılışı (a)'daki gibi kalır. Duraklar Ana sayfadaki yoldan açıldığı için kişi ilk duraktan sonra Ana sayfaya döner: "Yola devam et" ilk ekrandadır, soru hemen altında görünür. 12.00 sınırı ve öteki kurallar aynı kalır. Bedeli: soru ilk açılışta görünmez; ilk dokunuş 12.00'yi geçerse o gün hiç görünmez.</p><p class="pg-small">Öbür seçenek: kart Gelişim haritasının altına, akşam kartının durduğu yere insin. İlk açılışta da vardır, ama kaydırmadan görünmez.</p><div class="shots ask3"><div class="ask-col now"><span class="ask-tag">Bugünkü onaylı yer</span>${ay1}</div><div class="ask-col rec"><span class="ask-tag">Önerim</span><div class="ask-pair">${ay0}${ay2}</div></div></div></div>`

const secA = sec({
  id: 'a', title: 'Ana sayfa · günün ilk açılışı', meta: 'Aşama Y3, ay Y4 · §3.F.3, §3.F.4, §3.E.7',
  shots: [a1, a2, a3], parts: aParts,
  whyHtml: why({
    neden: `İlk beş saniyede göz sırasıyla tarih ve ay, selam, Nef'in tek cümlesi ve büyük düğmeye gider (§3.F.3).`,
    more: `Cümle §3.F.4'teki öncelik sırasıyla seçilir, en çok 70 karakterdir ve gün içinde değişmez. Başlıkta hava yoktur, yalnız ay vardır (App Review yedeği, §1). Sıfırlar ve 3 günden kısa seri görünmez (karar 5d). 320 pt'de ay kısmı ikinci satıra iner (§3.E.7).`,
    vars: `Ay simgesinin renkleri (açık temada aydınlık kısım beyaz ve çizgilidir); günün cümlesi gösterilirken Nef satırında alt satır olmaması (durak ve süre yalnız düğmede yazar); "Yeni" rozetinin görünüşü; 1–8. günün cümle tablosu; ilk duraktan önceki "N durak · bugün ≈ M dk" satırı; diyaframın iris tonu, serinin altın rengi ve 21 günden sonra hapı, hafta satırının yeşil tiki, Nef satırındaki vurgu, ilk günün iris zemini, kilometre taşı zemini ve yedi günü, tamam işareti; sakin seçeneklerin (Nefes, Dalga) tek satırlık hapları; harita kartının ilk günlerde küçük, bir ay dolunca büyük çizilmesi (hepsi görünüş önerisi; metinler aynı).`,
    qs: [
      q('1', 'Tarih satırı kodun bugünkü biçimindedir: "7 Ekim Çarşamba". Kişinin her gün gördüğü satır değişmez; sayfadaki bütün tarihler bu biçimdedir.'),
      q('2', 'Ay simgesi evre adının hemen önünde durur.'),
      q('3', 'Dolunay günü şeritte evre adı "dolunay" yazılır; "Bu gece dolunay" hiçbir yerde yazılmaz (yukarıdaki parça ve d).'),
      q('5', '7. günün cümlesi "Bugün 7. gün: ilk haftanı tamamlıyorsun." (2. öncelik). Kilometre taşları da 0 ve 1 gibi tekrar kuralının dışındadır; böylece 8. gün "Bugün haftalık E testi günü." yazılabilir. Yakın–uzak\'ın yeniliğini yoldaki "Yeni" etiketi söyler (b).'),
      q('Ç16', 'Karar 5d gereği ilk duraktan önce "0 / 4" yazılmaz; diyaframın yanında "4 durak" ve günün süresi durur, ilk durak bitince "1 / 4" olur.'),
      q('22', 'Büyük düğme de yol gibi ölçüm duraklarında süre yazmaz: "Haftalık E testi". Bu süre cihazda ölçülmedi.'),
      q('23', 'Değeri sıfır olan her sayı Ana sayfada gizlenir: Pazartesi sabahı "0/3 gün bu hafta" ve yolun altındaki "Bu hafta 0/3 gün" de.'),
      q('24', 'Seri 3 güne ulaşınca "N gün seninle" satırı da kalır; plandaki "yerine" yalnız 3 günden kısa seri içindir. Seriyle aynı sayıyken yazılmaz: aynı sayı sütunda iki kez okunmasın.'),
      q('Ç19', 'Hafta satırı "2/3 gün bu hafta" diye yazılır; hedef tutunca "4 gün bu hafta" ve yeşil tik. "4✓ hafta" dört hafta diye okunuyordu; yolun altındaki "Bu hafta 2/3 gün" ile de aynı dil olur.'),
      q('19', 'Yoganın sabah sorusunun (Uykuya Geçiş dersinden sonraki sabah) Ana sayfadaki yeri ve zamanı. Önerim ve üç telefon hemen aşağıda.', 'sahip'),
    ],
  }),
  extra: askYoga,
})

// ================= b) Bugünün yolu ve nefes arası =================
// Nef izni olmayan kişide Ana sayfadaki Nef tanıtım kartı (bugünkü CoachCard; metin §3.C.2 önerisi, (i)'de de)
const nefIntro = `<section class="card coach-card coach-intro"><div class="row between"><span class="coach-badge">${svg(I.sparkles)} Nef Göz Koçu</span></div><p class="coach-lead">Kendi verine bakıp her gün bir öneri, her hafta ve her ay bir değerlendirme yazar.</p><span class="btn btn-ghost btn-sm" style="align-self:flex-start">Nasıl çalışır, aç</span></section>`
const b1 = shot({
  label: '1. gün · Bugünün yolu, 8 dk',
  cap: 'Ana sayfa kaydırıldı. 1. gün mola 1 dakikadır ve nefesle biter, bu yüzden bantta "Mola · 1 dk" yazar. Sıradaki durağın "Başla" hapı dolu gradyanla çizilir; sırası gelmemiş duraklar kilitli ama soluk değildir. 2. bölümün tek durağı solda olduğu için bölüm etiketi sağa geçer, yol etiketin üstünden geçmez (Ç17). Bugünün görevi 2. günden açılır. "Bu hafta 0/3 gün" satırı gizlenir; altında Nef\'in tanıtım kartı bugünkü gibi başlar.',
  ref: '§3.A.4, §3.A.9, karar 5d',
  tabs: 'home',
  body: screen(`${day1.html}${nefIntro}`, 'crop'),
})
const day7 = todayPath({
  stops: [
    { title: 'Isınma', form: 'ex', glyph: 'arrows', st: 'done' },
    { title: 'Uzağa bakış', form: 'ex', glyph: 'far', st: 'done' },
    { title: 'Çemberler', form: 'pr', glyph: 'constel', st: 'done' },
    { title: 'Yakın–uzak', form: 'ex', glyph: 'nearfar', st: 'done', tag: 'Yeni', tagNew: true },
    { title: 'Nefes', form: 'rest', glyph: 'moon', st: 'now', restMin: 3, sub: 'Gözlerin dinlenirken nefes al.' },
    { title: 'Fark Ettin mi?', form: 'pr', glyph: 'street', st: 'later', sub: '2 dk' },
    { title: 'Yukarı–aşağı', form: 'ex', glyph: 'updown', st: 'later', sub: '1 dk' },
    { title: 'Göz kırpma', form: 'ex', glyph: 'lid', st: 'later', sub: '1 dk' },
    { title: 'Yoga', form: 'pr', glyph: 'lotus', st: 'later', sub: 'Kendini Tanımak · 3 dk' },
    { title: 'Bugünün görevi', form: 'fi', glyph: 'spark', st: 'later', sub: '1 dk' },
  ],
  blocks: [{ eyeMin: 4, eyeDone: 4, capMin: 4 }, { eyeMin: 4, eyeDone: 0, capMin: 4 }],
  bubble: { word: 'Rahatla', line: 'Sırada mola: 3 dk nefes, 2 dk dinlenme' },
  bandMin: 5,
  week: 'Bu hafta 2/3 gün',
})
const b2off = day7.L.pos[1][1] + 112 // şerit (24 px) dahil: Çemberler tam görünür, Göz kırpma sekme çubuğunun üstünde biter
const b2 = shot({
  label: '7. gün · 10.40, sırada mola',
  cap: 'Ekran kaydırıldı; ilk dört durak bitti. Bant, yuvarlak köşeli bir havuz gibi iki bölümün arasında durur ve molanın tamamını söyler: 5 dk (3 dk nefes, 2 dk dinlenme). Yakın–uzak bugün geldiği için "Yeni" etiketini taşır. Bantta ilk yıldız etiketin altındadır (Ç17).',
  ref: '§1 "Aralar", §3.A.6',
  tabs: 'home', time: '10:40',
  body: screen(`<div style="margin-top:-${b2off}px">${day7.html}</div>`, 'crop'),
})
const b3 = shot({
  label: 'Mola · Nefes bitti (3. günden başlayarak)',
  cap: 'Bugünkü sonuç ekranının üstüne tek kart gelir. Başlıktaki halka nefesin bittiğini, karttaki beş parçalı şerit molanın 3 dakikasının geçtiğini gösterir: nefes bitti, mola sürüyor. Molanın iki seçeneği eşit ağırlıktadır; ekranın tek dolu düğmesi "Kaydet"tir. Çizimde kişi sakinlik puanını seçmiş: "Kaydet" puan seçilince açılır. "2 dk daha" aynı kalıpla sürer; nefes 5 dakikaya çıkar ve 28 günlük programda o gün sayılır.',
  ref: '§1 "Aralar", §3.A.4',
  mode: 'auto', time: '10:44', fold: true,
  body: screen(`<header class="page-header br-done"><span class="br-ring" aria-hidden="true">${svg(I.check, '', 2.6)}</span><span class="tx"><span class="eyebrow">Nefes</span><h1>Tamamlandı</h1><p>Sakin ritim · 3 dk · 18 döngü</p></span></header>
<section class="card more-card"><span class="mola-ey"><span>Mola · 5 dk</span></span><span class="mola-bar" aria-hidden="true"><i class="on"></i><i class="on"></i><i class="on"></i><i></i><i></i></span><h3>Molanın bitmesine 2 dk var.</h3><div class="more-btns"><span class="btn btn-secondary more-go">${svg(I.rotate)} 2 dk daha</span><span class="btn btn-secondary">${svg(I.eyeOff)} Gözlerimi kapatıp dinleneyim</span></div><p class="note2">2 dk daha yaparsan bugün, 28 günlük nefes programında da bir gün sayılır.</p></section>
<div class="br-calmcard"><b>Şimdi ne kadar sakinsin?</b><div class="br-calm5 ym-scale"><span>1</span><span>2</span><span>3</span><span class="on">4</span><span>5</span></div><div class="br-ends ym-ends"><span>1 · gergin</span><span>5 · çok sakin</span></div></div>
<div class="br-foot"><span class="btn btn-ghost">Zorlandım</span><span class="btn">${svg(I.check)} Kaydet</span></div>`),
})
const b4 = shot({
  label: '24. gün · Nefes, bugünün ritmi',
  cap: 'Ritim bir eğriyle çizilir: 4 saniye yükselir, 1 saniye durur, 6 saniye iner; kutuların üst çizgisi eğrinin rengindedir. Yolda Nefes durağının alt satırı da "Bugünün ritmi: 4 · 1 · 6" olur. Kısa tutma (en çok 2 sn) 22. günden başlayarak gelir, haftada en çok 2 gün. Kanıt kutusu ailenin bugünkü metnidir, "Başla"nın altında durur ve tutmalı günde sınır cümlesiyle biter (Ç1).',
  ref: '§3.A.4, §3.A.5',
  mode: 'auto', time: '10:38', fold: true,
  body: screen(`<span class="btn-icon" aria-hidden="true">${svg(I.chevL)}</span><header class="page-header"><span class="eyebrow">Nefes · yolun molası</span><h1>Bugünün ritmi: 4 · 1 · 6</h1><p>Sakin ritim, kısa bir tutmayla</p></header>
${breathCurve([4, 1, 6])}
<div class="br-steps c3" style="--n:3"><div class="st"><small>Nefes al</small><b>4<em>sn</em></b></div><div class="st"><small>Nefes tut</small><b>1<em>sn</em></b></div><div class="st"><small>Nefes ver</small><b>6<em>sn</em></b></div></div>
<p class="muted small br-meta">dakikada 5,5 nefes · 16 döngü · 3 dk</p>
<span class="btn">Başla</span>
<div class="br-evid"><div class="br-sec" style="margin-top:0"><span>Kanıt</span></div><p>Yavaş nefes sırasında kalp ritmi değişkenliği tutarlı biçimde artıyor (Laborde 2022; Marchant 2025). Bu kanıt tutmasız kalıptan geliyor; kısa tutmalı sürüm ayrıca incelenmedi.</p></div>`),
})
const secB = sec({
  id: 'b', title: 'Bugünün yolu ve nefes arası', meta: 'Aşama Y1 · §1 "Aralar", §3.A.4, §3.A.6, §3.A.9',
  shots: [b1, b2, b3, b4],
  whyHtml: why({
    neden: `Mola iki bölümün arasındadır: 1. gün 1, 2. gün 2 dakikadır ve nefesle biter; 3. günden başlayarak 5 dakikadır, 3 dakikası nefes, kalanı "2 dk daha" ya da gözler kapalı dinlenmedir (§1 "Aralar", §3.A.4).`,
    more: `Yoldaki 3 dakika, 28 günlük nefes programında ancak "2 dk daha" ile gün sayılır. Göz merdiveninde yeni gelen durak yolda "Yeni" etiketiyle görünür (§3.A.6). 1. gün yolu 8 dakikadır (§3.A.9). 320 pt'de bugünkü kod yolu 300 px'lik koordinatla çizdiği için bölüm etiketlerinin başını ve baloncuğun sağ kenarını 10 px kırpar. Çizim düzeltilmiş hâli gösterir: bölüm etiketi kabın içinde başlar, baloncuk kabın içinde kalır. Bu bugünkü kodun hatasıdır; Y1'de düzeltilir ve Y1 cihaz listesine yazılır.`,
    vars: `Bant etiketinin 11 px yazısı (bugün 10 px); bandın yuvarlak köşeli havuz gibi çizilmesi ve az yıldızı; tek duraklı 2. bölümde bölüm etiketinin sağa geçmesi; "2 dk daha" kartının üç satırı ve iki eşit düğmesi; durakta "Yeni" etiketi; Yukarı–aşağı simgesi; "Bugünün ritmi" satırının yeri ve adım kutuları; "Başla" hapının dolu gradyanı; kilitli durakların simgesinin iris renginde olması; nefes sonuç ekranındaki halka ve molanın beş parçalı şeridi (kartın üstünde bantla aynı "Mola · 5 dk" yazısı); sakinlik ölçeğinin yoga sorusunun ölçeğiyle aynı kutularla çizilmesi; ritim eğrisi (Hareketi Azalt açıkken durur) ve "Başla"nın kanıt kutusunun üstünde durması.`,
    qs: [
      q('8', 'Bant molanın tamamını yazar: 1. gün "Mola · 1 dk", 2. gün "Mola · 2 dk", 3. günden başlayarak "Mola · 5 dk". Baloncuk "Sırada mola: 3 dk nefes, 2 dk dinlenme" der. Bugünkü kodun iki yerde "3 dk" yazması Y1\'de düzeltilir.'),
      q('4', 'Grubun ekrandaki adı her yerde "Sağ–sol bakış"tır ("Uzağa bakış" ile aynı kalıp).'),
      q('6', 'Ekrandaki ad her yerde "Bugünün ritmi"dir ("Bugünün yolu" ve "Bugünün görevi" gibi); plandaki "Günün ritmi" de böyle düzeltilir.'),
      q('Ç1', 'Tutmalı günlerde kanıt kutusu ailenin bugünkü metnini gösterir ve "Bu kanıt tutmasız kalıptan geliyor; kısa tutmalı sürüm ayrıca incelenmedi." cümlesiyle biter. Yeni iddia yazılmaz.'),
      q('Ç17', 'Bantta ilk yıldız "Mola · N dk" etiketinin altına iner; 2. bölümün tek durağı soldaysa bölüm etiketi sağa geçer, yol etiketin üstünden geçmez. Y1\'de uygulamada da.'),
    ],
  }),
})

// ================= c) "Günün nasıl geçti?" =================
// Beş yüz (5 saniye turu 2): her yüz kendi iris tonlu diskinde, çizgi yüz; beş disk ince bir ölçek çizgisine dizilir.
// Uçlar kaş, göz ve ağızla ayrılır: "Çok kötü" üzgündür (kaşların iç ucu yukarı), öfkeli değil. Yargı rengi yok.
const FACES = [
  ['Çok kötü', '<path d="M6.8 8.9l3-1.3M17.2 8.9l-3-1.3"/><path d="M9 11.3v.8M15 11.3v.8"/><path d="M7.8 17.4c1.2-2 2.6-2.9 4.2-2.9s3 .9 4.2 2.9"/>'],
  ['Kötü', '<path d="M9 10.3v.8M15 10.3v.8"/><path d="M8.4 16.3c1-.9 2.2-1.4 3.6-1.4s2.6.5 3.6 1.4"/>'],
  ['İdare eder', '<path d="M9 10.3v.8M15 10.3v.8"/><path d="M8.6 15.4h6.8"/>'],
  ['İyi', '<path d="M9 10.3v.8M15 10.3v.8"/><path d="M8.4 14.3c1 .9 2.2 1.4 3.6 1.4s2.6-.5 3.6-1.4"/>'],
  ['Çok iyi', '<path d="M7.4 10.7c.6-1 2.3-1 2.9 0M13.7 10.7c.6-1 2.3-1 2.9 0"/><path d="M7.8 13.6h8.4c0 2.6-1.9 4.2-4.2 4.2s-4.2-1.6-4.2-4.2z"/>'],
]
const face = (i) => svg(FACES[i][1]).replace('viewBox="0 0 24 24"', 'viewBox="4 4 16 16"')
const faces = (on = -1) => `<div class="face5" role="group" aria-label="Günün nasıl geçti">${FACES.map((f, i) => `<span class="${i === on ? 'on' : ''}"><i class="fd">${face(i)}</i><small>${f[0]}</small></span>`).join('')}</div>`
// Kanıt kartı (5 saniye turu 2): bulgu cümlesi önde ve büyük, sınır cümlesi hemen altında, künye tek blokta küçük ve sakin.
// Metin ve künye aynı; yalnız dizilişi değişti. Simge, kartı açan yol durağının simgesidir (nefes, kırpma, uzağa bakış).
const cite = (kind, glyph, main, lim, meta, who, pmid, doi) => `<div class="src-card ev"><span class="src-ey"><i class="ev-ic">${svg(GLYPH[glyph], '', 2)}</i>Bilim ne diyor? · ${kind}</span><p class="ev-main">${main}</p><p class="ev-lim">${lim}</p><div class="src-cite"><span class="who">${who}</span><span class="meta">${meta}</span><span class="ids"><span>PMID ${pmid}</span><span class="doi">doi ${doi}</span></span></div></div>`
const evidence = cite('nefes', 'moon', 'Bir ay süren bir çalışmada, her gün 5 dakika uzun verişli nefes yapan grupta ruh hâlindeki olumlu değişim, farkındalık meditasyonu yapan gruptakinden büyüktü.', 'Tek bir çalışmanın bulgusudur; sende aynı sonucu vereceği söylenemez.', 'Uzaktan randomize çalışma · 108 kişi (uzun verişli kolda 30, meditasyonda 24) · günde 5 dk, 1 ay', 'Balban ve ark. 2023 · Cell Rep Med', '36630953', '10.1016/j.xcrm.2022.100895')
const eveHead = `<span class="eyebrow">Akşam · 1 dokunuş</span><p class="muted small">7.412 adım · Nefona'da 16 dk · yol 9/10</p><h3>Günün nasıl geçti?</h3>`
// 8. gün 20.30: yolun 9/10'u tamam (ilk dokuz durak bitti, Bugünün görevi sırada)
const day8 = todayPath({
  stops: [
    { title: 'Haftalık E testi', form: 'me', glyph: 'E', st: 'done', doneSub: 'tamam' },
    { title: 'Isınma', form: 'ex', glyph: 'arrows', st: 'done' },
    { title: 'Uzağa bakış', form: 'ex', glyph: 'far', st: 'done' },
    { title: 'Tek Bakışta', form: 'pr', glyph: 'span', st: 'done', tag: 'Yeni', tagNew: true },
    { title: 'Nefes', form: 'rest', glyph: 'moon', st: 'done', restMin: 3 },
    { title: 'Yakın–uzak', form: 'ex', glyph: 'nearfar', st: 'done' },
    { title: 'Yukarı–aşağı', form: 'ex', glyph: 'updown', st: 'done' },
    { title: 'Çemberler', form: 'pr', glyph: 'constel', st: 'done' },
    { title: 'Göz kırpma', form: 'ex', glyph: 'lid', st: 'done' },
    { title: 'Bugünün görevi', form: 'fi', glyph: 'spark', st: 'now', sub: '1 dk' },
  ],
  blocks: [{ eyeMin: 2, eyeDone: 2, capMin: 4 }, { eyeMin: 3, eyeDone: 3, capMin: 4 }],
  bandMin: 5,
})
const c1 = shot({
  label: '8. gün · 8 Ekim Perşembe, 20.30',
  cap: 'Ana sayfa kaydırıldı. Kart, tek kart yuvasında bugünkü akşam kartının yerini alır; 18.00\'de açılır, 03.59\'da düşer. Beş yüz kartın en büyük öğesidir: her biri kendi iris tonlu diskinde, ince bir ölçek çizgisine dizilir; yargı rengi yok. "Çok kötü" üzgündür, öfkeli değil. Altında günün yolu bugünkü gibidir.',
  ref: '§3.D.3',
  tabs: 'home', time: '20:30',
  body: screen(`<section class="card ask-card evening">${eveHead}${faces()}<p class="ask-note">Cevabın yalnız bu telefonda kalır.</p><div class="ask-foot"><span class="link-btn">Günün ayrıntıları ${chev.replace('<svg', '<svg width="16" height="16"')}</span><span class="btn btn-ghost btn-sm">Sonra</span></div></section>${pathPeek(day8.html)}`, 'crop'),
})
const c2 = shot({
  label: 'Dokununca · 2–8. saniye', mode: 'auto',
  cap: 'Tek dokunuş kaydeder, hafif titreşim olur; kartın başı "Akşam · kaydedildi" olur, "Geri al" 3 saniye görünür. Kart yerinde dönüşür: seçilen yüz büyür, altında günün kanıt kartı gelir. Kart o gün yolda yapılan nefesten gelir; simgesi yoldaki Nefes durağının simgesidir. Önce bulgu, hemen altında sınırı yazar; tür, kişi sayısı ve künye kartın dibinde küçük ve sakin durur.',
  ref: '§3.D.3, §3.D.4, §3.H',
  tabs: 'home', time: '20:30',
  body: screen(`<section class="card ask-card evening"><span class="eyebrow">Akşam · kaydedildi</span><div class="picked"><i>${face(3)}</i><b>İyi</b><span class="link-btn">Geri al</span></div>${evidence}</section>`, 'crop'),
})
const c3 = shot({
  label: '7. günden sonra · 8–10. saniye', mode: 'auto',
  cap: 'Etiketler isteğe bağlıdır; en çok üç tane seçilir. Her etiketin kendi simgesi vardır, seçilince simgenin yerine tik gelir. "Ekran çoktu" 22.00\'den sonra seçilirse gece ekranı kartı ancak o akşam başka kart gösterilmediyse "Tamam"dan sonra çıkar (Ç18).',
  ref: '§3.D.3, §3.D.4',
  tabs: 'home', time: '20:31',
  body: screen(`<section class="card ask-card evening"><span class="eyebrow">Akşam · kaydedildi</span><div class="picked"><i>${face(3)}</i><b>İyi</b></div><b style="font-size:.95rem">Günü en çok ne etkiledi?</b><p class="ask-note" style="margin-top:-6px">En çok üç tane seçebilirsin.</p><div class="tags">${[['İş yoğundu', I.briefcase], ['Hareketliydim', I.footprints], ['Dışarıdaydım', I.sun], ['İnsanlarla', I.users], ['Gözlerim yoruldu', I.eye], ['Ekran çoktu', I.phone]].map(([t, ic], i) => `<span class="tag-chip${i === 2 || i === 3 ? ' on' : ''}">${i === 2 || i === 3 ? svg(I.check, 'ck', 2.6) : svg(ic, 'ti')}${t}</span>`).join('')}</div><span class="btn">Tamam</span></section>`, 'crop'),
})
const cParts =
  part('Kırpma günü kartı · son metin', cite('göz kırpma', 'lid', 'Kuru göz yakınması olan 28 kişiyle yapılan bir çalışmada, iki hafta kırpma egzersizi yapanlarda yakınmalar ve yarım kalan kırpmalar azaldı; egzersiz bırakıldıktan iki hafta sonra ölçümlerin çoğu başlangıca döndü.', 'Tek bir çalışmanın bulgusudur; sende aynı sonucu vereceği söylenemez.', 'İki aşamalı çalışma: 98 kişide randomize karşılaştırma, 28 kişide etki ölçümü · günde 3 kez 15 tekrar, 2 hafta', 'Wolffsohn ve ark. 2025 · Cont Lens Anterior Eye', '40467388', '10.1016/j.clae.2025.102453'),
    'Tetik: o gün yolda göz kırpma yapıldı. Kişi sayısı ve program PubMed özetinden doğrulandı. Plandaki "Yolunda bu adımın her gün olmasının nedeni budur." cümlesi çıktı (§3.A.6 bu gerekçeyi kullanıcıya söylemez).', '§3.D.4, §3.H') +
  part('Uzağa bakış kartı · son metin', cite('uzağa bakış', 'far', 'Göz yakınması olan 29 bilgisayar kullanıcısıyla yapılan bir çalışmada, iki hafta boyunca uzağa bakma molası hatırlatması alanların yakınmaları azaldı; hatırlatma bırakılınca bu fark bir hafta sonra sürmedi.', 'Karşılaştırma grubu olmayan tek bir çalışmanın bulgusudur; sende aynı sonucu vereceği söylenemez.', 'Karşılaştırma grubu olmayan önce–sonra çalışması · 29 kişi · 2 hafta 20-20-20 hatırlatması', 'Talens-Estarelles ve ark. 2022 · Cont Lens Anterior Eye', '35963776', '10.1016/j.clae.2022.101744'),
    'Tetik: o gün yolda uzağa bakış yapıldı. Kişi sayısı ve düzen PubMed özetinden doğrulandı.', '§3.D.4, §3.H')
const secC = sec({
  id: 'c', title: '"Günün nasıl geçti?"', meta: 'Aşama Y4 · karar 3 · §3.D.3, §3.D.4',
  shots: [c1, c2, c3], parts: cParts,
  whyHtml: why({
    neden: `Karar 3 çizilmiş beş yüzü ve altlarındaki "Çok kötü · Kötü · İdare eder · İyi · Çok iyi" etiketlerini ister; akış 10 saniyede biter (§3.D.3).`,
    more: `Telefonun emojileri kullanılmaz. Akışta 0–2. saniyede kart okunur, 2–4. saniyede dokunulur, 4–8. saniyede kanıt kartı, 8–10. saniyede etiketler gelir. Günde en çok bir kanıt kartı çıkar; kart bilgi verir, öneri ya da yargı vermez; türünü, kişi sayısını ve sınırını yazar (§3.D.4, §3.H). Balban 2023'ün kişi sayısı PubMed Central'daki tam metinden doğrulandı (STAR Methods: 108 kişi; 24 meditasyon, 30 uzun verişli nefes). "Ekran süren" ifadesi hiçbir yerde geçmez.`,
    vars: `Yüzlerin çizimi (iris tonlu disk içinde çizgi yüz, beş disk bir ölçek çizgisinde; yargı rengi yok; uçtaki iki yüz kaş, göz ve ağızla ayrılır, "Çok kötü" üzgün kaşlıdır); dokununca kartın başının "Akşam · kaydedildi" olması; kanıt kartında bulgunun önde, sınırın hemen altında, künyenin dipte durması ve yol durağının simgesi; "Cevabın yalnız bu telefonda kalır." (Nef'e ruh hâli durumu açılırsa bu satır değişir, ör. "Cevabın bu telefonda kalır; Nef'e yalnız durumu gider, iznin varsa."); "Günün ayrıntıları"; "Günü en çok ne etkiledi?" ve "En çok üç tane seçebilirsin."; kanıt kartının üst başlığı ve tür satırı.`,
    qs: [
      q('25', '320 pt\'de yüzlerin arası 4 px olur ve her yüz 45,6 px kalır (8 px aralıkta 42 px, 44 pt\'nin altı). Kart iç boşluğu değişmez; "İdare eder" iki satıra iner, etiketler üstten hizalıdır. 390 pt\'de tek satırdır.'),
      q('9', '"Kırpma günü" ve "uzağa bakış" kartları tür, kişi sayısı ve sınır cümlesiyle yeniden yazıldı (yukarıdaki iki kart). Kırpma kartındaki "Yolunda bu adımın her gün olmasının nedeni budur." cümlesi çıktı.'),
      q('Ç18', 'Kart, yüze dokunulduğu anda o an bilinen tetiklerle seçilir (dolunay, sonra yol kartları). Gece ekranı kartı yalnız o akşam başka kart gösterilmediyse ve "Ekran çoktu" 22.00\'den sonra seçildiyse "Tamam"dan sonra aynı yerde çıkar; günde en çok bir kart kuralı bozulmaz.'),
    ],
  }),
})

// ================= d) "Günün" sayfası ve "Hava ve ay" kartı =================
const RAIN = [10, 10, 15, 20, 30, 40, 55, 70, 70, 65, 50, 35, 25, 20, 15, 10] // 07–22
const bars = (sel = -1) => `<div class="wx-bars" role="img" aria-label="Saat saat yağış olasılığı, en yüksek 14.00–17.00 arası yüzde 70">${RAIN.map((v, i) => `<i class="${i === sel ? 'sel' : ''}" style="height:${v}%"></i>`).join('')}${sel >= 0 ? `<span class="tooltip wx-tip" style="left:${((sel + 0.5) / 16) * 100}%">${String(7 + sel).padStart(2, '0')}.00 · %${RAIN[sel]}</span>` : ''}</div><div class="wx-axis" aria-hidden="true">${[9, 12, 14, 17, 20].map((h) => `<span style="left:${((h - 7 + 0.5) / 16) * 100}%">${String(h).padStart(2, '0')}</span>`).join('')}</div>`
// 14 Ekim 2026 aydınlanma (astronomy-engine): 09.10 %12,9; 12.45 %13,9. Yeniay 10 Ekim, dolunay 26 Ekim.
const moonPart = (k = 0.139, cls = '') => `<div class="wx-moon${cls ? ' ' + cls : ''}"><span class="m1">${moonSvg(k, true)}Büyüyen hilal · %${Math.round(k * 100)} aydınlık</span><span class="m2">Son yeniay: 10&nbsp;Ekim · Sonraki dolunay: 26&nbsp;Ekim</span>${moonTrack(0.28)}</div>`
const sci = `<div class="wx-sci"><span>Bilim ne diyor?</span>${svg(I.chevR)}</div>`
// Atıf satırı: Apple'ın işaret görseli uydurulmaz; markanın adı yazıyla (Apple Weather) ve yasal "Veri kaynakları" bağlantısı.
// Uygulamada bu yerde WeatherKit'in verdiği resmî işaret durur (WeatherAttribution combinedMarkLightURL / DarkURL).
const attr = (age = "12.40'ta alındı") => `<div class="wx-att"><span class="wx-src"><span class="wx-brand" lang="en">Apple Weather</span><span class="sep" aria-hidden="true">·</span><a>Veri kaynakları</a></span><span>${age}</span></div>`
const wxCard = ({ sel = 7, ask = false } = {}) => `<section class="card wx" aria-label="Hava ve ay"><div class="wx-top"><span class="src-ey wx-city">Hava ve ay · İstanbul${svg(I.chevD, 'cv')}</span><span class="wx-temp">17°</span></div><p class="wx-say">Öğleden sonra yağmur bekleniyor</p><div class="wx-chart"><span class="wx-lbl" aria-hidden="true">Yağış olasılığı</span><div style="position:relative;padding-top:${sel >= 0 ? 30 : 0}px">${bars(sel)}</div></div><p class="wx-hl">En yüksek 19° · en düşük 13°</p><p class="wx-ctx">Yağmur varsa yürüyüşünü içeride de yapabilirsin.</p>${ask ? `<div class="wx-ask rain">${svg(I.bell, 'wa-ic')}<p>Yağmur beklenen sabahlar sana haber vereyim mi?</p><div class="row"><span class="btn btn-sm">Evet</span><span class="btn btn-ghost btn-sm">Hayır</span></div></div>` : ''}${moonPart()}${sci}${attr()}</section>`
const d1 = shot({
  label: 'Günün sayfası · 14 Ekim Çarşamba, 12.46',
  cap: 'Yağmur sorusu (f) aynı gün cevaplandıktan sonraki hâl. Sayfa tarih satırına dokununca açılır. Başlık gündüz "Günün nasıl geçiyor?", akşam "Günün nasıl geçti?" olur; akşam (c)\'deki kart da gelir. Grafiğin adı üstünde yazar ("Yağış olasılığı"); yağış sayısı çubuğa dokununca görünür. Kart sıkı tutuldu: "Bugün ölçülenler" ilk ekranda başlar.',
  ref: '§3.D.3, §3.E.7',
  mode: 'auto', time: '12:46', fold: true,
  body: screen(`<span class="btn-icon" aria-hidden="true">${svg(I.chevL)}</span><header class="page-header"><span class="eyebrow">14 Ekim Çarşamba</span><h1>Günün nasıl geçiyor?</h1></header>${wxCard()}<div class="home-h"><h2>Bugün ölçülenler</h2></div><div class="list"><div class="list-row"><span class="grow">Adım</span><em>4.106</em></div><div class="list-row"><span class="grow">Nefona'da göz çalışması</span><em>9 dk, 1 mola</em></div><div class="list-row"><span class="grow">Bugünün yolu</span><em>6/10 durak</em></div></div>`),
})
const wxState = (msg, extra = '') => `<div class="wx-state"><div class="wx-top"><span class="src-ey">Hava ve ay · İstanbul</span></div><p class="msg">${msg}</p>${extra}</div>`
const d2 = shot({
  label: 'Hava hiç sorulmamışken · 14 Ekim Çarşamba, 09.10',
  cap: 'Kartın başlığı "Ay" olur ve kart ayla açılır: büyük simge, aydınlanma, son yeniaydan sonraki dolunaya iz. Hava sorusu ayın altında, sakin bir kutudadır; "İstanbul için göster" dolu, "Şehir seç" çizgili düğmedir. Altında kişinin kendi günü, "Bugün ölçülenler" durur; henüz göz çalışması olmadığı için o satır yazılmaz. Havanın öteki hâlleri aşağıda, yalnız kartın hava kısmıyla çizildi.',
  ref: '§3.E.7, §3.D.3',
  mode: 'auto', time: '09:10',
  body: screen(`<span class="btn-icon" aria-hidden="true">${svg(I.chevL)}</span><header class="page-header"><span class="eyebrow">14 Ekim Çarşamba</span><h1>Günün nasıl geçiyor?</h1></header><section class="card wx"><div class="wx-top"><span class="src-ey">Ay</span></div>${moonPart(0.129, 'lead')}${sci}<div class="wx-ask soft">${svg(I.cloudSun, 'wa-ic')}<p>Şehrinin havasını göstereyim mi?</p><div class="row" style="flex-wrap:wrap"><span class="btn btn-sm">İstanbul için göster</span><span class="btn btn-ghost btn-sm">Şehir seç</span></div></div></section><div class="home-h"><h2>Bugün ölçülenler</h2></div><div class="list"><div class="list-row"><span class="grow">Adım</span><em>1.312</em></div><div class="list-row"><span class="grow">Bugünün yolu</span><em>10 durak</em></div></div>`),
})
// 26 Ekim 2026: dolunay anı 07.12 (astronomy-engine); 20.30'da aydınlanma %99,4. Önceki yeniay 10 Ekim, sonraki 9 Kasım.
const fullMoon = `<div class="card wx" style="gap:8px"><div class="wx-top"><span class="src-ey">Hava ve ay · İstanbul</span></div><div class="wx-moon" style="border-top:0;padding-top:0"><span class="m1">${moonSvg(0.994, false)}Dolunay · %99 aydınlık</span><span class="m2">Son yeniay: 10&nbsp;Ekim · Sonraki yeniay: 9&nbsp;Kasım</span></div></div>`
const dParts =
  part('26 Ekim Pazartesi · dolunay günü, kartın ay kısmı', fullMoon, 'Evre adı takvim gününe göre yazılır; saat bildiren "Bu gece dolunay" yazılmaz, çünkü dolunay anı bu tarihte sabah 07.12\'dir. O akşam (c)\'deki dolunay kartı da çıkabilir.', '§3.E.3, §3.F.5, 3') +
  part('"Bilim ne diyor?" açıkken', `<div class="card wx" style="gap:8px"><div class="wx-sci" style="border-top:0;min-height:32px"><span>Bilim ne diyor?</span>${svg(I.chevD)}</div><div class="wx-sci-open"><p>Ayın uykuya etkisi tartışmalı. Bazı çalışmalar dolunaya yakın gecelerde uykunun biraz kısaldığını buldu; binden fazla kişiyle yapılan bazı büyük çalışmalar ise fark bulmadı ya da yalnız birkaç dakikalık fark buldu.</p><div class="wx-refs"><span>Cajochen 2013</span><span>Haba-Rubio 2015</span><span>Chaput 2016</span><span>Smith 2017</span><span>Casiraghi 2021</span></div></div></div>`, 'Her kaynağa dokununca PMID ve DOI açılır. Metin tavsiye vermez.', '§3.E.5') +
  part('Çevrimdışı, son veri 12 saatten yeni', wxState('Öğleden sonra yağmur bekleniyor', attr('3 saat önce alındı · şu an çevrimdışısın')), 'Son veri, yaşıyla birlikte görünür.', '§3.E.7') +
  part('Önbellek yok', wxState('Hava için internet gerekiyor.'), '', '§3.E.7') +
  part('Hava servisi cevap vermedi', wxState('Hava bilgisi şu an alınamadı.', '<p class="ask-note">15 dakika sonra yeniden denenir.</p>'), '', '§3.E.7')
const secD = sec({
  id: 'd', title: '"Günün" sayfası ve "Hava ve ay" kartı', meta: 'Ay Y4, hava Y5 · §3.D.3, §3.E.2, §3.E.3, §3.E.5, §3.E.7',
  shots: [d1, d2], parts: dParts,
  whyHtml: why({
    neden: `Kartın sırası plandaki gibidir ve atıf satırı her zaman görünür (§3.E.7).`,
    more: `Sıra şöyledir: başlık ve sıcaklık, bekleniş cümlesi, saat saat yağış şeridi (tek renk tonu), en yüksek ve en düşük, ay evresi ve aydınlanma, son ve sonraki dolunay ya da yeniay, "Bilim ne diyor?", atıf satırı ve verinin yaşı. Atıf satırında Apple Weather markası, Apple'ın yasal sayfasını açan "Veri kaynakları" bağlantısı ve verinin yaşı durur. Hava bu kart ve "Kaynak: Apple Weather" satırlı yağmur bildirimi dışında hiçbir yerde görünmez (App Review yedeği). Hukukçu yedeğinde kişinin konumu değil, seçtiği ilin merkezi gider (§1). Aydınlanma oranları o saatin değeridir: 14 Ekim 09.10'da %13, 12.45'te %14.`,
    vars: `Satırların biçimi; başlıktaki il adına dokununca il listesinin açılması; bağlam cümlesinin hava bölümünün sonunda durması; "Son yeniay · Sonraki dolunay" satırı; "Bugün ölçülenler" satırları; hiç sorulmamış hâlin metni ve düğmeleri; hava yokken (yalnız ay varken) başlığın "AY" olması; kartta ayın gece zemininde büyük çizilmesi ve son evreden sonrakine giden iz; hiç sorulmamış hâlde ayın önce, hava sorusunun sonra gelmesi (plandaki "ay tam" sırası); ilk yağmurlu gün sorusunun grafikten ve bağlam satırından sonra gelmesi.`,
    qs: [
      q('12', 'Şehir seçilince başlıkta "(yaklaşık)" yazılmaz; yalnız konumdan bulunan il için yazılır (hukukçu cevabından sonra).'),
      q('3', 'Dolunay günü kartın ay satırı "Dolunay · %99 aydınlık" olur (yukarıdaki parça); "Bu gece dolunay" yazılmaz.'),
      q('Ç3', 'Atıf satırında Apple\'ın işaret görseli uydurulmadı: markanın adı yazıyla ("Apple Weather"), yanında "Veri kaynakları" bağlantısı ve verinin yaşı durur. Apple, verisini gösteren her yerde Apple Weather markasının ve öteki veri kaynaklarının yasal bağlantısının açıkça görünmesini ister. Uygulamada markanın yerinde WeatherKit\'in verdiği resmî işaret görseli (açık ve koyu sürüm) durur; görsel yeniden çizilmez ve değiştirilmez.'),
    ],
  }),
})

// ================= e) Hava teklifi (7. günden sonra, bir kez) =================
const offer = `<div class="hh-focus offer" role="group" aria-label="Hava teklifi">${svg(I.cloudSun)}<span class="grow">Şehrinin havasını da göstereyim mi?</span><span class="btns"><span class="btn btn-sm">İstanbul için göster</span><span class="btn btn-ghost btn-sm">Hayır</span></span></div>`
const e1 = shot({
  label: '9. gün · 9 Ekim Cuma, 10.05',
  cap: 'Teklif ilk dokunuştan sonra (Isınma bitti) ay satırının altında bir kez çıkar. İki düğme vardır; "Hayır" kalıcıdır, kart "Günün" sayfasında yine durur. İlk durak bittiği için bugün de sayılır: 9 gün seri, haftada 5 gün.',
  ref: '§3.E.7, §3.F.3',
  tabs: 'home', time: '10:05',
  body: screen(
    homeHead({ date: '9 Ekim Cuma', phase: 'küçülen hilal', k: 0.021, waxing: false }) + offer +
    dayBlock({ n: 11, rest: 4, done: 1, left: 17, facts: [{ k: 'streak', v: 9 }, { k: 'week', v: '5✓', dots: ['d', 'd', 'd', 'd', 'd', '', ''] }, { k: 'days', v: 9 }] }) +
    nowBlock({ line: 'Kaldığın yerden devam: Uzağa bakış.', sub: 'Nef · 1 dk', eyebrow: 'Yola devam et', title: 'Uzağa bakış · 1 dk' }) +
    homeMap([0.07, 0.29, 0.11, 0.29, 0.21, 0.04, 0], '6 / 7 alanda kaydın var')
  ),
})
// Rıza sayfası (öneri düzeni): başlık kalkanla bir satırda, satır adları solda; onay kutusu ve iki düğme altta sabit.
// Metin kayar, karar yeri hep görünür. on: kutu işaretli; end: metin sona kaydırılmış
const consent = ({ title, lead, facts, check, on = false, end = false, badge = '', fade = false }) => `<div class="cs2"><div class="cs-sheet" role="dialog" aria-label="${title}"><span class="cs-grab"></span><div class="cs-body${end ? ' end' : ''}${fade && !end ? ' fade' : ''}">${badge ? `<span class="coach-badge cs-badge">${svg(I.sparkles)} ${badge}</span>` : ''}<div class="cs-head"><span class="cs-shield">${svg(I.shield)}</span><h2>${title}</h2></div><p class="cs-lead">${lead}</p><dl class="cs-facts kv">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl></div><div class="cs-dock"><label class="cs-ok${on ? ' on' : ''}"><span class="cs-box">${on ? svg(I.check, '', 3) : ''}</span><span>${check}</span></label><div class="cs-btns"><span class="btn"${on ? '' : ' style="opacity:.4"'}>İzin ver</span><span class="btn btn-ghost">Şimdi değil</span></div><p class="cs-foot">İznini Profilim → İzinlerim'den her an geri çekebilirsin.</p></div></div></div>`
const e2 = shot({
  label: 'İl seçildikten sonra · hava rızası',
  cap: 'Satır adları ve metin bugünkü rıza sayfasının kalıbındadır. Metin kısa olduğu için sayfa içeriği kadar yükselir; onay kutusu ve iki düğme altta sabit durur. Kutu işaretsiz gelir; işaretlenmeden "İzin ver" soluk kalır ve çalışmaz. Sonra "Günün" sayfası dolu kartla açılır.',
  ref: '§3.E.2, §1',
  time: '10:06', sb: 'clear',
  body: consent({
    title: 'Seçtiğin ilin havası görünsün mü?',
    lead: 'Hava bilgisini Apple\'ın hava servisinden alırız. İzin vermesen de ay bilgisi görünür; hiçbir şey kapanmaz.',
    facts: [
      ['Ne', 'Seçtiğin ilin merkezinin koordinatı. Senin konumun alınmaz'],
      ['Neden', 'Hava durumunu, yağmur olasılığını ve istersen sabah yağmur haberini göstermek'],
      ['Nerede', 'Apple\'ın hava servisi (yurt dışı). Sunucumuza ve Nef\'e gitmez'],
      ['Ne kadar', 'Telefonda yalnız seçtiğin il, son hava bilgisi ve 90 günlük kısa hava özeti kalır. İznini geri çekersen seçtiğin il ve son hava bilgisi silinir; 90 günlük özet "Tüm verileri sil" ile silinir'],
    ],
    check: 'Seçtiğim ilin merkez koordinatının, hava bilgisini göstermek için yurt dışındaki Apple hava servisine gönderilmesine açık rıza veriyorum.',
  }),
})
const secE = sec({
  id: 'e', title: 'Tek seferlik hava teklifi ve hava rızası', meta: 'Aşama Y5 · §3.E.7 "Görünür giriş", §3.E.2 · hukukçu yedeği',
  shots: [e1, e2],
  whyHtml: why({
    neden: `Teklif 7. günden sonra, günün ilk dokunuşundan sonra Ana sayfada ay satırının altında bir kez çıkar; "Hayır" kalıcıdır (§3.E.7).`,
    more: `Plan metni konum izni ister ("Konumumu kullan"); hukukçu yedeğinde konum hiç sorulmaz (§1), bu yüzden metin ve düğmeler şehre göre yazıldı. Rıza kutusu işaretsiz gelir (§1). Dört satırın adları bugünkü rıza sayfalarının adlarıdır (Ne, Neden, Nerede, Ne kadar); içerikleri §3.E.2'dendir. İzin geri çekilince il adı ve hava önbelleği silinir; 90 günlük özet (sky-log) "Tüm verileri sil" kapsamındadır (§2.1 satır 9).`,
    vars: `Şeridin metni ve iki düğme ("İstanbul için göster" yalnız Profil'deki şehir 81 ilden biriyse; değilse "Şehir seç"); rıza sayfasının bütün metni; rıza başlığının sesi (şerit planın "göstereyim mi?" kalıbını, rıza başlığı bugünkü rıza başlıklarının "görünsün mü?" kalıbını kullanır). Aradaki il listesi bugünkü şehir alanıdır, yeniden çizilmedi. Teklif şeridinde "İstanbul için göster"in dolu değil çizgili düğme olması (büyük düğmeyle yarışmasın diye); rıza sayfasında onay kutusunun ve iki düğmenin altta sabit durması.`,
    qs: [
      q('11', 'Hukukçu yedeğinde metin "Şehrinin havasını da göstereyim mi?" olur: Apple\'a kişinin yeri değil, seçtiği ilin merkezi gider. Plandaki "Bulunduğun yerin…" metni konum izni açılınca gelir.'),
      q('Ç4', 'Teklifte iki düğme var: "İstanbul için göster" ve "Hayır"; Profil\'de 81 ilden biri yoksa "Şehir seç" ve "Hayır". Başka il, kartın başlığındaki il adına dokunarak seçilir (d). Üç düğme 390 pt\'de de metnin yanına sığmıyordu; şerit 320 pt\'de bir satır kısalır.'),
      q('Ç5', 'Teklifte kapatma (×) yok; "Hayır" tek çıkış ve kalıcıdır.'),
      q('Ç14', '320 × 568\'de şerit büyük düğmeyi bir kaydırma aşağı iter. Teklif ilk dokunuştan sonra ve yalnız bir kez çıktığı için kabul edildi; Y5 cihaz listesine yazılır.'),
    ],
  }),
})

// ================= f) Yağmur bildirimi ve ilk yağmurlu günde tek soru =================
const lock = (date, body) => `<div class="ls"><span class="date">${date}</span><span class="clock">07:30</span><div class="note">${MARK('app')}<div><div class="h"><b>Nefona</b><span>şimdi</span></div><p><b>Bugün yağmur bekleniyor</b></p><p>${body}</p><p class="src">Kaynak: Apple Weather</p></div></div><div class="bot"><i>${svg(I.flashlight)}</i><i>${svg(I.camera)}</i></div></div>`
const f3 = shot({
  label: 'İlk yağmurlu gün · 14 Ekim Çarşamba, 12.45',
  cap: 'Soru, kartı açan kişiye bir kez gösterilir; yağmur grafiği ve bağlam satırından sonra gelir, başlığı grafiğinden ayırmaz. Tercih ayrıdır ve varsayılanı kapalıdır; bildirim izni yoksa "Evet" iOS iznini ister.',
  ref: '§3.E.6',
  mode: 'auto', time: '12:45', fold: true,
  body: screen(`<span class="btn-icon" aria-hidden="true">${svg(I.chevL)}</span><header class="page-header"><span class="eyebrow">14 Ekim Çarşamba</span><h1>Günün nasıl geçiyor?</h1></header>${wxCard({ sel: -1, ask: true })}`),
})
const f1 = shot({ label: 'Kilit ekranı · 21 Ekim Çarşamba, sabah kurulan bildirim', cap: '14 Ekim\'deki soruya "Evet" diyen kişiye sonraki yağmurlu sabah gelir. Saat, o gün alarm çalacaksa alarmdan 15 dk sonradır, yoksa 07.30\'dur (06.30–09.00 arası). Dokununca "Hava ve ay" kartı açılır. Kilit ekranının görünüşü ve duvar kâğıdı Apple\'ındır; çizimde yalnız bildirimin metni bizimdir.', ref: '§3.E.6, §2.2 A8', time: '', sb: 'clear ls-sb', body: lock('21 Ekim Çarşamba', '14.00–17.00 arası yağmur olasılığı %70.') })
const note = (body) => `<div class="ls ls-part"><div class="note">${MARK('app')}<div><div class="h"><b>Nefona</b><span>şimdi</span></div><p><b>Bugün yağmur bekleniyor</b></p><p>${body}</p><p class="src">Kaynak: Apple Weather</p></div></div></div>`
const fParts = part('Akşam kurulan bildirim · 21 Ekim', note('Dün akşamki tahmine göre 14.00–17.00 arası yağmur olasılığı %70.'), 'Bildirim bir gün önce akşam kurulduysa gövde tahminin ne zaman yapıldığını söyler; öteki her şey soldaki kilit ekranındaki gibidir.', '§3.E.6') + part('Bilgi → Hatırlatmalar · tercih satırı', `<div class="list"><div class="list-row">${svg(I.cloudRain).replace('<svg', '<svg width="20" height="20" style="color:var(--accent);flex:none"')}<span class="grow"><b style="font-weight:600">Yağmur haberi</b><br><span class="muted small">Yağmur beklenen sabahlar</span></span><span class="muted small">Kapalı</span></div><div class="list-row">${svg(I.cloudRain).replace('<svg', '<svg width="20" height="20" style="color:var(--ink-3);flex:none"')}<span class="grow"><b style="font-weight:600">Yağmur haberi</b><br><span class="muted small">Bildirimler kapalı</span></span></div></div>`, 'Üstteki satır varsayılan hâldir; alttaki, bildirimlerin ana anahtarı kapalıyken görünür.', '§3.E.6')
const secF = sec({
  id: 'f', title: 'Yağmur bildirimi ve ilk yağmurlu günde tek soru', meta: 'Aşama Y5 · §3.E.6 · §2.2 A8, A9 · App Review yedeği',
  shots: [f3, f1], parts: fParts,
  whyHtml: why({
    neden: `Yağmur haberi ayrı bir tercihtir, varsayılanı kapalıdır ve ilk yağmurlu günde bir kez sorulur (§3.E.6).`,
    more: `Günde en çok bir bildirim gelir. Eşik, 07.00–22.00 arasında herhangi bir saatte %50 ve üstü olasılık ile toplam 0,5 mm ve üstü yağıştır (A9). Türkiye'de dakikalık yağış verisi olmadığı için "Yağmur başlamak üzere" bildirimi yoktur (§1). App Review cevabı gelene kadar bildirim "Kaynak: Apple Weather" satırını taşır (§1, §3.H). Bildirim görünüşü Apple'ındır; yalnız metin bizimdir.`,
    vars: `[Evet] [Hayır] düğmeleri (bir kez sorulduğu için "Şimdi değil" değil "Hayır"); "Yağmur haberi" satırının yeri ve alt satırı; örnek tarihler (soru 14 Ekim'de, bildirim 21 Ekim'de).`,
    qs: [
      q('15', 'Bildirimde plandaki Türkçe satır durur: "Kaynak: Apple Weather". S0/app-review-sorusu.md\'nin Türkçe notu buna göre düzeltildi; İngilizce mektuptaki "Source: Apple Weather" bu satırın çevirisidir.'),
      q('10', 'Alarm kartlarında hava satırı ("Yarın sabah yağmur bekleniyor") App Review\'un olumlu cevabına kadar yoktur; cevap gelince başlıktaki havayla birlikte açılır.'),
    ],
  }),
})

// ================= g) Gelişim "Yolun" bölümü ve ölçü kuralı v2 =================
const bar28 = (n, pattern) => `<span class="gm-bar w4" role="img" aria-label="Son 28 günde ${n} gün kayıt">${[0, 1, 2, 3].map((w) => `<span>${Array.from({ length: 7 }, (_, d) => `<i class="${pattern(w * 7 + d) ? 'on' : ''}"></i>`).join('')}</span>`).join('')}</span>`
const every = () => true
const weekly = (i) => i % 7 === 3
const row = (n, m, pill, bar) => `<div class="yol-row"><span class="n">${n}</span>${bar}<span class="m">${m}</span>${pill}</div>`
const pill = (t, tone = '') => `<span class="p2-pill ${tone}">${t}</span>`
// "Yolun" listesinde "değişim yok" hap değil, sakin bir alt satırdır; yalnız değişim olan satır hap taşır (5 saniye turu 2, öneri)
const calm = (t) => `<span class="p2-pill quiet">${t}</span>`
const yolRows = [
  row('Göz egzersizleri', '9. basamak · 5 dk', '', bar28(28, every)),
  row('Nefes', '5. basamak · 3 dk', pill('sakinlikte belirgin artış', 'ok'), bar28(28, every)),
  row('Haftalık E testi', 'haftada bir', calm('doğrulanmış bir değişim yok'), bar28(4, weekly)),
  row('Okuma', 'haftada bir', calm('doğrulanmış bir değişim yok'), bar28(4, (i) => i % 7 === 5)),
  row('Çemberler', 'seviye 6', '', bar28(28, every)),
  row('Yılan', 'rekor 38', '', bar28(7, (i) => [2, 6, 10, 13, 19, 23, 27].includes(i))),
  row('Bugünün görevi', 'katman 2', '', bar28(28, every)),
  row('Fark Ettin mi?', 'seviye 3', calm('doğrulanmış bir değişim yok'), bar28(10, (i) => [1, 4, 5, 9, 12, 15, 16, 20, 22, 26].includes(i))),
  row('Tek Bakışta', 'seviye 2', calm('başlangıç oluşuyor'), bar28(9, (i) => [3, 7, 8, 11, 14, 18, 21, 24, 25].includes(i))),
  row('Yoga', 'yolda · 3 dk', '', bar28(24, (i) => i % 7 !== 3)),
]
const g1 = shot({
  label: '34. gün · 3 Kasım Salı · Gelişim, kaydırılmış',
  cap: 'Bölüm iris haritasının ve alan satırlarının altında, dışa aktarma kartından önce durur; ekran başlığa kaydırıldı. Kartın başında şeridin anahtarı yazar: son 28 gün, dört hafta, her çubuk bir gün; dolu çubuk kayıt olan gündür. Yalnız değişim olan satır hap taşır; "doğrulanmış bir değişim yok" ve "başlangıç oluşuyor" sakin bir alt satırdır. Nefes satırının hapı etki kuralındandır. Yoga satırında yoldaki süre yazar; basamak satırı onaylı yoga planındandır.',
  ref: '§3.B.6, §3.C.4',
  tabs: 'progress', mode: 'auto',
  body: screen(`<div class="home-h" style="margin-top:0"><h2>Yolun · 34. gün</h2></div><div class="card gm-rows"><div class="yol-key" aria-hidden="true"><span>Son 28 gün</span><span class="k"><i class="on"></i>kayıt var<i></i>yok</span></div>${yolRows.join('')}</div><p class="muted small">İlk haftalarda sonuçların alıştıkça iyileşmesi olağandır; bu, göreve alıştığını gösterir.</p>`, 'crop'),
})
// Fark Ettin mi? isabeti (örnek): 10 ölçüm günü; ilk üçünün ortancası %64 (başlangıç), son üçünün ortancası %71 (şimdi)
const MDAYS = [1, 4, 5, 9, 12, 15, 16, 20, 22, 26], MVALS = [62, 64, 66, 60, 69, 63, 72, 67, 71, 74]
const mchart = (() => {
  const X = (d) => 34 + (d / 27) * 290, Y = (v) => 92 - ((v - 56) / 22) * 80
  const dots = MDAYS.map((d, i) => `<circle class="${i < 3 ? 'b' : i >= 7 ? 'n' : ''}" cx="${X(d).toFixed(1)}" cy="${Y(MVALS[i]).toFixed(1)}" r="${i >= 7 ? 5.5 : 4.5}"/>`).join('')
  return `<div class="mchart" role="img" aria-label="İsabet, son 28 günde 10 ölçüm günü: başlangıç yüzde 64, son üç ölçümün ortancası yüzde 71; kural değişimi doğrulamadı"><svg viewBox="0 0 330 118"><path class="mc-ax" d="M34 104H324"/><text class="mc-t" x="34" y="116">28 gün önce</text><text class="mc-t e" x="324" y="116">bugün</text><path class="mc-grid" d="M34 ${Y(64)}H324M34 ${Y(71)}H324"/><path class="mc-base" d="M34 ${Y(64)}H${X(6)}"/><path class="mc-now" d="M${X(19)} ${Y(71)}H${X(27)}"/><text class="mc-lab" x="28" y="${Y(64) + 3.5}">%64</text><text class="mc-lab n" x="28" y="${Y(71) + 3.5}">%71</text>${dots}</svg></div>`
})()
const g2 = shot({
  label: 'Modül ayrıntısı · Fark Ettin mi?',
  cap: 'Her modül kartı dört katman taşır: düzen, basamak, ölçü ve değişim. Değişim yalnız kural doğrularsa yazılır. Küçük grafik son 28 günün ölçümlerini gösterir: kesik çizgi başlangıç (%64), mavi çizgi son üç ölçümün ortancası (%71); noktalar günden güne oynar ve mavi çizgi yalnız son günlerde yukarıdadır. Kural farkın iki hafta art arda sürmesini ister; grafik bu hükmün neden sayılarla çelişmediğini gösterir.',
  ref: '§3.B.6, §3.B.5',
  mode: 'auto', time: '10:20', fold: true,
  body: screen(`<span class="btn-icon" aria-hidden="true">${svg(I.chevL)}</span><header class="page-header"><span class="eyebrow">Yolun · 34. gün</span><h1>Fark Ettin mi?</h1></header>
<section class="card"><dl class="ly"><div><dt>Düzen</dt><dd>Son 28 günde 10 gün</dd></div><div><dt>Basamak</dt><dd>Seviye 3</dd></div><div><dt>Ölçü</dt><dd>İsabet: başlangıç %64 → şimdi %71</dd></div><div class="chg"><dt>Değişim</dt><dd>${pill('doğrulanmış bir değişim yok')}</dd></div></dl>${mchart}<div class="gm-strip" aria-hidden="true">${Array.from({ length: 28 }, (_, i) => `<i class="${[1, 4, 5, 9, 12, 15, 16, 20, 22, 26].includes(i) ? 'on' : ''}"></i>`).join('')}</div><p class="p2-msg">İlk haftalarda sonuçların alıştıkça iyileşmesi olağandır; bu, göreve alıştığını gösterir.</p></section>
<section class="card"><b>Yöntem</b><p class="p2-msg">Yayımlanmış bir 'anlamlı değişim' eşiği varsa o kullanılır. Yoksa aynı günün ölçümleri tek değer sayılır ve ilk günlerin ortancası başlangıç olur. Son üç ölçüm gününün ortancası başlangıçtan belirgin biçimde ayrılır ve bu, iki haftalık bakışta art arda sürerse değişim denir. Tek güne değil, süren farka bakılır.</p></section>`),
})
const gParts =
  part('Ölçü kuralı v2 · hap metinleri', `<div style="display:grid;gap:8px;font-size:.82rem;color:var(--ink-2)"><span>Görev ve oyun: ${pill('başlangıcından iyi', 'ok')} ${pill('başlangıcının gerisinde', 'warn')}</span><span>Kendi beyanı: ${pill('puanın başlangıcından yüksek', 'ok')} ${pill('puanın başlangıcından düşük', 'warn')}</span><span>Değişim yok: ${pill('doğrulanmış bir değişim yok')}</span><span>Başlangıç kurulmadı: ${pill('başlangıç oluşuyor')}</span><span>Alanda iki yön birden: ${pill('karışık')}</span><span>Önce → sonra etkisi: ${pill('belirgin artış', 'ok')} ${pill('belirgin düşüş', 'warn')}</span><span>Harita lejantı: başlangıcından iyi · başlangıcının gerisinde</span></div>`, 'Göz (E testi, okuma) metninde "iyileşiyor" kalır; değişim yoksa göz de "doğrulanmış bir değişim yok" yazar. Etki hapları yoganın onaylı kalıbıdır; "Yolun" satırında ölçünün adıyla başlar ("sakinlikte belirgin artış"). Göz uyarısı ve WHO-5 düşüşü her zaman önce gelir.', '§3.B.5, §3.B.4, 16, 17') +
  part('Ölçüsü olmayan modül · ayrıntıda bir kez', `<section class="card" style="padding:14px"><b>Göz egzersizleri</b><p class="p2-msg">Bu modülde düzenini izliyoruz: kaç gün yaptığını ve hangi basamakta olduğunu.</p><div class="p2-kv"><div><b>28/28</b><span>gün</span></div><div><b>9.</b><span>basamak</span></div><div><b>5 dk</b><span>yolda</span></div></div></section>`, '', '§3.B.6') +
  part('Seviye değişince · öneri', `<section class="card" style="padding:14px"><p class="p2-msg">Seviye değişti; başlangıç yeniden kuruluyor.</p>${pill('başlangıç oluşuyor')}</section>`, 'Önce → sonra kartındaki ortalamaya dönüş notu da öneridir: "Gergin başladığın seanslarda sonraki puan kendiliğinden ortaya yaklaşabilir; bu yüzden tek seansa değil, son 28 güne bakılır."', '§3.B.6, §3.B.5') +
  part('Sürüm notu (Yenilikler)', `<p style="font-size:.92rem;line-height:1.5">Gelişim artık her sonucu ilk günlerindeki başlangıcınla karşılaştırıyor ve bir farkı ancak iki hafta art arda sürerse değişim sayıyor.</p>`, '', '§3.B.5')
const secG = sec({
  id: 'g', title: 'Gelişim: "Yolun" bölümü ve ölçü kuralı v2', meta: 'Aşama Y2 · karar 2 · §3.B.4, §3.B.5, §3.B.6',
  shots: [g1, g2], parts: gParts,
  whyHtml: why({
    neden: `Karar 2 ile her sonuç kişinin kendi başlangıcıyla karşılaştırılır ve bir fark ancak iki hafta art arda sürerse değişim sayılır (§3.B.5).`,
    more: `Görev ve oyunda "iyileşiyor" yerine "başlangıcından iyi" ya da "başlangıcının gerisinde", kendi beyanında "puanın başlangıcından yüksek" ya da "düşük" yazar. Değişim yoksa "doğrulanmış bir değişim yok", başlangıç kurulmadıysa "başlangıç oluşuyor" yazar (§3.B.5). Bölüm alan satırlarının altında durur; her satırda modül adı, basamak, 28 günlük şerit ve varsa durum hapı bulunur (§3.B.6). Nefes'in ölçüsü sakinliğin önce → sonra farkıdır ve kuralı etki kuralıdır; Nef aynı durumu §3.C.4'teki etki cümlesiyle söyler (§3.C.1: tek hesap, iki yüz). Hap renkleri bugünkü tonlardır.`,
    vars: `Hapın satırın sağında değil altında durması (v2 hapları uzun; 320 pt'de ad sütunu eziliyordu); Çemberler, Yılan, Bugünün görevi satırlarının basamak yazımı; seviye değişince çıkan cümle; dört katmanın dizilişi; 28 günlük şeridin dört haftaya bölünmesi; "değişim yok" hapının çizgili çizilmesi; ayrıntıdaki ölçü grafiği (örnek değerler).`,
    qs: [
      q('7', 'Basamak sıra sayısıyla yazılır ("5. basamak · 3 dk"); iç kodlar (N4, Ç-C, K7) ekranda görünmez. 34. günde nefes 5. basamaktadır.'),
      q('18', '"Yolun · 34. gün" iris haritasının ortasındaki sayıdır (başlangıçtan beri takvim günü); aynı ekranda iki ayrı gün sayısı olmaz.'),
      q('17', 'Göz hapı da "doğrulanmış bir değişim yok" yazar; göz kuralı (trend.js) değişmez, yalnız yazım birleşir.'),
      q('16', 'v2\'nin dili harita lejantını ve etki haplarını da kapsar: lejant "başlangıcından iyi / başlangıcının gerisinde", etki hapları yoganın onaylı kalıbıyla "belirgin artış / belirgin düşüş" olur; "iyileşme" ve "kötüleşme" kalkar.'),
    ],
  }),
})

// ================= h) Nef haftalık ve aylık değerlendirme =================
// 6. gün yolu (benzetim: K5, Fark Ettin mi? yeni, Yılan düşer, yoga Sağlam Yer); ekranda yalnız sonu görünür
const day6 = todayPath({
  stops: [
    { title: 'Isınma', form: 'ex', glyph: 'arrows', st: 'now', sub: '1 dk' },
    { title: 'Uzağa bakış', form: 'ex', glyph: 'far', st: 'later', sub: '1 dk' },
    { title: 'Çemberler', form: 'pr', glyph: 'constel', st: 'later', sub: '1 dk' },
    { title: 'Fark Ettin mi?', form: 'pr', glyph: 'street', st: 'later', sub: '2 dk', tag: 'Yeni', tagNew: true },
    { title: 'Nefes', form: 'rest', glyph: 'moon', st: 'later', restMin: 3, sub: 'Gözlerin dinlenirken nefes al.' },
    { title: 'Yukarı–aşağı', form: 'ex', glyph: 'updown', st: 'later', sub: '1 dk' },
    { title: 'Göz kırpma', form: 'ex', glyph: 'lid', st: 'later', sub: '1 dk' },
    { title: 'Yoga', form: 'pr', glyph: 'lotus', st: 'later', sub: 'Sağlam Yer · 3 dk' },
    { title: 'Bugünün görevi', form: 'fi', glyph: 'spark', st: 'later', sub: '1 dk' },
  ],
  blocks: [{ eyeMin: 2, eyeDone: 0, capMin: 4 }, { eyeMin: 2, eyeDone: 0, capMin: 4 }],
  bandMin: 5,
  // "Bu hafta 1/3 gün" yazılmaz: hemen altındaki Nef kartı aynı sayıyı söylüyor (Ç20)
})
const h1off = day6.L.pos[6][1] - 48 // Göz kırpma tam görünür; Nef kartı sekme çubuğunun hemen üstünde biter
const h1 = shot({
  label: '6. gün · 6 Ekim Salı · Ana sayfa, kaydırılmış', mode: 'auto',
  cap: 'Ekran yolun sonuna kaydırıldı. Günlük kart bugünkü gibi kalır (burada sunucuya ulaşılamadığı için kural yedeği konuşuyor); altına haftalık değerlendirmenin satırı gelir (Pazartesi–Çarşamba). Kart haftanın sayısını söylediği için yolun altındaki "Bu hafta 1/3 gün" yazılmaz (Ç20). Nef kartı aynı gün olay satırını yinelemez. Altında "Ölçümlerin" bugünkü gibi başlar.',
  ref: '§3.C.2, §2.1 satır 2',
  tabs: 'home', time: '10:02',
  body: screen(`<div class="tail" style="margin-top:-${h1off}px">${day6.html}</div><section class="card coach-card"><div class="row between"><span class="coach-badge">${svg(I.sparkles)} Bugün · Nef</span><span class="coach-offline">${svg(I.wifiOff)} çevrimdışı öneri</span></div><p class="coach-insight">Bu hafta 1/3 gün çalıştın.</p><span class="coach-action"><span>Hafif set (1 dk)</span>${svg(I.chevR)}</span><span class="coach-next hi"><span>Haftalık değerlendirmen hazır</span>${svg(I.chevR)}</span></section><div class="home-h"><h2>Ölçümlerin</h2><span class="link-btn">Gelişim ${svg(I.chevR).replace('<svg', '<svg width="15" height="15"')}</span></div>`, 'crop'),
})
// Kural şablonundan gelen dönem kartı: "bu telefonda hazırlandı" (Ç8); "çevrimdışı" yalnız sunucuya ulaşılamayan günlük kartta
const nefCard = ({ badge, range, lines, action }) => `<section class="card coach-card"><div class="row between"><span class="coach-badge">${svg(I.sparkles)} ${badge}</span><span class="coach-offline">${svg(I.phone)} bu telefonda hazırlandı</span></div><span class="nef-range">${range}</span><ul class="nef-lines">${lines.map((l, i) => { const o = typeof l === 'string' ? { t: l } : l; return `<li${o.cls ? ` class="${o.cls}"` : ''}><i>${i + 1}</i><span>${o.t}${o.viz ?? ''}</span></li>` }).join('')}</ul><span class="coach-action"><span>${action}</span>${svg(I.chevR)}</span></section>`
// Geçen takvim haftası (28 Eylül Pazartesi – 4 Ekim Pazar): kişi 1 Ekim Perşembe başladı, dört gün
const weekViz = `<span class="nef-wk" aria-hidden="true">${[0, 0, 0, 1, 1, 1, 1].map((d) => `<i class="${d ? 'on' : ''}"></i>`).join('')}</span>`
const h2 = shot({
  label: '6 Ekim Salı · Gelişim\'in başı',
  cap: 'Aynı gün 5. gün raporu da açıktır; ikisi üst üste durur. Geçen takvim haftasında 4 gün veri var, eşik tutuyor; 1. satırın altındaki yedi kare o haftanın günleridir. 6. günde başlangıç henüz kurulmadığı için 2. satır "başlangıcın henüz oluşuyor" der. Altında Gelişim haritası bugünkü gibidir.',
  ref: '§3.C.2, §3.B.5',
  tabs: 'progress', mode: 'auto', time: '10:03', fold: true,
  body: screen(`<header class="page-header"><h1>Gelişim</h1></header><span class="p2-report"><span><b>İlk günlerinin raporu</b><small>Düzen, uygulamalardan sonraki değişim, ölçümler</small></span>${svg(I.chevR)}</span>${nefCard({ badge: 'Haftalık · Nef', range: '28 Eylül – 4 Ekim', lines: [{ t: 'Geçen hafta 4 gün çalıştın; hedefin 3 gündü.', cls: 'win', viz: weekViz }, 'En düzenli alanın Göz; başlangıcın henüz oluşuyor.', 'Bu hafta göz egzersizlerine <span class="nw">yakın–uzak</span> ekleniyor.'], action: 'Yolun bölümünü aç' })}${growthMap({ day: 6, counts: [5, 4, 5, 5, 3, 0, 0] })}`),
})
const h3 = shot({
  label: '29. gün · 29 Ekim Perşembe · Gelişim\'in başı',
  cap: 'Aylık kart 29., 57. ve 85. günlerde gelir; Ana sayfada 3 gün "Aylık değerlendirmen hazır" satırıyla durur. 28. gün iris haritası yapılmadıysa eylem odur. Kayıt satırı koyu, "değişim yok" satırları sakin yazılır. Altındaki harita bir ayın düzenini gösterir.',
  ref: '§3.C.2',
  tabs: 'progress', mode: 'auto', time: '10:03', fold: true,
  body: screen(`<header class="page-header"><h1>Gelişim</h1></header><div class="segmented" aria-hidden="true"><span>Hafta</span><span class="on">Ay</span></div>${nefCard({ badge: 'Aylık · Nef', range: '1–28 Ekim', lines: [{ t: 'Göz alanında 28, Sakinlik alanında 27 gün kaydın var.', cls: 'win' }, { t: 'Doğrulanmış bir değişim yok.', cls: 'q' }, { t: 'Görmende doğrulanmış bir değişim yok.', cls: 'q' }, 'Önümüzdeki 28 günde nefese ve göz egzersizlerine yeni basamak geliyor.'], action: 'İris haritası' })}${growthMap({ day: 29, counts: [28, 24, 27, 27, 20, 1, 0] })}`),
})
const hParts =
  part('12 Ekim Pazartesi · günlük kartın kural yedeği', `<section class="card coach-card"><div class="row between"><span class="coach-badge">${svg(I.sparkles)} Bugün · Nef</span><span class="coach-offline">${svg(I.wifiOff)} çevrimdışı öneri</span></div><p class="coach-insight">Yeni hafta başladı; hedefin 3 gün.</p><span class="coach-action"><span>Hafif set (1 dk)</span>${svg(I.chevR)}</span><span class="coach-next"><span>Haftalık değerlendirmen hazır</span>${svg(I.chevR)}</span></section>`,
    'Sıfır kuralı Ana sayfadaki Nef kartını da kapsar: haftada henüz gün yokken "Bu hafta 0/3 gün çalıştın." yazılmaz. Hedef kişinin haftalık hedefidir.', 'karar 5d, Ç7') +
  part('Nef izni olmayan kişi · Ana sayfa, Pazartesi', `<section class="card coach-card coach-intro"><div class="row between"><span class="coach-badge">${svg(I.sparkles)} Nef Göz Koçu</span></div><p class="coach-lead">Kendi verine bakıp her gün bir öneri, her hafta ve her ay bir değerlendirme yazar.</p><span class="btn btn-ghost btn-sm" style="align-self:flex-start">Nasıl çalışır, aç</span><span class="coach-next"><span>Haftalık değerlendirmen hazır</span>${svg(I.chevR)}</span></section>`,
    'Kural kartı telefonda hazırlanır, veri gitmez; bu yüzden izin istemez. Satır Gelişim\'in başındaki aynı karta götürür.', '§1, §3.C.2, Ç8') +
  part('Olay satırı · 4 Ekim Pazar', `<div class="hh-nef"><span class="hh-nef-eye" aria-hidden="true"></span><p>Bugün yeni: yukarı–aşağı.</p></div>`, 'Olay ayrı bir kart değildir; günün cümlesinin yerine aynı satıra, aynı biçimde yazılır. Günde en çok bir olay gelir. Gün, (a)\'daki 1–8. gün tablosundandır.', '§3.C.2, §3.F.4') +
  part('Cümle şablonları · örnekler', `<ul class="nef-lines" style="font-size:.9rem"><li><i>·</i><span>Nefes 4. basamakta: bugün 3 dakika sürecek.</span></li><li><i>·</i><span>Fark Ettin mi?'de sonucun iki haftadır başlangıcının gerisinde.</span></li><li><i>·</i><span>Dikkat alanında sonuçlar farklı yönlerde; doğrulanmış bir değişim yok.</span></li><li><i>·</i><span>Beş gün ara verdin; basamağın aynı, kaldığın yerden devam ediyorsun.</span></li></ul>`, 'Nef başkasıyla karşılaştırmaz; tanı, risk, "normal" demez; "seri bozuldu" ya da "kaçırdın" demez.', '§3.C.3, §3.C.4')
const secH = sec({
  id: 'h', title: 'Nef: haftalık ve aylık değerlendirme, olay satırı', meta: 'Aşama Y6 · §3.C.1–§3.C.4 · §2.1',
  shots: [h1, h2, h3], parts: hParts,
  whyHtml: why({
    neden: `Haftalık değerlendirme Pazartesi gelir ve geçen takvim haftasında en az 4 gün veri ister; aylık değerlendirme 29., 57. ve 85. gündedir (§3.C.2).`,
    more: `Haftalık kart Ana sayfada Pazartesi–Çarşamba, Gelişim'in başında durur. Model yolu 30 soruluk sınavdan sonra açılır; o zamana kadar kural yedeği konuşur. Kural şablonundan gelen dönem kartı "bu telefonda hazırlandı" etiketini taşır; Nef izni olan ve olmayan kişide aynı yerlerde durur. Cümleler §3.C.4 şablonlarındandır ve en çok 70 karakterdir (§3.H). Nef'in söylediği durum Gelişim'in aynı gün gösterdiği durumla aynıdır (§3.C.1).`,
    vars: `Kart iskeleti (YOL.nef.md §5: haftalık 3 satır + 1 eylem, aylık 4 satır + 1 eylem), numaralı satırlar, haftalık 1. satırın altındaki yedi kare, aylık kartta "değişim yok" satırlarının sakin yazılması, tarih aralığı, "Hafta · Ay" seçimi, haftalık 2. satır (v2 durumundan türetildi), aylık 1., 2. ve 4. satır, "Haftalık değerlendirmen hazır", "Yolun bölümünü aç".`,
    qs: [
      q('Ç6', 'Aylık 1. ve 4. satırın kısa hâli kalır: "Göz alanında 28, Sakinlik alanında 27 gün kaydın var." (53) ve "Önümüzdeki 28 günde nefese ve göz egzersizlerine yeni basamak geliyor." (70). Nef satırında 70 karakter sınırı aşılmaz.'),
      q('Ç7', 'Sıfır kuralı Nef kartını da kapsar: kural yedeği haftada henüz gün yokken "Yeni hafta başladı; hedefin 3 gün." yazar (yukarıda).'),
      q('Ç20', 'Nef kartı haftanın sayısını söylüyorsa ("Bu hafta 1/3 gün çalıştın.") yolun hemen altındaki "Bu hafta 1/3 gün" satırı o gün yazılmaz; aynı sayı alt alta iki kez okunmaz.'),
      q('Ç8', 'Haftalık ve aylık kural kartı Nef izni olan ve olmayan kişide aynı yerlerde durur; izni olmayan kişide Ana sayfada Nef tanıtım kartının altında tek satır gelir. Kural şablonundan gelen dönem kartının etiketi "bu telefonda hazırlandı" olur; "çevrimdışı" yalnız sunucuya ulaşılamayan günlük kartta kalır.'),
    ],
  }),
})

// ================= i) Nef rızası v2 =================
const NEF_CONSENT = {
    title: "Nef'in izin metni güncellendi",
    badge: 'Nef Göz Koçu',
    lead: "<b>Haftalık ve aylık değerlendirme eklendi.</b> Nef'e artık yoldaki basamağın ve ara verdiğin gün sayısı da gidiyor; görme ölçümünün sayıları ve okuma hızı ise gitmiyor. Bu yüzden yeniden soruyoruz. \"Şimdi değil\" dersen günlük öneri eski iznin kapsamında sürer; yeni özetler gitmez.",
    facts: [
      ['Ne', `<span class="cs-p">Son 7 günün, geçen haftanın ve son 28 günün özetleri:</span><ul class="cs-list">${['her alanda kaydın olan gün sayısı;', 'çalışma dakikası ve seri;', 'ölçüm sonuçlarının sayısı değil durumu ("doğrulanmış bir değişim yok" gibi);', 'görmede yalnız aşama ve uyarı düzeyi;', 'okuma testinin değişim yönü;', 'oyun ve pratik özetleri (nefes öncesi ve sonrası sakinlik farkı dahil);', 'yoldaki basamağın, kaç gündür yolda olduğun, ara verdiğin gün sayısı ve "Sonra yaparım" sayısı;', 'günün saati.'].map((t) => `<li>${t}</li>`).join('')}</ul><span class="cs-p cs-no">${svg(I.x, 'cs-x', 2.4)}<span>Kamera görüntüsü, görme ölçümünün sayıları, okuma hızı, günün nasıl geçtiği, konumun, şehrin, hava bilgisi, adın, e-⁠postan, cihaz kimliğin ve Apple Sağlık verilerin gitmez.</span></span>`],
      ['Neden', "Nef'in sana günlük bir öneri, haftalık ve aylık bir değerlendirme yazması (tıbbi tavsiye değildir)"],
      ['Nerede', 'Yurt dışında: sunucumuz (Vercel) ve OpenRouter üzerinden bir yapay zekâ modeli · şifreli bağlantı'],
      ['Ne kadar', "Sunucumuz içeriği kaydetmez. Nef'i kapattığın an gönderim durur"],
    ],
    check: 'Bu özetlerin (görme ölçümünün durumu ve sakinlik farkı sağlığa ilişkin veridir) yukarıdaki amaçla yurt dışına aktarılmasına açık rıza veriyorum.',
}
const i1 = shot({
  label: 'Nef rızası v2 · bir kez · ilk ekran',
  cap: 'Daha önce Nef\'e izin vermiş kişiye günün ilk dokunuşundan ya da ilk duraktan sonra gösterilir. Başta Nef\'in uygulamadaki adı ("Nef Göz Koçu") durur; giriş paragrafının ilk cümlesi kalındır, ne değiştiğini tek başına söyler. Onay kutusu ve iki düğme altta sabittir; metin üstte kayar ve dipte solarak devam ettiğini gösterir. "Ne" satırında gidenler madde madde, gitmeyenler ayrı kutudadır. "Şimdi değil" eski izni geri çekmez.',
  ref: '§3.C.5, §2.2 K4',
  time: '10:12', sb: 'clear',
  body: consent({ ...NEF_CONSENT, fade: true }),
})
const i2 = shot({
  label: 'Aynı sayfa · sona kaydırılmış, kutu işaretli',
  cap: 'Metnin geri kalanı: Neden, Nerede, Ne kadar. Kutu işaretlenince "İzin ver" açılır.',
  ref: '§3.C.5, §1',
  time: '10:13', sb: 'clear',
  body: consent({ ...NEF_CONSENT, on: true, end: true }),
})
const iParts =
  part('Yeni kullanıcı · Nef tanıtım kartı', `<section class="card coach-card"><div class="row between"><span class="coach-badge">${svg(I.sparkles)} Nef Göz Koçu</span></div><p class="coach-lead">Kendi verine bakıp her gün bir öneri, her hafta ve her ay bir değerlendirme yazar.</p><span class="btn btn-ghost btn-sm" style="align-self:flex-start">Nasıl çalışır, aç</span></section>`, 'Bugünkü satır ("her gün tek bir içgörü ve bir öneri") yeni değerlendirmeleri anlatmıyor; yerine bu satır gelir.', '§3.C.2') +
  part('coachLife v2 · öneri metni', `<dl class="cs-facts"><div><dt>Giriş</dt><dd>İsteğe bağlı. İzin vermesen de Nef çalışır; yalnızca öneriler uykunu hesaba katmaz.</dd></div><div><dt>Ne</dt><dd>Profil sorularına verdiğin cevapların özeti: uyku puanı, gece telefona bakma sıklığı, stres puanı.</dd></div><div><dt>Onay</dt><dd>Profil cevaplarımın özetinin (uyku puanı, gece telefona bakma sıklığı, stres puanı; sağlığa ilişkin veri) de aynı amaçla yurt dışına aktarılmasına açık rıza veriyorum.</dd></div></dl>`, '"Ekran süresi" satırı bu metinden kalkar. Metin yalnız daraldığı için izin vermiş kişiye yeniden sorulmaz; sürüm kayıt için artar.', '§3.C.5, §3.D.2, 14')
const secI = sec({
  id: 'i', title: 'Nef rızası v2 (bir kez gösterilen)', meta: 'Aşama Y6 · karar 6 · §1 Gizlilik, §3.C.5 · hukukçu yedeği',
  shots: [i1, i2], parts: iParts,
  whyHtml: why({
    neden: `Karar 6 ile Nef'e sayı yerine durum sözcükleri gider; görme sayıları, okuma hızı ve eski ekran süresi cevabı çıkar, yol basamakları eklenir (§3.C.5).`,
    more: `Daha önce izin vermiş kişiye yeni metin bir kez gösterilir ve onayı yeniden alınır. "Şimdi değil" diyen kişiye yalnız eski metnin izin verdiği alanlardan pakette kalanlar gider (§3.C.5). Hukukçu yedeğinde ruh hâli (n7, moodStatus) gitmez; "Ne" satırında "günün nasıl geçtiği" gitmeyenler arasında yazılır (§1).`,
    vars: `Metnin tamamı; plan yalnız kapsamı veriyor. Onay kutusunun ve iki düğmenin altta sabit durması, "Ne" satırının maddelenmesi, başta "Nef Göz Koçu" etiketi, giriş paragrafının ilk cümlesinin kalın yazılması ve kayan metnin dipte solması. Satır adları (Ne, Neden, Nerede, Ne kadar) ile "Nerede" ve "Ne kadar" satırları bugünkü metnin aynısıdır (lib/consent.js:64-67); giriş cümlesi bugünkü "healthUpdate" kalıbındadır. Metin, hukukçuya giden 3. sorunun konusudur; hukukçu yokken yedek uygulanır.`,
    qs: [
      q('13', 'Metin, karar 6\'ya uyan bu taslaktır. YOL.nef.md §7.4\'teki taslak görme ortancasını ve okuma hızını saydığı için kullanılmaz.'),
      q('14', 'coachLife v2 yeniden sorulmaz: metin yalnız daraldı ("ekran süresi" çıktı) ve eski izin yeni metnin kapsamını zaten içerir. Sürüm numarası kayıt için artar, ama yeniden sormayı tetiklemez.'),
      q('Ç9', '"Ne" satırı kısaltılmaz, çünkü kısalınca kapsam belirsizleşir. Okunsun diye gidenler madde madde, gitmeyenler ayrı bir kutuda yazılır; sözcükler ve noktalama aynıdır.'),
    ],
  }),
})

// ================= j) Açılış ekranı ve giriş ekranı =================
const j3 = shot({
  label: 'Giriş ekranı · ilk kez açan kişi',
  cap: 'Onaylı giriş ekranının yalnız alt yazısı değişir. "Nefona" ve "Başla" aynı kalır. Zemin her temada gecedir. 320 × 568\'de alt yazı en az 14 px kalır (Ç10).',
  ref: 'karar 5a, §3.F.2',
  sb: 'on-dark', scrCls: 'intro-scr', noHome: true,
  body: `<div class="intro"><canvas data-draw="intro" aria-hidden="true"></canvas><div class="intro-brand"><h1>Nefona</h1><p>20 saniyede sana fark etmediğin bir şeyi göstereceğiz.</p></div><span class="intro-start">Başla</span></div>`,
})
const introMini = '<div class="mini"><div class="intro"><canvas data-draw="intro" aria-hidden="true"></canvas><span class="intro-start">Başla</span></div></div>'
const seq = (cls) => `<div class="seq"><div class="mini ${cls}"></div><span class="pg-arrow">${svg(I.chevR).replace('<svg', '<svg width="18" height="18"')}</span>${introMini}</div>`
const jSeq = part('Geçiş · açık tema', seq('l'), 'Açık temadaki açılış ekranından sonra gece zeminli giriş ekranı gelir. Bugün de böyledir: açılış görselinin zemini #F3F6F8\'dir, karar 5c yalnız logoyu kaldırır. Geçiş cihazda iki temada denenir.', 'karar 5c, §3.H, 20') + part('Geçiş · koyu tema', seq('d'), 'Koyu temada iki zemin birbirine yakındır; geçiş yumuşak görünür.', 'karar 5c')
const jParts = part('Kamera izin metni (Info.plist) · öneri', `<p style="font-size:.92rem;line-height:1.5">Ön kamera, İlk Bakış'ta ve göz kırpma egzersizinde göz kırpmalarını saymak, testlerde de telefonun gözünden 40 cm uzakta olduğunu doğrulamak için kullanılır. Görüntüler cihazdan çıkmaz ve kaydedilmez.</p>`, 'Y3\'te kamera metnine yalnız İlk Bakış\'taki kırpma sayımı girer.', '§1, §3.H gizlilik kapısı')
const secJ = sec({
  id: 'j', title: 'İlk kez açan kişi: açılış ve giriş ekranı', meta: 'Aşama Y3 · karar 5a, 5c · §3.F.1, §3.F.2',
  shots: [j3], parts: jSeq + jParts,
  whyHtml: why({
    neden: `Karar 5c açılış ekranındaki logoyu kaldırır, karar 5a giriş ekranına İlk Bakış'ın vaadini yazar (§3.F.1, §3.F.2).`,
    more: `Düz zemin Apple'ın önerisidir. Açılış görselinin zemini bugün de uygulamanın zeminidir (açıkta #F3F6F8, koyuda #070C12; Splash.imageset), bu yüzden logo kalkınca renk değişmez. "Fark etmeyi yeniden öğren." yerine yeni alt yazı gelir. İki "Başla" şimdilik birleşmez; önce ilk dokunuştan sonuca geçen süre cihazda ölçülür (§3.F.2). Cihaz listesinde "açılış ekranından geçişte parlama yok" maddesi var (§3.H).`,
    vars: `Kamera izin metni; alt yazıda "fark" ile "etmediğin" arasında satır kırılmaması. Giriş ekranının sürümü artmaz: eski kullanıcı yeni alt yazıyı görmez.`,
    qs: [
      q('20', 'Zeminler değişmez. Açık temada ilk açılışta açık zeminden gece zeminine geçiş bugün de vardır; karar 5c yeni bir geçiş getirmez. İlk açılışa özel bir zemin yapılamaz, çünkü açılış ekranı her açılışta aynıdır. Y3 cihaz listesinde iki temada bakılır.'),
      q('Ç10', '320 × 568\'de alt yazı en az 14 px kalır (bugünkü ölçekle 11 px olurdu); öteki boylarda ölçek aynen kalır.'),
    ],
  }),
})

// ================= k) Sitenin ilk ekranı =================
const eSvg = '<svg viewBox="0 0 5 5" aria-hidden="true"><path d="M0 0h5v1H1v1h3v1H1v1h4v1H0z" fill="#0b1219"/></svg>'
const miniPhone = `<div class="mini-phone"><div class="in"><div class="eh"><span>E testi · tadımlık</span><span>Harf 1/5</span></div><div class="stage">${eSvg}</div><p class="q">E'nin açık tarafı hangi yönde?</p><div class="pad">${[['u', 'M12 19V5M5 12l7-7 7 7'], ['l', 'M19 12H5M12 5l-7 7 7 7'], ['r', 'M5 12h14M12 5l7 7-7 7'], ['d', 'M12 5v14M5 12l7 7 7-7']].map(([c, d]) => `<i class="${c}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg></i>`).join('')}</div></div></div>` // yön düğmeleri sitedeki gibi okla (site/index.html .edemo-pad)
const siteHero = (desk, cls = '') => `<div class="site${cls ? ' ' + cls : ''}"><div class="nav"><span class="brand">${MARK()}Nefona</span>${desk ? `<span class="navlinks"><span>Nasıl çalışır</span><span>Modüller</span><span>Bilim</span><span>Gizlilik</span><span>Destek</span></span><span class="tbtn">${svg(I.sun)}</span>` : `<span class="tbtn menu">${svg(I.menu)}</span><span class="tbtn">${svg(I.sun)}</span>`}</div><section class="hero2"><div class="wrapx"><div class="hero-text"><span class="s-ey"><span lang="en">iPhone</span> için · yakında App Store'da</span><h1 class="s-h1">Bu cümleyi okurken${desk ? '<br>' : ' '}kaç kez göz kırptın?</h1><p class="s-line">Bilmiyorsan şaşırma. Nefona ilk açılışta göz kırpmalarını 20 saniyede sayar; kamera görüntün telefondan çıkmaz.</p><div class="cta"><span class="sbtn p">E hangi yöne bakıyor? Dene</span><span class="sbtn s">Bir günün nasıl geçer</span></div><ul class="facts"><li>7 gün ücretsiz, 18 yaş ve üstü</li><li>Tanı koymaz, tedavi etmez</li></ul></div><div class="demo">${miniPhone}</div></div></section></div>`
const k1 = `<figure class="shot wide"><div class="fitbox"><div class="fit"><div class="desk"><div class="chrome"><i></i><i></i><i></i><span>nefona.app</span></div>${siteHero(true)}</div></div></div><figcaption><b>Masaüstü · 1280 px</b>Bugünkü iki sütunlu düzen kalır. Başlığın iki satıra sığması için boyu 3,9rem yerine 2,9rem olur (Ç12). Soru satırı ve tanıtım paragrafı kalkar, yerine tek satır gelir; kısa gerçeklerden kamera satırı kalkar. Dar ekranda çizim kendi kutusunda yana kaydırılır. <span class="ref">(karar 5b, §3.F.2)</span></figcaption></figure>`
const k2 = shot({ label: 'Telefon · Safari, ilk ekran', cap: 'Tek sütunda tadımlık aşağıya iner. İlk ekranda başlık, tek satır ve iki düğme görünür; 360 pt altında başlık 1,9rem olur (Ç15).', ref: 'karar 5b, §3.F.2', time: '09:41', body: `<div style="padding-top:var(--sat)">${siteHero(false)}</div>` })
const k3 = shot({ label: 'Karşılaştırma · bugünkü başlık boyu (2,2rem)', cap: 'Bugünkü boyla başlık dört satıra çıkar ve "Bir günün nasıl geçer" düğmesi ilk ekranın altında kalır.', ref: 'Ç15', time: '09:41', figCls: 'only320', body: `<div style="padding-top:var(--sat)">${siteHero(false, 'now')}</div>` })
const secK = sec({
  id: 'k', title: 'Sitenin ilk ekranı', meta: 'Aşama Y3 · karar 5b · §3.F.2',
  shots: [k1, k2, k3],
  whyHtml: why({
    neden: `Karar 5b ile sitenin ilk ekranı "Bu cümleyi okurken kaç kez göz kırptın?" sorusuyla açılır ve altında tek satır durur (§3.F.2).`,
    more: `Sitede kamera açılmaz, ölçüm yapılmaz, sayı istenmez, sağlık ya da bilim iddiası yazılmaz (§3.F.2). İki düğme, E testi tadımlığı, sayfa başlığı ve öteki bölümler değişmez. Üst başlık büyük harfe çevrilirken bugünkü sitede "İPHONE" olur (site.css .eyebrow, lang="tr"); çizimde marka adı İngilizce işaretlendi ve "IPHONE İÇİN" yazıyor.`,
    vars: `Üst başlık kalır; soru satırı ("Telefonu biraz daha uzağa mı tutuyorsun?…") ve tanıtım paragrafı kalkar; masaüstünde başlığın "Bu cümleyi okurken / kaç kez göz kırptın?" diye bölünmesi.`,
    qs: [
      q('21', 'Üç kısa gerçeğin ilki ("Kamera görüntün telefondan çıkmaz") kalkar, çünkü aynı söz hemen üstteki satırda var. Öteki ikisi kalır.'),
      q('Ç12', 'Masaüstünde bu başlık 2,9rem ve iki satırdır; 3,9rem\'de dört satıra çıkıyordu ("Bu cümleyi okurken" 742 px, sütun 580 px).'),
      q('Ç15', '360 pt altında başlık 1,9rem olur; 320 × 568\'de iki düğme de ilk ekranda görünür (üçüncü telefon bugünkü boyu gösterir).'),
      q('Ç11', 'Düğmeler plandaki gibi kalır. Başlıktaki soru ile "E hangi yöne bakıyor? Dene" düğmesinin birlikte nasıl okunduğu, sitenin 5 saniye sınamasında bakılan ilk şeydir.'),
    ],
  }),
})

// ================= Sayfa =================
const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<linearGradient id="dd-ig" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#19C2D1"/><stop offset="1" stop-color="#3E7BFA"/></linearGradient>
<radialGradient id="dd-iris" cx=".5" cy=".5" r=".5"><stop offset=".22" stop-color="#070C12"/><stop offset=".25" stop-color="#0F6F8A"/><stop offset=".6" stop-color="#19C2D1"/><stop offset="1" stop-color="#3E7BFA"/></radialGradient>
<radialGradient id="dd-glow" cx=".5" cy=".5" r=".5"><stop offset=".55" stop-color="#5EDCE6" stop-opacity="0"/><stop offset="1" stop-color="#5EDCE6" stop-opacity=".35"/></radialGradient>
<linearGradient id="dd-sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".09"/><stop offset=".45" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>
<linearGradient id="tp-iris" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="300" y2="0"><stop offset="0" stop-color="#19C2D1"/><stop offset="1" stop-color="#3E7BFA"/></linearGradient>
<radialGradient id="tp-lens" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="#5EDCE6"/><stop offset=".45" stop-color="#19C2D1"/><stop offset="1" stop-color="#1F5FD6"/></radialGradient>
<linearGradient id="mk-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22c7d8"/><stop offset=".55" stop-color="#2f86ef"/><stop offset="1" stop-color="#2459d0"/></linearGradient>
<radialGradient id="mk-glow" cx=".2" cy=".1" r=".8"><stop offset="0" stop-color="#fff" stop-opacity="0.2"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<radialGradient id="mk-iris" cx=".5" cy=".5" r=".5"><stop offset=".5" stop-color="#9ff1f6"/><stop offset=".86" stop-color="#7fe6f0"/><stop offset="1" stop-color="#62d8ea"/></radialGradient>
<linearGradient id="dd-bl0" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--dd-bl-a)"/><stop offset="1" style="stop-color:var(--dd-bl-b)"/></linearGradient>
<linearGradient id="dd-bl1" x1="1" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--dd-bl-c)"/><stop offset="1" style="stop-color:var(--dd-bl-d)"/></linearGradient>
<linearGradient id="fc-g" gradientUnits="userSpaceOnUse" x1="3" y1="3" x2="21" y2="21"><stop offset="0" style="stop-color:var(--fc-1)"/><stop offset="1" style="stop-color:var(--fc-2)"/></linearGradient>
</defs></svg>`

const group = (id, n, ey, title, secs) => `<div class="pg-group" id="${id}"><span class="pg-ey">${n} · ${ey}</span><h2>${title}</h2></div>${secs.join('')}`
const nav = [['a', 'Ana sayfa'], ['b', 'Yol ve mola'], ['c', 'Günün nasıl geçti'], ['d', 'Hava ve ay'], ['e', 'Hava teklifi'], ['f', 'Yağmur'], ['g', 'Gelişim'], ['h', 'Nef değerlendirme'], ['i', 'Nef rızası'], ['j', 'Giriş ekranı'], ['k', 'Site']]
const MISSING = [
  '14. gün iyi oluş (WHO-5) kartı, Ana sayfada bir kez (§2.1 satır 19, §3.F.5)',
  '5. gün raporunun ilk ekranı: en güçlü kendi sayısıyla açılır, "neyi ölçtük, neyi henüz bilmiyoruz" diye biter (§3.F.5)',
  'Alarm sabahında Sabah ekranındaki ay şeridi (§3.F.3)',
  '"Günün" sayfasının akşam hâli: başlık "Günün nasıl geçti?" olur, (c)\'deki kart gelir (§3.D.3)',
  'Profilim → Sorularım satırları (§3.D.3) ve 90. günden sonraki haftalık odak cümlesi (§3.F.5)',
  'Gizlilik sayfası, App Store gizlilik etiketi ve sitenin "Bir günün nasıl geçer" bölümü',
]

// Sayfanın açılışı: önce ekranlar (1. gün Ana sayfa; genişte yol ve akşam kartı da), açıklama aşağıda
const heroShot = (fig, label, href) => fig.replace('<figure class="shot">', '<figure class="shot hero">').replace('<div class="fitbox">', '<div class="fitbox" aria-hidden="true">').replace(/<figcaption>[\s\S]*<\/figcaption>/, `<figcaption><a href="${href}">${label}</a></figcaption>`)
// Sayfanın açılışı (5 saniye turu 2): gece sahnesi (giriş ekranının göğü ve iris ufku), tek cümlelik ne-yapar başlığı ve
// büyük 1. gün telefonu. Sayfanın ne olduğu (S0, karar) sahnenin altında, küçük.
const hero = `<header class="pg-hero">
<canvas class="pg-sky" data-draw="stage" aria-hidden="true"></canvas>
<div class="pg-hero-top"><span class="pg-brand">${MARK()}Nefona</span><a class="pg-chip" href="#soru-yoga"><span class="dot" aria-hidden="true"></span>1 karar bekliyor${svg(I.chevR)}</a></div>
<div class="pg-hero-tx">
<h1 class="pg-title">Her gün birkaç dakikalık <em>göz ve nefes</em> molası.</h1>
<p class="pg-lead">Sonsuz yolun yeni ekranları: bir kişinin ilk ayı, ilk açılıştan akşam sorusuna.</p>
</div>
<div class="pg-stage">${heroShot(a1, '1. gün · Ana sayfa', '#a')}${heroShot(b2, '7. gün · Bugünün yolu', '#b')}${heroShot(c1, 'Akşam · Günün nasıl geçti?', '#c')}</div>
</header>
<section class="pg-intro" aria-label="Bu sayfa">
<span class="pg-ey">S0 · tasarım çizimi · 30 Eylül 2026</span>
<h2 class="pg-h">Sonsuz yolun yeni ekranları</h2>
<p class="pg-lead">Onaylı planın yeni ekranları, uygulamanın kendi renkleri ve bileşenleriyle çizildi. Bu bir çizimdir; uygulamada hiçbir dosya değişmedi.</p>
<a class="pg-decide" href="#soru-yoga"><span class="dot" aria-hidden="true"></span><span class="t"><b>Senden tek karar bekleniyor</b><small>Yoganın Uykuya Geçiş dersinden sonraki sabah sorusu Ana sayfada ne zaman ve nerede çıksın?</small></span>${svg(I.chevR)}</a>
<p class="pg-small">45 sorudan 44'ü karara bağlandı ve çizime işlendi; gerekçeler S0/sorular-kararlar.md'de. Önerim ve üç telefon (a) bölümünün sonunda.</p>
</section>`

const body = `<div class="pg" lang="tr" data-w="390">
${hero}
<div class="pg-bar" role="group" aria-label="Görünüm">
<div class="pg-ctl"><span>Tema</span><div class="segmented" role="group" aria-label="Tema"><button type="button" data-set-theme="light" aria-pressed="false">Açık</button><button type="button" data-set-theme="dark" aria-pressed="false">Koyu</button><button type="button" data-set-theme="system" aria-pressed="true">Sistem</button></div></div>
<div class="pg-ctl"><span>Telefon</span><div class="segmented" role="group" aria-label="Telefon genişliği"><button type="button" data-set-w="390" aria-pressed="true">390 pt</button><button type="button" data-set-w="320" aria-pressed="false">320 pt</button></div></div>
</div>
<nav class="pg-nav main-nav" aria-label="Ekranlar">${nav.map(([id, t]) => `<a href="#${id}"><b>${id}</b>${t}</a>`).join('')}</nav>
<section class="pg-notes" aria-label="Bu sayfa nasıl okunur">
<ul class="pg-read">
<li>Veriler örnektir: 1 Ekim 2026 Perşembe başlayan, uygulamayı her gün 10.00'da açan ve her durağı yapan bir kullanıcı.</li>
<li>Hukukçu ve App Review yedekleri uygulandı: konum izni sorulmaz, Ana sayfa başlığında hava yoktur, Nef'e ruh hâli gitmez.</li>
<li>Her bölümün altında kararlar var: yeşil numara karara bağlandı, turuncu numara senin kararın. "Ç" ile başlayanlar çizim sırasında çıktı; Y1–Y6 planın aşamalarıdır.</li>
<li>Açılış sahnesindeki telefonlar (a), (b) ve (c) bölümlerindeki ekranların aynısıdır.</li>
<li>Uzun ekranlarda turuncu kesik çizgi <span class="pg-fold" aria-hidden="true"></span> ilk ekranın bittiği yeri gösterir.</li>
</ul>
<details class="pg-miss"><summary>Bu sayfada olmayanlar (${MISSING.length})</summary><ul>${MISSING.map((m) => `<li>${m}</li>`).join('')}</ul></details>
</section>
${group('g-sabah', 1, 'Sabah', 'Günün ilk açılışı ve yol', [secA, secB])}
${group('g-aksam', 2, 'Akşam', 'Günün nasıl geçti, hava ve ay', [secC, secD])}
${group('g-hava', 3, 'Hava', 'Teklif, rıza ve yağmur haberi', [secE, secF])}
${group('g-gelisim', 4, 'Gelişim ve Nef', 'Ölçü kuralı v2, değerlendirmeler, rıza', [secG, secH, secI])}
${group('g-ilk', 5, 'İlk kez', 'Açılış, giriş ekranı ve site', [secJ, secK])}
<div class="pg-foot"><p>Kaynak: docs/yol-haritasi/tasarim/SONSUZ_YOL.PLAN.v1.md ve S0/ekranlar-ozet.md (Bölüm 3'ün maddeleri kararlardaki numaralardır). Gerekçeler S0/sorular-kararlar.md'de, plana işlenecek düzeltmeler S0/plan-duzeltmeleri.md'dedir. Renk, yazı ve bileşen kalıpları app/src/styles.css ve bileşen CSS'lerinden alındı; yol ve diyafram çizimleri uygulamanın kendi geometri kodudur.</p><p><b>Öneri olarak değişen görünüşler</b> (metinler aynı; Y1–Y6'da uygulanır): diyafram kanatlarının ve halkasının iris tonu, sıradaki durağın parlayan noktası; Ana sayfada serinin sütunun başında ve altın renginde durması, "gün seninle"nin sakin yazılması, hafta satırında 7 gün noktası yerine "gün bu hafta" yazısı ve hedef tutunca yeşil tik (Ç19); Nef satırında İlk Bakış sayısının vurgusu, kilometre taşı zemini ve tamam işareti; yolda "Başla" hapının dolu gradyanı ve kilitli durakların daha az soluk çizilmesi; beş yüzün iris tonu ve büyük karoları; etiketlerin simgeleri; nefes sonuç ekranındaki halka ve mola şeridi; ritim eğrisi ve "Başla"nın kanıt kutusunun üstünde durması; ay simgesinin büyümesi ve evre izi; Gelişim şeridinin dört haftaya bölünmesi, "değişim yok" hapının çizgili çizilmesi ve ölçü grafiği; rıza sayfalarında onay kutusunun ve düğmelerin altta sabit durması; Nef kartlarında haftanın yedi karesi. Önceki turdan: ay simgesinin açık tema renkleri, büyük düğmenin üst yazısının tam opaklığı, 44 pt'lik dokunma alanları, bant etiketinin 11 px yazısı.</p><p><b>İkinci 5 saniye turundan</b> (metinler yine aynı): sekme çubuğunun daha opak zemini (altından yazı sızmaz); ilk günün cümlesinin iris zemini ve kilometre taşının yedi günü; Nefes ve Dalga'nın tek satırlık hapları; harita kartının ilk günlerde küçük, bir ay dolunca büyük ve iris halkalı çizilmesi; hafta satırının yeşil tiki; mola bandının yuvarlak köşeli havuzu ve az yıldızı; kilitli durak simgesinin iris rengi; yüzlerin iris tonlu diskleri ve ölçek çizgisi; kanıt kartında bulgunun önde, künyenin dipte durması; nefes sonuç ekranında molanın iki eşit düğmesi ve yoga sorusuyla aynı sakinlik ölçeği; yağış grafiğinin adı ve ölçü grafiğinin zaman ekseni; Gelişim listesinde "değişim yok"un sakin alt satır olması ve şeridin anahtarı; rıza sayfasının içerik kadar yükselmesi ve dipte solan metni; koyu temada telefon çerçevesinin açık kenarı.</p><p>Apple Weather işaret görseli çizilmedi; atıf satırında markanın adı yazıyla durur, uygulamada o yerde Apple'ın verdiği görsel kullanılır (d). Nef'in göz kırpması çizimde durduruldu. Hareketi Azalt açıksa bütün hareketler durur.</p></div>
</div>`

const html = `<title>Sonsuz Yol Ekranları</title>
<style>
${css}
</style>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400..700&family=Onest:wght@400..800&family=Unbounded:wght@500..800&display=swap">
${DEFS}
${nb(body)}
<script>
${js}
</script>
`
fs.writeFileSync(OUT, html)
console.log('yazıldı', OUT, (html.length / 1024).toFixed(0) + ' KB')
