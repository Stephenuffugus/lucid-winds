#!/usr/bin/env node
/* THE GATE THAT RUNS WHEN NOBODY IS HERE.
 *
 *   node scripts/fleet/ci-twelve.mjs            every gate that needs no browser, all twelve
 *   node scripts/fleet/ci-twelve.mjs --fast     the same minus each game's slow gates (SAYS so)
 *   node scripts/fleet/ci-twelve.mjs --only=gerplunk,strata
 *
 * Why this exists: on 2026-09-07 Gerplunk sat RED ON MAIN and was found by
 * accident, with nothing wrong in the game. Nothing in this repo ran a gate
 * between sessions. This runs on every push (.github/workflows/twelve.yml) and
 * it is the same command a human can run here, so a red in the cloud is
 * reproducible on the box in one line.
 *
 * WHAT IT DOES NOT DO, and the summary says this out loud: it does not run the
 * browser gates. Those need Chrome and real pointer events, they flake under
 * contention, and a red nobody trusts teaches people to ignore the column. The
 * browser gates are the local sweep's job (scripts/fleet/sweep-twelve.mjs).
 * SWS_NO_BROWSER=1 is passed to each game's own tools/check.js, which then
 * refuses to print ALL GATES PASSED and prints what it really did instead.
 *
 * The gate list is NOT duplicated here. Each game's tools/check.js owns it, so
 * a gate added to a game is in CI the same minute with nobody remembering.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/* The spine's order (HANDOFF-OPUS-NIGHT-SEP05.md section 5), so a reader of the
   log sees the same twelve in the same order they see everywhere else. */
const TWELVE = ['fathom', 'asterism', 'swell', 'wardian', 'doohickey', 'airworthy',
  'windup', 'inkswing', 'gerplunk', 'whistlestop', 'updraft', 'strata'];

const FAST = process.argv.includes('--fast');
const only = (process.argv.find(a => a.startsWith('--only=')) || '').slice(7);
const games = only ? only.split(',').map(s => s.trim()).filter(Boolean) : TWELVE;

for (const g of games) {
  if (!existsSync(join(ROOT, 'satellites', g, 'tools', 'check.js'))) {
    console.log('NO CHECK: ' + g + ' has no tools/check.js');
    process.exit(2);
  }
}

const rows = [];
const t00 = Date.now();
for (const g of games) {
  const t0 = Date.now();
  const r = spawnSync('node', ['tools/check.js'].concat(FAST ? ['--fast'] : []), {
    cwd: join(ROOT, 'satellites', g),
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    env: Object.assign({}, process.env, { SWS_NO_BROWSER: '1' })
  });
  const secs = ((Date.now() - t0) / 1000).toFixed(0);
  const out = (r.stdout || '') + (r.stderr || '');
  const ok = r.status === 0;
  /* The per gate table each check.js prints, kept for the log. */
  const table = out.split('\n').filter(l => /^\S+\s+(pass|FAIL)\s/.test(l));
  rows.push({ game: g, ok, secs, table, out });
  console.log('\n' + '='.repeat(60) + '\n' + g.toUpperCase() + '  (' + secs + 's)\n' + '='.repeat(60));
  console.log(out.trim());
}

const red = rows.filter(r => !r.ok);
const total = ((Date.now() - t00) / 1000).toFixed(0);

console.log('\n\n' + '#'.repeat(60));
console.log('THE TWELVE, GATES THAT NEED NO BROWSER' + (FAST ? ', FAST MODE' : '') + '  ' + total + 's');
console.log('#'.repeat(60));
for (const r of rows) {
  console.log((r.ok ? '  pass  ' : '  FAIL  ') + r.game.padEnd(14) + r.secs + 's'
    + (r.table.length ? '   ' + r.table.map(l => l.trim().split(/\s+/)[0]).join(' ') : ''));
}
console.log(red.length
  ? '\n' + red.length + ' GAME' + (red.length > 1 ? 'S' : '') + ' RED: ' + red.map(r => r.game).join(', ')
  : '\nTWELVE GREEN on the gates that need no browser. The browser gates did NOT run here.');

/* GitHub's job summary, so a red names the game without opening the log. */
if (process.env.GITHUB_STEP_SUMMARY) {
  const md = ['## The twelve' + (FAST ? ' (fast mode)' : ''), '',
    '| game | gates that need no browser | seconds |', '|---|---|---|']
    .concat(rows.map(r => '| ' + r.game + ' | ' + (r.ok ? 'pass' : '**FAILED**') + ' | ' + r.secs + ' |'))
    .concat(['', red.length
      ? '**RED: ' + red.map(r => r.game).join(', ')
        + '.** Reproduce on the box: `cd satellites/<game> && node tools/check.js`'
      : 'All twelve green. The browser gates did not run here, by design: '
        + 'they are the local sweep\'s job (`node scripts/fleet/sweep-twelve.mjs`).'], '')
    .join('\n');
  try { appendFileSync(process.env.GITHUB_STEP_SUMMARY, md); } catch (e) { /* the log still has it */ }
}

process.exit(red.length ? 1 : 0);
