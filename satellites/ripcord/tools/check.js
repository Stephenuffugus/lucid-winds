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

const GATES = [
  { name: 'bundle',        cmd: ['tools/bundle.js'],   need: 'index.html' },
  /* ⛔ The balance harness is NOT sampled down in fast mode. At N=80 the mirror
     check compares a win rate against a 44 to 56 band, which is inside the noise
     at that sample size, and the gate failed and passed on the same unchanged
     code. A gate that flickers teaches you to ignore it. */
  { name: 'balance',       cmd: ['tools/harness2.js', '300'],
    need: 'ALL ACCEPTANCE TARGETS MET' },
  { name: 'determinism',   cmd: ['test/determinism.js'], need: 'DETERMINISM OK' },
  { name: 'rigs',          cmd: ['test/rigtest.js', FAST ? '20' : '40'], need: 'RIGTEST OK' },
  { name: 'modes',         cmd: ['test/modetest.js', FAST ? '12' : '30'], need: 'MODETEST OK' },
  { name: 'parts',         cmd: ['tools/partaudit.js', FAST ? '3' : '8', '2', FAST ? '14' : '40'],
    need: 'PART AUDIT OK' },
  { name: 'ladder',        cmd: ['tools/ladder.js'],   need: 'LADDER OK' }
];

const results = [];
for (const g of GATES) {
  process.stdout.write(g.name.padEnd(14));
  const t0 = Date.now();
  let out = '', code = 0;
  try {
    out = execFileSync('node', g.cmd, { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
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
console.log('\n' + (bad.length ? bad.length + ' GATE' + (bad.length > 1 ? 'S' : '') + ' FAILED'
                                : 'ALL GATES PASSED'));
process.exit(bad.length ? 1 : 0);
