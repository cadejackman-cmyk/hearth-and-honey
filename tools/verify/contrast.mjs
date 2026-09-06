// WCAG 2.x contrast check for every text/background pair the site uses.
// Run: npm run verify:contrast   (exit 1 on any failure)
const TOKENS = {
  cream: '#FAF3E8', cream2: '#F3E6D3', paper: '#FFFCF7',
  red: '#C84C5A', redInk: '#A93A48', redDeep: '#8E2C39',
  ink: '#3B2A22', inkSoft: '#6B5A50', white: '#FFFFFF',
};
// [foreground, background, minimum ratio, where it is used]
const PAIRS = [
  ['ink', 'cream', 4.5, 'body text'],
  ['ink', 'cream2', 4.5, 'body text on bands'],
  ['ink', 'paper', 4.5, 'body text on cards'],
  ['inkSoft', 'cream', 4.5, 'secondary text'],
  ['inkSoft', 'cream2', 4.5, 'secondary text on bands'],
  ['inkSoft', 'paper', 4.5, 'secondary text on cards'],
  ['redInk', 'cream', 4.5, 'links, h3, eyebrows'],
  ['redInk', 'cream2', 4.5, 'links on bands'],
  ['redInk', 'paper', 4.5, 'links on cards, light button label'],
  ['red', 'cream', 3, 'h1/h2 (large text), focus ring, borders'],
  ['red', 'cream2', 3, 'large headings on bands'],
  ['red', 'paper', 3, 'large headings on cards'],
  ['white', 'red', 4.5, 'primary button label'],
  ['white', 'redDeep', 4.5, 'primary button hover label'],
  ['cream', 'redDeep', 4.5, 'Instagram band text'],
  ['redInk', 'white', 4.5, 'band button label'],
];

function luminance(hex) {
  const [r, g, b] = hex.match(/[0-9a-f]{2}/gi)
    .map((h) => parseInt(h, 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

let failed = 0;
for (const [fg, bg, min, note] of PAIRS) {
  const r = ratio(TOKENS[fg], TOKENS[bg]);
  const ok = r >= min;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${fg} on ${bg}  ${r.toFixed(2)}:1  (min ${min})  ${note}`);
}
if (failed) {
  console.error(`\n${failed} pair(s) below threshold`);
  process.exit(1);
}
console.log('\nAll contrast pairs pass');
