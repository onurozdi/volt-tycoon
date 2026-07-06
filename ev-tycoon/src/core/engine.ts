import {
  ACHIEVEMENTS, AD_REWARD_GEMS, BOOST_HOURS, CLAIM_REWARD,
  EVENT_GAP_MAX, EVENT_GAP_MIN, EVENT_POSITIVE_CHANCE,
  GEM_COST_BOOST, GEM_COST_INSTANT_CLAIM, GEM_COST_INSTANT_PROD,
  NEWS_EVENTS, OFFLINE_MIN_SECONDS, VEHICLES,
} from './config';
import type { NewsEventDef } from './config';
import {
  batchSize, claimDuration, offlineCapSeconds, prodInterval, researchCost,
  sellInterval, sellPrice, sellPriceNoBoost, staffCost, stockCap, vehicleDef,
} from './formulas';
import type { GameState } from './state';

export interface OfflineReport {
  seconds: number;
  produced: number;
  sold: number;
  earned: number;
  claimReady: boolean;
}

export interface EngineEvents {
  onSale?: (vehicleId: string, amount: number) => void;
  onProduce?: (vehicleId: string) => void;
  onAchievement?: (id: string, gems: number) => void;
  onNewsEvent?: (def: NewsEventDef) => void;
}

let events: EngineEvents = {};
export function setEngineEvents(e: EngineEvents): void {
  events = e;
}

/** Süresi biten olayı temizle; yenisinin zamanı geldiyse tetikle */
function tickNewsEvents(s: GameState, dt: number): void {
  if (s.activeEvent && Date.now() > s.activeEvent.until) {
    s.activeEvent = null;
    // Yeni olayın geri sayımı etki BİTTİKTEN sonra başlar — etki biter
    // bitmez yeni popup gelmez, arada her zaman tam bir boşluk olur.
    s.nextEventIn = EVENT_GAP_MIN + Math.random() * (EVENT_GAP_MAX - EVENT_GAP_MIN);
  }
  if (s.activeEvent) return; // aktif olay varken geri sayım ilerlemez
  s.nextEventIn -= dt;
  if (s.nextEventIn > 0) return;
  s.nextEventIn = EVENT_GAP_MIN + Math.random() * (EVENT_GAP_MAX - EVENT_GAP_MIN);
  const wantPositive = Math.random() < EVENT_POSITIVE_CHANCE;
  const pool = NEWS_EVENTS.filter(
    (e) => e.positive === wantPositive && (e.vehicleId === null || s.lines[e.vehicleId]?.unlocked),
  );
  if (pool.length === 0) return;
  const def = pool[Math.floor(Math.random() * pool.length)];
  s.activeEvent = { id: def.id, until: Date.now() + def.durationSec * 1000 };
  events.onNewsEvent?.(def);
}

/** Ana simülasyon adımı. dt: gerçek saniye. */
export function tick(s: GameState, dt: number): void {
  tickNewsEvents(s, dt);

  // Claim dolumu
  s.claimElapsed = Math.min(s.claimElapsed + dt, claimDuration(s));

  for (const v of VEHICLES) {
    const line = s.lines[v.id];
    if (!line.unlocked) continue;

    // --- Üretim ---
    const cap = stockCap(s, v);
    const prodActive = (line.producing || line.prodManager) && line.stock < cap;
    if (prodActive) {
      const interval = prodInterval(s, v, line);
      line.prodElapsed += dt;
      while (line.prodElapsed >= interval) {
        line.prodElapsed -= interval;
        const made = Math.min(batchSize(s), cap - line.stock);
        line.stock += made;
        line.totalProduced += made;
        s.stats.totalProduced += made;
        events.onProduce?.(v.id);
        if (!line.prodManager) {
          // manuel üretim: tek döngü
          line.producing = false;
          line.prodElapsed = 0;
          break;
        }
        if (line.stock >= cap) {
          line.prodElapsed = 0;
          break;
        }
      }
    }

    // --- Satış ---
    const sellActive = (line.selling || line.salesManager) && line.stock > 0;
    if (sellActive) {
      const interval = sellInterval(s, v, line);
      line.sellElapsed += dt;
      while (line.sellElapsed >= interval) {
        line.sellElapsed -= interval;
        line.stock -= 1;
        line.totalSold += 1;
        s.stats.totalSold += 1;
        const amount = sellPrice(s, v);
        s.money += amount;
        s.stats.totalEarned += amount;
        events.onSale?.(v.id, amount);
        if (!line.salesManager) {
          line.selling = false;
          line.sellElapsed = 0;
          break;
        }
        if (line.stock <= 0) {
          line.sellElapsed = 0;
          break;
        }
      }
    }
  }

  checkAchievements(s);
}

function checkAchievements(s: GameState): void {
  for (const a of ACHIEVEMENTS) {
    if (s.achievements.includes(a.id)) continue;
    if (a.check(s)) {
      s.achievements.push(a.id);
      s.gems += a.gems;
      events.onAchievement?.(a.id, a.gems);
    }
  }
}

// ---------- Oyuncu eylemleri ----------

export function startProduce(s: GameState, id: string): boolean {
  const line = s.lines[id];
  const v = vehicleDef(id);
  if (!line.unlocked || line.producing || line.prodManager) return false;
  if (line.stock >= stockCap(s, v)) return false;
  line.producing = true;
  line.prodElapsed = 0;
  return true;
}

export function startSell(s: GameState, id: string): boolean {
  const line = s.lines[id];
  if (!line.unlocked || line.selling || line.salesManager) return false;
  if (line.stock <= 0) return false;
  line.selling = true;
  line.sellElapsed = 0;
  return true;
}

export function buyTechnician(s: GameState, id: string): boolean {
  const line = s.lines[id];
  const v = vehicleDef(id);
  const cost = staffCost(v.techBaseCost, line.technicians);
  if (!line.unlocked || s.money < cost) return false;
  s.money -= cost;
  line.technicians += 1;
  return true;
}

export function buySalesRep(s: GameState, id: string): boolean {
  const line = s.lines[id];
  const v = vehicleDef(id);
  const cost = staffCost(v.repBaseCost, line.salesReps);
  if (!line.unlocked || s.money < cost) return false;
  s.money -= cost;
  line.salesReps += 1;
  return true;
}

export function buyProdManager(s: GameState, id: string): boolean {
  const line = s.lines[id];
  const v = vehicleDef(id);
  if (!line.unlocked || line.prodManager || s.money < v.prodManagerCost) return false;
  s.money -= v.prodManagerCost;
  line.prodManager = true;
  line.producing = false;
  return true;
}

export function buySalesManager(s: GameState, id: string): boolean {
  const line = s.lines[id];
  const v = vehicleDef(id);
  if (!line.unlocked || line.salesManager || s.money < v.salesManagerCost) return false;
  s.money -= v.salesManagerCost;
  line.salesManager = true;
  line.selling = false;
  return true;
}

export function unlockVehicle(s: GameState, id: string): boolean {
  const line = s.lines[id];
  const v = vehicleDef(id);
  if (line.unlocked || s.money < v.unlockCost || s.gems < v.unlockGems) return false;
  s.money -= v.unlockCost;
  s.gems -= v.unlockGems;
  line.unlocked = true;
  return true;
}

export function claim(s: GameState): boolean {
  if (s.claimElapsed < claimDuration(s)) return false;
  s.claimElapsed = 0;
  s.rp += CLAIM_REWARD;
  return true;
}

export function buyResearch(s: GameState, id: string): boolean {
  const cost = researchCost(s, id);
  if (cost === null || s.rp < cost) return false;
  s.rp -= cost;
  s.research[id] = (s.research[id] ?? 0) + 1;
  return true;
}

// ---------- Gem harcamaları ----------

export function gemInstantProd(s: GameState, id: string): boolean {
  const line = s.lines[id];
  const v = vehicleDef(id);
  const cap = stockCap(s, v);
  if (!line.unlocked || s.gems < GEM_COST_INSTANT_PROD) return false;
  if (line.stock >= cap) return false;
  if (!line.producing && !line.prodManager) return false;
  s.gems -= GEM_COST_INSTANT_PROD;
  const made = Math.min(batchSize(s), cap - line.stock);
  line.stock += made;
  line.totalProduced += made;
  s.stats.totalProduced += made;
  line.prodElapsed = 0;
  if (!line.prodManager) line.producing = false;
  return true;
}

export function gemInstantClaim(s: GameState): boolean {
  if (s.gems < GEM_COST_INSTANT_CLAIM) return false;
  if (s.claimElapsed >= claimDuration(s)) return false;
  s.gems -= GEM_COST_INSTANT_CLAIM;
  s.claimElapsed = claimDuration(s);
  return true;
}

export function gemBuyBoost(s: GameState): boolean {
  if (s.gems < GEM_COST_BOOST) return false;
  if (Date.now() < s.boostUntil) return false; // zaten aktif
  s.gems -= GEM_COST_BOOST;
  s.boostUntil = Date.now() + BOOST_HOURS * 3600_000;
  return true;
}

export function adRewardGems(s: GameState): void {
  s.gems += AD_REWARD_GEMS;
}

export function adRewardBoost(s: GameState): void {
  const base = Math.max(Date.now(), s.boostUntil);
  s.boostUntil = base + BOOST_HOURS * 3600_000;
}

export function adFillClaim(s: GameState): boolean {
  if (s.claimElapsed >= claimDuration(s)) return false;
  s.claimElapsed = claimDuration(s);
  return true;
}

/** Herhangi bir hatta müdür var mı? (Zaman Atlaması için ön koşul) */
export function hasAnyManager(s: GameState): boolean {
  return Object.values(s.lines).some((l) => l.unlocked && (l.prodManager || l.salesManager));
}

/**
 * Zaman Atlaması (reklam ödülü): `seconds` sürelik otomatik üretim+satış
 * anında işletilir. Offline hesabıyla aynı kapalı-form mantığı kullanır;
 * boost uygulanmaz.
 */
export function timeWarp(s: GameState, seconds: number): OfflineReport {
  let produced = 0;
  let sold = 0;
  let earned = 0;
  for (const v of VEHICLES) {
    const line = s.lines[v.id];
    if (!line.unlocked) continue;
    const cap = stockCap(s, v);
    const prodRate = line.prodManager ? batchSize(s) / prodInterval(s, v, line) : 0;
    const sellRate = line.salesManager ? 1 / sellInterval(s, v, line) : 0;
    const rawProduced = prodRate * seconds;
    const lineSold = Math.floor(Math.min(sellRate * seconds, line.stock + rawProduced));
    const lineProduced = Math.floor(Math.max(0, Math.min(rawProduced, lineSold + cap - line.stock)));
    line.stock = Math.max(0, Math.min(cap, line.stock + lineProduced - lineSold));
    line.totalProduced += lineProduced;
    line.totalSold += lineSold;
    s.stats.totalProduced += lineProduced;
    s.stats.totalSold += lineSold;
    produced += lineProduced;
    sold += lineSold;
    earned += lineSold * sellPriceNoBoost(s, v);
  }
  s.money += earned;
  s.stats.totalEarned += earned;
  checkAchievements(s);
  return { seconds, produced, sold, earned, claimReady: false };
}

// ---------- Offline progress ----------

/**
 * Kapalı-form offline hesabı. Manager'ı olan hatlarda üretim/satış işletilir.
 * Boost offline'da uygulanmaz (basitlik + oyuncu istismarını önleme).
 */
export function computeOffline(s: GameState, now: number): OfflineReport | null {
  const rawSec = (now - s.lastSeen) / 1000;
  if (rawSec < OFFLINE_MIN_SECONDS) return null;
  const T = Math.min(rawSec, offlineCapSeconds(s));

  // Claim offline da dolar
  const beforeClaim = s.claimElapsed;
  s.claimElapsed = Math.min(s.claimElapsed + T, claimDuration(s));
  const claimReady = s.claimElapsed >= claimDuration(s) && beforeClaim < claimDuration(s);

  let produced = 0;
  let sold = 0;
  let earned = 0;

  for (const v of VEHICLES) {
    const line = s.lines[v.id];
    if (!line.unlocked) continue;
    const cap = stockCap(s, v);
    const prodRate = line.prodManager ? batchSize(s) / prodInterval(s, v, line) : 0;
    const sellRate = line.salesManager ? 1 / sellInterval(s, v, line) : 0;

    const rawProduced = prodRate * T;
    const rawSellCapacity = sellRate * T;

    // Satılabilecek toplam: eldeki stok + üretilebilen
    const lineSold = Math.floor(Math.min(rawSellCapacity, line.stock + rawProduced));
    // Üretim, satılan + boşalan depo alanından fazla olamaz
    const lineProduced = Math.floor(
      Math.max(0, Math.min(rawProduced, lineSold + cap - line.stock)),
    );
    const newStock = Math.max(0, Math.min(cap, line.stock + lineProduced - lineSold));

    const price = sellPriceNoBoost(s, v);
    line.stock = newStock;
    line.totalProduced += lineProduced;
    line.totalSold += lineSold;
    s.stats.totalProduced += lineProduced;
    s.stats.totalSold += lineSold;
    produced += lineProduced;
    sold += lineSold;
    earned += lineSold * price;
  }

  s.money += earned;
  s.stats.totalEarned += earned;
  // Manuel yarım kalmış işlemler offline'da ilerlemez; bayrakları temizle
  for (const v of VEHICLES) {
    const line = s.lines[v.id];
    line.producing = false;
    line.selling = false;
    line.prodElapsed = 0;
    line.sellElapsed = 0;
  }

  checkAchievements(s);
  if (produced === 0 && sold === 0 && !claimReady) return null;
  return { seconds: Math.floor(T), produced, sold, earned, claimReady };
}

/** Welcome-back ekranında reklamla ×2: raporun kazancı kadar tekrar ekler */
export function doubleOfflineEarnings(s: GameState, report: OfflineReport): void {
  s.money += report.earned;
  s.stats.totalEarned += report.earned;
}
