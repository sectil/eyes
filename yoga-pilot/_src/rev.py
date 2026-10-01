import json,subprocess,sys,time,re
apps={'calm':('us','571800810'),'headspace':('us','493145008'),'insighttimer':('us','337472899'),'balance':('us','1361356590'),'medito':('us','1500780518'),'wakingup':('us','1307736395'),'meditopia_tr':('tr','1190294015'),'meditopia_us':('us','1190294015')}
allrev={}
for name,(cc,aid) in apps.items():
    revs=[]
    for page in range(1,11):
        for sort in ['mostRecent']:
            url=f"https://itunes.apple.com/{cc}/rss/customerreviews/page={page}/id={aid}/sortBy={sort}/json"
            r=subprocess.run(["curl","-sS","-A","Mozilla/5.0",url],capture_output=True,text=True).stdout
            try:
                d=json.loads(r)
            except Exception as e:
                print(name,page,'ERR',r[:80]); break
            entries=d.get('feed',{}).get('entry',[])
            if isinstance(entries,dict): entries=[entries]
            for e in entries:
                if 'content' not in e: continue
                revs.append({'rating':e.get('im:rating',{}).get('label'),'title':e.get('title',{}).get('label'),'content':e.get('content',{}).get('label'),'updated':e.get('updated',{}).get('label'),'id':e.get('id',{}).get('label')})
        time.sleep(0.5)
    allrev[name]=revs
    print(name,len(revs))
json.dump(allrev,open('appstore_reviews.json','w'),ensure_ascii=False)
