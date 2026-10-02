export const meta = {
  name: 'isik-tozu-cila',
  description: 'Işık tozu başı: 3 bağımsız eleştirmen, tek düzeltme turu, son denetim (6 ajan)',
  phases: [
    { title: 'Hazırlık', detail: 'v1 ekran görüntüleri yoksa çek' },
    { title: 'Eleştiri', detail: 'sahip, tasarım jürisi, dürüstlük/teknik' },
    { title: 'Düzeltme', detail: 'bütün geçerli eleştirilerle v2' },
    { title: 'Denetim', detail: 'kurallar ve sözleşme; küçük kesin kusurları düzelt' },
  ],
}

// Girdi ve çıktılar dalda durur; ekran görüntüleri git dışıdır (.gitignore).
const R = '/home/user/eyes/docs/yol-haritasi/tasarim/gelisim-merkezi/maket/ordu'
const D = `${R}/parcacik`
const BRIEF = `${R}/BRIEF.md`
const SHOT = `NODE_PATH=/opt/node22/lib/node_modules node ${R}/shot.mjs`
const TECH = 'Işık tozu: Three.js r128 (cdnjs) Points; yordamsal SDF baştan örneklenmiş binlerce ışık noktası, toplamalı karışım, siluet parlar; beş bölge ayrı ışık bulutsuları; gözler halka yapılı iris parçacıkları ve kişinin hızıyla kırpar; yürürken hareket bölgesinden adım temposuyla ışık akar.'

const CRIT = { type: 'object', properties: {
  hayal: { type: 'number' }, vay: { type: 'number' }, iscilik: { type: 'number' }, okunurluk: { type: 'number' }, durustluk_teknik: { type: 'number' },
  verdict: { type: 'string', enum: ['mükemmel', 'iyi', 'zayıf', 'kötü'] }, strongest: { type: 'string' },
  fixes: { type: 'array', items: { type: 'string' }, description: 'En önemli en çok 6 somut düzeltme: ne, nerede, nasıl' } },
  required: ['hayal', 'vay', 'iscilik', 'okunurluk', 'durustluk_teknik', 'verdict', 'strongest', 'fixes'] }
const LENSES = [
  { key: 'sahip', who: 'Uygulamanın sahibisin. Hayalini BRIEF.md\'deki kelimesi kelimesine sözlerle anlattın. Önceki işler için "görsel memnun etmedi, anlamıyorum, basit", "düşünce güzel ama çalışma berbat" dedin. Gerçekten 5 saniyede "vay" diyor musun? Hayalindeki canlı baş bu mu? Kibar olma.' },
  { key: 'tasarimci', who: 'Dünya çapında bir tasarım jürisindesin (Apple Design Awards düzeyi). Oura, Apple Fitness, Calm ve üst düzey hareketli grafik işlerini bilirsin. Ucuz parıltıya, tekinsiz vadiye (fazla gerçekçi, ürkütücü yüz), tıbbi soğukluğa, gürültüye ve amatör 3B görüntüye acımasızsın.' },
  { key: 'teknik', who: 'Ürün, dürüstlük ve teknik denetçisisin. BRIEF.md\'deki dürüstlük kurallarını denetle: sağlık iddiası olmamalı, ekranda "beyin" sözcüğü görünmemeli, yalnız st:"up" tam parlamalı. Ayrıca iki temayı, 320 genişlikte Nef cümlesinin görünüp görünmediğini, errors.txt dosyasını, hareket azaltma desteğini, çip dokunuşunu ve iPhone performansını (nokta sayısı, dpr, kare başına iş) denetle. HTML dosyasını da oku.' },
]
const avg = (c) => (c.hayal + c.vay + c.iscilik + c.okunurluk + c.durustluk_teknik) / 5

phase('Hazırlık')
await agent(`Yalnız şunu yap: ${D}/shots1 klasöründe 12 PNG ve errors.txt var mı bak (ls). Eksikse çalıştır: ${SHOT} ${D}/v1.html ${D}/shots1 (Bash timeout 600000). Başka hiçbir şey yapma; sonuçta klasördeki dosya sayısını yaz.`, { label: 'hazırlık', phase: 'Hazırlık', effort: 'low' })

phase('Eleştiri')
const crits = (await parallel(LENSES.map((l) => () => agent(`${l.who}

Önce ${BRIEF} dosyasını oku. Değerlendireceğin iş: ${D}/v1.html. Ekran görüntüleri: ${D}/shots1/ (12 PNG ve errors.txt); hepsini Read ile aç. Önce her ekrana 5 saniyelik ilk izlenimle bak, sonra ayrıntıya in. Başka eleştiri okuma.
Puanlar 1-10 arası olsun: 10 dünya çapında ve mükemmel, 7 iyi ama sahibe gönderilmez, 5 ve altı zayıf. Düzeltmeler somut olsun.`, { label: `eleştiri:${l.key}`, phase: 'Eleştiri', schema: CRIT }).then((c) => c && { lens: l.key, ...c })))).filter(Boolean)
crits.forEach((c) => log(`${c.lens}: ${c.verdict}, ort. ${avg(c).toFixed(1)}`))

phase('Düzeltme')
const list = crits.map((c, i) => `Eleştirmen ${i + 1} (${c.verdict}, ort. ${avg(c).toFixed(1)}). En güçlü yan: ${c.strongest}\n- ${c.fixes.join('\n- ')}`).join('\n\n')
const refine = await agent(`Sen dünya çapında bir yaratıcı teknoloji tasarımcısısın (WebGL, parçacık sistemleri, hareketli grafik). Önce ${BRIEF} dosyasını oku.
Önceki sürüm: ${D}/v1.html; ekran görüntüleri: ${D}/shots1/ (aç, bak). Teknik: ${TECH}

Üç bağımsız eleştirmenin geri bildirimi:
${list}

Görev: Geçerli eleştirilerin hepsini uygula. Dürüstlük kurallarına aykırı bir öneri varsa uygulama ve nedenini yaz. İkinci sürümü ${D}/v2.html olarak yaz (v1'i kopyalayıp geliştir).
Ara turlarda hızlı görüntü al: ${SHOT} ${D}/v2.html ${D}/shots2 hizli. Son turda tam görüntü al: ${SHOT} ${D}/v2.html ${D}/shots2 (Bash timeout 600000).
Görüntüleri aç, acımasızca bak, düzelt; en az 2 tam döngü yap. errors.txt temiz olmalı. Dürüst bir öz puan ve kalan zayıflıkları döndür.`, { label: 'düzeltme', phase: 'Düzeltme', schema: { type: 'object', properties: { selfScore: { type: 'number' }, applied: { type: 'array', items: { type: 'string' } }, rejected: { type: 'array', items: { type: 'string' } }, weaknesses: { type: 'array', items: { type: 'string' } } }, required: ['selfScore', 'applied', 'rejected', 'weaknesses'] } })

phase('Denetim')
const audit = await agent(`Sen bağımsız son denetçisin. Önce ${BRIEF} dosyasını oku. Dosya: ${D}/v2.html; görüntüler: ${D}/shots2/ (hepsini aç).
Denetle ve kanıtla:
(1) Dürüstlük: sağlık iddiası yok; ekranda "beyin" sözcüğü görünmüyor; yalnız st:'up' tam parlıyor; walk'ta hareket bölgesi canlı; veri ${R}/veri.js ile birebir aynı.
(2) Sözleşme: hash durumları (#d30, #walk, #d1), çip dokunuşu, iki tema tokenları, 320 genişlikte Nef görünüyor, prefers-reduced-motion, dış script yalnız cdnjs, yerel dosya yolu yok.
(3) errors.txt temiz.
Küçük ve kesin bir kusur bulursan dosyada doğrudan düzelt ve tam görüntüyü yeniden al (${SHOT} ${D}/v2.html ${D}/shots2). Tasarım zevkine dokunma. Kalan bütün sorunları dürüstçe listele.`, { label: 'denetim', phase: 'Denetim', schema: { type: 'object', properties: { pass: { type: 'boolean' }, fixed: { type: 'array', items: { type: 'string' } }, remaining: { type: 'array', items: { type: 'string' } } }, required: ['pass', 'fixed', 'remaining'] } })

return { crits: crits.map((c) => ({ avg: +avg(c).toFixed(2), ...c })), refine, audit }
