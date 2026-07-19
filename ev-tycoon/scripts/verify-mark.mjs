// Mark UI hızlı doğrulama: düğme etiketi, tıklama, rozet, fiyat artışı
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 450, height: 800 });
await page.goto('http://localhost:5188', { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 6500));
await page.evaluate(() => {
  const b = document.querySelector('.company-input');
  if (b) { b.value = 'Test'; document.querySelector('.c-ok').click(); }
  document.querySelectorAll('.wb-ok, .ev-ok, .tut-skip-all, .ct-decline').forEach((x) => x.click());
  const boot = document.getElementById('boot');
  if (boot) boot.remove();
});
const result = await page.evaluate(async () => {
  const s = window.__state;
  s.tutStep = 99;
  s.money = 50000;
  s.rp = 100;
  s.gems = 50;
  const eng = await import('/src/core/engine.ts');
  eng.unlockVehicle(s, 'voltrider');
  document.querySelector('#tabbar button').click(); // Home'u yeniden çiz
  await new Promise((r) => setTimeout(r, 800));
  const card = Array.from(document.querySelectorAll('.vcard')).find((c) => {
    const t = c.querySelector('.vcard-title');
    return t && t.textContent.startsWith('VoltRider');
  });
  if (!card) return { hata: 'VoltRider karti bulunamadi' };
  const btn = card.querySelector('.buy-mark');
  const before = { etiket: btn.textContent, aktif: !btn.disabled, fiyatOnce: card.querySelector('.vcard-price').textContent };
  btn.click();
  await new Promise((r) => setTimeout(r, 600));
  return {
    ...before,
    rozetsonra: card.querySelector('.mk-badge').textContent,
    fiyatSonra: card.querySelector('.vcard-price').textContent,
    markSeviye: s.lines.voltrider.mark,
    hypeSifir: s.lines.voltrider.modelAge < 5,
    yeniEtiket: btn.textContent,
  };
});
console.log(JSON.stringify(result, null, 1));
await browser.close();
