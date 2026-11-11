#!/bin/bash
# uso: rs2.sh <comp> f1 f2 ... -> rebundle leve + stills (SCALE=0.5) em analise/review/broll4
SP="C:/Users/VINICI~1/AppData/Local/Temp/claude/cce6e87fd048478d/3327bc43-165b-4a4b-b1b1-90111da6eb0f/scratchpad/bl"
HERE="$(cd "$(dirname "$0")" && pwd)"
COMP="$1"; shift
if [ "$REBUNDLE" != "0" ]; then
rm -rf "$SP/bundle"
cd "$HERE/../../projeto"
npx remotion bundle src/dev/BRoll.ts --public-dir="$SP/pub" --out-dir="$SP/bundle" 2>&1 | grep -iE "error|fail" | head -5
find "$SP/bundle" -name "*.map" ! -name "bundle.js.map" -delete
fi
cd "$HERE"
node "$SP/stills.cjs" "$SP/bundle" "$COMP" "$HERE/../review/broll4" "$@" 2>&1 | grep -vE "^ok" | head -10
