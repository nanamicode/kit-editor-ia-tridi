# -*- coding: utf-8 -*-
"""
folha.py — UMA imagem (folha de contato) para o agente conferir varios quadros gastando 1 leitura.

Modos:
  mp4     extrai quadros de um MP4 renderizado (ffmpeg) e monta a folha
          python scripts/folha.py mp4 entregas/V02.mp4 --frames 20,60,110,214,242,274,330 --out folha.jpg
          python scripts/folha.py mp4 entregas/V02.mp4 --n 10 --out folha.jpg     (10 quadros espalhados)
  stills  renderiza stills de uma composicao Remotion (sem render do video todo) e monta a folha
          python scripts/folha.py stills --projeto template --entry src/index.ts --comp Video \
                 --frames 0,60,120,240,300 --out folha.jpg
  imgs    junta imagens que ja existem
          python scripts/folha.py imgs a.png b.png c.png --out folha.jpg

Opcoes: --largura 360 (largura de cada miniatura), --colunas 5, --rotulos (escreve o quadro/tempo).
Deps: pillow; ffmpeg no PATH; Node + Remotion no projeto (modo stills). Chrome do sistema e detectado
automaticamente (o Chrome embutido do Remotion quebra em caminhos longos no Windows).
"""
import argparse, json, os, shutil, subprocess, sys, tempfile

from PIL import Image, ImageDraw


def chrome_path():
    cands = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/usr/bin/google-chrome",
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser",
    ]
    for c in cands:
        if os.path.exists(c):
            return c
    return None


def probe(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-count_packets",
         "-show_entries", "stream=r_frame_rate,nb_read_packets", "-of", "json", path],
        capture_output=True, text=True, check=True).stdout
    s = json.loads(out)["streams"][0]
    num, den = s["r_frame_rate"].split("/")
    return float(num) / float(den), int(s["nb_read_packets"])


def sheet(paths, labels, out, width, cols):
    ims = [Image.open(p).convert("RGB") for p in paths]
    h = int(round(ims[0].height * width / ims[0].width))
    ims = [im.resize((width, h)) for im in ims]
    rows = (len(ims) + cols - 1) // cols
    cols = min(cols, len(ims))
    S = Image.new("RGB", (cols * width, rows * h), (0, 0, 0))
    d = ImageDraw.Draw(S)
    for i, im in enumerate(ims):
        x, y = (i % cols) * width, (i // cols) * h
        S.paste(im, (x, y))
        if labels:
            d.rectangle([x, y, x + 120, y + 26], fill=(0, 0, 0))
            d.text((x + 6, y + 6), labels[i], fill=(255, 255, 0))
    S.save(out, quality=88)
    return S.size


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("modo", choices=["mp4", "stills", "imgs"])
    ap.add_argument("entrada", nargs="*")
    ap.add_argument("--frames", default="")
    ap.add_argument("--n", type=int, default=0)
    ap.add_argument("--projeto", default=".")
    ap.add_argument("--entry", default="src/index.ts")
    ap.add_argument("--comp", default="Video")
    ap.add_argument("--out", default="folha.jpg")
    ap.add_argument("--largura", type=int, default=360)
    ap.add_argument("--colunas", type=int, default=5)
    ap.add_argument("--rotulos", action="store_true")
    a = ap.parse_args()

    tmp = tempfile.mkdtemp(prefix="folha_")
    paths, labels = [], []
    try:
        if a.modo == "imgs":
            paths = a.entrada
            labels = [os.path.basename(p) for p in paths]
        elif a.modo == "mp4":
            src = a.entrada[0]
            fps, total = probe(src)
            frames = [int(x) for x in a.frames.split(",") if x.strip()]
            if not frames:
                n = a.n or 10
                frames = [int(round(i * (total - 1) / (n - 1))) for i in range(n)]
            sel = "+".join(f"eq(n\\,{fr})" for fr in frames)
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-vf", f"select={sel}",
                            "-fps_mode", "passthrough", os.path.join(tmp, "q%03d.png")], check=True)
            paths = sorted(os.path.join(tmp, x) for x in os.listdir(tmp))
            labels = [f"f{fr} {fr / fps:.2f}s" for fr in frames][: len(paths)]
        else:
            frames = [int(x) for x in a.frames.split(",") if x.strip()]
            chrome = chrome_path()
            npx = "npx.cmd" if os.name == "nt" else "npx"
            for fr in frames:
                p = os.path.join(tmp, f"s{fr:04d}.png")
                cmd = [npx, "remotion", "still", a.entry, a.comp, f"--frame={fr}", "--gl=angle", p]
                if chrome:
                    cmd.insert(-1, f"--browser-executable={chrome}")
                r = subprocess.run(cmd, cwd=a.projeto, capture_output=True, text=True, encoding="utf-8", errors="replace")
                if r.returncode != 0:
                    print(json.dumps({"erro": f"still f{fr}", "log": r.stderr[-800:]}))
                    sys.exit(1)
                paths.append(p)
                labels.append(f"f{fr} {fr / 30:.2f}s")
        size = sheet(paths, labels if (a.rotulos or a.modo != "imgs") else None, a.out, a.largura, a.colunas)
        print(json.dumps({"folha": a.out, "quadros": len(paths), "tamanho": size}))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
