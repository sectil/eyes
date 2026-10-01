"""download re-take mp3s to raw/nes/<unit>/t<slot>.mp3, verify with soundfile, append 'retake' section to takes.json"""
import json, sys, subprocess, os, datetime, soundfile as sf
R='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
meta=json.load(open(sys.argv[1]))          # retake_<unit>.json with gens:[{slot,session_id,generation_id,duration_secs,url}]
u=meta['unit']; d=R+'/raw/nes/'+u
out=[]
for g in meta['gens']:
    fp=d+'/t%d.mp3'%g['slot']
    assert not os.path.exists(fp), fp+' exists'
    ok=False
    for att in range(1,4):
        subprocess.run(['curl','-sS','-o',fp,g['url']],check=False)
        try:
            i=sf.info(fp); ok=True; break
        except Exception as e:
            err=str(e)
    rec={'take':g['slot'],'file':fp,'generation_id':g['generation_id'],'session_id':g['session_id'],'url':g['url'],
         'node_id':meta['node_id'],'api_duration_secs':g['duration_secs'],'ok':ok,'attempts':att}
    if ok: rec.update({'duration_secs':round(i.duration,3),'samplerate':i.samplerate,'channels':i.channels,'bytes':os.path.getsize(fp)})
    out.append(rec); print(rec['take'],ok,rec.get('duration_secs'),rec.get('bytes'))
tj=json.load(open(d+'/takes.json'))
tj.setdefault('retake',{}).update({'who':'nes-1-sel','rule':'SPEC §4.2 single re-take','node_id':meta['node_id'],'session_ids':meta['session_ids'],
   'requested_at':meta['requested_at'],'downloaded_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'reason':meta.get('reason'),'takes':out})
json.dump(tj,open(d+'/takes.json','w'),ensure_ascii=False,indent=1)
