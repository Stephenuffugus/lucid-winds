/* BUDBURST — node check, no browser.
 *   node satellites/budburst/test/check.mjs
 *
 * Parses every inline block with vm, lifts the shape validators out of
 * index.html by name and runs them against malformed values, and asserts the
 * boot-order and copy invariants that the browser suite cannot see.
 * Self tests every run and exits 2 if the assertions pass against validators
 * that do nothing.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(HERE, '..', 'index.html'), 'utf8');
let fails = 0;
const ok = (n, c, x) => { if (c) console.log('  ok   ' + n); else { fails++; console.log('  FAIL ' + n + (x !== undefined ? '  -> ' + JSON.stringify(x) : '')); } };

console.log('script blocks');
{
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
  let m, n = 0, bad = 0;
  while ((m = re.exec(html))) { n++; try { new vm.Script(m[1]); } catch (e) { bad++; console.log('  FAIL block ' + n + ': ' + e.message); } }
  ok('all ' + n + ' inline blocks parse', bad === 0);
  ok('found the blocks', n >= 3, n);
}

/* ---------- validators, run for real ---------- */
function grab(sig) {
  const i = html.indexOf(sig);
  if (i < 0) throw new Error('not found in index.html: ' + sig);
  let k = html.indexOf('{', i + sig.length - 1), depth = 0;
  for (; k < html.length; k++) { if (html[k] === '{') depth++; else if (html[k] === '}') { depth--; if (!depth) break; } }
  return html.slice(i, k + 1);
}
let src;
try {
  src = [
    'const isPlain=' + (html.match(/const isPlain=(v=>[^;]+);/) || [])[1] + ';',
    grab('function numMap(')
  ].join('\n');
  if (!/const isPlain=v=>/.test(src)) throw new Error('isPlain not found in index.html');
} catch (e) { console.log('  FAIL ' + e.message); process.exit(1); }

/* getMissions' shape gate, mirrored from the file by EXTRACTING its own
   predicate text so a change to the game must be reflected here or this fails */
const gateSrc = (html.match(/const ok\s*=\s*isPlain\(m\)[\s\S]*?;\n/) || [])[0];
ok('the missions shape gate is present in index.html', !!gateSrc);

function build(s) {
  const ctx = {}; vm.createContext(ctx);
  new vm.Script(s).runInContext(ctx);
  return new vm.Script('({isPlain,numMap})').runInContext(ctx);
}
function assertAll(V, report) {
  const say = report ? ok : (n, c) => { if (!c) say.broke = true; };
  say.broke = false;
  const writable = o => { try { o['z'] = 1; return o['z'] === 1; } catch (e) { return false; } };
  const junk = [null, undefined, 0, 1, 'x', true, false, [], {}, NaN, [1, 2], 'nope'];
  say('numMap always returns a writable plain object', junk.every(j => writable(V.numMap(j, 3))));
  say('numMap keeps good numbers', V.numMap({ '0-0': 3, '0-1': 1 }, 3)['0-0'] === 3);
  say('numMap caps at the ceiling', V.numMap({ a: 99 }, 3).a === 3);
  say('numMap drops a string value', V.numMap({ a: 'gold' }, 3).a === undefined);
  say('numMap drops zero and negative', V.numMap({ a: 0, b: -2 }, 3).a === undefined && V.numMap({ a: 0, b: -2 }, 3).b === undefined);
  say('numMap on an array yields nothing useful but does not throw', writable(V.numMap([1, 2], 3)));
  say('isPlain rejects arrays and primitives',
    V.isPlain([]) === false && V.isPlain('x') === false && V.isPlain(null) === false && V.isPlain({}) === true);
  return say.broke;
}
console.log('shape validators (extracted from index.html)');
assertAll(build(src), true);
const gutted = `const isPlain=v=>true;\nfunction numMap(v,c){return v||{};}`;
if (!assertAll(build(gutted), false)) {
  console.log('\nSELF TEST FAILED: the assertions pass against validators that do nothing.');
  process.exit(2);
}
console.log('  ok   self test: the assertions reject do-nothing validators');

/* ---------- boot order, contract, copy ---------- */
console.log('boot order and contract');
{
  /* strip comments first: a comment that EXPLAINS the old order otherwise
     reads as the old order (the sw_purge_audit lesson) */
  const boot = html.slice(html.indexOf('if(!Store.g(K.owned))'))
                   .replace(/\/\*[\s\S]*?\*\//g, '')
                   .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  const iRaf = boot.indexOf('requestAnimationFrame(frame)');
  const iMenu = boot.indexOf('refreshMenu()');
  ok('the game loop starts BEFORE the menu is painted', iRaf > -1 && iMenu > -1 && iRaf < iMenu, { iRaf, iMenu });
  ok('painting the menu is allowed to fail', /try\{\s*refreshMenu\(\);\s*\}\s*catch/.test(boot));
  ok('SWS_EXIT exists', /window\.SWS_EXIT\s*=/.test(html));
  ok('something calls SWS_EXIT', /SWS_EXIT\(\)/.test(html.replace(/window\.SWS_EXIT\s*=\s*function/, '')));
  ok('exit has the referrer fallback', /document\.referrer/.test(html));
  ok('the player is told when storage is blocked', /Storage is blocked/.test(html));
  ok('every JSON read goes through the repairing reader',
    !/JSON\.parse\(Store\.g\(K\.(abil|boost|pzProg|prog)\)/.test(html));
  ok('the NEXT hit rect is floored at 48', /const NEXT_HIT=48;/.test(html) && /Math\.max\(NEXT_HIT/.test(html));

  const visible = html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<script[\s\S]*?<\/script>/g, '')
                      .replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ');
  ok('no em or en dashes in player markup', !/[–—]/.test(visible), (visible.match(/.{0,30}[–—].{0,30}/) || [''])[0]);
  /* budburst is full viewport, so a declared px IS a rendered px */
  const mins = [...html.matchAll(/min-height:(\d+)px/g)].map(m => +m[1]);
  ok('every declared min-height is at least 48px', mins.length && mins.every(v => v >= 48), mins.filter(v => v < 48));
}

console.log(fails ? '\n' + fails + ' FAILED' : '\nall checks passed');
process.exit(fails ? 1 : 0);
