#!/usr/bin/env python3
"""Çizelgenin uygulama kopyası (SPEC.v3 §11: pilot alanları yalnız üretim kopyasında kalır).

Üretim kopyası (render/out/ilk-bolum/<ad>.timeline.json, mixib.py) okunur; pilot alanları ayıklanıp
app/public/yoga/<ad>.timeline.json yazılır. Ayıklananlar:
  - speech[].flags          (kesim/kulak işaretleri)
  - qa                      (kalite raporu ve yolu: _rapor/...)
  - plan.planner            (üretim yolu: pilot/timing.py)
  - music_events[].sound    (üretim kaynak dosyası: donus.synth-D5.wav)
Uygulamanın okuduğu alanlara (speech'in öteki alanları, closing, release, windows, visual, music_events'in olay ve
zamanı, blocks, dawn, T, file ...) dokunulmaz; sıra ve biçim mixib.py'ninkiyle aynı (indent=1, ensure_ascii=False).
MP3 değişmez; contentHash (lib/yogaLessons.js) yalnız MP3'ündür.

Kullanım:
  python3 render/tools/app_kopya.py                  # render/out/ilk-bolum -> ../app/public/yoga (hepsi)
  python3 render/tools/app_kopya.py --src D --dst D  # başka dizinler
  python3 render/tools/app_kopya.py --check          # yazmaz; uygulama kopyası güncel değilse çıkış 1
"""
import argparse
import glob
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
PILOT = os.path.normpath(os.path.join(HERE, '..', '..'))
SRC = os.path.join(PILOT, 'render', 'out', 'ilk-bolum')
DST = os.path.normpath(os.path.join(PILOT, '..', 'app', 'public', 'yoga'))


def app_copy(tl):
    out = dict(tl)
    out.pop('qa', None)
    if isinstance(out.get('plan'), dict):
        out['plan'] = {k: v for k, v in out['plan'].items() if k != 'planner'}
    if isinstance(out.get('speech'), list):
        out['speech'] = [{k: v for k, v in s.items() if k != 'flags'} if isinstance(s, dict) else s for s in out['speech']]
    if isinstance(out.get('music_events'), list):
        out['music_events'] = [{k: v for k, v in e.items() if k != 'sound'} if isinstance(e, dict) else e
                               for e in out['music_events']]
    return out


def dumps(tl):
    return json.dumps(tl, ensure_ascii=False, indent=1)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', default=SRC)
    ap.add_argument('--dst', default=DST)
    ap.add_argument('--check', action='store_true')
    a = ap.parse_args()
    files = sorted(glob.glob(os.path.join(a.src, '*.timeline.json')))
    if not files:
        print('çizelge yok: %s' % a.src, file=sys.stderr)
        return 2
    stale = 0
    for f in files:
        with open(f, encoding='utf-8') as fh:
            text = dumps(app_copy(json.load(fh)))
        dst = os.path.join(a.dst, os.path.basename(f))
        cur = open(dst, encoding='utf-8').read() if os.path.exists(dst) else None
        if cur == text:
            print('güncel  %s' % os.path.basename(f))
            continue
        stale += 1
        if a.check:
            print('ESKİ    %s' % os.path.basename(f))
        else:
            with open(dst, 'w', encoding='utf-8') as fh:
                fh.write(text)
            print('yazıldı %s' % os.path.basename(f))
    return 1 if a.check and stale else 0


if __name__ == '__main__':
    sys.exit(main())
