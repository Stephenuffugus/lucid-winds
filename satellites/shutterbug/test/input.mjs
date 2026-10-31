/* The input gate (BUILD-PLAN.md T0.9, gate `input`): real touchscreen events on the control strip, every hold timed by
 * SB_DEV.step(n) with the loop held, every word read through SB_DEV.lastInput() on the step after the event.
 * The stick (Stephen's ruling of 31 Oct, "Whole left side", QUESTIONS Q140): a thumb lands anywhere left of B, the bottom
 * left corner too, and the stick appears under it; a slide of 12 px from where it landed is left or right, back inside
 * 6 px is neutral, past 32 px the centre follows the thumb; up and down read nothing; lifted it is gone.
 *   - idle: the pad is not drawn, and a quiet hint (the arrows and "slide to run", no border, no fill) sits in the field;
 *   - a landing at three points, the very bottom left corner among them, reads nothing on the next step, its pad and
 *     knob drawn centred under the landing point, kept inside the field; 20 px right is right; lifted, nothing, and the
 *     pad is gone;
 *   - a 4 px wobble reads nothing; pushed 20 px and eased back to 9 it stays, at 3 it is nothing; the same to the left;
 *   - pushed 80 px right the knob stops at 32 and the pad follows the thumb, and a 44 px reversal is left;
 *   - a 60 px push straight up is nothing, and the knob never leaves its row;
 *   - slid over B and up over the room it still steers, and B is never pressed;
 *   - a landing at the zone's top edge or under the field draws the pad inside the field, never over the room;
 *   - two fingers (the stick and A) both register; a sub step tap on A is exactly one A_TAP; B in the air is B_TAP;
 *   - mirrored, the zone is right of A and B the same way (the bottom right corner steers, the bottom left is A);
 *   - at 360x780 and 320x568 the corner steers and the hint fits its field.
 * SB_SHOTS=<dir> also writes the stick's shots (stick-*.png, below), then LOOK at them.
 * Watched red by LATCH_OFF (the sub step tap), STICK_DRAWN_IDLE, STICK_ABSOLUTE, CORNER_DEAD, PAD_STAYS, DEADZONE_ZERO,
 * NO_HYSTERESIS, STICK_FIXED_AT_DOWN, NO_FOLLOW, UP_IS_JUMP, RELEASE_ON_LEAVE, PAD_OVER_CANVAS and MIRROR_STICK_LEFT. */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { serve, launch, newPage, gotoGame, ready, reporter, tap, sleep, stickAt, landStick } from './harness.mjs';

const R = reporter('INPUT');
const srv = await serve();
const browser = await launch();
const IN = { L: 1, R: 2, A: 4, B: 8, A_TAP: 16, B_TAP: 32 };
const f0 = v => v.toFixed(0);

async function room(w, h, { query = '', mirror = false } = {}) {
  const { page, errors } = await newPage(browser, { width: w, height: h });
  await gotoGame(page, srv.base, query);
  await ready(page);
  await page.evaluate(() => window.SB_DEV.hold(true));
  await tap(page, '#sample');
  /* the mirrored strip, as Settings sets it at boot (a layout liberty: the save gate proves the setting itself) */
  if (mirror) await page.evaluate(() => document.getElementById('strip').classList.add('mirror'));
  for (let k = 0; k < 20; k++) await page.evaluate(() => window.SB_DEV.step(1));     /* settle onto the floor */
  const at = await page.evaluate(() => {
    const c = el => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
    return { A: c(document.querySelector('#btnA .glyph')), B: c(document.querySelector('#btnB .glyph')) };
  });
  const word = async () => { await page.evaluate(() => window.SB_DEV.step(1)); return page.evaluate(() => window.SB_DEV.lastInput()); };
  const rest = async (n = 30) => { for (let k = 0; k < n; k++) await page.evaluate(() => window.SB_DEV.step(1)); };
  return { page, errors, at, word, rest };
}

/* the drawn stick as it stands: the pad (shown or not, its box, its lit side), the knob's centre, the idle hint, the
   field, the strip and the room */
const look = page => page.evaluate(() => {
  const q = s => document.querySelector(s), box = el => { const r = el.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 }; };
  const pad = q('#stick .pad'), idle = q('#stick .idle'), pc = getComputedStyle(pad), ic = getComputedStyle(idle), pb = box(pad);
  return {
    s: window.SB_DEV.stick(), pad: pb, padShown: pc.display !== 'none' && pc.visibility !== 'hidden' && pb.w > 0 && pb.h > 0,
    lit: pad.classList.contains('r') ? 'R' : pad.classList.contains('l') ? 'L' : '', knob: box(q('#stick .knob')),
    idle: box(idle), idleShown: ic.display !== 'none' && ic.visibility !== 'hidden' && idle.getBoundingClientRect().width > 0,
    idleText: idle.textContent, idleBare: parseFloat(ic.borderTopWidth) === 0 && parseFloat(ic.borderLeftWidth) === 0 && ic.backgroundColor === 'rgba(0, 0, 0, 0)' && ic.boxShadow === 'none',
    idleFits: idle.scrollWidth <= idle.clientWidth + 0.5,
    field: box(q('#stick .field')), zone: box(q('#stick')), strip: box(q('#strip')), view: box(q('#view')), vw: innerWidth, vh: innerHeight
  };
});
/* where the pad must be for a landing at (x, y): centred under it, kept inside the field */
const padWant = (g, x, y) => ({ x: Math.max(g.field.left + g.pad.w / 2, Math.min(g.field.right - g.pad.w / 2, x)), y: Math.max(g.field.top + g.pad.h / 2, Math.min(g.field.bottom - g.pad.h / 2, y)) });
const inField = g => g.pad.left >= g.field.left - 0.5 && g.pad.right <= g.field.right + 0.5 && g.pad.top >= g.field.top - 0.5 && g.pad.bottom <= g.field.bottom + 0.5;

/* a landing at (x, y): read, slid 20 px right, lifted; `name` says where */
async function landing(r, tg, name, x, y) {
  const { page, word, rest } = r;
  const top = await page.evaluate((x, y) => { const t = document.elementFromPoint(x, y), s = document.getElementById('stick'); return !!t && (t === s || s.contains(t)) ? 'the stick' : t ? (t.id || t.className || t.tagName) : 'nothing'; }, x, y);
  const f = await landStick(page, x, y);
  const w0 = await word(), g = await look(page);
  const want = g.padShown ? padWant(g, x, y) : null;
  R.say(w0 === 0, tg + ': a landing at ' + name + ' (' + f0(x) + ', ' + f0(y) + ', on ' + top + ') reads nothing on the next step (word ' + w0 + ')');
  R.say(g.padShown && Math.abs(g.pad.cx - want.x) < 1 && Math.abs(g.pad.cy - want.y) < 1 && Math.abs(g.knob.cx - g.pad.cx) < 1 && Math.abs(g.knob.cy - g.pad.cy) < 1 && inField(g) && !g.idleShown,
    tg + ': landed at ' + name + ' the pad and the knob appear centred under it, kept inside the field (' + (g.padShown ? 'pad at ' + f0(g.pad.cx) + ',' + f0(g.pad.cy) + ', want ' + f0(want.x) + ',' + f0(want.y) + ', knob ' + f0(g.knob.cx) + ',' + f0(g.knob.cy) : 'no pad drawn') + (g.idleShown ? ', the idle hint still showing' : '') + ')');
  await f.slide(20);
  const w1 = await word();
  R.say(w1 === IN.R, tg + ': landed at ' + name + ', 20 px right is right (word ' + w1 + ')');
  await f.end();
  await page.waitForFunction(() => { const s = window.SB_DEV.stick(); return !!s && s.pointers === 0; }, { timeout: 5000, polling: 20 }).catch(() => {});
  const w2 = await word(), g2 = await look(page);
  R.say(w2 === 0 && !g2.padShown && g2.idleShown, tg + ': landed at ' + name + ' and lifted it is nothing, the pad is gone and the hint back (word ' + w2 + ', pad ' + (g2.padShown ? 'STILL DRAWN' : 'gone') + ')');
  await rest(40);
}

try {
  {
    const r = await room(412, 915), { page, errors, at, word, rest } = r, tg = '412x915';

    /* idle: no pad; the quiet hint in the field, unboxed */
    const g0 = await look(page);
    R.say(!g0.padShown && g0.s && g0.s.pointers === 0, tg + ': with no thumb down the stick draws no pad (' + (g0.padShown ? 'a pad drawn at ' + f0(g0.pad.cx) + ',' + f0(g0.pad.cy) : 'none') + ')');
    R.say(g0.idleShown && /slide to run/.test(g0.idleText) && g0.idleText.indexOf('◀') >= 0 && g0.idleText.indexOf('▶') >= 0 && g0.idleBare
      && g0.idle.left >= g0.field.left - 0.5 && g0.idle.right <= g0.field.right + 0.5 && g0.idle.bottom <= g0.field.bottom + 0.5,
      tg + ': idle, a quiet hint in the field says where the thumb goes ("' + g0.idleText + '", no border, no fill, inside the field)');

    /* three landings, the very bottom left corner among them */
    await landing(r, tg, 'the field\'s left middle', g0.field.left + g0.field.w * 0.25, g0.field.top + g0.field.h * 0.5);
    await landing(r, tg, 'the field\'s top right, beside B', g0.field.left + g0.field.w * 0.85, g0.field.top + g0.field.h * 0.2);
    await landing(r, tg, 'the very bottom left corner', 3, g0.vh - 3);

    /* a wobble reads nothing; the push, eased back: the hold, then neutral; the same to the left */
    const c = await stickAt(page);
    let f = await landStick(page, c.x, c.y);
    const wob = [];
    for (const dx of [4, -4, 4, 0]) { await f.slide(dx); wob.push(await word()); }
    R.say(wob.every(v => v === 0), tg + ': a 4 px wobble after landing reads nothing (words ' + wob.join(', ') + ')');
    await f.slide(20);
    const r20 = await word(), gr = await look(page);
    await f.slide(9);
    const r9 = await word();
    await f.slide(3);
    const r3 = await word();
    R.say(r20 === IN.R && gr.lit === 'R' && Math.abs(gr.knob.cx - gr.pad.cx - 20) < 1, tg + ': pushed 20 px right without lifting it is right, the knob 20 px right and the right arrow lit (word ' + r20 + ', knob ' + f0(gr.knob.cx - gr.pad.cx) + ', lit ' + (gr.lit || 'none') + ')');
    R.say(r9 === IN.R, tg + ': pushed 20 px and eased back to 9 px it stays right (word ' + r9 + ')');
    R.say(r3 === 0, tg + ': eased back to 3 px it is nothing (word ' + r3 + ')');
    await f.slide(-20);
    const l20 = await word(), gl = await look(page);
    await f.slide(-9);
    const l9 = await word();
    await f.slide(-3);
    const l3 = await word();
    R.say(l20 === IN.L && gl.lit === 'L' && Math.abs(gl.knob.cx - gl.pad.cx + 20) < 1, tg + ': pushed 20 px left it is left, the knob 20 px left and the left arrow lit (word ' + l20 + ', lit ' + (gl.lit || 'none') + ')');
    R.say(l9 === IN.L && l3 === 0, tg + ': eased back to 9 px it stays left, at 3 px it is nothing (words ' + l9 + ', ' + l3 + ')');
    await f.end(); await rest();

    /* the follow: 80 px right, the knob stops at 32 and the pad comes along; a 44 px reversal is left */
    f = await landStick(page, c.x, c.y);
    await f.slide(80);
    const w80 = await word(), g80 = await look(page);
    await f.slide(36);
    const wRev = await word(), gRev = await look(page);
    R.say(w80 === IN.R && Math.abs(g80.knob.cx - g80.pad.cx - 32) < 1 && Math.abs(g80.pad.cx - (c.x + 48)) < 1,
      tg + ': pushed 80 px right it is right, the knob stops 32 px right and the pad follows the thumb 48 px (knob ' + f0(g80.knob.cx - g80.pad.cx) + ', pad moved ' + f0(g80.pad.cx - c.x) + ')');
    R.say(wRev === IN.L && gRev.lit === 'L', tg + ': after the 80 px push, a 44 px reversal is left (word ' + wRev + ')');
    await f.end(); await rest();

    /* up and down read nothing */
    f = await landStick(page, c.x, c.y);
    await f.slide(0, -60);
    const wUp = await word(), gUp = await look(page);
    await f.slide(0, 30);
    const wDown = await word();
    R.say(wUp === 0 && wDown === 0, tg + ': a 60 px push straight up is word 0, and 30 px down too (words ' + wUp + ', ' + wDown + ')');
    R.say(gUp.padShown && Math.abs(gUp.knob.cy - gUp.pad.cy) < 1 && Math.abs(gUp.knob.cx - gUp.pad.cx) < 1, tg + ': pushed up, the knob stays in the pad\'s row and centre (knob ' + f0(gUp.knob.cx - gUp.pad.cx) + ',' + f0(gUp.knob.cy - gUp.pad.cy) + ' from the pad\'s centre)');
    await f.end(); await rest();

    /* captured: over B, then up over the room, it steers on and B is never pressed */
    f = await landStick(page, c.x, c.y);
    await f.slide(20);
    const wIn = await word();
    await f.to(at.B.x, at.B.y);
    const wB = await word();
    await f.to(at.B.x, gUp.view.top + gUp.view.h / 2);
    const wRoom = await word();
    await f.to(g0.vw - 2, gUp.view.top + 8);
    const wFar = await word();
    await f.end();
    const wOff = await word();
    R.say(wIn === IN.R && wB === IN.R && wRoom === IN.R && wFar === IN.R, tg + ': slid over B and up over the room it still steers right, and B stays 0 (words ' + [wIn, wB, wRoom, wFar].join(', ') + ')');
    R.say(wOff === 0, tg + ': lifted over the room it is nothing (word ' + wOff + ')');
    await rest();

    /* the pad never over the room, never under the field */
    for (const [name, y] of [['the zone\'s top edge', g0.zone.top + 2], ['the strip\'s bottom, under the field', g0.vh - 2]]) {
      f = await landStick(page, c.x, y);
      await word();
      const gp = await look(page);
      R.say(gp.padShown && gp.pad.top >= gp.view.bottom - 0.5 && inField(gp), tg + ': a landing at ' + name + ' draws its pad inside the strip, never over the room (pad ' + f0(gp.pad.top) + ' to ' + f0(gp.pad.bottom) + ', the room ends ' + f0(gp.view.bottom) + ', the field ' + f0(gp.field.top) + ' to ' + f0(gp.field.bottom) + ')');
      await f.end(); await rest(10);
    }

    /* A and B alone, then lifted */
    for (const [name, want] of [['A', IN.A | IN.A_TAP], ['B', IN.B | IN.B_TAP]]) {
      const t = await page.touchscreen.touchStart(at[name].x, at[name].y);
      const w1 = await word();
      await t.end();
      const w2 = await word();
      R.say(w1 === want && w2 === 0, tg + ': a real touch on ' + name + ' is word ' + want + ' on the next step, lifted 0 (got ' + w1 + ', then ' + w2 + ')');
      await rest(40);
    }

    /* a sub step tap: down and up 4 ms apart, both before the step: exactly one A_TAP, and no held A */
    const tf = await page.touchscreen.touchStart(at.A.x, at.A.y);
    await sleep(4);
    await tf.end();
    const t1 = await word(), t2 = await word();
    R.say((t1 & IN.A_TAP) !== 0 && (t1 & IN.A) === 0 && (t2 & IN.A_TAP) === 0, 'a sub step tap on A (4 ms) is exactly one A_TAP with A not held (words ' + t1 + ', ' + t2 + ')');
    await rest(60);

    /* two fingers: the stick and A together */
    f = await landStick(page, c.x, c.y);
    await f.slide(20);
    const a2 = await page.touchscreen.touchStart(at.A.x, at.A.y);
    const both = await word();
    await a2.end(); await f.end();
    R.say((both & IN.R) !== 0 && (both & IN.A) !== 0, 'two fingers, the stick and A, both register (word ' + both + ')');
    await rest(60);

    /* B in the air: jump, wait until rising, tap B */
    const j = await page.touchscreen.touchStart(at.A.x, at.A.y);
    await word();
    for (let k = 0; k < 4; k++) await word();
    const air = await page.evaluate(() => { const h = window.SB_DEV.state().hero; return { ground: h.ground, vy: h.vy }; });
    const b = await page.touchscreen.touchStart(at.B.x, at.B.y);
    const wb = await word();
    await b.end(); await j.end();
    R.say(air.ground === 0 && (wb & IN.B_TAP) !== 0, 'B in the air reads as B_TAP (airborne ' + (air.ground === 0) + ', vy ' + air.vy + ', word ' + wb + ')');
    R.say(errors.length === 0, tg + ': zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
    await page.close();
  }

  /* mirrored: the zone right of A and B, the same way */
  {
    const r = await room(412, 915, { mirror: true }), { page, errors, at, word } = r, tg = '412x915 mirrored';
    const g = await look(page);
    R.say(g.zone.left > at.B.x && Math.abs(g.zone.right - g.vw) < 0.5, tg + ': the stick zone runs from B to the right edge (' + f0(g.zone.left) + ' to ' + f0(g.zone.right) + ', B at ' + f0(at.B.x) + ')');
    const f = await landStick(page, g.vw - 3, g.vh - 3);
    const w0 = await word();
    await f.slide(-20);
    const w1 = await word(), gm = await look(page);
    await f.end();
    R.say(w0 === 0 && w1 === IN.L && gm.padShown && inField(gm), tg + ': a landing in the very bottom right corner reads nothing, its pad inside the field, and 20 px left is left (words ' + w0 + ', ' + w1 + ')');
    const corner = await page.touchscreen.touchStart(3, g.vh - 3);
    const wA = await word();
    await corner.end();
    R.say((wA & IN.A) !== 0, tg + ': in a room the bottom left corner is A (word ' + wA + ')');
    R.say(errors.length === 0, tg + ': zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
    await page.close();
  }

  /* the smaller phones: the corner steers, the hint fits its field */
  for (const [w, h] of [[360, 780], [320, 568]]) {
    const r = await room(w, h), tg = w + 'x' + h;
    const g = await look(r.page);
    R.say(g.idleShown && g.idleFits && !g.padShown, tg + ': idle, the hint shows and fits its field (' + f0(g.idle.w) + ' px in ' + f0(g.field.w) + '), no pad drawn');
    await landing(r, tg, 'the very bottom left corner', 3, g.vh - 3);
    R.say(r.errors.length === 0, tg + ': zero page errors' + (r.errors.length ? ' (' + r.errors.join(' ; ') + ')' : ''));
    await r.page.close();
  }

  /* the shots (Q140): the stick appearing under a thumb at three landing points (the very bottom left corner among them),
     mid push right, mid push left, after a long push and a reversal, and idle with the hint, at three sizes; mirrored
     once; once under the app mark with an opaque 48 px bar painted over the bottom. A held in the push right shots. The
     loop is held, so the room stands still under the thumb */
  if (process.env.SB_SHOTS) {
    const dir = process.env.SB_SHOTS;
    mkdirSync(dir, { recursive: true });
    const shoot = async (page, name) => { const file = join(dir, 'stick-' + name + '.png'); await page.evaluate(() => window.SB_DEV.step(1)); await page.screenshot({ path: file }); console.log('  shot  ' + file); };
    const bar = page => page.evaluate(() => { const d = document.createElement('div'); d.style.cssText = 'position:fixed;left:0;right:0;bottom:0;height:48px;background:#000;z-index:2000;pointer-events:none'; document.body.appendChild(d); });
    for (const [w, h, opt, label] of [[412, 915, {}, '412x915'], [360, 780, {}, '360x780'], [320, 568, {}, '320x568'], [412, 915, { mirror: true }, '412x915-mirror'], [412, 915, { query: 'navpad' }, '412x915-navpad-bar']]) {
      const r = await room(w, h, opt), page = r.page;
      if (opt.query) await bar(page);
      for (let k = 0; k < 100; k++) await page.evaluate(() => window.SB_DEV.step(1));
      const g = await look(page), vh = g.vh;
      await shoot(page, label + '-idle');
      const spots = opt.mirror ? [['corner', g.vw - 3, vh - 3], ['mid', g.field.left + g.field.w * 0.5, g.field.top + g.field.h * 0.5]]
        : [['corner', 3, vh - 3], ['left', g.field.left + g.field.w * 0.3, g.field.top + g.field.h * 0.55], ['high', g.field.left + g.field.w * 0.8, g.field.top + 12]];
      if (opt.query) spots.splice(2);
      for (const [n, x, y] of spots) {
        const f = await landStick(page, x, y);
        await shoot(page, label + '-land-' + n);
        await f.end(); await r.rest(5);
      }
      const c = await stickAt(page, 0.45, 0.6);
      let f = await landStick(page, c.x, c.y);
      await f.slide(20);
      const a = await page.touchscreen.touchStart(r.at.A.x, r.at.A.y);
      await shoot(page, label + '-push-right-A');
      await a.end();
      await f.slide(-20);
      await shoot(page, label + '-push-left');
      await f.end(); await r.rest(5);
      if (!opt.mirror && !opt.query) {
        f = await landStick(page, c.x - 40, c.y);
        await f.slide(80);
        await shoot(page, label + '-long-right');
        await f.slide(36);
        await shoot(page, label + '-reversed');
        await f.end();
      }
      await page.close();
    }
  }
} finally {
  await browser.close();
  await srv.close();
}
R.finish();
