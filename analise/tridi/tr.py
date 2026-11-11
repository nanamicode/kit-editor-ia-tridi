import json,sys
from faster_whisper import WhisperModel
m=WhisperModel("small",device="cpu",compute_type="int8")
out={}
for i in (1,2,3):
    segs,_=m.transcribe(f"originais/tridi/ref{i}.mp4",language="pt",word_timestamps=False)
    out[i]=[(round(s.start,1),round(s.end,1),s.text.strip()) for s in segs]
json.dump(out,open("analise/tridi/transcricoes.json","w",encoding="utf-8"),ensure_ascii=False,indent=1)
