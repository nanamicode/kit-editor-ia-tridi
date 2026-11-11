// uso: node crstills.cjs <bundleDir> f1 f2 ...  -> Criativo_fNNN.png (um browser)
const path = require("path");
const { createRequire } = require("module");
const PROJ = path.resolve(__dirname, "../../projeto");
const req = createRequire(path.join(PROJ, "package.json"));
const { openBrowser, selectComposition, renderStill } = req("@remotion/renderer");
(async () => {
  const [serveUrl, ...frames] = process.argv.slice(2);
  const chromiumOptions = { gl: "angle" };
  const browser = await openBrowser("chrome", {
    browserExecutable: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    chromiumOptions,
  });
  const composition = await selectComposition({ serveUrl, id: "Criativo", puppeteerInstance: browser, chromiumOptions });
  for (const f of frames) {
    const n = String(f).padStart(3, "0");
    try {
      await renderStill({
        composition, serveUrl, frame: Number(f),
        output: path.join(__dirname, `Criativo_f${n}.png`),
        imageFormat: "png",
        puppeteerInstance: browser, chromiumOptions, overwrite: true,
        timeoutInMilliseconds: 120000,
      });
      console.log("ok", f);
    } catch (e) { console.log("FAIL", f, String(e.message).slice(0, 200)); }
  }
  await browser.close({ silent: true });
})().catch((e) => { console.error("ERR", e.stack); process.exit(1); });
