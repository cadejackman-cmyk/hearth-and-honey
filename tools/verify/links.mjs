// Every root-absolute href/src/content URL must exist on disk; sitemap and pages must agree.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const SITE = 'https://hearthhoneybakery.com';
const SKIP = new Set(['node_modules', 'tools', 'docs', '.git']);

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    if (SKIP.has(name)) return [];
    const p = join(dir, name);
    return statSync(p).isDirectory() ? htmlFiles(p) : name.endsWith('.html') ? [p] : [];
  });
}

let failed = 0;
const pages = htmlFiles(ROOT);
for (const file of pages) {
  const html = readFileSync(file, 'utf8').replace(/<!--[\s\S]*?-->/g, ''); // comments hold example paths
  const refs = [...html.matchAll(/(?:href|src|content)="([^"]+)"/g)].map((m) => m[1]);
  for (const raw of refs) {
    if (!(raw.startsWith('/') || raw.startsWith(SITE))) continue;
    const path = raw.replace(SITE, '').split('#')[0].split('?')[0];
    if (!path) continue;
    const target = path.endsWith('/') ? join(ROOT, path, 'index.html') : join(ROOT, path);
    if (!existsSync(target)) { failed++; console.log(`MISSING  ${raw}   (in ${file.slice(ROOT.length)})`); }
  }
}
const sitemap = readFileSync(join(ROOT, 'sitemap.xml'), 'utf8');
for (const [, loc] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const path = loc.replace(SITE, '');
  const target = path.endsWith('/') ? join(ROOT, path, 'index.html') : join(ROOT, path);
  if (!existsSync(target)) { failed++; console.log(`SITEMAP  points at missing file: ${loc}`); }
}
for (const file of pages) {
  const rel = '/' + file.slice(ROOT.length).replaceAll('\\', '/').replace(/index\.html$/, '');
  if (rel !== '/404.html' && !sitemap.includes(`<loc>${SITE}${rel}</loc>`)) { failed++; console.log(`SITEMAP  page not listed: ${rel}`); }
}
console.log(failed ? `${failed} link problem(s)` : `All links, assets, and sitemap entries resolve (${pages.length} pages)`);
process.exit(failed ? 1 : 0);
