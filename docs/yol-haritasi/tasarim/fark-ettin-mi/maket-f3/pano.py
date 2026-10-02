# Denetim panosu: bir anın 4 görüntüsü yan yana (390 açık/koyu, 320 açık/koyu). python3 pano.py <an> [çıktı]
import sys
from PIL import Image
an = sys.argv[1]
out = sys.argv[2] if len(sys.argv) > 2 else f'/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/pano-{an}.png'
names = [f'goruntu/{an}-390-acik.png', f'goruntu/{an}-390-koyu.png', f'goruntu/{an}-320-acik.png', f'goruntu/{an}-320-koyu.png']
ims = [Image.open(n).convert('RGB') for n in names]
s = 0.5
ims = [i.resize((int(i.width * s), int(i.height * s))) for i in ims]
W = sum(i.width for i in ims) + 20 * 3
H = max(i.height for i in ims)
c = Image.new('RGB', (W, H), (128, 128, 128))
x = 0
for i in ims:
    c.paste(i, (x, 0)); x += i.width + 20
c.save(out)
print(out)
