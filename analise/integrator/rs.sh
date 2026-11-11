#!/bin/bash
# uso: rs.sh f1 f2 ... -> rebundle leve (junction p/ public) + stills Criativo_fNNN.jpg em analise/review/
SP="C:/Users/VINICI~1/AppData/Local/Temp/claude/cce6e87fd048478d/3327bc43-165b-4a4b-b1b1-90111da6eb0f/scratchpad/ib"
HERE="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$HERE/../review" "$SP/pub"
if [ "$REBUNDLE" != "0" ]; then
rm -rf "$SP/bundle"
cd "$HERE/../../projeto"
npx remotion bundle src/index.ts --public-dir="$SP/pub" --out-dir="$SP/bundle" 2>&1 | grep -iE "error|fail" | head -5
rm -rf "$SP/bundle/public"
powershell.exe -NoProfile -Command "New-Item -ItemType Junction -Path '$(cygpath -w "$SP/bundle/public")' -Target '$(cygpath -w "$HERE/../../projeto/public")' | Out-Null"
fi
cd "$HERE"
node stills.cjs "$SP/bundle" Criativo "$HERE/../review" "$@" 2>&1 | grep -vE "^ok" | head -10
