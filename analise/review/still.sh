#!/bin/bash
# uso: still.sh N [N...]   -> ../analise/review/BRoll_fNNN.jpg  (sequencial, jpeg leve)
cd "$(dirname "$0")/../../projeto"
for n in "$@"; do
  p=$(printf "%03d" $n)
  npx remotion still src/dev/BRoll.ts BRoll --frame=$n --image-format=jpeg --jpeg-quality=88 --gl=angle --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe" ../analise/review/BRoll_f$p.jpg 2>&1 | grep -iE "^.*(error|exception|fail)" | grep -v "persistent cache" | head -3
done
