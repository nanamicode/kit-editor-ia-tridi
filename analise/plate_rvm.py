import numpy as np, onnxruntime as ort, sys, os, time, cv2
src_dir=sys.argv[1]; out_dir=sys.argv[2]; dsr=float(sys.argv[3]); first=int(sys.argv[4]); last=int(sys.argv[5])
pat=sys.argv[6] if len(sys.argv)>6 else 'f%04d.png'
os.makedirs(out_dir,exist_ok=True)
so=ort.SessionOptions(); so.intra_op_num_threads=4
s=ort.InferenceSession('modelos/rvm_mobilenetv3_fp32.onnx',so,providers=['CPUExecutionProvider'])
rec=[np.zeros((1,1,1,1),dtype=np.float32) for _ in range(4)]
d=np.array([dsr],dtype=np.float32)
t0=time.time()
for i in range(first,last+1):
    bgr=cv2.imread(os.path.join(src_dir,pat%i))
    x=(bgr[...,::-1].astype(np.float32)/255.).transpose(2,0,1)[None]
    fgr,pha,*rec=s.run(None,{'src':x,'r1i':rec[0],'r2i':rec[1],'r3i':rec[2],'r4i':rec[3],'downsample_ratio':d})
    a=(pha[0,0]*255).clip(0,255).astype(np.uint8)
    f=(fgr[0].transpose(1,2,0)*255).clip(0,255).astype(np.uint8)
    cv2.imwrite(os.path.join(out_dir,'a%04d.png'%i),a)
    cv2.imwrite(os.path.join(out_dir,'f%04d.png'%i),f[...,::-1])
    if i%10==0: print(i,round(time.time()-t0,1),flush=True)
