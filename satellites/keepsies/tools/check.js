/* The one command that says whether Keepsies is shippable.
 *
 *   node tools/check.js            everything, at gate sample sizes
 *   node tools/check.js --fast     skips the sample sensitive gates and SAYS so
 *
 * Nothing commits without this printing ALL GATES PASSED. Each gate is a separate
 * file that can be run on its own, and each of them is written so that it can
 * FAIL; a gate nobody has watched fail is decoration (HANDOFF-KEEPSIES 0.5).
 *
 * Shape copied from satellites/ripcord/tools/check.js, including its scar:
 * fast mode SKIPS a sample sensitive gate, it never shrinks it, because a gate
 * that reports a failure on passing code teaches you to ignore the output.
 */
const { execFileSync } = require('child_process');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const FAST = process.argv.includes('--fast');

const GATES = [
  { name: 'harness', cmd: ['sim/harness.js', '--scenario=all'], need: 'SIM OK' }
];

/* Browser gates drive the real page in a real browser and need puppeteer.
   They are SKIPPED with a note when the browser is absent, never failed:
   a gate that fails for want of a dependency teaches you to ignore gates. */
const BROWSER_GATES = [];

const results = [];
let browserNote = '';
try {
  require.resolve('puppeteer', { paths: ['/workspaces/lucid-winds/node_modules'] });
  for (const g of BROWSER_GATES) GATES.push(g);
} catch (e) {
  browserNote = 'note: puppeteer not found, skipping the browser gates ('
    + BROWSER_GATES.map(g => g.name).join(', ') + ')';
  if (BROWSER_GATES.length) console.log(browserNote + '\n');
}

const skipped = [];
for (const g of GATES) {
  if (FAST && g.slow) { skipped.push(g.name); continue; }
  process.stdout.write(g.name.padEnd(16));
  const t0 = Date.now();
  let out = '', code = 0;
  try {
    out = execFileSync('node', g.cmd, {
      cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
      env: Object.assign({}, process.env, { NODE_PATH: '/workspaces/lucid-winds/node_modules' })
    });
  } catch (e) {
    out = (e.stdout || '') + (e.stderr || '');
    code = e.status === undefined ? 1 : e.status;
  }
  const pass = code === 0 && out.indexOf(g.need) >= 0;
  const secs = ((Date.now() - t0) / 1000).toFixed(0);
  console.log((pass ? 'pass' : 'FAIL') + '  ' + secs + 's');
  results.push({ g, pass, out });
}

const bad = results.filter(r => !r.pass);
if (bad.length) {
  console.log('\n' + '='.repeat(64));
  for (const r of bad) {
    console.log('\n--- ' + r.g.name + ' (wanted: ' + r.g.need + ') ---');
    console.log(r.out.split('\n').slice(-26).join('\n'));
  }
}
if (skipped.length)
  console.log('\nSKIPPED in fast mode, because a shrunken sample makes these lie: '
    + skipped.join(', ') + '.\nRun `node tools/check.js` with no flag before calling anything a pass.');
console.log('\n' + (bad.length ? bad.length + ' GATE' + (bad.length > 1 ? 'S' : '') + ' FAILED'
  : skipped.length ? 'THE GATES THAT CAN RUN FAST PASSED'
    : 'ALL GATES PASSED'));
process.exit(bad.length ? 1 : 0);
