import sys, glob, os
from PIL import Image, ImageDraw
frames = sorted(int(os.path.basename(p)[10:13]) for p in glob.glob("Criativo_f*.png"))
per = 12; cols = 6; tw, th = 300, 533
for si in range(0, len(frames), per):
    chunk = frames[si:si+per]
    rows = (len(chunk)+cols-1)//cols
    sheet = Image.new("RGB", (cols*tw, rows*th), (20,20,20))
    d = ImageDraw.Draw(sheet)
    for i, f in enumerate(chunk):
        im = Image.open(f"Criativo_f{f:03d}.png").convert("RGB").resize((tw, th), Image.LANCZOS)
        x, y = (i%cols)*tw, (i//cols)*th
        sheet.paste(im, (x, y))
        d.rectangle([x, y, x+120, y+22], fill=(0,0,0))
        d.text((x+4, y+4), f"f{f} {f/30:.2f}s", fill=(255,255,0))
    out = f"sheet_{si//per+1}.jpg"
    sheet.save(out, quality=88); print(out, chunk)
