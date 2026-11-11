import cv2, sys, subprocess, numpy as np, os
SRC, OUT = sys.argv[1], sys.argv[2]
CROPH = {'acai':920,'paes':900,'sapore':960,'pizza':960,'elaine':960}
# name: (first, last, blur keyframes [(frame, cx, cy, w, h)])
CLIPS = {
 'acai':   (39, 61, []),
 'sapore': (121,133, []),
 'pizza':  (171,196, [(184,760,500,200,52),(186,650,503,200,52),(190,560,510,200,52),(192,500,522,200,52),(197,385,545,200,52)]),
 'paes':   (321,332, []),
 'elaine': (360,374, [(360,360,858,136,22),(367,375,858,136,22),(374,389,858,136,22)]),
}
def interp(kf, n):
    if not kf or n < kf[0][0]-1: return None
    if n >= kf[-1][0]: return kf[-1][1:]
    for a,b in zip(kf,kf[1:]):
        if a[0] <= n <= b[0]:
            u=(n-a[0])/(b[0]-a[0]); return tuple(a[i]+(b[i]-a[i])*u for i in range(1,5))
    return kf[0][1:]
H=np.array([0x3A,0x0A,0x6B],float)[::-1]; M=np.array([0xB4,0x8C,0xFF],float)[::-1]; P=np.array([0x8B,0x00,0xFF],float)[::-1]; W=np.array([255,255,255],float)
def riso(f, n):
    g=cv2.cvtColor(f,cv2.COLOR_BGR2GRAY).astype(float)/255
    g=np.clip((g-0.08)/0.84,0,1)
    # duotone: shadow -> purple -> lilac -> white
    lut=np.zeros((256,3))
    for i in range(256):
        x=i/255
        if x<0.35: c=H+(P-H)*(x/0.35)
        elif x<0.7: c=P+(M-P)*((x-0.35)/0.35)
        else: c=M+(W-M)*((x-0.7)/0.3)
        lut[i]=c
    img=lut[(g*255).astype(np.uint8)]
    # misregistration: shadow ink plate offset 3px
    dark=(1-g)
    sh=np.roll(np.roll(dark,3,axis=1),2,axis=0)
    img=img*(1-0.25*sh[...,None])+H*0.25*sh[...,None]
    rng=np.random.default_rng(n)
    img+=rng.normal(0,6,img.shape[:2])[...,None]
    return np.clip(img,0,255).astype(np.uint8)
def blur_box(f, box):
    cx,cy,w,h=box; x0=int(max(0,cx-w/2)); x1=int(min(f.shape[1],cx+w/2)); y0=int(max(0,cy-h/2)); y1=int(min(f.shape[0],cy+h/2))
    if x1-x0<4 or y1-y0<4: return
    roi=f[y0:y1,x0:x1]
    small=cv2.resize(roi,(max(1,(x1-x0)//16),max(1,(y1-y0)//16)),interpolation=cv2.INTER_AREA)
    f[y0:y1,x0:x1]=cv2.GaussianBlur(cv2.resize(small,(x1-x0,y1-y0),interpolation=cv2.INTER_LINEAR),(0,0),3)
cap=cv2.VideoCapture(SRC); frames=[]; n=0
need=max(v[1] for v in CLIPS.values())
store={}
while n<=need:
    ok,f=cap.read()
    if not ok: break
    for k,(a,b,kf) in CLIPS.items():
        if a<=n<=b:
            g=f[:CROPH[k]].copy(); box=interp(kf,n)
            if box: blur_box(g,box)
            store.setdefault(k,[]).append((n,g))
    n+=1
def enc(path, frs, fps=30, crf='14'):
    h,w=frs[0].shape[:2]
    p=subprocess.Popen(['ffmpeg','-loglevel','error','-y','-f','rawvideo','-pix_fmt','bgr24','-s',f'{w}x{h}','-r',str(fps),'-i','-','-an','-c:v','libx264','-crf',crf,'-preset','slow','-pix_fmt','yuv420p','-movflags','+faststart',path],stdin=subprocess.PIPE)
    for fr in frs: p.stdin.write(fr.tobytes())
    p.stdin.close(); p.wait()
for k,lst in store.items():
    frs=[g for _,g in lst]
    rz=[riso(g,i) for i,(_,g) in enumerate(lst)]
    enc(os.path.join(OUT,f'ref1_{k}.mp4'),frs)
    enc(os.path.join(OUT,f'ref1_{k}_riso.mp4'),rz,crf='19')
    enc(os.path.join(OUT,f'ref1_{k}_lento.mp4'),[x for g in frs for x in (g,g)])
    enc(os.path.join(OUT,f'ref1_{k}_riso_lento.mp4'),[x for g in rz for x in (g,g)],crf='19')
    if k=='acai':
        for n0,g in lst:
            if n0==52:
                cv2.imwrite(os.path.join(OUT,'ref1_acai_still.png'),g); cv2.imwrite(os.path.join(OUT,'ref1_acai_still_riso.png'),riso(g,99))
    print(k,len(frs),'frames')
