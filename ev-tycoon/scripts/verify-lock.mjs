import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new' });
const out = {};
for (const [adi, w, h] of [['mobil', 450, 800], ['tablet', 768, 1024]]) {
  const p = await browser.newPage();
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 2 });
  await p.goto('http://localhost:5188', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 9500));
  await p.evaluate(() => {
    const c = document.querySelector('.company-input');
    if (c) { c.value = 'T'; document.querySelector('.c-ok').click(); }
    document.querySelectorAll('.wb-ok,.ev-ok,.tut-skip-all,.ct-decline').forEach(x => x.click());
    document.getElementById('boot')?.remove();
  });
  const m = await p.evaluate(async () => {
    const s = window.__state; s.tutStep = 99; s.money = 90000; s.gems = 60;
    document.querySelector('#tabbar button').click();
    await new Promise(r => setTimeout(r, 700));
    const card = document.querySelector('.vcard.loc-unlock');
    if (!card) return { hata: 'kilitli tesis karti yok' };
    card.scrollIntoView({ block: 'center' });
    await new Promise(r => setTimeout(r, 300));
    const lock = card.querySelector('.loc-lock .icon svg');
    return { kartYukseklik: Math.round(card.getBoundingClientRect().height), kilitBoyu: lock ? Math.round(lock.getBoundingClientRect().height) : 0 };
  });
  out[adi] = m;
  await p.screenshot({ path: `C:/Users/onuro/AppData/Local/Temp/claude/C--Users-onuro-Documents-claude-code-oyun-geli-tirme/2faa01ee-3c1c-4de3-a0f9-d2205d2976b1/scratchpad/lock-${adi}.png` });
  await p.close();
}
console.log(JSON.stringify(out, null, 1));
await browser.close();

