#!/usr/bin/env python3
"""Ders 2 · Derin Dinlenme (Yoga Nidra) · metnin TEK kaynağı (4. tur).

Bu dosya dersin bütün sözlerini, boşluklarını, ipuçlarını ve planlayıcı sıralarını tutar; ders2.lesson.json ve
ders2.script.md buradan üretilir (elle düzenlenmez). Hece sayıları kodla sayılır (Türkçe ünlüler a e ı i o ö u ü â î û).
Çalıştırma: python3 ders2_kaynak.py   → ders2.lesson.json + timing.out.txt + ders2.script.md
Bulgu karşılıkları: fixlog.md ("Tur 3" ve "Tur 4" tabloları). Kimlikler (TR2-, G2-, H, EV2-, Z2-, L2-; 4. turda TR3-,
S3-, MT3-, EV3-, Z3-, L3-) yorumlarda geçer. Seslendirme yolu sahip kararıdır (2026-09-29): yalnız MCP.
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import timing  # noqa: E402  (aynı süre modeli ve planlayıcı)

VERSION = 'pilot-4 (2026-09-29)'
R, O, E = 'required', 'optional', 'extension'


def G(a, b, c):
    return {'min': float(a), 'pref': float(b), 'max': float(c)}


CARRIERS = []
SCENES = ('kiyi', 'orman')
# MT3-02 + L3-02: çok cümleli klip TEK TTS isteğidir (ezgi korunur), cümle sonlarından kesilir; uygulama cümleler arasına
# evreye göre sessizlik koyar (hepsi VARSAYIM). Nefes çifti (c2.akis, c4.x.yaklas) kendi değeriyle.
SENT_GAP = {'Varış': (0.6, 0.8, 1.0), 'Derinleşme': (0.8, 1.0, 1.3), 'Derin': (1.2, 1.8, 2.5), 'Kapanış': (0.8, 1.0, 1.2)}
BREATH_PAIR_GAP = (2.5, 3.0, 4.0)
SHORT_BELOW = 360      # L3-03 + MT3-05: 5 dakikalık sürüme özgü kısa biçim (hedef < 6 dk; sahibe görünür, VARSAYIM)


def clip(cid, text, tier=R, gap=(3, 4, 6), phase=None, cue=None, rank=None, group=None, requires=None,
         minTarget=None, window=None, alternates=None, pair=None, scenes=None, short=None, sentGap=None,
         breathPair=False, ttsText=None, sceneTts=None, **tags):
    c = {'id': cid, 'text': text, 'tier': tier, 'gapAfter': G(*gap) if not window else G(*window),
         'phase': phase, 'cue': cue or {}, 'tags': tags}
    if short:           # L3-03/MT3-05: hedef SHORT_BELOW'un altındaysa bu metin ve boşluk; kimlik aynı (önek kuralı)
        c['short'] = {'belowSec': SHORT_BELOW, 'text': short[0], 'gapAfter': G(*short[1])}
    if sentGap:         # MT3-02: nefes çifti gibi özel cümle arası sessizlik
        c['sentenceGap'] = G(*sentGap)
    if breathPair:      # MT3-02: tek cümlelik "bir …, bir …" çifti virgülden kesilir; TTS'e kesim için üç nokta gider
        c['breathPair'] = True
    if ttsText:
        c['ttsText'] = ttsText
    if pair:            # P-S6: bağlı çift; ortak klip hemen ardından çalıyorsa aradaki boşluk kısa (pairGap)
        c['pairWith'], c['pairGap'] = pair[0], G(*pair[1])
    if alternates:      # P-N5: dönüşümlü seçenek metinleri (oturum sayısına göre belirlenimci)
        c['alternates'] = [{'text': t} for t in alternates]
    if scenes:          # H6/L2-04: sahne seçici (başlamadan önce "Kıyı / Orman"); anahtar yoksa ana metin çalar
        c['scenes'] = {k: {'text': v} for k, v in scenes.items()}
        for k, t in (sceneTts or {}).items():
            c['scenes'][k]['ttsText'] = t
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
    'c1.kacirma': 145, 'k.yandakal': 400,
    # dalga 2: bacaklar, elin ayrıntısı, sırt (+ bölge işareti, L2-09), ondan geri sayma, niyet dileği, kapak ayrıntıları
    'c1.gecis.on': 205, 'bacak': 210, 'el': 215, 'sirt': 220, 'sayi10': 225, 'n2.dilek': 240, 'a.konfor': 250,
    'k.sesler': 410, 'k.zaman': 420, 'k.oda.ayrinti': 430, 'c2.durak': 285,
    # bütün-beden doruğu imgeden hemen önce (T5: C4'ün büyük girişinden önce 13. dakika aşırı esnemesin)
    # 4. tur: n2.x.his silindi (L3-07); süresi n2.hatirla'nın ardındaki sessizliğe verildi
    # 4. tur: yüzün ayrıntısı (yuz2) 550'den 298'e: 15. dakikada imge henüz sığmazken sessizlik aşırı esnemesin (T5)
    'butun': 290, 'yuz1': 292, 'a.x.kipir': 294, 'c2.x.ritim': 296, 'yuz2': 298,
    # imgeleme girer (C4 300); H2: adım (ayak tabanları) hemen ardından. 4. tur: c4.yerles zorunlu (MT3-11, L3-06),
    # c3.gelmezse zorunlu (S3-03), ikisinin de sırası yok
    'c4.yerles': 302, 'c4.adim': 305, 'c4.koku': 310, 'c4.pencere': 320, 'c4.x.istemiyor': 330, 'c4.acele': 340,
    # dalga 4: geride kalan sesler, ılık taş
    'c4.geride': 440, 'x.tas': 450,
    # dalga 5: sıcaklık ve serinlik (H13: zıtlığın ikinci dalgası), ayrıntılar
    'c3.sicakserin': 505, 'c3.zemin': 510, 'ayak': 520, 'c4.iz': 530, 'c3.nefeskadar': 540, 'c3.x.ikisi1': 545,
    'c3.fincan': 560, 'c3.pencere': 580, 'c3.x.ikisi2': 585, 'yuz3': 590,
    # sessiz dinlenme girer (C5 700); 4. tur: c5.genis silindi (MT3-01)
    'c5.pencere': 705,
    # genişletmeler (CRITIQUE #3, T2): bütün isteğe bağlılardan sonra. Z3-05: sıcak ve serin listeleri tek grup;
    # Z3-06: C5 genişletmeleri geç C4 genişletmelerinden önce; c5.x.sessizlik silindi (hiçbir planda çalmıyordu)
    'x.saymak': 1010, 'temas': 1030, 'x.agir2': 1040, 'x.hafif2': 1045,
    'c4.isik': 1050, 'x.sicakserin': 1060, 'c4.x.golge': 1065, 'c5.x.hepsi': 1070, 'c4.x.gok': 1075,
    'c5.x.yumusak': 1078, 'c4.ruzgar': 1080, 'c5.x.oldugu': 1082, 'c4.x.yaklas': 1085, 'c4.x.donus2': 1095,
}
# 4. tur (Z3-06'nın kuralı): c3.x.hepsi ve c5.x.dayanak bu turun değişikliklerinden sonra 156 planın, iki seçenek ve iki
# sahne takımının hiçbirinde çalmıyordu; hiç çalmayan metin üretilip denetlenmez. c5.x.dayanak'ın içeriğini (ağırlık ve
# zemin) artık zorunlu c5.sen taşıyor; c3.x.hepsi'nin "ikisi birden" adımını c3.x.ikisi1 ve c3.x.ikisi2 taşıyor.
ENTRY = {'C4': 284, 'C3': 315, 'C5': 700}


def rk(key):
    return RANK[key]


# ------------------------------------------------------------------------------------------------------------------
# VARIŞ (sabit kapak; TEK blok). 4. turun sırası (MT3-13, MT3-12): karşılama → derse özgü açılış → [konfor, uzanmadan
# önce] → duruş (ağırlığı zemine bırakmakla; MT3-05) → gözler → [kıpırdanıp yerleşme] → [kontrol] → ortak çıkış cümlesi
# → huzursuzluk normaldir → [zemin, 7. dakikadan; varış yerleşme cümlesiyle biter]. 5 dakikanın sırası değişmedi.
# TR2-03: ortak çıkış cümlesi (a.izin) üç "-(y)abil-" taşır; çevresindeki 60 sn'de başka "-(y)abil-" yoktur: duruş
# "-man yeterli", gözler "sana kalmış", zemin ve kontrol şimdiki zaman, huzursuzluk geniş zaman, konfor "iyi olur".
V = 'Varış'
# TR3-23: selamlama noktayla kapanır (iki kısa cümle; aralarına Varış cümle arası sessizliği, MT3-02/L3-02)
a_hosgeldin = clip('a.hosgeldin', 'Hoş geldin. Bu dakikalar senin.', gap=(1, 2, 3), phase=V,
                   cue={'visual': 'phase:varis', 'music': 'phase:varis'}, texture='varis')
# L3-12: "Yapman gereken hiçbir şey yok" hemen ardından gelen yönergelerle çelişiyordu; ana metin "başarman gerekmiyor",
# eski cümle dönüşümlü seçeneklerden biri
a_acilis = clip('a.acilis', 'Bir şey başarman gerekmiyor; yalnızca dinlenmek var.', gap=(2, 5, 7),
                phase=V, texture='varis', uniqueOpening=True,
                alternates=['Yapman gereken hiçbir şey yok; yalnızca dinlenmek var.',
                            'Bir yere yetişmen gerekmiyor; yalnızca dinlenmek var.'])
# MT3-13 (+ Z3-08): örtü ve yastık uzanmadan ÖNCE; eylem payı 12 sn (min = pref)
a_konfor = clip('a.konfor', 'Uzanmadan önce üstüne ince bir örtü, dizlerinin altına bir yastık alman iyi olur.', O,
                gap=(12, 12, 15), phase=V, rank=rk('a.konfor'), texture='varis',
                action='örtü ve yastık (uzanmadan önce; hazırlık kartındakiler elinin altında)')
# TR3-02 + MT3-05(2): "yan," virgülü ("yan!" emri gibi okunabiliyordu) ve çifte durum zarfı gitti; "yan yatmak" deyimi;
# 5 dakikanın zemin cümlesi aynı klipte (yeni klip yok); TR2-03 gereği "-man yeterli". MT3-05'in "ağırlığını zemine
# bırakman" yerine "zemine yerleşmen": 5 dakikanın en yoğun dakikası (varış) 150 hece sınırını aşıyordu
a_durus = clip('a.durus', 'Sırtüstü ya da yan yatıp zemine yerleşmen yeterli.', gap=(8, 8, 12),
               phase=V, texture='varis', action='uzanmak ve zemine yerleşmek', anchor='zemin')
# TR3-14 + S3-05: sabit nokta ve "yumuşak bakış" çevirisi gitti; açık gözün bakışı her sürümde serbest (G2-13)
a_gozler = clip('a.gozler', 'Gözlerini kapatmak ya da açık tutmak sana kalmış; bakışın serbest.',
                gap=(4, 4, 7), phase=V, texture='varis', eyes='baskı yok; bakış serbest, bir noktaya bağlı değil',
                eyesOpen=True, action='gözleri kapatmak ya da açık tutmak; bakış serbest')
a_kipir = clip('a.x.kipir', 'Bir iki kez kıpırdanıp yerleşmek de dinlenmenin bir parçası.', O, gap=(6, 6, 9), phase=V,
               rank=rk('a.x.kipir'), texture='varis', action='kıpırdanıp yerleşmek')
# H5 + MT3-05(2) + MT3-12: 7. dakikadan itibaren varışın SON cümlesi; zemin cümlesi a.durus'u yinelemez; ardından 8 sn
a_agirlik = clip('a.agirlik', 'Zemin seni baştan ayağa taşıyor.', O, gap=(8, 8, 12), phase=V,
                 rank=rk('a.agirlik'), texture='varis', action='zemine yerleşmek', anchor='zemin')
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
     'clips': [a_hosgeldin, a_acilis, a_konfor, a_durus, a_gozler, a_kipir, a_karar, a_izin, a_kolay, a_agirlik]}

# ------------------------------------------------------------------------------------------------------------------
# N1 · NİYET, BAŞTA · P1. TR3-04 (+ TR3-12): hazır niyet "Kendime dinlenmeye izin veriyorum." "dinlenme izni" hem
# olumsuz emir "DİNlenme" okunuşuna açıktı hem iş hukukundaki "dinlenme izni"ni çağrıştırıyordu; MCP yolunda (sahip
# kararı) takma ad sözlüğü ve previous_text olmadığı için eşyazımlı tuzak metinde çözülür. Bulgunun önerdiği
# "…dinlenmek için izin…" n1.sec'te "bugün için" ile ikinci bir "için" getiriyordu; "kendine -meye izin vermek" deyimi
# yararlanıcıyı taşır (TR2-04'ün kaygısı) ve bir hece kısadır.
# TR2-03 + H11: N1'de "-(y)abil-" yok. S3-08: söyleme eylemi "söylüyorsun" (itaat varsayan yönerge) değil "söylemek
# yeterli". L3-03 + MT3-05(3): 5 dakikada niyet bir kez söylenir (kısa biçim, kimlik aynı; sahibe görünür).
D1 = 'Derinleşme'
NIYET = '"Kendime dinlenmeye izin veriyorum."'
ORNEK = 'Aklına bir şey gelmezse önerim şu: ' + NIYET
N1 = {'id': 'N1', 'kind': 'core', 'priority': 1, 'playOrder': 1, 'niyet': True, 'title': 'Niyet, başta (ekranda: sankalpa)',
      'screenLabel': 'Niyet (sankalpa)', 'clips': [
    # H1(b): seçim ve hazır cümle tek klipte (her sürede; önek kuralı). Seçme süresi klibin ardındaki sessizliktir.
    # 4. tur: "Kendine bugün için" → "Bugün kendine" (iki "için" yok, iki hece kısa); "Kendine … Kendime" bilinçli yankı
    clip('n1.sec', 'Bugün kendine kısa bir niyet seçiyorsun. ' + ORNEK, gap=(8, 10, 15),
         phase=D1, cue={'visual': 'phase:derinlesme', 'music': 'phase:derinlesme'}, texture='niyet',
         action='niyeti seçmek', tts='tırnak içi hafif vurgulu; iki noktadan sonra doğal durak', repeatOk=['kendi'],
         alternates=['Bugün için kısa bir niyet seçiyorsun. ' + ORNEK,
                     'Kısa bir niyet cümlesi seçiyorsun. ' + ORNEK]),
    # Z3-03: üç sessiz söyleyiş için en az 10 sn (6 dakikadan itibaren; 5 dakikada kısa biçim)
    # "Şimdi" düştü (dolgu; 5 dakikanın payı): seçim klibinin hemen ardından zaman zaten belli
    clip('n1.soyle', 'Niyetini içinden üç kez söylemek yeterli.', gap=(10, 13, 20), phase=D1, texture='niyet',
         action='niyeti üç kez içinden söylemek', repeatOk=['niyet'],
         short=('Niyetini içinden bir kez söylemek yeterli.', (6, 8, 10))),
    # EV2-03: gelecek güvencesi yerine doğru bir söz (N2 her sürümde çalar). TR3-09: "tutunmak" çevirisi yerine
    # "aklında tutmak"
    clip('n1.birak', 'Dersin sonunda niyetini hatırlatacağım. O zamana kadar onu aklında tutman gerekmiyor.', O,
         gap=(6, 6.5, 8), phase=D1, rank=rk('n1.birak'), texture='niyet', repeatOk=['niyet']),
]}

# ------------------------------------------------------------------------------------------------------------------
# C1 · BEDEN DOLAŞIMI (sağ → sol → arka → ön → [temas] → bütün) · P1
END = (2, 3, 4.5)
c1_clips = [
    # TR2-03 + H12: iki kısa cümle; atlama kapısı güvenlik gereği emir kipiyle (güvenlik §11.B-1, -9).
    # TR3-13 + MT3-16 + L3-13: "Saydığım" (C2'deki saymayla çakışıyordu) → "Adını andığım" (bulgunun "söylediğim"i
    # 5 dakikada hemen önceki n1.soyle'nin "söylemek"iyle art arda gelirdi); ikinci cümle konuşma dilinin kısa biçimiyle
    # (H12: Derinleşme cümleleri Varış'ınkilerden kısa kalsın; 5 dakikanın en yoğun dakikası); geniş zamanın kehanet
    # okunuşu yerine şimdiki zamanla betimleme ("fark ediyorsun"); ardışık cümlede "yer" yinelenmez ("bölge")
    clip('c1.cerceve', 'Adını andığım her yeri fark ediyorsun. Rahatsız eden bir bölge olursa atla.',
         gap=(2.5, 3, 4), phase=D1, texture='dolasim-uzuv', safety='skip', mood='safety'),
    # TR2-08: bir yer tekrarlanmaz, adı tekrarlanır. TR3-13: hissetmemek bağışlanır, fark etme ile tekrar çekişmez;
    # MT3-08: "başka bir çabaya gerek yok" olumsuzluğu gitti; S3-08'in "söylemek yeterli"siyle 40 sn içinde ikinci bir
    # "yeterli" olmasın diye davet kipi
    clip('c1.tekrar', 'Hissetmesen de her adı içinden tekrarlayabilirsin.', O, gap=(3, 3.5, 4.5),
         phase=D1, rank=rk('c1.tekrar'), texture='dolasim-uzuv', normalize=True),
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
# TR3-17: "Yüz" (sayı / "yüz!" emri) ve tamlama belirsizliği gitti, "Bedenin arka tarafı." ile koşut. S3-04: hassas
# bölgelere (göğüs, karın) yakın ikinci atlama kapısı; emir kipi c1.cerceve gibi güvenlik gereği
# S3-04: kapı, sağ-sol listesi uzadığı anda girer (göğse 120 sn'den uzak kalınan her sürümde), ön listenin uzunundan önce
c1_clips.append(clip('c1.gecis.on', 'Yüzün ve bedenin ön tarafı. İstemediğin yeri yine atla.', O, gap=(1.5, 2, 3),
                     phase=D1, rank=rk('c1.gecis.on'), section='on', texture='dolasim-govde', region=True,
                     safety='skip', mood='safety', repeatOk=['beden', 'taraf']))
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
          # "zor gelirse" yok (H15, L2-06), "-(y)abil-" yok (TR2-03: c1.k1, c2.yer, c2.alt ile 60 sn'de dördüncü olurdu).
          # Müzik, görsel ve ses "Derin" evreye burada geçer. 4. tur: en kısa sessizlik 7 sn (5 dakikanın payı, T6)
          clip('c2.dikkat', 'Şimdi nefesini değiştirmeden izlemek yeterli. '
               'Ellerini hissetmek ya da gözlerini açmak da olur.', gap=(7, 10, 14), phase=D,
               cue={'visual': 'phase:derin', 'music': 'phase:derin'}, texture='nefes', safety='anchor', anchor='eller',
               eyesOpen=True),
          # TR2-12 + H7 + TR3-01: "X-le kalmak" çevirisi yerine "dikkatin …teyse"; nefesi seçene ve elleri seçene ayrı
          # seslenilir (ikisi tek grup)
          clip('c2.yer', 'Dikkatin nefesteyse onu en net fark ettiğin yeri bulabilirsin. Burun, göğüs, karın ya da '
               'başka bir nokta.', O, gap=(11, 14, 19), phase=D, rank=rk('c2.yer'), texture='nefes',
               repeatOk=['nefes']),
          clip('c2.alt', 'Dikkatin ellerindeyse avuçlarını hissedebilirsin.', O, gap=(9, 10, 13), phase=D,
               rank=rk('c2.alt'), requires=['c2.yer'], texture='nefes', safety='anchor', anchor='eller',
               repeatOk=['dikka']),
          # H1(a): 5–6 dakikada C2 = dikkat → akış (iki satır birbirini iptal etmez); "hiçbir şey yapmadan" 7 dk'dan.
          # MT3-02: nefes çifti; "geliyor" ile "gidiyor" arasında bir nefes yarımı (2,5 / 3 / 4 sn). L3-03 + MT3-05:
          # 5 dakikada gerçek bir durgunluk (16 / 18 / 20 sn; 20 sn pencere eşiğinin altında)
          clip('c2.akis', 'Nefes kendiliğinden geliyor. Kendiliğinden gidiyor.', gap=(9, 12, 18), phase=D,
               texture='nefes', repeatOk=['kendi', 'nefes'], sentGap=BREATH_PAIR_GAP,
               short=('Nefes kendiliğinden geliyor. Kendiliğinden gidiyor.', (16, 18, 20))),
          # H12: "onu" düştü. TR3-10: zaman için "kısa". L3-09: boş an yerine yeni nefesin kendiliğinden gelişi söylenir;
          # tutma yok (S14) bu cümleyle korunur, olumsuzluk kalıbı gitti (MT3-08'in amacı)
          clip('c2.durak', 'Nefes verdikten sonra kısa bir duraklama olabilir. Yeni nefes kendiliğinden gelir.', O,
               gap=(11, 14, 19), phase=D, rank=rk('c2.durak'), texture='nefes', repeatOk=['nefes', 'kendi']),
          clip('c2.sayac', 'Geriye doğru sayacağım. Nefes sayılara uymak zorunda değil.', O, gap=(2.5, 3, 4),
               phase=D, rank=rk('sayi5'), group='sayi5', texture='geri-sayma', repeatOk=['nefes']),
      ] + say + [
          # TR2-22 + G2-02 + H12: "bir turu saymak" ve belirsiz "baştan" gitti; duyuru bir kapı taşır. TR3-11: gözleri
          # kapalı dinleyene gerçek kapı "açsan da olur"; ilgisiz iki önerme artık noktalı virgülle bağlanmaz
          clip('c2.x.kendin', 'Bu kez sen içinden, kendi hızında ondan bire sayabilirsin; bire varınca tekrar ondan '
               'başlarsın. Gözlerini açsan da olur. Sonra yine seslenirim.', E, phase=D, rank=rk('x.saymak'),
               group='x.saymak', window=(50, 50, 60), cue={'visual': 'window', 'music': 'swell'}, texture='sessiz-sayma',
               announce=True, safety='door', eyesOpen=True),
          clip('c2.x.donus', 'Yeniden buradayım. Hangi sayıda kaldığın önemli değil.', E, gap=(4, 5, 7), phase=D,
               rank=rk('x.saymak'), group='x.saymak', requires=['c2.x.kendin'], texture='nefes', welcome=True,
               cue={'music': 'returnTone:-2s'}, repeatOk=['sayın', 'sayıl']),
          # H7: sayıları bırakma, sayım biter bitmez (pencerenin karşılamasından hemen sonra); TR2-13
          clip('c2.birak', 'Sayıları bırakabilirsin. Zihnin arada başka yerlere kaydıysa o da olur.', O, gap=(5, 6, 8),
               phase=D, rank=rk('sayi5'), group='sayi5', texture='nefes', normalize=True, repeatOk=['sayın', 'sayıl']),
          # MT3-08: olumsuzluk kalıbı yerine somut bir duyum (giren ve çıkan havanın sıcaklığı)
          clip('c2.x.ritim', 'Nefes kendi ritminde sürüyor. Giren hava serin, çıkan hava ılık olabilir.', O,
               gap=(10, 14, 20), phase=D, rank=rk('c2.x.ritim'), texture='nefes', repeatOk=['nefes'], sense='sıcaklık'),
          # H1(a): açılış cümlesine geri çağrı ("yalnızca dinlenmek var"). 4. tur: 6 dakikadan itibaren (7 yerine);
          # 6 dakikada C2 yine >= 55 sn olsun (PLAN B.3 adım 8); dikkat → akış → dinlenme sırası birbirini iptal etmez
          clip('c2.kal', 'Bir süre hiçbir şey yapmadan dinlenmek var.', gap=(12, 16, 20), phase=D,
               minTarget=360, texture='nefes', repeatOk=['dinle']),
      ]}

# ------------------------------------------------------------------------------------------------------------------
# KÖPRÜ · anahtar cümlenin ikinci geçişi. H3: yalnız C3 ya da C4 seçiliyse (aralarında bir blok varken) çalar.
# G2-08: durum iddiası yok ("dinleniyor" yerine "dinlenebilir"). L3-14: "Beden" değil "Bedenin" (1. geçişle aynı iyelik;
# uzaklaştırıcı "beden" yok; 16 → 13 → 8 hece). TR3-08: "sen uyanıksın" kurnazlık anlamını çağrıştırıyor mu, kör panel
# maddesi; çağrıştırırsa durum iddiası taşımayan yedek metin (panelFallback) kullanılır.
BR = {'id': 'BR.K2', 'kind': 'bridge', 'placement': {'after': 'C2'}, 'requiresAnyBlock': ['C3', 'C4'],
      'priority': 0, 'playOrder': 0,
      'title': 'Köprü: anahtar cümle (2. geçiş), nefes bloğunun hemen ardından (C3 ya da C4 varsa)',
      'clips': [clip('br.k2', 'Bedenin dinlenebilir; sen uyanıksın.', gap=(11, 12, 14), phase=D, key=2,
                     texture='anahtar', repeatOk=['dinle', 'beden'])]}
BR['clips'][0]['panelFallback'] = {
    'text': 'Bedenin dinlenebilir; sen buradasın.',
    'if': 'Kör panel "sen uyanıksın"ı kurnazlık anlamında ("çok uyanıksın") duyarsa (TR3-08)',
    'note': 'Durum iddiası yok ("dinlenirken" gibi bir durum bildirimi seçilmedi, G2-08); 16 → 13 → 8 kısalması korunur; '
            'c5.sen\'i ("Bedenin zeminde, sen buradasın.") ve son cümleyi ("Buradasın ve uyanıksın.") önceden yankılar '
            '(bilinçli nakarat).'}

# S1 + G2-03 + G2-13 + H12 + L2-06 + TR2-10: imgeden hemen önce kapı ve dayanak. "Hatırlatayım:" yok; dersi bitirme
# izni; açık gözün bakışı serbest; dayanak zor bir anı öngörmeden kurulur (öznesiz koşul da gitti).
# S3-06: zıtlıkların "bütün beden ağır/hafif"inden hemen sonra kıpırdama izni de söylenir (güvenlik §11.B-4).
# TR3-03: odak sırası: "hep" yüklemin önünde ("Zemin seni hep taşıyor."), "seni" vurgulanmaz.
BR_ORTA = {'id': 'BR.orta', 'kind': 'bridge', 'placement': {'before': 'C4'}, 'priority': 0, 'playOrder': 0,
           'title': 'Köprü: çıkış kapısı ve dayanak, imgelemeden hemen önce (C4 olan her sürüm)',
           'clips': [clip('br.orta', 'İstediğin an gözlerini açmak, kıpırdamak ya da dersi bitirmek senin elinde. '
                          'Gözlerin açıksa bakışın serbest. Zemin seni hep taşıyor.',
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
# Z3-05: sıcak ve serin listeleri tek grupta (x.sicakserin); zıt çift hiçbir sürümde tek taraflı çalmaz
sicak = carrier('car.sicak', [('c3.s1', 'Avuç içleri sıcak', E, 'x.sicakserin'),
                              ('c3.s2', 'ayak tabanları sıcak', E, 'x.sicakserin'),
                              ('c3.s2b', 'sırt sıcak', E, 'x.sicakserin'), ('c3.s3', 'bütün beden sıcak', E, 'x.sicakserin')],
                period=(3.4, 4.4, 6.0), texture='zitlik-sicak', gaps={'c3.s3': (6, 8, 12)}, ranks=RANK)
serin = carrier('car.serin', [('c3.r1', 'Yanaklar serin', E, 'x.sicakserin'),
                              ('c3.r2', 'burnun ucu serin', E, 'x.sicakserin'),
                              ('c3.r2b', 'eller serin', E, 'x.sicakserin'), ('c3.r3', 'bütün beden serin', E, 'x.sicakserin')],
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
      ] + agir + [
          # L2-05: başarısızlığı normalleştirir; göndergesi ("ağırlık") adıyla. S3-03: C3'ün her sürümünde (zorunlu);
          # MT3-09 + L3-11: denemeden ÖNCE değil, "bütün beden ağır."dan sonra
          clip('c3.gelmezse', 'Ağırlığı hissetmesen de olur. Sözcükleri dinlemen yeter.', gap=(3, 4, 6), phase=D,
               texture='zitlik-agir', normalize=True, repeatOk=['ağırl', 'hisse']),
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
          # EV2-05: bedenin hâlini değiştirdiği ima edilmez; isim cümlesi
          clip('c3.birak', 'Bu hisleri bırakabilirsin. Beden kendi hâlinde.', gap=(9, 16, 19), phase=D,
               texture='zitlik-sicak'),
      ]}

# ------------------------------------------------------------------------------------------------------------------
# C4 · İMGELEME + sessiz pencere · P2 · dersin TEK imge yayı. H6/L2-04: başlamadan önce "Kıyı / Orman / Ders içinde
# seçerim" (L3-05: ilk seferde varsayılan Orman); seçilen sahnenin ayrıntıları (ses, koku, iz, ışık, gök, yaklaşan ses)
# ve doğa katmanı sahneyi izler. "Ders içinde seçerim" (ana metin): "ya da" yalnız c4.yer'de (MT3-06); öteki ayrıntılar
# iki yere de uyar ve seçimi yeniden açmaz; doğa katmanı imge boyunca kısılır (L2-03 b).
# H2: en kısa C4'te bile bir ses ve bir sıcaklık ayrıntısı. MT3-11 + L3-06: dinlenecek köşe (c4.yerles) zorunlu; her
# imge yolculuğun bir varış yeri olur (patika → yürüyüş → ses → sıcaklık → köşe → dönüş).
IMG_ON = {'visual': 'image:on', 'music': 'layer:imge', 'nature': 'sahne: kıyı → uzak dalga, orman → yaprak; '
          'ana metinde doğa −8 dB (L2-03)'}
IMG_OFF = {'visual': 'image:off', 'music': 'layer:imge-off', 'nature': 'restore'}
C4 = {'id': 'C4', 'kind': 'core', 'priority': 2, 'playOrder': 5, 'entryRank': ENTRY['C4'],
      'title': 'İmgeleme: kıyı ya da orman (tek imge yayı) + sessiz pencere', 'clips': [
          clip('c4.yer', 'Zihninde sana iyi gelen bir yer belirebilir. Bir kıyı ya da bir orman.',
               gap=(10, 12, 15), phase=D, cue=IMG_ON, texture='imge', image='new', arc='giriş', safety='choice',
               scenes={'kiyi': 'Zihninde sana iyi gelen bir kıyı belirebilir.',
                       'orman': 'Zihninde sana iyi gelen bir orman belirebilir.'}),
          clip('c4.gelmezse', 'Bir görüntü gelmese de olur, gözlerin açık kalsa da.', gap=(9, 12, 15), phase=D,
               texture='imge', safety='alternative', eyesOpen=True, normalize=True),
          # 4. tur: "orada," düştü (gösterim yalnız "burada"; TR3-05'in ilkesi) ve Derin cümleleri kısa kalsın (H12)
          clip('c4.patika', 'Kendini yumuşak bir patikanın başında bulabilirsin.', gap=(7, 10, 14), phase=D,
               texture='imge', image='new', arc='yola çıkış', pair=('c4.yol', (6, 6.5, 7.5))),
          clip('c4.yol', 'Yol önünde açılıyor. Kendi hızında yürüyorsun.', gap=(8, 11, 14),
               phase=D, texture='imge', image='new', arc='yürüyüş'),
          clip('c4.adim', 'Her adımda ayak tabanlarını hissedebilirsin.', O, gap=(7, 10, 15), phase=D,
               rank=rk('c4.adim'), texture='imge', arc='yürüyüş', sense='dokunma'),
          # L3-15 + MT3-06: arkada "belli belirsiz izler" tekinsizdi ve yüzeysizdi; kendi izlerin, somut bir yüzeyde.
          # "ayak" c4.adim'in "ayak tabanları"yla art arda yinelenmesin, "yumuşak" c4.patika'yı yinelemesin diye yok
          clip('c4.iz', 'Yolda kendi izlerin kalıyor.', O, gap=(7, 10, 14), phase=D,
               rank=rk('c4.iz'), texture='imge', image='new', arc='yürüyüş',
               scenes={'kiyi': 'Kumda kendi izlerin kalıyor.',
                       'orman': 'Nemli toprakta kendi izlerin kalıyor.'}),
          # MT3-06: ana metin seçimi yeniden açmaz (ne dalga ne yaprak); "yumuşak" c4.patika'da geçtiği için "hafif"
          clip('c4.ses', 'Uzaktan gelip giden hafif bir ses var.', gap=(8, 12, 17),
               phase=D, texture='imge', image='new', arc='varış', sense='ses',
               scenes={'kiyi': 'Uzaktan gelip giden dalgaların sesi.',
                       'orman': 'Uzaktan gelip giden yaprak hışırtısı.'}),
          clip('c4.koku', 'Havada temiz, taze bir koku var.', O, gap=(6, 8, 11), phase=D,
               rank=rk('c4.koku'), texture='imge', image='new', arc='varış', sense='koku',
               scenes={'kiyi': 'Havada tuzlu bir deniz kokusu var.',
                       'orman': 'Havada ıslak toprak ve çam kokusu var.'}),
          # L3-06 (+ MT3-11): en kısa imgede de yolculuğun bir varış yeri var; "açık bir yer" iki sahneye de uyar (ormanda
          # açıklık, kıyıda açık kumsal)
          clip('c4.gunes', 'Açık, aydınlık bir yere varıyorsun. Güneş tenini tatlı tatlı ısıtıyor.', gap=(8, 11, 16),
               phase=D, texture='imge', image='new', arc='varış', sense='sıcaklık', arrival=True),
          clip('c4.ruzgar', 'Serin bir esinti yüzüne dokunup geçiyor.', E, gap=(6, 8, 11), phase=D,
               rank=rk('c4.ruzgar'), texture='imge', image='new', arc='varış', sense='dokunma'),
          # G2-09: gerçek kapanış eylemleriyle ("otur", "uzan") aynı fiiller yok. TR3-05: "Orada … Burada" gösterim
          # çatışması ve "dinlenme yeri" (yol kenarı tesisi) çağrışımı gitti. MT3-11 + L3-06: sıra 420 → 302 (c4.adim'dan
          # önce); zorunlu yapmak C4'ün girişini 15. dakikadan sonraya iterdi, varış yeri c4.gunes'te zaten var
          # TR3-05'in önerisinden iki fark: "Patikanın" yerine "Yolun" (en kısa imgede c4.patika ve c4.don ile üçüncü
          # "patika" olmasın) ve "kendine" düştü (Derin cümleleri kısa kalsın, H12); "-(y)abil-" bir, "otur/uzan" yok
          clip('c4.yerles', 'Yolun kenarında rahat bir köşe bulabilirsin.', O, gap=(14, 16, 18), phase=D,
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
          # MT3-06: belirsiz "dört bir yanda" yerine
          clip('c4.isik', 'Işık çevrende yumuşakça oynuyor.', E, gap=(8, 11, 16), phase=D,
               rank=rk('c4.isik'), texture='imge', image='new', arc='dinlenme', sense='görme',
               scenes={'kiyi': 'Işık suyun yüzeyinde oynuyor.',
                       'orman': 'Işık yaprakların arasından süzülüyor.'}),
          # TR3-06: ormanda art arda iki "…ların arasından" yok. 4. tur: kıyıda "suyun üstünde" c4.tas2'nin "üstüne"siyle
          # art arda geliyordu (genişletilmiş tekrar denetimi) → "yüzeyinde"
          clip('c4.x.gok', 'Yukarıda açık, geniş bir gökyüzü var.', E, gap=(8, 12, 16), phase=D, rank=rk('c4.x.gok'),
               texture='imge', image='new', arc='dinlenme', sense='görme',
               scenes={'orman': 'Dalların ötesinde açık bir gökyüzü görünüyor.'}),
          # TR3-20 + MT3-19: "uzak … uzaklaş" çınlaması gitti; c4.ses'e geri çağrı. MT3-02: nefes çifti; yaklaşma ile
          # uzaklaşma arasında bir nefes yarımı (virgülden kesilir; TTS'e kesim için üç nokta gider, ekranda virgül)
          clip('c4.x.yaklas', 'O ses bir yaklaşıyor, bir uzaklaşıyor.', E, gap=(9, 13, 17), phase=D,
               rank=rk('c4.x.yaklas'), texture='imge', arc='dinlenme', sense='ses', callback='c4.ses',
               breathPair=True, sentGap=BREATH_PAIR_GAP, ttsText='O ses bir yaklaşıyor… bir uzaklaşıyor.',
               scenes={'kiyi': 'Dalgalar bir yaklaşıyor, bir uzaklaşıyor.',
                       'orman': 'Rüzgâr yaprakları bir kıpırdatıyor, bir bırakıyor.'},
               sceneTts={'kiyi': 'Dalgalar bir yaklaşıyor… bir uzaklaşıyor.',
                         'orman': 'Rüzgâr yaprakları bir kıpırdatıyor… bir bırakıyor.'}),
          clip('c4.acele', 'Hiçbir şeyin acelesi yok.', O, gap=(8, 11, 16), phase=D, rank=rk('c4.acele'),
               texture='imge', arc='dinlenme'),
          # H15 + TR2-16: kapı "zor gelirse" demeden; "susacağım" yerine "sessiz kalacağım"; G2-11: kabarma rampalı.
          # TR3-04 (+ MT3-18, L3-08): "Biraz dinlenme zamanı." gitti (dinlenme dersinde "şimdiye dek dinlenmedin" imasi
          # ve "DİNlenme" olumsuz emir okunuşu); duyuru → kapı → dönüş sözü, c5.pencere ve c2.x.kendin ile aynı sıra
          clip('c4.pencere', 'Bir süre sessiz kalacağım. İstediğin an gözlerini açabilirsin. Sonra yine seslenirim.', O,
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
          clip('c4.solma', 'Görüntü usulca siliniyor. Seni taşıyan zemini yeniden hissedebilirsin.', gap=(10, 12, 14),
               phase=D, cue=IMG_OFF, texture='imge-donus', image='return', arc='kapanış', anchor='zemin'),
      ]}

# ------------------------------------------------------------------------------------------------------------------
# C5 · SESSİZ DİNLENME · P5 · yalnız imgeleme varsa. MT3-01: tanıklık (sakshi, Ders 9) ve açık izleme (Ders 5) içeriği
# çıkarıldı; blok bu dersin kendi motiflerine bağlanır: dinlenme, zemin ve anahtar cümlenin "beden / sen" yapısı.
# İmgedeki sese tek geri çağrı c5.dusunce'dir. L2-13: yatakta "sessiz dinlenme" dokusu (yalnız alçak, uzun yaylılar).
C5 = {'id': 'C5', 'kind': 'core', 'priority': 5, 'playOrder': 6, 'entryRank': ENTRY['C5'], 'requiresBlocks': ['C4'],
      'title': 'Sessiz dinlenme: bedenin zeminde, sen buradasın', 'clips': [
          # MT3-01: açılış cümlesine geri çağrı ("başarman gerekmiyor / yapman gereken…"); "Artık" yalnız k.donus'ta
          # kalır (TR2-11: sahte bitiş), bu yüzden bulgudaki "Artık" alınmadı
          clip('c5.basla', 'Yapacak bir şey yok; uzanmak yeter.', gap=(9, 12, 15), phase=D,
               texture='sessiz-dinlenme', cue={'music': 'layer:dinlenme'}),
          # TR2-18: "fark et-" çevirisi yerine "hisset-". H1/B.3-8: en kısa C5 de >= 55 sn
          clip('c5.beden', 'Kendini baştan ayağa tek bir bütün olarak hissedebilirsin.', gap=(10, 14, 18),
               phase=D, texture='sessiz-dinlenme'),
          # TR2-09: ortak yüklem bütün öznelere uyar. MT3-01: "sesler" (Ders 5'in açık izlemesi) çıktı
          clip('c5.x.hepsi', 'Nefes de bedendeki hisler de kendiliğinden akıyor.', E, gap=(9, 12, 17),
               phase=D, rank=rk('c5.x.hepsi'), texture='sessiz-dinlenme', pair=('c5.dusunce', (4, 5, 6)),
               repeatOk=['kendi', 'beden']),
          # MT3-06: ana metinde "ya da" yok; c4.ses'e geri çağrı
          clip('c5.dusunce', 'Düşünceler de gelip gidiyor. Tıpkı o uzak ses gibi.', gap=(8, 12, 17),
               phase=D, texture='sessiz-dinlenme', callback='c4.ses',
               scenes={'kiyi': 'Düşünceler de gelip gidiyor. Tıpkı dalgaların sesi gibi.',
                       'orman': 'Düşünceler de gelip gidiyor. Tıpkı yaprakların hışırtısı gibi.'}),
          clip('c5.x.yumusak', 'Yüzün yumuşak, çenen gevşek olabilir.', E, gap=(9, 12, 16), phase=D,
               rank=rk('c5.x.yumusak'), texture='sessiz-dinlenme'),
          # S3-09: dilek kipi ("kalsın") kıpırdamama gibi duyulabiliyordu. Bulgunun ilk önerisi ("…kalabilir") 30
          # dakikada c5.x.yumusak ve c5.pencere ile 60 sn'de dört "-(y)abil-" veriyordu; bulgunun yedeği kullanıldı
          clip('c5.x.oldugu', 'Hiçbir şeyi düzeltmen gerekmiyor.', E, gap=(10, 14, 18), phase=D, rank=rk('c5.x.oldugu'),
               texture='sessiz-dinlenme'),
          # MT3-01: tanık göstergesi ("Bütün bunları fark eden sensin.") yerine anahtar cümlenin yapısı ve son cümlenin
          # "Buradasın"ı; L3-14 gereği "Bedenin"
          clip('c5.sen', 'Bedenin zeminde, sen buradasın.', gap=(10, 12, 14), phase=D, texture='sessiz-dinlenme',
               anchor='zemin', repeatOk=['beden']),
          # TR2-10 + H12 + L2-07: önce davet, sonra (öznesi olan) kapı, en son dönüş sözü. MT3-01: "izleyebilirsin"
          # (tanıklık) yerine "dinlenebilirsin"
          clip('c5.pencere', 'Bir süre sessizce dinlenebilirsin. Bir şey zor gelirse zemini hissedebilirsin. '
               'Sonra yine seslenirim.',
               O, rank=rk('c5.pencere'), group='c5.pencere', phase=D, window=(30, 45, 90),
               cue={'visual': 'window', 'music': 'swell'}, texture='sessiz-dinlenme',
               announce=True, anchor='zemin', safety='door', repeatOk=['zemin']),
          clip('c5.donus', 'Buradayım.', O, rank=rk('c5.pencere'), group='c5.pencere', gap=(3, 4, 6), phase=D,
               texture='sessiz-dinlenme', welcome=True,
               cue={'music': 'returnTone:-2s'}),
      ]}

# ------------------------------------------------------------------------------------------------------------------
# N2 · NİYET, SONDA · P1. TR2-05 + H10 + L2-11: tırnak içindeki nokta artık cümlenin sonunda; son duyulan şey niyetin
# kendisi. "şimdi" yok (c2.dikkat 5 dakikada 60 sn'den yakın). TR2-04: hazır niyet.
# S3-08: "söylüyorsun" yerine "söylemek yeterli" (itaat varsayan yönerge yok). TR3-04: yeni hazır niyet. L3-03 +
# MT3-05(3): 5 dakikada "bir kez daha" (kısa biçim; hazır cümle yine söylenir, P-S11). Z3-03: üç söyleyişe en az 10 sn.
# L3-07 (+ MT3-10): "Sözlerin ardından kısa bir sessizlik." sahne yönergesi gibi duyuluyordu; klip silindi, süresi bu
# klibin ardındaki sessizliğe verildi (pref 15 → 17 sn; en çok 20, duyurusuz sessizliğin 20 sn tavanı); o sessizlik
# söylenmez, yalnızca bırakılır.
N2 = {'id': 'N2', 'kind': 'core', 'priority': 1, 'playOrder': 7, 'niyet': True, 'title': 'Niyet, sonda', 'clips': [
    clip('n2.hatirla', 'Başta seçtiğin niyeti içinden üç kez söylemek yeterli. Ya da yine şunu: ' + NIYET,
         gap=(10, 17, 20), phase=D, texture='niyet-son', action='niyeti üç kez içinden söylemek',
         short=('Niyetini içinden bir kez daha söylemek yeterli. Ya da yine şunu: ' + NIYET, (7, 9, 12))),
    # EV2-03 + L2-17: günün saatinden bağımsız. TR3-15: "…seninle olsun" dua ağzı ve "İstersen + 3. kişi dilek kipi"
    # gitti; seçim dinleyicide ("sana kalmış"), "-(y)abil-" yok. Bulgunun "bundan sonra da yanında taşımak"ı yerine daha
    # somut ve kısa "dersten sonra da taşımak" (H12: Derin cümleleri Derinleşme'dekilerden kısa kalsın)
    clip('n2.dilek', 'Niyetini dersten sonra da taşımak sana kalmış.', O, gap=(5, 7, 10), phase=D,
         rank=rk('n2.dilek'), texture='niyet-son', repeatOk=['niyet']),
]}

# ------------------------------------------------------------------------------------------------------------------
# KAPANIŞ (sabit kapak, TEK blok; gündüz dönüşü). Eylem payları (B2, T1, S4, T9, Z2-03, Z2-05) sıkıştırılmaz.
K = 'Kapanış'
# G2-08: anahtar cümle 3 bir durum iddiası değil (16 → 13 → 8 hece); H4: tez yerine otursun diye 5/6/9 sn
k_anahtar3 = clip('k.anahtar3', 'Uyanık bir dinlenme bu.', gap=(5, 6, 9), phase=D, key=3, texture='anahtar',
                  repeatOk=['dinle'])
# L2-02: dalıp giden dinleyiciye tanıdık dönüş tınısı; ses rampası k.anahtar3'ün ardındaki sessizlikte (−3 → 0 dB),
# "Artık dönüş zamanı." 0 dB'de; ardından 3,5 sn (VARSAYIM)
k_donus = clip('k.donus', 'Artık dönüş zamanı.', gap=(3.5, 3.5, 5), phase=K,
               cue={'music': 'phase:kapanis; returnTone:-2s', 'visual': 'dawn',
                    'voiceGain': 'rampa −3 → 0 dB, k.anahtar3 sonundan k.donus başına (sessizlik boyunca; basamak yok)'},
               texture='kapanis')
# TR2-19 + H4 + L2-14: "dönüş… dönebilir" kökü yan yana gelmez; nefes derinleştirilmez (güvenlik §11.B-14).
# TR3-16: kitabi ve "kendi" ile artık "olağan" düştü. Bulgunun "her zamanki"si alınmadı: hemen önceki k.donus
# "Artık dönüş zamanı." der ("zaman … zaman" art arda)
k_nefes = clip('k.nefes', 'Nefesin kendi ritmini bulabilir.', gap=(4, 4, 7), phase=K, step='nefes',
               texture='kapanis')
# TR2-20 + H8(3) + L2-15 + G2-12: koşut bağlama; oda varsayımı yok
k_sesler = clip('k.sesler', 'Yakındaki ve uzaktaki sesler yeniden duyuluyor.', O, gap=(6, 6, 8), phase=K,
                rank=rk('k.sesler'), step='sesler', texture='kapanis')
# G2-07 + EV2-11 + TR2-20: her harekette "ağrı ya da baş dönmesi" (güvenlik §11.B-17), doğal söyleyişle; TR2-03:
# "oynatıp" (tek "-(y)abil-"). TR3-07: nesnesiz "bırak" bu derste "gevşe" demekti; güvenlik satırının tek okunuşu var:
# "hareketi bırak". MT3-14: iki eylem (oynatmak ve acele etmeden gerinmek) için 10 sn
k_hareket = clip('k.hareket', 'El ve ayak parmaklarını oynatıp zorlamadan gerinebilirsin. Bir yerin ağrırsa ya da '
                 'başın dönerse hareketi bırak.', gap=(10, 10, 13), phase=K, step='parmak+gerin', texture='kapanis',
                 mood='safety', action='parmakları oynatmak ve gerinmek', repeatOk=['dön'])
# G2-12 + Z2-05: çevreye bakış; iki eylem için 9 sn
k_goz = clip('k.goz', 'Gözlerini ışığa alıştıra alıştıra açıp çevrende birkaç şeye bakabilirsin.', gap=(9, 9, 12),
             phase=K, cue={'music': 'chord'}, step='goz+oda', texture='kapanis', eyes='ışığa yavaş alışma',
             action='gözleri açıp çevreye bakmak')
k_oda_ayrinti = clip('k.oda.ayrinti', 'Bir renk, bir biçim, bir doku.', O, gap=(8, 8, 10), phase=K,
                     rank=rk('k.oda.ayrinti'), step='oda', texture='kapanis')
# TR2-01 + H8(2): "saatin" eşyazımı ve 3. tekil okuma yok; tek 2. tekil yüklem
k_zaman = clip('k.zaman', 'Günün hangi saatinde ve nerede olduğunu hatırlıyorsun.', O, gap=(4.5, 4.5, 7), phase=K,
               rank=rk('k.zaman'), step='oda', texture='kapanis')
# L3-16 + MT3-17: yan yatan dinleyici öteki yanına dönmeye çağrılmasın
k_yan = clip('k.yan', 'Sırtüstü yatıyorsan önce bir yanına dön.', gap=(6, 6, 8), phase=K, step='yan', texture='kapanis',
             mood='safety', repeatOk=['yanın'], action='yana dönmek')
# Z2-03: "bir süre" gerçekten bir süre
k_yandakal = clip('k.yandakal', 'Bir süre yan yatarak dinlenmek de olur.', O, gap=(12, 12, 15), phase=K,
                  rank=rk('k.yandakal'), step='yan', texture='kapanis')
k_otur = clip('k.otur', 'Ellerinden destek alarak yavaşça doğrulup otur.', gap=(8, 8, 11), phase=K, step='otur',
              texture='kapanis', mood='safety', action='doğrulup oturmak')
# MT3-04 + L3-04 (+ TR3-21): 100 sn'de üçüncü "başın dönerse" gitti; baş dönmesi satırı hareket (G2-07) ve kalkış (G2-04)
# kliplerinde kalır. TR3-21'in "acelen yok" eki alınmadı: hemen ardından gelen k.kalk "acele etmeden" der
k_bekle = clip('k.bekle', 'Kalkmadan önce birkaç nefes böyle kal.', gap=(12, 12, 16),
               phase=K, step='bekle', texture='kapanis', mood='safety', action='oturarak birkaç nefes beklemek')
# G2-04: kalkış anında baş dönmesi satırı; MT3-04 + L3-04: son cümleden ayrı klip; güvenlik §11.A kartının "otur ve
# bekle"si, ayağa kalkmış dinleyici için "yeniden" ile
k_kalk = clip('k.kalk', 'Sonra acele etmeden kalkabilirsin; başın dönerse yeniden otur ve bekle.', gap=(3, 3, 4),
              phase=K, step='kalk', texture='kapanis', mood='safety', action='acele etmeden kalkmak')
# EV2-01 + H9: sonuç iddiası ("dinlenmiş") yok; MT3-04 + L3-04: dersin son sözü tek başına, bir sessizlikten sonra;
# bitiş ipuçları (görsel sonu, müziğin 5 sn'de sönmesi) bu klipte; şafak akoru k.goz'da kalır
k_son = clip('k.son', 'Buradasın ve uyanıksın.', gap=(5, 5, 8), phase=K,
             cue={'music': 'fade:5s', 'visual': 'end'}, step='son', texture='kapanis')
KBLOCK = {'id': 'K', 'kind': 'closing', 'priority': 0, 'playOrder': 99,
          'title': 'Kapanış (tek kapak; isteğe bağlılar süreyle eklenir)',
          'clips': [k_anahtar3, k_donus, k_nefes, k_sesler, k_hareket, k_goz, k_oda_ayrinti, k_zaman,
                    k_yan, k_yandakal, k_otur, k_bekle, k_kalk, k_son]}

# "Kapanışa geç" (PLAN B.5): o anki klip (4. turda: o anki CÜMLE) biter, bu hızlı kapanış çalar.
# S3-01 (+ MT3-07): düğmeye imge (C4, c4.solma'dan önce) ya da zıtlıklar (C3, c3.birak'tan önce) sırasında basılırsa
# önce eşleşen ön klip çalar: imge silinir ve zemine dönülür / zıtlık hisleri bırakılır. Yeni klipler: c4.solma ve
# c3.birak k.nefes, k.hareket, k.goz ile 60 sn içinde dördüncü "-(y)abil-"i getirirdi (TR2-03). Duyurulmuş bir
# pencerenin içinde basılırsa önce dönüş tınısı ve o pencerenin karşılama klibi. Aynı ön klipler C3/C4'ten bırakma klibi
# çalmadan çıkan her sarmada da çalar. S3-02: 4 sn ön sessizlik; dönüş tınısı ilk sözden 2 sn önce; ses kazancı bu
# sessizlik boyunca o anki evre düzeyinden 0 dB'e rampa (basamak yok).
k_hizli_imge = clip('k.hizli.imge', 'Görüntü usulca siliniyor. Zemin seni taşıyor.', gap=(8, 8, 10), phase=K,
                    cue={'visual': 'image:off', 'music': 'layer:imge-off', 'nature': 'restore'}, texture='kapanis',
                    image='return', anchor='zemin', prefixFor='C4')
# S3-01'in "Hisler yavaşça çözülüyor." cümlesi alınmadı: "yavaşça" k.otur'la 60 sn içinde yinelenen dolgu olurdu ve
# "çözülüyor" hissedilmeyebilecek bir durum bildirir (G2-08, EV2-05); c3.birak'ın "-(y)abil-"siz karşılığı
k_hizli_his = clip('k.hizli.his', 'Bu hisleri bırakmak yeterli. Beden kendi hâlinde.', gap=(6, 6, 8), phase=K,
                   texture='kapanis', prefixFor='C3')
QUICK = {'id': 'K.hizli', 'kind': 'utility', 'title': '"Kapanışa geç" için hızlı kapanış',
         'cue': {'music': 'phase:kapanis; returnTone:-2s', 'visual': 'dawn',
                 'voiceGain': 'rampa: o anki evre düzeyinden 0 dB\'e 4 sn, ilk sözün başında biter (S3-02)'},
         'leadInSec': 4.0, 'voiceGainRampSec': 4.0,
         'prefixByActiveBlock': {'C4': [k_hizli_imge], 'C3': [k_hizli_his]},
         'releaseClip': {'C4': 'c4.solma', 'C3': 'c3.birak'},
         'windowReturn': {'c2.x.kendin': 'c2.x.donus', 'c4.pencere': 'c4.donus1', 'c5.pencere': 'c5.donus'},
         'rule': ('Düğmeye basılınca o anki cümle biter. O anki klip C4\'te ve c4.solma\'dan önceyse (imge açık) ya da '
                  'C3\'te ve c3.birak\'tan önceyse ön klip çalar. Duyurulmuş bir pencerenin sessizliğindeyse önce dönüş '
                  'tınısı ve karşılama klibi (evre düzeyinde), sonra en az 4 sn\'lik rampa sessizliği. Aynı ön klipler, '
                  'C3 ya da C4\'ten bırakma klibi çalmadan çıkan her sarmada (kapanışa ya da başka bir bloğa) da çalar.'),
         'clips': [k_nefes, k_hareket, k_goz, k_yan, k_otur, k_bekle, k_kalk, k_son]}
# Durdur (X): Z2-01 + G2-05: yana dönüp oturmaya 13 sn; ses oturur durumda biter, bekleme ekran metniyle sürer.
# TR3-22: dinleyici zaten oturdu ("sonra otur"); süreli "otur" yerine k.bekle ile aynı "böyle kal"
STOP = {'id': 'D.durdur', 'kind': 'utility', 'title': 'Durdur (X) sonrası isteğe bağlı 20–30 sn sesli dönüş',
        'clips': [clip('d.goz', 'Gözlerini aç, etrafına bak, acele etme.', gap=(3, 3, 4), phase=K, mood='safety',
                       step='goz', screen='Durdurma ekranı metniyle aynı'),
                  clip('d.kalk', 'Uzanıyorsan önce yana dön, sonra otur.', gap=(13, 13, 14), phase=K, mood='safety',
                       step='yan', screen='Durdurma ekranı metniyle aynı'),
                  clip('d.bekle', 'Birkaç nefes böyle kal; başın dönerse biraz daha bekle.', gap=(1, 1, 2), phase=K,
                       mood='safety', step='bekle')]}

# Kaynaklar (hepsi *.dogrulanmis.md dosyalarından): (PMID, kart künyesi, §8 ayrıntısı, DOI, dosya). EV3-02, EV3-04,
# EV3-09 bu turda. Kart künyeleri kullanıcıya gösterilir: sonuç iddiası yok.
REFS = [
    ('39690521', 'Luu 2024 · travma-duyarlı yoga nidra, 10 bileşen',
     'Luu 2024 (travma-duyarlı YN, 10 bileşen; öneri makalesi)', '10.17761/2024-D-24-00021', 'sakin, güvenlik'),
    ('40373021', 'Moszeik, Rohleder & Renner 2025 · 11 ve 30 dakikalık yoga nidra',
     'Moszeik 2025 (11 ve 30 dk YN; çevrimiçi, iki ay; müziksiz kayıt; başta ve sonda niyet; doğrudan karşılaştırmada '
     'fark yalnız "farkında davranma"da, d=0,10, %95 GA −0,01 ile 0,44)', '10.1002/smi.70049', 'sakin, teslim'),
    ('41327816', 'Ghai, Odyniec & Ghai 2025 · 73 çalışmalık yoga nidra meta-analizi',
     'Ghai, Odyniec & Ghai 2025 (73 çalışmalık YN meta-analizi; yazarlara göre etkiler muhtemelen şişirilmiş)',
     '10.1111/nyas.70149', 'sakin'),
    ('41743305', 'Gibbs 2026 · tek seans yoga nidra ve beden taraması',
     'Gibbs 2026 (kronik ağrılı yetişkinler, yarı deneysel, n=23)', '10.4103/ijoy.ijoy_2_25', 'sakin'),
    ('34306146', 'Toussaint 2021 · derin nefes talimatı ve uyarılma',
     'Toussaint 2021 (60 sağlıklı öğrenci; derin nefes talimatı ve uyarılma)', '10.1155/2021/5924040', 'sakin, güvenlik'),
    ('42757902', 'Shuminsky & Davidow 2026 · konuşma hızı ve doğallık',
     'Shuminsky & Davidow 2026 (12 kadın konuşmacı, 28 dinleyici; net konuşma ve doğallık; konuşma dili doğrulanmış '
     'dosyada belirtilmemiş)', '10.1044/2026_JSLHR-25-00691', 'teslim'),
    ('16941239', 'Knowlton & Larkin 2006 · azalan anlatım',
     'Knowlton & Larkin 2006 (48 yüksek kaygılı genç kadın, tek seans PKG; azalan anlatım)', '10.1007/s10484-006-9014-6',
     'teslim'),
    ('16199412', 'Bernardi 2006 · müzik ve sessizlik',
     'Bernardi 2006 (müzik dinleme deneyi, 24 kişi; 2 dk müziksiz sessizlik; basit ritimler uyarılmayı artırdı)',
     '10.1136/hrt.2005.064600', 'sakin, teslim'),
    ('42466037', 'Lieutaud & Bourhis 2026 · rehberli ve rehbersiz pratik',
     'Lieutaud & Bourhis 2026 (8 haftalık rehberli ve rehbersiz program; koçluk dahil, ses rehberliğinin payı '
     'ayrılamaz)', '10.3389/fpsyg.2026.1833806', 'teslim'),
    ('19493324', 'Wood 2009 · olumlu cümle tekrarı', 'Wood 2009 (olumlu cümle tekrarı)',
     '10.1111/j.1467-9280.2009.02370.x', 'benlik'),
    ('3069875', 'Braith 1988 · gevşeme sırasında huzursuzluk',
     'Braith 1988 (30 subklinik kaygılı kişi, tek seans kayıttan PKG)', '10.1016/0005-7916(88)90040-7', 'güvenlik'),
    ('32820538', 'Farias 2020 · meditasyonda istenmeyen etkiler',
     'Farias 2020 (83 çalışma; istenmeyen etkiler toplam %8,3, deneysel %3,7, gözlemsel %33,2)', '10.1111/acps.13225',
     'güvenlik, sakin, benlik'),
    ('28300508', 'Howard 2017 · dönüşün önemi', 'Howard 2017 (klinik yorum ve 3 vaka; dönüşün önemi)',
     '10.1080/00029157.2016.1203281', 'güvenlik'),
    ('34260686', 'Tran 2021 · ayağa kalkınca ilk kan basıncı düşüşü',
     'Tran 2021 (ayağa kalkınca ilk KB düşüşü; sürekli ölçümle 65 yaş üstünde havuzlanmış %29,0, %95 GA 22,1–36,9, '
     'I²=%94,6)', '10.1093/ageing/afab090', 'güvenlik'),
    ('24882909', 'Cordi 2014 · telkin ve şekerleme', 'Cordi 2014 (70 sağlıklı genç kadın; telkin ve şekerleme)',
     '10.5665/sleep.3778', 'sakin, teslim, güvenlik'),
    ('24146758', 'Cramer 2013 · yoganın yan etkileri', 'Cramer 2013 (yoga yan etkileri, vaka raporları)',
     '10.1371/journal.pone.0075515', 'güvenlik'),
    ('31357980', 'Cramer 2019 · gözetimsiz pratik', 'Cramer 2019 (gözetimsiz, tek başına pratik ve yan etkiler; anket, '
     'n=1.702)', '10.1186/s12906-019-2612-7', 'güvenlik'),
    ('3148637', 'Ley 1988 · gevşeme sırasında hızlı soluma (kuramsal derleme)',
     'Ley 1988 (kuramsal derleme; kronik olarak hızlı soluyanlar; özet 3. tur incelemesinde ve 4. turda PubMed\'den '
     'yeniden çekildi, metinle uyumlu)', '10.1016/0005-7916(88)90054-7', 'güvenlik §2'),
    ('10483629', 'Khasky & Smith 1999 · gevşemede uzaklaşma hissi',
     'Khasky & Smith 1999 (uzaklaşma hissi hem olumsuz duyguyla hem bedensel gevşemeyle ilişkili; özet 3. tur '
     'incelemesinde ve 4. turda PubMed\'den yeniden çekildi)', '10.2466/pms.1999.88.2.409', 'güvenlik §2'),
]

BLOCKS = [A, N1, C1, C2, BR, C3, BR_ORTA, C4, C5, N2, KBLOCK]


# ------------------------------------------------------------------------------------------------------------------
def all_clips_for_finalize():
    """Blokların, hızlı kapanışın (ön klipleri dahil) ve Durdur dizisinin bütün klipleri."""
    out = []
    for b in BLOCKS + [QUICK, STOP]:
        out += b['clips']
    for pre in QUICK['prefixByActiveBlock'].values():
        out += pre
    return out


def subclip_entries(text, base, c):
    """MT3-02/L3-02: çok cümleli (ya da nefes çifti) birim tek TTS isteğidir; kesilen her cümle uygulamada ayrı dosya."""
    probe = dict(c)
    probe['text'] = text
    parts = timing.sub_texts(probe)
    if len(parts) < 2:
        return None
    return [{'index': i, 'text': t, 'syllables': timing.syllables(t),
             'voice': {v: {'file': 'public/yoga/ders2/%s/%s.%d.m4a' % (v, base, i), 'sec': None}
                       for v in ('female', 'male')}} for i, t in enumerate(parts, 1)]


def finalize():
    # Kapanış evresinin bütün sessizlikleri ve Varış'ın eylem payları sıkıştırılmaz (min = pref). k.anahtar3 Derin
    # evrededir (H4: 5 / 6 / 9 sn, esneyebilir). Ön klipler (S3-01) de Kapanış evresindedir.
    for c in all_clips_for_finalize():
        if c['phase'] == K:
            c['gapAfter']['min'] = c['gapAfter']['pref']
    for c in A['clips']:
        if c['tags'].get('action'):
            c['gapAfter']['min'] = c['gapAfter']['pref']
    est_rate, est_prof = 5.6, timing.profile('hi', 5.6)
    for c in all_clips_for_finalize():
        c['syllables'] = timing.syllables(c['text'])
        c['words'] = len(timing.words(c['text']))
        c['sentences'] = len(timing.sentences(c['text'])) if not c.get('carrier') else 1
        c['required'] = (c['tier'] == R)
        c['voice'] = {v: {'file': 'public/yoga/ders2/%s/%s.m4a' % (v, c['id']), 'sec': None}
                      for v in ('female', 'male')}
        c['tags'] = {k: v for k, v in c['tags'].items() if v is not None}
        if not c.get('carrier'):
            # MT3-02/L3-02: cümle arası sessizlik evreye göre (klipte özel değer yoksa)
            if 'sentenceGap' not in c:
                c['sentenceGap'] = G(*SENT_GAP[c['phase']])
            subs = subclip_entries(c['text'], c['id'], c)
            if subs:
                c['subclips'] = subs
                c['voice'] = {v: {'file': 'yoga-uretim/ders2/%s/%s.wav' % (v, c['id']), 'sec': None,
                                  'note': 'birim arşivi (tek TTS isteği); uygulama subclips dosyalarını çalar'}
                              for v in ('female', 'male')}
                c['ttsUnit'] = {'text': c.get('ttsText', c['text']),
                                'cut': ('virgülden (nefes çifti; TTS metninde kesim için üç nokta)' if c.get('breathPair')
                                        else 'cümle sonlarından') + '; parça sayısı tutmazsa insan kararı'}
        for j, a in enumerate(c.get('alternates') or [], 2):
            a['syllables'] = timing.syllables(a['text'])
            a['words'] = len(timing.words(a['text']))
            a['voice'] = {v: {'file': 'public/yoga/ders2/%s/%s.v%d.m4a' % (v, c['id'], j), 'sec': None}
                          for v in ('female', 'male')}
            subs = subclip_entries(a['text'], '%s.v%d' % (c['id'], j), c)
            if subs:
                a['subclips'] = subs
        for sc, s in (c.get('scenes') or {}).items():
            s['syllables'] = timing.syllables(s['text'])
            s['words'] = len(timing.words(s['text']))
            s['voice'] = {v: {'file': 'public/yoga/ders2/%s/%s.%s.m4a' % (v, c['id'], sc), 'sec': None}
                          for v in ('female', 'male')}
            subs = subclip_entries(s['text'], '%s.%s' % (c['id'], sc), c)
            if subs:
                s['subclips'] = subs
        if c.get('short'):
            sh = c['short']
            sh['syllables'] = timing.syllables(sh['text'])
            sh['words'] = len(timing.words(sh['text']))
            sh['sentences'] = len(timing.sentences(sh['text']))
            if sh['text'] != c['text']:
                sh['voice'] = {v: {'file': 'public/yoga/ders2/%s/%s.kisa.m4a' % (v, c['id']), 'sec': None}
                               for v in ('female', 'male')}
                subs = subclip_entries(sh['text'], '%s.kisa' % c['id'], c)
                if subs:
                    sh['subclips'] = subs
            else:
                sh['voice'] = 'ana metinle aynı ses (yalnız boşluk değişir)'
        if c.get('panelFallback'):
            c['panelFallback']['syllables'] = timing.syllables(c['panelFallback']['text'])
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
                         'ttsText (isteğe bağlı; ekran metninden farklı TTS metni gerektiğinde, L2-11). 4. tur: '
                         'subclips[index,text,syllables,voice] + sentenceGap{min,pref,max} + ttsUnit (MT3-02/L3-02: çok '
                         'cümleli birim tek TTS isteğidir, cümle sonlarından kesilir; motor alt klipleri sırayla çalar ve '
                         'aralarına sentenceGap koyar; subclips varsa voice birimin arşividir, pakete girmez; duraklatınca '
                         'birimin başından sürdürülür, "Kapanışa geç" o anki cümlenin bitmesini bekler); breathPair (tek '
                         'cümlelik "bir …, bir …" çifti virgülden kesilir); short{belowSec,text,gapAfter} (L3-03/MT3-05: '
                         'hedef belowSec\'in altındaysa aynı kimlikle kısa metin ve boşluk); panelFallback (TR3-08: kör '
                         'panel kararına bağlı yedek metin). minSec/prefSec/maxSec tahmindir (5,6 hece/sn + yüksek '
                         'duraklama; cümle arası sessizlikler dahil); üretimden sonra voice.*.sec ile yeniden hesaplanır.'),
        'id': 'ders2-derin-dinlenme', 'version': VERSION,
        # TR2-23: "-arak" zarf-fiili somut ad öbeğine bağlanmaz. EV3-12: sonuç sözü değil davet (Türkçe editör onayı)
        'title': 'Derin Dinlenme (Yoga Nidra)', 'tagline': 'Uyanıkken derin bir dinlenmeye davet.',
        'daypart': 'day', 'posture': 'lying', 'defaultMinutes': 20, 'minutes': {'min': 5, 'max': 30, 'step': 1},
        # TR2-23: tek okunuşlu güvenlik satırı; G2-03: "dersi bitirebilirsin" (ses ve ekran aynı). S3-07: ölçünlü biçim,
        # tek okunuş; su da (güvenlik §11.A kartı "suda", §11.C "suda, küvette")
        'openingNotice': 'Bu dersi yalnızca araç ya da makine kullanmadığın ve suda olmadığın bir sırada dinle.',
        'openingScreen': ['İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin.',
                          'Bu dersi yalnızca araç ya da makine kullanmadığın ve suda olmadığın bir sırada dinle.',
                          'Uzanarak yaptığın derslerden sonra önce yana dön, otur, sonra kalk.'],
        # TR2-23: koşut ad öbekleri
        'preparationCard': ['İnce bir örtü', 'Dizlerinin altı için bir yastık', 'Uzanabileceğin rahat bir yüzey'],
        # L2-10: hazırlık kartında tek dokunuşla; kullanıcı başına hatırlanır
        'preparationToggles': [{'id': 'speechClarity', 'label': 'Konuşmayı daha net duymak istiyorum',
                                'default': False, 'remember': 'kullanıcı başına',
                                'effect': 'voicePhaseGainDb.clarityMode + music.clarityMode + qa.speechOverBedDbMinClarity',
                                'preselect': 'profilde yaş bilgisi 60 ve üstüyse önceden işaretli (L3-10; profil alanı '
                                             'doğrulanmadı, VARSAYIM)'}],
        # L3-10: ayarı kimse önceden işaretlemez; ilk Yoga oturumunda gerçek Derin düzeyinde, yatak altta, 10 sn'lik bir
        # ses denemesi (var olan mikro-kliplerle; yeni ses üretilmez). "Hayır" netlik ayarını açar ve hatırlar (UI, VARSAYIM)
        'soundCheck': {'when': 'ilk Yoga oturumu, "Başla"dan önce; ayarlardan yeniden açılabilir',
                       'clips': ['c1.b01', 'c1.s16', 'c2.n03'], 'screenText': 'Sağ kürek kemiği… diz… üç…',
                       'level': 'Derin evre düzeyi (−3 dB) ve kısık Derin yatağı (≈ −36 LUFS)',
                       'question': 'Sözcükleri rahatça seçebildin mi?', 'options': ['Evet', 'Hayır'],
                       'onNo': 'speechClarity açılır ve kullanıcı başına hatırlanır', 'durationSec': 10,
                       'note': 'VARSAYIM; kör panelin 65+ üyesiyle sınanır'},
        # H6/L2-04: sahne seçici; seçim kaldığın yer kaydına variantIndex ile birlikte yazılır
        'scenePicker': {'options': [{'id': 'serbest', 'label': 'Ders içinde seçerim', 'textKey': None},
                                    {'id': 'kiyi', 'label': 'Kıyı', 'textKey': 'kiyi'},
                                    {'id': 'orman', 'label': 'Orman', 'textKey': 'orman'}],
                        # L3-05: ilk oturumda "ya da" kalıbı üç kez duyulmasın; Orman varsayılan doğa katmanıyla aynı
                        'default': 'son seçim; ilk seferde "Orman"',
                        'stored': 'kaldığın yer kaydında variantIndex ile birlikte (CRITIQUE #30)',
                        'safety': 'kıyıda suya girilmez; ormanda karanlık ya da kapalı alan yok (güvenlik §11.B-10; '
                                  'örnekler tasarım önerisi, Luu 2024 özetinde yok: sakin §11.7 düzeltmesi)'},
        # L2-17: akşam dinleyene uyku dersini gösteren tek satır (UI, VARSAYIM)
        'eveningHint': {'afterLocalHour': 20, 'text': 'Akşam uyumadan önce dinliyorsan uyku dersi daha uygun olabilir.',
                        'note': 'UI satırı, seste yok; saat eşiği VARSAYIM'},
        'leadIn': G(3, 4, 6),
        'limits': {'silenceWindowMaxSec': 90, 'clipMaxSec': 15, 'clipMaxNote': 'Z3-07: birimin konuşması (cümle arası '
                   'sessizlikler hariç) her hızda <= 15 sn', 'lastSecondsNoNewImage': 60,
                   'sentenceGapMinDerinSec': 1.0},
        # MT3-02 + L3-02: cümle arası sessizlik (evreye göre; nefes çifti 2,5 / 3 / 4); hepsi VARSAYIM
        'sentenceGapByPhase': {k: G(*v) for k, v in SENT_GAP.items()},
        'sentenceGapBreathPair': G(*BREATH_PAIR_GAP),
        'planner': {
            'kural': ('T4: tek Varış ve tek Kapanış bloğu; zorunlu klipleri her sürede çalar; Kapanış evresinin '
                      'sessizlikleri sıkıştırılmaz (min = pref). Taban: bütün P1 bloklar zorunlu klipleriyle (+ koşulu '
                      'tutan köprüler, minTarget\'i dolan zorunlular). Artımlar entryRank/fillRank sırasıyla: sessizlikler '
                      'pref iken sığıyorsa eklenir; T5: mevcut içerik f=0,5 esnemede bile hedefe yetmiyorsa, en çok '
                      'yarı sıkışmayla sığan artım yine eklenir; ilk sığmayanda durulur (önek kuralı ⇒ plan(T) ⊆ '
                      'plan(T+1)). Sessizlik min→pref→max oranla esner; mikro-listelerde periyot esner (sessizlik = '
                      'periyot − gerçek süre). Kalan süre max toplamını aşarsa içerik hatası. Bağlı çiftlerde '
                      '(pairWith) ortak klip hemen ardından çalıyorsa aradaki boşluk pairGap olur (P-S6). 4. tur: '
                      'cümle arası sessizlikler (sentenceGap) öteki sessizliklerle aynı oranla esner; short biçimi olan '
                      'klipler hedef belowSec\'in altındayken kısa metin ve boşlukla çalar (kimlik aynı, önek kuralı '
                      'korunur).'),
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
                    'kullanılır; edgeMicroSec ilk pilot üretimde kesilen mikro-kliplerin ölçülen süresiyle değişir (Z2-07). '
                    'Sahip kararı (2026-09-29): yalnız MCP. 5,6 (eleven_v4, ölçüm) üretim hızı, 6,6 (v2 varsayılan, '
                    'ölçüm) hızlı uç, 5,2 yalnız muhafazakâr alt zarftır (tasarlanacak hoca sesi ölçülene kadar); MCP\'de '
                    'hız ayarı yoktur. T6 boş payı üretim köşesinde (5,6 yüksek) denetlenir.',
            'productionCorner': {'rate': 5.6, 'profile': 'hi'}, 'envelopeCorner': {'rate': 5.2, 'profile': 'hi'},
        },
        # EV3-01, MT3-03, L3-01, TR3-12, Z3-02: seslendirme yolu sahip kararıdır (SAHIP_ISTEKLERI.md, 2026-09-29)
        'voiceProduction': {
            'path': 'yalnız MCP (creative_generate_speech); API anahtarı yok; hız, kararlılık, seed, previous_text ve '
                    'telaffuz sözlüğü yok',
            'model': 'öneri eleven_v4 (5,63 hece/sn, Scribe\'da metin birebir); v2 (6,6) sahip kararı gereği kör '
                     'karşılaştırmada bütün ders için aday; v3 yön etiketi kullanılmaz',
            'voices': ['Neslihan', 'Hakan', 'tasarlanacak hoca sesi (creative_design_voice)'],
            'takes': 'klip ya da taşıyıcı başına en az 3 çekim (generations_count); Scribe birebir eşleşen ve taşıyıcı '
                     'ekleminde F0 sıçraması <= 2 yarım ton olan çekim seçilir; olmazsa önce yeniden kesim, sonra yeni '
                     'çekim, sonra metin değişir',
            'homographs': 'eşyazımlı ve vurgu tuzakları metinde çözülür (takma ad sözlüğü yok); kalanlar insan kulağıyla '
                          'denetlenir, Scribe vurgu hatasını yakalayamaz',
            'newVoiceGate': 'Z3-04 + MT3-03 + L3-01: yeni aday ses kör panele girmeden önce 76 heceli paragrafta v4 ve v2 '
                            'ile ölçülür (eklemleme hızı ve duraklama oranı); ölçülen hız ve duraklama profili timing.py\'ye '
                            '(--rate, --profile) eklenir; 78/78 geçmeyen aday elenir ya da metin ayarlanır.'},
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
                              'layer:dinlenme': 'c5.basla: yalnız alçak, uzun yaylılar (sessiz dinlenme)',
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
            'nature': {'default': 'uzak, yumuşak rüzgâr ve yaprak dokusu (su yok, kuş yok; VARSAYIM)',
                       'byScene': {'serbest': 'rüzgâr ve yaprak; c4.yer → c4.solma arasında −8 dB (L2-03 b)',
                                   'orman': 'rüzgâr ve yaprak; imge boyunca sürer (L3-05: ilk seferde varsayılan sahne)',
                                   'kiyi': 'imge boyunca çok uzak kıyı dokusu (suya girilmez); su katmanı '
                                           'üretilmezse serbest davranışı'},
                       # MT3-15: Ders 9'un "uzak okyanus dalgası"ndan ayrışan doku (VARSAYIM; ölçülüp belgelenir)
                       'waterLayer': {'available': True, 'defaultOn': False,
                                      'texture': 'çok uzak, alçak geçiren filtreli kıyı yıkanması; köpük ve dalga kırılması '
                                                 'geçişi yok; kabarma periyodu 6–8 sn, ölçülüp Ders 9\'un okyanus dalgasıyla '
                                                 '(istemde ≈ 10 sn) karşılaştırılarak belgelenir',
                                      'note': 'kıyı seçene imge boyunca; üretimi sahip kararı (≈ 10k kredi)'},
                       'uniquenessConflicts': [
                           'MT3-15: Ders 2 Kıyı ↔ Ders 9 okyanus dalgası: Ders 2 dokusu yukarıdaki tanımla ayrışır; iki '
                           'doku kör dinlemede yan yana ayırt edilemezse Ders 2 kıyı katmanı üretilmez.',
                           'MT3-15: Ders 2 rüzgâr ve yaprak ↔ Ders 6 "uzak orman ve yaprak sesi" zemini: Ders 2\'nin orman '
                           'sahnesi metni yapraklara dayanır ve ilk seferde varsayılandır (L3-05), bu yüzden yaprak '
                           'Ders 2\'de kalır. Öneri: Ders 6 zemini yapraksız, yalnız seyrek kuş çağrıları ve uzak sabah '
                           'havası. Karar Ders 6 üretiminden önce PLAN A.2.1\'de verilir; iki çift de kör dinleme '
                           'protokolündedir (panelChecks).']},
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
               'derinClipRateCeilNote': 'VARSAYIM; kanıta dayanmaz (EV2-04). 4. turda iki ölçü raporlanır: iç hız (cümle '
                                        'içi, TTS duraklamaları dahil) ve etkin hız (birimin cümle arası sessizlikleri '
                                        'dahil; MT3-02).',
               'sentenceGapNote': 'MT3-02 + L3-02: Derin evrede hiçbir cümle sınırında 1,0 sn\'den kısa sessizlik yok '
                                  '(uygulamanın sentenceGap\'i; VARSAYIM).',
               'quickClosingGainRule': 'S3-02: hızlı kapanışa girişte ve evre düzeyi değişen ardışık iki söz arasında en '
                                       'az 4 sn sessizlik; ses kazancı yalnız bu sessizlikte rampayla değişir (basamak '
                                       'yok).',
               'carrierTakesRule': 'L3-17: sağ ve sol taşıyıcılar ayrı isteklerdir; sol için seçilen çekim sağınkinin '
                                   'aynısı olamaz; generations_count çekimleri içinden F0 çizgisi sağdakinden farklı olan '
                                   'sol çekim yeğlenir.'},
        # EV3-05: ders kartının kanıt satırı, kaynak kartı, Gelişim ölçüsü ve dersten sonraki soru (güvenlik §11.F).
        # timing.py bu kullanıcı metinlerini de yasak ve E12 listeleriyle denetler (EV3-06).
        'evidenceLine': ('Neye dayanıyor: 11 ve 30 dakikalık yoga nidrayı karşılaştıran bir çalışmada iki sürüm '
                         'arasındaki fark çok küçüktü; alandaki çalışmaların çoğunun kalitesi düşük. Bu ders bir sonuç '
                         'vaadi taşımaz.'),
        'sourcesCard': {'rows': [{'pmid': r[0], 'cite': r[1], 'detail': r[2], 'doi': r[3], 'file': r[4]} for r in REFS],
                        'note': 'cite kartta gösterilir; detail yalnız ders2.script.md §8 içindir (EV3-05)',
                        'footer': 'Kaynak: PubMed (National Library of Medicine). DOI\'ler https://doi.org/ önekiyle açılır.'},
        'progress': {'domain': 'body', 'effectKey': 'yoga-nidra', 'measure': 'beden gerginliği',
                     'question': 'Bedenin şu an ne kadar gergin?', 'scale': [1, 10], 'better': 'down',
                     'when': 'önce ve sonra; ikisi de atlanabilir',
                     'note': "önce → sonra bir 'nasıl hissettin' gidişatıdır, etki kanıtı değildir (güvenlik §11.F; "
                             "progress.js:71 notu)",
                     'scaleNote': 'EV3-05: tek ölçek 1–10 (PLAN.v2 A.1 ve E.4 ile aynı; yeniden kullanılan Dalga puan '
                                  'bileşeni 1–10, CRITIQUE #18, kod-haritasi §1.2). PLAN.md\'deki 0–10 sürüm 1\'dir.'},
        'afterCheck': {'question': 'Ders sırasında zorlandın mı?', 'options': ['Hayır', 'Biraz', 'Çok'],
                       'skippable': True,
                       'onCok': ('Bu olabiliyor ve durman doğruydu. Bir dahaki sefere daha kısa ya da gözleri açık bir '
                                 'sürüm deneyebilirsin. Sık tekrarlarsa ya da geçmezse bir uzmanla konuşmak iyi olur. '
                                 'Acil durumda 112.'),
                       'storage': 'veri telefonda kalır; puan olarak gösterilmez; yalnız bir sonraki önerinin kısa ve '
                                  'gözleri açık sürüm olmasını sağlar (güvenlik §11.F, tasarım çıkarımı)'},
        # Kör dinleme panelinin bu derse özgü maddeleri (CRITIQUE #22; PLAN D.6 insan düzeyi)
        'panelChecks': [
            'TR3-08: "sen uyanıksın" (br.k2) kurnazlık anlamını ("çok uyanıksın") çağrıştırıyor mu? Evetse br.k2 '
            'panelFallback metniyle üretilir.',
            'TR3-18: vurgu eşyazımlıları insan kulağıyla: boyun (organ, vurgu ilk hecede), Yüzün (c1.gecis.on), alın, '
            'karın, yan (a.durus), dinlenme (k.anahtar3), alman (a.konfor). Scribe bu hataları yakalayamaz.',
            'L2-10: Derin evrede sayılar ve tek heceli adlar ("diz…", "üç…") net mi?',
            'MT3-02 + L3-02: cümle arası sessizlikler doğal mı, kopuk mu (Neslihan, Hakan, tasarlanan ses)?',
            'MT3-15: Ders 2 kıyı dokusu ↔ Ders 9 okyanus dalgası ve Ders 2 rüzgâr-yaprak ↔ Ders 6 orman zemini '
            'yan yana ayırt ediliyor mu?',
            'L3-17: sağ ve sol taşıyıcılar kopya gibi duyuluyor mu?'],
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
        b['minSec'] = round(sum(timing.unit_len(c, rate, prof, 'min') + timing.gap_of(c, rate, prof)['min']
                                for c in req), 1)
        b['maxSec'] = round(sum(timing.unit_len(c, rate, prof, 'max') + timing.gap_of(c, rate, prof)['max']
                                for c in b['clips']), 1)
        b['prefSec'] = {str(m): round(anchors[m].get(b['id'], 0.0), 1) for m in (5, 10, 15, 20, 30)}
        b['estimateBasis'] = ('5,6 hece/sn + yüksek duraklama profili, cümle arası sessizlikler dahil (VARSAYIM); '
                              'üretimden sonra gerçek sec ile')


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
