import {
  BOOST_MULT, CLAIM_DURATION, CLAIM_REWARD, FX, LOCATIONS, NEWS_EVENTS, OVERSTAFF_GROWTH,
  RESEARCH, STAFF_COST_GROWTH, STAFF_SMAX, STAFF_TAU, VEHICLES,
} from './config';
import type { EventKind, ResearchFx, VehicleDef } from './config';
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

/**
 * Personel maliyeti — iki rejim:
 *  - aracın kendi tesisinin tavanına kadar: ×1,30 (normal kadro)
 *  - üzeri ("uzman kadro", yeni tesislerin açtığı slotlar): ek ×1,75/kişi.
 * Böylece eski araca dönüş orta oyunda kısa bir köprü olur ama hızla
 * pahalanır; oyuncu pahalı yeni araçlara geri döner.
 */
export function staffCost(base: number, owned: number, homeCap: number): number {
  const normal = Math.min(owned, homeCap);
  const over = Math.max(0, owned - homeCap);
  return Math.ceil(base * Math.pow(STAFF_COST_GROWTH, normal) * Math.pow(OVERSTAFF_GROWTH, over));
}

/** Aracın kendi tesisinin tavanı (uzman kadro eşiği) */
export function homeCapFor(v: VehicleDef): number {
  return LOCATIONS.find((l) => l.id === v.locationId)?.staffCap ?? 6;
}

/**
 * Araç başına, rol başına personel tavanı. Açık olan EN BÜYÜK tesisin
 * tavanı tüm araçlara uygulanır — yeni tesis açıldıkça eski araçların
 * kadrosu da büyüyebilir, eski hatlar önemsizleşmez.
 */
export function staffCapFor(s: GameState): number {
  let cap = 6;
  for (const l of LOCATIONS) {
    if (s.locations[l.id] && l.staffCap > cap) cap = l.staffCap;
  }
  return cap;
}

export function researchLevel(s: GameState, id: string): number {
  return s.research[id] ?? 0;
}

/** Çarpımsal research etkilerinin bileşkesi (val^seviye çarpımı) */
function rMult(s: GameState, fx: ResearchFx): number {
  let m = 1;
  for (const r of RESEARCH) {
    if (r.fx !== fx) continue;
    const lvl = researchLevel(s, r.id);
    if (lvl > 0) m *= Math.pow(r.val, lvl);
  }
  return m;
}

/** Toplamsal research etkilerinin bileşkesi (val × seviye toplamı) */
function rAdd(s: GameState, fx: ResearchFx): number {
  let a = 0;
  for (const r of RESEARCH) {
    if (r.fx !== fx) continue;
    a += r.val * researchLevel(s, r.id);
  }
  return a;
}

/** Aktif haber olayının bu araç + etki türü için çarpanı (yoksa 1) */
export function eventMult(s: GameState, kind: EventKind, vehicleId: string): number {
  const ev = s.activeEvent;
  if (!ev || Date.now() > ev.until) return 1;
  const def = NEWS_EVENTS.find((e) => e.id === ev.id);
  if (!def || def.kind !== kind) return 1;
  if (def.vehicleId !== null && def.vehicleId !== vehicleId) return 1;
  return def.mult;
}

export function prodInterval(s: GameState, v: VehicleDef, line: LineState): number {
  return (v.baseProdTime * rMult(s, 'prodTime')) / staffSpeed(line.technicians) / eventMult(s, 'prodSpeed', v.id);
}

export function sellInterval(s: GameState, v: VehicleDef, line: LineState): number {
  return (v.baseSellTime * rMult(s, 'sellTime')) / staffSpeed(line.salesReps) / eventMult(s, 'sellSpeed', v.id);
}

export function sellPrice(s: GameState, v: VehicleDef): number {
  const boost = Date.now() < s.boostUntil ? BOOST_MULT : 1;
  return Math.round(v.basePrice * rMult(s, 'price') * boost * eventMult(s, 'price', v.id));
}

/** Boost'suz taban fiyat (offline hesap ve UI için) */
export function sellPriceNoBoost(s: GameState, v: VehicleDef): number {
  return Math.round(v.basePrice * rMult(s, 'price'));
}

export function stockCap(s: GameState, v: VehicleDef): number {
  return Math.floor(v.baseStockCap * rMult(s, 'cap'));
}

export function batchSize(s: GameState): number {
  return 1 + rAdd(s, 'batch');
}

export function claimDuration(s: GameState): number {
  return CLAIM_DURATION * rMult(s, 'claimTime');
}

/** Claim başına kazanılan RP: (baz + toplamsal) × çarpımsal */
export function claimReward(s: GameState): number {
  return Math.round((CLAIM_REWARD + rAdd(s, 'claimAdd')) * rMult(s, 'claimMult'));
}

/** Mucit alındı mı? (otomatik claim — Ar-Ge personeli merdiveninin ilki) */
export function hasAutoClaim(s: GameState): boolean {
  return researchLevel(s, 'inventor') >= 1;
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
