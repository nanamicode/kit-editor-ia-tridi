# -*- coding: utf-8 -*-
"""
analisar_video.py — UM comando que mede o video bruto, para nao gastar tokens olhando quadros.

  python scripts/analisar_video.py originais/bruto.mp4 --saida analise/            (rapido, sem transcricao)
  python scripts/analisar_video.py originais/bruto.mp4 --saida analise/ --whisper small --lang pt
  python scripts/analisar_video.py bruto.mp4 --limiar-corte 0.30 --onset-db 14 --onset-intervalo 0.3 --sem-legenda

Gera em --saida: analise.json (compacto) e folha_1s.jpg (1 quadro por segundo, com rotulo do tempo).
Imprime um resumo JSON curto (cortes, onsets, fala, legenda queimada, loudness).

analise.json:
  video   {w,h,fps,dur,frames,codec}         audio {sr,canais,codec,lufs,tp_dbtp,clip_amostras}
  cortes  [{t,f,score}]   t = 1o quadro do plano novo (s), f = indice do quadro
  planos  [[ini,fim]]     onsets [{t,pico_db,forca_db}]  cliques/batidas em banda alta (2-12 kHz)
  fala    [[ini,fim]]     silencio [[ini,fim]]   (fala = energia 150-4000 Hz + vozeamento)
  palavras [{w,a,b,a_whisper}]   (so com --whisper; 'a' ajustado pela energia)
  legenda_queimada {y0,y1,frac_tempo,trechos} ou null   (y em px do video original)
Deps: numpy, scipy, soundfile, pillow; ffmpeg/ffprobe no PATH; faster-whisper (opcional).
"""
import argparse, json, os, re, subprocess, sys, tempfile

import numpy as np
import soundfile as sf
from scipy import signal as sg
from scipy.ndimage import maximum_filter1d, median_filter, minimum_filter1d

SR = 48000
LADO = 320  # maior lado da resolucao de analise (mantem a proporcao)


def run(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, **kw)


def probe(path):
    r = run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", path], text=True, encoding="utf-8")
    j = json.loads(r.stdout)
    v = next((s for s in j["streams"] if s["codec_type"] == "video"), None)
    a = next((s for s in j["streams"] if s["codec_type"] == "audio"), None)
    dur = float(j["format"].get("duration", 0))
    out = {"video": None, "audio": None, "dur": dur}
    if v:
        num, den = (v.get("avg_frame_rate") or v.get("r_frame_rate") or "30/1").split("/")
        fps = float(num) / float(den) if float(den) else 30.0
        rot = 0
        for sd in v.get("side_data_list", []) or []:
            rot = int(sd.get("rotation", 0) or 0)
        w, h = int(v["width"]), int(v["height"])
        if abs(rot) in (90, 270):
            w, h = h, w
        out["video"] = {"w": w, "h": h, "fps": round(fps, 3), "dur": round(float(v.get("duration", dur) or dur), 3),
                        "frames": int(v.get("nb_frames", 0) or round(fps * dur)), "codec": v.get("codec_name")}
    if a:
        out["audio"] = {"sr": int(a.get("sample_rate", 0)), "canais": int(a.get("channels", 0)), "codec": a.get("codec_name")}
    return out


# ---------------------------------------------------------------- video
def analisar_quadros(path, fps, w, h, legenda=True):
    k = LADO / max(w, h)
    FW, FH = max(16, int(w * k) // 4 * 4), max(16, int(h * k) // 4 * 4)
    vf = f"scale={FW}:{FH}:flags=area,format=rgb24"
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", path, "-an", "-vf", vf, "-f", "rawvideo", "-"],
                         stdout=subprocess.PIPE)
    fsz = FW * FH * 3
    prev_h = prev_g = None
    scores, thumbs = [], {}
    row_hits = np.zeros(FH)
    row_frames = []
    i = 0
    while True:
        buf = p.stdout.read(fsz)
        if len(buf) < fsz:
            break
        im = np.frombuffer(buf, np.uint8).reshape(FH, FW, 3)
        hist = np.concatenate([np.bincount(im[..., c].ravel() >> 4, minlength=16) for c in range(3)]) / (FW * FH)
        g = im.reshape(FH // 4, 4, FW // 4, 4, 3).mean((1, 3, 4))
        if prev_h is None:
            scores.append(0.0)
        else:
            hd = 0.5 * np.abs(hist - prev_h).sum() / 3.0
            pdif = np.abs(g - prev_g).mean() / 255.0
            scores.append(float(0.6 * hd + 0.4 * pdif * 2.5))
        prev_h, prev_g = hist, g
        sec = i / fps
        if abs(sec - round(sec)) * fps < 0.5 and int(round(sec)) not in thumbs:
            thumbs[int(round(sec))] = im.copy()
        if legenda:
            R, G_, B = (im[..., c].astype(np.int16) for c in range(3))
            white = (R > 205) & (G_ > 205) & (B > 205)
            yellow = (R > 200) & (G_ > 160) & (B < 120)
            m = (white | yellow).astype(np.int8)
            trans = np.abs(np.diff(m, axis=1)).sum(1) / FW  # alternancias por linha (texto = muitas)
            hit = trans > 0.06
            row_hits += hit
            row_frames.append(hit)
        i += 1
    p.wait()
    leg = None
    if legenda and i:
        frac = row_hits / i
        rows = frac >= max(0.12, 0.4 * frac.max())
        bands, s = [], None
        for y, r in enumerate(list(rows) + [False]):
            if r and s is None:
                s = y
            elif not r and s is not None:
                if y - s >= 3:
                    bands.append((s, y))
                s = None
        if bands:
            s, e = max(bands, key=lambda b: frac[b[0]:b[1]].sum())
            if (e - s) < FH * 0.35:
                act = np.array([rf[s:e].mean() > 0.3 for rf in row_frames])
                trechos, st = [], None
                for k, v in enumerate(list(act) + [False]):
                    if v and st is None:
                        st = k
                    elif not v and st is not None:
                        if k - st >= fps * 0.4:
                            trechos.append([round(st / fps, 2), round(k / fps, 2)])
                        st = None
                leg = {"y0": int(s * h / FH), "y1": int(e * h / FH), "frac_tempo": round(float(act.mean()), 2),
                       "trechos": trechos[:40], "nota": "heuristica (texto branco/amarelo estavel); confirmar na folha"}
    return np.array(scores), thumbs, leg, i


def achar_cortes(scores, fps, limiar, razao=3.0, min_gap=0.25):
    if len(scores) < 3:
        return []
    med = median_filter(scores, size=int(fps * 0.6) | 1, mode="nearest")
    loc = maximum_filter1d(scores, size=int(fps * min_gap) | 1)
    cand = np.where((scores >= limiar) & (scores >= razao * (med + 0.01)) & (scores == loc))[0]
    out = []
    for f in cand:
        if f == 0:
            continue
        if out and f - out[-1]["f"] < fps * min_gap:
            continue
        out.append({"t": round(f / fps, 3), "f": int(f), "score": round(float(scores[f]), 3)})
    return out


def folha(thumbs, path, cols=6):
    from PIL import Image, ImageDraw
    ks = sorted(thumbs)
    if not ks:
        return None
    FH, FW = thumbs[ks[0]].shape[:2]
    rows = (len(ks) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * FW, rows * FH), (20, 20, 20))
    d = ImageDraw.Draw(sheet)
    for n, k in enumerate(ks):
        x, y = (n % cols) * FW, (n // cols) * FH
        sheet.paste(Image.fromarray(thumbs[k]), (x, y))
        d.rectangle([x, y, x + 40, y + 16], fill=(0, 0, 0))
        d.text((x + 4, y + 2), f"{k}s", fill=(255, 220, 0))
    sheet.save(path, quality=82)
    return path


# ---------------------------------------------------------------- audio
def ler_audio(path):
    fd, tmp = tempfile.mkstemp(suffix=".wav")
    os.close(fd)
    try:
        r = run(["ffmpeg", "-v", "error", "-y", "-i", path, "-vn", "-ar", str(SR), "-ac", "2", "-c:a", "pcm_f32le", tmp])
        if r.returncode != 0:
            return None
        x, _ = sf.read(tmp, dtype="float32")
    finally:
        os.remove(tmp)
    return x


def loudness(path):
    r = run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-vn", "-af", "ebur128=peak=true", "-f", "null", "-"],
            text=True, encoding="utf-8", errors="replace").stderr
    I = re.findall(r"I:\s+(-?[\d.]+) LUFS", r)
    tp = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", r)
    return (float(I[-1]) if I else None), (float(tp[-1]) if tp else None)


def env_db(x, lo, hi, hop, win):
    y = sg.sosfilt(sg.butter(4, [lo, hi], "band", fs=SR, output="sos"), x)
    n = len(y) // hop
    e = np.array([np.mean(y[i * hop:i * hop + win] ** 2) for i in range(n)])
    return 10 * np.log10(e + 1e-12)


def achar_onsets(x, onset_db, intervalo, banda=(2000, 12000), rel_db=30.0):
    hop = int(0.005 * SR)
    e = env_db(x, banda[0], min(banda[1], SR / 2 - 100), hop, 2 * hop)
    e = np.maximum(e, max(np.percentile(e, 5), -90.0))  # silencio digital nao vira "subida" infinita
    base = minimum_filter1d(e, size=11, origin=5)  # minimo dos ~50 ms anteriores
    nov = e - base
    piso = np.percentile(e, 20)
    k = max(1, int(intervalo / 0.005))
    loc = maximum_filter1d(nov, size=2 * k + 1)
    idx = np.where((nov >= onset_db) & (nov == loc) & (e > piso + onset_db))[0]
    out = []
    for i in idx:
        j = i + int(np.argmax(e[i:i + 8]))  # pico ate 40 ms depois
        a0 = i
        while a0 > max(0, i - 8) and e[a0 - 1] >= e[j] - 12:  # inicio do ataque (-12 dB do pico)
            a0 -= 1
        if out and (a0 * 0.005 - out[-1]["t"]) < intervalo:
            continue
        out.append({"t": round(a0 * 0.005, 3), "t_pico": round(j * 0.005, 3), "pico_db": round(float(e[j]), 1),
                    "forca_db": round(float(nov[i]), 1)})
    if out:  # descarta onsets muito fracos perto do mais forte (ruido de fundo, respiracao)
        top = max(o["pico_db"] for o in out)
        out = [o for o in out if o["pico_db"] >= top - rel_db]
    return out


def achar_fala(x, limiar_db=None, min_fala=0.30, max_gap=0.30):
    hop = int(0.010 * SR)
    e = env_db(x, 150, 4000, hop, 3 * hop)
    piso = np.percentile(e, 10)
    thr = limiar_db if limiar_db is not None else max(piso + 15, e.max() - 40)
    on = e > thr
    # vozeamento: autocorrelacao normalizada em 80-400 Hz, quadros de 40 ms
    xl = sg.sosfilt(sg.butter(4, [70, 1000], "band", fs=SR, output="sos"), x)
    fl = int(0.04 * SR)
    vo = np.zeros(len(e))
    for i in range(0, len(e), 2):
        seg = xl[i * hop:i * hop + fl]
        if len(seg) < fl or not on[i]:
            continue
        seg = seg - seg.mean()
        ac = np.fft.irfft(np.abs(np.fft.rfft(seg, 2 * fl)) ** 2)[:fl]
        if ac[0] <= 0:
            continue
        lo, hi = int(SR / 400), int(SR / 80)
        vo[i:i + 2] = ac[lo:hi].max() / ac[0]
    segs, s = [], None
    for i, v in enumerate(list(on) + [False]):
        if v and s is None:
            s = i
        elif not v and s is not None:
            segs.append([s, i]); s = None
    merged = []
    for a, b in segs:
        if merged and (a - merged[-1][1]) * 0.01 < max_gap:
            merged[-1][1] = b
        else:
            merged.append([a, b])
    fala = []
    for a, b in merged:
        if (b - a) * 0.01 < min_fala:
            continue
        v = vo[a:b][vo[a:b] > 0]
        if len(v) and np.median(v) > 0.35:
            fala.append([round(a * 0.01, 2), round(b * 0.01, 2)])
    return fala, e, thr


def transcrever(path, modelo, lang, e_fala, thr):
    from faster_whisper import WhisperModel
    m = WhisperModel(modelo, device="cpu", compute_type="int8")
    segs, _ = m.transcribe(path, language=lang, word_timestamps=True, vad_filter=False)
    out = []
    for s in segs:
        for w in s.words or []:
            a, b = float(w.start), float(w.end)
            # ajuste pela energia: so move se houver uma subida (silencio -> som) perto do inicio do Whisper
            i0, i1 = max(1, int((a - 0.12) / 0.01)), min(len(e_fala) - 1, int((a + 0.25) / 0.01))
            loc = e_fala[int(a / 0.01):max(int(b / 0.01), int(a / 0.01) + 1)]
            ref = max(thr, (loc.max() - 20) if len(loc) else thr)
            cruz = [i for i in range(i0, i1 + 1) if e_fala[i - 1] < ref <= e_fala[i]]
            aj = min(cruz, key=lambda i: abs(i * 0.01 - a)) * 0.01 if cruz else a
            out.append({"w": w.word.strip(), "a": round(min(aj, b - 0.02), 2), "b": round(b, 2), "a_whisper": round(a, 2)})
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video")
    ap.add_argument("--saida", default="analise", help="pasta de saida")
    ap.add_argument("--limiar-corte", type=float, default=0.25, help="score minimo de corte (0-1); suba se achar cortes falsos")
    ap.add_argument("--razao-corte", type=float, default=3.0, help="score precisa ser N x a mediana local (filtra movimento)")
    ap.add_argument("--onset-db", type=float, default=12.0, help="subida minima (dB em ~50 ms) na banda 2-12 kHz")
    ap.add_argument("--onset-intervalo", type=float, default=0.20, help="intervalo minimo entre onsets (s)")
    ap.add_argument("--onset-rel-db", type=float, default=30.0, help="descarta onsets com pico N dB abaixo do mais forte")
    ap.add_argument("--fala-limiar-db", type=float, help="limiar absoluto (dBFS) da energia de fala; default automatico")
    ap.add_argument("--whisper", choices=["base", "small", "medium", "large-v3", "large-v3-turbo"], help="transcreve palavra a palavra")
    ap.add_argument("--lang", default="pt")
    ap.add_argument("--sem-legenda", action="store_true", help="pula a deteccao de legenda queimada")
    ap.add_argument("--sem-folha", action="store_true")
    a = ap.parse_args()
    os.makedirs(a.saida, exist_ok=True)

    P = probe(a.video)
    res = {"arquivo": os.path.basename(a.video), "video": P["video"], "audio": P["audio"]}
    if P["video"]:
        v = P["video"]
        scores, thumbs, leg, nf = analisar_quadros(a.video, v["fps"], v["w"], v["h"], not a.sem_legenda)
        v["frames"] = nf or v["frames"]
        cortes = achar_cortes(scores, v["fps"], a.limiar_corte, a.razao_corte)
        res["cortes"] = cortes
        bounds = [0.0] + [c["t"] for c in cortes] + [round(nf / v["fps"], 3)]
        res["planos"] = [[bounds[k], bounds[k + 1]] for k in range(len(bounds) - 1)]
        res["legenda_queimada"] = leg
        if not a.sem_folha:
            res["folha"] = os.path.basename(folha(thumbs, os.path.join(a.saida, "folha_1s.jpg")) or "")
    if P["audio"]:
        x = ler_audio(a.video)
        mono = x.mean(1).astype(np.float64)
        I, tp = loudness(a.video)
        res["audio"].update(lufs=I, tp_dbtp=tp, clip_amostras=int((np.abs(x) >= 0.999).sum()))
        res["onsets"] = achar_onsets(mono, a.onset_db, a.onset_intervalo, rel_db=a.onset_rel_db)
        fala, e_fala, thr = achar_fala(mono, a.fala_limiar_db)
        res["fala"] = fala
        dur = len(mono) / SR
        sil, last = [], 0.0
        for s, e in fala:
            if s - last > 0.2:
                sil.append([round(last, 2), s])
            last = e
        if dur - last > 0.2:
            sil.append([round(last, 2), round(dur, 2)])
        res["silencio"] = sil
        if a.whisper:
            res["palavras"] = transcrever(a.video, a.whisper, a.lang, e_fala, thr)
    with open(os.path.join(a.saida, "analise.json"), "w", encoding="utf-8") as fh:
        json.dump(res, fh, ensure_ascii=False, separators=(",", ":"))
    resumo = {
        "video": P["video"] and {k: P["video"][k] for k in ("w", "h", "fps", "dur")},
        "cortes": [c["t"] for c in res.get("cortes", [])],
        "onsets": [o["t"] for o in res.get("onsets", [])][:40],
        "fala": res.get("fala"),
        "lufs": res.get("audio", {}) and res["audio"].get("lufs"),
        "tp": res.get("audio", {}) and res["audio"].get("tp_dbtp"),
        "legenda": res.get("legenda_queimada") and {k: res["legenda_queimada"][k] for k in ("y0", "y1", "frac_tempo")},
        "palavras": len(res.get("palavras", [])) if a.whisper else None,
        "saida": a.saida,
    }
    if resumo["tp"] is not None and resumo["tp"] > -1.0:
        resumo["aviso"] = "audio original passa de -1 dBTP: baixe o volume da voz no mix (ex. 0.668 = -3.5 dB)"
    print(json.dumps(resumo, ensure_ascii=False))


if __name__ == "__main__":
    main()
