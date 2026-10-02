import json,sys,os,subprocess,datetime
import soundfile as sf
R='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
D=R+'/raw/hak/k.yan/retake'
call=json.load(open(R+'/sel/hak/_work-hak-2/retake_kyan_call.json'))
spec=[l.split() for l in open(sys.argv[1]) if l.strip()]
takes=[]
for n,(sess,gen,dur,url) in enumerate(spec,1):
    p=D+'/t%d.mp3'%n
    r=subprocess.run(['curl','-sSfL','--retry','2','-o',p,url],capture_output=True,text=True)
    info=sf.info(p); x,sr=sf.read(p)
    takes.append({'take':n,'file':p,'generation_id':gen,'session_id':sess,'url':url,'node_id':call['node_id'],'api_duration_secs':float(dur),
                  'ok':r.returncode==0 and len(x)/sr>0.3,'duration_secs':round(len(x)/sr,4),'samplerate':sr,'channels':info.channels,'bytes':os.path.getsize(p)})
    print(n,takes[-1]['ok'],takes[-1]['duration_secs'],takes[-1]['bytes'])
out={'unit':'k.yan','voice':'hak','voice_id':'DwjDVVARfPVjBKepXK2c','model_id':'eleven_v4','flow_id':'zAYOhRc6cOKeStKp4ijv','node_id':call['node_id'],
     'session_ids':call['session_ids'],'requested_at':call['requested_at'],'downloaded_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),
     'tts':call['prompt'],'generations_count':3,'takes':takes,'retake':True,
     'retake_reason':'SPEC 4.2: Scribe word sequence of all 3 original takes != script ("Sırt üstü" transcribed for "Sırtüstü")','who':'hak-2-sel',
     'server_prompt_echo':call['prompt']}
json.dump(out,open(D+'/takes.json','w'),ensure_ascii=False,indent=1)
