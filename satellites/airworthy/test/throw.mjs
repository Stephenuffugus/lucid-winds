/* The throw and the fix, driven by real pointers in both orientations.
   ⛔ nothing here calls launch() to prove the slingshot works: the flights that
   matter start from a real drag on the canvas. */
import { serve, open, reporter, waitFrames, sleep, tap, centre, drag, dragEnd, pinch, ROOT } from './harness.mjs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/* the rules, read out of the page through the same markers sim.js uses, so the
   picker's flight can be checked against an answer the browser did not give */
const HTML = readFileSync(join(ROOT, 'index.html'), 'utf8');
const SIM_A = '// ---- SIM_EXPORT_START ----', SIM_B = '// ---- SIM_EXPORT_END ----';
const SIM = new Function(HTML.slice(HTML.indexOf(SIM_A) + SIM_A.length, HTML.indexOf(SIM_B))
  + '\nreturn { fly: fly, courseAir: courseAir, COURSE_ORDER: COURSE_ORDER };')();

const s = await serve();
const { fails, say } = reporter();

for (const [W, H, tag] of [[667, 375, 'landscape'], [375, 667, 'portrait']]) {
  const { browser, page, errors } = await open(s.base, { width: W, height: H, deviceScaleFactor: 1 });

  const play = await centre(page, '#btnFly');
  say(!!play && play.h >= 56 && play.onTop, tag + ': the way into the gym is a 56 px target');
  await tap(page, '#btnFly');
  await waitFrames(page, 2);
  say(await page.evaluate(() => AIRWORTHY_TEST.screen()) === 'field', tag + ': and it opens the gym');

  /* ---- the first throw is taught AT THE PLANE (Sep 06: "it doesn't give you
     any kind of tutorial or explanation on throwing"; the hud's thirteen pixel
     line at the top of the screen did not count). Blue is counted off the
     canvas in the band behind the plane, at the plane's height. ---- */
  const coachBlue = () => page.evaluate(() => {
    const h = AIRWORTHY_TEST.home(), cv = document.getElementById('stage'), c = cv.getContext('2d');
    const k = cv.width / window.innerWidth;
    /* the band stops thirty pixels short of the plane so the plane's own blue crease is not counted */
    const x0 = 0, x1 = Math.max(1, Math.floor((h.x - 30) * k)), y0 = Math.floor((h.y - 14) * k), y1 = Math.floor((h.y + 14) * k);
    const d = c.getImageData(x0, y0, x1 - x0, y1 - y0).data;
    let blue = 0;
    for (let i = 0; i < d.length; i += 4 * 3) if (d[i + 2] > d[i] + 30 && d[i + 2] > 110) blue++;
    return blue;
  });
  await waitFrames(page, 2);
  const coach0 = await coachBlue();
  say(coach0 > 12, tag + ': before the first flight a coach is drawn behind the plane (' + coach0 + ' blue samples)');

  /* ---- the pull fills the meter INSIDE THE GLASS (Sep 06: "I can't pull it
     all the way back, infuriating"). From the plane itself straight back to
     the left edge, the page's own power function must read full. ---- */
  {
    const h0 = await page.evaluate(() => AIRWORTHY_TEST.home());
    const atEdge = await page.evaluate((hx) => AIRWORTHY_TEST.pullPower(2 - hx, 0), h0.x);
    say(atEdge >= 0.999, tag + ': a pull from the plane to the left edge fills the meter (' + atEdge.toFixed(2) + ', plane at ' + h0.x.toFixed(0) + ' px)');
  }

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
  /* ⛔ this used to want 0.64, which is 90 over the old fixed 140 px full pull: a gate
     built from its constant. The full pull now fits inside the glass on every width, so a
     90 px pull is a moderate throw, not a number. */
  say(flight.power > 0.55 && flight.power < 0.85, tag + ': and a 90 px pull is a moderate throw ('
    + (flight.power === undefined ? '?' : flight.power.toFixed(2)) + ', wanted between 0.55 and 0.85)');

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

  /* ---- THROW AGAIN hands the plane back (Sep 06: "when you click through
     again you should be able to reset the angle and throw"). It used to re
     fire the last throw on its own. ---- */
  await tap(page, '#btnAgain');
  await waitFrames(page, 2);
  const armed = await page.evaluate(() => ({ flying: AIRWORTHY_TEST.state().flying, armed: !!AIRWORTHY_TEST.state().armed,
    card: document.getElementById('resultCard').classList.contains('on') }));
  say(!armed.flying && armed.armed && !armed.card, tag + ': THROW AGAIN puts the plane back in the hand rather than re firing the last throw');
  const coach1 = await coachBlue();
  say(coach1 < 6, tag + ': and the coach is gone once you have flown (' + coach1 + ' blue samples)');
  {
    const h2 = await page.evaluate(() => AIRWORTHY_TEST.home());
    await drag(page, Math.round(h2.x), Math.round(h2.y), Math.round(h2.x - 80), Math.round(h2.y + 30), 8);
    await dragEnd(page, Math.round(h2.x - 80), Math.round(h2.y + 30));
    await waitFrames(page, 2);
    say(await page.evaluate(() => AIRWORTHY_TEST.state().flying), tag + ': and a pull from the hand throws it');
    await page.evaluate(() => AIRWORTHY_TEST.finish());
    await waitFrames(page, 2);
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

  /* ⛔ PINCH PULLS THE ROOM BACK, and it must not launch anything. Two fingers
     on a canvas whose one finger gesture is a slingshot is exactly the shape
     that fires a throw nobody asked for. */
  await page.evaluate(() => { AIRWORTHY_TEST.toField(); });
  await waitFrames(page, 3);
  const z0 = await page.evaluate(() => ({ zoom: AIRWORTHY_TEST.zoom(), ppm: AIRWORTHY_TEST.view().ppm }));
  await pinch(page, W / 2, H / 2, 220, 90);
  await waitFrames(page, 3);
  const zOut = await page.evaluate(() => ({ zoom: AIRWORTHY_TEST.zoom(),
    ppm: AIRWORTHY_TEST.view().ppm, flying: AIRWORTHY_TEST.state().flying }));
  say(zOut.zoom < z0.zoom * 0.75, tag + ': pinching in pulls the room back ('
    + z0.zoom.toFixed(2) + ' to ' + zOut.zoom.toFixed(2) + ')');
  say(zOut.ppm < z0.ppm * 0.8, tag + ': and the scale really moves with it ('
    + z0.ppm.toFixed(1) + ' to ' + zOut.ppm.toFixed(1) + ' pixels a metre)');
  say(!zOut.flying, tag + ': and two fingers do NOT throw the plane');
  await pinch(page, W / 2, H / 2, 90, 260);
  await waitFrames(page, 3);
  const zIn = await page.evaluate(() => AIRWORTHY_TEST.zoom());
  say(zIn > zOut.zoom * 1.4, tag + ': and spreading brings it back in ('
    + zOut.zoom.toFixed(2) + ' to ' + zIn.toFixed(2) + ')');
  await pinch(page, W / 2, H / 2, 300, 20);
  await pinch(page, W / 2, H / 2, 300, 20);
  await waitFrames(page, 3);
  const floor = await page.evaluate(() => AIRWORTHY_TEST.zoom());
  say(floor >= 0.45 - 1e-6, tag + ': and it stops rather than shrinking to nothing (' + floor.toFixed(2) + ')');
  /* one finger still throws it */
  await page.evaluate(() => { AIRWORTHY_TEST.toField(); });
  await waitFrames(page, 3);
  const home2 = await page.evaluate(() => AIRWORTHY_TEST.home());
  await drag(page, home2.x, home2.y, home2.x - 70, home2.y + 40, 8);
  await dragEnd(page, home2.x - 70, home2.y + 40);
  await waitFrames(page, 3);
  say(await page.evaluate(() => AIRWORTHY_TEST.state().flying),
    tag + ': and one finger still throws it after all that');
  await page.evaluate(() => { AIRWORTHY_TEST.finish(); });

  say(errors.length === 0, tag + ': nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();

  /* ---- call 61: THE COURSE PICKER ON TO THE GYM. A free throw was the gym and
     nothing else; the other three courses came only inside a challenge with the
     throw set for you. The pick is a real tap on the title, the throw is a real
     drag, and the flight is checked against the SIM run here in Node for the
     course picked, so a row that only relabels the button is red. ---- */
  {
    const P = await open(s.base, { width: W, height: H, deviceScaleFactor: 1 });
    const pg = P.page;
    const cold = await pg.evaluate(() => ({
      label: document.getElementById('btnFly').textContent,
      pick: window.AIRWORTHY_TEST.pickCourse ? AIRWORTHY_TEST.pickCourse() : null,
      chips: [...document.querySelectorAll('#coursePick [data-course]')].map(b => b.getAttribute('data-course'))
    }));
    say(cold.label === 'TO THE GYM' && cold.pick === 'gym', tag + ': a cold open still goes to the gym ("' + cold.label + '", pick ' + cold.pick + ')');
    say(cold.chips.join(',') === SIM.COURSE_ORDER.join(','), tag + ': the title offers every course, in the course order ('
      + (cold.chips.join(', ') || 'no row') + ')');
    const skyAt = () => pg.evaluate(() => {
      const cv = document.getElementById('stage'), k = cv.width / innerWidth;
      const d = cv.getContext('2d').getImageData(Math.floor(innerWidth / 2 * k), Math.floor(4 * k), 1, 1).data;
      return [d[0], d[1], d[2]];
    });
    /* the gym's sky first, for the differential below */
    if (cold.chips.length) {
      await tap(pg, '#btnFly'); await waitFrames(pg, 3);
    }
    const gymSky = await skyAt();
    if (cold.chips.length) { await tap(pg, '#btnBack'); await waitFrames(pg, 2); }

    const chip = await centre(pg, '#coursePick [data-course="canyon"]');
    say(!!chip && chip.h >= 48 && chip.w >= 48 && chip.onTop, tag + ': THE CANYON is a 48 px target on the title ('
      + (chip ? chip.w.toFixed(0) + 'x' + chip.h.toFixed(0) + (chip.onTop ? '' : ', COVERED') : 'missing') + ')');
    if (chip) { await tap(pg, '#coursePick [data-course="canyon"]'); await waitFrames(pg, 2); }
    const picked = await pg.evaluate(() => ({
      label: document.getElementById('btnFly').textContent,
      pressed: [...document.querySelectorAll('#coursePick [data-course]')].filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.getAttribute('data-course'))
    }));
    say(picked.label === 'TO THE CANYON', tag + ': and the big button says where it goes now ("' + picked.label + '")');
    say(picked.pressed.join(',') === 'canyon', tag + ': with only the canyon pressed (' + (picked.pressed.join(', ') || 'none') + ')');
    await tap(pg, '#btnFly');
    await waitFrames(pg, 3);
    const there = await pg.evaluate(() => ({ screen: AIRWORTHY_TEST.screen(), course: AIRWORTHY_TEST.course(),
      challenge: !!AIRWORTHY_TEST.state().challenge }));
    say(there.screen === 'field' && there.course === 'canyon' && !there.challenge,
      tag + ': and it opens the canyon for a free throw (' + there.screen + ', ' + there.course + (there.challenge ? ', a challenge' : '') + ')');
    const canSky = await skyAt();
    const skyGap = Math.abs(canSky[0] - gymSky[0]) + Math.abs(canSky[1] - gymSky[1]) + Math.abs(canSky[2] - gymSky[2]);
    say(skyGap > 40, tag + ': and the room drawn is not the gym (sky ' + canSky.join(',') + ' against the gym\'s ' + gymSky.join(',') + ')');

    /* a real throw, then the seam: the page's flight is the SIM's flight in the canyon's air */
    const h = await pg.evaluate(() => AIRWORTHY_TEST.home());
    const bx = Math.round(h.x - 90 * Math.cos(20 * Math.PI / 180)), by = Math.round(h.y + 90 * Math.sin(20 * Math.PI / 180));
    await drag(pg, Math.round(h.x), Math.round(h.y), bx, by, 10);
    await dragEnd(pg, bx, by);
    await waitFrames(pg, 2);
    const thrown = await pg.evaluate(() => {
      const g = AIRWORTHY_TEST.state();
      return { flying: g.flying, angle: g.lastAngle, power: g.lastPower, spec: JSON.parse(JSON.stringify(g.spec)) };
    });
    say(thrown.flying, tag + ': a pull in the canyon throws it');
    await pg.evaluate(() => AIRWORTHY_TEST.finish());
    await waitFrames(pg, 2);
    const got = await pg.evaluate(() => AIRWORTHY_TEST.result());
    const flyIn = c => SIM.fly(thrown.spec, { angle: thrown.angle, power: thrown.power, course: c, air: SIM.courseAir(c, null), challenge: null });
    const wantCan = flyIn('canyon'), wantGym = flyIn('gym');
    say(Math.abs(wantCan.airtime - wantGym.airtime) > 0.05 || Math.abs(wantCan.distance - wantGym.distance) > 0.05,
      tag + ': (premise) this throw flies differently in the canyon and the gym ('
      + wantCan.distance.toFixed(2) + ' m ' + wantCan.airtime.toFixed(2) + ' s against ' + wantGym.distance.toFixed(2) + ' m ' + wantGym.airtime.toFixed(2) + ' s)');
    say(!!got && Math.abs(got.distance - wantCan.distance) < 1e-9 && Math.abs(got.airtime - wantCan.airtime) < 1e-9,
      tag + ': and the page flew the canyon\'s air, the SIM\'s answer to the digit ('
      + (got ? got.distance.toFixed(3) + ' m ' + got.airtime.toFixed(3) + ' s' : 'no result') + ' against ' + wantCan.distance.toFixed(3) + ' m ' + wantCan.airtime.toFixed(3) + ' s)');

    /* the pick is kept for the visit, and every free way onto the field honours it */
    await tap(pg, '#btnBack');
    await waitFrames(pg, 2);
    const back = await pg.evaluate(() => ({ screen: AIRWORTHY_TEST.screen(), label: document.getElementById('btnFly').textContent }));
    say(back.screen === 'title' && back.label === 'TO THE CANYON', tag + ': BACK to the title keeps the pick (' + back.screen + ', "' + back.label + '")');
    await tap(pg, '#btnTunnel');
    await waitFrames(pg, 3);
    await tap(pg, '#btnTunFly');
    await waitFrames(pg, 3);
    const tun = await pg.evaluate(() => ({ screen: AIRWORTHY_TEST.screen(), course: AIRWORTHY_TEST.course() }));
    say(tun.screen === 'field' && tun.course === 'canyon', tag + ': and FLY IT from the tunnel goes to the picked course (' + tun.screen + ', ' + tun.course + ')');
    await pg.evaluate(() => AIRWORTHY_TEST.toChallenge('gym-far'));
    await waitFrames(pg, 2);
    say(await pg.evaluate(() => AIRWORTHY_TEST.course()) === 'gym', tag + ': while a challenge still flies its own course');
    say(P.errors.length === 0, tag + ': nothing landed on the console in the picker' + (P.errors.length ? ': ' + P.errors[0] : ''));
    await P.browser.close();
  }
}

s.close();
if (fails.length) { console.log('\n' + fails.length + ' THROW FAILURE(S)'); process.exit(1); }
console.log('\nTHROW OK');
