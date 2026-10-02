import json,sys,subprocess,os
W='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render/sel/hak/_work-hak-1'
R='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
# args: unit take src_node asset_id stt_node session gen credits cents spoken_secs text
unit,take,src,asset,stt,sess,gen,cr,ce,spk,text=sys.argv[1:12]
u=[x for x in json.load(open(R+'/units.json'))['units'] if x['id']==unit][0]
p=subprocess.run([sys.executable,R+'/tools/audio.py','compare',u['tts'],text],capture_output=True,text=True)
rec={'unit':unit,'take':take,'asset_id':asset,'source_node_id':src,'stt_node_id':stt,'session_id':sess,'generation_id':gen,
     'actual_credits':float(cr),'actual_cents':float(ce),'spoken_duration_secs':float(spk),'scribe_text':text,'tts':u['tts'],
     'compare_exit':p.returncode,'compare':p.stdout.strip()}
json.dump(rec,open(W+'/scribe/%s.%s.json'%(unit,take),'w'),ensure_ascii=False,indent=1)
print(unit,take,'MATCH' if p.returncode==0 else 'DIFF', p.stdout.strip().replace('\n',' ')[:400])
