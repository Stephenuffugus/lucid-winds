/* THE ONE BUTTON THAT CAN LOSE A SONG.
 *
 *   node test/clear.mjs
 *
 * ⛔ CLEAR is the only control in Windup that destroys work. It sits third in a
 * row of four cream buttons that look alike, and before 2026-09-07 the whole of
 * its warning was that the word changed from CLEAR to SURE. Nothing on the bar
 * said which one was dangerous and nothing gave the notes back.
 * ⛔ The gate that was missing is this one, and none of the six that existed
 * could have caught it: layout measures sizes, crank measures the strip, tine
 * and audio listen, pdf and gift export. Not one of them asks whether a
 * destructive control looks destructive or whether the destruction is undoable.
 * Every assertion below was watched to go red under a real mutation.
 */
import { serve, open, reporter, waitFrames, tap, tapAt, centre } from './harness.mjs';

const site = await serve();
const { browser, page, errors } = await open(site.base, { width: 375, height: 667 });
const { fails, say } = reporter();
const T = (fn, ...a) => page.evaluate(fn, ...a);

const look = (sel) => T((sel) => {
  const b = document.querySelector(sel);
  const s = getComputedStyle(b);
  const rgb = s.backgroundColor.match(/\d+/g).map(Number);
  return { text: b.textContent.trim(), bg: rgb.slice(0, 3), cls: b.className };
}, sel);

/* get onto the punch screen with notes on the strip, the way a player does:
   an empty strip, the PUNCH button, then six real taps on the sheet */
await T(() => window.WINDUP_TEST.setStrip([], 'Empty'));
await page.evaluate(() => document.getElementById('btnPunch').click());
await waitFrames(page, 3);
say(await T(() => window.WINDUP_TEST.screen()) === 'punch', 'PUNCH opens the sheet');
for (let i = 0; i < 6; i++) {
  const c = await T((s, r) => window.WINDUP_TEST.punchXY(s, r), 2 + i, 4 + (i % 3));
  await tapAt(page, Math.round(c.x), Math.round(c.y));
  await waitFrames(page, 2);
}
const before = await T(() => window.WINDUP_TEST.strip().holes.length);
say(before >= 4, 'six real taps put ' + before + ' notes on the strip to lose');

/* 1. the resting button is one of the crowd */
const rest = await look('#btnClear');
const play = await look('#btnPlay');
const same = rest.bg.join() === play.bg.join();
say(same && rest.text === 'CLEAR', 'at rest CLEAR wears the same cream as PLAY, so nothing shouts before it has to');

/* 2. ARMED IT MUST NOT LOOK LIKE ITS NEIGHBOURS. A word is not a warning. */
await tap(page, '#btnClear');
await waitFrames(page, 2);
const armed = await look('#btnClear');
const dist = Math.abs(armed.bg[0] - play.bg[0]) + Math.abs(armed.bg[1] - play.bg[1]) + Math.abs(armed.bg[2] - play.bg[2]);
say(armed.text !== rest.text, 'armed, the word changes (' + rest.text + ' to ' + armed.text + ')');
say(dist > 120, 'AND the colour changes with it, ' + dist + ' apart from PLAY in rgb (over 120), because a row of four identical slabs hides which one is loaded');
say(armed.bg[0] > armed.bg[1] + 40 && armed.bg[0] > armed.bg[2] + 40, 'and the colour it changes to is a warm red, not another cream (rgb ' + armed.bg.join(',') + ')');

/* 3. THE ERASE IS RECOVERABLE. */
await tap(page, '#btnClear');
await waitFrames(page, 2);
const gone = await T(() => window.WINDUP_TEST.strip().holes.length);
const undo = await look('#btnClear');
say(gone === 0, 'the second tap really does clear the strip, ' + before + ' notes to ' + gone);
say(/UNDO/i.test(undo.text), 'and the same button now offers UNDO rather than sitting back down as if nothing happened');
await tap(page, '#btnClear');
await waitFrames(page, 2);
const back = await T(() => window.WINDUP_TEST.strip().holes.length);
say(back === before, 'and UNDO gives every note back, ' + gone + ' to ' + back + ' (was ' + before + ')');
const settled = await look('#btnClear');
say(settled.text === 'CLEAR' && settled.bg.join() === play.bg.join(), 'and the button then sits back down cream and says CLEAR again');

/* 4. A PUNCH INSIDE THE UNDO WINDOW STANDS THE BUTTON DOWN, because restoring
   the old set on top of a new note would throw the new note away. */
await tap(page, '#btnClear');
await tap(page, '#btnClear');
await waitFrames(page, 2);
const armedAgain = await look('#btnClear');
say(/UNDO/i.test(armedAgain.text), 'cleared a second time, UNDO is offered again');
const fresh = await T(() => window.WINDUP_TEST.punchXY(9, 6));
await tapAt(page, Math.round(fresh.x), Math.round(fresh.y));
await waitFrames(page, 3);
const afterPunch = await look('#btnClear');
const n = await T(() => window.WINDUP_TEST.strip().holes.length);
say(afterPunch.text === 'CLEAR', 'one new note stands UNDO down (' + afterPunch.text + '), so it cannot swap a fresh note for a stale set');
say(n === 1, 'and the new note is the only thing on the strip, ' + n);

say(errors.length === 0, 'and nothing threw: ' + (errors[0] || 'clean'));

await browser.close();
site.close();
console.log('');
if (fails.length) { console.log(fails.length + ' CLEAR FAILURE(S)'); process.exit(1); }
console.log('CLEAR OK');
