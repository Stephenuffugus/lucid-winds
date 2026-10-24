# Part E4 (bosses, SS04) as one patch over the E2+E3 page. Usage: python3 -I patch_e4.py [target.html]
import sys
p=sys.argv[1] if len(sys.argv)>1 else '/workspaces/lucid-winds/satellites/slice-3d/index.html'
s=open(p,encoding='utf-8').read()
def rep(old,new,cnt=1):
    global s
    n=s.count(old)
    if n!=cnt: sys.exit('expected %d, found %d: %r'%(cnt,n,old[:100]))
    s=s.replace(old,new)
B=r'''/* =====================================================================
   BOSSES (Part E4, 2026-10-24: SS04)
   Each world's last numbered dive (levels 5, 10, 15 ...) ends in a chamber built BELOW the shaft it always had (the shaft
   above is the very same: its pieces, its rng() draws, its Clean Slice line). The world's boss hangs over the chamber in
   one of three lanes; a net spans the chamber below it. While the boss stands, the net throws any landing straight back up
   (no chip, the knife's angle kept, its drift damped), high enough to come down past the boss again: a return route, never
   a softlock. A hit is a blade facing contact, once per contact, never undone by a bounce; after each hit the boss hops to
   the lane beside (middle, a side, the middle), and the net's lob carries the knife there: what the player brings is a
   blade that stays down (the lob keeps the knife's angle; a handle down knife bounces off the boss and lobs again). Three hits: Astra's three stages (its own cell 1 with a drawn crack, cell 2, then cell
   3, the reveal, held), one reward, and the net drops to the floor. A rope down the right side drops the net if cut, and the
   net gives way by itself after three lobs without a hit: either way the dive goes on to the floor and Clean Slice is
   forfeited. The chamber's walls are padded (a blade there bounces, never sticks), so a boss fight, a skip or a bounce off
   the floor is never lost to a wall. The ropes hang above the boss, where only a lob reaches them. The boss is optional: never in Clean Slice's count.
   ===================================================================== */
var BOSS_H=36, BOSS_ON=true;   /* the chamber's height under the old floor; BOSS_ON: dev switch (_S3.bossOff builds without) */
var BOSS_LANES=[0,-4.8,4.8], BOSS_R=2.3, BOSS_LOBS=3;   /* lanes 4.8 apart: a lob straight up misses, one tap toward the next lane lands (e4 tune.js) */
var BOSS_NAME={ mossy_canyon:'Crown Gourd', frost_chasm:'Sir Shivers', ember_kiln:'Chef Char', glowcave:'Disco Dragon', orchard_loft:'Mayor Mac',
  lantern_night:'Lord Lumen', deep_tide:'Count Coconut', clockwork_well:'Tick Tock Pom' };
var BOSS_COL={ mossy_canyon:0xe8902a, frost_chasm:0xc8f0b0, ember_kiln:0xf2c84a, glowcave:0xc056d8, orchard_loft:0xd8302a, lantern_night:0xff8a2a, deep_tide:0x8a5a3a, clockwork_well:0xb82a3a };
var _crackTex=null;
function bossCrack(){ if(_crackTex)return _crackTex; var cv=document.createElement('canvas'); cv.width=cv.height=128; var g=cv.getContext('2d');
  g.strokeStyle='rgba(20,10,6,0.85)'; g.lineWidth=5; g.lineCap='round'; g.beginPath();
  g.moveTo(64,10); g.lineTo(56,40); g.lineTo(70,62); g.lineTo(58,92); g.lineTo(66,120); g.moveTo(56,40); g.lineTo(32,52); g.moveTo(70,62); g.lineTo(98,70); g.stroke();
  return (_crackTex=new THREE.CanvasTexture(cv)); }
/* the chamber: boss, net and rope, its own stream for the lanes (the dive's rng() is never touched) */
function bossChamber(ws, SW, floorY, lvl){
  var b={ id:ws.id, name:BOSS_NAME[ws.id]||'The boss', x:0, tx:0, y:floorY+22, r:BOSS_R, hits:0, inside:false, lobs:0, netOn:true, cleared:false, skipped:false,
    netY:floorY+6, ropes:[-(SW-2.2), SW-2.2], ropeTop:floorY+30, ropeBot:floorY+23, ropeCut:false, revealT:-1, hop:0, rng:mulberry32((((lvl*2654435761)>>>0)^G_FFSALT^0xB055)>>>0) };
  var g=new THREE.Group(); g.position.set(0, b.y, 0.6); addMesh(g); b.grp=g;
  b.code=new THREE.Mesh(new THREE.SphereGeometry(b.r,16,12), new THREE.MeshLambertMaterial({color:BOSS_COL[ws.id]||0xe8902a, emissive:0x1a1006})); g.add(b.code);
  b.sp=new THREE.Sprite(new THREE.SpriteMaterial({color:0xffffff, transparent:true, depthWrite:false, opacity:0})); b.sp.scale.set(6.4,6.4,1); g.add(b.sp);
  b.crack=new THREE.Sprite(new THREE.SpriteMaterial({map:bossCrack(), transparent:true, depthWrite:false, opacity:0})); b.crack.scale.set(4.2,4.2,1); b.crack.position.z=0.2; g.add(b.crack);
  /* Astra's stages strip: cell 1 is the whole boss (and boss.webp itself), cell 2 cracked, cell 3 the reveal. Each cell is
     drawn inset 3 percent each side: the cells carry slivers of their neighbours at their edges */
  artJson(function(j){ var A=j.worlds[ws.id], P=A&&A.props&&A.props.stages; if(!P)return;
    artTex(P.file, function(t){ if(!b.grp.parent)return; var tx=t.clone(); tx.needsUpdate=true; b.cells=P.cells||3; b.tex=tx; b.sp.material.map=tx; b.sp.material.needsUpdate=true;
      bossCell(b); b.sp.material.opacity=1; b.code.visible=false; artUp(t); }); });
  /* the net: an open lattice of cords across the chamber (the first cut, a solid bar, read as a white plank) */
  var nm=new THREE.MeshLambertMaterial({color:0xc8a878, emissive:0x2a1e10}); b.net=[];
  for(var k=-7;k<=7;k++){ var cord=addMesh(new THREE.Mesh(new THREE.BoxGeometry(0.09,0.09,3.4), nm)); cord.position.set(k*1.2,b.netY,0); b.net.push(cord); }
  for(var kz=-1;kz<=1;kz++){ var rail=addMesh(new THREE.Mesh(new THREE.BoxGeometry(SW*2,0.09,0.09), nm)); rail.position.set(0,b.netY+0.02,kz*1.6); b.net.push(rail); }
  /* a rope down each side, with a gold tag: cut either to drop the net (one is always within a tap of every lane) */
  var rm=new THREE.MeshLambertMaterial({color:0xc8a878, emissive:0x2a1e10}), tm=new THREE.MeshLambertMaterial({color:0xffd76a, emissive:0x8a6000}); b.ropeM=[];
  for(var ri=0;ri<b.ropes.length;ri++){ var rp=addMesh(new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.2,b.ropeTop-b.ropeBot,8), rm)); rp.position.set(b.ropes[ri],(b.ropeTop+b.ropeBot)/2,0.4);
    var tg=addMesh(new THREE.Mesh(new THREE.BoxGeometry(1.1,1.4,0.3), tm)); tg.position.set(b.ropes[ri],(b.ropeTop+b.ropeBot)/2,0.7); b.ropeM.push(rp, tg); }
  return b;
}
function bossCell(b){ if(!b.tex)return; var c=b.hits>=3?2:(b.hits>=2?1:0), n=b.cells||3, ins=0.03;
  b.tex.repeat.set((1-2*ins)/n,1); b.tex.offset.set((c+ins)/n,0); b.crack.material.opacity=(b.hits===1)?0.9:0; }
function bossNetDrop(b){ b.netOn=false; for(var i=0;i<b.net.length;i++)looseMesh(b.net[i], (Math.random()*2-1)*2, -2, (Math.random()*2-1), 1.4); b.net=[]; }
/* one step of the chamber (Freefall): returns the knife's x, pushed out on a handle bonk */
function bossStep(b, nx, ny){
  var bX=-Math.cos(G.ang), bY=-Math.sin(G.ang);
  if(!b.cleared){
    var dx=nx-b.x, dy=ny-b.y, touch=G.vy<=0&&dx*dx+dy*dy<(b.r+KR)*(b.r+KR);   /* struck from above: a knife rising off the net passes */
    if(!touch)b.inside=false;
    else if(!b.inside){ b.inside=true;
      if((b.x-G.x)*bX+(b.y-G.y)*bY>0){ b.hits++; b.lobs=0; G.bossHits=b.hits;
        G.vx*=0.25; G.w*=0.3;   /* the cut bites: the knife drops to the net instead of sliding on into a wall */
        SFX.slab(Math.min(30,(G.combo||0)+4)); spawnSparks(b.x, b.y, BOSS_COL[b.id]||0xffd76a, 12); G.shake=Math.max(G.shake,0.3);
        if(b.hits>=3){ b.cleared=true; b.revealT=0; G.bossDown=true; var pts=600; G.score+=pts; $('h-score').textContent=G.score.toLocaleString();
          popup(b.name+' down +'+pts, b.x, b.y+4, '#ffd76a'); SFX.jackpot(); if(b.netOn)bossNetDrop(b); }
        else { popup('hit '+b.hits+' of 3', b.x, b.y+3.4, '#ffe9a8');
          b.tx=(b.tx===0)?(b.rng()<0.5?-4.8:4.8):0; b.hop=0; }   /* one lane over, never two: a lane two over is a turn the lob does not allow */
        bossCell(b);
      } else {   /* the handle: a bounce up off the boss (as off a bumper), never a hit, never a chip, never a shove at a wall */
        G.vy=9; G.vx=G.vx*0.3+((dx<0)?-1.5:1.5); G.w*=0.5; SFX.wood(); G.combo=0; var ce=$('h-combo'); if(ce)ce.classList.remove('on');
      }
    }
  }
  if(b.netOn){
    /* the ropes: a blade facing one cuts it; the net drops and Clean Slice is forfeited */
    for(var ri=0;ri<b.ropes.length;ri++){ var rx=b.ropes[ri];
      if(Math.abs(nx-rx)<KR*0.7&&ny<b.ropeTop&&ny>b.ropeBot&&(rx-G.x)*bX>0.2){ b.ropeCut=true; b.skipped=true; G.cleanForfeit=true;
        G.vx=0; G.w*=0.2;   /* the cut bites: the knife drops to the floor instead of carrying on into the wall */
        for(var rj=0;rj<b.ropeM.length;rj++)looseMesh(b.ropeM[rj], (Math.random()*2-1), -3, 1, 1.2); b.ropeM=[];
        popup('net dropped', rx-Math.sign(rx), ny+2, '#c8bfa8'); SFX.wood(); bossNetDrop(b); return nx; } }
    /* the net: any landing goes straight back up, high enough to come down past the boss, its angle kept */
    if(ny-KR*0.6<=b.netY&&G.vy<0){
      b.lobs++;
      if(b.lobs>BOSS_LOBS){ b.skipped=true; G.cleanForfeit=true; popup('the net gives way', nx, b.netY+3, '#c8bfa8'); bossNetDrop(b); return nx; }
      /* the lob: up to 5 u over the boss, and across to its lane: the drag halves vx each second, so the drift by the time T
         the knife is back down at the boss is vx*(1-0.5^T)/ln2, solved for vx (the plan: lob it back so it comes down on it) */
      var gF=ffGrav(), rise=(b.y+5)-b.netY, v0=Math.sqrt(2*gF*rise), T=v0/gF+Math.sqrt(2*3/gF);
      G.vy=v0; G.vx=(b.tx-nx)*Math.LN2/(1-Math.pow(0.5,T)); G.y=b.netY+KR*0.6; spawnSparks(nx, b.netY, 0xe8dcc0, 5); SFX.spring();
      b.inside=false;
    }
  }
  return nx;
}
/* the drawn side, once a frame: the boss hops to its lane, the reveal holds then fades */
function bossDraw(dt){ var b=G&&G.world&&G.world.boss; if(!b||!b.grp)return;
  if(b.x!==b.tx){ var d=b.tx-b.x, st=Math.min(Math.abs(d), dt*9); b.x+=d>0?st:-st; b.hop+=dt; }
  b.grp.position.set(b.x, b.y+(b.x!==b.tx&&!SET.rm?Math.sin(Math.min(1,b.hop*2.5)*Math.PI)*1.2:0), 0.6);
  if(b.revealT>=0){ b.revealT+=dt; if(b.revealT>1.2){ var k=Math.max(0,1-(b.revealT-1.2)/0.8); b.sp.material.opacity=k; b.code.visible=false; if(k<=0&&b.grp.parent){ b.grp.parent.remove(b.grp); } } }
}
'''
rep("function buildFreefall(lvl){\n", B+"function buildFreefall(lvl){\n")
# the dive's length with the chamber, the shaft above built exactly as before
rep("""  var depth=170+Math.min(lvl,45)*26;            // much longer dives
  var floorY=-depth;""","""  var depth=170+Math.min(lvl,45)*26;            // much longer dives
  var segDepth=depth, boss=BOSS_ON&&lvl%5===0;   /* Part E4: a boss chamber under the old floor; the shaft above uses segDepth */
  if(boss)depth+=BOSS_H;
  var floorY=-depth;""")
rep("""    for(var wy=4;wy>-depth-2;wy-=9+rng()*6){""","""    for(var wy=4;wy>-segDepth-2;wy-=9+rng()*6){""")
rep("""  ffSegments(rng, lvl, SW, wsAt, -4, floorY+14, A, null, vk?{kind:vk, minY:-4-depth*0.2, done:false}:null);""",
    """  ffSegments(rng, lvl, SW, wsAt, -4, -segDepth+14, A, null, vk?{kind:vk, minY:-4-segDepth*0.2, done:false}:null);
  var BC=null;
  if(boss){ var crng=mulberry32((((lvl*40503)>>>0)^G_FFSALT^0xCA4B)>>>0);   /* the chamber's ledges, from its own stream */
    for(var cs=-1;cs<=1;cs+=2)for(var cy=-segDepth-6;cy>floorY+2;cy-=9+crng()*6){ var cl=addMesh(new THREE.Mesh(new THREE.BoxGeometry(1.6,0.8+crng()*1.4,10+crng()*2), WS.ledge)); cl.position.set(cs*(SW+0.4), cy, 0); boxUV(cl,3); }
    BC=bossChamber(WS, SW, floorY, lvl); }""")
rep("""  var bladeIntoWall = dir<0 ? (bladeX < -0.35) : (bladeX > 0.35);""","""  var bladeIntoWall = dir<0 ? (bladeX < -0.35) : (bladeX > 0.35);
  var bw=G.world.boss; if(bw&&y<bw.y+12)bladeIntoWall=false;   /* Part E4: the boss chamber's walls are padded */""")
rep("""verbs:A.verbs, clean:{M:clM, stacks:CL.length},""","""verbs:A.verbs, clean:{M:clM, stacks:CL.length}, boss:BC,""")
# the contact, after the verbs
rep("""      if(vbs){ for(ivb=0;ivb<vbs.length;ivb++){ if(!vbs[ivb].done)nx=verbStep(vbs[ivb], nx, ny); } }""",
    """      if(vbs){ for(ivb=0;ivb<vbs.length;ivb++){ if(!vbs[ivb].done)nx=verbStep(vbs[ivb], nx, ny); } }
      if(G.world.boss){ nx=bossStep(G.world.boss, nx, ny); if(G.world.boss.netOn&&G.vy>0&&ny<G.world.boss.netY+KR*0.6)ny=G.world.boss.netY+KR*0.6; }   /* Part E4 */""")
rep("""    findsDraw(dt);   /* Part E2 */""","""    findsDraw(dt);   /* Part E2 */
    bossDraw(dt);    /* Part E4 */""")
# Clean Slice forfeited by a skipped boss
rep("""  var n=G.cleanN||0, won=!!fin&&n>=C.M;
  $('go-clean-t').textContent=won?'Clean Slice':('Clean Slice '+n+' of '+C.M);""","""  var n=G.cleanN||0, won=!!fin&&n>=C.M&&!G.cleanForfeit;   /* Part E4: a skipped boss forfeits it */
  $('go-clean-t').textContent=won?'Clean Slice':('Clean Slice '+n+' of '+C.M+(G.cleanForfeit?', boss skipped':''));""")
# the end panel names the boss
rep("""  if(ff&&gbx)gbx.classList.add('on');   /* SS21/SS20: reaching a numbered dive's floor is conquering the pit */""",
    """  if(ff&&gbx)gbx.classList.add('on');   /* SS21/SS20: reaching a numbered dive's floor is conquering the pit */
  if(ff&&G.world.boss&&G.bossDown)$('go-lab').textContent+=' \\u00b7 '+G.world.boss.name+' down';   /* Part E4 */""")
# dev hooks
rep("""    /* Part E3: the Daily */""","""    /* Part E4: the boss chamber */
    boss:function(){ return G&&G.world?G.world.boss:null; }, bossOff:function(v){ BOSS_ON=!v; }, bossStep:function(){ return bossStep; },
    /* Part E3: the Daily */""")
open(p,'w',encoding='utf-8').write(s); print('E4 patch applied to', p)
