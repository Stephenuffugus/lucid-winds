#!/usr/bin/env node
/* Six mutants, each a single change to a scratch copy of the game, each of
   which MUST turn the sim gate red.
 *
 *   node test/mutants.mjs
 *
 * A gate nobody has watched fail is decoration, and a gate that survives a
 * mutation is worse than none: it is a green light with nothing behind it.
 * This file makes that watch re-runnable, so it stays true after every edit
 * rather than being true once on the night it was written.
 * Shape from satellites/conduit/test/mutants.js.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = readFileSync(join(ROOT, 'index.html'), 'utf8');
const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };

/* each mutant is [name, find, replace], and `find` must appear exactly once or
   the mutant is stale and this file says so rather than quietly doing nothing */
const MUTANTS = [
  ['gravity turned off', 'GRAVITY: 900,', 'GRAVITY: 0,'],
  /* ⛔ NOT MARBLE_REST: the solver takes the MINIMUM restitution of the pair,
     so a bouncy marble on a dead floor is still a dead bounce and the mutant
     survives while changing nothing. The pair's own number is the target. */
  ['every contact made superelastic', 'm.e=Math.min(a.restitution,b.restitution);', 'm.e=1.6;'],
  ['sleeping disabled', 'if(b.sleepTime>0.6){ b.awake=false;', 'if(false){ b.awake=false;'],
  /* ⛔ NOT the length check: the clamp below it still refuses a positive
     impulse, so the rope stays a rope and the mutant survives. The clamp IS
     the inequality. */
  ['the rope made into a rod', 'if (j > 0) j = 0;            /* THE INEQUALITY: it only ever pulls */',
    'if (false) j = 0;            /* THE INEQUALITY: it only ever pulls */'],
  ['the fan cone opened to the whole room', 'FAN_HALF_ANGLE_DEG: 18,', 'FAN_HALF_ANGLE_DEG: 180,'],
  ['an unspecified sine put back in', 'function vrot(a,ang){ var c=dcos(ang), s=dsin(ang);',
    'function vrot(a,ang){ var c=Math.cos(ang), s=Math.sin(ang);'],
  ['the domino cascade broken by friction', 'DOMINO_FRICTION: 0.45,', 'DOMINO_FRICTION: 0.92,']
];

const dir = mkdtempSync(join(tmpdir(), 'doohickey-mutant-'));
cpSync(join(ROOT, 'sim.js'), join(dir, 'sim.js'));

function runAgainst(html) {
  const file = join(dir, 'mutant.html');
  writeFileSync(file, html);
  try {
    const out = execFileSync('node', [join(ROOT, 'sim.js'), '--test'], {
      cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: Object.assign({}, process.env, { DOOHICKEY_HTML: file })
    });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status === undefined ? 1 : e.status, out: (e.stdout || '') + (e.stderr || '') };
  }
}

/* the control: the real file has to be GREEN, or every mutant below is
   measuring a broken build rather than its own change */
const control = runAgainst(SRC);
say(control.code === 0 && control.out.indexOf('DOOHICKEY TEST OK') >= 0,
  'the unmutated game passes, so the mutants below mean something');

for (const [name, find, repl] of MUTANTS) {
  const n = SRC.split(find).length - 1;
  if (n !== 1) { say(false, 'the mutant "' + name + '" is stale: its target appears ' + n + ' times'); continue; }
  const res = runAgainst(SRC.replace(find, repl));
  const killed = res.code !== 0;
  const line = (res.out.match(/^FAIL  .*$/m) || ['no failing line'])[0].replace(/^FAIL  /, '');
  say(killed, 'the gate dies when ' + name + (killed ? ': ' + line : ' (IT SURVIVED)'));
}

rmSync(dir, { recursive: true, force: true });
console.log('');
if (fails.length) { console.log(fails.length + ' MUTANT FAILURE(S)'); process.exit(1); }
console.log('MUTANTS OK');
