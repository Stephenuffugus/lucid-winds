/* FTW wire-corpus lint — holds every corpus batch to the WIRE-ENGINE-SPEC
   contract before it can ship. CJS on purpose: check.js require()s it, and
   `node scripts/wire_lint.js [files...]` runs it standalone (default: the
   shipped wire-corpus.js plus any wire-batches/*.js).
   A probe that cannot fail is not evidence: run with WIRE_LINT_SELFTEST=1 to
   watch a corrupted entry go red. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const GAME_DIR = path.join(__dirname, '..', 'satellites', 'flock-the-world');

/* the whole legal schema — writers get nothing more */
const ENTRY_KEYS = ['id', 'lane', 't', 'when', 'arc', 'wt', 'cd', 'once', 'cls'];
const WHEN_KEYS = ['owned', 'notOwned', 'tree', 'doctrine', 'mode', 'diffMin', 'dayMin',
  'subj', 'ovr', 'sus', 'warHeat', 'bloc', 'pstate', 'econRun', 'fdPages', 'lostMin', 'crackWithin'];
const TREES = ['dep', 'cap', 'inf', 'war'];
const DOCTRINES = ['glove', 'fist'];
const MODES = ['CONTRACTOR', 'DEEPSTATE', 'CRISIS'];
const DIFFS = ['Startup', 'Vendor', 'Incumbent'];
const PSTATES = ['murmur', 'peaceful', 'violent', 'uprising'];
const CLS = ['', 'good', 'bad', 'crit', 'res'];
const SLOTS = ['country', 'region', 'hq', 'rnd_country'];
/* the dash law, same shape the game copy is held to: em, en, or a spaced
   hyphen used as a dash. Compound hyphens (all-time) stay legal. */
const DASHES = /[–—]| - /;
/* composites of patterns, citations of NOTHING — word-boundary matches on
   names that must never appear. Conservative list; the reviewer still reads. */
const REAL_NAMES = ['google', 'amazon', 'facebook', 'instagram', 'apple', 'microsoft',
  'palantir', 'tesla', 'musk', 'zuckerberg', 'bezos', 'trump', 'biden', 'obama', 'putin',
  'netanyahu', 'zelensky', 'nato', 'fbi', 'cia', 'nsa', 'kgb', 'mossad', 'tiktok',
  'twitter', 'youtube', 'openai', 'anthropic', 'clearview', 'axon', 'flock safety'];

/* pull the truth (node ids, region ids) from the live game, never a hand list */
function gameRoster() {
  const src = fs.readFileSync(path.join(GAME_DIR, 'index.html'), 'utf8');
  let i = 0, best = '';
  for (;;) {
    const a = src.indexOf('<script', i);
    if (a < 0) break;
    const gt = src.indexOf('>', a), b = src.indexOf('</script>', gt);
    if (b < 0) break;
    const body = src.slice(gt + 1, b);
    if (body.length > best.length) best = body;
    i = b + 9;
  }
  const stub = () => ({ classList: { contains: () => false, add() {}, remove() {}, toggle() {} }, style: {}, innerHTML: '', textContent: '', querySelector: () => null, querySelectorAll: () => [], appendChild() {}, addEventListener() {}, dataset: {}, getBoundingClientRect: () => ({ width: 100, height: 100 }), setAttribute() {}, scrollIntoView() {} });
  const ctx = { console, Math, Date, JSON, performance,
    setInterval: () => 0, clearInterval() {}, setTimeout: () => 0, clearTimeout() {},
    requestAnimationFrame: () => 0, cancelAnimationFrame() {}, devicePixelRatio: 1,
    window: { addEventListener() {} },
    document: { getElementById: stub, querySelectorAll: () => [], querySelector: stub, createElement: stub, addEventListener() {}, body: stub(), head: stub() } };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(best, ctx);
  return {
    nodes: new Set(vm.runInContext('NODES.map(n=>n.id)', ctx)),
    regions: new Set(vm.runInContext('REGIONS.map(r=>r.id)', ctx)),
  };
}

function loadCorpus(file) {
  const src = fs.readFileSync(file, 'utf8');
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(src, ctx, { filename: file });
  const arr = ctx.window.WIRE_CORPUS || ctx.window.WIRE_BATCH;
  if (!Array.isArray(arr)) throw new Error('file sets neither window.WIRE_CORPUS nor window.WIRE_BATCH to an array');
  return arr;
}

function band(v) { return Array.isArray(v) && v.length === 2 && v.every(x => typeof x === 'number') && v[0] <= v[1]; }

function lintEntries(entries, roster, label) {
  const errs = [];
  const err = (id, m) => errs.push(`${label} :: ${id} :: ${m}`);
  const ids = new Set();
  const arcs = {};
  entries.forEach((w, idx) => {
    const id = (w && w.id) || `#${idx}`;
    if (!w || typeof w !== 'object') return err(id, 'not an object');
    for (const k of Object.keys(w)) if (!ENTRY_KEYS.includes(k)) err(id, `illegal key "${k}"`);
    if (typeof w.id !== 'string' || !/^[a-z0-9_]{3,63}$/.test(w.id)) err(id, 'id must be [a-z0-9_], 3-63 chars');
    else if (ids.has(w.id)) err(id, 'duplicate id'); else ids.add(w.id);
    if (typeof w.lane !== 'string' || !w.lane) err(id, 'lane required');
    if (typeof w.t !== 'string' || w.t.length < 40 || w.t.length > 340) err(id, `t must be 40-340 chars (got ${w.t ? w.t.length : 0})`);
    else {
      if (DASHES.test(w.t)) err(id, 'dash law: em/en dash or spaced hyphen in player copy');
      const low = ' ' + w.t.toLowerCase() + ' ';
      for (const name of REAL_NAMES) if (new RegExp('\\b' + name.replace(/ /g, '\\s+') + '\\b').test(low)) err(id, `real name "${name}" — composites cite nothing`);
      for (const m of w.t.matchAll(/\{([a-z_]+)\}/g)) if (!SLOTS.includes(m[1])) err(id, `unknown slot {${m[1]}} (legal: ${SLOTS.join(', ')})`);
      if (/oversight|coalition/i.test(w.t)) err(id, 'write "Patriotism": ovrTxt pipes the mode name, never hand-write oversight/Coalition');
    }
    if (w.wt != null && !(typeof w.wt === 'number' && w.wt >= 1 && w.wt <= 20)) err(id, 'wt must be 1-20');
    if (w.once && w.once !== true) err(id, 'once must be true when present');
    if (!w.once && w.cd != null && !(typeof w.cd === 'number' && w.cd >= 60 && w.cd <= 2000)) err(id, 'cd must be 60-2000 days (or use once:true)');
    if (w.cls != null && !CLS.includes(w.cls)) err(id, `cls must be one of ${JSON.stringify(CLS)}`);
    if (w.arc != null) {
      if (typeof w.arc.chain !== 'string' || !/^[a-z0-9_]{2,40}$/.test(w.arc.chain)) err(id, 'arc.chain must be [a-z0-9_]');
      if (!Number.isInteger(w.arc.step) || w.arc.step < 1 || w.arc.step > 20) err(id, 'arc.step must be int 1-20');
      if (w.arc.gap != null && !(typeof w.arc.gap === 'number' && w.arc.gap >= 20 && w.arc.gap <= 400)) err(id, 'arc.gap must be 20-400');
      const key = w.arc.chain;
      arcs[key] = arcs[key] || new Set();
      if (arcs[key].has(w.arc.step)) err(id, `duplicate step ${w.arc.step} in chain "${key}"`);
      arcs[key].add(w.arc.step);
    }
    const q = w.when;
    if (q != null) {
      if (typeof q !== 'object') { err(id, 'when must be an object'); return; }
      for (const k of Object.keys(q)) if (!WHEN_KEYS.includes(k)) err(id, `illegal when key "${k}"`);
      for (const listKey of ['owned', 'notOwned']) if (q[listKey] != null) {
        if (!Array.isArray(q[listKey]) || !q[listKey].length) err(id, `${listKey} must be a non-empty array`);
        else for (const nid of q[listKey]) if (!roster.nodes.has(nid)) err(id, `${listKey}: unknown node id "${nid}"`);
      }
      if (q.tree != null) for (const t of Object.keys(q.tree)) {
        if (!TREES.includes(t)) err(id, `tree: unknown tree "${t}"`);
        else if (!Number.isInteger(q.tree[t]) || q.tree[t] < 1 || q.tree[t] > 14) err(id, `tree.${t} must be int 1-14`);
      }
      if (q.doctrine != null && !DOCTRINES.includes(q.doctrine)) err(id, 'doctrine must be glove|fist');
      if (q.mode != null && !MODES.includes(q.mode)) err(id, `mode must be ${MODES.join('|')}`);
      if (q.diffMin != null && !DIFFS.includes(q.diffMin)) err(id, `diffMin must be ${DIFFS.join('|')}`);
      if (q.bloc != null && !roster.regions.has(q.bloc)) err(id, `bloc: unknown region "${q.bloc}"`);
      if (q.pstate != null && !PSTATES.includes(q.pstate)) err(id, `pstate must be ${PSTATES.join('|')}`);
      for (const b of ['subj', 'ovr', 'sus', 'warHeat']) if (q[b] != null && !band(q[b])) err(id, `${b} must be [lo,hi] with lo<=hi`);
      if (q.subj != null && band(q.subj) && q.subj[1] > 1) err(id, 'subj band is 0-1 (fractions)');
      if (q.warHeat != null && band(q.warHeat) && q.warHeat[1] > 1) err(id, 'warHeat band is 0-1');
      for (const n of ['dayMin', 'econRun', 'fdPages', 'lostMin', 'crackWithin']) if (q[n] != null && !(typeof q[n] === 'number' && q[n] >= 0)) err(id, `${n} must be a number >= 0`);
    }
  });
  /* arcs must be contiguous from step 1 or the tail is unreachable forever */
  for (const chain of Object.keys(arcs)) {
    const steps = [...arcs[chain]].sort((a, b) => a - b);
    for (let i = 0; i < steps.length; i++) if (steps[i] !== i + 1) { errs.push(`${label} :: chain "${chain}" :: steps not contiguous from 1 (${steps.join(',')})`); break; }
  }
  return errs;
}

function lintFiles(files) {
  const roster = gameRoster();
  let all = [];
  for (const f of files) {
    try { all = all.concat(lintEntries(loadCorpus(f), roster, path.basename(f))); }
    catch (e) { all.push(`${path.basename(f)} :: file :: ${e.message}`); }
  }
  return all;
}

module.exports = { lintFiles, lintEntries, gameRoster, loadCorpus };

if (require.main === module) {
  let files = process.argv.slice(2);
  if (!files.length) {
    files = [path.join(GAME_DIR, 'wire-corpus.js')];
    const bdir = path.join(GAME_DIR, 'wire-batches');
    if (fs.existsSync(bdir)) for (const f of fs.readdirSync(bdir)) if (f.endsWith('.js')) files.push(path.join(bdir, f));
  }
  const errs = lintFiles(files);
  if (process.env.WIRE_LINT_SELFTEST === '1') {
    const roster = gameRoster();
    const bad = lintEntries([{ id: 'X BAD', lane: '', t: 'too short — dash', when: { owned: ['nope'], junk: 1 }, cls: 'loud' }], roster, 'selftest');
    console.log(`selftest: ${bad.length} errors caught on a corrupt entry (must be > 4): ${bad.length > 4 ? 'ok' : 'FAIL'}`);
    if (bad.length <= 4) process.exit(2);
  }
  if (errs.length) { console.log('WIRE LINT FAILED'); errs.forEach(e => console.log('  - ' + e)); process.exit(1); }
  console.log(`wire lint clean (${files.length} file${files.length === 1 ? '' : 's'})`);
}
