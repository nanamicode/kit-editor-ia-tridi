import numpy as np, onnxruntime as ort, sys, os, time, cv2, json
N=107
DSR=float(os.environ.get('DSR','0.6')); GF=int(os.environ.get('GF','1'))
OUT_M=os.environ.get('OUT_M','projeto/public/matte'); OUT_P=os.environ.get('OUT_P','projeto/public/plate')
EDGE_PX=int(os.environ.get('EDGE_PX','5')); BAND_W=float(os.environ.get('BAND_W','0.9')); LO=float(os.environ.get('LO','0.28')); HI=float(os.environ.get('HI','0.88'))
REPAIR=int(os.environ.get('REPAIR','1'))
NORM=int(os.environ.get('NORM','2'))
FIRST=int(os.environ.get('FIRST','17')); LAST=int(os.environ.get('LAST',str(N)))
WRITE_PLATE=os.environ.get('WRITE_PLATE','1')=='1'
os.makedirs(OUT_M,exist_ok=True); os.makedirs(OUT_P,exist_ok=True)
def load(i):
    for e in ('jpg','png'):
        p='analise/clean/c%04d.%s'%(i,e)
        if i>=25 and os.path.exists(p): return cv2.imread(p)
    return cv2.imread('analise/src/f%04d.png'%i)
def box(x,r): return cv2.boxFilter(x,-1,(2*r+1,2*r+1),normalize=True,borderType=cv2.BORDER_REPLICATE)
def guided(I,p,r,eps):
    mI=box(I,r); mp=box(p,r); cov=box(I*p,r)-mI*mp; var=box(I*I,r)-mI*mI
    a=cov/(var+eps); b=mp-a*mI
    return box(a,r)*I+box(b,r)
def blur_fusion(I,a,r):
    # I float32 HxWx3 (0..1), a HxW; returns foreground estimate (Forte & Pitie)
    a3=a[...,None]
    def bl(x,rr): return cv2.blur(x,(2*rr+1,2*rr+1))
    Fb=bl(I*a3,r)/(bl(a3,r)[...,None] if False else np.maximum(bl(a,r),1e-3)[...,None])
    Bb=bl(I*(1-a3),r)/np.maximum(bl(1-a,r),1e-3)[...,None]
    F=Fb+a3*(I-a3*Fb-(1-a3)*Bb)
    return np.clip(F,0,1)
def fg_estimate(I,a):
    F=blur_fusion(I,a,31); F=blur_fusion(I,a,5) if False else F
    F2=blur_fusion(np.clip(F,0,1),a,5)
    return F2
def despill(I,F,a):
    """Edge colour clean-up. Partial/edge pixels take the CHROMA of the nearby opaque interior (wall purple, orange
    rim and halo are removed) and keep only the luminance of the estimated foreground, capped so that a bright wall
    cannot leave a light fringe around dark hair."""
    w=(a>0.97).astype(np.float32)
    w=cv2.erode(w,np.ones((3,3),np.uint8))
    num=cv2.GaussianBlur(F*w[...,None],(0,0),5); den=cv2.GaussianBlur(w,(0,0),5)
    Fin=num/np.maximum(den,1e-4)[...,None]
    ok=(den>0.02)
    kY=np.array([0.299,0.587,0.114],np.float32)
    Yf=(F*kY).sum(2); Yin=(Fin*kY).sum(2)
    core=(a>0.97).astype(np.uint8)
    coreE=cv2.erode(core,np.ones((EDGE_PX,EDGE_PX),np.uint8))
    band=((a>0)&(coreE==0)).astype(np.float32)
    band=cv2.GaussianBlur(band,(0,0),0.9)
    t=np.clip((1-a)*2.2,0,1)
    tw=np.clip(np.maximum(t,BAND_W*band),0,1)*ok
    Ycap=np.maximum(Yin*1.3,Yin+0.08)
    Yt=np.where(band>0.25,np.minimum(Yf,Ycap),Yf)
    Fch=Fin*(Yt/np.maximum(Yin,2e-3))[...,None]
    out=F*(1-tw[...,None])+Fch*tw[...,None]
    part=((a<0.995)&(a>0))[...,None]
    brown=(Fin[...,0:1]>Fin[...,2:3]*1.05)&ok[...,None]          # interior is warm (hair/skin), never blue-dominant
    Bc=np.minimum(out[...,2:3],out[...,1:2]*0.9)
    out=np.where((part|(band[...,None]>0.3))&brown,np.concatenate([out[...,:2],Bc],2),out)
    return np.clip(out,0,1)
def fill_interior(a,bgr,walld=42.0):
    """Open crescents / thin holes the matte leaves inside the body (RVM glitches): inside the morphological closing of the
    silhouette, pixels that are not wall-coloured (row-wise wall model from far-away background) become opaque."""
    op=(a>0.5).astype(np.uint8)
    cl=cv2.morphologyEx(op,cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(41,41)))
    cand=(cl>0)&(a<0.9)
    if not cand.any(): return a
    far=cv2.dilate(op,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(41,41)))==0
    h=a.shape[0]; f=bgr.astype(np.float32); wall=np.zeros((h,3),np.float32); okr=np.zeros(h,bool)
    for y in range(h):
        m=far[y]
        if m.sum()>=20: wall[y]=np.median(f[y][m],0); okr[y]=True
    if okr.sum()<20: return a
    ys=np.nonzero(okr)[0]
    for c in range(3): wall[:,c]=np.interp(np.arange(h),ys,wall[ys,c])
    wall=cv2.GaussianBlur(wall[None],(0,0),6)[0]
    d=np.abs(f-wall[:,None,:]).sum(2)
    fm=(cand&(d>walld)).astype(np.uint8)
    fm=cv2.morphologyEx(fm,cv2.MORPH_OPEN,np.ones((2,2),np.uint8))
    if not fm.any(): return a
    fm=cv2.dilate(fm,np.ones((3,3),np.uint8))&cand.astype(np.uint8)
    return np.maximum(a,cv2.GaussianBlur(fm.astype(np.float32),(0,0),1.0))
def comp_clean(a):
    m=(a>0.5).astype(np.uint8)
    n,lab,st,_=cv2.connectedComponentsWithStats(m,connectivity=8)
    if n<=2: return a
    big=1+np.argmax(st[1:,cv2.CC_STAT_AREA])
    keep=np.zeros_like(m)
    for k in range(1,n):
        if k==big or st[k,cv2.CC_STAT_AREA]>8000: keep[lab==k]=1
    keepd=cv2.dilate(keep,np.ones((25,25),np.uint8)).astype(np.float32)
    return a*keepd
if __name__=='__main__':
    sys_path=__import__('sys').path; sys_path.insert(0,'analise')
    import plate_step2_inpaint as P2
    so=ort.SessionOptions(); so.intra_op_num_threads=4
    s=ort.InferenceSession('modelos/rvm_mobilenetv3_fp32.onnx',so,providers=['CPUExecutionProvider'])
    rec=[np.zeros((1,1,1,1),dtype=np.float32) for _ in range(4)]
    d=np.array([DSR],dtype=np.float32)
    zero=np.zeros((1080,1080,4),np.uint8)
    # sharpness (presenter region) to find the end of the blur-in
    def lapvar(i):
        g=cv2.cvtColor(cv2.imread('analise/src/f%04d.png'%i),cv2.COLOR_BGR2GRAY)[150:700,250:850]
        return float(cv2.Laplacian(g,cv2.CV_32F).var())
    lv={i:lapvar(i) for i in range(17,36)}
    ref_lv=lv[33]
    K=next(i for i in range(21,36) if lv[i]>=0.8*ref_lv)
    print('blur-in ends at frame',K,{i:round(v,1) for i,v in lv.items() if i<=K+1},flush=True)
    def pf_of(i):
        hsv=cv2.cvtColor(cv2.imread('analise/src/f%04d.png'%i),cv2.COLOR_BGR2HSV); hh=hsv[...,0].astype(np.float32)*2; ss=hsv[...,1]/255.
        return float(((hh>240)&(hh<290)&(ss>0.3)).mean())
    def centre_lum(i):
        g=cv2.cvtColor(cv2.imread('analise/src/f%04d.png'%i),cv2.COLOR_BGR2GRAY); return float(g[300:700,300:900].mean())
    LREF=float(np.median([centre_lum(i) for i in range(50,91,4)]))
    def gain_of(i):
        return float(np.clip(LREF/max(centre_lum(i),1.0),1.0,5.0)) if (i>=60 and NORM>0) else 1.0
    print('LREF',round(LREF,1),flush=True)
    prev=None; t0=time.time(); stats=[]; pending=[]
    def finalize(i,bgr,a):
        global_prev=finalize.prev
        w=float(np.clip(pf_of(i)/0.62,0,1)); a=a*w if w<0.99 else a
        if global_prev is not None:
            dif=np.abs(a-global_prev); lam=np.where(dif<0.15,0.30,0.0).astype(np.float32); a=a*(1-lam)+global_prev*lam
        finalize.prev=a.copy()
        a=comp_clean(a)
        a=np.clip((a-LO)/(HI-LO),0,1).astype(np.float32)
        a=a*a*(3-2*a)*0.5+a*0.5
        a=np.where(a<0.03,0,np.where(a>0.985,1,a)).astype(np.float32)
        I=(bgr[...,::-1].astype(np.float32)/255.)
        F=fg_estimate(I,a); Fo=despill(I,F,a)
        rgb=(Fo*255+0.5).astype(np.uint8); al=(a*255+0.5).astype(np.uint8); rgb[al==0]=0
        cv2.imwrite('%s/m%04d.png'%(OUT_M,i),np.dstack([rgb[...,::-1],al]),[cv2.IMWRITE_PNG_COMPRESSION,4])
        stats.append((i,float(a.mean())))
    finalize.prev=None
    for i in range(1,LAST+1):
        bgr=load(i)
        if WRITE_PLATE: cv2.imwrite('%s/p%04d.jpg'%(OUT_P,i),bgr,[cv2.IMWRITE_JPEG_QUALITY,95,cv2.IMWRITE_JPEG_SAMPLING_FACTOR,0x111111])
        if i<FIRST:
            cv2.imwrite('%s/m%04d.png'%(OUT_M,i),zero,[cv2.IMWRITE_PNG_COMPRESSION,6]); continue
        gn=gain_of(i)
        if gn>1.08 and NORM==2:      # dark fade-out: gamma-lift to the reference brightness (no highlight clipping), matte on the lifted copy
            lum_i=centre_lum(i)/255.; gam=np.log(LREF/255.)/np.log(max(lum_i,1e-3))
            bgrn=(255.*np.power(bgr.astype(np.float32)/255.,gam)).clip(0,255).astype(np.uint8)
        elif gn>1.08 and NORM==1: bgrn=np.clip(bgr.astype(np.float32)*gn,0,255).astype(np.uint8)
        else: bgrn=bgr
        x=(bgrn[...,::-1].astype(np.float32)/255.).transpose(2,0,1)[None]
        fgr,pha,*rec=s.run(None,{'src':x,'r1i':rec[0],'r2i':rec[1],'r3i':rec[2],'r4i':rec[3],'downsample_ratio':d})
        a=pha[0,0].astype(np.float32)
        if GF:
            g=cv2.cvtColor(bgrn,cv2.COLOR_BGR2GRAY).astype(np.float32)/255.
            a=np.clip(0.5*a+0.5*guided(g,a,6,1e-3),0,1)
        # repair alpha under the (inpainted) caption hole: vertical interpolation of alpha across the hole
        if i>=17 and REPAIR>0:
            Hh=P2.HOLE[i-1] if i>=25 else P2.HOLE[24]
            if Hh.any():
                hm=np.zeros((1080,1080),np.uint8); hm[600:]=cv2.dilate(Hh,np.ones((15,15),np.uint8))
                if REPAIR>=2:
                    crop=(a[600:]*255).astype(np.uint8); c3=np.dstack([crop]*3)
                    fixed=P2.vfill(c3,Hh)[...,0].astype(np.float32)/255.
                    a[600:]=np.where(Hh>0,fixed,a[600:])
                # enclosed small holes of the matte near the (former) caption band: opaque (a real gap between arm and body is open to the outside, so it stays)
                inv=(a<=0.5).astype(np.uint8)
                n_,lab_,st_,_=cv2.connectedComponentsWithStats(inv,connectivity=4)
                for k in range(1,n_):
                    x_,y_,w_,h_,ar_=st_[k]
                    if ar_<20000 and x_>0 and y_>0 and x_+w_<1080 and y_+h_<1080 and (hm[lab_==k]>0).any():
                        dm=cv2.dilate((lab_==k).astype(np.uint8),cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(15,15)))
                        a=np.maximum(a,cv2.GaussianBlur(dm.astype(np.float32),(0,0),1.6))
                if REPAIR>=3:
                    closed=cv2.morphologyEx((a>0.5).astype(np.uint8),cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(41,41)))>0
                    a[(hm>0)&closed]=np.maximum(a[(hm>0)&closed],1.0)
        if i>=26 and REPAIR>0: a=fill_interior(a,bgr)
        if i<K:
            pending.append((i,bgr)); continue
        if pending:
            aref=a.copy()
            lap_ref=lv[K]
            for (j,bj) in pending:
                # blur reference alpha to the blur level of frame j
                best=0;bd=1e9
                gref=cv2.cvtColor(bgr,cv2.COLOR_BGR2GRAY)
                for sg in [0,1,2,3,4,5,6,8,10,12,14,17]:
                    gb=cv2.GaussianBlur(gref,(0,0),sg) if sg>0 else gref
                    v=float(cv2.Laplacian(gb[150:700,250:850],cv2.CV_32F).var())
                    if abs(v-lv[j])<bd: bd=abs(v-lv[j]);best=sg
                aj=cv2.GaussianBlur(aref,(0,0),best) if best>0 else aref
                finalize(j,bj,aj)
            pending=[]
        finalize(i,bgr,a)
        if i%10==0: print(i,round(time.time()-t0,1),flush=True)
    json.dump(stats,open('analise/clean/alpha_stats.json','w'))
