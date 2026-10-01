#!/usr/bin/env python3
"""kulak_hoc.py — out/kulak_listesi.md'ye "Nefona Hoca" bölümünü ekler (nes/hak bölümlerine dokunmaz; önceki hâli
out/_onceki_hoc_oncesi/kulak_listesi.md). Kaynak: hoc zaman çizelgeleri, seçim dosyaları, report-hoc.json.
Model sesi dinleyemez: satırların hepsi ölçüm ya da seçim bayrağıdır; karar sahibin kulağındır."""
import json
import re

R = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
OUT = R + '/out'
V = 'hoc'
MARK = '## Nefona Hoca — '


def mmss(t):
    t = int(t)
    return '%02d:%02d' % (t // 60, t % 60)


def span(ps):
    return '%s–%s' % (mmss(ps[0]['start']), mmss(ps[-1]['end']))


def tr(s):
    s = re.sub(r'(\d)\.(\d)', r'\1,\2', s)
    s = re.sub(r'(?<![\w])-(\d)', r'−\1', s)
    return s


def main():
    tls = {lab: json.load(open('%s/ders2-15dk-%s-%s.timeline.json' % (OUT, V, lab), encoding='utf-8')) for lab in 'AB'}
    if [(x['piece'], x['start']) for x in tls['A']['speech']] != [(x['piece'], x['start']) for x in tls['B']['speech']]:
        raise SystemExit('A ve B konuşma zamanları farklı')
    sp = tls['A']['speech']
    by_unit, by_piece = {}, {x['piece']: x for x in sp}
    for x in sp:
        by_unit.setdefault(x['unit'], []).append(x)
    rep = json.load(open(OUT + '/report-hoc.json', encoding='utf-8'))
    units = {}
    for p in (1, 2):
        units.update(json.load(open('%s/sel/hoc/selection-hoc-%d.json' % (R, p), encoding='utf-8'))['units'])
    s2 = json.load(open('%s/sel/hoc/selection-hoc-2.json' % R, encoding='utf-8'))
    s2flags = {}
    for f in s2['summary']['flags']:
        s2flags.setdefault(f['unit'], []).append(f)
    rows, not_in_plan = [], []

    def add(uid, t, when, why):
        if uid not in by_unit:
            not_in_plan.append(uid)
            return
        rows.append((t, when, uid, why))

    # 1) kesimler
    u = 'n1.sec'
    if u in by_unit:
        ps = by_unit[u]
        add(u, ps[1]['start'], '%s (kesim %s)' % (mmss(ps[1]['start']), span(ps)),
            'Kural dışı kesim (v3.1): üç çekimde de en uzun duraklama "önerim şu:" sonrasındaydı (kural kesimi hizasızlık '
            '0.308). Kesim cümle sonundaki duraklamadan yapıldı (hizasızlık 0.000, hızlar 5.39 / 5.55 hece/sn). İkinci '
            'parçanın başı doğal mı, ses kesik mi?')
    u = 'n2.hatirla'
    if u in by_unit:
        ps = by_unit[u]
        add(u, ps[1]['start'], '%s (kesim %s)' % (mmss(ps[1]['start']), span(ps)),
            'Kesim kurala uygun ve cümle sınırında (hizasızlık 0.046), ama pay çok dar (1.025): "şunu:" duraklaması cümle '
            'sonuna neredeyse eşit. Kesim doğru yerde mi, ikinci parçanın başı doğal mı?')
    # 2) Scribe yazım istisnasıyla eşleşenler
    for uid, e in units.items():
        fl = [f for f in (e.get('flags') or []) if isinstance(f, dict) and f.get('flag') == 'scribe-istisna']
        fl += [f for f in s2flags.get(uid, []) if f['flag'] == 'kulak-scribe-istisna']
        if not fl or uid not in by_unit:
            if fl:
                not_in_plan.append(uid)
            continue
        m = re.search(r'"fused": "([^"]+)", "split": \[([^\]]+)\]', fl[0]['reason'] or '')
        if m:
            fused, split = m.group(1), ' '.join(x.strip().strip('"') for x in m.group(2).split(','))
        else:
            m2 = re.search(r'"([^"]+)" = "([^"]+)"', fl[0]['reason'] or '')
            fused, split = (m2.group(1), m2.group(2)) if m2 else ('?', '?')
        ps = by_unit[uid]
        add(uid, ps[0]['start'], span(ps),
            'Scribe "%s" yazdı, metinde "%s". Harfi harfine eşleşmedi; v3.2 istisnasıyla eş sayılıyor, editör onayı '
            'bekliyor. "%s" doğru ve doğal vurguyla mı söyleniyor?' % (split, fused, fused))
    # 3) taşıyıcı eklemleri
    for f in s2flags.get('car.sayi', []):
        if f['flag'] == 'kulak-eklem' and 'car.sayi' in by_unit:
            ps = by_unit['car.sayi']
            add('car.sayi', ps[0]['start'], span(ps),
                'Sayım dizisinde perde sıçraması (taşıyıcı eklemi > 2 yt): n09→n08 3.29, n03→n02 4.32, n02→n01 −5.61 yt; '
                '"iki" ≈ 129 Hz, öteki sayılar ≈ 76–99 Hz. Üç çekimin hepsi aşıyordu. "iki" dizinin dışında mı duyuluyor?')
    car_units = [uid for uid, e in units.items() if e.get('kind') == 'carrier' and uid != 'car.sayi' and uid in by_unit]
    joins = []
    for uid in car_units:
        e = units[uid]
        j = e.get('join_max_st')
        if j is None:
            j = (e.get('chosen_rank') or {}).get('join_max_st')
        joins.append((uid, j))
    if car_units:
        t0 = min(by_unit[u][0]['start'] for u in car_units)
        t1 = max(by_unit[u][-1]['end'] for u in car_units)
        jj = [j for _, j in joins if j is not None]
        add(car_units[0], t0, '%s–%s' % (mmss(t0), mmss(t1)),
            'Beden taraması dizileri (%s): taşıyıcı eklem perde farkı en çok %s–%s yt (eşik 2 yt; seçimde yumuşak ihlal, '
            'eleme değil) ve öğe hızı 3.2–4.7 hece/sn (bant 5.0–6.2 altı). Öğeler tek tek yapıştırılmış gibi mi, perde '
            'iniş çıkışı rahatsız ediyor mu, tempo çok mu yavaş?' % (
                ', '.join(car_units), ('%.2f' % min(jj)) if jj else '?', ('%.2f' % max(jj)) if jj else '?'))
    # 4) kenar basamağı
    for uid, fl in s2flags.items():
        for f in fl:
            if f['flag'] == 'kulak-kenar':
                ps = by_unit.get(uid)
                if not ps:
                    not_in_plan.append(uid)
                    continue
                m = re.search(r'baş (-?[\d.]+) / son (-?[\d.]+)', f['reason'])
                add(uid, ps[0]['start'], mmss(ps[0]['start']),
                    'Parçanın başında veri kenarı basamağı (baş %s dBFS, eşik −60; ölçüyle tık yok). Sözün ilk anında tık '
                    'ya da kesik başlangıç var mı?' % (m.group(1) if m else '?'))
            if f['flag'] == 'kulak-tonlama':
                ps = by_unit.get(uid)
                if ps:
                    add(uid, ps[0]['start'], span(ps),
                        'Scribe cümleyi soru işaretiyle yazdı ("hatırlıyorsun?"); sözcükler birebir. Ezgi bildirme mi, soru mu?')
                else:
                    not_in_plan.append(uid)
    # 5) Derin tavanı aşımı (VARSAYIM 5,0 hece/sn)
    der = []
    for x in (s2['summary'].get('derin_ceiling_reports') or []):
        der.append((x['unit'], x['articulation']))
    for uid, e in units.items():
        for n in (e.get('notes') or []):
            m = re.search(r'Derin tavanı aşıldı: ([\d.]+)', n)
            if m:
                der.append((uid, float(m.group(1))))
    der = [(u_, a_) for u_, a_ in der if u_ in by_unit]
    for u_, a_ in sorted(der, key=lambda z: -z[1])[:3]:
        ps = by_unit[u_]
        add(u_, ps[0]['start'], span(ps),
            'Derin evrede hız %.2f hece/sn (tavan 5.0, VARSAYIM; raporlanır, eleme değil). Bu evre için aceleci mi?' % a_)
    # 6) yerel yatak kısması
    ducks = {}
    for n, m in rep['mixes'].items():
        for d in (m.get('local_duck') or {}).get('spans', []):
            ducks[d['piece']] = d
    for pid, d in ducks.items():
        x = by_piece[pid]
        add(x['unit'], d['t0'], '%s–%s' % (mmss(d['t0']), mmss(d['t1'])),
            'Yatak bu parçanın (%s) altında %s dB kısıldı (≤ 1 dB/sn rampa; A ve B ortak). Müzikte iniş-çıkış duyuluyor mu?'
            % (pid, d['depth_db']))
    # 7) en düşük konuşma/yatak farkı (örnek)
    worst = []
    for n, m in rep['mixes'].items():
        for x in m['speech_over_bed_pieces']:
            if x['diff'] is not None:
                worst.append((x['diff'], n[-1], x['piece']))
    worst.sort()
    seen = set()
    for d_, lab, pid in worst:
        if pid in seen or pid in ducks:
            continue
        seen.add(pid)
        x = by_piece[pid]
        add(x['unit'], x['start'], mmss(x['start']),
            'Örnek: konuşma/yatak farkının en düşük olduğu parçalardan (%s, %s: %s dB; eşik 15). Söz müziğin içinde net '
            'anlaşılıyor mu?' % (pid, lab, d_))
        if len(seen) >= 2:
            break
    rows.sort(key=lambda r_: r_[0])
    L = []
    a = L.append
    a('%s`ders2-15dk-hoc-A.mp3` ve `ders2-15dk-hoc-B.mp3`' % MARK)
    a('')
    a('Üçüncü ses (PLAN.v3 §F "A" satırı, karar 1–2). Metin units.json "tts" aynen; kör karşılaştırma için pilot metni '
      'incelemeden önce okutuldu. İki nokta (`:`) içeren iki birim (n1.sec, n2.hatirla) bu yüzden aynı sorunu taşıyor.')
    a('')
    a('| Zaman | Birim | Neden |')
    a('|---|---|---|')
    for _, t, u_, why in rows:
        a('| %s | %s | %s |' % (t, u_, tr(why)))
    a('')
    sf_ = rep['selection_flags'][V]
    a('Toplam: 158 parça, hepsi seçimde v3 kuralıyla işlendi (yeniden işleme gerekmedi; yumuşak tepe sıkıştırma 0, '
      'sınırlayıcı > 3 dB 0, kısa parça 27, hepsi LUFS yolunda). Kesimleri yalnız ölçüyle denetlenen %d birim (`kesim-kulak`): '
      '%s. Sayım ve beden taraması dizilerinde öğe sonları kesik ya da yapışık geliyorsa not al.' % (
          len(sf_['kesim_kulak_units']), ', '.join(sf_['kesim_kulak_units'])))
    if not_in_plan:
        a('')
        a('Bayraklı ama 15 dk planında çalmayan birimler (dinlenmez): %s.' % ', '.join(sorted(set(not_in_plan))))
    a('')
    txt = open(OUT + '/kulak_listesi.md', encoding='utf-8').read()
    if MARK in txt:
        raise SystemExit('hoc bölümü zaten var')
    gen = '## Genel ('
    i = txt.find(gen)
    block = '\n'.join(L) + '\n'
    txt = (txt[:i] + block + txt[i:]) if i >= 0 else (txt.rstrip('\n') + '\n\n' + block)
    txt = txt.replace('## Genel (iki ses, dört dosya)', '## Genel (üç ses, altı dosya)')
    open(OUT + '/kulak_listesi.md', 'w', encoding='utf-8').write(txt)
    print(block)
    print('rows', len(rows), 'not_in_plan', sorted(set(not_in_plan)))


if __name__ == '__main__':
    main()
