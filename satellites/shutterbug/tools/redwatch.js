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
const BROWSER = new Set(['boot', 'play', 'input', 'layout', 'reveal', 'capture', 'death', 'sprites', 'make', 'loot', 'audio', 'share', 'save', 'pwa', 'loop', 'onboard']);

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
  { name: 'CLEAR_NO_RESTART', task: 'T0.8a', file: 'page', find: "  ui.again = function () { if (G.record) ui.startRoom(G.record, G.name, { level: G.level }); };",
    repl: "  ui.again = function () { if (G.record) { var keep = document.getElementById('clear').className; ui.startRoom(G.record, G.name, { level: G.level }); document.getElementById('clear').className = keep; } };",
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
    gates: [{ gate: 'play', expect: 'a second finger on A during a rocker hold: both register' }] },

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
  { name: 'DIVE_KEEPS_VX', task: 'review 3', file: 'page', edits: [['h.dive = 1; h.vy = K.TERM; h.vx = 0;', 'h.dive = 1; h.vy = K.TERM;'], ['    else if (h.dive) h.vx = 0;\n', '    else if (h.dive) { }\n']],
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
  { name: 'STICKY_PUSHOFF', task: 'T0.12a', file: 'page', find: 'if (pressed) { h.vy = -K.STICKY_V; h.sticky = 0; h.wall = 0;',
    repl: 'if (pressed) { h.vy = -K.STICKY_V; h.lock = -h.wall * K.WALL_JUMP_LOCK; h.sticky = 0; h.wall = 0;',
    gates: [{ gate: 'harness', only: 'H-sim-12', expect: 'and never moved sideways (no push off)' }] },
  { name: 'LOCK_ZERO', task: 'T0.12a', file: 'page', find: 'WALL_JUMP_LOCK: 10,', repl: 'WALL_JUMP_LOCK: 0,',
    gates: [{ gate: 'harness', only: 'H-sim-15', expect: 'held toward the wall, the lock carries the hero away' }] },
  { name: 'STICKY_ARMS_RISING', task: 'T0.12a', file: 'page', find: 'if (h.vy > 0 && !startedGrounded && h.dive === 0) side', repl: 'if (!startedGrounded && h.dive === 0) side',
    gates: [{ gate: 'harness', only: 'H-sim-12', expect: 'A gives' }] },
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
  /* T0.14: the develop reveal */
  { name: 'STATIC_BUILT_TWICE', task: 'T0.14', file: 'page', find: "    if (window.performance && performance.mark) performance.mark('sb-reveal-end');\n    ui.screen = 'play';",
    repl: "    if (window.performance && performance.mark) performance.mark('sb-reveal-end');\n    SB.render.buildStatic(G.level);\n    ui.screen = 'play';",
    gates: [{ gate: 'reveal', expect: 'the static layer is built once' }] },
  { name: 'AUDIO_AT_LOAD', task: 'T0.14', file: 'page', find: "A.init = function () { document.addEventListener('pointerdown', unlock, { capture: true, once: true }); };", repl: 'A.init = function () { unlock(); };',
    gates: [{ gate: 'reveal', expect: 'no AudioContext before the first tap' }] },
  { name: 'REVEAL_NO_SKIP', task: 'T0.14', file: 'page', find: "if (ui.screen !== 'reveal' || !RV.seen || e.target.closest('#back, #exit')) return;", repl: 'if (true) return;',
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
  { name: 'SPRITE_ROW_SHORT', task: 'T0.17', file: 'page', find: "a: 'ffffffffffffffff/ff0fff0fff0fff0f/", repl: "a: 'fffffffffffffff/ff0fff0fff0fff0f/",
    gates: [{ gate: 'lint', expect: 'tab.a row 0 is 15 wide' }, { gate: 'harness', only: 'H-spr-1', expect: 'tab.a decodes to 16x5' }] },
  /* T1.2b: features, part two */
  { name: 'SPECK_CAP_7', task: 'T1.2b', file: 'page', find: 'var cap = T.CAP_SPECK + (level.biome === 4 ? T.EMBER_EXTRA_SPECKS : 0);', repl: 'var cap = T.CAP_SPECK + 1 + (level.biome === 4 ? T.EMBER_EXTRA_SPECKS : 0);',
    gates: [{ gate: 'harness', only: 'H-feat-2', expect: 'eight isolated Sun specks within reach give CAP_SPECK' }] },
  { name: 'TRAP_ON_ASCENT', task: 'T1.2b', file: 'page', edits: [['if (taken[c]) { clash = true; break; } ', ''], ['      if (!trapOk(level, cells)) continue;\n', '']], find: null, repl: null,
    /* since T1.3 the second round catches a field on the ascent and the ladder removes it, so the lab names the loss */
    gates: [{ gate: 'harness', only: 'H-feat-3', expect: 'trap-pattern (authored for it) holds a field' }] },
  { name: 'TRAP_ON_TAB', task: 'T1.2b', file: 'page', find: ' || level.tab[c] || (c + w < n && level.tab[c + w])) continue;', repl: ') continue;',
    gates: [{ gate: 'harness', only: 'H-feat-3', expect: 'keeps the rule' }] },
  { name: 'TRAP_OK_BLIND', task: 'T1.2b', file: 'page', find: '      if (!found) return false;\n', repl: '',
    gates: [{ gate: 'harness', only: 'H-feat-3', expect: 'a field over the cell an ascent JUMP lands in is refused' }] },
  { name: 'NO_SCROLL_GUARANTEE', task: 'T1.2b', file: 'page', find: '      scroll = deepest(level, g, d, ok);\n', repl: '      scroll = -1; return { specks: cand, scroll: null, blueprint: null };\n',
    gates: [{ gate: 'harness', only: 'H-feat-2', expect: 'loot keeps the rules' }] },
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
  { name: 'DEATH_CARD_FIXED', task: 'review 4', file: 'page', find: "document.getElementById('death').classList.toggle('low', !!hd && hd.key !== null && hd.y + hd.h / 2 < cv.height / 2);", repl: '',
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
  { name: 'FLASH_UNDRAWN', task: 'review 4', file: 'page', find: '        if (it[5] && (idx === P.I.SUN || idx === P.I.WALNUT)) idx = P.I.GLARE;\n', repl: '',
    gates: [{ gate: 'sprites', expect: 'on the canvas the hero shows no Sun through the dash i frames' }] },
  { name: 'SQUASH_SMOOTHED', task: 'review 4', file: 'page', find: '    spr(ctx, key, dx, dy, dw, dh);\n', repl: '    ctx.imageSmoothingEnabled = h.squash !== 0; spr(ctx, key, dx, dy, dw, dh); ctx.imageSmoothingEnabled = false;\n',
    gates: [{ gate: 'sprites', expect: 'the stretch (' }] },
  { name: 'MOTH_AT_THREE', task: 'review 4', file: 'page', find: 'mark(stands[k], T.ROUTE_SAFE_ENEMY_DIST);', repl: 'mark(stands[k], T.ROUTE_SAFE_ENEMY_DIST - 1);',
    gates: [{ gate: 'harness', only: 'H-route-6', expect: 'saturated-blobs mode 0: moths within ROUTE_SAFE_ENEMY_DIST of an ascent cell' }] },
  { name: 'KNOCK_RUNS_ON', task: 'review 4', file: 'page', find: '    if (knocked && h.knock === 0) h.vx = 0;', repl: '',
    gates: [{ gate: 'harness', only: 'H-en-2', expect: 'the knockback ends at rest' }] },
  { name: 'HIT_KEEPS_CLING', task: 'review 4', file: 'page', find: 'h.lock = 0; h.dash = 0; h.sticky = 0; h.wall = 0; s.ev |= EV.HIT;', repl: 'h.lock = 0; h.dash = 0; s.ev |= EV.HIT;',
    gates: [{ gate: 'harness', only: 'H-en-2b', expect: 'never held sticky away from the vine' }] },
  { name: 'DEATH_AND_CLEAR', task: 'review 4', file: 'page', find: '      if (!s.immortal && h.iframes === 0 && h.dashI === 0 && !s.room.cleared && ', repl: '      if (!s.immortal && h.iframes === 0 && h.dashI === 0 && ',
    gates: [{ gate: 'harness', only: 'H-sim-21', expect: 'the clear wins' }] },
  { name: 'HINT_STAYS', task: 'review 4', file: 'page', find: "clearTimeout(el.sbHintT); el.sbHintT = setTimeout(function () { el.classList.remove('hint'); }, HINT_MS);", repl: '',
    gates: [{ gate: 'death', expect: 'under reduced motion the hint outline leaves' }] },
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
  { name: 'RESTART_REVEALS', task: 'T0.16', file: 'page', find: "ui.restart = function () { if (G.record) ui.startRoom(G.record, G.name, { level: G.level, noReveal: true }); };",
    repl: "ui.restart = function () { if (G.record) ui.startRoom(G.record, G.name, { level: G.level }); };",
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
  { name: 'ROCKER_AT_X0', task: 'T0.8b', file: 'page', find: '#rocker { position: absolute; left: var(--res); top: 0;', repl: '#rocker { position: absolute; left: 0; top: 0;',
    gates: [{ gate: 'layout', expect: '412x915: left zone is clear of the canvas and the reserved box' }] },
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
  { name: 'EXIT_HIGHEST_INDEX', task: 'T0.8b review', file: 'page', find: 'if (standableIn(level, lit[q]) && d[lit[q]] >= 0 && (lc < 0 || d[lit[q]] > d[lc])) lc = lit[q];',
    repl: 'if (standableIn(level, lit[q]) && d[lit[q]] >= 0 && (lc < 0 || d[lit[q]] >= d[lc])) lc = lit[q];',
    gates: [{ gate: 'harness', only: 'H-pipe-12', expect: "sample-room: the exit equals the test's own rule" }] },
  { name: 'PHASE_ZERO', task: 'T0.8b review', file: 'page', find: '  var PHASE = STEP_MS / 4;', repl: '  var PHASE = 0;',
    gates: [{ gate: 'play', expect: 'frame by frame the page ran the steps the accumulator owes' }] },
  { name: 'ROCKER_NO_ADOPT', task: 'T0.8b review', file: 'page', find: '      setRocker(rockerPtrs.length ? zoneOf(rockerX[rockerPtrs[0]]) : null);', repl: '      setRocker(null);',
    gates: [{ gate: 'play', expect: 'the first lifted, the pointer still down takes the rocker' }] },
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
  { name: 'SLICK_PAST_THE_FRAME', task: 'review 5', file: 'page', find: 'return x2 >= 0 && x2 < w && !stand[to + dir] && !solid[to + dir];', repl: 'return !stand[to + dir] && !solid[to + dir];',
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
  { name: 'CRAWLER_FALLS_OFF', task: 'T1.4', file: 'page', find: 'var x0 = a * CS, x1 = Math.max(x0, (b + 1) * CS - sz);', repl: 'var x0 = a * CS, x1 = Math.max(x0, (b + 2) * CS - sz);',
    gates: [{ gate: 'harness', only: 'H-en-6', expect: 'over 900 steps it spans' }] },
  { name: 'SPARK_HOPS_INTO_WALL', task: 'T1.4', file: 'page', find: 'if (env[q] !== here && standCell(lv, env[q])) cands.push(env[q]);', repl: 'if (env[q] !== here) cands.push(env[q]);',
    gates: [{ gate: 'harness', only: 'H-en-7', expect: 'every landing a standable cell' }] },
  { name: 'JELLY_THROUGH_CEILING', task: 'T1.4', file: 'page', find: 'while (up < T.JELLY_BOB_CELLS && !solidAt(lv, col, row - up - 1) && !platAt(lv, col, row - up - 1)) up++;', repl: 'while (up < T.JELLY_BOB_CELLS) up++;',
    gates: [{ gate: 'harness', only: 'H-en-8', expect: 'in an open column its extremes' }] },
  { name: 'ELITE_HP_SINGLE', task: 'T1.4', file: 'page', find: 'return elite ? hp * T.ELITE_HP_MULT : hp;', repl: 'return hp;',
    gates: [{ gate: 'harness', only: 'H-en-9', expect: 'elite has ELITE_HP_MULT times its HP' }] },
  { name: 'POCKET_ELITE_ROAMS', task: 'T1.4', file: 'page', find: '    if (pk) {\n      var r = pk.rect;', repl: '    if (false) {\n      var r = pk.rect;',
    gates: [{ gate: 'harness', only: 'H-en-9', expect: 'the pocket\'s elite sleeps' }] },
  { name: 'POCKET_ELITE_AWAKE', task: 'T1.4', file: 'page', find: 'stunned: el && pocketOf(level, e.idx) ? -1 : 0 };', repl: 'stunned: 0 };',
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
    gates: [{ gate: 'harness', only: 'H-sim-19', expect: 'without the choice word the replay stalls at the offer' }, { gate: 'loot', expect: '412: the offer opens on the ground and the hero holds still under it' }] },
  { name: 'CHOICE_VIA_SHELL', task: 'T1.6', file: 'page', find: "document.getElementById('pickA').addEventListener('click', function () { SB.input.choose(SB.sim.CHOICE.A); });", repl: "document.getElementById('pickA').addEventListener('click', function () { var st = SB.game.state; SB.sim.pickScroll(st, st.scrollsOffered[0]); });",
    gates: [{ gate: 'loot', expect: '412: the recorded script carries the CHOICE word' }] },
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
    gates: [{ gate: 'harness', only: 'H-share-1', expect: 'a paste of without its v1. prefix opens the same record' }] }
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
    : m.file === 'make' ? path.join(GAME, 'fixtures', 'make.html') : path.join(GAME, 'index.html');
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
    else if (g.gate === 'harness') cmd = [harness, '--page', page].concat(g.only ? ['--only', g.only] : [], isFixture ? ['--fixtures', fixCopy] : [], g.args || []);
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
