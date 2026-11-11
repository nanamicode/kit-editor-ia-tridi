import numpy as np, onnxruntime as ort, glob, os, time
from PIL import Image
s=ort.InferenceSession('modelos/rvm_mobilenetv3_fp32.onnx',providers=['CPUExecutionProvider'])
rec=[np.zeros((1,1,1,1),dtype=np.float32) for _ in range(4)]
dr=np.array([0.4],dtype=np.float32)
files=sorted(glob.glob('analise/src/f*.png'))
t=time.time()
for i,f in enumerate(files):
    im=np.asarray(Image.open(f).convert('RGB'),dtype=np.float32)/255.
    x=im.transpose(2,0,1)[None]
    fgr,pha,*rec=s.run(None,{'src':x,'r1i':rec[0],'r2i':rec[1],'r3i':rec[2],'r4i':rec[3],'downsample_ratio':dr})
    a=(pha[0,0]*255).clip(0,255).astype(np.uint8)
    rgb=(fgr[0].transpose(1,2,0)*255).clip(0,255).astype(np.uint8)
    out=np.dstack([rgb,a])
    Image.fromarray(out,'RGBA').save('analise/matte/m%04d.png'%(i+1))
    if i%10==0: print(i,len(files),round(time.time()-t,1),flush=True)
