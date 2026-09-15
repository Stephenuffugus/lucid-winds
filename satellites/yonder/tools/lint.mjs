#!/usr/bin/env node
/* YONDER's laws, checked against the files a browser loads from satellites/yonder/ (everything but test/, tools/, docs/
 * and package.json). Shape from satellites/span/tools/lint.mjs.
 *
 *   node tools/lint.mjs
 *
 * What it asserts (plans/yonder/HANDOFF-YONDER.md P0 step 3), each watched to fail on a planted line:
 *   1. every runtime module parses as an ES module
 *   2. nothing a browser loads is a .mjs
 *   3. every relative import and local asset carries ?v= plus YONDER's stamp (STAMP.js), CORE's included
 *   4. engine.js names no document, window, Date, performance, Math.random or timer (the sim is pure)
 *   5. Y1, nothing circular: no border-radius of 50 percent or a pill's 999, no SVG circle or ellipse, no canvas arc, and
 *      no rotate anywhere in YONDER's own files (a spinner, a ring, a clock hand all start as one)
 *   6. Y5 and G13: the catalog's forbidden words anywhere, and no word naming the child's reading (logarithm,
 *      logarithmic, linear) in copy, through CORE's shared assertion
 *   7. no dash and no exclamation point in anything a child or a teacher reads, and Sky Wolf Studio singular; copy lives
 *      in content.js's COPY or a page's text, and no sentence is written to the page from elsewhere
 *   8. G4: getUserMedia nowhere
 *   9. no object literal declares the same key twice
 * Y2's law (nothing advances THE RACE but an input) arrives with the race in P2, and the sprite table's law with the
 * sprites in P3, so neither passes by having nothing to read.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, relative, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dupKeys } from '../../../tools/dupkeys.mjs';
import { assertForbiddenStrings, assertNoGetUserMedia } from '../../math/core/test/shared.mjs';

const YONDER = join(dirname(fileURLToPath(import.meta.url)), '..');
const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };

const SKIP = new Set(['test', 'tools', 'docs', 'node_modules']);
function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name), st = statSync(p);
    if (st.isDirectory()) { if (!SKIP.has(name)) walk(p, out); }
    else if (name !== 'package.json') out.push(p);
  }
  return out;
}
const files = walk(YONDER, []);
const rel = p => relative(YONDER, p);
const read = p => readFileSync(p, 'utf8');
const JS = files.filter(p => extname(p) === '.js');
const HTML = files.filter(p => extname(p) === '.html');
function stripComments(src) {
  let out = '', i = 0, q = null;
  while (i < src.length) {
    const c = src[i], n = src[i + 1];
    if (q) { out += c; if (c === '\\') { out += n || ''; i += 2; continue; } if (c === q) q = null; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; out += c; i++; continue; }
    if (c === '/' && n === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
    if (c === '/' && n === '*') { i += 2; while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++; i += 2; continue; }
    out += c; i++;
  }
  return out;
}

/* 1 */
{
  const bad = [];
  for (const p of JS) {
    const r = spawnSync(process.execPath, ['--check', p], { encoding: 'utf8' });
    if (r.status !== 0) bad.push(rel(p) + ': ' + (r.stderr.split('\n').find(l => /Error/.test(l)) || 'does not parse'));
  }
  say(bad.length === 0, 'every runtime module parses as an ES module' + (bad.length ? ': ' + bad.join(' | ') : ' (' + JS.length + ' of them)'));
}

/* 2 */
{
  const bad = files.filter(p => extname(p) === '.mjs').map(rel);
  for (const p of JS.concat(HTML)) for (const m of read(p).matchAll(/['"]([^'"\s]+\.mjs(\?[^'"]*)?)['"]/g)) bad.push(rel(p) + ' names ' + m[1]);
  say(bad.length === 0, 'nothing a browser loads is a .mjs' + (bad.length ? ': ' + bad.join(', ') : ''));
}

/* 3 */
const stampFile = join(YONDER, 'STAMP.js');
const STAMP = existsSync(stampFile) ? (read(stampFile).match(/export const STAMP = '([0-9]{8}[a-z])'/) || [])[1] : null;
say(!!STAMP, 'STAMP.js names YONDER\'s one stamp' + (STAMP ? ': ' + STAMP : ''));
{
  const specs = [];
  const fromJs = (src, where) => {
    const s = stripComments(src);
    for (const re of [/\bimport\s+(?:[\w*{}\s,]+\s+from\s+)?['"]([^'"]+)['"]/g, /\bexport\s+[\w*{}\s,]+\s+from\s+['"]([^'"]+)['"]/g, /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g]) {
      for (const m of s.matchAll(re)) specs.push([where, m[1]]);
    }
  };
  for (const p of JS) fromJs(read(p), rel(p));
  for (const p of HTML) {
    const h = read(p);
    for (const m of h.matchAll(/<script\b[^>]*type=["']module["'][^>]*>([\s\S]*?)<\/script>/gi)) fromJs(m[1], rel(p) + ' (inline module)');
    for (const m of h.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)) specs.push([rel(p), m[1]]);
    for (const m of h.matchAll(/<link\b[^>]*\bhref=["']([^"']+)["']/gi)) specs.push([rel(p), m[1]]);
  }
  const local = specs.filter(([, u]) => !/^(https?:|\/\/|data:|#|mailto:)/.test(u));
  const bad = local.filter(([, u]) => !STAMP || !u.endsWith('?v=' + STAMP)).map(([w, u]) => w + ' loads ' + u);
  say(bad.length === 0, 'every relative import and local asset carries ?v=' + STAMP + (bad.length ? ': ' + bad.join(', ') : ' (' + local.length + ' of them)'));
}

/* 4 */
{
  const p = join(YONDER, 'engine.js');
  if (!existsSync(p)) say(false, 'engine.js exists');
  else {
    const code = stripComments(read(p));
    const banned = ['document', 'window', 'Date', 'performance', 'setTimeout', 'setInterval', 'requestAnimationFrame']
      .filter(w => new RegExp('\\b' + w + '\\b').test(code));
    if (/Math\.random/.test(code)) banned.push('Math.random');
    say(banned.length === 0, 'engine.js touches no screen, clock or unseeded die' + (banned.length ? ': it names ' + banned.join(', ') : ''));
  }
}

/* 5 */
{
  const round = [];
  const SHAPES = [[/border-radius\s*:\s*50%/i, 'a border-radius of 50%'], [/border-radius\s*:\s*9{3,}px/i, 'a pill\'s radius'], [/<circle\b/i, 'an SVG circle'],
    [/<ellipse\b/i, 'an SVG ellipse'], [/\.arc\s*\(/, 'a canvas arc'], [/\.ellipse\s*\(/, 'a canvas ellipse'], [/rotate\s*\(/i, 'a rotate'], [/borderRadius\s*=\s*['"]50%/, 'a border-radius of 50%']];
  for (const p of JS.concat(HTML)) {
    const t = extname(p) === '.js' ? stripComments(read(p)) : read(p).replace(/<!--[\s\S]*?-->/g, ' ');
    for (const [re, what] of SHAPES) if (re.test(t)) round.push(rel(p) + ' has ' + what);
  }
  say(round.length === 0, 'nothing circular in YONDER\'s own files: no 50% radius, pill, SVG circle or ellipse, canvas arc or rotate (Y1)' + (round.length ? ': ' + round.join(', ') : ''));
}

/* 6 and 8, through CORE's shared assertions. ⛔ The first version handed CORE's assertion the reading's words too, and
   it reads every string literal: it went red on engine.js naming its own model ('logarithmic', 'linear'), which routing
   needs and no child ever sees. The catalog's words stay on the shared assertion; the reading's words are held to copy
   in law 7, and to the rendered page in P2's live law. */
{
  const words = assertForbiddenStrings(YONDER);
  say(words.ok, 'none of the catalog\'s forbidden words anywhere (' + words.detail + ')');
  const gum = assertNoGetUserMedia(YONDER);
  say(gum.ok, 'getUserMedia appears nowhere a browser loads (G4) (' + gum.detail + ')');
}

/* 7 */
{
  const copy = [];
  const content = join(YONDER, 'content.js');
  if (existsSync(content)) {
    const src = read(content), at = src.search(/export const COPY\s*=/);
    if (at >= 0) {
      let i = src.indexOf('{', at), depth = 0, end = i;
      for (; end < src.length; end++) { if (src[end] === '{') depth++; else if (src[end] === '}' && --depth === 0) break; }
      for (const m of src.slice(i, end + 1).matchAll(/(['"`])((?:\\.|(?!\1)[^\\])*)\1/g)) copy.push(m[2]);
    }
  }
  for (const p of HTML) {
    const text = read(p).replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, '\n');
    for (const line of text.split('\n').map(s => s.trim()).filter(Boolean)) copy.push(line);
  }
  const words = copy.filter(t => /[A-Za-z]{2}/.test(t));
  const reading = words.filter(t => /logarithm|linear/i.test(t));
  say(reading.length === 0, 'nothing a child or a teacher reads names a child\'s reading of the road (Y5)' + (reading.length ? ': ' + reading.map(d => JSON.stringify(d)).join(', ') : ''));
  const dashed = words.filter(t => /[-‐-―−]|&mdash;|&ndash;/.test(t));
  const banged = words.filter(t => t.indexOf('!') >= 0);
  const brand = words.filter(t => /Sky Walk|Sky Wolf Studios|Skywolf/i.test(t));
  say(dashed.length === 0, 'no dash in anything a child or a teacher reads' + (dashed.length ? ': ' + dashed.map(d => JSON.stringify(d)).join(', ') : ' (' + words.length + ' strings)'));
  say(banged.length === 0, 'and no exclamation point' + (banged.length ? ': ' + banged.map(d => JSON.stringify(d)).join(', ') : ''));
  say(brand.length === 0, 'and the studio is Sky Wolf Studio, singular' + (brand.length ? ': ' + brand.map(d => JSON.stringify(d)).join(', ') : ''));
  const stray = [];
  for (const p of JS) {
    const s = stripComments(read(p));
    const re = /\.(textContent|innerText|innerHTML)\s*=\s*(['"`])((?:\\.|(?!\2)[^\\])*)\2|setAttribute\(\s*['"]aria-label['"]\s*,\s*(['"`])((?:\\.|(?!\4)[^\\])*)\4/g;
    for (const m of s.matchAll(re)) {
      const lit = (m[3] !== undefined ? m[3] : m[5]).replace(/<[^>]*>/g, ' ');
      if (/[A-Za-z]{2,}\s+[A-Za-z]{2,}/.test(lit)) stray.push(rel(p) + ': ' + JSON.stringify(lit.trim()));
    }
  }
  say(stray.length === 0, 'and no sentence is written to the page from outside COPY' + (stray.length ? ': ' + stray.join(', ') : ''));
}

/* 10: Y2, nothing moves THE RACE but an input. In race.js there is no timer, no animation callback and no finished
   promise, and once every event listener's own callback is cut out of the file, no call to step is left anywhere. */
{
  const p = join(YONDER, 'race.js');
  if (!existsSync(p)) say(false, 'race.js exists');
  else {
    const code = stripComments(read(p));
    const clocks = ['setTimeout', 'setInterval', 'requestAnimationFrame', 'onfinish', 'queueMicrotask'].filter(w => new RegExp('\\b' + w + '\\b').test(code));
    if (/\.finished\b/.test(code)) clocks.push('.finished');
    /* cut each addEventListener( ... ) call out, matching its brackets */
    let rest = '', i = 0;
    for (;;) {
      const at = code.indexOf('addEventListener(', i);
      if (at < 0) { rest += code.slice(i); break; }
      rest += code.slice(i, at);
      let depth = 0, j = at + 'addEventListener'.length;
      for (; j < code.length; j++) { if (code[j] === '(') depth++; else if (code[j] === ')' && --depth === 0) break; }
      i = j + 1;
    }
    const calls = Array.from(rest.matchAll(/\bstep\s*\(/g)).length, defs = Array.from(rest.matchAll(/function\s+step\s*\(/g)).length;
    say(clocks.length === 0 && defs === 1 && calls === defs, 'nothing moves the race but an input: race.js has no clock, and step is called only from an event listener (Y2)'
      + (clocks.length ? ': it names ' + clocks.join(', ') : '') + (calls !== defs ? ': step is called ' + (calls - defs) + ' time(s) outside a listener' : '') + (defs !== 1 ? ': ' + defs + ' definitions of step' : ''));
  }
}

/* 9 */
{
  let lits = 0, unclosed = 0;
  const dups = [];
  for (const p of JS) {
    const src = read(p).replace(/^([ \t]*)export /gm, (m, s) => s + '       ').replace(/Object\.freeze\(/g, '              ');
    const dk = dupKeys(src);
    lits += dk.literals; unclosed += dk.unclosed;
    for (const d of dk.dups) dups.push(basename(p) + ' ' + d.name + '.' + d.key + ' on lines ' + d.lines.join(' and '));
  }
  say(dups.length === 0, 'no object literal declares the same key twice' + (dups.length ? ': ' + dups.join('; ') : ' (' + lits + ' literals read)'));
  say(unclosed === 0, 'and every literal the sweep opened it could close' + (unclosed ? ' (' + unclosed + ' unclosed)' : ''));
}

console.log('');
if (fails.length) { console.log(fails.length + ' LINT FAILURE(S)'); process.exit(1); }
console.log('LINT OK');
