import sys
from PIL import Image, ImageDraw
prefix=sys.argv[1]; frames=sys.argv[2].split(','); out=sys.argv[3]
y0,y1=1050,1650
ims=[]
for f in frames:
    im=Image.open(f"analise/review/{prefix}_f{f}.png").convert("RGB").crop((0,y0,1080,y1))
    d=ImageDraw.Draw(im); d.text((10,8),f"f{f} t={int(f)/30:.2f}",fill=(255,255,0))
    ims.append(im.resize((720,400)))
cols=2; rows=(len(ims)+1)//2
sheet=Image.new("RGB",(cols*720,rows*400))
for k,im in enumerate(ims): sheet.paste(im,((k%cols)*720,(k//cols)*400))
sheet.save(out)
