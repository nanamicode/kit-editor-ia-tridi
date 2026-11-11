"""Masteriza o audio de um MP4 renderizado pelo Remotion: limitador suave nos picos de bateria/TUM
(teto -5 dBFS, poucos dB de reducao so nos transientes) + loudnorm LINEAR em 2 passadas
(alvo -14 LUFS integrado, pico verdadeiro -2,2 dBTP antes do AAC (< -1 dBTP depois)). O modo linear preserva a diferenca
abafada -> cheia do mix (o modo dinamico achataria). Video copiado sem reencode.
uso: python master_audio.py <entrada.mp4> <saida.mp4>
"""
import json
import re
import subprocess
import sys

ent, sai = sys.argv[1], sys.argv[2]
ALVO = "I=-14:TP=-2.2:LRA=11"  # margem: o encoder AAC sobe o pico ~0,5-1 dB
LIM = "aresample=192000,alimiter=limit=0.5:attack=0.5:release=40:level=false,aresample=48000"
p1 = subprocess.run(
    ["ffmpeg", "-hide_banner", "-nostats", "-i", ent, "-af", f"{LIM},loudnorm={ALVO}:print_format=json", "-f", "null", "-"],
    capture_output=True, text=True,
)
m = json.loads(re.findall(r"\{[^{}]*\}", p1.stderr)[-1])
print("passada 1:", {k: m[k] for k in ("input_i", "input_tp", "input_lra", "input_thresh")})
filtro = (
    f"{LIM},loudnorm={ALVO}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
    f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true:print_format=json,aresample=48000"
)
p2 = subprocess.run(
    ["ffmpeg", "-hide_banner", "-nostats", "-y", "-i", ent, "-c:v", "copy", "-af", filtro, "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", sai],
    capture_output=True, text=True,
)
m2 = json.loads(re.findall(r"\{[^{}]*\}", p2.stderr)[-1])
print("passada 2:", {k: m2[k] for k in ("output_i", "output_tp", "normalization_type")})
