// Tüm oyun dengesi bu dosyadadır. GDD.md ile senkron tutulur.

export interface LocationDef {
  id: string;
  nameKey: string;
  unlockCost: number; // 0 = baştan açık
  unlockGems: number;
  /** araç başına, rol başına (teknisyen/temsilci) personel tavanı —
      küçük mekânda az çalışan; her yeni mekânda artar */
  staffCap: number;
  icon: string;
}

export const LOCATIONS: LocationDef[] = [
  { id: 'garage', nameKey: 'loc.garage', unlockCost: 0, unlockGems: 0, staffCap: 6, icon: 'home' },
  { id: 'workshop', nameKey: 'loc.workshop', unlockCost: 75_000, unlockGems: 20, staffCap: 12, icon: 'gear' },
];

export interface VehicleDef {
  id: string;
  /** i18n anahtarı değil — marka adı, çevrilmez */
  name: string;
  /** i18n anahtarı: araç sınıfı (kick scooter, e-bike...) */
  classKey: string;
  locationId: string;
  unlockCost: number; // 0 = baştan açık
  unlockGems: number; // lisans için gem bedeli
  baseProdTime: number; // saniye
  baseSellTime: number; // saniye
  basePrice: number; // $
  baseStockCap: number;
  techBaseCost: number;
  repBaseCost: number;
  prodManagerCost: number;
  salesManagerCost: number;
  /** SVG ikonunun id'si (art.ts) */
  icon: string;
  accent: string; // vurgu rengi
}

export const VEHICLES: VehicleDef[] = [
  {
    id: 'zipvolt',
    name: 'ZipVolt',
    classKey: 'class.kickscooter',
    locationId: 'garage',
    unlockCost: 0,
    unlockGems: 0,
    baseProdTime: 4,
    baseSellTime: 3,
    basePrice: 12,
    baseStockCap: 20,
    techBaseCost: 25,
    repBaseCost: 20,
    prodManagerCost: 400,
    salesManagerCost: 500,
    icon: 'scooter',
    accent: '#3ef0c8',
  },
  {
    id: 'voltrider',
    name: 'VoltRider',
    classKey: 'class.ebike',
    locationId: 'garage',
    unlockCost: 600,
    unlockGems: 10,
    baseProdTime: 12,
    baseSellTime: 8,
    basePrice: 95,
    baseStockCap: 15,
    techBaseCost: 220,
    repBaseCost: 180,
    prodManagerCost: 3500,
    salesManagerCost: 4200,
    icon: 'ebike',
    accent: '#41b0ff',
  },
  {
    id: 'econoev',
    name: 'Econo EV',
    classKey: 'class.microcar',
    locationId: 'garage',
    unlockCost: 9000,
    unlockGems: 25,
    baseProdTime: 45,
    baseSellTime: 25,
    basePrice: 1100,
    baseStockCap: 10,
    techBaseCost: 2600,
    repBaseCost: 2100,
    prodManagerCost: 40000,
    salesManagerCost: 48000,
    icon: 'microcar',
    accent: '#c8f43e',
  },
  // ---- Workshop (2. mekân) ----
  {
    id: 'trihauler',
    name: 'TriHauler',
    classKey: 'class.cargotrike',
    locationId: 'workshop',
    unlockCost: 35_000,
    unlockGems: 30,
    baseProdTime: 75,
    baseSellTime: 40,
    basePrice: 3400,
    baseStockCap: 12,
    techBaseCost: 7500,
    repBaseCost: 6000,
    prodManagerCost: 130_000,
    salesManagerCost: 160_000,
    icon: 'trike',
    accent: '#ff9d3e',
  },
  {
    id: 'fairwaygo',
    name: 'FairwayGo',
    classKey: 'class.golfcart',
    locationId: 'workshop',
    unlockCost: 180_000,
    unlockGems: 35,
    baseProdTime: 150,
    baseSellTime: 80,
    basePrice: 16_000,
    baseStockCap: 10,
    techBaseCost: 36_000,
    repBaseCost: 29_000,
    prodManagerCost: 640_000,
    salesManagerCost: 770_000,
    icon: 'golfcart',
    accent: '#5eff8f',
  },
  {
    id: 'citypod',
    name: 'CityPod',
    classKey: 'class.nev',
    locationId: 'workshop',
    unlockCost: 900_000,
    unlockGems: 40,
    baseProdTime: 360,
    baseSellTime: 180,
    basePrice: 90_000,
    baseStockCap: 8,
    techBaseCost: 200_000,
    repBaseCost: 160_000,
    prodManagerCost: 3_600_000,
    salesManagerCost: 4_300_000,
    icon: 'citypod',
    accent: '#b06bff',
  },
];

// Personel eğrisi: Hız = 1 + (SMAX-1) * (1 - e^(-n/TAU))  → azalan getiri
export const STAFF_SMAX = 4;
export const STAFF_TAU = 8;
export const STAFF_COST_GROWTH = 1.35;

// Claim / Research
export const CLAIM_DURATION = 240; // saniye
export const CLAIM_REWARD = 5; // RP

export interface ResearchDef {
  id: string;
  maxLevel: number;
  costs: number[]; // RP, seviye başına
  icon: string;
}

export const RESEARCH: ResearchDef[] = [
  { id: 'assembly', maxLevel: 3, costs: [10, 30, 80], icon: 'gear' },
  { id: 'marketing', maxLevel: 3, costs: [10, 30, 80], icon: 'megaphone' },
  { id: 'warehouse', maxLevel: 2, costs: [20, 60], icon: 'box' },
  { id: 'offline', maxLevel: 2, costs: [25, 70], icon: 'moon' },
  { id: 'quickclaim', maxLevel: 1, costs: [40], icon: 'bolt' },
  { id: 'batch', maxLevel: 1, costs: [120], icon: 'stack' },
];

// Research etkileri (seviye başına)
export const FX = {
  assemblyTimeMult: 0.9, // her seviye üretim süresi ×0.9
  marketingPriceMult: 1.15, // her seviye fiyat ×1.15
  warehouseCapMult: 1.5, // her seviye kapasite ×1.5
  offlineHours: [8, 12, 24], // seviye 0/1/2
  quickClaimMult: 0.75,
  batchExtra: 1, // döngü başına +1 araç
};

// Gems
export const GEM_COST_INSTANT_PROD = 1;
export const GEM_COST_INSTANT_CLAIM = 3;
export const GEM_COST_BOOST = 10;
export const BOOST_HOURS = 4;
export const BOOST_MULT = 2;
export const STARTING_GEMS = 10;

// Reklam ödülleri
export const AD_REWARD_GEMS = 5;
export const TIME_WARP_MINUTES = 15;

export interface AchievementDef {
  id: string;
  gems: number;
  check: (s: import('./state').GameState) => boolean;
}

// TASARIM KURALI: Reklamsız kazanılabilir toplam gem (başlangıç +
// "allVehicles" HARİÇ başarımlar), kümülatif lisans gem bedelinin en az
// 1,5 katı olmalı. Böylece çok sabırlı bir oyuncu hiç video izlemeden
// tüm lisansları alabilir.
// Güncel doğrulama: lisanslar 10+25+30+35+40 = 140 + atölye 20 = 160
// → gerek 240. Havuz: başlangıç 10 + başarımlar 232 = 242 ≥ 240 ✓
//
// TEMPO: Eşikler ×10 büyür (100→1K→10K→100K satış; $10K→$100K→$1M→$10M).
// Erken oyunda başarımlar dakikalar içinde, geç oyunda saatler/günler
// arayla gelir — oyuncu devamlılığı için bilinçli yavaşlama.
export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'firstSale', gems: 2, check: (s) => s.stats.totalSold >= 1 },
  { id: 'firstTech', gems: 2, check: (s) => Object.values(s.lines).some((l) => l.technicians >= 1) },
  { id: 'firstManager', gems: 5, check: (s) => Object.values(s.lines).some((l) => l.prodManager || l.salesManager) },
  { id: 'firstResearch', gems: 3, check: (s) => Object.values(s.research).some((v) => v >= 1) },
  { id: 'sold100', gems: 5, check: (s) => s.stats.totalSold >= 100 },
  { id: 'techSquad', gems: 5, check: (s) => Object.values(s.lines).reduce((n, l) => n + l.technicians, 0) >= 10 },
  { id: 'earned10k', gems: 5, check: (s) => s.stats.totalEarned >= 10_000 },
  { id: 'sold1000', gems: 10, check: (s) => s.stats.totalSold >= 1000 },
  { id: 'earned100k', gems: 10, check: (s) => s.stats.totalEarned >= 100_000 },
  { id: 'workshopOpen', gems: 15, check: (s) => !!s.locations['workshop'] },
  { id: 'sold10k', gems: 20, check: (s) => s.stats.totalSold >= 10_000 },
  { id: 'earned1m', gems: 20, check: (s) => s.stats.totalEarned >= 1_000_000 },
  // techArmy eşiği toplam personel kapasitesinin (garaj 3×6 + atölye 3×12 = 54)
  // altında kalmalı ki başarım her zaman kazanılabilir olsun
  { id: 'techArmy', gems: 15, check: (s) => Object.values(s.lines).reduce((n, l) => n + l.technicians, 0) >= 40 },
  { id: 'autoEmpire', gems: 15, check: (s) => Object.values(s.lines).filter((l) => l.unlocked && l.prodManager && l.salesManager).length >= 4 },
  { id: 'researchMaster', gems: 25, check: (s) => RESEARCH.every((r) => (s.research[r.id] ?? 0) >= r.maxLevel) },
  { id: 'sold100k', gems: 25, check: (s) => s.stats.totalSold >= 100_000 },
  { id: 'earned10m', gems: 30, check: (s) => s.stats.totalEarned >= 10_000_000 },
  { id: 'earned100m', gems: 20, check: (s) => s.stats.totalEarned >= 100_000_000 },
  { id: 'allVehicles', gems: 10, check: (s) => Object.values(s.lines).every((l) => l.unlocked) },
];

// Haber havuzu: vehicleId null → genel haber, dolu → o araç açık olmalı
export interface NewsDef {
  key: string;
  vehicleId: string | null;
}

export const NEWS: NewsDef[] = [
  { key: 'news.generic1', vehicleId: null },
  { key: 'news.generic2', vehicleId: null },
  { key: 'news.generic3', vehicleId: null },
  { key: 'news.generic4', vehicleId: null },
  { key: 'news.generic5', vehicleId: null },
  { key: 'news.zipvolt1', vehicleId: 'zipvolt' },
  { key: 'news.zipvolt2', vehicleId: 'zipvolt' },
  { key: 'news.voltrider1', vehicleId: 'voltrider' },
  { key: 'news.voltrider2', vehicleId: 'voltrider' },
  { key: 'news.econoev1', vehicleId: 'econoev' },
  { key: 'news.econoev2', vehicleId: 'econoev' },
  { key: 'news.trihauler1', vehicleId: 'trihauler' },
  { key: 'news.fairwaygo1', vehicleId: 'fairwaygo' },
  { key: 'news.citypod1', vehicleId: 'citypod' },
];

// ---- Haber olayları (popup + geçici oynanış etkisi) ----

export type EventKind = 'prodSpeed' | 'sellSpeed' | 'price';

export interface NewsEventDef {
  id: string;
  /** null → tüm araçlar; dolu → yalnızca o araç (ve araç açıksa çıkar) */
  vehicleId: string | null;
  kind: EventKind;
  mult: number;
  durationSec: number;
  positive: boolean;
}

export const NEWS_EVENTS: NewsEventDef[] = [
  // Olumlu
  { id: 'viral_zipvolt', vehicleId: 'zipvolt', kind: 'price', mult: 1.5, durationSec: 90, positive: true },
  { id: 'viral_voltrider', vehicleId: 'voltrider', kind: 'price', mult: 1.5, durationSec: 90, positive: true },
  { id: 'viral_econoev', vehicleId: 'econoev', kind: 'price', mult: 1.5, durationSec: 90, positive: true },
  { id: 'viral_trihauler', vehicleId: 'trihauler', kind: 'price', mult: 1.5, durationSec: 90, positive: true },
  { id: 'viral_fairwaygo', vehicleId: 'fairwaygo', kind: 'price', mult: 1.5, durationSec: 90, positive: true },
  { id: 'viral_citypod', vehicleId: 'citypod', kind: 'price', mult: 1.5, durationSec: 90, positive: true },
  { id: 'battery_deal', vehicleId: null, kind: 'prodSpeed', mult: 1.3, durationSec: 90, positive: true },
  { id: 'ev_expo', vehicleId: null, kind: 'sellSpeed', mult: 1.4, durationSec: 90, positive: true },
  { id: 'subsidy', vehicleId: null, kind: 'price', mult: 1.25, durationSec: 120, positive: true },
  // Hafif olumsuz
  { id: 'parts_delay', vehicleId: null, kind: 'prodSpeed', mult: 0.85, durationSec: 60, positive: false },
  { id: 'market_dip', vehicleId: null, kind: 'price', mult: 0.85, durationSec: 60, positive: false },
];

export const EVENT_GAP_MIN = 240; // sn — iki olay arası en az
export const EVENT_GAP_MAX = 420; // sn — en çok
export const EVENT_POSITIVE_CHANCE = 0.75;

export const SAVE_KEY = 'evtycoon_save_v1';
export const SAVE_VERSION = 1;
export const AUTOSAVE_INTERVAL = 10; // saniye
export const OFFLINE_MIN_SECONDS = 30;
