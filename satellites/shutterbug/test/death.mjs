/* Browser gate `death` (BUILD-PLAN.md T0.16): the sample room's moths take a heart, the hero blinks through the i
 * frames, the strip shows the heart gone and the hit is heard; standing still, the last heart ends the room in the
 * death card (`The bug fell out of the picture`, `Again`, `Title`); a REAL touch on Again restarts the same room (the
 * same level hash, the same record and seed) at full hearts with the reveal skipped, the moths home again. The hints:
 * the rocker and A pulse at the first standing moment, once. The clear card offers `Shoot the next room` and `Play it
 * again`, each 48 px or more. The loop is held and stepped with SB_DEV.step(n) (each step samples the real input).
 *
 * Watched red by RESTART_REVEALS (Again replays the reveal), DEATH_NO_CARD (the last heart shows no card), BLINK_NONE
 * (the hero drawn through the i frames) and HEARTS_STALE (the strip keeps the old count). */
import { serve, launch, newPage, gotoGame, ready, reporter, tap } from './harness.mjs';

const R = reporter('DEATH');
const srv = await serve();
const browser = await launch();

try {
  const { page, errors } = await newPage(browser, { width: 412, height: 915 });
  await gotoGame(page, srv.base);
  await ready(page);
  await page.evaluate(() => window.SB_DEV.hold(true));
  await tap(page, '#sample');
  const s0 = await page.evaluate(() => ({ screen: window.SB_DEV.screen(), st: window.SB_DEV.state(), hash: window.SB_DEV.level().hash }));
  const full = s0.st.hero.hearts, moths0 = s0.st.enemies.map(e => [e.x, e.y]);
  R.say(s0.screen === 'play' && moths0.length >= 1 && moths0.length <= 2, 'the sample room, the first room: ' + moths0.length + ' moths (at most 2), ' + full + ' hearts');

  /* the first standing moment pulses the rocker and A, once */
  const hint = await page.evaluate(() => {
    for (let k = 0; k < 120 && !window.SB_DEV.state().hero.ground; k++) window.SB_DEV.step(1);
    window.SB_DEV.step(1);
    const q = s => document.querySelector(s).classList.contains('hint');
    return { hinted: window.SB_DEV.hinted(), rocker: q('#rocker'), A: q('#btnA'), B: q('#btnB') };
  });
  R.say(hint.hinted.rocker && hint.hinted.A && hint.rocker && hint.A && !hint.B, 'standing first, the rocker and A pulse (B waits for a dive target)');

  /* stand still until the first hit */
  const hit = await page.evaluate(full => {
    let k = 0;
    for (; k < 6000 && window.SB_DEV.state().hero.hearts === full; k += 30) window.SB_DEV.step(30);
    const st = window.SB_DEV.state();
    return { k, hearts: st.hero.hearts, iframes: st.hero.iframes, strip: document.querySelectorAll('#hearts i:not(.lost)').length, lost: document.querySelectorAll('#hearts i.lost').length, played: window.SB_DEV.audioPlayed() };
  }, full);
  R.say(hit.hearts === full - 1 && hit.iframes > 0, 'standing still, a moth takes one heart within ' + hit.k + ' steps (' + hit.hearts + ' left, ' + hit.iframes + ' i frames)');
  R.say(hit.strip === hit.hearts && hit.lost === full - hit.hearts, 'the top strip shows ' + hit.strip + ' hearts and ' + hit.lost + ' emptied (the state has ' + hit.hearts + ')');
  R.say((hit.played.hit || 0) >= 1, 'the hit is heard (the hit sound played ' + (hit.played.hit || 0) + ' times)');

  /* the blink: through the i frames the hero is drawn on some steps and not on others; after them, always */
  const blink = await page.evaluate(() => {
    const seen = [];
    while (window.SB_DEV.state().hero.iframes > 0) { window.SB_DEV.step(1); seen.push(window.SB_DEV.heroShown() ? 1 : 0); }
    const after = [];
    for (let k = 0; k < 10; k++) { window.SB_DEV.step(1); if (window.SB_DEV.state().hero.iframes === 0) after.push(window.SB_DEV.heroShown() ? 1 : 0); }
    return { shown: seen.filter(Boolean).length, hidden: seen.filter(v => !v).length, after };
  });
  R.say(blink.shown > 0 && blink.hidden > 0, 'the hero blinks through the i frames (drawn on ' + blink.shown + ' steps, hidden on ' + blink.hidden + ')');
  R.say(blink.after.length > 0 && blink.after.every(Boolean), 'past the i frames it is drawn on every step');

  /* stand still to the end: the death card */
  const dead = await page.evaluate(() => {
    let k = 0;
    for (; k < 20000 && window.SB_DEV.screen() === 'play'; k += 30) window.SB_DEV.step(30);
    const card = document.getElementById('death'), h2 = card.querySelector('h2'), btns = [...card.querySelectorAll('button')];
    const r = el => el.getBoundingClientRect();
    return { k, screen: window.SB_DEV.screen(), on: card.classList.contains('on'), text: h2.textContent, buttons: btns.map(b => [b.id, b.textContent, r(b).width, r(b).height]),
      playing: document.body.classList.contains('playing'), hearts: window.SB_DEV.state().hero.hearts, dead: window.SB_DEV.state().room.dead,
      shown: window.SB_DEV.heroShown(), lost: document.querySelectorAll('#hearts i.lost').length };
  });
  R.say(dead.screen === 'dead' && dead.on && dead.dead === 1 && dead.hearts === 0, 'the last heart ends the room in ' + dead.k + ' more steps: the death card is up');
  R.say(dead.shown && dead.lost === full, 'the fallen hero is drawn (no blink under the card) and the strip shows ' + dead.lost + ' empty hearts');
  const seen = await page.evaluate(() => {
    const cv = document.getElementById('view'), r = cv.getBoundingClientRect(), hr = window.SB_DEV.spriteRects().hero, k = r.width / cv.width;
    const x = r.left + (hr.x + hr.w / 2) * k, y = r.top + (hr.y + hr.h / 2) * k, t = document.elementFromPoint(x, y);
    const card = document.getElementById('death');
    return { onCanvas: !!t && t !== card && !card.contains(t), low: card.classList.contains('low'), y: Math.round(y) };
  });
  R.say(seen.onCanvas && !seen.low, 'the card docks at the top and the fallen hero stays in view (the point at its middle, ' + seen.y + ' px, is not under the card)');
  R.say(dead.text === 'The bug fell out of the picture', 'the card says "' + dead.text + '"');
  R.say(dead.buttons.length === 2 && dead.buttons[0][1] === 'Again' && dead.buttons.every(b => b[2] >= 48 && b[3] >= 48), 'its buttons: ' + dead.buttons.map(b => b[1] + ' ' + b[2].toFixed(0) + 'x' + b[3].toFixed(0)).join(', '));

  /* a real touch on Again: the same room, full hearts, the reveal skipped (the dev skip off, so a reveal would show) */
  await page.evaluate(() => window.SB_DEV.revealSkip(false));
  await tap(page, '#deathagain');
  const again = await page.evaluate(() => ({ screen: window.SB_DEV.screen(), st: window.SB_DEV.state(), hash: window.SB_DEV.level().hash,
    card: document.getElementById('death').classList.contains('on'), strip: document.querySelectorAll('#hearts i:not(.lost)').length }));
  R.say(again.screen === 'play' && !again.card, 'Again restarts straight into play (screen ' + again.screen + ', the reveal skipped)');
  R.say(again.hash === s0.hash, 'the same room: the level hash ' + again.hash + ' equals the first');
  R.say(again.st.hero.hearts === full && again.strip === full && again.st.room.dead === 0, 'full hearts again (' + again.st.hero.hearts + ', the strip ' + again.strip + ')');
  R.say(JSON.stringify(again.st.enemies.map(e => [e.x, e.y])) === JSON.stringify(moths0), 'the moths are home');

  /* the clear card's offers */
  const clear = await page.evaluate(() => {
    const card = document.getElementById('clear'), r = el => el.getBoundingClientRect();
    card.classList.add('on');
    const out = [...card.querySelectorAll('button')].map(b => [b.id, b.textContent, r(b).width, r(b).height]);
    card.classList.remove('on');
    return out;
  });
  const names = clear.map(b => b[1]);
  R.say(names[0] === 'Shoot the next room' && names[1] === 'Share this room' && names[2] === 'Play it again' && clear.every(b => b[2] >= 48 && b[3] >= 48), 'the clear card offers ' + names.join(', ') + ', each 48 px or more');
  R.say(errors.length === 0, 'zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
  await page.close();

  /* a death high in the room: the play gate's climb, stopped 30 steps short of the lamp, then standing still until
     the moths end it; the camera is clamped at the room's top, the hero in the stage's upper half, so the card docks
     at the bottom and the fallen hero stays in view */
  {
    const { readFileSync } = await import('node:fs');
    const climb = JSON.parse(readFileSync(new URL('./climb-sample-room.json', import.meta.url), 'utf8'));
    const KEYS = { 1: 'ArrowLeft', 2: 'ArrowRight', 4: 'KeyZ' };
    const hp = await newPage(browser, { width: 412, height: 915 });
    await gotoGame(hp.page, srv.base); await ready(hp.page);
    await hp.page.evaluate(() => window.SB_DEV.hold(true));
    await tap(hp.page, '#sample');
    const total = climb.runs.reduce((a, r) => a + r[0], 0);
    let down = 0, done = 0;
    for (const [n, mask] of climb.runs) {
      if (done >= total - 30) break;
      for (const bit of [1, 2, 4]) if ((down & bit) && !(mask & bit)) await hp.page.keyboard.up(KEYS[bit]);
      for (const bit of [1, 2, 4]) if (!(down & bit) && (mask & bit)) await hp.page.keyboard.down(KEYS[bit]);
      down = mask; const k = Math.min(n, total - 30 - done);
      await hp.page.evaluate(k => window.SB_DEV.step(k), k); done += k;
    }
    for (const bit of [1, 2, 4]) if (down & bit) await hp.page.keyboard.up(KEYS[bit]);
    const high = await hp.page.evaluate(() => {
      for (let k = 0; k < 30000 && window.SB_DEV.screen() === 'play'; k += 30) window.SB_DEV.step(30);
      const cv = document.getElementById('view'), r = cv.getBoundingClientRect(), hr = window.SB_DEV.spriteRects().hero, kk = r.width / cv.width;
      const x = r.left + (hr.x + hr.w / 2) * kk, y = r.top + (hr.y + hr.h / 2) * kk, t = document.elementFromPoint(x, y);
      const card = document.getElementById('death');
      return { screen: window.SB_DEV.screen(), onCanvas: !!t && t !== card && !card.contains(t), low: card.classList.contains('low'), heroY: hr.y, h: cv.height };
    });
    R.say(high.screen === 'dead' && high.heroY + 8 < high.h / 2 && high.low && high.onCanvas, 'a death high in the room (the hero at ' + high.heroY + ' of ' + high.h + '): the card docks at the bottom and the fallen hero stays in view (screen ' + high.screen + ')');
    await hp.page.close();
  }

  /* under reduced motion the hint is a still outline, with no animation to end: it must still leave after the pulse
     (the fourth review: it stayed for the session). A fresh page, the sample room, the first standing moment. */
  const rm = await newPage(browser, { width: 412, height: 915 });
  await rm.page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await gotoGame(rm.page, srv.base);
  await ready(rm.page);
  /* a fresh player: since T1.10 the hints are saved once shown, and this page shares the first one's storage */
  await rm.page.evaluate(() => localStorage.clear()); await rm.page.reload(); await ready(rm.page);
  await rm.page.evaluate(() => window.SB_DEV.hold(true));
  await tap(rm.page, '#sample');
  const on = await rm.page.evaluate(() => {
    for (let k = 0; k < 120 && !window.SB_DEV.state().hero.ground; k++) window.SB_DEV.step(1);
    window.SB_DEV.step(1);
    const z = document.querySelector('#rocker .zone');
    return { cls: document.querySelector('#rocker').classList.contains('hint'), outline: getComputedStyle(z).outlineStyle };
  });
  await new Promise(r => setTimeout(r, 2600));
  const off = await rm.page.evaluate(() => ({ cls: document.querySelector('#rocker').classList.contains('hint'), A: document.querySelector('#btnA').classList.contains('hint'), outline: getComputedStyle(document.querySelector('#rocker .zone')).outlineStyle }));
  R.say(on.cls && on.outline === 'solid', 'under reduced motion the hint is a still outline at the first standing moment (outline ' + on.outline + ')');
  R.say(!off.cls && !off.A && off.outline !== 'solid', 'under reduced motion the hint outline leaves after the pulse (2.6 s on: rocker ' + off.cls + ', A ' + off.A + ', outline ' + off.outline + ')');
  R.say(rm.errors.length === 0, 'the reduced motion page has zero page errors');
  await rm.page.close();
} finally {
  await browser.close();
  await srv.close();
}
R.finish();
