"""n1.sec: all 6 takes fail the SPEC §3 longest-pause cut (colon pause > sentence-end pause).
Metric-only (SPEC §4.3c) alternative for the flagged best take: evaluate every gap as the cut, pick the one whose
pieces match the sentence syllable split (boundary_misalign minimal); same cut mechanics as audio.plan_cuts."""
import sys, json, os
R='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
sys.path.insert(0,R+'/tools'); import audio
take=sys.argv[1]
u=[x for x in json.load(open(R+'/units.json'))['units'] if x['id']=='n1.sec'][0]
pcs=audio.unit_pieces(u); sylls=[p['syll'] for p in pcs]
x,sr=audio.load(R+'/raw/nes/n1.sec/'+take)
a=audio.analyze_array(x,sr,u['syllables'],u['phase'],'f'); thr=a['thr_db']
info=audio.find_pauses(x,sr,thr,'f')
cands=[]
for gi,g in enumerate(info['gaps']):
    s,e=g['cut_region']; mid=int(round((s+e)/2*sr)); rad=max(1,int(min(0.010,(e-s)/4)*sr))
    c=audio.zero_cross_near(x,mid,rad)
    parts,b=audio.split_at(x,[c],sr)
    sp=[audio.speech_measure(p,sr,thr,'f')['speech_sec'] for p in parts]
    dev=audio.boundary_alignment(sp,sylls)
    cands.append({'gap':[round(g['start'],3),round(g['end'],3)],'dur':round(g['dur'],3),'cut_sec':round(c/sr,4),'speech':[round(v,3) for v in sp],
                  'rates':[round(sy/v,2) if v else None for sy,v in zip(sylls,sp)],'misalign':round(dev,3),'_c':c})
cands.sort(key=lambda d:d['misalign'])
best=cands[0]
longest=max(cands,key=lambda d:d['dur'])
parts,b=audio.split_at(x,[best['_c']],sr)
od=os.path.dirname(os.path.abspath(__file__))+'/cuts/n1.sec'; os.makedirs(od,exist_ok=True)
files=[]
for i,p in enumerate(parts):
    fp=od+'/n1.sec#%d.wav'%(i+1); audio.write_wav(fp,p,sr); files.append(fp)
for d in cands: d.pop('_c')
res={'take':take,'thr_db':thr,'sylls':sylls,'candidates':cands,'chosen':{k:v for k,v in best.items()},'longest_gap':longest,
     'chosen_is_longest':best['gap']==longest['gap'],'files':files,
     'note':'SPEC §3 longest-pause rule would cut at gap %s (dur %.3f); sentence-end gap %s (dur %.3f) chosen by syllable alignment'%(longest['gap'],longest['dur'],best['gap'],best['dur'])}
json.dump(res,open(od+'/cut_report.json','w'),ensure_ascii=False,indent=1)
print(json.dumps(res,ensure_ascii=False,indent=1))
