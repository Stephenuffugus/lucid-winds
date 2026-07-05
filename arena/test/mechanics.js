/* Targeted mechanic assertions for loot rarity (Phase 2a).
 * Locks the grade-scaling contract so future balance edits can't silently break it:
 * a higher-grade gem must strictly out-perform a lower one, and the combat clamps
 * (extraHits<=5, proc chance<=0.9) must survive stacked Cosmic gems.
 * Usage: node test/mechanics.js [path-to-html]
 */
const { loadGame } = require('./harness-core');
const API = loadGame();
let ok = true;
const assert = (name, cond, extra) => { console.log((cond ? '  ok  ' : ' FAIL ') + name + (extra ? '  ' + extra : '')); if (!cond) ok = false; };

function oc(augs) {
  return {
    id: 't', name: 'T', race: 'human', emoji: '🌀',
    baseStats: { str: 50, dur: 50, sta: 50, int: 50, spd: 50, cmb: 50 },
    powers: [{ key: 'energy_blast', effect: 'proc', tier: 'master', augments: augs }],
    tree: { allocated: ['hub'] }, level: 1, xp: 0, record: { w: 0, l: 0 }
  };
}
function blastProc(o) { const F = API.deriveCombat(o); return (F.procs || []).find(p => /Aether Blast/i.test(p.name)) || (F.procs || [])[0]; }

/* RARITY table sanity */
assert('RARITY has 7 grades common..cosmic', Array.isArray(API.RARITY) && API.RARITY.length === 7 && API.RARITY[0].key === 'common' && API.RARITY[6].key === 'cosmic');
assert('grade mult is monotonically increasing', API.RARITY.every((r, i) => i === 0 || r.mult >= API.RARITY[i - 1].mult));

/* Cosmic Multistrike strictly beats Common Multistrike */
const c = blastProc(oc([{ key: 'multistrike', grade: 'common' }]));
const x = blastProc(oc([{ key: 'multistrike', grade: 'cosmic' }]));
assert('common + cosmic blast procs both derive', !!c && !!x);
assert('cosmic adds more strikes than common', x.extraHits > c.extraHits, `common=${c.extraHits} cosmic=${x.extraHits}`);
assert('cosmic shrinks the multistrike drawback (localMore less negative)', x.localMore > c.localMore, `common=${c.localMore.toFixed(3)} cosmic=${x.localMore.toFixed(3)}`);

/* Amplify: pure-upside gem — cosmic localInc must exceed common */
const ac = blastProc(oc([{ key: 'amplify', grade: 'common' }]));
const ax = blastProc(oc([{ key: 'amplify', grade: 'cosmic' }]));
assert('cosmic amplify > common amplify (localInc)', ax.localInc > ac.localInc, `common=${ac.localInc.toFixed(3)} cosmic=${ax.localInc.toFixed(3)}`);

/* Clamps survive stacked Cosmic hit-gems */
const cap = blastProc(oc([{ key: 'multistrike', grade: 'cosmic' }, { key: 'echo', grade: 'cosmic' }, { key: 'faster', grade: 'cosmic' }]));
assert('extraHits stays clamped <=5 under stacked cosmic', cap.extraHits <= 5, `extraHits=${cap.extraHits}`);
assert('proc chance stays clamped <=0.9 under stacked cosmic', cap.chance <= 0.9, `chance=${cap.chance.toFixed(3)}`);

/* Every derived value is finite (no NaN leaking from scaling) */
assert('all derived proc numbers are finite', [cap.extraHits, cap.chance, cap.localInc, cap.localMore, cap.localCrit].every(Number.isFinite));

console.log(ok ? '\n✅ mechanics passed' : '\n✗ mechanics FAILED');
process.exit(ok ? 0 : 1);
