# uso: python sheet.py out.jpg f1 f2 ... (cols=6, escala 0.28)
import sys
from PIL import Image, ImageDraw
out, *fr = sys.argv[1:]
d = 'analise/review/'
s = 0.3
w, h = int(1080*s), int(1920*s)
cols = min(6, len(fr)); rows = (len(fr)+cols-1)//cols
sh = Image.new('RGB', (cols*w, rows*h), (0,0,0))
for i, f in enumerate(fr):
    im = Image.open(f'{d}Criativo_f{int(f):03d}.jpg').resize((w, h), Image.LANCZOS)
    dr = ImageDraw.Draw(im); dr.text((6,4), f'f{f} t={int(f)/30:.2f}', fill=(255,255,0))
    sh.paste(im, ((i%cols)*w, (i//cols)*h))
sh.save(d+out, quality=85)
