// İzometrik low-poly tesis arkaplanı — Egg Inc. esintili "flat 3D" ama
// Neon Tech paletiyle: koyu yüzeyler (üst açık, sol orta, sağ koyu) +
// tesise özgü neon kontur. Home içeriğinin ARKASINDA soluk durur,
// kaydırmayla yavaş parallax yapar. Her zaman EN BÜYÜK açık tesis çizilir.
// Kilometre taşı detayları (kedi kulübesi vb.) sahneye kalıcı eklenir.

import type { GameState } from '../core/state';

// Ortak yüzey renkleri (iso ışıklandırma: üst > sol > sağ)
const TOP = '#16295e';
const LEFT = '#0e1c42';
const RIGHT = '#091230';
const DARKIN = '#0a2438';

const GROUND = (accent: string): string => `
  <polygon points="180,100 345,185 180,270 15,185" fill="#081226" stroke="${accent}" stroke-opacity="0.22" stroke-width="1.4"/>
  <polygon points="180,124 298,185 180,246 62,185" fill="none" stroke="${accent}" stroke-opacity="0.10" stroke-width="1"/>`;

// --- GARAJ (cyan) — küçük kutu + kepenk + garaj önü + mini araç ---
const ISO_GARAGE = `
  ${GROUND('#35e0ff')}
  <g stroke="#35e0ff" stroke-width="1.5" stroke-linejoin="round">
    <polygon points="110,205 180,240 180,185 110,150" fill="${LEFT}"/>
    <polygon points="180,240 250,205 250,150 180,185" fill="${RIGHT}"/>
    <polygon points="180,115 250,150 180,185 110,150" fill="${TOP}"/>
    <polygon points="190,234 229,215 229,186 190,205" fill="${DARKIN}" stroke-width="1.3" class="scn-doorglow"/>
    <path d="M190 227l39-19M190 220l39-19M190 213l39-19" fill="none" stroke-width="0.9" opacity="0.55"/>
    <polygon points="124,193 148,205 148,190 124,178" fill="#11304f" stroke-width="1.2"/>
    <path d="M212 176l-6 8h6l-6 8" fill="none" stroke="#c8f43e" stroke-width="1.4"/>
    <polygon points="160,132 172,138 160,144 148,138" fill="${TOP}" stroke-width="1"/>
    <polygon points="148,138 160,144 160,134 148,128" fill="${LEFT}" stroke-width="1"/>
    <polygon points="160,144 172,138 172,128 160,134" fill="${RIGHT}" stroke-width="1"/>
  </g>
  <polygon points="190,234 229,215 244,245 205,264" fill="#0c1a3a" stroke="#35e0ff" stroke-opacity="0.3" stroke-width="1"/>
  <g stroke="#35e0ff" stroke-width="1.2" stroke-linejoin="round">
    <polygon points="252,242 282,227 282,219 252,234" fill="${RIGHT}"/>
    <polygon points="238,235 252,242 252,234 238,227" fill="${LEFT}"/>
    <polygon points="238,227 252,234 282,219 268,212" fill="${TOP}"/>
    <polygon points="252,228 268,220 268,214 252,222" fill="#11304f" stroke-width="0.9"/>
  </g>`;

// --- ATÖLYE (lime) — geniş kutu + testere dişli çatı + paletler ---
const ISO_WORKSHOP = `
  ${GROUND('#c8f43e')}
  <g stroke="#c8f43e" stroke-width="1.5" stroke-linejoin="round">
    <polygon points="80,200 180,250 180,200 80,150" fill="${LEFT}"/>
    <polygon points="180,250 280,200 280,150 180,200" fill="${RIGHT}"/>
    <polygon points="80,150 180,100 180,88 80,138" fill="${LEFT}" stroke-width="1.2"/>
    <polygon points="80,138 180,88 213,105 113,155" fill="${TOP}"/>
    <polygon points="113,167 213,117 213,105 113,155" fill="${LEFT}" stroke-width="1.2"/>
    <polygon points="113,155 213,105 247,121 147,171" fill="${TOP}"/>
    <polygon points="147,183 247,133 247,121 147,171" fill="${LEFT}" stroke-width="1.2"/>
    <polygon points="147,171 247,121 280,150 180,200" fill="${TOP}"/>
    <polygon points="196,238 220,226 220,200 196,212" fill="${DARKIN}" stroke-width="1.3" class="scn-doorglow"/>
    <path d="M208 232v-26" fill="none" stroke-width="0.9" opacity="0.5"/>
    <polygon points="232,220 256,208 256,192 232,204" fill="#151228" stroke-width="1"/>
    <path d="M240 216v-16M248 212v-16" fill="none" stroke-width="0.8" opacity="0.5"/>
  </g>
  <g stroke="#c8f43e" stroke-width="1.1" stroke-linejoin="round">
    <polygon points="96,232 116,242 116,232 96,222" fill="${LEFT}"/>
    <polygon points="116,242 132,234 132,224 116,232" fill="${RIGHT}"/>
    <polygon points="96,222 116,232 132,224 112,214" fill="${TOP}"/>
    <polygon points="102,220 114,226 114,218 102,212" fill="${TOP}" opacity="0.9"/>
  </g>`;

// --- FABRİKA (altın) — uzun gövde + 2 baca + pencere bandı + depo ---
const ISO_FACTORY = `
  ${GROUND('#ffd35e')}
  <g stroke="#ffd35e" stroke-width="1.5" stroke-linejoin="round">
    <polygon points="70,195 180,250 180,190 70,135" fill="${LEFT}"/>
    <polygon points="180,250 290,195 290,135 180,190" fill="${RIGHT}"/>
    <polygon points="180,80 290,135 180,190 70,135" fill="${TOP}"/>
    <polygon points="123,120 135,126 135,81 123,75" fill="${LEFT}" stroke-width="1.2"/>
    <polygon points="135,126 147,120 147,75 135,81" fill="${RIGHT}" stroke-width="1.2"/>
    <polygon points="135,69 147,75 135,81 123,75" fill="${TOP}" stroke-width="1"/>
    <polygon points="158,105 170,111 170,71 158,65" fill="${LEFT}" stroke-width="1.2"/>
    <polygon points="170,111 182,105 182,65 170,71" fill="${RIGHT}" stroke-width="1.2"/>
    <polygon points="170,59 182,65 170,71 158,65" fill="${TOP}" stroke-width="1"/>
    <polygon points="188,238 212,226 212,202 188,214" fill="${DARKIN}" stroke-width="1.3" class="scn-doorglow"/>
    <polygon points="200,225 224,213 224,193 200,205" fill="#241d08" stroke-width="1"/>
    <polygon points="230,210 254,198 254,178 230,190" fill="#241d08" stroke-width="1"/>
    <polygon points="260,195 284,183 284,163 260,175" fill="#241d08" stroke-width="1"/>
  </g>
  <circle cx="135" cy="66" r="2.6" fill="#ffd35e" class="scn-tip"/>
  <circle cx="135" cy="66" r="6" fill="#ffd35e" opacity="0.16"/>
  <circle cx="170" cy="56" r="2.2" fill="#ffd35e" class="scn-tip"/>
  <g stroke="#ffd35e" stroke-width="1.1" stroke-linejoin="round">
    <polygon points="65,247 95,262 95,240 65,225" fill="${LEFT}"/>
    <polygon points="95,262 125,247 125,225 95,240" fill="${RIGHT}"/>
    <polygon points="95,218 125,225 95,240 65,225" fill="${TOP}"/>
  </g>`;

// --- GİGAFACTORY (mor) — dev platform + ikinci kat + mast + dev bolt ---
const ISO_GIGA = `
  ${GROUND('#a98aff')}
  <g stroke="#a98aff" stroke-width="1.5" stroke-linejoin="round">
    <polygon points="50,185 180,250 180,180 50,115" fill="${LEFT}"/>
    <polygon points="180,250 310,185 310,115 180,180" fill="${RIGHT}"/>
    <polygon points="180,50 310,115 180,180 50,115" fill="${TOP}"/>
    <polygon points="110,120 180,155 180,115 110,80" fill="${LEFT}" stroke-width="1.3"/>
    <polygon points="180,155 250,120 250,80 180,115" fill="${RIGHT}" stroke-width="1.3"/>
    <polygon points="180,45 250,80 180,115 110,80" fill="${TOP}" stroke-width="1.3"/>
    <path d="M218 130h0M196 168l-14 20h12l-14 20" fill="none" stroke="#c8f43e" stroke-width="2.2"/>
    <path d="M196 232l96-46" fill="none" stroke-width="1.2" opacity="0.5" stroke-dasharray="6 4"/>
    <path d="M226 105l56 28M203 93l56 28" fill="none" stroke-width="0.8" opacity="0.35"/>
    <path d="M180 45V20" fill="none" stroke-width="1.3"/>
  </g>
  <circle cx="180" cy="17" r="2.6" fill="#ff5e6c" class="scn-beacon"/>
  <circle cx="180" cy="17" r="6" fill="#ff5e6c" opacity="0.15"/>
  <g fill="#9fd8ff" opacity="0.55">
    <circle cx="40" cy="40" r="1.1"/><circle cx="90" cy="22" r="0.9"/>
    <circle cx="280" cy="30" r="1.2"/><circle cx="330" cy="55" r="0.9"/>
  </g>`;

// --- Kilometre taşı detayları (binadan SONRA çizilir → sahanın önünde) ---
interface IsoDetail {
  id: string;
  when: (s: GameState) => boolean;
  svg: string;
}

const DETAILS: IsoDetail[] = [
  {
    // Tam Kadro → kedi kulübesi + çatısında kedi 😺
    id: 'cat',
    when: (s) => s.achievements.includes('allVehicles'),
    svg: `<g stroke="#ffd35e" stroke-width="1.1" stroke-linejoin="round">
      <polygon points="82,231 98,239 98,225 82,217" fill="${LEFT}"/>
      <polygon points="98,239 112,232 112,218 98,225" fill="${RIGHT}"/>
      <polygon points="82,217 98,225 112,218 96,210" fill="${TOP}"/>
      <path d="M101 234v-4a2.4 2.4 0 0 1 4.8 0v1.6" fill="#091026" stroke-width="0.9"/>
    </g>
    <path d="M90 212c0-3.4 1.2-5.2 2.9-5.2l.3-1.9 1.4 1.1h1.4l1.4-1.1.3 1.9c1.7 0 2.9 1.8 2.9 5.2z" fill="#ffd35e"/>
    <path d="M101 212c2-.2 3-1.5 2.8-3.3" fill="none" stroke="#ffd35e" stroke-width="1.2" stroke-linecap="round"/>`,
  },
  {
    // İlk milyon → sahada ⚡ reklam totemi
    id: 'billboard',
    when: (s) => s.achievements.includes('earned1m'),
    svg: `<g>
      <path d="M60 205v-83" stroke="#22406e" stroke-width="2.2"/>
      <rect x="38" y="92" width="44" height="26" rx="3" fill="#0e1c3e" stroke="#ffd35e" stroke-width="1.5"/>
      <path d="M56 97l-6 8h6l-6 8" stroke="#c8f43e" stroke-width="1.6" fill="none"/>
      <path d="M64 102h11M64 108h8" stroke="#ffd35e" stroke-width="1.3" opacity="0.7"/>
    </g>`,
  },
  {
    // İş Gücü (150 çalışan) → şirket bayrağı
    id: 'flag',
    when: (s) => s.achievements.includes('techLegion'),
    svg: `<g>
      <path d="M290 205v-85" stroke="#22406e" stroke-width="2"/>
      <path d="M290 120c-5.5 0-11 2-16.5 4 5.5 2 11 4 16.5 4z" fill="#c8f43e" opacity="0.92"/>
    </g>`,
  },
  {
    // Araştırma Ustası → çatıya uydu çanağı (giga sahnesinde)
    id: 'dish',
    when: (s) => s.achievements.includes('researchMaster') && !!s.locations['gigafactory'],
    svg: `<g>
      <path d="M214 76l-4-8" stroke="#a98aff" stroke-width="1.5"/>
      <path d="M205 66a8 8 0 0 1 11-7" fill="none" stroke="#a98aff" stroke-width="1.7"/>
      <circle cx="211" cy="62" r="1.6" fill="#a98aff"/>
    </g>`,
  },
];

const SCENES: Record<string, string> = {
  garage: ISO_GARAGE,
  workshop: ISO_WORKSHOP,
  factory: ISO_FACTORY,
  gigafactory: ISO_GIGA,
};

const LOC_ORDER = ['garage', 'workshop', 'factory', 'gigafactory'];

function currentLoc(s: GameState): string {
  let cur = 'garage';
  for (const id of LOC_ORDER) if (s.locations[id]) cur = id;
  return cur;
}

/** Arkaplanı etkileyen durumun imzası — değişmedikçe SVG yeniden kurulmaz */
export function isoSignature(s: GameState): string {
  return currentLoc(s) + ':' + DETAILS.map((d) => (d.when(s) ? '1' : '0')).join('') + ':' + s.companyName;
}

export function isoSVG(s: GameState): string {
  const parts: string[] = [SCENES[currentLoc(s)]];
  for (const d of DETAILS) if (d.when(s)) parts.push(d.svg);
  return `<svg viewBox="0 0 360 290" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">${parts.join('')}</svg>`;
}
