import sys
from PIL import Image, ImageDraw
d, out, start, step, n, cols = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5]), int(sys.argv[6])
scale = float(sys.argv[7]) if len(sys.argv) > 7 else 0.5
fr = [start + i*step for i in range(n)]
ims = [Image.open(f"{d}/element-{f}.jpeg") for f in fr]
w, h = int(ims[0].width*scale), int(ims[0].height*scale)
rows = (n + cols - 1)//cols
sheet = Image.new("RGB", (cols*w, rows*h), (30,30,30))
for i, (f, im) in enumerate(zip(fr, ims)):
    im = im.resize((w, h))
    dr = ImageDraw.Draw(im); dr.text((6,6), f"{f} ({f/30:.2f}s)", fill=(255,255,0))
    sheet.paste(im, ((i % cols)*w, (i//cols)*h))
sheet.save(out, quality=88)
