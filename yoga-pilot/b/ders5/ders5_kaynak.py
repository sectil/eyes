#!/usr/bin/env python3
"""Nefona Yoga · Ders 5 "Tek Nokta" · tek kaynak (B adımı, Parti 1, sesten bağımsız kısım).

Bu dosya ders5.lesson.json'u üretir. Metnin tek kaynağı burasıdır (+ ders5_meta.py); ders5.script.md ve timing.txt
`ders5_md.py` ve `timing_d5.py` ile bu JSON'dan çıkar. Hece, sözcük ve cümle sayıları pilot planlayıcının
(`timing.py`, pilot kopyası, değiştirilmedi) sayaçlarıyla hesaplanır. Ses üretilmedi; bütün `sec` alanları null.

Şema: pilot `ders2.lesson.json` ile aynı (PLAN.v2 §B.2 + pilot ekleri). Tek fark (Ders 1 ile aynı): v3 tek ses kararı
(sahip, 2026-09-30, madde 8: ses3 = Nefona Hoca) yüzünden `voice` anahtarı `female`/`male` yerine `hoc`tur.
Ders 5'te mikro ipucu ve taşıyıcı yoktur: nefes sesli sayılmaz, dinleyici içinden sayar (bkz. ders5.script.md §1.2).
"""
import json
import os
import sys

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import timing as T  # noqa: E402  (pilot timing.py'nin birebir kopyası)
import ders5_meta as M  # noqa: E402

LESSON = 'ders5'
OUT = os.path.join(HERE, 'ders5.lesson.json')
VOICE_KEY = 'hoc'

SG = {'Varış': {'min': 0.6, 'pref': 0.8, 'max': 1.0}, 'Derinleşme': {'min': 0.8, 'pref': 1.0, 'max': 1.3},
      'Derin': {'min': 1.2, 'pref': 1.8, 'max': 2.5}, 'Kapanış': {'min': 0.8, 'pref': 1.0, 'max': 1.2}}
SHORT_BELOW = 240          # 3 dk kısa biçimleri ve minTarget (PLAN.v3 §A.2 kural 2)
AVUC = 420                 # avuçlama C3'ün tabanından (400) sonra girer
STRETCH_HEADROOM = 4.0     # kilitsiz klipte max >= pref + 4 sn (en çok 20; pencere ve Kapanış hariç)


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
    for k in ('fillRank', 'fillGroup', 'minTarget', 'requires', 'short', 'window'):
        if kw.get(k) is not None:
            c[k] = kw[k]
    return c


def finish(c):
    """Sayaçlar, ses dosyaları, alt klipler (MT3-02) ve TTS birimi; pilot sözleşmesindeki sırayla."""
    ga = c['gapAfter']
    if not c.get('window') and c['phase'] != 'Kapanış':
        ga['max'] = min(20.0, max(ga['max'], ga['pref'] + STRETCH_HEADROOM))
    c['syllables'] = T.syllables(c['text'])
    c['words'] = len(T.words(c['text']))
    c['sentences'] = len(T.sentences(c['text']))
    c['required'] = c['tier'] == 'required'
    if c.get('short'):
        sh = c['short']
        sh['syllables'] = T.syllables(sh['text'])
        sh['words'] = len(T.words(sh['text']))
        sh['sentences'] = len(T.sentences(sh['text']))
        same = sh['text'] == c['text']
        sh['voice'] = ({'sameAsMain': True} if same else
                       {VOICE_KEY: {'file': 'public/yoga/%s/%s/%s.k%d.m4a' % (LESSON, VOICE_KEY, c['id'],
                                                                             sh['belowSec']), 'sec': None}})
        ssubs = T.split_keep(sh['text'])
        if len(ssubs) > 1 and not same:
            sh['subclips'] = [{'index': i + 1, 'text': t, 'syllables': T.syllables(t),
                               'voice': {VOICE_KEY: {'file': 'public/yoga/%s/%s/%s.k%d.%d.m4a' % (
                                   LESSON, VOICE_KEY, c['id'], sh['belowSec'], i + 1), 'sec': None}}}
                              for i, t in enumerate(ssubs)]
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
V = 'Varış'
A = [
    clip('a.durus', 'Sırtın dik olsun ama gerilmesin; rahatça oturman yeterli.', 'required', g(3, 4, 6), V,
         cue={'visual': 'phase:varis (ışık noktası geniş ve soluk)',
              'music': 'phase:varis (Sol, sinüs benzeri sürekli ton; ElevenLabs Music)'},
         tags={'texture': 'varis', 'action': 'dik ve rahat oturmak'},
         short={'belowSec': SHORT_BELOW,
                'text': 'Sırtın dik olsun ama gerilmesin. Gözlerini kapatıp kapatmamak sana kalmış.',
                'gapAfter': g(3, 3.5, 4),
                'note': '3 dk: duruş ve gözler tek birimde (PLAN.v3 §A.2, sure.md §3.1); "-(y)abil-" yok'}),
    clip('a.gozler', 'Gözlerini kapatmak ya da açık tutmak sana kalmış; gözlerin açıksa bakışın yere insin.',
         'required', g(4, 5, 7), V,
         tags={'texture': 'varis', 'eyesOpen': True, 'eyes': 'baskı yok; açıksa bakış yere iner, sabitlenmez',
               'action': 'gözleri kapatmak ya da bakışı indirmek'}, minTarget=SHORT_BELOW),
    clip('a.izin', 'İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin.', 'required',
         g(3, 4, 6), V, tags={'texture': 'varis', 'safety': 'opening', 'eyesOpen': True, 'repeatOk': ['gözle']},
         short={'belowSec': SHORT_BELOW,
                'text': 'İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin.',
                'gapAfter': g(3, 3, 3.5), 'note': '3 dk: aynı metin, kısa eylem payı; en kısa sessizlik 3 sn (kapak '
                                                  'sıkıştırılmaz, PLAN.v3 §A.2 kural 2; düzeltme turu UH18b)'}),
    clip('a.acilis', 'Dikkatin bir el feneri gibi; ışığını şimdi tek bir noktaya topluyorsun.', 'required',
         g(5, 6, 8), V,
         short={'belowSec': SHORT_BELOW,
                'text': 'Dikkatin bir el feneri gibi; ışığını şimdi tek bir noktaya topluyorsun.',
                'gapAfter': g(5, 6, 6.5), 'note': '3 dk: aynı metin, bloğun tek >= 5 sn sessizliği'},
         tags={'texture': 'varis', 'uniqueOpening': True, 'arc': 0,
               'note': 'PLAN.v2 §A.2.1 yönü ("…şimdi ışığını tek bir noktaya toplayabilirsin") "-(y)abil-"siz '
                       'yazıldı: a.izin hemen önünde üç "-(y)abil-" taşır (PLAN.v3 §A.2 kural 6); her sürümde aynı'}),
    clip('a.dagink', 'Önce ışık geniş ve dağınık; seslere ve düşüncelere aynı anda vuruyor.', 'optional',
         g(6, 7, 9), V, tags={'texture': 'varis', 'arc': 1, 'image': 'arc',
                              'note': 'imge yayının 1. adımı: geniş ve dağınık ışık'}, fillRank=145),
    clip('a.omuz', 'Omuzlarını kulaklarından uzaklaştırıp çeneni gevşek bırakıyorsun.', 'optional', g(5, 6, 8), V,
         tags={'texture': 'varis', 'action': 'omuzları indirmek, çeneyi bırakmak'}, fillRank=255),
    clip('a.normal', 'Dikkatin birçok kez dağılacak; bu da pratiğin bir parçası.', 'optional', g(4, 5, 7), V,
         tags={'texture': 'varis', 'normalize': True, 'safety': 'normalize'}, fillRank=160),
    clip('a.karar', 'Işığı ne kadar sıkı tutacağına sen karar veriyorsun.', 'optional', g(4, 5, 7), V,
         tags={'texture': 'varis', 'safety': 'control'}, fillRank=355),
]

# ================================================================================================= C1 · NEFES ÇAPASI
DZ = 'Derinleşme'
C1 = [
    clip('c1.yer', 'Nefesi en çok burnunda mı, göğsünde mi, yoksa karnında mı duyuyorsun?', 'required',
         g(5, 6, 8), DZ,
         cue={'visual': 'phase:derinlesme (ışık daralmaya başlar)',
              'music': 'doku: sürekli ton daralır, >= 8 sn çapraz geçiş (konuşmanın altında)'},
         tags={'texture': 'capa', 'action': 'nefesin en açık duyulduğu yeri bulmak', 'safety': 'observe-first',
               'note': 'önce doğal nefes (güvenlik §11.B-6); nefes değiştirilmez'},
         short={'belowSec': SHORT_BELOW,
                'text': 'Nefesi en çok burnunda mı, göğsünde mi, yoksa karnında mı duyuyorsun?',
                'gapAfter': g(5, 5.5, 7), 'note': '3 dk: aynı metin, eylem payı 5–7 sn'}),
    clip('c1.nokta', 'Hangisi olursa olsun, ışığın bugün o noktaya düşüyor.', 'required', g(3, 4, 5), DZ,
         tags={'texture': 'capa', 'arc': 2, 'image': 'arc',
               'note': 'imge yayının 2. adımı: ışık tek noktada; 3 dk\'da yok (açılıştaki 60 sn konuşma payı; '
                       'a.acilis "tek bir noktaya" ve c1.izle "o noktadaki" imgeyi taşır)'},
         minTarget=SHORT_BELOW),
    clip('c1.izle', 'Birkaç nefes boyunca yalnızca o noktadaki hareketi izliyorsun.', 'required', g(13, 16, 19), DZ,
         tags={'texture': 'capa', 'breathRoom': True, 'repeatOk': ['nefes', 'nokta'],
               'note': 'nefes payı (PLAN.v3 §A.2 kural 3)'},
         short={'belowSec': SHORT_BELOW, 'text': 'Birkaç nefes boyunca yalnızca o noktadaki hareketi izliyorsun.',
                'gapAfter': g(12, 14, 16.5), 'note': '3 dk: aynı metin, nefes payı 12–16,5 sn (düzeltme turu UH18b: '
                                                     'a.izin\'e 0,5 sn verildi)'}),
    clip('c1.his', 'Nokta burnundaysa, alışta serin, verişte ılık bir hava geçiyor. '
                   'Göğsünde ya da karnındaysa, orası alışla yükselip verişle iniyor.', 'optional',
         g(9, 11, 14), DZ, tags={'texture': 'capa', 'sense': 'dokunma', 'repeatOk': ['alış', 'veriş', 'nokta']},
         fillRank=120),
    clip('c1.duzeltme', 'Nefesini düzeltmeye çalışmıyorsun; o kendi hızında geliyor.', 'optional', g(6, 8, 10), DZ,
         tags={'texture': 'capa', 'safety': 'observe-first'}, fillRank=130),
    clip('c1.kayma', 'Birazdan dikkatin bir düşünceye ya da bir sese kayacak; bu çok olağan.', 'required',
         g(3, 4, 5), DZ, tags={'texture': 'dagil-don', 'normalize': True, 'explain': True,
                                'note': 'dersin becerisi: dağıl, fark et, dön (PLAN.v2 Ders 5 kartı)'},
         short={'belowSec': SHORT_BELOW, 'text': 'Dikkatin birazdan kayacak; bu çok olağan.', 'gapAfter': g(3, 4, 6),
                'note': '3 dk: kısa biçim (boş pay ve açılıştaki yoğunluk)'}),
    clip('c1.donus', 'Kaydığını fark ettiğinde ışığı nazikçe nefese getiriyorsun.', 'required', g(4, 5, 6), DZ,
         tags={'texture': 'dagil-don', 'action': 'dikkati nefese geri getirmek'}),
    clip('c1.aralik1', 'Birkaç soluk boyunca ışığı orada tutuyorsun.', 'required', g(14, 16, 18), DZ,
         tags={'texture': 'dagil-don', 'breathRoom': True, 'focusInterval': 1, 'repeatOk': ['ışı'],
               'note': 'ilk sessiz odak aralığı (3 dk: <= 18 sn; PLAN.v3 §A.1)'},
         short={'belowSec': SHORT_BELOW, 'text': 'Birkaç soluk boyunca ışığı orada tutuyorsun.',
                'gapAfter': g(14, 16, 18), 'note': '3 dk: aynı metin, aralık 14–18 sn'}),
    clip('c1.nerede', 'Işık hâlâ nefeste mi, yoksa başka bir yere mi kaydı?', 'optional', g(4, 5, 6), DZ,
         tags={'texture': 'dagil-don', 'question': True}, fillRank=101, fillGroup='c1.nerede'),
    clip('c1.getir', 'Kaydıysa, bir sonraki alışta onu yeniden noktaya getiriyorsun.', 'optional', g(9, 11, 14), DZ,
         tags={'texture': 'dagil-don', 'repeatOk': ['kaydı']}, fillRank=101, fillGroup='c1.nerede'),
    clip('c1.aralik2', 'Işık yine noktada; birkaç nefes daha orada kalıyor.', 'optional', g(14, 16, 18), DZ,
         tags={'texture': 'dagil-don', 'breathRoom': True, 'focusInterval': 2, 'repeatOk': ['nokta']}, fillRank=140),
    clip('c1.dusunce', 'Bir düşünce gelirse onu itmen gerekmiyor; ışığı usulca geri çeviriyorsun.', 'optional',
         g(8, 10, 13), DZ, tags={'texture': 'dagil-don'}, fillRank=170),
    clip('c1.kac', 'Dikkatinin kaç kez dağıldığı hiç önemli değil; her dönüş değerli.', 'optional', g(6, 8, 10), DZ,
         tags={'texture': 'dagil-don', 'normalize': True, 'safety': 'normalize'}, fillRank=150),
    clip('c1.aralik3', 'Şu an ışığın gideceği başka bir yer yok.', 'optional', g(14, 16, 18), DZ,
         tags={'texture': 'dagil-don', 'breathRoom': True, 'focusInterval': 3}, fillRank=285),
    clip('c1.anahtar1', 'Fark ettiğin an, zaten geri döndün.', 'required', g(10, 14, 18), DZ,
         tags={'key': 1, 'texture': 'anahtar', 'coreEnd': True, 'repeatOk': ['dön'],
               'note': 'PLAN.v2 §A.2.1 anahtar cümle (1. söyleyiş); yalnız Ders 5'},
         short={'belowSec': SHORT_BELOW, 'text': 'Fark ettiğin an, zaten geri döndün.', 'gapAfter': g(12, 15, 18),
                'note': '3 dk: aynı metin; ardından ikinci kısa aralık (<= 18 sn), sonra Kapanış'}),
]

# ================================================================================================= C2 · NEFES SAYMA
C2 = [
    clip('c2.giris', 'Sıradaki bölümde nefeslerini içinden sayıyorsun.', 'required', g(3, 4, 5), DZ,
         cue={'music': 'doku: aynı ton, çok hafif ikinci kısmi ses (>= 8 sn çapraz geçiş)',
              'visual': 'ışık noktası her sayıyla değil, yalnız doku değişiminde kayar'},
         tags={'texture': 'sayma', 'explain': True}),
    clip('c2.nasil', 'Alışta bir, verişte iki, sonra üç, dört diye ona kadar gidiyorsun.', 'required',
         g(3, 4, 5), DZ, tags={'texture': 'sayma', 'action': 'alış ve verişi ayrı saymak',
                                'repeatOk': ['sayı']}),
    clip('c2.bas', 'On olunca yeniden birden başlıyorsun; sayıyı kaybedersen de öyle.', 'required', g(3, 4, 5),
         DZ, tags={'texture': 'sayma', 'normalize': True, 'safety': 'normalize'}),
    clip('c2.say1', 'Sayıyı bir süre sen sürdürüyorsun.', 'required', g(16, 18, 20), DZ,
         tags={'texture': 'sayma', 'breathRoom': True, 'repeatOk': ['sayı'],
               'note': '"bir süre": sessizliğin geleceği söylenir (güvenlik §11.B-16)'}),
    clip('c2.hangi', 'Hangi sayıda olursan ol, oradan devam ediyorsun.', 'optional', g(14, 16, 18), DZ,
         tags={'texture': 'sayma', 'breathRoom': True}, fillRank=305),
    clip('c2.onbir', 'On bire, on ikiye vardıysan bu da olur; sayı yine birden başlıyor.', 'optional',
         g(12, 14, 17), DZ, tags={'texture': 'sayma', 'normalize': True}, fillRank=310),
    clip('c2.dusunce', 'Sayıların arasına bir düşünce girerse, bunu fark etmen yeter.', 'optional',
         g(14, 16, 18), DZ, tags={'texture': 'sayma', 'normalize': True}, fillRank=320),
    clip('c2.yonetme', 'Sayı nefesi yönetmiyor; nefes geliyor, sayı onu izliyor.', 'optional',
         g(12, 14, 17), DZ, tags={'texture': 'sayma', 'safety': 'observe-first', 'repeatOk': ['sayı']},
         fillRank=340),
    clip('c2.veris', 'Bu kez yalnız verişleri sayıyorsun; her verişe bir sayı düşüyor.', 'optional',
         g(4, 5, 6), DZ, tags={'texture': 'veris-sayma', 'action': 'yalnız verişte saymak', 'repeatOk': ['veriş']},
         fillRank=330, fillGroup='c2.veris'),
    clip('c2.veris2', 'Alış sessiz geçiyor, sayı verişle geliyor.', 'optional', g(16, 18, 20), DZ,
         tags={'texture': 'veris-sayma', 'breathRoom': True, 'repeatOk': ['sayı']}, fillRank=330, fillGroup='c2.veris'),
    clip('c2.seyrek', 'Sayılar seyrekleşiyor; aralarında nefes var, bir de ışığın noktası.', 'optional', g(14, 16, 18), DZ,
         tags={'texture': 'veris-sayma', 'arc': 2}, fillRank=380),
    clip('c2.anahtar2', 'Fark ettin; döndün.', 'required', g(8, 10, 12), DZ,
         tags={'key': 2, 'texture': 'anahtar', 'coreEnd': True, 'repeatOk': ['dön', 'fark'],
               'note': 'anahtar cümle 2. söyleyiş (PLAN.v2 §A.2.1)'}),
]

# ================================================================================================= C3 · SESSİZ ODAK ARALIKLARI
DN = 'Derin'
BELL = 'returnTone:-2s (çan; tek vuruş, yumuşak saldırı)'
C3 = [
    clip('c3.ad', 'Bundan sonra yalnızca nokta ve nefes var.', 'required', g(4, 5, 6), DN,
         cue={'visual': 'phase:derin (ışık noktası en küçük ve en parlak)',
              'music': 'doku: ton tek kısmi sese iner, Derin yatağı'},
         tags={'texture': 'sessiz-odak', 'explain': True,
               'note': 'sayıyı bırakır; 30 dk\'da C4\'ten sonra da doğru kalsın diye C2\'ye bağlı değil'}),
    clip('c3.parlak', 'Işık artık küçük ve parlak bir nokta.', 'optional', g(5, 6, 8), DN,
         tags={'texture': 'sessiz-odak', 'arc': 2, 'image': 'arc', 'repeatOk': ['nokta']}, fillRank=402),
    clip('c3.can', 'Her sessizliğin sonunda bir çan çalacak. Çanı duyunca ışık noktaya dönüyor.', 'required',
         g(3, 4, 5), DN, tags={'texture': 'sessiz-odak', 'bell': 'explain', 'repeatOk': ['çan', 'nokta'],
                                'note': 'çan = ses çapası ve dönüş tınısı (PLAN.v2 Ders 5 kartı)'}),
    clip('c3.kisa', 'Önce kısa bir sessizlik geliyor.', 'required', g(14, 15, 17), DN,
         cue={'music': 'window:withdraw (ton çekilir; gerçek sessizliğe yakın)'},
         tags={'texture': 'sessiz-odak', 'focusInterval': 15, 'announceShort': True, 'repeatOk': ['sessi'],
               'note': 'aralık ≈ 15 sn (<= 20: duyurulu pencere gerekmez; yine de söylenir, güvenlik §11.B-16)'}),
    clip('c3.d15', 'Işığın hâlâ noktada mı?', 'required', g(5, 6, 8), DN, cue={'music': BELL},
         tags={'texture': 'sessiz-odak', 'bellBefore': True, 'question': True}),
    clip('c3.kaydiysa', 'Değilse, bir sonraki nefeste geri getiriyorsun.', 'optional', g(5, 6, 8), DN,
         tags={'texture': 'sessiz-odak'}, fillRank=403),
    clip('c3.kisa2', 'Kısa bir sessizlik daha geliyor.', 'optional', g(15, 17, 19), DN,
         cue={'music': 'window:withdraw (ton çekilir; gerçek sessizliğe yakın)'},
         tags={'texture': 'sessiz-odak', 'focusInterval': 18, 'announceShort': True, 'repeatOk': ['sessiz']},
         fillRank=404, fillGroup='c3.kisa2'),
    clip('c3.d18', 'Işık yine nefeste.', 'optional', g(5, 6, 8), DN, cue={'music': BELL},
         tags={'texture': 'sessiz-odak', 'bellBefore': True}, fillRank=404, fillGroup='c3.kisa2',
         requires=['c3.kisa2']),
    clip('c3.w30', 'Şimdi biraz daha uzun bir sessizlik geliyor. Zorlanırsan gözlerini açman yeterli. '
                   'Çanla yine seslenirim.', 'required', g(25, 30, 36), DN,
         cue={'visual': 'window', 'music': 'window:withdraw (yatak ≈ −6 dB, >= 6 sn rampa; ton neredeyse susar)'},
         tags={'texture': 'sessiz-odak', 'announce': True, 'safety': 'door', 'eyesOpen': True,
               'focusInterval': 30, 'repeatOk': ['sessiz']},
         window=g(25, 30, 36)),
    clip('c3.d30', 'Buradayım. Işık kaydıysa, onu usulca noktaya çağırıyorsun.', 'required',
         g(5, 6, 8), DN, cue={'music': BELL}, tags={'texture': 'sessiz-odak', 'welcome': True, 'bellBefore': True}),
    clip('c3.w45', 'Bu kez sessizlik biraz daha uzun. Zorlanırsan ellerini hissetmen de olur. '
                   'Çanla yine seslenirim.', 'optional', g(40, 45, 52), DN,
         cue={'visual': 'window', 'music': 'window:withdraw (yatak ≈ −6 dB, >= 6 sn rampa; ton neredeyse susar)'},
         tags={'texture': 'sessiz-odak', 'announce': True, 'safety': 'door', 'anchor': 'eller',
               'focusInterval': 45, 'repeatOk': ['sessiz']},
         window=g(40, 45, 52), fillRank=410, fillGroup='c3.w45'),
    clip('c3.d45', 'Buradayım. Işığın nerede olduğunu fark etmen yeter.', 'optional', g(5, 6, 8), DN,
         cue={'music': BELL}, tags={'texture': 'sessiz-odak', 'welcome': True, 'bellBefore': True,
                                    'normalize': True},
         fillRank=410, fillGroup='c3.w45', requires=['c3.w45']),
    clip('c3.anahtar3', 'Yine döndün.', 'required', g(6, 8, 10), DN,
         tags={'key': 3, 'texture': 'anahtar', 'coreEnd': True,
               'note': 'PLAN.v2 §A.2.1 3. biçim "Döndün…": üç nokta atıldı (PLAN.v2 §C.2), "Yine" eklendi '
                       '(tek sözcüklük yüklem kopuk duyuluyordu); kısalma korunur (11 → 5 → 4 hece)'}),
]

# ================================================================================================= K · KAPANIŞ (oturarak)
KP = 'Kapanış'
K = [
    clip('k.donus', 'Artık dönüş zamanı.', 'required', g(3.5, 3.5, 5), KP,
         cue={'music': 'phase:kapanis (sürekli ton genişler); returnTone:-2s (çan)', 'visual': 'dawn',
              'voiceGain': 'rampa o anki evre düzeyinden 0 dB’e, önceki sessizlik boyunca (>= 4 sn; basamak yok)'},
         tags={'texture': 'kapanis', 'repeatOk': ['dön']}),
    clip('k.nefes', 'Işığı yeniden genişletiyorsun; nefes kendi hâlinde akıyor.', 'required', g(4, 4, 6), KP,
         tags={'step': 'nefes', 'texture': 'kapanis', 'arc': 3,
               'note': 'imge yayının dönüşü (ışık genişler); 3 dk kuralı: "-(y)abil-"siz (PLAN.v3 §A.2 kural 6)'},
         short={'belowSec': SHORT_BELOW, 'text': 'Işığı yeniden genişletiyorsun; nefes kendi hâlinde akıyor.', 'gapAfter': g(4, 4, 4.5),
                'note': '3 dk: aynı metin; sessizlik esnemez (Kapanış 0:48)'}),
    clip('k.sesler', 'Odadaki sesler de ışığın içine giriyor.', 'optional', g(5, 5, 7), KP,
         tags={'step': 'sesler', 'texture': 'kapanis', 'arc': 3}, fillRank=102),
    clip('k.hareket', 'Parmaklarını oynatıp zorlamadan gerinebilirsin; ağrı ya da baş dönmesi olursa bırak.',
         'required', g(7, 7, 10), KP,
         tags={'step': 'parmak+gerin', 'texture': 'kapanis', 'mood': 'safety', 'safety': 'movement',
               'action': 'parmakları oynatmak ve gerinmek',
               'note': '3 dk Kapanış\'ın tek "-(y)abil-"i (PLAN.v3 §A.2 kural 6); her derste aynı güvenlik cümlesi'},
         short={'belowSec': SHORT_BELOW, 'text': 'Parmaklarını oynatıp zorlamadan gerinebilirsin; ağrı ya da baş dönmesi olursa bırak.', 'gapAfter': g(7, 7, 7.5),
                'note': '3 dk: aynı metin; sessizlik esnemez (Kapanış 0:48)'}),
    clip('k.avuc1', 'Gözlerin kapalıysa, avuçlarını birbirine sürtüp ısıtabilirsin.', 'optional',
         g(6, 6, 8), KP, tags={'step': 'avuc', 'texture': 'avuclama', 'action': 'avuçları ısıtmak',
                                'note': 'isteğe bağlı avuçlama (PLAN.v2 Ders 5 kartı); dinlenme ritüeli, iddiasız'},
         fillRank=AVUC, fillGroup='k.avuc'),
    # Düzeltme turu (INCELEME.md UH9): güvenlik kuralı eylemden önce söylenir (PLAN.v2 §A.1: gözlere dokunulmaz).
    clip('k.avuc2', 'Avuçların gözlerine değmeyecek; kenarları alnına ve elmacık kemiklerine yaslanacak.', 'optional',
         g(4, 4, 6), KP, tags={'step': 'avuc', 'texture': 'avuclama', 'mood': 'safety', 'eyes': 'dokunma yok',
                                'repeatOk': ['avuç', 'göz'],
                                'note': 'PLAN.v2 Ders 5 kartı: avuçlar bastırmadan, gözlere değmeden; eylemden önce'},
         fillRank=AVUC, fillGroup='k.avuc'),
    clip('k.avuc3', 'Şimdi onları bastırmadan gözlerinin üstüne getiriyorsun.', 'optional',
         g(6, 6, 8), KP, tags={'step': 'avuc', 'texture': 'avuclama', 'action': 'avuçları gözlerin üstüne getirmek',
                                'repeatOk': ['göz']},
         fillRank=AVUC, fillGroup='k.avuc'),
    clip('k.avuc4', 'Bu sıcaklığı birkaç nefes boyunca hissediyorsun.', 'optional', g(12, 12, 14), KP,
         tags={'step': 'avuc', 'texture': 'avuclama', 'sense': 'sıcaklık', 'repeatOk': ['avuç']},
         fillRank=AVUC, fillGroup='k.avuc'),
    clip('k.avuc5', 'Ellerini dizlerine indiriyorsun.', 'optional', g(3, 3, 5), KP,
         tags={'step': 'avuc', 'texture': 'avuclama'}, fillRank=AVUC, fillGroup='k.avuc'),
    clip('k.goz', 'Gözlerin kapalıysa, onları acele etmeden açıp çevrene bakıyorsun.', 'required', g(7, 7, 10), KP,
         cue={'music': 'chord (ton genişler, tek sıcak akor)'},
         short={'belowSec': SHORT_BELOW, 'text': 'Gözlerin kapalıysa, açıp çevrene bakıyorsun.',
                'gapAfter': g(7, 7, 8), 'note': '3 dk: Kapanış 0:48 içinde kalmak için kısa biçim'},
         tags={'step': 'goz+oda', 'texture': 'kapanis', 'eyes': 'acele yok',
               'action': 'gözleri açıp çevreye bakmak',
               'note': '3 dk kuralı: "-(y)abil-"siz (PLAN.v3 §A.2 kural 6); "ışığa" denmez (imge ışığıyla karışmasın)'}),
    clip('k.oda', 'Bakışın odada bir renkte ya da bir nesnede bir an duruyor.', 'optional', g(6, 6, 8), KP,
         tags={'step': 'oda', 'texture': 'kapanis', 'transfer': True}, fillRank=108),
    clip('k.gun', 'Gün içinde dikkatinin dağıldığını fark ettiğinde, tek bir nefese dönmek yeter.', 'optional',
         g(4, 4, 6), KP, tags={'texture': 'kapanis', 'transfer': True}, fillRank=365),
    clip('k.son', 'El feneri yine senin elinde.', 'required', g(6, 6, 8), KP,
         cue={'music': 'fade:5s', 'visual': 'end'},
         tags={'step': 'son', 'texture': 'kapanis', 'arc': 3,
               'note': 'açılış imgesiyle çerçeve ("Dikkatin bir el feneri gibi")'}),
]

# ================================================================================================= ekler (utility)
QUICK = [dict(c) for c in K if c['tier'] == 'required']
STOP = [
    clip('d.goz', 'Gözlerini aç, etrafına bak, acele etme.', 'required', g(3, 3, 4), KP,
         tags={'mood': 'safety', 'step': 'goz', 'screen': 'Durdurma ekranı metniyle aynı',
               'note': 'her derste aynı metin (PLAN.v3 §C.3; pilot ders2 D.durdur; Ders 1 ile aynı)'}),
    clip('d.kalk', 'Uzanıyorsan önce yana dön, sonra otur.', 'required', g(13, 13, 14), KP,
         tags={'mood': 'safety', 'step': 'yan', 'screen': 'Durdurma ekranı metniyle aynı'}),
    clip('d.bekle', 'Birkaç nefes böyle kal; başın dönerse biraz daha bekle.', 'required', g(1, 1, 2), KP,
         tags={'mood': 'safety', 'step': 'bekle'}),
]
INTRO = [clip('i.ilk', 'Bugün yalnızca tanışıyoruz; zorlanırsan ekrandaki "Kapanışa geç" düğmesine dokunman yeterli.', 'required', g(2, 2, 2),
              'Varış', tags={'firstEver': True, 'note': 'PLAN.v3 §D.3: ayrı giriş dosyası; her derste aynı metin '
                                                          '(Ders 1 ile aynı); "-(y)abil-" yok'})]


def block(bid, kind, prio, order, title, clips, **kw):
    b = {'id': bid, 'kind': kind, 'priority': prio, 'playOrder': order}
    b.update(kw)
    b['title'] = title
    b['clips'] = [finish(c) for c in clips]
    b['silenceWindows'] = []
    for c in b['clips']:
        if c.get('window'):
            i = [x['id'] for x in b['clips']].index(c['id'])
            wel = b['clips'][i + 1]['id']
            b['silenceWindows'].append(dict(afterClip=c['id'], announce=c['id'], welcome=wel, **c['window']))
    return b


BLOCKS = [
    block('A', 'arrival', 0, 0, 'Varış (tek kapak; isteğe bağlılar süreyle eklenir)', A),
    block('C1', 'core', 1, 1, 'Nefes çapası: dağıl, fark et, dön', C1),
    block('C2', 'core', 2, 2, 'Nefes sayma, bir → on (içinden); sonra yalnız verişte', C2, entryRank=295),
    block('C3', 'core', 3, 4, 'Uzayan sessiz odak aralıkları (15 → 30 → 45 sn; çanla dönüş)', C3, entryRank=400),
    block('K', 'closing', 0, 99, 'Kapanış: dışa dönüş (gündüz, oturarak; isteğe bağlı avuçlama)', K),
]

for c in QUICK + STOP + INTRO:
    finish(c)


def main():
    lesson = dict(M.HEAD)
    lesson['carriers'] = []
    lesson['blocks'] = BLOCKS
    lesson['extras'] = {
        'quickClosing': dict(M.QUICK_CLOSING, clips=QUICK),
        'stopReturn': dict(M.STOP_RETURN, clips=STOP),
        'firstEverIntro': dict(M.FIRST_EVER, clips=INTRO),
    }
    lesson['extras']['firstLesson'] = {'id': 'g.ilk', 'kind': 'reference', 'clips': [], 'ref': 'firstEverIntro', 'clip': INTRO[0]['id'], 'text': INTRO[0]['text'],
                                       'note': 'SPEC.v3 §1.1 alanı; içerik extras.firstEverIntro\'dadır (Ders 1 ile '
                                               'aynı ad)'}
    lesson['skeleton30'] = M.SKELETON30
    corner = lesson['timingModel']['corners']['hoc']
    rate, pn = corner['rate'], corner['profile']
    prof = T.profile(pn, rate)
    plans = {m: T.plan(lesson, m * 60, rate, pn) for m in (3, 5, 15)}
    for b in lesson['blocks']:
        def dur(c, lv):
            return T.clip_dur(c, rate, prof) + sum(x[lv] for x in T.sent_gaps(c)) + T.gap_of(c, rate, prof)[lv]
        req = [c for c in b['clips'] if c['tier'] == 'required']
        b['minSec'] = round(sum(dur(c, 'min') for c in req), 1)
        b['maxSec'] = round(sum(dur(c, 'max') for c in b['clips']), 1)
        b['prefSec'] = {str(m): round(T.block_durations(p).get(b['id'], 0.0), 1) for m, p in plans.items()}
        b['estimateBasis'] = ('Nefona Hoca köşesi: 4,68 hece/sn + yüksek duraklama profili, cümle arası sessizlikler '
                              'dahil (VARSAYIM); minSec = zorunlu klipler (5 dk ve üstü biçim) en kısa sessizlikle; '
                              'prefSec = planlayıcının 3/5/15 dk planındaki blok süresi (Giriş hariç); üretimden '
                              'sonra voice.hoc.sec ile yeniden hesaplanır')
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(lesson, f, ensure_ascii=False, indent=1)
        f.write('\n')
    n = sum(len(b['clips']) for b in BLOCKS)
    print('yazıldı', OUT, 'klip', n)


if __name__ == '__main__':
    main()
