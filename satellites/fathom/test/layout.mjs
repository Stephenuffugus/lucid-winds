#!/usr/bin/env node
/* Every button a thumb uses, on every screen, at the three widths.
 *
 *   node test/layout.mjs
 *
 * The studio law is 48 px RENDERED, and reachable: a button that measures 48 px
 * under something else is not a button. So every check here is two things, the
 * rectangle AND document.elementFromPoint at its centre landing on it.
 * ⛔ el.click() proves nothing and is not used anywhere in this file.
 *
 * It also holds the seat: the bottom left 120 by 120 of the play screen belongs
 * to the fleet's music chip and its folded pill, and nothing of Fathom's may be
 * in it.
 */
import { serve, open, reporter, tap, centre, sleep } from './harness.mjs';

const { base, close } = await serve();
const { fails, say } = reporter();
const SIZES = [{ width: 375, height: 667 }, { width: 320, height: 568 }, { width: 412, height: 915 }];

for (const size of SIZES) {
  const tag = size.width + 'x' + size.height;
  const { browser, page, errors } = await open(base, size);
  const dev = (fn, ...a) => page.evaluate(fn, ...a);

  async function check(sel, label, min) {
    const c = await centre(page, sel);
    const need = min || 48;
    const ok = !!c && c.w >= need && c.h >= need && c.onTop;
    say(ok, tag + '  ' + label + '  ' + (c ? c.w.toFixed(0) + 'x' + c.h.toFixed(0) + (c.onTop ? '' : ' NOT ON TOP') : 'MISSING'));
  }

  /* the title */
  await check('#btnPlay', 'PLAY');
  await check('#btnDeep', 'THE DEEP');
  await check('#btnHow', 'HOW TO PLAY');
  await check('#btnSound', 'SOUND');
  await check('#btnMotion', 'MOTION');

  /* how to play */
  await tap(page, '#btnHow');
  await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'how', { timeout: 15000 });
  await check('#btnHowOk', 'GOT IT');
  await tap(page, '#btnHowOk');
  await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'title', { timeout: 15000 });

  /* the caves */
  await tap(page, '#btnPlay');
  await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'select', { timeout: 15000 });
  for (let i = 0; i < 5; i++) await check('.card[data-lv="' + i + '"]', 'cave card ' + (i + 1));
  await check('#btnSelBack', 'BACK');

  /* the cave itself */
  await tap(page, '.card[data-lv="0"]');
  await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'play', { timeout: 15000 });
  await page.waitForFunction(() => window.FATHOM_DEV.frames() > 6, { timeout: 20000 });
  await check('#btnPause', 'PAUSE');
  await check('#btnHum', 'HUM', 56);

  /* the music chip's seat: nothing of ours in the bottom left 120 by 120.
     ⛔ The first version of this asked elementFromPoint, which skips anything
     with pointer-events:none. The HUD is pointer-events:none, so moving the
     stone count into the corner left the gate GREEN on a collision a player
     would see immediately. It measures RECTANGLES now, and asks
     elementFromPoint as well for the taps. */
  const intruders = await dev(() => {
    const H = window.innerHeight, BOX = { l: 0, t: H - 120, r: 120, b: H };
    const containers = ['app', 'board', 'hud', 'fade', 'toast', 'testPanel'];
    const bad = [];
    document.querySelectorAll('#app *').forEach(el => {
      if (containers.indexOf(el.id) >= 0) return;
      if (el.classList.contains('screen')) return;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return;
      if (el.closest('.screen') && !el.closest('.screen').classList.contains('on')) return;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return;
      if (r.right <= BOX.l || r.left >= BOX.r || r.bottom <= BOX.t || r.top >= BOX.b) return;
      bad.push((el.id || el.className || el.tagName) + ' at ' + r.left.toFixed(0) + ',' + r.top.toFixed(0));
    });
    for (let x = 6; x <= 114; x += 18) {
      for (let y = H - 114; y <= H - 6; y += 18) {
        const el = document.elementFromPoint(x, y);
        if (el && el.tagName.toLowerCase() === 'button') bad.push('button ' + (el.id || ''));
      }
    }
    return Array.from(new Set(bad));
  });
  say(intruders.length === 0, tag + '  the bottom left 120 by 120 is free for the music pill' + (intruders.length ? ': ' + intruders.join(', ') : ''));

  /* the hint never sits under the thumb either */
  const hintBox = await dev(() => {
    const el = document.getElementById('hint');
    const r = el.getBoundingClientRect();
    return { bottom: window.innerHeight - r.bottom, left: r.left };
  });
  say(hintBox.bottom >= 100, tag + '  the hint line clears the thumb row by ' + hintBox.bottom.toFixed(0) + ' px');

  /* pause */
  await tap(page, '#btnPause');
  await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'pause', { timeout: 15000 });
  await check('#btnResume', 'RESUME');
  await check('#btnRestart', 'RESTART');
  await check('#btnQuit', 'LEAVE THE CAVE');
  await check('#btnSound2', 'SOUND in pause');
  await check('#btnMotion2', 'MOTION in pause');

  /* nothing on any screen may scroll the page sideways */
  const wide = await dev(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  say(!wide, tag + '  nothing pushes the page sideways');

  say(errors.length === 0, tag + '  nothing on the console' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
}

close();
console.log('');
if (fails.length) { console.log(fails.length + ' LAYOUT FAILURE(S)'); process.exit(1); }
console.log('LAYOUT OK');
