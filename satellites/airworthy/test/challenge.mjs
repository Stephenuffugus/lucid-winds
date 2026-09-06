/* THE CHALLENGES, THE COURSES AND THE MEDALS, in a browser.
 *
 *   node test/challenge.mjs
 *
 * The sim already proves the thresholds are ordered and that the reference fold
 * takes gold. What only a browser can prove is that the room around them is
 * honest: that the list is reachable by thumb, that picking one puts you on the
 * right course with the right air, that the throw really is the challenge's and
 * not the player's, that a medal is kept and shown, and that the ghost you fly
 * against is your best flight rather than your last.
 */
import { serve, open, reporter, centre, tap, waitFrames } from './harness.mjs';

const site = await serve();
const { browser, page, errors } = await open(site.base, { width: 375, height: 667 });
const { fails, say } = reporter();
const T = (fn, ...a) => page.evaluate(fn, ...a);

try {
  /* ---- the door and the list ---- */
  const door = await centre(page, '#btnChallenges');
  say(!!door && door.onTop && door.h >= 47.5,
    'the title offers the challenges and a thumb lands on it (' + (door ? door.h.toFixed(0) : 0) + ' px)');
  await tap(page, '#btnChallenges');
  await waitFrames(page, 3);
  const cards = await T(() => [...document.querySelectorAll('.ch-card')].map(c => c.getAttribute('data-ch')));
  say(cards.length === 6, 'six of them are listed (' + cards.length + ')');
  for (const id of ['gym-far', 'yard-hang']) {
    const c = await centre(page, '.ch-card[data-ch="' + id + '"]');
    say(!!c && c.onTop && c.h >= 47.5, id + ' is reachable and ' + (c ? c.h.toFixed(0) : 0) + ' px tall');
  }
  const listText = await T(() => document.getElementById('challengeList').textContent);
  say(listText.indexOf('gold') >= 0, 'and the list says what a medal wants before you fly');
  say(!/[-‐-―−]/.test(listText) && listText.indexOf('!') < 0, 'with no dash and no shouting in it');

  /* ---- picking one puts you on its course, in its air ---- */
  await tap(page, '.ch-card[data-ch="yard-hang"]');
  await waitFrames(page, 3);
  const at = await T(() => ({
    screen: window.AIRWORTHY_TEST.screen(),
    course: window.AIRWORTHY_TEST.course(),
    ch: window.AIRWORTHY_TEST.challenge().id,
    fields: window.AIRWORTHY_TEST.courses().yard.fields.length
  }));
  say(at.screen === 'field' && at.course === 'yard' && at.ch === 'yard-hang',
    'picking one takes you to the backyard for it (' + at.screen + ', ' + at.course + ', ' + at.ch + ')');
  say(at.fields === 2, 'and the backyard has its fan and its thermal (' + at.fields + ')');

  /* ---- THE THROW IS THE CHALLENGE'S ---- */
  const sling = await centre(page, '#btnSling');
  say(!!sling && sling.onTop && sling.h >= 47.5,
    'the throw button is there and reachable (' + (sling ? sling.h.toFixed(0) : 0) + ' px)');
  /* a real drag on the canvas, the way free flight is launched */
  const home = await T(() => window.AIRWORTHY_TEST.home());
  await page.mouse.move(home.x, home.y);
  await page.mouse.down();
  for (let i = 1; i <= 6; i++) await page.mouse.move(home.x - i * 9, home.y + i * 5);
  await page.mouse.up();
  await waitFrames(page, 3);
  say(await T(() => !window.AIRWORTHY_TEST.state().flying),
    'and a pull back on the canvas does NOT launch it, because the throw is set');
  await tap(page, '#btnSling');
  await waitFrames(page, 2);
  say(await T(() => window.AIRWORTHY_TEST.state().flying), 'the button does');
  const thrown = await T(() => {
    const r = window.AIRWORTHY_TEST.state().res, ch = window.AIRWORTHY_TEST.challenge();
    return { ev: r.events[0], want: ch.throw };
  });
  say(Math.abs(thrown.ev.x) < 0.01, 'from the mark');

  await T(() => window.AIRWORTHY_TEST.finish());
  await waitFrames(page, 3);
  const res1 = await T(() => ({
    score: window.AIRWORTHY_TEST.score(),
    medals: Object.assign({}, window.AIRWORTHY_TEST.medals()),
    card: document.getElementById('resultCard').classList.contains('on'),
    line: document.getElementById('resultLine').textContent,
    name: document.getElementById('resultName').textContent
  }));
  say(res1.card, 'the result card comes up');
  say(res1.name === 'Ride the grill', 'named for the challenge, not the plane (' + res1.name + ')');
  say(typeof res1.score.score === 'number' && res1.score.score > 0.5,
    'and it is scored in seconds of air (' + res1.score.score.toFixed(2) + ')');
  say(!/[-‐-―−]/.test(res1.line) && res1.line.indexOf('!') < 0, 'the line has no dash in it: "' + res1.line + '"');

  /* ---- the ghost is your BEST, not your last ---- */
  const ghost1 = await T(() => (window.AIRWORTHY_TEST.ghost() || []).length);
  say(ghost1 > 4, 'a first flight leaves a ghost (' + ghost1 + ' points)');
  const before = await T(() => window.AIRWORTHY_TEST.score().score);
  /* a much worse plane on the same challenge */
  await T(() => {
    window.AIRWORTHY_TEST.toChallenge('yard-hang', { nose: 'locked', noseFolds: 3, wing: 0.12, elev: 0 });
  });
  await waitFrames(page, 2);
  await T(() => { window.AIRWORTHY_TEST.launch(); window.AIRWORTHY_TEST.finish(); });
  await waitFrames(page, 3);
  const worse = await T(() => ({ score: window.AIRWORTHY_TEST.score().score, ghost: (window.AIRWORTHY_TEST.ghost() || []).length }));
  say(worse.score < before, 'a worse plane scores worse (' + worse.score.toFixed(2) + ' against ' + before.toFixed(2) + ')');
  say(worse.ghost === ghost1, 'and the ghost is still the better flight (' + worse.ghost + ' points, unchanged)');

  /* ---- a medal is kept, and it shows in the list ---- */
  await T(() => {
    window.AIRWORTHY_TEST.toChallenge('gym-desk',
      { nose: 'blunt', noseFolds: 3, wing: 0.699, fins: 'up', dihedral: 0.815, precision: 1, elev: -4 });
    window.AIRWORTHY_TEST.launch();
    window.AIRWORTHY_TEST.finish();
  });
  await waitFrames(page, 3);
  const desk = await T(() => ({ s: window.AIRWORTHY_TEST.score(), m: Object.assign({}, window.AIRWORTHY_TEST.medals()) }));
  say(desk.s.medal === 'gold',
    'the fold the medal tool named for the desk takes gold on it (' + desk.s.score.toFixed(2)
    + ' m off, medal ' + desk.s.medal + ')');
  say(desk.m['gym-desk'] === 'gold', 'and it is kept');
  await T(() => document.getElementById('btnBack').click());
  await waitFrames(page, 2);
  await tap(page, '#btnChallenges');
  await waitFrames(page, 3);
  const shown = await T(() => document.querySelector('.ch-card[data-ch="gym-desk"]').textContent);
  say(shown.indexOf('Gold') >= 0, 'and the list shows it: "' + shown.replace(/\s+/g, ' ').trim().slice(0, 80) + '"');

  /* ---- a save that survives a reload ---- */
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.AIRWORTHY_TEST && window.AIRWORTHY_TEST.frames() > 2, { timeout: 30000 });
  const kept = await T(() => Object.assign({}, window.AIRWORTHY_TEST.medals()));
  say(kept['gym-desk'] === 'gold', 'and it is still there after a reload (' + JSON.stringify(kept) + ')');

  say(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
} finally {
  await browser.close();
  site.close();
}
console.log('');
if (fails.length) { console.log(fails.length + ' CHALLENGE FAILURE(S)'); process.exit(1); }
console.log('CHALLENGE OK');
