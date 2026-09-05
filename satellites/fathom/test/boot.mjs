#!/usr/bin/env node
/* Fathom boots, frames, and paints something.
 *
 *   node test/boot.mjs
 *
 * What it asserts, each watched to fail (the fail column is in the ledger):
 *   1. the page loads with no console error and no page error
 *   2. the title is FATHOM and the stamp is on the page
 *   3. inside an iframe it posts { sws: 'ready' } to the parent
 *   4. two REAL taps, PLAY then the first cave card, reach the play screen
 *   5. the canvas is not pure black where the player is standing
 *
 * Assertion 5 is the reason this gate exists. A game that paints black on black
 * is the easiest thing in the world to ship and call atmosphere.
 */
import { serve, open, reporter, tap, centre, sleep, puppeteer } from './harness.mjs';

const { base, close } = await serve();
const { browser, page, errors } = await open(base);
const { fails, say } = reporter();

say(errors.length === 0, 'the page boots with nothing on the console' + (errors.length ? ': ' + errors.join(' | ') : ''));
say((await page.title()) === 'FATHOM', 'the title is FATHOM, it is ' + JSON.stringify(await page.title()));
const stamp = await page.evaluate(() => window.FATHOM_DEV.stamp);
const html = await page.content();
say(!!stamp && html.indexOf(stamp) >= 0, 'the page carries its stamp ' + stamp);

/* 3. framed, it tells the arcade it is up */
const host = await browser.newPage();
await host.setViewport({ width: 375, height: 667 });
await host.setContent(
  `<body style="margin:0"><script>window.__msgs=[];addEventListener('message',e=>{if(e.data&&e.data.sws)window.__msgs.push(e.data.sws)})</script>
   <iframe src="${base}/index.html?framed=1" style="width:375px;height:640px;border:0"></iframe></body>`,
  { waitUntil: 'load' });
await host.waitForFunction(() => window.__msgs && window.__msgs.indexOf('ready') >= 0, { timeout: 20000 })
  .catch(() => {});
const msgs = await host.evaluate(() => window.__msgs);
say(msgs.indexOf('ready') >= 0, 'framed, it posts ready to the arcade (' + JSON.stringify(msgs) + ')');
await host.close();

/* 4. two real taps to the play screen */
const bPlay = await centre(page, '#btnPlay');
say(!!bPlay && bPlay.h >= 48 && bPlay.onTop, 'PLAY is ' + (bPlay ? bPlay.w.toFixed(0) + 'x' + bPlay.h.toFixed(0) : 'missing') + ' px and a tap at its centre lands on it');
await tap(page, '#btnPlay');
await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'select', { timeout: 10000 });
const card = await centre(page, '.card[data-lv="0"]');
say(!!card && card.h >= 48 && card.onTop, 'the first cave card is reachable and ' + (card ? card.h.toFixed(0) : '0') + ' px tall');
await tap(page, '.card[data-lv="0"]');
await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'play', { timeout: 10000 });
say(true, 'two real taps reach the play screen');

/* 5. there is light where the player is */
await page.waitForFunction(() => window.FATHOM_DEV.frames() > 12, { timeout: 20000 });
const pix = await page.evaluate(() => {
  const p = window.FATHOM_DEV.player();
  const s = window.FATHOM_DEV.screenOf(p.x, p.y);
  const cv = document.getElementById('board');
  const dpr = cv.width / window.innerWidth;
  const g = cv.getContext('2d');
  const d = g.getImageData(Math.round(s.x * dpr), Math.round(s.y * dpr), 1, 1).data;
  return { r: d[0], g: d[1], b: d[2], at: s };
});
say(pix.r + pix.g + pix.b > 12,
  'the canvas is lit where the player stands: rgb(' + pix.r + ',' + pix.g + ',' + pix.b + ') at ' +
  pix.at.x.toFixed(0) + ',' + pix.at.y.toFixed(0));

const late = await page.evaluate(() => window.FATHOM_DEV.frames());
say(late > 12, 'the frame loop is running (' + late + ' frames)');

await browser.close(); close();
console.log('');
if (fails.length) { console.log(fails.length + ' BOOT FAILURE(S)'); process.exit(1); }
console.log('BOOT OK');
