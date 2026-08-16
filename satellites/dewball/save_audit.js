/* Dewball save/load audit — does progress survive a reload, a garbage save, and
 * a second tab?
 *
 * 2026-08-16. Written because nothing in this folder had ever tested the save at
 * all: every instrument here measures worlds and pacing, and the one thing a
 * player actually loses is their stars. Runs in plain node through node_harness.js
 * (boot() gives each run its own localStorage, so a "reload" is a second boot
 * handed the first one's bytes).
 *
 * Run: node save_audit.js
 */
var H = require('./node_harness.js');

var fails = [], notes = [];
function check(name, ok, detail){
  if (ok) console.log('  ok    ' + name);
  else { console.log('  FAIL  ' + name + (detail ? '   ' + detail : '')); fails.push(name); }
}
/* boot with a pre-seeded localStorage, then read back what the game made of it */
function bootWith(raw){
  var D = H.boot({ seed: 12345 });
  var LS = D._win.localStorage;
  if (raw !== undefined) LS.setItem('dewball_save', raw);
  /* the game read localStorage at parse time, so reboot with the bytes in place */
  D = null;
  var D2 = H.boot({ seed: 12345, prefill: { dewball_save: raw } });
  return D2;
}

console.log('DEWBALL SAVE AUDIT\n');

/* ---- 1. a clean run persists, and a reload sees it ---------------------- */
console.log('1. does a finished run survive a reload');
var A = H.boot({ seed: 12345 });
A.start('level', 1);
A.absorbAll();                       /* straight to the ceiling: 3 stars, clean sweep */
var rec = A.endRun();
var bytes = A._win.localStorage.getItem('dewball_save');
check('endRun wrote a save', !!bytes);
check('stars recorded', rec && rec.stars === 3, JSON.stringify(rec && rec.stars));
var B = H.boot({ seed: 12345, prefill: { dewball_save: bytes } });
var bs = B.save();
check('reload restores stars', bs.worlds && bs.worlds.w1 && bs.worlds.w1.stars === 3,
      JSON.stringify(bs.worlds && bs.worlds.w1));
check('reload restores lifetimeAbsorbs', bs.lifetimeAbsorbs > 0, String(bs.lifetimeAbsorbs));
/* ⛔ absorbAll() cannot set R.clean — the crown is raised by the live sweep check
   in tick(), not by the debug hook — so asserting it after absorbAll would be
   testing the harness, not the game. Round-trip the field instead. */
var C = H.boot({ seed: 12345, prefill: { dewball_save:
  '{"v":2,"worlds":{"w1":{"stars":3,"bestD":300,"clean":1,"keeps":[]}}}' } });
check('clean sweep crown round-trips', C.save().worlds.w1.clean === 1);

/* ---- 2. corrupt saves must never brick the boot ------------------------- */
console.log('\n2. corrupt saves');
var CORRUPT = [
  ['truncated json',      '{"v":2,"worlds":{"w1":{"stars"'],
  ['not json at all',     'undefined'],
  ['empty string',        ''],
  ['a bare number',       '42'],
  ['a json array',        '[1,2,3]'],
  ['null',                'null'],
  ['worlds is a string',  '{"v":2,"worlds":"nope"}'],
  ['worlds is an array',  '{"v":2,"worlds":[1,2,3]}'],
  ['grove is a string',   '{"v":2,"grove":"nope"}'],
  ['grove is a number',   '{"v":2,"grove":7}'],
  ['skins is a number',   '{"v":2,"unlockedSkins":5}'],
  ['seen is a string',    '{"v":2,"seen":"x"}'],
  ['stars is a string',   '{"v":2,"worlds":{"w1":{"stars":"three"}}}'],
  ['bestD is NaN-ish',    '{"v":2,"worlds":{"w1":{"stars":1,"bestD":null}}}'],
  ['huge nesting',        '{"v":2,"worlds":{"w1":{"stars":1,"keeps":{"a":{"b":{}}}}}}'],
  ['v1 legacy save',      '{"levelsCleared":6,"skin":"moss"}']
];
CORRUPT.forEach(function(c){
  var D, err = null;
  try { D = H.boot({ seed: 12345, prefill: { dewball_save: c[1] } }); }
  catch(e){ err = e; }
  if (err){ check('boot survives ' + c[0], false, String(err.message).slice(0,90)); return; }
  /* booting is not enough — the run has to be playable and finishable */
  var err2 = null;
  try { D.start('level', 1); D.absorbAll(); D.endRun(); }
  catch(e){ err2 = e; }
  check('boot + play + endRun survives ' + c[0], !err2, err2 ? String(err2.message).slice(0,110) : '');
});

/* ---- 3. two tabs ------------------------------------------------------- */
/* House rule (feedback_localstorage_two_tabs_clobber): a save that is read once
   at boot and written wholesale loses whatever the other tab did in between.
   Counters must ADD, bests must MAX. */
console.log('\n3. two tabs open at once (counters ADD, bests MAX)');
var T1 = H.boot({ seed: 12345 });                 /* tab 1 loads an empty save */
var T2 = H.boot({ seed: 12345 });                 /* tab 2 loads the same empty save */
T1.start('level', 1); T1.absorbAll(); T1.endRun();
var afterT1 = T1._win.localStorage.getItem('dewball_save');
/* tab 2 now finishes a DIFFERENT world and writes */
T2._win.localStorage.setItem('dewball_save', afterT1);   /* same storage both tabs share */
T2.start('level', 2); T2.absorbAll(); T2.endRun();
var afterT2 = JSON.parse(T2._win.localStorage.getItem('dewball_save'));
var t1 = JSON.parse(afterT1);
check('tab 2 keeps tab 1 stars', !!(afterT2.worlds && afterT2.worlds.w1 && afterT2.worlds.w1.stars === 3),
      'w1 after tab2 wrote: ' + JSON.stringify(afterT2.worlds && afterT2.worlds.w1));
check('tab 2 adds to tab 1 lifetimeAbsorbs',
      afterT2.lifetimeAbsorbs >= t1.lifetimeAbsorbs,
      't1=' + t1.lifetimeAbsorbs + ' t2=' + afterT2.lifetimeAbsorbs);
check('grove keeps both runs', (afterT2.grove || []).length >= 2,
      'grove=' + JSON.stringify((afterT2.grove || []).map(function(g){ return g.w; })));

/* ---- 4. the sunbeam daily cap ledger ----------------------------------- */
console.log('\n4. sunbeam cap ledger (sw_sb_dewball)');
var S = H.boot({ seed: 12345 });
S._win.localStorage.setItem('sw_sb_dewball', 'not json');
var serr = null;
try { S.start('level', 1); S.absorbAll(); S.endRun(); } catch(e){ serr = e; }
check('corrupt sunbeam ledger does not break a run', !serr, serr ? String(serr.message) : '');

console.log('\n' + (fails.length ? ('SAVE_AUDIT_FAIL — ' + fails.length + ' problem(s)') : 'SAVE_AUDIT_PASS'));
notes.forEach(function(n){ console.log('note: ' + n); });
process.exit(fails.length ? 1 : 0);
