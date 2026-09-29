import sys; sys.path.insert(0,'.')
import timing as t
L=t.load()
eyes=set()
for b in L['blocks']:
  for c in b['clips']:
    tg=c.get('tags',{})
    if 'eyesOpen' in tg or 'eyes' in tg or 'göz' in c['text'].lower() and 'aç' in c['text'].lower(): eyes.add(c['id'])
print(sorted(eyes))
res=[]
for rate in (5.2,5.6,6.6):
  for prof in ('lo','hi'):
    for T in range(20,31):
      p=t.plan(L,T*60,rate,prof)
      last=None
      for e in p['events']:
        i=e['clip']['id']
        if i in eyes: last=e['start']
        if i in ('c5.basla','c5.pencere','c3.agir'):
          res.append((i,rate,prof,T,round(e['start']-last)))
import collections
m=collections.defaultdict(list)
for r in res: m[r[0]].append(r[4])
for k,v in m.items(): print(k,min(v),max(v))
