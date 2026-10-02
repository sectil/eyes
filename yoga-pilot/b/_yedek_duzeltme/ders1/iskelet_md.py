#!/usr/bin/env python3
"""ders1.lesson.json'dan iskelet30.md üretir (30 dk iskeleti; 16–30 dk blokları metinsiz)."""
import json
import os
import sys

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import timing as T  # noqa: E402
import timing_d1 as D  # noqa: E402

OUT = os.path.join(HERE, 'iskelet30.md')


def mmss(s):
    return '%d:%02d' % (s // 60, s % 60)


def main():
    L = D.load()
    D.patch(L)
    sk = L['skeleton30']
    anc = sk['anchorsSec']
    lines = []
    P = lines.append
    P('# Ders 1 · Nefesin Ritmi · 30 dakikalık iskelet (metinsiz)')
    P('')
    P('PLAN.v3 §A.4: ilk yayında 30 dk\'nın **iskeleti** sabitlenir (blok listesi, giriş ve dolum sıraları, anahtar '
      'cümleler, imge yayı, müzik teması) ve usta hocadan (inceleyici bulunamazsa karar 2 yedeği: iki bağımsız model '
      'incelemesi) geçer. 16–30 dk\'nın **metni ikinci aşamada** (Kapı 9–11) yazılır; bu dosyada metin yoktur. '
      '≤ 15 dk\'nın metni ve planı `ders1.script.md`, `ders1.lesson.json` ve `timing.txt`\'tedir. Bütün süreler '
      'VARSAYIM\'dır (PLAN.v2 §B.4 çapaları).')
    P('')
    P('## 1. Blok listesi ve çalma sırası')
    P('')
    P('Çalma sırası (PLAN.v2 §B.4): **A → C1 → C2 → [BR.orta] → C4 → C3 → C5 → K**. Kapaklar (A, K) her sürede '
      'çalar; çekirdek bloklar öncelik ve giriş sırasıyla eklenir.')
    P('')
    P('| Blok | Öncelik | Çalma | Giriş (entryRank) | İçerik | 5 | 10 | 15 | 20 | 30 | Metin |')
    P('|---|---|---|---|---|---|---|---|---|---|---|')
    rows = [
        ('A Varış', 'sabit', 0, '—', 'duruş, eller, gözler, ortak çıkış cümlesi, derse özgü açılış, omuz ve çene, normalleştirme, kontrol', 'A'),
        ('C1 Doğal nefes → 4 al / 6 ver', 'P1', 1, '—', 'doğal nefesi izleme, nefesin sesi, güvenlik cümlesi, sayılı döngüler, ipuçlu döngüler, sessiz döngüler, anahtar 1', 'C1'),
        ('C2 İç çekiş', 'P2', 2, '295', 'öğretim, güvenlik, ipuçlu döngüler, doğal nefes arası, ikinci tur, anahtar 2', 'C2'),
        ('BR.orta (köprü)', '—', '2,5', 'C4 ile', 'ortadaki çıkış kapısı ("istediğin an…" + açık gözde bakış serbest + oturma yüzeyi dayanağı); ≥ 20 dk her sürümde', None),
        ('C4 Nadi şodana, tutmasız', 'P4', 3, '520', '"burnun tıkalıysa atla" ile açılır; el konumu (parmaklar göze değmez; eller serbest değilse zihinde değiştirme seçeneği); sesli sayımlı turlar → sessiz turlar; tek burun deliğinden 4 al / 6 ver, tur 20 sn; tutma yok', 'C4'),
        ('C3 Vızıltılı nefes', 'P3', 4, '400', 'öğretim, güvenlik ve sessiz seçenek, birinci tur (ipuçlu), titreşim, ikinci tur (yalnız "Al…"), sesin ardından sessizlik, anahtar 3', 'C3'),
        ('C5 Sessiz nefes tanıklığı', 'P5', 5, '700', 'iki duyurulu pencere (≤ 90 sn; duyuru bir kapı taşır, sonra karşılama); ikinci pencerede pad çekilir, yalnız bordun kalır', 'C5'),
        ('K Kapanış (gündüz, oturarak)', 'sabit', 99, '—', 'dönüş → nefes → sesler → parmaklar ve gerinme → gözler → oda → zaman → günlük hayata köprü → son cümle', 'K'),
    ]
    blocks = {b['id']: b for b in L['blocks']}
    for name, pr, po, er, cont, bid in rows:
        cells = []
        for m in ('5', '10', '15', '20', '30'):
            v = anc.get(m, {}).get(bid) if bid else None
            cells.append(mmss(v) if v else '—')
        if bid in blocks:
            txt = '≤ 15 dk yazıldı (`ders1.lesson.json`)'
        elif bid:
            txt = '**ikinci aşama**'
        else:
            txt = '**ikinci aşama**'
        P('| %s | %s | %s | %s | %s | %s | %s |' % (name, pr, po, er, cont, ' | '.join(cells), txt))
    P('')
    P('Çapalar PLAN.v2 §B.4\'tendir; ≤ 15 dk\'da planlayıcının kurduğu gerçek süreler (hoc köşesi) çapadan sapar: '
      '15 dk\'da A %s, C1 %s, C2 %s, C3 %s, K %s (bkz. `timing.txt`). 16–30 dk artımları ölçülmüş sürelerle kurulduğunda '
      '20 ve 30 dk çapaları da yeniden hesaplanır.' % tuple(
          mmss(int(round(blocks[b]['prefSec']['15']))) for b in ('A', 'C1', 'C2', 'C3', 'K')))
    P('')
    P('## 2. Giriş ve dolum sıraları (önek kuralı)')
    P('')
    P('Planlayıcı artımları tek bir sıralı listeden alır (pilot `timing.py`): bir artım, sessizlikler pref iken hedefe '
      'sığıyorsa eklenir; ilk sığmayanda durulur. Bu yüzden plan(T) ⊆ plan(T+1). **≤ 15 dk\'nın sırası sabittir** '
      '(aşağıdaki tablo) ve **16–30 dk\'nın bütün artımları 500 ve üstü sıradadır**; böylece ikinci aşamada eklenen '
      'hiçbir artım ≤ 15 dk planlarını değiştirmez.')
    P('')
    P('**Ek koşul (bu çalışmada ölçüldü):** 15 dk planında hedef ile pref sessizliklerle toplam arasındaki pay hoc '
      'köşesinde 1,8 sn, hoc-lo\'da 10,1 sn, nes\'te 12,8 sn\'dir. Sıra 500\'ün ilk artımı bundan kısa olursa 15 dk '
      'planına girer ve yayındaki 15 dk dosyası değişir. Kural: **ilk artım (sıra 500–519) ≥ 15 sn olmalı; en '
      'güvenlisi ilk artımın BR.orta + C4 tabanı (≈ 1 dk) olmasıdır** (sıra 520). Tek döngülük (10 sn) artım 520\'den '
      'önce konmaz. Derleme testi bunu her ses ve hız köşesinde denetler.')
    P('')
    P('### 2.1 ≤ 15 dk sırası (sabit; `ders1.lesson.json`)')
    P('')
    items = T.increments(L)
    P('| Sıra | Tür | Artım |')
    P('|---|---|---|')
    for rank, _, kind, payload in items:
        if kind == 'block':
            P('| %g | blok | %s tabanı (zorunlu klipleri) |' % (rank, payload))
        else:
            bid, key, ids = payload
            P('| %g | %s | %s |' % (rank, bid, key if len(ids) == 1 else '%s (%d klip)' % (key, len(ids))))
    P('')
    P('### 2.2 16–30 dk sırası (ikinci aşamada kesinleşir; önerilen yerleşim)')
    P('')
    P('| Sıra | Artım | Neden |')
    P('|---|---|---|')
    P('| 500–519 | (boş bırakılır) | 15 dk payından küçük artım 15 dk planına girerdi |')
    P('| 520 | BR.orta + C4 tabanı (nadi şodana: açılış, el konumu, 2 sesli sayımlı tur, 1 sessiz tur, bırakma) | 16–19. dakikada girer; ≥ 20 dk\'da ortadaki çıkış kapısı zorunlu (pilot check_plan) |')
    P('| 530–590 | C4\'ün sessiz turları; C1, C2, C3\'ün 30 dk genişletmeleri (ek ipuçlu ve sessiz döngüler, üçüncü vızıltı turu, "vızıltı turlarının arasına sessiz nefesler") | A.2.2 dikkat eğrisi: 19:45 |')
    P('| 600–690 | Varış ve Kapanış\'ın 30 dk biçimleri (A 1:30, K 2:30 çapası) | kapaklar süreyle büyür |')
    P('| 700 | C5 tabanı (iki duyurulu pencere) | ≈ 24–25. dakikada girer (A.2.2: 22:30 ilk pencere) |')
    P('| 710–790 | C5\'in karşılama ve dönüş ayrıntıları; genişletme klipleri (hızlı ses için) | 30:00\'a sınır aşmadan ulaşmak (PLAN.v2 §B.3 test g) |')
    P('')
    P('## 3. Anahtar cümleler (sabit)')
    P('')
    for k in ('1', '2', '3'):
        cid = {'1': 'c1.anahtar1', '2': 'c2.anahtar2', '3': 'c3.anahtar3'}[k]
        txt = next(c['text'] for b in L['blocks'] for c in b['clips'] if c['id'] == cid)
        P('%s. "%s" · `%s` · %s' % (k, txt, cid, sk['keySentence'][k]))
    P('')
    P('30 dk\'da da üç kez söylenir (PLAN.v2 §C.4); C4 anahtar cümle taşımaz. Ardışık geçişler arası ≥ 90 sn (pilot H3).')
    P('')
    P('## 4. İmge yayı (sabit; işitsel)')
    P('')
    for i, a in enumerate(sk['imageArc'], 1):
        P('%d. %s' % (i, a))
    P('')
    P('30 dk\'da yayın son adımı C5\'in pencereleridir: "sesin ardından kalan sessizlik" duyurulu, ≤ 90 sn\'lik '
      'sessizliğe açılır; ikinci pencerede pad çekilir ve yalnız bordun kalır (PLAN.v2 Ders 1 kartı).')
    P('')
    P('## 5. Müzik teması (sabit)')
    P('')
    P('- Ton: Re. Nefes bloklarında (C1, C2, C4, C3) tanpura benzeri bordun (Re + La), uygulamanın kendi hattı '
      '(render.mjs); döngü nefes döngüsüne eşit: C1, C2 ve C4 10,000 sn; C3 13,000 sn. Melodi yok.')
    P('- Varış, Kapanış ve C5 pencerelerinde aynı tonda yumuşak pad (müzik A, ElevenLabs Music; ~60 BPM hissi istemde, '
      'ölçülür). 3, 5, 15 ve 30 dk\'da aynı tema (PLAN.v2 §A.1).')
    P('- C5\'in ikinci penceresinde pad çekilir, yalnız bordun kalır; pencere dönüşünden 2 sn önce dönüş tınısı.')
    P('- Doğa katmanı kapalı. Açık not: Ders 8\'in imzası da "Re\'de açık beşli bordun"; iki dersin tonu ya da tınısı '
      'Ders 8 yazılırken ayrıştırılmalı.')
    P('')
    P('## 6. 30 dakikalık dikkat eğrisi (PLAN.v2 §A.2.2; VARSAYIM)')
    P('')
    P('0:00 varış · 1:30 doğal nefes · 4:00 uzun verişe geçiş (sayılı) · 7:30 iç çekiş · 11:00 nadi şodana, sesli sayım '
      '· 14:00 nadi şodana, sessiz turlar · 17:00 vızıltılı nefes · 19:45 vızıltı turlarının arasına sessiz nefesler · '
      '22:30 tanıklık, ilk pencere · 25:00 ikinci pencere, pad çekilir · 27:30 kapanış. En uzun değişimsiz aralık 3:30 '
      '(sınır 5 dk; pilot test k).')
    P('')
    P('## 7. İkinci aşamada yazılacaklar (metinsiz liste)')
    P('')
    P('- **BR.orta:** ortak açılış cümlesinin ortadaki biçimi (pilot Ders 2 `br.orta` kalıbı: "İstediğin an gözlerini '
      'açmak, kıpırdamak ya da dersi bitirmek senin elinde." + bakış serbest + dayanak); Ders 1\'de dayanak oturma '
      'yüzeyidir.')
    P('- **C4 Nadi şodana:** Sanskritçe ad seste bir kez ("nadi şodana", PLAN.v2 §C.7); "burnun tıkalıysa atla"; el '
      'konumu parmaklar göze ve yüze değmeden; eller serbest değilse zihinde değiştirme seçeneği; sayım 4/6; tutma yok '
      '(güvenlik §11.C isteğe bağlı satırı); "başın dönerse normal nefese dön" (her nefes bloğunda olduğu gibi).')
    P('- **C5:** iki duyurulu pencere (duyuru bir kapı taşır: "gözlerini açmak da olur" kalıbı), karşılama klipleri; '
      'son 60 sn\'ye pencere düşmez (pilot check_plan e).')
    P('- **C1, C2, C3 genişletmeleri:** 30 dk çapası C1 6:00, C2 3:30, C3 5:30; ek ipuçlu, yalnız "Al…" ve sessiz '
      'döngüler; ≤ 20 sn sessizlik kuralı pencere dışında sürer.')
    P('- **A ve K 30 dk biçimleri:** A 1:30, K 2:30; yeni klipler "-(y)abil-" ≤ 3 / 60 sn sınırını korur.')
    P('- **Testler:** her ses köşesinde 3 ve 5–30 dk\'nın her dakikası (pilot + D1 denetimleri); 30:00\'a sınır aşmadan '
      'ulaşma (test g); ≥ 20 dk ortada hatırlatma; 21. dakikadan sonra iki ardışık düzlük yok (pilot T2).')
    P('')
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')
    print('yazıldı', OUT)


if __name__ == '__main__':
    main()
