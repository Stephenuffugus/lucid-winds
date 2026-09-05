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
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FAST = process.argv.includes('--fast');

const GATES = [
  { name: 'lint',    cmd: ['tools/lint.mjs'],  need: 'LINT OK' },
  { name: 'catalog', cmd: ['tools/catalog.mjs', '--check'], need: 'CATALOG OK' },
  { name: 'stamp',   cmd: ['tools/stamp.mjs'], need: 'STAMP OK' },
  { name: 'harness', cmd: ['sim/harness.js', '--scenario=all'], need: 'SIM OK' },
  { name: 'save',         cmd: ['test/save.mjs'],         need: 'SAVE OK' },
  { name: 'clay_regen',   cmd: ['test/clay_regen.mjs'],   need: 'CLAY REGEN OK' },
  { name: 'pity_math',    cmd: ['test/pity_math.mjs'],    need: 'PITY MATH OK' },
  { name: 'words',        cmd: ['test/words.mjs'],        need: 'WORDS OK' },
  { name: 'escrow_crash', cmd: ['test/escrow_crash.mjs'], need: 'ESCROW CRASH OK' },
  { name: 'ransom',       cmd: ['test/ransom.mjs'],       need: 'RANSOM OK' },
  { name: 'progression',  cmd: ['test/progression.mjs'],  need: 'PROGRESSION OK' },
  { name: 'onboarding',   cmd: ['test/onboarding.mjs'],   need: 'ONBOARDING OK' },
  { name: 'damage',       cmd: ['test/damage.mjs'],       need: 'DAMAGE OK' },
  { name: 'arena',        cmd: ['test/arena.mjs'],        need: 'ARENA OK' },
  { name: 'ringer_rules', cmd: ['test/ringer_rules.mjs'], need: 'RINGER RULES OK' },
  { name: 'camera',       cmd: ['test/camera.mjs'],       need: 'CAMERA OK' },
  { name: 'spyglass',     cmd: ['test/spyglass.mjs'],     need: 'SPYGLASS OK' },
  { name: 'formations',   cmd: ['test/formations.mjs'],   need: 'FORMATIONS OK' },
  { name: 'ai_budget',    cmd: ['test/ai_budget.mjs'],   need: 'AI BUDGET OK', slow: true },
  { name: 'ringer_ai',    cmd: ['test/ringer_ai.mjs'],   need: 'RINGER AI OK', slow: true }
];

/* Browser gates drive the real page in a real browser and need puppeteer.
   They are SKIPPED with a note when the browser is absent, never failed:
   a gate that fails for want of a dependency teaches you to ignore gates.
   They are also the ones that flake under contention on a two core box, so a
   failure here is rerun ALONE, twice, before it is believed. */
const BROWSER_GATES = [
  { name: 'render',      cmd: ['test/render.mjs'],      need: 'RENDER OK' },
  { name: 'knuckle',     cmd: ['test/knuckle.mjs'],     need: 'KNUCKLE OK' },
  { name: 'aimnudge',    cmd: ['test/aimnudge.mjs'],    need: 'AIM NUDGE OK' },
  { name: 'audio_budget', cmd: ['test/audio_budget.mjs'], need: 'AUDIO BUDGET OK' },
  { name: 'playthrough', cmd: ['test/playthrough.mjs'], need: 'PLAYTHROUGH OK', slow: true }
];

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
    /* ⛔ SHOW THE FAILING LINES, NOT THE LAST LINES. The tail of a gate that
       failed three assertions early can be twenty five green ones, which is
       exactly what happened on 2026-09-04: the summary printed "3 FAILED" over a
       wall of ok, and the three had to be hunted down by rerunning by hand. */
    const lines = r.out.split('\n');
    const bad2 = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].indexOf('FAIL') >= 0 || /Error|error:/.test(lines[i])) {
        for (let k = Math.max(0, i - 1); k <= Math.min(lines.length - 1, i + 1); k++) {
          if (bad2.indexOf(lines[k]) < 0) bad2.push(lines[k]);
        }
      }
    }
    console.log(bad2.length ? bad2.join('\n') : lines.slice(-26).join('\n'));
    if (bad2.length) console.log('\n(tail)\n' + lines.slice(-6).join('\n'));
  }
}
if (skipped.length)
  console.log('\nSKIPPED in fast mode, because a shrunken sample makes these lie: '
    + skipped.join(', ') + '.\nRun `node tools/check.js` with no flag before calling anything a pass.');
console.log('\n' + (bad.length ? bad.length + ' GATE' + (bad.length > 1 ? 'S' : '') + ' FAILED'
  : skipped.length ? 'THE GATES THAT CAN RUN FAST PASSED'
    : 'ALL GATES PASSED'));
process.exit(bad.length ? 1 : 0);
