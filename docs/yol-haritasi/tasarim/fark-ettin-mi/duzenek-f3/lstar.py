# Cam figürün ortalama açıklığı (CIE L*): figür alanı = maske görüntüsünde macenta pikseller
import sys, glob, json, os
from PIL import Image
def lstar(c):
    r,g,b=[v/255 for v in c]
    lin=lambda u: u/12.92 if u<=0.04045 else ((u+0.055)/1.055)**2.4
    Y=0.2126*lin(r)+0.7152*lin(g)+0.0722*lin(b)
    return 116*(Y**(1/3))-16 if Y>0.008856 else 903.3*Y
D=sys.argv[1]; out={}
for f in sorted(glob.glob(D+'/cam-*-maske.png')):
    base=f.replace('-maske','')
    a=Image.open(base).convert('RGB'); m=Image.open(f).convert('RGB')
    vals=[lstar(a.getpixel((x,y))) for y in range(0,a.height,2) for x in range(0,a.width,2) if (lambda p: p[0]>200 and p[1]<80 and p[2]>200)(m.getpixel((x,y)))]
    if vals:
        vals.sort(); out[os.path.basename(base)[4:-4]]={'L_ort':round(sum(vals)/len(vals),1),'L_p10':round(vals[len(vals)//10],1),'L_p90':round(vals[len(vals)*9//10],1),'piksel':len(vals)}
print(json.dumps(out,ensure_ascii=False)); json.dump(out,open(D+'/cam-lstar.json','w'),indent=1)
