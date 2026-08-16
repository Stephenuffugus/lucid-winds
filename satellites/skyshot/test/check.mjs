/* SKYSHOT — node check, no browser.
 *   node satellites/skyshot/test/check.mjs
 *
 * Parses every inline block with vm, then lifts the save validators out of
 * index.html by name and runs them for real against malformed values. Self
 * tests every run against a do-nothing validator and exits 2 if that passes,
 * because a probe that cannot fail is not evidence.
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

function extract(names) {
  const out = [];
  for (const n of names) {
    const i = html.indexOf('function ' + n + '(');
    if (i < 0) throw new Error('not found in index.html: ' + n);
    let k = html.indexOf('{', i), depth = 0;
    for (; k < html.length; k++) { if (html[k] === '{') depth++; else if (html[k] === '}') { depth--; if (!depth) break; } }
    out.push(html.slice(i, k + 1));
  }
  return out.join('\n');
}
const NEEDED = ['_plain', '_numMap', '_num'];
let body;
try { body = extract(NEEDED); } catch (e) { console.log('  FAIL ' + e.message); process.exit(1); }

function build(src) {
  const ctx = {}; vm.createContext(ctx);
  new vm.Script(src).runInContext(ctx);
  return new vm.Script('({_plain,_numMap,_num})').runInContext(ctx);
}
/* the shape readProg() promises the rest of the file */
function readProgWith(V, raw) {
  const p = V._plain(raw) || {};
  return { stars: V._numMap(p.stars, 3), best: V._numMap(p.best), pollen: V._num(p.pollen, 0),
           moments: V._numMap(p.moments, 1), daily: V._numMap(p.daily, 3), plays: V._num(p.plays, 0) };
}
function assertAll(V, report) {
  const say = report ? ok : (n, c) => { if (!c) say.broke = true; };
  say.broke = false;
  /* the one that froze the game: PROG.stars[idx]=3 on a primitive, in strict mode */
  const writable = o => { try { o['9'] = 3; return o['9'] === 3; } catch (e) { return false; } };
  const junk = [null, undefined, 0, 1, 'x', '"7"', true, false, [], {}, NaN,
                { stars: 'x', moments: 1, daily: true, pollen: 5 },
                { stars: null }, { stars: 7 }, { moments: 'abc' }, { daily: [] }];
  say('every field is a writable plain object for all junk',
    junk.every(j => { const p = readProgWith(V, j);
      return writable(p.stars) && writable(p.moments) && writable(p.daily) && writable(p.best); }));
  say('pollen and plays are always numbers',
    junk.every(j => { const p = readProgWith(V, j);
      return Number.isFinite(p.pollen) && Number.isFinite(p.plays) && p.pollen >= 0 && p.plays >= 0; }));
  say('good stars survive', readProgWith(V, { stars: { 0: 3, 1: 2 } }).stars['0'] === 3);
  say('stars are capped at 3', readProgWith(V, { stars: { 0: 99 } }).stars['0'] === 3);
  say('a string star is dropped', readProgWith(V, { stars: { 0: 'gold' } }).stars['0'] === undefined);
  say('a zero star is dropped so the unlock chain stays honest',
    readProgWith(V, { stars: { 0: 0 } }).stars['0'] === undefined);
  say('a string pollen becomes 0', readProgWith(V, { pollen: 'lots' }).pollen === 0);
  say('a negative pollen becomes 0', readProgWith(V, { pollen: -9 }).pollen === 0);
  say('an array is not a plain object', V._plain([]) === null && V._plain({}) !== null);
  return say.broke;
}
console.log('save validators (extracted from index.html)');
assertAll(build(body), true);

const gutted = `function _plain(v){return v||{};}
function _numMap(v,m){return v||{};}
function _num(v,d){return v;}`;
if (!assertAll(build(gutted), false)) {
  console.log('\nSELF TEST FAILED: the assertions pass against validators that do nothing.');
  process.exit(2);
}
console.log('  ok   self test: the assertions reject do-nothing validators');

console.log('copy and contract');
{
  const visible = html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<script[\s\S]*?<\/script>/g, '')
                      .replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ');
  ok('no em or en dashes in player copy', !/[–—]/.test(visible), (visible.match(/.{0,30}[–—].{0,30}/) || [''])[0]);
  ok('SWS_EXIT exists', /window\.SWS_EXIT\s*=/.test(html));
  ok('something calls SWS_EXIT', /SWS_EXIT\(\)/.test(html.replace(/window\.SWS_EXIT\s*=\s*function/, '')));
  ok('exit has the referrer fallback', /document\.referrer/.test(html));
  ok('ready is posted off real framing', /framed\s*=\s*window\.parent!==window/.test(html));
  ok('ready is posted on load too', /addEventListener\('load'[\s\S]{0,120}sws:'ready'/.test(html));
  ok('feedback fab is mounted', /LW_Feedback\.mountFab/.test(html));
  ok('saveProg merges rather than overwriting', /function saveProg\(\)\{[\s\S]{0,80}readProg\(\)/.test(html));
  ok('the wipe bypasses the merge', /NOT saveProg\(\)/.test(html));
  ok('finish is called through the safe wrapper', /safeFinish\(\);/.test(html) && !/looping=false; finish\(\)/.test(html));
  ok('the loss screen has a coaching line', /function missNote\(/.test(html));
  ok('the daily card no longer claims once a day', !/once a day/.test(visible), (visible.match(/.{0,40}once a day.{0,20}/) || [''])[0]);

  /* touch floor: stage 540 wide, scale 375/540 at the reference phone */
  const need = Math.ceil(48 / (375 / 540));
  const mins = [...html.matchAll(/min-height:(\d+)px/g)].map(m => +m[1]);
  const sq = [...html.matchAll(/\.hbtn\{width:(\d+)px; height:(\d+)px/g)].flatMap(m => [+m[1], +m[2]]);
  ok('declared min-heights clear ' + need + 'px', mins.length && mins.every(v => v >= need), mins);
  ok('the hud buttons clear ' + need + 'px', sq.length && sq.every(v => v >= need), sq);
}

console.log(fails ? '\n' + fails + ' FAILED' : '\nall checks passed');
process.exit(fails ? 1 : 0);
