import subprocess, sys, os, time
ROOT = r"C:/Users/Vinicius Prado/AppData/Local/Claude-Data/claude_pzs8sxrjxfjjc/scratch-workspaces/cbcefd08-3c72-4ec7-af15-90a5e393045f/1fb5fd07-2315-4f23-9191-6e0300909064/scratch-2026-11-09-db7476"
a, b = int(sys.argv[1]), int(sys.argv[2])
out = sys.argv[3]
scale = sys.argv[4] if len(sys.argv) > 4 else "0.5"
outdir = f"{ROOT}/analise/review/seal/{out}"
os.makedirs(outdir, exist_ok=True)
def ok(f):
    p = f"{outdir}/element-{f}.jpeg"
    return os.path.exists(p) and os.path.getsize(p) > 8000
for attempt in range(8):
    miss = [f for f in range(a, b+1) if not ok(f)]
    if not miss: break
    lo, hi = miss[0], miss[-1]
    print("attempt", attempt, "missing", len(miss), lo, hi, flush=True)
    r = subprocess.run(["npx.cmd" if os.name=="nt" else "npx","remotion","render","src/dev/Seal3D.ts","Seal3D","--sequence","--image-format=jpeg","--jpeg-quality=85",
        f"--scale={scale}",f"--frames={lo}-{hi}","--public-dir=../analise/seal/public","--gl=angle",
        "--browser-executable=C:\Program Files\Google\Chrome\Application\chrome.exe",outdir],
        cwd=f"{ROOT}/projeto", capture_output=True, text=True, shell=False)
    tail = (r.stdout + r.stderr).strip().splitlines()[-2:]
    print(" | ".join(tail)[:300], flush=True)
    time.sleep(2)
print("done missing:", [f for f in range(a, b+1) if not ok(f)])
