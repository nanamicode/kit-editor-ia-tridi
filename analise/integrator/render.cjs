// uso: node render.cjs <bundleDir> <out.mp4> [scale] [concurrency]
const path = require("path");
const { createRequire } = require("module");
const PROJ = path.resolve(__dirname, "../../projeto");
const req = createRequire(path.join(PROJ, "package.json"));
const { selectComposition, renderMedia } = req("@remotion/renderer");
(async () => {
  const [serveUrl, out, scale = "0.5", conc = "4"] = process.argv.slice(2);
  const chromiumOptions = { gl: "angle" };
  const browserExecutable = "C:/Program Files/Google/Chrome/Application/chrome.exe";
  const composition = await selectComposition({ serveUrl, id: "Criativo", browserExecutable, chromiumOptions });
  let last = -1;
  await renderMedia({
    composition, serveUrl, codec: "h264", outputLocation: out, scale: Number(scale),
    concurrency: Number(conc), browserExecutable, chromiumOptions, overwrite: true,
    imageFormat: "jpeg", jpegQuality: 85, timeoutInMilliseconds: 180000,
    onProgress: (p) => { const q = Math.floor(p.progress * 10); if (q !== last) { last = q; console.log("progress", (p.progress * 100).toFixed(0)); } },
  });
  console.log("DONE", out);
})().catch((e) => { console.error("ERR", e.stack); process.exit(1); });
