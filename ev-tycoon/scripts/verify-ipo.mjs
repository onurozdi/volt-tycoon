// IPO UI doğrulama: Bank paneli, koşul satırları, onay akışı, tabela ★
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 450, height: 800 });
await page.goto('http://localhost:5188', { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 6500));
await page.evaluate(() => {
  const b = document.querySelector('.company-input');
  if (b) { b.value = 'Onur Cars'; document.querySelector('.c-ok').click(); }
  document.querySelectorAll('.wb-ok, .ev-ok, .tut-skip-all, .ct-decline').forEach((x) => x.click());
  document.getElementById('boot')?.remove();
});
const result = await page.evaluate(async () => {
  const s = window.__state;
  s.tutStep = 99;
  s.companyName = 'Onur Cars';
  // 1) kosullar eksikken panel
  const bankBtn = Array.from(document.querySelectorAll('#tabbar button')).find((x) => x.textContent.includes('Bank'));
  bankBtn.click();
  await new Promise((r) => setTimeout(r, 700));
  const st1 = document.querySelector('.ipo-status').innerText;
  const btnDisabled1 = document.querySelector('.ipo-btn').disabled;
  // 2) kosullari sagla
  s.locations.gigafactory = true;
  s.stats.totalEarned = s.ipoBaseEarned + 1_600_000_000;
  await new Promise((r) => setTimeout(r, 500));
  const btnText2 = document.querySelector('.ipo-btn').textContent;
  const btnEnabled2 = !document.querySelector('.ipo-btn').disabled;
  // 3) IPO akisi
  document.querySelector('.ipo-btn').click();
  await new Promise((r) => setTimeout(r, 400));
  const confirmBody = (document.querySelector('.modal-overlay p:last-of-type') || {}).textContent;
  document.querySelector('.ipo-go').click();
  await new Promise((r) => setTimeout(r, 800));
  const sign = (document.querySelector('.scene-sign') || {}).textContent;
  return {
    eksikKosulSatirlari: st1,
    kilitliyken: btnDisabled1,
    hazirken: { etiket: btnText2, aktif: btnEnabled2 },
    onayVar: !!confirmBody,
    sonuc: { hisse: s.shares, ipoSayisi: s.ipoCount, para: s.money, tabela: sign, homeAcildi: !!document.querySelector('.mat-strip') },
  };
});
console.log(JSON.stringify(result, null, 1));
await browser.close();
