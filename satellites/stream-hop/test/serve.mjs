/* A static server for Jimothy's browser gates: the whole repo, real content types (a service worker
   registered from a typeless response is a console error, and the first visit gate counts errors),
   and an optional hook that can block or rewrite one path for a plant. */
import { createServer } from 'http';
import { readFileSync, statSync } from 'fs';
import { join, extname } from 'path';
export const ROOT = join(new URL('.', import.meta.url).pathname, '..', '..', '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
export function serve(port, hook) {
  const srv = createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]);
    if (hook) { const h = hook(p, q.url); if (h) { r.writeHead(h.status || 200, h.headers || {}); r.end(h.body || ''); return; } }
    let f = join(ROOT, p);
    try { if (statSync(f).isDirectory()) f = join(f, 'index.html'); r.writeHead(200, { 'Content-Type': TYPES[extname(f)] || 'application/octet-stream' }); r.end(readFileSync(f)); }
    catch (e) { r.writeHead(404, { 'Content-Type': 'text/plain' }); r.end('404'); }
  });
  return new Promise(res => srv.listen(port, '127.0.0.1', () => res(srv)));
}
