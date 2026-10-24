// E1: the SHIPPED slab contact (harness2's drift-checked copy, variant 'live') must equal the 'clamp' model the sweep chose
// (a stack contact held open only by a bonk the wall clamp bit). Bonks, cuts, final x and stuck compared fall by fall.
var M=require('./stackwall.js'), run=M.run;
var N=0, diff=0, ex=null;
for(var sx=-5.7; sx<=5.7001; sx+=0.6) for(var kx=-8.4; kx<=8.4001; kx+=0.6) for(var a=0;a<360;a+=20){
  var o={n:10, sx:+sx.toFixed(2), kx:+kx.toFixed(2), ang:a*Math.PI/180};
  var A=run(Object.assign({v:'live'},o)), B=run(Object.assign({v:'clamp'},o)); N++;
  if(A.bonks!==B.bonks||A.cuts!==B.cuts||Math.abs(A.x-B.x)>1e-9||A.stuck!==B.stuck){ diff++; if(!ex)ex={o:o,live:A,stack:B}; }
}
console.log('live vs clamp model:', N, 'falls,', diff, 'differ', ex?JSON.stringify(ex):'');
console.log('plan case (stack 5.7, handle down knife 8.3):', JSON.stringify(run({v:'live', n:10, sx:5.7, kx:8.3, ang:-Math.PI/2})));
