// Harness: pull the REAL contact functions out of index.html and run them in a vm with stubs.
// The freefall step below is a line-for-line copy of stepWorld's ff branch (walls, pads, slabs, verbs, G.x/G.y).
var fs=require('fs'), vm=require('vm');
var SRC=fs.readFileSync('/workspaces/lucid-winds/satellites/slice-3d/index.html','utf8');
function grab(name){
  var i=SRC.indexOf('function '+name+'(');
  if(i<0)throw new Error('no '+name);
  var j=SRC.indexOf('{',i), d=0, k=j;
  for(;k<SRC.length;k++){ var c=SRC[k]; if(c==='{')d++; else if(c==='}'){ d--; if(d===0)break; } }
  return SRC.slice(i,k+1);
}
var names=['kReachX','ffWall','ffPad','verbStep','iceStage','cutLoaf','cutTube','ropeY','cutRope','verbCut','verbAward','verbLog'];
var ctx={ Math:Math, console:console,
  GRAV_FF:21, FF_TERM:19, FF_STEER:30, FF_SPIN:17, FF_MAXW:7.5, KR:1.5, KLEN:5.70*0.55, KHH:1.3*0.55,
  SFX:new Proxy({},{get:function(t,k){ return function(){ ctx.sfx[k]=(ctx.sfx[k]||0)+1; }; }}), sfx:{},
  spawnSparks:function(){}, popup:function(){}, fatalMark:function(){}, spawnChunk:function(){}, looseMesh:function(){},
  fxBurst:function(){}, crackTex:function(){ return null; }, PULSES:[], artLoaded:function(){ return false; },
  addMesh:function(m){ return m; },
  THREE:{ Mesh:function(){ this.position={set:function(){}}; }, PlaneGeometry:function(){}, MeshBasicMaterial:function(){} },
  $:function(){ return {classList:{add:function(){},remove:function(){}}, style:{}, textContent:'', appendChild:function(){}}; },
  document:{ createElement:function(){ return {}; } },
  G:null, WOOD:0, CRYSTAL:0, vmats:function(){ return {}; }
};
vm.createContext(ctx);
for(var n=0;n<names.length;n++)vm.runInContext(grab(names[n]), ctx);
// sanity: the source we copied the step from
var stepSrc=grab('stepWorld');
['G.vy -= ((G.world.ws&&G.world.ws.id===\'deep_tide\')?DEEP_TIDE_GRAV:GRAV_FF)*dt; if(G.vy < -term) G.vy = -term;',
 'G.w *= Math.pow(0.1,dt);','G.vx *= Math.pow(0.5,dt);',
 'if(nx-rchW<-SW){ nx=-SW+rchW; if(!(G.wallCd>0)){ G.wallCd=0.22; ffWall(nx,ny,-1); nx=G.x; } }',
 'if(pdx*pdx+pdy*pdy < (pd.r+KR)*(pd.r+KR)) ffPad(pd);',
 'if(vbs){ for(ivb=0;ivb<vbs.length;ivb++){ if(!vbs[ivb].done)nx=verbStep(vbs[ivb], nx, ny); } }'
].forEach(function(s){ if(stepSrc.indexOf(s)<0)throw new Error('step drift: '+s); });

vm.runInContext(
"function ffStep(dt){\n"+
"  G.px=G.x; G.py=G.y; G.pa=G.ang; G.t+=dt;\n"+
"  if(G.done)return;\n"+
"  var hd = G.holding ? (G.hold||G.lastSide||0) : 0;\n"+
"  var term = G.endless ? Math.min(30, FF_TERM + (G.depth||0)*0.012) : FF_TERM;\n"+
"  G.vy -= GRAV_FF*dt; if(G.vy < -term) G.vy = -term;\n"+
"  if(hd!==0){ G.vx += hd*FF_STEER*dt; G.w += hd*FF_SPIN*dt; if(G.w>FF_MAXW)G.w=FF_MAXW; if(G.w<-FF_MAXW)G.w=-FF_MAXW; }\n"+
"  else { G.w *= Math.pow(0.1,dt); }\n"+
"  G.vx *= Math.pow(0.5,dt);\n"+
"  G.ang += G.w*dt;\n"+
"  var nx=G.x+G.vx*dt, ny=G.y+G.vy*dt;\n"+
"  var SW=G.world.SW;\n"+
"  var rchW=kReachX(G.ang);\n"+
"  if(G.wallCd>0)G.wallCd-=dt;\n"+
"  if(nx-rchW<-SW){ nx=-SW+rchW; if(!(G.wallCd>0)){ G.wallCd=0.22; ffWall(nx,ny,-1); nx=G.x; } }\n"+
"  else if(nx+rchW>SW){ nx=SW-rchW; if(!(G.wallCd>0)){ G.wallCd=0.22; ffWall(nx,ny,1); nx=G.x; } }\n"+
"  var pds=G.world.pads, ip;\n"+
"  if(pds){ for(ip=0;ip<pds.length;ip++){ var pd=pds[ip]; var pdx=nx-pd.x, pdy=ny-pd.y; if(pdx*pdx+pdy*pdy < (pd.r+KR)*(pd.r+KR)) ffPad(pd); } }\n"+
"  var sls=G.world.slabs, isl;\n"+
"  if(sls){ for(isl=0;isl<sls.length;isl++){ var sl=sls[isl]; if(sl.cut)continue;\n"+
"    if(nx+KR>sl.x-sl.w/2 && nx-KR<sl.x+sl.w/2 && ny+KR>sl.y-sl.h/2 && ny-KR<sl.y+sl.h/2){\n"+
"      var bXs=-Math.cos(G.ang), bYs=-Math.sin(G.ang);\n"+
"      if((sl.x-G.x)*bXs+(sl.y-G.y)*bYs > 0){ sl.cut=true; G.slabCuts=(G.slabCuts||0)+1; G.combo=Math.min(G.combo+1,30); }\n"+
"      else { var pshs=(G.x<sl.x)?-1:1; nx=sl.x+pshs*(sl.w/2+KR); G.vx=pshs*Math.max(4.5,Math.abs(G.vx)); if(G.vy>-3)G.vy=-3; G.combo=0; G.slabBonks=(G.slabBonks||0)+1; G.lastBonkT=G.t; }\n"+
"    } } }\n"+
"  var vbs=G.world.verbs, ivb;\n"+
"  if(vbs){ for(ivb=0;ivb<vbs.length;ivb++){ if(!vbs[ivb].done)nx=verbStep(vbs[ivb], nx, ny); } }\n"+
"  G.x=nx; G.y=ny;\n"+
"}\n", ctx);
module.exports={ctx:ctx, SRC:SRC, grab:grab};
