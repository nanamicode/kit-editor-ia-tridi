#!/bin/bash
# uso: r.sh <frames> <outdir> [scale]
cd "C:/Users/Vinicius Prado/AppData/Local/Claude-Data/claude_pzs8sxrjxfjjc/scratch-workspaces/cbcefd08-3c72-4ec7-af15-90a5e393045f/1fb5fd07-2315-4f23-9191-6e0300909064/scratch-2026-11-09-db7476/projeto"
rm -rf "../analise/review/seal/$2"
npx remotion render src/dev/Seal3D.ts Seal3D --sequence --image-format=jpeg --jpeg-quality=85 --scale=${3:-0.5} --frames=$1 --public-dir=../analise/seal/public --gl=angle --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe" "../analise/review/seal/$2" 2>&1 | tail -2
