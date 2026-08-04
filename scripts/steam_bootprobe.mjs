#!/usr/bin/env node
/* Jumping Jimothy Steam-build boot gate.
   Boots the VENDORED build (store/jimothy-steam/app), taps TAP TO START for
   real (the first probe of this build "passed" while the splash was still up,
   which proved nothing), and asserts the storefront rules: commerce flag set,
   Sign in / Support the Studio / Arcade button all absent, and zero external
   network requests. Then the A/B twin: the same taps on the WEB build must
   show those surfaces, proving the gate gates rather than the surfaces being
   dead. Usage: node scripts/steam_bootprobe.mjs */
import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'store/jimothy-steam/capsules/out');
mkdirSync(OUT, { recursive: true });
const srv = createServer((req, res) => {
  try { res.end(readFileSync(join(ROOT, decodeURIComponent(req.url.split('?')[0])))); }
  catch (e) { res.writeHead(404); res.end(); }
}).listen(8966);

function die(msg){ console.log('FAIL: ' + msg); process.exit(1); }

const b = await puppeteer.launch({ headless: 'new', args: [
  '--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader'] });

async function boot(path, label){
  const ctx = await b.createBrowserContext();          /* fresh storage per run */
  const pg = await ctx.newPage();
  await pg.setViewport({ width: 900, height: 1200 });
  const external = [];
  pg.on('request', r => {
    const u = r.url();
    if (!u.startsWith('http://127.0.0.1:8966') && !u.startsWith('data:') && !u.startsWith('blob:'))
      external.push(u);
  });
  pg.on('pageerror', e => console.log(label + ' PAGE ERROR:', e.message));
  await pg.goto('http://127.0.0.1:8966/' + path, { waitUntil: 'networkidle2', timeout: 90000 });
  /* past the splash, for real */
  await pg.waitForFunction(() => {
    const els = [...document.querySelectorAll('button,div,span,a')];
    return els.some(el => /tap to start/i.test(el.textContent) && el.offsetParent !== null);
  }, { timeout: 60000 }).catch(() => null);
  const tapped = await pg.evaluate(() => {
    const els = [...document.querySelectorAll('button,div,span,a')]
      .filter(el => /tap to start/i.test(el.textContent) && el.offsetParent !== null);
    if (!els.length) return false;
    const el = els[els.length - 1];
    const r = el.getBoundingClientRect();
    const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    (at || el).dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    (at || el).dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    el.click();
    return true;
  });
  await new Promise(r => setTimeout(r, 2500));
  const state = await pg.evaluate(() => {
    const vis = txt => [...document.querySelectorAll('button,a,div,span')]
      .some(el => el.textContent.trim().toLowerCase() === txt && el.offsetParent !== null
        && el.getBoundingClientRect().width > 0);
    const visLike = re => [...document.querySelectorAll('button,a,div,span')]
      .some(el => re.test(el.textContent.trim()) && el.children.length === 0
        && el.offsetParent !== null);
    /* STORE_BUILD itself is IIFE-scoped, invisible from here; the flag is the
       input lever and the hidden surfaces below are the observable output */
    return {
      flag: !!window.__STEAM_BUILD,
      title: document.title,
      signIn: visLike(/^sign in$/i),
      support: visLike(/support the studio/i),
      arcade: visLike(/sky wolf studios arcade/i)
    };
  });
  return { pg, ctx, state, tapped, external };
}

/* ── the Steam build ── */
const steam = await boot('store/jimothy-steam/app/index.html', 'steam');
console.log('steam build:', JSON.stringify(steam.state), 'tapped:', steam.tapped);
if (!steam.state.flag) die('commerce flag not set in vendored build');
if (!/Jumping Jimothy/.test(steam.state.title)) die('title is not Jumping Jimothy: ' + steam.state.title);
if (!steam.tapped) die('never got past the splash — the build may not boot');
if (steam.state.signIn) die('Sign in is visible in the Steam build');
if (steam.state.support) die('Support the Studio is visible in the Steam build');
if (steam.state.arcade) die('Arcade button is visible in the Steam build');
const ext = steam.external.filter(u => !/favicon/.test(u));
if (ext.length) die('Steam build made external requests: ' + ext.slice(0, 3).join(', '));
await steam.pg.screenshot({ path: join(OUT, 'bootprobe-steam.png') });
await steam.ctx.close();
console.log('steam build clean: no commerce, no web surfaces, zero external requests');

/* ── the A/B twin: web build must SHOW the gated surfaces ── */
const web = await boot('satellites/stream-hop/index.html', 'web');
console.log('web build:', JSON.stringify(web.state), 'tapped:', web.tapped);
if (web.state.flag) die('web build has the Steam flag set');
if (!web.tapped) die('web build never got past the splash');
if (!web.state.support && !web.state.signIn && !web.state.arcade)
  die('web build shows NONE of the gated surfaces — the A/B proves nothing');
await web.ctx.close();
console.log('A/B holds: web shows gated surfaces (signIn=' + web.state.signIn
  + ' support=' + web.state.support + ' arcade=' + web.state.arcade + '), Steam hides them');
console.log('BOOT PROBE COMPLETE');
await b.close(); srv.close();
