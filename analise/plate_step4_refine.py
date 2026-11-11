"""Round-2 matte refinement (PLATE). Reads the v1 alpha (analise/matte_v1/m%04d.png, gray) and the clean plate
(projeto/public/plate/p%04d.jpg). Writes projeto/public/matte/m%04d.png (RGBA straight).

What it fixes versus v1:
 - v1 alpha was a smoothed/dilated silhouette (hair wisps gone, wavy outline, purple pockets inside the hair made opaque).
 - Here the alpha in a band around the edge (and in wall-coloured pockets inside the hair) is recovered from the pixels
   themselves: two-colour unmixing between a locally estimated wall colour B and the local hair/skin/shirt colour F.
 - Everywhere else the v1 alpha is kept, eroded ~1px and snapped to the real edge with a guided filter.
 - Colour: blur-fusion foreground + despill (edge chroma taken from the opaque interior).
Usage: python analise/plate_step4_refine.py [first] [last]   (run from the scratch root)
"""
import numpy as np, cv2, os, sys, json
sys.path.insert(0, 'analise')
os.environ.setdefault('REPAIR', '1')
from plate_step3_matte import fg_estimate, despill, guided, comp_clean   # noqa

OUT = os.environ.get('OUT_M', 'projeto/public/matte')
DBG = os.environ.get('DBG', '')
K_OUT = 9          # px outside the v1 edge where unmixing is allowed
K_IN = 16          # px inside
SIGB = 18          # sigma of the wall colour model
SIGF = 5           # sigma of the local foreground colour model


def disk(k): return cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k))


def nblur(x, w, s):
    num = cv2.GaussianBlur(x * w[..., None] if x.ndim == 3 else x * w, (0, 0), s)
    den = cv2.GaussianBlur(w, (0, 0), s)
    return (num / np.maximum(den, 1e-4)[..., None] if x.ndim == 3 else num / np.maximum(den, 1e-4)), den


def refine(i):
    bgr = cv2.imread('projeto/public/plate/p%04d.jpg' % i)
    I = bgr[..., ::-1].astype(np.float32) / 255.
    a0 = cv2.imread('analise/matte_v1/m%04d.png' % i, -1).astype(np.float32) / 255.
    H, W = a0.shape
    inside = (a0 > 0.5).astype(np.uint8)
    din = cv2.distanceTransform(inside, cv2.DIST_L2, 5)
    dout = cv2.distanceTransform(1 - inside, cv2.DIST_L2, 5)

    # --- wall colour model B(x,y): normalised blur of pixels clearly outside the silhouette
    w_out = (dout > K_OUT - 1).astype(np.float32)
    B, den = nblur(I, w_out, SIGB)
    B2, den2 = nblur(I, w_out, 60)
    B = np.where((den > 0.02)[..., None], B, B2)

    # --- local foreground colour F from the opaque interior
    core = cv2.erode((a0 > 0.97).astype(np.uint8), disk(9)).astype(np.float32)
    # hair/skin colour only: drop pixels with purple spill (they would pollute F and under-estimate alpha)
    bluish0 = (I[..., 2] > 1.0 * I[..., 0] + 0.02)
    # but keep real shirt (large, saturated, dark purple) : the shirt is far from the wall in luminance
    shirt = bluish0 & (I.mean(2) < 0.36) & (cv2.GaussianBlur(bluish0.astype(np.float32), (0, 0), 6) > 0.8)
    core = core * (~(bluish0 & ~shirt)).astype(np.float32)
    F, denf = nblur(I, core, SIGF)
    F2, _ = nblur(I, core, 20)
    F = np.where((denf > 0.05)[..., None], F, F2)

    # --- unmixing: I = a F + (1-a) B
    d = F - B
    dd = (d * d).sum(2)
    t = I - B
    a_p = (t * d).sum(2) / np.maximum(dd, 1e-4)
    res = np.sqrt(np.maximum(((t - a_p[..., None] * d) ** 2).sum(2), 0))
    sep = np.sqrt(dd)                         # how different hair is from the wall here
    conf = np.exp(-(res / 0.14) ** 2) * np.clip((sep - 0.12) / 0.15, 0, 1)
    a_u = np.clip(a_p * 1.08, 0, 1)

    # --- fallback: v1 alpha eroded ~1px and snapped to image edges
    a_fb = cv2.erode(a0, disk(3))
    g = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255.
    a_fb = np.clip(0.4 * a_fb + 0.6 * guided(g, a_fb, 4, 1e-4), 0, 1)

    # --- region where unmixing is trusted: edge band + wall-like pockets inside hair
    s = din - dout
    band = ((s > -K_OUT) & (s < K_IN)).astype(np.float32)
    band = cv2.GaussianBlur(band, (0, 0), 2.0)
    wallness = (((np.abs(I - B).mean(2) < 0.085) | (I[..., 2] > 1.12 * I[..., 0] + 0.015)) & (I[..., 2] > 0.2)).astype(np.float32)
    warm = (I[..., 0] > I[..., 2] * 1.0).astype(np.float32)
    hairpix = ((a0 > 0.3) & (I.mean(2) < 0.42) & (I[..., 0] >= 0.92 * I[..., 2])).astype(np.float32)
    hairzone = np.clip((cv2.GaussianBlur(hairpix, (0, 0), 9) - 0.30) / 0.20, 0, 1).astype(np.float32)
    pocket = wallness * hairzone * (din > 4).astype(np.float32)
    pocket = cv2.GaussianBlur(pocket, (0, 0), 1.0)
    # pockets must lie inside the hair mass: not in the shirt/arm area
    reg = np.clip(np.maximum(band, pocket), 0, 1) * conf * hairzone
    # outside the old silhouette beyond K_OUT nothing is added; inside deep core nothing is removed
    a = a_fb * (1 - reg) + a_u * reg
    a = np.where(dout > K_OUT + 2, 0, a)
    a = np.where((din > K_IN + 1) & (pocket < 0.05), np.maximum(a_fb, a * 0 + a_fb), a)
    # remove faint haze: soft toe
    a = np.clip((a - 0.06) / 0.94, 0, 1)
    a = np.where(a < 0.02, 0, a).astype(np.float32)
    a = comp_clean(a)
    a = cv2.GaussianBlur(a, (0, 0), 0.5)

    F_ = fg_estimate(I, a)
    Fo = despill(I, F_, a)
    # purple left in the hair (wall light bounced on curls / residual mixing): pull its chroma to the local hair colour
    kY = np.array([0.299, 0.587, 0.114], np.float32)
    coreA = cv2.erode((a > 0.97).astype(np.uint8), disk(5)).astype(np.float32)
    Fin, dfin = nblur(Fo, coreA * hairzone, 6)
    Fin2, _ = nblur(Fo, coreA * hairzone, 20)
    Fin = np.where((dfin > 0.03)[..., None], Fin, Fin2)
    ps = np.clip((Fo[..., 2] - 0.9 * Fo[..., 0] - 0.0) / 0.10, 0, 1) * hairzone * (a > 0.02)
    ps = cv2.GaussianBlur(ps.astype(np.float32), (0, 0), 0.8)
    Yo = (Fo * kY).sum(2); Yi = (Fin * kY).sum(2)
    Yt = np.minimum(Yo, np.maximum(Yi * 1.4, Yi + 0.10))
    Fch = np.clip(Fin * (Yt / np.maximum(Yi, 2e-3))[..., None], 0, 1)
    Fo = Fo * (1 - ps[..., None]) + Fch * ps[..., None]
    rgb = (Fo * 255 + 0.5).astype(np.uint8)
    al = (a * 255 + 0.5).astype(np.uint8)
    rgb[al == 0] = 0
    out = np.dstack([rgb[..., ::-1], al])
    tmp = '%s/_t%04d.png' % (OUT, i)
    cv2.imwrite(tmp, out, [cv2.IMWRITE_PNG_COMPRESSION, 4])
    os.replace(tmp, '%s/m%04d.png' % (OUT, i))
    if DBG: globals()['LAST']=dict(locals())
    return float(a.mean())


if __name__ == '__main__':
    f = int(sys.argv[1]) if len(sys.argv) > 1 else 26
    l = int(sys.argv[2]) if len(sys.argv) > 2 else 107
    st = {}
    for i in range(f, l + 1):
        st[i] = refine(i)
        if i % 10 == 0: print(i, flush=True)
    print('done')
