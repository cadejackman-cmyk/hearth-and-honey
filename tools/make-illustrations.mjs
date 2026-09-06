// Writes the hand-drawn-style SVG assets. Re-run after editing: npm run build:illustrations
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const OUT = fileURLToPath(new URL('../assets/img/', import.meta.url));
mkdirSync(OUT, { recursive: true });

const RED = '#C84C5A';
const CREAM = '#FAF3E8';
const CREAM2 = '#F3E6D3';
const PAPER = '#FFFCF7';

/** Archimedean spiral squashed to an ellipse, as an SVG path string. */
function spiral({ cx, cy, rx, ry, turns, points = 240, start = 0.06, rotate = -0.6 }) {
  const T = turns * Math.PI * 2;
  const pts = [];
  for (let i = 0; i <= points; i++) {
    const t = (i / points) * T;
    const k = start + (1 - start) * (t / T);
    pts.push([cx + k * rx * Math.cos(t + rotate), cy + k * ry * Math.sin(t + rotate)]);
  }
  return 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L');
}

const roll = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 250" role="img" aria-labelledby="hh-roll-title">
  <title id="hh-roll-title">Illustrated cinnamon roll with glaze</title>
  <g stroke="${RED}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M60 122 V158 A100 56 0 0 0 260 158 V122" fill="${CREAM2}"/>
    <ellipse cx="160" cy="122" rx="100" ry="60" fill="${CREAM2}"/>
    <path d="M78 118 C84 80 122 62 160 64 C206 66 244 88 246 120 C247 140 238 154 232 170 C226 184 212 184 212 168 C212 156 218 142 208 140 C192 138 184 156 178 176 C174 192 158 192 156 176 C154 158 150 148 140 146 C122 144 116 162 112 180 C108 194 94 192 94 176 C94 158 98 144 86 138 C76 132 74 124 78 118 Z" fill="${PAPER}"/>
    <path d="${spiral({ cx: 160, cy: 118, rx: 76, ry: 44, turns: 2.75 })}" fill="none"/>
  </g>
</svg>
`;

const swirl = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${spiral({ cx: 12, cy: 12, rx: 10, ry: 10, turns: 2.25, points: 120, start: 0.05 })}" fill="none" stroke="#000" stroke-width="2.4" stroke-linecap="round"/></svg>
`;

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${CREAM}"/><path d="${spiral({ cx: 32, cy: 32, rx: 22, ry: 22, turns: 2.5, points: 160, start: 0.05 })}" fill="none" stroke="${RED}" stroke-width="5.5" stroke-linecap="round"/></svg>
`;

writeFileSync(OUT + 'cinnamon-roll.svg', roll);
writeFileSync(OUT + 'swirl.svg', swirl);
writeFileSync(OUT + 'favicon.svg', favicon);
console.log('wrote cinnamon-roll.svg, swirl.svg, favicon.svg');
