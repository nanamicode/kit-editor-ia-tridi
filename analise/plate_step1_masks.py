import numpy as np, cv2, json, sys
sys.path.insert(0,'analise')
from plate_mask import detect, load
N=107
cores=[]; 
for i in range(1,N+1):
    cores.append(detect(load(i)) if i>=22 else np.zeros((1080,1080),np.uint8))
area=[int(c.sum()) for c in cores]
# purple wall fraction (presenter-ness)
pf=[]
for i in range(1,N+1):
    b=load(i); hsv=cv2.cvtColor(b,cv2.COLOR_BGR2HSV)
    h=hsv[...,0]*2; s=hsv[...,1]/255.
    pf.append(float(((h>250)&(h<285)&(s>0.35)).mean()))
print('area',area)
print('purple',[round(p,2) for p in pf])
K=np.ones((3,3),np.uint8)
has=[a>1500 for a in area]
# chunks
chunks=[]; cur=None
for i in range(N):
    if not has[i]:
        cur=None; continue
    d=cv2.dilate(cores[i],cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(9,9)))
    if cur is not None:
        pd=cv2.dilate(cores[i-1],cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(9,9)))
        iou=(d&pd).sum()/max(1,(d|pd).sum())
        ja=abs(area[i]-area[i-1])/max(1,area[i-1])
        if iou<0.5 or (ja>0.12 and iou<0.85): cur=None
    if cur is None:
        cur=[]; chunks.append(cur)
    cur.append(i)
print('chunks',[(c[0]+1,c[-1]+1) for c in chunks])
masks=[np.zeros((1080,1080),np.uint8) for _ in range(N)]
for c in chunks:
    votes=sum(cores[i].astype(np.float32) for i in c)/len(c)
    cm=(votes>=0.35).astype(np.uint8)
    n,lab,st,_=cv2.connectedComponentsWithStats(cm,connectivity=8)
    out=np.zeros_like(cm)
    for k in range(1,n):
        if st[k,cv2.CC_STAT_AREA]>=120: out[lab==k]=1
    for i in c:
        masks[i]=out|(cores[i]&cv2.dilate(out,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(15,15))))
np.save('analise/clean/core_masks.npy',np.stack(masks))
json.dump({'area':area,'purple':pf,'chunks':[(c[0]+1,c[-1]+1) for c in chunks]},open('analise/clean/step1.json','w'))
