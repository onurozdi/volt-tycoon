// Oyun duraklatma bayrağı: haber popup'ı açıkken simülasyon ilerlemez.

let paused = false;

export function setPaused(v: boolean): void {
  paused = v;
}

export function isPaused(): boolean {
  return paused;
}
