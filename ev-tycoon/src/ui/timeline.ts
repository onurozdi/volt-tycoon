// Finansal zaman çizelgesi: gelir / gider / kâr — tek eksenli 3 çizgi.
// Veri, engine'deki adaptif örnekleyiciden gelir (maks ~120 nokta);
// x ekseni oyun süresiyle birlikte "genişler", her iki eksen otomatik
// ölçeklenir. Kütüphanesiz SVG; dokunmatik crosshair + değer okuyucu.
// Renkler oyunun varlık dilini izler (para=lime, gider=kırmızı, kâr=cyan);
// kimlik asla yalnız renkle değil: lejant + çizgi ucu etiketleri.

import { fmtMoney, fmtTime } from '../core/formulas';
import type { GameState } from '../core/state';
import { t } from '../i18n';

const W = 360;
const H = 170;
const PAD = { l: 46, r: 8, t: 10, b: 20 };
const COL = { rev: '#c8f43e', exp: '#ff5e6c', net: '#3ef0c8' };

export function createTimeline(s: GameState): { el: HTMLElement; update: () => void } {
  const el = document.createElement('div');
  el.className = 'panel tl-panel';
  el.innerHTML = `
    <div class="panel-name">${t('stats.timeline')}</div>
    <div class="tl-legend">
      <span><i style="background:${COL.rev}"></i>${t('stats.revenue')}</span>
      <span><i style="background:${COL.exp}"></i>${t('stats.spent')}</span>
      <span><i style="background:${COL.net}"></i>${t('stats.net')}</span>
    </div>
    <div class="tl-wrap">
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"></svg>
      <div class="tl-tip"></div>
    </div>`;
  const svg = el.querySelector('svg') as SVGSVGElement;
  const tip = el.querySelector('.tl-tip') as HTMLElement;
  const wrap = el.querySelector('.tl-wrap') as HTMLElement;

  let lastKey = '';
  let hoverIdx = -1;

  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;

  function draw(): void {
    const d = s.chart.d;
    const t0 = d[0][0];
    const t1 = Math.max(d[d.length - 1][0], t0 + 60);
    const net = (p: [number, number, number]): number => p[1] - p[2];
    let yMax = 10;
    let yMin = 0;
    for (const p of d) {
      if (p[1] > yMax) yMax = p[1];
      if (p[2] > yMax) yMax = p[2];
      const n = net(p);
      if (n < yMin) yMin = n;
    }
    yMax *= 1.06;
    if (yMin < 0) yMin *= 1.06;

    const x = (tt: number): number => PAD.l + ((tt - t0) / (t1 - t0)) * plotW;
    const y = (v: number): number => PAD.t + (1 - (v - yMin) / (yMax - yMin)) * plotH;

    const path = (get: (p: [number, number, number]) => number): string =>
      d.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p[0]).toFixed(1)},${y(get(p)).toFixed(1)}`).join('');

    // Izgara + eksen etiketleri (soluk, geri planda)
    let g = '';
    const yTicks = 3;
    for (let i = 0; i <= yTicks; i++) {
      const v = yMin + ((yMax - yMin) * i) / yTicks;
      const yy = y(v);
      g += `<line x1="${PAD.l}" y1="${yy}" x2="${W - PAD.r}" y2="${yy}" class="tl-grid"/>`;
      g += `<text x="${PAD.l - 5}" y="${yy + 3}" class="tl-ylab">${fmtMoney(Math.round(v))}</text>`;
    }
    if (yMin < 0) {
      g += `<line x1="${PAD.l}" y1="${y(0)}" x2="${W - PAD.r}" y2="${y(0)}" class="tl-zero"/>`;
    }
    const xTicks = 3;
    for (let i = 0; i <= xTicks; i++) {
      const tt = t0 + ((t1 - t0) * i) / xTicks;
      g += `<text x="${x(tt)}" y="${H - 6}" class="tl-xlab" text-anchor="${i === 0 ? 'start' : i === xTicks ? 'end' : 'middle'}">${fmtTime(tt)}</text>`;
    }

    // Seriler (2px, uçta nokta)
    const last = d[d.length - 1];
    const series = `
      <path d="${path((p) => p[1])}" class="tl-line" stroke="${COL.rev}"/>
      <path d="${path((p) => p[2])}" class="tl-line" stroke="${COL.exp}"/>
      <path d="${path(net)}" class="tl-line" stroke="${COL.net}"/>
      <circle cx="${x(last[0])}" cy="${y(last[1])}" r="3" fill="${COL.rev}"/>
      <circle cx="${x(last[0])}" cy="${y(last[2])}" r="3" fill="${COL.exp}"/>
      <circle cx="${x(last[0])}" cy="${y(net(last))}" r="3" fill="${COL.net}"/>`;

    // Crosshair
    let cross = '';
    if (hoverIdx >= 0 && hoverIdx < d.length) {
      const p = d[hoverIdx];
      const cx = x(p[0]);
      cross = `<line x1="${cx}" y1="${PAD.t}" x2="${cx}" y2="${H - PAD.b}" class="tl-cross"/>
        <circle cx="${cx}" cy="${y(p[1])}" r="3.5" fill="${COL.rev}" stroke="#0a1330" stroke-width="1.5"/>
        <circle cx="${cx}" cy="${y(p[2])}" r="3.5" fill="${COL.exp}" stroke="#0a1330" stroke-width="1.5"/>
        <circle cx="${cx}" cy="${y(net(p))}" r="3.5" fill="${COL.net}" stroke="#0a1330" stroke-width="1.5"/>`;
      tip.style.display = 'block';
      const frac = (cx - PAD.l) / plotW;
      tip.style.left = `${Math.min(72, Math.max(28, frac * 100))}%`;
      tip.innerHTML = `<b>${fmtTime(p[0])}</b>
        <span style="color:${COL.rev}">▲ ${fmtMoney(p[1])}</span>
        <span style="color:${COL.exp}">▼ ${fmtMoney(p[2])}</span>
        <span style="color:${COL.net}">Σ ${fmtMoney(p[1] - p[2])}</span>`;
    } else {
      tip.style.display = 'none';
    }

    svg.innerHTML = g + series + cross;
  }

  function pickIndex(clientX: number): number {
    const r = svg.getBoundingClientRect();
    const frac = (clientX - r.left) / r.width;
    const px = frac * W;
    const d = s.chart.d;
    const t0 = d[0][0];
    const t1 = Math.max(d[d.length - 1][0], t0 + 60);
    const tt = t0 + ((px - PAD.l) / plotW) * (t1 - t0);
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < d.length; i++) {
      const dist = Math.abs(d[i][0] - tt);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    return best;
  }

  wrap.addEventListener('pointerdown', (e) => {
    hoverIdx = pickIndex(e.clientX);
    lastKey = '';
  });
  wrap.addEventListener('pointermove', (e) => {
    if (e.buttons > 0 || e.pointerType === 'mouse') {
      hoverIdx = pickIndex(e.clientX);
      lastKey = '';
    }
  });
  wrap.addEventListener('pointerleave', () => {
    hoverIdx = -1;
    lastKey = '';
  });

  function update(): void {
    const d = s.chart.d;
    const last = d[d.length - 1];
    const key = `${d.length}:${last[0]}:${last[1]}:${last[2]}:${hoverIdx}`;
    if (key === lastKey) return;
    lastKey = key;
    draw();
  }

  update();
  return { el, update };
}
