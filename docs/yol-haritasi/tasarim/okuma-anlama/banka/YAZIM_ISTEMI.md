# Metin takımı yazım istemi (her takım için aynı)

Bu istem, `taslak-NN.json` takımlarını yazan ajan içindir. Sahip `taslak-01.json`'ın üslubunu onayladı (2026-10-02,
"ONAY"). Yeni takımlar o üslubu ve `METINLER.md` §1–§4 kurallarını izler.

## Görev
- 10 yeni metin yaz: `taslak-NN.json`, kimlikler `oaXXX` sıradan devam eder.
- Biçim `taslak-01.json` ile aynı:
  - alanlar `id, baslik, etiket, kaynak, pmid, doi, yazar, dergi, yil, metin, sorular`
  - her metinde 6 soru: 1 `ana`, 5 `ayrinti`
  - her soruda 4 seçenek; doğru seçenek ilk sırada

## Kaynak bulma ve doğrulama
1. PubMed aracıyla ara (`search_articles`), sonra `get_article_metadata` ile çek. PMID ve DOI yalnız bu çıktıdan
   yazılır; ezberden yazılmaz.
2. Özeti olmayan kayıt, düzeltme (erratum) ya da yorum kullanılmaz.
3. Seçim ölçütü:
   - Merak uyandıran hayvan, bitki, mikrop, duyu ve günlük yaşam bulgusu.
   - Hastalık, ilaç, tedavi, ölüm, korku, sağlık iddiası yok.
   - İnsan çalışması yalnız zararsız günlük merak konusundaysa, örneğin yürürken senkron adım atmak. İnsana sağlık
     çıkarımı yok.
4. Metin **yalnız özette yazanı** söyler. Özette olmayan sayı, yer, tür adı eklenmez. Yazarın kurumu "bir ekip"
   demeye yeter; ülke yalnız kurum bilgisinden kesinse yazılır.
5. Kullanılmayacak PMID'ler:
   - `denetle.mjs` içindeki `YASAK_PMID`, yani Metin Arama bulguları.
   - Önceki takımlarda kullanılan bütün PMID'ler.

## Metin kuralı
- 95–115 kelime ve 730–850 harf. 8–11 cümle, tek blok.
- Kalıp: merak cümlesi, yöntem, bulgu, kısa sonuç.
- Sade Türkçe; parantez yok; "beyin", "hastalık", "tehlike" yok.
- Makale cümlesi çevrilmez; baştan Nefona Türkçesiyle yazılır.
- Başlık 2–6 kelime, merak uyandırır, bulguyu ele vermez.
- Etiket: `bocek, kus, memeli, deniz, bitki, insan, mikro, surungen`. Bir takımda en çok 3 `memeli`. Takımda en az
  5 farklı etiket olur.

## Soru kuralı
- Doğru cevap metinde açıkça yazar.
- "Yanlış", "değildir", "olmayan" sorusu yok.
- Yanlış seçenekler metinde hiç geçmeyen ya da açıkça başka şey söyleyen seçeneklerdir. "Kısmen doğru" seçenek yok.
  Aralık sorularında yanlış aralıklar doğru aralıkla örtüşmez.
- En az bir yanlış seçenek doğru seçenek kadar uzun olur.

## Bitirmeden önce
1. `node banka/denetle.mjs banka/taslak-*.json` hatasız geçmeli.
2. Her metin için `arastirma/KAYNAKLAR.md` §B tablosuna bir satır ekle. Sütunlar: metin, anahtar, kaynak, PMID,
   DOI, özete göre bulgu.
3. Her metni özetle cümle cümle karşılaştır. Özette olmayan bir iddia varsa sil.
4. Rapor, en çok 15 satır:
   - yazılan kimlikler
   - etiket dağılımı
   - denetim çıktısı
   - özetle karşılaştırırken silinen iddialar
