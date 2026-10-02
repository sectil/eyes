#!/usr/bin/env python3
"""nes-2-sel: cut + process accepted takes into render/sel/nes/<unit>/<piece>.wav (SPEC §3, §4.3c, §4.5)."""
import json, os, sys, subprocess
R = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
W = R + '/sel/nes/_w2'
T = R + '/tools'
sys.path.insert(0, T)
import audio, numpy as np
units = json.load(open(R + '/units.json'))['units'][34:68]
rank = json.load(open(W + '/rank.json'))

def run(args):
    p = subprocess.run(['python3', T + '/audio.py'] + args, capture_output=True, text=True)
    try: out = json.loads(p.stdout)
    except Exception: out = {'raw_stdout': p.stdout[-3000:], 'stderr': p.stderr[-3000:]}
    return p.returncode, out

# chosen source per unit
choice = {}
for u in units:
    uid = u['id']
    top = rank[uid]['ranking'][0]['take']
    choice[uid] = {'file': f'{R}/raw/nes/{uid}/{top}', 'take': top.replace('.mp3', ''), 'set': 'original'}
choice['n2.hatirla'] = {'file': f'{R}/raw/nes/n2.hatirla/retake/t2.mp3', 'take': 'retake-t2', 'set': 'retake'}
choice['k.yan'] = {'file': f'{R}/raw/nes/k.yan/retake/t1.mp3', 'take': 'retake-t1', 'set': 'retake'}

# phase reference clips (single-sentence, >= 1 s, processed to -18 LUFS); speech RMS used for < 1 s pieces
REF = {'Derin': 'c2.kal', 'Kapanış': 'k.sesler', 'Varış': 'a.x.kipir'}
MICRO_ITEMS = set()
out = {'choice': choice, 'ref_clips': REF, 'units': {}}
os.makedirs(R + '/sel/nes', exist_ok=True)

def process_piece(src, dst, phase, micro=False, ref_db=None):
    args = ['process', src, '--out', dst, '--sex', 'f']
    if micro: args.append('--micro')
    if ref_db is not None: args += ['--ref-rms-db', '%.3f' % ref_db]
    return run(args)

# 1) reference clips first
ref_rms = {}
for ph, rid in REF.items():
    d = f'{R}/sel/nes/{rid}'; os.makedirs(d, exist_ok=True)
    rc, rep = process_piece(choice[rid]['file'], f'{d}/{rid}.wav', ph)
    ref_rms[ph] = rep.get('rms_db')
    out['units'].setdefault(rid, {})['process'] = {rid: {'exit': rc, **rep}}
out['ref_rms_db'] = ref_rms
print('ref rms', ref_rms, flush=True)

for u in units:
    uid, ph = u['id'], u['phase']
    pcs = audio.unit_pieces(u)
    d = f'{R}/sel/nes/{uid}'; os.makedirs(d, exist_ok=True)
    rec = out['units'].setdefault(uid, {})
    rec['source'] = choice[uid]
    if len(pcs) == 1:
        if 'process' in rec: continue           # reference clip already done
        rc, rep = process_piece(choice[uid]['file'], f'{d}/{uid}.wav', ph, ref_db=ref_rms.get(ph))
        rec['process'] = {uid: {'exit': rc, **rep}}
        rec['pieces'] = [uid]
        print(uid, 'exit', rc, rep.get('level_mode'), rep.get('level'), rep.get('true_peak_dbtp'), rep.get('out_duration'), rep.get('flag', ''), flush=True)
        continue
    cutdir = f'{W}/cuts/{uid}'
    if uid == 'n2.hatirla':
        continue                                 # custom cut, handled separately (see cut_n2.py)
    names = [p['name'] for p in pcs]; sylls = [str(p['syll']) for p in pcs]
    rc, cut = run(['cut', choice[uid]['file'], '--n', str(len(pcs)), '--outdir', cutdir,
                   '--names', ','.join(names), '--sylls', ','.join(sylls), '--sex', 'f'])
    rec['cut'] = {'exit': rc, **cut}
    rec['process'] = {}; rec['pieces'] = []
    if rc != 0:
        print(uid, 'CUT FAILED', cut, flush=True); continue
    for i, p in enumerate(pcs):
        if not p['keep']: continue
        pid = p['name'] if u['kind'] == 'carrier' else f'{uid}#{p["name"][1:]}'
        micro = (u['kind'] == 'carrier' and p['syll'] == 1)
        rc2, rep = process_piece(f'{cutdir}/{p["name"]}.wav', f'{d}/{pid}.wav', ph, micro=micro, ref_db=ref_rms.get(ph))
        rec['process'][pid] = {'exit': rc2, 'micro': micro, **rep}
        rec['pieces'].append(pid)
        print(uid, pid, 'exit', rc2, rep.get('level_mode'), rep.get('level'), rep.get('true_peak_dbtp'), rep.get('out_duration'), rep.get('flag', ''), flush=True)
    print(uid, 'cuts', cut.get('cuts'), 'misalign', cut.get('boundary_misalign'), 'suspect', cut.get('cut_suspect'), flush=True)
json.dump(out, open(W + '/process_all.json', 'w'), ensure_ascii=False, indent=1)
