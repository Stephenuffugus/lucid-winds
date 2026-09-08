#!/usr/bin/env node
/* Every button a thumb uses, on every screen, at the three widths.
 *
 *   node test/layout.mjs
 *
 * The studio law is 48 px RENDERED, and reachable: a button that measures 48 px
 * under something else is not a button. So every check here is three things,
 * the rectangle, document.elementFromPoint at its centre landing on it, and the
 * whole rectangle inside the viewport. Nothing tappable off the screen.
 * ⛔ el.click() proves nothing and is not used anywhere in this file.
 * ⛔ a missing or hidden element is a FAIL, never a skip: every screen is put
 * on first and its buttons counted before they are measured.
 *
 * It also holds the seat: the bottom left 120 by 120 of the lake belongs to the
 * fleet's music chip and its folded pill, and nothing of Gerplunk's may be in
 * it but the water itself.
 */
import { serve, open, reporter, tap, centre, flick, stroke, waitFrames } from './harness.mjs';

const { base, close } = await serve();
const { fails, say } = reporter();
const SIZES = [{ width: 375, height: 667 }, { width: 320, height: 568 }, { width: 412, height: 915 }];

for (const size of SIZES) {
  const tag = size.width + 'x' + size.height;
  const { browser, page } = await open(base, size);
  const dev = (fn, ...a) => page.evaluate(fn, ...a);

  async function check(sel, label, min) {
    const c = await centre(page, sel);
    const need = min || 48;
    const ok = !!c && c.w >= need && c.h >= need && c.onTop && c.inView;
    say(ok, tag + '  ' + label + '  ' + (c ? c.w.toFixed(0) + 'x' + c.h.toFixed(0) + (c.onTop ? '' : ' NOT ON TOP') + (c.inView ? '' : ' OFF THE SCREEN') : 'MISSING'));
  }
  async function count(sel, n, label) {
    const got = await dev((sel) => document.querySelectorAll(sel).length, sel);
    say(got === n, tag + '  ' + label + ': ' + got + ' of ' + n);
  }

  /* the title */
  say((await dev(() => window.GERPLUNK_DEV.screen())) === 'title', tag + '  boots to the title');
  await check('#btnPlay', 'TO THE LAKE', 56);

  /* the lake */
  await tap(page, '#btnPlay');
  await page.waitForFunction(() => window.GERPLUNK_DEV.screen() === 'lake', { timeout: 15000 });
  await waitFrames(page, 3);
  await check('#btnMenu', 'MENU');
  await count('.stone', 3, 'stones on the bank');
  const ids = await dev(() => Array.from(document.querySelectorAll('.stone')).map(b => b.getAttribute('data-id')));
  for (const id of ids) await check('.stone[data-id="' + id + '"]', 'stone ' + id);
  const post = await centre(page, '#post');
  say(!!post && post.inView, tag + '  the tally post is on the screen');
  /* the music chip's seat */
  const seat = await dev(() => {
    const H = window.innerHeight, hits = [];
    for (const [x, y] of [[20, H - 20], [60, H - 60], [110, H - 110], [110, H - 20], [20, H - 110]]) {
      const el = document.elementFromPoint(x, y);
      hits.push(el ? (el.id || el.tagName) : 'none');
    }
    return hits;
  });
  say(seat.every(h => h === 'stage'), tag + '  the bottom left 120x120 is only water (' + seat.join(', ') + ')');
  /* every button on the lake is inside the viewport */
  const off = await dev(() => Array.from(document.querySelectorAll('#hud button')).filter(b => {
    const r = b.getBoundingClientRect();
    return r.width > 0 && (r.left < 0 || r.top < 0 || r.right > window.innerWidth || r.bottom > window.innerHeight);
  }).map(b => b.id || b.getAttribute('data-id')));
  say(off.length === 0, tag + '  nothing tappable is off the screen' + (off.length ? ': ' + off.join(', ') : ''));

  /* ⛔ THE LAND IS NOT A PIECE OF CARDBOARD, AND THE HAND IS NOT EMPTY. Both are
     on the thin list and both are read off the CANVAS, because a silhouette can
     be the right shape and still be a flat ruled edge, and a stone can be
     "picked" in the state and painted nowhere. */
  await dev(() => window.GERPLUNK_DEV.setYaw(-20));
  await waitFrames(page, 4);
  const edge = await dev(() => window.GERPLUNK_DEV.landEdge());
  say(edge.n >= 12, tag + '  the point is on the screen to be measured (' + edge.n + ' columns)');
  /* ⛔ TURNS, and the band is MEASURED. A steep diagonal steps by two pixels a
     column all on its own, so counting steps gave 29 with the trees and 20
     without, which is too narrow to hold anything; a diagonal never changes
     DIRECTION and a treeline changes it at every tree. With the point wooded it
     turns 8 to 10 times, and with `drawPointTrees` taken out, 4 at both sizes.
     Six is the line between them and the margin is real either way. */
  say(edge.turns >= 6, tag + '  and its skyline changes direction ' + edge.turns
    + ' times, so it is a wooded point and not a ruled edge (' + edge.steps + ' steps)');
  /* ⛔ THE POINT IS A LANDFORM AND NOT A BRIDGE (2026-09-08). His words: "the
     blackland on the left ... a black strip that if I turn it all it almost
     looks like it's a bridge." A7 closed "the paper cutout land" with the
     `turns` law above and the shots after A7 still showed a wedge, because a
     wedge with a fringe on one edge turns eight times and the law was green
     over it. Three laws here, the first two read off ONE instant painted twice,
     with the land and without it (GERPLUNK_DEV.landInk, D44's palm lesson), so
     no colour is named and deep water cannot pass for land:
     (1) THE BRIDGE LAW. Turned all the way into the lee, no strip of land OVER
         WATER in the bar's own rows spans more than 55 percent of the width. A
         bridge is land with water under it, which is why the columns are
         qualified: the point's trees cross the bar's rows too, and they stand
         on land, and counting them read 48 percent at 375 with nothing wrong.
         The old wedge: 89 percent at 412. The bar: 24.
     (2) THE SILHOUETTE LAW. The land's outline between the horizon and the
         shore changes direction at least SIX times per hundred pixels of
         outline: a treeline turns at every tree, a ruled edge never does, and a
         ratio holds at 320 as it does at 412 where a count could not. The old
         wedge measured under three at both stances; the point measures over
         nine. Judged wherever there is a hundred pixels of outline to judge.
     (3) THE SEAM LAW. At every quarter degree of the stance the drawing's
         answer (landLine: is the throw line on the bar at sixteen metres) is
         the model's (faceOf: is this the lee). Two producers, one question. */
  const outline = (ink) => {
    let turns = 0, span = 0, prev = 0, last = null;
    for (const c of ink.top) {
      const ok = c.y > ink.hy + 3 && c.y < ink.sy - 10;
      if (!ok) { last = null; prev = 0; continue; }
      if (last !== null) {
        const dy = c.y - last;
        span += ink.step;
        if (Math.abs(dy) > 20) prev = 0;
        else if (dy !== 0) { if (prev !== 0 && (dy > 0) !== (prev > 0)) turns++; prev = dy; }
      }
      last = c.y;
    }
    return { turns, span, per100: span > 0 ? turns / span * 100 : 0 };
  };
  for (const yaw of [-25, -18]) {
    await dev((y) => window.GERPLUNK_DEV.setYaw(y), yaw);
    await waitFrames(page, 3);
    const ink = await dev(() => window.GERPLUNK_DEV.landInk());
    const o = outline(ink);
    if (yaw === -25) {
      say(ink.strip > 0 && ink.stripFrac <= 0.55, tag + '  turned all the way into the lee, the land over water in the bar\'s rows is a bar and not a bridge: '
        + ink.strip.toFixed(0) + ' px, ' + (ink.stripFrac * 100).toFixed(0) + '% of the width (all land there ' + ink.maxRun.toFixed(0) + ' px)');
    }
    if (o.span >= 100) {
      say(o.per100 >= 6, tag + '  at yaw ' + yaw + ' the land\'s outline changes direction ' + o.per100.toFixed(1)
        + ' times per 100 px (' + o.turns + ' over ' + o.span.toFixed(0) + ' px), a treeline and not a ruled edge');
    } else {
      console.log('        (at yaw ' + yaw + ' there is ' + o.span.toFixed(0) + ' px of outline, under the hundred the law needs)');
    }
  }
  const seam = await dev(() => {
    const out = [];
    for (let y = -25; y <= 25; y += 0.25) {
      const l = window.GERPLUNK_DEV.landLine(y), f = window.GERPLUNK_DEV.face(y);
      if (l.covers !== (f.face === 'lee')) out.push(y + ': drawn ' + (l.covers ? 'on the bar' : 'clear') + ', model ' + f.face);
    }
    return out;
  });
  say(seam.length === 0, tag + '  at every quarter degree of the stance the throw line is on the drawn bar exactly when the model says lee'
    + (seam.length ? ' (' + seam.length + ' disagree, first ' + seam[0] + ')' : ' (201 stances)'));
  await dev(() => window.GERPLUNK_DEV.setYaw(-20));
  await waitFrames(page, 3);
  /* ⛔ THERE IS NO ASSERTION ON `steps` AND THERE WAS ONE. With the trees it
     counts 30, 28 and 23 at the three sizes and without them 20, 21 and 19: at
     320 the two bands are one apart, so a floor there would have been a line
     that goes red on a slow frame and never on a real regression. The number is
     printed because it is worth reading; only `turns` is asserted, because only
     `turns` separates. */
  /* ⛔ THE STONE IS PROVED BY A DIFFERENTIAL, AND TWO PROBES DIED TO GET HERE.
     The first asked whether the palm's pixels were WARM. The threshold was read
     off the canvas honestly, but off SANDSTONE, whose outer gradient stop is
     78,61,40; five of the eight stones are neutral greys or green, and the lake
     hands you skimmer, whose outer stop is 47,44,40. So on 2026-09-07 this whole
     gate went red at all three sizes with NOT ONE LINE OF THE GAME CHANGED, and
     the game had been drawing the stone perfectly the whole time.
     The second asked whether the pixels lay on the current stone's OWN three
     gradient stops, read live out of STONE_LOOK, which sounds unimpeachable and
     is worse: a grey stone's stops are a line down the middle of the RGB cube,
     so it matched a screen with no palm on it at all, at thirty three pixels.
     ⛔ SO NO COLOUR IS NAMED HERE. The same frame is shot twice, once with the
     stone and once with it set aside, with the hand, the water, the camera and
     the light all unchanged, and the longest run of pixels that MOVED is the
     stone. Watched: 34 px with it, and 0 with `drawPalm`'s stone block cut out. */
  const dpr = await dev(() => window.devicePixelRatio);
  const withStone = await dev(() => window.GERPLUNK_DEV.palmInk());
  await dev(() => window.GERPLUNK_DEV.palmStone(false));
  await waitFrames(page, 3);
  const noStone = await dev(() => window.GERPLUNK_DEV.palmInk());
  await dev(() => window.GERPLUNK_DEV.palmStone(true));
  await waitFrames(page, 3);
  const moved = (a, b) => { let run = 0, best = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      const d = Math.abs(a[i][0] - b[i][0]) + Math.abs(a[i][1] - b[i][1]) + Math.abs(a[i][2] - b[i][2]);
      if (d > 24) { run++; if (run > best) best = run; } else run = 0;
    } return best / dpr; };
  const palm = { run: Math.round(moved(withStone.col, noStone.col)), stone: withStone.stone };
  say(palm.run >= 24, tag + '  the stone you picked is IN YOUR HAND on the screen ('
    + palm.run + ' px of ' + palm.stone + ' down the middle of the palm, and nothing else in the frame moved)');

  /* and it goes when the stone goes. ⛔ a release that came out slow is a set
     down, not a throw, so the throw is watched and tried again rather than
     believed: at 375 the first attempt reads as a set down about one run in
     three under swiftshader. */
  const lay = await dev(() => window.GERPLUNK_DEV.layout());
  let flew = false;
  for (let go = 0; go < 4 && !flew; go++) {
    await flick(page, stroke({ x0: Math.round(lay.W * 0.32), y0: Math.round(lay.H * 0.72),
      arc: 340, ms: 160, rise: 0.55, hook: 0.7, n: 14 }));
    flew = await page.waitForFunction(() => window.GERPLUNK_DEV.state().inFlight, { timeout: 8000 })
      .then(() => true).catch(() => false);
  }
  await waitFrames(page, 3);
  say(flew, tag + '  a real flick put the stone in the air so the hand can be looked at');
  /* ⛔ AND IT GOES WHEN THE STONE GOES, measured the same way and against the
     SAME column, so the two numbers are comparable. In the air `drawPalm`
     returns before it paints anything, so setting the stone aside changes
     nothing at all and the run collapses.
     ⛔⛔ AND THE STONE HAS TO STILL BE IN THE AIR AT BOTH SAMPLES. This read 20
     px on the fleet sweep of 2026-09-07 and 0, 1 and 3 on three runs alone
     minutes later, with nothing in the game changed: a short throw can SINK
     between the two reads, and the moment it does the palm has the next stone
     back in it and the differential is measuring a full hand while the sentence
     says empty. The flight is watched across both samples now and the whole
     thing is thrown again if it ended early, which is the same rule the lob
     assertion in test/flick.mjs already lives by. A gate that names a state has
     to hold that state while it measures. */
  /* ⛔⛔ BOTH PICTURES FROM ONE INSTANT. This used to take the two samples from
     two real frames with a wait between them, and on a busy box a short throw
     can SINK in that gap: the palm has the next stone back in it and the
     differential measures a full hand while the sentence says empty. It read 20
     px on the fleet sweep of 2026-09-07 and 0, 1 and 3 on three runs alone
     minutes later with nothing in the game changed. `palmInkPair` draws the same
     instant twice, with the stone and with it set aside, and steps nothing in
     between, so there is no gap for the stone to land in. It also says whether
     the stone was in the air when it looked, which is the state this sentence
     is about. */
  const pair = await dev(() => window.GERPLUNK_DEV.palmInkPair());
  const airRun = Math.round(moved(pair.withStone.col, pair.without.col));
  say(flew && pair.inFlight, tag + '  the stone was still in the air when the hand was looked at');
  say(flew && pair.inFlight && airRun < 10,
    tag + '  and the hand is empty while the stone is in the air (' + airRun
    + ' px against ' + palm.run + ')');
  await page.waitForFunction(() => window.GERPLUNK_DEV.state().sunk, { timeout: 30000 }).catch(() => {});
  await waitFrames(page, 3);

  /* the sheet */
  await tap(page, '#btnMenu');
  await page.waitForFunction(() => window.GERPLUNK_DEV.screen() === 'sheet', { timeout: 15000 });
  await check('#btnSound', 'SOUND', 56);
  await check('#btnMotion', 'MOTION', 56);
  /* HOW TO THROW (call 57) sits between the two paragraphs and DAILY LAKE,
     nowhere near the chip's corners, and the sheet is a full screen so the
     chip's seat is not on it; the law here is the same as its neighbours' */
  await check('#btnHow', 'HOW TO THROW', 56);
  await check('#btnDaily', 'DAILY LAKE', 56);
  await check('#btnBack', 'BACK TO THE LAKE', 56);
  await check('#btnExit', 'LEAVE THE LAKE', 56);
  /* ⛔ THE SHEET'S TOP IS NOT CLIPPED. A centred flex column that overflows
     hides its own first rows (a fleet scar), and with five buttons and two
     paragraphs the sheet is taller than a 568 px screen; the title is the
     first thing on it, so the title is where the clip would show. */
  const sheetTop = await dev(() => { const r = document.querySelector('#scrSheet h2').getBoundingClientRect(); return { top: r.top, h: r.height }; });
  say(sheetTop.h > 10 && sheetTop.top >= 0, tag + '  the sheet\'s title is on the screen and not clipped off its top (' + sheetTop.top.toFixed(0) + ' px down)');
  await tap(page, '#btnBack');
  await page.waitForFunction(() => window.GERPLUNK_DEV.screen() === 'lake', { timeout: 15000 });
  say(true, tag + '  BACK returns to the lake');

  await browser.close();
}

close();
console.log('');
if (fails.length) { console.log(fails.length + ' LAYOUT FAILURE(S)'); process.exit(1); }
console.log('LAYOUT OK');
