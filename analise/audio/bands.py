import soundfile as sf, numpy as np, os, sys
from scipy import signal as sg
WS=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..'))
p=sys.argv[1] if len(sys.argv)>1 else 'projeto/public/audio/bed.wav'
x=sf.read(os.path.join(WS,p))[0].mean(1); sr=48000
bands=[(20,60),(60,150),(150,500),(500,2000),(2000,6000),(6000,16000)]
print('sec  '+'  '.join(f'{a}-{b}'.rjust(9) for a,b in bands))
for s0,s1 in [(0,1.2),(1.2,3.4),(3.4,5.6),(5.6,7.7),(7.82,8.2),(8.3,11.2),(11.3,12.0)]:
    seg=x[int(s0*sr):int(s1*sr)]
    row=[]
    for a,b in bands:
        y=sg.sosfilt(sg.butter(4,[a,b],'band',fs=sr,output='sos'),seg)
        row.append(10*np.log10((y**2).mean()+1e-12))
    print(f'{s0:4.1f}-{s1:4.1f} '+'  '.join(f'{v:9.1f}' for v in row))
