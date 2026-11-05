/* Shoot Sunforge at 412x915 (2 device px per CSS px, touch on): every screen, or one by name, driven to each state
 * through the game's own ?rstest=1 hook (window.RS_DEV). THE TESTING LAW: one shot per visual step, of THAT screen,
 * after all the step's edits; then OPEN THE IMAGE AND LOOK (name three things wrong).
 *
 *   (cd /workspaces/lucid-winds && python3 -m http.server 8777 >/dev/null 2>&1 &)     serve the repo first
 *   node tools/sunforge-tests/shoot.mjs <outdir>                 every screen
 *   node tools/sunforge-tests/shoot.mjs <outdir> play            one screen
 *   W=360 H=780 node tools/sunforge-tests/shoot.mjs <outdir> play     the same on a narrower phone
 * Screens: title how settings play almost crush pause zen11 crush9 gameover daily share first (share writes the two composed 1080 PNGs). Chrome lives in /workspaces/sws-tools. One
 * browser at a time. The fleet's song card and feedback tip are closed before every shot. */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
const require = createRequire('/workspaces/sws-tools/package.json');
const puppeteer = require('puppeteer');
const out = process.argv[2] || '/home/codespace/sf-drafts/shots';
const only = process.argv[3] || null;
const W = parseInt(process.env.W || '412', 10), H = parseInt(process.env.H || '915', 10);
mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-gpu', '--autoplay-policy=no-user-gesture-required'], protocolTimeout: 120000, timeout: 120000 });
const page = await browser.newPage();
const errs = [];
page.on('pageerror', e => errs.push(e.message));
await page.setViewport({ width: W, height: H, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.evaluateOnNewDocument(() => { try { localStorage.setItem('lwfb_explained', '1'); } catch (e) {} });
const URL = 'http://localhost:8777/satellites/ring-stacker/?rstest=1' + (process.env.Q ? '&' + process.env.Q : '');
const wait = ms => new Promise(r => setTimeout(r, ms));
const later = async () => { try { await page.evaluate(() => { for (const b of document.querySelectorAll('button')) { if (/^(Later|Not now|Close)$/.test(b.textContent.trim()) && b.offsetParent) b.click(); } }); } catch (e) {} };
const ev = async js => { try { return await page.evaluate(js); } catch (e) { console.log('  failed:', js, e.message); } };
const fresh = async () => { await page.goto(URL, { waitUntil: 'networkidle0', timeout: 90000 }); await wait(1200); await later(); };
const shot = async n => { await later(); await wait(500); await page.screenshot({ path: `${out}/${n}.jpg`, type: 'jpeg', quality: 82 }); console.log(n); };
const want = n => !only || only === n;
import { writeFileSync } from 'node:fs';
const savePng = async n => { const d = await ev('RS_DEV.shareCard()'); if (d) { writeFileSync(`${out}/${n}.png`, Buffer.from(d.split(',')[1], 'base64')); console.log(n + ' (composed)'); } else console.log(n + ' NOT composed'); };

/* each screen from a fresh load, so no screen leaks state into the next */
const SCREENS = {
  title: async () => {},
  how: async () => { await ev("document.getElementById('b-how').click()"); },
  settings: async () => { await ev("document.getElementById('b-set').click()"); },
  play: async () => { await ev("RS_DEV.start('journey',42); for(var i=0;i<6;i++){ RS_DEV.slam(); RS_DEV.flush(); } RS_DEV.step(1/60,20)"); },
  almost: async () => { await ev("RS_DEV.start('journey',42); RS_DEV.seedRing(1,10,10); RS_DEV.put('T',9,2,2)"); },
  crush: async () => { await ev("RS_DEV.start('journey',42); RS_DEV.seedRing(1,10,10); RS_DEV.put('T',9,2,2); RS_DEV.drop(); RS_DEV.step(1/60,9)"); },
  gameover: async () => { await ev("RS_DEV.start('journey',42); RS_DEV.fill(6,0.86,3); RS_DEV.end()"); },
  daily: async () => { await ev("RS_DEV.start('daily'); RS_DEV.fill(5,0.8,9); RS_DEV.end()"); },
  pause: async () => { await ev("RS_DEV.start('journey',42); for(var i=0;i<3;i++){ RS_DEV.slam(); RS_DEV.flush(); } document.getElementById('b-pause').click()"); },
  zen11: async () => { await ev("RS_DEV.start('zen',6); RS_DEV.fill(11,0.8,5); RS_DEV.step(1/60,150)"); },
  crush9: async () => { await ev("RS_DEV.start('zen',7); RS_DEV.fill(8,0.85,4); RS_DEV.seedRing(9,11,2); RS_DEV.step(1/60,150); RS_DEV.put('T',10,-2,2); RS_DEV.drop(); RS_DEV.step(1/60,10)"); },
  share: async () => { await ev("RS_DEV.start('journey',42); RS_DEV.fill(10,0.82,8); RS_DEV.end()"); await savePng('share-square'); await ev("RS_DEV.start('daily'); RS_DEV.fill(7,0.8,9); RS_DEV.end()"); await savePng('share-daily'); },
  first: async () => { await ev("localStorage.removeItem('rs_prog'); location.reload()"); await wait(1500); await later(); await ev("document.getElementById('b-journey').click()"); await wait(300); await ev("RS_DEV.freeze(); RS_DEV.render()"); },
};
for (const name of Object.keys(SCREENS)) {
  if (!want(name)) continue;
  await fresh();
  await SCREENS[name]();
  await shot(name);
}
await browser.close();
console.log(errs.length ? 'PAGE ERRORS: ' + errs.join(' ; ') : 'no page errors');
