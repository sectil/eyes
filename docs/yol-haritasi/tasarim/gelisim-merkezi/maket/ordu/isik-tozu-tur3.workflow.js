export const meta = {
  name: 'isik-tozu-tur3',
  description: 'Işık tozu başı 3. tur: gerçek yüz modeli (MediaPipe, Apache 2.0) + "kendi yüzün" hâli; yapım, 3 eleştirmen, düzeltme, denetim (6 ajan)',
  phases: [
    { title: 'Yapım', detail: 'v3 + kanonik yüz modeli → v4' },
    { title: 'Eleştiri', detail: 'sahip, tasarım jürisi, dürüstlük/teknik' },
    { title: 'Düzeltme', detail: 'v4 → v5' },
    { title: 'Denetim', detail: 'kurallar, sözleşme, gizlilik' },
  ],
}

const R = '/home/user/eyes/docs/yol-haritasi/tasarim/gelisim-merkezi/maket/ordu'
const D = `${R}/parcacik`
const BRIEF = `${R}/BRIEF.md`
const MODEL = `${R}/model/canonical_face_model.obj`
const SHOT = `NODE_PATH=/opt/node22/lib/node_modules node ${R}/shot.mjs`

const YENI = `YENİ KARARLAR (sahip onayladı; bağlayıcı):
1) Yüz artık elle elipsoidlerle çizilmez. Yüzün kaynağı MediaPipe'ın genel yüz modelidir: ${MODEL} (468 köşe, 898 üçgen, Apache 2.0; kaynak ve lisans ${R}/model/KAYNAK.md). Bu OBJ dosyasını oku, köşe ve yüzeylerini sayfaya gömülü ve sıkıştırılmış bir dizi olarak koy (dış dosya yükleme yok). Yüzeyi alan ağırlıklı olarak ışık tozu noktalarına çevir; kenar ve kıvrımlarda daha yoğun örnekle. Model yalnız yüzün önünü kapsar (alın, gözler, burun, ağız, çene). Bunun üstüne yüzle pürüzsüz birleşen stilize bir kafatası ve ense ekle; v3'teki kafatası ve iç form yeniden kullanılabilir. Yalnız burundan yukarısı görünür: burun ucunun hemen altından temiz, yumuşak bir yatay kesim yap. Ağız ve çene görünmez.
2) Gözler modelin göz çevresi noktalarına oturur: iris ve kapak gerçek yüz noktalarına göre konumlanır. Kırpma hızı verisi aynen kalır.
3) "Kendi yüzün" hâli: Sayfada küçük bir anahtar olsun: "Genel yüz / Kendi yüzün (örnek)". Kendi yüzün hâli, kişi izin verirse uygulamanın aynı 468 noktalı topolojiyle kameradan ölçtüğü yüzle değişir. Makette örnek olarak, kanonik yüzü yumuşak ve kişisel görünen ama gerçek kimseye ait olmayan bir biçim farkıyla (ör. biraz daha geniş elmacık, farklı burun sırtı, alın eğimi) türet ve açıkça "örnek" yaz. Geçiş yumuşak bir dönüşüm (morph) olsun. Altında tek satır gizlilik notu: "Yüzünün yalnız 468 noktası telefonunda kalır; görüntü saklanmaz. İstediğinde silebilirsin." Bu hâl için ekranda bir sağlık iddiası ya da "tanıma" sözü olmaz.
4) v3'te iyi olanlar korunur: üç 'up' bölgenin eşit ve okunur parlaması, etiketler, yürürken akış, iki tema, 320, hareket azaltma, dürüstlük kuralları.
HEDEF: sahibin 5 saniyede "vay, bu bir insan başı ve canlı" demesi. Manken, maske, robot ya da uzaylı görünümü kesinlikle olmayacak.`

const CRIT = { type: 'object', properties: {
  hayal: { type: 'number' }, vay: { type: 'number' }, iscilik: { type: 'number' }, okunurluk: { type: 'number' }, durustluk_teknik: { type: 'number' },
  verdict: { type: 'string', enum: ['mükemmel', 'iyi', 'zayıf', 'kötü'] }, strongest: { type: 'string' },
  fixes: { type: 'array', items: { type: 'string' } } },
  required: ['hayal', 'vay', 'iscilik', 'okunurluk', 'durustluk_teknik', 'verdict', 'strongest', 'fixes'] }
const BUILT = { type: 'object', properties: { selfScore: { type: 'number' }, done: { type: 'array', items: { type: 'string' } }, weaknesses: { type: 'array', items: { type: 'string' } } }, required: ['selfScore', 'done', 'weaknesses'] }
const LENSES = [
  { key: 'sahip', who: 'Uygulamanın sahibisin. Hayalini BRIEF.md\'de kelimesi kelimesine anlattın: canlı bir insan başı, burundan yukarısı, gözler, içinde gelişim merkezi. Önceki işlere "basit, anlamıyorum, çalışma berbat, manken gibi" dedin. Gerçekten 5 saniyede "vay" diyor musun? Kibar olma.' },
  { key: 'tasarimci', who: 'Dünya çapında bir tasarım jürisindesin (Apple Design Awards düzeyi). Ucuz parıltıya, tekinsiz vadiye, maske ya da manken görünümüne, gürültüye ve amatör 3B görüntüye acımasızsın.' },
  { key: 'teknik', who: 'Ürün, dürüstlük, gizlilik ve teknik denetçisisin. Önce BRIEF kurallarını denetle: sağlık iddiası olmamalı, ekranda "beyin" sözcüğü görünmemeli, yalnız st:"up" tam parlamalı. Ardından "kendi yüzün" hâlinin dürüst ve gizliliğe uygun anlatılıp anlatılmadığını, model lisansının sayfada ya da kaynak notunda geçip geçmediğini, iki temayı, 320 genişliği, errors.txt dosyasını, hareket azaltma desteğini ve iPhone performansını denetle. HTML dosyasını da oku.' },
]
const avg = (c) => (c.hayal + c.vay + c.iscilik + c.okunurluk + c.durustluk_teknik) / 5

phase('Yapım')
const build = await agent(`Sen dünya çapında bir yaratıcı teknoloji tasarımcısısın (WebGL, Three.js parçacık sistemleri, 3B yüz geometrisi). Önce ${BRIEF} dosyasını oku.
Başlangıç dosyası: ${D}/v3.html. Önceki sürümün görüntüleri: ${D}/shots3/; aç ve bak.

${YENI}

Yeni sürümü ${D}/v4.html olarak yaz. Ara turlarda hızlı görüntü al: ${SHOT} ${D}/v4.html ${D}/shots4 hizli. Son turda tam görüntü al: ${SHOT} ${D}/v4.html ${D}/shots4. Bash'e timeout 600000 ver.
"Kendi yüzün" hâlinin de bir görüntüsünü al (#d30 durumunda anahtar açık) ve shots4/own-dark-390.png adıyla kaydet; bunun için gerekirse kendi küçük Playwright betiğini yaz. Playwright için NODE_PATH=/opt/node22/lib/node_modules gerekir.
En az 3 tam döngü yap: görüntüleri aç, acımasızca bak, düzelt. errors.txt temiz olmalı. Dürüst bir öz puan ver ve kalan zayıflıkları yaz.`, { label: 'yapım-v4', phase: 'Yapım', schema: BUILT })

phase('Eleştiri')
const crits = (await parallel(LENSES.map((l) => () => agent(`${l.who}

Önce ${BRIEF} dosyasını oku. Yeni kararlar şunlar:
${YENI}

Değerlendireceğin iş: ${D}/v4.html. Görüntüler: ${D}/shots4/ klasöründeki bütün PNG'ler (own-dark-390.png dahil) ve errors.txt; hepsini Read ile aç. Önce her ekrana 5 saniyelik ilk izlenimle bak, sonra ayrıntıya in. Başka eleştiri okuma. Puanların ölçeği: 10 dünya çapında ve mükemmel, 7 iyi ama sahibe gönderilmez. Düzeltmeler somut olsun: ne, nerede, nasıl.`, { label: `eleştiri:${l.key}`, phase: 'Eleştiri', schema: CRIT }).then((c) => c && { lens: l.key, ...c })))).filter(Boolean)
crits.forEach((c) => log(`${c.lens}: ${c.verdict}, ort. ${avg(c).toFixed(1)}`))

phase('Düzeltme')
const list = crits.map((c, i) => `Eleştirmen ${i + 1} (${c.lens}, ${c.verdict}, ort. ${avg(c).toFixed(1)}). En güçlü yan: ${c.strongest}\n- ${c.fixes.join('\n- ')}`).join('\n\n')
const refine = await agent(`Sen dünya çapında bir yaratıcı teknoloji tasarımcısısın. Önce ${BRIEF} dosyasını oku.
${YENI}

Önceki sürüm: ${D}/v4.html; görüntüleri: ${D}/shots4/ (aç).
Üç bağımsız eleştirmenin geri bildirimi:
${list}

Görev: Geçerli eleştirilerin hepsini uygula; kurallara aykırı olanı uygulama ve nedenini yaz. Sonucu ${D}/v5.html olarak yaz. Ara turlarda: ${SHOT} ${D}/v5.html ${D}/shots5 hizli. Son turda tam görüntü: ${SHOT} ${D}/v5.html ${D}/shots5. Ayrıca kendi yüzün görüntüsünü al: shots5/own-dark-390.png. En az 2 tam döngü yap. errors.txt temiz olmalı. Dürüst bir öz puan ver ve kalan zayıflıkları yaz.`, { label: 'düzeltme-v5', phase: 'Düzeltme', schema: BUILT })

phase('Denetim')
const audit = await agent(`Sen bağımsız son denetçisin. Önce ${BRIEF} dosyasını oku. Yeni kararlar:
${YENI}

Dosya: ${D}/v5.html; görüntüler: ${D}/shots5/ (hepsini aç).
Denetle ve kanıtla:
(1) Dürüstlük: sağlık iddiası yok; ekranda "beyin" sözcüğü görünmüyor; yalnız st:'up' tam parlıyor; walk'ta hareket bölgesi canlı; veri ${R}/veri.js ile birebir aynı.
(2) Model: yüz verisi kanonik modelden geliyor; dış dosya yüklenmiyor; kaynak ve lisans (Apache 2.0) sayfada bir yorum satırında yazılı.
(3) Kendi yüzün: "örnek" olarak işaretli; gizlilik notu doğru; tanıma ya da sağlık iddiası yok.
(4) Sözleşme: hash durumları, çip dokunuşu, iki tema, 320 genişlikte Nef görünüyor, hareket azaltma, dış script yalnız cdnjs.
(5) errors.txt temiz.
Küçük ve kesin bir kusur bulursan doğrudan düzelt ve görüntüyü yeniden al. Tasarım zevkine dokunma. Kalan sorunları dürüstçe listele.`, { label: 'denetim', phase: 'Denetim', schema: { type: 'object', properties: { pass: { type: 'boolean' }, fixed: { type: 'array', items: { type: 'string' } }, remaining: { type: 'array', items: { type: 'string' } } }, required: ['pass', 'fixed', 'remaining'] } })

return { build, crits: crits.map((c) => ({ avg: +avg(c).toFixed(2), ...c })), refine, audit }
