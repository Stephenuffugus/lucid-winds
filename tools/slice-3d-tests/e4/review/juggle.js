// A knife between the boss and a wall: the boss at a side lane (after hit 1, or set there), the knife falling onto the
// boss's wall side at every angle, no input. Does it ever stay trapped (pops forever, the run never ends)?
var S = require('./sim.js');
function clearShaft(g) { var Wd = g.world; ['items', 'slabs', 'pads', 'crystals', 'thorns', 'wasps', 'planks', 'verbs', 'blocks'].forEach(function (k) { if (Wd[k]) Wd[k] = []; }); }
var lane = +(process.argv[2] || 4.8), out = { runs: 0, notDone: 0, maxPops: 0, maxT: 0, cleared: 0, rope: 0, giveway: 0 }, bad = [];
for (var x0 = -8.4; x0 <= 8.41; x0 += 0.6) for (var k = 0; k < 24; k++) for (var dy = 2; dy <= 8; dy += 3) {
  var a0 = k * Math.PI / 12;
  var r = S.run({ lvl: 5, seed: 77, maxN: 120 * 120, setup: function (g, b) { clearShaft(g); b.hits = 1; b.x = b.tx = lane; g.x = x0; g.y = b.y + dy; g.vy = -2; g.vx = 0; g.ang = a0; g.w = 0; } });
  out.runs++;
  if (!r.done) { out.notDone++; bad.push('x' + x0.toFixed(1) + ' a' + (a0 * 180 / Math.PI).toFixed(0) + ' dy' + dy + ' t' + r.t + ' pops ' + r.pops + ' ' + r.ev.slice(0, 8).join(' ')); }
  if (r.pops > out.maxPops) { out.maxPops = r.pops; out.maxPopsCase = 'x' + x0.toFixed(1) + ' a' + (a0 * 180 / Math.PI).toFixed(0) + ' dy' + dy + ' t' + r.t + ' ' + r.ev.join(' '); }
  if (r.t > out.maxT) out.maxT = r.t;
  if (r.cleared) out.cleared++; if (r.ropeCut) out.rope++; if (r.ev.indexOf('GIVEWAY') >= 0) out.giveway++;
}
console.log('lane', lane, JSON.stringify(out)); console.log(bad.slice(0, 20).join('\n'));
