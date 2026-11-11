import sys, os
from PIL import Image, ImageDraw
# uso: sheet.py out.jpg cols f1 f2 ...
out, cols, frames = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
d = os.path.join(os.path.dirname(__file__), "..", "review", "broll3")
ims = []
for f in frames:
    im = Image.open(os.path.join(d, f"{os.environ.get('NAME','BRoll')}_f{int(f):03d}.jpg")).convert("RGB")
    dr = ImageDraw.Draw(im); dr.rectangle([0,0,70,22], fill=(0,0,0)); dr.text((4,4), f"f{f}", fill=(255,255,0))
    ims.append(im)
w, h = ims[0].size
rows = (len(ims)+cols-1)//cols
S = Image.new("RGB", (cols*w, rows*h), (40,40,40))
for i, im in enumerate(ims):
    S.paste(im, ((i%cols)*w, (i//cols)*h))
S.save(os.path.join(d, out), quality=85)
