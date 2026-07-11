// Görsel tesis sahnesi — Home'un tepesinde, açılan tesisle büyüyen panorama.
// Neon Tech stili: koyu gövdeler + tesise özgü neon kontur (cyan/lime/altın/mor).
// Kilometre taşları sahneye küçük detaylar ekler (kedi kulübesi vb.).
// Sabit yükseklik: içerik büyür ama sayfa düzeni asla oynamaz.

import type { GameState } from '../core/state';

interface SceneDetail {
  id: string;
  when: (s: GameState) => boolean;
  svg: string;
}

// --- Binalar ---

const GARAGE = `
  <g>
    <rect x="16" y="58" width="60" height="31" fill="#0b1531" stroke="#35e0ff" stroke-width="1.6"/>
    <path d="M13 58h66l-7-10H20z" fill="#0e1c3e" stroke="#35e0ff" stroke-width="1.6"/>
    <rect x="26" y="66" width="26" height="23" fill="#0a2438" stroke="#35e0ff" stroke-width="1.4" class="scn-doorglow"/>
    <path d="M26 72h26M26 78h26M26 84h26" stroke="#35e0ff" stroke-width="1" opacity="0.55"/>
    <rect x="60" y="66" width="11" height="9" fill="#11304f" stroke="#35e0ff" stroke-width="1.2"/>
    <path d="M40 60l-3 4h4l-3 4" stroke="#c8f43e" stroke-width="1.3" fill="none" opacity="0.9"/>
  </g>
  <g>
    <path d="M86 89V58" stroke="#22406e" stroke-width="2"/>
    <circle cx="86" cy="56" r="3" fill="#ffd35e" opacity="0.9"/>
    <circle cx="86" cy="56" r="6.5" fill="#ffd35e" opacity="0.16"/>
  </g>`;

const WORKSHOP = `
  <g>
    <rect x="94" y="63" width="68" height="26" fill="#0b1531" stroke="#c8f43e" stroke-width="1.6"/>
    <path d="M94 63V51l17 12V51l17 12V51l17 12V51l17 12" fill="none" stroke="#c8f43e" stroke-width="1.4"/>
    <rect x="102" y="70" width="16" height="19" fill="#0a2438" stroke="#c8f43e" stroke-width="1.3"/>
    <path d="M110 70v19" stroke="#c8f43e" stroke-width="0.9" opacity="0.5"/>
    <rect x="128" y="70" width="24" height="8" fill="#151228" stroke="#c8f43e" stroke-width="1"/>
    <path d="M136 70v8M144 70v8" stroke="#c8f43e" stroke-width="0.8" opacity="0.5"/>
  </g>`;

const FACTORY = `
  <g>
    <rect x="170" y="47" width="82" height="42" fill="#0b1531" stroke="#ffd35e" stroke-width="1.6"/>
    <rect x="180" y="28" width="8" height="19" fill="#0e1c3e" stroke="#ffd35e" stroke-width="1.4"/>
    <rect x="196" y="34" width="8" height="13" fill="#0e1c3e" stroke="#ffd35e" stroke-width="1.4"/>
    <circle cx="184" cy="25" r="2.4" fill="#ffd35e" opacity="0.9" class="scn-tip"/>
    <circle cx="184" cy="25" r="5.5" fill="#ffd35e" opacity="0.15"/>
    <circle cx="200" cy="31" r="2" fill="#ffd35e" opacity="0.8" class="scn-tip"/>
    <rect x="176" y="72" width="14" height="17" fill="#0a2438" stroke="#ffd35e" stroke-width="1.2"/>
    <rect x="212" y="56" width="10" height="7" fill="#151228" stroke="#ffd35e" stroke-width="1"/>
    <rect x="226" y="56" width="10" height="7" fill="#151228" stroke="#ffd35e" stroke-width="1"/>
    <rect x="240" y="56" width="10" height="7" fill="#151228" stroke="#ffd35e" stroke-width="1"/>
    <rect x="212" y="68" width="10" height="7" fill="#151228" stroke="#ffd35e" stroke-width="1"/>
    <rect x="226" y="68" width="10" height="7" fill="#151228" stroke="#ffd35e" stroke-width="1"/>
    <rect x="240" y="68" width="10" height="7" fill="#151228" stroke="#ffd35e" stroke-width="1"/>
  </g>`;

const GIGA = `
  <g>
    <rect x="258" y="40" width="94" height="49" fill="#0b1531" stroke="#a98aff" stroke-width="1.6"/>
    <path d="M258 40l47-9 47 9" fill="#0e1c3e" stroke="#a98aff" stroke-width="1.6"/>
    <path d="M305 31V19" stroke="#a98aff" stroke-width="1.4"/>
    <circle cx="305" cy="17" r="2.4" fill="#ff5e6c" class="scn-beacon"/>
    <circle cx="305" cy="17" r="5.5" fill="#ff5e6c" opacity="0.15"/>
    <path d="M304 50l-8 11h8l-8 11" stroke="#c8f43e" stroke-width="2" fill="none" opacity="0.95"/>
    <path d="M266 78h78" stroke="#a98aff" stroke-width="1.4" opacity="0.5" stroke-dasharray="6 4"/>
    <path d="M264 37l38-7M348 37l-30-5.5" stroke="#a98aff" stroke-width="0.9" opacity="0.4"/>
  </g>`;

// Sıradaki kilitli tesisin silueti — merak unsuru (soluk, kesikli)
const TEASERS: Record<string, string> = {
  workshop: `<g opacity="0.14"><rect x="94" y="51" width="68" height="38" fill="none" stroke="#7fd8ff" stroke-width="1.4" stroke-dasharray="4 4"/><text x="128" y="75" fill="#7fd8ff" font-size="13" text-anchor="middle" font-weight="800">?</text></g>`,
  factory: `<g opacity="0.14"><rect x="170" y="47" width="82" height="42" fill="none" stroke="#7fd8ff" stroke-width="1.4" stroke-dasharray="4 4"/><text x="211" y="72" fill="#7fd8ff" font-size="13" text-anchor="middle" font-weight="800">?</text></g>`,
  gigafactory: `<g opacity="0.14"><rect x="258" y="40" width="94" height="49" fill="none" stroke="#7fd8ff" stroke-width="1.4" stroke-dasharray="4 4"/><text x="305" y="68" fill="#7fd8ff" font-size="13" text-anchor="middle" font-weight="800">?</text></g>`,
};

// Gökyüzü: tesis büyüdükçe yıldızlar çoğalır
const STARS_MID = `<g fill="#9fd8ff" opacity="0.5"><circle cx="44" cy="14" r="1"/><circle cx="148" cy="9" r="1.2"/><circle cx="232" cy="17" r="0.9"/></g>`;
const STARS_FULL = `<g fill="#9fd8ff" opacity="0.6"><circle cx="20" cy="22" r="0.9"/><circle cx="106" cy="20" r="1"/><circle cx="196" cy="8" r="1.1"/><circle cx="262" cy="12" r="0.9"/><circle cx="340" cy="10" r="1.2"/></g>
  <path d="M30 6l10 4" stroke="#9fd8ff" stroke-width="1" opacity="0.35" stroke-linecap="round"/>`;

// --- Kilometre taşı detayları ---
// Koşul başarım listesine bakar: sahne, oyuncunun hikâyesini biriktirir.
const DETAILS: SceneDetail[] = [
  {
    // Tam Kadro (tüm araçlar) → kedi kulübesi + garaj çatısında kedi 😺
    id: 'cat',
    when: (s) => s.achievements.includes('allVehicles'),
    svg: `<g>
      <rect x="2" y="78" width="11" height="11" fill="#0e1c3e" stroke="#ffd35e" stroke-width="1.2"/>
      <path d="M1 78l6.5-6 6.5 6" fill="none" stroke="#ffd35e" stroke-width="1.2"/>
      <path d="M5.5 89v-4a2 2 0 0 1 4 0v4" fill="#091026" stroke="#ffd35e" stroke-width="1"/>
      <path d="M60 48c0-3.5 1.2-5.5 3-5.5l.4-2 1.4 1.2h1.4l1.4-1.2.4 2c1.8 0 3 2 3 5.5z" fill="#ffd35e"/>
      <path d="M71 48c2.2-.2 3.2-1.6 3-3.6" fill="none" stroke="#ffd35e" stroke-width="1.3" stroke-linecap="round"/>
    </g>`,
  },
  {
    // İlk milyon → atölyenin üstünde ⚡ reklam panosu
    id: 'billboard',
    when: (s) => s.achievements.includes('earned1m') && !!s.locations['workshop'],
    svg: `<g>
      <path d="M126 51V38" stroke="#22406e" stroke-width="2"/>
      <rect x="112" y="24" width="28" height="14" rx="2" fill="#0e1c3e" stroke="#ffd35e" stroke-width="1.4"/>
      <path d="M124 27l-4 5h4l-4 5" stroke="#c8f43e" stroke-width="1.4" fill="none"/>
      <path d="M130 30h6M130 34h4" stroke="#ffd35e" stroke-width="1.2" opacity="0.7"/>
    </g>`,
  },
  {
    // İş Gücü (150 çalışan) → sahanın sonunda şirket bayrağı
    id: 'flag',
    when: (s) => s.achievements.includes('techLegion'),
    svg: `<g>
      <path d="M355 89V48" stroke="#22406e" stroke-width="1.8"/>
      <path d="M355 48c-4 0-8 1.5-12 3 4 1.5 8 3 12 3z" fill="#c8f43e" opacity="0.9"/>
    </g>`,
  },
  {
    // Araştırma Ustası → gigafactory çatısına uydu çanağı
    id: 'dish',
    when: (s) => s.achievements.includes('researchMaster') && !!s.locations['gigafactory'],
    svg: `<g>
      <path d="M332 40l-3-6" stroke="#a98aff" stroke-width="1.4"/>
      <path d="M325 33a7 7 0 0 1 10-6" fill="none" stroke="#a98aff" stroke-width="1.6"/>
      <circle cx="331" cy="29" r="1.4" fill="#a98aff"/>
    </g>`,
  },
];

const LOC_ORDER = ['garage', 'workshop', 'factory', 'gigafactory'];

/** Sahneyi etkileyen durumun imzası — değişmedikçe SVG yeniden kurulmaz */
export function sceneSignature(s: GameState): string {
  const locs = LOC_ORDER.map((id) => (s.locations[id] ? '1' : '0')).join('');
  const dets = DETAILS.map((d) => (d.when(s) ? '1' : '0')).join('');
  return locs + ':' + dets;
}

export function sceneSVG(s: GameState): string {
  const open = (id: string): boolean => !!s.locations[id];
  const parts: string[] = [];
  // Gökyüzü
  if (open('gigafactory')) parts.push(STARS_MID, STARS_FULL);
  else if (open('factory')) parts.push(STARS_MID);
  // Binalar (soldan sağa) + sıradaki tesisin soluk silueti
  parts.push(GARAGE);
  if (open('workshop')) parts.push(WORKSHOP);
  if (open('factory')) parts.push(FACTORY);
  if (open('gigafactory')) parts.push(GIGA);
  const next = LOC_ORDER.find((id) => !open(id));
  if (next && TEASERS[next]) parts.push(TEASERS[next]);
  // Kilometre taşı detayları
  for (const d of DETAILS) if (d.when(s)) parts.push(d.svg);
  return `<svg viewBox="0 0 360 96" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg">${parts.join('')}</svg>`;
}
