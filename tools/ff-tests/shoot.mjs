/* Shoot Flatulence Fighter at 412x915 (2 device px per CSS px, touch on): every screen, or one by name, driven to each
 * state through the game's own ?fftest=1 hook (window.FF_DEV). THE TESTING LAW: one shot per visual step, of THAT
 * screen, after all the step's edits; then OPEN THE IMAGE AND LOOK (name three things wrong).
 *
 *   (cd /workspaces/lucid-winds && python3 -m http.server 8777 >/dev/null 2>&1 &)     serve the repo first
 *   node tools/ff-tests/shoot.mjs <outdir>                       all 16 screens
 *   node tools/ff-tests/shoot.mjs <outdir> 08-play-calm-both-pads   one screen
 *   W=360 node tools/ff-tests/shoot.mjs <outdir> 08-play-calm-both-pads   the same at 360 wide
 * Chrome lives in /workspaces/sws-tools. One browser at a time. The fleet's song card and feedback tip are closed
 * before every shot; the Music chip and the ladybug stay, they are the arcade's. */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
const require = createRequire('/workspaces/sws-tools/package.json');
const puppeteer = require('puppeteer');
const out = process.argv[2] || '/tmp/claude-1000/ff-shots';
const only = process.argv[3] || null;
const W = parseInt(process.env.W || '412', 10), H = parseInt(process.env.H || '915', 10);
mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-gpu', '--autoplay-policy=no-user-gesture-required'], protocolTimeout: 120000 });
const page = await browser.newPage();
const errs = [];
page.on('pageerror', e => errs.push(e.message));
await page.setViewport({ width: W, height: H, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.evaluateOnNewDocument(() => { try { localStorage.setItem('lwfb_explained', '1'); } catch (e) {} });
await page.goto('http://localhost:8777/satellites/flatulence-fighter/?fftest=1', { waitUntil: 'networkidle0', timeout: 60000 });
const wait = ms => new Promise(r => setTimeout(r, ms));
const later = async () => { try { await page.evaluate(() => { for (const b of document.querySelectorAll('button')) { if (b.textContent.trim() === 'Later' && b.offsetParent) b.click(); } }); } catch (e) {} };
const shot = async n => { if (only && n !== only) return; await later(); await wait(600); await later(); await page.screenshot({ path: `${out}/${n}.jpg`, type: 'jpeg', quality: 82 }); console.log(n); };
const ev = async js => { try { return await page.evaluate(js); } catch (e) { console.log('  failed:', js, e.message); } };
await wait(2500); await later(); await wait(800);
await shot('01-menu');
await ev("document.getElementById('howBtn').click()"); await shot('02-how-to-play'); await ev("document.getElementById('howClose').click()");
await ev("document.getElementById('medalsBtn').click()"); await shot('03-medals'); await ev("document.getElementById('medalsClose').click()");
await ev("document.getElementById('wardBtn').click()"); await shot('04-wardrobe'); await ev("document.getElementById('wardClose').click()");
await ev("document.getElementById('statsBtn').click()"); await shot('05-stats'); await ev("document.getElementById('statsClose').click()");
await ev("FF_DEV.startTut(); FF_DEV.step(1.2)"); await shot('06-tutorial'); await ev("FF_DEV.endTut && FF_DEV.endTut()");
await ev("FF_DEV.start('stage','normal'); FF_DEV.step(0.3)"); await shot('07-intertitle-act-one');
await ev("FF_DEV.setPads(1,1); FF_DEV.step(3)"); await shot('08-play-calm-both-pads');
await ev("FF_DEV.forceCover(false); FF_DEV.step(0.2)"); await shot('09-play-cover-noise-vent-now');
await ev("FF_DEV.vent(); FF_DEV.step(0.4)"); await shot('10-play-after-a-vent');
await ev("FF_DEV.forceLeak(); FF_DEV.forceLeak(); FF_DEV.setPads(1,0); FF_DEV.step(6)"); await shot('11-play-leaks-one-hand-strain');
await ev("FF_DEV.forceWhiff(); FF_DEV.step(0.3)"); await shot('12-play-whiff-warning');
await ev("FF_DEV.setPads(0,0); FF_DEV.step(5)"); await shot('13-play-critical-pressure');
await ev("FF_DEV.forceStrike(); FF_DEV.step(1.5)"); await shot('14-play-a-strike-the-room-reacts');
await ev("document.getElementById('pauseBtn').click()"); await shot('15-pause'); await ev("document.getElementById('resumeBtn').click()");
await ev("FF_DEV.forceStrike(); FF_DEV.step(0.5); FF_DEV.forceStrike(); FF_DEV.step(3)"); await shot('16-game-over-exposed');
await browser.close();
console.log(errs.length ? 'PAGE ERRORS: ' + errs.join(' ; ') : 'no page errors');
