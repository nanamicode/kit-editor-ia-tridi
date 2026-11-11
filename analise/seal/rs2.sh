#!/bin/bash
# uso: rs2.sh <comp> f1 f2 ...  -> rebundle leve + junction p/ public real + stills em analise/review/seal/st2/
SP="C:/Users/VINICI~1/AppData/Local/Temp/claude/cce6e87fd048478d/3327bc43-165b-4a4b-b1b1-90111da6eb0f/scratchpad/sb2"
HERE="$(cd "$(dirname "$0")" && pwd)"
COMP="$1"; shift
OUT="C:/Users/VINICI~1/AppData/Local/Temp/claude/cce6e87fd048478d/3327bc43-165b-4a4b-b1b1-90111da6eb0f/scratchpad/st2"
mkdir -p "$OUT" "$SP/pub"
rm -rf "$SP/bundle"
cd "$HERE/../../projeto"
npx remotion bundle src/dev/Seal3D.ts --public-dir="$SP/pub" --out-dir="$SP/bundle" 2>&1 | grep -iE "error|fail" | head -5
rm -rf "$SP/bundle/public"
powershell.exe -NoProfile -Command "New-Item -ItemType Junction -Path '$(cygpath -w "$SP/bundle/public")' -Target '$(cygpath -w "$HERE/../../projeto/public")' | Out-Null"
cd "$HERE/../presenter"
node stills.cjs "$SP/bundle" "$COMP" "$OUT" "$@" 2>&1 | grep -vE "^ok" | head -10
