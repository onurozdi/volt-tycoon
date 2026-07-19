import puppeteer from 'puppeteer';
const b = await puppeteer.launch({ headless: 'new' });
const p = await b.newPage();
await p.setViewport({ width: 450, height: 800 });
await p.goto('http://localhost:5188', { waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 6500));
await p.evaluate(() => { const c = document.querySelector('.company-input'); if (c) { c.value = 'T'; document.querySelector('.c-ok').click(); } document.querySelectorAll('.wb-ok,.ev-ok,.tut-skip-all').forEach(x=>x.click()); document.getElementById('boot')?.remove(); });
const rows = await p.evaluate(async () => {
  const s = window.__state; s.tutStep = 99; s.money = 500000; s.gems = 60;
  const eng = await import('/src/core/engine.ts');
  eng.unlockVehicle(s, 'voltrider');
  Array.from(document.querySelectorAll('#tabbar button')).find(x=>x.textContent.includes('Market')).click();
  await new Promise(r => setTimeout(r, 900));
  return Array.from(document.querySelectorAll('.mat-row')).map(r =>
    r.querySelector('.mat-name').textContent.trim() + ' | ' + r.querySelector('.mat-price').textContent +
    ' | ' + r.querySelector('.mat-stockbar b').textContent + ' | [' + r.querySelector('.m-b10').textContent + ']');
});
console.log(JSON.stringify(rows, null, 1));
await b.close();

