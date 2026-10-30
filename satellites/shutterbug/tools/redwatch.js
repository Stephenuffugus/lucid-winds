'use strict';
/* Red watch: every check watched failing, mechanically (BUILD-PLAN.md section 5.5).
 *
 *   node tools/redwatch.js                  every mutant that needs no browser, then the table
 *   node tools/redwatch.js NAME [NAME..]    only those
 *   node tools/redwatch.js --browser        also the browser mutants (each serves its copy through SB_PAGE and runs
 *                                           the one browser gate it names; one Chrome at a time)
 *   node tools/redwatch.js --browser-only   only the browser mutants
 *   node tools/redwatch.js --check          the gate form tools/check.js runs: exit 0 iff every row has its expected
 *                                           result (every mutant RED, NOOP stayed green) and REDWATCH OK is printed
 *
 * A mutant is a name, the file it breaks (the page, or harness.js for a harness only mutant), a find (it must match
 * exactly once in the current file, or the row is ANCHOR LOST: the mutant has drifted from the code it breaks) and a
 * replacement, and the gates that must fail with the text each failure must name. A row is RED only when the gate
 * fails AND names that text; a gate that fails for some other reason is WRONG REASON, and one that passes STAYED
 * GREEN. NOOP changes nothing and must stay green: the tool proves it can see a green. Without --check the exit is
 * nonzero when any mutant stayed green, NOOP included (so `node tools/redwatch.js NOOP` exits nonzero by design). */
const fs = require('node:fs'), path = require('node:path'), { spawnSync } = require('node:child_process');

const GAME = path.join(__dirname, '..');
const OUT = '/tmp/claude-1000/shutterbug-redwatch';
const BROWSER = new Set(['boot', 'play', 'input', 'layout', 'reveal', 'capture', 'sprites', 'make', 'loot', 'audio', 'share', 'save', 'pwa', 'loop', 'onboard']);

const CORE_SIM_OPEN = "<script id=\"core-sim\" data-core>\n(function (SB) { 'use strict';\n";

/* One row per mutant, grouped by the task that added it. `only` narrows the harness to the group that must fail. */
const MUTANTS = [
  { name: 'NOOP', task: 'T0.3', file: 'page', find: null, repl: null, gates: [{ gate: 'harness', only: 'H-core', expect: null }] },

  { name: 'PURITY_DATE', task: 'T0.2', file: 'page', find: CORE_SIM_OPEN, repl: CORE_SIM_OPEN + '  SB.t0 = Date.now();\n',
    gates: [{ gate: 'lint', expect: 'forbidden token "Date"' }, { gate: 'harness', only: 'H-core', expect: 'core touched Date' }] },
  { name: 'INCLUDE_MISSING', task: 'T0.2', file: 'page', find: '<script src="/music-unlocks.js" defer></script>\n', repl: '',
    gates: [{ gate: 'lint', expect: 'the fleet include appears 0 times' }] },
  { name: 'STYLE_COMMENT_EATS', task: 'T0.2', file: 'page', find: '#exit { align-self', repl: '/* the exit control\n#exit { align-self',
    gates: [{ gate: 'lint', expect: '"/*" against' }, { gate: 'boot', expect: '412x915: #exit measures' }] },
  { name: 'EXIT_UNCALLED', task: 'T0.2', file: 'page', find: '      window.SWS_EXIT();\n', repl: '',
    gates: [{ gate: 'boot', expect: 'journey A: a real touch on the exit returned' }] },
  { name: 'BUTTON_32PX', task: 'T0.2', file: 'page', find: '#choose { background: var(--paper); color: var(--ink); }',
    repl: '#choose { background: var(--paper); color: var(--ink); min-height: 32px; height: 32px; }',
    gates: [{ gate: 'boot', expect: '412x915: #choose measures' }] },

  { name: 'FNV_PRIME_FLIPPED', task: 'T0.3', file: 'page', find: 'FNV_PRIME = 0x01000193', repl: 'FNV_PRIME = 0x01000197',
    gates: [{ gate: 'harness', only: 'H-rng-1', expect: 'H-rng-1 fnv1a32Str("a")' }] },
  { name: 'B64_PAD', task: 'T0.3', file: 'page', find: "    return out;\n  }\n\n  /* null on any character", repl: "    return out + '=';\n  }\n\n  /* null on any character",
    gates: [{ gate: 'harness', only: 'H-rec-2', expect: 'share string length' }] },
  { name: 'NIBBLE_15_ACCEPTED', task: 'T0.3', file: 'page', find: '        if (hi === 15 || lo === 15) return null;\n', repl: '',
    gates: [{ gate: 'harness', only: 'H-rec-3', expect: 'decode refuses: a high nibble of 15' }] },

  /* the plan's rationale (the ramp breaks) does not hold: a grey ramp quantizes monotonically under either metric
     (measured 2026-10-30); the metrics disagree on 4368 of 20000 seeded colours, which is what H-pal-5's oracle sees */
  { name: 'QUANT_UNWEIGHTED', task: 'T0.4a', file: 'page', find: 'var dd = 30 * dr * dr + 59 * dg * dg + 11 * db * db;', repl: 'var dd = dr * dr + dg * dg + db * db;',
    gates: [{ gate: 'harness', only: 'H-pal-5', expect: "nearest equals the test's weighted distance" }] },

  { name: 'SAMPLE_ROOM_DRIFT', task: 'T0.5', file: 'page', find: "SB.SAMPLE_ROOM = Object.freeze([\n    '444444444442244444444444'",
    repl: "SB.SAMPLE_ROOM = Object.freeze([\n    '444444444442244444444445'",
    gates: [{ gate: 'harness', only: 'H-fix-2', expect: "SB.SAMPLE_ROOM rows equal the fixture's rows" }] },
  { name: 'EXPECT_MISSING', task: 'T0.5', file: 'fixture:synthetic/blank-wall.json', find: '  "expect": {', repl: '  "expected_by_nobody": {',
    gates: [{ gate: 'harness', only: 'H-fix', expect: 'has no expect (authored by hand from its design): the loader refuses it' }] },

  { name: 'OTSU_UNCLAMPED', task: 'T0.6', file: 'page', find: '    return Math.max(T.OTSU_MIN, Math.min(T.OTSU_MAX, bestT));', repl: '    return bestT;',
    gates: [{ gate: 'harness', only: 'H-pipe-3', expect: "all-dark: threshold 29 inside DESIGN 6.3's clamp" }] },
  { name: 'CA_ONE_PASS', task: 'T0.6', file: 'page', find: 'for (var pass = 0; pass < T.SMOOTH_PASSES; pass++)', repl: 'for (var pass = 0; pass < 1; pass++)',
    gates: [{ gate: 'harness', only: 'H-pipe-2', expect: 'isolated cells after smoothing (under 10%)' }] },
  { name: 'RUN_MIN_2', task: 'T0.6', file: 'page', find: 'if (x1 - x + 1 >= T.PLATFORM_RUN_MIN)', repl: 'if (x1 - x + 1 >= 2)',
    gates: [{ gate: 'harness', only: 'H-pipe-4', expect: 'lab: a 2 wide lit plank makes no platform' }] },
  { name: 'FLOOR_NOT_FORCED', task: 'T0.6', file: 'page', find: 'for (x = 0; x < w; x++) { solid[(h - 1) * w + x] = 1; solid[x] = 0; }', repl: 'for (x = 0; x < w; x++) { solid[x] = 0; }',
    gates: [{ gate: 'harness', only: 'H-pipe-1', expect: 'bottom row solid' }] },
  { name: 'NEG_AFTER_PLATFORMS', task: 'T0.6', file: 'page', edits: [
      ['    if (negative) for (i = 0; i < n; i++) solid[i] = solid[i] ? 0 : 1;   /* after smoothing, before the frame rules (Q20) */\n', ''],
      ['    /* landmarks are the photo\'s things:', '    if (negative) { for (i = 0; i < n; i++) solid[i] = solid[i] ? 0 : 1; for (x = 0; x < w; x++) { solid[(h - 1) * w + x] = 1; solid[x] = 0; } }\n    /* landmarks are the photo\'s things:']],
    gates: [{ gate: 'harness', only: 'H-pipe-7', expect: 'Negative platforms are found on the inverted grid' }] },

  { name: 'JUMP_V_LOW', task: 'T0.7a', file: 'page', find: 'JUMP_V: 8.59375 /* 2200/256 */', repl: 'JUMP_V: 8.1640625 /* 2090/256, 5% low */',
    gates: [{ gate: 'harness', only: 'H-sim-1', expect: 'a full hold from rest peaks at' }] },
  { name: 'GRAVITY_X2', task: 'T0.7a', file: 'page', find: 'GRAVITY: 0.5, JUMP_V', repl: 'GRAVITY: 1, JUMP_V',
    gates: [{ gate: 'harness', only: 'H-sim-1', expect: 'a full hold from rest peaks at' }] },

  { name: 'ACCUMULATOR_DT_FLOAT', task: 'T0.8a', file: 'page', find: 'while (acc >= STEP_MS && n < MAX_STEPS) { stepOnce(); acc -= STEP_MS; n++; loop.accSteps++; }',
    repl: 'if (acc > 0) { stepOnce(); loop.dropped += acc - STEP_MS; acc = 0; n++; loop.accSteps++; }',
    /* one step per frame whatever the frame owes: the test's own replay of the logged frames disagrees frame by frame
       (the rate checks it was first watched on became that replay in the second review) */
    gates: [{ gate: 'play', expect: ['frame by frame the page ran the steps the accumulator owes', 'the loop ran exactly the steps the accumulator owes'] }] },
  { name: 'CLEAR_NO_RESTART', task: 'T0.8a', file: 'page', find: "  ui.again = function () { if (G.record) ui.startRoom(G.record, G.name); };",
    repl: "  ui.again = function () { if (G.record) { var keep = document.getElementById('clear').className; ui.startRoom(G.record, G.name); document.getElementById('clear').className = keep; } };",
    gates: [{ gate: 'play', expect: 'Again leaves nothing painted over the play area' }] },

  /* the review of 30 Oct (fidelity lens) */
  { name: 'FLOOR_IS_LANDMARK', task: 'T0.8a review', file: 'page',
    find: "    var body = solid.slice();\n    for (x = 0; x < w; x++) body[(h - 1) * w + x] = 0;\n    var comps = components(body, w, h), landmarks = [];",
    repl: '    var comps = components(solid, w, h), landmarks = [];',
    gates: [{ gate: 'harness', only: 'H-pipe-5', expect: 'three separate blocks standing on the floor are three landmarks' }] },
  { name: 'BEACON_RELIT_ANYWHERE', task: 'T0.8a review', file: 'page',
    find: 'cells: light && exit >= 0 && light.indexOf(exit) >= 0 ? Int32Array.from(light)', repl: 'cells: light ? Int32Array.from(light)',
    gates: [{ gate: 'harness', only: 'H-pipe-12', expect: 'the lamp stays backdrop' }] },
  { name: 'LIGHT_BY_SUM', task: 'T0.8a review', file: 'page',
    find: 'var peak = 0; for (var q = 0; q < lights[i].length; q++) if (L[lights[i][q]] > peak) peak = L[lights[i][q]];',
    repl: 'var peak = 0; for (var q = 0; q < lights[i].length; q++) peak += L[lights[i][q]];',
    gates: [{ gate: 'harness', only: 'H-pipe-12', expect: 'a 3x2 Glare lamp beats a bigger 6x3 Paper patch' }] },
  { name: 'AIR_KEEPS_MOMENTUM', task: 'T0.8a review', file: 'page',
    find: '    else if (h.vx > 0) h.vx = Math.max(0, h.vx - K.DECEL);\n    else if (h.vx < 0) h.vx = Math.min(0, h.vx + K.DECEL);',
    repl: '    else if (h.vx > 0 && h.ground) h.vx = Math.max(0, h.vx - K.DECEL);\n    else if (h.vx < 0 && h.ground) h.vx = Math.min(0, h.vx + K.DECEL);',
    gates: [{ gate: 'harness', only: 'H-sim-18', expect: 'releasing the rocker in flight decelerates in 4 frames' }] },

  /* the review of 30 Oct (harness lens) */
  { name: 'EXIT_EARLY', task: 'T0.8a review', file: 'page', find: 'if (h.x < (ex + 1) * CS2 && h.x + K.HERO_W_SUB > ex * CS2 && h.y < (ey + 1) * CS2 && h.y + K.HERO_H_SUB > ey * CS2) {',
    repl: 'if (h.y < (ey + 4) * CS2) {',
    gates: [{ gate: 'harness', only: 'H-sim-20', expect: 'the room clears on exactly the first step the box overlaps the exit cell' },
      { gate: 'play', expect: 'one step before the lamp the room is not yet clear' }] },
  { name: 'BONK_KEEPS_VY', task: 'T0.8a review', file: 'page', find: "        else { h.y = (hr + 1) * CS; h.vy = 0; h.rising = 0; }   /* the head bonk */",
    repl: "        else { h.y = (hr + 1) * CS; h.rising = 0; }   /* the head bonk */",
    gates: [{ gate: 'harness', only: 'H-sim-5', expect: 'the head meets the ceiling' }] },
  { name: 'COYOTE_AFTER_JUMP', task: 'T0.8a review', file: 'page', find: 'h.vy = -K.JUMP_V; h.ground = 0; h.rising = 1; h.coyote = 0; h.buffer = 0; jumped = 1;',
    repl: 'h.vy = -K.JUMP_V; h.ground = 0; h.rising = 1; h.buffer = 0; jumped = 1;',
    gates: [{ gate: 'harness', only: 'H-sim-2b', expect: 'gives no second upward kick' }] },
  { name: 'ONEWAY_CATCHES_FROM_BELOW', task: 'T0.8a review', file: 'page', find: '      if (!landed && prevFeet <= top && feet > top) {',
    repl: '      if (!landed && feet > top) {',
    gates: [{ gate: 'harness', only: 'H-sim-4', expect: 'never catches the hero' }] },
  { name: 'EDGE_DROP_40', task: 'T0.8a review', file: 'page', find: 'PLATFORM_RUN_MIN: 3, EDGE_DROP_L: 60,', repl: 'PLATFORM_RUN_MIN: 3, EDGE_DROP_L: 40,',
    gates: [{ gate: 'harness', only: 'H-pipe-4', expect: "plat cells that differ from the test's own DESIGN 6.4" }] },
  { name: 'FIELDS_DROP_SPAWN', task: 'T0.8a review', file: 'page', find: "['spawn', 'i32'], ['exit', 'i32'], ['beacon.idx', 'i32'],", repl: "['beacon.idx', 'i32'],",
    gates: [{ gate: 'harness', only: 'H-pipe-8', expect: "pipeline.FIELDS is the plan's list" }] },
  { name: 'EXIT_ASSIGN_LOCAL', task: 'T0.8a review', file: 'page', find: '  window.SWS_EXIT = function () {\n    if (framed)', repl: '  var SWS_EXIT_GONE = function () {\n    if (framed)',
    gates: [{ gate: 'lint', expect: "the shell-fleet block is not byte for byte section 1.6's canonical block" }] },
  { name: 'TEMPLATE_HIDES_DATE', task: 'T0.8a review', file: 'page', find: CORE_SIM_OPEN, repl: CORE_SIM_OPEN + '  SB.stamp = function () { return `t${Date.now()}`; };\n',
    gates: [{ gate: 'lint', expect: 'forbidden token "Date"' }] },
  { name: 'MATH_ALIAS', task: 'T0.8a review', file: 'page', find: CORE_SIM_OPEN, repl: CORE_SIM_OPEN + '  var M = Math;\n',
    gates: [{ gate: 'lint', expect: 'a bare Math' }] },
  { name: 'LOOP_DOUBLE_SPEED', task: 'T0.8a review', file: 'page', find: 'var STEP_MS = 1000 / SB.TUNING.STEP_HZ', repl: 'var STEP_MS = 500 / SB.TUNING.STEP_HZ',
    gates: [{ gate: 'play', expect: 'the step is 16.667 ms' }] },
  { name: 'JOURNEY_A_REPLACES', task: 'T0.8a review', file: 'page', find: "    if (document.referrer.indexOf('/portal') >= 0 && history.length > 1) history.back();",
    repl: "    if (document.referrer.indexOf('/portal') >= 0 && history.length > 9) history.back();",
    gates: [{ gate: 'boot', expect: 'journey A: a real touch on the exit returned' }] },

  { name: 'SECOND_FINGER_RELEASES_FIRST', task: 'T0.8b', file: 'page', find: '        e.preventDefault();\n        ptrs[e.pointerId] = 1;',
    repl: '        e.preventDefault();\n        I.releaseAll();\n        ptrs[e.pointerId] = 1;',
    gates: [{ gate: 'play', expect: 'a second finger on A during a rocker hold: both register' }] },

  /* the second review (30 Oct, before sb-m0-2) */
  { name: 'HASH_SKIPS_RNG', task: 'T0.7b', file: 'page', find: "['frame', 'i32'], ['rng', 'u32'], ", repl: "['frame', 'i32'], ",
    gates: [{ gate: 'harness', only: 'H-sim-7', expect: 'state: the keys are exactly the declared list' }] },
  { name: 'ONEWAY_FROM_BELOW_BLOCKS', task: 'T0.7b', file: 'page', find: 'for (cx = cx0; cx <= cx1; cx++) if (solidAt(lv, cx, hr)) { any = true;',
    repl: 'for (cx = cx0; cx <= cx1; cx++) if (solidAt(lv, cx, hr) || platAt(lv, cx, hr)) { any = true;',
    /* dy 1 cannot see it (its one way is in the takeoff cell's own row, the head starts inside it): dy 2 is the first
       straight up jump through a one way */
    gates: [{ gate: 'harness', only: 'H-lab-1', expect: 'JUMP FULL right dx0 dy2 onto one way' }] },
  { name: 'FLOAT_LEAK', task: 'T0.7b', file: 'page', find: 'h.vy < -K.CUT_V) h.vy = -K.CUT_V;', repl: 'h.vy < -K.CUT_V) h.vy = -K.CUT_V / 3;',
    gates: [{ gate: 'harness', only: 'H-sim-8', expect: 'serialize never met a float' }] },
  { name: 'READY_NEVER_POSTED', task: 'T0.2b', file: 'page', edits: [
      ["    try { parent.postMessage({ sws: 'ready' }, '*'); } catch (e) {}", "    try { 0; } catch (e) {}"],
      ["function () { try { parent.postMessage({ sws: 'ready' }, '*'); } catch (e) {} });", "function () { try { 0; } catch (e) {} });"]],
    gates: [{ gate: 'boot', expect: 'journey C: framed' }] },
  { name: 'HI_PLUS_ONE', task: 'T0.10a', file: 'page', find: '      out.profiles[name] = { apex: apex, air: air, raw: raw, maxAcross: clip, cols: cols(K, a, air), paths: paths };',
    repl: "      if (name === 'FULL') clip[4] = 5;\n      out.profiles[name] = { apex: apex, air: air, raw: raw, maxAcross: clip, cols: cols(K, a, air), paths: paths };",
    gates: [{ gate: 'harness', only: 'H-reach-1', expect: 'FULL maxAcross: the core equals the oracle' }] },
  { name: 'LATCH_OFF', task: 'T0.9', file: 'page', find: "    if (!isHeld(verb) && (verb === 'A' || verb === 'B')) edge[verb]++;", repl: "    if (false) edge[verb]++;",
    gates: [{ gate: 'input', expect: 'a sub step tap on A (4 ms) is exactly one A_TAP' }] },
  { name: 'ZONE_FIXED_AT_DOWN', task: 'T0.9', file: 'page', find: "      rockerX[e.pointerId] = e.clientX;\n      if (rockerPtrs[0] === e.pointerId) setRocker(zoneOf(e.clientX));",
    repl: "      rockerX[e.pointerId] = e.clientX;",
    gates: [{ gate: 'input', expect: 'a slide from the left zone to the right zone without lifting switches the direction' }] },
  { name: 'CANVAS_100PCT', task: 'T0.9', file: 'page', find: "    canvas.style.width = R.cssW + 'px';", repl: "    canvas.style.width = '100%';",
    gates: [{ gate: 'layout', expect: '412x915: the canvas is' }] },
  { name: 'A_44PX', task: 'T0.9', file: 'page', find: '#btnA { right: calc(var(--sar) + var(--edge)); }', repl: '#btnA { right: calc(var(--sar) + var(--edge)); width: 44px; }',
    gates: [{ gate: 'layout', expect: '412x915: A measures' }] },
  { name: 'RESERVE_FILLED', task: 'T0.9', file: 'page', find: '#reserve { position: absolute; left: 0; bottom: 0; width: var(--res); height: var(--res); }',
    repl: '#reserve { position: absolute; left: 0; bottom: 0; width: var(--res); height: var(--res); background: #c8302f; }',
    gates: [{ gate: 'layout', expect: '412x915: the reserved box is transparent' }] },
  { name: 'MIRROR_OVERLAPS_CANVAS', task: 'T0.9', file: 'page', find: '#strip.mirror #rocker { left: calc(var(--res) + 2 * var(--btn)); right: calc(var(--sar) + var(--edge)); }',
    repl: '#strip.mirror #rocker { left: calc(var(--res) + 2 * var(--btn)); right: calc(var(--sar) + var(--edge)); top: -160px; }',
    gates: [{ gate: 'layout', expect: '412x915 mirrored: the rocker, A and B are disjoint and clear of the canvas' }] },
  { name: 'GLARE_DARKENED', task: 'T0.4b', file: 'page', find: "'f2efe6', 'fbfbff', '6b3f2a'", repl: "'f2efe6', '999999', '6b3f2a'",
    gates: [{ gate: 'harness', only: 'H-pal-2', expect: 'near whites (L > 235)' }, { gate: 'harness', only: 'H-pal-3', expect: 'the collision edge (Glare over Ink) clears 3:1' }] },
  { name: 'MAKE_RE_DRIFT', task: 'T0.5b', file: 'make', find: 'var CORE_RE = /^<script id="(core-[a-z]+)" data-core>', repl: 'var CORE_RE = /^<script id="(core-[a-z0-9]+)" data-core>',
    gates: [{ gate: 'lint', expect: 'fixtures/make.html holds CORE_RE' }] },
  { name: 'BITMAP_LEAK', task: 'T0.5b', file: 'page', find: "    if (typeof src.close === 'function') src.close();", repl: "    if (typeof src.close === 'function') src = null;",
    gates: [{ gate: 'lint', expect: 'release() never closes the bitmap' }] },
  { name: 'CAPTURE_BGR', task: 'T0.5b', file: 'page', find: 'rgb[j] = d[i]; rgb[j + 1] = d[i + 1]; rgb[j + 2] = d[i + 2];', repl: 'rgb[j] = d[i + 2]; rgb[j + 1] = d[i + 1]; rgb[j + 2] = d[i];',
    gates: [{ gate: 'make', expect: 'H-cap-1: the canvas path on the gradient is within 2 per channel' }] },
  { name: 'OVERLAY_NO_HASH', task: 'T0.5b', file: 'make', find: "      ox.fillStyle = '#' + SB.palette.HEX[parseInt(rows[y][x], 16)];", repl: "      ox.fillStyle = SB.palette.HEX[parseInt(rows[y][x], 16)];",
    gates: [{ gate: 'make', expect: 'the 24x48 overlay draws the saved room as built' }] },
  { name: 'CROP_SHADOW_UNCLIPPED', task: 'T0.5b', file: 'make', find: ' overflow: hidden; }   /* the crop box', repl: ' }   /* the crop box',
    gates: [{ gate: 'make', expect: 'on screen the overlay shows each open cell in its palette colour' }] },
  { name: 'MAX_STEPS_1', task: 'T0.8b review', file: 'page', find: 'MAX_STEPS = 4, DT_MAX = 100', repl: 'MAX_STEPS = 1, DT_MAX = 100',
    gates: [{ gate: 'play', expect: 'the loop ran exactly the steps the accumulator owes' }] },
  { name: 'DT_MAX_20', task: 'T0.8b review', file: 'page', find: 'MAX_STEPS = 4, DT_MAX = 100', repl: 'MAX_STEPS = 4, DT_MAX = 20',
    gates: [{ gate: 'play', expect: 'the loop ran exactly the steps the accumulator owes' }] },
  { name: 'SLIDE_KEEPS_OLD', task: 'T0.8b review', file: 'page', find: "      if (rockerVerb) I.release(rockerVerb, 'rocker');", repl: "      if (rockerVerb && !v) I.release(rockerVerb, 'rocker');",
    gates: [{ gate: 'play', expect: 'the slide: moved to the right zone without lifting it is right' }] },
  { name: 'GAP_IS_LEFT', task: 'T0.8b review', file: 'page', find: "      if (x < a.right) return 'L';", repl: "      if (x < b.left) return 'L';",
    gates: [{ gate: 'play', expect: 'the slide: moved into the neutral gap it is nothing' }] },
  { name: 'FITS2_NO_STRIP', task: 'T0.8b review', file: 'page', find: 'var fits2 = avail >= T.TOP_STRIP + T.VIEW_ROWS_MIN * K.CELL * 2 + T.CONTROL_STRIP;',
    repl: 'var fits2 = avail >= T.TOP_STRIP + T.VIEW_ROWS_MIN * K.CELL * 2;',
    gates: [{ gate: 'play', expect: '1366x843: the canvas is 1x, 384 CSS px wide' }] },
  { name: 'CANVAS_TAKES_POINTERS', task: 'T0.8b review', file: 'page', find: 'pointer-events: none; background: var(--ink); }', repl: 'background: var(--ink); }',
    gates: [{ gate: 'play', expect: 'Again leaves nothing painted over the play area' }] },
  { name: 'STRIP_KEEPS_PRESSED', task: 'T0.8b review', file: 'page', find: "  I.releaseAll = function () { down = { L: {}, R: {}, A: {}, B: {} }; if (I._stripReset) I._stripReset(); };",
    repl: "  I.releaseAll = function () { down = { L: {}, R: {}, A: {}, B: {} }; };",
    gates: [{ gate: 'play', expect: 'the same thumb moved inside its zone after the blur presses right again' }] },
  { name: 'TITLE_UNDER_ROCKER', task: 'T0.8b review', file: 'page', find: 'left: calc(6px + var(--sal)); z-index: 2; min-width: 64px;', repl: 'left: calc(6px + var(--sal)); min-width: 64px;',
    gates: [{ gate: 'play', expect: '320x568 default: Title is' }] },
  { name: 'EXIT_HIGHEST_INDEX', task: 'T0.8b review', file: 'page', find: 'if (light) for (q = 0; q < light.length; q++) if (standable(light[q]) && (exit < 0 || Math.floor(light[q] / w) > Math.floor(exit / w))) exit = light[q];', repl: 'if (light) for (q = light.length - 1; q >= 0 && exit < 0; q--) if (standable(light[q])) exit = light[q];',
    gates: [{ gate: 'harness', only: 'H-pipe-12', expect: "sample-room: the exit equals the test's own rule" }] },
  { name: 'PHASE_ZERO', task: 'T0.8b review', file: 'page', find: '  var PHASE = STEP_MS / 4;', repl: '  var PHASE = 0;',
    gates: [{ gate: 'play', expect: 'frame by frame the page ran the steps the accumulator owes' }] },
  { name: 'ROCKER_NO_ADOPT', task: 'T0.8b review', file: 'page', find: '      setRocker(rockerPtrs.length ? zoneOf(rockerX[rockerPtrs[0]]) : null);', repl: '      setRocker(null);',
    gates: [{ gate: 'play', expect: 'the first lifted, the pointer still down takes the rocker' }] },
  { name: 'CHIP_OVER_PLAY', task: 'T0.8b review', file: 'page', find: "    document.body.classList.toggle('playing', name === 'play');", repl: '',
    gates: [{ gate: 'play', expect: "in play the fleet's chip, pill, card and toast are hidden" }] },
  { name: 'BEACON_PULSE_BY_FRAME', task: 'T0.8b review', file: 'page', find: 'pulse = ((now === undefined ? performance.now() : now) / 400) | 0;', repl: 'pulse = (pulse + 1) | 0;',
    gates: [{ gate: 'play', expect: 'the beacon pulses by the clock' }] },
  { name: 'LIGHT_TIE_TO_SMALLER', task: 'T0.8b review', file: 'page', find: 'if (peak > bestPeak) { bestPeak = peak; light = lights[i]; }', repl: 'if (peak >= bestPeak) { bestPeak = peak; light = lights[i]; }',
    gates: [{ gate: 'harness', only: 'H-pipe-12', expect: 'two clusters that both peak at Glare' }] },
  { name: 'EXIT_ROWS_5', task: 'T0.8b review', file: 'page', find: 'SPAWN_ROW_FROM_BOTTOM: 2, EXIT_ROWS: 4,', repl: 'SPAWN_ROW_FROM_BOTTOM: 2, EXIT_ROWS: 5,',
    gates: [{ gate: 'harness', only: 'H-pipe-12', expect: 'a Glare lamp in row 4, under the top four rows, is not the light' }] },
  { name: 'EXIT_FALLBACK_DARKEST', task: 'T0.8b review', file: 'page', find: 'if (standable(c2) && (bl < 0 || L[c2] > L[bl])) bl = c2;', repl: 'if (standable(c2) && (bl < 0 || L[c2] < L[bl])) bl = c2;',
    gates: [{ gate: 'harness', only: 'H-pipe-12', expect: 'with no light, the exit is the brightest standable cell' }] },
  { name: 'EDGE_GE', task: 'T0.8b review', file: 'page', edits: [
      ['if (!solid[a] && !solid[b] && L[a] - L[b] > T.EDGE_DROP_L) {', 'if (!solid[a] && !solid[b] && L[a] - L[b] >= T.EDGE_DROP_L) {'],
      ['L[y * w + x1 + 1] - L[(y + 1) * w + x1 + 1] > T.EDGE_DROP_L) x1++;', 'L[y * w + x1 + 1] - L[(y + 1) * w + x1 + 1] >= T.EDGE_DROP_L) x1++;']],
    gates: [{ gate: 'harness', only: 'H-pipe-4', expect: 'a drop of exactly 60, is no platform' }] },
  { name: 'CC8', task: 'T0.8b review', file: 'page', find: "        if (y < h - 1 && mask[c + w] && !seen[c + w]) { seen[c + w] = 1; stack.push(c + w); }",
    repl: "        if (y < h - 1 && mask[c + w] && !seen[c + w]) { seen[c + w] = 1; stack.push(c + w); }\n        if (x < w - 1 && y < h - 1 && mask[c + w + 1] && !seen[c + w + 1]) { seen[c + w + 1] = 1; stack.push(c + w + 1); }\n        if (x > 0 && y < h - 1 && mask[c + w - 1] && !seen[c + w - 1]) { seen[c + w - 1] = 1; stack.push(c + w - 1); }",
    gates: [{ gate: 'harness', only: 'H-pipe-5', expect: 'two blocks meeting only at a corner are two landmarks' }] },
  { name: 'EXIT_ROW_EARLY_1', task: 'T0.8b review', file: 'page', find: 'if (h.x < (ex + 1) * CS2 && h.x + K.HERO_W_SUB > ex * CS2 && h.y < (ey + 1) * CS2 && h.y + K.HERO_H_SUB > ey * CS2) {',
    repl: 'if (h.x < (ex + 1) * CS2 && h.x + K.HERO_W_SUB > ex * CS2 && h.y < (ey + 2) * CS2 && h.y + K.HERO_H_SUB > ey * CS2) {',
    gates: [{ gate: 'harness', only: 'H-sim-20', expect: "the head exactly at the exit cell's bottom edge" }] },
  { name: 'EXIT_TOUCH_X', task: 'T0.8b review', file: 'page', find: 'if (h.x < (ex + 1) * CS2 && h.x + K.HERO_W_SUB > ex * CS2 && h.y < (ey + 1) * CS2 && h.y + K.HERO_H_SUB > ey * CS2) {',
    repl: 'if (h.x < (ex + 1) * CS2 && h.x + K.HERO_W_SUB >= ex * CS2 && h.y < (ey + 1) * CS2 && h.y + K.HERO_H_SUB > ey * CS2) {',
    gates: [{ gate: 'harness', only: 'H-sim-20', expect: 'the box exactly beside the exit cell' }] },
  { name: 'EXIT_TOUCH_Y', task: 'T0.8b review', file: 'page', find: 'if (h.x < (ex + 1) * CS2 && h.x + K.HERO_W_SUB > ex * CS2 && h.y < (ey + 1) * CS2 && h.y + K.HERO_H_SUB > ey * CS2) {',
    repl: 'if (h.x < (ex + 1) * CS2 && h.x + K.HERO_W_SUB > ex * CS2 && h.y <= (ey + 1) * CS2 && h.y + K.HERO_H_SUB > ey * CS2) {',
    gates: [{ gate: 'harness', only: 'H-sim-20', expect: "the head exactly at the exit cell's bottom edge" }] },
  { name: 'TEMPLATE_BRACE_IN_STRING', task: 'T0.8b review', file: 'page', find: CORE_SIM_OPEN, repl: CORE_SIM_OPEN + "  SB.stamp = function () { return `${'}' + Date.now()}`; };\n",
    gates: [{ gate: 'lint', expect: 'forbidden token "Date"' }] },
  { name: 'CTOR_CTOR', task: 'T0.8b review', file: 'page', find: CORE_SIM_OPEN, repl: CORE_SIM_OPEN + "  SB.roll = function () { return [].constructor.constructor('return 1')(); };\n",
    gates: [{ gate: 'lint', expect: 'forbidden token "constructor"' }] }
];

/* ---------------------------------------------------------------- run */
const args = process.argv.slice(2);
const CHECK = args.includes('--check'), WITH_BROWSER = args.includes('--browser'), BROWSER_ONLY = args.includes('--browser-only');
const names = args.filter(a => !a.startsWith('--'));
const unknown = names.filter(n => !MUTANTS.some(m => m.name === n));
if (unknown.length) { console.log('no mutant named ' + unknown.join(', ')); process.exit(2); }
const isBrowserRow = g => BROWSER.has(g.gate);

fs.mkdirSync(OUT, { recursive: true });
const rows = [];
for (const m of MUTANTS) {
  if (names.length && !names.includes(m.name)) continue;
  const gates = m.gates.filter(g => names.length ? true : BROWSER_ONLY ? isBrowserRow(g) : WITH_BROWSER ? true : !isBrowserRow(g));
  if (!gates.length) continue;
  const dir = path.join(OUT, m.name);
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  /* the copy: the page, a harness tree whose harness.js is the mutated one (tools/ and fixtures/ linked), or a copy
     of the corpus with one fixture file mutated (file 'fixture:<path under fixtures/>') */
  const isFixture = m.file.startsWith('fixture:');
  const fixCopy = path.join(dir, 'fixtures');
  if (isFixture) fs.cpSync(path.join(GAME, 'fixtures'), fixCopy, { recursive: true });
  const srcFile = m.file === 'harness' ? path.join(GAME, 'harness.js') : isFixture ? path.join(fixCopy, m.file.slice(8))
    : m.file === 'make' ? path.join(GAME, 'fixtures', 'make.html') : path.join(GAME, 'index.html');
  const text = fs.readFileSync(srcFile, 'utf8');
  let mutated = text, anchor = 'ok';
  const edits = m.edits || (m.find !== null ? [[m.find, m.repl]] : []);
  for (const [find, repl] of edits) {
    const count = mutated.split(find).length - 1;
    if (count !== 1) { anchor = 'ANCHOR LOST (find matches ' + count + ' times)'; break; }
    mutated = mutated.replace(find, () => repl);
  }
  const page = path.join(dir, 'index.html');
  let harness = path.join(GAME, 'harness.js');
  if (m.file === 'harness') {
    fs.writeFileSync(path.join(dir, 'harness.js'), mutated);
    fs.copyFileSync(path.join(GAME, 'index.html'), page);
    for (const sub of ['tools', 'fixtures']) if (fs.existsSync(path.join(GAME, sub))) fs.symlinkSync(path.join(GAME, sub), path.join(dir, sub));
    harness = path.join(dir, 'harness.js');
  } else if (isFixture) { fs.writeFileSync(srcFile, mutated); fs.copyFileSync(path.join(GAME, 'index.html'), page); }
  else if (m.file === 'make') { fs.writeFileSync(path.join(dir, 'make.html'), mutated); fs.copyFileSync(path.join(GAME, 'index.html'), page); }
  else fs.writeFileSync(page, mutated);
  const makeArgs = m.file === 'make' ? ['--make', path.join(dir, 'make.html')] : [];

  for (const g of gates) {
    if (anchor !== 'ok') { rows.push({ m, g, result: anchor }); continue; }
    let cmd, env = Object.assign({}, process.env);
    if (g.gate === 'lint') cmd = ['tools/lint.mjs', '--page', page].concat(makeArgs);
    else if (g.gate === 'harness') cmd = [harness, '--page', page].concat(g.only ? ['--only', g.only] : [], isFixture ? ['--fixtures', fixCopy] : []);
    else if (BROWSER.has(g.gate)) { cmd = ['test/' + g.gate + '.mjs']; env.SB_PAGE = page; if (m.file === 'make') env.SB_MAKE = path.join(dir, 'make.html'); }
    else { rows.push({ m, g, result: 'UNKNOWN GATE' }); continue; }
    const r = spawnSync('node', cmd, { cwd: GAME, encoding: 'utf8', env, maxBuffer: 64 * 1024 * 1024, timeout: 15 * 60 * 1000 });
    const out = (r.stdout || '') + (r.stderr || '');
    fs.writeFileSync(path.join(dir, g.gate + '.out'), out);
    let result;
    if (r.status === 0) result = 'STAYED GREEN';
    else if (g.expect === null || [].concat(g.expect).some(e => out.includes(BROWSER.has(g.gate) ? 'FAIL  ' + e : e))) result = 'RED';
    else result = 'WRONG REASON';
    rows.push({ m, g, result, why: result === 'WRONG REASON' ? (out.split('\n').find(l => /FAIL|Error/.test(l)) || '').trim().slice(0, 120) : '' });
  }
}

/* ---------------------------------------------------------------- the table */
const pad = (s, n) => (s + ' '.repeat(n)).slice(0, n);
console.log(pad('mutant', 30) + pad('task', 7) + pad('gate', 10) + pad('expected text', 48) + 'result');
for (const r of rows) {
  const want = r.m.name === 'NOOP' ? '(must stay green)' : [].concat(r.g.expect || '').join(' | ');
  const shown = r.m.name === 'NOOP' && r.result === 'STAYED GREEN' ? 'stayed green (as it must)' : r.result;
  console.log(pad(r.m.name, 30) + pad(r.m.task, 7) + pad(r.g.gate, 10) + pad(want, 48) + shown + (r.why ? '  [' + r.why + ']' : ''));
}
const expected = r => (r.m.name === 'NOOP' ? r.result === 'STAYED GREEN' : r.result === 'RED');
const bad = rows.filter(r => !expected(r));
const red = rows.filter(r => r.result === 'RED').length;
const greens = rows.filter(r => r.result === 'STAYED GREEN').length;
console.log('\n' + rows.length + ' rows: ' + red + ' RED, ' + greens + ' stayed green, ' + (rows.length - red - greens) + ' other');
if (!rows.length) { console.log('no rows ran'); process.exit(1); }
if (bad.length) console.log('NOT AS EXPECTED: ' + bad.map(r => r.m.name + '@' + r.g.gate + ' ' + r.result).join(', '));
else console.log('REDWATCH OK: every mutant RED' + (rows.some(r => r.m.name === 'NOOP') ? ', NOOP stayed green' : ''));
if (CHECK) process.exit(bad.length ? 1 : 0);
process.exit(greens ? 1 : (bad.length ? 1 : 0));
