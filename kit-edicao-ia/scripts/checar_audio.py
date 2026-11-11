# -*- coding: utf-8 -*-
"""
checar_audio.py — mede o mix por numeros (o agente nao ouve): LUFS integrado, true peak, LRA, clipping,
e a razao voz/bed por janela, apontando os trechos em que a voz fica menos de N dB acima do bed.

  # mix montado aqui a partir das faixas (mesmos volumes do <SoundMix>)
  python scripts/checar_audio.py --voz template/public/exemplo/criativo.mp4 --voz-vol 0.668 \
         --bed template/public/audio/bed.wav --cues template/src/kit/audio/cues.exemplo.json
  # MP4 final (so loudness/pico/clipping; razao voz/bed exige as faixas separadas)
  python scripts/checar_audio.py --mix entregas/V02.mp4
  # comparar um bed novo com o aprovado (loudness, bandas, transientes, residuo)
  python scripts/checar_audio.py --bed novo/bed.wav --comparar template/public/exemplo/audio/bed.wav

Trechos de fala (para a razao voz/bed): --fala ini-fim (repetivel) | --analise analise.json | --cues cues.json (info.fala
ou itens tipo "fala"). Sem isso, detecta pela energia da voz (pode confundir cliques do B-roll com fala).
Alvos padrao: -14 LUFS (+-1), true peak <= -1 dBTP, voz >= 6 dB acima do bed (K-weighted, janela 400 ms).
Deps: numpy, scipy, soundfile; ffmpeg no PATH.
"""
import argparse, json, os, re, subprocess, tempfile

import numpy as np
import soundfile as sf
from scipy import signal as sg

SR = 48000


def load(path):
    fd, tmp = tempfile.mkstemp(suffix=".wav")
    os.close(fd)
    try:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", path, "-vn", "-ar", str(SR), "-ac", "2", "-c:a", "pcm_f32le", tmp],
                       check=True)
        x, _ = sf.read(tmp, dtype="float64")
    finally:
        os.remove(tmp)
    return x


def ebur128(x):
    fd, tmp = tempfile.mkstemp(suffix=".wav")
    os.close(fd)
    try:
        sf.write(tmp, x.astype(np.float32), SR, subtype="FLOAT")
        r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", tmp, "-af", "ebur128=peak=true", "-f", "null", "-"],
                           capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
    finally:
        os.remove(tmp)
    g = lambda pat: (float(re.findall(pat, r)[-1]) if re.findall(pat, r) else None)
    return {"lufs": g(r"I:\s+(-?[\d.]+) LUFS"), "tp_dbtp": g(r"Peak:\s+(-?[\d.]+) dBFS"), "lra": g(r"LRA:\s+(-?[\d.]+) LU")}


def kweight(x):
    b1, a1 = [1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585]
    b2, a2 = [1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621]
    return sg.lfilter(b2, a2, sg.lfilter(b1, a1, x, axis=0), axis=0)


def momentary(x, win=0.4, hop=0.1):
    k = kweight(x)
    p = (k ** 2).sum(1)
    w, h = int(win * SR), int(hop * SR)
    c = np.concatenate([[0], np.cumsum(p)])
    n = max(0, (len(p) - w) // h + 1)
    ms = np.array([(c[i * h + w] - c[i * h]) / w for i in range(n)])
    t = np.arange(n) * hop + win / 2
    return t, -0.691 + 10 * np.log10(ms + 1e-12)


def bandas(x):
    m = x.mean(1)
    out = {}
    for a, b in [(20, 60), (60, 150), (150, 500), (500, 2000), (2000, 6000), (6000, 16000)]:
        y = sg.sosfilt(sg.butter(4, [a, b], "band", fs=SR, output="sos"), m)
        out[f"{a}-{b}"] = round(float(10 * np.log10(np.mean(y ** 2) + 1e-12)), 1)
    return out


def transientes(x, rel_db=24.0):
    m = np.abs(x).max(1)
    hop = int(0.005 * SR)
    n = len(m) // hop
    e = 20 * np.log10(np.array([m[i * hop:(i + 1) * hop].max() for i in range(n)]) + 1e-9)
    base = np.array([e[max(0, i - 10):i].min() if i else e[0] for i in range(n)])
    nov = e - base
    pk = [i for i in range(1, n - 1) if nov[i] >= 9 and nov[i] >= nov[i - 1] and nov[i] > nov[i + 1] and e[i] > e.max() - rel_db]
    out = []
    for i in pk:
        if out and i * 0.005 - out[-1] < 0.08:
            continue
        out.append(round(i * 0.005, 3))
    return out


def ler_fala(a):
    seg = []
    for s in a.fala:
        x, y = s.split("-")
        seg.append((float(x), float(y)))
    if a.analise:
        seg += [tuple(s) for s in json.load(open(a.analise, encoding="utf-8")).get("fala", [])]
    if a.cues:
        raw = json.load(open(a.cues, encoding="utf-8"))
        if isinstance(raw, dict):
            seg += [tuple(s) for s in raw.get("fala", [])]
            raw = raw.get("cues", [])
        for c in raw:
            if c.get("tipo") == "info":
                seg += [tuple(s) for s in c.get("fala", [])]
            elif c.get("tipo") == "fala":
                seg.append((c["t"], c["fim"]))
    return sorted(set(seg))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--mix", help="arquivo ja mixado (wav/mp4)")
    ap.add_argument("--voz", help="faixa da voz (wav/mp4)")
    ap.add_argument("--voz-vol", type=float, default=0.668, help="volume linear da voz no mix (= voiceVolume do SoundMix)")
    ap.add_argument("--bed", help="bed.wav (trilha+SFX)")
    ap.add_argument("--bed-vol", type=float, default=1.0)
    ap.add_argument("--fala", action="append", default=[], help="trecho de fala 'ini-fim' (repetivel)")
    ap.add_argument("--analise", help="analise.json (usa 'fala')")
    ap.add_argument("--cues", help="cues.json (usa info.fala / itens fala)")
    ap.add_argument("--limiar-db", type=float, default=6.0, help="voz precisa ficar >= N dB acima do bed")
    ap.add_argument("--alvo-lufs", type=float, default=-14.0)
    ap.add_argument("--teto-dbtp", type=float, default=-1.0)
    ap.add_argument("--comparar", help="referencia (ex. bed aprovado) para comparar com --bed (ou --mix)")
    ap.add_argument("--json", help="grava o relatorio completo neste arquivo")
    a = ap.parse_args()

    rep, prob = {}, []
    voz = load(a.voz) * a.voz_vol if a.voz else None
    bed = load(a.bed) * a.bed_vol if a.bed else None
    if a.mix:
        mix = load(a.mix)
    elif voz is not None and bed is not None:
        n = max(len(voz), len(bed))
        mix = np.zeros((n, 2))
        mix[:len(voz)] += voz
        mix[:len(bed)] += bed
    else:
        mix = bed if bed is not None else voz
    if mix is None:
        ap.error("informe --mix, ou --voz e/ou --bed")

    L = ebur128(mix)
    rep["mix"] = L
    rep["mix"]["pico_amostra_dbfs"] = round(float(20 * np.log10(np.abs(mix).max() + 1e-12)), 2)
    rep["mix"]["clip_amostras"] = int((np.abs(mix) >= 0.999).sum())
    if L["lufs"] is not None and abs(L["lufs"] - a.alvo_lufs) > 1.0:
        prob.append(f"loudness {L['lufs']} LUFS fora de {a.alvo_lufs}+-1")
    if L["tp_dbtp"] is not None and L["tp_dbtp"] > a.teto_dbtp:
        prob.append(f"true peak {L['tp_dbtp']} dBTP > {a.teto_dbtp} (baixe a voz/bed ou o teto do limiter)")
    if rep["mix"]["clip_amostras"]:
        prob.append(f"{rep['mix']['clip_amostras']} amostras clipando (>= 0.999)")
    if voz is not None and not a.mix:
        rep["voz_sozinha"] = ebur128(voz)

    if voz is not None and bed is not None:
        n = min(len(voz), len(bed))
        tv, mv = momentary(voz[:n])
        _, mb = momentary(bed[:n])
        fala = ler_fala(a)
        if fala:
            act = np.zeros(len(tv), bool)
            for s, e in fala:
                act |= (tv >= s + 0.1) & (tv <= e - 0.1)
            fonte = "segmentos"
        else:
            act = mv > max(mv.max() - 20, -45)
            fonte = "auto (energia da voz; cliques podem contar como fala)"
        act &= mv > mv.max() - 30  # pausas dentro do trecho nao contam
        r = mv - mb
        rep["voz_bed"] = {"fonte_fala": fonte, "janelas_fala": int(act.sum())}
        if act.any():
            rep["voz_bed"].update(min_db=round(float(r[act].min()), 1), mediana_db=round(float(np.median(r[act])), 1),
                                  frac_abaixo=round(float((r[act] < a.limiar_db).mean()), 2))
            bad = act & (r < a.limiar_db)
            trechos, s = [], None
            for i, b in enumerate(list(bad) + [False]):
                if b and s is None:
                    s = i
                elif not b and s is not None:
                    seg = r[s:i]
                    trechos.append({"ini": round(float(tv[s] - 0.2), 2), "fim": round(float(tv[i - 1] + 0.2), 2),
                                    "pior_db": round(float(seg.min()), 1)})
                    s = None
            rep["voz_bed"]["trechos_abaixo"] = trechos
            if trechos:
                prob.append(f"voz < {a.limiar_db} dB acima do bed em {len(trechos)} trecho(s): " +
                            ", ".join(f"{x['ini']}-{x['fim']}s ({x['pior_db']} dB)" for x in trechos[:6]))

    if a.comparar:
        alvo = bed if bed is not None else mix
        ref = load(a.comparar)
        n = min(len(alvo), len(ref))
        A, R = alvo[:n], ref[:n]
        la, lr = ebur128(A), ebur128(R)
        ba, br = bandas(A), bandas(R)
        ta, tr = transientes(A), transientes(R)
        casados = [min(ta, key=lambda x: abs(x - t)) - t for t in tr if ta and min(abs(x - t) for x in ta) <= 0.03]
        res = A - R
        rep["comparacao"] = {
            "dur_s": [round(len(alvo) / SR, 3), round(len(ref) / SR, 3)],
            "lufs": [la["lufs"], lr["lufs"]], "tp_dbtp": [la["tp_dbtp"], lr["tp_dbtp"]],
            "bandas_dif_db": {k: round(ba[k] - br[k], 1) for k in ba},
            "transientes_ref": len(tr), "transientes_casados_30ms": len(casados),
            "desvio_transiente_ms_max": round(1000 * max(map(abs, casados)), 1) if casados else None,
            "residuo_db": round(float(10 * np.log10((res ** 2).mean() / ((R ** 2).mean() + 1e-12) + 1e-12)), 1),
            "correlacao": round(float(np.corrcoef(A.ravel(), R.ravel())[0, 1]), 5),
        }

    rep["problemas"] = prob
    rep["ok"] = not prob
    if a.json:
        json.dump(rep, open(a.json, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(json.dumps(rep, ensure_ascii=False))


if __name__ == "__main__":
    main()
