import json
from faster_whisper import WhisperModel
m=WhisperModel("small",device="cpu",compute_type="int8")
segs,_=m.transcribe("originais/validados/v8.mp4",language="en",word_timestamps=True)
words=[]
for s in segs:
    for w in s.words: words.append({"w":w.word.strip(),"s":round(w.start,2),"e":round(w.end,2)})
json.dump(words,open("analise/validados/v8/palavras_en.json","w",encoding="utf-8"),ensure_ascii=False,indent=0)
print(" ".join(f"{w['w']}@{w['s']}" for w in words))
