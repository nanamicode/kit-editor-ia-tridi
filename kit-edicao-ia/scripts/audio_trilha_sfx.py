# -*- coding: utf-8 -*-
"""
audio_trilha_sfx.py — trilha + SFX 100% sintetizados (numpy/scipy, sem samples) a partir de uma lista de cues.
Generaliza o make_audio.py aprovado no criativo de carimbos (V02).

Saida (--saida DIR): music.wav, sfx.wav, bed.wav (= music+sfx com ducking, soft-clip e limiter; 48 kHz estereo PCM16),
mix_teste.wav (voz*ganho + bed, PCM24) e cues_resolvidos.json (cues normalizados + grade + instantes derivados).

Exemplos
  # reproduzir o bed aprovado (V02)
  python scripts/audio_trilha_sfx.py --cues template/src/kit/audio/cues.exemplo.json \
         --voz template/public/exemplo/criativo.mp4 --saida tmp_audio
  # video novo: cues gerados do analise.json (analisar_video.py) + revelacao marcada a mao
  python scripts/audio_trilha_sfx.py --de-analise analise.json --revelacao 7.8 --bpm auto \
         --voz bruto.mp4 --saida template/public/audio --salvar-cues cues.json
  # so gerar/ajustar os cues (sem sintetizar)
  python scripts/audio_trilha_sfx.py --de-analise analise.json --so-cues --salvar-cues cues.json

Formato do cues.json: lista de objetos {"t": seg, "tipo": ..., ...} (ou {"cues": [...], "bpm":..}).
  tipos: corte | pressao | relevo | riser | revelacao | ui | ding | stinger | fala (t + fim)
  campos opcionais: nome, gain_db (por evento), glitch (corte: bool), brilho/ring (relevo, material),
                    fim (riser sem revelacao; fala).  Um item {"tipo":"info","bpm":..,"grid_offset_s":..} fixa a grade.
  Compativel com o cues.json legado do V02 (tipo "impacto" + nome com pressao/relevo/stinger, "cta" = ui).
Deps: numpy, scipy, soundfile; ffmpeg no PATH.
"""
import argparse, json, os, re, subprocess, sys, tempfile

import numpy as np
import soundfile as sf
from scipy import signal as sg
from scipy.ndimage import minimum_filter1d, uniform_filter1d

SR = 48000
TIPOS = ("corte", "pressao", "relevo", "riser", "revelacao", "ui", "ding", "stinger", "fala")

# materiais do V02 (brilho do chk, ring) — usados pelo nome quando o cue nao traz brilho/ring
MATERIAIS = {
    "envelope azul": (0.85, 0.8), "adesivo": (1.00, 1.0), "guardanapo": (0.80, 0.6),
    "selo dourado": (1.25, 1.7), "envelope verde-agua": (0.95, 0.9), "cartao": (1.05, 1.0),
    "papel": (0.85, 0.8), "metal": (1.25, 1.7), "madeira": (0.75, 0.5), "plastico": (1.05, 0.7),
}
MAT_SEQ = [(0.85, 0.8), (1.00, 1.0), (0.80, 0.6), (1.25, 1.7), (0.95, 0.9), (1.05, 1.0)]

ENERGIA = {  # offsets em dB por camada
    "baixa": dict(drum=-4.0, arp=-3.0, bass=-2.0, pad=0.0),
    "media": dict(drum=0.0, arp=0.0, bass=0.0, pad=0.0),
    "alta": dict(drum=1.5, arp=1.0, bass=1.0, pad=-1.0),
}
NOTAS = {"C": 0, "C#": 1, "DB": 1, "D": 2, "D#": 3, "EB": 3, "E": 4, "F": 5, "F#": 6, "GB": 6, "G": 7,
         "G#": 8, "AB": 8, "A": 9, "A#": 10, "BB": 10, "B": 11}


# ================================================================ DSP basico
def db(x):
    return 10 ** (np.asarray(x, dtype=float) / 20.0)


def tarr(n):
    return np.arange(n) / SR


def _sos(kind, fc, order):
    return sg.butter(order, fc, btype=kind, fs=SR, output="sos")


def lp(x, fc, order=2):
    return sg.sosfilt(_sos("low", fc, order), x, axis=0)


def hp(x, fc, order=2):
    return sg.sosfilt(_sos("high", fc, order), x, axis=0)


def bp(x, lo, hi, order=2):
    return sg.sosfilt(_sos("band", [lo, hi], order), x, axis=0)


def noise(n, seed):
    return np.random.default_rng(seed).standard_normal(n)


def norm(x, peak=1.0):
    m = np.max(np.abs(x))
    return x * (peak / m) if m > 0 else x


def to_stereo(sig, pan=0.0):
    if sig.ndim == 2:
        return sig
    a = (pan + 1.0) * np.pi / 4.0
    return np.stack([sig * np.cos(a), sig * np.sin(a)], 1)


def add(buf, sig, t, gain=1.0, pan=0.0):
    sig = to_stereo(sig, pan) * gain
    i = int(round(t * SR))
    a, b = max(i, 0), min(i + len(sig), len(buf))
    if b > a:
        buf[a:b] += sig[a - i:b - i]


def make_ir(rt, seed, damp=5500, pre=0.012):
    n = int(rt * 1.3 * SR)
    ir = noise(n, seed) * np.exp(-tarr(n) * 6.91 / rt)
    ir = lp(ir, damp, 1)
    ir = np.concatenate([np.zeros(int(pre * SR)), ir])
    return ir / np.sqrt(np.sum(ir ** 2))


def reverb(x, rt=1.4, seed=11, damp=5500):
    irL, irR = make_ir(rt, seed, damp), make_ir(rt, seed + 100, damp)
    n = len(x) + len(irL)
    l = sg.fftconvolve(x[:, 0], irL)[:n]
    r = sg.fftconvolve(x[:, 1], irR)[:n]
    out = np.zeros((n, 2))
    out[:len(l), 0] = l
    out[:len(r), 1] = r
    return out


def sweep_noise(dur, f0, f1, width=1.2, seed=0):
    n = max(int(dur * SR), 2048)
    x = noise(n, seed)
    nper, hop = 2048, 512
    f, tt, Z = sg.stft(x, SR, nperseg=nper, noverlap=nper - hop)
    pr = np.clip(tt / max(dur, 1e-3), 0, 1)
    fc = f0 * (f1 / f0) ** pr
    d = (np.log2(f[:, None] + 1e-9) - np.log2(fc[None, :])) / (width / 2.355)
    _, y = sg.istft(Z * np.exp(-0.5 * d ** 2), SR, nperseg=nper, noverlap=nper - hop)
    n = int(dur * SR)
    y = y[:n]
    if len(y) < n:
        y = np.pad(y, (0, n - len(y)))
    return norm(y)


# ================================================================ instrumentos (identicos ao V02)
def kick(dur=0.40, f0=190, f1=58, decay=0.12, drive=1.5, click=0.55):
    t = tarr(int(dur * SR))
    f = f1 + (f0 - f1) * np.exp(-t / 0.028)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / decay)
    cl = hp(noise(len(t), 3), 2500) * np.exp(-t / 0.0025) * click
    y = np.tanh((body + cl) * drive) / np.tanh(drive)
    y[: int(0.0008 * SR)] *= np.linspace(0, 1, int(0.0008 * SR))
    return y


def snare(dur=0.30, tone=190, bright=1.0, seed=5):
    t = tarr(int(dur * SR))
    nz = bp(noise(len(t), seed), 1800, 9500) * np.exp(-t / 0.085) * bright
    f = tone * (1 + 0.35 * np.exp(-t / 0.02))
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.055) * 0.8
    return np.tanh((nz * 1.1 + body) * 1.2)


def clap(dur=0.28, seed=8):
    t = tarr(int(dur * SR))
    y = np.zeros(len(t))
    for k, d in enumerate([0.0, 0.011, 0.023]):
        i = int(d * SR)
        seg = bp(noise(len(t) - i, seed + k), 1100, 3600) * np.exp(-tarr(len(t) - i) / (0.008 if k < 2 else 0.07))
        y[i:] += seg * (0.7 if k < 2 else 1.0)
    return np.tanh(y * 1.4)


def hat(open_=False, seed=21, bright=1.0):
    dur = 0.16 if open_ else 0.05
    t = tarr(int(dur * SR))
    nz = hp(noise(len(t), seed), 7200, 3)
    met = sum(np.sign(np.sin(2 * np.pi * fr * t)) for fr in (3170, 4210, 5730, 7890, 9310, 10640))
    met = hp(met, 6500, 2) * 0.12
    env = np.exp(-t / (0.055 if open_ else 0.014))
    return (nz + met) * env * bright


def bass_note(freq, dur, grit=1.0):
    n = int((dur + 0.06) * SR)
    t = tarr(n)
    saw = sg.sawtooth(2 * np.pi * freq * t)
    a, b = lp(saw, 240, 2), lp(saw, 1100, 2)
    w = np.exp(-t / 0.09)
    f = a * (1 - w) + b * w
    sub = np.sin(2 * np.pi * freq * t) + 0.18 * np.sin(2 * np.pi * freq / 2 * t)
    y = np.tanh((f * 1.0 + sub * 0.7) * 1.4 * grit)
    env = np.minimum(t / 0.006, 1.0) * np.where(t < dur, 1.0, np.exp(-(t - dur) / 0.02))
    return y * env


def mid(m):
    return 440.0 * 2 ** ((m - 69) / 12.0)


def saw_pad_note(m, dur, seed):
    n = int((dur + 0.5) * SR)
    t = tarr(n)
    out = np.zeros((n, 2))
    rng = np.random.default_rng(seed)
    for side in (0, 1):
        for det in (-9, 0, 8):
            c = det + rng.uniform(-3, 3) + (4 if side else -4)
            f = mid(m) * 2 ** (c / 1200.0)
            ph = rng.uniform(0, 2 * np.pi)
            out[:, side] += sg.sawtooth(2 * np.pi * f * t + ph)
    env = np.minimum(t / 0.30, 1.0) * np.where(t < dur, 1.0, np.exp(-(t - dur) / 0.20))
    return out * env[:, None] / 6.0


def pluck(m, dur=0.22):
    t = tarr(int(dur * SR))
    f = mid(m)
    y = np.sin(2 * np.pi * f * t) + 0.45 * np.sin(2 * np.pi * 2 * f * t) + 0.22 * np.sin(2 * np.pi * 3 * f * t + 1) \
        + 0.12 * np.sign(np.sin(2 * np.pi * f * t))
    env = np.minimum(t / 0.002, 1) * np.exp(-t / 0.075)
    return lp(y * env, 5200, 2)


def crash(dur=1.2, seed=33, bright=1.0):
    t = tarr(int(dur * SR))
    y = hp(noise(len(t), seed), 4500, 2) * np.exp(-t / 0.35)
    y += 0.4 * hp(noise(len(t), seed + 1), 9000, 2) * np.exp(-t / 0.6)
    return y * bright


def thump(dur=0.30, f0=125, f1=62, decay=0.10, drive=1.3):
    t = tarr(int(dur * SR))
    f = f1 + (f0 - f1) * np.exp(-t / 0.022)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / decay)
    y = np.tanh(y * drive) / np.tanh(drive)
    y[: int(0.0006 * SR)] *= np.linspace(0, 1, int(0.0006 * SR))
    return y


def metal_chk(bright=1.0, seed=60, ring=1.0, dur=0.22):
    n = int(dur * SR)
    t = tarr(n)
    rng = np.random.default_rng(seed)
    y = np.zeros(n)
    for fr, tau, a in [(2310, 0.040, 1.0), (3560, 0.030, 0.8), (4920, 0.024, 0.7), (6480, 0.018, 0.55), (8110, 0.012, 0.45)]:
        fr = fr * bright * rng.uniform(0.985, 1.015)
        y += a * np.sin(2 * np.pi * fr * t + rng.uniform(0, 6.28)) * np.exp(-t / (tau * ring))
    y *= 0.35
    y += bp(noise(n, seed + 1), 2800, 11000) * np.exp(-t / 0.0045) * 1.3
    y = np.tanh(y * 1.2)
    y[: int(0.0004 * SR)] *= np.linspace(0, 1, int(0.0004 * SR))
    return y


def whoosh(pre=0.36, post=0.26, f_lo=260, f_hi=6200, pan_dir=1, seed=40, width=1.3):
    up = sweep_noise(pre, f_lo, f_hi, width, seed)
    down = sweep_noise(post, f_hi * 0.8, f_lo * 2.2, width, seed + 1)
    ut = np.linspace(0, 1, len(up))
    up = up * ut ** 2.2
    dt = tarr(len(down))
    down = down * np.exp(-dt / 0.085)
    mono = norm(np.concatenate([up, down]))
    a = np.linspace(0.0, np.pi / 2, len(mono))
    if pan_dir < 0:
        a = a[::-1]
    wide = np.concatenate([sweep_noise(pre, f_lo, f_hi, width, seed + 7) * ut ** 2.2,
                           sweep_noise(post, f_hi * 0.8, f_lo * 2.2, width, seed + 8) * np.exp(-dt / 0.085)])
    wide = norm(wide)
    L = mono * np.cos(a) * 0.75 + wide * 0.45
    R = mono * np.sin(a) * 0.75 + wide * 0.45 * np.cos(a * 2)
    return np.stack([L, R], 1), len(up) / SR


def glitch(seed=77, grains=(1800, 900, 2700, 450, 3600, 1350), g_ms=14):
    gl = int(g_ms / 1000 * SR)
    out = []
    rng = np.random.default_rng(seed)
    for i, fr in enumerate(grains):
        t = tarr(gl)
        sq = np.sign(np.sin(2 * np.pi * fr * t)) * 0.6 + bp(noise(gl, seed + i), 1500, 9000) * 0.5
        sq = np.round(sq * 6) / 6.0
        sq *= np.hanning(gl) ** 0.4
        out.append(sq)
        out.append(np.zeros(int(rng.uniform(0.002, 0.007) * SR)))
    y = np.concatenate(out)
    return y / np.max(np.abs(y))


def bell(f, dur=1.4):
    t = tarr(int(dur * SR))
    y = np.zeros(len(t))
    for ratio, tau, a in [(1.0, 0.55, 1.0), (2.76, 0.28, 0.5), (5.40, 0.16, 0.28), (8.93, 0.09, 0.16), (2.0, 0.40, 0.35)]:
        y += a * np.sin(2 * np.pi * f * ratio * t) * np.exp(-t / tau)
    return y * np.minimum(t / 0.002, 1)


def one_pole_asym(x, t_att, t_rel):
    a = np.exp(-1.0 / (t_att * SR))
    r = np.exp(-1.0 / (t_rel * SR))
    y = np.empty_like(x)
    s = x[0]
    for i in range(len(x)):
        c = a if x[i] > s else r
        s = c * s + (1 - c) * x[i]
        y[i] = s
    return y


def softclip(x, thr, c):
    a = np.abs(x)
    k = c - thr
    y = np.where(a <= thr, a, thr + k * np.tanh((a - thr) / k))
    return np.sign(x) * y


def limiter(x, ceil_db, look=0.004, rel=0.09):
    c = db(ceil_db)
    pk = np.abs(x).max(1)
    g = np.minimum(1.0, c / (pk + 1e-9))
    la = int(look * SR)
    g = minimum_filter1d(g, size=2 * la + 1)
    out = np.empty_like(g)
    rc = 1 - np.exp(-1.0 / (rel * SR))
    s = 1.0
    for i in range(len(g)):
        s = min(g[i], s + (1 - s) * rc)
        out[i] = s
    w = np.hanning(2 * la + 1)
    w /= w.sum()
    out = np.convolve(np.pad(out, (la, la), mode="edge"), w, mode="valid")
    return x * out[:, None], out


def fade_edges(x):
    n_in, n_out = int(0.004 * SR), int(0.30 * SR)
    x[:n_in] *= np.linspace(0, 1, n_in)[:, None]
    x[-n_out:] *= np.linspace(1, 0, n_out)[:, None] ** 1.5
    return x


def curve(t, points):
    pts = sorted(points)
    xs, ys = [], []
    for x, y in pts:
        if xs and x <= xs[-1] + 1e-6:
            continue
        xs.append(x)
        ys.append(y)
    return db(np.interp(t, xs, ys))


def lufs(path):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
    I = re.findall(r"I:\s+(-?[\d.]+) LUFS", r)
    tp = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", r)
    return (float(I[-1]) if I else None), (float(tp[-1]) if tp else None)


def load_audio(path):
    """wav/mp4/qualquer -> float32 (n,2) 48 kHz via ffmpeg."""
    fd, tmp = tempfile.mkstemp(suffix=".wav")
    os.close(fd)
    try:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", path, "-vn", "-ar", str(SR), "-ac", "2", "-c:a", "pcm_f32le", tmp],
                       check=True)
        x, _ = sf.read(tmp, dtype="float32")
    finally:
        os.remove(tmp)
    return x


# ================================================================ cues
def ler_cues(path):
    with open(path, encoding="utf-8") as fh:
        raw = json.load(fh)
    info = {}
    if isinstance(raw, dict):
        info = {k: v for k, v in raw.items() if k != "cues"}
        raw = raw.get("cues", [])
    cues = []
    for c in raw:
        tipo = str(c.get("tipo", "")).lower()
        if tipo == "info":
            info.update(c)
            continue
        nome = str(c.get("nome", "")).lower()
        d = dict(c)
        if tipo == "impacto":  # legado V02
            if "pressao" in nome or "pressão" in nome:
                tipo = "pressao"
            elif "relevo" in nome:
                tipo = "relevo"
            elif "stinger" in nome:
                tipo = "stinger"
            else:
                tipo = "pressao"
        if tipo == "cta":
            tipo = "ui"
        if tipo == "riser" and cues and any(x["tipo"] == "riser" for x in cues):
            continue  # legado: 2o/3o "riser" sao so marcos (rolo, silencio) -> derivados
        if tipo not in TIPOS:
            print(f"[aviso] cue ignorado (tipo desconhecido): {c}", file=sys.stderr)
            continue
        if tipo == "relevo" and "brilho" not in d:
            for k, v in MATERIAIS.items():
                if k in nome or k == str(d.get("material", "")).lower():
                    d["brilho"], d["ring"] = v
                    break
        d["tipo"] = tipo
        d["t"] = float(d["t"])
        cues.append(d)
    cues.sort(key=lambda c: c["t"])
    fala = [(float(a), float(b)) for a, b in info.get("fala", [])]
    fala += [(c["t"], float(c["fim"])) for c in cues if c["tipo"] == "fala"]
    return cues, info, sorted(fala)


def cues_de_analise(path, revelacao=None, relevo_delay=0.245, cta_palavras=None, max_cliques=None):
    """Gera cues a partir do analise.json de analisar_video.py."""
    A = json.load(open(path, encoding="utf-8"))
    dur = A["video"]["dur"]
    fala = [tuple(s) for s in A.get("fala", [])]
    cues = [{"t": c["t"], "tipo": "corte", "nome": "corte"} for c in A.get("cortes", [])]

    def em_fala(t):
        return any(a - 0.05 <= t <= b + 0.05 for a, b in fala)

    on = [o for o in A.get("onsets", []) if not em_fala(o["t"])]
    if max_cliques:
        on = sorted(sorted(on, key=lambda o: -o["forca_db"])[:max_cliques], key=lambda o: o["t"])
    # pares reais: clique forte (pressao) + clique mais fraco 0.15-0.35 s depois (relevo)
    usado = set()
    for k, o in enumerate(on):
        if k in usado:
            continue
        cues.append({"t": o["t"], "tipo": "pressao", "nome": "clique real (onset)"})
        par = next((j for j in range(k + 1, len(on)) if 0.15 <= on[j]["t"] - o["t"] <= 0.35
                    and on[j]["pico_db"] <= o["pico_db"]), None)
        if par is not None:
            usado.add(par)
            cues.append({"t": on[par]["t"], "tipo": "relevo", "nome": "relevo (clique real)"})
        elif relevo_delay > 0 and o["t"] + relevo_delay < dur:
            cues.append({"t": round(o["t"] + relevo_delay, 3), "tipo": "relevo", "nome": "relevo (clique + %.3f s)" % relevo_delay})
    if revelacao is not None:
        cues.append({"t": float(revelacao), "tipo": "revelacao", "nome": "revelacao"})
        cues.append({"t": round(max(0.0, float(revelacao) - 2.2), 3), "tipo": "riser", "auto_compasso": True,
                     "nome": "riser (comeca 1 compasso antes da revelacao)"})
    pal = A.get("palavras") or []
    alvo = [p.lower() for p in (cta_palavras or ["saiba", "link", "clique", "toque", "garanta", "compre", "chama"])]
    limpa = [re.sub(r"[^\wà-ú]", "", w["w"].lower()) for w in pal]
    for alv in alvo:  # prioridade = ordem da lista
        if alv in limpa:
            i = limpa.index(alv)
            cues.append({"t": pal[i]["a"], "tipo": "ui", "nome": "pop de UI: '%s'" % pal[i]["w"].strip()})
            if i + 1 < len(pal):
                cues.append({"t": pal[i + 1]["a"], "tipo": "ding", "nome": "ding: '%s'" % pal[i + 1]["w"].strip()})
            break
    if fala:
        st = (pal[-1]["b"] + 0.29) if pal else (fala[-1][1] + 0.11)
        if st < dur - 0.15:
            cues.append({"t": round(st, 3), "tipo": "stinger", "nome": "stinger apos a ultima fala"})
    for a, b in fala:
        cues.append({"t": a, "fim": b, "tipo": "fala", "nome": "fala"})
    cues.sort(key=lambda c: c["t"])
    return cues, dur


# ================================================================ grade
def fit_grade(eventos, bpm=None, offset=None, reveal=None):
    """Escolhe BPM/offset que melhor alinham os eventos (cortes + revelacao) a grade de semicolcheias."""
    ev = np.asarray(eventos, dtype=float)
    if len(ev) == 0:
        return (bpm or 110.0), (offset if offset is not None else 0.0), 0.0
    w = np.ones(len(ev))
    if reveal is not None:
        ev = np.append(ev, reveal)
        w = np.append(w, 3.0)
    bpms = [bpm] if bpm else list(np.arange(96.0, 128.01, 0.5))
    best = None
    for b in bpms:
        G = 60.0 / b / 4.0
        offs = [offset] if offset is not None else np.arange(0.0, G, 0.001)
        for o in offs:
            r = (ev - o) / G
            e = np.abs(r - np.round(r)) * G
            sc = np.max(e * w) + 0.3 * np.sqrt(np.mean((e * w) ** 2)) + 0.0004 * abs(b - 110)
            if best is None or sc < best[0]:
                best = (sc, b, float(o), float(np.max(e)))
    return best[1], round(best[2], 4), best[3]


# ================================================================ composicao
def build(cues, fala, dur, bpm, off, voz, energia, transp, duck_db):
    N = int(round(dur * SR))
    G = 60.0 / bpm / 4.0
    T = lambda n: off + n * G
    idx = lambda t: int(round((t - off) / G))
    t = tarr(N)
    E = ENERGIA[energia]
    fq = 2 ** (transp / 12.0)

    by = {k: [c for c in cues if c["tipo"] == k] for k in TIPOS}
    cuts = [c["t"] for c in by["corte"]]
    snap = lambda x: T(idx(x)) if abs(T(idx(x)) - x) <= 0.006 else x
    R = snap(by["revelacao"][0]["t"]) if by["revelacao"] else None
    Rn = idx(R) if R is not None else None
    fala_t0 = fala[0][0] if fala else None

    # fase dos compassos (16 semicolcheias)
    if Rn is not None:
        p = Rn % 16
    elif cuts:
        p = idx(cuts[0]) % 16
    else:
        p = 8
    b0 = p if p >= 4 else p + 16
    bars = []
    b = b0
    while T(b) < dur:
        bars.append(b)
        b += 16

    def papel(bb):
        if Rn is not None:
            if bb == Rn - 16 and bb >= b0:
                return "riser"
            if bb < Rn:
                return "build"
            return "post" if bb == Rn else "talk"
        if fala_t0 is not None and T(bb) >= fala_t0 - 2 * G:
            return "talk"
        return "build"

    roles = [papel(bb) for bb in bars]
    drums = np.zeros((N, 2))
    kick_times = []
    kk, sn, cl, hc, ho = kick(), snare(), clap(), hat(False), hat(True)

    def K(n, g=1.0):
        add(drums, kk, T(n), 0.80 * g)
        kick_times.append(T(n))

    def S(n, g=1.0):
        add(drums, sn, T(n), 0.70 * g, pan=-0.05)
        add(drums, cl, T(n), 0.70 * g, pan=0.05)

    def H(n, v, ref, open_=False):
        add(drums, ho if open_ else hc, T(n), 0.46 * v, pan=0.25 if (int(n - ref) % 2) else -0.2)

    # intro
    i0 = b0 - 8
    if i0 >= 0:
        K(i0, 1.0)
        S(i0, 0.55)
    if b0 - 4 >= 0:
        K(b0 - 4, 0.85)
    for n in range(0, b0):
        k = n - i0
        H(n, (0.25 + 0.05 * k * (1 if k % 2 == 0 else 0.6)) if k >= 0 else 0.2, i0)

    # acordes (A menor; transp aplicado depois)
    Am, F_, G_, E_ = (45, [57, 60, 64]), (41, [53, 57, 60]), (43, [55, 59, 62]), (40, [52, 56, 59])
    chords = [(b0 - 16, b0, Am)]
    bass_style = {}
    nb = 0
    first_talk = True
    for bb, ro in zip(bars, roles):
        if ro == "build":
            ch = Am if nb % 2 == 0 else F_
            chords.append((bb, bb + 16, ch))
            bass_style[bb] = "sparse" if nb == 0 else "mid"
            if nb == 0:
                for n in (0, 4, 8, 12):
                    K(bb + n, 0.95)
                K(bb + 10, 0.45); K(bb + 15, 0.5)
                S(bb + 4, 0.8); S(bb + 12, 1.0)
                for n in range(16):
                    H(bb + n, [0.9, 0.38, 0.65, 0.38][n % 4] * 0.85, bb)
                for n in (2, 6, 10, 14):
                    H(bb + n, 0.55, bb, True)
            else:
                for n in (0, 4, 8, 12):
                    K(bb + n, 1.0)
                K(bb + 6, 0.8); K(bb + 11, 0.45)
                S(bb + 4); S(bb + 12)
                for n in range(16):
                    H(bb + n, [1.0, 0.4, 0.7, 0.4][n % 4], bb)
                for n in (2, 6, 10, 14):
                    H(bb + n, 0.75, bb, True)
                add(drums, crash(1.0, 33, 0.6), T(bb), 0.30)
            nb += 1
        elif ro == "riser":
            chords += [(bb, bb + 8, G_), (bb + 8, bb + 16, E_)]
            bass_style[bb] = "dense"
            for n in (0, 4, 8, 12):
                K(bb + n, 1.0)
            K(bb + 6, 0.55)
            S(bb + 4)
            add(drums, crash(1.3, 35, 0.8), T(bb), 0.42)
            for n in range(15):
                H(bb + n, [1.0, 0.45, 0.75, 0.45][n % 4] * (1.0 + 0.012 * n), bb)
            for n in (2, 6):
                H(bb + n, 0.8, bb, True)
            roll = [Rn - 6, Rn - 4, Rn - 3, Rn - 2, Rn - 1.5, Rn - 1.0, Rn - 0.75]
            for i, n in enumerate(roll):
                add(drums, sn, T(n), 0.30 + 0.30 * i / len(roll), pan=(-0.1 if i % 2 else 0.1))
        elif ro == "post":
            chords += [(bb, bb + 8, F_), (bb + 8, bb + 16, G_)]
            bass_style[bb] = "mid"
            for n in (4, 8, 12):
                K(bb + n, 1.0)
            K(bb + 2, 0.6)
            S(bb + 4, 0.55); S(bb + 12, 0.5)
            for n in range(1, 16):
                H(bb + n, [1.0, 0.4, 0.7, 0.4][n % 4] * 0.9, bb)
            for n in (2, 6, 10, 14):
                H(bb + n, 0.7, bb, True)
        else:  # talk
            chords += [(bb, bb + 8, Am), (bb + 8, bb + 16, F_)]
            bass_style[bb] = "mid"
            for n in (0, 4, 8, 12):
                K(bb + n, 1.0)
            S(bb + 4, 0.5); S(bb + 12, 0.8)
            for n in range(16):
                H(bb + n, [1.0, 0.4, 0.7, 0.4][n % 4] * 0.9, bb)
            for n in (2, 6, 10, 14):
                H(bb + n, 0.7, bb, True)
            if first_talk:
                add(drums, crash(1.0, 36, 0.6), T(bb), 0.28)
                first_talk = False

    bass_pat = {
        "sparse": [(0, 4, 0), (6, 2, 0), (8, 4, 0), (14, 2, 12)],
        "mid": [(0, 3, 0), (3, 1, 0), (6, 2, 12), (8, 3, 0), (11, 2, 0), (14, 2, 12)],
        "dense": [(i, 1, 0 if i % 4 != 3 else 12) for i in range(16)],
    }
    bass = np.zeros((N, 2)); pad = np.zeros((N, 2)); arp = np.zeros((N, 2))
    for (a, b_, (bm, ch)) in chords:
        for j, m in enumerate(ch + [ch[0] + 12]):
            add(pad, saw_pad_note(m + transp, (b_ - a) * G + 0.05, 100 + j + a), T(a), 0.4 if a < b0 else 0.55)

    def chord_at(n0):
        for c in chords:
            if c[0] <= n0 < c[1]:
                return c[2]
        return chords[-1][2]

    for bb in bars:
        for (st, ln, oc) in bass_pat[bass_style[bb]]:
            add(bass, bass_note(mid(chord_at(bb + st)[0] + oc + transp), ln * G * 0.92), T(bb + st), 0.50)
    add(bass, bass_note(mid(45 + transp), 4 * G * 0.92), T(b0 - 8), 0.45)
    add(bass, bass_note(mid(45 + transp), 2 * G * 0.92), T(b0 - 2), 0.45)
    arp_pat = [0, None, 1, None, 2, None, 1, 2, 0, None, 1, None, 2, 3, 4, 5]
    for bb in bars:
        for i, v in enumerate(arp_pat):
            if v is None:
                continue
            ch = chord_at(bb + i)[1]
            add(arp, pluck(ch[v % 3] + (24 if v >= 3 else 12) + transp), T(bb + i), 0.75, pan=(-0.5 if i % 2 else 0.5))
    dl = int(3 * G * SR)
    echo = np.zeros_like(arp)
    for k, (gk, sw) in enumerate([(0.38, 1), (0.20, -1), (0.10, 1)], start=1):
        sh = np.roll(arp, dl * k, axis=0); sh[:dl * k] = 0
        echo += (sh[:, ::-1] if sw < 0 else sh) * gk
    arp = arp + echo

    pump = np.ones(N)
    for tk in kick_times:
        i = int(tk * SR); seg = min(N - i, int(0.45 * SR))
        if seg > 0 and i >= 0:
            pump[i:i + seg] = np.minimum(pump[i:i + seg], 1 - 0.62 * np.exp(-np.arange(seg) / SR / 0.105))

    # curvas de energia (ancoradas nos compassos e na revelacao/climax)
    db1 = T(b0)
    db2 = T(b0 + 16)
    X = R if R is not None else (T(bars[roles.index("talk")]) if "talk" in roles else dur + 1.0)
    db3 = X - 16 * G
    pad_gain = curve(t, [(0, -14), (db1, -10), (db2, -7), (db3, -5), (X - 0.121, 1.5), (X + 0.009, -3), (X + 0.179, -4)]) * db(E["pad"])
    arp_gain = curve(t, [(0, -80), (db1 - 0.054, -80), (db1, -16), (db2 - 0.076, -12), (db2, -9), (db3, -6),
                         (X - 0.121, -3), (X + 0.009, -5)]) * db(E["arp"])
    bass_gain = curve(t, [(0, -12), (db1, -2), (db3, 0), (X - 0.121, 1)]) * db(E["bass"])
    drum_gain = curve(t, [(0, -3), (db1, -2.5), (db2, -1.5), (db3, 0), (X - 0.121, 1)]) * db(E["drum"])
    padL, padH = lp(pad, 500, 2), lp(pad, 5200, 2)
    ow = np.clip((t - (db1 - 0.154)) / max((X - 0.121) - (db1 - 0.154), 0.5), 0, 1) ** 1.2
    pad_f = (padL * (1 - ow[:, None]) + padH * ow[:, None]) * pad_gain[:, None] * 1.1
    harm = (bass * bass_gain[:, None] + pad_f + arp * arp_gain[:, None]) * pump[:, None]
    music = drums * drum_gain[:, None] + harm * 0.9

    relevos = [c["t"] for c in by["relevo"]]
    evd = np.ones(N)
    dips = [(c, 0.40, 0.14) for c in cuts] + [(c, 0.30, 0.10) for c in relevos]
    if R is not None:
        dips.append((R, 0.5, 0.30))
    for tc, dep, tau in dips:
        i = int(tc * SR); seg = min(N - i, int(0.8 * SR))
        if seg > 0:
            evd[i:i + seg] = np.minimum(evd[i:i + seg], 1 - dep * np.exp(-np.arange(seg) / SR / tau))
    for c in cuts:
        a_, b_ = max(int((c - 0.25) * SR), 0), int(c * SR)
        if b_ > a_:
            evd[a_:b_] *= np.linspace(1.0, 0.82, b_ - a_)
    music = music * evd[:, None]

    gap0 = None
    if R is not None and by["riser"]:
        gap0 = R - 0.105
        gap = np.ones(N)
        f0, f1 = int((gap0 - 0.006) * SR), int(gap0 * SR)
        g1, g2 = int((R - 0.004) * SR), int(R * SR)
        gap[f0:f1] = np.linspace(1, 0, f1 - f0); gap[f1:g1] = 0; gap[g1:g2] = np.linspace(0, 1, g2 - g1)
        music = music * gap[:, None]

    # ducking sob a fala: base -duck_db + seguidor de envoltoria da voz (-5 dB) + mid-scoop 250-3800 Hz
    base_db = np.zeros(N)
    mask = np.zeros(N, bool)
    for a, b_ in fala:
        base_db = np.minimum(base_db, np.interp(t, [a - 0.14, a, b_, b_ + 0.49], [0, -duck_db, -duck_db, 0], left=0, right=0))
        mask |= (t >= a - 0.22) & (t <= b_ + 0.5)
    key_s = np.zeros(N)
    if voz is not None and fala:
        vm = np.abs(voz[:N]).max(1).astype(np.float64)
        vm = np.pad(vm, (0, N - len(vm)))
        env = np.sqrt(np.maximum(uniform_filter1d(vm ** 2, int(0.03 * SR)), 0))
        env[~mask] = 0
        key = np.clip((20 * np.log10(env + 1e-9) + 38) / 14, 0, 1)
        key_s = one_pole_asym(key, 0.012, 0.16)
    duck = db(base_db - 5.0 * key_s)
    scoop = music - 0.5 * bp(music, 250, 3800)
    w = np.clip(-base_db / max(duck_db, 1e-3), 0, 1)[:, None]
    music = (music * (1 - 0.65 * w) + scoop * 0.65 * w) * duck[:, None]
    if fala:
        bl = fala[-1][1]
        music *= db(np.interp(t, [0, bl + 0.04, bl + 0.54, 1e9], [0, 0, 2.0, 2.0]))[:, None]

    # =================================================== SFX
    sfx = np.zeros((N, 2))
    gdb = lambda c: float(db(c.get("gain_db", 0.0)))
    wp = [(5200, 1), (6400, -1), (7200, 1), (5600, -1), (7600, 1)]
    for i, c in enumerate(by["corte"]):
        tc = c["t"]
        g = gdb(c)
        sig, pk = whoosh(0.34, 0.26, 260, wp[i % 5][0], wp[i % 5][1], seed=40 + 3 * i)
        add(sfx, sig, tc - pk, 0.90 * g)
        add(sfx, thump(0.22, 105, 66, 0.07), tc, 0.40 * g)
        tk = int(0.010 * SR)
        add(sfx, hp(noise(tk, 70 + i), 3000) * np.exp(-tarr(tk) / 0.003), tc, 0.5 * g)
        if c.get("glitch", i % 2 == 1):
            add(sfx, glitch(77 + 2 * (i - 1) if i >= 1 else 75), tc, 0.34 * g, pan=(-0.2 if (i // 2) % 2 == 0 else 0.2))
    for i, c in enumerate(by["pressao"]):
        g = gdb(c)
        add(sfx, thump(0.30, 125, 62, 0.10), c["t"], 0.62 * g)
        tk = int(0.030 * SR)
        add(sfx, hp(noise(tk, 130 + i), 1200) * np.exp(-tarr(tk) / 0.008), c["t"], 0.22 * g)
    for i, c in enumerate(by["relevo"]):
        g = gdb(c)
        br0, rg0 = MAT_SEQ[i % len(MAT_SEQ)]
        br, rg = float(c.get("brilho", br0)), float(c.get("ring", rg0))
        chk = metal_chk(br, 60 + i, rg)
        add(sfx, chk, c["t"], 0.95 * g, pan=(-0.12 if i % 2 else 0.12))
        add(sfx, reverb(to_stereo(chk, 0), 0.35, 200 + i, 7000)[:int(0.7 * SR)], c["t"], 0.10 * g)
        add(sfx, thump(0.20, 100, 64, 0.06), c["t"], 0.30 * g)

    rs = None
    if by["riser"]:
        c = by["riser"][0]
        rs_t0 = T(Rn - 16) if (c.get("auto_compasso") and Rn is not None) else snap(c["t"])
        rs_end = (gap0 - 0.006) if gap0 is not None else float(c.get("fim", rs_t0 + 2.0))
        rs_dur = rs_end - rs_t0
        if rs_dur > 0.3:
            nz = np.stack([sweep_noise(rs_dur, 220, 11000, 1.7, 301), sweep_noise(rs_dur, 220, 11000, 1.7, 302)], 1)
            rt = np.linspace(0, 1, len(nz))[:, None]
            riser = nz * (rt ** 1.9)
            tt = tarr(len(nz))
            f = 220 * fq * (8.0 ** (tt / rs_dur))
            tone = sg.sawtooth(2 * np.pi * np.cumsum(f) / SR) * 0.5
            tone = (lp(tone, 900, 2) * (1 - rt[:, 0]) + lp(tone, 6000, 2) * rt[:, 0]) * (rt[:, 0] ** 2.2)
            riser += to_stereo(tone * 0.5, 0.0)
            cr = crash(1.1, 311, 1.0)[::-1]
            cr2 = hp(noise(len(cr), 312), 4500)[:len(cr)] * np.exp(-tarr(len(cr))[::-1] / 0.35)
            add(riser, np.stack([cr, cr2], 1) * 0.55, rs_dur - 1.1, 1.0)
            riser[-int(0.006 * SR):] *= np.linspace(1, 0, int(0.006 * SR))[:, None]
            add(sfx, riser, rs_t0, 0.50 * gdb(c))
            rs = (round(rs_t0, 3), round(rs_end, 3))

    if R is not None:
        rv = np.zeros((int(3.0 * SR), 2))
        add(rv, thump(1.8, 105, 46, 0.45, 1.0), 0, 0.85)
        bt = tarr(int(1.0 * SR))
        add(rv, lp(noise(len(bt), 400), 1200, 2) * np.exp(-bt / 0.22), 0, 0.55)
        add(rv, metal_chk(0.9, 410, 2.8, 0.5), 0, 0.85)
        ring = np.zeros(int(1.6 * SR))
        for fr, g_ in [(1318.5, 0.30), (1975.5, 0.20), (2637.0, 0.14)]:
            ring += bell(fr * fq, 1.6) * g_
        add(rv, ring, 0.0, 0.8)
        src = ring * 0.5 + crash(1.6, 421, 1.0)[: len(ring)] * 0.4
        add(rv, reverb(to_stereo(src, 0.0), 1.7, 55, 6500)[: len(rv)], 0, 0.55)
        sp = sweep_noise(0.7, 2500, 11500, 1.2, 440) * np.exp(-tarr(int(0.7 * SR)) / 0.25)
        add(rv, sp, 0.0, 0.35, pan=0.2)
        nxt = [a for a, _ in fala if R <= a <= R + 3.0]
        if nxt:
            rvt = np.arange(len(rv)) / SR + R
            rv = rv * db(np.interp(rvt, [0, nxt[0] - 0.24, nxt[0] + 0.03, 1e9], [0, 0, -26, -26]))[:, None]
        add(sfx, rv, R, gdb(by["revelacao"][0]))

    for c in by["ui"]:
        pt = tarr(int(0.09 * SR))
        pop = np.sin(2 * np.pi * np.cumsum(900 + 1400 * (pt / 0.09)) / SR) * np.exp(-pt / 0.03) * np.minimum(pt / 0.001, 1)
        pop = pop + bp(noise(len(pt), 500), 3500, 9000) * np.exp(-pt / 0.004) * 0.6
        add(sfx, pop, c["t"], 0.30 * gdb(c))
    for c in by["ding"]:
        d = np.zeros(int(1.8 * SR))
        for fr, o_, g_ in [(1568.0, 0.0, 1.0), (2093.0, 0.07, 0.50), (2637.0, 0.14, 0.34)]:
            b_ = bell(fr * fq, 1.4)
            a_ = int(o_ * SR)
            d[a_:a_ + len(b_)] += b_ * g_
        dd = to_stereo(d, 0.0)
        add(sfx, dd, c["t"], 0.10 * gdb(c))
        add(sfx, reverb(dd[: int(1.0 * SR)], 1.3, 66, 9000)[: int(2.0 * SR)], c["t"], 0.055 * gdb(c))
    for c in by["stinger"]:
        ts = snap(c["t"])
        s_ = np.zeros(int(1.2 * SR))
        for fr, g_ in [(880.0, 1.0), (1318.5, 0.6), (1760.0, 0.45)]:
            s_ += bell(fr * fq, 1.2) * g_
        sgs = to_stereo(s_, 0.0)
        g = gdb(c)
        add(sfx, sgs, ts, 0.10 * g)
        add(sfx, reverb(sgs[: int(0.6 * SR)], 1.5, 77, 7000)[: int(1.4 * SR)], ts, 0.06 * g)
        add(sfx, thump(0.5, 85, 55, 0.16), ts, 0.40 * g)
        add(sfx, crash(1.0, 600, 0.7), ts, 0.12 * g)

    derivados = {
        "downbeats_s": [round(T(bb), 3) for bb in bars],
        "compassos": [{"t": round(T(bb), 3), "papel": ro} for bb, ro in zip(bars, roles)],
        "revelacao_s": round(R, 3) if R is not None else None,
        "riser_s": rs,
        "rolo_caixa_s": round(T(Rn - 6), 3) if (R is not None and "riser" in roles) else None,
        "silencio_s": [round(gap0, 3), round(R, 3)] if gap0 is not None else None,
        "erro_grade_cortes_ms": [round(1000 * (c - T(idx(c))), 1) for c in cuts],
    }
    return music, sfx, derivados


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--cues", help="cues.json (novo ou legado V02)")
    ap.add_argument("--de-analise", help="gera os cues a partir do analise.json (analisar_video.py)")
    ap.add_argument("--revelacao", type=float, help="(com --de-analise) instante da revelacao/climax; cria riser antes")
    ap.add_argument("--relevo-delay", type=float, default=0.245, help="(com --de-analise) relevo = clique + X s; 0 desliga")
    ap.add_argument("--max-cliques", type=int, help="(com --de-analise) usa so os N cliques mais fortes")
    ap.add_argument("--cta-palavras", help="(com --de-analise) palavras que disparam pop de UI, separadas por virgula")
    ap.add_argument("--salvar-cues", help="grava os cues normalizados (formato novo) neste caminho")
    ap.add_argument("--so-cues", action="store_true", help="so gera/normaliza cues, nao sintetiza")
    ap.add_argument("--dur", type=float, help="duracao em s (default: duracao da voz, senao ultimo cue + 2 s)")
    ap.add_argument("--bpm", default=None, help="numero ou 'auto' (default: o do item info dos cues, senao auto)")
    ap.add_argument("--offset", type=float, default=None, help="offset da grade em s (default: info dos cues ou ajuste)")
    ap.add_argument("--voz", help="wav/mp4 com a voz (ducking + mix_teste)")
    ap.add_argument("--fala", action="append", default=[], help="trecho de fala 'ini-fim' (repetivel); soma aos dos cues")
    ap.add_argument("--preset", default="energia=media,tom=A", help="energia=baixa|media|alta, tom=A|C|D#... (A menor = original)")
    ap.add_argument("--saida", default=".", help="pasta de saida")
    ap.add_argument("--voz-ganho-db", type=float, default=-3.5)
    ap.add_argument("--musica-db", type=float, default=-2.0)
    ap.add_argument("--sfx-db", type=float, default=0.0)
    ap.add_argument("--bed-db", type=float, default=-2.7)
    ap.add_argument("--teto-db", type=float, default=-5.5, help="teto do limiter do bed (dBFS)")
    ap.add_argument("--softclip", type=float, default=0.30, help="limiar linear do soft-clip do bed")
    ap.add_argument("--duck-db", type=float, default=14.0, help="profundidade base do ducking sob a fala")
    ap.add_argument("--ts", help="tambem grava os cues resolvidos como modulo TS (export const CUES)")
    a = ap.parse_args()

    if a.de_analise:
        cues, dur_a = cues_de_analise(a.de_analise, a.revelacao, a.relevo_delay,
                                      a.cta_palavras.split(",") if a.cta_palavras else None, a.max_cliques)
        info = {}
        fala = sorted((c["t"], c["fim"]) for c in cues if c["tipo"] == "fala")
        cues = [c for c in cues if c["tipo"] != "fala"] + [c for c in cues if c["tipo"] == "fala"]
        cues.sort(key=lambda c: c["t"])
        a.dur = a.dur or dur_a
    elif a.cues:
        cues, info, fala = ler_cues(a.cues)
    else:
        ap.error("informe --cues ou --de-analise")
    for s in a.fala:
        x, y = s.split("-")
        fala.append((float(x), float(y)))
    fala = sorted(set(fala))
    merged = []
    for s in fala:  # junta trechos com intervalo < 0.63 s
        if merged and s[0] - merged[-1][1] < 0.63:
            merged[-1] = (merged[-1][0], max(merged[-1][1], s[1]))
        else:
            merged.append(s)
    fala = merged

    pre = dict(kv.split("=") for kv in a.preset.split(",") if "=" in kv)
    energia = pre.get("energia", "media")
    tom = pre.get("tom", "A").upper()
    if energia not in ENERGIA or tom not in NOTAS:
        ap.error("preset invalido")
    transp = (NOTAS[tom] - 9 + 6) % 12 - 6

    cuts = [c["t"] for c in cues if c["tipo"] == "corte"]
    rev = next((c["t"] for c in cues if c["tipo"] == "revelacao"), None)
    bpm_arg = a.bpm if a.bpm is not None else (info.get("bpm") or "auto")
    off_arg = a.offset if a.offset is not None else (info.get("grid_offset_s") if bpm_arg != "auto" and a.bpm is None else None)
    bpm, off, err = fit_grade(cuts, None if str(bpm_arg) == "auto" else float(bpm_arg), off_arg, rev)

    out_cues = [{"tipo": "info", "bpm": bpm, "grid_offset_s": off, "semicolcheia_s": round(60 / bpm / 4, 6),
                 "fala": [[round(x, 3), round(y, 3)] for x, y in fala], "preset": a.preset}] + \
               [c for c in cues if c["tipo"] != "fala"]
    if a.salvar_cues:
        json.dump(out_cues, open(a.salvar_cues, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    if a.so_cues:
        print(json.dumps({"cues": len(cues), "bpm": bpm, "offset": off, "erro_max_ms": round(err * 1000, 1),
                          "tipos": {k: sum(c["tipo"] == k for c in cues) for k in TIPOS}, "fala": fala}, ensure_ascii=False))
        return

    voz = load_audio(a.voz) if a.voz else None
    dur = a.dur or (len(voz) / SR if voz is not None else max(c["t"] for c in cues) + 2.0)
    N = int(round(dur * SR))
    music, sfx, der = build(cues, fala, dur, bpm, off, voz, energia, transp, a.duck_db)
    music = hp(music, 38, 4) * db(a.musica_db)
    sfx = hp(sfx, 38, 4) * db(a.sfx_db)
    prem = (music + sfx) * db(a.bed_db)
    c_lin = float(db(a.teto_db))
    bed = softclip(prem, a.softclip, c_lin * 0.985)
    sc_gain = np.where(np.abs(prem) > 1e-9, np.abs(bed) / (np.abs(prem) + 1e-12), 1.0)
    bed, lg = limiter(bed, a.teto_db)
    bed = fade_edges(bed)
    ratio = np.clip(sc_gain.mean(1), 0, 1.0) * lg
    music_out = fade_edges(music * db(a.bed_db) * ratio[:, None])
    sfx_out = fade_edges(sfx * db(a.bed_db) * ratio[:, None])
    os.makedirs(a.saida, exist_ok=True)
    P = lambda n: os.path.join(a.saida, n)
    for name, arr in (("bed", bed), ("music", music_out), ("sfx", sfx_out)):
        sf.write(P(f"{name}.wav"), np.clip(arr, -1, 1), SR, subtype="PCM_16")
    res = {"bpm": bpm, "offset": off, "erro_grade_max_ms": round(err * 1000, 1), "dur": round(dur, 3),
           "limiter_gr_max_db": round(float(-20 * np.log10(lg.min())), 1)}
    Ib, tpb = lufs(P("bed.wav"))
    res.update(bed_lufs=Ib, bed_tp=tpb)
    if voz is not None:
        v = voz[:N]
        v = np.pad(v, ((0, N - len(v)), (0, 0)))
        mix = v * db(a.voz_ganho_db) + bed
        sf.write(P("mix_teste.wav"), np.clip(mix, -1, 1), SR, subtype="PCM_24")
        Im, tpm = lufs(P("mix_teste.wav"))
        res.update(mix_lufs=Im, mix_tp=tpm, voz_ganho_db=a.voz_ganho_db,
                   voz_volume_remotion=round(float(db(a.voz_ganho_db)), 3))
    out_cues[0].update(der)
    out_cues[0]["mix"] = {k: res.get(k) for k in ("bed_lufs", "bed_tp", "mix_lufs", "mix_tp", "voz_volume_remotion")}
    json.dump(out_cues, open(P("cues_resolvidos.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    if a.ts:
        with open(a.ts, "w", encoding="utf-8") as fh:
            fh.write("// gerado por scripts/audio_trilha_sfx.py — nao editar a mao\nimport type { RawCue } from \"./cues\";\n\n")
            fh.write("export const CUES: RawCue[] = " + json.dumps(out_cues, ensure_ascii=False, indent=1) + ";\n")
    res["compassos"] = "".join(c["papel"][0] for c in der["compassos"])
    res["erro_grade_cortes_ms"] = der["erro_grade_cortes_ms"]
    print(json.dumps(res, ensure_ascii=False))


if __name__ == "__main__":
    main()
