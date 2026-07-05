/* Shared test harness: loads the single-file game in a headless (stubbed-DOM) VM
 * and exposes its internal functions/data for testing. Used by stress.js + validate.js.
 *
 * WHY THIS EXISTS: the game ships as ONE self-contained .html file with all JS inline.
 * To test the combat/tree logic in Node we extract the <script> block, append an export
 * line, and run it in a vm context with just enough DOM stubs that boot()/render() don't
 * throw. The game's own code is never modified.
 */
const fs = require('fs');
const vm = require('vm');
const path = require('path');

function gameFilePath() {
  // priority: CLI arg -> env -> default sibling of repo root
  return process.argv[2] || process.env.LWA_FILE ||
    path.resolve(__dirname, '..', 'lucid-winds-arena.html');
}

function fakeEl() {
  return {
    innerHTML: '', value: '', offsetWidth: 1,
    style: new Proxy({}, { get: () => '', set: () => true }),
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {},
    viewBox: { baseVal: { width: 100, height: 100 } },
    setAttribute() {}, getAttribute() { return null; }, removeAttribute() {},
    appendChild() {}, remove() {}, addEventListener() {}, setPointerCapture() {},
    querySelector() { return null; }, querySelectorAll() { return []; },
    getBoundingClientRect() { return { left: 0, top: 0, width: 300, height: 300 }; },
  };
}

// The internal identifiers we surface for tests. All exist at top-level script scope.
const EXPORTS = [
  'RACES','POWERS','AUGMENTS','RARITY','rarByKey','ASCENDANCIES','ASC_BY_KEY','JEWELS','JEWEL_BY_KEY','TREE','STAND_ARCHETYPES','STAT_KEYS','TIERS','ARMS',
  'BUFF_BASE','NOTABLES','KEYSTONES','PROC_BASE',
  'simulate','deriveCombat','computeFinal','ocStats','aggregateMods','migrateOC','hitDamage',
  'clamp','rand','randInt','pick','tierIndex','tierMult',
  'xpNeeded','pointsTotal','pointsSpent','pointsAvail','grantXP','canRefund','keystonesOf',
  'powerByKey','raceByKey','augByKey','standByKey','isAugmentable',
];

function loadGame(htmlPath) {
  htmlPath = htmlPath || gameFilePath();
  const html = fs.readFileSync(htmlPath, 'utf8');
  const m = html.match(/<script>([\s\S]*)<\/script>/);
  if (!m) throw new Error('No <script> block found in ' + htmlPath);
  const js = m[1] + '\n;globalThis.__API={' + EXPORTS.join(',') + '};';

  const doc = {
    getElementById: () => fakeEl(), querySelector: () => null, querySelectorAll: () => [],
    addEventListener() {}, createElement: () => fakeEl(), body: fakeEl(),
  };
  const win = {
    storage: null, scrollTo() {}, scrollY: 0, addEventListener() {},
    matchMedia: () => ({ matches: false }), requestAnimationFrame: () => 0,
  };
  const ctx = {
    document: doc, window: win,
    localStorage: { getItem: () => null, setItem() {} },
    performance: { now: () => 0 }, console,
    setTimeout: () => 0, clearTimeout: () => {}, requestAnimationFrame: () => 0,
    Math, JSON, Date, parseInt, parseFloat, isFinite, isNaN,
  };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(js, ctx, { filename: path.basename(htmlPath) + '#inline-script' });
  return ctx.__API;
}

/* ---- shared random-build generators (used by both test suites) ---- */
function frontier(TREE, allocated) {
  const set = allocated instanceof Set ? allocated : new Set(allocated);
  const f = new Set();
  for (const id of set) {
    const n = TREE.byId[id]; if (!n) continue;
    for (const nb of n.neighbors) if (!set.has(nb)) f.add(nb);
  }
  return [...f];
}

function randomAlloc(API, oc) {
  const budget = API.pointsTotal(oc);
  const alloc = new Set(oc.tree.allocated);
  for (let i = 0; i < budget; i++) {
    const f = frontier(API.TREE, alloc);
    if (!f.length) break;
    alloc.add(API.pick(f));
  }
  oc.tree.allocated = [...alloc];
}

function randomOC(API, opts) {
  opts = opts || {};
  const race = opts.race || API.pick(API.RACES).key;
  const baseStats = {};
  for (const k of API.STAT_KEYS) {
    baseStats[k] = opts.extreme === 'max' ? 140 : opts.extreme === 'min' ? 1 : API.randInt(1, 140);
  }
  const powers = [];
  const chosen = new Set();
  const n = opts.powerCount != null ? opts.powerCount : API.randInt(0, 6);
  for (let i = 0; i < n; i++) {
    const p = API.pick(API.POWERS);
    if (chosen.has(p.key)) continue;
    chosen.add(p.key);
    const tier = API.pick(API.TIERS).key;
    const aug = [];
    if (p.effect === 'proc') {
      const cap = API.tierIndex(tier) + 1;
      // Fuzz augment GRADES uniformly (~1/7 Cosmic) so stress hammers the max
      // rarity-scaling case, not just the realistic weighted odds.
      for (let s = 0; s < cap; s++) if (Math.random() < 0.7) aug.push({ key: API.pick(API.AUGMENTS).key, grade: API.pick(API.RARITY).key });
    }
    powers.push({ key: p.key, tier, effect: p.effect, augments: aug });
  }
  if (race === 'stand_user' || Math.random() < 0.15) {
    const arch = API.pick(API.STAND_ARCHETYPES).key;
    const tier = API.pick(API.TIERS).key;
    const cap = API.tierIndex(tier) + 1;
    const aug = [];
    for (let s = 0; s < cap; s++) if (Math.random() < 0.6) aug.push({ key: API.pick(API.AUGMENTS).key, grade: API.pick(API.RARITY).key });
    powers.push({ key: 'stand', arch, tier, effect: 'stand', augments: aug });
  }
  const oc = {
    id: 't' + Math.random().toString(36).slice(2), name: 'T' + API.randInt(1, 999),
    race, baseStats, powers, record: { w: 0, l: 0 },
    level: opts.level || API.randInt(1, 50), xp: 0, tree: { allocated: [] },
  };
  API.migrateOC(oc);
  // fuzz an ascendancy (subclass + a random subset of its nodes) to stress the
  // ascendancy effects incl. their keystone downsides
  if (API.ASCENDANCIES && Math.random() < 0.5) {
    const asc = API.pick(API.ASCENDANCIES);
    oc.ascendancy = { key: asc.key, allocated: asc.nodes.filter(() => Math.random() < 0.6).map(n => n.id) };
  }
  if (!opts.noTree) randomAlloc(API, oc);
  // fuzz jewels into allocated jewel-socket nodes (random jewel + grade)
  if (API.JEWELS && oc.tree.allocated) {
    oc.tree.jewels = oc.tree.jewels || {};
    for (const id of oc.tree.allocated) {
      const n = API.TREE.byId[id];
      if (n && n.type === 'jewel' && Math.random() < 0.7) {
        oc.tree.jewels[id] = { key: API.pick(API.JEWELS).key, grade: API.pick(API.RARITY).key };
      }
    }
  }
  return oc;
}

module.exports = { loadGame, gameFilePath, frontier, randomAlloc, randomOC };
