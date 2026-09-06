#!/usr/bin/env node
/* Every button a thumb uses, on every screen, at the three widths.
 *
 *   node test/layout.mjs
 *
 * 48 px RENDERED and reachable: the rectangle AND document.elementFromPoint at
 * its centre landing on it. ⛔ el.click() proves nothing and is not used.
 * It also holds the seat: the bottom left 120 by 120 of the play screen
 * belongs to the fleet's music pill and nothing of Updraft's may be in it.
 * Shape copied from satellites/fathom/test/layout.mjs.
 */
import { serve, open, reporter, tap, centre, waitFrames } from './harness.mjs';

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
  await check('#btnPlay', 'TO THE FIELD', 56);
  await check('#btnHow', 'HOW TO FLY');
  await check('#btnDaily', 'DAILY WIND');
  await check('#btnSound', 'SOUND');
  await check('#btnMotion', 'MOTION');
  await tap(page, '#btnHow');
  await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'how', { timeout: 15000 });
  await check('#btnHowOk', 'GOT IT');
  await tap(page, '#btnHowOk');
  await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'title', { timeout: 15000 });
  await tap(page, '#btnPlay');
  await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'play', { timeout: 15000 });
  await waitFrames(page, 3);
  await check('#btnPause', 'PAUSE');
  await check('#btnMood', 'MOOD CHIP');
  const intruders = await dev(() => {
    const H = window.innerHeight, BOX = { l: 0, t: H - 120, r: 120, b: H };
    const containers = ['app', 'board', 'hud', 'toast', 'testPanel'];
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
    for (let x = 6; x <= 114; x += 18) for (let y = H - 114; y <= H - 6; y += 18) {
      const el = document.elementFromPoint(x, y);
      if (el && el.tagName.toLowerCase() === 'button') bad.push('button ' + (el.id || ''));
    }
    return Array.from(new Set(bad));
  });
  say(intruders.length === 0, tag + '  the bottom left 120 by 120 is free for the music pill' + (intruders.length ? ': ' + intruders.join(', ') : ''));
  const hintBox = await dev(() => { const r = document.getElementById('hint').getBoundingClientRect(); return window.innerHeight - r.bottom; });
  say(hintBox >= 100, tag + '  the hint clears the thumb row by ' + hintBox.toFixed(0) + ' px');
  /* ⛔ AND IT HAS TO BE READABLE WHERE IT SITS. The hint is dark ink and it sits
     ON THE GRASS, and dark ink with a soft cream glow behind it reads on a pale
     sky and turns to mud on dark green: at 412 by 915 the first thing a new
     player is ever told could not be read at all. It stands on paper now, like
     the height and the mood chip, and this asserts the paper is there and is
     opaque enough to be paper. Found by opening p4-high-412 on Sep 07. */
  const hintGround = await dev(() => {
    const cs = getComputedStyle(document.getElementById('hint'));
    const m = cs.backgroundColor.match(/[\d.]+/g) || [];
    return { bg: cs.backgroundColor, alpha: m.length > 3 ? Number(m[3]) : (m.length === 3 ? 1 : 0) };
  });
  say(hintGround.alpha >= 0.7, tag + '  and it stands on its own paper rather than on the grass ('
    + hintGround.bg + ')');
  /* ⛔ AND THE KITE IS STILL A KITE AT SIXTY SEVEN METRES OF LINE. On the thin
     list as "a mark with a stub tail". Counted off the CANVAS, not off the size
     number, because a size can be right while the drawing is a mark. */
  await dev(() => window.UPDRAFT_DEV.place({ L: 67, el: 1.05, az: -0.28, launched: true }));
  await waitFrames(page, 4);
  const ink = await dev(() => window.UPDRAFT_DEV.kiteInk());
  const need = Math.round(size.width * size.width * 0.0016);
  say(!!ink && ink.red + ink.pale >= need,
    tag + '  the kite paints ' + (ink ? (ink.red + ink.pale) : 0) + ' pixels at 67 m of line, wanted '
    + need + ' (size ' + (ink ? ink.size.toFixed(1) : '?') + ')');
  say(!!ink && ink.red >= Math.round(need * 0.25),
    tag + '  and the sail and the ribbon are part of it (' + (ink ? ink.red : 0) + ' red)');
  await tap(page, '#btnPause');
  await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'pause', { timeout: 15000 });
  await check('#btnResume', 'RESUME', 56);
  await check('#btnLand', 'LAND IT');
  await check('#btnMoodPick', 'MOOD');
  /* P2: the mood picker is a screen of three 72 px cards, reached from the pause button and the play chip */
  await tap(page, '#btnMoodPick');
  await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'mood', { timeout: 15000 });
  await check('#moodGentle', 'GENTLE card', 72);
  await check('#moodFresh', 'FRESH card', 72);
  await check('#moodBlustery', 'BLUSTERY card', 72);
  await check('#moodReal', 'REAL WIND card', 72);
  await check('#btnMoodBack', 'BACK from mood');
  await tap(page, '#moodGentle');
  await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'pause', { timeout: 15000 });
  const chip = await dev(() => document.getElementById('btnMood').textContent);
  say(chip === 'GENTLE', tag + '  a card picks the mood and returns to pause (chip reads ' + chip + ')');
  await tap(page, '#btnResume');
  await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'play', { timeout: 15000 });
  await tap(page, '#btnMood');
  await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'mood', { timeout: 15000 });
  await tap(page, '#btnMoodBack');
  await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'play', { timeout: 15000 });
  await tap(page, '#btnPause');
  await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'pause', { timeout: 15000 });
  await check('#btnKites', 'KITES');
  await tap(page, '#btnKites');
  await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'kites', { timeout: 15000 });
  const nCards = await dev(() => document.querySelectorAll('#kiteCards .card').length);
  say(nCards === 5, tag + '  five kite cards exist (' + nCards + ')');
  for (const k of ['Diamond', 'Delta', 'Box', 'Sled', 'Dragon']) await check('#kite' + k, k + ' card', 64);
  const locked = await dev(() => Array.from(document.querySelectorAll('#kiteCards .card.locked')).map(e => e.getAttribute('data-kite')));
  say(locked.length === 4 && locked.indexOf('diamond') < 0, tag + '  a fresh journal has four locked kites and the Diamond open (' + locked.join(', ') + ')');
  await check('#btnKitesBack', 'BACK from kites');
  await tap(page, '#kiteDiamond');
  await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'pause', { timeout: 15000 });
  await check('#btnJournal', 'JOURNAL');
  await tap(page, '#btnJournal');
  await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'journal', { timeout: 15000 });
  const rows = await dev(() => document.querySelectorAll('#scrJournal .jrow').length + document.querySelectorAll('#scrJournal .none').length);
  say(rows >= 5, tag + '  the journal shows its four bests and a stamps row (' + rows + ' rows)');
  await check('#btnJournalBack', 'BACK from the journal');
  await tap(page, '#btnJournalBack');
  await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'pause', { timeout: 15000 });
  await check('#btnSound2', 'SOUND in pause');
  await check('#btnMotion2', 'MOTION in pause');
  await check('#btnHaptics', 'HAPTICS in pause');
  await tap(page, '#btnHaptics');
  const hap = await dev(() => [document.getElementById('btnHaptics').textContent, JSON.parse(localStorage.getItem('lw_updraft_v1')).settings.haptics]);
  say(hap[0] === 'HAPTICS OFF' && hap[1] === 0, tag + '  a tap turns haptics off and the save says so (' + hap.join(', ') + ')');
  await tap(page, '#btnHaptics');
  await check('#btnQuit', 'BACK TO THE TITLE');
  await tap(page, '#btnLand');
  await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'end', { timeout: 20000 });
  await check('#btnAgain', 'FLY AGAIN', 56);
  await check('#btnJournal2', 'JOURNAL from the end');
  await tap(page, '#btnJournal2');
  await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'journal', { timeout: 15000 });
  await tap(page, '#btnJournalBack');
  await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'end', { timeout: 15000 });
  await check('#btnEndTitle', 'BACK TO THE TITLE from the end');
  const wide = await dev(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  say(!wide, tag + '  nothing pushes the page sideways');
  say(errors.length === 0, tag + '  nothing on the console' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
}
close();
console.log('');
if (fails.length) { console.log(fails.length + ' LAYOUT FAILURE(S)'); process.exit(1); }
console.log('LAYOUT OK');
