/* The one command that says whether Marrowdeep is shippable.
 *
 *   node tools/check.js            everything
 *   node tools/check.js --fast     skips the slow gate and SAYS so
 *
 * Nothing commits without this printing ALL GATES PASSED. Each gate is a file
 * that can be run on its own, and each is written so that it CAN fail; a gate
 * nobody has watched fail is decoration (HANDOFF-MARROWDEEP section 5).
 *
 * Shape copied from satellites/fathom/tools/check.js, including its two scars:
 * fast mode SKIPS a slow gate and never shrinks it, and a failure prints the
 * FAILING lines rather than the tail, because the tail of a gate that died on
 * assertion three is twenty five green ones.
 */
/* CommonJS on purpose. This file is named check.js because the plan and every
   morning report name it that, and an ESM .js with no package.json makes Node
   print a MODULE_TYPELESS warning above the gate table on every single run. */
const { execFileSync } = require('node:child_process');
const { join } = require('node:path');

const ROOT = join(__dirname, '..');
const FAST = process.argv.includes('--fast');

const GATES = [
  { name: 'lint',  cmd: ['tools/lint.mjs'],          need: 'LINT OK' },
  { name: 'data',  cmd: ['tools/data.mjs', '--check'], need: 'DATA OK' },
  /* ⛔ `table` is the slow one and it is SKIPPED whole in fast mode, never
     shrunk. It measures the R1.4 master table through the real roll(), 200,000
     rolls a row, and compares each row against the closed form to two decimal
     places: d4 against TN 3 reads 50.1 where the arithmetic says 50.2. Drop the
     sample to make it quick and that comparison becomes noise, so the gate goes
     green on a broken table, which is worse than not running it. */
  { name: 'table', cmd: ['sim.js', '--table'],       need: 'TABLE OK', slow: true },
  { name: 'test',  cmd: ['sim.js', '--test'],        need: 'MD TEST OK' }
];

/* ---------------------------------------------------------------------------
   THE LATER GATES. Each phase adds its own here; they are written out rather
   than left to memory so the next builder adds a line instead of inventing a
   name. Uncomment as each one lands, and watch it fail once before it counts.

   { name: 'content', cmd: ['sim.js', '--data'],   need: 'DATA OK' }
       The banks read through the ENGINE: it compiles every Trait, unique,
       Origin, Calling and affix, generates a thousand relic names and a
       thousand character names and applies the copy law to what comes OUT of
       the generator, which no grep can reach. ⛔ It passes today (1008 bank
       strings, 44 records, 2000 generated names, 8 card templates), and it is
       parked here rather than switched on because the P0 gate list is the four
       above. Turning it on is this one line. Note the name: `data` above is
       tools/data.mjs --check, which asks whether the inlined block still equals
       data/*.json; this asks whether the content MEANS anything. Both print
       DATA OK, so they get different gate names.
   { name: 'balance', cmd: ['sim.js', '--balance=200'], need: 'BALANCE OK', slow: true }
   { name: 'depths',  cmd: ['sim.js', '--depths'],      need: 'DEPTHS OK', slow: true }
       P3. Both fork workers over a grid; both are slow on purpose and both go
       in the slow list rather than being sampled down.

   And in BROWSER_GATES, in the order the phases build them:
   { name: 'play',   cmd: ['test/play.mjs'],   need: 'PLAY OK' }          P1
   { name: 'layout', cmd: ['test/layout.mjs'], need: 'LAYOUT OK' }        P1
       ⛔ Layout carries the measured half of the 0.7 rem law (lint only greps
       the sizes that are written down), the 120 by 120 music chip seat, and the
       three widths 412, 375 and 320.
   { name: 'save',   cmd: ['test/save.mjs'],   need: 'SAVE OK' }          P2
   { name: 'audio',  cmd: ['test/audio.mjs'],  need: 'AUDIO OK' }         P4
       ⛔ THE EAR GATE. It renders the loudest minute through the game's own
       voices into an OfflineAudioContext and measures peak, rms and the share
       above 3 kHz. Three games in this fleet shipped clipped with green gates
       on Sep 07 because a fresh GainNode's gain is ONE.
   --------------------------------------------------------------------------- */

/* Browser gates drive the real page in a real browser with real pointer events
   and need puppeteer. They are SKIPPED with a note when the browser is absent,
   never failed: a gate that fails for want of a dependency teaches you to
   ignore gates. They are also the ones that flake under contention on a two
   core box, so a failure here is rerun ALONE, twice, before it is believed.
   ⛔ One browser at a time is the law on this machine, and it belongs OUTSIDE
   this file: run `timeout 2700 flock -w 1800 /tmp/sws-gate.lock node
   tools/check.js`. This runner never takes that lock itself, because a tool
   that flocks inside, wrapped in a flock of its own, deadlocks and sits there
   until the timeout (Sep 08, sweep-twelve.mjs). The gates below run one after
   another regardless, so a single check.js never opens two browsers. */
const BROWSER_GATES = [
  { name: 'boot', cmd: ['test/boot.mjs'], need: 'BOOT OK' },
  /* the seam: the page's answer must equal the sim's for the same seed, which is
     the only thing that keeps one implementation of the rules honest */
  { name: 'play', cmd: ['test/play.mjs'], need: 'PLAY OK', slow: true },
  /* every control on every screen at three widths, and the chip's band */
  { name: 'layout', cmd: ['test/layout.mjs'], need: 'LAYOUT OK', slow: true }
];

const results = [];
/* Why the browser gates might not run, in words, every time. SWS_NO_BROWSER=1
   leaves them out ON PURPOSE (continuous integration: no Chrome, no display).
   It is a SEPARATE branch from "puppeteer is missing" so a run that skipped
   them says WHICH reason, and so CI can never start a browser by accident on a
   runner that happens to carry one at the path below. And the summary line at
   the bottom of this file then refuses to say ALL GATES PASSED, because a green
   that overstates what ran is the oldest lie in this repo. */
const NO_BROWSER = process.env.SWS_NO_BROWSER === '1';
let browserWhy = '';
if (NO_BROWSER) {
  browserWhy = 'SWS_NO_BROWSER=1, the browser gates are not run here';
} else {
  try {
    require.resolve('puppeteer', { paths: ['/workspaces/lucid-winds/node_modules'] });
    for (const g of BROWSER_GATES) GATES.push(g);
  } catch (e) {
    browserWhy = 'puppeteer not found, skipping the browser gates';
  }
}
if (browserWhy && BROWSER_GATES.length) {
  console.log('note: ' + browserWhy + ' ('
    + BROWSER_GATES.map(g => g.name).join(', ') + ')\n');
}

const skipped = [];
for (const g of GATES) {
  if (FAST && g.slow) { skipped.push(g.name); continue; }
  process.stdout.write(g.name.padEnd(16));
  const t0 = Date.now();
  let out = '', code = 0;
  try {
    /* stderr is CAPTURED, not inherited. A tool that reports on stderr used to
       spill its whole run into the middle of this table and the pass line
       landed on the last row of it. */
    const r = execFileSync('node', g.cmd, {
      cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: Object.assign({}, process.env, { NODE_PATH: '/workspaces/lucid-winds/node_modules' })
    });
    out = r;
  } catch (e) {
    out = (e.stdout || '') + (e.stderr || '');
    code = e.status === undefined ? 1 : e.status;
  }
  const pass = code === 0 && out.indexOf(g.need) >= 0;
  console.log((pass ? 'pass' : 'FAIL') + '  ' + ((Date.now() - t0) / 1000).toFixed(0) + 's');
  results.push({ g, pass, out });
}

const bad = results.filter(r => !r.pass);
if (bad.length) {
  console.log('\n' + '='.repeat(64));
  for (const r of bad) {
    console.log('\n--- ' + r.g.name + ' (wanted: ' + r.g.need + ') ---');
    const lines = r.out.split('\n');
    const shown = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].indexOf('FAIL') >= 0 || /Error|error:/.test(lines[i])) {
        for (let k = Math.max(0, i - 1); k <= Math.min(lines.length - 1, i + 1); k++) {
          if (shown.indexOf(lines[k]) < 0) shown.push(lines[k]);
        }
      }
    }
    console.log(shown.length ? shown.join('\n') : lines.slice(-26).join('\n'));
    if (shown.length) console.log('\n(tail)\n' + lines.slice(-6).join('\n'));
  }
}
if (skipped.length) {
  console.log('\nSKIPPED in fast mode, because a shrunken sample makes these lie: '
    + skipped.join(', ') + '.\nRun `node tools/check.js` with no flag before calling anything a pass.');
}
console.log('\n' + (bad.length ? bad.length + ' GATE' + (bad.length > 1 ? 'S' : '') + ' FAILED'
  : skipped.length ? 'THE GATES THAT CAN RUN FAST PASSED'
    : browserWhy ? 'THE GATES THAT NEED NO BROWSER PASSED'
      : 'ALL GATES PASSED'));
process.exit(bad.length ? 1 : 0);
