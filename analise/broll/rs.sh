#!/bin/bash
# uso: rs.sh f1 f2 ... -> rebundle + stills (0.5x) em analise/review/broll3
HERE="$(cd "$(dirname "$0")" && pwd)"
SP="C:/Users/VINICI~1/AppData/Local/Temp/claude/cce6e87fd048478d/145eea66-5927-4e22-9ed3-92147fa00d32/scratchpad/brb"
mkdir -p "$SP"
rm -rf "$SP/bundle"
cd "$HERE/../../projeto"
npx remotion bundle src/dev/BRoll.ts --public-dir="$HERE/../seal/public" --out-dir="$SP/bundle" 2>&1 | grep -iE "error|fail|ENOSPC" | head -5
cd "$HERE"
node stills.cjs "$SP/bundle" ${COMP:-BRoll} "$HERE/../review/broll3" "$@" 2>&1 | grep -vE "^ok" | head -10
