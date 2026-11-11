import { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";

// Imagens usadas dentro de <svg><image/></svg> (patterns, masks) nao sao aguardadas
// pelo Remotion. Este hook segura o render ate todas carregarem e decodificarem.
const cache = new Map<string, Promise<void>>();

const load = (src: string) => {
  let p = cache.get(src);
  if (!p) {
    p = new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        img.decode().then(() => resolve(), () => resolve());
      };
      img.onerror = () => resolve();
      img.src = src;
    });
    cache.set(src, p);
  }
  return p;
};

export const useAssetsLoaded = (srcs: readonly string[]) => {
  const key = srcs.join("|");
  const [handle] = useState(() => delayRender(`tridi assets: ${key}`));
  useEffect(() => {
    let alive = true;
    Promise.all(key.split("|").map(load)).then(() => {
      if (alive) continueRender(handle);
    });
    return () => {
      alive = false;
    };
  }, [key, handle]);
};
