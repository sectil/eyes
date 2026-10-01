import json, subprocess, sys, os
from concurrent.futures import ThreadPoolExecutor
R='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
W=R+'/sel/hak/_work-hak-1'
units={u['id']:u for u in json.load(open(R+'/units.json'))['units']}
proc=json.load(open(W+'/proc.json'))
meas=json.load(open(W+'/measure.json')) if os.path.exists(W+'/measure.json') else {}
jobs=[]
for uid,r in proc.items():
    for q in r.get('pieces',[]):
        if q['piece_id'] in meas and meas[q['piece_id']].get('_mtime')==os.path.getmtime(q['out']): continue
        jobs.append((uid,q))
def job(a):
    uid,q=a
    p=subprocess.run([sys.executable,R+'/tools/audio.py','analyze',q['out'],'--syll',str(q['syll']),'--phase',units[uid]['phase'],'--sex','m'],capture_output=True,text=True)
    d=json.loads(p.stdout); d['_mtime']=os.path.getmtime(q['out']); return q['piece_id'],d
with ThreadPoolExecutor(6) as ex:
    for pid,d in ex.map(job,jobs): meas[pid]=d
json.dump(meas,open(W+'/measure.json','w'),ensure_ascii=False,indent=1)
bad=[(k,v['clicks']['count'],v['clipping']['clipped']) for k,v in meas.items() if v['clicks']['count'] or v['clipping']['clipped']]
print('measured',len(meas),'clicks/clipping:',bad)
import soundfile as sf
fmt=set()
for uid,r in proc.items():
    for q in r.get('pieces',[]):
        i=sf.info(q['out']); fmt.add((i.samplerate,i.channels,i.subtype))
print('formats',fmt)
