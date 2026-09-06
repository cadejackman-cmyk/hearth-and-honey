// axe-core WCAG 2.2 AA scan of every page at two widths, then keyboard/behavior checks that axe cannot see.
import { chromium } from 'playwright-core';
import AxeBuilder from '@axe-core/playwright';
import { startServer } from '../serve.mjs';

const PAGES = ['/', '/menu/', '/about/', '/order/', '/policies/', '/404.html'];
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
const { url, close } = await startServer();
const browser = await chromium.launch({ channel: 'chrome', headless: true });
let failures = 0;
const check = (ok, message) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${message}`); if (!ok) failures++; };

for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  for (const path of PAGES) {
    await page.goto(url + path, { waitUntil: 'networkidle' });
    const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    console.log(`${viewport.width}px ${path}: ${violations.length} violation(s)`);
    for (const v of violations) {
      failures++;
      console.log(`  - [${v.impact}] ${v.id}: ${v.help}`);
      for (const node of v.nodes.slice(0, 4)) console.log(`      ${node.target.join(' ')}`);
    }
  }
  await context.close();
}

// Keyboard and behavior, mobile width
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await mobile.newPage();
await page.goto(url + '/', { waitUntil: 'networkidle' });
await page.keyboard.press('Tab');
check(await page.evaluate(() => document.activeElement?.classList.contains('skip-link')), 'first Tab lands on the skip link');
await page.keyboard.press('Enter');
check(await page.evaluate(() => location.hash === '#main'), 'skip link jumps to #main');
const toggle = page.locator('.nav-toggle');
await toggle.focus();
await page.keyboard.press('Enter');
check((await toggle.getAttribute('aria-expanded')) === 'true', 'nav toggle opens with Enter');
check(await page.locator('#site-nav a').first().isVisible(), 'nav links are visible when open');
await page.keyboard.press('Escape');
check((await toggle.getAttribute('aria-expanded')) === 'false', 'Escape closes the nav');
check(await page.evaluate(() => document.activeElement?.classList.contains('nav-toggle')), 'focus returns to the toggle after Escape');

await page.goto(url + '/order/?item=cinnamon-rolls', { waitUntil: 'networkidle' });
check((await page.locator('#item').inputValue()) === 'cinnamon-rolls', '?item= preselects the item');
check((await page.locator('#date').getAttribute('min')) !== null, 'date field has a min set by script');
await page.locator('#order-form button[type=submit]').click();
check(await page.locator('#order-errors').isVisible(), 'error summary appears on an empty submit');
check(await page.evaluate(() => document.activeElement?.id === 'order-errors'), 'error summary receives focus');
check((await page.locator('#name').getAttribute('aria-invalid')) === 'true', 'invalid field is marked aria-invalid');
check((await page.locator('#name-error').textContent()).length > 0, 'inline error message is shown');
await page.locator('#order-errors a').first().click();
check(await page.evaluate(() => document.activeElement?.id === 'name'), 'error summary link moves focus to the field');
await page.fill('#name', 'Sam Lee');
check((await page.locator('#name').getAttribute('aria-invalid')) === 'false', 'error clears when the field is corrected');
await page.fill('#email', 'sam@example.com');
await page.fill('#quantity', '12');
await page.fill('#date', await page.locator('#date').getAttribute('min'));
await page.locator('#order-form button[type=submit]').click();
check(await page.locator('#order-copy').isVisible(), 'copy panel appears after a valid submit');
const composed = await page.locator('#order-copy-text').inputValue();
check(composed.includes('To: orders@hearthhoneybakery.com'), 'composed email is addressed to orders@');
check(composed.includes('Subject: Order request: Cinnamon Rolls × 12'), 'composed subject carries item and quantity');
check(composed.includes('Name: Sam Lee'), 'composed body carries the name');
await mobile.close();

// Reduced motion
const reduced = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
const r = await reduced.newPage();
await r.goto(url + '/', { waitUntil: 'networkidle' });
check((await r.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length)) === 0, 'no running animations under prefers-reduced-motion');
await reduced.close();
const normal = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const n = await normal.newPage();
await n.goto(url + '/', { waitUntil: 'networkidle' });
check((await n.evaluate(() => document.getAnimations().length)) > 0, 'steam animates when motion is allowed');
await normal.close();

await browser.close();
close();
if (failures) { console.error(`\n${failures} accessibility/behavior failure(s)`); process.exit(1); }
console.log('\nAll accessibility and behavior checks passed');
