import json,sys
W='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render/sel/nes/_w2'
R='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
r=json.load(open(W+'/rank.json')); m=json.load(open(W+'/urls.json'))
uid=sys.argv[1]; rank=int(sys.argv[2]) if len(sys.argv)>2 else 0
take=r[uid]['ranking'][rank]['take']; n=int(take[1])
tj=json.load(open(f'{R}/raw/nes/{uid}/takes.json'))
t=[x for x in tj['takes'] if x['take']==n][0]
g=t['generation_id']
print(uid,take,g,t['duration_secs'])
print(m.get(g,{}).get('url','NO_URL'))
