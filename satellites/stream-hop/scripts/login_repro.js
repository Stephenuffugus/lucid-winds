#!/usr/bin/env node
/* JIMOTHY LOGIN LOCKOUT REPRO — Stephen 2026-07-26:
 *   "if i log in i cant open jimothy. i have to clear my browsing data and i
 *    can log in again and then if i close it and try to play again while
 *    logged in, i cant."
 *
 * So the failing state is: boot with a PERSISTED Firebase session. This drives
 * the LIVE site (his phone runs the live site + real SW + real edge, so a
 * local copy would test the wrong thing) through his exact sequence:
 *
 *   1. fresh profile  -> boot -> tap through   (his "after clearing data")
 *   2. create throwaway account, let sync settle  (his "log in and play")
 *   3. close the tab, open a new one           (his "close and try again")
 *   4. measure THAT boot: alive? tap works? errors? how long?
 *   5. and once more, because he says it keeps happening
 *
 * The throwaway is deleted at the end. One account, a handful of page loads —
 * this is a repro, not a fleet.
 *
 * USAGE  node satellites/stream-hop/scripts/login_repro.js [urlOverride]
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const URL = (process.argv[2] || 'https://lucidwinds.com/satellites/stream-hop/') + '?shtest=1';
const PROFILE = '/tmp/claude-1000/-workspaces-lucid-winds/83cf72b0-ce3d-4d27-8e18-21af14ee585f/scratchpad/jim-login-profile';
const SHOTS = '/tmp/claude-1000/-workspaces-lucid-winds/83cf72b0-ce3d-4d27-8e18-21af14ee585f/scratchpad';
const EMAIL = 'repro-' + Date.now() + '@jimothy-repro.test';
const PASS = 'repro-pass-1234';

fs.rmSync(PROFILE, { recursive: true, force: true });

function wire(page, tag, log) {
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') log.push(tag + ' console.' + m.type() + ': ' + m.text().slice(0, 300)); });
  page.on('pageerror', e => log.push(tag + ' PAGEERROR: ' + String(e && e.message).slice(0, 300)));
  page.on('requestfailed', r => log.push(tag + ' REQFAIL: ' + r.failure().errorText + ' ' + r.url().slice(0, 140)));
  page.on('response', r => { if (r.status() >= 400) log.push(tag + ' HTTP ' + r.status() + ' ' + r.url().slice(0, 140)); });
}

/* What "openable" means, measured: page JS ran (SH_DEV exists), the splash tap
   div is present, and CLICKING it changes the screen. Anything less is what
   Stephen calls "cant open". */
async function probeBoot(page, tag, log) {
  const out = { tag, loaded: false, jsAlive: false, splashSeen: false, tapWorked: false, screen: null, ms: 0 };
  const t0 = Date.now();
  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
    out.loaded = true;
  } catch (e) { log.push(tag + ' GOTO FAILED: ' + e.message.slice(0, 200)); }
  // give boot() + deferred cloud work time to do their worst
  await new Promise(r => setTimeout(r, 6000));
  try {
    out.jsAlive = await page.evaluate(() => !!window.SH_DEV);
    out.splashSeen = await page.evaluate(() => { const el = document.getElementById('splash-tap'); return !!(el && el.offsetParent !== null); });
    const before = await page.evaluate(() => (document.querySelector('.screen.on') || {}).id || null);
    if (out.splashSeen && before === 's-splash') {
      await page.evaluate(() => document.getElementById('splash-tap').click());
      await new Promise(r => setTimeout(r, 1200));
    }
    out.screen = await page.evaluate(() => (document.querySelector('.screen.on') || {}).id || null);
    out.tapWorked = out.screen !== null && out.screen !== 's-splash';
    out.signedIn = await page.evaluate(() => { try { return window.Sunbeam && Sunbeam._snapshot ? Sunbeam._snapshot().signedIn : null; } catch (e) { return 'threw: ' + e.message; } });
  } catch (e) { log.push(tag + ' PROBE EVAL FAILED (page dead?): ' + e.message.slice(0, 200)); }
  out.ms = Date.now() - t0;
  try { await page.screenshot({ path: path.join(SHOTS, 'jim-' + tag + '.png') }); } catch (e) {}
  return out;
}

(async () => {
  const log = [];
  const browser = await puppeteer.launch({
    headless: 'new',
    userDataDir: PROFILE,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  // ── 1. fresh boot (post-clear state) ──────────────────────────────────
  let page = await browser.newPage();
  await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
  wire(page, 'boot1-fresh', log);
  const boot1 = await probeBoot(page, 'boot1-fresh', log);

  // ── 2. sign up + let sync settle (his working session) ────────────────
  let signup = null;
  try {
    signup = await page.evaluate((em, pw) =>
      Sunbeam.createAccount(em, pw).then(() => 'ok').catch(e => 'FAIL: ' + (e && e.code || e && e.message)), EMAIL, PASS);
  } catch (e) { signup = 'eval threw: ' + e.message; }
  await new Promise(r => setTimeout(r, 8000));   // auth event, hydrate, cloudPull(true) -> push
  const postLogin = await page.evaluate(() => {
    try { const s = Sunbeam._snapshot(); return { signedIn: s.signedIn, uid: (s.uid || '').slice(0, 6) }; } catch (e) { return 'threw'; }
  });

  // ── 3. close, reopen with persisted auth (the failing state) ──────────
  await page.close();
  page = await browser.newPage();
  await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
  wire(page, 'boot2-signedin', log);
  const boot2 = await probeBoot(page, 'boot2-signedin', log);

  // ── 4. and again ──────────────────────────────────────────────────────
  await page.close();
  page = await browser.newPage();
  await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
  wire(page, 'boot3-signedin', log);
  const boot3 = await probeBoot(page, 'boot3-signedin', log);

  // ── cleanup: delete the throwaway ─────────────────────────────────────
  let cleanup = 'skipped';
  try {
    cleanup = await page.evaluate(() => {
      try {
        const app = firebase.app('sunbeam-sdk');
        const u = firebase.auth(app).currentUser;
        if (!u) return 'no user';
        return app.firestore().collection('vaults').doc(u.uid).delete()
          .catch(() => null).then(() => u.delete()).then(() => 'deleted').catch(e => 'delete failed: ' + e.code);
      } catch (e) { return 'threw: ' + e.message; }
    });
  } catch (e) { cleanup = 'eval threw: ' + e.message.slice(0, 120); }

  console.log('\nJIMOTHY LOGIN REPRO —', URL);
  console.log('─'.repeat(72));
  for (const b of [boot1, boot2, boot3]) {
    console.log(b.tag.padEnd(16),
      'loaded:' + b.loaded, 'js:' + b.jsAlive, 'splash:' + b.splashSeen,
      'tap->menu:' + b.tapWorked, 'screen:' + b.screen, 'signedIn:' + b.signedIn, b.ms + 'ms');
  }
  console.log('signup:', signup, '| post-login:', JSON.stringify(postLogin), '| cleanup:', cleanup);
  console.log('\nEVENT LOG (' + log.length + ')');
  log.slice(0, 60).forEach(l => console.log('  ' + l));
  const broken = !boot2.tapWorked || !boot3.tapWorked;
  console.log('\n' + (broken ? '⛔ REPRODUCED: signed-in boot fails.' : '✓ did NOT reproduce here: all three boots opened.'));
  await browser.close();
})();
