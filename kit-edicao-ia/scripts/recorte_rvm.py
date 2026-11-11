# -*- coding: utf-8 -*-
"""
recorte_rvm.py — recorta a pessoa (alfa real) de um trecho de video, em CPU (RVM ONNX; sem GPU/WebGPU).
Metodo: metodos/06-recorte.md

Uso:
  # direto do video (sem legenda queimada)
  python scripts/recorte_rvm.py --video originais/x.mp4 --inicio 7.6 --fim 12.07 \
         --saida-matte template/public/x/matte --saida-plate template/public/x/plate --json template/src/x.matte.json
  # depois do remover_legenda_queimada.py (le quadros.json e mascara_legenda.npz da pasta)
  python scripts/recorte_rvm.py --quadros trabalho/limpo --saida-matte ... --json ...
  # teste curto: --so 40-54 (mantem o estado recorrente do RVM rodando desde o 1o quadro do intervalo)

Saida: m0001.png.. (RGBA, alfa reto, cor da borda limpa), p0001.jpg.. (plate RGB, opcional),
matte.json {firstFileTime,fps,count,w,h,sharpFrom,exposure:{gain,gamma,sat}} -> props do <Presenter matte=...>.
Imprime resumo JSON curto.

Pipeline por quadro: (normaliza brilho so para o modelo) -> RVM (estado recorrente) -> guided filter ->
reparo sob a legenda (furos fechados) -> preenche furos internos (camisa) -> suavizacao temporal ->
remove ilhas -> niveis (lo/hi) -> refino de fios de cabelo por "unmixing" (parede x cabelo) ->
foreground por blur-fusion -> despill (borda pega a cor do interior). Quadros desfocados no inicio
(entrada com blur) usam o alfa do 1o quadro nitido desfocado na mesma medida.
Deps: numpy, opencv-python-headless, onnxruntime; ffmpeg/ffprobe no PATH (entrada --video).
"""
import argparse, glob, json, os, re, shutil, subprocess, sys, tempfile, time

import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
MODELO = os.path.normpath(os.path.join(HERE, "..", "modelos", "rvm_mobilenetv3_fp32.onnx"))
kY = np.array([0.299, 0.587, 0.114], np.float32)


# ------------------------------------------------------------------------------------- IO -------
def probe_fps(video):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate",
                          "-of", "csv=p=0", video], capture_output=True, text=True).stdout.strip()
    a, b = (out.split("/") + ["1"])[:2]
    return float(a) / float(b), out


def first_pts(video, t0):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-read_intervals",
                        "%.3f%%+%.3f" % (max(0, t0 - 1.0), 12.0), "-show_entries", "frame=pts_time", "-of", "csv=p=0", video],
                       capture_output=True, text=True)
    ts = sorted(float(x.strip(",")) for x in r.stdout.split() if x.strip(",") not in ("", "N/A"))
    c = [t for t in ts if t >= t0 - 1e-4]  # o ffmpeg -ss descarta pts < t0
    return round(c[0], 4) if c else round(t0, 4)


def extract(video, t0, t1, dst):
    cmd = ["ffmpeg", "-v", "error", "-y", "-ss", "%.4f" % t0, "-i", video]
    if t1 is not None: cmd += ["-t", "%.4f" % (t1 - t0)]
    subprocess.run(cmd + ["-map", "0:v:0", "-fps_mode", "passthrough", os.path.join(dst, "f%04d.png")], check=True)
    return sorted(glob.glob(os.path.join(dst, "f*.png")))


def list_frames(d, pat):
    fs = sorted(glob.glob(os.path.join(d, pat)))
    return [f for f in fs if not os.path.basename(f).startswith("_")]


# --------------------------------------------------------------------------------- filtros ------
def box(x, r): return cv2.boxFilter(x, -1, (2 * r + 1, 2 * r + 1), normalize=True, borderType=cv2.BORDER_REPLICATE)


def guided(I, p, r, eps):
    mI = box(I, r); mp = box(p, r); cov = box(I * p, r) - mI * mp; var = box(I * I, r) - mI * mI
    a = cov / (var + eps); b = mp - a * mI
    return box(a, r) * I + box(b, r)


def nblur(x, w, s):
    num = cv2.GaussianBlur(x * w[..., None] if x.ndim == 3 else x * w, (0, 0), s)
    den = cv2.GaussianBlur(w, (0, 0), s)
    return (num / np.maximum(den, 1e-4)[..., None] if x.ndim == 3 else num / np.maximum(den, 1e-4)), den


def disk(k): return cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k))


def blur_fusion(I, a, r):
    """foreground (Forte & Pitie): tira a cor do fundo misturada na borda."""
    a3 = a[..., None]
    bl = lambda x: cv2.blur(x, (2 * r + 1, 2 * r + 1))
    Fb = bl(I * a3) / np.maximum(bl(a), 1e-3)[..., None]
    Bb = bl(I * (1 - a3)) / np.maximum(bl(1 - a), 1e-3)[..., None]
    return np.clip(Fb + a3 * (I - a3 * Fb - (1 - a3) * Bb), 0, 1)


def fg_estimate(I, a): return blur_fusion(np.clip(blur_fusion(I, a, 31), 0, 1), a, 5)


def despill(I, F, a, bg_cool, edge_px=5, band_w=0.9):
    """borda/parcial pega a CROMA do interior opaco proximo; luminancia limitada (fundo claro nao deixa fio claro)."""
    w = cv2.erode((a > 0.97).astype(np.float32), np.ones((3, 3), np.uint8))
    Fin, den = nblur(F, w, 5); ok = den > 0.02
    Yf = (F * kY).sum(2); Yin = (Fin * kY).sum(2)
    coreE = cv2.erode((a > 0.97).astype(np.uint8), np.ones((edge_px, edge_px), np.uint8))
    band = cv2.GaussianBlur(((a > 0) & (coreE == 0)).astype(np.float32), (0, 0), 0.9)
    tw = np.clip(np.maximum(np.clip((1 - a) * 2.2, 0, 1), band_w * band), 0, 1) * ok
    Yt = np.where(band > 0.25, np.minimum(Yf, np.maximum(Yin * 1.3, Yin + 0.08)), Yf)
    Fch = Fin * (Yt / np.maximum(Yin, 2e-3))[..., None]
    out = F * (1 - tw[..., None]) + Fch * tw[..., None]
    if bg_cool:  # fundo azul/roxo: interior quente (pele/cabelo) nunca fica com B dominante na borda
        part = ((a < 0.995) & (a > 0))[..., None]
        warm = (Fin[..., 0:1] > Fin[..., 2:3] * 1.05) & ok[..., None]
        Bc = np.minimum(out[..., 2:3], out[..., 1:2] * 0.9)
        out = np.where((part | (band[..., None] > 0.3)) & warm, np.concatenate([out[..., :2], Bc], 2), out)
    return np.clip(out, 0, 1)


def fill_interior(a, bgr, walld=42.0):
    """furos/crescentes que o RVM abre dentro do corpo (camisa da cor da parede): dentro do fechamento da silhueta,
    o que NAO tem a cor da parede (modelo de parede por linha, de longe) vira opaco."""
    op = (a > 0.5).astype(np.uint8)
    cl = cv2.morphologyEx(op, cv2.MORPH_CLOSE, disk(41))
    cand = (cl > 0) & (a < 0.9)
    if not cand.any(): return a
    far = cv2.dilate(op, disk(41)) == 0
    h = a.shape[0]; f = bgr.astype(np.float32); wall = np.zeros((h, 3), np.float32); okr = np.zeros(h, bool)
    for y in range(h):
        if far[y].sum() >= 20: wall[y] = np.median(f[y][far[y]], 0); okr[y] = True
    if okr.sum() < 20: return a
    ys = np.nonzero(okr)[0]
    for c in range(3): wall[:, c] = np.interp(np.arange(h), ys, wall[ys, c])
    wall = cv2.GaussianBlur(wall[None], (0, 0), 6)[0]
    fm = (cand & (np.abs(f - wall[:, None, :]).sum(2) > walld)).astype(np.uint8)
    fm = cv2.morphologyEx(fm, cv2.MORPH_OPEN, np.ones((2, 2), np.uint8))
    if not fm.any(): return a
    fm = cv2.dilate(fm, np.ones((3, 3), np.uint8)) & cand.astype(np.uint8)
    return np.maximum(a, cv2.GaussianBlur(fm.astype(np.float32), (0, 0), 1.0))


def comp_clean(a):
    """remove ilhas soltas (mao de outra pessoa, reflexo): fica o maior corpo e pedacos grandes."""
    m = (a > 0.5).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, connectivity=8)
    if n <= 2: return a
    big = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA]); lim = 0.007 * a.size
    keep = np.isin(lab, [k for k in range(1, n) if k == big or st[k, cv2.CC_STAT_AREA] > lim]).astype(np.uint8)
    return a * cv2.dilate(keep, np.ones((25, 25), np.uint8)).astype(np.float32)


def repair_caption(a, hole):
    """sob a legenda removida o RVM pode abrir buracos: furos fechados (nao abertos para fora) viram opacos."""
    inv = (a <= 0.5).astype(np.uint8); H, W = a.shape
    n, lab, st, _ = cv2.connectedComponentsWithStats(inv, connectivity=4)
    for k in range(1, n):
        x, y, w, h, ar = st[k]
        if ar < 0.017 * a.size and x > 0 and y > 0 and x + w < W and y + h < H and (hole[lab == k] > 0).any():
            dm = cv2.dilate((lab == k).astype(np.uint8), disk(15))
            a = np.maximum(a, cv2.GaussianBlur(dm.astype(np.float32), (0, 0), 1.6))
    return a


def refine_hair(I, bgr, a0, k_out=9, k_in=16, bg_cool=True):
    """fios de cabelo: na faixa da borda o alfa vem dos proprios pixels (I = a*F + (1-a)*B, B = parede local,
    F = cor local do cabelo/pele). Fora dessa faixa fica o alfa do modelo, contraido ~1 px e colado na borda real."""
    inside = (a0 > 0.5).astype(np.uint8)
    din = cv2.distanceTransform(inside, cv2.DIST_L2, 5); dout = cv2.distanceTransform(1 - inside, cv2.DIST_L2, 5)
    B, den = nblur(I, (dout > k_out - 1).astype(np.float32), 18)
    B2, _ = nblur(I, (dout > k_out - 1).astype(np.float32), 60)
    B = np.where((den > 0.02)[..., None], B, B2)
    core = cv2.erode((a0 > 0.97).astype(np.uint8), disk(9)).astype(np.float32)
    if bg_cool:  # pixels de borda com respingo do fundo nao entram no modelo de cor do cabelo (exceto camisa escura)
        blu = I[..., 2] > I[..., 0] + 0.02
        shirt = blu & (I.mean(2) < 0.36) & (cv2.GaussianBlur(blu.astype(np.float32), (0, 0), 6) > 0.8)
        core = core * (~(blu & ~shirt)).astype(np.float32)
    F, denf = nblur(I, core, 5); F2, _ = nblur(I, core, 20)
    F = np.where((denf > 0.05)[..., None], F, F2)
    d = F - B; dd = (d * d).sum(2); t = I - B
    a_p = (t * d).sum(2) / np.maximum(dd, 1e-4)
    res = np.sqrt(np.maximum(((t - a_p[..., None] * d) ** 2).sum(2), 0))
    conf = np.exp(-(res / 0.14) ** 2) * np.clip((np.sqrt(dd) - 0.12) / 0.15, 0, 1)
    a_u = np.clip(a_p * 1.08, 0, 1)
    g = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255.
    a_fb = cv2.erode(a0, disk(3)); a_fb = np.clip(0.4 * a_fb + 0.6 * guided(g, a_fb, 4, 1e-4), 0, 1)
    s = din - dout
    band = cv2.GaussianBlur(((s > -k_out) & (s < k_in)).astype(np.float32), (0, 0), 2.0)
    wallness = (((np.abs(I - B).mean(2) < 0.085) | (bg_cool & (I[..., 2] > 1.12 * I[..., 0] + 0.015))) & (I[..., 2] > 0.2)).astype(np.float32)
    hairpix = ((a0 > 0.3) & (I.mean(2) < 0.42) & (I[..., 0] >= 0.92 * I[..., 2])).astype(np.float32)
    hairzone = np.clip((cv2.GaussianBlur(hairpix, (0, 0), 9) - 0.30) / 0.20, 0, 1).astype(np.float32)
    pocket = cv2.GaussianBlur(wallness * hairzone * (din > 4).astype(np.float32), (0, 0), 1.0)
    reg = np.clip(np.maximum(band, pocket), 0, 1) * conf * hairzone
    a = a_fb * (1 - reg) + a_u * reg
    a = np.where(dout > k_out + 2, 0, a)
    a = np.where((din > k_in + 1) & (pocket < 0.05), a_fb, a)
    a = np.clip((a - 0.06) / 0.94, 0, 1)
    return np.where(a < 0.02, 0, a).astype(np.float32), hairzone


def pull_hair_spill(Fo, a, hairzone):
    """roxo/azul que sobrou no cabelo (luz da parede rebatida): croma puxada para a cor local do cabelo."""
    coreA = cv2.erode((a > 0.97).astype(np.uint8), disk(5)).astype(np.float32)
    Fin, dfin = nblur(Fo, coreA * hairzone, 6); Fin2, _ = nblur(Fo, coreA * hairzone, 20)
    Fin = np.where((dfin > 0.03)[..., None], Fin, Fin2)
    ps = np.clip((Fo[..., 2] - 0.9 * Fo[..., 0]) / 0.10, 0, 1) * hairzone * (a > 0.02)
    ps = cv2.GaussianBlur(ps.astype(np.float32), (0, 0), 0.8)
    Yo = (Fo * kY).sum(2); Yi = (Fin * kY).sum(2)
    Yt = np.minimum(Yo, np.maximum(Yi * 1.4, Yi + 0.10))
    Fch = np.clip(Fin * (Yt / np.maximum(Yi, 2e-3))[..., None], 0, 1)
    return Fo * (1 - ps[..., None]) + Fch * ps[..., None]


def sharpness(bgr):
    g = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY); h, w = g.shape
    return float(cv2.Laplacian(g[int(h * .14):int(h * .65), int(w * .23):int(w * .79)], cv2.CV_32F).var())


def face_lum(bgr, a):
    """luminancia media da parte de cima da silhueta (rosto/ombros), para a curva de exposicao."""
    m = a > 0.9
    if m.sum() < 500: return None
    ys = np.nonzero(m.any(1))[0]; y0, y1 = ys[0], ys[0] + int(0.4 * (ys[-1] - ys[0]))
    g = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY).astype(np.float32)
    mm = m.copy(); mm[:y0] = False; mm[y1:] = False
    return float(g[mm].mean()) if mm.sum() > 200 else None


# ------------------------------------------------------------------------------------ main ------
def main():
    ap = argparse.ArgumentParser(description="Recorte de pessoa (RVM em CPU) -> PNG RGBA + plate + matte.json")
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--video"); src.add_argument("--quadros", help="pasta de quadros (ex.: saida do remover_legenda_queimada.py)")
    ap.add_argument("--padrao", default="*.*", help="glob dos quadros em --quadros (png/jpg)")
    ap.add_argument("--inicio", type=float, default=0.0, help="s do arquivo (com --quadros sem quadros.json: tempo do 1o quadro)")
    ap.add_argument("--fim", type=float, default=None)
    ap.add_argument("--fps", type=float, default=None)
    ap.add_argument("--saida-matte", required=True); ap.add_argument("--saida-plate", default=None)
    ap.add_argument("--json", required=True, help="matte.json de saida (importado no video.config)")
    ap.add_argument("--modelo", default=MODELO)
    ap.add_argument("--downsample", type=float, default=0.6, help="RVM downsample_ratio: 0.6 rosto/meio corpo 1080; 0.4 corpo inteiro; 0.25 4K")
    ap.add_argument("--guided", type=float, default=0.5, help="peso do guided filter no alfa (0 desliga)")
    ap.add_argument("--suavizar", type=float, default=0.3, help="mistura com o alfa anterior onde a diferenca e pequena (anti-tremor)")
    ap.add_argument("--lo", type=float, default=0.12, help="alfa abaixo disso vira 0 (corta halo). V02 usou 0.28 = recorte duro")
    ap.add_argument("--hi", type=float, default=0.92, help="alfa acima disso vira 1")
    ap.add_argument("--cabelo", choices=["on", "off"], default="on", help="refino de fios por unmixing na borda")
    ap.add_argument("--despill", choices=["auto", "on", "off"], default="auto", help="auto: liga a regra azul/roxo se o fundo for frio")
    ap.add_argument("--normalizar", choices=["on", "off"], default="on", help="quadros escuros (fade) clareados SO para o modelo")
    ap.add_argument("--furos", choices=["on", "off"], default="on", help="preenche furos internos (camisa da cor da parede)")
    ap.add_argument("--nitidez", choices=["auto", "off"], default="auto", help="entrada desfocada usa o alfa do 1o quadro nitido desfocado")
    ap.add_argument("--corte-cena", type=float, default=70.0, help="antes do 1o nitido: diferenca media (0-255) acima da qual o quadro e outra cena (alfa 0); dissolve fica parcial")
    ap.add_argument("--primeiro-nitido", type=int, default=None, help="forca o indice (1-based) do 1o quadro nitido")
    ap.add_argument("--ganho-max", type=float, default=1.4, help="teto do ganho de exposicao gravado no json (V02 chegou a 2.4 = rosto ceroso)")
    ap.add_argument("--mascara-legenda", default=None, help="npz do remover_legenda_queimada.py (auto: <quadros>/mascara_legenda.npz)")
    ap.add_argument("--threads", type=int, default=4)
    ap.add_argument("--so", help="processa so este intervalo 1-based (ex.: 40-54) para teste")
    a = ap.parse_args()

    import onnxruntime as ort
    t_start = time.time(); tmp = None
    if a.video:
        fps, fps_str = probe_fps(a.video)
        tmp = tempfile.mkdtemp(prefix="_src_", dir=os.path.dirname(os.path.abspath(a.json)) or ".")
        paths = extract(a.video, a.inicio, a.fim, tmp); first = first_pts(a.video, a.inicio); meta = {}
    else:
        paths = [p for p in list_frames(a.quadros, a.padrao) if p.lower().endswith((".png", ".jpg", ".jpeg"))]
        qj = os.path.join(a.quadros, "quadros.json")
        meta = json.load(open(qj, encoding="utf-8")) if os.path.exists(qj) else {}
        fps = a.fps or meta.get("fps"); fps_str = meta.get("fpsExact", str(fps)); first = meta.get("firstFileTime", a.inicio)
        if not fps: sys.exit("--fps e obrigatorio com --quadros sem quadros.json")
        if a.mascara_legenda is None and os.path.exists(os.path.join(a.quadros, "mascara_legenda.npz")):
            a.mascara_legenda = os.path.join(a.quadros, "mascara_legenda.npz")
    try:
        if not paths: sys.exit("nenhum quadro")
        # numero do quadro = digitos do nome (c0040.jpg -> 40), para pastas parciais casarem com a mascara e o tempo
        nums = []
        for k, p in enumerate(paths):
            m = re.findall(r"(\d+)\D*$", os.path.basename(p)); nums.append(int(m[0]) if m else k + 1)
        if len(set(nums)) != len(nums): nums = list(range(1, len(paths) + 1))
        paths = [p for _, p in sorted(zip(nums, paths))]; nums = sorted(nums)
        N = max(max(nums), int(meta.get("count", 0)))  # quadros do trecho inteiro (indices 1..N)
        P = len(paths)
        i0, i1 = 0, P - 1
        if a.so:
            x, _, y = a.so.partition("-")
            sel = [k for k, n in enumerate(nums) if int(x) <= n <= int(y or x)]
            if not sel: sys.exit("--so fora dos quadros disponiveis")
            i0, i1 = sel[0], sel[-1]
        os.makedirs(a.saida_matte, exist_ok=True)
        if a.saida_plate: os.makedirs(a.saida_plate, exist_ok=True)
        HOLES = None
        if a.mascara_legenda:
            z = np.load(a.mascara_legenda); rad = int(z["rad"]) if "rad" in z else 17
            HOLES = (z["m"], rad)
        so = ort.SessionOptions(); so.intra_op_num_threads = a.threads
        sess = ort.InferenceSession(a.modelo, so, providers=["CPUExecutionProvider"])
        rec = [np.zeros((1, 1, 1, 1), np.float32) for _ in range(4)]
        dsr = np.array([a.downsample], np.float32)
        b0 = cv2.imread(paths[i0]); H, W = b0.shape[:2]
        # 1o quadro nitido (entrada com desfoque optico)
        K = i0
        lv = {}
        if a.primeiro_nitido: K = min(range(P), key=lambda k: abs(nums[k] - a.primeiro_nitido))
        elif a.nitidez == "auto":
            look = list(range(i0, min(i1 + 1, i0 + 40)))
            for i in look: lv[i] = sharpness(cv2.imread(paths[i]))
            ref = np.percentile([lv[i] for i in look], 80)
            K = next((i for i in look if lv[i] >= 0.8 * ref), i0)
        # fundo frio? (azul/roxo dominante nas laterais), medido depois do 1o quadro nitido (antes pode ser B-roll)
        def side_br(b):
            sd = np.concatenate([b[:, : W // 12].reshape(-1, 3), b[:, -W // 12:].reshape(-1, 3)]).astype(np.float32)
            return float(np.median(sd[:, 0] - sd[:, 2]))
        probe = [K + (i1 - K) * k // 4 for k in (1, 2, 3)]
        bgc = float(np.median([side_br(cv2.imread(paths[i])) for i in probe]))
        bg_cool = a.despill == "on" or (a.despill == "auto" and bgc > 8)
        # referencia de brilho para normalizar o fade (mediana do meio do trecho)
        def centre(b):
            g = cv2.cvtColor(b, cv2.COLOR_BGR2GRAY); return float(g[int(H * .28):int(H * .65), int(W * .28):int(W * .83)].mean())
        mid = list(range(K + (i1 - K) // 4, K + 3 * (i1 - K) // 4 + 1, max(1, (i1 - K) // 12)))
        LREF = float(np.median([centre(cv2.imread(paths[i])) for i in mid]))
        prev = None; pending = []; stats = {"lum": {}, "alpha_mean": {}}
        zero = np.zeros((H, W, 4), np.uint8)

        def finalize(i, bgr, al):
            nonlocal prev
            if prev is not None and a.suavizar > 0:
                lam = np.where(np.abs(al - prev) < 0.15, a.suavizar, 0.0).astype(np.float32); al = al * (1 - lam) + prev * lam
            prev = al.copy()
            al = comp_clean(al)
            al = np.clip((al - a.lo) / max(1e-3, a.hi - a.lo), 0, 1).astype(np.float32)
            al = al * al * (3 - 2 * al) * 0.5 + al * 0.5
            al = np.where(al < 0.03, 0, np.where(al > 0.985, 1, al)).astype(np.float32)
            I = bgr[..., ::-1].astype(np.float32) / 255.
            hz = None
            if a.cabelo == "on" and al.max() > 0.5:
                al, hz = refine_hair(I, bgr, al, bg_cool=bg_cool); al = comp_clean(al); al = cv2.GaussianBlur(al, (0, 0), 0.5)
            F = fg_estimate(I, al)
            Fo = despill(I, F, al, bg_cool) if a.despill != "off" else F
            if hz is not None and bg_cool and a.despill != "off": Fo = pull_hair_spill(Fo, al, hz)
            rgb = (Fo * 255 + 0.5).astype(np.uint8); a8 = (al * 255 + 0.5).astype(np.uint8); rgb[a8 == 0] = 0
            cv2.imwrite(os.path.join(a.saida_matte, "m%04d.png" % nums[i]), np.dstack([rgb[..., ::-1], a8]), [cv2.IMWRITE_PNG_COMPRESSION, 4])
            stats["lum"][nums[i] - 1] = face_lum(bgr, al); stats["alpha_mean"][nums[i] - 1] = round(float(al.mean()), 4)

        for i in range(i0, i1 + 1):
            bgr = cv2.imread(paths[i])
            if a.saida_plate:
                cv2.imwrite(os.path.join(a.saida_plate, "p%04d.jpg" % nums[i]), bgr, [cv2.IMWRITE_JPEG_QUALITY, 95, cv2.IMWRITE_JPEG_SAMPLING_FACTOR, 0x111111])
            src = bgr
            if a.normalizar == "on":
                c = centre(bgr)
                if LREF / max(c, 1.0) > 1.08:  # fade escuro: gamma ate o brilho de referencia, sem estourar altas
                    gam = np.log(LREF / 255.) / np.log(max(c / 255., 1e-3))
                    src = (255. * np.power(bgr.astype(np.float32) / 255., gam)).clip(0, 255).astype(np.uint8)
            x = (src[..., ::-1].astype(np.float32) / 255.).transpose(2, 0, 1)[None]
            _, pha, *rec = sess.run(None, {"src": x, "r1i": rec[0], "r2i": rec[1], "r3i": rec[2], "r4i": rec[3], "downsample_ratio": dsr})
            al = pha[0, 0].astype(np.float32)
            if a.guided > 0:
                g = cv2.cvtColor(src, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255.
                al = np.clip((1 - a.guided) * al + a.guided * guided(g, al, 6, 1e-3), 0, 1)
            if HOLES is not None and nums[i] - 1 < len(HOLES[0]) and HOLES[0][nums[i] - 1].any():
                hole = cv2.dilate(HOLES[0][nums[i] - 1], disk(2 * HOLES[1] + 15))
                al = repair_caption(al, hole)
            if a.furos == "on" and i >= K: al = fill_interior(al, bgr)
            if i < K:
                pending.append((i, bgr)); continue
            for j, bj in pending:  # entrada desfocada: alfa nitido desfocado ate a nitidez do quadro j
                gref = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY); best, bd = 0, 1e18
                target = lv.get(j) or sharpness(bj)
                for sg in (0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 17):
                    gb = cv2.GaussianBlur(gref, (0, 0), sg) if sg else gref
                    v = sharpness(cv2.cvtColor(gb, cv2.COLOR_GRAY2BGR))
                    if abs(v - target) < bd: bd, best = abs(v - target), sg
                # e a mesma cena? (antes da pessoa pode haver B-roll / dissolve): compara com o nitido desfocado igual
                sm = lambda im: cv2.resize(cv2.GaussianBlur(im, (0, 0), max(best, 2)), (64, 64), interpolation=cv2.INTER_AREA).astype(np.float32)
                diff = float(np.abs(sm(bj) - sm(bgr)).mean())
                wsc = float(np.clip((a.corte_cena - diff) / (0.6 * a.corte_cena), 0, 1))
                aj = cv2.GaussianBlur(al, (0, 0), best) if best else al.copy()
                finalize(j, bj, aj * wsc)
            pending = []
            finalize(i, bgr, al)
        # quadros fora do --so nao sao tocados; quadros sem pessoa ficam transparentes
        for i in range(i0, i1 + 1):
            p = os.path.join(a.saida_matte, "m%04d.png" % nums[i])
            if not os.path.exists(p): cv2.imwrite(p, zero, [cv2.IMWRITE_PNG_COMPRESSION, 6])
        # curva de exposicao: ganho LIMITADO + gamma para o resto (nunca ganho linear alto)
        idx = list(range(N)); lum = np.array([stats["lum"].get(i) or np.nan for i in idx], np.float64)
        ok = ~np.isnan(lum)
        gain = [1.0] * N; gamma = [1.0] * N; sat = [1.0] * N
        if ok.sum() >= 3:
            lum = np.interp(np.arange(N), np.nonzero(ok)[0], lum[ok])
            lum = np.convolve(np.pad(lum, 3, mode="edge"), np.ones(7) / 7, mode="valid")
            n0, n1 = nums[i0] - 1, nums[i1] - 1; nk = nums[K] - 1
            ref = float(np.median(lum[nk + (n1 - nk) // 4: nk + 3 * (n1 - nk) // 4 + 1]))
            for i in range(n0, n1 + 1):
                need = ref / max(lum[i], 1.0)
                if need <= 1.04: continue
                g_ = min(need, a.ganho_max); gm = float(np.clip(1 - 0.47 * np.log(need / a.ganho_max), 0.8, 1.0)) if need > a.ganho_max else 1.0
                gain[i] = round(g_, 3); gamma[i] = round(gm, 3); sat[i] = round(1 + 0.08 * (g_ - 1), 3)
        info = {"firstFileTime": first, "fps": round(fps, 6), "fpsExact": fps_str, "count": N, "w": W, "h": H,
                "sharpFrom": nums[K], "matte": "m%04d.png (RGBA reto)", "plate": "p%04d.jpg" if a.saida_plate else None,
                "frameTime": "t_file = firstFileTime + (i-1)/fps", "params": {k: getattr(a, k) for k in
                ("downsample", "guided", "suavizar", "lo", "hi", "cabelo", "despill", "normalizar", "ganho_max")},
                "bgCool": bool(bg_cool), "exposure": {"gain": gain, "gamma": gamma, "sat": sat}}
        if a.so and os.path.exists(a.json):  # teste parcial nao apaga dados de outro trecho
            old = json.load(open(a.json, encoding="utf-8")); info["exposure"] = old.get("exposure", info["exposure"])
        os.makedirs(os.path.dirname(os.path.abspath(a.json)), exist_ok=True)
        json.dump(info, open(a.json, "w", encoding="utf-8"), ensure_ascii=False)
        am = [v for v in stats["alpha_mean"].values()]
        print(json.dumps({"quadros": N, "processados": i1 - i0 + 1, "sharpFrom": nums[K], "firstFileTime": first, "fps": round(fps, 4),
                          "bgCool": bool(bg_cool), "alfa_medio": [min(am), max(am)] if am else None,
                          "ganho_max_usado": max(gain), "json": a.json, "segundos": round(time.time() - t_start, 1)}, ensure_ascii=False))
    finally:
        if tmp: shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
