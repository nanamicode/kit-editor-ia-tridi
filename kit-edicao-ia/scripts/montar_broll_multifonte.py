#!/usr/bin/env python3
"""
Monta o B-roll de um criativo "show de efeitos" a partir de TRECHOS DE VARIOS VIDEOS
e gera tudo que o template precisa (bruto.mp4, clips.json, bed.wav, voz.wav).

Uso:  python3 -I montar_broll_multifonte.py spec.json

spec.json:
{
  "id": "ChancelaA",
  "public_dir": ".../kit-edicao-ia/template/public",      # raiz public/ do template
  "src_dir": ".../Criativos para Drive/Chancelas",        # onde estao os videos-fonte
  "impact_sfx": "impacto/zoom_impacto.wav",               # SFX no instante da pressao
  "shots": [  # exatamente 6, na ordem do video
    {"file": "x.mp4", "start": 3.2, "end": 5.0, "press": 3.9,
     "crop": "none|bottom|top",          # tirar faixa com texto queimado (zoom 1.33)
     "title": "ENVELOPES", "support": "RELEVO SECO NO TOQUE"}   # corte 4 (modo cartao): apoio <= 14 letras
  ]
}
Ritmo, modos e transicoes = os do V02/FV 09 validado (cortes 0 / 1.3 / 2.833 / 4.2 / 5.6 / 6.833 / 7.8 s).
O fechamento (selo 3D 7.71 s + apresentadora + CTA) vem de public/exemplo e nao muda.
"""
import json, os, subprocess, sys, tempfile

FPS = 30
CUTS = [0.0, 1.3, 2.8333, 4.2, 5.6, 6.8333, 7.8]
MODES = ["full", "card", "strip", "card", "full", "strip"]
TRANS = [None, "whip", "flash", "iris", "glitch", "wipe"]
ROLL_PRE = {"whip": -4, "flash": 0, "iris": -4, "glitch": 0, "wipe": -4}
END_SEC = 12.1
VOICE_FROM = 7.55  # a voz do V01 (fala da apresentadora) so entra a partir daqui


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        sys.exit("ERRO: " + " ".join(cmd[:6]) + "\n" + r.stderr[-1500:])
    return r.stdout


def fr(n):
    return round(n * FPS / 30)


def press_comp_offset(src_from, press):
    """instante da pressao em s desde o corte (mesma conta do autoRamp em kit/broll/plan.ts)."""
    pre = max(src_from, press - 0.06)
    approach = max(fr(2), round((pre - src_from) * FPS / 1.35))
    return (approach + fr(4)) / FPS


def vf_for(crop):
    cover = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920"
    if crop == "bottom":
        return "crop=iw:ih*0.75:0:0," + cover
    if crop == "top":
        return "crop=iw:ih*0.75:0:ih*0.25," + cover
    return cover


def main(spec_path):
    spec = json.load(open(spec_path, encoding="utf-8"))
    shots = spec["shots"]
    assert len(shots) == 6, "precisa de exatamente 6 trechos"
    out = os.path.join(spec["public_dir"], "amostras", spec["id"])
    os.makedirs(out, exist_ok=True)
    tmp = tempfile.mkdtemp()

    # 1) cada trecho normalizado (1080x1920, 30 fps, sem audio) e concatenado
    parts, clips, t = [], [], 0.0
    for i, s in enumerate(shots):
        dur = s["end"] - s["start"]
        p = os.path.join(tmp, f"p{i}.mp4")
        run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", str(s["start"]), "-t", f"{dur:.3f}",
             "-i", os.path.join(spec["src_dir"], s["file"]), "-an",
             "-vf", vf_for(s.get("crop", "none")) + f",fps={FPS},setsar=1",
             "-c:v", "libx264", "-preset", "veryfast", "-crf", "16", "-pix_fmt", "yuv420p", p])
        real = float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]))
        parts.append(p)
        clip = {
            "fromSec": round(t, 4), "toSec": round(t + real, 4),
            "durSec": round(CUTS[i + 1] - CUTS[i], 4), "mode": MODES[i],
            "title": s["title"], "support": s.get("support", ""),
            "pressSec": round(t + (s["press"] - s["start"]), 4),
        }
        if TRANS[i]:
            clip["transitionIn"] = TRANS[i]
        # ultimo rotulo sai antes do selo 3D cobrir a tela (senao aparece cortado por cima do selo)
        lab = dict(s.get("label") or {})
        if i == 5:
            lab.setdefault("outSec", -0.45)
        if lab:
            clip["label"] = lab
        clips.append(clip)
        t += real
    lst = os.path.join(tmp, "l.txt")
    open(lst, "w").write("".join(f"file '{p}'\n" for p in parts))
    run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst,
         "-c", "copy", os.path.join(out, "bruto.mp4")])
    json.dump(clips, open(os.path.join(out, "clips.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    # 2) instantes de SFX: whoosh em cada corte, impacto em cada pressao
    whooshes = [CUTS[i] + ROLL_PRE[TRANS[i]] / 30 for i in range(1, 6)]
    impacts = [CUTS[i] + press_comp_offset(c["fromSec"], c["pressSec"]) for i, c in enumerate(clips)]

    # 3) bed = musica do V02 + SFX novos (0-7.6 s) + SFX originais do fechamento (7.6 s em diante)
    lib = os.path.join(spec["public_dir"], "audio-lib", "sfx")
    ex = os.path.join(spec["public_dir"], "exemplo", "audio")
    wh = ["whoosh/transicao_rapida.wav", "whoosh/sweep_curto.wav", "whoosh/cinematico_rapido.wav",
          "whoosh/acento_rapido.wav", "whoosh/sweep_pequeno.wav"]
    inputs = ["-i", os.path.join(ex, "music.wav"), "-i", os.path.join(ex, "sfx.wav")]
    filt, labels, k = [], [], 2
    filt.append(f"[1:a]atrim=start={VOICE_FROM},asetpts=PTS-STARTPTS,adelay={int(VOICE_FROM*1000)}|{int(VOICE_FROM*1000)}[tail]")
    labels.append("[tail]")
    for j, ts in enumerate(whooshes):
        inputs += ["-i", os.path.join(lib, wh[j % len(wh)])]
        filt.append(f"[{k}:a]volume=0.55,adelay={int(max(0,ts-0.12)*1000)}|{int(max(0,ts-0.12)*1000)}[w{j}]")
        labels.append(f"[w{j}]"); k += 1
    for j, ts in enumerate(impacts):
        inputs += ["-i", os.path.join(lib, spec.get("impact_sfx", "impacto/zoom_impacto.wav"))]
        filt.append(f"[{k}:a]volume=0.8,adelay={int(ts*1000)}|{int(ts*1000)}[h{j}]")
        labels.append(f"[h{j}]"); k += 1
    # ducking: musica cheia no B-roll, baixa sob a fala da apresentadora (8.2 s em diante)
    filt.append("[0:a]volume='if(lt(t,8.1),0.9,0.38)':eval=frame[m]")
    filt.append("".join(["[m]"] + labels) + f"amix=inputs={len(labels)+1}:normalize=0,atrim=0:{END_SEC},"
                "loudnorm=I=-16:TP=-1.5:LRA=11[out]")
    run(["ffmpeg", "-nostdin", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(filt),
         "-map", "[out]", "-ar", "48000", "-ac", "2", os.path.join(out, "bed.wav")])

    # 4) voz = audio do V01 com silencio antes da fala da apresentadora
    run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", os.path.join(spec["public_dir"], "exemplo", "criativo.mp4"),
         "-vn", "-af", f"volume=enable='lt(t,{VOICE_FROM})':volume=0,afade=t=in:st={VOICE_FROM}:d=0.08",
         "-ar", "48000", "-ac", "2", os.path.join(out, "voz.wav")])

    print(json.dumps({"out": out, "bruto_sec": round(t, 2), "impacts": [round(x, 2) for x in impacts]}, ensure_ascii=False))


if __name__ == "__main__":
    main(sys.argv[1])
