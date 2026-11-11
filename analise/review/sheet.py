import sys
from PIL import Image, ImageDraw
# uso: python sheet.py out.jpg f1 f2 ...
out=sys.argv[1]; frs=[int(x) for x in sys.argv[2:]]
w,h=432,768
n=len(frs); cols=min(n,4); rows=(n+cols-1)//cols
sh=Image.new("RGB",(cols*w,rows*h),(30,30,30))
for i,f in enumerate(frs):
    im=Image.open("BRoll_f%03d.jpg"%f).convert("RGB").resize((w,h))
    d=ImageDraw.Draw(im); d.rectangle((0,0,70,26),fill=(0,0,0)); d.text((6,6),"f%d"%f,fill=(255,255,0))
    sh.paste(im,((i%cols)*w,(i//cols)*h))
sh.save(out,quality=85)
