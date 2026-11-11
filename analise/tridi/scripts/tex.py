import numpy as np, cv2, sys, os
OUT=sys.argv[1]; os.makedirs(OUT,exist_ok=True)
rng=np.random.default_rng(7)
def pnoise(h,w,scale,rng):
    # periodic band-limited noise via FFT (tileable)
    fy=np.fft.fftfreq(h)[:,None]; fx=np.fft.fftfreq(w)[None,:]
    r=np.sqrt(fx**2+fy**2)+1e-9
    spec=(rng.normal(size=(h,w))+1j*rng.normal(size=(h,w)))*np.exp(-(r*scale)**2)
    n=np.real(np.fft.ifft2(spec)); n=(n-n.mean())/(n.std()+1e-9); return n
def fibers(h,w,count,rng,tile=True,lmin=10,lmax=70,alpha=0.5):
    acc=np.zeros((h,w),np.float32)
    for _ in range(count):
        x,y=rng.uniform(0,w),rng.uniform(0,h); L=rng.uniform(lmin,lmax); a=rng.normal(0.0,0.35) # mostly horizontal-ish grain
        curv=rng.normal(0,0.0035); val=rng.choice([-1,1],p=[0.35,0.65])*rng.uniform(0.2,1.0)
        pts=[]; ang=a
        for s in range(int(L)):
            pts.append((x,y)); x+=np.cos(ang); y+=np.sin(ang); ang+=curv
        pts=np.array(pts)
        th=1 if rng.random()<0.85 else 2
        for ox in ([0,-w,w] if tile else [0]):
            for oy in ([0,-h,h] if tile else [0]):
                p=(pts+[ox,oy]).astype(np.int32)
                cv2.polylines(acc,[p.reshape(-1,1,2)],False,float(val),th,cv2.LINE_AA)
    return cv2.GaussianBlur(acc,(0,0),0.6)*alpha
def kraft(h,w,tile,rng,base=(0x66,0x92,0xB6)): # BGR -> #B69266
    base=np.array(base,np.float32)
    floc=pnoise(h,w,7,rng)           # paper formation flocs
    cloud=pnoise(h,w,45,rng)          # soft clouds
    grain=pnoise(h,w,1.3,rng)
    fib=fibers(h,w,int(h*w/220),rng,tile,12,70,1.0)   # many long thin fibers
    fibL=np.clip(fib,0,None); fibD=np.clip(-fib,0,None)
    lum=1+0.04*floc+0.03*cloud+0.02*grain+0.055*fibL-0.05*fibD
    img=base[None,None,:]*lum[...,None]
    # light fibers are less saturated (pulp): pull toward grey
    g=img.mean(axis=2,keepdims=True); k=np.clip(fibL*0.25,0,0.25)[...,None]; img=img*(1-k)+np.minimum(g*1.12,255)*k
    hue=pnoise(h,w,70,rng)*0.02; img[...,2]*=1+hue; img[...,0]*=1-hue
    n=int(h*w/9000)
    for _ in range(n):
        x,y=int(rng.uniform(0,w)),int(rng.uniform(0,h)); L=rng.uniform(1,4); a=rng.uniform(0,3.14)
        c=(base*rng.uniform(0.45,0.7)).tolist()
        for ox in ([0,-w,w] if tile else [0]):
            for oy in ([0,-h,h] if tile else [0]):
                p1=(int(x+ox),int(y+oy)); p2=(int(x+ox+np.cos(a)*L),int(y+oy+np.sin(a)*L))
                cv2.line(img,p1,p2,c,1,cv2.LINE_AA)
    return np.clip(img,0,255).astype(np.uint8)
def save(name,img): cv2.imwrite(os.path.join(OUT,name),img); print(name,img.shape)
# 1 kraft tile 1024 + full 1080x1920
save('kraft_tile_1024.png',kraft(1024,1024,True,rng))
save('kraft_1080x1920.png',kraft(1920,1080,False,rng))
# 2 background paper: warm off-white newsprint w/ fibers and grain (for the scene background)
def paper(h,w,base,tile):
    base=np.array(base,np.float32)
    lum=1+0.018*pnoise(h,w,40,rng)+0.02*pnoise(h,w,1.8,rng)+0.05*fibers(h,w,int(h*w/1200),rng,tile,8,50,1)
    img=base*lum[...,None]
    return np.clip(img,0,255).astype(np.uint8)
save('papel_fundo_1080x1920.png',paper(1920,1080,(0xDE,0xE6,0xEA),False))  # #EAE6DE
save('papel_fundo_tile_1024.png',paper(1024,1024,(0xDE,0xE6,0xEA),True))
# 3 ink mask (tileable RGBA white with alpha holes): use as mask-image over stamped logos
h=w=1024
n1=pnoise(h,w,3,rng); n2=pnoise(h,w,14,rng); n3=pnoise(h,w,60,rng)
a=1.0-np.clip((n1*0.5+n2*0.7+n3*0.6-2.0)*2.0,0,1)   # sparse voids
a*=0.86+0.14*np.clip(n3*0.5+0.5,0,1)
a*=1-0.35*(pnoise(h,w,1.2,rng)>2.3)          # fine porosity
a=np.clip(a,0,1)
rgba=np.dstack([np.full((h,w),255,np.uint8)]*3+[(a*255).astype(np.uint8)])
save('tinta_mascara_tile_1024.png',rgba)
# edge-rough version: an alpha map to multiply near borders (used as an SVG feDisplacement alt) -> store noise map gray
dn=(np.clip(pnoise(h,w,6,rng)*0.5+0.5,0,1)*255).astype(np.uint8)
save('ruido_deslocamento_tile_1024.png',cv2.merge([dn,np.roll(dn,311,1),dn]))
# 4 halftone tiles (rotated 45 deg grid, tileable). black dots on transparent
def halftone_tile(size,period,radius):
    yy,xx=np.mgrid[0:size,0:size].astype(np.float32)
    # 45deg lattice: centers at (i*period/2, j*period/2) with i+j even -> period chosen so tile wraps
    u=(xx+yy)/np.sqrt(2); v=(xx-yy)/np.sqrt(2)
    p=period/np.sqrt(2)*np.sqrt(2)
    cu=np.round(u/(period/np.sqrt(2)))*(period/np.sqrt(2)); cv=np.round(v/(period/np.sqrt(2)))*(period/np.sqrt(2))
    du=u-cu; dv=v-cv; d=np.sqrt(du**2+dv**2)
    al=np.clip(radius-d+0.5,0,1)
    return al
# exact tileable: use axis-aligned lattice of 45-rotated pattern = checkerboard of dots with spacing s (tile size multiple of s)
def ht(size,s,r):
    yy,xx=np.mgrid[0:size,0:size].astype(np.float32)+0.5
    acc=np.zeros((size,size),np.float32)
    for oy in range(-1,size//s+2):
        for ox in range(-1,size//s+2):
            for (dx,dy) in [(0,0),(s/2,s/2)]:
                cx,cy=ox*s+dx,oy*s+dy
                pass
    # vectorized: distance to nearest lattice point of the two sublattices
    def dist(off):
        X=(xx-off)%s; Y=(yy-off)%s; X=np.minimum(X,s-X); Y=np.minimum(Y,s-Y); return np.sqrt(X**2+Y**2)
    d=np.minimum(dist(0),dist(s/2))
    return np.clip(r-d+0.5,0,1)
for nm,s,r in [('reticula_tile_256.png',16,3.6),('reticula_grossa_tile_256.png',32,8.5)]:
    al=ht(256,s,r); rgba=np.dstack([np.zeros((256,256),np.uint8)]*3+[(al*255).astype(np.uint8)]); save(nm,rgba)
# halftone gradient (dot size grows downward), 1080x1920, black dots transparent bg
H,W=1920,1080; s=18
yy,xx=np.mgrid[0:H,0:W].astype(np.float32)+0.5
def dist(off):
    X=(xx-off)%s; Y=(yy-off)%s; X=np.minimum(X,s-X); Y=np.minimum(Y,s-Y); return np.sqrt(X**2+Y**2)
d=np.minimum(dist(0),dist(s/2))
g=np.clip((yy/H-0.25)/0.75,0,1)**1.4; r=0.3+g*(s*0.5)
al=np.clip(r-d+0.5,0,1)*(g>0.01)
save('reticula_gradiente_1080x1920.png',np.dstack([np.zeros((H,W),np.uint8)]*3+[(al*255).astype(np.uint8)]))
# 5 film/paper grain overlay tile (neutral gray 128 +- noise) for overlay/soft-light
gt=(np.clip(128+pnoise(512,512,1.2,rng)*22,0,255)).astype(np.uint8)
save('grao_tile_512.png',cv2.merge([gt,gt,gt]))
# 6 torn black tape (tarja rasgada) 1100x240 RGBA
Wt,Ht=1100,240
yy,xx=np.mgrid[0:Ht,0:Wt].astype(np.float32)
def edge(n,amp,rng):
    e=np.zeros(n)
    for f,a in [(3,1.0),(12,0.55),(40,0.3),(140,0.16),(420,0.08)]:
        knots=rng.normal(0,1,f+2); xs=np.linspace(0,f+1,n); e+=a*np.interp(xs,np.arange(f+2),knots)
    return e*amp
top=32+edge(Wt,6,rng); bot=Ht-32+edge(Wt,6,rng)
left=32+edge(Ht,6,rng); right=Wt-32+edge(Ht,6,rng)
m=((yy>top[None,:])&(yy<bot[None,:])&(xx>left[:,None])&(xx<right[:,None])).astype(np.float32)
m=cv2.GaussianBlur(m,(0,0),0.7)
# paper fiber halo (white torn fibers at edges)
hw_t=3+np.abs(edge(Wt,5,rng)); hw_b=3+np.abs(edge(Wt,5,rng)); hw_l=3+np.abs(edge(Ht,5,rng)); hw_r=3+np.abs(edge(Ht,5,rng))
halo=((yy>top[None,:]-hw_t[None,:])&(yy<bot[None,:]+hw_b[None,:])&(xx>left[:,None]-hw_l[:,None])&(xx<right[:,None]+hw_r[:,None])).astype(np.float32)
halo*= (pnoise(Ht,Wt,1.5,rng)>-2.2)
halo=cv2.GaussianBlur(halo,(0,0),0.6)*(1-m)
tex=0.075+0.012*pnoise(Ht,Wt,6,rng)+0.008*pnoise(Ht,Wt,1.3,rng)+0.02*fibers(Ht,Wt,500,rng,False,15,60,1)
col=np.dstack([np.clip(tex*255,0,255)]*3)*m[...,None]+np.dstack([np.full((Ht,Wt),236)]*3)*halo[...,None]
alpha=np.clip(m+halo,0,1)
save('tarja_rasgada_preta.png',np.dstack([col.astype(np.uint8),(alpha*255).astype(np.uint8)]))
