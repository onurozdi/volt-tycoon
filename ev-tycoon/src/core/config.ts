// Tüm oyun dengesi bu dosyadadır. GDD.md ile senkron tutulur.

export interface VehicleDef {
  id: string;
  /** i18n anahtarı değil — marka adı, çevrilmez */
  name: string;
  /** i18n anahtarı: araç sınıfı (kick scooter, e-bike...) */
  classKey: string;
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

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'firstSale', gems: 2, check: (s) => s.stats.totalSold >= 1 },
  { id: 'sold100', gems: 5, check: (s) => s.stats.totalSold >= 100 },
  { id: 'sold1000', gems: 10, check: (s) => s.stats.totalSold >= 1000 },
  { id: 'firstTech', gems: 2, check: (s) => Object.values(s.lines).some((l) => l.technicians >= 1) },
  { id: 'firstManager', gems: 5, check: (s) => Object.values(s.lines).some((l) => l.prodManager || l.salesManager) },
  { id: 'allVehicles', gems: 10, check: (s) => Object.values(s.lines).every((l) => l.unlocked) },
  { id: 'firstResearch', gems: 3, check: (s) => Object.values(s.research).some((v) => v >= 1) },
  { id: 'earned100k', gems: 10, check: (s) => s.stats.totalEarned >= 100_000 },
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
