/* The input gate (BUILD-PLAN.md T0.9, gate `input`): real touchscreen events on the control strip, every hold timed by
 * SB_DEV.step(n) with the loop held, every word read through SB_DEV.lastInput() on the step after the event.
 * The stick (Stephen's ruling of 31 Oct, "Whole left side", QUESTIONS Q140): a thumb lands anywhere left of B, the bottom
 * left corner too, and the stick appears under it; a slide of 12 px from where it landed is left or right, back inside
 * 6 px is neutral, past 32 px the centre follows the thumb; up and down read nothing; lifted it is gone.
 *   - idle: the pad is not drawn, and a quiet hint (the arrows and "slide to run", no border, no fill) sits in the field;
 *   - the first standing moment's hint (a fresh save) draws no box, no ring and no outline anywhere in the stick: its
 *     idle line darkens and its arrows slide (the stick's review: a Sun box round the field read as one giant button);
 *   - a landing at the field's left middle, its top right beside B, beside B low, the very bottom left corner and where
 *     a resting thumb sits (18 and 10 px in, 18 and 40 px over the bottom inset) reads nothing on the next step, its pad
 *     and knob drawn centred under the landing point, kept off the room and off B only (at the screen's edge and bottom
 *     the pad runs off the glass), the thumb inside the pad's rim; 20 px right is right; lifted, nothing, the pad gone;
 *   - a landing at x 3 slid 3 px left reads nothing (it cannot slide 12: recorded for his Pixel check, Q140);
 *   - the pad's and the knob's arrows are upright (the review: <i> made them italic);
 *   - a 4 px wobble reads nothing; pushed 20 px and eased back to 9 it stays, at 3 it is nothing; the same to the left;
 *   - pushed 80 px right the knob stops at 32 and the pad follows the thumb, and a 44 px reversal is left;
 *   - a 60 px push straight up is nothing, and the knob never leaves its row;
 *   - slid over B and up over the room it still steers, and B is never pressed;
 *   - a landing at the zone's top edge or under the field draws the pad inside the field, never over the room;
 *   - under the pause card and the clear card a thumb slid on the strip draws no pad and reads nothing; after Resume
 *     with the thumb held still the pad is under it with its knob centred and the word 0 (they agree), and 14 px more
 *     is right;
 *   - two fingers (the stick and A) both register; a sub step tap on A is exactly one A_TAP; B in the air is B_TAP;
 *   - mirrored, the zone is right of A and B the same way (the bottom right corner steers, the bottom left is A);
 *   - at 360x780 and 320x568, and at 412x915 under the app mark, the corners steer and the hint fits its field.
 * SB_SHOTS=<dir> also writes the stick's shots (stick-*.png, below), then LOOK at them.
 * Watched red by LATCH_OFF (the sub step tap), STICK_DRAWN_IDLE, STICK_ABSOLUTE, CORNER_DEAD, PAD_STAYS, DEADZONE_ZERO,
 * NO_HYSTERESIS, STICK_FIXED_AT_DOWN, NO_FOLLOW, UP_IS_JUMP, RELEASE_ON_LEAVE, PAD_OVER_CANVAS, MIRROR_STICK_LEFT, and since the
 * stick's review HINT_BOXES_FIELD, STICK_IDLE_GONE, PAD_X_UNCLAMPED, PAD_FIELD_INSET, KNOB_ARROW_DARK, ITALIC_ARROWS,
 * PAD_UNDER_CARD, STICK_STEERS_PAUSED and RESUME_KNOB_STALE.
 * ART3 (Astra's round 2, Q98): on real screenshots the hint's chevrons are stick_hint's outer 12 columns each side, the
 * pad stick_pad (idle held neutral, active steering) at 116 css px and the knob stick_knob (neutral, right, left) at 52;
 * Pause is pause_glyph.normal at 2x and pause_glyph.pressed under a held finger. Watched red by PAD_CSS_RING,
 * PAD_NEVER_ACTIVE, KNOB_NO_WAY, HINT_TEXT_ARROWS, PAUSE_OLD_BOX and PAUSE_NOT_PRESSED. */
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { serve, launch, newPage, gotoGame, ready, reporter, tap, sleep, stickAt, landStick, GAME } from './harness.mjs';
const SHOTS = process.env.SB_SHOTS || '';

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
    italic: [...q('#stick').querySelectorAll('*')].filter(e => getComputedStyle(e).fontStyle !== 'normal').map(e => e.className || e.tagName),
    mirror: q('#strip').classList.contains('mirror'), sab: parseFloat(getComputedStyle(q('#safeprobe')).paddingBottom) || 0,
    scrollW: document.scrollingElement.scrollWidth, scrollH: document.scrollingElement.scrollHeight,
    field: box(q('#stick .field')), zone: box(q('#stick')), strip: box(q('#strip')), view: box(q('#view')), vw: innerWidth, vh: innerHeight
  };
});
/* where the pad must be for a landing at (x, y): centred under it, kept off the room (its top at the zone's) and off B
   (its inner side at the zone's; mirrored, the zone's left), nowhere else: at the screen's edge and bottom it runs off */
const padWant = (g, x, y) => ({ x: g.mirror ? Math.max(g.zone.left + g.pad.w / 2, x) : Math.min(g.zone.right - g.pad.w / 2, x), y: Math.max(g.zone.top + g.pad.h / 2, y) });
const offRoomB = g => g.pad.top >= g.zone.top - 0.5 && g.pad.top >= g.view.bottom - 0.5 && (g.mirror ? g.pad.left >= g.zone.left - 0.5 : g.pad.right <= g.zone.right + 0.5);
const thumbIn = (g, x, y) => Math.hypot(x - g.pad.cx, y - g.pad.cy);

/* ART3 (Astra's round 2, Q98): the page's own SPRITES, the oracle for the stick's art and the pause glyph, read off a
   real screenshot at the page's dpr: the device pixel at the centre of every native pixel of the drawn box must be that
   native pixel's colour (nearest neighbour at any scale), every opaque pixel of the frame (cols [c0, c1) of it) */
const PAGE_SRC = readFileSync(process.env.SB_PAGE || GAME + '/index.html', 'utf8');
const SPR = vm.runInNewContext(PAGE_SRC.match(/\/\* SPRITES BEGIN \*\/([\s\S]*?)\/\* SPRITES END \*\//)[1] + '\n;SPRITES');
const HEX = ['0b0a0f', '1f1a1d', '4a4a52', '8a8a90', 'c9c7c0', 'f2efe6', 'fbfbff', '6b3f2a', 'e07a2b', 'c8302f', 'd83a9b', '2f5fd0', '3fb8b4', '3f9a3a', 'f2d13f', 'f0dcb0'];
async function cssSprite(page, sel, key, c0, c1, hole) {
  const [k, f] = key.split('.'), rows = SPR[k].frames[f].split('/').map(r => r.slice(c0 || 0, c1 || r.length));
  const b = await page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, dpr: devicePixelRatio, vw: innerWidth, vh: innerHeight }; }, sel);
  if (!b) return { n: 0, bad: ['no ' + sel] };
  const X = Math.max(0, b.x), Y = Math.max(0, b.y), W = Math.min(b.vw, b.x + b.w) - X, H = Math.min(b.vh, b.y + b.h) - Y;
  const shot = await page.screenshot({ encoding: 'base64', clip: { x: X, y: Y, width: W, height: H } });
  const sp = await page.evaluate(async (b64) => { const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); return { w: im.width, h: im.height, px: Array.from(x.getImageData(0, 0, im.width, im.height).data) }; }, shot);
  const sx = b.w / rows[0].length, sy = b.h / rows.length; let n = 0; const bad = [];
  for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) {
    const ch = rows[y][x]; if (ch === '.') continue;
    const cx = b.x + (x + 0.5) * sx - X, cy = b.y + (y + 0.5) * sy - Y; if (cx < 0 || cy < 0 || cx >= W || cy >= H) continue;   /* off the glass */
    if (hole && cx + X >= hole.left && cx + X <= hole.right && cy + Y >= hole.top && cy + Y <= hole.bottom) continue;   /* under the knob */
    const o = (Math.floor(cy * b.dpr) * sp.w + Math.floor(cx * b.dpr)) * 4, h = [sp.px[o], sp.px[o + 1], sp.px[o + 2]].map(v => ('0' + v.toString(16)).slice(-2)).join('');
    n++; if (h !== HEX[parseInt(ch, 16)]) bad.push(x + ',' + y + ' ' + h + ' not ' + HEX[parseInt(ch, 16)]);
  }
  return { n, bad, w: b.w, h: b.h };
}
const artLine = (tg, what, e) => tg + ': ' + what + ', ' + e.n + ' pixels on a real screenshot' + (e.bad.length ? ' (' + e.bad.length + ' differ: ' + e.bad.slice(0, 3).join('; ') + ')' : '');
/* the pad and knob as they stand: the pad's frame (idle neutral, active steering) at 116 css px, the knob's (neutral,
   left, right) at 52 */
async function stickArt(tg, page, dir) {
  const kb = await page.evaluate(() => { const r = document.querySelector('#stick .knob').getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }; });
  const pad = await cssSprite(page, '#stick .pad', 'stick_pad.' + (dir ? 'active' : 'idle'), 0, 0, kb), knob = await cssSprite(page, '#stick .knob', 'stick_knob.' + (dir === 'R' ? 'right' : dir === 'L' ? 'left' : 'neutral'));
  R.say(pad.n > 0 && pad.bad.length === 0 && pad.w === 116, artLine(tg, (dir ? 'steering ' + dir : 'held neutral') + ', the pad is stick_pad.' + (dir ? 'active' : 'idle') + ' at 116 css px', pad));
  R.say(knob.n > 0 && knob.bad.length === 0 && knob.w === 52, artLine(tg, (dir ? 'steering ' + dir : 'held neutral') + ', the knob is stick_knob.' + (dir === 'R' ? 'right' : dir === 'L' ? 'left' : 'neutral') + ' at 52 css px', knob));
}

/* a landing at (x, y): read, slid 20 px right, lifted; `name` says where */
async function landing(r, tg, name, x, y, { exact = false, shot = '' } = {}) {
  const { page, word, rest } = r;
  const top = await page.evaluate((x, y) => { const t = document.elementFromPoint(x, y), s = document.getElementById('stick'); return !!t && (t === s || s.contains(t)) ? 'the stick' : t ? (t.id || t.className || t.tagName) : 'nothing'; }, x, y);
  const f = await landStick(page, x, y);
  const w0 = await word(), g = await look(page);
  const want = g.padShown ? padWant(g, x, y) : null;
  R.say(w0 === 0, tg + ': a landing at ' + name + ' (' + f0(x) + ', ' + f0(y) + ', on ' + top + ') reads nothing on the next step (word ' + w0 + ')');
  R.say(g.padShown && Math.abs(g.pad.cx - want.x) < 1 && Math.abs(g.pad.cy - want.y) < 1 && Math.abs(g.knob.cx - g.pad.cx) < 1 && Math.abs(g.knob.cy - g.pad.cy) < 1 && offRoomB(g) && !g.idleShown,
    tg + ': landed at ' + name + ' the pad and the knob appear centred under it, kept off the room and off B (' + (g.padShown ? 'pad at ' + f0(g.pad.cx) + ',' + f0(g.pad.cy) + ', want ' + f0(want.x) + ',' + f0(want.y) + ', knob ' + f0(g.knob.cx) + ',' + f0(g.knob.cy) + ', its top ' + f0(g.pad.top) + ' under the room\'s ' + f0(g.view.bottom) : 'no pad drawn') + (g.idleShown ? ', the idle hint still showing' : '') + ')');
  const d = g.padShown ? thumbIn(g, x, y) : Infinity;
  R.say(d < g.pad.w / 2 - 0.5 && (!exact || d < 1), tg + ': landed at ' + name + ' the thumb is inside the drawn pad' + (exact ? ', at its centre' : '') + ' (' + f0(d) + ' px from the centre, the rim ' + f0(g.pad.w / 2) + ')');
  R.say(g.scrollW <= g.vw + 0.5 && g.scrollH <= g.vh + 0.5, tg + ': landed at ' + name + ' the page does not scroll (a pad off the glass adds no overflow: ' + g.scrollW + 'x' + g.scrollH + ')');
  if (SHOTS && shot) { await page.evaluate(() => window.SB_DEV.step(1)); await page.screenshot({ path: join(SHOTS, 'stick-' + shot + '.png') }); console.log('  shot  ' + join(SHOTS, 'stick-' + shot + '.png')); }
  await f.slide(20);
  const w1 = await word();
  R.say(w1 === IN.R, tg + ': landed at ' + name + ', 20 px right is right (word ' + w1 + ')');
  await f.end();
  await page.waitForFunction(() => { const s = window.SB_DEV.stick(); return !!s && s.pointers === 0; }, { timeout: 5000, polling: 20 }).catch(() => {});
  const w2 = await word(), g2 = await look(page);
  R.say(w2 === 0 && !g2.padShown && g2.idleShown, tg + ': landed at ' + name + ' and lifted it is nothing, the pad is gone and the hint back (word ' + w2 + ', pad ' + (g2.padShown ? 'STILL DRAWN' : 'gone') + ')');
  await rest(40);
}

/* the first standing moment's hint, on a fresh save: every element of the stick, sampled through one 0.7 s beat of the
   pulse, draws no box (no outline, no box shadow, no border, no fill on the field), the idle line darkens past its
   resting 0.4 and its arrows slide */
async function hintSeen(page, tg) {
  await page.evaluate(() => { for (let k = 0; k < 200 && !document.getElementById('stick').classList.contains('hint'); k++) window.SB_DEV.step(1); });
  const on = await page.evaluate(() => document.getElementById('stick').classList.contains('hint'));
  const seen = { boxes: [], alpha: 0, moved: 0, beats: 0 };
  for (let k = 0; k < 8; k++) {
    const m = await page.evaluate(() => {
      const st = document.getElementById('stick'), out = [];
      if (!st.classList.contains('hint')) return null;
      for (const e of [st, ...st.querySelectorAll('*')]) {
        const c = getComputedStyle(e), nm = e.className || e.id || e.tagName;
        if (c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) > 0) out.push(nm + ' outline ' + c.outlineWidth);
        if (c.boxShadow !== 'none' && /\d/.test(c.boxShadow.replace(/rgba?\([^)]*\)/g, '').replace(/\b0px\b/g, ''))) out.push(nm + ' shadow ' + c.boxShadow);
      }
      const f = getComputedStyle(st.querySelector('.field'));
      if (parseFloat(f.borderTopWidth) > 0 || f.backgroundColor !== 'rgba(0, 0, 0, 0)') out.push('field border ' + f.borderTopWidth + ' fill ' + f.backgroundColor);
      const col = getComputedStyle(st.querySelector('.idle')).color, a = /rgba/.test(col) ? parseFloat(col.split(',')[3]) : 1;
      const tl = getComputedStyle(st.querySelector('.idle .hl')).transform, tr = getComputedStyle(st.querySelector('.idle .hr')).transform;
      const dx = t => { const m = /matrix\(([^)]*)\)/.exec(t); return m ? Math.abs(parseFloat(m[1].split(',')[4])) : 0; };
      return { out, a, moved: Math.max(dx(tl), dx(tr)) };
    });
    if (!m) break;
    seen.beats++; seen.boxes.push(...m.out); seen.alpha = Math.max(seen.alpha, m.a); seen.moved = Math.max(seen.moved, m.moved);
    /* the shot at the moment the hint shows (the review: the old idle shot was taken after the pulse had ended) */
    if (SHOTS && k === 2) { await page.screenshot({ path: join(SHOTS, 'stick-' + tg + '-hint.png') }); console.log('  shot  ' + join(SHOTS, 'stick-' + tg + '-hint.png')); }
    await sleep(90);
  }
  const boxes = [...new Set(seen.boxes)];
  R.say(on && seen.beats >= 3 && boxes.length === 0, tg + ': the first standing moment\'s hint on the stick draws no box, no ring and no outline (sampled ' + seen.beats + ' times' + (on ? '' : ', the hint never fired') + (boxes.length ? ': ' + boxes.slice(0, 4).join('; ') : '') + ')');
  R.say(on && seen.alpha > 0.6 && seen.moved >= 3, tg + ': the hint is the idle line itself: it darkens (to ' + seen.alpha.toFixed(2) + ' from 0.4) and its arrows slide out (' + seen.moved.toFixed(1) + ' px)');
}

try {
  /* the hint on a fresh save, before any other page (the hints are saved once shown) */
  {
    const { page, errors } = await newPage(browser, { width: 412, height: 915 });
    await gotoGame(page, srv.base);
    await ready(page);
    await page.evaluate(() => localStorage.clear()); await page.reload(); await ready(page);
    await page.evaluate(() => window.SB_DEV.hold(true));
    if (SHOTS) mkdirSync(SHOTS, { recursive: true });
    await tap(page, '#sample');
    await hintSeen(page, '412x915');
    R.say(errors.length === 0, '412x915 the hint\'s page: zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
    await page.close();
  }
  {
    const r = await room(412, 915), { page, errors, at, word, rest } = r, tg = '412x915';

    /* idle: no pad; the quiet hint in the field, unboxed */
    const g0 = await look(page);
    R.say(!g0.padShown && g0.s && g0.s.pointers === 0, tg + ': with no thumb down the stick draws no pad (' + (g0.padShown ? 'a pad drawn at ' + f0(g0.pad.cx) + ',' + f0(g0.pad.cy) : 'none') + ')');
    /* ART3: the hint's chevrons are Astra's stick_hint, its left 12 columns and its right 12, with the words between */
    const hl = await cssSprite(page, '#stick .idle .hl', 'stick_hint.line', 0, 12), hr = await cssSprite(page, '#stick .idle .hr', 'stick_hint.line', 60, 72);
    R.say(hl.n > 0 && hr.n > 0 && hl.bad.length === 0 && hr.bad.length === 0, artLine(tg, 'idle, the hint\'s chevrons are stick_hint\'s left and right 12 columns', { n: hl.n + hr.n, bad: hl.bad.concat(hr.bad) }));
    R.say(g0.idleShown && /slide to run/.test(g0.idleText) && g0.idleBare
      && g0.idle.left >= g0.field.left - 0.5 && g0.idle.right <= g0.field.right + 0.5 && g0.idle.bottom <= g0.field.bottom + 0.5,
      tg + ': idle, a quiet hint in the field says where the thumb goes ("' + g0.idleText + '", no border, no fill, inside the field)');

    /* the landings: the field's middle and its top right, beside B low, the very bottom left corner and where a resting
       left thumb sits (the review's probe: 61 to 68 px from the pad's centre while it was kept in the field) */
    await landing(r, tg, 'the field\'s left middle', g0.field.left + g0.field.w * 0.25, g0.field.top + g0.field.h * 0.5);
    await landing(r, tg, 'the field\'s top right, beside B', g0.field.left + g0.field.w * 0.85, g0.field.top + g0.field.h * 0.2);
    await landing(r, tg, 'beside B, low', g0.zone.right - 2, g0.vh - g0.sab - 30);
    await landing(r, tg, 'the very bottom left corner', 3, g0.vh - 3, { exact: true });
    await landing(r, tg, 'a resting thumb, 18 px in and 18 over the inset', 18, g0.vh - g0.sab - 18, { exact: true });
    await landing(r, tg, 'a resting thumb, 10 px in and 40 over the inset', 10, g0.vh - g0.sab - 40, { exact: true });

    /* the edge (recorded, his call in Q140): a thumb landed 3 px from the edge can slide 3 px left, under ON */
    {
      const fe = await landStick(page, 3, g0.vh - g0.sab - 30);
      await word();
      await fe.slide(-3);
      const wl = await word();
      await fe.end(); await rest(10);
      R.say(wl === 0, tg + ': a landing at x 3 slid 3 px left to the edge reads nothing (word ' + wl + '; the follow and ON make it so: his Pixel call, Q140)');
    }

    /* a wobble reads nothing; the push, eased back: the hold, then neutral; the same to the left */
    const c = await stickAt(page);
    let f = await landStick(page, c.x, c.y);
    const wob = [];
    for (const dx of [4, -4, 4, 0]) { await f.slide(dx); wob.push(await word()); }
    R.say(wob.every(v => v === 0), tg + ': a 4 px wobble after landing reads nothing (words ' + wob.join(', ') + ')');
    await stickArt(tg, page, null);
    if (SHOTS) await page.screenshot({ path: join(SHOTS, 'stick-' + tg + '-held.png') });
    await f.slide(20);
    const r20 = await word(), gr = await look(page);
    await stickArt(tg, page, 'R');
    if (SHOTS) await page.screenshot({ path: join(SHOTS, 'stick-' + tg + '-right.png') });
    await f.slide(9);
    const r9 = await word();
    await f.slide(3);
    const r3 = await word();
    R.say(r20 === IN.R && gr.lit === 'R' && Math.abs(gr.knob.cx - gr.pad.cx - 20) < 1, tg + ': pushed 20 px right without lifting it is right, the knob 20 px right and the right arrow lit (word ' + r20 + ', knob ' + f0(gr.knob.cx - gr.pad.cx) + ', lit ' + (gr.lit || 'none') + ')');
    R.say(gr.italic.length === 0 && g0.italic.length === 0, tg + ': the stick\'s arrows stand upright, nothing in it italic (' + ([...new Set([...gr.italic, ...g0.italic])].join(', ') || 'none') + ')');
    R.say(r9 === IN.R, tg + ': pushed 20 px and eased back to 9 px it stays right (word ' + r9 + ')');
    R.say(r3 === 0, tg + ': eased back to 3 px it is nothing (word ' + r3 + ')');
    await f.slide(-20);
    const l20 = await word(), gl = await look(page);
    await stickArt(tg, page, 'L');
    if (SHOTS) await page.screenshot({ path: join(SHOTS, 'stick-' + tg + '-left.png') });
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

    /* the pad never over the room; at the strip's bottom it runs off the glass, centred under the thumb */
    for (const [name, y] of [['the zone\'s top edge', g0.zone.top + 2], ['the strip\'s bottom, under the field', g0.vh - 2]]) {
      f = await landStick(page, c.x, y);
      await word();
      const gp = await look(page);
      R.say(gp.padShown && gp.pad.top >= gp.view.bottom - 0.5 && offRoomB(gp) && Math.abs(gp.pad.cy - padWant(gp, c.x, y).y) < 1, tg + ': a landing at ' + name + ' draws its pad inside the strip, never over the room (pad ' + f0(gp.pad.top) + ' to ' + f0(gp.pad.bottom) + ', centre ' + f0(gp.pad.cy) + ' for a thumb at ' + f0(y) + ', the room ends ' + f0(gp.view.bottom) + ')');
      await f.end(); await rest(10);
    }

    /* the pause card: a thumb pushed right, then the card: it reads nothing and draws nothing however it slides; Resume
       with the thumb held still: the pad back under it, the knob centred, the word 0 (they agree); 14 px more is right */
    {
      const fp = await landStick(page, c.x, c.y);
      await fp.slide(20);
      const wp0 = await word();
      await page.evaluate(() => window.SB.ui.pause());
      const scr = await page.evaluate(() => window.SB_DEV.screen());
      await fp.slide(40); const gp1 = await look(page);
      await fp.slide(-20); const gp2 = await look(page);
      await fp.slide(24);
      const gp3 = await look(page);
      R.say(wp0 === IN.R && scr === 'pause' && !gp1.padShown && !gp2.padShown && !gp3.padShown, tg + ': under the pause card a thumb slid on the strip draws no pad (screen ' + scr + ', pad ' + [gp1, gp2, gp3].map(v => v.padShown ? 'DRAWN' : 'none').join(', ') + ')');
      R.say(gp1.s.dir === null && gp2.s.dir === null && gp3.s.dir === null, tg + ': under the pause card a thumb slid on the strip reads nothing (dir ' + [gp1, gp2, gp3].map(v => v.s.dir).join(', ') + ')');
      await page.evaluate(() => window.SB.ui.resume());
      const wr = await word(), gr2 = await look(page);
      R.say(wr === 0 && gr2.padShown && Math.abs(gr2.knob.cx - gr2.pad.cx) < 1 && Math.abs(gr2.pad.cx - padWant(gr2, fp.x, fp.y).x) < 1 && gr2.lit === '',
        tg + ': after Resume with the thumb held still the knob is centred and the word 0, they agree (word ' + wr + ', knob ' + (gr2.padShown ? f0(gr2.knob.cx - gr2.pad.cx) + ' px from the pad\'s centre, the pad at ' + f0(gr2.pad.cx) + ' for the thumb at ' + f0(fp.x) : 'no pad drawn') + ', lit ' + (gr2.lit || 'none') + ')');
      await fp.to(fp.x + 14);
      const wr2 = await word();
      R.say(wr2 === IN.R, tg + ': after Resume the held thumb slid 14 px right is right (word ' + wr2 + ')');
      await fp.end(); await rest(10);
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
    await rest(60);

    /* the clear card (the room ends under a held thumb): nothing drawn, nothing read, however it slides */
    {
      const fc = await landStick(page, c.x, c.y);
      await fc.slide(20);
      await page.evaluate(() => { window.SB_DEV.goto('exit'); window.SB_DEV.step(3); });
      const scr = await page.evaluate(() => window.SB_DEV.screen());
      await fc.slide(-30); const gc1 = await look(page);
      await fc.slide(30); const gc2 = await look(page);
      R.say(scr === 'clear' && !gc1.padShown && !gc2.padShown && gc1.s.dir === null && gc2.s.dir === null, tg + ': under the clear card a thumb slid on the strip draws no pad and reads nothing (screen ' + scr + ', pad ' + [gc1, gc2].map(v => v.padShown ? 'DRAWN' : 'none').join(', ') + ', dir ' + gc1.s.dir + ', ' + gc2.s.dir + ')');
      await fc.end();
    }
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
    R.say(w0 === 0 && w1 === IN.L && gm.padShown && offRoomB(gm) && Math.abs(gm.pad.cx - (g.vw - 3)) < 1 && Math.abs(gm.pad.cy - (g.vh - 3)) < 1, tg + ': a landing in the very bottom right corner reads nothing, its pad centred under it off the room and off A and B, and 20 px left is left (words ' + w0 + ', ' + w1 + ', pad ' + f0(gm.pad.cx) + ',' + f0(gm.pad.cy) + ')');
    const corner = await page.touchscreen.touchStart(3, g.vh - 3);
    const wA = await word();
    await corner.end();
    R.say((wA & IN.A) !== 0, tg + ': in a room the bottom left corner is A (word ' + wA + ')');
    R.say(errors.length === 0, tg + ': zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
    await page.close();
  }

  /* the smaller phones and the app mark: the corners steer, the pad under the thumb, the hint fits its field */
  for (const [w, h, query] of [[360, 780, ''], [320, 568, ''], [412, 915, 'navpad'], [412, 800, 'navpad']]) {
    const r = await room(w, h, { query }), tg = w + 'x' + h + (query ? ' under the app mark' : '');
    const g = await look(r.page);
    R.say(g.idleShown && g.idleFits && !g.padShown, tg + ': idle, the hint shows and fits its field (' + f0(g.idle.w) + ' px in ' + f0(g.field.w) + '), no pad drawn');
    await landing(r, tg, 'the very bottom left corner', 3, g.vh - 3, { exact: true });
    await landing(r, tg, 'a resting thumb, 18 px in and 18 over the inset', 18, g.vh - g.sab - 18, { exact: true });
    await landing(r, tg, 'a resting thumb, 10 px in and 40 over the inset', 10, g.vh - g.sab - 40, { exact: true });
    await landing(r, tg, 'beside B, low', g.zone.right - 2, g.vh - g.sab - 30);
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
        : [['corner', 3, vh - 3], ['rest', 18, vh - g.sab - 18], ['left', g.field.left + g.field.w * 0.3, g.field.top + g.field.h * 0.55], ['high', g.field.left + g.field.w * 0.8, g.field.top + 12]];
      if (opt.query) spots.splice(3);
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
  /* ART3: Pause is Astra's pause_glyph at 2x (32 css px): normal, then pressed (one native pixel lower) under a held
     finger, at each size */
  for (const [w, h] of [[412, 915], [360, 780], [320, 568]]) {
    const r = await room(w, h), { page, errors } = r, tg = w + 'x' + h;
    const pn = await cssSprite(page, '#pause i', 'pause_glyph.normal');
    R.say(pn.n > 0 && pn.bad.length === 0 && pn.w === 32, artLine(tg, 'Pause is pause_glyph.normal at 2x, 32 css px', pn));
    const pc = await page.evaluate(() => { const r = document.querySelector('#pause i').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await page.touchscreen.touchStart(pc.x, pc.y);
    await sleep(60);
    const pp = await cssSprite(page, '#pause i', 'pause_glyph.pressed');
    if (SHOTS) await page.screenshot({ path: join(SHOTS, 'pause-' + tg + '-pressed.png') });
    await page.touchscreen.touchEnd();
    R.say(pp.n > 0 && pp.bad.length === 0, artLine(tg, 'under a held finger Pause is pause_glyph.pressed', pp));
    R.say(errors.length === 0, tg + ' the pause glyph\'s page: zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
    await page.close();
  }
} finally {
  await browser.close();
  await srv.close();
}
R.finish();
