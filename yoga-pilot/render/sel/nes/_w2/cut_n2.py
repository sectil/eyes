#!/usr/bin/env python3
"""n2.hatirla: SPEC §3 longest-gap cut is wrong in all 6 takes (longest pause is after 'şunu:' inside sentence 2).
Here the cut is placed in the gap that matches the sentence boundary (min syllable misalignment), same cut mechanics
as audio.plan_cuts (middle of the gap's cut_region, nearest zero crossing, 5 ms fades). DEVIATION from the
'longest N-1 gaps' selection rule -> flagged for the owner/orchestrator."""
import json, os, sys
R = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
W = R + '/sel/nes/_w2'
sys.path.insert(0, R + '/tools')
import audio, subprocess
u = json.load(open(W + '/unit_n2.hatirla.json'))
pcs = audio.unit_pieces(u); sylls = [p['syll'] for p in pcs]
src = R + '/raw/nes/n2.hatirla/retake/t2.mp3'
x, sr = audio.load(src)
a = audio.analyze_array(x, sr, u['syllables'], u['phase'], 'f')
thr = a['thr_db']
info = audio.find_pauses(x, sr, thr, 'f')
cands = []
for gi, g in enumerate(info['gaps']):
    s, e = g['cut_region']
    mid = int(round((s + e) / 2 * sr)); radius = max(1, int(min(0.010, (e - s) / 4) * sr))
    c = audio.zero_cross_near(x, mid, radius)
    parts, bounds = audio.split_at(x, [c], sr)
    sp = [audio.speech_measure(p, sr, thr, 'f')['speech_sec'] for p in parts]
    dev = audio.boundary_alignment(sp, sylls)
    cands.append({'gap': [round(g['start'], 3), round(g['end'], 3)], 'dur': round(g['dur'], 3), 'cut_sec': round(c / sr, 4),
                  'speech_sec': [round(v, 3) for v in sp], 'rates': [round(sy / v, 2) for sy, v in zip(sylls, sp)],
                  'misalign': round(dev, 3), '_c': c})
longest = max(cands, key=lambda q: q['dur'])
best = min(cands, key=lambda q: q['misalign'])
parts, bounds = audio.split_at(x, [best['_c']], sr)
cutdir = W + '/cuts/n2.hatirla'; os.makedirs(cutdir, exist_ok=True)
outdir = R + '/sel/nes/n2.hatirla'; os.makedirs(outdir, exist_ok=True)
rep = {'source': src, 'thr_db': thr, 'candidates': [{k: v for k, v in q.items() if k != '_c'} for q in cands],
       'spec_rule_cut (longest gap)': {k: v for k, v in longest.items() if k != '_c'},
       'chosen_cut (sentence boundary)': {k: v for k, v in best.items() if k != '_c'},
       'cut_misalign_max': audio.CUT_MISALIGN_MAX, 'pieces': {}}
ref = json.load(open(W + '/process_all.json'))['ref_rms_db']['Derin']
for i, (p, pc) in enumerate(zip(pcs, parts)):
    fp = f'{cutdir}/{p["name"]}.wav'; audio.write_wav(fp, pc, sr)
    pid = f'n2.hatirla#{i+1}'
    r = subprocess.run(['python3', R + '/tools/audio.py', 'process', fp, '--out', f'{outdir}/{pid}.wav', '--sex', 'f', '--ref-rms-db', str(ref)], capture_output=True, text=True)
    pr = json.loads(r.stdout); pr['exit'] = r.returncode
    rep['pieces'][pid] = {'cut_file': fp, 'start': round(bounds[i] / sr, 4), 'end': round(bounds[i+1] / sr, 4), 'text': p['text'], 'syll': p['syll'], 'process': pr}
    print(pid, 'exit', r.returncode, pr['level_mode'], pr['level'], pr['true_peak_dbtp'], pr['out_duration'])
json.dump(rep, open(W + '/cut_n2.hatirla.json', 'w'), ensure_ascii=False, indent=1)
print(json.dumps({k: rep[k] for k in ['candidates', 'spec_rule_cut (longest gap)', 'chosen_cut (sentence boundary)']}, ensure_ascii=False))
