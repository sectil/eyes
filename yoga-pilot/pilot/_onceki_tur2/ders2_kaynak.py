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

VERSION = 'pilot-2 (2026-09-29)'
R, O, E = 'required', 'optional', 'extension'


def G(a, b, c):
    return {'min': float(a), 'pref': float(b), 'max': float(c)}


CARRIERS = []


def clip(cid, text, tier=R, gap=(3, 4, 6), phase=None, cue=None, rank=None, group=None, requires=None,
         minTarget=None, window=None, alternates=None, pair=None, **tags):
    c = {'id': cid, 'text': text, 'tier': tier, 'gapAfter': G(*gap) if not window else G(*window),
         'phase': phase, 'cue': cue or {}, 'tags': tags}
    if pair:            # P-S6: bağlı çift; ortak klip hemen ardından çalıyorsa aradaki boşluk kısa (pairGap), yoksa gapAfter
        c['pairWith'], c['pairGap'] = pair[0], G(*pair[1])
    if alternates:      # P-N5: dönüşümlü seçenek metinleri (oturum sayısına göre belirlenimci; kaldığın yer kaydına yazılır)
        c['alternates'] = [{'text': t} for t in alternates]
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
            gaps=None, note='', lead=''):
    """items: (id, söz, katman, grup). Taşıyıcı tek TTS isteğidir; öğeler üç noktadaki duraklardan kesilir.
    lead: TTS'e taşıyıcının başında giden ama kesilip atılan ön söz (T17: "On…" gibi ilk sözcüğün İngilizce ya da
    emir kipiyle okunmasını önlemek için küçük harfli bağlam; iki yolda da çalışır, REST'te ayrıca previous_text)."""
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
    body = ' '.join(t[0].upper() + t[1:] if (j == 0 and not lead) else t for j, t in enumerate(texts))
    CARRIERS.append({'id': car_id, 'text': (lead + ' ' + body) if lead else body, 'lead': lead,
                     'items': [c['id'] for c in out], 'cut': 'üç nokta duraklarından; öğe sayısı tutmazsa insan kararı'
                     + ('; ön söz ("%s") kesilip atılır' % lead if lead else ''),
                     'note': note})
    return out


# ------------------------------------------------------------------------------------------------------------------
# Doldurma sırası (fillRank). Artım listesi: blok girişleri (entryRank) + isteğe bağlı "dalgalar" + genişletmeler.
# Dalga içinde blok önceliği korunur (P1 → P2 → P3 → P5). Bütün genişletmeler (>= 1000) bütün isteğe bağlılardan sonra.
RANK = {
    # dalga 1: sayma turu (6. dk'dan), nefeste tarafsız dayanak (P-S7), kontrol cümlesi, parmaklar, nefesin akışı
    'sayi5': 90, 'c2.alt': 100, 'a.karar': 105, 'parmak': 110, 'c2.akis': 120, 'c1.tekrar': 130, 'n1.birak': 140,
    'c1.kacirma': 145, 'k.yandakal': 160,
    # dalga 2: bacaklar, elin ayrıntısı, ondan geri sayma (S1-hoca: tek grup), kol-gövde, yüzün üstü, niyet dileği,
    # kapak ayrıntıları (T4: eskiden yalnız "uzun kapak"taydılar)
    'bacak': 210, 'el': 215, 'sirt': 220, 'sayi10': 225, 'n2.dilek': 240, 'a.konfor': 250,
    'k.sesler': 260, 'k.zaman': 270, 'k.oda.ayrinti': 280,
    # imgeleme girer (P2)
    # dalga 3: imgenin kokusu, acele etmeme
    'c4.ses': 302, 'c4.gunes': 305, 'c4.koku': 310, 'a.agirlik': 315, 'c4.pencere': 320, 'c4.acele': 340,
    # dalga 4: adım, geride kalan sesler, ılık taş (S7-hoca), sırt
    'yuz1': 410, 'c4.adim': 420, 'c4.geride': 440, 'x.tas': 450,
    # zıtlık çiftleri girer (P3)
    # dalga 5
    'c3.zemin': 510, 'ayak': 520, 'c4.iz': 530, 'c3.nefeskadar': 540, 'c3.x.ikisi1': 545, 'yuz2': 550,
    'c3.fincan': 560, 'c2.yer': 570, 'c3.pencere': 580, 'c3.x.ikisi2': 585, 'yuz3': 590,
    # dalga 6
    'butun': 610, 'c2.durak': 620,
    # tanıklık girer (P5)
    # dalga 7
    'c5.pencere': 705, 'c5.beden': 710, 'c5.genis': 720,
    # genişletmeler (CRITIQUE #3, T2): bütün isteğe bağlılardan sonra; 30:00'da bile esneme f <= 0,30 kalsın diye
    'a.x.kipir': 1005, 'x.saymak': 1010, 'c2.x.ritim': 1015, 'temas': 1030, 'x.agir2': 1040, 'x.hafif2': 1045,
    'c4.isik': 1050, 'c4.x.istemiyor': 1055, 'x.sicak': 1060, 'c4.x.golge': 1065, 'c4.x.gok': 1075, 'c4.ruzgar': 1080,
    'c4.x.yaklas': 1085, 'c5.x.hepsi': 1090, 'c4.x.donus2': 1095, 'x.serin': 1100, 'c3.x.hepsi': 1105,
    'c5.x.dayanak': 1110, 'c5.x.yumusak': 1115, 'c5.x.oldugu': 1120, 'c5.x.sessizlik': 1125, 'n2.x.his': 1130,
    'tur2': 1150,
}
ENTRY = {'C4': 300, 'C3': 500, 'C5': 700}


def rk(key):
    return RANK[key]


# ------------------------------------------------------------------------------------------------------------------
# VARIŞ (sabit kapak; TEK blok, T4). Zorunlu klipler her sürede çalar. Eskiden yalnız "uzun kapak"ta olan klipler
# (konfor, ağırlık, kontrol) artık çekirdekteki isteğe bağlılar gibi sıralı artımdır: süre arttıkça eklenir, hiç düşmez.
# Sıra (T33, N6): karşılama → derse özgü açılış → duruş → [konfor] → [kıpırdanıp yerleşme] → [ağırlık] → [kontrol] →
# gözler → ortak çıkış cümlesi → huzursuzluk normaldir. Önce beden yerleşir; "gözlerini açabilir" cümlesi gözlerin
# seçiminden sonra gelir. T18: kontrol cümlesi (bildirme) ve kıpırdanma cümlesi (isim cümlesi) "-abilirsin" dizisini
# böler; varışta art arda en çok üç "-abilir" sonu kalır.
V = 'Varış'
a_hosgeldin = clip('a.hosgeldin', 'Hoş geldin; bu dakikalar senin.', gap=(1.5, 2, 3), phase=V,
                   cue={'visual': 'phase:varis', 'music': 'phase:varis'}, texture='varis')
a_acilis = clip('a.acilis', 'Yapman gereken hiçbir şey yok; yalnızca dinlenmek var.', gap=(3.5, 5, 7),
                phase=V, texture='varis', uniqueOpening=True,
                alternates=['Burada hiçbir şeyi başarman gerekmiyor; dinlenmek yeterli.',
                            'Hiçbir yere yetişmen gerekmiyor; yalnızca dinlenmek var.'])
a_durus = clip('a.durus', 'Sırtüstü, yan yatarak ya da sana en rahat gelen biçimde uzanabilirsin.', gap=(8, 8, 12),
               phase=V, texture='varis', action='uzanmak')
a_konfor = clip('a.konfor', 'Üstünde ince bir örtü, dizlerinin altında bir yastık iyi gelebilir.', O,
                gap=(10, 10, 14), phase=V, rank=rk('a.konfor'), texture='varis', action='örtü ve yastık (elinin altında)')
a_kipir = clip('a.x.kipir', 'Bir iki kez kıpırdanıp yerleşmek de dinlenmenin bir parçası.', E, gap=(6, 6, 9), phase=V,
               rank=rk('a.x.kipir'), texture='varis', action='kıpırdanıp yerleşmek')
a_gozler = clip('a.gozler', 'Gözlerini kapatabilir ya da bir noktaya yumuşakça bakabilirsin.',
                gap=(4, 4, 7), phase=V, texture='varis', eyes='baskı yok; yumuşak bakış', eyesOpen=True,
                action='gözleri kapatmak ya da yumuşak bakış')
a_izin = clip('a.izin', 'İstediğin an gözlerini açabilir, kıpırdayabilir ya da ara verebilirsin.', gap=(3, 6, 8),
              phase=V, texture='varis', safety='opening', eyesOpen=True, repeatOk=['gözle'])
a_karar = clip('a.karar', 'Ne kadar gevşeyeceğine sen karar verirsin.', O, gap=(6, 7, 9), phase=V,
               rank=rk('a.karar'), texture='varis', safety='control', repeatOk=['gevşe'])
a_kolay = clip('a.kolay', 'Gevşemek kolay gelmeyebilir; bunda bir sakınca yok.', gap=(3, 8, 10), phase=V,
               texture='varis', safety='normalize', normalize=True, repeatOk=['gevşe'])
a_agirlik = clip('a.agirlik', 'Bedeninin ağırlığını zemine bırakabilirsin.', O, gap=(8, 8, 12), phase=V,
                 rank=rk('a.agirlik'), texture='varis', action='ağırlığı zemine bırakmak')

A = {'id': 'A', 'kind': 'arrival', 'priority': 0, 'playOrder': 0, 'title': 'Varış (tek kapak; isteğe bağlılar süreyle eklenir)',
     'clips': [a_hosgeldin, a_acilis, a_durus, a_konfor, a_kipir, a_agirlik, a_karar, a_gozler, a_izin, a_kolay]}

# ------------------------------------------------------------------------------------------------------------------
# N1 · NİYET (SANKALPA), BAŞTA · P1
D1 = 'Derinleşme'
N1 = {'id': 'N1', 'kind': 'core', 'priority': 1, 'playOrder': 1, 'title': 'Niyet, başta (ekranda: sankalpa)',
      'screenLabel': 'Niyet (sankalpa)', 'clips': [
    # S2-hoca: açıklama seçimden önce ve seçimle aynı klipte; "sankalpa" yalnız ekranda (PLAN C.7). Seçim süresi, hazır
    # cümle de duyulduktan sonra n1.ornek'in ardındaki sessizliktir (E.6 #1).
    clip('n1.sec', 'Kendine kısa bir niyet seçebilirsin: bugün için basit bir cümle.', gap=(3, 4, 5), phase=D1,
         cue={'visual': 'phase:derinlesme', 'music': 'phase:derinlesme'}, texture='niyet',
         alternates=['Bugün için kendine kısa, basit bir niyet cümlesi seçebilirsin.',
                     'Bugünkü niyetin için kısa ve basit bir cümle seçebilirsin.']),
    clip('n1.ornek', 'Aklına bir şey gelmezse şunu kullanabilirsin: "Dinlenmeye izin veriyorum."', gap=(8, 10, 13),
         phase=D1, texture='niyet', action='niyeti seçmek', tts='tırnak içi hafif vurgulu; iki noktadan sonra doğal durak'),
    clip('n1.soyle', 'Niyetini içinden üç kez söyleyebilirsin.', gap=(9, 13, 18), phase=D1, texture='niyet',
         action='niyeti üç kez içinden söylemek'),
    clip('n1.birak', 'Niyetin seninle kalacak. Şimdilik ona tutunman gerekmiyor.', O, gap=(4, 5, 8), phase=D1,
         rank=rk('n1.birak'), texture='niyet', repeatOk=['niyet']),
]}

# ------------------------------------------------------------------------------------------------------------------
# C1 · BEDEN DOLAŞIMI (sağ → sol → arka → ön → bütün) · P1
END = (2, 3, 4.5)
c1_clips = [
    clip('c1.cerceve', 'Saydığım her yeri fark edebilirsin; seni rahatsız eden bir yer olursa atlayabilirsin.',
         gap=(2.5, 3, 4), phase=D1, texture='dolasim-uzuv', safety='skip'),
    clip('c1.tekrar', 'Her birini içinden tekrarlaman yeterli; başka bir çabaya gerek yok.', O, gap=(2.5, 3, 4),
         phase=D1, rank=rk('c1.tekrar'), texture='dolasim-uzuv'),
]
side_items = {
    'sag': [('s01', 'Sağ elin başparmağı', R), ('s02', 'işaret parmağı', O, 'parmak'), ('s03', 'orta parmak', O, 'parmak'),
            ('s04', 'yüzük parmağı', O, 'parmak'), ('s05', 'serçe parmak', O, 'parmak'),
            ('s06', 'avuç içi', O, 'el'), ('s07', 'elin sırtı', O, 'el'), ('s08', 'bilek', O, 'el'), ('s09', 'ön kol', O, 'el'),
            ('s10', 'dirsek', O, 'el'),
            ('s11', 'üst kol', O, 'el'), ('s12', 'omuz', R), ('s13', 'belin sağ yanı', O, 'el'), ('s14', 'kalça', O, 'el'),
            ('s15', 'uyluk', O, 'bacak'), ('s16', 'diz', R), ('s17', 'baldır', O, 'bacak'), ('s18', 'ayak bileği', O, 'bacak'),
            ('s19', 'topuk', O, 'bacak'), ('s20', 'ayak tabanı', R),
            ('s21', 'ayağın üstü', O, 'ayak'), ('s22', 'ayak başparmağı', O, 'ayak'), ('s23', 'ikinci parmak', O, 'ayak'),
            ('s24', 'üçüncü parmak', O, 'ayak'), ('s25', 'dördüncü parmak', O, 'ayak'), ('s26', 'beşinci parmak', O, 'ayak'),
            ('s27', 'bütün sağ taraf', O, 'ayak')],      # P-S5: ilerleme işareti (sağın sonu)
}
side_items['sol'] = [(('l' + i[0][1:]), i[1].replace('Sağ elin', 'Sol elin').replace('belin sağ yanı', 'belin sol yanı')
                      .replace('bütün sağ taraf', 'bütün sol taraf')) + tuple(i[2:]) for i in side_items['sag']]
chunks = [(0, 5), (5, 10), (10, 14), (14, 20), (20, 27)]
for side, pre in (('sag', 's'), ('sol', 'l')):
    items = [('c1.' + it[0],) + tuple(it[1:]) for it in side_items[side]]
    if side == 'sol':
        # P-S5: sağ ile sol arasında bir cümle, uzun mikro-listeyi böler ve kaçırılan adı bağışlar (E.6 #10)
        c1_clips.append(clip('c1.kacirma', 'Bir adı kaçırırsan bir sonrakiyle devam edersin.', O,
                             gap=(2.5, 3, 4.5), phase=D1, rank=rk('c1.kacirma'), texture='dolasim-uzuv', normalize=True))
    for k, (a, b) in enumerate(chunks):
        part = items[a:b]
        c1_clips += carrier('car.%s%d' % (side, k + 1), part, section=side, texture='dolasim-uzuv',
                            last_final=(b == 27), ranks=RANK,
                            gaps={'c1.%s20' % pre: END, 'c1.%s26' % pre: (1.5, 2.2, 3.2), 'c1.%s27' % pre: END})
c1_clips += carrier('car.sirt', [('c1.b01', 'Sağ kürek kemiği', O, 'sirt'), ('c1.b02', 'sol kürek kemiği', O, 'sirt'),
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
# T17: "karın" cümle sonunda emir kipi (KA-rın) gibi okunabilir; bu yüzden taşıyıcı üç noktayla, liste ezgisiyle biter
c1_clips += carrier('car.on3', [('c1.f14', 'üst dudak', O, 'yuz3'), ('c1.f15', 'alt dudak', O, 'yuz3'),
                                ('c1.f16', 'çene', R), ('c1.f17', 'boyun', O, 'yuz3'),
                                ('c1.f18', 'sağ köprücük kemiği', O, 'yuz3'),
                                ('c1.f19', 'sol köprücük kemiği', O, 'yuz3'), ('c1.f20', 'göğüs', R),
                                ('c1.f21', 'karın', O, 'yuz3')],
                    section='on', texture='dolasim-govde', last_final=False, ranks=RANK,
                    gaps={'c1.f20': END, 'c1.f21': END})
# T05, T22: "baştan ayağa bütün beden", "iki bacak birden", "iki kol birden"
c1_clips += carrier('car.butun', [('c1.w01', 'Bütün sağ bacak', O, 'butun'), ('c1.w02', 'bütün sol bacak', O, 'butun'),
                                  ('c1.w03', 'iki bacak birden', O, 'butun'), ('c1.w04', 'bütün sağ kol', O, 'butun'),
                                  ('c1.w05', 'bütün sol kol', O, 'butun'), ('c1.w06', 'iki kol birden', O, 'butun'),
                                  ('c1.w07', 'baştan ayağa bütün beden', R), ('c1.w08', 'bütün beden', O, 'butun'),
                                  ('c1.w09', 'bütün beden', O, 'butun')],
                    gap=(1.5, 2.2, 3.2), section='butun', texture='dolasim-butun', ranks=RANK,
                    gaps={'c1.w07': END, 'c1.w08': (2.5, 3.5, 5), 'c1.w09': (2.5, 3.5, 5)},
                    note='Son üç öğe bilinçli tekrar: aynı sözcük, giderek yumuşayan söyleyiş.')
# genişletme (T2): aynı yoldan kısa ikinci tur (klasik ikinci dolaşım; daha hızlı tempo, yeni doku)
tur2_open = clip('c1.t2', 'Aynı yoldan kısa bir tur daha.', E, gap=(2, 2.5, 3.5), phase=D1, rank=rk('tur2'),
                 group='tur2', texture='dolasim-tur2')
tur2_items = []
for car_id, part in (('car.tur2a', [('c1.t2a', 'Sağ el'), ('c1.t2b', 'sağ kol'), ('c1.t2c', 'sağ omuz'), ('c1.t2d', 'sağ kalça'),
                                    ('c1.t2e', 'sağ bacak'), ('c1.t2f', 'sağ ayak')]),
                     ('car.tur2b', [('c1.t2g', 'sol el'), ('c1.t2h', 'sol kol'), ('c1.t2i', 'sol omuz'), ('c1.t2j', 'sol kalça'),
                                    ('c1.t2k', 'sol bacak'), ('c1.t2l', 'sol ayak')]),
                     ('car.tur2c', [('c1.t2m', 'sırt'), ('c1.t2n', 'karın'), ('c1.t2o', 'göğüs'), ('c1.t2p', 'boyun'),
                                    ('c1.t2q', 'baş'), ('c1.t2r', 'bütün beden')])):
    tur2_items += carrier(car_id, [(i, w, E, 'tur2') for i, w in part], gap=(1.0, 1.3, 2.0), section='tur2',
                          texture='dolasim-tur2', ranks=RANK, last_final=(car_id == 'car.tur2c'),
                          gaps={'c1.t2r': (3, 4, 6)})
c1_clips += [tur2_open] + tur2_items
# genişletme: temas noktaları (bedenin zemine değdiği yerler) — doku değişimi; T23/T18: "beden" tekrarı yok, isim cümlesi
temas_open = clip('c1.x01', 'Bir de yere değen noktalar.', E, gap=(2.5, 3, 4.5), phase=D1,
                  rank=rk('temas'), group='temas', section='temas', texture='temas')
temas_items = carrier('car.temas', [('c1.x02', 'Topuklar', E, 'temas'), ('c1.x03', 'baldırlar', E, 'temas'),
                                    ('c1.x04', 'kalçalar', E, 'temas'), ('c1.x05', 'kürek kemikleri', E, 'temas'),
                                    ('c1.x06', 'başın arkası', E, 'temas')],
                      gap=(1.8, 2.5, 3.5), section='temas', texture='temas', ranks=RANK)
temas_close = clip('c1.x07', 'Her biri altındaki zemine yaslanıyor.', E, gap=(4, 6, 9), phase=D1,
                   rank=rk('temas'), group='temas', section='temas', texture='temas')
c1_clips += [temas_open] + temas_items + [temas_close]
# anahtar cümle 1 (S10-hoca + S17 + T04): kısa, "farkındasın" yok, ilk geçiş izin kipinde
c1_clips.append(clip('c1.k1', 'Bedenin dinlenebilir; sen uyanık kalıyorsun.', gap=(5, 7, 10), phase=D1,
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
# S1-hoca + T3 + S8: sayılar ya beşten ya ondan başlar (altı..on tek grup); aralarındaki periyot bütün sürelerde ≈ 5,9–6,5 sn
# (dakikada ≈ 10 sayı: nefese hız dayatmaz, T3'ün 4–6,5 sn kilidine ve S1-hoca'nın "en az ≈ 6 sn"ine birlikte uyar).
# T17: "On…" ilk sözcük olunca İngilizce "on" gibi okunabilir → atılan küçük harfli ön söz.
NUM_GAP = (5.5, 5.75, 5.95)
say = carrier('car.sayi', [('c2.n10', 'on', O, 'sayi10'), ('c2.n09', 'dokuz', O, 'sayi10'), ('c2.n08', 'sekiz', O, 'sayi10'),
                           ('c2.n07', 'yedi', O, 'sayi10'), ('c2.n06', 'altı', O, 'sayi10'), ('c2.n05', 'beş', O, 'sayi5'),
                           ('c2.n04', 'dört', O, 'sayi5'), ('c2.n03', 'üç', O, 'sayi5'), ('c2.n02', 'iki', O, 'sayi5'),
                           ('c2.n01', 'bir', O, 'sayi5')],
              gap=NUM_GAP, section=None, texture='geri-sayma', gaps={'c2.n01': (5, 7, 9)}, ranks=RANK,
              lead='sayıyorum:',
              note='CRITIQUE #12: sayılar tek başına üretilmez; bu taşıyıcı tek istekte üretilip kesilir. Kısa sürüm '
                   '"beş"ten başlar; altı..on tek grup olarak birlikte girer (sayım ya beşten ya ondan başlar).')
for c in say:
    n = int(c['id'][-2:])
    c['phase'] = D
    c['cue'] = {'visual': 'pulse', 'breath': {'count': n}}
    c['tags']['micro'] = 'number'
    if n > 5:
        c['requires'] = ['c2.n05']      # ondan sayım yalnız beşli sayımın üstüne gelir
C2 = {'id': 'C2', 'kind': 'core', 'priority': 1, 'playOrder': 3, 'title': 'Nefes farkındalığı ve geri sayma',
      'clips': [
          # S4-hoca: müzik, görsel ve ses "Derin" evreye burada BİRLİKTE geçer
          clip('c2.dikkat', 'Şimdi nefesini olduğu gibi, değiştirmeden izleyebilirsin.', gap=(8, 10, 14), phase=D,
               cue={'visual': 'phase:derin', 'music': 'phase:derin'}, texture='nefes'),
          # P-S7: nefese bakmak herkese iyi gelmez → tarafsız dayanak (eller; güvenlik §11.B-8)
          clip('c2.alt', 'Bu sana zor gelirse, dikkatini ellerine verebilirsin.', O, gap=(7, 9, 12), phase=D,
               rank=rk('c2.alt'), texture='nefes', safety='anchor'),
          clip('c2.yer', 'Nefesini en net hissettiğin yeri bulabilirsin: burun, göğüs, karın ya da başka bir nokta.', O,
               gap=(10, 14, 17), phase=D, rank=rk('c2.yer'), texture='nefes', repeatOk=['nefes']),
          clip('c2.akis', 'Nefes kendiliğinden geliyor, kendiliğinden gidiyor.', O, gap=(9, 12, 16), phase=D,
               rank=rk('c2.akis'), texture='nefes', repeatOk=['kendi', 'nefes']),
          clip('c2.durak', 'Nefes verdikten sonra küçük bir duraklama olabilir; onu uzatmadan fark edebilirsin.', O,
               gap=(10, 14, 17), phase=D, rank=rk('c2.durak'), texture='nefes', repeatOk=['nefes']),
          # B2 + S1-hoca + S3-hoca + PLAN B.1 ("önce sessizlik, sonra tekrar sayıları"): 5 dakikada sayma turu yok, nefes ve
          # dinlenme var; sayım (duyuru + beşten bire + bırakma) 6. dakikadan itibaren tek grup olarak girer.
          clip('c2.sayac', 'Geriye doğru sayacağım; nefesini sayılara uydurman gerekmiyor.', O, gap=(2.5, 3, 4),
               phase=D, rank=rk('sayi5'), group='sayi5', texture='geri-sayma', repeatOk=['nefes']),
      ] + say + [
          clip('c2.x.kendin', 'Bir turu da içinden, kendi hızında sayabilirsin: ondan bire. '
               'Bire varınca baştan başlayabilirsin; sonra yine seslenirim.', E, phase=D, rank=rk('x.saymak'),
               group='x.saymak', window=(50, 50, 60), cue={'visual': 'window', 'music': 'swell'}, texture='sessiz-sayma',
               announce=True),
          clip('c2.x.donus', 'Yeniden buradayım; hangi sayıda kaldığın önemli değil.', E, gap=(4, 5, 7), phase=D,
               rank=rk('x.saymak'), group='x.saymak', requires=['c2.x.kendin'], texture='nefes', welcome=True,
               cue={'music': 'returnTone:-2s'}, repeatOk=['sayın', 'sayıl']),
          clip('c2.x.ritim', 'Nefes kendi ritminde sürüyor; onu ayarlaman gerekmiyor.', E, gap=(10, 14, 18), phase=D,
               rank=rk('c2.x.ritim'), texture='nefes', repeatOk=['nefes']),
          # B1: "Fark ettiğin an…" Ders 5'in anahtar cümlesi → silindi; zihin dağılması burada bağışlanır (T01, T07)
          clip('c2.birak', 'Sayıları bırakabilirsin; zihnin bir yere kaydıysa da olsun.', O, gap=(5, 6, 8), phase=D,
               rank=rk('sayi5'), group='sayi5', texture='nefes', normalize=True, repeatOk=['sayın', 'sayıl']),
          # S3-hoca: 5 dakikada bile "hiçbir şey yapmadan" bir an (20 sn'nin altında: duyuru gerekmez)
          clip('c2.kal', 'Bir süre hiçbir şey yapmadan burada dinlenebilirsin.', gap=(12, 16, 18), phase=D,
               texture='nefes', repeatOk=['dinle']),
      ]}

# ------------------------------------------------------------------------------------------------------------------
# KÖPRÜ · anahtar cümlenin ikinci geçişi: 7 dk ve üstünde, C2'nin hemen ardından (B2, P-S12: 5–6 dk'da anahtar cümle
# iki kez, c1.k1 ve k.anahtar3; 88 sn'de üç kez "slogan" gibi duyuluyordu)
BR = {'id': 'BR.K2', 'kind': 'bridge', 'placement': {'after': 'C2'}, 'priority': 0, 'playOrder': 0,
      'title': 'Köprü: anahtar cümle (2. geçiş), nefes bloğunun hemen ardından (>= 7 dk)',
      'clips': [clip('br.k2', 'Beden dinleniyor; sen uyanıksın.', gap=(11, 12, 14), phase=D, key=2, minTarget=420,
                     texture='anahtar', repeatOk=['dinle'])]}

# S1 (güvenlik) + B5/E9/P-B2: imgeleme planda olduğu HER sürede, hemen önünde çıkış kapısı ve tarafsız dayanak
# (güvenlik §11.B-2 gözleri açma seçeneği, §11.B-3 ortada hatırlatma, §11.B-8 zemin). T08/T09: "ara verebilirsin",
# iki noktadan sonra tam cümle büyük harfle.
BR_ORTA = {'id': 'BR.orta', 'kind': 'bridge', 'placement': {'before': 'C4'}, 'priority': 0, 'playOrder': 0,
           'title': 'Köprü: çıkış kapısı ve dayanak, imgelemeden hemen önce (C4 olan her sürüm)',
           'clips': [clip('br.orta', 'Hatırlatayım: İstediğin an gözlerini açabilir ya da ara verebilirsin. '
                          'Zor gelirse zemini hissedebilirsin.',
                          gap=(12, 13, 15), phase=D, texture='kapi', safety='mid', eyesOpen=True, anchor='zemin')]}

# ------------------------------------------------------------------------------------------------------------------
# C3 · ZITLIK ÇİFTLERİ (ağır/hafif, sıcak/serin) · P3
agir = carrier('car.agir', [('c3.a1', 'Kollar ağır', R), ('c3.a2', 'bacaklar ağır', R), ('c3.a2b', 'sırt ağır', E, 'x.agir2'),
                            ('c3.a2c', 'omuzlar ağır', E, 'x.agir2'), ('c3.a3', 'bütün beden ağır', R)],
               gap=(2.5, 3.5, 5), texture='zitlik-agir', gaps={'c3.a3': (6, 9, 13)}, ranks=RANK,
               note='Bilinçli koşut yapı; üç öğe aynı ezgiyle.')
hafif = carrier('car.hafif', [('c3.h1', 'Kollar hafif', R), ('c3.h2', 'bacaklar hafif', R), ('c3.h2b', 'sırt hafif', E, 'x.hafif2'),
                              ('c3.h2c', 'omuzlar hafif', E, 'x.hafif2'), ('c3.h3', 'bütün beden hafif', R)],
                gap=(2.5, 3.5, 5), texture='zitlik-agir', gaps={'c3.h3': (6, 9, 13)}, ranks=RANK)
# genişletme (S12-hoca, T2): sıcaklık ve serinlik de ağırlık/hafiflik gibi bedende dolaşır
sicak = carrier('car.sicak', [('c3.s1', 'Avuç içleri sıcak', E, 'x.sicak'), ('c3.s2', 'ayak tabanları sıcak', E, 'x.sicak'),
                              ('c3.s2b', 'sırt sıcak', E, 'x.sicak'), ('c3.s3', 'bütün beden sıcak', E, 'x.sicak')],
                gap=(2.5, 3.5, 5), texture='zitlik-sicak', gaps={'c3.s3': (6, 8, 12)}, ranks=RANK)
serin = carrier('car.serin', [('c3.r1', 'Yanaklar serin', E, 'x.serin'), ('c3.r2', 'burnun ucu serin', E, 'x.serin'),
                              ('c3.r2b', 'eller serin', E, 'x.serin'), ('c3.r3', 'bütün beden serin', E, 'x.serin')],
                gap=(2.5, 3.5, 5), texture='zitlik-sicak', gaps={'c3.r3': (6, 8, 12)}, ranks=RANK)
for c in agir + hafif + sicak + serin:
    c['phase'] = D
    c['tags']['repeatOk'] = ['bütün', 'beden']
C3 = {'id': 'C3', 'kind': 'core', 'priority': 3, 'playOrder': 4, 'entryRank': ENTRY['C3'],
      'title': 'Zıtlık çiftleri (ağır/hafif, sıcak/serin)', 'clips': [
          # S9-hoca + T25 + S1(güvenlik): çıkış kapısı "bırak" değil; kısmı geçip zemine (tarafsız dayanak)
          clip('c3.agir', 'Bir ağırlık hissi belirebilir. İstemezsen bu kısmı geçip zemini hissedebilirsin.',
               gap=(4, 6, 8), phase=D, texture='zitlik-agir', safety='exit', anchor='zemin', repeatOk=['ağırl']),
      ] + agir + [
          clip('c3.zemin', 'Zemin bu ağırlığı tümüyle taşıyor.', O, gap=(7, 10, 15), phase=D, rank=rk('c3.zemin'),
               texture='zitlik-agir', repeatOk=['ağırl', 'zemin']),
          clip('c3.hafif', 'Şimdi bunun tersi: hafiflik.', gap=(3, 4, 6), phase=D, texture='zitlik-agir'),
      ] + hafif + [
          # S13 + P-S9: "neredeyse ağırlıksız" (uzaklaşma) yerine hafiflik + zemin
          clip('c3.nefeskadar', 'Nefes kadar hafif; yine de zemin seni taşıyor.', O, gap=(7, 10, 15), phase=D,
               rank=rk('c3.nefeskadar'), texture='zitlik-agir', repeatOk=['hafif']),
          clip('c3.x.ikisi1', 'Ağırlık da hafiflik de aynı anda burada.', O, gap=(9, 12, 18), phase=D,
               rank=rk('c3.x.ikisi1'), texture='zitlik-agir', repeatOk=['ağırl', 'hafif']),
          clip('c3.sicak', 'Sonra sıcaklık: Bedenine ılık bir his yayılabilir.', gap=(8, 11, 14), phase=D,
               texture='zitlik-sicak', pair=('c3.fincan', (4, 5, 7))),
          clip('c3.fincan', 'Avuçlarında sıcak bir fincan tutar gibi.', O, gap=(9, 13, 18), phase=D,
               rank=rk('c3.fincan'), texture='zitlik-sicak', evocation=True, repeatOk=['sıcak']),
      ] + sicak + [
          clip('c3.serin', 'Ardından serinlik: Teninde bir ferahlık dolaşabilir.', gap=(8, 11, 14), phase=D,
               texture='zitlik-sicak', pair=('c3.pencere', (4, 5, 7))),
          clip('c3.pencere', 'Açık bir pencereden içeri dolan hava gibi.', O, gap=(9, 13, 18), phase=D,
               rank=rk('c3.pencere'), texture='zitlik-sicak', evocation=True),
      ] + serin + [
          clip('c3.x.ikisi2', 'Sıcaklık da serinlik de yan yana durabilir.', O, gap=(8, 11, 16), phase=D,
               rank=rk('c3.x.ikisi2'), texture='zitlik-sicak', repeatOk=['sıcak', 'serin']),
          clip('c3.x.hepsi', 'Ağır ve hafif, sıcak ve serin: Hepsi sende bir arada.', E, gap=(11, 15, 19), phase=D,
               rank=rk('c3.x.hepsi'), texture='zitlik-sicak', repeatOk=['sıcak', 'serin', 'hafif']),
          clip('c3.birak', 'Bu hisleri bırakabilirsin. Beden doğal hâline dönüyor.', gap=(9, 16, 19), phase=D,
               texture='zitlik-sicak'),
      ]}

# ------------------------------------------------------------------------------------------------------------------
# ------------------------------------------------------------------------------------------------------------------
# C4 · İMGELEME (seçimli: kıyı ya da orman) + sessiz pencere · P2 · dersin TEK imge yayı
# 2. tur: iniş ve "her adımda daha çok dinlenme" derinleştiricisi yok (S3, B3, E1); yol yürünür, dinleyici kendi hızında.
# Menü gibi "X ya da Y" yalnız seçimde (c4.yer), motif seste (c4.ses) ve geri çağrıda (c5.dusunce) kalır (P-S2).
C4 = {'id': 'C4', 'kind': 'core', 'priority': 2, 'playOrder': 5, 'entryRank': ENTRY['C4'],
      'title': 'İmgeleme: kıyı ya da orman (tek imge yayı) + sessiz pencere', 'clips': [
          clip('c4.yer', 'Zihninde sana iyi gelen bir yer belirebilir: bir kıyı ya da bir orman.',
               gap=(10, 12, 15), phase=D, cue={'visual': 'image:on'}, texture='imge', image='new', arc='giriş',
               safety='choice'),
          clip('c4.gelmezse', 'Bir görüntü gelmese de olur, gözlerin açık kalsa da.', gap=(11, 13, 15), phase=D,
               texture='imge', safety='alternative', eyesOpen=True, normalize=True),
          clip('c4.patika', 'Kendini orada, yumuşak bir patikanın başında bulabilirsin.', gap=(7, 10, 14), phase=D,
               texture='imge', image='new', arc='yola çıkış', pair=('c4.yol', (6, 6.5, 7.5))),
          clip('c4.yol', 'Yol önünde açılıyor; kendi hızında yürüyorsun.', gap=(11, 14, 18),
               phase=D, texture='imge', image='new', arc='yürüyüş'),
          clip('c4.adim', 'Her adımda ayak tabanlarını hissedebilirsin.', O, gap=(7, 10, 15), phase=D,
               rank=rk('c4.adim'), texture='imge', arc='yürüyüş', sense='dokunma'),
          clip('c4.iz', 'Ardında belli belirsiz izler kalıyor.', O, gap=(7, 10, 14), phase=D,
               rank=rk('c4.iz'), texture='imge', image='new', arc='yürüyüş'),
          clip('c4.ses', 'Uzaktan gelip giden bir ses: dalgalar ya da rüzgârda hışırdayan yapraklar.', O, gap=(8, 12, 17),
               phase=D, rank=rk('c4.ses'), texture='imge', image='new', arc='varış', sense='ses'),
          clip('c4.koku', 'Havada temiz, taze bir koku var.', O, gap=(6, 8, 11), phase=D,
               rank=rk('c4.koku'), texture='imge', image='new', arc='varış', sense='koku'),
          clip('c4.gunes', 'Güneş tenini tatlı tatlı ısıtıyor.', O, gap=(8, 11, 16), phase=D, rank=rk('c4.gunes'),
               texture='imge', image='new', arc='varış', sense='sıcaklık'),
          clip('c4.ruzgar', 'Serin bir esinti yüzüne dokunup geçiyor.', E, gap=(6, 8, 11), phase=D,
               rank=rk('c4.ruzgar'), texture='imge', image='new', arc='varış', sense='dokunma'),
          clip('c4.yerles', 'Kendine rahat bir yer bulup oturabilir ya da uzanabilirsin.', gap=(14, 16, 18), phase=D,
               texture='imge', image='new', arc='dinlenme'),
          clip('c4.x.istemiyor', 'Burada kimse senden bir şey istemiyor.', E, gap=(10, 15, 19), phase=D,
               rank=rk('c4.x.istemiyor'), texture='imge', arc='dinlenme'),
          clip('c4.tas1', 'Yanında güneşte ısınmış, düz bir taş var.', O, gap=(7, 10, 15), phase=D, rank=rk('x.tas'),
               group='x.tas', texture='imge', image='new', arc='dinlenme', sense='dokunma',
               pair=('c4.tas2', (4, 4.5, 6))),
          clip('c4.tas2', 'Elini üstüne koyabilirsin. Taş ılık ve pürüzsüz.', O, gap=(14, 16, 18), phase=D,
               rank=rk('x.tas'), group='x.tas', requires=['c4.tas1'], texture='imge', image='new',
               arc='dinlenme', sense='dokunma', repeatOk=['taş']),
          clip('c4.isik', 'Işık dört bir yanda oynuyor.', E, gap=(8, 11, 16), phase=D,
               rank=rk('c4.isik'), texture='imge', image='new', arc='dinlenme', sense='görme'),
          clip('c4.x.gok', 'Yukarıda açık, geniş bir gökyüzü var.', E, gap=(8, 12, 16), phase=D, rank=rk('c4.x.gok'),
               texture='imge', image='new', arc='dinlenme', sense='görme'),
          clip('c4.x.yaklas', 'Uzaktaki ses bir yaklaşıyor, bir uzaklaşıyor.', E, gap=(9, 13, 17), phase=D,
               rank=rk('c4.x.yaklas'), texture='imge', arc='dinlenme', sense='ses', callback='c4.ses'),
          clip('c4.acele', 'Hiçbir şeyin acelesi yok.', O, gap=(8, 11, 16), phase=D, rank=rk('c4.acele'),
               texture='imge', arc='dinlenme'),
          # S1 (güvenlik §11.B-8 "zor bölüm sırasında dönüş kapısı") + §11.B-2: imgenin içindeki tek uzun sessizlikten hemen
          # önce kapı. İmgenin içinde "zemin" hayal edilen yer gibi duyulabileceği için kapı gözlere ve odaya açılır.
          clip('c4.pencere', 'Burada biraz dinlenme zamanı. Zor gelirse gözlerini açabilirsin. '
                             'Bir süre susacağım, sonra yine seslenirim.', O,
               rank=rk('c4.pencere'), group='c4.pencere', phase=D, window=(20, 45, 90), cue={'visual': 'window', 'music': 'swell'}, texture='imge',
               announce=True, arc='dinlenme', eyesOpen=True, safety='door'),
          clip('c4.donus1', 'Yeniden seninleyim; dalıp gittiysen de sorun değil.', O, rank=rk('c4.pencere'),
               group='c4.pencere', gap=(3, 4, 6), phase=D,
               texture='imge-donus', welcome=True, normalize=True, cue={'music': 'returnTone:-2s'}),
          # Pencereden sonra, dönüşten önce: zamanın geçtiğini ışık söyler; imge cümlelerinin tek koşusu da bölünür (T8-5).
          clip('c4.x.golge', 'Işıkla gölge usul usul yer değiştiriyor.', E, gap=(10, 14, 18), phase=D,
               rank=rk('c4.x.golge'), texture='imge', image='new', arc='dinlenme', sense='görme'),
          clip('c4.don', 'Artık aynı patikadan, acele etmeden geri dönüyorsun.', gap=(12, 16, 18),
               phase=D, texture='imge-donus', image='return', arc='dönüş', action='patikadan geri yürümek'),
          clip('c4.x.donus2', 'Her adımda bu odaya biraz daha yaklaşıyorsun.', E, gap=(9, 12, 15), phase=D,
               rank=rk('c4.x.donus2'), texture='imge-donus', image='return', arc='dönüş'),
          clip('c4.geride', 'Sesler ve ışık yavaş yavaş geride kalıyor.', O, gap=(8, 10, 13), phase=D,
               rank=rk('c4.geride'), texture='imge-donus', image='return', arc='dönüş'),
          clip('c4.solma', 'Görüntü usulca siliniyor; seni taşıyan zemini yeniden hissedebilirsin.', gap=(10, 14, 16),
               phase=D, cue={'visual': 'image:off'}, texture='imge-donus', image='return', arc='kapanış',
               anchor='zemin'),
      ]}

# ------------------------------------------------------------------------------------------------------------------
# C5 · TANIKLIK (sessiz farkındalık) · P5 · yalnız imgeleme varsa. S5-hoca: sesler ve düşünceler Ders 5'in, izleyen
# farkındalık Ders 9'un içeriğidir; burada tanıklık bedene ve dinlenmeye bağlanır; tek geri çağrı imgedeki "gelip giden bir ses".
C5 = {'id': 'C5', 'kind': 'core', 'priority': 5, 'playOrder': 6, 'entryRank': ENTRY['C5'], 'requiresBlocks': ['C4'],
      'title': 'Tanıklık: sessiz farkındalık', 'clips': [
          clip('c5.basla', 'Hiçbir şeyi değiştirmeden, olup biteni izleyebilirsin.', gap=(9, 12, 15), phase=D,
               texture='taniklik'),
          clip('c5.beden', 'Uzanırken kendini baştan ayağa tek bir bütün olarak fark edebilirsin.', O, gap=(10, 14, 18),
               phase=D, rank=rk('c5.beden'), texture='taniklik'),
          clip('c5.x.dayanak', 'Ağırlığın ve zeminin desteği: İkisi de burada.', E, gap=(11, 14, 17),
               phase=D, rank=rk('c5.x.dayanak'), texture='taniklik', anchor='zemin'),
          clip('c5.x.hepsi', 'Nefes de sesler de bedendeki hisler de kendiliğinden oluyor.', E, gap=(9, 12, 17),
               phase=D, rank=rk('c5.x.hepsi'), texture='taniklik', pair=('c5.dusunce', (4, 5, 6)),
               repeatOk=['kendi']),
          clip('c5.dusunce', 'Düşünceler de gelip gidiyor; tıpkı dalgaların ya da yaprakların sesi gibi.', gap=(8, 12, 17),
               phase=D, texture='taniklik', callback='c4.ses'),
          clip('c5.x.yumusak', 'Yüzün yumuşak, çenen gevşek olabilir.', E, gap=(9, 12, 16), phase=D,
               rank=rk('c5.x.yumusak'), texture='taniklik'),
          clip('c5.x.oldugu', 'Her şey olduğu gibi kalsın.', E, gap=(10, 14, 18), phase=D, rank=rk('c5.x.oldugu'),
               texture='taniklik'),
          clip('c5.x.sessizlik', 'Bedenin de kendine göre bir sessizliği var.', E, gap=(11, 16, 20), phase=D,
               rank=rk('c5.x.sessizlik'), texture='taniklik'),
          clip('c5.sen', 'Bütün bunları fark eden sensin.', gap=(10, 12, 14), phase=D, texture='taniklik'),
          # P-S9: en uzun sessizlikten önce dayanak (güvenlik §11.B-8); T11: "sesim susacak" yerine birinci kişi
          clip('c5.pencere', 'Zor gelirse zemini hissedebilirsin. Bir süre sessizce izleyebilirsin; sonra yine seslenirim.',
               O, rank=rk('c5.pencere'), group='c5.pencere', phase=D, window=(30, 45, 90), cue={'visual': 'window', 'music': 'swell'}, texture='taniklik',
               announce=True, anchor='zemin'),
          clip('c5.donus', 'Buradayım.', O, rank=rk('c5.pencere'), group='c5.pencere', gap=(3, 4, 6), phase=D,
               texture='taniklik', welcome=True,
               cue={'music': 'returnTone:-2s'}),
          clip('c5.genis', 'Dikkatin geniş kalabilir. Hiçbir yere gitmesi gerekmiyor.', O, gap=(8, 12, 18), phase=D,
               rank=rk('c5.genis'), texture='taniklik'),
      ]}

# ------------------------------------------------------------------------------------------------------------------
# N2 · NİYET, SONDA · P1. P-S11: seçmemiş ya da unutmuş dinleyiciye hazır cümle de hatırlatılır.
N2 = {'id': 'N2', 'kind': 'core', 'priority': 1, 'playOrder': 7, 'title': 'Niyet, sonda', 'clips': [
    clip('n2.hatirla', 'Başta seçtiğin niyeti ya da "Dinlenmeye izin veriyorum." cümlesini içinden üç kez '
         'söyleyebilirsin.', gap=(8.5, 14, 20), phase=D, texture='niyet-son', action='niyeti üç kez içinden söylemek'),
    clip('n2.x.his', 'Belki bu sözler bedende de küçük bir iz bırakıyor.', E, gap=(9, 12, 16), phase=D,
         rank=rk('n2.x.his'), texture='niyet-son'),
    clip('n2.dilek', 'Niyetin günün geri kalanında da seninle.', O, gap=(5, 7, 10), phase=D,
         rank=rk('n2.dilek'), texture='niyet-son', repeatOk=['niyet']),
]}

# ------------------------------------------------------------------------------------------------------------------
# KAPANIŞ (sabit kapak, TEK blok, T4; gündüz dönüşü). Sıra: nefes → parmaklar → gerinme → gözler → oda → yana dön → otur →
# bekle → kalk → son. Eylem payları (B2, T1, S4, T9): yana dönme 6, oturma 8, bekleme 12 sn (≈ üç nefes, Tran 2021).
K = 'Kapanış'
k_anahtar3 = clip('k.anahtar3', 'Dinleniyorsun; uyanıksın.', gap=(3, 3, 6), phase=D, key=3, texture='anahtar',
                  repeatOk=['dinle'])
k_donus = clip('k.donus', 'Artık dönüş zamanı.', gap=(2.5, 2.5, 4), phase=K,
               cue={'music': 'phase:kapanis', 'visual': 'dawn', 'voiceGain': 'ramp −3 → 0 dB, 4,5 sn (k.donus → k.nefes)'},
               texture='kapanis')
k_nefes = clip('k.nefes', 'Nefesin kendi olağan ritmine dönebilir.', gap=(5, 5, 8), phase=K, step='nefes',
               texture='kapanis')
k_sesler = clip('k.sesler', 'Odanın sesleri, dışarıdan gelenler de yeniden duyuluyor.', O, gap=(6, 6, 8), phase=K,
                rank=rk('k.sesler'), step='sesler', texture='kapanis')
# P-S12: parmaklar + gerinme ve gözler + oda birer klipte; eylem payı iki eylemin toplamı + 2 sn (T9, E.6 #1)
k_hareket = clip('k.hareket', 'El ve ayak parmaklarını oynatabilir, zorlamadan gerinebilirsin; ağrı olursa bırak.',
                 gap=(8, 8, 11), phase=K, step='parmak+gerin', texture='kapanis', mood='safety',
                 action='parmakları oynatmak ve gerinmek')
k_goz = clip('k.goz', 'Gözlerini ışığa alıştıra alıştıra açıp odada birkaç şeye bakabilirsin.', gap=(7, 7, 10),
             phase=K, cue={'music': 'chord'}, step='goz+oda', texture='kapanis', eyes='ışığa yavaş alışma',
             action='gözleri açıp odaya bakmak')
k_oda_ayrinti = clip('k.oda.ayrinti', 'Bir renk, bir biçim, bir doku.', O, gap=(8, 8, 10), phase=K,
                     rank=rk('k.oda.ayrinti'), step='oda', texture='kapanis')
k_zaman = clip('k.zaman', 'Saatin kaç olduğunu, nerede olduğunu hatırlayabilirsin.', O, gap=(4.5, 4.5, 7), phase=K,
               rank=rk('k.zaman'), step='oda', texture='kapanis', repeatOk=['olduğ'])
k_yan = clip('k.yan', 'Uzanıyorsan önce bir yanına dön.', gap=(6, 6, 8), phase=K, step='yan', texture='kapanis',
             mood='safety', repeatOk=['yanın'], action='yana dönmek')
k_yandakal = clip('k.yandakal', 'Bir süre yan yatarak dinlenebilirsin.', O, gap=(7, 7, 10), phase=K,
                  rank=rk('k.yandakal'), step='yan', texture='kapanis')
k_otur = clip('k.otur', 'Ellerinden destek alarak yavaşça doğrulup otur.', gap=(8, 8, 11), phase=K, step='otur',
              texture='kapanis', mood='safety', action='doğrulup oturmak')
k_bekle = clip('k.bekle', 'Kalkmadan önce birkaç nefes böyle kal. Başın dönerse biraz daha bekle.', gap=(12, 12, 16),
               phase=K, step='bekle', texture='kapanis', mood='safety', action='oturarak birkaç nefes beklemek')
# E7: kalkış daveti beklemeden SONRA gelir; güvenlik §11.B-14 gereği ders "Buradasın; uyanık ve dinlenmiş." ile biter.
k_son = clip('k.son', 'Sonra acele etmeden kalkabilirsin. Buradasın; uyanık ve dinlenmiş.', gap=(6, 6, 9), phase=K,
             cue={'music': 'fade:5s', 'visual': 'end'}, step='kalk', texture='kapanis', action='acele etmeden kalkmak')

KBLOCK = {'id': 'K', 'kind': 'closing', 'priority': 0, 'playOrder': 99,
          'title': 'Kapanış (tek kapak; isteğe bağlılar süreyle eklenir)',
          'clips': [k_anahtar3, k_donus, k_nefes, k_sesler, k_hareket, k_goz, k_oda_ayrinti, k_zaman,
                    k_yan, k_yandakal, k_otur, k_bekle, k_son]}

# "Kapanışa geç" düğmesi (PLAN B.5): o anki klip biter, bu hızlı kapanış çalar. Durdur (X): isteğe bağlı sesli dönüş.
# S10: odaya bakma (yönelim) adımı eklendi; B2/T1/E7: bekleme ve kalkış kısaltılmaz → süre 60–90 sn.
QUICK = {'id': 'K.hizli', 'kind': 'utility', 'title': '"Kapanışa geç" için hızlı kapanış',
         'cue': {'music': 'phase:kapanis', 'visual': 'dawn'},     # düğmeye basılınca motor uygular
         'clips': [k_nefes, k_hareket, k_goz, k_yan, k_otur, k_bekle, k_son]}
STOP = {'id': 'D.durdur', 'kind': 'utility', 'title': 'Durdur (X) sonrası isteğe bağlı 20–30 sn sesli dönüş',
        'clips': [clip('d.goz', 'Gözlerini aç, etrafına bak, acele etme.', gap=(4, 4, 5), phase=K, mood='safety',
                       step='goz', screen='Durdurma ekranı metniyle aynı'),
                  clip('d.kalk', 'Uzanıyorsan önce yana dön, sonra otur.', gap=(10, 10, 11), phase=K, mood='safety',
                       step='yan', screen='Durdurma ekranı metniyle aynı'),
                  clip('d.bekle', 'Birkaç nefes bekle; ardından kalkabilirsin.', gap=(2, 2, 2), phase=K,
                       mood='safety', step='bekle')]}

BLOCKS = [A, N1, C1, C2, BR, C3, BR_ORTA, C4, C5, N2, KBLOCK]


# ------------------------------------------------------------------------------------------------------------------
def finalize():
    # Kapanışın bütün sessizlikleri ve Varış'ın eylem payları (uzanma, konfor, gözler) sıkıştırılmaz (min = pref).
    # Varış'ın eylemsiz cümlelerinden sonraki nefes payları min..pref arasında esner: 5 dk'da kısa, uzun sürede ferah.
    for b in (KBLOCK, QUICK, STOP):
        for c in b['clips']:
            c['gapAfter']['min'] = c['gapAfter']['pref']
    for c in A['clips']:
        if c['tags'].get('action'):
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
            for j, a in enumerate(c.get('alternates') or [], 2):
                a['syllables'] = timing.syllables(a['text'])
                a['words'] = len(timing.words(a['text']))
                a['voice'] = {v: {'file': 'public/yoga/ders2/%s/%s.v%d.m4a' % (v, c['id'], j), 'sec': None}
                              for v in ('female', 'male')}
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
        # S11 + E10: açılış ekranı veriyle taşınır (güvenlik §8 Karar, §11.A, §11.E); ses ile ekran aynı cümleyi söyler
        'openingNotice': 'Araç ya da makine kullanırken dinleme.',
        'openingScreen': ['İstediğin an gözlerini açabilir, kıpırdayabilir ya da ara verebilirsin.',
                          'Araç ya da makine kullanırken dinleme.',
                          'Uzanarak yaptığın derslerden sonra önce yana dön, otur, sonra kalk.'],
        # P-S13: başlamadan önce hazırlık kartı; sesli konfor cümlesi (a.konfor) bunları "elinin altında" varsayar
        'preparationCard': ['İnce bir örtü', 'Dizlerinin altına bir yastık', 'Uzanabileceğin rahat bir yüzey'],
        'leadIn': G(3, 4, 6),
        'limits': {'silenceWindowMaxSec': 90, 'clipMaxSecAt6_6': 15, 'lastSecondsNoNewImage': 60},
        'planner': {
            'kural': ('T4: tek Varış ve tek Kapanış bloğu; zorunlu klipleri her sürede çalar, sessizlikleri sıkıştırılmaz '
                      '(min = pref). Kapakların isteğe bağlı klipleri çekirdektekiler gibi artımdır. Taban: bütün P1 '
                      'bloklar zorunlu klipleriyle (+ köprüler, minTarget\'i dolan zorunlular). Artımlar entryRank/fillRank '
                      'sırasıyla: sessizlikler pref iken sığıyorsa eklenir; T5: mevcut içerik sessizlikler pref→max '
                      'aralığının yarısına (f=0,5) esnetildiğinde bile hedefe yetmiyorsa, en kısa haliyle sığan artım yine '
                      'eklenir; ilk sığmayanda durulur (önek kuralı ⇒ plan(T) ⊆ plan(T+1)). Sessizlik min→pref→max oranla '
                      'esner. Kalan süre max toplamını aşarsa içerik hatası (sessizlik sınırı aşılmaz). Bağlı çiftlerde '
                      '(pairWith) ortak klip hemen ardından çalıyorsa aradaki boşluk pairGap olur (P-S6).'),
            'stretchCapBeforeIncrement': timing.STRETCH_CAP_BEFORE_INCREMENT,
            'entryRanks': ENTRY,
            'p1DropOrder': ['C2', 'N2', 'N1'],   # yalnız acil durum: taban min'de bile sığmazsa (C1 hiç düşmez)
            'variants': 'P-N5: alternates varsa seçenek = oturum sayısı mod (1 + seçenek sayısı); belirlenimci, '
                        'kaldığın yer kaydına variantIndex olarak yazılır (CRITIQUE #30).',
        },
        'timingModel': {
            'articulationSyllPerSec': timing.RATES,
            'pauseProfilesSec': timing.PROFILES, 'pauseScaleAtRate': {str(k): v for k, v in
                                                                      timing.SPEED_PAUSE_SCALE.items()},
            'edgeSec': timing.EDGE, 'edgeMicroSec': timing.EDGE_MICRO,
            'note': 'VARSAYIM; 2026-09-28 ölçümleriyle kalibre (hiz/*.mp3). Gerçek klip süreleri gelince voice.*.sec kullanılır.',
        },
        'voicePhaseGainDb': {'Varış': 0.0, 'Derinleşme': -1.5, 'Derin': -3.0, 'Kapanış': 0.0,
                             'kapanisGecisi': 'k.donus başından k.nefes başına ≈ 4,5 sn doğrusal rampa (S18; basamak yok)'},
        'music': {'bpmFeel': 50, 'key': 'Mi♭ majör pad + alçak yaylılar + seyrek uzak piyano (VARSAYIM)',
                  # S4-hoca: evre geçişleri ses ve görselle aynı klipte (n1.sec: derinleşme, c2.dikkat: derin, k.donus: kapanış)
                  'phases': ['varis', 'derinlesme (Varış yatağı, −1,5 dB ek kısma)', 'derin', 'kapanis'],
                  'duckDefault': True,
                  # P-B3: yatak ses evresini izler; konuşma − yatak >= 15 dB her evrede (qa.py, 3 sn kısa süreli LUFS)
                  'duckedBedLufs': {'Varış': -33.0, 'Derinleşme': -34.5, 'Derin': -36.0, 'Kapanış': -33.0},
                  'windowBedAboveDuckDb': 6.0,
                  'swellOnlyInAnnouncedWindowsMinSec': 20,
                  'returnTone': 'P-S10: her pencere sonrası karşılama klibinden 2 sn önce aynı yumuşak dönüş tınısı (VARSAYIM)',
                  'endFadeSec': 5,
                  # S12: su herkese iyi gelmeyebilir (güvenlik §11.B-10) → varsayılan doğa katmanı su içermez
                  'nature': {'default': 'uzak, yumuşak rüzgâr ve yaprak dokusu (su yok; VARSAYIM)',
                             'waterLayer': {'available': True, 'defaultOn': False,
                                            'note': 'kullanıcı açarsa uzak su; kıyı seçenlere öneri olarak gösterilebilir'}},
                  'speechClarityOption': 'P-B3: "Konuşma netliği" ayarı yatağı 6 dB daha kısar (VARSAYIM)'},
        'visual': {'form': 'ufuk çizgisi', 'phases': ['varis', 'derinlesme', 'derin', 'kapanis(şafak)'],
                   # S18: sayılardaki nabız, profilde ışığa duyarlı nöbet cevabı "evet/emin değilim" ise çalmaz
                   # (lib/profile.js:198 flashSafe === false; d515702'de okundu)
                   'pulse': {'respectFlashSafe': True, 'whenFlashSafeFalse': 'nabız yok, yalnız çok yavaş opaklık'},
                   # N8 + S18: şafak 60–90 sn, başlangıcı max(k.donus, son − 90 sn); rampa >= 60 sn; parlaklık tavanı
                   'dawn': {'startRule': 'max(k.donus.start, end - 90)', 'spanSec': [60, 90], 'minRampSec': 60,
                            'dawnMaxLuminance': 'bağıl %15 (PLAN E.2 tavanı; VARSAYIM)'}},
        'qa': {'carrierJoinF0StepSemitones': 2.0,
               'carrierJoinNote': 'P-S15: taşıyıcı sınırındaki F0 sıçraması, taşıyıcı içi öğe-öğe medyanına göre <= 2 yarım '
                                  'ton (VARSAYIM); aşarsa yeniden üretim ya da kesim sırası değişir. REST\'te previous_text/next_text.',
               'speechOverBedDbMin': 15.0,
               'speechOverBedNote': 'P-B3: her evrede ayrı ölçülür: konuşma − kısık yatak >= 15 dB, 3 sn kısa süreli LUFS '
                                    '(VARSAYIM); pencerede yatak kısığın +6 dB üstünde.',
               'derinClipRateCeil': timing.DERIN_CLIP_RATE_CEIL},
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
