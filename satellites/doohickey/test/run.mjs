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
/* ⛔ this used to read `cards === 10`. That is a literal, and it went red the
   day a level was added, which is a gate pinning the game rather than guarding
   it. The law is that the list shows EVERY level the game has. */
const cards = await page.evaluate(() => document.querySelectorAll('#levelList .card').length);
const want = await page.evaluate(() => DOOHICKEY_TEST.levelCount());
say(cards === want && want >= 10, 'and it opens a card for every level (' + cards + ' of ' + want + ')');
const locked = await page.evaluate(() =>
  [...document.querySelectorAll('#levelList .card')].map(c => c.hasAttribute('disabled')));
say(locked[0] === false && locked[locked.length - 1] === true, 'with the later ones locked until the one before is cleared');

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

/* ⛔ THE CAT HAS TO LOOK ASLEEP, and that is not a matter of taste: the level is
   called The Cat on the Shelf and its one idea is that she is a thing you must
   not wake. Until 2026-09-07 she was a purple box with two flat eye lines, and
   at the size a phone draws her those lines read as a MOUTH, so a still frame of
   the level said nothing about sleep at all. The thin list had said so since
   Sep 06 and no gate could see it.
   Measured as a DIFFERENTIAL over her own patch of the board: asleep against
   awake. Two states drawn the same way make one number, and this is that number.
   ⛔ It is NOT a check that the drawing contains a curl or a z. A gate that
   names the shapes freezes the drawing; a gate that asks whether the two states
   LOOK different lets anybody redraw her any way they like, so long as sleep
   still reads. */
/* ⛔ the cat is a PART, not scenery: she is in the tray and the player puts her
   on the shelf, so a gate that only starts the level finds no cat at all. */
await page.evaluate(() => { DOOHICKEY_TEST.start(12); DOOHICKEY_TEST.solution(); });
await waitFrames(page, 5);
const catPatch = () => page.evaluate(() => {
  const G = DOOHICKEY_TEST.state();
  const b = G.world.bodies.filter(x => x.kind === 'cat')[0];
  if (!b) return null;
  const V = DOOHICKEY_TEST.view();
  const cv = document.querySelector('canvas');
  const c = cv.getContext('2d');
  /* ⛔ HER RECTANGLE IN DEVICE PIXELS, THROUGH THE PAGE'S OWN MAPPING. The first
     version invented a transform out of two fields of the view object that do
     not mean what it assumed (`V.s` does not exist), read nothing, and reported
     that the cat could not be found. The page has sx and sy; a gate that builds
     its own copy of them is testing its own arithmetic. */
  const px = (x) => (V.ox + (x - V.camX) * V.k * V.zoom + V.W / 2) * V.dpr;
  const py = (y) => (V.oy + (y - V.camY) * V.k * V.zoom + V.H / 2) * V.dpr;
  const w = 120, h = 110;
  const x0 = Math.max(0, Math.round(px(b.pos.x) - w / 2));
  const y0 = Math.max(0, Math.round(py(b.pos.y) - h / 2));
  if (x0 + w > cv.width || y0 + h > cv.height) return null;
  const d = c.getImageData(x0, y0, w, h).data;
  const out = [];
  for (let i = 0; i < d.length; i += 4) out.push(d[i], d[i + 1], d[i + 2]);
  return out;
});
const asleepPx = await catPatch();
say(!!asleepPx, 'the cat is on the board and her patch can be read');
if (asleepPx) {
  await page.evaluate(() => {
    const G = DOOHICKEY_TEST.state();
    G.world.bodies.filter(x => x.kind === 'cat').forEach(b => { b.asleep = 0; });
  });
  await waitFrames(page, 3);
  const awakePx = await catPatch();
  let diff = 0;
  for (let i = 0; i < asleepPx.length; i += 3) {
    if (Math.abs(asleepPx[i] - awakePx[i]) + Math.abs(asleepPx[i + 1] - awakePx[i + 1])
      + Math.abs(asleepPx[i + 2] - awakePx[i + 2]) > 24) diff++;
  }
  const pct = diff / (asleepPx.length / 3) * 100;
  /* the floor is 2.5 and it is MEASURED, not picked: the two silhouettes differ
     over 4.6 percent of her patch, and two states drawn identically differ over
     0. A floor of 6 was tried first and was above the real number, which is a
     gate that goes red on working code. */
  say(pct > 2.5, 'and asleep she is drawn as a different animal from awake ('
    + pct.toFixed(1) + ' percent of her own patch differs, over 2.5)');
}

say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));

await browser.close(); s.close();
if (fails.length) { console.log('\n' + fails.length + ' RUN FAILURE(S)'); process.exit(1); }
console.log('\nRUN OK');
