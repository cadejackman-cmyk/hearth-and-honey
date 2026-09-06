// Tiny static server that mimics GitHub Pages: clean URLs, index.html per folder, 404.html for misses.
// Run alone: npm run serve  (http://127.0.0.1:8080)   Used by the verify scripts on a random port.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2',
};
const isFile = async (p) => { try { return (await stat(p)).isFile(); } catch { return false; } };

export function startServer(port = 0) {
  const server = createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://local').pathname);
    if (path.includes('..')) { res.writeHead(400); res.end(); return; }
    let file = join(ROOT, path);
    if (path.endsWith('/')) file = join(file, 'index.html');
    else if (!(await isFile(file)) && (await isFile(join(file, 'index.html')))) { res.writeHead(301, { Location: `${path}/` }); res.end(); return; }
    let status = 200;
    if (!(await isFile(file))) { status = 404; file = join(ROOT, '404.html'); }
    res.writeHead(status, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(await readFile(file));
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve({ url: `http://127.0.0.1:${server.address().port}`, close: () => server.close() })));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { url } = await startServer(8080);
  console.log(`Serving ${ROOT} at ${url}`);
}
