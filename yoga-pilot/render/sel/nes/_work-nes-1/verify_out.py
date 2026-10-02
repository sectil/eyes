import json, sys, os, glob
from concurrent.futures import ProcessPoolExecutor
R='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
sys.path.insert(0,R+'/tools'); import audio, soundfile as sf
units=json.load(open(R+'/units.json'))['units'][0:34]
def exp_ids(u):
    pcs=audio.unit_pieces(u)
    if u['kind']=='carrier': return [(p['name'],p) for p in pcs if p['keep']]
    if len(pcs)>1: return [('%s#%d'%(u['id'],i+1),p) for i,p in enumerate(pcs)]
    return [(u['id'],pcs[0])]
def job(args):
    uid,pid,syll,phase=args
    fp=R+'/sel/nes/%s/%s.wav'%(uid,pid)
    if not os.path.exists(fp): return uid,pid,{'missing':True}
    i=sf.info(fp); x,sr=audio.load(fp)
    a=audio.analyze_array(x,sr,syll,phase,'f')
    keep={k:a.get(k) for k in ('duration','speech_sec','articulation','pauses','f0_mean_hz','f0_sd_semitones','sibilance_ratio','clipping','dc','lufs','rms_db','true_peak_dbtp','clicks')}
    keep['format']={'sr':i.samplerate,'ch':i.channels,'subtype':i.subtype}
    return uid,pid,keep
jobs=[]
for u in units:
    for pid,p in exp_ids(u): jobs.append((u['id'],pid,p['syll'],u['phase']))
out={}
with ProcessPoolExecutor(4) as ex:
    for uid,pid,k in ex.map(job,jobs): out.setdefault(uid,{})[pid]=k
json.dump(out,open(os.path.dirname(os.path.abspath(__file__))+'/verify_out.json','w'),ensure_ascii=False,indent=1,default=lambda v: v.item() if hasattr(v,'item') else str(v))
n=sum(len(v) for v in out.values()); miss=[(u,p) for u,v in out.items() for p,k in v.items() if k.get('missing')]
bad=[(u,p,k['clicks'],k['clipping'],k['format']) for u,v in out.items() for p,k in v.items() if not k.get('missing') and (k['clicks']['count']>0 or k['clipping']['clipped'] or k['format']['sr']!=44100 or k['format']['ch']!=1)]
print('pieces',n,'missing',miss,'bad',bad)
extra=[f for u in units for f in glob.glob(R+'/sel/nes/%s/*'%u['id']) if os.path.basename(f)[:-4] not in [p for p,_ in exp_ids(u)]]
print('extra files',extra)
