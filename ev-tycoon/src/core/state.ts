import { LOCATIONS, SAVE_KEY, SAVE_VERSION, STARTING_GEMS, VEHICLES } from './config';

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
  /** mekân kilitleri: id -> açık mı */
  locations: Record<string, boolean>;
  research: Record<string, number>; // id -> seviye
  claimElapsed: number;
  boostUntil: number; // epoch ms; ×2 gelir boostunun bitişi
  /** aktif haber olayı (yoksa null) */
  activeEvent: { id: string; until: number } | null;
  /** bir sonraki haber olayına kalan oyun-içi saniye */
  nextEventIn: number;
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
  const locations: Record<string, boolean> = {};
  for (const l of LOCATIONS) locations[l.id] = l.unlockCost === 0;
  return {
    version: SAVE_VERSION,
    money: 0,
    gems: STARTING_GEMS,
    rp: 0,
    lines,
    locations,
    research: {},
    claimElapsed: 0,
    boostUntil: 0,
    activeEvent: null,
    nextEventIn: 180, // ilk olay ~3. dakikada

    achievements: [],
    stats: { totalEarned: 0, totalProduced: 0, totalSold: 0 },
    settings: { lang, sound: true },
    lastSeen: Date.now(),
    createdAt: Date.now(),
  };
}

// Sıfırlama sonrası beforeunload/visibilitychange kayıtları eski durumu
// geri yazmasın diye kalıcı kapatma bayrağı
let wiped = false;

export function saveGame(s: GameState): void {
  if (wiped) return;
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
    // İleride eklenen araçlar/mekânlar eski kayıtlarda eksik olabilir
    for (const v of VEHICLES) {
      if (!s.lines[v.id]) s.lines[v.id] = newLine(v.unlockCost === 0);
    }
    if (!s.locations) s.locations = {};
    for (const l of LOCATIONS) {
      if (s.locations[l.id] === undefined) s.locations[l.id] = l.unlockCost === 0;
    }
    // Personel tavanı eklenmeden önceki kayıtlar tavanın üstünde olabilir
    for (const v of VEHICLES) {
      const cap = LOCATIONS.find((l) => l.id === v.locationId)?.staffCap ?? 6;
      const line = s.lines[v.id];
      line.technicians = Math.min(line.technicians, cap);
      line.salesReps = Math.min(line.salesReps, cap);
    }
    // Eski kayıtlar için haber olayı alanları
    if (typeof s.nextEventIn !== 'number') s.nextEventIn = 180;
    if (s.activeEvent === undefined) s.activeEvent = null;
    if (s.activeEvent && Date.now() > s.activeEvent.until) {
      s.activeEvent = null;
      s.nextEventIn = Math.max(s.nextEventIn, 120);
    }
    // Oyun açılır açılmaz popup gelmesin
    s.nextEventIn = Math.max(s.nextEventIn, 60);
    return s;
  } catch {
    return null;
  }
}

export function resetGame(): void {
  wiped = true;
  localStorage.removeItem(SAVE_KEY);
}
