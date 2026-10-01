import json,sys,subprocess,os
W=os.path.dirname(os.path.abspath(__file__))
R=W+'/../../..'
# args: unit take asset_id src_node stt_node session gen credits cents text [spoken]
unit,take,asset,src,stt,sess,gen,cr,ce,text=sys.argv[1:11]
spoken=sys.argv[11] if len(sys.argv)>11 else None
u=[x for x in json.load(open(R+'/units.json'))['units'] if x['id']==unit][0]
p=subprocess.run([sys.executable,R+'/tools/audio.py','compare',u['tts'],text],capture_output=True,text=True)
rec={'unit':unit,'take':take,'asset_id':asset,'source_node_id':src,'stt_node_id':stt,'session_id':sess,'generation_id':gen,
     'actual_credits':float(cr),'actual_cents':float(ce),'scribe_text':text,'spoken_duration_secs':spoken,
     'compare_exit':p.returncode,'compare_out':p.stdout.strip()}
json.dump(rec,open(W+'/scribe/%s.%s.json'%(unit,take),'w'),ensure_ascii=False,indent=1)
print(unit,take,'MATCH' if p.returncode==0 else 'DIFF', p.stdout.strip()[:400])
