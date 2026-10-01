#!/usr/bin/env python3
"""Nefona Yoga · Ders 1 "Nefesin Ritmi" · tek kaynak (B adımı, Parti 1, sesten bağımsız kısım).

Bu dosya ders1.lesson.json'u üretir. Metnin tek kaynağı burasıdır; ders1.script.md ve timing.txt `timing_d1.py` ile
bu JSON'dan çıkar. Hece, sözcük ve cümle sayıları pilot planlayıcının (`timing.py`, pilot kopyası, değiştirilmedi)
sayaçlarıyla hesaplanır. Ses üretilmedi; bütün `sec` alanları null.

Şema: pilot `ders2.lesson.json` ile aynı (PLAN.v2 §B.2 + pilot ekleri). Tek fark: v3 tek ses kararı (sahip, 2026-09-30,
madde 8: ses3 = Nefona Hoca) yüzünden `voice` anahtarı `female`/`male` yerine `hoc`tur.
"""
import json
import os
import sys

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import timing as T  # noqa: E402  (pilot timing.py'nin birebir kopyası)

LESSON = 'ders1'
OUT = os.path.join(HERE, 'ders1.lesson.json')
VOICE_KEY = 'hoc'
VOICE_ID = 'Sr5w7dIZaRDglJ2cLaJm'

SG = {'Varış': {'min': 0.6, 'pref': 0.8, 'max': 1.0}, 'Derinleşme': {'min': 0.8, 'pref': 1.0, 'max': 1.3},
      'Derin': {'min': 1.2, 'pref': 1.8, 'max': 2.5}, 'Kapanış': {'min': 0.8, 'pref': 1.0, 'max': 1.2}}

C1_PERIOD = 10.0   # 4 al / 6 ver (bordun döngüsü 10,000 sn = 441.000 örnek)
C2_PERIOD = 10.0   # 2,5 al + 1,5 ek alış + 6 ver (VARSAYIM; Balban 2023'te süre verilmiyor)
C3_PERIOD = 13.0   # 4 al + 9 vızıltılı veriş (Trivedi 2023: 12–14 sn)

EXHALE_CUE_AFTER_VER = 1.2     # "ver…" ile ardından gelen kısa cümle arasındaki başlangıç farkı
EXHALE_SENT_PERIOD = C1_PERIOD - 4.0 - EXHALE_CUE_AFTER_VER   # 4,8 sn: cümle + sessizlik, sonraki "Al…"a kadar


def g(a, b, c):
    return {'min': float(a), 'pref': float(b), 'max': float(c)}


def per(p):
    return {'min': float(p), 'pref': float(p), 'max': float(p)}


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


STRETCH_HEADROOM = 4.0   # kilitsiz klipte max >= pref + 3 sn (en çok 20): büyük blokların girişi esnemeyle karşılanır


def finish(c):
    """Sayaçlar, ses dosyaları, alt klipler (MT3-02) ve TTS birimi; pilot sözleşmesindeki sırayla."""
    if not c.get('onsetPeriod'):
        ga = c['gapAfter']
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


# ------------------------------------------------------------------------------------------------ nefes döngüleri
CARRIERS = []


def micro(cid, text, phase, period, car_id, idx, tier, floor, micro_kind, cue=None, tags=None, **kw):
    t = {'micro': micro_kind, 'breathLock': True, 'texture': 'nefes-ipucu'}
    t.update(tags or {})
    return clip(cid, text, tier, per(period), phase, cue=cue, tags=t, onsetPeriod=per(period), gapFloor=floor,
                carrier={'id': car_id, 'index': idx}, **kw)


def carrier(car_id, tts, items, note=''):
    CARRIERS.append({'id': car_id, 'text': tts, 'lead': '', 'items': items,
                     'cut': 'üç nokta duraklarından; öğe sayısı tutmazsa insan kararı', 'note': note})


# ================================================================================================= A · VARIŞ
A = [
    clip('a.durus', 'Bir sandalyede ya da yerde, sırtını germeden dik tutarak oturman yeterli.', 'required',
         g(2.5, 4, 6), 'Varış', cue={'visual': 'phase:varis', 'music': 'phase:varis (pad, ElevenLabs Music)'},
         tags={'texture': 'varis', 'action': 'dik ve rahat oturmak'},
         short={'belowSec': 240,
                'text': 'Sırtını germeden dik oturman yeterli; gözlerini kapatmak ya da açık tutmak sana kalmış.',
                'gapAfter': g(2.5, 3, 4), 'note': '3 dk: duruş ve gözler tek klipte (PLAN.v3 §A.2, sure.md §3.1)'}),
    clip('a.eller', 'Ellerin dizlerinde ya da kucağında dinleniyor.', 'optional', g(3, 4, 6), 'Varış',
         tags={'texture': 'varis', 'action': 'elleri bırakmak'}, fillRank=260),
    clip('a.gozler', 'Gözlerini kapatmak ya da açık tutmak sana kalmış; gözlerin açıksa bakışın yere insin.',
         'required', g(4, 4, 6), 'Varış',
         tags={'texture': 'varis', 'eyesOpen': True, 'eyes': 'baskı yok; açıksa bakış yere iner',
               'action': 'gözleri kapatmak ya da bakışı indirmek'}, minTarget=240),
    clip('a.izin', 'İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin.', 'required',
         g(3, 4, 6), 'Varış', tags={'texture': 'varis', 'safety': 'opening', 'eyesOpen': True, 'repeatOk': ['gözle']}),
    clip('a.acilis', 'Bütün gün seninle olan nefesine şimdi kulak veriyorsun.', 'required', g(5, 6, 7), 'Varış',
         tags={'texture': 'varis', 'uniqueOpening': True,
               'note': 'PLAN.v2 §A.2.1 yönü ("…şimdi yalnızca dinleyebilirsin") "-(y)abil-"siz yazıldı: a.izin '
                       'hemen önünde üç "-(y)abil-" taşır (PLAN.v3 §A.2 kural 6); her sürümde aynı metin'}),
    clip('a.omuz', 'Omuzların gevşek dursun, çenen rahat kalsın.', 'optional', g(4, 5, 7), 'Varış',
         tags={'texture': 'varis', 'action': 'omuzları ve çeneyi bırakmak'}, fillRank=250),
    clip('a.kolay', 'Nefesine dikkat etmek ilk başta tuhaf gelirse bu da olur.', 'optional', g(4, 5, 7), 'Varış',
         tags={'texture': 'varis', 'normalize': True, 'safety': 'normalize'}, fillRank=270),
    clip('a.karar', 'Verişini ne kadar uzatacağına her an sen karar veriyorsun.', 'optional', g(4, 5, 7), 'Varış',
         tags={'texture': 'varis', 'safety': 'control'}, fillRank=355),
]

# ================================================================================================= C1 · DOĞAL NEFES → UZUN VERİŞ
DZ = 'Derinleşme'
C1 = [
    clip('c1.izle', 'Birkaç nefes boyunca hiçbir şeyi değiştirmeden izlemen yeterli.', 'required', g(13, 16, 19), DZ,
         cue={'visual': 'phase:derinlesme', 'music': 'bordun:varis-pad→bordun, >= 8 sn çapraz geçiş'},
         short={'belowSec': 240, 'text': 'Birkaç nefes boyunca hiçbir şeyi değiştirmeden izlemen yeterli.',
                'gapAfter': g(12, 13, 16), 'note': '3 dk: aynı metin, nefes payı 12–16 sn'},
         tags={'texture': 'dogal-nefes', 'breathRoom': True, 'safety': 'observe-first', 'repeatOk': ['nefes'],
               'note': 'nefes payı (PLAN.v3 §A.2 kural 3); önce doğal nefes (güvenlik §11.B-6)'}),
    clip('c1.ses', 'Burnundan giren ve çıkan havanın hafif bir sesi var.', 'optional', g(5, 8, 10), DZ,
         tags={'texture': 'dogal-nefes', 'arc': 1, 'sense': 'işitme'}, fillRank=120),
    clip('c1.uzunluk', 'Alış mı daha uzun, veriş mi? Fark etmen yeter; bir şey yapman gerekmiyor.', 'optional',
         g(7, 10, 12), DZ, tags={'texture': 'dogal-nefes'}, fillRank=140),
    clip('c1.guven', 'Başın dönerse ya da ellerin karıncalanırsa normal nefesine dön.', 'required', g(2.5, 3, 4), DZ,
         tags={'texture': 'dogal-nefes', 'mood': 'safety', 'safety': 'breath',
               'note': 'PLAN.v2 Ders 1 kartı; "karıncalanırsa"nın öznesi eklendi (ellerin); düzeltme turu: koşul eki iki yüklemde '
                       '("dönerse"), kulakta yargı gibi açılmasın (INCELEME.md TE5)'}),
    clip('c1.burun', 'Burnun açıksa alış da veriş de burnundan olsun.', 'optional', g(2.5, 3, 4), DZ,
         tags={'texture': 'dogal-nefes', 'action': 'burundan nefes', 'repeatOk': ['alış', 'veriş']}, fillRank=170),
    clip('c1.ritim', 'Sıradaki nefeslerde alış dört sayı, veriş altı sayı sürecek. Arada nefesi tutmak yok.',
         'required', g(2.5, 4, 5), DZ, tags={'texture': 'dogal-nefes', 'safety': 'no-hold', 'repeatOk': ['nefes', 'altı'],
                                          'explain': True},
         short={'belowSec': 240, 'text': 'Alış dört, veriş altı sayı sürecek; nefesi tutmak yok.',
                'gapAfter': g(2.5, 3, 5), 'note': '3 dk: aynı yönerge tek cümlede'}),
]


def count_cycle(prefix, car_id, tier, rank=None, group=None):
    words = ['Al…', 'iki…', 'üç…', 'dört…', 'ver…', 'iki…', 'üç…', 'dört…', 'beş…', 'altı…']
    out = []
    ids = []
    for i, w in enumerate(words):
        cid = '%s.%02d' % (prefix, i + 1)
        ids.append(cid)
        cue = {}
        if i == 0:
            cue = {'breath': {'in': 4, 'out': 6, 'count': 1}, 'visual': 'ring:in 4s', 'music': 'bordun:sync'}
        elif i == 4:
            cue = {'visual': 'ring:out 6s'}
        out.append(micro(cid, w, DZ, 1.0, car_id, i, tier, 0.3, 'count', cue=cue,
                         tags={'cycle': prefix, 'role': 'al' if i == 0 else ('ver' if i == 4 else 'say')},
                         fillRank=rank, fillGroup=group))
    carrier(car_id, 'Al… iki… üç… dört… ver… iki… üç… dört… beş… altı…', ids,
            'sayılı döngü; öğeler başlangıçtan başlangıca 1,0 sn (gapFloor 0,3)')
    return out


def c1_cycle(n, tier, sent=None, sent_period=None, rank=None, ver_text='ver…', sent_tags=None, al_only=False):
    """Bir 4/6 döngüsü: "Al…" (4 sn) → "ver…" (6 sn; kısa cümle varsa 1,2 sn) → [cümle, sonraki "Al…"a kadar].
    al_only: azalan anlatım; yalnız "Al…" söylenir (periyot 10 sn), veriş halkada ve bordunda sürer."""
    grp = 'c1.d%d' % n if tier != 'required' else None
    items = []
    al = micro('c1.d%d.al' % n, 'Al…', DZ, C1_PERIOD if al_only else 4.0, None, None, tier, 0.8, 'breath',
               cue={'breath': {'in': 4, 'out': 6, 'count': 1}, 'visual': 'ring:in 4s' + (', out 6s' if al_only else '')},
               tags={'cycle': 'c1.d%d' % n, 'role': 'al', 'fade': al_only}, fillRank=rank, fillGroup=grp)
    if al_only:
        return [al]
    vp = EXHALE_CUE_AFTER_VER if sent else 6.0
    ver = micro('c1.d%d.ver' % n, ver_text, DZ, vp, None, None, tier, 0.6, 'breath', cue={'visual': 'ring:out 6s'},
                tags={'cycle': 'c1.d%d' % n, 'role': 'ver'}, fillRank=rank, fillGroup=grp)
    items += [al, ver]
    if sent:
        sp = sent_period or EXHALE_SENT_PERIOD
        t = {'texture': 'nefes-ipucu', 'breathLock': True, 'cycle': 'c1.d%d' % n, 'role': 'veriş-cümlesi'}
        t.update(sent_tags or {})
        s = clip('c1.d%d.s' % n, sent, tier, per(sp), DZ, tags=t, onsetPeriod=per(sp), gapFloor=0.6,
                 fillRank=rank, fillGroup=grp)
        if sp > EXHALE_SENT_PERIOD:
            s['cue'] = {'breath': {'in': 4, 'out': 6, 'count': int(round((sp - EXHALE_SENT_PERIOD) / C1_PERIOD)),
                                   'silent': True}, 'visual': 'ring: sessiz döngü, halka sürer'}
        items.append(s)
    return items


C1 += count_cycle('c1.s1', 'car.say1', 'required')
C1 += count_cycle('c1.s2', 'car.say2', 'optional', rank=110, group='c1.s2')
C1 += c1_cycle(1, 'optional', rank=101)
C1 += c1_cycle(2, 'required', 'Altı uzun gelirse beş de olur.',
               sent_tags={'normalize': True, 'safety': 'no-force'})
C1 += c1_cycle(3, 'required', 'Sayıyı kaçırırsan yeniden başlamak yeter.',
               sent_tags={'normalize': True, 'safety': 'normalize'})
C1 += c1_cycle(4, 'optional', 'Omuzların aşağı insin.', rank=150, sent_tags={'action': 'omuzlar verişle iner'})
C1 += c1_cycle(5, 'optional', rank=160)
C1 += c1_cycle(6, 'required', 'Sıradaki nefes sende; ben susuyorum.', sent_period=EXHALE_SENT_PERIOD + C1_PERIOD,
               sent_tags={'silentCycle': True})
C1 += c1_cycle(7, 'optional', rank=190)
C1 += c1_cycle(8, 'optional', 'Yüzün ve çenen de gevşek kalsın.', rank=200, sent_tags={'action': 'yüz ve çene'})
C1 += c1_cycle(9, 'optional', 'Verişin sesi alışınkinden uzun.', rank=210,
               sent_tags={'arc': 1, 'sense': 'işitme'})
C1 += c1_cycle(10, 'optional', 'Bu nefes de sende.', sent_period=EXHALE_SENT_PERIOD + C1_PERIOD, rank=375,
               sent_tags={'silentCycle': True})
C1 += c1_cycle(11, 'optional', rank=380, al_only=True)
C1 += c1_cycle(12, 'optional', rank=285, al_only=True)
C1 += c1_cycle(13, 'optional', rank=290, al_only=True)
C1 += c1_cycle(14, 'optional', rank=385, al_only=True)
C1 += c1_cycle(15, 'extension', rank=450, al_only=True)
C1 += c1_cycle(16, 'extension', rank=455, al_only=True)
C1.append(clip('c1.anahtar1', 'Alış kendiliğinden gelir; verişi sen uzatırsın.', 'required', g(4, 6, 8), DZ,
               tags={'key': 1, 'texture': 'anahtar', 'coreEnd': True, 'repeatOk': ['veriş']}))

# C1 taşıyıcıları (sayılı döngüler count_cycle içinde)
_c1_ids = [c['id'] for c in C1 if c.get('tags', {}).get('micro') == 'breath']


def chunk_carriers(ids, prefix, tts_of, limit=9):
    """Taşıyıcılar döngü sınırlarından bölünür (bir döngünün ipuçları hep aynı taşıyıcıda; en çok `limit` öğe)."""
    cycles = []
    for i in ids:
        cyc = i.rsplit('.', 1)[0]
        if cycles and cycles[-1][0] == cyc:
            cycles[-1][1].append(i)
        else:
            cycles.append((cyc, [i]))
    out, cur = [], []
    for _, its in cycles:
        if cur and len(cur) + len(its) > limit:
            out.append(cur)
            cur = []
        cur += its
    if cur:
        out.append(cur)
    for k, grp in enumerate(out):
        cid = '%s%s' % (prefix, 'abcdefgh'[k])
        carrier(cid, ' '.join(tts_of(x, j) for j, x in enumerate(grp)), grp,
                'nefes ipuçları; her öğe kendi döngüsünün sınırına oturur')
    return out


# ================================================================================================= C2 · İÇ ÇEKİŞ
C2 = [
    clip('c2.ad', 'Sırada iç çekiş var.', 'required', g(3, 4, 5), DZ,
         cue={'music': 'bordun:10,000 (aynı ton; kısa çapraz geçiş)'},
         tags={'texture': 'ic-cekis', 'explain': True}),
    clip('c2.nasil', 'Burnundan bir nefes alıyorsun, ardından üstüne küçük bir alış daha ekliyorsun. Sonra nefesi ağzından, '
                     'uzun ve yumuşak bir verişle bırakıyorsun.', 'required', g(5, 6, 7), DZ,
         tags={'texture': 'ic-cekis', 'action': 'iki alış + ağızdan uzun veriş'}),
    clip('c2.guven', 'Alışlar zorlamadan olsun; başın dönerse doğal nefesine dön.', 'required', g(3, 4, 5), DZ,
         tags={'texture': 'ic-cekis', 'mood': 'safety', 'safety': 'breath', 'repeatOk': ['nefes']}),
]


def c2_cycle(n, tier, ver_text='ver…', sent=None, rank=None, group=None, al_only=False):
    grp = group if tier != 'required' else None
    c = 'c2.d%d' % n
    if al_only:
        return [micro(c + '.al', 'Al…', DZ, C2_PERIOD, None, None, tier, 0.8, 'breath',
                      cue={'breath': {'in': 2.5, 'topUp': 1.5, 'out': 6, 'count': 1},
                           'visual': 'ring:in 2.5s, +1.5s, out 6s'},
                      tags={'cycle': c, 'role': 'al', 'fade': True}, fillRank=rank, fillGroup=grp)]
    out = [micro(c + '.al', 'Al…', DZ, 2.5, None, None, tier, 0.6, 'breath',
                 cue={'breath': {'in': 2.5, 'topUp': 1.5, 'out': 6, 'count': 1}, 'visual': 'ring:in 2.5s'},
                 tags={'cycle': c, 'role': 'al'}, fillRank=rank, fillGroup=grp),
           micro(c + '.ek', 'biraz daha…', DZ, 1.5, None, None, tier, 0.3, 'breath', cue={'visual': 'ring:in +1.5s'},
                 tags={'cycle': c, 'role': 'ek-alış'}, fillRank=rank, fillGroup=grp),
           micro(c + '.ver', ver_text, DZ, EXHALE_CUE_AFTER_VER if sent else 6.0, None, None, tier, 0.6, 'breath',
                 cue={'visual': 'ring:out 6s'}, tags={'cycle': c, 'role': 'ver'}, fillRank=rank, fillGroup=grp)]
    if sent:
        out.append(clip(c + '.s', sent, tier, per(EXHALE_SENT_PERIOD), DZ,
                        tags={'texture': 'nefes-ipucu', 'breathLock': True, 'cycle': c, 'role': 'veriş-cümlesi',
                              'arc': 1, 'sense': 'işitme'},
                        onsetPeriod=per(EXHALE_SENT_PERIOD), gapFloor=0.6, fillRank=rank, fillGroup=grp))
    return out


C2 += c2_cycle(1, 'required', 'ağzından ver…')
C2 += c2_cycle(2, 'optional', rank=302, group='c2.d2')
C2 += c2_cycle(3, 'optional', sent='Uzun, yumuşak bir ses çıkıyor.', rank=305, group='c2.d3')
C2 += c2_cycle(4, 'optional', rank=306, group='c2.d4')
C2 += c2_cycle(5, 'optional', rank=315, group='c2.d5')
C2.append(clip('c2.dogal', 'İç çekişi bırakıyorsun; birkaç nefes boyunca her şey kendi hâlinde.', 'required',
               g(12, 14, 18), DZ, tags={'texture': 'ic-cekis', 'breathRoom': True, 'repeatOk': ['nefes', 'çekiş']}))
# c2.sonra ("Her iç çekişin ardından kısa bir sessizlik kalıyor.") düzeltme turunda çıkarıldı: iç çekiş bırakıldıktan
# sonra şimdiki zamanda iç çekişi anlatıyordu ve imge yayının 3. adımını (C3 sonu) erken harcıyordu (INCELEME.md UH8).
C2.append(clip('c2.tur2', 'Bir tur daha iç çekişle devam etmek sana kalmış.', 'optional', g(2, 3, 4), DZ,
               tags={'texture': 'ic-cekis', 'repeatOk': ['çekiş']}, fillRank=340, fillGroup='c2.tur2'))
C2 += c2_cycle(6, 'optional', rank=340, group='c2.tur2')
C2 += c2_cycle(7, 'optional', rank=340, group='c2.tur2', al_only=True)
C2 += c2_cycle(8, 'optional', rank=370, group='c2.d8', al_only=True)
C2 += c2_cycle(9, 'optional', rank=390, group='c2.d9', al_only=True)
C2.append(clip('c2.anahtar2', 'Alış gelir, veriş uzar.', 'required', g(8, 10, 12), DZ,
               tags={'key': 2, 'texture': 'anahtar'}))

# ================================================================================================= C3 · VIZILTILI NEFES
DN = 'Derin'
C3 = [
    clip('c3.ad', 'Sıradaki nefesin adı bramari, yani vızıltılı nefes.', 'required', g(5, 6, 7), DZ,
         cue={'music': 'bordun:13,000 (aynı ton, daha alçak yatak)'},
         tags={'texture': 'vizilti', 'explain': True, 'sanskrit': 'bramari (ilk ve tek geçiş; PLAN.v2 §C.7)'}),
    clip('c3.nasil', 'Verişte dudakların kapalı kalıyor ve arı vızıltısına benzer alçak bir ses çıkıyor.',
         'required', g(5, 6, 7), DZ, tags={'texture': 'vizilti', 'action': 'dudaklar kapalı, vızıltılı veriş', 'repeatOk': ['vızıl']}),
    clip('c3.eller', 'Parmaklarınla kulaklarını ya da yüzünü kapatman gerekmiyor.', 'required',
         g(4.5, 5.5, 7), DZ, tags={'texture': 'vizilti', 'safety': 'no-shanmukhi',
                               'note': 'PLAN.v2 §A.1: parmaklar gözlere, kulaklara ve yüze değmez; düzeltme turu: "gözlerini kapatman '
                                       'gerekmiyor" "gözlerini aç" diye anlaşılabiliyordu, parmak anıldı (INCELEME.md UH6)'}),
    clip('c3.sessiz', 'Ses çıkarmak istemezsen vızıltıyı içinden duyman da olur.', 'required', g(5, 6, 7), DZ,
         tags={'texture': 'vizilti', 'safety': 'alternative',
               'note': '"sesin kimseyi rahatsız etmeyeceği bir yer" hazırlık kartında; burada sessiz seçenek'}),
]


def c3_cycle(n, tier, ver_text=None, rank=None, group=None, phase=DZ):
    grp = group if tier != 'required' else None
    c = 'c3.d%d' % n
    out = [micro(c + '.al', 'Al…', phase, 4.0 if ver_text else C3_PERIOD, None, None, tier, 0.8, 'breath',
                 cue={'breath': {'in': 4, 'out': 9, 'count': 1, 'hum': True}, 'visual': 'ring:in 4s'},
                 tags={'cycle': c, 'role': 'al'}, fillRank=rank, fillGroup=grp)]
    if ver_text:
        out.append(micro(c + '.ver', ver_text, phase, 9.0, None, None, tier, 0.8, 'breath',
                         cue={'visual': 'ring:out 9s, titreşim'}, tags={'cycle': c, 'role': 'vızıltı'},
                         fillRank=rank, fillGroup=grp))
    return out


C3 += c3_cycle(1, 'required', 'vızıltıyla ver…')
C3 += c3_cycle(2, 'required', 'vızıltıyla ver…')
# Düzeltme turu (INCELEME.md UH7): ince ayarlar (c3.agiz, c3.kisa) ilk iki vızıltıdan sonra; ilk vızıltıdan önce
# art arda altı yönerge (≈ 63 sn anlatım) kalmasın. Sıra numaraları (fillRank) aynı; önek kuralı değişmez.
C3 += [
    clip('c3.agiz', 'Dişlerin birbirine değmesin; dilin ağzında rahat dursun.', 'optional', g(4, 5, 6), DZ,
         tags={'texture': 'vizilti', 'action': 'dişler aralık, dil rahat'}, fillRank=401),
    clip('c3.kisa', 'Vızıltı erken biterse bir sonraki alışı beklemen yeterli.', 'optional', g(3, 4, 5), DZ,
         tags={'texture': 'vizilti', 'normalize': True, 'safety': 'no-force', 'repeatOk': ['vızıl']}, fillRank=401),
]
C3 += c3_cycle(3, 'optional', 'ver…', rank=400.5, group='c3.d3')
C3.append(clip('c3.titresim', 'Titreşimi dudaklarında, burnunda ya da yüzünde fark edebilirsin.', 'optional',
               g(8, 10, 12), DZ, tags={'texture': 'vizilti', 'arc': 2, 'sense': 'dokunma'}, fillRank=402))
C3.append(clip('c3.el', 'Bir elini göğsüne koyup titreşimi avucunda da hissedebilirsin.', 'optional',
               g(4, 5, 7), DZ, tags={'texture': 'vizilti', 'arc': 2, 'sense': 'dokunma', 'repeatOk': ['titre'],
                                     'note': 'el göğüste; yüz, göz ve kulaklara dokunulmaz'},
               fillRank=405))
C3 += c3_cycle(4, 'optional', rank=403, group='c3.d4')
C3 += c3_cycle(5, 'optional', rank=404, group='c3.d5')
C3 += c3_cycle(6, 'optional', rank=410, group='c3.d6')
C3 += c3_cycle(7, 'optional', rank=420, group='c3.d7')
C3 += c3_cycle(8, 'extension', rank=465, group='c3.d8')
C3 += c3_cycle(9, 'extension', rank=470, group='c3.d9')
C3.append(clip('c3.sessizlik', 'Ses dindi. Ardından kalan sessizliği de duyuyorsun.', 'required', g(12, 15, 18), DN,
               cue={'visual': 'phase:derin', 'music': 'bordun kısılır; yatak Derin düzeyinde'},
               tags={'texture': 'sessizlik', 'arc': 3, 'sense': 'işitme', 'breathRoom': True, 'repeatOk': ['ses']}))
C3.append(clip('c3.dogal', 'Nefes yeniden kendi hâlinde; bir şey yapman gerekmiyor.', 'optional', g(8, 10, 12), DN,
               tags={'texture': 'sessizlik'}, fillRank=415))
C3.append(clip('c3.anahtar3', 'Veriş uzar.', 'required', g(5, 6, 8), DN, tags={'key': 3, 'texture': 'anahtar'}))

# ================================================================================================= K · KAPANIŞ (oturarak, gündüz)
KP = 'Kapanış'
K = [
    clip('k.donus', 'Artık dönüş zamanı.', 'required', g(3.5, 3.5, 5), KP,
         cue={'music': 'phase:kapanis (pad); returnTone:-2s; bordun çekilir', 'visual': 'dawn',
              'voiceGain': 'rampa o anki evre düzeyinden 0 dB’e, önceki sessizlik boyunca (>= 4 sn; basamak yok)'},
         tags={'texture': 'kapanis'}),
    clip('k.nefes', 'Nefesin kendi ritmini buluyor.', 'required', g(4, 4, 6), KP,
         tags={'step': 'nefes', 'texture': 'kapanis', 'note': '3 dk kuralı: "-(y)abil-"siz (PLAN.v3 §A.2 kural 6)'}),
    clip('k.say', 'Saymadan, kendi hızında birkaç soluk alıp veriyorsun.', 'optional', g(10, 10, 12), KP,
         tags={'step': 'nefes', 'texture': 'kapanis'}, fillRank=292),
    clip('k.sesler', 'Odadaki sesler de yeniden duyuluyor.', 'optional', g(5, 5, 7), KP,
         tags={'step': 'sesler', 'texture': 'kapanis', 'arc': 'dönüş'}, fillRank=102),
    clip('k.hareket', 'Parmaklarını oynatıp zorlamadan gerinebilirsin; ağrı ya da baş dönmesi olursa bırak.',
         'required', g(7, 7, 10), KP,
         tags={'step': 'parmak+gerin', 'texture': 'kapanis', 'mood': 'safety', 'safety': 'movement',
               'action': 'parmakları oynatmak ve gerinmek',
               'note': '3 dk Kapanış\'ın tek "-(y)abil-"i (PLAN.v3 §A.2 kural 6)'}),
    clip('k.goz', 'Gözlerin kapalıysa ışığa alıştıra alıştıra açıp çevrende birkaç şeye bakmak yeter.',
         'required', g(7, 7, 10), KP, cue={'music': 'chord'},
         tags={'step': 'goz+oda', 'texture': 'kapanis', 'eyes': 'ışığa yavaş alışma',
               'action': 'gözleri açıp çevreye bakmak'},
         short={'belowSec': 240, 'text': 'Gözlerin kapalıysa açıp çevrene bakmak yeter.', 'gapAfter': g(7, 7, 10),
                'note': '3 dk: Kapanış 0:48 içinde kalmak için kısa biçim'}),
    clip('k.oda', 'Bir renge ya da ışığın düştüğü bir yere biraz daha uzun bakabilirsin.', 'optional',
         g(6, 6, 8), KP, tags={'step': 'oda', 'texture': 'kapanis'}, fillRank=108),
    clip('k.zaman', 'Günün hangi saatinde ve nerede olduğunu hatırlıyorsun.', 'optional', g(4.5, 4.5, 7), KP,
         tags={'step': 'oda', 'texture': 'kapanis'}, fillRank=262),
    clip('k.gun', 'Bu ritmi gün içinde, kısa bir molada yeniden bulabilirsin.', 'optional', g(4, 4, 6), KP,
         tags={'texture': 'kapanis', 'transfer': True}, fillRank=365),
    clip('k.son', 'Buradasın; nefesin de hep seninle.', 'required', g(6, 6, 8), KP,
         cue={'music': 'fade:5s', 'visual': 'end'}, tags={'step': 'son', 'texture': 'kapanis',
                                                          'note': 'açılış cümlesiyle çerçeve ("Bütün gün seninle olan nefes")'}),
]


def build_carriers():
    """C1, C2, C3 nefes ipuçlarını en çok 8 öğelik taşıyıcılara böler (lint en çok 10)."""
    def ids_of(blk, pref):
        return [c['id'] for c in blk if c.get('tags', {}).get('micro') == 'breath' and c['id'].startswith(pref)]

    def tts(cmap):
        def f(cid, j):
            t = cmap[cid]['text']
            return t if j == 0 else t[0].lower() + t[1:]
        return f

    allc = {c['id']: c for c in C1 + C2 + C3}
    for blk, pref, name in ((C1, 'c1.d', 'car.c1'), (C2, 'c2.d', 'car.c2'), (C3, 'c3.d', 'car.c3')):
        groups = chunk_carriers(ids_of(blk, pref), name, tts(allc))
        for k, grp in enumerate(groups):
            cid = '%s%s' % (name, 'abcdefgh'[k])
            for j, i in enumerate(grp):
                allc[i]['carrier'] = {'id': cid, 'index': j}


build_carriers()

# ================================================================================================= ekler (utility)
QUICK = [dict(c) for c in K if c['tier'] == 'required']
STOP = [
    clip('d.goz', 'Gözlerini aç, etrafına bak, acele etme.', 'required', g(3, 3, 4), KP,
         tags={'mood': 'safety', 'step': 'goz', 'screen': 'Durdurma ekranı metniyle aynı',
               'note': 'her derste aynı metin (PLAN.v3 §C.3; pilot ders2 D.durdur)'}),
    clip('d.kalk', 'Uzanıyorsan önce yana dön, sonra otur.', 'required', g(13, 13, 14), KP,
         tags={'mood': 'safety', 'step': 'yan', 'screen': 'Durdurma ekranı metniyle aynı'}),
    clip('d.bekle', 'Birkaç nefes böyle kal; başın dönerse biraz daha bekle.', 'required', g(1, 1, 2), KP,
         tags={'mood': 'safety', 'step': 'bekle'}),
]
INTRO = [clip('i.ilk', 'Bugün yalnızca tanışıyoruz; zorlanırsan ekrandaki "Kapanışa geç" düğmesine dokunman yeterli.', 'required', g(2, 2, 2),
              'Varış', tags={'firstEver': True, 'note': 'PLAN.v3 §D.3: ayrı giriş dosyası; her derste aynı metin; '
                                                          '"-(y)abil-" yok (a.izin hemen ardından)'})]


def block(bid, kind, prio, order, title, clips, **kw):
    b = {'id': bid, 'kind': kind, 'priority': prio, 'playOrder': order}
    b.update(kw)
    b['title'] = title
    b['clips'] = [finish(c) for c in clips]
    b['silenceWindows'] = []
    return b


BLOCKS = [
    block('A', 'arrival', 0, 0, 'Varış (tek kapak; isteğe bağlılar süreyle eklenir)', A),
    block('C1', 'core', 1, 1, 'Doğal nefes → uzun veriş (4 al / 6 ver, tutma yok)', C1),
    block('C2', 'core', 2, 2, 'İç çekiş: iki alış + ağızdan uzun veriş', C2, entryRank=295),
    block('C3', 'core', 3, 4, 'Vızıltılı nefes (bramari): ağız kapalı, döngü 13 sn, parmaklar yüze değmez', C3,
          entryRank=400),
    block('K', 'closing', 0, 99, 'Kapanış: dışa dönüş (gündüz, oturarak)', K),
]

for c in QUICK + STOP + INTRO:
    finish(c)
for car in CARRIERS:
    allc = {c['id']: c for b in BLOCKS for c in b['clips']}
    car['syllables'] = sum(allc[i]['syllables'] for i in car['items'])
    car['voice'] = {VOICE_KEY: {'file': 'yoga-uretim/%s/%s/%s.wav' % (LESSON, VOICE_KEY, car['id']), 'sec': None}}


def main():
    src = json.load(open(os.path.join(HERE, 'lesson_meta.json'), encoding='utf-8'))
    lesson = dict(src['head'])
    lesson['carriers'] = CARRIERS
    lesson['blocks'] = BLOCKS
    lesson['extras'] = {
        'quickClosing': dict(src['quickClosing'], clips=QUICK),
        'stopReturn': dict(src['stopReturn'], clips=STOP),
        'firstEverIntro': dict(src['firstEverIntro'], clips=INTRO),
    }
    lesson['skeleton30'] = src['skeleton30']
    # blok süre tahminleri (Nefona Hoca köşesi 4,68 hece/sn, yüksek duraklama; VARSAYIM)
    prof = T.profile('hi', 4.68)
    plans = {m: T.plan(lesson, m * 60, 4.68, 'hi') for m in (3, 5, 15)}
    for b in lesson['blocks']:
        def dur(c, lv):
            return T.clip_dur(c, 4.68, prof) + sum(x[lv] for x in T.sent_gaps(c)) + T.gap_of(c, 4.68, prof)[lv]
        req = [c for c in b['clips'] if c['tier'] == 'required']
        b['minSec'] = round(sum(dur(c, 'min') for c in req), 1)
        b['maxSec'] = round(sum(dur(c, 'max') for c in b['clips']), 1)
        b['prefSec'] = {str(m): round(T.block_durations(p).get(b['id'], 0.0), 1) for m, p in plans.items()}
        b['estimateBasis'] = ('Nefona Hoca köşesi: 4,68 hece/sn + yüksek duraklama profili, cümle arası sessizlikler '
                              'dahil (VARSAYIM); minSec = zorunlu klipler (5 dk ve üstü biçim) en kısa sessizlikle; '
                              'prefSec = planlayıcının 3/5/15 dk planındaki blok süresi; üretimden sonra voice.hoc.sec ile')
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(lesson, f, ensure_ascii=False, indent=1)
        f.write('\n')
    n = sum(len(b['clips']) for b in BLOCKS)
    print('yazıldı', OUT, 'klip', n, 'taşıyıcı', len(CARRIERS))


if __name__ == '__main__':
    main()
