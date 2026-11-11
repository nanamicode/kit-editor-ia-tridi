// uso: node stills.cjs 0 40 78 ...  (bundle uma vez, renderiza vários quadros do V8)
// Disco quase cheio: bundle sem copiar public (pasta vazia) e o vídeo do v8 entra por hardlink (0 byte extra).
const path = require("path");
const fs = require("fs");
const P = path.resolve(__dirname, "../../../../projeto");
const { bundle } = require(path.join(P, "node_modules/@remotion/bundler"));
const { renderStill, selectComposition } = require(path.join(P, "node_modules/@remotion/renderer"));
(async () => {
  const outDir = path.join(__dirname, "bundle");
  fs.rmSync(outDir, { recursive: true, force: true });
  const serveUrl = await bundle({ entryPoint: path.join(P, "src/v/v8/index.ts"), publicDir: path.join(__dirname, "pub_vazio"), outDir, enableCaching: false });
  fs.mkdirSync(path.join(outDir, "public/v/v8"), { recursive: true });
  fs.linkSync(path.join(P, "public/v/v8/v8.mp4"), path.join(outDir, "public/v/v8/v8.mp4"));
  const opts = { serveUrl, browserExecutable: "C:/Program Files/Google/Chrome/Application/chrome.exe", chromiumOptions: { gl: "angle" } };
  const composition = await selectComposition({ ...opts, id: "V8" });
  for (const f of process.argv.slice(2).map(Number)) {
    await renderStill({ ...opts, composition, frame: f, output: path.join(__dirname, `still_${f}.png`) });
    console.log("ok", f);
  }
})().catch((e) => { console.error(e); process.exit(1); });
