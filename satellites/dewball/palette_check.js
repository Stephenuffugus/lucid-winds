// Dewball PALETTE CHECK: does any prop wear the colour of the ground it sits on?
// (The "pale on pale" scar, three times, and the plan's w1 fault: "a ladybug on a red
// square is a dot".) Run: node palette_check.js [w1] [--max 12]
//
// For every kind PLACED in the world, its two biggest colours by surface area (read from
// the engine's own merged geometry, never retyped) are compared against the world's ground
// colours, rim and fog, in CIE Lab (delta E 2000 would be finer; CIE76 is plenty to find a
// red ladybug on a red check). A pair under the threshold is a clash. The report lists the
// clashes worst first and a count. It is a measure, not a gate: the look decides.
var H = require('./node_harness.js');
var wid = process.argv[2] && process.argv[2].indexOf('w') === 0 ? process.argv[2] : 'w1';
var MAX = +(process.argv[process.argv.indexOf('--max') + 1]) || 12;
var D = H.boot({ seed: 12345, inject: function(src){
  return src.replace('window.DB_DEV={', 'window.__P=function(){return{PROPS:PROPS,WORLDS:WORLDS,kindGeo:kindGeo,INST:INST,MOVERS:MOVERS};};window.DB_DEV={'); } });
var w = D.worlds().filter(function(x){ return x.id === wid; })[0];
D.start('level', w.n);
var P = D._win.__P(), THREE = D._win.THREE, W = P.WORLDS[w.n - 1];
function lab(hex){
  var c = new THREE.Color(hex), r = c.r, g = c.g, b = c.b;   /* the colour as written (sRGB), like the vertex colours */
  function lin(u){ return u <= 0.04045 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4); }
  r = lin(r); g = lin(g); b = lin(b);
  var X = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047, Y = r * 0.2126 + g * 0.7152 + b * 0.0722, Z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  function f(t){ return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116; }
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
}
function dE(a, b){ var x = lab(a), y = lab(b); return Math.sqrt((x[0] - y[0]) * (x[0] - y[0]) + (x[1] - y[1]) * (x[1] - y[1]) + (x[2] - y[2]) * (x[2] - y[2])); }
var grounds = [];
/* --c1 #hex --c2 #hex: try a palette without editing the game */
function argv(k){ var i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; }
var c1 = argv('--c1') || (W.ground && W.ground.c1), c2 = argv('--c2') || (W.ground && W.ground.c2);
if (c1) grounds.push(['ground c1', c1]);
if (c2) grounds.push(['ground c2', c2]);
if (W.rim !== undefined) grounds.push(['rim', W.rim]);
if (W.fog && W.fog.c !== undefined) grounds.push(['fog', W.fog.c]);
var kinds = {};
P.INST.forEach(function(st){ kinds[st.kid] = (kinds[st.kid] || 0) + st.n; });
P.MOVERS.forEach(function(m){ kinds[m.kid] = (kinds[m.kid] || 0) + 1; });
var clashes = [];
Object.keys(kinds).forEach(function(kid){
  var g = P.kindGeo(kid), pos = g.attributes.position.array, col = g.attributes.color.array, cov = {}, tot = 0;
  var a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  for (var t = 0; t < pos.length / 9; t++){
    a.fromArray(pos, t * 9); b.fromArray(pos, t * 9 + 3); c.fromArray(pos, t * 9 + 6);
    var ar = b.clone().sub(a).cross(c.clone().sub(a)).length() / 2;
    var hex = '#' + new THREE.Color(col[t * 9], col[t * 9 + 1], col[t * 9 + 2]).getHexString();
    cov[hex] = (cov[hex] || 0) + ar; tot += ar;
  }
  Object.keys(cov).sort(function(x, y){ return cov[y] - cov[x]; }).slice(0, 2).forEach(function(hex){
    var share = cov[hex] / (tot || 1);
    if (share < 0.15) return;
    grounds.forEach(function(gr){ var d = dE(hex, gr[1]);
      if (d < MAX) clashes.push({ kid: kid, nm: P.PROPS[kid].nm, n: kinds[kid], colour: hex, share: +share.toFixed(2), against: gr[0], ground: typeof gr[1] === 'number' ? '#' + new THREE.Color(gr[1]).getHexString() : gr[1], dE: +d.toFixed(1) }); });
  });
});
clashes.sort(function(x, y){ return x.dE - y.dE; });
clashes.forEach(function(c){ console.log('CLASH dE ' + c.dE.toFixed(1).padStart(5) + '  ' + c.nm + ' (' + c.kid + ', x' + c.n + ') ' + c.colour + ' ' + Math.round(c.share * 100) + '% of it, against ' + c.against + ' ' + c.ground); });
console.log('PALETTE ' + wid + ': ground ' + grounds.map(function(g){ return g[0] + ' ' + (typeof g[1] === 'number' ? '#' + new THREE.Color(g[1]).getHexString() : g[1]); }).join(', ') + ' | ' + Object.keys(kinds).length + ' kinds | ' + clashes.length + ' clashes under dE ' + MAX + ' (' + clashes.reduce(function(s, c){ return s + c.n; }, 0) + ' placed instances)');
