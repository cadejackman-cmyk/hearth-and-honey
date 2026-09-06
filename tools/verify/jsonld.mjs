// Every JSON-LD block must parse, carry the expected @types, and have the fields Google/AI readers look for.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const REQUIRED = {
  Bakery: ['name', 'url', 'email', 'address', 'sameAs', 'founder', 'image', 'logo'],
  Person: ['name', 'jobTitle', 'image', 'url'],
  WebSite: ['url', 'name', 'publisher'],
  WebPage: ['url', 'name', 'description', 'isPartOf'],
  BreadcrumbList: ['itemListElement'],
  Menu: ['hasMenuSection'],
  Product: ['name', 'description', 'image', 'brand'],
  FAQPage: ['mainEntity'],
};
const PAGES = {
  'index.html': ['Bakery', 'Person', 'WebSite', 'WebPage', 'BreadcrumbList', 'Menu', 'Product'],
  'menu/index.html': ['Bakery', 'Person', 'WebSite', 'WebPage', 'BreadcrumbList', 'Menu', 'Product'],
  'about/index.html': ['Bakery', 'Person', 'WebSite', 'WebPage', 'BreadcrumbList'],
  'order/index.html': ['Bakery', 'Person', 'WebSite', 'WebPage', 'BreadcrumbList', 'FAQPage'],
};

let failed = 0;
for (const [file, expected] of Object.entries(PAGES)) {
  const html = readFileSync(ROOT + file, 'utf8');
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  if (blocks.length === 0) { failed++; console.log(`${file}: no JSON-LD block`); continue; }
  const nodes = [];
  for (const block of blocks) {
    try { const json = JSON.parse(block); nodes.push(...(json['@graph'] || [json])); }
    catch (err) { failed++; console.log(`${file}: JSON-LD parse error: ${err.message}`); }
  }
  const types = nodes.map((n) => n['@type']);
  for (const type of expected) if (!types.includes(type)) { failed++; console.log(`${file}: missing @type ${type}`); }
  for (const node of nodes) for (const key of REQUIRED[node['@type']] || []) {
    if (node[key] === undefined) { failed++; console.log(`${file}: ${node['@type']} is missing "${key}"`); }
  }
  const ids = new Set(nodes.map((n) => n['@id']).filter(Boolean));
  for (const ref of JSON.stringify(nodes).matchAll(/\{"@id":"([^"]+)"\}/g)) {
    if (!ids.has(ref[1])) { failed++; console.log(`${file}: reference to undefined @id ${ref[1]}`); }
  }
  const canonical = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1];
  const webpage = nodes.find((n) => n['@type'] === 'WebPage');
  if (webpage && webpage.url !== canonical) { failed++; console.log(`${file}: WebPage.url ${webpage.url} != canonical ${canonical}`); }
  console.log(`${file}: ${nodes.length} nodes (${types.join(', ')})`);
}
console.log(failed ? `${failed} structured-data problem(s)` : 'Structured data OK');
process.exit(failed ? 1 : 0);
