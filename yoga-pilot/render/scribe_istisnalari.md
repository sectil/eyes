# Scribe yazım istisnaları (v3) — Türkçe editör onayına

Durum: **ONAY BEKLİYOR.** Onaylayan: Türkçe editör (yoksa PLAN.v3 karar 2'deki yedek: birbirinden bağımsız iki model
incelemesi; son kulak kararı sahibin). Onaylanana kadar bu istisnalarla eşleşen klip kulak listesinde kalır.

Dayanak: PLAN.v3 §A.3 son madde ve §E.2. Uygulama: `render/tools/audio.py` → `scribe_equal()`, komut satırında
`audio.py compare "<metin>" "<Scribe>"` (istisnasız eski davranış: `--strict`). Sınamalar: `test_audio.py` →
`test_scribe_exceptions`.

## Ne denetleniyor

Scribe, seslendirilmiş klibi yazıya çevirir. Metin ile Scribe'ın yazısı, normalleştirmeden (küçük harf, noktalama ve
üç nokta atılır, 0–10 rakamları sözcüğe çevrilir) sonra sözcük sözcük aynı olmalıdır. Aşağıdaki iki durum yalnız
**yazım** farkıdır; ses aynıdır. Bu yüzden eş sayılır. Başka hiçbir fark eş sayılmaz.

Kullanılan her istisna sonuçta ayrıca yazılır (`exceptions` alanı). Sessizce geçilmez.

## İstisna 1: birleşik sözcüğün bitişik ya da ayrı yazımı

Bitişik yazılan birleşik sözcüğü Scribe ayrı yazabilir (ya da tersi). Parçalar yan yana birleşince öteki yazım çıkarsa
eş sayılır. En çok üç parça.

| Metin | Scribe | Sonuç |
|---|---|---|
| sırtüstü | sırt üstü | eş |
| başparmağı | baş parmağı | eş |
| ön kol | önkol | eş |

Eş sayılmayanlar:
- Parçalardan biri ayrı yazılan bağlaç ya da soru ekiyse: **de/da, ki, mi/mı/mu/mü**. "sen de" ≠ "sende", "ya da" ≠
  "yada", "dedi ki" ≠ "dediki", "geldin mi" ≠ "geldinmi". Bunlarda anlam ve vurgu değişir.
- Parçalardan biri tek harfliyse.
- Birleşince öteki yazım harfi harfine çıkmıyorsa ("ön kol" ≠ "önkollar").

## İstisna 2: ek-fiilin bitişik ya da ayrı yazımı

| Ayrı | Bitişik | Kural |
|---|---|---|
| ise | -(y)sA | nefeste ise = nefesteyse; yolda ise = yoldaysa |
| idi | -(y)DI | hasta idi = hastaydı; kitap idi = kitaptı; yorgun idi = yorgundu |
| imiş | -(y)mIş | yorgun imiş = yorgunmuş; güzel imiş = güzelmiş |

Bitişik biçim yalnız Türkçe kurallarıyla kurulursa eş sayılır:
- ünlü uyumu (a/e; ı/i/u/ü),
- ünlüyle biten gövdede y kaynaştırması (nefeste**y**se),
- sert ünsüzden sonra t (kitap**t**ı).

Kişi eki -m, -n, -k iki yazımda da aynı olmalı: "evde isem" = "evdeysem", "üzgün idim" = "üzgündüm".

Eş sayılmayanlar:
- Başka ek-fiil: "nefeste ise" ≠ "nefesteydi".
- Uyumsuz ya da kaynaştırmasız biçim: "nefestesa", "kitapdı", "hastaidi".

## Pilotta ne değişti

Hiçbir ücretli çağrı yapılmadı. Seçim dosyalarındaki 166 Scribe denemesi yeniden karşılaştırıldı
(`render/out/scribe_v3_karsilastirma.json`). Eski kuralla 134'ü eşleşiyordu, v3 istisnalarıyla 166'sının hepsi eşleşiyor.
Eşleşmeyen 32 denemenin hepsinde tek fark bu iki yazım farkıydı.

| Ses | Birim | Fark | Seçilen çekim eski kuralla | v3 ile |
|---|---|---|---|---|
| Neslihan | a.durus | sırtüstü / sırt üstü (5 deneme) | eşleşmedi, kulak listesinde | eş (istisna 1) |
| Neslihan | k.yan | sırtüstü / sırt üstü (6 deneme) | eşleşmedi, kulak listesinde | eş (istisna 1) |
| Neslihan | c2.yer | nefesteyse / nefeste ise (t1–t3) | t1–t3 eşleşmedi, yeniden çekildi; seçilen t6 zaten eşti | eş; v3 ile yeniden çekim gerekmezdi |
| Hakan | a.durus | sırtüstü / sırt üstü (6 deneme) | eşleşmedi, kulak listesinde | eş (istisna 1) |
| Hakan | k.yan | sırtüstü / sırt üstü (5 deneme) | eşleşmedi, kulak listesinde | eş (istisna 1) |
| Hakan | c2.yer | nefesteyse / nefeste ise (6 deneme) | eşleşmedi, kulak listesinde | eş (istisna 2) |
| Hakan | car.sol1 | başparmağı / baş parmağı (t3; seçilmedi) | seçilen çekim zaten eşti | eş (istisna 1) |

Bu beş klip (iki seste a.durus ve k.yan, Hakan'da c2.yer), liste onaylanana kadar kulak listesinde kalır
(`render/out/kulak_listesi.md`). Onaydan sonra da vurgu ve söyleyiş kulakla denetlenir: Scribe yazımı sesin doğru
vurgulandığını göstermez.

## Editöre sorular

1. Yukarıdaki iki istisna ve bağlaç/soru eki dışlaması doğru mu? Eklenmesi ya da çıkarılması gereken bir durum var mı?
   Aday örnekler: -(y)lA / ile ("onunla" / "onun ile"), -(y)ken / iken.
2. Metinde hangi yazım esas alınsın: "sırtüstü" mü, "sırt üstü" mü (TDK'ye göre)? Metin değişirse ekrandaki yazı da
   değişir. Ses değişmez.
