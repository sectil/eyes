#!/usr/bin/env python3
"""report_md_hoc.py — out/report.md'nin sonuna "hoc" (Nefona Hoca) bölümünü ekler; nes/hak bölümleri olduğu gibi kalır
(önceki hâl: out/_onceki_hoc_oncesi/report.md). Kaynak: out/report-hoc.json, out/plan-hoc.json, ledger.jsonl."""
import json

R = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
OUT = R + '/out'
PHASES = ['Varış', 'Derinleşme', 'Derin', 'Kapanış']
MARK = '## hoc — Nefona Hoca (üçüncü ses'


def main():
    rep = json.load(open(OUT + '/report-hoc.json', encoding='utf-8'))
    rows = [json.loads(l) for l in open(R + '/ledger.jsonl', encoding='utf-8') if l.strip()]
    hoc = [x for x in rows if x.get('voice') == 'hoc']
    cr = {}
    for x in hoc:
        cr[x.get('kind')] = cr.get(x.get('kind'), 0.0) + float(x.get('credits_est') or 0)
    last = max((x.get('workflow_credits_after') or 0) for x in hoc) if hoc else None
    L = []
    a = L.append
    a('')
    a('%s; PLAN.v3 §F "A" satırı, karar 1–2)' % MARK)
    a('')
    a('Üretim: `%s` (tools/mix.py değiştirilmeden içe aktarıldı; yamalar: ses kaydı, konum denetimi v3.6, raporun nes/hak '
      'bölümünü ezmemesi) · %s. Ses `Sr5w7dIZaRDglJ2cLaJm`, cinsiyet parametresi m, eleven_v4, akış zAYOhRc6cOKeStKp4ijv. '
      'Metin units.json "tts" aynen (kör karşılaştırma istisnası: pilot metni incelemeden önce okutuldu). A/B müzik eşlemesi '
      '`out/_ab_key.json` ile aynı; doğa/oda sırası tohumu aynı (20260929).' % (rep['tool'], rep['generated_utc']))
    a('')
    a('Parçalar: seçim ajanları 158 parçanın hepsini v3 kuralıyla işledi (`sel/hoc/selection-hoc-1.json`, `-2.json`). '
      '`sel/hoc/reprocess-v3.json` mix.py girdisi olarak `reprocess_v3` ile kuruldu: 158/158 parça seçim dosyasıyla örnek '
      'örnek aynı (değişen 0, yumuşak tepe sıkıştırma 0, sınırlayıcı > 3 dB 0, < 1 sn parça 27, hepsi LUFS yolunda).')
    a('')
    p = rep['plans']['hoc']
    cp = p['check_plan']
    d = cp['density']
    a('**Plan (check_plan):** durum %s, esneme %s f=%s, toplam %s sn, konuşma %s sn, %s olay / %s parça, bloklar %s, duruş %s; '
      'check_plan %s. Yoğunluk: 60 sn en çok %s hece, konuşma payı %s; Derin %s hece / %s; ortalama %s hece/dk; eksik birim: %s.' % (
          p['status'], p['mode'], p['f'], p['total'], p['speech_sec'], p['n_events'], p['n_speech_pieces'], ' '.join(p['sel']),
          p['stop'], 'GEÇTİ (0 hata)' if cp['pass'] else 'HATA: ' + '; '.join(cp['fails']), d.get('syll'), d.get('frac'),
          d.get('deep_syll'), d.get('deep_frac'), d.get('avg'), p['units_missing'] or 'yok'))
    a('')
    a('| Dosya | Süre sn | Boyut MB | Kodlama | Bütünleşik LUFS | Gerçek tepe dBTP (sınırlayıcı öncesi) | Karışım sınırlayıcısı en çok dB | 10 kHz üstü ani olay MP3: kurgu / yalnız karışım / yatak / söz | En uzun dijital sessizlik |')
    a('|---|---|---|---|---|---|---|---|---|')
    for n, m in rep['mixes'].items():
        c = m['clicks_mp3']
        a('| %s.mp3 | %s | %.2f | %s (%s kbit/s) | %s | %s (%s) | %s | %d / %d / %d / %d | %s sn |' % (
            n, m['duration_s'], m['bytes'] / 1e6, m['encoding']['mode'], m['encoding']['kbps_avg'], m['integrated_lufs'],
            m['true_peak_dbtp'], m['true_peak_dbtp_before_limiter'], m['tp_limiter'][-1]['limiter']['max_reduction_db'],
            c['edit_point'], c['mix_only'], c['bed_content'], c['speech_content'], m['digital_silence_mp3']['longest_run_s']))
    a('')
    a('**Konuşma / yatak** (parçanın BS.1770 kapılı yüksekliği − parça boyunca yatağın 3 sn ST en yükseği; eşik ≥ 15 dB, '
      'v3.4: < 1 sn parçalar dahil):')
    a('')
    a('| Dosya | ≥ 1 sn: Varış | Derinleşme | Derin | Kapanış | Bütün parçalar en az dB (< 15 sayısı) | Yatak ofseti (dB) | Yerel yatak kısması |')
    a('|---|---|---|---|---|---|---|---|')
    for n, m in rep['mixes'].items():
        s = m['speech_over_bed']
        cells = ['%s / %s / %s %s' % (s[ph]['min_diff_ge_1s'], s[ph]['p10_diff_ge_1s'], s[ph]['median_diff_ge_1s'],
                                      'GEÇTİ' if s[ph]['pass_ge_1s'] else 'KALDI') for ph in PHASES]
        allp = '; '.join('%s %s (%d)' % (ph[:3], s[ph]['min_diff_all'], s[ph]['n_below_15_all']) for ph in PHASES)
        off = ', '.join('%s %s' % (ph[:3], m['bed_offset_vs_duckedBedLufs_db'][ph]) for ph in PHASES)
        ld = '; '.join('%s −%s dB (%s–%s sn)' % (x['piece'], x['depth_db'], x['t0'], x['t1'])
                       for x in m['local_duck']['spans']) or 'yok'
        a('| %s | %s | %s | %s | %s |' % (n, ' | '.join(cells), allp, off, ld))
    a('')
    for n, m in rep['mixes'].items():
        lst = [x for ph in PHASES for x in m['speech_over_bed'][ph]['below_15_pieces']]
        n_all = sum(m['speech_over_bed'][ph]['pieces_all'] for ph in PHASES)
        short = [x for x in m['speech_over_bed_pieces'] if x['dur'] < 1.0]
        a('- %s: %d parça ölçüldü (%d tanesi < 1 sn; < 1 sn en düşük fark %s dB); eşik altı: %s' % (
            n, n_all, len(short), min(x['diff'] for x in short) if short else '—',
            ', '.join('%s (%s sn, %s dB)' % tuple(x) for x in lst) if lst else 'yok'))
    a('')
    a('**Konum denetimi (SPEC v3.5 + v3.6):** kod çözülmüş MP3 orta kanalı ve parça 4 kHz altına süzüldü (8. derece '
      'Butterworth, sıfır faz), ±50 ms içinde ilinti; eşik 0,95 (VARSAYIM), kayma ≤ 1 ms. Karşılaştırma için süzgeçsiz değer '
      'de yazıldı (nes/hak satırlarının pilottaki ölçüsü süzgeçsizdi).')
    a('')
    for n, m in rep['mixes'].items():
        pc = m['position_check_mp3']
        u = pc['unfiltered_for_reference']
        a('- %s: %d parça; 4 kHz: en düşük ilinti %s (%s), ortanca %s, en büyük kayma %s ms, < 0,95: %d → %s. Süzgeçsiz: en '
          'düşük %s (%s), ortanca %s, < 0,95: %d.' % (n, pc['pieces'], pc['min_corr'], pc['min_corr_piece'], pc['median_corr'],
                                                      pc['max_abs_offset_ms'], pc['n_corr_below_0_95'],
                                                      'GEÇTİ' if pc['v3_ok'] else 'KALDI', u['min_corr'], u['min_corr_piece'],
                                                      u['median_corr'], u['n_corr_below_0_95']))
    a('')
    a('**Yükseklik artışı** (3 sn ST, 1 sn adım): ' + '; '.join(
        '%s yatak en çok %s dB/sn (%s sn), tınısız yatak %s (> 1 dB/sn adım %s), yalnız müzik %s (%s)' % (
            n, m['loudness_rise']['bed_stem']['max_rise_db_per_s'], m['loudness_rise']['bed_stem']['at_s'],
            m['loudness_rise']['bed_stem_without_tone']['max_rise_db_per_s'],
            m['loudness_rise']['bed_stem_without_tone']['n_1s_steps_over_1db'],
            m['loudness_rise']['music_stem']['max_rise_db_per_s'], m['loudness_rise']['music_stem']['n_1s_steps_over_1db'])
        for n, m in rep['mixes'].items()))
    a('')
    a('**Doku değişimleri** (8 sn; pencerede konuşma payı): ' + ' · '.join(
        '%s: %s' % (n, '; '.join('%s %s–%s (%s)' % (x['what'], x['t0'], x['t1'], x['speech_cover']) for x in m['texture_changes']))
        for n, m in rep['mixes'].items()))
    a('')
    a('**Evre başına ölçülen yatak** (3 sn ST ortancası, LUFS, toplam / müzik / doğa): ' + ' · '.join(
        '%s: %s' % (n, '; '.join('%s %s / %s / %s' % (ph[:3], m['bed_measured_st3_median_by_phase'][ph]['bg_total'],
                                                     m['bed_measured_st3_median_by_phase'][ph]['music'],
                                                     m['bed_measured_st3_median_by_phase'][ph]['nature']) for ph in PHASES))
        for n, m in rep['mixes'].items()))
    a('')
    a('**SPEC §7 + v3 bitti ölçütleri (hoc):**')
    a('')
    names = list(rep['done_criteria'])
    a('| Ölçüt | ' + ' | '.join(names) + ' |')
    a('|---|' + '---|' * len(names))
    for k in rep['done_criteria'][names[0]]:
        a('| %s | %s |' % (k, ' | '.join(str(rep['done_criteria'][n][k]) for n in names)))
    a('')
    a('`full_mix_scribe_alignment = None`: yapılmadı (SPEC v3.5; yerine konum denetimi).')
    a('')
    oc = {n: m['order_check'] for n, m in rep['mixes'].items()}
    a('Sıra denetimi: ' + '; '.join('%s plan %d / çizelge %d parça, aynı sıra ve metin %s, çift %d, ekran = söylenen %s' % (
        n, o['plan_pieces'], o['timeline_pieces'], o['same_order_and_text'], o['duplicates'], o['screen_equals_spoken_all'])
        for n, o in oc.items()))
    a('')
    f = rep['selection_flags']['hoc']
    a('**Seçim bayrakları (hoc):** sayılar %s. Kesim yalnız ölçüyle: %d birim. Taşıyıcı eklem > 2 yt: %s.' % (
        f['counts'], len(f['kesim_kulak_units']), ', '.join(f['eklem_gt_2st_units'])))
    for x in f['other_flags']:
        a('- %s: %s%s — %s' % (x.get('flag'), x['unit'], '' if x['in_plan'] else ' (planda yok)', (x['reason'] or '')[:220]))
    a('')
    a('**Maliyet (hoc, defter):** konuşma %.1f kredi + Scribe %.1f kredi = %.1f kredi; iş akışı sayacı %s / 20.000 kredi. '
      'Karışım ve kör paket adımında ücretli çağrı: 0 (deftere satır yazılmadı).' % (
          cr.get('speech', 0), cr.get('scribe-speech', 0), sum(cr.values()), last))
    a('')
    a('**Doğrulanmayanlar (hoc):** kulakla dinleme yapılmadı; bütün ifadeler ölçümdür. Kesimler yalnız ölçüyle denetlendi '
      '(Scribe sözcük zaman damgası yok, yerel yükleme aracı yok). Scribe v3.2 istisnalarıyla eşleşen 5 birim editör onayı '
      'bekliyor. Zamanlı kulak listesi: `out/kulak_listesi.md` "Nefona Hoca" bölümü. Kör paket: `out/kor/`.')
    a('')
    txt = open(OUT + '/report.md', encoding='utf-8').read()
    if MARK in txt:
        raise SystemExit('hoc bölümü zaten var')
    open(OUT + '/report.md', 'w', encoding='utf-8').write(txt.rstrip('\n') + '\n' + '\n'.join(L))
    print('\n'.join(L))


if __name__ == '__main__':
    main()
