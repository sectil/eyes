#!/usr/bin/env python3
"""rec.py <uid> <take> <ref_node> <asset_id> <stt_node> <session> <gen_id> <credits> <cents> <spoken_sec> <text...>
Stores the Scribe result and runs audio.py compare against the unit's tts text."""
import json,sys,subprocess
W='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render/sel/nes/_w2'
R='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
uid,take,ref,asset,stt,sess,gid,cr,ct,sp=sys.argv[1:11]; text=' '.join(sys.argv[11:])
u=json.load(open(W+f'/unit_{uid}.json'))
p=subprocess.run(['python3',R+'/tools/audio.py','compare',u['tts'],text],capture_output=True,text=True)
rec={'unit':uid,'take':take,'ref_node':ref,'asset_id':asset,'stt_node':stt,'session_id':sess,'generation_id':gid,
     'actual_credits':float(cr),'actual_cents':float(ct),'spoken_duration_secs':float(sp),'scribe_text':text,
     'tts':u['tts'],'compare_exit':p.returncode,'compare_out':p.stdout.strip()}
json.dump(rec,open(W+f'/scribe/{uid}.{take.replace(".mp3","")}.json','w'),ensure_ascii=False,indent=1)
print(uid,take,'EXIT',p.returncode,p.stdout.strip().replace('\n',' '))
