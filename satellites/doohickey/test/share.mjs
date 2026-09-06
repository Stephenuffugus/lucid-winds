/* A link somebody sent you. It has to open the same level with the same machine
   on the board, and its RUN has to ring the same bell.
   ⛔ the link is opened in a FRESH context, not by calling importFromHash in
   the tab that made it: a machine that only survives inside the tab that built
   it is not a shared machine. */
import { serve, open, reporter, waitFrames, sleep, tap, centre } from './harness.mjs';

const s = await serve();
const { fails, say } = reporter();

/* ---- make the link ---- */
const a = await open(s.base, { width: 667, height: 375, deviceScaleFactor: 1 });
await a.page.evaluate(() => { DOOHICKEY_TEST.start(1); DOOHICKEY_TEST.solution(); });
await waitFrames(a.page, 2);
const made = await a.page.evaluate(() => ({
  link: DOOHICKEY_TEST.link(),
  parts: JSON.stringify(DOOHICKEY_TEST.parts()),
  n: DOOHICKEY_TEST.parts().length
}));
say(made.link.indexOf('#m=') > 0, 'a machine becomes a link (' + made.link.length + ' characters)');
say(made.link.length < 400, 'and the link is short enough to send (' + made.link.length + ')');
const share = await centre(a.page, '#btnShare');
await a.browser.close();

/* ---- open it COLD, the way a stranger does ----
   ⛔ this used to open a fresh browser and then CALL importHash on the already loaded
   page, which is not what a link does: a stranger pastes an address and the page boots
   with the hash already on it. The two are different code paths, and only the second one
   is the feature. The cold boot goes first now, and the in page call stays after it as
   the hashchange case (a second link opened in a tab that is already playing). */
const hash = made.link.slice(made.link.indexOf('#'));
const cold = await open(s.base, { width: 667, height: 375, deviceScaleFactor: 1, query: hash });
await waitFrames(cold.page, 3);
const coldGot = await cold.page.evaluate(() => ({
  level: DOOHICKEY_TEST.state().levelId,
  n: DOOHICKEY_TEST.parts().length,
  screen: DOOHICKEY_TEST.screen(),
  hash: location.hash
}));
say(coldGot.n === made.n && coldGot.level === 1,
  'a link pasted into a cold browser boots straight onto its machine (' + coldGot.n + ' parts on level ' + coldGot.level + ')');
say(coldGot.screen === 'build', 'and lands on the board rather than the title (' + coldGot.screen + ')');
say(coldGot.hash === '', 'and the address is cleaned, so a reload is not the same link again');
say(cold.errors.length === 0, 'with nothing on the console' + (cold.errors.length ? ': ' + cold.errors[0] : ''));
await cold.browser.close();

/* ---- and the same link handed to a page that is already open ---- */
const b = await open(s.base, { width: 667, height: 375, deviceScaleFactor: 1, query: '' });
const opened = await b.page.evaluate((h) => DOOHICKEY_TEST.importHash(h), hash);
await waitFrames(b.page, 3);
say(opened, 'and a fresh context opens it');
const got = await b.page.evaluate(() => ({
  level: DOOHICKEY_TEST.state().levelId,
  parts: JSON.stringify(DOOHICKEY_TEST.parts()),
  n: DOOHICKEY_TEST.parts().length,
  screen: DOOHICKEY_TEST.screen()
}));
say(got.level === 1, 'on the level the link names (' + got.level + ')');
say(got.n === made.n, 'with the same number of parts (' + got.n + ' of ' + made.n + ')');
say(got.screen === 'build', 'and it lands on the board, ready to run');

/* the parts are the same to the unit and the detent */
const same = await b.page.evaluate((mineJson) => {
  const mine = JSON.parse(mineJson), theirs = DOOHICKEY_TEST.parts();
  if (mine.length !== theirs.length) return 'lengths ' + mine.length + ' and ' + theirs.length;
  for (let i = 0; i < mine.length; i++) {
    const p = mine[i], q = theirs[i];
    if (p.type !== q.type) return 'part ' + i + ' type ' + p.type + ' became ' + q.type;
    if (Math.abs(p.x - q.x) > 0.5 || Math.abs(p.y - q.y) > 0.5) return 'part ' + i + ' moved';
    if (Math.abs(p.rot - q.rot) > 1e-6) return 'part ' + i + ' turned';
  }
  return '';
}, made.parts);
say(same === '', 'and every part is where it was' + (same ? ': ' + same : ''));

/* ---- and it still wins ---- */
await tap(b.page, '#btnGo');
const t0 = Date.now();
let res = null;
while (Date.now() - t0 < 12000) {
  res = await b.page.evaluate(() => DOOHICKEY_TEST.result());
  if (res) break;
  await sleep(120);
}
say(!!res, 'and the machine somebody sent still rings the bell ('
  + ((Date.now() - t0) / 1000).toFixed(1) + 's)');
say(!!res && res.stars === 3, 'with the same three stars');

/* rubbish in the fragment is refused rather than crashing */
const junk = await b.page.evaluate(() => DOOHICKEY_TEST.importHash('#m=not-a-machine'));
say(junk === false, 'and a link that is not a machine is refused');
say(b.errors.length === 0, 'nothing landed on the console' + (b.errors.length ? ': ' + b.errors[0] : ''));

await b.browser.close(); s.close();
if (fails.length) { console.log('\n' + fails.length + ' SHARE FAILURE(S)'); process.exit(1); }
console.log('\nSHARE OK');
