/* Google Play raws for Jumping Jimothy (21 Oct 2026). The same five zones as the Steam shots
   (store/jimothy-steam/capsules/shots.js, all gameplay, menus do not sell an arcade game), shot as the
   PLAY APP at a phone: 412x641 CSS px at DPR 2.62136 = the 1080x1680 raw that tools/store-kit/compose.mjs
   puts under a 240px headline band. The Play referrer is set before any page script runs, so the frame is
   the bought build a Play player gets (no Sign in, no Support, no Steam wishlist, no arcade exit).
   The Steam driver's two scars hold here too: hop one lane at a time, and ask the SCREEN whether he is
   alive immediately before the shutter, re-rolling the shot if he got flattened.
   Usage (repo root):  node store/jimothy-play/shots.mjs   then   node tools/store-kit/compose.mjs store/jimothy-play/kit.json */
import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';
import { serve } from '../../satellites/stream-hop/test/serve.mjs';
const PORT = 8976, BASE = `http://127.0.0.1:${PORT}/satellites/stream-hop/index.html?shtest=1`;
const OUT = new URL('./raw/', import.meta.url).pathname; mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SHOTS = [
  { f: '1-rush-hour', lvl: 4 }, { f: '2-pike-market', lvl: 18 }, { f: '3-the-canal', lvl: 34 },
  { f: '4-fremont', lvl: 52 }, { f: '5-deep-city', lvl: 72 },
];
const srv = await serve(PORT, () => null);
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--force-color-profile=srgb'] });
const alive = p => p.evaluate(() => {
  const g = SH_DEV.state(); if (g && g.dead) return false;
  const vis = id => { const e = document.getElementById(id); return !!e && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().height > 0; };
  return !(vis('s-go') || vis('s-clear') || vis('s-pause'));
});
async function grab(lvl, file) {
  const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
  await p.setViewport({ width: 412, height: 641, deviceScaleFactor: 2.62136, isMobile: true, hasTouch: true });
  await p.setRequestInterception(true);
  p.on('request', r => r.url().startsWith(`http://127.0.0.1:${PORT}/`) || /^(data|blob):/.test(r.url()) || /fonts\.(googleapis|gstatic)\.com/.test(r.url()) ? r.continue() : r.respond({ status: 204, body: '' }));
  await p.evaluateOnNewDocument(() => Object.defineProperty(document, 'referrer', { get: () => 'android-app://com.skywolfstudio.jumpingjimothy/' }));
  await p.goto(BASE, { waitUntil: 'networkidle2', timeout: 60000 });
  await sleep(3000);
  await p.tap('#splash-tap').catch(() => {}); await sleep(1800);
  if (!(await p.evaluate(() => window.__PLAY_BUILD === true))) throw new Error('not the Play build');
  await p.evaluate(l => SH_DEV.start('adventure', l), lvl); await sleep(1500);
  for (let i = 0; i < 2; i++) { await p.evaluate(() => SH_DEV.hop && SH_DEV.hop('up')); await sleep(380); if (!(await alive(p))) break; }
  await sleep(700);
  const ok = await alive(p);
  if (ok) await p.screenshot({ path: OUT + file + '.png' });
  await ctx.close();
  return ok;
}
for (const s of SHOTS) {
  let ok = false;
  for (let a = 1; a <= 8 && !ok; a++) { ok = await grab(s.lvl, s.f); if (!ok) console.log(`  ${s.f}: flattened, re-rolling (${a}/8)`); }
  console.log(ok ? `  raw/${s.f}.png` : `  ${s.f}: SKIPPED, no clean run`);
}
await b.close(); srv.close();
