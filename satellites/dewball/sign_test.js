// Dewball GATE SIGN test (10 Oct 2026, the globe 2 Nov 2026): a ring gate's sign stands ON its fence, never in the
// sky over the spawn.
// Run: node sign_test.js [--plant] [--plant-globe]
// Before: every sign stood at its gate's centre, and a concentric world's rings are all centred on the start, so
// Toybox Peaks and Night Garden hung every sign over the ball (a third of the screen at 24 and 70 cm). For each world
// with gates: at the start, and again after the ball has moved, every closed gate's sign must sit on its own ring
// (distance from the gate centre within 1% of r), no higher than 2x its need, and its width at most 3.6x its need.
// The globe (w7) projects its signs through _gsPlaceMesh, so there the chart point and the height above the ground
// are read (sign.cx, sign.cz, sign.up); 2 Nov 2026 its signs still hung over the spawn ("13.0 m" across the screen).
// --plant puts the old planar centre placement back, --plant-globe the old globe one: each MUST then fail.
var H = require('./node_harness.js');
var plant = process.argv.indexOf('--plant') > 1;
var plantGlobe = process.argv.indexOf('--plant-globe') > 1;
var D = H.boot({ seed: 12345, inject: function(src){
  if (plant) {
    var a = 'gs.sign.sprite.position.set(spx,sneed*1.2+sw*0.12,spz);';
    if (src.indexOf(a) < 0) throw new Error('plant anchor missing');
    src = src.replace(a, 'gs.sign.sprite.position.set(gs.def.x,sneed*2.1,gs.def.z);');
  }
  if (plantGlobe) {
    var b = 'g.sCx=gpx; g.sCz=gpz; g.sUp=g.def.need*1.2+gsw*0.12;';
    if (src.indexOf(b) < 0) throw new Error('globe plant anchor missing');
    src = src.replace(b, 'gpx=g.def.x; gpz=g.def.z; g.sCx=gpx; g.sCz=gpz; g.sUp=g.def.need*2.1;');
  }
  return src; } });
var fails = [], checked = 0, globes = 0, worlds = D.worlds().filter(function(w){ return !w.zen; });
worlds.forEach(function(w){
  D.start('level', w.n);
  var g0 = D.state().gates || []; if (!g0.length) return;
  for (var pass = 0; pass < 2; pass++){
    if (pass === 1){ var g = g0[0]; D.setPos(g.x + g.r * 0.5, g.z + g.r * 0.3); }
    for (var f = 0; f < 5; f++){ D.roll(0.3, 0.2); D.step(0.016); }
    D.sync();   // the globe places its signs in globeSync, which a step does not run
    D.state().gates.forEach(function(gt, i){
      if (gt.open || !gt.sign) return;
      checked++;
      var s = gt.sign, sx = w.globe ? s.cx : s.x, sz = w.globe ? s.cz : s.z, sy = w.globe ? s.up : s.y;
      if (w.globe) globes++;
      if (typeof sx !== 'number' || typeof sy !== 'number') { fails.push(w.id + ' gate ' + i + ': no sign position to read'); return; }
      var d = Math.sqrt((sx - gt.x) * (sx - gt.x) + (sz - gt.z) * (sz - gt.z));
      if (Math.abs(d - gt.r) > gt.r * 0.01) fails.push(w.id + ' gate ' + i + (pass ? ' after moving' : ' at the start') + ': the sign is ' + Math.round(d) + ' from the centre, the fence is at ' + gt.r);
      if (sy > gt.need * 2) fails.push(w.id + ' gate ' + i + ': the sign stands at ' + Math.round(sy) + ', above 2x its need ' + gt.need);
      if (s.w > gt.need * 3.6 + 1e-6) fails.push(w.id + ' gate ' + i + ': the sign is ' + Math.round(s.w) + ' wide, over 3.6x its need');
    });
  }
});
if (!checked) fails.push('no gate sign was checked: this test would prove nothing');
if (!globes) fails.push('no globe gate sign was checked: the globe would go unproved');
if (fails.length){ console.log('SIGN_FAIL ' + fails.length + (plant || plantGlobe ? ' (plant)' : '') + '\n  ' + fails.slice(0, 12).join('\n  ')); process.exit(1); }
console.log('SIGN_PASS ' + checked + ' gate signs on their own fences (' + globes + ' on the globe), at the start and after moving, across ' + worlds.length + ' worlds');
