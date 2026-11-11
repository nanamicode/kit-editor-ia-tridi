import numpy as np, cv2, glob, json, sys
Y0,Y1,X0,X1=820,980,120,960
def load(i): return cv2.imread('analise/src/f%04d.png'%i)  # BGR
def fade_factor(bgr):
    # wall sample region top-left-ish (purple wall) brightness vs normal
    return None
def text_core(bgr):
    hsv=cv2.cvtColor(bgr,cv2.COLOR_BGR2HSV).astype(np.float32)
    h,s,v=hsv[...,0]*2,hsv[...,1]/255.,hsv[...,2]
    m=np.zeros(bgr.shape[:2],bool)
    return h,s,v
def detect(bgr):
    h,s,v=text_core(bgr)
    b,g,r=[bgr[...,k].astype(np.float32) for k in (0,1,2)]
    region=np.zeros(bgr.shape[:2],bool); region[Y0:Y1,X0:X1]=True
    # white-ish text (possibly faded): low sat, bright, b not dominant
    white=(s<0.22)&(v>110)&(np.abs(r-b)<45)
    # yellow text
    yellow=(h>38)&(h<70)&(s>0.45)&(v>90)&(r>b+40)&(g>b+40)
    core=(white|yellow)&region
    core=core.astype(np.uint8)
    # drop tiny specks
    n,lab,st,_=cv2.connectedComponentsWithStats(core,connectivity=8)
    out=np.zeros_like(core)
    for k in range(1,n):
        if st[k,cv2.CC_STAT_AREA]>=25: out[lab==k]=1
    return out
if __name__=='__main__':
    idx=[int(a) for a in sys.argv[1:]]
    for i in idx:
        bgr=load(i); c=detect(bgr)
        vis=bgr.copy(); vis[c>0]=(0,0,255)
        cv2.imwrite('analise/review/mask_%d.png'%i,vis[780:1000])
        print(i,c.sum())
