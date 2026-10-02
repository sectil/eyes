import json, os, sys, glob
import soundfile as sf
R = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
W = R + '/sel/nes/_w2'
sys.path.insert(0, R + '/tools')
import audio
units = json.load(open(R + '/units.json'))['units'][34:68]
rank = json.load(open(W + '/rank.json'))
pa = json.load(open(W + '/process_all.json'))
res = {}; problems = []
for u in units:
    uid = u['id']; pcs = audio.unit_pieces(u)
    if len(pcs) == 1: exp = [uid]
    elif u['kind'] == 'carrier': exp = [p['name'] for p in pcs if p['keep']]
    else: exp = [f'{uid}#{i+1}' for i in range(len(pcs))]
    files = sorted(os.path.basename(f)[:-4] for f in glob.glob(f'{R}/sel/nes/{uid}/*.wav'))
    if sorted(exp) != files: problems.append((uid, 'pieces', exp, files))
    # cut consistency with rank (same take)
    if len(pcs) > 1 and uid != 'n2.hatirla':
        rk = rank[uid]['ranking'][0]['cut']['cuts_sec']; ct = pa['units'][uid]['cut']['cuts']
        if any(abs(a - b) > 0.0005 for a, b in zip(rk, ct)) or len(rk) != len(ct): problems.append((uid, 'cut differs from rank', rk, ct))
    pr = {}
    for pid in exp:
        f = f'{R}/sel/nes/{uid}/{pid}.wav'
        if not os.path.exists(f): continue
        info = sf.info(f); x, sr = sf.read(f, dtype='float64')
        n, times, mode = audio.detect_clicks(x, sr)
        tp = audio.true_peak_db(x); L = audio.lufs(x, sr) if len(x) / sr >= 1.0 else None
        rms = audio.speech_rms_db(x, sr); clip = audio.clipping(x)['clipped']
        pr[pid] = {'sr': info.samplerate, 'ch': info.channels, 'subtype': info.subtype, 'dur': round(info.duration, 3),
                   'lufs': None if L is None else round(L, 2), 'speech_rms_db': round(rms, 2), 'true_peak_dbtp': round(tp, 2),
                   'clicks': n, 'click_times': times[:5], 'clipped': clip}
        if info.samplerate != 44100 or info.channels != 1 or info.subtype not in ('FLOAT', 'DOUBLE'): problems.append((pid, 'format', info.samplerate, info.channels, info.subtype))
        if n: problems.append((pid, 'clicks', n, times[:5], mode))
        if clip: problems.append((pid, 'clipped'))
        if tp > -1.5: problems.append((pid, 'tp', tp))
    res[uid] = pr
json.dump({'pieces': res, 'problems': problems}, open(W + '/verify.json', 'w'), ensure_ascii=False, indent=1)
print('units', len(res), 'pieces', sum(len(v) for v in res.values()))
print('problems', problems)
for pid, v in res['car.sayi'].items(): print(pid, v['dur'], v['lufs'], v['speech_rms_db'], v['true_peak_dbtp'])
print('ref c2.kal', res['c2.kal'])
