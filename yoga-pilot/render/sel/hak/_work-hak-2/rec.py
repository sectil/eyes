import json,sys,subprocess
R='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
W=R+'/sel/hak/_work-hak-2'
# args: unit take stt_session gen credits cents spoken_secs text
unit,take,sess,gen,cr,ce,spk,text=sys.argv[1:9]
u=[x for x in json.load(open(R+'/units.json'))['units'] if x['id']==unit][0]
p=subprocess.run([sys.executable,R+'/tools/audio.py','compare',u['tts'],text],capture_output=True,text=True)
att=[json.loads(l) for l in open(W+'/attach.jsonl') if l.strip()]
att=[a for a in att if a['unit']==unit and a['take']==take][-1]
stt=[json.loads(l) for l in open(W+'/stt.jsonl') if l.strip()]
stt=[a for a in stt if a['unit']==unit and a['take']==take][-1]
rec={'unit':unit,'take':take,'asset_id':att['asset_id'],'asset_size_bytes':att['size_bytes'],'ref_node':att['src_node'],'stt_node':stt['stt_node'],'session_id':sess,'generation_id':gen,
     'actual_credits':float(cr),'actual_cents':float(ce),'spoken_duration_secs':float(spk),'scribe_text':text,'tts':u['tts'],
     'compare_exit':p.returncode,'compare':p.stdout.strip()}
json.dump(rec,open(W+'/scribe/%s.%s.json'%(unit,take),'w'),ensure_ascii=False,indent=1)
print(unit,take,'MATCH' if p.returncode==0 else 'DIFF', p.stdout.strip().replace('\n',' ')[:400])
