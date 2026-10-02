#!/usr/bin/env python3
"""make_units_ib.py — Ders 1, 3, 5 için seslendirme birim listesi (ilk bölüm; SPEC.v3 §1, §4).

Dersin kendi planlayıcı sarmalayıcısı (b/dersN/timing_dN.py: load, patch, [planner_view], corners, MINUTES) yüklenir;
her köşe × her dakika için plan kurulur, plana giren her klip (kısa biçim ayrı birim) ve taşıyıcı birim olur. Ayrıca
extras (hızlı kapanış, durdurma dönüşü, ilk ders girişi) klipleri eklenir. Ücretli çağrı yok.

Kullanım: python3 make_units_ib.py <1|3|5>   → b/dersN/units-ib.json
"""
import importlib
import json
import os
import sys

N = int(sys.argv[1])
HERE = os.path.dirname(os.path.abspath(__file__))
D = os.path.join(os.path.dirname(HERE), 'ders%d' % N)
sys.path.insert(0, D)
W = importlib.import_module('timing_d%d' % N)
T = W.T
L = W.load()
W.patch(L)
LP = W.planner_view(L) if hasattr(W, 'planner_view') else L

units, order = {}, []
seen_min = {}


def add(uid, u):
    if uid in units:
        if units[uid]['tts'] != u['tts']:
            raise SystemExit('aynı birim kimliği, farklı metin: %s' % uid)
        units[uid]['minutes'] = sorted(set(units[uid]['minutes']) | set(u['minutes']))
        return
    units[uid] = u
    order.append(uid)


cars = {c['id']: c for c in L['carriers']}
for name, rate, prof, sc in W.corners(L):
    T.DUR_SCALE = sc
    for m in W.MINUTES:
        p = T.plan(LP, m * 60, rate, prof)
        for ev in p['events']:
            c = ev['clip']
            if c.get('carrier'):
                car = cars[c['carrier']['id']]
                itexts = {}
                for b in L['blocks']:
                    for cc in b['clips']:
                        if cc['id'] in car['items']:
                            itexts[cc['id']] = cc['text']
                add(car['id'], {'id': car['id'], 'clip': None, 'kind': 'carrier', 'form': 'tasiyici', 'tts': car['text'],
                                'screen': car['text'], 'sentences': [car['text']], 'phase': c['phase'],
                                'syllables': T.syllables(car['text']), 'chars': len(car['text']),
                                'items': car['items'], 'itemText': itexts, 'minutes': [m],
                                'cut': 'üç nokta duraklarından; öğe sayısı tutmazsa çekim elenir'})
                continue
            short = bool(c.get('shortForm'))
            uid = c['id'] + ('.kisa' if short else '')
            add(uid, {'id': uid, 'clip': c['id'], 'kind': 'clip', 'form': 'kisa' if short else 'tam', 'tts': c['text'],
                      'screen': c['text'], 'sentences': T.sub_texts(c), 'phase': c['phase'],
                      'syllables': T.syllables(c['text']), 'chars': len(c['text']), 'minutes': [m],
                      **({'belowSec': c['short']['belowSec']} if short else {})})

# extras: planda olmayan yardımcı klipler (hızlı kapanış, durdurma dönüşü, ilk ders girişi)
for k, e in L['extras'].items():
    if not isinstance(e, dict):
        continue
    for c in e.get('clips') or []:
        if c['id'] in units and units[c['id']]['tts'] == c['text']:
            continue
        uid = c['id'] if c['id'] not in units else c['id'] + '.x'
        add(uid, {'id': uid, 'clip': c['id'], 'kind': 'clip', 'form': 'yardimci:' + k, 'tts': c['text'], 'screen': c['text'],
                  'sentences': T.split_keep(c['text']), 'phase': c.get('phase') or 'Kapanış',
                  'syllables': T.syllables(c['text']), 'chars': len(c['text']), 'minutes': []})

us = [units[u] for u in order]
for u in us:
    assert u['tts'] == u['screen']
    if u['kind'] == 'clip':
        assert ' '.join(u['sentences']).replace('  ', ' ') == u['tts'] or len(u['sentences']) >= 1
out = {'lesson': 'ders%d' % N, 'title': L['title'], 'voice': {'name': 'Nefona Hoca', 'voice_id': 'Sr5w7dIZaRDglJ2cLaJm',
       'sex_param': 'm', 'model': 'eleven_v4', 'generations_count': 3},
       'kaynak': 'b/ders%d/ders%d.lesson.json + timing_d%d.py (köşeler %s × dakikalar %s)' % (
           N, N, N, [c[0] for c in W.corners(L)], W.MINUTES),
       'ozet': {'birim': len(us), 'karakter': sum(u['chars'] for u in us), 'hece': sum(u['syllables'] for u in us),
                'tasiyici': sum(1 for u in us if u['kind'] == 'carrier'),
                'kredi_tahmini_tts_3_cekim': round(sum(u['chars'] for u in us) * 3 * 0.99989, 1)},
       'units': us}
json.dump(out, open(os.path.join(D, 'units-ib.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(json.dumps(out['ozet'], ensure_ascii=False))
