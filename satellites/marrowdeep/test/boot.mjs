#!/usr/bin/env node
/* Marrowdeep boots, says so, takes two real taps, and PAINTS.
 *
 *   node test/boot.mjs
 *
 * What it asserts, each watched to fail (both columns are in the ledger):
 *   1. the page loads with no console error and no page error
 *   2. document.title is MARROWDEEP
 *   3. the served HTML carries the stamp and MD_DEV.stamp is the same string
 *   4. inside an iframe it posts { sws: 'ready' } to the parent
 *   5. MD_DEV.ready is true and the screen is 'title'
 *   6. BEGIN and HOW are 48 px or more RENDERED at 375x667 and a thumb landing
 *      at the centre of each lands ON it (elementFromPoint, never el.click)
 *   7. a real tap on HOW reaches the how screen and a real tap on GOT IT comes
 *      back to the title
 *   8. the how screen shows every line in the bank, and at least six of them:
 *      six is the law, not the count of the file today. Six is what a first
 *      player must be told before the first quest (the dice, the two cards,
 *      Push, the bench, the boss, the dead), and a seventh line growing in
 *      later must not turn this gate red.
 *   9. THE PIXEL TEST: a pixel inside the title's own die motif is not the
 *      background colour
 *  10. the bottom left 120 by 120 CSS px of the title holds nothing of ours
 *
 * Assertion 9 is the reason this gate exists. A page that paints nothing at all
 * is the easiest thing in the world to ship and call atmosphere, and every
 * other assertion here would stay green while it did.
 *
 * How the pixel is read, and why this way. The die is inline SVG, so the
 * cheap version is to read the computed stroke of the drawn path and call it
 * paint. That proves the CSS and not the ink: a path can carry a 2.4 px stroke
 * and still paint nothing, behind a clip, at zero opacity, in a hidden screen,
 * or off the bottom of a short phone. So the gate takes a REAL screenshot of
 * the element's box and reads it back through canvas drawImage, which is the
 * pixel Chrome actually painted. The sample point is the exact centre of the
 * box because the motif's marrow pip is a filled disc centred there: the point
 * needs no path arithmetic and lands well inside the ink, so an off by one from
 * device pixel ratio cannot land the gate on an antialiased edge. It is
 * compared against the screen's own computed background colour rather than a
 * literal, so restyling the ground does not quietly make the test vacuous.
 */
import { serve, open, reporter, tap, centre, waitScreen } from './harness.mjs';

const { base, close } = await serve();
const { fails, say } = reporter();
let opened;
try {
  opened = await open(base);
} catch (e) {
  /* readiness is assertion 5 and it is the one that gates every other line, so
     a page that never becomes ready fails HERE, in one line, instead of as a
     stack trace with a browser left running behind it */
  say(false, 'MD_DEV.ready goes true and the screen is the title: ' + e.message);
  close();
  console.log('');
  console.log('1 BOOT FAILURE(S)');
  process.exit(1);
}
const { browser, page, errors } = opened;

/* 1, 2, 3 */
say(errors.length === 0, 'the page boots with nothing on the console' + (errors.length ? ': ' + errors.join(' | ') : ''));
const title = await page.title();
say(title === 'MARROWDEEP', 'the title is MARROWDEEP, it is ' + JSON.stringify(title));
/* ⛔ Not `html.indexOf(stamp) >= 0`: `var STAMP = '...'` is itself in the HTML,
   so that version passes on a page whose head is a stamp behind and cannot fail.
   It was watched trying: bumping var STAMP alone left the gate green. Every ?v=
   the page carries has to BE the stamp, and there are four of them (the
   manifest, the apple touch icon, the icon, the music include). */
const stamp = await page.evaluate(() => window.MD_DEV.stamp);
const html = await page.content();
const marks = (html.match(/\?v=[0-9a-z]+/g) || []).map(s => s.slice(3));
const drift = marks.filter(m => m !== stamp);
say(!!stamp && /^[0-9]{8}[a-z]$/.test(stamp) && marks.length >= 4 && drift.length === 0,
  'the page carries its stamp on all ' + marks.length + ' of its urls and MD_DEV.stamp is the same string (' +
  stamp + (drift.length ? ', DRIFTED: ' + Array.from(new Set(drift)).join(', ') : '') + ')');

/* 4. framed, it tells the arcade it is up */
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

/* 5. readiness is a DOM fact, not a frame count */
const boot = await page.evaluate(() => ({ ready: window.MD_DEV.ready, screen: window.MD_DEV.screen() }));
say(boot.ready === true && boot.screen === 'title',
  'MD_DEV.ready is true and the screen is the title (ready=' + boot.ready + ', screen=' + JSON.stringify(boot.screen) + ')');

/* 6. the two buttons a thumb has on the title */
for (const [sel, name] of [['#btnBegin', 'BEGIN'], ['#btnHow', 'HOW']]) {
  const b = await centre(page, sel);
  say(!!b && b.h >= 48 && b.w >= 48 && b.onTop,
    name + ' is ' + (b ? b.w.toFixed(0) + 'x' + b.h.toFixed(0) : 'missing') +
    ' px rendered and a thumb at its centre lands on it' + (b ? ' (' + (b.onTop ? 'lands' : 'BLOCKED') + ')' : ''));
}

/* 9. the pixel, read BEFORE the taps so it is the title a player opens on.
   The clip is the element's own box, so the centre of the image is the centre
   of the die and the marrow pip that sits there. */
const mark = await page.evaluate(() => {
  const el = document.getElementById('titleMark');
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const scr = document.getElementById('scr-title');
  const bg = getComputedStyle(scr).backgroundColor.match(/[0-9.]+/g).map(Number);
  return { x: r.left, y: r.top, w: r.width, h: r.height, bg: [bg[0], bg[1], bg[2]] };
});
say(!!mark && mark.w >= 40 && mark.h >= 40,
  'the die motif is on the title with a real rect' + (mark ? ' (' + mark.w.toFixed(0) + 'x' + mark.h.toFixed(0) + ')' : ': MISSING'));
if (mark) {
  const shot = await page.screenshot({
    encoding: 'base64',
    clip: { x: mark.x, y: mark.y, width: mark.w, height: mark.h }
  });
  const pix = await page.evaluate(async (b64, bg) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    const cx = Math.floor(img.width / 2), cy = Math.floor(img.height / 2);
    const d = g.getImageData(cx, cy, 1, 1).data;
    /* and how much of the whole motif is ink of ours, which is what makes an
       empty box with one stray pixel in the middle fail too */
    const all = g.getImageData(0, 0, img.width, img.height).data;
    let lit = 0;
    for (let i = 0; i < all.length; i += 4) {
      if (Math.max(Math.abs(all[i] - bg[0]), Math.abs(all[i + 1] - bg[1]), Math.abs(all[i + 2] - bg[2])) > 24) lit++;
    }
    return { r: d[0], g: d[1], b: d[2], w: img.width, h: img.height, lit: lit / (all.length / 4) };
  }, shot, mark.bg);
  const dist = Math.max(Math.abs(pix.r - mark.bg[0]), Math.abs(pix.g - mark.bg[1]), Math.abs(pix.b - mark.bg[2]));
  say(dist > 30,
    'the die motif is painted: its centre pixel is rgb(' + pix.r + ',' + pix.g + ',' + pix.b + ') against a ground of rgb(' +
    mark.bg.join(',') + '), ' + dist + ' apart');
  say(pix.lit > 0.02,
    'and it is a drawing, not one stray dot: ' + (pix.lit * 100).toFixed(1) + ' percent of the motif box is ink of ours');
}

/* 10. the fleet's music chip sits in the bottom left 120 by 120 on every screen
   and chases free space, so nothing of ours may share that box. Rectangles are
   measured, not elementFromPoint alone: a pointer-events:none caption is
   invisible to a hit test and perfectly visible to a player. */
const intruders = await page.evaluate(() => {
  const H = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  const BOX = { l: 0, t: H - 120, r: 120, b: H };
  const skip = { app: 1, glyphs: 1 };
  const bad = [];
  document.querySelectorAll('#app *').forEach(el => {
    if (el.id && skip[el.id]) return;
    if (el.classList.contains('screen') || el.classList.contains('body') ||
        el.classList.contains('pin') || el.classList.contains('spacer')) return;
    const scr = el.closest('.screen');
    if (!scr || !scr.classList.contains('on')) return;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return;
    if (r.right <= BOX.l || r.left >= BOX.r || r.bottom <= BOX.t || r.top >= BOX.b) return;
    /* only things that PAINT or take a tap count: a wrapper with no ink of its
       own is not what collides with the chip */
    const own = Array.prototype.filter.call(el.childNodes, n => n.nodeType === 3 && n.textContent.trim()).length > 0;
    const paints = el.tagName === 'BUTTON' || el.tagName === 'svg' || el.tagName === 'IMG' ||
      (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent') ||
      cs.borderTopWidth !== '0px' || own;
    if (!paints) return;
    bad.push((el.id || el.className || el.tagName) + ' at ' + r.left.toFixed(0) + ',' + r.top.toFixed(0) +
      ' ' + r.width.toFixed(0) + 'x' + r.height.toFixed(0));
  });
  for (let x = 6; x <= 114; x += 18) {
    for (let y = H - 114; y <= H - 6; y += 18) {
      const el = document.elementFromPoint(x, y);
      if (el && el.tagName === 'BUTTON') bad.push('button ' + (el.id || '') + ' under ' + x + ',' + Math.round(y));
    }
  }
  return Array.from(new Set(bad));
});
say(intruders.length === 0,
  'the bottom left 120 by 120 of the title is free for the music chip' + (intruders.length ? ': ' + intruders.join(', ') : ''));

/* 7 and 8. two real taps, out to HOW and back */
await tap(page, '#btnHow');
await waitScreen(page, 'how').catch(() => {});
const onHow = await page.evaluate(() => window.MD_DEV.screen());
say(onHow === 'how', 'a real tap on HOW reaches the how screen (it is ' + JSON.stringify(onHow) + ')');

const lines = await page.evaluate(() => {
  const rows = document.querySelectorAll('#scr-how .howline');
  const bank = (window.MD_DEV.data().lines.how || []).length;
  let shown = 0;
  rows.forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.height > 1 && el.textContent.trim()) shown++;
  });
  return { shown: shown, bank: bank };
});
say(lines.shown >= 6 && lines.shown === lines.bank,
  'the how screen shows the whole bank and at least six lines (' + lines.shown + ' shown, ' + lines.bank + ' written)');

const gotIt = await centre(page, '#btnGotIt');
say(!!gotIt && gotIt.h >= 48 && gotIt.onTop,
  'GOT IT is ' + (gotIt ? gotIt.w.toFixed(0) + 'x' + gotIt.h.toFixed(0) : 'missing') + ' px rendered and reachable');
await tap(page, '#btnGotIt');
await waitScreen(page, 'title').catch(() => {});
const backHome = await page.evaluate(() => window.MD_DEV.screen());
say(backHome === 'title', 'a real tap on GOT IT comes back to the title (it is ' + JSON.stringify(backHome) + ')');

await browser.close(); close();
console.log('');
if (fails.length) { console.log(fails.length + ' BOOT FAILURE(S)'); process.exit(1); }
console.log('BOOT OK');
