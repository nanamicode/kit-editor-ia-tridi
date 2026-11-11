import cv2,numpy as np,sys
def comp(png,bg):
    im=cv2.imread(png,cv2.IMREAD_UNCHANGED).astype(np.float32)
    a=im[...,3:4]/255.; rgb=im[...,:3]
    b=np.zeros_like(rgb); b[:]=bg[::-1]  # bg given as RGB -> BGR
    return (rgb*a+b*(1-a)).clip(0,255).astype(np.uint8)
if __name__=='__main__':
    mdir=sys.argv[1]; idx=[int(a) for a in sys.argv[2].split(',')]; out=sys.argv[3]
    crop=[int(v) for v in sys.argv[4].split(',')] if len(sys.argv)>4 else [0,1080,0,1080]
    y0,y1,x0,x1=crop
    bgs=[(240,240,240),(18,10,36),(255,120,20)]
    rows=[]
    for i in idx:
        row=[comp('%s/m%04d.png'%(mdir,i),b)[y0:y1,x0:x1] for b in bgs]
        rows.append(np.hstack(row))
    cv2.imwrite(out,np.vstack(rows),[cv2.IMWRITE_JPEG_QUALITY,90])
