#!/usr/bin/env bash
# Kit Edicao IA - instalador (macOS / Linux)
# Uso: bash instalar.sh            |  bash instalar.sh --skills-globais
set -e
KIT="$(cd "$(dirname "$0")" && pwd)"
falta=()
command -v node   >/dev/null || falta+=("Node.js 20+ (https://nodejs.org)")
command -v python3 >/dev/null || falta+=("Python 3.10+")
command -v ffmpeg >/dev/null || falta+=("ffmpeg (brew install ffmpeg | apt install ffmpeg)")
if [ ${#falta[@]} -gt 0 ]; then printf 'Falta instalar:\n'; printf '  - %s\n' "${falta[@]}"; exit 1; fi

echo "== npm (template) =="
cd "$KIT/template"
[ -L node_modules ] && rm node_modules
npm install
echo "== pip =="
python3 -m pip install -r "$KIT/scripts/requirements.txt"
if [ ! -f "$KIT/modelos/rvm_mobilenetv3_fp32.onnx" ]; then
  mkdir -p "$KIT/modelos"
  curl -L -o "$KIT/modelos/rvm_mobilenetv3_fp32.onnx" \
    https://github.com/PeterL1n/RobustVideoMatting/releases/download/v1.0.0/rvm_mobilenetv3_fp32.onnx
fi
if [ "$1" = "--skills-globais" ]; then
  mkdir -p "$HOME/.claude/skills" && cp -R "$KIT/.claude/skills/." "$HOME/.claude/skills/"
fi
npx tsc --noEmit && echo "Typecheck OK"
echo "Pronto. Abra o Claude Code na pasta do kit e diga: 'use a skill editor-criativo para editar <video>'."
