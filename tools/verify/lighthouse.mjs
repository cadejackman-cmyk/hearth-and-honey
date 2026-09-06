// Mobile Lighthouse on every page against the spec targets. HTML reports land in tools/reports/.
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { startServer } from '../serve.mjs';

const TARGETS = { performance: 95, accessibility: 100, 'best-practices': 95, seo: 100 };
const PAGES = ['/', '/menu/', '/about/', '/order/', '/policies/'];
const REPORTS = fileURLToPath(new URL('../reports/', import.meta.url));
mkdirSync(REPORTS, { recursive: true });

const { url, close } = await startServer();
const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new', '--no-sandbox'] });
let failed = 0;
for (const path of PAGES) {
  const { lhr, report } = await lighthouse(url + path, { port: chrome.port, output: 'html', logLevel: 'error', onlyCategories: Object.keys(TARGETS) });
  writeFileSync(`${REPORTS}lighthouse-${path.replaceAll('/', '') || 'home'}.html`, report);
  const cells = Object.entries(TARGETS).map(([cat, min]) => {
    const score = Math.round(lhr.categories[cat].score * 100);
    if (score < min) failed++;
    return `${cat}=${score}${score < min ? ` (target ${min})` : ''}`;
  });
  console.log(`${path.padEnd(8)} ${cells.join('   ')}`);
}
try { await chrome.kill(); } catch (err) { console.warn(`(chrome temp profile cleanup skipped: ${err.code})`); }
close();
if (failed) { console.error(`${failed} score(s) under target`); process.exit(1); }
console.log('All Lighthouse targets met');
