import subprocess, sys, os
# uso: python sheet.py <dir> <out.jpg> f1 f2 ...
d, out, *frames = sys.argv[1:]
ins = []
fc = ''
W, H = 432, 768
for i, f in enumerate(frames):
    ins += ['-i', os.path.join(d, f'still_{f}.jpg')]
    fc += f"[{i}]scale={W}:{H},drawtext=text=f{f}:x=10:y=10:fontsize=40:fontcolor=red:fontfile='C\\:/Windows/Fonts/arial.ttf'[v{i}];"
fc += ''.join(f'[v{i}]' for i in range(len(frames)))
fc += f'xstack=inputs={len(frames)}:layout=' + '|'.join(f'{(i%4)*W}_{(i//4)*H}' for i in range(len(frames)))
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error'] + ins + ['-filter_complex', fc, os.path.join(d, out)], check=True)
print('ok', out)
