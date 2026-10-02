import sys, json, numpy as np
R='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
sys.path.insert(0, R+'/tools'); import audio
units=json.load(open(R+'/units.json'))['units'][34:68]
out={}
for u in units:
    for t in ('t1','t2','t3'):
        p=R+'/raw/hak/%s/%s.mp3'%(u['id'],t)
        x,sr=audio.load(p)
        thr,_=audio.silence_threshold_in(x,sr)
        n=int(0.002*sr)
        fl=audio._frame_db(x,n)
        loud=np.where(fl>=thr)[0]
        first=loud[0]*2 if len(loud) else None
        # isolated burst at start: loud frames within first 40 ms followed by >=20 ms quiet
        head=fl[:60]  # 120 ms
        iso=None
        if len(loud) and loud[0]<20:
            # run length of loud from first
            j=loud[0]
            while j+1<len(fl) and fl[j+1]>=thr: j+=1
            runms=(j-loud[0]+1)*2
            # quiet after
            k=j+1
            while k<len(fl) and fl[k]<thr: k+=1
            quietms=(k-j-1)*2
            if runms<=30 and quietms>=20: iso=dict(start_ms=int(loud[0]*2),run_ms=runms,quiet_after_ms=quietms,peak_db=round(float(fl[loud[0]:j+1].max()),1))
        # first nonzero sample step
        nz=np.where(np.abs(x)>1e-5)[0]
        fnz=int(nz[0]) if len(nz) else None
        step=None
        if fnz is not None:
            seg=x[fnz:fnz+int(0.001*sr)]
            step=round(float(audio.db(np.max(np.abs(seg)))),1)
        tail=fl[-60:]
        lastloud=(len(fl)-1-loud[-1])*2 if len(loud) else None
        c=audio.detect_clicks(x,sr)
        out[u['id']+'/'+t]=dict(thr=round(thr,1),first_loud_ms=first,iso_head=iso,first_nz_ms=round(fnz/sr*1000,1) if fnz is not None else None,
            first_1ms_peak_db=step,head_max_db=round(float(fl[:10].max()),1),tail_quiet_ms=lastloud,tail_max_db=round(float(fl[-10:].max()),1),clicks=c[0],click_t=c[1])
        o=out[u['id']+'/'+t]
        mark=' <<<' if (iso or (o['first_loud_ms'] is not None and o['first_loud_ms']<10) or o['head_max_db']>thr or o['tail_max_db']>thr or c[0]) else ''
        print('%-14s %s thr%6.1f firstloud %4s ms nz %6s ms 1ms %6s headmax %6.1f tailmax %6.1f tailq %4s iso %s clk %s%s'%(u['id'],t,thr,o['first_loud_ms'],o['first_nz_ms'],o['first_1ms_peak_db'],o['head_max_db'],o['tail_max_db'],o['tail_quiet_ms'],iso,c[0],mark))
json.dump(out,open("edge_survey.json","w"),indent=1,default=lambda o: o.item() if hasattr(o,"item") else str(o))
