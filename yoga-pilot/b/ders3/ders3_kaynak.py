#!/usr/bin/env python3
"""Nefona Yoga · Ders 3 "Uykuya Geçiş" · tek kaynak (B adımı, Parti 1, sesten bağımsız kısım).

Bu dosya ders3.lesson.json'u üretir. Metnin tek kaynağı burasıdır; ders3.script.md ve timing.txt `timing_d3.py` ile bu
JSON'dan çıkar. Hece, sözcük ve cümle sayıları pilot planlayıcının (`timing.py`, pilot kopyası, değiştirilmedi)
sayaçlarıyla hesaplanır. Ses üretilmedi; bütün `sec` alanları null (ElevenLabs bağlantısı bu oturumda yok).

Şema: pilot `ders2.lesson.json` ile aynı (PLAN.v2 §B.2 + pilot ekleri). Farklar, hepsi gerekçeli:
- `voice` anahtarı `female`/`male` yerine `hoc` (v3 tek ses kararı; SAHIP_ISTEKLERI madde 8; Ders 1 ile aynı).
- Uyku izni bloğunun `kind` değeri PLAN.v2 §B.2'deki gibi `sleepPermission`dır. Pilot planlayıcı yalnız `closing`
  tanıdığı için `timing_d3.planner_view()` planlamada bunu `closing` diye okur; veri değişmez.
- `extras.quickClosing` uyku dersinde "Uykuya geç"tir (PLAN.v2 §B.5, PLAN.v3 §D.3): aynı dosyada uyku izninin başına
  atlar; dışa dönüş, bırakma ön klibi ve şafak yoktur.
"""
import json
import os
import sys

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import timing as T  # noqa: E402  (pilot timing.py'nin birebir kopyası, sha256 58f6c405…)

LESSON = 'ders3'
OUT = os.path.join(HERE, 'ders3.lesson.json')
VOICE_KEY = 'hoc'
VOICE_ID = 'Sr5w7dIZaRDglJ2cLaJm'

VA, DZ, DN = 'Varış', 'Derinleşme', 'Derin'
SG = {VA: {'min': 0.6, 'pref': 0.8, 'max': 1.0}, DZ: {'min': 0.8, 'pref': 1.0, 'max': 1.3},
      DN: {'min': 1.2, 'pref': 1.8, 'max': 2.5}, 'Kapanış': {'min': 0.8, 'pref': 1.0, 'max': 1.2}}
COUNT_PERIOD = {'min': 7.6, 'pref': 8.0, 'max': 8.4}   # geri sayma: sayıdan sayıya 8 sn (VARSAYIM; aşağıda)


def g(a, b, c):
    return {'min': float(a), 'pref': float(b), 'max': float(c)}


def voice_files(cid, multi=False):
    if multi:
        return {VOICE_KEY: {'file': 'yoga-uretim/%s/%s/%s.wav' % (LESSON, VOICE_KEY, cid), 'sec': None,
                            'note': 'birim arşivi (tek TTS isteği); uygulama subclips dosyalarını çalar'}}
    return {VOICE_KEY: {'file': 'public/yoga/%s/%s/%s.m4a' % (LESSON, VOICE_KEY, cid), 'sec': None}}


def clip(cid, text, tier, gap, phase, cue=None, tags=None, **kw):
    c = {'id': cid, 'text': text, 'tier': tier, 'gapAfter': gap, 'phase': phase, 'cue': cue or {},
         'tags': tags or {}}
    for k in ('fillRank', 'fillGroup', 'minTarget', 'requires', 'onsetPeriod', 'gapFloor', 'carrier', 'short'):
        if kw.get(k) is not None:
            c[k] = kw[k]
    if c.get('onsetPeriod'):
        c['gapFromPeriod'] = True
    return c


def finish(c):
    """Sayaçlar, ses dosyaları, alt klipler (MT3-02) ve TTS birimi; pilot sözleşmesindeki sırayla."""
    c['syllables'] = T.syllables(c['text'])
    c['words'] = len(T.words(c['text']))
    c['sentences'] = len(T.sentences(c['text']))
    c['required'] = c['tier'] == 'required'
    if c.get('short'):
        sh = c['short']
        sh['syllables'] = T.syllables(sh['text'])
        sh['words'] = len(T.words(sh['text']))
        sh['sentences'] = len(T.sentences(sh['text']))
        sh['voice'] = {VOICE_KEY: {'file': 'public/yoga/%s/%s/%s.k%d.m4a' % (LESSON, VOICE_KEY, c['id'],
                                                                         sh['belowSec']), 'sec': None}}
    if c.get('carrier'):
        c['voice'] = voice_files(c['id'])
        return c
    c['sentenceGap'] = dict(SG[c['phase']])
    subs = T.sub_texts(c)
    if len(subs) > 1:
        c['voice'] = voice_files(c['id'], multi=True)
        c['subclips'] = [{'index': i + 1, 'text': t, 'syllables': T.syllables(t),
                          'voice': {VOICE_KEY: {'file': 'public/yoga/%s/%s/%s.%d.m4a' % (LESSON, VOICE_KEY,
                                                                                        c['id'], i + 1),
                                                'sec': None}}}
                         for i, t in enumerate(subs)]
        c['ttsUnit'] = {'text': c['text'], 'cut': 'cümle sonlarından; parça sayısı tutmazsa insan kararı'}
    else:
        c['voice'] = voice_files(c['id'])
    return c


# ================================================================================================= A · VARIŞ
# Sıra: dersin kendi açılışı → duruş → gözler → ortak açılış cümlesi (a.izin, PLAN.v2 §A.1: göz seçiminden sonra) →
# uyku çabasını kaldıran olağanlaştırma. Varış'ta a.izin dışında "-(y)abil-" yok (a.izin tek başına üç taşır; 60 sn
# kuralı, PLAN.v3 §A.2 kural 6'nın gerekçesi).
A = [
    clip('a.acilis', 'Günün sesleri geride kalıyor; yatağına yerleşiyorsun.', 'required', g(3, 4, 7), VA,
         cue={'visual': 'phase:varis (kor, en aydınlık hâli; gece parlaklığı)', 'music': 'phase:varis (La♭ pad)'},
         tags={'texture': 'varis', 'uniqueOpening': True, 'action': 'yatağa yerleşmek',
               'note': 'PLAN.v2 §A.2.1 yönü ("…şimdi yatağına yerleşebilirsin") "-(y)abil-"siz yazıldı: 5 dakikada '
                       'a.izin ile aynı 60 sn içine düşer (üç "-(y)abil-" onda); "şimdi" dolgusu da çıktı'}),
    clip('a.durus', 'Sırtüstü ya da yan, hangisi rahatsa öyle yatıyorsun.', 'required', g(5, 6, 9), VA,
         tags={'texture': 'varis', 'action': 'uzanmak'}),
    clip('a.ortu', 'Üşüyorsan örtünü omuzlarına kadar çekmen iyi olur.', 'optional', g(6, 7, 10), VA,
         tags={'texture': 'varis', 'action': 'örtüyü çekmek'}, fillRank=150),
    clip('a.gozler', 'Gözlerini kapatmak ya da açık tutmak sana kalmış.', 'required', g(3, 4, 6), VA,
         tags={'texture': 'varis', 'eyesOpen': True, 'eyes': 'baskı yok; karanlıkta da açık kalabilir',
               'action': 'gözleri kapatmak ya da açık tutmak'}),
    clip('a.izin', 'İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin.', 'required',
         g(3, 5, 7), VA, tags={'texture': 'varis', 'safety': 'opening', 'eyesOpen': True, 'repeatOk': ['gözle']}),
    clip('a.kolay', 'Uyumaya çalışman gerekmiyor; uzanıp dinlenmek yeter.', 'required', g(3, 5, 8), VA,
         tags={'texture': 'varis', 'normalize': True, 'safety': 'normalize',
               'note': 'uyku çabasını kaldırır; güvenlik §11.B-5 (gevşeme zorunlu değil)'}),
    clip('a.karar', 'Ne kadar gevşeyeceğine her an sen karar veriyorsun.', 'optional', g(3, 4, 7), VA,
         tags={'texture': 'varis', 'safety': 'control'}, fillRank=110),
    clip('a.isler', 'Yarına kalan işler sabaha kadar bekler.', 'optional', g(4, 5, 8), VA,
         tags={'texture': 'varis', 'note': 'günü bırakma yayının ilk adımı; vaat değil, gündelik söz', 'repeatOk': ['kadar']},
         fillRank=160),
]

# ================================================================================================= C1 · YAVAŞ, UZUN VERİŞ
# Önce doğal nefes (değiştirmeden), sonra verişi biraz uzatmak; sayı yok, tutma yok (güvenlik §11.B-6, §11.C;
# Toussaint 2021; Van Diest 2014; Eide 2026). Ders 1'in sayılı 4/6 ritminden ayrılır: burada ritim sayılmaz.
C1 = [
    clip('c1.fark', 'Önce nefesini olduğu gibi fark ediyorsun.', 'required', g(8, 10, 14), DZ,
         cue={'visual': 'phase:derinlesme', 'music': 'phase:cekirdek'},
         tags={'texture': 'nefes', 'action': 'doğal nefesi birkaç döngü izlemek'}),
    clip('c1.yer', 'Nefes en çok nerede belirginse dikkatin orada kalsın.', 'optional', g(8, 10, 14), DZ,
         tags={'texture': 'nefes', 'repeatOk': ['nefes']}, fillRank=170),
    clip('c1.veris', 'Alışı zorlamadan verişi biraz uzatmak yeterli.', 'required', g(10, 12, 16), DZ,
         tags={'texture': 'nefes', 'action': 'verişi uzatmak (tutma yok, sayı yok)'}),
    clip('c1.zorlanirsan', 'Uzun veriş zor gelirse kendi ritmine dön.', 'optional', g(4, 5, 8), DZ,
         tags={'texture': 'nefes', 'safety': 'breath', 'mood': 'safety', 'repeatOk': ['veriş'],
               'note': 'düzeltme turu (TE11): "Nefes zor gelirse" nefes darlığı gibi anlaşılabiliyordu'}, fillRank=105),
    clip('c1.gun', 'Her veriş, günü biraz daha geride bırakıyor.', 'required', g(8, 10, 14), DZ,
         tags={'texture': 'nefes', 'callback': 'a.acilis', 'repeatOk': ['gerid', 'veriş']}, minTarget=360),
    clip('c1.dudak', 'Verişte nefes burnundan ya da hafif aralık dudaklarından çıkabilir.', 'optional', g(8, 10, 14), DZ,
         tags={'texture': 'nefes', 'repeatOk': ['veriş', 'nefes']}, fillRank=230),
    clip('c1.birkac', 'Birkaç nefes boyunca bu ritmi sürdürüyorsun.', 'required', g(16, 18, 20), DZ,
         tags={'texture': 'nefes', 'action': 'birkaç uzun veriş (nefes payı)'}),
    clip('c1.k1', 'Bugün bitti; artık dinlenebilirsin.', 'required', g(6, 8, 12), DZ,
         tags={'texture': 'nefes', 'key': 1}),
]

# ================================================================================================= C2 · BEDENİN AĞIRLAŞMASI
# Yavaş beden dolaşımı, ayaklardan başa (PLAN.v2 §A.2.2 satır 3: "ayaklardan bele · belden başa"); sağ ve sol karışmaz.
# Derse özgü motif: ağırlığı yatağa "vermek" (Ders 2'nin "zemin taşıyor"undan ayrışır). Sınama telkini yok.
# Düzeltme turu (INCELEME.md TE13/UH2): a.durus yan yatmaya da izin verdiği için cümleler iki duruşta da doğru
# (topuk, sırt, omurga ve ense yalnız sırtüstü yatana doğruydu).
C2 = [
    clip('c2.cerceve', 'Ayaklarından başına doğru bedeninde dolaşacağız. Rahatsız eden bir yer olursa atla.',
         'required', g(3, 4, 6), DZ, tags={'texture': 'beden', 'safety': 'skip', 'mood': 'safety'}),
    clip('c2.ayak', 'Önce ayaklarının ağırlığını yatağa veriyorsun.', 'required', g(5, 7, 10), DZ,
         tags={'texture': 'beden', 'section': 'ayak', 'sense': 'ağırlık', 'repeatOk': ['ayakl']}),
    clip('c2.topuk', 'Ayaklarının yatağa değdiği yerleri fark ediyorsun.', 'optional', g(5, 7, 10), DZ,
         tags={'texture': 'beden', 'section': 'ayak', 'sense': 'dokunma', 'repeatOk': ['yatağ', 'ayakl']}, fillRank=180),
    clip('c2.bacak', 'Bacakların da yatağa yaslanıyor.', 'required', g(5, 7, 10), DZ,
         tags={'texture': 'beden', 'section': 'bacak', 'sense': 'ağırlık', 'repeatOk': ['yatağ']}),
    clip('c2.uyluk', 'Uylukların ağır ve sıcak olabilir.', 'optional', g(5, 7, 10), DZ,
         tags={'texture': 'beden', 'section': 'bacak', 'sense': 'sıcaklık'}, fillRank=200),
    clip('c2.bel', 'Gövden bütün ağırlığıyla yatakta.', 'required', g(5, 7, 10), DZ,
         tags={'texture': 'beden', 'section': 'govde', 'sense': 'ağırlık'}),
    clip('c2.omurga', 'Omurgan boydan boya uzanıyor.', 'optional', g(6, 8, 11), DZ,
         tags={'texture': 'beden', 'section': 'govde', 'sense': 'dokunma'}, fillRank=215),
    clip('c2.el', 'Ellerin olduğu yerde dinleniyor.', 'optional', g(5, 7, 10), DZ,
         tags={'texture': 'beden', 'section': 'kol'}, fillRank=210),
    clip('c2.kol', 'Kollarının ağırlığını da yatağa veriyorsun.', 'required', g(5, 7, 10), DZ,
         tags={'texture': 'beden', 'section': 'kol', 'sense': 'ağırlık', 'repeatOk': ['ağırl', 'yatağ']}),
    clip('c2.omuz', 'Omuzların yatağa doğru inebilir.', 'optional', g(5, 7, 10), DZ,
         tags={'texture': 'beden', 'section': 'kol', 'repeatOk': ['yatağ']}, fillRank=190),
    clip('c2.boyun', 'Boynun yastığa yaslanıyor.', 'optional', g(5, 7, 10), DZ,
         tags={'texture': 'beden', 'section': 'bas', 'sense': 'dokunma',
               'note': 'iki incelemenin önerisi "Başın ve boynun…"; "baş" c2.bas\'ta geldiği için yalnız boyun'},
         fillRank=250),
    clip('c2.yuz', 'Alnın gevşek, gözlerinin çevresi yumuşak.', 'optional', g(5, 7, 10), DZ,
         tags={'texture': 'beden', 'section': 'bas'}, fillRank=220),
    clip('c2.cene', 'Çenen serbest, dişlerin hafif aralık.', 'optional', g(5, 7, 10), DZ,
         tags={'texture': 'beden', 'section': 'bas'}, fillRank=245),
    clip('c2.bas', 'Başının ağırlığını yastığa bırakıyorsun.', 'required', g(5, 7, 10), DZ,
         tags={'texture': 'beden', 'section': 'bas', 'sense': 'ağırlık', 'repeatOk': ['ağırl', 'yastı'],
               'note': 'düzeltme turu (UH13): "ağırlığı vermek" motifi; "yastık taşıyor" Ders 2\'nin "zemin taşıyor"una yaklaşıyordu'}),
    clip('c2.sicak', 'Ellerinde ve ayaklarında hafif bir sıcaklık olabilir.', 'optional', g(6, 8, 11), DZ,
         tags={'texture': 'beden', 'section': 'sicaklik', 'sense': 'sıcaklık',
               'note': 'ağırlıktan sıcaklığa geçiş (A.2.2)'}, fillRank=260),
    clip('c2.gelmezse', 'Ağırlık her yerde aynı olmayabilir; bu da olur.', 'optional', g(5, 7, 10), DZ,
         tags={'texture': 'beden', 'normalize': True, 'repeatOk': ['ağırl']}, fillRank=120),
    clip('c2.butun', 'Baştan ayağa bütün bedenin yatağın üstünde.', 'required', g(6, 8, 12), DZ,
         tags={'texture': 'beden', 'section': 'butun', 'repeatOk': ['beden', 'yatağ']}),
]

# ================================================================================================= C4 · NEFESLE GERİ SAYMA
# Sayılar tek başına üretilmez: taşıyıcı cümlede üretilip üç nokta duraklarından kesilir (PLAN.v2 §B.2, CRITIQUE #12).
# Periyot 8 sn (VARSAYIM): Ders 2'nin 6 sn'sinden yavaş; uyku dersinde yavaş, uzun verişe yakın bir döngü
# (≈ 7,5 nefes/dk; Eide 2026'daki çalışmalar ≤ 10 nefes/dk). Nefes sayıya uymak zorunda değildir (c4.uymaz).
NUM_WORDS = ['on', 'dokuz', 'sekiz', 'yedi', 'altı', 'beş', 'dört', 'üç', 'iki', 'bir']
CARRIERS = []


def number_clips():
    out = []
    for i, w in enumerate(NUM_WORDS):
        n = 10 - i
        cid = 'c4.n%02d' % n
        last = n == 1
        text = (w + '.') if last else (w + '…')
        tier = 'required' if n <= 5 else 'optional'
        kw = {'carrier': {'id': 'car.sayi3', 'index': i}}
        if not last:
            kw.update(onsetPeriod=dict(COUNT_PERIOD), gapFloor=0.8)
            gap = {k: COUNT_PERIOD[k] - 0.5 for k in COUNT_PERIOD}
        else:
            gap = g(6, 8, 11)
        if n > 5:
            kw.update(fillRank=270, fillGroup='sayi10', requires=['c4.n05'])
        out.append(clip(cid, text, tier, gap, DN, cue={'visual': 'kor: sayıyla bir soluk kararır', 'breath':
                                                        {'count': n}},
                        tags={'texture': 'geri-sayma', 'micro': 'number'}, **kw))
    return out


C4 = [
    clip('c4.giris', 'Bire kadar geri sayacağım. Her sayıda nefesini bırakıyorsun.', 'required', g(5, 6, 8), DN,
         cue={'visual': 'phase:derin', 'music': 'phase:cekirdek (doku incelir)'},
         tags={'texture': 'geri-sayma', 'action': 'sayıyla nefes vermek',
               'note': 'düzeltme turu (UH1 BLOCKER): başlangıç sayısı söylenmez; 10–13 dk\'da sayma beşten, 14 dk\'dan '
                       'ondan başlar. "Ondan bire" 10–13 dk\'da yanlıştı. Ders 2\'nin "Geriye doğru sayacağım."ından ayrı'}),
    clip('c4.uymaz', 'Nefesin sayılara uymasa ya da sayıyı kaçırsan da olur.', 'optional', g(8, 10, 13), DN,
         tags={'texture': 'geri-sayma', 'normalize': True, 'repeatOk': ['sayıl', 'sayıy', 'nefes']}, fillRank=198),
] + number_clips() + [
    clip('c4.bitti', 'Sayılar burada bitiyor. Kaçını duyduğun önemli değil.', 'required', g(6, 8, 11), DN,
         tags={'texture': 'geri-sayma', 'normalize': True, 'repeatOk': ['sayıl']}),
    clip('c4.k2', 'Bugün bitti; dinlenebilirsin.', 'required', g(9, 12, 15), DN,
         tags={'texture': 'geri-sayma', 'key': 2, 'repeatOk': ['bitti', 'bitiy']}),
]
CARRIERS.append({'id': 'car.sayi3', 'text': 'Sayıyorum… ' + '… '.join(NUM_WORDS) + '.', 'lead': 'Sayıyorum…',
                 'items': ['c4.n%02d' % (10 - i) for i in range(10)],
                 'cut': 'üç nokta duraklarından; öğe sayısı tutmazsa insan kararı; ön söz ("Sayıyorum…") kesilip '
                        'atılır', 'note': 'Kısa biçim "beş"ten başlar; altı..on tek grup olarak birlikte girer '
                                          '(Ders 2 kalıbı). İki nokta kullanılmadı (SPEC v3.1).'})

# ================================================================================================= C3 · TEK SAHNELİ İMGELEME
# Harvey & Payne 2002: ilgi çekici, belirli bir imge. Yay (PLAN.v2 §A.2.1): yağmuru dinlemek → örtünün ağırlığı ve
# sıcaklığı → lambanın ışığı yavaşça kısılır. Seçim (oda / veranda), alternatif (görüntü gelmese de, gözler açık
# da) ve yağmur sesi iyi gelmeyen için sahneyi bozmayan kapı: yağmuru çok uzakta düşünmek (güvenlik §11.B-10;
# düzeltme turu TE14/UH3: önceki "sessiz akşam" seçeneği ardından gelen yağmur cümleleriyle çelişiyordu).
# Karanlık tümüyle gelmez: loş bir aydınlık kalır.
C3 = [
    clip('c3.sahne', 'Zihninde yağmurlu bir akşam belirebilir.', 'required', g(5, 7, 10), DN,
         cue={'visual': 'phase:derin (kor)', 'music': 'layer:imge (seyrek keçe piyano)', 'nature': 'yağmur öne'},
         tags={'texture': 'imge', 'image': 'new', 'arc': 'giriş', 'safety': 'choice'}),
    clip('c3.gelmezse', 'Görüntü belirmese de, gözlerin açık kalsa da sorun değil.', 'required', g(8, 10, 14), DN,
         tags={'texture': 'imge', 'safety': 'alternative', 'eyesOpen': True, 'normalize': True, 'repeatOk': ['belir']}),
    clip('c3.yer', 'Belki sıcak bir odadasın. Belki üstü kapalı bir verandadasın.', 'required', g(5, 7, 10), DN,
         tags={'texture': 'imge', 'image': 'new', 'arc': 'giriş', 'safety': 'choice', 'repeatOk': ['belki']}),
    clip('c3.su', 'Yağmur sesi sana iyi gelmezse onu çok uzakta düşünmen de olur.', 'optional', g(8, 10, 14), DN,
         tags={'texture': 'imge', 'safety': 'choice', 'repeatOk': ['yağmu'],
               'note': 'su herkese iyi gelmeyebilir (güvenlik §11.B-10); sahneyi değiştirmeyen kapı, ardından gelen '
                       'yağmur cümleleri doğru kalır (usta hoca kararı, UH3/TE14)'},
         fillRank=115),
    clip('c3.yagmur', 'Yağmur çatıya usul usul vuruyor.', 'required', g(8, 10, 14), DN,
         tags={'texture': 'imge', 'image': 'new', 'arc': 'yağmur', 'sense': 'ses', 'repeatOk': ['yağmu']}),
    clip('c3.damla', 'Oluktan tek tük damlalar düşüyor.', 'optional', g(5, 7, 10), DN,
         tags={'texture': 'imge', 'image': 'new', 'arc': 'yağmur', 'sense': 'ses'}, fillRank=140),
    clip('c3.toprak', 'Havada ıslak toprağın kokusu var.', 'optional', g(9, 12, 16), DN,
         tags={'texture': 'imge', 'image': 'new', 'arc': 'yağmur', 'sense': 'koku'}, fillRank=130),
    clip('c3.cam', 'Yakındaki camdan yağmur damlaları ağır ağır süzülüyor.', 'optional', g(5, 7, 10), DN,
         tags={'texture': 'imge', 'image': 'new', 'arc': 'yağmur', 'sense': 'görme', 'repeatOk': ['yağmu']},
         fillRank=280),
    clip('c3.ortu', 'Üstünde kalın, yumuşak bir örtü var.', 'required', g(5, 7, 10), DN,
         tags={'texture': 'imge', 'image': 'new', 'arc': 'örtü', 'sense': 'dokunma'}),
    clip('c3.agirlik', 'Örtünün tatlı ağırlığı seni sarıyor.', 'optional', g(9, 12, 16), DN,
         tags={'texture': 'imge', 'arc': 'örtü', 'sense': 'ağırlık', 'repeatOk': ['örtü']},
         fillRank=145),
    clip('c3.sicaklik', 'Altında kendi sıcaklığın birikiyor.', 'optional', g(6, 8, 11), DN,
         tags={'texture': 'imge', 'arc': 'örtü', 'sense': 'sıcaklık'}, fillRank=175),
    clip('c3.parmak', 'Parmak uçların örtünün dokusunu buluyor.', 'optional', g(6, 8, 11), DN,
         tags={'texture': 'imge', 'arc': 'örtü', 'sense': 'dokunma', 'repeatOk': ['örtü']}, fillRank=255),
    clip('c3.yastik', 'Yastığın kumaşı serin ve yumuşak.', 'optional', g(9, 12, 16), DN,
         tags={'texture': 'imge', 'arc': 'örtü', 'sense': 'dokunma'}, fillRank=150),
    clip('c3.lamba', 'Köşede bir lamba sarı, sıcak bir ışık veriyor.', 'required', g(8, 10, 14), DN,
         tags={'texture': 'imge', 'image': 'new', 'arc': 'lamba', 'sense': 'görme'}),
    clip('c3.ses2', 'Yağmurun sesi hiç değişmeden sürüyor.', 'optional', g(5, 7, 10), DN,
         tags={'texture': 'imge', 'arc': 'lamba', 'sense': 'ses', 'callback': 'c3.yagmur',
               'repeatOk': ['yağmu']}, fillRank=205),
    clip('c3.uzak', 'Yukarıda yağmurun, yakında kendi nefesinin sesi var.', 'optional', g(9, 12, 16), DN,
         tags={'texture': 'imge', 'arc': 'lamba', 'sense': 'ses', 'callback': 'c1', 'repeatOk': ['yağmu', 'sesi']},
         fillRank=265),
    clip('c3.kisilir', 'Lambanın ışığı yavaş yavaş kısılıyor.', 'required', g(7, 9, 13), DN,
         tags={'texture': 'imge', 'image': 'fade', 'arc': 'ışık kısılır', 'repeatOk': ['lamba', 'ışığı']},
         short={'belowSec': 360, 'text': 'Lambanın ışığı kısılıyor; loş bir aydınlık kalıyor.', 'gapAfter': g(8, 10, 13),
                'note': '5 dk: c3.aydinlik bu cümleye katılır (karanlık tümüyle gelmez)'}),
    clip('c3.aydinlik', 'Çevrende loş, yumuşak bir aydınlık kalıyor.', 'required', g(10, 13, 17), DN, minTarget=360,
         tags={'texture': 'imge', 'image': 'fade', 'arc': 'ışık kısılır', 'safety': 'darkness',
               'note': 'karanlık tümüyle gelmez (güvenlik §11.B-10)'}),
    clip('c3.kal', 'Yağmuru dinlemekten başka yapacak bir şey yok.', 'optional', g(7, 9, 12), DN,
         tags={'texture': 'imge', 'image': 'stay', 'arc': 'kalış', 'repeatOk': ['yağmu']}, fillRank=235),
]

# ================================================================================================= K · UYKU İZNİ
# Dışa dönüş yok, uyandırma cümlesi yok (PLAN.v2 §B.6; güvenlik §11.B-15, §11.D-5). k.izin güvenlik §11.B-15'in
# ve PLAN.v2 Ders 3 kartının cümlesidir. k.uyanik uyku çabasını kaldırır (a.kolay ile aynı çizgi). Ses k.izin'den
# sonra gerçekten alçalır (voicePhaseGainDb.sleepSteps): "sesim yavaşça kısılacak" sözü karışımda tutulur.
K = [
    clip('k.anahtar3', 'Bugün bitti.', 'required', g(6, 8, 10), DN,
         cue={'music': 'phase:uyku (yalnız pad ve yağmur)', 'visual': 'kor kehribara döner'},
         tags={'texture': 'uyku', 'key': 3, 'step': 'anahtar'}),
    clip('k.nefes', 'Nefes kendi ritminde gelip gidiyor.', 'optional', g(9, 11, 14), DN,
         tags={'texture': 'uyku', 'repeatOk': ['nefes']}, fillRank=225),
    clip('k.izin', 'Uykuya dalarsan bu da güzel; sesim yavaşça kısılacak.', 'required', g(10, 12, 15), DN,
         cue={'voiceGain': 'sleepSteps: bu klipten sonra −1,5 dB, k.son öncesi −3 dB daha'},
         tags={'texture': 'uyku', 'step': 'izin', 'safety': 'sleepPermission'}),
    clip('k.uyanik', 'Uyanık kalırsan da olur; uzanıp dinlenmek yeter.', 'required', g(7, 9, 12), DN,
         tags={'texture': 'uyku', 'step': 'izin', 'normalize': True, 'repeatOk': ['dinle', 'uzanı']}),
    clip('k.son', 'Gece senin.', 'required', g(5, 6, 8), DN,
         cue={'visual': 'kor söner, ekran siyah', 'music': 'kuyruk başlar (0/5/10/20 dk; son 3 dk kosinüs, tam durur)'},
         tags={'texture': 'uyku', 'step': 'son'}),
]


# ================================================================================================= ekler (utility)
def sleep_quick():
    out = []
    for c in K:
        if c['tier'] == 'required':
            out.append(dict(c, cue=dict(c['cue']), tags=dict(c['tags'])))
    return out


QUICK = sleep_quick()
STOP = [
    clip('d.yer', 'Ders burada bitti; şu an yatağındasın.', 'required', g(4, 4, 5), 'Kapanış',
         tags={'mood': 'safety', 'step': 'oda'}),
    clip('d.goz', 'Gözlerini açıp çevrene bakmak iyi olur; acele yok.', 'required', g(5, 5, 6), 'Kapanış',
         tags={'mood': 'safety', 'step': 'goz'}),
    clip('d.kalk', 'Kalkacaksan önce yana dön, otur ve bekle; başın dönerse biraz daha otur.', 'required',
         g(2, 2, 3), 'Kapanış', tags={'mood': 'safety', 'step': 'kalk'}),
]
INTRO = [clip('g.ilk.uyku', 'Bugün yalnızca tanışıyoruz; zorlanırsan dersi bitirmen yeterli.', 'required', g(2, 2, 2),
              VA, tags={'firstEver': True,
                        'note': 'PLAN.v3 §D.3 kalıbı; uyku dersinde ekrandaki düğme "Uykuya geç" olduğu için cümle '
                                'X\'i (dersi bitirmek) söyler, a.izin\'deki fiille aynı. "-(y)abil-" yok. Gündüz derslerinin g.ilk '
                                'biriminden ayrı yardımcı birim g.ilk.uyku (usta hoca UH16); PLAN.v3 §D.3\'e not gerekir'})]


def block(bid, kind, prio, order, title, clips, **kw):
    b = {'id': bid, 'kind': kind, 'priority': prio, 'playOrder': order}
    b.update(kw)
    b['title'] = title
    b['clips'] = [finish(c) for c in clips]
    b['silenceWindows'] = []
    return b


BLOCKS = [
    block('A', 'arrival', 0, 0, 'Varış (tek kapak; isteğe bağlılar süreyle eklenir)', A),
    block('C1', 'core', 1, 1, 'Yavaş, uzun veriş (tutma yok, sayı yok)', C1),
    block('C2', 'core', 1, 2, 'Bedenin ağırlaşması: ayaklardan başa yavaş beden dolaşımı', C2),
    block('C4', 'core', 2, 3, 'Nefesle geri sayma (bire kadar; 10–13 dk beşten, 14 dk\'dan ondan)', C4, entryRank=195),
    block('C3', 'core', 1, 4, 'Tek sahneli, ayrıntılı imgeleme: yağmurlu akşam, oda ya da veranda', C3),
    block('K', 'sleepPermission', 0, 99, 'Uyku izni (dışa dönüş yok; müzik kuyruğu sürenin dışında)', K),
]

for c in QUICK + STOP + INTRO:
    finish(c)
_allc = {c['id']: c for b in BLOCKS for c in b['clips']}
for car in CARRIERS:
    car['syllables'] = sum(_allc[i]['syllables'] for i in car['items']) + T.syllables(car.get('lead', ''))
    car['voice'] = {VOICE_KEY: {'file': 'yoga-uretim/%s/%s/%s.wav' % (LESSON, VOICE_KEY, car['id']), 'sec': None}}


# ================================================================================================= ders düzeyi alanlar
IZIN = 'İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin.'
NOTICE = 'Bu dersi yalnızca araç ya da makine kullanmadığın ve suda olmadığın bir sırada dinle.'

SOURCES = [
    ('11863237', 'Harvey & Payne 2002 · uyku öncesi imgeleme', '10.1016/s0005-7967(01)00012-2', 'sakin §5',
     'Kontrollü klinik çalışma, uykusuzluk yaşayan 41 kişi: ilgi çekici bir imgeyle dikkat dağıtma talimatı, '
     'talimatsız gruba göre daha kısa uykuya dalma süresi ve daha az uyku öncesi zihinsel etkinlik bildirimiyle '
     'birlikte gitti; ölçüm yöntemi (öznel/objektif) özette yok. Dersin çekirdeği (C3) buna dayanır.'),
    ('41886931', 'Eide, Hernes & Grønli 2026 · yatmadan önce yavaş nefes', '10.1016/j.smrv.2026.102284', 'sakin §4',
     'Sistematik derleme, 9 çalışma, n=457, dakikada <= 10 nefes: öznel uyku süresi ve kalitesi iyileşti; aktigrafi ve '
     'PSG ile objektif sonuçlar belirsiz. C1 (yavaş, uzun veriş) ve C4 (8 sn\'lik sayma döngüsü) buna dayanır.'),
    ('25156003', 'Van Diest 2014 · kısa alış, uzun veriş', '10.1007/s10484-014-9253-x', 'sakin §4',
     'n=30: kısa alış / uzun veriş (oran 0,42), uzun alış / kısa verişe göre daha fazla gevşeme bildirimiyle ilişkiliydi.'),
    ('34306146', 'Toussaint 2021 · derin nefes talimatı', '10.1155/2021/5924040', 'güvenlik §2',
     'Randomize, n=60: derin nefes grubunda önce ani bir fizyolojik uyarılma artışı görüldü. Bu yüzden derste "derin '
     'nefes al" yok; önce doğal nefes fark edilir.'),
    ('36000763', 'Jespersen 2022 (Cochrane) · müzik ve uyku', '10.1002/14651858.CD010459.pub3', 'sakin §6',
     '13 RKÇ, n=1.007: kayıtlı müzik öznel uyku kalitesinde fark gösterdi (PSQI −2,79, orta güven); objektif '
     'ölçümlerde iyileşme görülmedi. Müzik kuyruğunun (0/5/10/20 dk) dayanağı; "uyutur" denmez.'),
    ('36731199', 'Sharpe 2023 · tek 30 dk yoga nidra kaydı (karşı kanıt)', '10.1016/j.jpsychores.2023.111169',
     'sakin §1',
     'Pilot RKÇ, n=22: 30 dk\'lık kayıt sessiz uzanmaya göre uykuya dalma süresini değiştirmedi. Bu yüzden hiçbir '
     'sürüm için "uyutur" denmez.'),
    ('16941239', 'Knowlton & Larkin 2006 · azalan ses', '10.1007/s10484-006-9014-6', 'teslim §1.2',
     'RKÇ, n=48: tonu, yüksekliği ve hızı seans boyunca azalan seste EMG yalnız bu grupta düştü. Metin evreden evreye '
     'kısalır, boşluklar uzar, ses uyku izninden sonra alçalır.'),
    ('39690521', 'Luu 2024 · travma-duyarlı yoga nidra, 10 bileşen', '10.17761/2024-D-24-00021', 'sakin, güvenlik',
     'Öneri makalesi: özerklik ve onay, uygun uzunluk ve hazırlık, yeterli yerleşme ve dışa dönüş ya da uyku izni. '
     'Açılış cümlesi, atlama izni, imgede seçenek ve uyku izni buradan.'),
    ('24882909', 'Cordi, Schlarb & Rasch 2014 · sesli telkin ve uyku', '10.5665/sleep.3778', 'güvenlik §3, sakin §6',
     'n=70 genç kadın, öğle uykusu: "daha derin uyu" telkini yavaş dalga uykusunu kontrole göre artırdı; etki telkine '
     'yatkın kişilerde görüldü. Bu yüzden derste uyku vaadi ve "uyuyacaksın" dili yok.'),
    ('33562129', 'Wang 2021 · kulaklıkla uyumak', '10.3390/ijerph18041560', 'güvenlik §9',
     'Küme RKÇ, 830 öğrenci: sağlık eğitimi kulaklıkla uyumayı azalttı; çalışma bunu işitme açısından riskli davranış '
     'olarak ele aldı. Hazırlık kartındaki hoparlör önerisi bir tasarım çıkarımıdır.'),
    ('28958002', 'Bioulac 2017 · uykululuk ve trafik kazası', '10.1093/sleep/zsx134', 'güvenlik §8',
     'SD/MA, 17 çalışma: direksiyonda uykulu olmak kaza riskiyle ilişkili (OR 2,51). Açılış ekranındaki araç satırları.'),
    ('39808431', 'Radin 2025 · gerçek kullanım süresi', '10.1001/jamanetworkopen.2024.54435', 'benlik §1',
     'RKÇ, n=1.458: meditasyona özgü kullanım günde ortalama 3,36 dk; kullanıcıların %69,7\'si günde 5 dk\'nın altında. '
     'Kısa sürüm bu yüzden bütün bir ders olarak kurulur; etkisi ayrıca sınanmadı.'),
    ('34260686', 'Tran 2021 · ayağa kalkınca kan basıncı düşüşü', '10.1093/ageing/afab090', 'güvenlik §7',
     'SD/MA: 65 yaş üstünde ayağa kalkınca ilk anda görülen düşüş, sürekli ölçümle %29. Durdur dönüşündeki "yana dön, '
     'otur, bekle" sırası.'),
]

META = {
    'schema': 'nefona.yoga.lesson/1 (PLAN §B.2 + ekler)',
    'sozlesmeNotu': ('PLAN §B.2 alanları aynen (id, priority, playOrder, kind, clips[id, text, voice, gapAfter, role/tier], '
                     'silenceWindows, minSec, prefSec, maxSec) + pilot ekleri (ders2.lesson.json ile aynı adlar). Farklar: '
                     'voice anahtarı hoc (v3 tek ses); uyku izni bloğu kind=sleepPermission (planlayıcı onu kapanış '
                     'kapağı olarak okur); extras.quickClosing = "Uykuya geç"; skeleton30 (16–30 dk iskeleti, metinsiz).'),
    'id': 'ders3-uykuya-gecis',
    'version': 'B-parti1-metin-2 (2026-09-30; karar 2 yedeği iki model incelemesi işlendi, b/INCELEME.md; sahibin kulağı bekliyor)',
    'title': 'Uykuya Geçiş',
    'tagline': 'Günü bırakıp uykuya yavaşça geçmek için.',
    'daypart': 'night',
    'posture': 'lying (yatakta, ışıklar kapalı ya da kısık)',
    'defaultMinutes': 15,
    'releaseMinutes': [5, 15],
    'minutes': {'min': 5, 'max': 15, 'step': 1, 'designMax': 30,
                'note': 'ilk yayında çipler 5 · 15 (PLAN.v3 §A.1); planlayıcı testi 5–15\'in her dakikası; 16–30 ikinci '
                        'aşama (Kapı 9–11). 3 dk yok (PLAN.v3 §A.3).'},
    'openingNotice': NOTICE,
    'openingScreen': [IZIN, NOTICE + ' Bu dersten hemen sonra araç kullanma.',
                      'Gece kalkman gerekirse önce yana dön, otur, sonra kalk.'],
    'preparationCard': ['Işığı kapat ya da iyice kıs', 'Telefonu, ekranı aşağıya bakacak biçimde yanına bırak',
                        'Sesi, konuşmayı zorlanmadan duyacağın en düşük düzeye getir',
                        'Uyurken kulak içi kulaklık yerine hoparlör daha iyi',
                        'Müzik kuyruğu: 0 / 5 / 10 / 20 dakika (varsayılan 10)'],
    'preparationToggles': [{'id': 'speechClarity', 'label': 'Konuşmayı daha net duymak istiyorum', 'default': False,
                            'remember': 'kullanıcı başına',
                            'effect': 'voicePhaseGainDb.clarityMode + music.clarityMode + qa.speechOverBedDbMinClarity',
                            'preselect': 'profilde yaş bilgisi 60 ve üstüyse önceden işaretli (pilot L3-10; VARSAYIM)'}],
    'soundCheck': {'when': 'modül düzeyi: ilk Yoga oturumu, "Başla"dan önce (Ders 2 verisiyle aynı kural); Ders 3 ilk '
                           'dersse bu klipler çalar', 'clips': ['c2.bas', 'c4.n03', 'c3.yagmur'],
                   'screenText': 'Başının ağırlığını yastığa bırakıyorsun. Üç… Yağmur çatıya usul usul vuruyor.',
                   'level': 'Derin evre düzeyi (−3 dB) ve kısık Derin yatağı', 'question': 'Sözcükleri rahatça seçebildin mi?',
                   'options': ['Evet', 'Hayır'], 'onNo': 'speechClarity açılır ve kullanıcı başına hatırlanır',
                   'durationSec': 12, 'note': 'VARSAYIM'},
    'scenePicker': {'options': [], 'default': None,
                    'note': 'Ders 3\'te başlamadan sahne seçici yok: seçim ders içinde sözle (c3.yer: oda ya da veranda; '
                            'c3.su: yağmur sesi iyi gelmezse onu çok uzakta düşünmek). Doğa katmanı Müzik / Doğa / Sessizlik '
                            'seçimine bağlıdır (PLAN.v2 §A.1).'},
    'eveningHint': {'afterLocalHour': None, 'text': '',
                    'note': 'Ders 3 kendisi gece dersidir; 20.00\'den sonra gündüz derslerinin kartı buraya yönlendirir '
                            '(PLAN.v3 §2.0 madde 7).'},
    'leadIn': {'min': 3.0, 'pref': 4.0, 'max': 6.0},
    'limits': {'silenceWindowMaxSec': 45, 'silenceMaxSecUpTo15': 20, 'clipMaxSec': 15,
               'silenceWindowNote': 'uyku dersinde 30 dk\'da da pencere en çok 45 sn (usta hoca kararı, düzeltme turu UH11); '
                                    'güvenlik §11.B-16\'nın 90 sn üst sınırının altında',
               'clipMaxNote': 'Z3-07: birimin konuşması (cümle arası sessizlikler hariç) her hızda <= 15 sn',
               'lastSecondsNoNewImage': 60, 'sentenceGapMinDerinSec': 1.0,
               'note': '<= 15 dk\'da duyurulu sessiz pencere yok (hiçbir boşluk 20 sn\'yi aşmaz); pencereler 16–30 dk\'da'},
    'sentenceGapByPhase': SG,
    'sentenceGapBreathPair': None,
    'sentenceGapBreathPairNote': 'Ders 3\'te nefes çifti (breathPair) birimi yok',
    'planner': {'kural': 'Pilot planlayıcı aynen (T4, T5, önek kuralı; ders2.lesson.json planner.kural). Uyku izni bloğu '
                         'tek kapanış kapağıdır; dışa dönüş yok. Artım sırası entryRank/fillRank.',
                'stretchCapBeforeIncrement': 0.5, 'entryRanks': {'C4': 195, 'C5': 700},
                'p1DropOrder': [],
                'p1DropNote': '5 dk\'nın en kısa hali her köşede sığar (timing.txt boş pay); P1 blok düşmez.',
                'variants': 'Ders 3\'te dönüşümlü seçenek (alternates) yok.'},
    'timingModel': {
        'model': 'pilot timing.py: alt klip süresi = hece / eklemleme hızı + TTS-içi duraklamalar + uç payı (0,31; mikro '
                 '0,15) × DUR_SCALE',
        'corners': {
            'hoc': {'rate': 4.68, 'profile': 'hi', 'durScale': 1.0,
                    'basis': 'Nefona Hoca önizleme eklemleme hızı 4,68 hece/sn (render/sel/hoc) + yüksek (Hakan v2) '
                             'duraklama profili. VARSAYIM; en yavaş köşe'},
            'hoc-lo': {'rate': 4.68, 'profile': 'lo', 'durScale': 1.0,
                       'basis': 'aynı hız, düşük duraklama profili. VARSAYIM; Ders 2\'nin ölçülmüş hoc kliplerine en '
                                'yakın model (Ders 1 raporu: ölçülen/model 0,990)'},
            'nes': {'rate': 5.6, 'profile': 'hi', 'durScale': 1.109,
                    'basis': 'Neslihan\'ın Ders 2\'de ölçülmüş süreleri: ölçülen/model(5,6 yüksek) = 1,109 (110 ortak '
                             'klip; v3/calc/measure.py). VARSAYIM: Ders 3 metnine aynı oranla taşındı'}},
        'slackFloors': {'5': 15.0, 'note': 'min sessizliklerle 5 dk boş payı; pilot T6 tabanı (VARSAYIM)'},
        'note': 'Ölçülmüş Ders 3 süresi yok; bütün süreler tahmindir. Ses üretilince voice.hoc.sec ile yeniden kurulur ve '
                'check_plan yeniden koşar.'},
    'voiceProduction': {
        'path': 'yalnız MCP (creative_generate_speech); hız, kararlılık, seed, previous_text ve telaffuz sözlüğü yok',
        'chosen': {'name': 'Nefona Hoca', 'voice_id': VOICE_ID, 'sex_param': 'm', 'model': 'eleven_v4',
                   'generations_count': 3},
        'voice': 'Nefona Hoca (voice_id %s; sahip 2026-09-30, madde 8, VARSAYIM seçimi)' % VOICE_ID,
        'takes': 'birim ya da taşıyıcı başına 3 çekim; Scribe birebir eşleşen, kesimi tutan ve taşıyıcı ekleminde F0 '
                 'sıçraması <= 2 yarım ton olan çekim seçilir (SPEC.v3 §4, §6)',
        'status': 'bu adımda hiçbir ses üretilmedi; ElevenLabs bağlantısı bu oturumda yok'},
    'voicePhaseGainDb': {'Varış': 0.0, 'Derinleşme': -1.5, 'Derin': -3.0, 'Kapanış': 0.0,
                         'sleepSteps': {'k.anahtar3': -3.0, 'k.nefes': -3.0, 'k.izin': -3.0, 'k.uyanik': -4.5,
                                        'k.son': -6.0,
                                        'note': 'uyku izninden sonra ses gerçekten alçalır ("sesim yavaşça kısılacak"); '
                                                'yatak aynı ölçüde iner, konuşma − yatak >= 15 dB korunur; rampa '
                                                'yalnız >= 4 sn\'lik sessizlikte (S3-02). VARSAYIM'},
                         'Kapanış_note': 'Ders 3\'te Kapanış evresi yok (uyku izni Derin evrede); yalnız Durdur dönüşü '
                                         '0 dB\'de çalar',
                         'clarityMode': {'Varış': 0.0, 'Derinleşme': -0.5, 'Derin': -1.0, 'note': 'pilot L2-10 (VARSAYIM)'}},
    'music': {
        'bpmFeel': 48, 'pulseNote': '48 BPM hissi, vuruşsuz; ElevenLabs Music\'te tempo parametresi yok, istemde istenir ve '
                                    'ölçülür; müziğin nefese eşlik ettiği iddia edilmez (PLAN.v2 §A.1)',
        'source': 'A = ElevenLabs Music (SAHIP_ISTEKLERI madde 8; SPEC.v3 §7)',
        'key': 'La♭ majör sıcak pad + çok seyrek keçe piyano (VARSAYIM)',
        'theme': 'sürekli incelen doku; son bölümde yalnız pad ve yağmur (PLAN.v2 Ders 3 kartı)',
        'phases': ['varis', 'cekirdek (C1–C3; imgede seyrek keçe piyano)', 'uyku (yalnız pad + yağmur)',
                   'kuyruk (0/5/10/20 dk; son 3 dk kosinüs, tamamen durur)'],
        'textureLayers': {'layer:imge': 'c3.sahne: seyrek keçe piyano girer, yağmur bir basamak öne',
                          'layer:uyku': 'k.anahtar3: piyano çekilir, yalnız pad ve yağmur',
                          'rule': 'çapraz geçiş >= 8 sn, konuşmanın altında; 20 sn\'den kısa boşlukta evre geçişi yok; '
                                  'kreşendo yok (PLAN.v2 §A.1)'},
        'duckedBedLufs': {'Varış': -35.0, 'Derinleşme': -36.5, 'Derin': -38.0,
                          'note': 'gece dersi konuşma hedefi −20 LUFS (PLAN.v2 §0, VARSAYIM); yatak ≈ 15 dB altta'},
        'tail': {'options': [0, 5, 10, 20], 'default': 10, 'fadeLastSec': 180, 'curve': 'kosinüs',
                 'stopsCompletely': True, 'outsideDuration': True,
                 'rule': 'uyku izninden sonra ses susar; kuyruk sabaha kadar çalmaz (PLAN.v2 §B.6; güvenlik §11.D-5; '
                         'dalgaSleep.js:12,18 kalıbı)'},
        'nature': {'default': 'çatıda hafif yağmur (sürekli, gök gürültüsü yok, damla şıpırtısı yok); varsayılan açık',
                   'variants': '4 × 30 sn döngü, rastgele sıra (PLAN.v2 §D.3)',
                   'imageSync': 'c3.sahne → k.son arasında 1–2 dB öne (VARSAYIM); c3.su ("yağmur sesi iyi gelmezse") sözlü bir '
                                'imge seçeneğidir, katmanı kapatmaz (katman Doğa / Müzik / Sessizlik seçimindedir)',
                   'uniquenessConflicts': ['Ders 2 kıyı dokusu ve Ders 9 okyanus: su dokusu; yağmur ayrışık '
                                           '(çatıya düşen, geniş bantlı, dalga periyodu yok) — kör dinlemede yan yana']},
        'clarityMode': {'bedExtraDuckDb': -6.0, 'note': 'L2-10 (VARSAYIM)'},
        'windowBedAboveDuckDb': None,
        'windowNote': '<= 15 dk\'da duyurulu pencere yok; yatak hiç kalkmaz'},
    'visual': {'form': 'sönen kor', 'color': {'dark': '#E3A857', 'light': '#9B651A', 'name': 'kehribar'},
               'phases': ['varis', 'derinlesme', 'derin', 'uyku (kor kehribara döner, söner; ekran siyah)'],
               'pulse': {'respectFlashSafe': True, 'whenFlashSafeFalse': 'nabız yok, yalnız çok yavaş opaklık',
                         'counting': 'c4 sayılarıyla her sayıda kor bir soluk kararır (ses ne diyorsa görüntü o)'},
               'dawn': None, 'maxLuminance': 'gece bağıl ≈ %4 (PLAN.v2 §E.2; VARSAYIM)',
               'screen': 'oynatıcı ekranı açık tutmaz; kuyrukta dokununca yalnız "Durdur" (PLAN.v2 §B.6)'},
    'qa': {'speechOverBedDbMin': 15.0, 'speechOverBedDbMinClarity': 21.0, 'speechOverBedAllPieces': True,
           'microClipRmsOffsetDb': 0.0, 'positionCheck': {'lowpassHz': 4000, 'corrMin': 0.95, 'searchMs': 50,
                                                          'maxShiftMs': 1.0},
           'carrierJoinF0StepSemitones': 2.0, 'windowLoudnessRiseMaxDbPerSec': 1.0,
           'derinClipRateCeil': 5.0, 'sentenceGapNote': 'Derin evrede her cümle sınırında >= 1,0 sn (L3-02)',
           'sleepEndRule': 'k.son\'dan sonra konuşma yok; kuyruk tam durur (ölçülür: son 3 dk kosinüs, sonrası dijital 0)',
           'timingModel': 'measuredRatioVsModel: seslendirmeden sonra yazılır (SPEC.v3 §1.1)'},
    'evidenceLine': ('Neye dayanıyor: Uyumakta zorlanan 41 kişiyle yapılan bir çalışmada, ilgi çekici bir imgeyle '
                     'dikkatlerini dağıtmaları söylenenler, talimat almayanlara göre daha kısa sürede uykuya daldıklarını '
                     'bildirdi. Yatmadan önce yavaş nefes alma ve müzik dinleme çalışmalarında kişilerin kendi uyku değerlendirmesi '
                     'iyileşti; cihazla ölçülen uykuda belirgin bir fark görülmedi. Tek bir yoga nidra kaydı sessizce '
                     'uzanmaya göre uykuya dalma süresini değiştirmedi. Bu ders uyutma vaadi taşımaz.'),
    'evidenceByVersion': {'5': 'Beş dakikalık sürümün etkisini doğrudan sınayan bir çalışma bulamadık; bu sürüm aynı '
                               'sırayı daha az ayrıntıyla izler.'},
    'sourcesCard': {'rows': [{'pmid': p, 'cite': c, 'doi': d, 'file': f, 'detail': t} for p, c, d, f, t in SOURCES],
                    'note': 'cite kartta gösterilir; detail yalnız ders3.script.md içindir. Hepsi doğrulanmış '
                            'dosyalardan (dossier-*.dogrulanmis.md); yeni PMID eklenmedi.',
                    'footer': 'Kaynak: PubMed (National Library of Medicine). DOI\'ler https://doi.org/ önekiyle açılır.'},
    'progress': {'domain': 'wellbeing', 'effectKey': 'uyku-gecisi', 'measure': 'uykuya dalma kolaylığı (öznel)',
                 'question': '', 'beforeQuestion': None,
                 'morningQuestion': 'Dün gece uykuya dalmak ne kadar kolaydı?', 'scale': [1, 10], 'better': 'up',
                 'when': 'önce puanı sorulmaz; ertesi sabah uygulama ilk açıldığında, saat 12.00\'ye kadar tek soru; '
                         'sonra sorulmaz, o gece için veri boş kalır (PLAN.v2 Ders 3 kartı)',
                 'metric': {'unit': 'puan', 'better': 'up', 'series': True},
                 'note': 'bir "nasıl hissettin" gidişatıdır, etki kanıtı değildir (güvenlik §11.F)'},
    'afterCheck': {'question': 'Ders sırasında zorlandın mı?', 'options': ['Hayır', 'Biraz', 'Çok'], 'skippable': True,
                   'when': 'yalnız ders Durdur (X) ile bitirildiyse durdurma ekranında; uyku izni çaldıysa gece '
                           'sorulmaz (en az dokunuş; VARSAYIM)',
                   'onCok': 'Bu olabiliyor ve durman doğruydu. Bir dahaki sefere daha kısa ya da gözleri açık bir sürüm '
                            'deneyebilirsin. Sık tekrarlarsa ya da geçmezse bir uzmanla konuşmak iyi olur. Acil '
                            'durumda 112.',
                   'storage': 'veri telefonda kalır; puan olarak gösterilmez (güvenlik §11.F)'},
    'panelChecks': [
        'Söyleyiş: "verandadasın" (c3.yer; beş hece, iki "da") akıcı mı? Değilse "Belki üstü kapalı bir balkondasın." '
        'yedeği Türkçe editöre sorulur.',
        'Vurgu ve söyleyiş: "yan" (a.durus: sırtüstü ya da yan), "Her veriş, günü…" (c1.gun: virgülde durak yoksa "veriş günü" '
        'diye duyulur), "Gece senin." (k.son: vurgu "senin"de), "Bugün bitti." (üç anahtar cümlede aynı ezgi, giderek yumuşak).',
        'Sayılar (car.sayi3): 8 sn\'lik aralıkla tek heceli "üç", "beş", "on" net mi; "bir." son sayı düşen ezgiyle mi?',
        'Uyku izninden sonra ses alçalması (sleepSteps −4,5 / −6 dB) konuşmayı yataktan >= 15 dB üstte tutuyor mu?',
        'Yağmur dokusu ile Ders 2 kıyı ve Ders 9 okyanus dokuları yan yana ayırt ediliyor mu (su dokusu çakışması)?',
    ],
}

SKELETON30 = {
    'status': 'İKİNCİ AŞAMA (Kapı 9–11): 16–30 dk metni yazılmadı. Bu bölüm iskelettir; usta hoca (ya da karar 2 '
              'yedeği) onayına gider. Ayrıntı: iskelet30.md',
    'playOrder': ['A', 'C1', 'C2', 'C4', 'BR.orta', 'C3', 'C5', 'K'],
    'anchorsSec': {
        '5': {'A': 45, 'C1': 60, 'C2': 70, 'C4': 0, 'C3': 85, 'K': 40},
        '15': {'A': 75, 'C1': 105, 'C2': 210, 'C4': 150, 'C3': 300, 'K': 60},
        '20': {'A': 90, 'C1': 120, 'C2': 270, 'C4': 240, 'C3': 405, 'K': 75},
        '30': {'A': 90, 'C1': 150, 'C2': 360, 'C4': 270, 'C3': 540, 'C5': 300, 'K': 90}},
    'anchorsNote': 'PLAN.v2 §B.4 (Ders 3 tablosu) ve sure.md §4; VARSAYIM. 5 ve 15 dk için planlayıcının kurduğu gerçek '
                   'süreler timing.txt\'de; C3 15 dk\'da dikkat eğrisi sınırı (tek doku <= 300 sn) yüzünden çapanın '
                   'biraz altında tutuldu.',
    'attentionCurve30': '0:00 varış · 1:30 yavaş veriş · 4:00 beden ağırlaşır: ayaklardan bele · 7:00 belden başa, '
                        'ağırlıktan sıcaklığa · 10:00 nefesle geri sayma · 14:30 sahne: yağmur ve oda · 17:30 '
                        'ayrıntılar: dokunma, koku, ses · 20:30 cümleler seyrekleşir · 23:30 imgede sessiz kalış: yağmurun sesiyle · '
                        '28:30 uyku izni (PLAN.v2 §A.2.2; en uzun değişimsiz aralık 4:30). Düzeltme turu (UH10): PLAN.v2 §A.2.2 23:30 '
                        'satırı "imgede sessiz yürüyüş" idi; usta hoca kararıyla yürüyüş yok (plana not gerekir)',
    'keySentences': ['Bugün bitti; artık dinlenebilirsin.', 'Bugün bitti; dinlenebilirsin.', 'Bugün bitti.'],
    'keyNote': 'PLAN.v2 §A.2.1 yönü: "Bugün bitti; şimdi dinlenebilirsin." → "Bugün bitti." → "Dinlenme zamanı…". '
               'Değişiklik: "şimdi" dolgusu çıktı; üçüncü söyleyiş yüklemsiz ve üç noktalıydı (üç nokta yalnız '
               'listelerde, PLAN.v2 §C.2) ve ikinciden uzundu (her söyleyiş kısalır); yerine ikinci biçim araya girdi, '
               'en kısa "Bugün bitti." uyku izninin başına kondu. Türkçe editör ve usta hoca onayına.',
    'imageArc': 'yağmurlu bir akşam (oda ya da üstü kapalı veranda; yağmur sesi iyi gelmeyen için yağmuru çok uzakta '
                'düşünmek) → yağmuru dinlemek (ses, damla, ıslak toprak kokusu, camdan süzülen damlalar) → örtünün ağırlığı '
                've sıcaklığı → lambanın sarı ışığı → ışık yavaş yavaş kısılır, loş bir aydınlık kalır → [16–30] ayrıntılar '
                'derinleşir, cümleler seyrekleşir → [30] imgede sessiz kalış: aynı yerde, giderek seyrekleşen tek '
                'cümlelerle yağmur, örtü ve nefes → uyku izni. Tek sahne; yeni yer ve yeni hareket yok.',
    'music': 'La♭ majör sıcak pad + çok seyrek keçe piyano, 48 BPM hissi, vuruşsuz; doğa: çatıda hafif yağmur '
             '(varsayılan açık). Yay: sürekli incelen doku; imgede piyano seyrekleşir, uyku izninde yalnız pad ve '
             'yağmur; kuyruk 0/5/10/20 dk, son 3 dk kosinüs, tamamen durur. 5, 15 ve 30 dk\'da aynı tema.',
    'visual': 'sönen kor (kehribar #E3A857); evreyle loşlaşır; geri saymada her sayıda bir soluk kararır; uyku izninde '
              'kehribar köze döner ve söner; ekran siyah kalır.',
    'entryAndFillOrder': {
        'upTo15': 'timing.txt "Blokların ve isteğe bağlı kliplerin girdiği dakika" tablosu (her köşe için ayrı)',
        'from16': ['C3 ayrıntı klipleri (dokunma, koku, ses; ikinci ayrıntı turu) — 16–18 dk',
                   'C2 genişletme: belden başa ikinci tur, ağırlıktan sıcaklığa (sıcaklık listesi) — 17–19 dk',
                   'BR.orta: ortada "istediğin an" hatırlatması + gözler açık seçeneği, C3\'ün hemen önünde — >= 20 dk '
                   'her sürümde (güvenlik §11.B-3)',
                   'C4 genişletme: sayma sonrası "bu kez sen içinden say" duyurulu pencere (<= 45 sn) — 20–22 dk',
                   'C3 duyurulu pencereler (<= 45 sn; seyrekleşen cümleler) — 21–25 dk',
                   'K genişletme (1:15 → 1:30) — 23 dk',
                   'C5 İmgede sessiz kalış: yağmurun sesiyle (P5) — 26–30 dk'],
        'rule': 'Önek kuralı: 16–30 artımlarının hepsi 15 dk\'nın durduğu artımın ardından gelir; <= 15 dk planları '
                'değişmez (PLAN.v3 §A.4). Derleme testi bunu denetler.'},
    'blocks': [
        {'id': 'BR.orta', 'kind': 'bridge', 'placement': {'before': 'C3'}, 'requiresMinSec': 1200,
         'content': 'ortak açılış cümlesinin "istediğin an … senin elinde" biçimi + gözler açıksa bakış serbest + '
                    'dayanak (yatağın taşıdığı beden); >= 20 dk her sürümde (PLAN.v2 §C.5, güvenlik §11.B-3)'},
        {'id': 'C5', 'kind': 'core', 'priority': 5, 'playOrder': 5, 'entryRank': 700,
         'title': 'İmgede sessiz kalış: yağmurun sesiyle (seyrek ses)',
         'content': 'aynı yerde kalınır; yeni hareket ve yer değişimi yok (usta hoca kararı, düzeltme turu UH10: önceki '
                    '"imgede sessiz yürüyüş" lamba kısılıp örtünün altına yerleşildikten sonra uyarılmayı geri '
                    'yükseltiyordu). Giderek seyrekleşen tek cümleler: yağmur, örtü, nefes (her 30–60 sn\'de bir); iki '
                    'duyurulu pencere (<= 45 sn; duyuru bir kapı taşır: "Uyanık kalırsan da olur."); pencere dönüşü '
                    'windowRule30\'a göre',
         'anchorsSec': {'30': 300}},
        {'id': 'C2+', 'kind': 'extension', 'content': 'belden başa ikinci, daha yavaş tur; "ağırlıktan sıcaklığa": '
                                                        'ayak tabanları, avuçlar, yüz; atlama kapısı yinelenir'},
        {'id': 'C4+', 'kind': 'extension', 'content': 'ikinci sayma yok; sayma sonrası isteğe bağlı iç sayma penceresi '
                                                        '(Ders 2 c2.x.kendin kalıbı, 8 sn döngü; <= 45 sn)'},
        {'id': 'C3+', 'kind': 'extension', 'content': 'ayrıntılar: parmak uçlarında örtünün dokusu, yastığın serinliği, '
                                                        'uzakta bir kapının kapanma sesi yok (ani ses yok), '
                                                        'odanın ahşap kokusu; yağmur çatıdan oluğa'},
    ],
    'windowRule30': {'maxSec': 45, 'returnTone': None, 'welcomeClip': None,
                     'returnLine': 'imgeden tek kısa cümle (ör. "Yağmur sürüyor."); "Yeniden seninleyim" kalıbı yok',
                     'returnLevelDb': 'evre düzeyinin (Derin −3 dB) 3 dB altı',
                     'announceDoor': '"Uyanık kalırsan da olur."',
                     'basis': 'usta hoca kararı (düzeltme turu UH11): uyku dersinde dönüş tınısı ve karşılama cümlesi '
                              'uykuya dalmış dinleyiciyi uyandırabilir (güvenlik §11.B-15); güvenlik §11.B-16\'nın duyuru '
                              've dönüş şartı tınısız, fısıltıya yakın tek cümleyle karşılanır'},
    'safety30': ['ortada "istediğin an" hatırlatması (>= 20 dk)',
                 '20 sn\'yi aşan her sessizlik duyurulu, kapılı ("Uyanık kalırsan da olur.") ve <= 45 sn',
                 'pencere dönüşünde tını ve karşılama yok; imgeden tek kısa cümle, fısıltıya yakın düzeyde',
                 'hiçbir yerde dışa dönüş yok', 'son 60 sn\'de yeni imge yok',
                 'müzik kuyruğu sürenin dışında, tamamen durur'],
}

EXTRAS = {
    'quickClosing': {
        'id': 'K.uyku', 'kind': 'utility', 'title': '"Uykuya geç": aynı dosyada uyku izninin başına atlama',
        'mode': 'sameFileSleepPermission', 'buttonLabel': 'Uykuya geç',
        'cue': {'music': 'phase:uyku (yalnız pad ve yağmur); dönüş tınısı yok', 'visual': 'kor kehribara döner',
                'voiceGain': 'o anki evre düzeyinden Derin düzeyine 4 sn rampa'},
        'leadInSec': 4.0, 'voiceGainRampSec': 4.0, 'prefixByActiveBlock': {}, 'releaseClip': {}, 'windowReturn': {},
        'rule': 'PLAN.v2 §B.5 ve PLAN.v3 §D.3: o anki cümle biter, aynı dosyada K\'nin başına 2 sn\'lik geçişle atlanır. '
                'Uyku dersinde imgeyi bırakma ön klibi yoktur: imge açıkken uykuya geçmek dersin amacıdır; dışa '
                'dönüş ve şafak yok. Klipler denetim içindir: K\'nin zorunlu klipleri.',
        'clips': QUICK},
    'stopReturn': {
        'id': 'D.durdur', 'kind': 'utility',
        'title': 'Durdur (X) sonrası isteğe bağlı 20–30 sn sesli dönüş (uyku dersi biçimi)',
        'screenText': ' '.join(c['text'] for c in STOP),
        'screenTextCommon': 'Gözlerini aç, etrafına bak, acele etme. Uzanıyorsan önce yana dön, sonra otur.',
        'screenNote': ('düzeltme turu (TE1 BLOCKER): ekran = söylenen. Uyku dersinde durdurma ekranı ortak metin yerine '
                       'sesli dönüşün üç cümlesini gösterir; ortak metnin "gözlerini aç, etrafına bak"ı gece dersi için '
                       'yazılmamıştı. PLAN.v2 §B.5\'teki "ekran metni ortak" kuralından Ders 3\'e özgü sapma; plana not gerekir.'),
        'rule': 'PLAN.v2 §B.5: X onaysız, 2 sn\'de söner. Sesli dönüş yalnız ekrandaki düğmeye dokununca çalar (kişinin '
                'kendi seçimi); uyku dersinde gece odayı hatırlatır ve kalkış sırasını söyler. Ekranda, sesli dönüş '
                'çalsa da çalmasa da, aynı üç cümle durur (screenText).',
        'clips': STOP},
    'firstEverIntro': {
        'id': 'I.ilk', 'kind': 'utility', 'title': 'İlk ders cümlesi (kişinin ilk yoga dersi Ders 3 ise; ayrı giriş dosyası)',
        'rule': 'PLAN.v2 §A.1, PLAN.v3 §D.3: dersin giriş müziği + cümle, sonra dersin başına 2 sn geçiş (≈ 7 sn)',
        'clips': INTRO},
}


def main():
    sys.path.insert(0, HERE)
    import timing_d3 as TD
    lesson = dict(META)
    lesson['carriers'] = CARRIERS
    lesson['blocks'] = BLOCKS
    lesson['extras'] = EXTRAS
    lesson['skeleton30'] = SKELETON30
    PV = TD.planner_view(lesson)
    prof = T.profile('hi', 4.68)
    plans = {m: T.plan(PV, m * 60, 4.68, 'hi') for m in (5, 10, 15)}
    for b in lesson['blocks']:
        def dur(c, lv):
            return T.clip_dur(c, 4.68, prof) + sum(x[lv] for x in T.sent_gaps(c)) + T.gap_of(c, 4.68, prof)[lv]
        req = [c for c in b['clips'] if c['tier'] == 'required']
        b['minSec'] = round(sum(dur(c, 'min') for c in req), 1)
        b['maxSec'] = round(sum(dur(c, 'max') for c in b['clips']), 1)
        b['prefSec'] = {str(m): round(T.block_durations(p).get(b['id'], 0.0), 1) for m, p in plans.items()}
        b['estimateBasis'] = ('Nefona Hoca köşesi: 4,68 hece/sn + yüksek duraklama profili, cümle arası sessizlikler '
                              'dahil (VARSAYIM); minSec = zorunlu klipler en kısa sessizlikle; prefSec = planlayıcının '
                              '5/10/15 dk planındaki blok süresi; üretimden sonra voice.hoc.sec ile')
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(lesson, f, ensure_ascii=False, indent=1)
        f.write('\n')
    n = sum(len(b['clips']) for b in BLOCKS)
    print('yazıldı', OUT, 'klip', n, 'taşıyıcı', len(CARRIERS))


if __name__ == '__main__':
    main()
