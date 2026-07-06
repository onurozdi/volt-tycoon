// Özel çizim SVG ikon seti — Neon Tech stili, stroke tabanlı.
// Hepsi currentColor kullanır; renk CSS'ten gelir, glow CSS drop-shadow ile verilir.

const S = (inner: string, vb = '0 0 64 64'): string =>
  `<svg viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

export const ART: Record<string, string> = {
  // --- Araçlar ---
  scooter: S(`
    <circle cx="14" cy="50" r="7"/>
    <circle cx="50" cy="50" r="7"/>
    <path d="M14 50h22"/>
    <path d="M42 16l8 34"/>
    <path d="M36 16h10"/>
    <path d="M36 50c0-10 3-22 6-34"/>
    <path d="M20 43l8-14" stroke-dasharray="3 4" opacity="0.7"/>
    <path d="M8 30l6-3M6 37l7-2" opacity="0.5"/>
  `),
  ebike: S(`
    <circle cx="15" cy="46" r="9"/>
    <circle cx="49" cy="46" r="9"/>
    <path d="M15 46l10-20h14l10 20"/>
    <path d="M25 26l-4-6h8"/>
    <path d="M39 26l4-8h6"/>
    <path d="M15 46l14-10 10 10"/>
    <path d="M31 33v-6" opacity="0.6"/>
    <path d="M28 42l3-5 3 5z" fill="currentColor" stroke="none" opacity="0.9"/>
  `),
  microcar: S(`
    <path d="M8 44v-6c0-2 1-4 3-5l6-3 6-8c1.5-2 4-3 6-3h10c5 0 9 3 11 7l3 6c2 1 4 3 4 6v6c0 1.5-1.5 3-3 3h-4"/>
    <path d="M8 44c0 1.5 1.5 3 3 3h4"/>
    <circle cx="20" cy="47" r="6"/>
    <circle cx="46" cy="47" r="6"/>
    <path d="M26 47h14"/>
    <path d="M25 28h22" opacity="0.7"/>
    <path d="M34 20v8" opacity="0.7"/>
    <path d="M50 36h5" opacity="0.9"/>
    <path d="M32 36l3-5-2-1 3-5" stroke-width="2" opacity="0.9"/>
  `),

  trike: S(`
    <circle cx="12" cy="48" r="7"/>
    <circle cx="40" cy="48" r="7"/>
    <circle cx="54" cy="48" r="7"/>
    <path d="M12 48l8-18h10l4 10"/>
    <path d="M20 30l-3-7h7"/>
    <rect x="34" y="28" width="26" height="14" rx="2"/>
    <path d="M40 28v14M50 28v14" opacity="0.5"/>
    <path d="M34 48h-8" opacity="0.7"/>
  `),
  golfcart: S(`
    <path d="M10 44v-8l6-2 4-14c0.5-2 2-3 4-3h6"/>
    <path d="M30 17h18c2 0 3 1.5 3 3v16"/>
    <path d="M30 17v19"/>
    <path d="M14 36h40c1.5 0 3 1.5 3 3v5"/>
    <circle cx="20" cy="48" r="6"/>
    <circle cx="48" cy="48" r="6"/>
    <path d="M26 48h16"/>
    <path d="M44 10h8l-4 7" opacity="0.7"/>
    <path d="M36 26h8" opacity="0.6"/>
  `),
  citypod: S(`
    <path d="M14 46c-3 0-5-2-5-5 0-8 4-19 10-22 4-2 18-2 24 0 7 2.5 12 12 12 20 0 4-2 7-6 7"/>
    <path d="M20 22h26" opacity="0.6"/>
    <path d="M32 19v14" opacity="0.6"/>
    <circle cx="22" cy="47" r="6"/>
    <circle cx="44" cy="47" r="6"/>
    <path d="M28 47h10"/>
    <path d="M46 34l3-4-2-1 3-4" stroke-width="2" opacity="0.9"/>
  `),

  sedan: S(`
    <path d="M8 42v-5c0-2 1.5-4 4-4l8-2 7-8c1.5-1.8 3.5-3 6-3h8c5 0 9 2.5 11 6l3 5 6 2c2 0.8 3 2.5 3 4v5c0 1.5-1.5 3-3 3h-3"/>
    <path d="M8 42c0 1.5 1.5 3 3 3h3"/>
    <circle cx="20" cy="45" r="6"/>
    <circle cx="46" cy="45" r="6"/>
    <path d="M26 45h14"/>
    <path d="M24 31h26" opacity="0.6"/>
    <path d="M35 21v10" opacity="0.6"/>
    <path d="M31 38l3-4-2-1 3-4" stroke-width="2" opacity="0.9"/>
  `),
  suv: S(`
    <path d="M8 42v-8c0-2 1.5-3.5 3.5-4l6.5-1.5 5-9c1-2 3-3.5 5.5-3.5h16c3 0 5.5 1.5 7 4l4 8.5 1.5 0.5c2 0.8 3 2.5 3 4.5v8c0 1.5-1.5 3-3 3h-3"/>
    <path d="M8 42c0 1.5 1.5 3 3 3h3"/>
    <circle cx="20" cy="45" r="6.5"/>
    <circle cx="47" cy="45" r="6.5"/>
    <path d="M27 45h13"/>
    <path d="M22 29h30" opacity="0.6"/>
    <path d="M33 18v11M45 18v11" opacity="0.5"/>
    <path d="M12 26l4-2" opacity="0.7"/>
  `),
  pickup: S(`
    <path d="M6 41v-7c0-1.5 1-3 3-3h3l6-11c1-2 3-3 5-3h9c2 0 3.5 1.5 3.5 3.5V30H56c1.5 0 3 1.5 3 3v8c0 1.5-1.5 2.5-3 2.5h-3"/>
    <path d="M6 41c0 1.5 1.5 2.5 3 2.5h3"/>
    <circle cx="18" cy="44" r="6"/>
    <circle cx="47" cy="44" r="6"/>
    <path d="M24 44h17"/>
    <path d="M35 30V20" opacity="0.6"/>
    <path d="M14 30h21" opacity="0.6"/>
    <path d="M56 33h-14" opacity="0.5"/>
  `),
  van: S(`
    <path d="M8 44V22c0-2 1.5-4 4-4h30c3 0 6 1.5 8 4l5 7c1.5 2 2 3.5 2 5.5V44"/>
    <path d="M8 44h49"/>
    <circle cx="19" cy="46" r="6"/>
    <circle cx="46" cy="46" r="6"/>
    <path d="M25 46h15"/>
    <path d="M42 18v12h13" opacity="0.7"/>
    <path d="M14 24h20v8H14z" opacity="0.5"/>
    <path d="M28 39l3-5-2-1 3-5" stroke-width="2" opacity="0.9"/>
  `),
  truck: S(`
    <path d="M4 40V14h26v26"/>
    <path d="M30 22h12c2 0 4 1 5 3l4 6c1 1.5 1.5 2.5 1.5 4v5h-6"/>
    <path d="M4 40h4M14 40h16M40 40h4"/>
    <circle cx="11" cy="43" r="5.5"/>
    <circle cx="37" cy="43" r="5.5"/>
    <circle cx="51" cy="43" r="5.5"/>
    <path d="M34 26h8l3 6h-11z" opacity="0.6"/>
    <path d="M9 20h16M9 27h16" opacity="0.4"/>
  `),
  bus: S(`
    <rect x="6" y="14" width="52" height="28" rx="5"/>
    <path d="M6 32h52" opacity="0.7"/>
    <path d="M13 20h9v8h-9zM27 20h10v8H27zM42 20h9v8h-9z" opacity="0.55"/>
    <circle cx="17" cy="45" r="5.5"/>
    <circle cx="47" cy="45" r="5.5"/>
    <path d="M23 45h18"/>
    <path d="M50 37h4" opacity="0.9"/>
    <path d="M28 12V8h8" opacity="0.5"/>
  `),
  factory: S(`
    <path d="M8 52V26l14 8v-8l14 8v-8l14 8"/>
    <path d="M50 34V12h6v40"/>
    <path d="M8 52h48"/>
    <path d="M14 42h6v6h-6zM26 42h6v6h-6zM38 42h6v6h-6z" opacity="0.6"/>
    <path d="M51 8c0-2 4-2 4 0" opacity="0.5"/>
  `),
  giga: S(`
    <path d="M6 52V30l12 7v-7l12 7v-7l12 7"/>
    <path d="M42 37V10h8v42"/>
    <path d="M6 52h52"/>
    <path d="M11 44h5v5h-5zM21 44h5v5h-5zM31 44h5v5h-5z" opacity="0.6"/>
    <path d="M58 24l-6 10h5l-4 8" opacity="0.9"/>
    <path d="M44 16h4M44 22h4" opacity="0.5"/>
  `),

  // --- UI ikonları ---
  bolt: S(`<path d="M36 6L16 36h12l-4 22 24-32H34l2-20z"/>`),
  gear: S(`
    <circle cx="32" cy="32" r="9"/>
    <path d="M32 8v8M32 48v8M8 32h8M48 32h8M15 15l6 6M43 43l6 6M49 15l-6 6M21 43l-6 6"/>
  `),
  megaphone: S(`
    <path d="M10 28v10c0 2 1.5 3.5 3.5 3.5H18l6 12c1 2 4 1.5 4-1V38"/>
    <path d="M18 28l28-14v38L18 40z"/>
    <path d="M52 26c3 1.5 3 8 0 10" opacity="0.7"/>
  `),
  box: S(`
    <path d="M10 22l22-10 22 10v22l-22 10-22-10z"/>
    <path d="M10 22l22 10 22-10M32 32v22"/>
  `),
  moon: S(`<path d="M42 10a22 22 0 1 0 12 30 18 18 0 0 1-12-30z"/><path d="M46 22l2 2M52 30l2 2" opacity="0.6"/>`),
  stack: S(`
    <path d="M10 20l22-8 22 8-22 8z"/>
    <path d="M10 32l22 8 22-8M10 44l22 8 22-8"/>
  `),
  gem: S(`
    <path d="M18 10h28l10 14-24 30L8 24z"/>
    <path d="M8 24h48M18 10l14 14 14-14M32 24v30" opacity="0.7"/>
  `),
  coin: S(`
    <circle cx="32" cy="32" r="22"/>
    <path d="M32 20v24M38 24c-2-2-10-3-11 2s4 5 6 6 7 2 6 7-9 4-12 1" stroke-width="3"/>
  `),
  flask: S(`
    <path d="M26 8h12M28 8v14L14 48c-2 4 1 8 5 8h26c4 0 7-4 5-8L36 22V8"/>
    <path d="M22 38h20" opacity="0.8"/>
    <circle cx="30" cy="46" r="1.6" fill="currentColor" stroke="none"/>
    <circle cx="38" cy="43" r="1.4" fill="currentColor" stroke="none"/>
  `),
  home: S(`<path d="M10 30L32 10l22 20"/><path d="M16 28v24h32V28"/><path d="M27 52V38h10v14"/>`),
  cart: S(`
    <path d="M8 12h8l7 28h26l7-20H20"/>
    <circle cx="27" cy="50" r="4.5"/>
    <circle cx="45" cy="50" r="4.5"/>
  `),
  wrench: S(`
    <path d="M40 8a14 14 0 0 0-13 19L9 45c-2.5 2.5-2.5 6.5 0 9s6.5 2.5 9 0l18-18a14 14 0 0 0 19-13c0-2-.5-4-1.5-6l-9 9-8-8 9-9c-2-1-4-1.5-5.5-1.5z"/>
  `),
  settings: S(`
    <path d="M26 8h12l2 8 6 3 8-3 6 10-6 6v6l6 6-6 10-8-3-6 3-2 8H26l-2-8-6-3-8 3-6-10 6-6v-6l-6-6 6-10 8 3 6-3z" stroke-width="2.2"/>
    <circle cx="32" cy="32" r="8"/>
  `),
  person: S(`<circle cx="32" cy="20" r="10"/><path d="M12 54c2-12 10-18 20-18s18 6 20 18"/>`),
  tie: S(`
    <circle cx="32" cy="16" r="8"/>
    <path d="M14 54c2-10 8-16 18-16s16 6 18 16"/>
    <path d="M32 38l-4 6 4 10 4-10z" fill="currentColor" stroke="none" opacity="0.9"/>
  `),
  play: S(`<circle cx="32" cy="32" r="24"/><path d="M26 22l16 10-16 10z" fill="currentColor" stroke="none"/>`),
  lock: S(`<rect x="14" y="28" width="36" height="26" rx="4"/><path d="M22 28v-8a10 10 0 0 1 20 0v8"/><circle cx="32" cy="40" r="3" fill="currentColor" stroke="none"/>`),
  trophy: S(`
    <path d="M20 10h24v12a12 12 0 0 1-24 0z"/>
    <path d="M20 14h-8c0 8 4 12 8 12M44 14h8c0 8-4 12-8 12"/>
    <path d="M32 34v8M24 50h16M28 42h8l2 8H26z"/>
  `),
  chart: S(`<path d="M10 8v46h46"/><path d="M18 44V30M30 44V20M42 44V26M54 44V14"/>`),
};

export function icon(name: string, cls = ''): string {
  const svg = ART[name] ?? ART.bolt;
  return `<span class="icon ${cls}">${svg}</span>`;
}
