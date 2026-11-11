# uso: sheet2.py <out.jpg> <cols> <scale> <img1> <img2> ...
import sys, re, os
from PIL import Image, ImageDraw
out, cols, scale = sys.argv[1], int(sys.argv[2]), float(sys.argv[3])
paths = sys.argv[4:]
ims = [Image.open(p) for p in paths]
w, h = int(ims[0].width*scale), int(ims[0].height*scale)
rows = (len(ims)+cols-1)//cols
sheet = Image.new("RGB", (cols*w, rows*h), (30,30,30))
for i,(p,im) in enumerate(zip(paths,ims)):
    im = im.resize((w,h))
    m = re.search(r"f(\d+)", os.path.basename(p))
    ImageDraw.Draw(im).text((6,6), (m.group(1) if m else "?"), fill=(255,255,0))
    sheet.paste(im, ((i%cols)*w,(i//cols)*h))
sheet.save(out, quality=88)
