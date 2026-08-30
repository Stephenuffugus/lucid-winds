/* The one command that says whether Ripcord is shippable.
 *
 *   node tools/check.js            everything, at gate sample sizes
 *   node tools/check.js --fast     smaller samples, for iterating
 *
 * Nothing merges without this printing ALL GATES PASSED. Each gate is a separate
 * file that can be run on its own, and each of them is written so that it can
 * FAIL; a gate nobody has watched fail is decoration.
 */
const { execFileSync } = require('child_process');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const FAST = process.argv.includes('--fast');

/* ⛔ FAST MODE SKIPS THE SAMPLE SENSITIVE GATES; IT DOES NOT SHRINK THEM.
 *
 * Three of these compare a measured number against a threshold near the noise
 * floor, and all three were being run at reduced samples in fast mode. All three
 * reported FAIL on code that passes: the balance harness on the mirror band, the
 * rig test on its round for round diff, and the part audit on a ceiling, which
 * is a maximum over ten candidates and is biased upward when the sample shrinks.
 *
 * A gate that reports a failure on passing code is worse than no gate, because
 * it teaches you to ignore the output. So fast mode now runs everything it can
 * run honestly and SAYS what it skipped, instead of guessing at three answers
 * and getting them wrong. The full run is about five minutes and is the only
 * thing that may be called a pass.
 */
const GATES = [
  { name: 'bundle',        cmd: ['tools/bundle.js'],   need: 'index.html' },
  { name: 'balance',       cmd: ['tools/harness2.js', '300'],
    need: 'ALL ACCEPTANCE TARGETS MET', slow: true },
  { name: 'determinism',   cmd: ['test/determinism.js'], need: 'DETERMINISM OK' },
  { name: 'rigs',          cmd: ['test/rigtest.js', '40'], need: 'RIGTEST OK', slow: true },
  { name: 'modes',         cmd: ['test/modetest.js', FAST ? '12' : '30'], need: 'MODETEST OK' },
  /* ⛔ NO SAMPLE SIZE ARGUMENTS. This used to pass 8 for the ceiling sample where
     the auditor's own default is 12, and a ceiling is a maximum over ten
     candidates, so a smaller sample biases it UPWARD and reports a wider spread.
     The runner therefore failed the audit at 32.8 while running the audit by
     hand passed it at 30.2, on the same unchanged catalogue. That is the third
     time in this project two tools disagreed because they were measuring at
     different sample sizes, and it is the last: the gate runs the tool exactly
     as the tool runs itself. Fast mode saves its time elsewhere. */
  { name: 'parts',         cmd: ['tools/partaudit.js'], need: 'PART AUDIT OK', slow: true },
  { name: 'ladder',        cmd: ['tools/ladder.js'],   need: 'LADDER OK' },
  { name: 'bosses',        cmd: ['test/bosstest.js', FAST ? '60' : '140'], need: 'BOSSTEST OK' }
];

/* The playthrough drives the real built game in a real browser and needs
   puppeteer on NODE_PATH, so it is listed separately and skipped rather than
   failed when the browser is not there. A gate that fails for want of a
   dependency teaches you to ignore gates. */
const BROWSER_GATE = { name: 'playthrough', cmd: ['test/playthrough.mjs'], need: 'PLAYTHROUGH OK' };

const results = [];
try {
  require.resolve('puppeteer', { paths: ['/workspaces/lucid-winds/node_modules'] });
  GATES.push(BROWSER_GATE);
} catch (e) {
  console.log('note: puppeteer not found, skipping the browser playthrough\n');
}
const skipped = [];
for (const g of GATES) {
  if (FAST && g.slow) { skipped.push(g.name); continue; }
  process.stdout.write(g.name.padEnd(14));
  const t0 = Date.now();
  let out = '', code = 0;
  try {
    out = execFileSync('node', g.cmd, { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
      env: Object.assign({}, process.env, { NODE_PATH: '/workspaces/lucid-winds/node_modules' }) });
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
  console.log('\nSKIPPED in fast mode, because a shrunken sample makes these lie: ' +
              skipped.join(', ') + '.\nRun `node tools/check.js` with no flag before calling anything a pass.');
console.log('\n' + (bad.length ? bad.length + ' GATE' + (bad.length > 1 ? 'S' : '') + ' FAILED'
                    : skipped.length ? 'THE GATES THAT CAN RUN FAST PASSED'
                                     : 'ALL GATES PASSED'));
process.exit(bad.length ? 1 : 0);
