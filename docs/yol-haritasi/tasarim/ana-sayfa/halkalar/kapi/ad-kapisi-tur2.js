export const meta = {
  name: 'halka-ad-kapisi-2',
  description: 'Ana sayfa yuvarlak adları 2. ve son tur: iki aday takımı, 5 kişi, çoktan seçmeli 5 sn kapısı (≥4/5)',
  phases: [{ title: 'Kapı' }],
}
const IMG = '/tmp/claude-0/-home-user/48890ea0-ff18-534a-8c82-8916ea9f6368/scratchpad/ad-kapi2/ekran-adsiz.png'
const PERSONAS = [
  '34 yaşında, telefonu çok kullanan bir grafik tasarımcı',
  '58 yaşında, gözlük kullanan, teknolojiyle arası orta bir öğretmen',
  '22 yaşında, Instagram\'ı her gün kullanan bir üniversite öğrencisi',
  '45 yaşında, uygulamaları hızlı ve sabırsız kullanan bir esnaf',
  '39 yaşında, Türkçeye ve ürün diline dikkat eden bir UX yazarı',
]
const VARIANTS = {
  V1: ['Yoga dersi', 'Müzik', 'Nefes', 'Göz seti'],
  V2: ['Sesli yoga', 'Dalga', 'Nefes', 'Tam set'],
}
const TRUTH = { 1: 'D', 2: 'B', 3: 'C', 4: 'F' }
const OPTS = {
  A: 'Ekranda gözle hareketli bir çizgiyi ya da dalgayı takip etme egzersizi',
  B: 'Müzik ya da ses dinleme (sakinleşmek ya da enerji için)',
  C: 'Nefes egzersizi',
  D: 'Gözler kapalı yapılan, sesli bir yoga ya da gevşeme dersi',
  E: 'Ekranda göz yogası hareketleri (gözleri çevirme, odaklama)',
  F: 'Göz egzersizlerinin hepsi art arda, birkaç dakikalık kısa bir set',
  G: 'Bugünkü yolun tamamı (Başla kartındakiyle aynı iş)',
  H: 'Spor ya da beden egzersizi',
  I: 'Emin değilim',
}
const KEYS = Object.keys(OPTS)
const SCHEMA = {
  type: 'object',
  properties: {
    answers: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          slot: { type: 'integer', enum: [1, 2, 3, 4] },
          choice: { type: 'string', enum: KEYS },
          natural: { type: 'boolean' },
          why: { type: 'string' },
        },
        required: ['slot', 'choice', 'natural', 'why'],
      },
    },
  },
  required: ['answers'],
}
const jobs = []
for (const [v, labels] of Object.entries(VARIANTS)) PERSONAS.forEach((p, i) => jobs.push({ v, labels, p, i }))
const res = await parallel(jobs.map((j) => () => {
  const rot = (j.i * 2 + (j.v === 'V2' ? 1 : 0)) % KEYS.length
  const order = KEYS.slice(0, 8).slice(rot % 8).concat(KEYS.slice(0, 8).slice(0, rot % 8)).concat(['I'])
  const optText = order.map((k) => `${k}) ${OPTS[k]}`).join('\n')
  const lbl = j.labels.map((l, n) => `${n + 1}. yuvarlak: "${l}"`).join('\n')
  return agent(
    `Sen ${j.p}. Bağımsız değerlendiricisin; Türkçe yaz.\n\nBir göz sağlığı uygulamasının ana ekranına bakıyorsun. Görüntüyü Read ile aç: ${IMG}\nBaşka dosya okuma, kod arama, bir şey araştırma; yalnız bu görüntüye ve aşağıdaki adlara bak.\n\n"1. bölüm" yazısının üstünde dört yuvarlak var. Görüntüde adları silindi; gerçek uygulamada her yuvarlağın altında soldan sağa şu ad yazıyor:\n${lbl}\n\nEkrana 5 saniye bakan biri gibi, ilk izlenimle karar ver. Her yuvarlak için (çizimi ve adıyla birlikte):\n1) Dokununca ne açılır? Aşağıdaki seçeneklerden birini seç, yalnız harfini yaz. Kararsızsan I.\n${optText}\n2) natural: ad o yerde doğal, açık Türkçe mi? (true/false)\n3) why: tek kısa cümle, neden bu seçeneği seçtin; ad doğal değilse neden.\n\nDört yuvarlağın dördüne de cevap ver.`,
    { label: `${j.v} · yargıç ${j.i + 1}`, phase: 'Kapı', schema: SCHEMA },
  ).then((r) => (r ? { v: j.v, who: j.p, labels: j.labels, answers: r.answers } : null))
}))
const tally = {}
for (const r of res.filter(Boolean)) for (const a of r.answers) {
  const label = r.labels[a.slot - 1]
  const t = (tally[`${r.v}:${a.slot}:${label}`] ??= { label, slot: a.slot, n: 0, correct: 0, natural: 0, E: 0, choices: {}, why: [] })
  t.n++
  const ok = a.choice === TRUTH[a.slot]
  if (ok) t.correct++
  if (a.natural) t.natural++
  if (ok && a.natural) t.E++
  t.choices[a.choice] = (t.choices[a.choice] ?? 0) + 1
  t.why.push(`${ok ? '✓' : '✗'}${a.natural ? '' : ' (doğal değil)'} ${a.choice}: ${a.why}`)
}
log(Object.values(tally).map((t) => `${t.label} ${t.E}/${t.n}`).join(', '))
return { tally, raw: res.filter(Boolean) }