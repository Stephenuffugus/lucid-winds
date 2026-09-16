/* G1, A FIRST VISIT (Lane D). The host's CDN punished an address for a burst (Sep 15: 143 requests, 109 answered
   429). The law, on a fresh profile at 412 x 915, twelve seconds after load:
     * at most 30 requests
     * none answered 400 or above, and no console error
     * no file from the six packed folders (sprites hero ui powers how fx) asked for on its own: the atlas took them
     * no LATER sheet asked for: the boot tier really is what a first visit needs
     * every BOOT sheet asked for: the page is really on the atlas
   Usage (from satellites/stream-hop):  node test/first-visit.mjs [--plant]
   --plant serves a map that knows nothing (window.JIMOTHY_ATLAS=null), the page falls back to one file per
   frame, and this gate must go red. */
import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import { join } from 'path';
import { serve, ROOT } from './serve.mjs';
const PLANT = process.argv.includes('--plant');
const PORT = 8973;
const MAP = '/satellites/stream-hop/assets/atlas/map.js';
const srv = await serve(PORT, p => (PLANT && p === MAP) ? { headers: { 'Content-Type': 'text/javascript' }, body: 'window.JIMOTHY_ATLAS=null;' } : null);
const atlas = JSON.parse(readFileSync(join(ROOT, 'satellites/stream-hop/assets/atlas/map.js'), 'utf8').replace(/^[\s\S]*?window\.JIMOTHY_ATLAS=/, '').replace(/;\s*$/, ''));
const boot = Object.keys(atlas.sheets).filter(k => atlas.sheets[k].boot), later = Object.keys(atlas.sheets).filter(k => !atlas.sheets[k].boot);
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const pg = await b.newPage(); await pg.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
const reqs = [], errs = [];
/* blob: and data: responses are the image tags' in memory copies of atlas frames; they never reach the network,
   so the edge never sees them. They are counted apart and printed, never folded into the law. */
const mem = [];
pg.on('response', r => { const u = r.url(); if (/^(blob|data):/.test(u)) { mem.push(u); return; }
  reqs.push({ u: u.replace(/^https?:\/\/[^/]+/, ''), s: r.status() }); });
pg.on('requestfailed', r => errs.push('request failed ' + r.url()));
pg.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
pg.on('pageerror', e => errs.push('page error ' + String(e).slice(0, 200)));
await pg.goto(`http://127.0.0.1:${PORT}/satellites/stream-hop/`, { waitUntil: 'load', timeout: 90000 });
await new Promise(r => setTimeout(r, 12000));
await b.close(); srv.close();
const fails = [];
const bad = reqs.filter(r => r.s >= 400);
const loose = reqs.filter(r => /\/stream-hop\/assets\/(sprites|hero|ui|powers|how|fx)\/[^?]+\.png/.test(r.u));
const sheetsAsked = new Set(reqs.map(r => (r.u.match(/\/assets\/atlas\/([^.?]+)\.png/) || [])[1]).filter(Boolean));
if (reqs.length > 30) fails.push(`${reqs.length} requests on a first visit, the law is at most 30`);
if (bad.length) fails.push(`${bad.length} answered 400 or above: ${bad.slice(0, 5).map(r => r.s + ' ' + r.u).join(', ')}`);
if (errs.length) fails.push(`${errs.length} console errors: ${errs.slice(0, 5).join(' | ')}`);
if (loose.length) fails.push(`${loose.length} packed frames asked for as files: ${loose.slice(0, 5).map(r => r.u).join(', ')}`);
const lateAsked = later.filter(k => sheetsAsked.has(k)); if (lateAsked.length) fails.push(`later sheets asked for at boot: ${lateAsked.join(', ')}`);
const bootMissed = boot.filter(k => !sheetsAsked.has(k)); if (bootMissed.length) fails.push(`boot sheets never asked for: ${bootMissed.join(', ')}`);
console.log(`  network requests ${reqs.length}, 400+ ${bad.length}, console errors ${errs.length}, packed files asked for alone ${loose.length}, in memory image tag copies ${mem.length} (not network)`);
console.log(`  sheets asked for: ${[...sheetsAsked].sort().join(' ') || 'none'}`);
for (const r of reqs) console.log('    ' + r.s + ' ' + r.u);
if (fails.length) { console.log(`FIRST VISIT FAILED${PLANT ? ' (PLANT)' : ''}\n  ` + fails.join('\n  ')); process.exit(1); }
console.log(`FIRST VISIT OK: ${reqs.length} requests, ${boot.length} boot sheets, no later sheet, no loose frame`);
