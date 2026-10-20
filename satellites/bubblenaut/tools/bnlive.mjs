#!/usr/bin/env node
/* BUBBLENAUT live proof on a phone profile that ALREADY HOLDS THE OLD WORKER (feedback_verify_on_a_device_with_the_old_worker).
 *
 *   node satellites/bubblenaut/tools/bnlive.mjs --phase before   # BEFORE the push: install the portal's root worker, read the old build
 *   node satellites/bubblenaut/tools/bnlive.mjs --phase after    # after the deploy is live: same profiles, read the new build back
 *
 * One persistent Chrome profile per origin (lucidwinds.com and www. are TWO origins: two workers, two saves). The worker
 * is the one the portal registers (/sw.js?v=27, scope /), which serves pages network first and images cache first by URL.
 * Requests are kept few and spaced, and the run STOPS at the first 403 or 429 from the host: this box's address has been
 * tarpitted and 403'd by the origin after bursts (project_cdn_429_lockout_sep15), and a blocked probe proves nothing. */
import fs from 'fs'; import path from 'path'; import puppeteer from 'puppeteer';
const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, all) => (v.startsWith('--') ? a.concat([[v.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : '1']]) : a), []));
const PHASE = args.phase || 'before';
const OUT = args.out || '/tmp/bn-lead/live'; fs.mkdirSync(OUT, { recursive: true });
const ORIGINS = (args.origins || 'https://lucidwinds.com,https://www.lucidwinds.com').split(',');
const UA = 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36';
const wait = ms => new Promise(r => setTimeout(r, ms));
const report = { phase: PHASE, at: new Date().toISOString(), origins: [] };
for (const origin of ORIGINS) {
  const host = new URL(origin).host;
  const profile = `/tmp/bn-lead/phone-profile-${host}`;
  const browser = await puppeteer.launch({ headless: 'new', userDataDir: profile, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newPage();
  await page.setUserAgent(UA);
  await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true });
  const statuses = []; let blocked = null;
  page.on('response', r => { const s = r.status(); const u = r.url(); if (u.startsWith(origin)) { statuses.push([s, u.replace(origin, ''), r.fromServiceWorker() ? 'sw' : 'net']); if ((s === 403 || s === 429) && !blocked) blocked = s + ' ' + u; } });
  const rec = { origin, profile };
  try {
    if (PHASE === 'before') {
      await page.goto(origin + '/satellites/bubblenaut/?v=2', { waitUntil: 'load', timeout: 60000 });
      if (blocked) throw new Error('host blocked: ' + blocked);
      // the portal registers this same worker at scope /; a player who came from the arcade has it
      rec.sw = await page.evaluate(async () => { const r = await navigator.serviceWorker.register('/sw.js?v=27'); await navigator.serviceWorker.ready; return r.active ? r.active.scriptURL : 'none'; });
      await wait(6000);   // let the install's precache finish, spaced
      await page.goto(origin + '/satellites/bubblenaut/?v=2', { waitUntil: 'load', timeout: 60000 });
      await wait(1500);
    } else {
      for (const v of ['3', '2']) {   // the new arcade link, and the old one a bookmark still holds
        await page.goto(origin + '/satellites/bubblenaut/?v=' + v, { waitUntil: 'load', timeout: 60000 });
        if (blocked) throw new Error('host blocked: ' + blocked);
        await page.addStyleTag({ content: '#sws-music-card,#sws-music-toast,#sws-music-chip,.sws-music-pill,.lwfb-tip{display:none!important}' });
        const t0 = Date.now(); let art = null;
        while (Date.now() - t0 < 30000) { art = await page.evaluate(() => window.__bn && window.__bn.art); if (art && ['hero', 'items', 'fx', 'moss_moon', 'tiles_moss_moon', 'bg_moss_moon'].every(k => art[k] === 1)) break; await wait(1000); }
        rec['art_v' + v] = art;
        rec['stamp_v' + v] = await page.evaluate(() => document.getElementById('buildstamp').textContent);
        await page.screenshot({ path: path.join(OUT, `${host}-title-v${v}.png`) });
        if (v === '3') {
          await page.evaluate(() => { window.__bn.t.god(true); window.__bn.t.level(0); }); await wait(2500);
          await page.screenshot({ path: path.join(OUT, `${host}-room1.png`) });
          await page.evaluate(() => { window.__bn.t.god(false); });
        }
        await wait(2500);
      }
    }
    rec.controlled = await page.evaluate(() => !!navigator.serviceWorker.controller && navigator.serviceWorker.controller.scriptURL);
    rec.stamp = await page.evaluate(() => { const b = document.getElementById('buildstamp'); return b ? b.textContent : null; });
  } catch (e) { rec.err = String(e.message || e); }
  rec.requests = statuses.length; rec.byWorker = statuses.filter(s => s[2] === 'sw').length; rec.blocked = blocked;
  rec.bad = statuses.filter(s => s[0] >= 400).slice(0, 8);
  report.origins.push(rec);
  await browser.close();
  if (blocked) break;          // never hammer a host that has started refusing
  await wait(8000);
}
fs.writeFileSync(path.join(OUT, `report-${PHASE}.json`), JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
