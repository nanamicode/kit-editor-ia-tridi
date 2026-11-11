import cv2,numpy as np,sys
def comp(path,bg):
    im=cv2.imread(path,-1).astype(np.float32); a=im[...,3:]/255.
    b=np.zeros_like(im[...,:3]); b[:]=bg[::-1]
    return (im[...,:3]*a+b*(1-a)).astype(np.uint8)
i=int(sys.argv[1]); y0,y1,x0,x1=[int(v) for v in sys.argv[2].split(',')]; out=sys.argv[3]; d=sys.argv[4] if len(sys.argv)>4 else 'analise/m2test'
bg=(150,120,225) if len(sys.argv)<=5 else tuple(int(v) for v in sys.argv[5].split(','))
o=comp('projeto/public/matte/m%04d.png'%i,bg)[y0:y1,x0:x1]; n=comp('%s/m%04d.png'%(d,i),bg)[y0:y1,x0:x1]
f=2
o=cv2.resize(o,None,fx=f,fy=f,interpolation=cv2.INTER_NEAREST); n=cv2.resize(n,None,fx=f,fy=f,interpolation=cv2.INTER_NEAREST)
cv2.imwrite(out,np.hstack([o,n]),[cv2.IMWRITE_JPEG_QUALITY,92] if out.endswith('jpg') else [])
