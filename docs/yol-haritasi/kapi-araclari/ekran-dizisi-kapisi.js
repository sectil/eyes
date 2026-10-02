export const meta = {
  name: 'fark-ekran-kapi-3',
  description: 'Fark Ettin mi? F3 ekranları 3. tur (yöntem: hareketli kayıttan kare dizileri), 5 bağımsız değerlendirici',
  phases: [{ title: 'Kapı' }],
}
const K = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/fark-f3/kayit'
const E = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/fark-f3/ekran'
const KEYS = ['01-gorev-ilk', '02-gorev-sonraki', '03-yuruyus', '04-sayi', '05-degisti-1', '06-goz-kirpma', '07-halka', '08-bulunamadi', '09-kacan-adim1', '10-kacan-adim2', '11-s1-acilis', '12-sonuc', '12-kart']
const PERSONAS = [
  '34 yaşında yazılımcı, iPhone kullanıyor, premium uygulamalara alışık',
  '52 yaşında öğretmen, gözlük kullanıyor, küçük yazıyı sevmez',
  '62 yaşında emekli muhasebeci, şüpheci',
  '39 yaşında premium tüketici uygulamalarında (Apple, Headspace) çalışmış ürün tasarımcısı',
  '28 yaşında gece vardiyası yapan hemşire, yorgun gözle bakar',
]
const SCHEMA = { type: 'object', properties: { verdicts: { type: 'array', items: { type: 'object', properties: { key: { type: 'string' }, impressed: { type: 'boolean' }, weakest: { type: 'string' } }, required: ['key', 'impressed', 'weakest'] } } }, required: ['verdicts'] }
const res = await parallel(PERSONAS.map((p, i) => () => agent(
  `Sen ${p}. Bağımsız değerlendiricisin, Türkçe yaz. Nefona uygulamasındaki "Fark Ettin mi?" alıştırması. Akış: görev ekranı → kişi 40 saniye boyunca çizilmiş, hareketli bir caddeden geçer ve kendisine verilen şeyi sayar → sayı sorusu → "Ne değişti?": önce sahnenin ilk hâli 3 saniye görünür (ezberleme anı, bu anda dokunulmaz), sonra göz kırpar gibi yumuşak bir kararma ve sahnenin değişmiş hâli gelir; kişi değişen yere dokunur → bulununca halka dalgası, bulunamazsa değişen yer gösterilir → "Gözünden kaçan" soruları (cevabı ele vermeyen silüet, sonra cevap ve konunun kendisi) → sonuç.
Bu bir canlı ekran kaydından alınmış kare dizisidir: her durum için ${K}/<anahtar>-{390,320}-{acik,koyu}-{1,2,3}.png (1: geçişin başı, 2: ortası, 3: oturmuş hâli). Önce her durumun 390-acik ve 390-koyu dizisini, sonra 320 dizilerini Read ile aç. ${K} dışında dosya okuma.
Anahtarlar (akış sırasıyla): ${KEYS.join(', ')}.
Her anahtar için: bu anı telefonda yaşasan 5 saniyede etkilenir miydin? ("idare eder" = hayır). Premium bir uygulamaya yakışıyor mu, ne yapacağın o anda anlaşılıyor mu, iki temada ve 320'de kusursuz mu? Hareketli bir anın ortasındaki kareyi (2) geçiş olarak değerlendir, durağan hata sayma. impressed=true yalnız gerçekten etkilendiysen. weakest: en zayıf nokta, görüntü adıyla, bir-iki cümle, somut.`,
  { label: `yargıç ${i + 1}`, phase: 'Kapı', schema: SCHEMA })))
const tally = {}
for (const k of KEYS) tally[k] = { yes: 0, n: 0, weak: [] }
for (const r of res.filter(Boolean)) for (const v of r.verdicts) { const t = tally[v.key]; if (!t) continue; t.n++; if (v.impressed) t.yes++; t.weak.push(v.weakest) }
log(KEYS.map((k) => `${k} ${tally[k].yes}/${tally[k].n}`).join(', '))
return tally
