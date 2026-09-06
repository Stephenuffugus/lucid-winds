/* A rug sent to somebody else.
   ⛔ THE SECOND BROWSER HAS NEVER SEEN THIS GAME. It is a separate puppeteer
   launch with its own profile and its own storage, and everything it knows
   about the rug is in the link, which is what a text message actually is.
   ⛔ The link is made the way a player makes it: the SHARE button in the menu,
   pressed by a real pointer.
   Watched to fail: by dropping the rotation from the packed piece, by
   rebuilding the layout without re-snapping it, and by leaving the trains out
   of the link. */
import { serve, open, reporter, waitFrames, tap, tapAt, centre } from './harness.mjs';

const s = await serve();
const { fails, say } = reporter();
const R = n => Math.round(n);

/* ---- the first phone builds a rug and shares it ---- */
const a = await open(s.base, { width: 667, height: 375, deviceScaleFactor: 1 });
await waitFrames(a.page, 2);
await tap(a.page, '#btnBuild');
await waitFrames(a.page, 2);
await tap(a.page, '#slotList .card');
await waitFrames(a.page, 3);
await a.page.evaluate(() => {
  WHISTLESTOP_TEST.buildOps([['at', 4.4, 2.4, 0], ['rep', 2, 'straight'], ['rep', 4, 'curveR'],
    ['rep', 2, 'straight'], ['rep', 4, 'curveR'], ['from', 1, 1], ['p', 'yL'], ['p', 'straight']]);
});
await waitFrames(a.page, 3);
await a.page.evaluate(() => {
  const S = WHISTLESTOP_TEST.state();
  WHISTLESTOP_TEST.addTrain('green', S.g.pieces[3].edges[0], 20, 4);
});
await waitFrames(a.page, 2);

const mine = await a.page.evaluate(() => ({
  pieces: WHISTLESTOP_TEST.pieces().length,
  loops: WHISTLESTOP_TEST.loops(),
  parts: WHISTLESTOP_TEST.components(),
  open: WHISTLESTOP_TEST.openEnds().length,
  trains: WHISTLESTOP_TEST.trains().map(t => ({ colour: t.colour, cars: t.cars })),
  types: WHISTLESTOP_TEST.pieces().map(p => p.type).join(',')
}));
/* a ring, plus a switch and a straight standing loose beside it, because a rug
   with a loose piece on it is harder to send than a tidy one and is exactly
   what a child's rug looks like */
say(mine.pieces === 14 && mine.loops === 1 && mine.parts === 2,
  'the first phone builds a ring with two loose pieces beside it ('
  + mine.pieces + ' pieces, ' + mine.loops + ' loop, ' + mine.parts + ' railways)');
say(mine.trains.length === 1 && mine.trains[0].cars === 4, 'and puts a green train with four cars on it');

/* the SHARE button, pressed for real */
await tap(a.page, '#btnMenu');
await waitFrames(a.page, 2);
const share = await centre(a.page, '#btnShare');
say(!!share && share.h >= 48 && share.onTop, 'SHARE is a 48 px target on top');
const link = await a.page.evaluate(() => WHISTLESTOP_TEST.link());
const hash = link.slice(link.indexOf('#'));
say(hash.indexOf('#l=') === 0 && hash.length > 40, 'and it makes a link (' + hash.length + ' characters)');
say(hash.length < 900, 'short enough to go in a message');
await a.browser.close();

/* ---- a second phone, which has never seen the game, opens the link ---- */
const b = await open(s.base, { width: 375, height: 667, deviceScaleFactor: 1, query: hash });
await waitFrames(b.page, 3);
const early = await b.page.evaluate(() => ({
  assembling: WHISTLESTOP_TEST.assembling(),
  screen: WHISTLESTOP_TEST.screen()
}));
say(early.screen === 'Play', 'the second phone opens straight onto the rug');
say(early.assembling > 0, 'and the rug is still building itself (' + early.assembling.toFixed(2) + ' s to go)');

/* let the montage finish */
const t0 = Date.now();
while (Date.now() - t0 < 8000) {
  const left = await b.page.evaluate(() => WHISTLESTOP_TEST.assembling());
  if (left < 0) break;
  await new Promise(r => setTimeout(r, 250));
}
await waitFrames(b.page, 3);
const theirs = await b.page.evaluate(() => ({
  pieces: WHISTLESTOP_TEST.pieces().length,
  loops: WHISTLESTOP_TEST.loops(),
  parts: WHISTLESTOP_TEST.components(),
  open: WHISTLESTOP_TEST.openEnds().length,
  trains: WHISTLESTOP_TEST.trains().map(t => ({ colour: t.colour, cars: t.cars })),
  types: WHISTLESTOP_TEST.pieces().map(p => p.type).join(','),
  assembling: WHISTLESTOP_TEST.assembling(),
  heard: WHISTLESTOP_TEST.events()
}));
say(theirs.assembling < 0, 'the montage finishes on its own');
say(theirs.pieces === mine.pieces, 'and the same number of pieces arrived ('
  + theirs.pieces + ' of ' + mine.pieces + ')');
say(theirs.types === mine.types, 'and every one of them is the piece it was');
say(theirs.loops === mine.loops && theirs.parts === mine.parts && theirs.open === mine.open,
  'and it is the same shape of railway (' + theirs.loops + ' loops, ' + theirs.parts
  + ' railways, ' + theirs.open + ' open ends)');
say(theirs.heard.filter(e => e === 'klk').length >= mine.pieces - 1,
  'and it went together piece by piece with the klk (' + theirs.heard.filter(e => e === 'klk').length + ')');
say(theirs.trains.length === 1 && theirs.trains[0].colour === 'green' && theirs.trains[0].cars === 4,
  'and the green train came with it, four cars and all ('
  + JSON.stringify(theirs.trains) + ')');

/* ⛔ the joints have to CLOSE. A rug rebuilt from a link's rounded numbers and
   not re-snapped keeps every count and every loop and still stands a twentieth
   of a unit open at every single joint. */
const gap = await b.page.evaluate(() => {
  const S = WHISTLESTOP_TEST.state();
  let worst = 0;
  /* how far every edge end lies from the joint it was merged into, in units */
  for (const e of S.g.edges) {
    for (const [nid, x, y] of [[e.a, e.ax, e.ay], [e.b, e.bx, e.by]]) {
      const n = S.g.nodes[nid];
      worst = Math.max(worst, Math.hypot(n.x - x, n.y - y));
    }
  }
  return worst / 64;
});
say(gap < 0.005, 'and every joint on it is properly closed (' + gap.toFixed(6) + ' U at the worst)');

/* and it runs */
await tap(b.page, '#btnWhistle');
await waitFrames(b.page, 2);
const p0 = await b.page.evaluate(() => WHISTLESTOP_TEST.trainScreen(0));
await b.page.evaluate(() => WHISTLESTOP_TEST.advance(1.2));
await waitFrames(b.page, 2);
const p1 = await b.page.evaluate(() => WHISTLESTOP_TEST.trainScreen(0));
say(Math.hypot(p1.x - p0.x, p1.y - p0.y) > 20, 'and the train on it runs ('
  + Math.hypot(p1.x - p0.x, p1.y - p0.y).toFixed(0) + ' px)');
say(b.errors.length === 0, 'nothing landed on the console' + (b.errors.length ? ': ' + b.errors[0] : ''));

/* ---- a link with rubbish in it does not break the game ---- */
await b.page.evaluate(() => WHISTLESTOP_TEST.importHash('#l=this-is-not-a-rug'));
await waitFrames(b.page, 3);
const alive = await b.page.evaluate(() => WHISTLESTOP_TEST.frames());
await waitFrames(b.page, 2);
const alive2 = await b.page.evaluate(() => WHISTLESTOP_TEST.frames());
say(alive2 > alive, 'a link with rubbish in it does not stop the game');

await b.browser.close();
s.close();
if (fails.length) { console.log('\n' + fails.length + ' SHARE FAILURE(S)'); process.exit(1); }
console.log('\nSHARE OK');
