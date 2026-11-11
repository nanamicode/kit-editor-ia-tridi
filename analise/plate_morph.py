"""Edge-tracking interpolation across a horizontal hole band (PLATE).
Aligns the clean strip above the hole with the clean strip below it by 1-D dynamic time warping
along x, then morphs between them row by row, so arm/shirt/wall boundaries stay sharp and slanted."""
import numpy as np, cv2

def _dtw(T, B, S=34, lam=5.0):
    W = len(T); K = 2 * S + 1
    INF = 1e9
    D = np.full((W, K), INF, np.float32); bt = np.zeros((W, K), np.int8)
    # cost[i,k] with j=i+k-S
    def cost(i, k):
        j = i + k - S
        if j < 0 or j >= W: return INF
        return float(np.abs(T[i] - B[j]).sum())
    D[0, S] = cost(0, S)
    for i in range(W):
        for k in range(K):
            j = i + k - S
            if j < 0 or j >= W: continue
            if i == 0 and k == S: continue
            c = cost(i, k)
            best = INF; arg = 0
            if i > 0:                                   # diagonal (i-1,j-1) -> same k
                v = D[i - 1, k]
                if v < best: best = v; arg = 0
                if k + 1 < K:                           # from (i-1, j) : T advances only
                    v = D[i - 1, k + 1] + lam
                    if v < best: best = v; arg = 1
            if k - 1 >= 0:                              # from (i, j-1) : B advances only
                v = D[i, k - 1] + lam
                if v < best: best = v; arg = 2
            D[i, k] = best + c; bt[i, k] = arg
    # backtrack from (W-1, W-1) -> k=S
    i, k = W - 1, S; path = [(i, i + k - S)]
    while not (i == 0 and k == S):
        a = bt[i, k]
        if a == 0: i -= 1
        elif a == 1: i -= 1; k += 1
        else: k -= 1
        path.append((i, i + k - S))
        if len(path) > 4 * W: break
    path.reverse()
    return np.array(path, np.float32)

def morph_band(img, ya, yb, x0, x1, S=34, lam=5.0, rows=5):
    """img BGR uint8; hole rows [ya,yb) are replaced (returned as float array (yb-ya, x1-x0, 3)).
    Strips: rows ya-1-rows..ya-2 above, yb+1..yb+rows below."""
    f = img.astype(np.float32)
    T = f[ya - 1 - rows:ya - 1, x0:x1].mean(0); B = f[yb + 1:yb + 1 + rows, x0:x1].mean(0)
    T = cv2.GaussianBlur(T[None], (0, 0), 1.2)[0]; B = cv2.GaussianBlur(B[None], (0, 0), 1.2)[0]
    path = _dtw(T, B, S, lam)
    ci = path[:, 0].astype(np.int32); cj = path[:, 1].astype(np.int32)
    Tc = ya - 1 - rows / 2.0; Bc = yb + 1 + (rows - 1) / 2.0
    xs = np.arange(x1 - x0, dtype=np.float32)
    out = np.zeros((yb - ya, x1 - x0, 3), np.float32)
    eps = np.arange(len(path), dtype=np.float32) * 1e-4
    for r, y in enumerate(range(ya, yb)):
        t = (y - Tc) / (Bc - Tc)
        xm = (1 - t) * path[:, 0] + t * path[:, 1] + eps
        col = (1 - t) * T[ci] + t * B[cj]
        for c in range(3):
            out[r, :, c] = np.interp(xs, xm, col[:, c])
    return out

def skin_mask(bgr):
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    return (h <= 24) & (s >= 35) & (v >= 70)

def arm_zone(img, ya, yb, margin=40, rows=5):
    """x-range [x0,x1) where skin touches the strips above/below the hole, or None."""
    f = img
    st = skin_mask(f[ya - 1 - rows:ya - 1]).mean(0) > 0.6
    sb = skin_mask(f[yb + 1:yb + 1 + rows]).mean(0) > 0.6
    cols = np.nonzero(st | sb)[0]
    if len(cols) < 25: return None
    # keep the main skin cluster (arm/hand); ignore hair curls etc. far away (gap > 60 px)
    runs = []; a = cols[0]; p = cols[0]
    for c in cols[1:]:
        if c - p > 60: runs.append((a, p)); a = c
        p = c
    runs.append((a, p))
    hv = cv2.cvtColor(np.vstack([img[ya - 1 - rows:ya - 1], img[yb + 1:yb + 1 + rows]]), cv2.COLOR_BGR2HSV)[..., 2].astype(np.float32)
    mk = np.vstack([skin_mask(img[ya - 1 - rows:ya - 1]), skin_mask(img[yb + 1:yb + 1 + rows])])
    tot = []; mv = []
    for r0, r1 in runs:
        m_ = mk[:, r0:r1 + 1]; n_ = int(m_.sum()); tot.append(n_)
        mv.append(float(hv[:, r0:r1 + 1][m_].mean()) if n_ else 0.0)
    cand = [k for k in range(len(runs)) if tot[k] >= 25]
    if not cand: return None
    k = max(cand, key=lambda k: mv[k])      # arm/hand is the brightest skin cluster (hair is darker)
    r0, r1 = runs[k]
    return max(0, r0 - margin), min(img.shape[1], r1 + margin)

def morph_fill(img, Hm, margin=40, feather=24):
    """Replace hole pixels of Hm inside the arm zone by the edge-tracking morph. Returns (res, zone) with res float32
    containing morph values in zone and NaN elsewhere (caller merges)."""
    h, w = Hm.shape
    rows = np.nonzero(Hm.any(1))[0]
    if len(rows) == 0: return None
    ya, yb = int(rows.min()), int(rows.max()) + 1
    if ya < 12 or yb > h - 12: return None
    z = arm_zone(img, ya, yb, margin)
    if z is None: return None
    x0, x1 = z
    # sub-band restricted to hole columns in the zone
    sub = Hm[:, x0:x1]
    r2 = np.nonzero(sub.any(1))[0]
    if len(r2) == 0: return None
    ya, yb = int(r2.min()), int(r2.max()) + 1
    cols = np.nonzero(sub.any(0))[0]
    x0, x1 = x0 + int(cols.min()) - 12, x0 + int(cols.max()) + 13
    x0 = max(0, x0); x1 = min(w, x1)
    # widen so that DTW has clean anchors on both ends
    xa = max(0, x0 - 50); xb = min(w, x1 + 50)
    m = morph_band(img, ya, yb, xa, xb)
    full = np.full((h, w, 3), np.nan, np.float32)
    full[ya:yb, xa:xb] = m
    m2 = np.zeros((h, w), np.float32); m2[ya:yb, x0:x1] = 1
    m2 = cv2.GaussianBlur(m2, (0, 0), feather / 3.0)
    return full, m2
