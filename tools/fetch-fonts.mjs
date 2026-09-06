// Downloads the latin-subset variable woff2 files from Google Fonts so the site serves them itself.
// Run once: npm run fetch:fonts  (the files are committed; re-run only to change families)
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const OUT = fileURLToPath(new URL('../assets/fonts/', import.meta.url));
mkdirSync(OUT, { recursive: true });
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

const FAMILIES = [
  { query: 'Fraunces:ital,opsz,wght,SOFT@0,9..144,300..700,0..100;1,9..144,500,50', files: { normal: 'fraunces-latin.woff2', italic: 'fraunces-italic-latin.woff2' } },
  { query: 'Figtree:wght@300..900', files: { normal: 'figtree-latin.woff2' } },
];

for (const fam of FAMILIES) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${fam.query}&display=swap`, { headers: { 'User-Agent': UA } })).text();
  const blocks = css.matchAll(/\/\* (?<subset>[\w-]+) \*\/\s*@font-face\s*\{(?<body>[^}]+)\}/g);
  for (const { groups: { subset, body } } of blocks) {
    if (subset !== 'latin') continue;
    const style = /font-style:\s*(\w+)/.exec(body)[1];
    const url = /url\((https:[^)]+\.woff2)\)/.exec(body)[1];
    const name = fam.files[style];
    if (!name) continue;
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
    writeFileSync(OUT + name, buf);
    console.log(`${name}: ${(buf.length / 1024).toFixed(1)} KB`);
  }
}
