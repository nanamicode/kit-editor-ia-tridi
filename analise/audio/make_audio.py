# -*- coding: utf-8 -*-
"""
Sound design sintetizado (numpy/scipy) para o criativo de carimbos.
Gera: projeto/public/audio/{bed,sfx,music}.wav, projeto/src/data/cues.json,
      analise/audio/mix_teste.wav (voz original * VOZ_GAIN_DB + bed).
Nenhum sample de terceiros. Tudo derivado de osciladores/ruido.

Grade musical: 108 BPM, semicolcheia g = 60/108/4 = 0.138889 s, indice n -> t = OFF + n*g (OFF=0.043).
Cortes caem em n = 9, 20, 30, 40, 49 (erro <= 15 ms); revelacao em n = 56 (7.821 s).
Downbeats em n = 8, 24, 40, 56, 72 (1.154, 3.376, 5.599, 7.821, 10.043 s).
"""
import json, os, subprocess, sys, re
import numpy as np
import soundfile as sf
from scipy import signal as sg
from scipy.ndimage import minimum_filter1d

WS = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_AUDIO = os.path.join(WS, "projeto", "public", "audio")
OUT_CUES = os.path.join(WS, "projeto", "src", "data", "cues.json")
ORIG = os.path.join(WS, "analise", "audio", "tmp", "voz_orig.wav")
MIXTEST = os.path.join(WS, "analise", "audio", "mix_teste.wav")
os.makedirs(OUT_AUDIO, exist_ok=True)

SR = 48000
DUR = 12.074
N = int(round(DUR * SR))
BPM = 108.0
G = 60.0 / BPM / 4.0
OFF = 0.043

# parametros de mix (ajustados por medicao)
MUSIC_GAIN_DB = float(os.environ.get("MUSIC_GAIN_DB", -2.0))
SFX_GAIN_DB = float(os.environ.get("SFX_GAIN_DB", 0.0))
BED_GAIN_DB = float(os.environ.get("BED_GAIN_DB", -2.7))
VOZ_GAIN_DB = float(os.environ.get("VOZ_GAIN_DB", -3.5))
CEIL_DB = float(os.environ.get("CEIL_DB", -5.5))


def T(n):  # tempo do indice de semicolcheia
    return OFF + n * G


def db(x):
    return 10 ** (x / 20.0)


def tarr(n):
    return np.arange(n) / SR


def mid(m):
    return 440.0 * 2 ** ((m - 69) / 12.0)


# ---------------------------------------------------------------- filtros
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


# ---------------------------------------------------------------- mix helpers
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
    t = tarr(n)
    ir = noise(n, seed) * np.exp(-t * 6.91 / rt)
    ir = lp(ir, damp, 1)
    ir = np.concatenate([np.zeros(int(pre * SR)), ir])
    return ir / np.sqrt(np.sum(ir ** 2))


def reverb(x, rt=1.4, seed=11, damp=5500, tail=True):
    """x (n,2) -> wet (n+tail,2)."""
    irL, irR = make_ir(rt, seed, damp), make_ir(rt, seed + 100, damp)
    n = len(x) + (len(irL) if tail else 0)
    l = sg.fftconvolve(x[:, 0], irL)[:n]
    r = sg.fftconvolve(x[:, 1], irR)[:n]
    out = np.zeros((n, 2))
    out[:len(l), 0] = l
    out[:len(r), 1] = r
    return out


def sweep_noise(dur, f0, f1, width=1.2, seed=0):
    """ruido filtrado por banda cujo centro varia exponencialmente f0->f1 (STFT)."""
    n = int(dur * SR)
    x = noise(n, seed)
    nper, hop = 2048, 512
    f, tt, Z = sg.stft(x, SR, nperseg=nper, noverlap=nper - hop)
    prog = np.clip(tt / dur, 0, 1)
    fc = f0 * (f1 / f0) ** prog
    d = (np.log2(f[:, None] + 1e-9) - np.log2(fc[None, :])) / (width / 2.355)
    _, y = sg.istft(Z * np.exp(-0.5 * d ** 2), SR, nperseg=nper, noverlap=nper - hop)
    y = y[:n]
    if len(y) < n:
        y = np.pad(y, (0, n - len(y)))
    return norm(y)


# ---------------------------------------------------------------- instrumentos
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
    cutoff = 220 + 900 * np.exp(-t / 0.09)
    # filtro com cutoff variavel: mistura de dois LP fixos
    a, b = lp(saw, 240, 2), lp(saw, 1100, 2)
    w = np.exp(-t / 0.09)
    f = a * (1 - w) + b * w
    sub = np.sin(2 * np.pi * freq * t) + 0.18 * np.sin(2 * np.pi * freq / 2 * t)
    y = np.tanh((f * 1.0 + sub * 0.7) * 1.4 * grit)
    env = np.minimum(t / 0.006, 1.0) * np.where(t < dur, 1.0, np.exp(-(t - dur) / 0.02))
    return y * env


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
    """click metalico curto: parciais inarmonicos + estalo de ruido."""
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
    mono = np.concatenate([up, down])
    mono = norm(mono)
    a = np.linspace(0.0, np.pi / 2, len(mono))
    if pan_dir < 0:
        a = a[::-1]
    # largura: ruido decorrelacionado + pan
    wide = np.concatenate([sweep_noise(pre, f_lo, f_hi, width, seed + 7) * ut ** 2.2,
                           sweep_noise(post, f_hi * 0.8, f_lo * 2.2, width, seed + 8) * np.exp(-dt / 0.085)])
    wide = norm(wide)
    L = mono * np.cos(a) * 0.75 + wide * 0.45
    R = mono * np.sin(a) * 0.75 + wide[::1] * 0.45 * np.cos(a * 2)
    return np.stack([L, R], 1), len(up) / SR  # (sig, instante do pico dentro do sinal)


def glitch(seed=77, grains=(1800, 900, 2700, 450, 3600, 1350), g_ms=14):
    gl = int(g_ms / 1000 * SR)
    out = []
    rng = np.random.default_rng(seed)
    for i, fr in enumerate(grains):
        t = tarr(gl)
        sq = np.sign(np.sin(2 * np.pi * fr * t)) * 0.6 + bp(noise(gl, seed + i), 1500, 9000) * 0.5
        sq = np.round(sq * 6) / 6.0  # bitcrush
        sq *= np.hanning(gl) ** 0.4
        out.append(sq)
        out.append(np.zeros(int(rng.uniform(0.002, 0.007) * SR)))
    y = np.concatenate(out)
    return y / np.max(np.abs(y))


def bell(f, dur=1.4, bright=1.0, seed=90):
    t = tarr(int(dur * SR))
    y = np.zeros(len(t))
    for ratio, tau, a in [(1.0, 0.55, 1.0), (2.76, 0.28, 0.5), (5.40, 0.16, 0.28), (8.93, 0.09, 0.16), (2.0, 0.40, 0.35)]:
        y += a * np.sin(2 * np.pi * f * ratio * t) * np.exp(-t / tau * 1.0)
    env = np.minimum(t / 0.002, 1)
    return y * env




# ---------------------------------------------------------------- composicao
CUTS = [1.293, 2.836, 4.213, 5.589, 6.840]
# cliques mecanicos reais medidos no audio original: (pressao, relevo) por clipe
T1 = [0.355, 1.525, 3.235, 4.485, 5.945, 7.240]
T2 = [0.600, 1.770, 3.480, 4.730, 6.190, 7.480]
MAT = [  # (brilho do chk, ring, nome)
    (0.85, 0.8, "envelope azul"),
    (1.00, 1.0, "adesivo"),
    (0.80, 0.6, "guardanapo"),
    (1.25, 1.7, "selo dourado"),
    (0.95, 0.9, "envelope verde-agua"),
    (1.05, 1.0, "cartao"),
]
REVEAL = T(56)          # 7.8208
GAP0 = REVEAL - 0.105   # silencio curto antes do impacto
CTA_T, DING_T, STING_T = 9.98, 10.22, T(83)


def curve_fn(t):
    def curve(points):
        xs, ys = zip(*points)
        return db(np.interp(t, xs, ys))
    return curve


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
    """joelho suave: linear ate thr, assintota em c (tanh)."""
    a = np.abs(x)
    k = c - thr
    y = np.where(a <= thr, a, thr + k * np.tanh((a - thr) / k))
    return np.sign(x) * y


def limiter(x, ceil_db=CEIL_DB, look=0.004, rel=0.09):
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


def build():
    t = tarr(N)
    curve = curve_fn(t)
    drums = np.zeros((N, 2))
    kick_times = []
    kk, sn, cl, hc, ho = kick(), snare(), clap(), hat(False), hat(True)

    def K(n, g=1.0):
        add(drums, kk, T(n), 0.80 * g)
        kick_times.append(T(n))

    def S(n, g=1.0):
        add(drums, sn, T(n), 0.70 * g, pan=-0.05)
        add(drums, cl, T(n), 0.70 * g, pan=0.05)

    def H(n, v=1.0, open_=False):
        add(drums, ho if open_ else hc, T(n), 0.46 * v, pan=0.25 if (int(n) % 2) else -0.2)

    # intro (n 0..7): pulso leve
    K(0, 1.0); K(4, 0.85); S(0, 0.55)
    for n in range(8):
        H(n, 0.25 + 0.05 * n * (1 if n % 2 == 0 else 0.6))
    # compasso 1 (8..23)
    for n in (8, 12, 16, 20):
        K(n, 0.95)
    K(18, 0.45); K(23, 0.5)
    S(12, 0.8); S(20, 1.0)                    # caixa+palma coincide com corte 2
    for n in range(8, 24):
        H(n, [0.9, 0.38, 0.65, 0.38][n % 4] * 0.85)
    for n in (10, 14, 18, 22):
        H(n, 0.55, True)
    # compasso 2 (24..39)
    for n in (24, 28, 32, 36):
        K(n, 1.0)
    K(30, 0.8); K(35, 0.45)                   # bump no corte 3
    S(28); S(36)
    for n in range(24, 40):
        H(n, [1.0, 0.4, 0.7, 0.4][n % 4])
    for n in (26, 30, 34, 38):
        H(n, 0.75, True)
    add(drums, crash(1.0, 33, 0.6), T(24), 0.30)
    # compasso 3 (40..55): riser
    for n in (40, 44, 48, 52):
        K(n, 1.0)
    K(46, 0.55)
    S(44)
    add(drums, crash(1.3, 35, 0.8), T(40), 0.42)
    for n in range(40, 55):
        H(n, [1.0, 0.45, 0.75, 0.45][n % 4] * (1.0 + 0.012 * (n - 40)))
    for n in (42, 46):
        H(n, 0.8, True)
    roll = [50, 52, 53, 54, 54.5, 55.0, 55.25]
    for i, n in enumerate(roll):
        add(drums, sn, T(n), 0.30 + 0.30 * i / len(roll), pan=(-0.1 if i % 2 else 0.1))
    # compasso 4 (56..71): pos-revelacao
    for n in (60, 64, 68):
        K(n, 1.0)
    K(58, 0.6)
    S(60, 0.55); S(68, 0.5)
    for n in range(57, 72):
        H(n, [1.0, 0.4, 0.7, 0.4][n % 4] * 0.9)
    for n in (58, 62, 66, 70):
        H(n, 0.7, True)
    # compasso 5 (72..)
    for n in (72, 76, 80, 84):
        K(n, 1.0)
    S(76, 0.5); S(84, 0.8)
    for n in range(72, 88):
        H(n, [1.0, 0.4, 0.7, 0.4][n % 4] * 0.9)
    for n in (74, 78, 82, 86):
        H(n, 0.7, True)
    add(drums, crash(1.0, 36, 0.6), T(72), 0.28)

    # ---- harmonia (A menor)
    chords = [
        (-8, 8, 45, [57, 60, 64]), (8, 24, 45, [57, 60, 64]), (24, 40, 41, [53, 57, 60]),
        (40, 48, 43, [55, 59, 62]), (48, 56, 40, [52, 56, 59]), (56, 64, 41, [53, 57, 60]),
        (64, 72, 43, [55, 59, 62]), (72, 80, 45, [57, 60, 64]), (80, 88, 41, [53, 57, 60]),
    ]
    bass_pat = {
        "sparse": [(0, 4, 0), (6, 2, 0), (8, 4, 0), (14, 2, 12)],
        "mid": [(0, 3, 0), (3, 1, 0), (6, 2, 12), (8, 3, 0), (11, 2, 0), (14, 2, 12)],
        "dense": [(i, 1, 0 if i % 4 != 3 else 12) for i in range(16)],
    }
    bar_style = {8: "sparse", 24: "mid", 40: "dense", 56: "mid", 72: "mid"}
    bass = np.zeros((N, 2)); pad = np.zeros((N, 2)); arp = np.zeros((N, 2))
    for (a, b, bm, ch) in chords:
        for j, m in enumerate(ch + [ch[0] + 12]):
            add(pad, saw_pad_note(m, (b - a) * G + 0.05, 100 + j + a), T(a), 0.55 if a >= 0 else 0.4)

    def chord_at(n0):
        for c in chords:
            if c[0] <= n0 < c[1]:
                return c
        return chords[-1]

    for bar0 in (8, 24, 40, 56, 72):
        for (st, ln, oc) in bass_pat[bar_style[bar0]]:
            n0 = bar0 + st
            add(bass, bass_note(mid(chord_at(n0)[2] + oc), ln * G * 0.92), T(n0), 0.50)
    add(bass, bass_note(mid(45), 4 * G * 0.92), T(0), 0.45)
    add(bass, bass_note(mid(45), 2 * G * 0.92), T(6), 0.45)
    arp_pat = [0, None, 1, None, 2, None, 1, 2, 0, None, 1, None, 2, 3, 4, 5]
    for bar0 in (8, 24, 40, 56, 72):
        for i, v in enumerate(arp_pat):
            if v is None:
                continue
            n0 = bar0 + i
            ch = chord_at(n0)[3]
            add(arp, pluck(ch[v % 3] + (24 if v >= 3 else 12)), T(n0), 0.75, pan=(-0.5 if i % 2 else 0.5))
    dl = int(3 * G * SR)
    echo = np.zeros_like(arp)
    for k, (gk, sw) in enumerate([(0.38, 1), (0.20, -1), (0.10, 1)], start=1):
        sh = np.roll(arp, dl * k, axis=0); sh[:dl * k] = 0
        echo += (sh[:, ::-1] if sw < 0 else sh) * gk
    arp = arp + echo

    pump = np.ones(N)
    for tk in kick_times:
        i = int(tk * SR); seg = min(N - i, int(0.45 * SR))
        if seg > 0:
            pump[i:i + seg] = np.minimum(pump[i:i + seg], 1 - 0.62 * np.exp(-np.arange(seg) / SR / 0.105))

    pad_gain = curve([(0, -14), (1.154, -10), (3.376, -7), (5.599, -5), (7.70, 1.5), (7.83, -3), (8.0, -4)])
    arp_gain = curve([(0, -80), (1.10, -80), (1.154, -16), (3.30, -12), (3.376, -9), (5.599, -6), (7.70, -3), (7.83, -5)])
    bass_gain = curve([(0, -12), (1.154, -2), (5.599, 0), (7.70, 1)])
    drum_gain = curve([(0, -3), (1.154, -2.5), (3.376, -1.5), (5.599, 0), (7.70, 1)])
    padL, padH = lp(pad, 500, 2), lp(pad, 5200, 2)
    ow = np.clip((t - 1.0) / 6.7, 0, 1) ** 1.2
    pad_f = (padL * (1 - ow[:, None]) + padH * ow[:, None]) * pad_gain[:, None] * 1.1
    harm = (bass * bass_gain[:, None] + pad_f + arp * arp_gain[:, None]) * pump[:, None]
    music = drums * drum_gain[:, None] + harm * 0.9
    # abaixa a musica brevemente nos cortes / relevos / revelacao (deixa os SFX respirarem)
    evd = np.ones(N)
    for tc, dep, tau in [(c, 0.40, 0.14) for c in CUTS] + [(c, 0.30, 0.10) for c in T2] + [(REVEAL, 0.5, 0.30)]:
        i = int(tc * SR)
        seg = min(N - i, int(0.8 * SR))
        evd[i:i + seg] = np.minimum(evd[i:i + seg], 1 - dep * np.exp(-np.arange(seg) / SR / tau))
    for c in CUTS:
        a_, b_ = int((c - 0.25) * SR), int(c * SR)
        evd[a_:b_] *= np.linspace(1.0, 0.82, b_ - a_)
    music = music * evd[:, None]

    # ---- gap de silencio antes do impacto (musica)
    gap = np.ones(N)
    f0 = int((GAP0 - 0.006) * SR); f1 = int(GAP0 * SR)
    g1 = int((REVEAL - 0.004) * SR); g2 = int(REVEAL * SR)
    gap[f0:f1] = np.linspace(1, 0, f1 - f0)
    gap[f1:g1] = 0
    gap[g1:g2] = np.linspace(0, 1, g2 - g1)
    music = music * gap[:, None]

    # ---- duck da musica sob a fala (+ sidechain real pela envoltoria da voz)
    x, _ = sf.read(ORIG, dtype="float32")
    vm = np.abs(x).max(1).astype(np.float64)
    from scipy.ndimage import uniform_filter1d
    env = np.sqrt(np.maximum(uniform_filter1d(vm ** 2, int(0.03 * SR)), 0))
    env[t < 8.0] = 0
    key = np.clip((20 * np.log10(env + 1e-9) + 38) / 14, 0, 1)
    key_s = one_pole_asym(key, 0.012, 0.16)
    base_db = np.interp(t, [0, 8.08, 8.22, 11.46, 11.95, 99], [0, 0, -14, -14, 0, 0])
    duck_db = base_db - 5.0 * key_s
    duck = db(duck_db)
    scoop = music - 0.5 * bp(music, 250, 3800)
    w = np.clip(-base_db / 14.0, 0, 1)[:, None]
    music = (music * (1 - 0.65 * w) + scoop * 0.65 * w) * duck[:, None]
    music_swell = db(np.interp(t, [0, 11.50, 12.0, 99], [0, 0, 2.0, 2.0]))
    music *= music_swell[:, None]

    # =================================================== SFX
    sfx = np.zeros((N, 2))
    cues = []

    # whoosh + hit em cada corte
    wp = [(5200, 1), (6400, -1), (7200, 1), (5600, -1), (7600, 1)]
    for i, tc in enumerate(CUTS):
        sig, pk = whoosh(0.34, 0.26, 260, wp[i][0], wp[i][1], seed=40 + 3 * i)
        add(sfx, sig, tc - pk, 0.90)
        add(sfx, thump(0.22, 105, 66, 0.07), tc, 0.40)
        tk = int(0.010 * SR)
        add(sfx, hp(noise(tk, 70 + i), 3000) * np.exp(-tarr(tk) / 0.003), tc, 0.5, pan=0.0)
    # glitch curto nos cortes 2 e 4 (indices 1 e 3)
    for i, seed in ((1, 77), (3, 81)):
        add(sfx, glitch(seed), CUTS[i], 0.34, pan=(-0.2 if i == 1 else 0.2))

    # carimbos: pressao (thump grave) + relevo (chk metalico + thump curto)
    for i in range(6):
        br, rg, _ = MAT[i]
        add(sfx, thump(0.30, 125, 62, 0.10), T1[i], 0.62)
        tk = int(0.030 * SR)
        add(sfx, hp(noise(tk, 130 + i), 1200) * np.exp(-tarr(tk) / 0.008), T1[i], 0.22)
        chk = metal_chk(br, 60 + i, rg)
        add(sfx, chk, T2[i], 0.95, pan=(-0.12 if i % 2 else 0.12))
        add(sfx, reverb(to_stereo(chk, 0), 0.35, 200 + i, 7000)[:int(0.7 * SR)], T2[i], 0.10)
        add(sfx, thump(0.20, 100, 64, 0.06), T2[i], 0.30)

    # riser (compasso 3) ate o silencio
    rs_t0 = T(40)
    rs_dur = GAP0 - 0.006 - rs_t0
    nz = np.stack([sweep_noise(rs_dur, 220, 11000, 1.7, 301), sweep_noise(rs_dur, 220, 11000, 1.7, 302)], 1)
    rt = np.linspace(0, 1, len(nz))[:, None]
    riser = nz * (rt ** 1.9)
    tt = tarr(len(nz))
    f = 220 * (8.0 ** (tt / rs_dur))                  # 220 -> 1760 Hz
    tone = sg.sawtooth(2 * np.pi * np.cumsum(f) / SR) * 0.5
    tone = (lp(tone, 900, 2) * (1 - rt[:, 0]) + lp(tone, 6000, 2) * rt[:, 0]) * (rt[:, 0] ** 2.2)
    riser += to_stereo(tone * 0.5, 0.0)
    cr = crash(1.1, 311, 1.0)[::-1]
    cr2 = hp(noise(len(cr), 312), 4500)[:len(cr)] * np.exp(-tarr(len(cr))[::-1] / 0.35)
    rev_cr = np.stack([cr, cr2], 1)
    add(riser, rev_cr * 0.55, rs_dur - 1.1, 1.0)
    riser[-int(0.006 * SR):] *= np.linspace(1, 0, int(0.006 * SR))[:, None]
    add(sfx, riser, rs_t0, 0.50)

    # revelacao do selo (impacto grave) - com fade sob a fala
    rv = np.zeros((int(3.0 * SR), 2))
    add(rv, thump(1.8, 105, 46, 0.45, 1.0), 0, 0.85)
    bt = tarr(int(1.0 * SR))
    body = lp(noise(len(bt), 400), 1200, 2) * np.exp(-bt / 0.22)
    add(rv, body, 0, 0.55)
    add(rv, metal_chk(0.9, 410, 2.8, 0.5), 0, 0.85)
    ring = np.zeros(int(1.6 * SR))
    for fr, g_ in [(1318.5, 0.30), (1975.5, 0.20), (2637.0, 0.14)]:
        ring += bell(fr, 1.6) * g_
    add(rv, ring, 0.0, 0.8, pan=0.0)
    src = ring * 0.5 + crash(1.6, 421, 1.0)[: len(ring)] * 0.4
    wet = reverb(to_stereo(src, 0.0), 1.7, 55, 6500)
    add(rv, wet[: len(rv)], 0, 0.55)
    sp = sweep_noise(0.7, 2500, 11500, 1.2, 440) * np.exp(-tarr(int(0.7 * SR)) / 0.25)
    add(rv, sp, 0.0, 0.35, pan=0.2)
    rvt = np.arange(len(rv)) / SR + REVEAL
    rv_duck = db(np.interp(rvt, [0, 7.98, 8.25, 99], [0, 0, -26, -26]))
    rv = rv * rv_duck[:, None]
    add(sfx, rv, REVEAL, 1.0)

    # CTA: pop de UI + ding brilhante (nivel baixo para nao mascarar a fala)
    pt = tarr(int(0.09 * SR))
    pop = np.sin(2 * np.pi * np.cumsum(900 + 1400 * (pt / 0.09)) / SR) * np.exp(-pt / 0.03) * np.minimum(pt / 0.001, 1)
    pop = pop + bp(noise(len(pt), 500), 3500, 9000) * np.exp(-pt / 0.004) * 0.6
    add(sfx, pop, CTA_T, 0.30)
    d = np.zeros(int(1.8 * SR))
    for k, (fr, off, g_) in enumerate([(1568.0, 0.0, 1.0), (2093.0, 0.07, 0.50), (2637.0, 0.14, 0.34)]):
        b_ = bell(fr, 1.4)
        a_ = int(off * SR)
        d[a_:a_ + len(b_)] += b_ * g_
    dd = to_stereo(d, 0.0)
    dw = reverb(dd[: int(1.0 * SR)], 1.3, 66, 9000)
    add(sfx, dd, DING_T, 0.10)
    add(sfx, dw[: int(2.0 * SR)], DING_T, 0.055)

    # stinger final apos o "seu!"
    sg_ = np.zeros(int(1.2 * SR))
    for fr, g_ in [(880.0, 1.0), (1318.5, 0.6), (1760.0, 0.45)]:
        sg_ += bell(fr, 1.2) * g_
    sgs = to_stereo(sg_, 0.0)
    add(sfx, sgs, STING_T, 0.10)
    add(sfx, reverb(sgs[: int(0.6 * SR)], 1.5, 77, 7000)[: int(1.4 * SR)], STING_T, 0.06)
    add(sfx, thump(0.5, 85, 55, 0.16), STING_T, 0.40)
    add(sfx, crash(1.0, 600, 0.7), STING_T, 0.12)

    # ---------- cues
    cues.append({"tipo": "info", "bpm": 108, "grid_offset_s": OFF, "semicolcheia_s": round(G, 6),
                 "downbeats_s": [round(T(n), 3) for n in (8, 24, 40, 56, 72)],
                 "nota": "t em segundos da composicao (= tempo do arquivo). Cortes caem em n=9,20,30,40,49 da grade de 16avos (erro <=15 ms). Impactos: o audio ORIGINAL do B-roll tem cliques mecanicos reais (medidos): 'pressao' = clack de maior forca e 'relevo' = ~245 ms depois, quando o relevo aparece; sincronizar punch-in/tremor ao 'relevo' (ou a 'pressao' para antecipar). Fala audivel comeca ~8.5 s (Whisper marca 8.28).", "mix_recomendado": "voz = audio original do criativo.mp4 com volume 0.668 (-3.5 dB, o original passa de 0 dBTP) + bed.wav volume 1.0; medido -14.1 LUFS, -1.5 dBTP"})
    for i, tc in enumerate(CUTS):
        extra = "+glitch" if i in (1, 3) else ""
        cues.append({"t": tc, "tipo": "corte", "nome": f"corte {i+1} -> clipe {i+2}: whoosh{extra} (pico no corte)"})
    for i in range(6):
        cues.append({"t": T1[i], "tipo": "impacto", "nome": f"pressao carimbo {i+1} ({MAT[i][2]}): pico de forca / clack grave", "clipe": i + 1})
        cues.append({"t": T2[i], "tipo": "impacto", "nome": f"relevo carimbo {i+1} ({MAT[i][2]}): relevo aparece / chk metalico", "clipe": i + 1})
    cues.append({"t": round(rs_t0, 3), "tipo": "riser", "nome": "riser comeca (ruido ascendente + tom 220->1760 Hz)"})
    cues.append({"t": round(T(50), 3), "tipo": "riser", "nome": "rolo de caixa acelera (8as -> 16as -> 32as)"})
    cues.append({"t": round(GAP0, 3), "tipo": "riser", "nome": "pico do riser + silencio seco de ~100 ms antes do impacto"})
    cues.append({"t": round(REVEAL, 3), "tipo": "revelacao", "nome": "impacto grave do selo / inicio do dissolve para a apresentadora"})
    cues.append({"t": CTA_T, "tipo": "cta", "nome": "pop de UI do botao SAIBA MAIS (palavra 'Saiba')"})
    cues.append({"t": DING_T, "tipo": "ding", "nome": "ding brilhante (palavra 'Mais')"})
    cues.append({"t": round(STING_T, 3), "tipo": "impacto", "nome": "stinger final apos 'seu!' (musica volta do duck)"})
    cues_sorted = [cues[0]] + sorted(cues[1:], key=lambda c: c["t"])
    return music, sfx, cues_sorted, key_s


def fade_edges(x):
    n_in = int(0.004 * SR)
    n_out = int(0.30 * SR)
    x[:n_in] *= np.linspace(0, 1, n_in)[:, None]
    x[-n_out:] *= np.linspace(1, 0, n_out)[:, None] ** 1.5
    return x


def lufs(path, start=None, dur=None):
    cmd = ["ffmpeg", "-hide_banner", "-nostats"]
    if start is not None:
        cmd += ["-ss", str(start)]
    if dur is not None:
        cmd += ["-t", str(dur)]
    cmd += ["-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"]
    r = subprocess.run(cmd, capture_output=True, text=True).stderr
    I = re.findall(r"I:\s+(-?[\d.]+) LUFS", r)[-1]
    tp = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", r)[-1]
    lra = re.findall(r"LRA:\s+(-?[\d.]+) LU", r)[-1]
    return float(I), float(tp), float(lra)


def main():
    if not os.path.exists(ORIG):
        os.makedirs(os.path.dirname(ORIG), exist_ok=True)
        src = os.path.join(WS, 'originais', 'criativo.mp4')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-vn', '-ar', '48000', '-ac', '2', '-c:a', 'pcm_f32le', ORIG], check=True)
    music, sfx, cues, key_s = build()
    music = hp(music, 38, 4)
    sfx = hp(sfx, 38, 4)
    m = music * db(MUSIC_GAIN_DB)
    s = sfx * db(SFX_GAIN_DB)
    SC_THR = float(os.environ.get("SC_THR", 0.30))
    c_lin = db(CEIL_DB)
    pre = (m + s) * db(BED_GAIN_DB)
    bed = softclip(pre, SC_THR, c_lin * 0.985)
    sc_gain = np.where(np.abs(pre) > 1e-9, np.abs(bed) / (np.abs(pre) + 1e-12), 1.0)
    bed, lg = limiter(bed)
    print('limiter: GR max %.1f dB, GR medio %.2f dB' % (-20 * np.log10(lg.min()), -20 * np.log10(lg).mean()))
    bed = fade_edges(bed)
    ratio = np.clip(sc_gain.mean(1), 0, 1.0) * lg
    music_out = fade_edges(m * db(BED_GAIN_DB) * ratio[:, None])
    sfx_out = fade_edges(s * db(BED_GAIN_DB) * ratio[:, None])
    for name, arr in (("bed", bed), ("music", music_out), ("sfx", sfx_out)):
        assert len(arr) == N
        sf.write(os.path.join(OUT_AUDIO, f"{name}.wav"), np.clip(arr, -1, 1), SR, subtype="PCM_16")
    x, _ = sf.read(ORIG, dtype="float32")
    mix = x * db(VOZ_GAIN_DB) + bed
    sf.write(MIXTEST, np.clip(mix, -1, 1), SR, subtype="PCM_24")
    Ib, tpb, _ = lufs(os.path.join(OUT_AUDIO, "bed.wav"))
    Im, tpm, lra = lufs(MIXTEST)
    print(f"BED  LUFS-I {Ib:6.1f}  TP {tpb:5.1f}")
    print(f"MIX  LUFS-I {Im:6.1f}  TP {tpm:5.1f}  LRA {lra:4.1f}   (voz {VOZ_GAIN_DB} dB)")
    print("mix peak (float) dBFS:", 20 * np.log10(np.abs(mix).max()))
    cues[0]["voz_gain_db"] = VOZ_GAIN_DB
    cues[0]["loudness_mix_lufs"] = Im
    cues[0]["true_peak_mix_dbtp"] = tpm
    with open(OUT_CUES, "w", encoding="utf-8") as fh:
        json.dump(cues, fh, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
