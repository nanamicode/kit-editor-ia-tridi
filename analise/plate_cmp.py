import cv2,numpy as np,sys,os
# usage: plate_cmp.py out.jpg dirA,dirB frames... [--box y0,y1,x0,x1]
args=sys.argv[1:]
box=[800,1000,150,760]
if '--box' in args:
    k=args.index('--box'); box=[int(v) for v in args[k+1].split(',')]; args=args[:k]+args[k+2:]
out=args[0]; dirs=args[1].split(','); fr=[int(a) for a in args[2:]]
def ld(d,i):
    for e in ('jpg','png'):
        p='%s/c%04d.%s'%(d,i,e)
        if os.path.exists(p): return cv2.imread(p)
    raise FileNotFoundError(d+str(i))
y0,y1,x0,x1=box
rows=[]
for i in fr:
    ims=[cv2.imread('analise/src/f%04d.png'%i)]+[ld(d,i) for d in dirs]
    r=np.hstack([im[y0:y1,x0:x1] for im in ims])
    cv2.putText(r,str(i),(8,26),0,0.8,(0,255,0),2)
    rows.append(r)
cv2.imwrite(out,np.vstack(rows),[cv2.IMWRITE_JPEG_QUALITY,88])
