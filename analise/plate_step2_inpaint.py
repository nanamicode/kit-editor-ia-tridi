import numpy as np, cv2, sys, os, time, gc
from concurrent.futures import ProcessPoolExecutor
sys.path.insert(0,'analise')
import plate_morph as PM
cv2.setNumThreads(2)
RSIG=float(os.environ.get('RSIG','45')); ZB=float(os.environ.get('ZB','10')); N=107; CY0=600; CEXT=os.environ.get('CEXT','png')
M=np.load('analise/clean/core_masks.npz')['m']
RAD=int(os.environ.get('RAD','17'))
THR=float(os.environ.get('THR','8')); LPS=5.0; TPEN=float(os.environ.get('TPEN','1.3')); LPT_HAIR=float(os.environ.get('LPT_HAIR','26')); GRAIN=float(os.environ.get('GRAIN','0.4')); RGMIN=float(os.environ.get('RGMIN','15')); LPT=float(os.environ.get('LPT','14'))
KD=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(2*RAD+1,2*RAD+1))
HOLE=[cv2.dilate(M[i],KD)[CY0:] for i in range(N)]
del M
def frame(i): return cv2.imread('analise/src/f%04d.png'%(i+1))
_cache={}
def crop(i):
    if i not in _cache:
        if len(_cache)>30: _cache.clear()
        _cache[i]=frame(i)[CY0:]
    return _cache[i]
def rough(i): return cv2.inpaint(crop(i),HOLE[i],9,cv2.INPAINT_TELEA)
def lum(x): return cv2.cvtColor(x,cv2.COLOR_BGR2GRAY)
SHIFTS=[(dy,dx) for dy in (-230,-210,-190,-170,-150,-130,-112,112,130,150) for dx in (0,-8,8,-16,16)]
PAD=240
def hp(x): x=x.astype(np.float32); return x-cv2.GaussianBlur(x,(0,0),5)
def gradE(x):
    g=cv2.cvtColor(x,cv2.COLOR_BGR2GRAY).astype(np.float32)
    return cv2.GaussianBlur(np.sqrt(cv2.Sobel(g,cv2.CV_32F,1,0,ksize=3)**2+cv2.Sobel(g,cv2.CV_32F,0,1,ksize=3)**2),(0,0),5)
def harmonic(img,Hm):
    # Laplace (Poisson, zero source gradient) fill of Hm in img; Hm uint8 {0,1}
    h,w=Hm.shape
    m8=(Hm*255).astype(np.uint8).copy(); m8[:3]=0;m8[-3:]=0;m8[:,:3]=0;m8[:,-3:]=0
    yy,xx=np.nonzero(m8)
    if len(yy)==0: return img.copy()
    src=np.full_like(img,128)
    cx=(xx.min()+xx.max())//2; cy=(yy.min()+yy.max())//2
    return cv2.seamlessClone(src,img,m8,(int(cx),int(cy)),cv2.NORMAL_CLONE)
def vfill(img,Hm):
    # column-wise linear interpolation between pixels above/below each hole run (edge-preserving median on the samples)
    out=img.astype(np.float32).copy(); h,w=Hm.shape
    runs=[]
    topS=np.zeros((1,w,3),np.uint8); botS=np.zeros((1,w,3),np.uint8); has=np.zeros(w,bool)
    for x in np.nonzero(Hm.any(0))[0]:
        col=Hm[:,x]>0
        d=np.diff(np.concatenate([[0],col.astype(np.int8),[0]]))
        st=np.nonzero(d==1)[0]; en=np.nonzero(d==-1)[0]
        for a,b in zip(st,en):
            if a<4 or b>h-4: continue
            runs.append((x,a,b))
            if not has[x]:
                topS[0,x]=img[a-4:a-1,x].mean(0); botS[0,x]=img[b+1:b+4,x].mean(0); has[x]=True
    # fill gaps in samples for median (copy nearest)
    idx=np.nonzero(has)[0]
    if len(idx)==0: return img.copy()
    for c in range(w):
        if not has[c]:
            j=idx[np.argmin(np.abs(idx-c))]; topS[0,c]=topS[0,j]; botS[0,c]=botS[0,j]
    topM=cv2.medianBlur(topS,31).astype(np.float32)[0]; botM=cv2.medianBlur(botS,31).astype(np.float32)[0]
    for x,a,b in runs:
        tt=((np.arange(a,b)-a+1)/(b-a+1))[:,None]
        out[a:b,x]=topM[x]*(1-tt)+botM[x]*tt
    sm=cv2.GaussianBlur(out,(0,0),sigmaX=3.0,sigmaY=0.01)
    zone=None
    if os.environ.get('MORPH','1')=='1':
        mf=PM.morph_fill(img,Hm)
        if mf is not None:
            fm,w2=mf; ok=~np.isnan(fm[...,0])
            imf=img.astype(np.float32)
            fm=np.where(np.isnan(fm),imf,fm)
            fm=cv2.GaussianBlur(fm,(0,0),sigmaX=1.5,sigmaY=0.01)
            if RSIG>0:
                # edge mismatch between the morph and the real pixels around the hole, diffused inward (decays away from the border)
                hole=(Hm>0).astype(np.uint8)
                ringm=((cv2.dilate(hole,np.ones((5,5),np.uint8))>0)&(hole==0)).astype(np.float32)
                resid=(imf-fm)*ringm[...,None]
                num=cv2.GaussianBlur(resid,(0,0),RSIG); den=cv2.GaussianBlur(ringm,(0,0),RSIG)
                fm=fm+num/np.maximum(den,1e-4)[...,None]*(den>1e-3)[...,None]
            w3=(w2*ok)[...,None]
            sm=sm*(1-w3)+fm*w3
            zone=(w2*ok)>0.5
    res=img.copy(); m=Hm>0; res[m]=np.clip(sm[m],0,255).astype(np.uint8)
    res0=res.copy()
    m8=(Hm*255).astype(np.uint8).copy(); m8[:3]=0;m8[-3:]=0;m8[:,:3]=0;m8[:,-3:]=0
    yy,xx=np.nonzero(m8)
    try:
        res=cv2.seamlessClone(res,img,m8,(int((xx.min()+xx.max())//2),int((yy.min()+yy.max())//2)),cv2.NORMAL_CLONE)
    except cv2.error: pass
    if zone is not None and os.environ.get('ZBLEND','0')=='1':
        # inside the edge-tracking zone the morph is already anchored to clean pixels above/below; the global Poisson
        # solve only smears colour from the side borders, so keep the morph and blend to Poisson near the hole border
        dist=cv2.distanceTransform((Hm>0).astype(np.uint8),cv2.DIST_L2,3)
        al=(np.clip(dist/ZB,0,1)*zone)[...,None].astype(np.float32)
        res=np.clip(res0.astype(np.float32)*al+res.astype(np.float32)*(1-al),0,255).astype(np.uint8)
    return res
def grain(img,Hm,seed):
    # add noise matched to local residual std
    f=img.astype(np.float32); res=f-cv2.GaussianBlur(f,(0,0),1.5)
    rng=np.random.RandomState(seed)
    ringm=(cv2.dilate(Hm,np.ones((41,41),np.uint8))>0)&(Hm==0)
    sd=np.array([res[...,c][ringm].std() for c in range(3)])
    sd=np.clip(sd,0.5,6.0)*GRAIN
    n=rng.randn(*img.shape).astype(np.float32)
    n=cv2.GaussianBlur(n,(0,0),0.7)*1.6
    out=f+n*sd
    o=img.copy(); mm=Hm>0; o[mm]=np.clip(out[mm],0,255).astype(np.uint8)
    return o
def process(t, maxc=12, temporal_pen=0.015):
    Hfull=HOLE[t]; tcf=crop(t)
    if Hfull.sum()==0: return tcf.copy(),{}
    hh,ww=Hfull.shape
    ys,xs=np.nonzero(Hfull)
    R0=max(0,ys.min()-80); R1=min(hh,ys.max()+80)
    H=Hfull[R0:R1]; tc=tcf[R0:R1]; h=R1-R0; w=ww; Hb=H>0
    trf=grain(vfill(tcf,Hfull),Hfull,t)
    tr=trf[R0:R1]
    armz=np.zeros((h,w),bool)
    if os.environ.get('MORPH','1')=='1':
        mf=PM.morph_fill(tcf,Hfull)
        if mf is not None:
            armz=(((mf[1]*(~np.isnan(mf[0][...,0])))>0.5)&(Hfull>0))[R0:R1]
    vt_full=(cv2.dilate(Hfull,np.ones((5,5),np.uint8))==0).astype(np.uint8)
    P=PAD
    tcp=cv2.copyMakeBorder(tcf,P,P,P,P,cv2.BORDER_CONSTANT,value=0)
    vtp=cv2.copyMakeBorder(vt_full,P,P,P,P,cv2.BORDER_CONSTANT,value=0)
    srcs=[]
    for dy,dx in SHIFTS:
        y0=P+R0+dy; x0=P+dx
        ws=tcp[y0:y0+h,x0:x0+w]; vw=vtp[y0:y0+h,x0:x0+w]>0
        if vw[Hb].mean()<0.2: continue
        srcs.append(('s%+d,%+d'%(dy,dx),ws,vw))
    cands=[]
    for s in range(max(24,t-45),min(N,t+46)):
        if s==t: continue
        vs=(cv2.dilate(HOLE[s],np.ones((7,7),np.uint8))==0)
        cov=(vs[R0:R1]&Hb).sum()/Hb.sum()
        if cov>0.3: cands.append((abs(s-t),s))
    cands.sort(); cands=[s for _,s in cands[:maxc]]
    dis=cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    gt=lum(tr)
    gx,gy=np.meshgrid(np.arange(w,dtype=np.float32),np.arange(h,dtype=np.float32))
    for s in cands:
        sc_=crop(s); hs=HOLE[s]
        sr=vfill(sc_,hs)[R0:R1]
        flow=dis.calc(gt,lum(sr),None)
        mx=gx+flow[...,0]; my=gy+flow[...,1]
        # sample from source window with row offset
        ws=cv2.remap(sc_[R0:R1],mx,my,cv2.INTER_CUBIC,borderMode=cv2.BORDER_REPLICATE)
        vs=(cv2.dilate(hs,np.ones((7,7),np.uint8))==0).astype(np.float32)[R0:R1]
        vw=cv2.remap(vs,mx,my,cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)>0.99
        srcs.append(('t%d'%(s+1),ws,vw))
        del sr,flow,mx,my
    ring=(cv2.dilate(H,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(25,25)))>0)&(~Hb)
    hsv=cv2.cvtColor(tc,cv2.COLOR_BGR2HSV)
    purple=(hsv[...,0]>=118)&(hsv[...,0]<=165)&(hsv[...,1]>=70)&(hsv[...,2]>=60)
    allowT=cv2.dilate(((~purple)&(~Hb)).astype(np.uint8),cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(45,45)))>0
    ringf=ring.astype(np.float32)
    GT=gradE(tc)
    den0=cv2.GaussianBlur(ringf,(0,0),30)
    ringg=np.where(den0>0.003,cv2.GaussianBlur(GT*ringf,(0,0),30)/np.maximum(den0,1e-6),GT[ring].mean())
    ringmax=cv2.dilate((GT*ringf).astype(np.float32),np.ones((121,121),np.uint8))
    hpt=hp(tc); lpt=cv2.GaussianBlur(tc.astype(np.float32),(0,0),LPS)
    E=[]; final=[]
    for lab_,ws,vw in srcs:
        rg=ring&vw
        if rg.sum()>200:
            wsf=ws.astype(np.float32)
            for c in range(3):
                a_=wsf[...,c][rg][::7]; b_=tc[...,c][rg][::7].astype(np.float32)
                A_=np.stack([a_,np.ones_like(a_)],1)
                g,o=np.linalg.lstsq(A_,b_,rcond=None)[0]
                g=float(np.clip(g,0.5,2.0)); o=float(o) if 0.5<g<2.0 else 0.0
                wsf[...,c]=wsf[...,c]*g+o
            ws=np.clip(wsf,0,255).astype(np.uint8)
        R=(ring&vw).astype(np.float32)
        d=np.abs(hp(ws)-hpt).mean(2)
        d2=np.abs(cv2.GaussianBlur(ws.astype(np.float32),(0,0),LPS)-lpt).mean(2)
        den=cv2.GaussianBlur(R,(0,0),22)
        e1=np.where(den>0.01,cv2.GaussianBlur(d*R,(0,0),22)/np.maximum(den,1e-6),99.0)
        e2=np.where(den>0.01,cv2.GaussianBlur(d2*R,(0,0),22)/np.maximum(den,1e-6),99.0)
        LPTp=np.where(ringg>30,LPT_HAIR,LPT)
        e=np.minimum(e1/THR,e2/LPTp)*THR
        gs=gradE(ws)
        if lab_.startswith('s'):
            e=np.where(vw&(gs<1.6*ringg+6)&(ringg>=RGMIN),e,99.0).astype(np.float32)
        else:
            e=np.where(vw&(gs<1.6*ringg+6)&(ringg>=RGMIN),e,99.0).astype(np.float32)
        e=np.where(armz,99.0,e).astype(np.float32)
        E.append(e); final.append((lab_,ws,vw))
    del srcs; gc.collect()
    if not E: return trf,{'nosrc':1}
    dist=[0 if l_.startswith('s') else min(40,abs(int(l_[1:])-1-t)) for l_,_,_ in final]
    out=tr.copy(); info={'srcs':{}}
    remaining=Hb&~armz
    info['cov']=round(float((Hb&(np.min(E,0)<THR)).sum()/Hb.sum()),3)
    for it in range(10):
        cover=[(remaining&(e<THR)) for e in E]
        sc=[(c.sum()-30.0*float(E[j][c].mean() if c.any() else 0))*(1-temporal_pen*dist[j]) for j,c in enumerate(cover)]
        j=int(np.argmax(sc)); sub=cover[j]
        sub=cv2.morphologyEx(sub.astype(np.uint8),cv2.MORPH_OPEN,np.ones((5,5),np.uint8))
        sub=cv2.morphologyEx(sub,cv2.MORPH_CLOSE,np.ones((9,9),np.uint8))>0
        sub&=remaining
        if sub.sum()<80: break
        m8=(sub*255).astype(np.uint8); m8[:2]=0;m8[-2:]=0;m8[:,:2]=0;m8[:,-2:]=0
        yy,xx=np.nonzero(m8)
        cx=(xx.min()+xx.max())//2; cy=(yy.min()+yy.max())//2
        lab_,ws,_vw=final[j]
        try: out=cv2.seamlessClone(ws,out,m8,(int(cx),int(cy)),cv2.NORMAL_CLONE)
        except cv2.error: break
        info['srcs'][lab_]=int(sub.sum()); remaining&=~sub
    info['left']=int(remaining.sum())
    # texture transplant (fabric/skin grain) on pixels still filled by smooth interpolation
    if remaining.sum()>200:
        bestj=-1;bests=1e9
        for j,(lab_,ws,vwj) in enumerate(final):
            if not lab_.startswith('s'): continue
            cov_=(vwj&remaining).sum()/remaining.sum()
            if cov_<0.85: continue
            gs=gradE(ws); sc=float(gs[remaining&vwj].mean())
            if sc<bests: bests=sc;bestj=j
        if bestj>=0:
            ws=final[bestj][1].astype(np.float32)
            tex=ws-cv2.GaussianBlur(ws,(0,0),2.0)
            wgt=(remaining&final[bestj][2]&(gradE(final[bestj][1])<7)).astype(np.float32)
            wgt=cv2.GaussianBlur(wgt,(0,0),2.0)
            o=out.astype(np.float32)+tex*wgt[...,None]*0.9
            out=np.clip(o,0,255).astype(np.uint8); info['tex']=final[bestj][0]
    res=trf.copy()
    res[R0:R1]=out
    return res,info
def run(t):
    for k in range(6):
        try:
            out,info=process(t); break
        except (cv2.error,MemoryError,np.core._exceptions._ArrayMemoryError) as e:
            gc.collect(); _cache.clear(); time.sleep(5)
    else:
        raise RuntimeError('frame %d failed'%(t+1))
    full=frame(t); full[CY0:]=out
    if CEXT=='jpg': cv2.imwrite(os.environ.get('OUTDIR','analise/clean')+'/c%04d.jpg'%(t+1),full,[cv2.IMWRITE_JPEG_QUALITY,98,cv2.IMWRITE_JPEG_SAMPLING_FACTOR,0x111111])
    else: cv2.imwrite(os.environ.get('OUTDIR','analise/clean')+'/c%04d.png'%(t+1),full,[cv2.IMWRITE_PNG_COMPRESSION,3])
    return t,info
if __name__=='__main__':
    from concurrent.futures.process import BrokenProcessPool
    od=os.environ.get('OUTDIR','analise/clean')
    ts=[int(a)-1 for a in sys.argv[1:]] or list(range(N))
    force=os.environ.get('FORCE','1')=='1'
    todo=[t for t in ts if force or not os.path.exists(od+'/c%04d.%s'%(t+1,CEXT))]
    t0=time.time()
    for attempt in range(8):
        if not todo: break
        try:
            with ProcessPoolExecutor(int(os.environ.get('NW','2'))) as ex:
                futs={ex.submit(run,t):t for t in todo}
                for f in list(futs):
                    t,info=f.result()
                    print(t+1,info,round(time.time()-t0),flush=True)
        except BrokenProcessPool:
            print('pool broke, retrying',flush=True)
        todo=[t for t in todo if not os.path.exists(od+'/c%04d.%s'%(t+1,CEXT)) or (force and False)]
        force=False
