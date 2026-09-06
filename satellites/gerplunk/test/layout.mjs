#!/usr/bin/env node
/* Every button a thumb uses, on every screen, at the three widths.
 *
 *   node test/layout.mjs
 *
 * The studio law is 48 px RENDERED, and reachable: a button that measures 48 px
 * under something else is not a button. So every check here is three things,
 * the rectangle, document.elementFromPoint at its centre landing on it, and the
 * whole rectangle inside the viewport. Nothing tappable off the screen.
 * ⛔ el.click() proves nothing and is not used anywhere in this file.
 * ⛔ a missing or hidden element is a FAIL, never a skip: every screen is put
 * on first and its buttons counted before they are measured.
 *
 * It also holds the seat: the bottom left 120 by 120 of the lake belongs to the
 * fleet's music chip and its folded pill, and nothing of Gerplunk's may be in
 * it but the water itself.
 */
import { serve, open, reporter, tap, centre, waitFrames } from './harness.mjs';

const { base, close } = await serve();
const { fails, say } = reporter();
const SIZES = [{ width: 375, height: 667 }, { width: 320, height: 568 }, { width: 412, height: 915 }];

for (const size of SIZES) {
  const tag = size.width + 'x' + size.height;
  const { browser, page } = await open(base, size);
  const dev = (fn, ...a) => page.evaluate(fn, ...a);

  async function check(sel, label, min) {
    const c = await centre(page, sel);
    const need = min || 48;
    const ok = !!c && c.w >= need && c.h >= need && c.onTop && c.inView;
    say(ok, tag + '  ' + label + '  ' + (c ? c.w.toFixed(0) + 'x' + c.h.toFixed(0) + (c.onTop ? '' : ' NOT ON TOP') + (c.inView ? '' : ' OFF THE SCREEN') : 'MISSING'));
  }
  async function count(sel, n, label) {
    const got = await dev((sel) => document.querySelectorAll(sel).length, sel);
    say(got === n, tag + '  ' + label + ': ' + got + ' of ' + n);
  }

  /* the title */
  say((await dev(() => window.GERPLUNK_DEV.screen())) === 'title', tag + '  boots to the title');
  await check('#btnPlay', 'TO THE LAKE', 56);

  /* the lake */
  await tap(page, '#btnPlay');
  await page.waitForFunction(() => window.GERPLUNK_DEV.screen() === 'lake', { timeout: 15000 });
  await waitFrames(page, 3);
  await check('#btnMenu', 'MENU');
  await count('.stone', 3, 'stones on the bank');
  const ids = await dev(() => Array.from(document.querySelectorAll('.stone')).map(b => b.getAttribute('data-id')));
  for (const id of ids) await check('.stone[data-id="' + id + '"]', 'stone ' + id);
  const post = await centre(page, '#post');
  say(!!post && post.inView, tag + '  the tally post is on the screen');
  /* the music chip's seat */
  const seat = await dev(() => {
    const H = window.innerHeight, hits = [];
    for (const [x, y] of [[20, H - 20], [60, H - 60], [110, H - 110], [110, H - 20], [20, H - 110]]) {
      const el = document.elementFromPoint(x, y);
      hits.push(el ? (el.id || el.tagName) : 'none');
    }
    return hits;
  });
  say(seat.every(h => h === 'stage'), tag + '  the bottom left 120x120 is only water (' + seat.join(', ') + ')');
  /* every button on the lake is inside the viewport */
  const off = await dev(() => Array.from(document.querySelectorAll('#hud button')).filter(b => {
    const r = b.getBoundingClientRect();
    return r.width > 0 && (r.left < 0 || r.top < 0 || r.right > window.innerWidth || r.bottom > window.innerHeight);
  }).map(b => b.id || b.getAttribute('data-id')));
  say(off.length === 0, tag + '  nothing tappable is off the screen' + (off.length ? ': ' + off.join(', ') : ''));

  /* the sheet */
  await tap(page, '#btnMenu');
  await page.waitForFunction(() => window.GERPLUNK_DEV.screen() === 'sheet', { timeout: 15000 });
  await check('#btnSound', 'SOUND', 56);
  await check('#btnMotion', 'MOTION', 56);
  await check('#btnBack', 'BACK TO THE LAKE', 56);
  await check('#btnExit', 'LEAVE THE LAKE', 56);
  await tap(page, '#btnBack');
  await page.waitForFunction(() => window.GERPLUNK_DEV.screen() === 'lake', { timeout: 15000 });
  say(true, tag + '  BACK returns to the lake');

  await browser.close();
}

close();
console.log('');
if (fails.length) { console.log(fails.length + ' LAYOUT FAILURE(S)'); process.exit(1); }
console.log('LAYOUT OK');
