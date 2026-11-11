import soundfile as sf, numpy as np, json, sys
from scipy.signal import stft, find_peaks
x,sr=sf.read(sys.argv[1]); x=x.mean(1); dur=len(x)/sr
hop=128; f,t,Z=stft(x,sr,nperseg=1024,noverlap=1024-hop,boundary=None,padded=False); S=np.abs(Z); fr=sr/hop
e=S[f<150].sum(0); e=e/e.max()
d=np.maximum(0,np.diff(e)); pk,_=find_peaks(d,height=0.04,distance=int(0.09*fr)); ons=t[1:][pk]
P=60/97.0; ph=0.014
for it in range(3):
    n=np.round((ons-ph)/P); res=ons-(ph+n*P); m=np.abs(res)<0.07
    A=np.stack([np.ones(m.sum()),n[m]],1); ph,P=np.linalg.lstsq(A,ons[m],rcond=None)[0]
res=ons[m]-(ph+n[m]*P)
bpm=60/P; print('bpm %.3f ph %.4f matched %d resid med %.4f'%(bpm,ph,m.sum(),np.median(np.abs(res))))
nb=int((dur-ph)/P)+1; beats=[ph+k*P for k in range(nb) if ph+k*P<dur-0.05]
down=beats[0::4]
# kicks = strong low onsets
pk2,_=find_peaks(d,height=0.12,distance=int(0.12*fr)); kicks=t[1:][pk2]
# snare (3k-12k) onsets
h=S[(f>3000)&(f<12000)].sum(0); h=h/h.max(); dh=np.maximum(0,np.diff(h)); pk3,_=find_peaks(dh,height=0.15,distance=int(0.25*fr)); sn=t[1:][pk3]
r=lambda a:[round(float(v),3) for v in a]
out={"arquivo":"sfx/trilha-cheia.wav (os mesmos tempos valem para sfx/trilha-abafada.wav)",
 "bpm":round(float(bpm),3),"periodo_s":round(float(P),5),"fase_s":round(float(ph),4),
 "formula":"batida k = fase_s + k * periodo_s ; compasso 4/4, tempo forte quando k % 4 == 0 ; frame a 30 fps = round(t*30)",
 "duracao_s":round(dur,3),
 "batidas_s":r(beats),"tempos_fortes_s":r(down),"kicks_s":r(kicks),"caixa_snare_s":r(sn),
 "metodo":"Sem librosa. Onsets da banda < 150 Hz (STFT 1024/128) -> grade de tempo constante ajustada por minimos quadrados (fase e periodo) sobre %d onsets casados, residuo mediano %.1f ms. Kicks = picos fortes < 150 Hz; caixa = picos 3-12 kHz. Conferido visualmente em 0-8 s e 90-98 s."%(int(m.sum()),1000*np.median(np.abs(res)))}
json.dump(out,open(sys.argv[2],'w'),indent=1,ensure_ascii=False)
print('beats',len(beats),'first',r(beats[:6]),'kicks',len(kicks),'snare',len(sn), r(sn[:8]))
