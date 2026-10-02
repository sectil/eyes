#!/usr/bin/env python3
"""kor_paket.py — out/kor/: altı karışımın (nes, hak, hoc × A, B) ses adı taşımayan kopyaları + BENI_OKU.md.
Anahtar PAKETİN DIŞINDA: out/_kor_anahtar.json (düzeltici 1: anahtar kör klasörde durursa test kör değildir; SPEC §6).

Atama kuralı (sabit bir sıra değil): her sesin kısa adının (nes, hak, hoc) UTF-8 baytlarının SHA-256 özeti hesaplanır;
özetler onaltılık dizge olarak küçükten büyüğe dizilir; sıradaki ilk ses "ses1", ikinci "ses2", üçüncü "ses3" olur.
Denetim: tam adlarla (Neslihan, Hakan, Nefona Hoca) da aynı hesap yapılır ve anahtara yazılır.
A/B harfleri değişmez (out/_ab_key.json; müzik eşlemesi üç seste aynı). Timeline dosyaları kopyalanmaz.
Kopyalar bayt bayt aynıdır (SHA-256 ile denetlenir); MP3 etiketinde ses adı olmadığı ayrıca denetlenir.
"""
import datetime
import hashlib
import json
import os
import shutil

R = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
OUT = R + '/out'
K = OUT + '/kor'
KEY = OUT + '/_kor_anahtar.json'  # paket dışı
ALLOWED = {'BENI_OKU.md'} | {'ders2-15dk-ses%d-%s.mp3' % (i, l) for i in (1, 2, 3) for l in 'AB'}
SHORT = {'nes': 'Neslihan', 'hak': 'Hakan', 'hoc': 'Nefona Hoca'}


def sha(b):
    return hashlib.sha256(b).hexdigest()


def main():
    os.makedirs(K, exist_ok=True)
    dig = {v: sha(v.encode('utf-8')) for v in SHORT}
    order = sorted(SHORT, key=lambda v: dig[v])
    dig_full = {v: sha(n.encode('utf-8')) for v, n in SHORT.items()}
    order_full = sorted(SHORT, key=lambda v: dig_full[v])
    ab = json.load(open(OUT + '/_ab_key.json', encoding='utf-8'))
    files = []
    for i, v in enumerate(order, 1):
        for lab in 'AB':
            src = '%s/ders2-15dk-%s-%s.mp3' % (OUT, v, lab)
            dst = '%s/ders2-15dk-ses%d-%s.mp3' % (K, i, lab)
            shutil.copyfile(src, dst)
            b_src, b_dst = open(src, 'rb').read(), open(dst, 'rb').read()
            assert sha(b_src) == sha(b_dst)
            head = b_dst[:4096] + b_dst[-4096:]
            leak = [w for w in list(SHORT) + list(SHORT.values()) + ['voice', 'ses:'] if w.encode('utf-8') in head]
            files.append({'blind': os.path.basename(dst), 'voice': v, 'voice_name': SHORT[v], 'music_letter': lab,
                          'music_source': ab[lab], 'source_file': src, 'bytes': len(b_dst), 'sha256': sha(b_dst),
                          'name_strings_in_first_last_4k': leak})
    key = {'_note': 'KÖR ANAHTAR: sahibe dinlemeden önce gösterilmez (SPEC §6; PLAN.v3 karar 2)',
           'created_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
           'rule': 'ses numarası = kısa ses adının (nes, hak, hoc) UTF-8 SHA-256 özetinin onaltılık dizge olarak artan '
                   'sırası (en küçük özet ses1). Sabit sıra ya da rastgele çekiliş değil; herkes yeniden hesaplayabilir.',
           'sha256_short_names': dig, 'order_short': order,
           'check_full_names': {'sha256': {SHORT[v]: dig_full[v] for v in SHORT},
                                'order': [SHORT[v] for v in order_full], 'same_order_as_short': order == order_full},
           'map': {'ses%d' % i: {'voice': v, 'voice_name': SHORT[v]} for i, v in enumerate(order, 1)},
           'music': {'A': ab['A'], 'B': ab['B'], 'source': OUT + '/_ab_key.json',
                     'note': 'A/B müzik eşlemesi üç seste aynı (nes, hak ile aynı müzik düzeni)'},
           'files': files, 'location_note': 'anahtar paket dışında tutulur; sahibe notlar yazıldıktan sonra verilir',
           'not_copied': 'timeline.json dosyaları (içlerinde ses adı var)',
           'tool': os.path.abspath(__file__)}
    json.dump(key, open(KEY, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    old = K + '/_anahtar.json'
    if os.path.exists(old):
        os.remove(old)  # eski konum (yedek: out/_onceki_duzeltici1/kor/_anahtar.json)
    extra = sorted(set(os.listdir(K)) - ALLOWED)
    if extra:
        raise SystemExit('kör klasörde izin dışı dosya: %r' % extra)
    bo = open(K + '/BENI_OKU.md', encoding='utf-8').read() if os.path.exists(K + '/BENI_OKU.md') else ''
    bo_leak = [w for w in list(SHORT) + list(SHORT.values()) + ['_anahtar', 'el', 'dalga'] if (' %s ' % w) in bo or ('`%s' % w) in bo]
    if bo_leak:
        raise SystemExit('BENI_OKU.md ad/anahtar sızdırıyor: %r' % bo_leak)
    print(json.dumps({'order': order, 'full_same': order == order_full,
                      'files': [(f['blind'], f['bytes'], f['name_strings_in_first_last_4k']) for f in files], 'key': KEY,
                      'kor_contents': sorted(os.listdir(K))},
                     ensure_ascii=False))


if __name__ == '__main__':
    main()
