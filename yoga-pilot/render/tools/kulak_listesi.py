#!/usr/bin/env python3
"""kulak_listesi.py — out/kulak_listesi.md: sahibin özellikle dinlemesi gereken yerler (dosya, mm:ss, birim, neden).
Kaynaklar: out/*.timeline.json, sel/<ses>/reprocess-v3.json, out/report.json, out/_onceki_v2/report.json,
out/scribe_v3_karsilastirma.json, seçim dosyaları. Model sesi dinleyemez: bu liste ölçüme dayanır, kulak kararı sahibindir."""
import json
import os
import re
import sys

R = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
OUT = R + '/out'
NAME = {'nes': 'Neslihan', 'hak': 'Hakan'}
sys.path.insert(0, R + '/tools')
import audio  # noqa: E402


def mmss(t):
    t = int(t)
    return '%02d:%02d' % (t // 60, t % 60)


def span(ps):
    return '%s–%s' % (mmss(ps[0]['start']), mmss(ps[-1]['end']))


def main():
    rep = json.load(open(OUT + '/report.json', encoding='utf-8'))
    old = json.load(open(OUT + '/_onceki_v2/report.json', encoding='utf-8'))
    sc = json.load(open(OUT + '/scribe_v3_karsilastirma.json', encoding='utf-8'))
    L = []
    a = L.append
    a('# Kulak listesi — Ders 2 · 15 dk pilot (v3)')
    a('')
    a('Model sesi dinleyemez. Aşağıdakilerin hepsi ölçümle bulundu; karar kulağındır. Zamanlar dakika:saniye, parçanın '
      'başladığı saniyedir. A ve B dosyalarında konuşma aynı yerdedir, yalnız müzik farklıdır. Bu yüzden her ses için tek '
      'zaman verildi; ikisinde de dinlenebilir.')
    a('')
    for v in ('nes', 'hak'):
        tls = {lab: json.load(open('%s/ders2-15dk-%s-%s.timeline.json' % (OUT, v, lab), encoding='utf-8')) for lab in 'AB'}
        sa = [(x['piece'], x['start']) for x in tls['A']['speech']]
        sb = [(x['piece'], x['start']) for x in tls['B']['speech']]
        if sa != sb:
            raise SystemExit('A ve B konuşma zamanları farklı: %s' % v)
        sp = tls['A']['speech']
        by_unit = {}
        for x in sp:
            by_unit.setdefault(x['unit'], []).append(x)
        by_piece = {x['piece']: x for x in sp}
        rp = json.load(open('%s/sel/%s/reprocess-v3.json' % (R, v), encoding='utf-8'))['pieces']
        a('## %s — `ders2-15dk-%s-A.mp3` ve `ders2-15dk-%s-B.mp3`' % (NAME[v], v, v))
        a('')
        a('| Zaman | Birim | Neden |')
        a('|---|---|---|')
        rows = []
        # 1) kesimler
        cuts = {
            'nes': {'n2.hatirla': 'Kural dışı kesim: en uzun duraklama ikinci cümlenin içinde ("şunu:" sonrası). Kesim cümle '
                                  'sınırından, ikinci en uzun duraklamadan yapıldı. İkinci parçanın başı doğal mı, önünde '
                                  'nefes ya da ses kesik mi?',
                    'n1.sec': 'Kuraldan sapan kesim: en uzun duraklama "önerim şu:" sonrasındaydı. Kesim cümle sonundan '
                              'yapıldı. İkinci parçanın başı doğal mı?'},
            'hak': {'n1.sec': 'Kesim kurala uygun, ama pay çok dar (1,009): cümle sonu ile "önerim şu:" duraklaması neredeyse '
                              'eşit. Kesim doğru yerde mi?',
                    'n2.hatirla': 'Kesim kurala uygun, ama pay dar (1,072): "şunu:" duraklaması cümle sonuna çok yakın. '
                                  'Kesim doğru yerde mi?'},
        }[v]
        for uid, why in cuts.items():
            ps = by_unit[uid]
            rows.append((ps[1]['start'], '%s (kesim %s)' % (mmss(ps[1]['start']), span(ps)), uid, why))
        # 2) Scribe ile harfi harfine eşleşmeyen klipler
        sc_units = {}
        for x in sc['newly_equal']:
            if x['voice'] == v and x['chosen']:
                sc_units[x['unit']] = x
        for uid, x in sc_units.items():
            ps = by_unit.get(uid)
            if not ps:
                continue
            e = x['exceptions'][0]
            ws = ' '.join(audio.normtext(x['scribe']))
            split = ' '.join(e['split'])
            scribe_form, text_form = (split, e['fused']) if (' ' + split + ' ') in (' ' + ws + ' ') else (e['fused'], split)
            rows.append((ps[0]['start'], span(ps), uid,
                         'Scribe "%s" yazdı, metinde "%s". Harfi harfine eşleşmedi; v3 istisnasıyla (%s) eş sayılıyor, '
                         'editör onayı bekliyor. "%s" doğru ve doğal vurguyla mı söyleniyor?' % (
                             scribe_form, text_form, e['rule'], text_form)))
        # 3) v2'de eşiğin altında kalan kısa parçalar (düzeltildi)
        was = {}
        for lab in 'AB':
            m = old['mixes']['ders2-15dk-%s-%s' % (v, lab)]
            for ph, d in m['speech_over_bed'].items():
                for pid, dur, diff in d['below_15_pieces']:
                    was.setdefault(pid, {})[lab] = diff
        now = {}
        for lab in 'AB':
            for x in rep['mixes']['ders2-15dk-%s-%s' % (v, lab)]['speech_over_bed_pieces']:
                now.setdefault(x['piece'], {})[lab] = x['diff']
        ducks = {d['piece']: d for lab in 'AB' for d in rep['mixes']['ders2-15dk-%s-%s' % (v, lab)].get('local_duck', {}).get('spans', [])}
        for pid, w in sorted(was.items(), key=lambda kv: by_piece[kv[0]]['start']):
            x = by_piece[pid]
            r = rp[pid]
            extra = []
            if r['v3'].get('short_level_capped'):
                extra.append('tepe payı yüzünden düzey %s LUFS\'te bırakıldı' % r['v3']['level'])
            if r['v3']['peak']['chain'] == 'soft+limiter':
                extra.append('yumuşak tepe sıkıştırma %s dB + sınırlayıcı %s dB (v2: sınırlayıcı %s dB)' % (
                    r['v3']['peak']['comp_gr_max_db'], r['v3']['limiter_max_db'], r['v2']['limiter_max_db']))
            if pid in ducks:
                d = ducks[pid]
                extra.append('altında yatak %s dB kısıldı (%s–%s)' % (d['depth_db'], mmss(d['t0']), mmss(d['t1'])))
            rows.append((x['start'], mmss(x['start']), '%s (%s)' % (x['unit'], pid),
                         'v2\'de konuşma yataktan yalnız %s dB yüksekti (eşik 15). Düzeltildi: %s → %s LUFS; şimdi %s dB. %s'
                         'Sözcük çevresindekilerle aynı yükseklikte mi, sesi ezik ya da boğuk mu?' % (
                             ' / '.join('%s %s' % (lab, w[lab]) for lab in 'AB' if lab in w), r['v2']['lufs'], r['v3']['lufs'],
                             ' / '.join('%s %s' % (lab, now[pid][lab]) for lab in 'AB'),
                             ('; '.join(extra) + '. ') if extra else '')))
        # 4) yerel yatak kısması (v2 listesinde olmayan parça)
        for pid, d in ducks.items():
            if pid in was:
                continue
            x = by_piece[pid]
            rows.append((d['t0'], '%s–%s' % (mmss(d['t0']), mmss(d['t1'])), '%s (%s)' % (x['unit'], pid),
                         'Yatak bu parçanın altında %s dB kısıldı (≤ 1 dB/sn rampa). Müzikte bir iniş-çıkış duyuluyor mu?'
                         % d['depth_db']))
        # 5) v3'te sınırlayıcısı hâlâ > 3 dB olan parçalar
        for pid, r in rp.items():
            if (r['v3']['limiter_max_db'] or 0) > 3.0 and pid in by_piece:
                x = by_piece[pid]
                rows.append((x['start'], mmss(x['start']), '%s (%s)' % (x['unit'], pid),
                             'Tepe yönetiminden sonra da sınırlayıcı %s dB kısıyor (v2: %s dB; yumuşak sıkıştırma %s dB). '
                             'Sözcük başı ezik ya da bozuk mu?' % (r['v3']['limiter_max_db'], r['v2']['limiter_max_db'],
                                                                  r['v3']['peak'].get('comp_gr_max_db'))))
        # 6) en güçlü yumuşak sıkıştırma (örnek dinleme)
        strong = sorted([(r['v3']['peak'].get('comp_gr_max_db') or 0, pid) for pid, r in rp.items()
                         if r['v3']['peak']['chain'] == 'soft+limiter' and pid in by_piece and pid not in was
                         and (r['v3']['limiter_max_db'] or 0) <= 3.0], reverse=True)[:4]
        for g, pid in strong:
            x = by_piece[pid]
            r = rp[pid]
            rows.append((x['start'], mmss(x['start']), '%s (%s)' % (x['unit'], pid),
                         'Örnek: yumuşak tepe sıkıştırmanın en güçlü olduğu parçalardan (%s dB; sınırlayıcı %s dB, v2\'de '
                         'yalnız sınırlayıcı %s dB). Ses doğal mı, "pompalama" var mı?' % (
                             g, r['v3']['limiter_max_db'], r['v2']['limiter_max_db'])))
        rows.sort(key=lambda r_: r_[0])
        for _, t, u, why in rows:
            why = re.sub(r'(?<![\w.])-0\.0+(?![\d])', '0', why)
            why = re.sub(r'(\d)\.(\d)', r'\1,\2', why)
            why = re.sub(r'(?<![\w])-(\d)', r'−\1', why)
            why = re.sub(r'\. ([a-zçğıöşü])', lambda m_: '. ' + m_.group(1).upper().replace('İ', 'İ'), why)
            a('| %s | %s | %s |' % (t, u, why))
        a('')
        n_ch = sum(1 for r in rp.values() if r['changed'])
        n_soft = sum(1 for r in rp.values() if r['v3']['peak']['chain'] == 'soft+limiter')
        a('Toplam: %d parçadan %d parça v3\'te yeniden işlendi (yumuşak tepe sıkıştırma %d parçada). Zaman çizelgesinde '
          '`v3-yeniden-islendi`, `v3-yumusak-tepe`, `v3-kisa-duzey`, `v3-yerel-kisma` bayraklarıyla işaretli. Öteki çok '
          'parçalı birimlerin kesimleri de yalnız ölçüyle denetlendi (`kesim-kulak` bayrağı); sayım ve beden taraması '
          'dizilerinde öğe sonları kesik ya da yapışık geliyorsa not al.' % (len(rp), n_ch, n_soft))
        a('')
    a('## Genel (iki ses, dört dosya)')
    a('')
    a('- Dönüş tınısı (k.donus\'tan 2 sn önce): tını ve düzey.')
    a('- İmge katmanı (c4.yer → c4.solma) ve doğa katmanı: düzey ve tını; yinelenen esinti.')
    a('- A/B kaynak ayrıntıları (`out/_ab_details.json`) dinlemeden sonra açılır.')
    a('')
    open(OUT + '/kulak_listesi.md', 'w', encoding='utf-8').write('\n'.join(L))
    print('\n'.join(L))
    return 0


if __name__ == '__main__':
    sys.exit(main())
