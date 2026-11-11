import sys
from PIL import Image, ImageDraw
d="review/caps3/"
fr=sys.argv[2:]; out=sys.argv[1]
y0,y1=1150,1700
tiles=[]
for f in fr:
    im=Image.open(f"{d}CaptionsMatte_f{int(f):03d}.jpg").convert("RGB").crop((0,y0,1080,y1))
    ImageDraw.Draw(im).text((8,8),f"f{f}",fill=(255,255,255))
    tiles.append(im)
cols=2; rows=(len(tiles)+1)//2
W=1080;H=y1-y0
sh=Image.new("RGB",(W*cols//1,H*rows))
for i,t in enumerate(tiles): sh.paste(t,((i%cols)*W,(i//cols)*H))
sh=sh.resize((sh.width*2//3,sh.height*2//3))
sh.save(out,quality=88)
