import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
import path from "node:path";
const root = "C:/Users/Vinicius Prado/Downloads/Kit Editor IA Tridi/projeto";
const out = "C:/Users/Vinicius Prado/Downloads/Kit Editor IA Tridi/analise/validados/v4/r2b";
const frames = process.argv.slice(2).map(Number);
const serveUrl = await bundle({ entryPoint: path.join(root, "src/v/v4/index.ts"), publicDir: process.env.V4_PUB, enableCaching: false });
const browserExecutable = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const chromiumOptions = { gl: "angle" };
const composition = await selectComposition({ serveUrl, id: "V4", browserExecutable, chromiumOptions });
console.log("dur", composition.durationInFrames, composition.fps);
for (const f of frames) {
  await renderStill({ composition, serveUrl, frame: f, output: `${out}/s_${f}.jpg`, imageFormat: "jpeg", jpegQuality: 70, browserExecutable, chromiumOptions });
  console.log("ok", f);
}
