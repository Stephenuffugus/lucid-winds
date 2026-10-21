/* THE PLAY APP IS A BOUGHT BUILD, AND NOTHING OF OURS IS REACHABLE IN IT (2026-10-21).
   The Google Play listing wraps the live page in a Trusted Web Activity. Chrome opens it with
   document.referrer = android-app://com.skywolfstudio.jumpingjimothy/, and the head turns that into
   window.__PLAY_BUILD. This drives the real page in four states at 412 x 915 and asserts each:
     web     no referrer: the Supporter Pack, the exit, the account and feedback ARE there, the sunbeam SDK
             loads (the positive control: if every door read "hidden" the check would pass for the wrong reason)
     play    our package: every door is gone, the exit stays put, no SDK, no Firebase, nothing sent to our
             cloud functions or a checkout, the pack is granted, the privacy row shows
     reload  the same tab reloaded with no referrer (a reload or the trip to privacy.html loses it): still play
     gmail   android-app://com.google.android.gm/ (any app opening a link): the WEB build, no free pack
   Every request off this machine is answered by the test itself, so nothing reaches the real host.
   Usage (from the repo root):  node satellites/stream-hop/test/play-boundary.mjs */
import puppeteer from 'puppeteer';
import { serve } from './serve.mjs';
const PORT = 8974, BASE = `http://127.0.0.1:${PORT}/satellites/stream-hop/`;
const PKG = 'android-app://com.skywolfstudio.jumpingjimothy/';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const srv = await serve(PORT, () => null);
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-gpu'] });
const DOORS = ['b-support', 'b-wishlist', 'b-exit', 'b-acct', 'b-feedback', 'go-feedback', 'pz-feedback', 'b-install'];
let fails = 0;
const check = (label, pass, note = '') => { if (!pass) fails++; console.log(` ${pass ? 'ok  ' : '⛔  '} ${label}${note ? '  — ' + note : ''}`); };

async function open(referrer, page) {
  const pg = page || await (await b.createBrowserContext()).newPage();
  if (!page) {
    await pg.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await pg.setRequestInterception(true);
    pg._off = [];
    pg.on('request', r => {
      const u = r.url();
      if (u.startsWith(`http://127.0.0.1:${PORT}/`) || /^(data|blob):/.test(u)) return r.continue();
      pg._off.push(u);
      r.respond({ status: 204, body: '' });
    });
  }
  /* a referrer cannot be sent from here the way Chrome sends a TWA's, so the document's own getter answers
     it, exactly as the page reads it. null = leave the real (empty) referrer. */
  await pg.evaluateOnNewDocument(r => {
    if (r !== null) Object.defineProperty(document, 'referrer', { get: () => r, configurable: true });
  }, referrer);
  return pg;
}
async function state(pg) {
  await sleep(3500);
  return pg.evaluate(doors => {
    const shown = {};
    for (const id of doors) { const el = document.getElementById(id); shown[id] = el ? getComputedStyle(el).display !== 'none' : 'missing'; }
    const pv = document.getElementById('set-privacy');
    const before = location.href; let threw = null;
    try { window.SWS_EXIT && window.SWS_EXIT(); } catch (e) { threw = String(e).slice(0, 80); }
    return { play: window.__PLAY_BUILD === true, sdk: !!window.Sunbeam, firebase: !!window.firebase,
      pack: localStorage.getItem('sw_supporter') === '1', privacy: pv ? getComputedStyle(pv).display !== 'none' : 'missing',
      shown, before, threw };
  }, DOORS);
}
const offCloud = list => list.filter(u => /cloudfunctions\.net|firebase|gstatic\.com\/firebasejs|stripe|nowpayments|lucidwinds\.com\/portal/i.test(u));

console.log('web (no referrer, the positive control)');
let pg = await open(null); await pg.goto(BASE, { waitUntil: 'domcontentloaded' });
let s = await state(pg); await sleep(800);
check('not a Play build', !s.play);
check('the sunbeam SDK loads', s.sdk);
for (const id of ['b-support', 'b-exit', 'b-acct', 'b-feedback']) check(`${id} is there`, s.shown[id] === true, String(s.shown[id]));
check('privacy row hidden on the web', s.privacy === false, String(s.privacy));
check('the exit leaves the game', /lucidwinds\.com\/portal/.test(pg._off.join(' ')) || !(await pg.url()).includes('/stream-hop/'), pg._off.filter(u => /portal/.test(u)).join(' ') || 'no portal request');
await pg.browserContext().close();

console.log('play (our package)');
pg = await open(PKG); await pg.goto(BASE, { waitUntil: 'domcontentloaded' });
s = await state(pg); await sleep(800);
check('is a Play build', s.play);
check('no sunbeam SDK', !s.sdk);
check('no Firebase', !s.firebase);
for (const id of DOORS) check(`${id} is gone`, s.shown[id] === false || s.shown[id] === 'missing', String(s.shown[id]));
check('the exit stays in the app', !s.threw && (await pg.url()).includes('/stream-hop/'), await pg.url());
check('the Supporter Pack is granted', s.pack);
check('the privacy row shows', s.privacy === true, String(s.privacy));
check('nothing sent to our cloud, Firebase, a checkout or the portal', offCloud(pg._off).length === 0, offCloud(pg._off).join(' '));

console.log('reload (same tab, the referrer gone)');
await pg.evaluateOnNewDocument(() => { Object.defineProperty(document, 'referrer', { get: () => '', configurable: true }); });
pg._off.length = 0;
await pg.reload({ waitUntil: 'domcontentloaded' });
s = await state(pg); await sleep(800);
check('still a Play build', s.play);
check('still no SDK', !s.sdk);
check('the exit still gone', s.shown['b-exit'] === false, String(s.shown['b-exit']));
check('still nothing sent', offCloud(pg._off).length === 0, offCloud(pg._off).join(' '));
await pg.browserContext().close();

console.log('gmail (another app opened the link)');
pg = await open('android-app://com.google.android.gm/'); await pg.goto(BASE, { waitUntil: 'domcontentloaded' });
s = await state(pg);
check('NOT a Play build', !s.play);
check('no free Supporter Pack', !s.pack);
check('the Supporter Pack door is there', s.shown['b-support'] === true, String(s.shown['b-support']));
await pg.browserContext().close();

await b.close(); srv.close();
console.log(fails ? `\n⛔ ${fails} check(s) failed` : '\n✅ the Play app is a bought build with nothing of ours reachable');
process.exit(fails ? 1 : 0);
