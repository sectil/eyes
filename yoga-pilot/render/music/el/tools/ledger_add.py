#!/usr/bin/env python3
"""Append one paid-call line to render/ledger.jsonl (single O_APPEND write).
Music cap (SPEC §2): ElevenLabs music + nature + tone <= 900 cents. Scribe QA for music is tracked in the same
running total (conservative) and also separately.
usage: ledger_add.py '<json-object>'  -> prints the written line; exits 3 if the cap would be exceeded (nothing written)
"""
import json, sys, os, datetime
LEDGER = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'ledger.jsonl')
LEDGER = os.path.abspath(LEDGER)
CAP = 900.0
MUSIC_KINDS = {'music', 'sfx', 'scribe-music'}
rec = json.loads(sys.argv[1])
before = 0.0
with open(LEDGER) as f:
    for l in f:
        l = l.strip()
        if not l:
            continue
        try:
            d = json.loads(l)
        except Exception:
            continue
        if d.get('kind') in MUSIC_KINDS:
            before += float(d.get('cents_est') or 0)
after = before + float(rec['cents_est'])
if after > CAP + 1e-9:
    print(json.dumps({'refused': True, 'music_cents_before': before, 'would_be': after}))
    sys.exit(3)
out = {'ts': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'who': 'music-el'}
out.update(rec)
out['music_cents_before'] = round(before, 4)
out['music_cents_after'] = round(after, 4)
line = json.dumps(out, ensure_ascii=False) + '\n'
fd = os.open(LEDGER, os.O_WRONLY | os.O_APPEND)
os.write(fd, line.encode('utf-8'))
os.close(fd)
print(line.strip())
