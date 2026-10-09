// Dewball MOVERS face where they go. Run: node mover_test.js [--plant]
// Every mover in every world: its geometry's long axis must be its travel axis (local +z,
// since stepMovers drives along (sin rot, cos rot) with rotation.y = rot), unless it is a
// kind that is wide on purpose (wings spread across the way it flies, a crab, a toad) or
// round. Measured from the kind's real geometry, not a table. --plant removes the turn
// table (MOVER_FWD), the state before 9 Oct, and MUST fail.
var H = require('./node_harness.js');
var plant = process.argv.indexOf('--plant') > 1;
var WIDE_ON_PURPOSE = { butterfly: 'wings across', mothZ: 'wings across', crabS: 'a crab', toadG: 'legs splay, head on +z' };
var D = H.boot({ seed: 12345, inject: function(src){
  src = src.replace('window.DB_DEV={', 'window.__M=function(){return{MOVERS:MOVERS,kindGeo:kindGeo};};window.DB_DEV={');
  if (plant) { var a = 'if(MOVER_FWD.hasOwnProperty(id)) k.geo.rotateY(MOVER_FWD[id]);'; if (src.indexOf(a) < 0) throw new Error('plant anchor'); src = src.replace(a, ''); }
  return src; } });
var seen = {}, fails = [];
D.worlds().forEach(function(w){
  D.start('level', w.n);
  var M = D._win.__M();
  M.MOVERS.forEach(function(m){
    if (seen[m.kid]) return; seen[m.kid] = 1;
    var g = M.kindGeo(m.kid); g.computeBoundingBox();
    var bx = g.boundingBox.max.x - g.boundingBox.min.x, bz = g.boundingBox.max.z - g.boundingBox.min.z;
    if (WIDE_ON_PURPOSE[m.kid]) return;
    if (bx > bz * 1.25) fails.push(m.kid + ' (' + w.id + ') is ' + bx.toFixed(1) + ' wide on x and ' + bz.toFixed(1) + ' long on z: it travels sideways');
  });
});
if (fails.length){ console.log('MOVER_FAIL ' + fails.length + '\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('MOVER_PASS ' + Object.keys(seen).length + ' mover kinds travel along their long axis (or are wide on purpose: ' + Object.keys(WIDE_ON_PURPOSE).join(', ') + ')');
