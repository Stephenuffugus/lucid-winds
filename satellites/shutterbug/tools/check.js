/* The one command that says whether Shutterbug is shippable (BUILD-PLAN.md section 5.1, the fleet shape).
 *
 *   node tools/check.js                      everything: every gate below, the browser gates one at a time
 *   node tools/check.js --fast               skips the slow gates and SAYS so
 *   node tools/check.js --fast --gate play   the per task run: the gates that need no browser, plus ONE browser gate
 *
 * Shape copied from satellites/gerplunk/tools/check.js with its scars: fast mode SKIPS a slow gate and never shrinks
 * it; a failure prints the FAILING lines, never the tail; stderr is captured, never spilled into the table; the
 * summary never says ALL GATES PASSED when anything was skipped. Additions for Shutterbug: `--gate <name>` runs the
 * one browser gate a task names and exits nonzero when that gate was skipped for ANY reason (a task cannot pass on a
 * gate that did not run); Puppeteer is resolved from SB_PUPPETEER_DIR (default /workspaces/sws-tools, where this box
 * keeps Chrome) first and /workspaces/lucid-winds/node_modules second; a harness that passed with xfails makes the
 * summary say GATES PASSED WITH N XFAIL and list them.
 *
 * CommonJS on purpose: an ESM .js with no package.json makes Node print a MODULE_TYPELESS warning above every
 * table (the gerplunk lesson). */
const { execFileSync } = require('node:child_process');
const { join } = require('node:path');

const ROOT = join(__dirname, '..');
const args = process.argv.slice(2);
const FAST = args.includes('--fast');
const gi = args.indexOf('--gate');
const ONE = gi >= 0 ? args[gi + 1] : null;
if (gi >= 0 && !ONE) { console.log('usage: --gate <name>'); process.exit(2); }

/* Gates that need no browser. `slow` gates are skipped by --fast (and said). */
const GATES = [
  { name: 'lint',     cmd: ['tools/lint.mjs'],  need: 'LINT OK' },
  { name: 'icons',    cmd: ['tools/icons.mjs', '--check'], need: 'ICONS OK' },   /* the three PWA icons equal what the hero's pixel string draws (T1.11) */
  { name: 'harness',  cmd: ['harness.js', '--fast'], need: 'SHUTTERBUG HARNESS OK' },
  { name: 'redwatch', cmd: ['tools/redwatch.js', '--check'], need: 'REDWATCH OK' },
  /* the bot's macro search on every edge of every graph (T0.13a, BUILD-PLAN 3.9): before every deploy and the morning report */
  { name: 'harness-all', cmd: ['harness.js', '--all-edges', '--only', 'H-bot-6'], need: 'SHUTTERBUG HARNESS OK', slow: true }
];

/* Browser gates drive the real page in a real Chrome with real touch events. Skipped with the reason, never failed,
   when the browser is absent; a failure here is rerun ALONE, twice, before it is believed (two cores, swiftshader). */
const BROWSER_GATES = [
  { name: 'boot',     cmd: ['test/boot.mjs'],   need: 'BOOT OK' },
  { name: 'play',     cmd: ['test/play.mjs'],   need: 'PLAY OK' },
  { name: 'make',     cmd: ['test/make.mjs'],   need: 'MAKE OK' },
  { name: 'input',    cmd: ['test/input.mjs'],  need: 'INPUT OK' },
  { name: 'layout',   cmd: ['test/layout.mjs'], need: 'LAYOUT OK' },
  { name: 'reveal',   cmd: ['test/reveal.mjs'], need: 'REVEAL OK' },
  { name: 'capture',  cmd: ['test/capture.mjs'], need: 'CAPTURE OK' },
  { name: 'death',    cmd: ['test/death.mjs'],  need: 'DEATH OK' },
  { name: 'sprites',  cmd: ['test/sprites.mjs'], need: 'SPRITES OK' },
  { name: 'loot',     cmd: ['test/loot.mjs'],   need: 'LOOT OK' },
  { name: 'audio',    cmd: ['test/audio.mjs'],  need: 'AUDIO OK' },
  { name: 'share',    cmd: ['test/share.mjs'],  need: 'SHARE OK' },
  { name: 'save',     cmd: ['test/save.mjs'],   need: 'SAVE OK' },
  { name: 'pwa',      cmd: ['test/pwa.mjs'],    need: 'PWA OK' },
  { name: 'loop',     cmd: ['test/loop.mjs'],   need: 'LOOP OK' },
  { name: 'redwatch-browser', cmd: ['tools/redwatch.js', '--check', '--browser-only'], need: 'REDWATCH OK', slow: true }
];

let browserWhy = '', puppeteerDir = '';
if (process.env.SWS_NO_BROWSER === '1') {
  browserWhy = 'SWS_NO_BROWSER=1, the browser gates are not run here';
} else {
  const dirs = [process.env.SB_PUPPETEER_DIR || '/workspaces/sws-tools', '/workspaces/lucid-winds'];
  for (const d of dirs) {
    try { require.resolve('puppeteer', { paths: [d] }); puppeteerDir = d; break; } catch (e) { /* next */ }
  }
  if (!puppeteerDir) browserWhy = 'puppeteer not found in ' + dirs.join(' or ') + ', the browser gates are skipped';
}

const all = GATES.concat(BROWSER_GATES.map(g => Object.assign({ browser: true }, g)));
if (ONE && !all.some(g => g.name === ONE)) {
  console.log('no gate named ' + ONE + '. Gates: ' + all.map(g => g.name).join(', ')); process.exit(2);
}
const oneIsBrowser = ONE && BROWSER_GATES.some(g => g.name === ONE);

console.log('browser gates: ' + (browserWhy ? 'SKIPPED (' + browserWhy + ')' : 'RUN (puppeteer from ' + puppeteerDir + ')')
  + (ONE ? '   --gate ' + ONE : '') + (FAST ? '   --fast' : '') + '\n');

const results = [], skipped = [];
for (const g of all) {
  if (g.browser) {
    if (ONE && oneIsBrowser && g.name !== ONE) continue;                 // the per task run: one browser gate only
    if (ONE && !oneIsBrowser) continue;
    if (browserWhy) { skipped.push(g.name + ' (' + browserWhy + ')'); console.log(g.name.padEnd(18) + 'skip'); continue; }
  }
  if (FAST && g.slow && g.name !== ONE) { skipped.push(g.name + ' (slow, --fast)'); console.log(g.name.padEnd(18) + 'skip  (slow)'); continue; }
  process.stdout.write(g.name.padEnd(18));
  const t0 = Date.now();
  let out = '', code = 0;
  try {
    out = execFileSync('node', g.cmd.concat(FAST && g.fastArgs ? g.fastArgs : []), {
      cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'],
      env: Object.assign({}, process.env, puppeteerDir ? { SB_PUPPETEER_DIR: puppeteerDir } : {})
    });
  } catch (e) {
    out = (e.stdout || '') + (e.stderr || '');
    code = e.status === undefined || e.status === null ? 1 : e.status;
  }
  const pass = code === 0 && out.indexOf(g.need) >= 0;
  const xm = out.match(/WITH (\d+) XFAIL/);
  const xfail = pass && xm ? Number(xm[1]) : 0;
  const xlist = xfail ? (out.match(/^XFAIL .*$/gm) || []) : [];
  console.log((pass ? 'pass' : 'FAIL') + '  ' + String(Math.round((Date.now() - t0) / 1000)).padStart(4) + 's'
    + (xfail ? '  (' + xfail + ' xfail)' : ''));
  results.push({ g, pass, out, xfail, xlist });
}

const bad = results.filter(r => !r.pass);
if (bad.length) {
  console.log('\n' + '='.repeat(64));
  for (const r of bad) {
    console.log('\n--- ' + r.g.name + ' (wanted: ' + r.g.need + ') ---');
    const lines = r.out.split('\n');
    const shown = [];
    for (let i = 0; i < lines.length; i++) {
      if (/FAIL|Error|error:|STAYED GREEN|stayed green/.test(lines[i])) {
        for (let k = Math.max(0, i - 1); k <= Math.min(lines.length - 1, i + 1); k++) if (shown.indexOf(k) < 0) shown.push(k);
      }
    }
    console.log(shown.length ? shown.map(k => lines[k]).join('\n') : lines.slice(-26).join('\n'));
    if (shown.length) console.log('\n(tail)\n' + lines.slice(-6).join('\n'));
  }
}
const xfails = results.reduce((n, r) => n + r.xfail, 0);
if (xfails) console.log('\nXFAIL (marked by name, each with a QUESTIONS.md entry):\n' + results.flatMap(r => r.xlist).join('\n'));
if (skipped.length) console.log('\nSKIPPED: ' + skipped.join('; ') + '.');
const oneSkipped = ONE && skipped.some(s => s.startsWith(ONE + ' '));
let line;
if (bad.length) line = bad.length + ' GATE' + (bad.length > 1 ? 'S' : '') + ' FAILED';
else if (oneSkipped) line = 'THE GATE NAMED BY --gate (' + ONE + ') DID NOT RUN';
else if (!results.length) line = 'NO GATES RAN';
else {
  line = skipped.length ? (browserWhy && !FAST ? 'THE GATES THAT NEED NO BROWSER PASSED' : 'THE GATES THAT RAN PASSED (some were skipped, listed above)')
    : ONE ? 'THE GATES FOR THIS TASK PASSED (' + ONE + ')' : 'ALL GATES PASSED';
  if (xfails) line = line === 'ALL GATES PASSED' ? 'GATES PASSED WITH ' + xfails + ' XFAIL' : line + ', WITH ' + xfails + ' XFAIL';
}
console.log('\n' + line);
process.exit(bad.length || oneSkipped || !results.length ? 1 : 0);
