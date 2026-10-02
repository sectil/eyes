import json, subprocess, sys, os
from concurrent.futures import ThreadPoolExecutor
R='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
W=R+'/sel/hak/_work-hak-2'
units=json.load(open(R+'/units.json'))['units'][34:68]
ids=[u['id'] for u in units]
print('part hak-2 ids (idx 34..67):', ids, flush=True)
def job(u):
    uj=W+'/rank/%s.unit.json'%u['id']
    json.dump(u, open(uj,'w'), ensure_ascii=False)
    out=W+'/rank/%s.json'%u['id']
    p=subprocess.run([sys.executable, R+'/tools/audio.py','rank',R+'/raw/hak/'+u['id'],'--unit-json','@'+uj,'--sex','m'],capture_output=True,text=True)
    open(out,'w').write(p.stdout)
    if p.stderr: open(out+'.err','w').write(p.stderr)
    return u['id'], p.returncode
sel=sys.argv[1:]
todo=[u for u in units if (not sel or u['id'] in sel)]
with ThreadPoolExecutor(4) as ex:
    for r in ex.map(job, todo):
        print(r, flush=True)
