import soundfile as sf, numpy as np, sys, os
WS=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..'))
def load(p): return sf.read(os.path.join(WS,p),dtype='float64')[0]
bed=load('projeto/public/audio/bed.wav'); mix=load('analise/audio/mix_teste.wav')
print('nan bed',np.isnan(bed).any(),'nan mix',np.isnan(mix).any())
sr=48000
print(' t   bed_rms bed_pk | mix_rms mix_pk')
for s in range(0,13):
    a=bed[s*sr:(s+1)*sr]; b=mix[s*sr:(s+1)*sr]
    if len(a)==0: break
    f=lambda x:20*np.log10(np.sqrt((x**2).mean())+1e-9)
    g=lambda x:20*np.log10(np.abs(x).max()+1e-9)
    print(f"{s:2d}  {f(a):6.1f} {g(a):6.1f} | {f(b):6.1f} {g(b):6.1f}")
print('clip count mix >=0.999:', int((np.abs(mix)>=0.999).sum()), ' bed:',int((np.abs(bed)>=0.999).sum()))
