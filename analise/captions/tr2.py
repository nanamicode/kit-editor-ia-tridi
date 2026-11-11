import json, numpy as np, soundfile as sf
from faster_whisper import WhisperModel
m=WhisperModel("small",device="cpu",compute_type="int8")
segs,info=m.transcribe("analise/captions/speech.wav",language="pt",word_timestamps=True,vad_filter=False,condition_on_previous_text=False)
for s in segs:
    for w in s.words: print(f"{w.word.strip():10s} {w.start+7.5:.2f} {w.end+7.5:.2f}")
# energy envelope (10ms hop) in speech window
a,sr=sf.read("analise/captions/speech.wav")
hop=int(sr*0.02)
e=[float(np.sqrt(np.mean(a[i:i+hop]**2))) for i in range(0,len(a)-hop,hop)]
mx=max(e)
line=""
for i,v in enumerate(e):
    t=7.5+i*0.02
    if 8.0<=t<=11.6: print(f"{t:.2f} {'#'*int(40*v/mx)}")
