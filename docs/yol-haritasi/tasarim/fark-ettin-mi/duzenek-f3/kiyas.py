# Maketle yan yana pano: kiyas/<an>-<w>-<tema>.png (sol maket, sağ uygulama) ve her genişlik×tema için toplu pano
import os
from PIL import Image, ImageDraw
D=os.path.dirname(os.path.abspath(__file__))+'/..'
M=D+'/tasarim/goruntu/'; A=D+'/ekran/'; K=D+'/kiyas/'
os.makedirs(K,exist_ok=True)
AN={'04-once':'04-once','04-sonra':'04-sayi','05':'05-degisti-1','06':'06-degisti-2','09':'09-kacan-adim1','10':'10-kacan-adim2','11':'11-s1','12':'12-sonuc','12-kart':'12-kart'}
for w in ('390','320'):
  for t in ('acik','koyu'):
    pairs=[]
    for an,app in AN.items():
      m=M+f'{an}-{w}-{t}.png'; a=A+f'{app}-{w}-{t}.png'
      if not (os.path.exists(m) and os.path.exists(a)): continue
      im=Image.open(m).convert('RGB'); ia=Image.open(a).convert('RGB')
      H=max(im.height,ia.height)+40; W=im.width+ia.width+20
      o=Image.new('RGB',(W,H),'white'); d=ImageDraw.Draw(o)
      d.text((10,10),f'MAKET {an}',fill='black'); d.text((im.width+30,10),f'UYGULAMA {app}',fill='black')
      o.paste(im,(0,40)); o.paste(ia,(im.width+20,40)); o.save(K+f'{an}-{w}-{t}.png'); pairs.append(o)
    if pairs:
      sc=3; W=sum(p.width for p in pairs)//sc+10*len(pairs); H=max(p.height for p in pairs)//sc
      o=Image.new('RGB',(W,H),'white'); x=0
      for p in pairs: o.paste(p.resize((p.width//sc,p.height//sc)),(x,0)); x+=p.width//sc+10
      o.save(K+f'pano-{w}-{t}.png')
print('kiyas', len(os.listdir(K)))
