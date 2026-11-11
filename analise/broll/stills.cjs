// uso: node stills.cjs <bundleDir> <comp> <outDir> f1 f2 ...   (um browser so, jpeg)
const path = require("path");
const { createRequire } = require("module");
const PROJ = path.resolve(__dirname, "../../projeto");
const req = createRequire(path.join(PROJ, "package.json"));
const { openBrowser, selectComposition, renderStill } = req("@remotion/renderer");
(async () => {
  const [serveUrl, id, outDir, ...frames] = process.argv.slice(2);
  const chromiumOptions = { gl: "angle" };
  const browser = await openBrowser("chrome", {
    browserExecutable: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    chromiumOptions,
  });
  const composition = await selectComposition({ serveUrl, id, puppeteerInstance: browser, chromiumOptions });
  for (const f of frames) {
    const n = String(f).padStart(3, "0");
    await renderStill({
      composition, serveUrl, frame: Number(f),
      output: path.join(outDir, `${id}_f${n}.jpg`),
      imageFormat: "jpeg", jpegQuality: 88, scale: Number(process.env.SCALE || 0.5),
      puppeteerInstance: browser, chromiumOptions, overwrite: true, timeoutInMilliseconds: 120000,
    });
    console.log("ok", f);
  }
  await browser.close({ silent: true });
})().catch((e) => { console.error("ERR", e.stack); process.exit(1); });
