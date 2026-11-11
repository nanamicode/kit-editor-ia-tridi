import numpy as np, soundfile as sf
from PIL import Image, ImageDraw
a,sr=sf.read("analise/captions/speech.wav")
t0,t1=8.4,11.5
hop=int(sr*0.005); n=1024
w=np.hanning(n)
cols=[]
for s in range(int((t0-7.5)*sr), int((t1-7.5)*sr)-n, hop):
    f=np.abs(np.fft.rfft(a[s:s+n]*w))
    cols.append(f)
S=20*np.log10(np.array(cols).T+1e-6)
fmax=int(5000/(sr/2)*S.shape[0]); S=S[:fmax][::-1]
S=np.clip((S-S.max()+70)/70,0,1)
img=(S*255).astype(np.uint8)
im=Image.fromarray(img).convert("RGB")
# upscale x by 1 (5ms per px) -> width ~620; scale 2.5
im=im.resize((im.width*3, 400))
d=ImageDraw.Draw(im)
pxs=im.width/(t1-t0)
for t in np.arange(t0,t1,0.1):
    x=(t-t0)*pxs
    d.line([(x,0),(x,12 if abs(t*10-round(t*10))<1e-6 else 6)],fill=(255,255,0))
    if abs((t*10)%2)<1e-6 or abs((t*10)%2-2)<1e-6: d.text((x+2,14),f"{t:.1f}",fill=(255,255,0))
im.save("analise/captions/spec.png")
print(im.size)
