# The E2 review's fixes, over the E2 commit (index.html). Usage: python3 -I patch_e2fix.py [target]
import sys
p=sys.argv[1] if len(sys.argv)>1 else '/workspaces/lucid-winds/satellites/slice-3d/index.html'
s=open(p,encoding='utf-8').read()
def rep(old,new,cnt=1):
    global s
    n=s.count(old)
    if n!=cnt: sys.exit('expected %d, found %d: %r'%(cnt,n,old[:100]))
    s=s.replace(old,new)
# 1. a stack whose last slab is not above the floor is never on the line (the knife lands before it can be cut)
rep("""function cleanLine(A, SW){
  var P=clParts(A, SW), C=P.C, req=[], x0=0, y0=4, first=true, i, c, y1, room, need;
  for(i=0;i<C.length;i++){ c=C[i]; y1=c.top.y+2.075;   /* the knife meets a stack's first slab with its middle 2.075 above it */""",
"""function cleanLine(A, SW, floorY){
  var P=clParts(A, SW), C=P.C, req=[], x0=0, y0=4, first=true, i, c, y1, room, need;
  for(i=0;i<C.length;i++){ c=C[i]; y1=c.top.y+2.075;   /* the knife meets a stack's first slab with its middle 2.075 above it */
    if(floorY!=null&&c.last.y+0.575<=floorY)continue;   /* its last slab under the floor: the knife lands before it (the review's find) */""")
rep("""  var CL=cleanLine(A, SW), clM=0, ci, cj;""","""  var CL=cleanLine(A, SW, floorY), clM=0, ci, cj;""")
rep("""cleanLine:function(){ return G&&G.world?cleanLine(G.world, G.world.SW):[]; },""","""cleanLine:function(){ return G&&G.world?cleanLine(G.world, G.world.SW, G.world.floorY):[]; },""")
# 2. eviction every time a run starts, not once a session: the dedupe is per call
rep("""  var n=0, id, s, L, i, t, p;""","""  var n=0, id, s, L, i, t, p, stamp={};   /* one call's own mark: a texture shared by two materials goes once (the first cut marked it for good) */""")
rep("""    for(i=0;i<L.length;i++){ t=L[i]&&L[i].map; if(t&&t.userData&&t.userData.ok&&t.userData.gpu!==s){ t.dispose(); t.userData.gpu=s; n++; } } }""",
    """    for(i=0;i<L.length;i++){ t=L[i]&&L[i].map; if(t&&t.userData&&t.userData.ok&&t.userData.gpu!==stamp){ t.dispose(); t.userData.gpu=stamp; n++; } } }""")
# 3 + 4. the dex: own properties checked safely; another tab's finds joined before a find is told
rep("""(function(){ for(var k in DEX)if(DEX.hasOwnProperty(k)&&!(FIND[k]&&DEX[k]===1))delete DEX[k]; })();   /* only known finds, as 1 */
function saveDex(){ var d=readObj('s3d_dex'), k; if(d)for(k in d)if(d.hasOwnProperty(k)&&FIND[k]&&d[k]===1)DEX[k]=1; LS.s('s3d_dex', JSON.stringify(DEX)); }   /* a set: joined with the other tab's */""",
"""var OWN=Object.prototype.hasOwnProperty;   /* a save holding {"hasOwnProperty":1} must not throw (the review's find) */
(function(){ for(var k in DEX)if(OWN.call(DEX,k)&&!(OWN.call(FIND,k)&&DEX[k]===1))delete DEX[k]; })();   /* only known finds, as 1 */
function joinDex(){ var d=readObj('s3d_dex'), k; if(d)for(k in d)if(OWN.call(d,k)&&OWN.call(FIND,k)&&d[k]===1)DEX[k]=1; }   /* a set: the other tab's finds join */
function saveDex(){ joinDex(); LS.s('s3d_dex', JSON.stringify(DEX)); }""")
rep("""  if(G.found&&FIND[G.found]&&DEX[G.found]!==1){""","""  joinDex();   /* another tab may have found it since this one booted: told once across tabs */
  if(G.found&&OWN.call(FIND,G.found)&&DEX[G.found]!==1){""")
# 5. the line lens: a wasp where the knife will be when it gets there (the fall from the start nearly fixes the time a knife
#    passes a height), and a gourd's real reach (the fruit sweep adds 0.6)
rep("""  for(i=0;i<A.items.length;i++){ s=A.items[i]; if(s.boom)B.push({x0:s.x-s.r-K, x1:s.x+s.r+K, y0:s.y-s.r-K, y1:s.y+s.r+K}); }""",
"""  for(i=0;i<A.items.length;i++){ s=A.items[i]; if(s.boom)B.push({x0:s.x-s.r-K-0.6, x1:s.x+s.r+K+0.6, y0:s.y-s.r-K-0.6, y1:s.y+s.r+K+0.6}); }   /* the fruit sweep reaches r+KR+0.6 */
  /* a wasp patrols, but a knife falling from the start passes its height at a time the fall all but fixes (gravity to the
     terminal speed): where the wasp will be then, give or take a tenth of a second of its patrol, closes a line stack's
     entry (the review: a stack a wasp crosses as every knife arrives). Kept apart (W): it is checked at an entry only */
  for(i=0;i<A.wasps.length;i++){ s=A.wasps[i]; var fd=Math.max(0,4-s.y), vt=FF_TERM, ga=GRAV_FF, da=vt*vt/(2*ga), tw=fd<=da?Math.sqrt(2*fd/ga):vt/ga+(fd-da)/vt;
    var wx=s.cx+Math.sin(tw*s.speed+s.phase)*s.range, sl=s.range*s.speed*0.1+0.4; Wb.push({x0:wx-s.r-K-sl, x1:wx+s.r+K+sl, y0:s.y-s.r-K, y1:s.y+s.r+K}); }""")
# the wasps are checked at a stack's entry only (the last 8 u above it, where the knife has no choice of x); elsewhere the
# player dodges them, as the proof's controller did
rep("""  var cols=[], byStk=[], i, j, s, B=[], K=KR, C=[];""","""  var cols=[], byStk=[], i, j, s, B=[], Wb=[], K=KR, C=[];""")
rep("""  return {C:C, B:B};
}""","""  return {C:C, B:B, W:Wb};
}""")
rep("""    if(need>=0&&clClear(P.B, x0, first?4:y0+2.075, c.x, y1, need)){ req.push(c); x0=c.x; y0=c.last.y; first=false; } }""",
    """    if(need>=0&&clClear(P.B, x0, first?4:y0+2.075, c.x, y1, need)&&!clHit(P.W, c.x-0.6, c.x+0.6, y1-1, y1+8)){ req.push(c); x0=c.x; y0=c.last.y; first=false; } }""")
open(p,'w',encoding='utf-8').write(s); print('E2 fixes applied to', p)
