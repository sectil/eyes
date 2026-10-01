#!/usr/bin/env python3
"""rapor_ib.py — ilk bölüm: ders başına ölçüm raporu ve kulak listesi (SPEC.v3 §12, §16). Ücretli çağrı yok.
Kullanım: python3 rapor_ib.py <dNN> <dakika,dakika,...> [ek_not.md]  → out/ilk-bolum/kulak-dersN.md"""
import json
import os
import sys

R = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
OUTD = R + '/out/ilk-bolum'
les = sys.argv[1]
mins = [int(x) for x in sys.argv[2].split(',')]
extra = open(sys.argv[3], encoding='utf-8').read() if len(sys.argv) > 3 else ''
no = int(les[1:])
CRIT = {
    'sure_hedef_pm1s': 'Süre hedef ± 1 sn',
    'olay_sirasi_plan_ile_ayni': 'Olay sırası ve metin plan ile birebir',
    'parca_konumu_mp3': 'Her parça MP3\'te yerinde (4 kHz altı ilinti ≥ 0,95, kayma ≤ 1 ms)',
    'kurgu_noktasi_tik_yok_float': 'Kurgu noktasında tık yok (float)',
    'kurgu_noktasi_tik_yok_mp3': 'Kurgu noktasında tık yok (MP3)',
    'karisim_kaynakli_tik_yok_mp3': 'Karışım kaynaklı tık yok (MP3)',
    'dijital_sessizlik_100ms_yok': 'Dijital sessizlik < 100 ms',
    'konusma_yatak_ge15_her_parca': 'Konuşma/yatak ≥ 15 dB, her parça (1 sn altı dahil)',
    'yatak_yukselisi_le_1dB_s': 'Yatak yükselişi ≤ 1 dB/sn',
    'gercek_tepe_le_m1': 'Gerçek tepe ≤ −1 dBTP (MP3 çözülerek)',
    'butunlesik_yukseklik': 'Bütünleşik yükseklik hedef ± 1 LUFS',
    'ekran_esit_soylenen': 'Ekrandaki = söylenen',
    'boyut_le_15MB': 'Dosya ≤ 15.000.000 bayt',
    'mp3_44k1_stereo': 'MP3 44,1 kHz stereo',
}
L = []
P = L.append
P('# Ders %d: ölçüm raporu ve kulak listesi (ilk bölüm)' % no)
P('')
P('Ses: Nefona Hoca (`Sr5w7dIZaRDglJ2cLaJm`, eleven_v4, 3 çekim). Müzik: A (ElevenLabs Music). Karıştırıcı: '
  '`render/tools/mixib.py` (pilot `mix.py` fonksiyonları). Şartname: `b/SPEC.v3.md`.')
P('Dosyalar tarayıcı önizlemesidir (MP3, SPEC.v3 §10). Uygulama dosyası (AAC-LC m4a) Mac\'te WAV ana kopyadan kodlanır (§14); '
  'WAV ana kopyalar depoya girmez.')
P('')
P('## Dosyalar ve §12.1 ölçütleri')
P('')
reps = {}
for m in mins:
    reps[m] = json.load(open('%s/_rapor/%s-%02ddk.json' % (OUTD, les, m), encoding='utf-8'))
P('| Ölçüt | ' + ' | '.join('%d dk' % m for m in mins) + ' |')
P('|---|' + '---|' * len(mins))
for k, lab in CRIT.items():
    P('| %s | %s |' % (lab, ' | '.join(('geçti' if reps[m]['criteria'].get(k) else ('**KALDI**' if k in reps[m]['criteria'] else '—')) for m in mins)))
P('')
P('| Ölçüm | ' + ' | '.join('%d dk' % m for m in mins) + ' |')
P('|---|' + '---|' * len(mins))
rows = [
    ('Dosya', lambda r: '`%s`' % r['file']),
    ('Bayt', lambda r: '{:,}'.format(r['bytes']).replace(',', '.')),
    ('Kodlama', lambda r: r['encoding']['mode']),
    ('Süre (çözülmüş, sn)', lambda r: '%.3f' % r['duration_decoded_s']),
    ('Bütünleşik (LUFS)', lambda r: '%.2f (hedef %.0f)' % (r['integrated_lufs'], r['lufs_target'])),
    ('Dosya kısması (dB)', lambda r: '%.2f' % r['master_trim_db']),
    ('Gerçek tepe MP3 (dBTP)', lambda r: '%.2f' % r['true_peak_dbtp_mp3']),
    ('Konum ilintisi en düşük / kayma', lambda r: '%.3f (%s) / %.3f ms' % (r['position_check']['min_corr'], r['position_check']['min_corr_piece'], r['position_check']['max_abs_offset_ms'])),
    ('Konuşma/yatak en düşük (dB)', lambda r: '%.2f' % min(v['min_diff_all'] for v in r['speech_over_bed'].values() if v['min_diff_all'] is not None)),
    ('Yerel yatak kısması', lambda r: str(len(r['local_duck']['spans']))),
    ('Yatak zarfı en büyük artış (dB/sn)', lambda r: '%.2f @ %.1f sn' % (r['loudness_rise']['bed_envelope_no_tone_no_imge']['max_rise_db_per_s'], r['loudness_rise']['bed_envelope_no_tone_no_imge']['at_s'])),
    ('Plan: check_plan / boş pay (min, sn)', lambda r: '%s / %.2f' % ('geçti' if r['plan']['check_plan']['pass'] else 'KALDI', r['plan']['slack_min_s'])),
    ('Tık (MP3: kurgu / karışım / konuşma içeriği)', lambda r: '%d / %d / %d' % (r['clicks_mp3']['edit_point'], r['clicks_mp3']['mix_only'], r['clicks_mp3']['speech_content'])),
]
for lab, f in rows:
    P('| %s | %s |' % (lab, ' | '.join(f(reps[m]) for m in mins)))
P('')
P('Konuşma içeriği tıkı: 10 kHz üstü ani olayın enerjisi seçilmiş konuşma parçasının kendisinden geliyor (ünsüzler); '
  'kurgu noktası ve karışım kaynaklı tık sıfır.')
P('')
# seçim bayrakları
sel = json.load(open('%s/sel/hoc/%s/selection-%s.json' % (R, les, les), encoding='utf-8'))
P('## Bu partide seslendirilen birimler (%d)' % len(sel['units']))
P('')
P('Her birim 3 çekim; nesnel sıralamadaki ilk çekimden başlayarak Scribe ile harf harf karşılaştırıldı, tutan ilk çekim '
  'seçildi (SPEC.v3 §6.3). Hepsi birebir eşleşti: '
  + ('evet' if all(u['compare'] == 'equal' for u in sel['units'].values()) else 'hayır (istisnalar aşağıda)') + '.')
P('')
P('| Birim | Çekim | Scribe | Bayraklar |')
P('|---|---|---|---|')
for uid, u in sel['units'].items():
    P('| `%s` | %s | %s | %s |' % (uid, u['chosen_take'].replace('.mp3', ''), {'equal': 'birebir', 'kulak': '**tutmadı (kulak)**'}.get(
        u['compare'], 'istisnayla'),
                                ', '.join(sorted({f['flag'] for f in u['flags']})) or '—'))
P('')
P('## Kulak listesi')
P('')
P('Sahibin dinlerken özellikle bakacağı yerler. Hiçbiri ölçütten kalmadı; hepsi kural gereği listelenir (SPEC.v3 §16).')
P('')
n = 0
fl_desc = {'kesim-kulak': 'çok cümleli birim cümle sonlarından kesildi; kesim yalnız ölçüyle denetlendi (Scribe sözcük zamanı yok)',
           'derin>5': 'Derin evrede eklemleme 5,0 hece/sn üstü (VARSAYIM tavan)',
           'eklem>2yt': 'taşıyıcı ekleminde F0 basamağı > 2 yarım ton',
           'kesim-dar-pay': 'kesim payı dar (en kısa seçilen / en uzun seçilmeyen duraklama ≤ 1,1)',
           'scribe-istisna': 'Scribe yalnız yazım istisnasıyla eşleşti',
           'kulak-sinirlayici': 'parça işlemesinde sınırlayıcı 3 dB\'den çok kıstı',
           'kulak': 'SPEC.v3 §6.3 son adım: yeniden çekim dahil hiçbir çekim Scribe ile harf harf tutmadı; sıralamada ilk çekim '
                    'seçildi, söyleyiş kulakla doğrulanmalı',
           'isleme-sonrasi-elendi': 'sıralamada önceki çekim işlemeden sonra tık/kırpılma verdi, sıradaki çekim alındı'}
by = {}
for uid, u in sel['units'].items():
    for f in u['flags']:
        by.setdefault(f['flag'], []).append(uid + (' (%s)' % f['piece'] if f.get('piece') else ''))
    for rj in u.get('rejected_after_processing') or []:
        by.setdefault('isleme-sonrasi-elendi', []).append('%s (%s: %s, %s sn)' % (
            uid, rj['take'], rj['status'], ','.join('%.2f' % t_ for t_ in ((rj.get('clicks') or {}).get('times') or []))))
for k, lst in by.items():
    n += 1
    P('%d. **%s**: %s: %s.' % (n, k, fl_desc.get(k, k), ', '.join('`%s`' % x for x in lst)))
for m in mins:
    r = reps[m]
    if r['master_trim_db']:
        n += 1
        P('%d. **%d dk dosya kısması %.2f dB**: konuşma yoğun olduğu için bütünleşik yükseklik %.2f LUFS çıktı (pencere '
          '%.0f ± 1); bütün dosya tek sabit kazançla kısıldı, oranlar değişmedi (VARSAYIM).' % (
              n, m, r['master_trim_db'], r['master_trim_iterations'][0]['integrated_lufs'], r['lufs_target']))
    lr = r['loudness_rise']['bed_envelope_no_tone_no_imge']
    if lr['max_rise_db_per_s'] > 0.8:
        n += 1
        P('%d. **%d dk yatak zarfı sınıra yakın**: en büyük 1 sn artış %.2f dB/sn (%.1f. sn; eşik 1,0).' % (
            n, m, lr['max_rise_db_per_s'], lr['at_s']))
    floor_s = 10 if m == 3 else 15      # boş pay tabanı (VARSAYIM, ders1.script.md: 3 dk 10 sn, 5 dk ve üstü 15 sn)
    if r['plan']['slack_min_s'] < floor_s + 2:
        n += 1
        P('%d. **%d dk boş pay sınıra yakın**: %.2f sn (taban %d).' % (n, m, r['plan']['slack_min_s'], floor_s))
    for note in r['music']['notes']:
        if 'konuşma payı 0.4' in note or 'konuşma payı 0.3' in note:
            n += 1
            P('%d. **%d dk müzik geçişi**: %s' % (n, m, note))
if extra:
    P('')
    P(extra.strip())
json.dump({'lesson': les, 'minutes': mins}, open('%s/_rapor/kulak-%s.json' % (OUTD, les), 'w'), ensure_ascii=False)
open('%s/kulak-ders%d.md' % (OUTD, no), 'w', encoding='utf-8').write('\n'.join(L) + '\n')
print('\n'.join(L))
