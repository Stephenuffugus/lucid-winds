#!/usr/bin/env node
/* THE FULL SWEEP OF THE TWELVE, INCLUDING THE BROWSER GATES, ON THIS BOX.
 *
 *   node scripts/fleet/sweep-twelve.mjs             everything, and write the report
 *   node scripts/fleet/sweep-twelve.mjs --fast      skip each game's slow gates (SAYS so)
 *   node scripts/fleet/sweep-twelve.mjs --no-host   do not ask the host anything (offline)
 *   node scripts/fleet/sweep-twelve.mjs --only=gerplunk,strata
 *
 * WHAT IT ANSWERS, and it is two questions, not one:
 *   1. Is any of the twelve RED right now? (its own tools/check.js, browser gates included)
 *   2. Do the four places a stamp lives all say the SAME STRING?
 *          the file            satellites/<g>/index.html    var STAMP
 *          the shell           satellites/<g>/sw.js         SHELL_VERSION
 *          the shelf           portal/index.html            the row's url ?v= and thumb ?v=
 *          the host            lucidwinds.com/satellites/<g>/    what is actually served
 *
 * Why question 2 is here: on 2026-09-07 ten of the twelve were pinned in the
 * portal at a stamp none of them had carried for a day, so the shelf served a
 * stale tile and a stale cache key for each, and every gate in every game was
 * green. A gate that only looks inside one game cannot see it.
 *
 * TWO CORES. Every browser gate runs under `flock -w 1800 /tmp/sws-gate.lock`,
 * one at a time. A game that goes red is rerun ALONE, twice, before it is
 * believed, because the browser gates flake under contention and calling a
 * flake a fault costs a morning.
 *
 * The report is docs/fleet-sweeps/<utc date and hour>.md, one per RUN so a red
 * that was fixed an hour later is still on the record. Exit is non zero if any game
 * is red or any stamp disagrees, so this can be a cron's whole job.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const TWELVE = ['fathom', 'asterism', 'swell', 'wardian', 'doohickey', 'airworthy',
  'windup', 'inkswing', 'gerplunk', 'whistlestop', 'updraft', 'strata'];

const FAST = process.argv.includes('--fast');
const NO_HOST = process.argv.includes('--no-host');
const only = (process.argv.find(a => a.startsWith('--only=')) || '').slice(7);
const games = only ? only.split(',').map(s => s.trim()).filter(Boolean) : TWELVE;
const LOCK = '/tmp/sws-gate.lock';

function read(p) { try { return readFileSync(join(ROOT, p), 'utf8'); } catch (e) { return ''; } }

/* ---- the four stamps ------------------------------------------------- */

function stampInFile(g) {
  const m = read('satellites/' + g + '/index.html').match(/var STAMP\s*=\s*'([^']+)'/);
  return m ? m[1] : null;
}
function stampInShell(g) {
  const m = read('satellites/' + g + '/sw.js').match(/SHELL_VERSION\s*=\s*"([^"]+)"/);
  /* "fathom-shell-20260907b" -> "20260907b". The prefix is the game's cache
     namespace and is checked separately, because a shell named for another game
     would delete that game's caches. */
  return m ? { full: m[1], stamp: m[1].replace(/^.*-shell-/, ''), prefix: m[1].replace(/-shell-.*$/, '') } : null;
}
function stampInPortal(g) {
  /* The row is one line: {nm:"Swell", ..., url:"/satellites/swell/?v=STAMP", ..., thumb:"...png?v=STAMP", ...} */
  const portal = read('portal/index.html');
  const line = portal.split('\n').find(l => l.indexOf('"/satellites/' + g + '/?v=') >= 0);
  if (!line) return null;
  const u = line.match(new RegExp('"/satellites/' + g + '/\\?v=([^"]+)"'));
  const t = line.match(new RegExp('thumb:"/portal-assets/thumbs/' + g + '\\.png\\?v=([^"]+)"'));
  return { url: u ? u[1] : null, thumb: t ? t[1] : null };
}
function stampOnHost(g) {
  if (NO_HOST) return { skipped: true };
  const url = 'https://lucidwinds.com/satellites/' + g + '/?probe=' + Math.floor(Math.random() * 1e9);
  const r = spawnSync('curl', ['-s', '--max-time', '25', url], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  if (r.status !== 0 || !r.stdout) return { error: 'curl failed (' + r.status + ')' };
  const m = r.stdout.match(/var STAMP\s*=\s*'([^']+)'/);
  return m ? { stamp: m[1] } : { error: 'no STAMP in the served page' };
}

/* ---- the gates -------------------------------------------------------- */

function browserGateNames(g) {
  const src = read('satellites/' + g + '/tools/check.js');
  const block = src.split('const BROWSER_GATES = [')[1];
  if (!block) return [];
  const head = block.split('];')[0];
  return (head.match(/name:\s*'([a-z0-9_-]+)'/g) || []).map(s => s.replace(/.*'([^']+)'.*/, '$1'));
}

function runCheck(g, extra) {
  /* flock serialises the whole suite, because the browser gates inside it are
     what contend. timeout 900 around a flock that may wait 1800 would kill the
     wait, not the work, so the timeout is on the OUTSIDE and generous. */
  const args = ['-w', '1800', LOCK, 'node', 'tools/check.js'].concat(extra || []);
  const r = spawnSync('flock', args, {
    cwd: join(ROOT, 'satellites', g), encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024, timeout: 1800 * 1000
  });
  return { ok: r.status === 0, out: (r.stdout || '') + (r.stderr || '') };
}

function runOneGate(g, name) {
  const src = read('satellites/' + g + '/tools/check.js');
  const line = src.split('\n').find(l => l.indexOf("name: '" + name + "'") >= 0);
  const m = line && line.match(/cmd:\s*\[([^\]]+)\]/);
  if (!m) return { ok: false, out: 'no cmd for gate ' + name };
  const cmd = m[1].split(',').map(s => s.trim().replace(/^'|'$/g, ''));
  const r = spawnSync('flock', ['-w', '1800', LOCK, 'node'].concat(cmd), {
    cwd: join(ROOT, 'satellites', g), encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024, timeout: 1800 * 1000
  });
  return { ok: r.status === 0, out: (r.stdout || '') + (r.stderr || '') };
}

function gateTable(out) {
  return out.split('\n').filter(l => /^\S+\s+(pass|FAIL)\s/.test(l))
    .map(l => { const p = l.trim().split(/\s+/); return { name: p[0], pass: p[1] === 'pass', secs: p[2] || '' }; });
}

/* ---- the sweep -------------------------------------------------------- */

/* ⛔ THE HOUR IS IN THE NAME. Two sweeps on one day used to write the same file,
   so the second overwrote the first: on the night of 2026-09-07 a sweep caught
   Gerplunk RED, the fault was fixed, and the confirming sweep an hour later would
   have erased the only record that it had ever been red. A sweep is evidence and
   evidence is not overwritten. */
const stamp = new Date().toISOString().slice(0, 16).replace(/[-:]/g, '').replace('T', '-');
const rows = [];
const t00 = Date.now();

for (const g of games) {
  process.stdout.write('\n=== ' + g + ' ');
  const t0 = Date.now();
  let res = runCheck(g, FAST ? ['--fast'] : []);
  let table = gateTable(res.out);
  const reruns = [];

  if (!res.ok) {
    /* Which gates went red, and are they browser gates? A red browser gate is
       rerun alone twice; two passes is the law's pass and it is RECORDED as a
       flake, never quietly swallowed. */
    const redNames = table.filter(t => !t.pass).map(t => t.name);
    const browser = browserGateNames(g);
    const redBrowser = redNames.filter(n => browser.indexOf(n) >= 0);
    const redNode = redNames.filter(n => browser.indexOf(n) < 0);
    for (const n of redBrowser) {
      const a = runOneGate(g, n), b = runOneGate(g, n);
      reruns.push({ gate: n, first: a.ok, second: b.ok, out: a.ok && b.ok ? '' : (a.ok ? b.out : a.out) });
    }
    const stillRed = redNode.length > 0 || reruns.some(r => !(r.first && r.second));
    res.ok = !stillRed;
    if (!stillRed && reruns.length) process.stdout.write('(flake: ' + reruns.map(r => r.gate).join(', ') + ' passed twice alone) ');
  }

  const file = stampInFile(g), shell = stampInShell(g), portal = stampInPortal(g), host = stampOnHost(g);
  const want = file;
  const disagree = [];
  if (!file) disagree.push('no var STAMP in index.html');
  if (!shell) disagree.push('no SHELL_VERSION in sw.js');
  else {
    if (shell.stamp !== want) disagree.push('sw.js ' + shell.stamp);
    if (shell.prefix !== g) disagree.push('sw.js cache prefix is ' + shell.prefix);
  }
  if (!portal) disagree.push('no portal row');
  else {
    if (portal.url !== want) disagree.push('portal url ' + portal.url);
    if (portal.thumb !== want) disagree.push('portal thumb ' + portal.thumb);
  }
  if (host.error) disagree.push('host: ' + host.error);
  else if (host.stamp && host.stamp !== want) disagree.push('host serves ' + host.stamp);

  rows.push({
    game: g, ok: res.ok, secs: ((Date.now() - t0) / 1000).toFixed(0), table, reruns,
    file, shell, portal, host, disagree, out: res.out
  });
  process.stdout.write(res.ok ? 'gates green' : 'GATES RED');
  process.stdout.write(disagree.length ? '  STAMPS: ' + disagree.join('; ') + '\n' : '  stamps agree (' + want + ')\n');
}

const red = rows.filter(r => !r.ok);
const drift = rows.filter(r => r.disagree.length);
const total = ((Date.now() - t00) / 60000).toFixed(1);

/* ---- the report ------------------------------------------------------- */

const out = [];
out.push('# The twelve, swept ' + new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC');
out.push('');
out.push('Written by `scripts/fleet/sweep-twelve.mjs`' + (FAST ? ' in FAST mode (each game\'s slow gates were skipped)' : '')
  + (NO_HOST ? ', with the host NOT asked' : '') + '. ' + total + ' minutes.');
out.push('');
out.push(red.length || drift.length
  ? '**' + (red.length ? red.length + ' red' : '') + (red.length && drift.length ? ', ' : '')
    + (drift.length ? drift.length + ' with a stamp that disagrees' : '') + '.**'
  : '**Twelve green, and every stamp agrees in all four places.**');
out.push('');
out.push('| game | gates | stamp in the file | sw.js | portal url | portal thumb | the host serves |');
out.push('|---|---|---|---|---|---|---|');
for (const r of rows) {
  const mark = v => (v === r.file ? v : '**' + (v || 'missing') + '**');
  out.push('| ' + r.game
    + ' | ' + (r.ok ? 'green' : '**RED**') + ' ' + r.secs + 's'
    + ' | ' + (r.file || '**missing**')
    + ' | ' + (r.shell ? mark(r.shell.stamp) : '**missing**')
    + ' | ' + (r.portal ? mark(r.portal.url) : '**no row**')
    + ' | ' + (r.portal ? mark(r.portal.thumb) : '**no row**')
    + ' | ' + (r.host.skipped ? 'not asked' : (r.host.error ? '**' + r.host.error + '**' : mark(r.host.stamp)))
    + ' |');
}
out.push('');
for (const r of rows) {
  if (r.ok && !r.disagree.length && !r.reruns.length) continue;
  out.push('## ' + r.game);
  if (r.disagree.length) out.push('- stamps: ' + r.disagree.join('; '));
  if (r.reruns.length) {
    for (const rr of r.reruns) {
      out.push('- `' + rr.gate + '` went red in the suite, then rerun alone: '
        + (rr.first ? 'pass' : 'FAIL') + ', ' + (rr.second ? 'pass' : 'FAIL')
        + (rr.first && rr.second ? ' (a flake under contention, not a fault)' : ' (a fault)'));
    }
  }
  if (!r.ok) {
    const lines = r.out.split('\n').filter(l => /FAIL|Error|error:/.test(l)).slice(0, 12);
    if (lines.length) { out.push(''); out.push('```'); out.push(...lines); out.push('```'); }
  }
  out.push('');
}
out.push('---');
out.push('');
out.push('The browser gates DID run here. What this sweep cannot tell anyone is whether any of it '
  + 'is good: no gate has ears or eyes. That is section 4 of the night handoff, and it is Stephen.');
out.push('');

const dir = join(ROOT, 'docs', 'fleet-sweeps');
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
const path = join(dir, stamp + '.md');
writeFileSync(path, out.join('\n'));

console.log('\n\n' + '#'.repeat(64));
console.log('SWEEP: ' + rows.length + ' games, ' + total + ' minutes');
for (const r of rows) {
  console.log((r.ok ? '  green ' : '  RED   ') + r.game.padEnd(14)
    + (r.file || '?').padEnd(12) + (r.disagree.length ? 'STAMPS: ' + r.disagree.join('; ') : ''));
}
console.log(red.length || drift.length
  ? '\n' + (red.length ? red.length + ' RED: ' + red.map(r => r.game).join(', ') + '. ' : '')
    + (drift.length ? drift.length + ' STAMP DISAGREEMENT: ' + drift.map(r => r.game).join(', ') + '.' : '')
  : '\nTWELVE GREEN, EVERY STAMP AGREES IN FOUR PLACES.');
console.log('report: docs/fleet-sweeps/' + stamp + '.md');
console.log('#'.repeat(64));

process.exit(red.length || drift.length ? 1 : 0);
