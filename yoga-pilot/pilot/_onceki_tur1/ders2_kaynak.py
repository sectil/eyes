#!/usr/bin/env python3
"""Ders 2 · Derin Dinlenme (Yoga Nidra) · metnin TEK kaynağı.

Bu dosya dersin bütün sözlerini, boşluklarını, ipuçlarını ve planlayıcı sıralarını tutar; ders2.lesson.json ve
ders2.script.md buradan üretilir (elle düzenlenmez). Hece sayıları kodla sayılır (Türkçe ünlüler a e ı i o ö u ü â î û).
Çalıştırma: python3 ders2_kaynak.py   → ders2.lesson.json + ders2.script.md (sonra: python3 timing.py)
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import timing  # noqa: E402  (aynı süre modeli ve planlayıcı)

VERSION = 'pilot-1 (2026-09-28)'
R, O, E = 'required', 'optional', 'extension'


def G(a, b, c):
    return {'min': float(a), 'pref': float(b), 'max': float(c)}


CARRIERS = []


def clip(cid, text, tier=R, gap=(3, 4, 6), phase=None, cue=None, rank=None, group=None, requires=None,
         minTarget=None, window=None, **tags):
    c = {'id': cid, 'text': text, 'tier': tier, 'gapAfter': G(*gap) if not window else G(*window),
         'phase': phase, 'cue': cue or {}, 'tags': tags}
    if window:
        c['window'] = G(*window)
    if rank is not None:
        c['fillRank'] = rank
    if group:
        c['fillGroup'] = group
    if requires:
        c['requires'] = list(requires)
    if minTarget is not None:
        c['minTarget'] = minTarget
    return c


def carrier(car_id, items, gap=(1.0, 1.5, 2.8), section=None, texture=None, last_final=True, ranks=None,
            gaps=None, note=''):
    """items: (id, söz, katman, grup). Taşıyıcı tek TTS isteğidir; öğeler üç noktadaki duraklardan kesilir."""
    out = []
    n = len(items)
    texts = []
    for i, it in enumerate(items):
        cid, word, tier, grp = (list(it) + [None])[:4]
        last = (i == n - 1)
        shown = word + ('.' if (last and last_final) else '…')
        texts.append(shown)
        g = (gaps or {}).get(cid, gap)
        c = clip(cid, shown, tier, g, rank=(ranks or {}).get(grp) if tier != R else None, group=grp,
                 section=section, texture=texture)
        c['carrier'] = {'id': car_id, 'index': i}
        out.append(c)
    CARRIERS.append({'id': car_id, 'text': ' '.join(t[0].upper() + t[1:] if j == 0 else t
                                                     for j, t in enumerate(texts)),
                     'items': [c['id'] for c in out], 'cut': 'üç nokta duraklarından; öğe sayısı tutmazsa insan kararı',
                     'note': note})
    return out


# ------------------------------------------------------------------------------------------------------------------
# Doldurma sırası (fillRank). Artım listesi: blok girişleri (entryRank) + isteğe bağlı "dalgalar" + genişletmeler.
# Dalga içinde blok önceliği korunur (P1 → P2 → P3 → P5). Bütün genişletmeler (>= 1000) bütün isteğe bağlılardan sonra.
RANK = {
    # dalga 1: dolaşımın parmakları, nefesin akışı
    'parmak': 110, 'c2.akis': 120, 'c1.tekrar': 130, 'n1.birak': 140,
    # dalga 2: bacaklar, geri sayma 6-7, sondaki niyet dileği
    'bacak': 210, 'c2.n06': 220, 'c2.n07': 230, 'n2.dilek': 240,
    # imgeleme girer (P2)
    # dalga 3: imgenin kokusu, elin ayrıntısı, nefes ve dönüş cümlesi, 8-9-10
    'c4.koku': 310, 'el': 320, 'c2.geri': 330, 'c4.acele': 340, 'c2.n08': 350, 'c2.n09': 360, 'c2.n10': 370,
    # dalga 4: yüzün üst kısmı, adım, kol-gövde, geride kalan sesler, sırt
    'yuz1': 410, 'c4.adim': 420, 'kol': 430, 'c4.geride': 440, 'sirt': 450,
    # zıtlık çiftleri girer (P3)
    # dalga 5
    'c3.zemin': 510, 'ayak': 520, 'c4.iz': 530, 'c3.nefeskadar': 540, 'yuz2': 550, 'c3.fincan': 560,
    'c2.yer': 570, 'c3.pencere': 580, 'yuz3': 590,
    # dalga 6
    'butun': 610, 'c2.durak': 620, 'n1.sankalpa': 630,
    # tanıklık girer (P5)
    # dalga 7
    'c5.sesler': 710, 'c5.genis': 720,
    # genişletmeler (CRITIQUE #3): 30:00'a en hızlı eklemlemede (6,6) sessizlik sınırı aşılmadan ulaşmak için
    'x.saymak': 1010, 'x.tas': 1020, 'temas': 1030, 'c3.x.ikisi1': 1040, 'c4.isik': 1050, 'c4.kus': 1060,
    'c3.x.ikisi2': 1070, 'c4.ruzgar': 1080, 'c5.x.hepsi': 1090,
}
ENTRY = {'C4': 300, 'C3': 500, 'C5': 700}


def rk(key):
    return RANK[key]


# ------------------------------------------------------------------------------------------------------------------
# VARIŞ (sabit kapak). Kısa: hedef <= 12 dk. Uzun: > 12 dk. Uzun metin kısanın üst kümesidir (aynı ses dosyaları).
V = 'Varış'
a_hosgeldin = clip('a.hosgeldin', 'Hoş geldin.', gap=(2, 3, 4), phase=V,
                   cue={'visual': 'phase:varis', 'music': 'phase:varis'}, texture='varis')
a_acilis = clip('a.acilis', 'Bu dakikalarda yapacak hiçbir işin yok; yalnızca dinlenmek var.', gap=(5, 5, 8),
                phase=V, texture='varis', uniqueOpening=True)
a_ortu = clip('a.ortu', 'Üşümemek için üstüne ince bir örtü alabilirsin.', gap=(8, 8, 14), phase=V,
              texture='varis', action='örtü almak')
a_durus = clip('a.durus', 'Sırtüstü ya da sana en rahat gelen biçimde uzanabilirsin.', gap=(8, 8, 12), phase=V,
               texture='varis', action='uzanmak')
a_yastik = clip('a.yastik', 'Dizlerinin altına bir yastık iyi gelebilir.', gap=(7, 7, 12), phase=V,
                texture='varis', action='yastık')
a_kollar = clip('a.kollar', 'Kolların iki yanında durabilir, avuç içlerin yukarıya dönük.', gap=(8, 8, 11),
                phase=V, texture='varis', action='kollar')
a_izin = clip('a.izin', 'İstediğin an gözlerini açabilir, kıpırdayabilir ya da durabilirsin.', gap=(5, 5, 8),
              phase=V, texture='varis', safety='opening')
a_gozler = clip('a.gozler', 'Gözlerin kapalı da olabilir, açık da; açıksa bakışın bir noktada dinlenebilir.',
                gap=(6, 6, 9), phase=V, texture='varis', eyes='baskı yok')
a_agirlik = clip('a.agirlik', 'Bedeninin ağırlığını altındaki zemine bırakabilirsin.', gap=(7, 7, 12), phase=V,
                 texture='varis')
a_karar = clip('a.karar', 'Ne kadar gevşeyeceğine sen karar verirsin. Gevşemek bugün kolay gelmeyebilir; bu da olur.',
               gap=(7, 7, 11), phase=V, texture='varis', safety='control')

A_KISA = {'id': 'A.kisa', 'kind': 'arrival', 'variant': 'short', 'maxTarget': 720, 'priority': 0, 'playOrder': 0,
          'title': 'Varış (kısa, <= 12 dk)', 'clips': [a_hosgeldin, a_acilis, a_izin, a_durus, a_gozler]}
A_UZUN = {'id': 'A.uzun', 'kind': 'arrival', 'variant': 'long', 'minTarget': 721, 'priority': 0, 'playOrder': 0,
          'title': 'Varış (uzun, > 12 dk)',
          'clips': [a_hosgeldin, a_acilis, a_izin, a_ortu, a_durus, a_yastik, a_gozler, a_agirlik, a_karar]}

# ------------------------------------------------------------------------------------------------------------------
# N1 · NİYET (SANKALPA), BAŞTA · P1
D1 = 'Derinleşme'
N1 = {'id': 'N1', 'kind': 'core', 'priority': 1, 'playOrder': 1, 'title': 'Niyet (sankalpa), başta', 'clips': [
    clip('n1.sec', 'İstersen kendine kısa bir niyet seçebilirsin.', gap=(4, 7, 10), phase=D1,
         cue={'visual': 'phase:derinlesme'}, texture='niyet'),
    clip('n1.sankalpa', 'Yogada buna sankalpa denir: bugün sana iyi gelecek, basit bir cümle.', O, gap=(3, 4, 6),
         phase=D1, rank=rk('n1.sankalpa'), texture='niyet', explain=True),
    clip('n1.ornek', 'Bulamazsan şunu kullanabilirsin: "Dinlenmeye izin veriyorum."', gap=(3, 5, 7), phase=D1,
         texture='niyet', tts='tırnak içi hafif vurgulu; iki noktadan sonra doğal durak'),
    clip('n1.soyle', 'Niyetini içinden üç kez söyleyebilirsin.', gap=(10, 13, 18), phase=D1, texture='niyet',
         action='niyeti üç kez içinden söylemek'),
    clip('n1.birak', 'Niyetin seninle; şimdilik onu bir kenara bırakabilirsin.', O, gap=(4, 5, 8), phase=D1,
         rank=rk('n1.birak'), texture='niyet', repeatOk=['niyet']),
]}

# ------------------------------------------------------------------------------------------------------------------
# C1 · BEDEN DOLAŞIMI (sağ → sol → arka → ön → bütün) · P1
END = (2, 3, 4.5)
c1_clips = [
    clip('c1.cerceve', 'Adını andığım yerleri fark edebilirsin; rahatsız eden bir yer olursa atlayabilirsin.',
         gap=(2.5, 3, 4), phase=D1, cue={'music': 'phase:derin'}, texture='dolasim-uzuv', safety='skip'),
    clip('c1.tekrar', 'Bir şey yapman gerekmiyor; her adı içinden tekrarlaman yeterli.', O, gap=(2.5, 3, 4),
         phase=D1, rank=rk('c1.tekrar'), texture='dolasim-uzuv'),
]
side_items = {
    'sag': [('s01', 'Sağ elin başparmağı', R), ('s02', 'işaret parmağı', O, 'parmak'), ('s03', 'orta parmak', O, 'parmak'),
            ('s04', 'yüzük parmağı', O, 'parmak'), ('s05', 'serçe parmak', O, 'parmak'),
            ('s06', 'avuç içi', O, 'el'), ('s07', 'elin sırtı', O, 'el'), ('s08', 'bilek', O, 'el'), ('s09', 'ön kol', O, 'el'),
            ('s10', 'dirsek', O, 'el'),
            ('s11', 'üst kol', O, 'kol'), ('s12', 'omuz', R), ('s13', 'belin sağ yanı', O, 'kol'), ('s14', 'kalça', O, 'kol'),
            ('s15', 'uyluk', O, 'bacak'), ('s16', 'diz', R), ('s17', 'baldır', O, 'bacak'), ('s18', 'ayak bileği', O, 'bacak'),
            ('s19', 'topuk', O, 'bacak'), ('s20', 'ayak tabanı', R),
            ('s21', 'ayağın üstü', O, 'ayak'), ('s22', 'ayak başparmağı', O, 'ayak'), ('s23', 'ikinci parmak', O, 'ayak'),
            ('s24', 'üçüncü parmak', O, 'ayak'), ('s25', 'dördüncü parmak', O, 'ayak'), ('s26', 'beşinci parmak', O, 'ayak')],
}
side_items['sol'] = [(('l' + i[0][1:]), i[1].replace('Sağ elin', 'Sol elin').replace('belin sağ yanı', 'belin sol yanı'))
                     + tuple(i[2:]) for i in side_items['sag']]
chunks = [(0, 5), (5, 10), (10, 14), (14, 20), (20, 26)]
for side, pre in (('sag', 's'), ('sol', 'l')):
    items = [('c1.' + it[0],) + tuple(it[1:]) for it in side_items[side]]
    for k, (a, b) in enumerate(chunks):
        part = items[a:b]
        c1_clips += carrier('car.%s%d' % (side, k + 1), part, section=side, texture='dolasim-uzuv',
                            last_final=(b == 26), ranks=RANK,
                            gaps={'c1.%s20' % pre: END, 'c1.%s26' % pre: END})
c1_clips += carrier('car.sirt', [('c1.b01', 'Sağ kürek kemiği', R), ('c1.b02', 'sol kürek kemiği', R),
                                 ('c1.b03', 'bel boşluğu', O, 'sirt'), ('c1.b04', 'omurga, boydan boya', R),
                                 ('c1.b05', 'bütün sırt', O, 'sirt')],
                    section='sirt', texture='dolasim-govde', ranks=RANK, gaps={'c1.b04': END, 'c1.b05': END})
c1_clips += carrier('car.on1', [('c1.f01', 'başın tepesi', O, 'yuz1'), ('c1.f02', 'alın', R),
                                ('c1.f03', 'sağ şakak', O, 'yuz1'), ('c1.f04', 'sol şakak', O, 'yuz1'),
                                ('c1.f05', 'sağ kaş', O, 'yuz1'), ('c1.f06', 'sol kaş', O, 'yuz1')],
                    section='on', texture='dolasim-govde', last_final=False, ranks=RANK)
c1_clips += carrier('car.on2', [('c1.f07', 'göz kapakları', R), ('c1.f08', 'gözlerin çevresi', O, 'yuz2'),
                                ('c1.f09', 'sağ kulak', O, 'yuz2'), ('c1.f10', 'sol kulak', O, 'yuz2'),
                                ('c1.f11', 'sağ yanak', O, 'yuz2'), ('c1.f12', 'sol yanak', O, 'yuz2'),
                                ('c1.f13', 'burnun ucu', O, 'yuz2')],
                    section='on', texture='dolasim-govde', last_final=False, ranks=RANK)
c1_clips += carrier('car.on3', [('c1.f14', 'üst dudak', O, 'yuz3'), ('c1.f15', 'alt dudak', O, 'yuz3'),
                                ('c1.f16', 'çene', R), ('c1.f17', 'boyun', O, 'yuz3'),
                                ('c1.f18', 'sağ köprücük kemiği', O, 'yuz3'),
                                ('c1.f19', 'sol köprücük kemiği', O, 'yuz3'), ('c1.f20', 'göğüs', R),
                                ('c1.f21', 'karın', O, 'yuz3')],
                    section='on', texture='dolasim-govde', ranks=RANK, gaps={'c1.f20': END, 'c1.f21': END})
c1_clips += carrier('car.butun', [('c1.w01', 'Bütün sağ bacak', O, 'butun'), ('c1.w02', 'bütün sol bacak', O, 'butun'),
                                  ('c1.w03', 'iki bacak birlikte', O, 'butun'), ('c1.w04', 'bütün sağ kol', O, 'butun'),
                                  ('c1.w05', 'bütün sol kol', O, 'butun'), ('c1.w06', 'iki kol birlikte', O, 'butun'),
                                  ('c1.w07', 'bütün beden birlikte', R), ('c1.w08', 'bütün beden', O, 'butun'),
                                  ('c1.w09', 'bütün beden', O, 'butun')],
                    gap=(1.5, 2.2, 3.2), section='butun', texture='dolasim-butun', ranks=RANK,
                    gaps={'c1.w07': END, 'c1.w08': (2.5, 3.5, 5), 'c1.w09': (2.5, 3.5, 5)},
                    note='Son üç öğe bilinçli tekrar: aynı sözcük, giderek yumuşayan söyleyiş.')
# genişletme: temas noktaları (bedenin zemine değdiği yerler) — doku değişimi
temas_open = clip('c1.x01', 'Bedeninin yere değdiği noktaları da hissedebilirsin.', E, gap=(3, 4, 6), phase=D1,
                  rank=rk('temas'), group='temas', section='temas', texture='temas')
temas_items = carrier('car.temas', [('c1.x02', 'Topuklar', E, 'temas'), ('c1.x03', 'baldırlar', E, 'temas'),
                                    ('c1.x04', 'kalçalar', E, 'temas'), ('c1.x05', 'kürek kemikleri', E, 'temas'),
                                    ('c1.x06', 'başın arkası', E, 'temas')],
                      gap=(1.8, 2.5, 3.5), section='temas', texture='temas', ranks=RANK)
temas_close = clip('c1.x07', 'Her biri, altındaki zemine yaslanıyor.', E, gap=(4, 6, 9), phase=D1,
                   rank=rk('temas'), group='temas', section='temas', texture='temas')
c1_clips += [temas_open] + temas_items + [temas_close]
c1_clips.append(clip('c1.k1', 'Bedenin dinleniyor; sen uyanıksın ve farkındasın.', gap=(5, 7, 10), phase=D1,
                     key=1, texture='anahtar'))
for c in c1_clips:
    c['phase'] = c['phase'] or D1
    if c.get('carrier') and c['tier'] != R and 'fillRank' not in c:
        c['fillRank'] = RANK[c['fillGroup']]
C1 = {'id': 'C1', 'kind': 'core', 'priority': 1, 'playOrder': 2,
      'title': 'Beden dolaşımı (sağ → sol → arka → ön → bütün)', 'clips': c1_clips}

# ------------------------------------------------------------------------------------------------------------------
# C2 · NEFES FARKINDALIĞI + GERİ SAYMA · P1
D = 'Derin'
say = carrier('car.sayi', [('c2.n10', 'on', O), ('c2.n09', 'dokuz', O), ('c2.n08', 'sekiz', O), ('c2.n07', 'yedi', O),
                           ('c2.n06', 'altı', O), ('c2.n05', 'beş', R), ('c2.n04', 'dört', R), ('c2.n03', 'üç', R),
                           ('c2.n02', 'iki', R), ('c2.n01', 'bir', R)],
              gap=(3.5, 5.5, 8), section=None, texture='geri-sayma', gaps={'c2.n01': (3, 5, 7)},
              note='CRITIQUE #12: sayılar tek başına üretilmez; bu taşıyıcı cümle tek istekte üretilip kesilir. '
                   'Kısa sürüm "beş"ten başlar; uzun sürüm önek olarak altı..on ekler.')
for c in say:
    n = int(c['id'][-2:])
    c['phase'] = D
    c['cue'] = {'visual': 'pulse', 'breath': {'count': n}}
    c['tags']['micro'] = 'number'
    if c['tier'] == O:
        c['fillRank'] = RANK[c['id']]
        if n < 10:
            pass
    if n > 6:
        c['requires'] = ['c2.n%02d' % (n - 1)]
C2 = {'id': 'C2', 'kind': 'core', 'priority': 1, 'playOrder': 3, 'title': 'Nefes farkındalığı ve geri sayma',
      'clips': [
          clip('c2.dikkat', 'Şimdi nefesi olduğu gibi, değiştirmeden izleyebilirsin.', gap=(4.5, 9, 13), phase=D,
               cue={'visual': 'phase:derin'}, texture='nefes'),
          clip('c2.yer', 'Onu en belirgin hissettiğin yeri bulabilirsin: burun, göğüs ya da karın.', O, gap=(7, 12, 16),
               phase=D, rank=rk('c2.yer'), texture='nefes'),
          clip('c2.akis', 'Nefes kendiliğinden geliyor, kendiliğinden gidiyor.', O, gap=(7, 11, 15), phase=D,
               rank=rk('c2.akis'), texture='nefes', repeatOk=['kendi', 'nefes']),
          clip('c2.durak', 'Verişin sonunda küçük bir duraklama var; onu da fark edebilirsin.', O, gap=(7, 12, 16),
               phase=D, rank=rk('c2.durak'), texture='nefes'),
          clip('c2.sayac', 'Geriye doğru sayacağım; sayılar nefesine eşlik edebilir.', gap=(2.5, 3, 4),
               phase=D, texture='geri-sayma', repeatOk=['nefes']),
      ] + say + [
          clip('c2.x.kendin', 'İstersen bir turu da içinden sayabilirsin: kendi hızında, ondan bire. '
               'Sesim bu sırada susacak, sonra geri gelecek.', E, phase=D, rank=rk('x.saymak'), group='x.saymak',
               window=(40, 60, 90), cue={'visual': 'window', 'music': 'swell'}, texture='sessiz-sayma',
               announce=True, repeatOk=['sesim']),
          clip('c2.x.donus', 'Sesim yeniden seninle; sayının nerede kaldığı önemli değil.', E, gap=(4, 5, 7), phase=D,
               rank=rk('x.saymak'), group='x.saymak', requires=['c2.x.kendin'], texture='nefes', welcome=True,
               repeatOk=['sayın', 'sayıl', 'sesim']),
          clip('c2.birak', 'Sayıları bırakabilirsin; kaçırdıysan bu da olur.', gap=(6, 9, 13), phase=D,
               texture='nefes', normalize=True, repeatOk=['sayın', 'sayıl']),
          clip('c2.geri', 'Fark ettiğin an, zaten geri döndün.', O, gap=(7, 10, 14), phase=D, rank=rk('c2.geri'),
               texture='nefes', normalize=True),
      ]}

# ------------------------------------------------------------------------------------------------------------------
# KÖPRÜ · anahtar cümlenin ikinci geçişi: her sürümde N2'den hemen önce (hangi blok bitmişse onun ardından)
BR = {'id': 'BR.K2', 'kind': 'bridge', 'placement': {'after': 'C2'}, 'priority': 0, 'playOrder': 0,
      'title': 'Köprü: anahtar cümle (2. geçiş), nefes bloğunun hemen ardından',
      'clips': [clip('br.k2', 'Beden dinleniyor; sen uyanıksın.', gap=(5, 8, 12), phase=D, key=2,
                     texture='anahtar')]}

BR_ORTA = {'id': 'BR.orta', 'kind': 'bridge', 'placement': {'before': 'C4'}, 'priority': 0, 'playOrder': 0,
           'title': 'Köprü: ortada çıkış kapısı (>= 20 dk), imgelemeden hemen önce',
           'clips': [clip('br.orta', 'Hatırlatayım: istediğin an gözlerini açabilir ya da durabilirsin.',
                          gap=(8, 10, 14), phase=D, minTarget=1200, texture='kapi', safety='mid')]}

# ------------------------------------------------------------------------------------------------------------------
# C3 · ZITLIK ÇİFTLERİ (ağır/hafif, sıcak/serin) · P3
agir = carrier('car.agir', [('c3.a1', 'Kollar ağır', R), ('c3.a2', 'bacaklar ağır', R), ('c3.a3', 'bütün beden ağır', R)],
               gap=(2.5, 3.5, 5), texture='zitlik-agir', gaps={'c3.a3': (6, 9, 13)},
               note='Bilinçli koşut yapı; üç öğe aynı ezgiyle.')
hafif = carrier('car.hafif', [('c3.h1', 'Kollar hafif', R), ('c3.h2', 'bacaklar hafif', R),
                              ('c3.h3', 'bütün beden hafif', R)],
                gap=(2.5, 3.5, 5), texture='zitlik-agir', gaps={'c3.h3': (6, 9, 13)})
for c in agir + hafif:
    c['phase'] = D
    c['tags']['repeatOk'] = ['bütün', 'beden']
C3 = {'id': 'C3', 'kind': 'core', 'priority': 3, 'playOrder': 4, 'entryRank': ENTRY['C3'],
      'title': 'Zıtlık çiftleri (ağır/hafif, sıcak/serin)', 'clips': [
          clip('c3.agir', 'Bir ağırlık hissi belirebilir; istemezsen onu bırakabilirsin.', gap=(4, 6, 8),
               phase=D, texture='zitlik-agir', safety='exit', repeatOk=['ağırl']),
      ] + agir + [
          clip('c3.zemin', 'Zemin bu ağırlığı tümüyle taşıyor.', O, gap=(7, 10, 15), phase=D, rank=rk('c3.zemin'),
               texture='zitlik-agir', repeatOk=['ağırl']),
          clip('c3.hafif', 'Şimdi bunun tersini hissedebilirsin: hafiflik.', gap=(3, 4, 6), phase=D,
               texture='zitlik-agir'),
      ] + hafif + [
          clip('c3.nefeskadar', 'Neredeyse ağırlıksız; nefes kadar hafif.', O, gap=(7, 10, 15), phase=D,
               rank=rk('c3.nefeskadar'), texture='zitlik-agir', repeatOk=['hafif']),
          clip('c3.x.ikisi1', 'Ağırlık da hafiflik de aynı anda burada olabilir.', E, gap=(9, 12, 18), phase=D,
               rank=rk('c3.x.ikisi1'), texture='zitlik-agir', repeatOk=['ağırl', 'hafif']),
          clip('c3.sicak', 'Sonra sıcaklık: bedeninde ılık bir his yayılabilir.', gap=(6, 9, 13), phase=D,
               texture='zitlik-sicak'),
          clip('c3.fincan', 'Avuçlarında sıcak bir fincan tutar gibi.', O, gap=(7, 10, 15), phase=D,
               rank=rk('c3.fincan'), texture='zitlik-sicak', evocation=True, repeatOk=['sıcak']),
          clip('c3.serin', 'Sonra serinlik: teninde ferah bir his dolaşabilir.', gap=(6, 9, 13), phase=D,
               texture='zitlik-sicak', repeatOk=['sonra']),
          clip('c3.pencere', 'Açık bir pencereden içeri dolan hava gibi.', O, gap=(7, 10, 15), phase=D,
               rank=rk('c3.pencere'), texture='zitlik-sicak', evocation=True),
          clip('c3.x.ikisi2', 'Sıcaklık ve serinlik, yan yana da durabilir.', E, gap=(9, 12, 18), phase=D,
               rank=rk('c3.x.ikisi2'), texture='zitlik-sicak'),
          clip('c3.birak', 'Bu hisleri bırakabilirsin; beden kendi hâline dönüyor.', gap=(7, 12, 16), phase=D,
               texture='zitlik-sicak'),
      ]}

# ------------------------------------------------------------------------------------------------------------------
# C4 · İMGELEME (seçimli: kıyı ya da orman) + sessiz pencere · P2 · dersin TEK imge yayı
C4 = {'id': 'C4', 'kind': 'core', 'priority': 2, 'playOrder': 5, 'entryRank': ENTRY['C4'],
      'title': 'İmgeleme: kıyı ya da orman (tek imge yayı) + sessiz pencere', 'clips': [
          clip('c4.yer', 'Zihninde bir kıyı ya da bir orman belirebilir; hangisi sana iyi geliyorsa.',
               gap=(7, 10, 14), phase=D, cue={'visual': 'image:on'}, texture='imge', image='new', arc='giriş',
               safety='choice'),
          clip('c4.gelmezse', 'Bir görüntü gelmezse de olur; nefesinde kalabilirsin.', gap=(7, 10, 14), phase=D,
               texture='imge', safety='alternative'),
          clip('c4.patika', 'Ayaklarının altında yumuşak bir patika var.', gap=(7, 10, 14), phase=D, texture='imge',
               image='new', arc='yola çıkış'),
          clip('c4.inis', 'Seni ağır ağır aşağıya indiriyor.', gap=(7, 10, 15),
               phase=D, texture='imge', image='new', arc='iniş'),
          clip('c4.adim', 'Her adımda bedenin biraz daha dinleniyor.', O, gap=(7, 10, 15), phase=D,
               rank=rk('c4.adim'), texture='imge', arc='iniş'),
          clip('c4.iz', 'Kumda ya da toprakta hafif izler bırakıyorsun.', O, gap=(7, 10, 15), phase=D,
               rank=rk('c4.iz'), texture='imge', image='new', arc='iniş'),
          clip('c4.ses', 'Uzaktan gelip giden bir ses: dalgalar ya da rüzgârdaki yapraklar.', gap=(8, 11, 16),
               phase=D, texture='imge', image='new', arc='varış', sense='ses'),
          clip('c4.kus', 'Daha uzakta bir kuş ötüyor.', E, gap=(7, 10, 15), phase=D, rank=rk('c4.kus'),
               texture='imge', image='new', arc='varış', sense='ses', repeatOk=['uzakt']),
          clip('c4.koku', 'Havada tuz ya da ıslak toprak kokusu var.', O, gap=(8, 11, 16), phase=D,
               rank=rk('c4.koku'), texture='imge', image='new', arc='varış', sense='koku'),
          clip('c4.gunes', 'Güneş tenini ılık ılık ısıtıyor.', gap=(8, 11, 16), phase=D, texture='imge',
               image='new', arc='varış', sense='sıcaklık'),
          clip('c4.ruzgar', 'Hafif bir rüzgâr yüzüne dokunup geçiyor.', E, gap=(7, 10, 15), phase=D,
               rank=rk('c4.ruzgar'), texture='imge', image='new', arc='varış', sense='dokunma'),
          clip('c4.yerles', 'Sana iyi gelen bir yer bulup oturabilir ya da uzanabilirsin.', gap=(8, 12, 18), phase=D,
               texture='imge', image='new', arc='dinlenme'),
          clip('c4.tas1', 'Yanında güneşte ısınmış, düz bir taş var.', E, gap=(7, 10, 15), phase=D, rank=rk('x.tas'),
               group='x.tas', texture='imge', image='new', arc='dinlenme', sense='dokunma'),
          clip('c4.tas2', 'Elini üstüne koyabilirsin; taş ılık ve pürüzsüz.', E, gap=(8, 11, 16), phase=D,
               rank=rk('x.tas'), group='x.tas', requires=['c4.tas1'], texture='imge', image='new',
               arc='dinlenme', sense='dokunma', repeatOk=['taş']),
          clip('c4.isik', 'Işık, suyun ya da yaprakların üzerinde oynuyor.', E, gap=(8, 11, 16), phase=D,
               rank=rk('c4.isik'), texture='imge', image='new', arc='dinlenme', sense='görme'),
          clip('c4.acele', 'Hiçbir şeyin acelesi yok.', O, gap=(8, 11, 16), phase=D, rank=rk('c4.acele'),
               texture='imge', arc='dinlenme'),
          clip('c4.pencere', 'Birkaç nefes burada dinlenebilirsin; sesim bir süre susacak, sonra geri gelecek.',
               phase=D, window=(20, 45, 90), cue={'visual': 'window', 'music': 'swell'}, texture='imge',
               announce=True, arc='dinlenme'),
          clip('c4.donus1', 'Yeniden seninleyim.', gap=(3, 4, 6), phase=D, texture='imge-donus', welcome=True),
          clip('c4.don', 'Zamanı geldiğinde aynı patikadan, kendi hızında geri dönebilirsin.', gap=(8, 12, 16),
               phase=D, texture='imge-donus', image='return', arc='dönüş'),
          clip('c4.geride', 'Sesler ve ışık yavaş yavaş geride kalıyor.', O, gap=(6, 9, 13), phase=D,
               rank=rk('c4.geride'), texture='imge-donus', image='return', arc='dönüş'),
          clip('c4.solma', 'Görüntü soluyor; altındaki zemini yeniden hissedebilirsin.', gap=(7, 10, 14), phase=D,
               cue={'visual': 'image:off'}, texture='imge-donus', image='return', arc='kapanış'),
      ]}

# ------------------------------------------------------------------------------------------------------------------
# C5 · TANIKLIK (sessiz farkındalık) · P5 · yalnız imgeleme varsa (imgedeki "gelip giden ses"e geri çağrı)
C5 = {'id': 'C5', 'kind': 'core', 'priority': 5, 'playOrder': 6, 'entryRank': ENTRY['C5'], 'requiresBlocks': ['C4'],
      'title': 'Tanıklık: sessiz farkındalık', 'clips': [
          clip('c5.basla', 'Hiçbir şeyi değiştirmeden, olup biteni izleyebilirsin.', gap=(7, 10, 15), phase=D,
               texture='taniklik'),
          clip('c5.sesler', 'Uzaktaki sesler, yakındaki sesler ve aradaki sessizlik.', O, gap=(8, 12, 18), phase=D,
               rank=rk('c5.sesler'), texture='taniklik', repeatOk=['sesle']),
          clip('c5.dusunce', 'Düşünceler de gelip gidiyor; dalgalar ya da yapraklar gibi.', gap=(8, 12, 18), phase=D,
               texture='taniklik', callback='c4.ses'),
          clip('c5.x.hepsi', 'Nefes, sesler ve beden; hepsi kendi kendine oluyor.', E, gap=(9, 13, 20), phase=D,
               rank=rk('c5.x.hepsi'), texture='taniklik', repeatOk=['kendi']),
          clip('c5.sen', 'Sen, bütün bunları fark edensin.', gap=(8, 12, 18), phase=D, texture='taniklik'),
          clip('c5.pencere', 'Bir süre sessizce izlemeye devam edebilirsin; sesim sonra geri gelecek.', phase=D,
               window=(30, 60, 90), cue={'visual': 'window', 'music': 'swell'}, texture='taniklik', announce=True),
          clip('c5.donus', 'Buradayım.', gap=(3, 4, 6), phase=D, texture='taniklik', welcome=True),
          clip('c5.genis', 'Dikkatin geniş ve sakin; hiçbir yere gitmesi gerekmiyor.', O, gap=(8, 12, 18), phase=D,
               rank=rk('c5.genis'), texture='taniklik'),
      ]}

# ------------------------------------------------------------------------------------------------------------------
# N2 · NİYET, SONDA · P1
N2 = {'id': 'N2', 'kind': 'core', 'priority': 1, 'playOrder': 7, 'title': 'Niyet, sonda', 'clips': [
    clip('n2.hatirla', 'Başta seçtiğin niyeti hatırlayıp içinden üç kez söyleyebilirsin.', gap=(9, 14, 20),
         phase=D, texture='niyet-son', action='niyeti üç kez içinden söylemek'),
    clip('n2.dilek', 'Niyetin, günün geri kalanında da seninle olabilir.', O, gap=(5, 7, 10), phase=D,
         rank=rk('n2.dilek'), texture='niyet-son', repeatOk=['niyet']),
]}

# ------------------------------------------------------------------------------------------------------------------
# KAPANIŞ (sabit kapak, gündüz dönüşü). Sıra: nefes → parmaklar → gerinme → gözler → oda → yana dön → otur → bekle.
K = 'Kapanış'
k_anahtar3 = clip('k.anahtar3', 'Dinleniyorsun… ve uyanıksın.', gap=(3.5, 3.5, 6), phase=D, key=3, texture='anahtar',
                  tts='üç nokta: TTS içinde doğal durak (Neslihan ~0,3 sn, Hakan ~1,5 sn)')
k_donus = clip('k.donus', 'Artık dönme zamanı.', gap=(2.5, 2.5, 4), phase=K,
               cue={'music': 'phase:kapanis', 'visual': 'dawn'}, texture='kapanis')
k_nefes = clip('k.nefes', 'Nefesin biraz derinleşebilir.', gap=(6, 6, 9), phase=K, step='nefes',
               texture='kapanis')
k_sesler = clip('k.sesler', 'Odanın seslerini, dışarıdan gelenleri de duyabilirsin.', gap=(6, 6, 8), phase=K,
                step='sesler', texture='kapanis')
k_parmak = clip('k.parmak', 'El ve ayak parmaklarını oynatabilirsin.', gap=(5, 5, 7), phase=K,
                step='parmak', texture='kapanis')
k_gerin = clip('k.gerin', 'Canın nasıl isterse gerinebilirsin.', gap=(5, 5, 8), phase=K, step='gerin',
               texture='kapanis')
k_goz = clip('k.goz', 'Gözlerini ışığa alışa alışa açabilirsin.', gap=(5, 5, 7),
             phase=K, cue={'music': 'chord'}, step='goz', texture='kapanis', eyes='ışığa yavaş alışma')
k_oda_kisa = clip('k.oda.kisa', 'Odada birkaç şeye bakabilirsin.', gap=(4.5, 4.5, 7), phase=K, step='oda',
                  texture='kapanis')
k_oda_uzun = clip('k.oda.uzun', 'Odada birkaç şeye bakabilirsin: bir renk, bir biçim, bir doku.', gap=(5.5, 5.5, 8),
                  phase=K, step='oda', texture='kapanis')
k_zaman = clip('k.zaman', 'Günün hangi saatinde, nerede olduğunu hatırlayabilirsin.', gap=(4.5, 4.5, 7), phase=K,
               step='oda', texture='kapanis')
k_yan = clip('k.yan', 'Önce bir yanına dön.', gap=(5, 5, 8), phase=K, step='yan', texture='kapanis', mood='safety',
             repeatOk=['yanın'])
k_yandakal = clip('k.yandakal', 'Bir iki nefes o yanında kalabilirsin.', gap=(7, 7, 10), phase=K, step='yan',
                  texture='kapanis')
k_otur = clip('k.otur', 'Ellerinden destek alarak yavaşça doğrulup otur.', gap=(6, 6, 9), phase=K, step='otur',
              texture='kapanis', mood='safety')
k_bekle = clip('k.bekle', 'Birkaç nefes böyle kal; başın dönerse biraz daha bekle.', gap=(4.5, 4.5, 8), phase=K,
               step='bekle', texture='kapanis', mood='safety')
k_son = clip('k.son', 'Buradasın; uyanık ve dinlenmiş.', gap=(2.5, 2.5, 4), phase=K, cue={'music': 'fade:2s',
                                                                                      'visual': 'end'},
             step='son', texture='kapanis')

K_KISA = {'id': 'K.kisa', 'kind': 'closing', 'variant': 'short', 'maxTarget': 720, 'priority': 0, 'playOrder': 99,
          'title': 'Kapanış (kısa, <= 12 dk)',
          'clips': [k_anahtar3, k_donus, k_nefes, k_parmak, k_gerin, k_goz, k_oda_kisa, k_yan, k_otur, k_bekle,
                    k_son]}
K_UZUN = {'id': 'K.uzun', 'kind': 'closing', 'variant': 'long', 'minTarget': 721, 'priority': 0, 'playOrder': 99,
          'title': 'Kapanış (uzun, > 12 dk)',
          'clips': [k_anahtar3, k_donus, k_nefes, k_sesler, k_parmak, k_gerin, k_goz, k_oda_uzun, k_zaman, k_yan,
                    k_yandakal, k_otur, k_bekle, k_son]}

# "Kapanışa geç" düğmesi (PLAN B.5): o anki klip biter, bu hızlı kapanış çalar. Durdur (X): isteğe bağlı sesli dönüş.
QUICK = {'id': 'K.hizli', 'kind': 'utility', 'title': '"Kapanışa geç" için hızlı kapanış',
         'cue': {'music': 'phase:kapanis', 'visual': 'dawn'},     # düğmeye basılınca motor uygular
         'clips': [k_nefes, k_parmak, k_goz, k_yan, k_otur, k_bekle, k_son]}
STOP = {'id': 'D.durdur', 'kind': 'utility', 'title': 'Durdur (X) sonrası isteğe bağlı 20 sn sesli dönüş',
        'clips': [clip('d.goz', 'Gözlerini aç, etrafına bak, acele etme.', gap=(4, 4, 5), phase=K, mood='safety',
                       step='goz', screen='Durdurma ekranı metniyle aynı'),
                  clip('d.kalk', 'Uzanıyorsan önce yana dön, sonra otur.', gap=(6, 6, 7), phase=K, mood='safety',
                       step='yan', screen='Durdurma ekranı metniyle aynı'),
                  clip('d.bekle', 'Birkaç nefes bekle; sonra kalkabilirsin.', gap=(2, 2, 2), phase=K,
                       mood='safety', step='bekle')]}

BLOCKS = [A_KISA, A_UZUN, N1, C1, C2, BR, C3, BR_ORTA, C4, C5, N2, K_KISA, K_UZUN]


# ------------------------------------------------------------------------------------------------------------------
def finalize():
    for b in (A_KISA, A_UZUN, K_KISA, K_UZUN, QUICK, STOP):     # kapak sessizlikleri sıkıştırılmaz
        for c in b['clips']:
            c['gapAfter']['min'] = c['gapAfter']['pref']
    for b in BLOCKS + [QUICK, STOP]:
        for c in b['clips']:
            c['syllables'] = timing.syllables(c['text'])
            c['words'] = len(timing.words(c['text']))
            c['sentences'] = len(timing.sentences(c['text'])) if not c.get('carrier') else 1
            c['required'] = (c['tier'] == R)
            c['voice'] = {v: {'file': 'public/yoga/ders2/%s/%s.m4a' % (v, c['id']), 'sec': None}
                          for v in ('female', 'male')}
            c['tags'] = {k: v for k, v in c['tags'].items() if v is not None}
    for car in CARRIERS:
        car['syllables'] = timing.syllables(car['text'])
        car['voice'] = {v: {'file': 'yoga-uretim/ders2/%s/%s.wav' % (v, car['id']), 'sec': None}
                        for v in ('female', 'male')}


def lesson_dict():
    L = {
        'schema': 'nefona.yoga.lesson/1 (PLAN §B.2 + ekler)',
        'sozlesmeNotu': ('PLAN §B.2 alanları aynen: id, priority, playOrder, kind, clips[id, text, voice{female,male}'
                         '{file,sec}, required, gapAfter{min,pref,max}, cue{breath,visual,music}], silenceWindows'
                         '[afterClip,min,max,announce], minSec, prefSec{5,10,15,20,30}, maxSec. Ekler: tier (required/'
                         'optional/extension), syllables, words, sentences (kodla sayıldı), phase, fillRank, fillGroup, '
                         'requires, minTarget, window, carrier{id,index}, tags; blok türleri bridge (placement before/after) '
                         've utility (extras); priority 0 = sabit (kapak ya da köprü); entryRank (P2..P5 blok girişi). '
                         'minSec/prefSec/maxSec tahmindir (5,6 hece/sn + yüksek duraklama); üretimden sonra voice.*.sec ile '
                         'yeniden hesaplanır.'),
        'id': 'ders2-derin-dinlenme', 'version': VERSION,
        'title': 'Derin Dinlenme (Yoga Nidra)', 'tagline': 'Uyanık kalarak derin bir dinlenme.',
        'daypart': 'day', 'posture': 'lying', 'defaultMinutes': 15, 'minutes': {'min': 5, 'max': 30, 'step': 1},
        'leadIn': G(3, 4, 6),
        'limits': {'silenceWindowMaxSec': 90, 'clipMaxSecAt6_6': 15, 'lastSecondsNoNewImage': 60},
        'planner': {
            'capThresholdSec': 720,
            'kural': 'Kapaklar: hedef <= 720 sn kısa, değilse uzun; kapak sessizlikleri sıkıştırılmaz. Taban: bütün P1 '
                     'bloklar zorunlu klipleriyle (en kısa halleri sığmalı). Artımlar entryRank/fillRank sırasıyla, '
                     'sessizlikler pref iken sığıyorsa eklenir; içerik max sessizlikte bile yetmiyorsa en kısa haliyle '
                     'sığan artım yine eklenir; ilk sığmayanda durulur. Sessizlik min→pref→max oranla esner. Kalan süre '
                     'max toplamını aşarsa içerik hatası (sessizlik sınırı aşılmaz).',
            'entryRanks': ENTRY,
            'p1DropOrder': ['C2', 'N2', 'N1'],   # yalnız acil durum: taban min'de bile sığmazsa (C1 hiç düşmez)
        },
        'timingModel': {
            'articulationSyllPerSec': timing.RATES,
            'pauseProfilesSec': timing.PROFILES, 'pauseScaleAtRate': {str(k): v for k, v in
                                                                      timing.SPEED_PAUSE_SCALE.items()},
            'edgeSec': timing.EDGE, 'edgeMicroSec': timing.EDGE_MICRO,
            'note': 'VARSAYIM; 2026-09-28 ölçümleriyle kalibre (hiz/*.mp3). Gerçek klip süreleri gelince voice.*.sec kullanılır.',
        },
        'music': {'bpmFeel': 50, 'key': 'Mi♭ majör pad + alçak yaylılar + seyrek uzak piyano (VARSAYIM)',
                  'phases': ['varis', 'derin', 'kapanis'], 'duckDefault': True,
                  'swellOnlyInAnnouncedWindowsMinSec': 20,
                  'nature': 'uzak, sürekli ve yumuşak su/rüzgâr dokusu (kıyı ve ormana birlikte uyar; VARSAYIM)'},
        'visual': {'form': 'ufuk çizgisi', 'phases': ['varis', 'derinlesme', 'derin', 'kapanis(şafak)']},
        'carriers': CARRIERS,
        'blocks': [],
        'extras': {'quickClosing': QUICK, 'stopReturn': STOP},
    }
    for b in BLOCKS:
        bb = dict(b)
        bb['silenceWindows'] = []
        for i, c in enumerate(b['clips']):
            if c.get('window'):
                nxt = b['clips'][i + 1]['id'] if i + 1 < len(b['clips']) else None
                bb['silenceWindows'].append({'afterClip': c['id'], 'min': c['window']['min'],
                                             'pref': c['window']['pref'], 'max': c['window']['max'],
                                             'announce': c['id'], 'welcome': nxt})
        L['blocks'].append(bb)
    return L


def estimates(L):
    """PLAN §B.2 alanları: minSec / prefSec{5,10,15,20,30} / maxSec. Başvuru: 5,6 hece/sn + yüksek duraklama."""
    rate, prof = 5.6, timing.profile('hi', 5.6)
    anchors = {}
    for m in (5, 10, 15, 20, 30):
        p = timing.plan(L, m * 60, rate, 'hi')
        anchors[m] = timing.block_secs(p)
    for b in L['blocks']:
        req = [c for c in b['clips'] if c['tier'] == R and not c.get('minTarget')]
        b['minSec'] = round(sum(timing.clip_dur(c, rate, prof) + c['gapAfter']['min'] for c in req), 1)
        b['maxSec'] = round(sum(timing.clip_dur(c, rate, prof) + c['gapAfter']['max'] for c in b['clips']), 1)
        b['prefSec'] = {str(m): round(anchors[m].get(b['id'], 0.0), 1) for m in (5, 10, 15, 20, 30)}
        b['estimateBasis'] = '5,6 hece/sn + yüksek duraklama profili (VARSAYIM); üretimden sonra gerçek sec ile'


def main():
    finalize()
    L = lesson_dict()
    estimates(L)
    with open(os.path.join(HERE, 'ders2.lesson.json'), 'w', encoding='utf-8') as f:
        json.dump(L, f, ensure_ascii=False, indent=1)
    rc = timing.main()                      # timing.out.txt önce yazılır; belge onun özetini kullanır
    import ders2_md
    ders2_md.write(L)
    print('yazıldı: ders2.lesson.json, timing.out.txt, ders2.script.md (timing çıkış kodu %d)' % rc)


if __name__ == '__main__':
    main()
