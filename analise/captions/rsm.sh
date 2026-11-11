#!/bin/bash
# uso: rsp.sh <comp> f1 f2 ...  -> bundle leve (junction p/ public) + stills em analise/review/caps3/
SP="C:/Users/VINICI~1/AppData/Local/Temp/claude/cce6e87fd048478d/3327bc43-165b-4a4b-b1b1-90111da6eb0f/scratchpad/cmb"
HERE="$(cd "$(dirname "$0")" && pwd)"
COMP="$1"; shift
mkdir -p "$HERE/../review/caps3" "$SP/pub"
rm -rf "$SP/bundle"
cd "$HERE/../../projeto"
npx remotion bundle src/dev/Captions.ts --public-dir="$SP/pub" --out-dir="$SP/bundle" 2>&1 | grep -iE "error|fail" | head -5
rm -rf "$SP/bundle/public"
powershell.exe -NoProfile -Command "New-Item -ItemType Junction -Path '$(cygpath -w "$SP/bundle/public")' -Target '$(cygpath -w "$HERE/../../projeto/public")' | Out-Null"
cd "$HERE/../presenter"
node stills.cjs "$SP/bundle" "$COMP" "$HERE/../review/caps3" "$@" 2>&1 | grep -vE "^ok" | head -10
