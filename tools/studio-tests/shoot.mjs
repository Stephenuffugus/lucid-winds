/* Shoot the Music Studio at 412x915 (2 device px per CSS px, touch on): every screen, or one by name. THE TESTING LAW: one
 * shot per visual step, of THAT screen, after all the step's edits; then OPEN THE IMAGE AND LOOK (name three things wrong).
 *
 *   (cd /workspaces/lucid-winds && python3 -m http.server 8777 >/dev/null 2>&1 &)     serve the repo first
 *   node tools/studio-tests/shoot.mjs <outdir>                  all 14 screens
 *   node tools/studio-tests/shoot.mjs <outdir> 02-grid-top-hip-hop   one screen
 * Chrome lives in /workspaces/sws-tools (see tools/shutterbug-tests/shoot.mjs for the rebuild steps). One browser at a time. */
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/sws-tools/package.json');
const puppeteer = require('puppeteer');
const out = process.argv[2] || '/tmp/claude-1000/studio-shots';
const only = process.argv[3] || null;   /* one screen's name, or every screen */
import { mkdirSync } from 'node:fs'; mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-gpu', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
const errs = [];
page.on('pageerror', e => errs.push('pageerror: ' + e.message));
await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.goto('http://localhost:8777/studio.html', { waitUntil: 'networkidle0', timeout: 40000 });
const wait = ms => new Promise(r => setTimeout(r, ms));
const shot = async (name) => { if (only && name !== only) return; await wait(700); await page.screenshot({ path: `${out}/${name}.jpg`, type: 'jpeg', quality: 82 }); console.log(name); };
const ev = async (js) => { try { await page.evaluate(js); } catch (e) { console.log('  evaluate failed for', js, e.message); } };
await wait(1500);
await shot('01-start-a-song');
await ev("document.querySelector('.gs-starter-card').click()");
await wait(1500);
await page.evaluate(() => window.scrollTo(0, 0));
await shot('02-grid-top-hip-hop');
await page.evaluate(() => window.scrollTo(0, 560));
await shot('03-grid-lanes');
await page.evaluate(() => window.scrollTo(0, 1200));
await shot('04-grid-bottom');
await page.evaluate(() => window.scrollTo(0, 0));
await ev("GS.expandLayer('melody')"); await page.evaluate(() => window.scrollTo(0, 420));
await shot('05-melody-lane-open');
await page.evaluate(() => window.scrollTo(0, 0));
await ev('GS.toggleToolbar()');
await shot('06-tools-open');
await ev('GS.toggleToolbar()');
await ev("GS.saveToSlot(null,'Night Walk')"); await ev("GS.saveToSlot(null,'Rain on Glass')");
await ev('GS.openSongs()'); await shot('07-my-songs'); await ev('GS.closeSongs()');
await ev('GS.openEuclid()'); await shot('08-rhythm-generator'); await ev('GS.closeEuclid()');
await ev('GS.openCircle()'); await shot('09-circle-of-fifths'); await ev('GS.closeCircle()');
await ev('GS.openKeys()'); await shot('10-keys'); await ev('GS.closeKeys()');
await ev('GS.openHum()'); await shot('11-hum-a-melody'); await ev('GS.closeHum()');
await ev('GS.openSampler()'); await shot('12-sampler'); await ev('GS.closeSampler()');
await ev("document.getElementById('gs-play').click()"); await wait(800);
await ev('GS.openShow()'); await wait(1200); await shot('13-show-visualizer'); await ev('GS.closeShow()');
await ev("document.getElementById('gs-play').click()");
await page.close();
const p2 = await browser.newPage();
await p2.setViewport({ width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
try { await p2.goto('http://localhost:8777/play/song.html', { waitUntil: 'networkidle2', timeout: 40000 }); await wait(2500); await p2.screenshot({ path: `${out}/14-arcade-shell-page.jpg`, type: 'jpeg', quality: 82 }); console.log('14-arcade-shell-page'); } catch (e) { console.log('shell page failed', e.message); }
await browser.close();
console.log(errs.length ? 'PAGE ERRORS: ' + errs.join(' ; ') : 'no page errors');
