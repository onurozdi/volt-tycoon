// Küçük WebAudio ses efektleri — dosya yok, sentezlenir.

let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(v: boolean): void {
  enabled = v;
}

function ac(): AudioContext | null {
  if (!enabled) return null;
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function blip(freq: number, dur: number, type: OscillatorType, gain = 0.06): void {
  const a = ac();
  if (!a) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(gain, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
  o.connect(g).connect(a.destination);
  o.start();
  o.stop(a.currentTime + dur);
}

export const sfx = {
  click(): void {
    blip(520, 0.07, 'square', 0.04);
  },
  produce(): void {
    blip(340, 0.1, 'triangle', 0.05);
  },
  sale(): void {
    blip(660, 0.08, 'sine', 0.06);
    setTimeout(() => blip(880, 0.1, 'sine', 0.05), 60);
  },
  buy(): void {
    blip(440, 0.08, 'triangle', 0.06);
    setTimeout(() => blip(587, 0.12, 'triangle', 0.05), 70);
  },
  achievement(): void {
    blip(523, 0.1, 'sine', 0.06);
    setTimeout(() => blip(659, 0.1, 'sine', 0.06), 90);
    setTimeout(() => blip(784, 0.18, 'sine', 0.06), 180);
  },
  error(): void {
    blip(180, 0.15, 'sawtooth', 0.04);
  },
  news(): void {
    blip(392, 0.12, 'sine', 0.05);
    setTimeout(() => blip(523, 0.16, 'sine', 0.05), 110);
  },
};
