import { serve, launch, gotoGame, ready, GAME } from '../../satellites/shutterbug/test/harness.mjs';
import { readFileSync } from 'node:fs';
const BLOBS = readFileSync(GAME + '/fixtures/synthetic/saturated-blobs.json', 'utf8'), OUT = '/home/codespace/sb-drafts/weapons2/art3/shots';
const srv = await serve(), browser = await launch();
try { for (const [w, h] of [[412, 915], [360, 780], [320, 568]]) {
  const page = await browser.newPage(); await page.setViewport({ width: w, height: h, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await gotoGame(page, srv.base); await ready(page); await page.evaluate(() => window.SB_DEV.hold(true));
  for (const [b, t] of [[0, 300], [3, 900]]) {
    const ok = await page.evaluate((s, b, t) => { window.SB_DEV.revealSkip(false); window.SB_DEV.loadRecord(s, b); const ok = window.SB_DEV.revealAt(t); window.SB_DEV.revealSkip(true); return ok + ' ' + window.SB_DEV.screen(); }, BLOBS, b, t);
    const f = OUT + '/reveal2-biome' + b + '-' + t + '-' + w + 'x' + h + '.png'; await page.screenshot({ path: f }); console.log(f, ok);
    await page.evaluate(() => { if (window.SB.ui.reveal.on) window.SB.ui.endReveal(); });
  }
  await page.close();
} } finally { await browser.close(); await srv.close(); }
