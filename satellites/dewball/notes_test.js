// Dewball: the ONE notification slot (Astra C8 + A11). Run: node notes_test.js [--plant]
// Asserts the rules the slot promises: a star cuts in on a fact; priority picks what
// shows next; a tip that waited too long is dropped, never shown late; facts show
// 2.2 s at most once every 8 s and only the newest waiting fact survives; a pause
// hides the slot and gives it back; a run end clears it; the real game emits its
// goal message through it. --plant inverts the priorities and MUST fail.
var H = require('./node_harness.js');
var plant = process.argv.indexOf('--plant') > 1;
var D = H.boot({ seed: 12345, inject: plant ? function(src){
  var a = 'var NOTE_PRI={star:5,keep:4,gate:3,tip:2,fact:1};';
  if (src.indexOf(a) < 0) throw new Error('plant anchor missing');
  return src.replace(a, 'var NOTE_PRI={star:1,keep:2,gate:3,tip:4,fact:5};'); } : null });
var fails = [];
function ok(c, msg){ if (!c) fails.push(msg); }
function run(sec){ var n = Math.round(sec / 0.05); for (var i = 0; i < n; i++) D.step(0.05); }
D.start('level', 1);
D.roll(0, 0);
// 1. a fact shows, then a star cuts in on it
D.notify('💡 Fact one.', 'fact'); run(0.1);
ok(D.notes().cur && D.notes().cur.kind === 'fact', '1a fact did not show first: ' + JSON.stringify(D.notes().cur));
D.notify('★ Star.', 'star');
ok(D.notes().cur && D.notes().cur.kind === 'star', '1b a star did not cut in on a fact: ' + JSON.stringify(D.notes().cur));
ok(D.notes().q.every(function(m){ return m.kind !== 'fact'; }), '1c the cut fact came back');
// 2. priority picks the next: queue a tip and a gate behind the star, the gate goes first
D.notify('Tip.', 'tip'); D.notify('Gate.', 'gate');
run(3.8);
ok(D.notes().cur && D.notes().cur.kind === 'gate', '2a after the star the gate should show: ' + JSON.stringify(D.notes().cur));
// 3. the tip waited past its 4 s life behind the gate: dropped, never shown late
run(3.5);
ok(!D.notes().log.some(function(l){ return l.txt === 'Tip.'; }), '3a a stale tip was shown late');
// 4. facts: 2.2 s, then an 8 s gap, only the newest waiting fact kept
run(3);
D.notify('💡 Fact two.', 'fact'); run(0.1);
var f2 = D.notes().log.filter(function(l){ return l.txt === '💡 Fact two.'; })[0];
ok(f2, '4a fact two never showed');
D.notify('💡 Fact three.', 'fact'); D.notify('💡 Fact four.', 'fact');
run(2.3);
ok(!D.notes().cur || D.notes().cur.kind !== 'fact', '4b a fact followed a fact inside the gap');
run(8);
var log = D.notes().log;
ok(!log.some(function(l){ return l.txt === '💡 Fact three.'; }), '4c an older waiting fact survived');
var f4 = log.filter(function(l){ return l.txt === '💡 Fact four.'; })[0];
ok(f4 && f2 && f4.t - f2.t >= 2.2 + 8 - 0.06, '4d facts closer than 2.2 + 8 s: ' + JSON.stringify([f2, f4]));
// 5. pause hides the slot, unpause gives the same message back
D.notify('★ Pause test.', 'star'); run(0.1);
ok(D.notes().shown, '5a not shown before pause');
D.pause(true);
ok(!D.notes().shown, '5b still shown while paused');
D.pause(false);
ok(D.notes().shown && D.notes().cur && D.notes().cur.txt === '★ Pause test.', '5c not back after pause');
// 6. a run end clears it
D.finish(); run(0.1);
ok(!D.notes().cur && !D.notes().q.length && !D.notes().shown, '6a the slot survived the end of the run');
// 7. the real goal message goes through the slot: grow w1 past its goal
D.start('level', 1); D.setD(30); D.roll(0, 0); run(0.2);
var stars = D.notes().log.filter(function(l){ return l.kind === 'star'; }), g = stars[stars.length - 1];
ok(g && g.txt === '★ Goal reached. Keep rolling for the next star.', '7a the goal message: ' + JSON.stringify(D.notes().log));
var errs = D._errs || [];
ok(!errs.length, 'page errors: ' + errs.join(' | '));
if (fails.length){ console.log('NOTES_FAIL ' + fails.length + '\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('NOTES_PASS ' + D.notes().log.length + ' messages logged');
