/* The one command that says whether Airworthy is shippable.
 *
 *   node tools/check.js            everything
 *   node tools/check.js --fast     skips the slow gates and SAYS so
 *
 * Nothing commits without this printing ALL GATES PASSED. Each gate is a file
 * that can be run on its own, and each is written so that it CAN fail; a gate
 * nobody has watched fail is decoration (HANDOFF-AIRWORTHY section 5).
 *
 * Shape copied from satellites/keepsies/tools/check.js, including its two scars:
 * fast mode SKIPS a slow gate and never shrinks it, and a failure prints the
 * FAILING lines rather than the tail, because the tail of a gate that died on
 * assertion three is twenty five green ones.
 */
/* CommonJS on purpose. This file is named check.js because the plan and every
   morning report name it that, and an ESM .js with no package.json makes Node
   print a MODULE_TYPELESS warning above the gate table on every single run.

   ⛔ ONE SOURCE OF TRUTH FOR THE PLANE. derive(foldSpec) returns the physics
   and the tunnel, the field, the readouts and the namer all read that one
   object, so the tunnel cannot lie about the field. The sim gate carries the
   phugoid, which is the product: if it goes red the model is wrong, not the
   test. */
const { execFileSync } = require('node:child_process');
const { join } = require('node:path');

const ROOT = join(__dirname, '..');
const FAST = process.argv.includes('--fast');

const GATES = [
  { name: 'sim', cmd: ['sim.js', '--test'], need: 'AIRWORTHY TEST OK' },
  { name: 'lint', cmd: ['tools/lint.mjs'], need: 'LINT OK' }
];
const BROWSER_GATES = [
  { name: 'throw', cmd: ['test/throw.mjs'], need: 'THROW OK' },
  { name: 'layout', cmd: ['test/layout.mjs'], need: 'LAYOUT OK', slow: true }
];

const results = [];
try {
  require.resolve('puppeteer', { paths: ['/workspaces/lucid-winds/node_modules'] });
  for (const g of BROWSER_GATES) GATES.push(g);
} catch (e) {
  if (BROWSER_GATES.length) {
    console.log('note: puppeteer not found, skipping the browser gates ('
      + BROWSER_GATES.map(g => g.name).join(', ') + ')\n');
  }
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
    : 'ALL GATES PASSED'));
process.exit(bad.length ? 1 : 0);
