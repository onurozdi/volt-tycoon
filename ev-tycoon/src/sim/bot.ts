// Denge simülasyonu: gerçek oyun motorunu (tick + satın alma fonksiyonları)
// birebir kullanan "optimal oynayan" bot. Amaç: 0 → gigafactory koşusunun
// süre eğrisini çıkarmak, tıkanma (stall) ve gem darboğazlarını bulmak,
// kredili/kredisiz farkını ölçmek. Oyuna dahil edilmez; yalnızca konsol/
// önizleme üzerinden çağrılır. Haber olayları ve sözleşmeler kapalıdır
// (epoch tabanlı zamanlayıcılar hızlandırılmış simülasyonda anlamsız).

import { LOANS, LOCATIONS, RECIPES, RESEARCH, VEHICLES } from '../core/config';
import {
  buyMark, buyMaterial, buyProdManager, buyResearch, buySalesManager, buySalesRep,
  buySupplyManager, buyTechnician,
  claim, setEngineEvents, startProduce, startSell, takeLoan, tick,
  unlockLocation, unlockVehicle,
} from '../core/engine';
import {
  homeCapFor, researchCost, sellInterval, sellPrice, staffCost, staffSpeed,
} from '../core/formulas';
import { newGame } from '../core/state';

export interface SimOptions {
  /** simülasyon süresi (oyun-içi saat) */
  hours: number;
  /** bot kredi kullansın mı (tesis hedefine yaklaşırken çeker) */
  useLoans: boolean;
  /** personel alımı için azami geri ödeme süresi (sn) */
  staffPaybackSec: number;
}

export interface Milestone { name: string; t: number; money: number }
export interface Stall { from: number; dur: number; savingFor: string; gap: number }

export interface SimReport {
  milestones: Milestone[];
  stalls: Stall[];
  gemWaits: Array<{ t: number; target: string; gemGap: number }>;
  loansTaken: Array<{ id: string; t: number }>;
  samples: Array<{ t: number; money: number; gems: number; rp: number }>;
  end: { t: number; money: number; gems: number; researchDone: number; researchTotal: number };
}

export function runSim(opt: SimOptions): SimReport {
  const s = newGame('en');
  s.tutStep = 99;
  setEngineEvents({}); // popup/haber olay geri çağrıları kapalı

  const milestones: Milestone[] = [];
  const stalls: Stall[] = [];
  const gemWaits: SimReport['gemWaits'] = [];
  const loansTaken: SimReport['loansTaken'] = [];
  const samples: SimReport['samples'] = [];
  let lastPurchaseT = 0;
  let stallOpen: Stall | null = null;
  const gemWaitSeen = new Set<string>();

  const totalSec = Math.round(opt.hours * 3600);
  const researchTotal = RESEARCH.reduce((a, r) => a + r.maxLevel, 0);

  /** botun şu an biriktirdiği hedef (stall raporu için) */
  const savingTarget = (): { name: string; gap: number } => {
    const nextLoc = LOCATIONS.find((l) => !s.locations[l.id]);
    if (nextLoc && s.money < nextLoc.unlockCost) return { name: 'facility:' + nextLoc.id, gap: nextLoc.unlockCost - s.money };
    const nextVeh = VEHICLES.find((v) => !s.lines[v.id].unlocked && s.locations[v.locationId]);
    if (nextVeh) return { name: 'vehicle:' + nextVeh.id, gap: nextVeh.unlockCost - s.money };
    if (nextLoc) return { name: 'facility:' + nextLoc.id, gap: nextLoc.unlockCost - s.money };
    return { name: 'endgame', gap: 0 };
  };

  for (let t = 1; t <= totalSec; t++) {
    s.nextEventIn = 9e9;
    s.nextContractIn = 9e9;
    tick(s, 1);
    claim(s);

    // Müdürü olmayan hatlarda üretim/satışı elle sürdür (aktif oyuncu)
    for (const v of VEHICLES) {
      const l = s.lines[v.id];
      if (!l.unlocked) continue;
      if (!l.prodManager) startProduce(s, v.id);
      if (!l.salesManager) startSell(s, v.id);
    }

    // Hammadde: Tedarik Müdürü yoksa elle stokla (~15 birimlik tampon;
    // ilerleme/stall sayacına saymaz — rutin gider)
    if (!s.supplyManager) {
      for (const v of VEHICLES) {
        const l = s.lines[v.id];
        const recipe = RECIPES[v.id];
        if (!l.unlocked || !recipe) continue;
        for (const [mat, per] of Object.entries(recipe)) {
          const target = per * 15;
          const have = s.materials[mat] ?? 0;
          if (have < target) buyMaterial(s, mat, target - have);
        }
      }
    }

    let bought: string | null = null;

    // 1) Sıradaki tesis (en büyük sıçrama)
    const nextLoc = LOCATIONS.find((l) => !s.locations[l.id]);
    if (nextLoc) {
      if (unlockLocation(s, nextLoc.id)) {
        bought = 'facility:' + nextLoc.id;
        milestones.push({ name: 'FACILITY ' + nextLoc.id, t, money: Math.round(s.money) });
      } else if (s.money >= nextLoc.unlockCost && s.gems < nextLoc.unlockGems && !gemWaitSeen.has(nextLoc.id)) {
        gemWaitSeen.add(nextLoc.id);
        gemWaits.push({ t, target: 'facility:' + nextLoc.id, gemGap: nextLoc.unlockGems - s.gems });
      }
    }

    // 1b) Kredi: tesis hedefine biriktirirken açık kredi teklifi varsa çek
    if (opt.useLoans && nextLoc && s.loans.length === 0 && s.money < nextLoc.unlockCost) {
      for (const ld of LOANS) {
        if (!s.locations[ld.locationId]) continue;
        // kredi hedefi kapatıyorsa veya belirgin yaklaştırıyorsa mantıklı
        if (s.money + ld.principal >= nextLoc.unlockCost * 0.95 && takeLoan(s, ld.id)) {
          loansTaken.push({ id: ld.id, t });
          break;
        }
      }
    }

    // 2) Sıradaki araç lisansı
    if (!bought) {
      for (const v of VEHICLES) {
        const l = s.lines[v.id];
        if (l.unlocked || !s.locations[v.locationId]) continue;
        if (unlockVehicle(s, v.id)) {
          bought = 'vehicle:' + v.id;
          milestones.push({ name: 'VEHICLE ' + v.name, t, money: Math.round(s.money) });
        } else if (s.money >= v.unlockCost && s.gems < v.unlockGems && !gemWaitSeen.has(v.id)) {
          gemWaitSeen.add(v.id);
          gemWaits.push({ t, target: 'vehicle:' + v.id, gemGap: v.unlockGems - s.gems });
        }
        break; // yalnızca sıradaki araca bak (sonrakiler daha pahalı)
      }
    }

    // 2b) Tedarik Müdürü (hammadde otomasyonu — alınabildiği an değerli)
    if (!bought && !s.supplyManager && buySupplyManager(s)) bought = 'supplyMgr';

    // 3) Müdürler (otomasyon her şeyden kıymetli)
    if (!bought) {
      for (const v of VEHICLES) {
        const l = s.lines[v.id];
        if (!l.unlocked) continue;
        if (!l.prodManager && buyProdManager(s, v.id)) { bought = 'pm:' + v.id; break; }
        if (!l.salesManager && buySalesManager(s, v.id)) { bought = 'sm:' + v.id; break; }
      }
    }

    // 4) Araştırma (ucuzdan pahalıya, RP yettiğince)
    if (!bought) {
      const buyable = RESEARCH
        .map((r) => ({ id: r.id, c: researchCost(s, r.id) }))
        .filter((x): x is { id: string; c: number } => x.c !== null)
        .sort((a, b) => a.c - b.c);
      for (const x of buyable) {
        if (buyResearch(s, x.id)) { bought = 'rs:' + x.id; break; }
        break; // en ucuzu alınamıyorsa gerisi de alınamaz
      }
    }

    // 4b) Mark yükseltmeleri — müdür/araştırmadan SONRA (fiyat +%12 + hype)
    if (!bought) {
      for (const v of VEHICLES) {
        const l = s.lines[v.id];
        if (!l.unlocked || !l.salesManager) continue; // satış oturmadan Mark israf
        if (buyMark(s, v.id)) { bought = 'mark:' + v.id; break; }
      }
    }

    // 5) Personel — geri ödeme süresi eşiğine göre (azalan getiri hesabı)
    if (!bought) {
      for (const v of VEHICLES) {
        const l = s.lines[v.id];
        if (!l.unlocked) continue;
        const incomeRate = sellPrice(s, v) / sellInterval(s, v, l); // $/sn
        if (incomeRate <= 0) continue;
        const hc = homeCapFor(v);
        // teknisyen ve temsilciyi dengeli büyüt
        const wantTech = l.technicians <= l.salesReps;
        const owned = wantTech ? l.technicians : l.salesReps;
        const base = wantTech ? v.techBaseCost : v.repBaseCost;
        const cost = staffCost(base, owned, hc);
        const marginal = (staffSpeed(owned + 1) - staffSpeed(owned)) / staffSpeed(owned);
        const payback = cost / (incomeRate * marginal);
        if (payback <= opt.staffPaybackSec) {
          const ok = wantTech ? buyTechnician(s, v.id) : buySalesRep(s, v.id);
          if (ok) { bought = (wantTech ? 'tech:' : 'rep:') + v.id; break; }
        }
      }
    }

    // Stall takibi: uzun süre hiçbir şey alınamıyorsa kaydet
    if (bought) {
      lastPurchaseT = t;
      if (stallOpen) { stallOpen.dur = t - stallOpen.from; stalls.push(stallOpen); stallOpen = null; }
    } else if (!stallOpen && t - lastPurchaseT >= 240) {
      const target = savingTarget();
      stallOpen = { from: lastPurchaseT, dur: 0, savingFor: target.name, gap: Math.round(target.gap) };
    }

    if (t % 60 === 0) samples.push({ t, money: Math.round(s.money), gems: s.gems, rp: Math.round(s.rp) });

    // Erken bitiş: her şey açık + tüm araştırma bitti
    const allOpen = LOCATIONS.every((l) => s.locations[l.id]) && VEHICLES.every((v) => s.lines[v.id].unlocked);
    if (allOpen && RESEARCH.every((r) => (s.research[r.id] ?? 0) >= r.maxLevel)) {
      milestones.push({ name: 'ALL DONE', t, money: Math.round(s.money) });
      break;
    }
  }
  if (stallOpen) { stallOpen.dur = totalSec - stallOpen.from; stalls.push(stallOpen); }

  return {
    milestones,
    stalls: stalls.filter((x) => x.dur >= 240),
    gemWaits,
    loansTaken,
    samples,
    end: {
      t: samples.length ? samples[samples.length - 1].t : 0,
      money: Math.round(s.money),
      gems: s.gems,
      researchDone: RESEARCH.reduce((a, r) => a + (s.research[r.id] ?? 0), 0),
      researchTotal,
    },
  };
}
