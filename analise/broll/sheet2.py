import sys, os
from PIL import Image, ImageDraw
# uso: sheet2.py COMP out.jpg f1 f2 ...  (em analise/review/broll4)
d = os.path.join(os.path.dirname(__file__), "..", "review", "broll4")
comp, out, frames = sys.argv[1], sys.argv[2], sys.argv[3:]
ims=[]
for f in frames:
    im = Image.open(os.path.join(d, f"{comp}_f{int(f):03d}.jpg")).convert("RGB")
    ImageDraw.Draw(im).text((4,4), f"f{f}", fill=(255,255,0)); ims.append(im)
w,h = ims[0].size
S = Image.new("RGB",(w*len(ims),h))
for i,im in enumerate(ims): S.paste(im,(i*w,0))
S.save(os.path.join(d,out),quality=85)
