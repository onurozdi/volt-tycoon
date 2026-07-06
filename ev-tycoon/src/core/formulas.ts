import {
  BOOST_MULT, CLAIM_DURATION, FX, RESEARCH, STAFF_COST_GROWTH, STAFF_SMAX, STAFF_TAU, VEHICLES,
} from './config';
import type { VehicleDef } from './config';
import type { GameState, LineState } from './state';

export function vehicleDef(id: string): VehicleDef {
  const v = VEHICLES.find((x) => x.id === id);
  if (!v) throw new Error(`unknown vehicle ${id}`);
  return v;
}

/** Azalan getirili personel hız çarpanı: 1 → SMAX arası */
export function staffSpeed(n: number): number {
  return 1 + (STAFF_SMAX - 1) * (1 - Math.exp(-n / STAFF_TAU));
}

export function staffCost(base: number, owned: number): number {
  return Math.ceil(base * Math.pow(STAFF_COST_GROWTH, owned));
}

export function researchLevel(s: GameState, id: string): number {
  return s.research[id] ?? 0;
}

export function prodInterval(s: GameState, v: VehicleDef, line: LineState): number {
  const assembly = Math.pow(FX.assemblyTimeMult, researchLevel(s, 'assembly'));
  return (v.baseProdTime * assembly) / staffSpeed(line.technicians);
}

export function sellInterval(_s: GameState, v: VehicleDef, line: LineState): number {
  // _s: ileride satış hızını etkileyen research eklenirse kullanılacak
  return v.baseSellTime / staffSpeed(line.salesReps);
}

export function sellPrice(s: GameState, v: VehicleDef): number {
  const marketing = Math.pow(FX.marketingPriceMult, researchLevel(s, 'marketing'));
  const boost = Date.now() < s.boostUntil ? BOOST_MULT : 1;
  return Math.round(v.basePrice * marketing * boost);
}

/** Boost'suz taban fiyat (offline hesap ve UI için) */
export function sellPriceNoBoost(s: GameState, v: VehicleDef): number {
  const marketing = Math.pow(FX.marketingPriceMult, researchLevel(s, 'marketing'));
  return Math.round(v.basePrice * marketing);
}

export function stockCap(s: GameState, v: VehicleDef): number {
  const mult = Math.pow(FX.warehouseCapMult, researchLevel(s, 'warehouse'));
  return Math.floor(v.baseStockCap * mult);
}

export function batchSize(s: GameState): number {
  return 1 + (researchLevel(s, 'batch') >= 1 ? FX.batchExtra : 0);
}

export function claimDuration(s: GameState): number {
  const mult = researchLevel(s, 'quickclaim') >= 1 ? FX.quickClaimMult : 1;
  return CLAIM_DURATION * mult;
}

export function offlineCapSeconds(s: GameState): number {
  return FX.offlineHours[researchLevel(s, 'offline')] * 3600;
}

export function researchCost(s: GameState, id: string): number | null {
  const def = RESEARCH.find((r) => r.id === id);
  if (!def) return null;
  const lvl = researchLevel(s, id);
  if (lvl >= def.maxLevel) return null;
  return def.costs[lvl];
}

/** 1234567 → "1.23M" gibi kısa sayı gösterimi */
export function fmt(n: number): string {
  if (n < 0) return '-' + fmt(-n);
  if (n < 1000) return String(Math.floor(n));
  const units = ['K', 'M', 'B', 'T', 'q', 'Q'];
  let u = -1;
  let x = n;
  while (x >= 1000 && u < units.length - 1) {
    x /= 1000;
    u++;
  }
  const digits = x >= 100 ? 0 : x >= 10 ? 1 : 2;
  return x.toFixed(digits) + units[u];
}

export function fmtMoney(n: number): string {
  return '$' + fmt(n);
}

export function fmtTime(sec: number): string {
  sec = Math.max(0, Math.ceil(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
