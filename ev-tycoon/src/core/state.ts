import { SAVE_KEY, SAVE_VERSION, STARTING_GEMS, VEHICLES } from './config';

export interface LineState {
  unlocked: boolean;
  stock: number;
  producing: boolean; // manuel üretim devam ediyor
  prodElapsed: number; // saniye
  selling: boolean; // manuel satış devam ediyor
  sellElapsed: number;
  technicians: number;
  salesReps: number;
  prodManager: boolean;
  salesManager: boolean;
  totalSold: number;
  totalProduced: number;
}

export interface GameState {
  version: number;
  money: number;
  gems: number;
  rp: number; // research points
  lines: Record<string, LineState>;
  research: Record<string, number>; // id -> seviye
  claimElapsed: number;
  boostUntil: number; // epoch ms; ×2 gelir boostunun bitişi
  achievements: string[];
  stats: { totalEarned: number; totalProduced: number; totalSold: number };
  settings: { lang: 'en' | 'tr'; sound: boolean };
  lastSeen: number; // epoch ms
  createdAt: number;
}

export function newLine(unlocked: boolean): LineState {
  return {
    unlocked,
    stock: 0,
    producing: false,
    prodElapsed: 0,
    selling: false,
    sellElapsed: 0,
    technicians: 0,
    salesReps: 0,
    prodManager: false,
    salesManager: false,
    totalSold: 0,
    totalProduced: 0,
  };
}

export function newGame(lang: 'en' | 'tr'): GameState {
  const lines: Record<string, LineState> = {};
  for (const v of VEHICLES) lines[v.id] = newLine(v.unlockCost === 0);
  return {
    version: SAVE_VERSION,
    money: 0,
    gems: STARTING_GEMS,
    rp: 0,
    lines,
    research: {},
    claimElapsed: 0,
    boostUntil: 0,
    achievements: [],
    stats: { totalEarned: 0, totalProduced: 0, totalSold: 0 },
    settings: { lang, sound: true },
    lastSeen: Date.now(),
    createdAt: Date.now(),
  };
}

export function saveGame(s: GameState): void {
  s.lastSeen = Date.now();
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(s));
  } catch {
    // depolama dolu/engelli — sessizce geç
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as GameState;
    if (typeof s.version !== 'number' || !s.lines) return null;
    // İleride eklenen araçlar eski kayıtlarda eksik olabilir
    for (const v of VEHICLES) {
      if (!s.lines[v.id]) s.lines[v.id] = newLine(v.unlockCost === 0);
    }
    return s;
  } catch {
    return null;
  }
}

export function resetGame(): void {
  localStorage.removeItem(SAVE_KEY);
}
