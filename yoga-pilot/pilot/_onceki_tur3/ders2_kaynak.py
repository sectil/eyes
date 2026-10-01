#!/usr/bin/env python3
"""Ders 2 · Derin Dinlenme (Yoga Nidra) · metnin TEK kaynağı (3. tur).

Bu dosya dersin bütün sözlerini, boşluklarını, ipuçlarını ve planlayıcı sıralarını tutar; ders2.lesson.json ve
ders2.script.md buradan üretilir (elle düzenlenmez). Hece sayıları kodla sayılır (Türkçe ünlüler a e ı i o ö u ü â î û).
Çalıştırma: python3 ders2_kaynak.py   → ders2.lesson.json + timing.out.txt + ders2.script.md
3. turun bulgu karşılıkları: fixlog.md ("Tur 3" tablosu). Kimlikler (TR2-, G2-, H, EV2-, Z2-, L2-) yorumlarda geçer.
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import timing  # noqa: E402  (aynı süre modeli ve planlayıcı)

VERSION = 'pilot-3 (2026-09-29)'
R, O, E = 'required', 'optional', 'extension'


def G(a, b, c):
    return {'min': float(a), 'pref': float(b), 'max': float(c)}


CARRIERS = []
SCENES = ('kiyi', 'orman')


def clip(cid, text, tier=R, gap=(3, 4, 6), phase=None, cue=None, rank=None, group=None, requires=None,
         minTarget=None, window=None, alternates=None, pair=None, scenes=None, **tags):
    c = {'id': cid, 'text': text, 'tier': tier, 'gapAfter': G(*gap) if not window else G(*window),
         'phase': phase, 'cue': cue or {}, 'tags': tags}
    if pair:            # P-S6: bağlı çift; ortak klip hemen ardından çalıyorsa aradaki boşluk kısa (pairGap)
        c['pairWith'], c['pairGap'] = pair[0], G(*pair[1])
    if alternates:      # P-N5: dönüşümlü seçenek metinleri (oturum sayısına göre belirlenimci)
        c['alternates'] = [{'text': t} for t in alternates]
    if scenes:          # H6/L2-04: sahne seçici (başlamadan önce "Kıyı / Orman"); anahtar yoksa ana metin çalar
        c['scenes'] = {k: {'text': v} for k, v in scenes.items()}
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


def carrier(car_id, items, period=(2.4, 2.7, 3.2), section=None, texture=None, last_final=True, ranks=None,
            gaps=None, note='', lead=''):
    """items: (id, söz, katman, grup). Taşıyıcı tek TTS isteğidir; öğeler üç noktadaki duraklardan kesilir.
    L2-08/Z2-07: öğeler BAŞLANGIÇTAN BAŞLANGICA periyotla (onsetPeriod) çalar; sessizlik = periyot − gerçek süre (en az
    gapFloor). `gaps` içindeki öğeler (bölüm sonu, bilinçli durak) sabit gapAfter taşır.
    lead: TTS'e taşıyıcının başında giden ama kesilip atılan ön söz (T17)."""
    out = []
    n = len(items)
    texts = []
    for i, it in enumerate(items):
        cid, word, tier, grp = (list(it) + [None])[:4]
        last = (i == n - 1)
        shown = word + ('.' if (last and last_final) else '…')
        texts.append(shown)
        fixed = (gaps or {}).get(cid)
        c = clip(cid, shown, tier, fixed or (1, 1.5, 2.8), rank=(ranks or {}).get(grp) if tier != R else None,
                 group=grp, section=section, texture=texture)
        if not fixed:
            c['onsetPeriod'] = G(*period)
            c['gapFloor'] = timing.GAP_FLOOR
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
RANK = {
    # dalga 1: sayma turu (6. dk'dan), ağırlığın zemine bırakılışı (H5), kontrol cümlesi, parmaklar, kontrol cümleleri
    'c2.yer': 85, 'c2.alt': 86, 'sayi5': 90, 'a.agirlik': 95, 'a.karar': 105, 'parmak': 110, 'c1.tekrar': 130, 'n1.birak': 140,
    'c1.kacirma': 145, 'k.yandakal': 160,
    # dalga 2: bacaklar, elin ayrıntısı, sırt (+ bölge işareti, L2-09), ondan geri sayma, niyet dileği, kapak ayrıntıları
    'bacak': 210, 'el': 215, 'sirt': 220, 'sayi10': 225, 'n2.dilek': 240, 'a.konfor': 250,
    'k.sesler': 260, 'k.zaman': 270, 'k.oda.ayrinti': 280, 'c2.durak': 285,
    # bütün-beden doruğu imgeden hemen önce (T5: C4'ün büyük girişinden önce 13. dakika aşırı esnemesin)
    'butun': 290, 'yuz1': 292, 'a.x.kipir': 294, 'c2.x.ritim': 296, 'n2.x.his': 298,
    # imgeleme girer (C4 300); H2: adım (ayak tabanları) hemen ardından; zıtlıkların çekirdeği girer (C3 315, H13)
    'c4.adim': 305, 'c4.koku': 310, 'c3.gelmezse': 316, 'c4.pencere': 320, 'c4.x.istemiyor': 330, 'c4.acele': 340,
    # dalga 4: yüzün üstü (+ bölge işareti), dinlenme yeri (H2: artık isteğe bağlı), geride kalan sesler, ılık taş
    'c4.yerles': 420, 'c4.geride': 440, 'x.tas': 450,
    # dalga 5: sıcaklık ve serinlik (H13: zıtlığın ikinci dalgası), ayrıntılar
    'c3.sicakserin': 505, 'c3.zemin': 510, 'ayak': 520, 'c4.iz': 530, 'c3.nefeskadar': 540, 'c3.x.ikisi1': 545,
    'yuz2': 550, 'c3.fincan': 560, 'c3.pencere': 580, 'c3.x.ikisi2': 585, 'yuz3': 590,
    # tanıklık girer (C5 700)
    'c5.pencere': 705, 'c5.genis': 720,
    # genişletmeler (CRITIQUE #3, T2): bütün isteğe bağlılardan sonra
    'x.saymak': 1010, 'temas': 1030, 'x.agir2': 1040, 'x.hafif2': 1045,
    'c4.isik': 1050, 'x.sicak': 1060, 'c4.x.golge': 1065, 'c4.x.gok': 1075, 'c4.ruzgar': 1080,
    'c4.x.yaklas': 1085, 'c5.x.hepsi': 1090, 'c4.x.donus2': 1095, 'x.serin': 1100, 'c3.x.hepsi': 1105,
    'c5.x.dayanak': 1110, 'c5.x.yumusak': 1115, 'c5.x.oldugu': 1120, 'c5.x.sessizlik': 1125,
}
ENTRY = {'C4': 300, 'C3': 315, 'C5': 700}


def rk(key):
    return RANK[key]


# ------------------------------------------------------------------------------------------------------------------
# VARIŞ (sabit kapak; TEK blok). Sıra (H17): karşılama → derse özgü açılış → duruş → [konfor] → gözler → [kıpırdanıp
# yerleşme] → [ağırlık] → [kontrol] → ortak çıkış cümlesi → huzursuzluk normaldir. 5 dakikanın sırası değişmedi.
# TR2-03: ortak çıkış cümlesi (a.izin) üç "-(y)abil-" taşır; çevresindeki 60 sn'de başka "-(y)abil-" yoktur: duruş
# "-man yeterli", gözler "sana kalmış", ağırlık isim cümlesi, kontrol şimdiki zaman, huzursuzluk geniş zaman.
V = 'Varış'
a_hosgeldin = clip('a.hosgeldin', 'Hoş geldin; bu dakikalar senin.', gap=(1, 2, 3), phase=V,
                   cue={'visual': 'phase:varis', 'music': 'phase:varis'}, texture='varis')
a_acilis = clip('a.acilis', 'Yapman gereken hiçbir şey yok; yalnızca dinlenmek var.', gap=(2.5, 5, 7),
                phase=V, texture='varis', uniqueOpening=True,
                alternates=['Bir şey başarman gerekmiyor; yalnızca dinlenmek var.',
                            'Bir yere yetişmen gerekmiyor; yalnızca dinlenmek var.'])
# TR2-06 + TR2-03 + H8(4): "yan yatarak uzanmak" yinelemesi ve eş olmayan üç seçenek gitti
a_durus = clip('a.durus', 'Sırtüstü ya da yan, sana en rahat gelen biçimde uzanman yeterli.', gap=(8, 8, 12),
               phase=V, texture='varis', action='uzanmak')
a_konfor = clip('a.konfor', 'Üstünde ince bir örtü, dizlerinin altında bir yastık iyi olur.', O,
                gap=(10, 10, 14), phase=V, rank=rk('a.konfor'), texture='varis', action='örtü ve yastık (elinin altında)')
# TR2-03: "-abil-"siz; G2-13'ün göz rahatlığı bakışı serbest bırakan cümle olarak br.orta'da
a_gozler = clip('a.gozler', 'Gözlerini kapatmak ya da bir noktaya yumuşakça bakmak sana kalmış.',
                gap=(4, 4, 7), phase=V, texture='varis', eyes='baskı yok; yumuşak bakış', eyesOpen=True,
                action='gözleri kapatmak ya da yumuşak bakış')
a_kipir = clip('a.x.kipir', 'Bir iki kez kıpırdanıp yerleşmek de dinlenmenin bir parçası.', O, gap=(6, 6, 9), phase=V,
               rank=rk('a.x.kipir'), texture='varis', action='kıpırdanıp yerleşmek')
# H5: ağırlık-zemin yerleşmesi 6–7. dakikadan itibaren; dersin tarafsız dayanağı ("zemin") imgeden önce kurulur
a_agirlik = clip('a.agirlik', 'Bedeninin bütün ağırlığı zeminde.', O, gap=(8, 8, 12), phase=V,
                 rank=rk('a.agirlik'), texture='varis', action='ağırlığı zemine bırakmak', anchor='zemin')
# TR2-14: geniş zamanın "sen bilirsin" yankısı yerine şimdiki zaman
a_karar = clip('a.karar', 'Ne kadar gevşeyeceğine sen karar veriyorsun.', O, gap=(6, 7, 9), phase=V,
               rank=rk('a.karar'), texture='varis', safety='control', repeatOk=['gevşe'])
# G2-03: "ara verebilirsin" (duraklatıp sürdürme) yerine dersi bütünüyle bitirme izni; ekran ile ses aynı
a_izin = clip('a.izin', 'İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin.', gap=(3, 6, 8),
              phase=V, texture='varis', safety='opening', eyesOpen=True, repeatOk=['gözle'])
# TR2-07: resmî "sakınca" yerine en sıcak söz; TR2-03 gereği geniş zaman ("olmaz")
a_kolay = clip('a.kolay', 'Gevşemek her zaman kolay olmaz; bunda yanlış bir şey yok.', gap=(3, 9, 11), phase=V,
               texture='varis', safety='normalize', normalize=True, repeatOk=['gevşe'])

A = {'id': 'A', 'kind': 'arrival', 'priority': 0, 'playOrder': 0, 'title': 'Varış (tek kapak; isteğe bağlılar süreyle eklenir)',
     'clips': [a_hosgeldin, a_acilis, a_durus, a_konfor, a_gozler, a_kipir, a_agirlik, a_karar, a_izin, a_kolay]}

# ------------------------------------------------------------------------------------------------------------------
# N1 · NİYET, BAŞTA · P1. TR2-04: hazır niyet "Kendime dinlenme izni veriyorum." (yararlanıcısız "-meye izin vermek"
# çevirisi gitti). TR2-03 + H11: N1'de "-(y)abil-" yok; şimdiki zamanla rehberlik (PLAN C.1).
D1 = 'Derinleşme'
ORNEK = 'Aklına bir şey gelmezse önerim şu: "Kendime dinlenme izni veriyorum."'
N1 = {'id': 'N1', 'kind': 'core', 'priority': 1, 'playOrder': 1, 'niyet': True, 'title': 'Niyet, başta (ekranda: sankalpa)',
      'screenLabel': 'Niyet (sankalpa)', 'clips': [
    # H1(b): seçim ve hazır cümle tek klipte (her sürede; önek kuralı). Seçme süresi klibin ardındaki sessizliktir.
    clip('n1.sec', 'Kendine bugün için kısa bir niyet seçiyorsun. ' + ORNEK, gap=(8, 10, 15),
         phase=D1, cue={'visual': 'phase:derinlesme', 'music': 'phase:derinlesme'}, texture='niyet',
         action='niyeti seçmek', tts='tırnak içi hafif vurgulu; iki noktadan sonra doğal durak',
         alternates=['Bugün için kısa bir niyet cümlesi seçiyorsun. ' + ORNEK,
                     'Bugünkü niyetin için kısa bir cümle seçiyorsun. ' + ORNEK]),
    clip('n1.soyle', 'Şimdi niyetini içinden üç kez söylüyorsun.', gap=(8, 13, 20), phase=D1, texture='niyet',
         action='niyeti üç kez içinden söylemek', repeatOk=['niyet']),
    # EV2-03: gelecek güvencesi yerine doğru bir söz (N2 her sürümde çalar)
    clip('n1.birak', 'Dersin sonunda niyetini hatırlatacağım. O zamana kadar ona tutunman gerekmiyor.', O,
         gap=(6, 6.5, 8), phase=D1, rank=rk('n1.birak'), texture='niyet', repeatOk=['niyet']),
]}

# ------------------------------------------------------------------------------------------------------------------
# C1 · BEDEN DOLAŞIMI (sağ → sol → arka → ön → [temas] → bütün) · P1
END = (2, 3, 4.5)
c1_clips = [
    # TR2-03 + H12: iki kısa cümle; atlama kapısı güvenlik gereği emir kipiyle (güvenlik §11.B-1, -9)
    clip('c1.cerceve', 'Saydığım her yeri fark edersin. Seni rahatsız eden bir yer olursa onu atla.',
         gap=(2.5, 3, 4), phase=D1, texture='dolasim-uzuv', safety='skip', mood='safety'),
    # TR2-08: bir yer tekrarlanmaz, adı tekrarlanır
    clip('c1.tekrar', 'Her adı içinden tekrarlaman yeterli; başka bir çabaya gerek yok.', O, gap=(3, 3.5, 4.5),
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
            ('s27', 'bütün sağ taraf', O, 'ayak')],
}
side_items['sol'] = [(('l' + i[0][1:]), i[1].replace('Sağ elin', 'Sol elin').replace('belin sağ yanı', 'belin sol yanı')
                      .replace('bütün sağ taraf', 'bütün sol taraf')) + tuple(i[2:]) for i in side_items['sag']]
chunks = [(0, 5), (5, 10), (10, 14), (14, 20), (20, 27)]
for side, pre in (('sag', 's'), ('sol', 'l')):
    items = [('c1.' + it[0],) + tuple(it[1:]) for it in side_items[side]]
    if side == 'sol':
        c1_clips.append(clip('c1.kacirma', 'Bir adı kaçırırsan bir sonrakiyle devam edersin.', O,
                             gap=(2.5, 3, 4.5), phase=D1, rank=rk('c1.kacirma'), texture='dolasim-uzuv', normalize=True))
    for k, (a, b) in enumerate(chunks):
        part = items[a:b]
        c1_clips += carrier('car.%s%d' % (side, k + 1), part, section=side, texture='dolasim-uzuv',
                            last_final=(b == 27), ranks=RANK,
                            gaps={'c1.%s20' % pre: END, 'c1.%s27' % pre: END})
# L2-09: bölge işaretleri (bölgenin uzun listesi çaldığında; 5 dakikada sırt tek nokta, ön üç nokta)
c1_clips.append(clip('c1.gecis.arka', 'Bedenin arka tarafı.', O, gap=(1.5, 2, 3), phase=D1, rank=rk('sirt'),
                     group='sirt', section='sirt', texture='dolasim-govde', region=True, repeatOk=['beden']))
c1_clips += carrier('car.sirt', [('c1.b01', 'Sağ kürek kemiği', O, 'sirt'), ('c1.b02', 'sol kürek kemiği', O, 'sirt'),
                                 ('c1.b03', 'bel boşluğu', O, 'sirt'), ('c1.b04', 'omurga, boydan boya', R),
                                 ('c1.b05', 'bütün sırt', O, 'sirt')],
                    section='sirt', texture='dolasim-govde', ranks=RANK, gaps={'c1.b04': END, 'c1.b05': END})
c1_clips.append(clip('c1.gecis.on', 'Yüz ve bedenin önü.', O, gap=(1.5, 2, 3), phase=D1, rank=rk('yuz1'),
                     group='yuz1', section='on', texture='dolasim-govde', region=True, repeatOk=['beden']))
c1_clips += carrier('car.on1', [('c1.f01', 'başın tepesi', O, 'yuz1'), ('c1.f02', 'alın', R),
                                ('c1.f03', 'sağ şakak', O, 'yuz1'), ('c1.f04', 'sol şakak', O, 'yuz1'),
                                ('c1.f05', 'sağ kaş', O, 'yuz1'), ('c1.f06', 'sol kaş', O, 'yuz1')],
                    section='on', texture='dolasim-govde', last_final=False, ranks=RANK)
c1_clips += carrier('car.on2', [('c1.f07', 'göz kapakları', R), ('c1.f08', 'gözlerin çevresi', O, 'yuz2'),
                                ('c1.f09', 'sağ kulak', O, 'yuz2'), ('c1.f10', 'sol kulak', O, 'yuz2'),
                                ('c1.f11', 'sağ yanak', O, 'yuz2'), ('c1.f12', 'sol yanak', O, 'yuz2'),
                                ('c1.f13', 'burnun ucu', O, 'yuz2')],
                    section='on', texture='dolasim-govde', last_final=False, ranks=RANK)
# T17: "karın" cümle sonunda emir kipi gibi okunabilir → taşıyıcı üç noktayla, liste ezgisiyle biter.
# G2-06: göğüs ve karın komşularıyla aynı periyotta; bölüm sonu durağı bir sonraki bütün-beden öğesine düşer.
# L2-08: çene 5 dakikanın zorunlu listesinden çıktı (ön: alın, göz kapakları, göğüs); ritim her öğede aynı.
c1_clips += carrier('car.on3', [('c1.f14', 'üst dudak', O, 'yuz3'), ('c1.f15', 'alt dudak', O, 'yuz3'),
                                ('c1.f16', 'çene', O, 'yuz3'), ('c1.f17', 'boyun', O, 'yuz3'),
                                ('c1.f18', 'sağ köprücük kemiği', O, 'yuz3'),
                                ('c1.f19', 'sol köprücük kemiği', O, 'yuz3'), ('c1.f20', 'göğüs', R),
                                ('c1.f21', 'karın', O, 'yuz3')],
                    section='on', texture='dolasim-govde', last_final=False, ranks=RANK)
# 3. tur: önceki turların "aynı yoldan kısa ikinci tur" genişletmesi (c1.t2*) çıkarıldı. Sıranın en sonundaydı ve bu
# turun 156 planının hiçbirinde (sarsıntı taramasının x0,90 ucunda da) 30 dakikaya sığmıyordu; üstelik 30 dakikanın en
# uzun liste dokusunu (C1) daha da uzatırdı (L2-09). Hiç çalmayan metin üretilip denetlenmez.
# genişletme: temas noktaları; TR2-15/H16: "zemin" tek dayanak sözcüğü, "yaslanmak" yerine "taşımak"
temas_open = clip('c1.x01', 'Bir de zemine değen noktalar.', E, gap=(2.5, 3, 4.5), phase=D1,
                  rank=rk('temas'), group='temas', section='temas', texture='temas')
temas_items = carrier('car.temas', [('c1.x02', 'Topuklar', E, 'temas'), ('c1.x03', 'baldırlar', E, 'temas'),
                                    ('c1.x04', 'kalçalar', E, 'temas'), ('c1.x05', 'kürek kemikleri', E, 'temas'),
                                    ('c1.x06', 'başın arkası', E, 'temas')],
                      period=(2.8, 3.2, 4.0), section='temas', texture='temas', ranks=RANK)
temas_close = clip('c1.x07', 'Zemin her birini taşıyor.', E, gap=(4, 6, 9), phase=D1,
                   rank=rk('temas'), group='temas', section='temas', texture='temas', anchor='zemin',
                   repeatOk=['zemin'])
c1_clips += [temas_open] + temas_items + [temas_close]
# TR2-21: "birden" (ansızın) yerine kanonik "her iki"
c1_clips += carrier('car.butun', [('c1.w01', 'Bütün sağ bacak', O, 'butun'), ('c1.w02', 'bütün sol bacak', O, 'butun'),
                                  ('c1.w03', 'her iki bacak', O, 'butun'), ('c1.w04', 'bütün sağ kol', O, 'butun'),
                                  ('c1.w05', 'bütün sol kol', O, 'butun'), ('c1.w06', 'her iki kol', O, 'butun'),
                                  ('c1.w07', 'baştan ayağa bütün beden', R), ('c1.w08', 'bütün beden', O, 'butun'),
                                  ('c1.w09', 'bütün beden', O, 'butun')],
                    period=(2.6, 3.0, 3.8), section='butun', texture='dolasim-butun', ranks=RANK,
                    gaps={'c1.w07': END, 'c1.w08': (2.5, 3.5, 5), 'c1.w09': (2.5, 3.5, 5)},
                    note='Son üç öğe bilinçli tekrar: aynı sözcük, giderek yumuşayan söyleyiş.')
c1_clips.append(clip('c1.k1', 'Bedenin dinlenebilir; sen uyanık kalıyorsun.', gap=(5, 7, 12), phase=D1,
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
# Z2-07: sayıların aralığı başlangıçtan başlangıca periyot (5,8 / 6,0 / 6,3 sn); sessizlik = periyot − gerçek süre
say = carrier('car.sayi', [('c2.n10', 'on', O, 'sayi10'), ('c2.n09', 'dokuz', O, 'sayi10'), ('c2.n08', 'sekiz', O, 'sayi10'),
                           ('c2.n07', 'yedi', O, 'sayi10'), ('c2.n06', 'altı', O, 'sayi10'), ('c2.n05', 'beş', O, 'sayi5'),
                           ('c2.n04', 'dört', O, 'sayi5'), ('c2.n03', 'üç', O, 'sayi5'), ('c2.n02', 'iki', O, 'sayi5'),
                           ('c2.n01', 'bir', O, 'sayi5')],
              period=(5.8, 6.0, 6.3), section=None, texture='geri-sayma', gaps={'c2.n01': (5, 7, 9)}, ranks=RANK,
              lead='sayıyorum:',
              note='CRITIQUE #12: sayılar tek başına üretilmez; bu taşıyıcı tek istekte üretilip kesilir. Kısa sürüm '
                   '"beş"ten başlar; altı..on tek grup olarak birlikte girer.')
for c in say:
    n = int(c['id'][-2:])
    c['phase'] = D
    c['cue'] = {'visual': 'pulse', 'breath': {'count': n}}
    c['tags']['micro'] = 'number'
    if n > 5:
        c['requires'] = ['c2.n05']
C2 = {'id': 'C2', 'kind': 'core', 'priority': 1, 'playOrder': 3, 'title': 'Nefes farkındalığı ve geri sayma',
      'clips': [
          # G2-01 + L2-01 + H11: nefese bakan her sürümde, aynı klipte nefes dışı dayanak (eller) ve gözleri açma kapısı;
          # "zor gelirse" yok (H15, L2-06), "-(y)abil-" yok (H11). Müzik, görsel ve ses "Derin" evreye burada geçer.
          clip('c2.dikkat', 'Şimdi nefesini değiştirmeden izlemek yeterli. '
               'Ellerini hissetmek ya da gözlerini açmak da olur.', gap=(8, 10, 14), phase=D,
               cue={'visual': 'phase:derin', 'music': 'phase:derin'}, texture='nefes', safety='anchor', anchor='eller',
               eyesOpen=True),
          # TR2-12 + H7: nefesle kalana seslenir; eller seçene c2.alt hemen ardından yer açar (ikisi tek grup)
          clip('c2.yer', 'Nefesle kalıyorsan onu en net fark ettiğin yeri bulabilirsin. Burun, göğüs, karın ya da başka '
               'bir nokta.', O, gap=(11, 14, 19), phase=D, rank=rk('c2.yer'), texture='nefes',
               repeatOk=['nefes']),
          clip('c2.alt', 'Ellerle kalıyorsan avuçlarını hissedebilirsin.', O, gap=(9, 10, 13), phase=D,
               rank=rk('c2.alt'), requires=['c2.yer'], texture='nefes', safety='anchor', anchor='eller',
               repeatOk=['kalıy']),
          # H1(a): 5–6 dakikada C2 = dikkat → akış (iki satır birbirini iptal etmez); "hiçbir şey yapmadan" 7 dk'dan
          clip('c2.akis', 'Nefes kendiliğinden geliyor. Kendiliğinden gidiyor.', gap=(9, 12, 18), phase=D,
               texture='nefes', repeatOk=['kendi', 'nefes']),
          # H12: "onu" düştü; S14: veriş sonu durağı uzatılmaz
          clip('c2.durak', 'Nefes verdikten sonra küçük bir duraklama olabilir. Uzatmaya gerek yok.', O,
               gap=(11, 14, 19), phase=D, rank=rk('c2.durak'), texture='nefes', repeatOk=['nefes']),
          clip('c2.sayac', 'Geriye doğru sayacağım. Nefes sayılara uymak zorunda değil.', O, gap=(2.5, 3, 4),
               phase=D, rank=rk('sayi5'), group='sayi5', texture='geri-sayma', repeatOk=['nefes']),
      ] + say + [
          # TR2-22 + G2-02 + H12: "bir turu saymak" ve belirsiz "baştan" gitti; duyuru bir kapı taşır (gözler açık
          # kalabilir; "zor gelirse" yok); üç kısa cümle
          clip('c2.x.kendin', 'Bu kez sen içinden, kendi hızında ondan bire sayabilirsin. Bire varınca tekrar ondan '
               'başlarsın. Gözlerin açık kalsa da olur; sonra yine seslenirim.', E, phase=D, rank=rk('x.saymak'),
               group='x.saymak', window=(50, 50, 60), cue={'visual': 'window', 'music': 'swell'}, texture='sessiz-sayma',
               announce=True, safety='door', eyesOpen=True),
          clip('c2.x.donus', 'Yeniden buradayım. Hangi sayıda kaldığın önemli değil.', E, gap=(4, 5, 7), phase=D,
               rank=rk('x.saymak'), group='x.saymak', requires=['c2.x.kendin'], texture='nefes', welcome=True,
               cue={'music': 'returnTone:-2s'}, repeatOk=['sayın', 'sayıl']),
          # H7: sayıları bırakma, sayım biter bitmez (pencerenin karşılamasından hemen sonra); TR2-13
          clip('c2.birak', 'Sayıları bırakabilirsin. Zihnin arada başka yerlere kaydıysa o da olur.', O, gap=(5, 6, 8),
               phase=D, rank=rk('sayi5'), group='sayi5', texture='nefes', normalize=True, repeatOk=['sayın', 'sayıl']),
          clip('c2.x.ritim', 'Nefes kendi ritminde sürüyor. Onu ayarlaman gerekmiyor.', O, gap=(10, 14, 20), phase=D,
               rank=rk('c2.x.ritim'), texture='nefes', repeatOk=['nefes']),
          # H1(a): açılış cümlesine geri çağrı ("yalnızca dinlenmek var"); 7 dk'dan itibaren
          clip('c2.kal', 'Bir süre hiçbir şey yapmadan dinlenmek var.', gap=(12, 16, 20), phase=D,
               minTarget=420, texture='nefes', repeatOk=['dinle']),
      ]}

# ------------------------------------------------------------------------------------------------------------------
# KÖPRÜ · anahtar cümlenin ikinci geçişi. H3: yalnız C3 ya da C4 seçiliyse (aralarında bir blok varken) çalar.
# G2-08: durum iddiası yok ("dinleniyor" yerine "dinlenebilir").
BR = {'id': 'BR.K2', 'kind': 'bridge', 'placement': {'after': 'C2'}, 'requiresAnyBlock': ['C3', 'C4'],
      'priority': 0, 'playOrder': 0,
      'title': 'Köprü: anahtar cümle (2. geçiş), nefes bloğunun hemen ardından (C3 ya da C4 varsa)',
      'clips': [clip('br.k2', 'Beden dinlenebilir; sen uyanıksın.', gap=(11, 12, 14), phase=D, key=2,
                     texture='anahtar', repeatOk=['dinle'])]}

# S1 + G2-03 + G2-13 + H12 + L2-06 + TR2-10: imgeden hemen önce kapı ve dayanak. "Hatırlatayım:" yok; dersi bitirme
# izni; açık gözün bakışı serbest; dayanak zor bir anı öngörmeden kurulur (öznesiz koşul da gitti).
BR_ORTA = {'id': 'BR.orta', 'kind': 'bridge', 'placement': {'before': 'C4'}, 'priority': 0, 'playOrder': 0,
           'title': 'Köprü: çıkış kapısı ve dayanak, imgelemeden hemen önce (C4 olan her sürüm)',
           'clips': [clip('br.orta', 'İstediğin an gözlerini açmak ya da dersi bitirmek senin elinde. Gözlerin '
                          'açıksa bakışın serbest. Zemin hep seni taşıyor.',
                          gap=(12, 13, 15), phase=D, texture='kapi', safety='mid', eyesOpen=True, anchor='zemin',
                          repeatOk=['gözle'])]}

# ------------------------------------------------------------------------------------------------------------------
# C3 · ZITLIK ÇİFTLERİ · P3. H13: çekirdek (ağırlık/hafiflik) 315'te girer; sıcaklık/serinlik ikinci dalga (505).
agir = carrier('car.agir', [('c3.a1', 'Kollar ağır', R), ('c3.a2', 'bacaklar ağır', R), ('c3.a2b', 'sırt ağır', E, 'x.agir2'),
                            ('c3.a2c', 'omuzlar ağır', E, 'x.agir2'), ('c3.a3', 'bütün beden ağır', R)],
               period=(3.4, 4.4, 6.0), texture='zitlik-agir', gaps={'c3.a3': (6, 9, 13)}, ranks=RANK,
               note='Bilinçli koşut yapı; üç öğe aynı ezgiyle.')
hafif = carrier('car.hafif', [('c3.h1', 'Kollar hafif', R), ('c3.h2', 'bacaklar hafif', R), ('c3.h2b', 'sırt hafif', E, 'x.hafif2'),
                              ('c3.h2c', 'omuzlar hafif', E, 'x.hafif2'), ('c3.h3', 'bütün beden hafif', R)],
                period=(3.4, 4.4, 6.0), texture='zitlik-agir', gaps={'c3.h3': (6, 9, 13)}, ranks=RANK)
sicak = carrier('car.sicak', [('c3.s1', 'Avuç içleri sıcak', E, 'x.sicak'), ('c3.s2', 'ayak tabanları sıcak', E, 'x.sicak'),
                              ('c3.s2b', 'sırt sıcak', E, 'x.sicak'), ('c3.s3', 'bütün beden sıcak', E, 'x.sicak')],
                period=(3.4, 4.4, 6.0), texture='zitlik-sicak', gaps={'c3.s3': (6, 8, 12)}, ranks=RANK)
serin = carrier('car.serin', [('c3.r1', 'Yanaklar serin', E, 'x.serin'), ('c3.r2', 'burnun ucu serin', E, 'x.serin'),
                              ('c3.r2b', 'eller serin', E, 'x.serin'), ('c3.r3', 'bütün beden serin', E, 'x.serin')],
                period=(3.4, 4.4, 6.0), texture='zitlik-sicak', gaps={'c3.r3': (6, 8, 12)}, ranks=RANK)
for c in agir + hafif + sicak + serin:
    c['phase'] = D
    c['tags']['repeatOk'] = ['bütün', 'beden']
for c in sicak:
    c['requires'] = ['c3.sicak']
for c in serin:
    c['requires'] = ['c3.serin']
C3 = {'id': 'C3', 'kind': 'core', 'priority': 3, 'playOrder': 4, 'entryRank': ENTRY['C3'],
      'title': 'Zıtlık çiftleri (ağır/hafif; ikinci dalgada sıcak/serin)', 'clips': [
          # TR2-22: atlama fiili C1 ile aynı ("atla-"); L2-13: yatakta doku değişimi (ses yüksekliği değil)
          clip('c3.agir', 'Önce ağırlık. İstemezsen bu bölümü atlayıp zemini hissedebilirsin.',
               gap=(4, 6, 8), phase=D, texture='zitlik-agir', safety='exit', anchor='zemin', repeatOk=['ağırl'],
               cue={'music': 'layer:zitlik'}),
          # L2-05: başarısızlığı normalleştirir; göndergesi ("ağırlık") adıyla, zemin cümlesiyle karışmasın diye
          clip('c3.gelmezse', 'Ağırlığı hissetmesen de olur. Sözcükleri dinlemen yeter.', O, gap=(3, 4, 6), phase=D,
               rank=rk('c3.gelmezse'), texture='zitlik-agir', normalize=True, repeatOk=['ağırl', 'hisse']),
      ] + agir + [
          clip('c3.zemin', 'Zemin bu ağırlığı tümüyle taşıyor.', O, gap=(7, 10, 15), phase=D, rank=rk('c3.zemin'),
               texture='zitlik-agir', repeatOk=['ağırl', 'zemin'], anchor='zemin'),
          clip('c3.hafif', 'Şimdi bunun tersi: hafiflik.', gap=(3, 4, 6), phase=D, texture='zitlik-agir'),
      ] + hafif + [
          clip('c3.nefeskadar', 'Nefes kadar hafif. Yine de zemin seni taşıyor.', O, gap=(7, 10, 15), phase=D,
               rank=rk('c3.nefeskadar'), texture='zitlik-agir', repeatOk=['hafif'], anchor='zemin'),
          clip('c3.x.ikisi1', 'Ağırlık da hafiflik de aynı anda burada.', O, gap=(9, 12, 18), phase=D,
               rank=rk('c3.x.ikisi1'), texture='zitlik-agir', repeatOk=['ağırl', 'hafif']),
          clip('c3.sicak', 'Sonra sıcaklık. Bedenine ılık bir his yayılabilir.', O, gap=(8, 11, 14), phase=D,
               rank=rk('c3.sicakserin'), group='c3.sicakserin', texture='zitlik-sicak', pair=('c3.fincan', (4, 5, 7))),
          clip('c3.fincan', 'Avuçlarında sıcak bir fincan tutar gibi.', O, gap=(9, 13, 18), phase=D,
               rank=rk('c3.fincan'), requires=['c3.sicak'], texture='zitlik-sicak', evocation=True, repeatOk=['sıcak']),
      ] + sicak + [
          clip('c3.serin', 'Ardından serinlik. Teninde bir ferahlık dolaşabilir.', O, gap=(8, 11, 14), phase=D,
               rank=rk('c3.sicakserin'), group='c3.sicakserin', texture='zitlik-sicak', pair=('c3.pencere', (4, 5, 7))),
          clip('c3.pencere', 'Açık bir pencereden içeri dolan hava gibi.', O, gap=(9, 13, 18), phase=D,
               rank=rk('c3.pencere'), requires=['c3.serin'], texture='zitlik-sicak', evocation=True),
      ] + serin + [
          clip('c3.x.ikisi2', 'Sıcaklık da serinlik de yan yana.', O, gap=(8, 11, 16), phase=D,
               rank=rk('c3.x.ikisi2'), requires=['c3.sicak'], texture='zitlik-sicak', repeatOk=['sıcak', 'serin']),
          clip('c3.x.hepsi', 'Ağır ve hafif, sıcak ve serin: Hepsi sende bir arada.', E, gap=(11, 15, 19), phase=D,
               rank=rk('c3.x.hepsi'), requires=['c3.sicak'], texture='zitlik-sicak',
               repeatOk=['sıcak', 'serin', 'hafif']),
          # EV2-05: bedenin hâlini değiştirdiği ima edilmez; isim cümlesi
          clip('c3.birak', 'Bu hisleri bırakabilirsin. Beden kendi hâlinde.', gap=(9, 16, 19), phase=D,
               texture='zitlik-sicak'),
      ]}

# ------------------------------------------------------------------------------------------------------------------
# C4 · İMGELEME + sessiz pencere · P2 · dersin TEK imge yayı. H6/L2-04: başlamadan önce "Kıyı / Orman / Ders içinde
# seçerim"; seçilen sahnenin ayrıntıları (ses, koku, iz, ışık, gök, yaklaşan ses) ve doğa katmanı sahneyi izler.
# "Ders içinde seçerim" (ana metin) iki yere de uyan ayrıntılarla kalır; doğa katmanı imge boyunca kısılır (L2-03 b).
# H2: en kısa C4'te bile bir ses ve bir dokunma/sıcaklık ayrıntısı; oturma eylemi (c4.yerles) isteğe bağlı.
IMG_ON = {'visual': 'image:on', 'music': 'layer:imge', 'nature': 'sahne: kıyı → uzak dalga, orman → yaprak; '
          'ana metinde doğa −8 dB (L2-03)'}
IMG_OFF = {'visual': 'image:off', 'music': 'layer:imge-off', 'nature': 'restore'}
C4 = {'id': 'C4', 'kind': 'core', 'priority': 2, 'playOrder': 5, 'entryRank': ENTRY['C4'],
      'title': 'İmgeleme: kıyı ya da orman (tek imge yayı) + sessiz pencere', 'clips': [
          clip('c4.yer', 'Zihninde sana iyi gelen bir yer belirebilir. Bir kıyı ya da bir orman.',
               gap=(10, 12, 15), phase=D, cue=IMG_ON, texture='imge', image='new', arc='giriş', safety='choice',
               scenes={'kiyi': 'Zihninde sana iyi gelen bir kıyı belirebilir.',
                       'orman': 'Zihninde sana iyi gelen bir orman belirebilir.'}),
          clip('c4.gelmezse', 'Bir görüntü gelmese de olur, gözlerin açık kalsa da.', gap=(11, 13, 15), phase=D,
               texture='imge', safety='alternative', eyesOpen=True, normalize=True),
          clip('c4.patika', 'Kendini orada, yumuşak bir patikanın başında bulabilirsin.', gap=(7, 10, 14), phase=D,
               texture='imge', image='new', arc='yola çıkış', pair=('c4.yol', (6, 6.5, 7.5))),
          clip('c4.yol', 'Yol önünde açılıyor. Kendi hızında yürüyorsun.', gap=(11, 14, 18),
               phase=D, texture='imge', image='new', arc='yürüyüş'),
          clip('c4.adim', 'Her adımda ayak tabanlarını hissedebilirsin.', O, gap=(7, 10, 15), phase=D,
               rank=rk('c4.adim'), texture='imge', arc='yürüyüş', sense='dokunma'),
          clip('c4.iz', 'Ardında belli belirsiz izler kalıyor.', O, gap=(7, 10, 14), phase=D,
               rank=rk('c4.iz'), texture='imge', image='new', arc='yürüyüş',
               scenes={'kiyi': 'Ardında, kumda belli belirsiz izler kalıyor.',
                       'orman': 'Ardında, yosunlu toprakta belli belirsiz izler kalıyor.'}),
          clip('c4.ses', 'Uzaktan gelip giden bir ses. Dalgalar ya da rüzgârda hışırdayan yapraklar.', gap=(8, 12, 17),
               phase=D, texture='imge', image='new', arc='varış', sense='ses',
               scenes={'kiyi': 'Uzaktan gelip giden dalgaların sesi.',
                       'orman': 'Uzaktan gelip giden yaprak hışırtısı.'}),
          clip('c4.koku', 'Havada temiz, taze bir koku var.', O, gap=(6, 8, 11), phase=D,
               rank=rk('c4.koku'), texture='imge', image='new', arc='varış', sense='koku',
               scenes={'kiyi': 'Havada tuzlu bir deniz kokusu var.',
                       'orman': 'Havada ıslak toprak ve çam kokusu var.'}),
          clip('c4.gunes', 'Güneş tenini tatlı tatlı ısıtıyor.', gap=(8, 11, 16), phase=D,
               texture='imge', image='new', arc='varış', sense='sıcaklık'),
          clip('c4.ruzgar', 'Serin bir esinti yüzüne dokunup geçiyor.', E, gap=(6, 8, 11), phase=D,
               rank=rk('c4.ruzgar'), texture='imge', image='new', arc='varış', sense='dokunma'),
          # G2-09: gerçek kapanış eylemleriyle ("otur", "uzan") aynı fiiller yok
          clip('c4.yerles', 'Orada kendine rahat bir dinlenme yeri bulabilirsin.', O, gap=(14, 16, 18), phase=D,
               rank=rk('c4.yerles'), texture='imge', image='new', arc='dinlenme'),
          # L2-16: 12–24 dakikalık sürümlere de girer
          clip('c4.x.istemiyor', 'Burada kimse senden bir şey istemiyor.', O, gap=(10, 15, 19), phase=D,
               rank=rk('c4.x.istemiyor'), texture='imge', arc='dinlenme'),
          clip('c4.tas1', 'Yanında güneşte ısınmış, düz bir taş var.', O, gap=(7, 10, 15), phase=D, rank=rk('x.tas'),
               group='x.tas', texture='imge', image='new', arc='dinlenme', sense='dokunma',
               pair=('c4.tas2', (4, 4.5, 6))),
          clip('c4.tas2', 'Elini üstüne koyabilirsin. Taş ılık ve pürüzsüz.', O, gap=(14, 16, 18), phase=D,
               rank=rk('x.tas'), group='x.tas', requires=['c4.tas1'], texture='imge', image='new',
               arc='dinlenme', sense='dokunma', repeatOk=['taş']),
          clip('c4.isik', 'Işık dört bir yanda oynuyor.', E, gap=(8, 11, 16), phase=D,
               rank=rk('c4.isik'), texture='imge', image='new', arc='dinlenme', sense='görme',
               scenes={'kiyi': 'Işık suyun üstünde oynuyor.',
                       'orman': 'Işık yaprakların arasından süzülüyor.'}),
          clip('c4.x.gok', 'Yukarıda açık, geniş bir gökyüzü var.', E, gap=(8, 12, 16), phase=D, rank=rk('c4.x.gok'),
               texture='imge', image='new', arc='dinlenme', sense='görme',
               scenes={'orman': 'Dalların arasından açık bir gökyüzü görünüyor.'}),
          clip('c4.x.yaklas', 'Uzaktaki ses bir yaklaşıyor, bir uzaklaşıyor.', E, gap=(9, 13, 17), phase=D,
               rank=rk('c4.x.yaklas'), texture='imge', arc='dinlenme', sense='ses', callback='c4.ses',
               scenes={'kiyi': 'Dalgalar bir yaklaşıyor, bir uzaklaşıyor.',
                       'orman': 'Rüzgâr yaprakları bir kıpırdatıyor, bir bırakıyor.'}),
          clip('c4.acele', 'Hiçbir şeyin acelesi yok.', O, gap=(8, 11, 16), phase=D, rank=rk('c4.acele'),
               texture='imge', arc='dinlenme'),
          # H15 + TR2-16: kapı "zor gelirse" demeden; "susacağım" yerine "sessiz kalacağım"; G2-11: kabarma rampalı
          clip('c4.pencere', 'Biraz dinlenme zamanı. İstediğin an gözlerini açabilirsin. '
                             'Bir süre sessiz kalacağım, sonra yine seslenirim.', O,
               rank=rk('c4.pencere'), group='c4.pencere', phase=D, window=(20, 45, 90),
               cue={'visual': 'window', 'music': 'swell'}, texture='imge',
               announce=True, arc='dinlenme', eyesOpen=True, safety='door'),
          clip('c4.donus1', 'Yeniden seninleyim. Dalıp gittiysen de sorun değil.', O, rank=rk('c4.pencere'),
               group='c4.pencere', gap=(3, 4, 6), phase=D,
               texture='imge-donus', welcome=True, normalize=True, cue={'music': 'returnTone:-2s'}),
          clip('c4.x.golge', 'Işıkla gölge usul usul yer değiştiriyor.', E, gap=(10, 14, 18), phase=D,
               rank=rk('c4.x.golge'), texture='imge', image='new', arc='dinlenme', sense='görme'),
          # TR2-11: "Artık" yalnız k.donus'ta
          clip('c4.don', 'Aynı patikadan, acele etmeden geri dönüyorsun.', gap=(12, 16, 18),
               phase=D, texture='imge-donus', image='return', arc='dönüş', action='patikadan geri yürümek'),
          # TR2-11 + H14 + G2-12: odaya erken dönüş (sahte bitiş) yok; imge patikanın başında biter
          clip('c4.x.donus2', 'Her adımda patikanın başına biraz daha yaklaşıyorsun.', E, gap=(9, 12, 15), phase=D,
               rank=rk('c4.x.donus2'), texture='imge-donus', image='return', arc='dönüş', repeatOk=['patik']),
          clip('c4.geride', 'Sesler ve ışık yavaş yavaş geride kalıyor.', O, gap=(8, 10, 13), phase=D,
               rank=rk('c4.geride'), texture='imge-donus', image='return', arc='dönüş'),
          clip('c4.solma', 'Görüntü usulca siliniyor. Seni taşıyan zemini yeniden hissedebilirsin.', gap=(10, 14, 16),
               phase=D, cue=IMG_OFF, texture='imge-donus', image='return', arc='kapanış', anchor='zemin'),
      ]}

# ------------------------------------------------------------------------------------------------------------------
# C5 · TANIKLIK · P5 · yalnız imgeleme varsa. L2-13: yatakta "tanıklık" dokusu.
C5 = {'id': 'C5', 'kind': 'core', 'priority': 5, 'playOrder': 6, 'entryRank': ENTRY['C5'], 'requiresBlocks': ['C4'],
      'title': 'Tanıklık: sessiz farkındalık', 'clips': [
          clip('c5.basla', 'Hiçbir şeyi değiştirmeden, olup biteni izleyebilirsin.', gap=(9, 12, 15), phase=D,
               texture='taniklik', cue={'music': 'layer:tanik'}),
          # TR2-18: "fark et-" çevirisi yerine "hisset-"
          # H1/B.3-8: en kısa C5 de >= 55 sn; beden tanıklığı Ders 2'nin tanıklığını Ders 5 ve 9'dan ayırır
          clip('c5.beden', 'Kendini baştan ayağa tek bir bütün olarak hissedebilirsin.', gap=(10, 14, 18),
               phase=D, texture='taniklik'),
          # TR2-02 + L2-12 + H8(1): tamlama belirsizliği gitti
          clip('c5.x.dayanak', 'Bedeninin ağırlığı ve onu taşıyan zemin: İkisi de burada.', E, gap=(11, 14, 17),
               phase=D, rank=rk('c5.x.dayanak'), texture='taniklik', anchor='zemin'),
          # TR2-09: ortak yüklem bütün öznelere uyar
          clip('c5.x.hepsi', 'Nefes de sesler de bedendeki hisler de kendiliğinden akıyor.', E, gap=(9, 12, 17),
               phase=D, rank=rk('c5.x.hepsi'), texture='taniklik', pair=('c5.dusunce', (4, 5, 6)),
               repeatOk=['kendi', 'beden']),
          clip('c5.dusunce', 'Düşünceler de gelip gidiyor. Tıpkı dalgaların ya da yaprakların sesi gibi.', gap=(8, 12, 17),
               phase=D, texture='taniklik', callback='c4.ses',
               scenes={'kiyi': 'Düşünceler de gelip gidiyor. Tıpkı dalgaların sesi gibi.',
                       'orman': 'Düşünceler de gelip gidiyor. Tıpkı yaprakların hışırtısı gibi.'}),
          clip('c5.x.yumusak', 'Yüzün yumuşak, çenen gevşek olabilir.', E, gap=(9, 12, 16), phase=D,
               rank=rk('c5.x.yumusak'), texture='taniklik'),
          clip('c5.x.oldugu', 'Her şey olduğu gibi kalsın.', E, gap=(10, 14, 18), phase=D, rank=rk('c5.x.oldugu'),
               texture='taniklik'),
          clip('c5.x.sessizlik', 'Bedenin de kendine göre bir sessizliği var.', E, gap=(11, 16, 20), phase=D,
               rank=rk('c5.x.sessizlik'), texture='taniklik'),
          clip('c5.sen', 'Bütün bunları fark eden sensin.', gap=(10, 12, 14), phase=D, texture='taniklik'),
          # TR2-10 + H12 + L2-07: önce davet, sonra (öznesi olan) kapı, en son dönüş sözü
          clip('c5.pencere', 'Bir süre sessizce izleyebilirsin. Bir şey zor gelirse zemini hissedebilirsin. '
               'Sonra yine seslenirim.',
               O, rank=rk('c5.pencere'), group='c5.pencere', phase=D, window=(30, 45, 90),
               cue={'visual': 'window', 'music': 'swell'}, texture='taniklik',
               announce=True, anchor='zemin', safety='door'),
          clip('c5.donus', 'Buradayım.', O, rank=rk('c5.pencere'), group='c5.pencere', gap=(3, 4, 6), phase=D,
               texture='taniklik', welcome=True,
               cue={'music': 'returnTone:-2s'}),
          # TR2-17: "dikkatin geniş kalabilir" çevirisi yerine
          clip('c5.genis', 'Dikkatin tek bir yere odaklanmak zorunda değil. Geniş ve açık kalabilir.', O,
               gap=(8, 12, 18), phase=D, rank=rk('c5.genis'), texture='taniklik'),
      ]}

# ------------------------------------------------------------------------------------------------------------------
# N2 · NİYET, SONDA · P1. TR2-05 + H10 + L2-11: tırnak içindeki nokta artık cümlenin sonunda; son duyulan şey niyetin
# kendisi. "şimdi" yok (c2.dikkat 5 dakikada 60 sn'den yakın). TR2-04: hazır niyet.
N2 = {'id': 'N2', 'kind': 'core', 'priority': 1, 'playOrder': 7, 'niyet': True, 'title': 'Niyet, sonda', 'clips': [
    clip('n2.hatirla', 'Başta seçtiğin niyeti içinden üç kez söylüyorsun. Ya da yine şunu: "Kendime dinlenme '
         'izni veriyorum."', gap=(8, 15, 20), phase=D, texture='niyet-son', action='niyeti üç kez içinden söylemek'),
    # EV2-02: bedende iz iddiası yok
    clip('n2.x.his', 'Sözlerin ardından kısa bir sessizlik.', O, gap=(9, 12, 16), phase=D,
         rank=rk('n2.x.his'), texture='niyet-son'),
    # EV2-03 + L2-17: dilek kipinde ve günün saatinden bağımsız
    clip('n2.dilek', 'İstersen niyetin bundan sonra da seninle olsun.', O, gap=(5, 7, 10), phase=D,
         rank=rk('n2.dilek'), texture='niyet-son', repeatOk=['niyet']),
]}

# ------------------------------------------------------------------------------------------------------------------
# KAPANIŞ (sabit kapak, TEK blok; gündüz dönüşü). Eylem payları (B2, T1, S4, T9, Z2-03, Z2-05) sıkıştırılmaz.
K = 'Kapanış'
# G2-08: anahtar cümle 3 bir durum iddiası değil (16 → 12 → 8 hece); H4: tez yerine otursun diye 5/6/9 sn
k_anahtar3 = clip('k.anahtar3', 'Uyanık bir dinlenme bu.', gap=(5, 6, 9), phase=D, key=3, texture='anahtar',
                  repeatOk=['dinle'])
# L2-02: dalıp giden dinleyiciye tanıdık dönüş tınısı; ses rampası k.anahtar3'ün ardındaki sessizlikte (−3 → 0 dB),
# "Artık dönüş zamanı." 0 dB'de; ardından 3,5 sn (VARSAYIM)
k_donus = clip('k.donus', 'Artık dönüş zamanı.', gap=(3.5, 3.5, 5), phase=K,
               cue={'music': 'phase:kapanis; returnTone:-2s', 'visual': 'dawn',
                    'voiceGain': 'rampa −3 → 0 dB, k.anahtar3 sonundan k.donus başına (sessizlik boyunca; basamak yok)'},
               texture='kapanis')
# TR2-19 + H4 + L2-14: "dönüş… dönebilir" kökü yan yana gelmez; nefes derinleştirilmez (güvenlik §11.B-14)
k_nefes = clip('k.nefes', 'Nefesin kendi olağan ritmini bulabilir.', gap=(4, 4, 7), phase=K, step='nefes',
               texture='kapanis')
# TR2-20 + H8(3) + L2-15 + G2-12: koşut bağlama; oda varsayımı yok
k_sesler = clip('k.sesler', 'Yakındaki ve uzaktaki sesler yeniden duyuluyor.', O, gap=(6, 6, 8), phase=K,
                rank=rk('k.sesler'), step='sesler', texture='kapanis')
# G2-07 + EV2-11 + TR2-20: her harekette "ağrı ya da baş dönmesi" (güvenlik §11.B-17), doğal söyleyişle; TR2-03:
# "oynatıp" (tek "-(y)abil-")
k_hareket = clip('k.hareket', 'El ve ayak parmaklarını oynatıp zorlamadan gerinebilirsin. Bir yerin ağrırsa ya da '
                 'başın dönerse bırak.', gap=(8, 8, 11), phase=K, step='parmak+gerin', texture='kapanis',
                 mood='safety', action='parmakları oynatmak ve gerinmek')
# G2-12 + Z2-05: çevreye bakış; iki eylem için 9 sn
k_goz = clip('k.goz', 'Gözlerini ışığa alıştıra alıştıra açıp çevrende birkaç şeye bakabilirsin.', gap=(9, 9, 12),
             phase=K, cue={'music': 'chord'}, step='goz+oda', texture='kapanis', eyes='ışığa yavaş alışma',
             action='gözleri açıp çevreye bakmak')
k_oda_ayrinti = clip('k.oda.ayrinti', 'Bir renk, bir biçim, bir doku.', O, gap=(8, 8, 10), phase=K,
                     rank=rk('k.oda.ayrinti'), step='oda', texture='kapanis')
# TR2-01 + H8(2): "saatin" eşyazımı ve 3. tekil okuma yok; tek 2. tekil yüklem
k_zaman = clip('k.zaman', 'Günün hangi saatinde ve nerede olduğunu hatırlıyorsun.', O, gap=(4.5, 4.5, 7), phase=K,
               rank=rk('k.zaman'), step='oda', texture='kapanis')
k_yan = clip('k.yan', 'Uzanıyorsan önce bir yanına dön.', gap=(6, 6, 8), phase=K, step='yan', texture='kapanis',
             mood='safety', repeatOk=['yanın'], action='yana dönmek')
# Z2-03: "bir süre" gerçekten bir süre
k_yandakal = clip('k.yandakal', 'Bir süre yan yatarak dinlenmek de olur.', O, gap=(12, 12, 15), phase=K,
                  rank=rk('k.yandakal'), step='yan', texture='kapanis')
k_otur = clip('k.otur', 'Ellerinden destek alarak yavaşça doğrulup otur.', gap=(8, 8, 11), phase=K, step='otur',
              texture='kapanis', mood='safety', action='doğrulup oturmak')
k_bekle = clip('k.bekle', 'Kalkmadan önce birkaç nefes böyle kal. Başın dönerse biraz daha bekle.', gap=(12, 12, 16),
               phase=K, step='bekle', texture='kapanis', mood='safety', action='oturarak birkaç nefes beklemek')
# G2-04: kalkış anında baş dönmesi satırı; EV2-01 + H9: sonuç iddiası ("dinlenmiş") yok, yüklemsiz parça yok;
# açılışa ("bu dakikalar senin") geri çağrı
k_son = clip('k.son', 'Sonra acele etmeden kalkabilirsin; başın dönerse yeniden otur. Buradasın ve uyanıksın.',
             gap=(6, 6, 9), phase=K,
             cue={'music': 'fade:5s', 'visual': 'end'}, step='kalk', texture='kapanis', mood='safety',
             action='acele etmeden kalkmak', repeatOk=['başın', 'döner', 'dön'])
KBLOCK = {'id': 'K', 'kind': 'closing', 'priority': 0, 'playOrder': 99,
          'title': 'Kapanış (tek kapak; isteğe bağlılar süreyle eklenir)',
          'clips': [k_anahtar3, k_donus, k_nefes, k_sesler, k_hareket, k_goz, k_oda_ayrinti, k_zaman,
                    k_yan, k_yandakal, k_otur, k_bekle, k_son]}

# "Kapanışa geç" (PLAN B.5): o anki klip biter, bu hızlı kapanış çalar (klipler Kapanış'takilerin aynısı).
QUICK = {'id': 'K.hizli', 'kind': 'utility', 'title': '"Kapanışa geç" için hızlı kapanış',
         'cue': {'music': 'phase:kapanis', 'visual': 'dawn'},
         'clips': [k_nefes, k_hareket, k_goz, k_yan, k_otur, k_bekle, k_son]}
# Durdur (X): Z2-01 + G2-05: yana dönüp oturmaya 13 sn; ses oturur durumda biter, bekleme ekran metniyle sürer
STOP = {'id': 'D.durdur', 'kind': 'utility', 'title': 'Durdur (X) sonrası isteğe bağlı 20–30 sn sesli dönüş',
        'clips': [clip('d.goz', 'Gözlerini aç, etrafına bak, acele etme.', gap=(3, 3, 4), phase=K, mood='safety',
                       step='goz', screen='Durdurma ekranı metniyle aynı'),
                  clip('d.kalk', 'Uzanıyorsan önce yana dön, sonra otur.', gap=(13, 13, 14), phase=K, mood='safety',
                       step='yan', screen='Durdurma ekranı metniyle aynı'),
                  clip('d.bekle', 'Birkaç nefes otur; başın dönerse biraz daha bekle.', gap=(1, 1, 2), phase=K,
                       mood='safety', step='bekle')]}

BLOCKS = [A, N1, C1, C2, BR, C3, BR_ORTA, C4, C5, N2, KBLOCK]


# ------------------------------------------------------------------------------------------------------------------
def finalize():
    # Kapanış evresinin bütün sessizlikleri ve Varış'ın eylem payları sıkıştırılmaz (min = pref). k.anahtar3 Derin
    # evrededir (H4: 5 / 6 / 9 sn, esneyebilir).
    for b in (KBLOCK, QUICK, STOP):
        for c in b['clips']:
            if c['phase'] == K:
                c['gapAfter']['min'] = c['gapAfter']['pref']
    for c in A['clips']:
        if c['tags'].get('action'):
            c['gapAfter']['min'] = c['gapAfter']['pref']
    est_rate, est_prof = 5.6, timing.profile('hi', 5.6)
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
            for sc, s in (c.get('scenes') or {}).items():
                s['syllables'] = timing.syllables(s['text'])
                s['words'] = len(timing.words(s['text']))
                s['voice'] = {v: {'file': 'public/yoga/ders2/%s/%s.%s.m4a' % (v, c['id'], sc), 'sec': None}
                              for v in ('female', 'male')}
            if c.get('onsetPeriod'):
                # şema alanı gapAfter: 5,6 hece/sn + yüksek duraklamayla TAHMİN; motor gerçek sec ile yeniden hesaplar
                d = timing.clip_dur(c, est_rate, est_prof)
                c['gapAfter'] = {lv: round(max(c['gapFloor'], c['onsetPeriod'][lv] - d), 2)
                                 for lv in ('min', 'pref', 'max')}
                c['gapFromPeriod'] = True
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
                         'requires, minTarget, window, carrier{id,index}, tags; blok türleri bridge (placement before/after; '
                         'requiresAnyBlock: köprü yalnız bu bloklardan biri seçiliyse çalar) ve utility (extras); '
                         'onsetPeriod{min,pref,max} + gapFloor (L2-08/Z2-07: mikro-listelerde sessizlik = periyot − '
                         'gerçek voice.sec, en az gapFloor; bu kliplerde gapAfter yalnız tahmindir, gapFromPeriod=true); '
                         'scenes{kiyi,orman}{text,syllables,voice} (H6/L2-04: sahneye özgü metin; seçilmemişse ana metin); '
                         'ttsText (isteğe bağlı; ekran metninden farklı TTS metni gerektiğinde, L2-11). minSec/prefSec/'
                         'maxSec tahmindir (5,6 hece/sn + yüksek duraklama); üretimden sonra voice.*.sec ile yeniden '
                         'hesaplanır.'),
        'id': 'ders2-derin-dinlenme', 'version': VERSION,
        # TR2-23: "-arak" zarf-fiili somut ad öbeğine bağlanmaz
        'title': 'Derin Dinlenme (Yoga Nidra)', 'tagline': 'Uyanıkken derin bir dinlenme.',
        'daypart': 'day', 'posture': 'lying', 'defaultMinutes': 20, 'minutes': {'min': 5, 'max': 30, 'step': 1},
        # TR2-23: tek okunuşlu güvenlik satırı; G2-03: "dersi bitirebilirsin" (ses ve ekran aynı)
        'openingNotice': 'Bu dersi araç ya da makine kullanmıyorken dinle.',
        'openingScreen': ['İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin.',
                          'Bu dersi araç ya da makine kullanmıyorken dinle.',
                          'Uzanarak yaptığın derslerden sonra önce yana dön, otur, sonra kalk.'],
        # TR2-23: koşut ad öbekleri
        'preparationCard': ['İnce bir örtü', 'Dizlerinin altı için bir yastık', 'Uzanabileceğin rahat bir yüzey'],
        # L2-10: hazırlık kartında tek dokunuşla; kullanıcı başına hatırlanır
        'preparationToggles': [{'id': 'speechClarity', 'label': 'Konuşmayı daha net duymak istiyorum',
                                'default': False, 'remember': 'kullanıcı başına',
                                'effect': 'voicePhaseGainDb.clarityMode + music.clarityMode + qa.speechOverBedDbMinClarity'}],
        # H6/L2-04: sahne seçici; seçim kaldığın yer kaydına variantIndex ile birlikte yazılır
        'scenePicker': {'options': [{'id': 'serbest', 'label': 'Ders içinde seçerim', 'textKey': None},
                                    {'id': 'kiyi', 'label': 'Kıyı', 'textKey': 'kiyi'},
                                    {'id': 'orman', 'label': 'Orman', 'textKey': 'orman'}],
                        'default': 'son seçim; ilk seferde "Ders içinde seçerim"',
                        'stored': 'kaldığın yer kaydında variantIndex ile birlikte (CRITIQUE #30)',
                        'safety': 'kıyıda suya girilmez; ormanda karanlık ya da kapalı alan yok (güvenlik §11.B-10; '
                                  'örnekler tasarım önerisi, Luu 2024 özetinde yok: sakin §11.7 düzeltmesi)'},
        # L2-17: akşam dinleyene uyku dersini gösteren tek satır (UI, VARSAYIM)
        'eveningHint': {'afterLocalHour': 20, 'text': 'Akşam uyumadan önce dinliyorsan uyku dersi daha uygun olabilir.',
                        'note': 'UI satırı, seste yok; saat eşiği VARSAYIM'},
        'leadIn': G(3, 4, 6),
        'limits': {'silenceWindowMaxSec': 90, 'clipMaxSecAt6_6': 15, 'lastSecondsNoNewImage': 60},
        'planner': {
            'kural': ('T4: tek Varış ve tek Kapanış bloğu; zorunlu klipleri her sürede çalar; Kapanış evresinin '
                      'sessizlikleri sıkıştırılmaz (min = pref). Taban: bütün P1 bloklar zorunlu klipleriyle (+ koşulu '
                      'tutan köprüler, minTarget\'i dolan zorunlular). Artımlar entryRank/fillRank sırasıyla: sessizlikler '
                      'pref iken sığıyorsa eklenir; T5: mevcut içerik f=0,5 esnemede bile hedefe yetmiyorsa, en çok '
                      'yarı sıkışmayla sığan artım yine eklenir; ilk sığmayanda durulur (önek kuralı ⇒ plan(T) ⊆ '
                      'plan(T+1)). Sessizlik min→pref→max oranla esner; mikro-listelerde periyot esner (sessizlik = '
                      'periyot − gerçek süre). Kalan süre max toplamını aşarsa içerik hatası. Bağlı çiftlerde '
                      '(pairWith) ortak klip hemen ardından çalıyorsa aradaki boşluk pairGap olur (P-S6).'),
            'stretchCapBeforeIncrement': timing.STRETCH_CAP_BEFORE_INCREMENT,
            'entryRanks': ENTRY,
            'p1DropOrder': ['C2', 'N2', 'N1'],
            'variants': 'P-N5: alternates varsa seçenek = oturum sayısı mod (1 + seçenek sayısı); belirlenimci, '
                        'kaldığın yer kaydına variantIndex olarak yazılır (CRITIQUE #30). Sahne (scenes) ayrı bir '
                        'boyuttur ve kayda sahneyle birlikte yazılır.',
        },
        'timingModel': {
            'articulationSyllPerSec': timing.RATES,
            'pauseProfilesSec': timing.PROFILES, 'pauseScaleAtRate': {str(k): v for k, v in
                                                                      timing.SPEED_PAUSE_SCALE.items()},
            'edgeSec': timing.EDGE, 'edgeMicroSec': timing.EDGE_MICRO, 'gapFloorSec': timing.GAP_FLOOR,
            'note': 'VARSAYIM; 2026-09-28 ölçümleriyle kalibre (hiz/*.mp3). Gerçek klip süreleri gelince voice.*.sec '
                    'kullanılır; edgeMicroSec ilk pilot üretimde kesilen mikro-kliplerin ölçülen süresiyle değişir (Z2-07).',
        },
        'voicePhaseGainDb': {'Varış': 0.0, 'Derinleşme': -1.5, 'Derin': -3.0, 'Kapanış': 0.0,
                             'kapanisGecisi': 'L2-02: rampa −3 → 0 dB k.anahtar3\'ün sonundan k.donus\'un başına, '
                                              'aradaki 5–9 sn sessizlik boyunca (basamak yok); "Artık dönüş zamanı." 0 dB',
                             'clarityMode': {'Varış': 0.0, 'Derinleşme': -0.5, 'Derin': -1.0, 'Kapanış': 0.0,
                                             'note': 'L2-10: "Konuşmayı daha net duymak istiyorum" açıkken (VARSAYIM)'}},
        'music': {
            # EV2-12: nabız yok; ElevenLabs Music'te tempo parametresi yok
            'bpmFeel': None,
            'pulseNote': 'ritimsiz, pulssuz doku (drone, pad) önerisi; test edilmedi (sakin §11.5, Bernardi 2006 '
                         'düzeltmesi); ElevenLabs Music\'te tempo parametresi yok (CRITIQUE #10); VARSAYIM',
            'key': 'Mi♭ majör pad + alçak yaylılar + seyrek uzak piyano (VARSAYIM)',
            'phases': ['varis', 'derinlesme (Varış yatağı, −1,5 dB ek kısma)', 'derin', 'kapanis'],
            # L2-13: alt-evre dokusu (ses yüksekliği değil); 8 sn'den uzun çapraz geçiş, konuşmanın altında
            'textureLayers': {'layer:zitlik': 'c3.agir: daha ince pad', 'layer:imge': 'c4.yer: seyrek uzak piyano + '
                              'sahnenin doğa dokusu', 'layer:imge-off': 'c4.solma: imge katmanı çekilir',
                              'layer:tanik': 'c5.basla: yalnız alçak, uzun yaylılar',
                              'rule': 'çapraz geçiş >= 8 sn, konuşmanın altında; 20 sn\'den kısa bir boşlukta asla; '
                                      'blok başına en çok bir doku değişimi (VARSAYIM)'},
            'duckDefault': True,
            'duckedBedLufs': {'Varış': -33.0, 'Derinleşme': -34.5, 'Derin': -36.0, 'Kapanış': -33.0},
            'windowBedAboveDuckDb': 6.0,
            # G2-11: pencere kabarması rampalı; pencere bitmeden iner
            'windowSwell': {'rampUpSec': 6, 'rampDownSec': 6, 'downLeadSec': 8, 'note': 'VARSAYIM'},
            'swellOnlyInAnnouncedWindowsMinSec': 20,
            'returnTone': 'P-S10 + L2-02: her pencere sonrası karşılamadan ve k.donus\'tan 2 sn önce aynı yumuşak '
                          'dönüş tınısı (VARSAYIM)',
            'endFadeSec': 5,
            # H6/L2-03: doğa katmanı sahneyi izler; su katmanının üretimi sahip kararı (S12)
            'nature': {'default': 'uzak, yumuşak rüzgâr ve yaprak dokusu (su yok; VARSAYIM)',
                       'byScene': {'serbest': 'rüzgâr ve yaprak; c4.yer → c4.solma arasında −8 dB (L2-03 b)',
                                   'orman': 'rüzgâr ve yaprak; imge boyunca sürer',
                                   'kiyi': 'imge boyunca uzak, yumuşak dalga (suya girilmez); su katmanı '
                                           'üretilmezse serbest davranışı'},
                       'waterLayer': {'available': True, 'defaultOn': False,
                                      'note': 'kıyı seçene imge boyunca; üretimi sahip kararı (≈ 10k kredi)'}},
            'clarityMode': {'bedExtraDuckDb': -6.0, 'note': 'L2-10 (VARSAYIM)'},
            'speechClarityOption': 'L2-10: hazırlık kartındaki "Konuşmayı daha net duymak istiyorum" ile açılır'},
        'visual': {'form': 'ufuk çizgisi', 'phases': ['varis', 'derinlesme', 'derin', 'kapanis(şafak)'],
                   'pulse': {'respectFlashSafe': True, 'whenFlashSafeFalse': 'nabız yok, yalnız çok yavaş opaklık'},
                   'dawn': {'startRule': 'max(k.donus.start, end - 90)', 'spanSec': [60, 90], 'minRampSec': 60,
                            'dawnMaxLuminance': 'bağıl %15 (PLAN E.2 tavanı; VARSAYIM)'}},
        'qa': {'carrierJoinF0StepSemitones': 2.0,
               'carrierJoinNote': 'P-S15: taşıyıcı sınırındaki F0 sıçraması <= 2 yarım ton (VARSAYIM).',
               'speechOverBedDbMin': 15.0,
               'speechOverBedDbMinClarity': 21.0,
               'speechOverBedNote': 'P-B3: her evrede ayrı ölçülür, 3 sn kısa süreli LUFS (VARSAYIM); netlik kipinde 21 dB '
                                    '(L2-10).',
               'microClipRmsOffsetDb': 1.0,
               'microClipRmsNote': 'L2-10: tek heceli mikro-klipler ("on", "üç", "diz") evre referansının +1 dB '
                                   'üstüne RMS ile eşitlenir (VARSAYIM).',
               'windowLoudnessRiseMaxDbPerSec': 1.0,
               'windowLoudnessNote': 'G2-11: pencerelerin içinde ve çevresinde kısa süreli yükseklik artışı <= 1 dB/sn.',
               'natureSceneNote': 'L2-03: image:on ile image:off arasında seçilen sahneye uymayan doğa dokusu duyulmaz.',
               'derinClipRateCeil': timing.DERIN_CLIP_RATE_CEIL,
               'derinClipRateCeilNote': 'VARSAYIM; kanıta dayanmaz (EV2-04)'},
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
        b['minSec'] = round(sum(timing.clip_dur(c, rate, prof) + timing.gap_of(c, rate, prof)['min'] for c in req), 1)
        b['maxSec'] = round(sum(timing.clip_dur(c, rate, prof) + timing.gap_of(c, rate, prof)['max']
                                for c in b['clips']), 1)
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
