// Gera varios stills da composicao V1 com um unico bundle (verificacao, nao renderiza MP4).
// uso: node src/v/v1/stills.mjs <pastaSaida> 10 45 80 ...
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";

const [, , out, ...frames] = process.argv;
const entry = path.resolve("src/v/v1/index.ts");
const serveUrl = await bundle({ entryPoint: entry });
const browserExecutable = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const chromiumOptions = { gl: "angle" };
const composition = await selectComposition({ serveUrl, id: "V1", browserExecutable, chromiumOptions });
for (const f of frames) {
  const output = path.join(out, `still_${f}.png`);
  await renderStill({ serveUrl, composition, frame: Number(f), output, browserExecutable, chromiumOptions });
  console.log("ok", output);
}
