import json,sys,re
for n in (1,3,5):
    d=json.load(open(f'ders{n}/ders{n}.lesson.json'))
    md=open(f'ders{n}/ders{n}.script.md').read()
    texts=[]
    def walk(o):
        if isinstance(o,dict):
            if 'text' in o and isinstance(o['text'],str):
                t=o['text']; texts.append((o.get('id'),t))
                subs=o.get('subclips')
                if subs:
                    st=[s['text'] if isinstance(s,dict) else s for s in subs]
                    if ' '.join(st)!=t: print(n,'SUBCLIP MISMATCH',o.get('id'),st,'|',t)
                tu=o.get('ttsUnit')
                if isinstance(tu,str) and tu!=t: print(n,'TTSUNIT MISMATCH',o.get('id'),tu)
                if isinstance(tu,dict) and tu.get('text')!=t: print(n,'TTSUNIT MISMATCH',o.get('id'),tu)
                if 'screen' in o and o['screen']!=t: print(n,'SCREEN',o.get('id'),o['screen'])
                sh=o.get('short')
                if isinstance(sh,dict):
                    ssubs=sh.get('subclips')
                    if ssubs:
                        st=[s['text'] if isinstance(s,dict) else s for s in ssubs]
                        if ' '.join(st)!=sh.get('text'): print(n,'SHORT SUBCLIP MISMATCH',o.get('id'))
            for k,v in o.items(): walk(v)
        elif isinstance(o,list):
            for v in o: walk(v)
    walk({k:d[k] for k in ('carriers','blocks','extras')})
    miss=[(i,t) for i,t in texts if t and t not in md]
    print(n,'texts',len(texts),'missing in md:',miss[:20])
    # carriers
    for c in d['carriers']:
        print(n,'carrier',c['id'],'items',len(c['items']), 'ellipsis-split', len([x for x in re.split(r'…',c['text']) if x.strip()]))
