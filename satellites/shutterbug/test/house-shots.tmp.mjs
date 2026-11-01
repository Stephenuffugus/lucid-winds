/* scratch: HOUSE-A's shots (not a gate; removed before the commit) */
import { serve, launch, newPage, gotoGame, ready, tap } from './harness.mjs';
const OUT = '/home/codespace/sb-drafts/house/a/shots/';
const srv = await serve(), browser = await launch();
const climb = p => p.evaluate(() => { window.SB_DEV.goto('exit'); window.SB_DEV.step(2); });
const speck = p => p.evaluate(() => { window.SB_DEV.goto('speck'); window.SB_DEV.step(2); });
const st = async (p, sel) => { await p.evaluate(s => document.querySelector(s).scrollIntoView({ block: 'center' }), sel); await tap(p, sel); };
const recent = async p => { await st(p, '#doorrecent'); await st(p, '#doorrecentlist button'); await p.waitForFunction(() => window.SB_DEV.screen() === 'play', { timeout: 10000 }).catch(() => {}); };
const shot = async (p, name) => { await p.evaluate(() => { const s = document.querySelector('.screen.on'); if (s) s.scrollTop = 0; }); await new Promise(r => setTimeout(r, 250)); await p.screenshot({ path: OUT + name + '.png' }); console.log('shot ' + name); };
try {
  for (const [w, h] of [[412, 915], [360, 780], [320, 568]]) {
    const { page, errors } = await newPage(browser, { width: w, height: h, dpr: 2 });
    const tag = w + 'x' + h;
    await gotoGame(page, srv.base); await ready(page);
    await page.evaluate(() => localStorage.clear()); await page.reload(); await ready(page);
    await page.evaluate(() => window.SB_DEV.hold(true));
    await tap(page, '#sample'); await climb(page); await tap(page, '#cleartitle');
    await st(page, '#housestart');
    await recent(page); await speck(page); await climb(page);
    await shot(page, tag + '-door');
    await recent(page); await climb(page);
    await st(page, '#doorleave');
    await shot(page, tag + '-title-saved');
    await st(page, '#housego'); await recent(page);
    await page.evaluate(() => window.SB_DEV.step(40));
    await shot(page, tag + '-room3');
    await speck(page);
    await page.evaluate(() => { for (let k = 0; k < 9000 && window.SB_DEV.screen() === 'play'; k += 30) window.SB_DEV.step(30); });
    await shot(page, tag + '-death');
    await tap(page, '#deathretry'); await climb(page);
    for (let k = 0; k < 2; k++) { await st(page, '#doorenter'); await climb(page); }
    await recent(page); await climb(page); await recent(page); await speck(page); await climb(page);
    await shot(page, tag + '-cleared');
    console.log(tag + ' errors: ' + errors.length + ' ' + errors.join(' ; '));
    await page.close();
  }
} finally { await browser.close(); await srv.close(); }
