#!/bin/bash
# uso: rs.sh f1 f2 ...  -> rebundle (publico leve, sem .map) + stills BRoll_fNNN.jpg
SP="C:/Users/VINICI~1/AppData/Local/Temp/claude/cce6e87fd048478d/145eea66-5927-4e22-9ed3-92147fa00d32/scratchpad"
REV="$(cd "$(dirname "$0")" && pwd)"
rm -rf "$SP/bundle"
cd "$REV/../../projeto"
npx remotion bundle src/dev/BRoll.ts --public-dir="$SP/pub" --out-dir="$SP/bundle" 2>&1 | grep -iE "error|fail" | head -5
find "$SP/bundle" -name "*.map" ! -name "bundle.js.map" -delete
cd "$REV"
node stills.cjs "$SP/bundle" BRoll BRoll "$@" 2>&1 | grep -vE "^ok" | head -10
