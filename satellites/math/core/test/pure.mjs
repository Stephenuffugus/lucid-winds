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

finish();
