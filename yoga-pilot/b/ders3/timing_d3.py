#!/usr/bin/env python3
"""Nefona Yoga · Ders 3 "Uykuya Geçiş" · zamanlama denetimi (B adımı, Parti 1).

Pilot planlayıcısını (`timing.py`, pilot kopyası; sha256 58f6c405…, değiştirilmedi) Ders 3 verisiyle çalıştırır:
`plan(lesson, T, rate, prof)` ve `check_plan(lesson, p)`. Pilotun Ders 2'ye özgü sabitleri yalnız bu sarmalayıcıda,
çalışma anında, Ders 3 verisine göre ayarlanır ("YAMA" satırları; her biri gerekçesiyle). Ek denetimler "D3-" önekiyle
yazılır (uyku dersi kuralları: PLAN.v2 §B.6, güvenlik §11.B-15, §11.D-5; PLAN.v3 §A.2'nin 3 dk dışı kuralları).

Köşeler (hepsi VARSAYIM; lesson.timingModel.corners; Ders 1 ile aynı):
  hoc     4,68 hece/sn, yüksek duraklama   (Nefona Hoca önizleme hızı; muhafazakâr, en yavaş köşe)
  hoc-lo  4,68 hece/sn, düşük duraklama    (Ders 2'nin ölçülmüş hoc kliplerine en yakın model)
  nes     5,6 hece/sn, yüksek duraklama × 1,109  (Neslihan'ın Ders 2'de ölçülmüş süreleri)
Dakikalar: 5..15 (yayında 5 · 15; ara dakikalar önek kuralı ve ikinci aşamanın kaydırıcısı için). Ders 3'te 3 dk yok
(PLAN.v3 §A.3).

Çalıştırma:  python3 timing_d3.py   → timing.txt
"""
import copy
import json
import os
import re
import sys

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import timing as T  # noqa: E402

LESSON_PATH = os.path.join(HERE, 'ders3.lesson.json')
OUT_PATH = os.path.join(HERE, 'timing.txt')
MINUTES = list(range(5, 16))
RELEASE = (5, 15)
SILENCE_MAX = 20.0            # ≤ 15 dk'da duyurulu pencere yok → hiçbir sessizlik 20 sn'yi aşmaz (PLAN.v2 §B.2)
SLEEP_QUICK_BOUNDS = (25.0, 75.0)   # "Uykuya geç" dizisi (VARSAYIM; uyku izni çapası 0:40–1:00)
PRODUCTION_CORNERS = ('hoc', 'hoc-lo')
WAKE_CUES = [r'(?<!\w)uyan(?!ık)', r'gözlerini aç(?!abilir)', r'(?<!\w)kalk', r'(?<!\w)gerin', r'dönüş zamanı',
             r'parmaklarını oynat', r'(?<!\w)günaydın', r'uyanık ve']
CHECK_C4 = 'C4say'            # check_plan'ın Ders 2 imge denetimleri "C4" adına bağlı; sayma bloğu bu adla gösterilir


def load():
    with open(LESSON_PATH, encoding='utf-8') as f:
        return json.load(f)


def planner_view(lesson):
    """Pilot planlayıcı yalnız kind='closing' tanır: uyku izni bloğu planlamada kapanış kapağıdır (veri değişmez)."""
    L = copy.copy(lesson)
    L['blocks'] = [dict(b, kind='closing') if b['kind'] == 'sleepPermission' else b for b in lesson['blocks']]
    return L


def corners(lesson):
    return [(k, v['rate'], v['profile'], v['durScale']) for k, v in lesson['timingModel']['corners'].items()]


# ------------------------------------------------------------------------------------------------ yamalar
PATCH_NOTES = []


def patch(lesson):
    P = PATCH_NOTES.append
    T.ROTATION_ORDER = ['ayak', 'bacak', 'govde', 'kol', 'bas', 'butun']
    P('YAMA ROTATION_ORDER = %s: Ders 3\'ün yavaş beden dolaşımı ayaklardan başa gider (PLAN.v2 §A.2.2 satır 3: '
      '"ayaklardan bele · belden başa"); her bölgede sağ soldan önce; her sürümde bütün bölgeler' % T.ROTATION_ORDER)
    T.CLOSING_STEPS = ['izin', 'son']
    P('YAMA CLOSING_STEPS = [izin, son]: gecede kapanış ritüeli uyku iznidir (PLAN.v2 §E.6 #12, §B.6); dışa dönüş '
      'adımları yok')
    T.QUICK_BOUNDS = SLEEP_QUICK_BOUNDS
    T.QUICK_BOUNDS_WINDOW = SLEEP_QUICK_BOUNDS
    P('YAMA QUICK_BOUNDS = %s: "Uykuya geç" uyku iznine atlar (PLAN.v2 §B.5, PLAN.v3 §D.3); gündüz hızlı kapanışının '
      '60–110 sn\'si burada geçersiz; aralık VARSAYIM' % (SLEEP_QUICK_BOUNDS,))
    for name, rate, prof, sc in corners(lesson):
        if rate not in T.RATES:
            T.RATES.append(rate)
            T.RATES.sort()
        T.SPEED_PAUSE_SCALE.setdefault(rate, 1.0)
    T.MCP_RATES = tuple(sorted({c[1] for c in corners(lesson)}))
    P('YAMA RATES += 4,68 ve MCP_RATES = %s: köşe hızları metin denetimine ve 5 dk en uzun boşluk denetimine (L3-03) '
      'girer' % (T.MCP_RATES,))
    T.PRODUCTION = (4.68, 'hi')
    P('YAMA PRODUCTION = (4,68, hi): üretim sesi Nefona Hoca (sahip, madde 8); P-S1 Derin iç hız denetimi bu köşede')
    T.FORBIDDEN = [w for w in T.FORBIDDEN if w != 'uykuya dal']
    P('YAMA FORBIDDEN − "uykuya dal": pilot listesi bunu "gündüz dersi: uyku izni yok" diye yasaklar; uyku dersinin izin '
      'cümlesi (güvenlik §11.B-15, PLAN.v2 Ders 3 kartı) bunu taşır. Yerine D3-izin: bu söz yalnız k.izin\'de. '
      '"uyuyabilir", "uyursan", "uyku gel" ve E12 listesi ("uyuyacak", "derin uyku" …) yerinde')
    T.BLOCK_MIN_AMEND = {}
    P('YAMA BLOCK_MIN_AMEND = {}: pilotun 5 dk istisnası (C2 >= 30, N2 >= 15) Ders 2\'nin bloklarınadır; Ders 3\'te '
      'her çekirdek blok her sürede >= 55 sn (PLAN.v2 §B.3 adım 8)')
    T.NUMBER_PERIOD = (7.0, 9.0)
    P('YAMA NUMBER_PERIOD = (7, 9): geri saymada sayıdan sayıya 8 sn (VARSAYIM; Ders 2\'de 6); uyku dersinde yavaş, '
      'uzun verişe yakın döngü (≈ 7,5 nefes/dk; Eide 2026: <= 10 nefes/dk)')

    def key_want(ls, p):
        return [1, 2, 3] if any(b in p['sel'] for b in ('C4', CHECK_C4)) else [1, 3]
    T.key_want = key_want
    P('YAMA key_want: anahtar cümle C1\'in sonunda, geri sayma (C4) varsa onun sonunda ve uyku izninin başında; '
      'C4\'süz sürümde iki geçiş (5 dk\'da en az bir: PLAN.v2 §C.4), giderek kısa')

    orig_ui = T.ui_texts

    def ui_texts(ls):
        L = dict(ls)
        L['scenePicker'] = ls.get('scenePicker') or {'options': []}
        out = orig_ui(L)
        out += [v for v in (ls.get('evidenceByVersion') or {}).values()]
        out += [ls['progress'].get('morningQuestion', '')] + list(ls.get('openingScreen', []))
        return [t for t in out if t]
    T.ui_texts = ui_texts
    P('YAMA ui_texts: sahne seçici yok (seçim ders içinde sözle); sürüm kartı cümleleri ve ertesi sabah sorusu da '
      'yasak listeyle denetlenir')
    P('YAMA check_plan görünümü: sayma bloğu "C4" → "%s" adıyla verilir; pilotun C4 denetimleri Ders 2\'nin imgesine '
      '(c4.patika, c4.don, br.orta) bağlıdır. Ders 3\'ün imge denetimleri D3-imge satırlarında (C3)' % CHECK_C4)


def check_view(lesson, p):
    Lv = copy.copy(planner_view(lesson))
    Lv['blocks'] = [dict(b, id=CHECK_C4) if b['id'] == 'C4' else b for b in Lv['blocks']]
    q = dict(p)
    q['sel'] = [CHECK_C4 if b == 'C4' else b for b in p['sel']]
    q['events'] = [dict(ev, block=CHECK_C4) if ev['block'] == 'C4' else ev for ev in p['events']]
    return Lv, q


def d3_checks(lesson, p):
    fails = []
    evs = p['events']
    ids = [ev['clip']['id'] for ev in evs]
    # D3-sessizlik: duyurulu pencere yok → hiçbir sessizlik 20 sn'yi aşmaz
    for ev in evs:
        if ev['gap'] > SILENCE_MAX + 1e-6:
            fails.append('D3-sessizlik: %s sonrası %.1f sn > %g' % (ev['clip']['id'], ev['gap'], SILENCE_MAX))
        if ev['clip'].get('window'):
            fails.append('D3-sessizlik: <= 15 dk\'da duyurulu pencere olmamalı (%s)' % ev['clip']['id'])
    # D3-izin: uyku izni her sürümde; "uykuya dal" yalnız k.izin'de; son klip k.son; uyandırma yok
    if 'k.izin' not in ids or ids[-1] != 'k.son':
        fails.append('D3-izin: uyku izni ya da son cümle eksik (son klip %s)' % ids[-1])
    for ev in evs:
        low = ev['clip']['text'].lower()
        if 'uykuya dal' in low and ev['clip']['id'] != 'k.izin':
            fails.append('D3-izin: "uykuya dal" k.izin dışında: %s' % ev['clip']['id'])
        for rx in WAKE_CUES:
            if re.search(rx, low):
                fails.append('D3-uyandırma: %s "%s"' % (ev['clip']['id'], ev['clip']['text']))
    # D3-normal: uyku çabasını kaldıran cümle (a.kolay) ve uyanık kalma izni (k.uyanik) her sürümde
    for need in ('a.kolay', 'k.uyanik'):
        if need not in ids:
            fails.append('D3-normal: %s yok' % need)
    # D3-imge: yay sırası; görme dışı duyu; imge başında gözleri açık seçeneği; karanlık tümüyle gelmez
    arc = [ev['clip']['tags'].get('arc') for ev in evs if ev['block'] == 'C3' and ev['clip']['tags'].get('arc')]
    order = ['giriş', 'yağmur', 'örtü', 'lamba', 'ışık kısılır']
    seen = [a for a in dict.fromkeys(arc) if a in order]
    if seen != order:
        fails.append('D3-imge: yay sırası %s (beklenen %s)' % (seen, order))
    k = ids.index('c3.kisilir')
    nv = [ev for ev in evs[:k] if ev['block'] == 'C3' and ev['clip']['tags'].get('sense') not in (None, 'görme')]
    if len(nv) < 2:
        fails.append('D3-imge: c3.kisilir öncesi görme dışı duyu klibi %d < 2' % len(nv))
    sah = evs[ids.index('c3.sahne')]
    if not any(ev['clip']['tags'].get('eyesOpen') and sah['start'] - 60 <= ev['start'] <= sah['start'] + 30
               for ev in evs):
        fails.append('D3-imge: c3.sahne çevresinde (−60/+30 sn) gözleri açık seçeneği yok')
    if 'c3.aydinlik' not in ids and not any(ev['clip']['id'] == 'c3.kisilir' and ev['clip'].get('shortForm')
                                            and 'aydınlık' in ev['clip']['text'] for ev in evs):
        fails.append('D3-imge: loş aydınlık cümlesi yok (karanlık tümüyle gelmemeli)')
    # D3-sayma: geri sayma varsa normalleştirme (c4.bitti) ve anahtar 2
    if 'C4' in p['sel'] and not {'c4.bitti', 'c4.k2'} <= set(ids):
        fails.append('D3-sayma: c4.bitti ya da c4.k2 eksik')
    # D3-Varış: a.izin'den önce göz seçimi (PLAN.v2 §A.1, T33)
    if ids.index('a.gozler') > ids.index('a.izin'):
        fails.append('D3-Varış: a.izin göz seçiminden önce')
    return fails


def check(lesson, p):
    Lv, q = check_view(lesson, p)
    fails, d, runs = T.check_plan(Lv, q)
    return fails + d3_checks(lesson, p), d, runs


def run_corner(lesson, name, rate, prof, sc):
    T.DUR_SCALE = sc
    PV = planner_view(lesson)
    res = {}
    for m in MINUTES:
        p = T.plan(PV, m * 60, rate, prof)
        f, d, runs = check(lesson, p)
        res[m] = [p, f, d, runs]
    ids = {m: [ev['clip']['id'] for ev in res[m][0]['events']] for m in MINUTES}
    for m in MINUTES[1:]:
        lost = sorted(set(ids[m - 1]) - set(ids[m]))
        if lost:
            res[m][1].append('alt küme bozuk: %d → %d dk düşen %s' % (m - 1, m, lost))
    for m in MINUTES:
        p = res[m][0]
        if p['stop'] is not None and T.stretch(p) > T.STRETCH_MAX_UNSATURATED + 1e-9:
            res[m][1].append('T5: içerik doymadan esneme f=%.2f > %g' % (T.stretch(p), T.STRETCH_MAX_UNSATURATED))
    slack5 = 300 - (res[5][0]['speech'] + res[5][0]['gaps']['min'])
    floor = lesson['timingModel']['slackFloors']['5']
    if name in PRODUCTION_CORNERS and slack5 < floor - 1e-6:
        res[5][1].append('D3-boş-pay: 5 dk\'da min sessizliklerle boş pay %.1f sn < %g' % (slack5, floor))
    T.DUR_SCALE = 1.0
    return res, slack5


# ------------------------------------------------------------------------------------------------ rapor
def fmt_t(s):
    return '%d:%04.1f' % (int(s // 60), s % 60)


def plan_listing(p, P):
    for ev in p['events']:
        c = ev['clip']
        tag = ' [5 dk kısa biçimi]' if c.get('shortForm') else ''
        P('    %7s  %-3s %-13s %5.1f sn  +%5.1f  %s%s' % (fmt_t(ev['start']), ev['block'], c['id'], ev['speech'],
                                                    ev['gap'], c['text'], tag))


def abil_windows(p):
    sc = [ev for ev in p['events'] if not ev['clip'].get('carrier')]
    worst = 0
    for ev in sc:
        worst = max(worst, sum(T.n_abil(e['clip']['text']) for e in sc if ev['start'] <= e['start'] < ev['start'] + 60))
    return sum(T.n_abil(ev['clip']['text']) for ev in sc), worst


def fmt_blocks(p):
    order = ['A', 'C1', 'C2', 'C4', 'C3', 'K']
    return '+'.join(b for b in order if b in p['sel'] or b in (p['A'], p['K']))


def main():
    lesson = load()
    patch(lesson)
    lines = []
    P = lines.append
    P('Nefona Yoga · Ders 3 "Uykuya Geçiş" · timing_d3.py çıktısı (B adımı, Parti 1; %s)' % lesson['version'])
    P('Planlayıcı: pilot timing.py (plan, check_plan; birebir kopya, değiştirilmedi). Ders dosyası: ders3.lesson.json.')
    P('SES YOK: bütün süreler hece modelinden tahmindir (VARSAYIM). Köşeler:')
    for name, rate, prof, sc in corners(lesson):
        P('  %-7s %.2f hece/sn, %s duraklama, süre × %.3f  — %s' % (name, rate, prof, sc,
                                                                   lesson['timingModel']['corners'][name]['basis']))
    P('Dakikalar: %s (yayında 5 · 15; 3 dk yok, PLAN.v3 §A.3).' % ', '.join(map(str, MINUTES)))
    P('')
    P('== Sarmalayıcı yamaları (pilot sabitleri, yalnız bu çalıştırmada) ==')
    for n in PATCH_NOTES:
        P('  ' + n)
    P('')
    LV = planner_view(lesson)
    tf, tout = T.lint_text(LV)
    P('== Metin denetimi (pilot lint_text: yasak ve E12 listesi, İngilizce, Sanskritçe, cümle ve sözcük sayısı, emir '
      'kipi, alt klipler, "Uykuya geç" dizisi ve Durdur dönüşü) ==')
    for o in tout:
        P('  bilgi: ' + o)
    colon = [c['id'] for b in lesson['blocks'] for c in b['clips'] if ':' in c['text']]
    ell = [c['id'] for b in lesson['blocks'] for c in b['clips'] if '…' in c['text'] and not c.get('carrier')]
    extra = []
    if colon:
        extra.append('iki nokta üst üste: %s' % colon)
    if ell:
        extra.append('mikro-klip dışında üç nokta: %s' % ell)
    for f in extra:
        tf.append(f)
    P('  iki nokta üst üste içeren birim: %s' % (colon or 'yok'))
    P('  mikro-klip dışında üç nokta: %s' % (ell or 'yok'))
    P('  metin denetimi: %s' % ('GEÇTİ' if not tf else 'KALDI'))
    for f in tf:
        P('  HATA: ' + f)
    P('')
    all_ok = not tf
    allres = {}
    for name, rate, prof, sc in corners(lesson):
        res, slack5 = run_corner(lesson, name, rate, prof, sc)
        allres[name] = (res, slack5)
        P('== Köşe %s (%.2f hece/sn, %s, × %.3f) ==' % (name, rate, prof, sc))
        P('  kolonlar: sonuç | dk | bloklar | klip | hece | konuşma %% | sessizlik kipi f | en uzun boşluk | '
          'en yoğun 60 sn (hece, pay) | ort. hece/dk | durak')
        for m in MINUTES:
            p, fails, d, runs = res[m]
            syl = sum(ev['clip']['syllables'] for ev in p['events'])
            P('  %s %2d dk | %s | %3d | %4d | %4.1f%% | %s %.2f | %4.1f | %3.0f, %.2f | %3.0f | %s' % (
                'GEÇTİ' if not fails else 'KALDI', m, fmt_blocks(p), len(p['events']), syl,
                100 * p['speech'] / p['total'], p['mode'], p['f'], max(ev['gap'] for ev in p['events']),
                d['syll'], d['frac'], d['avg'], p['stop'][1] if p['stop'] else '-'))
            for f in fails:
                P('      HATA: ' + f)
            if fails:
                all_ok = False
        P('  boş pay (5 dk, min sessizliklerle): %.1f sn (taban %g; yalnız üretim köşelerinde bağlayıcı)' % (
            slack5, lesson['timingModel']['slackFloors']['5']))
        P('')
    P('== Blok süreleri (sn; giriş müziği Varış\'a dahil) ve çapalar (PLAN.v2 §B.4; sure.md §4) ==')
    anc = lesson['skeleton30']['anchorsSec']
    for m in RELEASE:
        P('  %2d dk  çapa: %s' % (m, ' · '.join('%s %s' % (b, fmt_t(s)) for b, s in anc[str(m)].items() if s)))
        for name, *_ in corners(lesson):
            p = allres[name][0][m][0]
            bs = T.block_durations(p)
            bs['A'] = bs.get('A', 0) + p['events'][0]['start']
            P('         %s: %s' % (name, ' · '.join('%s %s' % (b, fmt_t(bs[b])) for b in ('A', 'C1', 'C2', 'C4', 'C3',
                                                                                          'K') if b in bs)))
    P('')
    P('== Blokların ve isteğe bağlı kliplerin girdiği dakika (en küçük dakika) ==')
    for name, *_ in corners(lesson):
        res = allres[name][0]
        ent = {}
        for m in MINUTES:
            for ev in res[m][0]['events']:
                ent.setdefault(ev['clip']['id'] if ev['clip']['tier'] != 'required' else ev['block'], m)
        P('  %s: %s' % (name, ', '.join('%s %d' % (b, v) for b, v in ent.items() if v > 5)))
    P('')
    P('== "-(y)abil-" yoğunluğu (cümle klipleri; herhangi bir 60 sn\'de en çok 3) ==')
    for name, *_ in corners(lesson):
        for m in RELEASE:
            n, w = abil_windows(allres[name][0][m][0])
            P('  %s %2d dk: toplam %d, en yoğun 60 sn %d' % (name, m, n, w))
    P('')
    P('== Evre başına ortalama cümle uzunluğu (hece/cümle; H12: Derin < Derinleşme < Varış), hoc köşesi ==')
    for m in RELEASE:
        me = T.phase_sentence_means(allres['hoc'][0][m][0])
        P('  %2d dk: %s' % (m, ', '.join('%s %.1f' % (k, me[k]) for k in ('Varış', 'Derinleşme', 'Derin') if k in me)))
    P('')
    P('== Tekrar uyarıları (pilot repetition_warnings; bilgi) ==')
    plans = [allres[n][0][m][0] for n in allres for m in MINUTES]
    reps = T.repetition_warnings(LV, plans)
    for (a, b), ws in sorted(reps.items()):
        P('  %s → %s: %s' % (a, b, ', '.join(ws)))
    if not reps:
        P('  yok')
    wc = T.within_clip_warnings(LV)
    P('== Klip içi kök tekrarı (pilot within_clip_warnings; bilgi) ==')
    for w in (wc or ['yok']):
        P('  %s' % (w,))
    P('')
    P('== Sarsıntı taraması (bilgi; pilot Z2-04 kalıbı): bütün klip süreleri × 0,90 / 0,95 / 1,05 / 1,10, 5..15 dk ==')
    PV = planner_view(lesson)
    for name, rate, prof, sc in corners(lesson):
        row = []
        for k in T.PERTURB:
            T.DUR_SCALE = sc * k
            bad = []
            for m in MINUTES:
                p = T.plan(PV, m * 60, rate, prof)
                f, _, _ = check(lesson, p)
                if f:
                    bad.append('%d dk: %s' % (m, f[0]))
            T.DUR_SCALE = 1.0
            row.append('×%.2f %s' % (k, 'GEÇTİ' if not bad else 'KALDI (%s)' % '; '.join(bad[:2])))
        P('  %-7s %s' % (name, ' | '.join(row)))
    P('')
    for name, *_ in corners(lesson):
        for m in RELEASE:
            p = allres[name][0][m][0]
            P('== Plan · %s · %d dk (toplam %.1f sn; konuşma %.1f sn; kip %s f=%.2f; giriş %.1f sn) ==' % (
                name, m, p['total'], p['speech'], p['mode'], p['f'], p['events'][0]['start']))
            P('    başlangıç blok klip          konuşma   sonra  metin')
            plan_listing(p, P)
            P('')
    n_ok = {n: sum(1 for m in MINUTES if not allres[n][0][m][1]) for n in allres}
    P('== ÖZET ==')
    for n in allres:
        rel = ', '.join('%d dk %s' % (m, 'GEÇTİ' if not allres[n][0][m][1] else 'KALDI') for m in RELEASE)
        P('  %-7s %d/%d dakika GEÇTİ; yayın süreleri: %s' % (n, n_ok[n], len(MINUTES), rel))
    P('  metin denetimi: %s' % ('GEÇTİ' if not tf else 'KALDI'))
    P('  Kapsam: zamanlama ve metin kuralları; dinleme, söyleyiş ve insan/yedek inceleme onayı değildir.')
    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')
    print('\n'.join([l for l in lines if l.startswith('  ') and ('KALDI' in l or 'HATA' in l)][:120]))
    print('\n'.join(lines[-7:]))
    return 0 if all_ok else 1


if __name__ == '__main__':
    sys.exit(main())
