// Processes the supplied images into everything the site needs. Run: npm run build:images
import sharp from 'sharp';
import potrace from 'potrace';
import pngToIco from 'png-to-ico';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SRC = fileURLToPath(new URL('./source/', import.meta.url));
const OUT = fileURLToPath(new URL('../assets/img/', import.meta.url));
const ROOT = fileURLToPath(new URL('../', import.meta.url));
mkdirSync(OUT, { recursive: true });

const RED = { r: 200, g: 76, b: 90 };
const CANVAS = { width: 2500, height: 1000 }; // 5:2, matches <img width="160" height="64">

// 1. Logo: paint every ink pixel brand red, trim, center on a 5:2 canvas, trace to SVG.
async function buildLogo() {
  const { data, info } = await sharp(SRC + 'logo.png').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  // If the PNG has real transparency, use it (with a curve that drops faint halos/shadows).
  // Otherwise recover alpha from the green channel (white = 255, ink = 76).
  let transparent = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] === 0) transparent++;
  const hasRealAlpha = transparent > data.length / 40;
  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < data.length; i += 4) {
    const a = hasRealAlpha
      ? Math.max(0, Math.min(1, (data[i + 3] - 48) / (255 - 48)))
      : Math.max(0, Math.min(1, (255 - data[i + 1]) / (255 - RED.g)));
    rgba[i] = RED.r; rgba[i + 1] = RED.g; rgba[i + 2] = RED.b; rgba[i + 3] = Math.round(a * 255);
  }
  console.log(`logo source ${info.width}x${info.height}, ${hasRealAlpha ? 'using alpha channel' : 'deriving alpha from white background'}`);
  const trimmed = await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ threshold: 12 }).png().toBuffer();
  const meta = await sharp(trimmed).metadata();
  const scale = Math.min((CANVAS.width * 0.94) / meta.width, (CANVAS.height * 0.9) / meta.height);
  const w = Math.round(meta.width * scale);
  const h = Math.round(meta.height * scale);
  const placed = await sharp({ create: { ...CANVAS, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: await sharp(trimmed).resize(w, h).toBuffer(), left: Math.round((CANVAS.width - w) / 2), top: Math.round((CANVAS.height - h) / 2) }])
    .png().toBuffer();
  await sharp(placed).resize(1000, 400).png().toFile(OUT + 'logo.png');
  await sharp(placed).resize(600, 240).png().toFile(OUT + 'logo-600.png');

  const forTrace = await sharp(placed).flatten({ background: '#ffffff' }).png().toBuffer();
  const svg = await new Promise((resolve, reject) =>
    potrace.trace(forTrace, { threshold: 165, turdSize: 8, optTolerance: 0.3, alphaMax: 1, color: '#C84C5A', background: 'transparent' },
      (err, out) => (err ? reject(err) : resolve(out))));
  const normalized = svg.replace(/<svg[^>]*>/, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS.width} ${CANVAS.height}" role="img" aria-label="Hearth &amp; Honey">`);
  writeFileSync(OUT + 'logo.svg', normalized);
  writeFileSync(OUT + 'logo-cream.svg', normalized.replaceAll('#C84C5A', '#FAF3E8'));
  console.log(`logo.svg: ${(Buffer.byteLength(normalized) / 1024).toFixed(1)} KB, wordmark ${w}x${h} on ${CANVAS.width}x${CANVAS.height}`);
}

// 2. Megan: 3:4 portraits and 1:1 squares, WebP + JPEG.
async function buildMegan() {
  const upright = await sharp(SRC + 'megan.jpg').rotate().toBuffer();
  const meta = await sharp(upright).metadata();
  for (const w of [480, 800]) {
    const h = Math.round((w * 4) / 3);
    await sharp(upright).resize(w, h, { fit: 'cover', position: 'attention' }).webp({ quality: 78 }).toFile(`${OUT}megan-portrait-${w}.webp`);
    await sharp(upright).resize(w, h, { fit: 'cover', position: 'attention' }).jpeg({ quality: 80, mozjpeg: true }).toFile(`${OUT}megan-portrait-${w}.jpg`);
  }
  const side = Math.min(meta.width, meta.height);
  const top = Math.round((meta.height - side) * 0.3); // keep the face, drop some sky
  for (const w of [300, 600]) {
    await sharp(upright).extract({ left: 0, top, width: side, height: side }).resize(w, w).webp({ quality: 78 }).toFile(`${OUT}megan-square-${w}.webp`);
    await sharp(upright).extract({ left: 0, top, width: side, height: side }).resize(w, w).jpeg({ quality: 80, mozjpeg: true }).toFile(`${OUT}megan-square-${w}.jpg`);
  }
  console.log(`megan: source ${meta.width}x${meta.height}, square crop from y=${top}`);
}

// 3. Roll PNG (for schema/social), Open Graph image, favicons.
async function buildRollOgIcons() {
  const rollSvg = readFileSync(OUT + 'cinnamon-roll.svg');
  const rollBig = await sharp(rollSvg, { density: 300 }).resize(900).png().toBuffer();
  await sharp({ create: { width: 1200, height: 900, channels: 4, background: '#FAF3E8' } })
    .composite([{ input: rollBig, gravity: 'centre' }]).png().toFile(OUT + 'cinnamon-roll-1200.png');

  const logo = await sharp(readFileSync(OUT + 'logo.svg'), { density: 300 }).resize(640).png().toBuffer();
  const rollSmall = await sharp(rollSvg, { density: 300 }).resize(400).png().toBuffer();
  const base = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <rect width="1200" height="630" fill="#FAF3E8"/>
    <rect y="606" width="1200" height="24" fill="#C84C5A"/>
    <text x="80" y="452" font-family="Georgia, 'Times New Roman', serif" font-size="36" fill="#3B2A22">Hand-rolled cinnamon rolls, baked in Draper, Utah</text>
    <text x="80" y="506" font-family="Verdana, Arial, sans-serif" font-size="24" fill="#A93A48">orders@hearthhoneybakery.com   ·   @hearth.honey.bakery</text>
  </svg>`);
  await sharp(base).composite([{ input: logo, left: 60, top: 120 }, { input: rollSmall, left: 740, top: 140 }]).png().toFile(OUT + 'og-image.png');

  const fav = readFileSync(OUT + 'favicon.svg');
  const png = (size) => sharp(fav, { density: 400 }).resize(size, size).png();
  for (const [name, size] of [['favicon-32.png', 32], ['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
    await png(size).toFile(OUT + name);
  }
  const ico = await pngToIco([await png(16).toBuffer(), await png(32).toBuffer(), await png(48).toBuffer()]);
  writeFileSync(ROOT + 'favicon.ico', ico);
  console.log('roll PNG, og-image.png, favicons written');
}

await buildLogo();
await buildMegan();
await buildRollOgIcons();
