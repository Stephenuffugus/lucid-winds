/* Dewball forge, step 1: THE MANIFEST. Spends nothing.
 *
 *   node satellites/dewball/tools/forge/manifest.mjs            -> MESHY-MANIFEST.md + manifest.json
 *   node satellites/dewball/tools/forge/manifest.mjs --check    -> exit 1 if the committed files are stale
 *
 * Every number here comes out of the REAL engine (node_harness.js boots index.html and
 * builds each world exactly as a phone would), never out of a table typed into this
 * file. The plan's own "195 kinds" was a hand count and the code holds 286; that is
 * the whole argument for reading the engine. (Tuning law: never hand-mirror.)
 *
 * What it decides, per kind:
 *   ROLE   landmark (lm*, fixed) | mover (PROPS.mover) | keepsake (an instance with keep) |
 *          gate prize (the biggest kind behind each gate) | set anchor (the biggest item of
 *          each hand placed scene) | wall | building | food
 *   TIER   A = any of the first five roles; B = big food, at or above a third of its
 *          world's goal; C = between a tenth of the start and a third of the goal;
 *          D = under a tenth of the start (plan 4.3, literal). Highest tier over all worlds.
 *   BUDGET plan 4.4 (triangles, texture px), by tier and role.
 *   CREDIT the first world in play order that uses it carries its cost (plan 4.3).
 *   ORDER  a spend order inside each tier: what a player sees most, first.
 *   FLAT   the thinnest bounding axis under 15% of the longest: Meshy inflates flat
 *          things, so these are flagged (fit with --axis/--flip or keep procedural).
 */
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const GAME = path.resolve(HERE, '..', '..');
const H = require(path.join(GAME, 'node_harness.js'));

const CREDITS_PER_KIND = 35;            /* plan 4.2: ~32 measured on ripcord + one re roll in four */
const PLAY_ORDER = ['w1', 'w2', 'w3', 'w4', 'w5', 'w7', 'w6'];
const BUDGET = {                         /* plan 4.4 */
  landmark: { tris: 4000, tex: 1024 },
  anchor:   { tris: 1500, tex: 512 },     /* set anchor, keepsake, gate prize */
  mover:    { tris: 1200, tex: 512 },
  B:        { tris: 600,  tex: 256 },
  C:        { tris: 300,  tex: 128 },
  D:        { tris: 0,    tex: 0 }
};

/* expose the private state the manifest reads; the anchor must exist exactly once */
function inject(src) {
  const anchor = 'window.DB_DEV={';
  const at = src.indexOf(anchor);
  if (at < 0 || src.indexOf(anchor, at + 1) >= 0) throw new Error('manifest: DB_DEV anchor not unique, index.html restructured');
  return src.slice(0, at) +
    'window.__DWI=function(){return{INST:INST,MOVERS:MOVERS,WORLDS:WORLDS,PROPS:PROPS,PROP_ORDER:PROP_ORDER,W:W,GATES:GATES,kindGeo:kindGeo};};' +
    src.slice(at);
}

const D = H.boot({ seed: 12345, inject });
const win = D._win;
const I0 = win.__DWI();
const PROPS = I0.PROPS, ORDER = I0.PROP_ORDER, WORLDS = I0.WORLDS;
const WALL_KINDS = new Set();
const TOWN_KINDS = new Set();
WORLDS.forEach(w => {
  (w.walls || []).forEach(x => WALL_KINDS.add(x.k));
  (w.towns || []).forEach(t => (t.b || []).forEach(b => TOWN_KINDS.add(b)));
});
['crumbwall', 'blockwall', 'bookwall', 'hedgewall', 'stonewall', 'brickwall', 'cratewall', 'groyne', 'seawall']
  .forEach(k => { if (PROPS[k]) WALL_KINDS.add(k); });

/* geometry facts per kind: primitive triangles, bounding box, the colours that cover it */
const THREE = win.THREE;
const GEO = {};
for (const id of ORDER) {
  const g = I0.kindGeo(id);
  g.computeBoundingBox();
  const bb = g.boundingBox, sz = new THREE.Vector3(); bb.getSize(sz);
  const tris = g.attributes.position.count / 3;
  /* colour coverage by triangle area, so a big tablecloth outvotes a tiny button */
  const pos = g.attributes.position.array, col = g.attributes.color.array, cov = {};
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  for (let t = 0; t < tris; t++) {
    a.fromArray(pos, t * 9); b.fromArray(pos, t * 9 + 3); c.fromArray(pos, t * 9 + 6);
    const area = b.clone().sub(a).cross(c.clone().sub(a)).length() / 2;
    const hex = new THREE.Color(col[t * 9], col[t * 9 + 1], col[t * 9 + 2]).getHexString();
    cov[hex] = (cov[hex] || 0) + area;
  }
  const tot = Object.values(cov).reduce((s, v) => s + v, 0) || 1;
  const colours = Object.entries(cov).sort((x, y) => y[1] - x[1]).slice(0, 3)
    .map(([h, v]) => ({ hex: '#' + h, share: +(v / tot).toFixed(2) }));
  const ext = [sz.x, sz.y, sz.z], mx = Math.max(...ext), mn = Math.min(...ext);
  GEO[id] = { tris, size: ext.map(v => +v.toFixed(1)), flat: mx > 0 && mn / mx < 0.15, colours };
}

/* build every world and read what is really in it */
const perWorld = [];
for (let wi = 0; wi < WORLDS.length; wi++) {
  D.start('level', wi + 1);
  const S = win.__DWI(), W = S.W;
  const kinds = {};
  const add = (kid, size, extra) => {
    const k = kinds[kid] || (kinds[kid] = { n: 0, min: Infinity, max: 0, keep: 0, movers: 0 });
    k.n++; k.min = Math.min(k.min, size); k.max = Math.max(k.max, size);
    if (extra && extra.keep) k.keep++;
    if (extra && extra.mover) k.movers++;
  };
  S.INST.forEach(st => { for (let j = 0; j < st.n; j++) add(st.kid, st.size[j], { keep: !!st.keep[j] }); });
  S.MOVERS.forEach(m => add(m.kid, m.size, { mover: true }));
  /* the biggest edible kind behind each gate. A gate whose circle holds the spawn is a
     RING gate (concentric worlds: you live inside it and break out), so its loot is the
     band between it and the next ring; otherwise it is a point gate and its loot is inside. */
  const gates = (W.gates || []).map((g, gi) => ({ i: gi, x: g.x, z: g.z, r: g.r, need: g.need, label: g.label || '', ring: Math.hypot(g.x, g.z) < g.r }));
  const ringRs = gates.filter(g => g.ring).map(g => g.r).sort((p, q) => p - q);
  const prizeOf = gates.map(() => null);
  S.INST.forEach(st => {
    const kid = st.kid, p = PROPS[kid];
    if (WALL_KINDS.has(kid) || TOWN_KINDS.has(kid) || kid.indexOf('lm') === 0 || /^k[A-Z]/.test(kid)) return;
    for (let j = 0; j < st.n; j++) {
      gates.forEach((g, gi) => {
        let inside;
        if (g.ring) {
          const d = Math.hypot(st.x[j] - g.x, st.z[j] - g.z);
          const next = ringRs.find(r => r > g.r);
          inside = d > g.r && (next === undefined || d < next);
        } else inside = Math.hypot(st.x[j] - g.x, st.z[j] - g.z) < g.r;
        if (!inside) return;
        const cand = { kid, size: st.size[j] };
        if (!prizeOf[gi] || p.s > PROPS[prizeOf[gi].kid].s) prizeOf[gi] = cand;
      });
    }
  });
  gates.forEach((g, gi) => { g.prize = prizeOf[gi] ? prizeOf[gi].kid : null; });
  /* the anchor of each hand placed scene: its biggest item that is not a wall */
  const anchors = (W.sets || []).map(se => {
    let best = null;
    se.items.forEach(it => {
      if (WALL_KINDS.has(it[0]) || !PROPS[it[0]]) return;
      const s = PROPS[it[0]].s * (it[4] || 1);
      if (!best || s > best.s) best = { kid: it[0], s };
    });
    return best && best.kid;
  }).filter(Boolean);
  perWorld.push({ id: W.id, nm: W.nm, zen: !!W.zen, startD: W.startD, goalD: W.goalD, kinds, gates, anchors });
}

/* roll up per kind across worlds */
const ROLE_RANK = { landmark: 0, mover: 1, keepsake: 2, 'gate prize': 3, 'set anchor': 4 };
const TIER_RANK = { A: 0, B: 1, C: 2, D: 3 };
const rows = {};
const used = new Set();
for (const w of perWorld) {
  const gp = new Set(w.gates.map(g => g.prize).filter(Boolean));
  const an = new Set(w.anchors);
  for (const kid of Object.keys(w.kinds)) {
    used.add(kid);
    const k = w.kinds[kid], p = PROPS[kid];
    const r = rows[kid] || (rows[kid] = { id: kid, nm: p.nm, s: p.s, fixed: !!p.fixed, roles: new Set(), worlds: [], inst: 0, tier: 'D', why: [] });
    r.worlds.push({ w: w.id, n: k.n, min: +k.min.toFixed(1), max: +k.max.toFixed(1), goal: w.goalD, start: w.startD });
    r.inst += k.n;
    if (kid.indexOf('lm') === 0 && p.fixed) r.roles.add('landmark');
    if (p.mover) r.roles.add('mover');
    if (k.keep) r.roles.add('keepsake');
    if (gp.has(kid)) r.roles.add('gate prize');
    if (an.has(kid)) r.roles.add('set anchor');
    if (WALL_KINDS.has(kid)) r.roles.add('wall');
    if (TOWN_KINDS.has(kid)) r.roles.add('building');
    /* size tier in THIS world, from its biggest placed instance. Dream Meadow (zen) has
       no goal (goalD 0), so every kind in it passed "a third of the goal" and a 1.6 cm
       crumb came out as big food: zen lends roles, never a size tier, except to a kind
       that lives only there (then C, the honest middle). */
    if (w.zen) { r.zenOnly = r.zenOnly !== false; continue; }
    r.zenOnly = false;
    const t = k.max >= w.goalD / 3 ? 'B' : (k.max >= w.startD / 10 ? 'C' : 'D');
    if (TIER_RANK[t] < TIER_RANK[r.tier]) r.tier = t;
  }
}
const list = Object.values(rows).map(r => {
  if (r.zenOnly) r.tier = 'C';
  const roles = [...r.roles];
  const aRole = roles.filter(x => x in ROLE_RANK).sort((x, y) => ROLE_RANK[x] - ROLE_RANK[y])[0];
  const tier = aRole ? 'A' : r.tier;
  const budget = tier === 'A' ? (aRole === 'landmark' ? BUDGET.landmark : aRole === 'mover' ? BUDGET.mover : BUDGET.anchor) : BUDGET[tier];
  const first = PLAY_ORDER.find(id => r.worlds.some(x => x.w === id));
  /* what a player sees most: the share of the goal it stands at, times how often it is
     met (log of instances, so 700 crumbs do not outvote one cathedral) */
  const seen = Math.max(...r.worlds.map(x => x.max / x.goal)) * (1 + Math.log10(1 + r.inst));
  return {
    id: r.id, name: r.nm, sizeCm: r.s, tier, role: aRole || (roles.includes('wall') ? 'wall' : roles.includes('building') ? 'building' : 'food'),
    roles, firstWorld: first, worlds: r.worlds, instances: r.inst,
    primTris: GEO[r.id].tris, bbox: GEO[r.id].size, flat: GEO[r.id].flat, colours: GEO[r.id].colours,
    budgetTris: budget.tris, budgetTex: budget.tex, credits: tier === 'A' || tier === 'B' ? CREDITS_PER_KIND : 0,
    nearTrisWorst: budget.tris * r.inst, visibility: +seen.toFixed(3)
  };
});
/* spend order = the plan's phases: world by world in play order (a shared kind goes with
   the first world that uses it), inside a world tier A then B, then role, then what a
   player sees most */
list.sort((x, y) => PLAY_ORDER.indexOf(x.firstWorld) - PLAY_ORDER.indexOf(y.firstWorld) ||
  TIER_RANK[x.tier] - TIER_RANK[y.tier] ||
  (ROLE_RANK[x.role] ?? 9) - (ROLE_RANK[y.role] ?? 9) || y.visibility - x.visibility || x.id.localeCompare(y.id));
list.forEach((r, i) => { r.order = i + 1; });

const declared = ORDER.length, usedN = used.size;
const unused = ORDER.filter(id => !used.has(id));
const tierTotals = {};
for (const t of ['A', 'B', 'C', 'D']) {
  const xs = list.filter(r => r.tier === t);
  tierTotals[t] = { kinds: xs.length, credits: xs.reduce((s, r) => s + r.credits, 0), instances: xs.reduce((s, r) => s + r.instances, 0) };
}
const roleTotals = {};
list.filter(r => r.tier === 'A').forEach(r => { roleTotals[r.role] = (roleTotals[r.role] || 0) + 1; });
const worldTotals = PLAY_ORDER.map(id => {
  const w = perWorld.find(x => x.id === id);
  const firsts = list.filter(r => r.firstWorld === id);
  return {
    id, name: w.nm, kinds: Object.keys(w.kinds).length, instances: Object.values(w.kinds).reduce((s, k) => s + k.n, 0),
    newA: firsts.filter(r => r.tier === 'A').length, newB: firsts.filter(r => r.tier === 'B').length,
    credits: firsts.reduce((s, r) => s + r.credits, 0), gates: w.gates.map(g => ({ label: g.label, need: g.need, ring: g.ring, prize: g.prize }))
  };
});
const balance = process.env.FORGE_BALANCE ? +process.env.FORGE_BALANCE : null;
let run = 0, fits = 0;
for (const r of list) { if (!r.credits) continue; run += r.credits; if (balance !== null && run <= balance) fits++; }

const json = {
  generatedFrom: 'satellites/dewball/index.html via node_harness.js (seed 12345)',
  declaredKinds: declared, usedKinds: usedN, unusedKinds: unused,
  creditsPerKind: CREDITS_PER_KIND, budgets: BUDGET,
  tiers: tierTotals, tierARoles: roleTotals, worlds: worldTotals,
  totalCreditsAB: tierTotals.A.credits + tierTotals.B.credits,
  balanceAtWrite: balance, kindsThatFitBalance: balance === null ? null : fits,
  kinds: list
};

/* ---- the human file ---- */
const L = [];
L.push('# DEWBALL MESHY MANIFEST');
L.push('');
L.push('Generated by `node satellites/dewball/tools/forge/manifest.mjs` from the real engine (`node_harness.js` builds every');
L.push('world at seed 12345). Do not edit by hand; rerun the tool. `--check` fails when this file is stale.');
L.push('');
L.push('## Totals');
L.push('');
L.push(`- Kinds declared with \`K()\`: **${declared}**. Kinds placed in at least one world: **${usedN}**. Never placed: ${unused.length}${unused.length ? ' (' + unused.join(', ') + ')' : ''}.`);
L.push(`- Credits per kind: ${CREDITS_PER_KIND} (plan 4.2, including one re roll in four). Tiers A and B together: **${json.totalCreditsAB} credits** for ${tierTotals.A.kinds + tierTotals.B.kinds} kinds.`);
if (balance !== null) L.push(`- Balance when written: **${balance}** credits, enough for the first **${fits}** kinds in spend order (the order column).`);
L.push('');
L.push('| tier | kinds | instances placed | credits |');
L.push('|---|---|---|---|');
for (const t of ['A', 'B', 'C', 'D']) L.push(`| ${t} | ${tierTotals[t].kinds} | ${tierTotals[t].instances} | ${tierTotals[t].credits} |`);
L.push('');
L.push('Tier A by role (a kind with two roles counts once, under its first): ' + Object.entries(roleTotals).map(([k, v]) => `${k} ${v}`).join(', ') + '.');
L.push('');
L.push('## Per world (a shared kind is credited to the first world in play order that uses it)');
L.push('');
L.push('| world | kinds placed | instances | new tier A | new tier B | credits | gate prizes |');
L.push('|---|---|---|---|---|---|---|');
for (const w of worldTotals) L.push(`| ${w.id} ${w.name} | ${w.kinds} | ${w.instances} | ${w.newA} | ${w.newB} | ${w.credits} | ${w.gates.map(g => (g.label || 'gate') + ' ' + g.need + (g.ring ? ' (ring)' : '') + ': ' + (g.prize || 'none')).join('; ') || 'none'} |`);
L.push('');
L.push('## Every kind, in spend order');
L.push('');
L.push('Size is the catalogue size in cm (the ladder law: the fitted mesh matches it exactly). Worlds lists `world:instances`.');
L.push('Flat means the thinnest bounding axis is under 15% of the longest: Meshy inflates these.');
L.push('');
L.push('| order | id | name | cm | tier | role | worlds | instances | prim tris | budget tris | tex | flat | credits |');
L.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const r of list) {
  L.push(`| ${r.order} | \`${r.id}\` | ${r.name} | ${r.sizeCm} | ${r.tier} | ${r.roles.join(', ') || r.role} | ${r.worlds.map(x => x.w + ':' + x.n).join(' ')} | ${r.instances} | ${r.primTris} | ${r.budgetTris || ''} | ${r.budgetTex || ''} | ${r.flat ? 'flat' : ''} | ${r.credits || ''} |`);
}
L.push('');
const md = L.join('\n') + '\n';
const jsonText = JSON.stringify(json, null, 1) + '\n';

const mdPath = path.join(GAME, 'MESHY-MANIFEST.md'), jsonPath = path.join(HERE, 'manifest.json');
if (process.argv.includes('--check')) {
  /* the balance line changes with the account, not with the code: compare without it */
  const strip = s => s.replace(/- Balance when written:.*\n/, '').replace(/"balanceAtWrite": .*\n/, '').replace(/"kindsThatFitBalance": .*\n/, '');
  const okMd = fs.existsSync(mdPath) && strip(fs.readFileSync(mdPath, 'utf8')) === strip(md);
  const okJs = fs.existsSync(jsonPath) && strip(fs.readFileSync(jsonPath, 'utf8')) === strip(jsonText);
  console.log(okMd && okJs ? 'MANIFEST_FRESH' : 'MANIFEST_STALE (rerun node satellites/dewball/tools/forge/manifest.mjs)');
  process.exit(okMd && okJs ? 0 : 1);
}
fs.writeFileSync(mdPath, md);
fs.writeFileSync(jsonPath, jsonText);
console.log(`declared ${declared}, placed ${usedN}, unused ${unused.length}`);
for (const t of ['A', 'B', 'C', 'D']) console.log(`tier ${t}: ${tierTotals[t].kinds} kinds, ${tierTotals[t].instances} instances, ${tierTotals[t].credits} credits`);
console.log('tier A roles: ' + JSON.stringify(roleTotals));
console.log('A+B credits: ' + json.totalCreditsAB + (balance !== null ? `; balance ${balance} covers the first ${fits} kinds` : ''));
for (const w of worldTotals) console.log(`${w.id}: kinds ${w.kinds}, inst ${w.instances}, newA ${w.newA}, newB ${w.newB}, credits ${w.credits}`);
