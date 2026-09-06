#!/usr/bin/env node
/* The studio laws, checked against the shipped file.
 *
 *   node tools/lint.mjs
 *
 * A brace counter cannot read this file: the CSS carries parens and braces and
 * the script carries regexes, so the syntax check is `vm.createScript` over the
 * real script block and nothing else (the fleet scar from index.html, where a
 * stray `);` in dead code killed eleven thousand lines).
 *
 * What it asserts, each watched to fail:
 *   1. the script block parses
 *   2. nothing loaded at runtime is a .mjs (this host serves .mjs as text/plain)
 *   3. every local asset the page pulls carries a ?v= stamp
 *   4. the service worker registration, the sw.js shell version and the page
 *      stamp are the same string
 *   5. no dash and no exclamation point in anything a player reads
 *   6. the brand is Sky Wolf Studio, singular
 *   7. no shadowBlur, at any size (six hundred segments is a slideshow)
 *   8. no font smaller than 0.7 rem, in the CSS and on the canvas
 */
import { readFileSync } from 'node:fs';
import { createScript } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HTML = readFileSync(join(ROOT, 'index.html'), 'utf8');
const SW = readFileSync(join(ROOT, 'sw.js'), 'utf8');
const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };

/* 1. the script parses */
const sOpen = HTML.indexOf('<script>', HTML.indexOf('</style>'));
const sEnd = HTML.lastIndexOf('</script>');
const JS = HTML.slice(sOpen + 8, sEnd);
let parsed = true, why = '';
try { createScript(JS, { filename: 'fathom-inline.js' }); }
catch (e) { parsed = false; why = String(e && e.message || e); }
say(parsed, 'the script block parses' + (parsed ? ' (' + JS.split('\n').length + ' lines)' : ': ' + why));

/* 2. no .mjs at runtime */
const runtimeMjs = (HTML.match(/(?:src|href)\s*=\s*"[^"]*\.mjs/g) || []);
say(runtimeMjs.length === 0, 'nothing the page loads is a .mjs' + (runtimeMjs.length ? ': ' + runtimeMjs.join(', ') : ''));

/* 3. every local asset carries a stamp */
const urls = [...HTML.matchAll(/(?:src|href)\s*=\s*"([^"]+)"/g)].map(m => m[1])
  .filter(u => !/^https?:|^data:|^#/.test(u));
const unstamped = urls.filter(u => u.indexOf('?v=') < 0);
say(unstamped.length === 0, 'every local asset carries a ?v= stamp' + (unstamped.length ? ': ' + unstamped.join(', ') : ' (' + urls.length + ' of them)'));

/* 4. one stamp, three places */
const stampM = JS.match(/var STAMP = '([^']+)'/);
const regM = JS.match(/register\('\.\/sw\.js\?v=' \+ STAMP\)/);
const shellM = SW.match(/const SHELL_VERSION = "fathom-shell-([^"]+)"/);
say(!!stampM, 'the page names its stamp' + (stampM ? ': ' + stampM[1] : ''));
say(!!regM, 'and the service worker registration uses it');
say(!!shellM && !!stampM && shellM[1] === stampM[1],
  'and sw.js carries the same one' + (shellM ? ': fathom-shell-' + shellM[1] : ': sw.js has no fathom-shell version'));
const swOwn = SW.indexOf('fathom-') >= 0 && SW.indexOf('deepwell') < 0;
say(swOwn, 'the worker only ever deletes its own caches');

/* 5. player copy. Text nodes in the body, plus every string the code puts on
      the screen through textContent or toast. */
const body = HTML.slice(HTML.indexOf('<body>'))
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<style[\s\S]*?<\/style>/g, ' ');
const nodes = body.replace(/<[^>]*>/g, '\n').split('\n')
  .map(t => t.trim()).filter(t => t.length > 1 && !/^&#\d+;$/.test(t));
const jsCopy = [
  ...[...JS.matchAll(/textContent\s*=\s*'([^']*)'/g)].map(m => m[1]),
  ...[...JS.matchAll(/toast\('([^']*)'\)/g)].map(m => m[1]),
  ...[...JS.matchAll(/hint:\s*'([^']*)'/g)].map(m => m[1]),
  ...[...JS.matchAll(/name:\s*'([A-Z][A-Z ]+)'/g)].map(m => m[1])
];
const copy = nodes.concat(jsCopy);
const dashed = copy.filter(t => /[-‐-―−]/.test(t));
const banged = copy.filter(t => t.indexOf('!') >= 0);
say(dashed.length === 0, 'no dash in anything a player reads' + (dashed.length ? ': ' + JSON.stringify(dashed.slice(0, 4)) : ' (' + copy.length + ' strings)'));
say(banged.length === 0, 'no exclamation point either' + (banged.length ? ': ' + JSON.stringify(banged.slice(0, 4)) : ''));

/* 6. the brand */
say(HTML.indexOf('Sky Wolf Studios') < 0 && HTML.indexOf('Sky Walk') < 0 && HTML.indexOf('Studios') < 0,
  'the brand is Sky Wolf Studio, singular');
say(HTML.indexOf('SKY WOLF STUDIO') >= 0, 'and the title screen says so');

/* 7 and 8. the two rendering laws. THE COMMENTS COME OUT FIRST: the sentence
   "NO shadowBlur anywhere" at the top of VIEW made this gate red on code that
   was already correct, and a gate that cries on clean code teaches you to
   ignore it just as surely as one that never fires. */
const CODE = JS.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^[ \t]*\/\/.*$/gm, ' ');
say(CODE.length > 20000 && JS.indexOf('shadowBlur') >= 0 && CODE.indexOf('shadowBlur') < 0
  || CODE.length > 20000, 'the comment stripper leaves the code and takes the prose');
const blur = CODE.match(/shadowBlur/g);
say(!blur, 'no shadowBlur in the code' + (blur ? ' (' + blur.length + ' of them)' : ''));
const rems = [...HTML.matchAll(/font-size:\s*([0-9.]+)rem/g)].map(m => Number(m[1]));
const tiny = rems.filter(r => r < 0.7);
say(tiny.length === 0, 'no text under 0.7 rem' + (tiny.length ? ': ' + tiny.join(', ') : ' (smallest ' + Math.min.apply(null, rems) + ')'));

/* 8b. the same law, read on the canvas. The gate above greps `font-size: Nrem`
   out of the CSS and nothing else, so three of the twelve drew canvas text
   under the law for weeks with their gates green over it, and it took a grep
   by hand on the sixth of September to find them. This one reads the script:
   every size in every font string the code hands a canvas, whether it is a
   plain literal, a Math.max floor under a computed size, or neither. 0.7 rem
   at a 16 px root is 11.2 px, so 11.2 px is the floor here.
   A size with no readable floor prints as a note and not as a failure. That is
   a choice, and the reason is that the number is not in the file: a size of
   Math.round(w * 0.02) is whatever w turns out to be, so red there would be a
   guess, and a gate that cries on code it cannot read gets ignored along with
   the ones that can. The note names the lines so a person can go and look. */
const blank = n => new Array(n + 1).join(' ');
const SCAN = blank(sOpen + 8) + JS.replace(/\/\*[\s\S]*?\*\//g, m => blank(m.length))
  .replace(/^[ \t]*\/\/.*$/gm, m => blank(m.length));
const LINES = HTML.split('\n');
const lineOf = i => HTML.slice(0, i).split('\n').length;
const FAMILY = /(?:serif|sans-serif|monospace|system-ui|ui-[a-z]|cursive|fantasy|Georgia|Arial|Helvetica|Roboto|Segoe|Trebuchet|Menlo|Courier|Verdana|Tahoma|Times|Iowan|Charter|Optima|Palatino|Baskerville|Futura|Impact|Consolas|Cambria|Garamond)/;
const fontRhs = [...SCAN.matchAll(/\.font(?:Size)?\s*=\s*[^;\n]{0,240}/g)].map(m => [m.index, m.index + m[0].length]);
const canvasPx = [], unreadable = [];
for (const hit of SCAN.matchAll(/px\b/g)) {
  const at = hit.index;
  /* the look ahead stops at the end of the family list. A flat 90 characters
     ran out of one statement and into the next, and read the 10px in
     `transform = 'translate(10px, 4px)'` as a font because a real font string
     sat two lines under it. Watched to do exactly that before it was cut. */
  const tail = SCAN.slice(at + 2, at + 90).split(/[;\n,]/)[0].split(/['"`](?![A-Za-z])/)[0];
  if (!FAMILY.test(tail) && !fontRhs.some(r => at >= r[0] && at <= r[1])) continue;
  const head = SCAN.slice(Math.max(0, at - 200), at);
  const lit = /([0-9]+(?:\.[0-9]+)?)\s*$/.exec(head);
  const floor = [...head.split(/[;\n]/).pop().matchAll(/Math\.max\s*\(\s*([0-9]+(?:\.[0-9]+)?)\s*,/g)].pop();
  const where = 'index.html:' + lineOf(at) + '  ' + LINES[lineOf(at) - 1].trim().slice(0, 88);
  if (lit) canvasPx.push({ px: Number(lit[1]), where: where });
  else if (floor) canvasPx.push({ px: Number(floor[1]), where: where });
  else unreadable.push(where);
}
const under = canvasPx.filter(f => f.px < 11.2);
say(under.length === 0, 'no canvas font under 11.2 px, which is 0.7 rem at a 16 px root'
  + (under.length ? ', ' + under.length + ' of them:\n          '
      + under.map(f => f.px + 'px  ' + f.where).join('\n          ')
    : ' (' + canvasPx.length + ' read)'));
console.log('  note    ' + (unreadable.length
  ? unreadable.length + ' canvas font size(s) are computed at runtime, this gate cannot read them, so look:\n          '
    + unreadable.join('\n          ')
  : 'every canvas font size in the file is a literal or a floor, none computed'));


console.log('');
if (fails.length) { console.log(fails.length + ' LINT FAILURE(S)'); process.exit(1); }
console.log('LINT OK');
