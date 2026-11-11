import numpy as np, soundfile as sf
a,sr=sf.read("analise/captions/speech.wav")
def lpc_formants(x,order=14):
    x=x*np.hamming(len(x)); x=np.append(x[0],x[1:]-0.97*x[:-1])
    r=np.correlate(x,x,"full")[len(x)-1:len(x)+order]
    R=np.array([[r[abs(i-j)] for j in range(order)] for i in range(order)])
    ak=np.linalg.solve(R+1e-9*np.eye(order),r[1:order+1])
    roots=np.roots(np.concatenate(([1],-ak)))
    roots=[z for z in roots if np.imag(z)>0]
    fr=sorted([np.angle(z)*sr/(2*np.pi) for z in roots if -np.log(abs(z))*sr/np.pi<400])
    return [int(f) for f in fr if f>200][:4]
for name,t in [("Faz a",8.72),("Faz a2",8.68),("Cli i?",9.72),("que/ca",9.90),("que/ca",9.93),("que/ca",9.95),("Sai",10.07),("garanta",10.73),("garanta",10.76),("seu",11.30),("em",10.05)]:
    s=int((t-7.5)*sr); print(name,t,lpc_formants(a[s:s+int(.03*sr)]))
