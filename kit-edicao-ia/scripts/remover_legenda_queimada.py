# -*- coding: utf-8 -*-
"""
remover_legenda_queimada.py — tira legenda QUEIMADA (texto gravado nos pixels) de um trecho de video.
Metodo: metodos/07-remover-legenda-queimada.md

Uso (rodar da raiz do kit ou de qualquer lugar; caminhos sao argumentos):
  # 1) preview barato: detecta faixa/cores, limpa 4 quadros e monta UMA folha para conferir
  python scripts/remover_legenda_queimada.py --video originais/x.mp4 --inicio 7.6 --fim 12.07 \
         --saida trabalho/limpo --preview
  # 2) trecho inteiro (usa a faixa achada no preview ou --faixa y0,y1)
  python scripts/remover_legenda_queimada.py --video originais/x.mp4 --inicio 7.6 --fim 12.07 \
         --saida trabalho/limpo [--faixa 820,980] [--processos 2]
  # entrada por pasta de quadros (ordem alfabetica): --quadros pasta/ --fps 23.976 --inicio 7.6

Saida em --saida: c0001.jpg.. (quadros limpos, mesma resolucao), quadros.json {firstFileTime,fps,count,w,h},
mascara_legenda.npz (mascara por quadro; o recorte_rvm.py usa para reparar o alfa sob a legenda),
_preview.jpg no modo --preview. Imprime um resumo JSON curto.

Camadas do preenchimento (de baixo para cima):
  1. interpolacao vertical coluna a coluna (preserva bordas verticais) + "morph" que segue a borda de
     braco/mao inclinados (DTW entre a faixa limpa de cima e a de baixo) + costura Poisson;
  2. clone temporal: quadros vizinhos alinhados por fluxo optico DIS, onde o pixel nao tinha legenda,
     com ganho/offset por canal e costura Poisson (o que estava ATRAS da legenda aparece em outro quadro);
  3. clone espacial (faixas acima/abaixo deslocadas) para textura de camisa/cabelo;
  4. grao casado ao ruido local (sem isso o remendo fica liso, "plastico").
Deps: numpy, opencv-python-headless; ffmpeg/ffprobe no PATH (entrada --video).
"""
import argparse, glob, json, os, shutil, subprocess, sys, tempfile, time

import cv2
import numpy as np

cv2.setNumThreads(2)

# ------------------------------------------------------------------------------------- IO -------
def probe_fps(video):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                          "stream=r_frame_rate", "-of", "csv=p=0", video], capture_output=True, text=True).stdout.strip()
    a, b = (out.split("/") + ["1"])[:2]
    return float(a) / float(b), out


def first_pts(video, t0, fps):
    """tempo real (s) do 1o quadro que o ffmpeg entrega com -ss t0 (pts >= t0)."""
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-read_intervals",
         "%.3f%%+%.3f" % (max(0, t0 - 1.0), 12.0), "-show_entries", "frame=pts_time", "-of", "csv=p=0", video],
        capture_output=True, text=True)
    ts = sorted(float(x.strip().strip(",")) for x in r.stdout.split() if x.strip().strip(",") not in ("", "N/A"))
    c = [t for t in ts if t >= t0 - 1e-4]  # o ffmpeg -ss descarta pts < t0
    return round(c[0], 4) if c else round(t0, 4)


def extract(video, t0, t1, dst):
    os.makedirs(dst, exist_ok=True)
    cmd = ["ffmpeg", "-v", "error", "-y", "-ss", "%.4f" % t0, "-i", video]
    if t1 is not None:
        cmd += ["-t", "%.4f" % (t1 - t0)]
    cmd += ["-map", "0:v:0", "-fps_mode", "passthrough", os.path.join(dst, "f%04d.png")]
    subprocess.run(cmd, check=True)
    return sorted(glob.glob(os.path.join(dst, "f*.png")))


def list_frames(d, pat):
    fs = sorted(glob.glob(os.path.join(d, pat)))
    if not fs:
        fs = sorted(glob.glob(os.path.join(d, "*.png")) + glob.glob(os.path.join(d, "*.jpg")))
    return fs


# ------------------------------------------------------------------------------- deteccao -------
def color_masks(bgr):
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    h = hsv[..., 0].astype(np.float32) * 2
    s = hsv[..., 1].astype(np.float32) / 255.
    v = hsv[..., 2].astype(np.float32)
    b, g, r = [bgr[..., k].astype(np.float32) for k in (0, 1, 2)]
    return {
        "branco": (s < 0.22) & (v > 110) & (np.abs(r - b) < 45),
        "amarelo": (h > 38) & (h < 70) & (s > 0.45) & (v > 90) & (r > b + 40) & (g > b + 40),
        "verde": (h > 85) & (h < 160) & (s > 0.5) & (v > 110),
        "ciano": (h > 170) & (h < 200) & (s > 0.45) & (v > 120),
        "rosa": ((h > 300) | (h < 10)) & (s > 0.45) & (v > 140) & (r > g + 60),
    }, v


def outlined(core, v, k=5):
    dark = (v < 70).astype(np.uint8)
    return core & (cv2.dilate(dark, np.ones((k, k), np.uint8)) > 0)


def auto_band(paths, H, contorno=True):
    """faixa (y0,y1) e cores da legenda, pelos quadros amostrados."""
    idx = list(range(0, len(paths), max(1, len(paths) // 24)))
    prof = np.zeros(H, np.float64); cnt = {}
    for i in idx:
        bgr = cv2.imread(paths[i]); cm, v = color_masks(bgr)
        for k, m in cm.items():
            mm = outlined(m, v) if contorno else m
            mm[: int(H * 0.04)] = False
            cnt[k] = cnt.get(k, 0) + int(mm.sum())
            # perfil por linha: so pixels com contorno escuro (o texto queimado tem stroke)
            prof += mm.sum(1)
    prof = np.convolve(prof, np.ones(9) / 9, mode="same")
    if prof.max() <= 0:
        return None, []
    y = int(np.argmax(prof)); thr = 0.18 * prof[y]
    y0 = y; y1 = y
    while y0 > 0 and prof[y0 - 1] > thr: y0 -= 1
    while y1 < H - 1 and prof[y1 + 1] > thr: y1 += 1
    tot = sum(cnt.values()) or 1
    cores = [k for k, c in sorted(cnt.items(), key=lambda kv: -kv[1]) if c / tot > 0.08]
    pad = 14
    return (max(0, y0 - pad), min(H, y1 + pad + 1)), cores


def detect_core(bgr, band, cores, contorno):
    """pixels de letra na faixa. Com contorno: so o que esta a ate ~meia espessura de traco de um pixel escuro
    (o recheio de uma letra contornada nunca fica longe do stroke; pele/parede/camisa encostadas ficam de fora)."""
    cm, v = color_masks(bgr)
    core = np.zeros(bgr.shape[:2], bool)
    for k in cores:
        core |= cm[k]
    reg = np.zeros_like(core); reg[band[0]:band[1]] = True
    core &= reg
    bh = max(20, band[1] - band[0] - 28)
    if contorno:
        r = max(7, int(0.13 * bh))
        dark = (v < 70).astype(np.uint8)
        core &= cv2.dilate(dark, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1))) > 0
    core = core.astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(core, connectivity=8)
    out = np.zeros_like(core); kept = 0; wsum = 0; small = []
    for k in range(1, n):
        ar = st[k, cv2.CC_STAT_AREA]; w = st[k, cv2.CC_STAT_WIDTH]; h = st[k, cv2.CC_STAT_HEIGHT]
        if ar < 25: continue
        if h < 0.25 * bh: small.append(k); continue    # ponto, acento, virgula: so se encostar numa letra
        if contorno and (w > 3.0 * bh or ar > 1.6 * bh * bh): continue   # bloco grande (parede, camisa)
        out[lab == k] = 1; kept += 1; wsum += w
    if kept and small:
        near = cv2.dilate(out, np.ones((bh // 2 * 2 + 1, bh // 2 * 2 + 1), np.uint8)) > 0
        for k in small:
            cx, cy = st[k, 0] + st[k, 2] // 2, st[k, 1] + st[k, 3] // 2
            if near[cy, cx]: out[lab == k] = 1
    # legenda = letras lado a lado (letras coladas viram 1 componente); 1 mancha solta nao e legenda
    return out if (kept >= 2 and wsum >= 1.2 * bh) else np.zeros_like(out)


def vote_masks(cores, voto):
    """agrupa quadros em trechos com a mesma legenda (IoU) e vota: mascara estavel, sem tremor por quadro."""
    N = len(cores); area = [int(c.sum()) for c in cores]
    K9 = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)); K15 = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
    has = [a > 400 for a in area]
    chunks = []; cur = None
    for i in range(N):
        if not has[i]: cur = None; continue
        if cur is not None:
            d = cv2.dilate(cores[i], K9); pd = cv2.dilate(cores[i - 1], K9)
            iou = (d & pd).sum() / max(1, (d | pd).sum())
            ja = abs(area[i] - area[i - 1]) / max(1, area[i - 1])
            if iou < 0.5 or (ja > 0.12 and iou < 0.85): cur = None
        if cur is None: cur = []; chunks.append(cur)
        cur.append(i)
    chunks = [c for c in chunks if len(c) >= 3]   # legenda dura mais que 2 quadros; o resto e falso positivo
    masks = [np.zeros_like(cores[0]) for _ in range(N)]
    for c in chunks:
        votes = sum(cores[i].astype(np.float32) for i in c) / len(c)
        cm = (votes >= voto).astype(np.uint8)
        n, lab, st, _ = cv2.connectedComponentsWithStats(cm, connectivity=8)
        o = np.zeros_like(cm)
        for k in range(1, n):
            if st[k, cv2.CC_STAT_AREA] >= 60: o[lab == k] = 1
        for i in c:
            masks[i] = o | (cores[i] & cv2.dilate(o, K15))
    return masks, [(c[0] + 1, c[-1] + 1) for c in chunks]


# ---------------------------------------------------------------------------- preenchimento -----
def _dtw(T, B, S=34, lam=5.0):
    W = len(T); K = 2 * S + 1; INF = 1e9
    C = np.full((W, K), INF, np.float32)
    for k in range(K):
        j = np.arange(W) + k - S; ok = (j >= 0) & (j < W)
        C[ok, k] = np.abs(T[ok] - B[j[ok]]).sum(1)
    D = np.full((W, K), INF, np.float32); bt = np.zeros((W, K), np.int8)
    D[0, S] = C[0, S]
    for i in range(W):
        if i > 0:
            diag = D[i - 1].copy(); up = np.full(K, INF, np.float32); up[:-1] = D[i - 1, 1:] + lam
            D[i] = np.minimum(diag, up); bt[i] = np.where(up < diag, 1, 0)
            D[i] += C[i]
        for k in range(1, K):  # B avanca sozinho (cadeia ao longo de k)
            v = D[i, k - 1] + lam + C[i, k]
            if v < D[i, k]: D[i, k] = v; bt[i, k] = 2
    i, k = W - 1, S; path = [(i, i)]
    while not (i == 0 and k == S) and len(path) < 4 * W:
        a = bt[i, k]
        if a == 0: i -= 1
        elif a == 1: i -= 1; k += 1
        else: k -= 1
        path.append((i, i + k - S))
    path.reverse()
    return np.array(path, np.float32)


def skin_mask(bgr):
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    return (hsv[..., 0] <= 24) & (hsv[..., 1] >= 35) & (hsv[..., 2] >= 70)


def morph_fill(img, Hm, margin=40, feather=24, rows=5):
    """Interpolacao que SEGUE a borda (braco/mao inclinados) onde ha pele encostando na faixa."""
    h, w = Hm.shape; rr = np.nonzero(Hm.any(1))[0]
    if len(rr) == 0: return None
    ya, yb = int(rr.min()), int(rr.max()) + 1
    if ya < 12 or yb > h - 12: return None
    st = skin_mask(img[ya - 1 - rows:ya - 1]).mean(0) > 0.6
    sb = skin_mask(img[yb + 1:yb + 1 + rows]).mean(0) > 0.6
    cols = np.nonzero(st | sb)[0]
    if len(cols) < 25: return None
    runs = []; a = cols[0]; p = cols[0]
    for c in cols[1:]:
        if c - p > 60: runs.append((a, p)); a = c
        p = c
    runs.append((a, p))
    v = cv2.cvtColor(np.vstack([img[ya - 1 - rows:ya - 1], img[yb + 1:yb + 1 + rows]]), cv2.COLOR_BGR2HSV)[..., 2]
    best = max(runs, key=lambda r_: float(v[:, r_[0]:r_[1] + 1].mean()) if r_[1] - r_[0] > 10 else -1)
    x0, x1 = max(0, best[0] - margin), min(w, best[1] + margin)
    sub = Hm[:, x0:x1]; r2 = np.nonzero(sub.any(1))[0]; c2 = np.nonzero(sub.any(0))[0]
    if len(r2) == 0: return None
    ya, yb = int(r2.min()), int(r2.max()) + 1
    x0, x1 = max(0, x0 + int(c2.min()) - 12), min(w, x0 + int(c2.max()) + 13)
    xa, xb = max(0, x0 - 50), min(w, x1 + 50)
    f = img.astype(np.float32)
    T = cv2.GaussianBlur(f[ya - 1 - rows:ya - 1, xa:xb].mean(0)[None], (0, 0), 1.2)[0]
    B = cv2.GaussianBlur(f[yb + 1:yb + 1 + rows, xa:xb].mean(0)[None], (0, 0), 1.2)[0]
    path = _dtw(T, B); ci = path[:, 0].astype(int); cj = path[:, 1].astype(int)
    Tc = ya - 1 - rows / 2.0; Bc = yb + 1 + (rows - 1) / 2.0
    xs = np.arange(xb - xa, dtype=np.float32); eps = np.arange(len(path), dtype=np.float32) * 1e-4
    out = np.zeros((yb - ya, xb - xa, 3), np.float32)
    for r_, y in enumerate(range(ya, yb)):
        t = (y - Tc) / (Bc - Tc); xm = (1 - t) * path[:, 0] + t * path[:, 1] + eps
        col = (1 - t) * T[ci] + t * B[cj]
        for c in range(3): out[r_, :, c] = np.interp(xs, xm, col[:, c])
    full = np.full((h, w, 3), np.nan, np.float32); full[ya:yb, xa:xb] = out
    m2 = np.zeros((h, w), np.float32); m2[ya:yb, x0:x1] = 1
    return full, cv2.GaussianBlur(m2, (0, 0), feather / 3.0)


def _center(m8):
    yy, xx = np.nonzero(m8)
    return (int((xx.min() + xx.max()) // 2), int((yy.min() + yy.max()) // 2))


def vfill(img, Hm, morph=True, rsig=45.0):
    """camada 1: interpolacao vertical (mediana das amostras) + morph de borda + Poisson."""
    out = img.astype(np.float32).copy(); h, w = Hm.shape
    topS = np.zeros((1, w, 3), np.uint8); botS = np.zeros((1, w, 3), np.uint8); has = np.zeros(w, bool); runs = []
    for x in np.nonzero(Hm.any(0))[0]:
        d = np.diff(np.concatenate([[0], (Hm[:, x] > 0).astype(np.int8), [0]]))
        for a, b in zip(np.nonzero(d == 1)[0], np.nonzero(d == -1)[0]):
            if a < 4 or b > h - 4: continue
            runs.append((x, a, b))
            if not has[x]:
                topS[0, x] = img[a - 4:a - 1, x].mean(0); botS[0, x] = img[b + 1:b + 4, x].mean(0); has[x] = True
    idx = np.nonzero(has)[0]
    if len(idx) == 0: return img.copy()
    for c in range(w):
        if not has[c]:
            j = idx[np.argmin(np.abs(idx - c))]; topS[0, c] = topS[0, j]; botS[0, c] = botS[0, j]
    topM = cv2.medianBlur(topS, 31).astype(np.float32)[0]; botM = cv2.medianBlur(botS, 31).astype(np.float32)[0]
    for x, a, b in runs:
        tt = ((np.arange(a, b) - a + 1) / (b - a + 1))[:, None]
        out[a:b, x] = topM[x] * (1 - tt) + botM[x] * tt
    sm = cv2.GaussianBlur(out, (0, 0), sigmaX=3.0, sigmaY=0.01)
    if morph:
        mf = morph_fill(img, Hm)
        if mf is not None:
            fm, w2 = mf; ok = ~np.isnan(fm[..., 0]); imf = img.astype(np.float32)
            fm = cv2.GaussianBlur(np.where(np.isnan(fm), imf, fm), (0, 0), sigmaX=1.5, sigmaY=0.01)
            if rsig > 0:  # erro de borda entre morph e pixels reais, difundido para dentro
                hole = (Hm > 0).astype(np.uint8)
                ringm = ((cv2.dilate(hole, np.ones((5, 5), np.uint8)) > 0) & (hole == 0)).astype(np.float32)
                num = cv2.GaussianBlur((imf - fm) * ringm[..., None], (0, 0), rsig); den = cv2.GaussianBlur(ringm, (0, 0), rsig)
                fm = fm + num / np.maximum(den, 1e-4)[..., None] * (den > 1e-3)[..., None]
            w3 = (w2 * ok)[..., None]; sm = sm * (1 - w3) + fm * w3
    res = img.copy(); m = Hm > 0; res[m] = np.clip(sm[m], 0, 255).astype(np.uint8)
    m8 = (Hm * 255).astype(np.uint8); m8[:3] = 0; m8[-3:] = 0; m8[:, :3] = 0; m8[:, -3:] = 0
    if m8.any():
        try: res = cv2.seamlessClone(res, img, m8, _center(m8), cv2.NORMAL_CLONE)
        except cv2.error: pass
    return res


def add_grain(img, Hm, seed, amount):
    if amount <= 0: return img
    f = img.astype(np.float32); res = f - cv2.GaussianBlur(f, (0, 0), 1.5)
    ring = (cv2.dilate(Hm, np.ones((41, 41), np.uint8)) > 0) & (Hm == 0)
    sd = np.clip(np.array([res[..., c][ring].std() for c in range(3)]) if ring.any() else np.ones(3), 0.5, 6.0) * amount
    n = cv2.GaussianBlur(np.random.RandomState(seed).randn(*img.shape).astype(np.float32), (0, 0), 0.7) * 1.6
    o = img.copy(); mm = Hm > 0; o[mm] = np.clip((f + n * sd)[mm], 0, 255).astype(np.uint8)
    return o


def hp(x): x = x.astype(np.float32); return x - cv2.GaussianBlur(x, (0, 0), 5)


def gradE(x):
    g = cv2.cvtColor(x, cv2.COLOR_BGR2GRAY).astype(np.float32)
    return cv2.GaussianBlur(np.sqrt(cv2.Sobel(g, cv2.CV_32F, 1, 0, ksize=3) ** 2 + cv2.Sobel(g, cv2.CV_32F, 0, 1, ksize=3) ** 2), (0, 0), 5)


# --- estado do worker (carregado uma vez por processo) ---
G = {}


def _init(cfg):
    G.update(cfg)
    z = np.load(cfg["mask_path"]); M = z["m"]; KD = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * cfg["rad"] + 1,) * 2)
    c0, c1 = cfg["crop"]
    G["HOLE"] = [cv2.dilate(M[i], KD)[c0:c1] for i in range(len(M))]
    G["cache"] = {}


def crop(i):
    c = G["cache"]
    if i not in c:
        if len(c) > 30: c.clear()
        c[i] = cv2.imread(G["paths"][i])[G["crop"][0]:G["crop"][1]]
    return c[i]


def process(t):
    HOLE = G["HOLE"]; N = len(HOLE); Hfull = HOLE[t]; tcf = crop(t); THR = G["thr"]
    if Hfull.sum() == 0: return tcf.copy(), {}
    hh, ww = Hfull.shape; ys, _ = np.nonzero(Hfull)
    R0 = max(0, ys.min() - 80); R1 = min(hh, ys.max() + 80)
    H = Hfull[R0:R1]; tc = tcf[R0:R1]; h = R1 - R0; w = ww; Hb = H > 0
    trf = add_grain(vfill(tcf, Hfull, G["morph"]), Hfull, t, G["grao"]); tr = trf[R0:R1]
    armz = np.zeros((h, w), bool)
    if G["morph"]:
        mf = morph_fill(tcf, Hfull)
        if mf is not None: armz = (((mf[1] * (~np.isnan(mf[0][..., 0]))) > 0.5) & (Hfull > 0))[R0:R1]
    srcs = []
    if G["espacial"]:  # faixas deslocadas acima/abaixo (textura de camisa/cabelo)
        hhole = int(ys.max() - ys.min() + 1); P = int(2 * hhole) + 20
        vt = (cv2.dilate(Hfull, np.ones((5, 5), np.uint8)) == 0).astype(np.uint8)
        tcp = cv2.copyMakeBorder(tcf, P, P, P, P, cv2.BORDER_CONSTANT, value=0)
        vtp = cv2.copyMakeBorder(vt, P, P, P, P, cv2.BORDER_CONSTANT, value=0)
        for f_ in (-1.6, -1.45, -1.3, -1.15, -1.0, -0.9, -0.78, 0.78, 0.9, 1.04):
            for dx in (0, -8, 8, -16, 16):
                y0 = P + R0 + int(f_ * hhole); x0 = P + dx
                if y0 < 0 or y0 + h > tcp.shape[0]: continue
                ws = tcp[y0:y0 + h, x0:x0 + w]; vw = vtp[y0:y0 + h, x0:x0 + w] > 0
                if vw[Hb].mean() >= 0.2: srcs.append(("s", 0, ws, vw))
    if G["vizinhos"] > 0:  # clone temporal com fluxo DIS
        cands = []
        for s in range(max(0, t - 45), min(N, t + 46)):
            if s == t: continue
            vs = cv2.dilate(HOLE[s], np.ones((7, 7), np.uint8)) == 0
            if (vs[R0:R1] & Hb).sum() / Hb.sum() > 0.3: cands.append((abs(s - t), s))
        cands = [s for _, s in sorted(cands)[:G["vizinhos"]]]
        dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
        gt = cv2.cvtColor(tr, cv2.COLOR_BGR2GRAY)
        gx, gy = np.meshgrid(np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32))
        for s in cands:
            sc_ = crop(s); hs = HOLE[s]
            flow = dis.calc(gt, cv2.cvtColor(vfill(sc_, hs, False)[R0:R1], cv2.COLOR_BGR2GRAY), None)
            mx = gx + flow[..., 0]; my = gy + flow[..., 1]
            ws = cv2.remap(sc_[R0:R1], mx, my, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
            vs = (cv2.dilate(hs, np.ones((7, 7), np.uint8)) == 0).astype(np.float32)[R0:R1]
            vw = cv2.remap(vs, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE) > 0.99
            srcs.append(("t", abs(s - t), ws, vw))
    if not srcs: return trf, {"fontes": 0}
    ring = (cv2.dilate(H, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25))) > 0) & (~Hb)
    ringf = ring.astype(np.float32); GT = gradE(tc)
    den0 = cv2.GaussianBlur(ringf, (0, 0), 30)
    ringg = np.where(den0 > 0.003, cv2.GaussianBlur(GT * ringf, (0, 0), 30) / np.maximum(den0, 1e-6), GT[ring].mean())
    hpt = hp(tc); lpt = cv2.GaussianBlur(tc.astype(np.float32), (0, 0), 5.0)
    E = []; final = []
    for kind, dist, ws, vw in srcs:
        rg = ring & vw
        if rg.sum() > 200:  # ganho/offset por canal casado no anel em volta do buraco
            wsf = ws.astype(np.float32)
            for c in range(3):
                a_ = wsf[..., c][rg][::7]; b_ = tc[..., c][rg][::7].astype(np.float32)
                g, o = np.linalg.lstsq(np.stack([a_, np.ones_like(a_)], 1), b_, rcond=None)[0]
                g = float(np.clip(g, 0.5, 2.0)); o = float(o) if 0.5 < g < 2.0 else 0.0
                wsf[..., c] = wsf[..., c] * g + o
            ws = np.clip(wsf, 0, 255).astype(np.uint8)
        R = rg.astype(np.float32); den = cv2.GaussianBlur(R, (0, 0), 22)
        e1 = np.where(den > 0.01, cv2.GaussianBlur(np.abs(hp(ws) - hpt).mean(2) * R, (0, 0), 22) / np.maximum(den, 1e-6), 99.0)
        e2 = np.where(den > 0.01, cv2.GaussianBlur(np.abs(cv2.GaussianBlur(ws.astype(np.float32), (0, 0), 5.0) - lpt).mean(2) * R, (0, 0), 22) / np.maximum(den, 1e-6), 99.0)
        e = np.minimum(e1 / THR, e2 / np.where(ringg > 30, 26.0, 14.0)) * THR
        e = np.where(vw & (gradE(ws) < 1.6 * ringg + 6) & (ringg >= 15), e, 99.0)
        E.append(np.where(armz, 99.0, e).astype(np.float32)); final.append((kind, min(40, dist), ws, vw))
    out = tr.copy(); remaining = Hb & ~armz; used = {"t": 0, "s": 0}
    for _ in range(10):
        cover = [(remaining & (e < THR)) for e in E]
        sc = [(c.sum() - 30.0 * float(E[j][c].mean() if c.any() else 0)) * (1 - 0.015 * final[j][1]) for j, c in enumerate(cover)]
        j = int(np.argmax(sc)); sub = cover[j]
        sub = cv2.morphologyEx(sub.astype(np.uint8), cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
        sub = (cv2.morphologyEx(sub, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8)) > 0) & remaining
        if sub.sum() < 80: break
        m8 = (sub * 255).astype(np.uint8); m8[:2] = 0; m8[-2:] = 0; m8[:, :2] = 0; m8[:, -2:] = 0
        if not m8.any(): break
        try: out = cv2.seamlessClone(final[j][2], out, m8, _center(m8), cv2.NORMAL_CLONE)
        except cv2.error: break
        used[final[j][0]] += int(sub.sum()); remaining &= ~sub
    res = trf.copy(); res[R0:R1] = out
    return res, {"temporal_px": used["t"], "espacial_px": used["s"], "interp_px": int(remaining.sum())}


def run_one(t):
    out, info = process(t)
    full = cv2.imread(G["paths"][t]); full[G["crop"][0]:G["crop"][1]] = out
    p = os.path.join(G["saida"], "c%04d.%s" % (t + 1, G["formato"]))
    if G["formato"] == "jpg":
        cv2.imwrite(p, full, [cv2.IMWRITE_JPEG_QUALITY, 97, cv2.IMWRITE_JPEG_SAMPLING_FACTOR, 0x111111])
    else:
        cv2.imwrite(p, full, [cv2.IMWRITE_PNG_COMPRESSION, 3])
    return t, info


# ------------------------------------------------------------------------------------ main ------
def main():
    ap = argparse.ArgumentParser(description="Remove legenda queimada de um trecho de video (quadros limpos).")
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--video", help="video de entrada (mp4/mov)")
    src.add_argument("--quadros", help="pasta de quadros (png/jpg, ordem alfabetica)")
    ap.add_argument("--padrao", default="*.png", help="glob dos quadros em --quadros")
    ap.add_argument("--inicio", type=float, default=0.0, help="s do arquivo (com --video: corte; com --quadros: tempo do 1o quadro)")
    ap.add_argument("--fim", type=float, default=None, help="s do arquivo (so --video)")
    ap.add_argument("--fps", type=float, default=None, help="fps dos quadros (obrigatorio com --quadros sem quadros.json)")
    ap.add_argument("--saida", required=True, help="pasta de saida (c0001.jpg..)")
    ap.add_argument("--formato", choices=["jpg", "png"], default="jpg")
    ap.add_argument("--faixa", help="y0,y1 da faixa da legenda (px). Omitido = automatico")
    ap.add_argument("--cores", default="auto", help="auto ou lista: branco,amarelo,verde,ciano,rosa")
    ap.add_argument("--sem-contorno", action="store_true", help="legenda sem stroke escuro (deteccao mais permissiva)")
    ap.add_argument("--dilatar", type=int, default=17, help="raio (px) de dilatacao da mascara (cobre antialias/sombra)")
    ap.add_argument("--voto", type=float, default=0.35, help="fracao de quadros do trecho para o pixel entrar na mascara")
    ap.add_argument("--vizinhos", type=int, default=12, help="quadros vizinhos para clone temporal (0 = desliga)")
    ap.add_argument("--sem-espacial", action="store_true", help="desliga o clone espacial (faixas acima/abaixo)")
    ap.add_argument("--sem-morph", action="store_true", help="desliga a interpolacao que segue braco/mao")
    ap.add_argument("--grao", type=float, default=0.4, help="grao no remendo (0..1)")
    ap.add_argument("--limiar", type=float, default=8.0, help="erro maximo de textura aceito numa fonte de clone")
    ap.add_argument("--processos", type=int, default=2)
    ap.add_argument("--so", help="processa so estes quadros (1-based, ex.: 30,31,40-45)")
    ap.add_argument("--preview", nargs="?", const=4, type=int, help="limpa N quadros (default 4) e salva _preview.jpg")
    a = ap.parse_args()

    os.makedirs(a.saida, exist_ok=True); tmp = None; t_start = time.time()
    if a.video:
        fps, fps_str = probe_fps(a.video)
        tmp = tempfile.mkdtemp(prefix="_src_", dir=a.saida)
        paths = extract(a.video, a.inicio, a.fim, tmp)
        first = first_pts(a.video, a.inicio, fps)
    else:
        paths = list_frames(a.quadros, a.padrao)
        qj = os.path.join(a.quadros, "quadros.json")
        meta = json.load(open(qj, encoding="utf-8")) if os.path.exists(qj) else {}
        fps = a.fps or meta.get("fps"); first = meta.get("firstFileTime", a.inicio); fps_str = str(fps)
        if not fps: sys.exit("--fps e obrigatorio com --quadros (sem quadros.json)")
    if not paths: sys.exit("nenhum quadro encontrado")
    H, W = cv2.imread(paths[0]).shape[:2]
    try:
        contorno = not a.sem_contorno
        if a.faixa:
            band = tuple(int(v) for v in a.faixa.split(","))
            cores = None
        else:
            band, cores = auto_band(paths, H, contorno)
            if band is None: sys.exit(json.dumps({"erro": "nenhuma legenda detectada; use --faixa y0,y1 e/ou --sem-contorno"}))
        if a.cores != "auto": cores = a.cores.split(",")
        if not cores:
            _, cores = auto_band(paths, H, contorno); cores = cores or ["branco", "amarelo"]
        core = [detect_core(cv2.imread(p), band, cores, contorno) for p in paths]
        masks, chunks = vote_masks(core, a.voto)
        mask_path = os.path.join(a.saida, "mascara_legenda.npz")
        np.savez_compressed(mask_path, m=np.stack(masks), faixa=np.array(band), rad=a.dilatar)
        com = [i for i, m in enumerate(masks) if m.any()]
        c0 = max(0, band[0] - 300); c1 = min(H, band[1] + 300)
        sel = list(range(len(paths)))
        if a.so:
            sel = []
            for part in a.so.split(","):
                x, _, y = part.partition("-"); sel += list(range(int(x) - 1, int(y or x)))
        if a.preview:
            pool = com or sel; n = min(a.preview, len(pool))
            sel = [pool[int(round(k * (len(pool) - 1) / max(1, n - 1)))] for k in range(n)]
        cfg = dict(paths=paths, saida=a.saida, formato=a.formato, mask_path=mask_path, rad=a.dilatar, crop=(c0, c1),
                   morph=not a.sem_morph, espacial=not a.sem_espacial, vizinhos=a.vizinhos, grao=a.grao, thr=a.limiar)
        infos = {}
        todo = [t for t in sel if masks[t].any()]
        for t in sel:  # quadros sem legenda: copia direta
            if not masks[t].any():
                im = cv2.imread(paths[t]); p = os.path.join(a.saida, "c%04d.%s" % (t + 1, a.formato))
                cv2.imwrite(p, im, [cv2.IMWRITE_JPEG_QUALITY, 97, cv2.IMWRITE_JPEG_SAMPLING_FACTOR, 0x111111] if a.formato == "jpg" else [cv2.IMWRITE_PNG_COMPRESSION, 3])
        if a.processos > 1 and len(todo) > 1:
            from concurrent.futures import ProcessPoolExecutor
            with ProcessPoolExecutor(a.processos, initializer=_init, initargs=(cfg,)) as ex:
                for t, info in ex.map(run_one, todo): infos[t + 1] = info
        else:
            _init(cfg)
            for t in todo:
                t_, info = run_one(t); infos[t_ + 1] = info
        resumo = {"quadros": len(paths), "processados": len(sel), "com_legenda": [com[0] + 1, com[-1] + 1] if com else None,
                  "trechos": chunks, "faixa": list(band), "cores": cores, "fps": round(fps, 4), "firstFileTime": first,
                  "segundos": round(time.time() - t_start, 1),
                  "px_preenchidos": {k: sum((i or {}).get(k, 0) for i in infos.values()) for k in ("temporal_px", "espacial_px", "interp_px")}}
        if a.preview:
            rows = []
            for t in sel:
                o = cv2.imread(paths[t]); c = cv2.imread(os.path.join(a.saida, "c%04d.%s" % (t + 1, a.formato)))
                y0, y1 = max(0, band[0] - 60), min(H, band[1] + 60)
                vis = o.copy(); vis[cv2.dilate(masks[t], cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * a.dilatar + 1,) * 2)) > 0] = (0, 0, 255)
                row = np.hstack([o[y0:y1], vis[y0:y1], c[y0:y1]])
                row = cv2.resize(row, (int(row.shape[1] * 0.5), int(row.shape[0] * 0.5)), interpolation=cv2.INTER_AREA)
                cv2.putText(row, "q%d  original | mascara | limpo" % (t + 1), (8, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
                rows.append(row)
            pv = os.path.join(a.saida, "_preview.jpg"); cv2.imwrite(pv, np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 88])
            resumo["preview"] = pv; resumo["amostra"] = [t + 1 for t in sel]
        else:
            json.dump({"firstFileTime": first, "fps": round(fps, 6), "fpsExact": fps_str, "count": len(paths), "w": W, "h": H,
                       "faixa": list(band), "cores": cores, "formato": a.formato},
                      open(os.path.join(a.saida, "quadros.json"), "w", encoding="utf-8"))
        print(json.dumps(resumo, ensure_ascii=False))
    finally:
        if tmp: shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
