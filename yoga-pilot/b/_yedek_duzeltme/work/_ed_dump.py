import json,sys
d=json.load(open(sys.argv[1]))
seen=set()
def walk(o,path):
  if isinstance(o,dict):
    ident=o.get('id')
    for k,v in o.items():
      p=path+[str(ident) if ident and k in('text','screen','screenText','tts') else k] if False else path+[k]
      if k in ('text','screen','screenText','tts','lead') and isinstance(v,str):
        tag=(ident or '/'.join(path[-2:]))+('' if k=='text' else '['+k+']')
        if path and path[-1]=='short': tag=tag+'[short]'
        print(f"{tag}\t{v}")
      else:
        walk(v,path+[k if not ident else ident+'.'+k])
  elif isinstance(o,list):
    for i,v in enumerate(o): walk(v,path+[str(i)])
walk({k:d[k] for k in ('carriers','blocks','extras')},[])
