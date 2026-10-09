// Dewball ELIGIBILITY test (Astra A2): a ring never says yes when the pickup says no.
// Run: node elig_test.js [--plant]
//  1. At many ball sizes and places in three worlds, every ring sits on something canEat()
//     accepts, no ring is on a crumb far below the limit, there are at most three, and they
//     are the three NEAREST such things (compared against the world's own object list).
//  2. End to end: drive the ball onto the first ringed thing and it is absorbed.
//  3. "Grow a little more": pressing into a slightly too big prop says it; pressing into a
//     far too big one does not.
// --plant loosens the rings' test by a quarter: a ring then lands on things the pickup
// refuses, and this MUST fail.
var H = require('./node_harness.js');
var plant = process.argv.indexOf('--plant') > 1;
var D = H.boot({ seed: 12345, inject: plant ? function(src){
  var a = 'var s=st.size[j]; if(s<floor||!canEat(s)) return;';
  if (src.indexOf(a) < 0) throw new Error('plant anchor missing');
  return src.replace(a, 'var s=st.size[j]; if(s<floor||!(s<=R.D*prRatio(R.D)*1.25)) return;'); } : null });
var fails = [], checked = 0;
function ok(c, m){ if (!c) fails.push(m); }
var WORLDS = D.worlds().filter(function(w){ return ['w1', 'w3', 'w7'].indexOf(w.id) >= 0; });
WORLDS.forEach(function(w){
  [1, 2.5, 6, 14].forEach(function(mult){
    D.start('level', w.n);
    var dsz = w.startD * mult, all = D.state().objects;
    /* park the ball at five spots taken from the world's own objects */
    for (var t = 0; t < 5; t++){
      var o = all[Math.floor((t + 1) * all.length / 7)];
      D.setD(dsz); D.setPos(o.x + dsz * 0.9, o.z);
      var e = D.elig(), st = D.state(), lim = e.lim, r3 = e.D * 3;
      checked += e.picks.length;
      ok(e.picks.length <= 3, w.id + ' more than three rings');
      e.picks.forEach(function(p){
        ok(D.canEat(p.s), w.id + ' D=' + dsz.toFixed(1) + ': ring on a ' + p.k + ' (' + p.s.toFixed(2) + ') the pickup refuses (limit ' + lim.toFixed(2) + ')');
        ok(p.s >= lim * e.floor - 1e-9, w.id + ' ring on a crumb far below the limit: ' + p.k);
        ok(p.d <= r3 + 1e-6, w.id + ' ring beyond three ball diameters');
      });
      /* nearest three: nothing eligible may be nearer than the farthest ring and left out */
      if (e.picks.length === 3 && !plant){
        var far = e.picks[2].d, bx = st.ballX, bz = st.ballY;
        var nearer = st.objects.filter(function(q){ var d = Math.hypot(q.x - bx, q.z - bz);
          return d < far - 1e-6 && q.s >= lim * e.floor && D.canEat(q.s); }).length;
        ok(nearer <= 3, w.id + ' ' + nearer + ' eligible things nearer than the third ring');
      }
    }
  });
});
/* 2. ring => pickup, end to end */
D.start('level', 1); D.setD(10); var objs = D.state().objects, hit = objs[Math.floor(objs.length / 3)];
D.setPos(hit.x + 12, hit.z);
var e2 = D.elig();
if (!plant) {
  ok(e2.picks.length > 0, '2 no rings at all near a w1 object at 10 cm');
  if (e2.picks.length){
    var tgt = e2.picks[0];
    D.setPos(tgt.x, tgt.z); D.roll(0, 0); D.step(0.016);
    var still = D.state().objects.some(function(q){ return Math.abs(q.x - tgt.x) < 1e-6 && Math.abs(q.z - tgt.z) < 1e-6 && Math.abs(q.s - tgt.s) < 1e-6; });
    ok(!still, '2 the first ringed thing (' + tgt.k + ') was NOT absorbed when the ball rolled onto it');
  }
}
/* 3. "Grow a little more": a slightly too big prop says it, a far too big one does not */
function pressInto(mult){
  D.start('level', 1); D.setD(8);
  var n0 = D.notes().log.length;     /* the log spans runs: judge only what THIS press said */
  var lim = D.elig().lim, cand = D.state().objects.filter(function(q){ return !q.m && q.s > lim * mult[0] && q.s < lim * mult[1]; });
  if (!cand.length) return null;
  var q = cand[0], gap = 8 / 2 * 0.95 + q.s * 0.45 + 0.5;
  D.setPos(q.x - gap, q.z); D.aimAt(q.x, q.z);
  /* test input is a WORLD direction (input.x = testIn.x, input.z = testIn.y), not camera
     relative: roll straight at the prop along +x */
  for (var i = 0; i < 40; i++){ D.roll(1, 0); D.step(0.016); }
  D.roll(0, 0);
  /* shown, showing, or waiting its turn behind a fact: any of them means it was said */
  var n = D.notes(), all = n.log.slice(n0).concat(n.q, n.cur ? [n.cur] : []);
  return all.some(function(l){ return /^Grow a little more to collect/.test(l.txt); });
}
if (!plant) {
  var near = pressInto([1.08, 1.5]), farOne = pressInto([2.2, 9]);
  ok(near === true, '3a pressing into a slightly too big prop did not say "Grow a little more" (' + near + ')');
  ok(farOne === false, '3b pressing into a far too big prop said "Grow a little more" (' + farOne + ')');
}
/* 4. the sparkle: grow past a nearby prop's size and a sparkle is born; stand still and none is */
if (!plant) {
  D.start('level', 1); D.setD(6); D.roll(0, 0);
  var lim0 = D.elig().lim, st4 = D.state();
  var q4 = st4.objects.filter(function(q){ return !q.m && q.s > lim0 * 1.02 && q.s < lim0 * 1.3; })[0];
  if (!q4) fails.push('4 no prop just above the limit anywhere in w1 to test the sparkle');
  else {
    D.setPos(q4.x - 6 * 2, q4.z);                          /* park beside it, two ball widths off */
    for (var k = 0; k < 20; k++) D.step(0.016);            /* settle: lastLim catches up */
    var s0 = D.elig().sparks;
    ok(s0 === 0, '4a sparkles with nothing newly collectable: ' + s0);
    D.setD(q4.s / D.elig().lim * 6 * 1.05);               /* now q4 is just collectable */
    D.step(0.016);
    ok(D.elig().sparks > 0, '4b no sparkle when a nearby ' + q4.k + ' became collectable');
  }
}
var errs = D._errs || [];
ok(!errs.length, 'page errors: ' + errs.join(' | '));
if (fails.length){ console.log('ELIG_FAIL ' + fails.length + '\n  ' + fails.slice(0, 12).join('\n  ')); process.exit(1); }
console.log('ELIG_PASS ' + checked + ' rings checked against canEat across ' + WORLDS.map(function(w){ return w.id; }).join(','));
