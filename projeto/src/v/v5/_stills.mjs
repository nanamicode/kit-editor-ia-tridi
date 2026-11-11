// Uso (de projeto/): node src/v/v5/_stills.mjs 0 3 140 ...  -> analise/validados/v5/still_N.png
// Um unico bundle para varios quadros (so verificacao; nao renderiza video).
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";

const frames = process.argv.slice(2).map(Number);
const out = path.resolve(process.env.V5OUT || "../analise/validados/v5/r2");
// publicDir so com os assets do v5 (evita copiar o public inteiro para o temp)
const serveUrl = await bundle({ entryPoint: path.resolve("src/v/v5/index.ts"), publicDir: process.env.V5PUB || undefined, enableCaching: !process.env.V5NOCACHE });
const browserExecutable = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const chromiumOptions = { gl: "angle" };
const composition = await selectComposition({ serveUrl, id: "V5", browserExecutable, chromiumOptions });
for (const f of frames) {
  await renderStill({
    serveUrl,
    composition,
    frame: f,
    output: path.join(out, `still_${f}.${process.env.V5JPG ? "jpg" : "png"}`),
    imageFormat: process.env.V5JPG ? "jpeg" : "png",
    browserExecutable,
    chromiumOptions,
  });
  console.log("ok", f);
}
