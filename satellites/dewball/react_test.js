// Dewball THE WORLD REACTS test (10 Oct 2026, Stephen: "The world doesn't react. Its very stiff."):
// a prop the ball runs into rocks on a damped spring, and a shoved prop turns, DRAWING ONLY.
// Run: node react_test.js [--plant]
// The same scripted run (w2 Toybox Peaks, a 30 cm ball parked beside 16 props it cannot eat and rolled into
// each) twice: once with the reactions on, once with reduced motion (reactions off). Size, absorb count
// and the ball's position must match at every checkpoint, and the reactions must really have run (kicks
// counted, props rocking) or the comparison proves nothing.
// --plant leaks the wobble into the world (each rocking prop slides a hair): the two runs must then differ.
var H = require('./node_harness.js');
var plant = process.argv.indexOf('--plant') > 1;
function run(reduce){
  var D = H.boot({ seed: 12345, inject: function(src){
    src = src.replace('window.DB_DEV={', 'window.__R=function(){return R;};window.DB_DEV={');
    if (plant) { var a = 'if(e.w){ st.rot[i]+=e.w*h;';
      if (src.indexOf(a) < 0) throw new Error('plant anchor missing');
      src = src.replace(a, 'st.x[i]+=e.px*0.02; ' + a); }
    return src; } });
  D.save().reduceMotion = reduce;
  D.start('level', 2);
  D.setD(30);
  // ram real obstacles: for each of the first props too big to eat (some shovable, some walls), park two
  // ball widths away and roll straight into it for 50 frames. The same list, in the same order, both runs.
  var objs = D.state().objects, d = D.size(), targets = [], marks = [], rocking = 0, f = 0;
  for (var k = 0; k < objs.length && targets.length < 16; k++){ var o = objs[k];
    if (!D.canEat(o.s) && o.s < d * 4 && !o.m) targets.push(o); }
  for (var t = 0; t < targets.length; t++){ var o2 = targets[t], ang = t * 2.399;
    D.setPos(o2.x + Math.cos(ang) * (d + o2.s), o2.z + Math.sin(ang) * (d + o2.s));
    for (var g = 0; g < 50; g++, f++){
      D.roll(-Math.cos(ang), -Math.sin(ang)); D.step(0.016);
      if (D.react().active) rocking++;
      if (f % 25 === 24){ var R = D._win.__R(); marks.push({ f: f, D: R.D, abs: R.absorbs, x: R.x, z: R.z }); } } }
  return { marks: marks, kicks: D.react().kicks, rocking: rocking, targets: targets.length, errs: D._errs || [] };
}
var on = run(false), off = run(true), fails = [];
if (on.kicks < 5 || on.rocking < 30) fails.push('the reactions never ran (kicks ' + on.kicks + ', rocking frames ' + on.rocking + '): this test would prove nothing');
if (off.kicks || off.rocking) fails.push('reduced motion still rocked props (kicks ' + off.kicks + ', rocking frames ' + off.rocking + ')');
for (var i = 0; i < on.marks.length; i++){
  var a = on.marks[i], b = off.marks[i];
  if (a.D !== b.D || a.abs !== b.abs || a.x !== b.x || a.z !== b.z){
    fails.push('frame ' + a.f + ': size ' + a.D + ' vs ' + b.D + ', absorbs ' + a.abs + ' vs ' + b.abs + ', ball ' + a.x.toFixed(5) + ',' + a.z.toFixed(5) + ' vs ' + b.x.toFixed(5) + ',' + b.z.toFixed(5));
    break; }
}
if (on.errs.length || off.errs.length) fails.push('page errors: ' + on.errs.concat(off.errs).join(' | '));
if (fails.length){ console.log('REACT_FAIL ' + fails.length + '\n  ' + fails.join('\n  ')); process.exit(1); }
var last = on.marks[on.marks.length - 1];
console.log('REACT_PASS identical with the reactions on and off over ' + on.marks.length * 25 + ' frames and ' + on.targets + ' props (' + last.abs + ' absorbs, ' + last.D.toFixed(3) + ' cm; kicks ' + on.kicks + ', rocking frames ' + on.rocking + ')');
