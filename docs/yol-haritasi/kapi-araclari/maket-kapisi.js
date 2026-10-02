export const meta = {
  name: 'fark-tasarim-kapi-2',
  description: 'Fark Ettin mi? yeni tasarım maketi (04, 05, 06, 09–12): 5 bağımsız değerlendirici, 5 saniye kapısı 2. tur',
  phases: [{ title: 'Kapı' }],
}
const G = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/fark-f3/tasarim/goruntu'
const KEYS = ['04-once', '04-sonra', '05', '06', '09', '10', '11', '12', '12-kart']
const PERSONAS = [
  '34 yaşında yazılımcı, iPhone kullanıyor, premium uygulamalara alışık',
  '52 yaşında öğretmen, gözlük kullanıyor, küçük yazıyı sevmez',
  '62 yaşında emekli muhasebeci, şüpheci',
  '39 yaşında premium tüketici uygulamalarında (Apple, Headspace) çalışmış ürün tasarımcısı',
  '28 yaşında gece vardiyası yapan hemşire, yorgun gözle bakar',
]
const SCHEMA = { type: 'object', properties: { verdicts: { type: 'array', items: { type: 'object', properties: { key: { type: 'string' }, impressed: { type: 'boolean' }, weakest: { type: 'string' } }, required: ['key', 'impressed', 'weakest'] } } }, required: ['verdicts'] }
const res = await parallel(PERSONAS.map((p, i) => () => agent(
  `Sen ${p}. Bağımsız değerlendiricisin, Türkçe yaz. Nefona uygulamasındaki "Fark Ettin mi?" alıştırması. Akış: kişi 40 saniye çizili, hareketli bir caddeden geçip verilen şeyi sayar → 04 sayı sorusu (önce/sonra) → "Ne değişti?": 05 ezberleme anı (sahnenin ilk hâli 3 saniye; ortadaki "göz saati" kapanarak süreyi gösterir), göz kırpar gibi kararma, 06 değişmiş hâl (kişi değişen yere dokunur) → "Gözünden kaçan": 09 "fark ettin mi?" (kişi cevabı ele vermeyen buzlu cam bir figürle gösterilir), 10 ayrıntı sorusu, 11 cevaptan sonra figür gerçek renklerine döner → 12 sonuç, 12-kart bilim kartı açık.
Görüntüler: ${G}/<anahtar>-{390,320}-{acik,koyu}.png. 05 ve 11 hareketli anlar; onlar için ayrıca 3 karelik dizi var: ${G}/<anahtar>-{390,320}-{acik,koyu}-{1,2,3}.png (1 başı, 2 ortası, 3 sonu). Hepsini Read ile aç; ${G} dışında dosya okuma.
Anahtarlar: ${KEYS.join(', ')}.
Her anahtar için: bu anı telefonda yaşasan 5 saniyede etkilenir miydin? ("idare eder" = hayır). Premium bir uygulamaya yakışıyor mu, ne yapacağın o anda anlaşılıyor mu, iki temada ve 320'de kusursuz mu (taşma, kesilme, tek kalan kelime, ölü boşluk, okunmayan yazı)? impressed=true yalnız gerçekten etkilendiysen. weakest: en zayıf nokta, görüntü adıyla, bir-iki cümle, somut.`,
  { label: `yargıç ${i + 1}`, phase: 'Kapı', schema: SCHEMA })))
const tally = {}
for (const k of KEYS) tally[k] = { yes: 0, n: 0, weak: [] }
for (const r of res.filter(Boolean)) for (const v of r.verdicts) { const t = tally[v.key]; if (!t) continue; t.n++; if (v.impressed) t.yes++; t.weak.push(v.weakest) }
log(KEYS.map((k) => `${k} ${tally[k].yes}/${tally[k].n}`).join(', '))
return tally
