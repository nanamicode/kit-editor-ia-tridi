import json
from faster_whisper import WhisperModel
m=WhisperModel("small",device="cpu",compute_type="int8")
out={}
for i in range(1,9):
    segs,_=m.transcribe(f"originais/validados/v{i}.mp4",language="pt")
    out[i]=" ".join(s.text.strip() for s in segs)
json.dump(out,open("analise/validados/transcricoes.json","w",encoding="utf-8"),ensure_ascii=False,indent=1)
