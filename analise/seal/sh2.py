# uso: python sh2.py out.jpg comp cols scale f1 f2 ...
import sys
from PIL import Image, ImageDraw
out, comp, cols, s, *fr = sys.argv[1:]
cols=int(cols); s=float(s)
d = 'analise/review/seal/st/'
ims = [Image.open(f'{d}{comp}_f{int(f):03d}.jpg') for f in fr]
w, h = int(1080*s), int(1920*s)
cols = min(cols, len(ims)); rows = (len(ims)+cols-1)//cols
sh = Image.new('RGB', (cols*w, rows*h), (0,0,0))
for i, im in enumerate(ims):
    t = im.resize((w, h), Image.LANCZOS)
    dr = ImageDraw.Draw(t); dr.text((6,4), f'f{fr[i]} t={int(fr[i])/30:.2f}', fill=(255,255,0))
    sh.paste(t, ((i%cols)*w, (i//cols)*h))
sh.save(d+out, quality=85)
