#!/usr/bin/env python3
"""Nefona Yoga · Ders 1 "Nefesin Ritmi" · zamanlama denetimi (B adımı, Parti 1).

Pilot planlayıcısını (`timing.py`, pilot kopyası; sha256 58f6c405…, değiştirilmedi) Ders 1 verisiyle çalıştırır:
`plan(lesson, T, rate, prof)` ve `check_plan(lesson, p)`. Pilotun Ders 2'ye özgü sabitleri yalnız bu sarmalayıcıda,
çalışma anında, Ders 1 verisine göre ayarlanır (aşağıda "YAMA" satırları; her biri gerekçesiyle). Ek denetimler "D1-"
önekiyle yazılır (PLAN.v3 §A.2'nin 12 kuralından planlayıcı testine girenler + nefes kilidi).

Köşeler (hepsi VARSAYIM; lesson.timingModel.corners):
  hoc     4,68 hece/sn, yüksek duraklama   (Nefona Hoca önizleme hızı; Ders 2 ölçümüne göre muhafazakâr)
  hoc-lo  4,68 hece/sn, düşük duraklama    (Ders 2'nin ölçülmüş hoc kliplerine en yakın model)
  nes     5,6 hece/sn, yüksek duraklama × 1,109  (Neslihan'ın Ders 2'de ölçülmüş süreleri)
Dakikalar: 3, 4 ve 5..15 (yayında 3 · 5 · 15; 4 ve 6–14 önek kuralı ve kaydırıcı için).

Çalıştırma:  python3 timing_d1.py   → timing.txt
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

LESSON_PATH = os.path.join(HERE, 'ders1.lesson.json')
OUT_PATH = os.path.join(HERE, 'timing.txt')
MINUTES = [3, 4] + list(range(5, 16))
RELEASE = (3, 5, 15)
SEATED_STEPS = ['nefes', 'parmak', 'gerin', 'goz', 'oda']
SILENCE_MAX = 20.0
BREATH_ROOM = (12.0, 20.0)
LOCK_TOL = 0.02
PRODUCTION_CORNERS = ('hoc', 'hoc-lo')   # boş pay tabanı yalnız üretim sesinde (pilot T6 kalıbı); nes bilgi


def load():
    with open(LESSON_PATH, encoding='utf-8') as f:
        return json.load(f)


def corners(lesson):
    return [(k, v['rate'], v['profile'], v['durScale']) for k, v in lesson['timingModel']['corners'].items()]


# ------------------------------------------------------------------------------------------------ yamalar
PATCH_NOTES = []


def patch(lesson):
    P = PATCH_NOTES.append
    T.ROTATION_ORDER = []
    P('YAMA ROTATION_ORDER = []: beden dolaşımı Ders 2\'ye özgü; Ders 1\'de beden dolaşımı yok')
    T.CLOSING_STEPS = SEATED_STEPS
    P('YAMA CLOSING_STEPS = %s: oturarak gündüz kapanışı (güvenlik §11.B-14; PLAN.v3 §A.2 kural 1: yana dönme, '
      'oturma, bekleme ve kalkma yok)' % SEATED_STEPS)
    T.QUICK_BOUNDS = (45.0, 110.0)
    P('YAMA QUICK_BOUNDS = (45, 110): oturarak derste hızlı kapanış (sure.md §8 tablo; PLAN.v3 §D.3 aynı dosyanın '
      'Kapanış\'ına atlama)')
    for name, rate, prof, sc in corners(lesson):
        if rate not in T.RATES:
            T.RATES.append(rate)
            T.RATES.sort()
        T.SPEED_PAUSE_SCALE.setdefault(rate, 1.0)
    T.MCP_RATES = tuple(sorted({c[1] for c in corners(lesson)}))
    P('YAMA RATES += 4,68 ve MCP_RATES = %s: köşe hızları metin denetimine ve 3/5 dk en uzun boşluk denetimine '
      '(L3-03) girer' % (T.MCP_RATES,))
    T.PRODUCTION = (4.68, 'hi')
    P('YAMA PRODUCTION = (4,68, hi): üretim sesi Nefona Hoca (sahip, madde 8); P-S1 Derin iç hız denetimi bu köşede')

    orig_ui = T.ui_texts

    def ui_texts(ls):
        L = dict(ls)
        L.setdefault('scenePicker', {'options': []})
        out = orig_ui(L)
        out += [ls.get('evidenceByVersion', {}).get('3') or '']
        return [t for t in out if t]
    T.ui_texts = ui_texts
    P('YAMA ui_texts: sahne seçici yok (Ders 1\'de imge seçimi yok); 3 dk kart cümlesi de yasak listeyle denetlenir')

    def key_want(ls, p):
        return [1] + ([2] if 'C2' in p['sel'] else []) + ([3] if 'C3' in p['sel'] else [])
    T.key_want = key_want
    P('YAMA key_want: anahtar cümle C1, C2 ve C3\'ün sonunda; 3 ve 5 dk\'da bir kez (PLAN.v3 §A.2 kural 5), 15 dk\'da '
      'üç kez, giderek kısa (PLAN.v2 §A.2.1)')
    P('YAMA check_plan öncesi: T < 240 için DAWN_SPAN = (45, 90) (karar 4d) ve LONGEST_GAP_5MIN = 12 (3 dk nefes '
      'payı, PLAN.v3 §A.2 kural 3); 5 dk\'da pilotun 16 sn\'si')
    P('YAMA L2-08 (mikro-liste periyot yayılımı <= 0,6 sn) nefes kilitli kliplere uygulanmaz: 4/6 ve 2,5/1,5/6 '
      'periyotları tasarım gereği farklıdır; yerine D1-kilit denetimi (her klip kendi periyodunu ±%.2f sn tutar)'
      % LOCK_TOL)


def masked(p):
    q = dict(p)
    evs = []
    for ev in p['events']:
        c = ev['clip']
        if c.get('tags', {}).get('breathLock'):
            c = dict(c)
            c.pop('onsetPeriod', None)
            ev = dict(ev, clip=c)
        evs.append(ev)
    q['events'] = evs
    return q


def d1_checks(lesson, p):
    fails = []
    evs = p['events']
    Tt = p['T']
    # D1-kilit: nefes kilitli her klip kendi periyodunu tutar (bordun ve halka kilidi)
    for i, ev in enumerate(evs[:-1]):
        c = ev['clip']
        if c.get('tags', {}).get('breathLock'):
            want = c['onsetPeriod']['pref']
            got = evs[i + 1]['start'] - ev['start']
            if abs(got - want) > LOCK_TOL:
                fails.append('D1-kilit: %s periyodu %.2f sn != %.2f (sessizlik tabanı aşıldı ya da sıra bozuk)'
                             % (c['id'], got, want))
    # D1-döngü: her döngünün periyotları toplamı blok döngüsünün katı; döngü "Al…" ile başlar
    cyc = {}
    for ev in evs:
        tg = ev['clip'].get('tags', {})
        if tg.get('cycle') and tg.get('breathLock'):
            cyc.setdefault(tg['cycle'], []).append(ev)
    period = {k: v['periodSec'] for k, v in lesson['breathCycles'].items() if isinstance(v, dict)}
    for cid, lst in cyc.items():
        bp = period[lst[0]['block']]
        s = sum(e['clip']['onsetPeriod']['pref'] for e in lst)
        if abs(s / bp - round(s / bp)) > 1e-6 or lst[0]['clip']['tags'].get('role') != 'al':
            fails.append('D1-döngü: %s toplam %.2f sn, %g sn\'nin katı değil ya da "Al…" ile başlamıyor' % (cid, s, bp))
    # D1-sessizlik: <= 15 dk'da duyurulu pencere yok → hiçbir sessizlik 20 sn'yi aşmaz
    for ev in evs:
        if ev['gap'] > SILENCE_MAX + 1e-6:
            fails.append('D1-sessizlik: %s sonrası %.1f sn > %g' % (ev['clip']['id'], ev['gap'], SILENCE_MAX))
    # D1-normal: başarısızlığı olağan sayan cümle (kural 5) ve nefes güvenlik cümlesi her sürümde
    if not any(ev['clip'].get('tags', {}).get('normalize') for ev in evs):
        fails.append('D1-normal: başarısızlığı olağan sayan cümle yok')
    ids = [ev['clip']['id'] for ev in evs]
    if 'c1.guven' not in ids:
        fails.append('D1-güvenlik: c1.guven yok')
    # D1-nefes payı: çekirdekte en az bir 12–20 sn'lik boşluk (kural 3)
    core = [ev for ev in evs if ev['block'] not in ('A', 'K')]
    if not any(BREATH_ROOM[0] - 1e-6 <= ev['gap'] <= BREATH_ROOM[1] + 1e-6 for ev in core):
        fails.append('D1-nefes-payı: çekirdekte 12–20 sn\'lik boşluk yok')
    if Tt < 240:
        # kural 6: 3 dk Kapanış en çok bir "-(y)abil-"
        nk = sum(T.n_abil(ev['clip']['text']) for ev in evs if ev['block'] == 'K')
        if nk > 1:
            fails.append('D1-3dk: Kapanış\'ta %d "-(y)abil-" > 1' % nk)
        # kural 7: çekirdeğin son klibi dönüş cümlesi ya da anahtar/niyet
        last_core = [ev for ev in evs if ev['block'] not in ('A', 'K')][-1]
        if not last_core['clip'].get('tags', {}).get('key'):
            fails.append('D1-3dk: çekirdeğin son klibi anahtar cümle değil (%s)' % last_core['clip']['id'])
        # kural 6 (baş): a.izin'den sonraki 60 sn'de başka "-(y)abil-" yok
        iz = next(ev for ev in evs if ev['clip']['id'] == 'a.izin')
        extra = [ev['clip']['id'] for ev in evs if ev is not iz and iz['start'] <= ev['start'] < iz['start'] + 60
                 and T.n_abil(ev['clip']['text'])]
        if extra:
            fails.append('D1-3dk: a.izin sonrası 60 sn\'de "-(y)abil-": %s' % extra)
        # kural 1: yalnız oturarak
        if lesson['posture'] != 'seated':
            fails.append('D1-3dk: duruş oturarak değil')
    return fails


def check(lesson, p):
    if p['T'] < 240:
        T.DAWN_SPAN = (45.0, 90.0)
        T.LONGEST_GAP_5MIN = 12.0
    else:
        T.DAWN_SPAN = (60.0, 90.0)
        T.LONGEST_GAP_5MIN = 16.0
    fails, d, runs = T.check_plan(lesson, masked(p))
    fails = fails + d1_checks(lesson, p)
    return fails, d, runs


def run_corner(lesson, name, rate, prof, sc):
    T.DUR_SCALE = sc
    res = {}
    for m in MINUTES:
        p = T.plan(lesson, m * 60, rate, prof)
        f, d, runs = check(lesson, p)
        res[m] = [p, f, d, runs]
    ids = {m: [ev['clip']['id'] for ev in res[m][0]['events']] for m in MINUTES}
    # önek kuralı: 3 ⊆ 5; 5..15 ardışık; (3 ⊆ 4 ⊆ 5 bilgi)
    lost = sorted(set(ids[3]) - set(ids[5]))
    if lost:
        res[5][1].append('alt küme bozuk: 3 → 5 dk düşen %s' % lost)
    for m in range(6, 16):
        lost = sorted(set(ids[m - 1]) - set(ids[m]))
        if lost:
            res[m][1].append('alt küme bozuk: %d → %d dk düşen %s' % (m - 1, m, lost))
    info = []
    for a, b in ((3, 4), (4, 5)):
        lost = sorted(set(ids[a]) - set(ids[b]))
        info.append('%d ⊆ %d: %s' % (a, b, 'evet' if not lost else 'hayır (%s)' % lost))
    for m in MINUTES:
        p = res[m][0]
        if p['stop'] is not None and T.stretch(p) > T.STRETCH_MAX_UNSATURATED + 1e-9:
            res[m][1].append('T5: içerik doymadan esneme f=%.2f > %g' % (T.stretch(p), T.STRETCH_MAX_UNSATURATED))
    slack = {m: m * 60 - (res[m][0]['speech'] + res[m][0]['gaps']['min']) for m in (3, 5)}
    floors = lesson['timingModel']['slackFloors']
    for m in (3, 5):
        if name in PRODUCTION_CORNERS and slack[m] < floors[str(m)] - 1e-6:
            res[m][1].append('D1-boş-pay: %d dk\'da min sessizliklerle boş pay %.1f sn < %g' % (m, slack[m],
                                                                                                floors[str(m)]))
    T.DUR_SCALE = 1.0
    return res, info, slack


# ------------------------------------------------------------------------------------------------ rapor
def fmt_t(s):
    return '%d:%04.1f' % (int(s // 60), s % 60)


def block_secs(p):
    return T.block_durations(p)


def plan_listing(p, P):
    for ev in p['events']:
        c = ev['clip']
        txt = c['text']
        tag = ''
        if c.get('shortForm'):
            tag = ' [3 dk kısa biçimi]'
        P('    %7s  %-5s %-14s %5.1f sn  +%5.1f  %s%s' % (fmt_t(ev['start']), ev['block'], c['id'], ev['speech'],
                                                     ev['gap'], txt, tag))


def abil_windows(p):
    sc = [ev for ev in p['events'] if not ev['clip'].get('carrier')]
    worst = 0
    for ev in sc:
        worst = max(worst, sum(T.n_abil(e['clip']['text']) for e in sc if ev['start'] <= e['start'] < ev['start'] + 60))
    return sum(T.n_abil(ev['clip']['text']) for ev in sc), worst


def main():
    lesson = load()
    patch(lesson)
    lines = []
    P = lines.append
    P('Nefona Yoga · Ders 1 "Nefesin Ritmi" · timing_d1.py çıktısı (B adımı, Parti 1; %s)' % lesson['version'])
    P('Planlayıcı: pilot timing.py (plan, check_plan; birebir kopya, değiştirilmedi). Ders dosyası: ders1.lesson.json.')
    P('SES YOK: bütün süreler hece modelinden tahmindir (VARSAYIM). Köşeler:')
    for name, rate, prof, sc in corners(lesson):
        P('  %-7s %.2f hece/sn, %s duraklama, süre × %.3f  — %s' % (name, rate, prof, sc,
                                                                   lesson['timingModel']['corners'][name]['basis']))
    P('Dakikalar: %s (yayında 3 · 5 · 15).' % ', '.join(map(str, MINUTES)))
    P('')
    P('== Sarmalayıcı yamaları (pilot sabitleri, yalnız bu çalıştırmada) ==')
    for n in PATCH_NOTES:
        P('  ' + n)
    P('')
    tf, tout = T.lint_text(lesson)
    P('== Metin denetimi (pilot lint_text: yasak ve E12 listesi, İngilizce, Sanskritçe, cümle ve sözcük sayısı, emir '
      'kipi, alt klipler, hızlı kapanış ve Durdur dönüşü) ==')
    for o in tout:
        P('  bilgi: ' + o)
    P('  metin denetimi: %s' % ('GEÇTİ' if not tf else 'KALDI'))
    for f in tf:
        P('  HATA: ' + f)
    # iki nokta üst üste (SPEC v3.1) ve üç nokta (yalnız mikro listeler)
    colon = [c['id'] for b in lesson['blocks'] for c in b['clips'] if ':' in c['text']]
    P('  iki nokta üst üste içeren birim: %s' % (colon or 'yok'))
    ell = [c['id'] for b in lesson['blocks'] for c in b['clips'] if '…' in c['text'] and not c.get('carrier')]
    P('  mikro-klip dışında üç nokta: %s' % (ell or 'yok'))
    P('')
    all_ok = not tf
    allres = {}
    for name, rate, prof, sc in corners(lesson):
        res, info, slack = run_corner(lesson, name, rate, prof, sc)
        allres[name] = (res, info, slack)
        P('== Köşe %s (%.2f hece/sn, %s, × %.3f) ==' % (name, rate, prof, sc))
        P('  kolonlar: sonuç | dk | bloklar | klip | hece | konuşma %% | sessizlik kipi f | en uzun boşluk | '
          'en yoğun 60 sn (hece, pay) | ort. hece/dk | durak')
        for m in MINUTES:
            p, fails, d, runs = res[m]
            syl = sum(ev['clip']['syllables'] for ev in p['events'])
            P('  %s %2d dk | %s | %3d | %4d | %4.1f%% | %s %.2f | %4.1f | %3.0f, %.2f | %3.0f | %s' % (
                'GEÇTİ' if not fails else 'KALDI', m, T.fmt_blocks(p), len(p['events']), syl,
                100 * p['speech'] / p['total'], p['mode'], p['f'], max(ev['gap'] for ev in p['events']),
                d['syll'], d['frac'], d['avg'], p['stop'][1] if p['stop'] else '-'))
            for f in fails:
                P('      HATA: ' + f)
            if fails:
                all_ok = False
        P('  önek bilgisi: ' + '; '.join(info))
        p15 = res[15][0]
        P('  15 dk pref payı (hedef − pref sessizliklerle toplam): %.1f sn → ikinci aşamanın ilk artımı (rank >= 500) '
          'bundan büyük olmalı, yoksa 15 dk planına girer' % (900 - p15['speech'] - p15['gaps']['pref']))
        P('  boş pay (min sessizliklerle): 3 dk %.1f sn (taban %g), 5 dk %.1f sn (taban %g)' % (
            slack[3], lesson['timingModel']['slackFloors']['3'], slack[5], lesson['timingModel']['slackFloors']['5']))
        P('')
    P('== Blok süreleri (sn; Giriş Varış\'a dahil) ve çapalar (PLAN.v3 §A.2: 3 dk 0:34/1:38/0:48; PLAN.v2 §B.4) ==')
    anc = lesson['skeleton30']['anchorsSec']
    for m in RELEASE:
        row = []
        for name, *_ in corners(lesson):
            p = allres[name][0][m][0]
            bs = block_secs(p)
            bs['A'] = bs.get('A', 0) + p['events'][0]['start']
            row.append('%s: %s' % (name, ' · '.join('%s %s' % (b, fmt_t(bs[b])) for b in ('A', 'C1', 'C2', 'C3', 'K')
                                                   if b in bs)))
        want = {3: 'A 0:34 · C1 1:38 · K 0:48'}.get(m) or ' · '.join('%s %s' % (b, fmt_t(s)) for b, s in anc[str(m)].items())
        P('  %2d dk  çapa: %s' % (m, want))
        for r in row:
            P('         ' + r)
    P('')
    P('== Blokların girdiği dakika (en küçük dakika) ==')
    for name, *_ in corners(lesson):
        res = allres[name][0]
        ent = {}
        for m in MINUTES:
            for b in res[m][0]['sel']:
                ent.setdefault(b, m)
        P('  %s: %s' % (name, ', '.join('%s %d dk' % (b, v) for b, v in ent.items())))
    P('')
    P('== "-(y)abil-" yoğunluğu (cümle klipleri; herhangi bir 60 sn\'de en çok 3; 3 dk Kapanış\'ta en çok 1) ==')
    for name, *_ in corners(lesson):
        for m in RELEASE:
            p = allres[name][0][m][0]
            n, w = abil_windows(p)
            nk = sum(T.n_abil(ev['clip']['text']) for ev in p['events'] if ev['block'] == 'K')
            P('  %s %2d dk: toplam %d, en yoğun 60 sn %d, Kapanış %d' % (name, m, n, w, nk))
    P('')
    P('== Evre başına ortalama cümle uzunluğu (hece/cümle; H12: Derin < Derinleşme < Varış), hoc köşesi ==')
    for m in RELEASE:
        me = T.phase_sentence_means(allres['hoc'][0][m][0])
        P('  %2d dk: %s' % (m, ', '.join('%s %.1f' % (k, me[k]) for k in ('Varış', 'Derinleşme', 'Derin', 'Kapanış')
                                         if k in me)))
    P('')
    P('== Tekrar uyarıları (pilot repetition_warnings; bilgi) ==')
    plans = [allres[n][0][m][0] for n in allres for m in MINUTES]
    reps = T.repetition_warnings(lesson, plans)
    for (a, b), ws in sorted(reps.items()):
        P('  %s → %s: %s' % (a, b, ', '.join(ws)))
    if not reps:
        P('  yok')
    P('')
    for name, *_ in corners(lesson):
        for m in RELEASE:
            p = allres[name][0][m][0]
            P('== Plan · %s · %d dk (toplam %.1f sn; konuşma %.1f sn; kip %s f=%.2f; giriş %.1f sn) ==' % (
                name, m, p['total'], p['speech'], p['mode'], p['f'], p['events'][0]['start']))
            P('    başlangıç blok  klip           konuşma   sonra  metin')
            plan_listing(p, P)
            P('')
    P('== Sarsıntı taraması (bütün klip süreleri × ölçek; hoc köşesi; bilgi) ==')
    name, rate, prof, sc0 = corners(lesson)[0]
    for sc in (0.90, 0.95, 1.05, 1.10):
        rp, _, _ = run_corner(lesson, name, rate, prof, sc0 * sc)
        bad = ['%d dk: %s' % (m, rp[m][1][0]) for m in MINUTES if rp[m][1]]
        P('  × %.2f: %d/%d dakika geçiyor%s' % (sc, len(MINUTES) - len(bad), len(MINUTES),
                                                ('; ilk hatalar: ' + ' | '.join(bad[:3])) if bad else ''))
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
    print('\n'.join([l for l in lines if l.startswith('  ') and ('KALDI' in l or 'HATA' in l)][:80]))
    print('\n'.join(lines[-8:]))
    return 0 if all_ok else 1


if __name__ == '__main__':
    sys.exit(main())
