# Kit Edicao IA - instalador (Windows / PowerShell)
# Uso:  powershell -ExecutionPolicy Bypass -File .\instalar.ps1            (instala no projeto)
#       powershell -ExecutionPolicy Bypass -File .\instalar.ps1 -SkillsGlobais   (tambem copia as skills para ~/.claude/skills)
param([switch]$SkillsGlobais)

$ErrorActionPreference = "Stop"
$kit = Split-Path -Parent $MyInvocation.MyCommand.Path
$falta = @()

function Tem($cmd) { $null -ne (Get-Command $cmd -ErrorAction SilentlyContinue) }

Write-Host "== Verificando dependencias ==" -ForegroundColor Cyan
if (Tem node) { Write-Host ("node   " + (node --version)) } else { $falta += "Node.js 20+ (https://nodejs.org)" }
if (Tem python) { Write-Host ("python " + (python --version)) } else { $falta += "Python 3.10+ (https://python.org) - marque 'Add to PATH'" }
if (Tem ffmpeg) { Write-Host "ffmpeg ok" } else { $falta += "ffmpeg (winget install Gyan.FFmpeg)" }
$chrome = @("C:\Program Files\Google\Chrome\Application\chrome.exe",
            "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
            "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
if ($chrome) { Write-Host "chrome $chrome" } else { $falta += "Google Chrome (o Remotion usa para renderizar)" }

if ($falta.Count -gt 0) {
  Write-Host "`nFalta instalar:" -ForegroundColor Yellow
  $falta | ForEach-Object { Write-Host "  - $_" }
  Write-Host "Instale e rode este script de novo." -ForegroundColor Yellow
  exit 1
}

Write-Host "`n== Pacotes do template Remotion (npm) ==" -ForegroundColor Cyan
Push-Location "$kit\template"
if (Test-Path "node_modules") {
  $item = Get-Item "node_modules" -Force
  if ($item.LinkType) { Remove-Item "node_modules" -Force; }
}
npm install
Pop-Location

Write-Host "`n== Pacotes Python ==" -ForegroundColor Cyan
python -m pip install -r "$kit\scripts\requirements.txt"

if (-not (Test-Path "$kit\modelos\rvm_mobilenetv3_fp32.onnx")) {
  Write-Host "`n== Baixando modelo de recorte (RVM, 15 MB) ==" -ForegroundColor Cyan
  New-Item -ItemType Directory -Force "$kit\modelos" | Out-Null
  Invoke-WebRequest "https://github.com/PeterL1n/RobustVideoMatting/releases/download/v1.0.0/rvm_mobilenetv3_fp32.onnx" -OutFile "$kit\modelos\rvm_mobilenetv3_fp32.onnx"
}

if ($SkillsGlobais) {
  Write-Host "`n== Copiando skills para ~/.claude/skills ==" -ForegroundColor Cyan
  $dest = Join-Path $env:USERPROFILE ".claude\skills"
  New-Item -ItemType Directory -Force $dest | Out-Null
  Copy-Item "$kit\.claude\skills\*" $dest -Recurse -Force
}

Write-Host "`n== Teste rapido ==" -ForegroundColor Cyan
Push-Location "$kit\template"
npx tsc --noEmit
if ($LASTEXITCODE -eq 0) { Write-Host "Typecheck OK" -ForegroundColor Green }
Pop-Location

Write-Host "`nPronto. Abra o Claude Code na pasta do kit e diga: 'use a skill editor-criativo para editar <video>'." -ForegroundColor Green
Write-Host "Dica: se o caminho da pasta for muito longo, mova o kit para algo curto como C:\edicao (evita erro do Chrome)."
