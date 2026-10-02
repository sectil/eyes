"""nes-1: cut (SPEC §3/§4.3) + process (SPEC §3) the chosen take of each unit into sel/nes/<unit>/<piece>.wav.
usage: proc1.py <decisions.json> [unit ...]   decisions: {unit: {"take": "t1.mp3", ...}}"""
import json, sys, os, subprocess
R='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
W=R+'/sel/nes/_work-nes-1'
A=[sys.executable, R+'/tools/audio.py']
sys.path.insert(0, R+'/tools'); import audio
units={u['id']:u for u in json.load(open(R+'/units.json'))['units']}
dec=json.load(open(sys.argv[1]))
only=sys.argv[2:]
REF={'Derinleşme':'c1.tekrar','Varış':'a.acilis','Derin':'c2.alt'}   # same-phase reference clip within part nes-1
def run(cmd):
    p=subprocess.run(cmd,capture_output=True,text=True)
    try: o=json.loads(p.stdout[:p.stdout.rfind('}')+1]) if p.stdout.strip() else {}
    except Exception: o={'raw':p.stdout}
    return p.returncode,o,p.stderr
res=json.load(open(W+'/proc.json')) if os.path.exists(W+'/proc.json') else {}
# reference clips first
order=[u for u in dec if (not only or u in only)]
refs=[REF[p] for p in REF if REF[p] in dec]
order=sorted(order,key=lambda u:(0 if u in refs else 1))
refrms={}
for ph,u in REF.items():
    if u in res and res[u].get('pieces') and u not in dec: refrms[ph]=res[u]['pieces'][0]['process']['rms_db']
for uid in order:
    u=units[uid]; d=dec[uid]; src=R+'/raw/nes/%s/%s'%(uid,d['take'])
    pcs=audio.unit_pieces(u); outdir=R+'/sel/nes/'+uid; os.makedirs(outdir,exist_ok=True)
    rec={'unit':uid,'take':d['take'],'src':src,'phase':u['phase']}
    if u['kind']=='carrier':
        names=[p['name'] for p in pcs]; ids=names
    elif len(pcs)>1:
        names=['%s#%d'%(uid,i+1) for i in range(len(pcs))]; ids=names
    else:
        names=None; ids=[uid]
    if names:
        cd=W+'/cuts/'+uid
        rc,o,err=run(A+['cut',src,'--n',str(len(pcs)),'--outdir',cd,'--names',','.join(names),'--sylls',','.join(str(p['syll']) for p in pcs),'--sex','f'])
        rec['cut']={k:o.get(k) for k in ('ok','cuts','pauses','chosen_gaps','shortest_chosen_gap','longest_unchosen_gap','margin_ratio','boundary_misalign','cut_suspect','thr_db','gaps_available')}
        rec['cut']['pieces']=o.get('pieces'); rec['cut']['rc']=rc
        if rc!=0: rec['error']='cut failed rc=%d %s'%(rc,err[-300:]); res[uid]=rec; print(uid,'CUT FAIL'); continue
        inputs=[p['file'] for p in o['pieces']]
    else:
        inputs=[src]
    rec['pieces']=[]
    ref=refrms.get(u['phase'])
    for pid,pin,pm in zip(ids,inputs,pcs):
        if not pm['keep']: continue
        out=outdir+'/%s.wav'%pid
        cmd=A+['process',pin,'--out',out,'--sex','f']
        if ref is not None: cmd+=['--ref-rms-db',str(ref)]
        micro = pm['syll']==1
        if micro: cmd+=['--micro']
        rc,o,err=run(cmd)
        rec['pieces'].append({'piece_id':pid,'text':pm['text'],'syll':pm['syll'],'out':out,'rc':rc,'micro_arg':micro,
                              'ref_rms_db_arg':ref,'ref_clip':REF.get(u['phase']) if ref is not None else None,'process':o,'err':err[-300:] if rc else ''})
        print(uid,pid,'rc',rc,o.get('level_mode'),o.get('out_duration'),o.get('level'),o.get('true_peak_dbtp'),o.get('flag',''))
    if uid in refs and rec['pieces'] and rec['pieces'][0]['rc']==0:
        refrms[u['phase']]=rec['pieces'][0]['process']['rms_db']
    res[uid]=rec
    json.dump(res,open(W+'/proc.json','w'),ensure_ascii=False,indent=1)
json.dump(res,open(W+'/proc.json','w'),ensure_ascii=False,indent=1)
print('refrms',refrms)
