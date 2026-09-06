#!/usr/bin/env node
/* The studio laws, checked against the shipped file.
 *
 *   node tools/lint.mjs
 *
 * A brace counter cannot read this file: the CSS carries parens and braces and
 * the script carries regexes, so the syntax check is `vm.createScript` over the
 * real script block and nothing else.
 *
 * What it asserts, each watched to fail:
 *   1. the script block parses
 *   2. nothing loaded at runtime is a .mjs (this host serves .mjs as text/plain)
 *   3. every local asset the page pulls carries a ?v= stamp
 *   4. the registration, the sw.js shell version and the page stamp match
 *   5. no dash and no exclamation point in anything a player reads
 *   6. the brand is Sky Wolf Studio, singular
 *   7. no shadowBlur, and no text under 0.7 rem in the CSS or on the canvas
 *   8. THE STRIP IS THE CLOCK: the rules layer has no clock, no die, no browser
 *      and no audio node in it, and nothing schedules a note by wall time
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
try { createScript(JS, { filename: 'windup-inline.js' }); }
catch (e) { parsed = false; why = String(e && e.message || e); }
say(parsed, 'the script block parses' + (parsed ? ' (' + JS.split('\n').length + ' lines)' : ': ' + why));

/* 2. no .mjs at runtime */
const runtimeMjs = (HTML.match(/(?:src|href)\s*=\s*"[^"]*\.mjs/g) || []);
say(runtimeMjs.length === 0, 'nothing the page loads is a .mjs' + (runtimeMjs.length ? ': ' + runtimeMjs.join(', ') : ''));

/* 3. every local asset carries a stamp */
const urls = [...HTML.matchAll(/(?:src|href)\s*=\s*"([^"]+)"/g)].map(m => m[1])
  .filter(u => !/^https?:|^data:|^#/.test(u));
const unstamped = urls.filter(u => u.indexOf('?v=') < 0);
say(unstamped.length === 0, 'every local asset carries a ?v= stamp'
  + (unstamped.length ? ': ' + unstamped.join(', ') : ' (' + urls.length + ' of them)'));

/* 4. one stamp, three places */
const stampM = JS.match(/var STAMP = '([^']+)'/);
const regM = JS.match(/register\('\.\/sw\.js\?v=' \+ STAMP\)/);
const shellM = SW.match(/const SHELL_VERSION = "windup-shell-([^"]+)"/);
say(!!stampM, 'the page names its stamp' + (stampM ? ': ' + stampM[1] : ''));
say(!!regM, 'and the service worker registration uses it');
say(!!shellM && !!stampM && shellM[1] === stampM[1],
  'and sw.js carries the same one' + (shellM ? ': windup-shell-' + shellM[1] : ': sw.js has no windup-shell version'));
say(SW.indexOf('windup-') >= 0 && SW.indexOf('airworthy') < 0, 'the worker only ever deletes its own caches');

/* 5. player copy: text nodes in the body, plus every string the code puts on
      the screen through textContent, a toast or a placeholder */
const body = HTML.slice(HTML.indexOf('<body>') >= 0 ? HTML.indexOf('<body>') : 0)
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<style[\s\S]*?<\/style>/g, ' ');
const nodes = body.replace(/<[^>]*>/g, '\n').split('\n')
  .map(t => t.trim()).filter(t => t.length > 1 && !/^&#\d+;$/.test(t));
const attrs = [...body.matchAll(/placeholder\s*=\s*"([^"]*)"/g)].map(m => m[1]);
const jsCopy = [
  ...[...JS.matchAll(/textContent\s*=\s*'([^']*)'/g)].map(m => m[1]),
  ...[...JS.matchAll(/toast\('([^']*)'\)/g)].map(m => m[1]),
  ...[...JS.matchAll(/name:\s*'([A-Z][A-Za-z ]+)'/g)].map(m => m[1])
];
const copy = nodes.concat(attrs).concat(jsCopy);
const dashed = copy.filter(t => /[-‐-―−]/.test(t));
const banged = copy.filter(t => t.indexOf('!') >= 0);
say(dashed.length === 0, 'no dash in anything a player reads'
  + (dashed.length ? ': ' + JSON.stringify(dashed.slice(0, 4)) : ' (' + copy.length + ' strings)'));
say(banged.length === 0, 'no exclamation point either' + (banged.length ? ': ' + JSON.stringify(banged.slice(0, 4)) : ''));

/* 6. the brand */
say(HTML.indexOf('Sky Wolf Studios') < 0 && HTML.indexOf('Studios') < 0,
  'the brand is Sky Wolf Studio, singular');
say(/sky wolf studio/i.test(HTML), 'and a screen the player reaches says so');

/* 7. the two rendering laws */
const CODE = JS.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^[ \t]*\/\/.*$/gm, ' ');
say(CODE.length > 9000 && CODE.indexOf('the pin letting go of the tine') < 0,
  'the comment stripper leaves the code and takes the prose');
const blur = CODE.match(/shadowBlur/g) || [];
say(blur.length === 0, 'no shadowBlur anywhere (' + blur.length + ')');
const rems = [...HTML.matchAll(/font-size:\s*([0-9.]+)rem/g)].map(m => Number(m[1]));
const tiny = rems.filter(r => r < 0.7);
say(tiny.length === 0, 'no text under 0.7 rem' + (tiny.length ? ': ' + tiny.join(', ') : ' (smallest ' + Math.min.apply(null, rems) + ')'));

/* 8b. the same law, read on the canvas. The gate above greps `font-size: Nrem`
   out of the CSS and nothing else, so this game drew canvas labels at 11 px
   for weeks with its gate green over them, and it took a grep by hand on the
   sixth of September to find them. This one reads the script: every size in
   every font string the code hands a canvas, whether it is a plain literal, a
   Math.max floor under a computed size, or neither. 0.7 rem at a 16 px root is
   11.2 px, so 11.2 px is the floor here.
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


/* 8. THE STRIP IS THE CLOCK */
const rawA = JS.indexOf('SIM_EXPORT_START'), rawB = JS.indexOf('SIM_EXPORT_END');
const SIM = JS.slice(rawA, rawB).replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^[ \t]*\/\/.*$/gm, ' ');
say(SIM.length > 6000, 'the rules block is in the shipped file (' + SIM.length + ' characters)');
say(SIM.indexOf('Math.random') < 0, 'the rules never roll an unseeded die');
say(SIM.indexOf('document.') < 0 && SIM.indexOf('window.') < 0,
  'and they have no document and no window');
say(SIM.indexOf('Date.now') < 0 && SIM.indexOf('new Date') < 0, 'and no clock');
say(SIM.indexOf('createOscillator') < 0 && SIM.indexOf('AudioContext') < 0
  && SIM.indexOf('currentTime') < 0, 'and no audio node and no context time');
const canPunches = (SIM.match(/function canPunch\(/g) || []).length;
say(canPunches === 1, 'and there is exactly one rule about where a hole may go (' + canPunches + ')');
/* ⛔ NOTHING SCHEDULES A NOTE BY WALL TIME, which is the law. Counting timers
   was the first way this was written and it cried on correct code the moment
   the exporter needed one to stop a recording and one to revoke a blob URL: a
   count is a proxy for the law, not the law. What matters is what a timer DOES,
   so this reads the body of every one of them. */
const timers = [...CODE.matchAll(/set(?:Timeout|Interval)\s*\(/g)];
const noteTimers = timers.filter(m => CODE.slice(m.index, m.index + 260).indexOf('tine(') >= 0);
say(noteTimers.length === 0,
  'no timer anywhere fires a note (' + timers.length + ' timers, ' + noteTimers.length + ' of them touching a tine)');
say(timers.length <= 10, 'and the page has not filled up with them (' + timers.length + ')');
/* ⛔ no space before the paren. With `\s*` in it this matched the PROSE of an
   assertion, "far enough apart for the tine (2 steps)", and reported the game
   as broken while it was perfectly correct. */
const tineCalls = [...CODE.matchAll(/\btine\(/g)];
const badTine = [...CODE.matchAll(/\btine\(([^)]*)\)/g)]
  .filter(m => m[1].split(',').length < 3);
say(tineCalls.length > 0 && badTine.length === 0,
  'and every note is fired at a time it was TOLD, never at whenever it ran ('
  + tineCalls.length + ' calls)');

console.log('');
if (fails.length) { console.log(fails.length + ' LINT FAILURE(S)'); process.exit(1); }
console.log('LINT OK');
