/* MOON CLAW — node check, no browser.
 *   node satellites/moon-claw/test/check.mjs
 *
 * Two jobs:
 *   1. every inline script block must parse (vm, not a brace counter)
 *   2. the SAVE VALIDATORS must actually reject malformed values. These are
 *      lifted out of index.html by name and run for real, so this file cannot
 *      drift from the shipped code the way a hand mirrored copy would.
 *
 * This script self-tests every run: it feeds a deliberately broken validator
 * through the same assertions and exits 2 if that passes. A probe that cannot
 * fail is not evidence.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, '..', 'index.html');
const html = readFileSync(SRC, 'utf8');

let fails = 0;
const ok = (name, cond, extra) => {
  if (cond) { console.log('  ok   ' + name); }
  else { fails++; console.log('  FAIL ' + name + (extra !== undefined ? '  -> ' + JSON.stringify(extra) : '')); }
};

/* ---------- 1. syntax ---------- */
console.log('script blocks');
{
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
  let m, n = 0, bad = 0;
  while ((m = re.exec(html))) {
    n++;
    try { new vm.Script(m[1]); } catch (e) { bad++; console.log('  FAIL block ' + n + ': ' + e.message); }
  }
  ok('all ' + n + ' inline blocks parse', bad === 0);
  ok('found the blocks at all', n >= 3, n);
}

/* ---------- 2. validators, run for real ---------- */
/* Pull the named functions straight out of the file. If a name disappears the
   extraction fails loudly rather than silently testing nothing. */
function extract(names) {
  const out = [];
  for (const n of names) {
    const i = html.indexOf('function ' + n + '(');
    if (i < 0) throw new Error('validator not found in index.html: ' + n);
    /* walk braces from the first { after the signature */
    let j = html.indexOf('{', i), depth = 0, k = j;
    for (; k < html.length; k++) {
      if (html[k] === '{') depth++;
      else if (html[k] === '}') { depth--; if (depth === 0) break; }
    }
    out.push(html.slice(i, k + 1));
  }
  return out.join('\n');
}

const NEEDED = ['isObj', 'isArray', 'num', 'str', 'fixStats', 'fixShelfRow', 'fixShelf'];
let body;
try { body = extract(NEEDED); }
catch (e) { console.log('  FAIL ' + e.message); process.exit(1); }

function build(src) {
  /* STAT_KEYS lives in index.html as a top level var next to the validators;
     lift it too so fixStats runs against the real key list. */
  const km = html.match(/var STAT_KEYS=\[[^\]]*\];/);
  if (!km) { console.log('  FAIL STAT_KEYS not found in index.html'); process.exit(1); }
  src = km[0] + '\n' + src;
  const ctx = { TYPES: { moth: 1, koi: 1, owl: 1 } };
  vm.createContext(ctx);
  new vm.Script(src + '\n;({isObj,isArray,num,str,fixStats,fixShelfRow,fixShelf});').runInContext(ctx);
  return new vm.Script('({isObj,isArray,num,str,fixStats,fixShelfRow,fixShelf})').runInContext(ctx);
}

/* the assertions. Run twice: once against the shipped validators (must pass),
   once against a gutted stand-in (must fail, or this file proves nothing). */
function assertAll(V, report) {
  const say = report ? ok : (n, c) => { if (!c) say.broke = true; };
  say.broke = false;

  const STAT_KEYS = ['rounds', 'drops', 'grabs', 'sheds', 'koi'];
  const statsFine = v => {
    const s = V.fixStats(v);
    return STAT_KEYS.every(k => typeof s[k] === 'number' && Number.isFinite(s[k]) && s[k] >= 0);
  };
  const shelfFine = v => Array.isArray(V.fixShelf(v));

  /* every one of these used to reach live game code as-is */
  const junk = [null, undefined, 0, 1, -1, '', 'x', '"7"', true, false, [], {}, [1, 2], { lol: true }, NaN, Infinity];
  say('fixStats survives every junk value', junk.every(statsFine));
  say('fixStats keeps a good value', V.fixStats({ rounds: 4, drops: 9, grabs: 2, sheds: 1, koi: 0 }).drops === 9);
  say('fixStats floors a negative', V.fixStats({ rounds: -5 }).rounds === 0, V.fixStats({ rounds: -5 }));
  say('fixStats kills NaN', V.fixStats({ rounds: NaN }).rounds === 0);
  say('fixStats kills a string count', V.fixStats({ rounds: 'lots' }).rounds === 0);

  say('fixShelf always returns an array', junk.every(shelfFine));
  say('fixShelf on an object is empty', V.fixShelf({}).length === 0);
  say('fixShelf on 5 is empty', V.fixShelf(5).length === 0);
  say('fixShelf drops rows with an unknown prize',
    V.fixShelf([{ t: 'nope', d: 'x' }, { t: 'koi', d: '2026-08-16' }]).length === 1);
  say('fixShelf drops non-object rows',
    V.fixShelf([1, 'x', null, { t: 'moth', d: 'd' }]).length === 1);
  say('fixShelf keeps a real prize whole',
    V.fixShelf([{ t: 'koi', d: '2026-08-16', m: 'daily' }])[0].t === 'koi');
  say('fixShelf normalises an unknown mode to free',
    V.fixShelf([{ t: 'moth', d: 'd', m: 'weird' }])[0].m === 'free');
  say('fixShelf caps at 250',
    V.fixShelf(new Array(400).fill({ t: 'moth', d: 'd', m: 'free' })).length === 250);

  say('num rejects a word', V.num('abc', 0) === 0);
  say('num accepts a number string', V.num('12', 0) === 12);
  say('str only returns strings', V.str(7) === '' && V.str('a') === 'a');
  say('isArray tells an array from an object', V.isArray([]) === true && V.isArray({}) === false);
  say('isObj rejects an array', V.isObj([]) === false && V.isObj({}) === true);

  return say.broke;
}

console.log('save validators (extracted from index.html)');
assertAll(build(body), true);

/* ---------- self-test: the assertions must reject a broken validator ---------- */
const gutted = `
function isObj(v){ return true; }
function isArray(v){ return true; }
function num(v,d){ return v; }
function str(v){ return v; }
function fixStats(v){ return v || {}; }          /* the OLD behaviour: pass it through */
function fixShelfRow(r){ return r; }
function fixShelf(v){ return v || []; }          /* the OLD behaviour */
`;
const brokeOnGutted = assertAll(build(gutted), false);
if (!brokeOnGutted) {
  console.log('\nSELF TEST FAILED: the assertions pass against a validator that does nothing.');
  console.log('This check proves nothing. Fix the assertions before trusting a green run.');
  process.exit(2);
}
console.log('  ok   self test: the assertions reject a do-nothing validator');

/* ---------- 3. copy + contract invariants ---------- */
console.log('copy and contract');
{
  /* dashes in player copy: look only at text nodes and button labels */
  const visible = html
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ');
  ok('no em or en dashes in player copy', !/[–—]/.test(visible),
    (visible.match(/.{0,30}[–—].{0,30}/) || [''])[0]);

  ok('SWS_EXIT exists', /window\.SWS_EXIT\s*=/.test(html));
  ok('SWS_EXIT is actually called by a control', /SWS_EXIT\(\)/.test(html.replace(/window\.SWS_EXIT\s*=\s*function/, '')));
  ok('exit is not gated on window.parent alone', /document\.referrer/.test(html));
  ok('ready is posted off real framing, not ?embed=1', /framed\s*=\s*window\.parent!==window/.test(html));
  ok('ready is posted on load too', /addEventListener\('load'[\s\S]{0,120}sws:'ready'/.test(html));
  ok('feedback fab is mounted', /LW_Feedback\.mountFab/.test(html));

  /* the freeze that started this audit: nothing may call unshift on the shelf */
  ok('no raw SHELF.unshift left', !/SHELF\.unshift/.test(html.replace(/\/\*[\s\S]*?\*\//g, '')));
  ok('shelf writes go through the merging writer', /function shelfAdd\(/.test(html));
  ok('stat writes go through the adding writer', /function bumpStats\(/.test(html));
  ok('best scores are written with a max', /function saveBest\(/.test(html));
  ok('the rAF chain is rescheduled outside the try', /catch\(e\)\{[\s\S]{0,600}\}\s*requestAnimationFrame\(frame\);/.test(html));

  /* touch floor: the stage is 540 wide and scales to the viewport, so a
     control must be >= 48 / (375/540) = 69.1 declared px at 375x667 */
  const need = Math.ceil(48 / (375 / 540));
  const mins = [...html.matchAll(/min-height:(\d+)px/g)].map(m => +m[1]);
  ok('every declared min-height clears ' + need + 'px (48 rendered at 375x667)',
    mins.length > 0 && mins.every(v => v >= need), mins);
}

console.log(fails ? '\n' + fails + ' FAILED' : '\nall checks passed');
process.exit(fails ? 1 : 0);
