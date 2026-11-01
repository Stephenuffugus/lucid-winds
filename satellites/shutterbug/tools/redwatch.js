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
const BROWSER = new Set(['boot', 'play', 'input', 'layout', 'reveal', 'capture', 'death', 'sprites', 'make', 'loot', 'audio', 'share', 'save', 'pwa', 'loop', 'pause', 'onboard', 'fight', 'compare']);

const CORE_SIM_OPEN = "<script id=\"core-sim\" data-core>\n(function (SB) { 'use strict';\n";
/* the whole shell-navpad block as the page holds it (NAVPAD_IN_BODY moves it, whatever its comment says) */
const NAVPAD_BLOCK = (fs.readFileSync(path.join(GAME, 'index.html'), 'utf8').match(/<script id="shell-navpad">\n[\s\S]*?\n<\/script>\n/) || ['<script id="shell-navpad"> missing'])[0];

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
  { name: 'CLEAR_NO_RESTART', task: 'T0.8a', file: 'page', find: "  ui.again = function () { if (G.record) ui.startRoom(G.record, G.name, { level: G.level, notFirst: G.notFirst, mode: G.mode }); };",   /* re anchored after the M1 review */
    repl: "  ui.again = function () { if (G.record) { var keep = document.getElementById('clear').className; ui.startRoom(G.record, G.name, { level: G.level, notFirst: G.notFirst, mode: G.mode }); document.getElementById('clear').className = keep; } };",
    gates: [{ gate: 'play', expect: 'Again leaves nothing painted over the play area' }] },

  /* the review of 30 Oct (fidelity lens) */
  { name: 'FLOOR_IS_LANDMARK', task: 'T0.8a review', file: 'page',
    find: "    var body = solid.slice();\n    for (x = 0; x < w; x++) body[(h - 1) * w + x] = 0;\n    var comps = components(body, w, h), landmarks = [];",
    repl: '    var comps = components(solid, w, h), landmarks = [];',
    gates: [{ gate: 'harness', only: 'H-pipe-5', expect: 'three separate blocks standing on the floor are three landmarks' }] },
  { name: 'BEACON_RELIT_ANYWHERE', task: 'T0.8a review', file: 'page', edits: [
      ['cells: light && exit >= 0 && light.indexOf(exit) >= 0 ? Int32Array.from(light)', 'cells: light ? Int32Array.from(light)'],
      ['cells: light && level.exit >= 0 && light.indexOf(level.exit) >= 0 ? Int32Array.from(light)', 'cells: light ? Int32Array.from(light)']],
    gates: [{ gate: 'harness', only: 'H-pipe-12', expect: 'the lamp stays backdrop' }] },
  { name: 'LIGHT_BY_SUM', task: 'T0.8a review', file: 'page',
    find: 'var peak = 0; for (var q = 0; q < lights[i].length; q++) if (L[lights[i][q]] > peak) peak = L[lights[i][q]];',
    repl: 'var peak = 0; for (var q = 0; q < lights[i].length; q++) peak += L[lights[i][q]];',
    gates: [{ gate: 'harness', only: 'H-pipe-12', expect: 'a 3x2 Glare lamp beats a bigger 6x3 Paper patch' }] },
  { name: 'AIR_KEEPS_MOMENTUM', task: 'T0.8a review', file: 'page',
    /* re anchored at T1.5 (the decel reads the slick support): the same mutation, the air keeping its momentum */
    find: '    else if (h.vx > 0) h.vx = Math.max(0, h.vx - (h.ground && slickUnder(h, lv, K) ? K.SLICK_DECEL : K.DECEL));\n    else if (h.vx < 0) h.vx = Math.min(0, h.vx + (h.ground && slickUnder(h, lv, K) ? K.SLICK_DECEL : K.DECEL));',
    repl: '    else if (h.vx > 0 && h.ground) h.vx = Math.max(0, h.vx - (h.ground && slickUnder(h, lv, K) ? K.SLICK_DECEL : K.DECEL));\n    else if (h.vx < 0 && h.ground) h.vx = Math.min(0, h.vx + (h.ground && slickUnder(h, lv, K) ? K.SLICK_DECEL : K.DECEL));',
    gates: [{ gate: 'harness', only: 'H-sim-18', expect: 'releasing the rocker in flight decelerates in 4 frames' }] },

  /* the review of 30 Oct (harness lens) */
  { name: 'EXIT_EARLY', task: 'T0.8a review', file: 'page', find: 'if (h.x < (ex + 1) * CS2 && h.x + K.HERO_W_SUB > ex * CS2 && h.y < (ey + 1) * CS2 && h.y + K.HERO_H_SUB > ey * CS2) {',
    repl: 'if (h.y < (ey + 4) * CS2) {',
    gates: [{ gate: 'harness', only: 'H-sim-20', expect: 'the room clears on exactly the first step the box overlaps the exit cell' },
      { gate: 'play', expect: 'one step before the lamp the room is not yet clear' }] },
  { name: 'BONK_KEEPS_VY', task: 'T0.8a review', file: 'page', find: "        else { h.y = (hr + 1) * CS; h.vy = 0; h.rising = 0; }   /* the head bonk */",
    repl: "        else { h.y = (hr + 1) * CS; h.rising = 0; }   /* the head bonk */",
    gates: [{ gate: 'harness', only: 'H-sim-5', expect: 'the head meets the ceiling' }] },
  { name: 'COYOTE_AFTER_JUMP', task: 'T0.8a review', file: 'page', find: 'h.vy = deep ? -(hook ? K.J8_DEEP_JUMP_V : K.DEEP_JUMP_V) : -(hook ? K.J8_JUMP_V : K.JUMP_V); h.ground = 0; h.rising = 1; h.coyote = 0; h.buffer = 0; jumped = 1;',   /* re anchored at W2 (Skyhook) */
    repl: 'h.vy = deep ? -(hook ? K.J8_DEEP_JUMP_V : K.DEEP_JUMP_V) : -(hook ? K.J8_JUMP_V : K.JUMP_V); h.ground = 0; h.rising = 1; h.buffer = 0; jumped = 1;',
    gates: [{ gate: 'harness', only: 'H-sim-2b', expect: 'gives no second upward kick' }] },
  { name: 'ONEWAY_CATCHES_FROM_BELOW', task: 'T0.8a review', file: 'page', find: '      if (!landed && prevFeet <= top && feet > top && h.dive !== 2) {',
    repl: '      if (!landed && feet > top && h.dive !== 2) {',
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
    gates: [{ gate: 'play', expect: 'a second finger on A during a stick hold: both register' }] },

  /* the second review (30 Oct, before sb-m0-2) */
  { name: 'HASH_SKIPS_RNG', task: 'T0.7b', file: 'page', find: "['frame', 'i32'], ['rng', 'u32'], ", repl: "['frame', 'i32'], ",
    gates: [{ gate: 'harness', only: 'H-sim-7', expect: 'state: the keys are exactly the declared list' }] },
  { name: 'ONEWAY_FROM_BELOW_BLOCKS', task: 'T0.7b', file: 'page', find: 'for (cx = cx0; cx <= cx1; cx++) if (solidAt(lv, cx, hr)) { any = true;',
    repl: 'for (cx = cx0; cx <= cx1; cx++) if (solidAt(lv, cx, hr) || platAt(lv, cx, hr)) { any = true;',
    /* dy 1 cannot see it (its one way is in the takeoff cell's own row, the head starts inside it): dy 2 is the first
       straight up jump through a one way */
    /* one change, two gates (the third review: T0.10b's ONEWAY_CATCHES_RISING was this row again under another name) */
    gates: [{ gate: 'harness', only: 'H-lab-1', expect: 'JUMP FULL right dx0 dy2 onto one way' }, { gate: 'harness', only: 'H-lab-4', expect: 'crossed only by the rise lets the hero through' }] },
  { name: 'FLOAT_LEAK', task: 'T0.7b', file: 'page', find: 'h.vy < -K.CUT_V) h.vy = -K.CUT_V;', repl: 'h.vy < -K.CUT_V) h.vy = -K.CUT_V / 3;',
    gates: [{ gate: 'harness', only: 'H-sim-8', expect: 'serialize never met a float' }] },
  { name: 'READY_NEVER_POSTED', task: 'T0.2b', file: 'page', edits: [
      ["    try { parent.postMessage({ sws: 'ready' }, '*'); } catch (e) {}", "    try { 0; } catch (e) {}"],
      ["function () { try { parent.postMessage({ sws: 'ready' }, '*'); } catch (e) {} });", "function () { try { 0; } catch (e) {} });"]],
    gates: [{ gate: 'boot', expect: 'journey C: framed' }] },
  { name: 'HI_PLUS_ONE', task: 'T0.10a', file: 'page', find: '      out.profiles[name] = { apex: apex, air: air, raw: raw, maxAcross: clip, cols: cols(K, a, air), paths: paths };',
    repl: "      if (name === 'FULL') clip[4] = 5;\n      out.profiles[name] = { apex: apex, air: air, raw: raw, maxAcross: clip, cols: cols(K, a, air), paths: paths };",
    gates: [{ gate: 'harness', only: 'H-reach-1', expect: 'FULL maxAcross: the core equals the oracle' }] },
  { name: 'CLEARANCE_SKIPS_HEAD', task: 'T0.10b', file: 'page', find: 'var x0 = Math.floor(x / C), x1 = Math.floor((x + K.HERO_W_SUB - 1) / C), y0 = Math.floor((y - K.HERO_H_SUB) / C), y1 = Math.floor((y - 1) / C);',
    repl: 'var x0 = Math.floor(x / C), x1 = Math.floor((x + K.HERO_W_SUB - 1) / C), y0 = Math.floor((y - K.HERO_H_SUB) / C) + 1, y1 = Math.floor((y - 1) / C);',
    gates: [{ gate: 'harness', only: 'H-reach-5', expect: 'a ceiling cell in the corridor cuts the edge' }] },
  /* ONEWAY_CATCHES_RISING (T0.10b) merged into ONEWAY_FROM_BELOW_BLOCKS: the same change */
  { name: 'TAB_MAX_0', task: 'T0.11a', file: 'page', find: 'TAB_MAX: 12', repl: 'TAB_MAX: 0',
    gates: [{ gate: 'harness', only: 'H-rep-1', expect: 'tight-gap: builds as its expect says' }] },
  { name: 'TABS_ON_LANDMARK', task: 'T0.11a', file: 'page', find: '!level.plat[(cy + 1) * w + cx] && !near[cy * w + cx]; };', repl: '!level.plat[(cy + 1) * w + cx]; };',
    gates: [{ gate: 'harness', only: 'H-rep-2', expect: 'no tab on or by a landmark top' }] },
  { name: 'LIGHT_SLACK_0', task: 'T0.11a', file: 'page', find: 'EXIT_LIGHT_SLACK: 2 /* Q11 */', repl: 'EXIT_LIGHT_SLACK: 0 /* Q11 */',
    /* the plan's LIGHT_SLACK_0_SAMPLE cannot bite on the sample room, whose lamp is itself the farthest cell: the slack lab decides */
    gates: [{ gate: 'harness', only: 'H-rep-1', expect: 'the slack lab: the lamp is the exit inside EXIT_LIGHT_SLACK' }] },
  { name: 'SLACK_ZERO', task: 'T0.11b', file: 'page', find: 'ROUTE_SLACK: 1,', repl: 'ROUTE_SLACK: 0,',
    gates: [{ gate: 'harness', only: 'H-route-3', expect: 'fails with max-range' }] },
  { name: 'CHAIN_3', task: 'T0.11b', file: 'page', find: 'ROUTE_MAX_WALL_CHAIN: 2,', repl: 'ROUTE_MAX_WALL_CHAIN: 3,',
    gates: [{ gate: 'harness', only: 'H-route-3', expect: 'fail with wall-chain' }] },
  /* the shelf below the lamp (rows 5 and 6, x 9..12) gone from the sample room: no jump reaches the lamp's shade then,
     and the room's wall jump (the wardrobe's, at the WALL table's edge) may not carry the main ascent, so repair must
     lay a tab (the plan's SHELF_CLOSED, translated to this room; removing each shelf in turn found the essential ones) */
  { name: 'SHELF_CLOSED', task: 'T0.11b', file: 'fixture:sample-room.json', edits: [['"444444444555544444444444",\n      "444444444333344444465664"', '"444444444444444444444444",\n      "444444444444444444465664"']],
    gates: [{ gate: 'harness', only: 'H-rep-1', expect: 'the sample room needs zero tabs' }] },
  /* the sim alone stingier than the model (TUNING's 8 would move the tables with it, and the bot then agrees): the
     ascent keeps a cell of slack, so it is the every edge gate that meets the table's edge jumps (46 fail) */
  { name: 'REPLAY_HASH_IGNORES_FRAME', task: 'T0.13b', file: 'page', find: "var FIELDS = [['v', 'i32'], ['frame', 'i32'], ", repl: "var FIELDS = [['v', 'i32'], ",
    gates: [{ gate: 'harness', only: 'H-bot-3', expect: 'the frame is in the hash' }] },
  /* the third review's harness lens (each a change that passed every gate before its check landed) */
  { name: 'CATCHES_ROW_OFF', task: 'review 3', file: 'page', edits: [["          var key = c + ',' + (j - 1);\n          if (!seen[key]) { seen[key] = 1; out.push([c, j - 1]); }", "          var key = c + ',' + j;\n          if (!seen[key]) { seen[key] = 1; out.push([c, j]); }"]],
    gates: [{ gate: 'harness', only: 'H-reach-1', expect: 'catch lists in the cone equal the oracle' }] },
  { name: 'CATCHES_ANY_OVERLAP', task: 'review 3', file: 'page', find: '          if (overlap(K, a[f].x, c) < K.OVERLAP_SUB) continue;\n', repl: '',
    gates: [{ gate: 'harness', only: 'H-reach-1', expect: 'catch lists in the cone equal the oracle' }] },
  { name: 'DIVE_KEEPS_VX', task: 'review 3', file: 'page', edits: [['h.dive = 1; h.vy = deep ? K.DEEP_TERM : K.TERM; h.vx = 0;', 'h.dive = 1; h.vy = deep ? K.DEEP_TERM : K.TERM;'], ['    else if (h.dive) h.vx = 0;\n', '    else if (h.dive) { }\n']],
    gates: [{ gate: 'harness', only: 'H-sim-13b', expect: 'a dive from a running jump' }] },
  { name: 'DIVE_KEEPS_COYOTE', task: 'review 3', file: 'page', find: 'h.sticky = 0; h.rising = 0; h.coyote = 0; s.ev |= EV.DIVE; }', repl: 'h.sticky = 0; h.rising = 0; s.ev |= EV.DIVE; }',
    gates: [{ gate: 'harness', only: 'H-sim-13b', expect: 'A pressed in coyote time after a dive' }] },
  { name: 'SHAKE_NEVER_DECAYS', task: 'review 3', file: 'page', find: '    if (h.shake > 0) h.shake--;\n', repl: '',
    gates: [{ gate: 'harness', only: 'H-sim-13b', expect: 'counts down from SHAKE_F to 0' }] },
  { name: 'SLIDE_ARMS_IN_DIVE', task: 'review 3', file: 'page', find: 'dir !== h.spent && h.lock === 0 && h.dive === 0 && contactAt', repl: 'dir !== h.spent && h.lock === 0 && contactAt',
    gates: [{ gate: 'harness', only: 'H-sim-13b', expect: 'a dive beside a wall' }] },
  { name: 'SLIDE_LEAVE_FULL', task: 'review 3', file: 'page', find: 'if (h.wall !== 0 && armed === 0 && h.vy > 0) h.vy = Math.floor(h.vy / K.WALL_SLIDE_DIV);', repl: '',
    gates: [{ gate: 'harness', only: 'H-sim-10', expect: 'after the release the fall continues' }] },
  { name: 'STICKY_ROCKER_AWAY_HOLDS', task: 'review 3', file: 'page', find: 'else if (dove || (dir !== 0 && dir === -h.wall)) { h.sticky = 0; h.wall = 0; }', repl: 'else if (dove) { h.sticky = 0; h.wall = 0; }',
    gates: [{ gate: 'harness', only: 'H-sim-12', expect: 'the rocker away from the vine lets go' }] },
  { name: 'DASH_TURNS', task: 'review 3', file: 'page', find: 'if (dir !== 0 && h.dash === 0 && h.lock === 0) h.facing = dir;', repl: 'if (dir !== 0 && h.lock === 0) h.facing = dir;',
    gates: [{ gate: 'harness', only: 'H-sim-14', expect: 'the rocker reversed mid dash' }] },
  { name: 'DASH_WALL_NO_END', task: 'review 3', file: 'page', find: 'if (h.dash > 0 && (dashCut || h.vx === 0))', repl: 'if (h.dash > 0 && dashCut)',
    gates: [{ gate: 'harness', only: 'H-sim-14', expect: 'a dash into a wall stops flush and ends' }] },
  { name: 'LOCK_5_SIM', task: 'review 3', file: 'page', find: 'h.lock = -h.wall * K.WALL_JUMP_LOCK;', repl: 'h.lock = -h.wall * 5;',
    gates: [{ gate: 'harness', only: 'H-sim-15', expect: 'the push away lasts exactly' }] },
  { name: 'STICKYUP_UNDER_CEILING', task: 'T0.13a', file: 'page', find: 'if (k2 >= 2 && !S(cx, cy - k2 - 1)) add(', repl: 'if (k2 >= 2) add(',
    gates: [{ gate: 'harness', only: 'H-bot-1c', expect: 'every edge has a macro' }] },
  { name: 'STICKYTOP_INTO_SLOT', task: 'review 3', file: 'page', find: 'stand[topy * w + topx] && !S(topx, topy - 1)) add(', repl: 'stand[topy * w + topx]) add(',
    gates: [{ gate: 'harness', only: 'H-bot-1c', expect: 'every edge has a macro' }] },
  { name: 'STICKY_UP_PLUS1', task: 'review 3', file: 'page', find: 'k2 <= T.STICKY_UP && cy - k2 >= 0', repl: 'k2 <= T.STICKY_UP + 1 && cy - k2 >= 0',
    gates: [{ gate: 'harness', only: 'H-bot-1c', expect: 'every edge has a macro' }] },
  { name: 'STICKY_THROUGH_CEILING', task: 'review 3', file: 'page', find: 'cy - k2 >= 0 && !S(cx, cy - k2); k2++)', repl: 'cy - k2 >= 0; k2++)',
    gates: [{ gate: 'harness', only: 'H-bot-1c', expect: 'every edge has a macro' }] },
  { name: 'WALLTOUCH_THROUGH_SOLID', task: 'review 3', file: 'page', find: '          for (cx = c0; cx <= c1; cx++) if (S(cx, row)) return;', repl: '          for (cx = c0; cx <= c1; cx++) if (S(cx, row)) continue;',
    gates: [{ gate: 'harness', only: 'H-bot-1c', expect: 'every edge has a macro' }] },
  /* FALL_FROM_MIDLEDGE (the review's): an equivalent mutant, no level of the corpus gains a FALL edge under it: a mid ledge walk off's corridor crosses the next cell's support, which clear() and the catches already cut */
  { name: 'STICKYUP_ONE_ROW', task: 'T0.13a', file: 'page', find: 'if (sticks[2 * c2 + sd2]) { if (k2 >= 2 && !S(cx, cy - k2 - 1)) add(', repl: 'if (sticks[2 * c2 + sd2]) { if (k2 >= 1 && !S(cx, cy - k2 - 1)) add(',
    gates: [{ gate: 'harness', only: 'H-bot-1c', expect: 'every edge has a macro' }] },
  { name: 'MAXRANGE_SKIPS_WALLJUMP', task: 'review 3', file: 'page', find: "(e.kind === 'JUMP' || (e.kind === 'WALLJUMP' && e.dx > 0)) && !slackOk(tb, e, both)", repl: "e.kind === 'JUMP' && !slackOk(tb, e, both)",
    gates: [{ gate: 'harness', only: 'H-route-3', expect: 'the corner wall jump' }] },
  { name: 'JUMP_EDGE_PLUS0', task: 'review 3', file: 'page', find: "add(s, ty * w + tx, 'JUMP', JP[q], dir, dx, dy, 2 + dy + dx / 2 + (edge ? 3 : 0));", repl: "add(s, ty * w + tx, 'JUMP', JP[q], dir, dx, dy, 2 + dy + dx / 2);",
    gates: [{ gate: 'harness', only: 'H-onb-1', expect: "none of its jumps sits at the clipped cone's edge" }] },
  { name: 'CADENCE_GE', task: 'review 3', file: 'page', find: 'if (r0 + climbed > T.ROUTE_SAFE_EVERY_ROWS)', repl: 'if (r0 + climbed >= T.ROUTE_SAFE_EVERY_ROWS)',
    gates: [{ gate: 'harness', only: 'H-route-3', expect: 'a vine climb of exactly' }] },
  { name: 'STAIR_ON_ONEWAY', task: 'review 3', file: 'page', find: '!level.plat[cy * w + cx] && !level.plat[(cy + 1) * w + cx] && !near[cy * w + cx]', repl: '!level.plat[cy * w + cx] && !near[cy * w + cx]',
    gates: [{ gate: 'harness', only: 'H-rep-7', expect: 'tabs keep the rules' }] },
  { name: 'STAIR_SECOND_IN_SOLID', task: 'review 3', file: 'page', find: '!free(second, py + 1) || S(second, py) || level.plat[py * w + second]', repl: '!free(second, py + 1) || level.plat[py * w + second]',
    gates: [{ gate: 'harness', only: 'H-rep-7', expect: 'tabs keep the rules' }] },
  { name: 'LIGHT_SLACK_STRICT', task: 'review 3', file: 'page', find: 'if (lc >= 0 && d[lc] >= maxD - T.EXIT_LIGHT_SLACK) exit = lc;', repl: 'if (lc >= 0 && d[lc] > maxD - T.EXIT_LIGHT_SLACK) exit = lc;',
    gates: [{ gate: 'harness', only: 'H-rep-1b', expect: 'edges farther than the light leaves the light the exit' }] },
  { name: 'EXIT_ROWS_PLUS1_REACH', task: 'review 3', file: 'page', find: 'for (i = 0; i < T.EXIT_ROWS * w; i++) if (standableIn(level, i) && d[i] > maxD)', repl: 'for (i = 0; i < (T.EXIT_ROWS + 1) * w; i++) if (standableIn(level, i) && d[i] > maxD)',
    gates: [{ gate: 'harness', only: 'H-rep-1b', expect: 'is never the exit' }] },
  { name: 'WALK_COST_2', task: 'review 3', file: 'page', find: "add(s, s + dir, 'WALK', null, dir, 1, 0, 1);", repl: "add(s, s + dir, 'WALK', null, dir, 1, 0, 2);",
    gates: [{ gate: 'harness', only: 'H-reach-12', expect: "cost what section 3.3 says" }] },
  { name: 'JUMP_DOWN_COST_1', task: 'review 3', file: 'page', find: "add(s, ty * w + tx, 'JUMP_DOWN', 'FULL', dir, dx, -r, 2 + dx / 2);", repl: "add(s, ty * w + tx, 'JUMP_DOWN', 'FULL', dir, dx, -r, 1);",
    gates: [{ gate: 'harness', only: 'H-reach-12', expect: "cost what section 3.3 says" }] },
  { name: 'SLIDE_COST_1', task: 'review 3', file: 'page', find: "if (stand[c3]) { add(from, c3, 'SLIDE', null, side, 0, cy - ty, ty - cy); break; }", repl: "if (stand[c3]) { add(from, c3, 'SLIDE', null, side, 0, cy - ty, 1); break; }",
    gates: [{ gate: 'harness', only: 'H-reach-12', expect: "cost what section 3.3 says" }] },
  { name: 'CHAIN_LINK_COST_1', task: 'review 3', file: 'page', find: 'cost = chain ? 4 :', repl: 'cost = chain ? 1 :',
    gates: [{ gate: 'harness', only: 'H-reach-12', expect: "cost what section 3.3 says" }] },
  { name: 'OVERLAP_8', task: 'T0.13a', file: 'page', find: 'if (ov >= K.OVERLAP_SUB || (h.ground && ov > 0)) landed = true;', repl: 'if (ov >= 8 * 256 || (h.ground && ov > 0)) landed = true;',
    gates: [{ gate: 'harness', only: 'H-bot-6', args: ['--all-edges'], expect: 'every edge has a macro' }] },
  { name: 'TOUCH_HEAD_ROW', task: 'T0.13a', file: 'page', find: 'var fc = floor((ny - HHs + C - 1) / C) * w + (col - dir)', repl: 'var fc = floor((ny - HHs) / C) * w + (col - dir)',
    gates: [{ gate: 'harness', only: 'H-bot-1b', expect: 'every edge has a macro' }] },
  { name: 'FOOTING_2PX', task: 'T0.13a', file: 'page', find: 'if (ov >= K.OVERLAP_SUB || (h.ground && ov > 0)) landed = true;', repl: 'if (ov >= K.OVERLAP_SUB) landed = true;',
    gates: [{ gate: 'harness', only: 'H-sim-4', expect: 'walking off a one way plank the hero stands while its box overlaps it' }] },
  { name: 'TOUCH_CLAMP_STICKS', task: 'T0.13a', file: 'page', find: '        X += dir * (p.x - a[f - 1].x);',
    repl: '        if (f > f0 + 1 && (dir > 0 ? (X + HWs) % C === 0 : X % C === 0)) { /* flush stays flush */ } else X += dir * (p.x - a[f - 1].x);',
    gates: [{ gate: 'harness', only: 'H-reach-11', expect: 'noise-s2: from (17, 25) neither the model nor the sim' }] },
  /* the third review's sim findings (fixed in T0.13a) */
  { name: 'COYOTE_AFTER_WALLJUMP', task: 'review 3', file: 'page', find: 'h.spent = h.wall; h.wall = 0; h.rising = 1; h.coyote = 0; h.buffer = 0; jumped = 1;', repl: 'h.spent = h.wall; h.wall = 0; h.rising = 1; jumped = 1;',
    gates: [{ gate: 'harness', only: 'H-sim-2b', expect: 'a wall jump inside coyote time' }] },
  { name: 'COYOTE_AFTER_STICKYJUMP', task: 'review 3', file: 'page', find: 'h.sticky = 0; h.wall = 0; h.rising = 1; h.coyote = 0; h.buffer = 0; jumped = 1; stickyJump = 1;', repl: 'h.sticky = 0; h.wall = 0; h.rising = 1; jumped = 1; stickyJump = 1;',
    gates: [{ gate: 'harness', only: 'H-sim-2b', expect: 'a sticky jump inside coyote time' }] },
  { name: 'FACING_IN_LOCK', task: 'review 3', file: 'page', find: 'if (dir !== 0 && h.dash === 0 && h.lock === 0) h.facing = dir;', repl: 'if (dir !== 0 && h.dash === 0) h.facing = dir;',
    gates: [{ gate: 'harness', only: 'H-sim-15', expect: 'the facing stays away' }] },
  { name: 'DASH_IFRAMES_UNMOVED', task: 'review 3', file: 'page', find: 'if (dashStart && h.x === xBefore) h.dashI = 0; ', repl: '',
    gates: [{ gate: 'harness', only: 'H-sim-14', expect: 'a dash pressed flush against a wall does not move and keeps no i frames' }] },
  { name: 'DASHCLAMP_ORDER', task: 'review 3', file: 'page', find: "    if (!(solidAt(lv, cur, row) || platAt(lv, cur, row))) return 0;     /* the foot already past the edge: no dash */\n    if (solidAt(lv, c, row) || platAt(lv, c, row)) return vx;",
    repl: "    if (solidAt(lv, c, row) || platAt(lv, c, row)) return vx;\n    if (!(solidAt(lv, cur, row) || platAt(lv, cur, row))) return 0;",
    gates: [{ gate: 'harness', only: 'H-sim-14', expect: 'past a platform' }] },
  { name: 'WALL_LADDER', task: 'review 3', file: 'page', find: 'var armed = dir !== 0 && dir !== h.spent && h.lock === 0', repl: 'var armed = dir !== 0 && h.lock === 0',
    gates: [{ gate: 'harness', only: 'H-sim-9b', expect: 'never arms on that wall again' }] },
  { name: 'AIR_CONTROL_HALF', task: 'review 3', file: 'page', find: 'AIR_CONTROL: 1 /*', repl: 'AIR_CONTROL: 0.5 /*',
    gates: [{ gate: 'harness', only: 'H-sim-18', expect: 'TUNING.AIR_CONTROL is 1' }] },
  { name: 'DASH_OFF_EDGE', task: 'T0.12b', file: 'page', find: 'var dv = dashClamp(h, lv, K, h.facing * K.DASH_V);', repl: 'var dv = h.facing * K.DASH_V;',
    gates: [{ gate: 'harness', only: 'H-sim-14', expect: 'stops with the leading foot on it' }] },
  { name: 'DIVE_CHAINS_DASH', task: 'T0.12b', file: 'page', find: 'else if (bPressed && startedGrounded && h.dash === 0)', repl: 'else if (bHeld && startedGrounded && h.dash === 0)',
    gates: [{ gate: 'harness', only: 'H-sim-13', expect: 'the dive never becomes a dash' }] },
  { name: 'HOLD_DIVE_CAUGHT', task: 'T0.12b', file: 'page', find: 'if (!landed && prevFeet <= top && feet > top && h.dive !== 2) {', repl: 'if (!landed && prevFeet <= top && feet > top) {',
    gates: [{ gate: 'harness', only: 'H-sim-13', expect: 'a hold dive passes the three one ways to the floor' }, { gate: 'harness', only: 'H-lab-7', expect: 'equal the model' }] },
  { name: 'CORNER_PX_6', task: 'T0.12a', file: 'page', find: 'CORNER_PX: 2,', repl: 'CORNER_PX: 6,',
    gates: [{ gate: 'harness', only: 'H-sim-11', expect: 'a side overlap of 13.5 px never arms a slide' }] },
  /* re anchored at W1 (the sticky jump keeps the wall it left for the throw's side) */
  { name: 'STICKY_PUSHOFF', task: 'T0.12a', file: 'page', find: 'if (pressed) { wallSide = h.wall; h.vy = -K.STICKY_V; h.sticky = 0; h.wall = 0;',
    repl: 'if (pressed) { wallSide = h.wall; h.vy = -K.STICKY_V; h.lock = -h.wall * K.WALL_JUMP_LOCK; h.sticky = 0; h.wall = 0;',
    gates: [{ gate: 'harness', only: 'H-sim-12', expect: 'and never moved sideways (no push off)' }] },
  { name: 'LOCK_ZERO', task: 'T0.12a', file: 'page', find: 'WALL_JUMP_LOCK: 10,', repl: 'WALL_JUMP_LOCK: 0,',
    gates: [{ gate: 'harness', only: 'H-sim-15', expect: 'held toward the wall, the lock carries the hero away' }] },
  { name: 'STICKY_ARMS_RISING', task: 'T0.12a', file: 'page', find: 'if (h.vy > 0 && !startedGrounded && h.dive === 0) side', repl: 'if (!startedGrounded && h.dive === 0) side',
    gates: [{ gate: 'harness', only: 'H-sim-12', expect: 'A gives' }] },
  { name: 'LATCH_OFF', task: 'T0.9', file: 'page', find: "    if (!isHeld(verb) && (verb === 'A' || verb === 'B')) edge[verb]++;", repl: "    if (false) edge[verb]++;",
    gates: [{ gate: 'input', expect: 'a sub step tap on A (4 ms) is exactly one A_TAP' }] },
  /* ZONE_FIXED_AT_DOWN became STICK_FIXED_AT_DOWN at Q140 (the stick): its moves never read */
  { name: 'STICK_FIXED_AT_DOWN', task: 'STICK', file: 'page', find: '        p.x = pts[i].clientX; follow(p);', repl: '        follow(p);',
    gates: [{ gate: 'input', expect: '412x915: pushed 20 px right without lifting it is right' }] },
  { name: 'CANVAS_100PCT', task: 'T0.9', file: 'page', find: "    canvas.style.width = R.cssW + 'px';", repl: "    canvas.style.width = '100%';",
    gates: [{ gate: 'layout', expect: '412x915: the canvas is' }] },
  { name: 'A_44PX', task: 'T0.9', file: 'page', find: '#btnA { right: calc(var(--sar) + var(--edge)); }', repl: '#btnA { right: calc(var(--sar) + var(--edge)); width: 44px; }',
    gates: [{ gate: 'layout', expect: '412x915: A measures' }] },
  { name: 'RESERVE_FILLED', task: 'T0.9', file: 'page', find: '#reserve { position: absolute; left: 0; bottom: 0; width: var(--res); height: var(--res); }',
    repl: '#reserve { position: absolute; left: 0; bottom: 0; width: var(--res); height: var(--res); background: #c8302f; }',
    gates: [{ gate: 'layout', expect: '412x915 on the clear card: the reserved box is transparent' }] },
  /* T0.14: the develop reveal */
  { name: 'STATIC_BUILT_TWICE', task: 'T0.14', file: 'page', find: "    if (window.performance && performance.mark) performance.mark('sb-reveal-end');\n    ui.screen = 'play';",
    repl: "    if (window.performance && performance.mark) performance.mark('sb-reveal-end');\n    SB.render.buildStatic(G.level);\n    ui.screen = 'play';",
    gates: [{ gate: 'reveal', expect: 'the static layer is built once' }] },
  { name: 'AUDIO_AT_LOAD', task: 'T0.14', file: 'page', find: "A.init = function () { document.addEventListener('pointerdown', unlock, { capture: true, once: true }); };", repl: 'A.init = function () { unlock(); };',
    gates: [{ gate: 'reveal', expect: 'no AudioContext before the first tap' }] },
  { name: 'REVEAL_NO_SKIP', task: 'T0.14', file: 'page', find: "if (ui.screen !== 'reveal' || !RV.seen || e.target.closest('#exit')) return;", repl: 'if (true) return;',   /* re anchored at NOTE3: Title left the strip (QUESTIONS Q94) */
    gates: [{ gate: 'reveal', expect: 'a second room skips on a tap' }] },
  /* T0.16: moths, hearts */
  { name: 'IFRAMES_ZERO', task: 'T0.16', file: 'page', find: 'h.iframes = K.HIT_IFRAMES_F;', repl: 'h.iframes = 0;',
    gates: [{ gate: 'harness', only: 'H-en-2', expect: 'inside the i frames a second contact removes nothing' }] },
  /* H-en-3's mortal walk takes no hit at 1 cell per second (the bot is quicker than a moth): moths eight times faster
     catch it, and it stops (2026-10-30: at edge 10 with 1 heart) */
  { name: 'MOTH_SPEED_X8', task: 'T0.16', file: 'page', find: 'en.vx = (K.MOTH_V * mdx / md) | 0; en.vy = (K.MOTH_V * mdy / md) | 0;', repl: 'en.vx = (8 * K.MOTH_V * mdx / md) | 0; en.vy = (8 * K.MOTH_V * mdy / md) | 0;',
    gates: [{ gate: 'harness', only: 'H-en-3', expect: 'the mortal walk on the sample room' }] },
  { name: 'MOTH_ON_SAFE_CELL', task: 'T0.16', file: 'page', find: '    for (k = 0; k < stands.length; k++) mark(stands[k], T.ROUTE_SAFE_ENEMY_DIST);\n', repl: '',
    gates: [{ gate: 'harness', only: 'H-route-6', expect: 'a cluster beside an ascent cell' }] },
  { name: 'MOTH_NEAR_SPAWN', task: 'T0.16', file: 'page', find: '    mark(level.spawn, T.ENEMY_SPAWN_CLEAR);\n', repl: '',
    gates: [{ gate: 'harness', only: 'H-en-1', expect: 'a cluster beside spawn' }] },
  { name: 'EV_NO_LAND', task: 'T0.16', file: 'page', find: '{ h.squash = K.SQUASH_F; s.ev |= EV.LAND; }', repl: '{ h.squash = K.SQUASH_F; }',
    gates: [{ gate: 'harness', only: 'H-sim-21', expect: 'its landing sets LAND once' }] },
  { name: 'MOTH_SPEED_X2', task: 'T0.16', file: 'page', find: 'en.vx = (K.MOTH_V * mdx / md) | 0; en.vy = (K.MOTH_V * mdy / md) | 0;', repl: 'en.vx = (2 * K.MOTH_V * mdx / md) | 0; en.vy = (2 * K.MOTH_V * mdy / md) | 0;',
    gates: [{ gate: 'harness', only: 'H-en-4', expect: 'it reaches the column in' }] },
  { name: 'KNOCK_TOWARD', task: 'T0.16', file: 'page', find: 'hitHero(s, mdx < 0 ? -1 : 1);', repl: 'hitHero(s, mdx < 0 ? 1 : -1);',   /* re-anchored on T1.4b's shared hit */
    gates: [{ gate: 'harness', only: 'H-en-2', expect: 'the knockback carries the hero away' }] },
  /* T0.17: the sprites */
  { name: 'OFF_PALETTE_PIXEL', task: 'T0.17', file: 'page', find: 'd[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;', repl: 'd[o] = c[0] ^ 1; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;',
    gates: [{ gate: 'sprites', expect: '64 pixels sampled from' }] },
  { name: 'ANIM_AT_60', task: 'T0.17', file: 'page', find: "if (h.anim > 0) return 'run' + (Math.floor((h.anim - 1) / hold) % 4);", repl: "if (h.anim > 0) return 'run' + ((h.anim - 1) % 4);",
    gates: [{ gate: 'sprites', expect: 'running, each frame holds 5 steps' }] },
  { name: 'DASH_NO_FLASH', task: 'T0.17', file: 'page', find: "(h.dashI > 0 ? '*' : '')", repl: "''",
    gates: [{ gate: 'sprites', expect: 'a dash draws the Glare hero' }] },
  /* re anchored in ART1 on Astra's tab (Q160) */
  { name: 'SPRITE_ROW_SHORT', task: 'T0.17', file: 'page', find: "a: 'ffffffffffffffff/ff00ffffff00ffff/", repl: "a: 'fffffffffffffff/ff00ffffff00ffff/",
    gates: [{ gate: 'lint', expect: 'tab.a row 0 is 15 wide' }, { gate: 'harness', only: 'H-spr-1', expect: 'tab.a decodes to 16x5' }] },
  /* T1.2b: features, part two */
  { name: 'SPECK_CAP_7', task: 'T1.2b', file: 'page', find: 'var cap = T.CAP_SPECK + (level.biome === 4 ? T.EMBER_EXTRA_SPECKS : 0) - (pl >= 0 ? 1 : 0);', repl: 'var cap = T.CAP_SPECK + 1 + (level.biome === 4 ? T.EMBER_EXTRA_SPECKS : 0) - (pl >= 0 ? 1 : 0);',   /* re anchored after the M1 review's pocket speck */
    gates: [{ gate: 'harness', only: 'H-feat-2', expect: 'eight isolated Sun specks within reach give CAP_SPECK' }] },
  { name: 'TRAP_ON_ASCENT', task: 'T1.2b', file: 'page', edits: [['if (taken[c]) { clash = true; break; } ', ''], ['      if (!trapOk(level, cells)) continue;\n', '']], find: null, repl: null,
    /* since T1.3 the second round catches a field on the ascent and the ladder removes it, so the lab names the loss */
    gates: [{ gate: 'harness', only: 'H-feat-3', expect: 'trap-pattern (authored for it) holds a field' }] },
  { name: 'TRAP_ON_TAB', task: 'T1.2b', file: 'page', find: ' || level.tab[c] || (c + w < n && level.tab[c + w])) continue;', repl: ') continue;',
    gates: [{ gate: 'harness', only: 'H-feat-3', expect: 'keeps the rule' }] },
  { name: 'TRAP_OK_BLIND', task: 'T1.2b', file: 'page', find: '      if (!found) return false;\n', repl: '',
    gates: [{ gate: 'harness', only: 'H-feat-3', expect: 'a field over the cell an ascent JUMP lands in is refused' }] },
  { name: 'NO_SCROLL_GUARANTEE', task: 'T1.2b', file: 'page', find: '      scroll = deepest(level, g, d, ok);\n', repl: '      scroll = -1; return { specks: cand, scroll: null, blueprint: null };\n',
    gates: [{ gate: 'harness', only: 'H-feat-2', expect: ': no scroll' }] },   /* the M1 review: it was RED by null read as cell 0 */
  { name: 'CLUSTER_ON_LAMP', task: 'T1.2b', file: 'page', find: '    claim(level.light);\n    claim(level.beacon && level.beacon.cells);\n', repl: '',
    gates: [{ gate: 'harness', only: 'H-en-1b', expect: 'a lit Sun lamp spawns no moth' }] },
  { name: 'ICICLE_IN_THE_AIR', task: 'T1.2b', file: 'page', find: "      else if (kind === ICICLE && !(level.solid[c - w] || level.plat[c - w])) return false;", repl: '',
    gates: [{ gate: 'harness', only: 'H-feat-6', expect: 'keeps the rules' }] },
  { name: 'SPOT_UNSEEDED', task: 'T1.2b', file: 'page', find: 'if (good.length) return good[good.length === 1 ? 0 : rng.int(good.length)];', repl: 'if (good.length) return good[0];',
    gates: [{ gate: 'harness', only: 'H-feat-8', expect: 'saturated-blobs: with the geometry unchanged, a flipped nibble moves the placement' }] },
  /* T1.2a: features, part one */
  { name: 'DOOR_ON_SAFE_CELL', task: 'T1.2a', file: 'page', find: 'if (!standable(level, c) || d[c] < 0 || stands.indexOf(c) >= 0 || (back && !back[c])) continue;', repl: 'if (!standable(level, c) || d[c] < 0 || (back && !back[c])) continue;',
    gates: [{ gate: 'harness', only: 'H-feat-4', expect: 'made an ascent cell, the door leaves it' }] },
  { name: 'POCKET_CARVES_ASCENT', task: 'T1.2a', file: 'page', find: "      if (!found) return { ok: false, why: 'the ascent loses its ' + e.kind + ' edge ' + e.from + ' to ' + e.to };\n", repl: '',
    gates: [{ gate: 'harness', only: 'H-feat-5', expect: 'is refused for the ascent' }] },
  { name: 'MOTH_LOST_LAMP_NEST', task: 'T1.2a', file: 'page', find: '    claim(level.light);\n', repl: '',
    gates: [{ gate: 'harness', only: 'H-en-1b', expect: 'a lamp that lost the exit' }] },
  { name: 'MOTH_SHELF_NEST', task: 'T1.2a', file: 'page', find: '    for (k = 0; k < level.landmarks.length; k++) claim(level.landmarks[k].cells);\n', repl: '',
    gates: [{ gate: 'harness', only: 'H-en-1b', expect: 'a landmark holding Walnut cells' }] },
  { name: 'ELITE_AS_FODDER', task: 'T1.2a', file: 'page', find: 'if (size >= T.ELITE_CELLS[0] && size <= T.ELITE_CELLS[1]) {', repl: 'if (false) {',
    gates: [{ gate: 'harness', only: 'H-en-1b', expect: 'a 6 cell cluster spawns one elite' }] },
  { name: 'MOTH_UNSEEDED', task: 'T1.2a', file: 'page', find: '      for (i = fodderSpots.length - 1; i > 0; i--) { var j = rng.int(i + 1), t1 = fodderSpots[i]; fodderSpots[i] = fodderSpots[j]; fodderSpots[j] = t1; }\n', repl: '',
    gates: [{ gate: 'harness', only: 'H-en-1b', expect: 'six clusters over CAP_ENEMY, four seeds' }] },
  { name: 'CHEST_IGNORES_FOCAL', task: 'T1.2a', file: 'page', find: '    if (focal >= 0) {\n', repl: '    if (false) {\n',
    gates: [{ gate: 'harness', only: 'H-feat-1', expect: 'tapped on the bookshelf, the chest is the nearest' }] },
  { name: 'LADDER_GAP_4', task: 'T1.2a', file: 'page', find: 'if (dy < 1 || dy > T.LADDER_STACK_ROWS) continue;', repl: 'if (dy < 1 || dy > T.LADDER_STACK_ROWS + 1) continue;',
    gates: [{ gate: 'harness', only: 'H-feat-1', expect: 'every one of' }] },
  /* the fourth review (T0.16, T0.17), before sb-m0-3 */
  { name: 'DEATH_CARD_FIXED', task: 'review 4', file: 'page', find: '      if (top < cr.bottom && top + hd.h * k > cr.top) dc.classList.add(\'low\');\n', repl: '',   /* re anchored after the M1 review's measured dock */
    gates: [{ gate: 'death', expect: 'a death high in the room' }] },
  { name: 'ROTATE_RUNS', task: 'review 4', file: 'page', find: "    var run = !held && !SIDEWAYS.matches && !!G.state && SB.ui.screen === 'play';", repl: "    var run = !held && !!G.state && SB.ui.screen === 'play';",
    gates: [{ gate: 'layout', expect: 'turned sideways mid room the loop holds' }] },
  { name: 'MOTH_AT_7_5', task: 'review 4', file: 'page', find: "((Math.floor(clock / beat) & 1) ? '.a' : '.b')", repl: "(((clock >> 3) & 1) ? '.a' : '.b')",   /* re-anchored on T1.4's per kind beat */
    gates: [{ gate: 'sprites', expect: 'the moth flutters at 12 fps' }] },
  { name: 'KNOCK_ALWAYS_LEFT', task: 'review 4', file: 'page', find: 'h.knock = side * K.KNOCK_FRAMES;', repl: 'h.knock = -K.KNOCK_FRAMES;',   /* re-anchored on T1.4b's shared hit */
    gates: [{ gate: 'harness', only: 'H-en-2c', expect: 'a moth on the left: the hero is knocked' }] },
  { name: 'IFRAMES_HALF', task: 'review 4', file: 'page', find: '    if (h.iframes > 0) h.iframes--;', repl: '    if (h.iframes > 0) h.iframes = Math.max(0, h.iframes - 2);',
    gates: [{ gate: 'harness', only: 'H-en-2d', expect: 'exactly HIT_IFRAMES_S after the first' }] },
  { name: 'DASH_UNPROTECTED', task: 'review 4', file: 'page', find: '      if (!s.immortal && h.iframes === 0 && h.dashI === 0 && !s.room.cleared && ', repl: '      if (!s.immortal && h.iframes === 0 && !s.room.cleared && ',
    gates: [{ gate: 'harness', only: 'H-en-2e', expect: 'a dash from point blank through a moth keeps every heart' }] },
  { name: 'CORE_3PX', task: 'review 4', file: 'page', find: 'var core = 2 * K.SUB, mx0 = en.x + core,', repl: 'var core = 3 * K.SUB, mx0 = en.x + core,',
    gates: [{ gate: 'harness', only: 'H-en-2f', expect: '1 px into the hero hits on that step' }] },
  { name: 'CORE_1PX', task: 'review 4', file: 'page', find: 'var core = 2 * K.SUB, mx0 = en.x + core,', repl: 'var core = 1 * K.SUB, mx0 = en.x + core,',
    gates: [{ gate: 'harness', only: 'H-en-2f', expect: 'only touches the hero\'s edge does not' }] },
  /* re anchored at W1 (the atlas paints a second copy, the enemies' hit flash): the dash's Glare copy dropped alone */
  { name: 'FLASH_UNDRAWN', task: 'review 4', file: 'page', find: '        if (it[5] === 1 && (idx === P.I.SUN || idx === P.I.WALNUT)) idx = P.I.GLARE;\n', repl: '        if (false) idx = P.I.GLARE;\n',
    gates: [{ gate: 'sprites', expect: 'on the canvas the hero shows no Sun through the dash i frames' }] },
  /* SQUASH_SMOOTHED retired at ART2 (Q161): the squash and the stretch are Astra's 14x14 and 10x18 poses drawn 1:1, so
     smoothing that draw at whole coordinates changes no pixel and the row could never go red again; POSE_SQUASH_OFF and
     POSE_STRETCH_OFF watch the poses' pixels on the canvas instead */
  { name: 'MOTH_AT_THREE', task: 'review 4', file: 'page', find: 'mark(stands[k], T.ROUTE_SAFE_ENEMY_DIST);', repl: 'mark(stands[k], T.ROUTE_SAFE_ENEMY_DIST - 1);',
    gates: [{ gate: 'harness', only: 'H-route-6', expect: 'saturated-blobs mode 0: moths within ROUTE_SAFE_ENEMY_DIST of an ascent cell' }] },
  { name: 'KNOCK_RUNS_ON', task: 'review 4', file: 'page', find: '    if (knocked && h.knock === 0) h.vx = 0;', repl: '',
    gates: [{ gate: 'harness', only: 'H-en-2', expect: 'the knockback ends at rest' }] },
  { name: 'HIT_KEEPS_CLING', task: 'review 4', file: 'page', find: 'h.lock = 0; h.dash = 0; h.sticky = 0; h.wall = 0; s.ev |= EV.HIT;', repl: 'h.lock = 0; h.dash = 0; s.ev |= EV.HIT;',
    gates: [{ gate: 'harness', only: 'H-en-2b', expect: 'never held sticky away from the vine' }] },
  { name: 'DEATH_AND_CLEAR', task: 'review 4', file: 'page', find: '      if (!s.immortal && h.iframes === 0 && h.dashI === 0 && !s.room.cleared && ', repl: '      if (!s.immortal && h.iframes === 0 && h.dashI === 0 && ',
    gates: [{ gate: 'harness', only: 'H-sim-21', expect: 'the clear wins' }] },
  { name: 'HINT_STAYS', task: 'review 4', file: 'page', find: "clearTimeout(el.sbHintT); el.sbHintT = setTimeout(function () { el.classList.remove('hint'); }, HINT_MS);", repl: '',
    gates: [{ gate: 'death', expect: 'under reduced motion the hint leaves after the pulse' }] },
  /* T1.1: biome detection */
  { name: 'HUE_BANDS_SWAPPED', task: 'T1.1', file: 'page', find: 'BAND = [-1, -1, -1, -1, -1, -1, -1, 0, 0, 4, 4, 2, 2, 3, 0, -1];',
    repl: 'BAND = [-1, -1, -1, -1, -1, -1, -1, 0, 0, 2, 2, 4, 4, 3, 0, -1];',
    gates: [{ gate: 'harness', only: 'H-bio-1', expect: 'biome-deep detects deep' }] },
  { name: 'FROST_RULE_DROPPED', task: 'T1.1', file: 'page', find: 'if (sat < T.BIOME_MIN_FRAC * n) return sumL > T.FROST_MEAN_L * n ? 1 : 0;',
    repl: 'if (sat < T.BIOME_MIN_FRAC * n) return 0;',
    gates: [{ gate: 'harness', only: 'H-bio-3', expect: 'all-light detects Frost' }] },
  { name: 'STICKY_ANY_WIDTH', task: 'T1.1', file: 'page', find: 'return S[i] && !(cx > 0 && S[i - 1]) && !(cx < w - 1 && S[i + 1]); };',
    repl: 'return S[i]; };',
    gates: [{ gate: 'harness', only: 'H-bio-4', expect: 'the surfaces keep to their biomes' }] },
  { name: 'SLICK_SLIDE_IGNORED', task: 'T1.1', file: 'page', find: '      if (slides(to, dir, dx)) return;\n', repl: '',
    gates: [{ gate: 'harness', only: 'H-bio-5', expect: 'moving right (the slide would carry the hero off) is no edge' }] },
  { name: 'SLICK_ENDS_UNSTANDABLE', task: 'T1.1', file: 'page', find: '    for (i = 0; i < n - w; i++) if (!solid[i] && (solid[i + w] || plat[i + w])) stand[i] = 1;\n',
    repl: '    for (i = 0; i < n - w; i++) if (!solid[i] && (solid[i + w] || plat[i + w])) stand[i] = 1;\n    for (i = w; i < n; i++) if (slick[i] && (i % w === 0 || !slick[i - 1] || i % w === w - 1 || !slick[i + 1])) stand[i - w] = 0;\n',
    gates: [{ gate: 'harness', only: 'H-bio-5', expect: 'a landing on the right end moving left stays' }] },
  /* T0.16: the death gate */
  { name: 'RESTART_REVEALS', task: 'T0.16', file: 'page', find: "ui.restart = function () { if (G.record) ui.startRoom(G.record, G.name, { level: G.level, noReveal: true, notFirst: G.notFirst, mode: G.mode }); };",   /* re anchored after the M1 review */
    repl: "ui.restart = function () { if (G.record) ui.startRoom(G.record, G.name, { level: G.level, notFirst: G.notFirst, mode: G.mode }); };",
    gates: [{ gate: 'death', expect: 'Again restarts straight into play' }] },
  { name: 'DEATH_NO_CARD', task: 'T0.16', file: 'page', find: "    else if (G.state.room.dead && SB.ui.screen === 'play') SB.ui.showDeath();\n", repl: '',
    gates: [{ gate: 'death', expect: 'the last heart ends the room' }] },
  { name: 'BLINK_NONE', task: 'T0.16', file: 'page', find: 'R.heroShown = s.room.dead || !(h.iframes > 0 && ((h.iframes >> 3) & 1));', repl: 'R.heroShown = true;',
    gates: [{ gate: 'death', expect: 'the hero blinks through the i frames' }] },
  { name: 'HEARTS_STALE', task: 'T0.16', file: 'page', find: "if (ev & EV.HIT) { au.sfx('hit'); SB.ui.hearts(G.state.hero.hearts, G.state.hero.heartsMax); }", repl: "if (ev & EV.HIT) { au.sfx('hit'); }",
    gates: [{ gate: 'death', expect: 'the top strip shows' }] },
  /* T0.15: capture */
  { name: 'DECODE_NO_GUARD', task: 'T0.16', file: 'page', find: "      if (stale()) { if (bm && bm.close) bm.close(); return; }\n", repl: '',
    gates: [{ gate: 'capture', expect: 'a retake decoding past Develop is dropped' }] },
  { name: 'OVERLAY_STALE', task: 'T0.15', file: 'page', edits: [['if (gest.moved > 8) { CR.crop = SB.capture.move(gest.crop, dx, dy, CR.bw, CR.bh); layoutCrop(); schedule(); }', 'if (gest.moved > 8) { CR.crop = SB.capture.move(gest.crop, dx, dy, CR.bw, CR.bh); layoutCrop(); }'],
    ['CR.crop = SB.capture.pinch(gest.crop, s, gest.mid.x, gest.mid.y, CR.bw, CR.bh); layoutCrop(); schedule();', 'CR.crop = SB.capture.pinch(gest.crop, s, gest.mid.x, gest.mid.y, CR.bw, CR.bh); layoutCrop();']],
    gates: [{ gate: 'capture', expect: 'dragging the box rebuilds the overlay as it moves' }] },
  { name: 'PHOTO_HELD', task: 'T0.15', file: 'page', find: '    ui.releasePhoto();   /* the photo lives until the reveal ends, never longer (DESIGN 6.1) */\n', repl: '',
    gates: [{ gate: 'capture', expect: 'the photo is released when the reveal ends' }] },
  /* named by T0.8b and left to the layout gate, entered at T0.13b's audit of the plan's list */
  /* ROCKER_AT_X0 became STICK_AT_X0 at Q140: in a room the stick owns x 0 by design; where the chip shows (the clear
     card) the stick starting at x 0 lies under the chip's reserved box */
  { name: 'STICK_AT_X0', task: 'STICK', file: 'page', find: '#stick { position: absolute; left: var(--res); top: 0;', repl: '#stick { position: absolute; left: 0; top: 0;',
    gates: [{ gate: 'layout', expect: '412x915 on the clear card: the stick zone is clear of the reserved box' }] },
  { name: 'MIRROR_OVERLAPS_CANVAS', task: 'T0.9', file: 'page', find: '#strip.mirror #stick { left: calc(var(--res) + 2 * var(--btn)); right: calc(var(--sar) + var(--edge)); }',
    repl: '#strip.mirror #stick { left: calc(var(--res) + 2 * var(--btn)); right: calc(var(--sar) + var(--edge)); top: -160px; }',
    gates: [{ gate: 'layout', expect: '412x915 mirrored: the stick, A and B are disjoint and clear of the canvas' }] },
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
  /* SLIDE_KEEPS_OLD became STICK_KEEPS_OLD at Q140; GAP_IS_LEFT retired with the rocker's gap (the stick's neutral is
     watched by DEADZONE_ZERO and NO_HYSTERESIS) */
  { name: 'STICK_KEEPS_OLD', task: 'STICK', file: 'page', find: "      if (stickDir) I.release(stickDir, 'stick');", repl: "      if (stickDir && !v) I.release(stickDir, 'stick');",
    gates: [{ gate: 'play', expect: 'the reversal: slid 20 px right of its landing without lifting it is right, and only right' }] },
  { name: 'FITS2_NO_STRIP', task: 'T0.8b review', file: 'page', find: 'var fits2 = avail >= T.TOP_STRIP + T.VIEW_ROWS_MIN * K.CELL * 2 + T.CONTROL_STRIP;',
    repl: 'var fits2 = avail >= T.TOP_STRIP + T.VIEW_ROWS_MIN * K.CELL * 2;',
    gates: [{ gate: 'play', expect: '1366x843: the canvas is 1x, 384 CSS px wide' }] },
  { name: 'CANVAS_TAKES_POINTERS', task: 'T0.8b review', file: 'page', find: 'pointer-events: none; background: var(--ink); }', repl: 'background: var(--ink); }',
    gates: [{ gate: 'play', expect: 'Again leaves nothing painted over the play area' }] },
  { name: 'STRIP_KEEPS_PRESSED', task: 'T0.8b review', file: 'page', find: "down = { L: {}, R: {}, A: {}, B: {} }; edge.A = 0; edge.B = 0; if (I._stripReset) I._stripReset(); };",   /* re anchored after the M1 review */
    repl: "down = { L: {}, R: {}, A: {}, B: {} }; edge.A = 0; edge.B = 0; };",
    gates: [{ gate: 'play', expect: 'a blur releases a held thumb and its pad stops showing right' }] },   /* since the stick's review the thumb re centres at Resume and presses on its own move, so the lit pad names it */
  /* TITLE_UNDER_ROCKER, retired at NOTE3 (QUESTIONS Q94): the strip's Title it watched at 320x568 is gone; Pause in the top
     strip is watched by TITLE_BACK_IN_STRIP and PAUSE_OVERHANG_UNDER (layout) and the pause gate's rows */
  { name: 'EXIT_HIGHEST_INDEX', task: 'T0.8b review', file: 'page', find: 'if (standableIn(level, lit[q]) && d[lit[q]] >= 0 && (lc < 0 || d[lit[q]] > d[lc])) lc = lit[q];',
    repl: 'if (standableIn(level, lit[q]) && d[lit[q]] >= 0 && (lc < 0 || d[lit[q]] >= d[lc])) lc = lit[q];',
    gates: [{ gate: 'harness', only: 'H-pipe-12', expect: "sample-room: the exit equals the test's own rule" }] },
  { name: 'PHASE_ZERO', task: 'T0.8b review', file: 'page', find: '  var PHASE = STEP_MS / 4;', repl: '  var PHASE = 0;',
    gates: [{ gate: 'play', expect: 'frame by frame the page ran the steps the accumulator owes' }] },
  /* ROCKER_NO_ADOPT became STICK_NO_ADOPT at Q140 */
  { name: 'STICK_NO_ADOPT', task: 'STICK', file: 'page', find: '      if (k === 0) setDir(stickPtrs.length ? dirOf(stickAt[stickPtrs[0]], null) : null);', repl: '      if (k === 0) setDir(null);',
    gates: [{ gate: 'play', expect: 'the first lifted, the thumb still down takes over from its own landing point' }] },
  { name: 'CHIP_OVER_PLAY', task: 'T0.8b review', file: 'page', find: "    document.body.classList.toggle('playing', name === 'play' || name === 'crop');", repl: '',
    gates: [{ gate: 'play', expect: "in play the fleet's chip, pill, card and toast are hidden" }] },
  { name: 'BEACON_PULSE_BY_FRAME', task: 'T0.8b review', file: 'page', find: 'pulse = ((now === undefined ? performance.now() : now) / 400) | 0;', repl: 'pulse = (pulse + 1) | 0;',
    gates: [{ gate: 'play', expect: 'the beacon pulses by the clock' }] },
  { name: 'LIGHT_TIE_TO_SMALLER', task: 'T0.8b review', file: 'page', find: 'if (peak > bestPeak) { bestPeak = peak; light = lights[i]; }', repl: 'if (peak >= bestPeak) { bestPeak = peak; light = lights[i]; }',
    gates: [{ gate: 'harness', only: 'H-pipe-12', expect: 'two clusters that both peak at Glare' }] },
  { name: 'EXIT_ROWS_5', task: 'T0.8b review', file: 'page', find: 'SPAWN_ROW_FROM_BOTTOM: 2, EXIT_ROWS: 4,', repl: 'SPAWN_ROW_FROM_BOTTOM: 2, EXIT_ROWS: 5,',
    gates: [{ gate: 'harness', only: 'H-pipe-12', expect: 'a Glare lamp in row 4, under the top four rows, is not the light' }] },
  { name: 'EXIT_FALLBACK_DARKEST', task: 'T0.8b review', file: 'page', find: 'if (standableIn(level, c) && (bl < 0 || level.L[c] > level.L[bl])) bl = c;',
    repl: 'if (standableIn(level, c) && (bl < 0 || level.L[c] < level.L[bl])) bl = c;',
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
    gates: [{ gate: 'lint', expect: 'forbidden token "constructor"' }] },
  /* review 5 (T1.1 and T1.2a, 30 Oct): every guard the review found untested, and the fixes it asked for */
  { name: 'POCKET_OK_BYPASSED', task: 'review 5', file: 'page', find: '      var chk = pocketOk(level, c);\n', repl: '      var chk = { ok: true, cells: c.hollow.concat(c.tunnel) };\n',
    gates: [{ gate: 'harness', only: 'H-feat-5', expect: 'the pocket placed is another' }] },
  { name: 'TUNNEL_UNDER_OPEN_AIR', task: 'review 5', file: 'page', find: 'if (!sol(tx, ty + 1) || !inL(tx, ty - 1)) { ok = false; break; }', repl: 'if (!sol(tx, ty + 1)) { ok = false; break; }',
    gates: [{ gate: 'harness', only: 'H-feat-5', expect: 'every tunnel cell has a roof of its landmark' }] },
  { name: 'CHEST_IN_THE_PIT', task: 'review 5', file: 'page', find: "d[c] >= 0 && standable(level, c) && (!back || back[c]); };\n    var focal", repl: "d[c] >= 0 && standable(level, c); };\n    var focal",
    gates: [{ gate: 'harness', only: 'H-feat-1', expect: 'the pit: deepest into a branch is' }] },
  { name: 'DOOR_IN_THE_PIT', task: 'review 5', file: 'page', find: 'stands.indexOf(c) >= 0 || (back && !back[c])) continue;', repl: 'stands.indexOf(c) >= 0) continue;',
    gates: [{ gate: 'harness', only: 'H-feat-4', expect: 'a bright rectangle on the floor of a pit gets no door' }] },
  { name: 'SPECK_IN_THE_PIT', task: 'review 5', file: 'page', find: 'if (d[cc] >= 0 && standable(level, cc) && (!back || back[cc])) return cc;', repl: 'if (d[cc] >= 0 && standable(level, cc)) return cc;',
    gates: [{ gate: 'harness', only: 'H-feat-2', expect: 'the pit: its lone Sun cell' }] },
  { name: 'SCROLL_IN_THE_PIT', task: 'review 5', file: 'page', find: '      var ok = function (c) { return !skip[c] && d[c] >= 0 && standable(level, c) && (!back || back[c]); };', repl: '      var ok = function (c) { return !skip[c] && d[c] >= 0 && standable(level, c); };',
    gates: [{ gate: 'harness', only: 'H-feat-2', expect: 'the pit: its lone Sun cell' }] },
  { name: 'BAND_TIE_HIGH', task: 'review 5', file: 'page', find: 'if (best < 0 || votes[b] > votes[best]) best = b;', repl: 'if (best < 0 || votes[b] >= votes[best]) best = b;',
    gates: [{ gate: 'harness', only: 'H-pipe-11', expect: 'equal hue bands' }] },
  { name: 'BAND_TIE_BY_BAND_INDEX', task: 'review 5', file: 'page', find: 'for (i = 0; i < P.N; i++) { b = P.BAND[i]; if (b < 0 || seen[b]) continue; seen[b] = 1; if (best < 0 || votes[b] > votes[best]) best = b; }',
    repl: 'for (b = 0; b < votes.length; b++) if (best < 0 || votes[b] > votes[best]) best = b;',
    gates: [{ gate: 'harness', only: 'H-pipe-11', expect: 'equal hue bands' }] },
  { name: 'BRIGHT_TIE_LATER', task: 'review 5', file: 'page', find: 'if (!best || area > best.area || (area === best.area && (tl < best.tl || (tl === best.tl && br < best.br)))) best =', repl: 'if (!best || area >= best.area) best =',
    gates: [{ gate: 'harness', only: 'H-pipe-11', expect: 'equal bright rectangles' }] },
  { name: 'FROST_AT_THE_MEAN', task: 'review 5', file: 'page', find: 'return sumL > T.FROST_MEAN_L * n ? 1 : 0;', repl: 'return sumL >= T.FROST_MEAN_L * n ? 1 : 0;',
    gates: [{ gate: 'harness', only: 'H-bio-3', expect: 'a grid whose mean is exactly FROST_MEAN_L' }] },
  { name: 'FROST_AT_160', task: 'review 5', file: 'page', find: 'return sumL > T.FROST_MEAN_L * n ? 1 : 0;', repl: 'return sumL > 160 * n ? 1 : 0;',
    gates: [{ gate: 'harness', only: 'H-bio-3', expect: 'a grid whose mean is exactly FROST_MEAN_L' }] },
  { name: 'STICKY_UNCAPPED', task: 'review 5', file: 'page', find: 'r < runs.length && r < T.CAP_STICKY; r++', repl: 'r < runs.length; r++',
    gates: [{ gate: 'harness', only: 'H-bio-4', expect: 'the sticky set is the first CAP_STICKY' }] },
  { name: 'STICKY_COLUMN_ORDER', task: 'review 5', file: 'page', find: '    runs.sort(function (a, b) { return a[0] - b[0]; });\n    for (var r = 0;', repl: '    for (var r = 0;',
    gates: [{ gate: 'harness', only: 'H-bio-4', expect: 'the sticky set is the first CAP_STICKY' }] },
  { name: 'STICKY_ONE_SHORTER', task: 'review 5', file: 'page', find: 'if (e - y + 1 >= T.STICKY_RUN_MIN) runs.push', repl: 'if (e - y + 1 >= T.STICKY_RUN_MIN - 1) runs.push',
    gates: [{ gate: 'harness', only: 'H-bio-4', expect: 'the sticky set is the first CAP_STICKY' }] },
  { name: 'STICKY_ONE_TALLER', task: 'review 5', file: 'page', find: 'if (e - y + 1 >= T.STICKY_RUN_MIN) runs.push', repl: 'if (e - y + 1 > T.STICKY_RUN_MIN) runs.push',
    gates: [{ gate: 'harness', only: 'H-bio-4', expect: 'the sticky set is the first CAP_STICKY' }] },
  { name: 'SLICK_SPARES_FALLS', task: 'review 5', file: 'page', find: '      if (slides(to, dir, dx)) return;\n', repl: "      if (kind !== 'FALL' && kind !== 'JUMP_DOWN' && slides(to, dir, dx)) return;\n",
    gates: [{ gate: 'harness', only: 'H-bio-5', expect: 'falls and drops onto the run' }] },
  { name: 'SLICK_PAST_THE_FRAME', task: 'review 5', file: 'page', find: 'if (x2 < 0 || x2 >= w || solid[c]) return false;', repl: 'if (solid[c]) return false;',   /* re anchored at T1.5 (slides() walks FROST_SLIDE_CELLS cells) */
    gates: [{ gate: 'harness', only: 'H-bio-5', expect: 'a run against the frame keeps its landings' }] },
  { name: 'CHEST_IGNORES_LADDER', task: 'review 5', file: 'page', find: '    if (f.ladder && ok(f.ladder.top)) return f.ladder.top;\n', repl: '',
    gates: [{ gate: 'harness', only: 'H-feat-1', expect: 'with the chest on its top' }] },
  { name: 'CHEST_FIRST_OK', task: 'review 5', file: 'page', find: '    best = deepest(level, g, d, ok);\n    if (best >= 0) return best;\n    var far = -1;', repl: '    for (i = 0; i < n; i++) if (ok(i)) return i;\n    var far = -1;',
    gates: [{ gate: 'harness', only: 'H-feat-1', expect: 'the chest keeps Q34\'s order' }] },
  { name: 'LADDER_OF_FOUR', task: 'review 5', file: 'page', find: 'LADDER_MIN_RUNS: 3,', repl: 'LADDER_MIN_RUNS: 4,',
    gates: [{ gate: 'harness', only: 'H-feat-1', expect: 'three one ways stacked 3 rows apart are a ladder' }] },
  { name: 'LADDER_OF_TWO', task: 'review 5', file: 'page', find: 'LADDER_MIN_RUNS: 3,', repl: 'LADDER_MIN_RUNS: 2,',
    gates: [{ gate: 'harness', only: 'H-feat-1', expect: 'two stacked are no ladder' }] },
  { name: 'DOOR_CLAIM_DROPPED', task: 'review 5', file: 'page', find: '    if (f.door) { var r = f.door.rect; for (var yy = r[1]; yy <= r[3]; yy++) for (var xx = r[0]; xx <= r[2]; xx++) sat[yy * w + xx] = 0; }\n', repl: '',
    gates: [{ gate: 'harness', only: 'H-en-1b', expect: 'no moth in the doorway' }] },
  { name: 'POCKET_CLAIM_DROPPED', task: 'review 5', file: 'page', find: 'if (f.pocket) { claim(f.pocket.cells); for', repl: 'if (f.pocket) { for',
    gates: [{ gate: 'harness', only: 'H-en-1b', expect: 'the enemies are its own elite' }] },
  { name: 'PLACE_THROUGH_EXIT', task: 'review 5', file: 'page', find: 'var d = SB.reach.distances(g, level.spawn, level.exit), back = returnable(level, g, 3 * g.n);', repl: 'var d = SB.reach.distances(g, level.spawn), back = returnable(level, g, 3 * g.n);',
    gates: [{ gate: 'harness', only: 'H-feat-1', expect: 'reached without passing the exit' }] },
  { name: 'BRANCH_THROUGH_EXIT', task: 'review 5', file: 'page', find: 'es = u === level.exit ? null : g.adj[u];', repl: 'es = g.adj[u];',
    gates: [{ gate: 'harness', only: 'H-feat-1', expect: 'the chest keeps Q34\'s order' }] },
  /* T1.3: the route with placements, the two round ascent, the degrade ladder */
  { name: 'SAFE_DIST_ZERO', task: 'T1.3', file: 'page', find: 'var r = T.ROUTE_SAFE_ENEMY_DIST, x0 = e.idx % w, y0 = (e.idx - x0) / w;', repl: 'var r = 0, x0 = e.idx % w, y0 = (e.idx - x0) / w;',
    gates: [{ gate: 'harness', only: 'H-route-9', expect: 'a moth 2 rows over the ledge' }] },
  { name: 'ENVELOPE_IGNORED', task: 'T1.3', file: 'page', find: '      if (e.env) for (q = 0; q < e.env.length; q++) if (e.env[q] >= 0 && e.env[q] < n) safe[e.env[q]] = 0;\n', repl: '',
    gates: [{ gate: 'harness', only: 'H-route-9', expect: 'a crawler at the left end of a 20 cell ledge' }] },
  { name: 'DEGRADE_SKIPS_RECHECK', task: 'T1.3', file: 'page', find: 'level.degraded.push(DEGRADE.ENEMY, e.idx); if (check()) return null; }', repl: 'level.degraded.push(DEGRADE.ENEMY, e.idx); return null; }',
    gates: [{ gate: 'harness', only: 'H-route-10', expect: 'two moths' }] },
  { name: 'TRAP_EDGES_KEPT', task: 'T1.3', file: 'page', find: '    if (!any) return g;\n    var walled = level.solid.slice();', repl: '    return g;\n    var walled = level.solid.slice();',
    gates: [{ gate: 'harness', only: 'H-route-10', expect: 'a trap band across the room' }] },
  { name: 'ROUND_TWO_SKIPPED', task: 'T1.3', file: 'page', find: '    if (check()) return null;\n    var k = nearestEnemy(level);', repl: '    return null;\n    var k = nearestEnemy(level);',
    gates: [{ gate: 'harness', only: 'H-route-10', expect: 'a moth between two planks' }] },
  { name: 'LADDER_SKIPS_THE_TRAP', task: 'T1.3', file: 'page', find: '    if (f.trap) {\n      for (var q = 0; q < f.trap.length; q++) level.trap[f.trap[q]] = 0;', repl: '    if (false) {\n      for (var q = 0; q < f.trap.length; q++) level.trap[f.trap[q]] = 0;',
    gates: [{ gate: 'harness', only: 'H-route-10', expect: 'a trap band across the room' }] },
  /* T1.4: the enemy sim */
  { name: 'ICICLE_RANGE_3', task: 'T1.4', file: 'page', find: 'if (Math.abs(hc - ic) <= T.ICICLE_TRIGGER_COLS && h.y > en.y)', repl: 'if (Math.abs(hc - ic) <= T.ICICLE_TRIGGER_COLS + 1 && h.y > en.y)',
    gates: [{ gate: 'harness', only: 'H-en-5', expect: 'columns off drops it' }] },
  { name: 'CRAWLER_FALLS_OFF', task: 'T1.4', file: 'page', find: 'var x0 = a * CS, x1 = Math.max(x0, (b + 1) * CS - sz), pr = ', repl: 'var x0 = a * CS, x1 = Math.max(x0, (b + 2) * CS - sz), pr = ',   /* re anchored after the M1 review's pocket turn */
    gates: [{ gate: 'harness', only: 'H-en-6', expect: 'over 900 steps it spans' }] },
  { name: 'SPARK_HOPS_INTO_WALL', task: 'T1.4', file: 'page', find: 'if (env[q] !== here && standCell(lv, env[q])) cands.push(env[q]);', repl: 'if (env[q] !== here) cands.push(env[q]);',
    gates: [{ gate: 'harness', only: 'H-en-7', expect: 'every landing a standable cell' }] },
  { name: 'JELLY_THROUGH_CEILING', task: 'T1.4', file: 'page', find: 'while (up < T.JELLY_BOB_CELLS && !solidAt(lv, col, row - up - 1) && !platAt(lv, col, row - up - 1)) up++;', repl: 'while (up < T.JELLY_BOB_CELLS) up++;',
    gates: [{ gate: 'harness', only: 'H-en-8', expect: 'in an open column its extremes' }] },
  { name: 'ELITE_HP_SINGLE', task: 'T1.4', file: 'page', find: 'return elite ? hp * T.ELITE_HP_MULT : hp;', repl: 'return hp;',
    gates: [{ gate: 'harness', only: 'H-en-9', expect: 'elite has ELITE_HP_MULT times its HP' }] },
  { name: 'POCKET_ELITE_ROAMS', task: 'T1.4', file: 'page', find: '    if (pk) {\n      var r = pk.rect;', repl: '    if (false) {\n      var r = pk.rect;',
    gates: [{ gate: 'harness', only: 'H-en-9', expect: 'the pocket\'s elite sleeps' }] },
  { name: 'POCKET_ELITE_AWAKE', task: 'T1.4', file: 'page', find: 'stunned: el && pocketOf(level, e.idx) ? -1 : 0, hurt: 0 };', repl: 'stunned: 0, hurt: 0 };',   /* re anchored at W1 (hurt joined the enemy) */
    gates: [{ gate: 'harness', only: 'H-en-9', expect: 'the pocket\'s elite sleeps' }] },
  { name: 'HELD_STILL_HARMS', task: 'T1.4', file: 'page', find: '      if (held || !liveEnemy(en)) continue;', repl: '      if (!liveEnemy(en)) continue;',
    gates: [{ gate: 'harness', only: 'H-en-9', expect: 'a frozen moth on the hero' }] },
  { name: 'ENEMY_IN_THE_PLANK', task: 'T1.4', file: 'page', find: 'level.solid[c] || level.plat[c] || level.trap[c] || inPocket[c] || near[c]) return false;', repl: 'level.solid[c] || level.trap[c] || inPocket[c] || near[c]) return false;',
    gates: [{ gate: 'harness', only: 'H-feat-6', expect: 'an enemy on a solid, one way or trap cell' }] },
  { name: 'JELLY_INTO_THE_PLANK', task: 'T1.4', file: 'page', find: '!solidAt(lv, col, row - up - 1) && !platAt(lv, col, row - up - 1)) up++;', repl: '!solidAt(lv, col, row - up - 1)) up++;',
    gates: [{ gate: 'harness', only: 'H-en-8', expect: 'under a one way on row 28' }] },
  /* T1.4b: the trap sim */
  { name: 'TRAP_ALWAYS_ON', task: 'T1.4b', file: 'page', find: 'if (s.traps.phase >= (K.TRAP_PERIOD_F >> 1) && !s.immortal', repl: 'if (!s.immortal',
    gates: [{ gate: 'harness', only: 'H-trap-1', expect: 'phases a hero standing in the field is hit exactly in the second half' }] },
  { name: 'TRAP_PHASE_EVERYWHERE', task: 'T1.4b', file: 'page', find: '    if (lv.features && lv.features.trap) {\n      s.traps.phase = (s.traps.phase + 1) % K.TRAP_PERIOD_F;', repl: '    s.traps.phase = (s.traps.phase + 1) % K.TRAP_PERIOD_F;\n    if (lv.features && lv.features.trap) {',
    gates: [{ gate: 'harness', only: 'H-trap-1', expect: 'after 100 steps the phase' }] },
  { name: 'TRAP_KNOCK_TOWARD', task: 'T1.4b', file: 'page', find: 'hitHero(s, 2 * h.x + K.HERO_W_SUB < mid2 ? -1 : 1);', repl: 'hitHero(s, 2 * h.x + K.HERO_W_SUB < mid2 ? 1 : -1);',
    gates: [{ gate: 'harness', only: 'H-trap-1', expect: 'the hit is an enemy' }] },
  { name: 'TRAP_BESIDE_THE_CLIMB', task: 'T1.4b', file: 'page', find: 'if (taken[c]) { clash = true; break; } if (beside[c]) continue; cells.push(c); }', repl: 'if (taken[c]) { clash = true; break; } cells.push(c); }',
    gates: [{ gate: 'harness', only: 'H-trap-2', expect: 'the walker is never in it while it is on' }] },
  /* T1.6: loot, the scroll offer, the CHOICE word */
  { name: 'HEART_CAP_9', task: 'T1.6', file: 'page', find: 'var grown = Math.min(T.HEARTS_CAP, T.HEARTS_BASE', repl: 'var grown = Math.min(T.HEARTS_CAP + 1, T.HEARTS_BASE',
    gates: [{ gate: 'harness', only: 'H-loot-2', expect: 'after 1 to 15 scrolls the hearts are' }] },
  { name: 'SIM_RUNS_UNDER_SHEET', task: 'T1.6', file: 'page', find: 'if (s.scrollsOffered) { if (choice === CHOICE.A || choice === CHOICE.B) pickScroll(s, s.scrollsOffered[choice - 1]); s.frame++; return s; }', repl: 'if (s.scrollsOffered && (choice === CHOICE.A || choice === CHOICE.B)) { pickScroll(s, s.scrollsOffered[choice - 1]); s.frame++; return s; }',
    /* the loot gate's row left with the sheets (Q92): the shell answers on the very next word, a step the sim holds either way */
    gates: [{ gate: 'harness', only: 'H-sim-19', expect: 'without the choice word the replay stalls at the offer' }] },
  /* re anchored at NOTE5 on the shell's own answer (the pick buttons left with the sheets): the same mutation, the shell
     writing the stat itself with no word recorded */
  { name: 'CHOICE_VIA_SHELL', task: 'T1.6', file: 'page', find: '      if (st.scrollsOffered) SB.input.choose(SB.sim.CHOICE.A);', repl: '      if (st.scrollsOffered) SB.sim.pickScroll(st, st.scrollsOffered[0]);',
    gates: [{ gate: 'loot', expect: '412: the recording carries the one answer' }] },   /* W1: the chest answers nothing now */
  { name: 'GRACE_ONE_SHORT', task: 'T1.6', file: 'page', find: 'else { s.room.grace = T8.PICKUP_GRACE_FRAMES; s.room.offerWait = 1; }', repl: 'else { s.room.grace = T8.PICKUP_GRACE_FRAMES - 1; s.room.offerWait = 1; }',
    gates: [{ gate: 'harness', only: 'H-loot-3', expect: 'PICKUP_GRACE_FRAMES or more after the touch' }] },
  { name: 'OFFER_IN_THE_AIR', task: 'T1.6', file: 'page', find: 'if (s.room.offerWait && s.room.grace === 0 && h.ground) {', repl: 'if (s.room.offerWait && s.room.grace === 0) {',
    gates: [{ gate: 'harness', only: 'H-loot-3', expect: 'opens its offer on landing, never in the air' }] },
  { name: 'SPECK_DP_FIXED', task: 'T1.6', file: 'page', find: 's.room.dp += T8.DP_SPECK[0] + SB.rng.stepU32(s, \'rng\') % (T8.DP_SPECK[1] - T8.DP_SPECK[0] + 1);', repl: 's.room.dp += T8.DP_SPECK[0];',
    gates: [{ gate: 'harness', only: 'H-loot-1', expect: 'the walk banks' }] },
  { name: 'OFFER_UNBIASED', task: 'T1.6', file: 'page', find: 'var bias = STAT_OF_BIOME[s.biome] || VIGOR,', repl: 'var bias = VIGOR,',
    gates: [{ gate: 'harness', only: 'H-loot-3', expect: 'the biome\'s stat first in' }] },
  /* T1.7: the SFX set */
  { name: 'LAND_EVERY_FRAME', task: 'T1.7', file: 'page', edits: [["      if (ev & EV.LAND) au.sfx('land', G.state.hero.shake > 0);\n", ''], ['    SB.ui.sheets(G.state);\n', "    if (G.state.hero.ground) au.sfx('land', G.state.hero.shake > 0);\n    SB.ui.sheets(G.state);\n"]], find: null, repl: null,
    gates: [{ gate: 'audio', expect: 'a dive landing schedules two voices' }] },
  { name: 'SETTING_IGNORED', task: 'T1.7', file: 'page', find: "var live = function () { return !!A.ctx && !A.muted && A.ctx.state === 'running'; };", repl: "var live = function () { return !!A.ctx && A.ctx.state === 'running'; };",
    gates: [{ gate: 'audio', expect: 'with the sound off a jump is asked for and nothing is scheduled' }] },
  { name: 'AUDIO_FILE_REQUEST', task: 'T1.7', file: 'page', find: "A.init = function () { document.addEventListener('pointerdown', unlock, { capture: true, once: true }); };", repl: "A.init = function () { try { new Audio('sfx/jump.mp3').load(); } catch (e) {} document.addEventListener('pointerdown', unlock, { capture: true, once: true }); };",
    gates: [{ gate: 'audio', expect: 'no <audio> element' }] },
  /* T1.8: sharing */
  { name: 'SHARE_DROPS_FOCAL', task: 'T1.8', file: 'page', find: "function linkOf(origin, pathname, rec) { return origin + pathname + '#' + encode(rec); }", repl: "function linkOf(origin, pathname, rec) { return origin + pathname + '#' + encode(Object.assign({}, rec, { focal: null })); }",
    gates: [{ gate: 'harness', only: 'H-share-2', expect: 'records round trip through their links' }] },
  { name: 'PREFIX_CHECK_DROPPED', task: 'T1.8', file: 'page', find: "    if (p.slice(0, 3) === 'v' + V + '.') p = p.slice(3);\n    else if (p.indexOf('.') >= 0) return null;\n", repl: "    p = p.slice(3);\n",
    gates: [{ gate: 'harness', only: 'H-share-1', expect: 'a paste of without its v1. prefix opens the same record' }] },
  /* T1.10: the save */
  { name: 'SECOND_KEY', task: 'T1.10', file: 'page', find: "try { localStorage.setItem('shutterbug.v1', JSON.stringify(S.doc)); S.writes++; }", repl: "try { localStorage.setItem('shutterbug.v1', JSON.stringify(S.doc)); localStorage.setItem('shutterbug.settings', JSON.stringify(S.doc.settings)); S.writes++; }",
    gates: [{ gate: 'save', expect: 'exactly one key not prefixed sws_ is written' }] },
  { name: 'WRITE_25_ROOMS', task: 'T1.10', file: 'page', find: 'S.doc.recent = [j].concat(S.doc.recent.filter(function (r) { return !same(r); })).slice(0, 20);', repl: 'S.doc.recent = [j].concat(S.doc.recent.filter(function (r) { return !same(r); })).slice(0, 25);',
    gates: [{ gate: 'save', expect: '25 rooms added keep 20' }] },
  { name: 'SETITEM_UNGUARDED', task: 'T1.10', file: 'page', find: "    try { localStorage.setItem('shutterbug.v1', JSON.stringify(S.doc)); S.writes++; } catch (e) { /* quota or private mode: the game runs on */ }\n", repl: "    localStorage.setItem('shutterbug.v1', JSON.stringify(S.doc)); S.writes++;\n",
    gates: [{ gate: 'save', expect: 'with setItem throwing the game runs on' }] },
  /* T1.11: the PWA */
  { name: 'REGISTER_WHEN_EMBEDDED', task: 'T1.11', file: 'page', find: "if (!window.SWS_EMBED && navigator.serviceWorker) window.addEventListener('load',", repl: "if (navigator.serviceWorker) window.addEventListener('load',",
    gates: [{ gate: 'pwa', expect: 'with ?embed=1 and inside the wrapper iframe no worker registers' }] },
  { name: 'SW_WIPES_OTHER_CACHES', task: 'T1.11', file: 'sw', find: "return k.indexOf('shutterbug-') === 0 && k !== CACHE;", repl: 'return k !== CACHE;',
    gates: [{ gate: 'lint', expect: 'SW_DELETE' }, { gate: 'pwa', expect: "the update leaves another game's cache on the origin alone" }] },
  /* the M1 review: the lint's rule is textual, and this one token slip passes it; only the pwa gate's planted cache sees it */
  { name: 'SW_WIPES_PAST_THE_PREFIX', task: 'M1R', file: 'sw', find: "return k.indexOf('shutterbug-') === 0 && k !== CACHE;", repl: "return (k.indexOf('shutterbug-') === 0 || k.length > 0) && k !== CACHE;",
    gates: [{ gate: 'pwa', expect: "the update leaves another game's cache on the origin alone" }] },
  { name: 'SW_CACHES_ROOT_FILES', task: 'T1.11', file: 'sw', find: '  if (!req.url.startsWith(self.registration.scope)) return;\n', repl: '',
    gates: [{ gate: 'lint', expect: 'SW_SCOPE' }, { gate: 'pwa', expect: "under the worker the fleet's root files come from the network, never the worker" }] },
  { name: 'RELOAD_ON_CONTROLLERCHANGE', task: 'T1.11', file: 'page', find: "  window.addEventListener('beforeinstallprompt',", repl: "  if (navigator.serviceWorker) navigator.serviceWorker.addEventListener('controllerchange', function () { location.reload(); });\n  window.addEventListener('beforeinstallprompt',",
    gates: [{ gate: 'lint', expect: 'RELOAD' }, { gate: 'pwa', expect: 'the new worker causes no navigation of its own' }] },
  /* re anchored at the sb-m1-3 stamp (the registration is ?v=3 now) */
  { name: 'STAMP_SPLIT', task: 'T1.11', file: 'page', find: "register('./sw.js?v=3')", repl: "register('./sw.js?v=4')",
    gates: [{ gate: 'lint', expect: 'STAMP' }] },
  /* the card review's follow up, due at the sb-m1-2 stamp: the worker reads its own cache only; with no cacheName the
     foreign copy the gate plants before the install answers the offline shell */
  { name: 'SW_MATCHES_ANY_CACHE', task: 'M1R', file: 'sw', find: 'function own(u) { return caches.match(u, { cacheName: CACHE }); }', repl: 'function own(u) { return caches.match(u); }',
    gates: [{ gate: 'pwa', expect: "offline the shell comes from the worker's own cache, never another cache on the origin holding the same URL" }] },
  /* sb-m1-2: page.setOfflineMode never reached the worker, so the offline checks ran online from T1.11 to here and no row
     watched the cached shell; with the worker's target offline too, a worker that drops the fallback is seen */
  { name: 'OFFLINE_NO_SHELL', task: 'M1R', file: 'sw', find: "    if (r) return r;\n    return own('./index.html')", repl: "    if (r) return r;\n    return new Response('offline', { status: 503 });\n    return own('./index.html')",
    gates: [{ gate: 'pwa', expect: "offline the shell comes from the worker's own cache, never another cache on the origin holding the same URL (no title)" }] },
  /* T1.13: the free play loop, the Wallet moments, the fab insurance */
  /* re anchored at NOTE5 (the sheets left the list) and at NOTE3 (Q94: the pause card joined it, and this row's path, the
     strip's Title under an open sheet, is gone; a refused link that arrives with the sheet open is the way left) */
  { name: 'X_LEAVES_OVERLAY', task: 'T1.13', file: 'page', find: "var OVERLAYS = ['clear', 'death', 'paused', 'sharesheet', 'swap'];", repl: "var OVERLAYS = ['clear', 'death', 'paused', 'swap'];",   /* re anchored at W2 */
    gates: [{ gate: 'loop', expect: 'a refused link with the share sheet open: the title with nothing over it' }] },
  { name: 'MOMENT_TWICE', task: 'T1.13', file: 'page', find: 'if (!S.doc || !framed || S.doc.moments[name]) return false;', repl: 'if (!S.doc || !framed) return false;',
    gates: [{ gate: 'loop', expect: 'inside the wrapper iframe two clears' }] },
  { name: 'FAB_OVER_SHEET', task: 'T1.13', file: 'page', find: 'body.sb-modal .lwfb-fab { display: none !important; }', repl: 'body.sb-modal .lwfb-fab { }',
    gates: [{ gate: 'loop', expect: 'round 1: the share sheet over the pause screen' }] },   /* NOTE3: the room's sheet opens from the pause card */
  /* re anchored at NOTE5R (the bank's line names the count it came from, so the room's count is read once): the same
     mutation, the room's full count banked */
  { name: 'BANK_FULL_RATE', task: 'T1.13', file: 'page', find: 'n = Math.floor(dp * SB.TUNING.DP_FREE_PLAY_MULT)', repl: 'n = Math.floor(dp)',
    gates: [{ gate: 'loop', expect: 'round 1: banked at x0.5 floored' }] },
  { name: 'SHARE_CLOSE_TO_PLAY', task: 'T1.13', file: 'page', find: "if (ui.screen === 'share') ui.screen = ui.shareFrom || 'play';", repl: "if (ui.screen === 'share') ui.screen = 'play';",
    gates: [{ gate: 'loop', expect: 'round 1: the share sheet over the clear screen' }, { gate: 'pause', expect: '412x915: Share this room opens the sheet over the pause card' }] },
  /* T1.9a: the QR encoder */
  { name: 'RS_WRONG_POLY', task: 'T1.9a', file: 'page', find: 'var POLY = 0x11d, EXP = new Uint8Array(512)', repl: 'var POLY = 0x12d, EXP = new Uint8Array(512)',
    gates: [{ gate: 'harness', only: 'H-qr-1', expect: 'HELLO WORLD 1-M: its 10 published EC codewords' }] },
  { name: 'MASK_UNSCORED', task: 'T1.9a', file: 'page', find: 'if (!best || p < best.penalty) best = { version: v', repl: 'if (!best) best = { version: v',
    gates: [{ gate: 'harness', only: 'H-qr-4', expect: 'the chosen masks are not all mask 0' }] },
  { name: 'FORMAT_UNMASKED', task: 'T1.9a', file: 'page', find: 'return (d << 10 | r) ^ 0x5412;', repl: 'return d << 10 | r;',
    gates: [{ gate: 'harness', only: 'H-qr-1', expect: 'the format string for level L, mask 0' }] },
  { name: 'NO_INTERLEAVE', task: 'T1.9a', file: 'page', find: 'for (j = 0; j <= b[2]; j++) for (i = 0; i < nb; i++) if (j < blocks[i].length) out.push(blocks[i][j]);', repl: 'for (i = 0; i < nb; i++) for (j = 0; j < blocks[i].length; j++) out.push(blocks[i][j]);',
    gates: [{ gate: 'harness', only: 'H-qr-3', expect: 'Reed Solomon of its data' }] },
  { name: 'COLUMN_6_NOT_SKIPPED', task: 'T1.9a', file: 'page', find: '        if (right === 6) right = 5;\n', repl: '',
    gates: [{ gate: 'harness', only: 'H-qr-2', expect: 'the 7 EC codewords are the Reed Solomon of the data' }] },
  { name: 'VERSION_ONE_COPY', task: 'T1.9a', file: 'page', find: 'this.set(a, b, dark); this.set(b, a, dark); }', repl: 'this.set(a, b, dark); }',
    gates: [{ gate: 'harness', only: 'H-qr-3', expect: 'both version copies read 010100100110100110' }] },
  /* T1.9b: the QR drawer */
  { name: 'QUIET_ZONE_0', task: 'T1.9b', file: 'page', find: '  var QUIET = 4;\n', repl: '  var QUIET = 0;\n',
    gates: [{ gate: 'share', expect: 'its quiet zone is 4 modules of Paper on every side' }] },
  { name: 'QR_OPEN_BY_DEFAULT', task: 'T1.9b', file: 'page', find: "document.getElementById('qrdrawer').hidden = true; document.getElementById('qrtoggle').textContent = ui.COPY.qrShow;", repl: "document.getElementById('qrdrawer').hidden = false; document.getElementById('qrtoggle').textContent = ui.COPY.qrShow;",
    gates: [{ gate: 'share', expect: 'the QR drawer stays closed until asked for' }] },
  { name: 'QR_FOR_DOUBLE_EXPOSURE', task: 'T1.9b', file: 'page', find: "document.getElementById('qrtoggle').hidden = long; document.getElementById('qrlong').hidden = !long;", repl: "document.getElementById('qrtoggle').hidden = false; document.getElementById('qrlong').hidden = true;",
    gates: [{ gate: 'share', expect: "a Double Exposure room's" }] },
  { name: 'SHARE_ROWS_STACKED', task: 'T1.9b', file: 'page', find: '.sharerow { display: flex; gap: 8px; }', repl: '.sharerow { display: flex; flex-direction: column; gap: 8px; }',
    gates: [{ gate: 'share', expect: 'at 412x915 Close, Copy link, the phone\'s Share, Copy code and the QR toggle are all in sight without a scroll' }] },
  /* the Astra cutter (tools/astra_cut.py, the brief's section 9) */
  { name: 'CUT_NO_PALETTE_CHECK', task: 'ASTRA', file: 'astra', find: `                            if hx not in index:\n                                raise Refuse('frame %s pixel (%d, %d) is %s, off the 16 colours' % (name, x, y, hx))\n`, repl: ``,
    gates: [{ gate: 'astra', expect: 'a pixel off the 16 colours is refused for being off the 16 colours' }] },
  { name: 'CUT_SEMI_ALPHA', task: 'ASTRA', file: 'astra', find: `                        elif a != 255:\n                            raise Refuse('frame %s pixel (%d, %d) has alpha %d (only 0 or 255)' % (name, x, y, a))\n`, repl: ``,
    gates: [{ gate: 'astra', expect: 'a pixel at alpha 128 is refused' }] },
  { name: 'CUT_PAETH_WRONG', task: 'ASTRA', file: 'astra', find: `line[x] = (line[x] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255`, repl: `line[x] = (line[x] + (a if pa <= pb and pa <= pc else c if pb <= pc else b)) & 255`,
    gates: [{ gate: 'astra', expect: 'the cut gives back every sprite exactly' }] },
  { name: 'CUT_NO_SOURCE_COMPARE', task: 'ASTRA', file: 'astra', find: `                if src.get(name) != frames[name]:\n                    raise Refuse('frame %s differs from its source grid %s' % (name, e.get('source')))\n`, repl: ``,
    gates: [{ gate: 'astra', expect: 'a PNG that differs from its source grid is refused' }] },
  { name: 'CUT_ZIP_SLIP', task: 'ASTRA', file: 'astra', find: `any(p == '..' for p in n.split('/')):\n                raise Refuse('an unsafe path in the zip: %r' % n)`, repl: `False:\n                raise Refuse('an unsafe path in the zip: %r' % n)`,
    gates: [{ gate: 'astra', expect: 'a path out of the zip (../evil.txt) is refused before a byte is written' }] },
  { name: 'CUT_SUN_ANYWHERE', task: 'ASTRA', file: 'astra', find: `            elif key not in SUN_KEYS and any('e' in s for s in frames.values()):`, repl: `            elif False and any('e' in s for s in frames.values()):`,   /* re anchored at ART3 */
    gates: [{ gate: 'astra', expect: 'Sun in the moth is refused' }] },
  { name: 'CUT_FEET_UNCHECKED', task: 'ASTRA', file: 'astra', find: `                    if '0' not in frames[name].split('/')[-1]:\n                        raise Refuse('hero.%s has no Ink in its feet row' % name)\n`, repl: ``,
    gates: [{ gate: 'astra', expect: 'a hero frame without Ink in its feet row is refused' }] },
  { name: 'CUT_NO_SHA', task: 'ASTRA', file: 'astra', find: `            if sha != str(e.get('sha256', '')).lower():\n                raise Refuse(`, repl: `            if False:\n                raise Refuse(`,
    gates: [{ gate: 'astra', expect: 'a wrong sha256 is refused' }] },
  { name: 'SPLICE_JOINS_LINES', task: 'ASTRA', file: 'astra', find: `body = body[:em.start()] + em.group(1) + em.group(2)`, repl: `body = body[:em.start()] + em.group(2)`,
    gates: [{ gate: 'astra', expect: 'splicing the cut back leaves the page byte for byte' }] },
  /* T1.5: the biome twists in the sim */
  { name: 'DEEP_TABLES_NOT_SWAPPED', task: 'T1.5', file: 'page', find: 'var deep = lv.biome === 2 && !lv.twistOff;', repl: 'var deep = false;',
    gates: [{ gate: 'harness', only: 'H-sim-17', expect: 'a full hold in Deep peaks at' }] },
  { name: 'SLIDE_32PX', task: 'T1.5', file: 'page', find: '    else if (h.vx > 0) h.vx = Math.max(0, h.vx - (h.ground && slickUnder(h, lv, K) ? K.SLICK_DECEL : K.DECEL));', repl: '    else if (h.vx > 0) h.vx = Math.max(0, h.vx - (h.ground && slickUnder(h, lv, K) ? K.SLICK_DECEL >> 1 : K.DECEL));',
    gates: [{ gate: 'harness', only: 'H-sim-16', expect: 'a stop from full run on ice slides' }] },
  { name: 'DEEP_WALKOFF_FALL_G', task: 'T1.5', file: 'page', find: 'h.vy + (h.vy >= 0 && !startedGrounded ? K.DEEP_FALL_G : K.G)', repl: 'h.vy + (h.vy >= 0 ? K.DEEP_FALL_G : K.G)',
    gates: [{ gate: 'harness', only: 'H-sim-17', expect: 'a walk off in Deep falls G on its first airborne step' }] },
  { name: 'TWIST_IN_FIRST_ROOM', task: 'T1.5', file: 'page', find: 'level.twistOff = opts.firstRoom && (level.biome === 1 || level.biome === 2 || level.biome === 3) ? 1 : 0;', repl: 'level.twistOff = 0;',
    gates: [{ gate: 'harness', only: 'H-sim-16', expect: 'the first ever room has no ice' }] },
  { name: 'MODEL_DEEP_IGNORES_TWISTOFF', task: 'T1.5', file: 'page', edits: [['tb = tables(K, lv.twistOff ? 0 : lv.biome | 0)', 'tb = tables(K, lv.biome | 0)'], ['up = lv.biome === 2 && !lv.twistOff ? T.JUMP_UP + T.DEEP_EXTRA_UP : T.JUMP_UP;', 'up = lv.biome === 2 ? T.JUMP_UP + T.DEEP_EXTRA_UP : T.JUMP_UP;']],
    gates: [{ gate: 'harness', only: 'H-sim-17', expect: 'under twistOff (the first ever room) neither the sim nor the model reaches it' }] },

  /* the M1 review (30 Oct, before the M1 deploy): each confirmed finding's fix, watched red */
  { name: 'PERF_OVER_PAIRS', task: 'M1R', file: 'page', find: 'ms = pl.step.length ? p95(pl.step.slice(-300)) + p95(pl.draw.slice(-300)) : -1;', repl: 'ms = pl.frames.length ? p95(pl.frames.slice(-300)).toFixed(1) * 1 : -1;',
    gates: [{ gate: 'loop', expect: 'Settings opens after a room ran unheld' }] },
  { name: 'PERF_DASH', task: 'M1R', file: 'page', find: "(ms >= 0 ? ms.toFixed(1) + ' ms p95' : ui.COPY.perfNone)", repl: "(ms >= 0 ? ms.toFixed(1) + ' ms p95' : '-')",
    gates: [{ gate: 'save', expect: 'a fresh Settings says so in words, no dash' }] },
  { name: 'LINK_TAKES_FIRST_ROOM', task: 'M1R', file: 'page', find: "ui.startRoom(rec, ui.COPY.sharedRoom, { mode: 'code', notFirst: true })", repl: "ui.startRoom(rec, ui.COPY.sharedRoom, { mode: 'code' })",
    gates: [{ gate: 'share', expect: 'a fresh profile opens the link to the sharer' }] },
  { name: 'AGAIN_FORGETS_LINK', task: 'M1R', file: 'page', find: '{ level: G.level, noReveal: true, notFirst: G.notFirst, mode: G.mode }', repl: '{ level: G.level, noReveal: true }',
    gates: [{ gate: 'share', expect: "its death card's Again keeps it a link" }] },
  { name: 'PLAY_AGAIN_FORGETS_LINK', task: 'M1R', file: 'page', find: 'ui.startRoom(G.record, G.name, { level: G.level, notFirst: G.notFirst, mode: G.mode }); };', repl: 'ui.startRoom(G.record, G.name, { level: G.level }); };',
    gates: [{ gate: 'share', expect: "its clear card's Play it again keeps it a link" }] },
  /* SLIP_OVER_OFFER, SHEET_OVER_DEATH, SLIP_NOT_MODAL, OFFER_NOT_CLEARED and SLIPOK_LEAVES retired at NOTE5 with the two
     sheets they watched (QUESTIONS Q92: M1 shows no sheet); T2.5 and T2.7 bring the rules back with the sheets */
  { name: 'REVEAL_SEEN_NOT_SAVED', task: 'M1R', file: 'page', find: '    if (!RV.seen && SB.save.doc && !SB.save.doc.onboarding.revealSeen) { SB.save.doc.onboarding.revealSeen = true; SB.save.commit(); }\n', repl: '',
    gates: [{ gate: 'reveal', expect: 'a new session skips its first reveal on a tap' }] },
  { name: 'REVEAL_SEEN_NOT_LOADED', task: 'M1R', file: 'page', find: '  SB.ui.reveal.seen = !!SB.save.doc.onboarding.revealSeen;\n', repl: '',
    gates: [{ gate: 'reveal', expect: 'a new session skips its first reveal on a tap' }] },
  { name: 'POCKET_CRAWLER_PARKS', task: 'M1R', file: 'page', find: '      if (pr) { x0 = Math.max(x0, pr.rect[0] * CS); x1 = Math.max(x0, Math.min(x1, (pr.rect[2] + 1) * CS - sz)); }\n', repl: '',
    gates: [{ gate: 'harness', only: 'H-en-9', expect: 'crawler elites over the corpus patrol their hollow wall to wall' }] },
  { name: 'POCKET_EMPTY', task: 'M1R', file: 'page', find: '    if (pl >= 0) { cand.push(pl); cand.sort(function (a, b) { return a - b; }); }\n', repl: '',
    gates: [{ gate: 'harness', only: 'H-feat-2', expect: 'the pocket holds no loot at its back' }] },
  { name: 'LADDER_TAKES_ELITE', task: 'M1R', file: 'page', find: '      if (es[k].elite && pk && pk.cells.indexOf(es[k].idx) >= 0) continue;\n', repl: '',
    gates: [{ gate: 'harness', only: 'H-route-10', expect: "a pocket's elite nearer the climb than a moth that breaks it" }] },
  { name: 'KIND_TABLE_SWAPPED', task: 'M1R', file: 'page', find: 'KIND_OF_BIOME = [MOTH, ICICLE, JELLY, CRAWLER, SPARK];', repl: 'KIND_OF_BIOME = [MOTH, JELLY, ICICLE, CRAWLER, SPARK];',
    gates: [{ gate: 'harness', only: 'H-feat-6', expect: ' in frost' }, { gate: 'harness', only: 'H-en-1', expect: "enemies of its biome's kind" }] },
  { name: 'STAT_TABLE_SWAPPED', task: 'M1R', file: 'page', find: 'STAT_OF_BIOME = [VIGOR, FOCUS, FOCUS, GRIT, VIGOR];', repl: 'STAT_OF_BIOME = [VIGOR, GRIT, GRIT, FOCUS, FOCUS];',
    gates: [{ gate: 'harness', only: 'H-loot-3', expect: "the biome's stat first in" }] },
  { name: 'STICKY_IN_FIRST_ROOM', task: 'M1R', file: 'page', find: 'if ((level.biome === 2 || level.biome === 3) && !level.twistOff) markSticky(level);', repl: 'if (level.biome === 2 || level.biome === 3) markSticky(level);',
    gates: [{ gate: 'harness', only: 'H-sim-17', expect: 'the first ever room in Deep and Overgrowth' }] },
  { name: 'TWISTOFF_FROST_ONLY', task: 'M1R', file: 'page', find: 'level.twistOff = opts.firstRoom && (level.biome === 1 || level.biome === 2 || level.biome === 3) ? 1 : 0;', repl: 'level.twistOff = opts.firstRoom && level.biome === 1 ? 1 : 0;',
    gates: [{ gate: 'harness', only: 'H-sim-17', expect: 'the first ever room in Deep and Overgrowth' }] },
  { name: 'NO_PICKUP_EVENT', task: 'M1R', file: 'page', find: 'lt.taken = 1; s.ev |= EV.PICKUP;', repl: 'lt.taken = 1;',
    gates: [{ gate: 'harness', only: 'H-sim-21', expect: 'the loot sets PICKUP, CHEST, OFFER, PICK' }] },
  /* re anchored at W1 (the chest pays a weapon): the same mutation, the chest's event dropped */
  { name: 'NO_CHEST_EVENT', task: 'M1R', file: 'page', find: 's.chest.open = 1; s.room.dp += T8.DP_CHEST; s.ev |= EV.CHEST;', repl: 's.chest.open = 1; s.room.dp += T8.DP_CHEST;',
    gates: [{ gate: 'harness', only: 'H-sim-21', expect: 'the loot sets PICKUP, CHEST, OFFER, PICK' }] },
  { name: 'QR_RULE2_ZERO', task: 'M1R', file: 'page', find: 'if (c === m[y * n + x + 1] && c === m[(y + 1) * n + x] && c === m[(y + 1) * n + x + 1]) score += 3;', repl: 'if (c === m[y * n + x + 1] && c === m[(y + 1) * n + x] && c === m[(y + 1) * n + x + 1]) score += 0;',
    gates: [{ gate: 'harness', only: 'H-qr-4', expect: "the lowest of the test's own" }] },
  { name: 'QR_RULE3_ZERO', task: 'M1R', file: 'page', edits: [['if (!color) score += count(hist) * 40;', 'if (!color) score += count(hist) * 0;'], ['add(run + n, hist); score += count(hist) * 40;', 'add(run + n, hist); score += count(hist) * 0;']],
    gates: [{ gate: 'harness', only: 'H-qr-4', expect: "the lowest of the test's own" }] },
  { name: 'RECENT_UNFILTERED', task: 'M1R', file: 'page', find: 'd.recent = d.recent.filter(function (r) { try { return !!fromJSON(r); } catch (e) { return false; } }).slice(0, 20);', repl: 'd.recent = d.recent.slice(0, 20);',
    gates: [{ gate: 'harness', only: 'H-save-1', expect: 'recent keeps 20 valid records' }] },
  { name: 'SYNTH_THROWS', task: 'M1R', file: 'page', find: "    chest: function (t) { tone('triangle', 523, 523", repl: "    chest: function (t) { undefinedSynth(); tone('triangle', 523, 523",
    gates: [{ gate: 'audio', expect: 'each of the 21 sounds the shell asks for schedules one voice' }] },   /* re anchored at W1 and W2: the weapon voices joined the list */
  { name: 'SOUND_TOGGLE_MISWIRED', task: 'M1R', file: 'page', find: "setBool('setsound', 'sound');", repl: "setBool('setsound', 'music');",
    gates: [{ gate: 'save', expect: 'mirror on, sound off and reduced motion On' }] },
  { name: 'MOTION_IGNORED', task: 'M1R', file: 'page', find: "SB.save.doc.settings.reducedMotion = this.value === 'os' ? null : this.value === 'on'; SB.save.commit();", repl: 'SB.save.commit();',
    gates: [{ gate: 'save', expect: 'mirror on, sound off and reduced motion On' }] },
  { name: 'IMPORT_REFUSES', task: 'M1R', file: 'page', find: "if (!o || o.app !== 'shutterbug' || o.v !== 1 || !o.save || typeof o.save !== 'object') return false;", repl: 'return false;',
    gates: [{ gate: 'save', expect: 'the export text pasted into a wiped save' }] },
  { name: 'QR_WIDTH_ONLY', task: 'M1R', file: 'page', find: "Math.min(336, document.getElementById('qrdrawer').clientWidth, avail) / n", repl: "Math.min(336, document.getElementById('qrdrawer').clientWidth) / n",
    gates: [{ gate: 'share', expect: 'at 375x553 the symbol' }] },
  { name: 'PREVIEW_ONE_GRID', task: 'M1R', file: 'page', find: 'two = rec.mode === 2 && !!rec.pal2;', repl: 'two = false;',
    gates: [{ gate: 'share', expect: 'its preview shows both grids' }] },
  { name: 'QR_FROM_FIELD', task: 'M1R', file: 'page', find: "drawQR(ui.shareLink || document.getElementById('sharelink').value);", repl: "drawQR(document.getElementById('sharelink').value);",
    gates: [{ gate: 'share', expect: 'Copy code with the clipboard refused' }] },
  { name: 'CODE_CARD_RUNS', task: 'M1R', file: 'page', find: "    if (ui.screen === 'play') { SB.input.releaseAll(); ui.screen = 'code'; }\n", repl: '',
    gates: [{ gate: 'share', expect: 'a link by hashchange mid room holds it' }] },
  { name: 'CODEMSG_BELOW_FOLD', task: 'M1R', file: 'page', edits: [['  <div class="actions">\n    <p id="codemsg" role="status" hidden></p>\n', '  <div class="actions">\n'],
    ['<button id="playcode" type="button" data-copy="codePlay"></button></div>\n', '<button id="playcode" type="button" data-copy="codePlay"></button></div>\n    <p id="codemsg" role="status" hidden></p>\n']],
    gates: [{ gate: 'share', expect: 'at 320x568 with the Level code row showing' }] },
  { name: 'FIELD_15PX', task: 'M1R', file: 'page', find: 'padding: 0 8px; font-size: 16px; }\n#codebox button', repl: 'padding: 0 8px; font-size: 0.95rem; }\n#codebox button',
    gates: [{ gate: 'share', expect: 'every input, select and textarea is 16 px or more' }] },
  { name: 'SHARELINK_40PX', task: 'M1R', file: 'page', find: '#sharelink { min-height: 48px;', repl: '#sharelink { min-height: 40px;',
    gates: [{ gate: 'share', expect: 'the link field is 48 px tall or more' }] },
  { name: 'EDGE_BANKED_UNDER_SHEET', task: 'M1R', file: 'page', find: 'down = { L: {}, R: {}, A: {}, B: {} }; edge.A = 0; edge.B = 0; if (I._stripReset)', repl: 'down = { L: {}, R: {}, A: {}, B: {} }; if (I._stripReset)',
    gates: [{ gate: 'loop', expect: 'round 1: a tap on A under the open share sheet does not jump at Close and Resume' }] },
  { name: 'CARD_UNDER_SHEET', task: 'M1R', file: 'page', find: '#stage:has(> #sharesheet.on) > #paused, #stage:has(> #sharesheet.on) > #clear { visibility: hidden; }', repl: '',   /* re anchored at NOTE3: the pause card's sheet (Q94) */
    gates: [{ gate: 'loop', expect: 'round 1: the clear card hides under the sheet' }] },
  { name: 'COPIED_STICKS', task: 'M1R', file: 'page', find: "var done = function () { btn.textContent = ui.COPY.copied; setTimeout(function () { btn.textContent = ui.COPY[btn.getAttribute('data-copy')]; }, 1500); };",
    repl: 'var done = function () { var was = btn.textContent; btn.textContent = ui.COPY.copied; setTimeout(function () { btn.textContent = was; }, 1500); };',
    gates: [{ gate: 'loop', expect: 'round 1: two quick copies say Copied' }] },
  { name: 'DEATH_CARD_TALL', task: 'M1R', file: 'page', find: '@media (max-height: 700px) { #death .duo { flex-direction: row; }', repl: '@media (max-height: 1px) { #death .duo { flex-direction: row; }',
    gates: [{ gate: 'death', expect: 'at 320x568 the death card clears the fallen bug' }] },
  { name: 'CHIP_ON_DEATH', task: 'M1R', file: 'page', find: 'body:has(#death.on) #sws-music-card, body:has(#death.on) #sws-music-pill, body:has(#death.on) #sws-music-toast, body:has(#death.on) #sws-music-chip { display: none !important; }', repl: '',
    gates: [{ gate: 'death', expect: 'at 320x568 a thumb lands on Again and Title on every row' }] },
  /* SPECK_IN_FILM and SPARK_UNOUTLINED re anchored in ART1 on Astra's speck.a and spark.a (Q160) */
  { name: 'SPECK_IN_FILM', task: 'M1R', file: 'page', find: "a: '................/................/................/.......0......../......080......./.....088800.....", repl: "a: '................/................/................/.......0......../......080......./.....08f800.....",   /* re anchored at ART3 (round 2's speck) */
    gates: [{ gate: 'harness', only: 'H-spr-1', expect: 'speck.a holds no Film' }] },
  { name: 'SPARK_UNOUTLINED', task: 'M1R', file: 'page', find: "      a: '.......00......./......0990....../...0..0990..0.../..090.0990.090../..090099990090../...0999999990.../..099999999990../.09996699669990./.09966666666990./0999666666669990/0999666666669990/0999966996699990/.09999999999990./..099999999990../...0999999990.../....00000000....',", repl: "      a: '................/.......99......./.......99......./...9...99...9.../...9..9999..9.../....99999999..../...9999999999.../..999669966999../..996666666699../.99966666666999./.99966666666999./.99996699669999./..999999999999../...9999999999.../....99999999..../................',",
    gates: [{ gate: 'harness', only: 'H-spr-1', expect: 'spark.a has its Ink outline' }] },
  { name: 'SELECT_44PX', task: 'M1R', file: 'page', find: '#settings select { min-height: 48px; margin-left: auto; }', repl: '#settings select { min-height: 44px; margin-left: auto; }',
    gates: [{ gate: 'save', expect: 'every Settings control is 48 px tall or more' }] },

  /* Stephen's playtest of 31 Oct, note 1 (QUESTIONS Q90): the installed app's window on Android is drawn under the
     phone's 48 px button bar with no inset reported, so the page is marked .navpad there and --sab floored at 48 */
  { name: 'NAVPAD_MARK_REMOVED', task: 'NOTE1', file: 'page', find: " document.documentElement.classList.add('navpad');", repl: ' { /* the mark removed */ }',
    gates: [{ gate: 'layout', expect: '412x915 the app mark (?navpad, env 0): the page is marked .navpad' }] },
  { name: 'NAVPAD_FLOOR_DROPPED', task: 'NOTE1', file: 'page', find: ':root.navpad { --sab: max(env(safe-area-inset-bottom, 0px), 48px); }\n', repl: '',
    gates: [{ gate: 'layout', expect: '412x915 the app mark (?navpad, env 0): the drawn stick field, A and B end' }] },
  { name: 'STRIP_IGNORES_SAB', task: 'NOTE1', file: 'page', edits: [['top: 6px; bottom: calc(10px + var(--sab)); pointer-events: none;', 'top: 6px; bottom: 10px; pointer-events: none;'],
      ['  padding-bottom: calc(10px + var(--sab)); touch-action: none; }', '  padding-bottom: 10px; touch-action: none; }']],
    gates: [{ gate: 'layout', expect: '412x915 env 48 (a phone that reports its bar): the drawn stick field, A and B end' }] },
  /* the floor's other half: a tab is never floored, a reported inset never doubled, and the mark is Android's app window alone */
  { name: 'NAVPAD_BLANKET', task: 'NOTE1', file: 'page', find: ':root.navpad { --sab:', repl: ':root { --sab:',
    gates: [{ gate: 'layout', expect: '412x915: the drawn stick field, A and B sit' }] },
  { name: 'NAVPAD_FLOOR_ADDS', task: 'NOTE1', file: 'page', find: 'max(env(safe-area-inset-bottom, 0px), 48px)', repl: 'calc(env(safe-area-inset-bottom, 0px) + 48px)',
    gates: [{ gate: 'layout', expect: '412x915 the app mark with env 48 (the floor never adds to it): every rule that reads --sab holds its 48 px value' }] },
  { name: 'NAVPAD_ANY_ANDROID', task: 'NOTE1', file: 'page', find: "matchMedia('(display-mode: standalone), (display-mode: fullscreen), (display-mode: minimal-ui)').matches))", repl: 'true))',
    gates: [{ gate: 'layout', expect: '412x915 an Android tab (display mode browser, env 0): the page is not marked' }] },
  { name: 'NAVPAD_ANY_WINDOW', task: 'NOTE1', file: 'page', find: '(/Android/i.test(navigator.userAgent) &&', repl: '(true &&',
    gates: [{ gate: 'layout', expect: '412x915 a desktop app window (display mode standalone, not Android): the page is not marked' }] },
  { name: 'NAVPAD_IN_BODY', task: 'NOTE1', file: 'page', edits: [[NAVPAD_BLOCK, ''], ['<body>\n', '<body>\n' + NAVPAD_BLOCK]],
    gates: [{ gate: 'lint', expect: 'shell-navpad must be the second script, in <head>' }] },
  { name: 'FIT_IGNORES_SAB', task: 'NOTE1', file: 'page', find: '#safeprobe { position: fixed; visibility: hidden; pointer-events: none; padding: var(--sat) 0 var(--sab) 0; }',
    repl: '#safeprobe { position: fixed; visibility: hidden; pointer-events: none; padding: var(--sat) 0 0 0; }',
    gates: [{ gate: 'layout', expect: '390x844 the app mark (?navpad, env 0): VIEW_ROWS' }] },
  /* the reviews of NOTE1 (QUESTIONS Q91): a reported inset over the floor wins, every display mode the head test names
     marks the page, the title and Settings end above the bar, and the fleet's chip, pill and song card rise over it
     without ever doubling, the chip seated off the bar's band where content can sit over it */
  { name: 'NAVPAD_ENV_DROPPED', task: 'NOTE1R', file: 'page', find: 'max(env(safe-area-inset-bottom, 0px), 48px)', repl: '48px',
    gates: [{ gate: 'layout', expect: '412x915 the app mark with env 60 (a reported inset over the floor wins): every rule that reads --sab holds its 60 px value' }] },
  { name: 'NAVPAD_NO_FULLSCREEN', task: 'NOTE1R', file: 'page', find: '(display-mode: standalone), (display-mode: fullscreen), (display-mode: minimal-ui)', repl: '(display-mode: standalone), (display-mode: minimal-ui)',
    gates: [{ gate: 'layout', expect: '412x915 an Android app window (display mode fullscreen, env 0): the page is marked .navpad' }] },
  { name: 'NAVPAD_NO_MINIMAL_UI', task: 'NOTE1R', file: 'page', find: ", (display-mode: minimal-ui)'", repl: "'",
    gates: [{ gate: 'layout', expect: '412x915 an Android app window (display mode minimal-ui, env 0): the page is marked .navpad' }] },
  { name: 'SCROLLERS_PAD_PAST_BAR', task: 'NOTE1R', file: 'page', find: ':root.navpad #title, :root.navpad #settings { bottom: var(--sab); padding-bottom: 16px; }\n', repl: '',
    gates: [{ gate: 'layout', expect: '320x568 the app mark (?navpad, env 0): the title as it opens draws no control in the bottom 48 px' }] },
  { name: 'CHIP_LIFT_DROPPED', task: 'NOTE1R', file: 'page', find: ':root.navpad #sws-music-chip, :root.navpad #sws-music-pill', repl: ':root.navpad #sws-music-pill',
    gates: [{ gate: 'layout', expect: "412x915 the app mark (?navpad, env 0): on the clear card the fleet's chip ends" }] },
  { name: 'PILL_LIFT_DROPPED', task: 'NOTE1R', file: 'page', find: ', :root.navpad #sws-music-pill, ', repl: ', ',
    gates: [{ gate: 'layout', expect: "412x915 the app mark (?navpad, env 0): folded by a real touch, the song's pill ends" }] },
  { name: 'CARD_LIFT_DROPPED', task: 'NOTE1R', file: 'page', find: ', :root.navpad #sws-music-card { margin-bottom', repl: ' { margin-bottom',
    gates: [{ gate: 'layout', expect: '412x915 the app mark (?navpad, env 0): a song waiting from another game opens its card' }] },
  { name: 'CHIP_LIFT_ADDS', task: 'NOTE1R', file: 'page', find: 'margin-bottom: calc(var(--sab) - env(safe-area-inset-bottom, 0px)); }', repl: 'margin-bottom: var(--sab); }',
    gates: [{ gate: 'layout', expect: "412x915 the app mark with env 48 (the floor never adds to it): on the clear card the fleet's chip ends" }] },
  { name: 'CHIPSILL_DROPPED', task: 'NOTE1R', file: 'page', find: ':root.navpad #title.on ~ #chipsill, :root.navpad #settings.on ~ #chipsill { display: block; }\n', repl: '',
    gates: [{ gate: 'layout', expect: "390x844 the app mark (?navpad, env 0): at once on the title after a room the fleet's chip ends" }] },
  /* the at once reseat: without it the clear card's seat stays put on the title for the include's 1.5 s (either size, so
     an include timer that lands in the gate's measure window at one of them cannot turn the row) */
  { name: 'CHIP_SEAT_LATE', task: 'NOTE1R', file: 'page', find: "    if (name === 'title' || name === 'settings') ui.seatChip();\n", repl: '',
    gates: [{ gate: 'layout', expect: ["390x844 the app mark (?navpad, env 0): at once on the title after a room the fleet's chip ends",
      "360x780 the app mark (?navpad, env 0): at once on the title after a room the fleet's chip ends"] }] },

  /* Stephen's playtest of 31 Oct, note 5, his ruling "Dead pixels only" (QUESTIONS Q92): the chest pays its 15 with a
     handwritten +15 that stops nothing, M1 shows no sheet (the shell answers the sim's offer and compare on the next
     word), no player string names a weapon, a charm, a blueprint or the Darkroom, and the blueprint is neither drawn
     nor heard. The lint's rule: the old slip line, the old Grit line, the Darkroom as two words, a blueprint in markup */
  { name: 'COPY_PROMISES_WEAPON', task: 'NOTE5', file: 'page', find: "    dp: 'Dead pixels', dpGain: '+{n}',", repl: "    dp: 'Dead pixels', dpGain: '+{n}',\n    slip: 'A weapon waits for the Darkroom.',",
    gates: [{ gate: 'lint', expect: 'COPY.slip: names Darkroom before the build has one' }] },   /* re anchored at W1: weapon is lifted (weapons exist), so the slip line fails for its Darkroom (NOT_YET's line) */
  { name: 'COPY_PROMISES_CHARM', task: 'NOTE5', file: 'page', find: "    dp: 'Dead pixels', dpGain: '+{n}',", repl: "    dp: 'Dead pixels', dpGain: '+{n}',\n    grit: 'Grit', gritSays: 'charms grow stronger',",
    gates: [{ gate: 'lint', expect: 'COPY.gritSays: names charm before the build has one' }] },
  { name: 'COPY_NAMES_DARK_ROOM', task: 'NOTE5', file: 'page', find: "nextRoom: 'Shoot the next room',", repl: "nextRoom: 'Shoot the dark room',",
    gates: [{ gate: 'lint', expect: 'COPY.nextRoom: names Darkroom before the build has one' }] },
  { name: 'MARKUP_NAMES_BLUEPRINT', task: 'NOTE5', file: 'page', find: '<span id="hearts" aria-label="Hearts">', repl: '<span id="hearts" aria-label="Hearts and a blueprint">',
    gates: [{ gate: 'lint', expect: 'markup aria-label: names blueprint before the build has one' }] },
  /* the sheets: an answer dropped holds the world for good; the old sheets back, shown and waiting for a tap; the
     answers in the wrong order hold it for good when both open on one step */
  { name: 'OFFER_HOLDS_WORLD', task: 'NOTE5', file: 'page', find: '      if (st.scrollsOffered) SB.input.choose(SB.sim.CHOICE.A);', repl: '      if (st.scrollsOffered) { /* the offer waits for a tap */ }',
    gates: [{ gate: 'loot', expect: '412: the scroll is taken with its pickup voice' }] },
  /* CHEST_HOLDS_WORLD retired at W1 (Weapons v1 step 1): no compare opens for an empty slot, so the shell's answer to
     a chest's compare never rides a step and the condition it watched never arises; step 2's swap rows replace it */
  { name: 'OFFER_SHOWS', task: 'NOTE5', file: 'page', edits: [
      ['    <div id="sharesheet" role="dialog"', '    <div id="offer" role="dialog"><h2>Pick a scroll</h2><button id="pickA" type="button">Vigor</button><button id="pickB" type="button">Focus</button></div>\n    <div id="sharesheet" role="dialog"'],
      ['#clear, #death { position: absolute;', '#clear, #death, #offer { position: absolute;'], ['#clear.on, #death.on { display: flex; }', '#clear.on, #death.on, #offer.on { display: flex; }'],
      ['      if (st.scrollsOffered) SB.input.choose(SB.sim.CHOICE.A);', "      if (st.scrollsOffered) document.getElementById('offer').classList.add('on');"]],
    gates: [{ gate: 'loot', expect: '412: no sheet, card or dialog shows on the walk' }] },
  { name: 'SLIP_BACK', task: 'NOTE5', file: 'page', edits: [
      ["    dp: 'Dead pixels', dpGain: '+{n}',", "    dp: 'Dead pixels', dpGain: '+{n}',\n    slip: 'A weapon waits for the Darkroom.', slipTake: 'Keep the slip',"],
      ['    <div id="sharesheet" role="dialog"', '    <div id="slip" role="dialog" data-aria="slip"><h2 data-copy="slip"></h2>\n      <button id="slipok" type="button" data-copy="slipTake"></button></div>\n    <div id="sharesheet" role="dialog"'],
      ['#clear, #death { position: absolute;', '#clear, #death, #slip { position: absolute;'], ['#clear.on, #death.on { display: flex; }', '#clear.on, #death.on, #slip.on { display: flex; }'],
      ["      /* the compare is the player's own from Weapons v1 step 2: the swap card (ui.swap) answers it, never the shell */", "      document.getElementById('slip').classList.toggle('on', !!st.room.compare && !st.scrollsOffered);"],
      ["    document.getElementById('clearshare').addEventListener('click', function () { ui.openShare(); });", "    document.getElementById('slipok').addEventListener('click', function () { SB.input.choose(SB.sim.CHOICE.TAKE); });\n    document.getElementById('clearshare').addEventListener('click', function () { ui.openShare(); });"],
      ["var MODALS = ['clear', 'death', 'paused', 'sharesheet', 'devcard', 'swap'];", "var MODALS = ['clear', 'death', 'paused', 'slip', 'sharesheet', 'devcard', 'swap'];"]],   /* the listener and the list re anchored at NOTE3 (Q94), the TAKE line and the list at W2 */
    /* W1: its slip shows on a compare and no compare opens for an empty slot, so the loot walk can no longer see it; the
       lint still sees its words (the Darkroom, NOT_YET's line now that weapon is lifted) */
    gates: [{ gate: 'lint', expect: 'COPY.slip: names Darkroom before the build has one' }] },
  /* ANSWER_ORDER_SWAPPED retired at W1: the offer and the chest's compare can no longer open on one step (no compare
     opens for an empty slot), so the order of the two answers is never read; step 2's swap rows replace it */
  /* the +15: never shown, never gone (with reduced motion it stands for good), taking taps over A's hit area, and
     carried into the next room */
  { name: 'PLUS_MISSING', task: 'NOTE5', file: 'page', find: "      if ((ev & (EV.CHEST | EV.KILL)) && G.state.room.dp > dp0) SB.ui.dpGain(G.state.room.dp - dp0);\n", repl: '',   /* re anchored at W1: the gain line serves kills too */
    gates: [{ gate: 'loot', expect: '412: the chest opens with its chest voice and pays 15' }] },
  { name: 'PLUS_STAYS', task: 'NOTE5', file: 'page', find: "clearTimeout(el.sbGainT); el.sbGainT = setTimeout(function () { el.classList.remove('on'); }, GAIN_MS);", repl: 'clearTimeout(el.sbGainT);',
    gates: [{ gate: 'loot', expect: '320: with reduced motion the +15 stands still' }] },
  { name: 'PLUS_TAKES_TAPS', task: 'NOTE5', file: 'page', find: '#dpplus { position: absolute; right: 0; top: 100%;', repl: '#dpplus { pointer-events: auto; position: absolute; right: 0; top: 100%;',
    gates: [{ gate: 'loot', expect: '412: the +15 takes no tap' }] },
  { name: 'PLUS_CARRIES_OVER', task: 'NOTE5', file: 'page', find: "    document.getElementById('dpplus').classList.remove('on');\n", repl: '',
    gates: [{ gate: 'loot', expect: '412: a new room right after the chest shows no +15' }] },
  /* seen in the shots: the next room's reveal showed the last room's count */
  { name: 'DP_COUNT_STALE', task: 'NOTE5', file: 'page', find: '    showDp(G.state.room.dp);   /* the new room', repl: '    /* the new room',
    gates: [{ gate: 'loot', expect: "412: the new room's count reads its own 0 before its first step" }] },
  /* the answer's own step: no pick voice for a pick the player never made, and no tap lost to the step the sim holds */
  { name: 'PICK_SOUNDS', task: 'NOTE5', file: 'page', find: '      if (ev & EV.PICK) SB.ui.hearts(G.state.hero.hearts, G.state.hero.heartsMax);', repl: "      if (ev & EV.PICK) { au.sfx('pick'); SB.ui.hearts(G.state.hero.hearts, G.state.hero.heartsMax); }",
    gates: [{ gate: 'loot', expect: '412: no pick voice sounds' }] },
  { name: 'EDGE_LOST_TO_CHOICE', task: 'NOTE5', file: 'page', find: '      (c ? c * IN.CHOICE : (edge.A ? IN.A_TAP : 0) | (edge.B ? IN.B_TAP : 0));\n    if (!c) { edge.A = 0; edge.B = 0; }',
    repl: '      (edge.A ? IN.A_TAP : 0) | (edge.B ? IN.B_TAP : 0) | c * IN.CHOICE;\n    edge.A = 0; edge.B = 0;',
    gates: [{ gate: 'loot', expect: "412: a real tap on A as the scroll's offer opens rides past its answer's step and jumps on the next" }] },   /* re anchored at W1: the chest answers nothing, the scroll's offer still does */
  /* the blueprint: drawn, or heard */
  /* re anchored at NOTE5R (a hidden loot's cell is drawn as its neighbour's): the blueprint's sprite on the open Ash,
     drawn as before the hide */
  { name: 'BLUEPRINT_DRAWN', task: 'NOTE5', file: 'page', edits: [
      ['var cov = R.LOOT_SHOWN[lt2.kind] ? -1 : R.coverOf(s, lv, lt2.idx);', 'var cov = -1;'],
      ['if (!lt2.taken && R.LOOT_SHOWN[lt2.kind]) spr(', 'if (!lt2.taken) spr(']],
    gates: [{ gate: 'loot', expect: '412: the blueprint is not drawn' }] },
  { name: 'BLUEPRINT_SOUNDS', task: 'NOTE5', file: 'page', find: "if ((ev & EV.PICKUP) && SB.render.lootTaken(G.state) > seen) au.sfx('pickup');", repl: "if (ev & EV.PICKUP) au.sfx('pickup');",
    gates: [{ gate: 'loot', expect: '412: the blueprint is taken in silence' }] },

  /* the two reviews of NOTE5 (QUESTIONS Q93). The +15: off its seat under the count (the placement line now needs a
     real box), moving under reduced motion, rising into the count as it fades, larger than the count */
  { name: 'PLUS_OFF_THE_COUNT', task: 'NOTE5R', file: 'page', find: '#dpplus { position: absolute; right: 0; top: 100%;', repl: '#dpplus { position: absolute; right: 0; top: 560%;',
    gates: [{ gate: 'loot', expect: '412: the +15 sits under the count' }] },
  { name: 'PLUS_NOT_STILL', task: 'NOTE5R', file: 'page', find: "el.classList.remove('on'); void el.offsetWidth; el.classList.toggle('still', still)", repl: "el.classList.remove('on'); void el.offsetWidth; el.classList.toggle('still', false)",   /* re anchored at W1 (the pickup card has the same line) */
    gates: [{ gate: 'loot', expect: '320: with reduced motion the +15 stands still' }] },
  { name: 'PLUS_RISES_INTO_COUNT', task: 'NOTE5R', file: 'page', find: '100% { opacity: 0; transform: translateY(0); } }', repl: '100% { opacity: 0; transform: translateY(-10px); } }',
    gates: [{ gate: 'loot', expect: '412: the +15 never rises into the count' }] },
  { name: 'PLUS_OUTSIZED', task: 'NOTE5R', file: 'page', find: 'white-space: nowrap; font-weight: 700; }', repl: 'white-space: nowrap; font-size: 1.3rem; font-weight: 700; }',
    gates: [{ gate: 'loot', expect: '412: the +15 is no larger than the count it adds to' }] },
  /* the hidden blueprint's cell: the open Ash notch back, or the static Sun cell (the yellow ghost) left showing */
  { name: 'BLUEPRINT_NOTCH', task: 'NOTE5R', file: 'page', find: 'var cov = R.LOOT_SHOWN[lt2.kind] ? -1 : R.coverOf(s, lv, lt2.idx);', repl: 'var cov = -1;',
    gates: [{ gate: 'loot', expect: "412: the hidden blueprint's cell is drawn as its row neighbours are" }] },
  { name: 'BLUEPRINT_GHOST', task: 'NOTE5R', file: 'page', find: 'if (cov >= 0) { ctx.drawImage(stat, (cov % lv.w) * C, Math.floor(cov / lv.w) * C, C, C, lx2, ly, C, C); continue; }', repl: 'if (cov >= 0) continue;',
    gates: [{ gate: 'loot', expect: "412: the hidden blueprint's cell is drawn as its row neighbours are" }] },
  /* the clear card's bare line back: "Banked 2 dead pixels" over the strip's 5 */
  { name: 'BANK_LINE_BARE', task: 'NOTE5R', file: 'page', find: "bank.textContent = n < dp ? ui.COPY.bankedOf.replace('{n}', n).replace('{of}', dp) : n === 1", repl: 'bank.textContent = n === 1',
    gates: [{ gate: 'loop', expect: 'round 1: the card names the count it banked from' }] },

  /* NOTE3, the pause card (Stephen's note 3 of 31 Oct, his ruling "Pause in the top bar", QUESTIONS Q94). The brief's four:
     a stray Pause tap that leaves the room, the sim stepping under the card, Title back in the strip, a hidden page that
     keeps running; then the card's own rules, the back gesture's five, and a lost focus */
  { name: 'PAUSE_LEAVES', task: 'NOTE3', file: 'page', find: "    document.getElementById('pause').addEventListener('click', function () { this.blur(); ui.pause(); });", repl: "    document.getElementById('pause').addEventListener('click', ui.toTitle);",
    gates: [{ gate: 'pause', expect: '412x915: a real tap on Pause opens the pause card and keeps the room' }] },
  /* found in this change's own probe: after a tap on Pause the button kept the focus, and a later Space (the jump key)
     or Enter pressed it again and paused the room */
  { name: 'PAUSE_KEEPS_FOCUS', task: 'NOTE3', file: 'page', find: "addEventListener('click', function () { this.blur(); ui.pause(); });", repl: "addEventListener('click', function () { ui.pause(); });",
    gates: [{ gate: 'pause', expect: 'after a tap on Pause and back to resume, Space (the jump key) and Enter leave the room running' }] },
  { name: 'PAUSE_RUNS_SIM', task: 'NOTE3', file: 'page', find: "    var run = !held && !SIDEWAYS.matches && !!G.state && SB.ui.screen === 'play';", repl: "    var run = !held && !SIDEWAYS.matches && !!G.state && (SB.ui.screen === 'play' || SB.ui.screen === 'pause');",
    gates: [{ gate: 'pause', expect: '412x915: under the pause card the room holds' }] },
  { name: 'TITLE_BACK_IN_STRIP', task: 'NOTE3', file: 'page', edits: [
      ['  <div id="strip">\n', '  <div id="strip"><button id="back" type="button" data-copy="toTitle"></button>\n'],
      ['#paused, #clear, #death { position: absolute;', '#back { position: absolute; top: 0; left: calc(6px + var(--sal)); z-index: 2; min-width: 64px; min-height: 48px; padding: 0 12px;\n  border-radius: 10px; border: 1px solid var(--pewter); background: transparent; color: var(--ink); font-size: 0.9rem; }\n#paused, #clear, #death { position: absolute;'],
      ["    document.getElementById('pausetitle').addEventListener('click', function () { ui.toTitle(); });", "    document.getElementById('pausetitle').addEventListener('click', function () { ui.toTitle(); });\n    document.getElementById('back').addEventListener('click', function () { ui.toTitle(); });"]],   /* re anchored at W1 (the listener wrapped) */
    gates: [{ gate: 'layout', expect: '412x915: the strip holds no control but the stick, B and A' }] },
  { name: 'HIDDEN_NO_PAUSE', task: 'NOTE3', file: 'page', find: "    document.addEventListener('visibilitychange', function () { if (document.hidden) away(); else back(); });\n", repl: '',
    gates: [{ gate: 'pause', expect: 'inside the wrapper iframe a hidden page pauses its room' }] },
  { name: 'BLUR_NO_PAUSE', task: 'NOTE3', file: 'page', find: "    window.addEventListener('blur', function () { if (!window.SWS_EMBED) away(); });\n", repl: '',
    gates: [{ gate: 'pause', expect: 'at top level a lost focus' }] },

  /* the stick (Stephen's ruling of 31 Oct, "Whole left side", QUESTIONS Q140): a floating stick over the whole left of
     the strip, the bottom left corner too, drawn only under a thumb, reading the slide from where the thumb landed */
  { name: 'STICK_DRAWN_IDLE', task: 'STICK', file: 'page', find: '#stick .pad { position: absolute; left: 0; top: 0; width: 116px; height: 116px; margin: -58px 0 0 -58px; display: none;',   /* re anchored at ART3 */
    repl: '#stick .pad { position: absolute; left: 0; top: 0; width: 116px; height: 116px; margin: -58px 0 0 -58px; display: block;',
    gates: [{ gate: 'input', expect: '412x915: with no thumb down the stick draws no pad' }] },
  { name: 'STICK_ABSOLUTE', task: 'STICK', file: 'page', find: 'stickAt[e.pointerId] = { ox: e.clientX, x: e.clientX, y: e.clientY };',
    repl: 'stickAt[e.pointerId] = { ox: (stick.getBoundingClientRect().left + stick.getBoundingClientRect().right) / 2, x: e.clientX, y: e.clientY };',
    gates: [{ gate: 'input', expect: "412x915: a landing at the field's left middle" }] },
  { name: 'CORNER_DEAD', task: 'STICK', file: 'page', edits: [['body.playing #strip, body:has(#death.on) #strip { --res: 0px; }', 'body:has(#death.on) #strip { --res: 0px; }'], ['body.playing #reserve, body:has(#death.on) #reserve { display: none; }', 'body:has(#death.on) #reserve { display: none; }']],   /* re anchored at the stick's review (the death card's box) */
    gates: [{ gate: 'input', expect: '412x915: landed at the very bottom left corner, 20 px right is right' }] },
  { name: 'PAD_STAYS', task: 'STICK', file: 'page', find: "      stick.classList.toggle('on', !!p);", repl: "      if (p) stick.classList.add('on');",
    gates: [{ gate: 'input', expect: "412x915: landed at the field's left middle and lifted it is nothing, the pad is gone" }] },
  { name: 'DEADZONE_ZERO', task: 'STICK', file: 'page', find: 'STICK_ON_PX: 12,', repl: 'STICK_ON_PX: 0,',
    gates: [{ gate: 'input', expect: '412x915: a 4 px wobble after landing reads nothing' }] },
  { name: 'NO_HYSTERESIS', task: 'STICK', file: 'page', find: 'STICK_OFF_PX: 6,', repl: 'STICK_OFF_PX: 12,',
    gates: [{ gate: 'input', expect: '412x915: pushed 20 px and eased back to 9 px it stays right' }] },
  { name: 'NO_FOLLOW', task: 'STICK', file: 'page', find: '      if (dx > TRAVEL) p.ox = p.x - TRAVEL; else if (dx < -TRAVEL) p.ox = p.x + TRAVEL;\n', repl: '',
    gates: [{ gate: 'input', expect: '412x915: after the 80 px push, a 44 px reversal is left' }] },
  { name: 'UP_IS_JUMP', task: 'STICK', file: 'page', find: '        p.x = pts[i].clientX; follow(p);',
    repl: "        p.x = pts[i].clientX; follow(p);\n        if (p.y - pts[i].clientY >= ON) I.press('A', 'stick-up'); else I.release('A', 'stick-up');",
    gates: [{ gate: 'input', expect: '412x915: a 60 px push straight up is word 0' }] },
  { name: 'RELEASE_ON_LEAVE', task: 'STICK', file: 'page', find: '      var p = stickAt[e.pointerId];\n      if (!p) return;\n',
    repl: '      var p = stickAt[e.pointerId];\n      if (!p) return;\n      var zr = stick.getBoundingClientRect();\n      if (e.clientX > zr.right || e.clientY < zr.top) { endStick(e); return; }\n',
    gates: [{ gate: 'input', expect: '412x915: slid over B and up over the room it still steers right' }] },
  { name: 'PAD_OVER_CANVAS', task: 'STICK', file: 'page', find: 'cy = Math.max(s.top + hh, p.y);', repl: 'cy = p.y;',
    gates: [{ gate: 'input', expect: "412x915: a landing at the zone's top edge draws its pad inside the strip, never over the room" }] },
  { name: 'MIRROR_STICK_LEFT', task: 'STICK', file: 'page', find: '#strip.mirror #stick { left: calc(var(--res) + 2 * var(--btn)); right: calc(var(--sar) + var(--edge)); }\n', repl: '',
    gates: [{ gate: 'input', expect: '412x915 mirrored: the stick zone runs from B to the right edge' }] },
  /* the stick's review (STICKR): the hint drew a Sun box round the whole field; the pad was kept inside the inset field,
     so a corner thumb sat outside its rim; the arrows were italic; the stick drew and read under the pause and clear
     cards; a thumb held still across Resume kept its knob pushed; the death card brought the box back; and three
     behaviours had a gate and no row (the idle line, the pad's sideways clamp, the lit arrow) */
  { name: 'HINT_BOXES_FIELD', task: 'STICKR', file: 'page', find: '#stick.hint .idle { animation: sbidle 0.7s ease-in-out 3; }', repl: '#stick.hint .field { animation: sbhint 0.7s ease-in-out 3; }',
    gates: [{ gate: 'input', expect: "412x915: the first standing moment's hint on the stick draws no box" }] },
  { name: 'HINT_OUTLINE_REDUCED', task: 'STICKR', file: 'page', find: '  #stick.hint .idle, #stick.hint .idle .hl, #stick.hint .idle .hr { animation: none; color: var(--ink); } }',
    repl: '  #stick.hint .idle, #stick.hint .idle .hl, #stick.hint .idle .hr { animation: none; color: var(--ink); } #stick.hint .field { outline: 4px solid var(--sun); } }',
    gates: [{ gate: 'death', expect: "under reduced motion the stick's hint draws no outline" }] },
  { name: 'STICK_IDLE_GONE', task: 'STICKR', file: 'page', find: "    stickIdle: 'slide to run',", repl: "    stickIdle: '',",
    gates: [{ gate: 'input', expect: '412x915: idle, a quiet hint in the field' }] },
  { name: 'PAD_X_UNCLAMPED', task: 'STICKR', file: 'page', find: 'Math.min(s.right - hw, p.ox)', repl: 'p.ox',
    gates: [{ gate: 'input', expect: '412x915: landed at beside B, low the pad and the knob appear centred under it, kept off the room and off B' }] },
  { name: 'PAD_FIELD_INSET', task: 'STICKR', file: 'page', find: 'var cx = mir ? Math.max(s.left + hw, p.ox) : Math.min(s.right - hw, p.ox), cy = Math.max(s.top + hh, p.y);',
    repl: "var f = stick.querySelector('.field').getBoundingClientRect(), cx = Math.max(f.left + hw, Math.min(f.right - hw, p.ox)), cy = Math.max(f.top + hh, Math.min(f.bottom - hh, p.y));",
    gates: [{ gate: 'input', expect: '412x915: landed at the very bottom left corner the thumb is inside the drawn pad' }] },
  { name: 'KNOB_ARROW_DARK', task: 'STICKR', file: 'page', find: "      pad.classList.toggle('l', stickDir === 'L'); pad.classList.toggle('r', stickDir === 'R');\n", repl: '',
    gates: [{ gate: 'input', expect: '412x915: pushed 20 px right without lifting it is right, the knob 20 px right and the right arrow lit' }] },
  { name: 'ITALIC_ARROWS', task: 'STICKR', file: 'page', find: '#stick i { font-style: normal; }\n', repl: '',
    gates: [{ gate: 'input', expect: "412x915: the stick's arrows stand upright" }] },
  { name: 'PAD_UNDER_CARD', task: 'STICKR', file: 'page', edits: [['body:not(.playing) #stick .pad, body:has(#paused.on) #stick .pad { display: none; }\n', ''], ['var p = stickPtrs.length && live() ? stickAt', 'var p = stickPtrs.length ? stickAt']],
    gates: [{ gate: 'input', expect: '412x915: under the pause card a thumb slid on the strip draws no pad' }] },
  { name: 'STICK_STEERS_PAUSED', task: 'STICKR', file: 'page', find: '      if (!live()) v = null;\n', repl: '',
    gates: [{ gate: 'input', expect: '412x915: under the pause card a thumb slid on the strip reads nothing' }] },
  { name: 'RESUME_KNOB_STALE', task: 'STICKR', file: 'page', find: '      for (var k = 0; k < stickPtrs.length; k++) { var q = stickAt[stickPtrs[k]]; q.ox = q.x; }\n', repl: '',
    gates: [{ gate: 'input', expect: '412x915: after Resume with the thumb held still the knob is centred and the word 0' }] },
  { name: 'DEATH_BOX_BACK', task: 'STICKR', file: 'page', edits: [['body.playing #strip, body:has(#death.on) #strip { --res: 0px; }', 'body.playing #strip { --res: 0px; }'], ['body.playing #reserve, body:has(#death.on) #reserve { display: none; }', 'body.playing #reserve { display: none; }']],
    gates: [{ gate: 'death', expect: 'on the death card the reserved box stays released' }] },
  { name: 'BLUR_IN_FRAME_PAUSES', task: 'NOTE3', file: 'page', find: 'if (!window.SWS_EMBED) away();', repl: 'away();',
    gates: [{ gate: 'pause', expect: 'inside the wrapper iframe a lost focus (the host page took it) leaves the room running' }] },
  { name: 'RESUME_KEEPS_EDGE', task: 'NOTE3', file: 'page', find: '    SB.input.releaseAll();   /* a tap on the strip under the card is never banked into a jump at Resume */\n', repl: '',
    gates: [{ gate: 'pause', expect: '412x915: a real tap on A under the pause card does not jump at Resume' }] },
  { name: 'PAUSED_NOT_OVERLAY', task: 'NOTE3', file: 'page', find: "var OVERLAYS = ['clear', 'death', 'paused', 'sharesheet', 'swap'];", repl: "var OVERLAYS = ['clear', 'death', 'sharesheet', 'swap'];",   /* re anchored at W2 */
    gates: [{ gate: 'pause', expect: "412x915: the pause card's Title: the title with nothing over it" }] },
  { name: 'PAUSED_NOT_MODAL', task: 'NOTE3', file: 'page', find: "var MODALS = ['clear', 'death', 'paused', 'sharesheet', 'devcard', 'swap'];", repl: "var MODALS = ['clear', 'death', 'sharesheet', 'devcard', 'swap'];",   /* re anchored at W2 */
    gates: [{ gate: 'pause', expect: '412x915: under the pause card an injected .lwfb-fab hides' }] },
  { name: 'PAUSE_ALWAYS_SHOWN', task: 'NOTE3', file: 'page', find: "    document.getElementById('pause').classList.toggle('on', name === 'play');", repl: "    document.getElementById('pause').classList.toggle('on', true);",
    gates: [{ gate: 'pause', expect: 'in the reveal Pause is hidden' }] },
  { name: 'PAUSE_OVERHANG_UNDER', task: 'NOTE3', file: 'page', find: 'font-weight: 700; font-size: 0.95rem; position: relative; z-index: 3; }', repl: 'font-weight: 700; font-size: 0.95rem; position: relative; }',
    gates: [{ gate: 'layout', expect: "412x915: Pause is 48x48 at the top strip's left end" }] },
  /* the back gesture: no watcher in a room; the card's back leaving instead of resuming; none on the sheet; none on the
     clear and death cards; one armed on the title (back could never leave); none in the reveal; one left armed under the
     Tap to develop card (a back there resumed the room under the card) */
  { name: 'BACK_UNWATCHED', task: 'NOTE3', file: 'page', find: 'reveal: function () { ui.pause(); }, play: function () { ui.pause(); }, pause:', repl: 'reveal: function () { ui.pause(); }, pause:',
    gates: [{ gate: 'pause', expect: 'back (a real Escape) in a room opens the pause card' }] },
  { name: 'BACK_CARD_TO_TITLE', task: 'NOTE3', file: 'page', find: 'pause: function () { ui.resume(); },', repl: 'pause: function () { ui.toTitle(); },',
    gates: [{ gate: 'pause', expect: 'back on the pause card resumes' }] },
  { name: 'BACK_SHEET_UNWATCHED', task: 'NOTE3', file: 'page', find: '    share: function () { ui.closeShare(); }, ', repl: '    ',
    gates: [{ gate: 'pause', expect: 'back on the share sheet closes it and returns to the pause card' }] },
  { name: 'BACK_CARDS_UNWATCHED', task: 'NOTE3', file: 'page', find: 'clear: function () { ui.toTitle(); }, dead: function () { ui.hideDeath(); ui.toTitle(); }', repl: '',
    gates: [{ gate: 'pause', expect: ['back on the clear card is Title', 'back on the death card is Title'] }] },
  { name: 'BACK_TRAPS_TITLE', task: 'NOTE3', file: 'page', find: '    share: function () { ui.closeShare(); }, ', repl: '    title: function () {}, share: function () { ui.closeShare(); }, ',
    gates: [{ gate: 'pause', expect: 'on the title no back watcher is armed' }] },
  { name: 'BACK_IN_REVEAL_LOST', task: 'NOTE3', file: 'page', find: '    reveal: function () { ui.pause(); }, play:', repl: '    play:',
    gates: [{ gate: 'pause', expect: 'back in the reveal ends it and opens the pause card' }] },
  { name: 'CODE_CARD_WATCHED', task: 'NOTE3', file: 'page', find: "    if (ui.screen !== 'play' && BACK[ui.screen]) ui.screen = 'code';\n", repl: '',
    gates: [{ gate: 'pause', expect: 'a link that arrives over the pause card holds the room under the Tap to develop card' }] },

  /* NOTE3R, the pause card's review (Q94): Share this room the browser's grey on either card; the card left in the middle
     over the bug, never in one row, placed against the last room's bug out of a reveal, not placed again on a resize; a
     link that builds no room stranding the player under the develop card; the first reveal ended by a lost focus, its
     clock run while away, or held for good when he is back */
  { name: 'PAUSE_SHARE_GREY', task: 'NOTE3R', file: 'page', find: '#pauseshare, #clearshare { background: var(--paper);', repl: '#clearshare { background: var(--paper);',
    gates: [{ gate: 'pause', expect: "412x915: Share this room is drawn in the card's Paper" }] },
  { name: 'CLEAR_SHARE_GREY', task: 'NOTE3R', file: 'page', find: '#pauseshare, #clearshare { background: var(--paper);', repl: '#pauseshare { background: var(--paper);',
    gates: [{ gate: 'pause', expect: "the clear card's Share this room is drawn in the card's Paper" }] },
  { name: 'PAUSED_IN_MIDDLE', task: 'NOTE3R', file: 'page', find: "    ui.placePaused();\n    ui.screen = 'pause';", repl: "    ui.screen = 'pause';",
    gates: [{ gate: 'pause', expect: '320x568: paused by a real tap, the card leaves the bug in sight' }] },
  { name: 'PAUSED_NO_ROW', task: 'NOTE3R', file: 'page', find: ", ['row'], ['row', 'high'], ['row', 'low']];", repl: '];',
    gates: [{ gate: 'pause', expect: '320x568: the bug at each of 48 rows, paused: the card covers it at rows' }] },
  /* found in this change's own shots: in one row all three shrunk alike and Resume spilled past its edge at 320x568 */
  { name: 'PAUSE_ROW_SPILLS', task: 'NOTE3R', file: 'page', find: '#paused.row .trio button { flex: 0 0 auto; padding: 0 6px;', repl: '#paused.row .trio button { flex: 1 1 auto; min-width: 0; padding: 0 6px;',
    gates: [{ gate: 'pause', expect: "320x568: each button's words sit inside its edge" }] },
  { name: 'PAUSED_STALE_HERO', task: 'NOTE3R', file: 'page', find: ' ui.endReveal(); SB.render.draw(G.state, G.level, performance.now()); }', repl: ' ui.endReveal(); }',
    gates: [{ gate: 'pause', expect: "paused out of the reveal, the card is placed against this room's bug" }] },
  { name: 'PAUSED_NOT_REPLACED', task: 'NOTE3R', file: 'page', find: " if (s === 'pause') SB.ui.placePaused(); }", repl: ' }',
    gates: [{ gate: 'pause', expect: 'a resize under the pause card places it again' }] },
  { name: 'CODE_BAD_STRANDS', task: 'NOTE3R', file: 'page', find: '    ui.toTitle();\n    if (rec) { var msg', repl: '    if (rec) { var msg',
    gates: [{ gate: 'pause', expect: 'a link that cannot be built, arriving over the pause card, then Tap to develop' }] },
  { name: 'REVEAL_AWAY_ENDS', task: 'NOTE3R', file: 'page', find: "if (ui.screen === 'reveal' && !RV.seen) { RV.away = true; return; } ", repl: '',
    gates: [{ gate: 'pause', expect: 'a lost focus in the first reveal holds it' }] },
  { name: 'REVEAL_AWAY_RUNS', task: 'NOTE3R', file: 'page', find: 'if (held || RV.away) {', repl: 'if (held) {',
    gates: [{ gate: 'pause', expect: 'a lost focus in the first reveal holds it' }] },
  { name: 'REVEAL_AWAY_STUCK', task: 'NOTE3R', file: 'page', find: "    window.addEventListener('focus', back);\n", repl: '',
    gates: [{ gate: 'pause', expect: 'back on the page by a real tap, the first reveal plays on' }] },
  /* ART1: Astra's in room art (Q160) */
  { name: 'ELITE_DRAWS_BASE', task: 'ART1', file: 'page', edits: [["ek = en.elite ? kn + '_elite' : kn", "ek = kn"], ['spr(ctx, mk, ex2, ey2);', 'spr(ctx, mk, mx, my, es, es);']],
    gates: [{ gate: 'sprites', expect: 'biome 0: the moth elite drawn as' }] },
  { name: 'ELITE_SUNK', task: 'ART1', file: 'page', find: "if (en.state === 0 && an !== 'cell') {", repl: "if (false) {",
    gates: [{ gate: 'sprites', expect: ['biome 1: the icicle elite drawn as', 'biome 4: the spark elite drawn as'] }] },
  { name: 'HEART_NOT_SPRITE', task: 'ART1', file: 'page', find: "/* a heart is Astra's hud_heart (9 by 8, Q160) at 2x, nearest neighbour: full, or the empty frame for a lost one; the\n   images are the sprite's own pixels, cut from the atlas at boot (R.heartURL) */\n#hearts i { width: 18px; height: 16px; display: block; background: var(--heart-full) 0 0 / 18px 16px no-repeat; image-rendering: pixelated; }\n#hearts i.lost { background-image: var(--heart-empty); }\n", repl: "/* a pixel heart (9 by 8), Ink with a Brick heart inset in it; a lost heart keeps its outline and empties to Paper */\n#hearts i { width: 18px; height: 16px; display: block; position: relative; background: var(--ink); clip-path: polygon(11.1% 0%, 33.3% 0%, 33.3% 12.5%, 44.4% 12.5%, 44.4% 25%, 55.6% 25%, 55.6% 12.5%, 66.7% 12.5%, 66.7% 0%, 88.9% 0%, 88.9% 12.5%, 100% 12.5%, 100% 50%, 88.9% 50%, 88.9% 62.5%, 77.8% 62.5%, 77.8% 75%, 66.7% 75%, 66.7% 87.5%, 55.6% 87.5%, 55.6% 100%, 44.4% 100%, 44.4% 87.5%, 33.3% 87.5%, 33.3% 75%, 22.2% 75%, 22.2% 62.5%, 11.1% 62.5%, 11.1% 50%, 0% 50%, 0% 12.5%, 11.1% 12.5%); }\n#hearts i::after { content: ''; position: absolute; left: 3px; top: 3px; right: 3px; bottom: 3px; background: var(--brick); clip-path: polygon(11.1% 0%, 33.3% 0%, 33.3% 12.5%, 44.4% 12.5%, 44.4% 25%, 55.6% 25%, 55.6% 12.5%, 66.7% 12.5%, 66.7% 0%, 88.9% 0%, 88.9% 12.5%, 100% 12.5%, 100% 50%, 88.9% 50%, 88.9% 62.5%, 77.8% 62.5%, 77.8% 75%, 66.7% 75%, 66.7% 87.5%, 55.6% 87.5%, 55.6% 100%, 44.4% 100%, 44.4% 87.5%, 33.3% 87.5%, 33.3% 75%, 22.2% 75%, 22.2% 62.5%, 11.1% 62.5%, 11.1% 50%, 0% 50%, 0% 12.5%, 11.1% 12.5%); }\n#hearts i.lost::after { background: var(--paper); }\n",
    gates: [{ gate: 'sprites', expect: "the top strip's 8 hearts" }] },
  { name: 'ELITE_FRAMES_DRIFT', task: 'ART1', file: 'page', find: "    moth_elite: { w: 24, h: 24, frames: {\n", repl: "    moth_elite: { w: 24, h: 24, frames: {\n      c: '',\n",
    gates: [{ gate: 'lint', expect: 'moth_elite.c has 1 rows, not 24' }, { gate: 'harness', only: 'H-spr-1', expect: "moth_elite is 24x24 (ELITE_PX 24) with moth's frames" }] },
  { name: 'SPECK_NO_GLINT', task: 'ART1', file: 'page', find: ".....088600.....", repl: ".....088800.....",   /* re anchored at ART3: round 2's speck has one Glare pixel, on b */
    gates: [{ gate: 'harness', only: 'H-spr-1', expect: "the speck's strip carries its Glare glint" }] },
  { name: 'HEART_EMPTY_BRICK', task: 'ART1', file: 'page', find: "empty: '.00...00./0220.0220/", repl: "empty: '.00...00./0990.0220/",
    gates: [{ gate: 'harness', only: 'H-spr-1', expect: 'hud_heart is 9x8 with full (Brick) and empty (no Brick)' }] },
  /* ---------------------------------------------------------------- Weapons v1 step 1 (docs/WEAPONS-V1.md 13.1) */
  { name: 'CD_DELAYS_JUMP', task: 'W1', file: 'page', find: "    } else if ((pressed || h.buffer > 0) && (h.ground || h.coyote > 0)) {", repl: "    } else if ((pressed || h.buffer > 0) && (h.ground || h.coyote > 0) && !(h.slots[0] && h.cd[0] > 0)) {",
    gates: [{ gate: 'harness', only: 'H-wpn-1', expect: "the armed hero's x, y, vx and vy equal the unarmed" }] },
  { name: 'POOL_GROWS', task: 'W1', file: 'page', find: "      return i;\n    }\n    return -1;\n  }", repl: "      return i;\n    }\n    s.proj.push(newProj()); s.proj[s.proj.length - 1].kind = kind; s.proj[s.proj.length - 1].live = 1;\n    return s.proj.length - 1;\n  }",
    gates: [{ gate: 'harness', only: 'H-wpn-3', expect: 'a full pool refuses a spawn (-1) and stays 16 long' }] },
  { name: 'PROJ_UNHASHED', task: 'W1', file: 'page', find: "    ['age', 'i32'], ['mode', 'i32'],", repl: "    ['mode', 'i32'],",
    gates: [{ gate: 'harness', only: 'H-wpn-2', expect: '.age changes the hash' }] },
  { name: 'DMG_FLOORED', task: 'W1', file: 'page', find: "  function scaled(dmg, stat) { return dmg * (SB.K.HP_Q + stat); }", repl: "  function scaled(dmg, stat) { return Math.floor(dmg * (SB.K.HP_Q + stat) / SB.K.HP_Q) * SB.K.HP_Q; }",
    gates: [{ gate: 'harness', only: 'H-stat-1', expect: 'boomerang/shock quarters for Focus and Vigor 0 to 4' }] },
  { name: 'FOCUS_SCALES_DIVE', task: 'W1', file: 'page', find: "p.dmg = scaled(SB.TUNING.WEAPONS.D1.dmg, s.hero.vigor);", repl: "p.dmg = scaled(SB.TUNING.WEAPONS.D1.dmg, s.hero.focus);",
    gates: [{ gate: 'harness', only: 'H-stat-1', expect: 'boomerang/shock quarters for Focus and Vigor 0 to 4' }] },
  { name: 'BOOMERANG_6_CELLS', task: 'W1', file: 'page', find: "if (stop || Math.abs(p.x - p.a) >= K.J1_REACH) {", repl: "if (stop || Math.abs(p.x - p.a) >= K.J1_REACH + K.CELL_SUB) {",
    gates: [{ gate: 'harness', only: 'H-wpn-J1', expect: 'a moth 1 px inside 5 cells past the front edge is hit, one at 5 cells is not' }] },
  { name: 'BOOM_HITS_EVERY_STEP', task: 'W1', file: 'page', find: "      if ((p.hit >> m) & 1 || !liveEnemy(en)) continue;", repl: "      if (!liveEnemy(en)) continue;",
    gates: [{ gate: 'harness', only: 'H-wpn-J1', expect: 'an elite jelly takes two of its four' }] },
  { name: 'BOOM_NO_RETURN', task: 'W1', file: 'page', find: "if (stop || Math.abs(p.x - p.a) >= K.J1_REACH) { p.mode = 1; p.hit = 0; }", repl: "if (stop || Math.abs(p.x - p.a) >= K.J1_REACH) { p.vx = 0; p.hit = 0; }",
    gates: [{ gate: 'harness', only: 'H-wpn-J1', expect: 'a frozen jelly two cells ahead takes exactly two hits' }] },
  { name: 'BOOM_INTO_VINE', task: 'W1', file: 'page', find: "tdir = wallSide !== 0 ? -wallSide : h.facing;", repl: "tdir = h.facing;",
    gates: [{ gate: 'harness', only: 'H-wpn-J1', expect: 'a sticky jump off a vine on the left, facing it, throws away from the vine' }] },
  { name: 'SHOCK_THROUGH_WALLS', task: 'W1', file: 'page', edits: [
      ["if (solidAt(lv, c, row) || !(solidAt(lv, c, row + 1)", "if (!(solidAt(lv, c, row + 1)"], ["if (solidAt(lv, c2, row) || !(solidAt(lv, c2, row + 1)", "if (!(solidAt(lv, c2, row + 1)"]],
    gates: [{ gate: 'harness', only: 'H-wpn-D1', expect: 'a solid cell 2 cells right stops the right front' }] },
  { name: 'SHOCK_OFF_THE_LEDGE', task: 'W1', file: 'page', edits: [
      ["if (solidAt(lv, c, row) || !(solidAt(lv, c, row + 1) || platAt(lv, c, row + 1))) break;", "if (solidAt(lv, c, row)) break;"], ["if (solidAt(lv, c2, row) || !(solidAt(lv, c2, row + 1) || platAt(lv, c2, row + 1))) break;", "if (solidAt(lv, c2, row)) break;"]],
    gates: [{ gate: 'harness', only: 'H-wpn-D1', expect: 'on a 4 cell ledge the wave ends at its edges' }] },
  { name: 'SHOCK_ON_PLAIN_LANDING', task: 'W1', file: 'page', find: "var diveLanded = landed && h.dive !== 0,", repl: "var diveLanded = landed && !startedGrounded,",
    gates: [{ gate: 'harness', only: 'H-wpn-D1', expect: 'a plain landing (no dive) fires nothing' }] },
  { name: 'DASH_FIRES_IN_PLACE', task: 'W1', file: 'page', find: "dashed = dashStart && h.x !== xBefore;", repl: "dashed = dashStart;",
    gates: [{ gate: 'harness', only: 'H-wpn-D1', expect: 'a dash pressed flush against a wall moves nothing and fires nothing' }] },
  { name: 'KILL_NO_DP', task: 'W1', file: 'page', find: "      s.room.dp += en.elite ? T.DP_ELITE : T.DP_FODDER; s.ev |= EV.KILL;", repl: "      s.ev |= EV.KILL;",
    gates: [{ gate: 'harness', only: 'H-wpn-5', expect: 'a kill sets HURT and KILL and banks DP_FODDER' }] },
  { name: 'DEAD_STILL_TOUCHES', task: 'W1', file: 'page', edits: [
      ["      if (en.hp <= 0 && !(en.kind === SB.features.ICICLE && en.state === ICICLE_GONE)) continue;\n", ""], ["      if (held || !liveEnemy(en)) continue;", "      if (held) continue;"]],
    gates: [{ gate: 'harness', only: 'H-wpn-5', expect: 'the dead moth never moves' }] },
  { name: 'STUN_WAKES_SLEEPER', task: 'W1', file: 'page', find: "      if (p.stun > 0 && en.stunned >= 0) en.stunned = Math.max(en.stunned, p.stun);", repl: "      if (p.stun > 0) en.stunned = Math.max(en.stunned, p.stun);",
    gates: [{ gate: 'harness', only: 'H-wpn-5', expect: 'and never wakes it' }] },
  { name: 'WEAPON_ON_CLEAR', task: 'W1', file: 'page', find: "       acting waits a step. A hit lands here, before the enemies move and touch */\n    if (!s.room.cleared) {", repl: "       acting waits a step. A hit lands here, before the enemies move and touch */\n    if (true) {",
    gates: [{ gate: 'harness', only: 'H-wpn-5', expect: 'a jump that clears the room on its takeoff step throws nothing' }] },
  { name: 'CHEST_NO_WEAPON', task: 'W1', file: 'page', find: "        var got = drawWeapon(s);", repl: "        var got = 0;",
    gates: [{ gate: 'harness', only: 'H-wpn-6', expect: "the chest equips the test's draw at once" }, { gate: 'fight', expect: '412: the chest opens by a real walk with its voice and the equip voice' }] },
  { name: 'CHEST_GIVES_EQUIPPED', task: 'W1', file: 'page', edits: [
      ["if (h.slots[slotOf(c)] !== c) { n++; if (h.slots[slotOf(c)] === 0) empty++; }", "{ n++; if (h.slots[slotOf(c)] === 0) empty++; }"], ["      if (h.slots[slotOf(c)] === c) continue;\n", ""]],
    gates: [{ gate: 'harness', only: 'H-wpn-6', expect: 'no chest gives a weapon already equipped' }] },
  { name: 'CHEST_STOPS_FOR_EMPTY', task: 'W1', file: 'page', find: "        if (got > 0 && h.slots[slotOf(got)] === 0) { h.slots[slotOf(got)] = got; s.ev |= EV.EQUIP; }\n        else if (got > 0)", repl: "        if (got > 0)",
    gates: [{ gate: 'harness', only: 'H-wpn-6', expect: 'no compare ever opens from the built pool' }, { gate: 'fight', expect: '412: the world is never held' }] },
  { name: 'CHEST_DRAWS_ON_EMPTY_POOL', task: 'W1', file: 'page', find: "    if (n === 0) return 0;\n    var wantEmpty", repl: "    if (n === 0) { SB.rng.stepU32(s, 'rng'); return 0; }\n    var wantEmpty",
    gates: [{ gate: 'harness', only: 'H-wpn-6', expect: 'or with both slots full pays DP only and draws nothing' }] },
  { name: 'TAKE_KEEPS_OLD', task: 'W1', file: 'page', find: "        if (choice === CHOICE.TAKE && s.room.cand > 0) { h.slots[slotOf(s.room.cand)] = s.room.cand; s.ev |= EV.EQUIP; }", repl: "        if (choice === CHOICE.TAKE && s.room.cand > 0) { s.ev |= EV.EQUIP; }",
    gates: [{ gate: 'harness', only: 'H-wpn-7', expect: 'TAKE puts' }] },
  { name: 'HUD_STALE', task: 'W1', file: 'page', find: "      if (c === shownSlots[k]) continue;", repl: "      if (c === shownSlots[k] || !fresh) continue;",
    gates: [{ gate: 'fight', expect: '412: the jump box shows' }] },
  { name: 'HUD_EVERY_STEP', task: 'W1', file: 'page', find: "      if (c === shownSlots[k]) continue;", repl: "      if (c === shownSlots[k]) { slotBoxes[k].setAttribute('aria-label', slotLabel(k, c)); continue; }",
    gates: [{ gate: 'fight', expect: '412: the HUD is written 0 times over 30 quiet steps' }] },
  { name: 'GOT_TAKES_TAPS', task: 'W1', file: 'page', find: "width: min(300px, 90%); z-index: 4; pointer-events: none;", repl: "width: min(300px, 90%); z-index: 4;",
    gates: [{ gate: 'fight', expect: '412: the card is in view' }] },
  { name: 'GOT_STAYS', task: 'W1', file: 'page', find: "clearTimeout(el.sbGotT); el.sbGotT = setTimeout(function () { el.classList.remove('on'); }, GOT_MS);", repl: "clearTimeout(el.sbGotT);",
    gates: [{ gate: 'fight', expect: '412: the card goes in about 2.5 s' }] },
  { name: 'GOT_OVER_BUG', task: 'W1', file: 'page', find: "      if (top - pad < cr.bottom && top + hd.h * k + pad > cr.top) el.classList.add('low');\n", repl: '',
    gates: [{ gate: 'fight', expect: "412: a chest near the room's top with the bug beside it: the card docks low" }] },
  { name: 'GOT_STAYS_OVER_BUG', task: 'W1', file: 'page', find: "    else SB.ui.gotFollow();\n", repl: '',
    gates: [{ gate: 'fight', expect: '412: as the bug falls under the docked card' }] },
  { name: 'THROW_SILENT', task: 'W1', file: 'page', find: "      if (ev & EV.FIRE_J) { var vj = SB.ui.WPN_SFX[SB.sim.WPN[G.state.hero.slots[0]]]; if (vj === undefined) vj = 'throw'; if (vj) au.sfx(vj); }\n", repl: '',   /* re anchored at W2 */
    gates: [{ gate: 'fight', expect: '412: a real A tap throws the boomerang with the throw voice' }] },
  { name: 'PROJ_IN_BRICK', task: 'W1', file: 'page', find: "      boomerang_0: '................................/................................/................................/................................/................................/................................/................................/................................/................................/......0", repl: "      boomerang_0: '................................/................................/................................/................................/................................/................................/................................/................................/................................/......9",   /* re anchored at ART2 on Astra's boomerang: its first Ink pixel Brick */
    gates: [{ gate: 'harness', only: 'H-spr-1', expect: 'fx_projectiles.boomerang_0 has an Ink outline and draws only' }] },
  { name: 'GEAR_LOST_ON_NEXT_ROOM', task: 'W1', file: 'page', find: "    if (SB.TUNING.KEEP_GEAR && G.state) G.gear = G.state.hero.slots.slice();", repl: '',
    gates: [{ gate: 'fight', expect: "412: Play it again starts the next room with the cleared room's gear" }] },
  { name: 'GEAR_KEPT_THROUGH_TITLE', task: 'W1', file: 'page', find: "    if (!(opts && opts.keepGear === true)) { G.gear = [0, 0, 0]; G.entry = [0, 0, 0]; }\n", repl: '',
    gates: [{ gate: 'fight', expect: '412: Title through the pause card ends the sitting' }] },
  { name: 'DEATH_KEEPS_PICKUP', task: 'W1', file: 'page', find: "  ui.showDeath = function () {\n", repl: "  ui.showDeath = function () {\n    if (G.state) G.gear = G.state.hero.slots.slice();\n",
    gates: [{ gate: 'fight', expect: '412: a death after the chest' }] },
  { name: 'ROOM_OPTS_MISSING', task: 'W1', file: 'page', find: "    roomOpts: function () { return { loadout: (G.entry || [0, 0, 0]).map(function (c) { return c > 0 ? SB.sim.WPN[c] : null; }) }; },", repl: "    roomOpts: function () { return {}; },",
    gates: [{ gate: 'fight', expect: '412: the recording replayed on a fresh sim made from SB_DEV.roomOpts()' }] },
  { name: 'NAME_BEFORE_BUILT', task: 'W1', file: 'page', find: "slots: 'Weapons', slotJump:", repl: "slots: 'Weapons and a Pogo Spear', slotJump:",   /* re anchored at W2: Halo is built */
    gates: [{ gate: 'lint', expect: 'names Pogo Spear (D3), a weapon this build does not have' }] },
  { name: 'SENTENCE_MISSING', task: 'W1', file: 'page', find: ", D1: 'Dive landings and dashes send a shock along the ground.',", repl: ",",   /* re anchored at W2 */
    gates: [{ gate: 'lint', expect: 'COPY.wpnSays holds J1, J2, J3, J4, J5, J6, J7, J8, the build has J1, D1, J2' }] },
  { name: 'ICON_MISSING', task: 'W1', file: 'page', find: "\n      D1: '", repl: "\n      D1x: '",   /* re anchored at ART3: D1's glyph not named by its code */
    gates: [{ gate: 'lint', expect: 'the built D1 has no icon_weapons glyph named D1' }, { gate: 'harness', only: 'H-spr-1', expect: 'glyph named by its code (J6 Halo as Astra drew it, no Ink) (unbound: D1)' }] },   /* re anchored at W2 */
  { name: 'WPN_RENAMED', task: 'W1', file: 'page', find: "wpn: { J1: 'Boomerang', D1: 'Anvil Boots',", repl: "wpn: { J1: 'Boomerang', D1: 'Anvil Shoes',",   /* re anchored at W2 */
    gates: [{ gate: 'lint', expect: 'COPY.wpn.D1 is "Anvil Shoes", DESIGN 9.1 names it "Anvil Boots"' }] },  /* ART2: Astra's weapons cut (Q161): the cutter's rules, the poses, the effects and the icons */
  { name: "BOOMERANG_PLACEHOLDER", task: 'ART2', file: "page", edits: [["        key = 'fx_projectiles.boomerang' + FX4[Math.floor(Math.max(0, p.age) / 5) % 4] + (p.vx < 0 ? '<' : '');\n        var bx = (p.x >> 8) - 10, by = (p.y >> 8) - cam - 10; spr(ctx, key, bx, by); rec(p.kind, key, bx, by, 32, 32, camX);", "        key = 'boomerang.' + 'abcd'.charAt(Math.floor(Math.max(0, p.age) / 5) % 4) + (p.vx < 0 ? '<' : '');\n        var bx = p.x >> 8, by = (p.y >> 8) - cam; spr(ctx, key, bx, by); rec(p.kind, key, bx, by, 12, 12, camX);"], ["    pipe: { w: 16, h: 16, frames: {\n", "    boomerang: { w: 12, h: 12, frames: {\n      a: '........000./.......06660/......066630/.....066630./....066630../...066630.../..066630..../.0666300000./06666666660./06666666630./.0333333330./..00000000..',\n      b: '..00......../.0660......./036660....../0366660...../03666660..../036636660.../0366036660../03660036660./03660.036660/03360..03660/.0000...0360/.........00.',\n      c: '..00000000../.0333333330./.03666666660/.06666666660/.0000036660./....036660../...036660.../..036660..../.036660...../036660....../06660......./.000........',\n      d: '.00........./0630...0000./06630..06330/066630.06630/.06663006630/..0666306630/...066636630/....06666630/.....0666630/......066630/.......0660./........00..'\n    } },\n    pipe: { w: 16, h: 16, frames: {\n"]],
    gates: [{ gate: "fight", expect: "412: the boomerang is Astra's" }] },
  { name: "POP_WRONG_CLIP", task: 'ART2', file: "page", find: "key = 'fx_enemy_hit.enemy_death' + FX4[", repl: "key = 'fx_enemy_hit.enemy_hit' + FX4[",
    gates: [{ gate: "fight", expect: "412: the kill's pop is Astra's" }] },
  { name: "HIT_NO_BURST", task: 'ART2', file: "page", find: "      spr(ctx, key, hx2, hy2); rec('hit', key, hx2, hy2, 32, 32, camX);\n", repl: "",
    gates: [{ gate: "fight", expect: "412: a hit on a live jelly draws Astra's burst over it" }] },
  { name: "SHOCK_ONE_HALF", task: 'ART2', file: "page", find: "var fx = side < 0 ? lf : rf, hx0 = side < 0 ? bb.x0 : 24, hw = side < 0 ? 24 - bb.x0 : bb.x1 - 23;", repl: "var fx = side < 0 ? lf : rf, hx0 = bb.x0, hw = 24 - bb.x0;",
    gates: [{ gate: "fight", expect: "412: the shock is Astra's ring split at its centre" }] },
  { name: "ICON_SCALED", task: 'ART2', file: "page", find: "var r = A['icon_weapons.' + id]; if (!r) return false; c2.drawImage(atlas, r.x, r.y, r.w, r.h, x || 0, y || 0, r.w, r.h); return true;", repl: "var r = A['icon_weapons.' + id]; if (!r) return false; c2.drawImage(atlas, r.x, r.y, r.w, r.h, x || 0, y || 0, 16, 16); return true;",   /* re anchored at ART3 */
    gates: [{ gate: "fight", expect: "412: the jump box shows J1's icon (icon_weapons.J1), its 576 pixels" }] },
  { name: "ICON_SWAPPED", task: 'ART2', file: "page", find: "\n      J1: '", repl: "\n      boomerang: '",   /* re anchored at ART3: the glyph named by Astra's round 1 name, not its code */
    gates: [{ gate: "lint", expect: "not Astra's order J1 J2" }] },
  { name: "SHOCK_NO_RIM", task: 'ART2', file: "page", find: "          sprPart(ctx, key + '#', hx0, ry, hw, rh, hx + side, rtop); sprPart(ctx, key + '#', hx0, ry, hw, rh, hx, rtop - 1);\n", repl: "",
    gates: [{ gate: "fight", expect: "412: the shock is Astra's ring split at its centre" }] },
  { name: "POSE_SQUASH_OFF", task: 'ART2', file: "page", find: "    if (h.squash > 0) return 'hero_squash.squash';", repl: "    if (h.squash > 0) return 'land';",
    gates: [{ gate: "sprites", expect: "the takeoff draws hero_stretch 10x18 for" }] },
  { name: "POSE_STRETCH_OFF", task: 'ART2', file: "page", find: "    if (h.squash < 0) return 'hero_stretch.stretch';", repl: "    if (h.squash < 0 && false) return 'hero_stretch.stretch';",
    gates: [{ gate: "sprites", expect: "the takeoff draws hero_stretch 10x18 for" }] },
  { name: "POSE_DASH_OFF", task: 'ART2', file: "page", find: "    if (h.dash > 0) return 'hero_dash.dash';", repl: "    if (h.dash > 0) return 'run1';",
    gates: [{ gate: "sprites", expect: "a dash draws hero_dash" }] },
  { name: "POSE_HURT_OFF", task: 'ART2', file: "page", find: "    if (h.iframes > SB.K.HIT_IFRAMES_F - R.HURT_POSE_F) return 'hero_hurt.recoil';\n", repl: "",
    gates: [{ gate: "sprites", expect: "a hit draws hero_hurt.recoil" }] },
  { name: "DROPIN_OFF", task: 'ART2', file: "page", find: "    if (s.frame < R.DROP_BEAT * 3 && h.anim === 0 && h.vy >= 0 && h.squash >= 0 && !h.dash) return 'hero_dropin.' + R.DROP_BEATS[Math.floor(s.frame / R.DROP_BEAT)];\n", repl: "",
    gates: [{ gate: "sprites", expect: "a room opens on the drop in" }] },
  { name: "POSE_IN_BRICK", task: 'ART2', file: "page", find: "      dash: '............/.....0", repl: "      dash: '............/.....9",
    gates: [{ gate: "harness", only: "H-spr-1", expect: "hero_dash.dash has an Ink outline and draws only" }] },
  { name: "SUN_IN_FX", task: 'ART2', file: "page", find: "      boomerang_0: '................................/................................/................................/................................/................................/................................/................................/................................/................................/......0", repl: "      boomerang_0: '................................/................................/................................/................................/................................/................................/................................/................................/................................/......e",
    gates: [{ gate: "harness", only: "H-spr-1", expect: "fx_projectiles.boomerang_0 holds no Sun" }] },
  { name: "CUT_SUN_PAST_HERO", task: 'ART2', file: "astra", find: "            elif key not in SUN_KEYS and any('e' in s for s in frames.values()):", repl: "            elif key not in SUN_KEYS and not key.startswith('fx_') and any('e' in s for s in frames.values()):",   /* re anchored at ART3 */
    gates: [{ gate: "astra", expect: "Sun in an effect (fx_projectiles) is refused" }] },
  { name: "CUT_POSE_SUN_REFUSED", task: 'ART2', file: "astra", find: "            elif key.startswith('hero_'):", repl: "            elif False:",
    gates: [{ gate: "astra", expect: "the hero's poses (hero_dash, hero_hurt, hero_squash, hero_stretch, hero_dropin) each carry Sun and are cut" }] },
  { name: "CUT_FX_NAMES_FREE", task: 'ART2', file: "astra", find: "                    if not fm:\n                        raise Refuse('%s frame %s is not <clip>_<n>' % (key, name))\n", repl: "                    if not fm:\n                        continue\n",
    gates: [{ gate: "astra", expect: "an effect frame not named <clip>_<n> is refused" }] },
  { name: "CUT_FX_UNKNOWN", task: 'ART2', file: "astra", find: "            elif FX_RE.match(key):\n                warnings.append(", repl: "            elif False and FX_RE.match(key):\n                warnings.append(",
    gates: [{ gate: "astra", expect: "an effect strip new to the page (fx_shockwave on a copy without it) is taken as named clips" }] },
  { name: "CUT_CAP_RAISED", task: 'ART2', file: "astra", find: "MAX_SPRITES = 46\n", repl: "MAX_SPRITES = 48\n",   /* re anchored at W2 (46) */   /* re anchored at ART3 (the cap at the splice, 43) */
    gates: [{ gate: "astra", expect: "the cap is 46, W2's" }] },
  /* ART3: Astra's rounds 2 and 3 (Q98): the cutter's rules, the splice, the stick, Pause, the crusher's shaft, the speck,
     the elites' keylines, the biome's air and badges, the icons by code */
  { name: "CUT_GAME_CASE", task: 'ART3', file: "astra", find: "    if str(man.get('game', '')).lower() != 'shutterbug':", repl: "    if man.get('game') != 'shutterbug':",
    gates: [{ gate: "astra", expect: "round 3's manifest naming its game SHUTTERBUG is the game's" }] },
  { name: "CUT_FX_SIDES_NARROW", task: 'ART3', file: "astra", find: "FX_SIDES = (16, 32, 48, 64)", repl: "FX_SIDES = (32, 48)",
    gates: [{ gate: "astra", expect: "round 3's 16 px chip and 64 px fall are cut as effects" }] },
  { name: "CUT_BEACON_FX_SUN", task: 'ART3', file: "astra", find: "SUN_KEYS = ('beacon', 'fx_beacon_light')", repl: "SUN_KEYS = ('beacon',)",
    gates: [{ gate: "astra", expect: "round 3's fx_beacon_light carries the beacon's Sun and is cut" }] },
  { name: "SPLICE_CAP_GONE", task: 'ART3', file: "astra", find: "    if n >= MAX_SPRITES:\n        raise Refuse(", repl: "    if False:\n        raise Refuse(",
    gates: [{ gate: "astra", expect: "its splice is refused at the cap, the page unwritten" }] },
  { name: "SPLICE_KEEPS_RENAMED", task: 'ART3', file: "astra", find: "            if key != 'hero':\n                old = []\n", repl: "",
    gates: [{ gate: "astra", expect: "a key's entry (icon_weapons as J1, Z1 to Z26) replaces the page's 27 frames whole" }] },
  { name: "ICON_BY_STRIP_INDEX", task: 'ART3', file: "page", find: "var r = A['icon_weapons.' + id]; if (!r) return false;", repl: "var IK = Object.keys(SPRITES.icon_weapons.frames), r = A['icon_weapons.' + IK[IK.indexOf(id) + 1]]; if (!r) return false;",
    gates: [{ gate: "lint", expect: "R.icon does not look its glyph up by the code" }, { gate: "fight", expect: "412: the jump box shows J1's icon (icon_weapons.J1), its 576 pixels" }] },
  { name: "ICON_J1_REDRAWN", task: 'ART3', file: "page", find: "      J1: '......................../......................../......................../......................../......................../..00000", repl: "      J1: '......................../......................../......................../......................../......................../..00002",
    gates: [{ gate: "harness", only: "H-spr-1", expect: "icon_weapons.J1 and .D1 are round 1's boomerang and anvil_boots pixel for pixel" }] },
  { name: "ELITE_KEYLINE_GONE", task: 'ART3', file: "page", find: "/044664400033330004466440/040000440033330044000040/040aa04400333300440aa040", repl: "/044664400033330004466440/040000440033330044000040/044aa04400333300440aa040",
    gates: [{ gate: "harness", only: "H-spr-1", expect: "moth_elite.a keylines every Magenta mark in Ink, all eight neighbours (open at" }] },
  { name: "SPECK_GLINT_BOTH", task: 'ART3', file: "page", find: "a: '................/................/................/.......0......../......080......./.....088800.....", repl: "a: '................/................/................/.......0......../......080......./.....088600.....",
    gates: [{ gate: "harness", only: "H-spr-1", expect: "with the Glare glint on frame b only" }] },
  { name: "SKYHOOK_GONE", task: 'ART3', file: "page", find: "    fx_skyhook: { w: 32, h: 32, frames: {", repl: "    fx_skyhooks: { w: 32, h: 32, frames: {",
    gates: [{ gate: "harness", only: "H-spr-1", expect: "fx_skyhook is spliced for J8" }] },
  { name: "PARKED_ON_PAGE", task: 'ART3', file: "page", find: "    fx_skyhook: { w: 32, h: 32, frames: {", repl: "    fx_tripod: { w: 32, h: 32, frames: {",
    gates: [{ gate: "harness", only: "H-spr-1", expect: "nothing parked is on the page" }] },
  { name: "CRUSHER_TILED", task: 'ART3', file: "page", find: "        if (crush && lv.trap[tf[q2] + lv.w] === 1) ctx.drawImage(atlas, tr0.x, tr0.y, tr0.w, 1, (tf[q2] % lv.w) * C, ty2, C, C);\n        else spr(ctx, tk, (tf[q2] % lv.w) * C, ty2);", repl: "        spr(ctx, tk, (tf[q2] % lv.w) * C, ty2);",
    gates: [{ gate: "sprites", expect: "a 3 cell crusher column in phase a (trap phase 10): the cells above the bottom are row 0" }] },
  { name: "CRUSHER_BOTTOM_SHAFT", task: 'ART3', file: "page", find: "if (crush && lv.trap[tf[q2] + lv.w] === 1) ctx", repl: "if (crush) ctx",
    gates: [{ gate: "sprites", expect: "a 3 cell crusher column in phase a (trap phase 10): the cells above the bottom are row 0" }] },
  { name: "SPECK_STUCK_A", task: 'ART3', file: "page", find: "spr(ctx, LK[lt2.kind] + (lt2.kind === 1 && (Math.floor(s.frame / (lbeat * 3)) & 1) ? '.b' : '.a'), lx2, ly);", repl: "spr(ctx, LK[lt2.kind] + '.a', lx2, ly);",
    gates: [{ gate: "sprites", expect: "the sample room's speck draws speck.b with its glint on the beat" }] },
  { name: "MOTES_WRONG_BIOME", task: 'ART3', file: "page", find: "key = R.MOTE_KEYS[b] || R.MOTE_KEYS[0]", repl: "key = R.MOTE_KEYS[(b + 1) % 5]",
    gates: [{ gate: "sprites", expect: "biome 0: five dust_mote tiles drawn over the room at 4 fps" }] },
  { name: "MOTES_AT_60", task: 'ART3', file: "page", find: "t = Math.floor(s.frame / R.MOTE_TICK)", repl: "t = s.frame",
    gates: [{ gate: "sprites", expect: "biome 0: five dust_mote tiles drawn over the room at 4 fps" }] },
  { name: "MOTES_UNREPEATABLE", task: 'ART3', file: "page", find: "var x0 = hsh % wspan", repl: "var x0 = Math.floor(Math.random() * wspan)",
    gates: [{ gate: "sprites", expect: "biome 0: the same state draws the same tiles" }] },
  { name: "MOTES_UNDER_REDUCED", task: 'ART3', file: "page", find: "SB.ui.screen !== 'play' || R.reduced()", repl: "SB.ui.screen !== 'play'",
    gates: [{ gate: "sprites", expect: "biome 0: under reduced motion no tile is drawn" }] },
  { name: "MOTES_JUMP", task: 'ART3', file: "page", find: "R.MOTE_DRIFT = [2, 4, -4, 4, -4];", repl: "R.MOTE_DRIFT = [0, 0, 0, 0, 0];",
    gates: [{ gate: "sprites", expect: "biome 0: a loop later each tile has drifted 2 px" }] },
  { name: "BADGE_WRONG_BIOME", task: 'ART3', file: "page", find: "el.style.backgroundImage = 'var(--icon-biomes-' + nm + ')';", repl: "el.style.backgroundImage = 'var(--icon-biomes-attic)';",
    gates: [{ gate: "sprites", expect: "biome 3: the room name's badge is icon_biomes.overgrowth" }] },
  { name: "REVEAL_NO_BADGE", task: 'ART3', file: "page", find: "    ctx.drawImage(atlas, br.x, br.y, br.w, br.h, bx, 8, 48, 48);\n", repl: "",
    gates: [{ gate: "sprites", expect: "biome 0: the develop reveal draws icon_biomes.attic at 2x" }] },
  { name: "PAD_CSS_RING", task: 'ART3', file: "page", find: "  background: var(--stick-pad-idle) 0 0 / 116px 116px no-repeat; image-rendering: pixelated; pointer-events: none; }", repl: "  border: 2px solid rgba(11,10,15,0.45); background: rgba(11,10,15,0.08); border-radius: 50%; pointer-events: none; }",
    gates: [{ gate: "input", expect: "412x915: held neutral, the pad is stick_pad.idle at 116 css px" }] },
  { name: "PAD_NEVER_ACTIVE", task: 'ART3', file: "page", find: "#stick .pad.l, #stick .pad.r { background-image: var(--stick-pad-active); }", repl: "",
    gates: [{ gate: "input", expect: "412x915: steering R, the pad is stick_pad.active" }] },
  { name: "KNOB_NO_WAY", task: 'ART3', file: "page", find: "#stick .pad.r .knob { background-image: var(--stick-knob-right); }", repl: "",
    gates: [{ gate: "input", expect: "412x915: steering R, the knob is stick_knob.right" }] },
  { name: "HINT_HALF_WRONG", task: 'ART3', file: "page", find: "#stick .idle .hr { background-position: calc(-60 * var(--hk)) 0; }", repl: "",
    gates: [{ gate: "input", expect: "412x915: idle, the hint's chevrons are stick_hint's left and right 12 columns" }] },
  { name: "PAUSE_OLD_BOX", task: 'ART3', file: "page", find: "#pause i { width: 32px; height: 32px; display: block; background: var(--pause-glyph-normal) 0 0 / 32px 32px no-repeat; image-rendering: pixelated; }", repl: "#pause i { width: 28px; height: 28px; border-radius: 8px; border: 2px solid rgba(11,10,15,0.35); background: rgba(11,10,15,0.06); display: block; }",
    gates: [{ gate: "input", expect: "412x915: Pause is pause_glyph.normal at 2x" }] },
  { name: "PAUSE_NOT_PRESSED", task: 'ART3', file: "page", find: "#pause.down i { background-image: var(--pause-glyph-pressed); }", repl: "",
    gates: [{ gate: "input", expect: "412x915: under a held finger Pause is pause_glyph.pressed" }] },
  /* W2: weapons step 2, the jump slot and the swap (docs/WEAPONS-V1.md 13.2) */
  { name: 'SWAP_AUTO_TAKES', task: 'W2', file: 'page', find: "      /* the compare is the player's own from Weapons v1 step 2: the swap card (ui.swap) answers it, never the shell */", repl: "      else if (st.room.compare) SB.input.choose(SB.sim.CHOICE.TAKE);",
    gates: [{ gate: 'compare', expect: '412: while it is open nothing in the world moves' }] },
  { name: 'SIM_RUNS_UNDER_SWAP', task: 'W2', file: 'page', find: "        s.room.compare = 0; s.room.cand = 0; s.ev |= EV.PICK;\n      }\n      s.frame++; return s;\n    }", repl: "        s.room.compare = 0; s.room.cand = 0; s.ev |= EV.PICK;\n      }\n    }",
    gates: [{ gate: 'harness', only: 'H-wpn-7', expect: 'the world holds through 30 steps' }, { gate: 'compare', expect: '412: while it is open nothing in the world moves' }] },
  { name: 'SWAP_WORDS_WRONG', task: 'W2', file: 'page', find: "said.push(a[0] > b[0] ? C.cmpFarther : C.cmpShorter);", repl: "said.push(a[0] > b[0] ? C.cmpShorter : C.cmpFarther);",
    gates: [{ gate: 'compare', expect: "412: every pair of built weapons of a slot gives the gate's comparison line" }] },
  { name: 'SWAP_NOT_MODAL', task: 'W2', file: 'page', find: "'sharesheet', 'devcard', 'swap'];", repl: "'sharesheet', 'devcard'];",
    gates: [{ gate: 'compare', expect: '412: the chest by a real walk opens the swap card' }] },
  { name: 'SWAP_OVER_PAUSE', task: 'W2', file: 'page', find: "#swap.tall, #swap.deep { top: 16px;", repl: "#swap.tall, #swap.deep { top: 0;",
    gates: [{ gate: 'compare', expect: '320: the card sits' }] },
  { name: 'SWAP_NO_DEEP', task: 'W2', file: 'page', find: "var tries = ['', 'high', 'low', 'tall', 'deep'], r;", repl: "var tries = ['', 'high', 'low', 'tall'], r;",
    gates: [{ gate: 'compare', expect: "320: the worst angle, the bug at the room's top beside the chest: the card hangs deep" }] },
  { name: 'TRAITS_MISSING', task: 'W2', file: 'page', find: "J7: [3, 0, 1, 1, 0], J8: [0, 0, 0, 0, 1],", repl: "J7: [3, 0, 1, 1, 0],",
    gates: [{ gate: 'lint', expect: 'the built J8 has no ui.TRAITS row of five numbers (TRAITS_MISSING)' }] },
  { name: 'TWIN_DARTS_ONE', task: 'W2', file: 'page', find: "    for (var side = -1; side <= 1; side += 2) {\n      var k = spawn(s, DART);", repl: "    for (var side = 1; side <= 1; side += 2) {\n      var k = spawn(s, DART);",
    gates: [{ gate: 'harness', only: 'H-wpn-J5', expect: 'a jump shoots two darts' }] },
  { name: 'DART_PASSES_THROUGH', task: 'W2', file: 'page', find: "if (hit(s, p, p.x, p.y, p.x + K.J5_BOXW, p.y + K.J5_BOXH, true) > 0 || ", repl: "if (hit(s, p, p.x, p.y, p.x + K.J5_BOXW, p.y + K.J5_BOXH) < 0 || ",
    gates: [{ gate: 'harness', only: 'H-wpn-J5', expect: 'a dart stops on its first enemy' }] },
  { name: 'HALO_THROUGH_SOLID', task: 'W2', file: 'page', find: "    if (solidBox(lv, p.x, p.y, p.x + K.J6_BOXW, p.y + K.J6_BOXH)) { free(p); return; }\n", repl: "",
    gates: [{ gate: 'harness', only: 'H-wpn-J6', expect: 'a solid cell there frees it' }] },
  { name: 'FLASH_AT_TAKEOFF', task: 'W2', file: 'page', find: "    if (h.vy < 0 && !h.ground) return;\n    var R = K.J4_REACH;", repl: "    var R = K.J4_REACH;",
    gates: [{ gate: 'harness', only: 'H-wpn-J4', expect: 'FIRE_J on the takeoff step, the burst (BURST) on step' }] },
  { name: 'SNAP_HURTS', task: 'W2', file: 'page', find: "x0 + K.HERO_W_SUB + R, y0 + K.HERO_H_SUB + R, 0, K.J7_FREEZE_F);", repl: "x0 + K.HERO_W_SUB + R, y0 + K.HERO_H_SUB + R, K.HP_Q, K.J7_FREEZE_F);",
    gates: [{ gate: 'harness', only: 'H-wpn-J7', expect: 'and keep every quarter' }] },
  { name: 'KICK_ON_GROUND_JUMP', task: 'W2', file: 'page', find: "acted = wallSide !== 0 && shieldKick(s, x0, y0, wallSide);", repl: "acted = shieldKick(s, x0, y0, wallSide);",
    gates: [{ gate: 'harness', only: 'H-wpn-J3', expect: 'a ground jump never kicks' }] },
  { name: 'SPARKS_2', task: 'W2', file: 'page', find: "J2: { count: 3,", repl: "J2: { count: 2,",
    gates: [{ gate: 'harness', only: 'H-wpn-J2', expect: 'a jump drops three sparks' }] },
  { name: 'SKYHOOK_ON_WALL_JUMP', task: 'W2', file: 'page', find: "wallSide = h.wall; h.vy = -K.WALL_V;", repl: "wallSide = h.wall; h.vy = h.slots[0] === WPN_J8 ? -K.J8_JUMP_V : -K.WALL_V;",
    gates: [{ gate: 'harness', only: 'H-sim-1b', expect: 'a wall jump with Skyhook takes WALL_V as unarmed' }] },
  { name: 'SKYHOOK_BREAKS_ASCENT', task: 'W2', file: 'page', find: "J8: { extraUpCells: 1, jumpV: 9.5,", repl: "J8: { extraUpCells: 1, jumpV: 16,",
    gates: [{ gate: 'harness', only: 'H-bot-8', expect: 'walked levels clear with Skyhook, every ascent edge performed:' }] },
  { name: 'FROZEN_UNDRAWN', task: 'W2', file: 'page', find: "    drawHeld(s, cam, camX);\n", repl: "",
    gates: [{ gate: 'fight', expect: '412: a real A tap with Shutter Snap freezes the moth' }] },
];

/* ---------------------------------------------------------------- run */
const args = process.argv.slice(2);
const CHECK = args.includes('--check'), WITH_BROWSER = args.includes('--browser'), BROWSER_ONLY = args.includes('--browser-only');
const names = args.filter(a => !a.startsWith('--'));
const unknown = names.filter(n => !MUTANTS.some(m => m.name === n));
if (unknown.length) { console.log('no mutant named ' + unknown.join(', ')); process.exit(2); }
const isBrowserRow = g => BROWSER.has(g.gate);

fs.mkdirSync(OUT, { recursive: true });
/* a row's anchors, counted without running anything: 'ok', or ANCHOR LOST with the count */
function anchorOf(m) {
  const isFx = m.file.startsWith('fixture:');
  const src = m.file === 'harness' ? path.join(GAME, 'harness.js') : isFx ? path.join(GAME, 'fixtures', m.file.slice(8))
    : m.file === 'make' ? path.join(GAME, 'fixtures', 'make.html') : m.file === 'sw' ? path.join(GAME, 'sw.js')
    : m.file === 'astra' ? path.join(GAME, 'tools', 'astra_cut.py') : path.join(GAME, 'index.html');
  let text = fs.readFileSync(src, 'utf8');
  for (const [find, repl] of (m.edits || (m.find !== null ? [[m.find, m.repl]] : []))) {
    const count = text.split(find).length - 1;
    if (count !== 1) return 'ANCHOR LOST (find matches ' + count + ' times)';
    text = text.replace(find, () => repl);
  }
  return 'ok';
}
const rows = [];
for (const m of MUTANTS) {
  if (names.length && !names.includes(m.name)) continue;
  const gates = m.gates.filter(g => names.length ? true : BROWSER_ONLY ? isBrowserRow(g) : WITH_BROWSER ? true : !isBrowserRow(g));
  /* the browser rows this run skips still have their anchors counted, so an edit that drifts one turns check --fast
     red on the commit that drifts it (the fourth review: four rows drifted unseen from T0.15 to the deploy's check) */
  const unrun = names.length || BROWSER_ONLY ? [] : m.gates.filter(g => !gates.includes(g));
  if (unrun.length) { const a = anchorOf(m); if (a !== 'ok') for (const g of unrun) rows.push({ m, g, result: a + ', counted without the browser' }); }
  if (!gates.length) continue;
  const dir = path.join(OUT, m.name);
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  /* the copy: the page, a harness tree whose harness.js is the mutated one (tools/ and fixtures/ linked), or a copy
     of the corpus with one fixture file mutated (file 'fixture:<path under fixtures/>') */
  const isFixture = m.file.startsWith('fixture:');
  const fixCopy = path.join(dir, 'fixtures');
  if (isFixture) fs.cpSync(path.join(GAME, 'fixtures'), fixCopy, { recursive: true });
  const srcFile = m.file === 'harness' ? path.join(GAME, 'harness.js') : isFixture ? path.join(fixCopy, m.file.slice(8))
    : m.file === 'make' ? path.join(GAME, 'fixtures', 'make.html') : m.file === 'sw' ? path.join(GAME, 'sw.js')
    : m.file === 'astra' ? path.join(GAME, 'tools', 'astra_cut.py') : path.join(GAME, 'index.html');
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
  /* file 'sw' (T1.11): the mutated sw.js beside the page copy (the lint reads it there) and served through SB_SW */
  else if (m.file === 'sw') { fs.writeFileSync(path.join(dir, 'sw.js'), mutated); fs.copyFileSync(path.join(GAME, 'index.html'), page); }
  /* file 'astra' (the cutter): the mutated tools/astra_cut.py beside the page copy, run by the astra gate through SB_ASTRA_CUT */
  else if (m.file === 'astra') { fs.writeFileSync(path.join(dir, 'astra_cut.py'), mutated); fs.copyFileSync(path.join(GAME, 'index.html'), page); }
  else fs.writeFileSync(page, mutated);
  /* the page's sw.js beside every copy, so the lint's stamp rules see the pair (T1.11) */
  if (!fs.existsSync(path.join(dir, 'sw.js')) && fs.existsSync(path.join(GAME, 'sw.js'))) fs.copyFileSync(path.join(GAME, 'sw.js'), path.join(dir, 'sw.js'));
  const makeArgs = m.file === 'make' ? ['--make', path.join(dir, 'make.html')] : [];

  for (const g of gates) {
    if (anchor !== 'ok') { rows.push({ m, g, result: anchor }); continue; }
    let cmd, env = Object.assign({}, process.env);
    if (g.gate === 'lint') cmd = ['tools/lint.mjs', '--page', page].concat(makeArgs);
    else if (g.gate === 'harness') cmd = [harness, '--page', page].concat(g.only ? ['--only', g.only] : [], isFixture ? ['--fixtures', fixCopy] : [], g.args || []);
    else if (g.gate === 'astra') { cmd = ['test/astra.mjs']; env.SB_PAGE = page; if (m.file === 'astra') env.SB_ASTRA_CUT = path.join(dir, 'astra_cut.py'); }
    else if (BROWSER.has(g.gate)) { cmd = ['test/' + g.gate + '.mjs']; env.SB_PAGE = page; if (m.file === 'make') env.SB_MAKE = path.join(dir, 'make.html'); if (m.file === 'sw') env.SB_SW = path.join(dir, 'sw.js'); }
    else { rows.push({ m, g, result: 'UNKNOWN GATE' }); continue; }
    const r = spawnSync('node', cmd, { cwd: GAME, encoding: 'utf8', env, maxBuffer: 64 * 1024 * 1024, timeout: 15 * 60 * 1000 });
    const out = (r.stdout || '') + (r.stderr || '');
    fs.writeFileSync(path.join(dir, g.gate + '.out'), out);
    let result;
    if (r.status === 0) result = 'STAYED GREEN';
    /* a browser or astra row's text opens a FAIL line; a harness row's text sits in an assertion's FAIL line (two
       spaces; the group's summary line, one space, carries its title on every run, so a match there proved only that
       something in the group failed: the M1 review); the lint's anywhere in its output */
    else if (g.expect === null || [].concat(g.expect).some(e => BROWSER.has(g.gate) || g.gate === 'astra' ? out.includes('FAIL  ' + e)
      : g.gate === 'harness' ? out.split('\n').some(l => l.startsWith('FAIL  ') && l.includes(e)) : out.includes(e))) result = 'RED';
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
