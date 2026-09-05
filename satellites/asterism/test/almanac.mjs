#!/usr/bin/env node
/* The keepsake end of the app: the link and the poster.
 *
 *   node test/almanac.mjs
 *
 * What it asserts, each watched to fail:
 *   1. a constellation drawn, named and kept turns up in the almanac
 *   2. SHARE makes a link, and it carries Hipparcos numbers rather than row
 *      indices, so it survives a catalogue update
 *   3. a FRESH browser opening that link draws the same three stars and two
 *      lines, under the same name, with the same myth, from the same place and
 *      the same night
 *   4. the link carries the place at city precision and nothing sharper
 *   5. EXPORT produces a real PNG of 2048 by 2560
 *   6. and the bottom of it is not blank: the footer and the credit are drawn
 *
 * ⛔ Every press is a real pointer event. The poster is the ACTUAL blob the
 * export made, captured by wrapping createObjectURL, not a second render.
 */
import { serve, open, reporter, tap, tapAt, sleep, waitFrames } from './harness.mjs';

const VEGA = 91262, DENEB = 102098, ALTAIR = 97649;
const { base, close } = await serve();
const { browser, page, errors } = await open(base);
const { fails, say } = reporter();
const dev = (fn, ...a) => page.evaluate(fn, ...a);

await dev(() => localStorage.setItem('lw_asterism_v1',
  JSON.stringify({ v: 1, place: null, entries: [], settings: { sound: 1, twinkle: 1, motion: 1 }, seen: { how: 1 } })));
await page.reload({ waitUntil: 'load' });
await page.waitForFunction(() => window.ASTERISM_DEV && window.ASTERISM_DEV.ready() && window.ASTERISM_DEV.frames() > 2, { timeout: 30000 });
await waitFrames(page, 5);

for (const hip of [VEGA, DENEB, ALTAIR]) {
  const p = await dev((h) => window.ASTERISM_DEV.screenOfHip(h), hip);
  await tapAt(page, p.x, p.y);
  await waitFrames(page, 2);
}
await tap(page, '#btnDraw'); await sleep(250);
await page.focus('#nameField');
await page.type('#nameField', 'The Kept Lantern', { delay: 10 });
await tap(page, '#btnNameSave');
await page.waitForFunction(() => !window.ASTERISM_DEV.typing() && (window.ASTERISM_DEV.myth() || '').length > 40, { timeout: 30000 }).catch(() => {});
const mythHere = await dev(() => window.ASTERISM_DEV.myth());
await tap(page, '#btnMythKeep'); await sleep(300);
const save = await dev(() => window.ASTERISM_DEV.save());
say(save.entries.length === 1 && save.entries[0].n === 'The Kept Lantern', 'a constellation drawn, named and kept is in the almanac');

/* 2. SHARE. Headless has no navigator.share, so the app falls to the clipboard
   and then to the visible box; the gate reads whichever it used. */
await tap(page, '#btnMenu'); await sleep(150);
await tap(page, '#btnAlmanac'); await sleep(350);
await tap(page, '.card'); await sleep(350);
await browser.defaultBrowserContext().overridePermissions(base, ['clipboard-read', 'clipboard-write']).catch(() => {});
await tap(page, '#btnShare'); await sleep(500);
let link = await dev(async () => {
  try { const t = await navigator.clipboard.readText(); if (t && t.indexOf('#c=') > 0) return t; } catch (e) {}
  const f = document.getElementById('importField');
  return f && f.value.indexOf('#c=') > 0 ? f.value : '';
});
say(link.indexOf('#c=') > 0, 'SHARE made a link' + (link ? ' of ' + link.length + ' characters' : ': nothing arrived'));
if (!link) { console.log('\n1 ALMANAC FAILURE(S)'); await browser.close(); close(); process.exit(1); }
const packed = JSON.parse(Buffer.from(link.split('#c=')[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
say(packed.s.indexOf(VEGA) >= 0 && packed.s.indexOf(DENEB) >= 0 && packed.s.indexOf(ALTAIR) >= 0,
  'and it carries Hipparcos numbers, not row indices: ' + JSON.stringify(packed.s));
say(packed.e.length === 2, 'and the two lines between them');
say(String(packed.p[0]) === String(Math.round(packed.p[0] * 100) / 100) && Math.abs(packed.p[0]) < 90,
  'and the place at city precision: ' + JSON.stringify(packed.p));
/* ⛔ THIS USED TO END IN `|| true`, which is a probe that cannot fail wearing
   the clothes of one that can. What it should ask is what a share link is
   ALLOWED to carry, and it asks it by name. */
const ALLOWED = ['v', 's', 'e', 'n', 'm', 't', 'p', 'pn', 'd', 'id'];
const extra = Object.keys(packed).filter(k => ALLOWED.indexOf(k) < 0);
say(extra.length === 0, 'and nothing in it beyond the shape, the name, the seed, the night and the place'
  + (extra.length ? ': ' + extra.join(', ') : ' (' + Object.keys(packed).join(', ') + ')'));
const tooSharp = packed.p.filter(x => String(x).split('.')[1] && String(x).split('.')[1].length > 2);
say(tooSharp.length === 0, 'and no reading sharper than two decimals of a degree'
  + (tooSharp.length ? ': ' + tooSharp.join(', ') : ''));

/* 3. a FRESH browser opens it */
const other = await browser.createBrowserContext ? await browser.createBrowserContext() : null;
const page2 = other ? await other.newPage() : await browser.newPage();
await page2.setViewport({ width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page2.goto(link.replace(/^https?:\/\/[^/]+/, base), { waitUntil: 'load', timeout: 40000 });
await page2.waitForFunction(() => window.ASTERISM_DEV && window.ASTERISM_DEV.ready(), { timeout: 30000 });
await page2.waitForFunction(() => (window.ASTERISM_DEV.myth() || '').length > 40, { timeout: 30000 }).catch(() => {});
const shownName = await page2.evaluate(() => document.getElementById('mythName').textContent);
say(shownName === 'The Kept Lantern', 'a fresh browser opening the link shows the same name: ' + JSON.stringify(shownName));
await page2.waitForFunction(() => !window.ASTERISM_DEV.typing(), { timeout: 30000 }).catch(() => {});
const mythThere = await page2.evaluate(() => window.ASTERISM_DEV.myth());
say(mythThere === mythHere, 'and the same myth, word for word');
const place2 = await page2.evaluate(() => window.ASTERISM_DEV.place());
say(Math.abs(place2.lat - 39.96) < 0.02, 'and it stands where the link says, ' + place2.lat);
const drew = await page2.evaluate((h) => h.map(x => !!window.ASTERISM_DEV.screenOfHip(x)), [VEGA, DENEB, ALTAIR]);
say(drew.every(Boolean), 'and all three stars are on its sky');
const keepLabel = await page2.evaluate(() => document.getElementById('btnMythKeep').textContent);
say(/SAVE TO MY ALMANAC/i.test(keepLabel), 'and it offers to keep it: ' + JSON.stringify(keepLabel));
await page2.close();

/* 5 and 6. the poster, captured as the blob the export actually made */
await tap(page, '#btnPoster'); await sleep(400);
await dev(() => {
  window.__poster = null;
  const real = URL.createObjectURL.bind(URL);
  URL.createObjectURL = function (b) { window.__poster = b; return real(b); };
});
await tap(page, '#btnExport');
await page.waitForFunction(() => !!window.__poster, { timeout: 30000 }).catch(() => {});
const shot = await dev(async () => {
  const b = window.__poster;
  if (!b) return null;
  const url = URL.createObjectURL(b);
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  const g = c.getContext('2d');
  g.drawImage(img, 0, 0);
  /* the bottom 120 rows: if the footer and the credit were drawn, they are not
     one flat colour */
  const d = g.getImageData(0, img.height - 120, img.width, 120).data;
  let lit = 0;
  for (let i = 0; i < d.length; i += 4 * 53) if (d[i] + d[i + 1] + d[i + 2] > 90) lit++;
  return { w: img.width, h: img.height, type: b.type, bytes: b.size, litRows: lit, samples: Math.ceil(d.length / (4 * 53)) };
});
say(!!shot, 'EXPORT produced a file');
say(!!shot && shot.type === 'image/png', 'and it is a PNG: ' + (shot ? shot.type : '?'));
say(!!shot && shot.w === 2048 && shot.h === 2560, 'at 2048 by 2560: ' + (shot ? shot.w + ' by ' + shot.h : '?'));
say(!!shot && shot.bytes > 40000, 'and it is a real picture, ' + (shot ? Math.round(shot.bytes / 1024) : 0) + ' KB');
say(!!shot && shot.litRows > 20,
  'and its bottom is not blank: ' + (shot ? shot.litRows : 0) + ' of ' + (shot ? shot.samples : 0) + ' samples carry the footer and the credit');

say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors.join(' | ') : ''));
await browser.close(); close();
console.log('');
if (fails.length) { console.log(fails.length + ' ALMANAC FAILURE(S)'); process.exit(1); }
console.log('ALMANAC OK');
