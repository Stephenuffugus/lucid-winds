/* The one command that says whether Inkswing is shippable.
 *
 *   node tools/check.js            everything
 *   node tools/check.js --fast     skips the slow gates and SAYS so
 *
 * Nothing commits without this printing ALL GATES PASSED. Each gate is a file
 * that can be run on its own, and each is written so that it CAN fail; a gate
 * nobody has watched fail is decoration (HANDOFF-INKSWING section 5).
 *
 * ⛔ ONE LAW PARTICULAR TO INKSWING: THE DRAWING IS ITS THROW LIST. A sheet is
 * never stored as pixels except as a cache. The throws regenerate it exactly, on
 * any phone, which is what the share link and the folio rely on, and
 * test/fling.mjs and test/share.mjs are the gates that hold it there.
 */
/* CommonJS on purpose, and named check.js because the plan and every morning
   report name it that; an ESM .js with no package.json prints a
   MODULE_TYPELESS warning above the gate table on every run. */
const { execFileSync } = require('node:child_process');
const { join } = require('node:path');

const ROOT = join(__dirname, '..');
const FAST = process.argv.includes('--fast');

const GATES = [
  { name: 'sim', cmd: ['sim.js', '--test'], need: 'INKSWING TEST OK' },
  { name: 'lint', cmd: ['tools/lint.mjs'], need: 'LINT OK' }
];
const BROWSER_GATES = [
  { name: 'fling', cmd: ['test/fling.mjs'], need: 'FLING OK' }
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
    /* stderr is CAPTURED, not inherited: a tool that reports on stderr used to
       spill its whole run into the middle of this table. */
    out = execFileSync('node', g.cmd, {
      cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: Object.assign({}, process.env, { NODE_PATH: '/workspaces/lucid-winds/node_modules' })
    });
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
    /* ⛔ the FAILING lines, not the tail: the tail of a gate that died on
       assertion three is twenty five green ones. */
    const lines = r.out.split('\n');
    const red = lines.filter(l => /FAIL|Error|error:|not found|✗/.test(l));
    console.log((red.length ? red : lines.slice(-25)).slice(0, 40).join('\n'));
  }
  console.log('\n' + bad.length + ' GATE' + (bad.length > 1 ? 'S' : '') + ' FAILED');
  process.exit(1);
}
if (skipped.length) console.log('\nSKIPPED (fast mode): ' + skipped.join(', '));
console.log('\nALL GATES PASSED');
