#!/bin/bash
# uso: rs2.sh COMP f1 f2 ...
cd "$(dirname "$0")/../../projeto"
COMP=$1; shift
for f in "$@"; do
  npx remotion still src/dev/Captions.ts --public-dir="C:/Users/VINICI~1/AppData/Local/Temp/claude/cce6e87fd048478d/145eea66-5927-4e22-9ed3-92147fa00d32/scratchpad/cappub" $COMP --frame=$f --gl=angle --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe" ../analise/review/caps2/${COMP}_f$(printf %03d $f).png 2>&1 | grep -iE "error|ENOSPC" | head -3
done
