import sys, json, glob, os
import numpy as np, soundfile as sf
R='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
sys.path.insert(0, R+'/tools'); import audio
W=R+'/sel/hak/_work-hak-2'
units=json.load(open(R+'/units.json'))['units'][34:68]
res={}
for u in units:
    for f in sorted(glob.glob(R+'/sel/hak/%s/*.wav'%u['id'])):
        info=sf.info(f); x,sr=sf.read(f,dtype='float64')
        nz=np.where(np.abs(x)>0)[0]
        head_zero_ms=nz[0]/sr*1000 if len(nz) else None
        tail_zero_ms=(len(x)-1-nz[-1])/sr*1000 if len(nz) else None
        first_step=float(audio.db(np.max(np.abs(x[nz[0]:nz[0]+int(0.001*sr)])))) if len(nz) else None
        last_step=float(audio.db(np.max(np.abs(x[max(0,nz[-1]-int(0.001*sr)):nz[-1]+1])))) if len(nz) else None
        # first/last sample value magnitudes (unfaded edge => step)
        fs=float(audio.db(abs(x[nz[0]]))) if len(nz) else None
        ls=float(audio.db(abs(x[nz[-1]]))) if len(nz) else None
        dur=len(x)/sr
        L=audio.lufs(x,sr) if dur>=1.0 else None
        rms=audio.speech_rms_db(x,sr)
        tp=audio.true_peak_db(x)
        c=audio.detect_clicks(x,sr)
        clip=audio.clipping(x)
        pid=os.path.basename(f)[:-4]
        res[pid]={'unit':u['id'],'file':f,'sr':info.samplerate,'ch':info.channels,'subtype':info.subtype,'dur':round(dur,3),
                  'lufs':None if L is None else round(L,2),'speech_rms_db':None if rms is None else round(rms,2),'true_peak_dbtp':round(tp,2),
                  'clicks':c[0],'click_times':c[1],'clipped':clip.get('clipped') if isinstance(clip,dict) else clip,
                  'head_zero_ms':round(head_zero_ms,1),'tail_zero_ms':round(tail_zero_ms,1),'first_sample_db':round(fs,1),'last_sample_db':round(ls,1),
                  'first_1ms_peak_db':round(first_step,1),'last_1ms_peak_db':round(last_step,1)}
        r=res[pid]
        warn=[]
        if r['sr']!=44100 or r['ch']!=1 or r['subtype']!='FLOAT': warn.append('format')
        if r['clicks']: warn.append('clicks %s'%r['click_times'])
        if r['first_sample_db']>-60: warn.append('onset step %.1f dB'%r['first_sample_db'])
        if r['last_sample_db']>-60: warn.append('end step %.1f dB'%r['last_sample_db'])
        if r['true_peak_dbtp']>-1.5: warn.append('tp')
        print('%-20s dur %6.3f lufs %6s rms %6s tp %6.2f clk %d head0 %5.1f tail0 %5.1f first %6.1f last %6.1f %s'%(pid,r['dur'],r['lufs'],r['speech_rms_db'],r['true_peak_dbtp'],r['clicks'],r['head_zero_ms'],r['tail_zero_ms'],r['first_sample_db'],r['last_sample_db'],' '.join(warn)))
json.dump(res,open(W+'/verify_out.json','w'),indent=1,default=lambda o: o.item() if hasattr(o,'item') else str(o))
