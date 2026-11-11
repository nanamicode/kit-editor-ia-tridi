// stills do V3 com public minimo (so v/v3, via juncao) para nao lotar o disco.
// uso: node stills_v3.cjs <frame1> <frame2> ...  -> analise/validados/v3/r2/still_N.png
const { createRequire } = require("module");
const path = require("path");
const fs = require("fs");
const os = require("os");
const PROJ = "C:/Users/Vinicius Prado/Downloads/Kit Editor IA Tridi/projeto";
const OUT = "C:/Users/Vinicius Prado/Downloads/Kit Editor IA Tridi/analise/validados/v3/r2";
const req = createRequire(path.join(PROJ, "package.json"));
const { bundle } = req("@remotion/bundler");
const { renderStill, selectComposition } = req("@remotion/renderer");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
(async () => {
  const frames = process.argv.slice(2);
  const serveUrl = await bundle({
    entryPoint: path.join(PROJ, "src/v/v3/index.ts"),
    publicDir: path.join(OUT, "_tools/pub"),
    rootDir: PROJ,
  });
  try {
    const opts = { browserExecutable: CHROME, chromiumOptions: { gl: "angle" } };
    const composition = await selectComposition({ serveUrl, id: "V3", ...opts });
    for (const fr of frames) {
      await renderStill({ serveUrl, composition, frame: Number(fr), output: path.join(OUT, `still_${fr}.jpg`), imageFormat: "jpeg", jpegQuality: 90, ...opts });
      console.log("ok", fr);
    }
  } finally {
    // apaga so o bundle temporario criado por este script
    const tmp = path.resolve(os.tmpdir());
    const dir = path.resolve(serveUrl);
    // seguranca: se a copia do public for link/juncao, NAO apaga (evita
    // seguir a juncao ate os assets reais)
    let link = true;
    const pv = path.join(dir, "public", "v", "v3");
    try {
      if (fs.lstatSync(pv).isSymbolicLink()) {
        // remove so o link (nao segue); depois confere que sumiu
        try { fs.unlinkSync(pv); } catch (e) { fs.rmdirSync(pv); }
      }
      link = fs.existsSync(pv);
    } catch (e) {
      link = true;
    }
    if (!link && dir.startsWith(tmp) && path.basename(dir).startsWith("remotion-webpack-bundle-")) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log("bundle temporario removido");
    } else {
      console.log("bundle mantido:", dir);
    }
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
