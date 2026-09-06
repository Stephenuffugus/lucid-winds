/* A real round, played by the thumb: load a level, place its solution, press
   the real GO button, and wait for the bell in WALL TIME.
   ⛔ nothing here calls goRun() or advances the sim by hand. The point of this
   gate is that the loop, the clock and the button all work together. */
import { serve, open, reporter, waitFrames, sleep, tap, centre } from './harness.mjs';

const s = await serve();
const { browser, page, errors } = await open(s.base, { width: 667, height: 375, deviceScaleFactor: 1 });
const { fails, say } = reporter();

/* the title screen leads to the levels */
say(await page.evaluate(() => DOOHICKEY_TEST.screen()) === 'title', 'the game opens on the title');
const play = await centre(page, '#btnPlay');
say(!!play && play.h >= 56 && play.onTop, 'PLAY is a 56 px target on top');
await tap(page, '#btnPlay');
await waitFrames(page, 2);
const cards = await page.evaluate(() => document.querySelectorAll('#levelList .card').length);
say(cards === 6, 'and it opens a list of six levels (' + cards + ')');
const locked = await page.evaluate(() =>
  [...document.querySelectorAll('#levelList .card')].map(c => c.hasAttribute('disabled')));
say(locked[0] === false && locked[5] === true, 'with the later ones locked until the one before is cleared');

await tap(page, '#levelList .card[data-level="0"]');
await waitFrames(page, 2);
say(await page.evaluate(() => DOOHICKEY_TEST.screen()) === 'build', 'tapping the first one opens the board');

/* the machine goes down through the hook, the button is pressed for real */
const n = await page.evaluate(() => DOOHICKEY_TEST.solution());
say(n === 4, 'the level\'s own solution is four parts (' + n + ')');
await tap(page, '#btnGo');
await waitFrames(page, 3);
say(await page.evaluate(() => DOOHICKEY_TEST.state().running), 'GO starts it');

/* wall time, not simulated time */
const t0 = Date.now();
let res = null;
while (Date.now() - t0 < 10000) {
  res = await page.evaluate(() => DOOHICKEY_TEST.result());
  if (res) break;
  await sleep(120);
}
const took = ((Date.now() - t0) / 1000).toFixed(1);
say(!!res, 'and the bell rings inside ten seconds of real time (' + took + 's)');
say(!!res && res.stars === 3, 'with three stars (' + (res ? res.stars : '?') + ')');
say(await page.evaluate(() => document.getElementById('winCard').classList.contains('on')),
  'and the card comes up');
say(await page.evaluate(() => DOOHICKEY_TEST.replaying()), 'and the last three seconds play behind it');
const tape = await page.evaluate(() => DOOHICKEY_TEST.tape());
say(tape > 100, 'from a recording of the run, not a re-simulation (' + tape + ' frames)');
const conf = await page.evaluate(() => DOOHICKEY_TEST.confetti());
say(conf > 20, 'and there is confetti (' + conf + ' pieces)');
for (const sel of ['#btnNext', '#btnShare', '#btnFilm', '#btnWinMenu']) {
  const r = await centre(page, sel);
  say(!!r && r.h >= 48 && r.onTop, 'the ' + sel + ' button is a 48 px target on top');
}
const saved = await page.evaluate(() => DOOHICKEY_TEST.save().stars[0]);
say(saved === 3, 'and the stars are in the save (' + saved + ')');

/* ---- a real STOP mid run leaves the machine alone ---- */
await tap(page, '#btnNext');
await waitFrames(page, 3);
say(await page.evaluate(() => DOOHICKEY_TEST.state().levelId) === 1, 'NEXT opens the next level');
const before = await page.evaluate(() => { DOOHICKEY_TEST.solution(); return JSON.stringify(DOOHICKEY_TEST.parts()); });
await tap(page, '#btnGo');
await sleep(500);
await tap(page, '#btnStop');
await waitFrames(page, 2);
const after = await page.evaluate(() => JSON.stringify(DOOHICKEY_TEST.parts()));
say(after === before, 'a real STOP mid run leaves the machine exactly as it was');
say(!(await page.evaluate(() => DOOHICKEY_TEST.state().running)), 'and the run is over');
say(await page.evaluate(() => !document.getElementById('winCard').classList.contains('on')),
  'and no card is left over it');

/* ---- the sandbox keeps what you put on the table ---- */
await page.evaluate(() => DOOHICKEY_TEST.sandbox(0));
await waitFrames(page, 2);
await page.evaluate(() => DOOHICKEY_TEST.place([{ type: 'domino', x: 360, y: 402 },
  { type: 'domino', x: 384, y: 402 }]));
await waitFrames(page, 2);
const slot = await page.evaluate(() => DOOHICKEY_TEST.slots()[0]);
say(!!slot && slot.length > 2, 'the sandbox writes the table to the save (' + (slot ? slot.length : 0) + ' bytes)');
await page.evaluate(() => { DOOHICKEY_TEST.start(0); DOOHICKEY_TEST.sandbox(0); });
await waitFrames(page, 2);
const back = await page.evaluate(() => DOOHICKEY_TEST.parts().length);
say(back === 2, 'and it is still there when you come back to it (' + back + ' parts)');

say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));

await browser.close(); s.close();
if (fails.length) { console.log('\n' + fails.length + ' RUN FAILURE(S)'); process.exit(1); }
console.log('\nRUN OK');
