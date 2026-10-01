import json,re,unicodedata
L=json.load(open('../pilot/ders2.lesson.json'))
V=set('aeıioöuüâîûAEIİOÖUÜÂÎÛ')
def syl(t):
    t=unicodedata.normalize('NFC',t)
    # independent: count vowel letters per word token (Turkish has no diphthongs)
    n=0
    for w in re.findall(r"\w+",t):
        if re.search(r'\d',w): raise ValueError('digit in '+t)
        n+=sum(ch in V for ch in w)
    return n
bad=[];cnt=0
def chk(cid,text,s):
    global cnt;cnt+=1
    if syl(text)!=s: bad.append((cid,text,s,syl(text)))
allc={}
for b in L['blocks']:
    for c in b['clips']:
        allc[c['id']]=c
        chk(c['id'],c['text'],c['syllables'])
        for i,a in enumerate(c.get('alternates') or []): chk(c['id']+'.alt%d'%i,a['text'],a['syllables'])
        for k,s in (c.get('scenes') or {}).items(): chk(c['id']+'.'+k,s['text'],s['syllables'])
        # other fields
        if c['words']!=len(re.findall(r"[A-Za-zÇĞİÖŞÜçğıöşüÂÎÛâîû]+",c['text'])): bad.append(('words',c['id'],c['words']))
for ex in L['extras'].values():
    for c in ex['clips']:
        chk(ex['id']+':'+c['id'],c['text'],c['syllables'])
        if c['id'] in allc and allc[c['id']]['text']!=c['text']: print('extras text differs from block clip',c['id'])
for car in L['carriers']:
    chk(car['id'],car['text'],car['syllables'])
    s=sum(allc[i]['syllables'] for i in car['items'])
    joined=' '.join(allc[i]['text'] for i in car['items'])
    if s!=car['syllables']: bad.append(('carrier sum',car['id'],s,car['syllables']))
    lead=car.get('lead') or ''
    if joined.replace(' ','')!=(car['text']).replace(' ','') : print('carrier text != items',car['id'],'|',car['text'],'|',joined)
print('checked',cnt,'bad',len(bad))
for x in bad: print(x)
# carriers with no clip/ clips with carrier not in carriers
cars={c['id']:c for c in L['carriers']}
for c in allc.values():
    if c.get('carrier') and c['carrier'] not in cars: print('missing carrier',c['id'],c['carrier'])
    if c.get('carrier') and c['id'] not in cars[c['carrier']]['items']: print('clip not in its carrier items',c['id'])
