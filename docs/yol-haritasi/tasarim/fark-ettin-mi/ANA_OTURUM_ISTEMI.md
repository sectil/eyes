# Fark Ettin mi? · ana oturum istemi

Bu belge sahibin onayından sonra geçerlidir. "---" altındaki metin ana oturuma olduğu gibi yapıştırılır.

---

Görev: "Fark Ettin mi?" modülünü onaylı plana göre uygula. Plan: `docs/yol-haritasi/tasarim/fark-ettin-mi/PLAN.md`.
Onaylı metinler: `METINLER.md` (yalnız durumu S olanlar, harfi harfine). Maketler: `maket/maket.html?s=<ekran>&theme=<light|dark>`
ve `maket/scene.js` (sahne motorunun taslağı; uygulamaya taşınırken temizlenir). Kanıtlar: `arastirma/KAYNAKLAR.md`.
Kapı kayıtları: `kapi/`.

Önce oku: PLAN.md tamamı; `app/src/modules/registry.js` sözleşmesi; `lib/progress.js` ölçü kuralı v2;
`lib/changeText.js`; `docs/yol-haritasi/tasarim/nef/PLAN.md` §4.8; `IS_AKISI_KURALLARI.md`; `HATA_GUNLUGU.md`
Build 29 (dönüşüm kuralı bozulmaz).

Sıra (PLAN §6): F1 çizim → F2 mantık → F3 ekran → F4 Gelişim → F5 Nef ve kaynak → F6 cihaz. Her aşama ayrı commit.
Başlarken bitiş saatini sahibe yaz (aşama başına en çok 90 dk).

Bağlayıcı:
- İzinli dosyalar aşama tablosundakilerdir. Gelişim dosyaları (`lib/progress.js`, `lib/changeText.js`) ve Nef dosyaları
  yalnız PLAN §3.2 ve §4'te yazan bağlantı satırları için ve o işlerin sahibiyle sıraya konarak değişir. Ana sayfa
  bileşenine dokunulmaz; modül yalnız `today()` çıktısına `sub` verir.
- Eski kayıtlar (`type: 'street'`) okunmaya devam eder; `street-noticed` silinmez, `rule: 'none'` olur.
- Sonuç ekranı hüküm sözcüğünü kendisi kurmaz: `metricStatusV2` + `verdictWord`'den alır.
- `sources.js`'e eklenen her kaynak PubMed'den doğrulanmış PMID ve DOI taşır (`arastirma/KAYNAKLAR.md` satırları);
  kart metni yalnız özette yazanı söyler.
- Sağlık iddiası yok; "beyin", "tanıma" yok; değişim sözcükleri yalnız dört hüküm sözcüğü.
- Görünür her metin METINLER.md'den; yeni metin gerekirse yaz, 5 sn kapısına ve sahibe götür, kendin uydurup koyma.
- PLAN §5b'deki 15 madde bağlayıcıdır. Her yeni ya da değişen ekran, cihazdaki hareketli hâlinin kaydıyla 5 sn kapısından
  (5 yeni kişi, ≥ 4/5, 390 ve 320, iki tema) geçer; en çok iki tur, geçmezse sahibe sor. Mükemmel bulmadığını sahibe
  gösterme. Maketler (`maket/son.html`) yön ve içerik içindir; kapıdan geçmiş tasarım değildir.
- Sıkmama kuralları (PLAN §9c, 13 madde) bağlayıcıdır ve 90 günlük simülasyon testiyle denetlenir.
- Canlı görevler (PLAN §9b) F7 aşamasıdır; bildirim dosyaları bildirim oturumuyla sıraya konur.
- Testler: aşama içinde yalnız ilgili dosyalar (`npx vitest run …`), sonda tam takım ve derleme bir kez. PLAN §7'deki
  test listesinin dışında bir test değişirse dur ve nedenini yaz.
- Commit yazarı `Claude <noreply@anthropic.com>`; ileti sonunda Co-Authored-By ve Claude-Session satırları; model adı
  geçmez. Push'tan önce `git fetch`.
- Bitti: PLAN §10 cihaz denetim listesi tamam, kapı sonuçları `kapi/` altında, HATA_GUNLUGU'na bu işte yapılan hatalar.
