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

finish();
