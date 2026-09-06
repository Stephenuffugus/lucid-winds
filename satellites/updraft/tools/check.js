/* The one command that says whether Updraft is shippable.
 *
 *   node tools/check.js            everything
 *   node tools/check.js --fast     skips the slow gates and SAYS so
 *
 * Nothing commits without this printing ALL GATES PASSED. Each gate is a file
 * that can be run on its own, and each is written so that it CAN fail; a gate
 * nobody has watched fail is decoration (HANDOFF-UPDRAFT section 5).
 * Shape copied from satellites/fathom/tools/check.js. CommonJS on purpose so
 * Node prints no MODULE_TYPELESS warning over the table.
 *
 * ⛔ Two cores, shared: every browser gate here opens Chrome. Run this under
 *    flock -w 1800 /tmp/sws-gate.lock node tools/check.js
 * and never two browser processes at once.
 */
const { execFileSync } = require('node:child_process');
const { join } = require('node:path');
const { existsSync } = require('node:fs');

const ROOT = join(__dirname, '..');
const FAST = process.argv.includes('--fast');

const GATES = [
  { name: 'lint', cmd: ['tools/lint.mjs'], need: 'LINT OK' },
  { name: 'test', cmd: ['sim.js', '--test'], need: 'UPDRAFT TEST OK' }
];

/* Browser gates drive the real page with real pointer events and need
   puppeteer. SKIPPED with a note when the browser is absent, never failed.
   They flake under contention on a two core box: a failure here is rerun
   ALONE, twice, before it is believed. */
const BROWSER_GATES = [
  /* ⛔ audio is a BROWSER gate now. Its first half reads levelsFor in Node, but
     its second half renders the loudest flight into an OfflineAudioContext
     through the real voices and measures peak, rms and the share above 3 kHz off
     the samples, because a model of a level is not a level. */
  { name: 'audio', cmd: ['test/audio.mjs'], need: 'AUDIO OK' },
  { name: 'fly', cmd: ['test/fly.mjs'], need: 'FLY OK' },
  { name: 'layout', cmd: ['test/layout.mjs'], need: 'LAYOUT OK' },
  { name: 'weather', cmd: ['test/weather.mjs'], need: 'WEATHER OK' },
  { name: 'daily', cmd: ['test/daily.mjs'], need: 'DAILY OK' }
].filter(g => existsSync(join(ROOT, g.cmd[0])));

try {
  require.resolve('puppeteer', { paths: ['/workspaces/lucid-winds/node_modules'] });
  for (const g of BROWSER_GATES) GATES.push(g);
} catch (e) {
  if (BROWSER_GATES.length) console.log('note: puppeteer not found, skipping the browser gates (' + BROWSER_GATES.map(g => g.name).join(', ') + ')\n');
}

const results = [], skipped = [];
for (const g of GATES) {
  if (FAST && g.slow) { skipped.push(g.name); continue; }
  process.stdout.write(g.name.padEnd(16));
  const t0 = Date.now();
  let out = '', code = 0;
  try {
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
    const lines = r.out.split('\n'), shown = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].indexOf('FAIL') >= 0 || /Error|error:/.test(lines[i])) {
        for (let k = Math.max(0, i - 1); k <= Math.min(lines.length - 1, i + 1); k++) if (shown.indexOf(lines[k]) < 0) shown.push(lines[k]);
      }
    }
    console.log(shown.length ? shown.join('\n') : lines.slice(-26).join('\n'));
    if (shown.length) console.log('\n(tail)\n' + lines.slice(-6).join('\n'));
  }
}
if (skipped.length) console.log('\nSKIPPED in fast mode: ' + skipped.join(', ') + '. Run with no flag before calling anything a pass.');
console.log('\n' + (bad.length ? bad.length + ' GATE' + (bad.length > 1 ? 'S' : '') + ' FAILED' : skipped.length ? 'THE GATES THAT CAN RUN FAST PASSED' : 'ALL GATES PASSED'));
process.exit(bad.length ? 1 : 0);
