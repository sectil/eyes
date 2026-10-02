"""Heuristic syllable-nucleus counter (supporting evidence for SPEC §4.3(c) metric-only cut check; not a gate).
Band 300-2500 Hz energy, 10 ms frames, smoothed 30 ms; peaks with >= 4 dB prominence, >= 90 ms apart, within 25 dB of the piece max."""
import numpy as np, soundfile as sf, json, sys, glob, os
from scipy.signal import butter, sosfiltfilt, find_peaks
def nuclei(path):
    x,sr=sf.read(path)
    if x.ndim>1: x=x[:,0]
    sos=butter(4,[300,2500],btype='band',fs=sr,output='sos'); y=sosfiltfilt(sos,x)
    hop=int(0.01*sr); n=len(y)//hop
    e=np.array([np.mean(y[i*hop:(i+1)*hop]**2) for i in range(n)])+1e-12
    db=10*np.log10(e); k=np.ones(3)/3; db=np.convolve(db,k,'same')
    pk,_=find_peaks(db,prominence=4,distance=9)
    pk=[p for p in pk if db[p]>db.max()-25]
    return len(pk)
if __name__=='__main__':
    R='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
    proc=json.load(open(R+'/sel/hak/_work-hak-1/proc.json'))
    out={}
    for uid,r in proc.items():
        if 'cut' not in r: continue
        for p in r['cut']['pieces']:
            exp=[q for q in r['pieces'] if q['piece_id']==p['name']][0]['syll']
            out.setdefault(uid,[]).append((p['name'],exp,nuclei(p['file'])))
    json.dump(out,open(R+'/sel/hak/_work-hak-1/nuclei.json','w'),indent=0)
    import statistics
    diffs=[]
    for uid,l in out.items():
        print(uid,' '.join('%s:%d/%d'%(n[-3:],e,c) for n,e,c in l))
        diffs+= [c-e for n,e,c in l]
    print('mean diff',statistics.mean(diffs),'abs mean',statistics.mean(abs(d) for d in diffs))
