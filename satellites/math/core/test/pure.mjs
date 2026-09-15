#!/usr/bin/env node
/* CORE's pure half, asserted in Node against the shipped module.
 *
 *   node test/pure.mjs
 *
 * `pure.js` is imported straight from the folder the browser is served, so a law
 * here is a law about the file a child's Chromebook runs (plans/math/HANDOFF-CORE.md
 * 3.2). `satellites/math/package.json` says "type": "module", which is how Node
 * reads a runtime `.js` as an ES module (3.4).
 *
 * A count is a law, not today's number: every distribution below is asserted on
 * twenty seeds, never on one.
 */
const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };
const finish = () => {
  console.log('');
  if (fails.length) { console.log(fails.length + ' PURE FAILURE(S)'); process.exit(1); }
  console.log('PURE OK');
  process.exit(0);
};

let P = null;
try {
  P = await import('../pure.js');
} catch (e) {
  say(false, 'pure.js loads as an ES module (' + String(e && e.message || e).split('\n')[0] + ')');
  finish();
}

const SEEDS = Array.from({ length: 20 }, (_, i) => 1000 + i * 7919);

/* ---- rng ---- */
say(typeof P.rng === 'function', 'rng is exported');
{
  const a = P.rng(4242), b = P.rng(4242), c = P.rng(4243);
  let same = true, differ = false;
  for (let i = 0; i < 1000; i++) {
    const x = a(), y = b(), z = c();
    if (x !== y) same = false;
    if (x !== z) differ = true;
  }
  say(same, 'the same seed gives the same thousand draws');
  say(differ, 'and a different seed gives different ones');
}
{
  let worst = 0, outside = 0;
  for (const s of SEEDS) {
    const r = P.rng(s);
    let sum = 0;
    for (let i = 0; i < 10000; i++) {
      const v = r();
      if (!(v >= 0 && v < 1)) outside++;
      sum += v;
    }
    worst = Math.max(worst, Math.abs(sum / 10000 - 0.5));
  }
  say(outside === 0, 'every draw on twenty seeds is in [0, 1) (' + outside + ' outside)');
  say(worst < 0.02, 'and the mean of ten thousand draws is within 0.02 of a half on every seed (worst '
    + worst.toFixed(4) + ')');
}

/* ---- migrate ---- */
say(typeof P.migrate === 'function', 'migrate is exported');
{
  const SCHEMA = {
    v: 3,
    fresh: () => ({ v: 3, collect: [], adapt: { tier: 0 }, settings: { muted: true, reducedMotion: false } })
  };
  const garbage = [null, undefined, 42, 'x', [], [1, 2], true];
  const threw = [], wrong = [];
  for (const g of garbage) {
    try {
      const r = P.migrate(g, SCHEMA);
      if (r.v !== 3 || r.collect.length !== 0 || r.adapt.tier !== 0 || r.settings.muted !== true) wrong.push(JSON.stringify(g));
    } catch (e) { threw.push(JSON.stringify(g)); }
  }
  say(threw.length === 0, 'a garbage record never throws' + (threw.length ? ': ' + threw.join(', ') : ''));
  say(wrong.length === 0, 'and comes back as a fresh record' + (wrong.length ? ': ' + wrong.join(', ') : ''));

  const same = P.migrate({ v: 3, collect: ['arch1', 'arch2'], adapt: { tier: 4 }, settings: { muted: false }, later: 'kept' }, SCHEMA);
  say(same.collect.join() === 'arch1,arch2' && same.adapt.tier === 4, 'a record on the same version keeps its shelf and its tier');
  say(same.settings.muted === false && same.settings.reducedMotion === false,
    'and its settings, with a setting it never had filled from the defaults');
  say(same.later === 'kept', 'and a field this build does not know about rides along instead of being dropped');

  for (const [label, v] of [['an older', 1], ['a future', 9]]) {
    const r = P.migrate({ v, collect: ['arch1', 'arch2', 'arch3'], adapt: { tier: 7, streak: 3 }, settings: { muted: false } }, SCHEMA);
    say(r.v === 3 && r.collect.length === 3, label + ' version keeps every collectible (' + r.collect.length + ' of 3)');
    say(r.adapt.tier === 0 && r.adapt.streak === undefined, 'and ' + label.replace(/^an? /, 'the ') + ' adaptive state is discarded');
    say(r.settings.muted === false, 'and the mute the child chose is kept');
  }
  const broken = P.migrate({ v: 1, collect: 'not a list', adapt: 5 }, SCHEMA);
  say(Array.isArray(broken.collect) && broken.collect.length === 0, 'a mismatched record with a broken shelf gets an empty one, not a crash');
}

/* ---- parseConfig ---- */
say(typeof P.parseConfig === 'function', 'parseConfig is exported');
{
  const SCHEMA = {
    mode: { type: 'enum', values: ['judge', 'blank', 'relational'], default: 'blank' },
    standard: { type: 'bool', default: true },
    count: { type: 'int', min: 5, max: 40, default: 10 }
  };
  const TABLE = [
    ['', { mode: 'blank', standard: true, count: 10 }, 'nothing asked gives every default'],
    ['?mode=judge&standard=0&count=20', { mode: 'judge', standard: false, count: 20 }, 'every good value is taken'],
    ['mode=relational', { mode: 'relational', standard: true, count: 10 }, 'the leading ? is optional'],
    ['?mode=answer&count=41', { mode: 'blank', standard: true, count: 10 }, 'a value outside the schema falls back'],
    ['?count=4', { mode: 'blank', standard: true, count: 10 }, 'an int below its floor falls back'],
    ['?count=12.5&standard=yes', { mode: 'blank', standard: true, count: 10 }, 'a half number and a wrong bool fall back'],
    ['?standard=false&count=40', { mode: 'blank', standard: false, count: 40 }, 'false and the ceiling itself are taken'],
    ['?unknown=1&mode=judge', { mode: 'judge', standard: true, count: 10 }, 'an unknown key is ignored'],
    ['?mode=%E0%A4%A&count=%', { mode: 'blank', standard: true, count: 10 }, 'broken percent escapes fall back without throwing'],
    ['?mode=judge&mode=relational', { mode: 'relational', standard: true, count: 10 }, 'a repeated key takes its last value']
  ];
  for (const [q, want, label] of TABLE) {
    let got, err = '';
    try { got = P.parseConfig(q, SCHEMA); } catch (e) { err = String(e.message || e); }
    say(!err && JSON.stringify(got) === JSON.stringify(want), label + ' (' + JSON.stringify(q) + (err ? ' threw ' + err : got && JSON.stringify(got) !== JSON.stringify(want) ? ' gave ' + JSON.stringify(got) : '') + ')');
  }
}

/* ---- P2: adapt.tier (2.3) ---- */
say(typeof P.adaptTier === 'function', 'adaptTier is exported');
if (typeof P.adaptTier === 'function') {
  const CFG = { tiers: 5, up: 3, down: 2, floor: 0 };
  let below = 0, above = 0;
  for (const s of SEEDS) {
    const r = P.rng(s), n = 20 + r.int(200), h = [];
    for (let i = 0; i < n; i++) h.push(r() < 0.15);
    const t = P.adaptTier(h, CFG);
    if (t < CFG.floor) below++;
    if (t > CFG.tiers - 1) above++;
    if (P.adaptTier(Array(n).fill(false), CFG) !== CFG.floor) below++;
  }
  say(below === 0, 'no run of failures on twenty seeds ever routes a child below the floor (' + below + ')');
  say(P.adaptTier(Array(60).fill(true), CFG) === CFG.tiers - 1 && above === 0, 'and a run of successes stops at the top tier');
  say(P.adaptTier([true, true], CFG) === 0 && P.adaptTier([true, true, true], CFG) === 1,
    'a tier moves up only on its streak (two right stays, three right moves)');
  say(P.adaptTier([true, false, true, false, true, false, true, false], CFG) === 0, 'and a broken streak moves nothing');
  say(P.adaptTier([true, true, true, true, true, true, false, false], CFG) === 1, 'and two wrong in a row step down one');
}

/* ---- P2: adapt.staircase, two down one up (2.3) ---- */
say(typeof P.adaptStaircase === 'function', 'adaptStaircase is exported');
if (typeof P.adaptStaircase === 'function') {
  /* a responder with a known psychometric curve: the chance of a right answer rises
     with the level (a longer flash is easier). Two down one up has to settle where
     that chance is about 70.7 percent, on every seed. */
  const CFG = { start: 600, step: 25, min: 50, max: 1500, down: 2, up: 1 };
  const L50 = 400, SLOPE = 60;
  const pRight = lv => 1 / (1 + Math.exp(-(lv - L50) / SLOPE));
  let worst = 0, outOfRange = 0;
  for (const s of SEEDS) {
    const r = P.rng(s), h = [];
    let sum = 0, n = 0;
    for (let i = 0; i < 400; i++) {
      const lv = P.adaptStaircase(h, CFG).level;
      if (lv < CFG.min || lv > CFG.max) outOfRange++;
      h.push(r() < pRight(lv));
      if (i >= 200) { sum += pRight(lv); n++; }
    }
    worst = Math.max(worst, Math.abs(sum / n - 0.707));
  }
  say(outOfRange === 0, 'the staircase never leaves its range on twenty seeds (' + outOfRange + ')');
  /* ⛔ the responder above never drives the level near either end, so that law alone could not see a missing
     clamp; a child who is always right and one who is always wrong can */
  const allRight = P.adaptStaircase(Array(200).fill(true), CFG).level, allWrong = P.adaptStaircase(Array(200).fill(false), CFG).level;
  say(allRight === CFG.min && allWrong === CFG.max, 'a child always right stops at the hardest setting and one always wrong at the easiest ('
    + allRight + ' and ' + allWrong + ')');
  say(worst < 0.08, 'and settles where the responder is right about 70.7 percent of the time on every seed (worst off by '
    + worst.toFixed(3) + ')');
}

/* ---- P2: the line's geometry, N1 (2.4) ---- */
say(typeof P.lineGeometry === 'function', 'lineGeometry is exported');
if (typeof P.lineGeometry === 'function') {
  let widthSdMin = 1, offsetSdMin = 1, outside = 0, repeats = 0, inverseWorst = 0;
  for (const s of SEEDS) {
    const r = P.rng(s), W = [], O = [];
    let prev = null;
    for (let i = 0; i < 100; i++) {
      const g = P.lineGeometry(r);
      if (!(g.widthPct >= 0.72 && g.widthPct <= 0.94 && g.offsetPct >= 0 && g.offsetPct <= 0.08
        && g.widthPct + g.offsetPct <= 1)) outside++;
      if (prev && prev.widthPct === g.widthPct && prev.offsetPct === g.offsetPct) repeats++;
      W.push(g.widthPct); O.push(g.offsetPct); prev = g;
      for (const x of [0, 0.25, 0.5, 0.999, 1]) {
        const px = P.fromNormalized(x, g, 1000);
        inverseWorst = Math.max(inverseWorst, Math.abs(P.toNormalized(px, g, 1000) - x));
      }
    }
    const sd = a => { const m = a.reduce((p, c) => p + c, 0) / a.length; return Math.sqrt(a.reduce((p, c) => p + (c - m) * (c - m), 0) / a.length); };
    widthSdMin = Math.min(widthSdMin, sd(W)); offsetSdMin = Math.min(offsetSdMin, sd(O));
  }
  say(outside === 0, 'every line is 72 to 94 percent of its container, offset up to 8 percent, and inside it (' + outside + ' outside)');
  say(widthSdMin > 0.04 && offsetSdMin > 0.015 && repeats === 0,
    'and the width and the offset vary every round, 100 rounds on twenty seeds (smallest spread '
    + widthSdMin.toFixed(3) + ' and ' + offsetSdMin.toFixed(3) + ', ' + repeats + ' repeats)');
  say(inverseWorst < 1e-9, 'a point on the line and its pixel are each other\'s inverse (worst ' + inverseWorst + ')');
}

/* ---- P2: the flash picks the frame nearest its deadline (S1, 3.5) ---- */
say(typeof P.hideNow === 'function', 'hideNow is exported');
if (typeof P.hideNow === 'function') {
  /* a presentation shown on one frame and hidden on a later one: for any frame
     interval, the shown time must come within half a frame of the target, and
     never cut a frame early. A 400 ms flash on a slow Chromebook that shows for
     900 ms turns a subitizing game into a counting game. */
  let worstOver = 0;
  const rows = [];
  for (const interval of [16.7, 33.3, 200]) {
    let worst = 0;
    for (const s of SEEDS) {
      const r = P.rng(s);
      for (const target of [100, 400, 750, 1200]) {
        let t = r() * interval, shownAt = t, hiddenAt = null;
        while (hiddenAt === null && t < shownAt + target + 4 * interval) {
          t += interval * (0.9 + 0.2 * r());
          if (P.hideNow(t, shownAt + target, interval)) hiddenAt = t;
        }
        const err = hiddenAt === null ? 1e9 : Math.abs((hiddenAt - shownAt) - target);
        worst = Math.max(worst, err);
      }
    }
    rows.push(interval + ' ms frames: worst ' + worst.toFixed(1) + ' ms');
    worstOver = Math.max(worstOver, worst - interval * 0.6);
  }
  say(worstOver <= 0, 'a flash hides on the frame nearest its deadline at every frame rate (' + rows.join('; ') + ')');
}

/* ---- P2: collect, one per run and never a duplicate (2.11) ---- */
say(typeof P.collectOnce === 'function', 'collectOnce is exported');
if (typeof P.collectOnce === 'function') {
  const shelf0 = ['arch1'];
  const shelf1 = P.collectOnce(shelf0, 'arch2');
  const shelf2 = P.collectOnce(shelf1, 'arch2');
  say(shelf1.join() === 'arch1,arch2' && shelf2.join() === 'arch1,arch2', 'a collectible lands once and a second award of it adds nothing');
  say(shelf0.join() === 'arch1', 'and the shelf handed in is not changed underneath its owner');
}

/* ---- P2: session, run length and the hard cap (2.10) ---- */
/* Time is handed in, never read: `sessionStep(state, event, config)` with events
   { type: 'start' | 'round' | 'tick', at } in milliseconds. When a cap fires the
   session ENDS; it does not offer one more. */
say(typeof P.sessionStep === 'function', 'sessionStep is exported');
if (typeof P.sessionStep === 'function') {
  const CFG = { runLength: 5, capMs: 300000 };
  const play = events => events.reduce((st, e) => P.sessionStep(st, e, CFG), null);
  const rounds = n => Array.from({ length: n }, (_, i) => ({ type: 'round', at: 1000 + i * 1000 }));

  const done = play([{ type: 'start', at: 0 }].concat(rounds(5)));
  say(done.ended && done.reason === 'done' && done.rounds === 5, 'a session ends when its run length is played (' + JSON.stringify(done) + ')');
  const four = play([{ type: 'start', at: 0 }].concat(rounds(4)));
  say(!four.ended && four.rounds === 4, 'and not a round before');

  const capped = play([{ type: 'start', at: 0 }, { type: 'round', at: 1000 }, { type: 'tick', at: 300000 }]);
  say(capped.ended && capped.reason === 'cap' && capped.rounds === 1, 'the hard cap ends a session in the middle, whatever the rounds (' + JSON.stringify(capped) + ')');
  const justUnder = play([{ type: 'start', at: 0 }, { type: 'tick', at: 299999 }]);
  say(!justUnder.ended, 'and a millisecond under the cap does not');

  /* ⛔ the first version of this law fed late events only to a session the CAP had ended, and every late event past
     the cap simply ended it again: with the guard after the end deleted it stayed green. It now feeds a session that
     ended by playing its rounds, and holds the moment of the end still on both. */
  const late = [{ type: 'round', at: 301000 }, { type: 'start', at: 302000 }, { type: 'tick', at: 900000 }];
  const afterCap = late.reduce((st, e) => P.sessionStep(st, e, CFG), capped);
  say(afterCap.ended && afterCap.reason === 'cap' && afterCap.rounds === 1 && afterCap.endedAt === capped.endedAt,
    'and nothing after the cap revives it, counts a round or moves its end (' + JSON.stringify(afterCap) + ')');
  const afterDone = [{ type: 'round', at: 6000 }, { type: 'start', at: 7000 }, { type: 'round', at: 8000 }]
    .reduce((st, e) => P.sessionStep(st, e, CFG), done);
  say(afterDone.ended && afterDone.reason === 'done' && afterDone.rounds === 5 && afterDone.endedAt === done.endedAt,
    'and a session that played its rounds stays played: no round six, no new end (' + JSON.stringify(afterDone) + ')');

  let worst = 0;
  for (const s of SEEDS) {
    const r = P.rng(s);
    let st = P.sessionStep(null, { type: 'start', at: 0 }, CFG), t = 0;
    for (let i = 0; i < 40 && !st.ended; i++) { t += r.int(120000); st = P.sessionStep(st, { type: r() < 0.5 ? 'round' : 'tick', at: t }, CFG); }
    if (st.rounds > CFG.runLength) worst = Math.max(worst, st.rounds);
    if (st.ended && st.reason === 'cap' && st.endedAt < CFG.capMs) worst = Math.max(worst, 99);
  }
  say(worst === 0, 'on twenty random sessions no run passes its length and no cap fires early (' + worst + ')');
}

/* ---- P3: adapt.classify, patterns and not scores (2.3; GAUGE sections 1 and 4) ---- */
/* The items are GAUGE's kinds, drawn as what each rule would answer: `a`, `b` or `same`.
     separatesL: truth and S agree, L differs        (0.125 vs 0.3)
     separatesS: truth and L agree, S differs        (0.3 vs 0.496)
     apparent:   L and truth agree, S differs        (5.736 vs 5.62, where a longer is larger child is right)
     bothFail:   truth is `same`, L and S differ     (0.5 vs 0.50)
     plain:      every rule agrees                   (0.7 vs 0.2, which tells nothing)
   A match is counted over the DISCRIMINATING items only, the ones where the rules do not all agree, or everyone
   would match the truth on the plain items. Every law runs 200 simulated children, each on its own seed. */
say(typeof P.adaptClassify === 'function', 'adaptClassify is exported');
if (typeof P.adaptClassify === 'function') {
  const KINDS = {
    separatesL: { truth: 'b', L: 'a', S: 'b' },
    separatesS: { truth: 'b', L: 'b', S: 'a' },
    apparent: { truth: 'a', L: 'a', S: 'b' },
    bothFail: { truth: 'same', L: 'b', S: 'a' },
    plain: { truth: 'a', L: 'a', S: 'a' }
  };
  const set = counts => Object.keys(counts).flatMap(k => Array(counts[k]).fill(KINDS[k]));
  const WELL = set({ separatesL: 4, separatesS: 4, apparent: 4, bothFail: 2, plain: 6 });
  const POOR = set({ separatesL: 1, separatesS: 1, apparent: 10, plain: 8 });
  const RULES = { L: item => item.L, S: item => item.S, truth: item => item.truth };
  const CFG = { rules: RULES, minItems: 12, minDiscriminating: 6, threshold: 0.8 };
  const OTHER = ['a', 'b', 'same'];
  /* a responder runs its rule and slips to a random other answer with probability `slip` */
  const answer = (rule, slip) => (item, r) => {
    if (rule === 'guess') return OTHER[r.int(3)];
    return r() < slip ? OTHER[r.int(3)] : item[rule];
  };
  const run = (items, who, sims = 200) => {
    const codes = {}, above = {};
    let scoreMin = 1;
    for (let s = 1; s <= sims; s++) {
      const r = P.rng(9000 + s), responses = items.map(it => ({ item: it, answer: who(it, r) }));
      const out = P.adaptClassify(responses, CFG);
      const key = out.enough ? String(out.code) : 'not enough';
      codes[key] = (codes[key] || 0) + 1;
      const ak = out.above.join('+') || 'none';
      above[ak] = (above[ak] || 0) + 1;
      scoreMin = Math.min(scoreMin, responses.filter(x => x.answer === x.item.truth).length / items.length);
    }
    return { codes, above, scoreMin };
  };

  const L = run(WELL, answer('L', 0.05)), S = run(WELL, answer('S', 0.05)), T = run(WELL, answer('truth', 0.05));
  say((L.codes.L || 0) >= 190, 'a longer is larger child is coded L (' + JSON.stringify(L.codes) + ')');
  say((S.codes.S || 0) >= 190, 'a shorter is larger child is coded S (' + JSON.stringify(S.codes) + ')');
  say((T.codes.truth || 0) >= 190, 'a child who knows the truth is coded truth (' + JSON.stringify(T.codes) + ')');

  const noisy = run(WELL, answer('L', 0.15));
  say((noisy.codes.L || 0) >= 160 && !noisy.codes.S && !noisy.codes.truth,
    'a noisy longer is larger child is coded L most of the time and never S or truth (' + JSON.stringify(noisy.codes) + ')');

  const guess = run(WELL, answer('guess', 0));
  say((guess.codes.null || 0) >= 190 && (guess.above.none || 0) >= 190,
    'a guesser comes back unclassified, with no rule above the threshold (' + JSON.stringify(guess.codes) + ')');

  const apparent = run(POOR, answer('L', 0));
  say(apparent.scoreMin >= 0.85, 'on a poorly separating set a longer is larger child scores 85 percent or more (lowest '
    + Math.round(apparent.scoreMin * 100) + ')');
  /* ⛔ and no code at all: with only "never coded truth" asked, a classifier that simply named the better of the two
     rules above (L) would pass, and GAUGE would route an apparent expert as a plain longer is larger child */
  say((apparent.above['L+truth'] || 0) + (apparent.above['truth+L'] || 0) === 200 && (apparent.codes.null || 0) === 200,
    'and is given no code: both truth and L clear the threshold, which GAUGE reads as an apparent expert ('
    + JSON.stringify(apparent.above) + ', ' + JSON.stringify(apparent.codes) + ')');

  const few = P.adaptClassify(WELL.slice(0, 11).map(it => ({ item: it, answer: it.L })), CFG);
  say(!few.enough && few.code === null, 'eleven items are not enough to say anything (' + JSON.stringify(few) + ')');
  const flat = P.adaptClassify(set({ plain: 12, separatesL: 2, separatesS: 3 }).map(it => ({ item: it, answer: it.L })), CFG);
  say(!flat.enough && flat.code === null, 'and neither are five discriminating items among seventeen (' + JSON.stringify(flat) + ')');
}

/* ---- P3: buildQuery, the other half of a teacher's link (2.9) ---- */
/* A link is worth what the game reads back from it: buildQuery(values, schema) and
   parseConfig(query, schema) must be each other's inverse on every valid choice. */
say(typeof P.buildQuery === 'function', 'buildQuery is exported');
if (typeof P.buildQuery === 'function') {
  const SCHEMA = {
    mode: { type: 'enum', values: ['judge', 'blank', 'relational'], default: 'blank' },
    standard: { type: 'bool', default: true },
    count: { type: 'int', min: 5, max: 40, default: 10 }
  };
  const bad = [];
  let n = 0;
  for (const mode of SCHEMA.mode.values) for (const standard of [true, false]) for (const count of [5, 6, 10, 39, 40]) {
    const v = { mode, standard, count }, q = P.buildQuery(v, SCHEMA), back = P.parseConfig(q, SCHEMA);
    n++;
    if (JSON.stringify(back) !== JSON.stringify(v)) bad.push(JSON.stringify(v) + ' -> ' + q + ' -> ' + JSON.stringify(back));
  }
  say(bad.length === 0, 'every valid choice round trips through its link (' + n + ' choices' + (bad.length ? ': ' + bad.slice(0, 2).join(' | ') : '') + ')');
  say(P.buildQuery({ mode: 'blank', standard: true, count: 10 }, SCHEMA) === '', 'a link of nothing but defaults is the bare game');
  const q2 = P.buildQuery({ count: 20, mode: 'judge', standard: true }, SCHEMA);
  say(q2 === '?mode=judge&count=20', 'a link carries only what differs from the defaults, in the schema\'s order (' + q2 + ')');
  const q3 = P.buildQuery({ mode: 'answer', standard: 'yes', count: 99, extra: 1 }, SCHEMA);
  say(q3 === '', 'and never carries a value its schema would refuse or a key it does not know (' + JSON.stringify(q3) + ')');
  const ODD = { mode: { type: 'enum', values: ['a b&c', 'x'], default: 'x' } };
  const q4 = P.buildQuery({ mode: 'a b&c' }, ODD);
  say(P.parseConfig(q4, ODD).mode === 'a b&c', 'and a value with a space or an ampersand survives the trip (' + q4 + ')');
}

finish();
