// Play Store ekran görüntüleri: dev sunucudaki oyunu 900x1600 (9:16)
// boyutunda fotoğraflar. Önce güzel bir orta-oyun durumu sahnelenir,
// kayda yazılır; sonra her sayfa temiz açılışla çekilir.
import puppeteer from 'puppeteer';
import path from 'node:path';
import fs from 'node:fs';

const OUT = process.argv[2];
// İsteğe bağlı boyut: node screenshots.mjs OUT [genişlik] [yükseklik] [ölçek]
// Telefon: 450x800x2 → 900x1600 (9:16) · 7" tablet: 720x1280x2 → 1440x2560
// 10" tablet (yatay): 1280x720x2 → 2560x1440 (16:9)
const W = Number(process.argv[3]) || 450;
const H = Number(process.argv[4]) || 800;
const DSF = Number(process.argv[5]) || 2;
const URL = 'http://localhost:5188';
fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: DSF });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const shot = async (name) => {
  await page.screenshot({ path: path.join(OUT, name), type: 'png' });
  console.log('cekildi:', name);
};
const closePopups = async () => {
  await page.evaluate(() => {
    document.querySelectorAll('.wb-ok, .ev-ok, .tut-skip-all').forEach((b) => b.click());
    const boot = document.getElementById('boot');
    if (boot) boot.remove();
  });
};

// ---- 1. tur: sahne kur ----
await page.goto(URL, { waitUntil: 'networkidle2' });
await sleep(6000); // acilis animasyonu bitsin
// şirket adı popup'ı (taze kayıt)
const hasCompany = await page.$('.company-input');
if (hasCompany) {
  await page.type('.company-input', 'Volt Motors');
  await page.click('.c-ok');
  await sleep(400);
}
await closePopups();

await page.evaluate(async () => {
  const eng = await import('/src/core/engine.ts');
  const s = window.__state;
  eng.setEngineEvents({});
  s.tutStep = 99;
  s.settings.lang = 'en';
  s.companyName = 'Volt Motors';
  s.money = 2_480_000;
  s.gems = 46;
  s.rp = 310;
  s.nextEventIn = 99999;
  s.nextContractIn = 99999;
  s.locations.workshop = true;
  // Garaj + atölye hatları: kadrolu, müdürlü, stoklu
  const setup = [
    ['zipvolt', 12, 12, 28],
    ['voltrider', 11, 10, 14],
    ['econoev', 9, 8, 6],
    ['trihauler', 7, 6, 9],
    ['fairwaygo', 5, 4, 3],
    ['citypod', 4, 3, 2],
  ];
  for (const [id, tech, rep, stock] of setup) {
    const l = s.lines[id];
    l.unlocked = true;
    l.technicians = tech;
    l.salesReps = rep;
    l.prodManager = true;
    l.salesManager = true;
    l.stock = stock;
    l.totalSold = 500 + Math.floor(Math.random() * 3000);
    l.revenue = l.totalSold * 900;
    l.spent = Math.floor(l.revenue * 0.4);
  }
  s.stats.totalEarned = 6_400_000;
  s.stats.totalSold = 9_412;
  s.stats.totalProduced = 9_460;
  s.stats.totalSpent = 2_600_000;
  // Depo: dolu ama tam degil; tedarik muduru alinmis
  s.materials = { steel: 74_000, aluminum: 41_000, chip: 12_500, lithium: 2_400 };
  s.supplyManager = true;
  s.matMult = { steel: 0.82, aluminum: 1.12, chip: 0.71, lithium: 1.38 };
  // Arastirmalar: bir kismi alinmis
  s.research = { prod1: 3, sell1: 3, price1: 2, batch: 1, cap1: 2, claim1: 2 };
  // Itibar + aktif sozlesme (yarisi birikmis, sure isliyor)
  s.contractRep = { municipality: 6, courierco: 3, neighbor: 8, pizzeria: 5 };
  s.contracts = [{ issuerId: 'municipality', vehicleId: 'trihauler', qty: 12, unitPrice: 5400, deadline: Date.now() + 22 * 60 * 1000, delayUntil: Date.now() + 33 * 60 * 1000, gemBonus: 2 }];
  s.lines.trihauler.sellPaused = true;
  // grafik icin birkac nokta
  s.playedSec = 6 * 3600;
  s.chart = { int: 160, d: Array.from({ length: 90 }, (_, i) => [i * 240, Math.pow(i / 89, 2.2) * 6_400_000, Math.pow(i / 89, 2.1) * 2_600_000]) };
  s.achievements = ['firstSale', 'firstTech', 'firstManager', 'firstResearch', 'sold100', 'techSquad', 'earned10k', 'sold1000', 'earned100k', 'workshopOpen', 'researchAdept', 'earned1m'];
  s.lastSeen = Date.now();
  localStorage.setItem('evtycoon_save_v1', JSON.stringify(s));
});

// ---- 2. tur: temiz acilislarla cek ----
// 01: acilis animasyonu (tupler yanarken)
await page.goto(URL, { waitUntil: 'networkidle2' });
await sleep(2600);
await shot('01-neon-acilis.png');
await sleep(4500);
await closePopups();
await sleep(1200);

// 02: Home (panorama + depo seridi + sozlesme + araclar)
await closePopups();
await shot('02-home.png');

// 03: Tedarik deposu (Market)
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll('#tabbar button')).find((x) => x.textContent.includes('Market'));
  if (b) b.click();
});
await sleep(900);
await shot('03-tedarik.png');

// 04: Arastirma
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll('#tabbar button')).find((x) => x.textContent.includes('Research'));
  if (b) b.click();
});
await sleep(900);
await shot('04-arastirma.png');

// 05: Istatistik (grafik + itibar)
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll('#tabbar button')).find((x) => x.textContent.includes('Stats'));
  if (b) b.click();
});
await sleep(900);
await shot('05-istatistik.png');

// 06: Sozlesme teklifi popup'i (Home'da)
await page.evaluate(async () => {
  const b = document.querySelector('#tabbar button');
  if (b) b.click();
});
await sleep(600);
await page.evaluate(async () => {
  const eng = await import('/src/core/engine.ts');
  const s = window.__state;
  s.contracts = s.contracts.filter((c) => c.issuerId !== 'courierco');
  let guard = 0;
  const fired = [];
  eng.setEngineEvents({ onContractOffer: (o) => fired.push(o) });
  while (fired.length === 0 && guard < 60) {
    guard++;
    s.nextContractIn = 0.05;
    eng.tick(s, 0.1);
  }
  if (fired.length) {
    const r = await import('/src/ui/render.ts');
    r.showContractOffer(fired[0]);
  }
});
await sleep(700);
await shot('06-sozlesme-teklifi.png');

await browser.close();
console.log('TAMAM:', OUT);
