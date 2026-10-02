export const meta = {
  name: 'fark-metin-kapisi-2',
  description: 'Fark Ettin mi? görünür metinleri 2. tur: 5 bağımsız değerlendirici, doğallık ve etkileme (≥4/5)',
  phases: [{ title: 'Kapı' }],
}
const F = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/nef-kapi/fark-metin2.txt'
const PERSONAS = [
  '34 yaşında yazılımcı, iPhone kullanıyor, bildirimlerden çabuk sıkılır',
  '52 yaşında öğretmen, Türkçeye ve dilbilgisine çok dikkat eder, teknolojiye mesafeli',
  '62 yaşında emekli muhasebeci, şüpheci',
  '39 yaşında premium tüketici uygulamalarında çalışmış ürün yazarı (UX writer)',
  '28 yaşında gece vardiyası yapan hemşire, yorgun, kısa ve sıcak söz sever',
]
const SCHEMA = { type: 'object', properties: { verdicts: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, yes: { type: 'boolean' }, why: { type: 'string' } }, required: ['id', 'yes'] } } }, required: ['verdicts'] }
const res = await parallel(PERSONAS.map((p, i) => () => agent(
  `Sen ${p}. Bağımsız değerlendiricisin; Türkçe yaz. Dosyayı Read ile oku: ${F}. Başka dosya okuma. Her satırda metni yazdığı yerde görsen 5 saniyede "doğal, açık, güzel" der misin? yes=true yalnız metin doğal Türkçe, açık, yerine uygun ve can sıkmıyorsa. "İdare eder", robot gibi, dayatan, belirsiz = false. Her satıra karar ver. why: false ise tek kısa cümle.`,
  { label: `yargıç ${i + 1}`, phase: 'Kapı', schema: SCHEMA })))
const tally = {}
for (const r of res.filter(Boolean)) for (const v of r.verdicts) { const t = (tally[v.id] ??= { yes: 0, n: 0, why: [] }); t.n++; if (v.yes) t.yes++; else if (v.why) t.why.push(v.why) }
log(Object.entries(tally).map(([k, t]) => `${k} ${t.yes}/${t.n}`).join(', '))
return tally
