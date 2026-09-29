import re,json,sys,urllib.parse,subprocess,time
qs=sys.argv[1:]
out=[]
for q in qs:
    url="https://www.youtube.com/results?search_query="+urllib.parse.quote(q)+"&hl=tr&gl=TR"
    html=subprocess.run(["curl","-sS","-L","-A","Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36","-H","Accept-Language: tr-TR,tr;q=0.9",url],capture_output=True,text=True).stdout
    m=re.search(r'var ytInitialData = (\{.*?\});</script>',html,re.S)
    if not m:
        print("NO DATA",q,len(html)); continue
    d=json.loads(m.group(1))
    vids=[]
    def walk(o):
        if isinstance(o,dict):
            if 'videoRenderer' in o:
                v=o['videoRenderer']
                t=''.join(r.get('text','') for r in v.get('title',{}).get('runs',[]))
                vc=v.get('viewCountText',{}).get('simpleText') or ''.join(r.get('text','') for r in v.get('viewCountText',{}).get('runs',[]))
                ln=v.get('lengthText',{}).get('simpleText','')
                ch=''.join(r.get('text','') for r in v.get('ownerText',{}).get('runs',[]))
                pub=v.get('publishedTimeText',{}).get('simpleText','')
                vids.append((t,ch,ln,vc,pub,v.get('videoId')))
            for k in o.values(): walk(k)
        elif isinstance(o,list):
            for k in o: walk(k)
    walk(d)
    print("=== ",q)
    for v in vids[:8]:
        print(" | ".join(str(x) for x in v))
    time.sleep(1.5)
