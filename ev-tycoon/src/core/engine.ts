import {
  ACHIEVEMENTS, AD_REWARD_GEMS, BANKRUPTCY_GRACE, BOOST_HOURS,
  CONTRACT_DECAY_FLOOR, CONTRACT_DELAY_RATIO, CONTRACT_DURATION, CONTRACT_FAIL_PENALTY,
  CONTRACT_GAP_MAX, CONTRACT_GAP_MIN, CONTRACT_GEM_BONUS, CONTRACT_GEM_CHANCE, CONTRACT_ISSUERS,
  CONTRACT_PRICE_MAX, CONTRACT_PRICE_MIN, CONTRACT_REP_CAP, CONTRACT_REP_GAP_FACTOR,
  CONTRACT_REP_PRICE_BONUS,
  EVENT_GAP_MAX, EVENT_GAP_MIN, EVENT_POSITIVE_CHANCE,
  GEM_COST_BOOST, GEM_COST_INSTANT_CLAIM, GEM_COST_INSTANT_PROD,
  LOAN_REPAY_FEE, LOANS, LOCATIONS, NEWS_EVENTS, OFFLINE_MIN_SECONDS, VEHICLES,
} from './config';
import type { ActiveContract } from './state';
import type { NewsEventDef } from './config';
import {
  batchSize, claimDuration, claimReward, hasAutoClaim, homeCapFor, offlineCapSeconds,
  prodInterval, researchCost, sellInterval, sellPrice, sellPriceNoBoost, staffCapFor,
  staffCost, stockCap, vehicleDef,
} from './formulas';
import type { GameState } from './state';

export interface OfflineReport {
  seconds: number;
  produced: number;
  sold: number;
  earned: number;
  claimReady: boolean;
  /** Ar-Ge Müdürü'nün offline topladığı RP */
  rp: number;
  /** offline'da kesilen kredi taksitleri toplamı */
  loanPaid: number;
}

export interface EngineEvents {
  onSale?: (vehicleId: string, amount: number) => void;
  onProduce?: (vehicleId: string) => void;
  onAchievement?: (id: string, gems: number) => void;
  onNewsEvent?: (def: NewsEventDef, extra?: BuyoutInfo) => void;
  onBankrupt?: () => void;
  onContractOffer?: (offer: ContractOffer) => void;
  onContractFailed?: (c: ActiveContract, penalty: number, gemsLost: number) => void;
}

/** Popup'ta gösterilen, henüz kabul edilmemiş teklif */
export interface ContractOffer {
  issuerId: string;
  vehicleId: string;
  qty: number;
  unitPrice: number;
  /** piyasa fiyatına oran (karar bilgisi: +%12 / −%8 gibi) */
  vsMarket: number;
  durationSec: number;
  /** başarıda ekstra gem (0 = yok); başarısızlıkta aynı miktar gem gider */
  gemBonus: number;
}

/** Anlık olayların (buyout/gift) popup'ta gösterilecek detayı */
export interface BuyoutInfo {
  vehicleName?: string;
  amount?: number;
  gems?: number;
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
    (e) =>
      e.positive === wantPositive &&
      s.locations[e.locationId] &&
      (e.vehicleId === null || s.lines[e.vehicleId]?.unlocked) &&
      // buyout yalnızca stoğu %80+ dolu bir araç varken havuza girer
      (e.kind !== 'buyout' || buyoutTarget(s) !== null),
  );
  if (pool.length === 0) return;
  const def = pool[Math.floor(Math.random() * pool.length)];

  if (def.kind === 'buyout') {
    // Anlık olay: en dolu (değerce en büyük) aracın TÜM stoğu satılır;
    // aktif etki/süre yok
    const v = buyoutTarget(s)!;
    const line = s.lines[v.id];
    const n = line.stock;
    const amount = n * sellPrice(s, v);
    line.stock = 0;
    line.totalSold += n;
    line.revenue += amount;
    s.stats.totalSold += n;
    s.stats.totalEarned += amount;
    s.money += amount;
    checkAchievements(s);
    events.onNewsEvent?.(def, { vehicleName: v.name, amount });
    return;
  }

  if (def.kind === 'gift') {
    // Anlık olay: gizemli ziyaretçi 1-4 gem bırakır; etki süresi yok
    const gems = 1 + Math.floor(Math.random() * 4);
    s.gems += gems;
    events.onNewsEvent?.(def, { gems });
    return;
  }

  s.activeEvent = { id: def.id, until: Date.now() + def.durationSec * 1000 };
  events.onNewsEvent?.(def);
}

/** Stoğu kapasitesinin ≥%80'i dolu araçlardan stok değeri en yükseği */
function buyoutTarget(s: GameState): (typeof VEHICLES)[number] | null {
  let best: (typeof VEHICLES)[number] | null = null;
  let bestValue = 0;
  for (const v of VEHICLES) {
    const line = s.lines[v.id];
    if (!line.unlocked || line.stock < stockCap(s, v) * 0.8 || line.stock === 0) continue;
    const value = line.stock * sellPrice(s, v);
    if (value > bestValue) {
      bestValue = value;
      best = v;
    }
  }
  return best;
}

/**
 * Finansal grafik örnekleyicisi (adaptif): son örnekten bu yana `int`
 * saniye geçtiyse yeni örnek ekler; 120 örneği aşınca her 2. nokta
 * atılır ve aralık ikiye katlanır → x ekseni sınırsız büyür, bellek sabit.
 */
const CHART_MAX_POINTS = 120;
function pushChartSample(s: GameState, force = false): void {
  const d = s.chart.d;
  const last = d[d.length - 1];
  if (!force && s.playedSec - last[0] < s.chart.int) return;
  d.push([s.playedSec, s.stats.totalEarned, s.stats.totalSpent]);
  if (d.length > CHART_MAX_POINTS) {
    const lastPt = d[d.length - 1];
    s.chart.d = d.filter((_, i) => i % 2 === 0);
    if (s.chart.d[s.chart.d.length - 1] !== lastPt) s.chart.d.push(lastPt);
    s.chart.int *= 2;
  }
}

/** Kredi taksitleri: dt kadar ilerlet; bakiye eksiye inebilir */
function tickLoans(s: GameState, dt: number): void {
  for (const loan of s.loans) {
    loan.nextIn -= dt;
    const def = LOANS.find((l) => l.id === loan.defId);
    if (!def) {
      loan.remaining = 0;
      continue;
    }
    while (loan.nextIn <= 0 && loan.remaining > 0) {
      s.money -= loan.installment;
      s.stats.totalSpent += loan.installment;
      loan.remaining -= 1;
      loan.nextIn += def.intervalSec;
    }
  }
  s.loans = s.loans.filter((l) => l.remaining > 0);

  // İflas sayacı yalnızca AKTİF oyunda işler (offline'da asla)
  if (s.money < 0) {
    const before = s.debtTimer;
    s.debtTimer += dt;
    if (before < BANKRUPTCY_GRACE && s.debtTimer >= BANKRUPTCY_GRACE) {
      events.onBankrupt?.();
    }
  } else {
    s.debtTimer = 0;
  }
}

/** Offline kredi kesintisi: taksitler işler ama iflas sayacı İLERLEMEZ */
function tickLoansOffline(s: GameState, T: number): void {
  for (const loan of s.loans) {
    const def = LOANS.find((l) => l.id === loan.defId);
    if (!def) {
      loan.remaining = 0;
      continue;
    }
    let elapsed = T;
    while (elapsed >= loan.nextIn && loan.remaining > 0) {
      elapsed -= loan.nextIn;
      s.money -= loan.installment;
      s.stats.totalSpent += loan.installment;
      loan.remaining -= 1;
      loan.nextIn = def.intervalSec;
    }
    if (loan.remaining > 0) loan.nextIn -= elapsed;
  }
  s.loans = s.loans.filter((l) => l.remaining > 0);
}

// ---------- Sözleşmeler ----------

/** Aktif verenler: açık olan SON 2 tesisin verenleri */
export function activeIssuers(s: GameState): typeof CONTRACT_ISSUERS {
  const openLocs = LOCATIONS.filter((l) => s.locations[l.id]).map((l) => l.id);
  const window = openLocs.slice(-2);
  return CONTRACT_ISSUERS.filter((i) => window.includes(i.locationId));
}

export function issuerRep(s: GameState, issuerId: string): number {
  return s.contractRep[issuerId] ?? 0;
}

function bumpRep(s: GameState, issuerId: string, delta: number): void {
  s.contractRep[issuerId] = Math.max(0, Math.min(CONTRACT_REP_CAP, issuerRep(s, issuerId) + delta));
}

/** Teklif üret: veren (itibar ağırlıklı), araç (verenin tesisinden),
    miktar (depoya sığan, üretim hızına göre dolabilir), fiyat bandı */
function generateContractOffer(s: GameState): ContractOffer | null {
  const busy = new Set(s.contracts.map((c) => c.issuerId));
  const candidates = activeIssuers(s).filter((i) => !busy.has(i.id));
  if (candidates.length === 0) return null;
  // itibar hafif ağırlık: rep 10 ≈ 1.8x seçilme şansı
  const weights = candidates.map((i) => 1 + issuerRep(s, i.id) * 0.08);
  let roll = Math.random() * weights.reduce((a, b) => a + b, 0);
  let issuer = candidates[0];
  for (let i = 0; i < candidates.length; i++) {
    roll -= weights[i];
    if (roll <= 0) {
      issuer = candidates[i];
      break;
    }
  }
  const vehicles = VEHICLES.filter((v) => v.locationId === issuer.locationId && s.lines[v.id].unlocked);
  if (vehicles.length === 0) return null;
  const v = vehicles[Math.floor(Math.random() * vehicles.length)];
  const line = s.lines[v.id];
  const cap = stockCap(s, v);
  // Miktar: deponun %50-90'ı (tek seferde stoktan teslim edilir)
  const qty = Math.max(3, Math.floor(cap * (0.5 + Math.random() * 0.4)));
  // Süre: mevcut hızla üretim süresinin ~1.6 katı, tesis aralığına sıkıştırılır
  const fillSec = (qty * prodInterval(s, v, line)) / batchSize(s);
  const [dMin, dMax] = CONTRACT_DURATION[issuer.locationId] ?? [600, 1200];
  const durationSec = Math.round(Math.min(dMax, Math.max(dMin, fillSec * 1.6)));
  // Fiyat: piyasanın [0.85, 1.25]'i; itibar bandı yukarı kaydırır
  const rep = issuerRep(s, issuer.id);
  const band = CONTRACT_PRICE_MIN + Math.random() * (CONTRACT_PRICE_MAX - CONTRACT_PRICE_MIN);
  const vsMarket = band + rep * CONTRACT_REP_PRICE_BONUS;
  const unitPrice = Math.max(1, Math.round(sellPriceNoBoost(s, v) * vsMarket));
  // Bazı sözleşmeler gem ikramiyesi taşır — başarısızlıkta aynı miktar gem gider
  let gemBonus = 0;
  if (Math.random() < CONTRACT_GEM_CHANCE) {
    const [gMin, gMax] = CONTRACT_GEM_BONUS[issuer.locationId] ?? [1, 1];
    gemBonus = gMin + Math.floor(Math.random() * (gMax - gMin + 1));
  }
  return { issuerId: issuer.id, vehicleId: v.id, qty, unitPrice, vsMarket, durationSec, gemBonus };
}

function nextContractGap(s: GameState, issuerId: string): number {
  const gap = CONTRACT_GAP_MIN + Math.random() * (CONTRACT_GAP_MAX - CONTRACT_GAP_MIN);
  return gap * (1 - issuerRep(s, issuerId) * CONTRACT_REP_GAP_FACTOR);
}

function tickContracts(s: GameState, dt: number): void {
  // Süresi tamamen geçen sözleşmeler: başarısız + ceza + itibar kaybı
  const now = Date.now();
  for (const c of [...s.contracts]) {
    if (now > c.delayUntil) {
      const penalty = Math.round(c.qty * c.unitPrice * CONTRACT_FAIL_PENALTY);
      s.money -= penalty; // eksiye inebilir (banka/iflas sistemiyle uyumlu)
      s.stats.totalSpent += penalty;
      // Gem ikramiyeli sözleşmede ceza gem'e de dokunur — ama asla 0'ın altına inmez
      const gemsLost = Math.min(s.gems, c.gemBonus);
      s.gems -= gemsLost;
      bumpRep(s, c.issuerId, -1);
      s.contracts = s.contracts.filter((x) => x !== c);
      events.onContractFailed?.(c, penalty, gemsLost);
    }
  }
  // Yeni teklif zamanlayıcısı (eşzamanlı sözleşme sınırı yok; veren başına 1
  // sözleşme kuralı generateContractOffer içindeki busy filtresiyle korunur)
  s.nextContractIn -= dt;
  if (s.nextContractIn > 0) return;
  const offer = generateContractOffer(s);
  s.nextContractIn = nextContractGap(s, offer ? offer.issuerId : '');
  if (offer) events.onContractOffer?.(offer);
}

export function acceptContract(s: GameState, o: ContractOffer): void {
  const now = Date.now();
  s.contracts.push({
    issuerId: o.issuerId,
    vehicleId: o.vehicleId,
    qty: o.qty,
    unitPrice: o.unitPrice,
    deadline: now + o.durationSec * 1000,
    delayUntil: now + o.durationSec * (1 + CONTRACT_DELAY_RATIO) * 1000,
    gemBonus: o.gemBonus,
  });
}

/** Gecikme erimesi: son teslim öncesi 1; gecikme penceresinde 1→0.5 iner */
export function contractDecay(c: ActiveContract, now: number): number {
  if (now <= c.deadline) return 1;
  const p = (now - c.deadline) / (c.delayUntil - c.deadline);
  return Math.max(CONTRACT_DECAY_FLOOR, 1 - p * (1 - CONTRACT_DECAY_FLOOR));
}

/** Stoktan teslim: ödül (erimiş) ödenir, itibar +1 */
export function deliverContract(s: GameState, c: ActiveContract): number | null {
  if (!s.contracts.includes(c)) return null;
  const line = s.lines[c.vehicleId];
  if (line.stock < c.qty) return null;
  const now = Date.now();
  const payout = Math.round(c.qty * c.unitPrice * contractDecay(c, now));
  line.stock -= c.qty;
  line.totalSold += c.qty;
  line.revenue += payout;
  s.stats.totalSold += c.qty;
  s.stats.totalEarned += payout;
  s.money += payout;
  s.gems += c.gemBonus;
  bumpRep(s, c.issuerId, 1);
  s.contracts = s.contracts.filter((x) => x !== c);
  checkAchievements(s);
  return payout;
}

/** Oto-satışı hat bazında duraklat/başlat (sözleşme için stok biriktirme) */
export function toggleSellPause(s: GameState, vehicleId: string): void {
  const line = s.lines[vehicleId];
  line.sellPaused = !line.sellPaused;
}

/** Ana simülasyon adımı. dt: gerçek saniye. */
export function tick(s: GameState, dt: number): void {
  s.playedSec += dt;
  pushChartSample(s);
  tickNewsEvents(s, dt);
  tickLoans(s, dt);
  tickContracts(s, dt);

  // Claim dolumu (Ar-Ge Müdürü varsa dolduğunda otomatik toplanır)
  if (hasAutoClaim(s)) {
    s.claimElapsed += dt;
    const dur = claimDuration(s);
    while (s.claimElapsed >= dur) {
      s.claimElapsed -= dur;
      s.rp += claimReward(s);
    }
  } else {
    s.claimElapsed = Math.min(s.claimElapsed + dt, claimDuration(s));
  }

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

    // --- Satış --- (sellPaused: oyuncu sözleşme için stok biriktiriyor)
    const sellActive = (line.selling || (line.salesManager && !line.sellPaused)) && line.stock > 0;
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
        line.revenue += amount;
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
  if (line.technicians >= staffCapFor(s)) return false; // tesis tavanı
  const cost = staffCost(v.techBaseCost, line.technicians, homeCapFor(v));
  if (!line.unlocked || s.money < cost) return false;
  s.money -= cost;
  s.stats.totalSpent += cost;
  line.spent += cost;
  line.technicians += 1;
  return true;
}

export function buySalesRep(s: GameState, id: string): boolean {
  const line = s.lines[id];
  const v = vehicleDef(id);
  if (line.salesReps >= staffCapFor(s)) return false; // tesis tavanı
  const cost = staffCost(v.repBaseCost, line.salesReps, homeCapFor(v));
  if (!line.unlocked || s.money < cost) return false;
  s.money -= cost;
  s.stats.totalSpent += cost;
  line.spent += cost;
  line.salesReps += 1;
  return true;
}

export function buyProdManager(s: GameState, id: string): boolean {
  const line = s.lines[id];
  const v = vehicleDef(id);
  if (!line.unlocked || line.prodManager || s.money < v.prodManagerCost) return false;
  s.money -= v.prodManagerCost;
  s.stats.totalSpent += v.prodManagerCost;
  line.spent += v.prodManagerCost;
  line.prodManager = true;
  line.producing = false;
  return true;
}

export function buySalesManager(s: GameState, id: string): boolean {
  const line = s.lines[id];
  const v = vehicleDef(id);
  if (!line.unlocked || line.salesManager || s.money < v.salesManagerCost) return false;
  s.money -= v.salesManagerCost;
  s.stats.totalSpent += v.salesManagerCost;
  line.spent += v.salesManagerCost;
  line.salesManager = true;
  line.selling = false;
  return true;
}

// ---------- Banka ----------

/** Aynı tekliften aktif kredi varken tekrar çekilemez */
export function canTakeLoan(s: GameState, defId: string): boolean {
  const def = LOANS.find((l) => l.id === defId);
  if (!def || !s.locations[def.locationId]) return false;
  return !s.loans.some((l) => l.defId === defId);
}

export function takeLoan(s: GameState, defId: string): boolean {
  if (!canTakeLoan(s, defId)) return false;
  const def = LOANS.find((l) => l.id === defId)!;
  const total = def.principal * (1 + def.rate);
  s.money += def.principal;
  s.loans.push({
    defId,
    remaining: def.installments,
    nextIn: def.intervalSec,
    installment: Math.ceil(total / def.installments),
  });
  return true;
}

/**
 * Erken kapatma bedeli: kalan anapara + dosya masrafı.
 * Kalan taksit toplamından (faizli) ucuzdur → erken kapatmak avantajlı;
 * ama masraf yüzünden çek-kapat döngüsü zarar ettirir.
 */
export function repayCost(s: GameState, defId: string): number | null {
  const loan = s.loans.find((l) => l.defId === defId);
  const def = LOANS.find((l) => l.id === defId);
  if (!loan || !def) return null;
  const remainingPrincipal = def.principal * (loan.remaining / def.installments);
  return Math.ceil(remainingPrincipal + def.principal * LOAN_REPAY_FEE);
}

export function payoffLoan(s: GameState, defId: string): boolean {
  const cost = repayCost(s, defId);
  if (cost === null || s.money < cost) return false;
  s.money -= cost;
  s.stats.totalSpent += cost;
  s.loans = s.loans.filter((l) => l.defId !== defId);
  return true;
}

export function unlockLocation(s: GameState, id: string): boolean {
  const def = LOCATIONS.find((l) => l.id === id);
  if (!def || s.locations[id]) return false;
  if (s.money < def.unlockCost || s.gems < def.unlockGems) return false;
  s.money -= def.unlockCost;
  s.stats.totalSpent += def.unlockCost;
  s.gems -= def.unlockGems;
  s.locations[id] = true;
  checkAchievements(s);
  return true;
}

export function unlockVehicle(s: GameState, id: string): boolean {
  const line = s.lines[id];
  const v = vehicleDef(id);
  if (line.unlocked || s.money < v.unlockCost || s.gems < v.unlockGems) return false;
  s.money -= v.unlockCost;
  s.stats.totalSpent += v.unlockCost;
  s.gems -= v.unlockGems;
  line.spent += v.unlockCost;
  line.unlocked = true;
  return true;
}

export function claim(s: GameState): boolean {
  if (s.claimElapsed < claimDuration(s)) return false;
  s.claimElapsed = 0;
  s.rp += claimReward(s);
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

export function gemInstantSell(s: GameState, id: string): boolean {
  const line = s.lines[id];
  const v = vehicleDef(id);
  if (!line.unlocked || s.gems < GEM_COST_INSTANT_PROD) return false;
  if (line.stock <= 0) return false;
  if (!line.selling && !line.salesManager) return false;
  s.gems -= GEM_COST_INSTANT_PROD;
  line.stock -= 1;
  line.totalSold += 1;
  s.stats.totalSold += 1;
  const amount = sellPrice(s, v);
  s.money += amount;
  s.stats.totalEarned += amount;
  line.revenue += amount;
  line.sellElapsed = 0;
  if (!line.salesManager) line.selling = false;
  checkAchievements(s);
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
    const sellRate = line.salesManager && !line.sellPaused ? 1 / sellInterval(s, v, line) : 0;
    const rawProduced = prodRate * seconds;
    const lineSold = Math.floor(Math.min(sellRate * seconds, line.stock + rawProduced));
    const lineProduced = Math.floor(Math.max(0, Math.min(rawProduced, lineSold + cap - line.stock)));
    line.stock = Math.max(0, Math.min(cap, line.stock + lineProduced - lineSold));
    line.totalProduced += lineProduced;
    line.totalSold += lineSold;
    line.revenue += lineSold * sellPriceNoBoost(s, v);
    s.stats.totalProduced += lineProduced;
    s.stats.totalSold += lineSold;
    produced += lineProduced;
    sold += lineSold;
    earned += lineSold * sellPriceNoBoost(s, v);
  }
  s.money += earned;
  s.stats.totalEarned += earned;
  checkAchievements(s);
  return { seconds, produced, sold, earned, claimReady: false, rp: 0, loanPaid: 0 };
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
  s.playedSec += T;

  // Claim offline da dolar; Mucit varsa dolan claim'ler otomatik toplanır
  const dur = claimDuration(s);
  let rpGained = 0;
  let claimReady = false;
  if (hasAutoClaim(s)) {
    const total = s.claimElapsed + T;
    const claims = Math.floor(total / dur);
    rpGained = claims * claimReward(s);
    s.rp += rpGained;
    s.claimElapsed = total % dur;
  } else {
    const beforeClaim = s.claimElapsed;
    s.claimElapsed = Math.min(beforeClaim + T, dur);
    claimReady = s.claimElapsed >= dur && beforeClaim < dur;
  }

  let produced = 0;
  let sold = 0;
  let earned = 0;

  for (const v of VEHICLES) {
    const line = s.lines[v.id];
    if (!line.unlocked) continue;
    const cap = stockCap(s, v);
    const prodRate = line.prodManager ? batchSize(s) / prodInterval(s, v, line) : 0;
    const sellRate = line.salesManager && !line.sellPaused ? 1 / sellInterval(s, v, line) : 0;

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
    line.revenue += lineSold * price;
    s.stats.totalProduced += lineProduced;
    s.stats.totalSold += lineSold;
    produced += lineProduced;
    sold += lineSold;
    earned += lineSold * price;
  }

  s.money += earned;
  s.stats.totalEarned += earned;

  // Kredi taksitleri offline'da da kesilir (iflas sayacı İŞLEMEZ)
  const moneyBeforeLoans = s.money;
  tickLoansOffline(s, T);
  const loanPaid = Math.max(0, moneyBeforeLoans - s.money);

  // Manuel yarım kalmış işlemler offline'da ilerlemez; bayrakları temizle
  for (const v of VEHICLES) {
    const line = s.lines[v.id];
    line.producing = false;
    line.selling = false;
    line.prodElapsed = 0;
    line.sellElapsed = 0;
  }

  pushChartSample(s, true); // offline dönüşünde grafik noktası
  checkAchievements(s);
  if (produced === 0 && sold === 0 && !claimReady && rpGained === 0 && loanPaid === 0) return null;
  return { seconds: Math.floor(T), produced, sold, earned, claimReady, rp: rpGained, loanPaid };
}

/** Welcome-back ekranında reklamla ×2: raporun kazancı kadar tekrar ekler */
export function doubleOfflineEarnings(s: GameState, report: OfflineReport): void {
  s.money += report.earned;
  s.stats.totalEarned += report.earned;
}
