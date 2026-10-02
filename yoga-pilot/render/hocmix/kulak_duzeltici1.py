#!/usr/bin/env python3
"""kulak_duzeltici1.py — düzeltici 1: kulak_listesi.md'ye kör uyarısı + doğrulayıcı (_verify_hoc1) SHOULD maddeleri.
Önceki hâl: out/_onceki_duzeltici1/kulak_listesi.md. kulak_hoc.py yeniden çalıştırılırsa bu betik de yeniden çalıştırılmalı."""
R = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
p = R + '/out/kulak_listesi.md'
s = open(p, encoding='utf-8').read()
if 'Kör karardan (Kapı 2) SONRA verilir' in s:
    raise SystemExit('zaten uygulanmış')


def rep(old, new):
    global s
    assert s.count(old) == 1, old[:70]
    s = s.replace(old, new)


rep("# Kulak listesi — Ders 2 · 15 dk pilot (v3)\n",
    "# Kulak listesi — Ders 2 · 15 dk pilot (v3)\n\n"
    "> **Kör karardan (Kapı 2) SONRA verilir.** Bu liste sesleri gerçek adlarıyla ve adlı dosyalarla anıyor; zamanlar sesten\n"
    "> sese birkaç saniye kayıyor (ör. a.durus, k.yan). Kör dinleme bitmeden gösterilirse hangi `ses` numarasının kim olduğu\n"
    "> anlaşılır. Kör paket (`out/kor/`) bu listeyi içermez; anahtar `out/_kor_anahtar.json` (paket dışı).\n")
rep("Öğeler tek tek yapıştırılmış gibi mi, perde iniş çıkışı rahatsız ediyor mu, tempo çok mu yavaş? |",
    "Öğeler tek tek yapıştırılmış gibi mi, perde iniş çıkışı rahatsız ediyor mu, tempo çok mu yavaş? Doğrulayıcı ölçüsü: öğe "
    "sonunda perde ≈ 62–78 Hz'e iniyor, sonraki öğe ≈ 100–130 Hz'den başlıyor; F0 yayılımı (f0_sd ortancası) hoc 3,75 / nes "
    "3,38 / hak 2,84; iki perde ölçücü ortancada 103,7 ve 121,4 Hz veriyor (düzensiz ses üretimi belirtisi olabilir). "
    "**Öğe sonlarında hırıltılı/çıtırtılı düşüş (gırtlak çıtırtısı) var mı?** |")
rep("| 07:04–07:10 | c2.sayac | Derin evrede hız 6,49 hece/sn (tavan 5,0, VARSAYIM; raporlanır, eleme değil). Bu evre için aceleci mi? |",
    "| 07:04–07:10 | c2.sayac | Derin evrede hız 6,49 hece/sn (tavan 5,0, VARSAYIM; raporlanır, eleme değil). Doğrulayıcının "
    "parça ölçüsü: #1 6,82 (9 hece / 1,32 sn konuşma), #2 6,28 hece/sn. Bu evre için aceleci mi? |")
rep("| 08:15–08:22 | c2.birak | Derin evrede hız 5,82 hece/sn (tavan 5,0, VARSAYIM; raporlanır, eleme değil). Bu evre için aceleci mi? |",
    "| 08:15–08:22 | c2.birak | Derin evrede hız 5,82 hece/sn (tavan 5,0, VARSAYIM; raporlanır, eleme değil). Doğrulayıcının "
    "parça ölçüsü: #1 (08:15–08:17, \"Sayıları bırakabilirsin.\") 7,30 hece/sn (10 hece / 1,37 sn konuşma), hoc'un Derin "
    "evredeki en hızlı parçası. Bu evre için aceleci mi? |")
rep("| 10:03–10:07 | c4.patika | Derin evrede hız 6,06 hece/sn (tavan 5,0, VARSAYIM; raporlanır, eleme değil). Bu evre için aceleci mi? |",
    "| 10:03–10:07 | c4.patika | Derin evrede hız 6,06 hece/sn (tavan 5,0, VARSAYIM; raporlanır, eleme değil; doğrulayıcı "
    "ölçüsü 6,11). Bu evre için aceleci mi? |\n"
    "| 10:17–10:19 | c4.yol#2 | Derin evrede hız 6,08 hece/sn (doğrulayıcı ölçüsü; tavan 5,0, VARSAYIM). \"Kendi hızında "
    "yürüyorsun.\" aceleci mi? |")
rep("| 11:54 (kesim 11:48–11:58) | n2.hatirla | Kesim kurala uygun ve cümle sınırında (hizasızlık 0,046)",
    "| 11:31–11:34 | c4.solma#2 | Derin evrede hız 5,99 hece/sn (doğrulayıcı ölçüsü; tavan 5,0, VARSAYIM). Aceleci mi? |\n"
    "| 11:54 (kesim 11:48–11:58) | n2.hatirla | Kesim kurala uygun ve cümle sınırında (hizasızlık 0,046)")
rep("| 12:16 | n2.dilek |",
    "| 11:54–11:58 | n2.hatirla#2 | Derin evrede hız 6,13 hece/sn (doğrulayıcı ölçüsü; tavan 5,0, VARSAYIM). Alıntı cümle "
    "(\"Kendime dinlenmeye izin veriyorum.\") aceleci mi? |\n"
    "| 12:16 | n2.dilek |")
rep("- A/B kaynak ayrıntıları (`out/_ab_details.json`) dinlemeden sonra açılır.",
    "- **B müziği yaklaşık 24 sn'de bir soluyor (üç sesin B dosyalarında aynı yatak):** yatak ≈ 20 dB iniyor, ≈ 1,5 sn içinde\n"
    "  hızla geri çıkıyor (3 sn ST yükselme en çok 6,82 dB/sn; A yatağında tını dışı en hızlı 0,94 dB/sn). Örnek yerler:\n"
    "  00:18–00:30, 03:54–04:06, 09:06–09:18 (toplam ≈ 37 kez, 00:22'den 14:46'ya). Bu rahatsız ediyor mu, konuşmanın altında\n"
    "  fark ediliyor mu, müzik 'pompalıyor' gibi mi? Konuşma/yatak eşiği (≥ 15 dB) bu yüzden bozulmuyor; soru yalnız kulağın.\n"
    "- **Derin evre hız tavanı (≤ 5,0 hece/sn) VARSAYIM ve üç seste de aşılıyor** (doğrulayıcı ölçüsü; Derin evre parça\n"
    "  ortancası, 5,0 üstü parça): hoc 5,21, 24/41; nes 5,25, 25/41; hak 5,65, 31/43. Derin evre üç seste de aceleci mi?\n"
    "  Karar plan aşamasında (tavan korunacak mı, gevşetilecek mi).\n"
    "- Ağız şapırtısı: konuşma içinde 8 kHz üstü ani olay sayısı hoc-A 267, hak-A 227, nes-A 149 (hepsi çekimin kendi\n"
    "  içeriği, kurgu kaynaklı değil). Şapırtı ya da sert patlamalı ünsüz dikkat dağıtıyor mu?\n"
    "- A/B kaynak ayrıntıları (`out/_ab_details.json`) dinlemeden sonra açılır.")
open(p, 'w', encoding='utf-8').write(s)
print('ok')
