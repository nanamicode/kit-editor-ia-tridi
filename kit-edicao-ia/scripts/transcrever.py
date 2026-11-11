#!/usr/bin/env python3
"""
transcrever.py - transcricao palavra a palavra (faster-whisper) -> words.json [{w,s,e}].

Deps: faster-whisper (traz numpy), ffmpeg no PATH.
  pip install -r scripts/requirements.txt

Uso:
  python scripts/transcrever.py originais/video.mp4 --out analise/words.json
  python scripts/transcrever.py video.mp4 --model large-v3-turbo --lang pt --prompt "Clique em saiba mais"

Ajuste de inicio por energia (ligado por padrao; --sem-ajuste desliga):
  O Whisper costuma ADIANTAR a 1a palavra depois de silencio/ruido (no V02 marcou "Faz" em 8.28 s,
  inicio do ruido de sala; a voz entrava em 8.62 s = 0.34 s antes). Para cada palavra que vem depois
  de uma pausa (ou e a primeira), o script procura no audio o 1o trecho de >= 30 ms acima do limiar
  de voz (piso de ruido + --onset-db) dentro da palavra e move o inicio para la.
Saida no terminal: JSON curto {n, dur, model, text, ajustes:[...]}.
"""
import argparse
import json
import os
import subprocess
import sys

os.environ.setdefault("PYTHONIOENCODING", "utf-8")
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

SR = 16000
HOP = 0.01  # 10 ms


def carregar_audio(path: str):
    import numpy as np

    cmd = ["ffmpeg", "-v", "error", "-i", path, "-vn", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]
    raw = subprocess.run(cmd, check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def energia_db(x):
    import numpy as np

    hop = int(SR * HOP)
    n = len(x) // hop
    fr = x[: n * hop].reshape(n, hop)
    rms = np.sqrt(np.mean(fr * fr, axis=1) + 1e-12)
    return 20 * np.log10(rms + 1e-12)


def ajustar_inicios(words, db, onset_db: float, pausa: float, janela: float, min_ms: float):
    import numpy as np

    vivo = db[db > -90]  # ignora silencio digital
    if len(vivo) == 0:
        return words, []
    piso = float(np.percentile(vivo, 20))
    limiar = piso + onset_db
    need = max(1, int(round(min_ms / 1000 / HOP)))
    ajustes = []
    for i, w in enumerate(words):
        prev_e = words[i - 1]["e"] if i else -1.0
        if i and w["s"] - prev_e < pausa:
            continue
        a = int(w["s"] / HOP)
        b = min(len(db), int(min(w["e"] - 0.04, w["s"] + janela) / HOP))
        run = 0
        for k in range(a, b):
            run = run + 1 if db[k] >= limiar else 0
            if run >= need:
                novo = round((k - need + 1) * HOP, 2)
                if novo - w["s"] >= 0.05:
                    ajustes.append({"w": w["w"], "de": w["s"], "para": novo})
                    w["s"] = novo
                break
    return words, ajustes


def main():
    ap = argparse.ArgumentParser(description="faster-whisper -> words.json [{w,s,e}] com ajuste de inicio por energia")
    ap.add_argument("entrada", help="video ou audio")
    ap.add_argument("--out", default="analise/words.json", help="arquivo de saida (padrao analise/words.json)")
    ap.add_argument("--model", default="small", help="small | medium | large-v3 | large-v3-turbo (melhor, mais lento)")
    ap.add_argument("--lang", default="pt", help="idioma (padrao pt)")
    ap.add_argument("--prompt", default=None, help="initial_prompt: grafia esperada (roteiro, marca, termos)")
    ap.add_argument("--device", default="cpu", help="cpu | cuda")
    ap.add_argument("--compute", default="int8", help="int8 (cpu) | float16 (cuda)")
    ap.add_argument("--beam", type=int, default=5, help="beam size")
    ap.add_argument("--offset", type=float, default=0.0, help="soma (s) a todos os tempos (ex.: inicio do trecho na composicao)")
    ap.add_argument("--sem-ajuste", action="store_true", help="nao corrige o inicio das palavras pela energia")
    ap.add_argument("--onset-db", type=float, default=12.0, help="limiar de voz = piso de ruido + N dB (padrao 12)")
    ap.add_argument("--pausa", type=float, default=0.15, help="so ajusta palavras apos pausa >= N s (padrao 0.15)")
    ap.add_argument("--janela", type=float, default=0.6, help="procura a voz ate N s depois do inicio do Whisper")
    args = ap.parse_args()

    from faster_whisper import WhisperModel

    m = WhisperModel(args.model, device=args.device, compute_type=args.compute)
    segs, info = m.transcribe(
        args.entrada,
        language=args.lang,
        word_timestamps=True,
        beam_size=args.beam,
        initial_prompt=args.prompt,
        vad_filter=False,
    )
    words = []
    for s in segs:
        for w in s.words or []:
            t = w.word.strip()
            if t:
                words.append({"w": t, "s": round(w.start, 2), "e": round(w.end, 2)})

    ajustes = []
    if not args.sem_ajuste and words:
        db = energia_db(carregar_audio(args.entrada))
        words, ajustes = ajustar_inicios(words, db, args.onset_db, args.pausa, args.janela, 30)

    if args.offset:
        for w in words:
            w["s"] = round(w["s"] + args.offset, 2)
            w["e"] = round(w["e"] + args.offset, 2)

    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as fh:
        json.dump(words, fh, ensure_ascii=False, indent=0)

    print(
        json.dumps(
            {
                "n": len(words),
                "dur": round(info.duration, 2),
                "model": args.model,
                "out": args.out,
                "text": " ".join(f"{w['w']}[{w['s']}]" for w in words),
                "ajustes": ajustes,
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
