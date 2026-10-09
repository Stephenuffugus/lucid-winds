/* A static server for the dewball folder, for the forge gates and shots only.
 * Headless Chrome cannot fetch a GLB from file:// (no CORS for file URLs), so every
 * picture or gate that loads models goes through this.
 *
 *   import { serve } from './serve.mjs';
 *   const s = await serve({ block: ['teapot.glb'], virtual: { '/__gate/index.json': '{...}' } });
 *   s.url  ->  http://127.0.0.1:<port>/        s.close()
 *
 * block: request paths ending in one of these answer 404, which is how a gate proves
 * the primitive fallback without renaming a file on disk. virtual: in memory files.
 * Every request is logged so a gate can say what the page actually asked for.
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const GAME_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const TYPES = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.glb': 'model/gltf-binary',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.webmanifest': 'application/manifest+json', '.css': 'text/css' };

export function serve(opts = {}) {
  const block = opts.block || [], virtual = opts.virtual || {}, log = [];
  const ROOT = opts.root ? path.resolve(opts.root) : GAME_ROOT;      /* another build of the game, for A/B probes */
  const server = http.createServer((req, res) => {
    const p = decodeURIComponent(req.url.split('?')[0]);
    log.push(p);
    if (block.some(b => p.endsWith('/' + b) || p === b)) { res.writeHead(404); res.end('blocked by the gate'); return; }
    if (virtual[p] !== undefined) { res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' }); res.end(virtual[p]); return; }
    const f = path.join(ROOT, p === '/' ? '/index.html' : p);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => {
    const port = server.address().port;
    resolve({ url: 'http://127.0.0.1:' + port + '/', log, close: () => new Promise(r => server.close(r)) });
  }));
}
