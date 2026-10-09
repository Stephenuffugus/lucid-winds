// Dewball PICKUP FEEL test (Astra A1): the fly in, the squash and the plink are RENDER ONLY.
// Run: node anim_test.js [--plant]
// The same scripted run (w1, a slow circle through the spawn litter, 600 frames) twice:
// once with the animation on, once with reduced motion (animation off). Size and absorb
// count must match at every checkpoint, and the animation must really have run (flying
// meshes seen, the ball root squashed) or the comparison proves nothing.
// --plant leaks a sliver of volume inside the squash: the two runs must then differ.
var H = require('./node_harness.js');
var plant = process.argv.indexOf('--plant') > 1;
function run(reduce){
  var D = H.boot({ seed: 12345, inject: function(src){
    src = src.replace('window.DB_DEV={', 'window.__R=function(){return R;};window.__ball=function(){return ballRoot;};window.DB_DEV={');
    if (plant) { var a = 'ballRoot.position.y=r*(1-0.03*q);';
      if (src.indexOf(a) < 0) throw new Error('plant anchor missing');
      src = src.replace(a, a + ' if(q>0) R.vol*=1.0000004;'); }
    return src; } });
  D.save().reduceMotion = reduce;
  D.start('level', 1);
  var marks = [], flew = 0, squashed = 0;
  for (var f = 0; f < 600; f++){
    var a = f * 0.02; D.roll(Math.cos(a), Math.sin(a)); D.step(0.016);
    var R = D._win.__R(); if (R.fly && R.fly.length) flew++;
    if (D._win.__ball().scale.y < 0.999) squashed++;
    if (f % 30 === 29) marks.push({ f: f, D: R.D, abs: R.absorbs });
  }
  return { marks: marks, flew: flew, squashed: squashed, errs: D._errs || [] };
}
var on = run(false), off = run(true), fails = [];
if (on.flew < 5 || on.squashed < 5) fails.push('the animation never ran (fly frames ' + on.flew + ', squash frames ' + on.squashed + '): this test would prove nothing');
if (off.flew || off.squashed) fails.push('reduced motion still animated (fly ' + off.flew + ', squash ' + off.squashed + ')');
for (var i = 0; i < on.marks.length; i++){
  var a = on.marks[i], b = off.marks[i];
  if (a.D !== b.D || a.abs !== b.abs){ fails.push('frame ' + a.f + ': size ' + a.D + ' with the animation, ' + b.D + ' without (absorbs ' + a.abs + ' vs ' + b.abs + ')'); break; }
}
if (on.errs.length || off.errs.length) fails.push('page errors: ' + on.errs.concat(off.errs).join(' | '));
if (fails.length){ console.log('ANIM_FAIL ' + fails.length + '\n  ' + fails.join('\n  ')); process.exit(1); }
var last = on.marks[on.marks.length - 1];
console.log('ANIM_PASS identical with the animation on and off over 600 frames (' + last.abs + ' absorbs, ' + last.D.toFixed(3) + ' cm; fly frames ' + on.flew + ', squash frames ' + on.squashed + ')');
