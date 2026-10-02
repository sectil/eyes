#!/usr/bin/env python3
"""hak-2-sel: cut + process accepted takes into render/sel/hak/<unit>/<piece>.wav (SPEC §3, §4.3c, §4.5)."""
import json, os, sys, subprocess
R = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
W = R + '/sel/hak/_work-hak-2'
T = R + '/tools'
sys.path.insert(0, T)
import audio
units = json.load(open(R + '/units.json'))['units'][34:68]
choice = json.load(open(W + '/choice.json'))
only = sys.argv[1:]

def run(args):
    p = subprocess.run([sys.executable, T + '/audio.py'] + args, capture_output=True, text=True)
    try: out = json.loads(p.stdout)
    except Exception: out = {'raw_stdout': p.stdout[-3000:], 'stderr': p.stderr[-3000:]}
    return p.returncode, out

REF = {'Derin': 'c2.kal', 'Kapanış': 'k.sesler', 'Varış': 'a.x.kipir'}
outp = W + '/process_all.json'
out = json.load(open(outp)) if (only and os.path.exists(outp)) else {'choice': choice, 'ref_clips': REF, 'units': {}}
out['choice'] = choice

def process_piece(src, dst, micro=False, ref_db=None):
    args = ['process', src, '--out', dst, '--sex', 'm']
    if micro: args.append('--micro')
    if ref_db is not None: args += ['--ref-rms-db', '%.3f' % ref_db]
    return run(args)

# 1) reference clips (single-sentence, >= 1 s; -18 LUFS); their output speech RMS is the reference for < 1 s pieces
ref_rms = out.get('ref_rms_db', {})
for ph, rid in REF.items():
    if only and rid not in only and ref_rms.get(ph) is not None: continue
    d = f'{R}/sel/hak/{rid}'; os.makedirs(d, exist_ok=True)
    rc, rep = process_piece(choice[rid]['file'], f'{d}/{rid}.wav')
    ref_rms[ph] = rep.get('rms_db')
    out['units'][rid] = {'source': choice[rid], 'process': {rid: {'exit': rc, **rep}}, 'pieces': [rid]}
    print('REF', ph, rid, 'exit', rc, rep.get('level_mode'), rep.get('level'), 'rms', rep.get('rms_db'), 'tp', rep.get('true_peak_dbtp'), rep.get('flag', ''), flush=True)
out['ref_rms_db'] = ref_rms

for u in units:
    uid, ph = u['id'], u['phase']
    if only and uid not in only: continue
    if uid in REF.values(): continue
    if uid not in choice: print(uid, 'NO CHOICE (pending)'); continue
    pcs = audio.unit_pieces(u)
    d = f'{R}/sel/hak/{uid}'; os.makedirs(d, exist_ok=True)
    rec = out['units'][uid] = {'source': choice[uid]}
    if len(pcs) == 1:
        rc, rep = process_piece(choice[uid]['file'], f'{d}/{uid}.wav', ref_db=ref_rms.get(ph))
        rec['process'] = {uid: {'exit': rc, **rep}}; rec['pieces'] = [uid]
        print(uid, 'exit', rc, rep.get('level_mode'), rep.get('level'), rep.get('true_peak_dbtp'), rep.get('out_duration'), rep.get('flag', ''), flush=True)
        continue
    cutdir = f'{W}/cuts/{uid}'
    names = [p['name'] for p in pcs]; sylls = [str(p['syll']) for p in pcs]
    rc, cut = run(['cut', choice[uid]['file'], '--n', str(len(pcs)), '--outdir', cutdir,
                   '--names', ','.join(names), '--sylls', ','.join(sylls), '--sex', 'm'])
    rec['cut'] = {'exit': rc, **cut}; rec['process'] = {}; rec['pieces'] = []
    if rc != 0:
        print(uid, 'CUT FAILED', cut, flush=True); continue
    for p in pcs:
        if not p['keep']: continue
        pid = p['name'] if u['kind'] == 'carrier' else f'{uid}#{p["name"][1:]}'
        micro = (u['kind'] == 'carrier' and p['syll'] == 1)
        rc2, rep = process_piece(f'{cutdir}/{p["name"]}.wav', f'{d}/{pid}.wav', micro=micro, ref_db=ref_rms.get(ph))
        rec['process'][pid] = {'exit': rc2, 'micro': micro, 'text': p['text'], 'syll': p['syll'], **rep}
        rec['pieces'].append(pid)
        print(uid, pid, 'exit', rc2, rep.get('level_mode'), rep.get('level'), rep.get('true_peak_dbtp'), rep.get('out_duration'), rep.get('flag', ''), flush=True)
    print(uid, 'cuts', cut.get('cuts'), 'misalign', cut.get('boundary_misalign'), 'margin', cut.get('margin_ratio'), 'suspect', cut.get('cut_suspect'), flush=True)
json.dump(out, open(outp, 'w'), ensure_ascii=False, indent=1)
