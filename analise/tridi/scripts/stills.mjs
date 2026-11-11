// Renderiza varios stills da SacolaLisa reaproveitando um bundle so.
// uso (de dentro de projeto/): node ../analise/tridi/scripts/stills.mjs <pasta_saida> <f1,f2,...> [escala]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";

const [, , out, lista, escala = "1"] = process.argv;
const frames = lista.split(",").map((s) => Number(s));
fs.mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const browserExecutable = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const chromiumOptions = { gl: "angle" };
const composition = await selectComposition({ serveUrl, id: "SacolaLisa", browserExecutable, chromiumOptions });
for (const frame of frames) {
  const f = Math.min(frame, composition.durationInFrames - 1);
  const output = path.join(out, `f${String(f).padStart(3, "0")}.png`);
  await renderStill({ composition, serveUrl, frame: f, output, browserExecutable, chromiumOptions, scale: Number(escala), imageFormat: "png" });
  console.log("ok", output);
}
