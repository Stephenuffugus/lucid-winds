/* Shoot Tomato Man at 412x915 (2 device px per CSS px, touch on): every screen, or one by name, driven through the game's
 * own window.__TM hook with the clock held (no real time passes between the setup and the shot). THE TESTING LAW: one shot
 * per visual step, of THAT screen, after all the step's edits; then OPEN THE IMAGE AND LOOK (name three things wrong).
 *
 *   (cd /workspaces/Tomato_Man && python3 -m http.server 8778 >/dev/null 2>&1 &)     serve the clone first
 *   node tools/tomato-man-tests/shoot.mjs <outdir>                 every screen
 *   node tools/tomato-man-tests/shoot.mjs <outdir> play            one screen
 *   W=360 H=780 node tools/tomato-man-tests/shoot.mjs <outdir> play
 * Screens: title howto worlds levels play blaze burn win shop builder daily pause first (first = an empty save, Dawn
 * Ribbon's first seconds). Every other screen starts from a save that has seen How to Play and every coach mark. */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
const require = createRequire('/workspaces/sws-tools/package.json');
const puppeteer = require('puppeteer');
const out = process.argv[2] || '/home/codespace/tm-drafts/shots';
const only = process.argv[3] || null;
const W = parseInt(process.env.W || '412', 10), H = parseInt(process.env.H || '915', 10);
mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-gpu', '--autoplay-policy=no-user-gesture-required'], protocolTimeout: 120000, timeout: 120000 });
const page = await browser.newPage();
const errs = [];
page.on('pageerror', e => errs.push(e.message));
await page.setViewport({ width: W, height: H, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const URL = 'http://localhost:8778/?tmtest=1';
const TUT = ['move','shade','aloe','find','dash','shadeDrop','checkpoint','burn','hot','spf','cart','cloud','wilt','ice','lunge','eclipse'];
const SEEN = JSON.stringify({ seenHowto: true, tut: Object.fromEntries(TUT.map(k => [k, true])) });
const wait = ms => new Promise(r => setTimeout(r, ms));
const ev = async js => { try { return await page.evaluate(js); } catch (e) { console.log('  failed:', js.slice(0, 80), e.message.slice(0, 120)); } };
const fresh = async (save) => {
  await page.goto('about:blank');
  await page.evaluateOnNewDocument(s => { try { if (s === null) localStorage.removeItem('tomatoman_save_v1'); else localStorage.setItem('tomatoman_save_v1', s); } catch (e) {} }, save);
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 90000 }); await wait(900);
};
const shot = async n => { await wait(400); await page.screenshot({ path: `${out}/${n}.jpg`, type: 'jpeg', quality: 82 }); console.log(n); };
const want = n => !only || only === n;
const SCREENS = {
  title: async () => {},
  howto: async () => { await ev("__TM.buildHowto(); __TM.showScreen('howto')"); },
  worlds: async () => { await ev("__TM.go('map')"); },
  levels: async () => { await ev("__TM.openWorld(0)"); },
  play: async () => { await ev("__TM.hold(true); __TM.startLevel(0); __TM.seek(6)"); },
  blaze: async () => { await ev("__TM.hold(true); __TM.startLevel(6); __TM.seek(8)"); },
  burn: async () => { await ev("__TM.hold(true); __TM.startLevel(0); __TM.seek(1.5); __TM.burn(); __TM.seek(0.1)"); },
  win: async () => { await ev("__TM.hold(true); __TM.startLevel(0); __TM.seek(3); __TM.winLevel()"); },
  shop: async () => { await ev("__TM.go('shop')"); },
  builder: async () => { await ev("__TM.go('builder')"); },
  daily: async () => { await ev("__TM.hold(true); __TM.startDaily(); __TM.seek(3)"); },
  pause: async () => { await ev("__TM.hold(true); __TM.startLevel(0); __TM.seek(2); __TM.togglePause()"); },
  first: async () => { await ev("__TM.hold(true); __TM.startLevel(0); __TM.seek(2.5)"); },
};
for (const name of Object.keys(SCREENS)) {
  if (!want(name)) continue;
  await fresh(name === 'first' ? null : SEEN);
  await SCREENS[name]();
  await shot(name);
}
await browser.close();
console.log(errs.length ? 'PAGE ERRORS: ' + errs.join(' ; ') : 'no page errors');
