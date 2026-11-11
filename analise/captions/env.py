import numpy as np, soundfile as sf
a,sr=sf.read("analise/captions/speech.wav")
hop=int(sr*0.04)
for i in range(0,len(a)-hop,hop):
    t=7.5+i/sr
    if 7.9<=t<=9.0:
        r=np.sqrt(np.mean(a[i:i+hop]**2))+1e-9
        print(f"{t:.2f} {20*np.log10(r):6.1f} {'#'*int(max(0,(20*np.log10(r)+70)))}")
