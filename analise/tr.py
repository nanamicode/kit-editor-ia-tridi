import json,sys
from faster_whisper import WhisperModel
m=WhisperModel("small",device="cpu",compute_type="int8")
segs,info=m.transcribe("originais/criativo.mp4",language="pt",word_timestamps=True)
out=[]
for s in segs:
    for w in s.words: out.append({"w":w.word,"s":round(w.start,2),"e":round(w.end,2)})
json.dump(out,open("analise/words.json","w"),ensure_ascii=False,indent=0)
print(" ".join(f"{x['w'].strip()}[{x['s']}]" for x in out))
