#!/usr/bin/env python3
"""kalici_ib.py — seçilmiş ve işlenmiş konuşma parçalarını depoya kalıcı kopya olarak yazar (FLAC, 24 bit PCM;
render/_kalici/README.md kalıbı). Ücretli çağrı yok.

Kullanım: python3 kalici_ib.py <depo_render_klasörü> d01 d03 d05
  scratch sel/hoc/<ders>/<birim>/*.wav → <depo>/_kalici/sel/hoc/<ders>/<birim>/*.flac; manifest.json'a eklenir (src yoluyla
  tekilleşir). Dönüşüm hatası ve tepe ölçülür; tepe 1,0'ı aşan kaynak durdurur (FLAC tam sayı, kırpılır).
"""
import glob
import json
import os
import sys

import numpy as np
import soundfile as sf

R = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'


def main():
    dst_root = sys.argv[1]
    K = os.path.join(dst_root, '_kalici')
    mpath = os.path.join(K, 'manifest.json')
    man = json.load(open(mpath)) if os.path.exists(mpath) else []
    by_src = {m['src']: i for i, m in enumerate(man)}
    tot = 0
    for les in sys.argv[2:]:
        files = sorted(f for f in glob.glob('%s/sel/hoc/%s/*/*.wav' % (R, les)) if '/_work/' not in f)
        n = 0
        for f in files:
            rel = os.path.relpath(f, R)
            dst = rel[:-4] + '.flac'
            x, sr = sf.read(f, dtype='float64', always_2d=True)
            peak = float(np.abs(x).max())
            if peak > 1.0:
                raise SystemExit('tepe > 1,0: %s (%.4f)' % (rel, peak))
            out = os.path.join(K, dst)
            os.makedirs(os.path.dirname(out), exist_ok=True)
            y = x if x.shape[1] > 1 else x[:, 0]
            sf.write(out, y, sr, subtype='PCM_24', format='FLAC')
            z, _ = sf.read(out, dtype='float64', always_2d=True)
            err = float(np.abs(z - x).max())
            rec = {'src': rel, 'dst': dst, 'sr': sr, 'frames': int(len(x)), 'ch': int(x.shape[1]), 'max_abs_err': err,
                   'peak': peak}
            if rel in by_src:
                man[by_src[rel]] = rec
            else:
                by_src[rel] = len(man)
                man.append(rec)
            n += 1
        tot += n
        print(les, n, 'parça')
    json.dump(man, open(mpath, 'w'), ensure_ascii=False, indent=1)
    print('manifest', len(man), 'kayıt; bu çalışmada', tot)


if __name__ == '__main__':
    main()
