/**
 * The rules that are not about behaviour, checked by a machine so nobody has to
 * remember them at midnight.
 *
 *   node tools/lint.mjs      prints LINT OK, or every offence with its line
 *
 * 1. `src/core/` touches no DOM and imports nothing from render, input or three.
 *    This is the project's spine: the harness, the AI worker, the Practice Ring
 *    and (Phase 4) the server all run that exact code with no browser near them.
 * 2. `src/core/` calls no transcendental. ECMAScript lets an engine return a
 *    different last bit from Math.sin and friends, and two phones that disagree
 *    on a replay hash move a real marble to the wrong collection. dmath.js is
 *    the substitute and this is what keeps it the only path.
 * 3. Nothing in `src/` calls Math.random. All dice go through core/rng.js.
 * 4. No service worker is registered anywhere. The studio has been taken down
 *    twice by one and Keepsies does not get to try.
 * 5. Player copy carries no dash of any kind and no exclamation point.
 * 6. The embed protocol, the fleet music include and the sunbeam cap helper are
 *    present, and nothing calls history.back().
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const bad = [];
const note = (file, line, msg) => bad.push(relative(ROOT, file) + ':' + line + '  ' + msg);

function walk(dir, out) {
  let names;
  try { names = readdirSync(dir); } catch (e) { return out; }
  for (const n of names) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}

/* Comments are prose. A header that explains why Math.sin is banned must not
   trip the rule that bans it. */
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + ' '.repeat(Math.max(0, m.length - p.length)));
}

function scan(file, rules) {
  const raw = readFileSync(file, 'utf8');
  const code = stripComments(raw);
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    for (const [re, msg] of rules) {
      re.lastIndex = 0;
      if (re.test(lines[i])) note(file, i + 1, msg + '   >> ' + lines[i].trim().slice(0, 90));
    }
  }
}

/* ------------------------------------------------------- 1, 2 and 3: the core */

const BANNED_MATH = /\bMath\.(sin|cos|tan|asin|acos|atan|atan2|hypot|pow|exp|expm1|log|log2|log10|log1p|cbrt|sinh|cosh|tanh|asinh|acosh|atanh|fround)\s*\(/;
const CORE_RULES = [
  [/\b(document|window|navigator|localStorage|sessionStorage|requestAnimationFrame|HTMLCanvasElement)\b/, 'core touches the DOM'],
  [/from\s+['"]three['"]/, 'core imports three'],
  [/from\s+['"][^'"]*\/(render|input|game|meta|audio)\//, 'core imports outside core'],
  [BANNED_MATH, 'core calls a transcendental, use core/dmath.js'],
  [/\bMath\.random\s*\(/, 'core calls Math.random, use core/rng.js']
];
for (const f of walk(join(ROOT, 'src/core'), []).filter(f => f.endsWith('.js'))) scan(f, CORE_RULES);

const SRC_RULES = [
  [/\bMath\.random\s*\(/, 'Math.random in src, all dice go through core/rng.js'],
  [/serviceWorker\s*\.\s*register/, 'a service worker is registered'],
  [/history\s*\.\s*back\s*\(/, 'history.back() inside a game the portal frames']
];
for (const f of walk(join(ROOT, 'src'), []).filter(f => f.endsWith('.js'))) scan(f, SRC_RULES);

/* ------------------------------------------------------- 4, 5 and 6: the page */

const htmlPath = join(ROOT, 'index.html');
const html = readFileSync(htmlPath, 'utf8');

/* Against the code, not the prose: the embed protocol block explains in a
   comment why it never calls history.back(), and a checker that cannot tell a
   warning from the thing it warns about would ban its own documentation. */
const htmlCode = stripComments(html);
for (const [re, msg] of [
  [/serviceWorker\s*\.\s*register/, 'index.html registers a service worker'],
  [/history\s*\.\s*back\s*\(/, 'index.html calls history.back()']
]) if (re.test(htmlCode)) note(htmlPath, 0, msg);

for (const [needle, msg] of [
  ['SWS_EXIT', 'the embed protocol block is missing SWS_EXIT'],
  ["postMessage({sws:'ready'}", 'the embed protocol never posts sws:ready'],
  ['/music-unlocks.js', 'the fleet music include is missing'],
  ['_sbCapEarn', 'the studio sunbeam cap helper is missing']
]) if (html.indexOf(needle) < 0) note(htmlPath, 0, msg);

/* Player copy: what a person actually reads on the page. Tags, style and script
   are not copy; the text between them is. */
const copy = html
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<[^>]*>/g, ' ');
const meta = (html.match(/<meta name="description" content="([^"]*)"/) || [, ''])[1];
for (const [re, msg] of [
  [/[-‐-―]/, 'a dash reached the player, use a comma'],
  [/!/, 'an exclamation point reached the player'],
  [/Sky Wolf Studios\b/, 'the studio is Sky Wolf Studio, singular'],
  [/hand\s*painted/i, 'nothing in this game is hand painted']
]) {
  for (const text of [copy, meta]) {
    const m = text.match(re);
    if (m) note(htmlPath, 0, msg + '   >> "' + text.slice(Math.max(0, m.index - 40), m.index + 40).trim() + '"');
  }
}

/* ------------------------------------------------------------------- verdict */

if (bad.length) {
  console.log(bad.length + ' problem' + (bad.length > 1 ? 's' : '') + ':');
  for (const b of bad) console.log('  ' + b);
  console.log('LINT FAILED');
  process.exit(1);
}
console.log('core is pure, no service worker, no stray dice, and the copy carries no dash');
console.log('LINT OK');
