#!/usr/bin/env python3
"""ders5.lesson.json'dan iskelet30.md üretir (30 dk iskeleti; 16–30 dk blokları metinsiz).
Sayılar çalışma anında veriden ve planlayıcıdan hesaplanır."""
import os
import sys

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import timing as T  # noqa: E402
import timing_d5 as D  # noqa: E402

OUT = os.path.join(HERE, 'iskelet30.md')


def mmss(s):
    s = int(round(s))
    return '%d:%02d' % (s // 60, s % 60)


def num(x):
    return ('%g' % x).replace('.', ',')


def main():
    L = D.load()
    D.patch(L)
    sk = L['skeleton30']
    anc = sk['anchorsSec']
    blocks = {b['id']: b for b in L['blocks']}
    lines = []
    P = lines.append
    P('# Ders 5 · Tek Nokta · 30 dakikalık iskelet (metinsiz)')
    P('')
    P('PLAN.v3 §A.4: ilk yayında 30 dk\'nın **iskeleti** sabitlenir (blok listesi, giriş ve dolum sıraları, anahtar '
      'cümleler, imge yayı, müzik teması) ve usta hocadan (inceleyici bulunamazsa karar 2 yedeği: iki bağımsız model '
      'incelemesi) geçer. 16–30 dk\'nın **metni ikinci aşamada** (Kapı 9–11) yazılır; bu dosyada yeni metin yoktur, '
      'yalnız içerik yönü vardır. ≤ 15 dk\'nın metni ve planı `ders5.script.md`, `ders5.lesson.json` ve '
      '`timing.txt`\'tedir. Bütün süreler VARSAYIM\'dır (PLAN.v2 §B.4 çapaları).')
    P('')

    # ------------------------------------------------------------------ 1
    P('## 1. Blok listesi ve çalma sırası')
    P('')
    P('Çalma sırası (PLAN.v2 §B.4): **A → C1 → C2 → [BR.orta] → C4 → C3 → C5 → K**. Kapaklar (A, K) her sürede '
      'çalar; çekirdek bloklar öncelik ve giriş sırasıyla eklenir. C4 çalma sırasında C3\'ten öncedir ama önceliği '
      'daha düşüktür: 15 dk\'da yoktur, 16–19. dakikadan sonra C2 ile C3\'ün arasına girer.')
    P('')
    P('| Blok | Öncelik | Çalma | Giriş (entryRank) | İçerik | 3 | 5 | 10 | 15 | 20 | 30 | Metin |')
    P('|---|---|---|---|---|---|---|---|---|---|---|---|')
    sb = {b['id']: b for b in sk['blocks']}
    rows = [
        ('A Varış', 'sabit', 0, '—', 'duruş, gözler (açıksa bakış yerde), ortak çıkış cümlesi, derse özgü açılış (el '
         'feneri), geniş ve dağınık ışık, omuz ve çene, normalleştirme, kontrol', 'A'),
        ('C1 Nefes çapası', 'P1', 1, '—', 'nefesin en açık duyulduğu yer (burun, göğüs, karın), ışığın o noktaya düşmesi, '
         'değiştirmeden izleme, duyum (serin ve ılık hava, yükselip inme), dağıl – fark et – dön, 1–3 odak aralığı '
         '(≈ 16 sn), anahtar 1', 'C1'),
        ('C2 Nefes sayma, bir → on', 'P2', 2, '%d' % blocks['C2']['entryRank'], 'içinden sayma (alışta bir, verişte '
         'iki… ona kadar), başa dönme ve sayıyı kaybetme, on biri geçme, düşünce araya girince; sonra yalnız verişte '
         'sayma; sayılar seyrekleşir; anahtar 2', 'C2'),
        ('BR.orta (köprü)', '—', '2,5', 'C4 ile', sb['BR.orta']['content'], None),
        ('C4 Ses çapası (çan) ve yumuşak bakış', 'P4', 3, '%d' % sb['C4']['entryRank'], sb['C4']['content'], 'C4'),
        ('C3 Uzayan sessiz odak aralıkları', 'P3', 4, '%d' % blocks['C3']['entryRank'], 'yalnız nokta ve nefes (sayı bırakılır; açılış cümlesi C2\'ye bağlı değil, 30 dk\'da C4\'ten sonra da doğru), küçük ve '
         'parlak nokta, çanın anlamı, ≈ 15 ve ≈ 18 sn kısa aralıklar, ≈ 30 sn pencere (zorunlu), ≈ 45 sn pencere; '
         '30 dk\'da ≈ 60 sn pencere eklenir; her aralık sonunda çan ve karşılama; anahtar 3', 'C3'),
        ('C5 Açık izleme', 'P5', 5, '%d' % sb['C5']['entryRank'], sb['C5']['content'], 'C5'),
        ('K Kapanış (gündüz, oturarak)', 'sabit', 99, '—', 'dönüş → nefes (ışık genişler) → sesler → parmaklar ve '
         'gerinme → isteğe bağlı avuçlama → gözler → oda → gün içine köprü → son cümle ("El feneri yine senin '
         'elinde.")', 'K'),
    ]
    for name, pr, po, er, cont, bid in rows:
        cells = []
        for m in ('3', '5', '10', '15', '20', '30'):
            v = anc.get(m, {}).get(bid) if bid else None
            cells.append(mmss(v) if v else '—')
        txt = '≤ 15 dk yazıldı (`ders5.lesson.json`)' if bid in blocks else '**ikinci aşama**'
        P('| %s | %s | %s | %s | %s | %s | %s |' % (name, pr, po, er, cont, ' | '.join(cells), txt))
    P('')
    p15 = D.run_corner(L, 'hoc', 4.68, 'hi', 1.0)[0][15][0]
    bd = T.block_durations(p15)
    bd['A'] += p15['events'][0]['start']
    P('Çapalar PLAN.v2 §B.4 ve PLAN.v3 §A.2\'dendir (3 dk\'da Giriş Varış\'a dahil). ≤ 15 dk\'da planlayıcının kurduğu '
      'gerçek süreler (hoc köşesi) çapadan sapar: 15 dk\'da A %s, C1 %s, C2 %s, C3 %s, K %s (bkz. `timing.txt`, '
      '`ders5.script.md` §7). 16–30 dk artımları ölçülmüş sürelerle kurulduğunda 20 ve 30 dk çapaları da yeniden '
      'hesaplanır.' % tuple(mmss(bd[b]) for b in ('A', 'C1', 'C2', 'C3', 'K')))
    P('')

    # ------------------------------------------------------------------ 2
    P('## 2. Giriş ve dolum sıraları (önek kuralı)')
    P('')
    P('Planlayıcı artımları tek bir sıralı listeden alır (pilot `timing.py`): bir artım, sessizlikler pref iken hedefe '
      'sığıyorsa eklenir; ilk sığmayanda durulur. Bu yüzden plan(T) ⊆ plan(T+1). **≤ 15 dk\'nın sırası sabittir** '
      '(aşağıdaki tablo) ve **16–30 dk\'nın bütün artımları %d ve üstü sıradadır**; böylece ikinci aşamada eklenen '
      'hiçbir artım ≤ 15 dk planlarını değiştirmez.' % sk['rankFloor'])
    P('')
    slack = {}
    for name, rate, prof, sc in D.corners(L):
        T.DUR_SCALE = sc
        p = T.plan(L, 900, rate, prof)
        _, A, K = T.caps_for(L, 900)
        S, g = T.totals(T.assemble(L, 900, A, K, p['sel'], p['inc']), L, rate, T.profile(prof, rate))
        slack[name] = (900 - S - g['pref'], S + g['cap'] < 900, 900 - S - g['half'])
    T.DUR_SCALE = 1.0
    worst = max(v[0] for v in slack.values())
    P('**Ek koşul (bu çalışmada ölçüldü):** 15 dk planında bütün ≤ 15 dk içeriği girmiştir; hedef ile pref '
      'sessizliklerle toplam arasındaki pay %s. İçerik zaten esnemiş olduğu için (T5 koşulu "cap < hedef" hiçbir '
      'köşede tutmuyor) ikinci aşamanın ilk artımı yalnız bu paydan kısaysa 15 dk planına girer ve yayındaki 15 dk '
      'dosyası değişir. Kural: **sıra %d–519 boş kalır; ilk artım (sıra 520: BR.orta + C4 tabanı) pref sessizliklerle '
      'en az 30 sn olmalıdır** (en geniş pay %s sn; öneri ≈ 1,5–2 dk). Tek bir kısa klip (ör. ek odak aralığı) 520\'den '
      'önce konmaz. Derleme testi bunu her ses ve hız köşesinde denetler.' % (
          ', '.join('%s %s sn' % (n, num(round(v[0], 1))) for n, v in slack.items()), sk['rankFloor'],
          num(round(worst, 1))))
    P('')
    P('### 2.1 ≤ 15 dk sırası (sabit; `ders5.lesson.json`)')
    P('')
    P('| Sıra | Tür | Artım | Hoc köşesinde girdiği dakika |')
    P('|---|---|---|---|')
    res = D.run_corner(L, 'hoc', 4.68, 'hi', 1.0)[0]

    def first_min(ids):
        for m in D.MINUTES:
            have = {e['clip']['id'] for e in res[m][0]['events']}
            if all(i in have for i in ids):
                return '%d' % m
        return '—'
    for rank, _, kind, payload in T.increments(L):
        if kind == 'block':
            req = [c['id'] for c in blocks[payload]['clips'] if c['tier'] == 'required']
            P('| %s | blok | %s tabanı (zorunlu klipleri: %d) | %s |' % (num(rank), payload, len(req), first_min(req)))
        else:
            bid, key, ids = payload
            P('| %s | %s | %s%s | %s |' % (num(rank), bid, key, (' (%d klip)' % len(ids)) if len(ids) > 1 else '',
                                          first_min(ids)))
    P('')
    P('### 2.2 16–30 dk sırası (ikinci aşamada kesinleşir; önerilen yerleşim)')
    P('')
    P('| Sıra | Artım | Neden |')
    P('|---|---|---|')
    P('| %d–519 | (boş bırakılır) | 15 dk payından küçük artım 15 dk planına girerdi |' % sk['rankFloor'])
    P('| 520 | BR.orta + C4 tabanı (ses çapası: çanı sönene kadar dinleme, iki çan; yumuşak bakış: gözler yarı açık, '
      'kırpmak serbest, "gözlerin yorulursa…") | 16–19. dakikada girer; ≥ 20 dk\'da ortadaki çıkış kapısı zorunlu '
      '(pilot check_plan) |')
    P('| 530–590 | C4\'ün ek çan turları; C3\'ün ≈ 60 sn penceresi (duyurulu, kapılı, çanla karşılanır); C1 ve C2\'nin 30 dk '
      'genişletmeleri (ek odak aralıkları, yalnız verişte saymanın ikinci turu) | A.2.2 dikkat eğrisi: 18:30 "45 → 60 sn" |')
    P('| 600–690 | Varış ve Kapanış\'ın 30 dk biçimleri (A 1:30, K 2:30 çapası; avuçlama her 30 dk sürümünde) | kapaklar '
      'süreyle büyür |')
    P('| 700 | C5 tabanı (açık izleme: ışık genişler; sesler; iki duyurulu pencere) | ≈ 21–22. dakikada başlar '
      '(A.2.2: 21:30 sesler) |')
    P('| 710–790 | C5\'in ikinci bölümü (düşünceler gelip gider; A.2.2: 24:30) ve genişletme klipleri (hızlı ses için) | '
      '30:00\'a sınır aşmadan ulaşmak (PLAN.v2 §B.3 test g) |')
    P('')

    # ------------------------------------------------------------------ 3
    P('## 3. Anahtar cümleler (sabit)')
    P('')
    for k in ('1', '2', '3'):
        P('%s. %s' % (k, sk['keySentence'][k]))
    P('')
    P('30 dk\'da da üç kez söylenir (PLAN.v2 §C.4); C4 ve C5 anahtar cümle taşımaz. Ardışık geçişler arası ≥ 90 sn '
      '(pilot H3). "Fark ettiğin an, zaten geri döndün." başka hiçbir derste kullanılmaz (PLAN.v2 §A.2.1, §C.1).')
    P('')

    # ------------------------------------------------------------------ 4
    P('## 4. İmge yayı (sabit; el fenerinin ışığı, seçimsiz)')
    P('')
    for i, x in enumerate(sk['imageArc'], 1):
        P('%d. %s' % (i, x))
    P('')
    P('30 dk\'da üçüncü adım C5\'in kendisidir: ışık yeniden genişler, önce odadaki sesleri, sonra gelip giden düşünceleri '
      'aydınlatır; hiçbirine takılmadan hepsini birlikte gösterir. Ders 9 sınırı korunur: "fark eden sensin" tanık '
      'göstergesi ve izleyen farkındalık yok (PLAN.v2 §A.2.1). Son cümle 30 dk\'da da aynıdır: "El feneri yine senin '
      'elinde."')
    P('')

    # ------------------------------------------------------------------ 5
    P('## 5. Müzik teması (sabit)')
    P('')
    mu = L['music']
    P('- Ton: %s' % mu['key'])
    P('- Tema: %s' % mu['theme'])
    P('- Kaynak: %s' % mu['source'])
    P('- Pencere: %s' % mu['windowWithdraw']['note'])
    P('- Çan: %s' % mu['returnTone'])
    P('- C4\'te çan ses çapasıdır: aralıklı tek vuruşlar, her birinin sönümü dinlenir (≥ 8 sn sönüm, VARSAYIM); C5\'te ton '
      'Kapanış\'taki gibi yeniden genişler. Doğa katmanı kapalı. 3, 5, 15 ve 30 dk\'da aynı tema (PLAN.v2 §A.1).')
    P('')

    # ------------------------------------------------------------------ 6
    P('## 6. 30 dakikalık dikkat eğrisi (PLAN.v2 §A.2.2; VARSAYIM)')
    P('')
    P('0:00 varış · 1:30 nefes çapası · 4:00 dağılıp geri dönme · 6:00 1\'den 10\'a sayma · 8:30 yalnız verişte sayma · '
      '11:00 ses çapası (çan) · 13:00 yumuşak bakış, gözler yarı açık · 15:00 sessiz odak aralıkları 15 → 30 sn · 18:30 '
      '45 → 60 sn · 21:30 açık izleme: sesler · 24:30 düşünceler gelip gider · 27:30 kapanış ve isteğe bağlı avuçlama. '
      'En uzun değişimsiz aralık 3:30 (sınır 5 dk; pilot test k). ≤ 15 dk\'nın gerçek değişim anları '
      '`ders5.script.md` §1.6\'da.')
    P('')

    # ------------------------------------------------------------------ 7
    P('## 7. İkinci aşamada yazılacaklar (metinsiz liste)')
    P('')
    todo = [
        'BR.orta: ortak çıkış cümlesinin ortadaki biçimi + dayanak (oturduğun yer ya da ellerin) + açık gözde bakış '
        'serbest; ≥ 20 dk her sürümde.',
        'C4 (a) ses çapası: çanı tanıtma (dersin çanı; C3\'te dönüş tınısı olarak tanıtılmışsa aynı çan), vuruş başına '
        'kalıp (sesi sönene kadar izlemek, sönünce nefese dönmek), 2–4 çan turu, arada ≤ 20 sn sessizlik ya da duyurulu '
        'pencere.',
        'C4 (b) yumuşak bakış: "drişti" adı ilk ve tek kez (PLAN.v2 §C.7), gözler yarı açık, bakış önde yerde bir '
        'noktada ve yumuşak, kırpmak serbest, "Gözlerin yorulursa kapatman ya da kırpman yeterli." (PLAN.v2 Ders 5 '
        'güvenlik satırı); kırpmadan bakma ve trataka yok (PLAN.v2 §A.0). Göz yorgunluğu sorusu kör dinlemede '
        'sınanır.',
        'C3: ≈ 60 sn penceresi (duyuru + kapı + çan + karşılama; ≤ 90 sn sınırı içinde).',
        'C5: ışığın genişlemesi (imge 3. adım), sesler bölümü, düşünceler bölümü ("gelip giden" dili; bastırma yok), '
        'iki duyurulu pencere; Ders 9 sınırı.',
        'Varış ve Kapanış\'ın 30 dk biçimleri; Kapanış\'ta avuçlama her 30 dk sürümünde.',
        'Genişletme klipleri (hızlı ses köşesinde 30:00\'a sınır aşmadan ulaşmak için; PLAN.v2 §B.3 test g).',
        'Derleme testi: 16–30 dk her dakika × üç köşe; ≤ 15 dk planlarının değişmediği (bu dosyanın §2 koşulu).',
    ]
    for i, x in enumerate(todo, 1):
        P('%d. %s' % (i, x))
    P('')
    P('Bu iskelet, ≤ 15 dk\'nın bloklarını ve sıralarını değiştirmeden büyür. Değişiklik gerekirse (ör. C4\'ün 15 dk\'ya '
      'alınması) ≤ 15 dk dosyaları yeniden üretilir ve bu, sahibin kulağına yeniden gider.')
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')
    print('yazıldı', OUT, len(lines), 'satır')


if __name__ == '__main__':
    main()
