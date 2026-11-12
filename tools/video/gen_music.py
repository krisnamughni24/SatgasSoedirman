import json, wave, numpy as np
from scipy.signal import butter, lfilter, fftconvolve

c = json.load(open('cues.json'))
SR = 44100
dur = c['frames'] / c['fps'] + 1.0
N = int(SR * dur)
t = np.arange(N) / SR
rng = np.random.default_rng(7)
hits = [x[0] for x in c['cues'] if x[0] is not None and x[1] == 'hit']
words = [x[0] for x in c['cues'] if x[1] == 'word']
beats = [x[0] for x in c['cues'] if x[1] == 'beat']
tTitle = hits[0]
tFinal = hits[-2]
tEnd = [x[0] for x in c['cues'] if x[1] == 'end'][0]

def lp(x, f, o=2): b, a = butter(o, f / (SR / 2)); return lfilter(b, a, x)
def hp(x, f, o=2): b, a = butter(o, f / (SR / 2), 'high'); return lfilter(b, a, x)
def note(m): return 440 * 2 ** ((m - 69) / 12)
def saw(f, tt, det=0):
    out = 0
    for d in ([-det, 0, det] if det else [0]):
        ph = (tt * f * (1 + d)) % 1.0
        out = out + (2 * ph - 1)
    return out / (3 if det else 1)
def env_ar(n, a, r):
    e = np.ones(n); na = int(a * SR); nr = int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e
def add(buf, start, sig, gain=1.0):
    s = int(start * SR)
    if s >= N: return
    e = min(N, s + len(sig)); buf[s:e] += sig[:e - s] * gain

mix = np.zeros(N); verb_send = np.zeros(N)
BPM = 100; beat = 60 / BPM; bar = beat * 4; six = beat / 4
prog = [[38, 50, 53, 57], [34, 46, 50, 53], [41, 53, 57, 60], [36, 48, 52, 55]]  # Dm Bb F C

# 1. drone (whole piece, swelling)
dr = lp(saw(note(26), t, .003) + .6 * saw(note(38), t, .004), 260)
drone_env = np.clip(t / 6, 0, 1) * (0.55 + 0.45 * np.clip((t - tTitle) / 4, 0, 1))
drone_env *= np.where(t > tEnd - 1, np.clip((tEnd + 1 - t) / 2, 0, 1), 1)
mix += dr * drone_env * .12

# 2. pads: chord per bar after title, fuller in main
start = tTitle
k = 0
while start < tEnd:
    ch = prog[k % 4]
    if start >= tFinal - .1: ch = [38, 50, 57, 62, 66] if start > tFinal + 2 else [36, 48, 55, 60, 64]
    n = int((bar + .6) * SR); tt = np.arange(n) / SR
    s = sum(saw(note(m), tt, .006) for m in ch) / len(ch)
    s = lp(s, 1400 if start > tTitle + 4 else 700) * env_ar(n, .5, .7)
    add(mix, start, s, .16); add(verb_send, start, s, .12)
    start += bar; k += 1

# 3. ostinato 16ths (strings) after title
pat = [0, 2, 1, 2, 3, 2, 1, 2]
tt16 = np.arange(int(six * 1.6 * SR)) / SR
s = tTitle + bar; k = 0
while s < tEnd - .5:
    chord = prog[int((s - tTitle) / bar) % 4]
    m = chord[1 + pat[k % 8] % 3] + 12
    sig = lp(saw(note(m), tt16, .004), 2600) * np.exp(-tt16 * 9)
    acc = 1.0 if k % 4 == 0 else .7
    gain = .07 * acc * (1.25 if s > tFinal - 6 else 1)
    add(mix, s, sig, gain); add(verb_send, s, sig, .03)
    s += six; k += 1

# 4. drums
def taiko(big=1.0):
    n = int(1.2 * SR); tt = np.arange(n) / SR
    f = 52 + 70 * np.exp(-tt * 28)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 5.5)
    sk = lp(rng.standard_normal(n), 900) * np.exp(-tt * 30) * .5
    return (body + sk) * big
def snare():
    n = int(.4 * SR); tt = np.arange(n) / SR
    return hp(rng.standard_normal(n), 900) * np.exp(-tt * 18) * .6 + np.sin(2 * np.pi * 190 * tt) * np.exp(-tt * 25) * .4
TK = taiko(); SN = snare()
groove = {0: 1.0, 3: .6, 6: .75, 8: .9, 10: .55, 11: .6, 14: .8}
s = tTitle + bar; step = 0
while s < tEnd - 1.5:
    k = step % 16
    intensity = .55 if s < tTitle + 3 * bar else (1.0 if s > tFinal - 8 else .85)
    if k in groove: add(mix, s, TK, .42 * groove[k] * intensity); add(verb_send, s, TK, .1 * groove[k])
    if k in (4, 12) and s > tTitle + 2 * bar: add(mix, s, SN, .16 * intensity); add(verb_send, s, SN, .12)
    if s > tFinal - 6 and k % 2 == 1: add(mix, s, SN, .07)
    s += six; step += 1
# heartbeat in intro
for bt in np.arange(1.2, tTitle - .2, beat):
    add(mix, bt, taiko(.5), .3); add(mix, bt + .18, taiko(.35), .2)

# 5. impacts and whooshes
def impact(big):
    n = int(4.5 * SR); tt = np.arange(n) / SR
    boom = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-tt * 7)) / SR) * np.exp(-tt * 1.6)
    crash = hp(rng.standard_normal(n), 2500) * np.exp(-tt * 2.5) * .35
    tk = np.zeros(n); tj = taiko(1.2); tk[:len(tj)] = tj
    return (boom + crash + tk) * big
def whoosh(len_s=1.1):
    n = int(len_s * SR); tt = np.arange(n) / SR
    nz = rng.standard_normal(n); e = np.sin(np.pi * tt / len_s) ** 2
    return lp(hp(nz, 400), 3500) * e * .5
def riser(len_s):
    n = int(len_s * SR); tt = np.arange(n) / SR
    sw = np.sin(2 * np.pi * np.cumsum(200 + 1400 * (tt / len_s) ** 2) / SR) * .25
    nz = hp(rng.standard_normal(n), 1500) * (tt / len_s) ** 2 * .5
    return (sw + nz) * (tt / len_s) ** 1.5
big = {round(tTitle, 2), round(tFinal, 2), round(hits[-1], 2)}
for h in hits:
    g = 1.0 if round(h, 2) in big else .45
    add(mix, h, impact(1), .55 * g); add(verb_send, h, impact(1), .3 * g)
for w in words: add(mix, w - .35, whoosh(), .35)
add(mix, tTitle - 3.2, riser(3.2), .5)
add(mix, tFinal - 4.5, riser(4.5), .55)
add(mix, hits[-1] - 2.2, riser(2.2), .4)

# 6. brass-ish hits on finale chords
for kk, m in enumerate([38, 45, 50, 57, 62]):
    n = int(5 * SR); tt = np.arange(n) / SR
    s2 = lp(saw(note(m), tt, .005), 1800) * np.exp(-tt * .6) * env_ar(n, .02, 1.5)
    add(mix, hits[-1], s2, .1); add(verb_send, hits[-1], s2, .12)

# reverb
ir_n = int(2.8 * SR); ir_t = np.arange(ir_n) / SR
ir = rng.standard_normal(ir_n) * np.exp(-ir_t * 2.4); ir = lp(ir, 5000); ir /= np.abs(ir).sum() / 30
wet = fftconvolve(verb_send, ir)[:N]
out = mix + wet * .55
out = np.tanh(out * 1.3)
fade = np.clip(t / .5, 0, 1) * np.clip((dur - t) / 2.0, 0, 1)
out *= fade
out /= np.abs(out).max() * 1.08
st = np.stack([out, np.concatenate([np.zeros(int(.011 * SR)), out[:-int(.011 * SR)]])], 1)
w = wave.open('cine_music.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((st * 32767).astype(np.int16).tobytes()); w.close()
print('music', round(dur, 1), 's hits', len(hits), 'title', tTitle, 'final', tFinal)
