/* THE PLAY APP BOUNDARY, for any satellite (21 Oct 2026, generalised from Jimothy's test/play-boundary.mjs).
     node scripts/twa_boundary_probe.mjs <slug> <package>        (server on 8777 at the repo root)
   Drives the live page three ways at 412x915 and prints what a Play reviewer would meet:
     web      no referrer: the positive control (exit and install rows there, the sunbeam SDK loads)
     play     android-app://<package>/: SWS_IN_TWA true, no SDK, no Firebase, exit hidden, SWS_EXIT stays put,
              privacy row shown, nothing sent to our cloud functions / Firebase / a checkout / the portal
     gmail    android-app://com.google.android.gm/: the WEB build (another app opening a link is not the Play app)
   Every off-box request is answered by the probe itself, so nothing reaches the real host. Exit 1 on any red. */
import puppeteer from 'puppeteer';
const [slug, pkg] = process.argv.slice(2);
if (!slug || !pkg) { console.log('usage: node scripts/twa_boundary_probe.mjs <slug> <package>'); process.exit(2); }
const BASE = `http://127.0.0.1:8777/satellites/${slug}/`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-gpu'] });
let fails = 0;
const check = (label, pass, note = '') => { if (!pass) fails++; console.log(` ${pass ? 'ok  ' : '⛔  '} ${label}${note ? '  — ' + note : ''}`); };
const offCloud = list => list.filter(u => /cloudfunctions\.net|firebase|gstatic\.com\/firebasejs|stripe|nowpayments|lucidwinds\.com\/portal/i.test(u));

async function run(label, referrer) {
  const ctx = await b.createBrowserContext(); const pg = await ctx.newPage();
  await pg.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
  await pg.setRequestInterception(true); const off = [];
  pg.on('request', r => { const u = r.url(); if (u.startsWith('http://127.0.0.1:8777/') || /^(data|blob):/.test(u)) return r.continue(); off.push(u); r.respond({ status: 204, body: '' }); });
  await pg.evaluateOnNewDocument(r => { if (r !== null) Object.defineProperty(document, 'referrer', { get: () => r, configurable: true }); }, referrer);
  await pg.goto(BASE, { waitUntil: 'domcontentloaded' }); await sleep(3500);
  const s = await pg.evaluate(() => {
    const vis = id => { const e = document.getElementById(id); return e ? getComputedStyle(e).display !== 'none' : 'missing'; };
    const before = location.href; let threw = null;
    try { window.SWS_EXIT && window.SWS_EXIT(); } catch (e) { threw = String(e).slice(0, 80); }
    return { twa: window.SWS_IN_TWA === true, sdk: !!window.Sunbeam, firebase: !!window.firebase, exit: vis('b-exit'), install: vis('b-install'), privacy: vis('set-privacy'), fab: !!window.LW_Feedback, threw };
  });
  await sleep(700); let url = 'gone'; try { url = pg.url(); } catch (e) {}
  await ctx.close();
  return { ...s, url, off };
}

console.log('web (no referrer, the positive control)');
let s = await run('web', null);
check('not the Play app', !s.twa); check('the sunbeam SDK loads', s.sdk); check('exit row there', s.exit === true, String(s.exit));
check('privacy row hidden', s.privacy === false, String(s.privacy)); check('the exit leaves the game', /lucidwinds\.com\/portal/.test(s.off.join(' ')) || !s.url.includes(`/${slug}/`), s.url);

console.log('play (our package)');
s = await run('play', `android-app://${pkg}/`);
check('is the Play app', s.twa); check('no sunbeam SDK', !s.sdk); check('no Firebase', !s.firebase);
check('exit row gone', s.exit !== true, String(s.exit)); check('install row gone', s.install !== true, String(s.install));
check('privacy row shown', s.privacy === true, String(s.privacy)); check('no feedback fab', !s.fab);
check('the exit stays in the app', !s.threw && s.url.includes(`/${slug}/`), s.url);
check('nothing sent to our cloud, Firebase, a checkout or the portal', offCloud(s.off).length === 0, offCloud(s.off).join(' '));

console.log('gmail (another app opened the link)');
s = await run('gmail', 'android-app://com.google.android.gm/');
check('NOT the Play app', !s.twa); check('exit row there', s.exit === true, String(s.exit));

await b.close();
console.log(fails ? `\n⛔ ${fails} check(s) failed` : '\n✅ the Play app boundary holds');
process.exit(fails ? 1 : 0);
