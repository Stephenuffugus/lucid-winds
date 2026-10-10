// Dewball GATE SIGN test (10 Oct 2026): a ring gate's sign stands ON its fence, never in the sky over the spawn.
// Run: node sign_test.js [--plant]
// Before: every sign stood at its gate's centre, and a concentric world's rings are all centred on the start, so
// Toybox Peaks and Night Garden hung every sign over the ball (a third of the screen at 24 and 70 cm). For each
// planar world with gates: at the start, and again after the ball has moved, every closed gate's sign must sit on
// its own ring (distance from the gate centre within 1% of r), no higher than 2x its need, and its width at most
// 3.6x its need. --plant puts the old centre placement back: this test MUST then fail.
var H = require('./node_harness.js');
var plant = process.argv.indexOf('--plant') > 1;
var D = H.boot({ seed: 12345, inject: function(src){
  if (!plant) return src;
  var a = 'gs.sign.sprite.position.set(spx,sneed*1.2+sw*0.12,spz);';
  if (src.indexOf(a) < 0) throw new Error('plant anchor missing');
  return src.replace(a, 'gs.sign.sprite.position.set(gs.def.x,sneed*2.1,gs.def.z);'); } });
// the globe (w7) projects its signs through _gsPlaceMesh and is left as it was; every planar world is checked
var fails = [], checked = 0, worlds = D.worlds().filter(function(w){ return !w.zen && !w.globe; });
worlds.forEach(function(w){
  D.start('level', w.n);
  var g0 = D.state().gates || []; if (!g0.length) return;
  for (var pass = 0; pass < 2; pass++){
    if (pass === 1){ var g = g0[0]; D.setPos(g.x + g.r * 0.5, g.z + g.r * 0.3); }
    for (var f = 0; f < 5; f++){ D.roll(0.3, 0.2); D.step(0.016); }
    D.state().gates.forEach(function(gt, i){
      if (gt.open || !gt.sign) return;
      checked++;
      var d = Math.sqrt((gt.sign.x - gt.x) * (gt.sign.x - gt.x) + (gt.sign.z - gt.z) * (gt.sign.z - gt.z));
      if (Math.abs(d - gt.r) > gt.r * 0.01) fails.push(w.id + ' gate ' + i + (pass ? ' after moving' : ' at the start') + ': the sign is ' + Math.round(d) + ' from the centre, the fence is at ' + gt.r);
      if (gt.sign.y > gt.need * 2) fails.push(w.id + ' gate ' + i + ': the sign stands at ' + Math.round(gt.sign.y) + ', above 2x its need ' + gt.need);
      if (gt.sign.w > gt.need * 3.6 + 1e-6) fails.push(w.id + ' gate ' + i + ': the sign is ' + Math.round(gt.sign.w) + ' wide, over 3.6x its need');
    });
  }
});
if (!checked) fails.push('no gate sign was checked: this test would prove nothing');
if (fails.length){ console.log('SIGN_FAIL ' + fails.length + (plant ? ' (plant)' : '') + '\n  ' + fails.slice(0, 12).join('\n  ')); process.exit(1); }
console.log('SIGN_PASS ' + checked + ' gate signs on their own fences, at the start and after moving, across ' + worlds.length + ' worlds');
