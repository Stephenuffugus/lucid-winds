/* The throw and the fix, driven by real pointers in both orientations.
   ⛔ nothing here calls launch() to prove the slingshot works: the flights that
   matter start from a real drag on the canvas. */
import { serve, open, reporter, waitFrames, sleep, tap, centre, drag, dragEnd } from './harness.mjs';

const s = await serve();
const { fails, say } = reporter();

for (const [W, H, tag] of [[667, 375, 'landscape'], [375, 667, 'portrait']]) {
  const { browser, page, errors } = await open(s.base, { width: W, height: H, deviceScaleFactor: 1 });

  const play = await centre(page, '#btnFly');
  say(!!play && play.h >= 56 && play.onTop, tag + ': the way into the gym is a 56 px target');
  await tap(page, '#btnFly');
  await waitFrames(page, 2);
  say(await page.evaluate(() => AIRWORTHY_TEST.screen()) === 'field', tag + ': and it opens the gym');

  /* ---- a real pull back of 90 px at 20 degrees launches ---- */
  const home = await page.evaluate(() => AIRWORTHY_TEST.home());
  /* pull BACK and DOWN by 90 px at 20 degrees below the horizontal, so the
     plane goes forward and up at 20 */
  const back = { x: Math.round(home.x - 90 * Math.cos(20 * Math.PI / 180)),
    y: Math.round(home.y + 90 * Math.sin(20 * Math.PI / 180)) };
  await drag(page, Math.round(home.x), Math.round(home.y), back.x, back.y, 10);
  await waitFrames(page, 3);
  const shown = await page.evaluate(() => {
    const cv = document.getElementById('stage');
    const c = cv.getContext('2d');
    const d = c.getImageData(0, 0, cv.width, cv.height).data;
    let blue = 0;
    for (let i = 0; i < d.length; i += 4 * 7) {
      if (d[i + 2] > d[i] + 30 && d[i + 2] > 110) blue++;
    }
    return blue;
  });
  say(shown > 20, tag + ': the slingshot is drawn while the finger is down (' + shown + ' blue samples)');
  await dragEnd(page, back.x, back.y);
  await waitFrames(page, 3);
  const flight = await page.evaluate(() => {
    const g = AIRWORTHY_TEST.state();
    return { flying: g.flying, angle: g.lastAngle, power: g.lastPower, throws: g.throws };
  });
  say(flight.flying, tag + ': letting go launches it');
  say(Math.abs(flight.angle - 20) < 3, tag + ': at the angle the drag asked for ('
    + (flight.angle === undefined ? '?' : flight.angle.toFixed(1)) + ' degrees, wanted 20)');
  say(Math.abs(flight.power - 0.64) < 0.12, tag + ': and the power the length asked for ('
    + (flight.power === undefined ? '?' : flight.power.toFixed(2)) + ', wanted about 0.64)');

  /* the plane crosses the screen */
  const x0 = await page.evaluate(() => AIRWORTHY_TEST.state().live.x);
  await page.evaluate(() => AIRWORTHY_TEST.advance(1.2));
  await waitFrames(page, 2);
  const x1 = await page.evaluate(() => AIRWORTHY_TEST.state().live.x);
  say(x1 > x0 + 2, tag + ': and it goes down the gym (' + x0.toFixed(1) + ' to ' + x1.toFixed(1) + ' m)');

  /* ---- the result card ---- */
  await page.evaluate(() => AIRWORTHY_TEST.finish());
  await waitFrames(page, 2);
  const card = await page.evaluate(() => ({
    on: document.getElementById('resultCard').classList.contains('on'),
    name: document.getElementById('resultName').textContent,
    line: document.getElementById('resultLine').textContent
  }));
  say(card.on, tag + ': the card comes up when it lands');
  say(/^The /.test(card.name), tag + ': with the archetype on it ("' + card.name + '")');
  say(/\d+\.\d m in \d+\.\d s/.test(card.line), tag + ': and how far and how long');
  for (const sel of ['#btnTrim', '#btnAgain', '#btnResultDone']) {
    const r = await centre(page, sel);
    say(!!r && r.h >= 48 && r.onTop, tag + ' ' + sel + ' is a 48 px target on top');
  }

  /* ---- the fix. A twenty degree pull is a steep throw and it over excites the
     starting plane into a tumble; the loop the game is built on is a normal
     overarm toss, so the trim test throws one. ---- */
  await page.evaluate(() => { AIRWORTHY_TEST.toField(); AIRWORTHY_TEST.launch(8, 0.5); AIRWORTHY_TEST.finish(); });
  await waitFrames(page, 2);
  const before = await page.evaluate(() => AIRWORTHY_TEST.klass());
  say(before === 'porpoise', tag + ': a normal toss of the starting plane porpoises (' + before + ')');
  await tap(page, '#btnTrim');
  await waitFrames(page, 2);
  const dial = await centre(page, '#dialElev');
  say(!!dial && dial.h >= 48 && dial.onTop, tag + ': the elevator dial is a 48 px target');
  /* a range input is moved by a real drag along it */
  /* ⛔ this bend was minus two until post stall drag went into the model and the
     starting plane's elevator came down from six to four with it. A stalled
     wing now costs the plane speed, the swing runs deeper, and minus two no
     longer settles it: minus four does. The assertion below is the same one it
     always was, that a trimmed porpoise becomes a keeper. Only the bend the
     model needs has moved. */
  await page.evaluate(() => {
    const d = document.getElementById('dialElev');
    d.value = '-4';
    d.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await waitFrames(page, 2);
  const elev = await page.evaluate(() => AIRWORTHY_TEST.spec().elev);
  say(elev === -4, tag + ': the dial bends the elevators (' + elev + ')');
  const t0 = Date.now();
  await tap(page, '#btnTrimDone');
  await waitFrames(page, 3);
  say(await page.evaluate(() => AIRWORTHY_TEST.state().flying), tag + ': and THROW IT relaunches');
  say(Date.now() - t0 < 2000, tag + ': inside two seconds (' + (Date.now() - t0) + ' ms)');
  await page.evaluate(() => AIRWORTHY_TEST.finish());
  await waitFrames(page, 2);
  const after = await page.evaluate(() => AIRWORTHY_TEST.klass());
  if (before === 'porpoise') {
    say(after !== before, tag + ': and a porpoise that was trimmed flies differently ('
      + before + ' to ' + after + ')');
    say(after === 'cruiser', tag + ': it is a keeper now (' + after + ')');
  } else {
    say(false, tag + ': the plane the gym starts you with should be a porpoise, it was ' + before);
  }
  say(await page.evaluate(() => AIRWORTHY_TEST.result().distance) > 0,
    tag + ': and the fixed plane went somewhere');

  say(errors.length === 0, tag + ': nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

s.close();
if (fails.length) { console.log('\n' + fails.length + ' THROW FAILURE(S)'); process.exit(1); }
console.log('\nTHROW OK');
