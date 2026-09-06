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
 *   7. shadowBlur only where there are a handful of things to glow, and never
 *      inside the per segment plant loop (four hundred segments is a slideshow)
 *   8. no font smaller than 0.7 rem
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
try { createScript(JS, { filename: 'doohickey-inline.js' }); }
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
const shellM = SW.match(/const SHELL_VERSION = "doohickey-shell-([^"]+)"/);
say(!!stampM, 'the page names its stamp' + (stampM ? ': ' + stampM[1] : ''));
say(!!regM, 'and the service worker registration uses it');
say(!!shellM && !!stampM && shellM[1] === stampM[1],
  'and sw.js carries the same one' + (shellM ? ': doohickey-shell-' + shellM[1] : ': sw.js has no doohickey-shell version'));
const swOwn = SW.indexOf('doohickey-') >= 0 && SW.indexOf('deepwell') < 0;
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
/* case insensitive: the law is the brand appears and is singular, not that it
   is shouted. Fathom sets it in caps, Doohickey sets it in a serif. */
say(/sky wolf studio/i.test(HTML), 'and a screen the player reaches says so');

/* 7 and 8. the two rendering laws. THE COMMENTS COME OUT FIRST: the sentence
   "NO shadowBlur anywhere" at the top of VIEW made this gate red on code that
   was already correct, and a gate that cries on clean code teaches you to
   ignore it just as surely as one that never fires. */
const CODE = JS.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^[ \t]*\/\/.*$/gm, ' ');
/* the sentinel is a phrase that appears ONLY in a comment. "DETERMINISM IS
   LAW" also appears as a STRING in the test layer, so it survives the stripper
   and the check reads as broken on code that is perfectly correct. */
say(CODE.length > 20000 && CODE.indexOf("the design's words") < 0,
  'the comment stripper leaves the code and takes the prose');
const blur = CODE.match(/shadowBlur/g) || [];
say(blur.length === 0, 'no shadowBlur anywhere: a hundred and twenty bodies is a slideshow with it ('
  + blur.length + ')');
/* the determinism law, as a grep over the shipped file */
const rawA = JS.indexOf('SIM_EXPORT_START'), rawB = JS.indexOf('SIM_EXPORT_END');
const SIM = JS.slice(rawA, rawB).replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^[ \t]*\/\/.*$/gm, ' ');
say(SIM.length > 20000, 'the SIM block is in the shipped file (' + SIM.length + ' characters)');
const banned = ['Math.random', 'Math.sin', 'Math.cos', 'Math.atan2', 'Math.pow', 'Math.exp', 'Math.hypot'];
const found = banned.filter(b => SIM.indexOf(b) >= 0);
say(found.length === 0, 'and it calls no unspecified maths' + (found.length ? ': ' + found.join(', ') : ''));
say(SIM.indexOf('Date.now') < 0 && SIM.indexOf('new Date') < 0 && SIM.indexOf('document.') < 0
  && SIM.indexOf('window.') < 0, 'and it has no clock, no document and no window');
say(SIM.indexOf('Math.sqrt') >= 0, 'and the exactly specified ones are still there');
const rems = [...HTML.matchAll(/font-size:\s*([0-9.]+)rem/g)].map(m => Number(m[1]));
const tiny = rems.filter(r => r < 0.7);
say(tiny.length === 0, 'no text under 0.7 rem' + (tiny.length ? ': ' + tiny.join(', ') : ' (smallest ' + Math.min.apply(null, rems) + ')'));

console.log('');
if (fails.length) { console.log(fails.length + ' LINT FAILURE(S)'); process.exit(1); }
console.log('LINT OK');
