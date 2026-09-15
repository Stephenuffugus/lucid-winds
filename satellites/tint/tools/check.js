/* The one command that says whether TINT is shippable.
 *
 *   node tools/check.js            everything
 *   node tools/check.js --fast     skips the slow gates and SAYS so
 *
 * Shape copied from satellites/notch/tools/check.js: fast mode SKIPS a slow gate and never shrinks it; a failure prints
 * the FAILING lines, not the tail; stderr is captured; a run that left the browser gates out refuses to say ALL GATES
 * PASSED; and every gate has half an hour (CREASE's first P3 check hung on one gate for most of an hour). Browser gates join
 * BROWSER_GATES as each phase writes them.
 */
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FAST = process.argv.includes('--fast');
const require = createRequire(import.meta.url);

const GATES = [
  { name: 'lint', cmd: ['tools/lint.mjs'], need: 'LINT OK' },
  { name: 'colour', cmd: ['test/colour.mjs'], need: 'COLOUR OK' },
  { name: 'engine', cmd: ['test/engine.mjs'], need: 'ENGINE OK' }
];

const BROWSER_GATES = [
];


const results = [];
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
  console.log('note: ' + browserWhy + ' (' + BROWSER_GATES.map(g => g.name).join(', ') + ')\n');
}

const skipped = [];
for (const g of GATES) {
  if (FAST && g.slow) { skipped.push(g.name); continue; }
  process.stdout.write(g.name.padEnd(16));
  const t0 = Date.now();
  let out = '', code = 0;
  try {
    out = execFileSync('node', g.cmd, {
      cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, timeout: 30 * 60 * 1000, killSignal: 'SIGKILL',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: Object.assign({}, process.env, { NODE_PATH: '/workspaces/lucid-winds/node_modules' })
    });
  } catch (e) {
    out = (e.stdout || '') + (e.stderr || '');
    code = e.status === undefined || e.status === null ? 1 : e.status;
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
    : browserWhy || !BROWSER_GATES.length ? 'THE GATES THAT NEED NO BROWSER PASSED'
      : 'ALL GATES PASSED'));
process.exit(bad.length ? 1 : 0);
