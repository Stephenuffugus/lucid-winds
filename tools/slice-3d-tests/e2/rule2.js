// a looser corridor for the proof to judge: only the column's own entry (the last 8 u above it) must be clear, and some
// height must leave the sideways move's box clear; the straight falls are the player's to steer round
module.exports=function(W){ W.vm.runInContext(
"function clClear(B, x0, y0, x1, y1, need){\n"+
"  var d=Math.abs(x1-x0), ms=0.6, m=1.6+0.4*d, xa=Math.min(x0,x1)-m, xb=Math.max(x0,x1)+m, ym, top=Math.min(y0, y1+8);\n"+
"  if(clHit(B, x1-ms, x1+ms, y1-1, top))return false;\n"+
"  if(d<=0.8)return true;\n"+
"  for(ym=y1; ym+need<=y0+1e-9; ym+=2){ if(!clHit(B, xa, xb, ym-1, ym+need+1))return true; }\n"+
"  return false;\n"+
"}\n", W.ctx); };
