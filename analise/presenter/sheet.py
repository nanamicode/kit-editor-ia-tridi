# uso: python sheet.py out.jpg comp f1 f2 ... (cols=4, escala 0.5)
import sys
from PIL import Image, ImageDraw
out, comp, *fr = sys.argv[1:]
d = 'analise/review/presenter/'
ims = [Image.open(f'{d}{comp}_f{int(f):03d}.jpg') for f in fr]
s = 0.5
w, h = int(1080*s), int(1920*s)
cols = min(4, len(ims)); rows = (len(ims)+cols-1)//cols
sh = Image.new('RGB', (cols*w, rows*h), (0,0,0))
for i, im in enumerate(ims):
    t = im.resize((w, h), Image.LANCZOS)
    dr = ImageDraw.Draw(t); dr.text((6,4), f'f{fr[i]} t={int(fr[i])/30:.2f}', fill=(255,255,0))
    sh.paste(t, ((i%cols)*w, (i//cols)*h))
sh.save(d+out, quality=85)
