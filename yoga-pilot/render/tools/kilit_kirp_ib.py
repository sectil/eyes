#!/usr/bin/env python3
"""kilit_kirp_ib.py — Ders 1 nefes kilitli parçalarının sessiz başını ve sonunu atar (sahip kararı 2026-09-30,
SAHIP_ISTEKLERI madde 16). Ücretli çağrı yok.

Neden: işlenmiş mikro parçalarda konuşmadan sonra ≈ 0,25 sn, önce ≈ 0,06 sn tepenin 40 dB altında (sessize yakın)
bölüm kalıyor; nefes kilidinde (D1-kilit: parça + sessizlik tabanı ≤ periyot) bu pay yetmiyor.
Yöntem (VARSAYIM): 10 ms karelerde orta kanal enerjisi; tepenin 40 dB altını aşan ilk ve son kare konuşmanın sınırı.
Yeni başlangıç = sınır − 20 ms (5 ms yükselen kosinüs), yeni son = sınır + 40 ms (40 ms inen kosinüs). Konuşmaya dokunulmaz.
Özgün dosya `<birim>/_kirpma_oncesi/<parça>.wav`'a taşınır; kayıt seçim dosyasına (`pieces[].kilit_kirpma`) yazılır.
Tekrar çalıştırılırsa kırpılmış parçayı atlar.

Kullanım: python3 kilit_kirp_ib.py
"""
import json
import os
import shutil

import numpy as np
import soundfile as sf

R = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga'
SEL = R + '/render/sel/hoc/d01/selection-d01.json'
LESSON = R + '/b/ders1/ders1.lesson.json'
THR_DB = -40.0
HEAD_S, TAIL_S = 0.020, 0.040
FIN_S = 0.005


def bounds(x, sr):
    m = x.mean(axis=1)
    n = int(0.01 * sr)
    k = len(m) // n
    db = 10 * np.log10(np.maximum((m[:k * n].reshape(k, n) ** 2).mean(axis=1), 1e-12))
    on = np.where(db > db.max() + THR_DB)[0]
    return on[0] * n / sr, (on[-1] + 1) * n / sr


def main():
    L = json.load(open(LESSON, encoding='utf-8'))
    clips = {c['id']: c for b in L['blocks'] for c in b['clips']}
    sel = json.load(open(SEL, encoding='utf-8'))
    done = skipped = 0
    worst = []
    for uid, u in sel['units'].items():
        for p in u['pieces']:
            c = clips.get(p['piece_id'])
            if not c or not c.get('tags', {}).get('breathLock'):
                continue
            if p.get('kilit_kirpma'):
                skipped += 1
                continue
            x, sr = sf.read(p['file'], dtype='float64', always_2d=True)
            on, off = bounds(x, sr)
            a = max(0, int(round((on - HEAD_S) * sr)))
            b = min(len(x), int(round((off + TAIL_S) * sr)))
            y = x[a:b].copy()
            nf = int(FIN_S * sr)
            if a > 0:
                y[:nf] *= (0.5 - 0.5 * np.cos(np.pi * np.arange(nf) / nf))[:, None]
            nt = min(int(TAIL_S * sr), len(y))
            y[-nt:] *= (0.5 + 0.5 * np.cos(np.pi * np.arange(nt) / nt))[:, None]
            bak = os.path.join(os.path.dirname(p['file']), '_kirpma_oncesi')
            os.makedirs(bak, exist_ok=True)
            shutil.copy2(p['file'], os.path.join(bak, os.path.basename(p['file'])))
            info = sf.info(p['file'])
            sf.write(p['file'], y if x.shape[1] > 1 else y[:, 0], sr, subtype=info.subtype)
            limit = c['onsetPeriod']['pref'] - c.get('gapFloor', 0)
            rec = {'orig_dur': round(len(x) / sr, 4), 'new_dur': round(len(y) / sr, 4), 'cut_head_s': round(a / sr, 4),
                   'cut_tail_s': round((len(x) - b) / sr, 4), 'thr_db_rel_peak': THR_DB, 'head_margin_s': HEAD_S,
                   'tail_fade_s': TAIL_S, 'limit_s': round(limit, 3), 'fits': bool(len(y) / sr <= limit + 0.02)}
            p['kilit_kirpma'] = rec
            p['measure']['duration'] = rec['new_dur']
            done += 1
            worst.append((rec['new_dur'] - limit, p['piece_id'], rec['new_dur'], limit))
    json.dump(sel, open(SEL, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    worst.sort(reverse=True)
    print('kırpılan', done, 'atlanan (zaten kırpılmış)', skipped)
    print('sınıra en yakın 5:', [(w[1], w[2], w[3], round(w[0], 3)) for w in worst[:5]])
    print('sınırı aşan:', [(w[1], w[2], w[3]) for w in worst if w[0] > 0.02])


if __name__ == '__main__':
    main()
