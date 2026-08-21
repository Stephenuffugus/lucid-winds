/* Build Whim-marketplace editions of the self-contained games (2026-08-21).
   Whim hosts an uploaded single HTML file on ITS origin, so each edition:
   - neutralises the service worker registration (foreign origin, no sw.js)
   - carries a small studio badge linking back to lucidwinds.com (the funnel)
   The game files on disk are untouched; output goes to dist/whim/. */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const GAMES = [
  ['deepwell',  'DEEPWELL'],
  ['blackout',  'BLACKOUT'],
  ['wireworm',  'WIREWORM'],
  ['parallel',  'PARALLEL'],
  ['siege',     'SIEGE OF ONE'],
];

mkdirSync('dist/whim', { recursive: true });

const BADGE = `
<a href="https://lucidwinds.com/portal/?from=whim" target="_blank" rel="noopener"
   style="position:fixed;right:10px;bottom:10px;z-index:99999;display:inline-flex;align-items:center;gap:6px;
   padding:6px 10px;border-radius:999px;background:rgba(10,14,10,.85);border:1px solid rgba(200,168,75,.55);
   color:#e8dcc8;font:600 11px system-ui,sans-serif;text-decoration:none;opacity:.85">
  🐺 Sky Wolf Studios · 160+ more free games</a>
`;

for (const [slug, name] of GAMES) {
  let s = readFileSync(`satellites/${slug}/index.html`, 'utf8');
  const before = s.length;
  // service worker: a foreign host has no sw.js and must not try to register one
  s = s.replace(/navigator\.serviceWorker\.register\([^)]*\)/g, 'Promise.resolve()');
  // manifest + icon links are meaningless off-origin; drop them so the
  // hosted copy makes zero requests it cannot answer
  s = s.replace(/<link[^>]*rel="manifest"[^>]*>\s*/g, '');
  s = s.replace(/<link[^>]*rel="(?:icon|apple-touch-icon|shortcut icon)"[^>]*>\s*/g, '');
  const i = s.lastIndexOf('</body>');
  if (i < 0) { console.error(slug + ': no </body>'); process.exit(1); }
  s = s.slice(0, i) + BADGE + s.slice(i);
  const out = `dist/whim/${slug}.html`;
  writeFileSync(out, s);
  console.log(out.padEnd(28), Math.round(s.length / 1024) + 'KB', '(sw stripped:', before !== s.length, ')');
}
console.log('done — upload each file at buywhim.com (single HTML file per listing)');
