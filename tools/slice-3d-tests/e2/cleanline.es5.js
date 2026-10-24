/* ---------- Part E2 (SS23): Clean Slice. A numbered dive names its REQUIRED stacks when it is built: the stacks (columns of
   two or more slabs; a gate's slabs and the world's verb never count) on one line down the shaft that a player can carve
   one after the other. Top down: a stack joins the line when the knife can get from the last one on the line to it, blade
   down, in the room between them (the CL tables, measured with the game's own fall and a two hold program, then cut back
   for a thumb), and nothing in that corridor knocks it off course (a bumper, a crystal, thorns, a wasp's lane, a gourd, a
   the ice or the loaf). Every slab of a stack on the line is a target; Clean Slice is the floor
   reached with every target cut. Fruit, the golden fruit, the pinata and the verb are extras and never in the count. ---------- */
var CL_CARVE=[[4.8,1.0],[8,1.4],[20,1.75],[30,2.1],[40,3.8],[60,5.2],[90,7.0]];   /* [room, widest move] after a carve: the room is the fall
   from the last slab of one stack to the first of the next, measured slab middle to slab middle */
var CL_START=[[8,1.5,4],[18,1.5,5],[36,0,6],[54,-2,7],[66,-3.5,7.5]];   /* [fall from the start, nearest, farthest]: the knife starts flat with
   its blade to the left, so the first stack is easiest to the right (a right hold turns the blade down and moves right) */
/* the room a move needs (the first row of its table that allows it), or -1 when even the whole room is not enough */
function clNeed(room, dx, first){
  var T=first?CL_START:CL_CARVE, i, r;
  for(i=0;i<T.length;i++){ r=T[i]; if(r[0]>room)break;
    if(first?(dx>=r[1]&&dx<=r[2]):(Math.abs(dx)<=r[1]))return r[0]; }
  return -1;
}
/* is a box (grown by the knife's KR) anywhere in [xa,xb] x [ya,yb]? */
function clHit(B, xa, xb, ya, yb){ for(var i=0;i<B.length;i++){ var b=B[i]; if(b.y1>=ya&&b.y0<=yb&&b.x1>=xa&&b.x0<=xb)return true; } return false; }
/* can the knife get from (x0, y0) down to (x1, y1) without meeting anything that knocks it? It falls straight at x0, makes
   its move in `need` of the room at some height, then falls straight at x1: some height must leave all three clear */
function clClear(B, x0, y0, x1, y1, need){
  var d=Math.abs(x1-x0), ms=0.6, m=1.6+0.4*d, xa=Math.min(x0,x1)-m, xb=Math.max(x0,x1)+m, ym;
  if(d<=0.8)return !clHit(B, Math.min(x0,x1)-ms, Math.max(x0,x1)+ms, y1-1, y0+1);
  for(ym=y1; ym+need<=y0+1e-9; ym+=2){   /* the move ends at ym (from ym+need) */
    if(!clHit(B, x1-ms, x1+ms, y1-1, ym)&&!clHit(B, xa, xb, ym-1, ym+need+1)&&!clHit(B, x0-ms, x0+ms, ym+need, y0+1))return true; }
  return false;
}
/* the dive's stacks (columns of two or more slabs, top first) and everything that would knock a knife off a line */
function clParts(A, SW){
  var cols=[], byStk=[], i, j, s, B=[], K=1.5, C=[];
  for(i=0;i<A.slabs.length;i++){ s=A.slabs[i]; if(!s.stk)continue; j=byStk.indexOf(s.stk);
    if(j<0){ byStk.push(s.stk); cols.push([s]); } else cols[j].push(s); }
  for(i=0;i<cols.length;i++){ var a=cols[i]; a.sort(function(u,v){ return v.y-u.y; });
    if(a.length>=2)C.push({x:a[0].x, top:a[0], last:a[a.length-1], slabs:a, stk:a[0].stk});
    }   /* a gate's single slabs are not in the way: a blade down knife cuts through them */
  C.sort(function(a,b){ return b.top.y-a.top.y; });
  for(i=0;i<A.pads.length;i++){ s=A.pads[i]; B.push({x0:s.x-s.r-K, x1:s.x+s.r+K, y0:s.y-s.r-K, y1:s.y+s.r+K}); }
  for(i=0;i<A.crystals.length;i++){ s=A.crystals[i]; B.push({x0:s.x-1.1-K, x1:s.x+1.1+K, y0:s.y-K, y1:s.y+s.h+K}); }
  for(i=0;i<A.thorns.length;i++){ s=A.thorns[i]; B.push({x0:s.x-s.r-K, x1:s.x+s.r+K, y0:s.y-s.r-K, y1:s.y+s.r+K}); }
  for(i=0;i<A.items.length;i++){ s=A.items[i]; if(s.boom)B.push({x0:s.x-s.r-K, x1:s.x+s.r+K, y0:s.y-s.r-K, y1:s.y+s.r+K}); }
  /* a plank is cut by a blade down knife, like a gate's slab: not in the way */
  for(i=0;i<A.verbs.length;i++){ s=A.verbs[i]; if(s.kind!=='ice'&&s.kind!=='loaf')continue;   /* a chime tube or the lantern rope is cut by a blade down knife */
    var vx=(s.x!=null)?s.x:0, vw=(s.kind==='rope')?2*SW:((s.w||0.5)+0.6), vt=(s.kind==='tube')?s.top:(s.y+(s.h||1)/2), vb=(s.kind==='tube')?s.top-s.len:(s.y-(s.h||1)/2);
    B.push({x0:vx-vw/2-K, x1:vx+vw/2+K, y0:vb-K, y1:vt+K}); }
  return {C:C, B:B};
}
function cleanLine(A, SW){
  var P=clParts(A, SW), C=P.C, B=P.B.slice(), req=[], x0=0, y0=4, first=true, i, c, y1, room;
  for(i=0;i<C.length;i++){ c=C[i]; y1=c.top.y+2.075;
    room=first?(4-y1):(y0-c.top.y);   /* first: the fall from the start; then the last slab of one to the first of the next */
    var need=clNeed(room, c.x-x0, first);
    if(need>=0&&clClear(B, x0, first?4:y0+2.075, c.x, y1, need)){ req.push(c); x0=c.x; y0=c.last.y; first=false; }
  }
  return req;
}
